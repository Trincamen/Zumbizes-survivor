# TAREFA_atual.md — EXECUTAR AGORA: TUTORIAL DE PRIMEIRA VEZ + CRÉDITOS no menu

> Edite SÓ `src/`, depois `node build.js` e `node build.js --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`, `40-host.js`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`). Não imprima `game.html`. Textos em português do Brasil, curtos, sem exagero.

## Parte A — Tutorial de primeira vez
Ao começar a partida (`snap.ph==1`), se o jogador nunca viu/pulou o tutorial (`LS 'tut'` != '1'), mostrar um painel NO CENTRO da tela (classe `.pn`, mesmo visual de terror dos outros painéis, z-index acima do HUD/`#inp`) ANTES de ele poder jogar: enquanto aberto, a entrada do jogo não age (stopPropagation nos pointerdown do painel; teclas WASD/setas não movem — ignorar `pushMove`/teclas enquanto `TUT_ON`). O jogo pode seguir rodando por trás (no multiplayer não dá para pausar).
Cada página = título + print simples (imagem ~320 px de largura) + 1–3 linhas de explicação EMBAIXO. Indicador "n/7". Botões embaixo: **SEGUIR** (última página vira "ENTENDI") e **PULAR**. Pular OU terminar → `LS.set('tut','1')` e nunca mais abre sozinho. (Depois, com contas, vira registro por conta; por ora só localStorage.)
Reabrir: botão **COMO JOGAR** no painel de opções `#opp` (Esc no PC / ⚙ no celular) abre o mesmo painel a qualquer hora (sem gravar nada além de `tut`).
Páginas (confira cada fato no código por grep em `src/js/` antes de escrever; não invente):
1. **Andar e atirar** — PC: WASD/setas anda; mouse mira e clica/atira. Celular: joystick na tela anda, toque mira/atira (a arma atira sozinha para onde o personagem olha — confira em `50-cliente.js`).
2. **Minimapa** — o mapa no canto superior direito. Legenda COM ÍCONES em print (recorte do minimapa e/ou dos rótulos): HOSPITAL = curas; POLÍCIA = armas; MERCADO = itens/dinheiro; AREA SEGURA = abrigo com torretas. No PC aparecem como texto; no celular como pontinho colorido com a inicial (`89g-glhud.js` ~linha 94). Explicar também os outros pontos (você/aliados, zumbis, boss, itens, loja) conferindo cores em `ghMini` (`89g-glhud.js`) — só o que existir.
3. **Melhoria de armas** — item "Melhoria da arma" (k==6, `40-host.js:45`, nível até 6, aumenta o carregador/dano — confira `magOf`) e onde comprar (`SH` em `00-base.js`, loja abre depois do boss).
4. **Área Segura** — prédio `'r'`: torretas no telhado matam zumbis na rua; quando o boss está pendente/vivo a porta fecha, as torretas desligam e quem está dentro é levado para fora; spawn sempre ali (confira em `10-mapa.js`/`40-host.js`/`RETOMADA.md` seção sessão 15).
5. **Subir de nível** — XP vem de matar zumbis; cada nível: +8 vida máxima, mais velocidade, resistência e empurrão (`giveXp`, `40-host.js:36`); onde ver (estrela dourada e barra de XP no HUD).
6. **Itens de cura** — Bandagem, Analgésico (pílula), Kit de cura, Desfibrilador (revive aliado caído, uso manual) com ícone de cada (use `weaponIcon`/GLB já existentes ou recorte do print) e 1 linha cada (confira o efeito real em `40-host.js` função de usar item: valores de cura, tempo).
7. **HUD das armas (inventário)** — slots no canto inferior esquerdo; trocar de arma (toque/tecla/2º dedo no celular), arrastar o slot para fora solta o item; kit/bandagem usa segurando (celular); botão ⚙ ao lado. Mencionar o botão AJUSTAR HUD das opções (mover/redimensionar o HUD).

### Prints
Gerar com Chrome headless (`tools/teste/lib.py`, solo, `?pid=` novo), recortando só a parte relevante (ex.: o minimapa para a página 2, os slots para a 7, o canto de vida/XP para a 5). PNG ou JPEG pequeno, ≤ 30 KB cada, salvos em `src/assets/tutorial/NN.png`; embutidos pelo `build.js` via CSS: `background-image:url(data:image/png;base64,@@GLB:assets/tutorial/NN.png@@)` em classes `.tp1..tp7` (o `build.js` já substitui `@@GLB:` no CSS, linha 16). Para a página 1 (andar/atirar) vale um print da cena com o personagem. Prints simples, sem anotações elaboradas.

## Parte B — Créditos no lugar de COMO JOGAR
1. No menu principal (`src/index.html` linha ~34) o botão `COMO JOGAR` (`show('how')`) vira **CRÉDITOS** (`show('cred')`) na MESMA posição; ids/ordem dos demais botões intactos. A tela `s-how` vira `s-cred` (mantendo `← VOLTAR`). Apague o texto antigo de "Como jogar" (agora vive no tutorial). Procure referências a `'how'`/`s-how` em `src/js/*.js` e atualize.
2. Conteúdo (títulos em negrito, linhas separadas):
   - **Programação:** `Vinicius` (link `https://github.com/Trincamen`, `target=_blank rel=noopener`) · `Claude (Anthropic)`
   - **Modelagem:** Claude (Anthropic)
   - **Sons:** Claude (Anthropic)
   - **Músicas:** uma linha por faixa:
     - Pufino — Metal Is Trash
     - Zambolino — Rotten Bones
     - Nebulite — Iron Pulse
     - (as 3 acima: Music provided by Free To Use — freetouse.com)
     - Música do boss: Ashen Circuit — elevenlabs.io
3. Também um link/botão pequeno "Créditos" no painel `#opp` NÃO é necessário.

## Critério de pronto
- `node build.js` e `node build.js --check` ok; `node --check` do script gerado ok; `window.__err` vazio; `game.html` com tamanho razoável (some só as 7 imagens).
- Teste Chrome (desktop 1500×950 e emulação celular 390×844): `?pid=novo` → entra na partida → painel aparece no centro; SEGUIR avança as 7 páginas (print + texto em cada); na última "ENTENDI" fecha, `LS tut=='1'`; recarregar + nova partida → NÃO aparece; limpar `tut` + PULAR → fecha e grava; botão COMO JOGAR nas opções reabre; WASD não anda enquanto o painel está aberto e anda depois; menu principal mostra CRÉDITOS (sem COMO JOGAR) e a tela de créditos tem todas as linhas e o link. Prints do teste em `/tmp/opencode/tutorial/`.
- Devolver ≤5 linhas: sucesso/falha, arquivos alterados, caminhos dos prints, e qualquer fato do jogo que você não conseguiu confirmar no código.
