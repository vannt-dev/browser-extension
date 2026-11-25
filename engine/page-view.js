/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
/**
 * A PDF page as the reader sees it (after its /Rotate) against the page as it is stored. Kept free
 * of pdf-lib so the dashboard can use it without loading the PDF library.
 */

/** A page's turn as 0, 90, 180 or 270 degrees, whatever way the PDF writes it. */
export function pageTurn(angle) {
  return ((((Math.round(Number(angle) / 90) || 0) * 90) % 360) + 360) % 360;
}

/** The width and height of a page as seen: a page turned a quarter shows its box sideways. */
export function viewSize(box, angle) {
  const sideways = pageTurn(angle) % 180 === 90;
  return { width: sideways ? box.height : box.width, height: sideways ? box.width : box.height };
}

/**
 * Places a point given as the reader sees the page (origin at the bottom left of the page as
 * shown, after its /Rotate) in the page's own coordinates, with the turn text or a picture needs
 * to stand upright there.
 */
export function fromView(box, angle, x, y) {
  switch (pageTurn(angle)) {
    case 90:
      return { x: box.x + box.width - y, y: box.y + x, rotate: 90 };
    case 180:
      return { x: box.x + box.width - x, y: box.y + box.height - y, rotate: 180 };
    case 270:
      return { x: box.x + y, y: box.y + box.height - x, rotate: 270 };
    default:
      return { x: box.x + x, y: box.y + y, rotate: 0 };
  }
}
