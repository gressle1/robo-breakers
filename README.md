# Robo Breakers — Last Bot Standing

A browser-first multiplayer strategy arena for 2–8 players. Every living player secretly chooses a command, everyone locks in, and the authoritative game server resolves all actions together. Last bot standing wins.

## Contest target
OpenAI multiplayer game challenge — submission deadline: **October 31, 2026**.

## Current milestone: v0.2 playable core
- Create a room and receive a 4-character room code.
- Copy/share the room code from the lobby.
- 2–8 players can join the same running server from separate browser sessions/devices.
- Non-host players ready up; host starts the match.
- Board size scales by player count: 2 = 5x5, 3–4 = 6x6, 5–8 = 7x7.
- Each living player secretly locks one command: Move, Blast, Shield, Hack, or Overcharge.
- Submitted actions stay secret; clients only see whether another player has locked in.
- When all living players lock in, the authoritative server resolves the round deterministically.
- Blast, Shield, Hack, movement/pushing, HP, eliminations, winner state, stats, and one-click host rematch work.
- Responsive browser UI supports desktop and phone-sized screens.
- Automated engine tests plus a full HTTP create → join → ready → play → winner → rematch test.

## Rules
- **Move**: move one tile in a direction; moving into a bot can push it if the next tile is free.
- **Blast**: fire in one direction; the first bot in the line takes 1 damage unless shielded.
- **Shield**: blocks an incoming blast for the round unless disabled by a Hack.
- **Hack**: targets an adjacent bot, disables its shield for the round, and currently grants +1 energy on success.
- **Overcharge**: gain +1 energy.
- Every bot starts with 3 HP and 1 energy.
- Last surviving robot wins.

## Run locally
Requires Node.js 18+.

```bash
npm run dev
```

Open `http://localhost:5173`.

For two-player testing on one computer, use a normal browser window plus an Incognito/Private window. For LAN testing, open `http://YOUR-COMPUTER-LAN-IP:5173` from another device while the server is running and your firewall permits it.

## Tests
```bash
npm test
node test/e2e.mjs
```

## Architecture
The current prototype deliberately keeps the game engine independent from the HTTP server and UI:

```text
Browser clients
      |
      | HTTP actions + state polling
      v
Node authoritative room server
      |
      v
game-engine.mjs
(deterministic rules and resolution)
```

The contest deployment will replace the prototype's in-memory room store with durable shared state suitable for public cross-network play, while preserving the game engine and browser flow.

## Next contest milestones
1. Durable public multiplayer backend and Netlify-ready production deployment.
2. Session recovery/reconnect plus safer room lifecycle rules.
3. Arena hazards and late-game reactor collapse.
4. A focused contest upgrade set with deterministic energy costs/effects.
5. Reveal/countdown presentation, contextual announcer, impact feedback, and sound/mute.
6. Mobile usability/accessibility/readability pass.
7. Multi-device production testing and public URL verification.
