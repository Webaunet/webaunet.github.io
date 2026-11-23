const C='recettes-v2';
const CORE=['./','index.html','app.css?v=2','app.js?v=2','nutrition.js?v=2','import.js?v=2','share.js?v=2','manifest.json','ic192.png','ic512.png','ic512m.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='recettes-lib').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const LIBS=/^https:\/\/(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|tessdata\.projectnaptha\.com)\//;
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    // réseau d'abord (mises à jour), cache si hors ligne
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(req,c))}return r}).catch(()=>caches.match(req,{ignoreSearch:u.pathname.endsWith('/')||u.pathname.endsWith('index.html')}).then(r=>r||caches.match('index.html'))));
  }else if(LIBS.test(req.url)){
    // polices et bibliothèques (OCR, PDF) : cache d'abord, pour fonctionner hors ligne après le 1er usage
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{if(n.ok||n.type==='opaque'){const c=n.clone();caches.open('recettes-lib').then(x=>x.put(req,c))}return n})));
  }
});
