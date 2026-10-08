import { describe, it, expect, vi, afterEach } from 'vitest';
import { IMAGE_EXTENSIONS, extensionOf, isImageFile, isPdfFile } from '../engine/file-types.js';

const heicTo = vi.fn();
vi.mock('heic-to/csp', () => ({ heicTo }));

const { decodeHeic, isHeic } = await import('../engine/heic-decoder.js');
const { ImageEngine } = await import('../engine/image-engine.js');

/** The `ftyp` box an ISO media file opens with: size, "ftyp", major brand, version, compatible brands. */
function ftyp(major, compatible = []) {
  const size = 16 + compatible.length * 4;
  const bytes = new Uint8Array(size + 8);
  new DataView(bytes.buffer).setUint32(0, size);
  const write = (text, offset) => [...text].forEach((char, index) => { bytes[offset + index] = char.charCodeAt(0); });
  write('ftyp', 4);
  write(major, 8);
  compatible.forEach((brand, index) => write(brand, 16 + index * 4));
  return new Blob([bytes]);
}

afterEach(() => {
  heicTo.mockReset();
  vi.restoreAllMocks();
});

describe('isHeic', () => {
  it('recognises HEVC-coded HEIF by its brand, whatever the file is called', async () => {
    expect(await isHeic(ftyp('heic', ['mif1', 'heic']))).toBe(true);
    expect(await isHeic(ftyp('heix'))).toBe(true);
    // An iPhone burst or live photo sequence.
    expect(await isHeic(ftyp('hevc', ['msf1']))).toBe(true);
    // The generic container brand, with the coding named among the compatible brands.
    expect(await isHeic(ftyp('mif1', ['mif1', 'heic']))).toBe(true);
  });

  it('leaves AVIF and everything else to the browser', async () => {
    expect(await isHeic(ftyp('avif', ['mif1', 'miaf']))).toBe(false);
    expect(await isHeic(ftyp('mif1', ['avif', 'miaf']))).toBe(false);
    expect(await isHeic(ftyp('mif1', ['miaf']))).toBe(false);
    expect(await isHeic(ftyp('isom', ['mp41']))).toBe(false);
    expect(await isHeic(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13])]))).toBe(false);
    expect(await isHeic(new Blob(['tiny']))).toBe(false);
    expect(await isHeic(null)).toBe(false);
  });
});

describe('decodeHeic', () => {
  it('asks libheif for a PNG, which keeps transparency and loses nothing', async () => {
    const png = new Blob(['png'], { type: 'image/png' });
    heicTo.mockResolvedValue(png);
    const source = ftyp('heic');

    expect(await decodeHeic(source)).toBe(png);
    expect(heicTo).toHaveBeenCalledWith({ blob: source, type: 'image/png' });
  });

  it('says what failed when the file cannot be decoded', async () => {
    heicTo.mockRejectedValue(new Error('HEIF image not found'));
    await expect(decodeHeic(ftyp('heic'))).rejects.toThrow('Failed to decode HEIC image: HEIF image not found');
  });
});

describe('ImageEngine.loadImage', () => {
  /** jsdom never loads an image, so the element is stood in for and reports what it was given. */
  function stubImage() {
    const sources = [];
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => { sources.push(blob); return 'blob:stub'; });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.stubGlobal('Image', class {
      set src(_value) { queueMicrotask(() => this.onload()); }
    });
    return sources;
  }

  it('decodes a HEIC file first and hands the browser the PNG', async () => {
    const sources = stubImage();
    const png = new Blob(['png'], { type: 'image/png' });
    heicTo.mockResolvedValue(png);

    await ImageEngine.loadImage(ftyp('heic'));

    expect(sources).toEqual([png]);
    vi.unstubAllGlobals();
  });

  it('passes any other image straight through', async () => {
    const sources = stubImage();
    const avif = ftyp('avif');

    await ImageEngine.loadImage(avif);

    expect(sources).toEqual([avif]);
    expect(heicTo).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('file types', () => {
  it('routes the new formats as images in both the popup and the dashboard', () => {
    for (const extension of ['avif', 'heic', 'heif', 'png', 'gif']) expect(IMAGE_EXTENSIONS).toContain(extension);
    expect(isImageFile({ name: 'IMG_0042.HEIC' })).toBe(true);
    expect(isImageFile({ name: 'report.pdf' })).toBe(false);
    expect(isPdfFile({ name: 'Report.PDF' })).toBe(true);
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(isImageFile(null)).toBe(false);
  });
});
