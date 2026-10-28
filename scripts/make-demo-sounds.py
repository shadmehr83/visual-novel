"""Create original, deterministic sound designs; ffmpeg encodes portable Ogg assets."""
import math, random, struct, subprocess, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'references' / 'audio'
ROOT.mkdir(parents=True, exist_ok=True)
RATE = 24000

def save(name, samples):
    path = ROOT / (name + '.wav')
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE)
        f.writeframes(b''.join(struct.pack('<h', round(max(-1, min(1, x)) * 28000)) for x in samples))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(path), '-c:a', 'libvorbis', '-q:a', '3', str(ROOT / (name + '.ogg'))], check=True)
    path.unlink()

rng = random.Random(240)
rain = []
low = 0
for i in range(RATE * 12):
    low += 0.1 * (rng.uniform(-1, 1) - low)
    rain.append((low * 0.65 + rng.uniform(-1, 1) * 0.13) * (0.87 + 0.08 * math.sin(i / RATE * 0.8)))
# Periodic droplets and a short cross-fade make the ambience loop without a click.
for k in range(130):
    at = rng.randrange(len(rain)); freq = rng.uniform(800, 2400)
    for j in range(1800):
        t = j / RATE
        rain[(at + j) % len(rain)] += 0.065 * math.sin(2 * math.pi * freq * t) * math.exp(-t * 70)
fade = 1600
for j in range(fade):
    mix = j / fade
    rain[-fade+j] = rain[-fade+j] * (1-mix) + rain[j] * mix
rain = rain[fade:]
save('rain-outside', rain)
inside=[]; low=0
for v in rain:
    low += 0.055 * (v - low)
    inside.append(low * 1.3)
save('rain-room-muffled', inside)

step=[]; low=0
for i in range(int(RATE * 0.38)):
    t=i/RATE; low += 0.18*(rng.uniform(-1,1)-low)
    step.append((low*0.85 + math.sin(2*math.pi*85*t)*0.25)*math.exp(-t*17)*(1-math.exp(-t*190)))
save('footstep-wet-pavement',step)
save('phone-notification',[(math.sin(2*math.pi*880*(i/RATE))*.22*math.exp(-i/RATE*9) + (math.sin(2*math.pi*1174*(i/RATE-.14))*.17*math.exp(-(i/RATE-.14)*10) if i/RATE>=.14 else 0))*min(1,i/160) for i in range(int(RATE*.7))])
closet=[]; low=0
for i in range(int(RATE*.95)):
    t=i/RATE; low += .12*(rng.uniform(-1,1)-low)
    envelope=math.sin(math.pi*t/.95)**2
    closet.append(envelope*(low*.45+math.sin(2*math.pi*(180*t+22*t*t))*.06))
save('closet-open',closet)
coat=[]; low=0
for i in range(int(RATE*.85)):
    t=i/RATE; noise=rng.uniform(-1,1); low += .2*(noise-low)
    coat.append((noise-low)*.24*(math.exp(-((t-.22)/.12)**2)+.7*math.exp(-((t-.56)/.14)**2)))
save('coat-fabric',coat)
print('Generated six original sound assets in', ROOT)
