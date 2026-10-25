import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRoomState,addPlayer,selectFrame,startGame,submitAction} from '../src/game-engine.mjs';

function setup(){
  const room=createRoomState('FX01','a','Pilot A');
  addPlayer(room,'b','Pilot B');
  selectFrame(room,'a','phoenix');
  selectFrame(room,'b','aurora');
  room.players[1].ready=true;
  startGame(room,'a');
  Object.assign(room.players[0],{x:1,y:1});
  Object.assign(room.players[1],{x:1,y:3});
  return room;
}
function uiFunctions(){
  const script=fs.readFileSync('public/app.js','utf8');
  const context=vm.createContext({
    localStorage:{},
    document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},
    setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
  });
  vm.runInContext(script+'\n;globalThis.fxExports={blastEffects,board,maybeFx,state}',context);
  return context.fxExports;
}

test('Blast hit sends authoritative, armor-adjusted floating damage amount without changing HP rules',()=>{
  const r=setup();
  submitAction(r,'a',{type:'blast',dir:'down'});
  submitAction(r,'b',{type:'overcharge'});
  // Phoenix 28 blaster, Aurora 10% armor = 25 HP lost.
  assert.equal(r.players[1].hp,95);
  const v=r.lastTurn.visuals.find(v=>v.type==='blast');
  assert.equal(v.damage,25);
  assert.equal(v.hit,true);
  assert.deepEqual(v.path,[{x:1,y:2},{x:1,y:3}]);
  const {blastEffects}=uiFunctions();
  const html=blastEffects(r.lastTurn,r);
  assert.match(html,/--shot-color:#EE5A63/);
  assert.match(html,/>-25 HP<\/div>/);
  assert.match(html,/blast-impact hit/);
  assert.match(html,/top:70%/);
});

test('Blocked shot displays BLOCK and zero damage; base HP unchanged',()=>{
  const r=setup();
  submitAction(r,'a',{type:'blast',dir:'down'});
  submitAction(r,'b',{type:'shield'});
  const v=r.lastTurn.visuals.find(v=>v.type==='blast');
  assert.equal(r.players[1].hp,120);
  assert.equal(v.damage,0);
  assert.equal(v.blocked,true);
  const html=uiFunctions().blastEffects(r.lastTurn,r);
  assert.match(html,/blast-impact blocked/);
  assert.match(html,/>BLOCK<\/div>/);
  assert.doesNotMatch(html,/>-\d+ HP<\/div>/);
});

test('Miss reports MISS, no HP loss, and stops at arena boundary',()=>{
  const r=setup();
  submitAction(r,'a',{type:'blast',dir:'up'});
  submitAction(r,'b',{type:'overcharge'});
  const v=r.lastTurn.visuals.find(v=>v.type==='blast');
  assert.equal(v.damage,0);
  assert.equal(v.hit,false);
  assert.equal(r.players[1].hp,120);
  assert.match(uiFunctions().blastEffects(r.lastTurn,r),/>MISS<\/div>/);
});

test('Dodge reduction is reflected by damage metadata',()=>{
  const r=setup();
  Object.assign(r.players[1],{x:1,y:2,energy:1});
  submitAction(r,'a',{type:'blast',dir:'down'});
  submitAction(r,'b',{type:'dodge',dir:'down'});
  const v=r.lastTurn.visuals.find(v=>v.type==='blast');
  // 28 to Aurora with 10% armor = 25; successful dodge reduces 45%, rounded =>14.
  assert.equal(v.damage,14);
  assert.equal(r.players[1].hp,106);
});

test('Battlefield FX and equal-size rows support 5, 6 and 7 square boards',()=>{
  const {state,board}=uiFunctions();
  for(const size of [5,6,7]){
    state.room={phase:'playing',boardSize:size,players:[],code:'FX01',round:1};
    state.fx=null;
    const html=board();
    assert.match(html,new RegExp(`grid-template-rows:repeat\\(${size},minmax\\(0,1fr\\)\\)`));
    assert.equal((html.match(/class="tile /g)||[]).length,size*size);
  }
});

test('Display code remains synchronized in all front-end mirrors',()=>{
  const files=['app.js','public/app.js','dist/app.js'];
  const css=['style.css','public/style.css','dist/style.css'];
  for(const f of files.slice(1))assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync(files[0],'utf8'));
  for(const f of css.slice(1))assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync(css[0],'utf8'));
  assert.deepEqual(fs.readFileSync('game-engine.mjs'),fs.readFileSync('src/game-engine.mjs'));
});
