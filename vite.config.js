import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { copyPdfjsAssets } from './scripts/copy-pdfjs-assets.js';
import { copyTesseractAssets } from './scripts/copy-tesseract-assets.js';
import { findRemoteCodeInDir, stripRemoteCode } from './scripts/remote-code.js';

const LICENCE_HEADER =
  '/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */';

// See scripts/remote-code.js: the libraries name scripts on a CDN in branches nothing here runs,
// and the Chrome Web Store rejects the package for the names alone.
const stripRemoteCodeFromChunks = () => {
  return {
    name: 'strip-remote-code',
    renderChunk(code) {
      const stripped = stripRemoteCode(code);
      return stripped === code ? null : { code: stripped, map: null };
    }
  };
};

// tesseract.js reads its version with require('../../../package.json').version. Vite 8 (Rolldown)
// then ships the whole package.json, whose scripts name a .js address on localhost; only the
// version goes in.
const tesseractVersionOnly = () => {
  return {
    name: 'tesseract-version-only',
    enforce: 'pre',
    load(id) {
      if (!/node_modules[\\/]tesseract\.js[\\/]package\.json$/.test(id)) return null;
      const { version } = JSON.parse(fs.readFileSync(id, 'utf-8'));
      return JSON.stringify({ version });
    }
  };
};

const copyExtensionAssets = () => {
  return {
    name: 'copy-extension-assets',
    writeBundle() {
      if (!fs.existsSync('dist')) fs.mkdirSync('dist');

      // OCR must run offline: MV3 blocks the CDN paths tesseract.js defaults to.
      const { count, totalBytes } = copyTesseractAssets();
      console.log(`  tesseract assets  ${count} files │ ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

      // Scanned PDFs need pdf.js's WebAssembly decoders, which it loads by address, not import.
      const pdfjs = copyPdfjsAssets();
      console.log(`  pdf.js assets     ${pdfjs.count} files │ ${(pdfjs.totalBytes / 1024 / 1024).toFixed(2)} MB`);

      // Copy and adjust manifest for dist folder
      if (fs.existsSync('manifest.json')) {
        const manifestStr = fs.readFileSync('manifest.json', 'utf-8');
        const manifest = JSON.parse(manifestStr);

        // Standardize relative paths for standalone dist upload
        manifest.action.default_popup = 'popup/popup.html';
        manifest.options_page = 'dashboard/dashboard.html';
        manifest.background.service_worker = 'background/background.js';

        fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
      }

      // Only what the extension loads. assets/store holds pictures made for a store page, which
      // nothing in the extension shows; they added over a megabyte to the package.
      if (fs.existsSync('assets/icons')) {
        fs.cpSync('assets/icons', 'dist/assets/icons', { recursive: true });
      }

      // The manifest names a default_locale: without _locales beside it the browser refuses the package.
      fs.cpSync('_locales', 'dist/_locales', { recursive: true });

      // The HEIC decoder (heic-to, built on libheif) is LGPL-3.0: its licence and a notice saying
      // where it is and where its source lives have to travel with the packaged extension.
      const heicLicence = 'node_modules/heic-to/LICENSE';
      if (fs.existsSync(heicLicence)) {
        const heicVersion = JSON.parse(fs.readFileSync('node_modules/heic-to/package.json', 'utf-8')).version;
        fs.mkdirSync('dist/licenses', { recursive: true });
        fs.copyFileSync(heicLicence, 'dist/licenses/heic-to-LGPL-3.0.txt');
        fs.writeFileSync(
          'dist/THIRD_PARTY_NOTICES.txt',
          [
            'Third-party software shipped with this extension under a copyleft licence',
            '',
            `heic-to ${heicVersion} (https://github.com/hoppergee/heic-to), which bundles libheif`,
            '(https://github.com/strukturag/libheif), decodes HEIC/HEIF images. Both are licensed under the',
            'GNU Lesser General Public License, version 3 or later: licenses/heic-to-LGPL-3.0.txt. That',
            'licence supplements the GNU General Public License, version 3:',
            'https://www.gnu.org/licenses/gpl-3.0.txt',
            '',
            'The library is the file chunks/vendor-heic-*.js, unmodified and separate from the rest of the',
            'extension, so it can be replaced by a build of your own from the source above.',
            ''
          ].join('\n')
        );
      }

      // SheetJS Community Edition (spreadsheets) is Apache-2.0, which asks for its licence to
      // travel with the copies handed on.
      const sheetLicence = 'node_modules/xlsx/LICENSE';
      if (fs.existsSync(sheetLicence)) {
        const sheetVersion = JSON.parse(fs.readFileSync('node_modules/xlsx/package.json', 'utf-8')).version;
        fs.mkdirSync('dist/licenses', { recursive: true });
        fs.copyFileSync(sheetLicence, 'dist/licenses/xlsx-Apache-2.0.txt');
        fs.appendFileSync(
          'dist/THIRD_PARTY_NOTICES.txt',
          [
            '',
            'Other third-party software whose licence asks for a copy to ship with it',
            '',
            `SheetJS Community Edition (xlsx) ${sheetVersion} (https://git.sheetjs.com/sheetjs/sheetjs),`,
            'Copyright (C) 2012-present SheetJS LLC, reads and writes spreadsheets. It is licensed under the',
            'Apache License, version 2.0: licenses/xlsx-Apache-2.0.txt. It is the file',
            'chunks/vendor-xlsx-*.js.',
            ''
          ].join('\n')
        );
      }

      // pdf.js's image decoders are WebAssembly builds of PDFium's JBIG2 code and of OpenJPEG,
      // whose BSD licences ask for their notices to ship with the binaries.
      if (fs.existsSync('dist/vendor/pdfjs')) {
        fs.appendFileSync(
          'dist/THIRD_PARTY_NOTICES.txt',
          [
            '',
            'pdf.js image decoders',
            '',
            'vendor/pdfjs/jbig2.wasm (JBIG2 and CCITT fax images, from PDFium) and',
            'vendor/pdfjs/openjpeg.wasm (JPEG 2000 images, from OpenJPEG) come with pdf.js',
            '(https://github.com/mozilla/pdf.js). Their licences are the LICENSE_* files beside them.',
            ''
          ].join('\n')
        );
      }

      // The stamp font is Noto Sans Bold, cut down to Latin and Vietnamese. The SIL Open Font
      // License asks for its text to travel with the font.
      if (fs.existsSync('assets/fonts/OFL.txt')) {
        fs.mkdirSync('dist/licenses', { recursive: true });
        fs.copyFileSync('assets/fonts/OFL.txt', 'dist/licenses/NotoSans-OFL-1.1.txt');
        fs.appendFileSync(
          'dist/THIRD_PARTY_NOTICES.txt',
          [
            '',
            'Font',
            '',
            'Noto Sans Bold (https://github.com/notofonts/latin-greek-cyrillic), Copyright 2022 The Noto',
            'Project Authors, writes the text of PDF stamps. It is licensed under the SIL Open Font',
            'License, version 1.1: licenses/NotoSans-OFL-1.1.txt. The file assets/NotoSans-Bold-stamp-*.ttf',
            'holds only its Latin, Latin Extended and Vietnamese letters and punctuation.',
            ''
          ].join('\n')
        );
      }

      // Last, over everything that was written: a package that names remotely hosted code is
      // not one to upload.
      const offenders = findRemoteCodeInDir('dist');
      if (offenders.length) {
        throw new Error(
          'The package names remotely hosted code, which Manifest V3 forbids:\n' +
            offenders.map(({ file, found }) => `  - ${file}: ${found.join(', ')}`).join('\n') +
            '\nTake it out in scripts/remote-code.js.'
        );
      }
    }
  };
};

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    modulePreload: false, // Disables Vite modulepreload links to prevent Chrome Extension cross-world warnings
    rolldownOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup/popup.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard/dashboard.html'),
        background: resolve(import.meta.dirname, 'background/background.js')
      },
      output: {
        // The bundler drops the licence comment of popup.js and dashboard.js because it sits on
        // an import it rewrites, so those two entry files get it back as a banner.
        banner: (chunk) => (['popup', 'dashboard'].includes(chunk.name) ? LICENCE_HEADER : ''),
        // Keep /*! licence comments (ours and the vendors') through minification, which
        // otherwise drops them.
        comments: { legal: true },
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/background.js';
          }
          return '[name]/[name].js';
        },
        // Keep each heavy vendor in its own chunk so the popup does not have to
        // parse the OCR/PDF/DOCX payloads before it can render.
        manualChunks(id) {
          if (id.includes('node_modules/tesseract.js')) return 'vendor-tesseract';
          if (id.includes('node_modules/pdfjs-dist')) return 'vendor-pdfjs';
          // libheif is LGPL: it stays a file of its own, replaceable without rebuilding the rest.
          if (id.includes('node_modules/heic-to')) return 'vendor-heic';
          if (id.includes('node_modules/@cantoo/pdf-lib') || id.includes('node_modules/@pdf-lib')) return 'vendor-pdf-lib';
          // The stamp font's reader, loaded only when a stamp has text.
          if (/node_modules\/(@cantoo\/fontkit|brotli|restructure|dfa)\//.test(id)) return 'vendor-fontkit';
          if (id.includes('node_modules/xlsx')) return 'vendor-xlsx';
          if (id.includes('/lib/mammoth.js') || id.includes('/lib/marked.js')) return 'vendor-doc';
          if (id.includes('/lib/jspdf') || id.includes('/lib/html2canvas') || id.includes('/lib/index.es')) return 'vendor-pdf-export';
          if (id.includes('/lib/jszip.js')) return 'vendor-zip';
          if (id.includes('/lib/papaparse.js') || id.includes('/lib/yaml.js')) return 'vendor-data';
          return undefined;
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name]/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  plugins: [tesseractVersionOnly(), stripRemoteCodeFromChunks(), copyExtensionAssets()]
});
