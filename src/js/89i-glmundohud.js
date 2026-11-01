// ---------- 89i-glmundohud.js — M4: elementos do MUNDO em DOM (nomes/barras/boss/loja/itens/pílula) ----------
// SÓ com glLive (?gl=1). Sem a flag (e depois de glKill()) NADA muda: o draw() 2D continua desenhando
// exatamente os mesmos blocos no canvas #c. Aqui eles viram DOM dentro de #glh (div #gw), posicionados por
// w2s(x,y) e escalados por --gwzo (= ZO). Assim ?gl=1&c2d=0 mostra mundo 3D + todos esses elementos.
// Regras: pool fixo (nada de criar/remover por quadro), só transform/opacity/style.width/textContent QUANDO
// o valor muda, nada captura clique (pointer-events:none) — a pílula de recarga continua clicável pela lógica
// PILL em coordenadas de MUNDO (#inp, 50-cliente.js). O DOM fica por cima do telhado (imperfeição aceita no M4).
// Cada elemento é: #gw > .gwE (posição de tela, translate3d) > .gwI (scale ZO, conteúdo em px de MUNDO).
// A câmera é ortográfica, então a altura h de um ponto sobe a tela por h*sin(55°)*ZO — os filhos usam esse fator.
const GWU={ok:0,zo:-1,stamp:0,pl:{},zl:[],zln:0,boss:null,sel:null,shop:null,lab:[],labn:0,arc:null,pill:null,mk:null,dhn:0,krn:0};
const GWSIN=GLSIN; // sin(55°)
const GWZB=60;     // teto de barras de zumbi simultâneas (limite pedido no M4)
function gwInit(){
 if(GWU.ok)return 1;
 const h=$('glh');if(!h)return 0;
 const w=document.createElement('div');w.id='gw';
 h.insertBefore(w,h.firstChild); // primeiro filho: fica atrás do HUD de tela (mesma camada que treme com QK)
 GWU.el=w;GWU.ok=1;return 1;
}
function gwNew(){
 if(!gwInit())return null;
 const g=document.createElement('div'),i=document.createElement('div');
 g.className='gwE';i.className='gwI';g.appendChild(i);GWU.el.appendChild(g);g.style.display='none';
 return {g:g,i:i,v:0,k:'',u:-1};
}
function gwD(p,c,l,t,w,h){const d=document.createElement('div');d.className=c;
 d.style.left=l+'px';d.style.top=t+'px';if(w!=null){d.style.width=w+'px';d.style.height=h+'px'}
 p.appendChild(d);return d}
function gwT(p,sz,l,t){const d=document.createElement('div');d.className='gwT';
 d.style.left=l+'px';d.style.top=t+'px';d.style.fontSize=sz+'px';p.appendChild(d);return d}
function gwDisp(e,v){v=v?1:0;if(!e||e.gk===v)return;e.gk=v;e.style.display=v?'block':'none'}
// posiciona na tela e marca como usado neste quadro (gwEnd esconde quem não foi usado)
function gwPut(o,x,y){
 if(!o)return;
 const p=w2s(x,y),k=p[0].toFixed(1)+','+p[1].toFixed(1);
 if(k!==o.k){o.k=k;o.g.style.transform='translate3d('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px,0)'}
 gwDisp(o.g,1);o.u=GWU.stamp;
}
// ---------- jogadores: nome, barra de vida, ▼ do local, ✖/caído, anel de buff e anel de recarga ----------
function gwPl(pid){
 let o=GWU.pl[pid];if(o)return o;
 o=gwNew();if(!o)return null;
 o.pid=pid;GWU.pl[pid]=o;
 o.sh=gwD(o.i,'gwEl',-20,-9*GWSIN,40,18*GWSIN);o.sh.style.background='rgba(0,0,0,.4)';
 o.bl=gwD(o.i,'gwEl',-34,-14*GWSIN,68,28*GWSIN);
 o.buf=gwD(o.i,'gwR',-30,-11*GWSIN,60,22*GWSIN);o.buf.style.border='3px solid rgba(80,170,255,.6)';
 const rc=document.createElement('canvas');rc.className='gwC';rc.width=240;rc.height=96;
 rc.style.left='-40px';rc.style.top='-16px';rc.style.width='80px';rc.style.height='32px';
 o.i.appendChild(rc);o.rc=rc;o.rx=rc.getContext('2d');o.rk='';
 o.bb=gwD(o.i,'gwB',-18,-56*GWSIN,36,6);
 o.bf=gwD(o.bb,'gwBf',0,0,36,6);o.bf.style.background='#3e3';
 o.nm=gwT(o.i,14,0,-66*GWSIN);
 o.dv=gwT(o.i,14,0,-80*GWSIN);o.dv.textContent='▼';o.dv.style.color='#ff0';
 o.xm=gwT(o.i,24,0,-26*GWSIN);o.xm.textContent='✖';o.xm.style.color='#ddd';
 o.cn=gwT(o.i,14,0,-48*GWSIN);o.cn.style.color='#bbb';
 return o;
}
function gwPlayer(pid,x,y,o){
 if(!glLive)return;
 const t0=pfStart();
 const P=gwPl(pid);if(!P)return;
 gwPut(P,x,y);
 const d=o.dead;
 // M7a: sombra dos pés e anel da cor do jogador eram desenhados no canvas 2D pelo drawPlayerGL (ell);
 // com o #c oculto passam a ser estes dois elementos, com os MESMOS tamanhos do 2D (vivo 26×10 e 36×14;
 // caído 40×18 e 68×28). A altura leva GWSIN, como o resto do #gw.
 if(P.sz!==(d?0:1)){P.sz=d?0:1;
  const w=P.sz?26:40,h=(P.sz?10:18)*GWSIN,bw=P.sz?36:68,bh=(P.sz?14:28)*GWSIN;
  P.sh.style.left=(-w/2)+'px';P.sh.style.top=(-h/2)+'px';P.sh.style.width=w+'px';P.sh.style.height=h+'px';
  P.bl.style.left=(-bw/2)+'px';P.bl.style.top=(-bh/2)+'px';P.bl.style.width=bw+'px';P.bl.style.height=bh+'px'}
 gwDisp(P.sh,1);gwDisp(P.bl,1);gwDisp(P.xm,d);gwDisp(P.cn,d);
 gwDisp(P.bb,!d);gwDisp(P.nm,!d);gwDisp(P.dv,!d&&!!o.self);gwDisp(P.buf,!d&&o.buff>0);
 gwDisp(P.rc,!d&&o.rlf>0);
 if(P.blc!==o.c){P.blc=o.c;P.bl.style.border='3px solid '+o.c}
  if(d){
  const tt=o.n+' (caído)';if(P.cnt!==tt){P.cnt=tt;P.cn.textContent=tt}
  return;
 }
 const nm=String(o.n||''),nc=o.self?'#ff0':'#fff';
 if(P.nmt!==nm){P.nmt=nm;P.nm.textContent=nm}
 if(P.nmc!==nc){P.nmc=nc;P.nm.style.color=nc}
 const hf=o.mx>0?Math.max(0,Math.min(1,o.hp/o.mx)):0;
 if(P.hf!==hf){P.hf=hf;P.bf.style.width=(hf*100).toFixed(1)+'%'}
 if(o.rlf>0){
  const p=1-o.rlf/100,rk=p.toFixed(3);
  if(P.rk!==rk){P.rk=rk;const g=P.rx;
   if(g){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,240,96);g.setTransform(3,0,0,3,120,48);
    g.lineWidth=4;g.strokeStyle='rgba(255,210,74,.25)';g.beginPath();g.ellipse(0,0,26,10*GWSIN,0,0,7);g.stroke();
    g.strokeStyle='#ffd24a';g.beginPath();g.ellipse(0,0,26,10*GWSIN,0,-1.5708,-1.5708+6.2832*p);g.stroke()}}
 }
 pfAdd('gwm',t0);
}
// ---------- zumbis: barra de vida (mesma escala por tipo do 2D, só h<100 ou gordão) ----------
function gwZNew(){
 const o=gwNew();if(!o)return null;
 o.bb=gwD(o.i,'gwB',0,0,28,6);
 o.bf=gwD(o.bb,'gwBf',0,0,28,6);o.bf.style.background='#e33';
 o.tp=-1;o.fk='';
 return o;
}
function gwZBar(x,y,k,h){
 if(!glLive||GWU.zln>=GWZB)return;
 const t0=pfStart();
 let o=GWU.zl[GWU.zln];if(!o){o=gwZNew();if(!o)return;GWU.zl[GWU.zln]=o}
 GWU.zln++;
 const bs_=k==2?1.5:k==1?.9:1;
 if(o.tp!==bs_){o.tp=bs_;
  o.bb.style.left=(-14*bs_)+'px';o.bb.style.top=(-(ZH*bs_+6)*GWSIN)+'px';o.bb.style.width=(28*bs_)+'px'}
 gwPut(o,x,y);
 const f=Math.max(0,Math.min(1,h/100)),fk=f.toFixed(2);
 if(o.fk!==fk){o.fk=fk;o.bf.style.width=(f*28*bs_)+'px'}
 pfAdd('gwm',t0);
}
// ---------- boss: sombra, barra vermelha, KRAID, BOSS/ATORDOADO, estrelas e arbustos ----------
function gwBossNew(){
 const o=gwNew();if(!o)return null;
 o.sh=gwD(o.i,'gwEl',-53,-18*GWSIN,106,36*GWSIN);
 o.bb=gwD(o.i,'gwB',-40,0,80,6);
 o.bf=gwD(o.bb,'gwBf',0,0,80,6);o.bf.style.background='#c0152a';
 o.tt=gwT(o.i,20,0,0);o.tt.textContent='KRAID';o.tt.style.fontWeight='bold';o.tt.style.color='#ff4a4a';
 o.tt.style.textShadow='-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000,-2px -2px #000,2px -2px #000,-2px 2px #000,2px 2px #000';
 o.st=gwT(o.i,12,0,0);
 o.sr=[];for(let i=0;i<5;i++){const s=document.createElement('div');s.className='gwSt';s.style.display='none';o.i.appendChild(s);o.sr.push(s)}
 o.bu=[];for(const off of[-34,0,34]){
  const a=gwD(o.i,'gwEl',off-24,(-(10*GWSIN))-24,48,48);a.style.background='#2f6b2a';o.bu.push(a);
  const b=gwD(o.i,'gwEl',off-6-13,(-(18*GWSIN))-13,26,26);b.style.background='#3f8a35';o.bu.push(b)}
 o.bo='';
 return o;
}
function gwBoss(x,y,o,t){
 if(!glLive)return;
 const t0=pfStart();
 const B=GWU.boss||(GWU.boss=gwBossNew());if(!B)return;
 gwPut(B,x,y);
 // altura de MUNDO do modelo 3D (89h) para o HUD ficar sempre acima da cabeça, em qualquer janela
 let bh=210;
 try{if(typeof BGR!=='undefined'&&BGR&&BGR.msh&&BGR.h>0&&BGR.S>0)bh=BGR.h*BGR.S}catch(e){}
 const bhq=bh.toFixed(1);
 if(B.bo!==bhq){B.bo=bhq;
  B.bb.style.top=(-(bh+22)*GWSIN)+'px';
  B.tt.style.top=(-(bh+36)*GWSIN)+'px';
  B.st.style.top=(-(bh+50)*GWSIN)+'px'}
 const sh=o.bs==5?'rgba(255,220,60,.28)':'rgba(190,10,30,.4)';
 if(B.shc!==sh){B.shc=sh;B.sh.style.background=sh}
 const hf=Math.max(0,Math.min(1,o.h/100)),hfq=hf.toFixed(2);
 if(B.hf!==hfq){B.hf=hfq;B.bf.style.width=(hf*80).toFixed(1)+'px'}
 const sty=o.bs==5?'ATORDOADO '+o.st5.toFixed(1)+'s':'BOSS',stc=o.bs==5?'#ffe45a':'#d9a0a0';
 if(B.stt!==sty){B.stt=sty;B.st.textContent=sty}
 if(B.stc!==stc){B.stc=stc;B.st.style.color=stc}
 // estrelas do atordoamento: órbitas de 38 px em volta do topo (só com bs==5)
 for(let i=0;i<5;i++){
  const s=B.sr[i];
  if(o.bs!=5){gwDisp(s,0);continue}
  const a=t/260+i*1.2566,px=Math.cos(a)*38,py=-(bh+8)*GWSIN+Math.sin(a)*10,rot=(t/200+i*6.283)%6.283;
  gwDisp(s,1);
  s.style.transform='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0) translate(-50%,-50%) rotate('+rot.toFixed(2)+'rad)'
 }
 // arbustos da aparição (em>0): mesma opacidade/posição do bushFront 2D
 const em=o.em||0;
 if(em>0){
  const al=Math.min(1,em/.5);
  if(B.buo!==al){B.buo=al;for(const b of B.bu)b.style.opacity=al}
  for(const b of B.bu)gwDisp(b,1)
 }else if(B.buo!==0){B.buo=0;for(const b of B.bu)gwDisp(b,0)}
 pfAdd('gwm',t0);
}
// ---------- loja: vendedor (mesa + figura + $) e a marca "🛒 LOJA" sobre o prédio ----------
function gwSeller(x,y){
 if(!glLive)return;
 let o=GWU.sel;
 if(!o){const s=gwNew();if(!s)return;GWU.sel=s;
  const tb=gwD(s.i,'gwEl',-42,4*GWSIN,84,18);tb.style.borderRadius='0';tb.style.background='#6a4a2a';
  const tt=gwD(s.i,'gwEl',-42,4*GWSIN,84,5);tt.style.borderRadius='0';tt.style.background='#8a6a3a';
  const lg=gwD(s.i,'gwEl',-5.5,-14*1.05*GWSIN,11,14*1.05);lg.style.borderRadius='0';lg.style.background='#543';
  const bo=gwD(s.i,'gwEl',-8.4,-31*1.05*GWSIN,16.8,18*1.05);bo.style.borderRadius='0';bo.style.background='#fc3';
  const sh2=gwD(s.i,'gwEl',0,-31*1.05*GWSIN,8.4,18*1.05);sh2.style.borderRadius='0';sh2.style.background='rgba(0,0,0,.28)';
  const hd=gwD(s.i,'gwEl',-7.9,-(38*1.05+7.9)*GWSIN,15.8,15.8);hd.style.background='#e8bb98';
  const hr=gwD(s.i,'gwEl',-7.9,-(38*1.05+7.9)*GWSIN,15.8,8);hr.style.borderRadius='50% 50% 0 0';hr.style.background='#222';
  s.d=gwT(s.i,22,0,-58*GWSIN);s.d.textContent='$';s.d.style.color='#fc3';
  o=s}
 gwPut(o,x,y);
}
function gwShop(b,t){
 if(!glLive)return;
 let o=GWU.shop;
 if(!o){o=GWU.shop=gwNew();if(!o)return;o.t=gwT(o.i,26,0,0);o.t.textContent='🛒 LOJA';o.t.style.color='#fc3';o.tp=''}
 gwPut(o,b.x+b.w/2,b.y+b.h/2);
 const v=(-(b.H+22)*GWSIN+Math.sin(t/200)*4*GWSIN);
 const vq=v.toFixed(1);
 if(o.tp!==vq){o.tp=vq;o.t.style.top=vq+'px'}
}
// ---------- itens: rótulo "$" do dinheiro e arco de proximidade (só jogador local) ----------
function gwItemTxt(x,y,v){
 if(!glLive||GWU.labn>=24)return;
 let o=GWU.lab[GWU.labn];if(!o){o=gwNew();if(!o)return;GWU.lab[GWU.labn]=o;
  o.t=gwT(o.i,12,0,22*GWSIN);o.t.style.color='#fe8'}
 GWU.labn++;
 gwPut(o,x,y);
 const s=String(v);if(o.st!==s){o.st=s;o.t.textContent=s}
}
function gwArc(x,y,a,bd,k){
 if(!glLive)return;
 let o=GWU.arc;
 if(!o){o=GWU.arc=gwNew();if(!o)return;
  const c=document.createElement('canvas');c.className='gwC';c.width=240;c.height=96;
  c.style.left='-40px';c.style.top='-16px';c.style.width='80px';c.style.height='32px';
  o.i.appendChild(c);o.cv=c;o.cx=c.getContext('2d');o.key=''}
 gwPut(o,x,y);
 const key=a.toFixed(2)+'|'+(bd|0)+'|'+k;
 if(o.key!==key){o.key=key;const g=o.cx;
  if(g){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,240,96);g.setTransform(3,0,0,3,120,48);
   g.globalAlpha=.6*(1-bd/220)+.15;g.strokeStyle=itCol(k);g.lineWidth=3;
   g.beginPath();g.ellipse(0,0,34,13*GWSIN,0,a-.61,a+.61);g.stroke();g.globalAlpha=1}}
}
// ---------- pílula de recarga: só DESENHA (o clique segue por PILL em coords de mundo, #inp) ----------
function gwPillNew(){
 const o=gwNew();if(!o)return null;
 const sc=MOB?1.3:1,w=124*sc,h=20*sc;
 o.sc=sc;o.w=w;o.h=h;
 // projeção do CHÃO do retângulo de MUNDO (x-w/2, y-H): é o que o PILL usa no hit-test, então o clique
 // no que está desenhado cai dentro dele (no 2D o desenho e o retângulo eram o mesmo espaço).
 o.box=gwD(o.i,'gwP',-w/2,0,w,h);
 o.fl=gwD(o.box,'gwPf',0,0,w,h);
 o.zn=gwD(o.box,'gwPz',0,1,0,h-2);
 o.cu=gwD(o.box,'gwPc',0,-1,3,h+2);
 o.tx=gwT(o.box,10*sc,w/2,h/2);
 o.hn=gwT(o.i,11,w+6,h/2);o.hn.textContent='[ R ]';o.hn.style.color='#cfe6ff';
 o.tr=gwD(o.i,'gwPt',0,0,8,5);
 o.k='';
 return o;
}
function gwPill(x,y,rlf,t,zs,ze,fail,own){
 if(!glLive)return;
 const P=GWU.pill||(GWU.pill=gwPillNew());if(!P)return;
 const py=y-(114+(P.sc-1)*12);
 gwPut(P,x,py);
 const p=1-rlf/100,inZ=!fail&&p*100>=zs&&p*100<=ze;
 const k=(p*1000|0)+'|'+zs+'|'+ze+'|'+fail+'|'+inZ+'|'+own;
 if(k!==P.k){P.k=k;
  P.fl.style.width=(P.w*p).toFixed(1)+'px';
  P.fl.style.background=fail?'linear-gradient(180deg,#8a2a2a,#4a1010)':'linear-gradient(180deg,#ffe27a,#b8780c)';
  P.fl.style.opacity='.55';
  P.zn.style.display=fail?'none':'';
  P.zn.style.left=(P.w*zs/100).toFixed(1)+'px';P.zn.style.width=(P.w*(ze-zs)/100).toFixed(1)+'px';
  P.zn.style.background='#3a9bff';P.zn.style.boxShadow='inset 0 '+(P.h*.4).toFixed(1)+'px rgba(255,255,255,.35)';
  P.zn.style.borderLeft='2px solid '+(inZ?'#fff':'#9fd2ff');
  P.zn.style.borderRight='2px solid '+(inZ?'#fff':'#9fd2ff');
  P.cu.style.left=(P.w*p-1.5).toFixed(1)+'px';
  P.box.style.borderColor=inZ?'#fff':fail?'#ff6a6a':'#ffe27a';
  P.box.style.borderWidth=(inZ?2.5:1.5)+'px';
  P.tr.style.left=(P.w*p-4).toFixed(1)+'px';
  P.tr.style.top='-6px';
  const tx=fail?'FALHOU':inZ&&MOB?'TOQUE!':'RECARREGANDO';
  if(P.tx.textContent!==tx)P.tx.textContent=tx;
  gwDisp(P.hn,own&&!fail);
 }
 if(own)PILL={x:x-P.w/2,y:py,w:P.w,h:P.h,t:Date.now()}; // coords de MUNDO, iguais às do 2D
}
// ---------- M7a: alvo marcado (drawMark), telegrafia do dash (s.Dh) e anéis do agarre do boss (s.K) ----------
// Eram os ÚLTIMOS desenhos 2D que sobravam na partida com glLive (90-sons.js); com o #c oculto viram DOM:
// alvo = canvas pequeno (mesmos traços do 2D), dash = div girada, anel = div com borda.
// telegrafias do CHÃO (dash do boss, anéis do agarre) ficam ATRÁS do resto do #gw, como no 2D
// (lá eram desenhadas antes da lista D: por baixo de jogadores/zumbis/itens)
function gwBack(s){try{if(GWU.el&&GWU.el.firstChild)GWU.el.insertBefore(s.g,GWU.el.firstChild);s.g.style.zIndex='0'}catch(e){}}
function gwSlot(n,idx,build){const A=GWU[n]||(GWU[n]=[]);let o=A[idx];if(!o&&idx<24)o=A[idx]=build();return o||null}
function gwPutR(o,x,y,rad){
 if(!o)return;
 const p=w2s(x,y),k=p[0].toFixed(1)+','+p[1].toFixed(1)+','+rad.toFixed(3);
 if(k!==o.kr){o.kr=k;o.g.style.transform='translate3d('+p[0].toFixed(1)+'px,'+p[1].toFixed(1)+'px,0) rotate('+rad.toFixed(3)+'rad)'}
 gwDisp(o.g,1);o.u=GWU.stamp;
}
function gwMarkNew(){
 const s=gwNew();if(!s)return null;
 const c=document.createElement('canvas');c.className='gwC';c.width=280;c.height=280;
 c.style.left='-70px';c.style.top='-70px';c.style.width='140px';c.style.height='140px';
 s.i.appendChild(c);s.cv=c;s.cx=c.getContext('2d');s.k='';s.lh=-1;
 return s;
}
// mesmo desenho do drawMark 2D (80-jogador.js:199): anel vermelho pulsando + 4 traços girando + ponto no centro
function gwMark(s,t){
 if(!glLive||!me||!me[26]||typeof ZSS==='undefined')return;
 const z=s.Z.find(q=>q[6]==me[26]);if(!z)return;
 const r=ZSS.get(z[6]);if(!r)return;
 const k=z[2],R_=k==3?52:k==2?26:18,hh=k==3?60:k==2?22:18,p=1+Math.sin(t/110)*.08;
 const o=gwSlot('mk',0,gwMarkNew);if(!o||!o.cx)return;
 gwPut(o,r.x,r.y);
 const key=(R_*p).toFixed(2)+'|'+(t/900*20|0);
 if(o.k===key&&o.lh===hh)return;
 o.k=key;
 if(o.lh!==hh){o.lh=hh;o.cv.style.top=(-70-hh*GWSIN)+'px'}
 const g=o.cx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,280,280);g.setTransform(2,0,0,2,140,140);
 g.save();g.rotate(t/900);g.strokeStyle='#ff3b3b';g.lineWidth=2.5;g.beginPath();g.arc(0,0,R_*p,0,7);g.stroke();
 g.beginPath();for(let i=0;i<4;i++){const a=i*1.5708;g.moveTo(Math.cos(a)*(R_*p-6),Math.sin(a)*(R_*p-6));g.lineTo(Math.cos(a)*(R_*p+8),Math.sin(a)*(R_*p+8))}g.stroke();g.restore();
 g.fillStyle='#ff3b3b';g.beginPath();g.arc(0,0,2.5,0,7);g.fill();
}
function gwDashNew(){
 const s=gwNew();if(!s)return null;gwBack(s);
 s.i.style.transformOrigin='0 0';
 s.r=gwD(s.i,'gwRect',0,-50,750,100);s.r.style.border='3px solid #f44';
 s.ch=[];for(let i=0;i<10;i++){const c=document.createElement('div');c.className='gwCh';
  c.style.left=(60+i*90-14)+'px';c.style.top='-14px';c.style.display='none';s.i.appendChild(c);s.ch.push(c)}
 s.k='';return s;
}
// mesmo retângulo de aviso do dash do boss que o 2D desenha em coordenadas de mundo (rotação = an)
function gwDash(x,y,an,len,tt){
 if(!glLive)return;
 const o=gwSlot('dh',GWU.dhn++,gwDashNew);if(!o)return;
 gwPutR(o,x,y,an);
 const fl=tt<1;
 o.r.style.background=fl?'rgba(255,40,40,'+(.12+tt*.25).toFixed(3)+')':'rgba(255,90,40,.35)';
 const k=(fl?'1|':'0|')+len;
 if(o.k!==k){o.k=k;
  if(o.r.style.width!==len+'px')o.r.style.width=len+'px';
  for(let i=0;i<o.ch.length;i++)o.ch[i].style.display=(fl&&60+i*90<len)?'block':'none';
 }
}
function gwRingNew(){
 const s=gwNew();if(!s)return null;gwBack(s);
 s.f=gwD(s.i,'gwRect',-70,-70,140,140);s.f.style.borderRadius='50%';
 s.b=gwD(s.i,'gwR',-70,-70,140,140);s.b.style.border='3px solid #f88';
 s.p=gwD(s.i,'gwR',-70,-70,140,140);s.p.style.border='3px solid #f22';
 s.k='';return s;
}
// mesmo anel do agarre do boss (90-sons.js, s.K): fechando (pg<1) ou estourando (pg>=1)
function gwRing(x,y,pg){
 if(!glLive)return;
 const o=gwSlot('kr',GWU.krn++,gwRingNew);if(!o)return;
 gwPut(o,x,y);
 const k=pg.toFixed(3);if(o.k===k)return;o.k=k;
 const r=(pg<1?70*pg:40+(pg-1)*50).toFixed(1);
 o.p.style.display='block';o.p.style.width=r+'px';o.p.style.height=r+'px';
 o.p.style.left='-'+r+'px';o.p.style.top='-'+r+'px';
 if(pg<1){
  o.f.style.background='rgba(255,40,40,'+(.12+pg*.25).toFixed(3)+')';
  o.b.style.display='block';o.p.style.borderColor='#f22';
 }else{
  o.f.style.background='transparent';o.b.style.display='none';
  o.p.style.borderColor='rgba(210,185,140,'+Math.max(0,1-(pg-1)).toFixed(2)+')';
 }
}
// ---------- fim do quadro: esconde quem não foi usado e rearma os contadores ----------
function gwEnd(s){
 if(!glLive||!gwInit())return;
 const t0=pfStart();
 if(GWU.zo!==ZO){GWU.zo=ZO;GWU.el.style.setProperty('--gwzo',String(ZO))}
 for(const k in GWU.pl){const o=GWU.pl[k];if(o&&o.u!==GWU.stamp)gwDisp(o.g,0)}
 for(let i=0;i<GWU.zl.length;i++){const o=GWU.zl[i];if(o&&o.u!==GWU.stamp)gwDisp(o.g,0)}
 const one=[GWU.boss,GWU.sel,GWU.shop,GWU.arc,GWU.pill,GWU.mk];
 for(let i=0;i<one.length;i++){const o=one[i];if(o&&o.u!==GWU.stamp)gwDisp(o.g,0)}
 for(const nm of['dh','kr']){const A=GWU[nm];if(A)for(let i=0;i<A.length;i++){const o=A[i];if(o&&o.u!==GWU.stamp)gwDisp(o.g,0)}}
 for(let i=0;i<GWU.lab.length;i++){const o=GWU.lab[i];if(o&&o.u!==GWU.stamp)gwDisp(o.g,0)}
 GWU.lz=GWU.zln;GWU.stamp++;GWU.zln=0;GWU.labn=0;GWU.dhn=0;GWU.krn=0;
 pfAdd('gwm',t0);
}
if(typeof window!=='undefined')window.__glw=()=>({ok:GWU.ok,zo:GWU.zo,stamp:GWU.stamp,
 zbars:GWU.lz|0,players:Object.keys(GWU.pl).length,boss:!!GWU.boss});
