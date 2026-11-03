// ---------- 89u-menucampo.js — MENU 2D: acampamento (fogueira) + jogador SENTADO no tronco ----------
// Só o menu usa isto (menuScene, 90-sons.js): pose sentada aprovada em 326171f (pernas 2/3, tronco 4,
// cabeça 5, braços 6/7, quadril desce), depois pgFK() e o MESMO raster do drawPlayer (nosolve/noweap).
// Geometria em metros (S = px por metro do jogador), então o enquadramento vale em qualquer tela.
// Nada alocado por quadro: estático (pedras/tronco/sombras) pré-renderizado uma vez, faíscas em pool.
const MCC={k:'',st:null,glow:null,core:null,spk:null,lt:0,sg:null,sgk:''};
const MCT={leg:-1.19,legY:.18,chest:.16,armL:1.0,armR:.50,armYL:-.1,armYR:.16,head:.55,root:-.56};
const MC_O={k:'menu',s:1,fa:-2.5,aim:-2.5,c:'#1e2430',gun:'#3a3d44',ring:null,shot:0,dead:false,idle:true,w:-1,t:0,nosolve:true,noweap:true};
const _mcq=[0,0,0,0],_mcb=[0,0,0,0];
const mcQmul=(a,b,o)=>{const x=a[0],y=a[1],z=a[2],w=a[3],x2=b[0],y2=b[1],z2=b[2],w2=b[3];
 o[0]=w*x2+x*w2+y*z2-z*y2;o[1]=w*y2-x*z2+y*w2+z*x2;o[2]=w*z2+x*y2-y*x2+z*w2;o[3]=w*w2-x*x2-y*y2-z*z2;return o};
const mcQX=(an,o)=>{const s=Math.sin(an*.5);o[0]=s;o[1]=0;o[2]=0;o[3]=Math.cos(an*.5);return o};
const mcQY=(an,o)=>{const s=Math.sin(an*.5);o[0]=0;o[1]=s;o[2]=0;o[3]=Math.cos(an*.5);return o};
// rotação delta em X (opcional Y) sobre o quat LOCAL do nó, direto em PGR
function mcRot(ni,dx,dy){const R=PG.PGR,bb=_mcb;bb[0]=R[ni*4];bb[1]=R[ni*4+1];bb[2]=R[ni*4+2];bb[3]=R[ni*4+3];
 mcQmul(mcQY(dy||0,_mcq),bb,bb);mcQmul(mcQX(dx,_mcq),bb,bb);R[ni*4]=bb[0];R[ni*4+1]=bb[1];R[ni*4+2]=bb[2];R[ni*4+3]=bb[3]}
// cintilar da fogueira: senos "ruidosos" sobre performance.now(), ~0.55..1.20
const mcFlick=w=>.62+.22*Math.sin(w*.0121)+.14*Math.sin(w*.033+.9)+.09*Math.sin(w*.0217+1.7)+.08*Math.sin(w*.052+2.2);
const _mcg={PX:0,PY:0,S:0,FX:0,FY:0};
function mcS(){
 const PX=W*.723,PY=H*.92,S=27*(H*.20/46);
 _mcg.PX=PX;_mcg.PY=PY;_mcg.S=S;_mcg.FX=PX-1.05*S;_mcg.FY=PY+.02*S;return _mcg}
// sprite de gradiente radial quente (luz da fogueira)
function mcGlow(r,col0,col1){
 const ss=2,cv=MSV(r*2*ss,r*2*ss),c=cv.getContext('2d');if(!c)return null;
 c.scale(ss,ss);const g=c.createRadialGradient(r,r,0,r,r,r);
 g.addColorStop(0,col0);g.addColorStop(.42,col1);g.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=g;c.fillRect(0,0,r*2,r*2);return {cv,r}}
// estático: terra queimada, sombras, pedras em anel, troncos da fogueira e tronco-banco
function mcBuild(){
 const g0=mcS(),S=g0.S,PX=g0.PX,PY=g0.PY,FX=g0.FX,FY=g0.FY;
 const x0=FX-.62*S,y0=PY-.80*S,x1=PX+.66*S,y1=PY+.13*S,w=Math.max(8,x1-x0),h=Math.max(8,y1-y0);
 const q=MSQ(),cv=MSV(w*q,h*q),c=cv.getContext('2d');if(!c)return;
 c.setTransform(q,0,0,q,-x0*q,-y0*q);
 // terra batida em volta da fogueira
 let g=c.createRadialGradient(FX,FY,0,FX,FY,.62*S);
 g.addColorStop(0,'rgba(52,36,24,.85)');g.addColorStop(.55,'rgba(36,26,18,.55)');g.addColorStop(1,'rgba(20,15,11,0)');
 c.fillStyle=g;c.beginPath();c.ellipse(FX,FY,.62*S,.62*S*.30,0,0,7);c.fill();
 // sombras no chão: jogador sentado e tronco-banco
 c.fillStyle='rgba(0,0,0,.42)';
 c.beginPath();c.ellipse(PX+.02*S,PY+.005*S,.24*S,.050*S,0,0,7);c.fill();
 c.fillStyle='rgba(0,0,0,.26)';
 c.beginPath();c.ellipse(PX+.05*S,PY+.016*S,.46*S,.062*S,.01,0,7);c.fill();
 // anel de pedras (11) com topo quente
 const NS=11;
 for(let i=0;i<NS;i++){
  const a=i/NS*6.2832+.18,rx=.52*S,ry=.155*S;
  const sx=FX+Math.cos(a)*rx,sy=FY+Math.sin(a)*ry,r=(.085+.024*((i*7)%5)/4)*S;
  const sg=c.createLinearGradient(sx,sy-r*.9,sx,sy+r*.6);
  sg.addColorStop(0,'#6b6259');sg.addColorStop(.45,'#4a443e');sg.addColorStop(1,'#28241f');
  c.fillStyle=sg;c.beginPath();
  for(let k=0;k<7;k++){const aa=k/7*6.2832,rr=r*(.82+.22*Math.sin(i*3.1+k*1.7));
   const px=sx+Math.cos(aa)*rr,py=sy+Math.sin(aa)*rr*.78;if(!k)c.moveTo(px,py);else c.lineTo(px,py)}
  c.closePath();c.fill();
  c.fillStyle='rgba(255,168,96,.10)';c.beginPath();c.ellipse(sx,sy-r*.45,r*.62,r*.20,0,0,7);c.fill()}
 // troncos queimados cruzados no centro
 for(let i=0;i<3;i++){const a=.35+i*1.05;
  c.save();c.translate(FX+Math.cos(a)*.05*S,FY-.035*S+Math.sin(a)*.02*S);c.rotate(a*.5-.4);
  c.fillStyle=i==1?'#2a1d13':'#3a2819';
  c.beginPath();c.roundRect?c.roundRect(-.24*S,-.032*S,.48*S,.064*S,.03*S):c.rect(-.24*S,-.032*S,.48*S,.064*S);c.fill();
  c.fillStyle='rgba(255,110,30,.30)';c.fillRect(-.20*S,-.006*S,.40*S,.006*S);c.restore()}
 // brasas no centro
 for(let i=0;i<9;i++){const a=i*2.399,r=.13*S*((i%3)+1)/3;
  c.fillStyle=i%2?'rgba(255,120,32,.85)':'rgba(255,190,90,.75)';
  c.beginPath();c.arc(FX+Math.cos(a)*r,FY-.02*S+Math.sin(a)*r*.32,.016*S*(.7+.5*((i*5)%4)/4),0,7);c.fill()}
 // tronco-banco (toco deitado): casca + anéis das pontas
 const bw=.52*S,br=.135*S,by=PY-.19*S,BX=PX-.06*S;
 g=c.createLinearGradient(0,by-br,0,by+br);
 g.addColorStop(0,'#7a6040');g.addColorStop(.35,'#5f4a32');g.addColorStop(1,'#33261a');
 c.fillStyle=g;c.beginPath();
 c.roundRect?c.roundRect(BX-bw,by-br,bw*2,br*2,br):c.rect(BX-bw,by-br,bw*2,br*2);c.fill();
 c.strokeStyle='rgba(20,14,9,.55)';c.lineWidth=Math.max(1,.012*S);
 for(let i=0;i<5;i++){const ly=by-br*.55+i*br*.30;c.beginPath();c.moveTo(BX-bw*.92,ly);c.lineTo(BX+bw*.92,ly+.01*S);c.stroke()}
 for(const sgn of[-1,1]){c.fillStyle='#7a6042';c.beginPath();c.ellipse(BX+sgn*bw,by,br*.42,br*.92,0,0,7);c.fill();
  c.strokeStyle='rgba(60,44,28,.7)';c.lineWidth=Math.max(.8,.008*S);
  for(let k=1;k<3;k++){c.beginPath();c.ellipse(BX+sgn*bw,by,br*.42*k/3,br*.92*k/3,0,0,7);c.stroke()}}
 // topo iluminado do banco
 c.fillStyle='rgba(255,180,110,.14)';c.beginPath();
 c.roundRect?c.roundRect(BX-bw,by-br,bw*2,br*.5,br):c.rect(BX-bw,by-br,bw*2,br*.5);c.fill();
 MCC.st={cv,x0,y0,w,h}
}
function mcPose(t){
 const g0=mcS(),o=MC_O;o.t=t;o.s=g0.S/27;o.k='menu';
 pgSolve(g0.PX,g0.PY,o);
 const T=PG.PGT;
 T[1]+=MCT.root;                                        // raiz (nó 0) desce: quadris na altura do banco
 mcRot(2,MCT.leg,-MCT.legY);mcRot(3,MCT.leg,MCT.legY); // pernas dobradas à frente (levemente abertas)
 mcRot(4,MCT.chest+.012*Math.sin(t/950),0);            // tronco levemente inclinado + respiração
 mcRot(5,0,MCT.head);                                  // cabeça virada para a fogueira
 mcRot(6,MCT.armL,MCT.armYL);mcRot(7,MCT.armR,MCT.armYR);
 pgFK();return g0}
// posição de tela de um nó do modelo (mesma projeção do drawPlayer)
function mcNode(ni,g0,out){const yaw=PGS.menu.yaw,cy=Math.cos(yaw),sy=Math.sin(yaw),S=g0.S;
 const wx=PG.WT[ni*3],wy=PG.WT[ni*3+1],wz=PG.WT[ni*3+2],rx=wx*cy+wz*sy,rz=-wx*sy+wz*cy;
 out[0]=g0.PX+rx*S;out[1]=g0.PY-(wy-rz*K2)*S;return out}
const _mch=[0,0];
function mcCamp(t){
 if(!PG){try{drawPlayer(W*.723,H*.92,{k:'menu',s:H*.20/46,fa:-2.5,aim:-2.5,c:'#1e2430',gun:'#3a3d44',ring:null,shot:0,dead:false,idle:true,t:t,w:0})}catch(e){}return 0}
 const key=W+'x'+H+'x'+MSQ();
 if(MCC.k!==key){MCC.k=key;MCC.st=MCC.glow=MCC.core=null;mcBuild();
  const S0=27*(H*.20/46);MCC.glow=mcGlow(1.15*S0,'rgba(255,166,72,.50)','rgba(214,110,36,.16)');
  MCC.core=mcGlow(.34*S0,'rgba(255,236,180,.85)','rgba(255,160,60,.30)')}
 const g0=mcPose(t),S=g0.S,PX=g0.PX,PY=g0.PY,FX=g0.FX,FY=g0.FY;
 const w=performance.now(),fl=Math.max(.55,Math.min(1.20,mcFlick(w)));
 // 1) estático (terra, sombras, pedras, troncos, banco)
 const st=MCC.st;if(st)X.drawImage(st.cv,st.x0,st.y0,st.w,st.h);
 // 2) luz no chão (aditivo)
 X.globalCompositeOperation='lighter';
 if(MCC.glow){const g=MCC.glow,r=g.r;X.globalAlpha=.78*fl;X.drawImage(g.cv,FX-r,FY-r*.62,r*2,r*2*.62)}
 // 3) jogador sentado (sem arma), com a mão no graveto
 X.globalCompositeOperation='source-over';X.globalAlpha=1;
 try{drawPlayer(PX,PY,MC_O)}catch(e){}
 X.globalCompositeOperation='lighter';
 // 4) luz da fogueira caindo sobre o jogador + brasa
 if(MCC.glow){const g=MCC.glow,r=g.r;X.globalAlpha=.30*fl;X.drawImage(g.cv,FX-r*.35,FY-r*1.05,r*1.6,r*1.6)}
 if(MCC.core){const g=MCC.core,r=g.r;X.globalAlpha=.55*fl;X.drawImage(g.cv,FX-r,FY-.10*S-r,r*2,r*2)}
 // 5) chamas (4 línguas) + faíscas
 mcFlames(t,S,FX,FY,fl);
 mcSparks(t,S,FX,FY);
 // 6) graveto com linguiça pairando sobre as chamas
 mcStick(g0,S,FX,FY);
 X.globalCompositeOperation='source-over';X.globalAlpha=1;
 return 1}
function mcFlames(t,S,FX,FY,fl){
 for(let i=0;i<4;i++){
  const ph=t/(150+i*23)+i*1.7;
  const h=Math.min(.62*S,(.54+.105*Math.sin(ph*1.7)+.05*Math.sin(ph*3.1))*S*fl*(i==1?1.16:1)),
   w=(.075+.020*Math.sin(ph*2.3))*S,ox=(i-1.5)*.062*S+Math.sin(ph*1.1)*.022*S,
   x=FX+ox,y=FY-.035*S,sw=Math.sin(ph*1.3)*.05*S;
  X.fillStyle=i%2?'rgba(255,110,20,.52)':'rgba(255,146,36,.50)';
  X.beginPath();X.moveTo(x-w,y);X.quadraticCurveTo(x-w*1.15,y-h*.55,x+sw,y-h);
  X.quadraticCurveTo(x+w*1.15,y-h*.55,x+w,y);X.closePath();X.fill();
  X.fillStyle='rgba(255,206,96,.55)';
  X.beginPath();X.moveTo(x-w*.55,y);X.quadraticCurveTo(x-w*.62,y-h*.40,x+sw*.7,y-h*.62);
  X.quadraticCurveTo(x+w*.62,y-h*.40,x+w*.55,y);X.closePath();X.fill()}
}
// faíscas: pool fixo de 30, sem alocar por quadro
function mcSparks(t,S,FX,FY){
 if(!MCC.spk){const A=[];for(let i=0;i<30;i++)A.push({x:0,y:0,vy:0,vx:0,l:0,lm:1,s:1,ph:i*1.7});
  for(let i=0;i<30;i++){const p=A[i];p.l=p.lm=.4+((i*37)%100)/100*1.1;p.y=Math.random()*p.lm}
  MCC.spk=A}
 const dt=Math.min(.1,MCC.lt?(t-MCC.lt)/1000:.016);MCC.lt=t;
 X.fillStyle='#ffb060';
 for(let i=0;i<MCC.spk.length;i++){const p=MCC.spk[i];
  p.y+=dt*(.55+.25*Math.sin(p.ph+t/700));p.x+=dt*.18*Math.sin(p.ph*2+t/430);
  if(p.y>p.l){p.y=0;p.x=0;p.ph+=1.3}
  const u=p.y/p.l,px=FX+p.x*S*1.4+(Math.random()-.5)*.01*S,py=FY-.05*S-p.y*S*.75;
  X.globalAlpha=(1-u)*.85*(.4+.6*Math.abs(Math.sin(p.ph+t/300)));
  const sz=Math.max(1,.016*S*(1-u*.5));X.fillRect(px,py,sz,sz)}
 X.globalAlpha=1}
// graveto na mão direita + linguiça na ponta, pairando ACIMA das chamas
function mcStick(g0,S,FX,FY){
 mcNode(8,g0,_mch);                                      // weapon_socket (mão direita)
 const hx=_mch[0],hy=_mch[1],tx=FX+.03*S,ty=FY-.72*S;
 const dx=tx-hx,dy=ty-hy,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
 X.strokeStyle='#5a4026';X.lineCap='round';X.lineWidth=Math.max(1.6,.030*S);
 X.beginPath();X.moveTo(hx,hy);X.lineTo(tx,ty);X.stroke();
 X.strokeStyle='rgba(255,190,120,.28)';X.lineWidth=Math.max(.8,.012*S);
 X.beginPath();X.moveTo(hx+ux*.02*S,hy+uy*.02*S-.006*S);X.lineTo(tx,ty-.006*S);X.stroke();
 // linguiça: cápsula tostada na ponta do graveto
 const a=Math.atan2(uy,ux)-Math.PI/2,l=.24*S,r=.034*S;
 X.save();X.translate(tx+ux*.10*S,ty+uy*.10*S);X.rotate(a);
 const sk=Math.round(r*10)+'';
 if(MCC.sgk!==sk){MCC.sgk=sk;const g=X.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,'#4e1a10');g.addColorStop(.32,'#8f3520');g.addColorStop(.58,'#a8452b');g.addColorStop(1,'#541d13');MCC.sg=g}
 X.fillStyle=MCC.sg;
 X.beginPath();X.roundRect?X.roundRect(-r,-l/2,r*2,l,r):X.rect(-r,-l/2,r*2,l);X.fill();
 X.fillStyle='rgba(255,196,130,.16)';X.fillRect(-r*.45,-l*.34,r*.30,l*.46);
 X.strokeStyle='rgba(40,14,8,.55)';X.lineWidth=Math.max(.7,.006*S);
 X.beginPath();X.moveTo(-r*.5,-l*.05);X.lineTo(r*.5,-l*.05);X.stroke();
 X.restore()}
