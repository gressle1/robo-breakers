import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
function lobbyFixture(name = 'TesterPilot') {
  return {
    code:'TEST', phase:'lobby', hostId:'pilot-1', round:0, boardSize:5,
    players:[{id:'pilot-1', name, frame:null, ready:false, hp:3, energy:1,
      overdriveRounds:0, alive:true, x:0,y:0,shielded:false,dodging:false,
      hacked:false,damageDealt:0,eliminations:0,lockedIn:false}],
    log:['Room created.'],winnerIds:[],lastTurn:null,interruptReason:'',
    createdAt:1,updatedAt:1,
  };
}
function loadApp(saved = {}) {
  const app = {innerHTML:''};
  const localStorage = {
    ...saved, removeItem(key){ delete this[key]; },
  };
  const room = lobbyFixture();
  const fetch = async (url, options = {}) => {
    const payload=options.body ? JSON.parse(options.body) : {};
    const op=payload.op || new URL('https://example.test'+url).searchParams.get('op');
    if (op==='create') return {ok:true,json:async()=>({playerId:'pilot-1',room})};
    if (op==='selectFrame') {
      room.players[0].frame=payload.frame;
      return {ok:true,json:async()=>({room})};
    }
    if (op==='state' || op==='heartbeat') return {ok:true,json:async()=>({room})};
    throw Error(`Unexpected API operation ${op}`);
  };
  const document={
    querySelector(selector){return selector==='#app'?app:null;},
    querySelectorAll(){return [];},
    addEventListener(){},
  };
  const sandbox=vm.createContext({document,localStorage,fetch,
    setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},
    navigator:{clipboard:{writeText:async()=>{}}}, console, Date});
  vm.runInContext(source,sandbox,{filename:'app.js'});
  return {sandbox,app,room,localStorage};
}

test('Cold load shows the pilot registration screen',()=>{
  const {app}=loadApp();
  assert.match(app.innerHTML,/PILOT CALLSIGN/);
  assert.match(app.innerHTML,/CREATE/i);
});

test('Create Room renders the lobby and pilot without a missing frameColor error',async()=>{
  const {sandbox,app,localStorage}=loadApp();
  await vm.runInContext('(async()=>{state.pilotDraft="TesterPilot";await create()})()',sandbox);
  assert.match(app.innerHTML,/ROOM CODE/);
  assert.match(app.innerHTML,/TesterPilot/);
  assert.match(app.innerHTML,/--fc:#67f7a1/); // fallback palette before selecting a frame
  assert.equal(localStorage.rbCode,'TEST');
});

test('Returning to a saved lobby draws its player card instead of a blank page',async()=>{
  const {sandbox,app}=loadApp({rbCode:'TEST',rbPlayerId:'pilot-1'});
  await vm.runInContext('refresh()',sandbox);
  assert.match(app.innerHTML,/ROOM CODE/);
  assert.match(app.innerHTML,/TesterPilot/);
});

test('Selecting Phoenix updates the lobby card to the approved red frame color',async()=>{
  const {sandbox,app}=loadApp();
  await vm.runInContext('(async()=>{state.pilotDraft="TesterPilot";await create();await selectFrameChoice("phoenix")})()',sandbox);
  assert.match(app.innerHTML,/--fc:#EE5A63/);
  assert.match(app.innerHTML,/Phoenix/);
});
