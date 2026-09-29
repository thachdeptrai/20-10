export const CONFIG = {
  galaxy: {
    seed: 20102026, radius: 11, arms: 5, spin: 0.6,
    colors: ['#fff5d8', '#e8cb95', '#adc6ab', '#619b9b', '#3a7084'],
    quality: {
      low: { stars: 11000, dust: 1500, background: 500, pixelRatio: 1, fps: 30 },
      high: { stars: 32000, dust: 4200, background: 1100, pixelRatio: 1.5, fps: 60 },
    },
  },
  anchors: [
    { label: 'Cảm ơn', position: [-7, 1, 3.4] },
    { label: 'Còn nhớ', position: [6.7, 1.1, -4.6] },
    { label: 'Mong bạn', position: [4.3, 1, 6.5] },
  ],
};
