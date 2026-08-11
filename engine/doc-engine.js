import mammoth from 'mammoth';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';

/**
 * Universal Document Engine (DOCX, Markdown, HTML, TXT, PDF Export)
 */
export class DocEngine {
  /**
   * Reads an ArrayBuffer from a Blob/File
   */
  static readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(new Error('Failed to read file buffer.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Reads plain text from a File
   */
  static readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  /**
   * Convert DOCX file to HTML, Text, or Markdown
   */
  static async convertDocx(file, targetFormat = 'html') {
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    
    // Mammoth DOCX conversion options
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    if (targetFormat === 'html') {
      return {
        content: html,
        mimeType: 'text/html',
        extension: 'html'
      };
    }

    if (targetFormat === 'txt') {
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      return {
        content: rawTextResult.value,
        mimeType: 'text/plain',
        extension: 'txt'
      };
    }

    if (targetFormat === 'md' || targetFormat === 'markdown') {
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      return {
        content: rawTextResult.value, // Simple clean text markdown baseline
        mimeType: 'text/markdown',
        extension: 'md'
      };
    }

    if (targetFormat === 'pdf') {
      const rawText = await mammoth.extractRawText({ arrayBuffer });
      const pdfBlob = this.textToPdf(rawText.value, file.name);
      return {
        blob: pdfBlob,
        mimeType: 'application/pdf',
        extension: 'pdf'
      };
    }

    throw new Error(`Unsupported DOCX output format: ${targetFormat}`);
  }

  /**
   * Convert Markdown to HTML or PDF
   */
  static async convertMarkdown(markdownText, targetFormat = 'html') {
    const html = marked.parse(markdownText);

    if (targetFormat === 'html') {
      return { content: html, extension: 'html' };
    }
    if (targetFormat === 'pdf') {
      const pdfBlob = this.textToPdf(markdownText);
      return { blob: pdfBlob, extension: 'pdf' };
    }
    return { content: html, extension: 'html' };
  }

  /**
   * Generate PDF Blob from plain text or HTML content using jsPDF
   */
  static textToPdf(textContent, title = 'Document') {
    const doc = new jsPDF();
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;
    const maxLineWidth = 180;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(textContent, maxLineWidth);
    let y = 20;

    doc.text(title, margin, 12);
    doc.setLineWidth(0.5);
    doc.line(margin, 14, 195, 14);

    lines.forEach(line => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    return doc.output('blob');
  }

  /**
   * Convert Images / Canvas to PDF Document
   */
  static imageToPdf(imageBlobOrDataUrl, filename = 'Image-Document.pdf') {
    return new Promise((resolve) => {
      const img = new Image();
      const src = typeof imageBlobOrDataUrl === 'string' ? imageBlobOrDataUrl : URL.createObjectURL(imageBlobOrDataUrl);

      img.onload = () => {
        const doc = new jsPDF({
          orientation: img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.naturalWidth, img.naturalHeight]
        });

        doc.addImage(img, 'PNG', 0, 0, img.naturalWidth, img.naturalHeight);
        const pdfBlob = doc.output('blob');
        if (typeof imageBlobOrDataUrl !== 'string') URL.revokeObjectURL(src);
        resolve(pdfBlob);
      };
      img.src = src;
    });
  }
}
