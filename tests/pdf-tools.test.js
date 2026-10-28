import { describe, it, expect } from 'vitest';
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { jsPDF } from '../lib/jspdf.js';
import {
  deletePdfPages,
  mergePdfs,
  parsePageRanges,
  reorderPdfPages,
  rotatePdfPages,
  splitPdf,
} from '../engine/pdf-tools.js';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';

/**
 * Real PDFs in, real PDFs out: the fixtures are written with pdf-lib and the
 * results are read back with it. Every page has its own width, so a page can
 * be told apart after it has been copied into another file.
 */
async function pdfFile(name, widths, rotations = []) {
  const doc = await PDFDocument.create();
  widths.forEach((width, index) => doc.addPage([width, 200]).setRotation(degrees(rotations[index] ?? 0)));
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

/** A PDF locked with the fork's own encryption: `user` to read it, `owner` for full access. */
async function lockedPdfFile(name, widths, { user, owner = 'owner-secret' }) {
  const doc = await PDFDocument.create();
  widths.forEach((width) => doc.addPage([width, 200]));
  doc.encrypt({ userPassword: user, ownerPassword: owner });
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

async function isEncrypted(blob) {
  return /\/Encrypt/.test(new TextDecoder('latin1').decode(await blob.arrayBuffer()));
}

async function pageWidths(blob) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map((page) => page.getWidth());
}

async function pageRotations(blob) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map((page) => page.getRotation().angle);
}

describe('parsePageRanges', () => {
  it('reads single pages, ranges and open ends, in the order written', () => {
    expect(parsePageRanges('1-3, 5, 8-', 10)).toEqual([[0, 1, 2], [4], [7, 8, 9]]);
    expect(parsePageRanges(' 2 ', 3)).toEqual([[1]]);
    expect(parsePageRanges('-2', 5)).toEqual([[0, 1]]);
    expect(parsePageRanges('3,1', 3)).toEqual([[2], [0]]);
  });

  it('refuses what is not a page of this document', () => {
    expect(() => parsePageRanges('', 3)).toThrow('No pages were given.');
    expect(() => parsePageRanges('4', 3)).toThrow('"4" goes past the last page (3).');
    expect(() => parsePageRanges('2-9', 3)).toThrow('goes past the last page');
    expect(() => parsePageRanges('0', 3)).toThrow('is not a page');
    expect(() => parsePageRanges('3-1', 3)).toThrow('is not a page');
    expect(() => parsePageRanges('a-b', 3)).toThrow('is not a page');
    expect(() => parsePageRanges('-', 3)).toThrow('is not a page');
  });
});

describe('mergePdfs', () => {
  it('joins the files in the order given, every page once', async () => {
    const merged = await mergePdfs([
      await pdfFile('report.pdf', [101, 102]),
      await pdfFile('appendix.pdf', [201]),
      await pdfFile('cover.pdf', [301, 302, 303]),
    ]);

    expect(merged.filename).toBe('report_merged.pdf');
    expect(merged.pageCount).toBe(6);
    expect(merged.blob.type).toBe('application/pdf');
    expect(await pageWidths(merged.blob)).toEqual([101, 102, 201, 301, 302, 303]);
  });

  it('needs two files and names the one it cannot read', async () => {
    await expect(mergePdfs([await pdfFile('only.pdf', [100])])).rejects.toThrow('at least two PDF files');
    const broken = new File(['this is not a pdf'], 'notes.pdf', { type: 'application/pdf' });
    await expect(mergePdfs([await pdfFile('ok.pdf', [100]), broken])).rejects.toThrow(/^Cannot open notes\.pdf: /);
  });
});

describe('splitPdf', () => {
  it('gives one file per page when no pages are named', async () => {
    const parts = await splitPdf(await pdfFile('scan.pdf', [101, 102, 103]));

    expect(parts.map((part) => part.filename)).toEqual(['scan_page_1.pdf', 'scan_page_2.pdf', 'scan_page_3.pdf']);
    expect(await Promise.all(parts.map((part) => pageWidths(part.blob)))).toEqual([[101], [102], [103]]);
  });

  it('gives one file per range, named after its pages', async () => {
    const widths = Array.from({ length: 12 }, (_, index) => 100 + index + 1);
    const parts = await splitPdf(await pdfFile('book.final.pdf', widths), '1-3, 5, 11-');

    // Padded to the width of the last page number, so the files sort in page order.
    expect(parts.map((part) => part.filename)).toEqual([
      'book.final_pages_01-03.pdf',
      'book.final_page_05.pdf',
      'book.final_pages_11-12.pdf',
    ]);
    expect(parts.map((part) => part.pageCount)).toEqual([3, 1, 2]);
    expect(await pageWidths(parts[0].blob)).toEqual([101, 102, 103]);
    expect(await pageWidths(parts[2].blob)).toEqual([111, 112]);
  });

  it('reports a range outside the document', async () => {
    await expect(splitPdf(await pdfFile('short.pdf', [100, 100]), '3')).rejects.toThrow('goes past the last page (2)');
  });
});

describe('rotatePdfPages', () => {
  it('turns every page when no pages are named', async () => {
    const rotated = await rotatePdfPages(await pdfFile('scan.pdf', [101, 102, 103]), 90);

    expect(rotated.filename).toBe('scan_rotated.pdf');
    expect(rotated.pageCount).toBe(3);
    expect(await pageRotations(rotated.blob)).toEqual([90, 90, 90]);
    expect(await pageWidths(rotated.blob)).toEqual([101, 102, 103]);
  });

  it('turns only the pages named, on top of the turn they already have', async () => {
    const file = await pdfFile('mixed.pdf', [101, 102, 103, 104], [0, 90, 270, 0]);
    const rotated = await rotatePdfPages(file, 180, '2-3');

    expect(await pageRotations(rotated.blob)).toEqual([0, 270, 90, 0]);
    expect(await pageRotations((await rotatePdfPages(file, 270, '1, 3')).blob)).toEqual([270, 90, 180, 0]);
  });

  it('refuses an angle that is not a quarter turn, and pages outside the document', async () => {
    const file = await pdfFile('short.pdf', [100, 100]);
    await expect(rotatePdfPages(file, 45)).rejects.toThrow('90, 180 or 270');
    await expect(rotatePdfPages(file, 90, '3')).rejects.toThrow('goes past the last page (2)');
  });
});

describe('deletePdfPages', () => {
  it('takes out the pages named and keeps the rest in order', async () => {
    const widths = [101, 102, 103, 104, 105, 106];
    const trimmed = await deletePdfPages(await pdfFile('deck.pdf', widths), '2, 4-5');

    expect(trimmed.filename).toBe('deck_pages_deleted.pdf');
    expect(trimmed.pageCount).toBe(3);
    expect(await pageWidths(trimmed.blob)).toEqual([101, 103, 106]);
  });

  it('keeps the turn of the pages it leaves', async () => {
    const trimmed = await deletePdfPages(await pdfFile('turned.pdf', [101, 102], [0, 90]), '1');
    expect(await pageRotations(trimmed.blob)).toEqual([90]);
  });

  it('will not delete every page, and needs pages to be named', async () => {
    const file = await pdfFile('two.pdf', [101, 102]);
    await expect(deletePdfPages(file, '1-2')).rejects.toThrow('empty PDF');
    await expect(deletePdfPages(file, '2, 1')).rejects.toThrow('empty PDF');
    await expect(deletePdfPages(file, '')).rejects.toThrow('No pages were given.');
  });
});

describe('reorderPdfPages', () => {
  it('puts the pages in the order written', async () => {
    const reordered = await reorderPdfPages(await pdfFile('slides.pdf', [101, 102, 103, 104]), '4, 2, 3, 1');

    expect(reordered.filename).toBe('slides_reordered.pdf');
    expect(reordered.pageCount).toBe(4);
    expect(await pageWidths(reordered.blob)).toEqual([104, 102, 103, 101]);
  });

  it('lets the pages left out follow in their old order', async () => {
    const file = await pdfFile('book.pdf', [101, 102, 103, 104, 105]);
    expect(await pageWidths((await reorderPdfPages(file, '4-5')).blob)).toEqual([104, 105, 101, 102, 103]);
    expect(await pageWidths((await reorderPdfPages(file, '3')).blob)).toEqual([103, 101, 102, 104, 105]);
  });

  it('keeps the turn of each page', async () => {
    const reordered = await reorderPdfPages(await pdfFile('turned.pdf', [101, 102], [90, 0]), '2, 1');
    expect(await pageRotations(reordered.blob)).toEqual([0, 90]);
  });

  it('refuses a page named twice', async () => {
    const file = await pdfFile('three.pdf', [101, 102, 103]);
    await expect(reorderPdfPages(file, '2, 1-3')).rejects.toThrow('Page 2 is named more than once.');
  });
});

describe('PDFs locked with a password', () => {
  it('asks for the password, naming the file, when none is given', async () => {
    const locked = await lockedPdfFile('secret.pdf', [100, 200], { user: 'abc' });
    const error = await rotatePdfPages(locked, 90).catch((caught) => caught);
    expect(error.code).toBe(PDF_PASSWORD_NEEDED);
    expect(error.fileName).toBe('secret.pdf');
    expect(error.message).toMatch(/^Cannot open secret\.pdf: it is password-protected/);
  });

  it('says the password is wrong', async () => {
    const locked = await lockedPdfFile('secret.pdf', [100], { user: 'abc' });
    const error = await splitPdf(locked, '', { password: 'nope' }).catch((caught) => caught);
    expect(error.code).toBe(PDF_PASSWORD_WRONG);
    expect(error.message).toBe('Cannot open secret.pdf: the password is wrong.');
  });

  it('opens with the password and saves pages that open without one', async () => {
    const locked = await lockedPdfFile('secret.pdf', [101, 102, 103], { user: 'abc' });
    const rotated = await rotatePdfPages(locked, 90, '2', { password: 'abc' });
    expect(await isEncrypted(rotated.blob)).toBe(false);
    expect(await pageWidths(rotated.blob)).toEqual([101, 102, 103]);
    expect(await pageRotations(rotated.blob)).toEqual([0, 90, 0]);

    const deleted = await deletePdfPages(locked, '1', { password: 'abc' });
    expect(await isEncrypted(deleted.blob)).toBe(false);
    expect(await pageWidths(deleted.blob)).toEqual([102, 103]);

    const reordered = await reorderPdfPages(locked, '3', { password: 'abc' });
    expect(await pageWidths(reordered.blob)).toEqual([103, 101, 102]);
  });

  it('opens with the owner password too', async () => {
    const locked = await lockedPdfFile('secret.pdf', [101, 102], { user: 'abc', owner: 'boss' });
    const parts = await splitPdf(locked, '', { password: 'boss' });
    expect(parts).toHaveLength(2);
    expect(await pageWidths(parts[1].blob)).toEqual([102]);
  });

  it('opens a PDF that only limits printing or copying without asking', async () => {
    const restricted = await lockedPdfFile('restricted.pdf', [101, 102], { user: '' });
    const parts = await splitPdf(restricted);
    expect(parts.map((part) => part.filename)).toEqual(['restricted_page_1.pdf', 'restricted_page_2.pdf']);
    expect(await isEncrypted(parts[0].blob)).toBe(false);
  });

  it('opens a PDF another program locked (jsPDF, RC4)', async () => {
    const doc = new jsPDF({ encryption: { userPassword: 'abc', ownerPassword: 'own', userPermissions: ['print'] } });
    doc.text('first', 15, 20);
    doc.addPage();
    doc.text('second', 15, 20);
    const locked = new File([doc.output('arraybuffer')], 'jspdf.pdf', { type: 'application/pdf' });
    await expect(rotatePdfPages(locked, 90)).rejects.toMatchObject({ code: PDF_PASSWORD_NEEDED });
    const rotated = await rotatePdfPages(locked, 90, '', { password: 'abc' });
    expect(await isEncrypted(rotated.blob)).toBe(false);
    expect(await pageRotations(rotated.blob)).toEqual([90, 90]);
  });

  it('merges a locked PDF with plain ones, which ignore the password', async () => {
    const plain = await pdfFile('plain.pdf', [101]);
    const locked = await lockedPdfFile('secret.pdf', [201, 202], { user: 'abc' });
    const merged = await mergePdfs([plain, locked], { password: 'abc' });
    expect(await pageWidths(merged.blob)).toEqual([101, 201, 202]);
    expect(await isEncrypted(merged.blob)).toBe(false);
  });
});
