/**
 * Universal Image Processing Engine (100% Client-Side Canvas API)
 */

/** Formats the browser can encode natively via canvas.toBlob(). */
const NATIVE_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
};

/** Formats that cannot carry an alpha channel and need a matte behind the image. */
const OPAQUE_FORMATS = new Set(['jpg', 'jpeg']);

/** Icon sizes emitted into a multi-resolution .ico file. */
const ICO_SIZES = [16, 32, 48, 64, 128, 256];

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
      fillColor = null,     // Matte colour; defaults to white only for opaque formats
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

    // Only lay down a matte when the output cannot store alpha, or when the
    // caller asked for one. Filling unconditionally would flatten every
    // transparent PNG the engine produces.
    const needsMatte = OPAQUE_FORMATS.has(targetFormat) || fillColor !== null;
    if (needsMatte) {
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

    const { blob, mimeType } = await this.encodeCanvas(canvas, targetFormat, quality);

    return {
      blob,
      dataUrl: await this.blobToDataUrl(blob),
      mimeType,
      width: targetW,
      height: targetH,
      format: targetFormat,
      originalName: file.name
    };
  }

  /**
   * Encodes a canvas into the requested format.
   *
   * canvas.toBlob() only understands PNG/JPEG/WebP: asking it for image/bmp or
   * image/x-icon silently yields a PNG with a misleading extension, so those two
   * formats are encoded by hand.
   */
  static async encodeCanvas(canvas, targetFormat = 'png', quality = 0.92) {
    const format = String(targetFormat).toLowerCase();

    if (format === 'bmp') {
      return { blob: this.encodeBmp(canvas), mimeType: 'image/bmp' };
    }
    if (format === 'ico') {
      return { blob: await this.encodeIco(canvas), mimeType: 'image/x-icon' };
    }

    const mimeType = NATIVE_MIME[format];
    if (!mimeType) {
      throw new Error(`Unsupported image format: ${targetFormat}`);
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error(`Failed to export image format: ${targetFormat}`));
            return;
          }
          resolve(result);
        },
        mimeType,
        quality
      );
    });

    return { blob, mimeType };
  }

  /**
   * Encodes a canvas as an uncompressed 32-bit BMP (BITMAPV4HEADER).
   *
   * V4 is used rather than the classic 40-byte BITMAPINFOHEADER because it
   * declares the channel bitmasks explicitly, which is what makes the alpha
   * channel survive in readers that would otherwise treat byte 4 as padding.
   */
  static encodeBmp(canvas) {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, width, height);

    const HEADER_SIZE = 14;
    const DIB_SIZE = 108; // BITMAPV4HEADER
    const pixelDataSize = width * height * 4; // 32bpp rows are inherently 4-byte aligned
    const fileSize = HEADER_SIZE + DIB_SIZE + pixelDataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // BITMAPFILEHEADER
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4d); // 'M'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true); // reserved
    view.setUint32(10, HEADER_SIZE + DIB_SIZE, true); // pixel data offset

    // BITMAPV4HEADER
    view.setUint32(14, DIB_SIZE, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true); // positive height => bottom-up rows
    view.setUint16(26, 1, true); // colour planes
    view.setUint16(28, 32, true); // bits per pixel
    view.setUint32(30, 3, true); // BI_BITFIELDS
    view.setUint32(34, pixelDataSize, true);
    view.setInt32(38, 2835, true); // ~72 DPI horizontal
    view.setInt32(42, 2835, true); // ~72 DPI vertical
    view.setUint32(46, 0, true); // palette colours used
    view.setUint32(50, 0, true); // important colours
    view.setUint32(54, 0x00ff0000, true); // red mask
    view.setUint32(58, 0x0000ff00, true); // green mask
    view.setUint32(62, 0x000000ff, true); // blue mask
    view.setUint32(66, 0xff000000, true); // alpha mask
    view.setUint32(70, 0x57696e20, false); // 'Win ' colour space, stored big-endian

    // Pixel array: BGRA, bottom row first.
    let offset = HEADER_SIZE + DIB_SIZE;
    for (let y = height - 1; y >= 0; y--) {
      let src = y * width * 4;
      for (let x = 0; x < width; x++) {
        bytes[offset++] = data[src + 2]; // B
        bytes[offset++] = data[src + 1]; // G
        bytes[offset++] = data[src];     // R
        bytes[offset++] = data[src + 3]; // A
        src += 4;
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }

  /**
   * Encodes a canvas as a multi-resolution .ico containing PNG payloads.
   *
   * Every standard icon size that fits inside the source is emitted, so the
   * result works as a real favicon rather than a single rescaled frame.
   */
  static async encodeIco(canvas) {
    const maxSide = Math.min(Math.max(canvas.width, canvas.height), 256);
    const sizes = ICO_SIZES.filter((size) => size <= maxSide);
    if (!sizes.length) sizes.push(Math.max(1, maxSide));

    const frames = [];
    for (const size of sizes) {
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = size;
      frameCanvas.height = size;
      const frameCtx = frameCanvas.getContext('2d');
      frameCtx.drawImage(canvas, 0, 0, size, size);

      const blob = await new Promise((resolve, reject) => {
        frameCanvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('Failed to encode ICO frame.'))),
          'image/png'
        );
      });
      frames.push({ size, data: new Uint8Array(await blob.arrayBuffer()) });
    }

    const DIR_SIZE = 6;
    const ENTRY_SIZE = 16;
    const payloadOffset = DIR_SIZE + ENTRY_SIZE * frames.length;
    const totalSize = payloadOffset + frames.reduce((sum, frame) => sum + frame.data.length, 0);

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // ICONDIR
    view.setUint16(0, 0, true); // reserved
    view.setUint16(2, 1, true); // type 1 = icon
    view.setUint16(4, frames.length, true);

    let entryOffset = DIR_SIZE;
    let dataOffset = payloadOffset;
    for (const frame of frames) {
      // 256 is encoded as 0 in the single-byte dimension fields.
      view.setUint8(entryOffset, frame.size >= 256 ? 0 : frame.size);
      view.setUint8(entryOffset + 1, frame.size >= 256 ? 0 : frame.size);
      view.setUint8(entryOffset + 2, 0); // palette size
      view.setUint8(entryOffset + 3, 0); // reserved
      view.setUint16(entryOffset + 4, 1, true); // colour planes
      view.setUint16(entryOffset + 6, 32, true); // bits per pixel
      view.setUint32(entryOffset + 8, frame.data.length, true);
      view.setUint32(entryOffset + 12, dataOffset, true);

      bytes.set(frame.data, dataOffset);
      dataOffset += frame.data.length;
      entryOffset += ENTRY_SIZE;
    }

    return new Blob([buffer], { type: 'image/x-icon' });
  }

  /**
   * Removes a uniform background by flood-filling inward from the image border.
   *
   * This is a deterministic colour-distance segmentation, not a learned model:
   * it excels on studio/solid-colour backdrops and will not cleanly separate a
   * subject from a busy scene. Only pixels connected to the border are cleared,
   * so colours that also appear inside the subject are preserved.
   */
  static async removeBackground(file, options = {}) {
    const {
      tolerance = 32,     // Max per-channel colour distance treated as background
      featherRadius = 1,  // Softens the cut edge to avoid a hard halo
      backgroundColor = null // Override the auto-detected backdrop colour
    } = options;

    const img = await this.loadImage(file);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const bg = backgroundColor ? this.parseRgb(backgroundColor) : this.detectBorderColor(data, width, height);
    const toleranceSq = tolerance * tolerance * 3;

    // Flood fill inward from every border pixel that matches the backdrop.
    const isBackground = new Uint8Array(width * height);
    const stack = new Int32Array(width * height);
    let stackSize = 0;

    const pushIfMatching = (index) => {
      if (isBackground[index]) return;
      const offset = index * 4;
      const dr = data[offset] - bg.r;
      const dg = data[offset + 1] - bg.g;
      const db = data[offset + 2] - bg.b;
      if (dr * dr + dg * dg + db * db <= toleranceSq) {
        isBackground[index] = 1;
        stack[stackSize++] = index;
      }
    };

    for (let x = 0; x < width; x++) {
      pushIfMatching(x);
      pushIfMatching((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      pushIfMatching(y * width);
      pushIfMatching(y * width + width - 1);
    }

    while (stackSize > 0) {
      const index = stack[--stackSize];
      const x = index % width;
      const y = (index - x) / width;

      if (x > 0) pushIfMatching(index - 1);
      if (x < width - 1) pushIfMatching(index + 1);
      if (y > 0) pushIfMatching(index - width);
      if (y < height - 1) pushIfMatching(index + width);
    }

    // Clear the background, then ramp alpha on the subject pixels touching it so
    // the cut does not leave a jagged one-pixel fringe of backdrop colour.
    let clearedPixels = 0;
    for (let index = 0; index < isBackground.length; index++) {
      const offset = index * 4;
      if (isBackground[index]) {
        data[offset + 3] = 0;
        clearedPixels++;
        continue;
      }

      if (featherRadius > 0 && this.touchesBackground(isBackground, index, width, height, featherRadius)) {
        const dr = data[offset] - bg.r;
        const dg = data[offset + 1] - bg.g;
        const db = data[offset + 2] - bg.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        const ramp = Math.min(1, distance / (tolerance * 2 || 1));
        data[offset + 3] = Math.round(data[offset + 3] * ramp);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const { blob } = await this.encodeCanvas(canvas, 'png');

    return {
      blob,
      dataUrl: await this.blobToDataUrl(blob),
      width,
      height,
      format: 'png',
      backgroundColor: bg,
      /** Share of the image that was cleared; a near-zero value means the backdrop was not uniform. */
      clearedRatio: clearedPixels / (width * height),
      originalName: file.name
    };
  }

  /**
   * Picks the dominant colour along the image border, quantised into 16-level
   * buckets so sensor noise in a flat backdrop still lands in one bucket.
   */
  static detectBorderColor(data, width, height) {
    const buckets = new Map();

    const sample = (index) => {
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count++;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    };

    for (let x = 0; x < width; x++) {
      sample(x);
      sample((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      sample(y * width);
      sample(y * width + width - 1);
    }

    let dominant = null;
    for (const bucket of buckets.values()) {
      if (!dominant || bucket.count > dominant.count) dominant = bucket;
    }
    if (!dominant) return { r: 255, g: 255, b: 255 };

    return {
      r: Math.round(dominant.r / dominant.count),
      g: Math.round(dominant.g / dominant.count),
      b: Math.round(dominant.b / dominant.count)
    };
  }

  /** True when any pixel within `radius` of `index` was classified as background. */
  static touchesBackground(isBackground, index, width, height, radius) {
    const x = index % width;
    const y = (index - x) / width;

    for (let dy = -radius; dy <= radius; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        if (isBackground[ny * width + nx]) return true;
      }
    }
    return false;
  }

  /** Parses '#rrggbb', '#rgb' or 'rgb(r, g, b)' into channel values. */
  static parseRgb(color) {
    if (typeof color === 'object' && color !== null) return color;

    const hex = String(color).trim();
    const shortMatch = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
    if (shortMatch) {
      return {
        r: parseInt(shortMatch[1] + shortMatch[1], 16),
        g: parseInt(shortMatch[2] + shortMatch[2], 16),
        b: parseInt(shortMatch[3] + shortMatch[3], 16)
      };
    }

    const longMatch = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (longMatch) {
      return {
        r: parseInt(longMatch[1], 16),
        g: parseInt(longMatch[2], 16),
        b: parseInt(longMatch[3], 16)
      };
    }

    const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(hex);
    if (rgbMatch) {
      return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
    }

    throw new Error(`Unsupported colour value: ${color}`);
  }

  /**
   * Smart Target-Size Compressor: Binary search quality/resolution to hit target KB/MB
   */
  static async compressToTargetSize(file, targetSizeKB, options = {}) {
    let minQuality = 0.05;
    let maxQuality = 0.98;
    let bestResult = null;
    let smallestResult = null;
    const targetBytes = targetSizeKB * 1024;

    for (let i = 0; i < 6; i++) { // 6 iterations binary search
      const currentQuality = (minQuality + maxQuality) / 2;
      const res = await this.convert(file, {
        ...options,
        targetFormat: options.targetFormat || 'jpeg',
        quality: currentQuality
      });

      // Keep the largest result that still fits the budget rather than whatever
      // the final probe happened to be, which may overshoot the target.
      if (res.blob.size <= targetBytes) {
        if (!bestResult || res.blob.size > bestResult.blob.size) bestResult = res;
        minQuality = currentQuality; // Can try higher quality
      } else {
        maxQuality = currentQuality; // Needs lower quality
      }

      if (!smallestResult || res.blob.size < smallestResult.blob.size) smallestResult = res;
    }

    // Nothing fit the budget: hand back the smallest attempt so the caller still
    // gets a usable file instead of null.
    return bestResult || smallestResult;
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

  /** Reads a Blob into a data: URL. */
  static blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to encode image as data URL.'));
      reader.readAsDataURL(blob);
    });
  }
}
