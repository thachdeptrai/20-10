import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('V3 DOM exposes intro, constellation, final scene and QR controls',async()=>{
  const html=await read('index.html');
  for(const id of ['intro-screen','constellation','constellation-continue','promise-continue','final-scene','final-message','qr-code','download-qr','download-qr-card'])assert.match(html,new RegExp(`id="${id}"`));
});

test('composer exposes custom titles and private final message with limits',async()=>{
  const html=await read('index.html');
  for(let i=0;i<3;i++)assert.match(html,new RegExp(`name="noteTitle${i}" maxlength="50"`));
  assert.match(html,/name="finalMessage" maxlength="160"/);
});

test('mobile and reduced-motion V3 guardrails exist',async()=>{
  const css=await read('css/v3.css');
  for(const width of ['760','430','360','320'])assert.match(css,new RegExp(`max-width:${width}px`));
  assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/constellation-draw/);
});
