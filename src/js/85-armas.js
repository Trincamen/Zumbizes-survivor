// ---------- ARMAS 3D: GLBs embutidos (assets/armas/*.glb), 1 por tipo de arma ----------
// ordem: 0 pistola, 1 escopeta, 2 rifle, 3 metralhadora, 4 lança-chamas, 5 sniper
const WGLB=['@@GLB:assets/armas/pistola.glb@@','@@GLB:assets/armas/escopeta.glb@@','@@GLB:assets/armas/rifle.glb@@','@@GLB:assets/armas/metralhadora.glb@@','@@GLB:assets/armas/lanca_chamas.glb@@','@@GLB:assets/armas/sniper.glb@@','@@GLB:assets/itens/dinheiro.glb@@'];
// índice 6 = maço de dinheiro (item no chão; não é arma, reaproveita o mesmo carregador/desenho 3D)
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
 const nt=tc.length/3,mn=j.nodes.find(n=>n.name==='muzzle'),mt=mn&&mn.translation;
 return {P:new Float32Array(tp),C:new Uint8Array(tc),K:new Float32Array(nt),n:nt,mz:mt&&mt.length===3?[mt[0],mt[1],mt[2]]:[0,.1,.5]};
}catch(e){return null}});
// distância (m, ao longo do cano a partir da empunhadura) onde a mão esquerda apoia cada arma
const WFG=[.05,.35,.35,.35,.30,.40];

// ---------- desenho 3D de arma em canvas qualquer (HUD, ícones, itens no chão) ----------
const WCEN=[],WDIM=[],WICON=[];
for(let i=0;i<WPG.length;i++){const g=WPG[i];
 if(!g){WCEN.push(null);WDIM.push(1);continue}
 const P=g.P;let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
 for(let f=0;f<g.n*9;f+=3){const px=P[f],py=P[f+1],pz=P[f+2];
  if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;if(pz<z0)z0=pz;if(pz>z1)z1=pz}
 WCEN.push([(x0+x1)/2,(y0+y1)/2,(z0+z1)/2]);
 WDIM.push(Math.max(x1-x0,y1-y0,z1-z0)||1)}
const W3MAX=450,W3X=new Float32Array(W3MAX*6),W3C=new Uint8Array(W3MAX*3),W3D=new Float32Array(W3MAX),W3O=new Uint16Array(W3MAX),W3V=new Float32Array(9),W3CSS={};
function drawWeapon3D(ctx,x,y,w,yaw,S){const g=WPG[w],cen=WCEN[w];if(!g||!cen)return;
 const co=Math.cos(yaw),si=Math.sin(yaw),P=g.P,C=g.C,V=W3V;let fc=0;
 for(let f=0;f<g.n&&fc<W3MAX;f++){const b=f*9;
  for(let k=0;k<3;k++){const p3=b+k*3,px=P[p3]-cen[0],py=P[p3+1]-cen[1],pz=P[p3+2]-cen[2];
   V[k*3]=px*co+pz*si;V[k*3+1]=py;V[k*3+2]=-px*si+pz*co}
  const ux=V[3]-V[0],uy=V[4]-V[1],uz=V[5]-V[2],vx=V[6]-V[0],vy=V[7]-V[1],vz=V[8]-V[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const ln=Math.hypot(nx,ny,nz)||1;nx/=ln;ny/=ln;nz/=ln;
  if(ny*SE+nz*CE<=.02)continue;
  const o=fc*6;
  for(let k=0;k<3;k++){const vx2=V[k*3],vy2=V[k*3+1],vz2=V[k*3+2];W3X[o+k*2]=x+vx2*S;W3X[o+k*2+1]=y-(vy2-vz2*K2)*S}
  const li=.38+.78*Math.max(0,nx*LV[0]+ny*LV[1]+nz*LV[2]);
  W3C[fc*3]=Math.min(255,C[f*3]*li)|0;W3C[fc*3+1]=Math.min(255,C[f*3+1]*li)|0;W3C[fc*3+2]=Math.min(255,C[f*3+2]*li)|0;
  W3D[fc]=((V[1]+V[4]+V[7])/3)*SE+((V[2]+V[5]+V[8])/3)*CE;W3O[fc]=fc;fc++}
 const orr=W3O.subarray(0,fc);orr.sort((a,b)=>W3D[a]-W3D[b]);
 ctx.lineWidth=.6;let last='';
 for(let i=0;i<fc;i++){const f=orr[i],xi=f*6,ci=f*3,key=W3C[ci]<<16|W3C[ci+1]<<8|W3C[ci+2];let css=W3CSS[key];
  if(css==null)css=W3CSS[key]='rgb('+W3C[ci]+','+W3C[ci+1]+','+W3C[ci+2]+')';
  if(css!==last){ctx.fillStyle=css;ctx.strokeStyle=css;last=css}
  ctx.beginPath();ctx.moveTo(W3X[xi],W3X[xi+1]);ctx.lineTo(W3X[xi+2],W3X[xi+3]);ctx.lineTo(W3X[xi+4],W3X[xi+5]);ctx.closePath();ctx.fill();ctx.stroke()}}
function weaponIcon(w){
 if(WICON[w]!==undefined)return WICON[w];let u='';
 try{const cv=document.createElement('canvas');cv.width=240;cv.height=120;
  const c2=cv.getContext('2d');if(c2){drawWeapon3D(c2,120,64,w,Math.PI/2,Math.min(420,214/WDIM[w]));u=cv.toDataURL()||''}}catch(e){u=''}
 WICON[w]=u;return u}
// item no chão dentro de esfera translúcida (estilo GTA Vice City)
function drawPickup(x,y,k,vv,t,bb){
 const wl=k==2||k==3||k==4||k==5||k==7||k==11,wi=k==7?0:k==11?5:k-1;
 const col=k==8?'#ffc83a':(k==0||k==9||k==10)?'#5cf07a':(k==1||k==6)?'#ffd24a':'#4fe8d0';
 const cr=parseInt(col.substr(1,2),16),cg=parseInt(col.substr(3,2),16),cb=parseInt(col.substr(5,2),16);
 const cc=a=>'rgba('+cr+','+cg+','+cb+','+a+')';
 ell(x,y+12,14,5,'rgba(0,0,0,.4)');
 const cy=y-26+bb,R=24+Math.sin(t/300+x);
 let g=X.createRadialGradient(x,cy,0,x,cy,R*1.25);g.addColorStop(0,cc(.22));g.addColorStop(1,cc(0));
 X.save();X.globalCompositeOperation='lighter';X.fillStyle=g;X.beginPath();X.arc(x,cy,R*1.25,0,7);X.fill();X.restore();
 g=X.createRadialGradient(x-R*.25,cy-R*.3,R*.1,x,cy,R);g.addColorStop(0,cc(.04));g.addColorStop(.7,cc(.14));g.addColorStop(1,cc(.45));
 X.fillStyle=g;X.beginPath();X.arc(x,cy,R,0,7);X.fill();
 if(wl)drawWeapon3D(X,x,cy,wi,t/700,Math.min(60,34/WDIM[wi]));
 else if(k==8)drawWeapon3D(X,x,cy,6,t/700,Math.min(90,32/WDIM[6]));
 else{X.save();X.translate(x,0);X.scale(Math.max(.25,Math.abs(Math.cos(t/500))),1);X.translate(-x,0);
  if(k==0){X.fillStyle='#fff';X.fillRect(x-11,cy-11,22,22);X.fillStyle='#e22';X.fillRect(x-3,cy-8,6,16);X.fillRect(x-8,cy-3,16,6)}
  else if(k==1)txt('⚡',x,cy,30,'#4df');else if(k==6)txt('★',x,cy,32,'#fc0');else if(k==9)txt('🩹',x,cy,26,'#fff');else if(k==10)txt('💊',x,cy,26,'#fff');
  X.restore()}
 if(k==8)txt(vv,x,y+22,12,'#fe8')
 X.strokeStyle=cc(.7);X.lineWidth=1.5;X.beginPath();X.arc(x,cy,R,0,7);X.stroke();
 X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=2;X.beginPath();X.arc(x,cy,R*.78,-2.6,-1.9);X.stroke()}
