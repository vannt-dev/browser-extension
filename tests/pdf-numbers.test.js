import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { numberPdfPages } from '../engine/pdf-tools.js';

/**
 * The numbers are read back with pdf.js, the way a viewer shows the page: where each one lands
 * on the page as seen (after the page's own turn), and whether it reads upright there.
 */
beforeAll(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  ).href;
});

async function pdfFile(name, pages) {
  const doc = await PDFDocument.create();
  for (const { size = [600, 800], rotate = 0 } of pages) doc.addPage(size).setRotation(degrees(rotate));
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

/** Every piece of text on each page, with its place in the view (0..1 across, 0..1 down). */
async function readNumbers(blob) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const view = page.getViewport({ scale: 1 });
    const items = (await page.getTextContent()).items.filter((item) => item.str.trim());
    pages.push(
      items.map((item) => {
        const [a, b, , , e, f] = pdfjsLib.Util.transform(view.transform, item.transform);
        return { text: item.str, across: e / view.width, down: f / view.height, upright: a > 0 && Math.abs(b) < 1e-6 };
      })
    );
  }
  return pages;
}

describe('numberPdfPages', () => {
  it('numbers every page at the bottom centre by default', async () => {
    const result = await numberPdfPages(await pdfFile('report.pdf', [{}, {}, {}]));
    expect(result.filename).toBe('report_numbered.pdf');
    expect(result.pageCount).toBe(3);
    const pages = await readNumbers(result.blob);
    expect(pages.map((items) => items.map((i) => i.text))).toEqual([['1'], ['2'], ['3']]);
    for (const [number] of pages) {
      expect(number.across).toBeGreaterThan(0.45);
      expect(number.across).toBeLessThan(0.55);
      expect(number.down).toBeGreaterThan(0.95);
      expect(number.upright).toBe(true);
    }
  });

  it('lands where the reader sees the page, upright, whatever turn the page has', async () => {
    const file = await pdfFile('turned.pdf', [{ rotate: 90 }, { rotate: 180 }, { rotate: 270 }, { size: [800, 500] }]);
    for (const position of ['bottom-center', 'top-right', 'bottom-left']) {
      const pages = await readNumbers((await numberPdfPages(file, { position })).blob);
      for (const [number] of pages) {
        expect(number.upright, position).toBe(true);
        if (position === 'bottom-center') {
          expect(number.across).toBeGreaterThan(0.45);
          expect(number.across).toBeLessThan(0.55);
        }
        if (position === 'top-right') expect(number.across).toBeGreaterThan(0.85);
        if (position === 'bottom-left') expect(number.across).toBeLessThan(0.1);
        expect(position.startsWith('top') ? number.down < 0.1 : number.down > 0.9, position).toBe(true);
      }
    }
  });

  it('writes "n / total", starts where asked and numbers only the pages named', async () => {
    const file = await pdfFile('book.pdf', [{}, {}, {}, {}]);
    const pages = await readNumbers((await numberPdfPages(file, { style: 'of-total', start: 0, pages: '2-' })).blob);
    expect(pages.map((items) => items.map((i) => i.text).join(''))).toEqual(['', '1 / 3', '2 / 3', '3 / 3']);
  });

  it('refuses a place, a style or a first number it does not know', async () => {
    const file = await pdfFile('x.pdf', [{}]);
    await expect(numberPdfPages(file, { position: 'middle' })).rejects.toThrow('is not a place');
    await expect(numberPdfPages(file, { style: 'roman' })).rejects.toThrow('is not a way');
    await expect(numberPdfPages(file, { start: 1.5 })).rejects.toThrow('whole number');
    await expect(numberPdfPages(file, { pages: '9' })).rejects.toThrow('past the last page');
  });

  it('numbers a PDF locked with a password', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 800]);
    doc.encrypt({ userPassword: 'abc', ownerPassword: 'own' });
    const locked = new File([await doc.save()], 'locked.pdf', { type: 'application/pdf' });
    const pages = await readNumbers((await numberPdfPages(locked, { password: 'abc' })).blob);
    expect(pages[0].map((i) => i.text)).toEqual(['1']);
  });
});
