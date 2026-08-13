import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageEngine } from '../engine/image-engine.js';

/**
 * jsdom has no canvas backend, so these tests drive the hand-written encoders
 * through a minimal canvas stub. That is the code worth pinning down: the BMP
 * and ICO byte layouts are written by hand and a wrong offset produces a file
 * that still "downloads fine" but no viewer can open.
 */
function stubCanvas(width, height, rgba) {
  return {
    width,
    height,
    getContext: () => ({
      getImageData: () => ({ data: Uint8ClampedArray.from(rgba), width, height }),
      drawImage: () => {}
    })
  };
}

const BMP_HEADER_SIZE = 14;
const BMP_DIB_SIZE = 108;
const BMP_PIXEL_OFFSET = BMP_HEADER_SIZE + BMP_DIB_SIZE;

async function bytesOf(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ImageEngine.parseRgb', () => {
  it('parses long hex, short hex and rgb() notation', () => {
    expect(ImageEngine.parseRgb('#1e90ff')).toEqual({ r: 30, g: 144, b: 255 });
    expect(ImageEngine.parseRgb('#0f8')).toEqual({ r: 0, g: 255, b: 136 });
    expect(ImageEngine.parseRgb('rgb(12, 34, 56)')).toEqual({ r: 12, g: 34, b: 56 });
    expect(ImageEngine.parseRgb('rgba(12, 34, 56, 0.5)')).toEqual({ r: 12, g: 34, b: 56 });
  });

  it('passes through an already-parsed channel object', () => {
    const color = { r: 1, g: 2, b: 3 };
    expect(ImageEngine.parseRgb(color)).toBe(color);
  });

  it('rejects a colour it cannot understand', () => {
    expect(() => ImageEngine.parseRgb('cornflowerblue')).toThrow(/Unsupported colour/);
  });
});

describe('ImageEngine.encodeBmp', () => {
  it('writes a BITMAPV4HEADER with the declared sizes and masks', async () => {
    const width = 2;
    const height = 2;
    const pixels = new Uint8ClampedArray(width * height * 4).fill(0);
    const blob = ImageEngine.encodeBmp(stubCanvas(width, height, pixels));
    const bytes = await bytesOf(blob);
    const view = new DataView(bytes.buffer);

    expect(blob.type).toBe('image/bmp');
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('BM');
    expect(view.getUint32(2, true)).toBe(BMP_PIXEL_OFFSET + width * height * 4);
    expect(view.getUint32(10, true)).toBe(BMP_PIXEL_OFFSET);

    expect(view.getUint32(14, true)).toBe(BMP_DIB_SIZE);
    expect(view.getInt32(18, true)).toBe(width);
    expect(view.getInt32(22, true)).toBe(height);
    expect(view.getUint16(26, true)).toBe(1); // planes
    expect(view.getUint16(28, true)).toBe(32); // bits per pixel
    expect(view.getUint32(30, true)).toBe(3); // BI_BITFIELDS

    expect(view.getUint32(54, true)).toBe(0x00ff0000); // red
    expect(view.getUint32(58, true)).toBe(0x0000ff00); // green
    expect(view.getUint32(62, true)).toBe(0x000000ff); // blue
    expect(view.getUint32(66, true)).toBe(0xff000000); // alpha
  });

  it('stores pixels as BGRA in bottom-up row order', async () => {
    // Row 0 (top) is red then green; row 1 (bottom) is blue then translucent white.
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 255, 128
    ]);
    const bytes = await bytesOf(ImageEngine.encodeBmp(stubCanvas(2, 2, pixels)));
    const pixelData = bytes.slice(BMP_PIXEL_OFFSET);

    // The bottom source row must be written first.
    expect(Array.from(pixelData.slice(0, 4))).toEqual([255, 0, 0, 255]); // blue  -> B,G,R,A
    expect(Array.from(pixelData.slice(4, 8))).toEqual([255, 255, 255, 128]); // translucent white
    expect(Array.from(pixelData.slice(8, 12))).toEqual([0, 0, 255, 255]); // red   -> B,G,R,A
    expect(Array.from(pixelData.slice(12, 16))).toEqual([0, 255, 0, 255]); // green
  });

  it('preserves the alpha channel instead of flattening it', async () => {
    const pixels = new Uint8ClampedArray([10, 20, 30, 0]);
    const bytes = await bytesOf(ImageEngine.encodeBmp(stubCanvas(1, 1, pixels)));
    expect(bytes[BMP_PIXEL_OFFSET + 3]).toBe(0);
  });
});

describe('ImageEngine.encodeIco', () => {
  /** Stubs document.createElement('canvas') so frames encode to a known payload. */
  function stubIcoFrames(payload) {
    const original = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag !== 'canvas') return original(tag);
      const canvas = { width: 0, height: 0 };
      canvas.getContext = () => ({ drawImage: () => {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) });
      canvas.toBlob = (cb) => cb(new Blob([payload], { type: 'image/png' }));
      return canvas;
    });
  }

  it('emits one directory entry per standard size that fits the source', async () => {
    stubIcoFrames(new Uint8Array([137, 80, 78, 71]));
    const blob = await ImageEngine.encodeIco(stubCanvas(64, 64, new Uint8ClampedArray(4)));
    const bytes = await bytesOf(blob);
    const view = new DataView(bytes.buffer);

    expect(blob.type).toBe('image/x-icon');
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type: icon
    expect(view.getUint16(4, true)).toBe(4); // 16, 32, 48, 64

    const sizes = [];
    for (let i = 0; i < 4; i++) {
      sizes.push(view.getUint8(6 + i * 16));
    }
    expect(sizes).toEqual([16, 32, 48, 64]);
  });

  it('points every entry at its own payload and encodes 256 as 0', async () => {
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    stubIcoFrames(payload);
    const bytes = await bytesOf(await ImageEngine.encodeIco(stubCanvas(256, 256, new Uint8ClampedArray(4))));
    const view = new DataView(bytes.buffer);

    const count = view.getUint16(4, true);
    expect(count).toBe(6); // 16, 32, 48, 64, 128, 256

    // The 256px frame stores its dimensions as 0 per the ICO spec.
    const lastEntry = 6 + (count - 1) * 16;
    expect(view.getUint8(lastEntry)).toBe(0);
    expect(view.getUint8(lastEntry + 1)).toBe(0);

    let expectedOffset = 6 + count * 16;
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;
      expect(view.getUint16(entry + 4, true)).toBe(1); // planes
      expect(view.getUint16(entry + 6, true)).toBe(32); // bpp
      expect(view.getUint32(entry + 8, true)).toBe(payload.length);
      expect(view.getUint32(entry + 12, true)).toBe(expectedOffset);
      expect(Array.from(bytes.slice(expectedOffset, expectedOffset + payload.length))).toEqual(Array.from(payload));
      expectedOffset += payload.length;
    }
    expect(bytes.length).toBe(expectedOffset);
  });

  it('still produces one frame for an image smaller than every standard size', async () => {
    stubIcoFrames(new Uint8Array([9]));
    const bytes = await bytesOf(await ImageEngine.encodeIco(stubCanvas(10, 10, new Uint8ClampedArray(4))));
    expect(new DataView(bytes.buffer).getUint16(4, true)).toBe(1);
  });
});

describe('ImageEngine.encodeCanvas', () => {
  it('routes bmp and ico away from canvas.toBlob', async () => {
    const canvas = stubCanvas(1, 1, new Uint8ClampedArray([0, 0, 0, 255]));
    const bmp = await ImageEngine.encodeCanvas(canvas, 'bmp');
    expect(bmp.mimeType).toBe('image/bmp');
    // A PNG-in-disguise would start with the PNG signature instead of 'BM'.
    const bytes = await bytesOf(bmp.blob);
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('BM');
  });

  it('rejects a format nothing can encode', async () => {
    const canvas = stubCanvas(1, 1, new Uint8ClampedArray(4));
    await expect(ImageEngine.encodeCanvas(canvas, 'tiff')).rejects.toThrow(/Unsupported image format/);
  });
});

describe('ImageEngine.detectBorderColor', () => {
  /** Builds an image whose border is one colour and whose centre is another. */
  function framedImage(width, height, border, centre) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const onBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        const color = onBorder ? border : centre;
        const offset = (y * width + x) * 4;
        data[offset] = color[0];
        data[offset + 1] = color[1];
        data[offset + 2] = color[2];
        data[offset + 3] = 255;
      }
    }
    return data;
  }

  it('reports the dominant border colour, ignoring the subject', () => {
    const data = framedImage(8, 8, [255, 255, 255], [10, 10, 10]);
    expect(ImageEngine.detectBorderColor(data, 8, 8)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('averages sensor noise within a bucket rather than picking one pixel', () => {
    const data = framedImage(6, 6, [200, 200, 200], [0, 0, 0]);
    // Nudge two border pixels; they stay in the same 16-level bucket.
    data[0] = 204;
    data[4] = 196;
    const detected = ImageEngine.detectBorderColor(data, 6, 6);
    expect(detected.r).toBeGreaterThanOrEqual(199);
    expect(detected.r).toBeLessThanOrEqual(201);
  });
});

describe('ImageEngine.touchesBackground', () => {
  it('detects a background neighbour within the given radius', () => {
    // 3x3 grid, only the top-left pixel is background.
    const mask = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(ImageEngine.touchesBackground(mask, 4, 3, 3, 1)).toBe(true); // centre touches it diagonally
    expect(ImageEngine.touchesBackground(mask, 8, 3, 3, 1)).toBe(false); // opposite corner does not
    expect(ImageEngine.touchesBackground(mask, 8, 3, 3, 2)).toBe(true); // wider radius reaches it
  });

  it('does not read past the row edges', () => {
    const mask = new Uint8Array([0, 0, 1, 0, 0, 0]); // 3x2, background at (2,0)
    // Pixel (0,1) must not wrap around to the previous row's last column.
    expect(ImageEngine.touchesBackground(mask, 3, 3, 2, 1)).toBe(false);
  });
});

describe('ImageEngine.compressToTargetSize', () => {
  it('returns the largest attempt that fits the budget, not the last probe', async () => {
    // Blob size falls as quality falls; the binary search must keep the best fit.
    const convert = vi.spyOn(ImageEngine, 'convert').mockImplementation(async (file, { quality }) => ({
      blob: { size: Math.round(quality * 10000) },
      quality
    }));

    const result = await ImageEngine.compressToTargetSize({ name: 'a.jpg' }, 5); // 5120 bytes
    expect(convert).toHaveBeenCalled();
    expect(result.blob.size).toBeLessThanOrEqual(5120);
    expect(result.blob.size).toBeGreaterThan(4900);
  });

  it('falls back to the smallest attempt when nothing fits', async () => {
    vi.spyOn(ImageEngine, 'convert').mockImplementation(async (file, { quality }) => ({
      blob: { size: 900000 + Math.round(quality * 1000) },
      quality
    }));

    const result = await ImageEngine.compressToTargetSize({ name: 'a.jpg' }, 1);
    expect(result).not.toBeNull();
    expect(result.blob.size).toBeLessThan(901000);
  });
});
