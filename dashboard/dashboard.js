/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';
import { readFileAsText } from '../engine/file-reader.js';
import { IMAGE_EXTENSIONS, SPREADSHEET_EXTENSIONS, isPdfFile } from '../engine/file-types.js';
import { readAutoConvert, turnOffAutoConvert, turnOnAutoConvert } from '../shared/site-access.js';
import { applyI18n, bindLanguageSelect, loadLanguage, t } from '../shared/i18n.js';
import { errorReason, passwordStatus } from '../shared/error-text.js';

// Heavy engines are fetched on first use so opening the dashboard does not have
// to parse the OCR, DOCX and PDF runtimes up front.
const loadAiEngine = () => import('../engine/ai-engine.js').then((m) => m.AiEngine);
const loadDocEngine = () => import('../engine/doc-engine.js').then((m) => m.DocEngine);
const loadPdfEngine = () => import('../engine/pdf-engine.js').then((m) => m.PdfEngine);
const loadPdfTools = () => import('../engine/pdf-tools.js');
const loadSheetEngine = () => import('../engine/sheet-engine.js');
const SPLIT_RANGES = () => document.getElementById('dash-split-ranges')?.value || '';
const PAGE_TOOL_PAGES = () => document.getElementById('dash-page-tools-pages')?.value || '';
const ROTATE_ANGLE = () => Number(document.getElementById('dash-rotate-angle')?.value || 90);
const NUMBER_OPTIONS = () => ({
  position: document.getElementById('dash-number-position')?.value || 'bottom-center',
  style: document.getElementById('dash-number-style')?.value || 'plain',
  start: Number(document.getElementById('dash-number-start')?.value || 1),
});
// One password for the batch: a PDF that needs none opens as before.
const PDF_OPTIONS = () => ({ password: document.getElementById('dash-pdf-password')?.value || '' });
// The jobs that change the pages of one PDF, each with the label of its page field.
const PDF_PAGE_TOOLS = {
  'pdf-rotate': () => t('pagesToRotateLabel'),
  'pdf-delete': () => t('pagesToDeleteLabel'),
  'pdf-reorder': () => t('pageOrderLabel'),
  'pdf-number': () => t('pagesToNumberLabel')
};

// State for Dashboard Batch Converter & Lightbox
let dashFileQueue = [];
let dashConvertedResults = [];
let bgRemovedBlob = null;
let currentZoomScale = 1.0;

// DOM Elements
const dashDropZone = document.getElementById('dash-drop-zone');
const dashFileInput = document.getElementById('dash-file-input');
const dashTargetFormat = document.getElementById('dash-target-format');
const dashQualityRange = document.getElementById('dash-quality-range');
const dashSplitGroup = document.getElementById('dash-split-group');
const dashPageToolsGroup = document.getElementById('dash-page-tools-group');
const dashPageToolsLabel = document.getElementById('dash-page-tools-label');
const dashRotateGroup = document.getElementById('dash-rotate-group');
const dashNumberGroup = document.getElementById('dash-number-group');
// The page fields only mean something for the PDF job they belong to.
function showFormatFields() {
  const format = dashTargetFormat?.value;
  if (dashSplitGroup) dashSplitGroup.style.display = format === 'pdf-split' ? 'block' : 'none';
  if (dashPageToolsGroup) dashPageToolsGroup.style.display = PDF_PAGE_TOOLS[format] ? 'block' : 'none';
  if (dashPageToolsLabel && PDF_PAGE_TOOLS[format]) dashPageToolsLabel.textContent = PDF_PAGE_TOOLS[format]();
  if (dashRotateGroup) dashRotateGroup.style.display = format === 'pdf-rotate' ? 'block' : 'none';
  if (dashNumberGroup) dashNumberGroup.style.display = format === 'pdf-number' ? 'block' : 'none';
}
dashTargetFormat?.addEventListener('change', showFormatFields);
const dashQualityVal = document.getElementById('dash-quality-val');
const dashConvertBtn = document.getElementById('dash-convert-btn');
const dashQueueList = document.getElementById('dash-queue-list');

// AI Studio Elements
const ocrFileInput = document.getElementById('ocr-file-input');
const ocrLangSelect = document.getElementById('ocr-lang-select');
const ocrOutputSelect = document.getElementById('ocr-output-select');
const runOcrBtn = document.getElementById('run-ocr-btn');
const ocrProgress = document.getElementById('ocr-progress');
const ocrResultText = document.getElementById('ocr-result-text');
const copyOcrBtn = document.getElementById('copy-ocr-btn');

const bgRemoveFileInput = document.getElementById('bg-remove-file-input');
const runBgRemoveBtn = document.getElementById('run-bg-remove-btn');
const bgRemoveStatus = document.getElementById('bg-remove-status');
const bgRemovePreview = document.getElementById('bg-remove-preview');
const bgRemoveHint = document.getElementById('bg-remove-hint');
const bgRemovePlaceholder = document.getElementById('bg-remove-placeholder');
const bgRemoveTolerance = document.getElementById('bg-remove-tolerance');
const bgRemoveToleranceVal = document.getElementById('bg-remove-tolerance-val');
const downloadBgRemoveBtn = document.getElementById('download-bg-remove-btn');

// Lightbox Elements
const lightboxModal = document.getElementById('image-lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxWrapper = document.querySelector('.lightbox-img-wrapper');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const closeLightboxBtn = document.getElementById('close-lightbox-btn');
const lightboxOverlay = document.querySelector('.lightbox-overlay');

// DevTools & Settings Elements
const jsonInput = document.getElementById('json-input');
const codeOutput = document.getElementById('code-output');
const devLangSelect = document.getElementById('dev-lang-select');
const copyCodeBtn = document.getElementById('copy-code-btn');
const autoConvertToggle = document.getElementById('dash-auto-convert-toggle');
const autoFormatSelect = document.getElementById('dash-auto-format');
const watermarkEnabled = document.getElementById('watermark-enabled');
const watermarkInput = document.getElementById('watermark-input');

// The text the Watermark tab asks to have stamped on converted images, if it asks for one.
const watermarkText = () => (watermarkEnabled?.checked ? watermarkInput?.value.trim() || null : null);

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // The stored choice of language is read first: everything below writes text into the page.
  await loadLanguage().catch(() => {});
  applyI18n();
  setupTabs();
  setupDashDropZone();
  setupAiStudio();
  setupCropTool();
  setupLightbox();
  setupDevTools();
  setupSettingsPersistence();
});

// Tabs Navigation
function setupTabs() {
  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));

      e.target.classList.add('active');
      const tabId = `tab-${e.target.dataset.tab}`;
      document.getElementById(tabId)?.classList.add('active');
    });
  });

  if (dashQualityRange && dashQualityVal) {
    dashQualityRange.addEventListener('input', (e) => {
      dashQualityVal.textContent = `${e.target.value}%`;
    });
  }
}

// Lightbox Modal Setup
function setupLightbox() {
  if (!lightboxModal) return;

  function openLightbox(imgSrc, title = t('lightboxTitle')) {
    lightboxImg.src = imgSrc;
    lightboxTitle.textContent = `🔍 ${title}`;
    currentZoomScale = 1.0;
    updateZoomTransform();
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
  }

  function updateZoomTransform() {
    if (lightboxWrapper) {
      lightboxWrapper.style.transform = `scale(${currentZoomScale})`;
    }
  }

  zoomInBtn?.addEventListener('click', () => {
    currentZoomScale = Math.min(4.0, currentZoomScale + 0.25);
    updateZoomTransform();
  });

  zoomOutBtn?.addEventListener('click', () => {
    currentZoomScale = Math.max(0.5, currentZoomScale - 0.25);
    updateZoomTransform();
  });

  zoomResetBtn?.addEventListener('click', () => {
    currentZoomScale = 1.0;
    updateZoomTransform();
  });

  closeLightboxBtn?.addEventListener('click', closeLightbox);
  lightboxOverlay?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach Lightbox click triggers
  bgRemovePreview?.addEventListener('click', () => {
    if (bgRemovePreview.src) {
      openLightbox(bgRemovePreview.src, t('lightboxPreviewTitle'));
    }
  });
}

// Interactive AI Studio setup
function setupAiStudio() {
  // OCR Handler
  if (runOcrBtn && ocrFileInput) {
    runOcrBtn.addEventListener('click', async () => {
      if (!ocrFileInput.files || !ocrFileInput.files.length) {
        alert(t('ocrPickFile'));
        return;
      }
      const file = ocrFileInput.files[0];
      const lang = ocrLangSelect.value;

      runOcrBtn.disabled = true;
      runOcrBtn.textContent = t('ocrRunning');
      ocrProgress.textContent = t('ocrStarting');

      try {
        const AiEngine = await loadAiEngine();
        const onProgress = (percent) => {
          ocrProgress.textContent = t('ocrProgress', percent);
        };
        // A PDF is read page by page from pictures of its pages, which the searchable-PDF path does.
        const wantsPdf = ocrOutputSelect?.value === 'pdf';
        const res =
          wantsPdf || isPdfFile(file)
            ? await AiEngine.createSearchablePdf(file, lang, onProgress, PDF_OPTIONS())
            : await AiEngine.extractTextFromImage(file, lang, onProgress);

        ocrResultText.value = res.text || t('ocrNoText');
        if (wantsPdf) {
          ZipEngine.downloadBlob(res.blob, res.filename);
          ocrProgress.textContent = t('ocrPdfDone', res.filename);
        } else {
          ocrProgress.textContent = t('ocrDone');
        }
      } catch (err) {
        console.error('OCR Error:', err);
        ocrProgress.textContent = t('ocrError', errorReason(err, 'dashboard'));
      } finally {
        runOcrBtn.disabled = false;
        runOcrBtn.textContent = t('runOcr');
      }
    });

    copyOcrBtn?.addEventListener('click', () => {
      if (ocrResultText.value) {
        navigator.clipboard.writeText(ocrResultText.value);
        copyOcrBtn.textContent = t('copied');
        setTimeout(() => { copyOcrBtn.textContent = t('copyOcr'); }, 2000);
      }
    });
  }

  if (bgRemoveTolerance && bgRemoveToleranceVal) {
    bgRemoveTolerance.addEventListener('input', (e) => {
      bgRemoveToleranceVal.textContent = e.target.value;
    });
  }

  // Background Removal Handler
  if (runBgRemoveBtn && bgRemoveFileInput) {
    runBgRemoveBtn.addEventListener('click', async () => {
      if (!bgRemoveFileInput.files || !bgRemoveFileInput.files.length) {
        alert(t('bgPickFile'));
        return;
      }
      const file = bgRemoveFileInput.files[0];

      runBgRemoveBtn.disabled = true;
      runBgRemoveBtn.textContent = t('bgRunning');
      bgRemoveStatus.textContent = t('bgAnalysing');

      try {
        const tolerance = Number(bgRemoveTolerance?.value) || 32;
        const imgRes = await ImageEngine.removeBackground(file, { tolerance });
        bgRemovedBlob = imgRes.blob;

        bgRemovePreview.src = imgRes.dataUrl;
        bgRemovePreview.style.display = 'block';
        if (bgRemoveHint) bgRemoveHint.style.display = 'block';
        if (bgRemovePlaceholder) bgRemovePlaceholder.style.display = 'none';
        downloadBgRemoveBtn.style.display = 'inline-block';

        const clearedPercent = Math.round(imgRes.clearedRatio * 100);
        if (clearedPercent < 2) {
          bgRemoveStatus.textContent = t('bgLowResult', clearedPercent);
        } else {
          const { r, g, b } = imgRes.backgroundColor;
          bgRemoveStatus.textContent = t('bgResult', clearedPercent, `rgb(${r}, ${g}, ${b})`);
        }
      } catch (err) {
        console.error('BG Removal Error:', err);
        bgRemoveStatus.textContent = t('bgError', err.message);
      } finally {
        runBgRemoveBtn.disabled = false;
        runBgRemoveBtn.textContent = t('runBgRemove');
      }
    });

    downloadBgRemoveBtn?.addEventListener('click', () => {
      if (bgRemovedBlob) {
        ZipEngine.downloadBlob(bgRemovedBlob, `bg_removed_${Date.now()}.png`);
      }
    });
  }
}

// Crop & Flip: one picture, shown scaled down on a canvas. The area to keep is held in the
// picture's own pixels; dragging over the picture and typing in the fields both set it.
const crop = { file: null, width: 0, height: 0, area: null };
const cropEl = (id) => document.getElementById(id);
const CROP_FIELDS = { x: 'crop-x', y: 'crop-y', width: 'crop-width', height: 'crop-height' };

/** The area typed in the fields, kept inside the picture; null when it holds nothing. */
function cropAreaFromFields() {
  const value = (key) => cropEl(CROP_FIELDS[key])?.value;
  try {
    const typed = { x: value('x'), y: value('y'), width: value('width') || 0, height: value('height') || 0 };
    return ImageEngine.cropRect(typed, crop.width, crop.height);
  } catch {
    return null;
  }
}

/** Draws the box over the picture and the size line for the current area. */
function showCropArea() {
  const box = cropEl('crop-box');
  const size = cropEl('crop-size');
  const area = crop.area;
  if (!box || !size) return;
  box.style.display = area ? 'block' : 'none';
  if (area) {
    box.style.left = `${(area.x / crop.width) * 100}%`;
    box.style.top = `${(area.y / crop.height) * 100}%`;
    box.style.width = `${(area.width / crop.width) * 100}%`;
    box.style.height = `${(area.height / crop.height) * 100}%`;
  }
  size.textContent = !crop.file ? '' : area ? t('cropSize', area.width, area.height, crop.width, crop.height) : t('cropEmpty');
  const run = cropEl('run-crop-btn');
  if (run) run.disabled = !area;
}

function setCropArea(area, { writeFields = true } = {}) {
  crop.area = area;
  if (writeFields && area) {
    for (const [key, id] of Object.entries(CROP_FIELDS)) cropEl(id).value = area[key];
  }
  showCropArea();
}

async function loadCropPicture(file) {
  const status = cropEl('crop-status');
  const canvas = cropEl('crop-canvas');
  status.textContent = '';
  try {
    const img = await ImageEngine.loadImage(file);
    // The preview needs no more pixels than the screen shows; the saved picture uses them all.
    const scale = Math.min(1, 1200 / img.naturalWidth, 960 / img.naturalHeight);
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    Object.assign(crop, { file, width: img.naturalWidth, height: img.naturalHeight });
    cropEl('crop-frame').hidden = false;
    cropEl('crop-placeholder').hidden = true;
    cropEl('crop-whole-btn').disabled = false;
    setCropArea(ImageEngine.cropRect(null, crop.width, crop.height));
  } catch (err) {
    console.error('Crop: could not open the picture:', err);
    Object.assign(crop, { file: null, width: 0, height: 0, area: null });
    cropEl('crop-frame').hidden = true;
    cropEl('crop-placeholder').hidden = false;
    cropEl('crop-whole-btn').disabled = true;
    showCropArea();
    status.textContent = t('cropError', errorReason(err, 'dashboard'));
  }
}

function setupCropTool() {
  const input = cropEl('crop-file-input');
  const frame = cropEl('crop-frame');
  if (!input || !frame) return;

  input.addEventListener('change', () => {
    if (input.files?.length) loadCropPicture(input.files[0]);
  });

  // Typing moves the box at once; leaving a field writes back what was kept inside the picture.
  for (const id of Object.values(CROP_FIELDS)) {
    const field = cropEl(id);
    field.addEventListener('input', () => crop.file && setCropArea(cropAreaFromFields(), { writeFields: false }));
    field.addEventListener('change', () => crop.file && setCropArea(cropAreaFromFields() ?? crop.area));
  }

  cropEl('crop-whole-btn').addEventListener('click', () => {
    if (crop.file) setCropArea(ImageEngine.cropRect(null, crop.width, crop.height));
  });

  // Dragging: the picture's pixel under the pointer, from where the frame is on the screen.
  const pixelAt = (event) => {
    const bounds = frame.getBoundingClientRect();
    const along = (offset, size, total) => Math.min(total, Math.max(0, Math.round((offset / size) * total)));
    return {
      x: along(event.clientX - bounds.left, bounds.width, crop.width),
      y: along(event.clientY - bounds.top, bounds.height, crop.height)
    };
  };
  let start = null;
  let before = null;
  const areaTo = (event) => {
    const end = pixelAt(event);
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  };
  frame.addEventListener('pointerdown', (event) => {
    if (!crop.file || event.button !== 0) return;
    event.preventDefault();
    start = pixelAt(event);
    before = crop.area;
    try {
      frame.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the page made up itself cannot be captured; the drag works without.
    }
  });
  frame.addEventListener('pointermove', (event) => {
    if (start) setCropArea(areaTo(event));
  });
  const finish = (event) => {
    if (!start) return;
    const area = areaTo(event);
    start = null;
    // A click, not a drag, leaves the area as it was.
    setCropArea(area.width >= 1 && area.height >= 1 ? area : before);
  };
  frame.addEventListener('pointerup', finish);
  frame.addEventListener('pointercancel', () => {
    if (start) setCropArea(before);
    start = null;
  });

  const run = cropEl('run-crop-btn');
  const status = cropEl('crop-status');
  run.addEventListener('click', async () => {
    if (!crop.file || !crop.area) return;
    run.disabled = true;
    status.textContent = t('cropRunning');
    try {
      const res = await ImageEngine.cropAndFlip(crop.file, {
        crop: crop.area,
        flipHorizontal: cropEl('flip-horizontal').checked,
        flipVertical: cropEl('flip-vertical').checked
      });
      ZipEngine.downloadBlob(res.blob, res.filename);
      status.textContent = t('cropSaved', res.filename, res.width, res.height);
    } catch (err) {
      console.error('Crop error:', err);
      status.textContent = t('cropError', errorReason(err, 'dashboard'));
    } finally {
      run.disabled = !crop.area;
    }
  });
}

// Drag & Drop (Supports Files and Directory Traversal)
function setupDashDropZone() {
  if (!dashDropZone || !dashFileInput) return;

  dashDropZone.addEventListener('click', () => dashFileInput.click());

  dashDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dashDropZone.classList.add('dragover');
  });

  dashDropZone.addEventListener('dragleave', () => dashDropZone.classList.remove('dragover'));

  dashDropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dashDropZone.classList.remove('dragover');

    const items = e.dataTransfer.items;
    if (items && items.length) {
      const files = await extractFilesFromDataTransfer(items);
      addFilesToDashQueue(files);
    } else if (e.dataTransfer.files.length) {
      addFilesToDashQueue(Array.from(e.dataTransfer.files));
    }
  });

  dashFileInput.addEventListener('change', () => {
    if (dashFileInput.files.length) {
      addFilesToDashQueue(Array.from(dashFileInput.files));
    }
  });

  dashConvertBtn.addEventListener('click', executeDashBatchConversion);
}

// Recursive Directory Entry Traversal
async function extractFilesFromDataTransfer(items) {
  const filePromises = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;

    if (entry) {
      filePromises.push(readEntryRecursively(entry));
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) filePromises.push(Promise.resolve([file]));
    }
  }

  const results = await Promise.all(filePromises);
  return results.flat();
}

function readEntryRecursively(entry) {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file) => resolve([file]));
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      dirReader.readEntries(async (entries) => {
        const entryPromises = entries.map((childEntry) => readEntryRecursively(childEntry));
        const nestedFiles = await Promise.all(entryPromises);
        resolve(nestedFiles.flat());
      });
    } else {
      resolve([]);
    }
  });
}

// Add Files to Queue
function addFilesToDashQueue(files) {
  files.forEach(f => dashFileQueue.push(f));
  renderDashQueue();
}

function renderDashQueue() {
  // The password field only matters once there is a PDF to open.
  const passwordGroup = document.getElementById('dash-pdf-password-group');
  if (passwordGroup) passwordGroup.style.display = dashFileQueue.some(isPdfFile) ? 'block' : 'none';
  if (!dashQueueList) return;
  dashQueueList.innerHTML = '';

  if (dashFileQueue.length === 0) {
    dashQueueList.innerHTML = '<p class="empty-queue-hint" style="color: var(--text-secondary); text-align: center; padding: 20px;">' + t('queueEmpty') + '</p>';
    dashConvertBtn.disabled = true;
    return;
  }

  dashConvertBtn.disabled = false;

  const header = document.createElement('div');
  header.className = 'queue-header';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';
  header.innerHTML = `
    <strong>${t('dashQueueTitle', dashFileQueue.length)}</strong>
    <button id="dash-clear-queue-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:600;">${t('clearAll')}</button>
  `;
  dashQueueList.appendChild(header);

  document.getElementById('dash-clear-queue-btn')?.addEventListener('click', () => {
    dashFileQueue = [];
    dashConvertedResults = [];
    renderDashQueue();
  });

  dashFileQueue.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '10px 14px';
    item.style.background = 'var(--card-bg)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = '8px';
    item.style.marginBottom = '8px';

    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    item.innerHTML = `
      <div>
        <strong style="color: var(--text-primary);">${file.name}</strong>
        <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">(${fileSizeMB} MB)</span>
      </div>
      <span class="item-status status-ready" id="dash-status-${index}" style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: rgba(99, 102, 241, 0.2); color: var(--accent-color);">${t('statusReady')}</span>
    `;
    dashQueueList.appendChild(item);
  });
}

// Execute Batch Conversion
async function executeDashBatchConversion() {
  if (!dashFileQueue.length) return;

  dashConvertBtn.disabled = true;
  dashConvertBtn.textContent = t('batchConverting');
  dashConvertedResults = [];

  const targetFormat = dashTargetFormat.value;
  const quality = parseFloat(dashQualityRange.value) / 100;

  // Merging is the one job that takes the whole queue at once instead of file by file.
  if (targetFormat === 'pdf-merge') {
    await mergeDashQueue();
    dashConvertBtn.disabled = false;
    dashConvertBtn.textContent = t('dashConvert');
    return;
  }

  for (let i = 0; i < dashFileQueue.length; i++) {
    const file = dashFileQueue[i];
    const statusEl = document.getElementById(`dash-status-${i}`);

    if (statusEl) {
      statusEl.textContent = t('statusConverting');
      statusEl.style.background = 'rgba(99, 102, 241, 0.3)';
    }

    try {
      const res = await processDashSingleFile(file, targetFormat, quality);
      dashConvertedResults.push(res);

      if (statusEl) {
        statusEl.textContent = t('statusDone');
        statusEl.style.background = 'rgba(16, 185, 129, 0.2)';
        statusEl.style.color = '#10b981';
      }
    } catch (err) {
      console.error(`Error converting ${file.name}:`, err);
      if (statusEl) {
        statusEl.textContent = passwordStatus(err) || t('statusError');
        // The reason, for whoever hovers over the red label.
        statusEl.title = errorReason(err, 'dashboard');
        statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
        statusEl.style.color = '#ef4444';
      }
    }
  }

  dashConvertBtn.disabled = false;
  dashConvertBtn.textContent = t('dashConvert');

  if (dashConvertedResults.length === 1) {
    ZipEngine.downloadBlob(dashConvertedResults[0].blob, dashConvertedResults[0].filename);
  } else if (dashConvertedResults.length > 1) {
    const zipRes = await ZipEngine.createZip(dashConvertedResults, `batch_converted_${Date.now()}.zip`);
    ZipEngine.downloadBlob(zipRes.blob, zipRes.filename);
  }
}

function setDashStatus(index, text, state) {
  const statusEl = document.getElementById(`dash-status-${index}`);
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.title = text;
  if (state === 'done') {
    statusEl.style.background = 'rgba(16, 185, 129, 0.2)';
    statusEl.style.color = '#10b981';
  } else if (state === 'error') {
    statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
    statusEl.style.color = '#ef4444';
  } else if (state === 'skipped') {
    statusEl.style.background = 'rgba(148, 163, 184, 0.2)';
    statusEl.style.color = 'var(--text-secondary)';
  }
}

// Joins every PDF in the queue into one file, in queue order.
async function mergeDashQueue() {
  const pdfIndexes = dashFileQueue.map((file, index) => (isPdfFile(file) ? index : -1)).filter((index) => index >= 0);
  dashFileQueue.forEach((file, index) => {
    if (!isPdfFile(file)) setDashStatus(index, t('statusSkippedNotPdf'), 'skipped');
  });
  if (pdfIndexes.length < 2) {
    pdfIndexes.forEach((index) => setDashStatus(index, t('needTwoPdfs'), 'error'));
    return;
  }
  pdfIndexes.forEach((index) => setDashStatus(index, t('statusMerging')));
  try {
    const { mergePdfs } = await loadPdfTools();
    const merged = await mergePdfs(pdfIndexes.map((index) => dashFileQueue[index]), PDF_OPTIONS());
    dashConvertedResults = [merged];
    pdfIndexes.forEach((index) => setDashStatus(index, t('statusMerged'), 'done'));
    ZipEngine.downloadBlob(merged.blob, merged.filename);
  } catch (err) {
    console.error('Error merging PDFs:', err);
    pdfIndexes.forEach((index) => setDashStatus(index, t('errorWithReason', errorReason(err, 'dashboard')), 'error'));
  }
}

// Single File Processor Router for Dashboard
async function processDashSingleFile(file, targetFormat, quality) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (PDF_PAGE_TOOLS[targetFormat]) {
    if (!isPdfFile(file)) throw new Error(t('statusSkippedNotPdf'));
    const tools = await loadPdfTools();
    if (targetFormat === 'pdf-rotate') return tools.rotatePdfPages(file, ROTATE_ANGLE(), PAGE_TOOL_PAGES(), PDF_OPTIONS());
    if (targetFormat === 'pdf-delete') return tools.deletePdfPages(file, PAGE_TOOL_PAGES(), PDF_OPTIONS());
    if (targetFormat === 'pdf-number') {
      return tools.numberPdfPages(file, { ...NUMBER_OPTIONS(), pages: PAGE_TOOL_PAGES(), ...PDF_OPTIONS() });
    }
    return tools.reorderPdfPages(file, PAGE_TOOL_PAGES(), PDF_OPTIONS());
  }

  // OCR reads scans and photos alike: both become a PDF with a text layer.
  if (targetFormat === 'ocr-pdf') {
    if (!IMAGE_EXTENSIONS.includes(ext) && !isPdfFile(file)) throw new Error(t('ocrPdfNeedsScan'));
    const AiEngine = await loadAiEngine();
    return AiEngine.createSearchablePdf(file, 'vie+eng', null, PDF_OPTIONS());
  }

  // Image Processing
  if (IMAGE_EXTENSIONS.includes(ext)) {
    if (targetFormat === 'pdf') {
      const DocEngine = await loadDocEngine();
      const pdfBlob = await DocEngine.imageToPdf(file, `${file.name}.pdf`);
      return { blob: pdfBlob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf` };
    }
    const validImgFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico'];
    const finalFormat = validImgFormats.includes(targetFormat) ? targetFormat : 'png';
    const imgRes = await ImageEngine.convert(file, { targetFormat: finalFormat, quality, watermarkText: watermarkText() });
    return { blob: imgRes.blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${finalFormat}` };
  }

  // DOCX Processing
  if (ext === 'docx') {
    const validDocFormats = ['html', 'txt', 'md', 'markdown', 'pdf'];
    const finalFormat = validDocFormats.includes(targetFormat) ? targetFormat : 'pdf';
    const DocEngine = await loadDocEngine();
    const docRes = await DocEngine.convertDocx(file, finalFormat);
    if (docRes.blob) {
      return { blob: docRes.blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${docRes.extension}` };
    }
    const blob = new Blob([docRes.content], { type: docRes.mimeType });
    return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${docRes.extension}` };
  }

  // PDF Processing
  if (ext === 'pdf') {
    if (targetFormat === 'pdf-split') {
      const { splitPdf } = await loadPdfTools();
      const parts = await splitPdf(file, SPLIT_RANGES(), PDF_OPTIONS());
      if (parts.length === 1) return parts[0];
      const zipRes = await ZipEngine.createZip(parts.map(p => ({ name: p.filename, blob: p.blob })), `${file.name.replace(/\.[^/.]+$/, '')}_split.zip`);
      return { blob: zipRes.blob, filename: zipRes.filename };
    }
    const PdfEngine = await loadPdfEngine();
    if (targetFormat === 'txt') {
      const text = await PdfEngine.extractPdfText(file, PDF_OPTIONS());
      const blob = new Blob([text], { type: 'text/plain' });
      return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.txt` };
    }
    const pages = await PdfEngine.renderPdfToImages(file, { format: 'png', ...PDF_OPTIONS() });
    if (pages.length === 1) {
      return { blob: pages[0].blob, filename: pages[0].filename };
    }
    const zipRes = await ZipEngine.createZip(pages.map(p => ({ name: p.filename, blob: p.blob })), `${file.name}_pages.zip`);
    return { blob: zipRes.blob, filename: zipRes.filename };
  }

  // Spreadsheets: CSV (one per sheet), JSON, the other data formats, or another spreadsheet format
  if (SPREADSHEET_EXTENSIONS.includes(ext)) {
    const sheets = await loadSheetEngine();
    const bytes = await file.arrayBuffer();
    const base = file.name.replace(/\.[^/.]+$/, '');
    if (sheets.SPREADSHEET_OUTPUTS[targetFormat]) {
      return { blob: sheets.convertSpreadsheet(bytes, targetFormat), filename: `${base}.${targetFormat}` };
    }
    if (targetFormat === 'csv') {
      const files = sheets.spreadsheetToCsv(bytes, file.name);
      if (files.length === 1) return files[0];
      // createZip names entries by filename and keeps sheets whose names clash once made safe.
      const zipRes = await ZipEngine.createZip(files, `${base}_sheets.zip`);
      return { blob: zipRes.blob, filename: zipRes.filename };
    }
    const finalFormat = ['json', 'xml', 'yaml', 'ts', 'go'].includes(targetFormat) ? targetFormat : 'json';
    const outputText = DataEngine.convert(sheets.readSpreadsheet(bytes), finalFormat);
    const mimeTypes = { json: 'application/json', xml: 'text/xml', yaml: 'text/yaml' };
    return { blob: new Blob([outputText], { type: mimeTypes[finalFormat] || 'text/plain' }), filename: `${base}.${finalFormat}` };
  }

  // Data Processing (JSON, CSV, XML, YAML)
  if (['json', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) {
    const text = await readFileAsText(file);
    const parsedData = DataEngine.parse(text, ext === 'yml' ? 'yaml' : ext);
    if (['xlsx', 'ods'].includes(targetFormat)) {
      const { dataToSpreadsheet } = await loadSheetEngine();
      // CSV gives every value as text; plain numbers go into the sheet as numbers.
      const blob = dataToSpreadsheet(parsedData, targetFormat, { numbersFromText: ext === 'csv' });
      return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}` };
    }
    const validDataFormats = ['json', 'csv', 'xml', 'yaml', 'ts', 'go'];
    const finalFormat = validDataFormats.includes(targetFormat) ? targetFormat : 'json';
    const outputText = DataEngine.convert(parsedData, finalFormat);
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      xml: 'text/xml',
      yaml: 'text/yaml',
      ts: 'text/plain',
      go: 'text/plain'
    };
    const blob = new Blob([outputText], { type: mimeTypes[finalFormat] || 'text/plain' });
    return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${finalFormat}` };
  }

  // Fallback / Plain Text
  const rawText = await readFileAsText(file);
  const DocEngine = await loadDocEngine();
  const pdfBlob = DocEngine.textToPdf(rawText, file.name);
  return { blob: pdfBlob, filename: `${file.name}.pdf` };
}

// DevTools Tab Logic
function setupDevTools() {
  if (!jsonInput || !codeOutput) return;

  function updateGeneratedCode() {
    const text = jsonInput.value.trim();
    if (!text) {
      codeOutput.value = '';
      return;
    }
    try {
      const data = JSON.parse(text);
      const lang = devLangSelect.value;
      if (lang === 'ts') {
        codeOutput.value = DataEngine.generateTypeScript(data, 'UserDefinedType');
      } else if (lang === 'go') {
        codeOutput.value = DataEngine.generateGoStruct(data, 'UserDefinedStruct');
      } else if (lang === 'sql') {
        codeOutput.value = DataEngine.generateSQL(data, 'user_records');
      } else if (lang === 'py') {
        codeOutput.value = DataEngine.generatePython(data, 'UserRecordModel');
      } else if (lang === 'yaml') {
        codeOutput.value = DataEngine.convert(data, 'yaml');
      }
    } catch (err) {
      codeOutput.value = t('jsonInvalid', err.message);
    }
  }

  jsonInput.addEventListener('input', updateGeneratedCode);
  devLangSelect?.addEventListener('change', updateGeneratedCode);

  copyCodeBtn?.addEventListener('click', () => {
    if (codeOutput.value) {
      navigator.clipboard.writeText(codeOutput.value);
      copyCodeBtn.textContent = t('copied');
      setTimeout(() => {
        copyCodeBtn.textContent = t('copyCode');
      }, 2000);
    }
  });
}

// Settings Persistence
function setupSettingsPersistence() {
  // The interface's language: the browser's unless the user picks one, here or in the popup. The
  // right-click menu follows through the service worker, which watches the stored choice.
  const languageSelect = document.getElementById('dash-language-select');
  if (chrome.storage?.local && languageSelect) {
    bindLanguageSelect(languageSelect, () => {
      renderDashQueue();
      showFormatFields();
      showCropArea();
    });
  }

  if (chrome.storage?.local && autoConvertToggle) {
    const note = document.getElementById('dash-auto-convert-note');
    readAutoConvert().then((on) => {
      autoConvertToggle.checked = on;
    });

    // The format of the copy auto-convert saves; the service worker reads it at each download.
    if (autoFormatSelect) {
      chrome.storage.local.get('targetAutoFormat').then(({ targetAutoFormat }) => {
        autoFormatSelect.value = targetAutoFormat === 'jpg' ? 'jpg' : 'png';
      });
      autoFormatSelect.addEventListener('change', () => {
        chrome.storage.local.set({ targetAutoFormat: autoFormatSelect.value });
      });
    }

    // The watermark of the Watermark tab is remembered, and read by the batch converter.
    if (watermarkEnabled && watermarkInput) {
      chrome.storage.local.get(['watermarkEnabled', 'watermarkText']).then((stored) => {
        watermarkEnabled.checked = stored.watermarkEnabled === true;
        if (stored.watermarkText) watermarkInput.value = stored.watermarkText;
      });
      watermarkEnabled.addEventListener('change', () => {
        chrome.storage.local.set({ watermarkEnabled: watermarkEnabled.checked });
      });
      watermarkInput.addEventListener('change', () => {
        chrome.storage.local.set({ watermarkText: watermarkInput.value.trim() });
      });
    }

    autoConvertToggle.addEventListener('change', async (e) => {
      if (note) note.style.display = 'none';
      if (!e.target.checked) {
        await turnOffAutoConvert();
        return;
      }
      if (!(await turnOnAutoConvert())) {
        e.target.checked = false;
        if (note) note.style.display = 'block';
      }
    });
  }
}
