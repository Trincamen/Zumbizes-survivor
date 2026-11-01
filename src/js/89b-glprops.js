// ---------- 89b-glprops.js — props DECOR, árvores t:1, carros t:2 e caixas t:3 em 3D (só ?gl=1) ----------
// Mesmos dados do 2D: DECOR[]/CENGLB/CENCFG/CEN_ORI/CEN_FLIP (86-cenario.js), O[] (10-mapa.js), VGLB/vehIdx/VEH_PPM.
// UM InstancedMesh por modelo para o MUNDO INTEIRO (props + carros; as caixas t:3 usam os modelos 3/11/12/13).
// Construído UMA vez por mapa (sd) e reconstruído se sd mudar.
// ESCALA: px/m = alvo de CENCFG (px do sprite) / extensão PROJETADA do GLB (girado pelo mesmo yaw do sprite):
//   'x' -> extensão em rx; 'y' -> extensão em (GLSIN·y − rz), que é a altura na tela da câmera 3D.
//   Assim a silhueta 3D tem o MESMO tamanho de tela do sprite 2D (antes dividia só por Y/X do bbox sem girar,
//   o que deixava peças baixas e/ou largas até ~1,7× maiores: pedras, arbusto, lixeira, barril, cone).
//   Carros = VEH_PPM=20.
// A árvore redonda sai ~20,9 px/m (≈20 px/m, referência da tarefa) e a altura de tela bate com o sprite 2D.
// YAW: 3D usa rotation.y = mesmo ângulo do cenMake do 2D (rx=x·cos+z·sin, rz=z·cos−x·sin ⇒ idêntico).
//   DECOR de CEN_ORI: d.r·90°; os demais: 0,6 rad fixo (pre-giro do initCenario). Árvores: 0,6. Carro horizontal: 0,
//   vertical: −90° (igual a vehBuild). ESPELHO (d.f): scale.x negativo + DoubleSide (não depende do sentido do triângulo).
// ALTURA DO CHÃO: gpH() devolve a superfície mais alta em (x,y) (grama .3 < rio .6 < asfalto/tile < ponte < calçada <
//   gramado dos quarteirões) para nada flutuar/enterrar (o chão do 89-glmundo é camadas, não um plano só).
// DESTRUÍDOS: DD[o.i] zera a matriz (escala 0) e restaura ao reaparecer; só reavalia quando a assinatura de DD muda.
const GP_SRC=CENGLB.concat(VGLB); // 0..26 = props (CENGLB) | 27..31 = carros (VGLB)
const GP_SC={};                   // overrides manuais de px/m por tipo (vazio = CENCFG / extensão projetada)
const GPR={sd:-1,st:0,rdy:0,left:0,built:0,ddRef:null,ddN:-1,ms:0,geo:[],bb:[],pxm:[],inst:[],msh:[],meshes:[]};
let GP_MAT=null;
function gpMat(){return GP_MAT||(GP_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
// GLB (Y-up, metros) -> geometria mesclada em METROS com cor por vértice e normal (escala vem da matriz da instância)
function gpGrab(ti,g){
 g=g.scene||g;g.updateMatrixWorld(true);
 const P=[],C=[],N=[];
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
 g.traverse(o=>{
  const ge=o&&o.geometry;if(!ge||!ge.attributes||!ge.attributes.position)return;
  const pa=ge.attributes.position,ca=ge.attributes.color,na=ge.attributes.normal;
  const id=ge.index?ge.index.array:null,cnt=id?id.length:pa.count,m=o.matrixWorld.elements,cs=ca?ca.itemSize:0;
  for(let f=0;f+2<cnt;f+=3)for(let k=0;k<3;k++){
   const vi=id?id[f+k]:f+k,x=pa.getX(vi),y=pa.getY(vi),z=pa.getZ(vi),
    wx=m[0]*x+m[4]*y+m[8]*z+m[12],wy=m[1]*x+m[5]*y+m[9]*z+m[13],wz=m[2]*x+m[6]*y+m[10]*z+m[14];
   P.push(wx,wy,wz);
   if(wx<x0)x0=wx;if(wx>x1)x1=wx;if(wy<y0)y0=wy;if(wy>y1)y1=wy;if(wz<z0)z0=wz;if(wz>z1)z1=wz;
   if(cs>2)C.push(ca.getX(vi),ca.getY(vi),ca.getZ(vi));else C.push(.6,.6,.6);
   if(na){
    const nx=na.getX(vi),ny=na.getY(vi),nz=na.getZ(vi),
     tx=m[0]*nx+m[4]*ny+m[8]*nz,ty=m[1]*nx+m[5]*ny+m[9]*nz,tz=m[2]*nx+m[6]*ny+m[10]*nz,
     l=Math.hypot(tx,ty,tz)||1;
    N.push(tx/l,ty/l,tz/l)
   }else N.push(0,1,0);
  }
 });
 if(!P.length)return;
 // DECOR 18 (caçamba): o GLB tem a tampa/interior VERDE ([46,106,68]) — faces internas que no 3D aparecem de
 // cima (câmera inclinada) e no 2D ficam atrás na ordenação do sprite (o 2D desenha a peça cinza-escura).
 // Remapeia só esse modelo (não mexe na luz global, que é a do chão) para a cor da carroceria.
 if(ti==18)for(let i=0;i<C.length;i+=3)if(C[i+1]>C[i]+.16&&C[i+1]>C[i+2]+.08){C[i]=.227;C[i+1]=.227;C[i+2]=.251}
 const ge=new THREE.BufferGeometry();
 ge.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));
 ge.setAttribute('color',new THREE.BufferAttribute(new Float32Array(C),3));
 ge.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(N),3));
 GPR.geo[ti]=ge;GPR.bb[ti]={x0,x1,y0,y1,z0,z1};
}
function gpLoad(){
 if(GPR.st)return;GPR.st=1;GPR.left=GP_SRC.length;
 const done=()=>{if(--GPR.left<=0)GPR.rdy=1};
 const ld=new THREE.GLTFLoader();
 GP_SRC.forEach((b,i)=>{
  try{ld.parse(gmBuf(b),'',g=>{try{gpGrab(i,g)}catch(e){console.warn('glprops',i,e)}done()},e=>{console.warn('glprops',i,e);done()})}
  catch(e){console.warn('glprops',i,e);done()}
 });
}
// superfície mais alta em (x,y) — as mesmas camadas/ordem do 89-glmundo (px do mundo)
function gpH(x,y){
 let h=GM_Y.gr;
 if(y>=RY0&&y<=RY1)h=GM_Y.ri;
 const rx=Math.round(x/500)*500,inV=Math.abs(x-rx)<=60&&rx>=0&&rx<=MW;
 if(inV&&(y<2500||y>3500))h=Math.max(h,GM_Y.tv);
 for(const k of CEN_HV)if(Math.abs(y-k*500)<=60)h=Math.max(h,GM_Y.th);
 if(inV)for(const k of CEN_HV)if(Math.abs(y-k*500)<=60)h=Math.max(h,GM_Y.tx);
 if((Math.abs(x-1000)<=80||Math.abs(x-3000)<=80)&&y>=2500&&y<=3500)h=Math.max(h,GM_Y.br);
 for(const j of ROWS)for(let i=0;i<8;i++){const bx=i*500+60,by=j*500+60;
  if(x>=bx-10&&x<=bx+390&&y>=by-10&&y<=by+390){h=Math.max(h,GM_Y.sw);
   if(x>=bx&&x<=bx+380&&y>=by&&y<=by+380)h=GM_Y.bg}}
 return h;
}
function gpClear(){
 for(const im of GPR.meshes){GLW.remove(im);try{im.dispose()}catch(e){}} // libera o buffer de instanceMatrix
 GPR.meshes.length=0;GPR.inst=[];GPR.msh=[];GPR.built=0;
}
// extensão PROJETADA (px de tela por metro) do modelo já girado, na mesma projeção da câmera 3D:
// rx = x·cos+z·sin (horizontal) e GLSIN·y − rz (vertical). É o que faz a peça 3D ter o tamanho do sprite 2D.
function gpSpan(ti,yaw,dim){
 const ge=GPR.geo[ti],pa=ge&&ge.attributes&&ge.attributes.position;if(!pa)return 0;
 const c=Math.cos(yaw),s=Math.sin(yaw);let a=1e9,b=-1e9;
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),
  q=dim=='x'?(x*c+z*s):(GLSIN*y-(z*c-x*s));
  if(q<a)a=q;if(q>b)b=q}
 return b-a;
}
// px/m por tipo: alvo de CENCFG / extensão projetada com o yaw do sprite (ORI usam a variante 0, yaw 0,
// como o initCenario); carros = 20 px/m. GP_SC força um valor manual.
function gpPpm(){
 const px=GPR.pxm;
 for(let i=0;i<GP_SRC.length;i++){
  let v=20;
  if(i<CENGLB.length){const cfg=CENCFG[i];v=cfg[0]/Math.max(.001,gpSpan(i,CEN_ORI[i]?0:.6,cfg[1]))}
  else v=VEH_PPM;
  px[i]=GP_SC[i]||v;
 }
}
// monta as instâncias do mapa atual (uma vez por sd)
function gpBuild(sn){
 const t0=(performance&&performance.now?performance.now():Date.now());
 gpClear();
 gpPpm();
 const lst=[];for(let i=0;i<GP_SRC.length;i++)lst[i]=[];
 // 1) DECOR (pe do objeto no ponto)
 for(const d of DECOR){
  const t=d.s|0;if(t<0||t>=CENGLB.length||!GPR.geo[t])continue;
  lst[t].push({x:d.x,z:d.y,y:gpH(d.x,d.y)+(d.v?3:0),yaw:CEN_ORI[t]||d.v?d.r*Math.PI/2:.6,fl:d.f?1:0,px:d.v?GPR.pxm[t]*.45:GPR.pxm[t],v:d.v?1:0,oi:-1});
 }
 // 2) árvores/carros/caixas de O (t:1/2/3) — posição/giro idênticos ao obst/vehDraw 2D
 for(const o of O){
  if(o.t==1){const t=o.i%3;if(!GPR.geo[t])continue;
   const x=o.x+12,z=o.y+12;
   lst[t].push({x,z,y:gpH(x,z),yaw:.6,fl:0,px:GPR.pxm[t],oi:o.i});
  }else if(o.t==2){const t=27+vehIdx(o);if(!GPR.geo[t])continue;
   const x=o.x+o.w/2,z=o.y+o.h/2;
   lst[t].push({x,z,y:gpH(x,z),yaw:o.w>o.h?0:-Math.PI/2,fl:0,px:VEH_PPM,oi:o.i});
  }else if(o.t==3){ // caixa: MESMO modelo do sprite 2D (cenCrate), pé em (x+w/2, y+h) e yaw .6 — igual ao obst() 2D
   const t=cenCrate(o.i);if(!GPR.geo[t])continue;
   const x=o.x+o.w/2,z=o.y+o.h;
   lst[t].push({x,z,y:gpH(x,z),yaw:.6,fl:0,px:GPR.pxm[t],oi:o.i});
  }
 }
 const Y=new THREE.Vector3(0,1,0),m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3();
 // UM InstancedMesh por modelo. frustumCulled=false de propósito: a câmera é ORTOGRÁFICA e o mundo é um retângulo
 // largo — a esfera de culling fica grande (~2500 px) e nunca sai do frustum, então dividir por faixa de y só
 // multiplicaria draw calls sem cortar triângulo nenhum (medido: 51 malhas/51 calls/255 k tris, igual ao total).
 for(let t=0;t<lst.length;t++){
  const a=lst[t];if(!a.length)continue;
  const im=new THREE.InstancedMesh(GPR.geo[t],gpMat(),a.length);
  im.frustumCulled=false;im.matrixAutoUpdate=false;
  for(let k=0;k<a.length;k++){const e=a[k];e.k=k;e.hid=0;e.m=im;
   q.setFromAxisAngle(Y,e.yaw);if(e.v)q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2)); // poste caído: deitado
   m.compose(p.set(e.x,e.y,e.z),q,s.set(e.fl?-e.px:e.px,e.px,e.px));
   im.setMatrixAt(k,m)}
  im.instanceMatrix.needsUpdate=true;GLW.add(im);
  GPR.meshes.push(im);GPR.msh[t]=im;GPR.inst[t]=a;
 }
 // 3) caixas t:3 entram nas mesmas InstancedMesh dos seus modelos (cenCrate) — nada de geometria própria
 GPR.sd=sn;GPR.built=1;GPR.ddRef=null;GPR.ddN=-1;
 GPR.ms=Math.round((performance&&performance.now?performance.now():Date.now())-t0);
 let n=0;for(const a of lst)n+=a.length;
 console.log('glprops ms',GPR.ms,'inst',n,'malhas',GPR.meshes.length);
}
// DD mudou: esconde (escala 0) / restaura as instâncias de t:1/2/3
function gpDD(){
 const Y=new THREE.Vector3(0,1,0),m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3();
 const ref=(im,e,hid)=>{
  if(hid)m.makeScale(0,0,0);
  else{q.setFromAxisAngle(Y,e.yaw||0);m.compose(p.set(e.x,e.y,e.z),q,s.set(e.fl?-e.px:e.px,e.px,e.px))}
  im.setMatrixAt(e.k,m);
 };
 for(let t=0;t<GPR.inst.length;t++){
  const a=GPR.inst[t];if(!a||!a.length)continue;
  const im=GPR.msh[t];if(!im)continue;
  let ch=0;
  for(const e of a){if(e.oi<0)continue;const h=DD[e.oi]?1:0;if(h===e.hid)continue;e.hid=h;ref(im,e,h);ch=1}
  if(ch)im.instanceMatrix.needsUpdate=true;
 }
}
// por quadro: carrega GLBs, (re)monta por sd e reavalia DD só quando a assinatura muda. Sem alocação por quadro.
function glPropsFrame(){
 if(!glLive||!GLW)return;
 if(!GPR.st)gpLoad();
 if(!GPR.rdy)return;
 if(curSd&&curSd!==GPR.sd&&O.length&&DECOR&&DECOR.length)gpBuild(curSd);
 if(!GPR.built)return;
 let n=0;for(const k in DD)n++;
 if(DD!==GPR.ddRef||n!==GPR.ddN){GPR.ddRef=DD;GPR.ddN=n;gpDD()}
}
// diagnóstico (leitura): instâncias, malhas, tempo de montagem e stats do renderer
function gplInfo(){
 let inst=0;for(const a of GPR.inst)if(a)inst+=a.length;
 return {sd:GPR.sd,inst,malhas:GPR.meshes.length,ms:GPR.ms,rdy:GPR.rdy,
  calls:GLR?GLR.info.render.calls:0,tris:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0};
}
if(typeof window!='undefined')window.__glp=gplInfo;
