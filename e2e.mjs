import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const server = spawn(process.execPath, ['server.mjs'], { stdio: ['ignore','pipe','pipe'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function req(path, body) {
  const r = await fetch(`http://127.0.0.1:5173${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {'content-type':'application/json'},
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'request failed');
  return j;
}

try {
  let healthy = false;
  for (let i=0;i<30;i++) {
    try { await req('/health'); healthy = true; break; } catch { await sleep(100); }
  }
  assert.equal(healthy, true, 'server never became healthy');

  const host = await req('/api/create',{name:'Joe'});
  const code = host.room.code;
  const guest = await req('/api/join',{name:'Sam',code});

  await req('/api/ready',{code,playerId:guest.playerId,ready:true});
  let state = await req('/api/start',{code,playerId:host.playerId});
  assert.equal(state.room.phase,'playing');
  assert.equal(state.room.players.length,2);
  assert.equal(state.room.boardSize,5);

  // Verify secret lock-in state: only a boolean is exposed, never the selected action.
  state = await req('/api/action',{code,playerId:host.playerId,action:{type:'overcharge'}});
  assert.equal(state.room.players.find(p=>p.id===host.playerId).lockedIn,true);
  assert.equal('action' in state.room.players.find(p=>p.id===host.playerId), false);
  await assert.rejects(
    () => req('/api/action',{code,playerId:host.playerId,action:{type:'blast',dir:'down'}}),
    /already locked in/i,
    'a player must not be able to replace a secret command after locking it in',
  );
  state = await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});
  assert.equal(state.room.round,2);
  assert.equal(state.room.players.every(p=>!p.lockedIn),true);

  // Finish a real match through the public HTTP API. Spawn positions put Joe and Sam
  // on the same diagonal, so first move Joe left-to-right alignment is not guaranteed;
  // use three move rounds to bring both into column 4, then blast down three times.
  await req('/api/action',{code,playerId:host.playerId,action:{type:'move',dir:'right'}});
  await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});
  await req('/api/action',{code,playerId:host.playerId,action:{type:'move',dir:'right'}});
  await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});
  await req('/api/action',{code,playerId:host.playerId,action:{type:'move',dir:'right'}});
  await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});
  await req('/api/action',{code,playerId:host.playerId,action:{type:'move',dir:'right'}});
  await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});

  for (let hit=0; hit<3; hit++) {
    await req('/api/action',{code,playerId:host.playerId,action:{type:'blast',dir:'down'}});
    state = await req('/api/action',{code,playerId:guest.playerId,action:{type:'overcharge'}});
  }
  assert.equal(state.room.phase,'finished');
  assert.deepEqual(state.room.winnerIds,[host.playerId]);
  assert.equal(state.room.players.find(p=>p.id===guest.playerId).alive,false);

  state = await req('/api/rematch',{code,playerId:host.playerId});
  assert.equal(state.room.phase,'playing');
  assert.equal(state.room.round,1);
  assert.equal(state.room.players.every(p=>p.hp===3 && p.alive),true);
  assert.equal(state.room.players.every(p=>p.damageDealt===0 && p.eliminations===0),true);

  console.log(`E2E PASS room=${code} full-match-and-rematch players=${state.room.players.length}`);
} finally {
  server.kill('SIGTERM');
}
