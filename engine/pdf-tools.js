/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  StandardFonts,
  decodePDFRawStream,
  degrees,
  rgb,
} from '@cantoo/pdf-lib';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG, pdfAlreadyProtectedError, pdfPasswordError } from './pdf-password.js';
import { stampTextError } from './stamp-text.js';

/**
 * Merging, splitting, rotating, deleting and reordering PDF pages, page for page and without
 * re-rendering: text stays text, vectors stay vectors, and nothing is recompressed.
 */

function baseName(name) {
  return String(name || 'document').replace(/\.[^/.]+$/, '');
}

/**
 * Opens a PDF. One locked with a password opens with that password, and one that only limits
 * printing or copying opens without any; either way its pages come out in a new document with no
 * password, so what is saved opens anywhere.
 * @param {File} file
 * @param {string} [password]
 */
async function load(file, password = '') {
  const bytes = await file.arrayBuffer();
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    if (!/encrypted/i.test(error?.message || '')) {
      // pdf-lib's own messages do not say which file of a batch was the problem.
      throw new Error(`Cannot open ${file.name}: ${error?.message || 'it could not be read'}`);
    }
  }
  let locked = null;
  for (const attempt of password ? ['', password] : ['']) {
    try {
      locked = await PDFDocument.load(bytes, { password: attempt });
      break;
    } catch (error) {
      if (!/password/i.test(error?.message || '')) {
        throw new Error(`Cannot open ${file.name}: ${error?.message || 'it could not be read'}`);
      }
    }
  }
  if (!locked) throw pdfPasswordError(file.name, password ? PDF_PASSWORD_WRONG : PDF_PASSWORD_NEEDED);
  const open = await PDFDocument.create();
  const pages = await open.copyPages(locked, locked.getPageIndices());
  pages.forEach((page) => open.addPage(page));
  return open;
}

function toBlob(bytes) {
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Parses a page selection such as `1-3, 5, 8-` against a page count.
 * @param {string} text Ranges separated by commas; an open end means "to the last page"
 * @param {number} pageCount
 * @returns {number[][]} One list of zero-based page indexes per range, in the order written
 */
export function parsePageRanges(text, pageCount) {
  const parts = String(text || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error('No pages were given.');
  return parts.map((part) => {
    const match = /^(\d*)\s*(-)?\s*(\d*)$/.exec(part);
    if (!match || (!match[1] && !match[3])) throw new Error(`"${part}" is not a page or a range of pages.`);
    const first = match[1] ? Number(match[1]) : 1;
    const last = match[2] ? (match[3] ? Number(match[3]) : pageCount) : first;
    if (first < 1 || last < first) throw new Error(`"${part}" is not a page or a range of pages.`);
    if (last > pageCount) throw new Error(`"${part}" goes past the last page (${pageCount}).`);
    return Array.from({ length: last - first + 1 }, (_, index) => first - 1 + index);
  });
}

/**
 * Joins PDF files into one, in the order given.
 * @param {File[]} files
 * @param {{ password?: string }} [options] The password of a locked PDF (the same for every file)
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function mergePdfs(files, { password = '' } = {}) {
  if (!files || files.length < 2) throw new Error('Merging needs at least two PDF files.');
  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await load(file, password);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return {
    blob: toBlob(await merged.save()),
    filename: `${baseName(files[0].name)}_merged.pdf`,
    pageCount: merged.getPageCount(),
  };
}

/**
 * Splits one PDF into several.
 * @param {File} file
 * @param {string} [ranges] A selection such as `1-3, 5, 8-`: one output per range.
 *   Left out, every page becomes its own file.
 * @param {{ password?: string }} [options] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }[]>}
 */
export async function splitPdf(file, ranges = '', { password = '' } = {}) {
  const source = await load(file, password);
  const pageCount = source.getPageCount();
  const groups = String(ranges).trim()
    ? parsePageRanges(ranges, pageCount)
    : source.getPageIndices().map((index) => [index]);
  const width = String(pageCount).length;
  const results = [];
  for (const group of groups) {
    const part = await PDFDocument.create();
    const pages = await part.copyPages(source, group);
    pages.forEach((page) => part.addPage(page));
    const first = String(group[0] + 1).padStart(width, '0');
    const last = String(group[group.length - 1] + 1).padStart(width, '0');
    const label = group.length === 1 ? `page_${first}` : `pages_${first}-${last}`;
    results.push({
      blob: toBlob(await part.save()),
      filename: `${baseName(file.name)}_${label}.pdf`,
      pageCount: group.length,
    });
  }
  return results;
}

/**
 * The pages a selection such as `2, 5-7` names, each once, in the order written.
 */
function selectedPages(text, pageCount) {
  return [...new Set(parsePageRanges(text, pageCount).flat())];
}

/** The angles a page can be turned by, clockwise. */
export const ROTATIONS = [90, 180, 270];

/**
 * Turns pages clockwise, on top of any turn they already have.
 * @param {File} file
 * @param {number} angle 90, 180 or 270
 * @param {string} [pages] A selection such as `1-3, 5`; left out, every page turns.
 * @param {{ password?: string }} [options] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function rotatePdfPages(file, angle, pages = '', { password = '' } = {}) {
  const turn = Number(angle);
  if (!ROTATIONS.includes(turn)) throw new Error('Pages turn by 90, 180 or 270 degrees.');
  const doc = await load(file, password);
  const indexes = String(pages).trim() ? selectedPages(pages, doc.getPageCount()) : doc.getPageIndices();
  for (const index of indexes) {
    const page = doc.getPage(index);
    page.setRotation(degrees((((page.getRotation().angle + turn) % 360) + 360) % 360));
  }
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_rotated.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * Takes pages out of a PDF.
 * @param {File} file
 * @param {string} pages A selection such as `2, 5-7`
 * @param {{ password?: string }} [options] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function deletePdfPages(file, pages, { password = '' } = {}) {
  const doc = await load(file, password);
  const indexes = selectedPages(pages, doc.getPageCount());
  if (indexes.length === doc.getPageCount()) throw new Error('Deleting every page would leave an empty PDF.');
  // From the last page back, so the indexes still to remove keep pointing at the same pages.
  [...indexes].sort((a, b) => b - a).forEach((index) => doc.removePage(index));
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_pages_deleted.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * Puts the pages of a PDF in a new order.
 * @param {File} file
 * @param {string} order A selection such as `3, 1-2`: those pages come first, in that order, and
 *   the pages it leaves out follow in their old order. A page named twice is refused.
 * @param {{ password?: string }} [options] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function reorderPdfPages(file, order, { password = '' } = {}) {
  const source = await load(file, password);
  const pageCount = source.getPageCount();
  const named = parsePageRanges(order, pageCount).flat();
  const twice = named.find((index, position) => named.indexOf(index) !== position);
  if (twice !== undefined) throw new Error(`Page ${twice + 1} is named more than once.`);
  const indexes = [...named, ...source.getPageIndices().filter((index) => !named.includes(index))];
  const reordered = await PDFDocument.create();
  const pages = await reordered.copyPages(source, indexes);
  pages.forEach((page) => reordered.addPage(page));
  return {
    blob: toBlob(await reordered.save()),
    filename: `${baseName(file.name)}_reordered.pdf`,
    pageCount,
  };
}

/** Where page numbers can go, as the reader sees the page. */
export const NUMBER_POSITIONS = ['bottom-center', 'bottom-right', 'bottom-left', 'top-center', 'top-right', 'top-left'];

/** How a page number reads: `3`, or `3 / 12`. */
export const NUMBER_STYLES = ['plain', 'of-total'];

/** Distance from the edge of the page, and the size of the digits, in points. */
const NUMBER_MARGIN = 24;
const NUMBER_SIZE = 10;

/**
 * Places a point given as the reader sees the page (origin at the bottom left of the page as
 * shown, after its /Rotate) in the page's own coordinates, with the turn text needs to read
 * upright there.
 */
function fromView(box, angle, x, y) {
  switch (angle) {
    case 90:
      return { x: box.x + box.width - y, y: box.y + x, rotate: 90 };
    case 180:
      return { x: box.x + box.width - x, y: box.y + box.height - y, rotate: 180 };
    case 270:
      return { x: box.x + y, y: box.y + box.height - x, rotate: 270 };
    default:
      return { x: box.x + x, y: box.y + y, rotate: 0 };
  }
}

/**
 * Writes a number on pages of a PDF. The rest of each page is left as it is.
 * @param {File} file
 * @param {object} [options]
 * @param {string} [options.position] One of NUMBER_POSITIONS, as the page is seen
 * @param {string} [options.style] One of NUMBER_STYLES
 * @param {number} [options.start] The number of the first page, 0 or more; 0 leaves the first
 *   page (a cover) unnumbered and numbers the next one 1
 * @param {string} [options.pages] A selection such as `2-`; left out, every page is numbered
 * @param {string} [options.password] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function numberPdfPages(
  file,
  { position = 'bottom-center', style = 'plain', start = 1, pages = '', password = '' } = {}
) {
  if (!NUMBER_POSITIONS.includes(position)) throw new Error(`"${position}" is not a place for page numbers.`);
  if (!NUMBER_STYLES.includes(style)) throw new Error(`"${style}" is not a way to write page numbers.`);
  const first = Number(start);
  if (!Number.isInteger(first)) throw new Error('The first page number has to be a whole number.');
  if (first < 0) throw new Error('The first page number cannot be below 0.');
  const doc = await load(file, password);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pageCount = doc.getPageCount();
  const last = first + pageCount - 1;
  const indexes = String(pages).trim() ? selectedPages(pages, pageCount) : doc.getPageIndices();
  const [vertical, horizontal] = position.split('-');
  for (const index of indexes) {
    // Page 0 is the cover: it keeps its place in the count but gets no number.
    if (first + index === 0) continue;
    const page = doc.getPage(index);
    const angle = (((page.getRotation().angle % 360) + 360) % 360);
    const box = page.getCropBox();
    const sideways = angle === 90 || angle === 270;
    const viewWidth = sideways ? box.height : box.width;
    const viewHeight = sideways ? box.width : box.height;
    const text = style === 'of-total' ? `${first + index} / ${last}` : String(first + index);
    const width = font.widthOfTextAtSize(text, NUMBER_SIZE);
    const x =
      horizontal === 'left' ? NUMBER_MARGIN : horizontal === 'right' ? viewWidth - NUMBER_MARGIN - width : (viewWidth - width) / 2;
    const y = vertical === 'top' ? viewHeight - NUMBER_MARGIN - NUMBER_SIZE : NUMBER_MARGIN;
    const at = fromView(box, angle, x, y);
    page.drawText(text, { x: at.x, y: at.y, size: NUMBER_SIZE, font, color: rgb(0.2, 0.2, 0.2), rotate: degrees(at.rotate) });
  }
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_numbered.pdf`,
    pageCount,
  };
}

/** Where a stamp can go, as the reader sees the page; `custom` takes a place in percent. */
export const STAMP_POSITIONS = [
  'center',
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'custom',
];

/** Distance from the edge of the page for a stamp in a corner or on an edge, in points. */
const STAMP_MARGIN = 36;

/**
 * The pages a stamp goes on: `all` (or nothing), `first`, `last`, or a selection such as `1-3, 5`.
 */
function stampPages(text, pageCount) {
  const words = String(text || '').trim().toLowerCase();
  if (!words || words === 'all') return Array.from({ length: pageCount }, (_, index) => index);
  if (words === 'first') return [0];
  if (words === 'last') return [pageCount - 1];
  return selectedPages(words, pageCount);
}

/**
 * The font stamps are written in: Noto Sans Bold (SIL Open Font License 1.1), cut down to Latin,
 * Latin Extended-A/B and Additional (Vietnamese) and the combining marks. It ships in the package;
 * the build gives it a hashed name and rewrites this address.
 */
const STAMP_FONT_URL = new URL('../assets/fonts/NotoSans-Bold-stamp.ttf', import.meta.url).href;

async function stampFontBytes() {
  const response = await fetch(STAMP_FONT_URL);
  if (!response.ok) throw new Error(`The stamp font could not be read (${response.status}).`);
  return new Uint8Array(await response.arrayBuffer());
}

/** The bytes of a picture given as a File, a Blob, an ArrayBuffer or a Uint8Array. */
async function pictureBytes(image) {
  if (typeof image?.arrayBuffer === 'function') return new Uint8Array(await image.arrayBuffer());
  return image instanceof Uint8Array ? image : new Uint8Array(image);
}

/** The stamp's settings, checked, with the colour as pdf-lib takes it. */
function stampSettings({ position, x, y, size, opacity, rotation, color }) {
  if (!STAMP_POSITIONS.includes(position)) throw new Error(`"${position}" is not a place for a stamp.`);
  const width = Number(size);
  if (!(width > 0 && width <= 100)) throw new Error('The stamp size is a percentage of the page width, 1 to 100.');
  const alpha = Number(opacity);
  if (!(alpha > 0 && alpha <= 1)) throw new Error('The stamp opacity goes from just above 0 to 1.');
  const turn = Number(rotation);
  if (rotation === '' || !Number.isFinite(turn)) throw new Error('The stamp angle has to be a number of degrees.');
  const hex = /^#?([0-9a-f]{6})$/i.exec(String(color));
  if (!hex) throw new Error(`"${color}" is not a colour written as #rrggbb.`);
  const [left, top] = [Number(x), Number(y)];
  if (position === 'custom' && ![left, top].every((value) => value >= 0 && value <= 100)) {
    throw new Error('A custom place for the stamp is given in percent, 0 to 100.');
  }
  const tint = rgb(...[0, 2, 4].map((at) => parseInt(hex[1].slice(at, at + 2), 16) / 255));
  return { width, alpha, turn, tint, left, top };
}

/**
 * Where the centre of a stamp `width` by `height` (before its own turn) goes on a page seen as
 * `viewWidth` by `viewHeight`: a corner or an edge keeps the whole turned stamp clear of it.
 */
function stampCentre(position, settings, view, width, height) {
  const angle = (settings.turn * Math.PI) / 180;
  const reachX = (Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle))) / 2;
  const reachY = (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) / 2;
  if (position === 'custom') {
    return { x: (view.width * settings.left) / 100, y: view.height * (1 - settings.top / 100) };
  }
  const [vertical, horizontal] = position === 'center' ? ['center', 'center'] : position.split('-');
  const along = (side, length, reach, low, high) =>
    side === low ? STAMP_MARGIN + reach : side === high ? length - STAMP_MARGIN - reach : length / 2;
  return {
    x: along(horizontal, view.width, reachX, 'left', 'right'),
    y: along(vertical, view.height, reachY, 'bottom', 'top'),
  };
}

/**
 * Puts a stamp on pages of a PDF: a text such as APPROVED or ĐÃ DUYỆT (with a date under it)
 * and/or a PNG or JPG picture such as a signature, stacked picture first. The rest of each page
 * is left as it is. The stamp lands where the reader sees the page, on turned and cropped pages
 * too.
 * @param {File} file
 * @param {object} options
 * @param {string} [options.text] The stamp's words
 * @param {string} [options.date] A date written smaller under the words, as given
 * @param {File|Blob|ArrayBuffer|Uint8Array} [options.image] A PNG or JPG picture
 * @param {string} [options.position] One of STAMP_POSITIONS, as the page is seen
 * @param {number} [options.x] For `custom`: the stamp's centre in percent of the width, from the left
 * @param {number} [options.y] For `custom`: the stamp's centre in percent of the height, from the top
 * @param {number} [options.size] The stamp's width in percent of the page's width (1-100)
 * @param {number} [options.opacity] From just above 0 (faint) to 1 (solid)
 * @param {number} [options.rotation] Degrees, counter-clockwise
 * @param {string} [options.color] The text's colour, as #rrggbb
 * @param {string} [options.pages] `all`, `first`, `last` or a selection such as `1-3, 5`
 * @param {string} [options.password] The password, if the PDF is locked with one
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function stampPdf(
  file,
  {
    text = '',
    date = '',
    image = null,
    position = 'center',
    x = 50,
    y = 50,
    size = 30,
    opacity = 1,
    rotation = 0,
    color = '#c62828',
    pages = '',
    password = '',
  } = {}
) {
  // Composed, so a Vietnamese letter typed as a base and its marks is the one letter the font has.
  const words = String(text || '').normalize('NFC').trim();
  const when = String(date || '').normalize('NFC').trim();
  if (!words && !when && !image) throw new Error('Give the stamp a text or a picture.');
  const settings = stampSettings({ position, x, y, size, opacity, rotation, color });

  let picture = null;
  if (image) {
    const bytes = await pictureBytes(image);
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isPng && !isJpg) throw new Error('The stamp picture has to be a PNG or JPG.');
    picture = { bytes, isPng };
  }

  const doc = await load(file, password);
  const indexes = stampPages(pages, doc.getPageCount());
  let font = null;
  if (words || when) {
    const [{ default: fontkit }, bytes] = await Promise.all([import('@cantoo/fontkit'), stampFontBytes()]);
    doc.registerFontkit(fontkit);
    // Only the letters used go into the PDF.
    font = await doc.embedFont(bytes, { subset: true });
    // The bundled font covers Latin, Vietnamese included; any other script would come out wrong.
    const drawable = new Set(font.getCharacterSet());
    const missing = [...new Set(`${words}${when}`)].filter((ch) => !drawable.has(ch.codePointAt(0)));
    if (missing.length) throw stampTextError(missing);
  }
  const embedded = picture ? await (picture.isPng ? doc.embedPng(picture.bytes) : doc.embedJpg(picture.bytes)) : null;
  const angle = (settings.turn * Math.PI) / 180;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];

  for (const index of indexes) {
    const page = doc.getPage(index);
    const pageTurn = ((page.getRotation().angle % 360) + 360) % 360;
    const box = page.getCropBox();
    const sideways = pageTurn === 90 || pageTurn === 270;
    const view = { width: sideways ? box.height : box.width, height: sideways ? box.width : box.height };

    // The stamp's parts, top to bottom, each as wide as the block or narrower and centred in it;
    // `drop` is how far a line's baseline sits above the bottom of its letters.
    const blockWidth = (view.width * settings.width) / 100;
    const parts = [];
    if (embedded) {
      parts.push({ image: embedded, width: blockWidth, height: (blockWidth * embedded.height) / embedded.width, drop: 0 });
    }
    const line = (text, size) => {
      const full = font.heightAtSize(size);
      const above = font.heightAtSize(size, { descender: false });
      return { text, size, width: font.widthOfTextAtSize(text, size), height: full, drop: full - above };
    };
    const fit = (text) => blockWidth / font.widthOfTextAtSize(text, 1);
    const mainSize = words ? Math.min(fit(words), blockWidth / 2) : 0;
    if (words) parts.push(line(words, mainSize));
    if (when) parts.push(line(when, Math.min(words ? mainSize * 0.4 : blockWidth / 2, fit(when))));
    const gap = blockWidth * 0.04;
    const blockHeight = parts.reduce((sum, part) => sum + part.height, 0) + gap * (parts.length - 1);
    const centre = stampCentre(position, settings, view, blockWidth, blockHeight);

    let bottom = blockHeight / 2;
    for (const part of parts) {
      bottom -= part.height;
      // The part's corner (or baseline start) from the block's centre, turned with the stamp,
      // then placed on the page as it is stored.
      const dx = -part.width / 2;
      const dy = bottom + part.drop;
      const at = fromView(box, pageTurn, centre.x + dx * cos - dy * sin, centre.y + dx * sin + dy * cos);
      const common = { x: at.x, y: at.y, rotate: degrees(at.rotate + settings.turn), opacity: settings.alpha };
      if (part.image) page.drawImage(part.image, { ...common, width: part.width, height: part.height });
      else page.drawText(part.text, { ...common, size: part.size, font, color: settings.tint });
      bottom -= gap;
    }
  }
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_stamped.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * Locks a PDF with a password: the copy that is saved asks for it before it shows a page
 * (AES-256, which Acrobat, Chrome, Edge, Firefox and Preview open). The pages are not touched.
 * A PDF that is already protected is refused rather than opened and locked again. The password
 * is used here and nowhere else: it is not kept, and it is not part of any message.
 * @param {File} file
 * @param {string} newPassword What a reader will have to type; it cannot be empty
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number }>}
 */
export async function protectPdf(file, newPassword) {
  if (typeof newPassword !== 'string' || !newPassword) {
    throw new Error('Enter the password the PDF is to be protected with.');
  }
  let doc;
  try {
    doc = await PDFDocument.load(await file.arrayBuffer());
  } catch (error) {
    if (/encrypted/i.test(error?.message || '')) throw pdfAlreadyProtectedError(file.name);
    throw new Error(`Cannot open ${file.name}: ${error?.message || 'it could not be read'}`);
  }
  // The same password as owner: there is no second one that would open the file in full.
  doc.encrypt({ userPassword: newPassword, ownerPassword: newPassword });
  return {
    blob: toBlob(await doc.save()),
    filename: `${baseName(file.name)}_protected.pdf`,
    pageCount: doc.getPageCount(),
  };
}

/**
 * How far Compress PDF goes at each level: the pictures get at most `dpi` pixels per inch of the
 * largest page (a cap on the picture's longer side, so one drawn smaller than the page keeps a
 * little more), and are saved as JPEG at `quality`. Named by the image quality that is kept.
 */
export const COMPRESS_LEVELS = {
  low: { dpi: 96, quality: 0.5 },
  medium: { dpi: 150, quality: 0.7 },
  high: { dpi: 220, quality: 0.85 },
};

/** Pictures smaller than this are not worth the work. */
const MIN_IMAGE_BYTES = 2048;

/** A name such as /DeviceRGB or a number as a plain value; a one-element array as its element. */
function plain(value) {
  if (value instanceof PDFArray && value.size() === 1) return plain(value.get(0));
  if (value instanceof PDFName) return value.decodeText();
  if (value instanceof PDFNumber) return value.asNumber();
  return value;
}

/** How many colour channels a colour space has, if its pixels can be redrawn as RGB; 0 if not. */
function channelsOf(colorSpace, context) {
  const space = plain(colorSpace);
  if (space === 'DeviceRGB') return 3;
  if (space === 'DeviceGray') return 1;
  if (space instanceof PDFArray && space.size() === 2 && plain(space.get(0)) === 'ICCBased') {
    const profile = context.lookup(space.get(1));
    const n = profile instanceof PDFRawStream ? plain(profile.dict.lookup(PDFName.of('N'))) : 0;
    return n === 3 || n === 1 ? n : 0;
  }
  return 0;
}

/** Undoes the PNG predictors (types 0-4) of `rows` rows, `columns` pixels of `bpp` bytes each. */
function unpredictPng(data, columns, bpp, rows) {
  const stride = columns * bpp;
  if (data.length < rows * (stride + 1)) return null;
  const out = new Uint8Array(rows * stride);
  for (let y = 0; y < rows; y++) {
    const type = data[y * (stride + 1)];
    if (type > 4) return null;
    const row = y * (stride + 1) + 1;
    const at = y * stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= bpp ? out[at + i - bpp] : 0;
      const up = y ? out[at - stride + i] : 0;
      const upLeft = y && i >= bpp ? out[at - stride + i - bpp] : 0;
      let guess = 0;
      if (type === 1) guess = left;
      else if (type === 2) guess = up;
      else if (type === 3) guess = (left + up) >> 1;
      else if (type === 4) {
        const p = left + up - upLeft;
        const [pa, pb, pc] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
        guess = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      out[at + i] = (data[row + i] + guess) & 0xff;
    }
  }
  return out;
}

/**
 * A JPEG without its EXIF block. PDF viewers draw a JPEG as it is stored and ignore EXIF, but
 * browsers turn a picture the way its EXIF says when they decode it: without the block, the
 * picture is decoded the way the PDF shows it. Anything that is not plainly a JPEG is given back
 * as it is.
 */
export function withoutExif(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const parts = [bytes.subarray(0, 2)];
  let at = 2;
  let removed = false;
  while (at + 4 <= bytes.length && bytes[at] === 0xff) {
    const marker = bytes[at + 1];
    // The scan follows: everything from here on is copied as it is.
    if (marker === 0xda) break;
    const length = (bytes[at + 2] << 8) | bytes[at + 3];
    const end = at + 2 + length;
    if (length < 2 || end > bytes.length) return bytes;
    const exif =
      marker === 0xe1 && String.fromCharCode(...bytes.subarray(at + 4, at + 8)) === 'Exif';
    if (exif) removed = true;
    else parts.push(bytes.subarray(at, end));
    at = end;
  }
  if (!removed) return bytes;
  parts.push(bytes.subarray(at));
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * What a picture of a PDF is, for the recoder: `{ kind: 'jpeg', bytes }` for a JPEG, or
 * `{ kind: 'pixels', data, width, height, channels }` for 8-bit RGB or grey pixels. Null for a
 * picture that cannot be redrawn as an RGB JPEG without changing how it looks: masks, CMYK,
 * indexed colours, a /Decode array, other bit depths and other compressions.
 */
function imageSource(stream, context) {
  const get = (key) => stream.dict.lookup(PDFName.of(key));
  if (get('ImageMask') || get('Mask') || get('Decode')) return null;
  if (plain(get('BitsPerComponent')) !== 8) return null;
  const channels = channelsOf(get('ColorSpace'), context);
  const width = plain(get('Width'));
  const height = plain(get('Height'));
  if (!channels || !(width > 0) || !(height > 0)) return null;
  // A soft mask with /Matte goes with pixels mixed with a background colour: left as they are.
  const smask = get('SMask');
  if (smask instanceof PDFRawStream && smask.dict.lookup(PDFName.of('Matte'))) return null;
  const filter = plain(get('Filter'));
  if (filter === 'DCTDecode') return { kind: 'jpeg', bytes: withoutExif(stream.contents) };
  if (filter !== 'FlateDecode') return null;
  let data = decodePDFRawStream(stream).decode();
  const parms = get('DecodeParms');
  const parm = (key, fallback) => plain(parms?.lookup?.(PDFName.of(key))) ?? fallback;
  const predictor = parm('Predictor', 1);
  if (predictor >= 10) {
    if (parm('Colors', 1) !== channels || parm('Columns', 1) !== width || parm('BitsPerComponent', 8) !== 8) return null;
    data = unpredictPng(data, width, channels, height);
    if (!data) return null;
  } else if (predictor !== 1) {
    return null;
  }
  if (data.length < width * height * channels) return null;
  return { kind: 'pixels', data: data.subarray(0, width * height * channels), width, height, channels };
}

/**
 * The browser's way to redraw a picture smaller: decode it, scale it to fit `maxSide`, and save
 * it as a JPEG at `quality`.
 */
async function recodeWithCanvas(source, { maxSide, quality }) {
  let bitmap;
  if (source.kind === 'jpeg') {
    bitmap = await createImageBitmap(new Blob([source.bytes], { type: 'image/jpeg' }));
  } else {
    const { data, width, height, channels } = source;
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0, o = 0; o < rgba.length; i += channels, o += 4) {
      rgba[o] = data[i];
      rgba[o + 1] = data[channels === 3 ? i + 1 : i];
      rgba[o + 2] = data[channels === 3 ? i + 2 : i];
      rgba[o + 3] = 255;
    }
    bitmap = await createImageBitmap(new ImageData(rgba, width, height));
  }
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    bitmap.close?.();
  }
}

/**
 * Makes a PDF smaller by saving its pictures again as smaller JPEGs, scaled down to the level's
 * pixels per inch. Pages are not redrawn: text stays text that can be selected and searched, and
 * vectors and fonts are left as they are. A picture is only swapped for a smaller one, and masks,
 * CMYK and other pictures a JPEG would change are kept. If the whole PDF comes out no smaller,
 * the original file is given back with `smaller: false`.
 * @param {File} file
 * @param {object} [options]
 * @param {'low'|'medium'|'high'} [options.level] The image quality kept; see COMPRESS_LEVELS
 * @param {string} [options.password] The password, if the PDF is locked with one
 * @param {Function} [options.recode] Turns a picture into a smaller JPEG; the browser's canvas
 *   by default
 * @returns {Promise<{ blob: Blob, filename: string, pageCount: number, originalSize: number,
 *   compressedSize: number, smaller: boolean, imagesCompressed: number }>}
 */
export async function compressPdf(file, { level = 'medium', password = '', recode = recodeWithCanvas } = {}) {
  const settings = COMPRESS_LEVELS[level];
  if (!settings) throw new Error(`"${level}" is not a compression level (low, medium or high).`);
  const doc = await load(file, password);
  const pageCount = doc.getPageCount();
  const largestSide = Math.max(...doc.getPages().map((page) => Math.max(page.getWidth(), page.getHeight())));
  const maxSide = Math.round((largestSide / 72) * settings.dpi);

  // A picture that is another one's mask stays as it is: it has to stay grey and lossless.
  const pictures = [];
  const masks = new Set();
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream) || plain(object.dict.get(PDFName.of('Subtype'))) !== 'Image') continue;
    pictures.push([ref, object]);
    for (const key of ['SMask', 'Mask']) {
      const mask = object.dict.get(PDFName.of(key));
      if (mask instanceof PDFRef) masks.add(mask.toString());
    }
  }

  let imagesCompressed = 0;
  for (const [ref, stream] of pictures) {
    if (masks.has(ref.toString()) || stream.contents.length < MIN_IMAGE_BYTES) continue;
    let smaller = null;
    try {
      const source = imageSource(stream, doc.context);
      if (source) smaller = await recode(source, { maxSide, quality: settings.quality });
    } catch {
      // A picture that does not decode, here or in the browser, is kept as it is.
    }
    if (!smaller?.bytes?.length || smaller.bytes.length >= stream.contents.length) continue;
    const dict = stream.dict.clone(doc.context);
    dict.set(PDFName.of('Width'), PDFNumber.of(smaller.width));
    dict.set(PDFName.of('Height'), PDFNumber.of(smaller.height));
    dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
    dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
    dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
    dict.delete(PDFName.of('DecodeParms'));
    doc.context.assign(ref, PDFRawStream.of(dict, smaller.bytes));
    imagesCompressed++;
  }

  const bytes = await doc.save();
  const smaller = bytes.length < file.size;
  return {
    blob: smaller ? toBlob(bytes) : file,
    filename: smaller ? `${baseName(file.name)}_compressed.pdf` : file.name,
    pageCount,
    originalSize: file.size,
    compressedSize: smaller ? bytes.length : file.size,
    smaller,
    imagesCompressed,
  };
}
