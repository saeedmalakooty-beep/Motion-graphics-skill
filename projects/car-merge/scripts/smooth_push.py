# Smooth sub-pixel digital push-in over a whole clip: python3 -I scripts/smooth_push.py in.mp4 out_raw.avi zoom_total [cy_frac]
import sys, cv2, numpy as np
src, dst, zt = sys.argv[1], sys.argv[2], float(sys.argv[3]); cyf = float(sys.argv[4]) if len(sys.argv) > 4 else 0.52
cap = cv2.VideoCapture(src); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)); fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(3)), int(cap.get(4))
out = cv2.VideoWriter(dst, cv2.VideoWriter_fourcc(*'FFV1'), fps, (W, H))
for i in range(n):
    ok, f = cap.read()
    if not ok: break
    k = i / max(1, n - 1); s = 1 + zt * (3 * k * k - 2 * k * k * k) * 0.35 + zt * k * 0.65   # mostly linear, eased ends
    cx, cy = W / 2, H * cyf
    M = np.float32([[s, 0, cx - s * cx], [0, s, cy - s * cy]])
    out.write(cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT))
out.release(); print('frames', n)
