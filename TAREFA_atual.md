# TAREFA_atual.md — Cenário GLB, fase 1: árvores (t:1) e caixas (t:3) viram sprites pré-renderizados

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.
> Só MUDE O DESENHO. Não altere `genMap`, `O`, `BLD`, colisão (`blk`, `buildOB`), pathfinding, rede nem RNG: o mapa e as caixas de colisão têm de ficar idênticos.

## Objetivo
Em `obst(o)` (`src/js/60-desenho.js`, ~linha 29-31), os ramos `o.t==1` (árvore) e o `else` final (caixa, t:3) passam a desenhar um sprite vindo de GLB, pré-renderizado UMA vez. Carros (t:2), paredes (t:5) e prédios ficam como estão (fase 2).

## Arquivos
- Copiar de `~/Downloads/files/pacote_cenario_e_jogador/props/` para `src/assets/props/`: `arvore_redonda.glb`, `arvore_pinheiro.glb`, `arvore_morta.glb`, `caixa_municao.glb`. (Os GLB têm só POSITION + COLOR_0 + índices, sem textura; cada um tem 1-5 nós COM transformações; 170-440 triângulos; Y é para cima.)
- Embutir como os GLB de armas/itens (placeholder `@@GLB:assets/...@@` no JS, trocado por `build.js`; só mexa em `build.js` se for indispensável, mudança mínima).
- Novo `src/js/86-cenario.js` (entre `85-armas.js` e `90-sons.js`; confira como `build.js` lista/ordena os arquivos).
- Editar `src/js/60-desenho.js` (só os dois ramos de `obst`).

## Passos
1. Em `86-cenario.js`, parser próprio de GLB que REAPROVEITA `pgParseGlb(b64)` (retorna `{j,acc}`) mas aplica a hierarquia de nós (`translation`, `rotation` quaternion, `scale`, `matrix`; `scene.nodes` e `children`) a cada malha, gerando `{P:Float32Array(9*n), C:Uint8Array(3*n), n}` como o `WPG` (cor por face = média de `COLOR_0` dos 3 vértices ×255; se `COLOR_0` for float 0..1 multiplique, se for normalizado inteiro divida; sem COLOR_0 use 200). Não use `WPG` (só traz geometria sem transformações).
2. Função de render offscreen SEM limite de faces (não use `drawWeapon3D`, que tem `W3MAX=450` e buffers fixos): copie a lógica (yaw, descarte de faces de costas com `SE/CE`, sombreamento `LV`, ordenação por profundidade, projeção `y-(vy-vz*K2)*S`) usando buffers próprios dimensionados pelo `n` do modelo. Yaw fixo (ex.: `0.6`; árvores simétricas). Desenhe num `canvas` offscreen (guarde o próprio canvas, não dataURL), com folga de margem e âncora no pé (base do modelo) para `drawImage` posicionar o pé em um ponto conhecido.
3. Tamanhos-alvo no mundo (px de altura aproximada do sprite): redonda 100, pinheiro 110, morta 90, caixa_municao ≈ largura 40 (a caixa de colisão é 36×36; fica coerente). Escala `S = alvo / altura_do_modelo(Y max−min)`.
4. `obst`, ramo árvore (`o.t==1`): escolha determinística do modelo por `o.i % 3` (redonda, pinheiro, morta); mantenha a sombra elíptica atual (`ell`) e desenhe o sprite com o pé em `(x+12, y+12)` (mesmo ponto `cx,cy` de hoje). Ramo caixa (`else`): mantenha a sombra, desenhe o sprite centrado em `(x+w/2, y+h/2)` com pé em `y+h`.
5. Fallback: se o GLB falhar ao carregar/parsear (try/catch) ou o sprite ainda não existir, usar o desenho procedural atual (não apague o código antigo; mova para uma função ou deixe como `else`).
6. Carregar os sprites no mesmo ponto do boot onde os ícones/GLB das armas são preparados (veja `weaponIcon`/`WPG` e `99-iniciar.js`). Medir e imprimir no console o tempo total de pré-renderização (`console.log('cenario ms',...)`).

## Critério de pronto
- `node build.js --check` ok; `node --check` do maior `<script>` ok; sem erro de console ao abrir `game.html` em `solo()`.
- Print no Firefox headless (veja RETOMADA, "Como testar") mostrando árvores e caixas como modelos 3D coloridos, com sombra, ordenadas por y (jogador passa por trás/na frente corretamente).
- Colisão idêntica: nenhum arquivo além de `60-desenho.js`, `86-cenario.js`, assets (e `build.js` se indispensável) alterado.
- Pré-renderização < 300 ms.
