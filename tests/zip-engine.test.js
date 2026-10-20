import { describe, it, expect } from 'vitest';
import JSZip from '../lib/jszip.js';
import { ZipEngine } from '../engine/zip-engine.js';

async function entries(blob) {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const files = Object.values(zip.files).filter((entry) => !entry.dir);
  return Object.fromEntries(await Promise.all(files.map(async (entry) => [entry.name, await entry.async('string')])));
}

describe('ZipEngine.createZip', () => {
  it('should bundle multiple files into a single ZIP blob', async () => {
    const file1 = { name: 'hello.txt', blob: new Blob(['Hello World'], { type: 'text/plain' }) };
    const file2 = { name: 'data.json', blob: new Blob(['{"status": "ok"}'], { type: 'application/json' }) };

    const zipRes = await ZipEngine.createZip([file1, file2], 'test_bundle.zip');
    expect(zipRes.filename).toBe('test_bundle.zip');
    expect(await entries(zipRes.blob)).toEqual({ 'hello.txt': 'Hello World', 'data.json': '{"status": "ok"}' });
  });

  it('names each file after the filename the converters return', async () => {
    // What a batch conversion collects: { blob, filename }, as every engine returns it.
    const results = [
      { filename: 'photo.png', blob: new Blob(['png']) },
      { filename: 'notes.pdf', blob: new Blob(['pdf']) },
    ];

    const zipRes = await ZipEngine.createZip(results);
    expect(await entries(zipRes.blob)).toEqual({ 'photo.png': 'png', 'notes.pdf': 'pdf' });
  });

  it('keeps every file when two have the same name', async () => {
    const results = [
      { filename: 'scan.png', blob: new Blob(['from jpg']) },
      { filename: 'scan.png', blob: new Blob(['from webp']) },
      { filename: 'scan.png', blob: new Blob(['from bmp']) },
      { filename: 'README', blob: new Blob(['a']) },
      { filename: 'README', blob: new Blob(['b']) },
    ];

    expect(await entries((await ZipEngine.createZip(results)).blob)).toEqual({
      'scan.png': 'from jpg',
      'scan (2).png': 'from webp',
      'scan (3).png': 'from bmp',
      README: 'a',
      'README (2)': 'b',
    });
  });
});
