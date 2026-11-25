# Synthesises the full sound design from cache/events.json -> assets/sfx/mix_raw.wav
import json, numpy as np, wave
SR = 48000
ev = json.load(open('cache/events.json')); E, F, DUR, BEAT = ev['events'], ev['FINALE'], ev['DURATION'], ev['BEAT']
N = int((DUR + 0.6) * SR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def tt(d): return np.arange(int(d * SR)) / SR
def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); s = sig[: max(0, N - i)] * g
    L[i:i + len(s)] += s * np.sqrt((1 - pan) / 2) * 1.41; R[i:i + len(s)] += s * np.sqrt((1 + pan) / 2) * 1.41
def lp(x, a):  # one-pole low-pass, a in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def bell(f, d=0.9, bright=1.0):
    t = tt(d); env = np.exp(-t * 5.5) * (1 - np.exp(-t * 900))
    mod = np.sin(2 * np.pi * f * 2.0 * t) * 2.2 * bright * np.exp(-t * 9)
    s = np.sin(2 * np.pi * f * t + mod) * env
    s += 0.35 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 9)
    s += 0.18 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 14)
    return s
def thump(f0=110, d=0.35, g=1.0):
    t = tt(d); f = f0 * (1 + 2.5 * np.exp(-t * 35)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * g
def click(d=0.03):
    t = tt(d); return rng.standard_normal(len(t)) * np.exp(-t * 220)
def whoosh(d, up=True, a0=0.02, a1=0.25):
    t = tt(d); n = rng.standard_normal(len(t)); k = t / d
    a = a0 + (a1 - a0) * (k if up else 1 - k)
    y = np.empty_like(n); acc = 0.0
    for i, v in enumerate(n): acc += a[i] * (v - acc); y[i] = acc
    env = np.sin(np.pi * np.clip(k, 0, 1)) ** 1.5 if not up else k ** 2.2 * (1 - np.exp(-(1 - k) * 60))
    return y * env * 3
def pop(f=520):
    t = tt(0.12); f_ = f * (1 + 1.2 * np.exp(-t * 60)); ph = 2 * np.pi * np.cumsum(f_) / SR
    return np.sin(ph) * np.exp(-t * 38)
PENTA = [659.3, 784.0, 880.0, 987.8, 1174.7, 1318.5, 1568.0, 1760.0, 1975.5, 2349.3]
pan_of = lambda slot: [-0.55, 0, 0.55][slot % 3]

run, prevTier = 0, None
for e in E:
    if e['type'] in ('intro', 'spawn'):
        for i, s in enumerate(e['slots']):
            add(pop(480 + 40 * (i % 4)), e['t'] + i * (0.055 if e['type'] == 'intro' else 0.05), pan_of(s), 0.22)
    if e['type'] == 'merge':
        tier, hit = e['tier'], e['hit']
        run = run + 1 if tier == prevTier else 0; prevTier = tier
        big = tier >= 6
        add(whoosh(hit - e['t'] + 0.02, up=True), e['t'], pan_of(e['from']) * 0.6, 0.11 if not big else 0.22)
        note = PENTA[min(len(PENTA) - 1, (tier - 3) * 2 + (run % 2))]
        add(bell(note, 1.1 if big else 0.8), hit, pan_of(e['to']) * 0.5, 0.30)
        add(bell(note / 2, 0.6, 0.5), hit, 0, 0.12)
        add(thump(70 if big else 95, 0.5 if big else 0.3), hit, 0, 0.55 if big else 0.32)
        add(click(), hit, 0, 0.10)
        if big:
            t = tt(1.4); n = lp(rng.standard_normal(len(t)), 0.08) * np.exp(-t * 3.5)
            add(n, hit, 0, 0.25)
# finale: X7 lands -> shimmer; fly whoosh; riser into reveal; boom + sparkle; title ding
X7 = F['hold']
for i, f in enumerate([1318.5, 1568.0, 1975.5, 2637.0]):
    add(bell(f, 1.6, 0.6), X7 + 0.04 * i, [-0.4, 0.4, -0.2, 0.2][i], 0.13)
add(whoosh(F['reveal'] - F['fly'] + 0.05, up=True, a0=0.01, a1=0.4), F['fly'], 0, 0.5)
t = tt(F['reveal'] - F['fly']); rs = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / t[-1]) ** 2) / SR) * (t / t[-1]) ** 2
add(rs, F['fly'], 0, 0.10)
add(thump(48, 1.6, 1.0), F['reveal'], 0, 0.9)
t = tt(2.5); n = lp(rng.standard_normal(len(t)), 0.15) * np.exp(-t * 2.2); add(n, F['reveal'], -0.2, 0.30); add(lp(rng.standard_normal(len(t)), 0.15) * np.exp(-t * 2.2), F['reveal'], 0.2, 0.30)
add(click(0.05), F['reveal'], 0, 0.3)
add(whoosh(0.6, up=False, a0=0.3, a1=0.02), F['reveal'] + 0.02, 0, 0.35)
add(bell(880, 1.8, 0.4), F['title'], 0, 0.18); add(bell(1318.5, 1.8, 0.4), F['title'] + 0.08, 0, 0.12)
# music bed: dark pad (A minor) + soft sub pulse on every beat from first merge until finale
T = np.arange(N) / SR
pad = sum(np.sin(2 * np.pi * f * T + 0.3 * np.sin(2 * np.pi * 0.2 * T + j)) for j, f in enumerate([110, 130.8, 164.8, 220]))
pad = lp(pad, 0.05) * np.clip(T / 1.2, 0, 1) * np.clip((F['reveal'] + 0.1 - T) / 0.3, 0, 1)
L += pad * 0.035; R += pad * 0.035
first = [e for e in E if e['type'] == 'merge'][0]['hit']
b = first - BEAT * 2
while b < F['fly']:
    add(thump(55, 0.25), b, 0, 0.18); add(click(0.02), b + BEAT / 2, 0.3, 0.03); b += BEAT
st = np.stack([L, R], 1); st /= np.abs(st).max() * 1.12
with wave.open('assets/sfx/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', N / SR)
