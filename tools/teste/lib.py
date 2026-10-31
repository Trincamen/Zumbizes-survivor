"""Harness de teste do jogo (Firefox + geckodriver em tela virtual Xvfb, SEM janela nos monitores).
Uso minimo:
    import sys; sys.path.insert(0,'/home/trinca/Projetos/Zumbizes-survivor/tools/teste')
    from lib import Teste
    with Teste('http://127.0.0.1:4997/?gl=1', display=120) as t:   # sobe Xvfb+geckodriver+Firefox, abre a URL
        t.solo()                      # inicia partida solo com seed fixa
        t.espera(3)
        print(t.ev('AU.mv'))          # avalia JS no escopo GLOBAL do jogo (enxerga let/const: snap, AU, MUS, PL, id, Z...)
        t.shot('/tmp/x.png')
Servidor do jogo: `cd /home/trinca/Projetos/Zumbizes-survivor && PORT=4997 node server.js &`  (serve game.html e /music/)
Ou abra um arquivo local: file:///caminho/game.html  (use cópia na HOME: o Firefox é snap).
Sempre MUDO (media.volume_scale=0). O objeto injetado: window.__err (erros JS), window.__log (console), window.__e(codigo)."""
import json, subprocess, time, urllib.request, urllib.error, os, base64, re
GECKO = '/snap/firefox/current/usr/lib/firefox/geckodriver'
FIREFOX = '/snap/firefox/current/usr/lib/firefox/firefox'
INJ = """<script>
window.__err=[];window.__log=[];['log','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){try{window.__log.push(k+': '+Array.prototype.join.call(arguments,' '))}catch(e){}return o.apply(console,arguments)}});
window.addEventListener('error',function(e){window.__err.push('ERR '+e.message+' '+e.filename+':'+e.lineno)});
window.addEventListener('unhandledrejection',function(e){window.__err.push('REJ '+e.reason)});
window.__e=function(s){try{var v=(0,eval)(s);return JSON.stringify(v===undefined?null:v)}catch(e){return JSON.stringify({EXC:String(e)})}};
</script>"""
SEEDSOLO = "(function(){var r=Math.random;Math.random=function(){return 0.3141592};try{solo()}finally{Math.random=r}})();"

def preparar(src_html, destino=None):
    """Copia um game.html injetando o ajudante antes de </body>. Devolve o caminho (na HOME, por causa do snap)."""
    s = open(src_html, encoding='utf-8').read(); i = s.rfind('</body>')
    destino = destino or os.path.expanduser('~/t_harness_%d.html' % os.getpid())
    open(destino, 'w', encoding='utf-8').write(s[:i] + INJ + s[i:])
    return destino

class Teste:
    def __init__(self, url, display=120, porta=51000, w=1500, h=950, injetar=None):
        """url http(s):// (o servidor do jogo ja tem de estar rodando) OU caminho de .html local (sera injetado)."""
        self.display = ':%d' % display; self.porta = porta + display; self.w = w; self.h = h
        self.url = url; self.xvfb = None; self.gd = None; self.sid = None
        if not url.startswith('http'):
            self.url = 'file://' + preparar(url.replace('file://', ''))
        self.http = url.startswith('http')

    def __enter__(self):
        self.xvfb = subprocess.Popen(['Xvfb', self.display, '-ac', '-screen', '0', '%dx%dx24' % (self.w, self.h)],
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1.5)
        env = dict(os.environ, DISPLAY=self.display, MOZ_ENABLE_WAYLAND='0'); env.pop('WAYLAND_DISPLAY', None)
        self.gd = subprocess.Popen([GECKO, '--port', str(self.porta)], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
        # WebGL no Xvfb so sobe (por software, llvmpipe) com webgl.force-enabled; sem isso ?gl=1 cai no 2D
        prefs = {'media.volume_scale': '0.0', 'media.autoplay.default': 0, 'media.autoplay.blocking_policy': 0, 'webgl.force-enabled': True, 'webgl.disabled': False}
        r = self._r('POST', '/session', {'capabilities': {'alwaysMatch': {'browserName': 'firefox',
            'moz:firefoxOptions': {'binary': FIREFOX, 'prefs': prefs}}}})
        self.sid = r['value']['sessionId']
        self._r('POST', '/session/%s/window/fullscreen' % self.sid); time.sleep(1)
        self.ir(self.url)
        if self.http: self._injetar_http()
        time.sleep(1.5)
        return self

    def __exit__(self, *a):
        try: self._r('DELETE', '/session/%s' % self.sid)
        except Exception: pass
        for p in (self.gd, self.xvfb):
            try: p.terminate(); p.wait(5)
            except Exception: pass

    def _r(self, m, path, body=None):
        d = json.dumps(body).encode() if body is not None else (b'{}' if m == 'POST' else None)
        rq = urllib.request.Request('http://127.0.0.1:%d%s' % (self.porta, path), data=d, method=m, headers={'Content-Type': 'application/json'})
        try: return json.loads(urllib.request.urlopen(rq, timeout=180).read())
        except urllib.error.HTTPError as e: return json.loads(e.read())

    def ir(self, u): return self._r('POST', '/session/%s/url' % self.sid, {'url': u})

    def _injetar_http(self):
        # em http o HTML vem do servidor: injeta o ajudante por script logo apos o carregamento (let/const globais ficam visiveis ao eval indireto)
        js = INJ.replace('<script>', '').replace('</script>', '')
        # execute/sync roda num sandbox do WebDriver; para o codigo viver no escopo REAL da pagina (e enxergar let/const do jogo) usa-se um <script>
        self.exec("var s=document.createElement('script');s.textContent=arguments[0];document.head.appendChild(s);", js)

    def exec(self, js, *args):
        r = self._r('POST', '/session/%s/execute/sync' % self.sid, {'script': js, 'args': list(args)})
        v = r['value']
        if isinstance(v, dict) and 'error' in v: raise Exception(v.get('message'))
        return v

    def ev(self, codigo):
        """Avalia JS no escopo global da pagina (inclui let/const do jogo). Devolve o valor ja convertido de JSON."""
        r = self.exec("return (window.wrappedJSObject||window).__e(arguments[0])", codigo)
        v = json.loads(r)
        if isinstance(v, dict) and 'EXC' in v: raise Exception(v['EXC'])
        return v

    def solo(self): return self.ev(SEEDSOLO)
    def espera(self, s): time.sleep(s)
    def erros(self): return self.ev('window.__err')
    def shot(self, caminho):
        r = self._r('GET', '/session/%s/screenshot' % self.sid)
        open(caminho, 'wb').write(base64.b64decode(r['value'])); return caminho
    def amostrar(self, expr, dur, passo=0.25):
        """Amostra uma expressao JS a cada `passo` s durante `dur` s. Devolve [(t, valor)]."""
        t0 = time.time(); out = []
        while time.time() - t0 < dur:
            out.append((round(time.time() - t0, 3), self.ev(expr))); time.sleep(passo)
        return out
