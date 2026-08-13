import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Guards the Manifest V3 constraint that broke OCR before: tesseract.js defaults
 * every asset path to the jsDelivr CDN, which Chrome refuses to execute. These
 * tests assert the engine never reaches for a remote host.
 *
 * The engine memoises the resolved vendor directory, so each test imports a
 * fresh module instance rather than inheriting the previous test's probe.
 */

const originalFetch = globalThis.fetch;

async function freshEngine() {
  vi.resetModules();
  return (await import('../engine/ai-engine.js')).AiEngine;
}

beforeEach(() => {
  globalThis.chrome = {
    runtime: {
      getURL: (path) => `chrome-extension://abcdef/${path}`
    }
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  globalThis.fetch = originalFetch;
  delete globalThis.chrome;
});

describe('AiEngine.assertLangsBundled', () => {
  it('accepts the languages shipped in the package', async () => {
    const AiEngine = await freshEngine();
    expect(AiEngine.assertLangsBundled('eng')).toEqual(['eng']);
    expect(AiEngine.assertLangsBundled('eng+vie')).toEqual(['eng', 'vie']);
  });

  it('rejects a language whose traineddata is not bundled', async () => {
    const AiEngine = await freshEngine();
    // Without this guard tesseract.js would silently download it from the CDN.
    expect(() => AiEngine.assertLangsBundled('jpn')).toThrow(/chưa được đóng gói/);
    expect(() => AiEngine.assertLangsBundled('eng+jpn')).toThrow(/jpn/);
  });

  it('names only the unsupported languages in the error', async () => {
    const AiEngine = await freshEngine();
    expect(() => AiEngine.assertLangsBundled('eng+jpn+kor')).toThrow(/jpn, kor/);
  });
});

describe('AiEngine.extractTextFromImage', () => {
  it('refuses an unbundled language before touching the network', async () => {
    const AiEngine = await freshEngine();
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    await expect(AiEngine.extractTextFromImage(new Blob(['x']), 'jpn')).rejects.toThrow(/chưa được đóng gói/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('resolves worker assets from the extension package, never a CDN', async () => {
    const AiEngine = await freshEngine();
    const requested = [];
    globalThis.fetch = vi.fn(async (url) => {
      requested.push(String(url));
      return { ok: String(url).includes('vendor/tesseract/worker.min.js') };
    });

    // The vendor probe runs before any worker spawns; failing afterwards is fine.
    await AiEngine.extractTextFromImage(new Blob(['x']), 'eng').catch(() => {});

    expect(requested.length).toBeGreaterThan(0);
    expect(requested[0]).toBe('chrome-extension://abcdef/vendor/tesseract/worker.min.js');
    for (const url of requested) {
      expect(url).not.toMatch(/^https?:/);
      expect(url).not.toMatch(/jsdelivr|unpkg|cdn/i);
    }
  });

  it('falls back to the dist/ prefix when the extension root is the repo root', async () => {
    const AiEngine = await freshEngine();
    const requested = [];
    globalThis.fetch = vi.fn(async (url) => {
      requested.push(String(url));
      return { ok: String(url).startsWith('chrome-extension://abcdef/dist/') };
    });

    await AiEngine.extractTextFromImage(new Blob(['x']), 'eng').catch(() => {});

    expect(requested[0]).toBe('chrome-extension://abcdef/vendor/tesseract/worker.min.js');
    expect(requested[1]).toBe('chrome-extension://abcdef/dist/vendor/tesseract/worker.min.js');
  });

  it('reports a clear error when the offline bundle is missing', async () => {
    const AiEngine = await freshEngine();
    globalThis.fetch = vi.fn(async () => ({ ok: false }));

    await expect(AiEngine.extractTextFromImage(new Blob(['x']), 'eng')).rejects.toThrow(
      /Không tìm thấy gói Tesseract offline/
    );
  });
});
