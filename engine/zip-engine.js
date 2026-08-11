import JSZip from '../lib/jszip.js';

/**
 * Universal Archive Engine (JSZip Batch Compression)
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
   * Helper to trigger direct browser file download
   */
  static downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
