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
