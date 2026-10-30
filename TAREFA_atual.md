# TAREFA_atual.md — Desempenho: cache de chão em GPU (ImageBitmap + recorte + pré-aquecimento)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).
> **Edite `src/`, NUNCA `game.html`. No fim rode `node build.js` e `node build.js --check`.** Só `src/js/90-sons.js` (bloco `GRD`/`grdChunk`/`groundChunks`, ~linhas 163-179). Nada além disso muda; visual idêntico.

## Problema (medido na GPU real do usuário, Firefox 158 com janela)
`chao` (= só `groundChunks()`) custa 17–19 ms/quadro (2,3 ms no headless); FPS ~28. Suspeita: chunks são canvases em memória de CPU reenviados à GPU a cada `drawImage`, blit do chunk inteiro mesmo quando só parte aparece, e criação síncrona de chunk novo (`cenRuaSpr`+`cenBlocks`) ao andar.

## Mudanças
1. **ImageBitmap:** `GRD` ganha `bmp:new Map()`. Em `grdChunk`, após desenhar o canvas, se `typeof createImageBitmap=='function'`: `createImageBitmap(cv).then(b=>{if(GRD.map.has(key))GRD.bmp.set(key,b);else b.close&&b.close()}).catch(()=>{})`. O `grdChunk` continua devolvendo o canvas; quem desenha usa o bitmap se existir. Ao evictar um chunk (LRU) e no reset por `sd`, fechar o bitmap (`close()`) e apagar de `GRD.bmp`.
2. **Recorte:** em `groundChunks`, em vez de `X.drawImage(chunk,i*1000,j*1000)`, desenhar só a parte visível com `drawImage` de 9 argumentos: retângulo visível em coordenadas do mundo `[cx-W/2-80, cx+W/2+80]×[cy-H/2-80, cy+H/2+80]`, interseção com o chunk `[i*1000,i*1000+1000]×[j*1000,...]`, fonte = interseção − origem do chunk, destino = interseção (mesma escala 1:1). Pular se largura/altura ≤ 0. Fonte = `GRD.bmp.get(key)||canvas`.
3. **Pré-aquecimento (sem engasgo ao andar):** no fim de `groundChunks`, criar NO MÁXIMO 1 chunk ausente por quadro, vizinho do chunk do jogador (`ci=floor(cx/1000)`, `cj=floor(cy/1000)`) na direção da borda mais próxima: se `cx%1000<300` → `ci-1`; se `>700` → `ci+1`; idem `cy` com `cj`; considerar também a diagonal; respeitar os mesmos limites do mapa (`i<0||j<0||i*1000>=MW||j*1000>=MH` → ignorar). Só criar se o chunk ainda não existe e se nenhum chunk foi criado neste quadro pelo laço visível.
4. **Profiler:** em `grdChunk`, ao criar um chunk, medir com `pfStart()`/`pfAdd('chunk',t0)` (já existem `pfStart`/`pfAdd`).
5. Manter LRU (limite 16), reset por `sd`, `try/catch` ao redor de `cenRuaSpr/cenBlocks`.

## Critério de pronto
- `node build.js`, `node build.js --check` ok; `node --check` do maior `<script>` ok.
- `git diff` só em `src/js/90-sons.js` e `game.html`.
- Console sem erros ao abrir `solo()`; o chão aparece igual (sem faixas pretas nas bordas do bitmap).
- Relatório ≤5 linhas em `saidas/relatorio.txt`.
