# TAREFA_atual.md — EXECUTAR AGORA: AJUSTES DO TUTORIAL (`src/js/89r-tutorial.js`, `src/style.css`, `src/assets/tutorial/`, `src/index.html`)

> Edite SÓ `src/`, depois `node build.js` e `node build.js --check`. NÃO mexer em `server.js`, Dockerfile, workflows, `package*.json`, `40-host.js`. NÃO commite. Se travar 2×, pare e reporte. Testes só no Chrome (`tools/teste/lib.py`; o menu de DEBUG `98-debug.js` existe no build normal e serve para spawnar boss e dar/soltar itens no chão). Não imprima `game.html`. PNGs ≤ 30 KB cada.

## 1. Botão COMO JOGAR das opções está por cima de outras coisas
No painel `#opp` (`src/index.html` ~linha 25, estilo `#opp` em `style.css`) o botão COMO JOGAR ficou sobreposto. Colocá-lo no fluxo normal do painel, junto dos outros botões (`class=sb`), sem `position:absolute/fixed` e sem sobrepor AJUSTAR HUD, FECHAR, SAIR PARA O MENU, nem no celular (`.mob`, 390×844). Conferir com print do painel aberto (PC e celular).

## 2. Texto maior
Tamanho da letra do texto explicativo do tutorial = **15px** (`.mob` também 15px; o painel pode crescer em largura/altura, mas deve caber na tela 390×844 — se precisar, rolar o texto dentro do painel). Títulos proporcionais.

## 3. Nomes em negrito e sem explicar localização
O mapa é aleatório: NÃO dizer onde ficam hospital/polícia/mercado. Em todas as páginas, destacar em **negrito** os nomes que a pessoa vai ver no jogo (HOSPITAL, POLÍCIA, MERCADO, AREA SEGURA, Bandagem, Analgésico, Kit de cura, Desfibrilador, Melhoria da arma, KRAID etc.), cada um com 1 frase curta do que é/faz.

## 4. Página de andar/atirar (mouse)
Trocar o texto do mouse por: no PC, WASD/setas andam; **clicar num inimigo com o mouse faz o personagem mirar nele**; sem clicar, o jogo **atira sozinho**. Confira o comportamento real (`onPD` em `50-cliente.js` e o tratamento de `m.t=='i'` em `40-host.js`: o clique escolhe o zumbi mais perto do ponto como alvo `tz`) para o texto não ficar errado. Celular: joystick anda; toque num inimigo mira; sem tocar atira sozinho (confirme).

## 5. Minimapa em DUAS páginas (total passa a 8: indicador "n/8")
- Página "Minimapa — lugares": manter o print atual do mapa; legenda em lista (1 linha por item, nome em negrito): **HOSPITAL** curas · **POLÍCIA** armas · **MERCADO** itens e dinheiro · **AREA SEGURA** abrigo com torretas. Dizer que no celular aparecem como pontinho colorido com a inicial. Sem localização.
- Página "Minimapa — pontos": print com os pontos dinâmicos, 1 linha por ponto em negrito: **você/aliados**, **zumbis**, **BOSS**, **itens**, **LOJA**. Para o print: no Chrome, solo, usar o debug para spawnar o boss (e esperar aparecer no minimapa como bolinha), abrir a loja (debug: loja) e soltar alguns itens no chão perto; recortar o minimapa mostrando a bolinha do boss e a marca da loja (pode ser 2 recortes lado a lado numa só imagem). Confira as cores reais em `ghMini` (`89g-glhud.js`) e descreva cada ponto com a cor certa.

## 6. Itens de cura com o objeto 3D
Página dos itens de cura: soltar no chão (debug: "itens chão") Bandagem, Analgésico (pílula), Kit de cura e Desfibrilador perto do jogador, enquadrar cada esfera/objeto 3D do chão (`drawPickup`/esfera 3D) e recortar um print por item (ou uma faixa única com os 4). Cada um com nome em **negrito** e 1 linha do efeito real (confira em `40-host.js` o valor de cura de cada k0/k9/k10 e k1). Tirar o recorte da lista da loja.

## 7. Renumerar
Páginas finais (8): 1 andar/atirar · 2 minimapa lugares · 3 minimapa pontos · 4 melhoria de armas · 5 Área Segura · 6 subir de nível · 7 itens de cura · 8 HUD das armas. Atualizar `.tp1..tp8`, `n/8`, `SEGUIR/ENTENDI`, e os PNGs em `src/assets/tutorial/NN.png` (novos/regravados).

## Critério de pronto
`node build.js` e `--check` ok; `node --check` ok; `window.__err` vazio. Teste Chrome 1500×950 e 390×844: painel de opções com COMO JOGAR sem sobrepor nada (prints), tutorial das 8 páginas com texto 15px legível e dentro da tela, prints novos mostram a bolinha do boss, a marca da loja e os objetos 3D dos itens. Prints do teste em `/tmp/opencode/tutorial2/`. Devolver ≤5 linhas: sucesso/falha, arquivos alterados, caminhos dos prints, fatos não confirmados.
