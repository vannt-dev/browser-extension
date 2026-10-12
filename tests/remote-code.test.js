import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { findRemoteCode, stripRemoteCode } from '../scripts/remote-code.js';

/**
 * Guards the Manifest V3 rule the Chrome Web Store rejected 1.1.3 for: the package may not name
 * a script hosted elsewhere. The store reads the files, it does not run them, so the address of
 * a CDN script is a violation even in a branch of a library the extension never reaches.
 *
 * The libraries are read as they are installed, so an update that brings a new address in shows
 * up here before it shows up in a review.
 */

// Without the comments: the minifier drops them, so the credits in them that name a source file
// never reach the package. What does reach it is checked by the build, over dist/ itself.
const read = (file) => fs.readFileSync(path.resolve(file), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

const vendoredJsPdf = () => {
  const file = fs.readdirSync(path.resolve('lib')).find((name) => /^jspdf\.es\.min-.*\.js$/.test(name));
  return read(path.join('lib', file));
};

describe('findRemoteCode', () => {
  it('finds the PDFObject script jsPDF keeps for an output mode nothing here uses', () => {
    expect(findRemoteCode(vendoredJsPdf())).toEqual([
      'https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js',
      `<script src="' +`
    ]);
  });

  it('finds the CDN defaults of tesseract.js, in the library and in its worker', () => {
    const library = findRemoteCode(read('node_modules/tesseract.js/src/worker/browser/defaultOptions.js'));
    const worker = findRemoteCode(read('node_modules/tesseract.js/dist/worker.min.js'));

    expect(library).toHaveLength(1);
    expect(library[0]).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js@v/);
    expect(worker).toHaveLength(2);
    expect(worker.every((url) => url.startsWith('https://cdn.jsdelivr.net/npm/'))).toBe(true);
  });

  it('finds a script on any other host, whatever the way it is written', () => {
    expect(findRemoteCode('load("https://example.com/lib/widget.min.js")')).toEqual([
      'https://example.com/lib/widget.min.js'
    ]);
    expect(findRemoteCode('load("http://example.com/a.mjs?v=2")')).toEqual(['http://example.com/a.mjs?v=2']);
    expect(findRemoteCode("s.src = '//example.com/a.js'")).toEqual(['//example.com/a.js']);
    expect(findRemoteCode('<script async src="https://example.com/loader"></script>')).toEqual([
      '<script async src="https://example.com/loader'
    ]);
    expect(findRemoteCode('importScripts("https://unpkg.com/some-lib")')).toEqual(['https://unpkg.com/some-lib']);
  });

  it('leaves alone the addresses that are not scripts', () => {
    const harmless = [
      'createElementNS("http://www.w3.org/2000/svg", "svg")',
      '"http://schemas.openxmlformats.org/wordprocessingml/2006/main"',
      '"see https://stuk.github.io/jszip/documentation/howto/read_zip.html"',
      '"See http://goo.gl/MqrFmX"',
      'a.js = b // c.js',
      '<script src="./popup.js"></script>',
      'new URL("vendor/tesseract/worker.min.js", location.href)'
    ].join('\n');

    expect(findRemoteCode(harmless)).toEqual([]);
  });
});

describe('stripRemoteCode', () => {
  it('leaves nothing to find in jsPDF or in tesseract.js', () => {
    for (const source of [
      vendoredJsPdf(),
      read('node_modules/tesseract.js/src/worker/browser/defaultOptions.js'),
      read('node_modules/tesseract.js/dist/worker.min.js')
    ]) {
      expect(findRemoteCode(stripRemoteCode(source))).toEqual([]);
    }
  });

  it('replaces the PDFObject output mode of jsPDF by a refusal, and keeps the other modes', () => {
    const stripped = stripRemoteCode(vendoredJsPdf());

    expect(stripped).toContain('case "pdfobjectnewwindow": throw new Error(');
    expect(stripped).not.toContain('PDFObject.embed');
    for (const mode of ['save', 'arraybuffer', 'blob', 'bloburl', 'datauristring', 'pdfjsnewwindow', 'dataurlnewwindow']) {
      expect(stripped).toContain(`case "${mode}":`);
    }
  });

  it('takes the address out and keeps the code around it', () => {
    expect(
      stripRemoteCode('var X = "https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js", ut = 1;')
    ).toBe('var X = "", ut = 1;');
    expect(
      stripRemoteCode('workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@v${version}/dist/worker.min.js`,')
    ).toBe('workerPath: `${version}/dist/worker.min.js`,');
    expect(stripRemoteCode('f=o||"https://cdn.jsdelivr.net/npm/tesseract.js-core@v".concat(s.substring(1))')).toBe(
      'f=o||"".concat(s.substring(1))'
    );
  });

  it('changes nothing in code that names no script CDN', () => {
    const code = 'const ns = "http://www.w3.org/2000/svg"; fetch(chrome.runtime.getURL("vendor/x.js"));';
    expect(stripRemoteCode(code)).toBe(code);
  });
});
