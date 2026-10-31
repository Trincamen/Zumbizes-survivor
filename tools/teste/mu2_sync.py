"""MU2b — mede a sincronia musica do boss x chegada do boss (drop).

Uso:
    python3 tools/teste/mu2_sync.py                 # 5 repeticoes, BM_AHEAD padrao, veredito
    python3 tools/teste/mu2_sync.py --runs 3 --ahead 0.15
    python3 tools/teste/mu2_sync.py --sweep 2       # varre ?bmahead=0,05/0,10/0,15/0,20 (2 repeticoes cada)

Sobe `PORT=4997 node server.js` em background e encerra SO o PID que ele criou.
Metricas por repeticao (todas medidas dentro da pagina, por performance.now()):
  pos_ev7-BM_DROP  = BA.currentTime no instante do evento 7 (chegada do boss) - 11.1739
  drop-ev7 (ms)    = instante do tremor disparado pelo audio - instante do evento 7
  nascimento (s)   = tempo entre startBoss() e o boss aparecer em snap.Z
Meta: |pos| <= 0.08 s em 5/5 e |drop-ev7| <= 100 ms em 5/5.
"""
import sys, os, json, time, socket, subprocess, argparse
ROOT = '/home/trinca/Projetos/Zumbizes-survivor'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'teste'))
from lib import Teste

BM_DROP = 11.1739
PORT = 4997
DISPLAY = 121
META_POS = 0.08
META_DROP = 0.100

# registrador in-page: marca t0, o nascimento (rAF), e le os instantes gravados pelo jogo (exatos)
REC_START = r"""(function(){
 window.__mu2={t0:performance.now(),spawn:0,ev7:0,drop:0,pos:null,corr:[],st:'',fail:0};
 BM.ev7Perf=0;BM.dropPerf=0;BM.posEv7=-1;BM.correcoes.length=0;
 startBoss();
 (function loop(){
  var b=window.__mu2;
  if(!b.spawn&&typeof snap!=='undefined'&&snap&&snap.Z&&snap.Z.some(function(z){return z[2]==3}))b.spawn=performance.now();
  if(!b.ev7&&BM.ev7Perf)b.ev7=BM.ev7Perf;
  if(!b.drop&&BM.dropPerf)b.drop=BM.dropPerf;
  b.pos=BM.posEv7;b.corr=BM.correcoes.slice();b.st=BM.st;b.fail=BM.fail;b.vi=BM.vies;
  if(!b.ev7)requestAnimationFrame(loop);
 })();
 return 1})()"""

REC_RESET = r"""(function(){
 Z.forEach(function(z){if(z.k==3)z.hp=0});
 Object.values(PL).forEach(function(p){p.hp=p.mx;p.dead=0});
 if(ph!=1)ph=1;   // o jogador pode ter morrido durante as repeticoes: revive e volta a partida
 return 1})()"""

# so depois que o boss sumiu do snap (senao o bmFrame reentra no loop com o snapshot velho)
REC_IDLE = r"""(function(){
 bmHalt();BM.st='bi';BM.played=0;BM.dropDone=0;BM.seen=0;
 musDuckPlaylist(1,300);return BM.st})()"""


def espera_porta(p, timeout=15):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            with socket.create_connection(('127.0.0.1', p), .3):
                return True
        except OSError:
            time.sleep(.1)
    return False


def medir(url, runs, rotulo):
    out = []
    with Teste(url, display=DISPLAY) as t:
        t.solo()
        # espera entrar em partida (snap.ph==1) e o audio do boss ter metadados
        for _ in range(100):
            if t.ev('(typeof snap!=="undefined"&&snap&&snap.ph==1)?1:0'):
                break
            time.sleep(.2)
        t.espera(1.5)
        for i in range(runs):
            # garante estado limpo antes de cada repeticao: mata o boss, espera sumir do snap e zera a maquina
            t.ev(REC_RESET)
            for _ in range(60):
                if t.ev('(!snap.bp&&!snap.Z.some(function(z){return z[2]==3}))?1:0'):
                    break
                time.sleep(.1)
            t.ev(REC_IDLE)
            t.espera(.4)
            st = t.ev('BM.st')
            if st != 'bi':
                t.ev(REC_IDLE)
                t.espera(.4)
                st = t.ev('BM.st')
            if st != 'bi':
                print('  rep %d: estado do boss nao voltou a bi (%s) — repeticao ignorada' % (i + 1, st), flush=True)
                continue
            t.ev(REC_START)
            t0 = time.time()
            while time.time() - t0 < 25:
                if t.ev('window.__mu2.ev7?1:0'):
                    break
                time.sleep(.12)
            d = t.ev('window.__mu2')
            out.append(dict(rotulo=rotulo, i=i + 1,
                            pos=(d['pos'] - BM_DROP) if d['pos'] is not None and d['pos'] >= 0 else None,
                            drop_ms=((d['drop'] - d['ev7']) if d['drop'] and d['ev7'] else None),
                            spawn=(d['spawn'] - d['t0']) / 1000 if d['spawn'] else None,
                            corr=d['corr'], fail=d['fail'], vi=d.get('vi')))
            print('  rep %d: pos=%s drop=%s nasc=%s corr=%s fail=%s' % (
                i + 1,
                'None' if out[-1]['pos'] is None else '%+.3f' % out[-1]['pos'],
                'None' if out[-1]['drop_ms'] is None else '%+.0f ms' % out[-1]['drop_ms'],
                'None' if out[-1]['spawn'] is None else '%.3f s' % out[-1]['spawn'],
                [(c['r'], c['d'], c['vies']) for c in out[-1]['corr']], out[-1]['fail']), flush=True)
        errs = t.erros()
        if errs:
            print('  ERROS JS:', errs[:5])
    return out


def tabela(rows, titulo):
    print('\n== %s ==' % titulo)
    print(' rep | pos_ev7-BM_DROP (s) | drop-ev7 (ms) | nascimento (s)')
    for r in rows:
        print('  %d  | %s | %s | %s' % (
            r['i'],
            '   None' if r['pos'] is None else '%+8.3f' % r['pos'],
            '  None' if r['drop_ms'] is None else '%+8.0f' % r['drop_ms'],
            '  None' if r['spawn'] is None else '%8.3f' % r['spawn']))
    ps = [abs(r['pos']) for r in rows if r['pos'] is not None]
    ds = [abs(r['drop_ms']) / 1000 for r in rows if r['drop_ms'] is not None]
    ss = [r['spawn'] for r in rows if r['spawn'] is not None]
    if ps:
        print('  media |pos| = %.3f s  (max %.3f)   |  media |drop-ev7| = %.0f ms  (max %.0f)' % (
            sum(ps) / len(ps), max(ps), 1000 * sum(ds) / len(ds), 1000 * max(ds)))
    if ss:
        print('  nascimento: media %.3f s  (min %.3f, max %.3f)' % (
            sum(ss) / len(ss), min(ss), max(ss)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--runs', type=int, default=5)
    ap.add_argument('--ahead', type=float, default=None, help='?bmahead= (padrao do codigo se omitido)')
    ap.add_argument('--sweep', type=int, default=0, help='varre 0,05/0,10/0,15/0,20 com N repeticoes cada')
    a = ap.parse_args()
    srv = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=dict(os.environ, PORT=str(PORT)),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not espera_porta(PORT):
            print('FALHOU: servidor nao subiu na porta %d' % PORT)
            return 2
        base = 'http://127.0.0.1:%d/?gl=1' % PORT
        if a.sweep:
            print('== varredura de BM_AHEAD (%d repeticoes cada) ==' % a.sweep)
            for v in (0.05, 0.10, 0.15, 0.20):
                print(' BM_AHEAD=%.2f' % v, flush=True)
                rows = medir(base + '&bmahead=%.2f' % v, a.sweep, 'ahead=%.2f' % v)
                ps = [abs(r['pos']) for r in rows if r['pos'] is not None]
                ds = [abs(r['drop_ms']) for r in rows if r['drop_ms'] is not None]
                ok = ps and len(ps) == a.sweep and max(ps) <= META_POS and max(ds) <= META_DROP * 1000
                print('  -> |pos| media %.3f max %.3f | |drop-ev7| max %.0f ms | %s' % (
                    sum(ps) / len(ps) if ps else 9, max(ps) if ps else 9,
                    max(ds) if ds else 9, 'PASSOU' if ok else 'FALHOU'), flush=True)
            return 0
        url = base + ('' if a.ahead is None else '&bmahead=%.2f' % a.ahead)
        print('== MU2b: %d repeticoes em %s ==' % (a.runs, url), flush=True)
        rows = medir(url, a.runs, 'final')
        tabela(rows, 'medidas por repeticao')
        okpos = all(r['pos'] is not None and abs(r['pos']) <= META_POS for r in rows)
        okdrop = all(r['drop_ms'] is not None and abs(r['drop_ms']) <= META_DROP * 1000 for r in rows)
        ok = okpos and okdrop and len(rows) == a.runs
        print('\nVEREDITO: %s  (|pos|<=%.3f s %d/%d, |drop-ev7|<=%.0f ms %d/%d)' % (
            'PASSOU' if ok else 'FALHOU',
            META_POS, sum(1 for r in rows if r['pos'] is not None and abs(r['pos']) <= META_POS), a.runs,
            META_DROP * 1000, sum(1 for r in rows if r['drop_ms'] is not None and abs(r['drop_ms']) <= META_DROP * 1000), a.runs))
        return 0 if ok else 1
    finally:
        srv.terminate()
        try:
            srv.wait(10)
        except Exception:
            srv.kill()
        print('servidor (pid %d) encerrado' % srv.pid)


if __name__ == '__main__':
    sys.exit(main())
