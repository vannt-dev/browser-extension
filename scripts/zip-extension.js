import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import JSZip from 'jszip';

console.log('⚡ Starting Chrome Web Store Build & Zip Packaging...');

// 1. Build production dist
console.log('📦 Running npm run build...');
execSync('npm run build', { stdio: 'inherit' });

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Build directory dist/ does not exist!');
  process.exit(1);
}

// 2. Recursively add files to JSZip
const zip = new JSZip();

function addFilesRecursively(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
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

// 3. Generate output zip file
const outputZipName = 'universal-file-converter-v1.0.0.zip';
const outputZipPath = path.resolve(outputZipName);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((content) => {
  fs.writeFileSync(outputZipPath, content);
  console.log(`\n🎉 THÀNH CÔNG! Đã đóng gói file ZIP sẵn sàng tải lên Chrome Web Store:`);
  console.log(`📁 File path: ${outputZipPath}`);
  console.log(`📊 Size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
});
