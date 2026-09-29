import { validateGift, NOTE_LABELS } from './gift.js?v=3.0.0';
const PALETTES = {gold:['#e4c48f','#0d2629'],rose:['#cf8f99','#24171f'],blue:['#b8d8ee','#0c2032']};
const CARD_SANS='"Be Vietnam Pro","Segoe UI",Arial,sans-serif';
const CARD_SERIF='"Playfair Display",Georgia,"Times New Roman",serif';
async function ensureCardFonts(){
  if(!document.fonts?.load)return;
  await Promise.allSettled([
    document.fonts.load('400 28px "Be Vietnam Pro"'),
    document.fonts.load('400 45px "Playfair Display"'),
    document.fonts.load('italic 45px "Playfair Display"')
  ]);
}
function linesFor(ctx,text,width) {
  const lines=[];
  for(const paragraph of text.split('\n')) {
    if(!paragraph){lines.push('');continue;}
    let line='';
    for(const word of paragraph.split(/\s+/)) {
      const candidate=line?line+' '+word:word;
      if(ctx.measureText(candidate).width<=width){line=candidate;continue;}
      if(line){lines.push(line);line='';}
      for(const char of word){if(ctx.measureText(line+char).width>width && line){lines.push(line);line='';}line+=char;}
    }
    if(line)lines.push(line);
  }
  return lines;
}
function star(ctx,x,y,r){ctx.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,s=i%2?r*.23:r;const px=x+Math.cos(a)*s,py=y+Math.sin(a)*s;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
export async function createPostcard(value) {
  const gift=validateGift(value);await ensureCardFonts();
  const canvas=document.createElement('canvas');canvas.width=1080;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt chưa hỗ trợ lưu thiệp.');
  const width=850;
  ctx.font=`32px ${CARD_SERIF}`;const letter=linesFor(ctx,gift.message,width);
  ctx.font=`28px ${CARD_SANS}`;const notes=gift.notes.map(n=>linesFor(ctx,n,width-55));
  ctx.font=`22px ${CARD_SANS}`;const noteTitles=gift.noteTitles.map(n=>linesFor(ctx,n,width-100));
  ctx.font=`italic 33px ${CARD_SERIF}`;const promise=linesFor(ctx,gift.promise,width-25);
  ctx.font=`30px ${CARD_SERIF}`;const finalMessage=linesFor(ctx,gift.finalMessage,width-25);
  ctx.font=`italic 45px ${CARD_SERIF}`;const recipient=linesFor(ctx,'Gửi '+gift.to+',',width);
  ctx.font=`italic 39px ${CARD_SERIF}`;const sender=linesFor(ctx,gift.from,width);
  canvas.height=Math.max(1640,760+recipient.length*60+letter.length*49+notes.reduce((n,a,i)=>n+a.length*42+noteTitles[i].length*32+85,0)+promise.length*48+finalMessage.length*44+sender.length*52);
  const [accent,bg]=PALETTES[gift.theme];
  const gradient=ctx.createLinearGradient(0,0,1080,canvas.height);gradient.addColorStop(0,bg);gradient.addColorStop(1,'#07151b');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,canvas.height);
  let seed=2010;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(let i=0;i<180;i++){ctx.fillStyle=`rgba(230,216,179,${random()*.24})`;ctx.beginPath();ctx.arc(random()*1080,random()*canvas.height,.5+random()*1.4,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=accent+'44';ctx.lineWidth=1;ctx.strokeRect(48,48,984,canvas.height-96);ctx.strokeRect(61,61,958,canvas.height-122);
  ctx.fillStyle=accent;ctx.font=`24px ${CARD_SANS}`;ctx.fillText('20.10  /  MỘT VÀI ĐIỀU MUỐN NÓI',115,140);star(ctx,922,130,25);
  let y=244;
  const write=(lines,font,color,lineHeight,x=115)=>{ctx.font=font;ctx.fillStyle=color;for(const line of lines){ctx.fillText(line,x,y);y+=lineHeight;}};
  write(recipient,`italic 45px ${CARD_SERIF}`,accent,60);y+=23;
  write(letter,`32px ${CARD_SERIF}`,'#e5eadd',49);y+=37;
  ctx.strokeStyle=accent+'44';ctx.beginPath();ctx.moveTo(115,y);ctx.lineTo(965,y);ctx.stroke();y+=64;
  for(let i=0;i<3;i++){
    ctx.font=`18px ${CARD_SANS}`;ctx.fillStyle=accent;ctx.fillText('0'+(i+1)+'  /  '+NOTE_LABELS[i],115,y);y+=34;
    write(noteTitles[i],`22px ${CARD_SANS}`,'#f0e8d7',32,115);y+=10;
    write(notes[i],`28px ${CARD_SANS}`,'#c6d6c7',42,142);y+=36;
  }
  ctx.font=`18px ${CARD_SANS}`;ctx.fillStyle=accent;ctx.fillText('CÒN MỘT ĐIỀU NỮA',115,y);y+=45;write(promise,`italic 33px ${CARD_SERIF}`,'#e3e8d9',48);y+=52;
  ctx.strokeStyle=accent+'44';ctx.beginPath();ctx.moveTo(115,y);ctx.lineTo(965,y);ctx.stroke();y+=62;
  ctx.font=`18px ${CARD_SANS}`;ctx.fillStyle=accent;ctx.fillText('CÂU CUỐI',115,y);y+=44;write(finalMessage,`30px ${CARD_SERIF}`,'#f0eee5',44);y+=34;
  ctx.font=`italic 24px ${CARD_SERIF}`;ctx.fillStyle='#aebfb4';ctx.fillText('—',115,y);y+=42;write(sender,`italic 39px ${CARD_SERIF}`,accent,52);
  ctx.font=`18px ${CARD_SANS}`;ctx.fillStyle='#a3bcae';ctx.textAlign='center';ctx.fillText('20.10  ·  AFTER THE LETTER',540,canvas.height-102);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Chưa tạo được ảnh thiệp.');return blob;
}
export async function downloadPostcard(gift) {
  const blob=await createPostcard(gift),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='20-10-after-the-letter.png';document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
