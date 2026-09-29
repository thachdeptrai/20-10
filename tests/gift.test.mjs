import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, TEMPLATES, validateGift, encodeGift, decodeGift, giftLink, LIMITS } from '../js/gift.js';

test('Vietnamese, emoji, punctuation and newlines round-trip in a gift link',()=>{
  const gift={...SAMPLE,to:'Mẹ Thủy & chị Ánh 💛',message:'Cảm ơn mẹ!\n\nĐiều ước: bình yên <3 🌷'};
  assert.deepEqual(decodeGift(encodeGift(gift)),gift);
});
test('all five relationship suggestions are complete gifts',()=>{
  for(const template of Object.values(TEMPLATES))assert.doesNotThrow(()=>validateGift({...template,v:2,theme:'gold'}));
});
test('required fields reject blank text and excess length',()=>{
  for(const key of ['to','from','message','promise']){
    assert.throws(()=>validateGift({...SAMPLE,[key]:'   '}));
    assert.throws(()=>validateGift({...SAMPLE,[key]:'a'.repeat(LIMITS[key]+1)}));
  }
});
test('notes must be exactly three bounded strings',()=>{
  for(const notes of [[],['x'],['a','b','c','d'],['a','', 'c'],['a',null,'c'],['a','b','x'.repeat(121)]])assert.throws(()=>validateGift({...SAMPLE,notes}));
});
test('unknown versions, themes, types and malformed data fail closed',()=>{
  for(const gift of [null,[],{...SAMPLE,v:3},{...SAMPLE,theme:'https://bad'},{...SAMPLE,to:42}])assert.throws(()=>validateGift(gift));
  for(const encoded of ['', '%ZZ', 'a'.repeat(12001),'a','bm90IGpzb24','eyJ2IjozfQ'])assert.throws(()=>decodeGift(encoded));
});
test('link remains on the GitHub Pages subpath and removes unrelated query data',()=>{
  const url=new URL(giftLink(SAMPLE,'https://thachdeptrai.github.io/20-10/?utm_source=old#keepsakes'));
  assert.equal(url.origin,'https://thachdeptrai.github.io');assert.equal(url.pathname,'/20-10/');assert.equal(url.search,'');assert.deepEqual(decodeGift(url.hash.slice(6)),SAMPLE);
});
test('markup remains literal data and extra keys are not carried into the gift',()=>{
  const gift=decodeGift(encodeGift({...SAMPLE,to:'<img src=x onerror=alert(1)>',extra:'discard'}));
  assert.equal(gift.to,'<img src=x onerror=alert(1)>');assert.equal(gift.extra,undefined);
});
test('maximum supported Vietnamese payload fits decoder limit',()=>{
  const gift={...SAMPLE,to:'ế'.repeat(40),from:'ừ'.repeat(40),message:'ộ'.repeat(700),notes:Array(3).fill('ự'.repeat(120)),promise:'ắ'.repeat(160)};
  const encoded=encodeGift(gift);assert.ok(encoded.length<12000);assert.deepEqual(decodeGift(encoded),gift);
});
