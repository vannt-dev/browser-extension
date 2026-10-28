/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */

/** A PDF that needs a password to open was given none. */
export const PDF_PASSWORD_NEEDED = 'pdf-password-needed';
/** A PDF that needs a password to open was given the wrong one. */
export const PDF_PASSWORD_WRONG = 'pdf-password-wrong';

/**
 * The error for a PDF that a password keeps shut. `code` lets a page show it in its own language;
 * `fileName` says which file of a batch it was.
 * @param {string} fileName
 * @param {string} code PDF_PASSWORD_NEEDED or PDF_PASSWORD_WRONG
 */
export function pdfPasswordError(fileName, code) {
  const message =
    code === PDF_PASSWORD_WRONG
      ? `Cannot open ${fileName}: the password is wrong.`
      : `Cannot open ${fileName}: it is password-protected. Enter its password and try again.`;
  return Object.assign(new Error(message), { code, fileName });
}
