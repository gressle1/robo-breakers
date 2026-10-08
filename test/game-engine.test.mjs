import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRoomState,
  addPlayer,
  startGame,
  submitAction,
  leaveRoom,
  cleanupInactivePlayers,
  returnToLobby,
} from '../src/game-engine.mjs';

function room2(){const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');r.players.find(p=>p.id==='b').ready=true;startGame(r,'a');return r}

test('two players use a 5x5 board',()=>{const r=room2();assert.equal(r.boardSize,5);assert.equal(r.phase,'playing')});
test('blast damages target in line',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'overcharge'});assert.equal(r.players[1].hp,2);assert.equal(r.round,2)});
test('shield blocks a blast',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});assert.equal(r.players[1].hp,3)});
test('hack disables adjacent shield before blast resolution',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');addPlayer(r,'c','Alex');r.players.find(p=>p.id==='b').ready=true;r.players.find(p=>p.id==='c').ready=true;startGame(r,'a');Object.assign(r.players[0],{x:0,y:0});Object.assign(r.players[1],{x:0,y:2});Object.assign(r.players[2],{x:1,y:2});submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});submitAction(r,'c',{type:'hack',dir:'left'});assert.equal(r.players[1].hp,2)});
test('resolved turn exposes actions and visuals only after resolution',()=>{const r=room2();submitAction(r,'a',{type:'overcharge'});assert.equal(r.lastTurn,null);submitAction(r,'b',{type:'overcharge'});assert.equal(r.lastTurn.round,1);assert.equal(r.lastTurn.actions.length,2);assert.equal(r.lastTurn.actions[0].action.type,'overcharge');assert.ok(r.lastTurn.visuals.some(v=>v.type==='overcharge'))});
test('host status transfers when host leaves',()=>{const r=room2();leaveRoom(r,'a');assert.equal(r.hostId,'b');assert.equal(r.players.length,1);assert.equal(r.phase,'interrupted')});
test('two-player match becomes interrupted when opponent leaves',()=>{const r=room2();leaveRoom(r,'b');assert.equal(r.phase,'interrupted');assert.equal(r.winnerIds.length,0);assert.match(r.interruptReason,/Sam left the arena/)});
test('interrupted host can return remaining room to lobby',()=>{const r=room2();leaveRoom(r,'b');returnToLobby(r,'a');assert.equal(r.phase,'lobby');assert.equal(r.round,0);assert.equal(r.players[0].hp,3);assert.equal(r.players[0].ready,false)});
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
