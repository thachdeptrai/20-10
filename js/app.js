import { CONFIG } from './config.js?v=3.0.0';
import { AmbientAudio } from './audio.js?v=3.0.0';
import { SAMPLE, TEMPLATES, NOTE_LABELS, NOTE_TEASERS, DEFAULT_STAR_TITLES, THEMES, encodeGift, decodeGift, validateGift, giftLink } from './gift.js?v=3.0.0';
import { downloadPostcard } from './postcard.js?v=3.0.0';

const $=id=>document.getElementById(id);
const audio=new AmbientAudio();
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const form=$('gift-form'), dialogs=[...document.querySelectorAll('dialog')];
const DRAFT_KEY='20-10-letter-draft-v3', LEGACY_DRAFT_KEY='20-10-letter-draft-v2';
let gift={...SAMPLE,notes:[...SAMPLE.notes],starTitles:[...SAMPLE.starTitles]}, shared=false, preparedGift=null;
let galaxy=null, paused=motionPreference.matches, love=false, currentMemory=0;
let toastTimer,openingTimer,introTimer,finaleTimer,draftTimer,previousFocus=null,opening=false,templatePending=false,promiseSeen=false;
const readMemories=new Set();
const initialHero=$('hero-title').cloneNode(true);
const defaultHeroDescription='Không cần viết thật hay.\nChỉ cần là điều bạn thực sự muốn nói.';
const defaultPromiseDescription='Một lời hẹn cụ thể đôi khi đáng giá hơn một lời chúc dài.';

// Section navigation must not replace the fragment that carries a received gift.
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const target=document.querySelector(link.getAttribute('href'));
  if(target){event.preventDefault();target.scrollIntoView({behavior:paused?'instant':'smooth'});if(link.classList.contains('skip-link')){target.tabIndex=-1;target.focus({preventScroll:true});}}
}));

function notify(message){
  clearTimeout(toastTimer);
  const toast=$('toast');toast.textContent=message;toast.hidden=false;
  // A toast in the top layer stays visible over native dialog backdrops.
  (dialogs.find(d=>d.open)||document.body).append(toast);
  toastTimer=setTimeout(()=>{toast.hidden=true;document.body.append(toast);},4200);
}
function syncMotion(){
  const held=paused||dialogs.some(d=>d.open)||opening;
  galaxy?.setPaused(held);document.body.classList.toggle('motion-paused',held);
  $('motion-button').setAttribute('aria-pressed',String(paused));
  $('motion-button').setAttribute('aria-label',paused?'Tiếp tục chuyển động':'Tạm dừng chuyển động');
  $('motion-button').textContent=paused?'▷':'Ⅱ';
}
function openDialog(dialog){
  if(!dialogs.some(d=>d.open))previousFocus=document.activeElement;
  dialogs.forEach(d=>{if(d!==dialog&&d.open)d.close();});
  if(!dialog.open)dialog.showModal();
  document.body.style.overflow='hidden';syncMotion();dialog.scrollTop=0;
}
for(const dialog of dialogs){
  dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    if(dialog.contains($('toast'))){$('toast').hidden=true;document.body.append($('toast'));}
    queueMicrotask(()=>{if(!dialogs.some(d=>d.open)){document.body.style.overflow='';previousFocus?.focus({preventScroll:true});}syncMotion();});
  });
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
}
function resetLove(){love=false;galaxy?.setLove(false);$('hero-art').classList.remove('love-active');$('envelope').tabIndex=0;$('love-button').setAttribute('aria-pressed','false');$('love-label').textContent='Xem chuyển cảnh';}
function syncProgress(){
  const progress=readMemories.size;
  galaxy?.setProgress?.(progress);
  document.body.dataset.progress=String(progress);
  anchors?.forEach?.((anchor,i)=>anchor.element.classList.toggle('is-read',readMemories.has(i)));
  $('hero-art').classList.toggle('constellation-complete',progress===3);
}
function dismissIntro(){
  clearTimeout(introTimer);$('gift-intro').hidden=true;document.body.classList.remove('intro-active');
  window.scrollTo({top:0,behavior:paused?'instant':'smooth'});setTimeout(()=>$('envelope').focus({preventScroll:true}),0);
}
function showGiftIntro(){
  if(!shared)return;$('gift-intro').hidden=false;document.body.classList.add('intro-active');
  clearTimeout(introTimer);introTimer=setTimeout(dismissIntro,paused?500:2600);
}
function renderPage(){
  document.body.dataset.theme=gift.theme;document.body.classList.toggle('gift-mode',shared);
  $('gift-indicator').hidden=!shared;
  if(shared){
    const heading=$('hero-title');heading.replaceChildren(document.createTextNode('Một vũ trụ nhỏ,'),document.createElement('br'),document.createTextNode('dành riêng cho'),document.createElement('br'));
    const name=document.createElement('em');name.textContent=gift.to+'.';heading.append(name);
    $('hero-description').textContent='Từ '+gift.from+'. Có vài điều muốn nói với '+gift.to+'.';
    $('gift-indicator').textContent='Bạn có một món quà 20/10';
    $('promise-description').textContent='Có một lời hẹn được gửi cùng món quà này.';
    $('promise-from').textContent='Từ '+gift.from+' — một điều muốn cùng '+gift.to+' thực hiện.';
    $('keepsakes-description').textContent='Ba mục nhỏ. Mở theo thứ tự nào cũng được.';
    document.title='Gửi '+gift.to+' · Một món quà 20.10';
  }else{
    $('hero-title').replaceWith(initialHero.cloneNode(true));$('hero-description').textContent=defaultHeroDescription;
    $('promise-description').textContent=defaultPromiseDescription;$('promise-from').textContent='Một lời nhắc nhỏ, để điều tốt đẹp không chỉ nằm trên màn hình.';
    $('keepsakes-description').textContent='Mở từng mục theo thứ tự nào cũng được. Ngân hà sẽ thay đổi theo những gì bạn đã đọc.';
    document.title='20.10 · Một vài điều muốn nói';
  }
  $('promise-text').textContent='“'+gift.promise+'”';
  $('letter-to').textContent='Gửi '+gift.to+',';$('letter-body').textContent=gift.message;$('letter-from').textContent=gift.from;
  $('letter-sample-note').hidden=shared;
  $('finale-name').textContent=gift.to;$('finale-message').textContent=gift.finalMessage;$('finale-from').textContent='— '+gift.from;
  $('qr-recipient').textContent='Một lời nhắn dành cho '+gift.to;
  readMemories.clear();promiseSeen=false;renderMemoryCards();syncProgress();
}
function renderMemoryCards(){
  $('memory-grid').replaceChildren();
  gift.starTitles.forEach((title,i)=>{
    const button=document.createElement('button');button.type='button';button.className='memory-card';button.dataset.memory=String(i);
    button.setAttribute('aria-label','Mở '+title);
    const top=document.createElement('span');top.className='memory-card-top';
    const label=document.createElement('span');label.textContent='0'+(i+1)+' / '+NOTE_LABELS[i];
    const icon=document.createElement('span');icon.className='memory-icon';icon.textContent=['✧','✳','✦'][i];icon.setAttribute('aria-hidden','true');top.append(label,icon);
    const h=document.createElement('h3');h.textContent=title;
    const p=document.createElement('p');p.textContent=NOTE_TEASERS[i];
    const bottom=document.createElement('span');bottom.className='memory-card-bottom';
    const hint=document.createElement('span');hint.textContent='Chạm để mở';const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');bottom.append(hint,arrow);
    button.append(top,h,p,bottom);button.addEventListener('click',()=>openMemory(i));$('memory-grid').append(button);
  });
  $('memory-hint').textContent='Chạm từng ngôi sao để mở điều muốn nói.';
}
function openMemory(index){
  currentMemory=(index+3)%3;readMemories.add(currentMemory);
  $('memory-number').textContent='0'+(currentMemory+1)+' / '+gift.starTitles[currentMemory].toLocaleUpperCase('vi');
  $('memory-title').textContent=gift.starTitles[currentMemory];$('memory-body').textContent=gift.notes[currentMemory];
  $('memory-sender').textContent='— '+gift.from;
  $('next-memory').textContent=currentMemory===2?'Đọc lời hẹn ↓':'Điều tiếp theo →';
  const card=$('memory-grid').children[currentMemory];card.classList.add('is-read');card.querySelector('.memory-card-bottom span').textContent='Đã mở · '+(currentMemory+1)+'/3';
  $('memory-hint').textContent=readMemories.size===3?'Ba điểm đã nối lại. Còn một lời hẹn đang chờ bạn.':`Đã mở ${readMemories.size} / 3 điều muốn nói.`;
  syncProgress();openDialog($('memory-dialog'));audio.chime();
}
$('next-memory').addEventListener('click',()=>{if(currentMemory<2)openMemory(currentMemory+1);else{$('memory-dialog').close();setTimeout(()=>document.querySelector('.promise-section').scrollIntoView({behavior:paused?'instant':'smooth',block:'center'}),0);}});
$('memory-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();openMemory(currentMemory+1);}if(e.key==='ArrowLeft'){e.preventDefault();openMemory(currentMemory-1);}});
function openLetter(){
  if(opening)return;
  opening=true;resetLove();$('envelope').classList.add('opening');audio.chime();syncMotion();
  openingTimer=setTimeout(()=>{opening=false;$('envelope').classList.remove('opening');openDialog($('letter-dialog'));},paused?0:650);
}
$('open-letter').addEventListener('click',openLetter);$('envelope').addEventListener('click',openLetter);
$('letter-next').addEventListener('click',()=>openMemory(0));
async function download(g,button){button.disabled=true;try{await downloadPostcard(g);notify('Thiệp đã sẵn sàng. Kiểm tra mục tải xuống của bạn nhé.');}catch{notify('Chưa tải được thiệp. Bạn vẫn có thể sao chép link món quà.');}finally{button.disabled=false;}}
$('download-letter').addEventListener('click',e=>download(gift,e.currentTarget));
const anchors=CONFIG.anchors.map(({label,position},index)=>{
  const element=document.createElement('button');element.type='button';element.className='star-node';element.hidden=true;element.setAttribute('aria-label','Ngôi sao '+label+' — mở điều muốn nói');
  const dot=document.createElement('span');dot.className='star-point';dot.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.textContent=gift.starTitles?.[index]||label;element.append(dot,text);element.addEventListener('click',()=>openMemory(index));$('star-labels').append(element);return{element,position,text,index};
});
anchors.forEach((a,i)=>a.text.textContent=gift.starTitles[i]);
$('sound-button').addEventListener('click',async()=>{const button=$('sound-button');button.disabled=true;try{const enabled=await audio.toggle();button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Tắt nhạc nền':'Bật nhạc nền');$('sound-label').textContent=enabled?'Tắt nhạc':'Bật nhạc';}catch{notify('Chưa bật được nhạc. Bạn thử chạm lại một lần nhé.');}finally{button.disabled=false;}});
$('love-button').addEventListener('click',()=>{
  if(!galaxy){openLetter();return;}
  love=!love;galaxy.setLove(love);$('hero-art').classList.toggle('love-active',love);$('envelope').tabIndex=love?-1:0;$('love-button').setAttribute('aria-pressed',String(love));$('love-label').textContent=love?'Tất cả yêu thương, dành cho bạn · ↺':'Chạm để nở yêu thương';if(love)audio.chime();
});
$('motion-button').addEventListener('click',()=>{paused=!paused;syncMotion();});
$('reset-button').addEventListener('click',()=>{resetLove();galaxy?.resetView();});
$('quality-select').addEventListener('change',e=>{try{galaxy?.setQuality(e.target.value);}catch{notify('Chưa đổi được chất lượng hiệu ứng. Các lời nhắn vẫn đọc được bình thường.');}});
motionPreference.addEventListener('change',e=>{paused=e.matches;if(galaxy)galaxy.reducedMotion=e.matches;syncMotion();});
// Small pointer parallax stays on the envelope, never on the page text.
$('hero-art').addEventListener('pointermove',e=>{
  if(paused||e.pointerType!=='mouse'||dialogs.some(d=>d.open))return;
  const r=$('hero-art').getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  $('envelope-stage').style.setProperty('--tilt-x',`${6-y*13}deg`);$('envelope-stage').style.setProperty('--tilt-y',`${-12+x*22}deg`);
});
$('hero-art').addEventListener('pointerleave',()=>{$('envelope-stage').style.removeProperty('--tilt-x');$('envelope-stage').style.removeProperty('--tilt-y');});

function valuesFromForm(){const d=new FormData(form);return{v:3,to:d.get('to'),from:d.get('from'),message:d.get('message'),notes:[d.get('note0'),d.get('note1'),d.get('note2')],starTitles:[d.get('title0'),d.get('title1'),d.get('title2')],promise:d.get('promise'),finalMessage:d.get('finalMessage'),theme:d.get('theme')};}
function fillForm(data){
  for(const key of ['to','from','message','promise','finalMessage'])form.elements.namedItem(key).value=typeof data[key]==='string'?data[key].slice(0,form.elements.namedItem(key).maxLength):'';
  [0,1,2].forEach(i=>{form.elements.namedItem('note'+i).value=typeof data.notes?.[i]==='string'?data.notes[i].slice(0,120):'';form.elements.namedItem('title'+i).value=typeof data.starTitles?.[i]==='string'?data.starTitles[i].slice(0,50):DEFAULT_STAR_TITLES[i];});
  form.elements.namedItem('theme').value=THEMES.includes(data.theme)?data.theme:'gold';updatePreview();
}
function updatePreview(){const d=valuesFromForm();$('preview-to').textContent=d.to?'Gửi '+d.to+',':'Gửi bạn,';$('preview-message').textContent=d.message||'Nội dung lá thư sẽ hiện ở đây…';$('preview-from').textContent=d.from?'— '+d.from:'— Người gửi';$('message-count').textContent=d.message.length+' / 700';$('final-count').textContent=d.finalMessage.length+' / 160';$('preview-paper')?.setAttribute('data-theme',d.theme);}
function saveDraft(){clearTimeout(draftTimer);try{localStorage.setItem(DRAFT_KEY,JSON.stringify(valuesFromForm()));$('draft-status').textContent='Đã lưu bản nháp trên thiết bị này.';}catch{$('draft-status').textContent='Thiết bị chưa lưu được bản nháp. Hãy tạo và giữ link trước khi đóng trang.';}}
function hideTemplateConfirm(){templatePending=false;$('template-notice').hidden=true;$('confirm-template').hidden=true;}
form.addEventListener('input',()=>{updatePreview();hideTemplateConfirm();$('draft-status').textContent='Đang lưu bản nháp…';clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,350);});
function openComposer(){hideTemplateConfirm();openDialog($('composer-dialog'));}
document.querySelectorAll('[data-compose]').forEach(button=>button.addEventListener('click',openComposer));
function applyTemplate(){const template=TEMPLATES[$('template-select').value],current=valuesFromForm();fillForm({...template,to:current.to.trim()||template.to,from:current.from.trim()||template.from,theme:current.theme,v:3,starTitles:[...DEFAULT_STAR_TITLES],finalMessage:'Chúc bạn có một ngày thật dễ chịu.'});hideTemplateConfirm();saveDraft();}
$('use-template').addEventListener('click',()=>{const d=valuesFromForm();if(d.message.trim()||d.notes.some(n=>n.trim())||d.promise.trim()){templatePending=true;$('template-notice').hidden=false;$('confirm-template').hidden=false;}else applyTemplate();});
$('confirm-template').addEventListener('click',()=>{if(templatePending)applyTemplate();});
$('template-select').addEventListener('change',hideTemplateConfirm);
form.addEventListener('submit',event=>{
  event.preventDefault();
  try{preparedGift=validateGift(valuesFromForm());}catch(error){notify(error.message);return;}
  saveDraft();$('share-link').value=giftLink(preparedGift);$('share-description').textContent='Món quà dành tặng '+preparedGift.to+', từ '+preparedGift.from+'.';$('native-share').hidden=!navigator.share;openDialog($('share-dialog'));
});
$('share-link').addEventListener('click',e=>e.currentTarget.select());
$('copy-link').addEventListener('click',async()=>{
  const input=$('share-link');
  try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(input.value);notify('Đã sao chép link. Gửi cho người bạn thương nhé.');}
  catch{input.focus();input.select();input.setSelectionRange(0,input.value.length);notify('Chạm giữ hoặc nhấn Ctrl/Cmd+C để sao chép toàn bộ link đã chọn.');}
});
$('native-share').addEventListener('click',async()=>{if(!preparedGift)return;try{await navigator.share({title:'Gửi '+preparedGift.to+' · 20.10',text:'Một món quà nhỏ, dành riêng cho bạn.',url:$('share-link').value});}catch(error){if(error.name!=='AbortError')notify('Bạn có thể dùng nút Sao chép link để gửi món quà.');}});
$('download-gift').addEventListener('click',e=>{if(preparedGift)download(preparedGift,e.currentTarget);});
$('edit-gift').addEventListener('click',openComposer);
$('preview-gift').addEventListener('click',()=>{if(!preparedGift)return;gift=validateGift(preparedGift);shared=true;history.pushState(null,'','#gift='+encodeGift(gift));renderPage();anchors.forEach((a,i)=>a.text.textContent=gift.starTitles[i]);$('share-dialog').close();resetLove();window.scrollTo({top:0,behavior:paused?'instant':'smooth'});showGiftIntro();notify('Đây là món quà người nhận sẽ nhìn thấy.');});
function loadFromLocation(){
  const hash=location.hash;
  if(hash.startsWith('#gift=')){
    try{gift=decodeGift(hash.slice(6));shared=true;}catch(error){gift={...SAMPLE,notes:[...SAMPLE.notes],starTitles:[...SAMPLE.starTitles]};shared=false;notify(error.message);}
  }else if(shared){gift={...SAMPLE,notes:[...SAMPLE.notes],starTitles:[...SAMPLE.starTitles]};shared=false;}
  renderPage();anchors.forEach((a,i)=>a.text.textContent=gift.starTitles[i]);resetLove();
}
window.addEventListener('hashchange',loadFromLocation);
window.addEventListener('popstate',loadFromLocation);
try{const raw=localStorage.getItem(DRAFT_KEY)||localStorage.getItem(LEGACY_DRAFT_KEY);if(raw&&raw.length<16000){const draft=JSON.parse(raw);if(draft&&typeof draft==='object'&&[2,3].includes(draft.v)){fillForm(validateGift(draft));$('draft-status').textContent='Đã khôi phục bản nháp trên thiết bị này.';}}}catch{$('draft-status').textContent='Bạn vẫn có thể viết và gửi quà khi không lưu được bản nháp.';}
if(!form.elements.namedItem('title0').value)fillForm(SAMPLE);
loadFromLocation();updatePreview();syncMotion();
$('intro-open').addEventListener('click',dismissIntro);
if(shared)showGiftIntro();

function markPromiseSeen(){promiseSeen=true;$('final-sequence').classList.toggle('is-ready',readMemories.size===3);}
const promiseObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))markPromiseSeen();},{threshold:.45});promiseObserver.observe(document.querySelector('.promise-section'));
function runFinale(){
  if(readMemories.size<3){notify('Mở đủ ba điều trước nhé.');document.querySelector('#keepsakes').scrollIntoView({behavior:paused?'instant':'smooth'});return;}
  $('finale').hidden=false;document.body.classList.add('finale-running');love=true;galaxy?.setProgress?.(3);galaxy?.setLove(true);audio.chime();
  clearTimeout(finaleTimer);finaleTimer=setTimeout(()=>document.body.classList.add('finale-copy-visible'),paused?40:1900);
}
$('final-sequence').addEventListener('click',runFinale);
$('replay-gift').addEventListener('click',()=>{$('finale').hidden=true;document.body.classList.remove('finale-running','finale-copy-visible');resetLove();window.scrollTo({top:0,behavior:paused?'instant':'smooth'});});
$('finale-download').addEventListener('click',e=>download(gift,e.currentTarget));

async function drawQr(){
  if(!preparedGift)preparedGift=gift;
  const lib=window.QRCode;if(!lib?.toCanvas)throw new Error('QR library unavailable');
  const link=$('share-link').value||giftLink(preparedGift);
  await lib.toCanvas($('qr-canvas'),link,{width:320,margin:3,errorCorrectionLevel:'M',color:{dark:'#101010',light:'#ffffff'}});
}
$('show-qr').addEventListener('click',async()=>{try{await drawQr();openDialog($('qr-dialog'));}catch{notify('Chưa tạo được QR. Bạn vẫn có thể dùng link món quà.');}});
$('download-qr').addEventListener('click',async()=>{try{await drawQr();const a=document.createElement('a');a.download='20-10-qr.png';a.href=$('qr-canvas').toDataURL('image/png');a.click();}catch{notify('Chưa tải được QR.');}});
$('download-qr-card').addEventListener('click',async()=>{try{await drawQr();const c=document.createElement('canvas');c.width=900;c.height=1120;const x=c.getContext('2d');x.fillStyle='#07151b';x.fillRect(0,0,c.width,c.height);x.fillStyle='#e4c48f';x.font='46px Georgia';x.textAlign='center';x.fillText('20.10',450,110);x.fillStyle='#f3f0e7';x.font='34px Arial';x.fillText('Một lời nhắn dành cho '+(preparedGift?.to||gift.to),450,180);x.fillStyle='#fff';x.fillRect(245,260,410,410);x.drawImage($('qr-canvas'),275,290,350,350);x.fillStyle='#c8d2cd';x.font='26px Arial';x.fillText('Quét để mở',450,745);x.font='20px Arial';x.fillStyle='#8fa39c';x.fillText('20.10 · After The Letter',450,1030);const a=document.createElement('a');a.download='20-10-qr-card.png';a.href=c.toDataURL('image/png');a.click();}catch{notify('Chưa tải được card QR.');}});

let fallbackPromise=null;
async function useFallback(){
  if(fallbackPromise)return fallbackPromise;
  fallbackPromise=(async()=>{
    galaxy?.dispose();galaxy=null;
    const {Galaxy}=await import('./galaxy-fallback.js?v=3.0.0');
    const canvas=$('galaxy-canvas').cloneNode(false);$('galaxy-canvas').replaceWith(canvas);
    galaxy=new Galaxy({canvas,container:$('universe'),config:CONFIG.galaxy,anchors,reducedMotion:motionPreference.matches});
    galaxy.setQuality($('quality-select').value);galaxy.setLove(love);syncMotion();
    document.body.dataset.renderer='canvas';$('scene-status').hidden=true;
  })().catch(()=>{
    document.body.classList.add('scene-fallback');document.body.dataset.renderer='static';$('scene-status').textContent='Ngân hà đang nghỉ. Những lời thương vẫn ở đây.';$('scene-status').hidden=false;
    anchors.forEach(a=>{a.element.hidden=true;});['quality-select','reset-button'].forEach(id=>{$(id).disabled=true;});
  });return fallbackPromise;
}
async function boot(){
  try{
    const {Galaxy}=await import('./galaxy.js?v=3.0.0');
    galaxy=new Galaxy({canvas:$('galaxy-canvas'),container:$('universe'),config:CONFIG.galaxy,anchors,reducedMotion:motionPreference.matches,onUnavailable:reason=>{if(reason)queueMicrotask(useFallback);}});
    document.body.dataset.renderer='webgl';$('scene-status').hidden=true;galaxy.setLove(love);syncMotion();
  }catch{await useFallback();}
}
boot();
// Persist pending draft edits before mobile browsers suspend the page.
document.addEventListener('visibilitychange',()=>{if(document.hidden&&draftTimer){saveDraft();draftTimer=null;}});
window.addEventListener('pagehide',event=>{if(draftTimer)saveDraft();if(!event.persisted){clearTimeout(openingTimer);galaxy?.dispose();audio.dispose();}});
