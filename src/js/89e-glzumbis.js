// ---------- 89e-glzumbis.js — zumbis em 3D (InstancedMesh) reaproveitando as poses do 2D ----------
// SÓ com glLive. Sem a flag (e depois de glKill()) o caminho 2D de 87-zumbis.js (zumbiSpr/zsprGet/ZSPR)
// continua sendo o único usado; aqui só compartilhamos o ZST (yaw suavizado por id), como o 2D já faz.
// IDÉIA (87-zumbis.js): os GLBs têm nós RÍGIDOS (sem skin) e clipes TRS. Em vez de recalcular o esqueleto por
// zumbi por quadro, montamos UMA vez por modelo uma TABELA DE POSES: para cada clipe usado (idle/walk/run/attack)
// e NPH=16 fases, as matrizes 4x4 de cada nó (zPose + zWorld) já em Matrix4.
// No quadro, cada zumbi só faz: base = T(x,gy,y)·rotY(st.yaw)·S(SC·scl·wf, SC·scl, SC·scl) e, por nó com
// geometria, base×pose[q][ni] → InstancedMesh.setMatrixAt. Um InstancedMesh por (modelo, nó) com capacidade ZMAX.
// Mesma convenção de eixos/posição do jogador (89d-gljogador.js): Group em (x,·,y) no GLW e yaw em torno de Y
// com o MESMO sentido do 2D (rx=wx·cos+wz·sin, rz=wz·cos−wx·sin). Altura do pé: gpH(x,y) (a mesma superfície dos
// props, 89b-glprops.js), cacheada por posição inteira para não custar por quadro.
// O RENDER segue adiado: glZumbiFrame() (no glFrame) zera as contagens, o laço de draw() empurra as instâncias da
// lista D já cortada por v(), e glZumbiEnd() (no glRenderNow) sobe só o trecho usado e esconde o resto.
const ZG_NPH=16,ZG_CL=['idle','walk','run','attack','explode','spawn','bubble','climb','jump','roar'],ZG_CLI={idle:0,walk:1,run:2,attack:3,explode:4,spawn:5,bubble:6,climb:7,jump:8,roar:9};
const ZG_R=new Map(); // mi -> registro do modelo (geometrias, meshes, tabela de poses)
let ZG_MAT=null,ZG_BLOB=null,ZG_BC=0,ZG_TOK=0,ZG_WARN=0;
const _zgB=new THREE.Matrix4(),_zgM=new THREE.Matrix4(),_zgP=new THREE.Vector3(),_zgS=new THREE.Vector3(),_zgQ=new THREE.Quaternion(),_zgY=new THREE.Vector3(0,1,0);
function zgMat(){return ZG_MAT||(ZG_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
// geometria de um nó do modelo (sopa de triângulos): posição, normal por FACE e cor por VÉRTICE (os 3 canais)
function zgGeoNode(M,ni){
 const g=M.GEO[ni];if(!g||!g.n)return null;
 const n=g.n,P=new Float32Array(g.P),N=new Float32Array(n*9),C=new Float32Array(n*9);
 jgNrm(P,n,N);
 for(let f=0;f<n;f++){const q=f*9,qc=f*3,r=g.C[qc]/255,gg=g.C[qc+1]/255,b=g.C[qc+2]/255;
  for(let k=0;k<3;k++){C[q+k*3]=r;C[q+k*3+1]=gg;C[q+k*3+2]=b}}
 return jgGeo(P,N,C);
}
// monta o registro do modelo (lazy, 1ª vez que o tipo aparece): geometrias, tabela de poses e InstancedMesh
function zgBuild(mi){
 let M=null;try{M=zModel(mi)}catch(e){M=null}
 if(!M||!M.NN)return null;
 const rec={mi,M,NN:M.NN,node:[],msh:[],cnt:null,pm:[],tri:0,SC:1};
 try{rec.SC=zScale(M)}catch(e){rec.SC=27}
 let tri=0;
 for(let ni=0;ni<M.NN;ni++){let ge=null;try{ge=zgGeoNode(M,ni)}catch(e){ge=null}
  rec.node[ni]=ge;if(ge)tri+=M.GEO[ni].n}
 if(!tri)return null; // sem malha: o chamador cai no desenho 2D
 rec.tri=tri;
 rec.np=[];
 for(let ci=0;ci<ZG_CL.length;ci++){
  if(ci>=4&&!M.CLP[ZG_CL[ci]]){rec.pm[ci]=null;continue} // clipes extras só se o modelo os tem
  const clip=zClip(M,ZG_CL[ci]),phs=[];let NP=ci>=4?32:ZG_NPH;for(const ch of clip.ch)if(ch.t.length>NP)NP=ch.t.length; // fases >= quadros do clipe (gordão v2: 30 fps)
  NP=Math.min(NP,96);rec.np[ci]=NP;
  for(let q=0;q<NP;q++){
   zPose(M,clip,q/NP);zWorld(M);
   const arr=new Array(M.NN).fill(null),R=M.WRT,Wt=M.WT;
   for(let ni=0;ni<M.NN;ni++){if(!rec.node[ni])continue;const o=ni*9;
    const m=new THREE.Matrix4();
    m.set(R[o],R[o+1],R[o+2],Wt[ni*3],
          R[o+3],R[o+4],R[o+5],Wt[ni*3+1],
          R[o+6],R[o+7],R[o+8],Wt[ni*3+2],
          0,0,0,1);
    arr[ni]=m}
   phs.push(arr)}
  rec.pm[ci]=phs}
 rec.cnt=new Int32Array(M.NN);
 for(let ni=0;ni<M.NN;ni++){const ge=rec.node[ni];if(!ge)continue;
  const im=new THREE.InstancedMesh(ge,zgMat(),ZMAX);
  im.frustumCulled=false;im.count=0;im.visible=false;
  try{im.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
  GLW.add(im);rec.msh[ni]=im}
 return rec;
}
// disco achatado da sombra (um só para todos os zumbis; ligado/desligado por GQ.blob)
function zgBlob(){
 if(ZG_BLOB)return ZG_BLOB;
 const ge=new THREE.CircleGeometry(1,14);ge.rotateX(-Math.PI/2);
 ZG_BLOB=new THREE.InstancedMesh(ge,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.4,depthWrite:false}),ZMAX);
 ZG_BLOB.frustumCulled=false;ZG_BLOB.count=0;ZG_BLOB.visible=false;
 try{ZG_BLOB.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
 GLW.add(ZG_BLOB);return ZG_BLOB;
}
// por quadro (chamado no glFrame): novo token e zera as contagens de instância
function glZumbiFrame(){
 ZG_TOK++;ZG_BC=0;
 for(const rec of ZG_R.values()){if(!rec)continue;const c=rec.cnt;
  for(let ni=0;ni<rec.NN;ni++)c[ni]=0}
 if(GQ.blob&&GLW)zgBlob();
}
// empurra UM zumbi (mesma decisão de clipe/fase/yaw do zumbiSpr 2D). Sem alocação por quadro.
function glZumbiPush(x,y,k,v,fa,id,t,s){
 const t0=pfStart();
 const mi=k==1?4:k==2?5:(v>0&&v<4)?v|0:0;
 let rec=ZG_R.get(mi);
 if(rec===undefined){rec=zgBuild(mi);ZG_R.set(mi,rec)}
 if(!rec){zumbiSpr(X,x,y,k,v,fa,id,t,s);pfAdd('zgl',t0);return 0} // fallback: sprite 2D de sempre
 let st=ZST.get(id);if(!st){st={yaw:null,px:x,py:y};ZST.set(id,st)}
 st.u=FR;if(FR%240===0)for(const[kk,sv]of ZST)if(sv.u<FR-240)ZST.delete(kk);
 const psi=Math.PI/2-fa;
 if(st.yaw==null)st.yaw=psi;st.yaw+=ad(psi,st.yaw)*Math.min(1,DT_*10);
 const dd=Math.hypot(x-st.px,y-st.py);st.px=x;st.py=y;
 const rad=k==2?18:k==1?10:12;
 // velocidade em px/s (não por quadro: a 144 FPS o gordão, 34 px/s, move só 0,24 px/quadro) com média móvel p/ não piscar entre walk e idle
 st.sp=(st.sp||0)*.85+(dd/Math.max(.004,DT_))*.15;
 let cn=st.sp>9?(k==1?'run':'walk'):'idle';
 for(const p of s.P||[]){if(p[7])continue;if(Math.hypot(p[3]-x,p[4]-y)<=rad+16){cn='attack';break}}
 let ph=(t/(k==1?500:k==2?(cn=='idle'?2830:cn=='attack'?1270:1500):800)+id*.137)%1;if(ph<0)ph+=1; // gordão: período = duração do clipe do GLB
 const tab_=rec.pm[ZG_CLI[cn]],NPH=tab_.length,phq=(ph*NPH|0)%NPH;
 const scl=k==2?1.3:k==1?.9:1,wf=k==2?1:1,S=rec.SC*scl;
 // altura do chão (gpH) só quando o zumbi muda de pixel inteiro
 let gy=0;
 if(typeof gpH==='function'){const ix=x|0,iy=y|0;
  if(st.gx!==ix||st.gy!==iy){st.gx=ix;st.gy=iy;st.gh=gpH(x,y)}
  gy=st.gh||0}
 _zgP.set(x,gy,y);_zgQ.setFromAxisAngle(_zgY,st.yaw);_zgS.set(S*wf,S,S*wf);
 _zgB.compose(_zgP,_zgQ,_zgS);
 const nm=tab_[phq];
 let full=0;
 for(let ni=0;ni<rec.NN;ni++){
  const im=rec.msh[ni];if(!im)continue;
  const c=rec.cnt[ni];
  if(c>=ZMAX){full=1;continue}
  _zgM.copy(_zgB).multiply(nm[ni]);
  im.setMatrixAt(c,_zgM);rec.cnt[ni]=c+1}
 if(full&&!ZG_WARN){ZG_WARN=1;console.warn('glzumbis: mais de',ZMAX,'zumbis do modelo',mi,'no quadro; excedente ignorado')}
 if(GQ.blob&&ZG_BLOB&&ZG_BC<ZMAX){
  _zgP.set(x,gy+1.2,y);_zgQ.setFromAxisAngle(_zgY,st.yaw);_zgS.set(13*scl*wf,1,5*scl);
  _zgB.compose(_zgP,_zgQ,_zgS);ZG_BLOB.setMatrixAt(ZG_BC++,_zgB)}
 pfAdd('zgl',t0);
 return 1;
}
// empurra um modelo num clipe/fase arbitrários (corpo do gordão explodindo, gosma): sem estado de zumbi
const _zgQ2=new THREE.Quaternion(),_zgZ=new THREE.Vector3(0,0,1);
function glClipPush(mi,x,y,yaw,cn,ph,sc,wf,abs,ay,roll){
 let rec=ZG_R.get(mi);if(rec===undefined){rec=zgBuild(mi);ZG_R.set(mi,rec)}
 if(!rec)return 0;const ci=ZG_CLI[cn],tab=rec.pm[ci];if(!tab)return 0;
 const NP=tab.length,phq=Math.max(0,Math.min(NP-1,(ph*NP)|0));
 let gy=0;if(typeof gpH==='function')gy=gpH(x,y)||0;
 _zgP.set(x,gy+(ay||0),y);_zgQ.setFromAxisAngle(_zgY,yaw);if(roll){_zgQ2.setFromAxisAngle(_zgZ,roll);_zgQ.multiply(_zgQ2)}const S_=abs?sc:rec.SC*sc;_zgS.set(S_*wf,S_,S_*wf);_zgB.compose(_zgP,_zgQ,_zgS);
 const nm=tab[phq];
 for(let ni=0;ni<rec.NN;ni++){const im=rec.msh[ni];if(!im)continue;const c=rec.cnt[ni];if(c>=ZMAX)continue;
  _zgM.copy(_zgB).multiply(nm[ni]);im.setMatrixAt(c,_zgM);rec.cnt[ni]=c+1}
 return rec;
}
// fim do quadro (glRenderNow): publica count/needsUpdate só do trecho usado e esconde o que não foi desenhado
function glZumbiEnd(){
 if(!glLive)return;
 if(typeof gooDraw=='function')gooDraw(); // 89k-glgosma.js: corpo explodindo + poça de gosma
 for(const rec of ZG_R.values()){if(!rec)continue;
  const c=rec.cnt;
  for(let ni=0;ni<rec.NN;ni++){const im=rec.msh[ni];if(!im)continue;
   const n=c[ni];im.count=n;im.visible=n>0;
   if(n){im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=n*16;im.instanceMatrix.needsUpdate=true}}}
 if(ZG_BLOB){ZG_BLOB.count=ZG_BC;ZG_BLOB.visible=ZG_BC>0;
  if(ZG_BC){ZG_BLOB.instanceMatrix.updateRange.offset=0;ZG_BLOB.instanceMatrix.updateRange.count=ZG_BC*16;ZG_BLOB.instanceMatrix.needsUpdate=true}}
}
// diagnóstico (leitura): instâncias/malhas/triângulos do quadro, stats do renderer e tamanho do cache 2D
function zgInfo(){
 let inst=0,malhas=0,tri=0;
 for(const rec of ZG_R.values()){if(!rec)continue;
  for(let ni=0;ni<rec.NN;ni++){const im=rec.msh[ni];if(!im||!im.visible)continue;
   malhas++;inst+=im.count;tri+=im.count*(rec.M.GEO[ni].n|0)}}
 return {modelos:ZG_R.size,malhas,inst,tri,blob:ZG_BC,zspr:ZSPR.size,
  calls:GLR?GLR.info.render.calls:0,triF:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0};
}
if(typeof window!=='undefined')window.__glz=zgInfo;
