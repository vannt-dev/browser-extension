// Test files made at run time, so the repository only carries the few PDFs that cannot be made
// here (see fixtures/NOTICE.md). Pictures are drawn by the browser under test, so the fonts are
// whatever that browser has, on any system.
import JSZip from 'jszip';
import sharp from 'sharp';
import {
  PDFDocument,
  PDFName,
  concatTransformationMatrix,
  drawObject,
  popGraphicsState,
  pushGraphicsState
} from 'pdf-lib';
import { newPage } from './cdp.mjs';

/** The sentences the generated text document carries, one heading per page. */
export const TEXT_DOC = {
  title: 'Offline kit sample document',
  pages: ['Alpha page of the offline kit', 'Bravo page with a figure', 'Charlie page, the last one']
};

/**
 * A three-page text PDF printed by the browser itself: embedded (subset) fonts, a vector figure
 * and a raster picture, the things a PDF -> PNG run has to draw.
 */
export async function textPdf(browser) {
  const sections = TEXT_DOC.pages
    .map(
      (
        heading,
        i
      ) => `<section style="page-break-after:${i < TEXT_DOC.pages.length - 1 ? 'always' : 'auto'}">
        <h2>${heading}</h2>
        <p style="font-family:serif">${'The quick brown fox jumps over the lazy dog. '.repeat(12)}</p>
        <svg width="400" height="160"><rect x="10" y="10" width="380" height="140" fill="none" stroke="black" stroke-width="4"/>
          <rect x="40" y="40" width="${100 + 80 * i}" height="80" fill="rgb(200,30,30)"/></svg>
        <p style="font-family:monospace">page ${i + 1} of ${TEXT_DOC.pages.length}</p>
      </section>`
    )
    .join('');
  const html = `<!doctype html><meta charset="utf-8"><title>${TEXT_DOC.title}</title>
    <body style="font-family:sans-serif"><h1>${TEXT_DOC.title}</h1>${sections}</body>`;
  const page = await newPage(
    browser,
    'data:text/html;base64,' + Buffer.from(html).toString('base64')
  );
  try {
    const { data } = await browser.send(
      'Page.printToPDF',
      { printBackground: true },
      page.sessionId
    );
    return Buffer.from(data, 'base64');
  } finally {
    await page.close();
  }
}

/**
 * Draws a picture on a canvas in a page and returns it as PNG bytes. `draw` is the body of a
 * function of (ctx, width, height); the canvas starts white with black ink.
 */
export async function picture(page, width, height, draw) {
  const base64 = await page.evaluate(`(async () => {
    const canvas = document.createElement("canvas"); canvas.width = ${width}; canvas.height = ${height};
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, ${width}, ${height}); ctx.fillStyle = "#000";
    ((ctx, width, height) => { ${draw} })(ctx, ${width}, ${height});
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let s = ""; for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  })()`);
  return Buffer.from(base64, 'base64');
}

/** The lines on each page of the generated scan; OCR has to read them back. */
export const SCAN_PAGES = [
  ['SCANNED PAGE ONE', 'Hello Scanner 2026'],
  ['SCANNED PAGE TWO', 'Fax group four']
];

/**
 * A two-page "scanned" PDF whose pages are 1-bit pictures stored as CCITT group 4, the way
 * scanners and fax software store them, so pdf.js has to run its fax decoder on them.
 */
export async function g4ScanPdf(page) {
  // 150 dpi A4, rounded to whole tiles so sharp writes each page as one CCITT tile.
  const [width, height] = [1232, 1744];
  const doc = await PDFDocument.create();
  for (const lines of SCAN_PAGES) {
    const png = await picture(
      page,
      width,
      height,
      `ctx.font = "bold 72px Arial, Helvetica, sans-serif";
       ${JSON.stringify(lines)}.forEach((line, i) => ctx.fillText(line, 120, 260 + i * 140));
       ctx.lineWidth = 8; ctx.strokeRect(120, 1200, 980, 300); ctx.fillRect(200, 1280, 400, 140);`
    );
    const tiff = await sharp(png)
      .flatten({ background: '#fff' })
      .toColourspace('b-w')
      .threshold(128)
      .tiff({
        compression: 'ccittfax4',
        bitdepth: 1,
        tile: true,
        tileWidth: width,
        tileHeight: height
      })
      .toBuffer();
    const { data, photometric } = singleTile(tiff, width, height);
    const image = doc.context.register(
      doc.context.stream(data, {
        Type: 'XObject',
        Subtype: 'Image',
        Width: width,
        Height: height,
        ColorSpace: 'DeviceGray',
        BitsPerComponent: 1,
        Filter: 'CCITTFaxDecode',
        // In the fax code "white" runs are 0 bits; TIFF photometric 1 says 0 is black.
        DecodeParms: { K: -1, Columns: width, Rows: height, BlackIs1: photometric === 1 }
      })
    );
    const [w, h] = [(width / 150) * 72, (height / 150) * 72];
    const pdfPage = doc.addPage([w, h]);
    pdfPage.node.setXObject(PDFName.of('Scan'), image);
    pdfPage.pushOperators(
      pushGraphicsState(),
      concatTransformationMatrix(w, 0, 0, h, 0, 0),
      drawObject('Scan'),
      popGraphicsState()
    );
  }
  return Buffer.from(await doc.save({ useObjectStreams: false }));
}

/** The compressed data of a one-tile TIFF (little or big endian), and its photometric value. */
function singleTile(tiff, width, height) {
  const little = tiff.toString('latin1', 0, 2) === 'II';
  const u16 = (at) => (little ? tiff.readUInt16LE(at) : tiff.readUInt16BE(at));
  const u32 = (at) => (little ? tiff.readUInt32LE(at) : tiff.readUInt32BE(at));
  const ifd = u32(4);
  const tags = new Map();
  for (let i = 0, n = u16(ifd); i < n; i++) {
    const at = ifd + 2 + i * 12;
    const [tag, type, count] = [u16(at), u16(at + 2), u32(at + 4)];
    // Single values sit in the entry itself; a SHORT is left-aligned in its four bytes.
    tags.set(tag, count === 1 ? (type === 3 ? u16(at + 8) : u32(at + 8)) : undefined);
  }
  const [w, h, compression] = [tags.get(256), tags.get(257), tags.get(259)];
  const [offset, length] = [tags.get(324), tags.get(325)];
  if (
    w !== width ||
    h !== height ||
    compression !== 4 ||
    offset === undefined ||
    length === undefined
  ) {
    throw new Error(
      `sharp did not write one CCITT G4 tile (${w}x${h}, compression ${compression})`
    );
  }
  return { data: tiff.subarray(offset, offset + length), photometric: tags.get(262) };
}

/** A minimal Word document holding one paragraph. */
export async function docx(sentence) {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );
  zip.file(
    'word/document.xml',
    '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:body><w:p><w:r><w:t>${sentence}</w:t></w:r></w:p></w:body></w:document>`
  );
  return zip.generateAsync({ type: 'nodebuffer' });
}
