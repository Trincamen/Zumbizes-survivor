# TAREFA_atual.md — Otimização, pacote B (menos custo de tela cheia / HUD)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Achar código: `grep -n 'texto' src/js/*.js`; ler com `sed -n 'A,Bp' arquivo | cut -c1-400`.
> NÃO mexer em: `server.js`, Dockerfile, workflows, `package*.json`, `capacitor.config.json`, snapshot/rede, `genMap`, `98-debug.js`, `menuScene`/`ms*`. **Nenhuma mudança visual perceptível**: o jogo deve ficar com a mesma aparência; só muda o custo por quadro.

## Objetivo
Medição (Firefox, GPU real): no "regime lento" os passes de tela cheia (`chao`, `hud`) custam ~5 ms por megapixel. Reduzir o número de operações de tela cheia e de `shadowBlur` por quadro.

## Mudanças
1. **Tint + vinheta num bitmap só** — `src/js/90-sons.js` ~linhas 453–456 (`X.fillStyle='rgba(20,10,50,.2)';X.fillRect(0,0,W,H)` seguido do gradiente radial `VIG`). Hoje são 2 fillRect de tela cheia por quadro. Trocar por: um canvas offscreen do tamanho de `C.width × C.height` (pixels reais), desenhado UMA vez com a mesma geometria (aplicar `setTransform(ZO*DPR,0,0,ZO*DPR,0,0)` nele, pintar o tint `rgba(20,10,50,.2)` e depois o gradiente radial com os mesmos parâmetros e cores atuais), refeito só quando mudar `C.width`, `C.height` ou `ZO` (chave string/número simples). Por quadro: `X.save();X.setTransform(1,0,0,1,0,0);X.drawImage(off,0,0);X.restore()`. Preferir `ImageBitmap` via `createImageBitmap` se já houver padrão no projeto (como `sp.bm`); senão manter o canvas (não bloquear). Aparência idêntica.
2. **Canvas opaco** — `src/js/00-base.js:1`: `C.getContext('2d')` → `C.getContext('2d',{alpha:false})`. Antes, confirmar em `draw()` (`90-sons.js:402`) que o quadro começa com `fillRect` de cor sólida cobrindo tudo; se não cobrir, NÃO aplicar e anotar no relatório. Não usar `desynchronized`.
3. **Brilho do HUD sem `shadowBlur`** — `90-sons.js:478` (cruz de vida, `shadowBlur=10+10*pu`, cor `hcol`) e `:480` (estrela de nível, `shadowBlur` 16 se `lvUp` senão 10; cores `#ff6a5a` / `#f2c230`). Pré-renderizar o brilho de cada um em canvas offscreen pequeno (cache por cor/estado, criado sob demanda com `shadowBlur` fixo) e, por quadro, desenhar o brilho com `drawImage` e `globalAlpha` (a pulsação `pu` e o `lvUp` modulam o alpha em vez do raio do blur), depois desenhar a forma nítida SEM `shadowColor/shadowBlur`. Posição e tamanho do brilho devem coincidir com o atual; margem do offscreen suficiente para o blur não cortar.
4. **Gradiente do placar em cache** — `90-sons.js:~461` (`createLinearGradient(px,ry,px,ry+ph)` por quadro): guardar o gradiente em variável de módulo com chave `px|ry|ph` e recriar só se a chave mudar. Mesma aparência.
5. Fora de escopo neste lote (não fazer): redesenhar o HUD estático a 10 Hz, cache de jogador/itens, resolução dinâmica.

## Critério de pronto
- `node build.js` e `node build.js --check` ok; `node --check` em cada arquivo alterado de `src/js/`.
- `grep -n "shadowBlur" src/js/90-sons.js` não mostra mais `shadowBlur` nos dois trechos do HUD por quadro (pode restar dentro do código que PRÉ-RENDERIZA o brilho, fora do caminho por quadro).
- Só os arquivos acima alterados. Relatório em `saidas/relatorio.txt` (≤10 linhas): arquivos e linhas alteradas, e o que NÃO foi aplicado e por quê (ex.: item 2).
