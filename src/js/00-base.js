const $=s=>document.getElementById(s),C=$('c'),X=C.getContext('2d'),MW=4000,MH=6000,RY0=2700,RY1=3300,MOB=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent),ROWS=[0,1,2,3,4,7,8,9,10,11];
let W,H,ZO=1,cx=2000,cy=4500,ox=0,oy=0;let DPR=1;const _l=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
let CAM=.928,HUDS=1.4;
const zbase=()=>MOB?Math.min(1.4,Math.max(1.1,innerHeight/340)):Math.max(.5,Math.min(1,innerWidth/1100)),hkF=()=>(MOB?.6:1)*HUDS;
function rs(){DPR=Math.min(window.devicePixelRatio||1,2);const zl=Math.max(innerHeight/1900,innerWidth/3000,.45),zh=Math.max(zl,Math.min(1.8,innerWidth/420,innerHeight/220));ZO=Math.max(zl,Math.min(zh,zbase()*CAM));
 C.width=innerWidth*DPR|0;C.height=innerHeight*DPR|0;W=innerWidth/ZO;H=innerHeight/ZO;const ob=$('opt');if(ob)ob.style.right=Math.round(140*hkF()*ZO+8)+'px';const st=document.documentElement.style;if(st.setProperty)st.setProperty('--hs',HUDS)}
rs();onresize=rs;
const WN=['Pistola','Escopeta','Rifle','Metralhad.','Lança-chamas','Sniper'],WC=['#ddd','#f80','#4cf','#fd0','#f44','#9f6'],WL=['P','E','R','M','L','S'];
const WS_=[[220,12,.7],[130,48,1.5],[420,32,1],[260,4,.1],[110,4,.12],[700,120,1.8]],AM=[7,7,45,30,50,5],RT=[1.2,2.2,2.2,2,3,2.6],SPD=[2200,1600,3200,2600,1,4800];
const WA=[.8,.74,.86,.62,1,.92],rgOf=(c,l)=>WS_[c][0]*(1+.06*l),dmOf=(c,l)=>WS_[c][1]*(1+.25*l),cdOf=(c,l)=>WS_[c][2]/(1+.08*l),rtOf=(c,l)=>Math.max(.5,RT[c]*(1-.07*l)),magOf=(c,l)=>Math.ceil(AM[c]*(1+.1*l)),fmt=t=>(t/60|0)+':'+String(t%60).padStart(2,'0');
const SK=['Dano +2%','Velocidade +5%','Vida máx +25%','Cadência +2%','Alcance +5%','Regeneração'];
const CL={10:['✚','Curar'],11:['⚡','Desfib.'],12:['🩹','Bandagem'],13:['💊','Analgés.']};
const SH=[['🩹 Bandagem',15,9],['💊 Analgésico',60,10],['✚ Kit de cura',60,0],['⚡ Desfibrilador',400,1],['Escopeta',300,2],['Rifle',440,3],['Metralhadora',600,4],['Lança-chamas',520,5],['Sniper',900,11],['★ Melhoria da arma',100,6]];
const id=Math.random().toString(36).slice(2,8);let host=0,ws,snap=null,me=null,lastBn=null,skKey='',shKey='',ofKey='',LSH={},LVP={},LUE=[],FT=[],PILL=null,wbKey='',O=[],curSd=0,BLD=[],meB=null,IL=[],ZMM=[],FIRES=[],DD={},POP={},FL2=[],PT=[],QK=0,lastEv=0,FXL=[],lastF=0,RP={},FR=0,LT=Date.now();
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}},esc=x=>String(x).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
let originKind='?',lanSrv=[],onRooms=[],scanning=0,tab='on',rc='';
$('nm').value=LS.get('name')||'Jogador '+(Math.random()*90+10|0);
(async()=>{if(window.Capacitor)originKind='app';else try{const j=await(await fetch('/info')).json();originKind=j.kind;if(j.kind=='lan')lanSrv.push({host:location.host,name:j.name,n:j.n})}catch(e){originKind='none'}rl()})();
const R=(a,b)=>a+Math.random()*(b-a),need=l=>150+l*90+l*l*10,kOf=c=>c==0?7:c==5?11:c<5?c+1:c==10?0:c==11?1:c==12?9:10,ad=(a,b)=>{let d=a-b;while(d>3.14)d-=6.28;while(d<-3.14)d+=6.28;return d};