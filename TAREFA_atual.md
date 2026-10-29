# TAREFA_atual.md — Tiro sai do cano de cada arma + efeitos de tiro mais fortes

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Código-fonte fica em `src/`. NUNCA edite `game.html` nem o imprima.** Edite `src/js/*.js` e, no fim, rode `node build.js` (depois `node build.js --check`). Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.

## Problemas (reportados pelo usuário)
1. O tiro sai sempre do mesmo ponto do corpo; deve sair da BOCA do cano da arma em uso, que fica em posição diferente em cada arma.
2. O efeito do tiro/bala está fraco; quer bem mais impacto visual ao atirar.

## Estado atual (já analisado)
- Evento de tiro chega em `src/js/50-cliente.js` (grep `FXL.push`): `f=[x0,y0,x1,y1,w,id,pid,hit]`, `w`=arma (0 pistola, 1 escopeta (6 balins), 2 rifle, 3 metralhadora, 4 lança-chamas, 5 sniper), `pid`=jogador que atirou (`f[6]`), faz `FXL.push({f,t:Date.now(),life:...});sfxShot(f);LSH[f[6]]=Date.now();hitFx(f)`. Variáveis globais: `FXL`, `LSH`, `id` (meu id), `QK` (tremor de tela: `QK=Math.max(QK,x)`, decai sozinho), `SPD=[2200,1600,3200,2600,1,4800]` (px/s do projétil).
- Desenho: `function drawFX()` em `src/js/60-desenho.js` (~linha 79). Hoje a origem é `sx=a, sy=b-24` (ponto fixo no corpo) e o destino `ex=c, ey=d-18`. Para `w==4` (lança-chamas) desenha partículas 'lighter' ao longo da linha; para as outras, clarão `poly(...)` de 70 ms e traço (linha laranja translúcida + núcleo `#fff3c4`) andando até o alvo, com faísca no impacto.
- O jogador 3D é desenhado em `drawPlayer` (`src/js/80-jogador.js`). Nele, depois do cálculo das matrizes `R` (3x3 por nó, 9 floats) e `Wt` (translação por nó) e da IK da mão esquerda, vêm `const S=27*s,cy_=Math.cos(st.yaw),sy_=Math.sin(st.yaw)` e a projeção de cada vértice: `rx_=wx*cy_+wz*sy_; ry_=wy; rz_=-wx*sy_+wz*cy_; tela x = x+rx_*S; tela y = y-(ry_-rz_*K2)*S`. O nó do `weapon_socket` é `PG.WS` (matriz em `R[PG.WS*9..]`, translação em `Wt[PG.WS*3..]`). Estado por jogador em `PGS[o.k]` (`st`); `o.k` é o `pid` no jogo.
- Cada GLB de arma tem um nó `muzzle` com `translation` (em metros, espaço da arma, origem na empunhadura, cano em +Z): pistola (0,.12,.375), escopeta (0,.1125,1.2), rifle (0,.09,1.38), metralhadora (0,.09,1.455), lança-chamas (0,.045,1.47), sniper (0,.09,1.755). Os GLBs são carregados em `src/js/85-armas.js` (`WPG[i]` = `{P,C,K,n}` ou null).
- Partículas existentes: `pts(n,x,y,cor,vel,vz,tam,vida)` (partículas no chão em coordenadas do mundo), `ftext`, `hitFx(f)`. Efeitos de tela já usam `X.globalCompositeOperation='lighter'`.

## Arquivos
- PODE editar: `src/js/85-armas.js`, `src/js/80-jogador.js`, `src/js/50-cliente.js`, `src/js/60-desenho.js`.
- NÃO tocar: `server.js`, `Dockerfile`, `package*.json`, `game.html` (gerado), `build.js`.

## Passos
A. Posição real do cano.
 1. `src/js/85-armas.js`: no `WGLB.map(...)` que monta `WPG`, ler também o nó chamado `'muzzle'` (`j.nodes.find(n=>n.name==='muzzle')`, campo `translation`) e devolver no objeto da arma `mz:[x,y,z]` (padrão `[0,.1,.5]` se não achar). Não mudar o formato `{P,C,K,n}` além de acrescentar `mz`.
 2. `src/js/80-jogador.js`, em `drawPlayer`, logo depois de calculados `S,cy_,sy_` (e só se `!o.dead` e `WPG[o.w]` existir): ponto do cano no espaço do modelo = `Wt[PG.WS*3..] + R8·mz` (R8 = `R[PG.WS*9 .. +8]`, linhas da matriz; mesma convenção usada na IK: coluna Z de R8 = `R[PG.WS*9+2], R[PG.WS*9+5], R[PG.WS*9+8]`; faça o produto completo `wx=R8[0]*mx+R8[1]*my+R8[2]*mz+Wt[ws*3]`, etc.). Aplicar a rotação de yaw e a projeção acima e guardar `st.mz=[telaX,telaY]` e `st.mzt=t`. Isso vale para qualquer jogador (local e remotos), pois `st` é por `pid`.
 3. `src/js/50-cliente.js`, no `FXL.push({f,t:Date.now(),...})`: acrescentar o campo `mz` com uma cópia de `PGS[f[6]]&&PGS[f[6]].mz` (ou `null`) e `own:f[6]===id`. Aumentar a vida do efeito: `life:Math.max(<atual>,650)` (para a fumaça durar).
 4. `src/js/60-desenho.js`, em `drawFX`: se `q.mz`, usar `sx=q.mz[0], sy=q.mz[1]` como origem (senão o comportamento antigo `a, b-24`). O destino continua `ex=c, ey=d-18`. Manter tudo funcionando para todas as armas (inclusive `w==4`).
B. Efeitos mais fortes (tudo em `drawFX`, sem estado novo: use `age` e números pseudo-aleatórios determinísticos a partir de `q.t`, p.ex. `r=(i)=>Math.abs(Math.sin(q.t*.001+i*12.9898)*43758.5453)%1`). Direção do tiro `(ux,uy)` já existe; `(px,py)=(-uy,ux)` é a perpendicular.
 1. Clarão de boca (primeiros ~110 ms, mais longo na sniper ~150 ms), com `globalCompositeOperation='lighter'`, ancorado em `(sx,sy)`: brilho radial grande (gradiente branco-amarelo → laranja → transparente, raio por arma: pistola 16, rifle 20, metralhadora 18, escopeta 30, sniper 26), estrela/faíscas de 5 a 7 pontas alongadas na direção do tiro (comprimento por arma: escopeta e sniper maiores), e para a escopeta um cone aberto de fogo. Fade pelo `age`.
 2. Luz no chão: círculo grande suave 'lighter' (raio ~70, alpha .18 → 0 em ~120 ms) em volta do cano.
 3. Projétil: cabeça brilhante (ponto branco com halo colorido) na frente do traço e rastro com gradiente (começo transparente → cabeça); cor por arma: pistola/rifle/metralhadora amarelo-quente, escopeta laranja (balins), sniper branco com halo ciano e rastro mais longo (≈70 px) e fino. Manter comprimento/velocidade atuais (`SPD`, `ln`) como base.
 4. Faíscas curtas saindo do cano nos primeiros 120 ms (4 a 7 linhas finas amarelas em leque ±25° em torno de `(ux,uy)`, comprimento 12-30 px).
 5. Fumaça: 1 a 3 fumaças cinza claras saindo do cano: círculos que sobem (`sy - age*40`), crescem (raio 4 → 14) e somem em 600 ms (alpha .35 → 0), pequeno desvio lateral aleatório. Escopeta e sniper mais fumaça.
 6. Cartucho ejetado (armas 0, 2, 3, 5; escopeta usa cartucho vermelho): retângulo dourado (`#e8c25a`, 3×5 px, rotacionando) que sai do corpo em direção perpendicular a `(ux,uy)` (lado direito do atirador na tela), sobe e cai em arco (gravidade) durante ~450 ms e some. Não precisa colidir com nada.
 7. Impacto no alvo mais forte: o anel/faíscas existentes continuam; acrescentar um clarão branco pequeno 'lighter' (raio 10 → 0 em 100 ms) em `(ex,ey)` no instante da chegada.
 8. Tremor de tela só para o meu tiro (`q.own`): `QK=Math.max(QK,[.05,.22,.08,.045,0,.3][w])` no momento do disparo (faça isso no `src/js/50-cliente.js`, junto do `FXL.push`, e não dentro de `drawFX`).
C. Performance: sem alocar arrays/objetos grandes por frame; metralhadora dispara muito rápido (muitos `FXL` simultâneos): manter cada efeito barato (poucos `arc`/`stroke`).
D. `node build.js` e `node build.js --check`.

## Critério de pronto
1. `node build.js` sem erro; `--check` diz "em dia".
2. `grep -n 'q.mz' src/js/60-desenho.js` mostra o uso da origem do cano; `grep -c 'mz' src/js/85-armas.js` ≥ 1.
3. `git status --short` só mostra: `src/js/85-armas.js`, `src/js/80-jogador.js`, `src/js/50-cliente.js`, `src/js/60-desenho.js`, `game.html`.
4. (Claude testa no navegador depois: tiro saindo do cano de cada arma e os efeitos.)
