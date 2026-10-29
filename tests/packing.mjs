import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {alphabet85,encode85,decode85} from '../scripts/base85.mjs';
assert.equal(alphabet85.length,85);
for(const length of [0,1,2,3,4,5,8,41,255,1024,100000]){
 const bytes=randomBytes(length),packed=encode85(bytes);assert(Buffer.from(decode85(packed,alphabet85,length)).equals(bytes));assert(!/[<>"'\\/`]/.test(packed));
}
for(const bytes of [Buffer.alloc(8),Buffer.alloc(8,255),Buffer.from(Array.from({length:256},(_,i)=>i))])assert(Buffer.from(decode85(encode85(bytes),alphabet85,bytes.length)).equals(bytes));
const original=Buffer.from('Byte-preserving media payload '.repeat(500));const zip=gzipSync(original);assert(gunzipSync(decode85(encode85(zip),alphabet85,zip.length)).equals(original));
assert.throws(()=>decode85('????',alphabet85,3));assert.throws(()=>decode85('<<<<<',alphabet85,3));
console.log('PASS: HTML-safe packing round-trips every byte, padding length and gzip payload; malformed groups are rejected.');
