import fs from 'fs';
import path from 'path';

/**
 * Manifest V3 forbids remotely hosted code, and the Chrome Web Store checks that by reading the
 * package, not by running it: the address of a script on another host is a violation wherever it
 * stands, also in a branch of a library the extension never reaches. Two libraries carry such
 * addresses:
 *
 *  - jsPDF, for output('pdfobjectnewwindow'), which writes a <script> tag for PDFObject on cdnjs
 *    into a new window. Only output('blob') is used here.
 *  - tesseract.js, whose worker, core and language paths default to jsDelivr. AiEngine passes all
 *    three, and they point at files of the package.
 *
 * stripRemoteCode takes them out while the package is built. findRemoteCode is what the build
 * then runs over dist/: it stops the build on any script address, from these libraries or from a
 * new one, so that it is found here and not in a review.
 */

// Hosts that exist to serve scripts: an address on one of them counts whatever its ending.
const SCRIPT_CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'fastly.jsdelivr.net',
  'unpkg.com',
  'esm.sh',
  'cdn.skypack.dev',
  'ajax.googleapis.com',
  'code.jquery.com'
];

const HOSTS = SCRIPT_CDN_HOSTS.map((host) => host.replaceAll('.', '\\.')).join('|');

// What an address is made of inside source text: it ends at a quote, at white space, and at the
// `$` of a template literal, where the rest is put together when the code runs.
const URL_CHAR = '[^\\s"\'`<>\\\\$)]';

const CDN_ADDRESS = `(?:https?:)?//(?:${HOSTS})(?![\\w.-])${URL_CHAR}*`;

const REMOTE_CODE = new RegExp(
  [
    CDN_ADDRESS,
    // A script file on any host, with or without a query.
    `https?://${URL_CHAR}+?\\.m?js(?:[?#]${URL_CHAR}*)?(?![\\w./-])`,
    // The same without a scheme, which only an address between quotes can be.
    `(?<=["'\`])//[a-z0-9.-]+\\.[a-z]{2,}/${URL_CHAR}*?\\.m?js(?:[?#]${URL_CHAR}*)?(?![\\w./-])`,
    // A script tag that names another host.
    `<script\\b[^>]*?\\ssrc\\s*=\\s*["']?(?:https?:)?//${URL_CHAR}*`,
    // A script tag whose address is put together when the code runs.
    `<script\\b[^>]*?\\ssrc\\s*=\\s*\\\\?["']?["'\`]\\s*\\+`
  ].join('|'),
  'gi'
);

// jsPDF's case, from its label to the label of the case after it.
const JSPDF_PDFOBJECT_CASE = /case\s*"pdfobjectnewwindow"\s*:[\s\S]*?(?=case\s*"pdfjsnewwindow"\s*:)/;

const JSPDF_PDFOBJECT_REFUSAL =
  'case "pdfobjectnewwindow": throw new Error("The option pdfobjectnewwindow is not part of this build.");\n';

/**
 * Every address of remotely hosted code in a piece of source text, in the order met.
 */
export function findRemoteCode(code) {
  return code.match(REMOTE_CODE) ?? [];
}

/**
 * The files of a built package that still name remotely hosted code, each with what was found.
 */
export function findRemoteCodeInDir(dir) {
  const offenders = [];
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(m?js|html|css|json)$/.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    const found = findRemoteCode(fs.readFileSync(file, 'utf-8'));
    if (found.length) offenders.push({ file: path.relative(dir, file).split(path.sep).join('/'), found });
  }
  return offenders;
}

/**
 * The same source text without those addresses. The code that read a default from one of them is
 * left with a path that does not exist, so a missing option fails instead of reaching for a CDN.
 */
export function stripRemoteCode(code) {
  return code
    .replace(JSPDF_PDFOBJECT_CASE, JSPDF_PDFOBJECT_REFUSAL)
    .replace(new RegExp(CDN_ADDRESS, 'gi'), '');
}
