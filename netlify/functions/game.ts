import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import crypto from 'node:crypto';
import {
  createRoomState,
  addPlayer,
  startGame,
  submitAction,
  rematch,
  publicRoom,
} from '../../src/game-engine.mjs';

type Room = ReturnType<typeof createRoomState>;
const STORE = 'robo-breakers-rooms';
const MAX_RETRIES = 8;

const store = () => getStore({ name: STORE, consistency: 'strong' });
const keyFor = (code: string) => `room:${String(code || '').toUpperCase()}`;
const playerId = () => crypto.randomUUID();

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store, max-age=0' },
  });
}

async function parseBody(req: Request) {
  try { return await req.json(); } catch { return {}; }
}

function roomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function getRoom(code: string): Promise<Room> {
  const room = await store().get(keyFor(code), { type: 'json', consistency: 'strong' }) as Room | null;
  if (!room) throw new Error('Room not found.');
  return room;
}

async function createRoom(name: string) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = roomCode();
    const id = playerId();
    const room = createRoomState(code, id, name);
    const result = await store().setJSON(keyFor(code), room, { onlyIfNew: true });
    if (result.modified) return { playerId: id, room: publicRoom(room) };
  }
  throw new Error('Could not create a room. Please try again.');
}

async function mutateRoom(code: string, mutate: (room: Room) => void | Room) {
  const key = keyFor(code);
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const current = await store().getWithMetadata(key, { type: 'json', consistency: 'strong' }) as { data: Room | null; etag?: string };
    if (!current.data || !current.etag) throw new Error('Room not found.');
    const room = structuredClone(current.data);
    mutate(room);
    room.updatedAt = Date.now();
    const result = await store().setJSON(key, room, { onlyIfMatch: current.etag });
    if (result.modified) return room;
  }
  throw new Error('The room changed at the same time. Please try again.');
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
    const url = new URL(req.url);

    if (req.method === 'GET') {
      const op = url.searchParams.get('op');
      if (op === 'state') {
        const room = await getRoom(url.searchParams.get('code') || '');
        return json({ room: publicRoom(room) });
      }
      if (op === 'health') return json({ ok: true });
      return json({ error: 'Unknown operation.' }, 404);
    }

    if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    const body: any = await parseBody(req);
    const op = body.op;

    if (op === 'create') return json(await createRoom(body.name));

    if (op === 'join') {
      const id = playerId();
      const room = await mutateRoom(body.code, r => { addPlayer(r, id, body.name); });
      return json({ playerId: id, room: publicRoom(room) });
    }

    if (op === 'ready') {
      const room = await mutateRoom(body.code, r => {
        const p = r.players.find((x: any) => x.id === body.playerId);
        if (!p) throw new Error('Player not found.');
        p.ready = Boolean(body.ready);
      });
      return json({ room: publicRoom(room) });
    }

    if (op === 'start') {
      const room = await mutateRoom(body.code, r => { startGame(r, body.playerId); });
      return json({ room: publicRoom(room) });
    }

    if (op === 'action') {
      const room = await mutateRoom(body.code, r => { submitAction(r, body.playerId, body.action); });
      return json({ room: publicRoom(room) });
    }

    if (op === 'rematch') {
      const room = await mutateRoom(body.code, r => { rematch(r, body.playerId); });
      return json({ room: publicRoom(room) });
    }

    return json({ error: 'Unknown operation.' }, 404);
  } catch (error: any) {
    return json({ error: error?.message || 'Request failed.' }, 400);
  }
};
