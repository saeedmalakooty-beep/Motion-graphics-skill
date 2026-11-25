// Timeline for the car-merge game. Edit numbers here to retime the whole video.
// Works in the browser (sets window.TIMELINE) and in Node (module.exports).
(function (root) {
  const BPM = 140, BEAT = 60 / BPM;           // every merge lands on a beat
  const W = 1080, H = 1920;
  const COLS = [215, 540, 865], ROWS = [650, 970, 1290];
  const slotPos = i => ({ x: COLS[i % 3], y: ROWS[(i / 3) | 0] });
  const TARGET = 7, TOTAL_X2 = 2 ** (TARGET - 2);     // 32 x X2 build one X7
  const SLIDE = 0.34;                                   // mover travel time (s)

  // priority: results gather top-right (like the reference), lower = preferred target
  const prio = i => ((i / 3) | 0) * 10 + (2 - (i % 3));
  const dist = (a, b) => Math.hypot(slotPos(a).x - slotPos(b).x, slotPos(a).y - slotPos(b).y);

  const slots = Array(9).fill(2);
  const events = [];
  let spawned = 9, t = 0.9, mergeCount = 0;
  events.push({ type: 'intro', t: 0.15, slots: [...Array(9).keys()] });

  for (let guard = 0; guard < 200; guard++) {
    const live = slots.map((v, i) => [v, i]).filter(([v]) => v);
    if (live.length === 1 && live[0][0] === TARGET) break;
    // pairs of the lowest tier that has a pair
    let best = null;
    for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) {
      if (!slots[a] || slots[a] !== slots[b]) continue;
      const key = slots[a] * 1e4 + dist(a, b);
      if (!best || key < best.key) best = { a, b, key };
    }
    if (best) {
      const [to, from] = prio(best.a) <= prio(best.b) ? [best.a, best.b] : [best.b, best.a];
      const tier = slots[to] + 1;
      const big = tier >= 6;
      if (big) t += BEAT;                                   // breathe before the heavy merges
      events.push({ type: 'merge', t, hit: t + SLIDE, from, to, tier, n: mergeCount++ });
      slots[to] = tier; slots[from] = 0;
      t += big ? BEAT * 2 : BEAT;
    } else {
      const empty = slots.map((v, i) => [v, i]).filter(([v]) => !v).map(([, i]) => i)
        .sort((a, b) => prio(b) - prio(a));                 // refill bottom-left first
      const n = Math.min(empty.length, TOTAL_X2 - spawned);
      const list = empty.slice(0, n);
      list.forEach(i => (slots[i] = 2)); spawned += n;
      events.push({ type: 'spawn', t, slots: list });
      t += BEAT * 1.5;
    }
  }
  const last = events[events.length - 1];               // the X6 + X6 -> X7 merge
  const X7_HIT = last.hit, X7_SLOT = last.to;
  const FINALE = {
    hold: X7_HIT,                 // X7 forms
    fly: X7_HIT + 0.9,            // X7 flies to centre + grows
    reveal: X7_HIT + 1.55,        // scan-line reveal of the real car
    end: X7_HIT + 2.6,          // a few clean frames of s0, then the Kling video takes over
  };
  const TL = { W, H, BPM, BEAT, SLIDE, COLS, ROWS, events, X7_SLOT, FINALE, DURATION: FINALE.end };
  TL.slotPos = slotPos;
  if (typeof module !== 'undefined') module.exports = TL; else root.TIMELINE = TL;
})(typeof window !== 'undefined' ? window : globalThis);
