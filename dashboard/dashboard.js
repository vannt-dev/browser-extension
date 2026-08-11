import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { DocEngine } from '../engine/doc-engine.js';
import { PdfEngine } from '../engine/pdf-engine.js';
import { AiEngine } from '../engine/ai-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';

// State for Dashboard Batch Converter
let dashFileQueue = [];
let dashConvertedResults = [];

// DOM Elements
const dashDropZone = document.getElementById('dash-drop-zone');
const dashFileInput = document.getElementById('dash-file-input');
const dashTargetFormat = document.getElementById('dash-target-format');
const dashQualityRange = document.getElementById('dash-quality-range');
const dashQualityVal = document.getElementById('dash-quality-val');
const dashConvertBtn = document.getElementById('dash-convert-btn');
const dashQueueList = document.getElementById('dash-queue-list');
const jsonInput = document.getElementById('json-input');
const codeOutput = document.getElementById('code-output');
const devLangSelect = document.getElementById('dev-lang-select');
const copyCodeBtn = document.getElementById('copy-code-btn');
const autoConvertToggle = document.getElementById('dash-auto-convert-toggle');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupDashDropZone();
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
    const docRes = await DocEngine.convertDocx(file, finalFormat);
    if (docRes.blob) {
      return { blob: docRes.blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${docRes.extension}` };
    }
    const blob = new Blob([docRes.content], { type: docRes.mimeType });
    return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${docRes.extension}` };
  }

  // PDF Processing
  if (ext === 'pdf') {
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
    const text = await DocEngine.readFileAsText(file);
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
  const rawText = await DocEngine.readFileAsText(file);
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
