/**
 * Which files the converter treats as images. One list for the popup and the
 * dashboard, so a format added here is routed the same way in both.
 *
 * AVIF is decoded by the browser; HEIC and HEIF go through engine/heic-decoder.js.
 */
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif', 'avif', 'heic', 'heif'];

export function extensionOf(name) {
  return String(name || '').split('.').pop().toLowerCase();
}

export function isImageFile(file) {
  return IMAGE_EXTENSIONS.includes(extensionOf(file?.name));
}

export function isPdfFile(file) {
  return extensionOf(file?.name) === 'pdf';
}
