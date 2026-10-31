import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import sharp from 'sharp';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { stampPdf } from '../engine/pdf-tools.js';
import { STAMP_TEXT_UNSUPPORTED } from '../engine/stamp-text.js';

/**
 * Stamps are read back with pdf.js, the way a viewer shows the page: the text where it lands on
 * the page as seen (after the page's own turn) and the way it reads there, and the picture as
 * the place pdf.js paints it.
 */
beforeAll(() => {
  // The engine fetches the stamp font from the package; here the package is the repository
  // (the test server's address for it is not served).
  const fetchOnline = globalThis.fetch;
  globalThis.fetch = async (url, ...rest) => {
    const font = /\/assets\/fonts\/([^/?#]+)$/.exec(new URL(url).pathname);
    return font ? new Response(await readFile(resolve('assets/fonts', font[1]))) : fetchOnline(url, ...rest);
  };
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  ).href;
});

async function pdfFile(name, pages) {
  const doc = await PDFDocument.create();
  for (const { size = [600, 800], rotate = 0, crop } of pages) {
    const page = doc.addPage(size);
    page.setRotation(degrees(rotate));
    if (crop) page.setCropBox(...crop);
  }
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

const png = () =>
  sharp({ create: { width: 40, height: 20, channels: 3, background: { r: 0, g: 0, b: 200 } } }).png().toBuffer();
const jpg = () =>
  sharp({ create: { width: 40, height: 20, channels: 3, background: { r: 0, g: 0, b: 200 } } }).jpeg().toBuffer();

const multiply = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/**
 * Each page as a viewer shows it: the text on it (with its place, 0..1 across and down, and its
 * angle as read, counter-clockwise) and the centre of every picture painted on it.
 */
async function readPages(blob) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const view = page.getViewport({ scale: 1 });
    const texts = (await page.getTextContent()).items
      .filter((item) => item.str.trim())
      .map((item) => {
        const [a, b, , , e, f] = pdfjsLib.Util.transform(view.transform, item.transform);
        // The viewport flips y, so a line that rises to the right has a negative b here.
        const angle = Math.round((Math.atan2(-b, a) * 180) / Math.PI) + 0;
        return { text: item.str, across: e / view.width, down: f / view.height, angle };
      });
    const pictures = [];
    const { fnArray, argsArray } = await page.getOperatorList();
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    fnArray.forEach((fn, i) => {
      if (fn === pdfjsLib.OPS.save) stack.push(ctm);
      else if (fn === pdfjsLib.OPS.restore) ctm = stack.pop() ?? ctm;
      else if (fn === pdfjsLib.OPS.transform) ctm = multiply(ctm, argsArray[i]);
      else if (fn === pdfjsLib.OPS.paintImageXObject) {
        const m = multiply(view.transform, ctm);
        const [x, y] = [m[0] * 0.5 + m[2] * 0.5 + m[4], m[1] * 0.5 + m[3] * 0.5 + m[5]];
        pictures.push({ across: x / view.width, down: y / view.height });
      }
    });
    pages.push({ texts, pictures });
  }
  return pages;
}

describe('stampPdf', () => {
  it('stamps the text in the centre of every page by default', async () => {
    const result = await stampPdf(await pdfFile('contract.pdf', [{}, {}]), { text: 'APPROVED' });
    expect(result.filename).toBe('contract_stamped.pdf');
    expect(result.pageCount).toBe(2);
    const pages = await readPages(result.blob);
    for (const { texts } of pages) {
      expect(texts.map((t) => t.text)).toEqual(['APPROVED']);
      expect(texts[0].angle).toBe(0);
      // The baseline sits a little under the middle of the page, the text spans the middle.
      expect(texts[0].across).toBeGreaterThan(0.3);
      expect(texts[0].across).toBeLessThan(0.4);
      expect(texts[0].down).toBeGreaterThan(0.5);
      expect(texts[0].down).toBeLessThan(0.56);
    }
  });

  it('lands where the reader sees the page, at the angle asked, whatever turn the page has', async () => {
    const file = await pdfFile('turned.pdf', [{ rotate: 90 }, { rotate: 180 }, { rotate: 270 }, { size: [800, 500] }]);
    for (const position of ['top-right', 'bottom-left']) {
      const pages = await readPages((await stampPdf(file, { text: 'COPY', position, size: 20 })).blob);
      for (const { texts } of pages) {
        const [stamp] = texts;
        expect(stamp.text).toBe('COPY');
        expect(stamp.angle, position).toBe(0);
        if (position === 'top-right') {
          expect(stamp.across, position).toBeGreaterThan(0.7);
          expect(stamp.down, position).toBeLessThan(0.2);
        } else {
          expect(stamp.across, position).toBeLessThan(0.1);
          expect(stamp.down, position).toBeGreaterThan(0.85);
        }
      }
    }
    const tilted = await readPages((await stampPdf(file, { text: 'DRAFT', rotation: 30 })).blob);
    for (const { texts } of tilted) expect(texts[0].angle).toBe(30);
  });

  it('puts the stamp where a custom place says, measured from the top left', async () => {
    const cropped = { size: [900, 1200], crop: [150, 200, 600, 800] };
    const file = await pdfFile('form.pdf', [{}, { rotate: 90 }, cropped, { ...cropped, rotate: 270 }]);
    const pages = await readPages((await stampPdf(file, { text: 'PAID', position: 'custom', x: 80, y: 20, size: 10 })).blob);
    for (const { texts } of pages) {
      // The text's left end is half its width left of the centre that was asked for.
      expect(texts[0].across).toBeGreaterThan(0.72);
      expect(texts[0].across).toBeLessThan(0.8);
      expect(texts[0].down).toBeGreaterThan(0.18);
      expect(texts[0].down).toBeLessThan(0.25);
    }
  });

  it('adds the date under the text and stamps only the pages named', async () => {
    const file = await pdfFile('book.pdf', [{}, {}, {}, {}]);
    const read = async (pages) =>
      (await readPages((await stampPdf(file, { text: 'COPY', date: '2026-10-31', pages })).blob)).map(({ texts }) =>
        texts.map((t) => t.text).join('|')
      );
    const both = 'COPY|2026-10-31';
    expect(await read('first')).toEqual([both, '', '', '']);
    expect(await read('last')).toEqual(['', '', '', both]);
    expect(await read('All')).toEqual([both, both, both, both]);
    expect(await read('1-2, 4')).toEqual([both, both, '', both]);
    const [first] = await readPages((await stampPdf(file, { text: 'COPY', date: '2026-10-31', pages: '1' })).blob);
    expect(first.texts[1].down).toBeGreaterThan(first.texts[0].down);
  });

  it('stamps a PNG or JPG picture, on a turned page too, above the text', async () => {
    const file = await pdfFile('signed.pdf', [{}, { rotate: 90 }]);
    for (const image of [await png(), await jpg()]) {
      const pages = await readPages((await stampPdf(file, { image, position: 'bottom-right', size: 20 })).blob);
      for (const { texts, pictures } of pages) {
        expect(texts).toEqual([]);
        expect(pictures).toHaveLength(1);
        expect(pictures[0].across).toBeGreaterThan(0.8);
        expect(pictures[0].down).toBeGreaterThan(0.85);
      }
    }
    const [page] = await readPages((await stampPdf(file, { image: await png(), text: 'APPROVED', pages: '1' })).blob);
    expect(page.pictures[0].down).toBeLessThan(page.texts[0].down);
  });

  it('takes the picture as a File too', async () => {
    const image = new File([await png()], 'logo.png', { type: 'image/png' });
    const [page] = await readPages((await stampPdf(await pdfFile('x.pdf', [{}]), { image })).blob);
    expect(page.pictures).toHaveLength(1);
  });

  it('draws Vietnamese and other Latin letters, on a turned page too', async () => {
    const file = await pdfFile('hoa-don.pdf', [{}, { rotate: 90 }]);
    for (const text of ['ĐÃ DUYỆT', 'Đã thanh toán', 'Genehmigt – Größe', 'Zatwierdzono ąęłńśźż']) {
      const pages = await readPages((await stampPdf(file, { text, position: 'top-right', size: 40 })).blob);
      for (const { texts } of pages) {
        expect(texts.map((t) => t.text).join('')).toBe(text);
        expect(texts[0].angle).toBe(0);
        expect(texts[0].across).toBeGreaterThan(0.5);
        expect(texts[0].down).toBeLessThan(0.2);
      }
    }
    // A letter typed as its base and marks is the same letter.
    const [page] = await readPages((await stampPdf(file, { text: 'DUYỆT', pages: '1' })).blob);
    expect(page.texts[0].text).toBe('DUYỆT');
  });

  it('refuses text the stamp font cannot draw, naming the characters', async () => {
    const file = await pdfFile('x.pdf', [{}]);
    const error = await stampPdf(file, { text: 'APPROVED 承認 ✓' }).catch((e) => e);
    expect(error.code).toBe(STAMP_TEXT_UNSUPPORTED);
    expect(error.characters).toBe('承 認 ✓');
    expect(error.message).toContain('承 認 ✓');
  });

  it('refuses a stamp with nothing on it, and settings it does not know', async () => {
    const file = await pdfFile('x.pdf', [{}]);
    await expect(stampPdf(file, {})).rejects.toThrow('text or a picture');
    await expect(stampPdf(file, { text: '   ' })).rejects.toThrow('text or a picture');
    await expect(stampPdf(file, { text: 'A', position: 'middle' })).rejects.toThrow('is not a place');
    await expect(stampPdf(file, { text: 'A', size: 0 })).rejects.toThrow('size');
    await expect(stampPdf(file, { text: 'A', opacity: 1.5 })).rejects.toThrow('opacity');
    await expect(stampPdf(file, { text: 'A', rotation: 'tilted' })).rejects.toThrow('angle');
    await expect(stampPdf(file, { text: 'A', color: 'red' })).rejects.toThrow('colour');
    await expect(stampPdf(file, { text: 'A', position: 'custom', x: 120 })).rejects.toThrow('0 to 100');
    await expect(stampPdf(file, { text: 'A', pages: '9' })).rejects.toThrow('past the last page');
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    await expect(stampPdf(file, { image: gif })).rejects.toThrow('PNG or JPG');
  });

  it('stamps a PDF locked with a password', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 800]);
    doc.encrypt({ userPassword: 'abc', ownerPassword: 'own' });
    const locked = new File([await doc.save()], 'locked.pdf', { type: 'application/pdf' });
    const [page] = await readPages((await stampPdf(locked, { text: 'CONFIDENTIAL', password: 'abc' })).blob);
    expect(page.texts.map((t) => t.text)).toEqual(['CONFIDENTIAL']);
  });
});
