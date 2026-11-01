"""Boss 3D: prints GL x 2D lado a lado, sequencia de emergencia e custo de glBossPush."""
import os, sys, time, subprocess
ROOT = '/home/trinca/Projetos/Zumbizes-survivor'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'teste'))
from lib import Teste
from PIL import Image

OUT = '/tmp/opencode/boss3d'
PORT = 4997
os.makedirs(OUT, exist_ok=True)

SETUP = r"""
window.__prof=1;window.__bs=0;window.__em=0;
window.bossAct=function(z,dt,all){z.bs=window.__bs;z.em=window.__em;z.stun=window.__bs==5?1:0;
 z.arm=(window.__bs==1||window.__bs==2)?1:0;return 1};
window.__frz=setInterval(function(){try{Object.values(PL).forEach(function(p){p.dead=0;p.hp=p.mx});
 var b=Z.filter(function(z){return z.k==3});
 if(!b.length){spawnZ(3,PL[id].x,PL[id].y);b=Z.filter(function(z){return z.k==3})}
 b.forEach(function(z){z.hp=z.mx;z.x=PL[id].x+150;z.y=PL[id].y+40;z.fa=-1.5708})}catch(e){window.__se=String(e)}},120);
1
"""


def run(tag, url):
    srv = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=dict(os.environ, PORT=str(PORT)),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    time.sleep(1.0)
    try:
        with Teste(url, display=127) as t:
            t.solo(); t.espera(2.5)
            t.ev(SETUP); t.espera(1.5)
            for bs, em in ((0, 0), (3, 0), (4, 0), (5, 0), (6, 0.65), (6, 0.15)):
                t.ev('window.__bs=%d;window.__em=%.2f' % (bs, em)); t.espera(0.7)
                t.shot('%s/v_%s_%d_%d.png' % (OUT, tag, bs, em * 100))
            if tag == 'gl':
                print('custo', t.ev("""(function(){var t0=performance.now();
                  for(var i=0;i<3000;i++)glBossPush(PL[id].x,PL[id].y,-1.57,(i%7),0,performance.now(),snap,0);
                  return +((performance.now()-t0)/3000).toFixed(4)})()"""), 'ms/chamada')
                print('info', t.ev('window.__glb()'))
            print(tag, 'errs', t.erros())
    finally:
        try: os.killpg(srv.pid, 9)
        except Exception: pass


run('gl', 'http://127.0.0.1:%d/?gl=1' % PORT)
run('2d', 'http://127.0.0.1:%d/' % PORT)

for bs, em in ((0, 0), (3, 0), (4, 0), (5, 0), (6, 65), (6, 15)):
    a = Image.open('%s/v_gl_%d_%d.png' % (OUT, bs, em)).crop((560, 200, 1060, 720))
    b = Image.open('%s/v_2d_%d_%d.png' % (OUT, bs, em)).crop((560, 200, 1060, 720))
    s = Image.new('RGB', (1000, 520)); s.paste(a, (0, 0)); s.paste(b, (500, 0))
    s.save('%s/p_%d_%d.png' % (OUT, bs, em))
print('pares ok')
