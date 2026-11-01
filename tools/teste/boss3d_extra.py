"""Boss 3D: ?gl=1&c2d=0, oclusao por predio e fallback glKill."""
import os, sys, time, subprocess
ROOT = '/home/trinca/Projetos/Zumbizes-survivor'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'teste'))
from lib import Teste

OUT = '/tmp/opencode/boss3d'
PORT = 4997
os.makedirs(OUT, exist_ok=True)

SETUP = r"""
window.__prof=1;window.__bs=0;window.__em=0;window.__lock=1;
window.bossAct=function(z,dt,all){z.bs=window.__bs;z.em=window.__em;z.stun=window.__bs==5?1:0;z.arm=0;return 1};
window.__frz=setInterval(function(){try{Object.values(PL).forEach(function(p){p.dead=0;p.hp=p.mx});
 var b=Z.filter(function(z){return z.k==3});
 if(!b.length){spawnZ(3,PL[id].x,PL[id].y);b=Z.filter(function(z){return z.k==3})}
 b.forEach(function(z){z.hp=z.mx;z.x=window.__bx==null?PL[id].x+150:window.__bx;
  z.y=window.__by==null?PL[id].y+40:window.__by;z.fa=-1.5708})}catch(e){window.__se=String(e)}},120);
1
"""

def main():
    srv = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=dict(os.environ, PORT=str(PORT)),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    time.sleep(1.0)
    try:
        with Teste('http://127.0.0.1:%d/?gl=1&c2d=0' % PORT, display=128) as t:
            t.solo(); t.espera(2.5)
            t.ev(SETUP); t.espera(1.5)
            t.ev('window.__bs=6;window.__em=0.5'); t.espera(0.6)
            t.shot(OUT + '/c2d0_bs6.png')
            t.ev('window.__bs=5;window.__em=0'); t.espera(0.6)
            t.shot(OUT + '/c2d0_bs5.png')
            print('c2d0 errs', t.erros(), 'vis', t.ev('(function(){var n=0;BGR.msh.forEach(function(m){if(m&&m.visible)n++});return n})()'))
            # oclusao: boss dentro do hospital (telhado visivel -> deve ficar escondido)
            t.ev("(function(){var b=BLD.filter(function(q){return q.T=='h'})[0];window.__bx=b.x+b.w/2;window.__by=b.y+b.h/2;"
                 "PL[id].x=b.dx+28;PL[id].y=b.y+b.h+120;return [b.x|0,b.y|0]})()")
            t.espera(1.2)
            t.shot(OUT + '/ocluido.png')
            print('ocluido errs', t.erros())
            # desocluido: boss na frente do predio
            t.ev('window.__by=PL[id].y+40;window.__bx=PL[id].x+150'); t.espera(0.8)
            t.shot(OUT + '/desocluido.png')
            # fallback glKill -> boss 2D
            t.ev('window.__lock=0;glKill()'); t.espera(1.2)
            t.shot(OUT + '/glkill.png')
            print('kill errs', t.erros(), 'glLive', t.ev('glLive'))
    finally:
        try: os.killpg(srv.pid, 9)
        except Exception: pass

main()
