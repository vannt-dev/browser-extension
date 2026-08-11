/**
 * Background Service Worker for Chrome Extension Manifest V3
 */

// Initialize Context Menus on Extension Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'convert-to-webp',
    title: '⚡ Chuyển sang WebP',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'convert-to-png',
    title: '⚡ Chuyển sang PNG',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'convert-to-jpg',
    title: '⚡ Chuyển sang JPG',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'open-dashboard',
    title: '🚀 Mở Full File Converter Dashboard',
    contexts: ['all']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-dashboard') {
    chrome.runtime.openOptionsPage();
    return;
  }

  if (info.srcUrl) {
    let targetFormat = 'png';
    if (info.menuItemId === 'convert-to-webp') targetFormat = 'webp';
    if (info.menuItemId === 'convert-to-jpg') targetFormat = 'jpeg';

    try {
      // Fetch image data
      const response = await fetch(info.srcUrl);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      // Render on Offscreen Canvas
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d');
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, imageBitmap.width, imageBitmap.height);
      }
      ctx.drawImage(imageBitmap, 0, 0);

      const mimeType = `image/${targetFormat}`;
      const convertedBlob = await canvas.convertToBlob({ type: mimeType, quality: 0.92 });

      // Convert Blob to Data URL for Chrome Download
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const filename = `converted_image_${Date.now()}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;
        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: false
        });
      };
      reader.readAsDataURL(convertedBlob);
    } catch (err) {
      console.error('Failed to convert image via context menu:', err);
    }
  }
});

// Auto-Convert Chrome Downloads Interceptor (.webp / .jfif -> .png)
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  const { autoConvertWebp = false, targetAutoFormat = 'png' } = await chrome.storage.local.get(['autoConvertWebp', 'targetAutoFormat']);
  
  if (!autoConvertWebp) return;

  const url = downloadItem.finalUrl || downloadItem.url;
  const isWebpOrJfif = url.match(/\.(webp|jfif)(\?.*)?$/i) || downloadItem.mime === 'image/webp';

  if (isWebpOrJfif) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d');
      if (targetAutoFormat === 'jpg' || targetAutoFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, imageBitmap.width, imageBitmap.height);
      }
      ctx.drawImage(imageBitmap, 0, 0);

      const mimeType = `image/${targetAutoFormat === 'jpg' ? 'jpeg' : targetAutoFormat}`;
      const convertedBlob = await canvas.convertToBlob({ type: mimeType, quality: 0.95 });

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const newFilename = downloadItem.filename.replace(/\.(webp|jfif)$/i, `.${targetAutoFormat}`);
        chrome.downloads.download({
          url: dataUrl,
          filename: newFilename || `auto_converted_${Date.now()}.${targetAutoFormat}`,
          saveAs: false
        });
      };
      reader.readAsDataURL(convertedBlob);
    } catch (err) {
      console.warn('Auto-convert download skipped:', err);
    }
  }
});
