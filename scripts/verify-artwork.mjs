import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const p=JSON.parse(await readFile('projects/published.stillframe.json','utf8'));
const manifest=JSON.parse(await readFile('artwork/manifest.json','utf8'));
assert.equal(manifest.length,p.assets.length);
for(const a of p.assets){
 const entry=manifest.find(m=>m.id===a.id);assert.ok(entry,a.id);
 const bytes=await readFile(entry.path);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,a.id);
 assert.ok(bytes.equals(Buffer.from(a.data.split(',')[1],'base64')),a.id);
 assert.equal(a.folder,entry.folder);
}
const originals=JSON.parse(await readFile('artwork/generated-originals/manifest.json','utf8'));
for(const a of originals){const bytes=await readFile('artwork/generated-originals/'+a.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
console.log(`Verified ${manifest.length} archived project images and ${originals.length} generation originals: exact bytes, folders and SHA-256 checksums.`);
