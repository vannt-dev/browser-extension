/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { t } from './i18n.js';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';
import { STAMP_TEXT_UNSUPPORTED } from '../engine/stamp-text.js';

/**
 * A short status for a file a password kept shut, or whose stamp text cannot be drawn, in the
 * page's language; null for other errors.
 */
export function shortStatus(err) {
  if (err?.code === PDF_PASSWORD_NEEDED) return t('statusPasswordNeeded');
  if (err?.code === PDF_PASSWORD_WRONG) return t('statusPasswordWrong');
  if (err?.code === STAMP_TEXT_UNSUPPORTED) return t('statusStampTextUnsupported');
  return null;
}

/**
 * Why a file failed, in the page's language when it is a password or stamp text that cannot be
 * drawn; the engine's text otherwise.
 * @param {Error} err
 * @param {'dashboard'|'popup'} page Where the password can be entered differs
 */
export function errorReason(err, page) {
  if (err?.code === PDF_PASSWORD_NEEDED) {
    return page === 'popup' ? t('pdfPasswordNeededPopup', err.fileName) : t('pdfPasswordNeeded', err.fileName);
  }
  if (err?.code === PDF_PASSWORD_WRONG) return t('pdfPasswordWrong', err.fileName);
  if (err?.code === STAMP_TEXT_UNSUPPORTED) return t('stampTextUnsupported', err.characters);
  return err?.message || '';
}
