// ---------- UI / cliente ----------
function onSnap(s){snap=s;me=s.P.find(p=>p[0]==id);if(s.sd&&s.sd!=curSd){curSd=s.sd;O=genMap(s.sd);BLD=O.B;FIRES=O.FR;DD={};POP={};FL2=[];PT=[]}if(s.I)IL=s.I;if(s.ZM)ZMM=s.ZM;for(const p of s.P){const lv=LVP[p[0]];if(lv!=null&&p[9]>lv)LUE.push({pid:p[0],t:Date.now()});LVP[p[0]]=p[9]}
 $('menu').style.display=s.ph==0?'flex':'none';$('opt').style.display=s.ph==1?'block':'none';if(s.ph!=1)$('opp').style.display='none';if(s.ph==1&&!hintT)hintT=Date.now();if(s.ph==0&&$('s-lobby').style.display!='block')show('lobby');$('end').style.display=s.ph==2?'flex':'none';
 if(s.ph==0){$('pl').innerHTML=s.P.map(p=>`<div style="color:${p[2]}">● ${p[1]}</div>`).join('');$('mp').textContent=minP;$('st').disabled=s.P.length<minP}
 if(s.ph==2){$('er').textContent='Vocês sobreviveram '+fmt(s.gt);$('nb').style.display=host?'':'none'}
 if(s.DS){const n={};for(const i of s.DS)n[i]=1;DD=n}for(const e of s.EV||[])if(e[7]>lastEv){lastEv=e[7];handleEv(e)}
 for(const f of s.F)if(f[5]>lastF){lastF=f[5];const L=Math.hypot(f[2]-f[0],f[3]-f[1]);FXL.push({f,t:Date.now(),life:Math.max(f[4]==4?280:L/SPD[f[4]]*1000+220,650),mz:PGS[f[6]]&&PGS[f[6]].mz?PGS[f[6]].mz.slice():null,own:f[6]===id});sfxShot(f);LSH[f[6]]=Date.now();if(f[6]===id){const qk=[.05,.22,.08,.045,0,.3][f[4]]||0;if(qk>QK)QK=qk}if(f[4]!=4)hitFx(f)}
 {const sh=s.sh,nr=sh&&me&&!me[7]&&Math.hypot(me[3]-sh[0],me[4]-sh[1])<110;$('shop').style.display=nr?'block':'none';
  if(nr){$('shT').textContent='🛒 LOJA — '+sh[2]+'s  •  💰 $'+me[19];const k=JSON.stringify([me[19],me[14].length,me[15]]);if(k!=shKey){shKey=k;$('shB').innerHTML=SH.map((q,i)=>{const pr=q[2]==6?100*2**me[15]:q[1];return`<button style="opacity:${me[19]>=pr?1:.4}" onclick="by(${i})">${q[0]} — $${pr}</button>`}).join('')}}}
 if(lastBn===null)lastBn=s.bn[0];
 if(s.bn[0]!=lastBn){lastBn=s.bn[0];SND.banner(s.bn[2]);const b=$('bn');b.textContent=s.bn[1];b.style.color=s.bn[2]==1?'#f33':s.bn[2]==2?'#fc3':'#fff';b.style.fontSize=(s.bn[2]==1?72:44)*(MOB?.55:1)+'px';b.style.display='block';setTimeout(()=>b.style.display='none',s.bn[2]==1?5000:s.bn[2]?4000:2000)}
 const o=me&&me[13],k=JSON.stringify(o);
 if(k!=skKey){skKey=k;$('sk').innerHTML=o?o.map(i=>`<button onclick="pk(${i})">${SK[i]}</button>`).join(''):''}
 const wk=me?JSON.stringify([me[14],me[16],me[19],me[20]]):'';
 if(wk!=wbKey){wbKey=wk;let h='';if(me){h=`<button class=mbx onpointerdown="dn(event,-1)" style="border-color:#c9a54a;background-color:#0a0a0c"><b style="color:#c9a54a">💰 $${me[19]}</b><br>Soltar $${me[20]}</button><div style="display:flex;flex-direction:column;margin-right:6px"><button class=arr onclick="ar(1)" style="width:34px;height:33px;margin:0 0 4px">▲</button><button class=arr onclick="ar(-1)" style="width:34px;height:33px;margin:0">▼</button></div>`;
  for(let i=0;i<6;i++){const q=me[14][i];h+=q?`<button${q[0]<6?' class=wl':''} style="border-color:${me[16]==i?'#d83a3a':'#4a1a1e'};background-color:${q[0]<6?'#0c0c10':'#160d0d'}${me[16]==i?';box-shadow:0 0 14px #a0141a88':''}" onpointerdown="dn(event,${i})"><i class=kn>${i+1}</i>${q[0]<6?`<img class=wi src="${weaponIcon(q[0])}"><span class=wn style="color:${WC[q[0]]}">${WN[q[0]]}</span><span class=ws>Nv ${q[1]} • ${q[2]}/${magOf(q[0],q[1])}</span>`:`<span class=ci>${CL[q[0]][0]}</span><span class=cn>${CL[q[0]][1]}</span>`}</button>`:`<button disabled>—</button>`}}$('wb').innerHTML=h}
 if(me){const eb=$('wb').children[2+me[16]];if(eb&&eb.style&&eb.style.setProperty){eb.style.setProperty('--rl',(me[22]>0?100-me[22]:0)+'%');eb.style.setProperty('--zs',(me[22]>0?me[27]:0)+'%');eb.style.setProperty('--ze',(me[22]>0?me[28]:0)+'%');eb.style.setProperty('--zc',me[29]?'rgba(200,50,50,.7)':'rgba(60,150,255,.8)')}}
 {const o_=me&&me[23],ok_=JSON.stringify(o_);if(ok_!=ofKey){ofKey=ok_;const e=$('cf');if(o_){e.style.display='block';e.innerHTML=`Pegar <b style="color:${WC[o_[0]]}">${WN[o_[0]]}</b> (Nv ${o_[1]}) e deixar no chão <b style="color:${WC[o_[2]]}">${WN[o_[2]]}</b> (Nv ${o_[3]})?<br><button class=sb onclick="ofr(1)">✔ TROCAR${MOB?'':' (Enter)'}</button><button class=sb style="background:#a33" onclick="ofr(0)">✖ MANTER${MOB?'':' (Esc)'}</button>`}else e.style.display='none'}}}
function ofr(ok){send({t:'o',id,ok})}
function ar(d){send({t:'a',id,d})}function by(i){send({t:'b',id,i})}function pk(i){send({t:'s',id,k:i})}
let dr=null;function dn(e,i){dr={i,x:e.clientX,y:e.clientY,g:null};e.preventDefault()}
addEventListener('pointermove',e=>{if(!dr)return;if(!dr.g&&Math.hypot(e.clientX-dr.x,e.clientY-dr.y)>15){const g=document.createElement('div');g.style.cssText='position:fixed;pointer-events:none;width:56px;height:56px;border-radius:10px;background:#fc3b;border:3px solid #fff;z-index:9;transform:translate(-50%,-50%)';document.body.appendChild(g);dr.g=g}if(dr.g){dr.g.style.left=e.clientX+'px';dr.g.style.top=e.clientY+'px'}});
addEventListener('pointerup',e=>{if(!dr)return;const r=$('wb').getBoundingClientRect();if(dr.g){dr.g.remove();if(e.clientY<r.top-25||e.clientX>r.right+25)send({t:'d',id,n:dr.i})}else if(dr.i>=0)send({t:'u',id,n:dr.i});dr=null});
addEventListener('pointercancel',()=>{if(dr&&dr.g)dr.g.remove();dr=null});
let lastTap=0,joy=null,mvLast=[0,0],mvT0=0,hintT=0,ctl=LS.get('ctl')||'auto';const KS={},JR=()=>(MOB?55:60)*Math.min(1.3,HUDS),wantJoy=e=>ctl=='joy'||(ctl=='auto'&&e.pointerType!='mouse');
const CTL=[['auto','🤖 Automático','celular: joystick • PC: WASD ou setas'],['joy','🕹 Joystick na tela','toque e arraste na metade de baixo'],['tap','👆 Toque para andar','toque onde quer ir (modo antigo)']];
function ctlBtns(){for(const k of['ctl1','ctl2']){const e=$(k);if(e)e.innerHTML=CTL.map(c=>`<button class=sb style="display:block;width:100%;text-align:left;margin:4px 0;background:${ctl==c[0]?'linear-gradient(90deg,#8a1218,#4a0a0e)':'#0a0a0c'};border-color:${ctl==c[0]?'#d83a3a':'#4a1a1e'};transform:none;font:700 15px sans-serif;letter-spacing:0" onclick="setCtl('${c[0]}')">${c[1]}<br><small>${c[2]}</small></button>`).join('')}}
function setCtl(m){ctl=m;LS.set('ctl',m);joy=null;ctlBtns();pushMove()}
function optOpen(){const p=$('opp'),o=p.style.display!='block';p.style.display=o?'block':'none';if(o){$('vol3').value=AU.vol*100;$('mvol3').value=AU.mv*100;ctlBtns()}}
ctlBtns();
function pushMove(){if(!snap||snap.ph!=1)return;let x=0,y=0;
 if(joy){const dx=joy.x-joy.x0,dy=joy.y-joy.y0,L=Math.hypot(dx,dy),R_=JR();if(L>8){const m=Math.min(1,(L-8)/(R_-8));x=dx/L*m;y=dy/L*m}}
 if(!x&&!y){x=(KS.KeyD||KS.ArrowRight?1:0)-(KS.KeyA||KS.ArrowLeft?1:0);y=(KS.KeyS||KS.ArrowDown?1:0)-(KS.KeyW||KS.ArrowUp?1:0);const L=Math.hypot(x,y);if(L>1){x/=L;y/=L}}
 const now=Date.now(),ch=Math.abs(x-mvLast[0])>.06||Math.abs(y-mvLast[1])>.06;
 if(ch||((x||y)&&now-mvT0>200)){mvLast=[x,y];mvT0=now;send({t:'m',id,x:+x.toFixed(2),y:+y.toFixed(2)})}}
C.onpointerdown=e=>{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
 if(!snap||snap.ph!=1)return;const wx=e.clientX/ZO-ox,wy=e.clientY/ZO-oy;
 if(PILL&&Date.now()-PILL.t<250&&wx>PILL.x-16&&wx<PILL.x+PILL.w+16&&wy>PILL.y-26&&wy<PILL.y+PILL.h+26){send({t:'r',id});return}
 if(ctl=='tap'){send({t:'i',id,x:wx,y:wy});return}
 if(wantJoy(e)&&e.clientY>innerHeight*.5&&!joy){joy={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t0:Date.now(),mx:0};try{C.setPointerCapture(e.pointerId)}catch(_){}pushMove();return}
 send({t:'i',id,x:wx,y:wy,f:1})};
C.onpointermove=e=>{if(ctl=='tap'){if(e.buttons||e.pressure>0){const n=Date.now();if(n-lastTap>80){lastTap=n;if(snap&&snap.ph==1)send({t:'i',id,x:e.clientX/ZO-ox,y:e.clientY/ZO-oy})}}return}
 if(joy&&e.pointerId==joy.id){joy.x=e.clientX;joy.y=e.clientY;joy.mx=Math.max(joy.mx,Math.hypot(joy.x-joy.x0,joy.y-joy.y0));pushMove()}};
C.onpointerup=C.onpointercancel=e=>{if(joy&&e.pointerId==joy.id){const j=joy;joy=null;pushMove();if(e.type=='pointerup'&&Date.now()-j.t0<260&&j.mx<12)send({t:'i',id,x:j.x0/ZO-ox,y:j.y0/ZO-oy,f:1})}};
const MK=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||!snap||snap.ph!=1)return;if(e.key=='Escape'){optOpen();return}
 if(me&&me[23]&&(e.code=='Enter'||e.code=='NumpadEnter')){e.preventDefault();ofr(1);return}
 if(me&&me[23]&&e.code=='Escape'){e.preventDefault();ofr(0);return}
 if(e.code=='KeyR'){e.preventDefault();send({t:'r',id});return}
 if(e.code=='KeyX'||(e.code=='Escape'&&!(me&&me[23]))){send({t:'c',id});return}
 const dg=/^(Digit|Numpad)([1-6])$/.exec(e.code);if(dg){e.preventDefault();send({t:'u',id,n:dg[2]-1});return}
 if(!MK.includes(e.code))return;e.preventDefault();KS[e.code]=1;pushMove()});
addEventListener('keyup',e=>{if(KS[e.code]){KS[e.code]=0;pushMove()}});addEventListener('blur',()=>{for(const k in KS)KS[k]=0;joy=null;pushMove()});
setInterval(pushMove,100);
function drawJoy(){X.setTransform(DPR,0,0,DPR,0,0);const R_=JR();
 if(joy){let dx=joy.x-joy.x0,dy=joy.y-joy.y0;const L=Math.hypot(dx,dy);if(L>R_){dx*=R_/L;dy*=R_/L}
  X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=3;X.fillStyle='rgba(255,255,255,.12)';X.beginPath();X.arc(joy.x0,joy.y0,R_,0,7);X.fill();X.stroke();
  X.fillStyle='rgba(255,255,255,.45)';X.beginPath();X.arc(joy.x0+dx,joy.y0+dy,R_*.42,0,7);X.fill();X.stroke()}
 else if(hintT&&Date.now()-hintT<9000&&ctl!='tap'){const m=MOB||ctl=='joy';txt(m?'Toque e arraste na metade de baixo da tela para andar':'Use W A S D ou as setas para andar',innerWidth/2,innerHeight*.78,m?14:20,'rgba(255,255,255,'+(.9-(Date.now()-hintT)/12000)+')')}}