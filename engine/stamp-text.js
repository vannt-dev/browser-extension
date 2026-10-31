/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */

/** The stamp text has characters the PDF's built-in font cannot draw. */
export const STAMP_TEXT_UNSUPPORTED = 'stamp-text-unsupported';

/**
 * The error for stamp text the built-in font cannot draw. `code` lets a page show it in its own
 * language; `characters` lists the ones that cannot be drawn, each once, separated by spaces.
 * @param {string[]} characters
 */
export function stampTextError(characters) {
  const list = characters.join(' ');
  return Object.assign(
    new Error(
      `The stamp text has characters the PDF's built-in font cannot draw: ${list}. ` +
        'Write it without them, or stamp it as a picture.'
    ),
    { code: STAMP_TEXT_UNSUPPORTED, characters: list }
  );
}
