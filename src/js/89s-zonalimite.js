// Limite de tempo na Área Segura: cronômetro no topo (só enquanto está dentro) e mensagem de bronca quando é expulso
// ou tenta entrar durante a espera. Dados vêm do host por jogador: P[i][36]=segundos restantes, [37]=contador de mensagens, [38]=qual frase.
const ZL_MSG=['Eles não aguentam mais ver sua cara.','Cara, você tá aqui pra matar zumbi ou ficar conversando no celular?','Os NPCs precisam de espaço também.','Éééé... Quer uma ajuda? '+(typeof MOB!=='undefined'&&MOB?'Abre o ⚙':'Aperta Esc')+', vai em COMO JOGAR e aprende!!!'];
let ZL={t:null,m:null,n:null,mt:0};
function zlInit(){
 if(ZL.t)return;
 const st=document.createElement('style');
 st.textContent='#zlt{position:fixed;left:50%;top:calc(34px + 2vh);transform:translateX(-50%);z-index:6;display:none;pointer-events:none;font:700 max(26px,2.6vw) Dracutaz,sans-serif;color:#fff;white-space:nowrap;text-shadow:-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000}#zlt small{display:block;text-align:center;font-size:.45em;color:#e8c25a}#zlt.lo{color:#ff5a4a}'+
 '#zlm{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:7;display:none;pointer-events:none;max-width:84vw;text-align:center;font:700 max(18px,1.9vw) Dracutaz,sans-serif;color:#ffd75a;text-shadow:-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000,0 0 14px #000}';
 document.head.appendChild(st);
 ZL.t=document.createElement('div');ZL.t.id='zlt';document.body.appendChild(ZL.t);
 ZL.m=document.createElement('div');ZL.m.id='zlm';document.body.appendChild(ZL.m);
}
function zlTick(s,me){
 zlInit();
 const sec=me&&me[36]>0&&!me[7]&&s.ph==1?me[36]:0;
 if(sec){const m=Math.floor(sec/60),r=sec%60,tx=m+':'+(r<10?'0':'')+r;
  if(ZL.t.dataset.v!==tx){ZL.t.dataset.v=tx;ZL.t.innerHTML=tx+'<small>ÁREA SEGURA</small>'}
  ZL.t.className=sec<=15?'lo':'';ZL.t.style.display='block'}
 else ZL.t.style.display='none';
 if(me&&me[37]!=null){
  if(ZL.n===null)ZL.n=me[37];
  else if(me[37]!==ZL.n){ZL.n=me[37];ZL.m.textContent=ZL_MSG[me[38]|0]||ZL_MSG[0];ZL.m.style.display='block';ZL.mt=Date.now()+4500}}
 if(ZL.m.style.display==='block'&&Date.now()>ZL.mt)ZL.m.style.display='none';
}
