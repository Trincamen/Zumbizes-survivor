// ---------- 89c-glpredios.js — prédios h/p/m (GLB) e galpões 'W' em 3D (só ?gl=1) ----------
// Mesmos dados do 2D: BLD=O.B (10-mapa.js), b={x,y,w,h,H,c,d,dx,T,W}. h/p/m vêm de CEN_PGLB (86-cenario.js:145)
// com escala ANISOTRÓPICA igual ao cenMakeObl (86-cenario.js:109): kX=w/footprint_x, kZ=h/footprint_z,
// kY=H/wall_height. Posição: centro do piso do GLB em (b.x+b.w/2, b.y+b.h/2); frente (sul) = +Z do GLB = +y.
// Nós: cada nó do GLB vira uma malha própria (geometria COMPARTILHADA entre prédios do mesmo tipo) para poder
// ocultar roof/chimney/exterior_props e baixar wall_south (16 px) e walls_interior (26 px) quando b===meB.
// Pulados como no cenBldBuild 2D (CEN_SKIP_EXT): loot_*, player_spawn, zombie_*, parking, cart_corral.
// Galpões 'W' (sem GLB): caixa procedural com 4 paredes + telhado b.d + faixa escura da porta no vão dx..dx+56.
// 'x' (1b-ii-b2): uma das 10 casas GLB de src/assets/casas/, escolhida por casaPick (10-mapa.js) a partir
// de b.cm; footprint/wall_height/doorX vêm de CASA_EXT (mesma tabela que gerou o vão dx). Base64 só aqui.
// Culling: só visible=true para prédios a ≤1500 px do centro da câmera (≤ ~150 draw calls).
const GR_SRC=CEN_PGLB; // mesmos GLBs do 2D (86-cenario.js): sem duplicar o base64
const GR_CASA=['@@GLB:assets/casas/casa_01_chale_pequeno.glb@@','@@GLB:assets/casas/casa_02_duas_salas.glb@@',
 '@@GLB:assets/casas/casa_03_cabana_madeira.glb@@','@@GLB:assets/casas/casa_04_garagem.glb@@',
 '@@GLB:assets/casas/casa_05_quintal.glb@@','@@GLB:assets/casas/casa_06_trailer.glb@@',
 '@@GLB:assets/casas/casa_07_fazenda.glb@@','@@GLB:assets/casas/casa_08_esquina.glb@@',
 '@@GLB:assets/casas/casa_09_queimada.glb@@','@@GLB:assets/casas/casa_10_bangalo_azul.glb@@'];
const GR_EXT={h:{footprint_xz:[22.4,14.4],wall_height:3.4},p:{footprint_xz:[16.4,12.4],wall_height:3.2},m:{footprint_xz:[10,7],wall_height:2.8}};
for(let i=0;i<CASA_EXT.length;i++)GR_EXT['c'+i]={footprint_xz:[CASA_EXT[i][0],CASA_EXT[i][1]],wall_height:CASA_EXT[i][2]};
const GR_SKIP=/^(loot_|player_spawn|zombie_|parking|cart_corral)/;
// nós escondidos quando o jogador está DENTRO: telhado/chaminé/props externos e as peças da fachada
// (sign/awning/canopy/flag/doors) — o 2D também só desenha o sprite de interior nesse caso.
const GR_ROOF=/^(roof|roof_cross|chimney|exterior_props|sign|awning|canopy|flag|doors)$/;
const GR={st:0,rdy:0,left:0,sd:-1,built:0,ms:0,geo:{},nodes:{},items:[]};
let GR_MAT=null,GR_GLASS=null,GR_BOX=null,GR_MC=null;
const GR_LO_S=16,GR_LO_I=26; // alturas (px) das paredes sul/internas quando o jogador está dentro (obst 2D)
function grMat(){return GR_MAT||(GR_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}))}
function grGlass(){return GR_GLASS||(GR_GLASS=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.5,depthWrite:false}))}
function grBoxGeo(){return GR_BOX||(GR_BOX=new THREE.BoxGeometry(1,1,1))}
function grColMat(c){GR_MC=GR_MC||{};const k=c||'#888';return GR_MC[k]||(GR_MC[k]=new THREE.MeshLambertMaterial({color:new THREE.Color(k),side:THREE.DoubleSide}))}
// GLB (Y-up, metros) -> uma geometria por NÓ, já em coordenadas do modelo (piso em y=0, centro em x=z=0).
function grGrab(T,g){
 g=g.scene||g;g.updateMatrixWorld(true);
 const geo={},list=[];
 g.traverse(o=>{
  const ge=o&&o.geometry;if(!ge||!ge.attributes||!ge.attributes.position)return;
  const nm=o.name||'';if(!nm||GR_SKIP.test(nm)||geo[nm])return;
  const cl=ge.clone();cl.applyMatrix4(o.matrixWorld);
  if(!cl.attributes.color){const n=cl.attributes.position.count,a=new Float32Array(n*3);a.fill(.72);cl.setAttribute('color',new THREE.BufferAttribute(a,3))}
  if(!cl.attributes.normal)cl.computeVertexNormals();
  geo[nm]=cl;list.push(nm);
 });
 if(!list.length)return;
 GR.geo[T]=geo;GR.nodes[T]=list;
}
function grLoad(){
 if(GR.st)return;GR.st=1;GR.left=3+GR_CASA.length;
 const done=()=>{if(--GR.left<=0)GR.rdy=1};
 const ld=new THREE.GLTFLoader();
 const one=(key,buf)=>{try{ld.parse(buf,'',g=>{try{grGrab(key,g)}catch(e){console.warn('glpredios',key,e)}done()},e=>{console.warn('glpredios',key,e);done()})}
  catch(e){console.warn('glpredios',key,e);done()}};
 for(const T of['h','p','m'])one(T,gmBuf(GR_SRC[T]));
 for(let i=0;i<GR_CASA.length;i++)one('c'+i,gmBuf(GR_CASA[i]));
}
// superfície do chão sob a pegada (as camadas do 89-glmundo têm alturas diferentes) + folga p/ não brigar com o gramado
function grBase(b){
 let h=0;
 for(const fx of[.12,.5,.88])for(const fz of[.12,.5,.88]){const q=gpH(b.x+b.w*fx,b.y+b.h*fz);if(q>h)h=q}
 return h+.25;
}
// prédio a partir do GLB: Group escalado + 1 malha por nó (key = 'h'|'p'|'m'|'c0'..'c9')
function grBldGlb(b,key){
 const T=key||b.T,geo=GR.geo[T],nodes=GR.nodes[T];if(!geo||!nodes)return null;
 const ext=GR_EXT[T]||{},fp=ext.footprint_xz||[b.w/12.5,b.h/12.5],wh=ext.wall_height||3;
 const kX=b.w/Math.max(.001,fp[0]),kZ=b.h/Math.max(.001,fp[1]),kY=b.H/Math.max(.001,wh);
 const grp=new THREE.Group();
 grp.position.set(b.x+b.w/2,grBase(b),b.y+b.h/2);
 grp.scale.set(kX,kY,kZ);
 const roof=[],low=[];
 for(const nm of nodes){
  if(T=='c8'&&GR_ROOF.test(nm))continue; // casa_09 (queimada): o telhado é um bloco preto opaco que cobria metade da casa; sem ele vira uma ruína aberta
  const me=new THREE.Mesh(geo[nm],/glass/.test(nm)?grGlass():grMat());
  me.name=nm;grp.add(me); // matrixAutoUpdate fica ligado: as paredes sul/internas mudam de scale ao entrar
  if(GR_ROOF.test(nm))roof.push(me);
  else if(/^wall_south/.test(nm))low.push({me,h0:1,lo:GR_LO_S/b.H,py:null});
  else if(nm=='walls_interior')low.push({me,h0:1,lo:GR_LO_I/b.H,py:null});
 }
 GLW.add(grp);
 return {b,grp,roof,low,inside:-1};
}
// galpão 'W' (e fallback de h/p/m sem GLB): 4 paredes + telhado + faixa da porta, cores b.c/b.d do 2D
function grBldBox(b){
 const grp=new THREE.Group(),W=b.w,H=b.H,D=b.h;
 grp.position.set(b.x+W/2,grBase(b),b.y+D/2);
 const mw=grColMat(b.c),mr=grColMat(b.d),md=grColMat('#7a4a24'),T=6;
 const put=(sx,sy,sz,x,y,z,mat)=>{const me=new THREE.Mesh(grBoxGeo(),mat);me.scale.set(sx,sy,sz);me.position.set(x,y,z);grp.add(me);return me};
 put(W,H,T,0,H/2,-D/2+T/2,mw);                       // parede norte
 const sw=put(W,H,T,0,H/2,D/2-T/2,mw);                // parede sul (baixa ao entrar)
 put(T,H,D-2*T,-W/2+T/2,H/2,0,mw);                   // oeste
 put(T,H,D-2*T,W/2-T/2,H/2,0,mw);                    // leste
 const roof=put(W+12,T,D+12,0,H+T/2,0,mr);           // telhado
 const door=put(56,44,2,b.dx+28-(b.x+W/2),22,D/2+1,md); // porta no vão dx..dx+56 (fachada sul)
 GLW.add(grp);
 return {b,grp,roof:[roof,door],low:[{me:sw,h0:H,lo:GR_LO_S,py:H/2}],inside:-1};
}
function grClear(){
 for(const it of GR.items)GLW.remove(it.grp);
 GR.items.length=0;GR.built=0;
}
// dentro × fora: esconde telhado/chaminé/props e baixa as paredes sul/internas (mesmo pulo seco do 2D)
function grInside(it,ins){
 for(const m of it.roof)m.visible=!ins;
 for(const w of it.low){
  w.me.scale.y=ins?w.lo:w.h0;
  if(w.py!=null)w.me.position.y=ins?w.lo/2:w.py;
 }
}
function grBuild(sn){
 const t0=(performance&&performance.now?performance.now():Date.now());
 grClear();
 let nGlb=0,nBox=0,nCasa=0;
 for(const b of BLD){
  let it=null;
  if(b.T=='h'||b.T=='p'||b.T=='m'){it=grBldGlb(b);if(it)nGlb++;else it=grBldBox(b)}
  else if(b.T=='x'){it=grBldGlb(b,'c'+(((b.cm|0)%10+10)%10));if(it)nCasa++;else it=grBldBox(b)}
  else if(b.T=='W')it=grBldBox(b);
  if(it){GR.items.push(it);nBox++}
 }
 GR.sd=sn;GR.built=1;
 GR.ms=Math.round((performance&&performance.now?performance.now():Date.now())-t0);
 console.log('glpredios ms',GR.ms,'predios',GR.items.length,'glb',nGlb,'casas',nCasa,'box',nBox);
}
// por quadro: carrega GLBs, (re)monta por sd e atualiza visibilidade/estado dentro-fora. Sem alocação por quadro.
function glPrediosFrame(){
 if(!glLive||!GLW)return;
 if(!GR.st)grLoad();
 if(!GR.rdy)return;
 if(curSd&&curSd!==GR.sd&&BLD.length)grBuild(curSd);
 if(!GR.built)return;
 const r2=1500*1500;
 for(let i=0;i<GR.items.length;i++){
  const it=GR.items[i],b=it.b,dx=b.x+b.w/2-cx,dz=b.y+b.h/2-cy;
  const vis=dx*dx+dz*dz<=r2;
  if(it.grp.visible!==vis)it.grp.visible=vis;
  const ins=b===meB?1:0;
  if(ins!==it.inside){it.inside=ins;grInside(it,ins)}
 }
}
// diagnóstico (leitura): prédios, estado dentro/fora, tempo de montagem e stats do renderer
function grpInfo(){
 let vis=0,ins=0;
 for(const it of GR.items){if(it.grp.visible)vis++;if(it.inside==1)ins++}
 return {sd:GR.sd,n:GR.items.length,vis,ins,ms:GR.ms,rdy:GR.rdy,nodes:Object.keys(GR.geo).map(T=>T+':'+GR.nodes[T].length),
  calls:GLR?GLR.info.render.calls:0,tris:GLR?GLR.info.render.triangles:0,geos:GLR?GLR.info.memory.geometries:0};
}
if(typeof window!='undefined'){window.__glb=grpInfo;window.__grb=()=>BLD.map(b=>[b.T,b.x,b.y,b.w,b.h,b.dx,b.H])}
