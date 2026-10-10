// Servidor ONLINE: salas + repasse de mensagens. Sem dependências (só Node 18+).
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||4040,rooms={};
const gp=[path.join(__dirname,'game.html'),path.join(__dirname,'..','game.html')].find(f=>fs.existsSync(f));
const san=s=>String(s||'').replace(/[^\wÀ-ÿ \-().']/g,'').slice(0,24);
function frame(data){const p=Buffer.isBuffer(data)?data:Buffer.from(data);let h;if(p.length<126)h=Buffer.from([0x81,p.length]);else if(p.length<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(p.length,2)}else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(p.length),2)}return Buffer.concat([h,p])}
const send=(s,f)=>{try{if(s&&!s.destroyed)s.write(f)}catch(e){}};
const server=http.createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Private-Network','true');
 if(req.method=='OPTIONS'){res.setHeader('Access-Control-Allow-Headers','*');res.writeHead(204);return res.end()}
 if(req.url.startsWith('/rooms')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(Object.keys(rooms).map(c=>({code:c,name:rooms[c].name,n:rooms[c].clients.size+1,max:8}))))}
 if(req.url.startsWith('/info')){res.setHeader('Content-Type','application/json');return res.end('{"kind":"online"}')}
 fs.readFile(gp,(e,d)=>{if(e){res.writeHead(500);return res.end('game.html nao encontrado')}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(d)})});
server.on('upgrade',(req,socket)=>{const u=new URL(req.url,'http://x'),id=(u.searchParams.get('id')||'').replace(/\W/g,'').slice(0,12),h=u.searchParams.get('h')=='1',code=(u.searchParams.get('room')||'').replace(/\W/g,'').toUpperCase().slice(0,8),key=req.headers['sec-websocket-key'];
 if(!key||!id||!code){socket.destroy();return}
 let rm=rooms[code];
 if(h){if(rm){for(const c of rm.clients.values())c.destroy();if(rm.host)rm.host.destroy()}rm=rooms[code]={name:san(u.searchParams.get('name'))||code,host:socket,clients:new Map()}}
 else if(!rm||!rm.host||rm.clients.size>=11){socket.destroy();return}
 socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')+'\r\n\r\n');
 socket.setNoDelay(true);if(!h)rm.clients.set(id,socket);
 let buf=Buffer.alloc(0);
 socket.on('data',d=>{buf=Buffer.concat([buf,d]);if(buf.length>4e6){socket.destroy();return}
  for(;;){if(buf.length<2)break;const op=buf[0]&15;let len=buf[1]&127,o=2;if(len==126){if(buf.length<4)break;len=buf.readUInt16BE(2);o=4}else if(len==127){if(buf.length<10)break;len=Number(buf.readBigUInt64BE(2));o=10}
   const masked=(buf[1]&128)!=0;if(masked)o+=4;if(buf.length<o+len)break;const p=Buffer.from(buf.subarray(o,o+len));if(masked){const m=buf.subarray(o-4,o);for(let i=0;i<p.length;i++)p[i]^=m[i&3]}buf=buf.subarray(o+len);
   if(op==8){socket.destroy();return}if(op==9){send(socket,Buffer.concat([Buffer.from([0x8a,p.length]),p]));continue}if(op!=1)continue;
   if(h){const k=p[0]==64?p.indexOf(124):-1;if(k>0){const to=rm.clients.get(p.toString('latin1',1,k));if(to)send(to,frame(p.subarray(k+1)))}else if(p[0]!=64){const f=frame(p);for(const c of rm.clients.values())send(c,f)}}
   else send(rm.host,frame(p))}});
 socket.on('close',()=>{if(h){if(rooms[code]===rm){for(const c of rm.clients.values())c.destroy();delete rooms[code]}}else if(rm.clients.get(id)===socket)rm.clients.delete(id)});
 socket.on('error',()=>{})});
server.listen(PORT,()=>console.log('Servidor online na porta '+PORT));
