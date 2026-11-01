// Gordão (k==2) morre → explode (clipe 'explode' do zumbi_gordao_v2.glb, 2 s) e deixa uma poça de gosma (props/gosma_bile.glb:
// clipe 'spawn' 1,2 s e depois 'bubble' em laço) que machuca quem estiver dentro (dano no host, 40-host.js: GOO/GOO_DPS).
// O host manda s.G=[[x,y,fa*10,idade_ms,id]] em todo snapshot; aqui só desenhamos (mesmos InstancedMesh dos zumbis, 89e).
const GOO_T={};let GOO_N=0;
function gooDraw(){
 const s=snap;if(!s||!s.G||!s.G.length)return;
 const now=Date.now();
 for(const g of s.G){let t0=GOO_T[g[4]];if(t0==null)t0=GOO_T[g[4]]=now-g[3];
  const age=now-t0,x=g[0],y=g[1];
  if(age<2000)glClipPush(5,x,y,Math.PI/2-g[2]/10,'explode',age/2000,1.3,1); // corpo estourando
  if(age>=GOO_ON){const left=GOO_LIFE-age,fd=Math.max(0,Math.min(1,left/1000));if(fd<=0)continue;
   const a=age-GOO_ON,sp=a<1200;
   glClipPush(6,x,y,0,sp?'spawn':'bubble',sp?a/1200:((a-1200)/2033)%1,65*fd,1,1,1)}}
 if(++GOO_N%300==0){const ids={};for(const g of s.G)ids[g[4]]=1;for(const k in GOO_T)if(!ids[k])delete GOO_T[k]}
}
