# TAREFA_atual.md — Otimização, pacote A, lote 1 (cache de zumbis, chaves numéricas, cor do jogador)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, `capacitor.config.json`, snapshot/rede, `genMap`, `98-debug.js`, `menuScene`/`ms*`. **Nenhuma mudança visual**: o jogo deve ficar idêntico; só mudam custo e alocação.

## Objetivo
Reduzir CPU/lixo por quadro sem alterar o resultado na tela. Medição (Firefox, GPU real): com 150–300 zumbis o `zsprite` fica fixo em ~3 ms/quadro porque o cache `ZSPR` (300) é menor que o conjunto usado, e há strings `'z'+id` e `delete` em objetos por zumbi por quadro.

## Mudanças
1. `src/js/87-zumbis.js:4` — `ZMAX` de 300 para 700. Não mudar `ZBUD` (máx. 2 gerações/quadro) nem a qualidade do sprite (`ss`, passos de fase 8, yaw 12).
2. `ZST` (`87-zumbis.js:4`, `:120-121`, `zumbiSpr`): trocar o objeto `ZST` indexado por `'z'+id` por `Map` indexado pelo id numérico (`ZST.get(id)` / `ZST.set(id,...)`). A limpeza a cada 240 quadros (`FR%240===0`) passa a iterar o Map e apagar entradas com `u<FR-240`. Procurar TODOS os usos: `grep -n "ZST" src/js/*.js` (também em `90-sons.js` e `98-debug.js` se houver; em `98-debug.js` só ajustar se ler `ZST`, sem mudar mais nada ali).
3. `src/js/90-sons.js` (~linhas 403, 426 e onde `RP`/`sm('z'+z[6],...)` aparecem): onde há chave de string `'z'+id` por zumbi por quadro em objeto com `delete`, trocar por `Map` com a chave numérica, mantendo o comportamento (interpolação suave da posição dos zumbis). Antes de editar, ler as linhas com `grep -n "'z'+" src/js/*.js` e `grep -n "RP" src/js/90-sons.js | cut -c1-200`; se alguma troca exigir mudar mais de ~10 linhas ou a lógica, parar e descrever no relatório em vez de arriscar.
4. `src/js/80-jogador.js` (~linhas 111–114, laço por face em `drawPlayer`): `rgbOf(pgHex(o.c))` é chamado por face; calcular uma vez por chamada de `drawPlayer` (fora do laço) e reutilizar. Mesmo resultado de cor.

## Critério de pronto
- `node build.js` e `node build.js --check` ok; `node --check` em cada arquivo alterado de `src/js/`.
- `grep -n "'z'+" src/js/*.js` não mostra mais chave de string por zumbi em caminho quente (restos fora do quadro, como debug, podem ficar).
- Não editar nenhum outro arquivo. Relatório em `saidas/relatorio.txt` (≤10 linhas): arquivos e linhas alteradas, e o que não foi trocado e por quê.
