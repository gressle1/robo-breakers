import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRoomState,
  selectFrame,
  addPlayer,
  startGame,
  submitAction,
  leaveRoom,
  cleanupInactivePlayers,
  returnToLobby,
} from '../src/game-engine.mjs';

function room2(){const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');selectFrame(r,'a','juggernaut');selectFrame(r,'b','phoenix');r.players.find(p=>p.id==='b').ready=true;startGame(r,'a');return r}

test('two players use a 5x5 board',()=>{const r=room2();assert.equal(r.boardSize,5);assert.equal(r.phase,'playing')});
test('blast damages target in line',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'overcharge'});assert.equal(r.players[1].hp,93);assert.equal(r.round,2)});
test('shield blocks a blast',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});assert.equal(r.players[1].hp,110)});
test('hack disables adjacent shield before blast resolution',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');addPlayer(r,'c','Alex');selectFrame(r,'a','juggernaut');selectFrame(r,'b','phoenix');selectFrame(r,'c','astra');r.players.find(p=>p.id==='b').ready=true;r.players.find(p=>p.id==='c').ready=true;startGame(r,'a');Object.assign(r.players[0],{x:0,y:0});Object.assign(r.players[1],{x:0,y:2});Object.assign(r.players[2],{x:1,y:2});submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});submitAction(r,'c',{type:'hack',dir:'left'});assert.equal(r.players[1].hp,93)});
test('resolved turn exposes actions and visuals only after resolution',()=>{const r=room2();submitAction(r,'a',{type:'overcharge'});assert.equal(r.lastTurn,null);submitAction(r,'b',{type:'overcharge'});assert.equal(r.lastTurn.round,1);assert.equal(r.lastTurn.actions.length,2);assert.equal(r.lastTurn.actions[0].action.type,'overcharge');assert.ok(r.lastTurn.visuals.some(v=>v.type==='overcharge'))});
test('host status transfers when host leaves',()=>{const r=room2();leaveRoom(r,'a');assert.equal(r.hostId,'b');assert.equal(r.players.length,1);assert.equal(r.phase,'interrupted')});
test('two-player match becomes interrupted when opponent leaves',()=>{const r=room2();leaveRoom(r,'b');assert.equal(r.phase,'interrupted');assert.equal(r.winnerIds.length,0);assert.match(r.interruptReason,/Sam left the arena/)});
test('interrupted host can return remaining room to lobby',()=>{const r=room2();leaveRoom(r,'b');returnToLobby(r,'a');assert.equal(r.phase,'lobby');assert.equal(r.round,0);assert.equal(r.players[0].hp,150);assert.equal(r.players[0].ready,false)});
test('inactive player cleanup removes stale player and transfers host',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');r.players[0].lastSeen=0;r.players[1].lastSeen=20_000;cleanupInactivePlayers(r,40_000,30_000);assert.equal(r.players.length,1);assert.equal(r.players[0].id,'b');assert.equal(r.hostId,'b')});

test('duplicate pilot names are blocked case-insensitively',()=>{
  const r=createRoomState('TEST','a','Joe');
  assert.throws(()=>addPlayer(r,'b','joe'),/Pilot name already in use/i);
  assert.throws(()=>addPlayer(r,'c','JOE'),/Pilot name already in use/i);
  assert.equal(r.players.length,1);
});

test('duplicate pilot names are checked after sanitizing and trimming',()=>{
  const r=createRoomState('TEST','a','Joe');
  assert.throws(()=>addPlayer(r,'b','  Joe  '),/Pilot name already in use/i);
  assert.equal(r.players.length,1);
});

test('frame selection is persisted and supports duplicate picks',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');selectFrame(r,'a','aurora');selectFrame(r,'b','aurora');assert.equal(r.players[0].frame,'aurora');assert.equal(r.players[1].frame,'aurora')});
test('match cannot start without every pilot selecting',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');r.players[1].ready=true;assert.throws(()=>startGame(r,'a'),/select a frame/i)});
test('changing frame unready player and is prohibited during play',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');selectFrame(r,'a','juggernaut');selectFrame(r,'b','astra');r.players[1].ready=true;selectFrame(r,'b','phoenix');assert.equal(r.players[1].ready,false);r.players[1].ready=true;startGame(r,'a');assert.throws(()=>selectFrame(r,'b','aurora'),/only available in the lobby/i)});
test('unknown frame selection rejected',()=>{const r=createRoomState('TEST','a','Joe');assert.throws(()=>selectFrame(r,'a','robot'),/Invalid frame/i)});


// Stage 4A: Directional Dodge proposal using the approved one-energy cost
// and frame-specific dodge reduction. Movement timing and blocked-dodge
// behavior remain subject to live acceptance before merge.
test('dodge consumes 1 energy and relocates one cell', () => {
  const r=room2();
  Object.assign(r.players[0], {x:1,y:1,energy:1});
  submitAction(r,'a',{type:'dodge',dir:'right'});
  assert.equal(r.players[0].energy,1, 'resource unchanged until simultaneous resolution');
  submitAction(r,'b',{type:'overcharge'});
  assert.equal(r.players[0].energy,0);
  assert.equal(r.players[0].x,2);
  assert.equal(r.players[0].y,1);
  assert.equal(r.players[0].dodging,true);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='dodge').blocked,false);
});

test('invalid direction and insufficient energy cannot lock a dodge', () => {
  const r=room2();
  assert.throws(()=>submitAction(r,'a',{type:'dodge',dir:'diagonal'}),/Direction required/);
  assert.equal(r.players[0].action,null);
  r.players[0].energy=0;
  assert.throws(()=>submitAction(r,'a',{type:'dodge',dir:'up'}),/requires 1 energy/);
  assert.equal(r.players[0].action,null);
});

test('dodge cannot exit arena, and blocked attempt still spends energy', () => {
  const r=room2();
  Object.assign(r.players[0], {x:0,y:0,energy:1});
  submitAction(r,'a',{type:'dodge',dir:'up'});
  submitAction(r,'b',{type:'overcharge'});
  assert.deepEqual([r.players[0].x,r.players[0].y],[0,0]);
  assert.equal(r.players[0].energy,0);
  assert.equal(r.players[0].dodging,false);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='dodge').blocked,true);
});

test('dodge cannot move onto another pilot', () => {
  const r=room2();
  Object.assign(r.players[0], {x:1,y:1,energy:1});
  Object.assign(r.players[1], {x:1,y:2});
  submitAction(r,'a',{type:'dodge',dir:'down'});
  submitAction(r,'b',{type:'shield'});
  assert.deepEqual([r.players[0].x,r.players[0].y],[1,1]);
  assert.equal(r.players[0].dodging,false);
  assert.equal(r.players[0].energy,0);
});

test('successful dodge applies locked frame reduction after armor if blast hits', () => {
  const r=room2(); // juggernaut 25% dodge, 20% armor; phoenix fires 28
  Object.assign(r.players[0], {x:2,y:1,energy:1});
  Object.assign(r.players[1], {x:0,y:2});
  submitAction(r,'a',{type:'dodge',dir:'down'});
  submitAction(r,'b',{type:'blast',dir:'right'});
  // 28 * 80% = 22; 22 * 75% = 16.5 -> 17 damage
  assert.equal(r.players[0].hp,133);
  assert.equal(r.players[1].damageDealt,17);
});

test('dodge can evade a previously aligned shot entirely', () => {
  const r=room2();
  Object.assign(r.players[0], {x:2,y:2,energy:1});
  Object.assign(r.players[1], {x:0,y:2});
  submitAction(r,'a',{type:'dodge',dir:'up'});
  submitAction(r,'b',{type:'blast',dir:'right'});
  assert.equal(r.players[0].hp,150);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='blast').hit,false);
});

test('a blocked dodge gets no damage reduction and regular armor still applies', () => {
  const r=room2();
  Object.assign(r.players[0], {x:0,y:2,energy:1});
  Object.assign(r.players[1], {x:0,y:0});
  submitAction(r,'a',{type:'dodge',dir:'left'});
  submitAction(r,'b',{type:'blast',dir:'down'});
  assert.equal(r.players[0].hp,128); // phoenix 28 into Juggernaut 20% armor ->22
});

test('dodge status resets at the following resolution and after return to lobby', () => {
  const r=room2();
  Object.assign(r.players[0], {x:1,y:1,energy:1});
  submitAction(r,'a',{type:'dodge',dir:'right'});
  submitAction(r,'b',{type:'overcharge'});
  assert.equal(r.players[0].dodging,true);
  submitAction(r,'a',{type:'overcharge'});
  submitAction(r,'b',{type:'overcharge'});
  assert.equal(r.players[0].dodging,false);
  leaveRoom(r,'b');
  returnToLobby(r,'a');
  assert.equal(r.players[0].dodging,false);
});

test('dodge command never adds a second action within the same round', () => {
  const r=room2();
  submitAction(r,'a',{type:'dodge',dir:'up'});
  assert.throws(()=>submitAction(r,'a',{type:'blast',dir:'down'}),/already locked/i);
});
