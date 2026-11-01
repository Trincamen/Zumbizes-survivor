// ---------- 89g-glhud.js — Migração M1 (F1+F2+F3) do HUD de tela para DOM ----------
// SÓ com glLive (?gl=1). Sem a flag (ou após glKill()) os elementos ficam display:none e o draw() 2D
// desenha EXATAMENTE os blocos 12..16 de antes: o caminho do canvas foi só GATEADO por !glLive, não alterado.
// F1 = vinheta+tint (#vig), F2 = HUD do jogador + aviso/setas do boss (#gh2/#gbn/#ga*), F3 = placar (#gsc).
// Regras cumpridas: pointer-events:none em tudo; z-order #glc(-1) < #vig(0) < #c(0, depois no DOM) < #glh(5);
// por quadro só transform/opacity/style.width/textContent QUANDO o valor muda (nenhum layout read no laço);
// pulso/glow por @keyframes CSS; escala --hh = --hs*--zo (x.6 em .mob) mais o fator .8 do HUD de tela.
const HG={ok:0,vis:0,zo:-1,ih:-1,tm:'',hp:-9,mx:-9,hc:'',low:-1,lv:-9,lvu:-1,xp:-9,nd:-9,xb:-1,bf:'',cai:-1,cw:-1,ch:-1,bn:-1,bnv:-1,sk:'',sh:-1,me:-1,av:['','','']};
// medida de texto fora do laço: o mesmo 'bold Npx sans-serif' do canvas (só quando o número muda)
const HGC=(typeof document!=='undefined'&&document.createElement)?document.createElement('canvas').getContext('2d'):null;
function ghW(t,sz){if(!HGC)return 0;HGC.font='bold '+sz+'px sans-serif';return HGC.measureText(t).width}
function ghInit(){
 if(HG.ok)return 1;
 const h=$('glh');if(!h)return 0;
 const q=k=>$(k);
 HG.el={h:h,vig:$('vig'),tm:q('ghtm'),hp:q('ghhpn'),hpm:q('ghhpm'),hpb:q('ghhp'),st:q('ghst'),stn:q('ghstn'),
  xp:q('ghxp'),xpm:q('ghxpm'),xpb:q('ghxpbi'),bf:q('ghbf'),b1:q('ghbf1'),b2:q('ghbf2'),b3:q('ghbf3'),
  cai:q('ghcaido'),bn:q('gbn'),bnt:q('gbnT'),sc:q('gsc'),scl:q('gscL'),h2:q('gh2'),
  av:[[q('ga1'),q('gal1')],[q('ga2'),q('gal2')],[q('ga3'),q('gal3')]]};
 HG.ok=1;return 1;
}
// esconde/mostra o HUD DOM (menu, glKill, WebGL que falhou) sem escrever quando nada mudou
function glHudShow(v){
 if(!ghInit())return;
 v=v?1:0;if(HG.vis===v)return;
 HG.vis=v;const E=HG.el,d=v?'block':'none';
 E.h.style.display=d;E.vig.style.display=d;
 // ao reabrir, força reescrever tudo (o DOM pode ter ficado velho)
 HG.tm='';HG.hp=-9;HG.mx=-9;HG.hc='';HG.low=-1;HG.lv=-9;HG.lvu=-1;HG.xp=-9;HG.nd=-9;HG.xb=-1;HG.bf='';
 HG.cai=-1;HG.cw=-1;HG.ch=-1;HG.bn=-1;HG.bnv=-1;HG.sk='';HG.sh=-1;HG.me=-1;HG.av=['','',''];
 // M3: ao reabrir, joystick/dica DOM são reescritos por ghJoy()
 try{if(typeof HJJ!=='undefined'&&HJJ){HJJ.k='';HJJ.hk=''}}catch(e){}
}
// F1: vinheta/tint iguais ao vigOverlay(): raio interno H*.35 e externo H*.95 (H em px de tela = innerHeight)
function ghVig(){
 HG.zo=ZO;HG.ih=innerHeight;
 const st=document.documentElement.style;if(!st||!st.setProperty)return;
 st.setProperty('--zo',String(ZO));
 st.setProperty('--vig','radial-gradient(circle at 50% 50%,rgba(0,0,0,0) '+(HG.ih*.35).toFixed(1)+'px,rgba(0,0,0,.5) '+(HG.ih*.95).toFixed(1)+'px)');
}
// F3: placar — só reconstrói quando a chave (nomes|abates|hp|dead|ordem) muda
function ghScore(L){
 const E=HG.el,ph=34+L.length*34;
 if(HG.sh!==ph){HG.sh=ph;E.sc.style.height=ph+'px'}
 while(E.scl.firstChild)E.scl.removeChild(E.scl.firstChild);
 const top=Math.max(1,L.length?(L[0][18]|0):1),MD=['#e0b84a','#b8b8c0','#b0703a'];
 for(let i=0;i<L.length;i++){
  const p=L[i],mine=p[0]==id,dd=p[7]?1:0,k=p[18]|0,hf=Math.max(0,Math.min(1,(p[5]||0)/(p[6]||1)));
  const row=document.createElement('div');row.className='gr'+(mine?' me':'');
  if(dd)row.style.opacity='.45';
  const kb=document.createElement('i');kb.className='gkb';kb.style.width=Math.max(0,164*k/top)+'px';row.appendChild(kb);
  const md=document.createElement('b');md.className='gmd';md.textContent=String(i+1);
  if(i<3){md.style.color=MD[i];md.style.borderColor=MD[i]}
  row.appendChild(md);
  const nm=document.createElement('span');nm.className='gnm';
  nm.textContent=(dd?'☠ ':'')+String(p[1]==null?'':p[1]).replace(/&lt;/g,'<').slice(0,10);
  if(mine)nm.style.color='#e8c25a';row.appendChild(nm);
  const wc=document.createElement('i');wc.className='gwc';wc.style.background=WC[p[8]]||'#ddd';row.appendChild(wc);
  const hb=document.createElement('u');hb.className='ghb';row.appendChild(hb);
  const hf2=document.createElement('i');hf2.className='ghf';
  hf2.style.width=(60*(dd?0:hf))+'px';hf2.style.background=hf>.5?'#d83a3a':hf>.25?'#e0701a':'#ff2a2a';
  row.appendChild(hf2);
  const kn=document.createElement('em');kn.className='gkn';kn.textContent=String(k);
  if(mine)kn.style.color='#e8c25a';row.appendChild(kn);
  E.scl.appendChild(row);
 }
}
// ---------- F4 (M2): minimapa em DOM ----------
// Estático = o canvas que mmBuild(MMW,f) já gera (cache MMCK), copiado UMA vez para #gmmc quando a chave muda.
// Rótulos HOSPITAL/POLÍCIA/MERCADO = <span> em pool (estáticos, mesma anti-colisão do 2D), recalculados junto.
// Dinâmico = #gmmd (MMW×MMH × DPR≤2), limpo e redesenhado todo quadro com os MESMOS desenhos do bloco 2D
// (coordenadas locais: mx0→0, 10→0). Moldura e cantos são CSS (#gmm:before). Tudo pointer-events:none.
const HGM={ok:0,mmw:0,mmh:0,dpr:0,X:null,el:null};
function ghMiniInit(){
 if(HGM.ok)return 1;
 const h=$('glh');if(!h)return 0;
 const box=document.createElement('div');box.id='gmm';
 const c=document.createElement('canvas');c.id='gmmc';
 const L=document.createElement('div');L.id='gmmL';
 const d=document.createElement('canvas');d.id='gmmd';
 box.appendChild(c);box.appendChild(L);box.appendChild(d);h.appendChild(box);
 HGM.el={box:box,c:c,L:L,d:d};HGM.ok=1;return 1;
}
// rótulos: mesma conta do bloco 2D, em coordenadas locais do mapa (0..MMW, 0..MMH)
function ghMiniLabels(MMW,f,MMH){
 const L=HGM.el.L;if(!L)return;
 while(L.firstChild)L.removeChild(L.firstChild);
 const lbs=[];
 for(const b of BLD){const T=b.T;if(T!='h'&&T!='p'&&T!='m')continue;
  const nm=T=='h'?'HOSPITAL':T=='p'?'POLÍCIA':'MERCADO',w=MOB?10:nm.length*5.2;
  lbs.push({T,nm,w,lx:Math.max(w/2+2,Math.min(MMW-w/2-2,(b.x+b.w/2)*f)),ly:b.y*f-5,color:T=='h'?'#ff8a8a':T=='p'?'#8fb0ff':'#ffc070',mc:T=='h'?'#e33':T=='p'?'#36f':'#e80'})}
 lbs.sort((a,b)=>a.lx-b.lx);
 const done=[];
 for(const l of lbs){let best=Math.max(7,l.ly);for(const dy of[0,-10,10,-20,20,30,-30]){const y=Math.max(7,Math.min(MMH-6,l.ly+dy));if(!done.some(q=>Math.abs(q.lx-l.lx)<(q.w+l.w)/2+2&&Math.abs(q.y-y)<9)){best=y;break}}l.y=best;done.push(l)}
 for(const l of done){
  const e=document.createElement(MOB?'i':'span');
  e.style.left=l.lx.toFixed(2)+'px';e.style.top=l.y.toFixed(2)+'px';
  if(MOB){e.className='gmlm';e.style.background=l.mc;e.textContent=l.nm[0]}
  else{e.className='gmll';e.style.color=l.color;e.textContent=l.nm}
  L.appendChild(e)}
}
// chamado de glHudFrame (só com glLive e HUD visível)
function ghMini(s){
 if(!glLive||!ghMiniInit())return;
 const W_=HGM.el,MMW=170,f=MMW/MW,MMH=MH*f;
 if(HGM.mmw!==MMW||HGM.mmh!==MMH){
  HGM.mmw=MMW;HGM.mmh=MMH;
  W_.box.style.width=MMW+'px';W_.box.style.height=MMH+'px';
  const dp=Math.min(window.devicePixelRatio||1,2);HGM.dpr=dp;
  W_.d.width=Math.round(MMW*dp);W_.d.height=Math.round(MMH*dp);
  HGM.X=W_.d.getContext('2d');if(HGM.X)HGM.X.setTransform(dp,0,0,dp,0,0);
 }
 const mk=((typeof curSd!=='undefined'&&curSd?curSd:(typeof sd!=='undefined'?sd:0))||0)+'|'+BLD.length+'|'+MMW+'|'+MH;
 if(!MMCV||MMCK!==mk){
  MMCK=mk;MMCV=mmBuild(MMW,f);
  if(MMCV){const c=W_.c;c.width=MMCV.width;c.height=MMCV.height;const g2=c.getContext('2d');if(g2){g2.setTransform(1,0,0,1,0,0);g2.clearRect(0,0,c.width,c.height);g2.drawImage(MMCV,0,0)}}
  ghMiniLabels(MMW,f,MMH);
 }
 const g=HGM.X;if(!g||!s)return;
 const t=Date.now();
 const mt=(tx,x,y,sz,col)=>{g.fillStyle=col;g.font=sz+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(tx,x,y)};
 g.clearRect(0,0,MMW,MMH);
 g.globalCompositeOperation='lighter';
 for(const it of IL){if(!it)continue;const x=it[0],y=it[1],k=it[2],ix=x*f,iy=y*f;
  g.fillStyle=itRGBA(k,.2);g.beginPath();g.arc(ix,iy,4,0,7);g.fill();
  g.fillStyle=itRGBA(k,.9);g.beginPath();g.arc(ix,iy,1.1,0,7);g.fill()}
 g.globalCompositeOperation='source-over';
 for(const z of ZMM)if(z[2]<3){const zx=z[0]*30*f,zy=z[1]*30*f;
  g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.ellipse(zx,zy+1,2.1,.8,0,0,7);g.fill();
  g.fillStyle=z[2]==1?'#7a5a30':'#2a2f22';g.fillRect(zx-1.1,zy-2.8,2.2,2.8);
  g.fillStyle='#9a9a7a';g.beginPath();g.arc(zx,zy-3.8,1.1,0,7);g.fill();
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=.6;g.strokeRect(zx-1.1,zy-2.8,2.2,2.8)}
 for(const z of (s.Z||[]))if(z[2]==3){const bx=z[0]*f,by=z[1]*f,pu=1+Math.sin(t/200)*.2;
  g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.ellipse(bx,by+2,5,2,0,0,7);g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle='rgba(190,60,255,.35)';g.beginPath();g.arc(bx,by-3,8*pu,0,7);g.fill();g.globalCompositeOperation='source-over';
  g.fillStyle='#9a3de0';g.beginPath();g.ellipse(bx,by-3,4.2,4.8,0,0,7);g.fill();g.strokeStyle='#e0a0ff';g.lineWidth=.8;g.stroke();
  mt('BOSS',bx,by+8,7,'#f0f')}
 if(s.bp){const pl=1+Math.sin(t/120)*.35,bx=s.bp[0]*f,by=s.bp[1]*f;
  g.strokeStyle='#f33';g.lineWidth=2;g.beginPath();g.arc(bx,by,10*pl,0,7);g.stroke();
  g.fillStyle=t%300<150?'#f33':'#fff';g.beginPath();g.arc(bx,by,5,0,7);g.fill();mt('!',bx,by+1,9,'#000');mt('BOSS',bx,by+17,11,'#f55')}
 if(s.sh){g.fillStyle=t%600<300?'#fc3':'#fff';g.beginPath();g.arc(s.sh[0]*f,s.sh[1]*f,6,0,7);g.fill();mt('$',s.sh[0]*f,s.sh[1]*f+1,10,'#000')}
 for(const p of (s.P||[])){const px=p[3]*f,py=p[4]*f,dd=p[7],mine=p[0]==id;
  g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.ellipse(px,py+1.2,3.2,1.3,0,0,7);g.fill();
  g.globalAlpha=dd?.42:1;
  g.beginPath();g.moveTo(px-1.8,py+1.2);g.lineTo(px-1.6,py-2);g.arc(px,py-2,1.6,3.14159,0);g.lineTo(px+1.8,py+1.2);g.closePath();
  g.fillStyle=p[2];g.fill();g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=.7;g.stroke();
  g.fillStyle='#f2ddc0';g.beginPath();g.arc(px,py-4.4,1.6,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=.6;g.stroke();
  if(dd)mt('☠',px,py-6.5,8,'#ddd');
  if(mine&&!dd){const pl=1+Math.sin(t/170)*.22;
   g.strokeStyle='rgba(255,255,255,'+(.55+.3*Math.sin(t/170))+')';g.lineWidth=1.4;g.beginPath();g.arc(px,py-2,6.5*pl,0,7);g.stroke();
   const a=(p[17]|0)/10,ax=px+Math.cos(a)*8.5,ay=py-2+Math.sin(a)*8.5;
   g.fillStyle='#fff';g.beginPath();
   for(let i=0;i<3;i++){const an=a+i*6.283/3;g[i?'lineTo':'moveTo'](ax+Math.cos(an)*2.8,ay+Math.sin(an)*2.8)}
   g.closePath();g.fill()}
  g.globalAlpha=1}
}
// ---------- M3: joystick e dica em DOM (dentro de #glh) ----------
// Mesmos valores do drawJoy() 2D: base JR() px (borda branca 3 px a 55%, fundo 12%), botão JR()*.42 a 45%;
// dica no mesmo texto/posição/opacidade (innerWidth/2, innerHeight*.78, 9 s). Posição em px CSS de TELA
// (clientX/clientY), NÃO em --hh. Só escreve quando algo muda (HJJ.k/HJJ.hk).
var HJJ={ok:0,k:'',hk:'',el:null};
function ghJoyInit(){
 if(HJJ.ok)return 1;
 const h=$('glh');if(!h)return 0;
 HJJ.el={b:$('gjoy'),k:$('gjoyb'),h:$('gjh')};
 if(!HJJ.el.b||!HJJ.el.k||!HJJ.el.h)return 0;
 HJJ.ok=1;return 1;
}
function ghJoy(){
 if(!ghJoyInit())return;
 const E=HJJ.el,R_=JR();
 if(joy){
  let dx=joy.x-joy.x0,dy=joy.y-joy.y0;const L=Math.hypot(dx,dy);if(L>R_){dx*=R_/L;dy*=R_/L}
  const k=joy.x0.toFixed(1)+','+joy.y0.toFixed(1)+','+(joy.x0+dx).toFixed(1)+','+(joy.y0+dy).toFixed(1)+','+R_.toFixed(1);
  if(k!==HJJ.k){
   HJJ.k=k;const d=R_*2,d2=R_*.42*2;
   E.b.style.display='block';
   E.b.style.width=d+'px';E.b.style.height=d+'px';
   E.b.style.transform='translate('+(joy.x0-R_).toFixed(1)+'px,'+(joy.y0-R_).toFixed(1)+'px)';
   E.k.style.width=d2+'px';E.k.style.height=d2+'px';
   // o botão é filho de #gjoy (origem em x0-R_, y0-R_): deslocamento local = dx + R_*.58 (R_ - R_*.42)
   const lf=R_*.58;
   E.k.style.transform='translate('+(dx+lf).toFixed(1)+'px,'+(dy+lf).toFixed(1)+'px)';
  }
 }else if(HJJ.k){HJJ.k='';E.b.style.display='none'}
 if(hintT&&Date.now()-hintT<9000&&ctl!='tap'){
  const m=MOB||ctl=='joy',al=Math.max(0,Math.min(1,.9-(Date.now()-hintT)/12000));
  const k=(m?1:0)+'|'+Math.round(al*100);
  if(k!==HJJ.hk){
   HJJ.hk=k;
   const t=m?'Toque e arraste na metade de baixo da tela para andar':'Use W A S D ou as setas para andar';
   if(E.h.textContent!==t)E.h.textContent=t;
   E.h.style.fontSize=(m?14:20)+'px';
   E.h.style.opacity=al.toFixed(2);
   E.h.style.display='block';
  }
 }else if(HJJ.hk!==''){HJJ.hk='';E.h.style.display='none'}
}
// chamado UMA vez por quadro pelo draw() (90-sons.js), só com glLive
function glHudFrame(s){
 if(!glLive){glHudShow(0);return}
 if(!ghInit())return;
 if(!s||s.ph==0){glHudShow(0);return}
 // ph==2 (fim de jogo) tem o #end por cima (z auto) — o HUD DOM (z 5) tem de sumir para não vazar
 if(s.ph!=1){glHudShow(0);return}
 glHudShow(1);
 const E=HG.el,t=Date.now();
 if(HG.zo!==ZO||HG.ih!==innerHeight)ghVig();
 // ---- F2: HUD do jogador (bloco 16) ----
 const on=me?1:0;
 if(HG.me!==on){HG.me=on;E.h2.style.display=on?'block':'none'}
 if(me){
  const hp=me[5]|0,mx=me[6]|0,dead=me[7]?1:0,lv=me[9]|0,xp=me[10]|0,nd=me[11]|0,df=me[12]|0,pd=me[21]|0,ar=me[30]|0;
  if(HLV!=null&&lv>HLV)HLT=t;HLV=lv; // flash de nível (o bloco 2D não roda em glLive)
  const tm=s.sh?('LOJA '+s.sh[2]+'s'):fmt(s.gt);
  if(tm!==HG.tm){HG.tm=tm;E.tm.textContent=tm;E.tm.style.color=s.sh?'#fc3':'#fff'}
  const hf=mx>0?hp/mx:0,low=hf<=.25,hcol=hf>.5?'#4ddc5a':hf>.25?'#e0a01a':'#ff2a2a';
  if(hcol!==HG.hc||low!==HG.low){
   HG.hc=hcol;
   if(low!==HG.low){HG.low=low;E.hpb.classList.toggle('low',!!low);E.hp.style.color=low?'#ffd0d0':'#fff'}
   E.hpb.style.setProperty('--hc',hcol);
  }
  if(hp!==HG.hp||mx!==HG.mx){
   HG.hp=hp;HG.mx=mx;
   E.hp.textContent=String(hp);E.hpm.textContent='/'+mx;
   E.hpm.style.left=(52+ghW(String(hp),40)+6)+'px';
  }
  const lvUp=t-HLT<2000;
  if(lv!==HG.lv||lvUp!==!!HG.lvu){
   HG.lv=lv;HG.lvu=lvUp;
   E.stn.textContent=String(lv);
   E.st.style.setProperty('--lc',lvUp?'#ff6a5a':'#f2c230');
   E.st.classList.toggle('up',lvUp);
  }
  if(xp!==HG.xp||nd!==HG.nd){
   HG.xp=xp;HG.nd=nd;
   E.xp.textContent=String(xp);E.xpm.textContent='/'+nd;
   E.xpm.style.left=(52+ghW(String(xp),34)+6)+'px';
  }
  const xb=Math.round(150*Math.min(1,nd>0?xp/nd:0));
  if(xb!==HG.xb){HG.xb=xb;E.xpb.style.width=xb+'px'}
  const b1=df?'⚡ x'+df:'',b2=pd>0?'💊 '+pd+'s':'',b3=ar>0?'🎯 '+ar+'s':'',bk=b1+'|'+b2+'|'+b3;
  if(bk!==HG.bf){
   HG.bf=bk;let ix=0;
   const put=(el,tx,col,adv)=>{if(tx){el.textContent=tx;el.style.color=col;el.style.left=ix+'px';el.style.display='block';ix+=adv}else el.style.display='none'};
   put(E.b1,b1,'#e8c25a',52);put(E.b2,b2,'#e8c25a',62);put(E.b3,b3,'#d8d2c0',62);
  }
  // 'VOCÊ CAIU': posição/escala 100% por CSS (#ghcaido: left 50%, top 100%-110*--hh), sem JS por quadro
  if(dead!==HG.cai){HG.cai=dead;E.cai.style.display=dead?'block':'none'}
 }
 // ---- aviso do boss (bloco 14) ----
 if(s.bp){
  const tx='⚠ KRAID CHEGANDO EM '+s.bp[2]+'s ⚠';
  if(tx!==HG.bn){HG.bn=tx;E.bnt.textContent=tx}
  if(!HG.bnv){HG.bnv=1;E.bn.style.display='block'}
 }else if(HG.bnv!==0){HG.bnv=0;E.bn.style.display='none'}
 // ---- setas de borda (bloco 13): só mudam transform/opacity quando o alvo/câmera mudam ----
 const AR=(tx,ty,i,col,lb)=>{
  const dx=tx-cx,dy=ty-cy,vis=(Math.abs(dx)>W/2||Math.abs(dy)>H/2);
  const k=(vis?1:0)+'|'+(tx|0)+'|'+(ty|0)+'|'+(cx|0)+'|'+(cy|0)+'|'+(W|0)+'|'+(H|0)+'|'+(lb||'');
  if(k===HG.av[i])return;HG.av[i]=k;
  const A=E.av[i][0],L=E.av[i][1];
  if(!vis){A.style.opacity='0';L.style.opacity='0';return}
  const a=Math.atan2(dy,dx),q=(Math.min(W,H)/2-90)*ZO,lq=(Math.min(W,H)/2-122)*ZO;
  A.style.transform='translate('+(Math.cos(a)*q).toFixed(1)+'px,'+(Math.sin(a)*q).toFixed(1)+'px) rotate('+a.toFixed(3)+'rad)';
  A.style.background=col;A.style.opacity='1';
  if(lb){
   L.textContent=lb;L.style.color=col;
   L.style.transform='translate('+(Math.cos(a)*lq).toFixed(1)+'px,'+(Math.sin(a)*lq).toFixed(1)+'px) translate(-50%,-50%)';
   L.style.opacity='1';
  }else L.style.opacity='0';
 };
 let bz=null;
 for(let i=0;s.Z&&i<s.Z.length;i++)if(s.Z[i][2]==3){bz=s.Z[i];break}
 if(me&&bz)AR(bz[0],bz[1],0,'#f0f','');
 if(me&&s.sh)AR(s.sh[0],s.sh[1],1,'#fc3','LOJA');
 if(me&&s.bp)AR(s.bp[0],s.bp[1],2,'#f33','BOSS');
 if(!me){for(let i=0;i<3;i++)if(HG.av[i]!=='x'){HG.av[i]='x';E.av[i][0].style.opacity='0';E.av[i][1].style.opacity='0'}}
 // ---- F3: placar (bloco 15) ----
 const P=s.P||[];
 let key='';
 for(let i=0;i<P.length;i++){const p=P[i];key+=p[0]+'|'+(p[1]||'')+'|'+(p[5]|0)+'/'+(p[6]|0)+'|'+(p[7]?1:0)+'|'+(p[8]|0)+'|'+(p[18]|0)+';'}
 if(key!==HG.sk){HG.sk=key;ghScore(P.slice().sort((a,b)=>b[18]-a[18]))}
 // ---- F4 (M2): minimapa DOM ----
 ghMini(s);
 // ---- M4: esconde os elementos do mundo não desenhados neste quadro ----
 if(typeof gwEnd==='function')gwEnd(s);
 // ---- M3: joystick + dica em DOM ----
 ghJoy();
}
// diagnóstico (leitura) para o teste de aceitação
if(typeof window!=='undefined')window.__glhud=()=>({vis:HG.vis,zo:ZO,rows:HG.el&&HG.el.scl?HG.el.scl.children.length:0});
