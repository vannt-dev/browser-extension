/**
 * Blob/File reading helpers.
 *
 * These live outside doc-engine.js so that callers who only need to read a text
 * file (the JSON/CSV/XML/YAML route, for instance) do not drag mammoth, jsPDF
 * and html2canvas into their bundle.
 */

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file buffer.'));
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file);
  });
}
