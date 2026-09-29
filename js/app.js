import { CONFIG } from './config.js?v=3.0.0';
import { AmbientAudio } from './audio.js?v=2.0.1';
import { SAMPLE, TEMPLATES, DEFAULT_NOTE_TITLES, NOTE_LABELS, NOTE_TEASERS, THEMES, encodeGift, decodeGift, validateGift, giftLink } from './gift.js?v=3.0.0';
import { downloadPostcard } from './postcard.js?v=3.0.0';

const $=id=>document.getElementById(id);
const audio=new AmbientAudio();
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const form=$('gift-form'), dialogs=[...document.querySelectorAll('dialog')];
const DRAFT_KEY='20-10-letter-draft-v3';
const LEGACY_DRAFT_KEY='20-10-letter-draft-v2';
let gift=validateGift(SAMPLE), shared=false, preparedGift=null;
let galaxy=null, paused=motionPreference.matches, love=false, currentMemory=0;
let toastTimer,openingTimer,draftTimer,introTimer,previousFocus=null,opening=false,templatePending=false;
let letterRead=false,promiseRead=false,finalRunning=false,introShown=false,lastGiftHash='';
const finalTimers=[];
const readMemories=new Set();
const initialHero=$('hero-title').cloneNode(true);
const defaultHeroDescription='Không cần viết thật hay. Chỉ cần là điều bạn thực sự muốn nói.';
const defaultPromiseDescription='Một lời hẹn cụ thể đôi khi đáng giá hơn một lời chúc dài.';

// Section navigation must not replace the fragment that carries a received gift.
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const target=document.querySelector(link.getAttribute('href'));
  if(target){event.preventDefault();target.scrollIntoView({behavior:paused?'instant':'smooth'});if(link.classList.contains('skip-link')){target.tabIndex=-1;target.focus({preventScroll:true});}}
}));

function notify(message){
  clearTimeout(toastTimer);
  const toast=$('toast');toast.textContent=message;toast.hidden=false;
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
function resetLove(){
  love=false;galaxy?.setLove(false);$('hero-art').classList.remove('love-active');$('envelope').tabIndex=0;
  $('love-button').setAttribute('aria-pressed','false');$('love-label').textContent='Xem chuyển động';
}
function clearFinalTimers(){while(finalTimers.length)clearTimeout(finalTimers.pop());}
function resetStory(){
  readMemories.clear();letterRead=false;promiseRead=false;finalRunning=false;clearFinalTimers();
  document.body.classList.remove('final-cinematic');$('final-scene').hidden=true;$('final-scene').classList.remove('is-visible');
  syncStoryProgress();
}
function syncStoryProgress(){
  const count=readMemories.size;
  $('hero-art').dataset.progress=String(count);document.body.dataset.storyProgress=String(count);
  anchors.forEach((anchor,index)=>anchor.element.classList.toggle('is-read',readMemories.has(index)));
  const complete=count===3;
  $('constellation').classList.toggle('is-ready',complete);
  $('constellation-continue').hidden=!complete;
  $('memory-hint').textContent=complete?'Ba phần đã nối lại. Khi muốn, bạn có thể tiếp tục.':count?`Đã mở ${count} / 3 điều muốn nói.`:'Chạm từng ngôi sao để mở điều muốn nói.';
  $('promise-continue').classList.toggle('is-ready',letterRead&&complete);
}
function renderPage(){
  document.body.dataset.theme=gift.theme;document.body.classList.toggle('gift-mode',shared);
  $('gift-indicator').hidden=!shared;
  if(shared){
    const heading=$('hero-title');heading.replaceChildren(document.createTextNode('Một vài điều'),document.createElement('br'),document.createTextNode('muốn nói với'),document.createElement('br'));
    const name=document.createElement('em');name.textContent=gift.to+'.';heading.append(name);
    $('hero-description').textContent='Không dài đâu. Cứ mở từ từ nhé.';
    $('gift-indicator').textContent='20 · 10  /  MỘT LỜI NHẮN DÀNH CHO BẠN';
    $('promise-description').textContent='Có một lời hẹn được gửi cùng món quà này.';
    $('promise-from').textContent='— '+gift.from;
    $('keepsakes-description').textContent='Ba chuyện nhỏ '+gift.from+' muốn gửi đến '+gift.to+'.';
    document.title='Gửi '+gift.to+' · 20.10';
  }else{
    $('hero-title').replaceWith(initialHero.cloneNode(true));$('hero-description').textContent=defaultHeroDescription;
    $('promise-description').textContent=defaultPromiseDescription;$('promise-from').textContent='Một lời hẹn nên đủ cụ thể để có thể thực hiện.';
    $('keepsakes-description').textContent='Không cần chuyện lớn. Ba điều ngắn là đủ.';
    document.title='20.10 · Một vài điều muốn nói';
  }
  $('promise-text').textContent='“'+gift.promise+'”';
  $('letter-to').textContent='Gửi '+gift.to+',';$('letter-body').textContent=gift.message;$('letter-from').textContent=gift.from;
  $('letter-sample-note').hidden=shared;
  $('final-name').textContent=gift.to;$('final-message').textContent=gift.finalMessage;$('final-from').textContent='— '+gift.from;
  renderMemoryCards();syncAnchorTitles();
}
function renderMemoryCards(){
  $('memory-grid').replaceChildren();
  gift.noteTitles.forEach((title,i)=>{
    const button=document.createElement('button');button.type='button';button.className='memory-card';button.dataset.memory=String(i);
    button.setAttribute('aria-label','Mở '+title);
    const top=document.createElement('span');top.className='memory-card-top';
    const label=document.createElement('span');label.textContent='0'+(i+1)+' / '+NOTE_LABELS[i];
    const icon=document.createElement('span');icon.className='memory-icon';icon.textContent=['✧','✳','✦'][i];icon.setAttribute('aria-hidden','true');top.append(label,icon);
    const h=document.createElement('h3');h.textContent=title;
    const p=document.createElement('p');p.textContent=NOTE_TEASERS[i];
    const bottom=document.createElement('span');bottom.className='memory-card-bottom';
    const hint=document.createElement('span');hint.textContent='Mở';const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');bottom.append(hint,arrow);
    button.append(top,h,p,bottom);button.addEventListener('click',()=>openMemory(i));$('memory-grid').append(button);
  });
  syncStoryProgress();
}
function syncAnchorTitles(){
  anchors.forEach((anchor,index)=>{
    const title=gift.noteTitles[index]||DEFAULT_NOTE_TITLES[index];
    anchor.element.querySelector('[data-star-text]').textContent=title;
    anchor.element.setAttribute('aria-label','Ngôi sao '+title+' — mở điều muốn nói');
  });
}
function openMemory(index){
  currentMemory=(index+3)%3;readMemories.add(currentMemory);
  $('memory-number').textContent='0'+(currentMemory+1)+' / '+NOTE_LABELS[currentMemory];
  $('memory-title').textContent=gift.noteTitles[currentMemory];$('memory-body').textContent=gift.notes[currentMemory];
  $('memory-sender').textContent='— '+gift.from;
  $('next-memory').textContent=currentMemory===2?'Đến lời hẹn ↓':'Điều tiếp theo →';
  const card=$('memory-grid').children[currentMemory];card.classList.add('is-read');card.querySelector('.memory-card-bottom span').textContent='Đã mở';
  syncStoryProgress();openDialog($('memory-dialog'));audio.chime();
}
$('next-memory').addEventListener('click',()=>{if(currentMemory<2)openMemory(currentMemory+1);else{$('memory-dialog').close();setTimeout(()=>document.querySelector('.promise-section').scrollIntoView({behavior:paused?'instant':'smooth',block:'center'}),0);}});
$('memory-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();openMemory(currentMemory+1);}if(e.key==='ArrowLeft'){e.preventDefault();openMemory(currentMemory-1);}});
function openLetter(){
  if(opening)return;
  opening=true;resetLove();$('envelope').classList.add('opening');audio.chime();syncMotion();
  openingTimer=setTimeout(()=>{opening=false;letterRead=true;$('envelope').classList.remove('opening');syncStoryProgress();openDialog($('letter-dialog'));},paused?0:650);
}
$('open-letter').addEventListener('click',openLetter);$('envelope').addEventListener('click',openLetter);
$('letter-next').addEventListener('click',()=>openMemory(0));
async function download(g,button){button.disabled=true;try{await downloadPostcard(g);notify('Thiệp đã sẵn sàng.');}catch{notify('Chưa tải được thiệp. Bạn vẫn có thể sao chép link món quà.');}finally{button.disabled=false;}}
$('download-letter').addEventListener('click',e=>download(gift,e.currentTarget));
const anchors=CONFIG.anchors.map(({position},index)=>{
  const element=document.createElement('button');element.type='button';element.className='star-node';element.hidden=true;
  const dot=document.createElement('span');dot.className='star-point';dot.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.dataset.starText='';text.textContent=DEFAULT_NOTE_TITLES[index];element.append(dot,text);
  element.addEventListener('click',()=>openMemory(index));$('star-labels').append(element);return{element,position};
});
$('sound-button').addEventListener('click',async()=>{const button=$('sound-button');button.disabled=true;try{const enabled=await audio.toggle();button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Tắt nhạc nền':'Bật nhạc nền');$('sound-label').textContent=enabled?'Tắt nhạc':'Bật nhạc';}catch{notify('Chưa bật được âm thanh. Bạn thử chạm lại một lần nhé.');}finally{button.disabled=false;}});
$('love-button').addEventListener('click',()=>{
  if(!galaxy){openLetter();return;}
  love=!love;galaxy.setLove(love);$('hero-art').classList.toggle('love-active',love);$('envelope').tabIndex=love?-1:0;$('love-button').setAttribute('aria-pressed',String(love));$('love-label').textContent=love?'Trở lại ngân hà · ↺':'Xem chuyển động';if(love)audio.chime();
});
$('motion-button').addEventListener('click',()=>{paused=!paused;syncMotion();});
$('reset-button').addEventListener('click',()=>{resetLove();galaxy?.resetView();});
$('quality-select').addEventListener('change',e=>{try{galaxy?.setQuality(e.target.value);}catch{notify('Chưa đổi được chất lượng hiệu ứng. Nội dung vẫn hoạt động bình thường.');}});
motionPreference.addEventListener('change',e=>{paused=e.matches;if(galaxy)galaxy.reducedMotion=e.matches;syncMotion();});
$('hero-art').addEventListener('pointermove',e=>{
  if(paused||e.pointerType!=='mouse'||dialogs.some(d=>d.open))return;
  const r=$('hero-art').getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  $('envelope-stage').style.setProperty('--tilt-x',`${6-y*13}deg`);$('envelope-stage').style.setProperty('--tilt-y',`${-12+x*22}deg`);
});
$('hero-art').addEventListener('pointerleave',()=>{$('envelope-stage').style.removeProperty('--tilt-x');$('envelope-stage').style.removeProperty('--tilt-y');});
$('hero-art').addEventListener('pointerdown',e=>{
  if(paused)return;const spark=document.createElement('i');spark.className='click-spark';spark.style.left=e.offsetX+'px';spark.style.top=e.offsetY+'px';$('hero-art').append(spark);setTimeout(()=>spark.remove(),700);
});

function valuesFromForm(){
  const d=new FormData(form);return{v:3,to:d.get('to'),from:d.get('from'),message:d.get('message'),noteTitles:[d.get('noteTitle0'),d.get('noteTitle1'),d.get('noteTitle2')],notes:[d.get('note0'),d.get('note1'),d.get('note2')],promise:d.get('promise'),finalMessage:d.get('finalMessage'),theme:d.get('theme')};
}
function fillForm(data){
  let normalized;try{normalized=validateGift(data);}catch{normalized=validateGift(SAMPLE);}
  for(const key of ['to','from','message','promise','finalMessage']){const el=form.elements.namedItem(key);el.value=normalized[key].slice(0,el.maxLength||normalized[key].length);}
  [0,1,2].forEach(i=>{
    form.elements.namedItem('noteTitle'+i).value=normalized.noteTitles[i].slice(0,50);
    form.elements.namedItem('note'+i).value=normalized.notes[i].slice(0,120);
  });
  form.elements.namedItem('theme').value=THEMES.includes(normalized.theme)?normalized.theme:'gold';updatePreview();
}
function updatePreview(){
  const d=valuesFromForm();$('preview-to').textContent=d.to?'Gửi '+d.to+',':'Gửi bạn,';$('preview-message').textContent=d.message||'Lời nhắn của bạn sẽ hiện ở đây…';$('preview-from').textContent=d.from?'— '+d.from:'— Từ bạn';$('message-count').textContent=d.message.length+' / 700';$('final-count').textContent=d.finalMessage.length+' / 160';$('preview-paper')?.setAttribute('data-theme',d.theme);
}
function saveDraft(){clearTimeout(draftTimer);try{localStorage.setItem(DRAFT_KEY,JSON.stringify(valuesFromForm()));$('draft-status').textContent='Đã lưu bản nháp trên thiết bị này.';}catch{$('draft-status').textContent='Thiết bị chưa lưu được bản nháp. Hãy tạo và giữ link trước khi đóng trang.';}}
function hideTemplateConfirm(){templatePending=false;$('template-notice').hidden=true;$('confirm-template').hidden=true;}
form.addEventListener('input',()=>{updatePreview();hideTemplateConfirm();$('draft-status').textContent='Đang lưu bản nháp…';clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,350);});
function openComposer(){hideTemplateConfirm();openDialog($('composer-dialog'));}
document.querySelectorAll('[data-compose]').forEach(button=>button.addEventListener('click',openComposer));
function applyTemplate(){
  const template=TEMPLATES[$('template-select').value],current=valuesFromForm();
  fillForm({...template,to:current.to.trim()||template.to,from:current.from.trim()||template.from,theme:current.theme,v:3});hideTemplateConfirm();saveDraft();
}
$('use-template').addEventListener('click',()=>{const d=valuesFromForm();if(d.message.trim()||d.notes.some(n=>n.trim())||d.promise.trim()){templatePending=true;$('template-notice').hidden=false;$('confirm-template').hidden=false;}else applyTemplate();});
$('confirm-template').addEventListener('click',()=>{if(templatePending)applyTemplate();});
$('template-select').addEventListener('change',hideTemplateConfirm);

function getQrCanvas(){return $('qr-code').querySelector('canvas');}
function renderQr(link){
  const box=$('qr-code'),status=$('qr-status');box.replaceChildren();status.textContent='';
  try{
    if(!window.QRCode)throw new Error('missing');
    new window.QRCode(box,{text:link,width:240,height:240,colorDark:'#111111',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.L});
    $('download-qr').disabled=false;$('download-qr-card').disabled=false;
  }catch{
    box.textContent='Link này quá dài để tạo QR ổn định.';status.textContent='Bạn vẫn có thể sao chép link trực tiếp.';$('download-qr').disabled=true;$('download-qr-card').disabled=true;
  }
}
function downloadCanvas(canvas,name){canvas.toBlob(blob=>{if(!blob){notify('Chưa tạo được ảnh.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);},'image/png');}
$('download-qr').addEventListener('click',()=>{const canvas=getQrCanvas();if(canvas)downloadCanvas(canvas,'20-10-qr.png');});
$('download-qr-card').addEventListener('click',()=>{
  const qr=getQrCanvas();if(!qr||!preparedGift)return;
  const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');
  ctx.fillStyle='#f7f4ec';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#d6cfbf';ctx.lineWidth=2;ctx.strokeRect(58,58,964,1234);
  ctx.fillStyle='#1b2528';ctx.textAlign='center';ctx.font='600 42px "Be Vietnam Pro",Arial,sans-serif';ctx.fillText('20.10',540,170);
  ctx.font='400 50px "Playfair Display",Georgia,serif';ctx.fillText('Một lời nhắn dành cho '+preparedGift.to,540,265);
  ctx.fillStyle='#fff';ctx.fillRect(245,360,590,590);ctx.drawImage(qr,280,395,520,520);
  ctx.fillStyle='#4d5b5b';ctx.font='400 30px "Be Vietnam Pro",Arial,sans-serif';ctx.fillText('Quét để mở',540,1020);
  ctx.font='400 24px "Be Vietnam Pro",Arial,sans-serif';ctx.fillText('— '+preparedGift.from,540,1120);downloadCanvas(c,'20-10-qr-card.png');
});

form.addEventListener('submit',event=>{
  event.preventDefault();
  try{preparedGift=validateGift(valuesFromForm());}catch(error){notify(error.message);return;}
  saveDraft();const link=giftLink(preparedGift);$('share-link').value=link;$('share-description').textContent='Món quà dành cho '+preparedGift.to+', từ '+preparedGift.from+'.';$('native-share').hidden=!navigator.share;renderQr(link);openDialog($('share-dialog'));
});
$('share-link').addEventListener('click',e=>e.currentTarget.select());
$('copy-link').addEventListener('click',async()=>{
  const input=$('share-link');
  try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(input.value);notify('Đã sao chép link.');}
  catch{input.focus();input.select();input.setSelectionRange(0,input.value.length);notify('Nhấn Ctrl/Cmd+C để sao chép toàn bộ link đã chọn.');}
});
$('native-share').addEventListener('click',async()=>{if(!preparedGift)return;try{await navigator.share({title:'Gửi '+preparedGift.to+' · 20.10',text:'Có một thứ dành cho bạn.',url:$('share-link').value});}catch(error){if(error.name!=='AbortError')notify('Bạn có thể dùng nút Sao chép link để gửi món quà.');}});
$('download-gift').addEventListener('click',e=>{if(preparedGift)download(preparedGift,e.currentTarget);});
$('edit-gift').addEventListener('click',openComposer);
$('preview-gift').addEventListener('click',()=>{if(!preparedGift)return;gift=validateGift(preparedGift);shared=true;history.pushState(null,'','#gift='+encodeGift(gift));resetStory();renderPage();$('share-dialog').close();resetLove();window.scrollTo({top:0,behavior:paused?'instant':'smooth'});showIntro(true);});

function dismissIntro(){clearTimeout(introTimer);$('intro-screen').classList.add('is-leaving');setTimeout(()=>{$('intro-screen').hidden=true;$('intro-screen').classList.remove('is-leaving');$('open-letter').focus({preventScroll:true});},paused?0:450);}
function showIntro(force=false){
  if(!shared||(!force&&introShown))return;introShown=true;const intro=$('intro-screen');intro.hidden=false;intro.classList.remove('is-leaving');
  introTimer=setTimeout(dismissIntro,paused?250:1800);
}
$('intro-continue').addEventListener('click',dismissIntro);$('intro-screen').addEventListener('click',event=>{if(event.target===$('intro-screen'))dismissIntro();});

$('constellation-continue').addEventListener('click',()=>document.querySelector('.promise-section').scrollIntoView({behavior:paused?'instant':'smooth',block:'center'}));
$('promise-continue').addEventListener('click',()=>{
  promiseRead=true;syncStoryProgress();
  if(letterRead&&readMemories.size===3)runFinalSequence();
  else{notify('Bạn vẫn còn một phần chưa mở.');document.querySelector(letterRead?'#keepsakes':'.hero').scrollIntoView({behavior:paused?'instant':'smooth'});}
});
function runFinalSequence(){
  if(finalRunning)return;finalRunning=true;dialogs.forEach(d=>{if(d.open)d.close();});document.body.classList.add('final-cinematic');
  document.querySelector('.hero').scrollIntoView({behavior:paused?'instant':'smooth',block:'center'});audio.chime();
  const morphDelay=paused?0:450, revealDelay=paused?80:2600;
  finalTimers.push(setTimeout(()=>{love=true;galaxy?.setLove(true);$('hero-art').classList.add('love-active','story-ending');},morphDelay));
  finalTimers.push(setTimeout(showFinal,revealDelay));
}
function showFinal(){
  const scene=$('final-scene');scene.hidden=false;requestAnimationFrame(()=>scene.classList.add('is-visible'));$('final-read-again').focus({preventScroll:true});
}
function closeFinal(){
  clearFinalTimers();finalRunning=false;$('final-scene').classList.remove('is-visible');$('final-scene').hidden=true;document.body.classList.remove('final-cinematic');$('hero-art').classList.remove('story-ending');resetLove();
}
$('final-read-again').addEventListener('click',()=>{closeFinal();openLetter();});
$('final-save').addEventListener('click',e=>download(gift,e.currentTarget));
$('final-compose').addEventListener('click',()=>{closeFinal();openComposer();});

function loadFromLocation(){
  const hash=location.hash;
  if(hash!==lastGiftHash){introShown=false;lastGiftHash=hash;}
  if(hash.startsWith('#gift=')){
    try{gift=decodeGift(hash.slice(6));shared=true;}catch(error){gift=validateGift(SAMPLE);shared=false;notify(error.message);}
  }else if(shared){gift=validateGift(SAMPLE);shared=false;}
  resetStory();renderPage();resetLove();if(shared)showIntro();
}
window.addEventListener('hashchange',loadFromLocation);window.addEventListener('popstate',loadFromLocation);
try{
  const raw=localStorage.getItem(DRAFT_KEY)||localStorage.getItem(LEGACY_DRAFT_KEY);
  if(raw&&raw.length<16000){const draft=JSON.parse(raw);if(draft&&typeof draft==='object'&&[2,3].includes(draft.v)){fillForm(draft);$('draft-status').textContent=draft.v===2?'Đã nâng bản nháp V2 lên V3 trên thiết bị này.':'Đã khôi phục bản nháp trên thiết bị này.';}}
}catch{$('draft-status').textContent='Bạn vẫn có thể viết và gửi quà khi không lưu được bản nháp.';}
loadFromLocation();updatePreview();syncMotion();


// Magnetic nudge only on fine pointers; keeps the existing hover transform intact.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.button').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      if(paused||button.disabled)return;
      const rect=button.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
      button.style.translate=`${x*3}px ${y*2}px`;
    });
    button.addEventListener('pointerleave',()=>button.style.removeProperty('translate'));
  });
}

// Lightweight reveal: no dependency and disabled by reduced motion CSS.
if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
  document.querySelectorAll('.section,.promise-section,.closing-note').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
}

let fallbackPromise=null;
async function useFallback(){
  if(fallbackPromise)return fallbackPromise;
  fallbackPromise=(async()=>{
    galaxy?.dispose();galaxy=null;
    const {Galaxy}=await import('./galaxy-fallback.js?v=2.0.1');
    const canvas=$('galaxy-canvas').cloneNode(false);$('galaxy-canvas').replaceWith(canvas);
    galaxy=new Galaxy({canvas,container:$('universe'),config:CONFIG.galaxy,anchors,reducedMotion:motionPreference.matches});
    galaxy.setQuality($('quality-select').value);galaxy.setLove(love);syncMotion();
    document.body.dataset.renderer='canvas';$('scene-status').hidden=true;
  })().catch(()=>{
    document.body.classList.add('scene-fallback');document.body.dataset.renderer='static';$('scene-status').textContent='Ngân hà đang nghỉ. Nội dung vẫn ở đây.';$('scene-status').hidden=false;
    anchors.forEach(a=>{a.element.hidden=true;});['quality-select','reset-button'].forEach(id=>{$(id).disabled=true;});
  });return fallbackPromise;
}
async function boot(){
  try{
    const {Galaxy}=await import('./galaxy.js?v=2.0.1');
    galaxy=new Galaxy({canvas:$('galaxy-canvas'),container:$('universe'),config:CONFIG.galaxy,anchors,reducedMotion:motionPreference.matches,onUnavailable:reason=>{if(reason)queueMicrotask(useFallback);}});
    document.body.dataset.renderer='webgl';$('scene-status').hidden=true;galaxy.setLove(love);syncMotion();
  }catch{await useFallback();}
}
boot();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&draftTimer){saveDraft();draftTimer=null;}});
window.addEventListener('pagehide',event=>{if(draftTimer)saveDraft();if(!event.persisted){clearTimeout(openingTimer);clearTimeout(introTimer);clearFinalTimers();galaxy?.dispose();audio.dispose();}});
