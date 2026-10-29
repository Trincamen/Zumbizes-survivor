# CLAUDE.md: Zombizes Survivor / Horda Cooperativa (jogo web co-op de zumbis)

## Contexto

- O usuário fala português (Brasil). Responda sempre em português.
- Projeto: jogo de horda de zumbis cooperativo para navegador/Android. `game.html`
  (GERADO a partir de `src/` por `node build.js`), `server.js` (relay WebSocket de salas), Capacitor para o APK.
- Metodologia multiagente herdada de `~/Projetos/spuermetroid navegador/`
  (somente referência de método; não copie dados, decisões ou tarefas dele).
- **Reaproveite o que existe. Não recrie nem renomeie nada sem perguntar.**
  - `AGENTS.md`, `opencode.json` e `.opencode/agents/` (analista, rapido, senior)
  - `.claude/agents/` (analista, escritor)
  - `RETOMADA.md` (estado) e `TAREFA_atual.md` (tarefa em andamento)
- A cota do Claude é limitada por sessão de 5 horas e por semana; o plano do
  OpenCode é mensal. **Economize contexto e tokens.**
- Divisão de trabalho:
  - **Claude:** orquestra, analisa e escreve especificações curtas.
  - **OpenCode:** escreve/edita código a partir das especificações e faz tarefas
    longas e repetitivas.

## Fluxo normal de trabalho

1. **Retomar:** leia `RETOMADA.md` e `TAREFA_atual.md`.
2. **Analisar:** subagente `analista`, um item por vez (grep em `src/js/`).
3. **Especificar:** atualize `TAREFA_atual.md` com objetivo, arquivos e critério
   de pronto, curto e sem ambiguidade.
4. **Delegar:** commit antes. Depois o subagente `escritor` roda o OpenCode.
5. **Revisar:** olhe só o `git diff` e teste no navegador quando fizer sentido.
   Se estiver certo, commit e atualize `RETOMADA.md`; se não, devolva correção curta.

## Regras para economizar cota

- **Código-fonte fica em `src/`** (`src/js/NN-secao.js`, `src/style.css`, `src/index.html`,
  `src/assets/*.glb`). Edite SEMPRE `src/`, depois rode `node build.js` e commite `src/` +
  `game.html` juntos (Docker e APK usam o `game.html` gerado). `node build.js --check` confere.
  Nunca edite `game.html` à mão. Nunca imprima `game.html` (linhas enormes, ~216 KB com o GLB
  em base64): use `grep -n 'function nome' src/js/*.js` e ranges curtos.
- Nunca traga a saída completa do OpenCode para o contexto.
- Ao fechar um assunto, atualize `RETOMADA.md` e sugira sessão nova.
- Use Sonnet por padrão. Opus só para problema realmente difícil, com permissão.
- Para saber quanto resta de cota, o usuário roda `/usage`.

## Regras gerais

- Pergunte quando houver dúvida real. Não adivinhe caminhos, nomes ou comandos.
- Nada destrutivo (`rm -rf`, `git reset --hard`) sem confirmação explícita.
- Não altere `server.js`, workflows (`build-apk.yml`, `.githubtest.yml`),
  `Dockerfile` nem `package*.json` sem estar na spec ou perguntar.
- Claude e OpenCode não editam os mesmos arquivos ao mesmo tempo: enquanto o
  OpenCode trabalha, você só lê.
- Nunca declare que algo funciona sem ter rodado o teste que prova.
- Explique o que está fazendo em poucas linhas.
