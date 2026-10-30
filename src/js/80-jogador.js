// ---------- JOGADOR: modelo GLB embutido (origem: pacote_cenario_e_jogador/jogador.glb) ----------
const PGLB='@@GLB:assets/jogador.glb@@';
// ---------- Jogador 3D: loader do GLB (PGLB) + drawPlayer ----------
let PG=null;const PGS={},PGC={},PGV=new Float32Array(9);
try{PG=(()=>{
 const b=atob(PGLB),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
 const dv=new DataView(u.buffer,u.byteOffset,u.byteLength);let off=12,j=null,bin=null;
 while(off+8<=u.length){const L=dv.getUint32(off,true),ty=dv.getUint32(off+4,true);
  if(ty===0x4E4F534A)j=JSON.parse(new TextDecoder().decode(u.subarray(off+8,off+8+L)));
  else if(ty===0x004E4942)bin=u.subarray(off+8,off+8+L);off+=8+L}
 if(!j||!bin)throw new Error('glb');
 const bdv=new DataView(bin.buffer,bin.byteOffset,bin.byteLength),CSZ={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
 const RD={5120:p=>bdv.getInt8(p),5121:p=>bdv.getUint8(p),5122:p=>bdv.getInt16(p,true),5123:p=>bdv.getUint16(p,true),5125:p=>bdv.getUint32(p,true),5126:p=>bdv.getFloat32(p,true)};
 const acc=i=>{const a=j.accessors[i],bv=j.bufferViews[a.bufferView],o=(bv.byteOffset||0)+(a.byteOffset||0),n=a.count,nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],ct=a.componentType,sz=CSZ[ct],st=bv.byteStride||sz*nc,rd=RD[ct],out=new Float32Array(n*nc);
  for(let k=0;k<n;k++){const bs=o+k*st;for(let c=0;c<nc;c++)out[k*nc+c]=rd(bs+c*sz)}return out};
 const NN=j.nodes.length,CH=[],RT=new Float32Array(NN*3),RR=new Float32Array(NN*4),PAR=new Int8Array(NN).fill(-1);
 for(let i=0;i<NN;i++){const nd=j.nodes[i];CH[i]=nd.children||[];const tr=nd.translation||[0,0,0],ro=nd.rotation||[0,0,0,1];RT[i*3]=tr[0];RT[i*3+1]=tr[1];RT[i*3+2]=tr[2];RR[i*4]=ro[0];RR[i*4+1]=ro[1];RR[i*4+2]=ro[2];RR[i*4+3]=ro[3]}
 for(let i=0;i<NN;i++)for(const c of CH[i])PAR[c]=i;
 const ORD=[],qu=[0],seen=new Uint8Array(NN);
 while(qu.length){const i=qu.shift();if(seen[i])continue;seen[i]=1;ORD.push(i);for(const c of CH[i])qu.push(c)}
 for(let i=0;i<NN;i++)if(!seen[i]){seen[i]=1;ORD.push(i)}
 const inSh=(r,g,bb)=>(r===58&&g===94&&bb===158)||(r===44&&g===72&&bb===124)||(r===40&&g===62&&bb===106);
 const GEO=new Array(NN).fill(null);let TOT=0;
 for(let i=0;i<NN;i++){const nd=j.nodes[i];if(nd.mesh==null)continue;
  const pr=j.meshes[nd.mesh].primitives[0],P=acc(pr.attributes.POSITION),C=pr.attributes.COLOR_0!=null?acc(pr.attributes.COLOR_0):null,ID=acc(pr.indices),nt=ID.length/3|0,TP=new Float32Array(nt*9),TC=new Uint8Array(nt*3),TK=new Float32Array(nt),shirt=(nd.mesh===3||nd.mesh===5||nd.mesh===6);
  for(let f=0;f<nt;f++){let r=0,g=0,bb=0,m=0;
   for(let k=0;k<3;k++){const vi=ID[f*3+k]|0;TP[f*9+k*3]=P[vi*3];TP[f*9+k*3+1]=P[vi*3+1];TP[f*9+k*3+2]=P[vi*3+2];
    const cr=C?C[vi*4]|0:200,cg=C?C[vi*4+1]|0:200,cb=C?C[vi*4+2]|0:200;r+=cr;g+=cg;bb+=cb;if(inSh(cr,cg,cb))m++}
   TC[f*3]=r/3|0;TC[f*3+1]=g/3|0;TC[f*3+2]=bb/3|0;TK[f]=(shirt&&m===3)?(bb/3)/158:0}
  GEO[i]={P:TP,C:TC,K:TK,n:nt};TOT+=nt}
 const ws=j.nodes.findIndex(n=>n.name==='weapon_socket');
 if(ws>=0){const tp=[],tk=[];
  const bx=(cx,cy,cz,sx,sy,sz,tag)=>{const a=sx/2,bb=sy/2,d=sz/2,
   V=[[-a,-bb,-d],[a,-bb,-d],[a,bb,-d],[-a,bb,-d],[-a,-bb,d],[a,-bb,d],[a,bb,d],[-a,bb,d]],
   F=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[1,2,6],[1,6,5],[0,4,7],[0,7,3]];
   for(const f of F){for(const vi of f)tp.push(V[vi][0]+cx,V[vi][1]+cy,V[vi][2]+cz);tk.push(tag)}};
  bx(0,0,.3,.07,.09,.5,-1);bx(0,.03,.425,.05,.05,.25,-2);
  const nt=tk.length;GEO[ws]={P:new Float32Array(tp),C:new Uint8Array(nt*3),K:new Float32Array(tk),n:nt};TOT+=nt}
 const CLP={};
 for(const an of (j.animations||[])){const chs=[];let dur=0;
  for(const ch of an.channels){const sm=an.samplers[ch.sampler],ti=acc(sm.input),va=acc(sm.output),nq=ch.target.path==='rotation';
   if(ti.length)dur=Math.max(dur,ti[ti.length-1]);chs.push({node:ch.target.node,q:nq,t:ti,v:va,nc:nq?4:3})}
  CLP[an.name]={ch:chs,dur:dur||.001,loop:an.name!=='shoot'&&an.name!=='die'}}
 TOT+=600; // folga para a arma real (GLB) no weapon_socket
 return {NN,PAR,RT,RR,ORD,GEO,CLP,TOT,WS:ws,WRT:new Float32Array(NN*9),WT:new Float32Array(NN*3),PGT:new Float32Array(NN*3),PGR:new Float32Array(NN*4),TMT:new Float32Array(NN*3),TMR:new Float32Array(NN*4),XY:new Float32Array(TOT*6),CL:new Uint8Array(TOT*3),DP:new Float32Array(TOT),OR:new Int32Array(TOT)}
})()}catch(e){PG=null}
const pgHex=h=>h.length==4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h;
function pgSample(ch,time,out,off){const ts=ch.t,v=ch.v,n=ts.length,nc=ch.nc;if(!n)return;
 let a,bb,f;
 if(time<=ts[0]){a=bb=0;f=0}else if(time>=ts[n-1]){a=bb=n-1;f=0}
 else{let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ts[m]<=time)lo=m;else hi=m}a=lo;bb=hi;f=(time-ts[a])/((ts[bb]-ts[a])||1)}
 const p=a*nc,q=bb*nc;
 if(ch.q){let x0=v[p],y0=v[p+1],z0=v[p+2],w0=v[p+3],x1=v[q],y1=v[q+1],z1=v[q+2],w1=v[q+3];
  if(x0*x1+y0*y1+z0*z1+w0*w1<0){x1=-x1;y1=-y1;z1=-z1;w1=-w1}
  const x=x0+(x1-x0)*f,y=y0+(y1-y0)*f,z=z0+(z1-z0)*f,w=w0+(w1-w0)*f,l=Math.hypot(x,y,z,w)||1;
  out[off]=x/l;out[off+1]=y/l;out[off+2]=z/l;out[off+3]=w/l}
 else for(let c=0;c<nc;c++)out[off+c]=v[p+c]+(v[q+c]-v[p+c])*f}
function pgPose(clip,time,filt){const T=PG.PGT,R=PG.PGR;T.set(PG.RT);R.set(PG.RR);if(!clip)return;
 for(const ch of clip.ch){if(filt&&!filt[ch.node])continue;pgSample(ch,time,ch.q?R:T,ch.node*(ch.q?4:3))}}
function pgLoco(ph,b){const w=PG.CLP.walk_aim,r=PG.CLP.run_aim,TM=PG.TMT,TR=PG.TMR,NN=PG.NN;
 if(!w||!r){pgPose(w||r||null,ph);return}
 pgPose(w,ph*w.dur);TM.set(PG.PGT);TR.set(PG.PGR);
 pgPose(r,ph*r.dur);
 const T=PG.PGT,R=PG.PGR;
 for(let i=0;i<NN;i++){const i3=i*3;
  T[i3]=TM[i3]+(T[i3]-TM[i3])*b;T[i3+1]=TM[i3+1]+(T[i3+1]-TM[i3+1])*b;T[i3+2]=TM[i3+2]+(T[i3+2]-TM[i3+2])*b;
  const i4=i*4;let x0=TR[i4],y0=TR[i4+1],z0=TR[i4+2],w0=TR[i4+3],x1=R[i4],y1=R[i4+1],z1=R[i4+2],w1=R[i4+3];
  if(x0*x1+y0*y1+z0*z1+w0*w1<0){x1=-x1;y1=-y1;z1=-z1;w1=-w1}
  const nx=x0+(x1-x0)*b,ny=y0+(y1-y0)*b,nz=z0+(z1-z0)*b,nw=w0+(w1-w0)*b,l=Math.hypot(nx,ny,nz,nw)||1;
  R[i4]=nx/l;R[i4+1]=ny/l;R[i4+2]=nz/l;R[i4+3]=nw/l}}
function drawPlayer(x,y,o){const t=o.t||Date.now(),s=o.s||1;
 if(!PG){person(x,y,{s,fa:o.fa,ph:t/150,sh:o.c,pn:'#223',sk:'#e8bb98',hr:'#321',ey:'#111',gun:o.gun,ring:o.ring,aim:o.aim,rec:o.shot?Math.max(0,1-(t-o.shot)/130):0});return}
 const NN=PG.NN,clamp=(v,a,b)=>v<a?a:v>b?b:v,st=PGS[o.k]||(PGS[o.k]={yaw:null,sp:0,px:x,py:y,ph:0,it:0,b:0,f:2,clip:'',blend:0,dt:0,lt:new Float32Array(NN*3),lr:new Float32Array(NN*4),paT:null,paR:null});
 const dd=Math.hypot(x-st.px,y-st.py);st.px=x;st.py=y;
 const iv=dd/Math.max(.001,DT_);st.sp+=(iv-st.sp)*Math.min(1,DT_*8);
 let cn;
 if(o.dead){cn='die';if(!st.dt)st.dt=t}
 else{st.dt=0;cn=(o.idle||st.sp<6)?'idle_aim':'loco'}
 const clip=cn==='loco'?null:(PG.CLP[cn]||PG.CLP.idle_aim||{ch:[],dur:.001,loop:true});
 let ct=0;
 if(o.dead)ct=clip?Math.min(clip.dur,(t-st.dt)/1000):0;
 else if(cn==='loco'){const bt=o.fast?1:.55*clamp((st.sp-40)/80,0,1);st.b+=(bt-st.b)*Math.min(1,DT_*6);
  const A=.45+.42*st.b,D=4*.9*Math.sin(A)*27,ft=clamp(st.sp/D*.85,1.2,3.4);
  st.f+=(ft-st.f)*Math.min(1,DT_*8);st.ph=(st.ph+DT_*st.f)%1}
 else{st.it+=DT_;if(clip)ct=st.it%clip.dur}
 if(cn!==st.clip){if(st.paT){st.paT=st.lt;st.paR=st.lr;st.lt=new Float32Array(NN*3);st.lr=new Float32Array(NN*4);st.blend=.15}else{st.paT=st.lt;st.paR=st.lr;st.lt=new Float32Array(NN*3);st.lr=new Float32Array(NN*4);st.blend=0}st.clip=cn}
 if(cn==='loco')pgLoco(st.ph,st.b);else pgPose(clip,ct);
 if(st.blend>0&&st.paT){const w=1-st.blend/.15,T=PG.PGT,R=PG.PGR;
  for(let i=0;i<NN;i++){for(let c=0;c<3;c++){const ix=i*3+c;T[ix]+=(st.paT[ix]-T[ix])*(1-w)}
   const q=st.paR;let x0=R[i*4],y0=R[i*4+1],z0=R[i*4+2],w0=R[i*4+3],x1=q[i*4],y1=q[i*4+1],z1=q[i*4+2],w1=q[i*4+3];
   if(x0*x1+y0*y1+z0*z1+w0*w1<0){x1=-x1;y1=-y1;z1=-z1;w1=-w1}
   const nx=x0+(x1-x0)*(1-w),ny=y0+(y1-y0)*(1-w),nz=z0+(z1-z0)*(1-w),nw=w0+(w1-w0)*(1-w),l=Math.hypot(nx,ny,nz,nw)||1;
   R[i*4]=nx/l;R[i*4+1]=ny/l;R[i*4+2]=nz/l;R[i*4+3]=nw/l}
  st.blend=Math.max(0,st.blend-DT_)}
 if(!o.dead&&o.shot&&t-o.shot<350&&PG.CLP.shoot){const fl=new Uint8Array(NN);for(const ch of PG.CLP.shoot.ch)fl[ch.node]=1;pgPose(PG.CLP.shoot,(t-o.shot)/1000,fl)}
 if(st.lt){st.lt.set(PG.PGT);st.lr.set(PG.PGR)}
 const tgt=o.aim!=null?o.aim:(o.fa==null?0:o.fa),psi=Math.PI/2-tgt;
 if(st.yaw==null)st.yaw=psi;st.yaw+=ad(psi,st.yaw)*Math.min(1,DT_*14);
 const R=PG.WRT,Wt=PG.WT,PGT=PG.PGT,PGR=PG.PGR,PAR=PG.PAR;
 for(const i of PG.ORD){const qx=PGR[i*4],qy=PGR[i*4+1],qz=PGR[i*4+2],qw=PGR[i*4+3],x2=qx+qx,y2=qy+qy,z2=qz+qz,xx=qx*x2,xy=qx*y2,xz=qx*z2,yy=qy*y2,yz=qy*z2,zz=qz*z2,wx=qw*x2,wy=qw*y2,wz=qw*z2,
  l0=1-(yy+zz),l1=xy-wz,l2=xz+wy,l3=xy+wz,l4=1-(xx+zz),l5=yz-wx,l6=xz-wy,l7=yz+wx,l8=1-(xx+yy),
  tx=PGT[i*3],ty=PGT[i*3+1],tz=PGT[i*3+2],p=PAR[i];
  if(p<0){R[i*9]=l0;R[i*9+1]=l1;R[i*9+2]=l2;R[i*9+3]=l3;R[i*9+4]=l4;R[i*9+5]=l5;R[i*9+6]=l6;R[i*9+7]=l7;R[i*9+8]=l8;Wt[i*3]=tx;Wt[i*3+1]=ty;Wt[i*3+2]=tz}
  else{const pr=p*9,a0=R[pr],a1=R[pr+1],a2=R[pr+2],a3=R[pr+3],a4=R[pr+4],a5=R[pr+5],a6=R[pr+6],a7=R[pr+7],a8=R[pr+8];
   R[i*9]=a0*l0+a1*l3+a2*l6;R[i*9+1]=a0*l1+a1*l4+a2*l7;R[i*9+2]=a0*l2+a1*l5+a2*l8;
   R[i*9+3]=a3*l0+a4*l3+a5*l6;R[i*9+4]=a3*l1+a4*l4+a5*l7;R[i*9+5]=a3*l2+a4*l5+a5*l8;
   R[i*9+6]=a6*l0+a7*l3+a8*l6;R[i*9+7]=a6*l1+a7*l4+a8*l7;R[i*9+8]=a6*l2+a7*l5+a8*l8;
   Wt[i*3]=a0*tx+a1*ty+a2*tz+Wt[p*3];Wt[i*3+1]=a3*tx+a4*ty+a5*tz+Wt[p*3+1];Wt[i*3+2]=a6*tx+a7*ty+a8*tz+Wt[p*3+2]}}
 if(!o.dead){const fg=(typeof WFG!=='undefined'&&WFG[o.w])||.35,ox=Wt[18],oy=Wt[19],oz=Wt[20],gx=Wt[24]+R[73]*.05+R[74]*fg,gy=Wt[25]+R[75]*.05+R[77]*fg,gz=Wt[26]+R[76]*.05+R[80]*fg;
  let dx=gx-ox,dy=gy-oy,dz=gz-oz;const gl=Math.hypot(dx,dy,dz);
  if(gl>1e-4){dx/=gl;dy/=gl;dz/=gl;
   const ax=-R[55],ay=-R[58],az=-R[61],cx=ay*dz-az*dy,cy=az*dx-ax*dz,cz=ax*dy-ay*dx,dc=ax*dx+ay*dy+az*dz;
   if(dc>-0.999){const s2=cx*cx+cy*cy+cz*cz,k=1/(1+dc),
    m00=1+(cx*cx-s2)*k,m01=-cz+cx*cy*k,m02=cy+cx*cz*k,
    m10=cz+cy*cx*k,m11=1+(cy*cy-s2)*k,m12=-cx+cy*cz*k,
    m20=-cy+cz*cx*k,m21=cx+cz*cy*k,m22=1+(cz*cz-s2)*k,
    r0=R[54],r1=R[55],r2=R[56],r3=R[57],r4=R[58],r5=R[59],r6=R[60],r7=R[61],r8=R[62];
    R[54]=m00*r0+m01*r3+m02*r6;R[55]=m00*r1+m01*r4+m02*r7;R[56]=m00*r2+m01*r5+m02*r8;
    R[57]=m10*r0+m11*r3+m12*r6;R[58]=m10*r1+m11*r4+m12*r7;R[59]=m10*r2+m11*r5+m12*r8;
    R[60]=m20*r0+m21*r3+m22*r6;R[61]=m20*r1+m21*r4+m22*r7;R[62]=m20*r2+m21*r5+m22*r8}}
 }
 const S=27*s,cy_=Math.cos(st.yaw),sy_=Math.sin(st.yaw),XY=PG.XY,CL=PG.CL,DP=PG.DP,OR=PG.OR,TOT=PG.TOT;
 if(!o.dead&&typeof WPG!=='undefined'&&WPG[o.w]){const wp=WPG[o.w],md=wp.mz||[0,.1,.5],ws=PG.WS*9,mt0=Wt[PG.WS*3],mt1=Wt[PG.WS*3+1],mt2=Wt[PG.WS*3+2],
  mw0=R[ws]*md[0]+R[ws+1]*md[1]+R[ws+2]*md[2]+mt0,mw1=R[ws+3]*md[0]+R[ws+4]*md[1]+R[ws+5]*md[2]+mt1,mw2=R[ws+6]*md[0]+R[ws+7]*md[1]+R[ws+8]*md[2]+mt2,
  mrx=mw0*cy_+mw2*sy_,mry=mw1,mrz=-mw0*sy_+mw2*cy_;st.mz=[x+mrx*S,y-(mry-mrz*K2)*S];st.mzt=t}
 let fc=0;
 for(let ni=0;ni<NN;ni++){const g=(ni===PG.WS&&typeof WPG!=='undefined'&&WPG[o.w])||PG.GEO[ni];if(!g)continue;
  const o9=ni*9,m0=R[o9],m1=R[o9+1],m2=R[o9+2],m3=R[o9+3],m4=R[o9+4],m5=R[o9+5],m6=R[o9+6],m7=R[o9+7],m8=R[o9+8],tx=Wt[ni*3],ty=Wt[ni*3+1],tz=Wt[ni*3+2],P=g.P;
  for(let f=0;f<g.n&&fc<TOT;f++){const b=f*9;
   for(let k=0;k<3;k++){const p3=b+k*3,vx=P[p3],vy=P[p3+1],vz=P[p3+2],
    wx=m0*vx+m1*vy+m2*vz+tx,wy=m3*vx+m4*vy+m5*vz+ty,wz=m6*vx+m7*vy+m8*vz+tz,
    rx_=wx*cy_+wz*sy_,ry_=wy,rz_=-wx*sy_+wz*cy_;
    PGV[k*3]=rx_;PGV[k*3+1]=ry_;PGV[k*3+2]=rz_;
    XY[fc*6+k*2]=x+rx_*S;XY[fc*6+k*2+1]=y-(ry_-rz_*K2)*S}
   const ux=PGV[3]-PGV[0],uy=PGV[4]-PGV[1],uz=PGV[5]-PGV[2],wx2=PGV[6]-PGV[0],wy2=PGV[7]-PGV[1],wz2=PGV[8]-PGV[2];
   let nx=uy*wz2-uz*wy2,ny=uz*wx2-ux*wz2,nz=ux*wy2-uy*wx2;const ln=Math.hypot(nx,ny,nz)||1;nx/=ln;ny/=ln;nz/=ln;
   if(ny*SE+nz*CE<=.02)continue;
   const kk=g.K[f];let cr,cg,cb;
   if(kk>0){const cc=rgbOf(pgHex(o.c||'#3a5a8a'));cr=cc[0]*kk;cg=cc[1]*kk;cb=cc[2]*kk}
   else if(kk===-1){cr=34;cg=34;cb=34}
   else if(kk===-2){const gc=rgbOf(pgHex(o.gun||'#333'));cr=gc[0];cg=gc[1];cb=gc[2]}
   else{cr=g.C[f*3];cg=g.C[f*3+1];cb=g.C[f*3+2]}
   const li=.38+.78*Math.max(0,nx*LV[0]+ny*LV[1]+nz*LV[2]);
   CL[fc*3]=Math.min(255,cr*li)|0;CL[fc*3+1]=Math.min(255,cg*li)|0;CL[fc*3+2]=Math.min(255,cb*li)|0;
   DP[fc]=((PGV[1]+PGV[4]+PGV[7])/3)*SE+((PGV[2]+PGV[5]+PGV[8])/3)*CE;
   OR[fc]=fc;fc++}}
 ell(x,y,13*s,5*s,'rgba(0,0,0,.4)');if(o.ring)ell(x,y,18*s,7*s,o.ring,1);
 const orr=OR.subarray(0,fc);orr.sort((a,b)=>DP[a]-DP[b]);
 X.lineWidth=.6;let last='';
 for(let i=0;i<fc;i++){const f=orr[i],xi=f*6,ci=f*3,key=CL[ci]<<16|CL[ci+1]<<8|CL[ci+2];let css=PGC[key];
  if(css==null)css=PGC[key]='rgb('+CL[ci]+','+CL[ci+1]+','+CL[ci+2]+')';
  if(css!==last){X.fillStyle=css;X.strokeStyle=css;last=css}
  X.beginPath();X.moveTo(XY[xi],XY[xi+1]);X.lineTo(XY[xi+2],XY[xi+3]);X.lineTo(XY[xi+4],XY[xi+5]);X.closePath();X.fill();X.stroke()}}
function bushFront(x,y,em){X.globalAlpha=Math.min(1,em/.5);for(const o of[-34,0,34]){ell(x+o+6,y+8,26,8,'rgba(0,0,0,.3)');X.fillStyle='#2f6b2a';X.beginPath();X.arc(x+o,y-10,24,0,7);X.fill();X.fillStyle='#3f8a35';X.beginPath();X.arc(x+o-6,y-18,13,0,7);X.fill()}X.globalAlpha=1}
function stars(x,y,t){for(let i=0;i<5;i++){const a=t/260+i*1.2566;X.fillStyle='#ffe45a';poly(x+Math.cos(a)*38,y-186+Math.sin(a)*10,7,5,t/200+i,3);X.strokeStyle='#a80';X.lineWidth=1;X.stroke()}}
function objShape(k,c){if(k==2){X.fillStyle=c;X.fillRect(-46,-12,92,24);X.fillStyle='rgba(255,255,255,.2)';X.fillRect(-46,-12,92,8);X.fillStyle='#1c2a3a';X.fillRect(-22,-9,44,14);X.fillStyle='#111';X.beginPath();X.arc(-28,12,6,0,7);X.arc(28,12,6,0,7);X.fill()}
 else if(k==1){if(!cenDraw(X,CEN_SPR[1],0,20)){X.fillStyle='#543';X.fillRect(-4,-4,8,24);X.fillStyle='#2d5a27';X.beginPath();X.arc(0,-14,24,0,7);X.fill();X.fillStyle='#3f7a35';X.beginPath();X.arc(-6,-20,14,0,7);X.fill()}}
 else if(k==3){X.fillStyle='#b84';X.fillRect(-18,-18,36,36);X.strokeStyle='#5a3a18';X.lineWidth=2;X.strokeRect(-15,-15,30,30)}
 else if(k==11){if(!cenDraw(X,CEN_SPR[4],0,16)){X.fillStyle='#2d5a27';X.beginPath();X.arc(0,0,22,0,7);X.fill();X.fillStyle='#3f7a35';X.beginPath();X.arc(-6,-6,12,0,7);X.fill()}}
 else if(k==12){X.fillStyle='#6a4a2a';X.fillRect(-4,-14,8,28)}else{X.fillStyle='#b8843a';X.fillRect(-12,-3,24,6)}}
function pts(n,x,y,c,sp,vz,sz,l){for(let i=0;i<n&&PT.length<320;i++){const a=Math.random()*6.28,v=Math.random()*sp;PT.push({x,y,z:5,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:Math.random()*vz,c,s:sz*(.6+Math.random()*.8),l:l*(.6+Math.random()*.8),t:0})}}
function fly(k,c,x,y,vx,vy,vz,vr){if(FL2.length<60)FL2.push({k,c,x,y,z:10,vx,vy,vz,r:0,vr,b:0})}
function objBreak(k,c,x,y,a,imp){const R_=Math.random,ca=Math.cos(a),sa=Math.sin(a);
 if(k==2){if(!imp)fly(2,c,x,y,ca*520+(R_()-.5)*120,sa*520+(R_()-.5)*120,480+R_()*160,(R_()<.5?-1:1)*(6+R_()*5));pts(imp?12:16,x,y,c,260,380,7,.9);pts(8,x,y,'#ffd25a',320,300,4,.5);pts(6,x,y,'#777',200,200,9,1.1)}
 else if(k==1){if(!imp){fly(11,'',x,y,ca*380,sa*380,420,5);fly(12,'',x,y,ca*300+60,sa*300,360,-8);fly(12,'',x,y,ca*300-60,sa*300,360,8)}pts(imp?16:20,x,y,'#3f8a35',240,420,7,1.2);pts(8,x,y,'#7a5a30',200,300,6,1)}
 else{for(let i=0;i<(imp?4:6);i++)fly(13,'',x,y,(R_()-.5)*420+ca*200,(R_()-.5)*300+sa*200,300+R_()*300,(R_()-.5)*14);pts(10,x,y,'#c9a56a',220,300,6,.9)}}
function handleEv(e){const[t,oid,x,y,a,k,c]=e,ang=a/100,d=Math.hypot(x-cx,y-cy),v=Math.max(.15,1-d/1400),p=(x-cx)/600;
 if(t==0){DD[oid]=1;objBreak(k,c,x,y,ang,0);SND[k==2?'car':k==1?'tree':'crate'](v,p)}
 else if(t==5){objBreak(k,c,x,y,0,1);QK=Math.max(QK,.5*v)}
 else if(t==1){pts(26,x,y,'#999',320,260,10,1.4);pts(10,x,y,'#caa',260,380,6,1);QK=Math.max(QK,v);SND.bump(v,p)}
 else if(t==3){DD[oid]=1;pts(6,x,y,'#8a7a5a',120,160,6,.7);SND.grab(v,p)}
 else if(t==4){delete DD[oid];POP[oid]=Date.now()}
 else if(t==8){ftext(x,y-70,'RECARGA PERFEITA!','#7fe3ff',17);pts(14,x,y-20,'#7fd0ff',220,260,5,.7);SND.perfect(c==id?1:.4)}
 else if(t==9){ftext(x,y-70,'FALHOU','#ff6a6a',14);SND.fail(c==id?1:.3)}
 else if(t==6)SND.throwW(v,p)
 else if(t==7){pts(40,x,y,'#3f8a35',360,520,8,1.4);pts(12,x,y,'#7a5a30',240,300,6,1);QK=Math.max(QK,.9);SND.roar(Math.max(.4,v),p)}}
function drawLvl(){const now=Date.now();LUE=LUE.filter(e=>now-e.t<1700);
 for(const e of LUE){const r=RP['p'+e.pid];if(!r)continue;const u=(now-e.t)/1700,x=r.x,y=r.y;X.save();X.globalCompositeOperation='lighter';
  for(let k=0;k<4;k++){const v=(u*1.3+k*.2)%1.3,yy=y-v*110,a=Math.max(0,.55-v*.42);X.strokeStyle='rgba(90,170,255,'+a+')';X.lineWidth=3;X.beginPath();X.ellipse(x,yy,26*(1-v*.25),9,0,0,7);X.stroke()}
  const g=X.createLinearGradient(0,y-115,0,y);g.addColorStop(0,'rgba(80,160,255,0)');g.addColorStop(1,'rgba(90,175,255,'+.38*(1-u)+')');X.fillStyle=g;X.fillRect(x-24,y-115,48,115);
  for(let k=0;k<8;k++){const a=k*.8+u*6,yy=y-((u*1.2+k*.13)%1)*105;X.fillStyle='rgba(190,225,255,'+(1-u)+')';X.fillRect(x+Math.cos(a)*18-1.5,yy,3,3)}X.restore();
  const labs=[['+ AGILIDADE','#ffe066'],['+ VIDA MÁX','#6bf06b'],['+ PRECISÃO','#7fe3ff']],al=u<.12?u/.12:Math.max(0,1-(u-.55)/.45);
  X.textAlign='left';X.textBaseline='middle';X.font='bold 12px sans-serif';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.8)';X.globalAlpha=al;
  labs.forEach((l,i)=>{const ly=y-52-i*15-u*26;X.strokeText(l[0],x+30,ly);X.fillStyle=l[1];X.fillText(l[0],x+30,ly)});X.globalAlpha=1}}
function drawMark(s,t){if(!me||!me[26])return;const z=s.Z.find(q=>q[6]==me[26]);if(!z)return;const r=RP['z'+z[6]];if(!r)return;const k=z[2],R_=k==3?52:k==2?26:18,cy_=r.y-(k==3?60:k==2?22:18),p=1+Math.sin(t/110)*.08;
 X.save();X.translate(r.x,cy_);X.rotate(t/900);X.strokeStyle='#ff3b3b';X.lineWidth=2.5;X.beginPath();X.arc(0,0,R_*p,0,7);X.stroke();X.beginPath();for(let i=0;i<4;i++){const a=i*1.5708;X.moveTo(Math.cos(a)*(R_*p-6),Math.sin(a)*(R_*p-6));X.lineTo(Math.cos(a)*(R_*p+8),Math.sin(a)*(R_*p+8))}X.stroke();X.restore();
 X.fillStyle='#ff3b3b';X.beginPath();X.arc(r.x,cy_,2.5,0,7);X.fill()}
function drawProj(s,dt){drawLvl();drawFT();for(const[k,c,x,y,h,r]of s.Pj||[]){ell(x,y,20,7,'rgba(0,0,0,.35)');X.save();X.translate(x,y-h);X.rotate(r/100);objShape(k,c);X.restore()}
 for(const f of FL2){f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=900*dt;f.r+=f.vr*dt;if(f.z<=0){f.z=0;f.vz=-f.vz*.35;f.vx*=.6;f.vy*=.6;f.vr*=.6;f.b++;if(f.b>=3)f.dead=1}
  ell(f.x,f.y,20,6,'rgba(0,0,0,.3)');X.save();X.translate(f.x,f.y-f.z-8);X.rotate(f.r);objShape(f.k,f.c);X.restore()}
 FL2=FL2.filter(f=>!f.dead);
 for(const p of PT){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=520*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.7;p.vy*=.7}X.globalAlpha=Math.max(0,1-p.t/p.l);X.fillStyle=p.c;X.fillRect(p.x-p.s/2,p.y-p.z-p.s/2,p.s,p.s)}X.globalAlpha=1;PT=PT.filter(p=>p.t<p.l)}
function fireFx(x,y,sz,t){X.globalCompositeOperation='lighter';const g=X.createRadialGradient(x,y-12*sz,2,x,y-12*sz,70*sz);g.addColorStop(0,'rgba(255,150,40,.35)');g.addColorStop(1,'rgba(255,80,0,0)');X.fillStyle=g;X.fillRect(x-70*sz,y-82*sz,140*sz,140*sz);
 for(let i=0;i<7;i++){const ph=t/110+i*1.9+x*.01,h=(28+16*Math.sin(ph))*sz,w=(10+4*Math.sin(ph*1.3))*sz,o=(i-3)*5*sz;X.fillStyle=i%2?'rgba(255,120,20,.8)':'rgba(255,60,10,.8)';X.beginPath();X.moveTo(x+o-w/2,y);X.quadraticCurveTo(x+o-w/2,y-h*.6,x+o+Math.sin(ph*2)*4,y-h);X.quadraticCurveTo(x+o+w/2,y-h*.6,x+o+w/2,y);X.fill();X.fillStyle='rgba(255,220,90,.8)';X.beginPath();X.moveTo(x+o-w/4,y);X.quadraticCurveTo(x+o-w/4,y-h*.35,x+o,y-h*.55);X.quadraticCurveTo(x+o+w/4,y-h*.35,x+o+w/4,y);X.fill()}
 X.globalCompositeOperation='source-over';for(let i=0;i<3;i++){const u=(t/1400+i/3)%1;X.fillStyle='rgba(40,35,45,'+.35*(1-u)+')';X.beginPath();X.arc(x+Math.sin(u*6+i)*10*sz,y-30*sz-u*70*sz,(10+u*18)*sz,0,7);X.fill()}}