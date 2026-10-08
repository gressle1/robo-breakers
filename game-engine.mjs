export const ACTIONS = ['move', 'blast', 'shield', 'hack', 'overcharge'];
export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const DISCONNECT_GRACE_MS = 30_000;

const SPAWNS = {
  5: [[0,0],[4,4]],
  6: [[0,0],[5,5],[5,0],[0,5]],
  7: [[0,0],[6,6],[6,0],[0,6],[3,0],[3,6],[0,3],[6,3]],
};

export function boardSizeFor(count) {
  return count <= 2 ? 5 : count <= 4 ? 6 : 7;
}

export function sanitizeName(name) {
  return String(name ?? '').trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 16) || 'Player';
}

function newPlayer(id, name) {
  return {
    id,
    name: sanitizeName(name),
    ready: false,
    hp: 3,
    energy: 1,
    alive: true,
    x: 0,
    y: 0,
    action: null,
    shielded: false,
    hacked: false,
    damageDealt: 0,
    eliminations: 0,
    lastSeen: Date.now(),
  };
}

export function createRoomState(code, hostId, hostName) {
  return {
    code,
    phase: 'lobby',
    hostId,
    round: 0,
    boardSize: 5,
    players: [newPlayer(hostId, hostName)],
    log: ['Room created.'],
    winnerIds: [],
    lastTurn: null,
    interruptReason: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addPlayer(room, id, name) {
  if (room.phase !== 'lobby') throw new Error('Game already started.');
  if (room.players.length >= 8) throw new Error('Room is full.');
  if (room.players.some(p => p.id === id)) return room;
  const cleanName = sanitizeName(name);
  const taken = room.players.some(p => p.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase());
  if (taken) throw new Error('Pilot name already in use. Choose another callsign.');
  room.players.push(newPlayer(id, cleanName));
  room.updatedAt = Date.now();
  room.log.push(`${cleanName} joined the room.`);
  return room;
}

export function touchPlayer(room, playerId, now = Date.now()) {
  const p = room.players.find(x => x.id === playerId);
  if (!p) throw new Error('Player not found.');
  p.lastSeen = now;
  room.updatedAt = now;
  return room;
}

function transferHost(room) {
  if (room.players.length && !room.players.some(p => p.id === room.hostId)) {
    room.hostId = room.players[0].id;
    room.log.push(`${room.players[0].name} is now the host.`);
  }
}

export function leaveRoom(room, playerId, reason = 'left the arena') {
  const index = room.players.findIndex(p => p.id === playerId);
  if (index < 0) return room;
  const [leaver] = room.players.splice(index, 1);
  room.log.push(`${leaver.name} ${reason}.`);
  transferHost(room);

  if (room.players.length === 0) {
    room.phase = 'abandoned';
    room.interruptReason = 'The arena is empty.';
  } else if (room.phase === 'playing') {
    if (room.players.length < 2) {
      room.phase = 'interrupted';
      room.interruptReason = `${leaver.name} ${reason}.`;
      room.winnerIds = [];
      room.lastTurn = null;
      for (const p of room.players) p.action = null;
      room.log.push('MATCH INTERRUPTED — opponent left the arena.');
    } else {
      const alive = room.players.filter(p => p.alive);
      if (alive.length > 1 && alive.every(p => p.action)) resolveRound(room);
      if (alive.length <= 1) {
        room.phase = 'interrupted';
        room.interruptReason = `${leaver.name} ${reason}.`;
        room.winnerIds = [];
        for (const p of room.players) p.action = null;
      }
    }
  } else if (room.phase === 'finished') {
    room.winnerIds = room.winnerIds.filter(id => room.players.some(p => p.id === id));
  }

  room.updatedAt = Date.now();
  return room;
}

export function cleanupInactivePlayers(room, now = Date.now(), graceMs = DISCONNECT_GRACE_MS) {
  const stale = room.players.filter(p => now - (p.lastSeen || 0) > graceMs).map(p => p.id);
  for (const id of stale) leaveRoom(room, id, 'lost connection');
  return room;
}

export function startGame(room, requesterId) {
  if (room.hostId !== requesterId) throw new Error('Only the host can start.');
  if (room.players.length < 2) throw new Error('At least 2 players are required.');
  if (!room.players.every(p => p.ready || p.id === room.hostId)) throw new Error('All non-host players must be ready.');
  room.phase = 'playing';
  room.round = 1;
  room.boardSize = boardSizeFor(room.players.length);
  resetPlayersForMatch(room);
  assignSpawns(room);
  room.lastTurn = null;
  room.interruptReason = '';
  room.log = ['ROUND 1 — choose your command.'];
  room.updatedAt = Date.now();
  return room;
}

function resetPlayersForMatch(room) {
  for (const p of room.players) {
    p.hp = 3;
    p.energy = 1;
    p.alive = true;
    p.action = null;
    p.shielded = false;
    p.hacked = false;
    p.damageDealt = 0;
    p.eliminations = 0;
  }
  room.winnerIds = [];
}

function assignSpawns(room) {
  const coords = SPAWNS[room.boardSize] || SPAWNS[7];
  room.players.forEach((p, i) => {
    p.x = coords[i][0];
    p.y = coords[i][1];
  });
}

export function submitAction(room, playerId, action) {
  if (room.phase !== 'playing') throw new Error('The game is not accepting actions.');
  const p = room.players.find(x => x.id === playerId);
  if (!p || !p.alive) throw new Error('Player cannot act.');
  validateAction(action);
  p.action = action;
  p.lastSeen = Date.now();
  room.updatedAt = Date.now();
  const alive = room.players.filter(x => x.alive);
  if (alive.every(x => x.action)) resolveRound(room);
  return room;
}

function validateAction(action) {
  if (!action || !ACTIONS.includes(action.type)) throw new Error('Invalid action.');
  if (['move', 'blast', 'hack'].includes(action.type) && !DIRS[action.dir]) throw new Error('Direction required.');
}

function playerAt(room, x, y) {
  return room.players.find(p => p.alive && p.x === x && p.y === y);
}

function inBounds(room, x, y) {
  return x >= 0 && y >= 0 && x < room.boardSize && y < room.boardSize;
}

function adjacentPlayer(room, player, dir) {
  const d = DIRS[dir];
  return playerAt(room, player.x + d.x, player.y + d.y);
}

export function resolveRound(room) {
  const events = [];
  const visuals = [];
  const alive = room.players.filter(p => p.alive);
  const resolvedRound = room.round;
  const revealedActions = alive.map(p => ({
    id: p.id,
    name: p.name,
    action: structuredClone(p.action),
    before: { x: p.x, y: p.y, hp: p.hp, energy: p.energy, alive: p.alive },
  }));
  for (const p of alive) { p.shielded = false; p.hacked = false; }

  // 1. Hacks resolve first.
  for (const p of alive) {
    if (p.action?.type !== 'hack') continue;
    const target = adjacentPlayer(room, p, p.action.dir);
    visuals.push({ type: 'hack', actorId: p.id, from: {x:p.x,y:p.y}, dir: p.action.dir, targetId: target?.id || null, target: target ? {x:target.x,y:target.y} : null, success: Boolean(target) });
    if (target) {
      target.hacked = true;
      p.energy += 1;
      events.push(`${p.name} hacked ${target.name}.`);
    } else {
      events.push(`${p.name}'s hack found nothing.`);
    }
  }

  // 2. Shields activate unless hacked this round.
  for (const p of alive) {
    if (p.action?.type === 'shield') {
      const active = !p.hacked;
      visuals.push({ type: 'shield', actorId: p.id, at: {x:p.x,y:p.y}, active });
      if (p.hacked) events.push(`${p.name}'s shield was disabled.`);
      else { p.shielded = true; events.push(`${p.name} raised a shield.`); }
    }
  }

  // 3. Overcharge.
  for (const p of alive) {
    if (p.action?.type === 'overcharge') {
      p.energy += 1;
      visuals.push({ type: 'overcharge', actorId: p.id, at: {x:p.x,y:p.y} });
      events.push(`${p.name} overcharged (+1 energy).`);
    }
  }

  // 4. Movement and pushes, deterministic by player order.
  for (const p of alive) {
    if (!p.alive || p.action?.type !== 'move') continue;
    const d = DIRS[p.action.dir];
    const from = {x:p.x,y:p.y};
    const nx = p.x + d.x, ny = p.y + d.y;
    if (!inBounds(room, nx, ny)) {
      visuals.push({ type:'move', actorId:p.id, from, to:from, blocked:true, dir:p.action.dir });
      events.push(`${p.name} hit the arena wall.`);
      continue;
    }
    const blocker = playerAt(room, nx, ny);
    if (!blocker) {
      p.x = nx; p.y = ny;
      visuals.push({ type:'move', actorId:p.id, from, to:{x:nx,y:ny}, dir:p.action.dir });
      events.push(`${p.name} moved ${p.action.dir}.`);
      continue;
    }
    const bx = blocker.x + d.x, by = blocker.y + d.y;
    if (inBounds(room, bx, by) && !playerAt(room, bx, by)) {
      const pushedFrom = {x:blocker.x,y:blocker.y};
      blocker.x = bx; blocker.y = by;
      p.x = nx; p.y = ny;
      visuals.push({ type:'move', actorId:p.id, from, to:{x:nx,y:ny}, dir:p.action.dir, pushedId:blocker.id, pushedFrom, pushedTo:{x:bx,y:by} });
      events.push(`${p.name} rammed ${blocker.name}.`);
    } else {
      visuals.push({ type:'move', actorId:p.id, from, to:from, blocked:true, dir:p.action.dir });
      events.push(`${p.name} couldn't push ${blocker.name}.`);
    }
  }

  // 5. Blasts.
  for (const p of alive) {
    if (!p.alive || p.action?.type !== 'blast') continue;
    const d = DIRS[p.action.dir];
    const path = [];
    const from = {x:p.x,y:p.y};
    let x = p.x + d.x, y = p.y + d.y;
    let target = null;
    while (inBounds(room, x, y)) {
      path.push({x,y});
      target = playerAt(room, x, y);
      if (target) break;
      x += d.x; y += d.y;
    }
    if (!target) {
      visuals.push({ type:'blast', actorId:p.id, from, dir:p.action.dir, path, targetId:null, blocked:false, hit:false });
      events.push(`${p.name} fired into empty space.`);
      continue;
    }
    if (target.shielded) {
      visuals.push({ type:'blast', actorId:p.id, from, dir:p.action.dir, path, targetId:target.id, blocked:true, hit:true });
      events.push(`${target.name} blocked ${p.name}'s blast.`);
    } else {
      target.hp -= 1;
      p.damageDealt += 1;
      visuals.push({ type:'blast', actorId:p.id, from, dir:p.action.dir, path, targetId:target.id, blocked:false, hit:true, eliminated:target.hp <= 0 });
      events.push(`${p.name} blasted ${target.name} (-1 HP).`);
      if (target.hp <= 0 && target.alive) {
        target.alive = false;
        p.eliminations += 1;
        events.push(`${target.name} HAS BEEN DECOMPILED.`);
      }
    }
  }

  for (const a of revealedActions) {
    const p = room.players.find(x => x.id === a.id);
    a.after = p ? { x:p.x, y:p.y, hp:p.hp, energy:p.energy, alive:p.alive } : null;
  }

  const survivors = room.players.filter(p => p.alive);
  if (survivors.length <= 1) {
    room.phase = 'finished';
    room.winnerIds = survivors.length === 1 ? [survivors[0].id] : determineTieWinners(room);
    const names = room.players.filter(p => room.winnerIds.includes(p.id)).map(p => p.name);
    events.push(`WINNER: ${names.join(' & ')}`);
  } else {
    room.round += 1;
    for (const p of room.players) p.action = null;
    events.push(`ROUND ${room.round} — choose your command.`);
  }
  room.lastTurn = { round: resolvedRound, actions: revealedActions, visuals, events: [...events], resolvedAt: Date.now() };
  room.log = [...room.log, ...events].slice(-30);
  room.updatedAt = Date.now();
  return room;
}

function determineTieWinners(room) {
  const ranked = [...room.players].sort((a,b) => (b.hp-a.hp) || (b.damageDealt-a.damageDealt) || (b.eliminations-a.eliminations));
  if (!ranked.length) return [];
  const top = ranked[0];
  return ranked.filter(p => p.hp === top.hp && p.damageDealt === top.damageDealt && p.eliminations === top.eliminations).map(p => p.id);
}

export function rematch(room, requesterId) {
  if (room.hostId !== requesterId) throw new Error('Only the host can start a rematch.');
  if (room.phase !== 'finished') throw new Error('Game is not finished.');
  if (room.players.length < 2) throw new Error('At least 2 players are required.');
  room.phase = 'playing';
  room.round = 1;
  room.boardSize = boardSizeFor(room.players.length);
  resetPlayersForMatch(room);
  assignSpawns(room);
  room.lastTurn = null;
  room.interruptReason = '';
  room.log = ['REMATCH — ROUND 1.'];
  room.updatedAt = Date.now();
  return room;
}

export function returnToLobby(room, requesterId) {
  if (room.phase !== 'interrupted') throw new Error('Match is not interrupted.');
  if (room.hostId !== requesterId) throw new Error('Only the host can return the room to the lobby.');
  room.phase = 'lobby';
  room.round = 0;
  room.lastTurn = null;
  room.interruptReason = '';
  room.winnerIds = [];
  for (const p of room.players) {
    p.ready = false;
    p.action = null;
    p.hp = 3;
    p.energy = 1;
    p.alive = true;
    p.shielded = false;
    p.hacked = false;
  }
  room.log = ['Returned to lobby.'];
  room.updatedAt = Date.now();
  return room;
}

export function publicRoom(room) {
  return {
    ...room,
    players: room.players.map(({ action, lastSeen, ...p }) => ({ ...p, lockedIn: Boolean(action) })),
  };
}
