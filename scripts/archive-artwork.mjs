// Export committed image bytes as ordinary, browsable files. No image conversion.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const p=JSON.parse(await readFile('projects/published.stillframe.json','utf8'));
const folders={'Background scenes':'background-scenes','Outfits & items':'outfits-and-items','Profiles & app icons':'profiles-and-app-icons'};
const manifest=[];
for(const asset of p.assets){
 const match=asset.data.match(/^data:image\/(png|jpeg|webp);base64,(.*)$/s);
 if(!match)throw Error('Unsupported image data: '+asset.id);
 const folder=folders[asset.folder]||'other-artwork';
 const id=asset.id.replace(/[^a-zA-Z0-9_-]/g,'-');
 const file=`artwork/${folder}/${id}.${match[1]==='jpeg'?'jpg':match[1]}`;
 const bytes=Buffer.from(match[2],'base64');
 await mkdir(`artwork/${folder}`,{recursive:true});await writeFile(file,bytes);
 manifest.push({id:asset.id,name:asset.name,folder:asset.folder,path:file,width:asset.width,height:asset.height,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile('artwork/manifest.json',JSON.stringify(manifest,null,2)+'\n');
let readme='# Stillframe artwork library\n\nThese are ordinary image files extracted byte-for-byte from the published project. Open any folder and click an image to view or download it from any computer. The studio embeds these same images in project exports. `manifest.json` records image IDs, folders, dimensions, file sizes and SHA-256 checksums.\n\n';
for(const [label,folder]of Object.entries(folders)){
 const images=manifest.filter(a=>a.folder===label);
 readme+=`## ${label} (${images.length})\n\n`;
 for(const a of images)readme+=`- [${a.name}](${a.path.replace('artwork/','')})\n`;
 readme+='\n';
}
readme+='## Generated originals and earlier artwork\n\n[Generated originals](generated-originals/) contains every original image-generation output available from this project, including earlier alternatives and the full-resolution PNG originals for images distributed as WebP in the engine. `generated-originals/manifest.json` records their checksums. They are archived without changing image bytes. Earlier user-supplied reference images remain under [`references/incoming`](../references/incoming/). Unused originals are archived in GitHub without increasing the engine download.\n\nTo refresh the current-art export after updating the committed project, run `node scripts/archive-artwork.mjs`. This does not change the project or its scene settings.\n';
await writeFile('artwork/README.md',readme);
console.log('Archived',manifest.length,'project images in folders.');
