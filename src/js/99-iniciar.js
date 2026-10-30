// ---------- ícone da aba: cabeça do jogador ----------
try{let ftry=0;
 const fav=()=>{
 if(typeof PG==='undefined'||!PG||typeof drawPlayer!=='function'||typeof C==='undefined')return false;
 const SZ=400;let prev=null;
 try{prev=X.getImageData(0,0,SZ,SZ)}catch(e){prev=null}
 X.save();X.setTransform(1,0,0,1,0,0);let d=null;
 try{X.clearRect(0,0,SZ,SZ);drawPlayer(200,340,{idle:true,fa:Math.PI/2,c:'#3a5a8a',gun:'#333',t:Date.now(),s:3});d=X.getImageData(0,0,SZ,SZ)}catch(e){d=null}
 X.clearRect(0,0,SZ,SZ);if(prev)try{X.putImageData(prev,0,0)}catch(e){}X.restore();
 if(!d)return false;
 const p=d.data;let x0=SZ,y0=SZ,x1=-1,y1=-1;
 for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++)if(p[(y*SZ+x)*4+3]>150){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<0||y1<0)return false;
 const hh=y1-y0;if(hh<8)return false;
 const band=y0+Math.max(6,hh*.28);let hx0=SZ,hx1=-1;
 for(let y=y0;y<band&&y<SZ;y++)for(let x=0;x<SZ;x++)if(p[(y*SZ+x)*4+3]>150){if(x<hx0)hx0=x;if(x>hx1)hx1=x}
 if(hx1<0){hx0=x0;hx1=x1}
 const cx=(hx0+hx1)/2;
 const side=Math.max((band-y0)*1.05,(hx1-hx0)*1.5,hh*.30);
 const sx=Math.round(cx-side/2),sy=Math.round(y0-side*.04);
 const ic=document.createElement('canvas');ic.width=64;ic.height=64;
 const ix=ic.getContext('2d');ix.imageSmoothingEnabled=true;ix.drawImage(C,sx,sy,side,side,1,1,62,62);
 const url=ic.toDataURL('image/png');
 let l=document.querySelector('link[rel="icon"]');
 if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}
 l.type='image/png';l.href=url;return true};
 const go=()=>{try{if(fav()||++ftry>10)return}catch(e){return}setTimeout(go,500)};
 go();
}catch(e){}
draw();
