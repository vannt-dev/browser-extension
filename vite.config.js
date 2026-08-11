import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const copyExtensionAssets = () => {
  return {
    name: 'copy-extension-assets',
    writeBundle() {
      if (!fs.existsSync('dist')) fs.mkdirSync('dist');
      
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
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
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
