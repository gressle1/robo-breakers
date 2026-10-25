import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRoomState,addPlayer,selectFrame,startGame,submitAction,publicRoom,rematch,returnToLobby,OVERDRIVE_COST,OVERDRIVE_DURATION,FRAME_STATS} from '../src/game-engine.mjs';

function setup(frame='astra') {
  const r=createRoomState('OD11','p1','Pilot One');
  addPlayer(r,'p2','Pilot Two');
  selectFrame(r,'p1',frame);selectFrame(r,'p2','juggernaut');
  r.players[1].ready=true;startGame(r,'p1');
  return r;
}
function turn(r,a={type:'overcharge'},b={type:'shield'}) {
  submitAction(r,'p1',a);submitAction(r,'p2',b);
}
function charge(r){turn(r);turn(r)} // 1 starting energy + 2 overcharges = 3
function frontend(){
  const src=fs.readFileSync('public/app.js','utf8');
  const c=vm.createContext({localStorage:{},document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{}});
  vm.runInContext(src+'\n;globalThis.ui={ACTION_META,abilityEffects,botPiece,game,state}',c);
  return c.ui;
}

test('Overdrive cost and duration use the proposed 3/3 foundation values',()=>{
  assert.equal(OVERDRIVE_COST,3);assert.equal(OVERDRIVE_DURATION,3);
});
test('Overdrive requires energy and a rejected command never locks the turn',()=>{
  const r=setup();
  assert.throws(()=>submitAction(r,'p1',{type:'overdrive'}),/requires 3 energy/);
  assert.equal(r.players[0].action,null);assert.equal(r.players[0].energy,1);
  assert.equal(r.round,1);assert.equal(r.players[0].overdriveRounds,0);
});
test('two overcharges fund activation: one command, -3 energy, shared resolved visual',()=>{
  const r=setup();charge(r);
  assert.equal(r.round,3);assert.equal(r.players[0].energy,3);
  submitAction(r,'p1',{type:'overdrive'});
  assert.throws(()=>submitAction(r,'p1',{type:'blast',dir:'right'}),/already locked/i);
  submitAction(r,'p2',{type:'shield'});
  assert.equal(r.players[0].energy,0);assert.equal(r.players[0].overdriveRounds,3);
  assert.equal(r.round,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='overdrive').rounds,3);
  assert.match(r.lastTurn.events.join(' '),/activated OVERDRIVE/);
  assert.equal(publicRoom(r).players[0].overdriveRounds,3);
  assert.equal('action' in publicRoom(r).players[0],false);
});
test('countdown begins after activation round and ends after three following resolved rounds',()=>{
  const r=setup();charge(r);turn(r,{type:'overdrive'});
  assert.equal(r.players[0].overdriveRounds,3);
  for(const remaining of [2,1,0]){
    turn(r,{type:'shield'});assert.equal(r.players[0].overdriveRounds,remaining);
  }
  assert.equal(r.round,7);
  assert.equal(r.lastTurn.visuals.filter(v=>v.type==='overdrive-end').length,1);
  assert.match(r.lastTurn.events.join(' '),/Overdrive ended/);
  turn(r,{type:'shield'});
  assert.equal(r.players[0].overdriveRounds,0);
  assert.equal(r.lastTurn.visuals.some(v=>v.type==='overdrive-end'),false);
});
test('cannot activate again during Overdrive, even when energy replenishes',()=>{
  const r=setup();charge(r);turn(r,{type:'overdrive'});
  r.players[0].energy=3;
  assert.throws(()=>submitAction(r,'p1',{type:'overdrive'}),/already active/);
  assert.equal(r.players[0].action,null);assert.equal(r.players[0].energy,3);
  turn(r,{type:'shield'});turn(r,{type:'shield'});turn(r,{type:'shield'});
  assert.equal(r.players[0].overdriveRounds,0);
  turn(r,{type:'overdrive'});
  assert.equal(r.players[0].energy,0);assert.equal(r.players[0].overdriveRounds,3);
});
test('Overdrive activation does not apply frame-specific stat buffs yet',()=>{
  const r=setup('phoenix');charge(r);turn(r,{type:'overdrive'});
  r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=3;
  turn(r,{type:'move',dir:'down'});
  assert.equal(r.players[0].y,1); // phoenix still moves one square
  turn(r,{type:'blast',dir:'down'},{type:'overcharge'});
  assert.equal(r.players[1].hp,FRAME_STATS.juggernaut.hp-22); // 28 blast, 20% armor
});
test('rematch and returning to lobby clear Overdrive, while new matches start empty',()=>{
  const r=setup();charge(r);turn(r,{type:'overdrive'});
  assert.equal(r.players[0].overdriveRounds,3);
  r.phase='finished';rematch(r,'p1');assert.equal(r.players[0].overdriveRounds,0);
  r.players[0].overdriveRounds=2;r.phase='interrupted';returnToLobby(r,'p1');
  assert.equal(r.players[0].overdriveRounds,0);
  r.players[1].ready=true;startGame(r,'p1');assert.equal(r.players[0].overdriveRounds,0);
});
test('all clients receive Overdrive status and UI displays an active badge and remaining rounds',()=>{
  const r=setup();charge(r);turn(r,{type:'overdrive'});
  const ui=frontend();
  ui.state.room=r;ui.state.playerId='p1';ui.state.actionType='overdrive';
  assert.match(ui.abilityEffects(r.lastTurn,r),/OVERDRIVE ONLINE/);
  assert.match(ui.botPiece(r.players[0],0),/overdrive-active/);
  assert.match(ui.botPiece(r.players[0],0),/OD 3R/);
  const html=ui.game();
  assert.match(html,/pilot-overdrive/);assert.match(html,/OD 3R/);
  assert.match(html,/data-action="overdrive"/);
  assert.match(html,/KEYS: 1–7 COMMAND/);
  assert.equal((html.match(/class="tile /g)||[]).length,25);
});
test('UI countdown and animations work at 6x6 and asset mirrors stay synchronized',()=>{
  const r=setup();charge(r);turn(r,{type:'overdrive'});
  r.boardSize=6;
  const ui=frontend();ui.state.room=r;ui.state.playerId='p2';ui.state.actionType='move';
  assert.match(ui.abilityEffects(r.lastTurn,r),/--board-size:6/);
  const html=ui.game();assert.equal((html.match(/class="tile /g)||[]).length,36);
  for(const f of ['public/app.js','dist/app.js'])assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync('app.js','utf8'));
  for(const f of ['public/style.css','dist/style.css'])assert.equal(fs.readFileSync(f,'utf8'),fs.readFileSync('style.css','utf8'));
  assert.equal(fs.readFileSync('src/game-engine.mjs','utf8'),fs.readFileSync('game-engine.mjs','utf8'));
});
