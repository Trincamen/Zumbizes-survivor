"""Mede a altura aparente do boss em px de TELA: 2D (via FS do drawBoss) e 3D (via matrizes das malhas)."""
import os, sys, time, subprocess
ROOT = '/home/trinca/Projetos/Zumbizes-survivor'
sys.path.insert(0, os.path.join(ROOT, 'tools', 'teste'))
from lib import Teste

PORT = 4997
SETUP = r"""
window.__prof=1;window.__bs=0;window.__em=0;
window.bossAct=function(z,dt,all){z.bs=window.__bs;z.em=window.__em;z.stun=0;z.arm=0;return 1};
window.__frz=setInterval(function(){try{Object.values(PL).forEach(function(p){p.dead=0;p.hp=p.mx});
 var b=Z.filter(function(z){return z.k==3});
 if(!b.length){spawnZ(3,PL[id].x,PL[id].y);b=Z.filter(function(z){return z.k==3})}
 b.forEach(function(z){z.hp=z.mx;z.x=PL[id].x+150;z.y=PL[id].y+40;z.fa=-1.5708})}catch(e){window.__se=String(e)}},120);
window.__m2d=function(){var z=Z.filter(function(z){return z.k==3})[0];if(!z)return null;
 var a=1e9,b=-1e9,x0=1e9,x1=-1e9;
 for(var i=0;i<FS.length;i++)for(var j=0;j<FS[i].P.length;j++){var p=FS[i].P[j];
  var sy=z.y-(p[1]-p[2]*K2)*0.88;if(sy<a)a=sy;if(sy>b)b=sy;
  var sx=z.x+p[0]*0.88;if(sx<x0)x0=sx;if(sx>x1)x1=sx}
 return {h:+(b-a).toFixed(1),hz:+((b-a)*ZO).toFixed(1),w:+(x1-x0).toFixed(1),top:+(a).toFixed(1),bot:+(b).toFixed(1),faces:FS.length}};
window.__m3d=function(){if(!BGR)return null;var a=1e9,b=-1e9,x0=1e9,x1=-1e9;
 for(var ni=0;ni<BGR.msh.length;ni++){var m=BGR.msh[ni];if(!m||!m.visible)continue;m.updateMatrixWorld();
  var g=m.geometry.attributes.position.array;
  for(var i=0;i<g.length;i+=3){var v=new THREE.Vector3(g[i],g[i+1],g[i+2]).applyMatrix4(m.matrixWorld).project(GLCAM);
   var sy=(0.5-v.y*0.5)*innerHeight, sx=(v.x*0.5+0.5)*innerWidth;
   if(sy<a)a=sy;if(sy>b)b=sy;if(sx<x0)x0=sx;if(sx>x1)x1=sx}}
 return {h:+(b-a).toFixed(1),w:+(x1-x0).toFixed(1),top:+(a).toFixed(1),bot:+(b).toFixed(1)}};
1
"""

def run(url, tag, fn):
    srv = subprocess.Popen(['node', 'server.js'], cwd=ROOT, env=dict(os.environ, PORT=str(PORT)),
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    time.sleep(1.0)
    try:
        with Teste(url, display=126) as t:
            t.solo(); t.espera(2.5)
            t.ev(SETUP); t.espera(2)
            print(tag,'ZO',t.ev('ZO'),'W',t.ev('W'),'H',t.ev('H'),'oy',t.ev('oy'))
            print(tag, 'bs0', t.ev(fn))
            for bs in (3, 4, 5):
                t.ev('window.__bs=%d' % bs); t.espera(0.6)
                print(tag, 'bs%d' % bs, t.ev(fn))
            print(tag, 'errs', t.erros())
    finally:
        try: os.killpg(srv.pid, 9)
        except Exception: pass

run('http://127.0.0.1:%d/?gl=1' % PORT, '3d', 'window.__m3d()')
run('http://127.0.0.1:%d/' % PORT, '2d', 'window.__m2d()')
