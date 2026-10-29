// ---------- BOSS: mini motor 3D low poly (faces com luz, giro real, profundidade) ----------
const E_=42*Math.PI/180,SE=Math.sin(E_),CE=Math.cos(E_),K2=Math.tan(E_),LV=(()=>{const v=[-.5,.85,.45],l=Math.hypot(...v);return v.map(a=>a/l)})(),RGBC={};let BYAW=null,DT_=.016,FS=[];
const rgbOf=h=>RGBC[h]||(RGBC[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
function rot3(p,rx,ry,rz){let x=p[0],y=p[1],z=p[2],c,s,t;if(rx){c=Math.cos(rx);s=Math.sin(rx);t=y*c-z*s;z=y*s+z*c;y=t}if(ry){c=Math.cos(ry);s=Math.sin(ry);t=x*c+z*s;z=-x*s+z*c;x=t}if(rz){c=Math.cos(rz);s=Math.sin(rz);t=x*c-y*s;y=x*s+y*c;x=t}return[x,y,z]}
const TF=(rx,ry,rz,tx,ty,tz,par)=>p=>{const q=rot3(p,rx,ry,rz);q[0]+=tx;q[1]+=ty;q[2]+=tz;return par?par(q):q};
function boxV(w,h,d,tt,tb){const a=w/2,b=h/2,c=d/2;return{v:[[-a*tt,b,-c],[a*tt,b,-c],[a*tt,b,c],[-a*tt,b,c],[-a*tb,-b,-c],[a*tb,-b,-c],[a*tb,-b,c],[-a*tb,-b,c]],f:[[0,1,2,3],[4,5,6,7],[3,2,6,7],[0,1,5,4],[0,3,7,4],[1,2,6,5]]}}
function prismV(r,len,n){const v=[],f=[[],[]];for(let i=0;i<n;i++){const a=i/n*6.283;v.push([Math.cos(a)*r,Math.sin(a)*r,len/2]);f[0].push(i)}for(let i=0;i<n;i++){const a=i/n*6.283;v.push([Math.cos(a)*r,Math.sin(a)*r,-len/2])}for(let i=0;i<n;i++)f.push([i,(i+1)%n,n+(i+1)%n,n+i]);f[1]=f[0].map(i=>i+n);return{v,f}}
function latheV(rg,n){const v=[],f=[];for(const r of rg)for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832;v.push([Math.cos(a)*r[1],r[0],Math.sin(a)*r[2]])}for(let i=0;i<rg.length-1;i++)for(let k=0;k<n;k++)f.push([i*n+k,i*n+(k+1)%n,(i+1)*n+(k+1)%n,(i+1)*n+k]);f.push(Array.from({length:n},(_,k)=>k));f.push(Array.from({length:n},(_,k)=>(rg.length-1)*n+k));return{v,f}}
const B_={short:boxV(26,40,24,1,.92),shin:boxV(14,24,14,1,.85),shoe:boxV(20,12,32,1,1),pelv:boxV(44,10,26,1,1),torso:boxV(58,56,32,1.1,.88),vf:boxV(16,52,6,1,1),vb:boxV(58,52,6,1.08,.9),pack:boxV(42,46,18,1,.95),flap:boxV(38,6,20,1,1),strap:boxV(8,50,4,1,1),neck:boxV(14,8,14,1,1),head:latheV([[0,22,22],[8,34,30],[44,40,32],[58,24,22]],8),ear:boxV(6,14,10,1,1),nose:boxV(9,8,8,1,.7),eye:prismV(13,18,12),pup:prismV(6,3,10),pupS:prismV(4,3,8),up:boxV(16,34,16,1,.9),slv:boxV(20,18,20,1,1),fore:boxV(14,34,14,1,.8),hand:boxV(15,12,10,1,.9),fing:boxV(4,12,4,1,.8)};
function part(sh,col,xf,off,glob){const em=col[0]=='!';if(em)col=col.slice(1);const V=sh.v.map(p=>glob(xf([p[0]+off[0],p[1]+off[1],p[2]+off[2]])));let c;
 if(sh.cp)c=glob(xf([sh.cp[0]+off[0],sh.cp[1]+off[1],sh.cp[2]+off[2]]));else{c=[0,0,0];for(const p of V){c[0]+=p[0];c[1]+=p[1];c[2]+=p[2]}c=c.map(a=>a/V.length)}
 for(const f of sh.f){const P=f.map(i=>V[i]),a=P[0],b=P[1],d=P[2],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[d[0]-a[0],d[1]-a[1],d[2]-a[2]];let n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];const l=Math.hypot(n[0],n[1],n[2])||1;n=[n[0]/l,n[1]/l,n[2]/l];
  if(n[0]*(a[0]-c[0])+n[1]*(a[1]-c[1])+n[2]*(a[2]-c[2])<0)n=[-n[0],-n[1],-n[2]];if(n[1]*SE+n[2]*CE<=.02)continue;
  let dp=0;for(const p of P)dp+=p[1]*SE+p[2]*CE;FS.push({P,n,col,em,d:dp/P.length})}}
function drawBoss(x,y,o){const t=o.t,bs=o.bs,arm=o.arm,tgt=Math.PI/2-o.fa;if(BYAW==null)BYAW=tgt;BYAW+=ad(tgt,BYAW)*Math.min(1,DT_*9);
 const psi=bs==5?t/190:BYAW,run=bs==4,ang=bs==3||bs==4||bs==6,wk=bs==0||run?Math.sin(t/(run?75:170)):Math.sin(t/400)*.08,amp=run?.9:bs==0?.55:.1,
  lean=bs==4?.42:bs==3?-.14:bs==6?-.2:bs==0?.09:.04,bob=bs==5?0:Math.abs(wk)*3+Math.sin(t/400)*1.2,
  root=TF(lean,0,0,0,bob,0),glob=p=>rot3(p,0,psi,0),add=(sh,col,xf,off)=>part(sh,col,xf,off||[0,0,0],glob);FS=[];
 ell(x,y,36,12,'rgba(0,0,0,.5)');
 for(const s of[-1,1]){const sw=-wk*amp*s,hip=TF(sw,0,0,s*17,76,0,root),kn=TF(Math.max(0,-sw)*1.1+(run?.3:0),0,0,0,-40,0,hip),an=TF(0,0,0,0,-24,0,kn);
  add(B_.short,'#2b2f38',hip,[0,-20,0]);add(B_.shin,'#7d8f78',kn,[0,-12,0]);add(B_.shoe,'#2a1c14',an,[0,-6,6])}
 const tw=TF(0,bs==0?wk*.12:0,0,0,76,0,root);
 add(B_.pelv,'#1f2229',root,[0,76,0]);add(B_.torso,'#a79a86',tw,[0,28,0]);add(B_.vf,'#6a1a14',tw,[-21,26,18]);add(B_.vf,'#6a1a14',tw,[21,26,18]);add(B_.vb,'#561210',tw,[0,26,-19]);
 add(B_.pack,'#2a3a55',tw,[0,32,-30]);add(B_.flap,'#1f2d45',tw,[0,56,-30]);add(B_.strap,'#25354f',tw,[-13,30,18.5]);add(B_.strap,'#25354f',tw,[13,30,18.5]);add(B_.neck,'#66786f',tw,[0,60,0]);
 const hd=TF(bs==6?-.55:bs==5?0:Math.sin(t/500)*.05,bs==5?Math.sin(t/90)*.35:-wk*.08,0,0,64,0,tw),mo=bs==6?14:ang?10:6+Math.abs(Math.sin(t/300))*4,showF=Math.cos(psi)>-.2;
 add(B_.head,'#7a8f86',hd,[0,0,0]);add(B_.ear,'#66786f',hd,[-37,29,0]);add(B_.ear,'#66786f',hd,[37,29,0]);if(showF)add(B_.nose,'#66786f',hd,[0,26,31]);
 if(showF)for(const e of[-1,1]){add(B_.eye,ang?'#2a0c0c':'#1d0c0e',hd,[e*16,38,28]);const lx=bs==5?Math.cos(t/110+e)*4:0,ly=bs==5?Math.sin(t/110+e)*4:-1;add(ang?B_.pupS:B_.pup,ang?'!#ff5a3a':'!#d02a1c',hd,[e*16+lx,38+ly,38.3])}
 if(showF)add({v:[[-10,0,0],[10,0,0],[13,mo,0],[-13,mo,0]],f:[[0,1,2,3]],cp:[0,mo/2,-12]},'#1a0508',hd,[0,6,31.4]);
 if(showF)for(let i=0;i<4;i++)add({v:[[-2.7,0,0],[2.7,0,0],[2.7,6,0],[-2.7,6,0]],f:[[0,1,2,3]],cp:[0,3,-12]},'#cbbf90',hd,[-9+i*6,6+mo-6,31.8]);
 if(showF){for(const e of[-1,1])add({v:[[-1.6,0,0],[1.6,0,0],[2.2,13,0],[-2.2,13,0]],f:[[0,1,2,3]],cp:[0,6,-12]},'#7a0c12',hd,[e*16,14,31.8]);add({v:[[-8,12,0],[6,8,0],[10,24,0],[2,34,0],[-6,28,0]],f:[[0,1,2,3,4]],cp:[0,20,-12]},'#7a0f12',tw,[0,0,16.4])}
 if(showF)for(const q of[-5,5])add({v:[[-3,0,0],[3,0,0],[3,4,0],[-3,4,0]],f:[[0,1,2,3]],cp:[0,2,-12]},'#cbbf90',hd,[q,6,31.8]);
 for(const s of[-1,1]){const sw=bs==0||run?wk*amp*s*.9:Math.sin(t/300+s)*.05;let rx=sw,sp=.12;
  if(bs==1||bs==2||arm>0){rx=sw*(1-arm)-2.85*arm;sp=.12+.1*arm}
  if(bs==4){rx=.9;sp=.2}else if(bs==3){rx=.6;sp=.3}else if(bs==5){rx=Math.sin(t/160+s)*.5;sp=.5+Math.sin(t/200)*.2}else if(bs==6){rx=-.35;sp=1.15}
  const sh=TF(rx,0,0,s*36,52,0,tw),ar=TF(0,0,s*sp,0,0,0,sh),eb=arm>0?.15:.25+Math.max(0,-sw)*.5,el=TF(-eb,0,0,0,-34,0,ar),hn=TF(0,0,0,0,-34,0,el);
  add(B_.up,'#7d8f78',ar,[0,-17,0]);add(B_.slv,'#6a1a14',ar,[0,-9,0]);add(B_.fore,'#6f806b',el,[0,-17,0]);add(B_.hand,'#8a9a84',hn,[0,-6,0]);for(const fx of[-4,0,4])add(B_.fing,'#6f806b',hn,[fx,-14,1])}
 FS.sort((a,b)=>a.d-b.d);X.lineWidth=1;X.strokeStyle='rgba(15,10,30,.3)';
 const S_=.88;
 for(const f of FS){const l=f.em?1:.38+.78*Math.max(0,f.n[0]*LV[0]+f.n[1]*LV[1]+f.n[2]*LV[2]),c=rgbOf(f.col);X.fillStyle='rgb('+Math.min(255,c[0]*l|0)+','+Math.min(255,c[1]*l|0)+','+Math.min(255,c[2]*l|0)+')';X.beginPath();f.P.forEach((p,i)=>X[i?'lineTo':'moveTo'](x+p[0]*S_,y-(p[1]-p[2]*K2)*S_));X.closePath();X.fill();X.stroke()}
 X.globalCompositeOperation='lighter';for(const f of FS)if(f.em&&f.n[1]*SE+f.n[2]*CE>.55){let sx=0,sy=0;for(const p of f.P){sx+=x+p[0]*S_;sy+=y-(p[1]-p[2]*K2)*S_}sx/=f.P.length;sy/=f.P.length;const g=X.createRadialGradient(sx,sy,1,sx,sy,18);g.addColorStop(0,ang?'rgba(255,90,40,.55)':'rgba(255,50,30,.38)');g.addColorStop(1,'rgba(255,40,20,0)');X.fillStyle=g;X.fillRect(sx-18,sy-18,36,36)}X.globalCompositeOperation='source-over'}