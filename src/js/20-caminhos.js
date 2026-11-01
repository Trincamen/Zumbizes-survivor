// ---------- caminhos (campo de distância em grade) ----------
const CS=24,GW=167,GH=250,GB=new Uint8Array(GW*GH),QQ=new Int32Array(GW*GH),DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1];let FL={};
function initGrid(){FL={};for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)GB[y*GW+x]=blk(x*CS+CS/2,y*CS+CS/2,13)?1:0}
function bfs(F,sx,sy){F.fill(-1);let h=0,t=0;F[sy*GW+sx]=0;QQ[t++]=sy*GW+sx;
 while(h<t){const i=QQ[h++];if(F[i]>=80)continue;const x=i%GW,y=i/GW|0,d=F[i]+1;
  for(let k=0;k<8;k++){const nx=x+DX[k],ny=y+DY[k];if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const j=ny*GW+nx;if(F[j]>=0||GB[j])continue;if(k>=4&&(GB[y*GW+nx]||GB[ny*GW+x]))continue;F[j]=d;QQ[t++]=j}}}
function getF(key,tx,ty){const sx=Math.max(0,Math.min(GW-1,tx/CS|0)),sy=Math.max(0,Math.min(GH-1,ty/CS|0));let f=FL[key];if(!f)f=FL[key]={F:new Int16Array(GW*GH),sx:-1,sy:-1,t:0};const n=Date.now();
 if(f.sx<0||(f.sx!=sx||f.sy!=sy)&&n-f.t>300){bfs(f.F,sx,sy);f.sx=sx;f.sy=sy;f.t=n}return f.F}
function mvT(e,gx,gy,st,r,nf){const d=Math.hypot(gx-e.x,gy-e.y);if(d<1)return;st=Math.min(st,d);const ux=(gx-e.x)/d,uy=(gy-e.y)/d,x0=e.x,y0=e.y;
 if(!blk(e.x+ux*st,e.y,r))e.x+=ux*st;if(!blk(e.x,e.y+uy*st,r))e.y+=uy*st;
 if(!nf&&Math.abs(e.x-x0)+Math.abs(e.y-y0)<st*.5){if(!e.sd)e.sd=Math.random()<.5?1:-1;const px=-uy*e.sd*st,py=ux*e.sd*st;if(!blk(e.x+px,e.y+py,r)){e.x+=px;e.y+=py}else e.sd=-e.sd}
 e.x=Math.max(12,Math.min(MW-12,e.x));e.y=Math.max(12,Math.min(MH-12,e.y))}
function pathTo(e,key,tx,ty,st,r){const F=getF(key,tx,ty),a=Math.min(GW-1,Math.max(0,e.x/CS|0)),b=Math.min(GH-1,Math.max(0,e.y/CS|0)),d=F[b*GW+a];let gx=tx,gy=ty;
 if(!(d>=0&&d<=2)){let bd=d>=0?d:1e9,bk=-1;for(let k=0;k<8;k++){const nx=a+DX[k],ny=b+DY[k];if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const dj=F[ny*GW+nx];if(dj<0||dj>=bd)continue;if(k>=4&&(GB[b*GW+nx]||GB[ny*GW+a]))continue;bd=dj;bk=k}
  if(bk>=0){gx=(a+DX[bk])*CS+CS/2;gy=(b+DY[bk])*CS+CS/2}}
 e.fa=Math.atan2(gy-e.y,gx-e.x);mvT(e,gx,gy,st,r)}
// Perseguição dos zumbis comuns: mesmo campo de distância do pathTo, mas cada zumbi tem "personalidade" (z.wa/z.wf/z.wp/z.fl):
// desvio lateral fixo (flanqueia de longe), ondulação senoidal do rumo e ~22% que vão retos. Perto do alvo o desvio some.
function zChase(z,key,tx,ty,st,r){const F=getF(key,tx,ty),a=Math.min(GW-1,Math.max(0,z.x/CS|0)),b=Math.min(GH-1,Math.max(0,z.y/CS|0)),d=F[b*GW+a];let gx=tx,gy=ty;
 if(!(d>=0&&d<=2)){let bd=d>=0?d:1e9,bk=-1;for(let k=0;k<8;k++){const nx=a+DX[k],ny=b+DY[k];if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const dj=F[ny*GW+nx];if(dj<0||dj>=bd)continue;if(k>=4&&(GB[b*GW+nx]||GB[ny*GW+a]))continue;bd=dj;bk=k}
  if(bk>=0){gx=(a+DX[bk])*CS+CS/2;gy=(b+DY[bk])*CS+CS/2}}
 if(z.wa==null){z.wa=Math.random()<.22?0:.35+Math.random()*.6;z.wf=.8+Math.random()*1.3;z.wp=Math.random()*6.28;z.fl=z.wa?(Math.random()<.5?-1:1)*(.15+Math.random()*.45):0}
 const de=Math.hypot(tx-z.x,ty-z.y),fk=Math.max(0,Math.min(1,(de-110)/320)),wk=Math.max(0,Math.min(1,(de-55)/200));
 let dx=gx-z.x,dy=gy-z.y;const L=Math.hypot(dx,dy)||1,rot=z.fl*fk+z.wa*Math.sin(performance.now()/1000*z.wf+z.wp)*wk,c=Math.cos(rot),sn=Math.sin(rot);
 const ux=(dx*c-dy*sn)/L,uy=(dx*sn+dy*c)/L,Lm=Math.max(L,CS);
 z.fa=Math.atan2(uy,ux);mvT(z,z.x+ux*Lm,z.y+uy*Lm,st,r)}
// afasta zumbis sobrepostos (grade espacial) para não andarem empilhados em fila
function zSep(Z,dt){const G=new Map(),cs=48;for(const z of Z){if(z.hp<=0||z.k==3||z.k==4)continue;const k=(z.x/cs|0)*1000+(z.y/cs|0);let l=G.get(k);if(!l)G.set(k,l=[]);l.push(z)}
 for(const l of G.values())for(const z of l){const cx=z.x/cs|0,cy=z.y/cs|0;let px=0,py=0;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const m=G.get((cx+i)*1000+(cy+j));if(!m)continue;for(const o of m){if(o===z)continue;const ddx=z.x-o.x,ddy=z.y-o.y,dd=Math.hypot(ddx,ddy)||.01,mn=(z.r+o.r)*1.05;if(dd<mn){const f=(mn-dd)/mn;px+=ddx/dd*f;py+=ddy/dd*f}}}
  if(px||py){const sp=Math.min(1,Math.hypot(px,py)),k=70*dt*sp/(Math.hypot(px,py)||1),nx=z.x+px*k,ny=z.y+py*k;if(!blk(nx,z.y,z.r*.7))z.x=nx;if(!blk(z.x,ny,z.r*.7))z.y=ny}}}
const hitW=(x,y)=>{if(x<0||y<0||x>=MW||y>=MH)return 1;const L=OB[(y/200|0)*20+(x/200|0)];if(L)for(const o of L)if(!o.dead&&o.t==5&&x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h)return 1;return 0};
function rayW(x,y,ux,uy,mx){for(let d=8;d<=mx;d+=8)if(hitW(x+ux*d,y+uy*d))return d;return mx}
const clear=(a,b)=>{const d=Math.hypot(b.x-a.x,b.y-a.y)||1;return rayW(a.x,a.y,(b.x-a.x)/d,(b.y-a.y)/d,d)>=d};
function los(a,b){for(let t=.25;t<1;t+=.25)if(blk(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,2))return 0;return 1}