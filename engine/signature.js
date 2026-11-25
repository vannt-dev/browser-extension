/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { fromView, viewSize } from './page-view.js';

/**
 * The arithmetic of signing a PDF, apart from pdf-lib and the page so it can be tested alone:
 * where a signature put on a page preview lands on the PDF page, and which part of a drawn or
 * chosen picture is the signature.
 *
 * A placement is `{ page, x, y, width }`: the page number, the signature's top-left corner and its
 * width, each a share (0 to 1) of the page as the reader sees it, measured from the top left. Its
 * height follows from the signature's shape (`aspect`, its height over its width) and the page's
 * (`ratio`, its width over its height as seen), so a signature never comes out stretched.
 */

/** The width a signature first gets, as a share of the page's width. */
export const DEFAULT_SIGNATURE_WIDTH = 0.25;

/** The narrowest a signature can be made, as a share of the page's width. */
export const MIN_SIGNATURE_WIDTH = 0.03;

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** The height of a signature `width` wide, as a share of the page's height. */
export function placementHeight(width, aspect, ratio) {
  return width * aspect * ratio;
}

/** The widest a signature can be on a page: the page's width, or less when it would be too tall. */
function widest(aspect, ratio) {
  return Math.min(1, 1 / (aspect * ratio));
}

/** The placement kept on its page: no narrower than the least, no larger than the page, all of it on it. */
export function fitPlacement(placement, { aspect, ratio }) {
  const width = clamp(Number(placement.width) || DEFAULT_SIGNATURE_WIDTH, MIN_SIGNATURE_WIDTH, widest(aspect, ratio));
  const height = placementHeight(width, aspect, ratio);
  return {
    ...placement,
    x: clamp(Number(placement.x) || 0, 0, 1 - width),
    y: clamp(Number(placement.y) || 0, 0, 1 - height),
    width,
  };
}

/**
 * A new placement centred where the page preview was clicked.
 * @param {{ x: number, y: number }} point The click, in pixels from the preview's top left
 * @param {{ width: number, height: number }} preview The size the page is shown at, in pixels
 * @param {{ page: number, aspect: number, width?: number }} options
 */
export function placeAt(point, preview, { page, aspect, width = DEFAULT_SIGNATURE_WIDTH }) {
  const ratio = preview.width / preview.height;
  const fitted = fitPlacement({ page, x: 0, y: 0, width }, { aspect, ratio });
  const height = placementHeight(fitted.width, aspect, ratio);
  return fitPlacement(
    { ...fitted, x: point.x / preview.width - fitted.width / 2, y: point.y / preview.height - height / 2 },
    { aspect, ratio }
  );
}

/** A placement moved by a drag of `dx`, `dy` pixels on the preview, kept on the page. */
export function movePlacement(placement, dx, dy, preview, aspect) {
  const ratio = preview.width / preview.height;
  return fitPlacement(
    { ...placement, x: placement.x + dx / preview.width, y: placement.y + dy / preview.height },
    { aspect, ratio }
  );
}

/**
 * A placement made wider or narrower by dragging its bottom-right corner to `point` (pixels on the
 * preview). The top-left corner stays; the signature grows no further than the page's edges.
 */
export function resizePlacement(placement, point, preview, aspect) {
  const ratio = preview.width / preview.height;
  const across = point.x / preview.width - placement.x;
  const down = (point.y / preview.height - placement.y) / (aspect * ratio);
  const most = Math.min(1 - placement.x, (1 - placement.y) / (aspect * ratio));
  const width = clamp(Math.max(across, down), MIN_SIGNATURE_WIDTH, Math.max(MIN_SIGNATURE_WIDTH, most));
  return fitPlacement({ ...placement, width }, { aspect, ratio });
}

/** Refuses a placement that is not on a page of the PDF or not inside the page. */
export function checkPlacement(placement, pageCount, fileName = 'the PDF') {
  const page = Number(placement?.page);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    throw new Error(`There is no page ${placement?.page}: ${fileName} has pages 1 to ${pageCount}.`);
  }
  const { x, y, width } = placement;
  if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error('A signature is placed in shares of the page, 0 to 1.');
  }
  if (!(Number.isFinite(width) && width > 0 && width <= 1)) {
    throw new Error('A signature is at most as wide as the page.');
  }
}

/**
 * Where to draw a signature on a PDF page, in the page's own points: the corner pdf-lib's
 * drawImage starts from, the size, and the turn that keeps the signature upright on a page that
 * is shown turned. The crop box is the part of the page that shows.
 * @param {{ x: number, y: number, width: number }} placement Shares of the page as seen
 * @param {{ box: { x: number, y: number, width: number, height: number }, angle: number }} page
 * @param {number} aspect The signature's height over its width
 */
export function placementToPdf(placement, { box, angle }, aspect) {
  const view = viewSize(box, angle);
  const width = placement.width * view.width;
  const height = width * aspect;
  // The signature's bottom-left corner as seen, from the bottom left of the page as seen.
  const left = placement.x * view.width;
  const bottom = view.height * (1 - placement.y) - height;
  const at = fromView(box, angle, left, bottom);
  return { x: at.x, y: at.y, width, height, rotate: at.rotate };
}

/** Whether every pixel of an RGBA picture is solid: a scan or a photo, with paper around the ink. */
export function isOpaque({ data }) {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return false;
  return true;
}

/** How light a pixel can be and still count as ink rather than paper. */
const PAPER = 225;

/** Makes the paper of an RGBA picture see-through, in place: every near-white pixel. */
export function clearPaper({ data }) {
  for (let i = 0; i < data.length; i += 4) {
    if (Math.min(data[i], data[i + 1], data[i + 2]) > PAPER) data[i + 3] = 0;
  }
}

/** How see-through a pixel can be and not count as ink. */
const FAINT = 8;

/**
 * The smallest box around the ink of an RGBA picture (every pixel that is not see-through), with
 * a little room so the edges of the strokes are not cut; null when there is no ink at all.
 * @param {{ data: Uint8ClampedArray|Uint8Array, width: number, height: number }} image
 * @param {number} [margin] Pixels of room on each side, inside the picture
 */
export function inkBounds({ data, width, height }, margin = 2) {
  let [left, top, right, bottom] = [width, height, -1, -1];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= FAINT) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return null;
  const x = Math.max(0, left - margin);
  const y = Math.max(0, top - margin);
  return {
    x,
    y,
    width: Math.min(width - 1, right + margin) - x + 1,
    height: Math.min(height - 1, bottom + margin) - y + 1,
  };
}
