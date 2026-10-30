// ---------- ZUMBIS 3D (GLB) com cache de sprites ----------
// 0 padrao, 1 policial, 2 bombeiro, 3 sem_braco, 4 corredor, 5 gordao (boss nao usa este arquivo)
const ZGLB=['@@GLB:assets/zumbis/zumbi_padrao.glb@@','@@GLB:assets/zumbis/zumbi_policial.glb@@','@@GLB:assets/zumbis/zumbi_bombeiro.glb@@','@@GLB:assets/zumbis/zumbi_sem_braco.glb@@','@@GLB:assets/zumbis/zumbi_corredor.glb@@','@@GLB:assets/zumbis/zumbi_gordao.glb@@'];
const ZM=[],ZSPR=new Map(),ZST={},ZH=46,ZTAU=Math.PI*2,ZMAX=300;
let ZBUD=0;
// GLB -> modelo por nó (hierarquia preservada: pose por clipe + matrizes mundo)
function zParse(b64){
 const {j,acc}=pgParseGlb(b64);
 const NN=j.nodes.length,CH=[],RT=new Float32Array(NN*3),RR=new Float32Array(NN*4),PAR=new Int8Array(NN).fill(-1);
 for(let i=0;i<NN;i++){const nd=j.nodes[i];CH[i]=nd.children||[];const tr=nd.translation||[0,0,0],ro=nd.rotation||[0,0,0,1];
  RT[i*3]=tr[0];RT[i*3+1]=tr[1];RT[i*3+2]=tr[2];RR[i*4]=ro[0];RR[i*4+1]=ro[1];RR[i*4+2]=ro[2];RR[i*4+3]=ro[3]}
 for(let i=0;i<NN;i++)for(const c of CH[i])PAR[c]=i;
 const ORD=[],qu=[0],seen=new Uint8Array(NN);
 while(qu.length){const i=qu.shift();if(seen[i])continue;seen[i]=1;ORD.push(i);for(const c of CH[i])qu.push(c)}
 for(let i=0;i<NN;i++)if(!seen[i]){seen[i]=1;ORD.push(i)}
 const GEO=new Array(NN).fill(null);let TOT=0;
 for(let i=0;i<NN;i++){const nd=j.nodes[i];if(nd.mesh==null)continue;
  const pr=j.meshes[nd.mesh].primitives[0],P=acc(pr.attributes.POSITION),C=pr.attributes.COLOR_0!=null?acc(pr.attributes.COLOR_0):null,ID=acc(pr.indices),nt=ID.length/3|0,TP=new Float32Array(nt*9),TC=new Uint8Array(nt*3);
  const cs=(C&&C.length&&C[0]<=1)?255:1;
  for(let f=0;f<nt;f++){let r=0,g=0,bb=0;
   for(let k=0;k<3;k++){const vi=ID[f*3+k]|0;TP[f*9+k*3]=P[vi*3];TP[f*9+k*3+1]=P[vi*3+1];TP[f*9+k*3+2]=P[vi*3+2];
    r+=C?C[vi*4]*cs:200;g+=C?C[vi*4+1]*cs:200;bb+=C?C[vi*4+2]*cs:200}
   TC[f*3]=r/3|0;TC[f*3+1]=g/3|0;TC[f*3+2]=bb/3|0}
  GEO[i]={P:TP,C:TC,n:nt};TOT+=nt}
 const CLP={};
 for(const an of (j.animations||[])){const chs=[];let dur=0;
  for(const ch of an.channels){const sm=an.samplers[ch.sampler],ti=acc(sm.input),va=acc(sm.output),nq=ch.target.path==='rotation';
   if(ti.length)dur=Math.max(dur,ti[ti.length-1]);chs.push({node:ch.target.node,q:nq,t:ti,v:va,nc:nq?4:3})}
  CLP[an.name]={ch:chs,dur:dur||.001}}
 return {NN,PAR,RT,RR,ORD,GEO,CLP,TOT,SC:0,CSS:{},
  WRT:new Float32Array(NN*9),WT:new Float32Array(NN*3),PGT:new Float32Array(NN*3),PGR:new Float32Array(NN*4),
  FX:new Float32Array(TOT*6),FD:new Float32Array(TOT),FO:new Int32Array(TOT),FK:new Uint32Array(TOT),VX:new Float32Array(TOT*9)};
}
function zModel(mi){let M=ZM[mi];if(M===undefined){try{M=zParse(ZGLB[mi])}catch(e){M=null}ZM[mi]=M}return M}
function zClip(M,n){return M.CLP[n]||(n==='walk'?M.CLP.run:n==='run'?M.CLP.walk:M.CLP.walk)||M.CLP.idle||{ch:[],dur:1}}
function zPose(M,clip,ph){const T=M.PGT,R=M.PGR;T.set(M.RT);R.set(M.RR);if(!clip)return;
 const tm=ph*clip.dur;
 for(const ch of clip.ch)pgSample(ch,tm,ch.q?R:T,ch.node*(ch.q?4:3))}
function zWorld(M){const R=M.WRT,Wt=M.WT,PGT=M.PGT,PGR=M.PGR,PAR=M.PAR,ORD=M.ORD;
 for(const i of ORD){const qx=PGR[i*4],qy=PGR[i*4+1],qz=PGR[i*4+2],qw=PGR[i*4+3],x2=qx+qx,y2=qy+qy,z2=qz+qz,xx=qx*x2,xy=qx*y2,xz=qx*z2,yy=qy*y2,yz=qy*z2,zz=qz*z2,wx=qw*x2,wy=qw*y2,wz=qw*z2,
  l0=1-(yy+zz),l1=xy-wz,l2=xz+wy,l3=xy+wz,l4=1-(xx+zz),l5=yz-wx,l6=xz-wy,l7=yz+wx,l8=1-(xx+yy),
  tx=PGT[i*3],ty=PGT[i*3+1],tz=PGT[i*3+2],p=PAR[i];
  if(p<0){R[i*9]=l0;R[i*9+1]=l1;R[i*9+2]=l2;R[i*9+3]=l3;R[i*9+4]=l4;R[i*9+5]=l5;R[i*9+6]=l6;R[i*9+7]=l7;R[i*9+8]=l8;Wt[i*3]=tx;Wt[i*3+1]=ty;Wt[i*3+2]=tz}
  else{const pr=p*9,a0=R[pr],a1=R[pr+1],a2=R[pr+2],a3=R[pr+3],a4=R[pr+4],a5=R[pr+5],a6=R[pr+6],a7=R[pr+7],a8=R[pr+8];
   R[i*9]=a0*l0+a1*l3+a2*l6;R[i*9+1]=a0*l1+a1*l4+a2*l7;R[i*9+2]=a0*l2+a1*l5+a2*l8;
   R[i*9+3]=a3*l0+a4*l3+a5*l6;R[i*9+4]=a3*l1+a4*l4+a5*l7;R[i*9+5]=a3*l2+a4*l5+a5*l8;
   R[i*9+6]=a6*l0+a7*l3+a8*l6;R[i*9+7]=a6*l1+a7*l4+a8*l7;R[i*9+8]=a6*l2+a7*l5+a8*l8;
   Wt[i*3]=a0*tx+a1*ty+a2*tz+Wt[p*3];Wt[i*3+1]=a3*tx+a4*ty+a5*tz+Wt[p*3+1];Wt[i*3+2]=a6*tx+a7*ty+a8*tz+Wt[p*3+2]}}}
// escala 1x/modelo: altura ≈ 46 px na pose de repouso do idle
function zScale(M){if(M.SC)return M.SC;
 zPose(M,zClip(M,'idle'),0);zWorld(M);
 let a=1e9,b=-1e9;
 for(let ni=0;ni<M.NN;ni++){const g=M.GEO[ni];if(!g)continue;const o9=ni*9,x0=M.WRT[o9],x1=M.WRT[o9+1],x2=M.WRT[o9+2],x3=M.WRT[o9+3],x4=M.WRT[o9+4],x5=M.WRT[o9+5],x6=M.WRT[o9+6],x7=M.WRT[o9+7],x8=M.WRT[o9+8],tx=M.WT[ni*3],ty=M.WT[ni*3+1],tz=M.WT[ni*3+2],P=g.P;
  for(let i=0;i<g.n*3;i++){const vx=P[i*3],vy=P[i*3+1],vz=P[i*3+2],wy=x3*vx+x4*vy+x5*vz+ty,wz=x6*vx+x7*vy+x8*vz+tz,sy=-(wy-wz*K2);
   if(sy<a)a=sy;if(sy>b)b=sy}}
 M.SC=ZH/Math.max(.001,b-a);return M.SC}
// sprite na pose clipe/fase com giro yaw (giro em Y), pé na âncora
function zsprGen(M,cn,ph,yaw){
 const S=zScale(M),clip=zClip(M,cn);
 zPose(M,clip,ph);zWorld(M);
 const co=Math.cos(yaw),si=Math.sin(yaw),NN=M.NN,GEO=M.GEO,WRT=M.WRT,WT=M.WT,VX=M.VX;
 let xa=1e9,xb=-1e9,ya=1e9,yb=-1e9,vi=0;
 for(let ni=0;ni<NN;ni++){const g=GEO[ni];if(!g)continue;const o9=ni*9,x0=WRT[o9],x1=WRT[o9+1],x2=WRT[o9+2],x3=WRT[o9+3],x4=WRT[o9+4],x5=WRT[o9+5],x6=WRT[o9+6],x7=WRT[o9+7],x8=WRT[o9+8],tx=WT[ni*3],ty=WT[ni*3+1],tz=WT[ni*3+2],P=g.P;
  for(let i=0;i<g.n*3;i++,vi++){const vx=P[i*3],vy=P[i*3+1],vz=P[i*3+2],wx=x0*vx+x1*vy+x2*vz+tx,wy=x3*vx+x4*vy+x5*vz+ty,wz=x6*vx+x7*vy+x8*vz+tz,
   rx=wx*co+wz*si,rz=-wx*si+wz*co,sy=-(wy-rz*K2);
   VX[vi*3]=rx;VX[vi*3+1]=wy;VX[vi*3+2]=rz;
   if(rx<xa)xa=rx;if(rx>xb)xb=rx;if(sy<ya)ya=sy;if(sy>yb)yb=sy}}
 const MG=4,cw=Math.max(2,Math.ceil((xb-xa)*S+2*MG)),chh=Math.max(2,Math.ceil((yb-ya)*S+2*MG)),ss=2;
 const cv=document.createElement('canvas');cv.width=Math.ceil(cw*ss);cv.height=Math.ceil(chh*ss);
 const c2=cv.getContext('2d');if(!c2)return null;
 const FX=M.FX,FD=M.FD,FO=M.FO,FK=M.FK,CSS=M.CSS;
 let fc=0;vi=0;
 for(let ni=0;ni<NN;ni++){const g=GEO[ni];if(!g)continue;const C=g.C;
  for(let f=0;f<g.n;f++,vi++){const b=vi*9;
   const ux=VX[b+3]-VX[b],uy=VX[b+4]-VX[b+1],uz=VX[b+5]-VX[b+2],wx2=VX[b+6]-VX[b],wy2=VX[b+7]-VX[b+1],wz2=VX[b+8]-VX[b+2];
   let nx=uy*wz2-uz*wy2,ny=uz*wx2-ux*wz2,nz=ux*wy2-uy*wx2;const ln=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;nx/=ln;ny/=ln;nz/=ln;
   if(ny*SE+nz*CE<=.02)continue;
   const li=.38+.78*Math.max(0,nx*LV[0]+ny*LV[1]+nz*LV[2]),ci=f*3,
    r=Math.min(255,C[ci]*li)|0,gg=Math.min(255,C[ci+1]*li)|0,bb=Math.min(255,C[ci+2]*li)|0,
    key=((r>>4)<<10)|((gg>>4)<<5)|(bb>>4);
   if(CSS[key]==null)CSS[key]='rgb('+((key>>10)<<4)+','+(((key>>5)&31)<<4)+','+((key&31)<<4)+')';
   FK[fc]=key;
   FD[fc]=((VX[b+1]+VX[b+4]+VX[b+7])/3)*SE+((VX[b+2]+VX[b+5]+VX[b+8])/3)*CE;FO[fc]=fc;
   const xi=fc*6;
   for(let k=0;k<3;k++){const p9=b+k*3,sy=-(VX[p9+1]-VX[p9+2]*K2);FX[xi+k*2]=(VX[p9]-xa)*S+MG;FX[xi+k*2+1]=(sy-ya)*S+MG}
   const kx=(FX[xi]+FX[xi+2]+FX[xi+4])/3,ky=(FX[xi+1]+FX[xi+3]+FX[xi+5])/3;
   for(let k=0;k<3;k++){const dx=FX[xi+k*2]-kx,dy=FX[xi+k*2+1]-ky,l=Math.sqrt(dx*dx+dy*dy)||1;FX[xi+k*2]+=dx/l*.3;FX[xi+k*2+1]+=dy/l*.3}
   fc++}}
 const orr=FO.subarray(0,fc);orr.sort((a,b)=>FD[a]-FD[b]);
 c2.setTransform(ss,0,0,ss,0,0);c2.lineWidth=.6;c2.lineJoin='round';
 let last=-1;
 for(let i=0;i<fc;i++){const f=orr[i],kf=FK[f],xi=f*6;
  if(kf!==last){if(last>=0)c2.fill();c2.fillStyle=CSS[kf];c2.beginPath();last=kf}
  c2.moveTo(FX[xi],FX[xi+1]);c2.lineTo(FX[xi+2],FX[xi+3]);c2.lineTo(FX[xi+4],FX[xi+5]);c2.closePath()}
 if(last>=0)c2.fill()
 return {cv,ax:(0-xa)*S+MG,ay:(0-ya)*S+MG,w:cw,h:chh};
}
function zsprGet(mi,cn,phq,yawq){
 const key=mi+'|'+cn+'|'+phq+'|'+yawq;
 let sp=ZSPR.get(key);
 if(sp){ZSPR.delete(key);ZSPR.set(key,sp);return sp}
 if(ZBUD>=2)return null;
 ZBUD++;
 const t0=pfStart();
 const M=zModel(mi);
 if(!M){pfAdd('zsprite',t0);return null}
 sp=zsprGen(M,cn,phq/8,yawq*ZTAU/12);
 if(sp){sp.bmq=0;ZSPR.set(key,sp);
  if(ZSPR.size>ZMAX){const k0=ZSPR.keys().next().value,s0=ZSPR.get(k0);if(s0&&s0.bm&&s0.bm.close){try{s0.bm.close()}catch(e){}}ZSPR.delete(k0)}}
 pfAdd('zsprite',t0);
 return sp}
function zDraw(ctx,sp,x,y,s,wf){if(!sp||!sp.cv)return 0;
 if(!sp.bmq&&typeof createImageBitmap==='function'){sp.bmq=1;try{createImageBitmap(sp.cv).then(b=>{sp.bm=b}).catch(()=>{})}catch(e){}}
 const sx=(s||1)*(wf||1),sy=s||1;
 try{ctx.drawImage(sp.bm||sp.cv,x-sp.ax*sx,y-sp.ay*sy,sp.w*sx,sp.h*sy);return 1}catch(e){return 0}}
// k/v do snapshot -> indice de modelo; desenha o zumbi (1 = sprite, 0 = fallback)
function zumbiSpr(ctx,x,y,k,v,fa,id,t,s){
 const t0=pfStart();
 const mi=k==1?4:k==2?5:(v>0&&v<4)?v|0:0;
 const st=ZST['z'+id]||(ZST['z'+id]={yaw:null,px:x,py:y});
 st.u=FR;if(FR%240===0)for(const kk in ZST)if(ZST[kk].u<FR-240)delete ZST[kk];
 const psi=Math.PI/2-fa;
 if(st.yaw==null)st.yaw=psi;st.yaw+=ad(psi,st.yaw)*Math.min(1,DT_*10);
 const dd=Math.hypot(x-st.px,y-st.py);st.px=x;st.py=y;
 const rad=k==2?18:k==1?10:12;
 let cn=dd>.3?(k==1?'run':'walk'):'idle',near=0;
 for(const p of s.P||[]){if(p[7])continue;if(Math.hypot(p[3]-x,p[4]-y)<=rad+16){near=1;break}}
 if(near)cn='attack';
 let ph=(t/(k==1?500:800)+id*.137)%1;if(ph<0)ph+=1;
 const phq=Math.floor(ph*8)%8,yawq=((Math.round(st.yaw/ZTAU*12)%12)+12)%12;
 const scl=k==2?1.5:k==1?.9:1,wf=k==2?1.4:1;
 const sp=zsprGet(mi,cn,phq,yawq);
 if(!sp){const c=[{s:1,sh:ZS[v],sk:'#8fa88a',pn:'#3a3a4a',hr:'#2a2a22'},{s:.9,sh:'#a8a040',sk:'#b6c27a',pn:'#444',hr:'#432'},{s:1.5,w:1.4,sh:'#3a4a3a',sk:'#6d8a6d',pn:'#222',hr:'#111'}][k];
  person(x,y,Object.assign({ph:t/(k==1?80:130)+x*.05,fa:fa,ey:'#f22',zm:1},c));
  pfAdd('zdraw',t0);return 0}
 ell(x,y,13*scl*wf,5*scl,'rgba(0,0,0,.4)');
 zDraw(ctx,sp,x,y,scl,wf);
 pfAdd('zdraw',t0);
 return 1}
