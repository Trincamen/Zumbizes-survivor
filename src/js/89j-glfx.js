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
// Qualidade: GQ.fx (0 = volta o efeito 2D) e GQ.fxP (fração de partículas/chamas/fumaça; 1 = tudo).
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
function fxShot(q,now){
 const f=q.f,w=f[4];
 const age=(now-q.t)/1000;if(age<0)return;
 // referência: boca do cano em 3D quando este cliente atirou (mzW); senão o ponto 2D do tiro
 let wx=f[0],wy=f[1],hp=24/GLSIN;
 const mw=q.mw;
 if(mw){wx=mw[0];wy=mw[1];hp=mw[2]}
 const sx=wx,sy=wy-hp*GLSIN,ex=f[2],ey=f[3]-18;
 const L0=Math.hypot(ex-sx,ey-sy)||1,ux=(ex-sx)/L0,uy=(ey-sy)/L0,ua=Math.atan2(uy,ux),nx=-uy,ny=ux;
 if(w==4){ // lança-chamas: 28 bolhas ao longo do jato (mesma cor/tamanho do 2D)
  const LL=L0+60,n=Math.max(4,Math.round(28*fxQ()));
  for(let i=0;i<n;i++){const u=i/(n-1||1),j=Math.abs(Math.sin(i*12.9898+Math.floor(now/70)*78.233)*43758.5453)%1,
   off=(j-.5)*u*52,r=5+u*20*(.6+j*.7),k=u*LL*(.9+j*.2),c=fxHsl(52-u*44,1,(58-u*14)/100),al=.8-u*.5;
   fxBbS(wx,wy,hp,ux*k+nx*off,uy*k+ny*off-u*8,r,c[0]*al,c[1]*al,c[2]*al)}
  return}
 const mfd=w==5?.15:.11,mf=age<mfd?1-age/mfd:0,mr=[16,30,20,18,0,26][w]||16;
 if(mf>0){
  fxBbS(wx,wy,hp,0,0,mr*1.6,.45*mf,.16*mf,.04*mf);      // halo laranja
  fxBbS(wx,wy,hp,0,0,mr*1.1,.95*mf,.82*mf,.5*mf);       // núcleo
  const ns=5+((q.t|0)%3),sl=(w==1||w==5?1.7:1)*mr*(1.1+mf*.9);
  for(let i=0;i<ns;i++){const an=ua+(i/(ns-1||1)-.5)*1.5,r1=mr*.3,r2=sl*(.5+fxr(q.t,i+3)*.8),
   mx=(Math.cos(an)*r1+Math.cos(an)*r2)/2,my=(Math.sin(an)*r1+Math.sin(an)*r2)/2,ln=Math.abs(r2-r1)/2;
   fxBbSR(wx,wy,hp,mx,my,ln,1.5,an,.7*mf,.67*mf,.52*mf)}
  if(w==1){const cl=24+mf*60;for(let i=0;i<3;i++){const an=ua+(i-1)*.32;
   fxBbSR(wx,wy,hp,Math.cos(an)*cl*.55,Math.sin(an)*cl*.55,cl*.5,cl*.3,an,.3*mf,.19*mf,.07*mf)}}}
 const gl=age<.12?1-age/.12:0;
 if(gl>0)fxBbS(wx,wy,hp,0,0,70,.18*gl,.135*gl,.06*gl);
 if(age<.12){const sk=1-age/.12,nsk=4+((q.t>>3)%4);
  for(let i=0;i<nsk;i++){const an=ua+(fxr(q.t,i+9)-.5)*.87,r1=3,r2=r1+12+fxr(q.t,i+21)*18;
   fxBbSR(wx,wy,hp,Math.cos(an)*(r1+r2)/2,Math.sin(an)*(r1+r2)/2,(r2-r1)/2,1.1,an,.85*sk,.77*sk,.5*sk)}}
 if(age<.6){const nsm=Math.max(1,Math.round(((w==1||w==5)?3:2)*fxQ())),sa=1-age/.6;
  for(let i=0;i<nsm;i++){const ph=fxr(q.t,i+31),r=4+age*16*(.7+ph*.6),al=.35*sa*(1-i*.15);
   fxBbS(wx,wy,hp,nx*(ph-.5)*22+ux*age*30,ny*(ph-.5)*22+uy*age*30-age*40-i*3,r,.83*al,.83*al,.8*al)}}
 if(w!=4&&age<.45){const ct=age/.45,c=fxRgb(w==1?'#c33':'#e8c25a');
  fxBbSR(wx,wy,hp,nx*(14+ct*70),ny*(14+ct*70)-ct*100+ct*ct*160,2.2,3.2,ct*9,c[0],c[1],c[2])}
 // rastro: mesma velocidade/comprimento do 2D (SPD/ln), traço grosso fraco + fino forte
 const spd=SPD[w],pos=age*spd,tc=w==5?[.86,.94,1]:w==1?[1,.59,.2]:[1,.78,.35];
 const n=w==1?6:1,ln=w==5?70:w==2?26:w==1?6:13;
 for(let k=0;k<n;k++){const an=w==1?(k-2.5)*.05:0,ca=Math.cos(an),sa=Math.sin(an),vx=ux*ca-uy*sa,vy=ux*sa+uy*ca,
  q0=Math.min(pos,L0),q1=Math.max(pos-ln,0);if(q1>=q0)continue;
  const q2=Math.max(q0-(q0-q1)*.45,q1),a2=Math.atan2(vy,vx);
  fxBbSR(wx,wy,hp,vx*(q0+q1)/2,vy*(q0+q1)/2,(q0-q1)/2,w==1?2.6:3.4,a2,tc[0]*.22,tc[1]*.22,tc[2]*.22);
  fxBbSR(wx,wy,hp,vx*(q0+q2)/2,vy*(q0+q2)/2,(q0-q2)/2,w==1?1.3:2,a2,tc[0]*.85,tc[1]*.85,tc[2]*.85);
  if(w!=1){fxBbS(wx,wy,hp,vx*q0,vy*q0,w==5?3.2:5,tc[0]*.4,tc[1]*.4,tc[2]*.4);
   fxBbS(wx,wy,hp,vx*q0,vy*q0,w==5?1.6:2.2,.9,.9,.9)}}
 if(pos>=L0){const ia=(pos-L0)/spd;
  if(ia<.16){for(let k=0;k<5;k++){const an=k*1.3+q.t%7,r1=3+ia*120,r2=r1+7;
   fxBbSR(wx,wy,hp,ex-sx+Math.cos(an)*(r1+r2)/2,ey-sy+Math.sin(an)*(r1+r2)/2,3.5,1.2,an,.9,.66,.28)}}
  if(ia<.1){const al=1-ia/.1;fxBbS(wx,wy,hp,ex-sx,ey-sy,1+10*al,.85*al,.85*al,.8*al)}}}
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
function fxProj(s){
 const Pj=s&&s.Pj;if(!Pj)return;
 for(let i=0;i<Pj.length;i++){const p=Pj[i],k=p[0],sz=FXPJ[k]||FXPJ[2];
  fxBox(p[2],p[3],p[4]/GLSIN,sz[0],sz[1],sz[2],p[5]/100,FXPJC[k]||p[1]||'#b8843a')}}
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
function glFxFrame(s,t,dtf){
 if(!glLive||!GQ.fx||!GLW)return 0;
 if(!fxInit())return 0;
 const t0=performance.now();FX_FR++;
 FX_Q.copy(GLCAM.quaternion);
 FX_BBN=0;FX_BXN=0;FX_GBN=0;FX_TC=0;
 FXL=FXL.filter(q=>t<q.t+q.life);
 for(let i=0;i<FXL.length;i++)fxShot(FXL[i],t);
 fxFires(t);
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
