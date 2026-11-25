# Builds tinted tier sprites (X2..X6) from the user's X7 cutout; X7 = untouched real car.
import numpy as np
from PIL import Image, ImageFilter
cut = Image.open('cache/cut/x7_cut_raw.png'); cut = cut.crop(cut.getbbox())
a = np.asarray(cut).astype(np.float32)/255
rgb, al = a[...,:3], a[...,3:]
H, W = rgb.shape[:2]
L = (0.2126*rgb[...,0]+0.7152*rgb[...,1]+0.0722*rgb[...,2])[...,None]
mx, mn = rgb.max(-1, keepdims=True), rgb.min(-1, keepdims=True)
sat = (mx-mn)/(mx+1e-4)
ss = lambda e0,e1,x: np.clip((x-e0)/(e1-e0),0,1)**2*(3-2*np.clip((x-e0)/(e1-e0),0,1))
paint = ss(0.66,0.40,L)*(1-ss(0.12,0.32,sat))
yy = (np.arange(H)/H)[:,None,None]*np.ones((1,W,1))
xx = (np.arange(W)/W)[None,:,None]*np.ones((H,1,1))
glass = ss(0.02,0.06,yy)*(1-ss(0.27,0.31,yy))*ss(0.15,0.2,xx)*(1-ss(0.8,0.85,xx))
tyre = ss(0.86,0.9,yy)*(1-ss(0.2,0.25,xx)+ss(0.75,0.8,xx)).clip(0,1)
m = paint*(1-glass)*(1-tyre)
m = np.asarray(Image.fromarray((m[...,0]*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))[...,None]/255
tiers = {'x2':(0.62,0.06,0.09),'x3':(0.12,0.17,0.34),'x4':(0.50,0.52,0.56),'x5':(0.08,0.27,0.80),'x6':(0.05,0.30,0.22)}
Ls = np.asarray(Image.fromarray((L[...,0]*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)))[...,None]/255
for k,c in tiers.items():
    c = np.array(c)[None,None,:]
    body = np.clip(c*(0.45+2.4*Ls) + np.clip(Ls-0.25,0,1)*0.9, 0, 1)
    out = rgb*(1-m)+body*m
    pl = ss(0.36,0.37,xx)*(1-ss(0.63,0.64,xx))*ss(0.78,0.79,yy)*(1-ss(0.885,0.895,yy))*ss(0.55,0.7,L)
    out = out*(1-pl)+np.array([0.93,0.93,0.92])*pl
    Image.fromarray((np.concatenate([out,al],-1)*255).astype(np.uint8)).save(f'assets/images/tiers/{k}.png')
cut.save('assets/images/tiers/x7.png')
print(cut.size)
