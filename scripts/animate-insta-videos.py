"""Visible independent 2D animation over the original paintings; ffmpeg required.

Source pictures, masks, sounds and the earlier release are retained in GitHub.
This renderer never edits or deletes an original painting or sound.
"""
import argparse, concurrent.futures, hashlib, json, subprocess, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'references/media/insta/v2'
OUT.mkdir(parents=True,exist_ok=True)
(OUT/'compact').mkdir(exist_ok=True)
ART=ROOT/'artwork/insta-animation'
AUDIO=ROOT/'references/audio/insta/v2'
NAMES=['rain-walk','tea-and-pages','midnight-monitor','last-tram']
FPS=24
SECONDS=24
MASK='''<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"><rect width="360" height="640" fill="black"/><path d="M31 0 L109 0 L187 143 L195 326 L43 372 L29 334 Z" fill="white"/><path d="M0 72 L48 70 L91 113 L112 156 L104 201 L120 243 L106 295 L121 347 L43 375 L0 335 Z" fill="black"/><path d="M20 217 L198 244" stroke="black" stroke-width="10"/></svg>'''
(ART/'tram-window-mask.svg').write_text(MASK)

def render(name):
    index=NAMES.index(name);source=ROOT/'artwork/insta-originals'/(name+'.png')
    args=['ffmpeg','-y','-loglevel','error','-threads','2','-loop','1','-framerate',str(FPS),'-i',str(source),'-i',str(AUDIO/(name+'-soundtrack.wav'))]
    asset={'rain-walk':'wind-leaf.png','tea-and-pages':'loose-page.png','midnight-monitor':'passing-city.png','last-tram':'passing-city.png'}[name]
    args+=['-loop','1','-framerate',str(FPS),'-i',str(ART/asset)]
    if index==3:args+=['-loop','1','-framerate',str(FPS),'-i',str(ART/'tram-window-mask.svg')]
    filters=['[0:v]scale=360:640,format=rgba[base]'];current='base'
    if index==3:
        filters+=['[2:v]scale=-2:360,crop=360:360:x=\'(iw-360)*t/24\':y=0,pad=360:640:0:0,format=rgb24[city]',
                  '[3:v]format=gray,gblur=sigma=1[mask]', '[city][mask]alphamerge[passing]', '[base][passing]overlay=shortest=1[ride]'];current='ride'
    if index==2:
        # A moving illustrated landscape and a comet are confined to the monitor glass.
        screen="16+145*exp(-pow((X-180-130*sin(T*.8))/24,2)-pow((Y-250-75*sin(T*.6))/40,2))"
        filters += [f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r='67+22*sin(X*.03+T*.7)':g='54+10*sin(Y*.07+T)':b='95+35*sin(X*.02-T*.7)':a=255[screenbg]",
                    f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=223:g=192:b=228:a='{screen}'[comet]",
                    '[screenbg][comet]overlay=shortest=1[screenart]',
                    "[screenart]format=yuva444p,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='255*gt(X,2)*lt(X,W-3)*gt(Y,2)*lt(Y,H-3)',split=2[screenrgb][screenalpha]",
                    "[screenrgb]perspective=sense=destination:x0=199:y0=193:x1=287:y1=183:x2=192:y2=265:x3=284:y3=267[monitorrgb]",
                    "[screenalpha]alphaextract,perspective=sense=destination:x0=199:y0=193:x1=287:y1=183:x2=192:y2=265:x3=284:y3=267[monitormask]",
                    '[monitorrgb][monitormask]alphamerge[monitor]',
                    '[base][monitor]overlay=shortest=1[desk]'];current='desk' 
    # Rain falls in different streak lengths and speeds; interior masks stop at glass.
    masks=['1','gt(X,168)*lt(Y,310)','lt(X,144)*lt(Y,218)','gt(X,115)*lt(X,185)*lt(Y,320)']
    drops=f"({masks[index]})*(lt(mod(X+Y*.16,29),1.2)*lt(mod(Y+T*145,83),19)*91+lt(mod(X+Y*.11+17,51),1)*lt(mod(Y+T*98,107),12)*48)"
    filters += [f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=170:g=186:b=206:a='{drops}'[rain]",
                f'[{current}][rain]overlay=shortest=1[wet]'];current='wet'
    lx,ly=[(277,98),(59,87),(303,156),(249,37)][index]
    glow=f"18*(.9+.1*sin(T*2*PI/5.8))*exp(-pow((X-{lx})/48,2)-pow((Y-{ly})/62,2))"
    filters += [f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=255:g=173:b=85:a='{glow}'[glow]",f'[{current}][glow]overlay=shortest=1[lit]'];current='lit'
    if index==0:
        rings=[]
        for k,(x,y) in enumerate([(70,505),(165,548),(91,595),(210,470)]):
            age=f'mod(T+{k*.37},1.7)';radius=f'sqrt(pow((X-{x})/1.9,2)+pow(Y-{y},2))'
            rings.append(f'lt({age},1.05)*lt(abs({radius}-{age}*13),.9)*(1-{age}/1.1)*85')
        filters += [f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=190:g=166:b=130:a='{'+'.join(rings)}'[ripples]",'[lit][ripples]overlay=shortest=1[puddles]',
                    "[2:v]scale=18:24,format=rgba,rotate='t*1.8':ow=44:oh=44:c=none,split=4[leaf0][leaf1][leaf2][leaf3]"]
        current='puddles'
        for k in range(4):
            target='wind'+str(k)
            filters.append(f"[{current}][leaf{k}]overlay=x='mod(t*{27+k*6}+{k*113},450)-45':y='mod(t*{39+k*3}+{130+k*173},720)-50+13*sin(t*2+{k})':shortest=1[{target}]");current=target
    if index==1:
        steam=[]
        for k in range(3):
            steam.append(f"gt(Y,326)*lt(Y,406)*{55-k*9}*exp(-pow((X-{266+k*9}-8*sin(Y*.09+T*1.9+{k}))/4,2))*sin((Y-326)/80*PI)")
        filters += [f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=226:g=218:b=207:a='{'+'.join(steam)}'[steam]",'[lit][steam]overlay=shortest=1[hot]',
                    "[2:v]crop=820:1280:100:125,scale=360:640,format=yuva444p,geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='alpha(X,Y)*gt(X,2)*lt(X,W-3)*gt(Y,2)*lt(Y,H-3)*.76*min(1,max(0,(mod(T,11)-5)*6))*min(1,max(0,(8.5-mod(T,11))*6))'[paper]"]
        theta='.9*sin(PI*clip((mod(on/24,11)-5)/3.5,0,1))'
        projection=f"perspective=sense=destination:x0=120:y0=466:x1='120+200*cos({theta})':y1='466+43*cos({theta})-55*sin({theta})':x2=80:y2=546:x3='80+98*cos({theta})':y3='546+59*cos({theta})-55*sin({theta})':eval=frame"
        filters += ['[paper]split=2[papertexture][paperalpha]',f'[papertexture]{projection}[pagetexture]',f'[paperalpha]alphaextract,{projection}[pagemask]',
                    '[pagetexture][pagemask]alphamerge[page]', '[hot][page]overlay=shortest=1[reading]'];current='reading' 
    # Small camera movement follows the independent foreground action, not vice versa.
    bob=2 if index in [0,3] else .5
    filters.append(f"[{current}]scale=366:650,crop=360:640:x='3+sin(t*1.1)':y='5+{bob}*sin(t*{5.2 if index==0 else 3.3})',format=yuv420p[out]")
    # Procedural weather masks render at half resolution; the painted sources,
    # foreground sprites and final 360×640 video retain their full dimensions.
    for i,f in enumerate(filters):
        if f.startswith('nullsrc='):
            f=f.replace('s=360x640','s=180x320')
            f=re.sub(r'\bX\b','(X*2)',f);f=re.sub(r'\bY\b','(Y*2)',f)
            at=f.rfind('[');filters[i]=f[:at]+',scale=360:640'+f[at:]
    args+=['-progress' ,str(Path('/tmp')/('insta-'+name+'.progress')),'-stats_period','10','-filter_complex_threads','1','-filter_complex',';'.join(filters),'-map','[out]','-map','1:a','-t',str(SECONDS),
           '-c:v','libx264','-preset','slow','-crf','29','-pix_fmt','yuv420p','-c:a','aac','-b:a','64k','-af','loudnorm=I=-20:TP=-2:LRA=7','-ar','48000',
           '-movflags','+faststart',str(OUT/(name+'.mp4'))]
    subprocess.run(args,check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-threads','2','-i',str(OUT/(name+'.mp4')),'-vf','scale=216:384,fps=15',
                    '-c:v','libx264','-preset','slow','-crf','38','-pix_fmt','yuv420p','-c:a','aac','-b:a','16k','-ar','24000','-movflags','+faststart',str(OUT/'compact'/(name+'.mp4'))],check=True)
    path=OUT/(name+'.mp4')
    print(name,path.stat().st_size,'bytes; compact', (OUT/'compact'/(name+'.mp4')).stat().st_size,flush=True)
    return dict(id=name,seconds=SECONDS,width=360,height=640,fps=FPS,revision=2,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),bytes=path.stat().st_size)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--only',choices=NAMES);args=parser.parse_args()
    names=[args.only] if args.only else NAMES
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:result=list(pool.map(render,names))
    if not args.only:(OUT/'manifest.json').write_text(json.dumps(result,indent=2)+'\n')
