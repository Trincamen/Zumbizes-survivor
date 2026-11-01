"""Boss 3D (89h-glboss.js): confere o modelo 3D nos estados bs 0..6, prints e custo.

Uso: python3 tools/teste/boss3d.py [--c2d 0|1]
Sobe `PORT=4997 node server.js` (só o próprio). Prints em /tmp/opencode/boss3d/.
"""
import os, sys, time, subprocess, argparse
ROOT = '/home/trinca/Projetos/Zumbizes-survivor'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'teste'))
from lib import Teste

OUT = '/tmp/opencode/boss3d'
os.makedirs(OUT, exist_ok=True)
PORT = 4997

SETUP = r"""
window.__pb=(function(){
 window.__prof=1;
 var orboss=window.bossAct;
 window.__bs=0;window.__em=0;
 window.bossAct=function(z,dt,all){z.bs=window.__bs;z.em=window.__em;z.stun=window.__bs==5?1:0;
  z.arm=(window.__bs==1||window.__bs==2)?1:0;return 1};
 window.__frz=setInterval(function(){try{Object.values(PL).forEach(function(p){p.dead=0;p.hp=p.mx});
  var b=Z.filter(function(z){return z.k==3});
  if(!b.length){spawnZ(3,PL[id].x,PL[id].y+120);Z[Z.length-1].em=0;b=Z.filter(function(z){return z.k==3})}
  b.forEach(function(z){z.hp=z.mx;z.x=PL[id].x;z.y=PL[id].y+120;z.fa=-1.5708});}catch(e){window.__spawnErr=String(e)}},120);
 return 1})();
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--c2d', default='1')
    a = ap.parse_args()
    url = 'http://127.0.0.1:%d/?gl=1&c2d=%s' % (PORT, a.c2d)
    srv = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=dict(os.environ, PORT=str(PORT)),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    time.sleep(1.0)
    try:
        with Teste(url, display=123) as t:
            t.solo()
            t.espera(2)
            print('glLive', t.ev('glLive'), 'errs', t.erros())
            t.ev(SETUP)
            t.espera(1.5)
            print('boss?', t.ev('Z.filter(function(z){return z.k==3}).length'))
            print('info', t.ev('window.__glb()'))
            for bs in range(7):
                t.ev('window.__bs=%d;window.__em=%.1f' % (bs, 1.3 if bs == 6 else 0))
                t.espera(0.9)
                t.shot('%s/bs%d.png' % (OUT, bs))
                print('bs', bs, 'vis', t.ev('(function(){var n=0;if(!BGR)return -1;BGR.msh.forEach(function(m){if(m&&m.visible)n++});return n})()'),
                      'errs', t.erros())
            t.espera(4)
            print('prof', t.ev('window.__plast&&window.__plast.o'))
            print('errs final', t.erros())
            print('log', t.ev('window.__log.slice(-8)'))
    finally:
        try:
            os.killpg(srv.pid, 9)
        except Exception:
            pass


if __name__ == '__main__':
    main()
