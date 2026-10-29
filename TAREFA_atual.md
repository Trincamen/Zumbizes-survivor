# TAREFA_atual.md — HUD no estilo de terror do jogo + armas maiores nos slots

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Código-fonte fica em `src/`. NUNCA edite `game.html` nem o imprima.** Edite `src/js/*.js`, `src/style.css`, `src/index.html` e, no fim, rode `node build.js` (depois `node build.js --check`). Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-500`. Só MUDE APARÊNCIA; não altere lógica de jogo, ids, handlers (`onpointerdown="dn(event,i)"`, `ar(...)`, `by(...)`, `pk(...)`...), nem o conteúdo dos textos.

## Problema (reportado pelo usuário)
A HUD está muito simples/“genérica” (azul-marinho, cantos arredondados, medalha dourada) e não combina com o jogo, que agora tem visual de terror (menu preto/vinho). Além disso, a arma dentro do slot da barra de baixo está pequena demais para saber qual arma é.

## Paleta e estilo-alvo (igual ao menu, já existente em `src/style.css`: `.mb`, `.pn`, `.sb`)
- Fundo: preto `#0a0a0c` → `#140e10` (gradiente suave); alpha ~.85 quando sobre o jogo.
- Borda: `2px solid #4a1a1e`, faixa esquerda mais grossa vermelho-sangue `#8a1218` (4–6 px); cantos RETOS (raio 2 px no máximo).
- Destaque/ativo: vermelho `#d83a3a` com brilho `0 0 14px #a0141a88`.
- Texto: cor de osso `#d8d2c0`; texto secundário `#8a8478`; ouro/dinheiro apagado `#c9a54a`.
- Sem azul-marinho (`#0b1024`, `#34437d` etc.) nem verde-limão na HUD.

## Arquivos
- PODE editar: `src/style.css`, `src/index.html` (só estilos inline e classes da HUD), `src/js/90-sons.js` (trecho da HUD no canvas), `src/js/50-cliente.js` (HTML dos slots/dinheiro), `src/js/85-armas.js` (`weaponIcon`).
- NÃO tocar: `server.js`, `Dockerfile`, `package*.json`, `game.html` (gerado), `build.js`.

## Passos
A. HUD desenhada no canvas — `src/js/90-sons.js` (achar com `grep -n 'rr(6,6,300,98,14)'`, `grep -n 'function badge'`, `grep -n 'function pbar'`, `grep -n 'Abates'`, `grep -n 'MMH=MH'`):
 1. Painel do topo-esquerdo (`rr(6,6,300,98,14)`; fill `rgba(8,12,32,.7)`; stroke azul): trocar para o estilo-alvo: raio 2, fundo `rgba(10,8,10,.85)` (pode usar gradiente), borda `#4a1a1e` 2px e uma faixa vermelha `#8a1218` de 5 px na esquerda. Texto do tempo/zumbis em `#d8d2c0` (mantenha o texto e a posição).
 2. `badge(...)` (medalha de nível): trocar o dourado por: disco escuro `#0a0a0c`, anel externo vermelho-sangue `#8a1218` (~3 px) e anel fino interno cor de osso `#d8d2c0` a ~60% de alpha; rótulo `NÍVEL` e número em cor de osso; o pulso de subir de nível passa de dourado para vermelho `#d83a3a`.
 3. Barra de vida (chamadas de `pbar(88,36,204,18,hf,hc[0],hc[1],'♥ ...')`): paleta de sangue: acima de 50% `['#d83a3a','#8a1218']`; 25–50% `['#e0701a','#8a3a0a']`; abaixo de 25% `['#ff2a2a','#600808']` com leve pulsar de brilho (`.8+.2*Math.sin(t/120)` no alpha ou no clarão). Barra de XP: `['#d8c88a','#8a7a3a']` (osso/ouro apagado). Se `pbar` desenha fundo/borda claros ou azuis, escurecer (`#0a0a0c` com borda `#4a1a1e`).
 4. Linha de estados (⚡ 💊 🎯): cor `#e8c25a` (⚡/💊) e `#d8d2c0` (🎯) em vez de azul/amarelo vivo (mantenha textos).
 5. Painel "Abates" (`X.fillRect(WW-190,ry,180,28+L.length*24)` e `txt('🏆 Abates',...)`): mesmo estilo (fundo `rgba(10,8,10,.85)`, borda `#4a1a1e`, faixa vermelha `#8a1218` à esquerda), título `☠ ABATES` em `#d83a3a`; nomes em `#d8d2c0`; o MEU nome (`p[0]==id`) em `#e8c25a`; números à direita iguais.
 6. Minimapa (código após `MMH=MH*f`, ~linhas 143-165): acrescentar moldura: borda `#4a1a1e` 2 px em volta de `(mx0,10,MMW,MMH)` e 4 cantinhos vermelhos `#8a1218` (traços de 8 px). Cores: terreno `#0f140f`, rio `#1d3646`, pontes `#6a6a70`, prédios comuns `#55555a`; mantenha as cores especiais dos prédios de hospital/polícia/mercado e os rótulos como estão.
B. Slots da barra de baixo — HTML em `src/js/50-cliente.js` (grep `class=kn` e `class=wl`) e CSS em `src/style.css` (`#wb button`, `.wl`, `.wi`, `.kn`, media `max-width:900px`, `.mob ...`):
 1. Tamanho dos slots: PC `120×88`; `@media(max-width:900px)` `84×64`; `.mob` `62×48` (ajuste `margin-right` proporcional). Estilo: gradiente `#0a0a0c → #181012`, borda `2px solid #4a1a1e` com `border-left:4px solid #8a1218`, raio 2 px. Slot selecionado (hoje `border-color:#fff` inline em `50-cliente.js`): trocar para `#d83a3a` + `box-shadow:0 0 14px #a0141a88`; não selecionado `#4a1a1e`. O `background-color` inline (`#123b` armas / `#412b` outros) trocar por tons escuros neutros: armas `#0c0c10`, outros itens `#160d0d`.
 2. Slot de arma (`q[0]<6`): a imagem da arma é o elemento PRINCIPAL e deve ocupar ~85-92% da largura do slot e ~55% da altura: `.wi{position:absolute;left:50%;top:50%;transform:translate(-50%,-58%);width:92%;height:auto;max-height:56%;object-fit:contain}` (PC); menores nas telas pequenas/`.mob` proporcionalmente. Nome da arma pequeno em maiúsculas (`font:700 10px 'Arial Black'` PC; 8px/7px menores) no canto superior (ao lado do número da tecla, que fica no canto superior esquerdo como chip vermelho: `.kn{background:#8a1218;color:#f0e6d8;padding:0 4px}`); linha "Nv x • a/b" pequena embaixo (`#8a8478`, 10px). Não cobrir a imagem com texto. Mantenha a barra de recarga (`--rl`, `--zs`, `--ze`, `--zc` e os `linear-gradient` de `#wb button`): não mexer nessa lógica, só garantir que continue visível.
 3. `weaponIcon(w)` em `src/js/85-armas.js`: aumentar a resolução e ocupar mais a largura: canvas `240×120`; `drawWeapon3D(c2,120,64,w,Math.PI/2,Math.min(420,214/WDIM[w]))` (a arma deve preencher ~90% da largura). Mantenha cache e fallback.
 4. Slot vazio (`<button disabled>—</button>`): texto `#4a4a4a`, fundo `repeating-linear-gradient(45deg,#0a0a0c 0 6px,#100c0e 6px 12px)`, mesma borda escura.
 5. Itens que não são arma (`CL[q[0]][0]` ícone/emoji + nome): mesmo tamanho de slot; ícone em ~28px centralizado, nome pequeno em baixo, cor osso.
 6. Caixa de dinheiro e setas ▲▼ (primeiros filhos de `#wb`, montados em `50-cliente.js` — procure `Soltar $` e `onclick="ar(`/`by(`): caixa preta com borda `#c9a54a` apagada (2px) em vez do amarelo vivo, texto `$` em `#c9a54a`; botões ▲▼ no mesmo estilo dos slots (borda `#4a1a1e`, seta `#d8d2c0`).
C. Outros botões/painéis HTML da HUD (`src/style.css` e inline em `src/index.html`): `.opt` (botão ⚙ no topo), `#shop` (loja; fundo/borda/botões `#shB button` em verde `#2a7` → botão vermelho-sangue como `.sb`), `#sk button` (escolha de perícia: borda `#fc3` → `#8a1218`, fundo preto, texto osso), `#cf` e `#opp` (usam `.pn`, já no estilo), `#bn` (banner) manter. Mesmo critério: preto, borda `#4a1a1e`, faixa/realce vermelho, texto osso, cantos retos.
D. Telas pequenas/celular: ajustar as variantes `@media(max-width:900px)` e `.mob` na mesma proporção; nada pode sair da tela nem sobrepor o joystick.
E. `node build.js` e `node build.js --check`.

## Critério de pronto
1. `node build.js` sem erro; `--check` diz "em dia".
2. `grep -c 'rgba(8,12,32' src/js/90-sons.js` = 0 e `grep -c '#34437d\|#0b1024' src/style.css` só pode restar em regras fora da HUD de jogo (menu antigo `.tb` pode ficar; HUD não).
3. `git status --short` só mostra: `src/style.css`, `src/index.html`, `src/js/90-sons.js`, `src/js/50-cliente.js`, `src/js/85-armas.js`, `game.html`.
4. (Claude testa no navegador depois: HUD de jogo no PC e em janela estreita, slots com arma, selecionado, vazio, recarga.)
