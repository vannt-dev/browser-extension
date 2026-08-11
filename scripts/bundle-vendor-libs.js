import fs from 'fs';
import path from 'path';
import { build } from 'vite';

const libDir = path.resolve('lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

console.log('⚡ Bundling standalone vendor libraries into lib/...');

async function bundleVendors() {
  const vendors = [
    { name: 'papaparse', entry: path.resolve('node_modules/papaparse/papaparse.js'), file: 'papaparse.js' },
    { name: 'yaml', entry: path.resolve('node_modules/yaml/browser/index.js'), file: 'yaml.js' },
    { name: 'mammoth', entry: path.resolve('node_modules/mammoth/mammoth.browser.js'), file: 'mammoth.js' },
    { name: 'jspdf', entry: path.resolve('node_modules/jspdf/dist/jspdf.es.min.js'), file: 'jspdf.js' },
    { name: 'marked', entry: path.resolve('node_modules/marked/lib/marked.esm.js'), file: 'marked.js' },
    { name: 'jszip', entry: path.resolve('node_modules/jszip/dist/jszip.min.js'), file: 'jszip.js' }
  ];

  for (const v of vendors) {
    if (!fs.existsSync(v.entry)) {
      console.warn(`⚠️ Entry module ${v.entry} does not exist, skipping...`);
      continue;
    }
    console.log(`Building vendor ${v.name}...`);
    await build({
      build: {
        write: true,
        outDir: 'lib',
        emptyOutDir: false,
        lib: {
          entry: v.entry,
          formats: ['es'],
          fileName: () => v.file
        }
      },
      configFile: false
    });
  }

  console.log('✅ Vendor libraries bundled into lib/ successfully!');
}

bundleVendors().catch(err => {
  console.error('Error bundling vendors:', err);
});
