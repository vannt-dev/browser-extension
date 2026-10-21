import fs from 'fs';
import path from 'path';

/**
 * Copies the WebAssembly decoders of pdf.js into dist/vendor/pdfjs so that scanned PDFs still
 * turn into pictures. Since pdf.js 5, JPEG 2000 images are decoded by openjpeg.wasm, and since
 * pdf.js 6 JBIG2 and CCITT fax images (what scanners write) by jbig2.wasm; both are loaded from
 * the `wasmUrl` that PdfEngine passes. Without them those pages come out blank.
 *
 * Not copied: qcms_bg.wasm (ICC colours), which pdf.js only uses when its worker fetches files
 * itself, and it does that only for http(s) addresses, never for chrome-extension://; the
 * *_nowasm_fallback.js decoders, for browsers without WebAssembly, which Chrome is not; and
 * quickjs-eval, for PDF scripts, which nothing here runs.
 *
 * The decoders are BSD-licensed and Apache-licensed and ask for their licences to travel with
 * the binaries, so those go beside them.
 */

const VENDOR_DIR = 'dist/vendor/pdfjs';
const SOURCE_DIR = 'node_modules/pdfjs-dist/wasm';

export const ASSETS = [
  'jbig2.wasm',
  'openjpeg.wasm',
  'LICENSE_JBIG2',
  'LICENSE_PDFJS_JBIG2',
  'LICENSE_OPENJPEG',
  'LICENSE_PDFJS_OPENJPEG'
];

export function copyPdfjsAssets() {
  const missing = ASSETS.filter((name) => !fs.existsSync(path.resolve(SOURCE_DIR, name)));
  if (missing.length) {
    throw new Error(
      `Missing pdf.js assets, scanned PDFs would not render:\n` +
        missing.map((name) => `  - ${SOURCE_DIR}/${name}`).join('\n') +
        `\nRun "npm install" to restore them.`
    );
  }

  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  let totalBytes = 0;
  for (const name of ASSETS) {
    const dest = path.join(VENDOR_DIR, name);
    fs.copyFileSync(path.resolve(SOURCE_DIR, name), dest);
    totalBytes += fs.statSync(dest).size;
  }

  return { count: ASSETS.length, totalBytes };
}
