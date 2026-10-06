import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRoomState, addPlayer, startGame, submitAction, rematch, publicRoom } from './game-engine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const rooms = new Map();
const port = Number(process.env.PORT || 5173);

function id() { return crypto.randomUUID(); }
function code() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  do { out = Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join(''); } while (rooms.has(out));
  return out;
}
function json(res, status, body) {
  res.writeHead(status, {'content-type':'application/json','cache-control':'no-store'});
  res.end(JSON.stringify(body));
}
async function body(req) {
  let raw=''; for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
function getRoom(c) {
  const r = rooms.get(String(c || '').toUpperCase());
  if (!r) throw new Error('Room not found.');
  return r;
}

const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/create' && req.method === 'POST') {
      const b = await body(req); const playerId = id(); const roomCode = code();
      const room = createRoomState(roomCode, playerId, b.name); rooms.set(roomCode, room);
      return json(res,200,{playerId,room:publicRoom(room)});
    }
    if (url.pathname === '/api/join' && req.method === 'POST') {
      const b = await body(req); const playerId = id(); const room = getRoom(b.code);
      addPlayer(room, playerId, b.name); return json(res,200,{playerId,room:publicRoom(room)});
    }
    if (url.pathname === '/api/state' && req.method === 'GET') {
      return json(res,200,{room:publicRoom(getRoom(url.searchParams.get('code')))});
    }
    if (url.pathname === '/api/ready' && req.method === 'POST') {
      const b = await body(req); const room = getRoom(b.code); const p = room.players.find(x=>x.id===b.playerId);
      if (!p) throw new Error('Player not found.'); p.ready = Boolean(b.ready); room.updatedAt=Date.now();
      return json(res,200,{room:publicRoom(room)});
    }
    if (url.pathname === '/api/start' && req.method === 'POST') {
      const b=await body(req); const room=getRoom(b.code); startGame(room,b.playerId); return json(res,200,{room:publicRoom(room)});
    }
    if (url.pathname === '/api/action' && req.method === 'POST') {
      const b=await body(req); const room=getRoom(b.code); submitAction(room,b.playerId,b.action); return json(res,200,{room:publicRoom(room)});
    }
    if (url.pathname === '/api/rematch' && req.method === 'POST') {
      const b=await body(req); const room=getRoom(b.code); rematch(room,b.playerId); return json(res,200,{room:publicRoom(room)});
    }
    if (url.pathname === '/health') return json(res,200,{ok:true,rooms:rooms.size});

    let filePath = url.pathname === '/' ? path.join(publicDir,'index.html') : path.join(publicDir,url.pathname);
    if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath=path.join(publicDir,'index.html');
    const ext=path.extname(filePath); const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
    res.writeHead(200,{'content-type':types[ext]||'text/plain'}); fs.createReadStream(filePath).pipe(res);
  } catch (err) { json(res,400,{error:err.message || 'Request failed.'}); }
});
server.listen(port,'0.0.0.0',()=>console.log(`Robo Breakers running on http://localhost:${port}`));
