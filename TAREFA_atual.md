# TAREFA_atual.md — Cenário: ruas T/emendas, props alinhados à rua, menos props + desempenho

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.
> Colisão, pathfinding, `O`, `BLD`, rede NÃO mudam. Mantenha fallback procedural onde já existe.

## Problemas reportados pelo usuário (jogando)
1. **Ruas com 4 saídas não encaixam nas outras / ruas sem saída perto da água.** Em `cenRuaSpr()` (`src/js/86-cenario.js` ~193) o tile `CEN_RUA.x` (cruzamento de 4 braços, 300 px) é desenhado em TODO cruzamento, inclusive em y=2500 e y=3500 (margem do rio), onde o braço que aponta para o rio vira um cotoco de rua com faixa de pedestre que acaba no capim (print: `~/rz_rio.png`). Além disso a emenda tile-cruzamento × reta fica visível (cruzamento "por cima").
2. **Pontes: braço da ponte.** As pontes (x=1000 e x=3000, y 2500–3500) saem dos cruzamentos de margem (k=2 e k=6); esses cruzamentos DEVEM manter o braço da ponte.
3. **Pontos de ônibus (e outros props alongados) tortos, em cima da rua.** `initCenario` renderiza todos os sprites com yaw fixo `.6` (≈34°): ponto de ônibus, banco, cerca, barreira, caçamba ficam girados e invadem o asfalto (prints: `~/rz_rio.png`, ponto à direita; `~/rz_cruz.png`, banco).
4. **Cenário poluído e pesado** (usuário sente lentidão): ~811 itens de `genDecor`, a maioria arbusto/pedra na grama; sprites supersampleados (`ss` 2–3) reduzidos a cada quadro; tiles de rua com clip por faixa.

## Parte A — ruas
1. Copiar `rua/rua_T.glb` (e `rua/rua_curva.glb` se precisar) de `~/Downloads/files/pacote_cenario_e_jogador/rua/` para `src/assets/rua/`; embutir como os outros (`CEN_RGLB`). O T tem 3 braços (descubra qual braço falta no GLB sem rotação, como foi feito com a reta/cruzamento).
2. Cruzamentos de margem: y=2500 → sem braço sul, EXCETO onde há ponte (x=1000 e 3000: aí 4 braços ou T aberto para a ponte, conforme o resultado visual); y=3500 → sem braço norte, exceto nas pontes. Nas bordas do mundo (x=0, x=4000, y=0, y=6000) o tile não pode ter braço para fora do mundo. Cruzamento de 4 braços só onde há 4 vias reais.
3. As pontes continuam desenhadas por `bridgeGround` (160 px de largura); a rua vertical sai do cruzamento pela ponte sem degrau.
4. Emenda: garanta que cruzamento/T e retas encaixem sem degrau/linha visível (mesma altura de meio-fio, mesmo asfalto): recorte o tile de cruzamento/T em 120×120 centrado no cruzamento OU alinhe o clip dos braços; compare com zoom 3×.
5. Validar com prints em zoom (Firefox headless; ver RETOMADA): um cruzamento comum, os cruzamentos de margem do rio (com e sem ponte) e um canto do mundo. Nenhuma rua deve terminar solta.

## Parte B — props alinhados à rua
1. Em `initCenario` (`86-cenario.js`), os props alongados/orientados — `ponto_onibus`, `banco`, `cabine_telefonica`, `cerca`, `barreira`, `cacamba`, `pneus` — passam a ter variantes de yaw alinhadas aos eixos (0, π, ±π/2 conforme o uso), em vez de `.6`. Árvores, arbustos, pedras, postes, hidrante etc. podem continuar com yaw livre (simétricos).
2. Em `genDecor`: ponto_onibus e banco ficam DENTRO do quarteirão, encostados na borda do gramado (≥ 14 px da borda do asfalto + metade da profundidade do sprite; nunca sobre o asfalto nem a faixa de pedestre), de FRENTE para a rua: calçada norte de rua E-O → frente para sul; sul → para norte; oeste de rua N-S → para leste; leste → para oeste (escolha a variante de yaw correspondente). Paralelos à rua, nunca girados.
3. Cerca, barreira, caçamba e pneus: também alinhados (yaw 0 ou π/2 conforme o eixo do lote/rua), nunca a 34°.
4. Postes, semáforos, placas, hidrantes, lixeiras, correio: na borda do quarteirão (≥ 68 px do eixo da rua, como já está) e fora de faixas de pedestre.

## Parte C — menos props, mais desempenho
1. Reduzir a quantidade total de `genDecor` de ~811 para ≤ 320 itens: arbustos/pedras na grama ≤ 90 no total (espalhados, mínimo 120 px entre si); mobiliário urbano ~200 com espaçamento maior (poste ~350 px, lixeira ~300, banco 1 por 3–4 quarteirões, ponto de ônibus 1 por ~6 quarteirões, esquinas só 1 em 3). Evite aglomerar vários props do mesmo tipo juntos, exceto trechos de obra (cones/barreiras) e grupos de pneus/barris (raros).
2. MEDIR ANTES de otimizar: instrumente `draw()` (`90-sons.js`) com `performance.now()` acumulado por seção (ruas, quarteirões, prédios, decoração, obstáculos/árvores, entidades, minimapa/HUD) e imprima no console a média por quadro após 300 quadros (flag `window.__prof=1` liga; desligado = custo zero). Rode no Firefox headless com `solo()`, jogador andando por uma rota fixa. Registre em `saidas/relatorio.txt` os números ANTES e DEPOIS.
3. Otimizações prováveis (aplique só as que os números justificarem, e diga quais): (a) renderizar os sprites no tamanho final de tela (ss=1, ou `devicePixelRatio`) em vez de ss=2/3 reduzido todo quadro; (b) cachear a camada de chão (ruas+gramado+calçadas) em chunks offscreen (ex.: 1000×1000 px, criados sob demanda e só os visíveis) em vez de redesenhar dezenas de tiles com clip a cada quadro; (c) evitar `ctx.save/clip/restore` por tile; (d) culling mais apertado dos decorativos e das sombras (`ell`); (e) não recriar listas/arrays por quadro (`D`, filtros) nem ordenar objetos que não mudam: ordenar a decoração/obstáculos estáticos uma vez; (f) minimapa e demais camadas só via `drawImage` do cache.
4. Meta: média de `draw()` ≤ 6 ms em 1280×720 no teste headless (anote o valor antes/depois), sem perda visual relevante.

## Critério de pronto
- `node build.js --check` ok; `node --check` do maior `<script>` ok; zero erro de console em `solo()`.
- Prints (Firefox headless, ver RETOMADA) mostrando: (a) os cruzamentos de margem do rio sem cotoco (e o da ponte com o braço), (b) um cruzamento comum sem emenda, (c) um ponto de ônibus e um banco alinhados e de frente para a rua, na calçada, (d) uma visão geral menos poluída. Salve em `~/scratch_cenario4/`.
- Colisão/mapa idênticos; `DECOR.length ≤ 320` (imprima).
- Números de desempenho antes/depois no relatório.
- Arquivos alterados só: `src/js/86-cenario.js`, `src/js/90-sons.js`, `src/js/60-desenho.js` (se preciso), `src/assets/rua/`.
