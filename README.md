# 20.10 V3 — After The Letter

Interactive digital letter dành cho 20/10. V3 giữ nguyên nền V2 (phong thư 3D, WebGL/Canvas galaxy, WebAudio, composer, gift link, localStorage, postcard PNG, responsive và accessibility) rồi mở rộng thành một flow rõ ràng hơn: **Intro → Phong thư → Lá thư → 3 ngôi sao → Constellation → Lời hẹn → Galaxy morph → Final message**.

Trang: https://thachdeptrai.github.io/20-10/

## V3 có gì mới

- Intro tối giản chỉ xuất hiện khi mở gift link.
- Copy được viết lại theo tone tự nhiên, bớt ngôn tình/sáo rỗng.
- Gift schema `v:3` có thêm `noteTitles[3]` và `finalMessage`.
- Link V2 vẫn mở được: dữ liệu V2 được migrate sang default V3 ở runtime.
- Người tạo đổi tên 3 ngôi sao trực tiếp trong composer.
- Galaxy phản ứng theo tiến độ đọc 0/3 → 3/3 bằng ánh sáng, trạng thái sao và constellation; không có XP/badge/điểm.
- Sau khi đọc đủ 3 phần, ba sao được nối thành constellation trước khi sang lời hẹn.
- Final cinematic dùng morph galaxy → heart sẵn có, sau đó hiện tên người nhận, câu cuối và người gửi.
- QR Code chạy hoàn toàn client-side, có tải QR PNG và card QR.
- Ba theme khác nhau về atmosphere: Galaxy, Rose và Moonlight.
- Micro-interaction nhẹ: card depth, glow, click spark, reveal, magnetic nudge trên desktop.
- Reduced motion rút ngắn intro/final sequence; mobile tiếp tục dùng cơ chế auto quality/fallback của V2.

## Cấu trúc dữ liệu

```js
{
  v: 3,
  to: "Linh",
  from: "Thạch",
  message: "...",
  noteTitles: ["Chuyện thứ nhất", "Có điều này", "Và thêm một chuyện nữa"],
  notes: ["...", "...", "..."],
  promise: "...",
  finalMessage: "Chúc bạn hôm nay thật vui.",
  theme: "gold" // gold | rose | blue
}
```

Giới hạn chính: tên 40 ký tự, thư 700, mới note 120, mỗi tiêu đề sao 50, lời hẹn 160, câu cuối 160.

Gift link vẫn là JSON UTF-8 được base64url trong fragment `#gift=...`; đây là định dạng va��tn chuyển, **không phải mã hóa bảo mật**. Website không cần tài khoản hay database.

## Tương thích V2

`validateGift()` chấp nhận schema `v:2` và `v:3`. Khi đọc V2, hệ thống tự bổ sung:

- `noteTitles`: `Một lởi cảm ơn`, `Một điều mình nhớ`, `Một điều muốn nói`
- `finalMessage`: `Chúc bạn có một ngày thật vui.`

Draft mới dùng khóa `20-10-letter-draft-v3`, nhưng] vẫn đọc `20-10-letter-draft-v2` ồ để nhâng bản nháp cṩ.

## Chạy local

Không có build step.

```sh
python -m http.server 8080
```

Mở `http://localhost:8080`. Three.js tiếp tục được vendored. QR dùng `qrcodejs` (MIT) vendored trong `vendor/`.

## Test

Yêu cầu Node.js 22+:

```sh
node --test tests/*.test.mjs
```

Bộ test hiện tại kiểm tra schema V3, migration V2 → V3, UTF-8/emoji, malformed link, max length, DOM V3, font và reduced-motion/mobile guardrails.

GitHub Actions chạy cùng lệnh test trên `main` và pull request.

## Líu ý triển khai

GitHub Pages dùng branch `main`, thư mục gốc. Mọi asset path đều relative ồ ể thoạt động đúng døi `/20-10/`. Không force push; mỗi lần nâng cất tẨo commit mới.
