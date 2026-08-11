import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = path.resolve('assets/store/store_icon_128.jpg');
const outputDir = path.resolve('assets/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(sourceImage)) {
  console.error(`❌ Source image ${sourceImage} not found!`);
  process.exit(1);
}

const sizes = [16, 32, 48, 128];

async function generateAppIcons() {
  console.log('⚡ Resizing app icons from store logo...');
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(outputPath);
    console.log(`✅ Generated ${outputPath} (${size}x${size})`);
  }
}

generateAppIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
