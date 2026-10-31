// ---------- MÚSICA: playlist de gameplay (HTMLAudioElement, sem WebAudio por elemento) ----------
// Tabela de faixas e ganho de normalização (dB, ajustável de ouvido; alvo RMS de fundo ~ -27 dBFS).
// Os arquivos ficam em music/ ao lado de game.html; nada é baixado antes da partida.
const MUS_T=[
 {n:'Pufino — Metal Is Trash',f:'Pufino - Metal Is Trash (freetouse.com).mp3',db:-13.6},
 {n:'Zambolino — Rotten Bones',f:'Zambolino - Rotten Bones (freetouse.com).mp3',db:-12.2},
 {n:'Nebulite — Iron Pulse',f:'Nebulite - Iron Pulse (freetouse.com).mp3',db:-16.1}];
// st: parado | espera | tocando | saindo ; A = faixa atual, B = próxima no crossfade; env 0..1
const MUS={st:'parado',A:null,B:null,last:-1,order:[],wait:0,out:0,xf:0,xfBad:0,dead:0,duck:0,wantDuck:0};
const MUS_FADE_IN=3000,MUS_FADE_OUT=1500,MUS_XF=3000,MUS_DELAY=1200;
// Dois elementos fixos (A/B), criados só quando a partida começa e reaproveitados em todas as faixas
let MUS_EA=null,MUS_EB=null;
function musSlot(){
 const s={a:new Audio(),idx:-1,env:0};
 s.a.preload='auto';s.a.volume=0;
 s.a.addEventListener('playing',()=>{if(MUS.st=='tocando'&&(MUS.A===s||MUS.B===s))MUS.wantDuck=1});
 s.a.addEventListener('ended',()=>{if(MUS.st=='tocando'&&MUS.A===s&&!MUS.B)musNextNow()});
 s.a.addEventListener('error',()=>{
  if(MUS.st=='tocando'&&MUS.A===s){MUS.dead=1;musStop();MUS.st='parado'}
  else if(MUS.B===s){MUS.B=null;MUS.xfBad=1}});
 s.a.addEventListener('stalled',()=>{});
 return s;
}
function musAssign(s,idx){if(!s)return s;try{s.a.pause()}catch(e){}s.idx=idx;s.env=0;s.a.volume=0;s.a.src='music/'+encodeURIComponent(MUS_T[idx].f);return s}
function musVolOf(s,m){return Math.min(1,Math.max(0,Math.pow(10,MUS_T[s.idx].db/20)*AU.mv*1.2*s.env*m))}
function musPlay(s){try{const p=s.a.play();if(p&&p.catch)p.catch(()=>{if(MUS.A===s){MUS.dead=1;musStop();MUS.st='parado'}else if(MUS.B===s){MUS.B=null;MUS.xfBad=1}})}catch(e){}}
function musPick(){let i;do{i=Math.random()*MUS_T.length|0}while(MUS_T.length>1&&i===MUS.last);
 MUS.last=i;MUS.order.push(MUS_T[i].n);if(MUS.order.length>64)MUS.order.shift();return i}
function musStopEl(s){if(!s)return;try{s.a.pause()}catch(e){}}
function musStop(){musStopEl(MUS.A);musStopEl(MUS.B);MUS.A=MUS.B=null;MUS.xf=0;MUS.xfBad=0;MUS.wantDuck=0}
function musStart(){if(!MUS_EA){MUS_EA=musSlot();MUS_EB=musSlot()}
 musStop();MUS.A=musAssign(MUS_EA,musPick());MUS.xf=performance.now();MUS.st='tocando';musPlay(MUS.A)}
function musNextNow(){const old=MUS.A;MUS.A=musAssign(old===MUS_EA?MUS_EB:MUS_EA,musPick());MUS.xf=performance.now();MUS.xfBad=0;musPlay(MUS.A)}
function musPromote(){if(!MUS.B)return;musStopEl(MUS.A);MUS.A=MUS.B;MUS.B=null;MUS.A.env=1;MUS.xf=0;MUS.xfBad=0;MUS.wantDuck=1}
// Sub-barramento da música sintética (AU.msyn): 0 quando a playlist toca de fato, 1 fora da partida
function musDuckApply(){
 if(!AU.c||!AU.msyn)return;
 if(MUS.duck===MUS.wantDuck)return;
 MUS.duck=MUS.wantDuck;
 const g=AU.msyn.gain,t=AU.c.currentTime;
 try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(MUS.duck?0:1,t+1.5)}catch(e){}
}
function musApply(now){
 const m=MUS.st=='saindo'?Math.max(0,1-(now-MUS.out)/MUS_FADE_OUT):1;
 if(MUS.A)MUS.A.a.volume=musVolOf(MUS.A,m);
 if(MUS.B)MUS.B.a.volume=musVolOf(MUS.B,m);
}
function musTickPlaying(now){
 const A=MUS.A;if(!A)return;const a=A.a,d=a.duration;
 if(!MUS.B&&!MUS.xfBad)A.env=Math.min(1,(now-MUS.xf)/MUS_FADE_IN);
 if(MUS.B){
  const u=Math.min(1,(now-MUS.xf)/MUS_XF);A.env=1-u;MUS.B.env=u;
  if(u>=1)musPromote();
  return;
 }
 if(a.ended)return;
 if(!MUS.xfBad&&isFinite(d)&&d>0&&a.currentTime>0&&d-a.currentTime<=MUS_XF/1000&&d-a.currentTime>0){
  MUS.B=musAssign(A===MUS_EA?MUS_EB:MUS_EA,musPick());MUS.xf=now;musPlay(MUS.B);
 }
}
function musFrame(){
 const now=performance.now();
 const inMatch=typeof snap!=='undefined'&&snap&&snap.ph==1;
 if(!inMatch){
  if(MUS.st=='tocando'||MUS.st=='espera'){MUS.st='saindo';MUS.out=now;MUS.wantDuck=0}
  if(MUS.st=='saindo'&&now-MUS.out>=MUS_FADE_OUT){musStop();MUS.st='parado'}
  if(MUS.st!='saindo')MUS.dead=0;
  musApply(now);musDuckApply();return;
 }
 if(MUS.dead){musApply(now);musDuckApply();return}
 if(MUS.st=='saindo'){musStop();MUS.st='espera';MUS.wait=now+MUS_DELAY}
 if(MUS.st=='parado'){MUS.st='espera';MUS.wait=now+MUS_DELAY}
 if(MUS.st=='espera'){if(now>=MUS.wait)musStart();musDuckApply();return}
 musTickPlaying(now);musApply(now);musDuckApply();
}
try{Object.defineProperty(window,'__mus',{configurable:true,get:()=>{
 const A=MUS.A,a=A&&A.a;
 return {estado:MUS.st,faixa:A?MUS_T[A.idx].n:null,ordem:MUS.order.slice(),vol:a?a.volume:0,t:a?a.currentTime:0,dur:a&&isFinite(a.duration)?a.duration:0,sinteticaGain:AU.msyn?AU.msyn.gain.value:null};
}})}catch(e){}
setInterval(musFrame,120);
