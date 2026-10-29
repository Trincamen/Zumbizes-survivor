# TAREFA_atual.md — Limpar HUD inicial (tirar LAN / rede local)

> Agente: OpenCode `rapido` (via `escritor`). Se falhar, parar e escrever bloqueio em `saidas/relatorio.txt` (≤15 linhas).

## Objetivo
No menu inicial, remover tudo que fala de LAN / rede local: a caixa do topo mostra só "🌐 Online: N sala(s)" (sem "LAN: N servidor(es)"), e o multiplayer passa a ter só a aba Online.

## Arquivos
- PODE editar: `game.html` (só menu/lobby: linhas ~43-56 HTML, `rl()` ~137-141, `tabSel` 136, `show` 135, var `tab` 77).
- NÃO tocar: `server.js`, workflows, `package*.json`.

## Passos
A. `rl()` (linha ~141): `$('net').innerHTML` passa a ser só `'🌐 Online: <b>'+onRooms.length+'</b> sala(s)'`.
B. Linha 46: subtítulo do botão MULTIPLAYER `Rede local e online` → `Jogue online com amigos`.
C. Linhas 50-52: remover o botão `🏠 REDE LOCAL (LAN)` e o `<div id=tab-lan>` inteiro (lista, PROCURAR, IP manual, ENTRAR). Manter só a aba ONLINE (pode remover a barra de abas ou deixar só o botão ONLINE).
D. JS: `tab` inicial = `'on'` (linha 77); `tabSel`/`rl` não podem referenciar `$('tab-lan')`/`$('lanL')` removidos (null → erro). Remova essas referências. Pode deixar `scanLAN`/`joinIP` como código morto SE nada o chamar nem referenciar ids removidos; senão apague a função.
E. Linha 55 (Configurações): trocar "(ex.: no app ou na rede local)" por "(ex.: no app)".

## Critério de pronto
1. Menu sem texto "LAN", "rede local" ou "servidor(es)"; `grep -n -i -E 'rede local|LAN:|REDE LOCAL' game.html` só pode achar código morto/comentário, nunca texto visível.
2. Botão MULTIPLAYER abre tela só com Online (lista de salas, ATUALIZAR, VOLTAR) sem erro de console.
3. `node --check` do script extraído de `game.html` sem erro; `git status` só mostra `game.html`.
