// ---------- 89p-glmontanhas.js — MONTANHAS em volta do mapa (só 3D) ----------
// Fora do retângulo jogável (MW×MH) ficava só grama vazia. Aqui: chão rochoso por fora da borda + 3 faixas de relevo low-poly
// (colinas verdes perto, montanhas de pedra no meio, picos com neve ao fundo). 3 InstancedMesh (1 draw call cada), fixo (não depende da semente do mapa).
// A faixa de dentro é baixa para não tampar a área jogável (a câmera é inclinada 55°); as altas ficam longe da borda.
let MT_DONE=0;
function mtGeo(h0,c0,c1,snow){ // cone low-poly (7 lados, base em y=0, altura 1, raio 1), faceado, cor por vértice
 const g=new THREE.ConeGeometry(1,1,7,1,false);g.translate(0,.5,0);const n=g.toNonIndexed();n.computeVertexNormals();
 const pos=n.attributes.position,col=new Float32Array(pos.count*3),A=new THREE.Color(c0),B=new THREE.Color(c1),W=new THREE.Color(0xf2f4f8),t=new THREE.Color();
 for(let i=0;i<pos.count;i++){const y=pos.getY(i);t.copy(A).lerp(B,Math.min(1,y*1.15));if(snow&&y>.68)t.lerp(W,Math.min(1,(y-.68)/.12));col[i*3]=t.r;col[i*3+1]=t.g;col[i*3+2]=t.b}
 n.setAttribute('color',new THREE.BufferAttribute(col,3));return n}
function mtBuild(){
 if(MT_DONE||!GLW||typeof MW==='undefined')return;MT_DONE=1;
 let seed=20241101;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const mat=new THREE.MeshLambertMaterial({vertexColors:true}),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),p=new THREE.Vector3(),sc=new THREE.Vector3(),c=new THREE.Color();
 // chão rochoso por fora da borda (4 faixas largas), um pouco acima da grama
 const rock=new THREE.MeshLambertMaterial({color:0x2c2b27}),Bg=4200,E=34; // E = folga até a borda jogável
 const strip=(x0,z0,x1,z1)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),rock);m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.12,(z0+z1)/2);m.frustumCulled=false;GLW.add(m)};
 strip(-Bg,-Bg,MW+Bg,-E);strip(-Bg,MH+E,MW+Bg,MH+Bg);strip(-Bg,-E,-E,MH+E);strip(MW+E,-E,MW+Bg,MH+E);
 const bands=[ // [d0,d1,passo entre anéis,espaço no anel,raio min,max,altura min,max,cor base,cor topo,neve]
  [E+125,E+290,55,95,70,115,42,92,0x1c3317,0x2f4a23,0],
  [E+360,E+760,72,90,95,155,150,320,0x3b3a36,0x6d6b66,0],
  [E+880,E+1600,95,150,170,270,340,590,0x4a4a50,0x8a8b92,1]];
 for(const b of bands){const pts=[];
  for(let d=b[0];d<=b[1];d+=b[2]){const x0=-d,x1=MW+d,y0=-d,y1=MH+d,per=[[x0,y0,x1,y0],[x1,y0,x1,y1],[x1,y1,x0,y1],[x0,y1,x0,y0]];
   for(const [ax,ay,bx,by] of per){const L=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.round(L/b[3]));
    for(let i=0;i<n;i++){const u=(i+R()*.9)/n,jx=(R()-.5)*b[3]*.6,jy=(R()-.5)*b[2]*.5;pts.push([ax+(bx-ax)*u+jx,ay+(by-ay)*u+jy])}}}
  const im=new THREE.InstancedMesh(mtGeo(0,b[8],b[9],b[10]),mat,pts.length);im.frustumCulled=false;
  pts.forEach((pt,i)=>{const r=b[4]+R()*(b[5]-b[4]),h=b[6]+R()*(b[7]-b[6]);q.setFromAxisAngle(Y,R()*6.283);p.set(pt[0],0,pt[1]);sc.set(r*(.85+R()*.3),h,r*(.85+R()*.3));
   m4.compose(p,q,sc);im.setMatrixAt(i,m4);const k=.82+R()*.3;im.setColorAt(i,c.setRGB(k,k,k))});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;GLW.add(im)}
}
function glMontFrame(){if(!MT_DONE)mtBuild()}
