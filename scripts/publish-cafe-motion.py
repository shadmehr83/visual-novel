from pathlib import Path
import json,base64,copy
ROOT=Path(__file__).resolve().parents[1];path=ROOT/'projects/published.stillframe.json';p=json.loads(path.read_text())
def asset(id,name,file,mime,w,h):
 a={'id':id,'name':name,'mime':mime,'width':w,'height':h,'folder':'Background scenes','data':'data:'+mime+';base64,'+base64.b64encode((ROOT/file).read_bytes()).decode(),'tags':'matched background, animation','notes':'Fixed reference composition; local animation patches only.','approved':False,'reference':False};p['assets'][:]=[x for x in p['assets'] if x['id']!=id]+[a];return id
idle=asset('cafe-idle-gif','Café · blink and candle loop.gif','artwork/cafe-animation/cafe-idle.gif','image/gif',768,512)
cake=asset('cafe-cake-gif','Café · cake arrives, blink and candle.gif','artwork/cafe-animation/cafe-cake.gif','image/gif',768,512)
still=asset('cafe-cake-still','Café · cake on the table.webp','artwork/cafe-animation/cake-still.webp','image/webp',960,640)
street=asset('departure-forward-street','After café · street toward the fairground.webp','artwork/background-scenes/first-match-departure-wide.webp','image/webp',1672,941)
next(a for a in p['assets'] if a['id']==idle)['poster']='2021e333-3387-4b6e-ad86-281b140a8cca'
next(a for a in p['assets'] if a['id']==cake)['poster']=still
s=next(s for s in p['scenes'] if s['id']=='cafe');s['background']=idle
fx=s['effects'];fx['light']=.08;fx['lightLoop']={'enabled':True,'values':[.985,1,1.012,1,.99],'stepSeconds':2.5}
for l in fx.get('lights',[]):l['intensity']=min(l['intensity'],.12);l['cycle']={'enabled':True,'values':[.99,1,1.01,1],'stepSeconds':2.5}
fx.setdefault('lights',[]).append({'id':'candle-table-glow','name':'Candle · soft tabletop glow','enabled':True,'kind':'local','intensity':.045,'color':'#ffd49a','x':620,'y':430,'radius':125,'spread':.015,'cycle':{'enabled':True,'values':[.98,1,1.025,1,.985],'stepSeconds':1.4}}) if not any(l['id']=='candle-table-glow' for l in fx.get('lights',[])) else None
if not any(z['id']=='distant-patrons' for z in fx.get('motionZones',[])):
 fx.setdefault('motionZones',[]).append({'id':'distant-patrons','name':'Distant patrons · restrained motion','enabled':True,'strength':.15,'seconds':6,'direction':0,'distortion':.1,'region':{'id':'distant-patrons','name':'Blurred background figures','enabled':True,'points':[{'x':920,'y':265},{'x':988,'y':260},{'x':990,'y':370},{'x':925,'y':365}]}})
# Matched still / loop views are available visually; cake loop is dialogue-cued.
s['subscenes']=[{'id':'cafe-original-still','title':'Original still · matched framing','background':'2021e333-3387-4b6e-ad86-281b140a8cca','transition':{'style':'smooth','seconds':.45}}, {'id':'cake-arrives','title':'Cake arrives · animated table','background':cake,'transition':{'style':'smooth','seconds':.5},'effects':copy.deepcopy(fx)}, {'id':'cake-still','title':'Cake on table · still reference','background':still,'transition':{'style':'smooth','seconds':.45},'effects':copy.deepcopy(fx)}]
# Keep all existing authored routes and node IDs; cue on cake criticism and retain
# the plate for the following dialogues rather than randomly flashing views.
start=next(i for i,n in enumerate(s['nodes']) if n['id']=='beat-10')
for n in s['nodes'][start:]:n['view']='cake-arrives'
s['transition']={'style':'smooth','seconds':.5}
d=next(s for s in p['scenes'] if s['id']=='departure');d['background']=street
for i,z in enumerate(d['effects'].get('motionZones',[])):
 if z.get('mode')=='puddle':z['region']['points']=[{'x':x,'y':y} for x,y in ([[120,460],[360,410],[500,440],[550,563],[100,563]] if i==0 else [[620,440],[840,410],[980,480],[1000,563],[680,563]])]
for l in d['effects'].get('lights',[]):l['x']=120;l['y']=200;l['radius']=115;l['name']='Warm café windows behind the walk'
if '2.15.0' not in p.setdefault('contentUpdates',[]):p['contentUpdates'].append('2.15.0')
path.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n');print('Published café matched loops, cake cue and forward street.')
