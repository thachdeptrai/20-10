# 20.10 — Gửi người tôi thương · v2

**The Letter Edition**: một lá thư riêng, ba điều trân trọng và một lời hẹn thật sự. Ngân hà 3D trở thành không gian để mở món quà, đọc những lời nhắn và gửi yêu thương đến một người cụ thể.

Trang: https://thachdeptrai.github.io/20-10/

## Có gì mới?

- Giao diện đêm xanh, giấy thư màu kem, ánh vàng ấm; responsive từ điện thoại đến desktop.
- Phong thư CSS 3D có chiều sâu, con dấu sáp, chuyển động nổi và parallax theo chuột. Mở thư có chuyển cảnh; ngân hà WebGL xoay và kết thành trái tim.
- Hành trình đọc: lá thư → ba điều muốn nói → một lời hẹn. Có thể đọc mọi phần độc lập; không ép chơi trò chơi để xem lời nhắn.
- Trình viết thư với tên người nhận/người gửi, thư tối đa 700 ký tự, ba lời nhắn 120 ký tự và lời hẹn 160 ký tự.
- Năm gợi ý: mẹ, bà, chị/em gái, người thương, bạn bè. Khi đã viết nội dung, thay bằng gợi ý cần một thao tác xác nhận ngay trong form.
- Ba sắc màu: nắng ấm, hồng thương, trăng xanh.
- Tự lưu/khôi phục bản nháp trong localStorage, kể cả bản chưa viết xong. Xử lý khi bộ nhớ bị chặn hoặc đầy.
- Link quà tặng độc lập. Người nhận mở được trên thiết bị khác, không cần tài khoản hay database.
- Sao chép link, chia sẻ qua bảng chia sẻ hệ thống nếu được hỗ trợ, xem lại món quà và tải thiệp PNG đầy đủ nội dung.
- Nhạc nền Web Audio chỉ bật sau thao tác của người dùng. Chuông nhỏ khi mở nội dung nếu nhạc đang bật.
- Tạm dừng chuyển động, chọn mức chất lượng, tôn trọng reduced motion. Dừng render khi cảnh ngoài màn hình hoặc tab bị ẩn.
- Thiết bị thiếu WebGL dùng Canvas 2D với phép chiếu phối cảnh; phần thư/form hoạt động ngay cả khi cả hai renderer thất bại.

Hiệu ứng có chiều sâu và phản hồi chuyển động/âm thanh; đây không phải màn hình 4D vật lý.

## Chạy và cập nhật

Đây là web tĩnh, **không có bước build**. Thư viện Three.js 0.170.0 được giữ trong `vendor`, không tải CDN lúc chạy. Typography dùng **Be Vietnam Pro** cho nội dung và **Playfair Display** cho tiêu đề/thư; cả hai có bộ ký tự tiếng Việt và dùng `display=swap`. Nếu Google Fonts bị chặn hoặc mất mạng, giao diện tự rơi về Segoe UI/Arial và Georgia/Noto Serif nên nội dung vẫn đọc được. Không có analytics.

```sh
python -m http.server 8080
```

Mở `http://localhost:8080`. Không mở trực tiếp bằng `file://` vì ES modules cần HTTP.

GitHub Pages tiếp tục dùng nhánh `main`, thư mục gốc. Tất cả đường dẫn tương đối, phù hợp `/20-10/`. Commit mới sẽ kích hoạt Pages theo cấu hình sẵn có. `.nojekyll` và thư viện vendored của bản trước được giữ nguyên.

## Link quà và dữ liệu

Link có dạng `https://…/20-10/#gift=<base64url>`. Phần sau `#` chứa JSON UTF-8 đã mã hóa để vận chuyển, **không phải mã hóa bảo mật**. Ai có toàn bộ link đều đọc được món quà. Dữ liệu không được ghi lên GitHub hoặc cơ sở dữ liệu; máy chủ web không nhận phần fragment trong HTTP request. Khi dùng bảng chia sẻ hệ thống, ứng dụng bạn chọn sẽ nhận link.

Tên, lời nhắn và thư đều được gắn bằng `textContent`. Trình đọc giới hạn kích thước, kiểm tra phiên bản/schema và từ chối link lỗi. Điều hướng giữa các mục không làm mất fragment món quà. Một link đã tạo là bản chụp nội dung; chỉnh bản nháp phải tạo và gửi link mới.

Bản nháp chỉ nằm trên trình duyệt hiện tại với khóa `20-10-letter-draft-v2`; không tự đồng bộ thiết bị. Xóa dữ liệu trình duyệt có thể xóa bản nháp, nhưng link đã lưu vẫn mở được. Thiệp PNG chứa đầy đủ thư, ba lời nhắn và lời hẹn; chiều cao ảnh tự tăng theo nội dung. Không đính kèm link dài lên ảnh.

## Cấu trúc

| File | Vai trò |
| --- | --- |
| `index.html` | Giao diện, hành trình đọc, các dialog và form |
| `css/styles.css` | Responsive, phong thư 3D, chuyển cảnh, màu sắc |
| `js/app.js` | Tương tác, trạng thái món quà, lưu nháp, chia sẻ, fallback |
| `js/gift.js` | Mẫu thư, giới hạn dữ liệu, kiểm tra và mã hóa link |
| `js/postcard.js` | Vẽ thiệp PNG bằng Canvas, wrap chữ theo chiều rộng thực |
| `js/config.js` | Mật độ, màu ngân hà, các hotspot |
| `js/galaxy.js` | Three.js/WebGL và shader ngân hà → trái tim |
| `js/galaxy-fallback.js` | Renderer dự phòng Canvas 2D |
| `js/audio.js` | Âm thanh ambient theo thao tác người dùng |
| `tests/gift.test.mjs` | Kiểm tra link UTF-8, schema, giới hạn và đường dẫn |
| `tests/font.test.mjs` | Chống regress font tiếng Việt, cache key và font của thiệp PNG |

## Kiểm tra

Với Node.js 22+:

```sh
node --test tests/*.test.mjs
```

Kiểm tra thủ công trước khi xuất bản:

1. Desktop và mobile: không tràn ngang, các nút chạm được, dấu tiếng Việt hiển thị đúng. Thử thêm một lần khi chặn Google Fonts để xác nhận fallback hệ thống vẫn đẹp và không nhảy bố cục quá mức.
2. Mở lá thư, ba ngôi sao, lời hẹn; Esc và nút đóng trả focus hợp lý.
3. Tạo quà có tiếng Việt/emoji, xem trước; mở link ở cửa sổ riêng.
4. Bấm điều hướng đến các mục trong link nhận quà: nội dung cá nhân vẫn giữ nguyên.
5. Tải PNG, kiểm tra cả nội dung dài và tên dài không bị cắt.
6. Tải lại trang soạn dở: bản nháp còn nguyên. Lỗi localStorage/clipboard không khóa luồng.
7. Bật reduced motion, dừng chuyển động; chặn WebGL để kiểm tra fallback.
8. Nhạc không tự phát; tắt/mở nhạc, chuyển tab và quay lại.

## Giấy phép thư viện

Three.js và OrbitControls: MIT, giữ nguyên `vendor/THREE-LICENSE.txt`. Mã giao diện, nội dung mẫu, thuật toán hình ảnh thiệp và âm thanh được viết cho dự án này. Ngân hà là hình ảnh nghệ thuật, không phải mô phỏng thiên văn theo tỷ lệ thực.
