// Part 2 edit: shot list + on-screen text (Khazar Lexus-reel style). Times in seconds from the start of part 2.
// Re-time here once the voiceover arrives.
(function (root) {
  const SHOTS = [               // [id, source, in, dur, speed]  speed < 1 = slow motion (frame-interpolated)
    ['a', 'v0', 0.0, 3.0],     // continues from the merge animation
    ['b', 'v1b', 0.3, 3.0],    // front 3/4 arc
    ['c', 'kb:s2', 0, 2.0],    // grille + headlight (still, push-in)
    ['d', 'v3b', 0.4, 3.0],    // under the tree, push through plants
    ['e', 'v4', 0.5, 3.0],     // wheel slide
    ['f', 'v5b', 0.3, 3.0],    // straight rear, plate
    ['g', 'kb:s6', 0, 2.0],    // taillight (still, push-in)
    ['h', 'v7', 0.8, 3.4],     // interior
    ['i', 'v0', 1.8, 5.6, 'extend'], // front hero under the price card: real clip at normal speed, then a smooth digital push to the cut (no invented frames)
    ['k', 'end', 0, 4.5],      // website end card (full graphic)
  ];
  let t = 0; const CUTS = SHOTS.map(s => { const c = { id: s[0], src: s[1], inn: s[2], dur: s[3], speed: s[4] || 1, t0: t }; t += s[3]; return c; });
  const DURATION = t;
  const at = id => CUTS.find(c => c.id === id).t0;
  // big spec line: [start, end, label, value, opts]  opts.count = [from, to, template with # for the number]
  const SPECS = [
    [0.5, at('b') + 1.4, 'مدل', '۲۰۲۰', { count: [1990, 2020, '#', false] }],
    [at('b') + 1.4, at('d'), 'کارکرد', '۱۷۰ هزار کیلومتر', { count: [0, 170, '# هزار کیلومتر', false] }],
    [at('d'), at('e'), 'بدنه', 'بی‌رنگ', { dot: true }],
    [at('e'), at('f'), 'موتور', '۳ لیتری توربو', {}],
    [at('f'), at('h'), 'نوع', 'شاسی‌بلند · بنزینی', {}],
    [at('h'), at('i'), 'داخل', 'چرم کنیاکی', {}],
  ];
  const PRICE_IN = at('i') + 0.3, END_IN = at('k');
  const O = { CUTS, DURATION, SPECS, PRICE_IN, END_IN, TITLE_IN: 0.3 };
  if (typeof module !== 'undefined') module.exports = O; else root.OVERLAY = O;
})(typeof window !== 'undefined' ? window : globalThis);
