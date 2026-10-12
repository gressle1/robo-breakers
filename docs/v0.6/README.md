# Robo Breakers v0.6 — Gameplay Expansion Plan

**Status:** Planning baseline  
**Target branch:** `v0.6-planning`  
**Release policy:** v0.6 is not considered implemented or release-ready until gameplay changes are coded, tested, and reviewed. The existing `main` branch remains the baseline for the working game.

## Purpose

v0.6 moves Robo Breakers beyond the v0.5 combat/readability pass. The goal is to introduce meaningful robot-frame identity and deeper combat decisions while preserving the existing online multiplayer foundation.

This branch contains planning documents only. It does not yet implement the v0.6 gameplay systems.

## Current game foundation to preserve

- Online multiplayer with room codes for 2–8 players.
- Existing 5×5 arena.
- Simultaneous secret command selection and round resolution.
- Current commands: MOVE, BLAST, SHIELD, HACK, and OVERCHARGE.
- Rematches, leaving active matches, and host transfer.
- v0.5 combat readability, robot visuals, and HUD improvements.

## v0.6 planning status

| Feature area | Design status from current planning | Implementation status |
|---|---|---|
| Four combat frames and their stats | Concept approved; exact values must be taken from the authoritative design notes before coding | Not started |
| Scout, Striker, Juggernaut visuals | Approved concepts | Not started in v0.6 |
| Vanguard visual | In progress | Not started |
| Eight color schemes per frame | Planned | Not started |
| Overdrive Mode | Rules approved | Not started |
| Shared Overcharge Gauge | Rules approved | Not started |
| System Cooldown | Approved | Not started |
| Pilot Pressure | Rules approved | Not started |
| Close-quarters combat (CQC) Phase and Power Struggle | Core rules approved | Not started |
| Rear attacks and knockback | Rules approved | Not started |
| Player-controlled dodging | Planned/rules approved | Not started |
| Dynamic arena sizing | Approved | Not started |
| Movement and collision handling | Still under discussion | Not started |

> Important: this table records planning status, not proof that a feature exists in the playable build. Do not invent missing frame statistics or unresolved collision rules; resolve them in the spec before implementing dependent mechanics.

## Recommended delivery sequence

1. **Lock the rules:** record exact frame statistics, frame-specific strengths/weaknesses, color behavior, Overdrive costs/effects, cooldown rules, pressure rules, CQC triggers/resolution, rear-attack behavior, knockback, dodge costs/timing, and arena/collision boundaries.
2. **Frame foundation:** add frame selection and validated frame stats, then frame color schemes. Keep visual assets swappable so final robot illustrations can be integrated later.
3. **Arena and movement foundation:** design dynamic arena sizing and settle collision/movement behavior before combat systems depend on them.
4. **Combat systems in small slices:** implement and test Overcharge/Overdrive/cooldowns, then pressure, then CQC/rear attacks/knockback, then dodge interactions.
5. **Multiplayer correctness:** ensure all new choices resolve authoritatively and consistently for every player in a simultaneous round.
6. **Balance and release candidate:** automated tests, two-client online tests, desktop/mobile review, balance pass, and release notes.

## Documents

- [Gameplay specification](./GAMEPLAY_SPEC.md) — design decisions and rules to confirm.
- [Implementation roadmap](./IMPLEMENTATION_ROADMAP.md) — incremental build order and acceptance criteria.
- [Test plan](./TEST_PLAN.md) — unit, integration, multiplayer, and device checks.

## Definition of done for v0.6

- All planned mechanics have explicit rules and automated regression coverage.
- No player can exploit timing, reconnects, or client state to gain an unfair resolution advantage.
- Frame stats and special mechanics are visible and understandable in the UI.
- Multiplayer results match across clients and remain server-authoritative.
- Existing v0.5 functionality still works.
- Desktop and mobile playtests pass; the release is not labeled complete before the checks are actually run.
