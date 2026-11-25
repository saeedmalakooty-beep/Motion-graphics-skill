#!/usr/bin/env bash
# Rough cut of part 2 (Kling clips + 2 code-animated stills) → renders/previews/part2_rough.mp4, then part1+part2.
set -e; cd "$(dirname "$0")/.."; V=assets/kling/videos; S=assets/kling/stills; T=cache/p2; mkdir -p $T
FIT="scale=1080:1914:flags=lanczos,pad=1080:1920:0:3,fps=30,setsar=1"
clip(){ ffmpeg -v error -y -ss $3 -t $4 -i $V/$2.mp4 -an -vf "$FIT$5" -c:v libx264 -crf 16 -pix_fmt yuv420p $T/$1.mp4; }
kb(){ # still → slow push-in, $3 = seconds
  ffmpeg -v error -y -loop 1 -t $3 -i $S/$2.png -vf "scale=2160:3826:flags=lanczos,zoompan=z='1+0.06*on/($3*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1914:fps=30,pad=1080:1920:0:3,setsar=1" -an -c:v libx264 -crf 16 -pix_fmt yuv420p $T/$1.mp4; }
clip a v0      0.0 3.0      # continues straight from the animation (slow push on the front)
clip b v1      0.4 3.0      # front 3/4, sun flare grows
kb   c s2          2.0      # grille + headlight (still, push-in)
clip d v3      2.2 2.8      # under the tree (after the falling leaf)
clip e v4      0.5 3.0      # wheel slide, sun on paint
clip f v5_plate 1.6 3.0     # rear 3/4 orbit, real plate
kb   g s6          2.0      # taillight (still, push-in)
clip h v7      0.8 3.6      # interior, sun flare
clip i v0      2.6 2.4      # front hero for the end card
ffmpeg -v error -y -sseof -0.04 -i $T/i.mp4 -frames:v 1 $T/last.png
ffmpeg -v error -y -loop 1 -t 3 -i $T/last.png -vf "fps=30,setsar=1" -c:v libx264 -crf 16 -pix_fmt yuv420p $T/j.mp4   # hold for price / CTA
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 d.mp4 e.mp4 f.mp4 g.mp4 h.mp4 i.mp4 j.mp4 > $T/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $T/list.txt -c copy $T/part2_silent.mp4
ffmpeg -v error -y -i $T/part2_silent.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo -shortest -c:v copy -c:a aac renders/previews/part2_rough.mp4
ffmpeg -v error -y -i renders/final/car_merge_part1_v4.mp4 -i renders/previews/part2_rough.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart renders/previews/full_rough_v1.mp4
for f in renders/previews/part2_rough.mp4 renders/previews/full_rough_v1.mp4; do ffprobe -v error -show_entries format=duration -of csv=p=0 $f; done
