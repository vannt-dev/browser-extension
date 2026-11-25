/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
/**
 * Comparing two pictures of pages pixel by pixel. Works on plain { width, height, data } objects
 * (what a canvas's getImageData gives), so it runs without a canvas.
 */

/** How far apart two colours may be on any channel (0-255) and still count as the same. */
export const TOLERANCE = 48;

/** The tint of a pixel that differs. */
export const DIFF_COLOUR = [220, 38, 38];

/** Where a page has no pixel because the other page is bigger. */
const NO_PAGE = [200, 200, 205];

/**
 * Lays picture `b` over picture `a`, both from the top left. The result is as wide and as tall as
 * the bigger of the two; a pixel only one of them covers is compared with white paper.
 *
 * The overlay shows B faded to a light grey, with the pixels that differ in red; where one page
 * has nothing, a grey of its own.
 * @param {{ width: number, height: number, data: ArrayLike<number> }} a RGBA
 * @param {{ width: number, height: number, data: ArrayLike<number> }} b RGBA
 * @param {{ tolerance?: number }} [options]
 * @returns {{ width: number, height: number, data: Uint8ClampedArray, changed: number,
 *   total: number, sizesDiffer: boolean, box: { x: number, y: number, width: number, height: number } | null }}
 *   `changed` pixels differ out of `total`; `box` holds them all
 */
export function pixelDiff(a, b, { tolerance = TOLERANCE } = {}) {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const data = new Uint8ClampedArray(width * height * 4);
  let changed = 0;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  const one = [0, 0, 0];
  const two = [0, 0, 0];
  const grey = [0, 0, 0];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inA = onPaper(a, x, y, one);
      const inB = onPaper(b, x, y, two);
      const at = (y * width + x) * 4;
      const differs =
        Math.abs(one[0] - two[0]) > tolerance || Math.abs(one[1] - two[1]) > tolerance || Math.abs(one[2] - two[2]) > tolerance;
      let colour;
      if (differs) {
        changed++;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        colour = DIFF_COLOUR;
      } else if (!inA || !inB) {
        colour = NO_PAGE;
      } else {
        // B as a light grey: dark ink shows, but well behind the red.
        const shade = Math.round(255 - (255 - (two[0] * 0.299 + two[1] * 0.587 + two[2] * 0.114)) * 0.3);
        grey[0] = grey[1] = grey[2] = shade;
        colour = grey;
      }
      data[at] = colour[0];
      data[at + 1] = colour[1];
      data[at + 2] = colour[2];
      data[at + 3] = 255;
    }
  }
  return {
    width,
    height,
    data,
    changed,
    total: width * height,
    sizesDiffer: a.width !== b.width || a.height !== b.height,
    box: changed ? { x: left, y: top, width: right - left + 1, height: bottom - top + 1 } : null,
  };
}

/** The colour at (x, y) laid on white paper, into `out`; false when the picture does not reach there. */
function onPaper(picture, x, y, out) {
  if (x >= picture.width || y >= picture.height) {
    out[0] = out[1] = out[2] = 255;
    return false;
  }
  const at = (y * picture.width + x) * 4;
  const alpha = picture.data[at + 3] / 255;
  for (let c = 0; c < 3; c++) out[c] = picture.data[at + c] * alpha + 255 * (1 - alpha);
  return true;
}
