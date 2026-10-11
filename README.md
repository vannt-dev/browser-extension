# ⚡ Universal File Converter (Chrome Extension Manifest V3)

Extension chuyển đổi file đa năng **100% Client-Side (Privacy-First)** dành cho Chrome, Edge & các trình duyệt Chromium.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Offline-success)

🛒 **Chrome Web Store**: [Universal File Converter](https://chromewebstore.google.com/detail/universal-file-converter/bekbobpfdajniiiiadbpiedlbhccidnp) · 🔒 [Chính sách riêng tư](PRIVACY.md)

---

## 🌟 Tính Năng Nổi Bật

1. **📷 Chuyển Đổi Hình Ảnh**:
   - Hỗ trợ `PNG`, `JPG`, `WebP`, `SVG`, `BMP`, `ICO`.
   - Đọc được thêm `GIF`, `AVIF` và `HEIC/HEIF` (ảnh iPhone) làm ảnh đầu vào. AVIF do trình duyệt tự giải mã; HEIC được giải mã ngay trong extension bằng libheif (gói `heic-to`, khoảng 3 MB, chỉ nạp khi gặp file HEIC) và nhận diện theo nội dung file, nên ảnh HEIC bị đổi đuôi vẫn đọc được. HEIC cũng dùng được cho OCR và Ảnh ➔ PDF. Chưa xuất ra AVIF/HEIC: canvas của Chrome không mã hóa được hai định dạng này.
   - `BMP` xuất bằng encoder riêng (BITMAPV4HEADER 32-bit, giữ nguyên kênh alpha) và `ICO` xuất đa độ phân giải (16→256px), vì canvas của trình duyệt không mã hóa được 2 định dạng này.
   - Tùy chỉnh slider chất lượng nén, thay đổi kích thước (Resize), nén theo dung lượng mục tiêu (**Target Size KB/MB**).
   - Tự động xóa thông tin vị trí Exif GPS nhạy cảm khỏi ảnh.

2. **📄 Tài Liệu & PDF**:
   - `DOCX ➔ HTML / PDF / TXT / Markdown`.
   - `PDF ➔ PNG Images (Từng trang)` hoặc trích xuất văn bản `TXT`.
   - `Markdown / TXT / HTML ➔ PDF`.
   - **Gộp PDF**: chọn nhiều file PDF rồi chọn định dạng đích "Gộp các file PDF thành một" — các file được nối theo thứ tự trong danh sách chờ, file không phải PDF bị bỏ qua.
   - **Tách PDF**: mỗi trang một file, hoặc (trong Dashboard) theo khoảng trang như `1-3, 5, 8-` — mỗi khoảng một file, nhiều file thì đóng gói ZIP. Gộp và tách sao chép nguyên trang (bằng `pdf-lib`), không render lại: chữ vẫn là chữ, không giảm chất lượng. PDF có mật khẩu không mở được.

3. **📊 Dữ Liệu Cấu Trúc**:
   - `JSON ↔ CSV ↔ XML ↔ YAML`.

4. **🤖 Xử Lý Ảnh Nâng Cao & Bảo Mật Offline**:
   - **Offline OCR**: Đọc trích xuất chữ từ ảnh/PDF scan (Tiếng Việt & Anh) bằng `Tesseract.js`. Toàn bộ WASM core và traineddata được đóng gói sẵn trong extension — không tải gì từ CDN.
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

---

## 🔒 Cam Kết Bảo Mật (Privacy Guarantee)
Tất cả các thao tác xử lý dữ liệu và nhận dạng chữ (OCR) đều được thực hiện **100% cục bộ (Local)** trong trình duyệt của bạn. **Không có bất kỳ dữ liệu hay tập tin nào bị tải lên Server bên ngoài**.

---

## 📄 Giấy phép

Mã nguồn của extension phát hành theo giấy phép [MIT](LICENSE).

Gói extension có kèm thư viện giải mã HEIC (`heic-to`, dựa trên libheif) theo giấy phép LGPL-3.0; nội dung giấy phép và ghi chú đi kèm nằm trong `licenses/` và `THIRD_PARTY_NOTICES.txt` của gói.
