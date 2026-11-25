# PROGRESS – car-merge (Khazar Motor BMW X7 reel)   (updated 2026-11-25)
Phase: preview (part 1 draft)
Current version: v1 → renders/final/car_merge_part1_v1.mp4 (1080x1920, 30 fps, 23.6 s, -14 LUFS)
Done:
- Reference analysed (merge-game X2→X7, tonal ding per merge, X7 bursts into real car)
- User's X7 cut out from listing screenshot (rembg isnet) → assets/images/tiers/x7.png
- Merge simulation (32×X2 → X7, 31 merges on a 140 BPM grid), renderer, synthesised SFX + bed
In progress:
- X2–X6 sprites are TEMPORARY tinted copies of the user's X7. User will upload real X2, X3, X4, X5, X6 front photos.
Next step: cut out the uploaded photos with `python3 -I scripts/cutout.py <photo> assets/images/tiers/xN.png`, re-render.
Then: user sends footage/data of their car for part 2 (finale currently ends on "BMW X7 2020" title card).
Key decisions: brand header = KHAZAR MOTOR + lime #C6FF00; final car = user's real black X7.
Key files: src/data.js (timing), src/scene.js (drawFrame), src/render.js, scripts/sfx.py, scripts/make_tiers.py
Rebuild: node src/render.js --events cache/events.json && python3 -I scripts/sfx.py && loudnorm → render → mux (see LOG.md)
