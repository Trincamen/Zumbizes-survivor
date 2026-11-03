# TAREFA_atual.md — EXECUTAR AGORA: MENU 3D (acampamento à noite, WebGL)

> Edite SÓ `src/`, depois `node build.js` e `node build.js --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`, 1500×950 e 390×844). Não imprima `game.html`. Sem WebGL/`glLive` falso o menu 2D atual (`menuScene`) continua como fallback, intacto. Partida (ph>0) NÃO pode mudar.

## Objetivo
Trocar o fundo 2D do menu por uma cena 3D: acampamento à noite, personagem SENTADO ao lado de uma fogueira, SEM cercas, sem carro/zumbis/prédios. O texto do menu (`#menu`, coluna esquerda escura) fica por cima; a cena ocupa o lado DIREITO (fogueira+personagem em ~72% da largura).

## Como fazer
1. **Arquivo novo `src/js/89u-glmenu.js`** (carrega após `89t`): cena própria `GLMENU=new THREE.Scene()` + `THREE.PerspectiveCamera` (FOV ~40°, baixa, olhando a fogueira levemente de cima). Fundo/névoa azul-noite escuro. Luzes próprias: `HemisphereLight` fria fraca, `PointLight` laranja na fogueira com cintilar (`Math.sin` ruidoso por `performance.now()`), luar `DirectionalLight` azul fraca. Exporta `glMenuFrame(t)`.
2. **Chão e props procedurais** (geometrias three simples, baixo polígono, sem GLB novo nesta etapa): disco de terra/grama escura; pedras em anel; troncos em chama (cones laranja/amarelo emissivos com `MeshBasicMaterial`, animados em escala/rotação) + brasas/faíscas subindo (`Points`, ~40); tronco-banco deitado; tenda (pirâmide achatada de pano) ao fundo; mochila (caixa pequena). Poste_luz, olhos vermelhos e cerca do menu antigo NÃO entram. Algumas árvores simples (cones) escuras ao fundo.
3. **Personagem sentado:** reutilizar o modelo do jogador (`jgBuild()`/`jgObj`, `89d-gljogador.js:27/57`, `PG` de `80-jogador.js`) em grupo PRÓPRIO dentro de `GLMENU` (não em `GLW`), cor da camisa = cor salva do jogador (`o.c` como o menu 2D). Pose sentada procedural: chamar `pgSolve` com `idle` e depois sobrescrever as rotações de `hips/leg_l/leg_r/torso/head/arm_*` (nós 1,2,3,4,5,6,7) e recalcular `WRT/WT` (extrair o laço de `80-jogador.js:~97-107` numa função reutilizável SEM mudar o comportamento da partida). Pernas dobradas à frente (coxas ~90° à frente), tronco levemente inclinado, braços apoiados nos joelhos, cabeça virada para o fogo; respiração leve (±2% no torso). Sentado no tronco-banco, virado para a fogueira.
4. **Gancho único em `90-sons.js:471`:** no ramo `ph==0`, se `glLive` e `typeof glMenuFrame=='function'` → `glC2D(0)` (mostrar `#glc`, limpar/ocultar `#c`), `glMenuFrame(t)` e `return` (mesmo DRAW_MS). Senão, comportamento atual. Ao iniciar a partida o `glC2D` normal deve voltar (conferir ordem: menu→partida→menu sem recarregar).
5. **Render:** `GLR.render(GLMENU,cam)` no tamanho do canvas (resize já tratado em `88-gl.js`); bloom opcional — se for simples chamar o de `89o-glbloom.js`, use; senão sem bloom (como `ZSG`). Respeitar `GQ`/modo LITE (menos faíscas, sem luz extra).
6. Construir a cena uma vez (lazy no primeiro `glMenuFrame`), sem alocar por quadro. Não vazar `Mesh` em `GLSCN`.

## Critério de pronto
- `node build.js` + `node build.js --check` ok; `window.__err` vazio.
- Chrome 1500×950 e 390×844: print do menu mostra fogueira acesa (cintilando entre dois prints), personagem sentado virado ao fogo, texto do menu legível à esquerda; telas s-nick/s-main/s-set/s-cred continuam clicáveis.
- Ciclo menu → solo → voltar ao menu sem recarregar: partida normal (mundo 3D) e menu 3D aparecem corretos.
- Sem a flag/WebGL (`glKill()` ou fallback) o menu 2D antigo ainda aparece.
- `draw` do menu medido (ms) e informado; prints em `/tmp/opencode/menu3d/`.
- Relatar em ≤5 linhas.

## Notas de execução (levantadas pelo orquestrador — conferidas no código)
- Nós do jogador (índices): 0 player, 1 hips, 2 leg_l, 3 leg_r, 4 torso, 5 head, 6 arm_l, 7 arm_r, 8 weapon_socket. Clip `idle` existe em `PG.CLP`.
- `pgSolve` está em `src/js/80-jogador.js:78`; o laço FK vai de `const R=PG.WRT,Wt=PG.WT,PGT=PG.PGT,PGR=PG.PGR,PAR=PG.PAR;` (linha ~104) até o fecho do `for(const i of PG.ORD)` (~linha 122). Extraia esse laço tal e qual para `function pgFK()` (usa PG.WRT/WT/PGT/PGR/PAR) e substitua no `pgSolve` por `pgFK();`. Não mude mais nada da função (o `if(!o.dead){...})` do IK do braço vem DEPOIS do laço no arquivo original — mantenha a ordem).
- `glC2D(0)` esconde `#c`; `#glc` já está visível com `glLive` (glInit faz `cv.style.display='block'`). Não precisa mostrar `#glc`.
- Em `90-sons.js` o ramo do menu faz `return` ANTES de `glRenderNow()` (linha 611). Logo `glMenuFrame(t)` deve chamar `GLR.render(GLMENU,GM_CAM)` ele mesmo — inclusive o `setPixelRatio/setSize` quando `GLCV.width!==innerWidth*d`.
- NÃO usar `jgObj()` (ele faz `GLW.add(grp)`). Monte um `THREE.Group` próprio em `GLMENU` e reuse `jgBuild()`, `jgNodeGeo(ni,-1,cc,gg)` e `jgMat()` de `89d-gljogador.js`. `jgNodeGeo` devolve geometria nova a cada chamada: chame só na construção.
- Escala/metros do modelo: `S=27*s` (px por metro) igual a `drawPlayerGL`; para a cena do menu a escala é livre, use algo como 1 unidade de mundo = 1 px para a câmera (perspectiva própria, distância ~em px).
- `GQ` é o objeto de qualidade (ver `88-gl.js`/`GQ.scale`); modo LITE = menos faíscas e sem luz extra.
- Cor da camisa: o menu 2D usa a cor salva do jogador; use a MESMA fonte que o menu 2D usa hoje.
- Servidor de teste: `PORT=4997 node server.js &` e `tools/teste/lib.py` (Chrome headless). Prints em `/tmp/opencode/menu3d/`.

## CORREÇÕES (rodada 2 — pedido do usuário; prevalecem sobre o texto acima)
Só editar `src/js/89u-glmenu.js` (e o mínimo em outros se inevitável). Tudo na cena `GLMENU`.
1. **Sem arma:** nada de arma nas mãos/costas (`MNG_O.gun`/`w` sem arma; esconder malha da arma/`weapon_socket`). O clipe `idle_aim` ergue o braço: use `idle` ou zere o efeito, e sobrescreva os braços na pose.
2. **Graveto com linguiça:** graveto fino marrom (cilindro ~90 px de comprimento) preso nas mãos, inclinado para a frente/baixo, ponta SOBRE a fogueira; na ponta uma linguiça (cápsula/cilindro arredondado rosa-avermelhado escuro, levemente dourada, com 2 marcas de grelha). Sutil balanço do graveto e leve brilho/escurecer da linguiça por tempo (opcional). Ajuste os braços (`armL/armR`) para as mãos segurarem o graveto.
3. **Pose realmente sentada:** coxas dobradas ~90° à frente, canelas para baixo (se o modelo só tiver 2 segmentos de perna, incline as pernas à frente e para baixo sobre o tronco-banco), tronco quase reto/levemente inclinado para o fogo, cabeça virada para a fogueira. Conferir em print que NÃO parece deitado.
4. **Fundo = cidade com zumbis andando:** à distância (atrás da fogueira, lado direito e centro, longe da coluna do texto) silhuetas de prédios baixos/médios (caixas escuras `MeshLambertMaterial` quase pretas azuladas, alturas variadas, ~12–16 prédios em 2 fileiras, algumas janelas acesas fracas amarelas via `MeshBasicMaterial`), poste/luz distante opcional, névoa mais densa para dar profundidade. Na frente da cidade, ~6–8 zumbis ANDANDO devagar (vindo e voltando em trajetos retos curtos, giro ao inverter) usando os modelos 3D dos zumbis do jogo (`87-zumbis.js` `zParse`/`ZGLB` e a tabela de poses de `89e-glzumbis.js`; reutilizar, sem duplicar parsing; NÃO mexer na partida). Se reaproveitar for invasivo, use clones dos meshes do zumbi com a pose `walk` fixada/oscilando; reporte qual caminho usou. Contraste: zumbis ficam escuros, recortados contra o brilho do horizonte (faixa de céu levemente mais clara atrás da cidade).
5. **Luz:** cena mais legível: aumentar um pouco hemisférica/luar e a névoa clara perto do fogo; personagem, banco e tenda visíveis. Sem estourar: continuar noite.
6. Modo LITE/`GQ`: menos zumbis (3) e sem janelas animadas.
7. Rebuild com `node build.js --release` e `--release --check` no fim. Prints desktop 1500×950 e 390×844 em `/tmp/opencode/menu3d/r2_*.png` (2 prints com ~2 s de intervalo para ver zumbis mexendo). Relatar ≤5 linhas.
