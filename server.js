// Servidor: serve o jogo/música e mantém só a LISTA de salas (o host avisa por HTTP; o jogo em si vai direto host<->cliente por WebRTC). Sem dependências (só Node 18+).
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||4040,rooms={};
const gp=[path.join(__dirname,'game.html'),path.join(__dirname,'..','game.html')].find(f=>fs.existsSync(f));
const san=s=>String(s||'').replace(/[^\wÀ-ÿ \-().']/g,'').slice(0,24);
const TTL=25000,prune=()=>{const t=Date.now();for(const c in rooms)if(t-rooms[c].t>TTL)delete rooms[c]};
const server=http.createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Private-Network','true');
 if(req.method=='OPTIONS'){res.setHeader('Access-Control-Allow-Headers','*');res.writeHead(204);return res.end()}
 if(req.url.startsWith('/rooms')){prune();res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(Object.keys(rooms).map(c=>({code:c,name:rooms[c].name,n:rooms[c].n,max:8}))))}
 if(req.method=='POST'&&req.url.startsWith('/room')){let b='';req.on('data',d=>{b+=d;if(b.length>2000)req.destroy()});req.on('end',()=>{try{const j=JSON.parse(b),c=String(j.code||'').replace(/\W/g,'').toUpperCase().slice(0,8);
   if(c.length>=3){prune();if(rooms[c]||Object.keys(rooms).length<300)rooms[c]={name:san(j.name)||c,n:Math.max(1,Math.min(8,j.n|0)),t:Date.now()}}}catch(e){}res.writeHead(204);res.end()});return}
 if(req.url.startsWith('/close')){const c=(new URL(req.url,'http://x').searchParams.get('code')||'').replace(/\W/g,'').toUpperCase();delete rooms[c];res.writeHead(204);return res.end()}
 if(req.url.startsWith('/info')){res.setHeader('Content-Type','application/json');return res.end('{"kind":"online"}')}
 if(req.url.startsWith('/music/')){// musicas do jogo (so .mp3 dentro de ./music, com suporte a Range para o navegador poder pular/pre-carregar)
  let nm='';try{nm=path.basename(decodeURIComponent(req.url.split('?')[0].slice(7)))}catch(e){}
  const f=path.join(__dirname,'music',nm);
  if(!/\.mp3$/i.test(nm)||!fs.existsSync(f)){res.writeHead(404);return res.end()}
  const size=fs.statSync(f).size,rg=req.headers.range;
  res.setHeader('Content-Type','audio/mpeg');res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','public,max-age=86400');
  if(rg){const m=/bytes=(\d*)-(\d*)/.exec(rg);let a=m&&m[1]?+m[1]:0,b=m&&m[2]?+m[2]:size-1;
   if(a>b||a>=size){res.writeHead(416,{'Content-Range':'bytes */'+size});return res.end()}
   b=Math.min(b,size-1);res.writeHead(206,{'Content-Range':'bytes '+a+'-'+b+'/'+size,'Content-Length':b-a+1});
   return req.method=='HEAD'?res.end():fs.createReadStream(f,{start:a,end:b}).pipe(res)}
  res.writeHead(200,{'Content-Length':size});return req.method=='HEAD'?res.end():fs.createReadStream(f).pipe(res)}
 fs.readFile(gp,(e,d)=>{if(e){res.writeHead(500);return res.end('game.html nao encontrado')}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(d)})});
server.listen(PORT,()=>console.log('Servidor online na porta '+PORT));
