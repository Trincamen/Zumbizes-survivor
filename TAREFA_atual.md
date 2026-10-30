# TAREFA_atual.md — Trocar o vermelho antigo da interface pela paleta nova + ícone da aba

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, `capacitor.config.json`, snapshot/rede, `genMap`, `98-debug.js`, a CENA do menu (`menuScene`/`msBuild` e helpers `ms*` em `90-sons.js`, olhos vermelhos dos zumbis inclusive), o logo, os textos. NÃO remover nem mover nada: SÓ trocar cores.

## Objetivo A — Cores
O visual antigo usa vermelho sangue na "moldura" da interface. O menu novo é neutro/âmbar (texto creme `#c9c3b0`, preto quente, luz âmbar do poste). Trocar o vermelho da MOLDURA/UI por esta paleta, em todo o menu (botões `.mb/.sb/.b`, painéis `.pn`, lista `.it`, `#s-lobby`, `#shop`/`#shB`, `#wb`, `.kn`, `.opt`, `#opp`, `#sk`, `#cf`, `#end`, scrollbar etc., em `src/style.css` e `src/index.html`) e no HUD dentro do jogo (CSS e canvas: `src/js/90-sons.js` HUD, `src/js/50-cliente.js`, `src/js/40-host.js` etc. — grep).

Mapa de cores (maiúsc./minúsc., com ou sem alfa, ex.: `#8a1218`, `#8a1218cc`, `rgba(138,18,24,…)`):
- `#8a1218` (acento/borda esquerda/fundo de botão) → `#8a6f35`
- `#4a1a1e` (bordas) → `#3a3226`
- `#4a0a0e` (fim de degradê de botão) → `#2a2218`
- `#d83a3a`, `#b01418` (borda viva/hover/traço) → `#c9a54a`
- `#2a1214`, `#140e10`, `#2a0d10`, `#240d12`, `#3a1219`, `#1c1416` (fundos avermelhados escuros) → equivalentes neutros quentes: `#1a1612`, `#14110d`, `#221c14` (escolha o mais próximo em luminosidade)
- `#c33`, `#f66`, `#a33` (botão "SAIR PARA O MENU", `.mb.r`) → `#8a6f35` / `#d8c58a` / `#6a5428`
- Texto creme `#f0e6d8`, `#d8d2c0` e fundos pretos `#0a0a0c` ficam.
Gradientes: `linear-gradient(90deg,#8a1218,#4a0a0e)` vira `linear-gradient(90deg,#8a6f35,#2a2218)`.

NÃO trocar cores com SIGNIFICADO de jogo: sangue/dano/flash de dano, zumbis e boss, barra de vida e "+" de vida (verde/vermelho conforme está), cor de item (`itCol`), minimapa, arco de proximidade, alertas de perigo, cor de jogador/placar. Na dúvida (ex.: barra de vida vermelha), NÃO trocar e liste no relatório. Só a moldura/ornamento (bordas, fundos de botão/painel, destaques) muda.
Conferir no fim: `grep -n -i '8a1218\|4a1a1e\|4a0a0e\|d83a3a\|b01418' src/style.css src/index.html src/js/*.js` (ignorando `98-debug.js`) — o que sobrar deve ser só cor de jogo justificada no relatório.

## Objetivo B — Ícone da aba (favicon) = cabeça do personagem do jogo
- Em `src/index.html` não há `<link rel=icon>`. Criar em JS (arquivo novo NÃO; use `src/js/99-iniciar.js`, no fim, num `try/catch`, e só depois do modelo do jogador estar pronto — ver `PG`/`pgParseGlb` em `src/js/80-jogador.js` e como `drawPlayer` desenha) um ícone 64×64: renderizar o jogador do jogo (`drawPlayer(x,y,{...})` com `idle:true`, de frente, `fa:Math.PI/2`) em um canvas offscreen trocando temporariamente o contexto global `X` (`const _X=X;X=cv.getContext('2d');…;X=_X`, dentro de try/finally) ou, se `drawPlayer` não permitir, gerando o sprite equivalente; recortar a CABEÇA (terço superior, ampliada para preencher o 64×64, fundo transparente), e definir `<link rel="icon" type="image/png" href=dataURL>` (criar/atualizar o elemento). Se o modelo ainda não carregou, tentar de novo com `setTimeout` (até ~10 tentativas de 500 ms). Se falhar, não faz nada (sem erro no console).
- Aproveitar que o título da aba já é "ZomBrize".

## Critério de pronto
1. `node build.js` e `node build.js --check` ok; `node --check` do script extraído ok; console sem erro novo.
2. Botões do menu, painéis e HUD do jogo sem vermelho de moldura (usam âmbar/neutro); gameplay inalterado.
3. Aba do navegador mostra a cabeça do personagem (verificação visual só se houver como; senão diga que não verificou).
4. Relatório ≤6 linhas: arquivos alterados + lista de vermelhos mantidos por serem cor de jogo.
