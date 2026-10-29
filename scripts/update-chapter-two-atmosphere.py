"""Publish morning continuity and authored outdoor ambience without changing café art."""
from pathlib import Path
import json,base64,copy,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'projects/published.stillframe.json';p=json.loads(path.read_text())
def embed_sound(id,name,file):
 raw=(ROOT/'references/audio'/file).read_bytes();asset={'id':id,'name':name,'data':'data:audio/ogg;base64,'+base64.b64encode(raw).decode()}
 p.setdefault('audioAssets',[])[:]=[a for a in p.get('audioAssets',[]) if a['id']!=id]+[asset]
embed_sound('studio-rain-puddle-impacts','Rain · close water splashes and puddle impacts','rain-puddle-impacts.ogg')
embed_sound('studio-walking-wet-detailed','Walking · wet heel, toe and scuff','walking-wet-heel-to-toe.ogg')
raw=(ROOT/'artwork/background-scenes/first-match-morning.webp').read_bytes()
a={'id':'first-match-morning','name':'The First Match · next morning bedroom.webp','folder':'Background scenes','mime':'image/webp','width':1672,'height':941,'data':'data:image/webp;base64,'+base64.b64encode(raw).decode(),'tags':'morning, chapter two, bedroom','notes':'Original generated morning variant of the chapter-one bedroom. Lamps off, overcast daylight.','approved':False,'reference':False}
p['assets'][:]=[x for x in p['assets'] if x['id']!=a['id']]+[a]
for s in p['scenes']:
 if s['id'].startswith('chapter2-'):
  s['background']=a['id'];s['effects']['light']=0;s['effects']['lights']=[];s['effects']['tintOpacity']=0;s['effects']['brightness']=1
  s['effects']['rain']=True;s['effects']['density']=18;s['effects']['opacity']=.075
  s['effects']['rainZones']=[{'id':'morning-window','name':'Morning window panes','enabled':True,'points':[{'x':203,'y':0},{'x':443,'y':0},{'x':440,'y':288},{'x':203,'y':288}]}];s['effects']['mask']=[]
  for n in s['nodes']:
   n['deviceScreen']='chat' if n['id'] in ['message','reply-0','reply-1'] else 'off'
 if s['id'] in ['journey','departure']:
  if not any(t['id']=='studio-rain-outside' for t in s.get('audio',[])):s.setdefault('audio',[]).append({'id':'studio-rain-outside','volume':.22,'loop':True})
  if not any(t['id']=='studio-rain-puddle-impacts' for t in s.get('audio',[])):s.setdefault('audio',[]).append({'id':'studio-rain-puddle-impacts','volume':.32,'loop':True})
  if s.get('camera'):s['camera']['footstepAsset']='studio-walking-wet-detailed'
  # Match actual reflective ground, keeping walls, sky and dry slabs still.
  polygons=([[40,450],[200,402],[360,420],[520,540],[390,563],[100,563]],[[580,450],[820,420],[980,485],[1000,563],[660,563]]) if s['id']=='journey' else ([[22,185],[145,120],[325,184],[560,425],[450,563],[10,563]],[[600,245],[870,230],[1000,340],[1000,563],[790,545],[640,420]])
  for i,poly in enumerate(polygons):
   id=s['id']+'-puddle-'+str(i)
   zone={'id':id,'name':'Rain impacts · reflective puddle '+str(i+1),'enabled':True,'mode':'puddle','strength':14,'seconds':1.5,'direction':0,'distortion':0,'region':{'id':id,'name':'Reflective wet ground','enabled':True,'points':[{'x':x,'y':y} for x,y in poly]}}
   s.setdefault('effects',{}).setdefault('motionZones',[])[:]=[z for z in s['effects']['motionZones'] if z['id']!=id]+[zone]
  if s['id']=='departure':
   # This background is the wet pavement close-up: illuminate the warm reflection,
   # not an invented lamp somewhere off screen.
   s['effects']['lights']=[{'id':'reflected-door-light','name':'Warm doorway reflection on wet ground','enabled':True,'kind':'local','intensity':.07,'color':'#f4b66e','x':240,'y':235,'radius':185,'spread':.005,'cycle':{'enabled':True,'values':[.99,1,1.01,1],'stepSeconds':3}}]
   for n in s['nodes']:n['deviceScreen']='chat' if n['id']=='after-message' else 'off'
   next(n for n in s['nodes'] if n['id']=='leaving-cafe')['text']='The café door settles shut behind us. Rain stipples the pavement, breaking the warm light into little rings. We linger beneath the awning before going our separate ways.'
   next(n for n in s['nodes'] if n['id']=='again')['text']='Before we part, there is still a little time to say what I mean.'
# Existing chapter boundary is correct: departure dialogue 15 ends chapter one.
for c in p['chapters']:
 if c['id']=='chapter-one':c['scenes']=[s['id'] for s in p['scenes'] if not s['id'].startswith('chapter2-')];c['next']='chapter-two'
 if c['id']=='chapter-two':c['scenes']=[s['id'] for s in p['scenes'] if s['id'].startswith('chapter2-')]
if '2.14.0' not in p.setdefault('contentUpdates',[]):p['contentUpdates'].append('2.14.0')
path.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
original=ROOT/'artwork/generated-originals/exec-f4a16e4b-06b7-42b6-b36a-bbebc0743624.png'
manifest=ROOT/'artwork/generated-originals/manifest.json';rows=json.loads(manifest.read_text());rows[:]=[r for r in rows if r['file']!=original.name]+[{'file':original.name,'bytes':original.stat().st_size,'sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'publishedName':a['name']}];manifest.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('Updated chapter-two mornings, outdoor splashes, walking and puddle masks.')
