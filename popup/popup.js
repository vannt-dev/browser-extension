import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { DocEngine } from '../engine/doc-engine.js';
import { PdfEngine } from '../engine/pdf-engine.js';
import { AiEngine } from '../engine/ai-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';

// Format Mapping Options
const FORMAT_OPTIONS = {
  image: [
    { label: 'PNG (.png)', value: 'png' },
    { label: 'JPG / JPEG (.jpg)', value: 'jpg' },
    { label: 'WebP (.webp)', value: 'webp' },
    { label: 'BMP (.bmp)', value: 'bmp' },
    { label: 'ICO (.ico)', value: 'ico' },
    { label: 'PDF Document (.pdf)', value: 'pdf' },
    { label: 'Base64 Code Snippet', value: 'base64' }
  ],
  doc: [
    { label: 'PDF Document (.pdf)', value: 'pdf' },
    { label: 'HTML Webpage (.html)', value: 'html' },
    { label: 'Plain Text (.txt)', value: 'txt' },
    { label: 'Markdown (.md)', value: 'md' },
    { label: 'Images PNG (Page-by-page)', value: 'png-pages' }
  ],
  data: [
    { label: 'JSON Format (.json)', value: 'json' },
    { label: 'CSV Table (.csv)', value: 'csv' },
    { label: 'YAML Format (.yaml)', value: 'yaml' },
    { label: 'XML Format (.xml)', value: 'xml' },
    { label: 'TypeScript Types (.ts)', value: 'ts' },
    { label: 'Go Struct (.go)', value: 'go' }
  ],
  ai: [
    { label: 'AI OCR Text Extraction (.txt)', value: 'ocr-txt' },
    { label: 'AI OCR Text (.docx)', value: 'ocr-docx' },
    { label: 'Target Size Compress (.jpg)', value: 'target-compress' }
  ]
};

// State
let fileQueue = [];
let convertedResults = [];
let currentCategory = 'image';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const targetFormatSelect = document.getElementById('target-format');
const qualitySlider = document.getElementById('quality-range');
const qualityVal = document.getElementById('quality-val');
const targetSizeGroup = document.getElementById('target-size-group');
const targetSizeInput = document.getElementById('target-size-input');
const qualitySliderGroup = document.getElementById('quality-slider-group');
const convertBtn = document.getElementById('convert-btn');
const convertSpinner = document.getElementById('convert-spinner');
const downloadZipBtn = document.getElementById('download-zip-btn');
const queueContainer = document.getElementById('file-queue-container');
const queueList = document.getElementById('file-queue-list');
const fileCountEl = document.getElementById('file-count');
const clearQueueBtn = document.getElementById('clear-queue-btn');
const themeToggle = document.getElementById('theme-toggle');
const openDashboardBtn = document.getElementById('open-dashboard-btn');
const autoConvertToggle = document.getElementById('auto-convert-download-toggle');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupCategoryNav();
  setupDropZone();
  setupClipboardListener();
  setupSettingsPersistence();
  updateFormatSelect('image');
});

// Category Nav Setup
function setupCategoryNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      updateFormatSelect(currentCategory);
    });
  });

  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
  });
}

function updateFormatSelect(category) {
  targetFormatSelect.innerHTML = '';
  const options = FORMAT_OPTIONS[category] || [];
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    targetFormatSelect.appendChild(el);
  });

  // Toggle option inputs visibility
  targetFormatSelect.addEventListener('change', () => {
    const val = targetFormatSelect.value;
    targetSizeGroup.style.display = val === 'target-compress' ? 'flex' : 'none';
    qualitySliderGroup.style.display = (val === 'jpg' || val === 'webp' || val === 'png') ? 'flex' : 'none';
  });
}

// Drag & Drop & File Picker Setup
function setupDropZone() {
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      addFilesToQueue(Array.from(fileInput.files));
    }
  });

  clearQueueBtn.addEventListener('click', () => {
    fileQueue = [];
    convertedResults = [];
    renderQueue();
  });
}

// Clipboard Ctrl+V Listener
function setupClipboardListener() {
  document.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const file = new File([blob], `clipboard_image_${Date.now()}.png`, { type: blob.type });
          addFilesToQueue([file]);
        }
      } else if (item.type === 'text/plain') {
        item.getAsString((text) => {
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const file = new File([text], `clipboard_data_${Date.now()}.json`, { type: 'application/json' });
            addFilesToQueue([file]);
          }
        });
      }
    }
  });
}

// Queue Management
function addFilesToQueue(files) {
  files.forEach(f => fileQueue.push(f));
  renderQueue();
}

function renderQueue() {
  fileCountEl.textContent = fileQueue.length;
  queueContainer.style.display = fileQueue.length > 0 ? 'block' : 'none';
  convertBtn.disabled = fileQueue.length === 0;

  queueList.innerHTML = '';
  fileQueue.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `
      <span class="item-name">${file.name}</span>
      <span class="item-status status-ready" id="status-${index}">Sẵn sàng</span>
    `;
    queueList.appendChild(item);
  });
}

// Conversion Execution
convertBtn.addEventListener('click', async () => {
  if (!fileQueue.length) return;

  convertBtn.disabled = true;
  convertSpinner.classList.remove('hidden');
  convertedResults = [];

  const targetFormat = targetFormatSelect.value;
  const quality = parseFloat(qualitySlider.value) / 100;
  const targetSizeKB = parseFloat(targetSizeInput.value) || 500;

  for (let i = 0; i < fileQueue.length; i++) {
    const file = fileQueue[i];
    const statusEl = document.getElementById(`status-${i}`);
    if (statusEl) {
      statusEl.textContent = 'Đang chuyển...';
      statusEl.className = 'item-status status-ready';
    }

    try {
      let res = await processSingleFile(file, targetFormat, quality, targetSizeKB);
      convertedResults.push(res);

      if (statusEl) {
        statusEl.textContent = 'Hoàn thành';
        statusEl.className = 'item-status status-done';
      }
    } catch (err) {
      console.error('File conversion error:', err);
      if (statusEl) {
        statusEl.textContent = 'Lỗi';
        statusEl.style.color = '#ef4444';
      }
    }
  }

  convertSpinner.classList.add('hidden');
  convertBtn.disabled = false;

  if (convertedResults.length === 1) {
    ZipEngine.downloadBlob(convertedResults[0].blob, convertedResults[0].filename);
  } else if (convertedResults.length > 1) {
    downloadZipBtn.style.display = 'block';
  }
});

// Single File Processor Router
async function processSingleFile(file, targetFormat, quality, targetSizeKB) {
  const ext = file.name.split('.').pop().toLowerCase();

  // Image Processing
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif'].includes(ext)) {
    if (targetFormat === 'pdf') {
      const pdfBlob = await DocEngine.imageToPdf(file, `${file.name}.pdf`);
      return { blob: pdfBlob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf` };
    }
    if (targetFormat === 'base64') {
      const b64 = await ImageEngine.toBase64Snippet(file);
      const blob = new Blob([b64.dataUri], { type: 'text/plain' });
      return { blob, filename: `${file.name}_base64.txt` };
    }
    if (targetFormat === 'target-compress') {
      const res = await ImageEngine.compressToTargetSize(file, targetSizeKB);
      return { blob: res.blob, filename: `compressed_${file.name}` };
    }
    if (targetFormat === 'ocr-txt' || targetFormat === 'ocr-docx') {
      const ocrRes = await AiEngine.extractTextFromImage(file);
      const blob = new Blob([ocrRes.text], { type: 'text/plain' });
      return { blob, filename: `ocr_${file.name.replace(/\.[^/.]+$/, '')}.txt` };
    }
    
    // Normal Image Format Conversion
    const imgRes = await ImageEngine.convert(file, { targetFormat, quality });
    return { blob: imgRes.blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}` };
  }

  // DOCX Processing
  if (ext === 'docx') {
    const docRes = await DocEngine.convertDocx(file, targetFormat);
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
    if (targetFormat === 'png-pages' || targetFormat === 'png') {
      const pages = await PdfEngine.renderPdfToImages(file, { format: 'png' });
      if (pages.length === 1) {
        return { blob: pages[0].blob, filename: pages[0].filename };
      }
      // If multiple pages, zip them
      const zipRes = await ZipEngine.createZip(pages.map(p => ({ name: p.filename, blob: p.blob })), `${file.name}_pages.zip`);
      return { blob: zipRes.blob, filename: zipRes.filename };
    }
  }

  // Data Processing (JSON, CSV, XML, YAML)
  if (['json', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) {
    const text = await DocEngine.readFileAsText(file);
    const parsedData = DataEngine.parse(text, ext === 'yml' ? 'yaml' : ext);
    const outputText = DataEngine.convert(parsedData, targetFormat);
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      xml: 'text/xml',
      yaml: 'text/yaml',
      ts: 'text/plain',
      go: 'text/plain'
    };
    const blob = new Blob([outputText], { type: mimeTypes[targetFormat] || 'text/plain' });
    return { blob, filename: `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat}` };
  }

  // Fallback / Text / Markdown
  const rawText = await DocEngine.readFileAsText(file);
  const pdfBlob = DocEngine.textToPdf(rawText, file.name);
  return { blob: pdfBlob, filename: `${file.name}.pdf` };
}

// Download Zip Button Event
downloadZipBtn.addEventListener('click', async () => {
  if (convertedResults.length) {
    const zipRes = await ZipEngine.createZip(convertedResults);
    ZipEngine.downloadBlob(zipRes.blob, 'all_converted_files.zip');
  }
});

// Settings & Options Page Navigation
function setupSettingsPersistence() {
  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
  });

  chrome.storage.local.get(['theme', 'autoConvertWebp'], (res) => {
    if (res.theme === 'light') document.body.classList.add('light-theme');
    if (res.autoConvertWebp) autoConvertToggle.checked = true;
  });

  autoConvertToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoConvertWebp: e.target.checked });
  });

  openDashboardBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('dashboard/dashboard.html'));
    }
  });
}
