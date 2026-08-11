/**
 * Universal Image Processing Engine (100% Client-Side Canvas API)
 */

export class ImageEngine {
  /**
   * Reads a File or Blob into an HTMLImageElement
   */
  static loadImage(fileOrBlob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fileOrBlob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file.'));
      };
      img.src = url;
    });
  }

  /**
   * Core conversion method
   */
  static async convert(file, options = {}) {
    const {
      targetFormat = 'png', // 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico'
      quality = 0.92,       // 0.1 to 1.0
      width,                // Optional target width
      height,               // Optional target height
      maintainAspectRatio = true,
      fillColor = '#ffffff',// For transparent PNG -> JPG
      watermarkText = null, // Optional text watermark
      watermarkColor = 'rgba(255, 255, 255, 0.6)',
      removeExif = true     // Removes EXIF headers automatically via canvas re-draw
    } = options;

    const img = await this.loadImage(file);

    // Calculate dimensions
    let targetW = width || img.naturalWidth;
    let targetH = height || img.naturalHeight;

    if (maintainAspectRatio && (width || height)) {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (width && !height) {
        targetH = Math.round(width / ratio);
      } else if (!width && height) {
        targetW = Math.round(height * ratio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // Fill background if format doesn't support transparency or user specified JPG fill
    if (targetFormat === 'jpeg' || targetFormat === 'jpg' || fillColor) {
      ctx.fillStyle = fillColor || '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    // Draw main image
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Apply Watermark if requested
    if (watermarkText) {
      const fontSize = Math.max(16, Math.floor(targetW / 25));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = watermarkColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(watermarkText, targetW - 20, targetH - 20);
    }

    // Determine MIME type
    let mimeType = 'image/png';
    if (targetFormat === 'jpg' || targetFormat === 'jpeg') mimeType = 'image/jpeg';
    if (targetFormat === 'webp') mimeType = 'image/webp';
    if (targetFormat === 'bmp') mimeType = 'image/bmp';
    if (targetFormat === 'ico') mimeType = 'image/x-icon';

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Failed to export image format: ${targetFormat}`));
            return;
          }
          resolve({
            blob,
            dataUrl: canvas.toDataURL(mimeType, quality),
            width: targetW,
            height: targetH,
            format: targetFormat,
            originalName: file.name
          });
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Smart Target-Size Compressor: Binary search quality/resolution to hit target KB/MB
   */
  static async compressToTargetSize(file, targetSizeKB, options = {}) {
    let minQuality = 0.05;
    let maxQuality = 0.98;
    let bestResult = null;
    const targetBytes = targetSizeKB * 1024;

    for (let i = 0; i < 6; i++) { // 6 iterations binary search
      const currentQuality = (minQuality + maxQuality) / 2;
      const res = await this.convert(file, {
        ...options,
        targetFormat: options.targetFormat || 'jpeg',
        quality: currentQuality
      });

      bestResult = res;

      if (res.blob.size > targetBytes) {
        maxQuality = currentQuality; // Needs lower quality
      } else {
        minQuality = currentQuality; // Can try higher quality
      }
    }

    return bestResult;
  }

  /**
   * Converts image to Base64 & CSS snippet
   */
  static async toBase64Snippet(file) {
    const res = await this.convert(file);
    return {
      rawBase64: res.dataUrl.split(',')[1],
      dataUri: res.dataUrl,
      cssBackground: `background-image: url("${res.dataUrl}");`,
      htmlImg: `<img src="${res.dataUrl}" alt="${file.name}" />`
    };
  }
}
