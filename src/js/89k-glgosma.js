// Gordão (k==2) morre → explode (clipe 'explode' do zumbi_gordao_v2.glb, 2 s) e deixa uma poça de gosma (props/gosma_bile.glb:
// clipe 'spawn' 1,2 s e depois 'bubble' em laço) que machuca quem estiver dentro (dano no host, 40-host.js: GOO/GOO_DPS).
// O host manda s.G=[[x,y,fa*10,idade_ms,id]] em todo snapshot; aqui só desenhamos (mesmos InstancedMesh dos zumbis, 89e).
const GOO_T={};let GOO_N=0;
// som da explosão: roda no snapshot (independe do desenho 3D); toca 1x por gosma nova
const GOO_S={},GOO_D={};
// poça da gosma = manchas de bile verde (mesmo sistema do sangue, 89n); dura até acabar a vida da gosma e então encolhe/some
function gooPuddle(x,y,life){const C=[.22,.36,.06],D=[.15,.27,.05];blSplat(x,y,118,0,C,life);for(let i=0;i<9;i++){const a=Math.random()*6.283,d=18+Math.random()*44;blSplat(x+Math.cos(a)*d,y+Math.sin(a)*d*.85,22+Math.random()*26,0,Math.random()<.5?C:D,life)}for(let i=0;i<5;i++){const a=Math.random()*6.283,d=50+Math.random()*30;blSplat(x+Math.cos(a)*d,y+Math.sin(a)*d*.85,6+Math.random()*9,0,D,life)}}
function fatBoomScan(G){for(const g of G){if(GOO_S[g[4]])continue;GOO_S[g[4]]=1;if(g[3]>1500)continue;const d=Math.hypot(g[0]-cx,g[1]-cy),v=Math.max(.25,1-d/1400);try{SND.fatBoom(v,(g[0]-cx)/600)}catch(e){}}}
function gooDraw(){
 const s=snap;if(!s||!s.G||!s.G.length)return;
 const now=Date.now();
 for(const g of s.G){let t0=GOO_T[g[4]];if(t0==null)t0=GOO_T[g[4]]=now-g[3];
  const age=now-t0,x=g[0],y=g[1];
  if(age<2000)glClipPush(5,x,y,Math.PI/2-g[2]/10,'explode',age/2000,1.3,1); // corpo estourando
  if(age>=GOO_ON){const left=GOO_LIFE-age,fd=Math.max(0,Math.min(1,left/1000));if(fd<=0)continue;
   const a=age-GOO_ON,sp=a<1200;
   if(!GOO_D[g[4]]){GOO_D[g[4]]=1;gooPuddle(x,y,left)}}}
 if(++GOO_N%300==0){const ids={};for(const g of s.G)ids[g[4]]=1;for(const k in GOO_T)if(!ids[k])delete GOO_T[k]}
}
