import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * The service worker registers its listeners at import time, so each test builds
 * a fresh chrome stub, re-imports the module, and drives the captured listeners
 * directly. Focus is on the gating logic that decides whether a download gets
 * rewritten — the part that silently mangles a user's files when it is wrong.
 */

function stubChrome() {
  const listeners = {};
  const downloads = [];
  const waiters = [];

  /**
   * Resolves once the handler reaches chrome.downloads.download. The conversion
   * path awaits fetch, createImageBitmap, convertToBlob and a FileReader, so a
   * fixed timer would let a slow handler bleed into the next test.
   */
  const waitForDownload = (timeoutMs = 1000) =>
    new Promise((resolve, reject) => {
      if (downloads.length) {
        resolve(downloads[downloads.length - 1]);
        return;
      }
      const timer = setTimeout(() => reject(new Error('Timed out waiting for chrome.downloads.download')), timeoutMs);
      waiters.push((options) => {
        clearTimeout(timer);
        resolve(options);
      });
    });

  globalThis.chrome = {
    runtime: {
      onInstalled: { addListener: (fn) => (listeners.installed = fn) },
      openOptionsPage: vi.fn()
    },
    contextMenus: {
      create: vi.fn(),
      onClicked: { addListener: (fn) => (listeners.menuClicked = fn) }
    },
    downloads: {
      onCreated: { addListener: (fn) => (listeners.downloadCreated = fn) },
      download: vi.fn((options) => {
        downloads.push(options);
        waiters.splice(0).forEach((resolve) => resolve(options));
      })
    },
    storage: {
      local: { get: vi.fn(async () => ({})) }
    }
  };

  return { listeners, downloads, waitForDownload };
}

/** Minimal OffscreenCanvas/ImageBitmap doubles so the conversion path can run. */
function stubCanvasPipeline() {
  globalThis.fetch = vi.fn(async () => ({ blob: async () => new Blob(['img']) }));
  globalThis.createImageBitmap = vi.fn(async () => ({ width: 4, height: 4 }));
  globalThis.OffscreenCanvas = class {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    getContext() {
      return { fillRect: () => {}, drawImage: () => {}, set fillStyle(v) {} };
    }
    async convertToBlob() {
      return new Blob(['converted']);
    }
  };
}

/** Lets any already-queued microtasks and timers settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

let harness;

beforeEach(async () => {
  harness = stubChrome();
  stubCanvasPipeline();
  vi.resetModules();
  await import('../background/background.js');
});

afterEach(() => {
  vi.restoreAllMocks();
  delete globalThis.chrome;
  delete globalThis.createImageBitmap;
  delete globalThis.OffscreenCanvas;
});

describe('background service worker registration', () => {
  it('registers the context menu entries on install', () => {
    harness.listeners.installed();
    const ids = chrome.contextMenus.create.mock.calls.map(([options]) => options.id);
    expect(ids).toEqual(['convert-to-webp', 'convert-to-png', 'convert-to-jpg', 'open-dashboard']);
  });

  it('opens the dashboard without trying to fetch an image', async () => {
    await harness.listeners.menuClicked({ menuItemId: 'open-dashboard' }, {});
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('auto-convert download interceptor', () => {
  it('does nothing while the setting is off', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: false }));

    await harness.listeners.downloadCreated({ url: 'https://example.com/photo.webp', filename: 'photo.webp' });
    await flush();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(harness.downloads).toHaveLength(0);
  });

  it('ignores downloads that are not webp or jfif', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat: 'png' }));

    await harness.listeners.downloadCreated({ url: 'https://example.com/report.pdf', filename: 'report.pdf' });
    await flush();

    expect(harness.downloads).toHaveLength(0);
  });

  it('rewrites a .webp download to the configured format', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat: 'png' }));

    await harness.listeners.downloadCreated({ url: 'https://example.com/photo.webp', filename: 'photo.webp' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'photo.png' });
    expect(harness.downloads).toHaveLength(1);
  });

  it('matches a webp url that carries a query string', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat: 'jpg' }));

    await harness.listeners.downloadCreated({
      url: 'https://example.com/photo.webp?w=1200&auto=format',
      filename: 'photo.webp'
    });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'photo.jpg' });
  });

  it('matches on mime type when the url has no extension', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat: 'png' }));

    await harness.listeners.downloadCreated({
      url: 'https://example.com/asset/9f2c1',
      filename: 'asset.webp',
      mime: 'image/webp'
    });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'asset.png' });
  });

  it('prefers finalUrl over the original redirecting url', async () => {
    chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat: 'png' }));

    await harness.listeners.downloadCreated({
      url: 'https://example.com/redirect',
      finalUrl: 'https://cdn.example.com/photo.webp',
      filename: 'photo.webp'
    });

    await harness.waitForDownload();
    expect(globalThis.fetch).toHaveBeenCalledWith('https://cdn.example.com/photo.webp');
  });
});
