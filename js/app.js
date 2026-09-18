import { CONFIG } from './config.js';
import { AmbientAudio } from './audio.js';

const $ = id => document.getElementById(id);
const dialog = $('wish-dialog');
const audio = new AmbientAudio();
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let galaxy = null, currentWish = 0, love = false, paused = motionPreference.matches;
let toastTimer, previousFocus;

function toast(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200);
}

function renderWish(index) {
  currentWish = (index + CONFIG.wishes.length) % CONFIG.wishes.length;
  const wish = CONFIG.wishes[currentWish];
  $('wish-title').textContent = wish.title;
  $('wish-body').textContent = wish.body;
  $('letter-closing').textContent = wish.closing;
  $('wish-number').textContent = `${String(currentWish+1).padStart(2,'0')} / ${String(CONFIG.wishes.length).padStart(2,'0')}`;
  [...$('letter-dots').children].forEach((button,i) => button.setAttribute('aria-current',String(i===currentWish)));
  dialog.scrollTop = 0;
}

function openWish(index) {
  renderWish(index);
  if (!dialog.open) {
    previousFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    galaxy?.setPaused(true);
  }
  audio.chime();
}

function syncPauseButton() {
  $('motion-button').setAttribute('aria-pressed',String(paused));
  $('motion-button').setAttribute('aria-label',paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động');
  $('motion-button').title = paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động';
  $('motion-button').textContent = paused ? '▷' : 'Ⅱ';
}

$('hero-description').textContent = CONFIG.description;
$('footer-message').textContent = CONFIG.footer;
$('letter-recipient').textContent = CONFIG.recipient;

// Hotspot dùng button thật ở tọa độ chiếu từ 3D: dùng được chuột, chạm và Tab.
const anchors = CONFIG.wishes.map((wish,index) => {
  const node = document.createElement('button');
  node.type = 'button'; node.className = 'star-node'; node.hidden = true;
  node.setAttribute('aria-label',`Ngôi sao ${wish.label} — mở lời chúc`);
  const point = document.createElement('span'); point.className = 'star-point'; point.setAttribute('aria-hidden','true');
  const label = document.createElement('span'); label.className = 'star-text'; label.textContent = wish.label;
  node.append(point,label); node.addEventListener('click',() => openWish(index));
  $('star-labels').append(node);
  const shortcut = document.createElement('button'); shortcut.type = 'button'; shortcut.className = 'wish-shortcut';
  const icon = document.createElement('span'); icon.textContent = '✧'; icon.setAttribute('aria-hidden','true');
  const text = document.createElement('span'); text.textContent = wish.label;
  shortcut.append(icon,text); shortcut.addEventListener('click',() => openWish(index));
  $('wish-shortcuts').append(shortcut);
  const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label',`Đọc lời chúc ${wish.label}`);
  dot.addEventListener('click',() => renderWish(index)); $('letter-dots').append(dot);
  return { element: node, position: wish.position };
});

$('open-letter').addEventListener('click',() => openWish(CONFIG.wishes.length-1));
$('close-letter').addEventListener('click',() => dialog.close());
$('previous-wish').addEventListener('click',() => renderWish(currentWish-1));
$('next-wish').addEventListener('click',() => renderWish(currentWish+1));
dialog.addEventListener('click',event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) dialog.close();
});
dialog.addEventListener('close',() => {
  document.body.style.overflow = '';
  galaxy?.setPaused(paused);
  previousFocus?.focus({preventScroll:true});
});
dialog.addEventListener('keydown',event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); renderWish(currentWish-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); renderWish(currentWish+1); }
});

$('sound-button').addEventListener('click',async () => {
  const button = $('sound-button'); button.disabled = true;
  try {
    const enabled = await audio.toggle();
    button.setAttribute('aria-pressed',String(enabled));
    button.setAttribute('aria-label',enabled ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    $('sound-label').textContent = enabled ? 'Tắt nhạc' : 'Bật nhạc';
  } catch { toast('Chưa bật được âm thanh. Bạn thử chạm nút nhạc một lần nữa nhé.'); }
  finally { button.disabled = false; }
});

$('love-button').addEventListener('click',() => {
  if (!galaxy) { openWish(CONFIG.wishes.length-1); return; }
  love = !love; galaxy.setLove(love);
  $('love-button').setAttribute('aria-pressed',String(love));
  $('love-label').textContent = love ? 'Trở về ngân hà' : 'Gửi ngàn yêu thương';
  $('galaxy-caption-text').textContent = love ? 'Tất cả yêu thương này, dành tặng bạn.' : 'Mỗi vì sao, một điều tốt đẹp.';
  if (love) audio.chime();
});
$('motion-button').addEventListener('click',() => { paused = !paused; galaxy?.setPaused(paused); syncPauseButton(); });
$('reset-button').addEventListener('click',() => galaxy?.resetView());
$('quality-select').addEventListener('change',event => {
  try { galaxy?.setQuality(event.target.value); }
  catch (error) { console.error('Không đổi được chất lượng:',error); unavailable('quality'); }
});
motionPreference.addEventListener('change',event => {
  if (galaxy) galaxy.reducedMotion = event.matches;
  paused = event.matches; galaxy?.setPaused(paused || dialog.open); syncPauseButton();
});
syncPauseButton();

function unavailable(reason) {
  const failed = Boolean(reason);
  document.body.classList.toggle('scene-fallback',failed);
  $('scene-status').hidden = !failed;
  $('scene-status').textContent = reason === 'context-lost'
    ? 'Cảnh 3D đang tạm nghỉ. Bạn vẫn có thể mở tất cả lời chúc bên dưới.'
    : 'Thiết bị chưa mở được cảnh 3D. Những lời chúc vẫn luôn ở đây dành cho bạn.';
  ['motion-button','reset-button','quality-select'].forEach(id => { $(id).disabled = failed; });
  if (failed) anchors.forEach(anchor => { anchor.element.hidden = true; });
}

// UI/lời chúc không phụ thuộc WebGL: lỗi GPU hay module 3D không khóa trang.
async function boot() {
  const options = { canvas:$('galaxy-canvas'), container:$('universe'), config:CONFIG.galaxy,
    anchors, reducedMotion:motionPreference.matches, onUnavailable:unavailable };
  try {
    const { Galaxy } = await import('./galaxy.js');
    galaxy = new Galaxy(options);
  } catch (error) {
    console.info('Dùng phiên bản ngân hà tương thích:',error.message);
    try {
      const { Galaxy } = await import('./galaxy-fallback.js');
      // Canvas từng nhận WebGL không đổi sang context 2D: thay bằng canvas sạch.
      const canvas = options.canvas.cloneNode(false);
      options.canvas.replaceWith(canvas); options.canvas = canvas;
      galaxy = new Galaxy(options);
    } catch (fallbackError) {
      console.error('Khởi tạo ngân hà thất bại:',fallbackError);
      unavailable('init'); return;
    }
  }
  galaxy.setPaused(paused || dialog.open);
  $('scene-status').hidden = true;
}
boot();

// bfcache giữ nguyên trang khi Back/Forward; chỉ giải phóng lúc rời thật sự.
window.addEventListener('pagehide',event => { if (!event.persisted) { galaxy?.dispose(); audio.dispose(); } });
