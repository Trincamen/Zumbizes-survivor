// Gera game.html a partir de src/.
// Uso: node build.js             (dev: inclui src/js/98-debug.js)
//      node build.js --release   (release: EXCLUI src/js/98-debug.js)
//      node build.js --check [--release]  (só confere se game.html está em dia, com a mesma flag)
// src/index.html (molde) + src/style.css + src/js/*.js (ordem alfabética) + @@GLB:caminho@@ (base64 de src/caminho)
const fs=require('fs'),path=require('path');
const REL=process.argv.includes('--release');
const src=p=>path.join(__dirname,'src',p),rd=p=>fs.readFileSync(src(p),'utf8');
const js=fs.readdirSync(src('js')).filter(f=>f.endsWith('.js')&&!(REL&&f==='98-debug.js')).sort().map(f=>rd('js/'+f)).join('\n')
 .replace(/@@GLB:([^@]+)@@/g,(_,f)=>fs.readFileSync(src(f)).toString('base64'));
const out=rd('index.html').replace('@@CSS@@',()=>rd('style.css')).replace('@@JS@@',()=>js);
const dst=path.join(__dirname,'game.html');
const tag=REL?'release, sem debug':'debug INCLUÍDO';
if(process.argv.includes('--check')){
 const ok=fs.existsSync(dst)&&fs.readFileSync(dst,'utf8')===out;
 console.log(ok?'game.html esta em dia com src/ ('+tag+')':'game.html DESATUALIZADO ('+tag+'): rode node build.js'+(REL?' --release':''));process.exit(ok?0:1)}
fs.writeFileSync(dst,out);console.log('game.html gerado ('+out.length+' bytes, '+tag+')');
