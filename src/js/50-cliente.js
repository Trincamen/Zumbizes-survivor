// ---------- UI / cliente ----------
let PING=-1,PING_K=0;
setInterval(()=>{if(!host&&ws&&ws.readyState===1)try{send({t:'pg',id,k:Math.round(performance.now())})}catch(e){}},1500); // ping: o host devolve o carimbo no snapshot
function specHud(s){let e=document.getElementById('gspec');if(!e){e=document.createElement('div');e.id='gspec';e.style.cssText='position:fixed;left:50%;bottom:9%;transform:translateX(-50%);z-index:5;pointer-events:none;color:#e8d9b0;font:700 18px sans-serif;text-shadow:0 2px 6px #000;letter-spacing:1px;display:none';document.body.appendChild(e)}
 const m=s.ph==1&&me&&me[7]&&s.sp?s.P.find(p=>p[0]==s.sp):null,t=m?'ESPECTANDO: '+m[1]+'   (\u2190 \u2192 ou toque para trocar)':'';if(e.dataset.t!==t){e.dataset.t=t;e.textContent=t;e.style.display=t?'block':'none'}}
function onSnap(s){snap=s;if(s.pk&&s.pk!==PING_K){PING_K=s.pk;PING=Math.max(0,Math.round(performance.now()-s.pk))}me=s.P.find(p=>p[0]==id);specHud(s);if(typeof tutCheck=='function')tutCheck(s);if(s.sd&&s.sd!=curSd){curSd=s.sd;O=genMap(s.sd);BLD=O.B;buildOB();DECOR=genDecor(s.sd);decorObs();buildOB();FIRES=O.FR;DD={};POP={};FL2=[];PT=[]}if(s.I){IL=s.I;const ks={};for(const e of IL)ks[e[4]]=1;for(const u in ITD)if(!ks[u])delete ITD[u]}if(s.ZM)ZMM=s.ZM;for(const p of s.P){const lv=LVP[p[0]];if(lv!=null&&p[9]>lv)LUE.push({pid:p[0],t:Date.now()});LVP[p[0]]=p[9]}
 $('menu').style.display=s.ph==0?'flex':'none';$('opt').style.display=s.ph==1?'block':'none';if(s.ph!=1)$('opp').style.display='none';if(s.ph==1&&!hintT)hintT=Date.now();if(s.ph==0&&$('s-lobby').style.display!='block')show('lobby');$('end').style.display=s.ph==2?'flex':'none';
 if(s.ph==0){$('pl').innerHTML=s.P.map(p=>`<div style="color:${p[2]}">● ${p[1]}</div>`).join('');$('mp').textContent=minP;$('st').disabled=s.P.length<minP}
 if(s.ph==2){$('er').textContent='Vocês sobreviveram '+fmt(s.gt);$('nb').style.display=host?'':'none'}
 if(s.G)fatBoomScan(s.G);
 if(typeof bloodScan=='function')bloodScan(s);
 if(s.DS){const n={};for(const i of s.DS)n[i]=1;DD=n}for(const e of s.EV||[])if(e[7]>lastEv){lastEv=e[7];handleEv(e)}
 for(const f of s.F)if(f[5]>lastF){lastF=f[5];const L=Math.hypot(f[2]-f[0],f[3]-f[1]);FXL.push({f,t:Date.now(),life:f[4]==4?400:Math.max(L/SPD[f[4]]*1000+220,f[4]==1||f[4]==5?1300:650),mz:PGS[f[6]]&&PGS[f[6]].mz?PGS[f[6]].mz.slice():null,mw:PGS[f[6]]&&PGS[f[6]].mzW?PGS[f[6]].mzW.slice():null,own:f[6]===id});sfxShot(f);LSH[f[6]]=Date.now();if(f[6]===id){const qk=[.05,.22,.08,.045,0,.3][f[4]]||0;if(qk>QK)QK=qk}if(f[4]!=4)hitFx(f)}
 {const sh=s.sh,nr=sh&&me&&!me[7]&&Math.hypot(me[3]-sh[0],me[4]-sh[1])<110;$('shop').style.display=nr?'block':'none';
  if(nr){$('shT').textContent='LOJA — '+sh[2]+'s  •  $'+me[19];const k=JSON.stringify([me[19],me[14].length,me[15]]);if(k!=shKey){shKey=k;$('shB').innerHTML=SH.map((q,i)=>{const pr=q[2]==6?100*2**me[15]:q[1];return`<button style="opacity:${me[19]>=pr?1:.4}" onclick="by(${i})">${q[0]} — $${pr}</button>`}).join('')}}}
 if(lastBn===null)lastBn=s.bn[0];
 if(s.bn[0]!=lastBn){lastBn=s.bn[0];SND.banner(s.bn[2]);const b=$('bn');b.textContent=s.bn[1];b.style.color=s.bn[2]==1?'#f33':s.bn[2]==2?'#fc3':'#fff';b.style.fontSize=(s.bn[2]==1?72:44)*(MOB?.55:1)+'px';b.style.display='block';setTimeout(()=>b.style.display='none',s.bn[2]==1?5000:s.bn[2]?4000:2000)}
 const o=me&&me[13],k=JSON.stringify(o);
 if(k!=skKey){skKey=k;$('sk').innerHTML=o?o.map(i=>`<button onclick="pk(${i})">${SK[i]}</button>`).join(''):''}
 const wk=me?JSON.stringify([me[14],me[16],me[19],me[20]]):'';
 if(wk!=wbKey){wbKey=wk;let h='';if(me){h=`<button class=mbx onpointerdown="dn(event,-1)" style="border-color:#c9a54a;background-color:#0a0a0c"><img class=mic src="${weaponIcon(6)}"><b style="color:#c9a54a">$${me[19]}</b><br>Soltar $${me[20]}</button><div style="display:flex;flex-direction:column;margin-right:6px"><button class=arr onclick="ar(1)" style="width:34px;height:33px;margin:0 0 4px">▲</button><button class=arr onclick="ar(-1)" style="width:34px;height:33px;margin:0">▼</button></div>`;
  for(let i=0;i<6;i++){const q=me[14][i];h+=q?`<button${q[0]<6?' class=wl':''} style="border-color:${me[16]==i?'#c9a54a':'#3a3226'};background-color:${q[0]<6?'#0c0c10':'#14110d'}${me[16]==i?';box-shadow:0 0 14px #8a6f3588':''}" onpointerdown="dn(event,${i})"><i class=kn>${i+1}</i>${q[0]<6?`<img class=wi src="${weaponIcon(q[0])}"><span class=wn style="color:${WC[q[0]]}">${WN[q[0]]}</span><span class=ws>Nv ${q[1]} • ${q[2]}/${magOf(q[0],q[1])}</span><div class=rlp><i class=rlf></i><i class=rlz></i><i class=rlc></i></div>`:`${HI[q[0]]!=null&&WICON!==undefined&&weaponIcon(HI[q[0]])?`<img class=wi src="${weaponIcon(HI[q[0]])}">`:`<span class=ci>${CL[q[0]][0]}</span>`}<span class=cn>${CL[q[0]][1]}</span>`}</button>`:`<button disabled>—</button>`}}$('wb').innerHTML=h;optPos()}
 if(me){const eb=$('wb').children[2+me[16]];if(eb&&eb.style&&eb.style.setProperty){const rp=eb.querySelector('.rlp');if(rp){if(me[22]>0){rp.style.display='block';const pp=(typeof RLV!='undefined'&&RLV.t&&performance.now()-RLV.t<250)?RLV.f:1-me[22]/100;rp.style.setProperty('--p',pp.toFixed(3));rp.style.setProperty('--zl',me[27]+'%');rp.style.setProperty('--zw',(me[28]-me[27])+'%')}else rp.style.display='none'}eb.style.setProperty('--zc',me[29]?'rgba(200,50,50,.7)':'rgba(60,150,255,.8)')}}
 {const o_=me&&me[23],ok_=JSON.stringify(o_);if(ok_!=ofKey){ofKey=ok_;const e=$('cf');if(o_){e.style.display='block';e.innerHTML=`Pegar <b style="color:${WC[o_[0]]}">${WN[o_[0]]}</b> (Nv ${o_[1]}) e deixar no chão <b style="color:${WC[o_[2]]}">${WN[o_[2]]}</b> (Nv ${o_[3]})?<br><button class=sb onclick="ofr(1)">TROCAR${MOB?'':' (Enter)'}</button><button class=sb style="background:#6a5428" onclick="ofr(0)">MANTER${MOB?'':' (Esc)'}</button>`}else e.style.display='none'}}}
function ofr(ok){send({t:'o',id,ok})}
function ar(d){send({t:'a',id,d})}function by(i){send({t:'b',id,i})}function pk(i){send({t:'s',id,k:i})}
let dr=null;function dn(e,i){dr={i,x:e.clientX,y:e.clientY,g:null};e.preventDefault()}
addEventListener('pointermove',e=>{if(!dr)return;if(!dr.g&&Math.hypot(e.clientX-dr.x,e.clientY-dr.y)>15){const g=document.createElement('div');g.style.cssText='position:fixed;pointer-events:none;width:56px;height:56px;border-radius:10px;background:#fc3b;border:3px solid #fff;z-index:9;transform:translate(-50%,-50%)';document.body.appendChild(g);dr.g=g}if(dr.g){dr.g.style.left=e.clientX+'px';dr.g.style.top=e.clientY+'px'}});
addEventListener('pointerup',e=>{if(!dr)return;const r=$('wb').getBoundingClientRect();if(dr.g){dr.g.remove();if(e.clientY<r.top-25||e.clientX>r.right+25)send({t:'d',id,n:dr.i})}else if(dr.i>=0)send({t:'u',id,n:dr.i});dr=null});
addEventListener('pointercancel',()=>{if(dr&&dr.g)dr.g.remove();dr=null});
const RLS={},RLH={},RLH0={},RLV={f:null,t:0};function rlSend(){return RLV.f!=null&&performance.now()-RLV.t<400?+RLV.f.toFixed(3):undefined}
let sec2=null,lastTap=0,joy=null,mvLast=[0,0],mvT0=0,hintT=0,ctl=LS.get('ctl')||'auto';const KS={},JR=()=>(MOB?55:60)*Math.min(1.3,HUDS),wantJoy=e=>ctl=='joy'||(ctl=='auto'&&e.pointerType!='mouse');
const CTL=[['auto','Automático','celular: joystick • PC: WASD ou setas'],['joy','Joystick na tela','toque e arraste na metade de baixo'],['tap','Toque para andar','toque onde quer ir (modo antigo)']];
function ctlBtns(){for(const k of['ctl1','ctl2']){const e=$(k);if(e)e.innerHTML=CTL.map(c=>`<button class=sb style="display:block;width:100%;text-align:left;margin:4px 0;background:${ctl==c[0]?'linear-gradient(90deg,#8a6f35,#2a2218)':'#0a0a0c'};border-color:${ctl==c[0]?'#c9a54a':'#3a3226'};transform:none;font:700 15px Dracutaz,sans-serif;letter-spacing:0" onclick="setCtl('${c[0]}')">${c[1]}<br><small>${c[2]}</small></button>`).join('')}}
function setCtl(m){ctl=m;LS.set('ctl',m);joy=null;ctlBtns();pushMove()}
function optPos(){const o=$('opt'),w=$('wb');if(o&&w){const r=w.getBoundingClientRect();o.style.left=(r.right+8)+'px';o.style.right='auto'}}addEventListener('resize',optPos);
function optOpen(){const p=$('opp'),o=p.style.display!='block';p.style.display=o?'block':'none';if(o){$('vol3').value=AU.vol*100;$('mvol3').value=AU.mv*100;ctlBtns()}}
ctlBtns();
function pushMove(){if(TUT_ON)return;if(!snap||snap.ph!=1)return;let x=0,y=0;
 if(joy){const dx=joy.x-joy.x0,dy=joy.y-joy.y0,L=Math.hypot(dx,dy),R_=JR();if(L>8){const m=Math.min(1,(L-8)/(R_-8));x=dx/L*m;y=dy/L*m}}
 if(!x&&!y){x=(KS.KeyD||KS.ArrowRight?1:0)-(KS.KeyA||KS.ArrowLeft?1:0);y=(KS.KeyS||KS.ArrowDown?1:0)-(KS.KeyW||KS.ArrowUp?1:0);const L=Math.hypot(x,y);if(L>1){x/=L;y/=L}}
 const now=Date.now(),ch=Math.abs(x-mvLast[0])>.06||Math.abs(y-mvLast[1])>.06;
 if(ch||((x||y)&&now-mvT0>200)){mvLast=[x,y];mvT0=now;send({t:'m',id,x:+x.toFixed(2),y:+y.toFixed(2)})}}
// M3: handlers de ponteiro em funções nomeadas, usados pelo canvas 2D (#c) E pela camada #inp do modo GL
function onPD(e){if(TUT_ON)return;if(me&&me[7]&&snap&&snap.ph==1&&e.target&&e.target.id!='opt')send({t:'sp',id,d:1});if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
 if(!snap||snap.ph!=1)return;const[_wx,_wy]=s2w(e.clientX,e.clientY),wx=_wx,wy=_wy;
 const rel=!!(me&&!me[7]&&me[22]>0);
 if(rel&&e.pointerType=='touch')send({t:'r',id,f:rlSend()}); // celular: tocar em QUALQUER lugar da tela é o toque da recarga ativa
 if(joy&&e.pointerId!=joy.id&&e.pointerType=='touch'&&!rel&&me&&!me[7]){sec2={id:e.pointerId,done:0};sec2.tm=setTimeout(()=>{if(sec2&&sec2.id==e.pointerId){sec2.done=1;useHeal()}},380);try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}return} // 2o dedo andando: toque = próxima arma, segurar = usar vida
 if(PILL&&Date.now()-PILL.t<250&&wx>PILL.x-16&&wx<PILL.x+PILL.w+16&&wy>PILL.y-26&&wy<PILL.y+PILL.h+26){send({t:'r',id,f:rlSend()});return}
 if(ctl=='tap'){send({t:'i',id,x:wx,y:wy});return}
 if(wantJoy(e)&&e.clientY>innerHeight*.5&&!joy){joy={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:Date.now(),mx:0};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}pushMove();return}
 send({t:'i',id,x:wx,y:wy,f:1})}
function onPM(e){if(TUT_ON)return;if(ctl=='tap'){if(e.buttons||e.pressure>0){const n=Date.now();if(n-lastTap>80){lastTap=n;if(snap&&snap.ph==1){const[_tx,_ty]=s2w(e.clientX,e.clientY);send({t:'i',id,x:_tx,y:_ty})}}}return}
 if(joy&&e.pointerId==joy.id){joy.x=e.clientX;joy.y=e.clientY;joy.mx=Math.max(joy.mx,Math.hypot(joy.x-joy.x0,joy.y-joy.y0));pushMove()}}
function cycleWeapon(){if(!me)return;const s=me[14],cs=me[16];for(let k=1;k<s.length;k++){const i=(cs+k)%s.length;if(s[i]&&s[i][0]<6){send({t:'u',id,n:i});return}}}
function useHeal(){if(!me||me[5]>=me[6])return;const s=me[14];for(let i=0;i<s.length;i++)if(s[i]&&(s[i][0]==10||s[i][0]==12)){send({t:'u',id,n:i});return}}
function onPU(e){if(sec2&&e.pointerId==sec2.id){clearTimeout(sec2.tm);const d=sec2.done;sec2=null;if(!d&&e.type=='pointerup')cycleWeapon();return}if(joy&&e.pointerId==joy.id){const j=joy;joy=null;pushMove();if(e.type=='pointerup'&&Date.now()-j.t0<260&&j.mx<12){const[_jx,_jy]=s2w(j.x0,j.y0);send({t:'i',id,x:_jx,y:_jy,f:1})}}}
C.onpointerdown=onPD;C.onpointermove=onPM;C.onpointerup=C.onpointercancel=onPU;
{const I=$('inp');if(I){I.onpointerdown=onPD;I.onpointermove=onPM;I.onpointerup=I.onpointercancel=onPU}}
// com glLive a entrada vai para #inp (cobre a tela); o canvas 2D pode ficar 1x1 (c2d=0) sem perder clique/toque
function glInp(v){try{const I=$('inp');if(I)I.style.display=v?'block':'none';C.style.pointerEvents=v?'none':''}catch(e){}}
const MK=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||!snap||snap.ph!=1)return;if(TUT_ON)return;if(e.key=='Escape'){optOpen();return}
 if(me&&me[7]&&(e.code=='ArrowLeft'||e.code=='ArrowRight')){e.preventDefault();send({t:'sp',id,d:e.code=='ArrowLeft'?-1:1});return}
 if(me&&me[23]&&(e.code=='Enter'||e.code=='NumpadEnter')){e.preventDefault();ofr(1);return}
 if(me&&me[23]&&e.code=='Escape'){e.preventDefault();ofr(0);return}
 if(e.code=='KeyR'){e.preventDefault();send({t:'r',id,f:rlSend()});return}
 if(e.code=='KeyX'||(e.code=='Escape'&&!(me&&me[23]))){send({t:'c',id});return}
 const dg=/^(Digit|Numpad)([1-6])$/.exec(e.code);if(dg){e.preventDefault();send({t:'u',id,n:dg[2]-1});return}
 if(!MK.includes(e.code))return;e.preventDefault();KS[e.code]=1;pushMove()});
addEventListener('keyup',e=>{if(KS[e.code]){KS[e.code]=0;pushMove()}});addEventListener('blur',()=>{for(const k in KS)KS[k]=0;joy=null;pushMove()});
setInterval(pushMove,100);
function drawJoy(){if(glLive)return; // M3: com GL o joystick e a dica são DOM (ghJoy, 89g-glhud.js)
 X.setTransform(DPR,0,0,DPR,0,0);const R_=JR();
 if(joy){let dx=joy.x-joy.x0,dy=joy.y-joy.y0;const L=Math.hypot(dx,dy);if(L>R_){dx*=R_/L;dy*=R_/L}
  X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=3;X.fillStyle='rgba(255,255,255,.12)';X.beginPath();X.arc(joy.x0,joy.y0,R_,0,7);X.fill();X.stroke();
  X.fillStyle='rgba(255,255,255,.45)';X.beginPath();X.arc(joy.x0+dx,joy.y0+dy,R_*.42,0,7);X.fill();X.stroke()}
 else if(hintT&&Date.now()-hintT<9000&&ctl!='tap'){const m=MOB||ctl=='joy';txt(m?'Toque e arraste na metade de baixo da tela para andar':'Use W A S D ou as setas para andar',innerWidth/2,innerHeight*.78,m?14:20,'rgba(255,255,255,'+(.9-(Date.now()-hintT)/12000)+')')}}
// suavização dos itens puxados pelo ímã: o host manda a posição ~30x/s; aqui cada item desliza até ela a cada quadro
const ITD={};let ILT=0;
function ilSmooth(){const n=performance.now(),a=1-Math.exp(-Math.min(.1,(n-ILT)/1000)*16);ILT=n;
 for(const e of IL){if(e[4]==null)continue;if(e[5]===undefined){e[5]=e[0];e[6]=e[1]}
  let d=ITD[e[4]];if(!d){ITD[e[4]]={x:e[0],y:e[1]};continue}
  if(Math.abs(e[5]-d.x)+Math.abs(e[6]-d.y)>250){d.x=e[5];d.y=e[6]}else{d.x+=(e[5]-d.x)*a;d.y+=(e[6]-d.y)*a}
  e[0]=d.x;e[1]=d.y}}
