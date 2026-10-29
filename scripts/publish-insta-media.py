"""Publish the archived animations; keep all original paintings and source sound."""
from pathlib import Path
import hashlib,json,shutil,subprocess
ROOT=Path(__file__).resolve().parents[1]
ARCHIVE=ROOT/'references/media/insta/v2';WEB=ROOT/'public/media/insta'
names=['rain-walk','tea-and-pages','midnight-monitor','last-tram'];manifest=[]
for name in names:
 path=ARCHIVE/(name+'.mp4');sound=ROOT/'references/audio/insta/v2'/(name+'-soundtrack.wav')
 # Use the lossless source mix, avoiding a second lossy audio encode.
 temp=ARCHIVE/(name+'-mux.mp4')
 subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(path),'-i',str(sound),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','64k','-af','loudnorm=I=-20:TP=-2:LRA=7','-ar','48000','-t','24','-movflags','+faststart',str(temp)],check=True)
 temp.replace(path)
 compact=ARCHIVE/'compact'/(name+'.mp4')
 subprocess.run(['ffmpeg','-y','-loglevel','error','-threads','2','-i',str(path),'-vf','scale=216:384,fps=15','-c:v','libx264','-preset','slow','-crf','38','-pix_fmt','yuv420p','-c:a','aac','-b:a','16k','-ar','24000','-movflags','+faststart',str(compact)],check=True)
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
 video=next(s for s in info['streams'] if s['codec_type']=='video');audio=next(s for s in info['streams'] if s['codec_type']=='audio')
 assert 23.9<float(info['format']['duration'])<24.1
 assert (video['width'],video['height'])==(360,640)
 subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(path),'-f','null','-'],check=True)
 shutil.copyfile(path,WEB/path.name);shutil.copyfile(compact,WEB/'compact'/compact.name)
 poster=ARCHIVE/'previews'/(name+'-action.jpg');poster.parent.mkdir(exist_ok=True)
 subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','6.8','-i',str(path),'-frames:v','1',str(poster)],check=True)
 manifest.append(dict(id=name,revision=2,seconds=24,width=360,height=640,fps=24,bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sourceSha256=hashlib.sha256((ROOT/'artwork/insta-originals'/(name+'.png')).read_bytes()).hexdigest(),audioSource=sound.relative_to(ROOT).as_posix(),audioSampleRate=audio['sample_rate']))
 print('Published',name,flush=True)
for directory in [ARCHIVE,WEB]:(directory/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
