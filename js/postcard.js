import { validateGift, NOTE_LABELS } from './gift.js?v=2.0.1';
const PALETTES = {gold:['#e4c48f','#0d2629'],rose:['#e7b5ae','#2b202b'],blue:['#b5d4de','#122b3b']};
// Wrap by measured glyph width, including very long words and Vietnamese.
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
  const gift=validateGift(value);
  const canvas=document.createElement('canvas');canvas.width=1080;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt chưa hỗ trợ lưu thiệp.');
  const width=850;
  ctx.font='32px Georgia';const letter=linesFor(ctx,gift.message,width);
  ctx.font='28px Arial';const notes=gift.notes.map(n=>linesFor(ctx,n,width-55));
  ctx.font='italic 33px Georgia';const promise=linesFor(ctx,gift.promise,width-25);
  ctx.font='italic 45px Georgia';const recipient=linesFor(ctx,'Gửi '+gift.to+',',width);
  ctx.font='italic 39px Georgia';const sender=linesFor(ctx,gift.from,width);
  canvas.height=Math.max(1520,655+recipient.length*60+letter.length*49+notes.reduce((n,a)=>n+a.length*42+83,0)+promise.length*48+sender.length*52);
  const [accent,bg]=PALETTES[gift.theme];
  const gradient=ctx.createLinearGradient(0,0,1080,canvas.height);gradient.addColorStop(0,bg);gradient.addColorStop(1,'#07151b');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,canvas.height);
  let seed=2010;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(let i=0;i<180;i++){ctx.fillStyle=`rgba(230,216,179,${random()*.3})`;ctx.beginPath();ctx.arc(random()*1080,random()*canvas.height,.5+random()*1.4,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=accent+'44';ctx.lineWidth=1;ctx.strokeRect(48,48,984,canvas.height-96);ctx.strokeRect(61,61,958,canvas.height-122);
  ctx.fillStyle=accent;ctx.font='24px Arial';ctx.fillText('20.10  /  GỬI NGƯỜI TÔI THƯƠNG',115,140);star(ctx,922,130,25);
  let y=244;
  const write=(lines,font,color,lineHeight,x=115)=>{ctx.font=font;ctx.fillStyle=color;for(const line of lines){ctx.fillText(line,x,y);y+=lineHeight;}};
  write(recipient,'italic 45px Georgia',accent,60);y+=23;
  write(letter,'32px Georgia','#e5eadd',49);y+=37;
  ctx.strokeStyle=accent+'44';ctx.beginPath();ctx.moveTo(115,y);ctx.lineTo(965,y);ctx.stroke();y+=67;
  for(let i=0;i<3;i++){ctx.font='19px Arial';ctx.fillStyle=accent;ctx.fillText('0'+(i+1)+'  /  '+NOTE_LABELS[i],115,y);y+=43;write(notes[i],'28px Arial','#c6d6c7',42,142);y+=40;}
  ctx.font='19px Arial';ctx.fillStyle=accent;ctx.fillText('MỘT LỜI HẸN DÀNH CHO BẠN',115,y);y+=47;write(promise,'italic 33px Georgia','#e3e8d9',48);y+=50;
  ctx.font='italic 26px Georgia';ctx.fillStyle='#b2c5b6';ctx.fillText('Với tất cả yêu thương,',115,y);y+=54;write(sender,'italic 39px Georgia',accent,52);
  ctx.font='18px Arial';ctx.fillStyle='#a3bcae';ctx.textAlign='center';ctx.fillText('HÔM NAY & MỖI NGÀY  ·  20.10',540,canvas.height-102);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Chưa tạo được ảnh thiệp.');return blob;
}
export async function downloadPostcard(gift) {
  const blob=await createPostcard(gift),url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='20-10-gui-nguoi-toi-thuong.png';document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
