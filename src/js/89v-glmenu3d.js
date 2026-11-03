// ---------- 89v-glmenu3d.js — MENU 3D: recria o menu 2D atual (acampamento, jogador na fogueira) ----------
// Cena PRÓPRIA (MN3) fora do mundo da partida; o gancho no ramo ph==0 de draw() chama glMenuFrame(t)
// ANTES de menuScene(t): truthy → glC2D(0)+return; senão cai no menu 2D de hoje (fallback/?gl=0/erro).
// Unidades = METROS DO JOGADOR (u). Projeção derivada do 2D: FOV 40°, câmera y=.60u, eixo levantado
// ~14,1° (horizonte 0.845H), jogador a d=11.7u (escala px/u = 27*(H*.20/46) do 2D). Tudo posicionado
// por RAIO da câmera (mn3RP) → posições de tela iguais ao 2D. LAZY build 1x; 0 alocação por quadro.
const MN3={scn:null,cam:null,root:null,pg:null,msh:[],lt:0,ck:'',
 fwd:new THREE.Vector3(),u1:new THREE.Vector3(),u2:new THREE.Vector3(),
 lampP:new THREE.Vector3(),flT:new THREE.Vector3(),glow:new THREE.Vector3(),
 fL1:null,fL2:null,fL3:null,flm:[],flh:null,spk:null,spkd:[],
 dust:null,dustA:[],eyes:[],fogS:[],fogD:[10.3,4.6,3.0],vig:null,cone:null,
 pole:null,cerca:[],cbb:null,street:null,sbb:null};
const MN3_C='#23293a'; // silhueta do menu 2D (#1e2430) levemente clareada p/ ler à luz do fogo
const MN3_O={k:'menu',s:1,fa:-2.5,aim:-2.5,c:MN3_C,gun:'#3a3d44',ring:null,shot:0,dead:false,idle:true,w:-1,t:0,nosolve:true,noweap:true};
const mn3Lite=()=>(typeof GLLITE!=='undefined'&&GLLITE)||GQ.fxP<1;
const mn3Flick=w=>.62+.22*Math.sin(w*.0121)+.14*Math.sin(w*.033+.9)+.09*Math.sin(w*.0217+1.7)+.08*Math.sin(w*.052+2.2);
const mn3FlickL=w=>.93+.045*Math.sin(w/97)+.025*Math.sin(w/41+.7);
const mn3R=i=>{const f=Math.sin(i*12.9898+11.3)*43758.5453;return f-Math.floor(f)};
const _mn3Q=[0,0,0,0],_mn3R=[0,0,0,0];
const mn3Qm=(a,b,o)=>{const x=a[0],y=a[1],z=a[2],w=a[3],x2=b[0],y2=b[1],z2=b[2],w2=b[3];
 o[0]=w*x2+x*w2+y*z2-z*y2;o[1]=w*y2-x*z2+y*w2+z*x2;o[2]=w*z2+x*y2-y*x2+z*w2;o[3]=w*w2-x*x2-y*y2-z*z2;return o};
const mn3QX=(an,o)=>{const s=Math.sin(an*.5);o[0]=s;o[1]=0;o[2]=0;o[3]=Math.cos(an*.5);return o};
const mn3QY=(an,o)=>{const s=Math.sin(an*.5);o[0]=0;o[1]=s;o[2]=0;o[3]=Math.cos(an*.5);return o};
function mn3Rot(ni,dx,dy){const R=PG.PGR;_mn3Q[0]=R[ni*4];_mn3Q[1]=R[ni*4+1];_mn3Q[2]=R[ni*4+2];_mn3Q[3]=R[ni*4+3];
 mn3Qm(mn3QY(dy||0,_mn3R),_mn3Q,_mn3Q);mn3Qm(mn3QX(dx,_mn3R),_mn3Q,_mn3Q);
 R[ni*4]=_mn3Q[0];R[ni*4+1]=_mn3Q[1];R[ni*4+2]=_mn3Q[2];R[ni*4+3]=_mn3Q[3]}
// ponto de tela (fx,fy frações) a distância d ao longo do eixo → mundo (sem alocar; out)
function mn3RP(fx,fy,d,out){
 out.set(fx*2-1,1-fy*2,-1).unproject(MN3.cam).sub(MN3.cam.position).normalize();
 const k=d/Math.max(.02,out.x*MN3.fwd.x+out.y*MN3.fwd.y+out.z*MN3.fwd.z);
 return out.multiplyScalar(k).add(MN3.cam.position)}
// GLB base64 → {grp,bb[6],lamp?} (parsing padrão do jogo: gmBuf + THREE.GLTFLoader.parse)
function mn3Glb(b64,cb,opt){let M=null;
 try{new THREE.GLTFLoader().parse(gmBuf(b64),'',g=>{try{
  M={grp:new THREE.Group(),bb:[1e9,-1e9,1e9,-1e9,1e9,-1e9]};
  g=g.scene||g;g.updateMatrixWorld(true);
  g.traverse(o=>{
   const ge=o&&o.geometry;if(!ge||!ge.attributes||!ge.attributes.position)return;
   const pa=ge.attributes.position,ca=ge.attributes.color,na=ge.attributes.normal,
    id=ge.index?ge.index.array:null,cnt=id?id.length:pa.count,m=o.matrixWorld.elements,
    cs=ca&&ca.itemSize>2,P=[],C=[],N=[];
   for(let f=0;f+2<cnt;f+=3)for(let k=0;k<3;k++){
    const vi=id?id[f+k]:f+k,x=pa.getX(vi),y=pa.getY(vi),z=pa.getZ(vi),
     wx=m[0]*x+m[4]*y+m[8]*z+m[12],wy=m[1]*x+m[5]*y+m[9]*z+m[13],wz=m[2]*x+m[6]*y+m[10]*z+m[14];
    P.push(wx,wy,wz);C.push(cs?ca.getX(vi):.5,cs?ca.getY(vi):.5,cs?ca.getZ(vi):.5);
    const nx=na?m[0]*na.getX(vi)+m[4]*na.getY(vi)+m[8]*na.getZ(vi):0,
     ny=na?m[1]*na.getX(vi)+m[5]*na.getY(vi)+m[9]*na.getZ(vi):1,
     nz=na?m[2]*na.getX(vi)+m[6]*na.getY(vi)+m[10]*na.getZ(vi):0,l=Math.hypot(nx,ny,nz)||1;
    N.push(nx/l,ny/l,nz/l);
    if(wx<M.bb[0])M.bb[0]=wx;if(wx>M.bb[1])M.bb[1]=wx;
    if(wy<M.bb[2])M.bb[2]=wy;if(wy>M.bb[3])M.bb[3]=wy;
    if(wz<M.bb[4])M.bb[4]=wz;if(wz>M.bb[5])M.bb[5]=wz}
   const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
   geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
   geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
   M.grp.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true,emissive:(opt&&opt.em!=null)?opt.em:0x23262c,side:(opt&&opt.ds)?THREE.DoubleSide:THREE.FrontSide})));
   if(/lamp/i.test(o.name||'')){try{
    ge.computeBoundingBox();
    const c=ge.boundingBox.getCenter(new THREE.Vector3());
    M.lamp=c.applyMatrix4(o.matrixWorld)}catch(e){}}});
 }catch(e){console.warn('glmenu3d glb',e);M=null}cb(M)},e=>cb(null))}
 catch(e){cb(null)}}
// pose sentada do jogador: MCT (pose aprovada do 2D) + sobrescrita + pgFK
function mn3Pose(t){
 MN3_O.t=t;pgSolve(0,0,MN3_O);
 const T=(typeof MCT!=='undefined')?MCT:{leg:-1.19,chest:.16,armL:1.0,armR:.50,armYL:-.1,armYR:.16,head:.55,root:-.56};
 PG.PGT[1]+=T.root;
 mn3Rot(2,T.leg,0);mn3Rot(3,T.leg,0);
 mn3Rot(4,T.chest+.012*Math.sin(t/950),0);
 mn3Rot(5,0,T.head);
 mn3Rot(6,T.armL,T.armYL);mn3Rot(7,T.armR,T.armYR);
 pgFK();return 1}
// texturas em canvas (1x): glow radial quente, névoa baixa horizontal, vinheta (grad signup #menu)
function mn3TexRad(a,b){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
 if(c){const g=c.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,a);g.addColorStop(.42,b);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,64,64)}
 return new THREE.CanvasTexture(cv)}
function mn3TexFog(){const cv=document.createElement('canvas');cv.width=128;cv.height=24;const c=cv.getContext('2d');
 if(c){let g=c.createLinearGradient(0,0,0,24);
  g.addColorStop(0,'rgba(130,102,78,0)');g.addColorStop(.45,'rgba(140,110,84,.9)');g.addColorStop(1,'rgba(110,86,64,0)');
  c.fillStyle=g;c.fillRect(0,0,128,24);c.globalCompositeOperation='destination-in';
  g=c.createLinearGradient(0,0,128,0);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.18,'rgba(0,0,0,1)');g.addColorStop(.82,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,128,24)}
 return new THREE.CanvasTexture(cv)}
function mn3TexVig(){const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');
 if(c){let g=c.createRadialGradient(143,128,46,143,128,205);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,0,0,.46)');g.addColorStop(1,'rgba(0,0,0,.94)');
  c.fillStyle=g;c.fillRect(0,0,256,256);
  g=c.createLinearGradient(0,0,148,0);
  g.addColorStop(0,'rgba(0,0,0,.90)');g.addColorStop(.55,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,148,256);
  g=c.createLinearGradient(0,0,0,46);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,256,46);
  g=c.createLinearGradient(0,222,0,256);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.62)');
  c.fillStyle=g;c.fillRect(0,222,256,34)}
 return new THREE.CanvasTexture(cv)}
// ---------- build (lazy, 1x) ----------
function mn3Build(){
 if(!glLive||GLBAD||!GLR||typeof THREE==='undefined'||!PG||!jgBuild())return 0;
 const SCN=MN3.scn=new THREE.Scene();SCN.background=new THREE.Color(0x060405);
 SCN.fog=new THREE.Fog(0x0a0806,9,80);
 MN3.cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.2,200);SCN.add(MN3.cam);
 SCN.add(new THREE.HemisphereLight(0x36415a,0x0c0d10,.62));
 if(!mn3Lite()){const m3=new THREE.DirectionalLight(0x66789f,.22);m3.position.set(-.7,1,.35);SCN.add(m3)}
 MN3.fL1=new THREE.PointLight(0xff9440,2.9,7,2);SCN.add(MN3.fL1);
 MN3.fL2=new THREE.PointLight(0xffb050,1.1,2.2,2);SCN.add(MN3.fL2);
 MN3.fL3=new THREE.PointLight(0xffdca0,2.2,16,2);SCN.add(MN3.fL3);
 const R=MN3.root=new THREE.Group();SCN.add(R);
 const lam=k=>new THREE.MeshLambertMaterial({color:k});
 // chão escuro + terra queimada na fogueira
 const gnd=new THREE.Mesh(new THREE.CircleGeometry(160,24),lam(0x0d0b0a));gnd.rotation.x=-Math.PI/2;R.add(gnd);
 const bu=new THREE.Mesh(new THREE.CircleGeometry(1.1,20),new THREE.MeshBasicMaterial({color:0x241812,transparent:true,opacity:.5,depthWrite:false}));
 bu.rotation.x=-Math.PI/2;bu.position.y=.012;R.add(bu);
 // fogueira (em (0,0,0), objeto): pedras + brasa + troncos + chamas + faíscas
 const STO=new THREE.IcosahedronGeometry(.13,0);
 for(let i=0;i<9;i++){const a=i/9*6.2832,m=new THREE.Mesh(STO,lam(0x433f3d));
  m.position.set(Math.cos(a)*.42+(i*37%7)*.012,.05,Math.sin(a)*.42+(i*37%7)*.012);
  m.rotation.set(i%3*.4,i*1.3,i%5*.3);m.scale.set(1,.72,1);R.add(m)}
 const bru=new THREE.Mesh(new THREE.CylinderGeometry(.28,.33,.08,9),lam(0x8a3412));
 bru.position.set(0,.04,0);R.add(bru);
 {const lb=new THREE.BoxGeometry(.55,.09,.09);
  for(let i=0;i<3;i++){const a=i*2.094,lo=new THREE.Mesh(lb,lam(0x2f2118));
   lo.position.set(Math.cos(a)*.14,.06+i*.035,Math.sin(a)*.14);
   lo.rotation.set(.4*Math.sin(a+1.05),a,0);R.add(lo)}}
 const CC=[0xff8c2a,0xffb43a,0xffd76a,0xff9a30];
 for(let i=0;i<4;i++){const a=i*1.57+.5,f=new THREE.Mesh(new THREE.ConeGeometry(.17,.80,6),
  new THREE.MeshBasicMaterial({color:CC[i],fog:false}));
  f.position.set(Math.cos(a)*.07,.40+(i%2)*.12,Math.sin(a)*.07);
  f.rotation.set((i%2?1:-1)*.5,0,(i%3?1:-1)*.45);
  f.userData={ry:f.rotation.y,ph:i*1.7};MN3.flm.push(f);R.add(f)}
 MN3.flh=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0xffe4a0,fog:false}));
 MN3.flh.position.set(0,.34,0);R.add(MN3.flh);
 {const NS=mn3Lite()?14:40,PS=new Float32Array(NS*3);
  for(let i=0;i<NS;i++)MN3.spkd.push({y:Math.random()*.7,vy:.8+Math.random()*1.8,
   x:(Math.random()-.5)*.12,z:(Math.random()-.5)*.12,ph:Math.random()*7,top:.05+Math.random()*.5});
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(PS,3));
  MN3.spk=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffb668,size:.05,transparent:true,opacity:.8,
   blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  MN3.spk.frustumCulled=false;R.add(MN3.spk)}
 // jogador sentado no tronco-banco, sem arma, virado para o fogo
 {const bn=new THREE.Group();bn.position.set(.76,0,.30);bn.rotation.y=1.10;
  const bl=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.7,8),lam(0x4a3b28));
  bl.rotation.x=Math.PI/2;bn.add(bl);R.add(bn)}
 MN3.pg=new THREE.Group();
 {const cc=rgbOf(pgHex(MN3_C));let nn=0;
  for(let ni=0;ni<PG.NN;ni++){if(!JG_BASE[ni]||ni===PG.WS)continue;
   const geo=jgNodeGeo(ni,-1,cc,cc);if(!geo)continue;
   const m=new THREE.Mesh(geo,jgMat());m.matrixAutoUpdate=false;m.frustumCulled=false;m.userData={ni:ni};
   MN3.pg.add(m);MN3.msh.push(m);nn++}
  if(!nn)return 0}
 MN3.pg.visible=true;R.add(MN3.pg);
 // graveto + linguiça (ancorado no weapon_socket via WT por quadro)
 MN3.stk=new THREE.Group();MN3.stk.rotation.order='YXZ';
 {const L=.92,sh=new THREE.Mesh(new THREE.CylinderGeometry(.008,.010,L,6),lam(0xa3754a));
  sh.rotation.x=Math.PI/2;sh.position.set(0,0,L*.5);MN3.stk.add(sh);
  MN3.sau=new THREE.Mesh(new THREE.CylinderGeometry(.045,.042,.13,10),lam(0xb04a3a));
  MN3.sau.material.emissive=new THREE.Color(0x571408);MN3.sau.material.emissiveIntensity=.9;
  MN3.sau.rotation.x=Math.PI/2;MN3.sau.position.set(0,0,L+.04);MN3.stk.add(MN3.sau);
  for(const dz of[L+.005,L+.09]){const mk=new THREE.Mesh(new THREE.CylinderGeometry(.046,.046,.014,10),lam(0x40200e));
   mk.rotation.x=Math.PI/2;mk.position.set(0,0,dz);MN3.stk.add(mk)}}
 MN3.pg.add(MN3.stk);
 {const bp=new THREE.Mesh(new THREE.BoxGeometry(.16,.20,.09),lam(0x2e4a2c));
  bp.position.set(1.15,.12,.10);bp.rotation.y=-.4;R.add(bp)}
 // halo/core da lâmpada + névoa (sprites) + vinheta (filha da câmera)
 {MN3.glowObj=new THREE.Sprite(new THREE.SpriteMaterial({map:mn3TexRad('rgba(255,226,168,.9)','rgba(255,198,120,.38)'),
   transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  MN3.glowObj.renderOrder=3;SCN.add(MN3.glowObj);
  MN3.coreObj=new THREE.Sprite(new THREE.SpriteMaterial({map:mn3TexRad('rgba(255,250,232,1)','rgba(255,226,164,.75)'),
   transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  MN3.coreObj.renderOrder=3;SCN.add(MN3.coreObj)}
 {const ft=mn3TexFog();
  for(let i=0;i<3;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ft,transparent:true,
   opacity:.40-.10*i,depthWrite:false}));
   s.renderOrder=2;s.frustumCulled=false;SCN.add(s);MN3.fogS.push(s)}}
 {MN3.vig=new THREE.Sprite(new THREE.SpriteMaterial({map:mn3TexVig(),transparent:true,depthWrite:false,depthTest:false}));
  MN3.vig.renderOrder=9;MN3.vig.frustumCulled=false;MN3.cam.add(MN3.vig)}
 // poeira no cone: Points em coords de MUNDO (oculta atrás do jogador como no 2D)
 {const N=mn3Lite()?20:44,PS=new Float32Array(N*3),CS=new Float32Array(N*3);
  for(let i=0;i<N;i++)MN3.dustA.push({t:.08+.90*mn3R(i*3+1),u:(mn3R(i*3+2)*2-1)*.9,
   sp:2.2+6*mn3R(i*3+1),ph:mn3R(i*3+2)*6.28});
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.BufferAttribute(PS,3));
  sg.setAttribute('color',new THREE.BufferAttribute(CS,3));
  MN3.dust=new THREE.Points(sg,new THREE.PointsMaterial({vertexColors:true,size:.02,transparent:true,
   blending:THREE.AdditiveBlending,depthWrite:false}));
  MN3.dust.frustumCulled=false;MN3.dust.renderOrder=4;SCN.add(MN3.dust)}
 // olhos vermelhos (pairs): raio da câmera por (fx,fy), tamanho via d relativo
 {const cv=document.createElement('canvas');cv.width=60;cv.height=28;const c=cv.getContext('2d');
  if(c)for(const px of[19,41]){let g=c.createRadialGradient(px,14,0,px,14,10.4);
   g.addColorStop(0,'rgba(210,26,20,.55)');g.addColorStop(.30,'rgba(170,14,12,.24)');g.addColorStop(1,'rgba(110,8,8,0)');
   c.fillStyle=g;c.beginPath();c.arc(px,14,10.4,0,7);c.fill();
   c.save();c.translate(px,14);c.scale(2.6,1);g=c.createRadialGradient(0,0,0,0,0,8.8);
   g.addColorStop(0,'rgba(255,60,44,.55)');g.addColorStop(.35,'rgba(230,26,20,.22)');g.addColorStop(1,'rgba(160,10,10,0)');
   c.fillStyle=g;c.beginPath();c.arc(0,0,8.8,0,7);c.fill();c.restore();
   g=c.createRadialGradient(px,14,0,px,14,3.8);
   g.addColorStop(0,'rgba(255,244,232,1)');g.addColorStop(.42,'rgba(255,68,48,1)');g.addColorStop(1,'rgba(180,16,12,0)');
   c.fillStyle=g;c.beginPath();c.arc(px,14,3.8,0,7);c.fill()}
  const tx=new THREE.CanvasTexture(cv);
  for(let i=0;i<(mn3Lite()?18:40);i++){
   const v=mn3R(i+7),v2=mn3R(i+97),v3=mn3R(i+43),v4=mn3R(i+91),v5=mn3R(i+31);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,fog:false,
    opacity:0,blending:THREE.AdditiveBlending}));
   sp.renderOrder=1;sp.frustumCulled=false;MN3.scn.add(sp);
   const ex=.04+.92*v,ey=.21+.60*v2;
   MN3.eyes.push({sp,fx:ex,fy:ey,d:13+16*v3,w:.023+.016*v4,
    a:(.40+.60*(1-Math.min(1,Math.hypot(ex-.5,ey-.5))))*(.40+.60*v3),
    pc:2400+7000*v5,ph:v2,os:900+1400*v4,os2:1500+2200*v5})}}
 // GLBs do jogo: poste (índice 8), cerca (26), rua_reta (CEN_RGLB 0)
 try{if(typeof CENGLB!=='undefined'&&CENGLB[8])mn3Glb(CENGLB[8],M=>{MN3.pole=M;if(M&&M.grp&&MN3.scn)MN3.scn.add(M.grp);if(MN3.scn)mn3Place()})}catch(e){}
 try{if(typeof CENGLB!=='undefined'&&CENGLB[26])mn3Glb(CENGLB[26],M=>{
  MN3.cbb=M.bb;MN3.cerca=[];
  for(let i=0;i<7;i++){const g2=M.grp.clone();MN3.scn.add(g2);MN3.cerca.push(g2)}
  if(MN3.scn)mn3Place()})}catch(e){}
 try{if(typeof CEN_RGLB!=='undefined'&&CEN_RGLB[0])mn3Glb(CEN_RGLB[0],M=>{
  MN3.street=M.grp;MN3.sbb=M.bb;MN3.scn.add(M.grp);if(MN3.scn)mn3Place()})}catch(e){}
 mn3Extras();
 return 1}
// ---------- câmera/projeção: FOV 40, y=.60, eixo no alvo levantado 14,1° (horizonte 0.845H) ----------
function mn3CamPose(){const c=MN3.cam;
 if(c.aspect!==innerWidth/innerHeight){c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix()}
 c.position.set(0,.60,0);c.rotation.order='YXZ';c.lookAt(0,.60+10.02,-40);
 c.updateMatrixWorld(true);c.getWorldDirection(MN3.fwd)}
// reposiciona TUDO por raios da câmera (build 1x + em cada mudança de tamanho)
function mn3Place(){
 if(!MN3.scn||!MN3.cam)return;
 mn3CamPose();MN3.ck=innerWidth+'x'+innerHeight;
 const p=new THREE.Vector3(),q=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 // jogador: pé (0.723,.92) d 11.7; fogo (0.645,.923) d 10.9 → origem do root no fogo
 const fk=Math.max(1,1.58/Math.max(.4,innerWidth/innerHeight)); // tela estreita: afasta o fogo p/ não cobrir o jogador
 mn3RP(.723,.92,11.7,p);mn3RP(.723-.078*fk,.923,10.9,q);
 MN3.root.position.set(q.x,0,q.z);
 MN3.pg.position.set(p.x-q.x,0,p.z-q.z);
 MN3.pg.rotation.y=-1.9; // de perfil para a fogueira (aprovado a olho; atan2 até o fogo deixava de frente p/ a câmera)

 MN3.flT.set(q.x-p.x,.38,q.z-p.z).applyAxisAngle(up,-MN3.pg.rotation.y);
 MN3.fL1.position.set(q.x,.55,q.z);MN3.fL2.position.set(q.x,.12,q.z);
 // poste: pé em (.795,.885) d 13.2; lâmpada em (.715,.284) d 13.2; escala mede o glb
 const PO=MN3.pole;
 if(PO&&PO.grp){mn3RP(.795,.885,13.2,p);
  const g2=PO.grp,bx=new THREE.Box3();
  g2.scale.setScalar(1);g2.rotation.set(0,-Math.PI/2,0);g2.position.set(0,0,0);g2.updateMatrixWorld(true);
  bx.setFromObject(g2);
  const H0=bx.max.y-bx.min.y;if(H0>.1){mn3RP(.715,.284,13.2,q);
   let k=q.y/H0;
   const put=()=>{g2.scale.setScalar(k);g2.position.set(0,-bx.min.y*k,0);g2.updateMatrixWorld(true);
    const b2=new THREE.Box3();b2.setFromObject(g2);
    g2.position.x+=p.x-(b2.min.x+b2.max.x)*.5;g2.position.z+=p.z-(b2.min.z+b2.max.z)*.5;
    g2.updateMatrixWorld(true);
    if(PO.lamp)MN3.lampP.copy(PO.lamp).applyMatrix4(g2.matrixWorld);
    else MN3.lampP.set(p.x,H0*k,p.z)};
   put();
   {const sy=v=>(1-v.clone().project(MN3.cam).y)/2,by=sy(new THREE.Vector3(p.x,0,p.z)),ly=sy(MN3.lampP);
    if(by-ly>.05){k*=(by-.284)/(by-ly);put()}}
   // halo/core/luz no ponto da lâmpada; cone do poste: ápice=lâmpada, pé=(.73,.98) d 11
   const dl=MN3.lampP.distanceTo(MN3.cam.position),rg=.16*.728*dl,r2=.055*.728*dl;
   MN3.glowObj.position.copy(MN3.lampP);MN3.glowObj.scale.set(rg*2,rg*2,1);
   MN3.coreObj.position.copy(MN3.lampP);MN3.coreObj.scale.set(r2*2,r2*2,1);
   MN3.fL3.position.copy(MN3.lampP);
   mn3RP(.73,.98,11,q);
   if(!MN3.cone){const tx=mn3TexRad('rgba(255,238,200,.30)','rgba(255,214,150,.20)'),
     m2=new THREE.MeshBasicMaterial({color:0xffffff,map:tx,transparent:false,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    MN3.cone=new THREE.Mesh(new THREE.ConeGeometry(1,2,24,1,true),m2);MN3.scn.add(MN3.cone)}
   const dt=q.clone().sub(MN3.lampP),len=dt.length();
   MN3.cone.position.copy(MN3.lampP).addScaledVector(dt,.5);
   MN3.cone.scale.set(1.15,Math.max(.3,len/2),1.15);
   MN3.cone.quaternion.setFromUnitVectors(up,dt.normalize());
   MN3.coneGeo=0}
 }else{mn3RP(.715,.284,13.2,q);MN3.lampP.copy(q)}
 // cerca: 7 peças nas fracs do 2D (fx .545+.052i), profundidade crescente (13.5+2i)
 if(MN3.cbb&&MN3.cerca.length){const bb=MN3.cbb,wN=Math.max(.05,bb[1]-bb[0]);
  for(let i=0;i<MN3.cerca.length;i++){const fx=.545+.052*i,fy=.862+.005*i,d=13.5+2*i,kk=.0529*d/wN;
   mn3RP(fx,fy,d,q);
   MN3.cerca[i].scale.setScalar(kk);MN3.cerca[i].rotation.y=.54;
   MN3.cerca[i].position.set(q.x,q.y-(bb[2])*kk,q.z)}}
 // rua: tile à esquerda, centro em (.74,.90) d 16, girado p/ correr de trás-esq p/ frente-dir
 if(MN3.street){mn3RP(.74,.90,16,q);const bb=MN3.sbb,L=Math.max(.5,bb[5]-bb[4]),ks=7/L;
  MN3.street.scale.setScalar(ks);MN3.street.rotation.y=.6;
  MN3.street.position.set(q.x-(bb[0]+bb[1])*.5*ks,-bb[2]*ks,q.z-(bb[4]+bb[5])*.5*ks)}
 // olhos: posição por raio + tamanho pela distância
 const hv=2*Math.tan(20*Math.PI/180);
 for(const e of MN3.eyes){mn3RP(e.fx,e.fy,e.d,q);
  e.sp.position.copy(q);const w=hv*e.d*e.w;e.sp.scale.set(w,w*14/30,1)}
 // névoa: 3 faixas (posições/tamanho por bandas a d fixo)
 const aH=innerWidth/innerHeight,hH=Math.atan(Math.tan(20*Math.PI/180)*aH);
 for(let i=0;i<3;i++){const d=MN3.fogD[i],hw=1.34*2*Math.tan(hH)*d,hh=(.095+.032*i)*hv*d;
  MN3.fogS[i].scale.set(hw,hh,1);MN3.fogS[i].userData={y:.58+.105*i}}
 // vinheta: filho da câmera a d 8, cobre a tela inteira
 if(MN3.vig){const d=8;MN3.vig.position.set(0,0,-d);
  MN3.vig.scale.set(hv*d*aH,hv*d,1)}
 // pontos de referência da poeira (triângulo do cone: lâmpada → pé)
 MN3.footP=q.clone();
 mn3PlaceX();
}
// casas do jogo (src/assets/casas, porta para +z = para a câmera) nos quadrados verdes do desenho do usuário
// + grama do jogo (#3a4a2b, GM_C.gr) no chão da frente (faixa vermelha do desenho), por baixo da rua (a rua tem 19 cm de altura)
const MN3_HS=[{i:1,fx:.41,fy:.88,wf:.169},{i:9,fx:.903,fy:.873,wf:.126}];
function mn3Extras(){
 MN3.hs=[];
 if(typeof GR_CASA!=='undefined')for(const c of MN3_HS){
  mn3Glb(GR_CASA[c.i],M=>{if(!M||!MN3.scn)return;MN3.scn.add(M.grp);
   const h={M,c,L:null};
   if(!mn3Lite()){h.L=new THREE.PointLight(0xffc880,1.5,16,2);MN3.scn.add(h.L)}
   MN3.hs.push(h);mn3Place()},{em:0x1c1e24,ds:true})}
 const gc=document.createElement('canvas');gc.width=gc.height=64;const x=gc.getContext('2d');
 if(x){let g=x.createLinearGradient(0,0,64,0);g.addColorStop(0,'#000');g.addColorStop(.38,'#fff');g.addColorStop(1,'#fff');
  x.fillStyle=g;x.fillRect(0,0,64,64);x.globalCompositeOperation='multiply';
  g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'#000');g.addColorStop(.35,'#fff');g.addColorStop(1,'#fff');
  x.fillStyle=g;x.fillRect(0,0,64,64)}
 const ge=new THREE.BufferGeometry();
 ge.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));
 ge.setAttribute('normal',new THREE.BufferAttribute(new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0]),3));
 // uv: FL(0,1) NL(0,0) NR(1,0) | FL NR FR(1,1)  (v=1 = lado de trás = some)
 ge.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,1,0,0,1,0,0,1,1,0,1,1]),2));
 MN3.grass=new THREE.Mesh(ge,new THREE.MeshLambertMaterial({color:0x3a4a2b,emissive:0x1d2915,alphaMap:new THREE.CanvasTexture(gc),
  transparent:true,depthWrite:false,side:THREE.DoubleSide}));
 MN3.grass.frustumCulled=false;MN3.grass.renderOrder=0;MN3.scn.add(MN3.grass)}
// ponto do CHÃO (y=0) sob uma fração de tela; devolve a profundidade
function mn3Ground(fx,fy,out){mn3RP(fx,fy,1,out);const c=MN3.cam.position,dy=out.y-c.y;
 if(dy>=-1e-4){out.set(c.x,0,c.z-30);return 30}
 const t=-c.y/dy;out.sub(c).multiplyScalar(t).add(c);out.y=0;return t}
function mn3PlaceX(){
 const q=new THREE.Vector3(),asp=innerWidth/innerHeight,nar=asp<1,hv=Math.tan(20*Math.PI/180);
 for(const h of MN3.hs){const c=h.c,bb=h.M.bb,fx=nar?(c.i==1?.22:.86):c.fx;
  const d=mn3Ground(fx,c.fy,q),k=1.2*c.wf*(nar?.55:1)*2*d*hv*1.58/Math.max(.5,bb[1]-bb[0]);
  h.M.grp.scale.setScalar(k);h.M.grp.rotation.y=0;
  h.M.grp.position.set(q.x-(bb[0]+bb[1])*.5*k,-bb[2]*k,q.z-(bb[4]+bb[5])*.5*k);
  if(h.L)h.L.position.set(q.x,2.2,q.z+(bb[5]-bb[4])*.5*k+2.2)}
 if(MN3.grass){const P=MN3.grass.geometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),cc=new THREE.Vector3(),e=new THREE.Vector3();
  mn3Ground(.22,.925,a);mn3Ground(1.12,.925,e);mn3Ground(.22,1.04,b);mn3Ground(1.12,1.04,cc);
  const y=.012;P.setXYZ(0,a.x,y,a.z);P.setXYZ(1,b.x,y,b.z);P.setXYZ(2,cc.x,y,cc.z);
  P.setXYZ(3,a.x,y,a.z);P.setXYZ(4,cc.x,y,cc.z);P.setXYZ(5,e.x,y,e.z);P.needsUpdate=true}}
// ---------- frame: clamp adversas/piscar/respawn com buffers pré-alocados ----------
function glMenuFrame(t){
 if(!glLive||GLBAD||!GLR)return 0;
 try{
  if(!MN3.scn){if(!mn3Build())return 0;mn3Place()}
  const ck=innerWidth+'x'+innerHeight;
  if(MN3.ck!==ck)mn3Place();
  const dp=Math.min(window.devicePixelRatio||1,2)*GQ.scale,cw=innerWidth*dp|0,ch=innerHeight*dp|0;
  if(GLCV.width!==cw||GLCV.height!==ch){GLR.setPixelRatio(dp);GLR.setSize(innerWidth,innerHeight,false)}
  const w=performance.now(),fl=Math.max(.5,Math.min(1.18,mn3Flick(w))),flL=mn3FlickL(w);
  MN3.fL1.intensity=2.9*fl;MN3.fL2.intensity=.9*fl+.3;MN3.fL3.intensity=2.2*flL;
  // chamas (cintilar) + miolo quente
  for(let i=0;i<MN3.flm.length;i++){const f=MN3.flm[i],pd=1+.15*Math.sin(w*.0111+f.userData.ph)+.06*Math.sin(w*.031+f.userData.ph*2);
   f.scale.set(pd,.85+.3*fl,pd);f.rotation.y=f.userData.ry+w*.00035*(i%2?1:-1)}
  MN3.flh.scale.setScalar(1+.25*fl);MN3.flh.position.y=.30+.12*fl;
  MN3.spk.material.opacity=Math.min(1,.35+.55*fl);
  {const P=MN3.spk.geometry.attributes.position;
   for(let i=0;i<MN3.spkd.length;i++){const s=MN3.spkd[i];s.y+=s.vy*(innerWidth<640?.9:.55)*.016;
    if(s.y>s.top){s.y=.03+Math.random()*.05;s.vy=.8+Math.random()*1.8;s.x=(Math.random()-.5)*.12;s.z=(Math.random()-.5)*.12}
    P.array[i*3]=s.x+Math.sin(w*.0012+s.ph)*.09;P.array[i*3+1]=s.y;P.array[i*3+2]=s.z}
   P.needsUpdate=true}
  // jogador: pose sentada + matrizes por nó
  mn3Pose(t);
  MN3.pg.position.y=0;
  {const R=PG.WRT,Wt=PG.WT;
   for(let i=0;i<MN3.msh.length;i++){const m=MN3.msh[i],ni=m.userData.ni,q=ni*9;
    m.matrix.set(R[q],R[q+1],R[q+2],Wt[ni*3],
     R[q+3],R[q+4],R[q+5],Wt[ni*3+1],
     R[q+6],R[q+7],R[q+8],Wt[ni*3+2],0,0,0,1);
    m.matrixWorldNeedsUpdate=true}}
  // graveto: da mão (weapon_socket) até o fogo — linguiça SOBRE as chamas
  {const ws=PG.WS*3,wx=PG.WT[ws],wy=PG.WT[ws+1],wz=PG.WT[ws+2];
   MN3.stk.position.set(wx,wy,wz);
   const dx=MN3.flT.x-wx,dz=MN3.flT.z-wz,dn=Math.hypot(dx,dz)||1;
   MN3.stk.rotation.set(Math.atan2(wy-MN3.flT.y,dn)+.02*Math.sin(t/760),
    Math.atan2(dx,dz)+.035*Math.sin(t/1450),0);
   if(MN3.sau)MN3.sau.material.emissiveIntensity=.45+.55*fl}
  // halo/core da lâmpada cintila
  MN3.glowObj.material.opacity=.92*flL;MN3.coreObj.material.opacity=.95*flL;
  // poeira no cone: fy↓ + deriva; brilho no atributo cor (aditivo)
  {const P=MN3.dust.geometry.attributes.position,Ca=MN3.dust.geometry.attributes.color,
    lamp=MN3.lampP,foo=MN3.footP;
   for(let i=0;i<MN3.dustA.length;i++){const s=MN3.dustA[i],fy=(s.t+w*s.sp*.00006)%1,
     ux=s.u*.85+Math.sin(w/5200+s.ph)*.12;
    P.array[i*3]=lamp.x+(foo.x-lamp.x)*fy+ux*.22;
    P.array[i*3+1]=lamp.y+(0-lamp.y)*fy+Math.sin(w/3100+s.ph*2)*.05;
    P.array[i*3+2]=lamp.z+(foo.z-lamp.z)*fy;
    const a=.16*(1-fy*.45)*(1-Math.abs(ux))*flL;
    Ca.array[i*3]=Math.min(1,a);Ca.array[i*3+1]=Math.min(1,.91*a);Ca.array[i*3+2]=Math.min(1,.75*a)}
   P.needsUpdate=true;Ca.needsUpdate=true}
  // névoa: desliza horizontal (centro fx = (ph*2-1)*.30 + .53)
  for(let i=0;i<3;i++){const ph=(w/(11000+i*5300)+i*.41)%1;
   mn3RP((ph*2-1)*.30+.53,MN3.fogS[i].userData.y,MN3.fogD[i],MN3.u1);
   MN3.fogS[i].position.copy(MN3.u1)}
  // olhos: piscar + deriva leve; vinheta por cima
  for(const e of MN3.eyes){const bl=(t/e.pc+e.ph)%1;
   e.sp.material.opacity=bl<.045?0:e.a*(.76+.24*Math.sin(t/e.os+e.ph*6.283))}
  GLR.render(MN3.scn,MN3.cam);
  return 1
 }catch(e){try{console.warn('glmenu3d',e)}catch(e2){}return 0}
}


