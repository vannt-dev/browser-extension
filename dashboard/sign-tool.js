/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { t } from '../shared/i18n.js';
import { errorReason } from '../shared/error-text.js';
import { ZipEngine } from '../engine/zip-engine.js';
import { isPdfFile } from '../engine/file-types.js';
import { PDF_PASSWORD_NEEDED, PDF_PASSWORD_WRONG } from '../engine/pdf-password.js';
import {
  clearPaper,
  fitPlacement,
  inkBounds,
  isOpaque,
  movePlacement,
  placeAt,
  placementHeight,
  resizePlacement,
} from '../engine/signature.js';

/**
 * Sign a PDF: one PDF shown a page at a time, a signature drawn on a pad or taken from a picture,
 * and the places it goes, each held as shares of its page as seen (see engine/signature.js).
 * Nothing leaves the device; the signature is kept in the browser's storage only when asked.
 */

const loadPdfEngine = () => import('../engine/pdf-engine.js').then((m) => m.PdfEngine);
const loadPdfTools = () => import('../engine/pdf-tools.js');

/** Where a remembered signature is kept in chrome.storage.local, as a PNG data URL. */
export const SAVED_SIGNATURE_KEY = 'savedSignature';

/** The pad's pixels for each pixel of line width chosen: it is drawn at about three times its shown size. */
const PAD_SCALE = 3;

/** The largest picture of a signature worked on, in pixels across; bigger ones are scaled down. */
const PICTURE_MAX = 2000;

const el = (id) => document.getElementById(id);

const sign = {
  file: null,
  pages: null,
  pageCount: 0,
  page: 1,
  sizes: new Map(),
  signature: null,
  placements: [],
  selected: null,
  strokes: [],
  nextId: 1,
  renderToken: 0,
};

const ratioOf = (page) => {
  const size = sign.sizes.get(page);
  return size ? size.width / size.height : 1;
};

function setStatus(text) {
  el('sign-status').textContent = text;
}

// ---------------------------------------------------------------- the signature

/** The signature as a PNG cut to its ink, from a canvas; null when the canvas has no ink. */
async function signatureFrom(canvas, { paper = false } = {}) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  if (paper && isOpaque(image)) clearPaper(image);
  const bounds = inkBounds(image);
  if (!bounds) return null;
  const out = document.createElement('canvas');
  out.width = bounds.width;
  out.height = bounds.height;
  out.getContext('2d').putImageData(image, -bounds.x, -bounds.y, bounds.x, bounds.y, bounds.width, bounds.height);
  const blob = await new Promise((done) => out.toBlob(done, 'image/png'));
  return { blob, url: out.toDataURL('image/png'), aspect: bounds.height / bounds.width };
}

/** A signature from a PNG data URL, as remembered. */
async function signatureFromUrl(url) {
  const blob = await (await fetch(url)).blob();
  const bitmap = await createImageBitmap(blob);
  const signature = { blob, url, aspect: bitmap.height / bitmap.width };
  bitmap.close?.();
  return signature;
}

async function rememberSignature() {
  if (!el('sign-remember').checked || !sign.signature) return;
  try {
    await chrome.storage.local.set({ [SAVED_SIGNATURE_KEY]: sign.signature.url });
    el('sign-forget-btn').hidden = false;
  } catch (err) {
    console.error('Sign PDF: the signature could not be remembered:', err);
  }
}

async function forgetSignature() {
  try {
    await chrome.storage.local.remove(SAVED_SIGNATURE_KEY);
  } catch (err) {
    console.error('Sign PDF: the saved signature could not be removed:', err);
  }
  el('sign-remember').checked = false;
  el('sign-forget-btn').hidden = true;
}

/** Makes `signature` the one placed (null: none yet), and refits what is placed to its shape. */
function useSignature(signature) {
  sign.signature = signature;
  const preview = el('sign-preview');
  preview.hidden = !signature;
  el('sign-preview-empty').hidden = Boolean(signature);
  if (signature) preview.src = signature.url;
  else preview.removeAttribute('src');
  if (signature) {
    sign.placements = sign.placements.map((placement) =>
      fitPlacement(placement, { aspect: signature.aspect, ratio: ratioOf(placement.page) })
    );
    rememberSignature();
  }
  drawBoxes();
}

// ---------------------------------------------------------------- the pad

function drawPad() {
  const pad = el('sign-pad');
  const context = pad.getContext('2d', { willReadFrequently: true });
  context.clearRect(0, 0, pad.width, pad.height);
  context.strokeStyle = context.fillStyle = el('sign-ink').value;
  context.lineWidth = Number(el('sign-stroke').value) * PAD_SCALE;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const points of sign.strokes) {
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
      continue;
    }
    // Through the middle of each step, curving at the points: a smooth line, not a polygon.
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
      context.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
    context.stroke();
  }
  el('sign-undo-btn').disabled = !sign.strokes.length;
  el('sign-clear-btn').disabled = !sign.strokes.length;
}

async function padChanged() {
  drawPad();
  useSignature(sign.strokes.length ? await signatureFrom(el('sign-pad')) : null);
}

function setupPad() {
  const pad = el('sign-pad');
  const pointAt = (event) => {
    const bounds = pad.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * pad.width,
      y: ((event.clientY - bounds.top) / bounds.height) * pad.height,
    };
  };
  let points = null;
  pad.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    points = [pointAt(event)];
    sign.strokes.push(points);
    try {
      pad.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the page made up itself cannot be captured; the stroke works without.
    }
    drawPad();
  });
  pad.addEventListener('pointermove', (event) => {
    if (!points) return;
    // A pen or a fast mouse reports several points per frame; all of them make the line.
    const events = event.getCoalescedEvents?.() ?? [];
    for (const each of events.length ? events : [event]) points.push(pointAt(each));
    drawPad();
  });
  const finish = () => {
    if (!points) return;
    points = null;
    padChanged();
  };
  pad.addEventListener('pointerup', finish);
  pad.addEventListener('pointercancel', finish);

  el('sign-undo-btn').addEventListener('click', () => {
    sign.strokes.pop();
    padChanged();
  });
  el('sign-clear-btn').addEventListener('click', () => {
    sign.strokes = [];
    padChanged();
  });
  el('sign-stroke').addEventListener('input', (event) => {
    el('sign-stroke-val').textContent = event.target.value;
    drawPad();
  });
  // Ink and line apply to the whole signature: it is one signature, in one pen.
  el('sign-stroke').addEventListener('change', () => sign.strokes.length && padChanged());
  el('sign-ink').addEventListener('change', () => sign.strokes.length && padChanged());
}

async function usePicture(file) {
  setStatus('');
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PICTURE_MAX / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d', { willReadFrequently: true }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    // A picture of paper loses the white around the ink; a see-through PNG is used as it is.
    const signature = await signatureFrom(canvas, { paper: true });
    if (!signature) {
      setStatus(t('signPictureEmpty'));
      return;
    }
    useSignature(signature);
  } catch (err) {
    console.error('Sign PDF: the picture could not be read:', err);
    setStatus(t('signPictureError', err?.message || ''));
  }
}

// ---------------------------------------------------------------- the pages

function showPager() {
  el('sign-pager').hidden = !sign.pages;
  el('sign-page-label').textContent = sign.pages ? t('signPageOf', sign.page, sign.pageCount) : '';
  el('sign-prev-btn').disabled = !sign.pages || sign.page <= 1;
  el('sign-next-btn').disabled = !sign.pages || sign.page >= sign.pageCount;
}

async function showPage(number) {
  const token = ++sign.renderToken;
  const frame = el('sign-frame');
  try {
    const { canvas, width, height } = await sign.pages.render(number, { maxWidth: 1000, maxHeight: 1300 });
    if (token !== sign.renderToken) return;
    sign.page = number;
    sign.sizes.set(number, { width, height });
    frame.dataset.page = String(number);
    frame.replaceChildren(canvas);
    frame.hidden = false;
    el('sign-placeholder').hidden = true;
    drawBoxes();
  } catch (err) {
    console.error('Sign PDF: the page could not be shown:', err);
    setStatus(t('signOpenError', errorReason(err, 'dashboard')));
  }
  showPager();
}

async function openPdf() {
  const file = sign.file;
  sign.renderToken++;
  sign.pages?.close();
  Object.assign(sign, { pages: null, pageCount: 0, page: 1, placements: [], selected: null });
  sign.sizes.clear();
  el('sign-frame').hidden = true;
  el('sign-frame').replaceChildren();
  el('sign-placeholder').hidden = false;
  showPager();
  drawBoxes();
  setStatus('');
  if (!file) return;
  if (!isPdfFile(file)) {
    setStatus(t('signNotPdf', file.name));
    return;
  }
  try {
    const PdfEngine = await loadPdfEngine();
    const pages = await PdfEngine.openPages(file, { password: el('sign-password').value });
    if (file !== sign.file) {
      pages.close();
      return;
    }
    Object.assign(sign, { pages, pageCount: pages.pageCount });
    await showPage(1);
  } catch (err) {
    if (err?.code === PDF_PASSWORD_NEEDED || err?.code === PDF_PASSWORD_WRONG) {
      el('sign-password-group').hidden = false;
      el('sign-password').focus();
      setStatus(err.code === PDF_PASSWORD_NEEDED ? t('signPasswordNeeded', file.name) : errorReason(err, 'dashboard'));
      return;
    }
    console.error('Sign PDF: the PDF could not be opened:', err);
    setStatus(t('signOpenError', errorReason(err, 'dashboard')));
  }
}

// ---------------------------------------------------------------- the places

const boxes = new Map();

function positionBox(box, placement) {
  const height = placementHeight(placement.width, sign.signature?.aspect ?? 0.4, ratioOf(placement.page));
  Object.assign(box.style, {
    left: `${placement.x * 100}%`,
    top: `${placement.y * 100}%`,
    width: `${placement.width * 100}%`,
    height: `${height * 100}%`,
  });
}

/** Draws a box for each signature on the page shown, and says where signatures are. */
function drawBoxes() {
  const frame = el('sign-frame');
  for (const box of boxes.values()) box.remove();
  boxes.clear();
  if (sign.pages && sign.signature) {
    for (const placement of sign.placements.filter((each) => each.page === sign.page)) {
      const box = document.createElement('div');
      box.className = `sign-box${placement.id === sign.selected ? ' selected' : ''}`;
      box.dataset.id = String(placement.id);
      const picture = document.createElement('img');
      picture.src = sign.signature.url;
      picture.alt = '';
      const handle = document.createElement('div');
      handle.className = 'sign-handle';
      handle.title = t('signResize');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'sign-remove';
      remove.textContent = '✕';
      remove.title = t('signRemoveOne');
      remove.addEventListener('click', () => {
        sign.placements = sign.placements.filter((each) => each.id !== placement.id);
        drawBoxes();
      });
      box.append(picture, handle, remove);
      positionBox(box, placement);
      frame.append(box);
      boxes.set(placement.id, box);
    }
  }
  showPlaced();
}

function showPlaced() {
  const pages = [...new Set(sign.placements.map((placement) => placement.page))].sort((a, b) => a - b);
  el('sign-placed').textContent = !sign.pages
    ? ''
    : pages.length
      ? t('signPlacedOn', pages.join(', '), sign.placements.length)
      : t('signPlacedNone');
  const ready = Boolean(sign.pages && sign.signature);
  el('sign-every-page-btn').disabled = !ready || !sign.placements.length || sign.pageCount < 2;
  el('sign-remove-all-btn').disabled = !sign.placements.length;
  el('run-sign-btn').disabled = !ready || !sign.placements.length;
}

function setupPlacing() {
  const frame = el('sign-frame');
  let drag = null;
  const where = (event) => {
    const bounds = frame.getBoundingClientRect();
    return {
      point: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      preview: { width: bounds.width, height: bounds.height },
    };
  };
  frame.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !sign.pages || event.target.closest('.sign-remove')) return;
    event.preventDefault();
    if (!sign.signature) {
      setStatus(t('signNeedSignature'));
      return;
    }
    const { point, preview } = where(event);
    const aspect = sign.signature.aspect;
    const box = event.target.closest('.sign-box');
    let placement = box && sign.placements.find((each) => each.id === Number(box.dataset.id));
    if (!placement) {
      // A click on the page puts a signature there; holding on and dragging moves it at once.
      placement = { id: sign.nextId++, ...placeAt(point, preview, { page: sign.page, aspect }) };
      sign.placements.push(placement);
    }
    sign.selected = placement.id;
    const resizing = event.target.classList.contains('sign-handle');
    drag = { id: placement.id, resizing, start: point, from: { ...placement }, preview, aspect };
    try {
      frame.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the page made up itself cannot be captured; the drag works without.
    }
    setStatus('');
    drawBoxes();
  });
  frame.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const { point } = where(event);
    const moved = drag.resizing
      ? resizePlacement(drag.from, point, drag.preview, drag.aspect)
      : movePlacement(drag.from, point.x - drag.start.x, point.y - drag.start.y, drag.preview, drag.aspect);
    const index = sign.placements.findIndex((each) => each.id === drag.id);
    if (index < 0) return;
    sign.placements[index] = { ...moved, id: drag.id };
    const box = boxes.get(drag.id);
    if (box) positionBox(box, sign.placements[index]);
  });
  const finish = () => {
    drag = null;
    showPlaced();
  };
  frame.addEventListener('pointerup', finish);
  frame.addEventListener('pointercancel', finish);

  el('sign-every-page-btn').addEventListener('click', async () => {
    const model = sign.placements.find((each) => each.id === sign.selected) ?? sign.placements.at(-1);
    if (!model || !sign.signature) return;
    // The page the model is on keeps what it has; every other page gets one at the same place,
    // fitted to that page's size as seen.
    const others = Array.from({ length: sign.pageCount }, (_, index) => index + 1).filter((page) => page !== model.page);
    const { pages } = sign;
    try {
      for (const page of others) if (!sign.sizes.has(page)) sign.sizes.set(page, await pages.size(page));
    } catch (err) {
      setStatus(t('signOpenError', errorReason(err, 'dashboard')));
      return;
    }
    if (pages !== sign.pages) return;
    sign.placements = sign.placements.filter((each) => each.page === model.page);
    for (const page of others) {
      const copy = fitPlacement({ page, x: model.x, y: model.y, width: model.width }, { aspect: sign.signature.aspect, ratio: ratioOf(page) });
      sign.placements.push({ id: sign.nextId++, ...copy });
    }
    drawBoxes();
  });
  el('sign-remove-all-btn').addEventListener('click', () => {
    sign.placements = [];
    sign.selected = null;
    drawBoxes();
  });
  el('sign-prev-btn').addEventListener('click', () => sign.page > 1 && showPage(sign.page - 1));
  el('sign-next-btn').addEventListener('click', () => sign.page < sign.pageCount && showPage(sign.page + 1));
}

// ---------------------------------------------------------------- saving

async function savePdf() {
  const run = el('run-sign-btn');
  if (!sign.file || !sign.signature || !sign.placements.length) return;
  run.disabled = true;
  setStatus(t('signWorking'));
  try {
    const { signPdf } = await loadPdfTools();
    const result = await signPdf(sign.file, {
      image: sign.signature.blob,
      placements: sign.placements.map(({ page, x, y, width }) => ({ page, x, y, width })),
      password: el('sign-password').value,
    });
    ZipEngine.downloadBlob(result.blob, result.filename);
    const pages = new Set(sign.placements.map((placement) => placement.page)).size;
    setStatus(t('signDone', result.filename, pages));
  } catch (err) {
    console.error('Sign PDF:', err);
    setStatus(t('signError', errorReason(err, 'dashboard')));
  } finally {
    showPlaced();
  }
}

/** Writes again what the tool wrote itself, after the language changed. */
export function showSignTexts() {
  if (!el('sign-frame')) return;
  showPager();
  drawBoxes();
}

export function setupSignTool() {
  if (!el('sign-frame')) return;
  setupPad();
  setupPlacing();

  el('sign-file-input').addEventListener('change', (event) => {
    sign.file = event.target.files?.[0] ?? null;
    el('sign-password').value = '';
    el('sign-password-group').hidden = true;
    openPdf();
  });
  el('sign-open-btn').addEventListener('click', () => openPdf());
  el('sign-password').addEventListener('keydown', (event) => event.key === 'Enter' && openPdf());

  el('sign-source').addEventListener('change', (event) => {
    const drawing = event.target.value === 'draw';
    el('sign-draw-group').hidden = !drawing;
    el('sign-picture-group').hidden = drawing;
  });
  el('sign-picture-input').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) usePicture(file);
  });

  el('sign-remember').addEventListener('change', (event) => {
    if (event.target.checked) rememberSignature();
    else forgetSignature();
  });
  el('sign-forget-btn').addEventListener('click', () => forgetSignature());
  el('run-sign-btn').addEventListener('click', savePdf);

  drawPad();
  showPlaced();
  // The signature remembered last time, if one was.
  chrome.storage.local
    .get(SAVED_SIGNATURE_KEY)
    .then(async (stored) => {
      const url = stored?.[SAVED_SIGNATURE_KEY];
      if (typeof url !== 'string' || !url.startsWith('data:image/png;')) return;
      el('sign-remember').checked = true;
      el('sign-forget-btn').hidden = false;
      if (!sign.signature) useSignature(await signatureFromUrl(url));
    })
    .catch((err) => console.error('Sign PDF: the saved signature could not be read:', err));
}
