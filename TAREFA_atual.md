# TAREFA_atual.md — 3D real (WebGL), ETAPA 1: infraestrutura + chão/ruas/prédios/props + jogador

> STATUS: spec aprovada pelo usuário; Etapa 0 feita (`saidas/etapa0_gl.md`). **EXECUTAR AGORA: só a sub-etapa 1a** (abaixo). `src/vendor/three.min.js` (r147) e `src/vendor/GLTFLoader.js` já estão baixados; NÃO baixar nada.
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

## Sub-etapa 1b — mundo estático em 3D
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
