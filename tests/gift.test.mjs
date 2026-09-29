import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, TEMPLATES, DEFAULT_NOTE_TITLES, DEFAULT_FINAL_MESSAGE, validateGift, encodeGift, decodeGift, giftLink, LIMITS } from '../js/gift.js';

test('Vietnamese, emoji, punctuation and newlines round-trip in a V3 gift link',()=>{
  const gift={...SAMPLE,noteTitles:[...SAMPLE.noteTitles],notes:[...SAMPLE.notes],to:'Mẹ Thủy & chị Ánh 💛',message:'Cảm ơn mẹ!\n\nĐiều ước: bình yên <3 🌷',finalMessage:'Hôm nay vui nhé ✨'};
  assert.deepEqual(decodeGift(encodeGift(gift)),validateGift(gift));
});

test('V2 gifts migrate safely to V3 defaults',()=>{
  const legacy={v:2,to:'Linh',from:'Thạch',theme:'blue',message:'Một lá thư cũ.',notes:['A','B','C'],promise:'Cuối tuần đi ăn nhé.'};
  const migrated=validateGift(legacy);
  assert.equal(migrated.v,3);
  assert.deepEqual(migrated.noteTitles,[...DEFAULT_NOTE_TITLES]);
  assert.equal(migrated.finalMessage,DEFAULT_FINAL_MESSAGE);
  assert.deepEqual(decodeGift(encodeGift(legacy)),migrated);
});

test('custom star titles and final message survive encoding',()=>{
  const gift={...SAMPLE,noteTitles:['Chuyện thứ nhất','Có điều này','Và thêm một chuyện nữa'],finalMessage:'Vậy thôi. Nhớ giữ sức khỏe nhé.'};
  const decoded=decodeGift(encodeGift(gift));
  assert.deepEqual(decoded.noteTitles,gift.noteTitles);
  assert.equal(decoded.finalMessage,gift.finalMessage);
});

test('all five relationship suggestions are complete V3 gifts',()=>{
  for(const template of Object.values(TEMPLATES))assert.doesNotThrow(()=>validateGift({...template,v:3,theme:'gold'}));
});

test('required fields reject blank text and excess length',()=>{
  for(const key of ['to','from','message','promise','finalMessage']){
    assert.throws(()=>validateGift({...SAMPLE,[key]:'   '}));
    assert.throws(()=>validateGift({...SAMPLE,[key]:'a'.repeat(LIMITS[key]+1)}));
  }
});

test('notes and note titles must be exactly three bounded strings',()=>{
  for(const notes of [[],['x'],['a','b','c','d'],['a','', 'c'],['a',null,'c'],['a','b','x'.repeat(LIMITS.note+1)]])assert.throws(()=>validateGift({...SAMPLE,notes}));
  for(const noteTitles of [[],['x'],['a','b','c','d'],['a','', 'c'],['a',null,'c'],['a','b','x'.repeat(LIMITS.noteTitle+1)]])assert.throws(()=>validateGift({...SAMPLE,noteTitles}));
});

test('unknown versions, themes, types and malformed data fail closed',()=>{
  for(const gift of [null,[],{...SAMPLE,v:4},{...SAMPLE,theme:'https://bad'},{...SAMPLE,to:42}])assert.throws(()=>validateGift(gift));
  for(const encoded of ['', '%ZZ', 'a'.repeat(12001),'a','bm90IGpzb24','eyJ2Ijo0fQ'])assert.throws(()=>decodeGift(encoded));
});

test('link remains on the GitHub Pages subpath and removes unrelated query data',()=>{
  const url=new URL(giftLink(SAMPLE,'https://thachdeptrai.github.io/20-10/?utm_source=old#keepsakes'));
  assert.equal(url.origin,'https://thachdeptrai.github.io');assert.equal(url.pathname,'/20-10/');assert.equal(url.search,'');assert.deepEqual(decodeGift(url.hash.slice(6)),validateGift(SAMPLE));
});

test('markup remains literal data and extra keys are not carried into the gift',()=>{
  const gift=decodeGift(encodeGift({...SAMPLE,to:'<img src=x onerror=alert(1)>',extra:'discard'}));
  assert.equal(gift.to,'<img src=x onerror=alert(1)>');assert.equal(gift.extra,undefined);
});

test('maximum supported Vietnamese V3 payload fits decoder limit',()=>{
  const gift={...SAMPLE,to:'ế'.repeat(40),from:'ừ'.repeat(40),message:'ộ'.repeat(700),noteTitles:Array(3).fill('đ'.repeat(50)),notes:Array(3).fill('ự'.repeat(120)),promise:'ắ'.repeat(160),finalMessage:'ờ'.repeat(160)};
  const encoded=encodeGift(gift);assert.ok(encoded.length<12000);assert.deepEqual(decodeGift(encoded),validateGift(gift));
});
