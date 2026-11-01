// ---------- 89o-glbloom.js — BRILHO (bloom) próprio, só 3D ----------
// Cena -> RT (MSAA 4x) -> passe de brilho (limiar) em 1/4 -> blur separável 1/4 e 1/8 -> composição aditiva na tela.
// Só liga em qualidade alta (GQ.scale>=.85); ?bloom=0 desliga, ?bloom=força (padrão .55) ajusta. Sem WebGL2/RT falhando -> render normal.
const BLM_ON=new URLSearchParams(location.search).get('bloom')!=='0',BLM_K=+(new URLSearchParams(location.search).get('bloom'))||.55;
let BLM=null,BLM_FAIL=0;
const BLM_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function blmMat(fs,u){return new THREE.ShaderMaterial({vertexShader:BLM_VS,fragmentShader:fs,uniforms:u,depthTest:false,depthWrite:false})}
function blmBuild(w,h){
 const o={w,h,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),scn:new THREE.Scene()};
 const rt=(a,b,s)=>new THREE.WebGLRenderTarget(Math.max(2,a|0),Math.max(2,b|0),{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,samples:s||0});
 o.rs=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true,samples:4});
 o.b4=rt(w/4,h/4);o.t4=rt(w/4,h/4);o.b8=rt(w/8,h/8);o.t8=rt(w/8,h/8);
 const tri=new THREE.BufferGeometry();tri.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));tri.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,2,0,0,2]),2));
 o.quad=new THREE.Mesh(tri,null);o.quad.frustumCulled=false;o.scn.add(o.quad);
 o.mBright=blmMat('varying vec2 vUv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(.72,1.0,l);gl_FragColor=vec4(c*k,1.);}',{t:{value:null}});
 o.mBlur=blmMat('varying vec2 vUv;uniform sampler2D t;uniform vec2 d;void main(){vec3 s=texture2D(t,vUv).rgb*.227;s+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*.316;s+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*.070;gl_FragColor=vec4(s,1.);}',{t:{value:null},d:{value:new THREE.Vector2()}});
 o.mComp=blmMat('varying vec2 vUv;uniform sampler2D s,a,b;uniform float k;void main(){vec3 c=texture2D(s,vUv).rgb;c+=(texture2D(a,vUv).rgb*.8+texture2D(b,vUv).rgb*1.1)*k;gl_FragColor=vec4(c,1.);}',{s:{value:null},a:{value:null},b:{value:null},k:{value:BLM_K}});
 return o}
function blmPass(o,mat,src,dst){o.quad.material=mat;mat.uniforms.t&&(mat.uniforms.t.value=src);GLR.setRenderTarget(dst);GLR.render(o.scn,o.cam)}
// chamado no lugar de GLR.render(GLSCN,GLCAM); devolve true se renderizou com bloom
function glBloomRender(){
 if(!BLM_ON||BLM_FAIL||GQ.scale<.85||!GLR)return false;
 try{
  const sz=GLR.getDrawingBufferSize(new THREE.Vector2()),w=sz.x|0,h=sz.y|0;if(w<8||h<8)return false;
  if(!BLM||BLM.w!==w||BLM.h!==h){if(BLM)for(const k of ['rs','b4','t4','b8','t8'])BLM[k].dispose();BLM=blmBuild(w,h)}
  const o=BLM;
  GLR.setRenderTarget(o.rs);GLR.render(GLSCN,GLCAM);
  blmPass(o,o.mBright,o.rs.texture,o.b4);
  o.mBlur.uniforms.d.value.set(1/o.b4.width,0);blmPass(o,o.mBlur,o.b4.texture,o.t4);
  o.mBlur.uniforms.d.value.set(0,1/o.b4.height);blmPass(o,o.mBlur,o.t4.texture,o.b4);
  o.mBlur.uniforms.d.value.set(1/o.b8.width,0);blmPass(o,o.mBlur,o.b4.texture,o.t8);
  o.mBlur.uniforms.d.value.set(0,1/o.b8.height);blmPass(o,o.mBlur,o.t8.texture,o.b8);
  o.mComp.uniforms.s.value=o.rs.texture;o.mComp.uniforms.a.value=o.b4.texture;o.mComp.uniforms.b.value=o.b8.texture;
  o.quad.material=o.mComp;GLR.setRenderTarget(null);GLR.render(o.scn,o.cam);
  return true
 }catch(e){BLM_FAIL=1;try{GLR.setRenderTarget(null)}catch(_){}console.warn('bloom desligado:',e);return false}}

// ---- modo LITE automático: se o quadro ficar lento (>~28 ms) por 3 s seguidos, desliga o brilho (bloom) e as luzes dinâmicas (1x, recompila shaders)
// ?lite=1 já abre assim; ?lite=0 nunca degrada. O texto do contador de FPS mostra "LITE" quando ativo.
const GLLITE_Q=new URLSearchParams(location.search).get('lite');let GLLITE=GLLITE_Q==='1',GL_LT=0,GL_LS=0,GL_LN=0;
function glLiteApply(){GLLITE=1;BLM_FAIL=1;if(BLM){for(const k of ['rs','b4','t4','b8','t8'])BLM[k].dispose();BLM=null}
 for(const L of GLPL)L.visible=false;if(GLMZ)GLMZ.visible=false;console.warn('LITE: bloom e luzes dinâmicas desligados (quadro lento)')}
function glLiteCheck(){const n=performance.now();if(GLLITE_Q==='1'&&!GL_LN){GL_LN=1;glLiteApply();return}
 if(GLLITE||GLLITE_Q==='0'||document.hidden){GL_LT=n;return}
 const dt=n-GL_LT;GL_LT=n;if(dt>1000||dt<=0){GL_LS=0;return}
 GL_LS=GL_LS*.95+dt*.05;if(n<8000)return;
 const thr=(typeof FPSL!=='undefined'&&FPSL>0)?Math.max(28,1500/FPSL):28; // respeita o limitador de FPS escolhido
 if(GL_LS>thr){GL_LN++;if(GL_LN>180)glLiteApply()}else GL_LN=Math.max(0,GL_LN-2)}
