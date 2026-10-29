# RETOMADA.md — Zombizes Survivor / "Horda Cooperativa" (jogo web de horda de zumbis, co-op)

> Metodologia herdada de `~/Projetos/spuermetroid navegador/` (RETOMADA.md + TAREFA_atual.md + agentes). Conteúdo técnico deste projeto é independente. Este arquivo foi criado em 2026-10-29 a partir da leitura do código; nada abaixo foi inventado, mas o que está marcado **(a confirmar)** ainda não foi verificado rodando o jogo.

## REGRA PERMANENTE DE DELEGAÇÃO (herdada da referência, vale aqui — NÃO perguntar de novo)
O trabalho é DIVIDIDO entre Claude e OpenCode para não estourar nenhuma cota (Claude: sessão 5 h/semana; OpenCode: mensal).
- **Claude Code (orquestrador, Sonnet):** entende o pedido, analisa, escreve spec curta em `TAREFA_atual.md`, revisa `git diff`, atualiza este arquivo.
- **Agentes Claude** (`.claude/agents/`): `analista` (sonnet, somente leitura, 1 sistema por vez) · `escritor` (haiku, só roda `opencode run --agent rapido` e devolve ≤5 linhas).
- **Agentes OpenCode** (`.opencode/agents/`): `rapido` (opencode-go/deepseek-v4.1-flash — código/mecânico) · `analista` (opencode-go/minimax-m3 — análise pesada, muito contexto) · `senior` (opencode-go/glm-5.3 — raro: correção falhou 2×/arquitetura).
- Escolha: análise leve → `analista` Claude; análise pesada (varrer `game.html` inteiro, vários arquivos) → `analista` OpenCode; código → `escritor` → `rapido`. Um agente por vez; Claude e OpenCode nunca editam os mesmos arquivos ao mesmo tempo. Agente falhou/indisponível → PARAR e avisar o usuário.
- Verificar evidência (diff, teste), nunca aceitar só "terminei".

## Estado atual
Jogo funcional em um único `game.html` (~700 linhas longas, ~109 KB): mapa por semente igual em todos os aparelhos, pathfinding em grade (`bfs`), lobby LAN/online/IP/solo, simulação no host (`// HOST: simulação`: zumbis `spawnZ`, loot, loja `openShop`, XP/skills, recarga ativa, boss `startBoss`/`bossAct`), UI/cliente (`onSnap`, controles `setCtl`, opções de câmera `setCam` e HUD `setHud`, joystick), desenho 2.5D, mini motor 3D low poly do boss e sons gerados no código. `server.js` é um relay WebSocket de salas (sem dependências, até 8 jogadores; host = quem cria a sala). Distribuição: Docker (`Dockerfile`), `.bat`/`servidor.ps1` (Windows) e APK Android via Capacitor (workflow `build-apk.yml`, manual). **Nenhuma tarefa em andamento.** O fluxo multiagente foi adaptado a este projeto; a delegação ainda não foi testada de ponta a ponta (ver "Delegação").

## Último marco concluído
Commit `16d3233` (2026-10-12): opções de ajuste de HUD e câmera. Antes: `f7a671a` novas formas de andar (controles); `e874114` workflow do APK. (Fonte: `git log`.)

## Próximo passo
**Ao ler este arquivo, diga em 1 linha que entendeu o projeto e PERGUNTE ao usuário: "Qual é a primeira tarefa do jogo?"** (ele ainda não definiu; análise do jogo já feita, ver "Entendimento do jogo"). Não reanalise o jogo. Ao receber a tarefa: (1) `analista` localiza as funções afetadas em `game.html` por grep (nunca ler o arquivo inteiro); (2) escrever spec em `TAREFA_atual.md`; (3) commit antes de delegar (os arquivos de metodologia ainda estão não rastreados; commitá-los junto); (4) `escritor`; (5) revisar o diff e testar no navegador com o método descrito em "Como testar sem humano".

## Pendências em ordem
1. `.claude/settings.json` ainda traz regras do Metroid (`sm_*.py`, `*.sfc`, `viewer_ok_*`; inofensivas); a edição foi bloqueada pelo classificador. Se o usuário quiser limpar, que edite ou autorize.
2. Confirmar como rodar/testar localmente (`node server.js`, porta 4040 por padrão; Docker usa 8080) e abrir `game.html` em modo solo.
3. `.githubtest.yml` (duplicata do `build-apk.yml`) foi removido pelo usuário em 2026-10-29; a remoção ainda não foi commitada.
4. Pasta `mnt/user-data/outputs/Horda/apk/package.json` está versionada; propósito **(a confirmar)**.
5. `RETOMADA.md`, `TAREFA_atual.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.opencode/`, `opencode.json` estão **não rastreados** no git.

## Decisões já tomadas (não reabrir)
- O jogo é infinito, sem condição de vitória; não criar "fim"/"vitória" sem pedido do usuário.
- Metodologia multiagente = a da referência (formato fixo abaixo); só o conteúdo é novo.
- `game.html` é arquivo único de propósito (o `server.js` e o APK o servem/copiam por nome: `cp game.html apk/www/index.html`). Não dividir em módulos sem decisão do usuário.
- Host-autoritativo: simulação roda no host, clientes recebem snapshots (`onSnap`); relay não interpreta o jogo.
- Sem dependências no servidor (só Node 18+); mapa determinístico por semente.
- Os `viewer_ok_*`, ROM e scripts `sm_*` pertencem ao projeto Metroid e **não existem aqui**.
- Não criar agentes duplicados; os existentes foram só adaptados (texto de domínio), modelos mantidos.

## Arquivos que importam
- `game.html` — todo o jogo (seções: mapa, caminhos, rede, HOST, UI/cliente, desenho 2.5D, boss 3D, sons). Buscar com `grep -n 'function nome' game.html`.
- `server.js` — relay de salas/WebSocket (`/rooms`, `/info`).
- `Dockerfile`, `Iniciar.bat`, `LiberarPorta.bat`, `servidor.ps1` — execução/hospedagem.
- `build-apk.yml`, `capacitor.config.json`, `package.json` — APK.
- `AGENTS.md`, `CLAUDE.md`, `opencode.json`, `.claude/`, `.opencode/` — arquitetura multiagente.
- `TAREFA_atual.md` — spec da tarefa em curso. `saidas/` — logs de agentes (não versionar).

## Como testar (comandos)
- Servidor: `node server.js` (PORT padrão 4040) → abrir `http://localhost:4040`. **(a confirmar rodando)**
- Solo: abrir `game.html` no navegador e usar o botão solo (função `solo()`).
- Sintaxe rápida do script: extrair o `<script>` e `node --check` **(a confirmar)**.

## Delegação em andamento
Nenhuma. Teste de fumaça do `escritor` → OpenCode: ver resultado registrado abaixo.
- Smoke test (2026-10-29) PASSOU: `escritor`(Haiku) → `opencode run --agent rapido` gerou `saidas/smoke.txt`=126, conferido por mim com `grep -o function game.html | wc -l`=126; `git diff` vazio. Não testado: edição real de código, `analista` OpenCode, `senior`.

## Entendimento do jogo (análise por execução real, 2026-10-29; prints no scratchpad, não versionados)
- **Visão:** canvas 2D, câmera fixa que segue o jogador, mundo 4000×6000 sem rotação (x,y do mundo = tela). Projeção oblíqua "2.5D": personagens são sprites em pé (altura subtraída de y), casas são caixas com telhado + fachada sul, ordenação por y (árvores/prédios cobrem o jogador). Não é isométrica verdadeira (sem rotação de 45°).
- **Mapa:** gerado por semente (`genMap`, `sd`), igual em todos os aparelhos: quarteirões de 500 px, rio no meio (y 2700–3300) com 2 pontes (x 1000 e 3000), prédios por tipo (h hospital = curas, p delegacia = armas, m mercado, casas). Minimapa com rótulos HOSPITAL/POLÍCIA/MERCADO.
- **Jogador:** HP 100 (+8/nível), XP, 6 slots de arma (Pistola, Escopeta, Rifle, Metralhadora, Lança-chamas, Sniper), recarga ativa (R), dinheiro ($), soltar item arrastando o slot. Controles: WASD/setas, clique/toque no chão = mover, no zumbi = atacar, 1–6 troca slot, X cancela, joystick no celular. Mira e tiro automáticos.
- **Inimigos:** 3 tipos + boss (Kraid): k0 comum, k1 rápido, k2 tanque (a partir da dificuldade 3); dificuldade = 1 + minutos jogados. Boss vem da borda do mapa (mini motor 3D low poly), larga 6 moedas de $80; depois dele a loja abre por 1 min.
- **Meta:** o jogo é INFINITO (confirmado pelo usuário): não há vitória nem fase final; objetivo = durar o máximo possível. Dificuldade sobe por minuto; boss e loja se repetem. A única tela de fim é a derrota: quando todos morrem (`game.html:253`) aparece "FIM DE JOGO — Vocês sobreviveram <tempo>" (NOVA PARTIDA só para o host). Desfibrilador revive aliado; casas destruídas reaparecem (`DEADL`). Multiplayer até 8 (LAN/online/IP).
- **Observado rodando:** menu animado (cidade + boss + 4 heróis); HUD (nível, tempo, "Zumbis N", HP/XP, placar "Abates"); loot ($ e curativo); texto flutuante "+PRECISÃO +VIDA MÁX +AGILIDADE" ao subir de nível; "LOJA ABERTA — 1 MINUTO" com seta LOJA; seta rosa para o boss; painel ⚙ Opções (controle, câmera, HUD, efeitos).
- **Como testar sem humano:** `node server.js` + Firefox headless via geckodriver (WebDriver em Python) + `solo()`. Globais `let` (`snap`, `PL`, `Z`, `id`) só são lidos por script injetado no `<head>`. geckodriver admite 1 sessão por vez: sempre fechar.
- **Anomalias vistas (a confirmar, não corrigidas):** (1) personagem travou numa caixa ao andar reto; (2) painel ⚙ Opções em 1280×634 com sliders/rótulos desalinhados; (3) na borda norte as árvores cobrem o jogador por completo, sem silhueta.
- **Não verificado:** o pop-up de escolha de skill (`p.o`), multiplayer real, loja com compra, morte/fim de jogo na tela, versão mobile/APK.

## Formato fixo deste arquivo
Estado atual · Último marco · Próximo passo · Pendências · Decisões · Arquivos que importam · Como testar · Delegação em andamento. Atualizar ANTES de avisar "contexto grande, abra novo prompt e envie: leia RETOMADA.md".

## Registro
- 2026-10-29 (fim da sessão 1): análise do jogo por execução real concluída; usuário confirmou que o jogo é infinito; nenhuma tarefa de jogo definida; nada commitado. Arquitetura multiagente replicada da referência; `RETOMADA.md`/`TAREFA_atual.md`/`CLAUDE.md`/`AGENTS.md`/agentes Claude adaptados ao jogo. Histórico do Metroid permanece só na referência.
