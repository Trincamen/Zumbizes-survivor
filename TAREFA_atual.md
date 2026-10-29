# TAREFA_atual.md — Itens no chão em esfera flutuante (estilo GTA Vice City) + ícone 3D das armas no HUD

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Código-fonte fica em `src/`. NUNCA edite `game.html` nem o imprima.** Edite `src/js/*.js`, `src/style.css` e, no fim, rode `node build.js` (depois `node build.js --check`). Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.

## Objetivo
1. Todo item no chão (armas, curas, upgrades, dinheiro) é desenhado como um objeto que flutua e gira dentro de uma esfera translúcida brilhante (referência: GTA Vice City: bolha de vidro com brilho suave e o objeto girando no centro).
2. No HUD de baixo (barra de slots `#wb`), os slots de ARMA mostram a imagem 3D da arma (de lado), gerada do mesmo GLB.

## Estado atual (já analisado)
- Itens no chão: `src/js/90-sons.js`, laço `for(const[x,y,k,vv]of IL){...}` (grep `of IL)`), ~linhas 118-122. Hoje: sombra, anel amarelo (`X.arc(x,y,22+...)`) e ícone simples por tipo `k`: 0 kit médico (cruz vermelha em quadrado branco), 1 ⚡ (texto, cor #4df), 6 ★ (#fc0), 9 🩹, 10 💊, 8 moeda `$` (com valor `vv` embaixo), armas: `wi = k==7?0 : k==11?5 : k-1` (k 7→pistola 0, 2..5→1..4, 11→sniper 5). Mantenha as condições do laço: `if(!v(x,y))continue; const ib=bAt(x,y); if(ib&&ib!==meB)continue;` e o `bb` (oscilação).
- Armas 3D carregadas em `src/js/85-armas.js`: `WPG[i]` = `{P:Float32Array(nt*9),C:Uint8Array(nt*3),K,n:nt}` (vértices por triângulo, cor RGB por triângulo) ou `null`; ordem 0 pistola, 1 escopeta, 2 rifle, 3 metralhadora, 4 lança-chamas, 5 sniper. Origem do modelo = empunhadura, cano em +Z, Y para cima, metros; comprimento 0.5 a 2.7 m.
- Projeção usada no jogo (veja `drawPlayer` em `src/js/80-jogador.js`, trecho "Projeção": `SE,CE,K2,LV` globais): tela `sx=x+X*S`, `sy=y−(Y−Z*K2)*S`; face visível se a normal `n` (produto vetorial dos vértices, normalizada, depois da rotação em Y) satisfaz `n[1]*SE+n[2]*CE>0.02`; profundidade `d=média(Y*SE+Z*CE)`, ordenar crescente (painter); luz `l=.38+.78*max(0,n·LV)`; `fillStyle`=`strokeStyle`=`rgb(...)`, `lineWidth=.6`.
- HUD: `src/js/50-cliente.js`, onde monta `h+=q?\`<button ...><i class=kn>${i+1}</i>${q[0]<6?\`<b style="color:${WC[q[0]]}">${WN[q[0]]}</b><br>Nv ...\`:CL[q[0]][0]+...` (grep `class=kn`). Slots com `q[0]<6` são armas (índice = `q[0]`). CSS dos botões: `#wb button` em `src/style.css` (92×70 px no PC, 58×52 e 46×40 em telas menores/`.mob`; já têm `position:relative`).

## Arquivos
- PODE editar: `src/js/85-armas.js` (funções novas), `src/js/90-sons.js` (laço dos itens), `src/js/50-cliente.js` (HTML do slot), `src/style.css`.
- NÃO tocar: `server.js`, `Dockerfile`, `package*.json`, `game.html` (gerado), `build.js`.

## Passos
A. Em `src/js/85-armas.js`, nova `function drawWeapon3D(ctx,x,y,w,yaw,S)` : desenha a arma `w` (use `WPG[w]`; se null, retorna) no contexto `ctx`, centralizada em `(x,y)` na tela, girada em Y por `yaw` (rad), escala `S` px/m. Centralizar o modelo pelo centro do seu bounding box (calcule uma vez por arma e guarde em array `WCEN[w]=[cx,cy,cz]`, também `WDIM[w]` = maior dimensão em metros). Vértice: `(p−cen)`, rotação Y: `rx=px*cos(yaw)+pz*sin(yaw)`, `rz=-px*sin(yaw)+pz*cos(yaw)`; projeção/culling/luz/pintura como em "Projeção" acima, mas usando `ctx` em vez de `X`. Sem alocar objetos por triângulo (use arrays tipados globais de 450 triângulos; mínimo 420 do lança-chamas).
B. Em `src/js/85-armas.js`, `function weaponIcon(w)`: devolve data URL PNG da arma de lado, com cache `WICON[w]` (criar `document.createElement('canvas')` 112×56, `drawWeapon3D(cv.getContext('2d'),56,30,w,Math.PI/2,Math.min(26,100/WDIM[w]))`, `toDataURL()`; se falhar, `''`). `yaw=π/2` deixa o cano (+Z) apontando para a direita.
C. Em `src/js/85-armas.js`, `function drawPickup(x,y,k,vv,t,bb)` com a esfera. Chamado pelo laço de itens no lugar do anel amarelo e dos ícones antigos:
   1. Categoria → cor `col` (hex 6 dígitos): arma `#4fe8d0` (verde-água, como a referência); cura (k 0, 9, 10) `#5cf07a`; upgrade (k 1 e 6) `#ffd24a`; dinheiro (k 8) `#ffc83a`.
   2. Sombra no chão: `ell(x,y+12,14,5,'rgba(0,0,0,.4)')` (como hoje).
   3. Esfera: centro `cy=y-26+bb`, raio `R=24+Math.sin(t/300+x)*1` ; preenchimento com `createRadialGradient(cx-R*.25,cy-R*.3,R*.1,cx,cy,R)`: 0 → `rgba(col,.04)`, .7 → `rgba(col,.14)`, 1 → `rgba(col,.45)`; aro fino `strokeStyle rgba(col,.7)` lineWidth 1.5; reflexo: arco branco `rgba(255,255,255,.55)` pequeno no canto superior esquerdo (`arc` raio R*.78 de -2.6 a -1.9 rad, lineWidth 2); brilho externo com `globalCompositeOperation='lighter'` (círculo raio R*1.25 com gradiente `rgba(col,.22)`→0), voltar para `'source-over'`.
   4. Objeto dentro (centro `cy`): ARMA: `drawWeapon3D(X,x,cy,wi,t/700,Math.min(14,34/WDIM[wi]))` (wi como na fórmula acima); outros: o MESMO ícone que já existe hoje (kit com cruz, ⚡, ★, 🩹, 💊, moeda `$` com `vv`), desenhado em `(x,cy)` (troque `y+bb` por `cy`) e girando falsamente: `X.save();X.translate(x,0);X.scale(Math.max(.25,Math.abs(Math.cos(t/500))),1);X.translate(-x,0);` … `X.restore()` (cuidado: o texto `vv` da moeda fica FORA do scale, abaixo da esfera em `y+22`).
   5. O objeto interno deve ser desenhado ANTES do reflexo branco e do aro (para o vidro ficar por cima) — ordem: sombra, brilho externo, preenchimento, objeto, aro, reflexo.
D. Em `src/js/90-sons.js`: no laço `for(const[x,y,k,vv]of IL){...}` manter as 3 primeiras instruções (`v(x,y)`, `bAt`, `bb`) e substituir o resto (sombra, anel amarelo, cadeia `if(k==0)...else...`) por `drawPickup(x,y,k,vv,t,bb);`. Remover o código antigo de ícones desse laço (ele passa a viver em `drawPickup`).
E. HUD em `src/js/50-cliente.js`: no HTML do slot de arma (`q[0]<6`), inserir antes do nome `<img class=wi src="${weaponIcon(q[0])}">`. Em `src/style.css`: `.wi{position:absolute;left:50%;top:3px;transform:translateX(-50%);height:30px;max-width:80%;pointer-events:none;image-rendering:auto}` e em telas pequenas (`.mob #wb .wi` e na mesma media query onde `#wb button` encolhe para 58×52 / 46×40) altura 20px / 14px. Garanta que o nome e o "Nv x • a/b" continuem legíveis (se preciso, no slot de arma use `padding-top` no `<button>` via style inline ou um `<div style="height:..">` espaçador; o número da tecla `.kn` continua no canto).
F. `node build.js` e `node build.js --check`.

## Critério de pronto
1. `node build.js` sem erro; `--check` diz "em dia".
2. `grep -c 'drawPickup(' src/js/*.js` mostra definição e a chamada em `90-sons.js`; o laço de itens não tem mais `X.arc(x,y,22+` (anel amarelo).
3. `git status --short` só mostra: `src/js/85-armas.js`, `src/js/90-sons.js`, `src/js/50-cliente.js`, `src/style.css`, `game.html`.
4. (Claude testa no navegador depois: esfera com cada categoria, arma girando, HUD com ícones.)
