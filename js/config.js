// Chỉnh lời chúc, màu sắc và mật độ sao tại đây, không cần sửa engine 3D.
export const CONFIG = {
  recipient: 'Gửi bạn, người phụ nữ tuyệt vời.',
  description: 'Giữa hàng triệu vì sao, bạn vẫn tỏa sáng theo cách của riêng mình.',
  footer: 'Mong bạn luôn được yêu thương, theo cách dịu dàng nhất.',
  galaxy: {
    seed: 20102026, radius: 11, arms: 5, spin: 0.58,
    colors: ['#fff0d3', '#ffc1b6', '#db85c7', '#9771ed', '#578ae0'],
    quality: {
      low: { stars: 13000, dust: 1800, background: 650, pixelRatio: 1, fps: 30 },
      high: { stars: 42000, dust: 6000, background: 1600, pixelRatio: 1.6, fps: 60 },
    },
  },
  wishes: [
    {
      label: 'Yêu thương', title: 'Được yêu thương',
      body: 'Chúc bạn luôn được bao quanh bởi những người chân thành, biết lắng nghe và trân trọng cả những điều nhỏ bé bạn trao đi.\n\nMong mỗi ngày đều có một cái ôm đủ ấm, một lời hỏi han đúng lúc và một người khiến bạn thấy mình thật đáng quý.',
      closing: 'Bạn xứng đáng với những dịu dàng đẹp nhất.', position: [-5.5, 0.9, 2.6],
    },
    {
      label: 'Rực rỡ', title: 'Tỏa sáng theo cách riêng',
      body: 'Không cần trở thành một ai khác, cũng không cần rực rỡ giống bất kỳ vì sao nào. Chúc bạn luôn tự tin vào giá trị của mình.\n\nMong những nỗ lực thầm lặng được nhìn thấy, những ước mơ có cơ hội nở hoa và niềm vui luôn tìm đến bạn.',
      closing: 'Ngân hà có triệu vì sao. Nhưng bạn chỉ có một.', position: [3.5, 1, -4.2],
    },
    {
      label: 'Bình an', title: 'Một lòng thật bình yên',
      body: 'Chúc bạn có những buổi sáng nhẹ nhõm, những ngày làm điều mình yêu và những buổi tối không phải mang theo quá nhiều lo lắng.\n\nKhi mệt, mong bạn cho phép mình nghỉ ngơi. Khi buồn, mong bạn có một nơi an toàn để trở về.',
      closing: 'Không cần mạnh mẽ mọi lúc. Bình an cũng là hạnh phúc.', position: [5.9, 0.9, 2.7],
    },
    {
      label: 'Tự do', title: 'Được là chính mình',
      body: 'Chúc bạn đủ dũng cảm để chọn con đường mình muốn, đủ tự tin để nói điều mình nghĩ và đủ yêu bản thân để giữ những giới hạn cần thiết.\n\nMong cuộc sống của bạn được viết bằng những lựa chọn khiến trái tim thật sự mỉm cười.',
      closing: 'Cứ bước theo quỹ đạo của riêng bạn.', position: [-3.9, 1.2, -5.1],
    },
    {
      label: 'Hạnh phúc', title: 'Niềm vui từ những điều nhỏ',
      body: 'Chúc bạn có sức khỏe để đi xa, thời gian cho người mình thương và thật nhiều lý do để cười mỗi ngày.\n\nMột bữa cơm ngon, một cuộc hẹn vui, một tin nhắn dễ thương — mong hạnh phúc tìm thấy bạn trong những điều bình thường nhất.',
      closing: 'Mong nụ cười ở lại với bạn thật lâu.', position: [0.9, 1, 6.5],
    },
    {
      label: '20 tháng 10', title: 'Cả một ngân hà dành tặng bạn',
      body: 'Nhân ngày Phụ nữ Việt Nam 20/10, xin gửi tới những người mẹ, người bà, người chị, người bạn và tất cả những người phụ nữ tuyệt vời lời chúc chân thành nhất.\n\nCảm ơn vì sự hiện diện, những đóng góp và vẻ đẹp rất riêng của bạn. Mong bạn luôn được tôn trọng, nâng niu và sống trọn vẹn với điều mình yêu.',
      closing: 'Không chỉ hôm nay. Mà là mỗi ngày. Chúc mừng 20/10!', position: [0, 1.7, -0.5],
    },
  ],
};
