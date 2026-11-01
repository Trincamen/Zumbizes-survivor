// ---------- 89h-glboss.js — BOSS (zumbi_boss.glb) em 3D reaproveitando as poses do 2D ----------
// SÓ com glLive. Sem a flag (e depois de glKill()) o drawBoss 2D (70-boss.js) continua sendo o único caminho.
// Mesma ideia de 89e-glzumbis.js: o GLB tem 9 nós RÍGIDOS (sem skin: zombie, hips, leg_l, leg_r, torso, head,
// eye_glow, arm_l, arm_r) e 4 clipes TRS (walk/idle/attack/roar). zParse (87-zumbis.js) lê o GLB, zPose/zWorld
// dão as matrizes por nó; montamos UMA tabela de poses (clipe × BG_NPH fases) na 1ª aparição e, por quadro, só
// compomos base·pose por nó. Como o boss é UMA instância, usa-se UM THREE.Mesh por nó (não InstancedMesh).
// Convenção de eixos/posição igual à dos zumbis (89e) e do jogador (89d): Mesh pai em (x,gpH,y) dentro do GLW,
// rotation.y = yaw com o MESMO sentido do 2D (rx=wx·cos+wz·sin, rz=wz·cos−wx·sin).
// Escala: o modelo tem ~2,56 m de altura; rec.S converte metro do modelo -> px do mundo (12,5 px/m no chão ≈ 1:1).
// BOSS_H foi calibrado medindo a projeção real (THREE.Vector3.project na câmera): o boss 3D fica com a MESMA
// altura de tela do drawBoss 2D (~285 px).
// O RENDER é adiado como nos zumbis: glBossFrame() (no glFrame) esconde o modelo, o laço de draw() empurra
// (só se o boss passou no cull v()) e o render acontece em glRenderNow().
const BGLB='@@GLB:assets/zumbis/zumbi_boss_v4.glb@@';
// estado do host (bs) → clipe do GLB. `ms` = duração de UMA volta do clipe em ms (fácil de editar).
// bs: 0 anda · 1/2 agarrando (attack) · 3 prepara investida (roar) · 4 investida (walk acelerado)
//     5 atordoado (idle + corpo girando/cabeça bamba, como o 2D) · 6 emergindo (roar, sobe do chão por `em`)
const BOSS_CLIP={
 0:{c:'walk',ms:1050},
 1:{c:'attack',ms:800},
 2:{c:'attack',ms:800},
 3:{c:'roar',ms:1400},
 4:{c:'walk',ms:585},
 5:{c:'idle',ms:2000},
 6:{c:'roar',ms:1400,emerge:1}
};
// BG_HS = fator medido entre a altura do modelo (Y do mundo) e a altura na TELA (projeção da câmera inclinada
// + a profundidade Z do modelo cisalhada para cima): 1,352. Só entra no cálculo da escala.
const BG_HS=1.352;
const BOSS_H=285; // altura do boss NA TELA em px (o drawBoss 2D mede ~284; o zumbi gordão tem ~69)
const BG_NPH=16;
let BGR,BG_MAT=null,BG_EYE=null,BG_WARN=0;
const _bgB=new THREE.Matrix4(),_bgM=new THREE.Matrix4(),_bgH=new THREE.Matrix4(),
 _bgP=new THREE.Vector3(),_bgQ=new THREE.Quaternion(),_bgS=new THREE.Vector3(),_bgY=new THREE.Vector3(0,1,0);
function bgMat(){return BG_MAT||(BG_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
function bgEyeMat(){return BG_EYE||(BG_EYE=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}))}
// nomes dos nós do GLB (para achar head/eye_glow sem depender do índice)
function bgNames(){try{const {j}=pgParseGlb(BGLB),n={};for(let i=0;i<j.nodes.length;i++)n[j.nodes[i].name]=i;return n}catch(e){return {}}}
function bgBuild(){
 let M;try{M=zParse(BGLB)}catch(e){return null}
 if(!M||!M.NN)return null;
 const rec={M,msh:[],pm:{},head:-1,eye:-1,tri:0,h:0,S:64,build:0};
 // altura de repouso (idle, fase 0) para converter metros do modelo → px de tela
 zPose(M,zClip(M,'idle'),0);zWorld(M);
 let a=1e9,b=-1e9;
 for(let ni=0;ni<M.NN;ni++){const g=M.GEO[ni];if(!g)continue;
  const o=ni*9,R=M.WRT,ty=M.WT[ni*3+1],tz=M.WT[ni*3+2],P=g.P;
  for(let i=0;i<g.n*3;i++){const wy=R[o+3]*P[i*3]+R[o+4]*P[i*3+1]+R[o+5]*P[i*3+2]+ty;if(wy<a)a=wy;if(wy>b)b=wy}}
 rec.h=Math.max(.001,b-a);
 rec.S=BOSS_H/(rec.h*BG_HS);
 const NAMES=bgNames();
 rec.head=NAMES.head!=null?NAMES.head:5;
 rec.eye=NAMES.eye_glow!=null?NAMES.eye_glow:6;
 for(let ni=0;ni<M.NN;ni++){
  if(!M.GEO[ni])continue;
  let geo=null;try{geo=zgGeoNode(M,ni)}catch(e){geo=null}
  if(!geo)continue;
  const msh=new THREE.Mesh(geo,ni===rec.eye?bgEyeMat():bgMat());
  msh.matrixAutoUpdate=false;msh.frustumCulled=false;msh.visible=false;
  GLW.add(msh);rec.msh[ni]=msh;rec.tri+=M.GEO[ni].n}
 // tabela de poses: por clipe usado e BG_NPH fases, uma Matrix4 por nó (nada de esqueleto por quadro)
 for(const cn of ['walk','idle','attack','roar']){
  const clip=zClip(M,cn),phs=[];
  for(let q=0;q<BG_NPH;q++){
   zPose(M,clip,q/BG_NPH);zWorld(M);
   const arr=new Array(M.NN).fill(null),R=M.WRT,Wt=M.WT;
   for(let ni=0;ni<M.NN;ni++){if(!rec.msh[ni])continue;const o=ni*9;
    arr[ni]=new THREE.Matrix4().set(R[o],R[o+1],R[o+2],Wt[ni*3],
      R[o+3],R[o+4],R[o+5],Wt[ni*3+1],
      R[o+6],R[o+7],R[o+8],Wt[ni*3+2],
      0,0,0,1)}
   phs.push(arr)}
  rec.pm[cn]=phs}
 return rec;
}
function bgRec(){
 if(BGR!==undefined)return BGR;
 BGR=bgBuild();
 if(!BGR&&!BG_WARN){BG_WARN=1;console.warn('glboss: falha ao carregar zumbi_boss_v4.glb; fica no 2D')}
 return BGR;
}
// por quadro (chamado no glFrame): esconde o modelo; só o glBossPush do quadro o mostra
function glBossFrame(){
 if(!glLive||!BGR||!BGR.msh)return;
 for(const m of BGR.msh)if(m)m.visible=false;
}
// empurra o boss do quadro (mesma decisão de estado/yaw do drawBoss 2D). Sem alocação por quadro.
function glBossPush(x,y,fa,bs,arm,t,s,em){
 const t0=pfStart();
 if(!glLive){pfAdd('bgl',t0);return 0}
 const rec=bgRec();
 if(!rec){pfAdd('bgl',t0);return 0}
 const tgt=Math.PI/2-fa;
 if(BYAW==null)BYAW=tgt; // BYAW é o global do 70-boss.js (2D e 3D compartilham a suavização)
 BYAW+=ad(tgt,BYAW)*Math.min(1,DT_*9);
 const st=BOSS_CLIP[bs]||BOSS_CLIP[0];
 // emergindo: a fase do clipe é o progresso do `em` (1,3 s), então o rugido toca uma vez enquanto sobe
 const ph=st.emerge?Math.max(0,Math.min(1,1-(em||0)/1.3)):((t/st.ms)%1+1)%1;
 const phq=(ph*BG_NPH|0)%BG_NPH;
 const yaw=bs==5?t/190:BYAW; // atordoado: o 2D gira o corpo todo (psi=t/190)
 let gy=0;if(typeof gpH==='function')gy=gpH(x,y);
 if(st.emerge)gy-=rec.h*rec.S*(1-ph); // sobe do chão (desce a altura inteira do modelo)
 _bgP.set(x,gy,y);_bgQ.setFromAxisAngle(_bgY,yaw);_bgS.set(rec.S,rec.S,rec.S);
 _bgB.compose(_bgP,_bgQ,_bgS);
 const arr=(rec.pm[st.c]||rec.pm.walk)[phq];
 const hshake=bs==5?Math.sin(t/90)*.45:0;
 for(let ni=0;ni<rec.msh.length;ni++){
  const msh=rec.msh[ni];if(!msh)continue;
  const pm=arr&&arr[ni];if(!pm){msh.visible=false;continue}
  _bgM.multiplyMatrices(_bgB,pm);
  if(hshake&&ni===rec.head)_bgM.multiply(_bgH.makeRotationY(hshake));
  msh.matrix.copy(_bgM);msh.matrixWorldNeedsUpdate=true;msh.visible=true}
 pfAdd('bgl',t0);
 return 1;
}
// fim do quadro: nada a publicar (cada Mesh já recebeu a matriz no push); o gancho fica pelo padrão dos 89*
function glBossEnd(){}
// diagnóstico (leitura)
function bgInfo(){const r=BGR;return{ok:!!r,altura:r?+(r.h*r.S*BG_HS).toFixed(1):0,escala:r?+r.S.toFixed(2):0,
 tri:r?r.tri:0,malhas:r?r.msh.filter(Boolean).length:0,
 calls:GLR?GLR.info.render.calls:0,triF:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0}}
if(typeof window!=='undefined')window.__glb=bgInfo;
