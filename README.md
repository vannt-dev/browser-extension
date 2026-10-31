# ⚡ Universal File Converter (Chrome Extension Manifest V3)

Extension chuyển đổi file đa năng **100% Client-Side (Privacy-First)** dành cho Chrome, Edge & các trình duyệt Chromium.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Offline-success)
[![Official vannt-dev build](https://vannt-dev.github.io/badges/official.svg)](https://vannt-dev.github.io/official.html)

🛒 **Chrome Web Store**: [Universal File Converter](https://chromewebstore.google.com/detail/universal-file-converter/bekbobpfdajniiiiadbpiedlbhccidnp) · 🔒 [Chính sách riêng tư](PRIVACY.md)

---

Các bản build chính thức được liệt kê tại [vannt-dev.github.io/official.html](https://vannt-dev.github.io/official.html);
bản nào không có ở đó thì không phải do vannt-dev phát hành.

## 🌟 Tính Năng Nổi Bật

1. **📷 Chuyển Đổi Hình Ảnh**:
   - Hỗ trợ `PNG`, `JPG`, `WebP`, `SVG`, `BMP`, `ICO`.
   - Đọc được thêm `GIF`, `AVIF` và `HEIC/HEIF` (ảnh iPhone) làm ảnh đầu vào. AVIF do trình duyệt tự giải mã; HEIC được giải mã ngay trong extension bằng libheif (gói `heic-to`, khoảng 3 MB, chỉ nạp khi gặp file HEIC) và nhận diện theo nội dung file, nên ảnh HEIC bị đổi đuôi vẫn đọc được. HEIC cũng dùng được cho OCR và Ảnh ➔ PDF. Chưa xuất ra AVIF/HEIC: canvas của Chrome không mã hóa được hai định dạng này.
   - `BMP` xuất bằng encoder riêng (BITMAPV4HEADER 32-bit, giữ nguyên kênh alpha) và `ICO` xuất đa độ phân giải (16→256px), vì canvas của trình duyệt không mã hóa được 2 định dạng này.
   - Tùy chỉnh slider chất lượng nén, thay đổi kích thước (Resize), nén theo dung lượng mục tiêu (**Target Size KB/MB**).
   - Tự động xóa thông tin vị trí Exif GPS nhạy cảm khỏi ảnh.
   - **Cắt & lật ảnh** (tab *Crop & Flip Images* trong Dashboard): kéo chuột trên ảnh để khoanh phần muốn giữ, hoặc nhập X, Y, chiều rộng, chiều cao (pixel); lật trái ↔ phải và/hoặc trên ↔ dưới. Ảnh `PNG`, `JPG`, `WebP`, `BMP` giữ nguyên định dạng (JPG có nền trắng chỗ trong suốt), ảnh khác (`GIF`, `HEIC`, `AVIF`…) lưu thành `PNG`; file lưu thành `<tên>_edited.<đuôi>`.

2. **📄 Tài Liệu & PDF**:
   - `DOCX ➔ HTML / PDF / TXT / Markdown`.
   - `PDF ➔ PNG Images (Từng trang)` hoặc trích xuất văn bản `TXT`.
   - `Markdown / TXT / HTML ➔ PDF`.
   - **Gộp PDF**: chọn nhiều file PDF rồi chọn định dạng đích "Gộp các file PDF thành một" — các file được nối theo thứ tự trong danh sách chờ, file không phải PDF bị bỏ qua.
   - **Tách PDF**: mỗi trang một file, hoặc (trong Dashboard) theo khoảng trang như `1-3, 5, 8-` — mỗi khoảng một file, nhiều file thì đóng gói ZIP. Gộp và tách sao chép nguyên trang (bằng bản `pdf-lib` còn được duy trì, `@cantoo/pdf-lib`), không render lại: chữ vẫn là chữ, không giảm chất lượng.
   - **PDF có mật khẩu**: trong Dashboard, nhập mật khẩu vào ô *Mật khẩu PDF* (hiện ra khi hàng đợi có PDF); mọi việc với PDF (gộp, tách, xoay, xoá, sắp trang, sang ảnh, OCR) đều mở được, và file làm ra không còn mật khẩu. PDF chỉ cấm in/chép mở được mà không cần mật khẩu. Popup không có ô mật khẩu: nó báo mở file trong Dashboard.
   - **Xoay, xóa, sắp xếp lại trang PDF** (trong Dashboard): xoay 90°/180°/270° mọi trang hoặc các trang chọn như `1-3, 5`; xóa các trang chọn; đặt thứ tự trang mới như `3, 1-2` (trang không ghi giữ thứ tự cũ, xếp phía sau). Cửa sổ extension có sẵn lệnh xoay mọi trang. Cũng không render lại trang.
   - **Đánh số trang PDF** (trong Dashboard): số ở trên hoặc dưới, trái, giữa hoặc phải, kiểu `3` hay `3 / 12`; chọn số của trang đầu (0 để trang bìa không có số) và các trang cần đánh như `2-`. Số nằm đúng chỗ và đứng thẳng cả trên trang đã xoay. Phần còn lại của trang giữ nguyên.
   - **Đóng dấu PDF** (trong Dashboard): chữ như `APPROVED`, `CONFIDENTIAL`, `COPY` hay chữ tự gõ, thêm ngày hôm nay nếu muốn, và/hoặc một ảnh PNG/JPG (chữ ký, logo); đặt ở giữa, ở góc, giữa cạnh trên/dưới hoặc vị trí tự chọn theo %; chỉnh độ rộng (theo % bề ngang trang), độ đậm, độ nghiêng và màu chữ; chọn trang `all`, `first`, `last` hoặc như `1-3, 5`. Dấu nằm đúng chỗ cả trên trang đã xoay hoặc đã cắt lề. Chữ dùng font có sẵn trong mọi PDF (Helvetica Bold) nên chỉ vẽ được chữ Latin: phần lớn chữ có dấu tiếng Việt (ă, đ, ơ, ư, ệ...) bị từ chối kèm thông báo nêu rõ ký tự nào, không vẽ ra chữ lỗi — muốn dấu tiếng Việt thì đóng dấu bằng ảnh.

3. **📊 Dữ Liệu Cấu Trúc**:
   - `JSON ↔ CSV ↔ XML ↔ YAML`.
   - **Bảng tính** `XLSX / XLS / ODS ➔ CSV / JSON / XML / YAML`, và `CSV / JSON / XML / YAML ➔ XLSX / ODS`; đổi qua lại giữa XLSX, XLS và ODS. File nhiều sheet ra mỗi sheet một CSV (đóng gói ZIP), hoặc một JSON dạng `{ "tên sheet": [các dòng] }` — JSON dạng này chuyển ngược lại thành đủ các sheet. Dùng SheetJS Community Edition (Apache-2.0) đóng gói sẵn, khoảng 480 KB, chỉ nạp khi gặp bảng tính.

4. **🤖 Xử Lý Ảnh Nâng Cao & Bảo Mật Offline**:
   - **Offline OCR**: Đọc trích xuất chữ từ ảnh/PDF scan (Tiếng Việt & Anh) bằng `Tesseract.js`. Toàn bộ WASM core và traineddata được đóng gói sẵn trong extension — không tải gì từ CDN.
   - **PDF tìm kiếm được (OCR)**: biến PDF scan hoặc ảnh thành PDF giữ nguyên hình trang, có lớp chữ vô hình đặt đúng chỗ các từ nhận dạng được, nên bôi đen, sao chép và tìm (`Ctrl+F`) được, kể cả tiếng Việt có dấu. Trang PDF giữ kích thước gốc. Có trong Dashboard (thẻ OCR và Batch File Converter) và cửa sổ extension. Lớp chữ do bộ PDF của Tesseract (đã có trong gói) tạo, không cần thêm font hay tải gì về.
   - **Xóa nền đơn sắc**: Dò màu nền từ viền ảnh, loang vùng đồng màu và làm mượt biên alpha, xuất PNG trong suốt. Đây là thuật toán so màu xác định (không phải mô hình AI): hiệu quả với ảnh chụp trên nền một màu, không tách sạch được ảnh nền phức tạp.
   - **Watermarking**: Bật trong tab *Watermark & Security* để đóng dấu một dòng chữ bản quyền (góc dưới bên phải) lên các ảnh chuyển đổi bằng Batch File Converter. Mặc định tắt.

5. **⚡ Tiện Ích Trải Nghiệm (UX Super-pack)**:
   - **Auto-Convert Chrome Downloads** (tùy chọn, mặc định tắt): khi bạn tải một ảnh `.webp / .jfif` trên Web, extension lưu thêm một bản `.png` hoặc `.jpg` (chọn trong Settings) cùng tên bên cạnh file gốc. Khi bật, trình duyệt hỏi quyền đọc mọi trang, vì ảnh có thể đến từ bất kỳ trang nào.
   - **Context Menu**: Nhấp chuột phải vào ảnh bất kỳ trên trang web ➔ Chuyển đổi nhanh sang WebP, PNG hoặc JPG; file giữ tên của ảnh. Với ảnh nằm trên một trang khác trang đang mở, trình duyệt hỏi quyền đọc trang đó một lần.
   - Nếu một lần chuyển đổi không thực hiện được, biểu tượng extension hiện dấu `!` và cửa sổ extension cho biết lý do.
   - **Hai ngôn ngữ (English / Tiếng Việt)**: giao diện và menu chuột phải theo ngôn ngữ của trình duyệt, đổi được ngay trong cửa sổ extension hoặc trong Dashboard ➔ Settings. Chuỗi hiển thị nằm trong `_locales/`.
   - **Clipboard (`Ctrl+V`)**: Dán trực tiếp từ bộ nhớ tạm vào Extension để convert ngay.
   - **Chuyển đổi hàng loạt**: Tải toàn bộ sản phẩm đã convert về dưới dạng file `.ZIP`.

---

## 📦 Hướng Dẫn Cài Đặt Vào Trình Duyệt (Chrome / Edge)

1. Tải hoặc Clone repository này về máy.
2. Mở trình duyệt Chrome / Edge và truy cập đường dẫn: `chrome://extensions/`
3. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấn nút **Tải tiện ích đã giải nén (Load unpacked)**.
5. Chọn thư mục `dist` trong thư mục dự án này.
6. Hoàn tất! Biểu tượng **Universal Converter** sẽ xuất hiện trên thanh công cụ của trình duyệt.

---

## 🛠️ Hướng Dẫn Dành Cho Lập Trình Viên (Development & Build)

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Sinh các biểu tượng icon PNG
node scripts/generate-icons.js

# 3. Biên dịch dự án thành thư mục dist chuẩn Manifest V3
npm run build

# 4. Chế độ Watch tự động build khi thay đổi code
npm run dev

# 5. Chạy bộ test đơn vị
npm test
```

> Thư mục `dist/` là sản phẩm build và **không** được commit vào git — hãy chạy `npm run build` sau khi clone.
> Bước build sẽ copy runtime Tesseract (WASM core + traineddata `eng`/`vie`, ~11.8 MB) vào `dist/vendor/tesseract/`.

### 🧪 Bộ test trình duyệt offline (chạy trước mỗi lần upload Store)

`npm test` chỉ chạy unit test trong jsdom. Trước khi upload lên Chrome Web Store, hãy chạy bộ test
offline trên **đúng gói sẽ upload**: nó mở Chromium thật với extension đã build, trong trạng thái
không phân giải được tên miền nào (`--host-resolver-rules=MAP * ~NOTFOUND`), rồi chạy các tính năng
và báo `PASS`/`FAIL` từng mục (mã thoát khác 0 nếu có mục lỗi):

```bash
npm run build
npm run test:offline                     # kiểm tra thư mục dist/
npm run zip
npm run test:offline -- dist/zips/universal-file-converter-v1.2.1.zip   # kiểm tra file ZIP
npm run test:offline -- --only=png,ocr   # chỉ chạy một số nhóm: convert, png, text, password, numbers, stamp, crop, ocr, background
```

- Các mục được kiểm tra: ảnh → PDF và DOCX → PDF (jsPDF, mammoth); PDF → PNG với PDF có font nhúng,
  bản scan CCITT G4, JBIG2, JPEG 2000 (pdf.js + WebAssembly), kiểm tra ảnh xuất ra có nội dung;
  PDF → text trong popup; đánh số trang và đóng dấu PDF (chữ, ngày, ảnh chữ ký, cả trên trang đã xoay),
  đọc lại bằng pdf.js để kiểm tra vị trí, và chữ có dấu tiếng Việt bị từ chối kèm lý do; cắt & lật ảnh PNG/JPG bằng cách kéo chuột và nhập số, kiểm tra kích thước
  và màu từng góc của file lưu ra; OCR ảnh (vie+eng) và OCR bản scan ra PDF tìm kiếm được (tesseract.js);
  OCR và PDF → PNG khi dashboard nằm ở tab nền (Chrome dừng animation frame ở tab nền);
  cuối cùng là **không có request nào ra khỏi gói extension**.
- Trình duyệt: biến môi trường `CHROME=<đường dẫn chrome>`, nếu không có thì tự tìm Chromium của
  Playwright (`npx playwright install chromium`). Google Chrome bản thường từ 137 bỏ qua
  `--load-extension`, nên phải dùng Chromium hoặc Chrome for Testing.
- Trình duyệt chạy có cửa sổ (headless đặt tên file tải về theo GUID); trên Linux không có màn hình
  thì chạy qua `xvfb-run -a npm run test:offline`. Workflow **Offline browser kit** trên GitHub
  Actions (chạy tay) làm đúng việc này với file ZIP build từ nhánh được chọn.
- Bộ test không nằm trong `npm test`. File test lấy từ pdf.js nằm ở `tests/offline/fixtures/`
  (Apache-2.0, xem `NOTICE.md` ở đó); các file còn lại được tạo lúc chạy.

---

## 🔒 Cam Kết Bảo Mật (Privacy Guarantee)
Tất cả các thao tác xử lý dữ liệu và nhận dạng chữ (OCR) đều được thực hiện **100% cục bộ (Local)** trong trình duyệt của bạn. **Không có bất kỳ dữ liệu hay tập tin nào bị tải lên Server bên ngoài**.

---

## 📄 Giấy phép

Mã nguồn của extension phát hành theo giấy phép [MIT](LICENSE).

Gói extension có kèm thư viện giải mã HEIC (`heic-to`, dựa trên libheif) theo giấy phép LGPL-3.0 và SheetJS Community Edition (`xlsx`) theo giấy phép Apache-2.0; nội dung giấy phép và ghi chú đi kèm nằm trong `licenses/` và `THIRD_PARTY_NOTICES.txt` của gói.
