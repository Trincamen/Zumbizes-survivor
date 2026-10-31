// ---------- 89d-gljogador.js — jogador e aliados em 3D reaproveitando a POSE do 2D (pgSolve) ----------
// Só com glLive. Sem a flag, no menu (90-sons.js:308) e no ícone da aba (99-iniciar.js:8) o drawPlayer 2D segue igual.
// A pose NÃO é recalculada com AnimationMixer: pgSolve (80-jogador.js) já entrega, por nó rígido (11 nós, sem skin),
// a matriz 3x3 R[ni*9..] e a translação Wt[ni*3..] em metros do GLB, depois do IK da mão esquerda, do crossfade,
// do shoot sobreposto e do yaw suavizado. Aqui cada jogador é um THREE.Group com UMA Mesh por nó:
//   Group em (x,0,y) dentro do GLW, rotation.y = st.yaw (MESMO sentido do 2D: rx=wx·cos+wz·sin, rz=wz·cos−wx·sin)
//   e escala S=27·s px/metro do modelo — a mesma convenção dos props (89b-glprops.js).
//   Mesh.matrixAutoUpdate=false; matrix = [R|Wt] (metros) e matrixWorldNeedsUpdate=true a cada quadro.
// Cores: a máscara K das faces da camisa recebe o.c (igual ao pcC 2D) e a arma usa a geometria WPG[o.w]
// (a mesma do 2D) com o tint de o.gun (pcG); −1 = preto. Material Lambert com vertexColors (igual aos props).
// O RENDER é adiado: glFrame() monta câmera/mundo e glRenderNow() (fim de draw()) desenha já com a pose do quadro,
// senão o modelo ficaria 1 quadro atrás do chão/câmera (tremor). Sem alocação por quadro (geometrias por chave de cor).
const JG_MAP=new Map();
let JG_MAT=null,JG_BASE=null,JG_TOK=0;
function jgMat(){return JG_MAT||(JG_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
// normais por FACE (as malhas do parser do projeto são sopa de triângulos, sem normais/índices)
function jgNrm(P,n,N){for(let f=0;f<n;f++){const b=f*9,
  ux=P[b+3]-P[b],uy=P[b+4]-P[b+1],uz=P[b+5]-P[b+2],vx=P[b+6]-P[b],vy=P[b+7]-P[b+1],vz=P[b+8]-P[b+2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  for(let k=0;k<3;k++){N[b+k*3]=nx;N[b+k*3+1]=ny;N[b+k*3+2]=nz}}}
function jgGeo(P,N,C){const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(P,3));
 g.setAttribute('normal',new THREE.BufferAttribute(N,3));
 g.setAttribute('color',new THREE.BufferAttribute(C,3));
 return g}
// base por nó, montada UMA vez: posição/normal compartilháveis e as listas de faces por máscara de cor
function jgBuild(){
 JG_BASE=[];
 for(let ni=0;ni<PG.NN;ni++){
  const g=PG.GEO[ni];if(!g){JG_BASE[ni]=null;continue}
  const n=g.n,P=new Float32Array(g.P),N=new Float32Array(n*9),C=new Float32Array(n*9),SH=[],GN=[],DK=[];
  jgNrm(P,n,N);
  for(let f=0;f<n;f++){const b=f*9,kk=g.K[f];
   for(let k=0;k<3;k++){C[b+k*3]=g.C[f*3]/255;C[b+k*3+1]=g.C[f*3+1]/255;C[b+k*3+2]=g.C[f*3+2]/255}
   if(kk>0)SH.push(f,kk);else if(kk===-2)GN.push(f);else if(kk===-1)DK.push(f)}
  JG_BASE[ni]={P,N,C,SH,GN,DK};
 }
 return 1;
}
// geometria de um nó PARA UM JOGADOR (camisa/arma coloridas por jogador). Refeita só quando a chave muda.
function jgNodeGeo(ni,w,cc,gg){
 const b=JG_BASE[ni];if(!b)return null;
 if(w>=0){ // arma: MESMA malha do drawPlayer 2D (WPG[o.w]); K −1 preto, −2 cor de o.gun
  const g=(typeof WPG!=='undefined')&&WPG[w];if(!g)return null;
  const m=g.n,pw=new Float32Array(g.P),nw=new Float32Array(m*9),cw=new Float32Array(m*9);
  jgNrm(pw,m,nw);
  for(let f=0;f<m;f++){const kk=g.K[f],q=f*9,qc=f*3;
   for(let k=0;k<3;k++){const c=kk===-1?34:kk===-2?gg[k]:g.C[qc+k];for(let v=0;v<3;v++)cw[q+v*3+k]=c/255}}
  return jgGeo(pw,nw,cw)}
 const P=new Float32Array(b.P),N=new Float32Array(b.N),C=new Float32Array(b.C);
 for(let i=0;i<b.SH.length;i+=2){const kk=b.SH[i+1],q=b.SH[i]*9;
  for(let k=0;k<3;k++)for(let v=0;v<3;v++)C[q+v*3+k]=cc[k]*kk/255}
 for(const f of b.DK){const q=f*9;for(let k=0;k<9;k++)C[q+k]=34/255}
 for(const f of b.GN){const q=f*9;for(let k=0;k<3;k++)for(let v=0;v<3;v++)C[q+v*3+k]=gg[k]/255}
 return jgGeo(P,N,C);
}
function jgObj(k){let p=JG_MAP.get(k);if(p)return p;
 p={grp:new THREE.Group(),msh:[],geo:[],key:[],tok:-1};
 p.grp.visible=false;GLW.add(p.grp);JG_MAP.set(k,p);return p}
// por quadro (chamado no glFrame): novo token; os jogadores não desenhados neste quadro são escondidos no fim
function glJogFrame(){JG_TOK++}
function glJogEnd(){for(const p of JG_MAP.values())if(p.tok!==JG_TOK)p.grp.visible=false}
function drawPlayerGL(x,y,o){
 if(!glLive||!PG||!GLW||typeof pgSolve!=='function'){drawPlayer(x,y,o);return}
 if(!JG_BASE&&!jgBuild()){drawPlayer(x,y,o);return}
 const st=pgSolve(x,y,o),s=o.s||1,S=27*s;
 // boca do cano: o 2D usa x+mrx·S / y−(mry−mrz·K2)·S (altura "cheia"); no 3D a altura aparece como h·sin(55°),
 // então projetamos o ponto de MUNDO (x+mrx·S, y+mrz·S, altura mry·S) com w2s e voltamos às coords do jogo.
 if(!o.dead&&st.mzW){const q=w2s(st.mzW[0],st.mzW[1],st.mzW[2]);st.mz=[q[0]/ZO-ox,q[1]/ZO-oy]}
 const p=jgObj(o.k),cc=rgbOf(pgHex(o.c||'#3a5a8a')),gg=rgbOf(pgHex(o.gun||'#333'));
 const wsel=(typeof WPG!=='undefined'&&WPG[o.w])?o.w:-1;
 p.tok=JG_TOK;p.grp.visible=true;
 p.grp.position.set(x,0,y);p.grp.rotation.y=st.yaw;p.grp.scale.set(S,S,S);
 const R=PG.WRT,Wt=PG.WT;
 for(let ni=0;ni<PG.NN;ni++){
  if(!JG_BASE[ni])continue;
  const own=ni===PG.WS&&wsel>=0,key=own?'w'+wsel+'|'+o.gun:'b|'+o.c;
  let m=p.msh[ni];
  if(!m){m=new THREE.Mesh();m.material=jgMat();m.matrixAutoUpdate=false;m.frustumCulled=false;
   p.grp.add(m);p.msh[ni]=m;p.key[ni]=''}
  if(p.key[ni]!==key){const geo=jgNodeGeo(ni,own?wsel:-1,cc,gg);
   if(p.geo[ni])try{p.geo[ni].dispose()}catch(e){}
   p.geo[ni]=geo;p.key[ni]=key;
   if(geo){m.geometry=geo;m.visible=true}else m.visible=false}
  if(!p.geo[ni])continue;
  const q=ni*9;
  m.matrix.set(R[q],R[q+1],R[q+2],Wt[ni*3],
   R[q+3],R[q+4],R[q+5],Wt[ni*3+1],
   R[q+6],R[q+7],R[q+8],Wt[ni*3+2],
   0,0,0,1);
  m.matrixWorldNeedsUpdate=true;
 }
 // sombra/anel continuam no canvas 2D (por cima), como no drawPlayer 2D; nome, barra e pílula vêm do chamador
 ell(x,y,13*s,5*s,'rgba(0,0,0,.4)');if(o.ring)ell(x,y,18*s,7*s,o.ring,1);
}
// diagnóstico (leitura): jogadores/malhas/triângulos do quadro e stats do renderer
function gljInfo(){let m=0,tri=0;
 for(const p of JG_MAP.values())for(const me of p.msh){if(!me||!me.visible||!me.geometry)continue;
  m++;const pa=me.geometry.attributes.position;if(pa)tri+=pa.count/3|0}
 return {jogadores:JG_MAP.size,malhas:m,tris:tri,calls:GLR?GLR.info.render.calls:0,triF:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0}}
if(typeof window!='undefined')window.__glj=gljInfo;
