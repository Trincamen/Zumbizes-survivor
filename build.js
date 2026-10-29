// Gera game.html a partir de src/. Uso: node build.js  |  node build.js --check
// src/index.html (molde) + src/style.css + src/js/*.js (ordem alfabética) + @@GLB:caminho@@ (base64 de src/caminho)
const fs=require('fs'),path=require('path');
const src=p=>path.join(__dirname,'src',p),rd=p=>fs.readFileSync(src(p),'utf8');
const js=fs.readdirSync(src('js')).filter(f=>f.endsWith('.js')).sort().map(f=>rd('js/'+f)).join('\n')
 .replace(/@@GLB:([^@]+)@@/g,(_,f)=>fs.readFileSync(src(f)).toString('base64'));
const out=rd('index.html').replace('@@CSS@@',()=>rd('style.css')).replace('@@JS@@',()=>js);
const dst=path.join(__dirname,'game.html');
if(process.argv.includes('--check')){
 const ok=fs.existsSync(dst)&&fs.readFileSync(dst,'utf8')===out;
 console.log(ok?'game.html esta em dia com src/':'game.html DESATUALIZADO: rode node build.js');process.exit(ok?0:1)}
fs.writeFileSync(dst,out);console.log('game.html gerado ('+out.length+' bytes)');
