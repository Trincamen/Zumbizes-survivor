// ---------- rede ----------
function send(m){host?handle(m):netConn&&netConn.open&&netConn.send(m)}
const myName=()=>($('nm').value||'Jogador').slice(0,12),canHost=()=>!MOB&&(originKind=='lan'||originKind=='online'),
 SERVER='https://zombiziz-game.oe0pa5.easypanel.host',relayBase=()=>originKind=='online'?location.origin:SERVER;
function nickUp(){const e=$('nick'),v=(($('nm')&&$('nm').value)||'').trim();if(e)e.textContent=v?'NICKNAME: '+v.toUpperCase():''}
function nickOk(){const v=$('nk').value.trim().slice(0,12);if(!v){$('nk').focus();return}LS.set('name',v);$('nm').value=v;nickUp();show('main')}
function show(n){for(const e of document.querySelectorAll('.scr'))e.style.display='none';$('s-'+n).style.display='block';$('logo').style.display=n=='lobby'?'none':'block';const nk=$('nick');if(nk)nk.style.display=n=='lobby'?'none':'block';if(n=='main')nickUp();if(n=='multi')tabSel(tab);rl()}
function tabSel(t){tab='on';$('tab-on').style.display='flex';loadRooms()}
function rl(){
 $('onL').innerHTML=onRooms.map(r=>`<div class=it onclick="joinRoom('${esc(r.code)}')"><b>${esc(r.name)}</b><span>${r.n}/8 • ${esc(r.code)}</span></div>`).join('');
 $('ho').innerHTML='<button class=sb onclick=hostOnline()>CRIAR SALA</button>';
 $('net').innerHTML=''}
// lista de salas: o servidor só guarda "quem está aberto" (host avisa por HTTP); a conexão de jogo é direta (PeerJS)
async function loadRooms(){const b=relayBase();$('onS').textContent='Carregando...';
 try{onRooms=await(await fetch(b+'/rooms')).json();$('onS').textContent=onRooms.length?'':'Nenhuma sala aberta agora. Crie a sua!'}catch(e){onRooms=[];$('onS').textContent='Lista indisponível. Digite o código da sala abaixo.'}rl()}
let roomHB=0;
function roomAnnounce(code){const b=relayBase(),f=()=>{if(!host||!ws)return;try{fetch(b+'/room',{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({code,name:myName(),n:Object.keys(PL).length}),keepalive:true}).catch(()=>{})}catch(e){}};
 f();roomHB=setInterval(f,8000);addEventListener('pagehide',()=>{try{navigator.sendBeacon(b+'/close?code='+code)}catch(e){}})}
// ---- conexão DIRETA (WebRTC via PeerJS): o servidor público só faz o aperto de mão; o jogo vai direto cliente <-> host ----
const PJ_PFX='zombrize-',PJ_CFG={config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]}},netConns={};let netConn=null;
function netErr(m){alert(m);location.reload()}
function netTo(pid,m){const c=netConns[pid];if(c&&c.open&&(!c.dataChannel||c.dataChannel.bufferedAmount<3e6))c.send(m)}
function hostOnline(n){n=n||0;if(typeof Peer=='undefined')return netErr('Biblioteca de rede não carregou.');const code=Math.random().toString(36).slice(2,7).toUpperCase(),pr=new Peer(PJ_PFX+code,PJ_CFG);let open=0;
 pr.on('open',()=>{open=1;host=1;rc=code;ws={readyState:1,bufferedAmount:0};fs_();show('lobby');$('rm').textContent='Sala: '+code;$('hc').style.display='';$('wt').style.display='none';addP(id,myName());startLoop();roomAnnounce(code)});
 pr.on('connection',c=>{if(Object.keys(netConns).length>=7){c.on('open',()=>c.close());return}let pid=null;
  c.on('data',m=>{if(!m)return;if(!pid){if(m.t=='j'&&m.id){pid=String(m.id);if(netConns[pid]&&netConns[pid]!==c)try{netConns[pid].close()}catch(e){}netConns[pid]=c}else return}if(m.id!=null)m.id=pid;handle(m)});
  c.on('close',()=>{if(pid&&netConns[pid]===c){delete netConns[pid];if(ph==0)delete PL[pid]}})});
 pr.on('disconnected',()=>{try{pr.reconnect()}catch(e){}});
 pr.on('error',e=>{if(e.type=='unavailable-id'&&!open&&n<5){try{pr.destroy()}catch(x){}return hostOnline(n+1)}if(!open)netErr('Não foi possível criar a sala ('+e.type+').')})}
function joinRoom(c){c=String(c||$('jc').value).trim().toUpperCase().replace(/\W/g,'');if(!c)return $('jc').focus();if(typeof Peer=='undefined')return netErr('Biblioteca de rede não carregou.');
 host=0;rc=c;fs_();const n=myName(),pr=new Peer(undefined,PJ_CFG);let ok=0;$('jS').textContent='Conectando...';
 const to=setTimeout(()=>{if(!ok)netErr('Não foi possível conectar à sala '+c+'. Confira o código; a rede também pode estar bloqueando conexão direta.')},15000);
 pr.on('open',()=>{const cn=pr.connect(PJ_PFX+c,{serialization:'json',reliable:true});netConn=cn;
  cn.on('open',()=>{ok=1;clearTimeout(to);ws={get readyState(){return cn.open?1:3}};show('lobby');$('rm').textContent='Sala: '+c;send({t:'j',id,n})});
  cn.on('data',m=>{if(m&&m.t=='S')onSnap(m)});
  cn.on('close',()=>{alert('Conexão perdida');location.reload()});
  cn.on('error',()=>{if(!ok)netErr('Falha ao conectar na sala '+c+'.')})});
 pr.on('error',e=>{if(!ok)netErr(e.type=='peer-unavailable'?'Sala '+c+' não encontrada.':'Erro de rede ('+e.type+').')})}
function fs_(){try{document.documentElement.requestFullscreen().then(()=>{try{screen.orientation.lock('portrait').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}
// O1-1: medidor da simulacao do host (EMA em STEP_MS, maximo do ultimo segundo em STEP_MAX). Custo = 2 performance.now()
let STEP_MS=0,STEP_MAX=0,STEP_MX=0,STEP_T=0;
function stepT(){const t0=performance.now();step();const d=performance.now()-t0;
 STEP_MS=STEP_MS?STEP_MS*.9+d*.1:d;if(d>STEP_MX)STEP_MX=d;
 const nw=Date.now();if(!STEP_T)STEP_T=nw;else if(nw-STEP_T>=1000){STEP_MAX=STEP_MX;STEP_MX=0;STEP_T=nw}}
function startLoop(){try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),33)'])));w.onmessage=()=>stepT()}catch(e){setInterval(stepT,33)}}
function solo(){host=1;ws=null;fs_();addP(id,myName());startLoop();minP=1;start()}
