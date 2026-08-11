import { describe, it, expect } from 'vitest';
import { DataEngine } from '../engine/data-engine.js';

describe('DataEngine Unit Tests', () => {
  it('should parse JSON and convert to CSV correctly', () => {
    const jsonStr = JSON.stringify([
      { name: 'Alice', age: 30, role: 'Developer' },
      { name: 'Bob', age: 25, role: 'Designer' }
    ]);
    const parsed = DataEngine.parse(jsonStr, 'json');
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Alice');

    const csvOutput = DataEngine.convert(parsed, 'csv');
    expect(csvOutput).toContain('name,age,role');
    expect(csvOutput).toContain('Alice,30,Developer');
  });

  it('should parse CSV and convert to JSON correctly', () => {
    const csvStr = 'id,product,price\n1,Laptop,1200\n2,Phone,800';
    const parsed = DataEngine.parse(csvStr, 'csv');
    expect(parsed).toHaveLength(2);
    expect(parsed[0].product).toBe('Laptop');

    const jsonOutput = DataEngine.convert(parsed, 'json');
    expect(jsonOutput).toContain('"product": "Laptop"');
  });

  it('should parse YAML and convert to JSON', () => {
    const yamlStr = `
app: Converter
version: 1.0.0
features:
  - images
  - pdf
    `;
    const parsed = DataEngine.parse(yamlStr, 'yaml');
    expect(parsed.app).toBe('Converter');
    expect(parsed.features).toContain('pdf');

    const jsonOutput = DataEngine.convert(parsed, 'json');
    expect(jsonOutput).toContain('"app": "Converter"');
  });

  it('should generate TypeScript interface from JSON', () => {
    const sampleObj = {
      userId: 101,
      username: 'vannt',
      isAdmin: true,
      settings: {
        theme: 'dark'
      }
    };
    const tsCode = DataEngine.generateTypeScript(sampleObj, 'UserConfig');
    expect(tsCode).toContain('export interface UserConfig');
    expect(tsCode).toContain('userId: number;');
    expect(tsCode).toContain('username: string;');
    expect(tsCode).toContain('isAdmin: boolean;');
  });

  it('should generate Go struct from JSON', () => {
    const sampleObj = {
      serverPort: 8080,
      enabled: true,
      name: 'file-converter'
    };
    const goCode = DataEngine.generateGoStruct(sampleObj, 'ServerSettings');
    expect(goCode).toContain('type ServerSettings struct');
    expect(goCode).toContain('ServerPort int `json:"serverPort"`');
    expect(goCode).toContain('Enabled bool `json:"enabled"`');
  });
});
