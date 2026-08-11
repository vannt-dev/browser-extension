import { ImageEngine } from '../engine/image-engine.js';
import { DataEngine } from '../engine/data-engine.js';
import { DocEngine } from '../engine/doc-engine.js';
import { ZipEngine } from '../engine/zip-engine.js';

// Tabs Navigation
document.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));

    e.target.classList.add('active');
    const tabId = `tab-${e.target.dataset.tab}`;
    document.getElementById(tabId)?.classList.add('active');
  });
});

// JSON to TypeScript/Go Code Generator Live Binding
const jsonInput = document.getElementById('json-input');
const codeOutput = document.getElementById('code-output');
const devLangSelect = document.getElementById('dev-lang-select');
const copyCodeBtn = document.getElementById('copy-code-btn');

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
devLangSelect.addEventListener('change', updateGeneratedCode);

copyCodeBtn.addEventListener('click', () => {
  if (codeOutput.value) {
    navigator.clipboard.writeText(codeOutput.value);
    copyCodeBtn.textContent = '✅ Đã sao chép!';
    setTimeout(() => {
      copyCodeBtn.textContent = '📋 Sao chép Code';
    }, 2000);
  }
});

// Settings Binding
const autoConvertToggle = document.getElementById('dash-auto-convert-toggle');
if (chrome.storage?.local) {
  chrome.storage.local.get(['autoConvertWebp'], (res) => {
    if (res.autoConvertWebp) autoConvertToggle.checked = true;
  });

  autoConvertToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoConvertWebp: e.target.checked });
  });
}
