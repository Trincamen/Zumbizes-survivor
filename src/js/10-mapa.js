// ---------- mapa (por semente: igual em todos os aparelhos) ----------
function genMap(sd){let a=sd;const r=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},q=(m,n)=>m+r()*(n-m),o=[],B=[],TT=14;
 const hc=['#a87','#789','#b98','#6a8','#c96','#899'],rc=['#722','#445','#543','#264','#632'],cc=['#c33','#38c','#ccc','#ca3','#3a5','#a4c'];
 const mk=(x,y,w,h,T,c,d,H,part,nc)=>{const dx=x+q(24,w-80),b={x,y,w,h,H,c,d,dx,T,W:T=='W'};B.push(b);
  o.push({t:5,b,x,y,w,h:TT,wl:'n'},{t:5,b,x,y,w:TT,h,wl:'w'},{t:5,b,x:x+w-TT,y,w:TT,h,wl:'e'},{t:5,b,x,y:y+h-TT,w:dx-x,h:TT,wl:'s'},{t:5,b,x:dx+56,y:y+h-TT,w:x+w-dx-56,h:TT,wl:'s'});
  for(let p=0;p<part;p++){const mx=x+w*(p+1)/(part+1),gy=y+q(50,h-172);o.push({t:5,b,x:mx,y:y+TT,w:TT,h:gy-y-TT,wl:'i'},{t:5,b,x:mx,y:gy+68,w:TT,h:y+h-TT-70-gy-68,wl:'i'})}
  for(let k=0;k<nc;k++)o.push({t:3,x:q(x+22,x+w-58),y:q(y+22,y+h-95),w:36,h:36})};
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
  else if(t<.62){const w=q(260,360),h=q(180,300);mk(bx+q(5,375-w),by+q(5,375-h),w,h,'W','#778','#445',80,0,6)}
  else if(t<.72){const w=q(260,360),h=q(230,300);mk(bx+q(5,375-w),by+q(5,375-h),w,h,'x',hs_(),rs_(),70,1,3)}
  else if(t<.88){const n=q(5,9)|0;for(let k=0;k<n;k++)o.push({t:1,x:bx+q(30,330),y:by+q(30,330),w:24,h:24})}
  else{const n=q(3,6)|0;for(let k=0;k<n;k++)o.push({t:3,x:bx+q(20,320),y:by+q(20,320),w:36,h:36})}}
 o.push({t:6,x:0,y:RY0,w:920,h:600},{t:6,x:1080,y:RY0,w:1840,h:600},{t:6,x:3080,y:RY0,w:920,h:600});
 for(let k=0;k<70;k++){const hz=r()<.5,no=r()<.5,rl=hz?(no?1+(r()*4|0):8+(r()*4|0))*500:(1+(r()*7|0))*500,u=hz?q(80,3900):no?q(80,2400):q(3580,5900),c=hz?{x:u,y:rl-23+q(-25,25),w:92,h:46}:{x:rl-23+q(-25,25),y:u,w:46,h:92};
  if(Math.abs(c.x-2000)<250&&Math.abs(c.y-4500)<250||B.some(b=>c.x<b.x+b.w&&c.x+c.w>b.x&&c.y<b.y+b.h&&c.y+c.h>b.y))continue;c.t=2;c.c=cc[r()*6|0];o.push(c)}
 const fr=[];o.forEach((q,i)=>q.i=i);for(const c of o)if(c.t==2&&r()<.18)fr.push([c.x+c.w/2,c.y+c.h/2-8,1.1,c.y+c.h+1,null,c]);for(const b of B)if(b.T=='x'&&r()<.12){b.fire=1;fr.push([b.x+b.w*.3-b.H*.3,b.y-b.H+14,1.6,b.y+b.h+2,b],[b.x+b.w*.7-b.H*.3,b.y-b.H+26,1.3,b.y+b.h+2,b])}o.FR=fr;o.B=B;return o}
let OB=[];function buildOB(){OB=[];for(const o of O)for(let gy=Math.max(0,(o.y-30)/200|0);gy<=Math.min(29,(o.y+o.h+30)/200|0);gy++)for(let gx=Math.max(0,(o.x-30)/200|0);gx<=Math.min(19,(o.x+o.w+30)/200|0);gx++)(OB[gy*20+gx]||(OB[gy*20+gx]=[])).push(o)}
const blk=(x,y,r)=>{if(x<0||y<0||x>=MW||y>=MH)return 1;const L=OB[(y/200|0)*20+(x/200|0)];if(L)for(const o of L)if(!o.dead&&x>o.x-r&&x<o.x+o.w+r&&y>o.y-r&&y<o.y+o.h+r)return 1;return 0},zn=y=>y<RY0?0:y>RY1?1:2;
const bAt=(x,y)=>{for(const b of BLD)if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return b;return null};
function freePos(){for(let t=0;t<60;t++){const x=R(80,MW-80),y=R(80,MH-80);if(!blk(x,y,24))return[x,y]}return[2000,4500]}
function inPos(bs){bs=bs&&bs.length?bs:BLD;for(let t=0;t<40;t++){const b=bs[Math.random()*bs.length|0],x=R(b.x+26,b.x+b.w-26),y=R(b.y+26,b.y+b.h-70);if(!blk(x,y,22))return[x,y]}return freePos()}