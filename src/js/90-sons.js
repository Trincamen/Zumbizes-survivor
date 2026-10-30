// ---------- SONS (gerados no código, sem arquivos) ----------
const lv=(k,d)=>{const v=LS.get(k);return v==null?d:+v},AU={c:null,vol:lv('vol2',50)/100,mv:lv('mvol2',80)/100,tense:0,px:0,py:0,sd:0,rl:0,th:0,ng:0,nb2:0,dh:0,rk:{},fv:0,fp:0,hp:null,mo:null,sl:null,lv:null,k:null,last:{}};$('vol').value=AU.vol*100;$('mvol').value=AU.mv*100;function setMus(v){AU.mv=v/100;LS.set('mvol2',v);if(AU.mg)AU.mg.gain.value=AU.mv*1.2}
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
function musicInit(c){AU.mg=c.createGain();AU.mg.gain.value=AU.mv*1.2;AU.mg.connect(c.destination);
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
 rr(x,y,w,h,2);X.strokeStyle='#4a1a1e';X.lineWidth=1.5;X.stroke();
 if(label){X.font='bold '+Math.round(h*.72)+'px sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.75)';X.strokeText(label,x+w/2,y+h/2+1);X.fillStyle='#e8e2d0';X.fillText(label,x+w/2,y+h/2+1)}}
function badge(cx0,cy0,r,lv,t,pulse){if(pulse){X.globalAlpha=.35+.3*Math.sin(t/110);X.fillStyle='#d83a3a';X.beginPath();X.arc(cx0,cy0,r+9,0,7);X.fill();X.globalAlpha=1}
 const g=X.createLinearGradient(cx0,cy0-r,cx0,cy0+r);g.addColorStop(0,'#141016');g.addColorStop(.55,'#0a0a0c');g.addColorStop(1,'#120c0e');X.fillStyle=g;X.beginPath();X.arc(cx0,cy0,r,0,7);X.fill();
 X.strokeStyle='#8a1218';X.lineWidth=3;X.beginPath();X.arc(cx0,cy0,r-1.5,0,7);X.stroke();
 X.strokeStyle='rgba(216,210,192,.6)';X.lineWidth=1;X.beginPath();X.arc(cx0,cy0,r-6,0,7);X.stroke();
 X.textAlign='center';X.textBaseline='middle';X.font='bold 9px sans-serif';X.fillStyle='#d8d2c0';X.fillText('NÍVEL',cx0,cy0-r*.5);
 X.font='bold '+Math.round(r*(lv>=100?.62:lv>=10?.82:1))+'px sans-serif';X.lineWidth=4;X.strokeStyle='#000';X.strokeText(lv,cx0,cy0+r*.14);X.fillStyle='#e8e2d0';X.fillText(lv,cx0,cy0+r*.14)}
function sfxShot(f){const d=Math.hypot(f[0]-cx,f[1]-cy),v=Math.max(0,1-d/1000);if(v>.05)SND.shot(f[4],v,(f[0]-cx)/600)}
function audioFrame(s,t,mr){if(!AU.c||AU.c.state!='running')return;
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
function menuScene(t){const hz=H*.5,g=X.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#04050a');g.addColorStop(.6,'#2a0d14');g.addColorStop(1,'#6a2216');X.fillStyle=g;X.fillRect(0,0,W,hz);
 X.fillStyle='rgba(200,40,30,.22)';X.beginPath();X.arc(W*.72,hz-H*.1,H*.13,0,7);X.fill();X.fillStyle='#c9a89a';X.beginPath();X.arc(W*.72,hz-H*.1,H*.07,0,7);X.fill();
 X.fillStyle='rgba(12,6,10,.6)';for(let i=0;i<7;i++){X.beginPath();X.arc(W*.58+i*26+Math.sin(t/1500+i)*8,hz-H*.18-i*26,22+i*7,0,7);X.fill()}
 for(let L=0;L<3;L++){X.fillStyle=['#1c1520','#150f19','#0d0910'][L];let x=-20;for(let i=0;x<W+60;i++){const hh=(((i*7+L*5)%9)+3)*H*.022+L*10,w=46+((i*13+L)%4)*14;X.fillRect(x,hz-hh,w,hh);if(L==2){X.fillStyle='#8a6a2a';for(let k=0;k<hh/20|0;k++)if((i*5+k*3)%5==0&&Math.sin(t/(300+i*37)+i)>-.6)X.fillRect(x+8+(k%2)*16,hz-hh+8+k*18,6,9);X.fillStyle='#0d0910'}x+=w+8}}
 X.fillStyle='#1a2418';X.fillRect(0,hz,W,H-hz);X.fillStyle='#141418';X.fillRect(0,hz+H*.1,W,H*.17);X.strokeStyle='#6a5a22';X.lineWidth=3;X.setLineDash([26,22]);X.beginPath();X.moveTo(0,hz+H*.185);X.lineTo(W,hz+H*.185);X.stroke();X.setLineDash([]);
 for(let i=0;i<9;i++){const x=(i*W/8+30)%W,y=hz+H*(.05+(i%3)*.01);ell(x+8,y+4,22,8,'rgba(0,0,0,.35)');X.fillStyle='#2a1a14';X.fillRect(x-4,y-22,8,24);X.fillStyle='#16281a';X.beginPath();X.arc(x,y-36,22,0,7);X.fill()}
 const zs=Math.min(1,W/900)*.9+.3;for(let i=0;i<10;i++){const x=W+80-((t/(28+i%3*8)+i*(W/9))%(W+160)),y=hz+H*(.13+(i%4)*.035);person(x,y,{s:zs*.8,ph:t/110+i,fa:3.14,sh:ZS[i%4],sk:'#6f8466',pn:'#2a2a34',hr:'#1a1a14',ey:'#f22',zm:1})}
 {const bx=W*.8,by=hz+H*.12;ell(bx,by,70,22,'rgba(255,0,60,.4)');person(bx,by,{s:zs*2.4,w:1.2,ph:t/260,fa:1.57,sh:'#6a2a8a',sk:'#a45fd0',pn:'#3a1a4a',hr:'#f0f',ey:'#ff0',zm:1});bar(bx-50,by-zs*115,100,.7,'#f0f');txt('BOSS',bx,by-zs*125,18,'#f6f')}
 const cs=['#3a5a8a','#6a3a8a','#3a6a3a','#8a2e22'];for(let i=0;i<4;i++)drawPlayer(W*.5+i*W*.075,H*.98-(i%2)*10,{k:'m'+i,s:zs*2,fa:-1.3+i*.15,aim:null,c:cs[i],gun:'#ddd',ring:null,shot:0,dead:false,idle:true,t:t,w:[2,1,3,5][i]});
 X.fillStyle='rgba(40,0,6,.22)';X.fillRect(0,0,W,H);{const f=X.createLinearGradient(0,hz-H*.12,0,hz+H*.12);f.addColorStop(0,'rgba(150,130,130,0)');f.addColorStop(.5,'rgba(150,130,130,'+(.10+.04*Math.sin(t/1800))+')');f.addColorStop(1,'rgba(150,130,130,0)');X.fillStyle=f;X.fillRect(0,hz-H*.12,W,H*.24);const v=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.75)');X.fillStyle=v;X.fillRect(0,0,W,H)}}
function draw(){requestAnimationFrame(draw);const s=snap,t=Date.now(),dtf=Math.min(.1,(t-LT)/1000);LT=t;FR++;DT_=dtf;X.setTransform(ZO*DPR,0,0,ZO*DPR,0,0);X.fillStyle='#000';X.fillRect(0,0,W,H);if(!s||s.ph==0){menuScene(t);return}
 if(FR%180==0)for(const k in RP)if(RP[k].u<FR-120)delete RP[k];
 const mr=me?sm('p'+id,me[3],me[4],dtf):null;if(mr){cx=mr.x;cy=mr.y}meB=bAt(cx,cy);audioFrame(s,t,mr);ox=Math.round(W/2-cx);oy=Math.round(H/2-cy);const shx=(Math.random()-.5)*QK*14,shy=(Math.random()-.5)*QK*14;QK=Math.max(0,QK-dtf*1.6);X.save();X.translate(ox+shx,oy+shy);
 const v=(x,y,m=90)=>Math.abs(x-cx)<W/2+m&&Math.abs(y-cy)<H/2+m;
 X.fillStyle='#1b2e16';X.fillRect(cx-W/2-60,cy-H/2-60,W+120,H+120);X.fillStyle='#3a4a2b';X.fillRect(0,0,MW,MH);
 X.fillStyle='#2d6fa8';X.fillRect(0,RY0,MW,600);
 if(cy>RY0-700&&cy<RY1+700){X.strokeStyle='rgba(255,255,255,.13)';X.lineWidth=3;X.beginPath();for(let k=0;k<15;k++){const yy=RY0+20+k*40;X.moveTo(cx-W/2,yy);for(let u=cx-W/2;u<cx+W/2+60;u+=60)X.lineTo(u,yy+Math.sin(u/70+t/500+k)*5)}X.stroke()}
 X.fillStyle='#34343a';for(const[ya,yb]of[[0,2500],[3500,6000]])for(let k=0;k<=8;k++)X.fillRect(k*500-60,ya,120,yb-ya);
 for(const k of[0,1,2,3,4,5,7,8,9,10,11,12])X.fillRect(0,k*500-60,MW,120);
 for(const bx of[1000,3000])bridgeGround(bx,t);
 X.strokeStyle='#ca4';X.lineWidth=3;X.setLineDash([30,30]);X.beginPath();for(let k=0;k<=8;k++){X.moveTo(k*500,0);X.lineTo(k*500,2500);X.moveTo(k*500,3500);X.lineTo(k*500,6000)}for(const k of[1,2,3,4,5,7,8,9,10,11]){X.moveTo(0,k*500);X.lineTo(MW,k*500)}for(const bx of[1000,3000]){X.moveTo(bx,2500);X.lineTo(bx,3500)}X.stroke();X.setLineDash([]);
 for(const j of ROWS)for(let i=0;i<8;i++){const bx=i*500+60,by=j*500+60;if(!v(bx+190,by+190,300))continue;X.fillStyle='#807a6a';X.fillRect(bx-10,by-10,400,400);X.fillStyle=(i+j)%2?'#44562f':'#3c4d2a';X.fillRect(bx,by,380,380)}
 edges('tlr');
 for(const b of BLD)if(v(b.x+b.w/2,b.y+b.h/2,b.w)){X.fillStyle=b.T=='h'?'#cfd6da':b.T=='p'?'#7b7b84':b.T=='m'?'#cdb994':'#6b573f';X.fillRect(b.x,b.y,b.w,b.h);X.strokeStyle='rgba(0,0,0,.18)';X.lineWidth=2;X.beginPath();for(let u=b.x+24;u<b.x+b.w;u+=24){X.moveTo(u,b.y);X.lineTo(u,b.y+b.h)}X.stroke()}
 if(s.bp&&v(s.bp[0],s.bp[1],150)){const bx=s.bp[0],by=s.bp[1],pl=(t%1000)/1000;X.strokeStyle='rgba(255,50,50,'+(1-pl)+')';X.lineWidth=4;X.beginPath();X.arc(bx,by,30+pl*70,0,7);X.stroke();X.fillStyle='rgba(255,40,40,.2)';X.beginPath();X.arc(bx,by,60,0,7);X.fill();txt('!',bx,by-30-Math.abs(Math.sin(t/150))*10,44,'#f33');if(FR%6==0)pts(2,bx+(Math.random()-.5)*90,by+(Math.random()-.5)*40,'#3f8a35',140,220,6,1)}
 for(const[x,y,an,len,tt]of s.Dh||[]){X.save();X.translate(x,y);X.rotate(an/100);const fl=tt<1;X.fillStyle=fl?'rgba(255,40,40,'+(.12+tt*.25)+')':'rgba(255,90,40,.35)';X.fillRect(0,-50,len,100);X.strokeStyle='#f44';X.lineWidth=3;X.strokeRect(0,-50,len,100);if(fl){X.fillStyle='#f66';for(let u=60;u<len;u+=90){X.beginPath();X.moveTo(u,-14);X.lineTo(u+28,0);X.lineTo(u,14);X.closePath();X.fill()}}X.restore()}
 for(const[x,y,k,vv]of IL){if(!v(x,y))continue;const ib=bAt(x,y);if(ib&&ib!==meB)continue;const bb=Math.sin(t/250+x)*3;drawPickup(x,y,k,vv,t,bb)}
const D=[];for(const o of O)if(o.t!=6&&!DD[o.i]&&v(o.x+o.w/2,o.y+o.h/2,o.w+80))D.push([o.y+o.h,0,o]);
 for(const b of BLD)if(b!==meB&&v(b.x+b.w/2,b.y+b.h/2,b.w))D.push([b.y+b.h+1,3,b]);for(const f of FIRES)if(v(f[0],f[1],120)&&!(f[4]&&f[4]===meB)&&!(f[5]&&DD[f[5].i]))D.push([f[3],5,f]);
 if(s.sh)D.push([s.sh[1]+14,4,s.sh]);
 for(const b of BLD)if(v(b.x+b.w/2,b.y+b.h/2,b.w))D.push([b.y+b.h+.5,6,b]);for(const bx of[1000,3000])for(const yy of[2850,3150])for(const sd of[-1,1])if(v(bx,yy,300))D.push([yy,7,[bx+sd*88,yy,sd]]);
 for(const z of s.Z){const r=sm('z'+z[6],z[0],z[1],dtf);if(v(r.x,r.y))D.push([r.y,1,z,r])}
 for(const p of s.P){const r=p[0]==id?mr:sm('p'+p[0],p[3],p[4],dtf);D.push([r.y,2,p,r])}
 D.sort((a,b)=>a[0]-b[0]);
 for(const[,ty,e,r]of D){
  if(ty==0){const pu=POP[e.i];if(pu&&t-pu<500){const u=(t-pu)/500,sc=u<.7?.3+u/.7*.85:1.15-(u-.7)/.3*.15;X.save();X.translate(e.x+e.w/2,e.y+e.h);X.scale(sc,sc);X.translate(-(e.x+e.w/2),-(e.y+e.h));obst(e);X.restore()}else obst(e)}else if(ty==3)roof(e);else if(ty==4)seller(e);else if(ty==5)fireFx(e[0],e[1],e[2],t);else if(ty==6)facade(e);else if(ty==7)pylon(e);
  else if(ty==1){const[,,k,h,vv,fz]=e,x=r.x,y=r.y,ph_=t/(k==1?80:130)+x*.05;
   if(k==3){const bs=e[7]|0,st5=(e[9]|0)/10;ell(x,y,53+Math.sin(t/150)*5,18,bs==5?'rgba(255,220,60,.28)':'rgba(190,10,30,.4)');drawBoss(x,y,{t,fa:fz/10,bs,arm:(e[8]|0)/100});if(bs==5)stars(x,y,t);if((e[10]|0)>0)bushFront(x,y,(e[10]|0)/10);bar(x-40,y-190,80,h/100,'#c0152a');X.textAlign='center';X.textBaseline='middle';X.font='bold 20px sans-serif';X.lineWidth=4;X.strokeStyle='#000';X.strokeText('KRAID',x,y-206);X.fillStyle='#ff4a4a';X.fillText('KRAID',x,y-206);txt(bs==5?'ATORDOADO '+st5.toFixed(1)+'s':'BOSS',x,y-222,12,bs==5?'#ffe45a':'#d9a0a0')}
   else{const c=[{s:1,sh:ZS[vv],sk:'#8fa88a',pn:'#3a3a4a',hr:'#2a2a22'},{s:.9,sh:'#a8a040',sk:'#b6c27a',pn:'#444',hr:'#432'},{s:1.5,w:1.4,sh:'#3a4a3a',sk:'#6d8a6d',pn:'#222',hr:'#111'}][k];
    person(x,y,Object.assign({ph:ph_,fa:fz/10,ey:'#f22',zm:1},c));if(h<100||k==2)bar(x-14*c.s,y-52*c.s,28*c.s,h/100,'#e33')}}
  else{const[pid,n,c,,,hp,mx,dead,cw]=e,x=r.x,y=r.y,hh=pid.charCodeAt(0)%3,rlf=e[22]|0;
   if(dead){ell(x,y,20,9,'rgba(0,0,0,.4)');drawPlayer(x,y,{k:pid,fa:e[17]/10,aim:null,c:c,gun:'#222',ring:null,shot:0,dead:true,t:t,w:cw});txt('✖',x,y-26,24,'#ddd');ell(x,y,34,14,c,1);txt(n+' (caído)',x,y-48,14,'#bbb')}
   else{if((e[30]|0)>0)ell(x,y,30+Math.sin(t/160)*2,11,'rgba(80,170,255,.6)',1);if(rlf>0)reloadRing(x,y,rlf);drawPlayer(x,y,{k:pid,fa:e[17]/10,aim:e[25]>0?e[24]/10:null,c:c,gun:WC[cw],ring:c,shot:LSH[pid]||0,dead:false,fast:(e[21]|0)>0||(e[30]|0)>0,t:t,w:cw});bar(x-18,y-56,36,hp/mx,'#3e3');txt(n,x,y-66,14,pid==id?'#ff0':'#fff');if(pid==id)txt('▼',x,y-80,14,'#ff0');if(rlf>0)reloadPill(x,y,rlf,t,e[27]|0,e[28]|0,e[29]|0,pid==id)}}}
 drawMark(s,t);edges('b');drawFX();drawProj(s,dtf);if(s.sh){const b=bAt(s.sh[0],s.sh[1]);if(b&&b!==meB)txt('🛒 LOJA',b.x+b.w/2,b.y-b.H-22+Math.sin(t/200)*4,26,'#fc3')}
 for(const[x,y,pg]of s.K){if(pg<1){X.fillStyle='rgba(255,40,40,'+(.12+pg*.25)+')';X.beginPath();X.arc(x,y,70,0,7);X.fill();X.strokeStyle='#f88';X.lineWidth=3;X.beginPath();X.arc(x,y,70,0,7);X.stroke();X.strokeStyle='#f22';X.beginPath();X.arc(x,y,70*pg,0,7);X.stroke();}
  else{const q=pg-1;X.strokeStyle='rgba(210,185,140,'+(1-q)+')';X.lineWidth=8;X.beginPath();X.arc(x,y,40+q*50,0,7);X.stroke()}}
 X.restore();
 X.fillStyle='rgba(20,10,50,.2)';X.fillRect(0,0,W,H);const g=X.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');X.fillStyle=g;X.fillRect(0,0,W,H);
 const arrow=(tx,ty,col,lb)=>{const dx=tx-cx,dy=ty-cy;if(Math.abs(dx)>W/2||Math.abs(dy)>H/2){const a=Math.atan2(dy,dx),q=Math.min(W,H)/2-90;X.fillStyle=col;poly(W/2+Math.cos(a)*q,H/2+Math.sin(a)*q,22,3,a);if(lb)txt(lb,W/2+Math.cos(a)*(q-32),H/2+Math.sin(a)*(q-32),16,col)}};
 const bz=s.Z.find(z=>z[2]==3);if(bz&&me)arrow(bz[0],bz[1],'#f0f');if(s.sh&&me)arrow(s.sh[0],s.sh[1],'#fc3','LOJA');if(s.bp&&me)arrow(s.bp[0],s.bp[1],'#f33','BOSS');
 if(s.bp){const pu=1+Math.sin(t/110)*.08;txt('⚠ KRAID CHEGANDO EM '+s.bp[2]+'s ⚠',W/2,MOB?26:44,(MOB?18:30)*pu,'#ff4040')}
 const hk=hkF(),WW=W/hk,MMW=130,f=MMW/MW,MMH=MH*f,mx0=WW-MMW-10;X.save();X.scale(hk,hk);
 {const L=s.P.slice().sort((a,b)=>b[18]-a[18]),ry=MMH+20,ph=28+L.length*24;X.fillStyle='rgba(10,8,10,.85)';X.fillRect(WW-190,ry,180,ph);X.strokeStyle='#4a1a1e';X.lineWidth=2;X.strokeRect(WW-190,ry,180,ph);X.fillStyle='#8a1218';X.fillRect(WW-190,ry,5,ph);txt('☠ ABATES',WW-100,ry+14,16,'#d83a3a');L.forEach((p,i)=>{X.font='16px sans-serif';X.fillStyle=p[0]==id?'#e8c25a':'#d8d2c0';X.textAlign='left';X.fillText((i+1)+'. '+p[1].replace(/&lt;/g,'<').slice(0,10),WW-182,ry+40+i*24);X.textAlign='right';X.fillText(p[18],WW-16,ry+40+i*24)})}
 if(me){const[,,,,,hp,mx,dead,cw,lv,xp,nd,df]=me;if(HLV!=null&&lv>HLV)HLT=t;HLV=lv;
  rr(6,6,300,98,2);const pn_=X.createLinearGradient(6,6,306,104);pn_.addColorStop(0,'rgba(10,10,12,.88)');pn_.addColorStop(1,'rgba(20,14,16,.85)');X.fillStyle=pn_;X.fill();X.strokeStyle='#4a1a1e';X.lineWidth=2;X.stroke();X.fillStyle='#8a1218';X.fillRect(6,6,5,98);badge(44,52,30,lv,t,t-HLT<2000);
  const rt=s.sh?'🛒 LOJA — '+s.sh[2]+'s':'⏱ '+fmt(s.gt)+'  •  Zumbis '+s.left;X.textAlign='left';X.textBaseline='middle';X.font='bold 15px sans-serif';X.lineWidth=3;X.strokeStyle='rgba(0,0,0,.7)';X.strokeText(rt,88,24);X.fillStyle='#d8d2c0';X.fillText(rt,88,24);
  const hf=hp/mx,hc=hf>.5?['#d83a3a','#8a1218']:hf>.25?['#e0701a','#8a3a0a']:['#ff2a2a','#600808'];
  pbar(88,36,204,18,hf,hc[0],hc[1],'♥ '+hp+' / '+mx,hf<=.25?.8+.2*Math.sin(t/120):null);pbar(88,60,204,12,xp/nd,'#d8c88a','#8a7a3a','XP '+xp+' / '+nd);
  X.font='bold 13px sans-serif';X.fillStyle='#e8c25a';X.textAlign='left';let ix=88;if(df){X.fillText('⚡ x'+df,ix,88);ix+=52}if(me[21]>0){X.fillText('💊 '+me[21]+'s',ix,88);ix+=62}if(me[30]>0){X.fillStyle='#d8d2c0';X.fillText('🎯 '+me[30]+'s',ix,88)}
  
  if(dead)txt('VOCÊ CAIU — um aliado com desfibrilador (⚡) precisa chegar até você',WW/2,H/hk-110,22,'#f66')}
 X.fillStyle='#0f140f';X.fillRect(mx0,10,MMW,MMH);X.fillStyle='#1d3646';X.fillRect(mx0,10+RY0*f,MMW,600*f);X.fillStyle='#6a6a70';for(const bx of[1000,3000])X.fillRect(mx0+(bx-80)*f-.5,10+2500*f,160*f+1.5,1000*f);
 for(const b of BLD){X.fillStyle=b.T=='h'?'#fff':b.T=='p'?'#58f':b.T=='m'?'#fa5':'#55555a';X.fillRect(mx0+b.x*f,10+b.y*f,b.w*f,b.h*f)}
 X.textAlign='center';X.textBaseline='middle';const lbs=[];
 for(const b of BLD){const T=b.T;if(T!='h'&&T!='p'&&T!='m')continue;const nm=T=='h'?'HOSPITAL':T=='p'?'POLÍCIA':'MERCADO',w=MOB?10:nm.length*5.2;lbs.push({T,nm,w,lx:Math.max(mx0+w/2+2,Math.min(mx0+MMW-w/2-2,mx0+(b.x+b.w/2)*f)),ly:10+b.y*f-5})}
 lbs.sort((a,b)=>a.lx-b.lx);const done=[];
 for(const l of lbs){let best=Math.max(17,l.ly);for(const dy of[0,-10,10,-20,20,30,-30]){const y=Math.max(17,Math.min(10+MMH-6,l.ly+dy));if(!done.some(q=>Math.abs(q.lx-l.lx)<(q.w+l.w)/2+2&&Math.abs(q.y-y)<9)){best=y;break}}l.y=best;done.push(l)}
 for(const l of done){const T=l.T;
  if(MOB){X.fillStyle=T=='h'?'#e33':T=='p'?'#36f':'#e80';X.beginPath();X.arc(l.lx,l.y,4.5,0,7);X.fill();X.font='bold 7px sans-serif';X.fillStyle='#fff';X.fillText(l.nm[0],l.lx,l.y+.5)}
  else{X.font='bold 8px sans-serif';X.lineWidth=2.5;X.strokeStyle='rgba(0,0,0,.85)';X.strokeText(l.nm,l.lx,l.y);X.fillStyle=T=='h'?'#ff8a8a':T=='p'?'#8fb0ff':'#ffc070';X.fillText(l.nm,l.lx,l.y)}}
 X.strokeStyle='#4a1a1e';X.lineWidth=2;X.strokeRect(mx0,10,MMW,MMH);{const k2=8;X.strokeStyle='#8a1218';X.lineWidth=3;X.beginPath();X.moveTo(mx0,10+k2);X.lineTo(mx0,10);X.lineTo(mx0+k2,10);X.moveTo(mx0+MMW-k2,10);X.lineTo(mx0+MMW,10);X.lineTo(mx0+MMW,10+k2);X.moveTo(mx0,10+MMH-k2);X.lineTo(mx0,10+MMH);X.lineTo(mx0+k2,10+MMH);X.moveTo(mx0+MMW-k2,10+MMH);X.lineTo(mx0+MMW,10+MMH);X.lineTo(mx0+MMW,10+MMH-k2);X.stroke()}
 X.fillStyle='#ff0';for(const[x,y]of IL)X.fillRect(mx0+x*f-1,10+y*f-1,2,2);
 X.fillStyle='#f33';for(const[x,y,k]of ZMM)if(k<3)X.fillRect(mx0+x*30*f-1,10+y*30*f-1,2,2);
 for(const z of s.Z)if(z[2]==3){X.fillStyle=t%400<200?'#f0f':'#fff';X.beginPath();X.arc(mx0+z[0]*f,10+z[1]*f,7,0,7);X.fill();txt('BOSS',mx0+z[0]*f,10+z[1]*f+15,12,'#f0f')}
 if(s.bp){const pl=1+Math.sin(t/120)*.35,bx=mx0+s.bp[0]*f,by=10+s.bp[1]*f;X.strokeStyle='#f33';X.lineWidth=2;X.beginPath();X.arc(bx,by,10*pl,0,7);X.stroke();X.fillStyle=t%300<150?'#f33':'#fff';X.beginPath();X.arc(bx,by,5,0,7);X.fill();txt('!',bx,by+1,9,'#000');txt('BOSS',bx,by+17,11,'#f55')}
 if(s.sh){X.fillStyle=t%600<300?'#fc3':'#fff';X.beginPath();X.arc(mx0+s.sh[0]*f,10+s.sh[1]*f,6,0,7);X.fill();txt('$',mx0+s.sh[0]*f,10+s.sh[1]*f+1,10,'#000')}
 for(const p of s.P){const px=mx0+p[3]*f,py=10+p[4]*f;if(p[7]){const pl=1+Math.sin(t/150)*.3;X.strokeStyle='#f33';X.lineWidth=2;X.beginPath();X.arc(px,py,9*pl,0,7);X.stroke();X.fillStyle='#f33';X.beginPath();X.arc(px,py,4.5,0,7);X.fill();txt('☠',px,py+1,11,'#fff')}else if(p[0]==id){X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.arc(px,py,8,0,7);X.stroke();X.fillStyle=p[2];X.beginPath();X.arc(px,py,5.5,0,7);X.fill();X.fillStyle='#fff';poly(px,py-12,4,3,-1.5708)}else{X.fillStyle=p[2];X.beginPath();X.arc(px,py,3,0,7);X.fill()}}X.restore();drawJoy()}