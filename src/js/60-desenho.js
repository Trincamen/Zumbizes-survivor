// ---------- desenho 2.5D ----------
function txt(t,x,y,sz,c){X.fillStyle=c;X.font=sz+'px sans-serif';X.textAlign='center';X.textBaseline='middle';X.fillText(t,x,y)}
function poly(x,y,r,n,rot,r2){X.beginPath();for(let i=0;i<n*(r2?2:1);i++){const a=rot+i*6.283/(n*(r2?2:1)),q=r2&&i%2?r2:r;X[i?'lineTo':'moveTo'](x+Math.cos(a)*q,y+Math.sin(a)*q)}X.closePath();X.fill()}
function bar(x,y,w,f,c){X.fillStyle='#000a';X.fillRect(x,y,w,6);X.fillStyle=c;X.fillRect(x,y,w*Math.max(0,f),6)}
function ell(x,y,rx,ry,c,st){X.beginPath();X.ellipse(x,y,rx,ry,0,0,7);if(st){X.strokeStyle=c;X.lineWidth=3;X.stroke()}else{X.fillStyle=c;X.fill()}}
function sm(k,x,y,dt){let r=RP[k];if(!r||Math.abs(r.x-x)>300||Math.abs(r.y-y)>300)r=RP[k]={x,y};else{const f=1-Math.exp(-dt*16);r.x+=(x-r.x)*f;r.y+=(y-r.y)*f}r.u=FR;return r}
function person(x,y,o){const s=o.s,b=Math.sin(o.ph)*3*s,a=o.fa==null?1.57:o.fa,c=Math.cos(a),sn=Math.sin(a),sd=Math.abs(c)>Math.abs(sn),bk=!sd&&sn<0,w=(o.w||1)*(sd?.7:1),ga=o.aim==null?a:o.aim,back=o.back||0,ha=back>.2?ga:a,hc=Math.cos(ha),hsn=Math.sin(ha),hsd=Math.abs(hc)>Math.abs(hsn),hbk=!hsd&&hsn<0;
 ell(x,y,13*s*(o.w||1),5*s,'rgba(0,0,0,.4)');if(o.ring)ell(x,y,18*s,7*s,o.ring,1);
 X.save();if(sd&&c<0){X.translate(2*x,0);X.scale(-1,1)}
 X.fillStyle=o.pn;if(sd){X.fillRect(x-3*s+b,y-14*s,5*s,14*s);X.fillRect(x-3*s-b,y-14*s,5*s,14*s)}else{X.fillRect(x-6*s*w,y-14*s+b*.3,5*s*w,14*s-b);X.fillRect(x+s*w,y-14*s-b*.3,5*s*w,14*s+b)}
 X.fillStyle=o.sh;X.fillRect(x-8*s*w,y-31*s,16*s*w,18*s);X.fillStyle='rgba(0,0,0,.28)';X.fillRect(x,y-31*s,8*s*w,18*s);X.fillStyle='rgba(255,255,255,.15)';X.fillRect(x-8*s*w,y-31*s,16*s*w,4*s);
 if(o.zm){X.fillStyle=o.sk;if(sd)X.fillRect(x+2*s,y-31*s+b*.3,14*s,5*s);else{X.fillRect(x-(14*w+2)*s,y-36*s+b*.4,5*s,15*s);X.fillRect(x+(9*w+2)*s,y-36*s-b*.4,5*s,15*s)}}
 else if(sd){X.fillStyle=o.sh;X.fillRect(x-2*s,y-30*s,5*s,14*s);X.fillStyle=o.sk;X.fillRect(x-2*s,y-17*s,5*s,4*s)}
 else{X.fillStyle=o.sh;X.fillRect(x-(8*w+4)*s,y-30*s,4*s,14*s);X.fillRect(x+8*s*w,y-30*s,4*s,14*s);X.fillStyle=o.sk;X.fillRect(x-(8*w+4)*s,y-17*s,4*s,4*s);X.fillRect(x+8*s*w,y-17*s,4*s,4*s)}
 X.restore();X.save();if(hsd&&hc<0){X.translate(2*x,0);X.scale(-1,1)}
 X.fillStyle=o.sk;X.beginPath();X.arc(x,y-38*s,7.5*s,0,7);X.fill();X.fillStyle='rgba(0,0,0,.2)';X.beginPath();X.arc(x,y-38*s,7.5*s,-1.57,1.57);X.fill();
 X.fillStyle=o.hr;X.beginPath();X.arc(x,y-39*s,7.5*s,hbk?0:3.14,hbk?7:6.28);X.fill();
 if(!hbk){X.fillStyle=o.ey;if(hsd)X.fillRect(x+2*s,y-38*s,2.5*s,2.5*s);else{X.fillRect(x-4*s,y-38*s,2.5*s,2.5*s);X.fillRect(x+1.5*s,y-38*s,2.5*s,2.5*s)}}
 X.restore();
 if(o.gun){const gc=Math.cos(ga),gs_=Math.sin(ga),rc=(o.rec||0)*5*s,far=Math.abs(ad(ga,a))>1.2,gx0=x+(sd?(c>0?3:-3)*s:0),gy0=y-24*s;
  if(far||back>.2){const sg=gc>=0?1:-1,shx=x+sg*7*s,shy=y-29*s,hx_=x+gc*13*s-gc*rc,hy_=y-24*s+gs_*7*s-gs_*rc;X.strokeStyle=o.sh;X.lineWidth=4.2*s;X.lineCap='round';X.beginPath();X.moveTo(shx,shy);X.lineTo(hx_,hy_);X.stroke();X.fillStyle=o.sk;X.beginPath();X.arc(hx_,hy_,2.6*s,0,7);X.fill();X.lineCap='butt';
   X.save();X.translate(hx_,hy_);X.rotate(ga);X.fillStyle='#222';X.fillRect(-2*s,-2.5*s,16*s,5*s);X.fillStyle=o.gun;X.fillRect(6*s,-1.5*s,8*s,3*s);X.restore()}
  else{X.save();X.translate(gx0-gc*rc,gy0-gs_*rc);X.rotate(ga);X.fillStyle='#222';X.fillRect(0,-2.5*s,16*s,5*s);X.fillStyle=o.gun;X.fillRect(8*s,-1.5*s,8*s,3*s);X.restore()}}}
const ZS=['#5a6b4f','#6b4f4f','#4f5a6b','#7a7a55'];
function obst(o){const x=o.x,y=o.y,w=o.w,h=o.h;
 if(o.t==5){const b=o.b,hh=o.wl=='s'&&meB===b?16:o.wl=='i'?26:b.H,sx=hh*SHK;
  X.beginPath();X.moveTo(x+w,y);X.lineTo(x+w,y+h);X.lineTo(x+w-sx,y+h-hh);X.lineTo(x+w-sx,y-hh);X.closePath();X.fillStyle=b.c;X.fill();X.fillStyle='rgba(0,0,0,.38)';X.fill();
  X.save();X.transform(1,0,SHK,1,-SHK*(y+h),0);X.fillStyle=b.c;X.fillRect(x,y+h-hh,w,hh);wallDetail(o,b,hh);X.restore();
  X.fillStyle=b.c;X.fillRect(x-sx,y-hh,w,h);X.fillStyle='rgba(255,255,255,.3)';X.fillRect(x-sx,y-hh,w,h)} else if(o.t==1){const cx=x+12,cy=y+12;ell(cx+8,cy+4,22,9,'rgba(0,0,0,.35)');if(!cenDraw(X,CEN_SPR[o.i%3],cx,cy)){X.fillStyle='#543';X.fillRect(cx-4,cy-22,8,24);X.fillStyle='#2d5a27';X.beginPath();X.arc(cx,cy-36,24,0,7);X.fill();X.fillStyle='#3f7a35';X.beginPath();X.arc(cx-6,cy-42,14,0,7);X.fill()}}
 else if(o.t==2){ell(x+w/2+6,y+h,w/2,10,'rgba(0,0,0,.35)');X.fillStyle=o.c;X.fillRect(x,y+8,w,h-8);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(x,y+h-6,w,6);X.fillStyle=o.c;X.fillRect(x,y-8,w,h-8);X.fillStyle='#1c2a3a';X.fillRect(x+w*.22,y-3,w*.56,h-20);X.fillStyle='#111';ell(x+14,y+h,7,5,'#111');ell(x+w-14,y+h,7,5,'#111')}
 else{ell(x+w/2+6,y+h,w/2,8,'rgba(0,0,0,.35)');if(!(o.t==3&&cenDraw(X,CEN_SPR[3],x+w/2,y+h))){X.fillStyle='#b84';X.fillRect(x,y-12,w,h);X.fillStyle='#fff3';X.fillRect(x,y-12,w,5);X.fillStyle='#7a4e22';X.fillRect(x,y+h-12,w,12);X.strokeStyle='#5a3a18';X.lineWidth=2;X.strokeRect(x+3,y-9,w-6,h-6)}}}
const SHK=.3;
function roof(b){const H=b.H,x=b.x-6,w=b.w+12,top=b.y-H,hh=b.h,mx=b.x+b.w/2,my=top+hh/2;X.save();X.translate(-H*SHK,0);
 X.fillStyle=b.d;X.fillRect(x,top,w,hh);X.fillStyle='rgba(255,255,255,.16)';X.fillRect(x,top,w,hh/2);X.fillStyle='rgba(0,0,0,.18)';X.fillRect(x,my,w,hh/2);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(x,my-2,w,4);
 X.strokeStyle='rgba(0,0,0,.12)';X.lineWidth=1;X.beginPath();for(let k=top+10;k<top+hh;k+=12){X.moveTo(x,k);X.lineTo(x+w,k)}X.stroke();X.fillStyle='rgba(0,0,0,.4)';X.fillRect(x,top+hh,w,6);
 X.fillStyle='rgba(0,0,0,.45)';X.beginPath();X.moveTo(x+w,top);X.lineTo(x+w+8,top+8);X.lineTo(x+w+8,top+hh+8);X.lineTo(x+w,top+hh);X.closePath();X.fill();
 if(b.T=='x'){X.fillStyle='#6a3a2a';X.fillRect(b.x+b.w*.7,top-12,16,26);X.fillStyle='#8a5a44';X.fillRect(b.x+b.w*.7,top-12,16,5)}
 else if(b.T=='h'){X.fillStyle='#d22';X.fillRect(mx-8,my-40,16,80);X.fillRect(mx-40,my-8,80,16)}
 else if(b.T=='p'){const on=Math.floor(Date.now()/350)%2;X.fillStyle=on?'#f33':'#36f';X.fillRect(x+8,top+8,14,8);X.fillStyle=on?'#36f':'#f33';X.fillRect(x+w-22,top+8,14,8)}X.restore()}
function wallDetail(o,b,hh){const x=o.x,y=o.y,w=o.w,h=o.h,T=b.T,by=y+h-hh;
 if(T=='x'){X.strokeStyle='rgba(0,0,0,.1)';X.lineWidth=1;X.beginPath();for(let k=by+8;k<y+h-6;k+=8){X.moveTo(x,k);X.lineTo(x+w,k)}X.stroke()}
 X.fillStyle='rgba(0,0,0,.28)';X.fillRect(x,y+h-6,w,6);if(o.wl!='s')return;X.fillStyle='rgba(0,0,0,.22)';X.fillRect(x,by,w,6);
 if(hh!=b.H||w<60)return;const n=Math.max(1,Math.floor((w-30)/(T=='m'?110:72))),st=(w-30)/n;
 for(let i=0;i<n;i++){const c0=x+15+st*i+st/2;
  if(T=='W'){X.fillStyle='#223';for(let k=-1;k<=1;k++)X.fillRect(c0+k*18-6,by+14,12,8);continue}
  if(T=='m'){X.fillStyle='#e8eef5';X.fillRect(c0-40,by+hh-52,80,40);X.fillStyle='#8fd0ff';X.fillRect(c0-37,by+hh-49,74,34);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(c0-37,by+hh-49,30,34);continue}
  const ww=T=='x'?22:24,wh=T=='x'?22:26,wx=c0-ww/2,wy=by+hh-wh-18;
  X.fillStyle=T=='x'?'#f4efe6':'#e8eef5';X.fillRect(wx-3,wy-3,ww+6,wh+6);X.fillStyle=T=='x'?'#ffd36a':'#6fb3e0';X.fillRect(wx,wy,ww,wh);X.fillStyle='rgba(255,255,255,.3)';X.fillRect(wx,wy,ww/2,wh/2);
  X.fillStyle='#f4efe6';X.fillRect(wx+ww/2-1,wy,2,wh);X.fillRect(wx,wy+wh/2-1,ww,2);X.fillStyle='rgba(0,0,0,.3)';X.fillRect(wx-5,wy+wh+3,ww+10,4);
  if(T=='x'){X.fillStyle=b.d;X.fillRect(wx-9,wy-3,5,wh+6);X.fillRect(wx+ww+4,wy-3,5,wh+6)}
  if(T=='p'){X.fillStyle='#223';for(let k=1;k<4;k++)X.fillRect(wx+k*ww/4-1,wy,2,wh)}}}
function facade(b){if(meB===b)return;const H=b.H,px=b.dx+28,yb=b.y+b.h,by=yb-H,DH=44,dy=yb-DH;X.save();X.transform(1,0,SHK,1,-SHK*yb,0);
 X.fillStyle=b.c;X.fillRect(b.dx,by,56,H-DH);X.fillStyle='rgba(0,0,0,.28)';X.fillRect(b.dx,dy-4,56,4);
 X.fillStyle='#e8e2d4';X.fillRect(b.dx-4,by,4,H);X.fillRect(b.dx+56,by,4,H);
 X.fillStyle='#7a4a24';X.fillRect(b.dx+2,dy,9,DH);X.fillStyle='#5a3414';X.fillRect(b.dx+4,dy+6,5,12);X.fillRect(b.dx+4,dy+24,5,12);X.fillStyle='#ec8';X.fillRect(b.dx+9,dy+20,2,3);
 X.fillStyle='#9a968c';X.fillRect(b.dx-2,yb-3,60,5);
 if(b.T=='x'){X.fillStyle=b.d;X.fillRect(b.dx-10,dy-12,76,8);X.fillStyle='rgba(0,0,0,.3)';X.fillRect(b.dx-10,dy-4,76,3)}
 else if(b.T=='p'){X.fillStyle='#0d1f4a';X.fillRect(px-66,by+4,132,24);X.fillStyle='#4f7be0';X.fillRect(px-64,by+6,128,20);X.fillStyle='#fc3';poly(px-48,by+16,8,5,-1.57,3.5);txt('POLÍCIA',px+10,by+16,13,'#fff')}
 else if(b.T=='m'){X.fillStyle='#146b2e';X.fillRect(px-52,by+3,104,17);txt('MERCADO',px,by+12,13,'#fff');for(let i=0;i<8;i++){X.fillStyle=i%2?'#fff':'#d22';X.beginPath();X.moveTo(px-70+i*17.5,by+22);X.lineTo(px-70+(i+1)*17.5,by+22);X.lineTo(px-76+(i+1)*19,by+38);X.lineTo(px-76+i*19,by+38);X.closePath();X.fill()}}
 else if(b.T=='h'){X.fillStyle='#fff';X.fillRect(px-66,by+4,132,24);X.strokeStyle='#d22';X.lineWidth=2;X.strokeRect(px-66,by+4,132,24);X.fillStyle='#d22';X.fillRect(px-58,by+10,14,12);X.fillRect(px-54,by+7,6,18);txt('HOSPITAL',px+10,by+16,13,'#b11')}X.restore()}
function bridgeGround(bx,t){const x0=bx-80;X.fillStyle='rgba(0,0,0,.28)';X.fillRect(x0+10,RY0+16,160,600);
 for(let yy=RY0+60;yy<RY1;yy+=140)for(const sd of[-1,1]){const px=bx+sd*88;X.fillStyle='rgba(255,255,255,.35)';X.beginPath();X.ellipse(px,yy+8,26+Math.sin(t/300+yy)*3,10,0,0,7);X.fill();X.fillStyle='#6b6f78';X.fillRect(px-12,yy-20,24,36);X.fillStyle='#8b9099';X.fillRect(px-12,yy-20,24,10);X.fillStyle='rgba(0,0,0,.3)';X.fillRect(px-12,yy+6,24,10)}
 X.fillStyle='#45454d';X.fillRect(x0,2500,160,1000);X.fillStyle='#d8d8d8';X.fillRect(x0+6,2500,3,1000);X.fillRect(x0+151,2500,3,1000);
 X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=2;X.beginPath();for(let yy=RY0;yy<=RY1;yy+=100){X.moveTo(x0,yy);X.lineTo(x0+160,yy)}X.stroke();
 for(const rx of[x0+2,x0+158]){X.fillStyle='#9a9ea6';X.fillRect(rx-3,RY0,6,600);X.strokeStyle='#d0d4da';X.lineWidth=3;X.beginPath();X.moveTo(rx,RY0-14);X.lineTo(rx,RY1-14);X.stroke();for(let yy=RY0;yy<=RY1;yy+=40){X.fillStyle='#c4c8ce';X.fillRect(rx-2,yy-14,4,14)}}}
function pylon(e){const[x,y,sd]=e;X.fillStyle='rgba(0,0,0,.3)';X.fillRect(x-8,y-4,24,12);X.fillStyle='#5d616a';X.fillRect(x-9,y-8,18,16);
 X.strokeStyle='rgba(215,218,224,.85)';X.lineWidth=1.5;X.beginPath();for(const k of[-200,-140,-80,80,140,200]){X.moveTo(x,y-96);X.lineTo(x-sd*8,y+k-14)}X.stroke();
 X.fillStyle='#aeb2ba';X.fillRect(x-6,y-100,12,96);X.fillStyle='rgba(0,0,0,.25)';X.fillRect(x+1,y-100,5,96);X.fillStyle='#c9ccd2';X.fillRect(x-9,y-108,18,9)}
function edges(w){const S=68,hs=(i,j)=>{const q=Math.sin(i*127.1+j*311.7)*43758.5453;return q-Math.floor(q)},
  bush=(x,y,r,h)=>{const g=['#2f6b2a','#27591f','#1f4a1a'][r%3];ell(x+6,y+8,30,10,'rgba(0,0,0,.3)');if(h>.8){X.fillStyle='#543';X.fillRect(x-4,y-22,8,26);X.fillStyle=g;X.beginPath();X.arc(x,y-38,28,0,7);X.fill();X.fillStyle='rgba(255,255,255,.1)';X.beginPath();X.arc(x-8,y-46,15,0,7);X.fill()}else{X.fillStyle=g;for(let k=0;k<3;k++){X.beginPath();X.arc(x+(k-1)*14,y-8-(k%2)*8,18+h*10,0,7);X.fill()}X.fillStyle='rgba(255,255,255,.1)';X.beginPath();X.arc(x-6,y-18,11,0,7);X.fill()}};
 const i0=Math.floor((cx-W/2-S)/S),i1=Math.ceil((cx+W/2+S)/S),j0=Math.floor((cy-H/2-S)/S),j1=Math.ceil((cy+H/2+S)/S);
 for(let r=8;r>=0;r--){const o=10+r*44;
  if(w.includes('t')&&cy-H/2<-o+90)for(let i=i0;i<=i1;i++)bush(i*S+hs(i,r)*30,-o+(hs(r,i)-.5)*20,r,hs(i+9,r));
  if(w.includes('l')&&cx-W/2<-o+90)for(let j=j0;j<=j1;j++)bush(-o+(hs(j,r)-.5)*20,j*S+hs(r,j)*30,r,hs(j+5,r));
  if(w.includes('r')&&cx+W/2>MW+o-90)for(let j=j0;j<=j1;j++)bush(MW+o+(hs(j,r+20)-.5)*20,j*S+hs(r+20,j)*30,r,hs(j+7,r+3));
  if(w.includes('b')&&cy+H/2>MH+o-90)for(let i=i0;i<=i1;i++)bush(i*S+hs(i,r+40)*30,MH+o+(hs(r+40,i)-.5)*20,r,hs(i+3,r+9))}}
if(MOB)document.body.classList.add('mob');
function seller(e){const[x,y]=e;person(x,y,{s:1.05,ph:0,fa:1.57,sh:'#fc3',pn:'#543',sk:'#e8bb98',hr:'#222',ey:'#111'});X.fillStyle='#6a4a2a';X.fillRect(x-42,y+4,84,18);X.fillStyle='#8a6a3a';X.fillRect(x-42,y+4,84,5);txt('$',x,y-58,22,'#fc3')}
function fxr(t,i){return Math.abs(Math.sin(t*.001+i*12.9898)*43758.5453)%1}
function drawFX(){const now=Date.now();FXL=FXL.filter(q=>now<q.t+q.life);
 for(const q of FXL){const[a,b,c,d,w]=q.f,age=(now-q.t)/1000,sx=q.mz?q.mz[0]:a,sy=q.mz?q.mz[1]:b-24,ex=c,ey=d-18,L=Math.hypot(ex-sx,ey-sy)||1,ux=(ex-sx)/L,uy=(ey-sy)/L,ua=Math.atan2(uy,ux),px=-uy,py=ux;
  if(w==4){const LL=L+60;X.globalCompositeOperation='lighter';for(let i=0;i<28;i++){const u=i/27,j=Math.abs(Math.sin(i*12.9898+Math.floor(now/70)*78.233)*43758.5453)%1,off=(j-.5)*u*52,r=5+u*20*(.6+j*.7),k=u*LL*(.9+j*.2);X.fillStyle='hsla('+(52-u*44)+',100%,'+(58-u*14)+'%,'+(.8-u*.5)+')';X.beginPath();X.arc(sx+ux*k+px*off,sy+uy*k+py*off-u*8,r,0,7);X.fill()}X.globalCompositeOperation='source-over';continue}
  const mfd=w==5?.15:.11,mf=age<mfd?1-age/mfd:0;
  if(mf>0){const mr=[16,30,20,18,0,26][w]||16,g=X.createRadialGradient(sx,sy,0,sx,sy,mr*1.6);
   g.addColorStop(0,'rgba(255,255,235,'+(.95*mf)+')');g.addColorStop(.35,'rgba(255,220,120,'+(.75*mf)+')');g.addColorStop(.7,'rgba(255,140,40,'+(.4*mf)+')');g.addColorStop(1,'rgba(255,80,0,0)');
   X.globalCompositeOperation='lighter';X.fillStyle=g;X.beginPath();X.arc(sx,sy,mr*1.6,0,7);X.fill();
   const ns=5+((q.t|0)%3),sl=(w==1||w==5?1.7:1)*mr*(1.1+mf*.9);
   X.strokeStyle='rgba(255,245,190,'+(.7*mf)+')';X.lineWidth=2+mf;X.lineCap='round';X.beginPath();
   for(let i=0;i<ns;i++){const an=ua+(i/(ns-1)-.5)*1.5,r1=mr*.3,r2=sl*(.5+fxr(q.t,i+3)*.8);X.moveTo(sx+Math.cos(an)*r1,sy+Math.sin(an)*r1);X.lineTo(sx+Math.cos(an)*r2,sy+Math.sin(an)*r2)}
   X.stroke();
   if(w==1){X.fillStyle='rgba(255,165,55,'+(.3*mf)+')';const cl=24+mf*60;X.beginPath();X.moveTo(sx,sy);X.lineTo(sx+Math.cos(ua-.95)*cl,sy+Math.sin(ua-.95)*cl);X.lineTo(sx+Math.cos(ua+.95)*cl,sy+Math.sin(ua+.95)*cl);X.closePath();X.fill()}
   X.globalCompositeOperation='source-over'}
  const gl=age<.12?1-age/.12:0;
  if(gl>0){X.globalCompositeOperation='lighter';const lg=X.createRadialGradient(sx,sy,0,sx,sy,70);lg.addColorStop(0,'rgba(255,190,90,'+(.18*gl)+')');lg.addColorStop(1,'rgba(255,120,0,0)');X.fillStyle=lg;X.beginPath();X.arc(sx,sy,70,0,7);X.fill();X.globalCompositeOperation='source-over'}
  if(age<.12){const sk=1-age/.12,nsk=4+((q.t>>3)%4);X.strokeStyle='rgba(255,230,150,'+(.85*sk)+')';X.lineWidth=1.2;X.lineCap='round';X.beginPath();
   for(let i=0;i<nsk;i++){const an=ua+(fxr(q.t,i+9)-.5)*.87,r1=3,r2=r1+12+fxr(q.t,i+21)*18;X.moveTo(sx+Math.cos(an)*r1,sy+Math.sin(an)*r1);X.lineTo(sx+Math.cos(an)*r2,sy+Math.sin(an)*r2)}
   X.stroke()}
  if(age<.6){const nsm=(w==1||w==5)?3:2,sa_=1-age/.6;for(let i=0;i<nsm;i++){const ph=fxr(q.t,i+31),r=4+age*16*(.7+ph*.6);X.fillStyle='rgba(212,212,205,'+(.35*sa_*(1-i*.15))+')';X.beginPath();X.arc(sx+px*(ph-.5)*22+ux*age*30,sy+py*(ph-.5)*22+uy*age*30-age*40-i*3,r,0,7);X.fill()}}
  if(w!=4&&age<.45){const ct=age/.45,cc=q.mz?q.mz[0]:a,cd=q.mz?q.mz[1]:b-24;X.save();X.translate(cc+px*(14+ct*70),cd+py*(14+ct*70)-ct*100+ct*ct*160);X.rotate(ct*9);X.fillStyle=w==1?'#c33':'#e8c25a';X.fillRect(-1.5,-2.5,3,5);X.restore()}
  const spd=SPD[w],pos=age*spd,tc=w==5?'220,240,255':w==1?'255,150,50':'255,200,90';
  const n=w==1?6:1,ln=w==5?70:w==2?26:w==1?6:13;
  X.lineCap='round';
  for(let k=0;k<n;k++){const an=w==1?(k-2.5)*.05:0,ca=Math.cos(an),sa=Math.sin(an),vx=ux*ca-uy*sa,vy=ux*sa+uy*ca,q0=Math.min(pos,L),q1=Math.max(pos-ln,0);if(q1>=q0)continue;
   X.strokeStyle='rgba('+tc+',.2)';X.lineWidth=w==1?3:4;X.beginPath();X.moveTo(sx+vx*q1,sy+vy*q1);X.lineTo(sx+vx*q0,sy+vy*q0);X.stroke();
   const q2=Math.max(q0-(q0-q1)*.45,q1);X.strokeStyle='rgba('+tc+',.85)';X.lineWidth=w==1?1.5:2.2;X.beginPath();X.moveTo(sx+vx*q2,sy+vy*q2);X.lineTo(sx+vx*q0,sy+vy*q0);X.stroke();
   if(w!=1){const hx=sx+vx*q0,hy=sy+vy*q0;X.globalCompositeOperation='lighter';X.fillStyle='rgba('+tc+',.4)';X.beginPath();X.arc(hx,hy,w==5?3:5,0,7);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(hx,hy,w==5?1.5:2,0,7);X.fill();X.globalCompositeOperation='source-over'}}
  if(pos>=L){const ia=(pos-L)/spd;if(ia<.16){X.strokeStyle='rgba(255,170,60,'+(1-ia/.16)+')';X.lineWidth=2;for(let k=0;k<5;k++){const an=k*1.3+q.t%7,r1=3+ia*120,r2=r1+7;X.beginPath();X.moveTo(ex+Math.cos(an)*r1,ey+Math.sin(an)*r1);X.lineTo(ex+Math.cos(an)*r2,ey+Math.sin(an)*r2);X.stroke()}}
   if(ia<.1){X.globalCompositeOperation='lighter';X.fillStyle='rgba(255,255,240,'+((1-ia/.1)*.85)+')';X.beginPath();X.arc(ex,ey,1+10*(1-ia/.1),0,7);X.fill();X.globalCompositeOperation='source-over'}}}}
const BC={l:'#c98cff',m:'#9a4de0',d:'#6a2fa8',x:'#43207a',a:'#ff55d8',g:'#ffe45a',w:'#f5f0e0'};
function fc(p,c){X.fillStyle=c;X.beginPath();X.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)X.lineTo(p[i],p[i+1]);X.closePath();X.fill();X.strokeStyle='rgba(25,0,45,.5)';X.lineWidth=1;X.stroke()}
function seg(ax,ay,bx,by,w,c1,c2){const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;fc([ax+nx,ay+ny,bx+nx,by+ny,bx,by,ax,ay],c1);fc([ax-nx,ay-ny,bx-nx,by-ny,bx,by,ax,ay],c2)}