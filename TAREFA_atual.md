# TAREFA_atual.md — Portas livres (A) e marca de entrada em h/p/m (B)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, host/rede, colisão (`O`, `OB`, `blk`), `90-sons.js`, zumbis, jogador. Só `src/js/86-cenario.js` (A) e `src/js/60-desenho.js` (B, + helper opcional no 86).

## Problemas (usuário, jogando)
A. Em casas, um prop de `genDecor` (caçamba, banco, cabine, ponto de ônibus, cerca, pneus, barril, semáforo) cai na frente da porta e a esconde (print: caçamba tapando a porta de uma casa).
B. Em hospital/polícia/mercado o telhado fica na frente e não dá para ver onde é a entrada até entrar.

## Parte A — zona livre à frente da porta (`86-cenario.js`)
- `free()` (~linha 287) já itera `BLD` e rejeita ponto dentro do prédio ±6. Acrescente: para TODO prédio `b`, rejeitar se `x∈[b.dx-45, b.dx+101]` E `y∈[yb-20, yb+110]`, com `yb=b.y+b.h` (porta = `b.dx..b.dx+56`; `dx` vem de `10-mapa.js:4`: casa `x+q(24,w-80)`, h/p/m `x+w/2-28`). O y vai a +110 porque sprites altos cobrem a porta na projeção oblíqua.
- Não altere o consumo de `cenRng`/`rnd` (só rejeite posições, de forma determinística: host e clientes geram igual). Cobre `add()` e o laço de grama que usam `free`.
- Caçambas (~linhas 325-327: `add(b.x+b.w/2+q(-40,40), b.y+b.h+24 | b.y-24, 18)`): além do `free`, mova a caçamba para o CANTO do prédio: x = `b.x+14` ou `b.x+b.w-14` (escolha o lado MAIS LONGE de `b.dx+28`), mantendo o y e o consumo de `q()`.

## Parte B — marca de entrada em h/p/m (`60-desenho.js`)
- `facade(b)` (~linha 56) faz `if(cenBldSpr(b,0))return` e não desenha nada para h/p/m. Troque por: se há sprite, desenhar ANTES do `return` uma marca de entrada no chão, em `(b.dx+28, yb+8)` (centro da porta, logo ao sul da fachada): tapete escuro + seta/chevron apontando para o norte + texto `ENTRADA` (fonte pequena, cor clara com contorno). Pré-renderizada UMA vez num canvas (cache global `ENTR` criado na 1ª chamada, ex.: ~64×44 px, supersample 2) e desenhada com `drawImage` (1 por prédio visível). Pulso suave via `globalAlpha` (`.65+.25*Math.sin(Date.now()/350)`). Sem `shadowBlur`, sem gradiente por quadro.
- Só para `b.T` em `h,p,m` (os que têm `cenBldSpr`). Casas não mudam. Não mexer na ordenação de `90-sons.js` (facade já é desenhada antes do telhado e abaixo dos atores).

## Critério de pronto
- `node build.js`, `node build.js --check`, `node --check` do maior `<script>` ok; `git diff` só em `src/js/86-cenario.js`, `src/js/60-desenho.js` e `game.html`.
- Em `solo()` (Firefox, ver RETOMADA "Como testar"): prints em `~/scratch_ab/` de 3 casas, do hospital, da polícia e do mercado: nenhum prop sobre as portas; marca ENTRADA visível ao sul de h/p/m; console sem erros. Dê o número de props rejeitados pela zona (DECOR antes/depois, ~275 antes).
- Relatório ≤8 linhas em `saidas/relatorio.txt`.
