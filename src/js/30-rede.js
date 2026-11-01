// ---------- rede ----------
function send(m){host?handle(m):ws.send(JSON.stringify(m))}
const myName=()=>($('nm').value||'Jogador').slice(0,12),canHost=()=>!MOB&&(originKind=='lan'||originKind=='online'),
 SERVER='https://zombiziz-game.oe0pa5.easypanel.host',relayBase=()=>originKind=='online'?location.origin:SERVER;
function nickUp(){const e=$('nick'),v=(($('nm')&&$('nm').value)||'').trim();if(e)e.textContent=v?'NICKNAME: '+v.toUpperCase():''}
function nickOk(){const v=$('nk').value.trim().slice(0,12);if(!v){$('nk').focus();return}LS.set('name',v);$('nm').value=v;nickUp();show('main')}
function show(n){for(const e of document.querySelectorAll('.scr'))e.style.display='none';$('s-'+n).style.display='block';$('logo').style.display=n=='lobby'?'none':'block';const nk=$('nick');if(nk)nk.style.display=n=='lobby'?'none':'block';if(n=='main')nickUp();if(n=='multi')tabSel(tab);rl()}
function tabSel(t){tab='on';$('tab-on').style.display='flex';loadRooms()}
function rl(){
 $('onL').innerHTML=onRooms.map(r=>`<div class=it onclick="joinRoom('${esc(r.code)}')"><b>${esc(r.name)}</b><span>${r.n}/8 • ${esc(r.code)}</span></div>`).join('');
 $('ho').innerHTML=relayBase()?'<button class=sb onclick=hostOnline()>CRIAR SALA ONLINE</button>':'';
 $('net').innerHTML='Online: <b>'+onRooms.length+'</b> sala(s)'}
async function loadRooms(){const b=relayBase();$('onS').textContent='Carregando...';
 try{onRooms=await(await fetch(b+'/rooms')).json();$('onS').textContent=onRooms.length?'':'Nenhuma sala aberta agora. Crie a sua!'}catch(e){onRooms=[];$('onS').textContent='Não foi possível falar com o servidor online.'}rl()}
const relayWs=()=>relayBase().replace(/^http/,'ws');
function hostOnline(){const code=Math.random().toString(36).slice(2,6).toUpperCase();connect(relayWs()+'/ws?id='+id+'&h=1&room='+code+'&name='+encodeURIComponent(myName()),1,code)}
function joinRoom(c){connect(relayWs()+'/ws?id='+id+'&room='+c,0,c)}
function fs_(){try{document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}}
// O1-1: medidor da simulacao do host (EMA em STEP_MS, maximo do ultimo segundo em STEP_MAX). Custo = 2 performance.now()
let STEP_MS=0,STEP_MAX=0,STEP_MX=0,STEP_T=0;
function stepT(){const t0=performance.now();step();const d=performance.now()-t0;
 STEP_MS=STEP_MS?STEP_MS*.9+d*.1:d;if(d>STEP_MX)STEP_MX=d;
 const nw=Date.now();if(!STEP_T)STEP_T=nw;else if(nw-STEP_T>=1000){STEP_MAX=STEP_MX;STEP_MX=0;STEP_T=nw}}
function startLoop(){try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),33)'])));w.onmessage=()=>stepT()}catch(e){setInterval(stepT,33)}}
function solo(){host=1;ws=null;fs_();addP(id,myName());startLoop();minP=1;start()}
function connect(u,h,code){host=h;rc=code||'';fs_();const n=myName();ws=new WebSocket(u);
 ws.onopen=()=>{show('lobby');$('rm').textContent=code?'Sala: '+code:'';if(h){$('hc').style.display='';$('wt').style.display='none';addP(id,n);startLoop()}else send({t:'j',id,n})};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(host)handle(m);else if(m.t=='S')onSnap(m)};
 ws.onclose=()=>{alert('Conexão perdida ou servidor indisponível');location.reload()}}