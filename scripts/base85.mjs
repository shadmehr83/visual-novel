// HTML-safe ASCII85 saves space without altering any image, video or audio bytes.
const excluded = new Set(['"', "'", '\\', '<', '>', '`', '/', '&', '~']);
export const alphabet85 = Array.from({length:94},(_,i)=>String.fromCharCode(33+i)).filter(c=>!excluded.has(c)).join('');
export function encode85(bytes) {
  if(alphabet85.length!==85)throw Error('Invalid packing alphabet');
  const out=Buffer.alloc(Math.ceil(bytes.length/4)*5);
  for(let i=0,j=0;i<bytes.length;i+=4,j+=5){
    let n=(bytes[i]||0)*16777216+(bytes[i+1]||0)*65536+(bytes[i+2]||0)*256+(bytes[i+3]||0);
    for(let k=4;k>=0;k--){out[j+k]=alphabet85.charCodeAt(n%85);n=Math.floor(n/85);}
  }
  return out.toString('ascii');
}
// Self-contained: this same function is embedded in the browser loader.
export function decode85(text,alphabet,length) {
  if(text.length%5||alphabet.length!==85||length>text.length/5*4)throw Error('Invalid packed editor');
  const map=new Uint8Array(128);map.fill(255);
  for(let i=0;i<85;i++)map[alphabet.charCodeAt(i)]=i;
  const bytes=new Uint8Array(length);
  for(let i=0,j=0;i<text.length;i+=5,j+=4){
    let n=0;
    for(let k=0;k<5;k++){const d=map[text.charCodeAt(i+k)];if(d===undefined||d===255)throw Error('Invalid packed editor character');n=n*85+d;}
    if(n>4294967295)throw Error('Invalid packed editor group');
    if(j<length)bytes[j]=n>>>24;if(j+1<length)bytes[j+1]=n>>>16;if(j+2<length)bytes[j+2]=n>>>8;if(j+3<length)bytes[j+3]=n;
  }
  return bytes;
}
