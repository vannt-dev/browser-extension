# ⚡ Universal File Converter & AI Toolkit (Chrome Extension Manifest V3)

Extension chuyển đổi file đa năng **100% Client-Side (Privacy-First)** dành cho Chrome, Edge & các trình duyệt Chromium.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Offline-success)

---

## 🌟 Tính Năng Nổi Bật

1. **📷 Chuyển Đổi Hình Ảnh**:
   - Hỗ trợ `PNG`, `JPG`, `WebP`, `SVG`, `BMP`, `ICO`.
   - `BMP` xuất bằng encoder riêng (BITMAPV4HEADER 32-bit, giữ nguyên kênh alpha) và `ICO` xuất đa độ phân giải (16→256px), vì canvas của trình duyệt không mã hóa được 2 định dạng này.
   - Tùy chỉnh slider chất lượng nén, thay đổi kích thước (Resize), nén theo dung lượng mục tiêu (**Target Size KB/MB**).
   - Tự động xóa thông tin vị trí Exif GPS nhạy cảm khỏi ảnh.

2. **📄 Tài Liệu & PDF**:
   - `DOCX ➔ HTML / PDF / TXT / Markdown`.
   - `PDF ➔ PNG Images (Từng trang)` hoặc trích xuất văn bản `TXT`.
   - `Markdown / TXT / HTML ➔ PDF`.

3. **📊 Dữ Liệu Cấu Trúc**:
   - `JSON ↔ CSV ↔ XML ↔ YAML`.

4. **🤖 Xử Lý Ảnh Nâng Cao & Bảo Mật Offline**:
   - **Offline OCR**: Đọc trích xuất chữ từ ảnh/PDF scan (Tiếng Việt & Anh) bằng `Tesseract.js`. Toàn bộ WASM core và traineddata được đóng gói sẵn trong extension — không tải gì từ CDN.
   - **Xóa nền đơn sắc**: Dò màu nền từ viền ảnh, loang vùng đồng màu và làm mượt biên alpha, xuất PNG trong suốt. Đây là thuật toán so màu xác định (không phải mô hình AI): hiệu quả với ảnh chụp trên nền một màu, không tách sạch được ảnh nền phức tạp.
   - **Watermarking**: Đóng dấu bản quyền chữ/logo lên tài liệu & hình ảnh.

5. **⚡ Tiện Ích Trải Nghiệm (UX Super-pack)**:
   - **Auto-Convert Chrome Downloads**: Tự động chuyển file `.webp / .jfif` khi bấm tải ảnh bất kỳ trên Web thành `.jpg / .png`.
   - **Context Menu**: Nhấp chuột phải vào ảnh bất kỳ trên trang web ➔ Chuyển đổi nhanh.
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
Tất cả các thao tác xử lý dữ liệu và mô hình AI đều được thực hiện **100% cục bộ (Local)** trong trình duyệt của bạn. **Không có bất kỳ dữ liệu hay tập tin nào bị tải lên Server bên ngoài**.
