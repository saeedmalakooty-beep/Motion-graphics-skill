// Cover image in the Khazar Lexus-cover layout → renders/cover/cover_<bg>.png
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), bg = process.argv[2] || 's1_plate', carY = +(process.argv[3] || 0);
const b64 = (p, m) => `data:${m};base64,` + fs.readFileSync(path.join(ROOT, p)).toString('base64');
const fv = f => b64('assets/fonts/vazirmatn/' + f, 'font/ttf');
const fi = f => 'data:font/otf;base64,' + fs.readFileSync('/usr/share/fonts/opentype/inter/' + f).toString('base64');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.setContent('<canvas id="c" width="1080" height="1920"></canvas>');
  const data = await p.evaluate(async ([img, fonts, carY]) => {
    for (const [fam, w, src] of fonts) { const f = new FontFace(fam, `url(${src})`, { weight: w }); await f.load(); document.fonts.add(f); }
    const im = new Image(); im.src = img; await im.decode();
    const c = document.getElementById('c'), x = c.getContext('2d'), W = 1080, H = 1920, LIME = '#B6FF3B';
    const s = Math.max(W / im.width, (H + carY) / im.height); x.drawImage(im, (W - im.width * s) / 2, H - im.height * s + carY, im.width * s, im.height * s);
    let g = x.createLinearGradient(0, 0, 0, 1150); g.addColorStop(0, 'rgba(0,0,0,0.72)'); g.addColorStop(0.65, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 1150);
    g = x.createLinearGradient(0, H - 400, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, H - 400, W, 400);
    const T = (s, cx, cy, font, col, dir = 'rtl', ls = '0px', glow = 0) => { x.save(); x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = dir; x.letterSpacing = ls; if (glow) { x.shadowColor = col; x.shadowBlur = glow; } else { x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 20; } x.fillText(s, cx, cy); x.restore(); };
    // pill
    x.font = '600 40px Inter'; const pw = x.measureText('khazar.motor').width + 120;
    x.beginPath(); x.roundRect(W - 40 - pw, 70, pw, 84, 42); x.fillStyle = 'rgba(18,20,19,0.8)'; x.fill();
    x.fillStyle = LIME; x.beginPath(); x.arc(W - 40 - pw + 46, 112, 13, 0, 7); x.fill();
    T('khazar.motor', W - 40 - pw / 2 + 22, 113, '600 40px Inter', '#fff', 'ltr');
    T('BMW X7  ·  xDRIVE40i', W / 2, 245, '500 46px Inter', 'rgba(255,255,255,0.92)', 'ltr', '12px');
    x.fillStyle = LIME; x.fillRect(W / 2 - 80, 288, 160, 5);
    T('تحویل پشت فنس انزلی', W / 2, 370, '500 52px Vazir', 'rgba(255,255,255,0.78)');
    T('حدود ۳۰ هزار دلار', W / 2, 490, '900 140px Vazir', '#fff');
    T('رئیس بزرگ منتظرته', W / 2, 650, '800 76px Vazir', LIME, 'rtl', '0px', 0);
    return c.toDataURL('image/png');
  }, [b64(`assets/kling/stills/${bg}.png`, 'image/png'), [['Vazir', '500', fv('Vazirmatn-Medium.ttf')], ['Vazir', '800', fv('Vazirmatn-ExtraBold.ttf')], ['Vazir', '900', fv('Vazirmatn-Black.ttf')], ['Inter', '500', fi('Inter-Medium.otf')], ['Inter', '600', fi('Inter-SemiBold.otf')]], carY]);
  fs.writeFileSync(path.join(ROOT, `renders/cover/cover_${bg}.png`), Buffer.from(data.split(',')[1], 'base64'));
  await b.close(); console.log('cover', bg);
})();
