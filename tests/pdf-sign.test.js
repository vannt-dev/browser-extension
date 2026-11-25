import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import sharp from 'sharp';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { signPdf } from '../engine/pdf-tools.js';
import { fromView, pageTurn, viewSize } from '../engine/page-view.js';
import {
  DEFAULT_SIGNATURE_WIDTH,
  MIN_SIGNATURE_WIDTH,
  checkPlacement,
  clearPaper,
  fitPlacement,
  inkBounds,
  isOpaque,
  movePlacement,
  placeAt,
  placementHeight,
  placementToPdf,
  resizePlacement,
} from '../engine/signature.js';

beforeAll(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  ).href;
});

const near = (actual, expected, digits = 6) => {
  for (const [key, value] of Object.entries(expected)) expect(actual[key], key).toBeCloseTo(value, digits);
};

describe('page-view', () => {
  it('turns any /Rotate into 0, 90, 180 or 270, and swaps the sides of a page turned a quarter', () => {
    expect([0, 90, 180, 270, 360, -90, 450, '90'].map(pageTurn)).toEqual([0, 90, 180, 270, 0, 270, 90, 90]);
    expect(viewSize({ width: 600, height: 800 }, 90)).toEqual({ width: 800, height: 600 });
    expect(viewSize({ width: 600, height: 800 }, -180)).toEqual({ width: 600, height: 800 });
    expect(fromView({ x: 0, y: 0, width: 600, height: 800 }, -90, 10, 20)).toEqual(
      fromView({ x: 0, y: 0, width: 600, height: 800 }, 270, 10, 20)
    );
  });
});

describe('placing a signature on the preview', () => {
  // A 600 x 800 point page shown at half size; a signature twice as wide as it is tall.
  const preview = { width: 300, height: 400 };
  const aspect = 0.5;

  it('centres a new signature on the click, a quarter of the page wide', () => {
    const placement = placeAt({ x: 150, y: 200 }, preview, { page: 2, aspect });
    expect(placement.page).toBe(2);
    expect(placement.width).toBe(DEFAULT_SIGNATURE_WIDTH);
    // Its height as a share of the page: 0.25 * 0.5 * (600 / 800).
    expect(placementHeight(placement.width, aspect, 0.75)).toBeCloseTo(0.09375);
    near(placement, { x: 0.375, y: 0.453125 });
  });

  it('keeps a signature clicked near an edge wholly on the page', () => {
    const corner = placeAt({ x: 299, y: 399 }, preview, { page: 1, aspect });
    near(corner, { x: 0.75, y: 1 - 0.09375 });
    const origin = placeAt({ x: 0, y: 0 }, preview, { page: 1, aspect });
    near(origin, { x: 0, y: 0 });
  });

  it('makes a tall signature narrower so it fits the page', () => {
    const tall = fitPlacement({ page: 1, x: 0, y: 0, width: 1 }, { aspect: 3, ratio: 0.75 });
    expect(tall.width).toBeCloseTo(1 / 2.25);
    expect(placementHeight(tall.width, 3, 0.75)).toBeCloseTo(1);
    expect(fitPlacement({ page: 1, x: 0, y: 0, width: 0.001 }, { aspect, ratio: 0.75 }).width).toBe(MIN_SIGNATURE_WIDTH);
  });

  it('moves by the pixels dragged, and stops at the edges', () => {
    const from = { page: 1, x: 0.4, y: 0.4, width: 0.2 };
    near(movePlacement(from, 30, -40, preview, aspect), { x: 0.5, y: 0.3, width: 0.2 });
    near(movePlacement(from, -500, 900, preview, aspect), { x: 0, y: 1 - placementHeight(0.2, aspect, 0.75) });
  });

  it('resizes from the bottom-right corner, keeping the top-left one, within the page', () => {
    const from = { page: 1, x: 0.2, y: 0.1, width: 0.2 };
    near(resizePlacement(from, { x: 180, y: 0 }, preview, aspect), { x: 0.2, y: 0.1, width: 0.4 });
    // Dragged down more than across: the height leads.
    const down = resizePlacement(from, { x: 0, y: 0.1 * 400 + 0.3 * 400 }, preview, aspect);
    expect(placementHeight(down.width, aspect, 0.75)).toBeCloseTo(0.3);
    near(resizePlacement(from, { x: 5000, y: 5000 }, preview, aspect), { x: 0.2, y: 0.1, width: 0.8 });
    expect(resizePlacement(from, { x: 0, y: 0 }, preview, aspect).width).toBe(MIN_SIGNATURE_WIDTH);
  });
});

describe('from the preview to the PDF page, in points', () => {
  const aspect = 0.5;

  it('puts the signature where it was clicked on an upright page', () => {
    // Clicked in the middle of a 600 x 800 page shown at 300 x 400 px.
    const placement = placeAt({ x: 150, y: 200 }, { width: 300, height: 400 }, { page: 1, aspect });
    const at = placementToPdf(placement, { box: { x: 0, y: 0, width: 600, height: 800 }, angle: 0 }, aspect);
    near(at, { x: 225, y: 362.5, width: 150, height: 75, rotate: 0 });
  });

  it('counts from the crop box, the part of the page that shows', () => {
    const at = placementToPdf(
      { x: 0, y: 0, width: 0.5 },
      { box: { x: 50, y: 100, width: 500, height: 600 }, angle: 0 },
      aspect
    );
    near(at, { x: 50, y: 575, width: 250, height: 125, rotate: 0 });
  });

  it('stands upright at the place seen on pages turned 90, 180 and 270 degrees', () => {
    const box = { x: 0, y: 0, width: 600, height: 800 };
    // Seen 800 x 600: 200 x 100 points, its corner 80 from the left and 120 from the top.
    near(placementToPdf({ x: 0.1, y: 0.2, width: 0.25 }, { box, angle: 90 }, aspect), {
      x: 220,
      y: 80,
      width: 200,
      height: 100,
      rotate: 90,
    });
    // Seen as stored but upside down: the top left as seen is the stored bottom right.
    near(placementToPdf({ x: 0, y: 0, width: 0.5 }, { box, angle: 180 }, aspect), {
      x: 600,
      y: 150,
      width: 300,
      height: 150,
      rotate: 180,
    });
    near(placementToPdf({ x: 0, y: 0, width: 0.25 }, { box, angle: 270 }, aspect), {
      x: 500,
      y: 800,
      width: 200,
      height: 100,
      rotate: 270,
    });
  });

  it('has the signature centred on the click whatever the turn and crop of the page', () => {
    const boxes = [
      { x: 0, y: 0, width: 600, height: 800 },
      { x: 40, y: 70, width: 500, height: 300 },
    ];
    for (const box of boxes) {
      for (const angle of [0, 90, 180, 270]) {
        const view = viewSize(box, angle);
        const preview = { width: view.width * 0.7, height: view.height * 0.7 };
        const click = { x: preview.width * 0.4, y: preview.height * 0.35 };
        const placement = placeAt(click, preview, { page: 1, aspect, width: 0.2 });
        const at = placementToPdf(placement, { box, angle }, aspect);
        // The centre of the drawn picture: its corner plus half its size, turned with it.
        const turn = (at.rotate * Math.PI) / 180;
        const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
        const centre = {
          x: at.x + (at.width / 2) * cos - (at.height / 2) * sin,
          y: at.y + (at.width / 2) * sin + (at.height / 2) * cos,
        };
        // The same point as seen: back through the page's turn.
        const seen = fromView(box, angle, view.width * 0.4, view.height * (1 - 0.35));
        expect(centre.x, `${angle} ${JSON.stringify(box)}`).toBeCloseTo(seen.x, 6);
        expect(centre.y, `${angle} ${JSON.stringify(box)}`).toBeCloseTo(seen.y, 6);
      }
    }
  });

  it('refuses a placement off the PDF', () => {
    expect(() => checkPlacement({ page: 3, x: 0, y: 0, width: 0.2 }, 2, 'a.pdf')).toThrow('There is no page 3: a.pdf has pages 1 to 2.');
    expect(() => checkPlacement({ page: 1.5, x: 0, y: 0, width: 0.2 }, 2)).toThrow('no page');
    expect(() => checkPlacement({ page: 1, x: -0.1, y: 0, width: 0.2 }, 2)).toThrow('0 to 1');
    expect(() => checkPlacement({ page: 1, x: 0, y: 0, width: 0 }, 2)).toThrow('as wide as the page');
    expect(() => checkPlacement({ page: 1, x: 0, y: 0, width: 0.2 }, 2)).not.toThrow();
  });
});

describe('the ink of a signature picture', () => {
  /** A width x height RGBA picture, see-through, with the pixels given painted. */
  function picture(width, height, painted = [], colour = [20, 20, 20, 255]) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (const [x, y] of painted) data.set(colour, (y * width + x) * 4);
    return { data, width, height };
  }

  it('finds the box around the ink, with a little room', () => {
    const image = picture(10, 6, [[3, 2], [6, 4]]);
    expect(inkBounds(image, 1)).toEqual({ x: 2, y: 1, width: 6, height: 5 });
    expect(inkBounds(image, 0)).toEqual({ x: 3, y: 2, width: 4, height: 3 });
    // The room stops at the picture's edges.
    expect(inkBounds(picture(4, 4, [[0, 0], [3, 3]]), 5)).toEqual({ x: 0, y: 0, width: 4, height: 4 });
  });

  it('finds no ink in an empty picture, and ignores near see-through pixels', () => {
    expect(inkBounds(picture(8, 8))).toBeNull();
    expect(inkBounds(picture(8, 8, [[2, 2]], [0, 0, 0, 5]))).toBeNull();
  });

  it('takes the paper away from a picture of a signature on white, not the ink', () => {
    const scan = picture(6, 3, [], [255, 255, 255, 255]);
    scan.data.fill(250);
    for (let i = 3; i < scan.data.length; i += 4) scan.data[i] = 255;
    scan.data.set([30, 30, 140, 255], (1 * 6 + 2) * 4);
    expect(isOpaque(scan)).toBe(true);
    clearPaper(scan);
    expect(isOpaque(scan)).toBe(false);
    expect(inkBounds(scan, 0)).toEqual({ x: 2, y: 1, width: 1, height: 1 });
    expect([...scan.data.subarray((1 * 6 + 2) * 4, (1 * 6 + 2) * 4 + 4)]).toEqual([30, 30, 140, 255]);
  });
});

// ---------------------------------------------------------------- signPdf, read back with pdf.js

async function pdfFile(name, pages) {
  const doc = await PDFDocument.create();
  for (const { size = [600, 800], rotate = 0, crop } of pages) {
    const page = doc.addPage(size);
    page.setRotation(degrees(rotate));
    if (crop) page.setCropBox(...crop);
  }
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

/** A see-through 80 x 40 PNG with a dark bar in it: a signature, twice as wide as it is tall. */
const signaturePng = () =>
  sharp({ create: { width: 80, height: 40, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      {
        input: { create: { width: 60, height: 10, channels: 4, background: { r: 20, g: 40, b: 160, alpha: 1 } } },
        left: 10,
        top: 15,
      },
    ])
    .png()
    .toBuffer();

const multiply = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/** Every picture painted on each page, as the box it covers on the page as seen (shares, from the top left). */
async function picturesOnPages(blob) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const view = page.getViewport({ scale: 1 });
    const { fnArray, argsArray } = await page.getOperatorList();
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    const boxes = [];
    fnArray.forEach((fn, i) => {
      if (fn === pdfjsLib.OPS.save) stack.push(ctm);
      else if (fn === pdfjsLib.OPS.restore) ctm = stack.pop() ?? ctm;
      else if (fn === pdfjsLib.OPS.transform) ctm = multiply(ctm, argsArray[i]);
      else if (fn === pdfjsLib.OPS.paintImageXObject) {
        const m = multiply(view.transform, ctm);
        const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]]);
        const xs = corners.map(([x]) => x / view.width);
        const ys = corners.map(([, y]) => y / view.height);
        boxes.push({ x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) });
      }
    });
    pages.push(boxes);
  }
  return pages;
}

describe('signPdf', () => {
  it('puts the signature on the pages asked, where it was placed, upright on turned and cropped pages', async () => {
    const file = await pdfFile('contract.pdf', [
      {},
      { rotate: 90 },
      {},
      { size: [900, 1200], crop: [150, 200, 600, 800], rotate: 270 },
    ]);
    const placements = [
      { page: 1, x: 0.1, y: 0.7, width: 0.3 },
      { page: 2, x: 0.6, y: 0.1, width: 0.25 },
      { page: 4, x: 0.5, y: 0.5, width: 0.2 },
      { page: 1, x: 0.6, y: 0.05, width: 0.2 },
    ];
    const result = await signPdf(file, { image: await signaturePng(), placements });
    expect(result.filename).toBe('contract_signed.pdf');
    expect(result.pageCount).toBe(4);
    const pages = await picturesOnPages(result.blob);
    expect(pages.map((boxes) => boxes.length)).toEqual([2, 1, 0, 1]);
    const ratios = [600 / 800, 800 / 600, 600 / 800, 800 / 600];
    const expected = (page, index) => {
      const { x, y, width } = placements.filter((each) => each.page === page)[index];
      return { x, y, width, height: placementHeight(width, 0.5, ratios[page - 1]) };
    };
    near(pages[0][0], expected(1, 0), 3);
    near(pages[0][1], expected(1, 1), 3);
    near(pages[1][0], expected(2, 0), 3);
    near(pages[3][0], expected(4, 0), 3);

    // One picture with its see-through mask, however many places it is on.
    const text = Buffer.from(await result.blob.arrayBuffer()).toString('latin1');
    expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
    expect(text).toContain('/SMask');
  });

  it('takes the signature as a File or a Blob, and signs a PDF locked with a password', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 800]);
    doc.encrypt({ userPassword: 'abc', ownerPassword: 'own' });
    const locked = new File([await doc.save()], 'locked.pdf', { type: 'application/pdf' });
    const image = new File([await signaturePng()], 'me.png', { type: 'image/png' });
    const result = await signPdf(locked, { image, placements: [{ page: 1, x: 0, y: 0, width: 0.5 }], password: 'abc' });
    const text = Buffer.from(await result.blob.arrayBuffer()).toString('latin1');
    expect(text).not.toContain('/Encrypt');
    expect((await picturesOnPages(result.blob))[0]).toHaveLength(1);
  });

  it('refuses no signature, no place, a place off the PDF, and a picture that is not a PNG', async () => {
    const file = await pdfFile('x.pdf', [{}, {}]);
    const image = await signaturePng();
    const place = [{ page: 1, x: 0, y: 0, width: 0.2 }];
    await expect(signPdf(file, { placements: place })).rejects.toThrow('signature first');
    await expect(signPdf(file, { image, placements: [] })).rejects.toThrow('on a page first');
    await expect(signPdf(file, { image, placements: [{ ...place[0], page: 3 }] })).rejects.toThrow('There is no page 3');
    const jpg = await sharp(image).jpeg().toBuffer();
    await expect(signPdf(file, { image: jpg, placements: place })).rejects.toThrow('PNG');
  });
});
