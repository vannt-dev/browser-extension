import { createWorker } from 'tesseract.js';

/**
 * Universal AI Engine (100% Client-Side OCR)
 */
export class AiEngine {
  /**
   * Run OCR on an Image or Canvas to extract text
   */
  static async extractTextFromImage(imageFileOrBlob, lang = 'eng+vie', onProgress = null) {
    const worker = await createWorker(lang, 1, {
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    const ret = await worker.recognize(imageFileOrBlob);
    await worker.terminate();

    return {
      text: ret.data.text,
      confidence: ret.data.confidence,
      hocr: ret.data.hocr
    };
  }
}
