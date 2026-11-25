// Part 2 text layer in the style of the Khazar Lexus reel (animated). drawOverlay(t) → transparent canvas.
/* global OVERLAY */
(function () {
  const O = OVERLAY, W = 1080, H = 1920, LIME = '#B6FF3B';
  const FA = 'Vazir', EN = 'Inter';
  let ctx, S = 1; const IMG = {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, a, d) => clamp((t - a) / d);
  const eOut = k => 1 - Math.pow(1 - k, 3);
  const eOutExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
  const eBack = (k, s = 1.7) => (k <= 0 ? 0 : 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2));
  const lerp = (a, b, k) => a + (b - a) * k;
  const fa = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const money = n => fa(Math.round(n).toLocaleString('en-US'));

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function text(s, x, y, font, color, align = 'center', dir = 'rtl', ls = '0px') {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.direction = dir; ctx.letterSpacing = ls; ctx.fillText(s, x, y); ctx.restore();
  }
  function measure(s, font, ls = '0px') { ctx.save(); ctx.font = font; ctx.letterSpacing = ls; const w = ctx.measureText(s).width; ctx.restore(); return w; }

  // Mask-wipe reveal with a lime leading edge. rtl = reveal from the right (Persian), else from the left.
  function wipe(s, x, y, font, color, k, { align = 'center', dir = 'rtl', size = 60, blur = 8, edge = true, glow = 0 } = {}) {
    if (k <= 0) return;
    const w = measure(s, font) + 8, left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const rtl = dir === 'rtl', kk = eOutExpo(k), ex = rtl ? left + w - w * kk : left + w * kk;
    ctx.save(); ctx.beginPath();
    if (rtl) ctx.rect(ex, y - size, left + w - ex + 4, size * 2); else ctx.rect(left - 4, y - size, ex - left + 4, size * 2);
    ctx.clip(); ctx.filter = `blur(${(1 - kk) * blur}px)`;
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
    text(s, x, y, font, color, align, dir); ctx.restore();
    if (edge && k < 1) { ctx.save(); ctx.globalAlpha *= Math.sin(Math.PI * kk); ctx.fillStyle = LIME; ctx.shadowColor = LIME; ctx.shadowBlur = 16; ctx.fillRect(ex - 2, y - size * 0.55, 4, size * 1.1); ctx.restore(); }
  }
  // Words pop in one after another (laid out right-to-left), scale + blur settle.
  function popWords(words, cx, y, font, color, t, t0, { stagger = 0.13, dir = 'rtl', glow = 0 } = {}) {
    const sp = measure(' ', font), ws = words.map(w => measure(w, font)), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let edge = dir === 'rtl' ? cx + total / 2 : cx - total / 2;
    words.forEach((wd, i) => {
      const w = ws[i], c = dir === 'rtl' ? edge - w / 2 : edge + w / 2; edge += (dir === 'rtl' ? -1 : 1) * (w + sp);
      const k = prog(t, t0 + i * stagger, 0.42); if (k <= 0) return;
      const sc = lerp(1.45, 1, eBack(k, 2.2));
      ctx.save(); ctx.globalAlpha *= clamp(k * 2.5); ctx.translate(c, y); ctx.scale(sc, sc);
      ctx.filter = `blur(${(1 - eOut(k)) * 10}px)`; if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
      text(wd, 0, 0, font, color, 'center', dir); ctx.restore();
    });
  }
  function pill(cx, cy, a, t, t0) {
    const k = eBack(prog(t, t0, 0.45), 2); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = a * clamp(k); ctx.translate(cx, cy); ctx.scale(k, k);
    ctx.font = `600 30px ${EN}`; const w = ctx.measureText('khazar.motor').width + 92;
    rr(-w / 2, -32, w, 64, 32); ctx.fillStyle = 'rgba(18,20,19,0.72)'; ctx.fill();
    ctx.strokeStyle = 'rgba(182,255,59,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
    const pr = 9 + 2.5 * Math.sin(t * 5);
    ctx.fillStyle = LIME; ctx.shadowColor = LIME; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(-w / 2 + 36, 0, pr, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    text('khazar.motor', -w / 2 + 60, 1, `600 30px ${EN}`, '#fff', 'left', 'ltr');
    ctx.restore();
  }
  function shade(top, bottom) {
    let g = ctx.createLinearGradient(0, 0, 0, 520);
    g.addColorStop(0, `rgba(0,0,0,${0.55 * top})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
    g = ctx.createLinearGradient(0, H - 700, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.75 * bottom})`); ctx.fillStyle = g; ctx.fillRect(0, H - 700, W, 700);
  }

  // ---------- running layer ----------
  function running(t) {
    const out = 1 - prog(t, O.PRICE_IN - 0.35, 0.35);
    const a = eOut(prog(t, O.TITLE_IN, 0.6)) * out;
    if (a <= 0) return;
    shade(a, a);
    pill(W - 190, 110, out, t, O.TITLE_IN);
    ctx.save(); ctx.globalAlpha = out;
    // year pops, title tracks in (letter-spacing collapse), underline sweeps from the centre
    popWords(['۲۰۲۰'], W / 2, 205, `700 34px ${FA}`, LIME, t, O.TITLE_IN + 0.1);
    const kt = eOutExpo(prog(t, O.TITLE_IN + 0.15, 0.9));
    ctx.save(); ctx.globalAlpha *= kt; ctx.filter = `blur(${(1 - kt) * 6}px)`;
    text('BMW X7  ·  xDRIVE40i', W / 2, 265, `500 36px ${EN}`, '#fff', 'center', 'ltr', `${lerp(34, 9, kt)}px`); ctx.restore();
    const lw = 150 * eOutExpo(prog(t, O.TITLE_IN + 0.5, 0.6)), shine = (t * 0.6) % 1;
    ctx.fillStyle = LIME; ctx.fillRect(W / 2 - lw / 2, 304, lw, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; if (lw > 140) ctx.fillRect(W / 2 - 75 + 150 * shine - 10, 304, 20, 4);
    ctx.restore();
    // big spec line
    for (const [t0, t1, label, value, op] of O.SPECS) {
      const k = prog(t, t0, 0.7), ko = prog(t, t1 - 0.3, 0.3);
      if (k <= 0 || ko >= 1) continue;
      ctx.save(); ctx.globalAlpha = out * (1 - ko);
      const up = eOut(ko) * 40;
      ctx.translate(0, -up); ctx.filter = `blur(${ko * 10}px)`;
      // label slides down into place
      const kl = eOut(prog(t, t0, 0.35));
      ctx.save(); ctx.globalAlpha *= kl; text(label, W / 2, 1555 - (1 - kl) * 20, `500 34px ${FA}`, 'rgba(255,255,255,0.75)'); ctx.restore();
      // value: count-up for numbers, mask wipe for words
      let v = value;
      if (op.count) { const [f0, f1, tpl] = op.count; const n = Math.round(lerp(f0, f1, eOut(prog(t, t0 + 0.05, 0.8)))); v = tpl.replace('#', fa(n)); }
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18;
      const sc = lerp(1.08, 1, eOut(prog(t, t0 + 0.08, 0.5)));
      ctx.translate(W / 2, 1640); ctx.scale(sc, sc); ctx.translate(-W / 2, -1640);
      wipe(v, W / 2, 1640, `800 88px ${FA}`, '#fff', prog(t, t0 + 0.08, 0.55), { size: 70 });
      ctx.restore();
      // lime underline: sweeps across, then settles short
      const vw = measure(value, `800 88px ${FA}`);
      const ks = eOutExpo(prog(t, t0 + 0.15, 0.45)), kc = eOut(prog(t, t0 + 0.65, 0.4));
      const ul = lerp(vw * ks, 90, kc);
      ctx.fillStyle = LIME; ctx.fillRect(W / 2 - ul / 2, 1712, ul, 5);
      if (op.dot) { const kd = eBack(prog(t, t0 + 0.5, 0.4), 3); ctx.fillStyle = LIME; ctx.shadowColor = LIME; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(W / 2 - vw / 2 - 32, 1648, 11 * kd, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    // small spec row: items rise in one by one, dividers grow
    const items = ['۱۷۰ هزار کیلومتر', '2020', 'X7 xDrive40i'], xs = [W / 2 - 250, W / 2, W / 2 + 250];
    items.forEach((s, i) => {
      const k = eOut(prog(t, O.TITLE_IN + 0.5 + i * 0.12, 0.5)); if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = out * k * 0.92;
      text(s, xs[i], 1790 + (1 - k) * 20, `500 30px ${i === 0 ? FA : EN}`, 'rgba(255,255,255,0.88)', 'center', i === 0 ? 'rtl' : 'ltr');
      ctx.restore();
    });
    const kb = eOutExpo(prog(t, O.TITLE_IN + 0.9, 0.5));
    ctx.save(); ctx.globalAlpha = out; ctx.fillStyle = LIME; [W / 2 - 125, W / 2 + 125].forEach(x => ctx.fillRect(x - 1.5, 1790 - 18 * kb, 3, 36 * kb)); ctx.restore();
  }

  // ---------- price card ----------
  function price(t) {
    const P = O.PRICE_IN, kin = eOut(prog(t, P, 0.6)), kout = prog(t, O.END_IN - 0.35, 0.35);
    const a = kin * (1 - kout); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    let g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(0,0,0,0.72)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
    g = ctx.createLinearGradient(0, H - 800, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.82)'); ctx.fillStyle = g; ctx.fillRect(0, H - 800, W, 800);
    wipe('قیمت تا پشت فنس', W / 2, 215, `800 66px ${FA}`, '#fff', prog(t, P + 0.05, 0.6), { size: 55 });
    const ks = eOut(prog(t, P + 0.35, 0.5));
    ctx.save(); ctx.globalAlpha *= ks; text('با همه هزینه‌ها، تحویل پشت فنس انزلی', W / 2, 292 + (1 - ks) * 16, `500 34px ${FA}`, 'rgba(255,255,255,0.75)'); ctx.restore();
    // glass card rises with a slight overshoot, then a shine sweeps across it
    const kc = eBack(prog(t, P + 0.2, 0.7), 1.2), x = 90, w = 900, h = 330, y = 350 + (1 - kc) * 90;
    ctx.save(); ctx.globalAlpha *= clamp(kc * 1.5);
    ctx.translate(W / 2, y + h / 2); const sc = lerp(0.92, 1, clamp(kc)); ctx.scale(sc, sc); ctx.translate(-W / 2, -(y + h / 2));
    rr(x, y, w, h, 38); ctx.fillStyle = 'rgba(16,18,17,0.8)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 2; ctx.stroke();
    const kshine = prog(t, P + 0.9, 0.8);
    if (kshine > 0 && kshine < 1) {
      ctx.save(); rr(x, y, w, h, 38); ctx.clip(); const sx = lerp(x - 300, x + w + 300, kshine);
      const sg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.13)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.transform(1, 0, -0.35, 1, 0, 0); ctx.fillRect(sx - 120 + 0.35 * (y + h), y, 240, h); ctx.restore();
    }
    const row = (cy, n, title, sub, value, t0, color, size) => {
      const kr = prog(t, t0, 0.9); if (kr <= 0) return;
      ctx.save();
      ctx.strokeStyle = LIME; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w - 70, cy, 30, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * eOut(prog(t, t0, 0.4))); ctx.stroke();
      ctx.save(); ctx.globalAlpha *= eOut(prog(t, t0 + 0.2, 0.3)); text(fa(n), x + w - 70, cy + 2, `700 34px ${FA}`, '#fff'); ctx.restore();
      wipe(title, x + w - 125, cy - 18, `700 42px ${FA}`, '#fff', prog(t, t0 + 0.1, 0.5), { align: 'right', size: 34, edge: false });
      ctx.save(); ctx.globalAlpha *= eOut(prog(t, t0 + 0.3, 0.4)); text(sub, x + w - 125, cy + 30, `500 27px ${FA}`, 'rgba(255,255,255,0.6)', 'right'); ctx.restore();
      const kn = eOut(prog(t, t0 + 0.15, 1.0)), landed = prog(t, t0 + 1.15, 0.6);
      ctx.save(); ctx.globalAlpha *= clamp(kn * 3);
      if (color === LIME) { ctx.shadowColor = LIME; ctx.shadowBlur = 28 * Math.sin(Math.PI * landed); }
      const bump = 1 + 0.08 * Math.sin(Math.PI * landed); ctx.translate(x + 50, cy); ctx.scale(bump, bump);
      text('$ ' + money(value * kn), 0, 0, `800 ${size}px ${FA}`, color, 'left', 'ltr'); ctx.restore();
      ctx.restore();
    };
    row(y + 85, 1, 'قیمت خودرو', 'BMW X7 xDrive40i · ۲۰۲۰', 26000, P + 0.5, '#fff', 64);
    const kd = eOutExpo(prog(t, P + 0.9, 0.5)); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(W / 2 - (w - 80) / 2 * kd, y + h / 2, (w - 80) * kd, 2);
    row(y + 245, 2, 'تحویل پشت فنس', 'حمل · بیمه · مالیات · کارفکس · کارشناسی', 30260, P + 1.0, LIME, 72);
    ctx.restore();
    const kp = eOut(prog(t, P + 1.6, 0.4)); ctx.save(); ctx.globalAlpha *= kp; text('پلاک‌گذاری بر عهده خریدار', W / 2, 735, `500 30px ${FA}`, 'rgba(255,255,255,0.62)'); ctx.restore();
    // engagement line: words pop in, then the lime prompt wipes in and bobs
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20;
    popWords(['رئیس', 'بزرگ', 'منتظرته'], W / 2, 1600, `900 104px ${FA}`, '#fff', t, P + 1.8, { stagger: 0.15 }); ctx.restore();
    const bob = Math.sin((t - P) * 4) * 4 * prog(t, P + 2.8, 0.3);
    wipe('همین الان پیام بده', W / 2, 1722 + bob, `700 52px ${FA}`, LIME, prog(t, P + 2.3, 0.6), { size: 45 });
    ctx.restore();
  }

  // ---------- website end card ----------
  function endCard(t) {
    const E = O.END_IN, k = eOut(prog(t, E, 0.45)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = '#0c0f0d'; ctx.fillRect(0, 0, W, H);
    const br = 1 + 0.08 * Math.sin((t - E) * 2.2);
    let g = ctx.createRadialGradient(W / 2, H * 0.95, 50, W / 2, H * 0.95, 900 * br);
    g.addColorStop(0, 'rgba(120,180,40,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W / 2, H * 0.08, 30, W / 2, H * 0.08, 700); g.addColorStop(0, 'rgba(120,180,40,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    pill(W / 2, 265, 1, t, E + 0.1);
    popWords(['همه', 'ماشین‌ها'], W / 2, 375, `900 100px ${FA}`, '#fff', t, E + 0.2, { stagger: 0.12 });
    popWords(['روی', 'سایت', 'ما'], W / 2, 495, `900 100px ${FA}`, LIME, t, E + 0.42, { stagger: 0.1, glow: 18 });
    // browser mock rises in
    const kb = eBack(prog(t, E + 0.55, 0.6), 1.1), bx = 130, bw = 820, bh = 500, by = 590 + (1 - kb) * 80;
    ctx.save(); ctx.globalAlpha *= clamp(kb * 1.6);
    rr(bx, by, bw, bh, 34); ctx.fillStyle = '#1a1d1b'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; ctx.stroke();
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { const kd = eBack(prog(t, E + 0.75 + i * 0.06, 0.3), 3); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx + 44 + i * 34, by + 44, 10 * kd, 0, 7); ctx.fill(); });
    rr(bx + 150, by + 22, bw - 180, 46, 23); ctx.fillStyle = '#262a27'; ctx.fill();
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(bx + 180, by + 45, 8, 0, 7); ctx.fill();
    const url = 'khazar-motor.com', nch = Math.floor(url.length * prog(t, E + 0.8, 0.6));
    text(url.slice(0, nch), bx + 200, by + 46, `600 28px ${EN}`, '#fff', 'left', 'ltr');
    if (nch < url.length && Math.floor(t * 4) % 2 === 0) { const cw = measure(url.slice(0, nch), `600 28px ${EN}`); ctx.fillStyle = LIME; ctx.fillRect(bx + 202 + cw, by + 32, 3, 28); }
    const rows = [['BMW X7 xDrive40i', '2020', 30260, 'x7'], ['Toyota Camry', '2021', 20140], ['Mercedes GLC 300', '2022', 35050]];
    rows.forEach(([name, yr, pr, img], i) => {
      const t0 = E + 1.0 + i * 0.18, kr = eOut(prog(t, t0, 0.45)); if (kr <= 0) return;
      const ry = by + 100 + i * 128, rx = bx + 40 + (1 - kr) * 60;
      ctx.save(); ctx.globalAlpha *= kr;
      rr(rx, ry, bw - 80, 112, 22); ctx.fillStyle = i === 0 ? 'rgba(182,255,59,0.08)' : '#222624'; ctx.fill();
      if (i === 0) { ctx.strokeStyle = `rgba(182,255,59,${0.35 + 0.25 * Math.sin((t - E) * 4)})`; ctx.lineWidth = 2; ctx.stroke(); }
      rr(rx + 20, ry + 14, 150, 84, 14); ctx.fillStyle = '#2e332f'; ctx.fill();
      if (img && IMG.x7) { const iw = 140, ih = iw * IMG.x7.height / IMG.x7.width; ctx.drawImage(IMG.x7, rx + 25, ry + 56 - ih / 2, iw, ih); }
      else { ctx.fillStyle = '#4a504b'; rr(rx + 45, ry + 52, 100, 30, 8); ctx.fill(); rr(rx + 65, ry + 36, 60, 22, 8); ctx.fill(); }
      text(name, rx + 195, ry + 40, `700 34px ${EN}`, '#fff', 'left', 'ltr');
      text(yr, rx + 195, ry + 80, `500 26px ${EN}`, 'rgba(255,255,255,0.55)', 'left', 'ltr');
      text('$ ' + money(pr * eOut(prog(t, t0 + 0.1, 0.7))), rx + bw - 110, ry + 56, `800 44px ${FA}`, LIME, 'right', 'ltr');
      ctx.restore();
    });
    ctx.restore();
    // strip, button (outline draws on, text wipes, shine loops), url
    const ks = eOut(prog(t, E + 1.5, 0.5));
    ctx.save(); ctx.globalAlpha *= ks; text('قیمت تا پشت فنس  |  عکس‌های واقعی  |  هر روز ماشین جدید', W / 2, 1140 + (1 - ks) * 15, `500 32px ${FA}`, 'rgba(255,255,255,0.72)'); ctx.restore();
    const kd = eOut(prog(t, E + 1.6, 0.7)), pulse = 1 + 0.022 * Math.sin((t - E) * 5) * prog(t, E + 2.4, 0.4);
    ctx.save(); ctx.translate(W / 2, 1275); ctx.scale(pulse, pulse);
    rr(-440, -90, 880, 180, 90); ctx.setLineDash([2000 * kd, 2400]); ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.shadowColor = LIME; ctx.shadowBlur = 30; ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur = 0;
    const kfill = eOut(prog(t, E + 2.2, 0.4)); rr(-440, -90, 880, 180, 90); ctx.fillStyle = `rgba(182,255,59,${0.07 * kfill})`; ctx.fill();
    const loop = ((t - E - 2.4) % 1.6) / 1.6;
    if (t > E + 2.4) { ctx.save(); rr(-440, -90, 880, 180, 90); ctx.clip(); const sx = lerp(-700, 700, loop);
      const sg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0); sg.addColorStop(0, 'rgba(182,255,59,0)'); sg.addColorStop(0.5, 'rgba(182,255,59,0.22)'); sg.addColorStop(1, 'rgba(182,255,59,0)');
      ctx.fillStyle = sg; ctx.fillRect(-440, -90, 880, 180); ctx.restore(); }
    wipe('لینک بیو رو بزن', 0, -22, `900 62px ${FA}`, LIME, prog(t, E + 1.9, 0.55), { size: 50 });
    ctx.save(); ctx.globalAlpha *= eOut(prog(t, E + 2.2, 0.4)); text('بعد روی «لیست ماشین‌ها» بزن', 0, 48, `500 32px ${FA}`, '#fff'); ctx.restore();
    ctx.restore();
    const ku = eOut(prog(t, E + 2.3, 0.5));
    ctx.save(); ctx.globalAlpha *= ku; text('khazar-motor.com', W / 2, 1440 + (1 - ku) * 20, `700 50px ${EN}`, '#fff', 'center', 'ltr', `${lerp(14, 0, ku)}px`); ctx.restore();
    ctx.restore();
  }

  function drawOverlay(t) {
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.filter = 'none';
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
