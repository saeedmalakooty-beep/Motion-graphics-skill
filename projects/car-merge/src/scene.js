// Deterministic drawFrame(t) for the car-merge reel. Runs in headless Chromium.
/* global TIMELINE */
(function () {
  const TL = TIMELINE, { W, H, events, FINALE, SLIDE } = TL;
  const LIME = '#C6FF00';
  const IMG = {};                       // filled by init()
  let ctx, cv, S = 1;

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const prog = (t, a, d) => clamp((t - a) / d);
  const eOutCubic = k => 1 - Math.pow(1 - k, 3);
  const eInOutCubic = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const eOutBack = (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const eOutElastic = k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1);
  const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // car width per tier (bigger model = slightly bigger tile)
  const carW = tier => 262 + (tier - 2) * 10;

  // ---------- state at time t (pure function of events) ----------
  function stateAt(t) {
    // tiles: slot -> {tier, born, bornType}
    const tiles = {};
    const movers = [];
    for (const e of events) {
      if (e.type === 'intro') e.slots.forEach((s, i) => (tiles[s] = { tier: 2, born: e.t + i * 0.055, kind: 'intro' }));
      if (e.type === 'spawn') { if (t < e.t) break; e.slots.forEach((s, i) => (tiles[s] = { tier: 2, born: e.t + i * 0.05, kind: 'spawn' })); }
      if (e.type === 'merge') {
        if (t < e.t) break;
        if (t < e.hit) { // mover in flight, target still old tier
          const m = tiles[e.from]; delete tiles[e.from];
          movers.push({ ...m, e, k: (t - e.t) / SLIDE });
        } else {
          delete tiles[e.from];
          tiles[e.to] = { tier: e.tier, born: e.hit, kind: 'merge', e };
        }
      }
    }
    return { tiles, movers };
  }

  // ---------- drawing ----------
  function background(t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.48, 80, W / 2, H * 0.5, H * 0.75);
    g.addColorStop(0, '#46474c'); g.addColorStop(0.55, '#2c2d31'); g.addColorStop(1, '#141517');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // subtle floor grid glow
    ctx.save(); ctx.globalAlpha = 0.05; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  }

  function header(t, alpha = 1) {
    const k = eOutCubic(prog(t, 0, 0.5));
    ctx.save(); ctx.globalAlpha = alpha * k; ctx.translate(W / 2, 285 - (1 - k) * 20);
    // K badge
    const bw = 74; ctx.fillStyle = LIME; roundRect(-215, -bw / 2, bw, bw, 16); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = '900 56px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('K', -215 + bw / 2, 3);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '800 46px Inter';
    ctx.fillText('KHAZAR', -122, -12); const kw = ctx.measureText('KHAZAR ').width;
    ctx.fillStyle = LIME; ctx.font = '600 24px Inter';
    ctx.save(); ctx.letterSpacing = '9px'; ctx.fillText('KHAZAR.MOTOR', -120, 30); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '300 46px Inter'; ctx.fillText('MOTOR', -122 + kw, -12);
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // draw a car tile centred at (x,y): car above, label below
  function car(tier, x, y, { scale = 1, alpha = 1, flash = 0, label = true, labelScale = 1, glow = 0 } = {}) {
    const img = IMG['x' + tier]; if (!img) return;
    const w = carW(tier) * scale, h = w * img.height / img.width;
    ctx.save(); ctx.globalAlpha = alpha;
    // contact shadow
    ctx.save(); ctx.translate(x, y + h * 0.42); ctx.scale(1, 0.18);
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.55);
    sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, w * 0.55, 0, 7); ctx.fill(); ctx.restore();
    if (glow > 0) { ctx.save(); ctx.shadowColor = LIME; ctx.shadowBlur = 60 * glow * scale; ctx.globalAlpha = alpha * glow; ctx.drawImage(img, x - w / 2, y - h / 2 - 10, w, h); ctx.restore(); }
    ctx.drawImage(img, x - w / 2, y - h / 2 - 10, w, h);
    if (flash > 0) { // white flash using the sprite as mask
      const f = flashCanvas(img, w, h);
      ctx.globalAlpha = alpha * flash; ctx.drawImage(f, x - w / 2, y - h / 2 - 10, w, h);
    }
    if (label) {
      ctx.globalAlpha = alpha;
      ctx.translate(x, y + h / 2 + 34 * scale); ctx.scale(labelScale * scale, labelScale * scale);
      ctx.font = 'italic 900 54px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.strokeText('X' + tier, 0, 0);
      ctx.fillStyle = tier === 7 ? LIME : '#f4f4f4'; ctx.fillText('X' + tier, 0, 0);
    }
    ctx.restore();
  }
  const flashCache = new Map();
  function flashCanvas(img) {
    if (flashCache.has(img)) return flashCache.get(img);
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    flashCache.set(img, c); return c;
  }

  function ring(x, y, k, big) {
    if (k <= 0 || k >= 1) return;
    const r = lerp(70, big ? 420 : 230, eOutCubic(k));
    ctx.save(); ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = LIME; ctx.lineWidth = lerp(big ? 14 : 8, 1, k);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = (1 - k) * 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function sparks(x, y, k, seed, n) {
    if (k <= 0 || k >= 1) return;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const a = rnd(seed + i) * Math.PI * 2, sp = 140 + rnd(seed + i * 3.1) * 260;
      const d = sp * eOutCubic(k), len = 26 * (1 - k);
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = i % 3 ? LIME : '#fff'; ctx.lineWidth = 4 * (1 - k) + 1;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(a) * len, py - Math.sin(a) * len); ctx.stroke();
    }
    ctx.restore();
  }

  // camera: subtle punch on each merge + slow push toward the action late in the game
  function camera(t) {
    let zoom = 1, cx = W / 2, cy = H / 2, shake = 0;
    for (const e of events) if (e.type === 'merge') {
      const k = (t - e.hit) / 0.25;
      if (k >= 0 && k < 1) { zoom += (e.tier >= 6 ? 0.035 : 0.012) * Math.sin(k * Math.PI); shake = Math.max(shake, (e.tier >= 6 ? 10 : 3) * (1 - k)); }
    }
    // follow the build-up to the X7: ease the camera onto the target slot during the last merges
    const lastTwo = events.filter(e => e.type === 'merge').slice(-2);
    const k = eInOutCubic(prog(t, lastTwo[0].t - 0.6, 1.4));
    const p = TL.slotPos(TL.X7_SLOT);
    zoom *= lerp(1, 1.12, k); cx = lerp(cx, (p.x + W / 2) / 2, k); cy = lerp(cy, (p.y + H / 2) / 2, k);
    const sx = (rnd(Math.floor(t * 60)) - 0.5) * shake, sy = (rnd(Math.floor(t * 60) + 9) - 0.5) * shake;
    return { zoom, cx, cy, sx, sy };
  }

  function game(t, alpha) {
    const { tiles, movers } = stateAt(t);
    const cam = camera(t);
    ctx.save();
    ctx.translate(W / 2 + cam.sx, H / 2 + cam.sy); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.cx, -cam.cy);
    ctx.globalAlpha = alpha;
    for (const [slot, tile] of Object.entries(tiles)) {
      if (+slot === TL.X7_SLOT && tile.tier === 7 && t > FINALE.fly) continue;
      const p = TL.slotPos(+slot);
      const k = (t - tile.born);
      let scale = 1, a = 1, flash = 0, labelScale = 1, glow = 0;
      if (tile.kind === 'intro' || tile.kind === 'spawn') { const q = prog(k, 0, 0.32); scale = eOutBack(q, 2.2); a = clamp(q * 3); if (q === 0) continue; }
      if (tile.kind === 'merge') {
        const q = prog(k, 0, 0.42); scale = lerp(1.32, 1, eOutElastic(q)); flash = (1 - prog(k, 0, 0.22)) * 0.85;
        labelScale = lerp(1.6, 1, eOutBack(prog(k, 0, 0.3)));
        if (tile.tier === 7) glow = 0.6 + 0.4 * Math.sin(k * 6);
      }
      car(tile.tier, p.x, p.y, { scale, alpha: a * alpha, flash, labelScale, glow });
      if (tile.kind === 'merge') { ring(p.x, p.y - 10, k / 0.55, tile.tier >= 6); sparks(p.x, p.y - 10, k / 0.5, tile.e.n * 13, tile.tier >= 6 ? 26 : 12); }
    }
    for (const m of movers) {
      const a = TL.slotPos(m.e.from), b = TL.slotPos(m.e.to), k = eInOutCubic(clamp(m.k));
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * 30;
      // speed trail
      for (let i = 3; i >= 1; i--) { const kk = eInOutCubic(clamp(m.k - i * 0.06)); car(m.tier, lerp(a.x, b.x, kk), lerp(a.y, b.y, kk), { alpha: 0.12 * alpha, label: false }); }
      car(m.tier, x, y, { scale: lerp(1, 0.92, k), alpha, labelScale: 1 });
    }
    ctx.restore();
  }

  // ---------- finale: X7 flies to centre and lands exactly where the car sits in the
  // first frame of the Kling opening shot (s0); the scene scans in behind it -> cut to video.
  const S0 = { w: 768, h: 1360, box: [31, 397, 740, 1000] };          // car bbox inside s0.png
  const s0k = W / S0.w, s0y = (H - S0.h * s0k) / 2;
  const X7R = { x: S0.box[0] * s0k, y: s0y + S0.box[1] * s0k, w: (S0.box[2] - S0.box[0]) * s0k, h: (S0.box[3] - S0.box[1]) * s0k };
  function revealK(t) { return eInOutCubic(prog(t, FINALE.reveal, 0.6)); }
  function finale(t) {
    const F = FINALE;
    if (t < F.fly) return;
    const p = TL.slotPos(TL.X7_SLOT), cam = camera(F.fly), img = IMG.x7;
    // tile rect at fly start (same maths as car())
    const w0 = carW(7) * cam.zoom, h0 = w0 * img.height / img.width;
    const cx0 = W / 2 + (p.x - cam.cx) * cam.zoom, cy0 = H / 2 + (p.y - cam.cy) * cam.zoom - 10 * cam.zoom;
    const k = eInOutCubic(prog(t, F.fly, F.reveal - F.fly));
    const w = lerp(w0, X7R.w, k), h = lerp(h0, X7R.h, k);
    const cx = lerp(cx0, X7R.x + X7R.w / 2, k), cy = lerp(cy0, X7R.y + X7R.h / 2, k);
    // scene scans in from the top behind the car
    const ks = revealK(t), ly = lerp(-60, H + 60, ks);
    if (ks > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, Math.max(0, ly)); ctx.clip();
      ctx.drawImage(IMG.s0, 0, s0y, W, S0.h * s0k); ctx.restore();
    }
    if (ks < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, ly, W, H); ctx.clip();
      ctx.save(); ctx.shadowColor = LIME; ctx.shadowBlur = 50 * (1 - k * 0.6); ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h); ctx.restore();
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h); ctx.restore();
      if (t < F.reveal - 0.05) { // label rides under the car until the reveal
        ctx.save(); ctx.globalAlpha = clamp(1 - k * 2); ctx.translate(cx, cy + h / 2 + 40); ctx.font = 'italic 900 54px Inter';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = LIME; ctx.fillText('X7', 0, 0); ctx.restore();
      }
    }
    if (ks > 0 && ks < 1) { // lime scan line
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, ly - 50, 0, ly + 50);
      g.addColorStop(0, 'rgba(198,255,0,0)'); g.addColorStop(0.5, 'rgba(198,255,0,0.85)'); g.addColorStop(1, 'rgba(198,255,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, ly - 50, W, 100);
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(0, ly - 2, W, 4); ctx.restore();
    }
  }

  function drawFrame(t) {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    background(t);
    const fade = 1 - prog(t, FINALE.fly, 0.5);          // other tiles leave as the X7 takes the stage
    header(t, 1);
    if (fade > 0 || t < FINALE.fly) game(t, Math.max(fade, 0));
    finale(t);
    if (revealK(t) >= 1) return;                        // last frames = clean s0, matches the video
    // vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.save(); ctx.globalAlpha = 1 - revealK(t); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  async function init(scale, assets) {
    S = scale; cv = document.getElementById('c');
    cv.width = Math.round(W * S); cv.height = Math.round(H * S); ctx = cv.getContext('2d');
    for (const [k, src] of Object.entries(assets.images)) {
      const im = new Image(); im.src = src; await im.decode(); IMG[k] = im;
    }
    for (const [fam, w, st, src] of assets.fonts) { const f = new FontFace(fam, `url(${src})`, { weight: w, style: st }); await f.load(); document.fonts.add(f); }
    await document.fonts.ready;
    return { duration: TL.DURATION };
  }
  window.SCENE = { init, drawFrame };
})();
