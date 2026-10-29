"""Index reusable assets, including inactive older media, without deleting anything."""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
folders=['artwork/insta-originals','artwork/insta-animation','references/audio/insta','references/media/insta']
extensions={'.png':'image','.jpg':'image','.svg':'mask','.wav':'audio','.m4a':'audio','.mp4':'video'}
rows=[]
for folder in folders:
 for path in sorted((ROOT/folder).rglob('*')):
  if path.suffix not in extensions or not path.is_file():continue
  row=dict(path=path.relative_to(ROOT).as_posix(),kind=extensions[path.suffix],bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
  if row['kind'] in ['audio','video']:
   info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
   row['seconds']=float(info['format']['duration'])
   for stream in info['streams']:
    if stream['codec_type']=='video':row.update(width=stream['width'],height=stream['height'])
    if stream['codec_type']=='audio':row.update(sampleRate=stream['sample_rate'],channels=stream['channels'])
  rows.append(row)
folder=ROOT/'references/media'
(folder/'catalog.json').write_text(json.dumps(rows,indent=2)+'\n')
text='''# Reusable Insta media archive

All original paintings, previous released clips and original soundtracks are retained.
The active feed uses the version-two animation exports. Nothing in this folder is
required to be uploaded to an external AI service. WAV files can be imported through
Stillframe’s Sound controls or reused in another project. On GitHub, open a file and
choose **Download raw file** to save it.

## What changed

- Street: separately moving windblown leaves, rain streaks and expanding puddle splashes.
- Reading: a page lifts and settles twice, visible steam curls, and rain moves outside.
- Desk: the monitor plays an independent moving display while rain stays at the window.
- Tram: a separately painted city passes behind a fixed window/plant mask.
- Sound: new wet footsteps, paper movement, ceramic clinks, keyboard keys, a tram bell
  and wheel joints; the reading clip includes an original 24-second piano composition.

The sound effects and piano are original synthesised designs. Standalone WAV stems,
short effects, music and full mixes are saved separately. The older exact AAC tracks
and deterministic pre-encoding WAV ambience are also saved for reuse.

The original paintings remain untouched in `artwork/insta-originals`. Three newly
generated illustration assets and the tram mask are in `artwork/insta-animation`.
Earlier clips and their compact copies live in `references/media/insta/v1`.
Version two lives in `references/media/insta/v2`; matching web exports live under
`public/media/insta`. `experiments` retains technical previews and rejected projection
trials; those are not used in the game. The catalog records every asset’s SHA-256.

## Generate or update the media

1. `python scripts/insta_audio.py` creates the reusable effects, music, ambience stems
   and full mixes under `references/audio/insta/v2`.
2. `python scripts/animate-insta-videos.py` renders version-two footage into its archive.
3. `python scripts/publish-insta-media.py` checks, remuxes with the saved source mixes,
   copies the active clips to the web folder, and refreshes the manifests.
4. `python scripts/catalog-insta-media.py` refreshes this index.

The earlier `scripts/make-insta-videos.py` now rebuilds only into `v1/rebuilt`, and
retains its WAV sources. It does not overwrite the active feed or the initial v1 files.
A byte-for-byte copy of its original code is retained in the v1 archive for reference.

'''
groups=[('Original paintings',lambda r:r['path'].startswith('artwork/insta-originals')),
 ('New illustration assets and window mask',lambda r:r['path'].startswith('artwork/insta-animation')),
 ('Original piano composition',lambda r:'tea-window-original-piano' in r['path']),
 ('New reusable sounds and mixes',lambda r:'/audio/insta/v2/' in r['path'] and 'tea-window-original-piano' not in r['path']),
 ('Earlier sounds kept for reuse',lambda r:'/audio/insta/v1/' in r['path']),
 ('Current animated clips and previews',lambda r:'/media/insta/v2/' in r['path']),
 ('Earlier released clips',lambda r:'/media/insta/v1/' in r['path']),
 ('Technical experiments (inactive)',lambda r:'/experiments/' in r['path'])]
for title,predicate in groups:
 text+='## '+title+'\n\n'
 for r in filter(predicate,rows):
  label=Path(r['path']).name;detail=(f" · {r['seconds']:.2f}s" if 'seconds'in r else '')
  text+=f"- [{label}](../../{r['path']}){detail} · {r['bytes']/1024:.0f} KiB\n"
 text+='\n'
(folder/'README.md').write_text(text.rstrip()+'\n')
print('Indexed',len(rows),'preserved image, audio, mask and video assets.')
