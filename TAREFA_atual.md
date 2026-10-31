# TAREFA_atual.md — 3D real (WebGL), ETAPA 1: infraestrutura + chão/ruas/prédios/props + jogador

> STATUS: 1a FEITA (commit `320ba5f`, `src/js/88-gl.js`). **EXECUTAR AGORA: só a sub-etapa 1b-i** (seção "Sub-etapa 1b-i" abaixo); 1a e 1b-ii são contexto. (Texto antigo da 1a:) `src/vendor/three.min.js` (r147) e `src/vendor/GLTFLoader.js` já estão baixados; NÃO baixar nada.
> Decisões da Etapa 0: usar `GLTFLoader.parse()` sobre o mesmo base64 (o parser próprio achata malhas); GLBs só têm cor por vértice (sem textura/skin); conversões tela↔mundo: tela_css=(mundo+ox,oy)*ZO (`00-base.js:2-5`, `90-sons.js:414,416`); `s2w` hoje inline em `50-cliente.js:37,42,44`; o resto (nomes/barras/arco/pílula/LOJA, `90-sons.js:452-462`, `80-jogador.js:186`) desenha sob `translate(ox,oy)` e NÃO precisa mudar na 1a (no modo 2D) — só em `?gl=1` a 1a deve deixar `ox,oy,ZO` coerentes com a câmera 3D. Na 1a NÃO tocar em `draw()` além do mínimo: em `?gl=1`, chamar `glFrame()` no começo do quadro e pular o chão/prédios 2D se já estiver desenhando 3D (na 1a o 3D é só chão liso verde).
> **Sub-etapa 1a — detalhe de arquivos:** (1) `build.js`: inserir `src/vendor/*.js` (ordem: `three.min.js`, depois `GLTFLoader.js`) antes dos `src/js/*.js`; no `--release` também; `--check` continua valendo. (2) novo `src/js/88-gl.js` conforme "Sub-etapa 1a" abaixo, com `glOn` (flag `?gl=1`/`LS 'gl'`), `glInit()` com fallback, `glFrame()`, `w2s`, `s2w`. (3) `50-cliente.js:37,42,44` passam a chamar `s2w(clientX,clientY)` (no 2D devolve exatamente `clientX/ZO-ox, clientY/ZO-oy`). (4) `index.html`: canvas WebGL atrás do canvas 2D, só criado quando `glOn`. Verificar: `node build.js`, `node build.js --check`, `node --check` do script, e que SEM a flag o `game.html` se comporta igual (mesma saída de `s2w`).
> Fluxo: (0) `analista` Claude responde as perguntas da Etapa 0 → (1) `escritor`/OpenCode `rapido` implementa por sub-etapas (1a, 1b, 1c), UMA por vez, commit entre elas → (2) Claude revisa `git diff` e `general-purpose` mede no Firefox COM janela (ABAB contra o modo 2D).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, `capacitor.config.json`, snapshot/rede, `genMap`, simulação do host (`40-host.js`), `98-debug.js`.

## Objetivo
Hoje: canvas 2D, câmera fixa, projeção oblíqua (tela = (X − 0,3·h, Y − h)); GLBs viram sprites rasterizados por software (CPU) com cache. Meta: renderizar o MUNDO em WebGL (three.js) com a mesma vista de cima e a mesma jogabilidade, para a GPU fazer o trabalho e o FPS parar de cair ao andar. A lógica (x,y do mundo, colisão, rede, host) NÃO muda.

## Regras de segurança (valem para todas as sub-etapas)
- **Modo 3D atrás de flag**: `?gl=1` na URL (ou `LS 'gl'`). Sem a flag o jogo roda EXATAMENTE como hoje (2D). O código 2D só é removido numa etapa futura, depois de aprovado.
- Se WebGL falhar (`getContext` nulo, erro de shader, `webglcontextlost`) → cair automaticamente no 2D sem travar.
- O HUD, o minimapa, o placar e o menu continuam em canvas 2D (o canvas 2D atual fica POR CIMA, transparente, só com HUD/textos/nomes/barras). O canvas WebGL fica atrás, mesmo tamanho (CSS) e DPR limitado a 2.
- Zumbis, boss, itens no chão, veículos e armas continuam 2D (sprites atuais) na Etapa 1, desenhados no canvas de cima. **Imperfeição aceita nesta etapa**: sem oclusão correta entre eles e prédios/árvores 3D. Eles passam a 3D na Etapa 2.
- Nenhuma dependência nova no `package.json`. Arquivos de terceiros ficam em `src/vendor/` e entram no `game.html` via `build.js`.

## Etapa 0 — análise (analista Claude, somente leitura, resposta ≤30 linhas, não escreve código)
1. Onde estão TODAS as conversões tela↔mundo (cliques/toque para mover/atacar, mira, joystick, minimapa, arco de itens, nomes, barras de vida)? Listar arquivo:linha. Essas têm de passar a usar UMA função `w2s(x,y,h)` / `s2w(sx,sy)` que existe nos dois modos.
2. Estrutura do laço `draw()` (`90-sons.js:414`): ordem das camadas, lista `D` por y, onde entram `groundChunks`, `cenDraw`, `obst`, `roof`, `drawPlayer`.
3. Como `cenLoad` (`86-cenario.js`) e `80-jogador.js` leem GLB (parser próprio?). Dá para reaproveitar as malhas/materiais/esqueleto para three.js ou é melhor `GLTFLoader` a partir do mesmo base64?
4. Onde ficam as animações do jogador (clipes idle/walk/run/aim/shoot/die, IK da mão esquerda, `mz` da boca do cano): como são aplicadas hoje.
5. Lista dos GLBs do mundo (`CENGLB`, ruas, prédios h/p/m, casas) com contagem aproximada de nós/triângulos.

## Sub-etapa 1a — infraestrutura WebGL (sem mudar visual)
- Obter three.js **r147** (`build/three.min.js`, global `THREE`) e `examples/js/loaders/GLTFLoader.js` (r147 é a última versão com build global; confirmar na hora). Salvar em `src/vendor/`. `build.js`: incluir `src/vendor/*.js` ANTES de `src/js/*.js` (ordem alfabética, vendor primeiro); o `--release` também. Conferir que o tamanho do `game.html` e a ordem não quebram o `node build.js --check`.
- Novo arquivo `src/js/88-gl.js` (NÃO colocar WebGL dentro de `90-sons.js`): cria o renderer (`antialias:true`, `powerPreference:'high-performance'`, DPR ≤2), cena, `OrthographicCamera` com inclinação fixa que reproduza a projeção atual (eixo de cisalhamento `(0,3, 1, 1)` ou inclinação de ~55–60° equivalente; escolher a que mantém ruas e prédios com o mesmo aspecto dos sprites de hoje; documentar a escolha em comentário curto), zoom = `CAM*ZO` atual, segue `cx,cy`.
- Funções `w2s`, `s2w` (raycast no plano y=0) e substituição das conversões listadas na Etapa 0 por elas. **No modo 2D devem devolver exatamente os mesmos valores de hoje.**
- Luz: 1 `DirectionalLight` + `HemisphereLight` com cor/intensidade aproximando o tom atual (noite fria, tint `rgba(20,10,50,.2)`); sombra do jogador/props só se custar <1 ms (senão, sem sombra por enquanto).
- Critério de pronto: com `?gl=1` abre o jogo, a tela mostra um chão liso na cor da grama e o HUD 2D por cima; sem a flag nada mudou; console limpo; `node build.js --check` ok.

## Sub-etapa 1b-i — chão, ruas, rio e quarteirões em 3D (EXECUTAR ESTA)
Só em `?gl=1` (`glLive`). Sem a flag, nada muda. Arquivo novo `src/js/89-glmundo.js` (carrega depois de `88-gl.js`); em `88-gl.js` só ganchos mínimos (`glMundoFrame()` chamado dentro de `glFrame()` antes do `render`). A câmera/`w2s`/`s2w`/luz da 1a ficam; só pode ajustar as CORES/intensidade das luzes.
**O que o 2D desenha hoje (replicar a MESMA geometria, cores e ordem):** `cenRuaSpr` e `cenBlocks` em `86-cenario.js:207-247` (chamados por `grdChunk`, `90-sons.js:~377`):
1. Grama base `#3a4a2b` em todo o mundo (`MW×MH`); rio `#2d6fa8` em `y∈[RY0,RY0+600]`.
2. Asfalto `#34343a`: faixas verticais `x∈[k·500−60,k·500+60]`, k=0..8, só em `y∈[0,2500]` e `[3500,6000]`; faixas horizontais `y∈[ky·500−60,ky·500+60]` para `ky∈CEN_HV`, largura `MW`.
3. Tiles de rua GLB (`CEN_RUA`: `v`, `h`, `x`, `t[]`, `c[]`; GLBs em `src/assets/rua/`, constantes `@@GLB:...@@` perto de `CENGLB`, `86-cenario.js:7`): tile de 300 px (24 m = 12,5 px/m); retas verticais ao longo das faixas, horizontais (giradas 90°), e cruzamentos só no núcleo 120×120 (`cenArms`, `CEN_TV`, `CEN_CV` escolhem T/curva/4 vias e a rotação). Cada tile é RECORTADO à faixa de 120 px (o asfalto do tile tem só 100 px; ver `RETOMADA.md` "Decisões"). Reproduzir o recorte cortando os triângulos na CPU ao montar a geometria (recorte de polígono contra o retângulo), não com `clippingPlanes` global.
4. Quarteirões (`ROWS`, i=0..7): calçada `#807a6a` em `[bx−10,by−10,400,400]` e gramado `(i+j)%2 ? #44562f : #3c4d2a` em `[bx,by,380,380]`, com `bx=i·500+60`, `by=j·500+60`; desenhados DEPOIS das ruas (cobrem 10 px das bordas do asfalto → a rua visível fica com 100 px).
**Fica em 2D (não mexer):** ondas do rio (`90-sons.js:420`), pontes (`bridgeGround`), `edges('tlr')`, faixas tracejadas amarelas só se não houver `CEN_RUA` (já gateadas por `glLive` em `90-sons.js` — verifique que o resultado não duplica: o 3D deve mostrar as faixas dos tiles GLB; se faltar a faixa central, aceitar e anotar).
**Implementação:**
- Carregar os GLBs de rua com `new THREE.GLTFLoader().parse(arrayBuffer,'',ok,err)` (base64→ArrayBuffer; cuidado com a raiz Y-up: mundo do jogo é x,y→ x,z do three como em `88-gl.js`, `GLW` já escala Z por `1/cos`), `MeshLambertMaterial({vertexColors:true})` usando o atributo de cor do GLB. Escala 12,5 px/m, tile centrado no ponto, y=0 (chão); quarteirões em y=0,2; rio y=0,05 (acima da grama base).
- Construção por CHUNK de 1000×1000 (mesma grade de `GRD`): quando um chunk cruza a vista expandida em 1000 px, criar um `THREE.Group` com a grama/rio/asfalto/quarteirões/tiles daquele chunk (malhas mescladas por material ou `InstancedMesh` por tipo de tile; evitar >30 draw calls por chunk); descartar (`dispose` de geometria/material, remover do `GLW`) chunks a mais de 2500 px do centro da câmera e manter no máx. 12. Sem alocação por quadro; construir no máx. 1 chunk por quadro.
- Luz: ajustar `HemisphereLight`/`DirectionalLight` (88-gl.js) para que a grama `#3a4a2b` plana fique visualmente próxima do 2D (diferença de cor ≤ ~12% por canal) sem estourar. Sem sombra.
- O tint/vinheta 2D continuam por cima.
**Critério de pronto:** `node build.js`, `node build.js --check`, `node --check` ok; sem a flag nada muda; com `?gl=1` andar do spawn até o rio, pela ponte e até a borda sul: ruas T/curva/cruzamento no lugar certo (comparar com o 2D por prints nos mesmos pontos), quarteirões com calçada+gramado alternado, rio azul, sem buracos nem emendas, sem Z-fighting, console limpo, `GLW` não vaza (contar `GLR.info.memory.geometries` estável após andar 60 s). Reportar: nº de chunks vivos, draw calls (`GLR.info.render.calls`) e triângulos por quadro.

## Sub-etapa 1b-ii (depois, não agora) — prédios (h/p/m e casas), props `DECOR` em `InstancedMesh`, árvores, carros, telhado que some ao entrar.

## Sub-etapa 1b — visão geral (referência)
- Chão (grama, asfalto, ruas T/curva/cruzamento/reta, calçadas, rio e pontes) e prédios (h/p/m e casas) a partir dos MESMOS GLBs e da mesma lógica de `genMap`/`cenario` (posição, giro, ruas escolhidas pelos braços reais). Props de decoração (`DECOR`, ~275) via `InstancedMesh` por modelo (um draw call por tipo), com os mesmos yaws/flip. Árvores, cercas, carros (`VGLB`, modelo por `(o.i*7+3)%5`).
- Só construir objetos em volta da câmera (raio ~2 chunks de 1000 px); descartar/pooling ao sair. Nada de gerar tudo no boot nem a cada quadro. Sem alocação por quadro no laço.
- Telhado transparente/oculto quando o jogador está dentro (comportamento atual de `roof`/interior); manter a marca `ENTRADA`.
- Critério de pronto: andar pela cidade inteira em `?gl=1` com ruas e prédios no lugar certo e igual ao 2D (comparar print ao lado), sem buracos nem Z-fighting; console limpo.

## Sub-etapa 1c — jogador em 3D
- Jogador local e aliados (cores de camisa por jogador, nome/barra de vida em 2D por cima via `w2s`) como modelo animado no WebGL (`AnimationMixer` ou o esqueleto atual, conforme Etapa 0): idle/walk/run/aim/shoot/die, trote com cadência pela velocidade, corrida com boost, IK da mão esquerda, arma 3D na mão com `mz` (boca do cano) para o tiro sair do cano certo (tiro/clarão/rastro continuam 2D por cima, posicionados via `w2s(mz)`).
- Critério de pronto: jogar solo em `?gl=1`: andar, mirar, atirar, trocar armas, morrer e reviver com o desfibrilador funcionam como no 2D; mira/clique batem exatamente com o ponto do chão (testar clicando num poste/porta).

## Medição obrigatória (agente `general-purpose`, Firefox COM janela, geckodriver, ABAB: 2D, GL, 2D, GL)
Mesma rota automática de ~60 s pela cidade usada em `saidas/perf/perf_ab_chunks.md`. Reportar: FPS parado, FPS durante/depois da caminhada, FPS ao voltar ao spawn, ms de `draw`, memória aproximada, tempo de boot, tamanho do `game.html`. Meta: ≥60 FPS estáveis ao andar, sem a queda persistente <30 FPS. Se `?gl=1` não vencer o 2D, PARAR e avisar; não seguir para a Etapa 2.

## Fora do escopo desta etapa (fica para a Etapa 2/3)
Zumbis e boss em `InstancedMesh` animado, itens/armas no chão, veículos animados, fogo/fumaça/partículas em WebGL, sombras avançadas, rotação de câmera, remover o código 2D, minificação, APK.

## Riscos a registrar no relatório
Peso do `game.html` (three ≈ +600 KB); WebGL em celular fraco/WebView do APK; perda de contexto WebGL; determinismo do mapa entre clientes (não alterar `genMap`/`decorObs`); itens e zumbis 2D sem oclusão na Etapa 1.
