// Part 2 text layer in the style of the Khazar Lexus reel. drawOverlay(t) → transparent canvas.
/* global OVERLAY */
(function () {
  const O = OVERLAY, W = 1080, H = 1920, LIME = '#B6FF3B';
  const FA = 'Vazir', EN = 'Inter';
  let ctx, S = 1; const IMG = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, a, d) => clamp((t - a) / d);
  const eOut = k => 1 - Math.pow(1 - k, 3);
  const lerp = (a, b, k) => a + (b - a) * k;

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function text(s, x, y, font, color, align = 'center', dir = 'rtl', ls = '0px') {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.direction = dir; ctx.letterSpacing = ls; ctx.fillText(s, x, y); ctx.restore();
  }
  function pill(cx, cy, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = `600 30px ${EN}`;
    const w = ctx.measureText('khazar.motor').width + 92;
    rr(cx - w / 2, cy - 32, w, 64, 32); ctx.fillStyle = 'rgba(18,20,19,0.72)'; ctx.fill();
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(cx - w / 2 + 36, cy, 9, 0, 7); ctx.fill();
    text('khazar.motor', cx - w / 2 + 60, cy + 1, `600 30px ${EN}`, '#fff', 'left', 'ltr');
    ctx.restore();
  }
  function shade(top, bottom) { // legibility gradients like the reference
    let g = ctx.createLinearGradient(0, 0, 0, 520);
    g.addColorStop(0, `rgba(0,0,0,${0.55 * top})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
    g = ctx.createLinearGradient(0, H - 700, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.75 * bottom})`);
    ctx.fillStyle = g; ctx.fillRect(0, H - 700, W, 700);
  }

  // ---------- running layer: title, spec line, spec row ----------
  function running(t) {
    const out = 1 - prog(t, O.PRICE_IN - 0.3, 0.3);
    const a = eOut(prog(t, O.TITLE_IN, 0.6)) * out;
    if (a <= 0) return;
    shade(a, a);
    pill(W - 190, 110, a);
    ctx.save(); ctx.globalAlpha = a;
    text('۲۰۲۰', W / 2, 205, `700 34px ${FA}`, LIME);
    text('BMW X7  ·  xDRIVE40i', W / 2, 265, `500 36px ${EN}`, '#fff', 'center', 'ltr', '9px');
    const lw = 150 * eOut(prog(t, O.TITLE_IN + 0.3, 0.6));
    ctx.fillStyle = LIME; ctx.fillRect(W / 2 - lw / 2, 304, lw, 4);
    ctx.restore();
    // big spec line
    for (const [t0, t1, label, value, dot] of O.SPECS) {
      const kin = eOut(prog(t, t0, 0.45)), kout = prog(t, t1 - 0.25, 0.25);
      const k = kin * (1 - kout) * out; if (k <= 0) continue;
      ctx.save(); ctx.globalAlpha = k;
      text(label, W / 2, 1560 + (1 - kin) * 18, `500 34px ${FA}`, 'rgba(255,255,255,0.72)');
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18;
      ctx.filter = `blur(${(1 - kin) * 6}px)`;
      text(value, W / 2, 1640 + (1 - kin) * 24, `800 88px ${FA}`, '#fff');
      ctx.filter = 'none';
      if (dot) { ctx.font = `800 88px ${FA}`; const vw = ctx.measureText(value).width; ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(W / 2 - vw / 2 - 30, 1648, 11, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    // small spec row
    ctx.save(); ctx.globalAlpha = a * 0.92;
    const items = ['۱۷۰ هزار کیلومتر', '2020', 'X7 xDrive40i'];
    const xs = [W / 2 - 250, W / 2, W / 2 + 250];
    items.forEach((s, i) => text(s, xs[i], 1790, `500 30px ${i === 0 ? FA : EN}`, 'rgba(255,255,255,0.85)', 'center', i === 0 ? 'rtl' : 'ltr'));
    ctx.fillStyle = LIME; [W / 2 + 125, W / 2 - 125].forEach(x => ctx.fillRect(x - 1.5, 1772, 3, 36));
    ctx.restore();
  }

  // ---------- price card ----------
  function price(t) {
    const kin = eOut(prog(t, O.PRICE_IN, 0.6)), kout = prog(t, O.END_IN - 0.35, 0.35);
    const a = kin * (1 - kout); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    let g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
    g = ctx.createLinearGradient(0, H - 800, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = g; ctx.fillRect(0, H - 800, W, 800);
    const dy = (1 - kin) * 30;
    text('قیمت تا پشت فنس', W / 2, 215 + dy, `800 66px ${FA}`, '#fff');
    text('با همه هزینه‌ها، تحویل پشت فنس انزلی', W / 2, 292 + dy, `500 34px ${FA}`, 'rgba(255,255,255,0.75)');
    const x = 90, y = 350 + dy, w = 900, h = 330;
    rr(x, y, w, h, 38); ctx.fillStyle = 'rgba(16,18,17,0.78)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke();
    // row 1: car price
    const r1 = y + 85, r2 = y + 245;
    ctx.strokeStyle = LIME; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w - 70, r1, 30, 0, 7); ctx.stroke();
    text('۱', x + w - 70, r1 + 2, `700 34px ${FA}`, '#fff');
    text('قیمت خودرو', x + w - 125, r1 - 18, `700 42px ${FA}`, '#fff', 'right');
    text('BMW X7 xDrive40i · ۲۰۲۰', x + w - 125, r1 + 30, `500 28px ${FA}`, 'rgba(255,255,255,0.6)', 'right');
    text('$ ۲۶,۰۰۰', x + 50, r1, `800 64px ${FA}`, '#fff', 'left', 'ltr');
    ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(x + 40, y + h / 2, w - 80, 2);
    // row 2: landed price
    const k2 = eOut(prog(t, O.PRICE_IN + 0.5, 0.5));
    ctx.globalAlpha = a * k2;
    ctx.strokeStyle = LIME; ctx.beginPath(); ctx.arc(x + w - 70, r2, 30, 0, 7); ctx.stroke();
    text('۲', x + w - 70, r2 + 2, `700 34px ${FA}`, '#fff');
    text('تحویل پشت فنس', x + w - 125, r2 - 18, `700 42px ${FA}`, '#fff', 'right');
    text('حمل · بیمه · مالیات · کارفکس · کارشناسی', x + w - 125, r2 + 30, `500 26px ${FA}`, 'rgba(255,255,255,0.6)', 'right');
    text('$ ۳۰,۲۶۰', x + 50, r2, `800 72px ${FA}`, LIME, 'left', 'ltr');
    ctx.globalAlpha = a;
    text('پلاک‌گذاری بر عهده خریدار', W / 2, y + h + 50, `500 30px ${FA}`, 'rgba(255,255,255,0.6)');
    // engagement line at the bottom (like "۱ یا ۲؟ / تو کامنت بگو")
    const k3 = eOut(prog(t, O.PRICE_IN + 1.0, 0.5));
    ctx.globalAlpha = a * k3;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20;
    text('ارزششو داره؟', W / 2, 1600 + (1 - k3) * 30, `900 110px ${FA}`, '#fff'); ctx.restore();
    text('تو کامنت بگو', W / 2, 1720 + (1 - k3) * 30, `700 50px ${FA}`, LIME);
    ctx.restore();
  }

  // ---------- website end card ----------
  function endCard(t) {
    const k = eOut(prog(t, O.END_IN, 0.5)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = '#0c0f0d'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W / 2, H * 0.95, 50, W / 2, H * 0.95, 900);
    g.addColorStop(0, 'rgba(120,180,40,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W / 2, H * 0.08, 30, W / 2, H * 0.08, 700);
    g.addColorStop(0, 'rgba(120,180,40,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    pill(W / 2, 265, 1);
    const kt = eOut(prog(t, O.END_IN + 0.15, 0.5));
    ctx.globalAlpha = k * kt;
    text('همه ماشین‌ها', W / 2, 370 + (1 - kt) * 30, `900 100px ${FA}`, '#fff');
    text('روی سایت ما', W / 2, 490 + (1 - kt) * 30, `900 100px ${FA}`, LIME);
    ctx.globalAlpha = k;
    // browser mock
    const bx = 130, by = 590, bw = 820, bh = 500;
    rr(bx, by, bw, bh, 34); ctx.fillStyle = '#1a1d1b'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; ctx.stroke();
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx + 44 + i * 34, by + 44, 10, 0, 7); ctx.fill(); });
    rr(bx + 150, by + 22, bw - 180, 46, 23); ctx.fillStyle = '#262a27'; ctx.fill();
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(bx + 180, by + 45, 8, 0, 7); ctx.fill();
    text('khazar-motor.com', bx + 200, by + 46, `600 28px ${EN}`, '#fff', 'left', 'ltr');
    const rows = [['BMW X7 xDrive40i', '2020', '$ ۳۰,۲۶۰', 'x7'], ['Toyota Camry', '2021', '$ ۲۰,۱۴۰'], ['Mercedes GLC 300', '2022', '$ ۳۵,۰۵۰']];
    rows.forEach(([name, yr, pr, img], i) => {
      const kr = eOut(prog(t, O.END_IN + 0.45 + i * 0.18, 0.4)); if (kr <= 0) return;
      const ry = by + 100 + i * 128 + (1 - kr) * 30;
      ctx.save(); ctx.globalAlpha = k * kr;
      rr(bx + 40, ry, bw - 80, 112, 22); ctx.fillStyle = i === 0 ? 'rgba(182,255,59,0.08)' : '#222624'; ctx.fill();
      if (i === 0) { ctx.strokeStyle = 'rgba(182,255,59,0.45)'; ctx.lineWidth = 2; ctx.stroke(); }
      rr(bx + 60, ry + 14, 150, 84, 14); ctx.fillStyle = '#2e332f'; ctx.fill();
      if (img && IMG.x7) { const iw = 140, ih = iw * IMG.x7.height / IMG.x7.width; ctx.drawImage(IMG.x7, bx + 65, ry + 56 - ih / 2, iw, ih); }
      else { ctx.fillStyle = '#4a504b'; rr(bx + 85, ry + 52, 100, 30, 8); ctx.fill(); rr(bx + 105, ry + 36, 60, 22, 8); ctx.fill(); }
      text(name, bx + 235, ry + 40, `700 34px ${EN}`, '#fff', 'left', 'ltr');
      text(yr, bx + 235, ry + 80, `500 26px ${EN}`, 'rgba(255,255,255,0.55)', 'left', 'ltr');
      text(pr, bx + bw - 70, ry + 56, `800 44px ${FA}`, LIME, 'right', 'ltr');
      ctx.restore();
    });
    // strip, button, url
    const kb = eOut(prog(t, O.END_IN + 1.0, 0.5)); ctx.globalAlpha = k * kb;
    text('قیمت تا پشت فنس  |  عکس‌های واقعی  |  هر روز ماشین جدید', W / 2, 1140, `500 32px ${FA}`, 'rgba(255,255,255,0.7)');
    const pulse = 1 + 0.025 * Math.sin((t - O.END_IN) * 5) * kb;
    ctx.save(); ctx.translate(W / 2, 1275); ctx.scale(pulse, pulse);
    rr(-440, -90, 880, 180, 90); ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.shadowColor = LIME; ctx.shadowBlur = 30; ctx.stroke(); ctx.shadowBlur = 0;
    text('لینک بیو رو بزن', 0, -22, `900 62px ${FA}`, LIME);
    text('بعد روی «لیست ماشین‌ها» بزن', 0, 48, `500 32px ${FA}`, '#fff');
    ctx.restore();
    text('khazar-motor.com', W / 2, 1440, `700 50px ${EN}`, '#fff', 'center', 'ltr');
    ctx.restore();
  }

  function drawOverlay(t) {
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.clearRect(0, 0, W, H);
    running(t); price(t); endCard(t);
  }
  async function init(scale, assets) {
    S = scale; const cv = document.getElementById('c'); cv.width = W * S; cv.height = H * S; ctx = cv.getContext('2d');
    for (const [k, src] of Object.entries(assets.images)) { const im = new Image(); im.src = src; await im.decode(); IMG[k] = im; }
    for (const [fam, w, src] of assets.fonts) { const f = new FontFace(fam, `url(${src})`, { weight: w }); await f.load(); document.fonts.add(f); }
    await document.fonts.ready;
  }
  window.OVL = { init, drawOverlay };
})();
