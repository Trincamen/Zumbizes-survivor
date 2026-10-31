// ---------- 88-gl.js — infraestrutura WebGL (three.js) do modo 3D: ?gl=1 ou LS 'gl'=1 ----------
// Sub-etapa 1a: renderer, cena, câmera ortográfica, chão liso e as conversões tela<->mundo.
// Sem a flag (ou se o WebGL falhar) glLive=0 e w2s/s2w devolvem EXATAMENTE o cálculo 2D de sempre.
// PROJEÇÃO: o 2D usa um CISALHAMENTO (tela=(X-0.3h, Y-h)*ZO), que nenhuma câmera rígida reproduz.
// Escolha da 1a: OrthographicCamera inclinada GTLT=55° do eixo vertical + mundo em GLW com Z escalado
// por 1/cos(GTLT). O esticamento em profundidade cancela o encurtamento da câmera, então o CHÃO cai
// exatamente em (x+ox, y+oy)*ZO (sprites 2D de zumbis/jogador continuam alinhados) e a altura h aparece
// como h*sin(GTLT)*ZO (o 2D usa h*ZO; os 18% de diferença de altura ficam para as sub-etapas 1b/1c).
const glOn=/[?&]gl=1(?:&|$)/.test(location.search||'')||LS.get('gl')=='1';
const GTLT=55*Math.PI/180,GLCOS=Math.cos(GTLT),GLSIN=Math.sin(GTLT),GCAMR=30000;
let GLR=null,GLSCN=null,GLCAM=null,GLW=null,GLCV=null,GLBAD=0,glLive=0;
const _gv=new THREE.Vector3(),_gp=new THREE.Vector3(),_gq=new THREE.Vector3();
// mundo -> tela CSS (px). Em 2D: idêntico a (x+ox, y+oy)*ZO.
function w2s(x,y,h){
 if(!glLive)return[(x+ox)*ZO,(y+oy)*ZO];
 _gv.set(x,h||0,y).applyMatrix4(GLW.matrixWorld).project(GLCAM);
 return[(_gv.x+1)*.5*innerWidth,(1-_gv.y)*.5*innerHeight];
}
// tela CSS (px) -> mundo, por raio no plano y=0. Em 2D: idêntico a (sx/ZO-ox, sy/ZO-oy).
function s2w(sx,sy){
 if(!glLive)return[sx/ZO-ox,sy/ZO-oy];
 const nx=sx/innerWidth*2-1,ny=1-sy/innerHeight*2;
 _gp.set(nx,ny,-1).unproject(GLCAM);
 _gq.set(nx,ny,1).unproject(GLCAM).sub(_gp).normalize();
 if(Math.abs(_gq.y)<1e-9)return[sx/ZO-ox,sy/ZO-oy];
 const t=-_gp.y/_gq.y;
 return[_gp.x+_gq.x*t,(_gp.z+_gq.z*t)*GLCOS];
}
function glKill(){
 GLBAD=1;glLive=0;try{if(GLCV)GLCV.style.display='none';document.body.style.background=''}catch(e){}
}
function glInit(){
 if(glLive||GLBAD||!glOn||typeof THREE=='undefined')return glLive;
 const cv=$('glc');if(!cv)return 0;
 try{
  GLR=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false});
  GLR.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  GLR.setSize(innerWidth,innerHeight,false);
  GLCV=cv;cv.style.display='block';document.body.style.background='transparent';
  GLSCN=new THREE.Scene();GLSCN.background=new THREE.Color(0x101a10);
  GLCAM=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,1,GCAMR*3);
  GLCAM.up.set(0,GLSIN,-GLCOS);
  GLW=new THREE.Group();GLW.scale.set(1,1,1/GLCOS);GLSCN.add(GLW);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(30000,30000),new THREE.MeshLambertMaterial({color:0x1b2e16}));
  gr.rotation.x=-Math.PI/2;gr.position.set(MW/2,0,MH/2);GLW.add(gr);
  // 1b-i (correção 5): luz NEUTRA para o chão 3D bater com o 2D — fator ≈1,0 em faces para cima
  // (hemi .8 com céu=chão branco + dir .2) e sem tingir; o tom frio vem do tint/vinheta 2D por cima. Sem sombra.
  GLSCN.add(new THREE.HemisphereLight(0xffffff,0xffffff,.8));
  const dl=new THREE.DirectionalLight(0xffffff,.2);dl.position.set(-.35,1,.55);GLSCN.add(dl);
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();glKill()},false);
  glLive=1;
 }catch(e){glKill()}
 return glLive;
}
function glFrame(){
 if(!glOn||GLBAD)return;
 if(!glLive&&!glInit())return;
 const d=Math.min(window.devicePixelRatio||1,2),cw=innerWidth*d|0,ch=innerHeight*d|0;
 if(GLCV.width!==cw||GLCV.height!==ch){GLR.setPixelRatio(d);GLR.setSize(innerWidth,innerHeight,false)}
 GLCAM.left=-W/2;GLCAM.right=W/2;GLCAM.top=H/2;GLCAM.bottom=-H/2;
 GLCAM.updateProjectionMatrix();
 // usa o centro ROUNDado (ox,oy) do 2D, senão sobra um deslocamento sub-pixel entre as camadas
 const gx=W/2-ox,cyS=(H/2-oy)/GLCOS;
 GLCAM.position.set(gx,GCAMR*GLCOS,cyS+GCAMR*GLSIN);
 GLCAM.lookAt(gx,0,cyS);
 GLCAM.updateMatrixWorld(true);
 if(typeof glMundoFrame=='function')glMundoFrame(); // 89-glmundo.js: chão/ruas/rio/quarteirões por chunk
 if(typeof glPropsFrame=='function')glPropsFrame(); // 89b-glprops.js: props/árvores/carros/caixas instanciados
 if(typeof glPrediosFrame=='function')glPrediosFrame(); // 89c-glpredios.js: prédios h/p/m e galpões 'W'
 GLR.render(GLSCN,GLCAM);
}
if(glOn)glInit();
