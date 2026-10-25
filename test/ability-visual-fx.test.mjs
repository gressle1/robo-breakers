import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRoomState,addPlayer,selectFrame,startGame,submitAction,FRAME_STATS} from '../src/game-engine.mjs';

function setup(){
 const room=createRoomState('FX10','p1','Pilot One');
 addPlayer(room,'p2','Pilot Two');
 selectFrame(room,'p1','phoenix');selectFrame(room,'p2','aurora');
 room.players[1].ready=true;startGame(room,'p1');
 Object.assign(room.players[0],{x:1,y:1});Object.assign(room.players[1],{x:2,y:1});
 return room;
}
function ui(){
 const source=fs.readFileSync('public/app.js','utf8');
 const c=vm.createContext({localStorage:{},document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{}});
 vm.runInContext(source+'\n;globalThis.exported={abilityEffects,board,state}',c);
 return c.exported;
}
test('active Shield produces a cyan protective pulse at server-reported square',()=>{
 const r=setup();submitAction(r,'p1',{type:'shield'});submitAction(r,'p2',{type:'overcharge'});
 const v=r.lastTurn.visuals.find(x=>x.type==='shield');assert.equal(v.active,true);
 const html=ui().abilityEffects(r.lastTurn,r);
 assert.match(html,/ability-shield active/);
 assert.match(html,/SHIELD ONLINE/);
 assert.match(html,/--fx-x:30%;--fx-y:30%/);
 assert.equal(r.players[0].hp,FRAME_STATS.phoenix.hp);
});
test('hack of an adjacent shielding unit draws a purple trace and disabled Shield',()=>{
 const r=setup();submitAction(r,'p1',{type:'hack',dir:'right'});submitAction(r,'p2',{type:'shield'});
 const hack=r.lastTurn.visuals.find(x=>x.type==='hack');
 const shield=r.lastTurn.visuals.find(x=>x.type==='shield');
 assert.equal(hack.success,true);assert.equal(shield.active,false);
 const html=ui().abilityEffects(r.lastTurn,r);
 assert.match(html,/ability-hack-trace/);assert.match(html,/ability-hack success/);assert.match(html,/HACKED/);
 assert.match(html,/ability-shield disabled/);assert.match(html,/SHIELD DISABLED/);
 assert.doesNotMatch(html,/SHIELD ONLINE/);
});
test('hack into empty space shows NO TARGET rather than a misleading hit',()=>{
 const r=setup();submitAction(r,'p1',{type:'hack',dir:'up'});submitAction(r,'p2',{type:'overcharge'});
 assert.equal(r.lastTurn.visuals.find(x=>x.type==='hack').success,false);
 const html=ui().abilityEffects(r.lastTurn,r);
 assert.match(html,/ability-hack fail/);assert.match(html,/NO TARGET/);
 assert.doesNotMatch(html,/ability-hack-trace/);
});
test('Overcharge shows +1 energy, retains existing energy logic, and does not activate Overdrive',()=>{
 const r=setup();const energy=r.players[0].energy;
 submitAction(r,'p1',{type:'overcharge'});submitAction(r,'p2',{type:'shield'});
 assert.equal(r.players[0].energy,energy+1);
 const html=ui().abilityEffects(r.lastTurn,r);
 assert.match(html,/ability-overcharge/);assert.match(html,/ϟ \+1 ENERGY/);
 assert.doesNotMatch(html,/OVERDRIVE/);
});
test('ability overlay needs a resolved visual and uses elapsed-time compensation',()=>{
 const r=setup(),{abilityEffects,state}=ui();
 assert.equal(abilityEffects(null,r),'');
 assert.equal(abilityEffects({visuals:[]},r),'');
 submitAction(r,'p1',{type:'shield'});submitAction(r,'p2',{type:'overcharge'});
 state.fxStartedAt=Date.now()-1000;
 const html=abilityEffects(r.lastTurn,r);
 assert.match(html,/--fx-age:-\d+ms/);
 assert.match(html,/aria-hidden="true"/);
});
test('ability overlay stays responsive and does not change board layout at 5x5 or 6x6',()=>{
 const {board,state}=ui();
 for(const n of [5,6]){
  state.fx=null;state.room={boardSize:n,phase:'playing',players:[],round:1,code:'FX10'};
  const html=board();
  assert.match(html,new RegExp(`grid-template-rows:repeat\\(${n},minmax\\(0,1fr\\)\\)`));
  assert.equal((html.match(/class="tile /g)||[]).length,n*n);
 }
});
test('frontend mirrors match; server engine files remain synchronized and unchanged by this patch',()=>{
 for(const p of ['public/app.js','dist/app.js'])assert.equal(fs.readFileSync(p,'utf8'),fs.readFileSync('app.js','utf8'));
 for(const p of ['public/style.css','dist/style.css'])assert.equal(fs.readFileSync(p,'utf8'),fs.readFileSync('style.css','utf8'));
 assert.equal(fs.readFileSync('src/game-engine.mjs','utf8'),fs.readFileSync('game-engine.mjs','utf8'));
 const css=fs.readFileSync('style.css','utf8');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.ability-shield\.disabled/);
 assert.match(css,/\.ability-hack-trace/);
});
