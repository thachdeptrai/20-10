import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Vietnamese web typography keeps dedicated fonts plus system fallbacks',async()=>{
  const [html,css]=await Promise.all([read('index.html'),read('css/styles.css')]);
  assert.match(html,/family=Be\+Vietnam\+Pro:/);assert.match(html,/family=Playfair\+Display:/);assert.match(html,/display=swap/);
  assert.match(css,/--sans:"Be Vietnam Pro","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif/);
  assert.match(css,/--serif:"Playfair Display","Noto Serif",Georgia,"Times New Roman",serif/);
});

test('postcard waits for browser fonts and uses the same font families',async()=>{
  const postcard=await read('js/postcard.js');assert.match(postcard,/ensureCardFonts/);assert.match(postcard,/document\.fonts\?\.load/);assert.match(postcard,/Be Vietnam Pro/);assert.match(postcard,/Playfair Display/);
});

test('font-aware assets use V3 cache keys',async()=>{
  const [html,app]=await Promise.all([read('index.html'),read('js/app.js')]);
  assert.match(html,/v3\.css\?v=3\.0\.0/);assert.match(html,/app\.js\?v=3\.0\.0/);assert.match(app,/postcard\.js\?v=3\.0\.0/);
});
