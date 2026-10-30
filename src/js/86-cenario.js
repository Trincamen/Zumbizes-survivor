// ---------- CENÁRIO 3D: props (árvores t:1, caixas t:3, decoração) pré-renderizados UMA vez a partir de GLB ----------
// Índices fixos: 0 redonda, 1 pinheiro, 2 morta, 3 caixa de munição (NÃO mudar: usados por CEN_SPR[o.i%3] e CEN_SPR[3])
// 4 arbusto, 5 pedra_pequena, 6 pedra_media, 7 pedra_grande, 8 poste_luz, 9 poste_luz_quebrado, 10 hidrante,
// 11 galão, 12 caixa_municao_pequena, 13 caixa_cartuchos, 14 cabine, 15 ponto_onibus
const CENGLB=['@@GLB:assets/props/arvore_redonda.glb@@','@@GLB:assets/props/arvore_pinheiro.glb@@','@@GLB:assets/props/arvore_morta.glb@@','@@GLB:assets/props/caixa_municao.glb@@','@@GLB:assets/props/arbusto.glb@@','@@GLB:assets/props/pedra_pequena.glb@@','@@GLB:assets/props/pedra_media.glb@@','@@GLB:assets/props/pedra_grande.glb@@','@@GLB:assets/props/poste_luz.glb@@','@@GLB:assets/props/poste_luz_quebrado.glb@@','@@GLB:assets/props/hidrante.glb@@','@@GLB:assets/props/galao_combustivel.glb@@','@@GLB:assets/props/caixa_municao_pequena.glb@@','@@GLB:assets/props/caixa_cartuchos.glb@@','@@GLB:assets/props/cabine_telefonica.glb@@','@@GLB:assets/props/ponto_onibus.glb@@'];
const CENCFG=[[100,'y'],[110,'y'],[90,'y'],[40,'x'],[34,'y'],[22,'y'],[36,'y'],[60,'y'],[130,'y'],[130,'y'],[30,'y'],[28,'y'],[26,'x'],[24,'x'],[80,'y'],[150,'x']];
const CEN_SPR=[];
const CEN_CSS={};

// componente de cor 0..255, respeitando normalized/float
function cenCol(j,ai,arr,k){
 const a=j.accessors[ai],nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type]||4,ct=a.componentType;
 const mx=ct===5121?255:ct===5123?65535:ct===5122?32767:ct===5120?127:1;
 const g=c=>{let x=arr[k*nc+Math.min(c,nc-1)];if(ct===5126)return Math.max(0,Math.min(255,x<=1?x*255:x));return a.normalized?x/mx*255:x};
 return [g(0),g(1),g(2)];
}
// matriz 4x4 coluna-maior a partir de translation/rotation/scale/matrix do nó
function cenNodeMat(n){
 if(n.matrix&&n.matrix.length===16)return n.matrix.slice();
 const t=n.translation||[0,0,0],s=n.scale||[1,1,1],q=n.rotation||[0,0,0,1],qx=q[0],qy=q[1],qz=q[2],qw=q[3];
 const m=[1-2*(qy*qy+qz*qz),2*(qx*qy+qz*qw),2*(qx*qz-qy*qw),0,
          2*(qx*qy-qz*qw),1-2*(qx*qx+qz*qz),2*(qy*qz+qx*qw),0,
          2*(qx*qz+qy*qw),2*(qy*qz-qx*qw),1-2*(qx*qx+qy*qy),0,
          0,0,0,1];
 for(let c=0;c<3;c++)for(let r=0;r<3;r++)m[c*4+r]*=s[c];
 m[12]=t[0];m[13]=t[1];m[14]=t[2];return m;
}
function cenMul(a,b){const o=new Array(16);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v}
 return o}
// GLB -> {P:[x,y,z por vértice de face], C:cor por face, n:faces} com hierarquia de nós aplicada (mundo)
function cenLoad(b64){
 const {j,acc}=pgParseGlb(b64),P=[],C=[],sc=j.scenes&&j.scenes[j.scene||0],roots=sc&&sc.nodes?sc.nodes:[];
 const walk=(ni,mw)=>{const nd=j.nodes[ni];if(!nd)return;const m=cenMul(mw,cenNodeMat(nd));
  if(nd.mesh!=null)for(const pr of j.meshes[nd.mesh].primitives){
   if(pr.mode!=null&&pr.mode!==4)continue;
   const pos=acc(pr.attributes.POSITION),ci=pr.attributes.COLOR_0,id=pr.indices!=null?acc(pr.indices):null;
   const nv=pos.length/3,nt=id?id.length/3|0:nv/3|0;
   for(let f=0;f<nt;f++){const cols=[];
    for(let k=0;k<3;k++){const vi=id?id[f*3+k]|0:f*3+k,px=pos[vi*3],py=pos[vi*3+1],pz=pos[vi*3+2];
     P.push(m[0]*px+m[4]*py+m[8]*pz+m[12],m[1]*px+m[5]*py+m[9]*pz+m[13],m[2]*px+m[6]*py+m[10]*pz+m[14]);
     cols.push(ci!=null?cenCol(j,ci,acc(ci),vi):[200,200,200])}
    C.push((cols[0][0]+cols[1][0]+cols[2][0])/3|0,(cols[0][1]+cols[1][1]+cols[2][1])/3|0,(cols[0][2]+cols[1][2]+cols[2][2])/3|0)}}
  for(const ch of nd.children||[])walk(ch,m)};
 const I=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
 for(const r of roots)walk(r,I);
 return {P:new Float32Array(P),C:new Uint8Array(C),n:C.length/3|0};
}
// sprite offscreen: yaw fixo, pé (origem do modelo, y=0) na âncora ax/ay (px CSS)
function cenMake(g,target,dim,yaw,ss){
 if(!g||!g.n)return null;
 const co=Math.cos(yaw),si=Math.sin(yaw),P=g.P,n=g.n;
 const RX=new Float32Array(n*9),RY=new Float32Array(n*9),RZ=new Float32Array(n*9),SX=new Float32Array(n*9),SY=new Float32Array(n*9),D=new Float32Array(n),O=new Int32Array(n);
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(let i=0;i<n*3;i++){const px=P[i*3],py=P[i*3+1],pz=P[i*3+2];
  const rx=px*co+pz*si,rz=-px*si+pz*co,sx=rx,sy=-(py-rz*K2);
  RX[i*3]=rx;RY[i*3]=py;RZ[i*3]=rz;SX[i*3]=sx;SY[i*3]=sy;
  if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy}
 const span=Math.max(.001,dim=='x'?x1-x0:y1-y0),S=target/span,MG=4;
 const cw=Math.max(2,Math.ceil((x1-x0)*S+2*MG)),chh=Math.max(2,Math.ceil((y1-y0)*S+2*MG));
 const cv=document.createElement('canvas');cv.width=Math.ceil(cw*ss);cv.height=Math.ceil(chh*ss);
 const c2=cv.getContext('2d');if(!c2)return null;
 const FC=new Array(n);let fc=0;
 for(let f=0;f<n;f++){const b=f*9;
  const ux=RX[b+3]-RX[b],uy=RY[b+3]-RY[b],uz=RZ[b+3]-RZ[b],vx=RX[b+6]-RX[b],vy=RY[b+6]-RY[b],vz=RZ[b+6]-RZ[b];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const ln=Math.hypot(nx,ny,nz)||1;nx/=ln;ny/=ln;nz/=ln;
  if(ny*SE+nz*CE<=.02)continue;
  const li=.38+.78*Math.max(0,nx*LV[0]+ny*LV[1]+nz*LV[2]),ci=f*3,key=(Math.min(255,g.C[ci]*li)|0)<<16|(Math.min(255,g.C[ci+1]*li)|0)<<8|(Math.min(255,g.C[ci+2]*li)|0);
  if(CEN_CSS[key]==null)CEN_CSS[key]='rgb('+(key>>16)+','+(key>>8&255)+','+(key&255)+')';
  FC[f]=CEN_CSS[key];
  D[fc]=((RY[b+1]+RY[b+4]+RY[b+7])/3)*SE+((RZ[b+2]+RZ[b+5]+RZ[b+8])/3)*CE;O[fc]=f;fc++}
 const ord=O.subarray(0,fc);ord.sort((a,b)=>D[a]-D[b]);
 c2.setTransform(ss,0,0,ss,0,0);c2.lineWidth=.7;c2.lineJoin='round';let last='';
 for(let i=0;i<fc;i++){const f=ord[i],b=f*9,css=FC[f];
  if(css!==last){c2.fillStyle=css;c2.strokeStyle=css;last=css}
  c2.beginPath();
  for(let k=0;k<3;k++){const xi=b+k*3,cx=(SX[xi]-x0)*S+MG,cy=(SY[xi]-y0)*S+MG;c2[k?'lineTo':'moveTo'](cx,cy)}
  c2.closePath();c2.fill();c2.stroke()}
 return {cv,ax:(0-x0)*S+MG,ay:(0-y0)*S+MG,w:cw,h:chh};
}
function cenDraw(ctx,sp,x,y){
 if(!sp||!sp.cv)return 0;
 try{ctx.drawImage(sp.cv,x-sp.ax,y-sp.ay,sp.w,sp.h);return 1}catch(e){return 0}
}
// pré-renderiza uma única vez no boot
function initCenario(){
 const t0=(performance&&performance.now?performance.now():Date.now());
 const cfg=CENCFG;
 for(let i=0;i<CENGLB.length;i++){CEN_SPR[i]=null;
  try{CEN_SPR[i]=cenMake(cenLoad(CENGLB[i]),cfg[i][0],cfg[i][1],.6,i<4?3:2)}catch(e){CEN_SPR[i]=null;console.warn('cenario',i,e)}}
 console.log('cenario ms',Math.round((performance&&performance.now?performance.now():Date.now())-t0));
}
initCenario();
// ---------- DECORAÇÃO espalhada (sem colisão, só visual) ----------
// PRNG próprio + semente derivada de sd: host e TODOS os clientes geram a mesma lista.
let DECOR=[];
function cenRng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function genDecor(sd){
 const rnd=cenRng((sd^0x5bd1e995)>>>0),q=(m,n)=>m+rnd()*(n-m),out=[],cells=[];
 for(const j of ROWS)for(let i=0;i<8;i++)cells.push([i,j]);
 const ok=(x,y)=>{if(x<40||y<40||x>MW-40||y>MH-40)return 0;
  if(y>RY0-90&&y<RY1+90)return 0;
  if(Math.hypot(x-2000,y-4500)<200)return 0;
  if(blk(x,y,40))return 0;
  for(const b of BLD)if(x>b.x-60&&x<b.x+b.w+60&&y>b.y-60&&y<b.y+b.h+60)return 0;
  return 1};
 for(let n=0;out.length<350&&n<1600;n++){
  const c=cells[n%cells.length],bx=c[0]*500+60,by=c[1]*500+60;let x=0,y=0,s=-1;
  if(rnd()<.7){ // grama: arbusto e pedras
   x=bx+q(20,355);y=by+q(20,355);const r=rnd();
   s=r<.68?4:r<.84?5:r<.96?6:7}
  else{ // calçada/rua, na borda do quarteirão
   const e=rnd()*4|0,u=q(30,350);
   if(e==0){x=bx+u;y=by-26}else if(e==1){x=bx+u;y=by+404}else if(e==2){x=bx-26;y=by+u}else{x=bx+404;y=by+u}
   const r=rnd();s=r<.6?(rnd()<1/6?9:8):r<.8?10:r<.92?14:15}
  if(s<0||!ok(x,y))continue;
  out.push({x:Math.round(x),y:Math.round(y),s});
 }
 return out;
}
