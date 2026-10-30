# TAREFA_atual.md — Cenário GLB fase 2: ruas (2a) e hospital/polícia/mercado (2b) como sprites pré-renderizados

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.
> Colisão, pathfinding, paredes t:5, `O`, `BLD`, rede e minimapa NÃO mudam. Tudo novo é só desenho, com FALLBACK para o desenho procedural atual se o sprite for null (try/catch no carregamento).

## Contexto (já feito)
`src/js/86-cenario.js`: `cenLoad(b64)` (GLB → triângulos com hierarquia de nós), `cenMake` (render offscreen com a câmera 42° das armas), `cenDraw`, `initCenario()`. ATENÇÃO: o jogo NÃO usa câmera 42°; o mundo é uma projeção OBLÍQUA: tela = `(X − SHK·h, Y − h)` onde (X,Y) é o chão do mundo em px, `h` a altura em px e `SHK=.3` (`60-desenho.js`). Sprites de ruas e prédios têm de usar ESSA projeção, não `cenMake`.

## Passo 0 — nova função de render oblíquo (em `86-cenario.js`)
`cenMakeObl(g, {w, d, hpx, ss})`: GLB com eixos Y-up, frente (porta) = +Z. Mapear: `X = (x−cx)/FX·w`, `Y_mundo = (z−cz)/FZ·d`, `h = y/Fy·hpx` (escala não uniforme para caber em `w×d` px de chão e `hpx` px de altura; `FX,FZ` = `footprint_xz` do GLB lido de `j.scenes[0].extras` ou `j.asset.extras`; `Fy` = `wall_height`). Projeção: `sx = X − SHK·h`, `sy = Y_mundo − h`. Face visível se `normal·(SHK,1,1) > 0` (normal em espaço do mundo já escalado; recalcule normais depois da escala). Profundidade para o pintor: `SHK·X + h + Y_mundo` (maior = mais perto), ordenar crescente. Sombreamento: reaproveite `LV`. Retorne `{cv, ax, ay, w, h}` onde (ax,ay) = ponto da tela que corresponde ao centro do chão no nível h=0 (para o `drawImage` posicionar em `(b.x+b.w/2, b.y+b.h/2)`). Margem de 2 px. Estenda `cenLoad(b64, skip)` com um filtro opcional `skip(nome)` (nome do nó; ignore o nó e filhos) e também retorne `extras` do GLB.

## 2a — Ruas
Copiar `rua/rua_reta.glb` e `rua/rua_cruzamento.glb` de `~/Downloads/files/pacote_cenario_e_jogador/rua/` para `src/assets/rua/` (tile 24 m × 24 m, altura ~0,4 m, Y-up, sem extras). Mapeamento: tile 24 m = 120 px (a rua tem 120 px de largura), `hpx` = 5 px/m. Descubra no GLB em que eixo corre a reta e gere dois canvases: reta horizontal e reta vertical (gire 90° o canvas ou o modelo), e o cruzamento. Render via `cenMakeObl` (h≈0, ou seja, vista de cima).
Desenho: em `90-sons.js` (~linhas 110-113: 9 ruas verticais k·500 de largura 120 em y 0–2500 e 3500–6000; 12 horizontais y=k·500, k=0..5 e 7..12... use os MESMOS intervalos do código atual) substitua o fillRect do asfalto e a linha amarela tracejada por tiles de 120 px (cruzamento onde uma vertical cruza uma horizontal; reta nos demais), desenhando só os tiles visíveis (use o mesmo teste de visibilidade/câmera do resto de `draw`). Desligue a linha central procedural quando os tiles estiverem em uso. NÃO mexer em `bridgeGround`/pontes, calçadas (`#807a6a`) nem gramado dos quarteirões (calçada/gramado são desenhados DEPOIS e cobrem a borda do tile). Se algum tile for null, desenhe o procedural atual.

## 2b — Hospital, polícia, mercado
Copiar `predios/predio_hospital.glb`, `predio_policia.glb`, `predio_mercado.glb` para `src/assets/predios/`. Cada GLB tem nós nomeados: `floor`, `wall_*`/`walls_exterior`/`walls_interior`, `glass`, `furniture`, `decor_grim`, `cobwebs`, `roof`, `sign`, `awning`, `doors`, `parking`, `cart_corral`, `flag`, `loot_*`, `player_spawn`, `zombie_*`, `world`. Extras na cena: `footprint_xz` (ex.: polícia [16.4,12.4], mercado [10,7]), `wall_height`.
1. Pré-render por tipo (h, p, m), UMA vez, tamanho = a caixa do prédio no jogo (hospital 876×360, polícia 360×360, mercado 370×350; leia de `10-mapa.js:4-21` / `BLD`, não invente), altura `hpx` = `H` do tipo (88, 84, 84):
   - EXTERIOR: tudo exceto `skip` = `parking`, `cart_corral`, `loot_*`, `player_spawn`, `zombie_*` (ligue `flag` e `sign`, `roof`, `awning`).
   - INTERIOR: só `floor`, `furniture`, `decor_grim`, `cobwebs` (sem teto, sem paredes; as paredes procedurais t:5 continuam sendo desenhadas por dentro).
2. Porta: a abertura da parede sul no GLB é CENTRALIZADA (polícia: x −1,2…1,2 m; mercado −1…1 m; hospital: confirme em `colliders_aabb_minxyz_maxxyz`). No jogo `dx` é aleatório (`10-mapa.js`, `dx=x+q(24,w-80)`). Para h/p/m, mantenha a chamada `q(...)` (para NÃO deslocar o RNG) mas substitua o valor por `b.x+b.w/2-28` (porta de 56 px centralizada). Isso muda só a posição da porta desses 3 prédios; layout e RNG do resto ficam idênticos.
3. Desenho (`roof(b)`, `facade(b)`, `obst` t:5, piso `90-sons.js:116`, `D.push` em ~121-123): para `b.T` em h/p/m COM sprite pronto:
   - FORA (`meB!==b`): desenhar o sprite EXTERIOR UMA vez, na lista ordenada, com `ty` de `roof` e y de ordenação `b.y+b.h+1` (o mesmo do telhado atual); pular o telhado, a fachada e as paredes t:5 desse prédio (continuam existindo para colisão). Piso procedural pode ficar embaixo.
   - DENTRO (`meB===b`): desenhar o sprite INTERIOR no lugar do piso procedural (camada de chão), manter as paredes t:5 procedurais como hoje, sem telhado e sem fachada, como já é.
   - Casas `x`, galpão `W` e todo o resto: inalterados.
4. Letreiros procedurais (HOSPITAL, POLÍCIA na `facade`) ficam desligados quando o sprite existir (o GLB já tem `sign`).

## Critério de pronto
- `node build.js --check` ok; `node --check` do maior `<script>` ok; sem erro de console em `solo()`.
- Prints (Firefox headless, veja RETOMADA, "Como testar"): (a) trecho de rua com reta e cruzamento alinhados e sem emendas visíveis; (b) cada um dos três prédios por fora; (c) jogador dentro de um deles (teleportando via script injetado) vendo o piso/mobília; (d) a porta do sprite alinhada com a abertura da parede (o jogador entra pela porta desenhada).
- Tempo total de pré-render impresso no console (`console.log('cenario ms',...)`) < 600 ms.
- Arquivos alterados só: `86-cenario.js`, `90-sons.js`, `60-desenho.js`, `10-mapa.js` (só o valor de `dx` de h/p/m), `src/assets/rua/`, `src/assets/predios/`.
