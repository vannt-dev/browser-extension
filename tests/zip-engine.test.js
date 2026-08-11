import { describe, it, expect } from 'vitest';
import { ZipEngine } from '../engine/zip-engine.js';

describe('ZipEngine Unit Tests', () => {
  it('should bundle multiple files into a single ZIP blob', async () => {
    const file1 = { name: 'hello.txt', blob: new Blob(['Hello World'], { type: 'text/plain' }) };
    const file2 = { name: 'data.json', blob: new Blob(['{"status": "ok"}'], { type: 'application/json' }) };

    const zipRes = await ZipEngine.createZip([file1, file2], 'test_bundle.zip');
    expect(zipRes.filename).toBe('test_bundle.zip');
    expect(zipRes.blob).toBeDefined();
    expect(zipRes.blob.size).toBeGreaterThan(0);
  });
});
