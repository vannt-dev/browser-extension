/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
/**
 * Comparing the text of two PDFs, page by page, word by word. Kept free of pdf.js and of the DOM:
 * the dashboard reads the text, this file says what changed.
 *
 * The diff is Myers' O(ND) algorithm ("An O(ND) Difference Algorithm and Its Variations", 1986)
 * over word tokens, after the words both ends share are set aside. Its work and memory grow with
 * the number of edits D, so it stops at a cap and calls the rest of the page replaced.
 */

/** Edits looked for on one page before the rest of it is called replaced (memory about D² ints). */
export const MAX_EDITS = 2000;

// Chinese characters, kana and the marks that go with them are written without spaces between
// words: each is a token of its own. Every other run of letters, marks and digits is a word, so
// Vietnamese keeps its tones and a word like "don't" or a number like "1,250.50" stays whole.
const CJK = '\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u3005\\u30FC';
const WORD_CHAR = `(?:(?![${CJK}])[\\p{L}\\p{M}\\p{N}])`;
// Inside a word: an apostrophe or a hyphen; inside a number: a point or a comma.
const JOIN = `(?:['’\\-]|(?<=\\p{N})[.,](?=\\p{N}))`;
const TOKEN = new RegExp(`([${CJK}])|(${WORD_CHAR}+(?:${JOIN}${WORD_CHAR}+)*)|(\\S)`, 'gu');

/**
 * The tokens of a text, in order. `sep` is what stood before each: '' (nothing), ' ' (spaces) or
 * '\n' (a line break among them), so the text can be written out again much as it was.
 * @param {string} text
 * @returns {{ text: string, sep: string }[]}
 */
export function tokenize(text) {
  const source = String(text ?? '').normalize('NFC');
  const tokens = [];
  let end = 0;
  for (const match of source.matchAll(TOKEN)) {
    const gap = source.slice(end, match.index);
    tokens.push({ text: match[0], sep: gap.includes('\n') ? '\n' : gap ? ' ' : '' });
    end = match.index + match[0].length;
  }
  return tokens;
}

/** A token that counts as a word in the totals: one with a letter or a digit, not a full stop. */
export const isWord = (token) => /[\p{L}\p{N}]/u.test(token.text);

/**
 * The shortest edit script between two lists, as runs: `same` (both), `removed` (only in `a`) and
 * `added` (only in `b`), each with its range in `a` ([aStart, aEnd)) and in `b`. Within a change
 * the removed run comes first. `exact` is false when the cap was reached and the middle of the
 * lists is given as one removed run and one added run.
 * @param {ArrayLike<string>} a
 * @param {ArrayLike<string>} b
 * @param {{ maxEdits?: number }} [options]
 */
export function diffSequences(a, b, { maxEdits = MAX_EDITS } = {}) {
  // Strings become numbers, so the inner loop compares numbers.
  const ids = new Map();
  const idOf = (value) => {
    let id = ids.get(value);
    if (id === undefined) ids.set(value, (id = ids.size));
    return id;
  };
  const left = Int32Array.from(a, idOf);
  const right = Int32Array.from(b, idOf);

  let start = 0;
  while (start < left.length && start < right.length && left[start] === right[start]) start++;
  let endA = left.length;
  let endB = right.length;
  while (endA > start && endB > start && left[endA - 1] === right[endB - 1]) {
    endA--;
    endB--;
  }

  const steps = myers(left.subarray(start, endA), right.subarray(start, endB), maxEdits);
  const runs = [];
  const push = (type, aStart, aEnd, bStart, bEnd) => {
    if (aEnd > aStart || bEnd > bStart) runs.push({ type, aStart, aEnd, bStart, bEnd });
  };
  push('same', 0, start, 0, start);
  let exact = true;
  if (!steps) {
    exact = false;
    push('removed', start, endA, start, start);
    push('added', endA, endA, start, endB);
  } else {
    // Steps are 0 (both), 1 (removed) or 2 (added), in order. A change is the steps between two
    // stretches of shared tokens: what it removes is one run of `a`, what it adds one run of `b`.
    let x = start;
    let y = start;
    let i = 0;
    while (i < steps.length) {
      if (steps[i] === 0) {
        const from = i;
        while (i < steps.length && steps[i] === 0) i++;
        push('same', x, x + i - from, y, y + i - from);
        x += i - from;
        y += i - from;
        continue;
      }
      let removed = 0;
      let added = 0;
      while (i < steps.length && steps[i] !== 0) {
        if (steps[i] === 1) removed++;
        else added++;
        i++;
      }
      push('removed', x, x + removed, y, y);
      push('added', x + removed, x + removed, y, y + added);
      x += removed;
      y += added;
    }
  }
  push('same', endA, left.length, endB, right.length);
  return { runs, exact };
}

/** Myers' greedy forward search; the steps (0 same, 1 removed, 2 added), or null past `maxEdits`. */
function myers(a, b, maxEdits) {
  const n = a.length;
  const m = b.length;
  if (!n && !m) return [];
  if (!n) return new Array(m).fill(2);
  if (!m) return new Array(n).fill(1);
  const limit = Math.min(n + m, maxEdits);
  const offset = limit + 1;
  const v = new Int32Array(2 * limit + 3);
  // trace[d] is v for diagonals -d..d after round d: what the walk back needs.
  const trace = [];
  for (let d = 0; d <= limit; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        trace.push(v.slice(offset - d, offset + d + 1));
        return walkBack(trace, n, m);
      }
    }
    trace.push(v.slice(offset - d, offset + d + 1));
  }
  return null;
}

function walkBack(trace, n, m) {
  const steps = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d > 0; d--) {
    const previous = trace[d - 1];
    const at = (k) => previous[k + d - 1];
    const k = x - y;
    const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
    const fromK = down ? k + 1 : k - 1;
    const fromX = at(fromK);
    const fromY = fromX - fromK;
    // The shared tokens after the edit, then the edit itself.
    const midX = down ? fromX : fromX + 1;
    while (x > midX) {
      steps.push(0);
      x--;
      y--;
    }
    steps.push(down ? 2 : 1);
    x = fromX;
    y = fromY;
  }
  while (x > 0) {
    steps.push(0);
    x--;
  }
  return steps.reverse();
}

/**
 * Compares two texts word by word.
 * @returns {{ tokensA, tokensB, runs, exact: boolean, changes: number, wordsAdded: number, wordsRemoved: number }}
 *   `changes` counts the places where something was removed, added or both; each removed or added
 *   run carries the number of its change as `change`
 */
export function compareTexts(textA, textB, options) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const { runs, exact } = diffSequences(
    tokensA.map((token) => token.text),
    tokensB.map((token) => token.text),
    options
  );
  let changes = 0;
  let wordsAdded = 0;
  let wordsRemoved = 0;
  let previous = 'same';
  for (const run of runs) {
    if (run.type === 'same') {
      previous = 'same';
      continue;
    }
    // An added run right after a removed one is the same change: a word swapped for another.
    if (!(run.type === 'added' && previous === 'removed')) changes++;
    run.change = changes - 1;
    previous = run.type;
    if (run.type === 'removed') wordsRemoved += tokensA.slice(run.aStart, run.aEnd).filter(isWord).length;
    else wordsAdded += tokensB.slice(run.bStart, run.bEnd).filter(isWord).length;
  }
  return { tokensA, tokensB, runs, exact, changes, wordsAdded, wordsRemoved };
}

/**
 * Pairs the pages of two PDFs. Pages whose text is the same line up even when pages were put in or
 * taken out between them; the rest pair in order, and the pages left over are only in A
 * (`b: null`) or only in B (`a: null`). Page numbers count from 1.
 * @param {string[]} textsA
 * @param {string[]} textsB
 * @returns {{ a: number | null, b: number | null }[]}
 */
export function alignPages(textsA, textsB) {
  const key = (text) => tokenize(text).map((token) => token.text).join(' ');
  const { runs } = diffSequences(textsA.map(key), textsB.map(key), { maxEdits: Infinity });
  const pairs = [];
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    if (run.type === 'same') {
      for (let j = 0; j < run.aEnd - run.aStart; j++) pairs.push({ a: run.aStart + j + 1, b: run.bStart + j + 1 });
      continue;
    }
    // A change: its removed pages and its added pages pair in order, the longer list's rest alone.
    const removed = run.type === 'removed' ? run : null;
    const added = run.type === 'added' ? run : runs[i + 1]?.type === 'added' ? runs[++i] : null;
    const fromA = removed ? removed.aEnd - removed.aStart : 0;
    const fromB = added ? added.bEnd - added.bStart : 0;
    const aStart = removed ? removed.aStart : 0;
    const bStart = added ? added.bStart : 0;
    for (let j = 0; j < Math.max(fromA, fromB); j++) {
      pairs.push({ a: j < fromA ? aStart + j + 1 : null, b: j < fromB ? bStart + j + 1 : null });
    }
  }
  return pairs;
}

/**
 * The totals of a comparison: pages compared, changed, only in A, only in B, words added and
 * removed, and whether every page was compared word by word.
 * @param {{ a: number | null, b: number | null, result: ReturnType<typeof compareTexts> }[]} pages
 */
export function summarize(pages) {
  const summary = { pages: pages.length, changed: 0, onlyA: [], onlyB: [], wordsAdded: 0, wordsRemoved: 0, exact: true };
  for (const { a, b, result } of pages) {
    if (b === null) summary.onlyA.push(a);
    else if (a === null) summary.onlyB.push(b);
    else if (result.changes) summary.changed++;
    summary.wordsAdded += result.wordsAdded;
    summary.wordsRemoved += result.wordsRemoved;
    if (!result.exact) summary.exact = false;
  }
  return summary;
}

/**
 * Every change of a comparison in reading order, as { page, change }: `page` the index in the
 * pages compared, `change` the number of the change on that page.
 */
export function listChanges(pages) {
  const list = [];
  pages.forEach(({ result }, page) => {
    for (let change = 0; change < result.changes; change++) list.push({ page, change });
  });
  return list;
}
