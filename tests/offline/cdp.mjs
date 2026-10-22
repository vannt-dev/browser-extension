// A small Chrome DevTools Protocol client over the browser's own WebSocket (Node 22 has one
// built in), so nothing stands between the browser and its downloads.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Starts Chrome with one unpacked extension and a fresh profile. The debugging port is chosen by
 * the browser (port 0) and read back from the profile, so two runs never collide.
 */
export async function launch({ chrome, extension, profile, downloads, headed = true, extra = [] }) {
  rmSync(profile, { recursive: true, force: true });
  rmSync(downloads, { recursive: true, force: true });
  mkdirSync(join(profile, 'Default'), { recursive: true });
  mkdirSync(downloads, { recursive: true });
  writeFileSync(
    join(profile, 'Default', 'Preferences'),
    JSON.stringify({
      download: {
        default_directory: downloads,
        prompt_for_download: false,
        directory_upgrade: true
      }
    })
  );
  const args = [
    `--user-data-dir=${profile}`,
    '--remote-debugging-port=0',
    `--disable-extensions-except=${extension}`,
    `--load-extension=${extension}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,900',
    '--window-position=40,40',
    '--lang=en-US',
    ...extra
  ];
  // Headless Chrome names downloads by GUID, and the checks look for files by name.
  if (!headed) args.push('--headless=new');
  args.push('about:blank');
  const child = spawn(chrome, args, { stdio: 'ignore' });
  let exited = null;
  child.on('exit', (code) => (exited = code));

  const portFile = join(profile, 'DevToolsActivePort');
  let version;
  for (let i = 0; i < 120 && !version && exited === null; i++) {
    await sleep(250);
    if (!existsSync(portFile)) continue;
    const port = readFileSync(portFile, 'utf8').split('\n')[0].trim();
    version = await fetch(`http://127.0.0.1:${port}/json/version`)
      .then((r) => r.json())
      .catch(() => undefined);
  }
  if (!version) {
    child.kill();
    throw new Error(
      `the browser did not open its debugging port${exited !== null ? ` (it exited with ${exited})` : ''}`
    );
  }
  const browser = await connect(version.webSocketDebuggerUrl);
  browser.child = child;
  browser.product = version.Browser;
  return browser;
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let next = 0;
  const pending = new Map();
  const listeners = new Set();
  const sessions = new Map(); // targetId -> { sessionId, info }
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (!waiter) return;
      if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
      else waiter.resolve(message.result);
      return;
    }
    const { params } = message;
    if (message.method === 'Target.attachedToTarget') {
      sessions.set(params.targetInfo.targetId, {
        sessionId: params.sessionId,
        info: params.targetInfo
      });
    }
    if (message.method === 'Target.targetInfoChanged') {
      const known = sessions.get(params.targetInfo.targetId);
      if (known) known.info = params.targetInfo;
    }
    if (message.method === 'Target.detachedFromTarget') {
      for (const [id, entry] of sessions)
        if (entry.sessionId === params.sessionId) sessions.delete(id);
    }
    for (const listener of listeners) listener(message);
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++next;
      pending.set(id, { resolve, reject, method });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const on = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const waitFor = (predicate, timeout = 15000) =>
    new Promise((resolve, reject) => {
      const off = on((message) => {
        if (!predicate(message)) return;
        clearTimeout(timer);
        off();
        resolve(message);
      });
      const timer = setTimeout(() => {
        off();
        reject(new Error('timed out waiting for a protocol event'));
      }, timeout);
    });
  await send('Target.setDiscoverTargets', { discover: true });
  await send('Target.setAutoAttach', {
    autoAttach: true,
    waitForDebuggerOnStart: false,
    flatten: true
  });
  return {
    send,
    on,
    waitFor,
    sessions,
    async close() {
      await send('Browser.close').catch(() => {});
      socket.close();
    }
  };
}

export async function evaluate(browser, sessionId, expression) {
  const result = await browser.send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true, userGesture: false },
    sessionId
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
}

/** The extension's service worker, once it runs and has its chrome object. */
export async function serviceWorker(browser, path) {
  let entry;
  for (let i = 0; i < 80 && !entry; i++) {
    entry = [...browser.sessions.values()].find(
      (s) =>
        s.info.type === 'service_worker' &&
        s.info.url.startsWith('chrome-extension://') &&
        s.info.url.endsWith('/' + path)
    );
    if (!entry) await sleep(250);
  }
  if (!entry) throw new Error("the extension's service worker did not start");
  const { sessionId } = entry;
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate(
      browser,
      sessionId,
      'typeof chrome !== "undefined" && Boolean(chrome.runtime?.id)'
    ).catch(() => false);
    if (ready) break;
    await sleep(150);
  }
  return { id: new URL(entry.info.url).host, sessionId };
}

/** Opens a tab in the browser's window and, if given, loads an address in it. */
export async function newPage(browser, url) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  let entry;
  for (let i = 0; i < 40 && !entry; i++) {
    entry = browser.sessions.get(targetId);
    if (!entry) await sleep(100);
  }
  if (!entry) throw new Error('no session for the new tab');
  const { sessionId } = entry;
  await browser.send('Page.enable', {}, sessionId);
  await browser.send('Runtime.enable', {}, sessionId);
  const page = {
    targetId,
    sessionId,
    evaluate: (expression) => evaluate(browser, sessionId, expression),
    async goto(address, timeout = 45000) {
      const loaded = browser
        .waitFor((m) => m.sessionId === sessionId && m.method === 'Page.loadEventFired', timeout)
        .catch(() => 'no load event');
      const navigation = await browser.send('Page.navigate', { url: address }, sessionId);
      if (navigation.errorText) throw new Error(`${address}: ${navigation.errorText}`);
      await loaded;
      // The load event that arrives may be the blank page's, so the page itself is waited for,
      // its text applied (the extension's pages translate themselves after loading).
      for (let i = 0; i < 100; i++) {
        const ready = await page
          .evaluate(
            'location.href !== "about:blank" && document.readyState === "complete" && ' +
              '!document.documentElement.classList.contains("i18n-pending")'
          )
          .catch(() => false);
        if (ready) break;
        await sleep(100);
      }
      await sleep(300);
    },
    /** Makes this the window's active tab. */
    async front() {
      await browser.send('Target.activateTarget', { targetId });
      await browser.send('Page.bringToFront', {}, sessionId).catch(() => {});
    },
    async close() {
      await browser.send('Target.closeTarget', { targetId });
    }
  };
  if (url) await page.goto(url);
  return page;
}
