import fs from 'fs';
import path from 'path';

const brainDir = `C:\\Users\\vance\\.gemini\\antigravity-cli\\brain\\1ee7aeca-5af6-4ae2-b4b9-4fbe1065b8da`;
const targetStoreFile = path.resolve('assets/store/store_icon_128.jpg');

const files = fs.readdirSync(brainDir);
const smoothIconFile = files.find(f => f.startsWith('smooth_store_icon_128_'));

if (smoothIconFile) {
  fs.copyFileSync(path.join(brainDir, smoothIconFile), targetStoreFile);
  console.log('✅ Updated assets/store/store_icon_128.jpg with new smooth icon design!');
} else {
  console.error('❌ Could not find smooth icon file in brain directory');
}
