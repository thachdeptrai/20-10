import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, TEMPLATES, DEFAULT_STAR_TITLES, validateGift, encodeGift, decodeGift, giftLink, LIMITS } from '../js/gift.js';

test('Vietnamese, emoji, punctuation and newlines round-trip in a V3 gift link',()=>{
  const gift={...SAMPLE,to:'Mẹ Thủy & chị Ánh 💛',message:'Cảm ơn mẹ!\n\nĐiều ước: bình yên <3 🌷',starTitles:['Chuyện thứ nhất','Có điều này','Và thêm một chuyện nữa'],finalMessage:'Vậy thôi 😄 Giữ sức khỏe nhé.'};
  assert.deepEqual(decodeGift(encodeGift(gift)),gift);
});
test('V2 gifts migrate safely to V3 defaults',()=>{
  const old={v:2,to:'Linh',from:'Thạch',message:'Một lá thư.',notes:['A','B','C'],promise:'Đi ăn nhé.',theme:'blue'};
  const migrated=validateGift(old);
  assert.equal(migrated.v,3);
  assert.deepEqual(migrated.starTitles,DEFAULT_STAR_TITLES);
  assert.equal(migrated.finalMessage,'Chúc bạn có một ngày thật dễ chịu.');
});
test('all five relationship suggestions can be promoted into complete V3 gifts',()=>{
  for(const template of Object.values(TEMPLATES))assert.doesNotThrow(()=>validateGift({...template,v:3,theme:'gold',starTitles:DEFAULT_STAR_TITLES,finalMessage:'Chúc bạn hôm nay thật vui.'}));
});
test('required fields reject blank text and excess length',()=>{
  for(const key of ['to','from','message','promise','finalMessage']){
    assert.throws(()=>validateGift({...SAMPLE,[key]:'   '}));assert.throws(()=>validateGift({...SAMPLE,[key]:'a'.repeat(LIMITS[key]+1)}));
  }
});
test('custom star titles require exactly three bounded strings',()=>{
  for(const starTitles of [[],['x'],['a','b','c','d'],['a','', 'c'],['a',null,'c'],['a','b','x'.repeat(LIMITS.title+1)]])assert.throws(()=>validateGift({...SAMPLE,starTitles}));
});
test('notes must be exactly three bounded strings',()=>{
  for(const notes of [[],['x'],['a','b','c','d'],['a','', 'c'],['a',null,'c'],['a','b','x'.repeat(121)]])assert.throws(()=>validateGift({...SAMPLE,notes}));
});
test('unknown versions, themes, types and malformed data fail closed',()=>{
  for(const gift of [null,[],{...SAMPLE,v:4},{...SAMPLE,theme:'https://bad'},{...SAMPLE,to:42}])assert.throws(()=>validateGift(gift));
  for(const encoded of ['', '%ZZ', 'a'.repeat(12001),'a','bm90IGpzb24','eyJ2Ijo0fQ'])assert.throws(()=>decodeGift(encoded));
});
test('link remains on the GitHub Pages subpath and removes unrelated query data',()=>{
  const url=new URL(giftLink(SAMPLE,'https://thachdeptrai.github.io/20-10/?utm_source=old#keepsakes'));
  assert.equal(url.origin,'https://thachdeptrai.github.io');assert.equal(url.pathname,'/20-10/');assert.equal(url.search,'');assert.deepEqual(decodeGift(url.hash.slice(6)),SAMPLE);
});
test('markup remains literal data and extra keys are not carried into the gift',()=>{
  const gift=decodeGift(encodeGift({...SAMPLE,to:'<img src=x onerror=alert(1)>',extra:'discard'}));
  assert.equal(gift.to,'<img src=x onerror=alert(1)>');assert.equal(gift.extra,undefined);
});
test('maximum supported Vietnamese V3 payload fits decoder limit',()=>{
  const gift={...SAMPLE,to:'ế'.repeat(40),from:'ừ'.repeat(40),message:'ộ'.repeat(700),notes:Array(3).fill('ự'.repeat(120)),starTitles:Array(3).fill('đ'.repeat(50)),promise:'ắ'.repeat(160),finalMessage:'ơ'.repeat(160)};
  const encoded=encodeGift(gift);assert.ok(encoded.length<12000);assert.deepEqual(decodeGift(encoded),gift);
});
test('V3 DOM hooks exist for intro, QR and cinematic finale',async()=>{
  const {readFile}=await import('node:fs/promises');const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['gift-intro','show-qr','qr-dialog','final-sequence','finale'])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/name="finalMessage"/);assert.match(html,/name="title0"/);assert.match(html,/name="title1"/);assert.match(html,/name="title2"/);
});