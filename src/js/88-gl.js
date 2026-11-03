// ---------- 88-gl.js — infraestrutura WebGL (three.js) do modo 3D: padrão; ?gl=0 desliga ----------
// Sub-etapa 1a: renderer, cena, câmera ortográfica, chão liso e as conversões tela<->mundo.
// Sem a flag (ou se o WebGL falhar) glLive=0 e w2s/s2w devolvem EXATAMENTE o cálculo 2D de sempre.
// PROJEÇÃO: o 2D usa um CISALHAMENTO (tela=(X-0.3h, Y-h)*ZO), que nenhuma câmera rígida reproduz.
// Escolha da 1a: OrthographicCamera inclinada GTLT=55° do eixo vertical + mundo em GLW com Z escalado
// por 1/cos(GTLT). O esticamento em profundidade cancela o encurtamento da câmera, então o CHÃO cai
// exatamente em (x+ox, y+oy)*ZO (sprites 2D de zumbis/jogador continuam alinhados) e a altura h aparece
// como h*sin(GTLT)*ZO (o 2D usa h*ZO; os 18% de diferença de altura ficam para as sub-etapas 1b/1c).
const glOn=!(/[?&]gl=0(?:&|$)/.test(location.search||'')||LS.get('gl')=='0'); // 3D é o PADRÃO (2026-11-01); ?gl=0 ou LS 'gl'=0 força o 2D legado (tag git legado-2d)
const GTLT=55*Math.PI/180,GLCOS=Math.cos(GTLT),GLSIN=Math.sin(GTLT),GCAMR=30000;
let GL_SOFT=0,GL_GPU='',GLR=null,GLMZ=null,GLHEMI=null,GLDIR=null,GLPL=[],GLSCN=null,GLCAM=null,GLW=null,GLCV=null,GLBAD=0,glLive=0;
// MU2-3: tremor (QK) compartilhado — 90-sons.js calcula shx/shy ANTES de glFrame e a camera 3D usa o mesmo
// deslocamento em px de mundo do canvas 2D (sem isso so a camada 2D tremia).
let GL_SHX=0,GL_SHY=0;
// ZSG (?zs=1): câmera PERSPECTIVA de 1ª pessoa (89t-zonaseg.js), no lugar da ortográfica.
// glCamA() = a câmera ativa (em ZSG é a perspectiva; fora, a ortográfica de sempre).
let GLP=null;const glCamA=()=>ZSG&&GLP?GLP:GLCAM;
// GQ (declarado em 00-base.js) = interruptores de QUALIDADE: blob = sombra em disco dos zumbis (89e);
// esfera = esfera translúcida dos itens no chão e halo = brilho aditivo (89f; sem eles o item continua visível);
// scale = passo de resolução aplicado ao DPR (O1-2). M5: fxP = fração de partículas/chamas/fumaça (celular usa
// menos); fx não desliga mais os efeitos 3D desde o M7a (o canvas 2D não é mais fallback na partida).
GQ.fx=1;GQ.fxP=1;
const _gv=new THREE.Vector3(),_gp=new THREE.Vector3(),_gq=new THREE.Vector3();
// mundo -> tela CSS (px). Em 2D: idêntico a (x+ox, y+oy)*ZO.
function w2s(x,y,h){
 if(!glLive)return[(x+ox)*ZO,(y+oy)*ZO];
 _gv.set(x,h||0,y).applyMatrix4(GLW.matrixWorld).project(glCamA());
 return[(_gv.x+1)*.5*innerWidth,(1-_gv.y)*.5*innerHeight];
}
// tela CSS (px) -> mundo, por raio no plano y=0. Em 2D: idêntico a (sx/ZO-ox, sy/ZO-oy).
function s2w(sx,sy){
 if(!glLive)return[sx/ZO-ox,sy/ZO-oy];
 const nx=sx/innerWidth*2-1,ny=1-sy/innerHeight*2;
 _gp.set(nx,ny,-1).unproject(glCamA());
 _gq.set(nx,ny,1).unproject(glCamA()).sub(_gp).normalize();
 if(Math.abs(_gq.y)<1e-9)return[sx/ZO-ox,sy/ZO-oy];
 const t=-_gp.y/_gq.y;
 return[_gp.x+_gq.x*t,(_gp.z+_gq.z*t)*(ZSG?1:GLCOS)];
}
// M7a: esconde/mostra o canvas 2D (#c) conforme a fase. Com glLive e partida em andamento (ph==1) TUDO é 3D+DOM:
// display:none tira a camada da composição e o draw() para de chamar X.* (sem clearRect de tela cheia por quadro).
// No menu (ph==0) e fora da partida o #c volta (redimensionado por rs() se a janela mudou enquanto estava oculto).
let C2D_ON=-1;
function glC2D(on){
 if(!glLive)return;
 on=on?1:0;if(C2D_ON===on)return;C2D_ON=on;
 try{
  if(on){
   if(!NOC2D&&(C.width!==(innerWidth*DPR|0)||C.height!==(innerHeight*DPR|0)))rs();
   C.style.display='block';
  }else C.style.display='none';
 }catch(e){}
}
function glKill(){
 GLBAD=1;glLive=0;try{if(GLCV)GLCV.style.display='none';document.body.style.background=''}catch(e){}
 // M7a: o canvas 2D volta a aparecer (ele é o único desenhista sem glLive)
 try{C.style.display='block';C2D_ON=-1}catch(e){}
 // M1: o HUD migrado para DOM (89g-glhud.js) some junto; o canvas 2D volta a desenhar os blocos 12..16
 try{if(typeof glHudShow==='function')glHudShow(0)}catch(e){}
 // M3: a camada de entrada volta para o canvas 2D (#c)
 try{if(typeof glInp==='function')glInp(0)}catch(e){}
}
function glInit(){
 if(glLive||GLBAD||!glOn||typeof THREE=='undefined')return glLive;
 const cv=$('glc');if(!cv)return 0;
 try{
  // diagnóstico: WebGL por SOFTWARE (sem GPU) é a causa provável do 'estado lento' que persiste entre recargas normais
  try{const tc=document.createElement('canvas'),tg=tc.getContext('webgl2',{failIfMajorPerformanceCaveat:true})||tc.getContext('webgl',{failIfMajorPerformanceCaveat:true});
   GL_SOFT=!tg;if(tg){const le=tg.getExtension('WEBGL_lose_context');if(le)le.loseContext()}}catch(e){GL_SOFT=0}
  GLR=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false});
  try{const g=GLR.getContext(),di=g.getExtension('WEBGL_debug_renderer_info');GL_GPU=(di?g.getParameter(di.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER))||'';
   console.log('GL: '+GL_GPU+(GL_SOFT?' [SOFTWARE]':'')+' | webgl'+(GLR.capabilities.isWebGL2?'2':'1')+' | dpr '+(window.devicePixelRatio||1))}catch(e){}
  GLR.setPixelRatio(Math.min(window.devicePixelRatio||1,2)*GQ.scale);
  GLR.setSize(innerWidth,innerHeight,false);
  GLCV=cv;cv.style.display='block';document.body.style.background='transparent';
  GLSCN=new THREE.Scene();GLSCN.background=new THREE.Color(0x101a10);
  GLCAM=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,1,GCAMR*3);
  GLCAM.up.set(0,GLSIN,-GLCOS);
  GLW=new THREE.Group();GLW.scale.set(1,1,ZSG?1:1/GLCOS);GLSCN.add(GLW); // ZSG: sem a escala do oblíquo
  if(ZSG){ // ZSG: câmera perspectiva (FOV 75°, near 2, far 6000) + hemisfério extra (interior claro)
   GLP=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,2,6000);GLP.up.set(0,1,0);GLSCN.add(GLP);
   GLSCN.add(new THREE.HemisphereLight(0xfff0d8,0x3a2f24,.5));}
  GLW.updateMatrixWorld(true); // w2s() usa GLW.matrixWorld antes do 1º render (o render é adiado p/ o fim do quadro)
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(30000,30000),new THREE.MeshLambertMaterial({color:0x1b2e16}));
  gr.rotation.x=-Math.PI/2;gr.position.set(MW/2,0,MH/2);GLW.add(gr);
  // 1b-i (correção 5): luz NEUTRA para o chão 3D bater com o 2D — fator ≈1,0 em faces para cima
  // (hemi .8 com céu=chão branco + dir .2) e sem tingir; o tom frio vem do tint/vinheta 2D por cima. Sem sombra.
  GLHEMI=new THREE.HemisphereLight(0xffffff,0xffffff,.8);GLSCN.add(GLHEMI);
  const dl=new THREE.DirectionalLight(0xffffff,.2);dl.position.set(-.35,1,.55);GLSCN.add(dl);GLDIR=dl;
  GLMZ=new THREE.PointLight(0xffb060,0,320,1.5);GLW.add(GLMZ); // luz do disparo (89j-glfx.js)
  GLPL=[];for(let i=0;i<4;i++){const L=new THREE.PointLight(0xffd29a,0,420,1.4);GLW.add(L);GLPL.push(L)} // luz dos postes (89m-gldia.js); intensidade 0 de dia
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();glKill()},false);
  glLive=1;
  // M3: clique/toque passam a ir para #inp (cobre a tela, z acima de #c; #c fica sem ponteiro)
  try{if(typeof glInp==='function')glInp(1)}catch(e){}
 }catch(e){glKill()}
 return glLive;
}
function glFrame(){
 if(!glOn||GLBAD)return;
 if(!glLive&&!glInit())return;
 const d=Math.min(window.devicePixelRatio||1,2)*GQ.scale,cw=innerWidth*d|0,ch=innerHeight*d|0;
 if(GLCV.width!==cw||GLCV.height!==ch){GLR.setPixelRatio(d);GLR.setSize(innerWidth,innerHeight,false)}
 GLCAM.left=-W/2;GLCAM.right=W/2;GLCAM.top=H/2;GLCAM.bottom=-H/2;
 GLCAM.updateProjectionMatrix();
 // usa o centro ROUNDado (ox,oy) do 2D, senão sobra um deslocamento sub-pixel entre as camadas
 const gx=W/2-ox-GL_SHX,cyS=(H/2-oy-GL_SHY)/GLCOS;
 GLCAM.position.set(gx,GCAMR*GLCOS,cyS+GCAMR*GLSIN);
 GLCAM.lookAt(gx,0,cyS);
 GLCAM.updateMatrixWorld(true);
 if(typeof glDiaFrame=='function')glDiaFrame(); // 89m-gldia.js: ciclo dia/tarde/noite + luz dos postes
 if(typeof glMontFrame=='function')glMontFrame(); // 89p-glmontanhas.js: montanhas em volta do mapa
 if(typeof glMundoFrame=='function')glMundoFrame(); // 89-glmundo.js: chão/ruas/rio/quarteirões por chunk
 if(typeof glPropsFrame=='function')glPropsFrame(); // 89b-glprops.js: props/árvores/carros/caixas instanciados
 if(typeof glPrediosFrame=='function')glPrediosFrame(); // 89c-glpredios.js: prédios h/p/m e galpões 'W'
 if(typeof glJogFrame=='function')glJogFrame(); // 89d-gljogador.js: novo token; esconde quem nao for desenhado
 if(typeof glZumbiFrame=='function')glZumbiFrame(); // 89e-glzumbis.js: zera as instancias do quadro
 if(typeof glItemFrame=='function')glItemFrame(); // 89f-glitens.js: zera as instancias dos itens do quadro
 if(typeof glBossFrame==='function')glBossFrame(); // 89h-glboss.js: esconde o boss (so o push do quadro o mostra)
 if(ZSG&&typeof zsCam==='function')zsCam(); // 89t-zonaseg.js: câmera de 1ª pessoa (só ?zs=1)
}
// 1c: o render do quadro e ADIADO para o fim de draw() (90-sons.js) porque o jogador 3D so recebe a pose
// DEPOIS de glFrame (drawPlayerGL roda na lista D do 2D). Assim pose, camera e chao sao do mesmo quadro.
function glRenderNow(){
 if(!glLive)return;
 if(ZSG&&typeof zsPre==='function')zsPre(); // 89t: pose do vendedor + etiquetas (antes do render)
 if(typeof glJogEnd=='function')glJogEnd(); // esconde os jogadores nao desenhados neste quadro
 if(typeof glZumbiEnd=='function')glZumbiEnd(); // 89e-glzumbis.js: publica as instancias do quadro
 if(typeof glItemEnd=='function')glItemEnd(); // 89f-glitens.js: publica as instancias dos itens do quadro
 if(typeof glBossEnd==='function')glBossEnd(); // 89h-glboss.js: fecha o boss do quadro
 if(typeof glFxEnd==='function')glFxEnd(); // 89j-glfx.js: publica as instâncias dos efeitos do quadro
 if(typeof glLiteCheck=='function')glLiteCheck();
 if(ZSG&&GLP)GLR.render(GLSCN,GLP); // ZSG: primeira pessoa, sem o passe de bloom
 else if(!(typeof glBloomRender=='function'&&glBloomRender()))GLR.render(GLSCN,GLCAM);
}
if(glOn)glInit();
