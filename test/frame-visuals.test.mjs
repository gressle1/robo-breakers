import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const frames = ['juggernaut', 'phoenix', 'astra', 'aurora'];
const app = fs.readFileSync('public/app.js','utf8');
test('frame visuals reference only four approved machines', () => {
  for (const frame of frames) {
    for (const kind of ['card', 'token']) {
      const path = `public/assets/frames/${frame}-${kind}.webp`;
      assert.ok(fs.existsSync(path), `missing approved artwork crop ${path}`);
      assert.ok(fs.statSync(path).size > 1000, `${path} was empty`);
    }
  }
  assert.match(app,/const FRAME_ART_BASE='\/assets\/frames\/';/);
  assert.match(app, /frameArt\(f\.id,"card"\)/);
  assert.match(app, /frameArt\(p\.frame\)/);
});

test('all rendering mirrors and deployed assets stay in sync', () => {
  assert.equal(fs.readFileSync('app.js','utf8'),fs.readFileSync('public/app.js','utf8'));
  assert.equal(fs.readFileSync('style.css','utf8'),fs.readFileSync('public/style.css','utf8'));
  for (const frame of frames) for (const kind of ['card','token'])
    assert.deepEqual(fs.readFileSync(`dist/assets/frames/${frame}-${kind}.webp`),fs.readFileSync(`public/assets/frames/${frame}-${kind}.webp`));
});
