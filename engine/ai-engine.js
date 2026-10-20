/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { createWorker } from 'tesseract.js';
import { decodeHeic, isHeic } from './heic-decoder.js';
import { t } from '../shared/i18n.js';

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
      : // A runtime path, not an asset to bundle: without @vite-ignore, Vite 6+ reads the
        // template literal as a glob and ships repository files (package-lock.json, README).
        [new URL(/* @vite-ignore */ `../${VENDOR_SUBPATH}/`, import.meta.url).toString()];

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

  throw new Error(t('ocrBundleMissing'));
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
      throw new Error(t('ocrLangNotBundled', unsupported.join(', '), this.SUPPORTED_LANGS.join(', ')));
    }
    return requested;
  }

  /**
   * Starts a Tesseract worker on the bundled files. `onRecognize` gets the progress of the page
   * being read, from 0 to 1.
   */
  static async startWorker(lang, onRecognize = null) {
    this.assertLangsBundled(lang);
    const base = await resolveVendorBase();
    return createWorker(lang, 1, {
      workerPath: `${base}worker.min.js`,
      corePath: base,
      langPath: `${base}lang`,
      // Spawn the worker straight from the extension URL. The default blob-URL
      // wrapper gets an opaque origin and cannot importScripts a chrome-extension:// core.
      workerBlobURL: false,
      gzip: true,
      logger: (m) => {
        if (onRecognize && m.status === 'recognizing text') onRecognize(m.progress);
      }
    });
  }

  /** Tesseract reads the formats the browser reads; a HEIC photo is decoded for it. */
  static async readable(image) {
    return image instanceof Blob && (await isHeic(image)) ? decodeHeic(image) : image;
  }

  /**
   * Run OCR on an Image or Canvas to extract text
   */
  static async extractTextFromImage(imageFileOrBlob, lang = 'eng+vie', onProgress = null) {
    const worker = await this.startWorker(lang, onProgress && ((progress) => onProgress(Math.round(progress * 100))));
    try {
      const ret = await worker.recognize(await this.readable(imageFileOrBlob));
      return {
        text: ret.data.text,
        confidence: ret.data.confidence,
        hocr: ret.data.hocr
      };
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Makes a searchable PDF of a scanned PDF or of an image: the pages as they look, with the
   * recognised text laid invisibly over them (see engine/searchable-pdf.js). The pages of a PDF
   * are read from pictures of them and keep their size.
   * @returns {Promise<{ blob: Blob, filename: string, text: string, pageCount: number }>}
   */
  static async createSearchablePdf(file, lang = 'eng+vie', onProgress = null) {
    const name = String(file.name || 'scan').replace(/\.[^/.]+$/, '');
    let pages;
    if (/\.pdf$/i.test(file.name || '') || file.type === 'application/pdf') {
      const { PdfEngine } = await import('./pdf-engine.js');
      // 144 dpi: enough for OCR to read body text, and JPEG keeps each page small.
      const rendered = await PdfEngine.renderPdfToImages(file, { format: 'jpg', scale: 2 });
      pages = rendered.map(({ blob, width, height }) => ({ image: blob, width, height }));
    } else {
      pages = [{ image: await this.readable(file) }];
    }

    // pdf-lib is only fetched for this job: reading text alone does not need it.
    const { buildSearchablePdf } = await import('./searchable-pdf.js');
    let done = 0;
    const worker = await this.startWorker(
      lang,
      onProgress && ((progress) => onProgress(Math.round(((done + progress) / pages.length) * 100)))
    );
    try {
      const result = await buildSearchablePdf(
        pages,
        async (image) => {
          const { data } = await worker.recognize(image, { pdfTitle: name }, { text: true, pdf: true });
          done += 1;
          return data;
        },
        { title: name }
      );
      return { ...result, filename: `${name}_searchable.pdf` };
    } finally {
      await worker.terminate();
    }
  }
}
