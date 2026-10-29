import { describe, it, expect, vi, afterEach } from 'vitest';
import { ImageEngine } from '../engine/image-engine.js';

/**
 * jsdom has no canvas backend. Cropping and flipping are drawn by the canvas itself (a source
 * rectangle and a mirroring transform), so these tests give the engine a small canvas that follows
 * the same rules for whole-pixel copies: the transform maps each pixel's centre to the pixel it
 * lands on. A wrong transform or source rectangle puts the wrong colour in the wrong place here,
 * as it would in the browser. The offline kit runs the same work in a real Chromium.
 */
const RED = [255, 0, 0, 255];
const BLUE = [0, 0, 255, 255];
const GREEN = [0, 255, 0, 255];
const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];
const CLEAR = [0, 0, 0, 0];

/** A picture of four flat quadrants: red top left, blue top right, green bottom left, black bottom right. */
function quadrants(width, height) {
  return {
    naturalWidth: width,
    naturalHeight: height,
    pixel(x, y) {
      const right = x >= width / 2;
      const bottom = y >= height / 2;
      if (!bottom) return right ? BLUE : RED;
      return right ? BLACK : GREEN;
    }
  };
}

function fakeCanvas() {
  const canvas = { width: 0, height: 0, pixels: null };
  let m = { a: 1, d: 1, e: 0, f: 0 };
  const grid = () => {
    if (!canvas.pixels) canvas.pixels = Array.from({ length: canvas.width * canvas.height }, () => CLEAR);
    return canvas.pixels;
  };
  const set = (ux, uy, value) => {
    const x = Math.floor(m.a * (ux + 0.5) + m.e);
    const y = Math.floor(m.d * (uy + 0.5) + m.f);
    if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) grid()[y * canvas.width + x] = value;
  };
  const ctx = {
    fillStyle: '#000000',
    setTransform(a, b, c, d, e, f) {
      if (b || c) throw new Error('the fake canvas only scales and moves');
      m = { a, d, e, f };
    },
    fillRect(x, y, w, h) {
      const color = this.fillStyle === '#ffffff' ? WHITE : [1, 2, 3, 255];
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, color);
    },
    drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (dw !== sw || dh !== sh) throw new Error('the fake canvas does not resample');
      for (let j = 0; j < sh; j++) {
        for (let i = 0; i < sw; i++) {
          const color = src.pixel(sx + i, sy + j);
          // Drawing composites: a clear source pixel leaves the matte under it.
          if (color[3] > 0) set(dx + i, dy + j, color);
        }
      }
    }
  };
  canvas.getContext = () => ctx;
  canvas.toBlob = (callback, type) => {
    grid();
    const body = JSON.stringify({ width: canvas.width, height: canvas.height, pixels: canvas.pixels });
    callback(new Blob([body], { type }));
  };
  return canvas;
}

function useFakes(image) {
  vi.spyOn(ImageEngine, 'loadImage').mockResolvedValue(image);
  const original = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => (tag === 'canvas' ? fakeCanvas() : original(tag)));
}

/** The colour at (x, y) of a picture the fake canvas wrote. */
async function readBack(blob) {
  const { width, height, pixels } = JSON.parse(await blob.text());
  return { width, height, at: (x, y) => pixels[y * width + x] };
}

const file = (name) => new File([new Uint8Array([0])], name);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ImageEngine.cropRect', () => {
  it('is the whole picture when no area is given', () => {
    expect(ImageEngine.cropRect(null, 40, 30)).toEqual({ x: 0, y: 0, width: 40, height: 30 });
  });

  it('rounds to whole pixels and keeps the area inside the picture', () => {
    expect(ImageEngine.cropRect({ x: 10.4, y: 4.6, width: 20.5, height: 9.2 }, 40, 30)).toEqual({ x: 10, y: 5, width: 21, height: 9 });
    expect(ImageEngine.cropRect({ x: -5, y: -1, width: 100, height: 100 }, 40, 30)).toEqual({ x: 0, y: 0, width: 40, height: 30 });
    expect(ImageEngine.cropRect({ x: 30, y: 20, width: 50, height: 50 }, 40, 30)).toEqual({ x: 30, y: 20, width: 10, height: 10 });
  });

  it('takes a missing width or height as "to the edge"', () => {
    expect(ImageEngine.cropRect({ x: 10, y: 5 }, 40, 30)).toEqual({ x: 10, y: 5, width: 30, height: 25 });
  });

  it('refuses an area with nothing in it', () => {
    expect(() => ImageEngine.cropRect({ x: 0, y: 0, width: 0, height: 10 }, 40, 30)).toThrow(/empty/);
    expect(() => ImageEngine.cropRect({ x: 40, y: 0, width: 5, height: 5 }, 40, 30)).toThrow(/empty/);
  });
});

describe('ImageEngine.editFormat', () => {
  it('keeps the formats it can write back', () => {
    expect(ImageEngine.editFormat('a.PNG')).toBe('png');
    expect(ImageEngine.editFormat('photo.jpeg')).toBe('jpeg');
    expect(ImageEngine.editFormat('photo.jpg')).toBe('jpg');
    expect(ImageEngine.editFormat('x.webp')).toBe('webp');
    expect(ImageEngine.editFormat('x.bmp')).toBe('bmp');
  });

  it('writes PNG for the rest', () => {
    for (const name of ['anim.gif', 'iphone.heic', 'x.avif', 'logo.svg', 'favicon.ico', 'png']) {
      expect(ImageEngine.editFormat(name), name).toBe('png');
    }
  });
});

describe('ImageEngine.cropAndFlip', () => {
  it('crops to the area asked for', async () => {
    useFakes(quadrants(8, 6));
    const res = await ImageEngine.cropAndFlip(file('shapes.png'), { crop: { x: 2, y: 1, width: 4, height: 4 } });
    const out = await readBack(res.blob);

    expect([res.width, res.height, out.width, out.height]).toEqual([4, 4, 4, 4]);
    expect(out.at(0, 0)).toEqual(RED); // source (2, 1)
    expect(out.at(3, 0)).toEqual(BLUE); // source (5, 1)
    expect(out.at(0, 3)).toEqual(GREEN); // source (2, 4)
    expect(out.at(3, 3)).toEqual(BLACK); // source (5, 4)
    expect(res.format).toBe('png');
    expect(res.mimeType).toBe('image/png');
    expect(res.filename).toBe('shapes_edited.png');
  });

  it('flips left to right', async () => {
    useFakes(quadrants(8, 6));
    const out = await readBack((await ImageEngine.cropAndFlip(file('a.png'), { flipHorizontal: true })).blob);
    expect([out.width, out.height]).toEqual([8, 6]);
    expect(out.at(0, 0)).toEqual(BLUE);
    expect(out.at(7, 0)).toEqual(RED);
    expect(out.at(0, 5)).toEqual(BLACK);
    expect(out.at(7, 5)).toEqual(GREEN);
  });

  it('flips top to bottom', async () => {
    useFakes(quadrants(8, 6));
    const out = await readBack((await ImageEngine.cropAndFlip(file('a.png'), { flipVertical: true })).blob);
    expect(out.at(0, 0)).toEqual(GREEN);
    expect(out.at(7, 0)).toEqual(BLACK);
    expect(out.at(0, 5)).toEqual(RED);
    expect(out.at(7, 5)).toEqual(BLUE);
  });

  it('crops first, then flips the part that was kept both ways', async () => {
    useFakes(quadrants(8, 6));
    // The right half of the top row of quadrants and one row of the bottom: blue over black.
    const res = await ImageEngine.cropAndFlip(file('a.png'), {
      crop: { x: 4, y: 0, width: 4, height: 4 },
      flipHorizontal: true,
      flipVertical: true
    });
    const out = await readBack(res.blob);
    expect([out.width, out.height]).toEqual([4, 4]);
    expect(out.at(0, 0)).toEqual(BLACK); // source (7, 3)
    expect(out.at(3, 3)).toEqual(BLUE); // source (4, 0)
    expect(out.at(0, 3)).toEqual(BLUE);
    expect(out.at(3, 0)).toEqual(BLACK);
  });

  it('keeps a JPEG a JPEG, on a white matte where the picture is clear', async () => {
    const holes = quadrants(4, 4);
    const pixel = holes.pixel;
    holes.pixel = (x, y) => (x === 0 && y === 0 ? CLEAR : pixel(x, y));
    useFakes(holes);
    const res = await ImageEngine.cropAndFlip(file('holiday.photo.jpg'), { flipHorizontal: true });
    const out = await readBack(res.blob);
    expect(res.blob.type).toBe('image/jpeg');
    expect(res.filename).toBe('holiday.photo_edited.jpg');
    expect(out.at(3, 0)).toEqual(WHITE); // the clear corner, mirrored
    expect(out.at(0, 0)).toEqual(BLUE);
  });

  it('leaves a clear pixel clear in a PNG', async () => {
    const holes = quadrants(4, 4);
    holes.pixel = () => CLEAR;
    useFakes(holes);
    const out = await readBack((await ImageEngine.cropAndFlip(file('a.png'), {})).blob);
    expect(out.at(1, 1)).toEqual(CLEAR);
  });

  it('writes a GIF or HEIC back as PNG, or the format asked for', async () => {
    useFakes(quadrants(4, 4));
    let res = await ImageEngine.cropAndFlip(file('anim.gif'), {});
    expect([res.format, res.filename]).toEqual(['png', 'anim_edited.png']);
    res = await ImageEngine.cropAndFlip(file('a.png'), { targetFormat: 'webp' });
    expect([res.format, res.blob.type, res.filename]).toEqual(['webp', 'image/webp', 'a_edited.webp']);
  });

  it('refuses an empty area before drawing anything', async () => {
    useFakes(quadrants(4, 4));
    await expect(ImageEngine.cropAndFlip(file('a.png'), { crop: { x: 1, y: 1, width: 0, height: 2 } })).rejects.toThrow(/empty/);
  });
});
