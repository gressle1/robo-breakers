# Robo Breakers — Last Bot Standing

Robo Breakers is a browser-first 2–8 player multiplayer strategy arena. Every living player secretly chooses a command, everyone locks in, and an authoritative backend resolves all actions together. Last bot standing wins.

## Contest target
OpenAI multiplayer game challenge — submission deadline: **October 31, 2026**.

## v0.4.1 — Combat Feedback & Leave Flow
This branch builds on the proven v0.4 multiplayer preview without changing the core combat rules.

### New in v0.4.1
- Larger desktop arena and stronger use of screen space.
- More mechanical, armored robot silhouettes.
- Direction/facing indicators.
- Pre-lock targeting previews for Move, Blast, Hack, Shield, and Overcharge.
- Visible combat feedback for blasts, impacts, shields, hacks, charging, and movement.
- Richer EXECUTE reveal with per-action outcomes.
- **Leave Match** button during active play with confirmation.
- Automatic host transfer when the host leaves.
- Heartbeat-based disconnect detection with a 30-second grace period.
- Two-player matches become **Interrupted** instead of awarding a fake combat win when an opponent leaves.
- Remaining host can return the room to the lobby after an interrupted match.

## Architecture

```text
Browser clients
      |
      | HTTPS polling + heartbeat + actions
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


## v0.4.3 hotfix
- Prevents background polling from overwriting the intentional **You left the arena.** message after Leave Match.
