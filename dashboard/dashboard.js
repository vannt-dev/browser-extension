import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';
import { readFileAsText } from '../engine/file-reader.js';

// Heavy engines are fetched on first use so opening the dashboard does not have
// to parse the OCR, DOCX and PDF runtimes up front.
const loadAiEngine = () => import('../engine/ai-engine.js').then((m) => m.AiEngine);
const loadDocEngine = () => import('../engine/doc-engine.js').then((m) => m.DocEngine);
const loadPdfEngine = () => import('../engine/pdf-engine.js').then((m) => m.PdfEngine);

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
const dashQualityVal = document.getElementById('dash-quality-val');
const dashConvertBtn = document.getElementById('dash-convert-btn');
const dashQueueList = document.getElementById('dash-queue-list');

// AI Studio Elements
const ocrFileInput = document.getElementById('ocr-file-input');
const ocrLangSelect = document.getElementById('ocr-lang-select');
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

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupDashDropZone();
  setupAiStudio();
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

  function openLightbox(imgSrc, title = 'Xem ảnh phóng to chi tiết') {
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
      openLightbox(bgRemovePreview.src, 'Xem trước ảnh đã tách nền');
    }
  });
}

// Interactive AI Studio setup
function setupAiStudio() {
  // OCR Handler
  if (runOcrBtn && ocrFileInput) {
    runOcrBtn.addEventListener('click', async () => {
      if (!ocrFileInput.files || !ocrFileInput.files.length) {
        alert('Vui lòng chọn 1 file ảnh chụp hoặc scan để đọc chữ OCR!');
        return;
      }
      const file = ocrFileInput.files[0];
      const lang = ocrLangSelect.value;

      runOcrBtn.disabled = true;
      runOcrBtn.textContent = '⏳ Đang quét đọc chữ AI...';
      ocrProgress.textContent = 'Đang khởi tạo mô hình OCR...';

      try {
        const AiEngine = await loadAiEngine();
        const res = await AiEngine.extractTextFromImage(file, lang, (percent) => {
          ocrProgress.textContent = `Tiến trình đọc chữ: ${percent}%`;
        });

        ocrResultText.value = res.text || 'Không tìm thấy văn bản trong ảnh.';
        ocrProgress.textContent = '✅ Đọc chữ thành công 100%!';
      } catch (err) {
        console.error('OCR Error:', err);
        ocrProgress.textContent = '❌ Lỗi đọc chữ: ' + err.message;
      } finally {
        runOcrBtn.disabled = false;
        runOcrBtn.textContent = '🔍 Bắt đầu đọc chữ (OCR)';
      }
    });

    copyOcrBtn?.addEventListener('click', () => {
      if (ocrResultText.value) {
        navigator.clipboard.writeText(ocrResultText.value);
        copyOcrBtn.textContent = '✅ Đã sao chép!';
        setTimeout(() => { copyOcrBtn.textContent = '📋 Sao chép văn bản OCR'; }, 2000);
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
        alert('Vui lòng chọn 1 file ảnh để tách nền phông!');
        return;
      }
      const file = bgRemoveFileInput.files[0];

      runBgRemoveBtn.disabled = true;
      runBgRemoveBtn.textContent = '⚡ Đang tách nền...';
      bgRemoveStatus.textContent = 'Đang phân tích màu nền và tách biên...';

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
          bgRemoveStatus.textContent =
            `⚠️ Chỉ tách được ${clearedPercent}% ảnh — nền có thể không đồng nhất. Hãy tăng độ nhạy rồi thử lại.`;
        } else {
          bgRemoveStatus.textContent =
            `✅ Đã tách ${clearedPercent}% nền (màu nền nhận diện: rgb(${imgRes.backgroundColor.r}, ${imgRes.backgroundColor.g}, ${imgRes.backgroundColor.b})). Click ảnh để phóng to`;
        }
      } catch (err) {
        console.error('BG Removal Error:', err);
        bgRemoveStatus.textContent = '❌ Lỗi tách nền: ' + err.message;
      } finally {
        runBgRemoveBtn.disabled = false;
        runBgRemoveBtn.textContent = '✂️ Xóa nền đơn sắc';
      }
    });

    downloadBgRemoveBtn?.addEventListener('click', () => {
      if (bgRemovedBlob) {
        ZipEngine.downloadBlob(bgRemovedBlob, `bg_removed_${Date.now()}.png`);
      }
    });
  }
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
  if (!dashQueueList) return;
  dashQueueList.innerHTML = '';

  if (dashFileQueue.length === 0) {
    dashQueueList.innerHTML = '<p class="empty-queue-hint" style="color: var(--text-secondary); text-align: center; padding: 20px;">Chưa có file nào trong danh sách chờ.</p>';
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
    <strong>Danh sách file chờ chuyển đổi (${dashFileQueue.length})</strong>
    <button id="dash-clear-queue-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:600;">Xóa tất cả</button>
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
      <span class="item-status status-ready" id="dash-status-${index}" style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: rgba(99, 102, 241, 0.2); color: var(--accent-color);">Sẵn sàng</span>
    `;
    dashQueueList.appendChild(item);
  });
}

// Execute Batch Conversion
async function executeDashBatchConversion() {
  if (!dashFileQueue.length) return;

  dashConvertBtn.disabled = true;
  dashConvertBtn.textContent = '⏳ Đang chuyển đổi hàng loạt...';
  dashConvertedResults = [];

  const targetFormat = dashTargetFormat.value;
  const quality = parseFloat(dashQualityRange.value) / 100;

  for (let i = 0; i < dashFileQueue.length; i++) {
    const file = dashFileQueue[i];
    const statusEl = document.getElementById(`dash-status-${i}`);

    if (statusEl) {
      statusEl.textContent = 'Đang chuyển...';
      statusEl.style.background = 'rgba(99, 102, 241, 0.3)';
    }

    try {
      const res = await processDashSingleFile(file, targetFormat, quality);
      dashConvertedResults.push(res);

      if (statusEl) {
        statusEl.textContent = 'Hoàn thành';
        statusEl.style.background = 'rgba(16, 185, 129, 0.2)';
        statusEl.style.color = '#10b981';
      }
    } catch (err) {
      console.error(`Error converting ${file.name}:`, err);
      if (statusEl) {
        statusEl.textContent = 'Lỗi';
        statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
        statusEl.style.color = '#ef4444';
      }
    }
  }

  dashConvertBtn.disabled = false;
  dashConvertBtn.textContent = 'Chuyển đổi & Đóng gói ZIP';

  if (dashConvertedResults.length === 1) {
    ZipEngine.downloadBlob(dashConvertedResults[0].blob, dashConvertedResults[0].filename);
  } else if (dashConvertedResults.length > 1) {
    const zipRes = await ZipEngine.createZip(dashConvertedResults, `batch_converted_${Date.now()}.zip`);
    ZipEngine.downloadBlob(zipRes.blob, zipRes.filename);
  }
}

// Single File Processor Router for Dashboard
async function processDashSingleFile(file, targetFormat, quality) {
  const ext = file.name.split('.').pop().toLowerCase();

  // Image Processing
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif'].includes(ext)) {
    if (targetFormat === 'pdf') {
      const DocEngine = await loadDocEngine();
      const pdfBlob = await DocEngine.imageToPdf(file, `${file.name}.pdf`);
      return { blob: pdfBlob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf` };
    }
    const validImgFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico'];
    const finalFormat = validImgFormats.includes(targetFormat) ? targetFormat : 'png';
    const imgRes = await ImageEngine.convert(file, { targetFormat: finalFormat, quality });
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
    const PdfEngine = await loadPdfEngine();
    if (targetFormat === 'txt') {
      const text = await PdfEngine.extractPdfText(file);
      const blob = new Blob([text], { type: 'text/plain' });
      return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.txt` };
    }
    const pages = await PdfEngine.renderPdfToImages(file, { format: 'png' });
    if (pages.length === 1) {
      return { blob: pages[0].blob, filename: pages[0].filename };
    }
    const zipRes = await ZipEngine.createZip(pages.map(p => ({ name: p.filename, blob: p.blob })), `${file.name}_pages.zip`);
    return { blob: zipRes.blob, filename: zipRes.filename };
  }

  // Data Processing (JSON, CSV, XML, YAML)
  if (['json', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) {
    const text = await readFileAsText(file);
    const parsedData = DataEngine.parse(text, ext === 'yml' ? 'yaml' : ext);
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
      codeOutput.value = `// Cú pháp JSON chưa đúng: ${err.message}`;
    }
  }

  jsonInput.addEventListener('input', updateGeneratedCode);
  devLangSelect?.addEventListener('change', updateGeneratedCode);

  copyCodeBtn?.addEventListener('click', () => {
    if (codeOutput.value) {
      navigator.clipboard.writeText(codeOutput.value);
      copyCodeBtn.textContent = '✅ Đã sao chép!';
      setTimeout(() => {
        copyCodeBtn.textContent = '📋 Sao chép Code';
      }, 2000);
    }
  });
}

// Settings Persistence
function setupSettingsPersistence() {
  if (chrome.storage?.local && autoConvertToggle) {
    chrome.storage.local.get(['autoConvertWebp'], (res) => {
      if (res.autoConvertWebp) autoConvertToggle.checked = true;
    });

    autoConvertToggle.addEventListener('change', (e) => {
      chrome.storage.local.set({ autoConvertWebp: e.target.checked });
    });
  }
}
