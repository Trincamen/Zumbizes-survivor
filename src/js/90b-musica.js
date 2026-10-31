// ---------- MÚSICA: playlist de gameplay (HTMLAudioElement, sem WebAudio por elemento) ----------
// Tabela de faixas e ganho de normalização (dB, ajustável de ouvido; alvo RMS de fundo ~ -27 dBFS).
// Os arquivos ficam em music/ ao lado de game.html; nada é baixado antes da partida.
const MUS_T=[
 {n:'Pufino — Metal Is Trash',f:'Pufino - Metal Is Trash (freetouse.com).mp3',db:-13.6},
 {n:'Zambolino — Rotten Bones',f:'Zambolino - Rotten Bones (freetouse.com).mp3',db:-12.2},
 {n:'Nebulite — Iron Pulse',f:'Nebulite - Iron Pulse (freetouse.com).mp3',db:-16.1}];
// st: parado | espera | tocando | saindo ; A = faixa atual, B = próxima no crossfade; env 0..1
const MUS={st:'parado',A:null,B:null,last:-1,order:[],wait:0,out:0,xf:0,xfBad:0,dead:0,duck:0,wantDuck:0,dm:1,dm0:1,dm1:1,dmt:0,dmd:0};
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
// MUS.dm = atenuador da playlist para o boss (MU2): 1 normal, 0 enquanto a musica do boss toca
function musVolOf(s,m){return Math.min(1,Math.max(0,Math.pow(10,MUS_T[s.idx].db/20)*AU.mv*1.2*s.env*m*MUS.dm))}
// fade do atenuador da playlist (ms); usado pelo boss (0,8 s ao entrar em lead, 4 s na saida)
function musDuckPlaylist(to,ms){MUS.dm0=MUS.dm;MUS.dm1=to;MUS.dmt=performance.now();MUS.dmd=Math.max(1,ms|0)}
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
function musDmTick(now){
 if(MUS.dmd>0){const u=Math.min(1,(now-MUS.dmt)/MUS.dmd);MUS.dm=MUS.dm0+(MUS.dm1-MUS.dm0)*u;if(u>=1)MUS.dmd=0}
}
function musApply(now){
 musDmTick(now);
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
 if(typeof bmFrame==='function')bmFrame(); // MU2: musica do boss (por quadro; 120 ms fora da partida)
 musDmTick(now);
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
// ---------- MU2: musica do BOSS sincronizada com o drop (HTMLAudioElement A/B, sem WebAudio) ----------
// Medidas em saidas/boss_cut_medidas.md: BM_START = 1a batida do lead-in (depois do artefato de 32,7 ms),
// BM_DROP = degrau do drop (batida 256), BM_LOOP_A..BM_LOOP_B = corpo do loop (71 compassos, emenda de -39 dB),
// BM_BAR = 1,6896 s (compasso a 142 BPM). O audio e posicionado para a primeira batida do drop cair na chegada
// do boss (ev 7); o relogio de AUDIO e o mestre do disparo, com BM_LAT de compensacao da saida.
// MU2b: BM_AHEAD compensa a latencia de partida do elemento (play/seek chega 80-300 ms depois); BM_LAT, a
// latencia de saida do audio. Ajustaveis de ouvido por LS 'bmahead'/'bmlat' ou ?bmahead=..&bmlat=.. na URL.
function bmCfg(k,def){
 try{const q=new URLSearchParams(location.search).get(k);if(q!=null&&q!==''&&isFinite(+q))return +q}catch(e){}
 const v=LS.get(k);return v==null||v===''||!isFinite(+v)?def:+v;
}
const BM_START=1.03632,BM_DROP=11.1739,BM_LOOP_A=11.1767,BM_LOOP_B=131.1383,BM_BAR=1.6896,BM_BOSS_DB=-3.3,BM_END=140,
 BM_AHEAD=bmCfg('bmahead',.10),BM_LAT=bmCfg('bmlat',.03),
 // MU2b-2: recorrecoes durante o lead-in (restante em s). Nunca seek com r<1,2 s.
 BM_CHK=[6,3.5,1.8];
// st: bi(ocioso) -> lead(contagem) -> loop(luta) -> saida(espera o compasso) -> outro -> bi
const BM={st:'bi',EA:null,EB:null,A:null,B:null,envA:0,envB:0,eA0:0,eB0:0,eA1:0,eB1:0,et0:0,ed:0,swapP:0,
 rem:0,remAt:0,started:0,played:0,corr:0,dropDone:0,dropPerf:0,ev7Perf:0,posEv7:-1,seen:0,fail:0,
 out0:0,outStarted:0,backAt:0,ci:0,vies:.03,correcoes:[],seekPend:0,seekSet:0};
function bmBoss(){return !!(typeof snap!=='undefined'&&snap&&snap.Z&&snap.Z.some(z=>z[2]==3))}
function bmInit(){
 if(BM.EA)return 1;
 try{
  const mk=()=>{const a=new Audio();a.preload='auto';a.volume=0;a.src='music/boss_cut.mp3';
   a.addEventListener('playing',()=>{if(a===BM.A)BM.played=1});
   // B6c: qualquer erro do elemento do boss desliga a musica do boss e DEVOLVE a playlist (nao deixa abafada)
   a.addEventListener('error',()=>{bmFail()});
   a.addEventListener('seeked',()=>{if(a===BM.A&&BM.seekPend){const v=BM.seekSet-a.currentTime;BM.vies=Math.max(-.2,Math.min(.2,v));BM.seekPend=0}});
   a.addEventListener('stalled',()=>{});
   return a};
  BM.EA=mk();BM.EB=mk();
 }catch(e){bmFail();return 0}
 return 1;
}
function bmVol(e){return Math.min(1,Math.max(0,Math.pow(10,BM_BOSS_DB/20)*AU.mv*1.2*(e._env||0)))}
function bmPlay(e){if(!e)return;try{const p=e.play();if(p&&p.catch)p.catch(()=>{if(e===BM.A)bmFail()})}catch(x){if(e===BM.A)bmFail()}}
function bmSeek(e,t){try{if(e&&e.readyState>=1)e.currentTime=Math.max(0,t)}catch(x){}}
// B6c: falha do audio do boss em QUALQUER estado (404, play() rejeitado): marca fail, para o boss e devolve a
// playlist (fade-in). O tremor do drop passa a vir so do evento 7 (handleEv), como antes da MU2.
function bmFail(){
 if(BM.fail)return;BM.fail=1;
 for(const e of[BM.EA,BM.EB])if(e){try{e.pause()}catch(x){}e._env=0}
 BM.A=BM.B=null;BM.envA=BM.envB=0;BM.ed=0;BM.swapP=0;BM.played=0;BM.started=0;BM.outStarted=0;BM.backAt=0;BM.st='bi';
 musDuckPlaylist(1,1500);
}
function bmEnv(a,b,ms,now){BM.eA0=BM.envA;BM.eB0=BM.envB;BM.eA1=a;BM.eB1=b;BM.et0=now;BM.ed=Math.max(1,ms|0)}
function bmSwap(){const e=BM.A;BM.A=BM.B;BM.B=e;const v=BM.envA;BM.envA=BM.envB;BM.envB=v;if(BM.B){try{BM.B.pause()}catch(x){}BM.B._env=0}}
function bmHalt(){for(const e of[BM.EA,BM.EB])if(e){try{e.pause()}catch(x){}e._env=0}
 BM.A=BM.B=null;BM.envA=BM.envB=0;BM.ed=0;BM.swapP=0;BM.played=0;BM.started=0;BM.dropDone=0;BM.outStarted=0;BM.backAt=0}
function bmApply(now){
 if(BM.ed>0){const u=Math.min(1,(now-BM.et0)/BM.ed);BM.envA=BM.eA0+(BM.eA1-BM.eA0)*u;BM.envB=BM.eB0+(BM.eB1-BM.eB0)*u;if(u>=1)BM.ed=0}
 if(BM.A){BM.A._env=BM.envA;BM.A.volume=bmVol(BM.A)}
 if(BM.B){BM.B._env=BM.envB;BM.B.volume=bmVol(BM.B)}
}
function bmLead(now){
 BM.st='lead';BM.seen=0;BM.played=0;BM.started=0;BM.corr=0;BM.dropDone=0;BM.swapP=0;BM.backAt=0;
 BM.ci=0;BM.vies=.03;BM.correcoes=[];BM.seekPend=0;BM.seekSet=0;
 BM.rem=+snap.bp[3]||0;BM.remAt=now;
 BM.A=BM.EA;BM.B=BM.EB;BM.envA=BM.envB=0;BM.ed=0;
 bmSeek(BM.A,BM_START);
 musDuckPlaylist(0,800); // playlist sai em 0,8 s; a sintetica ja esta baixa (MUS duck)
}
function bmLoop(now,fade){
 BM.st='loop';BM.dropDone=1;BM.swapP=0;BM.seen=bmBoss()?1:0;BM.backAt=0;
 BM.A=BM.EA;BM.B=BM.EB;BM.envA=0;BM.envB=0;BM.ed=0;BM.played=1;
 bmSeek(BM.A,BM_LOOP_A);bmPlay(BM.A);bmEnv(1,0,fade||1000,now);
 musDuckPlaylist(0,800);
}
function musDrop(){
 if(BM.dropDone)return;BM.dropDone=1;BM.dropPerf=performance.now();BM.st='loop';BM.seen=1;QK=Math.max(QK,1.6);
 const a=BM.A;
 // veio do evento 7 com o audio ainda parado (falha/latencia de partida): comeca o loop agora, sem drop audivel
 if(a&&!BM.fail&&!BM.played){BM.swapP=0;bmSeek(a,BM_LOOP_A);bmPlay(a);bmEnv(1,0,600,BM.dropPerf)}
}
function bmEv7(){
 BM.ev7Perf=performance.now();BM.posEv7=BM.A?BM.A.currentTime:-1;
 // MU2b-3: o drop tambem dispara pelo evento 7 (fonte de verdade do nascimento do boss); o audio so antecipa
 if(!BM.fail&&BM.st=='lead'&&!BM.dropDone)musDrop();
}
function bmFrame(){
 const now=performance.now();
 const inM=typeof snap!=='undefined'&&snap&&snap.ph==1;
 if(!inM){
  if(BM.st!='bi'){
   if(!BM.out0){BM.out0=now;BM.eA0=BM.envA;BM.eB0=BM.envB}
   const u=Math.min(1,(now-BM.out0)/1000);
   BM.ed=0;BM.envA=BM.eA0*(1-u);BM.envB=BM.eB0*(1-u);
   if(u>=1){bmHalt();BM.st='bi'}
  }
  if(MUS.dm<1&&!MUS.dmd)musDuckPlaylist(1,1500);
  bmApply(now);return;
 }
 BM.out0=0;
 if(!BM.EA&&!bmInit())return;
 if(BM.fail){if(BM.st!='bi'||MUS.dm<1)bmFail();bmApply(now);return}
 if(BM.st=='bi'){
  if(snap.bp)bmLead(now);
  else if(bmBoss())bmLoop(now,1000); // entrou no meio da luta: direto no loop, sem drop
 }
 if(BM.st=='lead'){
  const r=BM.rem-(now-BM.remAt)/1000,a=BM.A,tg=()=>BM_DROP-r+BM_AHEAD;
  if(a&&!BM.fail){
   if(!BM.started&&a.readyState>=1){bmSeek(a,Math.max(BM_START,Math.min(BM_LOOP_B-.5,tg())));bmPlay(a);BM.started=1;bmEnv(1,0,40,now)}
   else if(BM.started&&!BM.played&&a.readyState>=1&&a.paused)bmPlay(a);
   // MU2b-2: recorrecao em r~6/3,5/1,8 s (nunca com r<1,2 s). vies = latencia de seek aprendida (posicao pedida - real)
   if(BM.played&&!BM.dropDone&&r>1.2&&BM.ci<BM_CHK.length&&r<=BM_CHK[BM.ci]){
    const P=tg(),d=a.currentTime-P;
    BM.correcoes.push({r:+r.toFixed(3),d:+d.toFixed(3),vies:+BM.vies.toFixed(3)});
    if(Math.abs(d)>0.04){const set=Math.max(BM_START,Math.min(BM_LOOP_B-.5,P+BM.vies));BM.seekPend=1;BM.seekSet=set;bmSeek(a,set)}
    do{BM.ci++}while(BM.ci<BM_CHK.length&&r<=BM_CHK[BM.ci]);
   }
   if(BM.played&&!BM.corr){const dr=a.currentTime-tg();if(Math.abs(dr)>0.05&&r>1.5){bmSeek(a,a.currentTime-dr);BM.corr=1}else if(r<=1.5)BM.corr=1}
   if(BM.played&&!BM.dropDone&&a.currentTime>=BM_DROP+BM_LAT)musDrop();
  }
 }
 if(BM.st=='loop'){
  const a=BM.A,b=BM.B;if(a){
   if(!BM.seen&&bmBoss())BM.seen=1;
   if(BM.seen&&!bmBoss()){const ct=a.currentTime;BM.st='saida';BM.backAt=0;
    let k=Math.ceil((ct-BM_LOOP_A)/BM_BAR);if(k<1)k=1;BM.tg=Math.min(BM_LOOP_B,BM_LOOP_A+k*BM_BAR)}
   else{const ct=a.currentTime;
    if(BM.swapP&&BM.ed==0){BM.swapP=0;bmSwap()}
    else if(!BM.swapP&&ct>=BM_LOOP_B-.06&&b){bmSeek(b,BM_LOOP_A-(BM_LOOP_B-ct));bmEnv(0,1,60,now);BM.swapP=1;bmPlay(b)}}
  }
 }
 if(BM.st=='saida'){
  const a=BM.A,b=BM.B;
  if(a&&b){const ct=a.currentTime,tg=BM.tg||0;
   if(ct>=tg-1e-3||ct>=BM_LOOP_B-.06){
    bmSeek(b,BM_LOOP_B);bmEnv(0,1,60,now);BM.swapP=1;bmPlay(b);
    BM.st='outro';BM.outStarted=now;BM.backAt=now+3000}}
 }
 if(BM.st=='outro'){
  if(BM.swapP&&BM.ed==0){BM.swapP=0;bmSwap()}
  if(BM.backAt&&now>=BM.backAt){musDuckPlaylist(1,4000);BM.backAt=0}
  if(BM.A&&BM.A.currentTime>=BM_END){bmHalt();BM.st='bi'}
 }
 bmApply(now);
}
try{Object.defineProperty(window,'__mus',{configurable:true,get:()=>{
 const A=MUS.A,a=A&&A.a;
 return {estado:MUS.st,faixa:A?MUS_T[A.idx].n:null,ordem:MUS.order.slice(),vol:a?a.volume:0,t:a?a.currentTime:0,dur:a&&isFinite(a.duration)?a.duration:0,sinteticaGain:AU.msyn?AU.msyn.gain.value:null,
  boss:{estado:BM.st,t:BM.A?BM.A.currentTime:0,drop_disparado_perf:BM.dropPerf||null,ev7_perf:BM.ev7Perf||null,pos_no_ev7:BM.posEv7,rem:BM.st=='lead'?Math.max(0,BM.rem-(performance.now()-BM.remAt)/1000):0,
   ahead:BM_AHEAD,lat:BM_LAT,fail:BM.fail,vies:+BM.vies.toFixed(3),correcoes:BM.correcoes.slice()}};
}})}catch(e){}
setInterval(musFrame,120);
