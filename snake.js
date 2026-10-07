// The type snake on the desktop home (Marco, 07.10.2026): "marco pröfrock" in Serie 57 Medium, white on a black band,
// in the empty right half. A mouse that sweeps across it knocks the cord away. The physics and drawing are taken
// unchanged from the snake lab (tmp/snake-lab/index.html), with Marco's settings from it; coordinates are those of the
// 1920 × 1080 home drawing.
(()=>{
const W=1920,H=1080;
const S={text:'marco pröfrock',upper:false,font:'Serie57ArchiveMedium',size:209,tracking:0,bold:0.25,baseline:0.05,
 band:0.96,pad:0,contour:0,mode:'random',seed:232,curl:0,wave:4.2,x:868,y:110,w:1095,h:596,showRegion:false,avoid:true,drawn:null,
 hit:5,strength:1.1,ret:0,damp:0.953,walls:'page',bounce:0.21,solid:true,bend:1.69,iter:11,gravity:0.06,pin:'none'};
// The walls are the edges of the window, in drawing units: the drawing is 16:9, the window often is not.
let cv,ctx,svg,mouse=null,mprev=null,run=0,view=[0,0,W,H],origin=[0,0];
// ---------- layout of the type ----------
let glyphs=[],L=0,band=0,rest=[],P=[],Q=[],seg=4;
function font(){return `400 ${S.size}px ${S.font}`}
function layout(){
 ctx.font=font();const t=S.upper?S.text.toUpperCase():S.text,tr=S.tracking*S.size,pad=S.pad*S.size;glyphs=[];
 for(let i=0;i<t.length;i++){const x=ctx.measureText(t.slice(0,i)).width+tr*i,w=ctx.measureText(t[i]).width;glyphs.push({ch:t[i],s0:pad+x,s1:pad+x+w+tr,c:pad+x+w/2})}
 const textW=t.length?glyphs.at(-1).s1-tr:0;L=Math.max(textW+2*pad,band);
}
// seeded random
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function worm(r){
 const m=band/2+4,x0=S.x+m,y0=S.y+m,x1=S.x+S.w-m,y1=S.y+S.h-m,cx=(x0+x1)/2,cy=(y0+y1)/2;
 let x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),a=r()*Math.PI*2;const pts=[[x,y]],n=Math.ceil(L/seg);
 const f1=1/(band*S.wave*0.6),f2=1/(band*S.wave*0.27),p1=r()*7,p2=r()*7,kmax=1/(band*0.62);
 for(let i=1;i<=n;i++){
  const s=i*seg;let k=S.curl*kmax*(0.7*Math.sin(s*f1+p1)+0.45*Math.sin(s*f2+p2));
  const lx=x+Math.cos(a)*band*1.6,ly=y+Math.sin(a)*band*1.6;
  if(lx<x0||lx>x1||ly<y0||ly>y1){const tx=cx-x,ty=cy-y,cr=Math.cos(a)*ty-Math.sin(a)*tx;k+=Math.sign(cr||1)*kmax*0.9}
  k=Math.max(-kmax,Math.min(kmax,k));a+=k*seg;x+=Math.cos(a)*seg;y+=Math.sin(a)*seg;pts.push([x,y]);
 }
 return pts;
}
function score(p){
 let s=0;const step=3,gap=Math.ceil(band*3/seg);
 for(const [x,y] of p){if(x<S.x||x>S.x+S.w||y<S.y||y>S.y+S.h)s+=3}
 if(S.avoid)for(let i=0;i<p.length;i+=step)for(let j=i+gap;j<p.length;j+=step){const dx=p[i][0]-p[j][0],dy=p[i][1]-p[j][1];if(dx*dx+dy*dy<band*band*1.1)s++}
 return s;
}
function resample(pts,len){
 const out=[pts[0].slice()];let acc=0,need=seg;
 for(let i=1;i<pts.length&&out.length*seg<len+seg;i++){
  let [ax,ay]=pts[i-1];const [bx,by]=pts[i];let d=Math.hypot(bx-ax,by-ay);
  while(d>=need){const t=need/d;ax+=(bx-ax)*t;ay+=(by-ay)*t;out.push([ax,ay]);d-=need;need=seg}
  need-=d;
 }
 while((out.length-1)*seg<len){const a=out.at(-2)||[out[0][0]-1,out[0][1]],b=out.at(-1),d=Math.hypot(b[0]-a[0],b[1]-a[1])||1;out.push([b[0]+(b[0]-a[0])/d*seg,b[1]+(b[1]-a[1])/d*seg])}
 return out;
}
function build(){
 band=S.size*S.band;layout();
 if(S.mode==='drawn'&&S.drawn&&S.drawn.length>1)rest=resample(S.drawn,L);
 else{let best,bs=1e9;for(let c=0;c<(S.avoid?40:10);c++){const p=worm(rng(S.seed*977+c)),sc=score(p);if(sc<bs){bs=sc;best=p}if(!sc)break}rest=best}
 P=rest.map(p=>p.slice());Q=rest.map(p=>p.slice());calm=0;
}

// ---------- physics ----------
let calm=0;
function step(){
 const n=P.length,rad=band/2+S.hit;let mv=null,hit=false;
 if(mouse&&mprev){mv=[mouse[0]-mprev[0],mouse[1]-mprev[1]];const l=Math.hypot(...mv),max=120;if(l>max){mv[0]*=max/l;mv[1]*=max/l}}
 // asleep once it has come to rest: nothing moves until the mouse hits it again
 if(calm>30&&!(mv&&(mv[0]||mv[1]))){mprev=mouse&&mouse.slice();return}
 const old=P.map(p=>p.slice());
 for(let i=0;i<n;i++){
  const p=P[i],q=Q[i],vx=(p[0]-q[0])*S.damp,vy=(p[1]-q[1])*S.damp;
  p[0]+=vx+(rest[i][0]-p[0])*S.ret;p[1]+=vy+(rest[i][1]-p[1])*S.ret+S.gravity*0.3;
  if(mv&&(mv[0]||mv[1])){const d=distSeg(p,mprev,mouse);if(d<rad){const f=S.strength*(1-d/rad)**0.7;p[0]+=mv[0]*f;p[1]+=mv[1]*f;hit=true}}
 }
 const pred=P.map(p=>p.slice()),pin=i=>(S.pin!=='none'&&i===0)||(S.pin==='both'&&i===n-1);
 const box=S.walls==='none'?null:(m=>S.walls==='region'?[S.x+m,S.y+m,S.x+S.w-m,S.y+S.h-m]:[view[0]+m,view[1]+m,view[2]-m,view[3]-m])(band/2);
 const walls=()=>{if(box)for(const p of P){p[0]=Math.max(box[0],Math.min(box[2],p[0]));p[1]=Math.max(box[1],Math.min(box[3],p[1]))}};
 for(let it=0;it<S.iter;it++){
  for(let i=1;i<n;i++){const a=P[i-1],b=P[i],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1e-6,k=(d-seg)/d;
   const wa=pin(i-1)?0:pin(i)?1:.5,wb=1-wa;a[0]+=dx*k*wa;a[1]+=dy*k*wa;b[0]-=dx*k*wb;b[1]-=dy*k*wb}
  if(S.bend>0)stiffen(n,pin);
  if(S.solid)collide(n,pin);
  walls();
  for(let i=0;i<n;i++)if(pin(i)){P[i][0]=rest[i][0];P[i][1]=rest[i][1]}
 }
 // the cord never stretches: lay every link at exactly its length, outwards from the middle (or from a pinned start)
 const o=S.pin==='none'?n>>1:0,link=(i,j)=>{const a=P[j],b=P[i],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1e-6;b[0]=a[0]+dx/d*seg;b[1]=a[1]+dy/d*seg};
 const exact=()=>{for(let i=o+1;i<n;i++)link(i,i-1);for(let i=o-1;i>=0;i--)link(i,i+1)};
 // speed for the next step comes from the rules' result before the exact-length pass: that pass only tidies the
 // lengths and must not push the snake along, or it keeps swimming across the page and never calms down
 const mid=P.map(p=>p.slice());
 exact();if(S.solid){collide(n,pin);exact()}
 walls();
 let top=0;const vmax=band*0.3;
 for(let i=0;i<n;i++){const p=P[i];let vx=mid[i][0]-old[i][0],vy=mid[i][1]-old[i][1];
  // at an edge: a hard hit bounces back, a slow one just stops there, and friction slows the sliding along it
  if(box){const lim=1.5+S.gravity;
   if(p[0]<=box[0]+.01||p[0]>=box[2]-.01){vx=Math.abs(vx)>lim?-vx*S.bounce:0;vy*=0.8}
   if(p[1]<=box[1]+.01||p[1]>=box[3]-.01){vy=Math.abs(vy)>lim?-vy*S.bounce:0;vx*=0.8}}
  const v=Math.hypot(vx,vy);if(v>vmax){vx*=vmax/v;vy*=vmax/v}top=Math.max(top,Math.min(v,vmax));Q[i][0]=p[0]-vx;Q[i][1]=p[1]-vy}
 calm=hit||top>0.08?0:calm+1;
 mprev=mouse&&mouse.slice();
}
// The cord is solid: two stretches that are far apart along the cord keep at least one band width between their
// centre lines, so the snake can lie against itself but never across itself.
// The band cannot bend tighter than its own half width (× Biegesteifigkeit): two points a stretch s apart along the
// cord stay at least the chord of that smallest circle apart, checked over several distances so it holds at every scale.
function stiffen(n,pin){
 const r=band/2*S.bend,max=Math.floor(Math.PI*r/seg);
 for(let m=2;m<=max;m*=2){const c=2*r*Math.sin(m*seg/(2*r));
  for(let i=0;i+m<n;i++){const a=P[i],b=P[i+m],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1e-6;if(d>=c)continue;
   const k=(c-d)/d,wa=pin(i)?0:pin(i+m)?1:.5,wb=1-wa;a[0]-=dx*k*wa;a[1]-=dy*k*wa;b[0]+=dx*k*wb;b[1]+=dy*k*wb}}
}
function collide(n,pin){
 const cs=band,grid=new Map(),gap=Math.ceil(band*1.6/seg),min2=band*band;
 for(let i=0;i<n;i++){const k=Math.floor(P[i][0]/cs)+','+Math.floor(P[i][1]/cs);(grid.get(k)||grid.set(k,[]).get(k)).push(i)}
 for(let i=0;i<n;i++){const a=P[i],gx=Math.floor(a[0]/cs),gy=Math.floor(a[1]/cs);
  for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const c=grid.get((gx+ox)+','+(gy+oy));if(!c)continue;
   for(const j of c){if(j<i+gap)continue;const b=P[j],dx=b[0]-a[0],dy=b[1]-a[1],d2=dx*dx+dy*dy;if(d2>=min2)continue;
    const d=Math.sqrt(d2)||1e-6,k=(band-d)/d,wa=pin(i)?0:pin(j)?1:.5,wb=1-wa;a[0]-=dx*k*wa;a[1]-=dy*k*wa;b[0]+=dx*k*wb;b[1]+=dy*k*wb}}}
}
function distSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t)}

// ---------- drawing ----------
let cum=[];
function measure(){cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]))}
function at(s){s=Math.max(0,Math.min(cum.at(-1),s));let lo=0,hi=cum.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(cum[m]<=s)lo=m;else hi=m}
 const t=(s-cum[lo])/((cum[hi]-cum[lo])||1),a=P[lo],b=P[hi];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[1]-a[1],b[0]-a[0])]}
function path(s0,s1){ctx.beginPath();const a=at(s0);ctx.moveTo(a[0],a[1]);for(let i=0;i<cum.length;i++)if(cum[i]>s0&&cum[i]<s1)ctx.lineTo(P[i][0],P[i][1]);const b=at(s1);ctx.lineTo(b[0],b[1])}
function glyph(g){if(g.ch===' ')return;const [x,y,a]=at(g.c);ctx.save();ctx.translate(x,y);ctx.rotate(a);
 const off=capH/2+S.baseline*S.size;if(S.bold){ctx.lineWidth=S.bold;ctx.strokeText(g.ch,0,off)}ctx.fillText(g.ch,0,off);ctx.restore()}
let capH=0;
function draw(k){
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(k,0,0,k,origin[0],origin[1]);measure();const end=cum.at(-1);
 if(S.showRegion){ctx.save();ctx.setLineDash([8,8]);ctx.strokeStyle='#f0f';ctx.lineWidth=1;ctx.strokeRect(S.x,S.y,S.w,S.h);ctx.restore()}
 ctx.font=font();ctx.textAlign='center';ctx.lineCap=ctx.lineJoin='round';
 const t=S.upper?'H':'x';capH=ctx.measureText(t).actualBoundingBoxAscent;
 // chunk by chunk, so a later stretch of the snake lies on top of an earlier one where it crosses
 const b=[0,...glyphs.map(g=>g.s0).filter(s=>s>0),end],reach=band/2+S.contour+2;
 for(let k=0;k<b.length-1;k++){
  const s0=b[k],s1=b[k+1],back=Math.max(0,s0-reach);
  if(S.contour>0){ctx.strokeStyle='#fff';ctx.lineWidth=band+2*S.contour;path(s0,s1);ctx.stroke()}
  ctx.strokeStyle='#000';ctx.lineWidth=band;path(back,s1);ctx.stroke();
  ctx.fillStyle=ctx.strokeStyle='#fff';
  for(const g of glyphs)if(g.c>back-S.size&&g.c<s1+S.size*0.5&&g.s0<=s1)glyph(g);
 }
}

const onMove=e=>{if(!svg)return;const r=svg.getBoundingClientRect(),k=r.width/W;mouse=[(e.clientX-r.left)/k,(e.clientY-r.top)/k]};
const onLeave=()=>{mouse=null;mprev=null};
// Mounted by app.js on the desktop home; returns the clean-up that runs when the route changes.
window.homeSnake=target=>{
 if(!target)return()=>{};
 svg=target;cv=document.createElement('canvas');cv.className='home-snake';cv.setAttribute('aria-hidden','true');ctx=cv.getContext('2d');
 svg.after(cv);const id=++run;let last=performance.now(),acc=0;
 document.fonts.load(`400 ${S.size}px ${S.font}`).finally(()=>{if(id!==run)return;build();
  const loop=now=>{if(id!==run)return;acc=Math.min(acc+(now-last),100);last=now;while(acc>=1000/60){step();acc-=1000/60}
   const r=svg.getBoundingClientRect(),d=devicePixelRatio||1,vw=innerWidth,vh=innerHeight,s=r.width/W,w=Math.round(vw*d),h=Math.round(vh*d);
   view=[-r.left/s,-r.top/s,(vw-r.left)/s,(vh-r.top)/s];origin=[r.left*d,r.top*d];
   Object.assign(cv.style,{left:'0px',top:'0px',width:vw+'px',height:vh+'px'});
   if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
   draw(r.width/W*d);requestAnimationFrame(loop)};
  requestAnimationFrame(loop)});
 addEventListener('pointermove',onMove);document.addEventListener('pointerleave',onLeave);
 return()=>{run++;cv.remove();svg=null;mouse=mprev=null;removeEventListener('pointermove',onMove);document.removeEventListener('pointerleave',onLeave)};
};
})();
