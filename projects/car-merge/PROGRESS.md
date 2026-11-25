# PROGRESS – car-merge (Khazar Motor BMW X7 reel)   (updated 2026-11-25)
Phase: preview (part 1 draft)
Current version: v3 → renders/final/car_merge_part1_v3.mp4 (reference SFX)
Done:
- Reference analysed (merge-game X2→X7, tonal ding per merge, X7 bursts into real car)
- User's X7 cut out from listing screenshot (rembg isnet) → assets/images/tiers/x7.png
- Merge simulation (32×X2 → X7, 31 merges on a 140 BPM grid), renderer, synthesised SFX + bed
In progress:
- X2–X6 = user-supplied photos (assets/images/src), cut out with scripts/cutout.py
Next step: user sends footage/data of their car for part 2.
Then: user sends footage/data of their car for part 2 (finale currently ends on "BMW X7 2020" title card).
Key decisions: brand header = KHAZAR MOTOR + lime #C6FF00; final car = user's real black X7.
Key files: src/data.js (timing), src/scene.js (drawFrame), src/render.js, scripts/sfx.py, scripts/make_tiers.py
Rebuild: node src/render.js --events cache/events.json && python3 -I scripts/sfx.py && loudnorm → render → mux (see LOG.md)

## Part 2 (cinematic, Kling) – started 2026-11-25
Plan: plan/part2_cinematic.md (shot list + Persian VO script v1). Reference: assets/footage/ref_rrs.mp4
Kling: Pro account, 1245 credits at start. Rules: 9:16, 720p, 5 s, no audio, cheapest model, 1 take/shot.
Next step: user sends the other listing photos (side, rear, wheel, interior, shifter); then generate shot 1 still → user OK → video.
