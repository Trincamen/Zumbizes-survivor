// ---------- HOST: simulação ----------
let gt=0,lastMin=0,bossP=0,shopP=0,bossHold=0,bossN=0,sa=0,ph=0,rd=0,PL={},Z=[],IT=[],FX=[],sp=0,brk=0,bn=[0,'',0],minP=1,tick=0,sd=0,RK=[],shopOn=0,shopT=0,shopX=0,shopY=0,fid=0,zid=0,PJ=[],DEADL=[],EV=[],evid=0,lastResp=0,bossPend=null;
function addP(i,n){if(PL[i]||Object.keys(PL).length>=8)return;const k=Object.keys(PL).length;
 PL[i]={id:i,n:n.replace(/</g,'&lt;'),c:`hsl(${k*47+200},90%,60%)`,x:2000+R(-60,60),y:4500+R(-60,60),hp:100,mx:100,xp:0,lv:1,dead:0,sl:[{c:0,l:0,a:7}],cs:0,cw:0,tx:null,ty:null,tz:null,sp:1,pr:0,bk:0,rc:0,aim:1.57,ls:0,bkf:0,arT:0,arF:0,rz:[.5,.7],pend:0,o:null,cd:0,fa:1.57,k:0,money:0,da:20,bt:0,rl:0,dd:0,jx:0,jy:0,jt:0}}
function rmSlot(p,n){p.sl.splice(n,1);if(n<p.cs)p.cs--;p.cw=p.sl[p.cs].c}
function spawnLoot(){if(IT.length>260)return;const n=Object.keys(PL).length,put=(k,c,f,v)=>{for(let i=0;i<c;i++){const[x,y]=f();IT.push({x,y,k,v})}},
  inB=T=>()=>inPos(BLD.filter(b=>b.T==T)),anyH=()=>inPos(BLD.filter(b=>b.T=='x'||b.W)),out=()=>freePos(),wk=()=>[2,3,4,5,2,3,11,4][Math.random()*8|0],cv=()=>20+(Math.random()*3|0)*10,LC=()=>{const r=Math.random();return r<.66?inB('p')():r<.76?inB('h')():r<.96?anyH():out()};
 put(0,1+Math.ceil(n/2),inB('h'));put(1,Math.max(1,Math.ceil(n/3)),inB('h'));put(9,3,inB('h'));put(10,1,inB('h'));put(0,1,out);
 for(let i=0;i<n+2;i++)put(wk(),1,LC);put(6,n+1,LC);
 put(9,8,inB('m'));put(10,4,inB('m'));put(8,4,inB('m'),0);for(const it of IT)if(it.k==8&&!it.v)it.v=cv();
 put(9,10+n,anyH);put(9,8,out);put(10,3,anyH);put(7,n+2,anyH);put(7,2,inB('p'));for(let i=0;i<Math.ceil(n/2);i++)put(wk(),1,anyH);
 for(let i=0;i<n+6;i++){const[x,y]=(i%2?anyH:out)();IT.push({x,y,k:8,v:cv()})}}
function start(){if(Object.keys(PL).length<minP)return;sd=Math.random()*1e9|0;O=genMap(sd);BLD=O.B;buildOB();initGrid();RK=[];PJ=[];DEADL=[];EV=[];bossPend=null;shopOn=0;ph=1;gt=0;lastMin=0;bossP=0;shopP=0;bossHold=0;bossN=0;sa=0;Z=[];IT=[];for(const p of Object.values(PL)){p.x=2000+R(-60,60);p.y=4500+R(-60,60)}spawnLoot();bn=[Date.now(),'SOBREVIVA!',0]}
function reset(){const o=Object.values(PL);PL={};o.forEach(p=>addP(p.id,p.n));ph=0;sd=0}
const dl=()=>1+Math.floor(gt/60);
function startBoss(){bossN++;const e=bossEdge();bossPend={t:5,x:e[0],y:e[1]};bn=[Date.now(),'⚠ BOSS KRAID CHEGANDO ⚠',1]}
function minuteTick(m){const ba=bossPend||Z.some(z=>z.k==3&&z.hp>0);if(m%6==0)spawnLoot();let boss=0;
 if(!ba&&!shopOn&&gt>=bossHold){bossP+=10;if(Math.random()*100<bossP){bossP=0;boss=1;startBoss()}}
 if(!boss&&!ba&&!shopOn&&m>=6){shopP+=10;if(Math.random()*100<shopP){shopP=0;openShop();bossHold=gt+120;bossP=0}}}
function bossEdge(){const L=Object.values(PL).filter(p=>!p.dead);let best=null,bs=1e9;
 for(let i=0;i<20;i++){const sd=Math.random()*4|0,u=Math.random();let x,y;if(sd==0){x=60+u*(MW-120);y=60}else if(sd==1){x=60+u*(MW-120);y=MH-60}else if(sd==2){x=60;y=60+u*(MH-120)}else{x=MW-60;y=60+u*(MH-120)}
  if(blk(x,y,34)||(L.length&&!L.some(p=>zn(p.y)==zn(y)||zn(p.y)==2)))continue;const d=L.length?Math.min(...L.map(p=>Math.hypot(p.x-x,p.y-y))):1400,sc=Math.abs(d-1400);if(sc<bs){bs=sc;best=[x,y]}}
 return best||[MW/2,60]}
function spawnZ(k,px,py){const L=Object.values(PL).filter(p=>!p.dead);if(!L.length)return;const p=L[Math.random()*L.length|0];let x,y;
 for(let i=0;i<14;i++){const a=R(0,6.28),d=R(650,1700);x=Math.min(MW-20,Math.max(20,p.x+Math.cos(a)*d));y=Math.min(MH-20,Math.max(20,p.y+Math.sin(a)*d));if(!blk(x,y,24)&&(zn(y)==zn(p.y)||zn(p.y)==2))break}
 if(px!=null){x=px;y=py}
 const r=Math.random();const D=dl();if(k==null)k=D>=3&&r<Math.min(.22,.06+.015*D)?2:D>=2&&r<.35?1:0;
 const T=[[30+D*4,55,12,10,10],[20+D*3,115,10,8,12],[200+D*18,42,18,25,40],[Math.round((500+bossN*130+D*40)*(1+.5*(L.length-1))),50,32,40,400+D*30]][k];
 Z.push({i:++zid,x,y,k,v:Math.random()*4|0,hp:T[0],mx:T[0],s:T[1]*R(.9,1.1),r:T[2],d:T[3],xp:T[4],h:{},fa:1.57})}
function mkOpts(p){if(p.pend>0&&!p.o)p.o=[0,1,2,3,4,5].sort(()=>Math.random()-.5).slice(0,3)}
function giveXp(p,x){p.xp+=x;while(p.xp>=need(p.lv)){p.xp-=need(p.lv);p.lv++;const om=p.mx;p.mx=100+8*(p.lv-1);p.hp=Math.min(p.mx,p.hp+(p.mx-om));p.sp=1+Math.min(.6,.025*(p.lv-1));p.pr=Math.min(.3,.012*(p.lv-1));p.bk=Math.min(.7,.06*(p.lv-1))}}
function skill(p,k){[()=>p.dd*=1.02,()=>p.sp*=1.05,()=>{p.mx*=1.25;p.hp=p.mx},()=>p.rt*=1.02,()=>p.ra*=1.05,()=>p.rc++][k]()}
function hurt(z,d,p){if(z.hp<=0)return;z.hp-=d;if(z.k==3)z.h[p.id]=1;if(z.hp<=0)kill(z,p)}
function cash(z){if(z.k==3){for(let i=0;i<6;i++)IT.push({x:z.x+R(-70,70),y:z.y+R(-70,70),k:8,v:80,ex:Date.now()+90000})}else{const c=[[.35,8],[.4,10],[1,30]][z.k];if(Math.random()<c[0])IT.push({x:z.x,y:z.y,k:8,v:c[1],ex:Date.now()+60000})}}
const isW=k=>k==7||k==11||(k>=2&&k<=5),wiOf=k=>k==7?0:k==11?5:k-1,needsConf=(p,it)=>isW(it.k)&&p.sl.length>=6&&!p.sl.some(q=>q.c==wiOf(it.k));
function give(p,it){const cu=p.sl[p.cs];
 if(it.k==6){if(cu.l>=6)return 0;cu.l++;cu.a=magOf(cu.c,cu.l)}else if(it.k==8)p.money+=it.v;
 else if(it.k<2||it.k==9||it.k==10){if(p.sl.length>=6)return 0;p.sl.push({c:it.k==0?10:it.k==1?11:it.k==9?12:13,l:0})}
 else{const wi=it.k==7?0:it.k==11?5:it.k-1,e=p.sl.find(q=>q.c==wi);if(e){e.l=Math.min(6,e.l+1);e.a=magOf(wi,e.l)}else{const n={c:wi,l:it.l||0,a:it.a==null?magOf(wi,it.l||0):it.a};if(p.sl.length<6){p.sl.push(n);p.cs=p.sl.length-1}else{const o=p.sl[p.cs];IT.push({x:p.x,y:p.y+22,k:kOf(o.c),l:o.l,a:o.a,nt:Date.now()+2500});p.sl[p.cs]=n}p.rl=0}p.cw=p.sl[p.cs].c}return 1}
function openShop(){shopOn=1;shopT=60;const bs=BLD.filter(b=>b.T=='x'),b=bs[Math.random()*bs.length|0];shopX=b.x+b.w/2;shopY=b.y+46;bn=[Date.now(),'🛒 LOJA ABERTA — 1 MINUTO',2]}
function kill(z,p){p.k++;cash(z);
 if(z.k==3){for(const i in z.h)giveXp(PL[i],z.xp);for(let i=0;i<7;i++){let x=z.x+R(-70,70),y=z.y+R(-70,70);if(blk(x,y,20)){x=z.x;y=z.y}IT.push({x,y,k:[0,9,9,6,6,2,3,4,5,11,10][Math.random()*11|0]})}}
 else{giveXp(p,z.xp);if(Math.random()<.01)IT.push({x:z.x,y:z.y,k:9})}}
function handle(m){if(m.t=='j')return addP(m.id,m.n);const p=PL[m.id];if(!p||p.dead)return;
 if(m.t=='i'){let b=null,bd=40;for(const z of Z){const d=Math.hypot(z.x-m.x,z.y-m.y)-z.r;if(d<bd){bd=d;b=z}}if(m.f&&b&&b===p.tz)b=null;p.tz=b;if(m.f)p.dd=1;else{p.dd=0;p.tx=b?null:m.x;p.ty=m.y}}
 else if(m.t=='m'){p.dd=1;p.jx=Math.max(-1,Math.min(1,+m.x||0));p.jy=Math.max(-1,Math.min(1,+m.y||0));p.jt=Date.now()}
 else if(m.t=='s'&&p.o&&p.o.includes(m.k)){skill(p,m.k);p.pend--;p.o=null;mkOpts(p)}
 else if(m.t=='d'&&m.n==-1){const v=Math.min(p.da,p.money)|0;if(v>0){p.money-=v;IT.push({x:p.x,y:p.y+20,k:8,v,nt:Date.now()+2500})}}
 else if(m.t=='a')p.da=Math.max(20,Math.min(2000,p.da+20*m.d))
 else if(m.t=='b'){const q=SH[m.i];if(!shopOn||!q||Math.hypot(p.x-shopX,p.y-shopY)>120)return;const pr=q[2]==6?100*2**p.sl[p.cs].l:q[1];if(p.money>=pr&&give(p,{k:q[2],l:0}))p.money-=pr}
 else if(m.t=='d'){const s=p.sl[m.n];if(!s||(s.c<6&&p.sl.filter(q=>q.c<6).length<2))return;const eq=p.sl[p.cs];p.sl.splice(m.n,1);IT.push({x:p.x,y:p.y+20,k:kOf(s.c),l:s.l,a:s.a,nt:Date.now()+2500});p.cs=eq===s?p.sl.findIndex(q=>q.c<6):p.sl.indexOf(eq);p.cw=p.sl[p.cs].c;p.rl=0}
 else if(m.t=='c')p.tz=null
 else if(m.t=='r')activeReload(p)
 else if(m.t=='o'){const of=p.of;if(!of)return;const i=IT.indexOf(of.it);if(m.ok&&i>=0&&Math.hypot(of.it.x-p.x,of.it.y-p.y)<50){const it=IT.splice(i,1)[0];give(p,it)}else p.skip=of.it;p.of=null}
 else if(m.t=='u'){const s=p.sl[m.n];if(!s)return;if(s.c<6){if(p.cs==m.n){if(p.rl<=0&&s.a<magOf(s.c,s.l))startReload(p,s)}else{p.cs=m.n;p.cw=s.c;p.rl=0}}else if(s.c==10||s.c==12){p.hp=Math.min(p.mx,p.hp+p.mx*(s.c==10?.5:.2));rmSlot(p,m.n)}else if(s.c==13){p.bt=25;rmSlot(p,m.n)}}}
const ev=(t,o,x,y,a,k,c)=>EV.push([t,o?o.i:-1,x|0,y|0,a*100|0,k,c||'',++evid]),colOf=o=>o.t==2?o.c:o.t==1?'#2d5a27':'#b84';
function near(x,y,r){const out=[],seen=new Set();for(let gy=Math.max(0,(y-r)/200|0);gy<=Math.min(29,(y+r)/200|0);gy++)for(let gx=Math.max(0,(x-r)/200|0);gx<=Math.min(19,(x+r)/200|0);gx++){const L=OB[gy*20+gx];if(L)for(const o of L)if(!seen.has(o)){seen.add(o);out.push(o)}}return out}
function regrid(o){for(let gy=Math.max(0,(o.y-30)/CS|0);gy<=Math.min(GH-1,(o.y+o.h+30)/CS|0);gy++)for(let gx=Math.max(0,(o.x-30)/CS|0);gx<=Math.min(GW-1,(o.x+o.w+30)/CS|0);gx++)GB[gy*GW+gx]=blk(gx*CS+CS/2,gy*CS+CS/2,13)?1:0;for(const k in FL)FL[k].sx=-1}
function smash(o,a){o.dead=1;regrid(o);DEADL.push(o);ev(0,o,o.x+o.w/2,o.y+o.h/2,a,o.t,colOf(o))}
function wallAt(x,y,r){if(x<r||y<r||x>MW-r||y>MH-r)return 2;let w=0;for(const o of near(x,y,r+4)){if(o.dead||o.t<5)continue;if(x>o.x-r&&x<o.x+o.w+r&&y>o.y-r&&y<o.y+o.h+r){if(o.t==5)return 1;w=2}}return w}
function grabNear(z){const c=near(z.x,z.y,300).filter(o=>!o.dead&&o.t>=1&&o.t<=3&&!bAt(o.x+o.w/2,o.y+o.h/2)&&Math.hypot(o.x+o.w/2-z.x,o.y+o.h/2-z.y)<300).sort((a,b)=>Math.hypot(a.x-z.x,a.y-z.y)-Math.hypot(b.x-z.x,b.y-z.y))[0];if(!c)return 0;
 const cx_=c.x+c.w/2,cy_=c.y+c.h/2;c.dead=1;regrid(c);DEADL.push(c);ev(3,c,cx_,cy_,0,c.t,colOf(c));const j={k:c.t,c:colOf(c),ox:cx_,oy:cy_,x:cx_,y:cy_,h:0,rot:0,ph:0,t:0,bz:z};PJ.push(j);z.gr=j;return 1}
function startReload(p,cu){p.rl=p.rlt=rtOf(cu.c,cu.l);const wd=Math.max(.14,.3/p.rlt),zs=R(.35,.8-wd);p.rz=[zs,zs+wd];p.arF=0}
function activeReload(p){const cu=p.sl[p.cs];if(p.rl<=0){if(cu.a<magOf(cu.c,cu.l))startReload(p,cu);return}
 if(p.arF)return;const f=1-p.rl/p.rlt;
 if(f>=p.rz[0]&&f<=p.rz[1]){cu.a=magOf(cu.c,cu.l);p.rl=0;p.arT=30;ev(8,null,p.x,p.y,0,0,p.id)}else{p.arF=1;ev(9,null,p.x,p.y,0,0,p.id)}}
function bossAct(z,dt,all){z.bs=0;
 if(z.em>0){z.em-=dt;z.bs=6;z.arm=1;return 1}
 if(z.stun>0){z.stun-=dt;z.bs=5;z.arm=0;return 1}
 if(z.dash){const d=z.dash;d.t+=dt;z.arm=0;if(d.t<1){z.fa=d.a;z.bs=3;return 1}z.bs=4;
  const st=1500*dt,nx=z.x+Math.cos(d.a)*st,ny=z.y+Math.sin(d.a)*st;
  for(const o of near(nx,ny,50))if(!o.dead&&o.t>=1&&o.t<=3&&nx>o.x-44&&nx<o.x+o.w+44&&ny>o.y-44&&ny<o.y+o.h+44)smash(o,d.a);
  const w=wallAt(nx,ny,18);
  if(d.l<=0||w){z.dash=null;if(w==1){z.stun=5;z.x-=Math.cos(d.a)*36;z.y-=Math.sin(d.a)*36;ev(1,null,nx,ny,d.a,0,'')}else z.stun=.9;return 1}
  z.x=nx;z.y=ny;d.l-=st;for(const p of all)if(!p.dead&&!d.hit[p.id]&&Math.hypot(p.x-z.x,p.y-z.y)<52){d.hit[p.id]=1;p.hp-=45+dl()*2;if(p.hp<=0){p.hp=0;p.dead=1;p.tz=null}}return 1}
 if(z.gr){z.bs=z.gr.ph==0?1:2;return 1}
 if(z.armT>0){z.armT-=dt;z.arm=Math.max(0,z.armT/.35)}else z.arm=0;
 z.tc=(z.tc==null?2:z.tc)-dt;
 if(z.tc<=0){z.tc=Math.max(2.2,4.2-dl()*.1);const L=all.filter(p=>!p.dead&&Math.hypot(p.x-z.x,p.y-z.y)<800);
  if(L.length){let ok=0;if(Math.random()<.65){z.queue=dl()>=15?2:dl()>=8?1:0;ok=grabNear(z)}
   if(!ok){const p=L[Math.random()*L.length|0];z.dash={t:0,a:Math.atan2(p.y-z.y,p.x-z.x),x0:z.x,y0:z.y,l:750,hit:{}}}}}
 return 0}
function updPJ(dt,all){for(const j of PJ){j.t+=dt;const b=j.bz;if(b.hp<=0){j.dn=1;continue}
  if(j.ph==0){const u=Math.min(1,j.t);j.x=j.ox+(b.x-j.ox)*u;j.y=j.oy+(b.y-j.oy)*u;j.h=195*u+30*Math.sin(u*Math.PI);j.rot=u*.6;b.arm=Math.min(1,j.t/.9);if(j.t>=1){j.ph=1;j.t=0}}
  else if(j.ph==1){j.x=b.x;j.y=b.y;j.h=195;b.arm=1;if(j.t>=.4){const L=all.filter(p=>!p.dead&&Math.hypot(p.x-b.x,p.y-b.y)<900),p=L[Math.random()*L.length|0];b.gr=null;b.armT=.35;
    if(!p){j.dn=1;ev(5,null,j.x,j.y,0,j.k,j.c)}else{j.tx=p.x;j.ty=p.y;const d=Math.hypot(j.tx-b.x,j.ty-b.y);j.T=Math.max(1.1,Math.min(2.4,d/260));j.sx=b.x;j.sy=b.y;j.ph=2;j.t=0;RK.push({x:j.tx,y:j.ty,t:0,dur:j.T,k:j.k,c:j.c});ev(6,null,b.x,b.y,0,j.k,j.c);if(b.queue>0){b.queue--;grabNear(b)}}}}
  else{const u=Math.min(1,j.t/j.T);j.x=j.sx+(j.tx-j.sx)*u;j.y=j.sy+(j.ty-j.sy)*u;j.h=195*(1-u)+(70+Math.hypot(j.tx-j.sx,j.ty-j.sy)*.16)*Math.sin(u*Math.PI);j.rot+=dt*7;if(j.t>=j.T)j.dn=1}}
 PJ=PJ.filter(j=>!j.dn)}
function step(){const dt=.033,all=Object.values(PL);tick++;
 if(ph==1){
  if(all.every(p=>p.dead))ph=2;
  gt+=dt;const m_=Math.floor(gt/60),nA=all.filter(p=>!p.dead).length||1;
  if(!shopOn){sa+=(.5+.2*Math.min(m_,22))*(1+.35*(nA-1))*dt;const cap=Math.min(330,120+m_*12+nA*20);while(sa>=1){sa--;if(Z.length<cap)spawnZ()}}
  if(m_>lastMin){lastMin=m_;minuteTick(m_)}
  if(bossPend){bossPend.t-=dt;if(bossPend.t<=0){const bp=bossPend;bossPend=null;spawnZ(3,bp.x,bp.y);const bz=Z[Z.length-1];if(bz&&bz.k==3){bz.em=1.3;ev(7,null,bz.x,bz.y,0,0,'')}}}
  if(shopOn){shopT-=dt;if(shopT<=0){shopOn=0;shopP=0}}
  for(const p of all){if(p.dead)continue;p.hp=Math.min(p.mx,p.hp+p.rc*1.5*dt);if(p.bt>0)p.bt-=dt;if(p.arT>0)p.arT-=dt;
   const cu=p.sl[p.cs],rg=rgOf(p.cw,cu.l);let t=p.tz&&p.tz.hp>0?p.tz:(p.tz=null),gx=null,gy,mv=0,mvx=0,mvy=0,mvL=0;
   if(p.dd){const ok_=Date.now()-p.jt<700,jx=ok_?p.jx:0,jy=ok_?p.jy:0,L=Math.hypot(jx,jy);if(L>.1){mvx=jx/L;mvy=jy/L;mvL=Math.min(1,L);mv=1;p.fa=Math.atan2(jy,jx)}}
   else{if(t&&Math.hypot(t.x-p.x,t.y-p.y)>rg*.9){gx=t.x;gy=t.y}else if(!t&&p.tx!=null){gx=p.tx;gy=p.ty}
   if(gx!=null){const d=Math.hypot(gx-p.x,gy-p.y);if(d<6){if(!t)p.tx=null}else{mv=1;pathTo(p,'p'+p.id,gx,gy,150*p.sp*(p.bt>0?1.4:1)*(p.arT>0?1.15:1)*(p.cw==4?.5:1)*dt,12)}}}
   p.cd-=dt;if(p.rl>0){p.rl-=dt;if(p.rl<=0)cu.a=magOf(cu.c,cu.l)}else if(cu.a<=0)startReload(p,cu);
   const ang_=z=>Math.abs(ad(Math.atan2(z.y-p.y,z.x-p.x),p.fa)),okA=z=>!mv||ang_(z)<.7;
   let s=null;if(t&&Math.hypot(t.x-p.x,t.y-p.y)<=rg+t.r&&clear(p,t))s=t;
   if(!s){let bd=rg;for(const z of Z){if(z.hp<=0)continue;const d=Math.hypot(z.x-p.x,z.y-p.y)-z.r;if(d<bd&&okA(z)&&clear(p,z)){bd=d;s=z}}}
   let bp=0;if(s&&mv){const a_=ang_(s);if(a_>.7)bp=Math.min(1,(a_-.7)/1.6)}
   if(s&&!mv)p.fa=Math.atan2(s.y-p.y,s.x-p.x);
   if(p.dd&&mv)mvT(p,p.x+mvx*60,p.y+mvy*60,150*p.sp*(p.bt>0?1.4:1)*(p.arT>0?1.15:1)*(p.cw==4?.5:1)*mvL*(1-.4*bp*(1-.6*p.bk))*dt,12,1);
   if(s&&p.cd<=0&&p.rl<=0&&cu.a>0){p.cd=cdOf(p.cw,cu.l)/(p.arT>0?1.2:1);cu.a--;if(cu.a<=0)startReload(p,cu);const dm=dmOf(p.cw,cu.l)*(p.arT>0?1.2:1);let ex=s.x,ey=s.y;
    const aim=Math.atan2(s.y-p.y,s.x-p.x);p.aim=aim;p.ls=Date.now();p.bkf=bp;
    const hit=p.cw==4||Math.random()<Math.max(.1,Math.min(.96,WA[p.cw]+p.pr+(mv?0:.08)-.3*bp*(1-p.bk)));
    if(p.cw==4){const dx=s.x-p.x,dy=s.y-p.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,wd=rayW(p.x,p.y,ux,uy,L+70+cu.l*12),Lp=Math.max(10,Math.min(L,wd-60));ex=p.x+ux*Lp;ey=p.y+uy*Lp;const hs=[];for(const z of Z){if(z.hp<=0)continue;const rx=z.x-p.x,ry=z.y-p.y,tt=rx*ux+ry*uy,pd=Math.abs(rx*uy-ry*ux);if(tt>-20&&tt<Math.min(L+70+cu.l*12,wd)&&pd<z.r+34&&(tt<12||rayW(p.x,p.y,ux,uy,tt)>=tt))hs.push([tt,z])}hs.sort((a,b)=>a[0]-b[0]);for(const h of hs.slice(0,2+cu.l))hurt(h[1],dm,p)}
    else if(hit){hurt(s,dm,p);if(p.cw==1)for(const z of Z)if(z!==s&&z.hp>0&&Math.hypot(z.x-s.x,z.y-s.y)<50)hurt(z,dm*.5,p)}
    else{const ux=Math.cos(aim),uy=Math.sin(aim),off=(Math.random()<.5?-1:1)*R(26,55);ex=s.x-uy*off+ux*30;ey=s.y+ux*off+uy*30}
    FX.push([p.x|0,p.y|0,ex|0,ey|0,p.cw,++fid,p.id,hit?1:0])}
   for(let i=IT.length-1;i>=0;i--){const it=IT[i];if(Math.hypot(it.x-p.x,it.y-p.y)>28||it.nt>Date.now())continue;if(needsConf(p,it)){if(p.skip!==it&&(!p.of||p.of.it!==it))p.of={it};continue}if(give(p,it))IT.splice(i,1)}
   if(p.of&&(IT.indexOf(p.of.it)<0||Math.hypot(p.of.it.x-p.x,p.of.it.y-p.y)>45))p.of=null;if(p.skip&&(IT.indexOf(p.skip)<0||Math.hypot(p.skip.x-p.x,p.skip.y-p.y)>90))p.skip=null;
   const di=p.sl.findIndex(q=>q.c==11);
   if(di>=0)for(const d of all)if(d.dead&&Math.hypot(d.x-p.x,d.y-p.y)<40){rmSlot(p,di);d.dead=0;d.hp=d.mx*.5;break}}
  for(const z of Z){if(z.hp<=0)continue;if(z.k==3&&bossAct(z,dt,all))continue;let n=null,bd=1e9;for(const p of all){if(p.dead)continue;const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<bd){bd=d;n=p}}
   if(!n)break;if(bd>z.r+12||!los(z,n))pathTo(z,'z'+n.id,n.x,n.y,z.s*dt,z.k==3?16:z.r*.7);else{z.fa=Math.atan2(n.y-z.y,n.x-z.x);n.hp-=z.d*dt;if(n.hp<=0){n.hp=0;n.dead=1;n.tz=null}}}
  updPJ(dt,all);for(const r of RK){r.t+=dt;if(!r.h&&r.t>=r.dur){r.h=1;ev(5,null,r.x,r.y,0,r.k,r.c);for(const p of all)if(!p.dead&&Math.hypot(p.x-r.x,p.y-r.y)<70){p.hp-=30+dl()*2;if(p.hp<=0){p.hp=0;p.dead=1;p.tz=null}}}}
  RK=RK.filter(r=>r.t<r.dur+.4);
  if(DEADL.length>=8&&tick%30==0&&Date.now()-lastResp>20000){lastResp=Date.now();let n=3+(Math.random()*3|0);for(let tr=0;tr<25&&n>0&&DEADL.length;tr++){const i=Math.random()*DEADL.length|0,o=DEADL[i],cx_=o.x+o.w/2,cy_=o.y+o.h/2;if(all.some(p=>Math.hypot(p.x-cx_,p.y-cy_)<90)||Z.some(z=>Math.hypot(z.x-cx_,z.y-cy_)<z.r+70)||PJ.some(j=>Math.hypot(j.x-cx_,j.y-cy_)<90))continue;o.dead=0;regrid(o);DEADL.splice(i,1);ev(4,o,cx_,cy_,0,o.t,colOf(o));n--}}
  if(tick%30==0)IT=IT.filter(i=>!i.ex||i.ex>Date.now());
  Z=Z.filter(z=>z.hp>0)}
 const base={t:'S',ph,gt:gt|0,bn,sd,left:Z.length,sh:shopOn?[shopX|0,shopY|0,shopT|0]:0,bp:bossPend?[bossPend.x|0,bossPend.y|0,Math.ceil(bossPend.t)]:0,F:FX,K:RK.map(r=>[r.x|0,r.y|0,r.t<r.dur?r.t/r.dur:1+(r.t-r.dur)/.4]),Pj:PJ.map(j=>[j.k,j.c,j.x|0,j.y|0,j.h|0,j.rot*100|0]),EV,Dh:Z.filter(z=>z.dash).map(z=>[z.dash.x0|0,z.dash.y0|0,z.dash.a*100|0,750,z.dash.t]),
  P:all.map(p=>[p.id,p.n,p.c,p.x|0,p.y|0,p.hp|0,p.mx|0,p.dead,p.cw,p.lv,p.xp|0,need(p.lv),p.sl.filter(q=>q.c==11).length,p.o,p.sl.map(q=>[q.c,q.l,q.a]),p.sl[p.cs].l,p.cs,p.fa*10|0,p.k,p.money|0,p.da,Math.ceil(Math.max(0,p.bt)),p.rl>0?p.rl/(p.rlt||RT[p.cw])*100|0:0,p.of?[wiOf(p.of.it.k),p.of.it.l||0,p.sl[p.cs].c,p.sl[p.cs].l]:0,p.aim*10|0,(p.ls&&Date.now()-p.ls<450)?(p.bkf>.4?2:1):0,p.tz&&p.tz.hp>0?p.tz.i:0,p.rl>0&&p.rz?p.rz[0]*100|0:0,p.rl>0&&p.rz?p.rz[1]*100|0:0,p.arF?1:0,Math.ceil(Math.max(0,p.arT||0))])};
 if(tick%6==0){base.I=IT.map(i=>[i.x|0,i.y|0,i.k,i.v|0]);base.ZM=Z.map(z=>[z.x/30|0,z.y/30|0,z.k]);base.DS=DEADL.map(o=>o.i)}
 const zA=Z.map(z=>[z.x|0,z.y|0,z.k,z.hp/z.mx*100|0,z.v,z.fa*10|0,z.i].concat(z.k==3?[z.bs|0,z.arm*100|0,Math.ceil(Math.max(0,z.stun||0)*10),Math.ceil(Math.max(0,z.em||0)*10)]:[]));
 onSnap(Object.assign({},base,{Z:zA}));
 if(ws&&ws.bufferedAmount<3e6)for(const q of all)if(q.id!=id)ws.send('@'+q.id+'|'+JSON.stringify(Object.assign({},base,{Z:zA.filter(z=>z[2]==3||Math.abs(z[0]-q.x)<1500&&Math.abs(z[1]-q.y)<950)})));
 FX=[];EV=[]}