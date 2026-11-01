// ---------- mapa (por semente: igual em todos os aparelhos) ----------
// 1b-ii-b2: casas GLB de src/assets/casas/. Por modelo: [footprint_x m, footprint_z m, wall_height m,
// doorX_m] (doorX = x do nó zombie_entry_door no GLB, frente +Z/sul). Usado por genMap (vão dx) e por
// 89c-glpredios.js (escala anisotrópica) — o base64 dos GLBs fica só em 89c.
const CASA_EXT=[[6.4,5.2,2.4,.1],[8.4,6,2.4,-1.55],[6.8,6.4,2.4,1.5],[10.4,6.4,2.4,-1],[7.4,5.6,2.4,0],
 [10.4,3.8,2.3,3.25],[9.4,6.8,2.4,0],[7.2,7.2,2.4,0],[7.4,5.6,2.4,0],[8,5.2,2.4,0]];
// Modelo da casa 'x': DETERMINÍSTICO e sem RNG (igual em host e clientes). Só considera modelos cuja porta
// cabe no vão desta casa (senão o clamp de dx desalinharia portas de parede); entre eles prefere a proporção
// mais próxima de w/h. st.u = modelos já usados no mapa: enquanto faltar modelo, a casa pega o melhor ainda
// não usado (garante os 10 no mapa); depois fica entre os 5 melhores, escolhido pelo hash de (x,y,w,h).
function casaPick(x,y,w,h,st){
 const t=Math.log(w/Math.max(1,h)),a=[],f=[];
 for(let i=0;i<CASA_EXT.length;i++){
  const e=CASA_EXT[i],d=Math.abs(Math.log(e[0]/e[1])-t),px=x+w/2+e[3]*(w/e[0])-28,it=[d,i];
  a.push(it);if(px>=x+14&&px<=x+w-70)f.push(it)} // 14 = TT das paredes 'x' (genMap)
 const cmp=(p,q)=>p[0]-q[0]||p[1]-q[1];
 a.sort(cmp);f.sort(cmp);
 const L=f.length?f:a;
 const u=(Math.imul(x|0,73856093)^Math.imul(y|0,19349663)^Math.imul(w|0,83492791)^Math.imul(h|0,2654435761))>>>0;
 if(st&&st.u){let miss=0;for(let i=0;i<CASA_EXT.length;i++)if(!st.u[i]){miss=1;break}
  if(miss){for(let r=0;r<L.length;r++){const i=L[r][1];if(!st.u[i]){st.u[i]=1;return i}}
   // nenhum modelo livre cabe nesta casa: usa o livre de melhor proporção mesmo que a porta precise de clamp
   for(let r=0;r<a.length;r++){const i=a[r][1];if(!st.u[i]){st.u[i]=1;return i}}}}
 return L[u%5][1];
}
const LOOTC={"h":[[-3.05,-5.2,1.4,0.7],[2.6,-4.7,1.4,0.6],[3.5,-6.3,0.9,0.7],[-9.9,-6.2,1.4,0.9],[-9.9,-4.4,1.4,0.9],[-9.9,-2.6,1.4,0.9],[-6.2,-6.2,1.4,0.6],[9.8,-6.4,1.1,0.6],[10.55,-3.9,0.9,0.7],[-10.2,2.35,1.4,0.9],[-10.2,4.65,1.4,0.9],[-8.0,6.35,1.4,0.9],[-6.1,6.35,0.8,0.6],[-2.8,3.5,1.2,0.8],[-4.65,6.15,0.6,0.6],[-0.6,6.3,0.6,0.6],[1.15,6.68,1.4,0.6],[3.25,6.68,1.4,0.6],[4.4,1.55,1.4,0.6],[4.95,6.25,0.8,0.7],[9.85,2.95,1.4,0.6],[7.8,6.25,1.4,0.7],[10.55,4.5,0.8,0.7]],"p":[[-4.7,-3.5,1.4,0.7],[5.2,-3.4,1.4,0.6],[7.55,-4.9,0.9,0.7],[-6.75,0.7,1.1,0.6],[-7.65,2.0,0.8,0.6],[-6.75,4.7,1.1,0.6],[-7.7,3.5,1.4,0.6],[-3.35,5.55,1.2,0.8],[-1.2,5.65,1.2,0.6],[1.2,5.65,1.2,0.6],[1.0,0.75,1.2,0.8],[3.0,5.2,1.4,0.9],[4.9,5.2,1.4,0.9],[6.7,5.2,1.4,0.9],[7.1,0.8,1.1,0.6],[7.72,2.2,1.2,0.6]],"m":[[-2.8,-1.8,1.4,0.6],[-2.8,-0.2,1.4,0.6],[2.2,-1.2,1.4,0.6],[4.45,-0.5,1.4,0.8],[3.4,-2.9,1.4,0.6],[-2.1,-3.0,1.0,0.6],[1.45,-2.95,1.0,0.7],[3.9,0.35,0.8,0.7],[-2.8,3.15,1.2,0.6],[-4.0,3.15,1.2,0.6],[-4.3,1.7,1.2,0.9],[1.2,2.9,1.1,0.6],[2.3,3.05,0.8,0.6],[4.5,1.7,0.7,0.6]],"c0":[[-2.0,1.95,1.4,0.9],[-0.6,2.1,0.8,0.7],[0.1,2.15,1.4,0.6],[-1.9,-0.25,1.2,0.8],[-2.7,-1.4,1.4,0.8],[2.55,-2.1,1.0,0.7]],"c1":[[-3.6,0.6,1.4,0.8],[-2.2,0.55,1.1,0.7],[-3.3,2.55,1.4,0.6],[-3.6,-2.5,1.0,0.7],[3.1,2.35,1.4,0.9],[1.05,2.55,1.1,0.6],[1.7,-2.55,1.4,0.6],[3.65,-2.45,0.8,0.7],[2.4,-0.45,1.2,0.8]],"c2":[[-2.0,2.55,1.0,0.7],[0.1,2.55,1.0,0.7],[-0.5,-0.4,1.2,0.8],[2.85,0.7,1.4,0.6],[2.85,2.65,0.8,0.7],[-2.85,-2.65,1.0,0.7]],"c3":[[-4.6,-1.5,1.4,0.8],[-3.0,-1.25,1.2,0.8],[-0.6,0.05,1.4,0.6],[1.1,-0.05,0.8,0.7],[-4.0,2.3,1.4,0.9],[-2.05,2.7,1.1,0.6],[0.65,2.65,1.1,0.6],[4.0,0.7,1.0,0.7],[2.35,2.65,1.4,0.6],[2.0,-0.4,1.0,0.7]],"c4":[[-3.1,-1.3,1.4,0.8],[-1.7,-1.1,1.1,0.7],[2.0,-2.35,1.4,0.6],[3.3,-2.25,0.8,0.7],[2.1,-0.85,1.2,0.8],[2.55,2.15,1.4,0.9],[-0.55,2.35,1.1,0.6]],"c5":[[-4.0,1.15,1.4,0.9],[-2.45,1.35,1.1,0.6],[-0.6,1.35,1.4,0.8],[1.9,1.45,1.4,0.6],[4.05,1.35,0.8,0.7],[-0.3,-1.2,1.2,0.8],[4.55,-1.3,1.0,0.7]],"c6":[[-2.5,-2.6,1.4,0.8],[-2.7,-1.4,1.1,0.7],[2.7,-2.85,1.4,0.6],[4.25,-2.7,0.8,0.7],[2.5,-1.0,1.2,0.8],[-3.5,2.7,1.4,0.9],[-0.7,2.9,1.1,0.6],[-4.0,1.0,1.0,0.7],[3.45,2.7,1.4,0.9],[0.8,2.95,1.0,0.7],[4.15,1.0,1.0,0.7]],"c7":[[-3.0,-1.8,1.4,0.8],[1.6,-1.3,1.2,0.8],[-1.45,-3.0,1.0,0.7],[-2.45,2.9,1.4,0.9],[-0.7,3.1,1.1,0.6],[1.7,3.0,1.1,0.6],[3.1,1.3,0.8,0.6],[3.15,3.0,1.0,0.7]],"c8":[[-3.1,-1.3,1.4,0.8],[-1.6,-1.1,1.2,0.8],[2.25,-2.35,1.4,0.6],[3.25,-2.1,0.8,0.7],[-2.55,2.1,1.4,0.9],[1.5,2.25,1.1,0.6]],"c9":[[-0.1,1.95,1.4,0.8],[-0.1,0.8,1.1,0.7],[0.92,-2.05,1.0,0.7],[-2.65,2.1,1.4,0.6],[-3.5,-2.0,0.8,0.7],[-2.9,-0.4,1.2,0.8],[2.9,1.9,1.4,0.9],[1.6,2.15,1.1,0.6],[3.5,-2.0,1.0,0.7]]};
// interior dos prédios: colliders nos MÓVEIS reais (nós loot_* dos GLB, tamanho aproximado); footprint do GLB em metros
const LOOT_FP={h:[22.4,14.4],p:[16.4,12.4],m:[10,7]};
const CEN_HV_=[0,1,2,3,4,5,7,8,9,10,11,12]; // mesmas linhas horizontais de CEN_HV (86-cenario.js)
function genMap(sd){let a=sd;const r=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},q=(m,n)=>m+r()*(n-m),o=[],B=[],TT=14;
 const hc=['#a87','#789','#b98','#6a8','#c96','#899'],rc=['#722','#445','#543','#264','#632'],cc=['#c33','#38c','#ccc','#ca3','#3a5','#a4c'];
 const cst={u:{}}; // modelos de casa já usados neste mapa (casaPick)
 const mk=(x,y,w,h,T,c,d,H,part,nc)=>{const cm0=T=='x'?casaPick(x,y,w,h,cst):-1;
  // casa_05 (índice 4): a cerca do quintal passa de ±5,4 m × -4,4..4,1 m e invadia a rua; encolhe a casa para a cerca caber no terreno original
  if(cm0==4){const nw=w*7.4/11.2,nh=h*5.6/8.8;x+=(w-nw)/2;y+=(h-nh)/2-.15*nh/5.6;w=nw;h=nh}
  const dx0=x+q(24,w-80),cm_=cm0,
  dx=(T=='h'||T=='p'||T=='m')?x+w/2-28:cm_<0?dx0:Math.max(x+TT,Math.min(x+w-TT-56,Math.round(x+w/2+CASA_EXT[cm_][3]*(w/CASA_EXT[cm_][0])-28))),
  b={x,y,w,h,H,c,d,dx,T,W:0,sm:T=='x'&&w*h<32000};if(cm_>=0)b.cm=cm_;B.push(b);
  o.push({t:5,b,x,y,w,h:TT,wl:'n'},{t:5,b,x,y,w:TT,h,wl:'w'},{t:5,b,x:x+w-TT,y,w:TT,h,wl:'e'},{t:5,b,x,y:y+h-TT,w:dx-x,h:TT,wl:'s'},{t:5,b,x:dx+56,y:y+h-TT,w:x+w-dx-56,h:TT,wl:'s'});
  // divisórias e caixas ALEATÓRIAS de dentro foram removidas (ficavam onde não há nada no GLB); q() continua sendo chamado
  // para não deslocar o RNG do mapa. No lugar: colliders dos móveis reais (LOOTC), só em casas não pequenas.
  for(let p=0;p<part;p++)q(50,h-172);
  for(let k=0;k<nc;k++){q(x+22,x+w-58);q(y+22,y+h-95)}
  const lk=T=='x'?(cm_>=0?'c'+cm_:null):T,lc=lk&&LOOTC[lk];
  if(lc&&!b.sm){const fp=LOOT_FP[lk]||[CASA_EXT[cm_][0],CASA_EXT[cm_][1]],kx=w/fp[0],kz=h/fp[1];
   for(const[lx,ly,lw,ld]of lc){const cx=x+w/2+lx*kx,cy=y+h/2-ly*kz,ww=Math.max(14,lw*kx*.85),hh=Math.max(14,ld*kz*.85);
    if(cx-ww/2<x+TT+6||cx+ww/2>x+w-TT-6||cy-hh/2<y+TT+6||cy+hh/2>y+h-TT-6)continue;
    if(cy+hh/2>y+h-TT-80&&cx+ww/2>dx-20&&cx-ww/2<dx+76)continue;
    o.push({t:7,x:cx-ww/2,y:cy-hh/2,w:ww,h:hh})}}
  if(cm_==4){const kx=w/CASA_EXT[4][0],kz=h/CASA_EXT[4][1],cx=x+w/2,cy=y+h/2,th=Math.max(7,.22*kx),
   F=(x0,x1,y0,y1)=>o.push({t:7,x:cx+x0*kx,y:cy-y1*kz,w:Math.max(th,(x1-x0)*kx),h:Math.max(th,(y1-y0)*kz)});
   F(-5.5,-5.3,-4.5,4.2);F(5.3,5.5,-4.5,4.2);F(-5.5,-1.1,-4.5,-4.3);F(1.1,5.5,-4.5,-4.3);F(-5.5,5.5,4.0,4.2)} // cerca do quintal (casa_05)
 };
 const cells=[];for(const j of ROWS)for(let i=0;i<7;i++)cells.push([i,j]);for(let i=cells.length-1;i>0;i--){const k=r()*(i+1)|0,t=cells[i];cells[i]=cells[k];cells[k]=t}
 const used={},spec={},placed=[],pick=(T,wd)=>{const cand=[];for(const[i,j]of cells){const k0=i+','+j;if(used[k0]||(wd&&used[(i+1)+','+j]))continue;const cx=wd?(i+1)*500:i*500+250,cy=j*500+250;let md=1e9;for(const q of placed)md=Math.min(md,Math.hypot(q[0]-cx,q[1]-cy));cand.push([md+r()*300,i,j,cx,cy])}
 if(!cand.length)return;cand.sort((a,b)=>b[0]-a[0]);const c=cand[Math.min(cand.length-1,r()*3|0)];used[c[1]+','+c[2]]=1;if(wd)used[(c[1]+1)+','+c[2]]=1;spec[c[1]+','+c[2]]=T;placed.push([c[3],c[4]])};
 pick('h',1);pick('p',0);pick('m',0);if(r()<.5)pick('h',1);if(r()<.4)pick('p',0);if(r()<.6)pick('m',0);
 for(const j of ROWS)for(let i=0;i<8;i++){const bx=i*500+60,by=j*500+60,key=i+','+j,t=r();
  if(spec[key]){const T=spec[key];if(T=='h')mk(bx+4,by+10,876,360,'h','#dde6ea','#9bb',88,2,8);else if(T=='p')mk(bx+10,by+10,360,360,'p','#5a7aa8','#234',84,1,6);else mk(bx+5,by+10,370,350,'m','#d9a05a','#a52',84,1,8);continue}
  if(used[key])continue;
  const hs_=()=>hc[r()*6|0],rs_=()=>rc[r()*5|0];
  if(t<.40){const w=q(150,310),h=q(140,270);mk(bx+q(8,372-w),by+q(8,372-h),w,h,'x',hs_(),rs_(),70,0,1+(r()*2|0))}
  else if(t<.54){const w1=q(120,170),h1=q(120,190),w2=q(120,170),h2=q(120,190);mk(bx+q(6,170-w1),by+q(6,372-h1),w1,h1,'x',hs_(),rs_(),70,0,1);mk(bx+190+q(0,170-w2),by+q(6,372-h2),w2,h2,'x',hs_(),rs_(),70,0,1)}
  else if(t<.62){const n=q(5,9)|0;for(let k=0;k<n;k++)o.push({t:1,x:bx+q(30,330),y:by+q(30,330),w:24,h:24})} // galpão W removido (não era GLB): vira terreno com árvores
  else if(t<.72){const w=q(260,360),h=q(230,300);mk(bx+q(5,375-w),by+q(5,375-h),w,h,'x',hs_(),rs_(),70,1,3)}
  else if(t<.88){const n=q(5,9)|0;for(let k=0;k<n;k++)o.push({t:1,x:bx+q(30,330),y:by+q(30,330),w:24,h:24})}
  else{const n=q(3,6)|0;for(let k=0;k<n;k++)o.push({t:3,x:bx+q(20,320),y:by+q(20,320),w:36,h:36})}}
 o.push({t:6,x:0,y:RY0,w:920,h:600},{t:6,x:1080,y:RY0,w:1840,h:600},{t:6,x:3080,y:RY0,w:920,h:600});
 for(let k=0;k<70;k++){const hz=r()<.5,no=r()<.5,rl=hz?(no?1+(r()*4|0):8+(r()*4|0))*500:(1+(r()*7|0))*500,u=hz?q(80,3900):no?q(80,2400):q(3580,5900),c=hz?{x:u,y:rl-23+q(-25,25),w:92,h:46}:{x:rl-23+q(-25,25),y:u,w:46,h:92};
  if(Math.abs(c.x-2000)<250&&Math.abs(c.y-4500)<250||B.some(b=>c.x<b.x+b.w&&c.x+c.w>b.x&&c.y<b.y+b.h&&c.y+c.h>b.y))continue;c.t=2;c.c=cc[r()*6|0];o.push(c)}
 // engarrafamentos: grupos de carros parados atravessando a rua (aleatórios por semente)
 for(let jn=0;jn<7;jn++){const vert=r()<.5,line=vert?(1+(r()*7|0))*500:CEN_HV_[r()*CEN_HV_.length|0]*500,u=vert?(r()<.5?q(200,2300):q(3700,5800)):q(200,3800),n=3+(r()*3|0);
  if(Math.abs(u-2000)<350&&Math.abs(line-4500)<350&&!vert)continue;
  for(let k=0;k<n;k++){const al=u+q(-70,70),ac=line+q(-42,42),turn=r()<.25,w=(vert?!turn:turn)?46:92,h=w==46?92:46,c={x:(vert?ac:al)-w/2,y:(vert?al:ac)-h/2,w,h,t:2,c:cc[r()*6|0]};
   if(c.x<20||c.y<20||c.x+w>MW-20||c.y+h>MH-20||(c.y+h>RY0-150&&c.y<RY1+150)||(Math.abs(c.x+w/2-2000)<250&&Math.abs(c.y+h/2-4500)<250))continue;
   if(B.some(b=>c.x<b.x+b.w&&c.x+c.w>b.x&&c.y<b.y+b.h&&c.y+c.h>b.y)||o.some(p=>p.t==2&&c.x<p.x+p.w&&c.x+c.w>p.x&&c.y<p.y+p.h&&c.y+c.h>p.y))continue;
   c.jam=1;o.push(c)}}
 const fr=[];o.forEach((q,i)=>q.i=i);for(const c of o)if(c.t==2&&r()<.18)fr.push([c.x+c.w/2,c.y+c.h/2-8,1.1,c.y+c.h+1,null,c]);for(const b of B)if(b.T=='x'&&r()<.12){b.fire=1;fr.push([b.x+b.w*.3-b.H*.3,b.y-b.H+14,1.6,b.y+b.h+2,b],[b.x+b.w*.7-b.H*.3,b.y-b.H+26,1.3,b.y+b.h+2,b])}o.FR=fr;o.B=B;return o}
let OB=[];function buildOB(){OB=[];for(const o of O)for(let gy=Math.max(0,(o.y-30)/200|0);gy<=Math.min(29,(o.y+o.h+30)/200|0);gy++)for(let gx=Math.max(0,(o.x-30)/200|0);gx<=Math.min(19,(o.x+o.w+30)/200|0);gx++)(OB[gy*20+gx]||(OB[gy*20+gx]=[])).push(o)}
const blk=(x,y,r)=>{if(x<0||y<0||x>=MW||y>=MH)return 1;const L=OB[(y/200|0)*20+(x/200|0)];if(L)for(const o of L)if(!o.dead&&x>o.x-r&&x<o.x+o.w+r&&y>o.y-r&&y<o.y+o.h+r)return 1;return 0},zn=y=>y<RY0?0:y>RY1?1:2;
const bAt=(x,y)=>{for(const b of BLD)if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return b;return null};
function freePos(){for(let t=0;t<60;t++){const x=R(80,MW-80),y=R(80,MH-80);if(!blk(x,y,24))return[x,y]}return[2000,4500]}
function inPos(bs){bs=bs&&bs.length?bs:BLD;for(let t=0;t<40;t++){const b=bs[Math.random()*bs.length|0],x=R(b.x+26,b.x+b.w-26),y=R(b.y+26,b.y+b.h-70);if(!blk(x,y,22))return[x,y]}return freePos()}