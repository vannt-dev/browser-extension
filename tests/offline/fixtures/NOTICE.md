# Test files from pdf.js

The PDF files in this folder are copied unchanged from the test suite of
[pdf.js](https://github.com/mozilla/pdf.js) (folder `test/pdfs/`, checked against commit
`3b2422eb363d4e7fcfb733f851bb3d7d4e57837b`). pdf.js is licensed under the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); Copyright Mozilla Foundation
and the pdf.js contributors. They are used only by the offline browser test kit
(`tests/offline/run.mjs`) and are not part of the extension package.

| File | What it exercises |
| --- | --- |
| `ccitt_EndOfBlock_false.pdf` | CCITT fax image (`/CCITTFaxDecode`) |
| `jbig2_symbol_offset.pdf` | JBIG2 image (`/JBIG2Decode`) |
| `jbig2_file_header.pdf` | JBIG2 image with a file header |
| `bug_jpx.pdf` | JPEG 2000 image (`/JPXDecode`) |
| `jpx_numcomps.pdf` | JPEG 2000 image, unusual component count |

Everything else the kit uses (a text PDF with embedded fonts, a CCITT group 4 scan, pictures, a
Word file) is made while it runs, see `tests/offline/fixtures.mjs`.
