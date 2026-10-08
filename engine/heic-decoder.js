/**
 * HEIC / HEIF input (the format iPhones save photos in).
 *
 * Chrome cannot decode HEVC-coded HEIF images, so they are decoded here with
 * libheif (through the `heic-to` package) and handed on as PNG, which every
 * other part of the image engine already reads. AVIF, the AV1-coded sibling in
 * the same container, is decoded by the browser itself and needs none of this.
 *
 * The decoder is about 3 MB, so it is only loaded when a HEIC file shows up.
 */

/** `ftyp` brands of HEVC-coded HEIF stills and sequences. */
const HEVC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);
/** Brands of the generic HEIF container: the coding is named by the compatible brands. */
const GENERIC_BRANDS = new Set(['mif1', 'msf1']);
const AV1_BRANDS = new Set(['avif', 'avis']);

/**
 * Whether a file is a HEIC image, judged by its header rather than its name:
 * phones and chat apps routinely rename files.
 * @param {Blob} file
 * @returns {Promise<boolean>}
 */
export async function isHeic(file) {
  if (!file || typeof file.slice !== 'function' || file.size < 12) return false;
  const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const text = (start) => String.fromCharCode(...bytes.subarray(start, start + 4));
  if (text(4) !== 'ftyp') return false;

  const boxSize = Math.min(new DataView(bytes.buffer).getUint32(0), bytes.length);
  const brands = [text(8)];
  // Major brand, minor version, then the compatible brands, four bytes each.
  for (let offset = 16; offset + 4 <= boxSize; offset += 4) brands.push(text(offset));

  if (brands.some((brand) => AV1_BRANDS.has(brand))) return false;
  if (HEVC_BRANDS.has(brands[0])) return true;
  return GENERIC_BRANDS.has(brands[0]) && brands.some((brand) => HEVC_BRANDS.has(brand));
}

let decoderPromise = null;

/**
 * Decodes a HEIC image to a PNG blob.
 * @param {Blob} file
 * @returns {Promise<Blob>}
 */
export async function decodeHeic(file) {
  // The CSP build: extension pages may not evaluate strings as code.
  decoderPromise ||= import('heic-to/csp');
  const { heicTo } = await decoderPromise;
  try {
    return await heicTo({ blob: file, type: 'image/png' });
  } catch (error) {
    throw new Error(`Failed to decode HEIC image: ${error?.message || error}`);
  }
}
