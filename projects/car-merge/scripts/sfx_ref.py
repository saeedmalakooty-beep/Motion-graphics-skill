# Sound design using the reference reel's own merge sounds (user request): cache/events.json -> assets/sfx/mix_raw.wav
import json, wave, numpy as np
SR = 48000
ev = json.load(open('cache/events.json')); E, F, DUR = ev['events'], ev['FINALE'], ev['DURATION']
def load(n):
    with wave.open(f'assets/sfx/ref/{n}.wav') as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(float) / 32768
S = {k: load(k) for k in ['chimeA', 'chimeB', 'big', 'x7', 'reveal']}
mix = np.zeros((int((DUR + 0.6) * SR), 2))
def add(k, t, g=1.0):
    i = int(t * SR); s = S[k][: len(mix) - i]; mix[i:i + len(s)] += s * g
merges = [e for e in E if e['type'] == 'merge']
for j, e in enumerate(merges):
    if e['tier'] == 7: add('x7', e['hit'])
    elif e['tier'] == 6: add('big', e['hit'])
    else: add('chimeA' if j % 2 == 0 else 'chimeB', e['hit'])
add('reveal', F['reveal'] - 0.05)
mix /= np.abs(mix).max() * 1.12
with wave.open('assets/sfx/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', len(merges), 'merges')
