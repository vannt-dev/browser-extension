import JSZip from '../lib/jszip.js';

/**
 * Universal Archive Engine (JSZip Batch Compression & Chrome Extension Downloader)
 */
export class ZipEngine {
  /**
   * Bundles array of converted files into a downloadable ZIP Blob
   * @param {Array<{name: string, blob: Blob}>} files 
   * @param {string} zipFilename 
   */
  static async createZip(files, zipFilename = 'converted_files.zip') {
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file.blob);
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
