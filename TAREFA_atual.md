# TAREFA_atual.md — Nova tela inicial (estilo R.E.P.O.)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, snapshot/rede, `genMap`, `98-debug.js`.

## Objetivo
Trocar o visual da tela de menu (`#menu`) por um estilo "cinematográfico sombrio" inspirado no menu do jogo R.E.P.O.: lógica dos botões/telas (`solo()`, `show('multi'|'set'|'how'|'main')`, lobby, `#net`) fica IDÊNTICA; só muda aparência e a cena de fundo.

## Referência visual (R.E.P.O.)
- Fundo: cena escura, dessaturada, com névoa/neblina, luz baixa de fim de tarde, vinheta forte; lado esquerdo bem escuro (degradê preto → transparente) para o texto ler bem.
- Logo no canto superior esquerdo, letras grandes estilo metal/estêncil gasto, com leve inclinação; sem caixas.
- Menu à esquerda: itens de TEXTO simples (sem caixa, sem borda, sem skew), fonte condensada (`Impact`/`'Arial Narrow'`, caixa alta, letter-spacing), cor cinza-claro `#c9c3b0`, tamanho ~26px. Hover/foco: branco com leve brilho e um traço vermelho `#b01418` à esquerda. Item principal (JOGAR) em branco. Ícone pequeno (▶) só nos 2 primeiros, como na referência.
- Canto superior direito: "NICKNAME: <nome>" em caixa alta, fonte condensada (usa `LS.get('name')`/valor de `$('nm')`; atualizar quando mudar o nome nas Configurações). Substitui o visual atual de `#net` apenas em posição/estilo se preciso; o conteúdo de `#net` (contagem Online) continua existindo, discreto abaixo do nickname.
- Cena (canvas, `menuScene(t)` em `src/js/90-sons.js:93`): trocar por: céu cinza-alaranjado dessaturado ao entardecer, silhueta de floresta/árvores escuras ao fundo com névoa em camadas (faixas semitransparentes que se movem devagar), estrada de asfalto escuro em perspectiva simples embaixo, e à DIREITA um veículo grande em primeiro plano (use `vehDraw`/sprite de `VGLB` do `86-cenario.js:289` se der para desenhar com as funções existentes, ex.: o modelo da polícia ou caminhonete, bem ampliado e escurecido com `rgba(0,0,0,.35)` por cima, faróis acesos com brilho amarelado `lighter`). Se o sprite não for viável no menu, desenhar silhueta procedural simples de um carro com faróis. Alguns zumbis em silhueta escura caminhando ao longe na estrada (reaproveite `person(...)` com `s` pequeno). Grão/ruído leve opcional (barato) e vinheta forte. NÃO usar mais os 4 heróis `drawPlayer` nem o boss roxo no menu.
- Desempenho: nada de `createLinearGradient`/`addColorStop` pesados por quadro além de poucos; o que for estático (céu, floresta) pode ser pré-renderizado em canvas offscreen uma vez por tamanho (`W,H`).

## Arquivos
- `src/index.html` (blocos `#logo`, `#s-main`, `#tag`, `#feat`): logo vira texto "ZOMBIZES SURVIVOR" em duas linhas (ou uma), botões do `#s-main` mantêm os `onclick` e ganham classe nova (ex.: `.mi`) em vez de `.mb`; rótulos: JOGAR, MULTIPLAYER, CONFIGURAÇÕES, COMO JOGAR (sem emojis; sem `<small>`). Remover `#tag` e `#feat` do visual (pode `display:none` ou apagar do HTML — conferir com grep que nenhum JS usa esses ids). Adicionar `<div id=nick></div>`.
- `src/style.css`: regras novas do menu; as telas internas (`.pn`, `.sb`, `.it`, `#s-lobby`) ficam como estão, só ajustar o que quebrar. Manter versão `@media(max-width:900px)` legível no celular (itens ~20px, logo menor).
- `src/js/90-sons.js`: reescrever `menuScene`. `src/js/00-base.js` ou onde `show()` está: preencher/atualizar `#nick`.

## Critério de pronto
1. `node build.js` e `node build.js --check` ok; `node --check` do script extraído ok.
2. Menu abre sem erro no console; botões JOGAR/MULTIPLAYER/CONFIGURAÇÕES/COMO JOGAR funcionam e voltam ao principal; nickname aparece e muda ao editar o nome.
3. Nenhum arquivo fora dos listados é alterado. Relatório final ≤5 linhas.
