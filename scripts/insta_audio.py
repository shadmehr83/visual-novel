"""Original reusable sound designs and a 24-second composition. No borrowed audio."""
import math, random, struct, wave
from array import array
from pathlib import Path
RATE=24000
SECONDS=24
COUNT=RATE*SECONDS
ROOT=Path(__file__).resolve().parents[1]/'references/audio/insta/v2'
ROOT.mkdir(parents=True,exist_ok=True)

def write(name,left,right=None):
    right=left if right is None else right
    with wave.open(str(ROOT/(name+'.wav')),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE)
        data=bytearray()
        for l,r in zip(left,right):data.extend(struct.pack('<hh',int(max(-.98,min(.98,l))*32767),int(max(-.98,min(.98,r))*32767)))
        f.writeframes(data)
    return ROOT/(name+'.wav')

def transient(name,kind,duration,seed=0):
    rng=random.Random(seed);out=array('f');low=0
    for i in range(int(RATE*duration)):
        t=i/RATE;n=rng.uniform(-1,1);low+=.18*(n-low)
        if kind=='step':value=(low*.8+.28*math.sin(2*math.pi*68*t))*math.exp(-t*11)*(1-math.exp(-t*180))
        elif kind=='page':value=(n-low)*.12*(math.sin(math.pi*t/duration)**2)*(.7+.3*math.sin(2*math.pi*19*t))
        elif kind=='key':value=(low*.45+math.sin(2*math.pi*430*t)*.18)*math.exp(-t*100)
        elif kind=='cup':value=(.25*math.sin(2*math.pi*1360*t)*math.exp(-t*5)+.13*math.sin(2*math.pi*2185*t)*math.exp(-t*8))*(1-math.exp(-t*900))
        elif kind=='bell':value=(.24*math.sin(2*math.pi*784*t)+.11*math.sin(2*math.pi*1176*t)+.05*math.sin(2*math.pi*1631*t))*math.exp(-t*2.4)*(1-math.exp(-t*90))
        else:value=low*.5*math.exp(-t*22)
        out.append(value)
    write(name,out);return out

def add(left,right,sample,time,gain=1,pan=0):
    start=int(time*RATE)
    for i,v in enumerate(sample):
        j=start+i
        if 0<=j<len(left):left[j]+=v*gain*(1-.45*pan);right[j]+=v*gain*(1+.45*pan)

def music():
    track=array('f',[0])*COUNT
    # Eight 3-second bars: Am(add9), Fmaj7, Cmaj7, Gsus; a sparse original melody.
    chords=[(45,52,59,60),(41,48,52,57),(48,55,59,64),(43,50,57,62)]*2
    melody=[69,71,72,76,74,72,71,67,69,72,76,79,76,74,72,71]
    notes=[]
    for bar,chord in enumerate(chords):
        for k,note in enumerate(chord):notes.append((bar*3+k*.3,note,2.5,.032))
    for i,note in enumerate(melody):notes.append((i*1.5+.6,note,2.2,.045))
    for at,midi,duration,gain in notes:
        freq=440*2**((midi-69)/12);start=int(at*RATE)
        for i in range(int(duration*RATE)):
            j=start+i
            if j>=COUNT:break
            t=i/RATE;attack=1-math.exp(-t*110);release=min(1,(duration-t)/.25)
            tone=sum(weight*math.sin(2*math.pi*freq*partial*t)*math.exp(-t*(1.1+partial*.38)) for partial,weight in [(1,1),(2,.34),(3.002,.13),(4.01,.04)])
            track[j]+=tone*gain*attack*release
    wet=array('f',track)
    for delay,gain in [(.173,.22),(.287,.15),(.431,.09)]:
        offset=int(delay*RATE)
        for i in range(offset,COUNT):wet[i]+=track[i-offset]*gain
    for i in range(COUNT):wet[i]*=min(1,i/RATE/.5,(SECONDS-i/RATE)/1.2)
    write('tea-window-original-piano',wet);return wet

def render():
    sounds={
        'step':transient('wet-footstep','step',.38,4),
        'page':transient('paper-page-turn','page',1.15,6),
        'key':transient('keyboard-key','key',.09,7),
        'cup':transient('ceramic-cup-clink','cup',1.2,9),
        'bell':transient('tram-warning-bell','bell',2.1,11),
        'rail':transient('rail-joint','rail',.22,12),
    }
    score=music()
    for theme,name in enumerate(['rain-walk','tea-and-pages','midnight-monitor','last-tram']):
        rng=random.Random(1200+theme);left=array('f',[0])*COUNT;right=array('f',[0])*COUNT;low=0;deep=0
        for i in range(COUNT):
            t=i/RATE;n=rng.uniform(-1,1);low+=.045*(n-low);deep+=.004*(n-deep)
            rain=(low*.22+(n-low)*.015)*(.75+.25*math.sin(t*.9)**2)
            if theme==0:value=rain+deep*.22*(.6+.4*math.sin(t*.42))
            elif theme==1:value=rain*.24
            elif theme==2:value=rain*.16+.008*math.sin(2*math.pi*90*t)+deep*.08
            else:value=deep*.85+low*.1+.018*math.sin(2*math.pi*48*t)*(1+.2*math.sin(t*2))
            fade=min(1,t/.3,(SECONDS-t)/.45);left[i]=value*fade;right[i]=value*fade*(.88+.12*math.sin(t*.4))
        write(name+'-ambience-stem',left,right)
        if theme==0:
            for i in range(32):add(left,right,sounds['step'],i*.64+1,.42,(-1 if i%2 else 1)*.45)
        elif theme==1:
            for at in [2.3,13.6]:add(left,right,sounds['cup'],at,.55,.25)
            for at in [5.4,16.4]:add(left,right,sounds['page'],at,.7,-.35)
            add(left,right,score,0,.9,0)
        elif theme==2:
            for i in range(70):
                at=i*.27+1
                if int(at)%6<3:add(left,right,sounds['key'],at,.3,rng.uniform(-.5,.5))
        else:
            for i in range(18):
                add(left,right,sounds['rail'],i*1.3+.35,.65,-.35);add(left,right,sounds['rail'],i*1.3+.54,.45,.35)
            add(left,right,sounds['bell'],1.2,.65,-.2)
        write(name+'-soundtrack',left,right)
    print('Saved new ambience stems, six reusable effects, original piano composition and four full soundtracks to',ROOT,flush=True)
if __name__=='__main__':render()
