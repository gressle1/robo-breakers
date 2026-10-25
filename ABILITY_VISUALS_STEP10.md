# Robo Breakers v0.6 - Step 10: Shield, Hack and Overcharge Visuals

## Prerequisite

This update is built **on Step 9**, including the approved Chibi Frames, movement/Dodge animations, and Phoenix's heavy energy rifle effect. It is intended for a **fresh branch from main after PR #11 is merged**.

Proposed GitHub branch: `feature/ability-visual-fx-v06`

## Visual features

- **Shield:** a cyan dome and hex-ring pulse with `SHIELD ONLINE` when the authoritative engine reports an active shield.
- **Shield disabled:** a disrupted pink flash with `SHIELD DISABLED` when the shield action is hacked in the same round.
- **Hack:** a short purple electronic beam and glitch/cross at the adjacent target, with `HACKED` for success.
- **Hack without target:** a faint gray/purple spark at the actor with `NO TARGET`; no misleading success effect.
- **Overcharge:** gold radial energy wave and `+1 ENERGY`, *not* an Overdrive activation.
- Reuses authoritative `lastTurn.visuals` from the existing engine, including the server-reported locations and results. Displays on both participants' clients after the command reveal.
- Animation age offsets avoid repeated restarts during the 700 ms state polls. Reduced-motion users do not see rapid overlay animations; outcomes remain available in the existing system feed.

## Unchanged

- HP, Armor, Blast damage, Hack/Shield resolution, +1 energy, Move, Dodge and Overdrive availability (not yet implemented).
- Four approved Chibi images and frame-selection artwork.
- Lobby, rooms, turn rules, Netlify functions, and backend/game-engine modules.
- Existing special Phoenix rifle effects.

## Apply on Windows with GitHub Desktop

1. Merge PR #11 to `main` in GitHub, *if not already merged*. Check that all checks passed and no conflicts remain.
2. In GitHub Desktop: switch to `main`, Fetch origin, then Pull origin; ensure **No local changes**.
3. Create a new branch from main: `feature/ability-visual-fx-v06`.
4. Extract this ZIP and open `changes`. Copy the *contents* of `changes` to the repository root (GitHub Desktop > Repository > Show in Explorer), replacing existing files.
5. Verify GitHub Desktop shows eight changed paths with no `changes/` prefix. Stop before committing if anything differs.
6. Commit, Push/Publish, and open a PR targeting `main`. Test the Netlify Deploy Preview before merging.

## Visual test checklist

- Active Shield: both browsers show a cyan barrier around the correct pilot. A Blast blocked by it still reports zero damage.
- Hack against an adjacent shield: purple line/disruption and pink disabled-shield feedback; no false block.
- Hack into an empty square: `NO TARGET`, no shock arc to a nonexistent player.
- Overcharge: gold power pulse and existing energy rises by exactly +1.
- Phoenix's distinct beam, movement/Dodge, and floating Blast damage still work as before.
- Test the 5x5 and 6x6 board with 2-4 pilots, two browser sessions, and a narrow phone viewport.
- Confirm both players agree about damage and match outcome.

## Local verification

- `npm test`: **69/69 passed** (7 new ability FX tests added to prior 62).
- `npm run build`: **passed**.
- `npm run test:e2e`: **passed**, two-player full match plus rematch.
- Visual display on Netlify has **not yet been tested**. Do not merge until you inspect the actual effects in a Deploy Preview.
