#!/usr/bin/env node
// node src/render_overlay.js --from <s> --to <s> --fps 30 --scale 1 --out <dir> [--jpg]
// Default: transparent PNG frames. --jpg: frames composited over a grey check background (preview only).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const ROOT = path.join(__dirname, '..'), O = require('./overlay_data.js');
const from = +opt('from', 0), to = +opt('to', O.DURATION), fps = +opt('fps', 30), scale = +opt('scale', 1), out = opt('out', 'cache/ovl');
const jpg = a.includes('--jpg');
fs.mkdirSync(out, { recursive: true });
const b64 = (p, m) => `data:${m};base64,` + fs.readFileSync(path.join(ROOT, p)).toString('base64');
const fv = f => b64('assets/fonts/vazirmatn/' + f, 'font/ttf');
const fi = f => `data:font/otf;base64,` + fs.readFileSync('/usr/share/fonts/opentype/inter/' + f).toString('base64');
const fonts = [['Vazir', '500', fv('Vazirmatn-Medium.ttf')], ['Vazir', '700', fv('Vazirmatn-Bold.ttf')], ['Vazir', '800', fv('Vazirmatn-ExtraBold.ttf')],
  ['Vazir', '900', fv('Vazirmatn-Black.ttf')], ['Inter', '500', fi('Inter-Medium.otf')], ['Inter', '600', fi('Inter-SemiBold.otf')], ['Inter', '700', fi('Inter-Bold.otf')]];
const images = { x7: b64('assets/images/tiers/x7.png', 'image/png') };
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.setContent('<html><body style="margin:0;background:transparent"><canvas id="c"></canvas></body></html>');
  await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'overlay_data.js'), 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'overlay.js'), 'utf8') });
  await p.evaluate(([s, as]) => window.OVL.init(s, as), [scale, { images, fonts }]);
  const n = Math.max(1, Math.round((to - from) * fps));
  for (let i = 0; i < n; i++) {
    const t = from + i / fps;
    const d = await p.evaluate(([t, jpg]) => {
      window.OVL.drawOverlay(t); const c = document.getElementById('c');
      if (!jpg) return c.toDataURL('image/png');
      const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const x = o.getContext('2d');
      x.fillStyle = '#6b6f6c'; x.fillRect(0, 0, o.width, o.height); x.drawImage(c, 0, 0); return o.toDataURL('image/jpeg', 0.85);
    }, [t, jpg]);
    fs.writeFileSync(path.join(out, String(i).padStart(5, '0') + (jpg ? '.jpg' : '.png')), Buffer.from(d.split(',')[1], 'base64'));
  }
  await b.close(); console.log(`overlay ${n} frames -> ${out}`);
})();
