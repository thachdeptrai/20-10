# 20/10 — Một ngân hà dành tặng bạn

Web chúc mừng Ngày Phụ nữ Việt Nam với ngân hà 3D tương tác bằng Three.js/WebGL. Giao diện tiếng Việt, lời chúc dành cho tất cả phụ nữ, không cần ảnh cá nhân hay backend.

## Trải nghiệm

- Ngân hà 5 nhánh xoắn, ba lớp sao/bụi/sao nền, màu vàng champagne → hồng → tím → xanh.
- Kéo chuột hoặc một ngón tay để xoay. Lăn chuột hoặc chụm hai ngón để thu phóng.
- Chạm vào một ngôi sao có nhãn để mở lời chúc tương ứng. Có danh sách lời chúc bên dưới để luôn truy cập được.
- Nút **Gửi ngàn yêu thương** gom các hạt sao thành trái tim có chiều sâu; bấm lại để trở về ngân hà.
- Sáu lời chúc, chuyển bằng nút mũi tên, phím trái/phải hoặc các chấm dưới thiệp. Esc hoặc bấm ngoài thiệp để đóng.
- Nhạc ambient tự tạo bằng Web Audio, chỉ phát khi bấm **Bật nhạc**; không tải MP3 bên ngoài.
- Tạm dừng chuyển động, đặt lại góc nhìn và chọn chất lượng Tự động / Nhẹ / Chi tiết.
- Tự dừng vẽ khi tab bị ẩn hoặc cảnh nằm ngoài màn hình. Tôn trọng cài đặt giảm chuyển động của thiết bị.
- Khi WebGL không hoạt động, tự chuyển sang ngân hà Canvas 2D với phép chiếu phối cảnh: vẫn xoay, thu phóng, kết thành trái tim và mở lời chúc. Chế độ dự phòng dùng 4.800–9.000 hạt để nhẹ hơn.

## Các file

| File | Nội dung |
| --- | --- |
| `index.html` | Cấu trúc trang, metadata, các nút và hộp thoại lời chúc |
| `css/styles.css` | Giao diện, typography, màu sắc, bố cục desktop/mobile |
| `js/config.js` | Toàn bộ lời chúc, người nhận, bảng màu, số lượng sao |
| `js/app.js` | Gắn giao diện với cảnh 3D, điều khiển thiệp và trạng thái |
| `js/galaxy.js` | Cảnh Three.js, GPU shaders, ngân hà, trái tim và camera |
| `js/galaxy-fallback.js` | Ngân hà dự phòng khi thiết bị không mở được WebGL |
| `js/audio.js` | Giai điệu ambient, bật/tắt và tạm dừng âm thanh khi ẩn tab |
| `vendor/three.module.min.js` | Three.js 0.170.0, lưu cùng web để không phụ thuộc CDN lúc chạy |
| `vendor/OrbitControls.js` | Điều khiển camera, cùng phiên bản với Three.js |
| `vendor/THREE-LICENSE.txt` | Giấy phép MIT của Three.js |
| `.nojekyll` | GitHub Pages phục vụ các file tĩnh trực tiếp |

## Chạy trên GitHub Pages

Repo này đã có GitHub Pages. Giữ `index.html`, `css`, `js`, `vendor` ở thư mục gốc. Các đường dẫn đều bắt đầu bằng `./` hoặc `../`, nên tương thích với đường dẫn dự án `/20-10/`.

Với repo mới: vào **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Không cần npm, build, database, API key hay GitHub Actions riêng. Xem tiến trình tại tab **Actions** của repo.

Khi chỉnh sửa, commit/push lên nhánh xuất bản; Pages sẽ cập nhật. Nếu vẫn thấy bản cũ, tải lại trang hoặc dùng Ctrl+F5 trên máy tính.

## Chạy trên máy

Vì dùng ES modules, hãy mở bằng HTTP server, **không mở trực tiếp `file://index.html`**.

Lựa chọn dễ nhất: mở thư mục bằng VS Code, dùng Live Server, bấm **Go Live**.

Hoặc chạy trong thư mục dự án nếu đã cài Python:

```sh
python -m http.server 8080
```

Rồi mở `http://localhost:8080`. Không cần cài dependency Node để chạy web. Toàn bộ thư viện 3D nằm trong `vendor`; chỉ Google Fonts cần Internet. Nếu không tải được font, trình duyệt dùng font thay thế.

## Chỉnh lời chúc

Mở `js/config.js` và sửa `CONFIG.recipient`, `CONFIG.description`, `CONFIG.footer` và `CONFIG.wishes`.

Một lời chúc có cấu trúc:

```js
{
  label: 'Bình an',
  title: 'Một lòng thật bình yên',
  body: 'Đoạn đầu.\n\nĐoạn thứ hai.',
  closing: 'Lời kết ngắn.',
  position: [5.9, 0.9, 2.7], // Tọa độ x, y, z của hotspot trong cảnh
}
```

Thêm hoặc bớt phần tử trong `wishes` sẽ tự cập nhật các nút, số thứ tự và điều hướng. Lời chúc cuối cùng được mở khi bấm nút chính. Nội dung được đưa vào bằng `textContent`, không cần viết HTML trong lời chúc.

## Chỉnh hiệu ứng và màu

Trong `CONFIG.galaxy`:

| Cấu hình | Ý nghĩa |
| --- | --- |
| `seed` | Cố định phân bố sao, đổi giá trị để có cách rải sao khác |
| `radius` | Bán kính ngân hà; mặc định 11 |
| `arms` | Số cánh xoắn; mặc định 5 |
| `spin` | Độ xoắn của các cánh; mặc định 0.58 |
| `colors` | Màu chuyển dần từ tâm đến rìa |
| `quality.low` | 13.000 sao + 1.800 hạt bụi + 650 sao nền, giới hạn 30 FPS, pixel ratio tối đa 1 |
| `quality.high` | 42.000 sao + 6.000 hạt bụi + 1.600 sao nền, giới hạn 60 FPS, pixel ratio tối đa 1.6 |

Chế độ Tự động chọn mức nhẹ trên màn hình nhỏ hoặc thiết bị báo ít luồng xử lý; nếu tốc độ vẽ thấp, nó giảm pixel ratio. Đây là giới hạn mục tiêu, không phải cam kết FPS trên mọi thiết bị.

Màu giao diện nằm ở các biến `:root` đầu `css/styles.css`. Shader lấp lánh, tốc độ quay và hình trái tim nằm trong `js/galaxy.js`. Tăng mật độ sao quá cao có thể làm nóng máy; tăng chất lượng cần cân nhắc cả GPU và kích thước màn hình.

## Bàn phím và khả năng truy cập

- Tab/Shift+Tab để di chuyển qua các nút. Enter/Space để mở lời chúc.
- Khi canvas có focus: phím mũi tên xoay, `+`/`-` thu phóng, `R` đặt lại góc nhìn.
- Hộp thoại dùng phần tử `<dialog>` với focus mặc định, Esc để đóng và trả focus về nút đã mở.
- Cài đặt `prefers-reduced-motion` mặc định dừng chuyển động tự động và bỏ chuyển cảnh kéo dài.
- Có nút dừng hiệu ứng; không cần âm thanh để đọc hay thao tác.

## Nguồn kỹ thuật đã tham khảo

Mã giao diện, thuật toán rải sao, shader tùy biến, nội dung và giai điệu được viết cho dự án này. Thư viện vendored giữ nguyên giấy phép của tác giả.

- [Three.js Points](https://threejs.org/docs/pages/Points.html): dựng đám mây hạt sao.
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html): lưu vị trí, màu và thuộc tính hạt trong buffer trên GPU.
- [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html): chuyển động và nội suy ngân hà → trái tim bằng shader.
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html): xoay/thu phóng với chuột và cảm ứng.
- [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices): gom draw calls, giới hạn pixel ratio, giải phóng tài nguyên và xử lý context loss.
- [GitHub Pages — publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): phục vụ web tĩnh từ nhánh.
- Thư viện khóa ở **Three.js 0.170.0**; các file lấy từ [npm package chính thức](https://www.npmjs.com/package/three/v/0.170.0). Tài liệu trực tuyến có thể mô tả phiên bản mới hơn.

Đây là ngân hà nghệ thuật dành cho thiệp chúc mừng, không phải mô phỏng thiên văn theo tỷ lệ thực.
