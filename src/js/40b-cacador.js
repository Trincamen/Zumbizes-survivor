// CAÇADOR (zumbi k==4, só no HOST): frágil, vive ESCONDIDO e pula na cabeça do jogador.
// Estados z.st: 0 escondido (parado no esconderijo) · 1 perseguindo (foi achado) · 2 subindo na casa · 3 em cima do telhado
// · 5 no ar (salto, 0,7 s) · 6 AGARRADO na cabeça da vítima (z.at = id) · 7 indo para outro esconderijo.
// Esconderijos (z.ty): 'r' telhado de casa (sobe pela parede sul), 'w' colado na parede de um prédio do lado OPOSTO ao jogador,
// 'i' dentro de um prédio. Agarrado: a vítima anda "bêbada" (hzSway), atira sozinha nele (hzTarget) com cadência +25%, e ele
// só morre pelos tiros da tabela HZ_NEED (por arma cw 0..5: pistola 5, escopeta 1, rifle 2, metralhadora 3, lança-chamas 8, sniper 1);
// os outros jogadores também miram nele (prioridade) e ajudam. Solto: hp normal (baixo).
const HZ_NEED=[5,1,2,3,8,1],HZ_H=40,HZ_AMB=85,HZ_SEE=190,HZ_JMP=115,HZ_REACH=240; // HZ_REACH: alcance máx. do salto — quem fugir mais longe (buff de velocidade/corrida) faz ele cair no chão // alcances (px): emboscada / achado por visão / salto
function hzPickSpot(z,L){
 const pl=L.length?L[Math.random()*L.length|0]:{x:2000,y:4500},roll=Math.random();
 for(let t=0;t<40;t++){
  const b=BLD[Math.random()*BLD.length|0];if(!b||b.T=='r')continue;
  const cx=b.x+b.w/2,cy=b.y+b.h/2,d=Math.hypot(cx-pl.x,cy-pl.y);if(d<500||d>1700)continue;
  if(roll<.4){if(b.T!='x')continue;z.sx=b.x+30+Math.random()*(b.w-60);z.sy=b.y+b.h+22;z.ty='r';z.b=b;if(blk(z.sx,z.sy,12))continue;return 1}
  if(roll<.65){const p=inPos([b]);z.sx=p[0];z.sy=p[1];z.ty='i';z.b=b;return 1}
  const dx=pl.x-cx,dy=pl.y-cy;let x,y;
  if(Math.abs(dx)*b.h>Math.abs(dy)*b.w){x=dx>0?b.x-24:b.x+b.w+24;y=b.y+30+Math.random()*(b.h-60)}else{y=dy>0?b.y-24:b.y+b.h+24;x=b.x+30+Math.random()*(b.w-60)}
  if(blk(x,y,14))continue;z.sx=x;z.sy=y;z.ty='w';z.b=b;return 1}
 return 0}
function hzInit(z,L){z.st=0;z.alt=0;z.t=0;z.gp=1;z.at=null;z.lost=0;
 if(!hzPickSpot(z,L)){z.ty='w';z.sx=z.x;z.sy=z.y}
 z.x=z.sx;z.y=z.sy;if(z.ty=='r'){z.st=2;z.t=0}}
function hzJump(z,v){z.st=5;z.t=0;z.at=v.id;z.jx=z.x;z.jy=z.y;z.ja=z.alt||0}
function hzTarget(p,rg){for(const z of Z)if(z.k==4&&z.st==6&&z.hp>0&&(z.at==p.id||(Math.hypot(z.x-p.x,z.y-p.y)<=rg&&clear(p,z))))return z;return null}
// vítima "descontrolada": balança de um lado para o outro (perpendicular à direção em que olha)
function hzSway(p,dt){const t=Date.now()/1000,w=Math.sin(t*3.1+(p.hzs||0))+.5*Math.sin(t*7.3),a=(p.fa||0)+Math.PI/2,sg=w<0?-1:1;
 mvT(p,p.x+Math.cos(a)*60*sg,p.y+Math.sin(a)*60*sg,Math.min(1.2,Math.abs(w))*95*dt,12,1)}
function hunterAct(z,dt,all){
 const L=all.filter(p=>!p.dead);
 if(z.st==6){const v=PL[z.at];if(!v||v.dead||v.hz!==z){if(v&&v.hz===z)v.hz=null;z.st=1;z.alt=0;z.at=null;return}
  z.x=v.x+Math.cos(v.fa||0)*3;z.y=v.y+Math.sin(v.fa||0)*3;z.alt=HZ_H;z.fa=v.fa||0;return}
 if(z.st==5){const v=PL[z.at];z.t+=dt;const u=Math.min(1,z.t/.7);
  if(!v||v.dead||v.hz){z.st=1;z.alt=0;z.at=null;return}
  const dx=v.x-z.jx,dy=v.y-z.jy,d=Math.hypot(dx,dy),k=d>HZ_REACH?HZ_REACH/d:1; // k<1: a vítima já está fora do alcance do salto
  z.x=z.jx+dx*k*u;z.y=z.jy+dy*k*u;z.alt=z.ja*(1-u)+(k<1?0:HZ_H)*u+Math.sin(u*Math.PI)*50;z.fa=Math.atan2(dy,dx);
  // errou (k<1): cai no chão e segue perseguindo normalmente, sem atordoar
  if(u>=1){if(k<1){z.st=1;z.lost=0;z.alt=0;z.at=null;z.cd=.6}else{z.st=6;z.gp=1;v.hz=z;v.hzs=Math.random()*6.28;z.alt=HZ_H}}return}
 
 if(z.st==2){z.t+=dt;const H=z.b?z.b.H:90;z.alt=Math.min(1,z.t/1.37)*H*1.2;z.fa=-Math.PI/2;
  if(z.t>=1.37){const b=z.b;z.y=b.y+b.h-26;z.alt=H*1.2;z.st=3}return}
 let near=null,nd=1e9;for(const p of L){const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<nd){nd=d;near=p}}
 if(z.st==0||z.st==3){
  if(near&&!near.hz){if(z.st==3&&nd<HZ_JMP){hzJump(z,near);return} // do telhado salta por cima da parede
   if(z.st==0&&nd<HZ_AMB){if(clear(z,near)){hzJump(z,near);return}z.st=1;z.lost=0;return} // parede no meio: sai do esconderijo e contorna
   if(z.st==0&&nd<HZ_SEE&&los(z,near)){z.st=1;z.lost=0}}return}
 if(z.st==1){
  if(!near){return}
  if(near.hz){ // alvo já ocupado: procura outro, senão espera
   let o=null,od=1e9;for(const p of L){if(p.hz)continue;const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<od){od=d;o=p}}near=o;nd=od;if(!near)return}
  if(z.cd>0)z.cd-=dt;
  if(nd<HZ_JMP&&!(z.cd>0)&&clear(z,near)){hzJump(z,near);return} // nunca salta atravessando parede
  z.fa=Math.atan2(near.y-z.y,near.x-z.x);pathTo(z,'z'+near.id,near.x,near.y,z.s*dt,10);
  if(nd>900&&!los(z,near)){z.lost+=dt;if(z.lost>6){z.lost=0;hzInit(z,L);if(z.ty!='r')z.st=0}}else z.lost=0;return}
 if(z.st==7){pathTo(z,'h'+z.i,z.sx,z.sy,z.s*dt*.7,10);if(Math.hypot(z.sx-z.x,z.sy-z.y)<14){if(z.ty=='r'){z.st=2;z.t=0}else z.st=0}}
}
