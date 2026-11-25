#!/usr/bin/env node
// Part 2 edit: builds shots from src/overlay_data.js, composites the text layer, joins with part 1.
// node scripts/edit_part2.mjs [--skip-overlay] [--vo assets/vo/vo.wav]
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const O = require('../src/overlay_data.js');
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const T = 'cache/p2b', V = 'assets/kling/videos', S = 'assets/kling/stills';
mkdirSync(T, { recursive: true });
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const FIT = 'scale=1080:1914:flags=lanczos,pad=1080:1920:0:3,fps=30,setsar=1';
const ENC = ['-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p'];
const files = [];
for (const c of O.CUTS) {
  const f = `${T}/${c.id}.mp4`; files.push(f);
  if (c.src.startsWith('kb:')) {
    const n = Math.round(c.dur * 30);
    ff('-loop', '1', '-t', String(c.dur), '-i', `${S}/${c.src.slice(3)}.png`, '-vf',
      `scale=2160:3826:flags=lanczos,zoompan=z='1+0.06*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1914:fps=30,pad=1080:1920:0:3,setsar=1`, ...ENC, f);
  } else if (c.src === 'hold') {
    const prev = `${T}/${O.CUTS[O.CUTS.indexOf(c) - 1].id}.mp4`;
    ff('-sseof', '-0.04', '-i', prev, '-frames:v', '1', `${T}/last.png`);
    ff('-loop', '1', '-t', String(c.dur), '-i', `${T}/last.png`, '-vf', 'fps=30,setsar=1', ...ENC, f);
  } else if (c.src === 'end') {
    ff('-f', 'lavfi', '-t', String(c.dur), '-i', 'color=c=0x0c0f0d:s=1080x1920:r=30', ...ENC, f);
  } else if (c.speed === 'extend') { // clip at normal speed, last frame held, one continuous digital push over the whole shot
    const n = Math.round(c.dur * 30);
    ff('-ss', String(c.inn), '-i', `${V}/${c.src}.mp4`, '-vf', `${FIT},tpad=stop_mode=clone:stop_duration=${c.dur}`, '-t', String(c.dur), ...ENC, `${T}/${c.id}_raw.mp4`);
    execFileSync('python3', ['-I', 'scripts/smooth_push.py', `${T}/${c.id}_raw.mp4`, `${T}/${c.id}_push.avi`, '0.07'], { stdio: 'inherit' });
    ff('-i', `${T}/${c.id}_push.avi`, '-vf', 'setsar=1', ...ENC, f);
  } else {
    ff('-ss', String(c.inn), '-t', String(c.dur), '-i', `${V}/${c.src}.mp4`, '-vf', FIT, ...ENC, f);
  }
}
writeFileSync(`${T}/list.txt`, files.map(f => `file '${f.split('/').pop()}'`).join('\n'));
ff('-f', 'concat', '-safe', '0', '-i', `${T}/list.txt`, '-c', 'copy', `${T}/base.mp4`);
if (!a.includes('--skip-overlay') || !existsSync(`${T}/ovl/00000.png`))
  execFileSync('node', ['src/render_overlay.js', '--fps', '30', '--out', `${T}/ovl`], { stdio: 'inherit' });
ff('-i', `${T}/base.mp4`, '-framerate', '30', '-i', `${T}/ovl/%05d.png`, '-filter_complex', '[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v]',
  '-map', '[v]', ...ENC, `${T}/part2_video.mp4`);
// audio: user's VO if given, else silence
const vo = opt('vo');
const aud = vo ? ['-i', vo] : ['-f', 'lavfi', '-t', String(O.DURATION), '-i', 'anullsrc=r=48000:cl=stereo'];
ff('-i', `${T}/part2_video.mp4`, ...aud, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', 'renders/previews/part2_v2.mp4');
ff('-i', 'renders/final/car_merge_part1_v4.mp4', '-i', 'renders/previews/part2_v2.mp4', '-filter_complex',
  '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]', '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'renders/previews/full_v2.mp4');
console.log('done → renders/previews/full_v2.mp4');
