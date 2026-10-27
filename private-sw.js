// The password area (Marco, 27.10.2026): opens the sealed files of assets/private for the tab that knows the
// password. app.js registers it only after “more” and hands it the key and the list of files; the page itself then
// asks for the usual addresses (assets/projects/…), and this answers them with the opened file. A tab that never
// gave the key, or an address typed in by hand, gets the plain answer of the server — which has no such file.
const tabs=new Map(),opened=new Map();
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 const {key,files}=event.data||{};
 if(!key||!event.source)return;
 event.waitUntil(crypto.subtle.importKey('raw',key,'AES-GCM',false,['decrypt']).then(cryptoKey=>{tabs.set(event.source.id,{key:cryptoKey,files})}));
});
// After the browser stopped this worker it has forgotten every key: ask the tab again (app.js keeps it until the tab closes).
const ask=async id=>{
 const client=id&&await self.clients.get(id);if(!client)return null;
 const reply=await new Promise(resolve=>{
  const channel=new MessageChannel();channel.port1.onmessage=e=>resolve(e.data);
  client.postMessage({private:'key?'},[channel.port2]);setTimeout(()=>resolve(null),3000);
 });
 // A tab without the key is remembered as such, so its next pictures are not held up by asking again.
 tabs.set(id,reply?.key?{key:await crypto.subtle.importKey('raw',reply.key,'AES-GCM',false,['decrypt']),files:reply.files}:{});
 return tabs.get(id);
};
const open=async(tab,entry)=>{
 if(!opened.has(entry.bin))opened.set(entry.bin,fetch(entry.bin,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(r.status);return r.arrayBuffer()})
  .then(sealed=>crypto.subtle.decrypt({name:'AES-GCM',iv:sealed.slice(0,12)},tab.key,sealed.slice(12))).catch(error=>{opened.delete(entry.bin);throw error}));
 return opened.get(entry.bin);
};
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==location.origin||event.request.method!=='GET'||event.request.mode==='navigate')return;
 // Only where project files live; everything else passes untouched.
 const id=event.clientId;
 if(!id||!/^\/assets\/(projects|project-layouts|project-logos|previews)\//.test(url.pathname))return;
 event.respondWith((async()=>{
  const tab=tabs.has(id)?tabs.get(id):await ask(id);
  const entry=tab?.files?.[url.pathname];
  if(!entry)return fetch(event.request);
  const body=await open(tab,entry),size=body.byteLength;
  // Films are asked for in pieces (Safari only plays them that way).
  const range=event.request.headers.get('range')?.match(/bytes=(\d*)-(\d*)/);
  if(range){
   const start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2])),end=range[1]&&range[2]?Math.min(Number(range[2]),size-1):size-1;
   return new Response(body.slice(start,end+1),{status:206,headers:{'Content-Type':entry.type,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
  }
  return new Response(body,{headers:{'Content-Type':entry.type,'Content-Length':String(size),'Accept-Ranges':'bytes'}});
 })());
});
