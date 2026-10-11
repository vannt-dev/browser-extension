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
  const stored = {};

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
      id: 'this-extension',
      onInstalled: { addListener: (fn) => (listeners.installed = fn) },
      onStartup: { addListener: (fn) => (listeners.started = fn) },
      openOptionsPage: vi.fn()
    },
    i18n: { getUILanguage: () => 'en-US' },
    contextMenus: {
      create: vi.fn(),
      removeAll: vi.fn(async () => {}),
      onClicked: { addListener: (fn) => (listeners.menuClicked = fn) }
    },
    downloads: {
      onCreated: { addListener: (fn) => (listeners.downloadCreated = fn) },
      // What Chrome knows about a download once its name is chosen; nothing until a test says so.
      search: vi.fn(async () => []),
      download: vi.fn((options) => {
        downloads.push(options);
        waiters.splice(0).forEach((resolve) => resolve(options));
      })
    },
    permissions: {
      request: vi.fn(async () => true),
      contains: vi.fn(async () => false),
      onAdded: { addListener: (fn) => (listeners.permissionAdded = fn) },
      onRemoved: { addListener: (fn) => (listeners.permissionRemoved = fn) }
    },
    action: {
      setBadgeText: vi.fn(async () => {}),
      setBadgeBackgroundColor: vi.fn(async () => {})
    },
    storage: {
      onChanged: { addListener: (fn) => (listeners.storageChanged = fn) },
      local: {
        get: vi.fn(async () => ({ ...stored })),
        set: vi.fn(async (values) => {
          Object.assign(stored, values);
        }),
        remove: vi.fn(async (key) => {
          delete stored[key];
        })
      }
    }
  };

  return { listeners, downloads, waitForDownload, stored };
}

/** Minimal OffscreenCanvas/ImageBitmap doubles so the conversion path can run. */
function stubCanvasPipeline() {
  globalThis.fetch = vi.fn(async () => ({ ok: true, blob: async () => new Blob(['img']) }));
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

/** The setting as the worker reads it, for the tests that only care about the download. */
const autoConvertOn = (targetAutoFormat = 'png') => {
  chrome.storage.local.get = vi.fn(async () => ({ autoConvertWebp: true, targetAutoFormat }));
};

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
  it('registers the context menu entries on install', async () => {
    await harness.listeners.installed();
    const ids = chrome.contextMenus.create.mock.calls.map(([options]) => options.id);
    expect(ids).toEqual(['convert-to-webp', 'convert-to-png', 'convert-to-jpg', 'open-dashboard']);
  });

  const menuTitles = () => chrome.contextMenus.create.mock.calls.map(([options]) => options.title);

  it('writes the menu in the browser\'s language', async () => {
    await harness.listeners.installed();
    expect(menuTitles()).toContain('⚡ Convert to PNG');

    chrome.contextMenus.create.mockClear();
    chrome.i18n.getUILanguage = () => 'vi';
    await harness.listeners.started();
    expect(menuTitles()).toContain('⚡ Chuyển sang PNG');
  });

  it('rewrites the menu when the user picks a language, without leaving the old entries', async () => {
    await harness.listeners.installed();
    chrome.contextMenus.create.mockClear();
    chrome.contextMenus.removeAll.mockClear();

    harness.stored.uiLanguage = 'vi';
    harness.listeners.storageChanged({ uiLanguage: { newValue: 'vi' } }, 'local');
    await flush();

    expect(chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
    expect(menuTitles()).toEqual(['⚡ Chuyển sang WebP', '⚡ Chuyển sang PNG', '⚡ Chuyển sang JPG', '🚀 Mở Full File Converter Dashboard']);
  });

  it('leaves the menu alone when another setting changes', async () => {
    harness.listeners.storageChanged({ theme: { newValue: 'light' } }, 'local');
    await flush();
    expect(chrome.contextMenus.create).not.toHaveBeenCalled();
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
    autoConvertOn();

    await harness.listeners.downloadCreated({ url: 'https://example.com/report.pdf', filename: 'report.pdf' });
    await flush();

    expect(harness.downloads).toHaveLength(0);
  });

  it('rewrites a .webp download to the configured format', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({ url: 'https://example.com/photo.webp', filename: 'photo.webp' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'photo.png' });
    expect(harness.downloads).toHaveLength(1);
  });

  it('matches a webp url that carries a query string', async () => {
    autoConvertOn('jpg');

    await harness.listeners.downloadCreated({
      url: 'https://example.com/photo.webp?w=1200&auto=format',
      filename: 'photo.webp'
    });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'photo.jpg' });
  });

  it('saves a PNG when the stored format is not one the settings offer', async () => {
    autoConvertOn('gif');

    await harness.listeners.downloadCreated({ url: 'https://example.com/photo.webp', filename: 'photo.webp' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'photo.png' });
  });

  it('matches on mime type when the url has no extension', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({
      url: 'https://example.com/asset/9f2c1',
      filename: 'asset.webp',
      mime: 'image/webp'
    });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'asset.png' });
  });

  it('prefers finalUrl over the original redirecting url', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({
      url: 'https://example.com/redirect',
      finalUrl: 'https://cdn.example.com/photo.webp',
      filename: 'photo.webp'
    });

    await harness.waitForDownload();
    expect(globalThis.fetch).toHaveBeenCalledWith('https://cdn.example.com/photo.webp');
  });

  it('leaves its own converted download alone', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({
      url: 'https://example.com/photo.webp',
      filename: '',
      byExtensionId: 'this-extension'
    });
    await flush();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(harness.downloads).toHaveLength(0);
  });
});

describe('the name of an auto-converted file', () => {
  // What Chrome really hands to onCreated: the name has not been chosen yet.
  it('comes from the address when the download has none yet', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({ id: 7, url: 'https://cdn.example.com/gallery/1.webp?w=800', filename: '' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: '1.png', conflictAction: 'uniquify' });
  });

  it('is the name Chrome has given the download by the time the picture is ready', async () => {
    autoConvertOn();
    chrome.downloads.search = vi.fn(async () => [{ id: 7, filename: 'C:\\Users\\me\\Downloads\\holiday (1).webp' }]);

    await harness.listeners.downloadCreated({ id: 7, url: 'https://cdn.example.com/i/9f2c1', filename: '', mime: 'image/webp' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'holiday (1).png' });
    expect(chrome.downloads.search).toHaveBeenCalledWith({ id: 7 });
  });

  it('loses what a file name may not contain', async () => {
    autoConvertOn();

    await harness.listeners.downloadCreated({ id: 7, url: 'https://cdn.example.com/a%3Ab%2Fc%3F.webp', filename: '' });

    await expect(harness.waitForDownload()).resolves.toMatchObject({ filename: 'a_b_c_.png' });
  });
});

describe('a conversion that fails says so', () => {
  it('marks the toolbar icon and records that the site refused the extension', async () => {
    autoConvertOn();
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    await harness.listeners.downloadCreated({ id: 9, url: 'https://images.example.com/photo.webp', filename: '' });

    expect(harness.downloads).toHaveLength(0);
    expect(harness.stored.lastFailure).toMatchObject({ kind: 'access', host: 'images.example.com' });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
  });

  it('does not blame access when the site is allowed and the image is the problem', async () => {
    autoConvertOn();
    chrome.permissions.contains = vi.fn(async () => true);
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 404 }));

    await harness.listeners.downloadCreated({ id: 9, url: 'https://images.example.com/gone.webp', filename: '' });

    expect(harness.stored.lastFailure).toMatchObject({ kind: 'failed', host: 'images.example.com' });
  });

  it('takes the mark away after the next conversion that works', async () => {
    harness.stored.lastFailure = { kind: 'access', host: 'images.example.com', at: 1 };
    autoConvertOn();

    await harness.listeners.downloadCreated({ id: 9, url: 'https://images.example.com/photo.webp', filename: '' });

    expect(harness.downloads).toHaveLength(1);
    expect(harness.stored.lastFailure).toBeUndefined();
    expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
  });
});

describe('right-click on an image', () => {
  const click = (srcUrl, menuItemId = 'convert-to-png') =>
    harness.listeners.menuClicked({ menuItemId, srcUrl, pageUrl: 'https://news.example.com/story' }, {});

  it("asks for the image's site during the click, before anything is fetched", async () => {
    const order = [];
    chrome.permissions.request = vi.fn(async () => {
      order.push('asked');
      return true;
    });
    globalThis.fetch = vi.fn(async () => {
      order.push('fetched');
      return { ok: true, blob: async () => new Blob(['img']) };
    });

    const done = click('https://cdn.example.net/img/photo.webp');
    // Already asked when the listener returns: a service worker may not ask after its first await.
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['https://cdn.example.net/*'] });
    await done;

    expect(order).toEqual(['asked', 'fetched']);
    expect(harness.downloads[0]).toMatchObject({ filename: 'photo.png', conflictAction: 'uniquify' });
  });

  it("does not ask when the image is on the page's own site", async () => {
    await click('https://news.example.com/img/photo.jpg');

    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(harness.downloads).toHaveLength(1);
  });

  it('does not ask for an image that is a data: address, and gives it a dated name', async () => {
    await click('data:image/png;base64,AAAA');

    expect(chrome.permissions.request).not.toHaveBeenCalled();
    expect(harness.downloads[0].filename).toMatch(/^converted_image_\d+\.png$/);
  });

  it('still tries the image when the answer is no: many sites let anyone read their images', async () => {
    chrome.permissions.request = vi.fn(async () => false);

    await click('https://cdn.example.net/img/photo.webp');

    expect(harness.downloads).toHaveLength(1);
  });

  it('records why nothing was saved when the site refuses and access was not given', async () => {
    chrome.permissions.request = vi.fn(async () => false);
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    await click('https://cdn.example.net/img/photo.webp');

    expect(harness.downloads).toHaveLength(0);
    expect(harness.stored.lastFailure).toMatchObject({ kind: 'access', host: 'cdn.example.net' });
  });

  it('saves a JPG with the .jpg extension', async () => {
    await click('https://news.example.com/a/b/cat.png', 'convert-to-jpg');

    expect(harness.downloads[0].filename).toBe('cat.jpg');
  });
});

describe('auto-convert follows the access to all sites', () => {
  it('switches on when the access asked for from the popup is granted', async () => {
    harness.stored.autoConvertPending = Date.now() - 5000;
    chrome.permissions.contains = vi.fn(async () => true);

    await harness.listeners.permissionAdded({ origins: ['<all_urls>'] });

    expect(harness.stored).toMatchObject({ autoConvertWebp: true, autoConvertPending: 0 });
  });

  it('stays off when the access arrives long after the popup asked', async () => {
    harness.stored.autoConvertPending = Date.now() - 10 * 60 * 1000;
    chrome.permissions.contains = vi.fn(async () => true);

    await harness.listeners.permissionAdded({ origins: ['<all_urls>'] });

    expect(harness.stored.autoConvertWebp).toBeUndefined();
  });

  it('stays off when one site was allowed for a right-click', async () => {
    harness.stored.autoConvertPending = Date.now();
    chrome.permissions.contains = vi.fn(async () => false);

    await harness.listeners.permissionAdded({ origins: ['https://cdn.example.net/*'] });

    expect(harness.stored.autoConvertWebp).toBeUndefined();
  });

  it('stays off when all sites were allowed without the setting having been asked for', async () => {
    chrome.permissions.contains = vi.fn(async () => true);

    await harness.listeners.permissionAdded({ origins: ['<all_urls>'] });

    expect(harness.stored.autoConvertWebp).toBeUndefined();
  });

  it('switches off when the access is taken away', async () => {
    harness.stored.autoConvertWebp = true;
    chrome.permissions.contains = vi.fn(async () => false);

    await harness.listeners.permissionRemoved({ origins: ['<all_urls>'] });

    expect(harness.stored.autoConvertWebp).toBe(false);
  });
});
