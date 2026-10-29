// ---------- rede ----------
function send(m){host?handle(m):ws.send(JSON.stringify(m))}
const myName=()=>($('nm').value||'Jogador').slice(0,12),canHost=()=>!MOB&&(originKind=='lan'||originKind=='online'),
 relayBase=()=>{if(originKind=='online')return location.origin;let v=(LS.get('relay')||'').trim();if(!v)return'';if(!/^https?:\/\//.test(v))v='https://'+v;return v.replace(/\/$/,'')};
function show(n){for(const e of document.querySelectorAll('.scr'))e.style.display='none';$('s-'+n).style.display='block';$('logo').style.display=n=='lobby'?'none':'block';$('tag').style.visibility=n=='main'?'':'hidden';if(n=='multi')tabSel(tab);rl()}
function tabSel(t){tab='on';$('tab-on').style.display='block';loadRooms()}
function rl(){
 $('onL').innerHTML=onRooms.map(r=>`<div class=it onclick="joinRoom('${esc(r.code)}')"><b>🌐 ${esc(r.name)}</b><span>${r.n}/8 • ${esc(r.code)}</span></div>`).join('');
 $('ho').innerHTML=relayBase()?'<button class=sb onclick=hostOnline()>➕ CRIAR SALA ONLINE</button>':'';
 $('net').innerHTML='🌐 Online: <b>'+onRooms.length+'</b> sala(s)'}
async function loadRooms(){const b=relayBase();if(!b){$('onS').textContent='Informe o endereço do servidor online em CONFIGURAÇÕES.';return}$('onS').textContent='Carregando...';
 try{onRooms=await(await fetch(b+'/rooms')).json();$('onS').textContent=onRooms.length?'':'Nenhuma sala aberta agora. Crie a sua!'}catch(e){onRooms=[];$('onS').textContent='Não foi possível falar com o servidor online.'}rl()}
const relayWs=()=>relayBase().replace(/^http/,'ws');
function hostLAN(){connect('ws://'+location.host+'/ws?id='+id+'&h=1',1)}
function hostOnline(){const code=Math.random().toString(36).slice(2,6).toUpperCase();connect(relayWs()+'/ws?id='+id+'&h=1&room='+code+'&name='+encodeURIComponent(myName()),1,code)}
function joinLAN(hp){connect('ws://'+hp+'/ws?id='+id,0)}
function joinRoom(c){connect(relayWs()+'/ws?id='+id+'&room='+c,0,c)}
function sair(){try{window.close()}catch(e){}if(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App)Capacitor.Plugins.App.exitApp();else alert('Você já pode fechar esta janela.')}
function fs_(){try{document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}
function startLoop(){try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),33)'])));w.onmessage=()=>step()}catch(e){setInterval(step,33)}}
function solo(){host=1;ws=null;fs_();addP(id,myName());startLoop();minP=1;start()}
function connect(u,h,code){host=h;rc=code||'';fs_();const n=myName();ws=new WebSocket(u);
 ws.onopen=()=>{show('lobby');$('rm').textContent=code?'Sala: '+code:'';if(h){$('hc').style.display='';$('wt').style.display='none';addP(id,n);startLoop()}else send({t:'j',id,n})};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(host)handle(m);else if(m.t=='S')onSnap(m)};
 ws.onclose=()=>{alert('Conexão perdida ou servidor indisponível');location.reload()}}