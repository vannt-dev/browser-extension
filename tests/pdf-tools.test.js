import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs, parsePageRanges, splitPdf } from '../engine/pdf-tools.js';

/**
 * Real PDFs in, real PDFs out: the fixtures are written with pdf-lib and the
 * results are read back with it. Every page has its own width, so a page can
 * be told apart after it has been copied into another file.
 */
async function pdfFile(name, widths) {
  const doc = await PDFDocument.create();
  widths.forEach((width) => doc.addPage([width, 200]));
  return new File([await doc.save()], name, { type: 'application/pdf' });
}

async function pageWidths(blob) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  return doc.getPages().map((page) => page.getWidth());
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
