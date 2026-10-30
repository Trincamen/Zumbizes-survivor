# TAREFA_atual.md — Menu: carro de frente com jogadores, zumbis GLB, fundo com prédios

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, snapshot/rede, `genMap`, `98-debug.js`, HTML/CSS do menu (o layout de textos está APROVADO, não mudar).

## Objetivo
Só alterar `menuScene(t)` (`src/js/90-sons.js`, ~linha 93+; pode ter helpers/caches novos ao lado). A composição atual (céu entardecer, neblina, estrada, vinheta, faróis) está aprovada; troque APENAS estes 3 elementos:

### 1. Carro de FRENTE, com os jogadores dentro (lado direito, primeiro plano)
- Hoje o carro aparece como bloco escuro e de lado. Passe a mostrar o carro VISTO DE FRENTE (frente voltada para quem olha, levemente de 3/4 se ficar melhor), grande, na estrada à direita, faróis acesos (brilho `lighter` amarelo já existente).
- Gere o sprite com `cenLoad(VGLB[i])` + `cenMakeObl` (veja `vehBuild`/`vehSize`/`vehCrop` em `src/js/86-cenario.js:255-290`, que já fazem sprites horizontal e vertical; a vertical `rot:-Math.PI/2` mostra o carro de frente OU de trás: confira qual é a frente testando; se for traseira, use `rot:+Math.PI/2`). Use escala maior que no jogo (ex.: `ss:2`, ~60–70 px/m, sprite com ~40% da largura da tela no máx.). Pré-renderize UMA vez e guarde em cache (não gerar por quadro).
- Escolha o modelo de `VGLB` em que os jogadores aparecem melhor (jeep ou caminhonete se tiver cabine aberta/vidro; senão a policia). Para ver os ocupantes: gere o sprite do carro SEM os nós de vidro (`cenLoad(b64,skip)` aceita `skip` por nome de nó; liste os nomes dos nós com `g.NM`), desenhe os jogadores por dentro e depois um retângulo/trapézio de vidro semitransparente escuro `rgba(20,30,35,.45)` por cima do para-brisa.
- Jogadores: 2–4 ocupantes (cores `#3a5a8a,#6a3a8a,#3a6a3a,#8a2e22`) usando `drawPlayer(...)` como a versão antiga fazia (ver `git show HEAD~1:src/js/90-sons.js | grep -n drawPlayer`), só tronco/cabeça visíveis (clip na região da cabine), lado a lado, `idle:true`, olhando para frente. Se o clip/posição ficar ruim, aceite 2 ocupantes (motorista e carona) em vez de 4.
- Escurecer um pouco o carro e a cabine para combinar com o clima (`rgba(0,0,0,.25)`).

### 2. Zumbis atrás do carro com os GLB do jogo
- Troque os `person(...)` por sprites 3D do `87-zumbis.js`: `zsprGet(mi,cn,phq,yawq)` + `zDraw(ctx,sp,x,y,s,wf)` (veja `zumbiSpr` em `87-zumbis.js:117` para como `mi`/`cn`/`yawq` são calculados: mi 0..3 = padrao/policial/bombeiro/sem_braco, 4 = corredor, 5 = gordão; `cn` 'walk'|'run'|'idle'|'attack'; `phq` 0..7; `yawq` 0..11). Se `zsprGet` devolver null (ainda gerando), pule o zumbi no quadro (sem fallback 2D).
- 8–12 zumbis em profundidade ATRÁS do carro (desenhados ANTES do carro, y menor), vindo pela estrada em direção ao carro, mistura de modelos, 'walk' (alguns 'run'), com fase de animação `(t/800+i*.137)%1`. Mais longe = menor e mais esmaecido pela névoa (desenhe a névoa por cima). Fase animada pelo tempo `t`.

### 3. Fundo: prédios do jogo desfocados no lugar das árvores
- Remova a floresta de pinheiros procedurais do horizonte. No lugar, uma linha de horizonte (cidade ao longe) com os prédios do jogo: hospital, delegacia, mercado, usando `cenBldSpr({T:'h'|'p'|'m',w:CEN_PSZ[T][0],h:CEN_PSZ[T][1],H:CEN_PSZ[T][2]},false)` (`86-cenario.js:195`; devolve sprite `{cv,ax,ay,w,h}`, desenhe com `cenDraw`/`ctx.drawImage`). Repita/alterne h/p/m em escalas diferentes (0.35–0.7), alguns sobrepostos, formando o skyline; entre eles, árvores do jogo (`CEN_SPR[0]` redonda, `[1]` pinheiro, `[2]` morta; `cenDraw(X,CEN_SPR[i],x,y)`), poucas.
- DESFOQUE: pré-renderize esse fundo UMA vez por tamanho (`W,H`) em canvas offscreen com `ctx.filter='blur(3px)'` (se `filter` não existir, desenhe em 1/3 de resolução e amplie com `imageSmoothingEnabled`), depois névoa em degradê (cinza-alaranjado, opacidade alta na base dos prédios), dessaturado/escurecido para combinar com o entardecer. Por quadro só `drawImage` do cache (sem blur por quadro).
- Se `CEN_BLD`/`CEN_SPR` forem nulos (falha de carga), fallback: retângulos escuros simples de prédio.

## Critério de pronto
1. `node build.js` e `node build.js --check` ok; `node --check` do script extraído ok; nenhum erro novo no console ao abrir o menu (`cenario ms` continua < 600).
2. Menu continua com o mesmo texto/botões; carro de frente com ocupantes visíveis; zumbis 3D; skyline desfocado com h/p/m.
3. FPS do menu não cai de forma visível (tudo estático em cache; só zumbis + faróis animam).
4. Apenas `src/js/90-sons.js` (e `game.html` gerado) alterados, salvo helper indispensável (justificar). Relatório final ≤5 linhas.
