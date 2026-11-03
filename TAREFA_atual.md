# TAREFA_atual.md — EXECUTAR AGORA: JOGADOR SENTADO NUM ACAMPAMENTO NO MENU 2D (só isso muda)

> Edite SÓ `src/`, depois `node build.js --release` e `node build.js --release --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`, 1500×950 e 390×844). Não imprima `game.html`. A partida (ph>0) NÃO pode mudar.

## Contexto
O menu voltou ao 2D antigo (`menuScene`, `src/js/90-sons.js:~278`, canvas 2D `#c`): fundo preto, olhos vermelhos, névoa, poste/lâmpada, cerca etc., e o jogador do jogo (`drawPlayer`, 2D com raster do modelo 3D) em pé mirando nos olhos, em ~`W*.72,H*.92`. Um menu 3D anterior (WebGL) foi REVERTIDO a pedido do usuário; NÃO reintroduzir WebGL no menu.

## Pedido do usuário (só isto)
Manter TUDO do menu como está (fundo preto, olhos vermelhos, poste, névoa, etc.) e mudar APENAS o jogador: ele fica **SENTADO num acampamento, no mesmo lugar onde está hoje**.
1. **Jogador sentado, sem arma**, virado para a fogueira (à esquerda dele, para o lado dos olhos), com um **graveto na mão com uma linguiça na ponta, PAIRANDO acima das chamas (não dentro)**. Sentado num tronco-banco deitado. Mochila ao lado é opcional.
2. **Acampamento 2D** desenhado em canvas no mesmo estilo do menu: fogueira (pedras em anel, 3–4 línguas de chama animadas laranja/amarelo, brasas), faíscas subindo (~30 partículas), cintilar da luz (radial gradient laranja aditivo sobre o chão e sobre o jogador, intensidade variando por `performance.now()` com senos "ruidosos"), sombra do jogador/tronco no chão. Sem barraca, sem cidade, sem rua, sem zumbis novos.
3. **Pose sentada:** no 2D o jogador vem de `pgSolve` + raster dos nós (`src/js/80-jogador.js`). Para sentar: depois de `pgSolve` com `idle`, sobrescrever as rotações locais `PG.PGR` dos nós (índices reais do GLB: 2/3 pernas, 4 quadris, 5 tronco, 6/7 braços; ver `git show 326171f:src/js/89u-glmenu.js` para a pose que o usuário JÁ APROVOU: pernas ≈ −1,19 rad à frente/para baixo, tronco levemente inclinado para o fogo, cabeça virada ao fogo, rootY desce quadris ao banco, braço direito levantado segurando o graveto) e recompor `WRT/WT` com um laço FK (`git show 326171f:src/js/80-jogador.js` tem `pgFK()` extraído de `pgSolve`; reintroduzir só esse laço se precisar, sem mudar o comportamento da partida). Depois rasterizar pelo mesmo caminho do `drawPlayer`. Se o raster 2D exigir ajuste (ordem de profundidade, banco atrás/à frente das pernas), resolver só no menu. Respiração leve (±1–2% no tronco). Sem arma (não desenhar arma/`weapon_socket`).
4. Mesmo lugar e escala de hoje (`W*.72,H*.92` com a mesma regra para celular); o texto do menu (coluna esquerda) continua legível; a mira nos olhos deixa de existir (ele olha o fogo).
5. Desempenho: nada de alocar por quadro; pré-renderizar o que for estático (pedras/tronco) uma vez.

## Critério de pronto
- `node build.js --release` + `--check` ok; `window.__err` vazio.
- Prints 1500×950 e 390×844 (2 prints com ~1 s de intervalo mostrando fogo/faíscas mudando) em `/tmp/opencode/menu2d_camp/*.png`: fundo preto, olhos vermelhos e poste iguais ao antes; jogador sentado ao lado da fogueira com a linguiça sobre as chamas.
- Ciclo menu → solo → menu sem recarregar ok; partida sem diferença.
- `draw` do menu em ms informado. Relatar ≤5 linhas.
