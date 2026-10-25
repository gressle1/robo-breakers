# Robo Breakers v0.6 - Step 7: Approved Chibi Frames (Preview #9 branch)

Source: user-approved `Robo Breakers_ Chibi Frames Lineup.png`.  This update replaces only the four battlefield sprites and fixes the uneven 5x5 arena tile grid.

## Branch
`feature/full-body-sprites-v06` - use this EXISTING branch while PR #9 remains unmerged.

## Changes
* `public/assets/frames/*-sprite.webp` and `dist/assets/frames/*-sprite.webp` are transparent chibi sprite extractions from the user's chosen illustration.
* `style.css`, `public/style.css`, `dist/style.css` now force five equal-width columns AND five equal-height rows; resize sprites within the cells on desktop and mobile.
* No app.js, backend, combat engine, network, HP, weapon, Dodge, or Overdrive changes.
* Frame Selection and lobby original artworks remain unchanged.

## Important art note
These sprites preserve the user's selected image, including Aurora's four visually hovering Aegis Bits. This is artwork only; Aegis Bits' deployment is NOT implemented in gameplay. Some fine detail is lost in the small arena, as the user approved.

## To apply in GitHub Desktop (Windows)
1. Keep PR #9 unmerged and switch to `feature/full-body-sprites-v06` in GitHub Desktop.
2. Extract this ZIP. Open `changes` and copy everything INSIDE that folder into the robo-breakers repository root; replace existing files.
3. Verify GitHub Desktop shows 11 changed files: 3 CSS files, 8 WebP sprites; documentation is a new file as well (12 total, or 11 if already present). Paths should NOT begin `changes/`.
4. Commit `Use approved chibi frames and fix arena tile sizing`; Push origin.
5. Netlify Preview #9 updates automatically. Check Phoenix and Aurora in two browsers; test all four sprites, tiny windows, dodge/movement, and pilot HP.
6. Do NOT merge until visuals are approved.

## Source and extraction notes
Full concept sheet lives outside the ZIP in the original user upload; transparent alpha was extracted automatically for these first-pass game-scale assets. Preview images are outside `changes` and should not be copied to the repo.
