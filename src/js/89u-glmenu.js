// ---------- 89u-glmenu.js — MENU 3D: acampamento à noite (fogueira + personagem sentado + cidade com zumbis) ----------
// Cena PRÓPRIA (MNG_SCN) fora do mundo da partida (GLW). Só com glLive; o gancho do menu (90-sons.js,
// ramo ph==0) chama glMenuFrame(t) que renderiza AQUI (o ramo retorna antes de glRenderNow). O menu 2D
// (menuScene) continua como fallback: sem a flag, sem WebGL ou se PG não carregar, o gancho cai nele.
// Personagem = MESMO modelo do jogador (JG_BASE/jgNodeGeo/jgMat de 89d) em grupo próprio no MNG_SCN;
// pose sentada = override de PGT/PGR (2/3 pernas, 4 tronco, 5 cabeça, 6/7 braços) + pgFK(), sem arma.
// Graveto com linguiça preso às mãos (ancorado no weapon_socket), ponta sobre a fogueira.
// Zumbis ao fundo: MESMO parsing do jogo (zModel/zPose/zWorld/zClip de 87-*), tabela de poses 'walk'
// pré-computada e UMA Mesh por nó (poucos zumbis: não vale InstancedMesh nem novo parser).
// Sem alocar por quadro: geometria construída uma vez, faíscas reutilizam o mesmo BufferAttribute.
const MNG_TUNE={DIST:660,ALT:185,LOOKY:100,PAN:-140,YAW:-1.9,PGX:100,PGZ:40,S:2.9,
 legF:-1.19,chest:.16,armL:.45,armR:.50,armYL:-.16,armYR:.16,head:.55,rootY:-.56,
 stkL:.86};
let MNG_SCN=null,MNG_CAM=null,MNG_PG=null,MNG_MSH=[],MNG_FLAME=[],MNG_SPK=null,MNG_SPKD=null,MNG_FLH=null,MNG_FL1=null,MNG_FL2=null;
let MNG_STK=null,MNG_SAU=null,MNG_ZM=[],MNG_LT=0,MNG_FL=[0,.2,1];
const MNG_C='#2b3444',MNG_GUN='#3a3d44'; // silhueta do menu 2D (#1e2430) levemente clareada p/ ler à luz do fogo
const MNG_O={k:'menu',s:1,fa:-2.5,aim:-2.5,c:MNG_C,gun:MNG_GUN,ring:null,shot:0,dead:false,idle:true,w:-1,t:0};
const gmQmul=(a,b,o)=>{const x=a[0],y=a[1],z=a[2],w=a[3],x2=b[0],y2=b[1],z2=b[2],w2=b[3];
 o[0]=w*x2+x*w2+y*z2-z*y2;o[1]=w*y2-x*z2+y*w2+z*x2;o[2]=w*z2+x*y2-y*x2+z*w2;o[3]=w*w2-x*x2-y*y2-z*z2;return o};
const _gmq=[0,0,0,0];
const gmQX=(an,o)=>{const s=Math.sin(an*.5);o[0]=s;o[1]=0;o[2]=0;o[3]=Math.cos(an*.5);return o};
const gmQY=(an,o)=>{const s=Math.sin(an*.5);o[0]=0;o[1]=s;o[2]=0;o[3]=Math.cos(an*.5);return o};
// rotação delta em X (opcional Y) aplicada sobre o quat LOCAL do nó, direto em PGR
function gmRot(ni,dx,dy){const R=PG.PGR,bb=[R[ni*4],R[ni*4+1],R[ni*4+2],R[ni*4+3]];
 gmQmul(gmQY(dy||0,_gmq),bb,bb);gmQmul(gmQX(dx,_gmq),bb,bb);R.set(bb,ni*4)}
const _gmL=k=>new THREE.MeshLambertMaterial({color:k});
const gmLite=()=>(typeof GLLITE!=='undefined'&&GLLITE)||GQ.fxP<1;
function gmProps(){
 const T=MNG_TUNE,add=(m,x,y,z)=>{m.position.set(x,y,z);MNG_SCN.add(m);return m};
 // chão: disco de terra/grama escura
 const gro=add(new THREE.Mesh(new THREE.CircleGeometry(1400,26),_gmL(0x1a2216)),120,-1,60);gro.rotation.x=-Math.PI/2;
 // pedras em anel (fogueira em 0,0)
 const STO=new THREE.IcosahedronGeometry(13,0);
 for(let i=0;i<9;i++){const a=i/9*6.2832,r=40+(i*37%7),m=add(new THREE.Mesh(STO,_gmL(0x3d3a38)),Math.cos(a)*r,4,Math.sin(a)*r);
  m.rotation.set(i%3*.4,i*1.3,i%5*.3);m.scale.set(1,.72,1)}
 // brasa central + troncos em chama (cones emissivos MeshBasic, animados no quadro)
 add(new THREE.Mesh(new THREE.CylinderGeometry(26,30,6,9),new THREE.MeshBasicMaterial({color:0x8a3412})),0,3,0);
 const CC=[0xff8c2a,0xffb43a,0xffd76a,0xff9a30];
 for(let i=0;i<4;i++){const a=i*1.57+.5;
  const m=add(new THREE.Mesh(new THREE.ConeGeometry(9,40,6),new THREE.MeshBasicMaterial({color:CC[i],fog:false})),Math.cos(a)*8,17+(i%2)*8,Math.sin(a)*8);
  m.rotation.set((i%2?1:-1)*.5,0,(i%3?1:-1)*.45);m.userData={s:[1,1,1],ry:m.rotation.y,ph:i*1.7};MNG_FLAME.push(m)}
 MNG_FLH=add(new THREE.Mesh(new THREE.SphereGeometry(8,8,6),new THREE.MeshBasicMaterial({color:0xffe4a0,fog:false})),0,16,0);
 // faíscas (Points; LITE usa menos)
 const NS=gmLite()?14:40,PS=new Float32Array(NS*3);
 MNG_SPKD=[];for(let i=0;i<NS;i++)MNG_SPKD.push({y:Math.random()*140,vy:.05+Math.random()*.11,x:(Math.random()-.5)*12,z:(Math.random()-.5)*12,ph:Math.random()*7,top:120+Math.random()*90});
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(PS,3));
 MNG_SPK=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffb668,size:4.5,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,sizeAttenuation:true}));
 MNG_SCN.add(MNG_SPK);
 // estrelas estáticas (sem = no LITE)
 if(!gmLite()){const NP=90,NPv=new Float32Array(NP*3);
  for(let i=0;i<NP;i++){const a=Math.random()*6.283,e=.14+Math.random()*1.2,r=2900;NPv[i*3]=Math.cos(a)*Math.cos(e)*r;NPv[i*3+1]=Math.sin(e)*r;NPv[i*3+2]=Math.sin(a)*Math.cos(e)*r-700}
  const pg2=new THREE.BufferGeometry();pg2.setAttribute('position',new THREE.BufferAttribute(NPv,3));
  MNG_SCN.add(new THREE.Points(pg2,new THREE.PointsMaterial({color:0xbfc8e6,size:3,sizeAttenuation:false,transparent:true,opacity:.5,fog:false,depthWrite:false})))}
 // tronco-banco (personagem senta aqui), perpendicular ao olhar do personagem
 const bn=new THREE.Group();bn.position.set(T.PGX,14,T.PGZ);bn.rotation.y=Math.atan2(Math.cos(T.YAW),-Math.sin(T.YAW));
 const bl=new THREE.Mesh(new THREE.CylinderGeometry(12,12,150,8),_gmL(0x4a3b28));bl.rotation.x=Math.PI/2;bn.add(bl);
 for(const zz of[-62,62]){const ft=new THREE.Mesh(new THREE.CylinderGeometry(13,13,10,7),_gmL(0x3a2e20));ft.rotation.x=Math.PI/2;ft.position.z=zz;bn.add(ft)}
 MNG_SCN.add(bn);
 // mochila encostada + tenda ao fundo (pirâmide achatada de pano)
 add(new THREE.Mesh(new THREE.BoxGeometry(34,42,22),_gmL(0x463a2a)),T.PGX+24,21,T.PGZ-44);
 const tn=add(new THREE.Mesh(new THREE.ConeGeometry(150,230,4),_gmL(0x35455a)),-700,95,-680);tn.scale.set(1,1.05,.72);tn.rotation.y=.78;
 // árvores simples (cones) escuras: só ao fundo (atrás da fogueira e nas laterais), longe do personagem
 {const TR=[[-980,-1500],[-620,-1180],[-1180,-980],[620,-1580],[1020,-1240],[1580,-1560],[-1700,-1300]];
  for(let i=0;i<TR.length;i++){
   const t2=add(new THREE.Mesh(new THREE.ConeGeometry(90,230+(i*57%130),7),_gmL(0x0c150d)),TR[i][0],100,TR[i][1]);
   t2.scale.set(1,.9+(i%3)*.18,1)}}
 gmCity();
}
// cidade ao fundo: faixa de céu mais clara + caixas escuras em 2 fileiras + janelas acesas (InstancedMesh)
function gmCity(){
 const gmSky=new THREE.Mesh(new THREE.PlaneGeometry(9000,2200),
  new THREE.MeshBasicMaterial({color:0x1b2740,fog:false}));
 gmSky.position.set(260,620,-2750);MNG_SCN.add(gmSky);
 const BB=gmLite()?10:15,WIN=[];
 let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
 for(let i=0;i<BB;i++){
  const row=i%2,bw=100+rnd()*90,bh=180+rnd()*(row?520:340),bd=90+rnd()*60,
   x=-1250+i*(row?260:170)+rnd()*70,z=-1750-row*340-rnd()*90;
  const m=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),new THREE.MeshLambertMaterial({color:0x0e131c}));
  m.position.set(x,bh/2-10,z);MNG_SCN.add(m);
  if(!gmLite()&&rnd()<.8)for(let k=0;k<4;k++){const wq=8+rnd()*7;
   WIN.push([x+(rnd()-.5)*bw*.8,bh*(.25+rnd()*.6),z+bd/2+.6,wq,wq*1.35])}
 }
 if(WIN.length){
  const wg=new THREE.PlaneGeometry(1,1),wm=new THREE.MeshBasicMaterial({color:0xffcf7a,transparent:true,opacity:.5,fog:false});
  const im=new THREE.InstancedMesh(wg,wm,WIN.length),mx=new THREE.Matrix4();
  for(let i=0;i<WIN.length;i++){const w=WIN[i];mx.makeScale(w[3],w[4],1);mx.setPosition(w[0],w[1],w[2]);im.setMatrixAt(i,mx)}
  im.frustumCulled=false;MNG_SCN.add(im);
 }
}
// ---------- zumbis ao fundo: tabela de poses 'walk' do modelo do jogo, uma Mesh por nó ----------
const MNG_ZR=new Map();
function gmZRec(mi){
 let r=MNG_ZR.get(mi);if(r!==undefined)return r;
 let M=null;try{M=zModel(mi)}catch(e){M=null}
 if(!M||!M.NN){MNG_ZR.set(mi,null);return null}
 const geo=[];let tri=0;
 for(let ni=0;ni<M.NN;ni++){let ge=null;try{ge=M.GEO[ni]?zgGeoNode(M,ni):null}catch(e){ge=null}geo[ni]=ge;if(ge)tri++}
 if(!tri){MNG_ZR.set(mi,null);return null}
 const tab=[],clip=zClip(M,'walk'),NP=8;
 for(let q=0;q<NP;q++){
  zPose(M,clip,q/NP);zWorld(M);
  const arr=[];
  for(let ni=0;ni<M.NN;ni++){if(!geo[ni])continue;const o=ni*9,m=new THREE.Matrix4();
   m.set(M.WRT[o],M.WRT[o+1],M.WRT[o+2],M.WT[ni*3],
         M.WRT[o+3],M.WRT[o+4],M.WRT[o+5],M.WT[ni*3+1],
         M.WRT[o+6],M.WRT[o+7],M.WRT[o+8],M.WT[ni*3+2],0,0,0,1);
   arr.push([ni,m])}
  tab.push(arr)}
 let SC=27;try{SC=zScale(M)}catch(e){}
 r={M,geo,tab,SC};MNG_ZR.set(mi,r);return r;
}
function gmZombies(){
 const n=gmLite()?3:7,pat=[0,4,1,0,4,1,2],out=[];
 for(let i=0;i<n;i++){
  const rec=gmZRec(pat[i%pat.length]);if(!rec)continue;
  const grp=new THREE.Group(),msh=[];
  for(let ni=0;ni<rec.M.NN;ni++){const ge=rec.geo[ni];if(!ge)continue;
   const m=new THREE.Mesh(ge,zgMat());m.matrixAutoUpdate=false;m.frustumCulled=false;m.userData.ni=ni;
   grp.add(m);msh.push(m)}
  grp.scale.setScalar(rec.SC*1.05);grp.frustumCulled=false;MNG_SCN.add(grp);
  const z={grp,msh,rec,fr:-1,ph:i*.37,
   x0:-40+i*115+(i%2)*45,z0:-700-(i%3)*115,dir:(i%2?-1:1),d:(i%5)*14,sp:11+(i%4)*3,len:70+(i%3)*40};
  grp.position.set(z.x0,0,z.z0);
  grp.rotation.y=z.dir>0?Math.PI/2:-Math.PI/2;
  out.push(z);
 }
 return out;
}
function gmZStep(z,dt,t){
 z.d+=z.dir*z.sp*dt;
 if(z.d>z.len){z.d=z.len;z.dir=-1}
 else if(z.d<-z.len){z.d=-z.len;z.dir=1}
 z.grp.position.set(z.x0+z.d,0,z.z0+(z.d*.12));
 z.grp.rotation.y=z.dir>0?Math.PI/2:-Math.PI/2;
 z.ph=(z.ph+dt*.55)%1;
 const tab=z.rec.tab,fr=(z.ph*tab.length)|0;
 if(fr!==z.fr){z.fr=fr;
  for(const m of z.msh){const q=tab[fr],ni=m.userData.ni;
   for(let i=0;i<q.length;i++)if(q[i][0]===ni){m.matrix.copy(q[i][1]);break}
   m.matrixWorldNeedsUpdate=true}}
}
function gmPlayerBuild(){
 if(!PG||!jgBuild())return 0;
 MNG_PG=new THREE.Group();MNG_PG.visible=false;
 const cc=rgbOf(pgHex(MNG_C));
 for(let ni=0;ni<PG.NN;ni++){
  if(!JG_BASE[ni]||ni===PG.WS)continue; // sem arma (nem a malha do weapon_socket)
  const geo=jgNodeGeo(ni,-1,cc,cc);
  if(!geo)continue;
  const m=new THREE.Mesh(geo,jgMat());m.matrixAutoUpdate=false;m.frustumCulled=false;m.userData={ni:ni};
  MNG_PG.add(m);MNG_MSH.push(m)}
 // graveto + linguiça (filhos do personagem: coords do modelo, escala aplicada pelo grupo)
 MNG_STK=new THREE.Group();MNG_STK.rotation.order='YXZ';
 const L=MNG_TUNE.stkL;
 const st=new THREE.Mesh(new THREE.CylinderGeometry(.020,.024,L,6),_gmL(0xa3754a));st.rotation.x=Math.PI/2;st.position.z=L*.5;MNG_STK.add(st);
 const sau=new THREE.Mesh(new THREE.CylinderGeometry(.105,.10,.30,10),new THREE.MeshLambertMaterial({color:0xb04a3a,emissive:0x571408,emissiveIntensity:.9}));
 sau.rotation.x=Math.PI/2;sau.position.z=L+.10;MNG_STK.add(sau);MNG_SAU=sau;
 for(const dz of[L+.01,L+.20]){const mk=new THREE.Mesh(new THREE.CylinderGeometry(.108,.108,.022,10),_gmL(0x40200e));
  mk.rotation.x=Math.PI/2;mk.position.z=dz;MNG_STK.add(mk)}
 MNG_PG.add(MNG_STK);
 MNG_PG.visible=true;MNG_SCN.add(MNG_PG);return 1}
function gmBuild(){
 MNG_SCN=new THREE.Scene();MNG_SCN.background=new THREE.Color(0x0a0f19);
 MNG_SCN.fog=new THREE.Fog(0x0d1524,900,3400);
 MNG_CAM=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,2,9000);
 // noite legível: hemisférica azulada um pouco mais forte + luar azul + luz quente da fogueira
 MNG_SCN.add(new THREE.HemisphereLight(0x4a5e94,0x14151c,.72));
 if(!gmLite()){const lua=new THREE.DirectionalLight(0x7d97cc,.34);lua.position.set(-.6,1,.3);MNG_SCN.add(lua)}
 MNG_FL1=new THREE.PointLight(0xff9440,MNG_TUNE.flint||2.9,1150,2);MNG_FL1.position.set(0,64,0);MNG_SCN.add(MNG_FL1);
 MNG_FL2=new THREE.PointLight(0xff8a34,1.6,420,2);MNG_FL2.position.set(0,10,0);MNG_SCN.add(MNG_FL2); // brasa no chão
 {const T=MNG_TUNE,c=Math.cos(T.YAW),s2=Math.sin(T.YAW),S=27*T.S;
  MNG_FL[0]=(-T.PGX*c+T.PGZ*s2)/S;MNG_FL[2]=(-T.PGX*s2-T.PGZ*c)/S;MNG_FL[1]=10/S}
 gmProps();
 if(!gmPlayerBuild()){MNG_SCN=null;return 0}
 MNG_ZM=gmZombies();
 return 1}
// cintilar da fogueira: soma de senos "ruidosos" sobre performance.now(), ~0.5..1.18
const gmFlick=w=>.62+.22*Math.sin(w*.0121)+.14*Math.sin(w*.033+.9)+.09*Math.sin(w*.0217+1.7)+.08*Math.sin(w*.052+2.2);
function gmPose(t){
 MNG_O.t=t;pgSolve(0,0,MNG_O);
 const Tv=PG.PGT,T=MNG_TUNE;
 Tv[1]+=T.rootY;                                                    // raiz desce: quadris na altura do banco
 gmRot(2,T.legF,0);gmRot(3,T.legF,0);                              // pernas dobradas à frente/para baixo
 gmRot(4,T.chest+.012*Math.sin(t/950),0);                           // tronco quase reto + respiração
 gmRot(5,0,T.head);                                                 // cabeça virada para o fogo
 gmRot(6,T.armL,T.armYL);gmRot(7,T.armR,T.armYR);                   // braços à frente, mãos no graveto
 pgFK();return 1}
function glMenuFrame(t){
 if(!glLive||GLBAD||!GLR)return 0;
 if(!MNG_SCN&&!gmBuild())return 0;
 const dt=Math.min(.1,((t-MNG_LT)||16)/1000);MNG_LT=t;
 const d=Math.min(window.devicePixelRatio||1,2)*GQ.scale,cw=innerWidth*d|0,ch=innerHeight*d|0;
 if(GLCV.width!==cw||GLCV.height!==ch){GLR.setPixelRatio(d);GLR.setSize(innerWidth,innerHeight,false)}
 if(MNG_CAM.aspect!==innerWidth/innerHeight){MNG_CAM.aspect=innerWidth/innerHeight;MNG_CAM.updateProjectionMatrix()}
 const T=MNG_TUNE,MOB=innerWidth<640;
 let DIST=T.DIST,ALT=T.ALT,LOOKY=T.LOOKY,PAN=T.PAN;
 if(MOB){const f=innerWidth<460?1.5:1.35;DIST*=f;ALT*=f;LOOKY*=f;PAN=30}
 MNG_CAM.position.set(PAN,ALT,DIST);MNG_CAM.lookAt(PAN,LOOKY,0);MNG_CAM.updateMatrixWorld(true);
 const w=performance.now(),fl=Math.max(.5,Math.min(1.18,gmFlick(w)));
 MNG_FL1.intensity=2.9*fl;MNG_FL2.intensity=.9*fl+.3;
 for(let i=0;i<MNG_FLAME.length;i++){const f=MNG_FLAME[i],p=1+.15*Math.sin(w*.0111+f.userData.ph)+.06*Math.sin(w*.031+f.userData.ph*2);
  f.scale.set(f.userData.s[0]*p,f.userData.s[1]*(.85+.3*fl),f.userData.s[2]*p);f.rotation.y=f.userData.ry+w*.00035*(i%2?1:-1)}
 MNG_FLH.scale.setScalar(1+.25*fl);MNG_FLH.position.y=15+7*fl;
 MNG_SPK.material.opacity=Math.min(1,.35+.55*fl);
 {const P=MNG_SPK.geometry.attributes.position;
  for(let i=0;i<MNG_SPKD.length;i++){const s=MNG_SPKD[i];s.y+=s.vy*(MOB?26:16);
   if(s.y>s.top){s.y=4+Math.random()*12;s.vy=.05+Math.random()*.11;s.x=(Math.random()-.5)*12;s.z=(Math.random()-.5)*12}
   P.array[i*3]=s.x+Math.sin(w*.0012+s.ph)*7;P.array[i*3+1]=s.y;P.array[i*3+2]=s.z}
  P.needsUpdate=true}
 gmPose(t);
 MNG_PG.position.set(T.PGX,0,T.PGZ);MNG_PG.rotation.y=T.YAW;
 const S=27*T.S;MNG_PG.scale.set(S,S,S);
 {const R=PG.WRT,Wt=PG.WT;
  for(let i=0;i<MNG_MSH.length;i++){const m=MNG_MSH[i],ni=m.userData.ni,q=ni*9;
   m.matrix.set(R[q],R[q+1],R[q+2],Wt[ni*3],
    R[q+3],R[q+4],R[q+5],Wt[ni*3+1],
    R[q+6],R[q+7],R[q+8],Wt[ni*3+2],0,0,0,1);
   m.matrixWorldNeedsUpdate=true}}
 // graveto: ancorado na mão direita (weapon_socket), coords do MODELO, apontado para a fogueira
 if(MNG_STK){const ws=PG.WS*3,wx=PG.WT[ws],wy=PG.WT[ws+1],wz=PG.WT[ws+2];
  MNG_STK.position.set(wx,wy,wz);
  const dx=MNG_FL[0]-wx,dz=MNG_FL[2]-wz,dn=Math.hypot(dx,dz)||1;
  MNG_STK.rotation.set(Math.atan2(wy-MNG_FL[1],dn)+.02*Math.sin(t/760),Math.atan2(dx,dz)+.035*Math.sin(t/1450),0);
  if(MNG_SAU)MNG_SAU.material.emissiveIntensity=.45+.55*fl}
 for(let i=0;i<MNG_ZM.length;i++)gmZStep(MNG_ZM[i],dt,t);
 GLR.render(MNG_SCN,MNG_CAM);
 return 1}
if(typeof window!=='undefined'){
 window.__gmSet=function(o){try{Object.assign(MNG_TUNE,o)}catch(e){}};
 window.__gmGet=function(){return Object.assign({},MNG_TUNE)}}
