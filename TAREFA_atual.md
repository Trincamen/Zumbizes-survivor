# TAREFA_atual.md — Jogador 3D (jogador.glb) no lugar do sprite `person()`

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> `game.html` tem linhas enormes: NUNCA leia inteiro nem imprima a linha `const PGLB=` (96 KB). Use `grep -n -o 'function nome' game.html` e `sed -n 'A,Bp' | cut -c1-600`.

## Objetivo
Desenhar os jogadores (vivos, caídos e os 4 heróis do menu) com o modelo `jogador.glb`, já embutido em base64 na const `PGLB` (antes de `function bushFront`). Zumbis, vendedor e boss continuam com `person()`/`drawBoss`. Todas as animações atuais têm de continuar (andar, mirar, atirar com recuo, cair).

## Fatos do GLB (já analisados; não reanalise)
- 11 nós, SEM skin: partes rígidas. Nós: 0 player(raiz; filhos 1,2,3,4,10), 1 hips, 2 leg_l, 3 leg_r, 4 torso(filhos 5 head, 6 arm_l, 7 arm_r), 8 weapon_socket (filho de arm_r=7), 9 muzzle_hint, 10 camera_target. Nós têm `translation`/`rotation`(quat xyzw) em repouso; sem scale. Meshes 0..6 = hips, leg_l, leg_r, torso, head, arm_l, arm_r (nó i ↔ mesh via campo `mesh` do nó).
- Mesh: POSITION float32 vec3, COLOR_0 uint8 vec4 normalizado, índices uint16, modo 4 (triângulos), ~1850 triângulos no total, cores por vértice (sem textura). Bufferviews sem stride, offsets alinhados.
- Unidades: metros, Y-up, pés em y=0, olha para +Z, altura 1.78.
- Animações (LINEAR; canais translation/rotation por nó): `idle`(2.6s) `walk`(1.0s) `run`(0.6s) `idle_aim` `walk_aim`(1.0s) `run_aim`(0.6s) em loop; `shoot`(0.35s, só torso/head/arm_l/arm_r) e `die`(1.0s) uma vez.
- Cor da camisa do jogador: vértices de cor exata (58,94,158), (44,72,124), (40,62,106) nas meshes torso(3), arm_l(5), arm_r(6). Devem ser trocados pela cor do jogador `c` (hex), preservando o tom: fator k = azul_do_vértice/158.

## Arquivos
- PODE editar: `game.html` (só o necessário). NÃO tocar: `server.js`, workflows, `package*.json`.

## Passos
A. Novo bloco logo DEPOIS da linha `const PGLB=...;` (em linhas curtas, sem tocar a linha PGLB):
 1. Loader: `atob(PGLB)` → Uint8Array; ler chunks (JSON 0x4E4F534A, BIN 0x004E4942); acessores via `slice` do ArrayBuffer (alinhamento). Montar: pais/filhos dos nós, pose de repouso (T,R), para cada mesh: posições, cor média por triângulo, fator de camisa por triângulo (0 se não é camisa), nó dono de cada vértice; clips (times/valores por canal, duração, loop). Envolver em try/catch: se falhar, `PG=null` e o jogo volta a usar `person()` (fallback).
 2. Arma provisória no nó 8 (weapon_socket): 2 caixas em triângulos, coordenadas locais com cano em +Z: corpo escuro `#222` (0.07×0.09×0.5, de z=0.05 a 0.55) e caixa colorida com a cor `o.gun` (0.05×0.05×0.25 sobre o cano, z de 0.30 a 0.55). (As armas .glb reais virão numa tarefa futura.)
 3. `function drawPlayer(x,y,o)`; `o`: `k` (chave de estado: pid ou 'm0'..'m3'), `fa` (ângulo do corpo, rad, 0=leste, π/2=sul), `aim` (ângulo da mira ou null), `c` (cor da camisa), `gun` (cor da arma), `ring` (cor do anel ou null), `shot` (Date.now() do último tiro ou 0), `dead` (true/false), `idle` (true no menu), `t` (Date.now()). Estado por `k` em `PGS={}`: yaw suavizado, fase dos clips, posição anterior (para velocidade), instante da morte.
 4. Pose por frame: esqueleto = repouso + clip base; mistura (crossfade ~0.15 s, slerp/nlerp de quats e lerp de translações) entre o clip anterior e o novo quando o clip muda.
   - Clip base: `dead` → `die` com tempo = min(dur, (t−instante da primeira vez morto)/1000), sem loop (segura a última pose; ao reviver zera). Senão velocidade `sp` (px/s, suavizada por EMA, calculada de x,y entre frames com `DT_`): sp<6 → idle; 6≤sp<200 → walk, taxa de reprodução sp/150; sp≥200 → run, taxa sp/210. Se `o.aim!=null` usar a versão `_aim` do clip. `o.idle` força `idle_aim`.
   - Atirar: se `t−o.shot < 350` ms, sobrescrever os canais do clip `shoot` (arm_l, arm_r, head, torso) com `shoot` no tempo (t−shot)/1000 (se não há mira use `shoot` mesmo assim).
 5. Orientação: ângulo alvo = `o.aim!=null ? o.aim : o.fa`; `psi = π/2 − ângulo`; suavizar `yaw += ad(psi,yaw)*Math.min(1,DT_*14)` (usar `ad` existente; ver como `drawBoss` faz com `BYAW`). Rotacionar todo o modelo em Y por `yaw`.
 6. Projeção e desenho: reutilizar o do boss: `SE, CE, K2, LV` (globais existentes), coordenada em metros → tela: `sx = x + X*S`, `sy = y − (Y − Z*K2)*S` com `S=27` px/m (cabeça ~48 px acima de y). Culling: normal da face `n` (produto vetorial, normalizada) e descartar se `n[1]*SE+n[2]*CE<=0.02`; profundidade `d=média(Y*SE+Z*CE)`, ordenar crescente (painter) por jogador; cor = cor do triângulo (camisa: `rgbOf(c)*k`) × luz `l=.38+.78*max(0,n·LV)`; `fillStyle` e `strokeStyle` iguais, `lineWidth=.6` (esconde frestas). Antes do corpo: sombra `ell(x,y,13,5,'rgba(0,0,0,.4)')` e, se `o.ring`, `ell(x,y,18,7,o.ring,1)` (mesmo que `person`). Evitar alocar objetos pesados por triângulo (usar arrays tipados/indices).
 6b. Se `PG==null` → chamar `person()` com os parâmetros equivalentes antigos (fallback).
B. Trocar as chamadas (achar com `grep -n -o 'person(x,y,{s:1,fa:e\[17\]' game.html` e inspecionar com `cut`):
 1. Jogador vivo (ramo `else{if((e[30]|0)>0)ell(...)...person(x,y,{s:1,fa:e[17]/10,...`): substituir `person(...)` por `drawPlayer(x,y,{k:pid,fa:e[17]/10,aim:e[25]>0?e[24]/10:null,c:c,gun:WC[cw],ring:c,shot:LSH[pid]||0,dead:false,t:t})`. Manter o anel de escudo, `reloadRing`, barra de vida, nome, `▼` e `reloadPill`.
 2. Jogador caído (ramo `if(dead){...}`): trocar só o sprite achatado (`X.fillStyle=c;X.fillRect(x-18,y-10,36,12);X.fillStyle='#e8bb98';X.beginPath();X.arc(x+22,y-4,7,0,7);X.fill();`) por `drawPlayer(x,y,{k:pid,fa:e[17]/10,aim:null,c:c,gun:'#222',ring:null,shot:0,dead:true,t:t})`; manter `✖`, anel `ell(x,y,34,14,c,1)` e o texto "(caído)".
 3. Heróis do menu (`const cs=[...];for(let i=0;i<4;i++)person(W*.5+i*W*.075,...`): trocar por `drawPlayer(W*.5+i*W*.075,H*.98-(i%2)*10,{k:'m'+i,fa:-1.3+i*.15,aim:null,c:cs[i],gun:'#ddd',ring:null,shot:0,dead:false,idle:true,t:t})`. Escala: o `S` do menu deve acompanhar `zs*2` (use um parâmetro `o.s` multiplicando `S`; no jogo `s=1`).
C. Não remover `person()` (ainda usada por zumbis, vendedor, boss do menu e fallback).

## Critério de pronto
1. `node --check` do script extraído de `game.html` sem erro.
2. `grep -c 'drawPlayer(' game.html` ≥ 4 (definição + 3 usos); `person(` continua definida.
3. Nada além de `game.html` alterado (`git status --short`).
4. (Claude testa no navegador depois: menu e partida solo.)
