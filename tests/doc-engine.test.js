import { describe, it, expect } from 'vitest';
import { DocEngine } from '../engine/doc-engine.js';

describe('DocEngine Unit Tests', () => {
  it('should convert Markdown to clean HTML', async () => {
    const md = '# Header Title\n\nThis is **bold** text and a [link](https://example.com).';
    const result = await DocEngine.convertMarkdown(md, 'html');
    expect(result.content).toContain('<h1>Header Title</h1>');
    expect(result.content).toContain('<strong>bold</strong>');
    expect(result.content).toContain('<a href="https://example.com">link</a>');
  });

  it('should generate PDF blob from plain text', () => {
    const sampleText = 'Line 1: Hello World\nLine 2: Universal Converter Document Test';
    const blob = DocEngine.textToPdf(sampleText, 'UnitTestDoc');
    expect(blob).toBeDefined();
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(100);
  });
});
