// DEBUG — remova este arquivo ou rode node build.js --release
(function(){
 // defesa: fora de dev/local/?debug o arquivo não faz absolutamente nada
 const OK=location.protocol=='file:'||location.hostname=='localhost'||location.hostname=='127.0.0.1'||/^192\.168\./.test(location.hostname)||/[?&]debug/.test(location.search);
 if(!OK)return;

 const D={god:0,ammo:0,spd:0,fr:0,na:0,coll:0,hit:0,cnt:0,prof:0,pause:0,tab:'Jogador'};
 const ORIGZ=new Map();let spBase=null;

 // ---------- ganchos: embrulha step() e draw() (nada fora deste arquivo) ----------
 const _step=step;
 step=function(){
  if(!host)return _step();
  if(D.pause)return;
  pre();_step();post();
 };
 function pre(){
  const p=PL[id];
  if(D.fr||D.na){
   for(const z of Z){let o=ORIGZ.get(z);if(!o){o={s:z.s,d:z.d};ORIGZ.set(z,o)}
    if(D.fr){z.s=0;z.d=0}else z.d=0}
  }else if(ORIGZ.size){for(const[z,o]of ORIGZ){z.s=o.s;z.d=o.d}ORIGZ.clear()}
  if(!p)return;
  if(D.god){if(p.dead)p.dead=0;if(p.hp<p.mx)p.hp=p.mx}
  if(D.spd){if(spBase==null)spBase=p.sp;p.sp=spBase*D.spd}
  else if(spBase!=null){p.sp=1+Math.min(.6,.025*(p.lv-1));spBase=null}
 }
 function post(){
  const p=PL[id];if(!p)return;
  if(D.god){p.dead=0;p.hp=p.mx}
  if(D.ammo){const cu=p.sl[p.cs];if(cu&&cu.c<6){cu.a=magOf(cu.c,cu.l);p.rl=0;p.rz=null;p.arF=0}}
 }
 const _draw=draw;
 draw=function(){_draw();frame()};

 // ---------- ações ----------
 const me_=()=>PL[id];
 function drop(k,v){const p=me_();if(!p||!host)return;const a=Math.random()*6.283,r=34+Math.random()*12;
  let x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(blk(x,y,8)){x=p.x;y=p.y+38}
  IT.push({x,y,k,v:v||0,nt:0})}
 function giveIt(k,v){const p=me_();if(!p)return;give(p,k==8?{k:8,v:v||100}:{k,l:0})}
 function money(n){const p=me_();if(p)p.money+=n}
 function lvlUp(){const p=me_();if(p)giveXp(p,need(p.lv))}
 function xp(n){const p=me_();if(p)giveXp(p,n)}
 function revive(){const p=me_();if(!p)return;p.dead=0;p.hp=p.mx;if(ph==2)ph=1}
 function dropSelf(){const p=me_();if(!p)return;p.hp=0;p.dead=1;p.tz=null}
 function allMax(){const p=me_();if(!p)return;
  for(const wi of[0,1,2,3,4,5])give(p,{k:wi==0?7:wi==5?11:wi+1,l:6});
  for(const s of p.sl)if(s.c<6){s.l=6;s.a=magOf(s.c,6)}
  const i=p.sl.findIndex(s=>s.c<6);p.cs=i<0?0:i;p.cw=p.sl[p.cs].c;p.rl=0}
 function zspawn(k,n){const p=me_();if(!p)return;
  for(let i=0;i<(n||1);i++){const a=(p.fa||1.57)+(i-(n-1)/2)*.28,d=220+(i%3)*40;
   let x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;
   if(blk(x,y,26)){x=p.x+Math.cos(a)*90;y=p.y+Math.sin(a)*90}
   if(blk(x,y,20)){x=p.x;y=p.y-110}
   spawnZ(k,x,y);if(k==3){const z=Z[Z.length-1];if(z)z.em=1.3}}}
 function killAll(){if(host)Z.length=0}
 function bossNow(){if(!host)return;startBoss();if(bossPend)bossPend.t=.3}
 const AID='dbg_ally';
 function allyAlive(){const p=me_();if(!p||!host)return;if(!PL[AID])addP(AID,'ALIADO DBG');const a=PL[AID];if(!a)return;
  a.x=p.x+42;a.y=p.y+8;a.mx=100;a.hp=100;a.dead=0;a.c='#8fd0ff';a.sl=[{c:0,l:0,a:7}];a.cs=0;a.cw=0}
 function allyDown(){allyAlive();const a=PL[AID];if(!a)return;a.hp=0;a.dead=1;a.x=me_().x+42;a.y=me_().y+8}
 function allyDel(){delete PL[AID]}
 function shopTgl(){if(!host)return;const p=me_();if(shopOn){shopOn=0;shopT=0;shopP=0}else{openShop();if(p){shopX=p.x+70;shopY=p.y}}render()}
 function skipMin(n){if(!host)return;gt+=60*(n||1)}
 function tp(T){const p=me_();if(!p)return;
  if(T=='c'){p.x=2000;p.y=4500;p.tx=null;p.tz=null;return}
  const bs=BLD.filter(b=>b.T==T);const b=bs[0];if(!b){p.x=2000;p.y=4500;return}
  let x=b.dx+28,y=b.y+b.h+36;
  for(let i=0;i<24&&blk(x,y,22);i++){x=b.dx+28+((i%2)?1:-1)*34*Math.ceil(i/2);y=b.y+b.h+36+i*18}
  if(blk(x,y,22)){x=b.x+b.w/2;y=b.y+b.h+70}
  p.x=x;p.y=y;p.tx=null;p.tz=null;p.dd=0}
 function zoom(d){if(d){CAM=Math.max(.5,Math.min(2.2,CAM+d))}else CAM=.928;rs()}

 // ---------- painel ----------
 const BT='font:700 11px sans-serif;background:#160d0d;color:#d8d2c0;border:1px solid #4a1a1e;border-left:3px solid #8a1218;border-radius:2px;padding:5px 7px;margin:2px;cursor:pointer;text-align:left';
 const TABS=['Jogador','Itens','Inimigos','Mundo','Visual'];
 const P=document.createElement('div');
 P.style.cssText='position:fixed;left:6px;top:6px;z-index:31;width:min(360px,95vw);max-height:min(82vh,660px);overflow:auto;background:#0c0c10;border:2px solid #4a1a1e;border-left:5px solid #8a1218;border-radius:3px;color:#d8d2c0;font:12px/1.35 sans-serif;padding:6px;display:none;box-shadow:0 0 20px #000';
 P.innerHTML='<div id="dbt" style="display:flex;flex-wrap:wrap;margin-bottom:4px"></div><div id="dbc"></div>';
 document.body.appendChild(P);
 const BTN=document.createElement('button');
 BTN.textContent='DBG';
 BTN.style.cssText='position:fixed;left:4px;bottom:calc(10px + 54px*var(--hs,1));z-index:30;opacity:.35;padding:2px 5px;font:700 10px sans-serif;background:#0c0c10;color:#d83a3a;border:1px solid #4a1a1e;border-radius:2px;cursor:pointer';
 BTN.onpointerenter=()=>BTN.style.opacity=1;
 BTN.onpointerleave=()=>BTN.style.opacity=.35;
 BTN.onclick=()=>toggle();
 document.body.appendChild(BTN);

 let AC=[];
 const B=(t,f)=>{AC.push(f);return '<button data-a="'+(AC.length-1)+'" style="'+BT+'">'+t+'</button>'};
 const tog=(k,t)=>B(t+': '+(D[k]?'ON':'OFF'),()=>{D[k]=D[k]?0:1;if(k=='prof')window.__prof=D.prof?1:0;render()});
 const row=h=>'<div style="display:flex;flex-wrap:wrap">'+h+'</div>';
 const hdr=t=>'<div style="color:#d83a3a;font-weight:700;margin:6px 0 2px">'+t+'</div>';

 function render(){
  const c=document.getElementById('dbc'),tb=document.getElementById('dbt');
  tb.innerHTML=TABS.map(n=>'<button data-tab="'+n+'" style="'+BT+(n==D.tab?';border-color:#d83a3a;color:#ff6a5a':'')+'">'+n+'</button>').join('');
  AC=[];
  if(!host){c.innerHTML='<div style="color:#e0701a;padding:8px">debug só funciona no host (solo ou sala própria)</div>';return}
  let h='';
  if(D.tab=='Jogador'){
   h+=row(tog('god','Godmode')+B('Vida cheia',()=>{const p=me_();if(p){p.hp=p.mx;p.dead=0;if(ph==2)ph=1}})+B('Reviver a mim',revive)+B('Derrubar a mim',dropSelf));
   h+=hdr('Dinheiro')+row(B('+$100',()=>money(100))+B('+$1000',()=>money(1000))+B('+$10000',()=>money(10000)));
   h+=hdr('Nível / XP')+row(B('+1 nível',lvlUp)+B('+50 XP',()=>xp(50))+B('+1000 XP',()=>xp(1000)));
   h+=hdr('Munição')+row(tog('ammo','Munição infinita'));
   h+=hdr('Velocidade')+row(B('×1'+(D.spd==1?' ✓':''),()=>{D.spd=D.spd==1?0:1;render()})+B('×2'+(D.spd==2?' ✓':''),()=>{D.spd=D.spd==2?0:2;render()})+B('×3'+(D.spd==3?' ✓':''),()=>{D.spd=D.spd==3?0:3;render()}));
  }else if(D.tab=='Itens'){
   const L=[['Kit de cura',0],['Desfibrilador',1],['Bandagem',9],['Analgésico',10],['Melhoria arma',6],['Dinheiro $100',8,100],['Pistola',7],['Escopeta',2],['Rifle',3],['Metralhadora',4],['Lança-chamas',5],['Sniper',11]];
   for(const[n,k,v]of L){h+='<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="flex:1;min-width:112px">'+n+'</span>'
    +B('chão',()=>drop(k,v))+B('dar',()=>giveIt(k,v))+'</div>'}
   h+=hdr('Cheats')+row(B('★ Todas as armas no nível máx',allMax));
  }else if(D.tab=='Inimigos'){
   h+=hdr('Spawnar na frente (~250 px)')+row(B('Zumbi comum',()=>zspawn(0,1))+B('Corredor',()=>zspawn(1,1))+B('Gordão',()=>zspawn(2,1))+B('×10 comuns',()=>zspawn(0,10)));
   h+=row(B('⚠ BOSS KRAID',()=>zspawn(3,1))+B('☠ Matar todos',killAll));
   h+=hdr('Controle')+row(tog('fr','Congelar zumbis')+tog('na','Zumbi não ataca'));
   h+=hdr('Aliado de teste')+row(B('Aliado vivo',allyAlive)+B('Aliado caído (desfibrilador)',allyDown)+B('Remover aliado',allyDel));
  }else if(D.tab=='Mundo'){
   h+=row(B(shopOn?'Fechar loja agora':'Abrir loja agora',shopTgl));
   h+=row(B('+1 min',()=>skipMin(1))+B('+10 min',()=>skipMin(10))+B('⚠ Boss agora',bossNow));
   h+=hdr('Teleporte')+row(B('🏥 Hospital',()=>tp('h'))+B('🚓 Delegacia',()=>tp('p'))+B('🛒 Mercado',()=>tp('m'))+B('Centro/spawn',()=>tp('c')));
   h+=hdr('Tempo')+row(B(D.pause?'▶ Continuar':'⏸ Pausar',()=>{D.pause=D.pause?0:1;render()})+B('Avançar 1 quadro',()=>{_step()}));
  }else{
   h+=row(tog('prof','FPS/profiler (window.__prof)')+tog('coll','Colliders')+tog('hit','Hitboxes')+tog('cnt','Contadores'));
   h+=hdr('Câmera / zoom ('+CAM.toFixed(2)+')')+row(B('− zoom',()=>{zoom(-.12);render()})+B('+ zoom',()=>{zoom(.12);render()})+B('Reset',()=>{zoom(0);render()}));
  }
  c.innerHTML=h;
 }

 P.addEventListener('click',e=>{
  const t=e.target.closest?e.target.closest('button'):null;if(!t)return;
  if(t.hasAttribute('data-tab')){D.tab=t.getAttribute('data-tab');render();return}
  const i=t.getAttribute('data-a');if(i!=null&&AC[+i])AC[+i]();
 });
 function toggle(on){const vis=on==null?P.style.display!='block':on;P.style.display=vis?'block':'none';if(vis)render()}
 addEventListener('keydown',e=>{
  if(e.code=='Backquote'||e.key=='`'||e.code=='F2'){e.preventDefault();e.stopPropagation();toggle();return}
 },true);

 // ---------- overlay (canvas próprio sobre o jogo) ----------
 const ov=document.createElement('canvas');
 ov.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none';
 document.body.appendChild(ov);
 let fN=0,fT=performance.now(),fps=0;
 function frame(){
  fN++;const t=performance.now();if(t-fT>500){fps=Math.round(fN*1000/(t-fT));fN=0;fT=t}
  overlay();
 }
 function overlay(){
  if(!host||!snap||snap.ph!=1||!(D.coll||D.hit||D.cnt)){if(ov.style.display!='none')ov.style.display='none';return}
  ov.style.display='block';
  const w=innerWidth,h=innerHeight;
  if(ov.width!=w*DPR||ov.height!=h*DPR){ov.width=w*DPR|0;ov.height=h*DPR|0}
  const g=ov.getContext('2d');if(!g)return;
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,w,h);
  const SX=x=>(x-cx)*ZO+w/2,SY=y=>(y-cy)*ZO+h/2;
  g.lineWidth=1;
  if(D.coll){
   const vx0=cx-w/(2*ZO),vx1=cx+w/(2*ZO),vy0=cy-h/(2*ZO),vy1=cy+h/(2*ZO);
   for(const o of O){if(o.dead||o.t==6)continue;if(o.x>vx1||o.y>vy1||o.x+o.w<vx0||o.y+o.h<vy0)continue;
    g.strokeStyle=o.t==5?'#f0f':o.t==1?'#0f0':o.t==2?'#0ff':o.t==3?'#ff0':'#f80';
    g.strokeRect(SX(o.x),SY(o.y),o.w*ZO,o.h*ZO)}
   for(const b of BLD){if(b.x>vx1||b.y>vy1||b.x+b.w<vx0||b.y+b.h<vy0)continue;
    g.strokeStyle='#f80';g.strokeRect(SX(b.x),SY(b.y),b.w*ZO,b.h*ZO)}
   g.fillStyle='rgba(255,0,0,.55)';
   for(let wx=Math.floor(vx0/120)*120;wx<vx1;wx+=120)for(let wy=Math.floor(vy0/120)*120;wy<vy1;wy+=120)
    if(blk(wx,wy,0))g.fillRect(SX(wx)-1.5,SY(wy)-1.5,3,3);
  }
  if(D.hit){
   g.strokeStyle='#0ff';
   for(const z of Z){if(z.hp<=0)continue;g.beginPath();g.arc(SX(z.x),SY(z.y),Math.max(2,z.r*ZO),0,7);g.stroke()}
   g.strokeStyle='#ff0';
   for(const p of Object.values(PL)){if(p.dead)continue;g.beginPath();g.arc(SX(p.x),SY(p.y),14*ZO,0,7);g.stroke()}
  }
  if(D.cnt){
   const p=PL[id];
   const L=['FPS '+fps,'zumbis '+Z.length,'IT '+IT.length,'DECOR '+DECOR.length,'O '+O.length,
    'pos '+(p?Math.round(p.x)+','+Math.round(p.y):'-'),'tempo '+fmt(gt|0),'dif '+dl()];
   g.font='bold 12px monospace';g.textAlign='left';g.textBaseline='top';
   const po=P.style.display=='block',nar=w<700,ox0=po&&!nar?404:8,oy0=po&&nar?Math.min(h-140,P.getBoundingClientRect().bottom+6):8;
   L.forEach((s,i)=>{const y=oy0+i*15;g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(s,ox0,y);g.fillStyle='#7fe3ff';g.fillText(s,ox0,y)});
  }
 }
})();
