# TAREFA_atual.md — Carros fase 1 (sprites GLB pré-renderizados nos obstáculos t==2)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, snapshot/rede, `genMap` (índices `o.i`, RNG, tamanhos 92×46 / 46×92 e colisão NÃO mudam), `CENGLB` (índices 0–26 fixos), zumbis, jogador, boss, `10-mapa.js`.

## Objetivo
Trocar o desenho procedural dos carros (`t==2`) por sprites de GLB pré-renderizados na projeção oblíqua do jogo, com fallback ao desenho atual se o sprite faltar. Só visual: hitbox, geração e rede ficam iguais.

## Fatos já mapeados
- Carro = `{x,y,w,h,t:2,c,i}`; horizontal `w=92,h=46`, vertical `w=46,h=92` (orientação = `w>h`). Colide pelo retângulo (`blk`).
- Desenho: `obst(o)` em `60-desenho.js:25`; ramo `o.t==2` na linha 31. Padrão a copiar: t:1 (linha 30) e t:3 (linha 32): `if(!cenDraw(X,sprite,xCentro,yPé)){fallback}`.
- `86-cenario.js`: `cenLoad(b64,skip)` (:34, devolve `{P,C,N,NM,n,extras}`), `cenMakeObl(g,o)` (:95, `o={w,d,hpx,ss,rot,fx,fz,cx,cz,fy,grp,nosort}` → `{cv,ax,ay,w,h}`), `cenDraw(ctx,sp,x,y)` (:85, cria `sp.bm` ImageBitmap). Blocos de GLB separados de `CENGLB` já existem (`CEN_RGLB`/`CEN_PGLB`, ~:236–240): copie o molde. `build.js` troca `'@@GLB:assets/...glb@@'` pelo base64.
- Os GLBs de veículo têm nó raiz `world` com rotação -90° em X (Z-up → Y-up), frente em **+X**, extras `size_xyz_length_width_height` (sedan/polícia: 4,6 × 1,85 × 1,45 m). `cenMakeObl` hoje só lê `footprint_xz`/`wall_height`; NÃO lê `size_xyz_*`. Confirme que `cenLoad` aplica a rotação do nó `world`.

## Mudanças
1. Copiar de `~/Downloads/files (2)/` para `src/assets/veiculos/`: `carro_sedan.glb`, `carro_policia.glb`, `carro_esportivo.glb`, `jeep.glb`, `caminhonete.glb` (só estes 5; NÃO copiar caminhão, bombeiros, bicicletas).
2. `86-cenario.js`: lista nova `VGLB` (5 entradas `'@@GLB:assets/veiculos/NOME.glb@@'`, mesmo molde de `CEN_RGLB`) e `VEH_SPR` (por modelo, 2 sprites: `[horizontal, vertical]`). Pré-render dentro de `initCenario` (antes de `initCenario();`), com cache e `try/catch` por modelo (falha → entrada `null` → fallback). Escala fixa **20 px/m**: comprimento (`size_xyz` length) → 92 px; largura e altura na mesma escala (`d = largura*20`, `hpx = altura*20`). Horizontal = frente +X (`rot` 0); vertical = `rot` π/2 (use o sinal que fizer a frente apontar para BAIXO/sul na tela; frente não precisa casar com nada, só ficar coerente). Reutilize `cenMakeObl`; se precisar ler `size_xyz_length_width_height` de `g.extras`, leia no próprio código novo, sem mudar o comportamento dos props existentes.
3. Escolha do modelo: função `vehIdx(o)` determinística por `o.i` (ex.: `(o.i*7+3)%5`). PROIBIDO `Math.random`. Cor fixa do GLB; `o.c` segue só para partículas.
4. `60-desenho.js:31`: no ramo `o.t==2`, tentar `cenDraw(X, VEH_SPR[vehIdx(o)][o.w>o.h?0:1], âncora)` e só cair no desenho atual se retornar falso. Âncora: `cenMakeObl` devolve `ax,ay` = centro da pegada no chão; a pegada deve ficar sobre o retângulo `x..x+w, y..y+h` (centro `x+w/2, y+h/2`) — confirme visualmente que o carro assenta no retângulo (rodas dentro, sem flutuar nem afundar). Mantenha a sombra elíptica atual por baixo do sprite.
5. Fumaça/fogo `FIRES` de carro (`10-mapa.js:25`, ponto `cy-8`): só conferir que sai do capô/teto de forma aceitável; se ficar claramente errado, ajuste o deslocamento APENAS no ponto de desenho/emissão (em `90-sons.js`/`60-desenho.js`), nunca em `10-mapa.js`.

## Critério de pronto
- `node build.js`, `node build.js --check`, `node --check` do maior `<script>` ok; `git diff` só em `86-cenario.js`, `60-desenho.js` (+ `90-sons.js` se o item 5 exigir), `src/assets/veiculos/*.glb` e `game.html`.
- Em `solo()` (Firefox com janela, ver RETOMADA "Como testar"; use cópia do `game.html` na HOME): teleportar perto de carros e tirar prints (`~/scratch_carros/`): os 5 modelos aparecem, nas 2 orientações, assentados no retângulo, sem cortar/clipar o sprite, passando por trás/na frente do jogador conforme o `y`. Console sem erros; `cenario ms` < 600 (anotar antes/depois); `window.__prof=1` sem piora relevante de `obst`.
- Relatório ≤8 linhas em `saidas/relatorio.txt`: medidas do sprite (`ax,ay,w,h`) por modelo, `cenario ms`, e o que não deu para verificar (multiplayer, APK, fogo).
