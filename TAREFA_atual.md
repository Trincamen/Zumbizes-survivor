# TAREFA_atual.md — Jogador 3D: trote sem deslizar, correr ao acelerar, duas mãos na arma

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> `game.html` tem linhas enormes: NUNCA leia inteiro nem imprima a linha `const PGLB=` (96 KB). Use `grep -n -o 'function drawPlayer' game.html` e `sed -n 'A,Bp' game.html | cut -c1-400`. Só mexer no bloco "Jogador 3D" (`function pgSample` … fim de `drawPlayer`) e na chamada de `drawPlayer` do jogador vivo.

## Problemas (reportados pelo usuário)
1. Andar parece deslizar/travado: a cadência do clip não acompanha a velocidade real (jogo anda 150–336 px/s; o clip `walk` só cobre ~46 px/s).
2. Ao acelerar (remédio ou acerto da barra azul da recarga) tem de aparecer animação de CORRER. Andar normal deve parecer um TROTE (corrida leve), não caminhada.
3. De lado se vê que o jogador segura a arma com UMA mão: a mão esquerda tem de segurar a arma também.

## Dados do GLB (já medidos; não reanalise)
- Pernas (rotação X, rad): walk ±0.45, run ±0.87. Braços: walk -0.66..0.24, run -1.05..0.63. Bob do nó raiz: walk 0..0.03, run 0..0.06. Torso inclina: walk 0.06..0.11, run 0.22..0.27 (versões `_aim` ≈ iguais nas pernas; braços das `_aim` já seguram a arma à frente: arm_l x≈-1.35 y -0.22 z -0.27, arm_r x≈-1.5).
- Comprimento da perna ≈ 0.9 m; braço (mesh arm_l/arm_r) vai de y=+0.075 a y=-0.72 no seu eixo local (pende em -Y).
- Nós: 4 torso; 6 arm_l; 7 arm_r; 8 weapon_socket (filho de 7; cano da arma em +Z local do socket). 6 não tem filhos.
- Sinais do snapshot para o jogador: `e[21]` = segundos de boost de remédio (velocidade ×1.4), `e[30]` = boost da barra azul da recarga (×1.15). Velocidade normal 150·p.sp (150..240 px/s).

## Passos
A. Chamada do jogador vivo (`drawPlayer(x,y,{k:pid,fa:e[17]/10,aim:...`): acrescentar `fast:(e[21]|0)>0||(e[30]|0)>0`. (Na chamada do caído e do menu não precisa.)
B. Locomoção sempre com os clips `_aim` (o jogador sempre segura a arma à frente; `o.aim` só decide a direção do corpo). Remover o uso de `walk`, `run`, `idle` sem `_aim` e a variável `rate`. Estados de clip: `die` (se `o.dead`), `idle_aim` (parado: `st.sp<6` ou `o.idle`) e `loco` (movendo).
   - Separar fases: `st.it` (segundos acumulados, só para idle_aim: `st.it+=DT_`) e `st.ph` (fase da locomoção em CICLOS, 0..1). Campos novos em `st`: `ph:0,it:0,b:0,f:2`.
   - Para `loco`: 
     - `bt = o.fast ? 1 : .55*clamp((st.sp-40)/80,0,1)`; `st.b += (bt-st.b)*Math.min(1,DT_*6)`.
     - `A = .45+.42*st.b` (amplitude da perna); `D = 4*.9*Math.sin(A)*27` (px por ciclo); `ft = clamp(st.sp/D*.85, 1.2, 3.4)`; `st.f += (ft-st.f)*Math.min(1,DT_*8)`; `st.ph = (st.ph+DT_*st.f)%1`.
     - Pose = mistura de `walk_aim` (tempo `st.ph*dur_walk_aim`) e `run_aim` (tempo `st.ph*dur_run_aim`) com peso `st.b` para o run: função nova `pgLoco(ph,b)` que usa `pgPose` para amostrar `walk_aim` em `PG.PGT/PGR`, copia para arrays temporários novos (criar em `PG`: `TMT=new Float32Array(NN*3)`, `TMR=new Float32Array(NN*4)`), amostra `run_aim` em `PG.PGT/PGR` e mistura: translação lerp; quaternion nlerp com inversão de sinal se o produto escalar < 0, normalizar. O resultado fica em `PG.PGT/PGR` (o resto do pipeline — crossfade, overlay do `shoot` — continua igual; a mudança de `cn` entre `idle_aim`↔`loco`↔`die` usa o crossfade que já existe).
   - `idle_aim`: tempo do clip = `st.it % dur`. `die`: como está.
C. IK da mão esquerda (só se `!o.dead`). Logo DEPOIS do loop que calcula `R` (3x3 por nó, 9 floats) e `Wt` (translação por nó) e ANTES do loop dos triângulos:
   - Constante `PGFG=.35` (distância do apoio da arma, em metros, ao longo do cano a partir da empunhadura).
   - `G = Wt[8] + R8·(0,0,PGFG)` (R8 = matriz 3x3 do nó 8, linhas `R[72..80]`; coluna Z = `R[74],R[77],R[80]`). Ombro esquerdo = `Wt[6]`. `d = normalize(G − Wt[6])`.
   - Direção atual do braço `a0 = R6·(0,−1,0)` = `(−R[55],−R[58],−R[61])` (coluna −Y de R6; R6 ocupa `R[54..62]`).
   - Rotação de arco mínimo de `a0` para `d` (Rodrigues: `v=a0×d`, `c=a0·d`; se `c<-0.999` não fazer nada; `M = I + [v]× + [v]×²/(1+c)`), e substituir `R6 := M·R6` (escrever de volta em `R[54..62]`). `Wt[6]` não muda.
   - Isso vale para idle_aim, loco e shoot (sempre que vivo).
D. Manter o fallback `person()` quando `PG==null`. Manter caído (`dead`) e menu (`idle:true`) funcionando (menu usa `idle_aim`).

## Critério de pronto
1. `node --check` do script extraído de `game.html` sem erro.
2. `grep -c "'walk'\|'run'" game.html` não pode achar uso dos clips sem `_aim` no `drawPlayer`.
3. Só `game.html` alterado (`git status --short`).
4. (Claude testa no navegador depois: andar, boost, mão esquerda de lado.)
