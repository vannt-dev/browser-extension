/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { read, utils, write } from 'xlsx';
import { SPREADSHEET_EXTENSIONS } from './file-types.js';

/**
 * Spreadsheets (XLSX, XLS, ODS) to and from CSV and JSON, with SheetJS Community Edition, bundled.
 *
 * CSV holds one table, so a workbook of several sheets gives one CSV per sheet (the caller packs
 * them in a ZIP). JSON holds them all: the rows of the one sheet as an array, or, for several
 * sheets, an object with one array per sheet name. That object turns back into a workbook of the
 * same sheets.
 */

/** Files read as spreadsheets. */
export { SPREADSHEET_EXTENSIONS };

/** Spreadsheet formats written. */
export const SPREADSHEET_OUTPUTS = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
};

function baseName(name) {
  return String(name || 'spreadsheet').replace(/\.[^/.]+$/, '');
}

// A sheet name is free text; a file name is not.
function safeName(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, '_').trim() || 'sheet';
}

function workbookOf(bytes) {
  try {
    return read(bytes, { type: 'array', cellDates: true, dense: true });
  } catch (error) {
    throw new Error(`The spreadsheet could not be read: ${error?.message || error}`);
  }
}

/** The sheets that hold at least one cell, in workbook order. */
function filledSheets(workbook) {
  const sheets = workbook.SheetNames.map((name) => ({ name, sheet: workbook.Sheets[name] })).filter(
    ({ sheet }) => sheet && sheet['!ref']
  );
  if (!sheets.length) throw new Error('The spreadsheet has no data.');
  return sheets;
}

/**
 * The data of a spreadsheet: the rows of its one sheet (an object per row, keyed by the header
 * row), or one such array per sheet name when it has several.
 * @param {ArrayBuffer|Uint8Array} bytes
 * @returns {object[] | Record<string, object[]>}
 */
export function readSpreadsheet(bytes) {
  const sheets = filledSheets(workbookOf(bytes));
  const rowsOf = (sheet) => utils.sheet_to_json(sheet, { defval: null, raw: true });
  if (sheets.length === 1) return rowsOf(sheets[0].sheet);
  return Object.fromEntries(sheets.map(({ name, sheet }) => [name, rowsOf(sheet)]));
}

/**
 * One CSV per sheet that holds data.
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {string} fileName The spreadsheet's name, for the CSV names
 * @returns {{ blob: Blob, filename: string, sheet: string }[]}
 */
export function spreadsheetToCsv(bytes, fileName) {
  const sheets = filledSheets(workbookOf(bytes));
  const base = baseName(fileName);
  return sheets.map(({ name, sheet }) => ({
    sheet: name,
    filename: sheets.length === 1 ? `${base}.csv` : `${base}_${safeName(name)}.csv`,
    // A byte order mark, so Excel opens the file as UTF-8 and keeps accented letters.
    blob: new Blob(['﻿', utils.sheet_to_csv(sheet)], { type: 'text/csv' }),
  }));
}

// Text that is plainly a number becomes one. "007" and "1e5" stay text: a leading zero is an
// identifier more often than a number, and an exponent is more often a code.
const PLAIN_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function typed(value) {
  return typeof value === 'string' && PLAIN_NUMBER.test(value.trim()) ? Number(value.trim()) : value;
}

function sheetOf(rows, { numbersFromText }) {
  if (!Array.isArray(rows)) rows = [rows];
  if (rows.every((row) => Array.isArray(row))) {
    return utils.aoa_to_sheet(numbersFromText ? rows.map((row) => row.map(typed)) : rows);
  }
  const objects = rows.map((row) => {
    const object = row !== null && typeof row === 'object' ? row : { value: row };
    const cells = Object.entries(object).map(([key, value]) => [
      key,
      // A cell holds one value: nested data is written out as JSON text.
      value !== null && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value,
    ]);
    return Object.fromEntries(numbersFromText ? cells.map(([key, value]) => [key, typed(value)]) : cells);
  });
  return utils.json_to_sheet(objects);
}

/**
 * Writes data as a spreadsheet: an array of rows (objects or arrays) is one sheet, and an object
 * whose every value is an array is one sheet per key.
 * @param {unknown} data
 * @param {'xlsx'|'ods'} format
 * @param {{ numbersFromText?: boolean }} [options] numbersFromText: turn text such as "42" into
 *   numbers, for data from CSV, where every value is text
 * @returns {Blob}
 */
export function dataToSpreadsheet(data, format, { numbersFromText = false } = {}) {
  if (!SPREADSHEET_OUTPUTS[format]) throw new Error(`Unsupported spreadsheet format: ${format}`);
  const workbook = utils.book_new();
  const isSheetMap =
    data !== null && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0 &&
    Object.values(data).every((value) => Array.isArray(value));
  const sheets = isSheetMap ? Object.entries(data) : [['Sheet1', data]];
  const used = new Set();
  for (const [name, rows] of sheets) {
    // Sheet names: at most 31 characters, none of []:*?/\ and each once.
    const wanted = String(name).replace(/[[\]:*?/\\]/g, '_').slice(0, 31) || 'Sheet';
    let sheetName = wanted;
    for (let n = 2; used.has(sheetName.toLowerCase()); n++) sheetName = `${wanted.slice(0, 26)} (${n})`;
    used.add(sheetName.toLowerCase());
    utils.book_append_sheet(workbook, sheetOf(rows, { numbersFromText }), sheetName);
  }
  return new Blob([write(workbook, { type: 'array', bookType: format, compression: true })], {
    type: SPREADSHEET_OUTPUTS[format],
  });
}

/**
 * Re-saves a spreadsheet in another spreadsheet format (ODS to XLSX, XLS to ODS, ...).
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {'xlsx'|'ods'} format
 * @returns {Blob}
 */
export function convertSpreadsheet(bytes, format) {
  if (!SPREADSHEET_OUTPUTS[format]) throw new Error(`Unsupported spreadsheet format: ${format}`);
  const workbook = workbookOf(bytes);
  return new Blob([write(workbook, { type: 'array', bookType: format, compression: true })], {
    type: SPREADSHEET_OUTPUTS[format],
  });
}
