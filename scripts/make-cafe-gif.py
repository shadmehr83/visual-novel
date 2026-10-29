"""Matched fixed-frame compositing, not whole-frame AI interpolation."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'artwork/background-scenes/2021e333-3387-4b6e-ad86-281b140a8cca.png'
OUT=ROOT/'artwork/cafe-animation'; W=960;H=640
# Work at a common canvas; extract only eye openings and the tabletop plate region.
def run(args):subprocess.run(['ffmpeg','-y','-loglevel','error','-filter_complex_threads','1',*args],check=True)
run(['-i',str(BASE),'-i',str(OUT/'cake-source.png'),'-filter_complex',"[0:v]scale=960:640[b];[1:v]scale=960:640,crop=245:108:711:450[p];[b][p]overlay=711:450",'-frames:v','1',str(OUT/'cake-matched.png')])
for cake in [False,True]:
 name='cafe-cake' if cake else 'cafe-idle'
 base=OUT/'cake-matched.png' if cake else BASE
 # Eye coordinates in the 960x640 canvas; soft elliptical masks avoid rectangular seams.
 eyes="(exp(-pow((X-637)/17,4)-pow((Y-274)/9,4))+exp(-pow((X-674)/18,4)-pow((Y-245)/10,4)))"
 blink="exp(-pow((T-3.15)/.13,2))"
 filters=["[0:v]scale=960:640,format=rgba[b]",f"[1:v]scale=960:640,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,{eyes})*{blink}'[eyes]",'[b][eyes]overlay=shortest=1[blink]',
 "[blink]split[room][flamesrc]", "[flamesrc]crop=12:23:587:451[flame]",
 "[room][flame]overlay=x='587+.45*sin(t*2*PI*2/5)':y='451+.6*sin(t*2*PI*3/5)':shortest=1[moving]",
 "[moving]trim=duration=5,scale=768:512,split[p][q]", "[p]palettegen=max_colors=256:stats_mode=diff[pal]", "[q][pal]paletteuse=dither=none:diff_mode=rectangle"]
 run(['-loop','1','-framerate','12','-i',str(base),'-loop','1','-framerate','12','-i',str(OUT/'closed-eyes-source.png'),'-filter_complex',';'.join(filters),'-t','5','-loop','0','-gifflags','+transdiff',str(OUT/(name+'.gif'))])
run(['-i',str(OUT/'cake-matched.png'),'-c:v','libwebp','-quality','72',str(OUT/'cake-still.webp')])
print('Built aligned cafe GIFs and cake still.')
