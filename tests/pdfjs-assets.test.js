import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { ASSETS } from '../scripts/copy-pdfjs-assets.js';

/**
 * The pdf.js worker loads its image decoders by file name from the `wasmUrl` folder. A decoder
 * that does not ship only shows as blank scanned pages in the browser, which no unit test
 * renders, so the names the installed worker asks for are checked against what the build copies.
 */
describe('pdf.js assets', () => {
  it('ship every WebAssembly decoder the installed worker loads', () => {
    const worker = fs.readFileSync('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', 'utf-8');
    const decoders = [...new Set([...worker.matchAll(/_filename\s*=\s*"([\w.-]+\.wasm)"/g)].map((m) => m[1]))];
    expect(decoders.length).toBeGreaterThan(0);
    expect(ASSETS).toEqual(expect.arrayContaining(decoders));
  });

  it('ship the licence of every decoder beside it', () => {
    for (const decoder of ASSETS.filter((name) => name.endsWith('.wasm'))) {
      const stem = decoder.replace(/\.wasm$/, '').toUpperCase();
      expect(ASSETS).toEqual(expect.arrayContaining([`LICENSE_${stem}`, `LICENSE_PDFJS_${stem}`]));
    }
  });
});
