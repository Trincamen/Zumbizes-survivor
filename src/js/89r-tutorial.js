// ---------- 89r-tutorial.js — tutorial de primeira vez (8 páginas, abre quando a partida começa) ----------
// Abre sozinho no início da partida se localStorage 'tut' != '1'. Enquanto aberto, TUT_ON bloqueia a
// entrada do jogo (pushMove/onPD/onPM/teclas em 50-cliente.js). O jogo segue rodando por trás.
// Reabrir: botão COMO JOGAR no painel de opções (#opp). SEGUIR na última ou PULAR grava 'tut'.
var TUT_ON=0,TUT_P=0,TUT_MAN=0,TUT_SKIP=0,TUT_EL=null;
const TUTP=[
 ['ANDAR E ATIRAR','PC: <b>WASD</b> ou as setas andam. Clicar num inimigo com o mouse faz o personagem mirar nele; sem clicar, o jogo atira sozinho no zumbi mais perto. Celular: o <b>joystick</b> anda, tocar num inimigo mira nele e sem tocar o jogo atira sozinho.'],
 ['MINIMAPA — LUGARES','Canto superior direito; o mapa é sorteado a cada partida.<br><b>HOSPITAL</b> curas<br><b>POLÍCIA</b> armas<br><b>MERCADO</b> itens e dinheiro<br><b>AREA SEGURA</b> abrigo com torretas<br>No celular viram pontinho colorido com a inicial.'],
 ['MINIMAPA — PONTOS','<b>VOCÊ/ALIADOS</b> anel branco em você<br><b>ZUMBIS</b> pontinhos escuros<br><b>BOSS</b> bolinha roxa com o nome<br><b>ITENS</b> verdes (cura), vermelhas (armas) e amarelas (dinheiro)<br><b>LOJA</b> um $ piscando'],
 ['MELHORIA DA ARMA','O item laranja <b>Melhoria da arma</b> sobe a arma da mão até o nível 6: +10% de carregador e +25% de dano por nível. Também se compra na <b>LOJA</b> depois do boss.'],
 ['ÁREA SEGURA','É o abrigo do nascimento. As 4 <b>torretas</b> do telhado limpam a rua; com o <b>BOSS</b> chegando ou vivo a porta fecha, elas desligam e quem está dentro sai.'],
 ['SUBIR DE NÍVEL','O XP vem de matar zumbis. Cada nível dá +8 de vida máxima, mais velocidade, resistência e empurrão. <b>Estrela dourada</b> e barra amarela no canto superior esquerdo.'],
 ['ITENS DE CURA','No chão, na esfera 3D:<br><b>Bandagem</b> +20% da vida<br><b>Analgésico</b> 25 s andando 40% mais rápido<br><b>Kit de cura</b> +50%<br><b>Desfibrilador</b> levanta o aliado caído perto com metade da vida (manual)'],
 ['SUAS ARMAS','Barra embaixo à esquerda. Troque com 1–6, tocando no slot ou com um toque do 2º dedo; arraste o slot para fora para soltar. Kit/bandagem: segure o 2º dedo. <b>⚙</b> = opções.'],
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
 e.querySelector('#tutt').innerHTML=p[1];
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
 if(o){const b=document.createElement('button');b.className='sb';b.textContent='COMO JOGAR';b.onclick=()=>{o.style.display='none';tutOpen(1)};const f=$('obtns')||o;f.insertBefore(b,f.firstChild)}}
