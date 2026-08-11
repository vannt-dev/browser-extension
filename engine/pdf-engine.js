import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Universal PDF Engine (Extract PDF Pages as Images, PDF to Text)
 */
export class PdfEngine {
  /**
   * Reads a PDF file and renders all pages as PNG/JPG images
   */
  static async renderPdfToImages(file, options = {}) {
    const { format = 'png', scale = 1.5 } = options;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageImages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, 0.92);

      // Convert dataURL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      pageImages.push({
        pageNumber: i,
        blob,
        dataUrl,
        filename: `${file.name.replace(/\.[^/.]+$/, '')}_page_${i}.${format}`
      });
    }

    return pageImages;
  }

  /**
   * Extract all plain text from a PDF file
   */
  static async extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText.trim();
  }
}
