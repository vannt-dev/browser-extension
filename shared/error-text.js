/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { t } from './i18n.js';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';

/**
 * A short status for a file a password kept shut, in the page's language; null for other errors.
 */
export function passwordStatus(err) {
  if (err?.code === PDF_PASSWORD_NEEDED) return t('statusPasswordNeeded');
  if (err?.code === PDF_PASSWORD_WRONG) return t('statusPasswordWrong');
  return null;
}

/**
 * Why a file failed, in the page's language when it is a password; the engine's text otherwise.
 * @param {Error} err
 * @param {'dashboard'|'popup'} page Where the password can be entered differs
 */
export function errorReason(err, page) {
  if (err?.code === PDF_PASSWORD_NEEDED) {
    return page === 'popup' ? t('pdfPasswordNeededPopup', err.fileName) : t('pdfPasswordNeeded', err.fileName);
  }
  if (err?.code === PDF_PASSWORD_WRONG) return t('pdfPasswordWrong', err.fileName);
  return err?.message || '';
}
