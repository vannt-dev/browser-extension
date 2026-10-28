/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { PDFDocument } from '@cantoo/pdf-lib';

/**
 * Searchable PDF: every page is the scanned image with the words OCR found laid over it as
 * invisible text, so the page looks like the scan and its text can be selected and searched.
 *
 * Tesseract writes each page itself (its PDF renderer, part of the bundled core: the image, and
 * the words in a glyphless font placed at their boxes, in invisible render mode). Any script it
 * recognises comes out right, Vietnamese included, without a font in the package. This file
 * joins those one-page PDFs and gives each page the size of the page it was read from.
 */

/**
 * @typedef {object} OcrPage
 * @property {Blob|ArrayBuffer|Uint8Array} image What OCR reads: a picture of the page
 * @property {number} [width] Size to give the page, in points (the original PDF page); left out,
 *   the page keeps the size Tesseract gives it from the image's resolution
 * @property {number} [height]
 */

/**
 * @param {OcrPage[]} pages In order
 * @param {(image: OcrPage['image'], index: number) => Promise<{ pdf: ArrayLike<number>, text?: string }>} recognize
 *   Reads one page and returns Tesseract's one-page PDF of it
 * @param {{ title?: string }} [options]
 * @returns {Promise<{ blob: Blob, text: string, pageCount: number }>}
 */
export async function buildSearchablePdf(pages, recognize, { title } = {}) {
  if (!pages?.length) throw new Error('There is no page to read.');
  const out = await PDFDocument.create();
  if (title) out.setTitle(title);
  const texts = [];
  for (let index = 0; index < pages.length; index++) {
    const { image, width, height } = pages[index];
    const result = await recognize(image, index);
    // Across a worker's postMessage the bytes may arrive as a plain array.
    if (!result?.pdf?.length) throw new Error(`OCR gave no PDF for page ${index + 1}.`);
    const single = await PDFDocument.load(new Uint8Array(result.pdf));
    const [page] = await out.copyPages(single, [0]);
    if (width && height) page.scale(width / page.getWidth(), height / page.getHeight());
    out.addPage(page);
    texts.push((result.text || '').trim());
  }
  const text =
    texts.length === 1 ? texts[0] : texts.map((pageText, index) => `--- Page ${index + 1} ---\n${pageText}`).join('\n\n');
  return {
    blob: new Blob([await out.save()], { type: 'application/pdf' }),
    text,
    pageCount: out.getPageCount(),
  };
}
