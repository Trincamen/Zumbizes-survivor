// ---------- 89r-tutorial.js — tutorial de primeira vez (7 páginas, abre quando a partida começa) ----------
// Abre sozinho no início da partida se localStorage 'tut' != '1'. Enquanto aberto, TUT_ON bloqueia a
// entrada do jogo (pushMove/onPD/onPM/teclas em 50-cliente.js). O jogo segue rodando por trás.
// Reabrir: botão COMO JOGAR no painel de opções (#opp). SEGUIR na última ou PULAR grava 'tut'.
var TUT_ON=0,TUT_P=0,TUT_MAN=0,TUT_SKIP=0,TUT_EL=null;
const TUTP=[
 ['ANDAR E ATIRAR','PC: WASD ou setas andam, o mouse aponta e o clique atira. Celular: arraste embaixo para andar e toque para atirar. A arma atira sozinha para onde olha.'],
 ['MINIMAPA','Canto superior direito: HOSPITAL = curas, POLÍCIA = armas, MERCADO = itens e dinheiro, AREA SEGURA = abrigo com torretas. Anel branco = você, roxo = boss, $ = loja.'],
 ['MELHORIA DA ARMA','O item laranja sobe a arma da mão até o nível 6: +10% de carregador e +25% de dano por nível. Também se compra na loja depois do boss ($ no minimapa).'],
 ['ÁREA SEGURA','Prédio do nascimento. As 4 torretas do telhado limpam a rua. Com o boss chegando ou vivo a porta fecha, as torretas desligam e quem está dentro sai.'],
 ['SUBIR DE NÍVEL','O XP vem de matar zumbis. Cada nível dá +8 de vida máxima, mais velocidade, resistência e empurrão. Estrela dourada e barra amarela no canto superior esquerdo.'],
 ['ITENS DE CURA','Bandagem: +20% da vida. Kit: +50%. Analgésico: 25 s andando 40% mais rápido. Desfibrilador: levanta um aliado caído perto com metade da vida (manual).'],
 ['SUAS ARMAS','Embaixo à esquerda. Troque com 1–6, tocando no slot ou com um toque do 2º dedo; arraste o slot para fora para soltar. Kit/bandagem: segure o 2º dedo. ⚙ = opções.'],
];
function tutBuild(){
 if(TUT_EL)return TUT_EL;
 const d=document.createElement('div');d.id='tut';d.className='pn';
 d.innerHTML='<div class="tt"><b>TUTORIAL</b><span id="tutn"></span><button id="tutc" title="fechar">X</button></div>'+
  '<div id="tuti" class="ti"></div><div id="tutt" class="tx"></div>'+
  '<div class="tf"><button class="sb" id="tutx">PULAR</button><button class="sb" id="tuts">SEGUIR</button></div>';
 d.addEventListener('pointerdown',e=>{e.stopPropagation()});
 d.addEventListener('pointerup',e=>{e.stopPropagation()});
 document.body.appendChild(d);
 TUT_EL=d;
 d.querySelector('#tuts').onclick=()=>tutGo(1);
 d.querySelector('#tutx').onclick=()=>tutClose(TUT_MAN?0:1);
 d.querySelector('#tutc').onclick=()=>tutClose(0);
 return d;
}
function tutPage(){
 const e=tutBuild(),p=TUTP[TUT_P]||TUTP[0];
 e.querySelector('#tutn').textContent=(TUT_P+1)+'/'+TUTP.length;
 const im=e.querySelector('#tuti');im.className='ti tp'+(TUT_P+1);
 e.querySelector('#tutt').textContent=p[1];
 e.querySelector('#tuts').textContent=TUT_P>=TUTP.length-1?'ENTENDI':'SEGUIR';
 e.scrollTop=0;
}
function tutOpen(man){
 TUT_MAN=man?1:0;TUT_P=0;TUT_ON=1;tutPage();tutBuild().style.display='block';
}
function tutGo(d){
 if(TUT_P>=TUTP.length-1){tutClose(TUT_MAN?0:1);return}
 TUT_P=Math.max(0,Math.min(TUTP.length-1,TUT_P+d));tutPage();
}
function tutClose(save){
 TUT_ON=0;if(TUT_EL)TUT_EL.style.display='none';
 if(save){LS.set('tut','1');TUT_SKIP=0}else if(!TUT_MAN)TUT_SKIP=1;
 TUT_MAN=0;
}
// chamado do onSnap (50-cliente.js): abre na primeira partida, esconde fora da partida
function tutCheck(s){
 if(!s)return;
 if(s.ph!=1){if(TUT_ON&&!TUT_MAN)tutClose(0);return}
 if(TUT_ON||TUT_SKIP)return;
 if(LS.get('tut')=='1')return;
 tutOpen(0);
}
{const o=$('opp'); // botão COMO JOGAR no painel de opções (reabre o tutorial a qualquer hora)
 if(o){const b=document.createElement('button');b.className='sb';b.textContent='COMO JOGAR';b.onclick=()=>{o.style.display='none';tutOpen(1)};o.insertBefore(b,o.firstChild.nextSibling)}}
