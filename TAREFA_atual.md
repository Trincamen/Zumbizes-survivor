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

## Achados do orquestrador (2026-11-03)
- `menuScene` está em `src/js/89u-menucampo.js` (171 linhas: mcBuild/mcFrame) e é chamado em `90-sons.js` linha ~473 (`if(!s||s.ph==0){if(glLive)glHudShow(0);menuScene(t);...return}`). Gancho novo vai ANTES de `menuScene(t)`.
- Escala/enquadramento 2D: `mcS()` → PX=W*.723, PY=H*.92, S=27*(H*.20/46), FX=PX-1.05*S. Use isso como referência de projeção no 3D.
- Referência 3D antiga: `git show 326171f:src/js/89u-glmenu.js` (231 linhas) — tem cena, pose sentada, fogueira, faíscas, graveto/linguiça. Copiar para `src/js/89v-glmenu3d.js` e PODAR barraca/cidade/zumbis/árvores/rua larga.
- `pgFK()` em `src/js/80-jogador.js:137`. `cenLoad` em `src/js/86-cenario.js:34`, `glC2D` em `src/js/88-gl.js:44`, globais GL em `88-gl.js:11`.
- Assets já usados: `src/assets/props/poste_luz.glb`, `src/assets/props/cerca.glb`, `src/assets/rua/rua_reta.glb` (conferir caminhos reais com `ls src/assets`).
- Testes: `tools/teste/lib.py` (Python+Chrome, 1500×950 e 390×844). Ver `python3 -c "import sys;sys.path.insert(0,'tools/teste');import lib;print([x for x in dir(lib) if not x.startswith('_')])"`.

## Achados do subagente (análise já feita — NÃO repetir, só executar)
1. Gancho: copiar o bloco `ph==0` de `git show 326171f:src/js/90-sons.js` (~linhas 470–475) — chama `glMenuFrame(t)` antes de `glC2D(1)`/`menuScene(t)`, se truthy → `glC2D(0)`+`return`. No `90-sons.js` atual, reordenar para não togglear `glC2D` a cada quadro.
2. Base: `git show 326171f:src/js/89u-glmenu.js` (gmRot, gmFlick, gmPose, gmPlayerBuild, faíscas/chamas, __gmSet). Podar cidade/zumbis/árvores/tenda (~60% aproveitável).
3. Loader: `gmBuf` em `89-glmundo.js:30` + `THREE.GLTFLoader.parse` (padrão `89b-glprops.js:56`). Nó da lâmpada no glb chama-se `lamp_glow`.
4. Pose: usar `MCT` de `89u-menucampo.js:7` (pose do 2D), não a da cena antiga; `pgFK()` em `80-jogador.js:137`; `jgBuild/jgNodeGeo/jgMat` em `89d-gljogador.js`.
5. Enquadramento derivado: FOV ~40° vertical; câmera a ~3,2 m olhando ~14° abaixo (horizonte em 0.845H); jogador ~10,5 m em (2.8,−10.5); fogueira ~0,95 m à esquerda; poste ~3,87 m à direita e 1 m mais fundo; lâmpada ~5 m; pé do cone em (2.54,−9.4); cerca z −12,2; faixa da rua perto de x −0,2. Celular: mesmo arranjo, só yaw (alvo x ≈ +2,4 m).
6. Overlays (névoa baixa, olhos, fundo, vinheta) como sprites filhos da câmera (`SCN.add(CAM)`, depthTest false, renderOrder). Gradientes em `msBuild` linhas 251–262; olhos em `msEyePair`.
7. Teste: `tools/teste/lib.py` (Chrome headless, `Teste`, `shot`, `ev`); servidor `PORT=4997 node server.js`.

## ESTADO ATUAL (parado por limite de steps, 2 subagentes)
`src/js/89v-glmenu3d.js` (350 linhas) criado e com sintaxe ok; gancho no `ph==0` de `90-sons.js:468`. `node build.js --release` + `--release --check` ok, `game.html` em dia. Render 3D vivo, `__err` vazio em 1500×950 e 390×844; prints em /tmp/opencode/menu3d_igual/.
Pendências conhecidas: (a) olhos `eyes:0` (bloco provavelmente abortando no build), (b) GLBs poste/cerca/rua não aparecem (pole:false/cerca:0/street:false — checar console.warn do loader), (c) enquadramento do jogador ~(0.67W,0.85H) vs alvo (0.723W,0.92H), (d) DRAW_MS do ramo 3D não medido, (e) ciclo menu→solo→menu e `?gl=0` não testados. CONTEXTO: ver blocos "Achados" acima.
