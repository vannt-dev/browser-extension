import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';
import { readFileAsText } from '../engine/file-reader.js';

// Heavy engines are fetched on first use so opening the popup does not have to
// parse the OCR, DOCX and PDF runtimes up front.
const loadAiEngine = () => import('../engine/ai-engine.js').then((m) => m.AiEngine);
const loadDocEngine = () => import('../engine/doc-engine.js').then((m) => m.DocEngine);
const loadPdfEngine = () => import('../engine/pdf-engine.js').then((m) => m.PdfEngine);

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
      switchCategory(e.target.dataset.category);
    });
  });

  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
  });
}

function switchCategory(category) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.dataset.category === category) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  currentCategory = category;
  updateFormatSelect(category);
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
  const val = targetFormatSelect.value;
  targetSizeGroup.style.display = val === 'target-compress' ? 'flex' : 'none';
  qualitySliderGroup.style.display = (val === 'jpg' || val === 'webp' || val === 'png') ? 'flex' : 'none';

  targetFormatSelect.onchange = () => {
    const selected = targetFormatSelect.value;
    targetSizeGroup.style.display = selected === 'target-compress' ? 'flex' : 'none';
    qualitySliderGroup.style.display = (selected === 'jpg' || selected === 'webp' || selected === 'png') ? 'flex' : 'none';
  };
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
    downloadZipBtn.style.display = 'none';
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

// Smart Auto-Category Detection on File Add
function addFilesToQueue(files) {
  files.forEach(f => fileQueue.push(f));

  if (files.length > 0) {
    const ext = files[0].name.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif'].includes(ext)) {
      switchCategory('image');
    } else if (['docx', 'pdf', 'md', 'html', 'txt'].includes(ext)) {
      switchCategory('doc');
    } else if (['json', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) {
      switchCategory('data');
    }
  }

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
  downloadZipBtn.style.display = 'none';

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

// Single File Processor Router with Smart Fallback
async function processSingleFile(file, targetFormat, quality, targetSizeKB) {
  const ext = file.name.split('.').pop().toLowerCase();

  // Image Processing
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif'].includes(ext)) {
    if (targetFormat === 'pdf') {
      const DocEngine = await loadDocEngine();
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
      const AiEngine = await loadAiEngine();
      const ocrRes = await AiEngine.extractTextFromImage(file);
      const blob = new Blob([ocrRes.text], { type: 'text/plain' });
      return { blob, filename: `ocr_${file.name.replace(/\.[^/.]+$/, '')}.txt` };
    }
    
    // Normal Image Format Conversion (Default to PNG if targetFormat not an image)
    const validImageFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico'];
    const finalFormat = validImageFormats.includes(targetFormat) ? targetFormat : 'png';
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

  // Fallback / Text / Markdown
  const rawText = await readFileAsText(file);
  const DocEngine = await loadDocEngine();
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
    if (chrome.storage?.local) {
      chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
    }
  });

  if (chrome.storage?.local) {
    chrome.storage.local.get(['theme', 'autoConvertWebp'], (res) => {
      if (res.theme === 'light') document.body.classList.add('light-theme');
      if (res.autoConvertWebp) autoConvertToggle.checked = true;
    });

    autoConvertToggle.addEventListener('change', (e) => {
      chrome.storage.local.set({ autoConvertWebp: e.target.checked });
    });
  }

  openDashboardBtn.addEventListener('click', () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('dashboard/dashboard.html'));
    }
  });
}
