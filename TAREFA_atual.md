# TAREFA_atual.md — Cenário GLB fase 3: mobiliário urbano (cidade mais rica) + minimapa 3D

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`.
> Colisão, pathfinding, `O`, `BLD`, rede NÃO mudam (decoração é só visual, igual à fase 1b).

## Parte A — mobiliário urbano
Já existem em `src/assets/props/` (prontos, não copie nada): `banco, lixeira, cacamba, cone, barreira, placa_pare, semaforo, caixa_correio, barril, pneus, cerca` (.glb, vértice colorido, Y-up, frente = +Z, em metros) e, das fases anteriores, `poste_luz, poste_luz_quebrado, hidrante, cabine_telefonica, ponto_onibus, galao_combustivel, pedra_*, arbusto`.
1. Em `86-cenario.js`: estenda `CENGLB`/`initCenario` com os 11 novos (alturas-alvo em px: banco 34 (largura 80, use `'x'` com 80), lixeira 36, cacamba largura 90 (`'x'`), cone 22, barreira largura 90 (`'x'`), placa_pare 80, semaforo 120, caixa_correio 44, barril 38, pneus largura 60 (`'x'`), cerca largura 100 (`'x'`)). Mantenha pré-render total < 600 ms.
2. Em `genDecor(sd)` (mesmo PRNG próprio, mesmas regras de rejeição: `blk`, prédios, rio, spawn) acrescente, determinístico por semente, a lista de decoração urbana (meta: ~900 itens no total contando os atuais; fora da tela é pulado):
   - **Esquinas** (cruzamentos x=k·500,y=j·500 dentro das ruas existentes, fora do rio): 1 semáforo + 1 placa_pare em cantos opostos da calçada de ~50% das esquinas, caixa_correio/hidrante/lixeira em ~30%.
   - **Calçada ao longo dos quarteirões** (borda de 400×400 em `i*500+60`/`j*500+60`): poste_luz a cada ~250 px alternados (1 em 6 quebrado), bancos voltados para a rua (ocasionais), lixeiras a cada ~150–250 px, ponto_onibus e cabine_telefonica raros, cones e barreiras em "trechos de obra" curtos (3–5 itens alinhados) em ~10% dos quarteirões.
   - **Quarteirões sem prédio / perto de prédios**: caçambas encostadas em prédios, barris e pneus em grupos pequenos, cercas fechando trechos de lote vazio (3–4 segmentos em fila), galões.
   - Todos NÃO bloqueiam passagem: rejeitar posições em cima de ruas (asfalto) exceto cones/barreiras de obra; nada em cima de ponte/rio.
   - Sprites `'x'` (cerca, barreira, caçamba, pneus, banco) rotacionam só por espelhamento horizontal (flip) aleatório; não crie rotação 3D nova.
3. Desenho: use o mesmo mecanismo `ty` de decoração já criado na fase 1b.

## Correção do que já existe (fase 1b/2)
Em `genDecor`, `ponto_onibus`, `cabine_telefonica` e postes saem em cima do ASFALTO (print: ponto de ônibus no meio de um cruzamento). A rua tem 100 px de asfalto centrado em `k*500`; a calçada começa em `k*500±60`. Props de calçada (poste, ponto, cabine, banco, lixeira, hidrante, semáforo, correio, placa) só podem ficar a ≥ 68 px do eixo da rua (centro na calçada/borda do quarteirão); rejeite qualquer posição dentro de `|x-k*500|<64` ou `|y-k*500|<64` (use as mesmas faixas de rua do desenho; exceto cones/barreiras de obra, que podem ficar na rua). Ponto de ônibus encosta na borda do quarteirão e fica de frente para a rua.

## Parte B — minimapa mais 3D (no estilo dos personagens)
Local: `src/js/90-sons.js`, bloco do minimapa (grep `MMW`; fundo `#0f140f`, rio `#1d3646`, prédios `fillRect`, pontos de zumbis/itens). Mantenha: tamanho (`MMW=170`), moldura vermelha com cantos, rótulos HOSPITAL/POLÍCIA/MERCADO, posição, escala `hk`, setas.
1. **Camada estática pré-renderizada** num canvas offscreen (uma vez por mapa/semente e por `MMW`; invalidar quando `curSd`/`sd` mudar ou `O`/`BLD` forem recriados): grama com leve gradiente, rio com brilho, pontes, ruas (asfalto escuro + linha central), calçada de cada quarteirão, e cada prédio EXTRUDADO com a projeção oblíqua do jogo (`SHK=.3`; altura = `b.H*f*0.9`, mínimo 2 px): sombra projetada, parede frontal (face sul) mais escura, telhado mais claro, cores por tipo (hospital branco, polícia azul, mercado laranja, demais cinza). Árvores (`o.t==1`) como pequena copa verde com sombra. Não desenhar prop de decoração.
2. **Camada dinâmica** (por quadro, sobre a estática): jogadores como mini-bonecos 3D simples (sombra elíptica + corpo em pílula na cor de cada jogador + cabeça clara + contorno escuro; o jogador local com anel pulsante e seta de direção), aliados caídos esmaecidos; zumbis como figurinhas escuras com sombra (k<3) e o boss maior, roxo e com brilho; itens como ponto com brilho `lighter`. Mantenha os dados atuais (`s.P`, `ZMM`, `IL`, `s.bp`, etc.) e as setas.
3. Desempenho: nenhum laço novo caro por quadro; a camada estática só é redesenhada via `drawImage`.

## Critério de pronto
- `node build.js --check` ok; `node --check` do maior `<script>` ok; sem erro de console em `solo()`.
- Prints no Firefox headless (veja RETOMADA, "Como testar"): (a) um cruzamento com semáforo/placa/poste; (b) calçada com bancos/lixeiras; (c) um trecho de obra; (d) o minimapa 3D com prédios extrudados e os pontos de jogador/zumbi.
- Tempo de pré-render impresso (`cenario ms`) < 600 ms; FPS sem queda perceptível.
- Arquivos alterados só: `86-cenario.js`, `90-sons.js`, `60-desenho.js` (se preciso) e GLBs já em `src/assets/props/`.
