# TAREFA_atual.md — Colisão nos props de decoração (bancos, cercas, barreiras, caçambas...)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, snapshot/rede, `genMap` (índices `o.i` e RNG do mapa NÃO podem mudar), zumbis 3D (`87-zumbis.js`), jogador, boss.

## Problema
Props de `genDecor` (banco, cerca, barreira, caçamba, lixeira, cabine, ponto de ônibus, barril, pneus, caixa de correio, pedras...) não têm colisão: jogador e zumbis atravessam.

## Como a colisão funciona (já mapeado)
- `blk(x,y,r)` (`10-mapa.js:27`) testa todo `o` vivo em `OB` (grade de 200 px, montada por `buildOB()` `10-mapa.js:26`). `mvT` (`20-caminhos.js:9-11`) usa `blk` para jogador e zumbi; `initGrid`/`regrid` (`20-caminhos.js:3`, `40-host.js:58`) montam o pathfinding também por `blk`; `los()` usa `blk`.
- Host (`40-host.js:13`) e cliente (`50-cliente.js:2`) rodam a MESMA sequência: `O=genMap(sd); BLD=O.B; buildOB(); DECOR=genDecor(sd);` (host ainda faz `initGrid()` depois). `genDecor` é determinística (RNG próprio `cenRng`), e `genDecor` usa `free()` que consulta `blk` — por isso os colliders têm de ser criados DEPOIS de `genDecor`, senão mudam o layout.
- `hitW`/`rayW` só veem t==5 (tiros atravessam props: manter). `smash`/`grabNear` só tocam t 1..3 (um t novo fica indestrutível).

## Mudanças
1. **`86-cenario.js`:** função nova `decorObs()` que, para cada item de `DECOR` cujo índice de sprite esteja na tabela abaixo, adiciona a `O` um obstáculo `{t:7,x,y,w,h,i:O.length}` (AABB; ponto (x,y) do DECOR é o PÉ com o sprite centrado em x — confira em `genDecor`/`place`/`add` e no desenho do DECOR em `90-sons.js` como `x,y` viram o retângulo; o retângulo cobre a base do prop, centrado em x e terminando em y). Respeite a orientação: para os índices de `CEN_ORI` (14,15,16,18,20,25,26) com yaw `r` ímpar (1 ou 3), troque L↔P. Não use `Math.random` (host e clientes devem ficar idênticos). Chame `decorObs()` e DEPOIS `buildOB()` de novo nos dois pontos: `40-host.js:13` (antes de `initGrid()`) e `50-cliente.js:2` (logo após `DECOR=genDecor(...)`). Isso NÃO pode ser feito antes do `genDecor`.
2. **`90-sons.js` ~linha 212:** o filtro de objetos desenháveis `o.t!=6` vira `o.t!=6&&o.t!=7` (senão `obst()` desenharia uma caixa para cada t:7). É a única mudança nesse arquivo.
3. Outros lugares que iteram `O` e podem tratar t desconhecido (ex.: minimapa, `wallAt` `40-host.js:60` trata `t>=5` como parede mole que atordoa o boss; para t:7 NÃO atordoar — se necessário ajuste para `t==5||t==6`): confira com `grep -n '\.t' src/js/*.js` e corrija só o que for afetado.

## Tabela de colisão (índice do sprite em `CENGLB` → retângulo L×P em px, antes do giro)
- COM colisão: 16 banco 80×22; 26 cerca 100×10; 20 barreira 90×26; 18 caçamba 90×47; 17 lixeira 25×25; 14 cabine 30×30; 15 ponto de ônibus 130×54; 24 barril 24×24; 25 pneus 60×35; 23 caixa de correio 18×18; 6 pedra média ~68×68; 7 pedra grande ~104×104 (reduza pedras para ~70% do lado, para não parecer parede invisível).
- Blocos pequenos (14×14): 8 e 9 poste, 10 hidrante, 22 semáforo, 21 placa, 5 pedra pequena.
- SEM colisão: 19 cone, 4 arbusto, 11/12/13 galões/caixas, 3 caixa, árvores.
- (Medidas vieram do AABB das malhas e de CENCFG; se algum índice não bater com o sprite real em `CENGLB`, confira o nome do GLB antes e ajuste.)

## Cuidados
- Não bloquear porta, rua ou ponte: a zona livre da porta já existe (`free()`) e `onRua` já mantém 64 px do eixo do asfalto; confirme com um probe que nenhum t:7 fica a < 24 px de uma abertura de porta (`b.dx..b.dx+56` na fachada sul) nem prende o spawn (2000,4500).
- Verifique que o jogador não fica preso entre prop e parede (props a < ~40 px de fachada formam bolsão): se achar casos, remova esses colliders no `decorObs` (rejeite collider cuja distância a qualquer `BLD` seja < 40 px, deixando o prop sem colisão).

## Critério de pronto
- `node build.js`, `node build.js --check`, `node --check` do maior `<script>` ok; `git diff` só em `86-cenario.js`, `40-host.js`, `50-cliente.js`, `90-sons.js` (e `10-mapa.js`/`20-caminhos.js` só se imprescindível; diga por quê) e `game.html`.
- Probe em `solo()` (Firefox, ver RETOMADA "Como testar"): número de t:7 criados (esperado ~100–200), `O.length` antes/depois, `DECOR.length` igual a antes; teleportar o jogador contra um banco, uma cerca e uma caçamba e confirmar que NÃO atravessa (`mvT`/`blk` retorna bloqueio) e que anda livre pela rua; zumbi contorna (pathfinding) sem travar; console sem erros; prints em `~/scratch_col/`.
- `window.__prof=1`: `PROF total` não pior que antes (~15–16 ms).
- Relatório ≤8 linhas em `saidas/relatorio.txt` com contagens e o que não deu para verificar (multiplayer).
