/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
// The legacy build: pdf.js's main build follows the newest browsers (version 6 calls
// Uint8Array.prototype.toHex on every document, which Chrome only has since 140), while the
// legacy one runs on Chrome 125 and later and on the Node versions the tests run on.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configure pdfjs worker. The minified one: the full legacy worker names a .mjs file on
// github.com in a comment, which the build's remote-code check stops on.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// pdf.js decodes JPEG 2000 and JBIG2/CCITT fax images (what scanners write) with WebAssembly
// files it loads from here; scripts/copy-pdfjs-assets.js puts them in the package. This file is
// built into dist/chunks/, so the folder is dist/vendor/pdfjs/ whichever folder is loaded.
const WASM_URL = new URL(/* @vite-ignore */ `../vendor/pdfjs/`, import.meta.url).href;

const openPdf = (data) => pdfjsLib.getDocument({ data, wasmUrl: WASM_URL }).promise;

/**
 * Universal PDF Engine (Extract PDF Pages as Images, PDF to Text)
 */
export class PdfEngine {
  /**
   * Reads a PDF file and renders all pages as PNG/JPG images
   */
  static async renderPdfToImages(file, options = {}) {
    const { format = 'png', scale = 1.5 } = options;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await openPdf(arrayBuffer);
    const pageImages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      // The page's own size in points, as it shows (its rotation applied).
      const { width, height } = page.getViewport({ scale: 1 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      // With the default 'display' intent pdf.js draws each slice of the page in an animation
      // frame, and Chrome runs no animation frames in a background tab: converting a PDF, or
      // OCR of one, stopped while the dashboard was not the active tab. 'print' draws without
      // waiting for frames, and keeps the annotations meant to be printed, which is what a
      // picture of the page should hold.
      await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, 0.92);

      // Convert dataURL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      pageImages.push({
        pageNumber: i,
        width,
        height,
        blob,
        dataUrl,
        filename: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${format}`
      });
    }

    return pageImages;
  }

  /**
   * Extract all plain text from a PDF file
   */
  static async extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await openPdf(arrayBuffer);
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText.trim();
  }
}
