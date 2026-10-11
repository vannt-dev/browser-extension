import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import en from '../_locales/en/messages.json';
import vi from '../_locales/vi/messages.json';
import { applyI18n, browserLanguage, currentLanguage, setLanguage, t } from '../shared/i18n.js';

// Paths are from the repository root, where the tests are run from. (jsdom replaces the global URL,
// so a file URL built here is not one that node:fs accepts.)
const read = (file) => readFileSync(file, 'utf8');

const PAGES = ['popup/popup.html', 'dashboard/dashboard.html'];
const SCRIPTS = ['popup/popup.js', 'dashboard/dashboard.js', 'background/background.js', 'engine/ai-engine.js'];

/** Every key a page asks for through a data-i18n attribute. */
const keysInPage = (html) => [...html.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)].map((match) => match[1]);

/** Every key a script asks for: t('key', ...), and the menu table of the service worker. */
const keysInScript = (source) => [
  ...[...source.matchAll(/\bt\(\s*'([A-Za-z0-9_]+)'/g)].map((match) => match[1]),
  ...[...source.matchAll(/\bt\([^()']*\?\s*'([A-Za-z0-9_]+)'\s*:\s*'([A-Za-z0-9_]+)'/g)].flatMap((match) => [match[1], match[2]]),
  ...[...source.matchAll(/title: '(menu[A-Za-z0-9_]+)'/g)].map((match) => match[1])
];

afterEach(() => {
  delete globalThis.chrome;
  setLanguage('en');
});

describe('the two catalogs', () => {
  it('hold the same messages', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });

  it('use the same placeholders in each message', () => {
    const names = (entry) => [...entry.message.matchAll(/\$([A-Z_]+)\$/g)].map((match) => match[1]).sort();
    for (const key of Object.keys(en)) {
      expect(names(vi[key]), key).toEqual(names(en[key]));
      expect(Object.keys(vi[key].placeholders ?? {}), key).toEqual(Object.keys(en[key].placeholders ?? {}));
      // A placeholder the message uses has to be declared, or chrome leaves it empty.
      for (const name of names(en[key])) expect(en[key].placeholders, key).toHaveProperty(name.toLowerCase());
    }
  });

  it('keep the description within what the Chrome Web Store takes', () => {
    expect([...en.extDescription.message].length).toBeLessThanOrEqual(132);
    expect([...vi.extDescription.message].length).toBeLessThanOrEqual(132);
  });

  it('are what the manifest points at', () => {
    const manifest = JSON.parse(read('manifest.json'));
    expect(manifest.default_locale).toBe('en');
    expect(manifest.description).toBe('__MSG_extDescription__');
  });
});

describe('every message that is asked for exists, and every message is asked for', () => {
  const asked = new Set(['extDescription']);
  for (const page of PAGES) keysInPage(read(page)).forEach((key) => asked.add(key));
  for (const script of SCRIPTS) keysInScript(read(script)).forEach((key) => asked.add(key));

  it('finds a fair number of keys, so the scan itself is not broken', () => {
    expect(asked.size).toBeGreaterThan(100);
  });

  it('has a message for every key in the pages and scripts', () => {
    expect([...asked].filter((key) => !en[key])).toEqual([]);
  });

  it('has no message that nothing uses', () => {
    expect(Object.keys(en).filter((key) => !asked.has(key))).toEqual([]);
  });

  it('leaves no Vietnamese written straight into a page or a script', () => {
    // "Tiếng Việt" names the language in its own language, in the language list.
    const leftovers = [...PAGES, ...SCRIPTS].filter((file) => /[À-ỹ]/.test(read(file).replace('Tiếng Việt', '')));
    expect(leftovers).toEqual([]);
  });
});

describe('t()', () => {
  it('fills the placeholders in the order of the arguments', () => {
    setLanguage('en');
    expect(t('ocrLangNotBundled', 'jpn, kor', 'eng, vie')).toBe('OCR language not packaged: jpn, kor. Supported: eng, vie.');
    expect(t('ocrProgress', 40)).toBe('Reading progress: 40%');
  });

  it('answers in the chosen language', () => {
    setLanguage('vi');
    expect(t('statusDone')).toBe('Hoàn thành');
    expect(t('errorWithReason', 'x')).toBe('Lỗi: x');
  });

  it('gives the key back for a message that does not exist', () => {
    expect(t('noSuchMessage')).toBe('noSuchMessage');
  });
});

describe('which language is used', () => {
  it("follows the browser's language when it is one of ours", () => {
    globalThis.chrome = { i18n: { getUILanguage: () => 'vi' } };
    expect(browserLanguage()).toBe('vi');
    expect(setLanguage('auto')).toBe('vi');
    expect(setLanguage(undefined)).toBe('vi');
  });

  it('falls back to English for any other browser language', () => {
    globalThis.chrome = { i18n: { getUILanguage: () => 'fr-CA' } };
    expect(setLanguage('auto')).toBe('en');
  });

  it("lets the user's choice win over the browser's", () => {
    globalThis.chrome = { i18n: { getUILanguage: () => 'vi' } };
    expect(setLanguage('en')).toBe('en');
    expect(currentLanguage()).toBe('en');
  });
});

describe('applyI18n', () => {
  beforeEach(() => {
    document.documentElement.className = 'i18n-pending';
    document.body.innerHTML = `
      <button id="text" data-i18n="clearAll">Clear all</button>
      <button id="title" title="Zoom in" data-i18n-title="zoomIn">+</button>
      <input id="placeholder" placeholder="e.g. 500" data-i18n-placeholder="targetSizePlaceholder">
      <input id="value" value="COPYRIGHT - ALL RIGHTS RESERVED" data-i18n-value="watermarkDefault">`;
  });

  it('writes text, titles and placeholders in the language in use, and shows the page', () => {
    setLanguage('vi');
    applyI18n();

    expect(document.getElementById('text').textContent).toBe('Xóa tất cả');
    expect(document.getElementById('title').title).toBe('Phóng to');
    expect(document.getElementById('title').textContent).toBe('+');
    expect(document.getElementById('placeholder').placeholder).toBe('Ví dụ: 500');
    expect(document.documentElement.lang).toBe('vi');
    expect(document.documentElement.classList.contains('i18n-pending')).toBe(false);
  });

  it('translates a pre-filled field only while the user has not typed their own text', () => {
    const field = document.getElementById('value');
    setLanguage('vi');
    applyI18n();
    expect(field.value).toBe('BẢN QUYỀN THUỘC VỀ TOI');

    field.value = 'My studio';
    setLanguage('en');
    applyI18n();
    expect(field.value).toBe('My studio');
  });
});
