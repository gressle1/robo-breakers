import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { FRAME_STATS, createRoomState, addPlayer, selectFrame, startGame, submitAction } from '../src/game-engine.mjs';

const LOCKED = Object.freeze({ juggernaut: 1, phoenix: 1, astra: 3, aurora: 2 });

function setup(frame='astra', size=5) {
  const r=createRoomState('SPEED', 'p1', 'Scout');
  addPlayer(r,'p2','Opponent');
  selectFrame(r,'p1',frame);selectFrame(r,'p2','juggernaut');
  r.players[1].ready=true;startGame(r,'p1');
  r.boardSize=size;
  Object.assign(r.players[0], {x:0,y:1,energy:3});
  Object.assign(r.players[1], {x:size-1,y:size-1});
  return r;
}
function turn(r, first, second={type:'shield'}) {
  submitAction(r,'p1',first);submitAction(r,'p2',second);
}
function activate(r) {
  turn(r,{type:'overdrive'});
  assert.equal(r.players[0].overdriveRounds,3);
  assert.equal(r.players[0].energy,0);
}

test('Locked movement chart is mirrored by engine and UI for every approved frame',()=>{
  for (const [frame, range] of Object.entries(LOCKED)) {
    assert.equal(FRAME_STATS[frame].move,1,frame);
    assert.equal(FRAME_STATS[frame].overdrive,range,frame);
  }
  const js=readFileSync('public/app.js','utf8');
  const context=vm.createContext({localStorage:{},document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{}});
  vm.runInContext(js+'\n;globalThis.framesForTest=FRAMES',context);
  for(const f of context.framesForTest) {
    assert.equal(f.move,1,f.id);
    assert.equal(f.overdrive,LOCKED[f.id],f.id);
  }
  for(const path of ['public/app.js','dist/app.js'])assert.equal(readFileSync(path,'utf8'),readFileSync('app.js','utf8'));
  assert.equal(readFileSync('game-engine.mjs','utf8'),readFileSync('src/game-engine.mjs','utf8'));
});

test('Every machine moves exactly the locked Overdrive number of spaces when clear',()=>{
  for(const [frame,steps] of Object.entries(LOCKED)){
    const r=setup(frame,7);
    activate(r);
    turn(r,{type:'move',dir:'right'});
    assert.equal(r.players[0].x,steps,frame);
    assert.equal(r.players[0].y,1,frame);
    assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,steps,frame);
    assert.equal(r.players[0].overdriveRounds,2,frame);
  }
});

test('Astra can travel 3 spaces on 5x5, 6x6 and 7x7 boards and returns to 1 after expiry',()=>{
  for (const size of [5,6,7]) {
    const r=setup('astra',size);
    turn(r,{type:'move',dir:'right'});assert.equal(r.players[0].x,1);
    r.players[0].x=0;
    activate(r);
    turn(r,{type:'move',dir:'right'});
    assert.equal(r.players[0].x,3);
    for(let i=0;i<2;i++)turn(r,{type:'shield'});
    assert.equal(r.players[0].overdriveRounds,0);
    turn(r,{type:'move',dir:'left'});
    assert.equal(r.players[0].x,2);
  }
});

test('Astra 3-square movement respects board walls and never teleports',()=>{
  const r=setup('astra',5);
  r.players[0].x=3;
  activate(r);
  turn(r,{type:'move',dir:'right'});
  assert.equal(r.players[0].x,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,1);
  turn(r,{type:'move',dir:'right'});
  assert.equal(r.players[0].x,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,0);
});

test('Astra never jumps occupied cells: unpushable third square stops at two',()=>{
  const r=setup('astra',5);
  Object.assign(r.players[0],{x:0,y:0});
  Object.assign(r.players[1],{x:3,y:0});
  activate(r);
  // The enemy at x=3 cannot be pushed off board by moving right when at x=4;
  // place the actor at x=1 and blocker at the edge x=4 for a 3-step attempt.
  r.players[0].x=1;r.players[1].x=4;
  turn(r,{type:'move',dir:'right'});
  assert.equal(r.players[0].x,3);
  assert.equal(r.players[1].x,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,2);
});

test('Even in Overdrive, Astra Dodge moves only one tile and spends 1 energy',()=>{
  const r=setup('astra',7);
  activate(r);r.players[0].energy=2;
  turn(r,{type:'dodge',dir:'right'});
  assert.equal(r.players[0].x,1);
  assert.equal(r.players[0].energy,1);
});
