#!/usr/bin/env node
// Render CLI: node src/render.js --from <s> --to <s> --fps <n> --scale <0-1> --out <dir> [--jpg] [--events <json>]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const ROOT = path.join(__dirname, '..');
const TL = require('./data.js');
if (opt('events')) { fs.writeFileSync(opt('events'), JSON.stringify({ events: TL.events, FINALE: TL.FINALE, DURATION: TL.DURATION, BEAT: TL.BEAT }, null, 1)); console.log('events ->', opt('events')); process.exit(0); }

const from = +opt('from', 0), to = +opt('to', TL.DURATION), fps = +opt('fps', 30), scale = +opt('scale', 1);
const out = opt('out', 'cache/frames'), jpg = a.includes('--jpg');
fs.mkdirSync(out, { recursive: true });
const b64 = (p, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(ROOT, p)).toString('base64');
const images = { bg: b64('assets/images/end_bg_blur.jpg', 'image/jpeg') };
for (let i = 2; i <= 7; i++) images['x' + i] = b64(`assets/images/tiers/x${i}.png`, 'image/png');
const F = '/usr/share/fonts/opentype/inter/';
const font = f => `data:font/otf;base64,` + fs.readFileSync(F + f).toString('base64');
const fonts = [['Inter', '300', 'normal', font('Inter-Light.otf')], ['Inter', '600', 'normal', font('Inter-SemiBold.otf')],
  ['Inter', '800', 'normal', font('Inter-ExtraBold.otf')], ['Inter', '900', 'normal', font('Inter-Black.otf')],
  ['Inter', '900', 'italic', font('Inter-BlackItalic.otf')]];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<html><body style="margin:0;background:#000"><canvas id="c"></canvas></body></html>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8') });
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'scene.js'), 'utf8') });
  await page.evaluate(([s, as]) => window.SCENE.init(s, as), [scale, { images, fonts }]);
  const n = Math.max(1, Math.round((to - from) * fps));
  const q = jpg ? 0.85 : 0.95;
  for (let i = 0; i < n; i++) {
    const t = from + i / fps;
    const data = await page.evaluate(([t, q]) => { window.SCENE.drawFrame(t); return document.getElementById('c').toDataURL('image/jpeg', q); }, [t, q]);
    fs.writeFileSync(path.join(out, String(i).padStart(5, '0') + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log(`rendered ${n} frames -> ${out}`);
})();
