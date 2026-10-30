# TAREFA_atual.md — Menu: elevar a qualidade dos zumbis, do veículo e da cidade (incremental)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, snapshot/rede, `genMap`, `98-debug.js`, HTML/CSS do menu, logo, textos, paleta, estrada, céu, neblina e vinheta (APROVADOS, preservar). Mudança INCREMENTAL em `menuScene` e helpers dele (`src/js/90-sons.js`, ~linha 191+); NÃO reescrever o menu.

## Contexto técnico (verificado)
Sem three.js: é canvas 2D com rasterizador próprio de GLB (pintor, projeção oblíqua `cenMakeObl` em `86-cenario.js`; zumbis em `87-zumbis.js`: `zsprGen/zsprGet/zDraw`, `ZH=46` px de altura nativa, `ss=2`, clipes idle/walk/run/attack). NÃO invente APIs; confira com grep. Não há modelos novos de zumbi/prédio no repo: NÃO substituir por caixas/cilindros. Só melhorar apresentação com os GLB existentes.

## 1. Zumbis (presença e leitura)
- Hoje saem em ~46 px de altura, ampliados → pixelados e chapados. Para o MENU gere sprites em resolução maior: adicionar a `87-zumbis.js` um parâmetro OPCIONAL (ex.: `zsprGen(M,cn,ph,yaw,zh)` / `zsprGet(...,zh)` com chave de cache separada; `zh` default = `ZH`, jogo inalterado) e usar `zh` ~110–150 px nos planos próximos (menor nos distantes). Respeitar o limite de gerações por quadro (`ZBUD`) e o LRU; pré-aquecer poucos por quadro.
- Planos: (a) intermediário: 4–5 zumbis grandes e bem legíveis, modelos variados (padrao, sem_braco, policial, bombeiro, gordao 1x, corredor 1x), em grupo irregular PERTO da estrada central/esquerda-centro, não alinhados nem uniformes, alguns parados (`idle`), outros `walk`, 1 `run`; (b) distante: 2 grupos pequenos (3–4 cada) bem menores, perto do horizonte, esmaecidos pela névoa; NUNCA zumbis no lado esquerdo sob o menu/logo (x < ~32% da largura) exceto os muito distantes na linha do horizonte.
- Integração: sombra de contato elíptica escura sob cada zumbi (opacidade proporcional à proximidade); escurecer/dessaturar com a distância (cache: gerar uma versão "névoa" por sprite ou usar `globalAlpha` + camada de névoa por cima; NADA de `ctx.filter` por zumbi por quadro); leve luz de contorno quente vinda do horizonte nos planos próximos é opcional (só se barata, via sprite cacheado). Silhueta deve continuar legível no escuro (não deixar preto total).

## 2. Veículo abandonado (substitui o jeep + jogadores)
- Remover os jogadores/ocupantes e o jeep do primeiro plano. Novo veículo: `src/assets/veiculos/caminhao.glb` (JÁ copiado para o repo; silhueta robusta). Adicionar a `VGLB`/carregamento APENAS se não quebrar `vehIdx` do jogo (`(o.i*7+3)%5`): prefira constante separada (ex.: `MENU_CAMINHAO='@@GLB:assets/veiculos/caminhao.glb@@'`) lida com `cenLoad` + `vehSize`/`vehCrop`, sem alterar `VGLB` nem o mapa. Confira que o marcador `@@GLB:...@@` do `build.js` funciona em qualquer arquivo de `src/js/`.
- Vista TRASEIRA em 3/4 (traseira voltada ao jogador, girado ~20–30° para a lateral), no primeiro plano à DIREITA-INFERIOR, sem cobrir a área do menu nem os zumbis do plano intermediário. Descubra por teste qual `rot` de `cenMakeObl` mostra a traseira (o GLB tem frente em +X ou +Z; ver `vehBuild`). Sprite grande (~45–55% da altura da tela no máx.), `ss:2`, pré-renderizado UMA vez e cacheado por tamanho.
- Material: vidros escuros (se der, `cenLoad(b64,skip)` com `g.NM` para identificar nós e escurecer), lanternas traseiras vermelhas apagadas ou muito fracas (sem faróis acesos!), cores da pintura dessaturadas/escurecidas (`rgba(0,0,0,.3)` por cima + leve sujeira em degradê na parte de baixo). Sombra de contato grande e escura sob o veículo (elipse) e névoa baixa por cima da base para integrar ao asfalto. Reflexo/brilho mínimo.

## 3. Cidade (silhueta e profundidade)
- Mantém hospital/delegacia/mercado (`cenBldSpr`, `CEN_PSZ`) + árvores do jogo, mas sair do "fileira de caixas": larguras e alturas diferentes (escalas 0.3–0.9 e ESTICAR em altura/largura de forma independente quando necessário via `drawImage`), espaçamentos irregulares, 2–3 camadas de profundidade (mais longe = menor, mais claro/baixo contraste, mais desfoque; mais perto = silhueta mais forte), alguns prédios espelhados, alguns recortados pela névoa na base. Cores levemente diferentes por prédio (tint escuro/dessaturado), janelas aparecem nos mais próximos.
- Detalhes de topo (antena, caixa-d'água, chaminé) permitidos APENAS como silhuetas escuras simples e discretas nas camadas DISTANTES (são silhuetas de horizonte, não modelos); poucos, não em todos.
- Dano discreto: nada de ruínas exageradas; no máx. 1–2 prédios com silhueta de topo "quebrada" via recorte do sprite (clip no topo) nos planos distantes.
- Limpar o lado esquerdo (sob o menu): prédios mais baixos/escuros ali.
- Desfoque pré-renderizado UMA vez por tamanho (como já está). Névoa progressiva por camada; horizonte alaranjado parcialmente encoberto.

## Critério de pronto
1. `node build.js` e `node build.js --check` ok; `node --check` do script extraído ok; console sem erro novo; `cenario ms` < 600; o JOGO (zumbis em partida) inalterado (parâmetro novo opcional).
2. Sem ocupantes; caminhão de traseira/3-4 no canto inferior direito; zumbis legíveis e agrupados (não uniformes); skyline variado em camadas.
3. Menu (textos, logo, botões) idêntico; lado esquerdo limpo.
4. Sem `ctx.filter`/gradientes novos por quadro; só zumbis animam; FPS do menu estável.
5. Arquivos: `src/js/90-sons.js`, `src/js/87-zumbis.js` (só o parâmetro opcional), `src/assets/veiculos/caminhao.glb` (já copiado), `game.html` gerado. Relatório ≤5 linhas, citando o que NÃO foi possível sem novos modelos.
