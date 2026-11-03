// ---------- 89q-hudedit.js — editor de HUD: mover/redimensionar cada bloco (PC e celular) ----------
// Layout em LS 'hudlay' = {id:{x,y,s}} (x,y px de translate; s multiplicador 0.5–2.5).
// Usa as propriedades CSS INDIVIDUAIS translate/scale para compor com o transform que já existe.
const HUDK='hudlay',HIDS=['gh2','gmm','gsc','wb'],HLB={gh2:'VIDA/XP',gmm:'MAPA',gsc:'PLACAR',wb:'ARMAS'};
let HUDL=null,HEDIT=0,HSEL='gh2',HBOX={},HDRG=null,HUDT=[];const hudSeen={};
const hudS=v=>Math.max(.5,Math.min(2.5,+v||1));
function hudLoad(){
 if(HUDL)return HUDL;
 let o=null;try{o=JSON.parse(LS.get(HUDK)||'null')}catch(e){o=null}
 HUDL={};for(let i=0;i<HIDS.length;i++){const k=HIDS[i],d=(o&&o[k])||{};
  HUDL[k]={x:+d.x||0,y:+d.y||0,s:hudS(d.s)}}
 return HUDL}
function hudSave(){try{LS.set(HUDK,JSON.stringify(hudLoad()))}catch(e){}}
function hudApply(id){
 const e=$(id);if(!e)return;const l=hudLoad()[id];
 if(l.x||l.y)e.style.translate=l.x+'px '+l.y+'px';else e.style.removeProperty('translate');
 if(l.s!==1)e.style.scale=String(l.s);else e.style.removeProperty('scale');
}
function hudOpt(){try{if(typeof optPos==='function')optPos()}catch(e){}}
function hudApplyAll(){for(let i=0;i<HIDS.length;i++)hudApply(HIDS[i]);hudOpt()}
// retângulo de tela do bloco. #gh2 é 0x0: usa a UNIÃO dos filhos; sem filhos visíveis, estima 220x140.
function hudRect(id){
 const e=$(id);if(!e)return null;
 if(id!=='gh2'){const q=e.getBoundingClientRect();return{left:q.left,top:q.top,width:q.width,height:q.height,real:1}}
 let r=null;
 for(let i=0;i<e.children.length;i++){const c=e.children[i];
  if(c.style.display==='none')continue;const q=c.getBoundingClientRect();
  if(!q.width&&!q.height)continue;
  r=r?{left:Math.min(r.left,q.left),top:Math.min(r.top,q.top),right:Math.max(r.right,q.right),bottom:Math.max(r.bottom,q.bottom)}:{left:q.left,top:q.top,right:q.right,bottom:q.bottom}}
 if(!r||(!(r.right-r.left)&&!(r.bottom-r.top))){
  const l=hudLoad()[id];return{left:l.x,top:l.y,width:220*l.s,height:140*l.s,real:0}}
 return{left:r.left,top:r.top,width:r.right-r.left,height:r.bottom-r.top,real:1}}
// mantém o retângulo dentro da tela
function hudClamp(id){
 const l=hudLoad()[id],W=innerWidth,H=innerHeight;
 for(let n=0;n<3;n++){
  const r=hudRect(id);if(!r||!r.real||(!r.width&&!r.height))return;
  let dx=0,dy=0;
  if(r.left<0)dx=-r.left;else if(r.left+r.width>W)dx=W-(r.left+r.width);
  if(r.top<0)dy=-r.top;else if(r.top+r.height>H)dy=H-(r.top+r.height);
  if(!dx&&!dy)return;
  l.x+=dx;l.y+=dy;hudApply(id);hudOpt()}}
function hudBoxPos(){
 for(let i=0;i<HIDS.length;i++){const id=HIDS[i],b=HBOX[id];if(!b)continue;
  const r=hudRect(id);if(!r)continue;
  b.style.left=r.left+'px';b.style.top=r.top+'px';
  b.style.width=Math.max(26,r.width)+'px';b.style.height=Math.max(26,r.height)+'px';
  b.classList.toggle('sel',id===HSEL)}}
function hudScale(d){
 const l=hudLoad()[HSEL];l.s=hudS(Math.round((l.s+d)*100)/100);
 hudApply(HSEL);hudOpt();hudBoxPos();hudSave()}
function hudReset(){
 for(let i=0;i<HIDS.length;i++){const l=hudLoad()[HIDS[i]];l.x=0;l.y=0;l.s=1}
 hudApplyAll();hudBoxPos();hudSave()}
function hudSel(id){HSEL=id;hudBoxPos()}
function hudPd(e){
 if(!HEDIT)return;
 const b=e.currentTarget,id=b.dataset.hid;
 hudSel(id);e.stopPropagation();e.preventDefault();
 try{b.setPointerCapture(e.pointerId)}catch(x){}
 const l=hudLoad()[id];HDRG={id:id,px:e.clientX,py:e.clientY,x0:l.x,y0:l.y,id2:e.pointerId};
}
function hudPm(e){
 if(!HDRG||HDRG.id2!==e.pointerId)return;
 e.stopPropagation();e.preventDefault();
 const l=hudLoad()[HDRG.id];
 l.x=Math.round(HDRG.x0+(e.clientX-HDRG.px));l.y=Math.round(HDRG.y0+(e.clientY-HDRG.py));
 hudApply(HDRG.id);hudOpt();hudClamp(HDRG.id);hudBoxPos();
}
function hudPu(e){
 if(!HDRG||HDRG.id2!==e.pointerId)return;
 const b=HBOX[HDRG.id];try{if(b&&b.releasePointerCapture)b.releasePointerCapture(e.pointerId)}catch(x){}
 HDRG=null;hudSave();
}
function hudWheel(e){
 if(!HEDIT)return;
 e.preventDefault();e.stopPropagation();
 const id=e.currentTarget.dataset.hid;hudSel(id);
 hudScale(e.deltaY>0?-.1:.1);
}
function hudBoxes(){
 for(let i=0;i<HIDS.length;i++){const id=HIDS[i];let b=HBOX[id];
  if(!b){b=document.createElement('div');b.className='hbox';b.dataset.hid=id;
   b.innerHTML='<span>'+HLB[id]+'</span>';document.body.appendChild(b);HBOX[id]=b;
   b.addEventListener('pointerdown',hudPd);
   b.addEventListener('pointermove',hudPm);
   b.addEventListener('pointerup',hudPu);
   b.addEventListener('pointercancel',hudPu);
   b.addEventListener('wheel',hudWheel,{passive:false})}
  b.style.display='block'}
 hudBoxPos()}
function hudBar(show){
 let b=$('hbar');
 if(!b){b=document.createElement('div');b.id='hbar';
  b.innerHTML='<button data-h="-" title="Diminuir">−</button><button data-h="+" title="Aumentar">+</button><button data-h="R" class="hr">RESTAURAR</button><button data-h="OK" class="hok">PRONTO</button>';
  document.body.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.stopPropagation()});
  b.addEventListener('click',e=>{e.stopPropagation();
   const a=e.target&&e.target.dataset?e.target.dataset.h:null;if(!a)return;
   if(a==='-'||a==='+')hudScale(a==='+'?.1:-.1);
   else if(a==='R'){if(confirm('Restaurar o HUD para o padrão?'))hudReset()}
   else if(a==='OK')hudEdit(false)})}
 b.style.display=show?'flex':'none'}
function hudEdit(on){
 on=!!on;HEDIT=on;
 document.body.classList.toggle('hed',on);
 if(on){const p=$('opp');if(p)p.style.display='none';
  hudLoad();hudApplyAll();HSEL='gh2';hudBoxes();hudBar(1)}
 else{for(const k in HBOX)HBOX[k].style.display='none';hudBar(0);HDRG=null;hudSave();hudApplyAll()}
}
function hudClampNow(){
 for(let i=0;i<HIDS.length;i++)hudClamp(HIDS[i]);
 if(HEDIT)hudBoxPos();
 hudOpt()}
function hudReclamp(){
 hudClampNow();
 for(let i=1;i<HUDT.length;i++)clearTimeout(HUDT[i]);
 HUDT=[HUDT[0]||0,setTimeout(hudClampNow,150),setTimeout(hudClampNow,500),setTimeout(hudClampNow,1200)]}
hudApplyAll();addEventListener('resize',hudReclamp);setTimeout(hudReclamp,1200);
// #gmm é criado só quando o HUD aparece (ghInit): aplica o layout assim que o bloco existir.
try{const mo=new MutationObserver(function(){
 let all=1;
 for(let i=0;i<HIDS.length;i++){const k=HIDS[i];if(hudSeen[k])continue;
  if($(k)){hudSeen[k]=1;hudApply(k);hudClamp(k);if(HEDIT)hudBoxPos()}else all=0}
 if(all)mo.disconnect()});
 mo.observe(document.body,{childList:true,subtree:true})}catch(e){}
