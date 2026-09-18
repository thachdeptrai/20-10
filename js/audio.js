// Giai điệu ambient tự tạo; không tải nhạc bên ngoài và không tự phát.
export class AmbientAudio {
  constructor() {
    this.context = null; this.enabled = false; this.timer = null; this.step = 0;
    this.notes = [60, 67, 72, 76, 67, 74, 72, 67, 57, 64, 69, 72, 64, 71, 69, 64,
      53, 60, 65, 69, 60, 67, 65, 60, 55, 62, 67, 71, 62, 69, 67, 62];
    this.onVisibility = () => this.syncVisibility();
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  async toggle() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Trình duyệt không hỗ trợ âm thanh.');
      this.context = new AudioContext();
      this.master = this.context.createGain(); this.master.gain.value = 0.42;
      const limiter = this.context.createDynamicsCompressor();
      limiter.threshold.value = -16; limiter.ratio.value = 6;
      this.master.connect(limiter).connect(this.context.destination);
    }
    this.enabled = !this.enabled;
    if (this.enabled) {
      try { await this.context.resume(); this.startScheduler(); }
      catch (error) { this.enabled = false; throw error; }
    } else { this.stopScheduler(); await this.context.suspend(); }
    return this.enabled;
  }

  note(midi, at, length = 2.6, volume = 0.065) {
    const frequency = 440*Math.pow(2,(midi-69)/12);
    // Hai âm sin nhẹ tạo chất tiếng chuông, envelope tắt hoàn toàn mỗi nốt.
    [1, 2].forEach((harmonic, i) => {
      const osc = this.context.createOscillator(); const gain = this.context.createGain();
      osc.type = 'sine'; osc.frequency.value = frequency*harmonic;
      gain.gain.setValueAtTime(0,at);
      gain.gain.linearRampToValueAtTime(volume/(i*3+1),at+0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001,at+length);
      osc.connect(gain).connect(this.master);
      osc.start(at); osc.stop(at+length+0.05);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  startScheduler() {
    this.stopScheduler(); this.nextNote = this.context.currentTime + 0.06;
    const schedule = () => {
      if (!this.enabled || this.context.state !== 'running') return;
      while (this.nextNote < this.context.currentTime + 0.2) {
        this.note(this.notes[this.step % this.notes.length], this.nextNote);
        if (this.step % 8 === 0) this.note(this.notes[this.step % this.notes.length]-12, this.nextNote, 4, 0.045);
        this.step++; this.nextNote += 0.56;
      }
    };
    schedule(); this.timer = setInterval(schedule, 100);
  }
  stopScheduler() { if (this.timer !== null) clearInterval(this.timer); this.timer = null; }
  chime() {
    if (!this.enabled || this.context?.state !== 'running') return;
    [79,83,86].forEach((n,i) => this.note(n,this.context.currentTime+i*0.15,1.5,0.035));
  }
  async syncVisibility() {
    if (!this.context || !this.enabled) return;
    try {
      if (document.hidden) { this.stopScheduler(); await this.context.suspend(); }
      else { await this.context.resume(); if (this.enabled) this.startScheduler(); }
    } catch { /* Người dùng vẫn có thể tắt/bật nhạc lại bằng nút. */ }
  }
  dispose() { this.stopScheduler(); document.removeEventListener('visibilitychange', this.onVisibility); this.context?.close(); }
}
