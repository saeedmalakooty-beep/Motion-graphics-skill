# Track the green Kling plate in a clip and paste the real KHAZAR MOTOR plate over it.
# Usage: python3 -I scripts/replace_plate.py in.mp4 out.mp4
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
plate = cv2.imread('assets/images/khazar_plate.jpg')
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(3)), int(cap.get(4))
out = cv2.VideoWriter('cache/_plate_tmp.mp4', cv2.VideoWriter_fourcc(*'mp4v'), fps, (W, H))
PW = None
frames, boxes = [], []
while True:
    ok, f = cap.read()
    if not ok: break
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    m = cv2.morphologyEx(cv2.inRange(hsv, (55, 60, 40), (100, 255, 230)), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cs = [c for c in cs if cv2.contourArea(c) > 300]
    boxes.append(cv2.boundingRect(max(cs, key=cv2.contourArea)) if cs else None)
    frames.append(f)
full = [b[2] for b in boxes if b and b[0] > 2]
PW = int(np.median(full)) + 4 if full else 216
for f, b in zip(frames, boxes):
    if b:
        x, y, w, h = b; right = x + w + 2; top, ph = y - 2, h + 4
        left = right - PW
        p = cv2.resize(plate, (PW, ph), interpolation=cv2.INTER_AREA).astype(np.float32) * 0.82   # match dusk exposure
        x0 = max(0, left); p = p[:, x0 - left:]
        roi = f[top:top + ph, x0:right].astype(np.float32)
        a = np.ones(p.shape[:2], np.float32); a = cv2.GaussianBlur(a * 0 + 1, (3, 3), 0)[..., None]
        f[top:top + ph, x0:right] = (p * a + roi * (1 - a)).astype(np.uint8)
    out.write(f)
out.release()
print('plate width', PW, 'frames', len(frames))
