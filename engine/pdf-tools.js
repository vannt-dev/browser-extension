/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Merging, splitting, rotating, deleting and reordering PDF pages, page for page and without
 * re-rendering: text stays text, vectors stay vectors, and nothing is recompressed.
 */

function baseName(name) {
  return String(name || 'document').replace(/\.[^/.]+$/, '');
}

async function load(file) {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch (error) {
    // pdf-lib's own messages do not say which file of a batch was the problem.
    const reason = /encrypted/i.test(error?.message || '')
      ? 'it is password-protected'
      : error?.message || 'it could not be read';
    throw new Error(`Cannot open ${file.name}: ${reason}`);
  }
}

function toBlob(bytes) {
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Parses a page selection such as `1-3, 5, 8-` against a page count.
 * @param {string} text Ranges separated by commas; an open end means "to the last page"
 * @param {number} pageCount
 * @returns {number[][]} One list of zero-based page indexes per range, in the order written
 */
export function parsePageRanges(text, pageCount) {
  const parts = String(text || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error('No pages were given.');
  return parts.map((part) => {
    const match = /^(\d*)\s*(-)?\s*(\d*)$/.exec(part);
    if (!match || (!match[1] && !match[3])) throw new Error(`"${part}" is not a page or a range of pages.`);
    const first = match[1] ? Number(match[1]) : 1;
    const last = match[2] ? (match[3] ? Number(match[3]) : pageCount) : first;
    if (first < 1 || last < first) throw new Error(`"${part}" is not a page or a range of pages.`);
    if (last > pageCount) throw new Error(`"${part}" goes past the last page (${pageCount}).`);
    return Array.from({ length: last - first + 1 }, (_, index) => first - 1 + index);
  });
}

/**
 * Joins PDF files into one, in the order given.
 * @param {File[]} files
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function mergePdfs(files) {
  if (!files || files.length < 2) throw new Error('Merging needs at least two PDF files.');
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await load(file);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return {
    blob: toBlob(await merged.save()),
    filename: `${baseName(files[0].name)}_merged.pdf`,
    pageCount: merged.getPageCount(),
  };
}

/**
 * Splits one PDF into several.
 * @param {File} file
 * @param {string} [ranges] A selection such as `1-3, 5, 8-`: one output per range.
 *   Left out, every page becomes its own file.
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }[]>}
 */
export async function splitPdf(file, ranges = '') {
  const source = await load(file);
  const pageCount = source.getPageCount();
  const groups = String(ranges).trim()
    ? parsePageRanges(ranges, pageCount)
    : source.getPageIndices().map((index) => [index]);
  const width = String(pageCount).length;
  const results = [];
  for (const group of groups) {
    const part = await PDFDocument.create();
    const pages = await part.copyPages(source, group);
    pages.forEach((page) => part.addPage(page));
    const first = String(group[0] + 1).padStart(width, '0');
    const last = String(group[group.length - 1] + 1).padStart(width, '0');
    const label = group.length === 1 ? `page_${first}` : `pages_${first}-${last}`;
    results.push({
      blob: toBlob(await part.save()),
      filename: `${baseName(file.name)}_${label}.pdf`,
      pageCount: group.length,
    });
  }
  return results;
}

/**
 * The pages a selection such as `2, 5-7` names, each once, in the order written.
 */
function selectedPages(text, pageCount) {
  return [...new Set(parsePageRanges(text, pageCount).flat())];
}

/** The angles a page can be turned by, clockwise. */
export const ROTATIONS = [90, 180, 270];

/**
 * Turns pages clockwise, on top of any turn they already have.
 * @param {File} file
 * @param {number} angle 90, 180 or 270
 * @param {string} [pages] A selection such as `1-3, 5`; left out, every page turns.
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function rotatePdfPages(file, angle, pages = '') {
  const turn = Number(angle);
  if (!ROTATIONS.includes(turn)) throw new Error('Pages turn by 90, 180 or 270 degrees.');
  const doc = await load(file);
  const indexes = String(pages).trim() ? selectedPages(pages, doc.getPageCount()) : doc.getPageIndices();
  for (const index of indexes) {
    const page = doc.getPage(index);
    page.setRotation(degrees((((page.getRotation().angle + turn) % 360) + 360) % 360));
  }
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_rotated.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * Takes pages out of a PDF.
 * @param {File} file
 * @param {string} pages A selection such as `2, 5-7`
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function deletePdfPages(file, pages) {
  const doc = await load(file);
  const indexes = selectedPages(pages, doc.getPageCount());
  if (indexes.length === doc.getPageCount()) throw new Error('Deleting every page would leave an empty PDF.');
  // From the last page back, so the indexes still to remove keep pointing at the same pages.
  [...indexes].sort((a, b) => b - a).forEach((index) => doc.removePage(index));
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_pages_deleted.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * Puts the pages of a PDF in a new order.
 * @param {File} file
 * @param {string} order A selection such as `3, 1-2`: those pages come first, in that order, and
 *   the pages it leaves out follow in their old order. A page named twice is refused.
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function reorderPdfPages(file, order) {
  const source = await load(file);
  const pageCount = source.getPageCount();
  const named = parsePageRanges(order, pageCount).flat();
  const twice = named.find((index, position) => named.indexOf(index) !== position);
  if (twice !== undefined) throw new Error(`Page ${twice + 1} is named more than once.`);
  const indexes = [...named, ...source.getPageIndices().filter((index) => !named.includes(index))];
  const reordered = await PDFDocument.create();
  const pages = await reordered.copyPages(source, indexes);
  pages.forEach((page) => reordered.addPage(page));
  return {
    blob: toBlob(await reordered.save()),
    filename: `${baseName(file.name)}_reordered.pdf`,
    pageCount,
  };
}
