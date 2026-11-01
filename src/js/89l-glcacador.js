// Caçador (k==4) em 3D: zumbi_cacador.glb (ZGLB[7]) — clipes idle/walk/climb/jump/attack/roar. Estado vem do host em
// e[7]=st, e[8]=altura (px), e[9]=id da vítima, e[10]=fase 0..100 (subida/salto). Agarrado: clipe 'attack' em laço + balanço lateral
// (rolagem) puxando a cabeça para um lado e para o outro; a vítima inclina junto (HZV lido em 89d-gljogador.js).
const HZV={};
function glCacPush(x,y,fa,id,t,e){
 const st=e[7]|0,alt=e[8]|0,vic=e[9]||'',p100=(e[10]|0)/100,yaw0=Math.PI/2-fa;
 let cn='idle',ph=((t+id*137)%2430)/2430,roll=0,yaw=yaw0;
 if(st==1){cn='walk';ph=((t+id*91)%560)/560}
 else if(st==7){cn='walk';ph=((t+id*91)%1100)/1100}
 else if(st==2){cn='climb';ph=Math.min(.999,p100)}
 else if(st==5){cn='jump';ph=Math.min(.999,p100*.75)}
 else if(st==6){cn='attack';ph=((t+id*53)%1200)/1200;const w=Math.sin(t/190);roll=w*.5;yaw=yaw0+Math.sin(t/330)*.35;
  if(vic)HZV[vic]={v:w*.16,u:Date.now()}}
 glClipPush(7,x,y,yaw,cn,ph,.9,1,0,alt,roll);
}
