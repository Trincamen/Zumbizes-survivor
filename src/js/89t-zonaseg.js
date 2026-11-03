// ---------- 89t-zonaseg.js — ZSG: TESTE em 1ª PESSOA dentro da ÁREA SEGURA ----------
// O QUE É: com a flag ?zs=1 o jogo abre SOZINHO (solo, sem menu/nick/tutorial) dentro do prédio 'r'
// (predio_refugio.glb), com câmera em PRIMEIRA PESSOA, sem zumbis/boss/loja e sem tiro. Serve para ver o
// interior, o vendedor e os lugares dos NPCs futuros (o futuro usa isso na transição entrar/sair da zona).
// COMO ABRIR: no PC local `game.html?zs=1`; no servidor `/?zs=1`. Sem a flag (ZSG=0) este arquivo NÃO FAZ NADA.
// ACRESCENTAR NPC: basta UMA linha em ZS_NPC — {id, fx, fy, tipo}, com fx/fy = fração do retângulo do prédio 'r'
// (fx 0..1 da esquerda p/ direita, fy 0..1 do norte p/ a porta sul). tipo:'vendedor' = corpo do jogador.glb.
const ZS_NPC=[
 {id:'vendedor',fx:.70,fy:.50,tipo:'vendedor'},
 {id:'reservado1',fx:.30,fy:.32,tipo:'ponto'},
 {id:'reservado2',fx:.30,fy:.50,tipo:'ponto'},
 {id:'reservado3',fx:.30,fy:.68,tipo:'ponto'}
];
let ZS_R=null,ZSYAW=-Math.PI/2,ZSPITCH=0,ZSEYE=44,ZSJ=null,ZSL=null;
const ZS_PMAX=80*Math.PI/180;
// posição suavizada do jogador local: a MESMA que o 2D usa (RP é preenchido por sm() no draw)
function zsPos(){const r=RP['p'+id];if(r)return[r.x,r.y];const p=PL[id];return p?[p.x,p.y]:null}
function zsEl(css,txt,id){const e=document.createElement('div');if(css)e.style.cssText=css;if(txt)e.textContent=txt;if(id)e.id=id;document.body.appendChild(e);return e}
// ---------- início automático ----------
function zsBoot(){
 if(!ZSG)return;
 TUT_SKIP=1; // o tutorial nunca abre em ZSG
 document.body.classList.add('zs');
 if(!$('zsx'))zsEl('','','zsx');
 if(!$('zsn'))zsEl('','TESTE 1ª PESSOA — ÁREA SEGURA (Esc libera o mouse)','zsn');
 try{$('nm').value=$('nm').value||'TESTE'}catch(e){}
 try{solo()}catch(e){console.warn('ZSG: solo falhou',e)}
}
if(ZSG)setTimeout(zsBoot,30);
// ---------- câmera (chamada por glFrame em 88-gl.js) ----------
function zsCam(){
 if(!ZSG||!GLP||!snap||snap.ph!=1)return;
 if(!ZS_R)zsBuild();
 const p=zsPos();if(!p)return;
 const cp=Math.cos(ZSPITCH),sp=Math.sin(ZSPITCH);
 GLP.position.set(p[0],ZSEYE,p[1]);
 GLP.lookAt(p[0]-Math.sin(ZSYAW)*cp,ZSEYE+sp,p[1]-Math.cos(ZSYAW)*cp);
 if(GLP.aspect!==innerWidth/innerHeight){GLP.aspect=innerWidth/innerHeight;GLP.updateProjectionMatrix()}
}
// ---------- objetos do interior (vendedor, balcão, pontos reservados) ----------
function zsBuild(){
 const b=BLD.find(q=>q.T=='r');if(!b||!GLW)return;
 // altura dos olhos: medida 1ª vez pela caixa do vendedor já posado (≈90% da altura do jogador.glb em px)
 const base=grBase(b);
 ZS_R={b,ents:[]};
 zsCount(b,base);
 for(const n of ZS_NPC){
  const x=b.x+b.w*n.fx,y=b.y+b.h*n.fy;
  if(n.tipo=='vendedor')zsVend(x,y,base,n.id);else zsRing(x,y,base,n.id);
 }
}
// balcão de madeira escura entre o vendedor e a porta (fachada sul)
function zsCount(b,base){
 const mat=new THREE.MeshLambertMaterial({color:0x4a2f18});
 const t=new THREE.Mesh(new THREE.BoxGeometry(18,22,b.h*.34),mat);
 t.position.set(b.x+b.w*.615,base+11,b.y+b.h*.5);GLW.add(t);
 const top=new THREE.Mesh(new THREE.BoxGeometry(24,4,b.h*.36),new THREE.MeshLambertMaterial({color:0x6b4522}));
 top.position.set(b.x+b.w*.615,base+24,b.y+b.h*.5);GLW.add(top);
 ZS_R.counter=[t,top];
}
function zsVend(x,y,base,idn){
 if(!PG||typeof jgBuild!=='function')return;
 jgBuild();
 const cc=rgbOf(pgHex('#d9822b')),gg=rgbOf(pgHex('#303030'));
 const grp=new THREE.Group();grp.position.set(x,base,y);grp.scale.set(27,27,27);GLW.add(grp); // MESMA escala do drawPlayerGL (27 px/m)
 const msh=[];
 for(let ni=0;ni<PG.NN;ni++){
  if(ni===PG.WS)continue; // sem arma na mão do vendedor
  const geo=jgNodeGeo(ni,-1,cc,gg);if(!geo)continue;
  const m=new THREE.Mesh(geo,jgMat());m.matrixAutoUpdate=false;m.frustumCulled=false;grp.add(m);msh[ni]=m;
 }
 const el=zsEl('','LOJA');el.className='zsl';
 ZS_R.ents.push({tipo:'vendedor',id:idn,grp,msh,x,y,base,fa:Math.PI/2,el,h:62});
}
function zsRing(x,y,base,idn){
 const g=new THREE.RingGeometry(26,34,36);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffb84d,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));
 m.rotation.x=-Math.PI/2;m.position.set(x,base+.8,y);GLW.add(m);
 const el=zsEl('','NPC (reservado)');el.className='zsl';
 ZS_R.ents.push({tipo:'ponto',id:idn,mesh:m,x,y,base,el,h:6,ph:Math.random()*6});
}
// pose do vendedor (jogador.glb, clipe idle_aim) + etiquetas projetadas (chamado por glRenderNow)
function zsPre(){
 if(!ZSG||!ZS_R)return;
 const p=zsPos(),now=Date.now();
 for(const e of ZS_R.ents){
  if(e.tipo=='vendedor'){
   let fa=e.fa;
   if(p){const d=Math.hypot(p[0]-e.x,p[1]-e.y);if(d<500)fa=Math.atan2(p[1]-e.y,p[0]-e.x)}
   let d=fa-e.fa;d=Math.atan2(Math.sin(d),Math.cos(d));e.fa+=d*.08;
   let st=null;
   try{st=pgSolve(e.x,e.y,{k:'zs_'+e.id,s:1,w:-1,c:'#d9822b',idle:1,t:now,fa:e.fa})}catch(_){}
   if(st){e.grp.rotation.y=st.yaw;
    const R=PG.WRT,Wt=PG.WT;
    for(let ni=0;ni<PG.NN;ni++){const m=e.msh[ni];if(!m)continue;const q=ni*9;
     m.matrix.set(R[q],R[q+1],R[q+2],Wt[ni*3],R[q+3],R[q+4],R[q+5],Wt[ni*3+1],R[q+6],R[q+7],R[q+8],Wt[ni*3+2],0,0,0,1);
     m.matrixWorldNeedsUpdate=true}
    if(!ZS_R.eye){e.grp.updateMatrixWorld(true);try{const bb=new THREE.Box3().setFromObject(e.grp),hh=bb.max.y-bb.min.y;if(hh>8){ZSEYE=Math.max(18,hh*.9);ZS_R.eye=1}}catch(_){}}}
  }else if(e.mesh){
   const k=.5+.18*Math.sin(now/700+e.ph);
   e.mesh.material.opacity=k;
  }
 }
 zsLabs();
}
// id do ponto reservado mais próximo do centro da tela (só ele mostra a etiqueta)
let nearP='';
// etiquetas: "LOJA" sobre o vendedor e "NPC (reservado)" quando o jogador olha o ponto de perto (<400 px)
function zsLabs(){
 if(!ZS_R)return;
 const cxp=innerWidth/2,cyp=innerHeight/2;
 nearP='';
 let nd=400;
 for(const e of ZS_R.ents){if(!e.el||e.tipo!='ponto')continue;
  const q=w2s(e.x,e.y,e.h),dd=Math.hypot(q[0]-cxp,q[1]-cyp);
  if(dd<nd){nd=dd;nearP=e.id}}
 for(const e of ZS_R.ents){
  if(!e.el)continue;
  const p=zsPos(),front=p?(e.x-p[0])*(-Math.sin(ZSYAW))+(e.y-p[1])*(-Math.cos(ZSYAW)):1;
  const q=w2s(e.x,e.y,e.h);
  const dx=q[0]-cxp,dy=q[1]-cyp,dd=Math.hypot(dx,dy);
  const show=front>0&&(e.tipo=='vendedor'?dd<Math.min(innerWidth,innerHeight)*.75:dd<400&&e.id===nearP);
  e.el.style.display=show?'block':'none';
  if(show){e.el.style.left=q[0].toFixed(0)+'px';e.el.style.top=q[1].toFixed(0)+'px'}
 }
}
// ---------- controle: PC (pointer lock + WASD) e celular (joystick esq. + arrastar dir.) ----------
function zsLock(){
 if(document.pointerLockElement)return;
 const c=$('inp')||document.body;
 try{const r=c.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}
}
addEventListener('mousemove',e=>{
 if(!ZSG||!document.pointerLockElement)return;
 ZSYAW-=e.movementX*.0026;
 ZSPITCH=Math.max(-ZS_PMAX,Math.min(ZS_PMAX,ZSPITCH-e.movementY*.0026));
});
addEventListener('pointerlockchange',()=>{if(ZSG&&!document.pointerLockElement&&$('zsn'))$('zsn').style.opacity=.7;else if($('zsn'))$('zsn').style.opacity=1});
// arrastar para girar (celular) e joystick na metade esquerda
function zsPD(e){
 if(!ZSG)return;
 if(e.pointerType=='mouse'){zsLock();return}
 if(e.clientX<innerWidth*.5&&!ZSJ){ZSJ={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){};zsPush();return}
 if(!ZSL){ZSL={id:e.pointerId,x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}}
}
function zsPM(e){
 if(!ZSG)return;
 if(ZSJ&&e.pointerId==ZSJ.id){ZSJ.x=e.clientX;ZSJ.y=e.clientY;zsPush()}
 else if(ZSL&&e.pointerId==ZSL.id){
  ZSYAW-=(e.clientX-ZSL.x)*.006;
  ZSPITCH=Math.max(-ZS_PMAX,Math.min(ZS_PMAX,ZSPITCH-(e.clientY-ZSL.y)*.006));
  ZSL.x=e.clientX;ZSL.y=e.clientY;
 }
}
function zsPU(e){
 if(ZSJ&&e.pointerId==ZSJ.id){ZSJ=null;zsPush()}
 if(ZSL&&e.pointerId==ZSL.id)ZSL=null;
}
// substitui pushMove: o mesmo send({t:'m'}) de sempre, mas com o vetor girado pelo yaw (andar relativo ao olhar)
function zsPush(){
 if(!snap||snap.ph!=1)return;
 let f=0,s=0;
 if(ZSJ){const dx=ZSJ.x-ZSJ.x0,dy=ZSJ.y-ZSJ.y0,L=Math.hypot(dx,dy),R_=MOB?55:60;
  if(L>8){const m=Math.min(1,(L-8)/Math.max(1,R_-8));s=dx/L*m;f=-dy/L*m}}
 else{
  f=(KS.KeyW||KS.ArrowUp?1:0)-(KS.KeyS||KS.ArrowDown?1:0);
  s=(KS.KeyD||KS.ArrowRight?1:0)-(KS.KeyA||KS.ArrowLeft?1:0);
  const L=Math.hypot(f,s);if(L>1){f/=L;s/=L}
 }
 const cy=Math.cos(ZSYAW),sy=Math.sin(ZSYAW);
 const wx=f*(-sy)+s*cy,wy=f*(-cy)+s*(-sy);
 const now=Date.now(),ch=Math.abs(wx-mvLast[0])>.06||Math.abs(wy-mvLast[1])>.06;
 if(ch||((wx||wy)&&now-mvT0>200)){mvLast=[wx,wy];mvT0=now;send({t:'m',id,x:+wx.toFixed(2),y:+wy.toFixed(2)})}
}
if(ZSG){
 const _drawPlayerGL=drawPlayerGL;
 drawPlayerGL=function(x,y,o){if(ZSG&&o&&o.k===id)return;return _drawPlayerGL(x,y,o)};
 C.onpointerdown=zsPD;C.onpointermove=zsPM;C.onpointerup=C.onpointercancel=zsPU;
 const I=$('inp');if(I){I.onpointerdown=zsPD;I.onpointermove=zsPM;I.onpointerup=I.onpointercancel=zsPU}
}
// diagnóstico (leitura, usado pelos testes)
if(typeof window!=='undefined')window.__zsg=()=>({on:ZSG?1:0,yaw:ZSYAW,pitch:ZSPITCH,eye:ZSEYE,built:ZS_R?1:0,
 ents:ZS_R?ZS_R.ents.map(e=>e.tipo+':'+e.id):[],cam:GLP?[+GLP.position.x.toFixed(1),+GLP.position.y.toFixed(1),+GLP.position.z.toFixed(1)]:null,
 z:[Z.length,PL[id]?Math.round(PL[id].x):0,PL[id]?Math.round(PL[id].y):0]});
