# Robo Breakers — Step 2: Frame Selection (test build)

This update builds on the Pilot Registration Step 1 ZIP. It adds a lobby-only frame picker with the locked frame designations: Juggernaut (Heavy), Phoenix (Striker), Astra (Scout), and Aurora (Vanguard). It displays the approved primary stat values for reference, but **the existing 3-HP combat engine is still active**. Do not claim that the full frame-specific combat system is implemented yet.

## Behavior
- 2–8 players can select any frame; duplicate selections are allowed.
- The selection is saved in each player's room state on the server and visible to other players.
- Changing your frame clears your ready status.
- Every player must select a frame before the host can start the match.
- Frame changes are rejected after the match starts.
- Pilot entry, create/join, room codes, and combat actions are otherwise unchanged.

## Validation
- `node --test`: 27 tests pass.
- `node --check app.js`: syntax passes.
- `node build.mjs`: builds dist.
- Local tests do not confirm Netlify serverless deployment, multiplayer UX on phones, or balance.

## Deploy preview steps
- Upload this archive to a new branch or pull request in the contest repository, so Netlify creates a separate Deploy Preview.
- Test with two browser sessions and two pilots; choose frames, ready, start, leave, reconnect.
- Do not overwrite the working public site until preview verification passes.

## Next step
Implement locked individual combat stats and frame-specific damage/movement/dodge behavior in the game engine and UI, then regression-test every command and multiplayer scenario. The existing engine currently uses 3 HP for every pilot and does not use the displayed frame stats for calculations.
