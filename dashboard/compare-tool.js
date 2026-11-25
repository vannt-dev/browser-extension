/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { t } from '../shared/i18n.js';
import { errorReason } from '../shared/error-text.js';
import { ZipEngine } from '../engine/zip-engine.js';
import { isPdfFile } from '../engine/file-types.js';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';
import { alignPages, compareTexts, listChanges, summarize } from '../engine/text-diff.js';
import { pixelDiff } from '../engine/pixel-diff.js';

/**
 * Compare two PDFs: the text of each pair of pages word by word, and a picture of a pair laid one
 * over the other. Nothing leaves the device. The text of every page is read and compared up front,
 * a page at a time with the page let breathe in between; pictures are drawn only for the page
 * shown.
 */

const loadPdfEngine = () => import('../engine/pdf-engine.js').then((m) => m.PdfEngine);

/** The largest picture of a page drawn for the visual comparison, in pixels. */
const PICTURE_WIDTH = 1000;
const PICTURE_HEIGHT = 1300;

const el = (id) => document.getElementById(id);
const SIDES = ['a', 'b'];

const cmp = {
  files: { a: null, b: null },
  docs: { a: null, b: null },
  pages: [],
  summary: null,
  changes: [],
  page: 0,
  change: -1,
  pictures: null,
  runToken: 0,
  drawToken: 0,
};

function setStatus(text) {
  el('compare-status').textContent = text;
}

/** Lets the page draw and take clicks between two pieces of work. */
const breathe = () => new Promise((done) => setTimeout(done, 0));

function closeDocs() {
  for (const side of SIDES) {
    cmp.docs[side]?.close()?.catch?.(() => {});
    cmp.docs[side] = null;
  }
}

function reset() {
  cmp.runToken++;
  cmp.drawToken++;
  closeDocs();
  Object.assign(cmp, { pages: [], summary: null, changes: [], page: 0, change: -1, pictures: null });
  el('compare-results').hidden = true;
  el('compare-results').dataset.state = 'none';
  el('run-compare-btn').disabled = !(cmp.files.a && cmp.files.b);
}

// ---------------------------------------------------------------- comparing

/** Opens one side's PDF; null (with the password field shown) when a password is needed or wrong. */
async function openSide(PdfEngine, side) {
  const file = cmp.files[side];
  try {
    return await PdfEngine.openPages(file, { password: el(`compare-password-${side}`).value });
  } catch (err) {
    if (err?.code === PDF_PASSWORD_NEEDED || err?.code === PDF_PASSWORD_WRONG) {
      el(`compare-password-${side}-group`).hidden = false;
      el(`compare-password-${side}`).focus();
      setStatus(err.code === PDF_PASSWORD_NEEDED ? t('comparePasswordNeeded', file.name) : errorReason(err, 'dashboard'));
      return null;
    }
    throw err;
  }
}

async function runCompare() {
  reset();
  const token = cmp.runToken;
  const stale = () => token !== cmp.runToken;
  for (const side of SIDES) {
    if (!isPdfFile(cmp.files[side])) {
      setStatus(t('compareNotPdf', cmp.files[side]?.name ?? ''));
      return;
    }
  }
  const run = el('run-compare-btn');
  run.disabled = true;
  try {
    const PdfEngine = await loadPdfEngine();
    for (const side of SIDES) {
      const doc = await openSide(PdfEngine, side);
      if (stale()) {
        doc?.close();
        return;
      }
      if (!doc) return;
      cmp.docs[side] = doc;
    }

    // The text of every page of both, a page at a time.
    const total = cmp.docs.a.pageCount + cmp.docs.b.pageCount;
    const texts = { a: [], b: [] };
    let done = 0;
    for (const side of SIDES) {
      for (let page = 1; page <= cmp.docs[side].pageCount; page++) {
        setStatus(t('compareReading', ++done, total));
        texts[side].push(await cmp.docs[side].text(page));
        if (stale()) return;
      }
    }

    const pairs = alignPages(texts.a, texts.b);
    const pages = [];
    for (const [index, pair] of pairs.entries()) {
      setStatus(t('compareWorking', index + 1, pairs.length));
      if (index % 4 === 0) await breathe();
      if (stale()) return;
      const textA = pair.a ? texts.a[pair.a - 1] : '';
      const textB = pair.b ? texts.b[pair.b - 1] : '';
      pages.push({ ...pair, result: compareTexts(textA, textB), empty: !textA.trim() && !textB.trim() });
    }
    Object.assign(cmp, { pages, summary: summarize(pages), changes: listChanges(pages) });
    setStatus(t('compareDone', pages.length));
    showResults();
  } catch (err) {
    if (stale()) return;
    console.error('Compare PDFs:', err);
    setStatus(t('compareError', errorReason(err, 'dashboard')));
  } finally {
    if (!stale()) run.disabled = !(cmp.files.a && cmp.files.b);
  }
}

// ---------------------------------------------------------------- showing

function showSummary() {
  const { summary } = cmp;
  const lines = [
    summary.changed || summary.onlyA.length || summary.onlyB.length || summary.wordsAdded || summary.wordsRemoved
      ? t('compareSummary', summary.changed, summary.pages, summary.wordsAdded, summary.wordsRemoved)
      : t('compareSummarySame', summary.pages),
  ];
  if (summary.onlyA.length) lines.push(t('compareOnlyAPages', summary.onlyA.join(', ')));
  if (summary.onlyB.length) lines.push(t('compareOnlyBPages', summary.onlyB.join(', ')));
  if (!summary.exact) lines.push(t('compareRough'));
  el('compare-summary').textContent = lines.join('\n');
}

function showResults() {
  const results = el('compare-results');
  results.hidden = false;
  showSummary();
  el('compare-head-a').textContent = `A: ${cmp.files.a.name}`;
  el('compare-head-b').textContent = `B: ${cmp.files.b.name}`;
  el('compare-report-btn').disabled = !cmp.changes.length;
  results.dataset.state = 'done';
  if (cmp.changes.length) goToChange(0, { redraw: true });
  else showPage(0);
}

/** The label of a pair of pages: both numbers, or the one page and the side it is on. */
function pairLabel({ a, b }) {
  if (b === null) return t('compareOnlyA', a);
  if (a === null) return t('compareOnlyB', b);
  return t('comparePair', a, b);
}

function showNav() {
  const count = cmp.pages.length;
  el('compare-page-label').textContent = count ? `${pairLabel(cmp.pages[cmp.page])} (${cmp.page + 1}/${count})` : '';
  el('compare-prev-page-btn').disabled = cmp.page <= 0;
  el('compare-next-page-btn').disabled = cmp.page >= count - 1;
  el('compare-change-label').textContent = cmp.changes.length
    ? cmp.change >= 0
      ? t('compareChangeOf', cmp.change + 1, cmp.changes.length)
      : t('compareChangeCount', cmp.changes.length)
    : t('compareNoChanges');
  el('compare-prev-change-btn').disabled = previousChange() < 0;
  el('compare-next-change-btn').disabled = nextChange() < 0;
}

/** Writes `tokens[from, to)` into `parent`, a space or line break where the text had one. */
function writeTokens(parent, tokens, from, to, wrap) {
  if (from >= to) return;
  // The space before the first word stays outside the marked text.
  if (from > 0 || wrap) parent.append(tokens[from].sep);
  const text = tokens
    .slice(from, to)
    .map((token, i) => (i ? token.sep : '') + token.text)
    .join('');
  if (!wrap) {
    parent.append(text);
    return;
  }
  wrap.textContent = text;
  parent.append(wrap);
}

function mark(tag, className, change) {
  const node = document.createElement(tag);
  node.className = className;
  node.dataset.change = String(change);
  return node;
}

/** The text of the pair shown, A and B side by side, what was removed and added marked. */
function showText() {
  const entry = cmp.pages[cmp.page];
  const columns = { a: el('compare-text-a'), b: el('compare-text-b') };
  columns.a.replaceChildren();
  columns.b.replaceChildren();
  const { tokensA, tokensB, runs, changes, wordsAdded, wordsRemoved } = entry.result;
  for (const [index, run] of runs.entries()) {
    if (run.type === 'same') {
      writeTokens(columns.a, tokensA, run.aStart, run.aEnd);
      writeTokens(columns.b, tokensB, run.bStart, run.bEnd);
    } else if (run.type === 'removed') {
      writeTokens(columns.a, tokensA, run.aStart, run.aEnd, mark('del', 'compare-removed', run.change));
      // Where B lost the text: a mark of its own, unless B put something in its place.
      const next = runs[index + 1];
      if (!(next?.type === 'added' && next.change === run.change)) columns.b.append(mark('span', 'compare-gap', run.change));
    } else {
      const previous = runs[index - 1];
      if (!(previous?.type === 'removed' && previous.change === run.change)) columns.a.append(mark('span', 'compare-gap', run.change));
      writeTokens(columns.b, tokensB, run.bStart, run.bEnd, mark('ins', 'compare-added', run.change));
    }
  }
  for (const side of SIDES) {
    const missing = entry[side] === null;
    if (missing || !columns[side].textContent.trim()) {
      const note = document.createElement('p');
      note.className = 'compare-note';
      note.textContent = missing ? t('compareMissingPage') : t('compareNoText');
      columns[side].replaceChildren(note);
    }
  }
  el('compare-page-status').textContent = changes
    ? t('comparePageChanged', wordsAdded, wordsRemoved)
    : entry.empty
      ? t('compareNoText')
      : t('comparePageSame');
}

function showPage(index, { keepChange = false } = {}) {
  cmp.page = Math.max(0, Math.min(index, cmp.pages.length - 1));
  if (!keepChange) cmp.change = -1;
  el('compare-results').dataset.page = String(cmp.page);
  showText();
  showNav();
  if (el('compare-view').value === 'visual') drawPictures();
}

// ---------------------------------------------------------------- moving between changes

/** The change shown now, as a number on its page; -1 when none on this page is. */
function changeOnPage() {
  const now = cmp.changes[cmp.change];
  return now && now.page === cmp.page ? now.change : -1;
}

function nextChange() {
  const on = changeOnPage();
  return cmp.changes.findIndex(({ page, change }) => page > cmp.page || (page === cmp.page && change > on));
}

function previousChange() {
  const on = changeOnPage();
  return cmp.changes.findLastIndex(({ page, change }) => page < cmp.page || (on >= 0 && page === cmp.page && change < on));
}

function goToChange(index, { redraw = false } = {}) {
  if (index < 0 || index >= cmp.changes.length) return;
  const target = cmp.changes[index];
  cmp.change = index;
  if (redraw || target.page !== cmp.page) showPage(target.page, { keepChange: true });
  else showNav();
  for (const node of document.querySelectorAll('#compare-text-view .current')) node.classList.remove('current');
  const marked = document.querySelectorAll(`#compare-text-view [data-change="${target.change}"]`);
  for (const node of marked) node.classList.add('current');
  marked[0]?.scrollIntoView({ block: 'nearest' });
}

// ---------------------------------------------------------------- pictures

async function drawPictures() {
  const token = ++cmp.drawToken;
  const entry = cmp.pages[cmp.page];
  const note = el('compare-visual-note');
  const frame = el('compare-picture');
  frame.dataset.state = 'drawing';
  note.textContent = t('compareDrawing');
  try {
    const sizes = {};
    for (const side of SIDES) if (entry[side] !== null) sizes[side] = await cmp.docs[side].size(entry[side]);
    const all = Object.values(sizes);
    // One scale for both, so a point of A lands on the same pixel as that point of B.
    const scale = Math.min(
      PICTURE_WIDTH / Math.max(...all.map((size) => size.width)),
      PICTURE_HEIGHT / Math.max(...all.map((size) => size.height))
    );
    const images = {};
    for (const side of SIDES) {
      if (!sizes[side]) continue;
      const { canvas } = await cmp.docs[side].render(entry[side], { scale });
      if (token !== cmp.drawToken) return;
      images[side] = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
    }
    const diff = images.a && images.b ? pixelDiff(images.a, images.b) : null;
    cmp.pictures = { images, diff, sizes };
    frame.dataset.state = 'drawn';
    frame.dataset.changed = String(diff ? diff.changed : -1);
    showPicture();
  } catch (err) {
    if (token !== cmp.drawToken) return;
    console.error('Compare PDFs: the pages could not be drawn:', err);
    frame.dataset.state = 'failed';
    note.textContent = t('compareError', errorReason(err, 'dashboard'));
  }
}

/** Puts the picture chosen (A, B or the differences) on the canvas, with what it shows. */
function showPicture() {
  if (!cmp.pictures) return;
  const { images, diff, sizes } = cmp.pictures;
  const entry = cmp.pages[cmp.page];
  const mode = el('compare-mode').value;
  const canvas = el('compare-canvas');
  const notes = [];
  let picture;
  if (!diff) {
    // A page only one PDF has: there is nothing to lay it over.
    picture = images.a ?? images.b;
    notes.push(images.a ? t('compareOnlyA', entry.a) : t('compareOnlyB', entry.b));
  } else {
    picture = mode === 'a' ? images.a : mode === 'b' ? images.b : diff;
    const round = (value) => Math.round(value);
    if (diff.sizesDiffer) {
      notes.push(t('compareSizesDiffer', round(sizes.a.width), round(sizes.a.height), round(sizes.b.width), round(sizes.b.height)));
    }
    notes.push(
      diff.changed
        ? t('compareVisualChanged', `${((diff.changed / diff.total) * 100).toFixed(diff.changed / diff.total < 0.01 ? 2 : 1)}%`)
        : t('compareVisualSame')
    );
  }
  const width = diff ? diff.width : picture.width;
  const height = diff ? diff.height : picture.height;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // Where the page shown does not reach, the grey of "no page", as in the differences.
  context.fillStyle = 'rgb(200, 200, 205)';
  context.fillRect(0, 0, width, height);
  context.putImageData(picture === diff ? new ImageData(diff.data, diff.width, diff.height) : picture, 0, 0);
  canvas.dataset.mode = diff ? mode : 'single';
  el('compare-visual-note').textContent = notes.join(' ');
}

function showView() {
  const visual = el('compare-view').value === 'visual';
  el('compare-text-view').hidden = visual;
  el('compare-visual-view').hidden = !visual;
  if (visual && cmp.pages.length) drawPictures();
}

// ---------------------------------------------------------------- the report

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A short HTML page listing every change, page by page, in the dashboard's language. */
export function buildReport({ nameA, nameB, pages, summary }) {
  const text = (tokens, from, to) =>
    tokens
      .slice(from, to)
      .map((token, i) => (i ? (token.sep === '\n' ? ' ' : token.sep) : '') + token.text)
      .join('');
  const sections = [];
  for (const entry of pages) {
    if (!entry.result.changes) continue;
    const items = [];
    for (const run of entry.result.runs) {
      if (run.type === 'removed') items[run.change] = { ...items[run.change], removed: text(entry.result.tokensA, run.aStart, run.aEnd) };
      if (run.type === 'added') items[run.change] = { ...items[run.change], added: text(entry.result.tokensB, run.bStart, run.bEnd) };
    }
    const rows = items
      .map(
        ({ removed, added }) =>
          `<li>${removed ? `<del>${escapeHtml(removed)}</del>` : ''}${removed && added ? ' &rarr; ' : ''}${added ? `<ins>${escapeHtml(added)}</ins>` : ''}</li>`
      )
      .join('\n');
    sections.push(`<h2>${escapeHtml(pairLabel(entry))}</h2>\n<ol>\n${rows}\n</ol>`);
  }
  const title = t('compareReportTitle', nameA, nameB);
  const lines = [t('compareSummary', summary.changed, summary.pages, summary.wordsAdded, summary.wordsRemoved)];
  if (summary.onlyA.length) lines.push(t('compareOnlyAPages', summary.onlyA.join(', ')));
  if (summary.onlyB.length) lines.push(t('compareOnlyBPages', summary.onlyB.join(', ')));
  if (!summary.exact) lines.push(t('compareRough'));
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
body { font: 15px/1.5 system-ui, sans-serif; max-width: 860px; margin: 24px auto; padding: 0 16px; color: #111; }
del { background: #fde2e2; color: #9b1c1c; }
ins { background: #dcfce7; color: #14532d; text-decoration: none; }
li { margin: 4px 0; }
</style></head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${lines.map(escapeHtml).join('<br>')}</p>
<p>${escapeHtml(t('compareLegend'))}</p>
${sections.join('\n')}
</body></html>
`;
}

function saveReport() {
  const nameA = cmp.files.a.name;
  const nameB = cmp.files.b.name;
  const html = buildReport({ nameA, nameB, pages: cmp.pages, summary: cmp.summary });
  const base = (name) => name.replace(/\.[^/.]+$/, '');
  const filename = `${base(nameA)}_vs_${base(nameB)}_changes.html`;
  ZipEngine.downloadBlob(new Blob([html], { type: 'text/html' }), filename);
  setStatus(t('compareReportSaved', filename));
}

// ---------------------------------------------------------------- set up

/** Writes again what the tool wrote itself, after the language changed. */
export function showCompareTexts() {
  if (!el('compare-results') || !cmp.pages.length) return;
  const change = cmp.change;
  showSummary();
  if (change >= 0) goToChange(change, { redraw: true });
  else showPage(cmp.page);
}

export function setupCompareTool() {
  if (!el('compare-results')) return;
  for (const side of SIDES) {
    el(`compare-file-${side}`).addEventListener('change', (event) => {
      cmp.files[side] = event.target.files?.[0] ?? null;
      el(`compare-password-${side}`).value = '';
      el(`compare-password-${side}-group`).hidden = true;
      setStatus('');
      reset();
    });
    el(`compare-password-${side}`).addEventListener('keydown', (event) => event.key === 'Enter' && runCompare());
  }
  el('run-compare-btn').addEventListener('click', runCompare);
  el('compare-prev-page-btn').addEventListener('click', () => showPage(cmp.page - 1));
  el('compare-next-page-btn').addEventListener('click', () => showPage(cmp.page + 1));
  el('compare-prev-change-btn').addEventListener('click', () => goToChange(previousChange()));
  el('compare-next-change-btn').addEventListener('click', () => goToChange(nextChange()));
  el('compare-view').addEventListener('change', showView);
  el('compare-mode').addEventListener('change', showPicture);
  el('compare-report-btn').addEventListener('click', saveReport);
  reset();
}
