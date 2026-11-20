const V='doedelzak-v35';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
const MEDIA=['theme2.mp3','candy.mp3','turk.mp3','pou.mp3'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(V);await c.addAll(CORE);await Promise.all(MEDIA.map(u=>c.add(u).catch(()=>{})));self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V&&k.startsWith('doedelzak-')&&k!=='doedelzak-fonts')await caches.delete(k);await self.clients.claim()})())});
async function ranged(req){const c=await caches.open(V);let r=await c.match(req.url);if(!r){r=await fetch(req.url);if(r.ok)c.put(req.url,r.clone())}
  const buf=await r.arrayBuffer(),m=/bytes=(\d+)-(\d*)/.exec(req.headers.get('range')||''),ct=r.headers.get('Content-Type')||'audio/mpeg';
  if(!m)return new Response(buf,{status:200,headers:{'Content-Type':ct,'Accept-Ranges':'bytes','Content-Length':String(buf.byteLength)}});
  const s=+m[1],e=m[2]?Math.min(+m[2],buf.byteLength-1):buf.byteLength-1;
  return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':ct,'Content-Range':'bytes '+s+'-'+e+'/'+buf.byteLength,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);
  if(u.origin===location.origin){
    if(q.headers.has('range')){e.respondWith(ranged(q));return}
    e.respondWith((async()=>{const c=await caches.open(V),hit=await c.match(q,{ignoreSearch:true});
      const net=fetch(q).then(r=>{if(r&&r.ok&&r.type==='basic')c.put(q,r.clone());return r}).catch(()=>null);
      if(hit){e.waitUntil(net);return hit}
      const r=await net;if(r)return r;
      if(q.mode==='navigate'){const i=await c.match('index.html');if(i)return i}
      return new Response('Offline',{status:503,statusText:'Offline'})})());return}
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith((async()=>{const c=await caches.open('doedelzak-fonts'),hit=await c.match(q);const net=fetch(q).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(q,r.clone());return r}).catch(()=>null);return hit||(await net)||new Response('',{status:504})})())}
});
