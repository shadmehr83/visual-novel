"""Original 48-bar piano score, rendered with the installed TimGM grand-piano samples.
68 BPM, 4/4, A minor/C major: anticipation -> warmth -> suspended resolution.
No random pitches. Two score passes settle the room reverb for a continuous loop.
"""
import ctypes as C, numpy as np, subprocess, wave,json,base64
from pathlib import Path
F=C.CDLL('libfluidsynth.so.3')
def fn(name,args,result):
 f=getattr(F,name);f.argtypes=args;f.restype=result;return f
ptr=C.c_void_p; I=C.c_int
settings=fn('new_fluid_settings',[],ptr)();fn('fluid_settings_setnum',[ptr,C.c_char_p,C.c_double],I)(settings,b'synth.sample-rate',24000.)
fn('fluid_settings_setnum',[ptr,C.c_char_p,C.c_double],I)(settings,b'synth.gain',.45)
synth=fn('new_fluid_synth',[ptr],ptr)(settings)
fn('fluid_synth_sfload',[ptr,C.c_char_p,I],I)(synth,b'/usr/share/sounds/sf2/TimGM6mb.sf2',1)
fn('fluid_synth_program_change',[ptr,I,I],I)(synth,0,0)
on=fn('fluid_synth_noteon',[ptr,I,I,I],I);off=fn('fluid_synth_noteoff',[ptr,I,I],I)
write=fn('fluid_synth_write_float',[ptr,I,ptr,I,I,ptr,I,I],I)
beat=60/68; bar=4*beat; duration=48*bar; rate=24000; size=round(duration*rate)
# Root, warm close-voiced upper harmony. A consistent four-bar phrase makes the melody singable.
chords=[(45,[60,64,67,71]),(41,[57,60,64,67]),(48,[59,62,64,67]),(43,[57,60,62,67]),(45,[59,60,64,67]),(41,[57,60,64,69]),(50,[57,60,64,65]),(43,[55,59,62,64])]
melodies=[[76,74,72,71],[72,69,67],[71,72,76,74],[74,72,71,67],[72,76,79,76],[76,74,72,69],[69,72,74,72],[71,69,67]]
events=[]
def note(t,pitch,velocity,length):
 events.extend([(round(t*rate),1,pitch,velocity),(round((t+length)*rate),0,pitch,0)])
for b in range(48):
 root,voicing=chords[b%8];section=b//8
 note(b*bar+.025,root,43+(b%3),bar*1.04)
 for j,pitch in enumerate(voicing):note(b*bar+.08+j*.035,pitch,39+j*2,bar*.87)
 # sparse answering arpeggio on the off-beat, restrained and repeatable
 if b%2==0:note(b*bar+2.55*beat,voicing[2]+12,35,1.2*beat)
 motif=melodies[b%8]
 if section in [1,3]:motif=[n-12 if section==3 else n+ (0) for n in motif]
 if b==47:motif=[71,69,67] # gentle dominant tail leads naturally back into Am9
 timings=([.65,1.65,2.65,3.35] if len(motif)==4 else [.75,2.,3.])
 for j,(pitch,t) in enumerate(zip(motif,timings)):
  if section==0 and b<2 and j==3:continue
  note(b*bar+t*beat+.008*(j%2),pitch,53+[0,3,-3,-5][j%4]+(3 if section==4 else 0),(.72 if j<len(motif)-1 else 1.15)*beat)
# Render two identical passes; keep the second, including the previous pass's decay.
events2=[]
for shift in [0,size]:events2.extend((t+shift,a,p,v) for t,a,p,v in events if t+shift<2*size)
events2.sort();output=np.zeros((2*size,2),np.float32);cursor=0
for t,a,p,v in events2+[(2*size,0,0,0)]:
 if t>cursor:
  n=t-cursor;l=np.zeros(n,np.float32);r=np.zeros(n,np.float32);write(synth,n,l.ctypes.data,0,1,r.ctypes.data,0,1);output[cursor:t,0]=l;output[cursor:t,1]=r;cursor=t
 if a:on(synth,0,p,v)
 else:off(synth,0,p)
x=output[size:]
# Warm tape-like low pass, subtle saturation. A composed piano bed, not random sound effects.
from scipy.signal import butter,sosfilt
x=sosfilt(butter(2,5200,fs=rate,output='sos'),np.tile(x,(2,1)),axis=0)[size:]
x=np.tanh(x*1.35)
# Quiet, swung lo-fi pulse; intentionally much softer than the piano.
t=np.arange(size)/rate
for b in range(48):
 for beatidx in [0,2]:
  at=round((b*bar+beatidx*beat)*rate);n=min(round(.2*rate),size-at);q=np.arange(n)/rate
  kick=.012*np.sin(2*np.pi*(48*q+4*(1-np.exp(-q*20))))*np.exp(-q*28)
  x[at:at+n]+=kick[:,None]
# Conservative master, no clipping. Blend only the last 8ms into the initial bed to suppress a boundary click.
x*=.72/max(.01,np.max(np.abs(x)));n=192
for j in range(n):x[-n+j]=x[-n+j]*(1-j/n)+x[0]*(j/n)
out=Path('references/audio');out.mkdir(exist_ok=True,parents=True)
with wave.open('/tmp/cafe-score.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes((x*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/tmp/cafe-score.wav','-c:a','libvorbis','-q:a','3','-metadata','title=Between the Rain and Four Oclock','-metadata','artist=Stillframe original score',str(out/'cafe-first-meeting.ogg')],check=True)
p=Path('projects/published.stillframe.json');d=json.loads(p.read_text());data='data:audio/ogg;base64,'+base64.b64encode((out/'cafe-first-meeting.ogg').read_bytes()).decode();d['audioAssets']=[a for a in d['audioAssets'] if a['id']!='cafe-first-meeting-score'];d['audioAssets'].append({'id':'cafe-first-meeting-score','name':'Between the Rain and Four O’clock · café piano · 2:49','data':data});d['scenes'][5]['audio']=[*(t for t in (d['scenes'][5].get('audio') or []) if t['id']!='cafe-first-meeting-score'),{'id':'cafe-first-meeting-score','volume':.36,'loop':True}];d['contentUpdates']=list(dict.fromkeys([*d['contentUpdates'],'2.21.0']));p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print('Original score:',round(duration,3),'seconds;', (out/'cafe-first-meeting.ogg').stat().st_size,'bytes')
