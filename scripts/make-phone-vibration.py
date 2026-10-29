"""Generate an original short double phone motor buzz and embed its dialogue cue.

Deterministic synthesis, no external recording. Preserves all other project fields.
"""
import base64
import io
import json
import math
from pathlib import Path
import random
import struct
import wave

ROOT = Path(__file__).resolve().parents[1]
RATE = 24000
rng = random.Random(712)
samples = []
for i in range(round(RATE * 0.95)):
    t = i / RATE
    value = 0.0
    for start, duration in [(0.04, 0.28), (0.46, 0.32)]:
        local = t - start
        if 0 <= local < duration:
            # Soft motor spin-up/down, low fundamental, small casing rattle.
            envelope = min(1, local / 0.025, (duration - local) / 0.045)
            phase = 2 * math.pi * (139 * local + 1.7 * math.sin(2 * math.pi * 7 * local) / (2 * math.pi * 7))
            value += envelope * (0.44 * math.sin(phase) + 0.14 * math.sin(phase * 2) + 0.07 * math.sin(phase * 3) + 0.025 * rng.uniform(-1, 1))
    samples.append(struct.pack('<h', round(value * 28000)))
buffer = io.BytesIO()
with wave.open(buffer, 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(RATE)
    output.writeframes(b''.join(samples))
raw = buffer.getvalue()
path = ROOT / 'references/audio/phone-vibration.wav'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_bytes(raw)
project_path = ROOT / 'projects/published.stillframe.json'
p = json.loads(project_path.read_text())
asset = {'id': 'studio-phone-vibration', 'name': 'Phone · short double vibration', 'data': 'data:audio/wav;base64,' + base64.b64encode(raw).decode()}
assets = p.setdefault('audioAssets', [])
assets[:] = [a for a in assets if a['id'] != asset['id']] + [asset]
scene = next(s for s in p['scenes'] if s['id'] == 'bedroom')
node = next(n for n in scene['nodes'] if n['id'] == 'vibrate')
assert scene['nodes'][1]['id'] == node['id'] and 'phone vibrates' in node['text']
node['sound'] = {'asset': asset['id'], 'volume': 0.65}
project_path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n')
print('Saved phone-vibration.wav and assigned it to bedroom dialogue 2.')
