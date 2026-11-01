// ---------- 89m-gldia.js — CICLO DIA / TARDE / NOITE + luz dos postes (só 3D) ----------
// Relógio: tempo de partida (snap.gt, suavizado entre snapshots) / DN_CICLO. Fases (u 0..1): 0–.25 DIA · .40–.50 TARDE · .62–.90 NOITE, com transições suaves.
// Teste: ?hora=0..1 trava a hora (0 dia, .45 tarde, .75 noite); ?ciclo=SEG muda a duração do ciclo.
// Postes (poste_luz, índice 8 de CENGLB; o quebrado não acende): à noite ganham (1) poça de luz aditiva no chão, (2) brilho na lâmpada
// (THREE.Points, 1 draw call) e (3) 4 PointLights fixas nos postes mais perto da câmera (iluminam jogadores/zumbis/props).
const DN_CICLO=+(new URLSearchParams(location.search).get('ciclo'))||480,DN_HORA=new URLSearchParams(location.search).get('hora');
const DN_K=(()=>{const C=x=>new THREE.Color(x);
 // [u, céu do hemisfério, chão do hemisfério, intensidade, cor do sol, intensidade do sol, posição do sol, noite 0..1]
 const dia=[C(0xffffff),C(0xffffff),.8,C(0xffffff),.2,[-.35,1,.55],0],
  tarde=[C(0xffd7a8),C(0xb98a62),.72,C(0xff9448),.62,[-.95,.42,.25],.3],
  noite=[C(0x7f96d4),C(0x344068),.46,C(0x8aa6ff),.14,[.3,1,-.4],1];
 return [[0,dia],[.25,dia],[.40,tarde],[.50,tarde],[.62,noite],[.90,noite],[1,dia]]})();
let DN_T0=0,DN_G=-1,DN_G0=0,DN_N=0,DN_U=0,DN_NAME='DIA',DN_POST=[],DN_SD=-2,DN_GLOW=null,DN_POOL=null,DN_TEX=null;
const _dnC1=new THREE.Color(),_dnC2=new THREE.Color();
function dnTex(){if(DN_TEX)return DN_TEX;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
 g.addColorStop(0,'rgba(255,230,170,1)');g.addColorStop(.25,'rgba(255,210,140,.55)');g.addColorStop(.6,'rgba(255,190,110,.16)');g.addColorStop(1,'rgba(255,180,100,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
 return DN_TEX=new THREE.CanvasTexture(c)}
function dnClock(){ // segundos de partida, contínuos entre snapshots
 const s=typeof snap!=='undefined'?snap:null,now=performance.now();
 if(!s||s.ph!==1&&s.ph!==0&&s.gt==null)return 0;
 const g=s.gt|0;if(g!==DN_G){DN_G=g;DN_G0=now}
 return g+Math.min(1,(now-DN_G0)/1000)}
function dnSample(u){let a=DN_K[0],b=DN_K[1];for(let i=0;i<DN_K.length-1;i++)if(u>=DN_K[i][0]&&u<=DN_K[i+1][0]){a=DN_K[i];b=DN_K[i+1];break}
 let f=(u-a[0])/Math.max(1e-6,b[0]-a[0]);f=f*f*(3-2*f);return [a[1],b[1],f]}
function dnPosts(){ // acha as lâmpadas dos postes (no mundo) uma vez por mapa
 if(typeof GPR==='undefined'||!GPR.built||!GPR.geo[8]||GPR.sd===DN_SD)return;DN_SD=GPR.sd;DN_POST=[];
 const px=GPR.pxm[8]||12.5;
 for(const d of DECOR){if((d.s|0)!==8||d.v)continue;const yaw=CEN_ORI[8]||d.v?d.r*Math.PI/2:.6,zl=1.15*px,hh=6.05*px;
  DN_POST.push({x:d.x+Math.sin(yaw)*zl,z:d.y+Math.cos(yaw)*zl,y:gpH(d.x,d.y)+hh,gy:gpH(d.x,d.y)})}
 const n=DN_POST.length;
 if(DN_GLOW){GLW.remove(DN_GLOW);DN_GLOW.geometry.dispose()}
 if(DN_POOL){GLW.remove(DN_POOL);DN_POOL.dispose()}
 if(!n)return;
 const pos=new Float32Array(n*3);DN_POST.forEach((p,i)=>{pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 DN_GLOW=new THREE.Points(g,new THREE.PointsMaterial({map:dnTex(),size:90,sizeAttenuation:false,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));
 DN_GLOW.frustumCulled=false;DN_GLOW.renderOrder=50;GLW.add(DN_GLOW);
 const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
 DN_POOL=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:dnTex(),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),n);
 const m=new THREE.Matrix4(),R=190;DN_POST.forEach((p,i)=>{m.compose(new THREE.Vector3(p.x,p.gy+1.2,p.z),new THREE.Quaternion(),new THREE.Vector3(R*2,1,R*2));DN_POOL.setMatrixAt(i,m)});
 DN_POOL.instanceMatrix.needsUpdate=true;DN_POOL.frustumCulled=false;DN_POOL.renderOrder=2;GLW.add(DN_POOL)}
function glDiaFrame(){
 if(!GLHEMI||!GLDIR)return;
 const t=dnClock(),u=DN_HORA!=null?(+DN_HORA%1+1)%1:((t/DN_CICLO)%1);DN_U=u;
 const [A,B,f]=dnSample(u);
 _dnC1.copy(A[0]).lerp(B[0],f);GLHEMI.color.copy(_dnC1);_dnC2.copy(A[1]).lerp(B[1],f);GLHEMI.groundColor.copy(_dnC2);GLHEMI.intensity=A[2]+(B[2]-A[2])*f;
 GLDIR.color.copy(A[3]).lerp(B[3],f);GLDIR.intensity=A[4]+(B[4]-A[4])*f;
 GLDIR.position.set(A[5][0]+(B[5][0]-A[5][0])*f,A[5][1]+(B[5][1]-A[5][1])*f,A[5][2]+(B[5][2]-A[5][2])*f);
 const n=A[6]+(B[6]-A[6])*f;DN_N=n;DN_NAME=u<.33?'DIA':u<.56?'TARDE':u<.95?'NOITE':'DIA';
 dnPosts();
 const lamp=Math.max(0,Math.min(1,(n-.18)/.55)); // lâmpadas acendem no fim da tarde
 if(DN_GLOW){DN_GLOW.visible=lamp>.01;DN_GLOW.material.opacity=lamp*.9;DN_GLOW.material.size=70*(GQ.scale||1)*Math.min(2,Math.max(1,(window.devicePixelRatio||1)))}
 if(DN_POOL){DN_POOL.visible=lamp>.01;DN_POOL.material.opacity=lamp*.5}
 // 4 PointLights nos postes mais perto do centro da câmera
 const cxw=W/2-ox,cyw=H/2-oy;
 if(lamp>.01&&DN_POST.length){const best=[];for(let i=0;i<DN_POST.length;i++){const p=DN_POST[i],d=(p.x-cxw)*(p.x-cxw)+(p.z-cyw)*(p.z-cyw);
   if(best.length<4||d<best[best.length-1][0]){best.push([d,i]);best.sort((a,b)=>a[0]-b[0]);if(best.length>4)best.pop()}}
  for(let k=0;k<GLPL.length;k++){const L=GLPL[k],b=best[k];if(b){const p=DN_POST[b[1]];L.position.set(p.x,p.y-10,p.z);L.intensity=lamp*1.7}else L.intensity=0}}
 else for(const L of GLPL)L.intensity=0}
