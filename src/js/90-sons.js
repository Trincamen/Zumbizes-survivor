// ---------- SONS (gerados no código, sem arquivos) ----------
const lv=(k,d)=>{const v=LS.get(k);return v==null?d:+v},AU={c:null,vol:lv('vol2',50)/100,mv:lv('mvol2',80)/100,tense:0,px:0,py:0,sd:0,rl:0,th:0,ng:0,nb2:0,dh:0,rk:{},fv:0,fp:0,hp:null,mo:null,sl:null,lv:null,k:null,last:{}};$('vol').value=AU.vol*100;$('mvol').value=AU.mv*100;function setMus(v){AU.mv=v/100;LS.set('mvol2',v);if(AU.mg)AU.mg.gain.value=AU.mv*1.2;if(typeof musFrame=='function')musFrame()}
function setVol(v){AU.vol=v/100;LS.set('vol2',v);if(AU.m)AU.m.gain.value=AU.vol}
const lim=(k,ms)=>{const n=performance.now();if(AU.last[k]&&n-AU.last[k]<ms)return 0;AU.last[k]=n;return 1};
function auInit(){if(AU.c)return;try{const c=new(window.AudioContext||window.webkitAudioContext)();AU.c=c;AU.m=c.createGain();AU.m.gain.value=AU.vol;AU.m.connect(c.destination);const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.nb=b;
 const loop=(ft,fr,g0)=>{const s=c.createBufferSource();s.buffer=b;s.loop=true;const f=c.createBiquadFilter();f.type=ft;f.frequency.value=fr;const g=c.createGain();g.gain.value=g0;s.connect(f);f.connect(g);g.connect(AU.m);s.start();return g};
 AU.wg=loop('bandpass',420,.12);const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=.09;lg.gain.value=.07;lf.connect(lg);lg.connect(AU.wg.gain);lf.start();AU.fg=loop('lowpass',650,0);
 fireTick();musicInit(c);
 setInterval(()=>{if(Math.random()<.4)SND.groan(0,.1,Math.random()*2-1)},9000)}catch(e){}}
addEventListener('pointerdown',e=>{auInit();if(AU.c&&AU.c.state=='suspended')AU.c.resume();if(e.target.tagName=='BUTTON')SND.click()},true);
function aOut(g,pan){const c=AU.c;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan||0));g.connect(p);p.connect(AU.m)}else g.connect(AU.m)}
function nz(d,ft,f1,f2,v,pan,q){const c=AU.c;if(!c||c.state!='running')return;const s=c.createBufferSource();s.buffer=AU.nb;s.playbackRate.value=.8+Math.random()*.4;const f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime;f.type=ft;f.Q.value=q||1;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t+d);g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);aOut(g,pan);s.start(t,Math.random()*1.4,d+.05)}
function tn(f1,f2,d,ty,v,pan,vib,lpf){const c=AU.c;if(!c||c.state!='running')return;const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter(),t=c.currentTime;o.type=ty;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);lp.type='lowpass';lp.frequency.value=lpf||9000;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,v),t+Math.min(.03,d/3));g.gain.exponentialRampToValueAtTime(.001,t+d);
 if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=vib;lg.gain.value=f1*.06;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.05)}
 o.connect(lp);lp.connect(g);aOut(g,pan);o.start(t);o.stop(t+d+.05)}
const SND={
 shot(w,v,p){if(!lim('s'+w,w==3?55:w==4?90:20))return;
  if(w==0){nz(.14,'bandpass',2600,500,.55*v,p,.8);tn(190,60,.1,'square',.12*v,p)}
  else if(w==1){nz(.4,'lowpass',3500,180,.95*v,p);tn(110,35,.28,'sawtooth',.32*v,p)}
  else if(w==2){nz(.2,'bandpass',3200,400,.6*v,p,.7);tn(210,50,.12,'square',.14*v,p)}
  else if(w==3)nz(.08,'bandpass',2300,600,.38*v,p,.9);
  else if(w==4)nz(.22,'bandpass',500,1500,.3*v,p,.6);
  else{nz(.8,'lowpass',5200,140,v,p);tn(95,28,.55,'sawtooth',.4*v,p)}},
 rlS(){nz(.05,'highpass',3000,3000,.4,0);tn(900,500,.06,'square',.1,0)},
 rlE(){nz(.07,'bandpass',1800,800,.55,0,1);tn(420,180,.09,'square',.16,0)},
 step(){nz(.08,'lowpass',520,140,.22,0)},
 groan(k,v,p){if(!lim('g',120))return;const b=[100,150,58][k]||100,d=.6+Math.random()*.6,f=b*(.85+Math.random()*.3);tn(f*1.1,f*.7,d,'sawtooth',.2*v,p,5+Math.random()*3,k==2?300:700);nz(d*.8,'lowpass',500,200,.06*v,p)},
 roar(v,p){tn(62,34,1.6,'sawtooth',.55*v,p,7,500);tn(125,60,1.4,'square',.2*v,p,9,600);nz(1.4,'lowpass',900,120,.35*v,p)},
 dash(v,p){nz(.9,'bandpass',300,1800,.5*v,p,.7);tn(70,38,.9,'sawtooth',.3*v,p,0,300)},
 rock(v,p){tn(130,28,.7,'sine',.9*v,p);nz(.55,'lowpass',1300,90,.8*v,p)},
 hurt(){tn(230,90,.22,'sawtooth',.3,0,0,900);nz(.12,'lowpass',900,300,.4,0)},
 coin(){tn(1250,1250,.09,'square',.1,0);setTimeout(()=>tn(1700,1700,.14,'square',.1,0),80)},
 pick(){tn(500,900,.12,'triangle',.22,0)},
 lvl(){[0,1,2].forEach(i=>setTimeout(()=>tn(500+i*180,520+i*180,.18,'triangle',.25,0),i*110))},
 kill(){nz(.12,'lowpass',800,200,.3,0);tn(150,50,.1,'sine',.2,0)},
 click(){tn(750,520,.04,'square',.07,0)},
 car(v,p){nz(.5,'bandpass',900,200,.8*v,p,.8);tn(140,40,.4,'square',.3*v,p);nz(.3,'highpass',3000,2000,.3*v,p)},
 tree(v,p){nz(.3,'highpass',1500,700,.5*v,p);tn(300,90,.18,'sawtooth',.2*v,p)},
 crate(v,p){nz(.25,'bandpass',800,300,.5*v,p)},
 bump(v,p){tn(70,22,.9,'sine',v,p);nz(.7,'lowpass',900,80,.9*v,p);[0,1,2].forEach(i=>setTimeout(()=>tn(1800+i*200,1800+i*200,.25,'sine',.1*v,0),500+i*220))},
 grab(v,p){tn(85,50,.55,'sawtooth',.4*v,p,6,400);nz(.4,'bandpass',500,250,.25*v,p)},
 throwW(v,p){nz(.55,'bandpass',300,1500,.45*v,p,.7);tn(120,60,.4,'sawtooth',.25*v,p,0,400)},
 perfect(v){tn(1500,1500,.14,'sine',.25*v,0);setTimeout(()=>tn(2100,2100,.22,'sine',.25*v,0),90);nz(.08,'bandpass',1800,800,.4*v,0,1)},
 fail(v){tn(150,70,.3,'sawtooth',.3*v,0,0,500)},
 banner(t){if(t==1){tn(420,720,.5,'sawtooth',.22,0,0,1100);setTimeout(()=>tn(420,720,.5,'sawtooth',.22,0,0,1100),600);setTimeout(()=>tn(420,720,.5,'sawtooth',.22,0,0,1100),1200)}else if(t==2){tn(1500,1500,.5,'sine',.3,0);setTimeout(()=>tn(2000,2000,.6,'sine',.25,0),160)}else tn(180,180,.4,'sawtooth',.18,0,0,500)}};
function fireTick(){if(AU.fv>.08){const n=Math.random()<.25?2:1;for(let i=0;i<n;i++)setTimeout(()=>nz(.025+Math.random()*.05,'bandpass',1800+Math.random()*2600,900,.07*AU.fv*(.5+Math.random()),AU.fp,2),i*55+Math.random()*40)}setTimeout(fireTick,240+Math.random()*900)}
function musicInit(c){AU.mg=c.createGain();AU.mg.gain.value=AU.mv*1.2;AU.msyn=c.createGain();AU.msyn.gain.value=1;AU.mg.connect(AU.msyn);AU.msyn.connect(c.destination);
 const dl=c.createDelay(1),fb=c.createGain(),lp=c.createBiquadFilter();dl.delayTime.value=.43;fb.gain.value=.5;lp.type='lowpass';lp.frequency.value=1500;AU.rv=c.createGain();AU.rv.gain.value=.7;AU.rv.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(AU.mg);
 const CH=[[110,130.8,164.8],[87.3,110,130.8,174.6],[73.4,87.3,110,146.8],[82.4,98,123.5],[98,123.5,146.8]],NX=[[1,2,0,3],[2,0,3],[0,3,4],[0,1,2],[0,1]],SCL=[220,261.6,293.7,329.6,392,440,164.8];let ci=0;
 const chord=()=>{if(Math.random()<.15)return;const a=NX[ci];ci=a[Math.random()*a.length|0];const dur=13;for(const f of CH[ci]){const o=c.createOscillator(),o2=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime;o.type='sawtooth';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2.003;fl.type='lowpass';fl.frequency.setValueAtTime(300,t);fl.frequency.linearRampToValueAtTime(700,t+6);fl.frequency.linearRampToValueAtTime(300,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+4);g.gain.linearRampToValueAtTime(.05,t+dur-5);g.gain.linearRampToValueAtTime(0,t+dur+2);o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(AU.mg);g.connect(AU.rv);o.start(t);o2.start(t);o.stop(t+dur+3);o2.stop(t+dur+3)}};
 const note=()=>{if(Math.random()<.45)return;const f=SCL[Math.random()*SCL.length|0],t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.1,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+3.2);o.connect(g);g.connect(AU.mg);g.connect(AU.rv);o.start(t);o.stop(t+3.3)};
 chord();setInterval(chord,12000);setInterval(note,3200);setInterval(()=>{if(AU.tense)tn(52,38,.35,'sine',.25,0)},900)}
let HLV=null,HLT=0;
function ftext(x,y,txt,col,sz){FT.push({x,y,t:Date.now(),txt,col,sz:sz||16})}
function drawFT(){const now=Date.now();FT=FT.filter(f=>now-f.t<1100);X.textAlign='center';X.textBaseline='middle';for(const f of FT){const u=(now-f.t)/1100;X.globalAlpha=1-u*u;X.font='bold '+f.sz+'px sans-serif';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.8)';X.strokeText(f.txt,f.x,f.y-u*28);X.fillStyle=f.col;X.fillText(f.txt,f.x,f.y-u*28)}X.globalAlpha=1}
function hitFx(f){if(f[7])pts(4,f[2],f[3],'#b01818',160,200,5,.5);else{pts(3,f[2],f[3],'#cfcfcf',110,120,4,.45);if(lim('m'+f[6],380))ftext(f[2],f[3]-30,'ERROU','#bfc4cc',11)}}
function reloadPill(x,y,rlf,t,zs,ze,fail,own){const sc=MOB?1.3:1,p=1-rlf/100,w=124*sc,h=20*sc,px=x-w/2,py=y-114-(sc-1)*12,inZ=!fail&&p*100>=zs&&p*100<=ze;if(own)PILL={x:px,y:py,w,h,t:Date.now()};
 rr(px,py,w,h,9);X.fillStyle='rgba(0,0,0,.78)';X.fill();X.save();rr(px,py,w,h,9);X.clip();
 const g=X.createLinearGradient(px,py,px,py+h);g.addColorStop(0,fail?'#8a2a2a':'#ffe27a');g.addColorStop(1,fail?'#4a1010':'#b8780c');X.globalAlpha=.55;X.fillStyle=g;X.fillRect(px,py,w*p,h);X.globalAlpha=1;
 if(!fail){const zx=px+w*zs/100,zw=w*(ze-zs)/100;X.fillStyle='#3a9bff';X.fillRect(zx,py,zw,h);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(zx,py,zw,h*.4);X.fillStyle=inZ?'#fff':'#9fd2ff';X.fillRect(zx,py,2,h);X.fillRect(zx+zw-2,py,2,h)}
 const cxp=px+w*p;X.fillStyle='#fff';X.fillRect(cxp-1.5,py-1,3,h+2);X.restore();
 rr(px,py,w,h,9);X.strokeStyle=inZ?'#fff':fail?'#ff6a6a':'#ffe27a';X.lineWidth=inZ?2.5:1.5;X.stroke();
 X.font='bold '+10*sc+'px sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.85)';const tx=fail?'FALHOU':inZ&&MOB?'TOQUE!':'RECARREGANDO';X.strokeText(tx,x,py+h/2+1);X.fillStyle='#fff';X.fillText(tx,x,py+h/2+1);
 X.fillStyle='#fff';X.beginPath();X.moveTo(cxp-4,py-6);X.lineTo(cxp+4,py-6);X.lineTo(cxp,py-1);X.closePath();X.fill();
 if(own&&!fail){X.textAlign='left';X.font='bold 11px sans-serif';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.85)';const hn=MOB?'':'[ R ]';X.strokeText(hn,px+w+6,py+h/2+1);X.fillStyle='#cfe6ff';X.fillText(hn,px+w+6,py+h/2+1)}}
function reloadRing(x,y,rlf){const p=1-rlf/100;X.strokeStyle='rgba(255,210,74,.25)';X.lineWidth=4;X.beginPath();X.ellipse(x,y,26,10,0,0,7);X.stroke();X.strokeStyle='#ffd24a';X.beginPath();X.ellipse(x,y,26,10,0,-1.5708,-1.5708+6.2832*p);X.stroke()}
function reloadPillOld(x,y,rlf,t){const p=1-rlf/100,w=100,h=16,px=x-w/2,py=y-108;rr(px,py,w,h,8);X.fillStyle='rgba(0,0,0,.72)';X.fill();X.save();rr(px,py,w,h,8);X.clip();const g=X.createLinearGradient(px,py,px,py+h);g.addColorStop(0,'#ffe27a');g.addColorStop(1,'#d08a10');X.fillStyle=g;X.fillRect(px,py,w*p,h);X.restore();rr(px,py,w,h,8);X.strokeStyle='#ffe27a';X.lineWidth=1.5;X.stroke();
 X.font='bold 10px sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.8)';X.strokeText('RECARREGANDO',x,py+h/2+1);X.fillStyle='#fff';X.globalAlpha=.75+.25*Math.sin(t/90);X.fillText('RECARREGANDO',x,py+h/2+1);X.globalAlpha=1}
function rr(x,y,w,h,r){X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function pbar(x,y,w,h,f,c1,c2,label,pu){f=Math.max(0,Math.min(1,f));rr(x,y,w,h,2);X.fillStyle='rgba(10,10,12,.85)';X.fill();
 if(f>0){const g=X.createLinearGradient(x,y,x,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);const fw=Math.max(h,w*f);X.save();rr(x,y,w,h,2);X.clip();X.fillStyle=g;X.fillRect(x,y,fw,h);X.fillStyle='rgba(255,255,255,'+(pu!=null?.12+.5*pu:.28)+')';X.fillRect(x,y,fw,h*.45);X.restore()}
 rr(x,y,w,h,2);X.strokeStyle='#3a3226';X.lineWidth=1.5;X.stroke();
 if(label){X.font='bold '+Math.round(h*.72)+'px sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.75)';X.strokeText(label,x+w/2,y+h/2+1);X.fillStyle='#e8e2d0';X.fillText(label,x+w/2,y+h/2+1)}}
function badge(cx0,cy0,r,lv,t,pulse){if(pulse){X.globalAlpha=.35+.3*Math.sin(t/110);X.fillStyle='#c9a54a';X.beginPath();X.arc(cx0,cy0,r+9,0,7);X.fill();X.globalAlpha=1}
 const g=X.createLinearGradient(cx0,cy0-r,cx0,cy0+r);g.addColorStop(0,'#171310');g.addColorStop(.55,'#0a0a0c');g.addColorStop(1,'#141110');X.fillStyle=g;X.beginPath();X.arc(cx0,cy0,r,0,7);X.fill();
 X.strokeStyle='#8a6f35';X.lineWidth=3;X.beginPath();X.arc(cx0,cy0,r-1.5,0,7);X.stroke();
 X.strokeStyle='rgba(216,210,192,.6)';X.lineWidth=1;X.beginPath();X.arc(cx0,cy0,r-6,0,7);X.stroke();
 X.textAlign='center';X.textBaseline='middle';X.font='bold 9px sans-serif';X.fillStyle='#d8d2c0';X.fillText('NÍVEL',cx0,cy0-r*.5);
 X.font='bold '+Math.round(r*(lv>=100?.62:lv>=10?.82:1))+'px sans-serif';X.lineWidth=4;X.strokeStyle='#000';X.strokeText(lv,cx0,cy0+r*.14);X.fillStyle='#e8e2d0';X.fillText(lv,cx0,cy0+r*.14)}
function sfxShot(f){const d=Math.hypot(f[0]-cx,f[1]-cy),v=Math.max(0,1-d/1000);if(v>.05)SND.shot(f[4],v,(f[0]-cx)/600)}
function audioFrame(s,t,mr){if(typeof musFrame=='function')musFrame();if(!AU.c||AU.c.state!='running')return;
 if(FR%8==0){let md=1e9,fx=0;for(const f of FIRES){if(f[4]&&f[4]===meB)continue;if(f[5]&&DD[f[5].i])continue;const d=Math.hypot(f[0]-cx,f[1]-cy);if(d<md){md=d;fx=f[0]}}AU.fv=Math.max(0,1-md/600);AU.fp=(fx-cx)/500;AU.fg.gain.setTargetAtTime(AU.fv*.09,AU.c.currentTime,.2)}
 if(s.bp&&lim('bpr',900)){const d=Math.hypot(s.bp[0]-cx,s.bp[1]-cy);tn(58,40,.9,'sine',.35*Math.max(.25,1-d/2500),(s.bp[0]-cx)/800)}
 if(me){if(!me[7]&&mr){const d=Math.hypot(mr.x-AU.px,mr.y-AU.py);AU.px=mr.x;AU.py=mr.y;if(d<40){AU.sd+=d;if(AU.sd>(me[21]>0?36:48)){AU.sd=0;SND.step()}}}
  const rl=me[22];if(AU.rl==0&&rl>0)SND.rlS();if(AU.rl>0&&rl==0)SND.rlE();AU.rl=rl;
  if(AU.hp!=null&&me[5]<AU.hp-1&&t-AU.th>250){AU.th=t;SND.hurt()}AU.hp=me[5];
  if(AU.mo!=null&&me[19]>AU.mo)SND.coin();AU.mo=me[19];if(AU.sl!=null&&me[14].length>AU.sl)SND.pick();AU.sl=me[14].length;
  if(AU.lv!=null&&me[9]>AU.lv)SND.lvl();AU.lv=me[9];if(AU.k!=null&&me[18]>AU.k)SND.kill();AU.k=me[18]}
 if(t>AU.ng&&s.Z.length){AU.ng=t+Math.max(260,1300-s.Z.length*30)*(.6+Math.random()*.8);const z=s.Z[Math.random()*s.Z.length|0],d=Math.hypot(z[0]-cx,z[1]-cy);if(d<800&&z[2]!=3)SND.groan(z[2],(1-d/800)*.9,(z[0]-cx)/500)}
 const bz=s.Z.find(z=>z[2]==3);if(bz){AU.tense=1;const d=Math.hypot(bz[0]-cx,bz[1]-cy);if(t>AU.nb2){AU.nb2=t+4500+Math.random()*3000;SND.roar(Math.max(.15,1-d/1600),(bz[0]-cx)/600)}if(s.Dh.length&&!AU.dh)SND.dash(Math.max(.2,1-d/1500),(bz[0]-cx)/600);AU.dh=s.Dh.length}else{AU.dh=0;AU.tense=0}
 const cur={};for(const[x,y,pg]of s.K){const k=x+','+y;cur[k]=1;if(pg>=1&&!AU.rk[k]){AU.rk[k]=1;const d=Math.hypot(x-cx,y-cy);SND.rock(Math.max(.2,1-d/1300),(x-cx)/600)}}for(const k in AU.rk)if(!cur[k])delete AU.rk[k]}
// ---------- cena do menu: entardecer sombrio, floresta, estrada e veículo ----------
// ---------- MENU: noite, neblina, olhos vermelhos, poste de luz e jogador ----------
let MSC={k:'',bg:null,vig:null,fog:null,cone:null,glow:null,core:null,refl:null,eyeS:null,big:null,eyeg:null,pairs:null,dust:null,lamp:null};
const MSQ=()=>Math.min(2,Math.max(1,(ZO||1)*(DPR||1)));
function MSV(w,h){const cv=document.createElement('canvas');cv.width=Math.max(2,Math.round(w));cv.height=Math.max(2,Math.round(h));return cv}
function MSR(i,s){const f=Math.sin(i*s+11.3)*43758.5453;return f-Math.floor(f)}
// sprite de prop (arbusto/cerca) ampliado k vezes, pé em (x,y)
function msPr(ctx,sp,x,y,k,a){if(!sp||!sp.cv)return;ctx.globalAlpha=a==null?1:a;
 try{ctx.drawImage(sp.cv,x-sp.ax*k,y-sp.ay*k,sp.w*k,sp.h*k)}catch(e){}}
// par de olhinhos vermelhos (sprite base 30x14) uma vez
function msEyePair(){
 const ss=4,cv=MSV(30*ss,14*ss),c=cv.getContext('2d');if(!c)return null;
 c.scale(ss,ss);
 for(const px of[9.5,20.5]){
  let g=c.createRadialGradient(px,7,0,px,7,5.2);
  g.addColorStop(0,'rgba(210,26,20,.55)');g.addColorStop(.30,'rgba(170,14,12,.24)');g.addColorStop(1,'rgba(110,8,8,0)');
  c.fillStyle=g;c.beginPath();c.arc(px,7,5.2,0,7);c.fill();
  // risquinho horizontal (olho de longe)
  g=c.createRadialGradient(px,7,0,px,7,4.4);
  g.addColorStop(0,'rgba(255,60,44,.55)');g.addColorStop(.35,'rgba(230,26,20,.22)');g.addColorStop(1,'rgba(160,10,10,0)');
  c.save();c.translate(px,7);c.scale(2.6,1);c.fillStyle=g;c.beginPath();c.arc(0,0,4.4,0,7);c.fill();c.restore();
  g=c.createRadialGradient(px,7,0,px,7,1.9);
  g.addColorStop(0,'rgba(255,244,232,1)');g.addColorStop(.42,'rgba(255,68,48,1)');g.addColorStop(1,'rgba(180,16,12,0)');
  c.fillStyle=g;c.beginPath();c.arc(px,7,1.9,0,7);c.fill()}
 return {cv,w:30,h:14}}
// olho grande: amêndoa vertical, íris vermelha, pupila fendida
function msWarm(r){
 const cv=MSV(r*2,r*2),c=cv.getContext('2d');if(!c)return null;
 const g=c.createRadialGradient(r,r,0,r,r,r);
 g.addColorStop(0,'rgba(255,226,168,.9)');g.addColorStop(.30,'rgba(255,198,120,.38)');g.addColorStop(1,'rgba(255,176,88,0)');
 c.fillStyle=g;c.fillRect(0,0,r*2,r*2);return {cv,r}}
function msCore(r){
 const cv=MSV(r*2,r*2),c=cv.getContext('2d');if(!c)return null;
 const g=c.createRadialGradient(r,r,0,r,r,r);
 g.addColorStop(0,'rgba(255,250,232,1)');g.addColorStop(.42,'rgba(255,226,164,.75)');g.addColorStop(1,'rgba(255,196,110,0)');
 c.fillStyle=g;c.fillRect(0,0,r*2,r*2);return {cv,r}}
// feixe cônico pré-renderizado (baixa resolução ampliada = bordas macias)
function msCone(){
 const L=MSC.lamp;if(!L)return null;
 const x0=W*.50,x1=W*.96,yb=H*1.03,cw=x1-x0,ch=yb-L.y;
 const lo=MSV(cw*.22,ch*.22),c=lo.getContext('2d');if(!c)return null;
 const k=.22;
 c.setTransform(k,0,0,k,0,0);
 const ax=L.x-x0;
 c.beginPath();c.moveTo(ax,0);c.lineTo(W*.895-x0,ch);c.lineTo(W*.565-x0,ch);c.closePath();c.clip();
 let g=c.createLinearGradient(0,0,0,ch);
 g.addColorStop(0,'rgba(255,220,160,.80)');g.addColorStop(.10,'rgba(255,203,132,.50)');g.addColorStop(.40,'rgba(226,168,98,.24)');
 g.addColorStop(.72,'rgba(170,126,72,.11)');g.addColorStop(1,'rgba(120,88,52,0)');
 c.fillStyle=g;c.fillRect(0,0,cw,ch);
 g=c.createRadialGradient(ax,ch*.04,0,ax,ch*.04,ch*.42);
 g.addColorStop(0,'rgba(255,242,204,.50)');g.addColorStop(1,'rgba(255,200,120,0)');
 c.fillStyle=g;c.fillRect(0,0,cw,ch);
 // máscaras: desvanece as laterais e o pé do feixe
 c.globalCompositeOperation='destination-in';
 g=c.createLinearGradient(0,0,cw,0);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.13,'rgba(0,0,0,.55)');g.addColorStop(.34,'rgba(0,0,0,1)');
 g.addColorStop(.70,'rgba(0,0,0,1)');g.addColorStop(.90,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=g;c.fillRect(0,0,cw,ch);
 g=c.createLinearGradient(0,0,0,ch);
 g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(.18,'rgba(0,0,0,1)');g.addColorStop(.78,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=g;c.fillRect(0,0,cw,ch);
 c.globalCompositeOperation='source-over';
 const cv=MSV(cw*MSQ(),ch*MSQ()),c2=cv.getContext('2d');if(!c2)return null;
 c2.imageSmoothingEnabled=true;
 try{c2.filter='blur(3px)'}catch(e){}
 c2.drawImage(lo,0,0,cv.width,cv.height);
 try{c2.filter='none'}catch(e){}
 return {cv,x:x0,y:L.y,w:cw,h:ch}}
// reflexo alaranjado no asfalto molhado
function msRefl(){
 const w=W*.10,h=H*.13,cv=MSV(w*2,h*2),c=cv.getContext('2d');if(!c)return null;
 c.scale(2,2);c.translate(w/2,h/2);c.scale(1,h/w*.6);
 const g=c.createRadialGradient(0,0,0,0,0,w*.5);
 g.addColorStop(0,'rgba(255,190,110,.55)');g.addColorStop(.45,'rgba(220,140,70,.22)');g.addColorStop(1,'rgba(160,90,40,0)');
 c.fillStyle=g;c.beginPath();c.arc(0,0,w*.5,0,7);c.fill();return {cv,w,h}}
// poeira flutuando dentro do cone
function msDust(){
 const A=[],L=MSC.lamp;if(!L)return A;
 for(let i=0;i<44;i++){const v=MSR(i,7.13),v2=MSR(i,23.7),v3=MSR(i,57.1);
  A.push({t:.08+.90*v,u:(v2*2-1)*.9,s:.7+1.6*v3,sp:2.2+6*v3,ph:v2*6.28,y:H*.9})}
 return A}
function msFog(){
 const cv=MSV(W*.75,64),c=cv.getContext('2d');if(!c)return null;
 const g=c.createLinearGradient(0,0,0,64);
 g.addColorStop(0,'rgba(120,96,74,0)');g.addColorStop(.45,'rgba(130,102,78,1)');g.addColorStop(1,'rgba(104,82,62,0)');
 c.fillStyle=g;c.fillRect(0,0,cv.width,64);
 c.globalCompositeOperation='destination-in';const m=c.createLinearGradient(0,0,cv.width,0);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.18,'rgba(0,0,0,1)');m.addColorStop(.82,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=m;c.fillRect(0,0,cv.width,64);c.globalCompositeOperation='source-over';return cv}
function msBuild(){
 const q=MSQ(),cv=MSV(W*q,H*q),c=cv.getContext('2d');if(!c)return;
 c.setTransform(q,0,0,q,0,0);
 const hz=H*.845,vx=W*.545,PLX=W*.795,PLY=H*.885;
 // ---- céu/ar quase preto
 c.fillStyle='#060304';c.fillRect(0,0,W,H);
 let g=c.createLinearGradient(0,0,0,H);
 g.addColorStop(0,'#050304');g.addColorStop(.55,'#080505');g.addColorStop(.84,'#120e0a');g.addColorStop(1,'#0a0807');
 c.fillStyle=g;c.fillRect(0,0,W,H);
 // ---- poste (modelo do jogo, ampliado) ----
 let pole=null,S=H*.1056;
 try{
  const g8=cenLoad(CENGLB[8],nm=>/^lamp_glow$/.test(nm));
  pole=cenMake(g8,H*.66,'y',-Math.PI/2,2);
  if(pole&&pole.S)S=pole.S;
 }catch(e){pole=null}
 MSC.lamp={x:PLX-1.2*S,y:PLY-6.15*S,s:S,sp:pole};
 // ---- rua em perspectiva ----
 c.beginPath();c.moveTo(vx-W*.012,hz);c.lineTo(vx+W*.026,hz);c.lineTo(W*1.06,H*1.02);c.lineTo(-W*.06,H*1.02);c.closePath();
 g=c.createLinearGradient(0,hz,0,H);
 g.addColorStop(0,'#141110');g.addColorStop(.32,'#1b1614');g.addColorStop(.7,'#14100f');g.addColorStop(1,'#0d0b0a');
 c.fillStyle=g;c.fill();
 // calçada de terra à direita
 c.beginPath();c.moveTo(vx+W*.024,hz);c.lineTo(W*1.06,hz);c.lineTo(W*1.06,H*1.02);c.lineTo(W*.58,H*1.02);c.closePath();
 c.fillStyle='#141009';c.fill();
 // poça/umidade refletindo o poste
 g=c.createLinearGradient(0,hz,0,H);
 g.addColorStop(0,'rgba(60,48,38,0)');g.addColorStop(1,'rgba(72,56,42,.35)');
 c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
 // faixa central tracejada
 for(let i=0;i<11;i++){
  const t0=i/11,t1=t0+.05,py=t=>hz+(H*1.04-hz)*Math.pow(t,1.85),px=t=>vx+(W*.53-vx)*Math.pow(t,1.45),pw=t=>W*(.0012+.011*Math.pow(t,1.5));
  const y0=py(t0),y1=py(t1),x0=px(t0),x1=px(t1),w0=pw(t0),w1=pw(t1);
  c.fillStyle='rgba(198,190,172,'+(.26-.14*t0).toFixed(3)+')';
  c.beginPath();c.moveTo(x0-w0,y0);c.lineTo(x0+w0,y0);c.lineTo(x1+w1,y1);c.lineTo(x1-w1,y1);c.closePath();c.fill()}
 c.globalAlpha=1;
 // cerca/guarda-corpo de madeira
 const fe=CEN_SPR[26],fw=(fe&&fe.w)||90;
 for(let i=0;i<7;i++){const fx=W*(.545+.052*i),fy=H*(.862+.005*i);
  c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(fx,fy+1,W*.032,H*.006,0,0,7);c.fill();
  msPr(c,fe,fx,fy,W*.046/fw,.85)}
 c.globalAlpha=1;
 // clarão do poste no asfalto (asfalto molhado)
 g=c.createLinearGradient(0,hz,0,H*1.0);
 g.addColorStop(0,'rgba(120,96,66,0)');g.addColorStop(.45,'rgba(132,104,70,.16)');g.addColorStop(1,'rgba(96,74,50,0)');
 c.fillStyle=g;c.beginPath();c.moveTo(W*.60,hz);c.lineTo(W*.86,hz);c.lineTo(W*.97,H);c.lineTo(W*.52,H);c.closePath();c.fill();
 // ---- poste: escurece e adiciona borda quente do lado da lâmpada ----
 if(pole){
  const pc=document.createElement('canvas');pc.width=Math.round(pole.w*2);pc.height=Math.round(pole.h*2);
  const p2=pc.getContext('2d');
  if(p2){p2.drawImage(pole.cv,0,0,pc.width,pc.height);
   p2.globalCompositeOperation='source-atop';p2.fillStyle='rgba(9,7,6,.42)';p2.fillRect(0,0,pc.width,pc.height);
   const rg2=p2.createLinearGradient(0,0,pc.width,0);
   rg2.addColorStop(0,'rgba(255,196,132,.42)');rg2.addColorStop(.35,'rgba(180,132,82,.10)');rg2.addColorStop(1,'rgba(0,0,0,0)');
   p2.fillStyle=rg2;p2.fillRect(0,0,pc.width,pc.height);
   p2.globalCompositeOperation='source-over';
   c.save();c.beginPath();c.rect(0,PLY-6.15*S,W,H);c.clip(); // sem o trecho do poste acima da lâmpada
   c.drawImage(pc,PLX-pole.ax,PLY-pole.ay,pole.w,pole.h);c.restore()}}
 // ---- halo quente geral em volta da lâmpada (mancha na névoa) ----
 if(MSC.lamp){const L=MSC.lamp;
  g=c.createRadialGradient(L.x,L.y,0,L.x,L.y,H*.55);
  g.addColorStop(0,'rgba(150,110,66,.30)');g.addColorStop(.45,'rgba(96,70,44,.12)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.fillRect(0,0,W,H)}
 // ---- vinheta + degradê sob o menu (camada separada, por cima do dinâmico) ----
 const vg=MSV(W*q,H*q),vc=vg.getContext('2d');
 if(vc){vc.setTransform(q,0,0,q,0,0);
  g=vc.createRadialGradient(W*.56,H*.50,Math.min(W,H)*.18,W*.56,H*.50,Math.max(W,H)*.80);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,'rgba(0,0,0,.46)');g.addColorStop(1,'rgba(0,0,0,.94)');
  vc.fillStyle=g;vc.fillRect(0,0,W,H);
  g=vc.createLinearGradient(0,0,W*.58,0);
  g.addColorStop(0,'rgba(0,0,0,.90)');g.addColorStop(.55,'rgba(0,0,0,.42)');g.addColorStop(1,'rgba(0,0,0,0)');
  vc.fillStyle=g;vc.fillRect(0,0,W*.58,H);
  g=vc.createLinearGradient(0,0,0,H*.18);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(1,'rgba(0,0,0,0)');
  vc.fillStyle=g;vc.fillRect(0,0,W,H*.18);
  g=vc.createLinearGradient(0,H*.86,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.62)');
  vc.fillStyle=g;vc.fillRect(0,H*.86,W,H*.14)}
 MSC.bg=cv;MSC.vig=vg;
 // ---- olhos pequenos (posições fixas por semente) ----
 const A=[];
 for(let i=0;i<40;i++){
  const v=MSR(i,12.9898),v2=MSR(i,78.233),v3=MSR(i,43.77),v4=MSR(i,91.7),v5=MSR(i,31.3);
  const x=W*(.04+.92*v),y=H*(.21+.60*v2);
  const d=Math.hypot((x-W*.5)/(W*.5),(y-H*.50)/(H*.5)),cen=1-Math.min(1,d);
  let a=(.40+.60*cen)*(.40+.60*v3);
  if(x<W*.34)a*=.38;
  if(x>W*.62&&y>H*.72)a*=.55; // perto do cone, apaga
  A.push({x,y,w:H*(.023+.016*v4),a:Math.max(.10,Math.min(1,a)),pc:2400+7000*v5,ph:v2,os:900+1400*v4,os2:1500+2200*v5})}
 MSC.eyeS=msEyePair();MSC.pairs=A;
 MSC.fog=msFog();MSC.glow=msWarm(H*.16);MSC.core=msCore(H*.035);
 MSC.cone=msCone();MSC.refl=msRefl();MSC.dust=msDust();
}
function menuScene(t){
 const key=W+'x'+H+'x'+Math.round((ZO||1)*(DPR||1)*10);
 if(MSC.k!=key){MSC.k=key;MSC.bg=MSC.vig=MSC.fog=MSC.cone=MSC.glow=MSC.core=MSC.refl=MSC.eyeS=null;MSC.pairs=MSC.dust=null;msBuild()}
 if(MSC.bg)X.drawImage(MSC.bg,0,0,W,H);else{X.fillStyle='#060405';X.fillRect(0,0,W,H)}
 // olhinhos vermelhos na escuridão
 if(MSC.pairs&&MSC.eyeS){const es=MSC.eyeS;
  for(let i=0;i<MSC.pairs.length;i++){const p=MSC.pairs[i],bl=(t/p.pc+p.ph)%1;
   if(bl<.045)continue;
   const a=p.a*(.76+.24*Math.sin(t/p.os+p.ph*6.283));
   const w=p.w,h=w*es.h/es.w,dv=Math.sin(t/p.os2+p.ph*3)*h*.16;
   X.globalAlpha=a;X.drawImage(es.cv,p.x-w/2,p.y-h/2+dv,w,h)}
  X.globalAlpha=1}
 // névoa baixa
 if(MSC.fog)for(let i=0;i<3;i++){const ph=(t/(11000+i*5300)+i*.41)%1;
  X.globalAlpha=.40-.10*i;
  X.drawImage(MSC.fog,(ph*2-1)*W*.30-W*.14,H*(.58+i*.105)+H*.018*Math.sin(t/7000+i*2),W*1.34,H*(.095+i*.032))}
 X.globalAlpha=1;
 // cone de luz + lâmpada + poeira + reflexo
 const L=MSC.lamp;
 if(L){const fl=.93+.045*Math.sin(t/97)+.025*Math.sin(t/41+.7);
  X.globalCompositeOperation='lighter';
  if(MSC.cone){X.globalAlpha=.86*fl;X.drawImage(MSC.cone.cv,MSC.cone.x,MSC.cone.y,MSC.cone.w,MSC.cone.h)}
  if(MSC.glow){const r=MSC.glow.r;X.globalAlpha=.92*fl;X.drawImage(MSC.glow.cv,L.x-r,L.y-r,r*2,r*2)}
  if(MSC.core){const r=MSC.core.r;X.globalAlpha=.95*fl;X.drawImage(MSC.core.cv,L.x-r,L.y-r,r*2,r*2)}
  if(MSC.refl){const rf=MSC.refl;X.globalAlpha=.30*fl;X.drawImage(rf.cv,W*.72-rf.w*.5,H*.905-rf.h*.42,rf.w,rf.h)}
  if(MSC.dust){X.fillStyle='#ffe9c0';
   for(let i=0;i<MSC.dust.length;i++){const p=MSC.dust[i];
    const fy=(p.t+t*p.sp*.00006)%1,ux=p.u*.85+Math.sin(t/5200+p.ph)*.12;
    const px=L.x+(W*.755-L.x)*fy+ux*W*.15*fy,py=L.y+(H*.90-L.y)*fy+Math.sin(t/3100+p.ph*2)*H*.004;
    X.globalAlpha=.16*(1-fy*.45)*(1-Math.abs(ux))*fl;
    X.fillRect(px,py,p.s,p.s)}}
  X.globalCompositeOperation='source-over';X.globalAlpha=1}
 // jogador do jogo em contra-luz, dentro do cone
 const px=W*.723,py=H*.92;
 X.fillStyle='rgba(0,0,0,.45)';
 X.beginPath();X.ellipse(px+W*.018,py+1,W*.026,H*.007,0,0,7);X.fill();
 X.beginPath();X.ellipse(px+W*.050,py+3,W*.050,H*.010,.05,0,7);X.fill();
 try{drawPlayer(px,py,{k:'menu',s:H*.20/46,fa:-2.5,aim:-2.5,c:'#1e2430',gun:'#3a3d44',ring:null,shot:0,dead:false,idle:true,t:t,w:0})}catch(e){}
 // vinheta por cima de tudo
 if(MSC.vig)X.drawImage(MSC.vig,0,0,W,H);
 X.globalAlpha=.025;X.fillStyle='#000';for(let i=0;i<2;i++)X.fillRect((t/7+i*W*.41)%W,(t/11+i*H*.31)%H,W*.22,1);X.globalAlpha=1;
}
// ---------- minimapa 3D: camada estática pré-renderizada uma vez por mapa ----------
let MMCV=null,MMCK='';
function mmBuild(W_,f){
 const S=2,HT=MH*f,cv=document.createElement('canvas');cv.width=Math.ceil(W_*S);cv.height=Math.ceil(HT*S);
 const c=cv.getContext('2d');if(!c)return null;
 c.setTransform(S,0,0,S,0,0);
 const HS=i=>{const v=Math.sin(i*127.1+977.7)*43758.5453;return v-Math.floor(v)};
 // grama com leve gradiente
 const g=c.createLinearGradient(0,0,0,HT);g.addColorStop(0,'#1c3415');g.addColorStop(.5,'#27451c');g.addColorStop(1,'#1d3817');
 c.fillStyle=g;c.fillRect(0,0,W_,HT);
 for(let i=0;i<120;i++){c.fillStyle=i%2?'rgba(255,255,255,.03)':'rgba(0,0,0,.06)';c.fillRect(HS(i)*W_,HS(i+40)*HT,3,2)}
 // rio com brilho
 const rg=c.createLinearGradient(0,RY0*f,0,(RY0+600)*f);rg.addColorStop(0,'#16303f');rg.addColorStop(.5,'#2b5a76');rg.addColorStop(1,'#16303f');
 c.fillStyle=rg;c.fillRect(0,RY0*f,W_,600*f);
 c.strokeStyle='rgba(200,235,255,.18)';c.lineWidth=.7;c.beginPath();
 for(let i=0;i<7;i++){const y=RY0*f+600*f*(i+.5)/7;c.moveTo(0,y);for(let x=0;x<=W_;x+=14)c.lineTo(x,y+Math.sin(x*.6+i)*1.2)}c.stroke();
 // pontes
 for(const bx of[1000,3000]){c.fillStyle='#6a6a70';c.fillRect((bx-80)*f,RY0*f,160*f,600*f);
  c.fillStyle='#8a8a92';c.fillRect((bx-80)*f,RY0*f,2,600*f);c.fillRect((bx+78)*f,RY0*f,2,600*f)}
 // ruas: asfalto escuro + linha central
 const HV=[0,1,2,3,4,5,7,8,9,10,11,12];
 c.fillStyle='#2b2b31';
 for(let k=0;k<=8;k++){c.fillRect((k*500-60)*f,0,120*f,2500*f);c.fillRect((k*500-60)*f,3500*f,120*f,2500*f)}
 for(const k of HV)c.fillRect(0,(k*500-60)*f,W_,120*f);
 c.strokeStyle='rgba(210,190,110,.5)';c.lineWidth=Math.max(.5,1);c.setLineDash([2,3]);c.beginPath();
 for(let k=0;k<=8;k++){c.moveTo(k*500*f,0);c.lineTo(k*500*f,2500*f);c.moveTo(k*500*f,3500*f);c.lineTo(k*500*f,6000*f)}
 for(const k of HV){c.moveTo(0,k*500*f);c.lineTo(W_,k*500*f)}c.stroke();c.setLineDash([]);
 // calçada + grama de cada quarteirão
 for(const j of ROWS)for(let i=0;i<8;i++){const bx=i*500+60,by=j*500+60;
  c.fillStyle='#4b4e40';c.fillRect((bx-10)*f,(by-10)*f,400*f,400*f);
  c.fillStyle=(i+j)%2?'#3b5427':'#345023';c.fillRect(bx*f,by*f,380*f,380*f)}
 // árvores
 for(const o of O){if(o.t!=1)continue;const x=(o.x+12)*f,y=(o.y+12)*f;
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+1,y+1.2,2,1,0,0,7);c.fill();
  c.fillStyle='#2f6b2a';c.beginPath();c.arc(x,y-.8,1.7,0,7);c.fill();
  c.fillStyle='rgba(120,220,120,.35)';c.beginPath();c.arc(x-.5,y-1.5,.8,0,7);c.fill()}
 // prédios extrudados: projeção oblíqua do jogo (SHK=.3), sombra + parede sul + lado + telhado
 for(const b of BLD){const x=b.x*f,y=b.y*f,w=Math.max(1.5,b.w*f),h=Math.max(1.5,b.h*f),H=Math.max(2,b.H*f*.9),sh=H*SHK;
  const T=b.T,cl=T=='h'?['#eef2f4','#a9b6bd','#c6d0d5']:T=='p'?['#8fb0ff','#2c4a86','#4a6cb0']:T=='m'?['#ffc070','#a05f2a','#c98340']:['#8d8d94','#46464c','#63636a'];
  c.fillStyle='rgba(0,0,0,.32)';c.fillRect(x+2.2,y+2.4,w,h);
  c.fillStyle=cl[1];c.beginPath();c.moveTo(x,y+h);c.lineTo(x+w,y+h);c.lineTo(x+w-sh,y+h-H);c.lineTo(x-sh,y+h-H);c.closePath();c.fill();
  c.fillStyle=cl[2];c.beginPath();c.moveTo(x+w,y+h);c.lineTo(x+w,y);c.lineTo(x+w-sh,y-H);c.lineTo(x+w-sh,y+h-H);c.closePath();c.fill();
  c.fillStyle=cl[0];c.fillRect(x-sh,y-H,w,h);
  c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x-sh,y-H,w,Math.max(.6,h*.25));
  c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-sh,y-H+h-Math.max(.6,h*.22),w,Math.max(.6,h*.22));
  c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=.6;c.strokeRect(x-sh,y-H,w,h)}
 return cv;
}
// ---------- profiler de draw (window.__prof=1 liga; desligado custa ~nada) ----------
const PROF={acc:{},n:0};let VIG=null,GLC={},SGG=null,SGGK='';
const pfOn=()=>typeof window!=='undefined'&&!!window.__prof;
function pfStart(){return pfOn()?performance.now():0}
function pfAdd(k,t){if(t)PROF.acc[k]=(PROF.acc[k]||0)+(performance.now()-t)}
function pfEnd(t){if(!pfOn())return;PROF.acc.total=(PROF.acc.total||0)+(performance.now()-t);
 if(++PROF.n>=300){const n=PROF.n,o={},T={},A=PROF.acc;
  for(const k in A){if(k=='total')continue;if(k[0]=='t'||k[0]=='n'){T[k]=+((A[k]||0)/n).toFixed(3);continue}o[k]=+(A[k]/n).toFixed(2)}
  o.total=+((A.total||0)/n).toFixed(2);
  console.log('PROF ms/frame',JSON.stringify(o),JSON.stringify(T));
  if(typeof window!=='undefined')window.__plast={o:o,T:T};
  PROF.n=0;PROF.acc={}}}
// ---------- cache do chão estático (grama+asfalto+ruas+calçadas) em chunks de 1000 px ----------
const GRD={sd:null,map:new Map(),order:[],bmp:new Map(),made:0};
function grdBmpDrop(key){const b=GRD.bmp.get(key);if(b){GRD.bmp.delete(key);try{b.close&&b.close()}catch(e){}}}
function grdChunk(ci,cj){
 const key=ci+','+cj,hit=GRD.map.get(key);if(hit){const oi=GRD.order.indexOf(key);if(oi>=0)GRD.order.splice(oi,1);GRD.order.push(key);return hit}
 const t0=pfStart();
 const cv=document.createElement('canvas');cv.width=1000;cv.height=1000;const g=cv.getContext('2d');
 if(g){g.translate(-ci*1000,-cj*1000);
  try{cenRuaSpr(g,ci*1000,cj*1000,ci*1000+1000,cj*1000+1000);cenBlocks(g,ci*1000,cj*1000,ci*1000+1000,cj*1000+1000)}catch(e){}}
 GRD.map.set(key,cv);GRD.order.push(key);GRD.made++;
 if(typeof createImageBitmap=='function'){try{createImageBitmap(cv).then(b=>{if(GRD.map.has(key)){GRD.bmp.set(key,b);cv.width=0;cv.height=0}else if(b.close)b.close()}).catch(()=>{})}catch(e){}}
 pfAdd('chunk',t0);
 while(GRD.order.length>12){const old=GRD.order.shift();if(old!==key){GRD.map.delete(old);grdBmpDrop(old)}}
 return cv}
function groundChunks(){
 if(GRD.sd!==sd){GRD.sd=sd;GRD.map.clear();GRD.order.length=0;for(const k of[...GRD.bmp.keys()])grdBmpDrop(k)}
 const vx0=Math.floor(cx-W/2-80),vx1=Math.ceil(cx+W/2+80),vy0=Math.floor(cy-H/2-80),vy1=Math.ceil(cy+H/2+80);
 const i0=Math.floor(vx0/1000),i1=Math.floor(vx1/1000),j0=Math.floor(vy0/1000),j1=Math.floor(vy1/1000),before=GRD.made;
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
  if(i<0||j<0||i*1000>=MW||j*1000>=MH)continue;
  const cv=grdChunk(i,j),src=GRD.bmp.get(i+','+j)||cv;
  const ax=Math.max(vx0,i*1000),bx=Math.min(vx1,i*1000+1000),ay=Math.max(vy0,j*1000),by=Math.min(vy1,j*1000+1000);
  const ww=bx-ax,hh=by-ay;if(ww<=0||hh<=0)continue;
  X.drawImage(src,ax-i*1000,ay-j*1000,ww,hh,ax,ay,ww,hh)}
 if(GRD.made===before){
  const ci=Math.floor(cx/1000),cj=Math.floor(cy/1000),mx=cx%1000,my=cy%1000;
  const dx=mx<300?-1:mx>700?1:0,dy=my<300?-1:my>700?1:0,tx=ci+dx,ty=cj+dy;
  if((dx||dy)&&!(tx<0||ty<0||tx*1000>=MW||ty*1000>=MH)&&!GRD.map.has(tx+','+ty))grdChunk(tx,ty)}
}
function vigOverlay(){const k=C.width+'|'+C.height+'|'+ZO;if(VIG&&VIG.k===k)return VIG.c;
 const cv=document.createElement('canvas');cv.width=C.width;cv.height=C.height;const g2=cv.getContext('2d');
 g2.setTransform(ZO*DPR,0,0,ZO*DPR,0,0);
 g2.fillStyle='rgba(20,10,50,.2)';g2.fillRect(0,0,W,H);
 const g=g2.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');g2.fillStyle=g;g2.fillRect(0,0,W,H);
 VIG={k:k,c:cv};return cv}
function glowSpr(key,gs,col,blur,x0,y0,w,h,fn){const k=key+'|'+col+'|'+blur+'|'+(gs*100|0);const o=GLC[k];if(o)return o;
 const m=Math.ceil(blur*2)+2,cv=document.createElement('canvas');cv.width=Math.ceil(w*gs)+m*2;cv.height=Math.ceil(h*gs)+m*2;
 const c2=cv.getContext('2d');c2.setTransform(gs,0,0,gs,m-x0*gs,m-y0*gs);c2.fillStyle=col;c2.shadowColor=col;c2.shadowBlur=blur;fn(c2);
 if(Object.keys(GLC).length>16)GLC={};
 return GLC[k]={c:cv,m:m,gs:gs}}
function glowPut(sp,x0,y0){X.drawImage(sp.c,x0-sp.m/sp.gs,y0-sp.m/sp.gs,sp.c.width/sp.gs,sp.c.height/sp.gs)}
// limite de 60 Hz no desenho (acumulador: em monitor de 144 Hz alterna 2/3 refreshes e a média fica em 60; em 60 Hz passa todos)
// opção do jogador (só desenho; a simulação do host roda a 30 Hz independente): limite de FPS (0 = sem limite) e contador na tela
let FPSL=+(LS.get('fpslim')||60);if(!(FPSL>=0&&FPSL<=360))FPSL=60;
let FPS_NF=0,FPS_DT=FPSL?1000/FPSL:0,FPSSHOW=LS.get('fpsshow')=='1',FPS_C=0,FPS_T0=0;
// DRAW_MS = tempo de JS do draw() (CPU). Se o FPS está baixo e DRAW_MS é pequeno, o gargalo é GPU/compositor (não o código do jogo).
let DRAW_MS=0;
function fpsText(f){let s=Math.round(f)+' FPS · '+Math.round(GQ.scale*100)+'% · draw '+DRAW_MS.toFixed(1)+' ms';if(host&&STEP_MS>0)s+=' · sim '+STEP_MS.toFixed(1)+' ms (máx '+STEP_MAX.toFixed(1)+')';
 if(glLive)s+='\n'+(GL_SOFT?'⚠ WebGL por SOFTWARE (sem GPU) · ':'')+String(GL_GPU||'').slice(0,40);return s}
function fpsUi(){for(const e of document.querySelectorAll('.fpsl'))e.value=String(FPSL);for(const e of document.querySelectorAll('.fpss'))e.checked=FPSSHOW;const b=$('fpsb');if(b)b.style.display=FPSSHOW?'block':'none'}
function setFpsLim(v){FPSL=+v||0;FPS_DT=FPSL?1000/FPSL:0;FPS_NF=0;LS.set('fpslim',String(FPSL));fpsUi()}
function setFpsShow(c){FPSSHOW=!!c;FPS_C=0;FPS_T0=0;LS.set('fpsshow',c?'1':'0');fpsUi()}
// O1-2: qualidade gráfica — passo fixo (Alta/Média/Baixa) ou Auto (adaptativo medido em draw())
const GQA={chg:0,ema:0,slow:0,fast:0,last:0};
function gfxUi(){for(const e of document.querySelectorAll('.gfx'))e.value=GFX}
function gfxApply(){GQA.chg=performance.now();GQA.ema=0;GQA.slow=0;GQA.fast=0;rs();if(glLive&&GLR)GLR.setPixelRatio(Math.min(window.devicePixelRatio||1,2)*GQ.scale)}
function setGfx(v){GFX=(v=='auto'||GQS.indexOf(+v)<0)?'auto':v;LS.set('gfx',GFX);GQ.scale=GFX=='auto'?GQS[0]:+GFX;gfxApply();gfxUi()}
function gfxMove(d){const i=GQS.indexOf(GQ.scale),j=Math.max(0,Math.min(GQS.length-1,(i<0?0:i)+d));if(GQS[j]===GQ.scale)return;GQ.scale=GQS[j];gfxApply()}
// Auto: EMA do intervalo entre quadros ACEITOS; >1,25x o alvo por 2 s desce 1 passo; <=1,15x por 10 s sobe 1; >=5 s entre mudanças
function gfxTick(n){
 if(GFX!='auto')return;
 if(!GQA.last){GQA.last=n;return}
 const dt=n-GQA.last;GQA.last=n;if(dt<=0||dt>400)return;
 GQA.ema=GQA.ema?GQA.ema*.85+dt*.15:dt;
 if(n-GQA.chg<5000)return;
 const iv=1000/(FPSL||60);
 if(GQA.ema>iv*1.25){GQA.slow+=dt;GQA.fast=0;if(GQA.slow>=2000)gfxMove(1)}
 else if(GQA.ema<=iv*1.15){GQA.fast+=dt;GQA.slow=0;if(GQA.fast>=10000)gfxMove(-1)}
 else{GQA.slow=0;GQA.fast=0}}
fpsUi();gfxUi();
// MU2-3(b): o HUD migrado para DOM (#glh e a vinheta #vig) trem junto com o mundo enquanto QK>0,02.
// Só escreve transform, uma vez por quadro e apenas quando o valor muda; zera quando o tremor acaba.
let HUD_SH='';
function hudShake(shx,shy){
 const h=$('glh'),g=$('vig');if(!h)return;
 if(h.style.display==='none'){HUD_SH='';return}
 let tr='';
 if(QK>0.02)tr='translate('+(shx*ZO*.5).toFixed(1)+'px,'+(shy*ZO*.5).toFixed(1)+'px)';
 if(tr===HUD_SH)return;HUD_SH=tr;
 h.style.transform=tr;if(g)g.style.transform=tr;
}
function draw(){requestAnimationFrame(draw);const _n=performance.now();
 // limitador por acumulador (em 144 Hz alterna 2/3 refreshes e a média fica no alvo; em taxa <= alvo passa todos)
 if(FPS_DT){if(_n<FPS_NF-1)return;FPS_NF=_n-FPS_NF>100?_n+FPS_DT:FPS_NF+FPS_DT}
 gfxTick(_n);
 if(FPSSHOW){FPS_C++;if(!FPS_T0)FPS_T0=_n;else if(_n-FPS_T0>=500){const b=$('fpsb');if(b)b.textContent=fpsText(FPS_C*1000/(_n-FPS_T0));FPS_C=0;FPS_T0=_n}}
 const _p0=pfStart();ZBUD=0;const s=snap,t=Date.now(),dtf=Math.min(.1,(t-LT)/1000);LT=t;FR++;DT_=dtf;X.setTransform(ZO*DPR,0,0,ZO*DPR,0,0);if(glLive)X.clearRect(0,0,W,H);else{X.fillStyle='#000';X.fillRect(0,0,W,H)}if(!s||s.ph==0){if(glLive)glHudShow(0);menuScene(t);{const _d=performance.now()-_n;DRAW_MS=DRAW_MS?DRAW_MS*.9+_d*.1:_d}return}
 if(FR%180==0){for(const k in RP)if(RP[k].u<FR-120)delete RP[k];zsClean()}
 const mr=me?sm('p'+id,me[3],me[4],dtf):null;if(mr){cx=mr.x;cy=mr.y}meB=bAt(cx,cy);audioFrame(s,t,mr);ox=Math.round(W/2-cx);oy=Math.round(H/2-cy);
 const shx=(Math.random()-.5)*QK*14,shy=(Math.random()-.5)*QK*14;GL_SHX=shx;GL_SHY=shy;
 if(glOn)glFrame();if(glLive)hudShake(shx,shy);QK=Math.max(0,QK-dtf*1.6);X.save();X.translate(ox+shx,oy+shy);
 const v=(x,y,m=90)=>Math.abs(x-cx)<W/2+m&&Math.abs(y-cy)<H/2+m;
 if(!glLive){X.fillStyle='#1b2e16';X.fillRect(cx-W/2-60,cy-H/2-60,W+120,H+120);
 let pt=pfStart();groundChunks();pfAdd('chao',pt);
 if(cy>RY0-700&&cy<RY1+700){X.strokeStyle='rgba(255,255,255,.13)';X.lineWidth=3;X.beginPath();for(let k=0;k<15;k++){const yy=RY0+20+k*40;X.moveTo(cx-W/2,yy);for(let u=cx-W/2;u<cx+W/2+60;u+=60)X.lineTo(u,yy+Math.sin(u/70+t/500+k)*5)}X.stroke()}
 for(const bx of[1000,3000])bridgeGround(bx,t);
 X.strokeStyle='#ca4';X.lineWidth=3;X.setLineDash([30,30]);X.beginPath();
 if(!(CEN_RUA.v&&CEN_RUA.h&&CEN_RUA.x)){for(let k=0;k<=8;k++){X.moveTo(k*500,0);X.lineTo(k*500,2500);X.moveTo(k*500,3500);X.lineTo(k*500,6000)}for(const k of[1,2,3,4,5,7,8,9,10,11]){X.moveTo(0,k*500);X.lineTo(MW,k*500)}}
 for(const bx of[1000,3000]){X.moveTo(bx,2500);X.lineTo(bx,3500)}X.stroke();X.setLineDash([]);}
 let pe=pfStart();edges('tlr');pfAdd('edges',pe);
 let pb=pfStart();
 for(const b of BLD)if(!glLive&&v(b.x+b.w/2,b.y+b.h/2,b.w)){const si=b===meB?cenBldSpr(b,1):null;
  if(!cenDraw(X,si,b.x+b.w/2,b.y+b.h/2)){X.fillStyle=b.T=='h'?'#cfd6da':b.T=='p'?'#7b7b84':b.T=='m'?'#cdb994':'#6b573f';X.fillRect(b.x,b.y,b.w,b.h);X.strokeStyle='rgba(0,0,0,.18)';X.lineWidth=2;X.beginPath();for(let u=b.x+24;u<b.x+b.w;u+=24){X.moveTo(u,b.y);X.lineTo(u,b.y+b.h)}X.stroke()}}
 pfAdd('predios',pb);
 if(s.bp&&v(s.bp[0],s.bp[1],150)){const bx=s.bp[0],by=s.bp[1],pl=(t%1000)/1000;X.strokeStyle='rgba(255,50,50,'+(1-pl)+')';X.lineWidth=4;X.beginPath();X.arc(bx,by,30+pl*70,0,7);X.stroke();X.fillStyle='rgba(255,40,40,.2)';X.beginPath();X.arc(bx,by,60,0,7);X.fill();txt('!',bx,by-30-Math.abs(Math.sin(t/150))*10,44,'#f33');if(FR%6==0)pts(2,bx+(Math.random()-.5)*90,by+(Math.random()-.5)*40,'#3f8a35',140,220,6,1)}
 for(const[x,y,an,len,tt]of s.Dh||[]){X.save();X.translate(x,y);X.rotate(an/100);const fl=tt<1;X.fillStyle=fl?'rgba(255,40,40,'+(.12+tt*.25)+')':'rgba(255,90,40,.35)';X.fillRect(0,-50,len,100);X.strokeStyle='#f44';X.lineWidth=3;X.strokeRect(0,-50,len,100);if(fl){X.fillStyle='#f66';for(let u=60;u<len;u+=90){X.beginPath();X.moveTo(u,-14);X.lineTo(u+28,0);X.lineTo(u,14);X.closePath();X.fill()}}X.restore()}
 for(const[x,y,k,vv]of IL){if(!v(x,y))continue;const ib=bAt(x,y);if(ib&&ib!==meB)continue;const bb=Math.sin(t/250+x)*3;
  if(glLive){glItemPush(x,y,k,vv,t,bb);if(k==8&&!igTxtHide(x,y))txt(vv,x,y+22,12,'#fe8')}else drawPickup(x,y,k,vv,t,bb)}
let pl=pfStart();
const D=[];for(const o of O)if(o.t!=6&&o.t!=7&&!(glLive&&(o.t==5||o.t==1||o.t==2||o.t==3))&&!DD[o.i]&&v(o.x+o.w/2,o.y+o.h/2,o.w+80))D.push([o.y+o.h,0,o]);
 for(const b of BLD)if(!glLive&&b!==meB&&v(b.x+b.w/2,b.y+b.h/2,b.w))D.push([b.y+b.h+1,3,b]);for(const f of FIRES)if(v(f[0],f[1],120)&&!(f[4]&&f[4]===meB)&&!(f[5]&&DD[f[5].i]))D.push([f[3],5,f]);
 if(s.sh)D.push([s.sh[1]+14,4,s.sh]);
 for(const b of BLD)if(!glLive&&v(b.x+b.w/2,b.y+b.h/2,b.w))D.push([b.y+b.h+.5,6,b]);for(const bx of[1000,3000])for(const yy of[2850,3150])for(const sd of[-1,1])if(v(bx,yy,300))D.push([yy,7,[bx+sd*88,yy,sd]]);
 for(const z of s.Z){if(!v(z[0],z[1]))continue;const r=zSmooth(z[6],z[0],z[1],dtf);D.push([r.y,1,z,r])}
 for(const q of DECOR)if(!glLive&&v(q.x,q.y,110))D.push([q.y,8,q]);
 for(const p of s.P){const r=p[0]==id?mr:sm('p'+p[0],p[3],p[4],dtf);D.push([r.y,2,p,r])}
 pfAdd('lista',pl);
 D.sort((a,b)=>a[0]-b[0]);
 let po=pfStart();
 let arc=null;
 for(const[,ty,e,r]of D){
  if(ty==0){const pu=POP[e.i];if(pu&&t-pu<500){const u=(t-pu)/500,sc=u<.7?.3+u/.7*.85:1.15-(u-.7)/.3*.15;X.save();X.translate(e.x+e.w/2,e.y+e.h);X.scale(sc,sc);X.translate(-(e.x+e.w/2),-(e.y+e.h));obst(e);X.restore()}else obst(e)}else if(ty==3)roof(e);else if(ty==4)seller(e);else if(ty==5)fireFx(e[0],e[1],e[2],t);else if(ty==6)facade(e);else if(ty==7)pylon(e);
   else if(ty==8){let sp=CEN_SPR[e.s];if(sp&&e.r&&CEN_SPRV[e.s])sp=CEN_SPRV[e.s][e.r];if(sp){ell(e.x+3,e.y+3,Math.max(7,Math.min(26,sp.w*.38)),Math.max(2.5,sp.h*.05),'rgba(0,0,0,.22)');
     if(e.f){X.save();X.translate(2*e.x,0);X.scale(-1,1);cenDraw(X,sp,e.x,e.y);X.restore()}else cenDraw(X,sp,e.x,e.y)}}
  else if(ty==1){const[,,k,h,vv,fz]=e,x=r.x,y=r.y,ph_=t/(k==1?80:130)+x*.05;
   if(k==3){const bs=e[7]|0,st5=(e[9]|0)/10;ell(x,y,53+Math.sin(t/150)*5,18,bs==5?'rgba(255,220,60,.28)':'rgba(190,10,30,.4)');drawBoss(x,y,{t,fa:fz/10,bs,arm:(e[8]|0)/100});if(bs==5)stars(x,y,t);if((e[10]|0)>0)bushFront(x,y,(e[10]|0)/10);bar(x-40,y-190,80,h/100,'#c0152a');X.textAlign='center';X.textBaseline='middle';X.font='bold 20px sans-serif';X.lineWidth=4;X.strokeStyle='#000';X.strokeText('KRAID',x,y-206);X.fillStyle='#ff4a4a';X.fillText('KRAID',x,y-206);txt(bs==5?'ATORDOADO '+st5.toFixed(1)+'s':'BOSS',x,y-222,12,bs==5?'#ffe45a':'#d9a0a0')}
   else{if(glLive)glZumbiPush(x,y,k,vv,fz/10,e[6],t,s);else zumbiSpr(X,x,y,k,vv,fz/10,e[6],t,s);const bs_=k==2?1.5:k==1?.9:1;
    if(h<100||k==2)bar(x-14*bs_,y-(ZH*bs_+6),28*bs_,h/100,'#e33')}}
  else{const[pid,n,c,,,hp,mx,dead,cw]=e,x=r.x,y=r.y,hh=pid.charCodeAt(0)%3,rlf=e[22]|0;
   if(dead){ell(x,y,20,9,'rgba(0,0,0,.4)');(glLive?drawPlayerGL:drawPlayer)(x,y,{k:pid,fa:e[17]/10,aim:null,c:c,gun:'#222',ring:null,shot:0,dead:true,t:t,w:cw});txt('✖',x,y-26,24,'#ddd');ell(x,y,34,14,c,1);txt(n+' (caído)',x,y-48,14,'#bbb')}
   else{if(pid==id&&IL.length){let bd=220,ik=-1,ix=0,iy=0;
     for(const[qx,qy,qk]of IL){const dd=Math.hypot(qx-x,qy-y);if(dd>=bd)continue;bd=dd;ik=qk;ix=qx;iy=qy}
     if(ik>=0)arc=[x,y,Math.atan2((iy-y)/13,(ix-x)/34),bd,ik]}
    if((e[30]|0)>0)ell(x,y,30+Math.sin(t/160)*2,11,'rgba(80,170,255,.6)',1);if(rlf>0)reloadRing(x,y,rlf);(glLive?drawPlayerGL:drawPlayer)(x,y,{k:pid,fa:e[17]/10,aim:e[25]>0?e[24]/10:null,c:c,gun:WC[cw],ring:c,shot:LSH[pid]||0,dead:false,fast:(e[21]|0)>0||(e[30]|0)>0,t:t,w:cw});bar(x-18,y-56,36,hp/mx,'#3e3');txt(n,x,y-66,14,pid==id?'#ff0':'#fff');if(pid==id)txt('▼',x,y-80,14,'#ff0');if(rlf>0)reloadPill(x,y,rlf,t,e[27]|0,e[28]|0,e[29]|0,pid==id)}}}
 if(arc){const ga=X.globalAlpha;X.globalAlpha=.6*(1-arc[3]/220)+.15;X.strokeStyle=itCol(arc[4]);X.lineWidth=3;X.beginPath();X.ellipse(arc[0],arc[1],34,13,0,arc[2]-.61,arc[2]+.61);X.stroke();X.globalAlpha=ga}
 pfAdd('objetos',po);
 let px=pfStart();drawMark(s,t);edges('b');drawFX();drawProj(s,dtf);pfAdd('fx',px);if(s.sh){const b=bAt(s.sh[0],s.sh[1]);if(b&&b!==meB)txt('🛒 LOJA',b.x+b.w/2,b.y-b.H-22+Math.sin(t/200)*4,26,'#fc3')}
 for(const[x,y,pg]of s.K){if(pg<1){X.fillStyle='rgba(255,40,40,'+(.12+pg*.25)+')';X.beginPath();X.arc(x,y,70,0,7);X.fill();X.strokeStyle='#f88';X.lineWidth=3;X.beginPath();X.arc(x,y,70,0,7);X.stroke();X.strokeStyle='#f22';X.beginPath();X.arc(x,y,70*pg,0,7);X.stroke();}
  else{const q=pg-1;X.strokeStyle='rgba(210,185,140,'+(1-q)+')';X.lineWidth=8;X.beginPath();X.arc(x,y,40+q*50,0,7);X.stroke()}}
 X.restore();
 let ph_=pfStart();
 // M1/F1: com glLive a vinheta/tint é o #vig (CSS) e os blocos 13/14 são DOM (89g-glhud.js)
 if(!glLive){X.save();X.setTransform(1,0,0,1,0,0);X.drawImage(vigOverlay(),0,0);X.restore();
 const arrow=(tx,ty,col,lb)=>{const dx=tx-cx,dy=ty-cy;if(Math.abs(dx)>W/2||Math.abs(dy)>H/2){const a=Math.atan2(dy,dx),q=Math.min(W,H)/2-90;X.fillStyle=col;poly(W/2+Math.cos(a)*q,H/2+Math.sin(a)*q,22,3,a);if(lb)txt(lb,W/2+Math.cos(a)*(q-32),H/2+Math.sin(a)*(q-32),16,col)}};
 const bz=s.Z.find(z=>z[2]==3);if(bz&&me)arrow(bz[0],bz[1],'#f0f');if(s.sh&&me)arrow(s.sh[0],s.sh[1],'#fc3','LOJA');if(s.bp&&me)arrow(s.bp[0],s.bp[1],'#f33','BOSS');
 if(s.bp){const pu=1+Math.sin(t/110)*.08;txt('⚠ KRAID CHEGANDO EM '+s.bp[2]+'s ⚠',W/2,MOB?26:44,(MOB?18:30)*pu,'#ff4040')}}
 const hk=hkF(),WW=W/hk,MMW=170,f=MMW/MW,MMH=MH*f,mx0=WW-MMW-10;X.save();X.scale(hk,hk);
 if(!glLive){X.save();X.translate(WW,MMH+20);X.scale(.8,.8);X.translate(-WW,-(MMH+20));const L=s.P.slice().sort((a,b)=>b[18]-a[18]),ry=MMH+20,RH=34,ph=34+L.length*RH,px=WW-214,pw=204,top=Math.max(1,L[0]?L[0][18]:1),MD=['#e0b84a','#b8b8c0','#b0703a'];
  rr(px,ry,pw,ph,2);const gk_=px+'|'+ry+'|'+ph+'|'+hk;if(SGGK!==gk_){SGG=X.createLinearGradient(px,ry,px,ry+ph);SGG.addColorStop(0,'rgba(10,10,12,.88)');SGG.addColorStop(1,'rgba(26,22,18,.85)');SGGK=gk_}const g_=SGG;X.fillStyle=g_;X.fill();X.strokeStyle='#3a3226';X.lineWidth=2;X.stroke();X.fillStyle='#8a6f35';X.fillRect(px,ry,5,ph);
  X.fillStyle='rgba(138,111,53,.35)';X.fillRect(px+5,ry,pw-5,24);X.fillStyle='#3a3226';X.fillRect(px+5,ry+24,pw-5,1);txt('☠ ABATES',px+pw/2+2,ry+13,15,'#c9a54a');
  L.forEach((p,i)=>{const y=ry+28+i*RH,mine=p[0]==id,dd=p[7],k=p[18],hf=Math.max(0,Math.min(1,p[5]/p[6]));
   if(mine){X.fillStyle='rgba(232,194,90,.12)';X.fillRect(px+7,y,pw-9,RH-2);X.fillStyle='#e8c25a';X.fillRect(px+7,y,2,RH-2)}
   X.fillStyle='rgba(138,111,53,.28)';X.fillRect(px+30,y+RH-9,(pw-40)*k/top,3);
   X.globalAlpha=dd?.45:1;
   X.beginPath();X.arc(px+19,y+(RH-2)/2,9,0,6.2832);X.fillStyle='#0a0a0c';X.fill();X.lineWidth=2;X.strokeStyle=i<3?MD[i]:'#3a3226';X.stroke();txt(i+1,px+19,y+(RH-2)/2+1,12,i<3?MD[i]:'#8a8478');
   X.font='bold 14px sans-serif';X.textAlign='left';X.textBaseline='middle';X.fillStyle=mine?'#e8c25a':'#d8d2c0';X.fillText((dd?'☠ ':'')+p[1].replace(/&lt;/g,'<').slice(0,10),px+34,y+10);
   X.fillStyle=WC[p[8]]||'#ddd';X.fillRect(px+34,y+RH-8,3,3);
   X.fillStyle='#0a0a0c';X.fillRect(px+42,y+RH-9,60,5);X.fillStyle=hf>.5?'#d83a3a':hf>.25?'#e0701a':'#ff2a2a';X.fillRect(px+42,y+RH-9,60*(dd?0:hf),5);
   X.font='bold 18px sans-serif';X.textAlign='right';X.fillStyle=mine?'#e8c25a':'#d8d2c0';X.fillText(k,px+pw-10,y+RH/2-2);X.globalAlpha=1});X.restore()}
 if(me&&!glLive){const[,,,,,hp,mx,dead,cw,lv,xp,nd,df]=me;if(HLV!=null&&lv>HLV)HLT=t;HLV=lv;X.save();X.scale(.8,.8);
  const ST=(s_,x,y,font,fill,al)=>{X.font=font;X.textAlign=al||'left';X.textBaseline='middle';X.lineJoin='round';X.lineWidth=5;X.strokeStyle='rgba(0,0,0,.85)';X.strokeText(s_,x,y);X.fillStyle=fill;X.fillText(s_,x,y)};
  const hf=hp/mx,low=hf<=.25,pu=low?.5+.5*Math.sin(t/120):0,hcol=hf>.5?'#4ddc5a':hf>.25?'#e0a01a':'#ff2a2a';
  const lvUp=t-HLT<2000;
  {const sh_=!!s.sh,tm=sh_?'LOJA '+s.sh[2]+'s':fmt(s.gt),tc=sh_?'#fc3':'#fff';X.save();X.strokeStyle='#d8d2c0';X.lineWidth=2.5;X.beginPath();X.arc(29,17,9,0,6.2832);X.stroke();X.beginPath();X.moveTo(29,11);X.lineTo(29,17);X.lineTo(34,20);X.stroke();X.restore();ST(tm,48,17,'bold 26px sans-serif',tc)}
  X.save();X.translate(0,14);
  const hgs=Math.max(.5,Math.min(5,ZO*DPR*hkF()*.8)),xfn=c=>{c.fillRect(18,40,22,7);c.fillRect(25,33,8,21)};
  glowPut(glowSpr('hp',hgs,hcol,10,18,33,22,21,xfn),18,33);if(pu>0){X.globalAlpha=pu;glowPut(glowSpr('hp',hgs,hcol,20,18,33,22,21,xfn),18,33);X.globalAlpha=1}
  X.fillStyle=hcol;X.fillRect(18,40,22,7);X.fillRect(25,33,8,21);
  ST(String(hp),52,43,'bold 40px sans-serif',low?'#ffd0d0':'#fff');const hw=(X.measureText(String(hp)),X.measureText(String(hp)).width);ST('/'+mx,52+hw+6,50,'bold 18px sans-serif','#e0701a');
  X.save();{const sc_=lvUp?'#ff6a5a':'#f2c230',sbn=c=>{c.beginPath();for(let k=0;k<10;k++){const r_=k%2?9:19,an=-1.5708+k*.6283;c[k?'lineTo':'moveTo'](30+Math.cos(an)*r_,86+Math.sin(an)*r_)}c.closePath();c.fill()};
   glowPut(glowSpr('lv',hgs,sc_,lvUp?16:10,11,67,38,38,sbn),11,67);X.fillStyle=sc_;X.beginPath();for(let k=0;k<10;k++){const r_=k%2?9:19,an=-1.5708+k*.6283;X[k?'lineTo':'moveTo'](30+Math.cos(an)*r_,86+Math.sin(an)*r_)}X.closePath();X.fill();X.restore();}
  X.font='bold 14px sans-serif';X.textAlign='center';X.textBaseline='middle';X.fillStyle='#1a1208';X.fillText(lv,30,88);
  ST(String(xp),52,86,'bold 34px sans-serif','#fff');const xw=X.measureText(String(xp)).width;ST('/'+nd,52+xw+6,92,'bold 18px sans-serif','#e0701a');
  X.fillStyle='rgba(0,0,0,.6)';X.fillRect(18,112,150,4);X.fillStyle='#f2c230';X.fillRect(18,112,150*Math.min(1,xp/nd),4);X.restore();
  X.font='bold 13px sans-serif';X.fillStyle='#e8c25a';X.textAlign='left';let ix=18;if(df){X.fillText('⚡ x'+df,ix,148);ix+=52}if(me[21]>0){X.fillText('💊 '+me[21]+'s',ix,148);ix+=62}if(me[30]>0){X.fillStyle='#d8d2c0';X.fillText('🎯 '+me[30]+'s',ix,148)}
  
  X.restore();if(dead)txt('VOCÊ CAIU — um aliado com desfibrilador (⚡) precisa chegar perto e usar o desfibrilador',WW/2,H/hk-110,22,'#f66')}
 if(!glLive){
 X.fillStyle='#0f140f';X.fillRect(mx0,10,MMW,MMH);
 {const mk=((typeof curSd!=='undefined'&&curSd?curSd:(typeof sd!=='undefined'?sd:0))||0)+'|'+BLD.length+'|'+MMW+'|'+MH;
  if(!MMCV||MMCK!==mk){MMCK=mk;MMCV=mmBuild(MMW,f)}
  if(MMCV)X.drawImage(MMCV,mx0,10,MMW,MMH)}
 X.textAlign='center';X.textBaseline='middle';const lbs=[];
 for(const b of BLD){const T=b.T;if(T!='h'&&T!='p'&&T!='m')continue;const nm=T=='h'?'HOSPITAL':T=='p'?'POLÍCIA':'MERCADO',w=MOB?10:nm.length*5.2;lbs.push({T,nm,w,lx:Math.max(mx0+w/2+2,Math.min(mx0+MMW-w/2-2,mx0+(b.x+b.w/2)*f)),ly:10+b.y*f-5})}
 lbs.sort((a,b)=>a.lx-b.lx);const done=[];
 for(const l of lbs){let best=Math.max(17,l.ly);for(const dy of[0,-10,10,-20,20,30,-30]){const y=Math.max(17,Math.min(10+MMH-6,l.ly+dy));if(!done.some(q=>Math.abs(q.lx-l.lx)<(q.w+l.w)/2+2&&Math.abs(q.y-y)<9)){best=y;break}}l.y=best;done.push(l)}
 for(const l of done){const T=l.T;
  if(MOB){X.fillStyle=T=='h'?'#e33':T=='p'?'#36f':'#e80';X.beginPath();X.arc(l.lx,l.y,4.5,0,7);X.fill();X.font='bold 7px sans-serif';X.fillStyle='#fff';X.fillText(l.nm[0],l.lx,l.y+.5)}
  else{X.font='bold 8px sans-serif';X.lineWidth=2.5;X.strokeStyle='rgba(0,0,0,.85)';X.strokeText(l.nm,l.lx,l.y);X.fillStyle=T=='h'?'#ff8a8a':T=='p'?'#8fb0ff':'#ffc070';X.fillText(l.nm,l.lx,l.y)}}
 X.strokeStyle='#3a3226';X.lineWidth=2;X.strokeRect(mx0,10,MMW,MMH);{const k2=8;X.strokeStyle='#8a6f35';X.lineWidth=3;X.beginPath();X.moveTo(mx0,10+k2);X.lineTo(mx0,10);X.lineTo(mx0+k2,10);X.moveTo(mx0+MMW-k2,10);X.lineTo(mx0+MMW,10);X.lineTo(mx0+MMW,10+k2);X.moveTo(mx0,10+MMH-k2);X.lineTo(mx0,10+MMH);X.lineTo(mx0+k2,10+MMH);X.moveTo(mx0+MMW-k2,10+MMH);X.lineTo(mx0+MMW,10+MMH);X.lineTo(mx0+MMW,10+MMH-k2);X.stroke()}
 X.globalCompositeOperation='lighter';
 for(const[x,y,k]of IL){const ix=mx0+x*f,iy=10+y*f;
  X.fillStyle=itRGBA(k,.2);X.beginPath();X.arc(ix,iy,4,0,7);X.fill();
  X.fillStyle=itRGBA(k,.9);X.beginPath();X.arc(ix,iy,1.1,0,7);X.fill()}
 X.globalCompositeOperation='source-over';
 for(const[x,y,k]of ZMM)if(k<3){const zx=mx0+x*30*f,zy=10+y*30*f;
  X.fillStyle='rgba(0,0,0,.55)';X.beginPath();X.ellipse(zx,zy+1,2.1,.8,0,0,7);X.fill();
  X.fillStyle=k==1?'#7a5a30':'#2a2f22';X.fillRect(zx-1.1,zy-2.8,2.2,2.8);
  X.fillStyle='#9a9a7a';X.beginPath();X.arc(zx,zy-3.8,1.1,0,7);X.fill();
  X.strokeStyle='rgba(0,0,0,.6)';X.lineWidth=.6;X.strokeRect(zx-1.1,zy-2.8,2.2,2.8)}
 for(const z of s.Z)if(z[2]==3){const bx=mx0+z[0]*f,by=10+z[1]*f,pu=1+Math.sin(t/200)*.2;
  X.fillStyle='rgba(0,0,0,.6)';X.beginPath();X.ellipse(bx,by+2,5,2,0,0,7);X.fill();
  X.globalCompositeOperation='lighter';X.fillStyle='rgba(190,60,255,.35)';X.beginPath();X.arc(bx,by-3,8*pu,0,7);X.fill();X.globalCompositeOperation='source-over';
  X.fillStyle='#9a3de0';X.beginPath();X.ellipse(bx,by-3,4.2,4.8,0,0,7);X.fill();X.strokeStyle='#e0a0ff';X.lineWidth=.8;X.stroke();
  txt('BOSS',bx,by+8,7,'#f0f')}
 if(s.bp){const pl=1+Math.sin(t/120)*.35,bx=mx0+s.bp[0]*f,by=10+s.bp[1]*f;X.strokeStyle='#f33';X.lineWidth=2;X.beginPath();X.arc(bx,by,10*pl,0,7);X.stroke();X.fillStyle=t%300<150?'#f33':'#fff';X.beginPath();X.arc(bx,by,5,0,7);X.fill();txt('!',bx,by+1,9,'#000');txt('BOSS',bx,by+17,11,'#f55')}
 if(s.sh){X.fillStyle=t%600<300?'#fc3':'#fff';X.beginPath();X.arc(mx0+s.sh[0]*f,10+s.sh[1]*f,6,0,7);X.fill();txt('$',mx0+s.sh[0]*f,10+s.sh[1]*f+1,10,'#000')}
 for(const p of s.P){const px=mx0+p[3]*f,py=10+p[4]*f,dd=p[7],mine=p[0]==id;
  X.fillStyle='rgba(0,0,0,.55)';X.beginPath();X.ellipse(px,py+1.2,3.2,1.3,0,0,7);X.fill();
  X.globalAlpha=dd?.42:1;
  X.beginPath();X.moveTo(px-1.8,py+1.2);X.lineTo(px-1.6,py-2);X.arc(px,py-2,1.6,3.14159,0);X.lineTo(px+1.8,py+1.2);X.closePath();
  X.fillStyle=p[2];X.fill();X.strokeStyle='rgba(0,0,0,.7)';X.lineWidth=.7;X.stroke();
  X.fillStyle='#f2ddc0';X.beginPath();X.arc(px,py-4.4,1.6,0,7);X.fill();X.strokeStyle='rgba(0,0,0,.55)';X.lineWidth=.6;X.stroke();
  if(dd)txt('☠',px,py-6.5,8,'#ddd');
  if(mine&&!dd){const pl=1+Math.sin(t/170)*.22;
   X.strokeStyle='rgba(255,255,255,'+(.55+.3*Math.sin(t/170))+')';X.lineWidth=1.4;X.beginPath();X.arc(px,py-2,6.5*pl,0,7);X.stroke();
   const a=(p[17]|0)/10;X.fillStyle='#fff';poly(px+Math.cos(a)*8.5,py-2+Math.sin(a)*8.5,2.8,3,a)}
  X.globalAlpha=1}}
 X.restore();if(glLive)glHudFrame(s);drawJoy();pfAdd('hud',ph_);pfEnd(_p0);if(glLive)glRenderNow();{const _d=performance.now()-_n;DRAW_MS=DRAW_MS?DRAW_MS*.9+_d*.1:_d}}