# Robo Breakers v0.6 - Step 9: Movement, Dodge, and Phoenix Rifle FX

**Branch:** `feature/movement-dodge-fx-v06` created from `main` after merging and pulling PR #10. Do not apply to an unmerged Blast FX branch.

## Included (cosmetic changes only)
- Move: full-body approved Chibi frame animates across the previous and new arena squares, with a small thrust trail and landing pulse.
- Dodge: visibly faster purple-blue dash/afterimage trail and landing flash. Blocked Dodge produces an on-board `DODGE BLOCKED` notification.
- Rams: pushed machines also appear to slide into the logged destination square.
- **Phoenix Rifle:** a distinctive thick orange-red charged energy beam with a white-hot core, muzzle flare, and stronger impact ring. Juggernaut, Astra, and Aurora retain their standard frame-colored Blast bolts.
- Combat effects play *after* Move and Dodge movement to remain legible in the existing simultaneous-turn combat.
- Replay is based exclusively on existing server-resolved `lastTurn.visuals`, with elapsed-time offsets to avoid restarting every 700ms poll.
- All four approved Chibi sprites, frame stats, gameplay outcomes, server functions, player positions, and Frame Selection artwork are unchanged.
- Reduced-motion users get static results and combat log messages without fast overlays.

## Installation (GitHub Desktop / Windows)
1. Merge PR #10 if it is still open, then switch to `main` and Fetch/Pull origin. Confirm No local changes.
2. Create **new branch** `feature/movement-dodge-fx-v06` from `main`.
3. Download and Extract All. Open the extracted `changes` folder and copy **only its contents**.
4. GitHub Desktop > Repository > Show in Explorer. Paste at the `robo-breakers` repository root and replace existing files.
5. Verify modified files do **not** have a `changes/` prefix. Do not include this ZIP's `READ_ME_FIRST.txt` in the commit.
6. Commit with summary: `Animate movement and Dodge; add Phoenix heavy beam FX` and Push/Publish branch.
7. Open a pull request to `main`; run Netlify Deploy Preview (likely #11, assigned by GitHub) and test in two separate browser sessions before merging.

## Test checklist
- Move one tile; the machine travels and lands in the correct cell.
- Dodge with energy; the quick dash appears and the existing one-energy rule remains intact.
- Attempt a blocked Dodge; confirm `DODGE BLOCKED`, no movement, and energy spent.
- Ram a machine; both robots visibly shift where the server put them.
- Phoenix Blast: wider orange-red beam, bright firing/impact effect and authoritative damage number.
- Astra / Juggernaut / Aurora Blast: original smaller bolts and existing damage numbers.
- Repeat a turn with two browsers, including Shield, miss, and a finishing Blast.
- Check 5x5 and 6x6 arenas plus phone-sized screen for clipped sprites or FX.
- Confirm all green checks, no merge conflicts, and correct behavior before merging.

## Local verification
- `npm test`: 62 passed, including 8 new Step 9 visual/event tests.
- `npm run build`: succeeded.
- `npm run test:e2e`: two-player full match/rematch passed.
- Netlify's live visual appearance still needs user review. The optional local browser screenshot could not complete in this environment.
