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

      if (fs.existsSync('assets')) {
        fs.cpSync('assets', 'dist/assets', { recursive: true });
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
