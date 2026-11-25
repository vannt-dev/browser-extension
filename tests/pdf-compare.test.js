import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import {
  alignPages,
  compareTexts,
  diffSequences,
  isWord,
  listChanges,
  summarize,
  tokenize,
} from '../engine/text-diff.js';
import { DIFF_COLOUR, pixelDiff } from '../engine/pixel-diff.js';
import { PdfEngine } from '../engine/pdf-engine.js';

const words = (text) => tokenize(text).map((token) => token.text);

/** What a comparison removed and added, as text, change by change. */
function changesOf(result) {
  const out = [];
  for (const run of result.runs) {
    if (run.type === 'same') continue;
    const entry = (out[run.change] ??= { removed: '', added: '' });
    if (run.type === 'removed') entry.removed = result.tokensA.slice(run.aStart, run.aEnd).map((t) => t.text).join(' ');
    else entry.added = result.tokensB.slice(run.bStart, run.bEnd).map((t) => t.text).join(' ');
  }
  return out;
}

/** Applies a diff's runs to `a` and checks the outcome is `b`: the script is a real edit script. */
function replay(a, b, runs) {
  const out = [];
  for (const run of runs) {
    if (run.type === 'same') {
      expect(a.slice(run.aStart, run.aEnd)).toEqual(b.slice(run.bStart, run.bEnd));
      out.push(...a.slice(run.aStart, run.aEnd));
    } else if (run.type === 'added') out.push(...b.slice(run.bStart, run.bEnd));
  }
  return out;
}

describe('tokenize', () => {
  it('splits words on spaces and keeps punctuation as tokens of its own', () => {
    expect(words('Hello, world! It costs 1,250.50 and isn’t free.')).toEqual([
      'Hello', ',', 'world', '!', 'It', 'costs', '1,250.50', 'and', 'isn’t', 'free', '.',
    ]);
  });

  it('keeps Vietnamese words whole, tones and all, whichever way they are encoded', () => {
    expect(words('Đã thanh toán đủ')).toEqual(['Đã', 'thanh', 'toán', 'đủ']);
    // The same words with their marks written apart (NFD), as some PDFs carry them.
    const decomposed = 'Đã thanh toán đủ'.normalize('NFD');
    expect(decomposed).not.toBe('Đã thanh toán đủ');
    expect(words(decomposed)).toEqual(['Đã', 'thanh', 'toán', 'đủ']);
  });

  it('makes each Japanese or Chinese character a token, and Latin runs among them words', () => {
    expect(words('東京はPDF形式です。')).toEqual(['東', '京', 'は', 'PDF', '形', '式', 'で', 'す', '。']);
    expect(words('コーヒー')).toEqual(['コ', 'ー', 'ヒ', 'ー']);
  });

  it('remembers what stood before each token: nothing, a space or a line break', () => {
    expect(tokenize('one  two\nthree,four').map((token) => token.sep)).toEqual(['', ' ', '\n', '', '']);
  });

  it('counts words, not punctuation', () => {
    expect(tokenize('Yes , 42 ! 東').filter(isWord).map((token) => token.text)).toEqual(['Yes', '42', '東']);
  });
});

describe('diffSequences', () => {
  it('finds nothing to change between equal lists', () => {
    const list = ['a', 'b', 'c'];
    expect(diffSequences(list, list)).toEqual({ runs: [{ type: 'same', aStart: 0, aEnd: 3, bStart: 0, bEnd: 3 }], exact: true });
    expect(diffSequences([], [])).toEqual({ runs: [], exact: true });
  });

  it('gives a shortest edit script that turns one list into the other', () => {
    const cases = [
      ['abcabba', 'cbabac'],
      ['the quick brown fox', 'the slow brown dog fox'],
      ['', 'abc'],
      ['abc', ''],
      ['xaxbxc', 'abc'],
    ];
    for (const [one, two] of cases) {
      const a = [...one];
      const b = [...two];
      const { runs, exact } = diffSequences(a, b);
      expect(exact).toBe(true);
      expect(replay(a, b, runs)).toEqual(b);
      // A shortest script keeps as many items as the longest common subsequence has.
      const kept = runs.filter((run) => run.type === 'same').reduce((sum, run) => sum + run.aEnd - run.aStart, 0);
      expect(kept, `${one} -> ${two}`).toBe(lcsLength(a, b));
    }
  });

  it('calls the middle replaced when the lists differ by more edits than allowed', () => {
    const a = ['same', ...'abcdefghij'.split(''), 'end'];
    const b = ['same', ...'0123456789'.split(''), 'end'];
    const { runs, exact } = diffSequences(a, b, { maxEdits: 5 });
    expect(exact).toBe(false);
    expect(runs.map((run) => run.type)).toEqual(['same', 'removed', 'added', 'same']);
    expect(replay(a, b, runs)).toEqual(b);
    expect(diffSequences(a, b, { maxEdits: 20 }).exact).toBe(true);
  });
});

function lcsLength(a, b) {
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = a[i - 1] === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1]);
      diagonal = above;
    }
  }
  return row[b.length];
}

describe('compareTexts', () => {
  it('finds no change on identical pages', () => {
    const result = compareTexts('The quick brown fox.', 'The quick brown fox.');
    expect(result).toMatchObject({ changes: 0, wordsAdded: 0, wordsRemoved: 0, exact: true });
  });

  it('ignores how much space or which line breaks stand between words', () => {
    expect(compareTexts('The quick  brown\nfox', 'The quick brown fox').changes).toBe(0);
  });

  it('reports a word swapped for another as one change', () => {
    const result = compareTexts('The quick brown fox jumps.', 'The quick red fox jumps.');
    expect(result).toMatchObject({ changes: 1, wordsAdded: 1, wordsRemoved: 1 });
    expect(changesOf(result)).toEqual([{ removed: 'brown', added: 'red' }]);
  });

  it('reports words added and words removed in different places', () => {
    const result = compareTexts('one two three four five', 'zero one two four five six');
    expect(changesOf(result)).toEqual([
      { removed: '', added: 'zero' },
      { removed: 'three', added: '' },
      { removed: '', added: 'six' },
    ]);
    expect(result).toMatchObject({ changes: 3, wordsAdded: 2, wordsRemoved: 1 });
  });

  it('shows a moved word as removed in one place and added in the other', () => {
    const result = compareTexts('alpha beta gamma delta', 'beta gamma delta alpha');
    expect(changesOf(result)).toEqual([
      { removed: 'alpha', added: '' },
      { removed: '', added: 'alpha' },
    ]);
  });

  it('compares Vietnamese and Japanese text word by word', () => {
    expect(changesOf(compareTexts('Hợp đồng đã ký ngày 5', 'Hợp đồng chưa ký ngày 5'))).toEqual([{ removed: 'đã', added: 'chưa' }]);
    const japanese = compareTexts('東京は晴れです', '東京は雨です');
    expect(changesOf(japanese)).toEqual([{ removed: '晴 れ', added: '雨' }]);
    expect(japanese).toMatchObject({ wordsAdded: 1, wordsRemoved: 2 });
  });

  it('counts every word of a page that is only on one side', () => {
    expect(compareTexts('', 'Three new words')).toMatchObject({ changes: 1, wordsAdded: 3, wordsRemoved: 0 });
    expect(compareTexts('Two gone', '')).toMatchObject({ changes: 1, wordsAdded: 0, wordsRemoved: 2 });
  });
});

describe('alignPages', () => {
  it('pairs pages in order when the counts match', () => {
    expect(alignPages(['a', 'b', 'c'], ['a', 'B', 'c'])).toEqual([
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: 3 },
    ]);
  });

  it('reports the pages B has more as only in B, and the pages it lacks as only in A', () => {
    expect(alignPages(['one', 'two'], ['one', 'two', 'three', 'four'])).toEqual([
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: null, b: 3 },
      { a: null, b: 4 },
    ]);
    expect(alignPages(['one', 'two', 'three'], ['one'])).toEqual([
      { a: 1, b: 1 },
      { a: 2, b: null },
      { a: 3, b: null },
    ]);
  });

  it('keeps the pages after a page put in the middle paired with their own', () => {
    expect(alignPages(['cover', 'body', 'end'], ['cover', 'new page', 'body', 'end'])).toEqual([
      { a: 1, b: 1 },
      { a: null, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
    ]);
  });

  it('pairs changed pages with each other, the extra ones alone', () => {
    expect(alignPages(['x', 'old 1', 'old 2', 'y'], ['x', 'new 1', 'y'])).toEqual([
      { a: 1, b: 1 },
      { a: 2, b: 2 },
      { a: 3, b: null },
      { a: 4, b: 3 },
    ]);
  });
});

describe('summarize and listChanges', () => {
  it('adds up a comparison with a page changed and a page only in B', () => {
    const textsA = ['Page one text', 'Page two text'];
    const textsB = ['Page one text', 'Page 2 text', 'A third page'];
    const pages = alignPages(textsA, textsB).map((pair) => ({
      ...pair,
      result: compareTexts(pair.a ? textsA[pair.a - 1] : '', pair.b ? textsB[pair.b - 1] : ''),
    }));
    expect(summarize(pages)).toEqual({ pages: 3, changed: 1, onlyA: [], onlyB: [3], wordsAdded: 4, wordsRemoved: 1, exact: true });
    expect(listChanges(pages)).toEqual([
      { page: 1, change: 0 },
      { page: 2, change: 0 },
    ]);
  });
});

describe('pixelDiff', () => {
  /** A picture filled with one colour, with some pixels set to others. */
  const image = (width, height, fill, dots = {}) => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) data.set(dots[i] ?? fill, i * 4);
    return { width, height, data };
  };
  const WHITE = [255, 255, 255, 255];
  const BLACK = [0, 0, 0, 255];
  const pixel = (result, x, y) => [...result.data.slice((y * result.width + x) * 4, (y * result.width + x) * 4 + 3)];

  it('finds no difference between equal pictures', () => {
    const result = pixelDiff(image(3, 2, WHITE, { 2: BLACK }), image(3, 2, WHITE, { 2: BLACK }));
    expect(result).toMatchObject({ width: 3, height: 2, changed: 0, total: 6, sizesDiffer: false, box: null });
    // B is shown faded: its black ink as a grey, its paper white.
    expect(pixel(result, 2, 0)).toEqual([179, 179, 179]);
    expect(pixel(result, 0, 0)).toEqual([255, 255, 255]);
  });

  it('tints the pixels that differ, counts them and boxes them', () => {
    // 4 x 3: pixels 5 (1,1) and 7 (3,1) differ.
    const result = pixelDiff(image(4, 3, WHITE, { 5: BLACK, 7: [255, 0, 0, 255] }), image(4, 3, WHITE));
    expect(result.changed).toBe(2);
    expect(result.box).toEqual({ x: 1, y: 1, width: 3, height: 1 });
    expect(pixel(result, 1, 1)).toEqual(DIFF_COLOUR);
    expect(pixel(result, 3, 1)).toEqual(DIFF_COLOUR);
    expect(pixel(result, 2, 1)).toEqual([255, 255, 255]);
  });

  it('lets small differences (antialiasing) pass, within the tolerance', () => {
    const near = pixelDiff(image(1, 1, [100, 100, 100, 255]), image(1, 1, [130, 100, 100, 255]));
    expect(near.changed).toBe(0);
    expect(pixelDiff(image(1, 1, [100, 100, 100, 255]), image(1, 1, [130, 100, 100, 255]), { tolerance: 10 }).changed).toBe(1);
  });

  it('lays see-through pixels on white paper before comparing', () => {
    expect(pixelDiff(image(1, 1, [0, 0, 0, 0]), image(1, 1, WHITE)).changed).toBe(0);
  });

  it('lines up pages of different sizes at the top left and compares the rest with paper', () => {
    // A is 2 x 2, B is 3 x 1 with ink at (2, 0), where A has no page.
    const result = pixelDiff(image(2, 2, WHITE), image(3, 1, WHITE, { 2: BLACK }));
    expect(result).toMatchObject({ width: 3, height: 2, sizesDiffer: true, changed: 1 });
    expect(result.box).toEqual({ x: 2, y: 0, width: 1, height: 1 });
    expect(pixel(result, 2, 0)).toEqual(DIFF_COLOUR);
    // Blank where only one page reaches: no difference, but marked as no page.
    expect(pixel(result, 0, 1)).toEqual([200, 200, 205]);
    expect(pixel(result, 2, 1)).toEqual([200, 200, 205]);
  });
});

describe('PdfEngine.openPages text', () => {
  beforeAll(() => {
    // As in pdf-engine.test.js: vitest leaves the worker's address relative to its dev server.
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(resolve('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')).href;
  });

  async function pdfFile(pages, name) {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (const lines of pages) {
      const page = doc.addPage([400, 400]);
      lines.forEach((line, i) => page.drawText(line, { x: 30, y: 350 - i * 30, size: 14, font }));
    }
    const bytes = await doc.save();
    const file = new File([bytes], name, { type: 'application/pdf' });
    if (typeof file.arrayBuffer !== 'function') file.arrayBuffer = async () => bytes.buffer;
    return file;
  }

  it('reads each page with its words whole, and the comparison finds the one word changed', async () => {
    const a = await PdfEngine.openPages(
      await pdfFile([['First page here'], ['The quick brown fox', 'jumps over the dog']], 'a.pdf')
    );
    const b = await PdfEngine.openPages(
      await pdfFile([['First page here'], ['The quick red fox', 'jumps over the dog'], ['An extra page']], 'b.pdf')
    );
    try {
      const textsA = [await a.text(1), await a.text(2)];
      const textsB = [await b.text(1), await b.text(2), await b.text(3)];
      expect(words(textsA[1])).toEqual(['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'dog']);
      const pages = alignPages(textsA, textsB).map((pair) => ({
        ...pair,
        result: compareTexts(pair.a ? textsA[pair.a - 1] : '', pair.b ? textsB[pair.b - 1] : ''),
      }));
      expect(pages.map(({ a, b }) => [a, b])).toEqual([[1, 1], [2, 2], [null, 3]]);
      expect(changesOf(pages[1].result)).toEqual([{ removed: 'brown', added: 'red' }]);
      expect(summarize(pages)).toMatchObject({ changed: 1, onlyB: [3], wordsAdded: 4, wordsRemoved: 1 });
    } finally {
      await a.close();
      await b.close();
    }
  });
});

describe('the report', () => {
  it('lists each change of each changed page, the text of the PDFs escaped, nothing to load', async () => {
    const { buildReport } = await import('../dashboard/compare-tool.js');
    const textsA = ['Same page', 'Price <b>10</b> & tax', 'Gone page'];
    const textsB = ['Same page', 'Price <b>12</b> & tax'];
    const pages = alignPages(textsA, textsB).map((pair) => ({
      ...pair,
      result: compareTexts(pair.a ? textsA[pair.a - 1] : '', pair.b ? textsB[pair.b - 1] : ''),
    }));
    const html = buildReport({ nameA: 'a<1>.pdf', nameB: 'b.pdf', pages, summary: summarize(pages) });
    expect(html).toContain('<title>Changes from a&lt;1&gt;.pdf to b.pdf</title>');
    expect(html).toContain('<h2>A page 2 ↔ B page 2</h2>');
    expect(html).toContain('<li><del>10</del> &rarr; <ins>12</ins></li>');
    expect(html).toContain('<h2>Page 3, only in A</h2>');
    expect(html).toContain('<li><del>Gone page</del></li>');
    expect(html).toContain('Pages only in A (taken out in B): 3');
    expect(html).not.toContain('<b>');
    expect(html).not.toMatch(/<script|https?:/);
  });
});

describe('big documents', () => {
  it('pairs pages in order when too many differ to pair them by content', () => {
    const textsA = Array.from({ length: 1100 }, (_, i) => `first version page ${i}`);
    const textsB = Array.from({ length: 1101 }, (_, i) => `second version page ${i}`);
    const pairs = alignPages(textsA, textsB);
    expect(pairs).toHaveLength(1101);
    expect(pairs[0]).toEqual({ a: 1, b: 1 });
    expect(pairs[1099]).toEqual({ a: 1100, b: 1100 });
    expect(pairs[1100]).toEqual({ a: null, b: 1101 });
  });
});
