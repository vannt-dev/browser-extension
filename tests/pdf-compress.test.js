import { describe, it, expect } from 'vitest';
import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
import { PDFDocument, PDFName, PDFRawStream, StandardFonts } from '@cantoo/pdf-lib';
import { COMPRESS_LEVELS, compressPdf, withoutExif } from '../engine/pdf-tools.js';
import { PDF_PASSWORD_NEEDED } from '../engine/pdf-password.js';

/**
 * Real PDFs in, real PDFs out. jsdom has no canvas, so the step that turns pixels into a smaller
 * JPEG is done here by sharp, through the same `recode` hook the browser's canvas fills in the
 * extension. What is pinned down is the PDF side: which images are taken, what they are given to
 * the recoder as, and how the new JPEG goes back in while the pages stay as they were.
 */

/** Noisy pixels compress badly, like a photo or a scan: `channels` bytes per pixel. */
function noise(width, height, channels, seed = 1) {
  const data = Buffer.alloc(width * height * channels);
  let x = seed;
  for (let i = 0; i < data.length; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    // Smooth-ish noise: a gradient plus a little grain, so a JPEG of it is still large at q95.
    data[i] = ((i / channels) % width) / 8 + (x >> 24);
  }
  return data;
}

const photoJpeg = (width = 1600, height = 1200) =>
  sharp(noise(width, height, 3), { raw: { width, height, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();

/** The recoder the extension's canvas stands for: scale down to `maxSide`, write a JPEG. */
function sharpRecode(calls = []) {
  return async (source, { maxSide, quality }) => {
    calls.push(source);
    const input =
      source.kind === 'jpeg'
        ? sharp(source.bytes)
        : sharp(source.data, { raw: { width: source.width, height: source.height, channels: source.channels } });
    const { data, info } = await input
      .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb')
      .jpeg({ quality: Math.round(quality * 100) })
      .toBuffer({ resolveWithObject: true });
    return { bytes: new Uint8Array(data), width: info.width, height: info.height };
  };
}

const TEXT = 'Quarterly report: text that stays text';

/** A Letter page with a line of text and, under it, whatever `draw` puts on it. */
async function pdfWith(draw, { encrypt } = {}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(TEXT, { x: 50, y: 740, size: 14, font });
  await draw?.(doc, page);
  if (encrypt) doc.encrypt({ userPassword: encrypt, ownerPassword: 'owner-secret' });
  return new File([await doc.save()], 'report.pdf', { type: 'application/pdf' });
}

/** Every image stream of a PDF, by its object number. */
async function images(blob) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  const found = [];
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    if (object.dict.get(PDFName.of('Subtype'))?.toString() !== '/Image') continue;
    const value = (key) => object.dict.get(PDFName.of(key))?.toString();
    found.push({
      ref: ref.toString(),
      filter: value('Filter'),
      colorSpace: value('ColorSpace'),
      width: Number(value('Width')),
      height: Number(value('Height')),
      smask: value('SMask'),
      bytes: object.contents,
    });
  }
  return { doc, found };
}

/** The decoded content stream of the first page: what draws its text and images. */
async function firstPageContent(blob) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  const contents = doc.getPage(0).node.Contents();
  const streams = contents.asArray ? contents.asArray().map((ref) => doc.context.lookup(ref)) : [contents];
  const { decodePDFRawStream } = await import('@cantoo/pdf-lib');
  return streams.map((stream) => new TextDecoder('latin1').decode(decodePDFRawStream(stream).decode())).join('\n');
}

describe('compressPdf', () => {
  it('re-encodes a large photo as a smaller, downscaled JPEG and keeps the page as it was', async () => {
    const jpeg = await photoJpeg();
    const file = await pdfWith(async (doc, page) => {
      const image = await doc.embedJpg(jpeg);
      page.drawImage(image, { x: 50, y: 100, width: 512, height: 384 });
    });

    const result = await compressPdf(file, { level: 'low', recode: sharpRecode() });

    expect(result.smaller).toBe(true);
    expect(result.filename).toBe('report_compressed.pdf');
    expect(result.pageCount).toBe(1);
    expect(result.originalSize).toBe(file.size);
    expect(result.compressedSize).toBe(result.blob.size);
    expect(result.compressedSize).toBeLessThan(file.size / 2);
    expect(result.imagesCompressed).toBe(1);

    const { found } = await images(result.blob);
    expect(found).toHaveLength(1);
    const [image] = found;
    expect(image.filter).toBe('/DCTDecode');
    expect(image.colorSpace).toBe('/DeviceRGB');
    // Low: 96 pixels per inch of the 11-inch side of the page.
    expect(Math.max(image.width, image.height)).toBe(Math.round((792 / 72) * COMPRESS_LEVELS.low.dpi));
    const meta = await sharp(image.bytes).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', image.width, image.height]);

    // The text is still drawn with the font, so it can still be selected and searched.
    expect(await firstPageContent(result.blob)).toBe(await firstPageContent(file));
    const out = await PDFDocument.load(await result.blob.arrayBuffer());
    expect(out.getPage(0).node.Resources().lookup(PDFName.of('Font')).keys().length).toBe(1);
  });

  it('takes higher levels to more pixels and a better JPEG', async () => {
    const jpeg = await photoJpeg();
    const file = await pdfWith(async (doc, page) => {
      page.drawImage(await doc.embedJpg(jpeg), { x: 50, y: 100, width: 512, height: 384 });
    });
    const sizes = {};
    for (const level of ['low', 'medium', 'high']) {
      const calls = [];
      const result = await compressPdf(file, { level, recode: sharpRecode(calls) });
      sizes[level] = result.compressedSize;
    }
    expect(sizes.low).toBeLessThan(sizes.medium);
    expect(sizes.medium).toBeLessThan(sizes.high);
    expect(COMPRESS_LEVELS.low.quality).toBeLessThan(COMPRESS_LEVELS.medium.quality);
    expect(COMPRESS_LEVELS.medium.quality).toBeLessThan(COMPRESS_LEVELS.high.quality);
  });

  it('re-encodes a lossless (Flate) image and leaves its transparency mask alone', async () => {
    const width = 900;
    const height = 700;
    const rgba = noise(width, height, 4, 7);
    for (let i = 3; i < rgba.length; i += 4) rgba[i] = i % 5 === 0 ? 0 : 255;
    const png = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
    const file = await pdfWith(async (doc, page) => {
      page.drawImage(await doc.embedPng(png), { x: 50, y: 100, width: 450, height: 350 });
    });
    const before = await images(file);
    const mask = before.found.find((image) => image.colorSpace === '/DeviceGray');
    expect(mask).toBeTruthy();

    const calls = [];
    const result = await compressPdf(file, { level: 'medium', recode: sharpRecode(calls) });

    expect(result.smaller).toBe(true);
    // The recoder got the colour pixels, unpacked, and never the mask.
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ kind: 'pixels', width, height, channels: 3 });
    expect(calls[0].data.length).toBe(width * height * 3);
    const after = await images(result.blob);
    const colour = after.found.find((image) => image.smask);
    expect(colour.filter).toBe('/DCTDecode');
    expect(colour.smask).toBe(before.found.find((image) => image.smask).smask);
    const keptMask = after.found.find((image) => image.colorSpace === '/DeviceGray');
    expect(keptMask.filter).toBe('/FlateDecode');
    expect(Buffer.from(keptMask.bytes).equals(Buffer.from(mask.bytes))).toBe(true);
  });

  it('undoes PNG predictors before handing the pixels over', async () => {
    const width = 300;
    const height = 200;
    const pixels = noise(width, height, 3, 3);
    // Each row: filter type 2 (Up), then the difference with the row above.
    const rows = [];
    for (let y = 0; y < height; y++) {
      const row = Buffer.alloc(1 + width * 3);
      row[0] = 2;
      for (let i = 0; i < width * 3; i++) {
        const above = y ? pixels[(y - 1) * width * 3 + i] : 0;
        row[1 + i] = (pixels[y * width * 3 + i] - above) & 0xff;
      }
      rows.push(row);
    }
    const file = await pdfWith(async (doc, page) => {
      const stream = doc.context.stream(new Uint8Array(deflateSync(Buffer.concat(rows))), {
        Type: 'XObject',
        Subtype: 'Image',
        Width: width,
        Height: height,
        BitsPerComponent: 8,
        ColorSpace: 'DeviceRGB',
        Filter: 'FlateDecode',
        DecodeParms: { Predictor: 15, Colors: 3, Columns: width, BitsPerComponent: 8 },
      });
      const ref = doc.context.register(stream);
      page.node.newXObject('Im1', ref);
    });

    const calls = [];
    await compressPdf(file, { level: 'high', recode: sharpRecode(calls) });

    expect(calls).toHaveLength(1);
    expect(Buffer.from(calls[0].data).equals(pixels)).toBe(true);
  });

  it('leaves alone the images it cannot re-encode faithfully', async () => {
    const width = 400;
    const height = 300;
    const flate = (extra, channels = 3) => ({
      contents: new Uint8Array(deflateSync(noise(width, height, channels, 5))),
      dict: { Type: 'XObject', Subtype: 'Image', Width: width, Height: height, BitsPerComponent: 8, Filter: 'FlateDecode', ...extra },
    });
    const cmyk = await sharp(noise(width, height, 3, 9), { raw: { width, height, channels: 3 } })
      .toColourspace('cmyk')
      .jpeg({ quality: 95 })
      .toBuffer();
    const kinds = [
      flate({ ColorSpace: 'DeviceCMYK' }, 4),
      { contents: new Uint8Array(cmyk), dict: { Type: 'XObject', Subtype: 'Image', Width: width, Height: height, BitsPerComponent: 8, ColorSpace: 'DeviceCMYK', Filter: 'DCTDecode' } },
      flate({ ColorSpace: 'DeviceRGB', Decode: [1, 0, 1, 0, 1, 0] }),
      flate({ ColorSpace: 'DeviceRGB', BitsPerComponent: 16 }),
      flate({ ImageMask: true, BitsPerComponent: 1 }, 1),
      // The one picture here that can be re-encoded, so the test sees the others are passed over.
      flate({ ColorSpace: 'DeviceRGB' }),
    ];
    const file = await pdfWith(async (doc, page) => {
      kinds.forEach(({ contents, dict }, index) => {
        page.node.newXObject(`Im${index}`, doc.context.register(doc.context.stream(contents, dict)));
      });
    });

    const calls = [];
    const result = await compressPdf(file, { level: 'low', recode: sharpRecode(calls) });

    expect(calls.map((call) => call.kind)).toEqual(['pixels']);
    expect(result.imagesCompressed).toBe(1);
  });

  it('keeps an image whose new JPEG would be larger', async () => {
    const jpeg = await sharp(noise(800, 600, 3), { raw: { width: 800, height: 600, channels: 3 } }).jpeg({ quality: 30 }).toBuffer();
    const file = await pdfWith(async (doc, page) => {
      page.drawImage(await doc.embedJpg(jpeg), { x: 50, y: 100, width: 400, height: 300 });
    });
    const bigger = async (source) => ({ bytes: new Uint8Array(source.bytes.length + 5000), width: 800, height: 600 });

    const result = await compressPdf(file, { level: 'high', recode: bigger });

    expect(result.imagesCompressed).toBe(0);
    const { found } = await images(result.smaller ? result.blob : file);
    expect(Buffer.from(found[0].bytes).equals(jpeg)).toBe(true);
  });

  it('says so and gives back the original when nothing gets smaller', async () => {
    const file = await pdfWith();

    const result = await compressPdf(file, { level: 'low', recode: sharpRecode() });

    expect(result.smaller).toBe(false);
    expect(result.blob).toBe(file);
    expect(result.filename).toBe('report.pdf');
    expect(result.compressedSize).toBe(file.size);
    expect(result.originalSize).toBe(file.size);
  });

  it('opens a PDF locked with a password and hands over decrypted images', async () => {
    const jpeg = await photoJpeg(1200, 900);
    const file = await pdfWith(
      async (doc, page) => page.drawImage(await doc.embedJpg(jpeg), { x: 50, y: 100, width: 400, height: 300 }),
      { encrypt: 'open-me' }
    );
    await expect(compressPdf(file, { recode: sharpRecode() })).rejects.toMatchObject({ code: PDF_PASSWORD_NEEDED });

    const calls = [];
    const result = await compressPdf(file, { level: 'low', password: 'open-me', recode: sharpRecode(calls) });

    expect(calls).toHaveLength(1);
    expect(Buffer.from(calls[0].bytes).equals(jpeg)).toBe(true);
    expect(result.smaller).toBe(true);
    expect(/\/Encrypt/.test(new TextDecoder('latin1').decode(await result.blob.arrayBuffer()))).toBe(false);
  });

  it('refuses a level it does not know', async () => {
    await expect(compressPdf(await pdfWith(), { level: 'extreme' })).rejects.toThrow(/extreme/);
  });
});

describe('withoutExif', () => {
  it('drops the EXIF block, so a browser decodes the picture unturned, as a PDF viewer draws it', async () => {
    const raw = { width: 64, height: 32, channels: 3 };
    const turned = await sharp(noise(64, 32, 3), { raw }).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    expect((await sharp(turned).metadata()).orientation).toBe(6);

    const plain = withoutExif(new Uint8Array(turned));

    const meta = await sharp(plain).metadata();
    expect(meta.orientation).toBeUndefined();
    expect([meta.width, meta.height]).toEqual([64, 32]);
    const pixels = async (bytes) => sharp(bytes).raw().toBuffer();
    expect((await pixels(plain)).equals(await pixels(turned))).toBe(true);
  });

  it('gives back a JPEG without EXIF, and anything that is not a JPEG, as it is', async () => {
    const jpeg = new Uint8Array(await sharp(noise(16, 16, 3), { raw: { width: 16, height: 16, channels: 3 } }).jpeg().toBuffer());
    expect(withoutExif(jpeg)).toBe(jpeg);
    const other = new Uint8Array([1, 2, 3]);
    expect(withoutExif(other)).toBe(other);
  });
});
