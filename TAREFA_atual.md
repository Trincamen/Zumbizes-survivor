# TAREFA_atual.md — Desempenho: vinheta com vazamento + cache de chão (LRU)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Só `src/js/90-sons.js`. Nada além disso muda.

## Objetivo
O jogo fica mais pesado com o tempo. Causas confirmadas por leitura de código.

## Correção 1 — vinheta (`90-sons.js` ~linhas 226-228)
`VIG.g` é criado só quando W/H mudam, mas `VIG.g.addColorStop(0,...)` e `addColorStop(1,...)` rodam TODO quadro (stops se acumulam).
- Mover os dois `addColorStop` para dentro do bloco que cria `VIG` (logo após `createRadialGradient`), mantendo as mesmas cores (`rgba(0,0,0,0)` e `rgba(0,0,0,.5)`).
- Por quadro ficam só `fillStyle=VIG.g` e `fillRect`.

## Correção 2 — cache do chão (`grdChunk`/`groundChunks`, ~linhas 164-179)
- No acerto de cache: NÃO empilhar duplicata. Reposicionar a chave no fim de `GRD.order` (remover a posição antiga com `indexOf`/`splice`, depois `push`), assim `order` nunca passa do tamanho do mapa.
- Limite de chunks em memória: de 8 para 16 (`while(GRD.order.length>16)`). Nunca apagar o chunk recém-criado (`old!==key` já existe; manter).
- Resto igual (chunk 1000 px, `cenRuaSpr`/`cenBlocks`, reset por `sd`).

## Critério de pronto
- `node build.js` e `node build.js --check` ok; `node --check` do maior `<script>` ok.
- `grep -n addColorStop src/js/90-sons.js` mostra os dois da vinheta dentro do bloco de criação.
- `git diff` só em `src/js/90-sons.js` e `game.html`.
- Relatório curto (≤5 linhas) em `saidas/relatorio.txt`.
