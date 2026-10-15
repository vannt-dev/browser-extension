import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { ASSETS } from '../scripts/copy-tesseract-assets.js';

/**
 * The worker picks its core file by what the browser supports (relaxed SIMD, SIMD, neither) and
 * loads it from the package. A core that does not ship fails OCR only on the browsers that pick
 * it, which no unit test runs: tesseract.js 7 added the relaxed SIMD core, the one Chrome takes.
 */
describe('Tesseract assets', () => {
  it('ship every LSTM core the installed worker can load', () => {
    const getCore = fs.readFileSync('node_modules/tesseract.js/src/worker-script/browser/getCore.js', 'utf-8');
    const cores = [...new Set(getCore.match(/tesseract-core[a-z-]*-lstm\.wasm\.js/g))];
    expect(cores.length).toBeGreaterThan(0);
    expect(ASSETS.map((asset) => asset.to)).toEqual(expect.arrayContaining(cores));
  });
});
