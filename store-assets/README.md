# Ảnh cho trang Chrome Web Store

| File | Dùng cho | Kích thước |
| --- | --- | --- |
| `screenshots/1-batch-converter.png` … `5-auto-convert-downloads.png` | Ảnh chụp màn hình trên trang Store | 1280x800, PNG không có kênh alpha |
| `small-promo-tile-440x280.png` | Ảnh quảng bá nhỏ | 440x280 |
| `store-icon.jpg` | Bản gốc của icon | 1024x1024 |

Năm ảnh chụp là giao diện thật của extension: gói ZIP bản 1.5.0 được nạp vào Chromium, chạy trên các file mẫu tự
dựng (ảnh phong cảnh vẽ bằng CSS, một văn bản Việt–Anh, một logo trên nền trơn, một file PDF nhỏ) rồi chụp ở
1280x800. Từ 1.5.0, ảnh thẻ Watermark & Security nhường chỗ cho thẻ Cắt & lật ảnh, vì Store nhận tối đa năm ảnh.
Khi giao diện đổi, hãy chụp lại từ bản build mới thay vì chỉnh sửa ảnh.

Icon 128x128 gửi lên Store là `assets/icons/icon128.png`, cũng chính là icon nằm trong gói.
