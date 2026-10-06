export const ACTIONS = ['move', 'blast', 'shield', 'hack', 'overcharge'];
export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

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

export function createRoomState(code, hostId, hostName) {
  return {
    code,
    phase: 'lobby',
    hostId,
    round: 0,
    boardSize: 5,
    players: [{
      id: hostId,
      name: sanitizeName(hostName),
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
    }],
    log: ['Room created.'],
    winnerIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addPlayer(room, id, name) {
  if (room.phase !== 'lobby') throw new Error('Game already started.');
  if (room.players.length >= 8) throw new Error('Room is full.');
  if (room.players.some(p => p.id === id)) return room;
  room.players.push({
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
  });
  room.updatedAt = Date.now();
  room.log.push(`${sanitizeName(name)} joined the room.`);
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
  validateAction(action, room.boardSize);
  p.action = action;
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
  const alive = room.players.filter(p => p.alive);
  for (const p of alive) { p.shielded = false; p.hacked = false; }

  // 1. Hacks resolve first.
  for (const p of alive) {
    if (p.action?.type !== 'hack') continue;
    const target = adjacentPlayer(room, p, p.action.dir);
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
      if (p.hacked) events.push(`${p.name}'s shield was disabled.`);
      else { p.shielded = true; events.push(`${p.name} raised a shield.`); }
    }
  }

  // 3. Overcharge.
  for (const p of alive) {
    if (p.action?.type === 'overcharge') {
      p.energy += 1;
      events.push(`${p.name} overcharged (+1 energy).`);
    }
  }

  // 4. Movement and pushes, deterministic by player order.
  for (const p of alive) {
    if (!p.alive || p.action?.type !== 'move') continue;
    const d = DIRS[p.action.dir];
    const nx = p.x + d.x, ny = p.y + d.y;
    if (!inBounds(room, nx, ny)) { events.push(`${p.name} hit the arena wall.`); continue; }
    const blocker = playerAt(room, nx, ny);
    if (!blocker) {
      p.x = nx; p.y = ny;
      events.push(`${p.name} moved ${p.action.dir}.`);
      continue;
    }
    const bx = blocker.x + d.x, by = blocker.y + d.y;
    if (inBounds(room, bx, by) && !playerAt(room, bx, by)) {
      blocker.x = bx; blocker.y = by;
      p.x = nx; p.y = ny;
      events.push(`${p.name} rammed ${blocker.name}.`);
    } else {
      events.push(`${p.name} couldn't push ${blocker.name}.`);
    }
  }

  // 5. Blasts.
  for (const p of alive) {
    if (!p.alive || p.action?.type !== 'blast') continue;
    const d = DIRS[p.action.dir];
    let x = p.x + d.x, y = p.y + d.y;
    let target = null;
    while (inBounds(room, x, y)) {
      target = playerAt(room, x, y);
      if (target) break;
      x += d.x; y += d.y;
    }
    if (!target) { events.push(`${p.name} fired into empty space.`); continue; }
    if (target.shielded) {
      events.push(`${target.name} blocked ${p.name}'s blast.`);
    } else {
      target.hp -= 1;
      p.damageDealt += 1;
      events.push(`${p.name} blasted ${target.name} (-1 HP).`);
      if (target.hp <= 0 && target.alive) {
        target.alive = false;
        p.eliminations += 1;
        events.push(`${target.name} HAS BEEN DECOMPILED.`);
      }
    }
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
  room.phase = 'playing';
  room.round = 1;
  room.boardSize = boardSizeFor(room.players.length);
  resetPlayersForMatch(room);
  assignSpawns(room);
  room.log = ['REMATCH — ROUND 1.'];
  room.updatedAt = Date.now();
  return room;
}

export function publicRoom(room) {
  return {
    ...room,
    players: room.players.map(({ action, ...p }) => ({ ...p, lockedIn: Boolean(action) })),
  };
}
