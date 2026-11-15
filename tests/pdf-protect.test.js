import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { jsPDF } from '../lib/jspdf.js';
import { protectPdf, rotatePdfPages } from '../engine/pdf-tools.js';
import { PDF_ALREADY_PROTECTED, PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';
import { errorReason, shortStatus } from '../shared/error-text.js';

/**
 * The protected PDF is opened the way a viewer opens it, with pdf.js: without the password it
 * stays shut, with it the words on the pages are there.
 */
beforeAll(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  ).href;
});

async function pdfFile(name, words) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const word of words) doc.addPage([300, 200]).drawText(word, { x: 40, y: 100, font });
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

const bytesOf = async (blob) => new Uint8Array(await blob.arrayBuffer());
const sourceOf = async (blob) => new TextDecoder('latin1').decode(await blob.arrayBuffer());

/** The text of each page as pdf.js reads it, or the name of what stopped it. */
async function readWith(blob, password) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: await bytesOf(blob), password, verbosity: 0 }).promise;
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const content = await (await pdf.getPage(n)).getTextContent();
      pages.push(content.items.map((item) => item.str).join(''));
    }
    return pages;
  } catch (error) {
    return error.name;
  }
}

describe('protectPdf', () => {
  it('writes a PDF that is encrypted with AES-256 and keeps the words out of sight', async () => {
    const result = await protectPdf(await pdfFile('report.pdf', ['First secret', 'Second secret']), 'open-sesame');
    expect(result.filename).toBe('report_protected.pdf');
    expect(result.pageCount).toBe(2);
    expect(result.blob.type).toBe('application/pdf');
    const source = await sourceOf(result.blob);
    expect(source).toMatch(/\/Encrypt/);
    // Revision 6 of the standard security handler is the AES-256 one.
    expect(source).toMatch(/\/V 5\b/);
    expect(source).toMatch(/\/R 6\b/);
    expect(source).not.toContain('open-sesame');
  });

  it('stays shut without the password or with a wrong one, and opens with the right one', async () => {
    const { blob } = await protectPdf(await pdfFile('report.pdf', ['First secret', 'Second secret']), 'open-sesame');
    expect(await readWith(blob)).toBe('PasswordException');
    expect(await readWith(blob, 'open-sesam')).toBe('PasswordException');
    expect(await readWith(blob, 'open-sesame')).toEqual(['First secret', 'Second secret']);
    // pdf-lib agrees with pdf.js.
    await expect(PDFDocument.load(await bytesOf(blob))).rejects.toThrow(/encrypted/i);
    await expect(PDFDocument.load(await bytesOf(blob), { password: 'nope' })).rejects.toThrow(/password/i);
    expect((await PDFDocument.load(await bytesOf(blob), { password: 'open-sesame' })).getPageCount()).toBe(2);
  });

  it('takes passwords with accents, other scripts and emoji', async () => {
    for (const password of ['mật khẩu', '密码 🔒', 'pass word']) {
      const { blob } = await protectPdf(await pdfFile('doc.pdf', ['Hello']), password);
      expect(await readWith(blob), password).toBe('PasswordException');
      expect(await readWith(blob, password), password).toEqual(['Hello']);
    }
  });

  it('protects PDFs other programs wrote', async () => {
    const doc = new jsPDF();
    doc.text('From jsPDF', 20, 20);
    const fromJsPdf = new File([doc.output('arraybuffer')], 'jspdf.pdf', { type: 'application/pdf' });
    const first = await protectPdf(fromJsPdf, 'abc');
    expect(await readWith(first.blob)).toBe('PasswordException');
    expect(await readWith(first.blob, 'abc')).toEqual(['From jsPDF']);

    // A scan from the pdf.js test files: its picture is a stream that has to survive encryption.
    const scan = new File([readFileSync('tests/offline/fixtures/jpx_numcomps.pdf')], 'scan.pdf');
    const second = await protectPdf(scan, 'abc');
    expect(second.filename).toBe('scan_protected.pdf');
    expect(await readWith(second.blob)).toBe('PasswordException');
    expect(await readWith(second.blob, 'abc')).toHaveLength(second.pageCount);
  });

  it('gives a PDF the other tools open with that password', async () => {
    const { blob } = await protectPdf(await pdfFile('report.pdf', ['One', 'Two']), 'abc');
    const locked = new File([blob], 'report_protected.pdf', { type: 'application/pdf' });
    await expect(rotatePdfPages(locked, 90)).rejects.toMatchObject({ code: PDF_PASSWORD_NEEDED });
    await expect(rotatePdfPages(locked, 90, '', { password: 'abd' })).rejects.toMatchObject({ code: PDF_PASSWORD_WRONG });
    const rotated = await rotatePdfPages(locked, 90, '', { password: 'abc' });
    expect(rotated.pageCount).toBe(2);
  });

  it('refuses an empty password', async () => {
    const file = await pdfFile('report.pdf', ['One']);
    await expect(protectPdf(file, '')).rejects.toThrow(/password/i);
    await expect(protectPdf(file)).rejects.toThrow(/password/i);
  });

  it('leaves a PDF that is already protected as it is, and says which one', async () => {
    const lock = async (user) => {
      const doc = await PDFDocument.create();
      doc.addPage();
      doc.encrypt({ userPassword: user, ownerPassword: 'owner-secret' });
      return new File([await doc.save()], 'secret.pdf', { type: 'application/pdf' });
    };
    // Locked for readers, and only limited in printing and copying: neither is locked again.
    for (const user of ['abc', '']) {
      const error = await protectPdf(await lock(user), 'new-password').catch((caught) => caught);
      expect(error.code).toBe(PDF_ALREADY_PROTECTED);
      expect(error.fileName).toBe('secret.pdf');
      expect(error.message).toContain('secret.pdf');
      expect(error.message).not.toContain('new-password');
      expect(shortStatus(error)).toBe('Already protected');
      expect(errorReason(error, 'dashboard')).toBe('secret.pdf is already protected with a password, so it was left as it is.');
    }

    // RC4 from another program is recognised as well.
    const doc = new jsPDF({ encryption: { userPassword: 'abc', ownerPassword: 'own', userPermissions: ['print'] } });
    doc.text('x', 10, 10);
    const rc4 = new File([doc.output('arraybuffer')], 'rc4.pdf', { type: 'application/pdf' });
    await expect(protectPdf(rc4, 'new-password')).rejects.toMatchObject({ code: PDF_ALREADY_PROTECTED, fileName: 'rc4.pdf' });
  });

  it('says which file could not be read when it is not a PDF at all', async () => {
    const junk = new File(['not a pdf'], 'notes.pdf', { type: 'application/pdf' });
    const error = await protectPdf(junk, 'abc').catch((caught) => caught);
    expect(error.message).toMatch(/^Cannot open notes\.pdf/);
    expect(error.message).not.toContain('abc');
  });
});
