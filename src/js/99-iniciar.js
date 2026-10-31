// ---------- ícone da aba: SVG estático (sem canvas). O código antigo lia pixels (getImageData/putImageData) do canvas PRINCIPAL ao iniciar,
// o que pode fazer o navegador trocar o canvas da GPU para software (CPU) pela sessão inteira (menu a 16 FPS, draw alto).
try{let l=document.querySelector('link[rel="icon"]');if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}
 l.type='image/svg+xml';l.href='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#14110d"/><circle cx="32" cy="30" r="18" fill="#8fa88a"/><circle cx="25" cy="27" r="4" fill="#c22"/><circle cx="39" cy="27" r="4" fill="#c22"/><rect x="24" y="38" width="16" height="5" rx="2" fill="#2a2218"/><path d="M14 18 L22 10 L28 16 Z" fill="#c9a54a"/></svg>')}catch(e){}
draw();
