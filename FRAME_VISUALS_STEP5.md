# Robo Breakers v0.6 — Step 5: Reference-Faithful Frame Visuals

## Purpose
Visuals-only update for Frame Selection, lobby, and 5×5 combat arena. No backend or combat rules modified.

## Sources
The eight lightweight WebP images are **crops only** (not redrawn or regenerated) from the four user-approved reference sheets:
- Phoenix: Assault Frame Striker_ Robo Breakers Blueprint.png
- Juggernaut: Juggernaut Heavy Frame Blueprint(1).png
- Astra: Scout Light Frame Concept Sheet(2).png
- Aurora: Aurora Vanguard Mecha Concept Sheet(1).png

No weapon, armor, or gameplay values were changed. Crop previews are for UI testing, not new or altered concept art approvals.

## What changed
- Frame Selection: recognizable full-figure portraits for all four approved frames, with official names and HP/armor labels.
- Lobby: small head-and-torso thumbnails instead of generic icon.
- Battle: image tokens use the same reference artwork, frame color borders, player-specific outline colors and callsigns for duplicate frames.
- All health, names, multiplayer, damage and Dodge behavior unchanged.

## Proposed integration process
1. **Do not commit to main.** Merge and locally pull PR #7 first if it is accepted and complete.
2. From updated main, create feature/frame-visuals-v06.
3. Copy the **contents** of `changes/` into the root of the locally cloned robo-breakers repository.
4. Commit and publish that feature branch. Create a PR; use the new Netlify Deploy Preview.
5. Test four frames in lobby, two players picking the same frame, 5x5 board readability, mobile portrait and landscape layouts, and rematch. Do not merge until visually approved.

Note: no transparent silhouettes or new renders were invented; the tiny arena tokens are cropped head/torso images taken from locked-in art. We can improve the presentation after review without changing canon designs.
