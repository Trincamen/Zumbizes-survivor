# TAREFA_atual.md — Cenário GLB fase 1b: todas as árvores em GLB (inclusive menu) + mais props espalhados

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.
> NÃO altere `genMap`, `O`, `BLD`, colisão (`blk`, `buildOB`), pathfinding, rede nem o RNG do mapa: colisão e layout existentes ficam idênticos.

## Contexto (já feito, commit 93341dc)
`src/js/86-cenario.js` já tem `cenLoad`, `cenMake(g,alvo,'x'|'y',yaw,ss)`, `cenDraw(ctx,sp,x,y)` (pé do modelo em `x,y`), `CEN_SPR[0..3]` (0 redonda, 1 pinheiro, 2 morta, 3 caixa_municao) e `initCenario()`. `obst(o)` em `60-desenho.js` usa `CEN_SPR[o.i%3]` para t:1 e `CEN_SPR[3]` para t:3.

## Parte A — todas as árvores em GLB
1. **Menu**: `menuScene` em `src/js/90-sons.js` (~linha 98) desenha 9 árvores procedurais (`#2a1a14` / `#16281a`). Troque por `cenDraw(X, CEN_SPR[i%3], x, y)` (pé em `x,y`, a mesma base da elipse de sombra que já existe), mantendo posição, sombra e a escurecida/tom da cena do menu (se o sprite ficar claro demais, aplique `X.globalAlpha`/camada escura por cima como o resto da cena faz). Mantenha o desenho antigo como fallback se o sprite for null.
2. **Detritos voando** (`src/js/80-jogador.js` ~157 e ~159, `objShape`): `k==1` (árvore) e `k==11` (arbusto) ainda são procedurais. Troque `k==1` pelo mesmo sprite de árvore, e `k==11` pelo sprite de `arbusto.glb` (novo, ver B). Mantenha fallback procedural. Se o contexto de transformação (rotação/escala) da função tornar `cenDraw` inadequado, desenhe com `drawImage` equivalente respeitando a origem atual.
3. `grep -n "2d5a27\|3f7a35" src/js/*.js` no fim: não deve sobrar árvore procedural ativa (só fallbacks).

## Parte B — mais props (variedade; hoje só existe a caixa de munição)
Copiar de `~/Downloads/files/pacote_cenario_e_jogador/props/` para `src/assets/props/` e embutir como os atuais (`@@GLB:assets/props/NOME.glb@@`): `arbusto`, `pedra_pequena`, `pedra_media`, `pedra_grande`, `poste_luz`, `poste_luz_quebrado`, `hidrante`, `galao_combustivel`, `caixa_municao_pequena`, `caixa_cartuchos`, `cabine_telefonica`, `ponto_onibus`. (Mesmo formato dos já usados: POSITION+COLOR_0, nós com transformações; o loader atual serve.)
Estenda `CENGLB`/`initCenario` com os novos (alvos de tamanho em px: arbusto 34 de altura; pedra_pequena 22, média 36, grande 60 (altura); poste_luz 130, poste quebrado 130; hidrante 30; galão 28; caixa pequena largura 26; cartuchos largura 24; cabine 80; ponto_onibus largura 150 (`'x'`)). Mantenha tempo total de pré-render < 400 ms (imprima o `console.log('cenario ms',...)` que já existe).

1. **Caixas (t:3) variadas**: em `obst`, em vez de sempre `CEN_SPR[3]`, escolha por `o.i` (determinístico, ex.: `(o.i*7)%4`) entre caixa_municao, caixa_municao_pequena, galão e caixa_cartuchos (cartuchos mais rara). Sombra e colisão (36×36) ficam iguais; âncora no centro da base como hoje.
2. **Decoração espalhada (sem colisão, só visual)**: crie `genDecor(sd)` em `86-cenario.js` com PRNG PRÓPRIO (ex.: mulberry32 com semente `sd^0x5bd1e995`), chamado junto de onde `genMap(sd)` é chamado no host (`start()` em `40-host.js`) e no cliente (`onSnap` em `50-cliente.js`; use grep): TODOS os clientes têm de gerar a mesma lista a partir da mesma semente. Gere ~350 itens `{x,y,s}` (s = índice do sprite): arbusto e pedras (pequena/média, grande rara) em áreas de grama; poste_luz (e 1 em 6 quebrado), hidrante, cabine e ponto_onibus ao longo das bordas dos quarteirões (calçada/rua), poucos. Rejeitar posição se: `blk(x,y,40)` for verdadeiro, estiver dentro/perto (60 px) de prédio (`bAt`/`BLD`), no rio (`RY0..RY1` + margem) ou a menos de 200 px do spawn (2000,4500). Não use `ROWS` fixo inventado: use os mesmos limites do mundo (`MW`,`MH`) e `ROWS`.
3. **Desenho**: inclua os decorativos na lista ordenada por y que o `draw()` já usa para obstáculos (`D.push(...)` + `D.sort`, ~linhas 108-132 de `90-sons.js`; veja o formato de `ty`), com culling pelo mesmo teste de visibilidade (`v(x,y,r)`) dos outros objetos; sombra elíptica leve (`ell`) e `cenDraw`. Adicione um novo tipo `ty` sem mexer nos existentes. Não desenhar nada se o sprite for null.
4. Decorativos NÃO entram em `O`, `OB`, `GB`, snapshots nem pathfinding.

## Critério de pronto
- `node build.js --check` ok; `node --check` do maior `<script>` ok; sem erro de console em `solo()` e no menu.
- Print (veja RETOMADA, "Como testar") do menu com árvores 3D e de um trecho do jogo mostrando variedade (arbustos, pedras, postes, hidrantes, caixas diferentes).
- Colisão/mapa idênticos; arquivos alterados só: `86-cenario.js`, `60-desenho.js`, `90-sons.js`, `80-jogador.js`, `40-host.js`/`50-cliente.js` (só a chamada de `genDecor`), `src/assets/props/`.
- Nenhum FPS perceptivelmente pior (itens fora da tela são pulados).
