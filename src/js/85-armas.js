// ---------- ARMAS 3D: GLBs embutidos (assets/armas/*.glb), 1 por tipo de arma ----------
// ordem: 0 pistola, 1 escopeta, 2 rifle, 3 metralhadora, 4 lança-chamas, 5 sniper
const WGLB=['@@GLB:assets/armas/pistola.glb@@','@@GLB:assets/armas/escopeta.glb@@','@@GLB:assets/armas/rifle.glb@@','@@GLB:assets/armas/metralhadora.glb@@','@@GLB:assets/armas/lanca_chamas.glb@@','@@GLB:assets/armas/sniper.glb@@'];
function pgParseGlb(b64){const b=atob(b64),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
 const dv=new DataView(u.buffer,u.byteOffset,u.byteLength);let off=12,j=null,bin=null;
 while(off+8<=u.length){const L=dv.getUint32(off,true),ty=dv.getUint32(off+4,true);
  if(ty===0x4E4F534A)j=JSON.parse(new TextDecoder().decode(u.subarray(off+8,off+8+L)));
  else if(ty===0x004E4942)bin=u.subarray(off+8,off+8+L);off+=8+L}
 if(!j||!bin)throw new Error('glb');
 const bdv=new DataView(bin.buffer,bin.byteOffset,bin.byteLength),CSZ={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
 const RD={5120:p=>bdv.getInt8(p),5121:p=>bdv.getUint8(p),5122:p=>bdv.getInt16(p,true),5123:p=>bdv.getUint16(p,true),5125:p=>bdv.getUint32(p,true),5126:p=>bdv.getFloat32(p,true)};
 const acc=i=>{const a=j.accessors[i],bv=j.bufferViews[a.bufferView],o=(bv.byteOffset||0)+(a.byteOffset||0),n=a.count,nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],ct=a.componentType,sz=CSZ[ct],st=bv.byteStride||sz*nc,rd=RD[ct],out=new Float32Array(n*nc);
  for(let k=0;k<n;k++){const bs=o+k*st;for(let c=0;c<nc;c++)out[k*nc+c]=rd(bs+c*sz)}return out};
 return {j,acc}}
const WPG=WGLB.map(src=>{try{
 const {j,acc}=pgParseGlb(src),tp=[],tc=[];
 for(const nd of j.nodes){if(nd.mesh==null)continue;
  for(const pr of j.meshes[nd.mesh].primitives){
   const P=acc(pr.attributes.POSITION),C=pr.attributes.COLOR_0!=null?acc(pr.attributes.COLOR_0):null,ID=acc(pr.indices),nt=ID.length/3|0;
   for(let f=0;f<nt;f++){let r=0,g=0,bb=0;
    for(let k=0;k<3;k++){const vi=ID[f*3+k]|0;tp.push(P[vi*3],P[vi*3+1],P[vi*3+2]);
     r+=C?C[vi*4]|0:200;g+=C?C[vi*4+1]|0:200;bb+=C?C[vi*4+2]|0:200}
    tc.push(r/3|0,g/3|0,bb/3|0)}}
 }
 const nt=tc.length/3;
 return {P:new Float32Array(tp),C:new Uint8Array(tc),K:new Float32Array(nt),n:nt};
}catch(e){return null}});
// distância (m, ao longo do cano a partir da empunhadura) onde a mão esquerda apoia cada arma
const WFG=[.05,.35,.35,.35,.30,.40];
