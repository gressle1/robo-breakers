# Robo Breakers — Last Bot Standing

Robo Breakers is a browser-first 2–8 player multiplayer strategy arena. Every living player secretly chooses a command, everyone locks in, and an authoritative backend resolves all actions together. Last bot standing wins.

## Contest target
OpenAI multiplayer game challenge — submission deadline: **October 31, 2026**.

## v0.3 — Netlify multiplayer milestone
- Static frontend builds to `dist/` for Netlify hosting.
- Standard Netlify Function at `netlify/functions/game.ts`.
- Frontend calls `/.netlify/functions/game` directly.
- Netlify Blobs stores shared room state so players on different devices/networks can access the same room.
- Strong consistency is enabled for room reads.
- Conditional writes (`onlyIfNew` and `onlyIfMatch`) prevent accidental room overwrites and reduce race-condition bugs.
- 2–8 player lobby, ready/start flow, simultaneous actions, winner detection, and rematch remain intact.

## Architecture

```text
Browser clients
      |
      | HTTPS polling + actions
      v
/.netlify/functions/game
      |
      | strong-consistency reads
      | conditional writes
      v
Netlify Blobs
      |
      v
Shared authoritative room state
```

## Local checks

```bash
npm install
npm test
npm run build
```

The production build output is `dist/`.

## Rules
- **Move**: move one tile in a direction; moving into a bot can push it if the next tile is free.
- **Blast**: fire in one direction; the first bot in the line takes 1 damage unless shielded.
- **Shield**: blocks an incoming blast for the round unless disabled by a Hack.
- **Hack**: targets an adjacent bot and disables its shield for the round.
- **Overcharge**: gain +1 energy.
- Every bot starts with 3 HP and 1 energy.
- Last surviving robot wins.
