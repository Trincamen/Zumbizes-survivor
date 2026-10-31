# tools/teste — testes automáticos do jogo sem abrir janela

`lib.py` sobe Xvfb (tela virtual) + geckodriver + Firefox mudo, abre o jogo e deixa você avaliar JS e tirar prints.
Exemplo mínimo e regras em `lib.py`. Pontos importantes:
- Sem `ffmpeg`/`numpy`: tudo por Python puro + o próprio Firefox (WebAudio, canvas).
- Display e porta: use um `display` único por teste simultâneo (120, 121...).
- `t.ev('expr')` enxerga `let/const` globais do jogo (`snap`, `AU`, `MUS`, `PL`, `id`, `Z`, `GLR`, `glLive`...).
- Para medir só números (tempos, contagens, estados) não precisa olhar print; use `t.amostrar(...)`.
- Medições de FPS/ms no Xvfb são por software: só valem como proporção; desempenho real é no PC do usuário.
- `pkill` pode ser negado pelo snap: o `__exit__` já encerra o que o harness criou.
