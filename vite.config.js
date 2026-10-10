import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { copyTesseractAssets } from './scripts/copy-tesseract-assets.js';

const copyExtensionAssets = () => {
  return {
    name: 'copy-extension-assets',
    writeBundle() {
      if (!fs.existsSync('dist')) fs.mkdirSync('dist');

      // OCR must run offline: MV3 blocks the CDN paths tesseract.js defaults to.
      const { count, totalBytes } = copyTesseractAssets();
      console.log(`  tesseract assets  ${count} files │ ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

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
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/popup.html'),
        dashboard: resolve(__dirname, 'dashboard/dashboard.html'),
        background: resolve(__dirname, 'background/background.js')
      },
      output: {
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
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdf-lib')) return 'vendor-pdf-lib';
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
  plugins: [copyExtensionAssets()]
});
