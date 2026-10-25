import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  createRoomState, addPlayer, selectFrame, startGame, submitAction,
  FRAME_STATS, PHOENIX_OVERDRIVE_BLAST, blastDamage
} from '../src/game-engine.mjs';

function game(a='astra', b='juggernaut') {
  const r = createRoomState('ODFIX', 'p1', 'One');
  addPlayer(r, 'p2', 'Two');
  selectFrame(r, 'p1', a); selectFrame(r, 'p2', b);
  r.players[1].ready = true; startGame(r,'p1');
  Object.assign(r.players[0], { x: 1, y: 1 });
  Object.assign(r.players[1], { x: 4, y: 4 });
  return r;
}
function turn(r, a, b={type:'overcharge'}) { submitAction(r,'p1',a); submitAction(r,'p2',b); }
function activate(r) {r.players[0].energy=3;turn(r,{type:'overdrive'});assert.equal(r.players[0].overdriveRounds,3);}
function frontend() {
  const src=fs.readFileSync('public/app.js','utf8');
  const c=vm.createContext({ localStorage:{},document:{querySelector:s=>s==='#app'?{innerHTML:''}:null,querySelectorAll:()=>[],addEventListener:()=>{}},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{} });
  vm.runInContext(src+'\n;globalThis.UI={FRAMES,botPiece,abilityEffects,blastEffects,motionEffects,state}',c);
  return c.UI;
}

test('Astra uses exactly 3 spaces during Overdrive and 1 when inactive',()=>{
  const r=game();
  turn(r,{type:'move',dir:'left'}); assert.equal(r.players[0].x,0);
  activate(r);
  turn(r,{type:'move',dir:'right'}); assert.equal(r.players[0].x,3);
  assert.equal(r.players[0].overdriveRounds,2);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,3);
  assert.match(r.lastTurn.events.join(' '),/moved right 3 squares/);
  for (let i=0;i<2;i++)turn(r,{type:'shield'});
  assert.equal(r.players[0].overdriveRounds,0);
  turn(r,{type:'move',dir:'right'});assert.equal(r.players[0].x,4);
});

test('Astra never crosses the board boundary: a three-step move can stop after one cell',()=>{
  const r=game();r.players[0].x=3;r.players[0].y=0;activate(r);
  turn(r,{type:'move',dir:'right'});
  assert.equal(r.players[0].x,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,1);
});

test('Astra cannot pass an occupied intermediate square, and ram ends movement',()=>{
  const r=game();Object.assign(r.players[1],{x:2,y:1});activate(r);
  turn(r,{type:'move',dir:'right'}, {type:'shield'});
  assert.equal(r.players[0].x,2);
  assert.equal(r.players[1].x,3);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,1);
  assert.match(r.lastTurn.events.join(' '),/rammed Two/);
});

test('Astra stops before an unpushable second-square blocker without teleporting',()=>{
  const r=game();r.players[0].x=1;r.players[0].y=0;Object.assign(r.players[1],{x:3,y:0});activate(r);
  // Target's next position (4,0) is still in bounds and empty, so a ram can occur.
  // Put both near the right border instead to exercise a blocked second step.
  r.players[0].x=2;r.players[1].x=4;
  turn(r,{type:'move',dir:'right'}, {type:'shield'});
  assert.equal(r.players[0].x,3);
  assert.equal(r.players[1].x,4);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='move').steps,1);
  assert.match(r.lastTurn.events.join(' '),/stopped short/);
});

test('Dodge is still one square and costs one energy even during Astra Overdrive',()=>{
  const r=game();activate(r);
  r.players[0].energy=2;
  turn(r,{type:'dodge',dir:'right'});
  assert.equal(r.players[0].x,2);
  assert.equal(r.players[0].energy,1);
  r.players[0].x=0;
  turn(r,{type:'dodge',dir:'left'});
  assert.equal(r.players[0].x,0);
  assert.equal(r.players[0].energy,0);
});

test('Aurora retains 2-square Overdrive movement; other frames stay at 1',()=>{
  for(const [frame,steps] of [['aurora',2],['phoenix',1],['juggernaut',1]]){
    const r=game(frame,'astra'); activate(r);
    turn(r,{type:'move',dir:'right'});assert.equal(r.players[0].x,1+steps,frame);
  }
});

test('Phoenix base Blast is 28, Overdrive Blast is 35 before armor',()=>{
  assert.equal(PHOENIX_OVERDRIVE_BLAST,35);
  assert.equal(blastDamage({frame:'phoenix',overdriveRounds:0},{frame:'astra'}),28);
  assert.equal(blastDamage({frame:'phoenix',overdriveRounds:3},{frame:'astra'}),35);
  assert.equal(blastDamage({frame:'phoenix',overdriveRounds:3},{frame:'juggernaut'}),28);
  assert.equal(blastDamage({frame:'phoenix',overdriveRounds:0},{frame:'juggernaut'}),22);
});

test('Phoenix boosted damage applies on last active round and ends immediately after it',()=>{
  const r=game('phoenix','juggernaut');r.players[1].x=4;r.players[1].y=1;activate(r);
  turn(r,{type:'blast',dir:'right'}, {type:'overcharge'});
  assert.equal(r.players[1].hp,150-28);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='blast').overdriveBoosted,true);
  turn(r,{type:'shield'});
  turn(r,{type:'blast',dir:'right'}, {type:'overcharge'});
  assert.equal(r.players[1].hp,150-56);
  assert.equal(r.players[0].overdriveRounds,0);
  turn(r,{type:'blast',dir:'right'}, {type:'overcharge'});
  assert.equal(r.players[1].hp,150-56-22);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='blast').overdriveBoosted,false);
});

test('Shield still fully blocks Phoenix Overdrive Blast',()=>{
  const r=game('phoenix','astra');r.players[1].x=4;r.players[1].y=1;activate(r);
  turn(r,{type:'blast',dir:'right'}, {type:'shield'});
  assert.equal(r.players[1].hp,100);
  assert.equal(r.lastTurn.visuals.find(v=>v.type==='blast').damage,0);
});

test('All four frames retain their own aura palette, no hardcoded gold Overdrive glows',()=>{
  const colors={juggernaut:'#50AE72',phoenix:'#EE5A63',astra:'#48B7FF',aurora:'#FF9C47'};
  const {botPiece,abilityEffects,FRAMES}=frontend();
  for(const frame of FRAMES){
    assert.equal(frame.color,colors[frame.id]);
    const html=botPiece({ id:'p1',name:'Test',frame:frame.id,hp:50,energy:0,overdriveRounds:2,alive:true },0);
    assert.match(html,new RegExp(`--fc:${colors[frame.id]}`));
    assert.match(html,/overdrive-active/);
    const r={ boardSize:5,players:[{id:'p1',frame:frame.id}] };
    const fx=abilityEffects({visuals:[{type:'overdrive',actorId:'p1',at:{x:1,y:1}}]},r);
    assert.ok(fx.includes(`--ability-color:${colors[frame.id]}`));
  }
  const css=fs.readFileSync('style.css','utf8');
  assert.match(css,/\.bot\.overdrive-active \.sprite-token\{filter:drop-shadow\(0 0 9px var\(--fc\)\)/);
  assert.match(css,/\.ability-overdrive \.overdrive-burst\{[^}]*border:4px solid var\(--ability-color\)/);
});

test('Phoenix Overdrive beam uses boosted visual only when actual resolved turn shows boosted shot',()=>{
  const r=game('phoenix','juggernaut');r.players[1].x=4;r.players[1].y=1;activate(r);
  turn(r,{type:'blast',dir:'right'});
  const ui=frontend();ui.state.fxStartedAt=Date.now();
  let html=ui.blastEffects(r.lastTurn,r);
  assert.match(html,/phoenix-heavy phoenix-overdrive/);
  assert.match(html,/>-28 HP/); // 35 output after Juggernaut armor
  r.players[0].overdriveRounds=0;
  turn(r,{type:'blast',dir:'right'});
  html=ui.blastEffects(r.lastTurn,r);
  assert.match(html,/phoenix-heavy/);
  assert.doesNotMatch(html,/phoenix-overdrive/);
});
