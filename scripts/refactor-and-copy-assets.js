import fs from 'fs';
import path from 'path';

const brainDir = `C:\\Users\\vance\\.gemini\\antigravity-cli\\brain\\1ee7aeca-5af6-4ae2-b4b9-4fbe1065b8da`;
const storeAssetsDir = path.resolve('store-assets');
const screenshotsDir = path.resolve('store-assets/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find generated screenshots from brain dir
const files = fs.readdirSync(brainDir);
const sc1 = files.find(f => f.startsWith('screenshot_1_image_converter_'));
const sc2 = files.find(f => f.startsWith('screenshot_2_doc_pdf_studio_'));
const sc3 = files.find(f => f.startsWith('screenshot_3_ai_ocr_bg_removal_'));
const sc4 = files.find(f => f.startsWith('screenshot_4_auto_download_converter_'));
const promo = files.find(f => f.startsWith('store_promo_banner_'));
const icon = files.find(f => f.startsWith('smooth_store_icon_128_') || f.startsWith('store_icon_128_'));

if (sc1) fs.copyFileSync(path.join(brainDir, sc1), path.join(screenshotsDir, 'screenshot-1-image-converter.jpg'));
if (sc2) fs.copyFileSync(path.join(brainDir, sc2), path.join(screenshotsDir, 'screenshot-2-docx-pdf-studio.jpg'));
if (sc3) fs.copyFileSync(path.join(brainDir, sc3), path.join(screenshotsDir, 'screenshot-3-ai-ocr-bg-removal.jpg'));
if (sc4) fs.copyFileSync(path.join(brainDir, sc4), path.join(screenshotsDir, 'screenshot-4-auto-download.jpg'));

if (promo) fs.copyFileSync(path.join(brainDir, promo), path.join(storeAssetsDir, 'promo-banner.jpg'));
if (icon) fs.copyFileSync(path.join(brainDir, icon), path.join(storeAssetsDir, 'store-icon.jpg'));

console.log('✅ Copied all store assets and screenshots into store-assets/');
