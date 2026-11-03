# TAREFA_atual.md — EXECUTAR AGORA: EDITOR DE HUD (mover e redimensionar cada bloco, PC e celular)

> Edite SÓ `src/`, depois `node build.js` e `node build.js --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`, `40-host.js`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`). Não imprima `game.html`.

## Objetivo
Nas opções (painel `#opp`, em `src/index.html` linha ~25) novo botão **"AJUSTAR HUD"**. Ao tocar: fecha `#opp` e entra em MODO EDIÇÃO; o jogador arrasta cada bloco do HUD para onde quiser e muda o tamanho de cada um separadamente. Funciona com mouse (PC) e toque (celular). O layout fica salvo e vale nas próximas partidas.

## Blocos editáveis (id → o que é)
- `gh2` — status do canto superior esquerdo (relógio, vida, nível/XP, buffs). O pai é 0×0, os filhos são `position:absolute`: o retângulo é a UNIÃO dos `getBoundingClientRect()` dos filhos.
- `gmm` — minimapa (`transform-origin:100% 0`).
- `gsc` — placar "Abates" (`transform-origin:100% 0`).
- `wb` — slots de arma (`transform-origin:left bottom`). O botão ⚙ `#opt` já acompanha `#wb` via `optPos()` (`50-cliente.js:36`): chame `optPos()` depois de cada mudança.
NÃO editar: joystick (dinâmico), elementos do mundo (`#gw`).

## Como fazer (arquivo NOVO `src/js/89q-hudedit.js`, carrega depois de `89p`; confira a ordem em `build.js`)
1. Aplicar o layout com as propriedades CSS individuais `translate` e `scale` no `style` do elemento (compõem com o `transform` que já existe; NÃO sobrescrever `transform`). Layout: `{id:{x,y,s}}` (x,y em px, s multiplicador, padrão 0,0,1; s limitado a 0,5–2,5). Guardar em `LS 'hudlay'` (JSON, try/catch). Aplicar ao carregar a página e após `resize` (reclampar para caber na tela).
2. Modo edição (`hudEdit(true)`): classe `hed` no `body`; para cada bloco criar um `div.hbox` fixo (z-index 60) sobre o retângulo atual do bloco, com borda tracejada e rótulo curto (VIDA/XP, MAPA, PLACAR, ARMAS), `pointer-events:auto`, `touch-action:none`. Arrastar com Pointer Events (`setPointerCapture`) muda `x,y` do bloco; ao arrastar, recalcular o retângulo e reposicionar a caixa. Clamp: o retângulo do bloco nunca sai da tela. Tocar/clicar numa caixa a SELECIONA (borda mais forte).
3. Barra de ferramentas fixa (`#hbar`, z-index 61, no centro de baixo, fonte do jogo) com: `−` e `+` (mudam `s` do bloco SELECIONADO em passos de 10%; bloco selecionado inicial = o primeiro), `RESTAURAR` (zera tudo, pede confirmação simples com `confirm`), `PRONTO` (sai do modo edição e salva). No PC também: roda do mouse sobre uma caixa muda a escala.
4. Em modo edição, `#wb button` e demais clicáveis não podem reagir (CSS `.hed #wb,.hed #opt{pointer-events:none}`); o `#inp` (entrada do jogo) não deve disparar tiro/movimento sob a barra e as caixas — as caixas e a barra ficam acima do `#inp` e chamam `e.stopPropagation()` nos pointerdown.
5. O jogo continua rodando durante a edição (não pausar). Mostrar os blocos mesmo se vazios (se `#gh2` estiver `display:none`, a caixa usa o retângulo salvo/estimado de 220×140 px na posição padrão).
6. Estilo em `src/style.css` (borda `2px dashed #f2c230`, fundo `rgba(242,194,48,.08)`, rótulo pequeno; botões grandes o bastante para o dedo: ≥44 px de altura em `.mob`).

## Critério de pronto
- `node build.js` + `node build.js --check` ok; `node --check` do script gerado ok; `window.__err` vazio.
- Teste Chrome headless (`tools/teste/lib.py`, solo): abrir opções → clicar AJUSTAR HUD → arrastar `gmm` 100 px para a esquerda e `wb` 50 px para cima, `+` duas vezes no `gsc` → `PRONTO`; conferir via `getBoundingClientRect` que mudaram e que `LS hudlay` guarda; recarregar a página e conferir que o layout persiste; `RESTAURAR` volta ao original. Repetir em emulação de celular (390×844, eventos de toque/ponteiro). Prints em `/tmp/opencode/hudedit/`.
- Sem layout salvo, nada muda no jogo (bytes do comportamento atual intactos).
- Devolver ≤5 linhas: sucesso/falha, arquivos alterados, caminhos dos prints.
