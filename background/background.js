/**
 * Background Service Worker for Chrome Extension Manifest V3
 */
import { loadLanguage, t } from '../shared/i18n.js';

const MENU_FORMATS = {
  'convert-to-webp': 'webp',
  'convert-to-png': 'png',
  'convert-to-jpg': 'jpeg'
};
const ALL_SITES = { origins: ['<all_urls>'] };
// How long after the popup asked for access a grant still counts as the answer to it.
const PENDING_WINDOW_MS = 2 * 60 * 1000;

const MENU_ENTRIES = [
  { id: 'convert-to-webp', title: 'menuConvertWebp', contexts: ['image'] },
  { id: 'convert-to-png', title: 'menuConvertPng', contexts: ['image'] },
  { id: 'convert-to-jpg', title: 'menuConvertJpg', contexts: ['image'] },
  { id: 'open-dashboard', title: 'menuOpenDashboard', contexts: ['all'] }
];

async function createMenus() {
  await loadLanguage();
  await chrome.contextMenus.removeAll();
  for (const { id, title, contexts } of MENU_ENTRIES) {
    chrome.contextMenus.create({ id, title: t(title), contexts });
  }
}

// The menu is rebuilt one request at a time: two overlapping rebuilds would create every entry twice.
let menus = Promise.resolve();
const refreshMenus = () => (menus = menus.then(createMenus, createMenus));

// Context menus are written on install, and written again whenever their language may have
// changed: the browser's own (seen at startup) or the one chosen in the dashboard.
chrome.runtime.onInstalled.addListener(refreshMenus);
chrome.runtime.onStartup.addListener(refreshMenus);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.uiLanguage) refreshMenus();
});

/** The site an image is served from, as a permission pattern; null for data:, blob: and file: addresses. */
function sitePattern(url) {
  try {
    const { protocol, host } = new URL(url);
    return protocol === 'http:' || protocol === 'https:' ? `${protocol}//${host}/*` : null;
  } catch {
    return null;
  }
}

/** A file name without its extension, stripped of what a download's name may not contain. */
function stem(name) {
  const cleaned = (name || '')
    .replace(/\.[^.]*$/, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 120);
  return cleaned || null;
}

/** The name an image has in its address: https://host/a/photo.webp?w=2 gives "photo". */
function imageName(url) {
  try {
    const { protocol, pathname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return stem(decodeURIComponent(pathname.split('/').pop()));
  } catch {
    return null;
  }
}

/**
 * Reading an image from another site needs that site's permission unless the site allows every
 * reader. A service worker may only ask during the click itself, so this runs before anything is
 * awaited; when the access is already there the browser answers without showing anything.
 */
function askForSite(srcUrl, pageUrl) {
  const pattern = sitePattern(srcUrl);
  // The click already lets the extension read from the page's own site (activeTab).
  if (!pattern || pattern === sitePattern(pageUrl)) return Promise.resolve(false);
  return chrome.permissions.request({ origins: [pattern] }).catch(() => false);
}

async function convertImage(url, targetFormat, quality) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const imageBitmap = await createImageBitmap(await response.blob());

  // Render on Offscreen Canvas
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, imageBitmap.width, imageBitmap.height);
  }
  ctx.drawImage(imageBitmap, 0, 0);

  return canvas.convertToBlob({ type: `image/${targetFormat}`, quality });
}

/** Chrome downloads take an address, not a Blob, and a worker has no object URLs: a data URL it is. */
function saveImage(blob, filename) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(chrome.downloads.download({ url: reader.result, filename, saveAs: false, conflictAction: 'uniquify' }));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * A conversion that fails has no window to say so in. The toolbar icon gets a mark and the reason
 * is kept for the popup, which shows it the next time it opens.
 */
async function reportFailure(url, err) {
  const pattern = sitePattern(url);
  const allowed = pattern ? await chrome.permissions.contains({ origins: [pattern] }).catch(() => false) : true;
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    // An address that does not parse has no host to name.
  }
  // fetch() rejects with a TypeError when the site refuses the extension; anything else is the image itself.
  const kind = err instanceof TypeError && !allowed ? 'access' : 'failed';
  await chrome.storage.local.set({ lastFailure: { kind, host, at: Date.now() } });
  await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  await chrome.action.setBadgeText({ text: '!' });
}

async function clearFailure() {
  await chrome.storage.local.remove('lastFailure');
  await chrome.action.setBadgeText({ text: '' });
}

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'open-dashboard') {
    chrome.runtime.openOptionsPage();
    return;
  }

  const targetFormat = MENU_FORMATS[info.menuItemId];
  if (!targetFormat || !info.srcUrl) return;

  const asked = askForSite(info.srcUrl, info.pageUrl);
  return convertFromMenu(info.srcUrl, targetFormat, asked);
});

async function convertFromMenu(srcUrl, targetFormat, asked) {
  // Whatever the answer, the image is tried: plenty of sites let anyone read their images.
  await asked;
  try {
    const blob = await convertImage(srcUrl, targetFormat, 0.92);
    const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    await saveImage(blob, `${imageName(srcUrl) ?? `converted_image_${Date.now()}`}.${extension}`);
    await clearFailure();
  } catch (err) {
    console.error('Failed to convert image via context menu:', err);
    await reportFailure(srcUrl, err);
  }
}

/**
 * Chrome has not chosen the file's name yet when onCreated fires, so it is read again once the
 * converted picture is ready; the name in the address is the fallback.
 */
async function downloadName(downloadItem, url) {
  const [current] = await chrome.downloads.search({ id: downloadItem.id }).catch(() => []);
  const saved = (current?.filename || downloadItem.filename || '').split(/[\\/]/).pop();
  return stem(saved) ?? imageName(url) ?? `auto_converted_${Date.now()}`;
}

// Auto-Convert Chrome Downloads Interceptor (.webp / .jfif -> .png). The download itself is left
// alone: the converted picture is saved beside it.
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  // The converted picture is a download too, and must not come back in here.
  if (downloadItem.byExtensionId === chrome.runtime.id) return;

  const { autoConvertWebp = false, targetAutoFormat = 'png' } = await chrome.storage.local.get(['autoConvertWebp', 'targetAutoFormat']);

  if (!autoConvertWebp) return;

  const url = downloadItem.finalUrl || downloadItem.url;
  const isWebpOrJfif = /\.(webp|jfif)(\?.*)?$/i.test(url) || downloadItem.mime === 'image/webp';

  if (isWebpOrJfif) {
    // The dashboard offers PNG and JPG; anything else that may be stored is taken as PNG.
    const extension = targetAutoFormat === 'jpg' || targetAutoFormat === 'jpeg' ? 'jpg' : 'png';
    try {
      const blob = await convertImage(url, extension === 'jpg' ? 'jpeg' : 'png', 0.95);
      await saveImage(blob, `${await downloadName(downloadItem, url)}.${extension}`);
      await clearFailure();
    } catch (err) {
      console.warn('Auto-convert download skipped:', err);
      await reportFailure(url, err);
    }
  }
});

// Auto-convert reads images from whatever site a download comes from, so it is only on while the
// extension may read every site. The popup that asks for that access is closed by the browser's own
// prompt before the answer arrives: it leaves the time it asked, and the setting is switched on here.
chrome.permissions.onAdded.addListener(async () => {
  const { autoConvertPending = 0 } = await chrome.storage.local.get('autoConvertPending');
  if (!autoConvertPending || Date.now() - autoConvertPending > PENDING_WINDOW_MS) return;
  if (await chrome.permissions.contains(ALL_SITES)) {
    await chrome.storage.local.set({ autoConvertWebp: true, autoConvertPending: 0 });
  }
});

chrome.permissions.onRemoved.addListener(async () => {
  if (!(await chrome.permissions.contains(ALL_SITES))) {
    await chrome.storage.local.set({ autoConvertWebp: false });
  }
});
