"""Original deterministic rain impact and heel-to-toe footstep sound designs."""
import math, random, struct, wave, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'references/audio'
RATE=24000
rng=random.Random(8701)
def save(name,data):
 p=ROOT/(name+'.wav')
 with wave.open(str(p),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE)
  w.writeframes(b''.join(struct.pack('<h',round(max(-.98,min(.98,x))*30000)) for x in data))
 subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(p),'-c:a','libvorbis','-q:a','4',str(ROOT/(name+'.ogg'))],check=True)
# Circular scheduling keeps the rain texture seamless; no artificial beat.
size=RATE*12
rain=[0.0]*size
for _ in range(210):
 at=rng.randrange(size);amp=rng.uniform(.035,.16);freq=rng.uniform(650,2300);length=round(RATE*rng.uniform(.045,.14))
 for j in range(length):
  t=j/RATE;attack=min(1,t/.002)
  rain[(at+j)%size]+=amp*attack*math.exp(-t*45)*(math.sin(2*math.pi*(freq*t-1200*t*t))*.65+rng.uniform(-1,1)*.35)
for _ in range(34):
 at=rng.randrange(size)
 for j in range(round(RATE*.23)):
  t=j/RATE
  rain[(at+j)%size]+=.10*(1-math.exp(-t*350))*math.exp(-t*20)*(rng.uniform(-1,1)*.65+math.sin(2*math.pi*260*t)*.25)
save('rain-puddle-impacts',rain)
# A grounded low heel, softer toe compression and a short wet gritty release.
step=[];low=0
for i in range(round(RATE*.58)):
 t=i/RATE;noise=rng.uniform(-1,1);low+=.14*(noise-low)
 heel=(1-math.exp(-t*450))*math.exp(-t*24)
 toe=max(0,t-.075);toeenv=(1-math.exp(-toe*140))*math.exp(-toe*20)
 release=math.exp(-((t-.22)/.085)**2)
 step.append(.30*heel*math.sin(2*math.pi*72*t)+.50*heel*low+.24*toeenv*low+.07*release*(noise-low))
save('walking-wet-heel-to-toe',step)
print('Generated rain-puddle-impacts and walking-wet-heel-to-toe WAV/OGG.')
