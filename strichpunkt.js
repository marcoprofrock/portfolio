// strichpunkt (Marco, 16.11.2026): an application page at /strichpunkt/ — the start page made out to Strichpunkt.
// Version 2 (Marco, 16.11.: "a try"): everything below the head in the manner of sp.design — their typeface Strichpunkt
// Sans (OFL, self-hosted in assets/fonts), their colours, radii, type styles and grid (taken from their stylesheet at a
// 1920 wide screen). The head of the site stays as it is. Version 1 (Serie 57, the home composition) is kept in
// tmp/strichpunkt-v1-20261116.
// Big: DESIGN* — the job applied for; the asterisk is resolved in small print underneath.
// Text (Marco, 16.11.): German — the page is taken from sp.design, the work underneath is not. A switch in the letter
// (“specs zeigen”) lays the analysis over the page like a redline: grid, type, colours, distances, radii — all read from
// the page itself at that moment (getComputedStyle / getBoundingClientRect), nothing written in by hand.
// The third case lies behind the archive password: until it is given, its frame shows only the password field, and
// neither its name nor its address is anywhere in this file — it is read from the opened private area (app.js).
// Values not drawn by Marco: see README "strichpunkt".
(()=>{
 const greeting='hi strichpunkt :)',title='ich bin marco.',claim='design*',footnote='*dieser seite ist geklaut. die arbeiten darunter nicht.';
 const letter=[
  'ihr sucht jemanden, der marken versteht. also hab ich mir eure mal angesehen.',
  'aber eine marke ist mehr als ihr design. der rest heißt culture, und die lässt sich nicht nachbauen. ob wir da zusammenpassen, finden wir am besten in einem gespräch raus.'];
 const open=[['500l/s','#500ls','assets/projects/500ls/00_showreel'],['sentry','#sentry','assets/projects/sentry/02_showreel']];
 // The portrait keeps the crop of the home page (index.svg): 207.47 × 262.03 of the picture drawn 240 × 300, 24.5 in.
 const CROP={x:24.5/240,w:207.47/240,ratio:262.03/207.47};
 // sp.design's grid at 1920 (their stylesheet): the page margin is --sp-layout-body-padding (xl = 32), and the same 32
 // is the padding of their newsletter block — the text sits as far from the edge of the colour field as from the edge
 // of the page (once, not doubled). That block has three equal columns (repeat(3,1fr)) with the gap md = 20; the
 // gap between content pieces is lg = 24; their header has 32 above and below. All on a 4/8 base. The page uses that:
 // DESIGN* over columns 1–2, the letter in column 3 (where their form sits), the cases on the three columns of the band.
 const PAD=32,GUT=20,GAP=24,COL=(1920-2*PAD-2*GUT)/3,colX=i=>PAD+i*(COL+GUT);
 // The band (Marco, 16.11.: lower and flatter): the cases end 48 above the foot, the band starts 32 (its padding) above them.
 const FOOT=1080-58.08,H=COL*9/16,TOP=FOOT-48-H,BAND=TOP-PAD;
 // Vertically: the head ends at 93 (banner 32 + head 61); 32 below it “to: SP”, 24 lower DESIGN*; letter and portrait at 200.
 // DESIGN*, portrait and letter stand low (Marco, 16.11., once the second paragraph was gone): the footnote ends 48
 // (sp 3xl) above the band, the portrait and letter start on the top of DESIGN*'s box; set once DESIGN* has its size.
 const HEAD=93,TO=HEAD+PAD,PORTRAIT=150;
 let specsOn=false,placeMore=()=>{};
 // Measuring (Marco, 16.11.): Google Analytics 4 through the site's own track() (app.js), so only after “accept
 // cookies” and only on marco.ad. Events, all with page: strichpunkt —
 //   sp_case_view   project, how (hover | scroll), seconds — how long a case was looked at (hover on the desktop,
 //                  at least 60 % in view on a phone); under 0.3 s (desktop) or 1 s (phone) is not counted
 //   sp_case_open   project — a case clicked
 //   sp_specs       state (on | off), seconds when switched off — the specs view
 //   sp_contact_open / sp_contact_link (link_type) — the contact block and what was clicked in it
 //   sp_banner_click, sp_more_work, sp_unlock (result ok | wrong)
 // The project behind the password is always reported as “confidential”, never by its name.
 const ga=(name,params={})=>{try{track(name,{page:'strichpunkt',...params})}catch{}};
 const secs=ms=>Math.round(ms/100)/10;
 let specsSince=0;
 // Views still running when the tab is hidden or left are reported then.
 const running=new Map();
 const endView=(key,how)=>{const v=running.get(key);if(!v)return;running.delete(key);const ms=performance.now()-v.since;
  if(ms>=(how==='hover'?300:1000))ga('sp_case_view',{project:v.project,how,seconds:secs(ms)})};
 const flushViews=()=>{for(const [key,v] of [...running])endView(key,v.how)};
 addEventListener('pagehide',flushViews);document.addEventListener('visibilitychange',()=>{if(document.hidden)flushViews()});
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const zoom=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale'))||1;
 const px=n=>n+'px';
 const el=(tag,cls,style={},html='')=>{const n=document.createElement(tag);if(cls)n.className=cls;Object.assign(n.style,style);n.innerHTML=html;return n};
 const at=(node,left,top,more={})=>{Object.assign(node.style,{left:px(left),top:px(top)},more);return node};
 // How far the asterisk's ink ends above the baseline, as a share of the font size (black, widest cut).
 const asteriskRise=(()=>{let k=null;return ()=>{if(k!==null)return k;
  const c=document.createElement('canvas');c.width=400;c.height=300;const x=c.getContext('2d');
  x.font='900 ultra-expanded 100px "Strichpunkt Sans"';x.fillStyle='#000';x.textBaseline='alphabetic';x.fillText('*',100,200);
  const d=x.getImageData(0,0,400,300).data;let bottom=-1;
  for(let y=299;y>=0&&bottom<0;y--)for(let xx=0;xx<400;xx++)if(d[(y*400+xx)*4+3]>40){bottom=y;break}
  const v=bottom<0?.38:(200-bottom-1)/100;if(document.fonts?.check('900 100px "Strichpunkt Sans"'))k=v;return v}})();
 // The project behind the password, once this tab has opened the area: its row, reel and still.
 const sealed=()=>{
  const project=projects?.find(p=>privateArea?.routes.includes(p.url.slice(1)));if(!project)return null;
  const slug=project.url.slice(1),reel=Object.keys(privateArea.files).find(f=>f.startsWith(`/assets/projects/${slug}/`)&&/showreel\.mp4$/.test(f));
  const file=reel?.slice(1,-4),still=file&&privateArea.files[`/${file}.webp`]?`${file}.webp`:project.preview;
  return [project.title,project.url,file,still];
 };
 const portrait=width=>el('div','sp-portrait',{width:px(width),height:px(width*CROP.ratio)},
  `<img src="assets/portrait/DSC02321.png" alt="Marco Pröfrock" style="width:${100/CROP.w}%;left:${-CROP.x/CROP.w*100}%">`);
 // “to:” and Strichpunkt's mark, the mark as high as a capital of the line (strichpunkt.css).
 const addressee=()=>el('div','sp-to sp-heading',{},`to: <svg viewBox="0 0 2036 1000" role="img" aria-label="strichpunkt">${strichpunktMark}</svg>`);
 // The letter: greeting and “ich bin marco.” as a heading, then the body; the first paragraph ends with the switch,
 // a pill like the head's buttons (archive, diary, vita).
 const letterBlock=()=>{
  const box=el('div','sp-letter',{},`<p class="sp-heading">${greeting}<br>${title}</p>${letter.map(p=>`<p class="sp-body">${p.replace(/&/g,'&amp;')}</p>`).join('')}`);
  box.lang='de';
  const toggle=el('button','sp-pill sp-toggle',{},'specs zeigen');toggle.type='button';
  toggle.addEventListener('click',()=>setSpecs(!specsOn));
  box.querySelector('.sp-body').append(' ',toggle);
  // The last paragraph ends with a pill “contact” (Marco, 16.11.): it does not leave the page but opens the contact
  // details right under the letter, in a block of the accent purple in the manner of the specs.
  const contact=el('button','sp-pill sp-contact',{},'contact');contact.type='button';
  contact.setAttribute('aria-expanded','false');contact.setAttribute('aria-controls','sp-contact-card');
  contact.addEventListener('click',()=>contactCard(contact));
  box.querySelector('.sp-body:last-child').append(' ',contact);
  return box;
 };
 // The contact details, taken from the site's contact page (app.js, infoPages.contact) so they never differ:
 // label and value per row, the values as links. Under the pill, as wide as the letter; Escape, the cross or the pill
 // again close it.
 const contactCard=pill=>{
  const open=main.querySelector('.sp-contact-card');
  if(open){open.remove();pill.setAttribute('aria-expanded','false');return}
  ga('sp_contact_open');
  const rows=(typeof infoPages!=='undefined'&&infoPages.contact?.[0]?.[1])||[];
  const card=el('div','sp-contact-card',{},`<button type="button" class="sp-contact-close" aria-label="schließen"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="#000" stroke-width="1.2"/></svg></button><dl>${rows.map(([label,value,href])=>`<dt>${label}</dt><dd>${href?`<a href="${href}"${/^https?:/.test(href)?' target="_blank" rel="noopener"':''}>${value}</a>`:value}</dd>`).join('')}</dl>`);
  card.id='sp-contact-card';card.setAttribute('role','region');card.setAttribute('aria-label','contact');
  const close=()=>{card.remove();pill.setAttribute('aria-expanded','false');pill.focus()};
  card.querySelector('.sp-contact-close').addEventListener('click',close);
  card.querySelectorAll('dd a').forEach(link=>link.addEventListener('click',()=>ga('sp_contact_link',{link_type:link.closest('dd').previousElementSibling.textContent})));
  card.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
  main.append(card);pill.setAttribute('aria-expanded','true');
  // Placed in the units of main: under the pill, from the letter's left edge to its right edge.
  const z=zoom(),m=main.getBoundingClientRect(),p=pill.getBoundingClientRect(),letterBox=main.querySelector('.sp-letter').getBoundingClientRect();
  at(card,(letterBox.left-m.left)/z,(p.bottom-m.top)/z+12,{width:px(letterBox.width/z)});
  card.querySelector('a')?.focus({preventScroll:true});
 };
 // DESIGN* as wide as columns 1–2: measured in the face once it has arrived, then set to that width.
 const claimBlock=(width,onFit)=>{
  const box=el('div','sp-claim'),big=el('div','sp-display',{},claim),small=el('p','sp-footnote',{},footnote);
  box.lang='de';box.append(big,small);
  box.fit=()=>{if(!big.isConnected)return;big.style.fontSize='100px';const w=big.getBoundingClientRect().width;if(w)big.style.fontSize=px(100*width*zoom()/w);onFit?.(box);if(specsOn)specs()};
  requestAnimationFrame(box.fit);
  document.fonts?.load('900 100px "Strichpunkt Sans"').then(box.fit).catch(()=>{});
  return box;
 };

 // The site's navigation as sp.design would set it (Marco, 16.11.): shown only with the specs, in place of the head and
 // foot (which are Marco's design and step aside then). Their desktop nav: the mark left, the links right with gap 16,
 // each link 14 / line 1.4, medium, padding 12, a 1 px clear border, radius 4, the current one and hover on the subtle
 // grey; the page margin 32 at the sides. Here “marco pröfrock” stands where their mark stands, the SP mark is the
 // current page, then archive, diary, vita. Their foot links are text links: 16, underlined 1 px in purple, offset 4.
 // On a phone: the name and their square menu button (subtle grey, radius 4, two bars), which opens the site's menu.
 const spNav=phone=>{
  const nav=el('nav','sp-nav');nav.setAttribute('aria-label','navigation');
  nav.innerHTML=`<a class="sp-nav-name" href="#home">marco pröfrock</a>`+(phone
   ?`<button type="button" class="sp-nav-toggle" aria-label="menü öffnen"><span></span><span></span></button>`
   :`<div class="sp-nav-items"><a href="#strichpunkt" aria-current="page" aria-label="strichpunkt"><svg viewBox="0 0 2036 1000" aria-hidden="true">${strichpunktMark}</svg></a><a href="#archive">archive</a><a href="#diary">diary</a><a href="#vita">vita</a></div>`);
  nav.querySelector('.sp-nav-toggle')?.addEventListener('click',()=>window.openMenu?.());
  return nav;
 };
 const spFoot=()=>el('nav','sp-foot',{},'<a href="#contact">contact</a><a href="#imprint">imprint</a>');

 // ---------------------------------------------------------------------------------------------------------- specs
 // The specs (Marco, 16.11.): the proof that the system was understood, not only copied. A layer over the page that
 // takes no pointer and moves nothing: the columns and gutters, labels with family, weight, width, size/line height
 // and tracking at the main texts, the colours with swatches, dimension lines for the central distances, the radii.
 // Hairlines and small lowercase labels in a monospace face, in the banner's purple. Every value is read from the page
 // when the layer is drawn, again after a resize. Phone (≤ 768): only type and colour labels. Off on every load.
 const fmt=(n,d=1)=>String(+(+n).toFixed(d));
 const hex=c=>{
  const m=c.match(/rgba?\(([^)]+)\)/)||c.match(/color\(srgb ([^)]+)\)/);if(!m)return c;
  const parts=m[1].replace(/\//,' ').split(/[\s,]+/).filter(Boolean).map(Number),srgb=/color\(srgb/.test(c);
  const [r,g,b]=parts.slice(0,3).map(v=>Math.round(srgb?v*255:v)),a=parts[3];
  const h='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  return a!==undefined&&a<1?`${h} · ${Math.round(a*100)} %`:h;
 };
 const setSpecs=on=>{
  if(on!==specsOn){if(on){specsSince=performance.now();ga('sp_specs',{state:'on'})}else ga('sp_specs',{state:'off',seconds:secs(performance.now()-specsSince)})}
  specsOn=on;
  for(const t of main.querySelectorAll('.sp-toggle')){t.textContent=on?'specs ausblenden':'specs zeigen';t.setAttribute('aria-pressed',on)}
  specs();
 };
 // Escape hides them; a resize draws them again (the layout itself is redrawn by app.js across 768).
 document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!main.classList.contains('sp-page'))return;
  const card=main.querySelector('.sp-contact-card');if(card){card.remove();main.querySelector('.sp-contact')?.setAttribute('aria-expanded','false');return}
  if(specsOn)setSpecs(false)});
 let resizeTimer=0;
 window.addEventListener('resize',()=>{if(!specsOn)return;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>main.classList.contains('sp-page')&&specs(),150)});
 const specs=()=>{
  const old=main.querySelector('.sp-specs');
  main.classList.toggle('sp-specs-on',specsOn&&main.classList.contains('sp-page'));
  if(!specsOn||!main.classList.contains('sp-page')){
   if(old){old.classList.remove('on');setTimeout(()=>old.remove(),reduced()?0:200)}
   return;
  }
  old?.remove();
  // “see more work” stands where the pill is before anything is measured.
  placeMore(true);
  const phone=document.body.classList.contains('mobile'),z=zoom(),m=main.getBoundingClientRect();
  const W=m.width/z,Hh=Math.max(m.height/z,phone?0:1080);
  // Sizes in the units of main: a probe tells whether this browser reports them with the zoom already applied.
  const probe=el('span','',{fontSize:'100px',position:'absolute'});main.append(probe);const unit=parseFloat(getComputedStyle(probe).fontSize)/100||1;probe.remove();
  const box=node=>{const r=node.getBoundingClientRect();return {l:(r.left-m.left)/z,t:(r.top-m.top)/z,r:(r.right-m.left)/z,b:(r.bottom-m.top)/z}};
  const layer=el('div','sp-specs',{width:px(W),height:px(Hh)}),svg=svgNode('svg',{viewBox:`0 0 ${W} ${Hh}`,width:W,height:Hh});
  layer.append(svg);main.append(layer);
  const line=(x1,y1,x2,y2,cls='')=>svg.append(svgNode('line',{x1,y1,x2,y2,'class':cls}));
  // Labels go where nothing else is: not over another label, not over the page's texts, inside the page, never under
  // the head. Tried close beside their piece first, then further out with a hairline leading back to it.
  const placed=[],keepOut=[];
  const hits=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
  // The head and foot of the site (Marco's, not sp.design's) are hidden while the specs show (strichpunkt.css), so
  // labels may use their place; on a phone the flow keeps the head's height free anyway.
  if(phone)keepOut.push({l:0,t:0,r:W,b:93.67+4});
  const label=(text,target,prefs=['above','below','right','left'],own=null,cls='')=>{
   const tag=el('span','sp-label'+(cls?' '+cls:''),{},text);layer.append(tag);
   const r0=tag.getBoundingClientRect(),w=r0.width/z,h=r0.height/z;
   // Close beside the piece in the preferred directions first, then in every direction further out; along each side
   // at its start, its end and in between.
   const spots=[],along=(a0,a1,n=5)=>Array.from({length:n},(_,i)=>a0+(a1-a0)*i/(n-1));
   const around=(d,p)=>{
    if(p==='inside')return d===6?[[target.l+8,(target.t+target.b-h)/2]]:[];
    if(p==='inside-top')return d===6?[[target.l+8,target.t+8]]:[];
    // A spot worked out by the caller from the label's own size.
    if(typeof p==='function')return d===6?[p(w,h)]:[];
    if(p==='below-center')return [[(target.l+target.r-w)/2,target.b+d]];
    const xs=[target.l,target.r-w,...along(target.l-w+40,target.r-40,9),target.l-w-160,target.l-w-320,target.r+160];
    if(p==='above')return xs.map(x=>[x,target.t-d-h]);
    if(p==='below')return xs.map(x=>[x,target.b+d]);
    if(p==='right')return along(target.t,target.b-h).map(y=>[target.r+d,y]);
    if(p==='left')return along(target.t,target.b-h).map(y=>[target.l-d-w,y]);
   };
   for(const d of [6,16,32,56,88,128,176,240,320])for(const p of prefs)spots.push(...around(d,p));
   for(const d of [6,16,32,56,88,128,176,240,320,420])for(const p of ['above','below','right','left'])spots.push(...around(d,p));
   const ok=([x,y])=>{const r={l:x,t:y,r:x+w,b:y+h};return x>=4&&y>=0&&x+w<=W-4&&y+h<=Hh-4&&!placed.some(q=>hits(q,r))&&!keepOut.some(q=>!(Array.isArray(own)?own.includes(q):q===own)&&hits(q,r))};
   const clamp=([x,y])=>[Math.min(Math.max(x,4),W-4-w),Math.min(Math.max(y,0),Hh-4-h)];
   const [x,y]=spots.find(ok)||clamp(spots[0]);
   at(tag,x,y);const r={l:x,t:y,r:x+w,b:y+h};placed.push(r);
   // A label away from its piece gets a hairline to it.
   const gapX=Math.max(target.l-r.r,r.l-target.r,0),gapY=Math.max(target.t-r.b,r.t-target.b,0);
   if(gapX>10||gapY>10){
    const cx=Math.min(Math.max((r.l+r.r)/2,target.l),target.r),cy=Math.min(Math.max((r.t+r.b)/2,target.t),target.b);
    const lx=Math.min(Math.max(cx,r.l),r.r),ly=gapY>0?(r.b<target.t?r.b:r.t):(r.t+r.b)/2;
    line(lx,ly,cx,cy,'sp-leader');
   }
   return tag;
  };
  // Type as the browser has set it.
  const type=node=>{
   const cs=getComputedStyle(node),family=cs.fontFamily.split(',')[0].replace(/["']/g,'').toLowerCase();
   const size=parseFloat(cs.fontSize)/unit,lh=cs.lineHeight==='normal'?'normal':fmt(parseFloat(cs.lineHeight)/unit);
   const ls=cs.letterSpacing==='normal'?0:parseFloat(cs.letterSpacing)/unit,stretch=cs.fontStretch==='normal'?'100%':cs.fontStretch;
   // On a phone one short line (the family stands in the colour label): weight · width · size/line · tracking.
   if(phone)return `${cs.fontWeight} · ${stretch.replace('%',' %')} · ${fmt(size)}/${lh}${ls?` · ${ls>0?'+':''}${fmt(ls/size,3)} em`:''}${cs.textTransform==='uppercase'?' · versal':''}`;
   return `${family} ${cs.fontWeight} · breite ${stretch.replace('%',' %')} · ${fmt(size)}/${lh} px · laufweite ${ls?`${ls>0?'+':''}${fmt(ls/size,3)} em`:'0'}${cs.textTransform==='uppercase'?' · versal':''}`;
  };
  // Radii by sp.design's tokens where they match (--sp-border-radius-sm 4, -md 8).
  const radius=node=>{const v=parseFloat(getComputedStyle(node).borderTopLeftRadius)/unit;return v>=999?'pill (½ höhe)':`${({4:'border-radius-sm ',8:'border-radius-md '})[Math.round(v)]||''}${fmt(v)} px`};
  // The texts are what labels keep clear of.
  const q=s=>main.querySelector(s);
  const pieces={banner:q('.sp-banner span'),cta:q('.sp-banner a'),to:q('.sp-to'),display:q('.sp-display'),note:q('.sp-footnote'),head:q('.sp-letter .sp-heading'),
   body:phone?q('.sp-letter .sp-body:last-child'):q('.sp-letter .sp-body'),more:q('.sp-more'),portrait:q('.sp-portrait'),frame:q('.sp-frame'),name:q('.sp-name'),field:q('.sp-unlock input'),button:q('.sp-unlock button'),toggle:q('.sp-toggle')};
  const rect={};for(const [k,n] of Object.entries(pieces))if(n)rect[k]=box(n);
  if(rect.banner)rect.banner=box(q('.sp-banner'));
  for(const n of main.querySelectorAll('.sp-nav,.sp-nav-name,.sp-nav-items a,.sp-nav-toggle,.sp-foot a,.sp-banner,.sp-banner>span,.sp-banner>a,.sp-to,.sp-display,.sp-footnote,.sp-letter p,.sp-portrait,.sp-frame,.sp-name,.sp-unlock'))keepOut.push(box(n));
  // Every text block in a dashed hairline (Marco, 16.11.), the box the browser has given it.
  for(const n of main.querySelectorAll('.sp-banner>span,.sp-banner>a,.sp-to,.sp-display,.sp-footnote,.sp-letter p,.sp-name')){
   const b=box(n);layer.append(at(el('div','sp-box',{width:px(b.r-b.l),height:px(b.b-b.t)}),b.l,b.t));
  }
  // The colours, with swatches, read from the page; set beside the footnote with the other labels (below).
  const page=getComputedStyle(document.body).backgroundColor,ink=getComputedStyle(main).color;
  const swatches=[['background-primary',page],['foreground-primary',ink],['background-accent',pieces.banner&&getComputedStyle(q('.sp-banner')).backgroundColor],['foreground-subtle',pieces.note&&getComputedStyle(pieces.note).color],
   ['border-subtle',pieces.field&&getComputedStyle(pieces.field).borderTopColor],['background-subtle',pieces.field&&getComputedStyle(pieces.field).backgroundColor]].filter(c=>c[1])
   .map(([n,c])=>`<span><i style="background:${c}"></i>${n} ${hex(c)}</span>`).join('');
  // The footnote's own line, not its whole block (the block is as wide as DESIGN*).
  const noteLine=(()=>{if(!pieces.note)return null;const r=document.createRange();r.selectNodeContents(pieces.note);return box(r)})();
  // Distances first, as geometry: their lines are drawn now and kept clear of labels; their values are set last.
  const dims=[];
  const dim=(x1,y1,x2,y2,text,prefs)=>{
   line(x1,y1,x2,y2,'sp-dim');
   if(y1===y2){line(x1,y1-4,x1,y1+4,'sp-dim');line(x2,y2-4,x2,y2+4,'sp-dim')}else{line(x1-4,y1,x1+4,y1,'sp-dim');line(x2-4,y2,x2+4,y2,'sp-dim')}
   const r={l:Math.min(x1,x2)-4,t:Math.min(y1,y2)-4,r:Math.max(x1,x2)+4,b:Math.max(y1,y2)+4};keepOut.push(r);dims.push([text,r,prefs]);
  };
  let grid=null;
  if(!phone){
   // Grid: the columns the cases stand on, over the whole height; the gutters between stay clear.
   const cards=[...main.querySelectorAll('.sp-case')].map(box);
   for(const c of cards)layer.prepend(at(el('div','sp-column',{width:px(c.r-c.l),height:px(Hh)}),c.l,0));
   if(cards.length===3){
    const gut=cards[1].l-cards[0].r,margin=cards[0].l,col=cards[0].r-cards[0].l,band=box(q('.sp-band')),y=band.t-14;
    grid=[`grid · repeat(3, 1fr) à ${fmt(col)} px · gap size-md ${fmt(gut)} px · layout-body-padding ${fmt(margin)} px`,{l:margin,t:band.t-40,r:margin+10,b:band.t-30}];
    // Margin left and right, the gutter, the band's padding (text to the edge of the colour field).
    dim(0,y,margin,y,`layout-body-padding ${fmt(margin)} px`,['above','right']);
    dim(cards[2].r,y,W,y,`layout-body-padding ${fmt(W-cards[2].r)} px`,['above','left']);
    dim(cards[0].r,cards[0].t-10,cards[1].l,cards[0].t-10,`gap size-md ${fmt(gut)} px`,['above','right']);
    dim(cards[1].l+col/2,band.t,cards[1].l+col/2,cards[1].t,`padding = layout-body-padding ${fmt(cards[1].t-band.t)} px`,['right']);
   }
   // Distances without words, as in a technical drawing (Marco, 16.11.): the gaps between the nav links, and between
   // each case picture and its title (beside the title's words).
   const mark=(x1,y1,x2,y2)=>{
    line(x1,y1,x2,y2,'sp-dim');
    if(y1===y2){line(x1,y1-4,x1,y1+4,'sp-dim');line(x2,y2-4,x2,y2+4,'sp-dim')}else{line(x1-4,y1,x1+4,y1,'sp-dim');line(x2-4,y2,x2+4,y2,'sp-dim')}
    keepOut.push({l:Math.min(x1,x2)-4,t:Math.min(y1,y2)-4,r:Math.max(x1,x2)+4,b:Math.max(y1,y2)+4});
   };
   const links=[...main.querySelectorAll('.sp-nav-items a')].map(box);
   for(let i=0;i+1<links.length;i++){const y=links[i].b+8;mark(links[i].r,y,links[i+1].l,y)}
   for(const card of main.querySelectorAll('.sp-case')){
    const pic=card.querySelector('.sp-frame'),name=card.querySelector('.sp-name');if(!pic||!name)continue;
    const words=document.createRange();words.selectNodeContents(name);
    const f=box(pic),w=box(words),x=w.r+16;mark(x,f.b,x,box(name).t);
   }
   // DESIGN* to its footnote.
   if(rect.display&&rect.note)dim(rect.display.r-24,rect.display.b,rect.display.r-24,rect.note.t,`size-lg ${fmt(rect.note.t-rect.display.b)} px`,['left','right','below']);
  }
  // The grid's label first, so it gets its place beside the band's top edge.
  if(grid)label(grid[0],grid[1],['below','above']);
  // Type, colour and radius labels at the main pieces (the ones of the brief: headline, footnote, letter heading and
  // body, banner, case titles; radii of the cards). A label may touch its own piece, never another's.
  const add=(k,text,prefs,cls)=>{if(!rect[k])return;const own=keepOut.find(r=>Math.abs(r.l-rect[k].l)<.5&&Math.abs(r.t-rect[k].t)<.5&&Math.abs(r.r-rect[k].r)<.5)||null;label(text,rect[k],prefs,own,cls)};
  const bannerText=rect.banner&&`pre-header · ${type(pieces.banner)} · ${hex(getComputedStyle(q('.sp-banner')).backgroundColor)} · höhe ${fmt(rect.banner.b-rect.banner.t)} px`;
  // On a desktop straight under the banner, centred, in the empty middle of the nav (its name and links stay clear).
  const same=a=>b=>Math.abs(a.l-b.l)<.5&&Math.abs(a.t-b.t)<.5&&Math.abs(a.r-b.r)<.5&&Math.abs(a.b-b.b)<.5;
  if(rect.banner&&!phone&&q('.sp-nav'))label(bannerText,rect.banner,['below-center','below'],[keepOut.find(same(rect.banner)),keepOut.find(same(box(q('.sp-nav'))))],'sp-label-line');
  else add('banner',bannerText,phone?['below']:['inside','below'],phone?'sp-label-wrap':'sp-label-line');
  // The navigation in sp.design's manner (only while the specs show).
  const navLink=q('.sp-nav-items a:not([aria-current])'),navCurrent=q('.sp-nav-items a[aria-current]');
  if(!phone&&navLink){
   const cs=getComputedStyle(navLink),items=box(q('.sp-nav-items'));
   label(`nav-items a · ${type(navLink)} · padding ${fmt(parseFloat(cs.paddingTop)/unit)} px · ${radius(navLink)} · gap ${fmt(parseFloat(getComputedStyle(q('.sp-nav-items')).columnGap)/unit)} px · aktiv ${hex(getComputedStyle(navCurrent).backgroundColor)}`,items,['below','left'],null);
  }
  const footLink=q('.sp-foot a');
  // Beside the links themselves (the foot's box is as wide as the page).
  const footLinks=[...main.querySelectorAll('.sp-foot a')].map(box).reduce((a,b)=>a?{l:Math.min(a.l,b.l),t:Math.min(a.t,b.t),r:Math.max(a.r,b.r),b:Math.max(a.b,b.b)}:b,null);
  if(!phone&&footLink)label(`text-link · ${type(footLink)} · unterstrichen ${hex(getComputedStyle(footLink).textDecorationColor)} · abstand ${fmt(parseFloat(getComputedStyle(footLink).textUnderlineOffset)/unit)} px`,footLinks,['left','above'],null);
  add('head',`heading-1 · ${type(pieces.head)}`,phone?['above']:['above','left']);
  // DESIGN*'s label in one line between the nav and the letters (Marco, 16.11.), right of “to: SP”: its box reaches
  // above the ink by the line height, so the space up to the caps' top counts as free.
  const displayText=rect.display&&`display (größe auf 2 spalten) · ${type(pieces.display)}`;
  if(rect.display&&!phone){
   const big=pieces.display,cs=getComputedStyle(big),fs=parseFloat(cs.fontSize)/unit;
   const base=el('span','',{display:'inline-block',width:'0',height:'0',verticalAlign:'baseline'});big.append(base);const baseline=box(base).t;base.remove();
   const c=document.createElement('canvas').getContext('2d');c.font=`${cs.fontWeight} ultra-expanded 100px "Strichpunkt Sans"`;
   const ink=baseline-c.measureText(big.textContent.replace('*','').toUpperCase()).actualBoundingBoxAscent/100*fs;
   const navB=q('.sp-nav')?box(q('.sp-nav')).b:0,left=rect.to?rect.to.r+16:rect.display.l;
   label(displayText,rect.display,[(w,h)=>[left,Math.max(navB+4,Math.min(ink-8-h,rect.to?(rect.to.t+rect.to.b-h)/2:ink))],'above','below'],keepOut.find(same(rect.display))||null,'sp-label-line');
  }else add('display',displayText,['above']);
  if(phone)add('body',`body-2 · ${type(pieces.body)}`,['below']);
  else if(pieces.body)label(`body-2 · ${type(pieces.body)}`,box(q('.sp-letter')),['below','left'],null);
  add('note',`body-1 · ${type(pieces.note)}`,['below','right']);
  if(!phone&&rect.frame)add('frame',`bild 16:9 · ${fmt(rect.frame.r-rect.frame.l)} × ${fmt(rect.frame.b-rect.frame.t)} px · ${radius(pieces.frame)} (porträt ${radius(pieces.portrait)})`,['inside-top','above','below']);
  add('name',`body-2 · ${type(pieces.name)}`,['below']);
  if(!phone&&rect.field)add('field',`input · ${radius(pieces.field)} · button · ${radius(pieces.button)}`,['above','below']);
  if(noteLine&&!phone)label(swatches,noteLine,['right','below'],rect.note&&keepOut.find(r=>Math.abs(r.l-rect.note.l)<.5&&Math.abs(r.t-rect.note.t)<.5)||null,'sp-legend');
  // On a phone the colours go into the band's lower padding, under the last case.
  const lastName=[...main.querySelectorAll('.sp-name')].pop();
  if(phone&&lastName)label(`<b>strichpunkt sans</b>${swatches}`,box(lastName),['below'],null,'sp-legend');
  // Then the values of the distances and the grid, beside their lines.
  for(const [text,r,prefs] of dims)label(text,r,prefs,r);
  requestAnimationFrame(()=>layer.classList.add('on'));
 };

 // ---------------------------------------------------------------------------------------------------------- cases
 // One case: the still, the reel over it once it has a picture, the name underneath.
 const frame=([name,url,file,still=file+'.webp'],mobile,label=name)=>{
  const a=el('a','sp-case');a.href=url;
  const begin=how=>running.set(a,{project:label,how,since:performance.now()});
  if(mobile){const io=new IntersectionObserver(([e])=>{if(!a.isConnected){io.disconnect();endView(a,'scroll');return}e.isIntersecting?begin('scroll'):endView(a,'scroll')},{threshold:.6});requestAnimationFrame(()=>io.observe(a))}
  else{a.addEventListener('pointerenter',()=>begin('hover'));a.addEventListener('pointerleave',()=>endView(a,'hover'))}
  a.addEventListener('click',()=>{endView(a,mobile?'scroll':'hover');ga('sp_case_open',{project:label})});
  a.innerHTML=`<span class="sp-frame"><img src="${still}" alt="">${file?`<video src="${file}.mp4" muted loop playsinline ${mobile?'autoplay preload="auto"':'preload="metadata"'} aria-hidden="true"></video>`:''}</span><span class="sp-name">${name}</span>`;
  const v=a.querySelector('video');
  if(v){
   v.muted=true;v.addEventListener('playing',()=>v.classList.add('ready'));
   // A phone has no hover: there every reel runs all the time, as the work page's column did (Marco, 14.10.).
   if(mobile){if(reduced())v.removeAttribute('autoplay');else v.play().catch(()=>{})}
   else{
    const play=()=>{if(reduced())return;v.currentTime=0;v.play().catch(()=>{})};
    const stop=()=>{v.pause();v.classList.remove('ready');v.currentTime=0};
    a.addEventListener('pointerenter',play);a.addEventListener('pointerleave',stop);a.addEventListener('focus',play);a.addEventListener('blur',stop);
   }
  }
  return a;
 };
 // Before the password: an empty frame, in it sp.design's field and white button; “confidential” as its name.
 const locked=()=>{
  const card=el('div','sp-case sp-case-locked',{},`<span class="sp-frame sp-locked"><form class="sp-unlock"><input type="password" placeholder="passwort" autocomplete="current-password" spellcheck="false" autocapitalize="off" aria-label="passwort"><button type="submit">öffnen</button></form></span><span class="sp-name">confidential</span>`);
  const form=card.querySelector('form'),field=form.querySelector('input');
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(!field.value)return;
   const password=field.value;field.value='';field.placeholder='…';field.disabled=true;
   try{const sealed=await privateIndex();await openPrivate(await privateKey(password,sealed),sealed);ga('sp_unlock',{result:'ok'});render()}
   catch{ga('sp_unlock',{result:'wrong'});field.disabled=false;field.placeholder='falsches passwort';field.focus()}
  });
  field.addEventListener('keydown',event=>{if(event.key==='Escape'){field.value='';field.blur()}});
  return card;
 };
 const caseCards=mobile=>{const third=sealed();return [...open.map(w=>frame(w,mobile)),third?frame(third,mobile,'confidential'):locked()]};
 // The band under the cases, built as sp.design's newsletter block: a picture blurred (their 37 px, scaled 1.1) under
 // 40 % black, the padding 32. The picture is Marco's evening sky, never shown sharp — the file itself is blurred
 // (480 wide, gaussian 14, assets/strichpunkt/band-blur.webp; the sharp original is not online).
 const band=()=>el('div','sp-band',{},'<div class="sp-band-glow"><img src="assets/strichpunkt/band-blur.webp" alt=""></div>');
 // The purple banner as sp.design's: 32 high, their purple, a line in capitals, a heavier call to action, a cross.
 const banner=()=>{
  const box=el('div','sp-banner',{},`<span>ich würde gern bei strichpunkt identity anfangen</span><a href="mailto:hello@marco.ad?subject=strichpunkt">let’s talk!</a><button type="button" aria-label="close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="#000" stroke-width="1.2"/></svg></button>`);
  box.lang='de';box.querySelector('button').addEventListener('click',()=>{box.remove();specs()});
  box.querySelector('a').addEventListener('click',()=>ga('sp_banner_click'));
  return box;
 };
 // “see more work” with an arrow up to the archive pill in the head (Marco, 16.11.): the arrow from 12 under the pill
 // down to 12 above the words, centred under it. Measured where look.js has put the pill, again once the face is there.
 const moreWork=()=>{
  const svg=svgNode('svg',{viewBox:'0 0 1920 1080','class':'sp-arrow','aria-hidden':'true'});
  const shaft=svgNode('path',{fill:'none',stroke:'#fff','stroke-width':1,'stroke-linecap':'round','stroke-linejoin':'round'});
  svg.append(shaft);
  const link=el('a','sp-more sp-caption',{},'see more work');link.href='#archive';link.addEventListener('click',()=>ga('sp_more_work'));
  const place=quiet=>{
   const pill=document.querySelector('header svg:not(.look-drop) a[href="#archive"] .look-pill');if(!pill||!svg.isConnected)return;
   const r=pill.getBoundingClientRect(),x=(r.left+r.width/2)/zoom(),top=r.bottom/zoom()+12,words=top+60;
   shaft.setAttribute('d',`M${x} ${words-12}V${top}M${x-7.07} ${top+7.07}L${x} ${top}L${x+7.07} ${top+7.07}`);
   const moved=link.style.left!==px(x)||link.style.top!==px(words);
   at(link,x,words);if(moved&&specsOn&&quiet!==true)specs();return true;
  };
  // The head is dressed by look.js a moment later (and again once its face is there): try until the pill stands.
  placeMore=place;
  let tries=0;const retry=()=>{if(svg.isConnected&&!place()&&tries++<120)requestAnimationFrame(retry)};
  requestAnimationFrame(retry);document.fonts?.ready.then(()=>requestAnimationFrame(()=>place()));
  return [svg,link];
 };
 window.strichpunktPage=(main,mobile)=>{
  // The specs are off on every visit to the page.
  specsOn=false;main.classList.remove('sp-specs-on');
  if(!mobile){
   // The banner above the head (the head moves down by its 32, strichpunkt.css), as on sp.design.
   const nodes=[at(banner(),0,0,{width:'1920px',height:'32px'})];
   // Columns 1–2: “to: SP”, then DESIGN* across both, the footnote under it.
   const pic=portrait(PORTRAIT),text=letterBlock();
   // Portrait and letter as before (their top where DESIGN*'s box would start with the footnote ending 48 above the
   // band); DESIGN* and its footnote a little higher (Marco, 16.11.): the bottom of the asterisk's ink on the top edge
   // of the portrait. The ink is found by drawing the asterisk once on a canvas; the baseline with a probe in the line.
   const settle=claim=>{
    const z=zoom(),top=BAND-48-claim.getBoundingClientRect().height/z;pic.style.top=px(top);text.style.top=px(top);
    const big=claim.querySelector('.sp-display'),fs=parseFloat(big.style.fontSize)||200;
    const probe=el('span','',{display:'inline-block',width:'0',height:'0',verticalAlign:'baseline'});big.append(probe);
    const baseline=(probe.getBoundingClientRect().top-big.getBoundingClientRect().top)/z;probe.remove();
    claim.style.top=px(top-(baseline-asteriskRise()*fs));
   };
   const claim=claimBlock(2*COL+GUT,settle);
   // sp.design's nav where the head is, at their size (Marco, 16.11.: it looked smaller than theirs): 32 above and
   // below a 40 high mark = 104 under the banner; their foot links where the foot is.
   nodes.push(at(spNav(false),0,32,{width:'1920px',height:'104px'}),at(spFoot(),0,FOOT,{width:'1920px',height:px(1080-FOOT)}));
   nodes.push(at(addressee(),PAD,TO),at(claim,PAD,TO+80));
   // Column 3: “see more work” under the archive pill, the portrait (smaller than on home) beside the letter.
   nodes.push(...moreWork(),at(pic,colX(2),TO+80),at(text,colX(2)+PORTRAIT+GAP,TO+80,{width:px(COL-PORTRAIT-GAP)}));
   // The band from 32 above the cases to the lower edge of the page, the cases on its three columns.
   nodes.push(at(band(),0,BAND,{width:'1920px',height:px(1080-BAND)}));
   caseCards(false).forEach((card,i)=>nodes.push(at(card,colX(i),TOP,{width:px(COL)})));
   main.replaceChildren(...nodes);claim.fit();
   return;
  }
  // Phone: everything one under another on the column of the mobile home (39.16–459.01 of 498.17).
  const flow=el('div','sp-flow'),strip=band(),list=el('div','sp-list');
  flow.append(spNav(true),banner(),addressee(),claimBlock(459.01-39.16),portrait(180),letterBlock());
  list.append(...caseCards(true));strip.append(list);flow.append(strip);
  main.replaceChildren(flow);flow.querySelector('.sp-claim').fit();
 };
})();
