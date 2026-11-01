// ---------- 89j-glfx.js — M5: efeitos de combate em 3D (SÓ com glLive) ----------
// Migrados para o MESMO `scene` do 3D, na ordem de custo da spec: (1) tiro das 6 armas (clarão, rastro,
// fagulhas, fumaça, cartucho e o jato do lança-chamas) — FXL; (2) fogo de carros/barris — FIRES;
// (3) partículas PT e peças voando FL2; (4) projéteis do boss Pj; (5) texto flutuante FT + level-up (DOM
// com w2s, como o M4); (6) tremor QK já vai pela câmera (GL_SHX/GL_SHY, 90-sons.js:462) — nada a fazer aqui.
// Sem a flag (e depois de glKill()) NADA muda: drawFX()/drawProj() do canvas 2D continuam sendo usados.
// Técnica: 1 InstancedMesh de quad billboard aditivo (clarão/fagulha/fumaça/chama/partícula), 1 InstancedMesh
// de caixa (peças e projéteis) e 1 InstancedMesh de anel (level-up, criado só quando aparece). Pool fixo,
// nada alocado por quadro; as contagens são publicadas no glFxEnd() (glRenderNow, 88-gl.js).
// Deslocamento de TELA (dx,dy em px de mundo, dy>0 = para BAIXO) vira altura `hp - dy/GLSIN`, porque na câmera
// 3D a altura h de um ponto sobe a tela h*sin(55°)*ZO — mesma conta do 89f-glitens.js.
// Qualidade: GQ.fxP (fração de partículas/chamas/fumaça; 1 = tudo). M7a: o canvas 2D fica OCULTO na partida,
// então NÃO existe mais fallback 2D dos efeitos — eles são sempre 3D com glLive (GQ.fx não desliga mais).
const FX_MAX=1500,FX_BMAX=120,FX_KY=GLSIN*GLSIN+GLCOS;
const FXPK={2:[46,14,26],11:[22,22,20],12:[8,26,8],13:[22,6,16],0:[20,10,14]};
const FXPC={2:'#2a3040',11:'#2d5a27',12:'#6a4a2a',13:'#b8843a'};
const FXPJ={2:[92,24,26],3:[36,36,36],1:[26,26,26],11:[22,22,22],12:[8,28,8]};
const FXPJC={2:'#1c2a3a',3:'#b84',1:'#2d5a27',11:'#2d5a27',12:'#6a4a2a'};
let FX_BB=null,FX_BBN=0,FX_TEX=null,FX_GB=null,FX_GBN=0,FX_GTEX=null,FX_BX=null,FX_BXN=0,FX_WARN=0;
let FX_TN=0,FX_TC=0;const FX_T=[],FX_CB={};
let FX_MS=0,FX_FR=0;
const FX_Q=new THREE.Quaternion(),FX_Q2=new THREE.Quaternion(),FX_RT=new THREE.Quaternion(),
 FX_AX=new THREE.Vector3(0,0,1),FX_AY=new THREE.Vector3(0,1,0),
 FX_S=new THREE.Vector3(),FX_P=new THREE.Vector3(),FX_M=new THREE.Matrix4(),FX_C=new THREE.Color();
function fxQ(){return GQ.fxP>0?GQ.fxP:1}
function fxRgb(c){
 const v=FX_CB[c];if(v)return v;
 let r=1,g=1,b=1;
 if(typeof c==='string'){let h=c.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length>=6){const a=parseInt(h.slice(0,2),16),d=parseInt(h.slice(2,4),16),e=parseInt(h.slice(4,6),16);
   if(a==a&&d==d&&e==e){r=a/255;g=d/255;b=e/255}}}
 const o=[r,g,b];FX_CB[c]=o;return o}
function fxHsl(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
 return[f(0),f(8),f(4)]}
function fxTex(ring){
 const cv=document.createElement('canvas');cv.width=cv.height=64;const c2=cv.getContext('2d');if(!c2)return null;
 if(ring){c2.strokeStyle='rgba(255,255,255,.45)';c2.lineWidth=14;c2.beginPath();c2.arc(32,32,25,0,7);c2.stroke();
  c2.strokeStyle='rgba(255,255,255,1)';c2.lineWidth=6;c2.beginPath();c2.arc(32,32,25,0,7);c2.stroke()}
 else{const g2=c2.createRadialGradient(32,32,0,32,32,32);
  g2.addColorStop(0,'rgba(255,255,255,1)');g2.addColorStop(.35,'rgba(255,255,255,.55)');g2.addColorStop(1,'rgba(255,255,255,0)');
  c2.fillStyle=g2;c2.fillRect(0,0,64,64)}
 return new THREE.CanvasTexture(cv)}
function fxInit(){
 if(FX_BB)return 1;
 if(!GLW||typeof THREE==='undefined')return 0;
 try{
  FX_TEX=fxTex(0);
  FX_BB=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),
   new THREE.MeshBasicMaterial({map:FX_TEX,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),FX_MAX);
  FX_BB.frustumCulled=false;FX_BB.count=0;FX_BB.visible=false;FX_BB.renderOrder=13;
  try{FX_BB.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
  GLW.add(FX_BB);
  FX_BX=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({}),FX_BMAX);
  FX_BX.frustumCulled=false;FX_BX.count=0;FX_BX.visible=false;
  try{FX_BX.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
  GLW.add(FX_BX);
 }catch(e){FX_BB=null;return 0}
 return 1}
// ---------- primitivas ----------
// billboard aditivo; a cor JÁ vem multiplicada pelo alpha (o blending aditivo não tem alpha por instância)
function fxBb(x,h,y,r,cr,cg,cb){
 if(FX_BBN>=FX_MAX)return;
 FX_P.set(x,h,y);FX_S.set(r,r/FX_KY,r);
 FX_M.compose(FX_P,FX_Q,FX_S);
 const i=FX_BBN++;FX_BB.setMatrixAt(i,FX_M);FX_BB.setColorAt(i,FX_C.setRGB(cr,cg,cb))}
// billboard girado no plano da tela (ang = atan2 do 2D; rx/ry = semi-eixos em px)
function fxBbR(x,h,y,rx,ry,ang,cr,cg,cb){
 if(FX_BBN>=FX_MAX)return;
 FX_P.set(x,h,y);FX_S.set(rx,ry/FX_KY,1);
 FX_Q2.copy(FX_Q).multiply(FX_RT.setFromAxisAngle(FX_AX,-ang));
 FX_M.compose(FX_P,FX_Q2,FX_S);
 const i=FX_BBN++;FX_BB.setMatrixAt(i,FX_M);FX_BB.setColorAt(i,FX_C.setRGB(cr,cg,cb))}
// a partir do ponto 3D (wx,wy, altura hp em px) + deslocamento de TELA (dx,dy) em px de mundo
function fxBbS(wx,wy,hp,dx,dy,r,cr,cg,cb){fxBb(wx+dx,hp-dy/GLSIN,wy,r,cr,cg,cb)}
function fxBbSR(wx,wy,hp,dx,dy,rx,ry,ang,cr,cg,cb){fxBbR(wx+dx,hp-dy/GLSIN,wy,rx,ry,ang,cr,cg,cb)}
// anel (level-up): mesmo billboard, outra textura
function fxRing(x,h,y,r,cr,cg,cb){
 if(!FX_GB){
  if(!FX_GTEX)FX_GTEX=fxTex(1);
  FX_GB=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),
   new THREE.MeshBasicMaterial({map:FX_GTEX,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),160);
  FX_GB.frustumCulled=false;FX_GB.count=0;FX_GB.visible=false;FX_GB.renderOrder=13;
  try{FX_GB.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}catch(e){}
  GLW.add(FX_GB)}
 if(FX_GBN>=160)return;
 FX_P.set(x,h,y);FX_S.set(r,r*.346/FX_KY,r);
 FX_M.compose(FX_P,FX_Q,FX_S);
 const i=FX_GBN++;FX_GB.setMatrixAt(i,FX_M);FX_GB.setColorAt(i,FX_C.setRGB(cr,cg,cb))}
// caixa opaca (peças voando e projéteis do boss)
function fxBox(x,y,h,sx,sy,sz,ang,c){
 if(!FX_BX||FX_BXN>=FX_BMAX)return;
 const q=fxRgb(c);
 FX_P.set(x,h,y);FX_S.set(sx,sy,sz);
 FX_RT.setFromAxisAngle(FX_AY,ang||0);
 FX_M.compose(FX_P,FX_RT,FX_S);
 const i=FX_BXN++;FX_BX.setMatrixAt(i,FX_M);FX_BX.setColorAt(i,FX_C.setRGB(q[0],q[1],q[2]))}
// ---------- (1) tiro: clarão, rastro, fagulhas, fumaça, cartucho e lança-chamas ----------
let W4N={},W4S={},FX_MZB={i:0,x:0,h:0,y:0};
function fxShot(q,now){
 const f=q.f,w=f[4];
 const age=(now-q.t)/1000;if(age<0)return;
 // referência: boca do cano em 3D quando este cliente atirou (mzW); senão o ponto 2D do tiro
 let wx=f[0],wy=f[1],hp=24/GLSIN;
 const mw=q.mw;
 if(mw){wx=mw[0];wy=mw[1];hp=mw[2]}
 if(f[6]===-1)hp=TUR_H; // torreta da Área Segura (telhado)
 const sx=wx,sy=wy-hp*GLSIN,ex=f[2],ey=f[3]-18;
 const L0=Math.hypot(ex-sx,ey-sy)||1,ux=(ex-sx)/L0,uy=(ey-sy)/L0,ua=Math.atan2(uy,ux),nx=-uy,ny=ux;
 if(w==4){ // lança-chamas: jato CONTÍNUO no plano do chão (só o evento mais novo de cada atirador; bolhas fluem do cano ao alvo)
  const sh=f[6];if(q.t<(W4N[sh]||0))return;
  const dx=f[2]-wx,dy=f[3]-wy,Lg=Math.hypot(dx,dy)||1,gx=dx/Lg,gy=dy/Lg,px=-gy,py=gx,LL=Lg+60,
   env=Math.min(1,(now-(W4S[sh]||q.t))/80)*Math.min(1,Math.max(0,(q.t+q.life-now)/160));
  if(env<=0)return;
  const n=Math.max(6,Math.round(30*fxQ()));
  for(let i=0;i<n;i++){const ph=(i/n+now/520)%1,cyc=Math.floor(i+now/520),j=Math.abs(Math.sin(i*12.9898+cyc*78.233)*43758.5453)%1,
   u=ph,off=(j-.5)*u*52,r=5+u*20*(.6+j*.7),k=u*LL*(.9+j*.2),c=fxHsl(52-u*44,1,(58-u*14)/100),al=(.8-u*.5)*env*Math.min(1,u*8),
   h=Math.max(10,hp*(1-u*.8)+u*14+(j-.5)*u*20);
   fxBb(wx+gx*k+px*off,h,wy+gy*k+py*off,r,c[0]*al,c[1]*al,c[2]*al)}
  return}
 // gx/gy = direção NO CHÃO (do cano ao alvo); anéis de fumaça ficam no plano vertical perpendicular a ela (visíveis de cima)
 const dgx=f[2]-wx,dgy=f[3]-wy,Lg=Math.hypot(dgx,dgy)||1,gx=dgx/Lg,gy=dgy/Lg,pgx=-gy,pgy=gx;
 const big=w==1||w==5,mfd=w==5?.26:w==1?.2:.12,mf=age<mfd?1-age/mfd:0,mr=[18,36,22,19,0,44][w]||18;
 // luz dinâmica do disparo (ilumina o entorno, sobretudo à noite): fica a mais forte do quadro
 if(mf>0&&typeof FX_MZB!=='undefined'){const it=mf*(big?2.6:1.5);if(it>FX_MZB.i){FX_MZB.i=it;FX_MZB.x=wx;FX_MZB.h=hp+6;FX_MZB.y=wy}}
 if(mf>0){
  fxBbS(wx,wy,hp,0,0,mr*(big?3.6:2.6),.2*mf,.08*mf,.02*mf);   // halo grande e fraco (bloom)
  fxBbS(wx,wy,hp,0,0,mr*1.7,.62*mf,.24*mf,.06*mf);            // halo laranja
  fxBbS(wx,wy,hp,0,0,mr*1.15,1.0*mf,.9*mf,.62*mf);            // núcleo quente
  fxBbS(wx,wy,hp,0,0,mr*.55,1*mf,1*mf,.95*mf);                // centro branco
  const ns=(big?9:5)+((q.t|0)%3),sl=(big?2.2:1.2)*mr*(1.1+mf*.9);
  for(let i=0;i<ns;i++){const an=ua+(i/(ns-1||1)-.5)*(big?1.9:1.5),r1=mr*.3,r2=sl*(.5+fxr(q.t,i+3)*.8),
   mx=(Math.cos(an)*r1+Math.cos(an)*r2)/2,my=(Math.sin(an)*r1+Math.sin(an)*r2)/2,ln=Math.abs(r2-r1)/2;
   fxBbSR(wx,wy,hp,mx,my,ln,big?2.2:1.6,an,.85*mf,.7*mf,.45*mf)}
  if(big){ // chama longa do cano (cone): várias camadas para a frente
   const cl=(w==5?46:38)+mf*(w==5?130:105);
   for(let i=0;i<(w==1?5:3);i++){const an=ua+(w==1?(i-2)*.3:(i-1)*.12);
    fxBbSR(wx,wy,hp,Math.cos(an)*cl*.55,Math.sin(an)*cl*.55,cl*.55,w==1?cl*.28:cl*.13,an,.55*mf,.3*mf,.08*mf)}
   fxBbSR(wx,wy,hp,Math.cos(ua)*cl*.45,Math.sin(ua)*cl*.45,cl*.5,cl*.07,ua,1*mf,.9*mf,.65*mf)}}
 const gl=age<.2?1-age/.2:0; // clarão no chão em volta
 if(gl>0)fxBbS(wx,wy,hp,0,0,big?150:90,.24*gl,.17*gl,.07*gl);
 if(age<.16){const sk=1-age/.16,nsk=(big?10:5)+((q.t>>3)%4);
  for(let i=0;i<nsk;i++){const an=ua+(fxr(q.t,i+9)-.5)*(big?1.2:.87),r1=3,r2=r1+(big?22:12)+fxr(q.t,i+21)*(big?36:18);
   fxBbSR(wx,wy,hp,Math.cos(an)*(r1+r2)/2,Math.sin(an)*(r1+r2)/2,(r2-r1)/2,big?1.6:1.2,an,.95*sk,.8*sk,.5*sk)}}
 // fumaça: nuvem que sobe e se espalha (mais volumosa e duradoura em escopeta/sniper)
 const sT=big?1.2:.7;
 if(age<sT){const nsm=Math.max(2,Math.round((w==1?9:w==5?7:3)*fxQ())),sa=1-age/sT;
  for(let i=0;i<nsm;i++){const ph=fxr(q.t,i+31),r=(big?7:4)+age*(big?34:20)*(.7+ph*.6),al=(big?.5:.36)*sa*(1-i*.06),
   dd=age*(big?70:34)*(.5+ph);
   fxBbS(wx,wy,hp,nx*(ph-.5)*(big?44:24)+ux*dd,ny*(ph-.5)*(big?44:24)+uy*dd-age*(big?46:36)-i*2.5,r,.84*al,.84*al,.82*al)}}
 // anéis de fumaça com FURO no meio saindo do cano (sniper: 3, escopeta: 1 pequeno)
 if(w==5||w==1){const nr=w==5?3:1;
  for(let j=0;j<nr;j++){const ra=age-j*.1;if(ra<0||ra>.95)continue;const u=ra/.95,rad=(w==5?7:5)+u*(w==5?46:24),dist=18+ra*(w==5?250:150),al=(1-u)*(w==5?.62:.4),np=14,sz=Math.max(2.4,rad*.34);
   for(let k=0;k<np;k++){const a=k/np*6.2832+j*.4,cs=Math.cos(a)*rad,sn=Math.sin(a)*rad;
    fxBbS(wx+gx*dist,wy+gy*dist,hp+u*14,cs,sn*.9,sz,.88*al,.9*al,.95*al)}}} // anel voltado para a câmera (visível em qualquer direção de tiro)
 if(w!=4&&age<.5){const ct=age/.5,c=fxRgb(w==1?'#c33':'#e8c25a'); // cartucho ejetado
  fxBbSR(wx,wy,hp,nx*(14+ct*70),ny*(14+ct*70)-ct*100+ct*ct*160,2.4,3.4,ct*9,c[0],c[1],c[2])}
 // rastro: velocidade/comprimento do 2D (SPD/ln); sniper = risca o ar inteiro até o alvo e deixa ondas de choque
 const spd=SPD[w],pos=age*spd,tc=w==5?[.86,.94,1]:w==1?[1,.59,.2]:[1,.78,.35];
 const n=w==1?9:1,ln=w==5?L0:w==2?32:w==1?9:16;
 for(let k=0;k<n;k++){const an=w==1?(k-4)*.075:0,ca=Math.cos(an),sa=Math.sin(an),vx=ux*ca-uy*sa,vy=ux*sa+uy*ca,
  q0=Math.min(pos,L0),q1=Math.max(pos-ln,0);if(q1>=q0)continue;
  const q2=Math.max(q0-(q0-q1)*.45,q1),a2=Math.atan2(vy,vx),fd=w==5?Math.max(0,1-age/.42):1;
  if(fd<=0&&w==5)continue;
  fxBbSR(wx,wy,hp,vx*(q0+q1)/2,vy*(q0+q1)/2,(q0-q1)/2,w==5?9:w==1?3.2:4.2,a2,tc[0]*.2*fd,tc[1]*.2*fd,tc[2]*.2*fd); // banda larga suave
  fxBbSR(wx,wy,hp,vx*(q0+q2)/2,vy*(q0+q2)/2,(q0-q2)/2,w==5?2.6:w==1?1.6:2.3,a2,tc[0]*.95*fd,tc[1]*.95*fd,tc[2]*.95*fd); // fio forte
  if(w!=1){fxBbS(wx,wy,hp,vx*q0,vy*q0,w==5?7:6,tc[0]*.5,tc[1]*.5,tc[2]*.5);
   fxBbS(wx,wy,hp,vx*q0,vy*q0,w==5?3:2.4,1,1,1)}
  else{fxBbS(wx,wy,hp,vx*q0,vy*q0,3.2,1,.7,.3)}}
 if(w==5){ // ondas de choque ("cortando o som"): anéis finos a cada 64 px do caminho, que se abrem e somem
  const nR=Math.min(14,Math.floor(Math.min(pos,L0)/64));
  for(let k=1;k<=nR;k++){const ra=(pos-k*64)/spd;if(ra<0||ra>.4)continue;const u=ra/.4,rad=4+u*34,al=(1-u)*.55,bx=sx+ux*k*64,by=sy+uy*k*64,hgt=hp-(by-wy)/GLSIN*0+0;
   for(let m=0;m<10;m++){const a=m/10*6.2832,cs=Math.cos(a)*rad,sn=Math.sin(a)*rad;
    fxBbS(wx+gx*Lg*(k*64/L0),wy+gy*Lg*(k*64/L0),hp-(k*64/L0)*(hp-14),cs,sn*.9,2.6,.7*al,.85*al,1*al)}}}
 if(pos>=L0){const ia=(pos-L0)/spd;
  if(ia<(big?.26:.16)){for(let k=0;k<(big?9:5);k++){const an=k*1.3+q.t%7,r1=3+ia*(big?170:120),r2=r1+(big?11:7);
   fxBbSR(wx,wy,hp,ex-sx+Math.cos(an)*(r1+r2)/2,ey-sy+Math.sin(an)*(r1+r2)/2,big?5:3.5,1.4,an,.95,.7,.3)}}
  if(ia<(big?.16:.1)){const al=1-ia/(big?.16:.1);fxBbS(wx,wy,hp,ex-sx,ey-sy,(big?5:1)+(big?18:10)*al,.9*al,.88*al,.8*al)}}}
// ---------- (2) fogo de carros/barris (FIRES) ----------
function fxFire(x,y,sz,t){
 if(!(sz>0))return;
 fxBbS(x,y,0,0,-12*sz,70*sz,.35,.2,.05);                       // brilho de base
 const n=Math.max(2,Math.round(7*fxQ()));
 for(let i=0;i<n;i++){const ph=t/110+i*1.9+x*.01,h=(28+16*Math.sin(ph))*sz,w=(10+4*Math.sin(ph*1.3))*sz,o=(i-3)*5*sz;
  // línguas verticais (o 2D usa curvas com essa largura/altura): quad achatado em X e esticado em Y
  fxBbSR(x,y,0,o+Math.sin(ph*2)*4,-h*.5,w*.62,h*.62,i%2?.06:-.06,i%2?.5:.42,i%2?.12:.28,i%2?.04:.06);
  fxBbSR(x,y,0,o,-h*.36,w*.34,h*.38,0,.6,.4,.06)}                                  // núcleo amarelo
 const ns=Math.max(1,Math.round(3*fxQ()));
 for(let i=0;i<ns;i++){const u=(t/1400+i/3)%1,al=.35*(1-u);
  fxBbS(x,y,0,Math.sin(u*6+i)*10*sz,-30*sz-u*70*sz,(10+u*18)*sz,.16*al,.14*al,.18*al)}}
function fxFires(t){
 for(let i=0;i<FIRES.length;i++){const f=FIRES[i];
  if(!(Math.abs(f[0]-cx)<W/2+120&&Math.abs(f[1]-cy)<H/2+120))continue;
  if(f[4]&&f[4]===meB)continue;
  if(f[5]&&DD[f[5].i])continue;
  fxFire(f[0],f[1],f[2],t)}}
// ---------- (3) partículas PT e peças voando FL2 ----------
function fxBits(dt){
 const qm=fxQ();
 for(let i=0;i<FL2.length;i++){const f=FL2[i];
  f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=900*dt;f.r+=f.vr*dt;
  if(f.z<=0){f.z=0;f.vz=-f.vz*.35;f.vx*=.6;f.vy*=.6;f.vr*=.6;f.b++;if(f.b>=3)f.dead=1}
  const s=FXPK[f.k]||FXPK[0];
  fxBox(f.x,f.y,f.z/GLSIN,s[0],s[1],s[2],f.r*.5,f.c||FXPC[f.k]||'#b8843a')}
 FL2=FL2.filter(f=>!f.dead);
 const lim=Math.round(PT.length*(qm>=1?1:qm));
 for(let i=0;i<PT.length;i++){const p=PT[i];
  p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=520*dt;
  if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.7;p.vy*=.7}
  if(i<lim){const al=Math.max(0,1-p.t/p.l),c=fxRgb(p.c);
   fxBbS(p.x,p.y,p.z/GLSIN,0,0,p.s*.8,c[0]*al,c[1]*al,c[2]*al)}}
 PT=PT.filter(p=>p.t<p.l)}
// ---------- (4) projéteis do boss (Pj) ----------
// objeto arremessado = o MESMO modelo do cenário (árvore/carro/caixa de GPR.geo), escolhido pelo índice da origem (p[6]); sem modelo cai na caixa colorida
const FXPM=[];
function fxProjModel(k,oi){if(typeof GPR==='undefined'||!GPR.geo)return -1;const t=k==1?(oi%3):k==2?27+vehIdx({i:oi}):k==3?cenCrate(oi):-1;return t>=0&&GPR.geo[t]?t:-1}
function fxProj(s){
 const Pj=s&&s.Pj;let used=0;
 if(Pj)for(let i=0;i<Pj.length;i++){const p=Pj[i],k=p[0],sz=FXPJ[k]||FXPJ[2],t=fxProjModel(k,p[6]|0);
  if(t>=0&&GLW){let m=FXPM[used];if(!m){m=FXPM[used]=new THREE.Mesh(GPR.geo[t],gpMat());m.frustumCulled=false;GLW.add(m)}
   m.geometry=GPR.geo[t];const px=t>=27?VEH_PPM:GPR.pxm[t];m.scale.setScalar(px);m.position.set(p[2],Math.max(0,p[4]/GLSIN-14),p[3]);m.rotation.set(0,p[5]/100,0);m.visible=true;used++}
  else fxBox(p[2],p[3],p[4]/GLSIN,sz[0],sz[1],sz[2],p[5]/100,FXPJC[k]||p[1]||'#b8843a')}
 for(let i=used;i<FXPM.length;i++)FXPM[i].visible=false}
// ---------- (5) texto flutuante (FT), level-up (anéis/faíscas + rótulos) — DOM com w2s ----------
function fxDom(x,y,txt,col,sz,al){
 if(al<=.02)return;
 let o=FX_T[FX_TC];
 if(!o){const gw=$('gw');if(!gw||FX_TC>=140)return;
  const g=document.createElement('div'),i=document.createElement('div'),e=document.createElement('div');
  g.className='gwE';i.className='gwI';e.className='gwT';
  e.style.textShadow='-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000,1px 1px #000,-1px -1px #000';
  i.appendChild(e);g.appendChild(i);gw.appendChild(g);g.style.display='none';
  o={g:g,i:i,e:e,k:'',c:'',s:0,o:-1,tr:''};FX_T[FX_TC]=o}
 FX_TC++;
 if(o.k!==txt){o.k=txt;o.e.textContent=txt}
 if(o.c!==col){o.c=col;o.e.style.color=col}
 if(o.s!==sz){o.s=sz;o.e.style.fontSize=sz+'px'}
 const aq=Math.round(al*100)/100;if(o.o!==aq){o.o=aq;o.g.style.opacity=String(aq)}
 const p=w2s(x,y,0),tr='translate3d('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px,0)';
 if(o.tr!==tr){o.tr=tr;o.g.style.transform=tr}
 if(o.g.style.display==='none')o.g.style.display='block'}
function fxTexts(t){
 FT=FT.filter(f=>t-f.t<1100);
 for(let i=0;i<FT.length;i++){const f=FT[i],u=(t-f.t)/1100;fxDom(f.x,f.y-u*28,f.txt,f.col,f.sz,1-u*u)}
 LUE=LUE.filter(e=>t-e.t<1700);
 for(let i=0;i<LUE.length;i++){const e=LUE[i],r=RP['p'+e.pid];if(!r)continue;
  const u=(t-e.t)/1700,x=r.x,y=r.y;
  for(let k=0;k<4;k++){const v=(u*1.3+k*.2)%1.3,a=Math.max(0,.55-v*.42);if(a<=0)continue;
   fxRing(x,v*110/GLSIN,y,26*(1-v*.25),.35*a,.67*a,a)}
  for(let k=0;k<8;k++){const a=k*.8+u*6,yy=((u*1.2+k*.13)%1)*105,al=1-u;
   fxBb(x+Math.cos(a)*18,yy/GLSIN,y,2.2,.75*al,.88*al,al)}
  const labs=[['+ AGILIDADE','#ffe066'],['+ VIDA MÁX','#6bf06b'],['+ PRECISÃO','#7fe3ff']],
   al=u<.12?u/.12:Math.max(0,1-(u-.55)/.45);
  for(let k=0;k<3;k++)fxDom(x+42,y-52-k*15-u*26,labs[k][0],labs[k][1],12,al)}}
// ---------- ganchos ----------
// ---------- buff da RECARGA PERFEITA (só 3D): argolas vermelhas, pegadas de fogo, arma em chamas ----------
// Campos do snapshot por jogador (s.P[i]): [30]=buff restante (s, 5 s), [31]=corrida x2 restante (décimos de s, 0,5 s).
// (1) ao acertar (RLH0, setado em handleEv t==8): 4 argolas vermelhas SOBEM do pé até a cabeça (~0,7 s);
// (2) enquanto a corrida x2 vale: fogo nos pés + pegadas que ficam queimando ~0,7 s;
// (3) enquanto o buff de 5 s vale: chamas ao longo da arma (da mão até a boca do cano, st.mzW).
const FXB={},FXBR={};let FXBRF=0;
// anel do buff NO CHÃO (malha 3D plana): fica POR BAIXO do personagem (o 3D o cobre), não por cima como o DOM.
// Mesma animação da recarga: o vermelho vai queimando (chama na ponta) e virando cinza conforme o tempo acaba.
function fxBufRing(pid,x,y,fr,t){
 let r=FXBR[pid];
 if(!r){const cv=document.createElement('canvas');cv.width=256;cv.height=112;
  const tex=new THREE.CanvasTexture(cv);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(64,28),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.renderOrder=2;m.frustumCulled=false;GLW.add(m);
  r=FXBR[pid]={m,cv,tex,cx:cv.getContext('2d'),k:-1,u:0}}
 r.u=FXBRF;r.m.visible=true;r.m.position.set(x,gpH(x,y)+.4,y);
 const kk=Math.max(0,Math.min(100,fr*100|0)),a0=-1.5708,ah=a0+6.2832*(1-kk/100);
 if(r.k!==kk){r.k=kk;const g=r.cx;g.clearRect(0,0,256,112);g.lineCap='round';g.lineWidth=15;
  g.strokeStyle='#7a7a7a';g.beginPath();g.ellipse(128,56,112,42,0,a0,ah);g.stroke();
  g.strokeStyle='#e01818';g.beginPath();g.ellipse(128,56,112,42,0,ah,a0+6.2832);g.stroke();
  g.strokeStyle='#ff9a1a';g.beginPath();g.ellipse(128,56,112,42,0,ah,ah+.35);g.stroke();
  r.tex.needsUpdate=true}
 if(kk>0&&kk<100)fxFire(x+28*Math.cos(ah),y+10*Math.sin(ah),.22,t)}
function fxBuff(s,t){
 if(!s||!s.P)return;
 const now=performance.now();FXBRF++;
 for(const e of s.P){
  if(e[7])continue;
  const pid=e[0],x=e[3],y=e[4],arT=e[30]|0,arD=(e[31]|0)/10;
  if(arT>0)fxBufRing(pid,x,y,Math.max(e[33]|0,e[34]|0,e[35]|0)/50,t);
  const b=FXB[pid]||(FXB[pid]={tr:[],lx:x,ly:y});
  // (1) argolas vermelhas subindo pelo corpo até a cabeça
  const t0=RLH0[pid];
  if(t0){const u=(now-t0)/750;
   if(u>1.5)delete RLH0[pid];
   else for(let k=0;k<4;k++){const uu=u-k*.12;if(uu<0||uu>1)continue;
    const a=Math.sin(uu*3.14159),yy=-4-uu*54,w=1-.28*uu;
    fxRing(x,-yy/GLSIN,y,21*w,1.2*a,.08*a,.03*a);            // argola vermelha nítida (textura de anel)
    fxRing(x,-yy/GLSIN,y,15*w,1.3*a,.35*a,.12*a);            // 2ª argola, mais clara, por dentro
    for(let q=0;q<3;q++){const an=uu*9+q*2.09+k;fxBbS(x,y,0,Math.cos(an)*15*w,yy+Math.sin(an)*4,3.2,1*a,.25*a,.08*a)}}
   if(u>.5&&u<1.05){const a=Math.sin((u-.5)*3.14159/.55);fxBbS(x,y,0,0,-58,24,.9*a,.12*a,.05*a)}} // clarão na cabeça
  // (2) pegadas de fogo na corrida x2
  if(arD>0){
   fxFire(x,y,.4,t);
   if(!b.tr.length||Math.hypot(x-b.lx,y-b.ly)>22){b.tr.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*6,t});b.lx=x;b.ly=y}
  }else{b.lx=x;b.ly=y}
  for(let i=b.tr.length-1;i>=0;i--){const q=b.tr[i],age=t-q.t;
   if(age>800){b.tr.splice(i,1);continue}
   fxFire(q.x,q.y,.14+.3*(1-age/800),t)}
  // (3) arma pegando fogo (buff de 5 s)
  if(arT>0){
   const st=typeof PGS!=='undefined'?PGS[pid]:null;
   if(st&&st.mzW){const mx=st.mzW[0],my=st.mzW[1],mh=st.mzW[2],fade=Math.min(1,arT/.6);
    for(let i=0;i<5;i++){const f=i/4,px=mx+(x-mx)*f*.55,py=my+(y-my)*f*.55,ph=mh*(1-f*.25),
      fl=Math.sin(t/70+i*1.7+pid.length),hh=(9+5*fl)*(1-f*.3)*fade;
     fxBbS(px,py,ph,0,-hh*.5,6.5*fade,.55,.14,.04);                // língua vermelha
     fxBbSR(px,py,ph,0,-hh*.6,3.6*fade,hh*.62,0,.65,.4,.06);       // núcleo amarelo
     if(i%2==0)fxBbS(px,py,ph,Math.sin(t/90+i)*3,-hh-4-((t/60+i*7)%10),2.2*fade,.7,.3,.05)} // faíscas subindo
    fxBbS(mx,my,mh,0,-3,15*fade,.4,.16,.03)}}                       // brilho na boca do cano
 }
}
function glFxFrame(s,t,dtf){
 if(!glLive||!GLW)return 0;
 if(!fxInit())return 0;
 const t0=performance.now();FX_FR++;
 FX_Q.copy(GLCAM.quaternion);
 FX_BBN=0;FX_BXN=0;FX_GBN=0;FX_TC=0;
 FXL=FXL.filter(q=>t<q.t+q.life);
 FX_MZB.i=0;
 W4N={};for(const q of FXL)if(q.f[4]==4){const k=q.f[6];if(q.t>(W4N[k]||0))W4N[k]=q.t}
 for(const k in W4S)if(!W4N[k]||W4N[k]+420<t)delete W4S[k];
 for(const q of FXL)if(q.f[4]==4){const k=q.f[6];if(W4S[k]==null||q.t<W4S[k])W4S[k]=q.t}
 for(let i=0;i<FXL.length;i++)fxShot(FXL[i],t);
 if(GLMZ){GLMZ.intensity=FX_MZB.i;if(FX_MZB.i>0)GLMZ.position.set(FX_MZB.x,FX_MZB.h,FX_MZB.y)}
 fxFires(t);
 fxBuff(s,t);
 for(const k in FXBR)if(FXBR[k].u!==FXBRF)FXBR[k].m.visible=false;
 fxBits(dtf);
 fxProj(s);
 fxTexts(t);
 const d=performance.now()-t0;FX_MS=FX_MS?FX_MS*.9+d*.1:d;
 pfAdd('fxg',t0);
 return 1}
function glFxEnd(){
 if(!glLive||!FX_BB)return;
 const pub=(m,n)=>{if(!m)return;m.count=n;m.visible=n>0;
  if(n){m.instanceMatrix.updateRange.offset=0;m.instanceMatrix.updateRange.count=n*16;m.instanceMatrix.needsUpdate=true;
   if(m.instanceColor)m.instanceColor.needsUpdate=true}};
 pub(FX_BB,FX_BBN);pub(FX_BX,FX_BXN);pub(FX_GB,FX_GBN);
 for(let i=FX_TC;i<FX_T.length;i++){const o=FX_T[i];if(o&&o.g.style.display!=='none')o.g.style.display='none'}
 FX_TN=FX_TC}
// glKill(): esconde as malhas (nada é renderizado depois do kill, mas fica limpo) e os textos
if(typeof glKill==='function'){
 const FX_KILL0=glKill;
 glKill=function(){
  try{if(FX_BB)FX_BB.visible=false;if(FX_BX)FX_BX.visible=false;if(FX_GB)FX_GB.visible=false;
   for(let i=0;i<FX_T.length;i++){const o=FX_T[i];if(o)o.g.style.display='none'}}catch(e){}
  return FX_KILL0.apply(this,arguments)}}
// diagnóstico (leitura) para o teste de aceitação
if(typeof window!=='undefined')window.__gfx=()=>({bb:FX_BBN,bx:FX_BXN,rg:FX_GBN,txt:FX_TC,ms:FX_MS,fr:FX_FR,
 fxl:FXL.length,pt:PT.length,fl2:FL2.length,fires:FIRES.length,
 calls:GLR?GLR.info.render.calls:0,tri:GLR?GLR.info.render.triangles:0});
