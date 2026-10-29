"""Render four original illustrated cinemagraphs; requires ffmpeg, no paid service.

Generated source paintings stay unmodified in artwork/insta-originals. Motion,
window rain, steam and local lamplight are composited into 24-second MP4s.
"""
import concurrent.futures, hashlib, json, math, random, struct, subprocess, tempfile, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'references/media/insta/v1/rebuilt'
NAMES = ['rain-walk', 'tea-and-pages', 'midnight-monitor', 'last-tram']
SECONDS, FPS, RATE = 24, 20, 22050

def sound(path, theme):
    rng = random.Random(310 + theme)
    low = 0
    samples = bytearray()
    for i in range(RATE * SECONDS):
        t = i / RATE
        low += .07 * (rng.uniform(-1, 1) - low)
        noise = low * [.22, .08, .025, .17][theme]
        if theme == 0: # soft distant footfalls on wet paving
            phase = t % 1.2
            noise += .025 * math.sin(2 * math.pi * 74 * phase) * math.exp(-phase * 20)
        elif theme == 1: # porcelain softly settling, no copyrighted music
            phase = t % 8
            noise += .025 * math.sin(2 * math.pi * 1380 * phase) * math.exp(-phase * 17)
        elif theme == 2:
            noise += .006 * math.sin(2 * math.pi * 90 * t)
            phase = (t + .7) % 5
            noise += .013 * rng.uniform(-1, 1) * math.exp(-phase * 55)
        else:
            noise += .016 * math.sin(2 * math.pi * 51 * t)
            phase = t % 1.5
            noise += .018 * math.sin(2 * math.pi * 115 * phase) * math.exp(-phase * 15)
        fade = min(1, t / .4, (SECONDS - t) / .4)
        samples.extend(struct.pack('<h', int(max(-1, min(1, noise * fade)) * 32767)))
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(samples)

def render(item):
    theme, name = item
    source = ROOT / 'artwork/insta-originals' / (name + '.png')
    # Approximate windows are confined to the painted window, not the foreground.
    masks = ['1', 'gt(X,165)*lt(Y,300)', 'lt(X,145)*lt(Y,280)', 'lt(X,180)*lt(Y,340)']
    lamp = [(277, 98), (59, 87), (303, 156), (249, 37)][theme]
    rain = f"({masks[theme]})*lt(mod(X+Y*.13,33),1.1)*lt(mod(Y+T*73,67),9)*32"
    glow = f"9*(.92+.08*sin(T*2*PI/6))*exp(-pow((X-{lamp[0]})/48,2)-pow((Y-{lamp[1]})/62,2))"
    filters = (
        f"[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,"
        f"zoompan=z='1.035+.008*sin(on/{FPS*SECONDS}*2*PI)':"
        f"x='iw/2-iw/zoom/2+3*sin(on/{FPS*SECONDS}*2*PI)':"
        f"y='ih/2-ih/zoom/2+2*sin(on/{FPS*SECONDS}*4*PI)':d={FPS*SECONDS}:s=360x640:fps={FPS},format=rgba[base];"
        f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=166:g=181:b=201:a='{rain}'[rain];"
        f"[base][rain]overlay=shortest=1[wet];"
        f"nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=255:g=173:b=85:a='{glow}'[glow];"
        f"[wet][glow]overlay=shortest=1[lit]"
    )
    if theme == 1:
        steam = "gt(Y,315)*lt(Y,405)*16*exp(-pow((X-255-6*sin(Y*.06+T*1.1))/6,2))*sin((Y-315)/90*PI)"
        filters += f";nullsrc=s=360x640:r={FPS}:d={SECONDS},format=rgba,geq=r=211:g=204:b=197:a='{steam}'[steam];[lit][steam]overlay=shortest=1[out]"
    else:
        filters += ';[lit]null[out]'
    audio_folder=ROOT / 'references/audio/insta/v1/source'
    audio_folder.mkdir(parents=True,exist_ok=True)
    audio = audio_folder / (name + '.wav')
    sound(audio, theme)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '2', '-i', str(source), '-i', str(audio),
                    '-filter_complex_threads', '1', '-filter_complex', filters, '-map', '[out]', '-map', '1:a',
                    '-t', str(SECONDS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '32', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '32k', '-movflags', '+faststart', str(DEST / (name + '.mp4'))], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(source), '-vf', 'scale=360:640',
                    '-frames:v', '1', '-q:v', '5', str(DEST / (name + '.jpg'))], check=True)
    path = DEST / (name + '.mp4')
    compact = DEST / 'compact'
    compact.mkdir(exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-threads', '2', '-i', str(path), '-vf', 'scale=216:384,fps=15',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '37', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '16k',
                    '-movflags', '+faststart', str(compact / (name + '.mp4'))], check=True)
    print(name, path.stat().st_size, 'bytes', flush=True)
    return dict(id=name, seconds=SECONDS, width=360, height=640, fps=FPS,
                sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                sha256=hashlib.sha256(path.read_bytes()).hexdigest(), bytes=path.stat().st_size)

if __name__ == '__main__':
    DEST.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        result = list(pool.map(render, enumerate(NAMES)))
    (DEST / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
