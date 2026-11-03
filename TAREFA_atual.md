# TAREFA_atual.md — EXECUTAR AGORA: MENU 2D ATUAL (acampamento) RECRIADO IDÊNTICO EM 3D (WebGL)

> Edite SÓ `src/`, depois `node build.js --release` e `--release --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`, 1500×950 e 390×844). Não imprima `game.html`. A partida (ph>0) NÃO pode mudar. Esperar o `opencode run` terminar de verdade.

## Objetivo
O menu 2D atual (`menuScene` em `src/js/90-sons.js:~100–318` + `src/js/89u-menucampo.js`, o jogador sentado na fogueira) deve ter uma versão **3D idêntica na aparência**: mesma composição, cores, névoa, escuridão, luz e posições. O usuário aprovou o visual atual; NÃO inventar elementos novos (sem barraca, cidade, zumbis, árvores). Referência visual: `/tmp/opencode/menu2d_camp/pc_2.png` (1500×950) e `mob_1.png` (390×844) — ler as imagens e comparar com os prints novos lado a lado.

## Elementos a reproduzir em 3D (ler `menuScene` para as medidas exatas)
1. Fundo preto com névoa baixa horizontal e poeira/partículas fracas no cone de luz.
2. Olhos vermelhos pequenos espalhados na escuridão (pares de pontos `MeshBasicMaterial`/`Points` vermelhos, com piscar/deriva leves como no 2D).
3. Poste de luz do jogo (`assets/props/poste_luz.glb`, via `cenLoad`/loaders do jogo, SEM duplicar parsing) à direita, lâmpada com halo quente, **cone de luz** (cone aditivo translúcido, `SpotLight` opcional) caindo sobre o jogador/chão, reflexo no chão.
4. Cerca baixa atrás do jogador (`assets/props/cerca.glb`, mesmas posições relativas do 2D) e a rua/asfalto com faixa tracejada na esquerda do jogador como no 2D (`assets/rua/rua_reta.glb` ou plano escuro com faixa).
5. Jogador sentado num tronco-banco, sem arma, com graveto e linguiça pairando sobre as chamas, mochila verde ao lado, olhando a fogueira; fogueira com pedras, chamas animadas, brasas, faíscas, luz laranja cintilando (PointLight com cintilar por `performance.now()`), sombra no chão. Base de código: `git show 326171f:src/js/89u-glmenu.js` (cena 3D anterior — pose sentada via override `PGT/PGR` + `pgFK()`, fogueira, faíscas, graveto/linguiça; **reaproveitar** esse código, mas sem barraca/cidade/rua larga/zumbis/árvores) e `pgFK()` já está em `80-jogador.js` (confirmar). Corrigir o que o usuário notou: linguiça realmente SOBRE as chamas, e fogueira um pouco maior que no 2D se necessário para ler bem.
6. Vinheta escura nas bordas e o mesmo gradiente do `#menu` por cima (HTML não muda). Texto do menu continua legível na coluna esquerda.

## Integração
- Arquivo novo `src/js/89v-glmenu3d.js` (carrega depois de `89u-menucampo.js`) exportando `glMenuFrame(t)`; gancho no ramo `ph==0` de `draw()` em `90-sons.js:~471`: se `glLive` e `glMenuFrame` retornar truthy → `glC2D(0)` e `return`; senão cai no `menuScene` 2D de hoje (fallback, `?gl=0`, erro). Cena própria `GLMENU` + `PerspectiveCamera` (FOV ~35–40°, enquadramento igual ao 2D: jogador em ~72% da largura e ~92% da altura, poste à direita, texto à esquerda; no celular o mesmo ajuste de proporção do 2D). Render com `GLR.render` direto, resize como o do jogo. Construir tudo uma vez (lazy), sem alocar por quadro. LITE/`GQ`: menos partículas/luzes.
- Voltar do jogo ao menu sem recarregar deve funcionar (`glC2D(1)` na partida).

## Critério de pronto
- `node build.js --release` + `--check` ok; `window.__err` vazio.
- Prints 1500×950 e 390×844 (2 com ~1 s de intervalo: fogo/olhos mudando) em `/tmp/opencode/menu3d_igual/*.png`, ao lado dos de referência; descrever diferenças restantes.
- Ciclo menu → solo → menu ok; `?gl=0` mostra o menu 2D; partida sem diferença. `draw` do menu em ms. Relatar ≤5 linhas.
