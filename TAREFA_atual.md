# TAREFA_atual.md — Zumbis 3D (GLB) com cache de sprites (fase 1: zumbis comuns; SEM boss)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, host/rede (`40-host.js`, `30-rede.js`), `drawBoss`/boss, jogador (`drawPlayer`), snapshot. Só cliente. `person()` continua existindo como FALLBACK.

## Contexto (medido)
Zumbis hoje são 2D (`person()` em `60-desenho.js:7`, chamado no ramo `ty==1` de `90-sons.js` ~226-229). Os GLBs de zumbi têm ~2000 triângulos; rasterizar 1 modelo em software custa ~2,4 ms, então com 30–100 zumbis é obrigatório CACHEAR sprites. Padrão já usado no projeto: sprite `{cv,ax,ay,w,h}` + `cenDraw(X,sp,x,y)` (`86-cenario.js:85`), que converte para `ImageBitmap` (`sp.bm`) na 1ª vez.

## Arquivos
1. Já copiados em `src/assets/zumbis/`: `zumbi_{padrao,policial,bombeiro,sem_braco,corredor,gordao}.glb` (e `zumbi_boss.glb`, NÃO usar nesta fase).
2. Novo `src/js/87-zumbis.js` (ordem alfabética: depois de 86-cenario, antes de 90-sons). Lista no padrão do projeto: `const ZGLB=['@@GLB:assets/zumbis/zumbi_padrao.glb@@', ...]` na ordem: 0 padrao, 1 policial, 2 bombeiro, 3 sem_braco, 4 corredor, 5 gordao (o `build.js` troca `@@GLB:...@@` por base64).
3. Integração mínima em `90-sons.js` (ramo `ty==1`, zumbi k≠3) e perfil `pfAdd`.

## Modelo (parse)
- Use `pgParseGlb(b64)` (`85-armas.js:5`) → `{j,acc}`. NÃO use `cenLoad` (achata nós).
- Todos os GLBs: 9 nós (`zombie, hips, leg_l, leg_r, torso, head, eye_glow, arm_l, arm_r`), sem skin, atributos `POSITION,NORMAL,COLOR_0` (cor por vértice; cor da face = média dos 3 vértices), animações por nó (canais translation/rotation/scale). Clipes por NOME: `walk` (padrao/policial/bombeiro/sem_braco/gordao), `run` (corredor, que NÃO tem `walk`), `idle`, `attack`. Escolha de clipe: nome pedido → fallback `walk`↔`run` → `idle`.
- Leia como `drawPlayer`/loader do jogador (`80-jogador.js:4-48`, `pgSample`:50, `pgPose`:58, matrizes mundo :98-107, projeção/cull/luz/sort/pintura :128-153) e REPRODUZA em funções próprias com prefixo `z` parametrizadas por modelo `M` (não altere as do jogador). Projeção: câmera fixa `SE/CE/K2` (`70-boss.js:2`), `sx=x+rx*S`, `sy=y-(ry-rz*K2)*S`, yaw = giro em Y; cull `ny*SE+nz*CE<=.02`; luz `.38+.78*dot(n,LV)`; ordenar por profundidade (como :148) e pintar `beginPath/fill/stroke` com `lineWidth≈.6`.

## Sprites e cache
- `zsprGen(mi,clip,ph,yawq)`: desenha o modelo na pose `clip` na fase `ph∈[0,1)` com giro `yawq` num canvas offscreen com supersampling 2 (como `cenMake` `86-cenario.js:54-83`), pé na âncora; escala para altura ≈ 46 px (altura do modelo na pose de repouso do idle: `S=46/(ymax−ymin)`, calcule 1×/modelo). Retorna `{cv,ax,ay,w,h}` compatível com `cenDraw`.
- Chave `mi|clip|phq|yawq`. Quantização: fase em **8** passos (clipes cíclicos walk/run/idle/attack), yaw em **12** passos. Cache `ZSPR` (Map) com LRU de **300** sprites (reposiciona no acerto; ao evictar, `sp.bm&&sp.bm.close&&sp.bm.close()`).
- Geração sob demanda, **no máximo 2 por quadro** (contador zerado a cada `draw`); se faltar sprite ou o limite estourou → desenhar `person()` (fallback) naquele quadro. Perfil: `pfAdd('zsprite',t0)` na geração, `pfAdd('zdraw',t0)` no blit total dos zumbis.
- Desenho: `zumbiSpr(ctx,x,y,k,v,fa,id,t,s)`: sombra elipse como hoje (`ell`, mesma que `person` desenha), depois `cenDraw` com escala `s` (k0=1, k1=.9, k2=1.5; largura extra do k2 como hoje) — o sprite está em escala 1, desenhe com `ctx.drawImage` escalado se `s≠1` (adapte sem alterar `cenDraw`, ou crie `zDraw` equivalente que use `sp.bm||sp.cv`).
- Mapeamento por `k` e variante `v` do snapshot (`z=[x,y,k,hp%,v,fa*10,id]`): k0: `v==0` padrao, 1 policial, 2 bombeiro, 3 sem_braco; k1 → corredor; k2 → gordao. k3 (boss) NÃO muda.
- Yaw: o `fa` do snapshot não é suavizado; suavize por zumbi em `RP['z'+id]` (ou mapa próprio limpo como `RP`) com `yaw += ad(psi,yaw)*min(1,DT_*10)` (mesmo estilo de `80-jogador.js:101-102`), `psi=π/2−fa` como no jogador (confira no teste que o zumbi olha para o jogador; se estiver de costas/invertido, corrija o sinal) e quantize só no momento de escolher sprite.
- Clipe: andando (posição suavizada `sm()` mudou > ~.3 px/quadro) → `walk`/`run`; parado → `idle`; perto do jogador vivo mais próximo (distância ≤ raio+16, raio 12/10/18) → `attack`. Fase = `t/(k==1?500:800)` mod 1 + `id*.137` (para não ficarem sincronizados).
- Barra de vida (`bar(...)` ~linha 229) e demais textos continuam FORA do sprite; posicione a barra em `y − altura do sprite*s − 6`.

## Critério de pronto (verifique rodando)
- `node build.js`, `node build.js --check`, `node --check` do maior `<script>` ok; `game.html` embute os 6 GLBs.
- `git diff` só em `src/js/87-zumbis.js` (novo), `src/js/90-sons.js`, `src/assets/zumbis/` e `game.html`.
- Em `solo()` no Firefox (ver RETOMADA, "Como testar"): console sem erros; zumbis 3D visíveis (padrao/policial/bombeiro/sem_braco no k0, corredor, gordão), olhando para o jogador, andando com animação; boss e jogador iguais a antes; screenshots em `~/scratch_zumbis/` (zoom de 4–5 zumbis).
- Com `window.__prof=1`, cenário ≥30 zumbis: `zsprite` e `zdraw` aparecem no `PROF`; `objetos` não pode ser pior que o atual (≈10,7 ms com ~100 zumbis na tela); mostrar números.
- Relatório ≤8 linhas em `saidas/relatorio.txt` com os números e o que não deu para verificar.
