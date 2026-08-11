import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const copyExtensionAssets = () => {
  return {
    name: 'copy-extension-assets',
    writeBundle() {
      if (!fs.existsSync('dist')) fs.mkdirSync('dist');
      if (fs.existsSync('manifest.json')) {
        fs.copyFileSync('manifest.json', 'dist/manifest.json');
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
