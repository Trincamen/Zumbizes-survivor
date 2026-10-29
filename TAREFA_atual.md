# TAREFA_atual.md — Armas 3D (armas/*.glb) no jogador

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Código-fonte fica em `src/`. NUNCA edite `game.html` nem o imprima.** Edite `src/js/*.js` e, no fim, rode `node build.js` (depois `node build.js --check`). Achar código: `grep -n 'function nome' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.

## Objetivo
Trocar a arma provisória (2 caixas no nó `weapon_socket`) pelas armas reais em GLB, uma por tipo de arma. Índice da arma `cw` no jogo: 0 pistola, 1 escopeta, 2 rifle, 3 metralhadora, 4 lança-chamas, 5 sniper. Arquivos já copiados em `src/assets/armas/`: `pistola.glb escopeta.glb rifle.glb metralhadora.glb lanca_chamas.glb sniper.glb`.

## Fatos dos GLBs (já analisados; não reanalise)
- Cada arma: nó 0 `weapon` (filhos), nó 1 `weapon_body` (mesh 0), nó `muzzle` com `translation`; o lança-chamas tem também nó 2 `flame_pilot` (mesh 1, filho do body) e `muzzle` é o nó 3. Sem animações, sem skin, sem texturas.
- Cada primitiva: POSITION float32 vec3, COLOR_0 uint8 vec4 normalizado, índices uint16, modo 4 (triângulos). Mesma estrutura dos meshes do jogador (ver o loader em `src/js/80-jogador.js`, função `acc` e a montagem de `GEO`).
- Unidades em metros; origem = empunhadura; cano em +Z; comprimentos 0.5 a 2.7 m (já pensados na escala do jogador de 1.78 m). Triângulos por arma: 108 a 420.

## Arquivos
- PODE editar: `src/js/80-jogador.js`, novo `src/js/85-armas.js` e os arquivos de `src/js/` onde `drawPlayer(` é chamado (achar com `grep -n 'drawPlayer(' src/js/*.js`: jogador vivo/caído e heróis do menu).
- NÃO tocar: `server.js`, `Dockerfile`, `package*.json`, `game.html` (gerado), `build.js`.

## Passos
A. Novo `src/js/85-armas.js` (carrega depois de `80-jogador.js`, antes de `90-sons.js`):
 1. `const WGLB=['@@GLB:assets/armas/pistola.glb@@','@@GLB:assets/armas/escopeta.glb@@','@@GLB:assets/armas/rifle.glb@@','@@GLB:assets/armas/metralhadora.glb@@','@@GLB:assets/armas/lanca_chamas.glb@@','@@GLB:assets/armas/sniper.glb@@'];` (o `build.js` troca cada `@@GLB:...@@` pelo base64; não escreva base64 à mão).
 2. Função `pgParseGlb(b64)` independente (não mexa no loader do jogador): decodifica base64, lê chunks JSON/BIN e devolve `{j,acc}` com o mesmo `acc(i)` (Float32Array) usado em `80-jogador.js`.
 3. `const WPG=WGLB.map(...)` dentro de try/catch por arma (falhou → `null`): para cada arma, juntar TODAS as meshes dos nós com `mesh` (body e, no lança-chamas, `flame_pilot`; o flame_pilot é filho de body sem transform próprio, então as posições já estão no espaço da arma) em UM objeto `{P:Float32Array(nt*9),C:Uint8Array(nt*3),K:Float32Array(nt),n:nt}` no mesmo formato de `GEO[i]` (P = 3 vértices×xyz por triângulo, C = cor média RGB 0..255 por triângulo vinda de COLOR_0, K = zeros: sem cor de camisa). Se a primitiva não tiver COLOR_0 use 200,200,200.
 4. `const WFG=[.05,.35,.35,.35,.30,.40];` distância (m, ao longo do cano a partir da empunhadura) onde a mão esquerda segura cada arma.
B. `src/js/80-jogador.js`:
 1. Dimensionar os buffers para caber a maior arma: onde `TOT` é calculado (antes do `return {NN,PAR,...}`), somar `TOT+=600` (as arrays `XY,CL,DP,OR` e o limite `fc<TOT` do laço de triângulos passam a usar esse valor). A arma provisória (2 caixas) continua existindo como fallback quando `WPG[o.w]` for nulo/indefinido.
 2. `drawPlayer(x,y,o)` aceita `o.w` (índice da arma). No laço de geometria por nó (`const g=PG.GEO[ni]`), para o nó do `weapon_socket` (índice `ws`, já achado no loader: guarde-o em `PG.WS`) usar `const g=(ni===PG.WS&&typeof WPG!=='undefined'&&WPG[o.w])||PG.GEO[ni]`. Quando for geometria de arma real não aplicar cor de `o.gun` (K=0 já faz usar a cor do triângulo).
 3. IK da mão esquerda: trocar a constante `PGFG=.35` por `WFG[o.w]` (se `o.w` indefinido ou fora do array, `.35`), e somar à altura do ponto de apoio `+0.05` em Y do espaço do socket (o cano fica ~0.1 m acima do eixo da empunhadura): `G = Wt[8] + R8·(0,.05,fg)`.
C. Chamadas de `drawPlayer`: acrescentar `w:` com o índice da arma:
 1. Jogador vivo: `w:cw`.
 2. Jogador caído: `w:cw` (a arma cai junto com o corpo).
 3. Heróis do menu: `w:[2,1,3,5][i]`.
D. Rodar `node build.js` e `node build.js --check`.

## Critério de pronto
1. `node build.js` sem erro e `node build.js --check` diz "em dia".
2. `grep -c 'drawPlayer(' src/js/*.js` mostra as chamadas com `w:`.
3. `git status --short` só mostra: `src/js/80-jogador.js`, `src/js/85-armas.js`, `src/js/60-desenho.js` (e onde mais houver chamada de `drawPlayer`), `src/assets/armas/*` (já copiados), `game.html` (gerado).
4. (Claude testa no navegador depois: cada arma de lado, mão esquerda no apoio, caído, menu.)
