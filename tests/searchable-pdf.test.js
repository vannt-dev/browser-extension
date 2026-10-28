// @vitest-environment node
// tesseract.js picks its Node build only outside jsdom.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from '@cantoo/pdf-lib';
import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { buildSearchablePdf } from '../engine/searchable-pdf.js';

/**
 * Real OCR on a tiny fixture (two lines: "Xin chào Việt Nam", "Hello world 2026"), with the same
 * Tesseract core and language data the extension ships, read from node_modules. The PDF that
 * comes out is read back with pdf.js, the way a viewer finds the text to search.
 */

const FIXTURE = fs.readFileSync('tests/fixtures/ocr-sample.jpg');
let worker;
let langDir;

const recognize = async (image) => (await worker.recognize(image, {}, { text: true, pdf: true })).data;

async function pdfText(blob) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  const pages = [];
  for (let number = 1; number <= doc.numPages; number++) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    const ops = await page.getOperatorList();
    const modes = ops.fnArray
      .map((fn, index) => (fn === pdfjs.OPS.setTextRenderingMode ? ops.argsArray[index][0] : null))
      .filter((mode) => mode !== null);
    pages.push({
      text: content.items.map((item) => item.str).join(' ').normalize('NFC').replace(/\s+/g, ' '),
      modes,
      hasImage: ops.fnArray.includes(pdfjs.OPS.paintImageXObject),
    });
  }
  return pages;
}

beforeAll(async () => {
  // Both languages in one folder, as the extension packs them.
  langDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-lang-'));
  for (const lang of ['eng', 'vie']) {
    fs.copyFileSync(
      `node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`,
      path.join(langDir, `${lang}.traineddata.gz`)
    );
  }
  worker = await createWorker('vie+eng', 1, { langPath: langDir, gzip: true, cacheMethod: 'none' });
}, 60000);

afterAll(async () => {
  await worker?.terminate();
  if (langDir) fs.rmSync(langDir, { recursive: true, force: true });
});

describe('buildSearchablePdf', () => {
  it('lays the recognised words, diacritics included, as invisible text over the image', async () => {
    const result = await buildSearchablePdf([{ image: FIXTURE }], recognize, { title: 'sample' });

    expect(result.pageCount).toBe(1);
    expect(result.blob.type).toBe('application/pdf');
    expect(result.text).toContain('Việt Nam');

    const [page] = await pdfText(result.blob);
    for (const word of ['Xin', 'chào', 'Việt', 'Nam', 'Hello', 'world', '2026']) expect(page.text).toContain(word);
    expect(page.hasImage).toBe(true);
    // Render mode 3: the text is there to select and search, and nothing of it is painted.
    expect(page.modes).toContain(3);
    expect(page.modes.every((mode) => mode === 3)).toBe(true);
  }, 60000);

  it('keeps the pages in order, each at the size of the page it was read from', async () => {
    const result = await buildSearchablePdf(
      [
        { image: FIXTURE, width: 595, height: 842 },
        { image: FIXTURE, width: 842, height: 595 },
      ],
      recognize
    );

    expect(result.pageCount).toBe(2);
    const doc = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(doc.getPages().map((page) => [Math.round(page.getWidth()), Math.round(page.getHeight())])).toEqual([
      [595, 842],
      [842, 595],
    ]);
    const pages = await pdfText(result.blob);
    expect(pages.map((page) => page.text.includes('Hello world 2026'))).toEqual([true, true]);
    expect(result.text).toMatch(/^--- Page 1 ---\n[\s\S]*\n\n--- Page 2 ---\n/);
  }, 60000);

  it('says which page OCR gave nothing for, and refuses an empty list', async () => {
    await expect(buildSearchablePdf([], recognize)).rejects.toThrow('no page');
    await expect(buildSearchablePdf([{ image: FIXTURE }], async () => ({ text: 'x' }))).rejects.toThrow(
      'OCR gave no PDF for page 1.'
    );
  });
});
