import fs from 'fs';
import path from 'path';

/**
 * Copies every Tesseract.js runtime asset into dist/vendor/tesseract so OCR runs
 * fully offline. Manifest V3 forbids loading remote scripts, so the worker script
 * and the WASM core must ship inside the extension package.
 *
 * Only the LSTM cores are copied: AiEngine always spawns workers with oem = 1
 * (LSTM_ONLY), which makes tesseract.js request the `-lstm` core variants and the
 * `4.0.0_best_int` traineddata. The `.wasm.js` glue files embed their WASM binary
 * as base64, so the sibling `.wasm` files are not needed.
 */

const VENDOR_DIR = 'dist/vendor/tesseract';

const ASSETS = [
  { from: 'node_modules/tesseract.js/dist/worker.min.js', to: 'worker.min.js' },
  { from: 'node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', to: 'tesseract-core-simd-lstm.wasm.js' },
  { from: 'node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', to: 'tesseract-core-lstm.wasm.js' },
  { from: 'node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', to: 'lang/eng.traineddata.gz' },
  { from: 'node_modules/@tesseract.js-data/vie/4.0.0_best_int/vie.traineddata.gz', to: 'lang/vie.traineddata.gz' }
];

export function copyTesseractAssets() {
  const missing = ASSETS.filter((asset) => !fs.existsSync(path.resolve(asset.from)));
  if (missing.length) {
    throw new Error(
      `Missing Tesseract assets, OCR would fall back to the CDN and break under MV3:\n` +
        missing.map((asset) => `  - ${asset.from}`).join('\n') +
        `\nRun "npm install" to restore them.`
    );
  }

  let totalBytes = 0;
  for (const asset of ASSETS) {
    const dest = path.join(VENDOR_DIR, asset.to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.resolve(asset.from), dest);
    totalBytes += fs.statSync(dest).size;
  }

  return { count: ASSETS.length, totalBytes };
}

// Allow running standalone: node scripts/copy-tesseract-assets.js
if (process.argv[1] && process.argv[1].endsWith('copy-tesseract-assets.js')) {
  const { count, totalBytes } = copyTesseractAssets();
  console.log(`✅ Copied ${count} Tesseract assets (${(totalBytes / 1024 / 1024).toFixed(2)} MB) into ${VENDOR_DIR}`);
}
