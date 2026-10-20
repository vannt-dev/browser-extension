import { describe, it, expect } from 'vitest';
import { read, utils, write } from 'xlsx';
import {
  convertSpreadsheet,
  dataToSpreadsheet,
  readSpreadsheet,
  spreadsheetToCsv,
} from '../engine/sheet-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';
import JSZip from '../lib/jszip.js';

/**
 * Small workbooks written here with SheetJS, in each format the converter reads, and the results
 * read back: a sheet of Vietnamese names and numbers, a second sheet, and an empty third one.
 */
function workbookBytes(bookType, sheets) {
  const workbook = utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), name);
  return new Uint8Array(write(workbook, { type: 'array', bookType }));
}

const PEOPLE = [
  ['name', 'age', 'city'],
  ['Nguyễn Văn An', 30, 'Hà Nội'],
  ['Trần Thị Bình', 25, 'Đà Nẵng'],
];
const ORDERS = [
  ['order', 'total'],
  ['A-1', 12.5],
];

async function blobText(blob) {
  return new TextDecoder().decode(await blob.arrayBuffer());
}

async function sheetsOf(blob) {
  const workbook = read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
  return Object.fromEntries(workbook.SheetNames.map((name) => [name, utils.sheet_to_json(workbook.Sheets[name])]));
}

describe('readSpreadsheet', () => {
  it.each(['xlsx', 'ods', 'xls'])('reads the rows of a one-sheet %s by its header row', (bookType) => {
    expect(readSpreadsheet(workbookBytes(bookType, { People: PEOPLE }))).toEqual([
      { name: 'Nguyễn Văn An', age: 30, city: 'Hà Nội' },
      { name: 'Trần Thị Bình', age: 25, city: 'Đà Nẵng' },
    ]);
  });

  it('gives one array per sheet when there are several, and leaves out empty sheets', () => {
    const data = readSpreadsheet(workbookBytes('xlsx', { People: PEOPLE, Orders: ORDERS, Empty: [] }));
    expect(Object.keys(data)).toEqual(['People', 'Orders']);
    expect(data.Orders).toEqual([{ order: 'A-1', total: 12.5 }]);
  });

  it('fills a missing cell with null, so every row has every column', () => {
    const data = readSpreadsheet(workbookBytes('xlsx', { S: [['a', 'b'], [1], [null, 2]] }));
    expect(data).toEqual([
      { a: 1, b: null },
      { a: null, b: 2 },
    ]);
  });

  it('refuses a file that is not a spreadsheet, and one without data', () => {
    expect(() => readSpreadsheet(workbookBytes('xlsx', { Empty: [] }))).toThrow('has no data');
    expect(() => readSpreadsheet(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]))).toThrow();
  });
});

describe('spreadsheetToCsv', () => {
  it('writes one CSV named after the workbook for a one-sheet file', async () => {
    const [csv, ...rest] = spreadsheetToCsv(workbookBytes('ods', { People: PEOPLE }), 'staff.ods');
    expect(rest).toEqual([]);
    expect(csv.filename).toBe('staff.csv');
    expect(csv.blob.type).toBe('text/csv');
    const text = await blobText(csv.blob);
    expect(text.replace(/^﻿/, '').split('\n')).toEqual([
      'name,age,city',
      'Nguyễn Văn An,30,Hà Nội',
      'Trần Thị Bình,25,Đà Nẵng',
    ]);
  });

  it('writes one CSV per sheet, named after the sheet', async () => {
    const files = spreadsheetToCsv(
      workbookBytes('xlsx', { People: PEOPLE, 'Q1 <orders>|"draft"': ORDERS, Empty: [] }),
      'report.2026.xlsx'
    );
    expect(files.map((file) => file.filename)).toEqual(['report.2026_People.csv', 'report.2026_Q1 _orders_draft_.csv']);
    expect(files.map((file) => file.sheet)).toEqual(['People', 'Q1 <orders>|"draft"']);
    expect((await blobText(files[1].blob)).replace(/^﻿/, '')).toBe('order,total\nA-1,12.5');
  });
  it('keeps every sheet in the ZIP when two sheet names give the same file name', async () => {
    const files = spreadsheetToCsv(workbookBytes('xlsx', { 'a<b': ORDERS, 'a>b': PEOPLE }), 'book.xlsx');
    expect(files.map((file) => file.filename)).toEqual(['book_a_b.csv', 'book_a_b.csv']);
    // The routing hands the list straight to createZip, which names entries by filename.
    const zip = await JSZip.loadAsync(await (await ZipEngine.createZip(files)).blob.arrayBuffer());
    expect(Object.keys(zip.files)).toEqual(['book_a_b.csv', 'book_a_b (2).csv']);
    expect(await zip.file('book_a_b (2).csv').async('string')).toContain('Nguyễn Văn An');
  });
});

describe('dataToSpreadsheet', () => {
  it('writes an array of rows as one sheet, in XLSX and in ODS', async () => {
    const rows = [
      { name: 'Nguyễn Văn An', age: 30 },
      { name: 'Trần Thị Bình', age: 25, tags: ['a', 'b'] },
    ];
    for (const format of ['xlsx', 'ods']) {
      const blob = dataToSpreadsheet(rows, format);
      expect(blob.type).toContain(format === 'xlsx' ? 'spreadsheetml' : 'opendocument');
      expect(await sheetsOf(blob)).toEqual({
        Sheet1: [
          { name: 'Nguyễn Văn An', age: 30 },
          { name: 'Trần Thị Bình', age: 25, tags: '["a","b"]' },
        ],
      });
    }
  });

  it('writes an object of arrays as one sheet per key, which reads back the same', async () => {
    const data = { People: [{ name: 'An', age: 30 }], Orders: [{ order: 'A-1', total: 12.5 }] };
    const blob = dataToSpreadsheet(data, 'xlsx');
    expect(await sheetsOf(blob)).toEqual(data);
    expect(readSpreadsheet(new Uint8Array(await blob.arrayBuffer()))).toEqual(data);
  });

  it('turns plain numbers in CSV text into numbers, and keeps codes as text', async () => {
    const rows = [{ zip: '01234', qty: '42', price: '-3.5', code: '1e5', note: '7 apples' }];
    const blob = dataToSpreadsheet(rows, 'xlsx', { numbersFromText: true });
    expect((await sheetsOf(blob)).Sheet1).toEqual([{ zip: '01234', qty: 42, price: -3.5, code: '1e5', note: '7 apples' }]);
    // Without the option the text stays text.
    expect((await sheetsOf(dataToSpreadsheet(rows, 'xlsx'))).Sheet1[0].qty).toBe('42');
  });

  it('makes sheet names the format accepts', async () => {
    const long = 'A very long sheet name that goes on';
    const blob = dataToSpreadsheet({ [long]: [{ a: 1 }], [`${long} too`]: [{ a: 2 }], 'a/b': [{ a: 3 }] }, 'xlsx');
    expect(Object.keys(await sheetsOf(blob))).toEqual(['A very long sheet name that goe', 'A very long sheet name tha (2)', 'a_b']);
  });

  it('refuses a format it does not write', () => {
    expect(() => dataToSpreadsheet([{ a: 1 }], 'numbers')).toThrow('Unsupported spreadsheet format');
  });
});

describe('convertSpreadsheet', () => {
  it('re-saves an ODS as XLSX with every sheet', async () => {
    const blob = convertSpreadsheet(workbookBytes('ods', { People: PEOPLE, Orders: ORDERS }), 'xlsx');
    expect(Object.keys(await sheetsOf(blob))).toEqual(['People', 'Orders']);
    expect((await sheetsOf(blob)).People[1]).toEqual({ name: 'Trần Thị Bình', age: 25, city: 'Đà Nẵng' });
  });
});
