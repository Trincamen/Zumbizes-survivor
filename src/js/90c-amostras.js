// ---------- AMOSTRAS DE SOM (WAV embutidos em base64; decodificados no 1o uso) ----------
const SMP_B64={passo:'@@GLB:assets/sons/passo_3_player.wav@@',t0:'@@GLB:assets/sons/tiro_pistola_3.wav@@',t1:'@@GLB:assets/sons/tiro_shotgun.wav@@',t2:'@@GLB:assets/sons/tiro_rifle.wav@@',t3:'@@GLB:assets/sons/tiro_metralhadora_3.wav@@',t5:'@@GLB:assets/sons/tiro_sniper.wav@@',fogo:'@@GLB:assets/sons/lanca_chamas_loop_limpo.wav@@',bpasso:'@@GLB:assets/sons/sons do boss kraide/monstro_passos.wav@@',bcorre:'@@GLB:assets/sons/sons do boss kraide/monstro_corrida.wav@@',btromba:'@@GLB:assets/sons/sons do boss kraide/monstro_trombada.wav@@',gordo:'@@GLB:assets/sons/zumbi_gordo_explode.wav@@'};
const SMP={};
function smpLoad(){const c=AU.c;if(!c)return;for(const k in SMP_B64){if(SMP[k])continue;SMP[k]={b:null};try{const s=atob(SMP_B64[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const p=c.decodeAudioData(u.buffer,b=>{SMP[k].b=b},()=>{});if(p&&p.catch)p.catch(()=>{})}catch(e){}}}
// toca a amostra k; devolve true se tocou (senão o som sintético assume)
function smp(k,v,pan,rate){const c=AU.c;if(!c||c.state!='running')return false;smpLoad();const o=SMP[k];if(!o||!o.b)return false;const s=c.createBufferSource();s.buffer=o.b;s.playbackRate.value=(rate||1)*(.96+Math.random()*.08);const g=c.createGain();g.gain.value=Math.min(1.5,v);s.connect(g);aOut(g,pan);s.start();return true}
// Lança-chamas: amostra em LAÇO (lanca_chamas_loop_limpo.wav). Cada chamada de tiro mantém o laço vivo; sem chamadas por ~180 ms ele some suavemente.
const FLM={s:null,g:null,t:0,iv:0};
function flameSnd(v,p){const c=AU.c;if(!c||c.state!='running')return;smpLoad();const o=SMP.fogo;if(!o||!o.b)return flameSyn(v,p);
 FLM.t=performance.now();
 if(!FLM.s){const s=c.createBufferSource();s.buffer=o.b;s.loop=true;s.playbackRate.value=1;const g=c.createGain();g.gain.setValueAtTime(.0001,c.currentTime);g.gain.linearRampToValueAtTime(.9,c.currentTime+.06);s.connect(g);g.connect(AU.m);s.start(0,Math.random()*1.2);FLM.s=s;FLM.g=g;
  FLM.iv=setInterval(()=>{if(performance.now()-FLM.t<180)return;clearInterval(FLM.iv);const t=c.currentTime,s=FLM.s,g=FLM.g;FLM.s=null;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(.0001,t+.15);try{s.stop(t+.17)}catch(e){}},60)}
 FLM.g.gain.value=Math.max(.15,Math.min(1,v))*.9}
function flameSyn(v,p){const c=AU.c;if(!c||c.state!='running')return;const t=c.currentTime,d=.26;
 const lay=(ft,f1,f2,q,vol,att)=>{const s=c.createBufferSource();s.buffer=AU.nb;s.playbackRate.value=.9+Math.random()*.2;const f=c.createBiquadFilter(),g=c.createGain();f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(f1,t);f.frequency.linearRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol*v,t+att);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);aOut(g,p);s.start(t,Math.random()*3,d+.05)};
 lay('lowpass',380,800,.7,.55,.04);   // rugido grave do gás queimando
 lay('bandpass',1500,2600,.5,.22,.03); // chiado do jato
 lay('highpass',4500,6500,.4,.07,.02); // brilho
 for(let i=0;i<4;i++){const o=c.createOscillator(),g=c.createGain(),tt=t+Math.random()*d*.8; // estalos de fogo
  o.type='square';o.frequency.setValueAtTime(900+Math.random()*1800,tt);o.frequency.exponentialRampToValueAtTime(120,tt+.02);g.gain.setValueAtTime(.05*v,tt);g.gain.exponentialRampToValueAtTime(.001,tt+.025);o.connect(g);aOut(g,p);o.start(tt);o.stop(tt+.04)}}

// laço mantido por chamadas (como o lança-chamas): enquanto smpHold(key,...) for chamado a cada quadro o som segue; ~200 ms sem chamada = some suave
const LH={};
function smpHold(key,name,v,pan){const c=AU.c;if(!c||c.state!='running')return;smpLoad();const o=SMP[name];if(!o||!o.b)return;let h=LH[key];
 if(!h){const s=c.createBufferSource();s.buffer=o.b;s.loop=true;const g=c.createGain();g.gain.value=0;const pn=c.createStereoPanner?c.createStereoPanner():null;s.connect(g);if(pn){g.connect(pn);pn.connect(AU.m)}else g.connect(AU.m);s.start();
  h=LH[key]={s,g,pn,t:0,v:0};h.iv=setInterval(()=>{if(performance.now()-h.t<200)return;clearInterval(h.iv);delete LH[key];const t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+.15);try{s.stop(t+.17)}catch(e){}},80)}
 h.t=performance.now();h.g.gain.setTargetAtTime(Math.min(1.5,v),c.currentTime,.05);if(h.pn)h.pn.pan.value=Math.max(-1,Math.min(1,pan||0))}
// sons do boss: passos enquanto anda (bs 0) e corrida durante a investida (bs 4); volume/pan pela distância da câmera
function bossSnd(bs,x,y){const d=Math.hypot(x-cx,y-cy),v=Math.max(0,1-d/1300);if(v<.03)return;const pan=(x-cx)/600;
 if(bs==0)smpHold('bpasso','bpasso',v*.9,pan);else if(bs==4)smpHold('bcorre','bcorre',v*1.1,pan)}
