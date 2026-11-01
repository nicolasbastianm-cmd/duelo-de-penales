/* Duelo de Penales: guarda los archivos del juego para jugar sin internet.
   La página principal busca primero la versión nueva en internet; el resto (modelo, sonidos, motor 3D, letras) sale de la memoria. */
const CACHE='penales-v1';
const BASE=['./','index.html','jugador.js','manifest.webmanifest','icono-192.png','icono-512.png','apple-touch-icon.png',
  'sonido_amb.mp3','sonido_gol.mp3','sonido_atajada.mp3','sonido_entrada.mp3','sonido_alivio.mp3','sonido_uy.mp3','sonido_lamento.mp3','sonido_pifia.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.headers.has('range'))return; // audio por tramos: lo maneja el navegador
  const page=req.mode==='navigate'||(url.origin===location.origin&&/\/(index\.html)?$/.test(url.pathname));
  const ok=url.origin===location.origin||/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if(!ok)return;
  if(page){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match(req).then(m=>m||caches.match('./'))));return;}
  e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
