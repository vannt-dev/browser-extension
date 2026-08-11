import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import JSZip from 'jszip';

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));
const version = pkg.version || '1.0.0';

console.log(`⚡ Packaging Chrome Extension Release v${version}...`);

// 1. Run unit test suite first
console.log('🧪 Running automated unit tests...');
execSync('npm test', { stdio: 'inherit' });

// 2. Build production dist
console.log('📦 Running npm run build...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
const zipsDir = path.join(distDir, 'zips');

if (!fs.existsSync(distDir)) {
  console.error('❌ Build directory dist/ does not exist!');
  process.exit(1);
}

if (!fs.existsSync(zipsDir)) {
  fs.mkdirSync(zipsDir, { recursive: true });
}

// 2. Clean up any legacy zip files in root directory
const rootFiles = fs.readdirSync(path.resolve('.'));
rootFiles.forEach(file => {
  if (file.endsWith('.zip')) {
    try {
      fs.unlinkSync(path.resolve(file));
      console.log(`🧹 Cleaned up legacy root zip: ${file}`);
    } catch (e) {}
  }
});

// 3. Add dist files to JSZip (excluding dist/zips folder)
const zip = new JSZip();

function addFilesRecursively(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.relative(distDir, fullPath);

    // Skip the zips folder itself
    if (relativePath.startsWith('zips')) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addFilesRecursively(fullPath, zipFolder.folder(item));
    } else {
      const fileData = fs.readFileSync(fullPath);
      zipFolder.file(item, fileData);
    }
  }
}

addFilesRecursively(distDir, zip);

// 4. Output Zip to dist/zips/
const zipFilename = `universal-file-converter-v${version}.zip`;
const outputZipPath = path.join(zipsDir, zipFilename);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((content) => {
  fs.writeFileSync(outputZipPath, content);
  console.log(`\n🎉 THÀNH CÔNG! Đã đóng gói phiên bản v${version} vào thư mục dist/zips/:`);
  console.log(`📁 File location: ${outputZipPath}`);
  console.log(`📊 Size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
});
