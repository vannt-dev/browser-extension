// The offline browser test kit: runs the features of a built Universal File Converter package
// (the dist/ folder or the release .zip) in a real Chrome that cannot resolve any host name, and
// fails if a feature breaks or anything tries to leave the package. See the README's section on
// the offline browser test kit.
//
//   npm run test:offline -- [dist-folder-or-zip] [--only=convert,png,text,ocr]
//                           [--cases=scan-g4.pdf,...] [--work=<dir>] [--verbose]
//
// --only runs some groups, --cases some files of the PDF -> PNG group, --work keeps the browser
// profile, downloads and console.log in a folder of your choice, --verbose logs all console output.
//
// CHROME=<path> picks the browser; otherwise a Playwright Chromium is looked for. Branded Google
// Chrome ignores --load-extension since version 137, so it has to be Chromium or Chrome for Testing.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { homedir, platform, tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import sharp from 'sharp';
import { launch, newPage, serviceWorker, sleep } from './cdp.mjs';
import { SCAN_PAGES, TEXT_DOC, docx, g4ScanPdf, picture, textPdf } from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const options = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [key, ...value] = a.slice(2).split('=');
      return [key, value.length ? value.join('=') : true];
    })
);
const target = resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'dist');
const groups = ['convert', 'png', 'text', 'ocr'];
const only = options.only ? String(options.only).split(',') : groups;
const say = (...parts) => console.log(...parts);

// ---------------------------------------------------------------- results
const failures = [];
let passed = 0;
function check(name, ok, detail = '') {
  say(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
  if (ok) passed++;
  else failures.push(name);
}

// ---------------------------------------------------------------- the browser
function findChrome() {
  if (process.env.CHROME) {
    if (!existsSync(process.env.CHROME))
      throw new Error(`CHROME=${process.env.CHROME} does not exist`);
    return process.env.CHROME;
  }
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'ms-playwright'),
    join(homedir(), '.cache', 'ms-playwright'),
    join(homedir(), 'Library', 'Caches', 'ms-playwright')
  ].filter((root) => root && existsSync(root));
  const executables =
    {
      win32: ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe'],
      linux: ['chrome-linux64/chrome', 'chrome-linux/chrome'],
      darwin: [
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium'
      ]
    }[platform()] ?? [];
  for (const root of roots) {
    const builds = readdirSync(root)
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const build of builds) {
      for (const exe of executables)
        if (existsSync(join(root, build, exe))) return join(root, build, exe);
    }
  }
  throw new Error(
    'no Chromium found: set CHROME=<path to chrome>, or run `npx playwright install chromium`'
  );
}

/** The folder to load: the folder given, or the .zip unpacked into the work folder. */
async function extensionFolder(work) {
  if (!existsSync(target)) throw new Error(`${target} does not exist (run npm run build first?)`);
  if (!target.toLowerCase().endsWith('.zip')) return target;
  const folder = join(work, 'extension');
  const zip = await JSZip.loadAsync(readFileSync(target));
  for (const entry of Object.values(zip.files)) {
    const out = resolve(folder, entry.name);
    if (!out.startsWith(folder + sep))
      throw new Error(`the zip has an entry outside its folder: ${entry.name}`);
    if (entry.dir) continue;
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, await entry.async('nodebuffer'));
  }
  return folder;
}

// ---------------------------------------------------------------- helpers
/** Share of dark pixels and of strongly red pixels in a picture. */
async function ink(bytes) {
  const { data, info } = await sharp(bytes)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let dark = 0;
  let red = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if ((r + g + b) / 3 < 128) dark++;
    if (r > 150 && g < 90 && b < 90) red++;
  }
  const n = info.width * info.height;
  return { width: info.width, height: info.height, dark: dark / n, red: red / n };
}
const percent = (share) => `${(share * 100).toFixed(2)}%`;

/** Puts a file into a page's <input type=file> and fires its change event. */
const putFile = (page, inputId, name, type, bytes) =>
  page.evaluate(`(() => {
    const bytes = Uint8Array.from(atob("${bytes.toString('base64')}"), (c) => c.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], ${JSON.stringify(name)}, { type: ${JSON.stringify(type)} }));
    const input = document.getElementById(${JSON.stringify(inputId)});
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);

/** Polls a page expression (JSON) until `done(state)` or the time is up; returns the last state. */
async function poll(page, expression, done, seconds) {
  let state = {};
  for (const end = Date.now() + seconds * 1000; Date.now() < end; ) {
    await sleep(250);
    state = JSON.parse(
      await page.evaluate(
        `JSON.stringify({ ...${expression}, visibility: document.visibilityState })`
      )
    );
    if (done(state)) return state;
  }
  return { ...state, timedOut: `after ${seconds} s` };
}

// ---------------------------------------------------------------- the run
const work = options.work
  ? resolve(String(options.work))
  : mkdtempSync(join(tmpdir(), 'ufc-offline-'));
mkdirSync(work, { recursive: true });
const downloads = join(work, 'downloads');
const consoleLog = [];
let browser;

try {
  const extension = await extensionFolder(work);
  const manifest = JSON.parse(readFileSync(join(extension, 'manifest.json'), 'utf8'));
  const chrome = findChrome();
  browser = await launch({
    chrome,
    extension,
    profile: join(work, 'profile'),
    downloads,
    extra: [
      // No host name resolves: whatever wanted a script, font or model from elsewhere fails.
      '--host-resolver-rules=MAP * ~NOTFOUND',
      '--disable-background-networking',
      '--disable-component-update',
      // A window covered by another one counts as hidden on Windows, which would throttle the
      // dashboard while it is meant to be in front. Background tabs are still background tabs.
      '--disable-backgrounding-occluded-windows',
      '--disable-features=CalculateNativeWinOcclusion',
      // GitHub's Ubuntu runners do not let Chromium set up its sandbox.
      ...(process.env.CI ? ['--no-sandbox'] : [])
    ]
  });
  say(`package  ${target}`);
  say(`browser  ${browser.product} (${chrome})`);
  say(`extension ${manifest.name} ${manifest.version}`);

  // Every request of every page and worker, and what they print.
  const requests = [];
  const kinds = new Map();
  browser.on((m) => {
    if (m.method === 'Target.attachedToTarget') {
      const { sessionId, targetInfo } = m.params;
      kinds.set(
        sessionId,
        `${targetInfo.type} ${targetInfo.url.replace(/^chrome-extension:\/\/[a-z]+/, 'ext:')}`
      );
      browser.send('Network.enable', {}, sessionId).catch(() => {});
      browser.send('Runtime.enable', {}, sessionId).catch(() => {});
      // The pages' own workers (pdf.js, tesseract) are attached as they start.
      browser
        .send(
          'Target.setAutoAttach',
          { autoAttach: true, waitForDebuggerOnStart: false, flatten: true },
          sessionId
        )
        .catch(() => {});
    }
    const from = kinds.get(m.sessionId) ?? '';
    if (m.method === 'Network.requestWillBeSent')
      requests.push({ from, url: m.params.request.url });
    if (m.method === 'Runtime.consoleAPICalled') {
      const text = m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ');
      if (options.verbose || ['error', 'warning'].includes(m.params.type)) {
        consoleLog.push(`${from} ${m.params.type}: ${text.slice(0, 300)}`);
      }
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      consoleLog.push(`${from} exception: ${(d.exception?.description ?? d.text).slice(0, 300)}`);
    }
  });

  const worker = await serviceWorker(browser, manifest.background.service_worker);
  const base = `chrome-extension://${worker.id}`;
  const dash = await newPage(browser, `${base}/${manifest.options_page}`);

  // Downloads arrive in the profile's download folder; each is taken once.
  const taken = new Set();
  async function nextDownload(seconds = 90) {
    for (const end = Date.now() + seconds * 1000; Date.now() < end; ) {
      const files = readdirSync(downloads);
      const fresh = files.filter((f) => !taken.has(f) && !/\.(crdownload|tmp)$/.test(f));
      if (fresh.length && !files.some((f) => f.endsWith('.crdownload'))) {
        await sleep(300);
        taken.add(fresh[0]);
        return { name: fresh[0], bytes: readFileSync(join(downloads, fresh[0])) };
      }
      await sleep(250);
    }
    return null;
  }

  /** Queues one file in the dashboard's converter and converts it to `format`. */
  async function dashConvert(name, type, bytes, format, seconds = 120) {
    await dash.evaluate(`document.getElementById("dash-clear-queue-btn")?.click()`);
    await putFile(dash, 'dash-file-input', name, type, bytes);
    await dash.evaluate(`(() => {
      const select = document.getElementById("dash-target-format");
      select.value = "${format}";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("dash-convert-btn").click();
    })()`);
    const state = await poll(
      dash,
      `{ busy: document.getElementById("dash-convert-btn").disabled,
         text: document.getElementById("dash-status-0")?.textContent.trim(),
         why: document.getElementById("dash-status-0")?.title }`,
      (s) => !s.busy,
      seconds
    );
    return { state, file: await nextDownload(state.timedOut ? 1 : 90) };
  }

  /** Runs OCR from the dashboard's AI Studio and waits for it to finish. */
  async function dashOcr(name, type, bytes, lang, output, seconds = 180) {
    await dash.evaluate(`document.querySelector('.menu-item[data-tab="ai-studio"]').click()`);
    await putFile(dash, 'ocr-file-input', name, type, bytes);
    await dash.evaluate(`(() => {
      document.getElementById("ocr-lang-select").value = "${lang}";
      document.getElementById("ocr-output-select").value = "${output}";
      document.getElementById("run-ocr-btn").click();
    })()`);
    return poll(
      dash,
      `{ busy: document.getElementById("run-ocr-btn").disabled,
         progress: document.getElementById("ocr-progress").textContent,
         text: document.getElementById("ocr-result-text").value }`,
      (s) => !s.busy,
      seconds
    );
  }

  const fixture = (name) => readFileSync(join(here, 'fixtures', name));
  const isPdf = (file) => Boolean(file) && file.bytes.subarray(0, 5).toString() === '%PDF-';
  const describe = (file) => (file ? `${file.name}, ${file.bytes.length} bytes` : 'no file');
  const textDoc = await textPdf(browser);
  const scan = await g4ScanPdf(dash);

  async function group(name, title, body) {
    if (!only.includes(name)) return;
    say(`\n${title}`);
    consoleLog.push(`--- ${name}`);
    try {
      // Every group starts with the dashboard as the active tab; a page in a background tab is
      // throttled by Chrome, which is a case of its own.
      await dash.front();
      await body();
    } catch (error) {
      check(`${name}: the steps ran to the end`, false, error.stack ?? String(error));
    }
  }

  // ---- jsPDF and mammoth
  await group('convert', '1. picture -> PDF and DOCX -> PDF (dashboard)', async () => {
    const png = await picture(dash, 900, 300, 'ctx.fillRect(100, 60, 400, 150);');
    let { state, file } = await dashConvert('shape.png', 'image/png', png, 'pdf');
    check('picture -> PDF ends as done', state.text === 'Done', JSON.stringify(state));
    check(
      'shape.pdf is a PDF with the picture in it',
      isPdf(file) && file.name === 'shape.pdf' && file.bytes.includes('/Subtype /Image'),
      describe(file)
    );

    const sentence = 'Hello from the offline kit docx';
    ({ state, file } = await dashConvert(
      'letter.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      await docx(sentence),
      'pdf'
    ));
    check('DOCX -> PDF ends as done', state.text === 'Done', JSON.stringify(state));
    check(
      'letter.pdf holds the sentence of the document',
      isPdf(file) && file.bytes.includes(`(${sentence}) Tj`),
      describe(file)
    );
  });

  // ---- pdf.js and its WebAssembly decoders
  await group('png', '2. PDF -> PNG (dashboard)', async () => {
    const cases = [
      {
        name: 'document.pdf',
        bytes: textDoc,
        what: 'printed by Chrome: fonts, figures',
        pages: 3,
        dark: 0.003,
        red: 0.002
      },
      { name: 'scan-g4.pdf', bytes: scan, what: 'scan, CCITT G4', pages: 2, dark: 0.01 },
      {
        name: 'ccitt_EndOfBlock_false.pdf',
        what: 'pdf.js test file, CCITT',
        pages: 1,
        dark: 0.001
      },
      { name: 'jbig2_symbol_offset.pdf', what: 'pdf.js test file, JBIG2', pages: 1, dark: 0.0005 },
      { name: 'jbig2_file_header.pdf', what: 'pdf.js test file, JBIG2', pages: 1, dark: 0.0005 },
      { name: 'bug_jpx.pdf', what: 'pdf.js test file, JPEG 2000', pages: 1, dark: 0.0005 },
      { name: 'jpx_numcomps.pdf', what: 'pdf.js test file, JPEG 2000', pages: 1, dark: 0.0005 }
    ];
    for (const c of cases.filter(
      (c) => !options.cases || String(options.cases).split(',').includes(c.name)
    )) {
      say(`  ${c.name} (${c.what})`);
      const { state, file } = await dashConvert(
        c.name,
        'application/pdf',
        c.bytes ?? fixture(c.name),
        'png'
      );
      let pictures = [];
      if (file?.name.endsWith('.png')) pictures = [file];
      if (file?.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file.bytes);
        const names = Object.keys(zip.files)
          .filter((n) => n.endsWith('.png'))
          .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
        pictures = await Promise.all(
          names.map(async (name) => ({ name, bytes: await zip.file(name).async('nodebuffer') }))
        );
      }
      check(`${c.name}: ends as done`, state.text === 'Done', JSON.stringify(state));
      check(
        `${c.name}: ${c.pages} page picture(s) saved`,
        pictures.length === c.pages,
        `${pictures.length}`
      );
      for (const p of pictures) {
        const m = await ink(p.bytes);
        check(
          `${p.name} has ink`,
          m.dark >= c.dark && (!c.red || m.red >= c.red),
          `${m.width}x${m.height}, dark ${percent(m.dark)}${c.red ? `, red ${percent(m.red)}` : ''}`
        );
      }
    }
  });

  // ---- pdf.js text in the popup
  await group('text', '3. PDF -> text (popup)', async () => {
    const popup = await newPage(browser, `${base}/${manifest.action.default_popup}`);
    await putFile(popup, 'file-input', 'document.pdf', 'application/pdf', textDoc);
    await sleep(300);
    await popup.evaluate(`(() => {
      const select = document.getElementById("target-format");
      select.value = "txt";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("convert-btn").click();
    })()`);
    const state = await poll(
      popup,
      `{ busy: document.getElementById("convert-btn").disabled, text: document.getElementById("status-0")?.textContent.trim() }`,
      (s) => !s.busy && s.text && s.text !== 'Converting...',
      60
    );
    const file = await nextDownload(state.timedOut ? 1 : 60);
    const text = file?.bytes.toString('utf8') ?? '';
    check('PDF -> text ends as done', /done/i.test(state.text ?? ''), JSON.stringify(state));
    check(
      'document.txt has the title, every page heading and page markers',
      [TEXT_DOC.title, ...TEXT_DOC.pages, `--- Page ${TEXT_DOC.pages.length} ---`].every((s) =>
        text.includes(s)
      ),
      file ? `${file.name}, ${text.length} chars` : 'no file'
    );
    await popup.close();
  });

  // ---- tesseract.js: worker, core and language data
  await group('ocr', '4. OCR (dashboard, AI Studio)', async () => {
    const words = await picture(
      dash,
      900,
      300,
      'ctx.font = "bold 64px Arial, Helvetica, sans-serif"; ctx.fillText("Hello World 2026", 40, 110); ctx.fillText("Xin chao Viet Nam", 40, 220);'
    );
    let state = await dashOcr('words.png', 'image/png', words, 'vie+eng', 'text');
    check(
      'a picture is read in Vietnamese + English',
      /Hello World 2026/.test(state.text ?? '') && /Viet Nam/.test(state.text ?? ''),
      JSON.stringify(state).slice(0, 300)
    );

    state = await dashOcr('scan-g4.pdf', 'application/pdf', scan, 'eng', 'pdf');
    check(
      'both pages of the CCITT scan are read',
      SCAN_PAGES.flat().every((line) => new RegExp(line, 'i').test(state.text ?? '')),
      JSON.stringify(state).slice(0, 300)
    );
    const file = await nextDownload(state.timedOut ? 1 : 60);
    check(
      'a searchable PDF is saved',
      isPdf(file) && file.name === 'scan-g4_searchable.pdf',
      describe(file)
    );
  });

  // ---- where everything went
  say('\nRequests seen, by where they went:');
  const where = (url) =>
    url.startsWith('chrome-extension://')
      ? 'the package itself'
      : /^(blob|data):/.test(url)
        ? url.split(':')[0] + ':'
        : new URL(url).origin;
  const tally = new Map();
  for (const { url } of requests) tally.set(where(url), (tally.get(where(url)) ?? 0) + 1);
  for (const [place, count] of tally) say(`  ${String(count).padStart(4)}  ${place}`);
  const outside = requests.filter(
    ({ url }) => !/^(chrome-extension|blob|data|about|chrome):/.test(url)
  );
  check(
    'no request left the package',
    outside.length === 0,
    outside.map((r) => `${r.from} -> ${r.url}`).join('; ')
  );
} catch (error) {
  check('the kit itself ran', false, error.stack ?? String(error));
} finally {
  await browser?.close();
  await sleep(500);
}

say(
  `\nErrors and warnings the pages printed:${consoleLog.some((l) => !l.startsWith('---')) ? '' : ' none'}`
);
for (const line of consoleLog) say('  ' + line);
writeFileSync(join(work, 'console.log'), consoleLog.join('\n'));
if (failures.length) {
  say(
    `\nFAILED ${failures.length} of ${failures.length + passed} checks:\n  - ${failures.join('\n  - ')}`
  );
  say(`work folder kept for a look: ${work}`);
} else {
  say(`\nPASSED all ${passed} checks`);
  if (!options.work) rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}
process.exit(failures.length ? 1 : 0);
