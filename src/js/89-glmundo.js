// ---------- 89-glmundo.js — chão, asfalto, tiles de rua, rio e quarteirões em 3D (só ?gl=1) ----------
// Reproduz a MESMA geometria/cores/ordem do 2D (86-cenario.js: cenRuaSpr + cenBlocks), agora em malha WebGL:
// 1) grama #3a4a2b no mundo todo  2) rio #2d6fa8 em y∈[RY0,RY0+600]  3) asfalto #34343a (faixas de 120 px)
// 4) tiles GLB (rua_reta/cruzamento/T/curva) recortados NA CPU na faixa de 120 px (24 m = 300 px = 12,5 px/m)
// 5) quarteirões: calçada #807a6a + gramado alternado (por cima das ruas, cobrindo 10 px de cada borda).
// Chunks de 1000×1000 (mesma grade do cache de chão 2D): constrói no máx. 1/quadro, descarta a >2500 px, máx. 12.
// ALTURAS em px do mundo (evita Z-FIGHTING; 0,3 px ≈ 55 unidades de profundidade em 24 bits):
// grama .3 < rio .6 < asfalto .9 < tile v 2.3 / h 2.6 / cruz 2.9 < ponte 4.2 < calçada 4.8 < gramado 5.1.
// A ponte fica ACIMA do núcleo da esquina (2.9): senão a calçada do tile de cruzamento/corredor aparece
// atravessando o tabuleiro (no 2D o bridgeGround é desenhado por cima do chão).
// O plano liso da 1a fica em y=0 (abaixo de tudo) e só aparece fora do mundo.
const GM_GLB=['@@GLB:assets/rua/rua_reta.glb@@','@@GLB:assets/rua/rua_cruzamento.glb@@','@@GLB:assets/rua/rua_T.glb@@','@@GLB:assets/rua/rua_curva.glb@@'];
const GM_PX=12.5,GM_TS=300,GM_CHS=1000;
const GM_Y={gr:.3,ri:.6,as:.9,tv:2.3,th:2.6,tx:2.9,br:4.2,br2:4.35,sw:4.8,bg:5.1};
const GM_HX=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const GM_C={gr:GM_HX(0x3a4a2b),ri:GM_HX(0x2d6fa8),as:GM_HX(0x34343a),sw:GM_HX(0x807a6a),bg0:GM_HX(0x3c4d2a),bg1:GM_HX(0x44562f),
 br:GM_HX(0x45454d),brl:GM_HX(0xd8d8d8),brd:GM_HX(0xccaa44)};
const GM_T={},GM_TG={},GM_CH=new Map();
const GM_ST={load:0,rdy:0};
let GM_MAT=null;
function gmMat(){return GM_MAT||(GM_MAT=new THREE.MeshLambertMaterial({vertexColors:true}))}
// materiais COMPARTILHADOS dos pilares/cabos das pontes (criados uma vez; as geometrias é que são do chunk)
let GM_PMAT=null;
function gmPMat(){
 if(GM_PMAT)return GM_PMAT;
 GM_PMAT=[new THREE.MeshLambertMaterial({color:0x5d616a}),new THREE.MeshLambertMaterial({color:0xaeb2ba}),
  new THREE.MeshLambertMaterial({color:0xc9ccd2}),new THREE.LineBasicMaterial({color:0xd7dae0,transparent:true,opacity:.85})];
 return GM_PMAT;
}
function gmBuf(b64){const s=atob(b64),n=s.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=s.charCodeAt(i);return u.buffer}
// GLB (Y-up, metros) -> triângulos em px do mundo (x/z), com cor por vértice e normal. Cache por tipo.
function gmGrab(ti,g){
 g=g.scene||g;g.updateMatrixWorld(true);
 const P=[],C=[],N=[];
 g.traverse(o=>{
  const ge=o&&o.geometry;if(!ge||!ge.attributes||!ge.attributes.position)return;
  const pa=ge.attributes.position,ca=ge.attributes.color,na=ge.attributes.normal;
  const id=ge.index?ge.index.array:null,cnt=id?id.length:pa.count,m=o.matrixWorld.elements,cs=ca?ca.itemSize:0;
  for(let f=0;f+2<cnt;f+=3)for(let k=0;k<3;k++){
   const vi=id?id[f+k]:f+k,x=pa.getX(vi),y=pa.getY(vi),z=pa.getZ(vi);
   P.push((m[0]*x+m[4]*y+m[8]*z+m[12])*GM_PX,(m[1]*x+m[5]*y+m[9]*z+m[13])*GM_PX,(m[2]*x+m[6]*y+m[10]*z+m[14])*GM_PX);
   if(cs>2)C.push(ca.getX(vi),ca.getY(vi),ca.getZ(vi));else C.push(.6,.6,.6);
   if(na){
    const nx=na.getX(vi),ny=na.getY(vi),nz=na.getZ(vi),
     tx=m[0]*nx+m[4]*ny+m[8]*nz,ty=m[1]*nx+m[5]*ny+m[9]*nz,tz=m[2]*nx+m[6]*ny+m[10]*nz,
     l=Math.hypot(tx,ty,tz)||1;
    N.push(tx/l,ty/l,tz/l)
   }else N.push(0,1,0);
  }
 });
 GM_T[ti]={p:new Float32Array(P),c:new Float32Array(C),n:new Float32Array(N)};
}
function gmLoad(){
 if(GM_ST.load)return;GM_ST.load=1;
 let left=GM_GLB.length;const done=()=>{if(--left<=0)GM_ST.rdy=1};
 const ld=new THREE.GLTFLoader();
 GM_GLB.forEach((b,i)=>{
  try{ld.parse(gmBuf(b),'',g=>{try{gmGrab(i,g)}catch(e){console.warn('glmundo tile',i,e)}done()},e=>{console.warn('glmundo tile',i,e);done()})}
  catch(e){console.warn('glmundo tile',i,e);done()}
 });
}
// geometria do tile girada (rot = quartos de volta em Y, igual ao rot do cenMakeObl), centrada na origem (px) e
// JÁ RECORTADA à faixa de 120 px: reta → meia-faixa (±60) e o resto do tile fora; cruzamento/T/curva → caixa 120×120.
// Assim o recorte por chunk quase sempre cai no caminho rápido (cópia), e só os tiles da borda passam por gmHalf.
function gmTileGeo(ti,r){
 const k=ti+':'+r,hit=GM_TG[k];if(hit!==undefined)return hit;
 const src=GM_T[ti];if(!src){GM_TG[k]=null;return null}
 const th=r*Math.PI/2,co=Math.round(Math.cos(th)),si=Math.round(Math.sin(th));
 const p=src.p,n=src.n,c=src.c,v=[];
 for(let i=0;i<p.length;i+=9)v.push([[p[i]*co+p[i+2]*si,p[i+1],p[i+2]*co-p[i]*si,c[i],c[i+1],c[i+2],n[i]*co+n[i+2]*si,n[i+1],n[i+2]*co-n[i]*si],
  [p[i+3]*co+p[i+5]*si,p[i+4],p[i+5]*co-p[i+3]*si,c[i+3],c[i+4],c[i+5],n[i+3]*co+n[i+5]*si,n[i+4],n[i+5]*co-n[i+3]*si],
  [p[i+6]*co+p[i+8]*si,p[i+7],p[i+8]*co-p[i+6]*si,c[i+6],c[i+7],c[i+8],n[i+6]*co+n[i+8]*si,n[i+7],n[i+8]*co-n[i+6]*si]]);
 const ax=ti==0?(r&1?2:0):-1; // eixo perpendicular à faixa da rua (reta); -1 = caixa nos dois eixos
 const planes=[];
 if(ax<0){planes.push([0,-60,1],[0,60,-1],[2,-60,1],[2,60,-1])}else planes.push([ax,-60,1],[ax,60,-1]);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 const P=[],C=[],N=[];
 for(let i=0;i<v.length;i++){
  let w=v[i];
  for(const[pl,lim,s]of planes){w=gmHalf(w,pl,lim,s);if(w.length<3){w=null;break}}
  if(!w)continue;
  for(let j=1;j+1<w.length;j++){
   const A=w[0],B=w[j],D=w[j+1];
   // descarta triângulo degenerado (área 3D ~0): vem do GLB e das bordas do recorte, e só gasta vértice
   const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
   if((uy*vz-uz*vy)**2+(uz*vx-ux*vz)**2+(ux*vy-uy*vx)**2<1e-6)continue;
   for(const q of[A,B,D]){
    P.push(q[0],q[1],q[2]);C.push(q[3],q[4],q[5]);N.push(q[6],q[7],q[8]);
    if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[2]<z0)z0=q[2];if(q[2]>z1)z1=q[2];
   }
  }
 }
 if(!P.length){GM_TG[k]=null;return null}
 const g={p:new Float32Array(P),c:new Float32Array(C),n:new Float32Array(N),x0:x0,x1:x1,z0:z0,z1:z1};
 GM_TG[k]=g;return g;
}
// recorte de polígono contra meia-placa (a=0 eixo x, a=2 eixo z; s=1 mantém >=lim, s=-1 mantém <=lim)
function gmHalf(v,a,lim,s){
 const o=[];
 for(let i=0;i<v.length;i++){
  const A=v[i],B=v[(i+1)%v.length],da=(A[a]-lim)*s,db=(B[a]-lim)*s;
  if(da>=0)o.push(A);
  if((da>=0)!==(db>=0)){const t=da/(da-db),q=new Array(9);for(let k=0;k<9;k++)q[k]=A[k]+(B[k]-A[k])*t;o.push(q)}
 }
 return o;
}
// há tile de núcleo (cruzamento/T/curva) nesta esquina? (mesma escolha do cenRuaSpr)
function gmCoreAt(px,py){
 const a=cenArms(px,py),n=(a&1)+((a>>1)&1)+((a>>2)&1)+((a>>3)&1);
 return n>=4||(n==3&&CEN_TV[a]!=null)||(n==2&&CEN_CV[a]!=null);
}
// sub-faixas de [a,b] FORA dos intervalos cut=[[s,e],...] (as retas são cortadas no núcleo das esquinas)
function gmRuns(a,b,cut){
 const out=[];let s=a;
 for(const[c0,c1]of cut.slice().sort((p,q)=>p[0]-q[0])){
  if(c1<=s)continue;if(c0>=b)break;
  if(c0>s)out.push([s,Math.min(c0,b)]);
  s=Math.max(s,c1);if(s>=b)break;
 }
 if(s<b)out.push([s,b]);
 return out;
}
// coloca um tile centrado em (ox,oz) recortado ao retângulo [x0,x1]×[z0,z1] (px do mundo)
function gmTile(ti,r,ox,oz,yl,x0,z0,x1,z1,P,C,N){
 const g=gmTileGeo(ti,r);if(!g)return;
 const p=g.p,n=g.n,c=g.c;
 if(x0<=g.x0+ox&&x1>=g.x1+ox&&z0<=g.z0+oz&&z1>=g.z1+oz){
  for(let i=0;i<p.length;i+=3){P.push(p[i]+ox,yl+p[i+1],p[i+2]+oz);C.push(c[i],c[i+1],c[i+2]);N.push(n[i],n[i+1],n[i+2])}
  return;
 }
 for(let i=0;i<p.length;i+=9){
  let v=[[p[i]+ox,yl+p[i+1],p[i+2]+oz,c[i],c[i+1],c[i+2],n[i],n[i+1],n[i+2]],
   [p[i+3]+ox,yl+p[i+4],p[i+5]+oz,c[i+3],c[i+4],c[i+5],n[i+3],n[i+4],n[i+5]],
   [p[i+6]+ox,yl+p[i+7],p[i+8]+oz,c[i+6],c[i+7],c[i+8],n[i+6],n[i+7],n[i+8]]];
  v=gmHalf(v,0,x0,1);if(v.length<3)continue;
  v=gmHalf(v,0,x1,-1);if(v.length<3)continue;
  v=gmHalf(v,2,z0,1);if(v.length<3)continue;
  v=gmHalf(v,2,z1,-1);if(v.length<3)continue;
  for(let k=1;k+1<v.length;k++){
   const A=v[0],B=v[k],D=v[k+1];
   // descarta degenerado (área 3D ~0) das bordas do recorte
   const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
   if((uy*vz-uz*vy)**2+(uz*vx-ux*vz)**2+(ux*vy-uy*vx)**2<1e-6)continue;
   for(const q of[A,B,D]){P.push(q[0],q[1],q[2]);C.push(q[3],q[4],q[5]);N.push(q[6],q[7],q[8])}
  }
 }
}
// constrói a malha de um chunk (uma geometria mesclada = 1 draw call)
function gmBuild(ci,cj){
 const K=ci+','+cj,X0=ci*GM_CHS,Y0=cj*GM_CHS,X1=Math.min(MW,X0+GM_CHS),Y1=Math.min(MH,Y0+GM_CHS);
 if(X1<=X0||Y1<=Y0){GM_CH.set(K,null);return}
 const P=[],C=[],N=[];
 const PY=[];
 const rect=(ax,az,bx,bz,y,col)=>{
  ax=Math.max(ax,X0);bx=Math.min(bx,X1);az=Math.max(az,Y0);bz=Math.min(bz,Y1);
  if(bx<=ax||bz<=az)return;
  const r=col[0],g=col[1],b=col[2];
  P.push(ax,y,az,ax,y,bz,bx,y,bz,ax,y,az,bx,y,bz,bx,y,az);
  for(let i=0;i<6;i++){C.push(r,g,b);N.push(0,1,0)}
 };
 // 1) grama + 2) rio
 rect(X0,Y0,X1,Y1,GM_Y.gr,GM_C.gr);
 rect(0,RY0,MW,RY1,GM_Y.ri,GM_C.ri);
 // 3) asfalto: faixas verticais (fora do rio) e horizontais
 for(const[ya,yb]of[[0,2500],[3500,6000]])for(let k=0;k<=8;k++)rect(k*500-60,ya,k*500+60,yb,GM_Y.as,GM_C.as);
 for(const ky of CEN_HV)rect(0,ky*500-60,MW,ky*500+60,GM_Y.as,GM_C.as);
 // 4) tiles: retas verticais (cortadas no núcleo 120×120 das esquinas → só o tile de cruzamento/T/curva ali)
 for(const[ya,yb]of[[0,2500],[3500,6000]]){
  const cy0=Math.max(ya,Y0),cy1=Math.min(yb,Y1);if(cy1<=cy0)continue;
  for(let k=0;k<=8;k++){const xc=k*500,cx0=Math.max(xc-60,X0),cx1=Math.min(xc+60,X1);
   if(cx1<=cx0)continue;
   const cut=[];for(const ky of CEN_HV)if(gmCoreAt(xc,ky*500))cut.push([ky*500-60,ky*500+60]);
   for(const[a0,a1]of gmRuns(cy0,cy1,cut))
    for(let yy=Math.floor(a0/GM_TS)*GM_TS;yy<a1;yy+=GM_TS)gmTile(0,0,xc,yy+GM_TS/2,GM_Y.tv,cx0,a0,cx1,a1,P,C,N)}
 }
 // retas horizontais (giradas 90°), também cortadas no núcleo das esquinas
 for(const ky of CEN_HV){const yc=ky*500,cy0=Math.max(yc-60,Y0),cy1=Math.min(yc+60,Y1);
  if(cy1<=cy0)continue;
  const xx0=Math.max(0,X0),xx1=Math.min(MW,X1);if(xx1<=xx0)continue;
  const cut=[];for(let k=0;k<=8;k++)if(gmCoreAt(k*500,yc))cut.push([k*500-60,k*500+60]);
  for(const[a0,a1]of gmRuns(xx0,xx1,cut))
   for(let xx=Math.floor(a0/GM_TS)*GM_TS;xx<a1;xx+=GM_TS)gmTile(0,1,xx+GM_TS/2,yc,GM_Y.th,xx0,cy0,a1,cy1,P,C,N)}
 // cruzamentos: só o núcleo de 120×120 (T/curva/4 vias escolhidos pelos braços reais)
 for(let k=0;k<=8;k++)for(const ky of CEN_HV){
  const px=k*500,py=ky*500,x0=Math.max(px-60,X0),x1=Math.min(px+60,X1),z0=Math.max(py-60,Y0),z1=Math.min(py+60,Y1);
  if(x1<=x0||z1<=z0)continue;
  const a=cenArms(px,py),n=(a&1)+((a>>1)&1)+((a>>2)&1)+((a>>3)&1);
  if(n>=4){gmTile(1,0,px,py,GM_Y.tx,x0,z0,x1,z1,P,C,N);continue}
  if(n==3&&CEN_TV[a]!=null){gmTile(2,CEN_TV[a],px,py,GM_Y.tx,x0,z0,x1,z1,P,C,N);continue}
  if(n==2&&CEN_CV[a]!=null)gmTile(3,CEN_CV[a],px,py,GM_Y.tx,x0,z0,x1,z1,P,C,N);
 }
 // 4b) pontes: tabuleiro em 3D (o 2D chama bridgeGround dentro do bloco !glLive, logo não aparece no ?gl=1).
 // Mesmas medidas/cores do bridgeGround: deck #45454d em [bx-80,bx+80]×[2500,3500], faixas claras #d8d8d8
 // nas bordas e a faixa central tracejada #ccaa44 (= '#ca4') dash 30/30 lw 3. Pilares/cabos seguem 2D (tipo 7 do D).
 for(const bx of[1000,3000]){
  rect(bx-80,2500,bx+80,3500,GM_Y.br,GM_C.br);
  rect(bx-74,2500,bx-71,3500,GM_Y.br2,GM_C.brl);
  rect(bx+71,2500,bx+74,3500,GM_Y.br2,GM_C.brl);
  for(let yy=2500;yy<3500;yy+=60)rect(bx-1.5,yy,bx+1.5,yy+30,GM_Y.br2,GM_C.brd);
 }
 // 4c) pilares/cabos das DUAS pontes (no 2D é pylon(), tipo 7 da lista D — que não desenha mais com o #c oculto).
 // Mesmas posições/cores do 2D; ALTURAS: o 2D mede em px de TELA e a câmera 3D encurta por sin(55°), então
 // px de mundo na vertical = px de tela / GLSIN. Peças em BoxGeometry (faces já corretas) + cabos em LineSegments.
 for(const bx of[1000,3000])for(const yy of[2850,3150])for(const sd of[-1,1]){
  const px=bx+sd*88;if(px<X0-40||px>X1+40||yy<Y0-40||yy>Y1+40)continue;
  PY.push([px,yy,sd]);
 }
 // 5) quarteirões (depois das ruas)
 for(const j of ROWS)for(let i=0;i<8;i++){const bx=i*500+60,by=j*500+60;
  rect(bx-10,by-10,bx+390,by+390,GM_Y.sw,GM_C.sw);
  rect(bx,by,bx+380,by+380,GM_Y.bg,(i+j)%2?GM_C.bg1:GM_C.bg0)}
 if(!P.length){GM_CH.set(K,null);return}
 const ge=new THREE.BufferGeometry();
 ge.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));
 ge.setAttribute('color',new THREE.BufferAttribute(new Float32Array(C),3));
 ge.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(N),3));
 const me=new THREE.Mesh(ge,gmMat());me.frustumCulled=false;
 const grp=new THREE.Group();grp.add(me);GLW.add(grp);
 // pilares/cabos das pontes deste chunk (poucos por chunk; geometrias descartadas pelo gmDrop)
 if(PY.length){
  const HI=1/GLSIN,MB=gmPMat();
  const gb=new THREE.BoxGeometry(18,10*HI,16),gc=new THREE.BoxGeometry(12,96*HI,12),gk=new THREE.BoxGeometry(18,9*HI,18);
  const cab=[];
  for(const[px,py,sd]of PY){
   const b1=new THREE.Mesh(gb,MB[0]);b1.position.set(px,5*HI,py);grp.add(b1);
   const c1=new THREE.Mesh(gc,MB[1]);c1.position.set(px,58*HI,py);grp.add(c1);
   const c2=new THREE.Mesh(gk,MB[2]);c2.position.set(px,110.5*HI,py);grp.add(c2);
   for(const k of[-200,-140,-80,80,140,200])cab.push(px,106*HI,py,px-sd*8,0,py+k);
  }
  const lg=new THREE.BufferGeometry();
  lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(cab),3));
  const ls=new THREE.LineSegments(lg,MB[3]);ls.frustumCulled=false;grp.add(ls);
 }
 // centro do chunk em px do MUNDO (x,z) — o mesmo espaço de cx,cy usado no descarte; sem isto Math.hypot=NaN
 // e nem o raio de 2500 px nem o teto de 12 chunks disparam (vazamento de chunks/geometrias).
 grp.userData={x:(X0+X1)/2,z:(Y0+Y1)/2};
 GM_CH.set(K,grp);
}
function gmDrop(k){
 const g=GM_CH.get(k);GM_CH.delete(k);
 if(!g)return;
 GLW.remove(g);
 if(g.children)for(const m of g.children)if(m.geometry)m.geometry.dispose();
}
// por quadro: carrega GLBs (se faltar), constrói no máx. 1 chunk, descarta os distantes
function glMundoFrame(){
 if(!glLive||!GLW)return;
 if(!GM_ST.load)gmLoad();
 if(!GM_ST.rdy)return;
 const x0=cx-W/2-1000,x1=cx+W/2+1000,z0=cy-H/2-1000,z1=cy+H/2+1000;
 const i0=Math.floor(Math.max(0,x0)/GM_CHS),i1=Math.floor(Math.min(MW-1,x1)/GM_CHS),
  j0=Math.floor(Math.max(0,z0)/GM_CHS),j1=Math.floor(Math.min(MH-1,z1)/GM_CHS);
 let bi=-1,bj=-1,bd=0;
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
  if(GM_CH.has(i+','+j))continue;
  const d=Math.abs(i*GM_CHS+500-cx)+Math.abs(j*GM_CHS+500-cy);
  if(bi<0||d<bd){bi=i;bj=j;bd=d}
 }
 if(bi>=0)gmBuild(bi,bj);
 const far=k=>{const v=GM_CH.get(k);if(!v||!v.userData)return false;const u=v.userData;return Math.hypot(u.x-cx,u.z-cy)>2500};
 GM_CH.forEach((v,k)=>{if(far(k))gmDrop(k)});
 while(GM_CH.size>12){
  let fk=null,fd=-1;
  GM_CH.forEach((v,k)=>{if(!v||!v.userData)return;const u=v.userData,d=Math.hypot(u.x-cx,u.z-cy);if(d>fd){fd=d;fk=k}});
  if(fk==null)break;
  gmDrop(fk);
 }
}
// diagnóstico (leitura, para a medição): chunks vivos, draw calls, triângulos e geometrias em memória
function glmInfo(){
 return {chunks:GM_CH.size,calls:GLR?GLR.info.render.calls:0,tris:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0};
}
if(typeof window!='undefined')window.__glm=glmInfo;
