// ---------- 89n-glsangue.js — SANGUE: respingos ao acertar e manchas/poças no chão (só 3D) ----------
// O host não manda evento de acerto/morte: o cliente compara snapshots (id do zumbi s.Z[i][6], vida % em [3]).
//  - vida caiu  -> respingo de partículas + mancha pequena no chão;
//  - sumiu DENTRO da tela -> poça grande + manchas satélites (zumbi morto; os que saem da área do snapshot ficam fora da tela, sem sangue).
// Manchas: 1 InstancedMesh (anel de BL_MAX), textura de mancha gerada em canvas (variantes por rotação/escala), sem depthWrite.
const BL_MAX=700;let BL_MESH=null,BL_N=0,BL_TEX=null,BL_MAP=new Map(),BL_LASTHIT=0;
const BL_EXP=new Float64Array(BL_MAX),BL_GEO=new Float32Array(BL_MAX*6); // expira (performance.now, 0=nunca) e [x,h,z,yaw,sx,sz] p/ recompor ao sumir
let BL_LIFE=150000;
const _blM=new THREE.Matrix4(),_blQ=new THREE.Quaternion(),_blP=new THREE.Vector3(),_blS=new THREE.Vector3(),_blY=new THREE.Vector3(0,1,0),_blC=new THREE.Color();
function blTex(){if(BL_TEX)return BL_TEX;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 // mancha irregular: miolo + gotas ao redor
 let seed=7;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const blob=(cx,cy,rad,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.7,'rgba(255,255,255,'+a*.85+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,rad,0,6.283);x.fill()};
 blob(64,64,30,1);for(let i=0;i<9;i++){const a=r()*6.283,d=18+r()*24;blob(64+Math.cos(a)*d,64+Math.sin(a)*d,6+r()*13,.95)}
 for(let i=0;i<14;i++){const a=r()*6.283,d=34+r()*26;blob(64+Math.cos(a)*d,64+Math.sin(a)*d,1.5+r()*3.5,.9)}
 BL_TEX=new THREE.CanvasTexture(c);return BL_TEX}
function blInit(){if(BL_MESH||!GLW)return;
 const g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);
 const m=new THREE.MeshBasicMaterial({map:blTex(),color:0xffffff,transparent:true,opacity:.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 BL_MESH=new THREE.InstancedMesh(g,m,BL_MAX);BL_MESH.frustumCulled=false;BL_MESH.renderOrder=3;
 BL_MESH.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(BL_MAX*3),3);
 _blM.makeScale(0,0,0);for(let i=0;i<BL_MAX;i++)BL_MESH.setMatrixAt(i,_blM);
 GLW.add(BL_MESH)}
// mancha em (x,y) do mundo com raio rad (px); cor sangue escura (verde-escuro p/ k==9 se um dia precisar)
function blSplat(x,y,rad,dark,col,life){if(!glLive||!GLW)return;blInit();if(!BL_MESH)return;
 const i=BL_N++%BL_MAX,h=(typeof gpH==='function'?gpH(x,y):0)+.5+(i%7)*.04,yw=Math.random()*6.283,sx=rad*2*(.8+Math.random()*.5),sz=rad*2*(.8+Math.random()*.5);
 _blQ.setFromAxisAngle(_blY,yw);_blP.set(x,h,y);_blS.set(sx,1,sz);
 _blM.compose(_blP,_blQ,_blS);BL_MESH.setMatrixAt(i,_blM);
 const g=BL_GEO,o=i*6;g[o]=x;g[o+1]=h;g[o+2]=y;g[o+3]=yw;g[o+4]=sx;g[o+5]=sz;BL_EXP[i]=performance.now()+(life||BL_LIFE);
 if(col)_blC.setRGB(col[0],col[1],col[2]);else{const k=dark?.45:.75+Math.random()*.25;_blC.setRGB(.42*k+.06,.02*k,.02*k)}
 BL_MESH.setColorAt(i,_blC);
 BL_MESH.instanceMatrix.needsUpdate=true;BL_MESH.instanceColor.needsUpdate=true}
// por quadro: manchas perto do fim da vida encolhem e somem (só recompõe as que estão sumindo)
function blFrame(){if(!BL_MESH)return;const now=performance.now();let ch=0;
 for(let i=0;i<BL_MAX;i++){const e=BL_EXP[i];if(!e)continue;const left=e-now;if(left>1500)continue;
  const f=Math.max(0,left/1500),g=BL_GEO,o=i*6;_blQ.setFromAxisAngle(_blY,g[o+3]);_blP.set(g[o],g[o+1],g[o+2]);_blS.set(g[o+4]*f,1,g[o+5]*f);_blM.compose(_blP,_blQ,_blS);BL_MESH.setMatrixAt(i,_blM);ch=1;if(f<=0)BL_EXP[i]=0}
 if(ch)BL_MESH.instanceMatrix.needsUpdate=true}
function blSpray(x,y,n,big){if(typeof pts!=='function')return;pts(n,x,y,big?'#7a0a0a':'#9c1212',big?240:170,big?200:120,big?6:4,big?.9:.6)}
let BL_SD=null;
function bloodScan(s){
 if(!glLive||!s||!s.Z)return;
 if(s.sd!==BL_SD){BL_SD=s.sd;BL_N=0;BL_MAP.clear();BL_EXP.fill(0);BL_COR.length=0;if(BL_MESH){_blM.makeScale(0,0,0);for(let i=0;i<BL_MAX;i++)BL_MESH.setMatrixAt(i,_blM);BL_MESH.instanceMatrix.needsUpdate=true}} // partida/mapa novo: limpa o sangue
const now=performance.now(),seen=new Set(),hw=W/2+60,hh=H/2+60;
 for(const z of s.Z){const id=z[6];seen.add(id);const o=BL_MAP.get(id),hp=z[3];
  if(o){if(hp<o.hp-1&&z[2]!=3&&now-o.th>110&&Math.abs(z[0]-cx)<hw&&Math.abs(z[1]-cy)<hh){o.th=now;const d=o.hp-hp;blSpray(z[0],z[1],3+Math.min(6,d/6|0),0);
    if(Math.random()<.55)blSplat(z[0]+(Math.random()-.5)*26,z[1]+(Math.random()-.5)*20,6+Math.min(12,d/3),0)}
   o.x=z[0];o.y=z[1];o.hp=hp;o.k=z[2];o.u=now;o.fa=z[5]/10;o.v=z[4]}
  else BL_MAP.set(id,{x:z[0],y:z[1],hp,k:z[2],th:0,u:now,fa:z[5]/10,v:z[4]})}
 for(const [id,o] of BL_MAP){if(seen.has(id))continue;BL_MAP.delete(id);
  if(Math.abs(o.x-cx)>hw||Math.abs(o.y-cy)>hh)continue; // saiu da área: não é morte visível
  if(o.k==2)continue; // gordão: a gosma já tem o seu próprio efeito
  if(o.k==0||o.k==1||o.k==3||o.k==4)BL_COR.push({x:o.x,y:o.y,k:o.k,v:o.v,fa:o.fa,t0:performance.now(),side:Math.random()<.5?-1:1});if(BL_COR.length>50)BL_COR.shift();
  const big=o.k==3;blSpray(o.x,o.y,big?26:11,1);blSplat(o.x,o.y,big?58:20+Math.random()*8,0);
  for(let i=0;i<(big?7:3);i++){const a=Math.random()*6.283,d=(big?40:14)+Math.random()*(big?80:26);blSplat(o.x+Math.cos(a)*d,o.y+Math.sin(a)*d*.8,(big?10:4)+Math.random()*(big?14:6),0)}}
}

// ---- cadáveres: o zumbi cai de lado (tombo + quique), fica no chão e depois afunda/encolhe e some ----
const BL_COR=[],COR_FALL=.55,COR_STAY=14000,COR_SINK=1200;
function corpseDraw(){if(!glLive||typeof glClipPush!=='function'||!BL_COR.length)return;const now=performance.now();
 for(let i=BL_COR.length-1;i>=0;i--){const c=BL_COR[i],a=(now-c.t0)/1000,tot=COR_FALL+(COR_STAY+COR_SINK)/1000;
  if(a>=tot){BL_COR.splice(i,1);continue}
  if(Math.abs(c.x-cx)>W/2+150||Math.abs(c.y-cy)>H/2+150)continue;
  const k=c.k,scl=k==1||k==4?.9:1,mi=k==4?7:k==1?4:(c.v>0&&c.v<4)?c.v|0:0,th=k==3?20:8; // espessura do corpo (px) para não afundar no chão
  const u=Math.min(1,a/COR_FALL);let roll=c.side*(Math.PI/2)*(u*u);
  if(a>COR_FALL)roll+=c.side*.09*Math.sin((a-COR_FALL)*20)*Math.exp(-(a-COR_FALL)*7);
  let f=1,sink=0;const t2=a-COR_FALL-COR_STAY/1000;if(t2>0){const q=Math.min(1,t2/(COR_SINK/1000));f=1-q;sink=q*6}
  const ayv=th*Math.min(1,Math.abs(roll)*1.3)*scl-sink*(k==3?3:1);
  if(k==3){if(typeof glBossPush=='function')glBossPush(c.x,c.y,c.fa,5,0,now,snap,0,0,roll,ayv,f,Math.PI/2-c.fa)}
  else glClipPush(mi,c.x,c.y,Math.PI/2-c.fa,'idle',0,scl*f,1,0,ayv,roll)}}
