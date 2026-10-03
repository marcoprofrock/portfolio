// The black head and the round buttons, laid over what app.js draws. app.js rebuilds header and footer on every
// route; whatever it adds here is dressed again: header black with white text, each link in a white rounded outline,
// footer links as black buttons with the same outline, and every text 1 px below its drawn size (20 → 19, 30 → 29).
(()=>{
 const NS='http://www.w3.org/2000/svg',RIGHT=1893.62,MOBILE_RIGHT=473.01,GAP=10;
 // The route app.js settled on (an unknown address becomes home), not the raw address.
 const isProject=()=>!['','home','archive','diary','vita','contact','imprint'].includes(document.querySelector('main')?.dataset.route??(location.hash||'#home').slice(1));
 const set=(node,attributes)=>{for(const [k,v] of Object.entries(attributes))node.setAttribute(k,v);return node};
 // An outline around a link's text: as tall as the text plus 6 (12 on mobile), ends round.
 const pill=(a,t,mobile,fill)=>{
  const b=t.getBBox(),px=mobile?14:10,py=mobile?9:6;
  a.insertBefore(set(document.createElementNS(NS,'rect'),{x:b.x-px,y:b.y-py,width:b.width+2*px,height:b.height+2*py,rx:(b.height+2*py)/2,
   fill,stroke:'#fff','stroke-width':mobile?1.5:1,'class':'look-pill'}),t);
 };
 const dressHeader=()=>{
  const svg=document.querySelector('header svg');if(!svg||svg.dataset.dressed)return;svg.dataset.dressed=1;
  const view=svg.viewBox.baseVal,mobile=view.width<1000,h=mobile?93.67:61;
  // The header itself is black everywhere: Safari carries its colour into the space above the page when it swings
  // past the top, and that should be black (Marco, 03.10.). On mobile the header also holds the list head below the
  // bar, which stays white on a white rect of its own.
  document.querySelector('header').classList.add('look-dark');
  const first=[...svg.children].find(n=>n.tagName==='a'||n.tagName==='line');
  if(mobile&&view.height>h)svg.insertBefore(set(document.createElementNS(NS,'rect'),{x:0,y:h,width:view.width,height:view.height-h,fill:'#fff','class':'look-bar'}),first||null);
  svg.insertBefore(set(document.createElementNS(NS,'rect'),{x:0,y:0,width:view.width,height:h,fill:'#000','class':'look-bar'}),first||null);
  // The rule under the bar goes; the lines of the menu button stay.
  svg.querySelectorAll(':scope>line').forEach(l=>{if(+l.getAttribute('y1')<=h+1&&l.getAttribute('x2')-l.getAttribute('x1')>300)l.style.display='none'});
  if(!mobile){
   // Project pages: “back” to the archive, the next button after marco pröfrock.
   const home=svg.querySelector('a[href="#home"] text');
   if(isProject()&&home&&!svg.querySelector('.look-back')){
    const b=home.getBBox(),link=set(document.createElementNS(NS,'a'),{href:'#archive','class':'look-back'});
    const t=set(document.createElementNS(NS,'text'),{x:(b.x+b.width+10+GAP+10).toFixed(2),y:home.getAttribute('y')});
    t.dataset.shrunk=1;t.style.fontSize=getComputedStyle(home).fontSize;t.textContent='back';
    link.append(t);svg.append(link);
   }
   // archive, diary and vita close together, the last outline flush with the right edge of the page.
   const nav=[...svg.querySelectorAll('a')].filter(a=>a.getAttribute('href')!=='#home'&&!a.classList.contains('look-back'))
    .map(a=>a.querySelector('text')).filter(Boolean).sort((p,q)=>+(p.dataset.x0??=p.getAttribute('x'))-+(q.dataset.x0??=q.getAttribute('x')));
   let right=RIGHT;
   for(const t of nav.reverse()){const w=t.getBBox().width;right-=10;t.setAttribute('x',(right-w).toFixed(2));right-=w+10+GAP}
  }
  svg.querySelectorAll('a').forEach(a=>{
   const t=a.querySelector('text');if(!t||t.getBBox().y>h)return;
   t.classList.add('look-white');pill(a,t,mobile,'none');
  });
  // The page you are on (Marco, 03.10.): its button is not greyed but drops out of the bar — black, with the white
  // outline, its middle on the bar's lower edge. Same place across, only lower. Safari clips the head's drawing at
  // its edge whatever overflow says, so the dropped button lives in a drawing of its own, twice as deep, laid over
  // the head; the original stays in its place, hidden, so the buttons beside it keep their spacing.
  const current=!mobile&&svg.querySelector('a[aria-current="page"]:not([href="#home"])');
  const r=current&&current.querySelector('.look-pill');
  if(r){
   const drop=set(document.createElementNS(NS,'svg'),{viewBox:`0 0 ${view.width} ${2*h}`,'class':'look-drop'});
   const copy=current.cloneNode(true);copy.classList.add('look-current');
   copy.querySelector('.look-pill').setAttribute('fill','#000');
   copy.setAttribute('transform',`translate(0 ${(h-(+r.getAttribute('y')+ +r.getAttribute('height')/2)).toFixed(2)})`);
   current.style.visibility='hidden';drop.append(copy);svg.parentNode.append(drop);
  }
 };
 const dressFooter=()=>{
  const svg=document.querySelector('footer svg');if(!svg||svg.dataset.dressed)return;svg.dataset.dressed=1;
  const mobile=svg.viewBox.baseVal.width<1000;
  // A row of footer links (contact, imprint) closes up from the right edge as in the head.
  if(svg.classList.contains('look-row')&&!mobile){
   let right=RIGHT;
   for(const t of [...svg.querySelectorAll('a text')].reverse()){const w=t.getBBox().width;right-=10;t.setAttribute('text-anchor','start');t.setAttribute('x',(right-w).toFixed(2));right-=w+10+GAP}
  }
  // On a phone the links on the right close up from 473.01, where the head's outlines end on the left at 25.16.
  if(mobile){
   let right=MOBILE_RIGHT;
   for(const t of [...svg.querySelectorAll('a text[text-anchor="end"]')].reverse()){const w=t.getBBox().width;right-=14;t.setAttribute('x',right.toFixed(2));right-=w+14+GAP}
  }
  svg.querySelectorAll('a:not(.demo-link)').forEach(a=>{
   const t=a.querySelector('text');if(!t||!t.getBBox().width)return;
   // As in the header, an outline on the right ends flush with the edge of the page.
   const b=t.getBBox(),over=b.x+b.width+(mobile?14:10)-RIGHT;
   if(!mobile&&over>.5)t.setAttribute('x',(+t.getAttribute('x')-over).toFixed(2));
   pill(a,t,mobile,'#000');
  });
 };
 // Every text 1 px smaller than drawn. Safari reports font sizes with the zoom of main already in them, Chrome
 // does not; a 100 px probe in the same SVG gives the factor, so the drawn size is always the starting point.
 const shrink=root=>{
  const nodes=[...(root.querySelectorAll?root.querySelectorAll('text,tspan'):[])];
  if(root.matches&&root.matches('text,tspan'))nodes.unshift(root);
  const fresh=nodes.filter(n=>!n.dataset.shrunk),zooms=new Map();
  const zoomOf=n=>{const svg=n.ownerSVGElement||n.closest('svg');if(!svg)return 1;if(zooms.has(svg))return zooms.get(svg);
   const probe=set(document.createElementNS(NS,'text'),{'font-size':100});probe.style.fontSize='100px';svg.append(probe);
   const z=parseFloat(getComputedStyle(probe).fontSize)/100||1;probe.remove();zooms.set(svg,z);return z};
  const size=n=>parseFloat(getComputedStyle(n).fontSize)/zoomOf(n);
  // A tspan only gets its own size where it had one; otherwise it follows its text.
  const plan=fresh.map(n=>{const own=size(n),parent=n.parentElement&&n.parentElement.closest('text')?size(n.parentElement):own;
   return [n,Math.round(own*100)/100,n.tagName==='text'||Math.abs(own-parent)>.01]});
  for(const [n,own,mine] of plan){n.dataset.shrunk=1;if(mine&&own>1)n.style.fontSize=(own-1)+'px'}
 };
 const redress=()=>{
  document.querySelectorAll('.look-drop').forEach(n=>n.remove());
  document.querySelectorAll('header a[style*="visibility"]').forEach(a=>a.style.visibility='');
  for(const svg of document.querySelectorAll('header svg,footer svg')){delete svg.dataset.dressed;svg.querySelectorAll('.look-bar,.look-pill').forEach(n=>n.remove())}
  dressHeader();dressFooter();
 };
 document.addEventListener('DOMContentLoaded',()=>{
  new MutationObserver(list=>{for(const m of list)m.addedNodes.forEach(n=>n.nodeType===1&&shrink(n));dressHeader();dressFooter()})
   .observe(document.body,{childList:true,subtree:true});
  shrink(document.body);dressHeader();dressFooter();
  // Outlines measured before the face arrived would be too narrow.
  document.fonts.ready.then(redress);
 });
})();
