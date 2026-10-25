import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRoomState,addPlayer,selectFrame,startGame,submitAction,FRAME_STATS} from '../src/game-engine.mjs';

function setup(){
 const room=createRoomState('FX09','p1','Phoenix Pilot');
 addPlayer(room,'p2','Astra Pilot');
 selectFrame(room,'p1','phoenix');selectFrame(room,'p2','astra');
 room.players[1].ready=true;startGame(room,'p1');
 Object.assign(room.players[0],{x:1,y:1});Object.assign(room.players[1],{x:3,y:3});
 return room;
}
function ui(){
 const script=fs.readFileSync('public/app.js','utf8');
 const context=vm.createContext({localStorage:{},document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{}});
 vm.runInContext(script+'\n;globalThis.exposed={motionEffects,blastEffects,board,state}',context);
 return context.exposed;
}
test('resolved MOVE draws Chibi sprite moving between authoritative squares, no new server rule',()=>{
 const r=setup();
 submitAction(r,'p1',{type:'move',dir:'right'});
 submitAction(r,'p2',{type:'overcharge'});
 assert.equal(r.players[0].x,2);
 assert.equal(r.players[0].hp,FRAME_STATS.phoenix.hp);
 const {motionEffects,state}=ui();state.fxStartedAt=Date.now();
 const html=motionEffects(r.lastTurn,r);
 assert.match(html,/motion-unit moving/);
 assert.match(html,/phoenix-sprite\.webp/);
 assert.match(html,/--from-x:30%;--from-y:30%;--to-x:50%;--to-y:30%/);
 assert.doesNotMatch(html,/\bDODGE BLOCKED\b/);
});
test('successful Dodge has separate fast purple streak, costs only existing 1 energy',()=>{
 const r=setup();
 submitAction(r,'p1',{type:'dodge',dir:'down'});
 submitAction(r,'p2',{type:'overcharge'});
 assert.equal(r.players[0].energy,0);
 assert.equal(r.players[0].y,2);
 const {motionEffects,state}=ui();state.fxStartedAt=Date.now();
 assert.match(motionEffects(r.lastTurn,r),/motion-unit dodge/);
 assert.match(fs.readFileSync('style.css','utf8'),/\.motion-unit\.dodge \.motion-streak/);
});
test('blocked Dodge says DODGE BLOCKED and retains server position and energy cost',()=>{
 const r=setup();
 Object.assign(r.players[0],{x:0,y:0});
 submitAction(r,'p1',{type:'dodge',dir:'up'});
 submitAction(r,'p2',{type:'shield'});
 assert.equal(r.players[0].energy,0);
 assert.equal(r.players[0].y,0);
 const {motionEffects,state}=ui();state.fxStartedAt=Date.now();
 const html=motionEffects(r.lastTurn,r);
 assert.match(html,/DODGE BLOCKED/);
 assert.doesNotMatch(html,/motion-unit dodge/);
});
test('ram visual also moves the pushed pilot using logged pushed positions',()=>{
 const r=setup();
 Object.assign(r.players[1],{x:2,y:1});
 submitAction(r,'p1',{type:'move',dir:'right'});
 submitAction(r,'p2',{type:'shield'});
 const {motionEffects,state}=ui();state.fxStartedAt=Date.now();
 const html=motionEffects(r.lastTurn,r);
 assert.match(html,/motion-unit moving/);assert.match(html,/motion-unit pushed/);
 assert.match(html,/astra-sprite\.webp/);
 assert.equal(r.players[1].x,3);
});
test('Phoenix alone gets beam, muzzle and enlarged impact while damage stays 28 base',()=>{
 const r=setup();
 Object.assign(r.players[1],{x:1,y:3});
 submitAction(r,'p1',{type:'blast',dir:'down'});
 submitAction(r,'p2',{type:'overcharge'});
 assert.equal(r.players[1].hp,FRAME_STATS.astra.hp-FRAME_STATS.phoenix.blast);
 const {blastEffects,state}=ui();state.fxStartedAt=Date.now();
 const html=blastEffects(r.lastTurn,r);
 assert.match(html,/combat-shot phoenix-heavy/);
 assert.match(html,/class="phoenix-muzzle"/);
 assert.match(html,/class="beam-core"/);
 assert.match(html,/>-28 HP/);
});
test('non-Phoenix blasts retain standard bolt without heavy beam or muzzle',()=>{
 const r=setup();
 Object.assign(r.players[1],{x:1,y:3});
 submitAction(r,'p1',{type:'shield'});
 submitAction(r,'p2',{type:'blast',dir:'up'});
 const {blastEffects,state}=ui();state.fxStartedAt=Date.now();
 const html=blastEffects(r.lastTurn,r);
 assert.match(html,/class="combat-shot "/);
 assert.doesNotMatch(html,/class="phoenix-muzzle"|class="beam-core"|class="combat-shot phoenix-heavy"/);
});
test('motion and Blast render on 5x5 and 6x6 without modifying the square grid',()=>{
 const {state,board}=ui();
 for(const n of [5,6,7]){
  state.room={boardSize:n,phase:'playing',players:[],round:2,code:'FX09'};
  state.fx=null;
  const html=board();
  assert.match(html,new RegExp(`grid-template-rows:repeat\\(${n},minmax\\(0,1fr\\)\\)`));
 }
});
test('deployed app and CSS copies remain identical',()=>{
 for(const p of ['public/app.js','dist/app.js'])assert.equal(fs.readFileSync(p,'utf8'),fs.readFileSync('app.js','utf8'));
 for(const p of ['public/style.css','dist/style.css'])assert.equal(fs.readFileSync(p,'utf8'),fs.readFileSync('style.css','utf8'));
});
