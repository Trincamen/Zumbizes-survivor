// ---------- 89f-glitens.js — itens no chão em 3D (modelo + esfera translúcida + halo) ----------
// SÓ com glLive. Sem a flag (e depois de glKill()) o 2D de 85-armas.js (drawPickup/drawWeapon3D/weaponIcon)
// continua sendo o único usado e NÃO é tocado aqui.
// Mesmos dados/lógica do drawPickup: IL=[x,y,k,v] já filtrada por v()/bAt() no laço de draw (90-sons.js);
// mapa k->modelo idêntico (armas WPG[k-1]/0/5, itens IT3); giro yaw=t/700; flutuação bb=sin(t/250+x)*3;
// raio R=24+sin(t/300+x); cor SÓ por itCol(k) (decisão tomada). Geometria de WPG[i] convertida UMA vez por
// modelo em BufferGeometry com cores por vértice nos 3 canais (jgNrm/jgGeo de 89d-gljogador.js).
// Eixos iguais aos do jogador/zumbis (89d/89e): mundo (x, altura, y), yaw em torno de Y no MESMO sentido do 2D.
// Altura: gpH(x,y) (superfície de 89b-glprops.js) + (26+bb)/GLSIN — o 2D desenha o item 26+bb px ACIMA do chão
// na tela; em GL a altura h aparece como h·sin(GTLT), então dividimos por GLSIN p/ o item cair no mesmo lugar.
// RENDER adiado: glItemFrame() no glFrame zera as contagens, o laço de draw() empurra (glItemPush) e glItemEnd()
// no glRenderNow publica só o trecho usado e esconde o resto. Sem alocação por quadro.
// Correções da 2b-1: (1) a geometria subtrai WCEN (pivô do giro do drawWeapon3D); (2) a geometria é
// pré-escalada para a projeção do 2D (x·S, y·S/GLSIN, z·S·K2) para ter o MESMO tamanho na tela;
// (3) esfera em duas malhas BackSide/FrontSide, redonda na tela (z contra-escalado por GLCOS);
// (4) igTxtHide() evita o "$" sob telhado; (5) glKill() esconde as malhas.
const IG_MAX=300,IG_R=new Map(),IG_GH=new Map(),IG_COL={};
let IG_TOK=0,IG_SPH=null,IG_SPF=null,IG_SC=0,IG_HALO=null,IG_HC=0,IG_IMAT=null,IG_TEX=null,IG_WARN=0;
const _igY=new THREE.Vector3(0,1,0),_igP=new THREE.Vector3(),_igQ=new THREE.Quaternion(),_igS=new THREE.Vector3(),_igM=new THREE.Matrix4(),_igC=new THREE.Color();
function igMat(){return IG_IMAT||(IG_IMAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
// modelo do item (mesmo mapa do drawPickup 2D). -1 = sem GLB (só esfera/halo)
function igModel(k){
 const wl=k==2||k==3||k==4||k==5||k==7||k==11;
 const wi=wl?(k==7?0:k==11?5:k-1):(IT3[k]!=null?IT3[k]:-1);
 return (wi>=0&&WPG[wi])?wi:-1;
}
// geometria do modelo PARA UM TINT (K −1 preto, −2 cor do item, igual ao 2D/pcG)
// O1: subtrai WCEN (mesma centralização do drawWeapon3D, 85-armas.js:45) para o item girar em torno do
//     próprio centro e não sair da esfera.
// O2: a mesma escala S do 2D e a mesma proporção na tela — o 2D projeta (x, y − z·K2)·S e a câmera 3D
//     projeta (x, GLSIN·y − z), então pré-escalamos a geometria por (S, S/GLSIN, S·K2): a silhueta
//     vertical sai idêntica à do 2D (no horizontal o termo z do giro ganha K2 em vez de 1: ~10%).
function igScale(idx){return idx<=5?Math.min(60,34/(WDIM[idx]||1)):Math.min(90,32/(WDIM[idx]||1))}
function igGeo(idx,tint){
 const g=WPG[idx];if(!g||!g.n)return null;
 const n=g.n,cen=WCEN[idx]||[0,0,0];
 const P=new Float32Array(n*9),N=new Float32Array(n*9),C=new Float32Array(n*9);
 for(let f=0;f<n;f++){const b=f*9;
  for(let k=0;k<3;k++){const p=b+k*3;
   P[p]=g.P[p]-cen[0];P[p+1]=g.P[p+1]-cen[1];P[p+2]=g.P[p+2]-cen[2]}} // escala (S, S/GLSIN, S*K2) vai na matriz da instância, DEPOIS do giro (como o 2D: gira e só então aplica K2)
 jgNrm(P,n,N);
 for(let f=0;f<n;f++){const kk=g.K[f],q=f*9,qc=f*3;
  for(let k=0;k<3;k++){const c=kk===-1?34:kk===-2?tint[k]:g.C[qc+k];
   for(let v=0;v<3;v++)C[q+v*3+k]=c/255}}
 return jgGeo(P,N,C);
}
function igBuild(idx,col){
 const tint=rgbOf(col),geo=igGeo(idx,tint);
 if(!geo)return null;
 const im=new THREE.InstancedMesh(geo,igMat(),IG_MAX);
 im.frustumCulled=false;im.count=0;im.visible=false;
 try{im.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
 GLW.add(im);
 // S já está embutida na geometria (igGeo) — a instância usa escala 1
 return {idx,im,geo,cnt:0,tri:WPG[idx].n};
}
function igGet(idx,col){
 const key=idx+'|'+col,rec=IG_R.get(key);if(rec!==undefined)return rec;
 const r=igBuild(idx,col);IG_R.set(key,r);return r;
}
function igColor(k){return IG_COL[k]||(IG_COL[k]=new THREE.Color(itCol(k)))}
// altura do chão cacheada por pixel inteiro (gpH é estática e cara: varre ROWS×8 por chamada)
function igGround(x,y){
 const key=(x|0)+'|'+(y|0),h=IG_GH.get(key);if(h!==undefined)return h;
 let v=0;if(typeof gpH==='function'){try{v=gpH(x,y)||0}catch(e){v=0}}
 if(IG_GH.size>2048)IG_GH.clear();
 IG_GH.set(key,v);return v;
}
// esfera translúcida em DUAS malhas instanciadas (cor por instância), desenhadas depois dos opacos:
//  BACK  (opacity .30, BackSide) fica ATRÁS do modelo — o z-buffer a oculta onde o modelo está;
//  FRONT (opacity .06, FrontSide) só dá o brilho de vidro por cima.
// O3a: o mundo 3D estica Z por 1/GLCOS, então o Z local vai contra-escalado por GLCOS para a esfera
//      parecer um CÍRCULO de raio R na tela (silhueta: sqrt((GLSIN·R)² + (R·GLCOS)²) = R).
let IG_SG=null;
function igSph(){
 if(IG_SPH)return IG_SPH;
 if(!IG_SG)IG_SG=new THREE.SphereGeometry(1,16,12);
 IG_SPH=new THREE.InstancedMesh(IG_SG,new THREE.MeshBasicMaterial({transparent:true,opacity:.30,depthWrite:false,side:THREE.BackSide}),IG_MAX);
 IG_SPH.frustumCulled=false;IG_SPH.count=0;IG_SPH.visible=false;IG_SPH.renderOrder=9;
 try{IG_SPH.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
 IG_SPF=new THREE.InstancedMesh(IG_SG,new THREE.MeshBasicMaterial({transparent:true,opacity:.06,depthWrite:false,side:THREE.FrontSide}),IG_MAX);
 IG_SPF.frustumCulled=false;IG_SPF.count=0;IG_SPF.visible=false;IG_SPF.renderOrder=10;
 try{IG_SPF.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
 GLW.add(IG_SPH);GLW.add(IG_SPF);return IG_SPH;
}
// halo aditivo (billboard quad com gradiente radial), cor por instância
// O3a: o quad usa a quaternion da câmera, mas dentro do GLW (Z×1/GLCOS) a "altura" dele rende
// GLSIN²+GLCOS ≈ 1,25× — então o eixo Y local vai dividido por esse fator para o halo ficar redondo.
function igHalo(){
 if(IG_HALO)return IG_HALO;
 if(!IG_TEX){const cv=document.createElement('canvas');cv.width=cv.height=64;const c2=cv.getContext('2d');
  if(c2){const g2=c2.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,'rgba(255,255,255,.55)');g2.addColorStop(.5,'rgba(255,255,255,.18)');g2.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=g2;c2.fillRect(0,0,64,64);IG_TEX=new THREE.CanvasTexture(cv)}}
 const ge=new THREE.PlaneGeometry(2,2);
 IG_HALO=new THREE.InstancedMesh(ge,new THREE.MeshBasicMaterial({map:IG_TEX,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),IG_MAX);
 IG_HALO.frustumCulled=false;IG_HALO.count=0;IG_HALO.visible=false;IG_HALO.renderOrder=11;
 try{IG_HALO.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
 GLW.add(IG_HALO);return IG_HALO;
}
// por quadro (chamado no glFrame): novo token e zera as contagens
function glItemFrame(){
 IG_TOK++;IG_SC=0;IG_HC=0;
 for(const rec of IG_R.values())if(rec)rec.cnt=0;
 if(GQ.esfera)igSph();
 if(GQ.halo)igHalo();
}
// empurra UM item (mesma animação/posição do drawPickup 2D). Sem alocação por quadro.
function glItemPush(x,y,k,vv,t,bb){
 if(!glLive||!GLW)return 0;
 const t0=pfStart();
 const idx=igModel(k),col=itCol(k),R=24+Math.sin(t/300+x);
 const h=igGround(x,y)+(26+bb)/GLSIN;
 _igP.set(x,h,y);
 if(idx>=0){
  const rec=igGet(idx,col);
  if(!rec){if(!IG_WARN){IG_WARN=1;console.warn('glitens: modelo',idx,'sem geometria; usando só a esfera')}}
  else if(rec.cnt>=IG_MAX){if(!IG_WARN){IG_WARN=1;console.warn('glitens: mais de',IG_MAX,'itens do modelo',idx,'no quadro; excedente ignorado')}}
  else{const sc_=igScale(idx),e_=_igM.makeRotationY(t/700).elements; // M = T * diag(S, S/GLSIN, S*K2) * R(yaw): gira ANTES de escalar
   e_[0]*=sc_;e_[4]*=sc_;e_[8]*=sc_;e_[1]*=sc_/GLSIN;e_[5]*=sc_/GLSIN;e_[9]*=sc_/GLSIN;e_[2]*=sc_*K2;e_[6]*=sc_*K2;e_[10]*=sc_*K2;
   e_[12]=_igP.x;e_[13]=_igP.y;e_[14]=_igP.z;rec.im.setMatrixAt(rec.cnt++,_igM)}
 }
 _igC.copy(igColor(k));
 if(GQ.esfera&&IG_SPH&&IG_SC<IG_MAX){
  _igQ.identity();_igS.set(R,R,R*GLCOS);_igM.compose(_igP,_igQ,_igS);
  IG_SPH.setMatrixAt(IG_SC,_igM);IG_SPH.setColorAt(IG_SC,_igC);
  if(IG_SPF){IG_SPF.setMatrixAt(IG_SC,_igM);IG_SPF.setColorAt(IG_SC,_igC)}
  IG_SC++}
 if(GQ.halo&&IG_HALO&&IG_HC<IG_MAX){
  _igQ.copy(GLCAM?GLCAM.quaternion:_igQ.identity());const hr=R*1.25;
  _igS.set(hr,hr/(GLSIN*GLSIN+GLCOS),hr);_igM.compose(_igP,_igQ,_igS);
  IG_HALO.setMatrixAt(IG_HC,_igM);IG_HALO.setColorAt(IG_HC,_igC);IG_HC++}
 pfAdd('igl',t0);
 return idx>=0?1:0;
}
// fim do quadro (glRenderNow): publica count/needsUpdate só do trecho usado e esconde o que não foi desenhado
function glItemEnd(){
 if(!glLive)return;
 for(const rec of IG_R.values()){if(!rec)continue;
  const n=rec.cnt,im=rec.im;im.count=n;im.visible=n>0;
  if(n){im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=n*16;im.instanceMatrix.needsUpdate=true}}
 if(IG_SPH){IG_SPH.count=IG_SC;IG_SPH.visible=IG_SC>0;
  if(IG_SC){IG_SPH.instanceMatrix.updateRange.offset=0;IG_SPH.instanceMatrix.updateRange.count=IG_SC*16;IG_SPH.instanceMatrix.needsUpdate=true;
   if(IG_SPH.instanceColor)IG_SPH.instanceColor.needsUpdate=true}}
 if(IG_SPF){IG_SPF.count=IG_SC;IG_SPF.visible=IG_SC>0;
  if(IG_SC){IG_SPF.instanceMatrix.updateRange.offset=0;IG_SPF.instanceMatrix.updateRange.count=IG_SC*16;IG_SPF.instanceMatrix.needsUpdate=true;
   if(IG_SPF.instanceColor)IG_SPF.instanceColor.needsUpdate=true}}
 if(IG_HALO){IG_HALO.count=IG_HC;IG_HALO.visible=IG_HC>0;
  if(IG_HC){IG_HALO.instanceMatrix.updateRange.offset=0;IG_HALO.instanceMatrix.updateRange.count=IG_HC*16;IG_HALO.instanceMatrix.needsUpdate=true;
   if(IG_HALO.instanceColor)IG_HALO.instanceColor.needsUpdate=true}}
}
// O4: o "$" do dinheiro (txt 2D em 90-sons.js) não deve vazar por cima do telhado 3D. Usa a MESMA caixa
// de tela que o roof() 2D cobre (60-desenho.js: x−6−H·SHK .. x+w+6−H·SHK, y−H .. y−H+h). Devolve 1 se coberto.
function igTxtHide(x,y){
 if(typeof BLD==='undefined'||!BLD||!BLD.length)return 0;
 const ty=y+22,sk=typeof SHK=='number'?SHK:.3;
 for(let i=0;i<BLD.length;i++){const b=BLD[i];if(!b||b===meB)continue;
  const top=b.y-b.H;
  if(ty>top&&ty<top+b.h&&x>b.x-6-b.H*sk&&x<b.x+b.w+6-b.H*sk)return 1}
 return 0;
}
// O5: glKill() (88-gl.js) desliga o GL, mas as malhas dos itens continuam na cena. Envolve a função
// original para esconder tudo (inofensivo: nada é renderizado depois do kill, mas fica limpo).
if(typeof glKill==='function'){
 const IG_KILL0=glKill;
 glKill=function(){
  try{for(const rec of IG_R.values())if(rec)rec.im.visible=false;
   if(IG_SPH)IG_SPH.visible=false;if(IG_SPF)IG_SPF.visible=false;if(IG_HALO)IG_HALO.visible=false}catch(e){}
  return IG_KILL0.apply(this,arguments)};
}
// diagnóstico (leitura): modelos/malhas/instâncias/triângulos do quadro e stats do renderer
function igInfo(){
 let malhas=0,inst=0,tri=0;
 for(const rec of IG_R.values()){if(!rec||!rec.im.visible)continue;
  malhas++;inst+=rec.im.count;tri+=rec.im.count*rec.tri}
 return {modelos:IG_R.size,malhas,inst,tri,esfera:GQ.esfera?IG_SC:0,halo:GQ.halo?IG_HC:0,
  calls:GLR?GLR.info.render.calls:0,triF:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0};
}
if(typeof window!=='undefined')window.__gli=igInfo;
