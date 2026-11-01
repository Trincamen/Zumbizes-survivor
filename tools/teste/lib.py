"""Harness de teste do jogo: Google Chrome (instalado no PC) em modo headless via DevTools Protocol, SEM janela.
Sem selenium/chromedriver: Python puro (socket + WebSocket minimo).
Uso minimo:
    import sys; sys.path.insert(0,'/home/trinca/Projetos/Zumbizes-survivor/tools/teste')
    from lib import Teste
    with Teste('http://127.0.0.1:4997/?gl=1') as t:   # sobe o Chrome e abre a URL
        t.solo()                      # inicia partida solo com seed fixa
        t.espera(3)
        print(t.ev('AU.mv'))          # avalia JS no escopo GLOBAL do jogo (enxerga let/const: snap, AU, MUS, PL, id, Z...)
        t.shot('/tmp/x.png')
Servidor do jogo: `cd /home/trinca/Projetos/Zumbizes-survivor && PORT=4997 node server.js &`  (serve game.html e /music/)
Ou abra um .html local: Teste('/caminho/game.html') (vira file://).
Sempre MUDO (--mute-audio). Injetado em toda pagina: window.__err (erros JS), window.__log (console), window.__e(codigo).
Env CHROME_GL=gpu usa a GPU real em vez de SwiftShader (padrao: swiftshader, previsivel); o parametro `display` e ignorado (compat)."""
import json, subprocess, time, urllib.request, os, base64, socket, struct, tempfile, shutil, signal
CHROME = os.environ.get('CHROME_BIN', '/usr/bin/google-chrome')
INJ = """
window.__err=[];window.__log=[];['log','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){try{window.__log.push(k+': '+Array.prototype.join.call(arguments,' '))}catch(e){}return o.apply(console,arguments)}});
window.addEventListener('error',function(e){window.__err.push('ERR '+e.message+' '+e.filename+':'+e.lineno)});
window.addEventListener('unhandledrejection',function(e){window.__err.push('REJ '+e.reason)});
window.__e=function(s){try{var v=(0,eval)(s);return JSON.stringify(v===undefined?null:v)}catch(e){return JSON.stringify({EXC:String(e)})}};
"""
SEEDSOLO = "(function(){var r=Math.random;Math.random=function(){return 0.3141592};try{solo()}finally{Math.random=r}})();"

class _WS:
    """Cliente WebSocket minimo (texto, mascarado, com fragmentacao)."""
    def __init__(self, url):
        host, rest = url[5:].split('/', 1); h, p = host.split(':')
        self.s = socket.create_connection((h, int(p)), timeout=180)
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall(('GET /%s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n' % (rest, host, key)).encode())
        buf = b''
        while b'\r\n\r\n' not in buf: buf += self.s.recv(4096)
        self.buf = buf.split(b'\r\n\r\n', 1)[1]
    def _need(self, n):
        while len(self.buf) < n:
            c = self.s.recv(1 << 20)
            if not c: raise EOFError('ws fechado')
            self.buf += c
        d, self.buf = self.buf[:n], self.buf[n:]; return d
    def send(self, txt):
        d = txt.encode(); n = len(d); m = os.urandom(4)
        h = b'\x81' + (bytes([0x80 | n]) if n < 126 else b'\xfe' + struct.pack('>H', n) if n < 65536 else b'\xff' + struct.pack('>Q', n))
        self.s.sendall(h + m + bytes(b ^ m[i & 3] for i, b in enumerate(d)))
    def recv(self):
        out = b''
        while True:
            b0, b1 = self._need(2); n = b1 & 0x7f
            if n == 126: n = struct.unpack('>H', self._need(2))[0]
            elif n == 127: n = struct.unpack('>Q', self._need(8))[0]
            d = self._need(n); op = b0 & 15
            if op == 8: raise EOFError('ws close')
            if op in (1, 0, 2): out += d
            if b0 & 0x80 and op in (1, 0, 2): return out.decode()

class Teste:
    def __init__(self, url, display=None, porta=51000, w=1500, h=950, injetar=None):
        self.w = w; self.h = h; self.porta = porta + (display or 0) % 500 + (os.getpid() % 400)
        self.url = url if url.startswith('http') else 'file://' + url.replace('file://', '')
        self.proc = None; self.ws = None; self.n = 0; self.prof = None

    def __enter__(self):
        self.prof = tempfile.mkdtemp(prefix='chr_teste_')
        gl = ['--use-gl=angle', '--use-angle=gl'] if os.environ.get('CHROME_GL') == 'gpu' else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
        self.proc = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%d' % self.porta, '--user-data-dir=' + self.prof,
            '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--no-default-browser-check',
            '--window-size=%d,%d' % (self.w, self.h), '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows', '--allow-file-access-from-files'] + gl + ['about:blank'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        ws = None
        for _ in range(60):
            try:
                lst = json.loads(urllib.request.urlopen('http://127.0.0.1:%d/json/list' % self.porta, timeout=2).read())
                pg = [x for x in lst if x.get('type') == 'page']
                if pg: ws = pg[0]['webSocketDebuggerUrl']; break
            except Exception: pass
            time.sleep(0.5)
        if not ws: raise RuntimeError('Chrome nao subiu')
        self.ws = _WS(ws)
        self.cmd('Page.enable'); self.cmd('Runtime.enable')
        self.cmd('Emulation.setDeviceMetricsOverride', width=self.w, height=self.h, deviceScaleFactor=1, mobile=False)
        self.cmd('Page.addScriptToEvaluateOnNewDocument', source=INJ)
        self.ir(self.url); time.sleep(1.5)
        return self

    def __exit__(self, *a):
        try: self.cmd('Browser.close')
        except Exception: pass
        try: os.killpg(self.proc.pid, signal.SIGKILL)
        except Exception: pass
        if self.prof: shutil.rmtree(self.prof, ignore_errors=True)

    def cmd(self, metodo, **params):
        self.n += 1; i = self.n
        self.ws.send(json.dumps({'id': i, 'method': metodo, 'params': params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get('id') == i:
                if 'error' in m: raise Exception('%s: %s' % (metodo, m['error']))
                return m['result']

    def ir(self, u):
        self.cmd('Page.navigate', url=u)
        for _ in range(240):
            if self.cmd('Runtime.evaluate', expression='document.readyState', returnByValue=True)['result'].get('value') == 'complete': break
            time.sleep(0.25)

    def exec(self, js, *args):
        """Roda o corpo de uma funcao (com `return`) na pagina; args via arguments[]."""
        r = self.cmd('Runtime.evaluate', expression='(function(){%s}).apply(null,%s)' % (js, json.dumps(list(args))), returnByValue=True, awaitPromise=True)
        if 'exceptionDetails' in r: raise Exception(r['exceptionDetails'].get('exception', {}).get('description') or str(r['exceptionDetails']))
        return r['result'].get('value')

    def ev(self, codigo):
        """Avalia JS no escopo global da pagina (inclui let/const do jogo). Devolve o valor ja convertido de JSON."""
        v = json.loads(self.exec("return window.__e(arguments[0])", codigo))
        if isinstance(v, dict) and 'EXC' in v: raise Exception(v['EXC'])
        return v

    def solo(self): return self.ev(SEEDSOLO)
    def espera(self, s): time.sleep(s)
    def erros(self): return self.ev('window.__err')
    def shot(self, caminho):
        r = self.cmd('Page.captureScreenshot', format='png')
        open(caminho, 'wb').write(base64.b64decode(r['data'])); return caminho
    def amostrar(self, expr, dur, passo=0.25):
        """Amostra uma expressao JS a cada `passo` s durante `dur` s. Devolve [(t, valor)]."""
        t0 = time.time(); out = []
        while time.time() - t0 < dur:
            out.append((round(time.time() - t0, 3), self.ev(expr))); time.sleep(passo)
        return out
