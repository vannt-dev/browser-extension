import fs from 'fs';
import path from 'path';

const brainDir = `C:\\Users\\vance\\.gemini\\antigravity-cli\\brain\\1ee7aeca-5af6-4ae2-b4b9-4fbe1065b8da`;
const targetStoreDir = path.resolve('assets/store');

if (!fs.existsSync(targetStoreDir)) {
  fs.mkdirSync(targetStoreDir, { recursive: true });
}

// Find generated images
const files = fs.readdirSync(brainDir);
const iconFile = files.find(f => f.startsWith('store_icon_128_'));
const bannerFile = files.find(f => f.startsWith('store_promo_banner_'));

if (iconFile) {
  fs.copyFileSync(path.join(brainDir, iconFile), path.join(targetStoreDir, 'store_icon_128.jpg'));
  console.log('Copied store_icon_128.jpg to assets/store/');
}

if (bannerFile) {
  fs.copyFileSync(path.join(brainDir, bannerFile), path.join(targetStoreDir, 'store_promo_banner.jpg'));
  console.log('Copied store_promo_banner.jpg to assets/store/');
}
