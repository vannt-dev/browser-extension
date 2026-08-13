import { createWorker } from 'tesseract.js';

/**
 * Universal AI Engine (100% Client-Side OCR)
 *
 * Tesseract.js defaults every asset path to the jsDelivr CDN. Manifest V3 blocks
 * remote script execution, so all paths are pinned to files shipped inside the
 * extension by scripts/copy-tesseract-assets.js.
 */

const VENDOR_SUBPATH = 'vendor/tesseract';

let resolvedBaseUrl = null;

/**
 * Locates the bundled Tesseract directory.
 *
 * The extension root is dist/ when loaded as documented, but the repository root
 * is also loadable during development, which puts the assets one level deeper.
 * Probe both and remember whichever answers.
 */
async function resolveVendorBase() {
  if (resolvedBaseUrl) return resolvedBaseUrl;

  const candidates =
    typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
      ? [chrome.runtime.getURL(`${VENDOR_SUBPATH}/`), chrome.runtime.getURL(`dist/${VENDOR_SUBPATH}/`)]
      : [new URL(`../${VENDOR_SUBPATH}/`, import.meta.url).toString()];

  for (const base of candidates) {
    try {
      const res = await fetch(`${base}worker.min.js`, { method: 'HEAD' });
      if (res.ok) {
        resolvedBaseUrl = base;
        return base;
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    'Không tìm thấy gói Tesseract offline trong extension. Hãy chạy "npm run build" để đóng gói lại.'
  );
}

export class AiEngine {
  /** Languages shipped with the extension. */
  static SUPPORTED_LANGS = ['eng', 'vie'];

  /**
   * Rejects languages whose traineddata is not bundled, instead of letting
   * tesseract.js silently fall back to fetching them from the CDN.
   */
  static assertLangsBundled(lang) {
    const requested = String(lang).split('+').filter(Boolean);
    const unsupported = requested.filter((l) => !this.SUPPORTED_LANGS.includes(l));
    if (unsupported.length) {
      throw new Error(
        `Ngôn ngữ OCR chưa được đóng gói: ${unsupported.join(', ')}. ` +
          `Hiện hỗ trợ: ${this.SUPPORTED_LANGS.join(', ')}.`
      );
    }
    return requested;
  }

  /**
   * Run OCR on an Image or Canvas to extract text
   */
  static async extractTextFromImage(imageFileOrBlob, lang = 'eng+vie', onProgress = null) {
    this.assertLangsBundled(lang);
    const base = await resolveVendorBase();

    const worker = await createWorker(lang, 1, {
      workerPath: `${base}worker.min.js`,
      corePath: base,
      langPath: `${base}lang`,
      // Spawn the worker straight from the extension URL. The default blob-URL
      // wrapper gets an opaque origin and cannot importScripts a chrome-extension:// core.
      workerBlobURL: false,
      gzip: true,
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    try {
      const ret = await worker.recognize(imageFileOrBlob);
      return {
        text: ret.data.text,
        confidence: ret.data.confidence,
        hocr: ret.data.hocr
      };
    } finally {
      await worker.terminate();
    }
  }
}
