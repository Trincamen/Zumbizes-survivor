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
}
// diagnóstico (leitura) para o teste de aceitação
if(typeof window!=='undefined')window.__glhud=()=>({vis:HG.vis,zo:ZO,rows:HG.el&&HG.el.scl?HG.el.scl.children.length:0});
