import Papa from 'papaparse';
import YAML from 'yaml';

/**
 * Universal Data & Code Engine (JSON, CSV, XML, YAML, TypeScript, Go Struct)
 */
export class DataEngine {
  /**
   * Parse input content based on source format
   */
  static parse(text, format) {
    const cleanText = text.trim();
    if (format === 'json') {
      return JSON.parse(cleanText);
    }
    if (format === 'csv') {
      const parsed = Papa.parse(cleanText, { header: true, skipEmptyLines: true });
      if (parsed.errors.length && !parsed.data.length) {
        throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
      }
      return parsed.data;
    }
    if (format === 'yaml' || format === 'yml') {
      return YAML.parse(cleanText);
    }
    if (format === 'xml') {
      return this.xmlToJson(cleanText);
    }
    throw new Error(`Unsupported source format: ${format}`);
  }

  /**
   * Convert parsed JS object/array to target format
   */
  static convert(data, targetFormat) {
    if (targetFormat === 'json') {
      return JSON.stringify(data, null, 2);
    }
    if (targetFormat === 'csv') {
      const arrayData = Array.isArray(data) ? data : [data];
      return Papa.unparse(arrayData);
    }
    if (targetFormat === 'yaml' || targetFormat === 'yml') {
      return YAML.stringify(data);
    }
    if (targetFormat === 'xml') {
      return this.jsonToXml(data);
    }
    if (targetFormat === 'ts' || targetFormat === 'typescript') {
      return this.generateTypeScript(data, 'RootObject');
    }
    if (targetFormat === 'go') {
      return this.generateGoStruct(data, 'RootObject');
    }
    throw new Error(`Unsupported target format: ${targetFormat}`);
  }

  /**
   * Lightweight XML ➔ JS Object parser
   */
  static xmlToJson(xmlStr) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length) {
      throw new Error('Invalid XML structure.');
    }
    
    function nodeToObj(node) {
      if (node.nodeType === 3) return node.nodeValue.trim();
      const obj = {};
      if (node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj[`@${attr.name}`] = attr.value;
        }
      }
      if (node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const item = node.childNodes[i];
          const nodeName = item.nodeName;
          if (nodeName === '#text') {
            const val = item.nodeValue.trim();
            if (val) return val;
            continue;
          }
          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = nodeToObj(item);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(nodeToObj(item));
          }
        }
      }
      return obj;
    }

    return nodeToObj(xmlDoc.documentElement);
  }

  /**
   * JS Object ➔ XML String
   */
  static jsonToXml(obj, rootName = 'root') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
    
    function buildXml(data, indent = '  ') {
      let str = '';
      if (typeof data === 'object' && data !== null) {
        for (const [key, val] of Object.entries(data)) {
          if (key.startsWith('@')) continue; // Skip attributes in simple converter
          if (Array.isArray(val)) {
            val.forEach(item => {
              str += `${indent}<${key}>\n${buildXml(item, indent + '  ')}${indent}</${key}>\n`;
            });
          } else if (typeof val === 'object' && val !== null) {
            str += `${indent}<${key}>\n${buildXml(val, indent + '  ')}${indent}</${key}>\n`;
          } else {
            str += `${indent}<${key}>${val}</${key}>\n`;
          }
        }
      } else {
        str += `${indent}${data}\n`;
      }
      return str;
    }

    xml += buildXml(obj);
    xml += `</${rootName}>`;
    return xml;
  }

  /**
   * Developer Tool: Generate TypeScript Interface from JSON
   */
  static generateTypeScript(obj, interfaceName = 'RootInterface') {
    let interfaces = '';
    const generated = new Set();

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getType(value, keyName) {
      if (value === null) return 'any';
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        const elemType = getType(value[0], keyName);
        return `${elemType}[]`;
      }
      if (typeof value === 'object') {
        const nestedName = capitalize(keyName);
        buildInterface(value, nestedName);
        return nestedName;
      }
      return typeof value;
    }

    function buildInterface(data, name) {
      if (generated.has(name)) return;
      generated.add(name);

      let fields = '';
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        for (const [key, val] of Object.entries(data)) {
          const typeStr = getType(val, key);
          fields += `  ${key}: ${typeStr};\n`;
        }
      }
      interfaces += `export interface ${name} {\n${fields}}\n\n`;
    }

    const rootData = Array.isArray(obj) ? obj[0] : obj;
    buildInterface(rootData, interfaceName);
    return interfaces.trim();
  }

  /**
   * Developer Tool: Generate Go Struct from JSON
   */
  static generateGoStruct(obj, structName = 'RootStruct') {
    let structs = '';
    const generated = new Set();

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getGoType(value, keyName) {
      if (value === null) return 'interface{}';
      if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'float64';
      }
      if (typeof value === 'boolean') return 'bool';
      if (typeof value === 'string') return 'string';
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]interface{}';
        const elemType = getGoType(value[0], keyName);
        return `[]${elemType}`;
      }
      if (typeof value === 'object') {
        const nestedName = capitalize(keyName);
        buildStruct(value, nestedName);
        return nestedName;
      }
      return 'interface{}';
    }

    function buildStruct(data, name) {
      if (generated.has(name)) return;
      generated.add(name);

      let fields = '';
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        for (const [key, val] of Object.entries(data)) {
          const fieldName = capitalize(key);
          const goType = getGoType(val, key);
          fields += `\t${fieldName} ${goType} \`json:"${key}"\`\n`;
        }
      }
      structs += `type ${name} struct {\n${fields}}\n\n`;
    }

    const rootData = Array.isArray(obj) ? obj[0] : obj;
    buildStruct(rootData, structName);
    return structs.trim();
  }
}
