import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomState, addPlayer, startGame, submitAction } from '../src/game-engine.mjs';

function room2(){const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');r.players.find(p=>p.id==='b').ready=true;startGame(r,'a');return r}

test('two players use a 5x5 board',()=>{const r=room2();assert.equal(r.boardSize,5);assert.equal(r.phase,'playing')});
test('blast damages target in line',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'overcharge'});assert.equal(r.players[1].hp,2);assert.equal(r.round,2)});
test('shield blocks a blast',()=>{const r=room2();r.players[0].x=0;r.players[0].y=0;r.players[1].x=0;r.players[1].y=2;submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});assert.equal(r.players[1].hp,3)});
test('hack disables adjacent shield before blast resolution',()=>{const r=createRoomState('TEST','a','Joe');addPlayer(r,'b','Sam');addPlayer(r,'c','Alex');r.players.find(p=>p.id==='b').ready=true;r.players.find(p=>p.id==='c').ready=true;startGame(r,'a');Object.assign(r.players[0],{x:0,y:0});Object.assign(r.players[1],{x:0,y:2});Object.assign(r.players[2],{x:1,y:2});submitAction(r,'a',{type:'blast',dir:'down'});submitAction(r,'b',{type:'shield'});submitAction(r,'c',{type:'hack',dir:'left'});assert.equal(r.players[1].hp,2)});

test('resolved turn exposes actions only after resolution',()=>{const r=room2();submitAction(r,'a',{type:'overcharge'});assert.equal(r.lastTurn,null);submitAction(r,'b',{type:'overcharge'});assert.equal(r.lastTurn.round,1);assert.equal(r.lastTurn.actions.length,2);assert.equal(r.lastTurn.actions[0].action.type,'overcharge')});
