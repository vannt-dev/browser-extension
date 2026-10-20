/*! SPDX-License-Identifier: MIT | Copyright (c) 2026 Van Nguyen | github.com/vannt-dev/browser-extension */
import JSZip from '../lib/jszip.js';

/**
 * The name itself the first time, then `name (2).ext`, `name (3).ext`, ...: a batch can turn
 * photo.jpg and photo.webp into two photo.png, and a ZIP keeps only one file per name.
 */
function uniqueName(name, taken) {
  const dot = name.lastIndexOf('.');
  const [stem, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
  let candidate = name;
  for (let n = 2; taken.has(candidate.toLowerCase()); n++) candidate = `${stem} (${n})${ext}`;
  taken.add(candidate.toLowerCase());
  return candidate;
}

/**
 * Universal Archive Engine (JSZip Batch Compression & Chrome Extension Downloader)
 */
export class ZipEngine {
  /**
   * Bundles array of converted files into a downloadable ZIP Blob
   * @param {Array<{filename?: string, name?: string, blob: Blob}>} files The converters' results,
   *   named by `filename`, or files named by `name`
   * @param {string} zipFilename 
   */
  static async createZip(files, zipFilename = 'converted_files.zip') {
    const zip = new JSZip();
    const taken = new Set();

    files.forEach((file, index) => {
      zip.file(uniqueName(file.filename || file.name || `file_${index + 1}`, taken), file.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return {
      blob: zipBlob,
      filename: zipFilename
    };
  }

  /**
   * Universal downloader (Chrome Extension API + Fallback Web Anchor)
   */
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);

    if (typeof chrome !== 'undefined' && chrome.downloads && chrome.downloads.download) {
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      });
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }
}
