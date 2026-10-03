const main=document.querySelector('main');
// Consent (Marco, 03.10.): on the first visit the whole screen darkens and two round buttons ask. Accepted, the
// YouTube films drawn straight into their frames load with the page and Google Analytics counts the visit; declined or
// not yet answered, every film waits behind its still until it is clicked and nothing is counted. The choice stays in
// this browser; “cookie settings” in the imprint (#cookies) asks again.
const consentKey='marco-archive-consent';
const consent=()=>{try{return localStorage.getItem(consentKey)}catch{return null}};
// Google Analytics 4 (Marco, 03.10.), the property of the former marco.ad. Loaded only after “accept cookies” and only
// on marco.ad itself, so a local preview never counts. The routes live in the hash, so the page sends one page view
// per route itself (send_page_view off).
const analyticsId='G-9G9TJLTWJ8',analyticsHost=/(^|\.)marco\.ad$/.test(location.hostname);
let analyticsOn=false;
function startAnalytics(){
 if(analyticsOn||!analyticsHost||consent()!=='accepted')return;
 analyticsOn=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
 gtag('js',new Date());gtag('config',analyticsId,{send_page_view:false});
 const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
 document.head.append(script);
}
const trackPage=()=>{startAnalytics();if(analyticsOn)gtag('event','page_view',{page_location:location.href,page_path:location.pathname+location.hash,page_title:document.title})};
// Declined: the cookies Analytics left (here or on the former marco.ad) go.
const dropAnalytics=()=>{
 const host=location.hostname,domains=['',`;domain=${host}`,`;domain=.${host.replace(/^www\./,'')}`];
 for(const cookie of document.cookie.split(';')){const name=cookie.split('=')[0].trim();
  if(/^_ga/.test(name))for(const domain of domains)document.cookie=`${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`}
};
function askConsent(){
 if(document.querySelector('.consent'))return;
 const layer=document.createElement('div');layer.className='consent';
 layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','cookies');
 layer.innerHTML='<button type="button" data-choice="accepted">accept cookies</button><button type="button" data-choice="declined">decline cookies</button>';
 const buttons=[...layer.querySelectorAll('button')];
 layer.addEventListener('keydown',event=>{if(event.key!=='Tab')return;event.preventDefault();
  buttons[(buttons.indexOf(document.activeElement)+1)%buttons.length].focus()});
 layer.addEventListener('click',event=>{
  const choice=event.target.closest('button')?.dataset.choice;if(!choice)return;
  const before=consent();try{localStorage.setItem(consentKey,choice)}catch{}
  layer.remove();document.documentElement.classList.remove('consent-open');
  if(choice==='declined'){dropAnalytics();if(analyticsOn){location.reload();return}}
  if(choice!==before&&projects)render();
 });
 document.body.append(layer);document.documentElement.classList.add('consent-open');buttons[0].focus({preventScroll:true});
}
document.addEventListener('click',event=>{if(!event.target.closest?.('a[href="#cookies"]'))return;event.preventDefault();askConsent()});
let screens,projects,awards,entries,vita,imageSizes={},activeRoute='home',viewIndex=null,viewFocus=0;
const namespace='http://www.w3.org/2000/svg';
let mobile=false,cleanupRoute=()=>{},cleanupView=()=>{},menu=null;
const mobileWidth=498.17;
// Mobile text (Marco, 03.10.): 24 px instead of the drawn 30, the line step in the same ratio (36 → 28.8). look.js
// sets it 1 px smaller, so breaks are measured at 23. Head, foot and menu keep their 30.
const mobileType={size:24,step:28.8,set:23};
const svgNode=(tag,attrs={},text)=>{const n=document.createElementNS(namespace,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n};
// Both cuts carry a generic behind them: if a face fails to arrive the text lands on a sans,
// not on the browser serif, which is what makes a half loaded page read as the wrong typeface.
const roman='Serie57Archive, sans-serif',lightFace='Serie57Archive, sans-serif';
const routeFor={ 'marco pröfrock':'home',archive:'archive',diary:'diary',vita:'vita' };
// Links to the former marco.ad (one long page with anchors) land on the matching route.
const formerAnchors={'#work':'#archive','#p-500ls':'#500ls','#p-wind':'#windkulturerbe','#p-uturn':'#u-turn','#p-hope':'#hope-in-action',
 '#p-opera':'#mediterainy-opera','#p-sentry':'#sentry','#photography':'#diary','#about':'#vita','#memberships':'#vita','#awards-list':'#vita',
 '#talks-publications':'#vita','#imprint':'#imprint','#top':'#home'};
if(formerAnchors[location.hash]&&formerAnchors[location.hash]!==location.hash)history.replaceState(null,'',formerAnchors[location.hash]);
const routeFromHash=()=>['home','archive','diary','vita','contact','imprint','mediterainy-opera','500ls','sentry','heritage-identity','hope-in-action','windkulturerbe','u-turn','azulejo-six','vote2cop','thank-you','plants-with-benefits','mission-octopus','kids-foundation'].includes(location.hash.slice(1))||projects?.some(project=>project.url===location.hash)?location.hash.slice(1):'home';
// The width of the window without anything a page pushes out past its edge: a phone widens innerWidth to fit
// whatever overflows, and that wider number then picked the desktop layout for the very page that overflowed.
const viewWidth=()=>document.documentElement.clientWidth||window.innerWidth;
// Every page has its mobile layout up to 768 px.
const useMobile=()=>viewWidth()<=768;
const zoom=()=>useMobile()?viewWidth()/mobileWidth:window.innerWidth/1920;
const scale=()=>document.documentElement.style.setProperty('--scale',zoom());
scale();window.addEventListener('resize',()=>{
 if(screens&&mobile!==useMobile()){render();return}
 scale();if(menu)sizeMenu();
});
// Line breaks follow the reference: 405 units at 20 px (diary_auswahl.svg), 437 at 30 px (diary-mobile-auswahl1.svg).
// Rotis itself no longer ships (Marco, 03.10.): it is measured from its numbers in assets/rotis-metrics.json —
// advance widths, the fi/fl ligatures and the pair kerning, exactly what a canvas set in Rotis returned
// (scripts/prepare_rotis_metrics.py). A character Rotis lacks counts in neue Serie 57.
let rotis={upm:2048,glyphs:[],cmap:{},liga:{},kern:{}};
const measure=(text,size)=>{
 let width=0,previous=-1,fallback=0;const chars=[...text];
 for(let i=0;i<chars.length;i++){
  let glyph=rotis.liga[chars[i]+(chars[i+1]||'')];
  if(glyph!==undefined)i++;else glyph=rotis.cmap[chars[i]];
  if(glyph===undefined){fallback+=measureSet(chars[i],size);previous=-1;continue}
  if(previous>=0)width+=rotis.kern[`${previous} ${glyph}`]||0;
  width+=rotis.glyphs[glyph];previous=glyph;
 }
 return width*size/rotis.upm+fallback;
};
const wrap=(text,size,width)=>text.split('\n').flatMap(paragraph=>{
 const lines=[];let line='';
 for(const word of paragraph.split(' ')){
  const candidate=line?`${line} ${word}`:word;
  if(line&&measure(candidate,size)>width)  {lines.push(line);line=word}else line=candidate;
 }
 return [...lines,line];
});
// Breaks that only exist on mobile are measured in the face that is set, neue Serie 57, at the size it shows.
const measureSet=(()=>{const context=document.createElement('canvas').getContext('2d');
 return (text,size)=>{context.font=`${size}px Serie57Archive`;return context.measureText(text).width}})();
const wrapSet=(text,size,width)=>{
 const lines=[];let line='';
 for(const word of text.split(' ')){const candidate=line?`${line} ${word}`:word;if(line&&measureSet(candidate,size)>width){lines.push(line);line=word}else line=candidate}
 return [...lines,line];
};
// Both overviews run newest first. A diary date is DD/MM/YYYY, a project carries only its year; anything
// that is not a real date — the 00/00/0000 placeholder included — goes to the end. The sort is stable, so
// entries of the same date keep the order they have in the file.
const diaryKey=entry=>{
 const parts=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(entry.date||'');
 if(!parts||parts[3]==='0000'||parts[2]==='00'||parts[1]==='00')return '';
 return parts[3]+parts[2]+parts[1];
};
const projectKey=project=>/^\d{4}$/.test(project.year||'')?project.year:'';
const newestFirst=key=>(one,other)=>{
 const left=key(one),right=key(other);
 if(left===right)return 0;
 if(!left)return 1;
 if(!right)return -1;
 return left<right?1:-1;
};
const setLines=(node,x,y,lines,step)=>{node.replaceChildren(...lines.map((line,index)=>svgNode('tspan',{x,y:y+index*step},line)));return node};
function footerLink(visible){
 document.querySelector('footer').innerHTML=`<svg viewBox="0 0 1920 58.08">${visible?'':''}</svg>`;
}
// Contact and imprint (Marco, 03.10.): bottom right on home, archive, diary and vita; contact and imprint lead to
// each other. “see my work” is gone from every foot (Marco, 03.10.). look.js lines them up from the right edge like
// the buttons in the head.
const footerRows={home:[['#contact','contact'],['#imprint','imprint']],archive:[['#contact','contact'],['#imprint','imprint']],
 diary:[['#contact','contact'],['#imprint','imprint']],vita:[['#contact','contact'],['#imprint','imprint']],
 contact:[['#imprint','imprint']],imprint:[['#contact','contact']]};
function footerRow(links){
 document.querySelector('footer').innerHTML=`<svg viewBox="0 0 1920 58.08" class="look-row">${links.map(([href,label])=>`<a href="${href}"><text x="1893.62" y="32.03" text-anchor="end">${label}</text></a>`).join('')}</svg>`;
}
// Projektseite: links das Projekt darüber, rechts das darunter, in der Reihenfolge der Archivliste.
// Gleiche Grundlinie wie "see my work", Kanten auf der Header-Linie (26.38 / 1893.62); an den Enden fehlt der Link.
function footerProjects(route){
 const index=projects?.findIndex(project=>project.url===`#${route}`);
 if(index===undefined||index<0)return;
 const previous=projects[index-1],next=projects[index+1];
 document.querySelector('footer').innerHTML=`<svg viewBox="0 0 1920 58.08">${previous?`<a href="${previous.url}" aria-label="previous project: ${previous.title}"><text x="26.38" y="32.03">previous project</text></a>`:''}${next?`<a href="${next.url}" aria-label="next project: ${next.title}"><text x="1893.62" y="32.03" text-anchor="end">next project</text></a>`:''}</svg>`;
}
// Interaktive Demo eines Projekts ("demo" in projects.json): Pill-Button ganz rechts in der Fußzeile,
// "see my work" davor ist weg (03.10.). Die Pille wird um den gemessenen Text gelegt, damit sie für jedes Label passt.
function footerDemo(demo){
 if(!demo||demo.placement==='inline')return;
 const footer=document.querySelector('footer'),right=1893.62,pad=18;
 footer.innerHTML=`<svg viewBox="0 0 1920 58.08"><a class="demo-link" href="${demo.url}" target="_blank" rel="noopener"><rect/><text x="${right-pad}" y="32.03" text-anchor="end">${demo.label}</text></a></svg>`;
 const label=footer.querySelector('.demo-link text'),box=label.getBBox(),pill=footer.querySelector('.demo-link rect'),h=box.height+12;
 Object.entries({x:box.x-pad,y:box.y+box.height/2-h/2,width:box.width+pad*2,height:h,rx:h/2}).forEach(([k,v])=>pill.setAttribute(k,v));
}
function navigation(route){
 document.querySelector('header').innerHTML=`<nav><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 61">${screens.home.header.map(n=>`<a href="#${routeFor[n.label]}" ${routeFor[n.label]===route?'aria-current="page"':''}><text x="${n.x}" y="${n.y}">${n.label}</text></a>`).join('')}<line x1="26.38" y1="60.38" x2="1893.62" y2="60.38" stroke="black" stroke-width=".5"/></svg></nav>`;
 footerLink(!['archive','diary'].includes(route));
 if(footerRows[route])footerRow(footerRows[route]);
}
function render(){
 cleanupView();cleanupView=()=>{};cleanupRoute();cleanupRoute=()=>{};closeMenu();
 const route=routeFromHash(),isInfo=route in infoPages,isProject=!['home','archive','diary','vita'].includes(route)&&!isInfo;
 main.classList.toggle('project-page',isProject);
 activeRoute=route;main.dataset.route=route;viewIndex=null;document.body.classList.remove('view-open');
 mobile=useMobile();document.body.classList.toggle('mobile',mobile);
 document.body.classList.toggle('mobile-archive',mobile&&route==='archive');
 document.body.classList.toggle('mobile-diary',mobile&&route==='diary');
 document.body.classList.toggle('mobile-vita',mobile&&route==='vita');
 // Home and vita on the desktop are one screen and do not scroll (Marco, 03.10.): in a window flatter than 16:9 the
 // 1080 of the drawing ran a few pixels past it.
 document.documentElement.classList.toggle('still-page',!mobile&&['home','vita'].includes(route));
 // Home, archive and vita do not swing at the end of a scroll, so the head never moves — as on the diary (Marco, 03.10.).
 document.documentElement.classList.toggle('no-swing',['home','archive','vita'].includes(route));
 scale();
 document.body.classList.toggle('mobile-page',mobile&&(isProject||isInfo||route==='home'));
 navigation(isProject?'archive':route);if(isProject)footerProjects(route);if(isProject&&!mobile)footerDemo(projects?.find(project=>project.url===`#${route}`)?.demo);main.innerHTML=isProject||isInfo||mobile&&route==='home'?'':screens[route].body;document.title=route==='home'?'marco pröfrock':`${route} — marco pröfrock`;trackPage();window.scrollTo(0,0);
 if(mobile&&(isProject||isInfo||route==='home')){mobileHead();mobileFooter(route,isProject)}
 if(route==='home'&&mobile)setupMobileHome();
 if(route==='archive')mobile?setupMobileArchive():setupArchive();
 // The diary is only its large view with the roll (Marco): the page opens on the newest entry.
 if(route==='diary')mobile?setupMobileDiary():openEntry(0,'route');
 if(route==='vita')mobile?setupMobileVita():setupVita();
 if(isProject)setupOpera(route);
 if(isInfo)mobile?setupMobileInfo(route):setupInfo(route);
}
// The mobile head of every page: name on the left, menu on the right, the bar 93.67 deep (archive-mobile.svg).
function mobileHead(){
 document.querySelector('header').innerHTML=`<nav><svg xmlns="${namespace}" viewBox="0 0 ${mobileWidth} 93.67">
 <a href="#home"><text x="39.16" y="57.79">marco pröfrock</text></a>${menuButton}
 <line x1="15.15" y1="93.67" x2="484.96" y2="93.67" stroke="black" stroke-width=".5"/>
 </svg></nav>`;
 wireMenuButton();
}
// The mobile foot mirrors the head: the same 93.67 and baseline 57.79, a link on the left starts at the name's
// 39.16, links on the right end where the menu's outline would (look.js lines them up). Project pages lead to the
// project before and after, the other pages to the links of their desktop foot.
const mobileFooterLinks={home:[['#contact','contact'],['#imprint','imprint']],archive:[['#contact','contact'],['#imprint','imprint']],
 diary:[['#contact','contact'],['#imprint','imprint']],vita:[['#contact','contact'],['#imprint','imprint']],
 contact:[['#imprint','imprint']],imprint:[['#contact','contact']]};
function mobileFooter(route,isProject){
 let left=[],right=mobileFooterLinks[route]||[];
 if(isProject){
  const index=projects?.findIndex(project=>project.url===`#${route}`)??-1,previous=projects?.[index-1],next=projects?.[index+1];
  left=previous?[[previous.url,'previous',`previous project: ${previous.title}`]]:[];
  right=next?[[next.url,'next',`next project: ${next.title}`]]:[];
 }
 const link=([href,label,aria],x,anchor)=>`<a href="${href}"${aria?` aria-label="${aria}"`:''}><text x="${x}" y="57.79" text-anchor="${anchor}">${label}</text></a>`;
 document.querySelector('footer').innerHTML=`<svg viewBox="0 0 ${mobileWidth} 93.67">${left.map(l=>link(l,39.16,'start')).join('')}${right.map(l=>link(l,459.01,'end')).join('')}</svg>`;
}
// Award badges under the archive preview: shared ink height, left edge and spacing from archive_auswahl.svg.
const awardHeight=31.38,awardGap=6.96,awardOffset=10.42;
function awardRow(names,left,top,height=awardHeight,gap=awardGap){
 const group=svgNode('g',{'class':'project-awards','aria-hidden':'true'});
 let x=left;
 for(const name of names||[]){
  const award=awards[name];if(!award)continue;
  const step=height/award.ink[3];
  group.append(svgNode('image',{href:award.file,x:x-award.ink[0]*step,y:top-award.ink[1]*step,width:award.view[0]*step,height:award.view[1]*step}));
  x+=award.ink[2]*step+gap;
 }
 return group;
}
// Awards, memberships, publications and talks are data, not drawing: they come from vita.json so entries
// can be added, and each carries the mark of its organisation next to it, as on marco.ad. Positions,
// line step and the heading gap are measured from vita.svg; the detail column widens if a title needs it.
const vitaFirst=43.2,vitaStep=21.6,vitaGap=66.8,vitaMark=16,vitaMarkGap=12;
// In education and experience the mark stands between the span of time and the name; the gap there is
// only 31.19 at its narrowest, so it sits closer to the name to leave air on the date side.
const vitaBlockGap=8;
function setupVita(){
 const vitaColGap=16; // columns 16 apart (vita.gap, 24, was the Rotis spacing)
 const content=main.querySelector('svg [id="inhalt"]');
 if(!content||!vita)return;
 for(const node of [...content.querySelectorAll('text')]){
  const first=node.querySelector('tspan');
  // The introductory sentence is gone; education and experience moved up onto its line.
  if(first&&['awards','memberships','education','here you get to know me, before you get to know me.'].includes((first.textContent||'').trim()))node.remove();
 }
 const list=svgNode('g',{'class':'vita-lists'});content.append(list);
 // The vita measures with the face it shows, not with Rotis, so no column runs into the next. Text is set
 // 1 px below its drawn size (look.js), and so is the measure.
 const ctx=document.createElement('canvas').getContext('2d');const shown=(t,size)=>{ctx.font=`${size-1}px Serie57Archive`;return ctx.measureText(t).width};
 const label=(x,y,words)=>list.append(svgNode('text',{x,y,'font-family':roman,'font-weight':400,'font-size':20},words));
 // Every mark fits into the same square, set flush to its right edge and centred on the line. Scaling by
 // height alone let the wide ones — one club, page — grow past their neighbours and reach further left.
 const drawMark=(name,right,baseline)=>{
  const mark=awards[name];if(!mark)return;
  const scale=Math.min(vitaMark/mark.ink[3],vitaMark/mark.ink[2]);
  list.append(svgNode('image',{href:mark.file,'aria-hidden':'true',
   x:right-(mark.ink[2]+mark.ink[0])*scale,y:baseline-7-(mark.ink[3]/2+mark.ink[1])*scale,
   width:mark.view[0]*scale,height:mark.view[1]*scale}));
 };
 // No separating dots: every entry is a row of cells, set on columns that are as wide as their widest
 // entry needs. Cells beyond the third follow one another with the same gap, so a result made of
 // several parts stays on its line without punctuation.
 const columns=entries=>{
  const count=Math.min(3,Math.max(...entries.map(entry=>entry.parts.length)));
  const xs=[0];
  for(let index=1;index<count;index++)
   xs.push(xs[index-1]+Math.max(...entries.map(entry=>entry.parts[index-1]?shown(entry.parts[index-1],20):0))+vitaColGap);
  return xs;
 };
 const row=(x,y,entry,xs,markRight)=>{
  let next=x;
  entry.parts.forEach((part,index)=>{
   const at=index<xs.length?x+xs[index]:next;
   label(at,y,part);
   next=at+shown(part,20)+vitaColGap;
  });
  drawMark(entry.logo,markRight??x-vitaMarkGap,y);
 };
 // Education and experience are set as pieces at fixed positions, and Illustrator leaves leading spaces
 // and tabs inside them. Chromium renders those, WebKit does not — which shifted every column in Safari
 // by a space. The pieces are therefore stored without any whitespace at their edges, each with the
 // position it actually occupies, so both engines can only draw the same thing.
 // Education and experience: span of time, mark, name and the further details on columns as wide as their
 // widest entry; the mark fits between span and name with its gaps.
 const rows=vita.block.rows.map(line=>{
  if(line.parts.length<2)return {y:line.y,cells:[line.parts[0].t],head:true};
  const date=line.parts.filter(part=>part.x<180).map(part=>part.t).join(' ').replace(/\s*—\s*/,' — ');
  return {y:line.y,logo:line.logo,cells:[date,...line.parts.filter(part=>part.x>=180).map(part=>part.t)]};
 });
 const body=rows.filter(r=>!r.head),dateW=Math.max(...body.map(r=>shown(r.cells[0],20)));
 const nameX=dateW+vitaColGap+vitaMark+vitaBlockGap;
 const sectionXs=section=>{const xs=[0,nameX];const n=Math.max(...section.map(r=>r.cells.length));
  for(let i=2;i<n;i++)xs.push(xs[i-1]+Math.max(...section.map(r=>r.cells[i-1]?shown(r.cells[i-1],20):0))+vitaColGap);return xs};
 let section=[];const sections=[];
 for(const r of rows){if(r.head){section=[];sections.push(section)}else section.push(r)}
 for(const sec of sections){const xs=sectionXs(sec);sec.forEach(r=>r.xs=xs)}
 for(const r of rows){
  if(r.head){label(vita.block.x,vita.block.y+r.y,r.cells[0]);continue}
  r.cells.forEach((t,i)=>label(vita.block.x+r.xs[i],vita.block.y+r.y,t));
  if(r.logo)drawMark(r.logo,vita.block.x+nameX-vitaBlockGap,vita.block.y+r.y);
 }
 const columnMarkRight=vita.block.x+nameX-vitaBlockGap;
 const columnsX=columnMarkRight+(vita.columns.x-(vita.block.x+190.02-vitaBlockGap));
 const awardColumns=columns(vita.awards.entries);
 const awardsWidth=Math.max(...vita.awards.entries.map(entry=>{let end=0;entry.parts.forEach((part,i)=>{const at=i<awardColumns.length?awardColumns[i]:end+vitaColGap;end=at+shown(part,20)});return end}));
 // The awards close flush with the right edge of the page (Marco, 03.10.: further right).
 const awardsX=1893.62-awardsWidth;
 label(awardsX,vita.awards.y,'awards');
 vita.awards.entries.forEach((entry,index)=>row(awardsX,vita.awards.y+vitaFirst+index*vitaStep,entry,awardColumns));
 let top=vita.columns.y;
 for(const block of vita.columns.blocks){
  label(columnsX,top,block.label);
  const blockColumns=columns(block.entries);
  block.entries.forEach((entry,index)=>row(columnsX,top+vitaFirst+index*vitaStep,entry,blockColumns,columnMarkRight));
  top+=vitaFirst+(block.entries.length-1)*vitaStep+vitaGap;
 }
 // The drawn page ends 86.07 below its last award; when the lists run longer the page grows by as much.
 const bottom=Math.max(vita.awards.y+vitaFirst+(vita.awards.entries.length-1)*vitaStep,top-vitaGap)+86.07;
 const svg=content.ownerSVGElement;
 if(svg&&bottom>1080)svg.setAttribute('viewBox',`0 0 1920 ${bottom.toFixed(2)}`);
 // Three blocks, parted by thin rules as between the rows of the archive (Marco's sketch, 03.10.): one upright
 // between the left lists and the awards, from the header line to the foot of the page, halfway between the
 // furthest line on the left and the marks of the awards; one across the left, from the header's left edge to
 // that upright, halfway between the last row of experience and the heading of memberships.
 const awardsLeft=awardsX-vitaMarkGap-vitaMark;
 const leftRight=Math.max(...[...list.querySelectorAll('text')].filter(t=>+t.getAttribute('x')<awardsLeft-24).map(t=>+t.getAttribute('x')+shown(t.textContent,20)));
 // The rules that reach a side run off the page (Marco, 03.10.).
 // A third rule closes the awards (Marco, 03.10.), from the upright to the right edge, as far below the last award
 // as the rule across the left stands below the last row of experience.
 const upright=(leftRight+awardsLeft)/2,lastRow=vita.block.y+vita.block.rows.at(-1).y;
 const across=(lastRow+5+vita.columns.y-14)/2,rule=attrs=>list.append(svgNode('line',{...attrs,stroke:'black','stroke-width':.5,'stroke-opacity':.5}));
 const lastAward=vita.awards.y+vitaFirst+(vita.awards.entries.length-1)*vitaStep,under=lastAward+(across-lastRow);
 rule({x1:upright,y1:61,x2:upright,y2:Math.max(1080,bottom)});
 rule({x1:0,y1:across,x2:upright,y2:across});
 rule({x1:upright,y1:under,x2:1920,y2:under});
 // Two more from Marco's second sketch (03.10.): one across the awards' side above their heading, as far above it as
 // the rule across the left stands above “memberships”; and one upright in front of the lower left lists, from that
 // rule to the foot, as far left of their marks as the long upright stands left of the awards' marks.
 const over=vita.awards.y-(vita.columns.y-across),lowerUpright=columnMarkRight-vitaMark-(awardsLeft-upright);
 rule({x1:upright,y1:over,x2:1920,y2:over});
 rule({x1:lowerUpright,y1:across,x2:lowerUpright,y2:Math.max(1080,bottom)});
}
// Contact and imprint: no drawing of their own; set on the grid of the vita's education block (Marco, 03.10.) —
// heading at 28.13 / 148.66, first row 43.2 below it, rows 21.6 apart, values on the column at 190.02, a new
// heading 64.8 below the last row, as “experience” follows “education”.
const infoPages={
 contact:[['contact',[
  ['e-mail','hello@marco.ad','mailto:hello@marco.ad'],
  ['phone','+49 1590 8323432','tel:+4915908323432'],
  ['instagram','marco.proe','https://www.instagram.com/marco.proe/'],
  ['linkedin','marco pröfrock','https://www.linkedin.com/in/marco-pr%C3%B6frock/']]]],
 // German, as German law asks of it (§ 5 DDG): name, address that can be served, two quick ways to get in touch.
 // A VAT number belongs here once there is one. The EU dispute platform closed on 20.07.2025, so no link to it.
 imprint:[['imprint',[
  ['anbieter','marco pröfrock'],
  ['anschrift',['reinsburgstraße 69a','70178 stuttgart','deutschland']],
  ['e-mail','hello@marco.ad','mailto:hello@marco.ad'],
  ['telefon','+49 1590 8323432','tel:+4915908323432']]],
  ['verantwortlich nach § 18 abs. 2 mstv',[
  ['name','marco pröfrock, anschrift wie oben']]],
  ['verbraucherstreitbeilegung',[
  ['','ich bin nicht bereit und nicht verpflichtet, an streitbeilegungsverfahren vor einer verbraucherschlichtungsstelle teilzunehmen.']]],
  // The privacy policy lives on the imprint (Marco, 03.10.). It describes this site as it is: no analytics, no
  // cookies of its own, YouTube only with consent or on a click, fonts from this server.
  ['datenschutz',[
  ['verantwortlich','marco pröfrock, anschrift und kontakt wie oben.'],
  ['überblick','diese website ist ein privates portfolio. google analytics und eingebettete youtube-filme laufen nur mit ihrer einwilligung; ohne sie legt die seite keine cookies an. ausnahme ist die eigenständige unterseite marco.ad/500ls (siehe google analytics). personenbezogene daten werden sonst nur verarbeitet, soweit es für die auslieferung der seite oder die beantwortung ihrer anfrage nötig ist.']]],
  ['hosting',[
  ['anbieter','github pages, github inc., 88 colin p. kelly jr. street, san francisco, ca 94107, usa.'],
  ['daten','beim aufruf verarbeitet der hoster technisch notwendige verbindungsdaten (ip-adresse, datum und uhrzeit, aufgerufene adresse, browser und betriebssystem) in server-logdateien, um die seite auszuliefern und ihre sicherheit zu gewährleisten.'],
  ['rechtsgrundlage','art. 6 abs. 1 lit. f dsgvo (berechtigtes interesse an einer sicheren, funktionierenden website). github ist unter dem eu-us data privacy framework zertifiziert (art. 45 dsgvo).']]],
  ['schriften',[
  ['','alle schriften dieser seite werden von diesem server geladen. es besteht keine verbindung zu schriftanbietern.']]],
  ['youtube',[
  ['anbieter','google ireland limited, gordon house, barrow street, dublin 4, irland.'],
  ['einbindung','filme werden über die datenschutzfreundliche adresse youtube-nocookie.com eingebunden. ohne ihre einwilligung wird keine verbindung zu youtube aufgebaut, bis sie auf das standbild eines films klicken. mit „accept cookies“ laden die filme direkt mit der seite. dabei erhält youtube ihre ip-adresse und technische angaben zu ihrem gerät und kann cookies oder ähnliche speicher verwenden; eine übermittlung in die usa ist möglich.'],
  ['rechtsgrundlage','ihre einwilligung, art. 6 abs. 1 lit. a dsgvo und § 25 abs. 1 tdddg. sie können sie jederzeit mit wirkung für die zukunft widerrufen.'],
  ['einstellungen','cookie-einstellungen ändern','#cookies']]],
  // Analytics on the archive only with consent; /500ls/ (the ADCE case study) stays online unchanged and loads GA4
  // without a banner (Marco, 03.10.), so the policy names both.
  ['google analytics',[
  ['anbieter','google ireland limited, gordon house, barrow street, dublin 4, irland.'],
  ['einbindung','mit „accept cookies“ misst diese website ihre aufrufe mit google analytics 4; ohne ihre einwilligung wird google analytics nicht geladen. die eigenständige unterseite marco.ad/500ls, eine fallstudie zum projekt 500l/s, setzt google analytics ohne vorherige abfrage ein.'],
  ['daten','google analytics legt cookies an und erfasst, wie die seite genutzt wird: aufgerufene seiten, verweildauer, gerät, browser und ein ungefährer standort. eine übermittlung in die usa ist möglich; google ist unter dem eu-us data privacy framework zertifiziert (art. 45 dsgvo).'],
  ['rechtsgrundlage','auf dieser website ihre einwilligung, art. 6 abs. 1 lit. a dsgvo und § 25 abs. 1 tdddg; sie können sie jederzeit mit wirkung für die zukunft widerrufen. auf marco.ad/500ls art. 6 abs. 1 lit. f dsgvo (berechtigtes interesse daran, die resonanz auf die fallstudie zu messen); dort können sie widersprechen, indem sie cookies von google in ihrem browser blockieren.'],
  ['einstellungen','cookie-einstellungen ändern','#cookies']]],
  ['lokaler speicher',[
  ['','ihre auswahl im cookie-hinweis wird im lokalen speicher ihres browsers abgelegt, damit der hinweis nicht bei jedem besuch erscheint. das ist technisch erforderlich (§ 25 abs. 2 nr. 2 tdddg); sie können den eintrag jederzeit in ihrem browser löschen.']]],
  ['kontakt',[
  ['','wenn sie mir eine e-mail schreiben oder mich anrufen, verarbeite ich ihre angaben, um ihre anfrage zu beantworten (art. 6 abs. 1 lit. b bzw. f dsgvo), und lösche sie, sobald sie dafür nicht mehr benötigt werden.']]],
  ['externe links',[
  ['','instagram, linkedin und weitere externe seiten sind nur verlinkt. erst wenn sie einem link folgen, gelten die datenschutzbestimmungen des jeweiligen anbieters. der verlinkte app-prototyp (plants with benefits) lädt schriften von adobe fonts und google fonts.']]],
  ['ihre rechte',[
  ['','sie haben das recht auf auskunft, berichtigung, löschung und einschränkung der verarbeitung, auf datenübertragbarkeit, auf widerspruch gegen eine verarbeitung nach art. 6 abs. 1 lit. f dsgvo sowie auf widerruf einer einwilligung (art. 15–21 dsgvo).'],
  ['','sie können sich außerdem bei einer datenschutz-aufsichtsbehörde beschweren, etwa beim landesbeauftragten für den datenschutz und die informationsfreiheit baden-württemberg.'],
  ['stand','oktober 2026']]]]
};
const infoLang={imprint:'de'};
function setupInfo(route){
 const svg=svgNode('svg',{xmlns:namespace,viewBox:'0 0 1920 1080'}),x=28.13,valueX=x+190.02;
 if(infoLang[route])svg.setAttribute('lang',infoLang[route]);
 const text=(tx,ty,words,href)=>{const t=svgNode('text',{x:tx,y:ty,'font-family':roman,'font-weight':400,'font-size':20},words);
  if(!href)return t;const a=svgNode('a',{href});if(/^https?:/.test(href)){a.setAttribute('target','_blank');a.setAttribute('rel','noopener')}a.append(t);return a};
 let y=148.66;
 for(const [heading,rows] of infoPages[route]){
  svg.append(text(x,y,heading));
  // A value runs on below itself: a list of lines as given, a long sentence broken at the diary's 405 units.
  let line=0;
  for(const [label,value,href] of rows){
   const lines=Array.isArray(value)?value:wrap(value,20,405);
   if(label)svg.append(text(x,y+vitaFirst+line*vitaStep,label));
   lines.forEach(words=>{svg.append(text(valueX,y+vitaFirst+line*vitaStep,words,href));line++});
  }
  y+=vitaFirst+(line-1)*vitaStep+64.8;
 }
 // A page longer than the screen (the imprint with its privacy policy) grows its drawing, and the page scrolls.
 // Below the last line the diary's 46.44, plus the 58.08 the fixed footer covers.
 const bottom=y-64.8+46.44+58.08;if(bottom>1080)svg.setAttribute('viewBox',`0 0 1920 ${bottom.toFixed(2)}`);
 main.append(svg);
}
// Mobile vita: the same house as the other mobile screens — head with name and menu, 30 px Rotis
// Regular throughout, entries as rows under a rule. A desktop row becomes a small stack: the span of
// time, then where, then what. Awards, memberships, publications and talks keep the mark of their
// organisation in the left gutter.
// Rows scaled with the type (×0.8): baseline 44.06 under the rule, 28.94 from the last line to the next rule.
const vitaMobile={margin:39.16,gutter:28.8,top:44.06,step:mobileType.step,tail:28.94,mark:19.2,head:93.67};
function setupMobileVita(){
 const width=mobileWidth;
 document.querySelector('header').innerHTML=`<nav><svg xmlns="${namespace}" viewBox="0 0 ${width} ${vitaMobile.head}">
 <a href="#home"><text x="39.16" y="57.79">marco pröfrock</text></a>${menuButton}
 <line x1="15.15" y1="93.67" x2="484.96" y2="93.67" stroke="black" stroke-width=".5"/>
 </svg></nav>`;
 wireMenuButton();
 mobileFooter('vita');
 const left=vitaMobile.margin+vitaMobile.gutter,text=width-15.15-left;
 const svg=svgNode('svg',{'aria-label':'Vita'});
 const label=(x,y,words)=>svg.append(svgNode('text',{x,y,'font-family':roman,'font-weight':400,'font-size':mobileType.size},words));
 let top=vitaMobile.head;
 const rule=y=>svg.append(svgNode('line',{x1:15.15,x2:484.96,y1:y,y2:y,stroke:'black','stroke-width':.5}));
 const entry=(lines,logo)=>{
  // Measured in Serie 57 at the 29 px it shows; measured in Rotis the lines ran past the right edge.
  const wrapped=lines.flatMap(line=>wrapSet(line,mobileType.set,text));
  wrapped.forEach((line,index)=>label(left,top+vitaMobile.top+index*vitaMobile.step,line));
  const mark=awards[logo];
  if(mark){
   const scale=Math.min(vitaMobile.mark/mark.ink[3],vitaMobile.mark/mark.ink[2]);
   svg.append(svgNode('image',{href:mark.file,'aria-hidden':'true',
    x:vitaMobile.margin,y:top+vitaMobile.top-10-(mark.ink[3]/2+mark.ink[1])*scale,
    width:mark.view[0]*scale,height:mark.view[1]*scale}));
  }
  top+=vitaMobile.top+(wrapped.length-1)*vitaMobile.step+vitaMobile.tail;
  rule(top);
 };
 const heading=words=>{label(vitaMobile.margin,top+vitaMobile.top,words);svg.lastChild.classList.add('vita-heading');top+=vitaMobile.top+vitaMobile.tail;rule(top)};
 // education and experience: the drawn row read as time, place, matter
 let block=null;
 for(const line of vita.block.rows){
  const dates=line.parts.filter(part=>part.x<180).map(part=>part.t).join(' ');
  const fields=line.parts.filter(part=>part.x>=180).map(part=>part.t);
  if(!fields.length){block=dates;heading(block);continue}
  entry([dates,fields[0].replace(/,$/,''),fields.slice(1).join(', ')].filter(Boolean),null);
 }
 heading('awards');
 for(const item of vita.awards.entries)entry([item.parts[0]+' '+item.parts[1],item.parts.slice(2).join(', ')].filter(Boolean),item.logo);
 for(const group of vita.columns.blocks){
  heading(group.label);
  for(const item of group.entries)
   entry(item.parts.length>1?[item.parts[0]+' '+item.parts[1],item.parts.slice(2).join(', ')].filter(Boolean):[item.parts[0]],item.logo);
 }
 svg.setAttribute('viewBox',`0 0 ${width} ${(top+58.08).toFixed(2)}`);
 main.replaceChildren(svg);
 // The headings in a round outline (Marco, 03.10.), drawn like the buttons of the mobile head: 14 beside and 9 above
 // and below the text, ends round, 1.5 strong — in black on the white page. Measured once the size is final:
 // look.js sets the text 1 px smaller, and the face may still be arriving.
 const outline=()=>{if(!svg.isConnected)return;
  for(const t of svg.querySelectorAll('.vita-heading')){
   t.previousElementSibling?.classList.contains('vita-outline')&&t.previousElementSibling.remove();
   const b=t.getBBox(),h=b.height+18;
   t.before(svgNode('rect',{'class':'vita-outline',x:b.x-14,y:b.y-9,width:b.width+28,height:h,rx:h/2,fill:'none',stroke:'black','stroke-width':1.5}));
  }};
 requestAnimationFrame(outline);document.fonts.ready.then(outline);
}
function setupArchive(){
 const svg=main.querySelector('svg'),content=svg.querySelector('[id="inhalt"]');
 const coordinates=n=>(n.getAttribute('transform')?.match(/[-+]?\d*\.?\d+/g)||[]).map(Number);
 const titles=[...content.querySelectorAll('text')].filter(n=>n.textContent==='project name').sort((a,b)=>coordinates(a)[1]-coordinates(b)[1]);
 const baselines=titles.map(n=>coordinates(n)[1]);
 const lines=[...content.querySelectorAll('line')].filter(n=>Number(n.getAttribute('y1'))>260).sort((a,b)=>Number(a.getAttribute('y1'))-Number(b.getAttribute('y1')));
 const boundaries=lines.map(n=>Number(n.getAttribute('y1')));boundaries.push(1080.5);
 // Only real projects get a row. The drawn rows below the last one are placeholders and go, ruled lines
 // included — the page stays open underneath until further projects arrive.
 lines.slice(projects.length+1).forEach(line=>line.remove());
 for(const n of [...content.querySelectorAll('text')]){
  const [,y]=coordinates(n);if(y>260 || ['client','area','year'].includes(n.textContent))n.remove();
 }
 // No awards column: the badges show only under the hover preview.
 for(const [x,label] of [[400,'client'],[775,'area'],[1233.6,'year']])content.append(svgNode('text',{x,y:245.96,'font-family':lightFace,'font-weight':400,'font-size':20},label));
 const table=svgNode('g',{'aria-label':'Projects, client, area and year'});content.append(table);
 const preview=svgNode('g',{'class':'project-preview','aria-hidden':'true',visibility:'hidden'});
 const backdrop=svgNode('rect',{x:1297.85,y:134.84,width:595.77,height:398.81});
 const picture=svgNode('image',{x:1297.85,y:134.84,width:595.77,height:398.81,preserveAspectRatio:'xMidYMid slice'});
 const badges=svgNode('g');
 preview.append(backdrop,picture,badges);content.append(preview);
 // A moving preview (preview_video in projects.json) runs over the still while its row is hovered or focused,
 // cut to the frame like the stills (slice) and from its start on every visit (Marco). Like the clips of the
 // project pages it hangs on the body — WebKit misplaces video inside a foreignObject — and is laid over the
 // frame in page pixels. It shows once it has a picture; until then, and with reduced motion, the still stays.
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),clips=new Map();let playing=null;
 for(const project of projects){
  if(!project.preview_video)continue;
  const video=document.createElement('video');video.className='preview-clip';video.src=project.preview_video;
  video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';
  video.setAttribute('aria-hidden','true');
  video.addEventListener('playing',()=>{if(playing===video)video.classList.add('ready')});
  document.body.append(video);clips.set(project,video);
 }
 const place=()=>{if(!playing)return;const b=backdrop.getBoundingClientRect();
  Object.assign(playing.style,{left:(b.left+window.scrollX)+'px',top:(b.top+window.scrollY)+'px',width:b.width+'px',height:b.height+'px'})};
 // Rewound as soon as it leaves, so the next visit starts on a picture that is already there.
 const stop=()=>{if(!playing)return;playing.pause();playing.classList.remove('ready');playing.currentTime=0;playing=null};
 const play=project=>{
  const video=reduced.matches?null:clips.get(project);
  if(playing!==video)stop();
  if(!video)return;
  playing=video;place();
  if(video.readyState>=2&&!video.seeking)video.classList.add('ready');
  video.play().catch(()=>{});
 };
 window.addEventListener('resize',place);
 cleanupRoute=()=>{window.removeEventListener('resize',place);for(const video of clips.values()){video.pause();video.remove()}};
 baselines.slice(0,projects.length).forEach((y,i)=>{
  const project=projects[i];
  const row=svgNode('g',{'class':'project-row',tabindex:0,'aria-label':[project.title,project.client,project.area,project.year,...(project.awards||[]).map(name=>awards[name]?.label||name)].filter(Boolean).join(', ')});
  row.append(svgNode('rect',{x:26.38,y:boundaries[i],width:1244.34,height:boundaries[i+1]-boundaries[i],fill:'transparent'}));
  [[26.87,project.title,false],[400,project.client,true],[775,project.area,true],[1233.6,project.year,true]].forEach(([x,label,light])=>row.append(svgNode('text',{x,y,'font-family':light?lightFace:roman,'font-size':20,'font-weight':400},label)));
  function show(){
   const scale=window.innerWidth/1920;
   const badgeSpace=project.awards?.length?awardOffset+awardHeight:0;
   const top=Math.max(window.scrollY/scale+80,Math.min(y-155,(window.scrollY+window.innerHeight)/scale-58.08-398.81-badgeSpace));
   backdrop.setAttribute('y',top);picture.setAttribute('y',top);
   if(project.preview){picture.setAttribute('href',project.preview);picture.style.display=''}else{picture.removeAttribute('href');picture.style.display='none'}
   badges.replaceChildren(awardRow(project.awards,1297.85,top+398.81+awardOffset));
   preview.setAttribute('visibility','visible');
   play(project);
  }
  const hide=()=>{preview.setAttribute('visibility','hidden');stop()};
  row.addEventListener('pointerenter',show);row.addEventListener('pointerleave',hide);row.addEventListener('focus',show);row.addEventListener('blur',hide);
  if(project.url){row.setAttribute('role','link');const open=()=>location.assign(project.url);row.addEventListener('click',open);row.addEventListener('keydown',e=>{if(e.key==='Enter')open()})}
  table.append(row);
 });
}
// The list follows the film strip: head rule from diary.svg, every row ends where its frame ends.
const diaryFirst=332.53;
// Picture frames of the hover preview; caption and text keep their place under both (diary_auswahl.svg,
// diary_auswahl_hoch.svg). Offsets are measured from the top of the frame, which both drawings share.
// How much of the remaining distance the roll covers per frame — lower is slower and softer.
const rollEase=.24;
// One continuous strip: the drawn end as head, the same shape turned around as foot, and the perforation
// on its own pitch. Frames step by 80.09 and holes by 7.65 — neither divides into the other, so repeating
// the drawn segment as a whole would break the hole rhythm at every seam.
function filmStrip(count){
 const film=screens.film,frameTop=index=>diaryFirst+index*film.pitch-film.height;
 const stripTop=frameTop(0)-film.first;
 // The head leaves one side short; at the foot the same is true of the other side.
 const [late,early]=[...film.holes].sort((a,b)=>b.top-a.top);
 const head=late.top-film.top,foot=early.top+early.height-film.top;
 const reach=frameTop(count-1)+film.height+film.first-stripTop;
 const steps=Math.max(0,Math.round((reach-head-foot)/film.perf));
 const length=head+foot+steps*film.perf;
 const shift=stripTop-film.top,middle=(film.left+film.right)/2,width=film.right-film.left;
 const group=svgNode('g',{'class':'film','aria-hidden':'true',transform:`translate(0,${shift.toFixed(2)})`});
 const perforation=film.holes.map(hole=>{
  let d='';
  for(let step=0;step<=steps;step++)
   d+=hole.d.replace(/^M(-?[\d.]+),(-?[\d.]+)/,(all,x)=>`M${x},${(hole.top+hole.lead+step*film.perf).toFixed(3)}`);
  return d;
 }).join('');
 const mask=svgNode('mask',{id:'diary-perforation',maskUnits:'userSpaceOnUse',x:film.left-2,y:film.top-2,width:width+4,height:length+4});
 mask.append(svgNode('rect',{x:film.left-2,y:film.top-2,width:width+4,height:length+4,fill:'#fff'}),
             svgNode('path',{d:perforation,fill:'#000'}));
 const clip=svgNode('clipPath',{id:'diary-film'});
 clip.append(svgNode('rect',{x:film.left,y:film.top,width,height:length}));
 const base=svgNode('g',{mask:'url(#diary-perforation)','clip-path':'url(#diary-film)',fill:film.fill});
 base.append(svgNode('path',{d:film.outline}),
             svgNode('rect',{x:film.left,y:film.top+film.cap,width,height:Math.max(0,length-2*film.cap)}),
             svgNode('path',{d:film.outline,transform:`rotate(180 ${middle} ${(film.top+film.top+length)/2})`}));
 group.append(mask,clip,base);
 return {group,film,bottom:stripTop+length,frameTop:index=>frameTop(index)-shift};
}
// The frames are prepared pictures: already cropped to the window, already turned upright where the
// shot was wide, already negative (scripts/prepare_negatives.py). Nothing to compute while scrolling.
const filmFrame=(entry,kind)=>entry.src.replace(/([^/]+)\.[^.]+$/,`${kind}/$1.jpg`);
function filmFrames(strip,film,frameTop){
 entries.forEach((entry,index)=>{
  strip.append(svgNode('rect',{x:film.x,y:frameTop(index),width:film.width,height:film.height}));
  strip.append(svgNode('image',{href:filmFrame(entry,'negative'),x:film.x,y:frameTop(index),
   width:film.width,height:film.height,preserveAspectRatio:'xMidYMid slice'}));
 });
}
// The roll lies along the foot of the large view, the whole strip turned a quarter turn to the left
// (diary_gallerieansicht1-rolle.svg / …2-rolle.svg). It is the navigation: the frame under the drawn rule
// is the entry on show, the wheel walks along the roll — down and to the right, up and to the left — and
// a frame can be clicked. The roll itself is built once and moved along, so scrolling never reloads it.
let rollGroup=null,rollOffset=0,rollTarget=0,rollMarker=0,rollPlace=()=>{};
function rollUnderView(group,keep){
 const film=screens.film;
 const rule=[...group.querySelectorAll('line')].find(line=>line.getAttribute('x1')===line.getAttribute('x2'));
 if(!rule)return;
 rollMarker=Number(rule.getAttribute('x1'));
 const centre=index=>diaryFirst+index*film.pitch-film.height/2;
 if(!rollGroup){
  rollGroup=svgNode('g',{'class':'entry-roll'});
  const {group:strip,frameTop}=filmStrip(entries.length);
  filmFrames(strip,film,frameTop);
  entries.forEach((entry,index)=>{
   const hit=svgNode('rect',{x:film.x,y:frameTop(index),width:film.width,height:film.height,fill:'transparent',
    'class':'roll-frame',role:'button',tabindex:-1,'aria-label':`${entry.date}, ${entry.location}`});
   hit.addEventListener('click',()=>openEntry(index,'jump'));
   strip.append(hit);
  });
  const clip=svgNode('clipPath',{id:'diary-band'});
  clip.append(svgNode('rect',{x:0,y:film.band.top,width:1920,height:film.band.height}));
  const slider=svgNode('g',{'class':'roll-slider'});slider.append(strip);
  const band=svgNode('g',{'clip-path':'url(#diary-band)'});band.append(slider);
  rollGroup.append(clip,band);
  rollPlace=()=>slider.setAttribute('transform',`translate(${rollOffset.toFixed(2)} ${(film.rollTop+film.right).toFixed(2)}) rotate(-90)`);
  let pendingFrame=0;
  const bounds=()=>[rollMarker-centre(entries.length-1),rollMarker-centre(0)];
  // A wheel notch arrives as one coarse step; easing toward it turns that into a movement.
  const paint=()=>{
   pendingFrame=0;
   const [low,high]=bounds();
   rollTarget=Math.min(high,Math.max(low,rollTarget));
   const gap=rollTarget-rollOffset;
   rollOffset+=Math.abs(gap)<.5?gap:gap*rollEase;
   rollPlace();
   const under=Math.min(entries.length-1,Math.max(0,Math.round((rollMarker-rollOffset-centre(0))/film.pitch)));
   if(under!==viewIndex)openEntry(under,'scroll');
   if(Math.abs(rollTarget-rollOffset)>.5)pendingFrame=requestAnimationFrame(paint);
  };
  const walk=event=>{
   event.preventDefault();
   rollTarget-=(event.deltaY+event.deltaX)/(window.innerWidth/1920);
   if(!pendingFrame)pendingFrame=requestAnimationFrame(paint);
  };
  main.addEventListener('wheel',walk,{passive:false});
  cleanupView=()=>{cancelAnimationFrame(pendingFrame);main.removeEventListener('wheel',walk);rollGroup=null};
 }
 if(!keep)rollOffset=rollTarget=rollMarker-centre(viewIndex);
 if(rollGroup.parentNode!==group)group.append(rollGroup);rollPlace();
}
const viewLayouts=new Map();
function viewLayout(portrait){
 const key=portrait?'diary_gallerieansicht1':'diary_gallerieansicht2';
 if(!viewLayouts.has(key)){
  const template=document.createElement('template');template.innerHTML=screens[key].body;
  const group=template.content.querySelector('[id="inhalt"]');
  const rect=group.querySelector('rect');
  const rule=[...group.querySelectorAll('line')].find(n=>n.getAttribute('x1')===n.getAttribute('x2'));
  viewLayouts.set(key,{frame:Object.fromEntries(['x','y','width','height'].map(a=>[a,rect.getAttribute(a)])),rule:rule?Object.fromEntries([...rule.attributes].map(a=>[a.name,a.value])):null});
 }
 return viewLayouts.get(key);
}
// The big picture is a full size photograph; holding the neighbours ready keeps the swap from
// costing a frame when the roll walks from one entry to the next.
const warmed=new Set();
const warmNeighbours=index=>{
 for(const step of [1,-1]){
  const at=(index+step+entries.length)%entries.length;
  if(warmed.has(at))continue;
  warmed.add(at);const picture=new Image();picture.src=entries[at].src;
 }
};
function openEntry(index,how){
 const fresh=viewIndex===null;
 if(fresh){cleanupView();cleanupView=()=>{};rollGroup=null;viewFocus=index;main.dataset.scroll=window.scrollY}
 viewIndex=(index+entries.length)%entries.length;
 const entry=entries[viewIndex],portrait=entry.orientation==='portrait';
 warmNeighbours(viewIndex);
 // Keep the roll, its filters and all controls mounted while changing the positive image.
 if(!fresh){
  const svg=main.querySelector('svg'),group=svg.querySelector('[id="inhalt"]');
  const layout=viewLayout(portrait),picture=group.querySelector('.view-picture');
  for(const [name,value] of Object.entries(layout.frame))picture.setAttribute(name,value);
  picture.setAttribute('href',entry.src);
  const rule=[...group.querySelectorAll('line')].find(n=>n.getAttribute('x1')===n.getAttribute('x2'));
  if(rule&&layout.rule)for(const [name,value] of Object.entries(layout.rule))rule.setAttribute(name,value);
  setLines(group.querySelector('.view-caption'),1221.11,475.63,[entry.date,entry.location],24);
  setLines(group.querySelector('.view-story'),1221.11,552.57,wrap(entry.text,20,405),24);
  svg.setAttribute('aria-label',`Diary entry ${viewIndex+1} of ${entries.length}`);
  rollUnderView(group,how==='scroll');
  return;
 }
 cleanupRoute();cleanupRoute=()=>{};
 main.innerHTML=screens[portrait?'diary_gallerieansicht1':'diary_gallerieansicht2'].body;
 document.body.classList.add('view-open');footerRow(footerRows.diary);window.scrollTo(0,0);
 const svg=main.querySelector('svg');
 svg.setAttribute('role','dialog');svg.setAttribute('aria-modal','true');
 svg.setAttribute('aria-label',`Diary entry ${viewIndex+1} of ${entries.length}`);
 const group=svg.querySelector('[id="inhalt"]'),rect=group.querySelector('rect');
 rect.replaceWith(svgNode('image',{'class':'view-picture',x:rect.getAttribute('x'),y:rect.getAttribute('y'),width:rect.getAttribute('width'),height:rect.getAttribute('height'),href:entry.src,preserveAspectRatio:'xMidYMid meet'}));
 group.append(setLines(svgNode('text',{'class':'view-caption','font-family':roman,'font-weight':400,'font-size':20}),1221.11,475.63,[entry.date,entry.location],24));
 group.append(setLines(svgNode('text',{'class':'view-story','font-family':roman,'font-weight':400,'font-size':20}),1221.11,552.57,wrap(entry.text,20,405),24));
 rollUnderView(group,how==='scroll');
 // No list to go back to, so the drawn cross goes.
 for(const line of group.querySelectorAll('line'))if(line.getAttribute('y1')==='116.08'&&['1875.83','1893.62'].includes(line.getAttribute('x1')))line.remove();
 [[31.1,539.87,'Previous entry',()=>openEntry(viewIndex-1)],[1888.9,539.87,'Next entry',()=>openEntry(viewIndex+1)]]
  .forEach(([x,y,label,action])=>{
   const hit=svgNode('rect',{x:x-22,y:y-22,width:44,height:44,fill:'transparent','class':'view-control',role:'button',tabindex:0,'aria-label':label});
   hit.addEventListener('click',action);hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}});
   group.append(hit);
  });
 if(how!=='scroll'&&how!=='route')group.querySelector('.view-control').focus({preventScroll:true});
}
// The lines of a drawn text in reading order, each with its baseline and left edge in the drawing's units. A line
// may be split into several tspans (Illustrator kerns that way); they join in the order they stand. A text without
// tspans is one line. matrix maps the text's own units into those of the drawing.
const readLines=(text,matrix)=>{
 const leaves=[...text.querySelectorAll('tspan')].filter(t=>!t.querySelector('tspan'));
 const lines=[];let x=+(text.getAttribute('x')||0),y=+(text.getAttribute('y')||0);
 for(const leaf of leaves.length?leaves:[text]){
  const own=leaf.closest('[y]');if(own&&text.contains(own))y=+own.getAttribute('y');
  const left=leaf.closest('[x]');if(left&&text.contains(left))x=+left.getAttribute('x');
  const point=matrix?new DOMPoint(x,y).matrixTransform(matrix):{x,y};
  const last=lines.at(-1);
  if(last&&Math.abs(last.y-point.y)<.5)last.text+=leaf.textContent;
  else lines.push({x:point.x,y:point.y,text:leaf.textContent});
 }
 return lines;
};
// Lines of one step join into paragraphs; a wider gap, or an empty line, is a blank line (null) as on the desktop.
// A line that ends although the next word would still have fitted (measured in Rotis at the desktop size, against
// the longest line of the text, at least against floor) was broken by hand — the colours of sentry, one per
// line — and stays broken. The text column of a project page was broken at 405, so that is its floor.
const paragraphsOf=(lines,step,size=20,floor=0)=>{
 const out=[];let current=null,previous=null,before='';
 const words=lines.map(line=>line.text.replace(/\s+/g,' ').trim()),widest=Math.max(floor,...words.map(w=>measure(w,size)));
 lines.forEach((line,index)=>{
  const text=words[index];
  if(previous!==null&&current!==null&&(!text||line.y-previous>step*1.5)){
   out.push(current);current=null;
   for(let k=1;k<Math.round((line.y-previous)/step);k++)out.push(null);
  }
  // A tenth of the measure as margin: Illustrator and the export script break a little differently from this measure.
  if(text&&current!==null&&measure(`${before} ${text.split(' ')[0]}`,size)<=widest*.9){out.push(current);current=null}
  if(text)current=current?`${current} ${text}`:text;
  previous=line.y;before=text;
 });
 if(current!==null)out.push(current);
 return out;
};
const stepOf=lines=>{const gaps=lines.slice(1).map((line,i)=>line.y-lines[i].y).filter(gap=>gap>1);return gaps.length?Math.min(...gaps):24};
// Mobile home: the welcome line, the portrait in its desktop crop, then “two clients” and its text — at 30 px from
// 39.16, broken where the pictures end (459.01). Blocks stand 54 apart (one and a half lines of 36).
function setupMobileHome(){
 const P=projectMobile,holder=document.createElement('div');holder.innerHTML=screens.home.body;
 const source=holder.querySelector('svg'),svg=svgNode('svg',{'aria-label':'Marco Pröfrock'});
 const texts=[...source.querySelectorAll('text')].map(text=>{
  const [,tx=0,ty=0]=/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)/.exec(text.getAttribute('transform')||'')||[];
  return readLines(text,new DOMMatrix([1,0,0,1,+tx,+ty]));
 }).sort((a,b)=>a[0].y-b[0].y);
 const set=(lines,baseline,step=P.step)=>{svg.append(setLines(svgNode('text',{'font-size':P.size}),P.left,baseline,lines,step));return baseline+(lines.length-1)*step};
 const block=lines=>paragraphsOf(lines,stepOf(lines)).flatMap(p=>p===null?['']:wrapSet(p,P.size-1,P.right-P.left));
 // hi i am marco …
 let last=set(block(texts[0]),93.67+55.08);
 // The portrait keeps the crop of the desktop (its clip in index.svg), widened onto the column.
 const clip=source.querySelector('clipPath rect'),picture=source.querySelector('image');
 const [cx,cy,cw,ch]=['x','y','width','height'].map(k=>+clip.getAttribute(k)),height=ch*(P.right-P.left)/cw,top=last+P.descent+P.gap;
 const frame=svgNode('svg',{x:P.left,y:top,width:P.right-P.left,height,viewBox:`${cx} ${cy} ${cw} ${ch}`,preserveAspectRatio:'xMidYMid slice'});
 frame.append(picture.cloneNode(true));svg.append(frame);
 // two clients, then its text at the distance the desktop has between them.
 let baseline=top+height+P.gap+P.ascent;
 for(let i=1;i<texts.length;i++){
  last=set(block(texts[i]),baseline);
  if(texts[i+1])baseline=last+(texts[i+1][0].y-texts[i].at(-1).y)*P.ratio;
 }
 svg.setAttribute('viewBox',`0 0 ${mobileWidth} ${(last+P.descent+P.gap).toFixed(2)}`);
 main.replaceChildren(svg);
}
// Mobile contact and imprint: built like the mobile vita — a heading, then each entry as rows under a rule, at
// 30 px from 39.16. An entry is its label, then its value; a value that links keeps its link.
function setupMobileInfo(route){
 const svg=svgNode('svg',{'aria-label':route});
 if(infoLang[route])svg.setAttribute('lang',infoLang[route]);
 let top=vitaMobile.head;
 const text=(y,words,href)=>{const t=svgNode('text',{x:vitaMobile.margin,y,'font-size':mobileType.size},words);
  if(!href)return t;const a=svgNode('a',{href});if(/^https?:/.test(href)){a.setAttribute('target','_blank');a.setAttribute('rel','noopener')}a.append(t);return a};
 const block=lines=>{
  lines.forEach(([words,href],i)=>svg.append(text(top+vitaMobile.top+i*vitaMobile.step,words,href)));
  top+=vitaMobile.top+(lines.length-1)*vitaMobile.step+vitaMobile.tail;
  svg.append(svgNode('line',{x1:15.15,x2:484.96,y1:top,y2:top,stroke:'black','stroke-width':.5}));
 };
 for(const [heading,rows] of infoPages[route]){
  block(wrapSet(heading,mobileType.set,projectMobile.right-projectMobile.left).map(line=>[line]));
  for(const [label,value,href] of rows){
   const values=(Array.isArray(value)?value:[value]).flatMap(v=>wrapSet(v,mobileType.set,projectMobile.right-projectMobile.left));
   block([...(label?[[label]]:[]),...values.map(v=>[v,href])]);
  }
 }
 svg.setAttribute('viewBox',`0 0 ${mobileWidth} ${top.toFixed(2)}`);
 main.replaceChildren(svg);
}
// Mobile project page: the desktop drawing read once more on 498.17. First the text column, set again at 30 px from
// 39.16 and broken at 459.01 — 1.5 times its desktop 20 px, as 36 is 1.5 times 24 — with its
// logo and award marks 1.5 times their size. Then every picture, film and group of touching pictures in the order
// they stand on the desktop, one under the other on the column 39.16 – 459.01, at most 1.5 times their desktop size.
// Captions leave their pictures and are set at 30 px too, above or below them as on the desktop. Films, clips,
// the type tester and the wave lab follow their frames.
// ratio: mobile to desktop type, 24 : 20. Pictures may grow up to cap. Spacing scaled with the type (×0.8).
const projectMobile={left:39.16,right:459.01,size:mobileType.size,step:mobileType.step,ratio:1.2,cap:1.5,first:93.67+39.16,gap:43.2,tester:120,ascent:17,descent:6.4,above:24,below:34.4};
function reflowProject(svg){
 const P=projectMobile,column=P.right-P.left;
 const root=svg.getScreenCTM().inverse(),toRoot=node=>root.multiply(node.getScreenCTM());
 const corners=(b,m)=>{const ps=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));
  const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);return {x:Math.min(...xs),y:Math.min(...ys),r:Math.max(...xs),b:Math.max(...ys)}};
 const meet=(a,b)=>a&&b?{x:Math.max(a.x,b.x),y:Math.max(a.y,b.y),r:Math.min(a.r,b.r),b:Math.min(a.b,b.b)}:a||b;
 const join=(a,b)=>a&&b?{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),r:Math.max(a.r,b.r),b:Math.max(a.b,b.b)}:a||b;
 // A clip path cuts what shows (Opera's motifs are far larger than their frames).
 const clipOf=node=>{const id=/url\(["']?#([^"')]+)/.exec(getComputedStyle(node).clipPath||'')?.[1],shape=id&&document.getElementById(id)?.firstElementChild;
  if(!shape)return null;try{return corners(shape.getBBox(),toRoot(node))}catch{return null}};
 // A picture set “meet” into a larger frame shows only part of it; what counts is the part it fills.
 const shown=(node,b)=>{
  const size=imageSizes[node.getAttribute('href')],fit=node.getAttribute('preserveAspectRatio')||'xMidYMid meet';
  if(!size||/slice|none/.test(fit))return b;
  const s=Math.min(b.width/size[0],b.height/size[1]),w=size[0]*s,h=size[1]*s,at=(edge,axis)=>fit.includes(axis+'Min')?0:fit.includes(axis+'Max')?edge:edge/2;
  return {x:b.x+at(b.width-w,'x'),y:b.y+at(b.height-h,'Y'),width:w,height:h};
 };
 const boxOf=node=>{let b;try{b=node.getBBox()}catch{return null}if(!b.width&&!b.height)return null;
  if(node.tagName==='image')b=shown(node,b);
  let box=corners(b,toRoot(node));
  for(let n=node;n&&n!==svg;n=n.parentElement){const c=clipOf(n);if(c)box=meet(box,c)}
  return box.r>box.x&&box.b>box.y?box:null};
 const marked=node=>node.dataset&&node.dataset.width&&(node.dataset.video||'gif' in node.dataset||'tester' in node.dataset||'wavelab' in node.dataset);
 const markBox=node=>{const d=node.dataset;return {x:+d.x,y:+d.y,r:+d.x+ +d.width,b:+d.y+ +d.height}};
 const shapes='image,rect,path,polygon,polyline,circle,ellipse,line,use,foreignObject';
 // What a node shows apart from its texts.
 const artOf=node=>{if(marked(node))return markBox(node);let box=null;
  for(const n of [node,...node.querySelectorAll(shapes)])if(n.matches(shapes))box=join(box,boxOf(n));return box};
 // Safari reports font sizes with the zoom of main in them; a 100 px probe gives the factor (as in look.js).
 const zoomed=(()=>{const probe=svgNode('text');probe.style.fontSize='100px';svg.append(probe);const z=parseFloat(getComputedStyle(probe).fontSize)/100||1;probe.remove();return z})();
 const sizeOf=text=>parseFloat(text.getAttribute('font-size'))||parseFloat(getComputedStyle(text).fontSize)/zoomed||20;
 const linesOf=text=>readLines(text,toRoot(text));
 const setText=(lines,x,baseline,fill)=>{const t=setLines(svgNode('text',{'font-size':P.size}),x,baseline,lines,P.step);if(fill&&fill!=='rgb(0, 0, 0)')t.setAttribute('fill',fill);return t};
 const fillOf=text=>getComputedStyle(text).fill;
 const place=(node,dx,dy,s)=>{const old=node.getAttribute('transform');node.setAttribute('transform',`translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${s.toFixed(4)})${old?' '+old:''}`)};
 // The credits close the page (export_project_svgs.py); they are set at the very end, after every picture.
 const credits=svg.querySelector(':scope>#Credits');credits?.remove();
 const top=[...svg.children].filter(n=>!['defs','style','title','desc','clipPath','mask'].includes(n.tagName));
 const media=n=>n.matches('[data-project-image],[data-video],[data-clip],[data-gif]')||!!n.querySelector('[data-project-image],[data-video]');
 // The text column starts at 28.45; pictures never start left of 200.
 const inColumn=n=>n.id==='Projekttext'||!media(n)&&(boxOf(n)?.x??Infinity)<200;
 // Measure everything before anything moves.
 const columnNodes=top.filter(inColumn).flatMap(n=>n.id==='Projekttext'?[...n.children]:[n]);
 const items=[];
 for(const node of columnNodes){
  const box=boxOf(node);if(!box)continue;
  if(node.tagName==='text'){
   const lines=linesOf(node),previous=items.at(-1);
   // A paragraph set as several texts, line under line on the same edge and exactly one step on, is one text.
   // A heading 21.6 above its paragraph stays a text of its own.
   if(previous?.lines?.length>1&&Math.abs(previous.lines[0].x-lines[0].x)<1&&Math.abs(lines[0].y-previous.lines.at(-1).y-stepOf(previous.lines))<.5&&previous.size===sizeOf(node)){
    previous.lines.push(...lines);previous.nodes.push(node);previous.box=join(previous.box,box);continue}
   items.push({nodes:[node],lines,box,size:sizeOf(node),fill:fillOf(node)});
  }else items.push({node,box});
 }
 const pieces=top.filter(n=>!inColumn(n)).map(node=>({node,art:artOf(node),texts:[...(node.tagName==='text'?[node]:node.querySelectorAll('text'))]}))
  .filter(p=>p.art||p.texts.length);
 for(const piece of pieces)piece.texts=piece.texts.map(text=>({text,box:boxOf(text),lines:linesOf(text),size:sizeOf(text),fill:fillOf(text)})).filter(t=>t.box&&t.lines.some(l=>l.text.trim()));
 // Pictures that touch or overlap are one group and keep their arrangement.
 const groups=[];
 for(const piece of pieces.filter(p=>p.art)){
  const near=groups.filter(g=>piece.art.x<=g.art.r+2&&piece.art.r>=g.art.x-2&&piece.art.y<=g.art.b+2&&piece.art.b>=g.art.y-2);
  const group={art:piece.art,pieces:[piece],above:[],below:[],inside:[]};
  for(const g of near){group.art=join(group.art,g.art);group.pieces.push(...g.pieces);groups.splice(groups.indexOf(g),1)}
  groups.push(group);
 }
 const overlaps=(a,b)=>a.x<b.r&&a.r>b.x&&a.y<b.b&&a.b>b.y;
 const loose=[];
 // A text inside a picture stays in it; one beside, above or below it becomes its caption. Text standing alone —
 // a heading, the translation next to a post — keeps its own place in the order.
 for(const piece of pieces){
  for(const t of piece.texts){
   const own=piece.art?groups.find(g=>g.pieces.includes(piece)):null;
   const host=own||groups.find(g=>overlaps(t.box,g.art))||groups.find(g=>t.box.x<g.art.r&&t.box.r>g.art.x&&(t.box.y-g.art.b<=40&&t.box.y>=g.art.b-1||g.art.y-t.box.b<=40&&t.box.b<=g.art.y+1));
   if(!host){loose.push({...t,node:piece.node});continue}
   if(overlaps(t.box,host.art))host.inside.push(t);else (t.box.b<=host.art.y+1?host.above:host.below).push(t);
  }
 }
 // Column first.
 items.sort((a,b)=>a.box.y-b.box.y);
 const origin=items.length?items[0].box.y:0;let extra=0,end=P.first;
 for(const item of items){
  const mapY=y=>P.first+(y-origin)*P.ratio+extra;
  if(item.lines){
   const step=stepOf(item.lines),size=item.size*P.ratio,x=P.left+Math.max(0,item.lines[0].x-28.45)*P.ratio;
   const lines=paragraphsOf(item.lines,step,item.size,405).flatMap(p=>p===null?['']:wrapSet(p,size-1,P.right-x));
   const baseline=mapY(item.lines[0].y),t=setLines(svgNode('text',{'font-size':size}),x,baseline,lines,step*P.ratio);
   if(item.fill&&item.fill!=='rgb(0, 0, 0)')t.setAttribute('fill',item.fill);
   item.nodes[0].replaceWith(t);item.nodes.slice(1).forEach(n=>n.remove());
   extra+=((lines.length-1)*step-(item.lines.at(-1).y-item.lines[0].y))*P.ratio;
   end=Math.max(end,baseline+(lines.length-1)*step*P.ratio+P.descent);
  }else{
   const w=item.box.r-item.box.x,h=item.box.b-item.box.y,x=P.left+Math.max(0,item.box.x-28.45)*P.ratio;
   const s=Math.min(P.ratio,(P.right-x)/w),y=mapY(item.box.y);
   place(item.node,x-item.box.x*s,y-item.box.y*s,s);
   extra+=h*(s-P.ratio);end=Math.max(end,y+h*s);
  }
 }
 // Then the pictures and the loose texts, top to bottom, left to right.
 const flow=[...groups.map(g=>({group:g,y:g.art.y,x:g.art.x})),...loose.map(t=>({text:t,y:t.box.y,x:t.box.x}))].sort((a,b)=>a.y-b.y||a.x-b.x);
 let cursor=end+P.gap*1.5;
 const caption=list=>list.sort((a,b)=>a.box.y-b.box.y).flatMap(t=>t.lines.flatMap(l=>l.text.trim()?wrapSet(l.text.trim(),P.size-1,column):[]));
 for(const entry of flow){
  if(entry.text){
   const t=entry.text,lines=paragraphsOf(t.lines,stepOf(t.lines),t.size).flatMap(p=>p===null?['']:wrapSet(p,P.size-1,column));
   const baseline=cursor+P.ascent,set=setText(lines,P.left,baseline,t.fill);
   // In its place, so a link (try for yourself) stays a link and a rising group keeps rising.
   t.text.replaceWith(set);
   cursor=baseline+(lines.length-1)*P.step+P.descent+P.gap;continue;
  }
  const g=entry.group,w=g.art.r-g.art.x,s=Math.min(P.cap,column/w);let h=g.art.b-g.art.y;
  // The wave lab is rebuilt as one column on the phone (waveLabMobile): its frame takes that height once it is placed.
  const lab=g.pieces.find(piece=>'wavelab' in piece.node.dataset)?.node;
  if(lab){h=waveLabMobile(column).height/s;lab.dataset.height=h.toFixed(2);lab.querySelector('rect')?.setAttribute('height',h.toFixed(2));g.art.b=g.art.y+h}
  const above=caption(g.above),below=caption(g.below);
  g.above.concat(g.below).forEach(t=>t.text.remove());
  if(above.length){svg.append(setText(above,P.left,cursor+P.ascent));cursor+=P.ascent+(above.length-1)*P.step+P.above}
  const dx=P.left-g.art.x*s,dy=cursor-g.art.y*s;
  for(const piece of g.pieces){
   const node=piece.node,d=node.dataset;
   // Frames that carry their place as data (films, animations, tester, wave lab) take the new place there too.
   if(marked(node))Object.assign(d,{x:(P.left+(+d.x-g.art.x)*s).toFixed(2),y:(cursor+(+d.y-g.art.y)*s).toFixed(2),width:(+d.width*s).toFixed(2),height:(+d.height*s).toFixed(2)});
   if(!('gif' in d))place(node,dx,dy,s);
  }
  cursor+=h*s;
  // The tester's controls stand below its frame and wrap to three rows on a phone.
  if(g.pieces.some(piece=>'tester' in piece.node.dataset))cursor+=P.tester;
  if(below.length){svg.append(setText(below,P.left,cursor+P.below));cursor+=P.below+(below.length-1)*P.step+P.descent}
  cursor+=P.gap;
 }
 // The rise of each motif is measured anew on the page; the desktop's own start and distance no longer fit.
 svg.querySelectorAll('[data-reveal-start],[data-reveal-distance],[data-reveal-speed],[data-reveal-delay]').forEach(n=>{
  for(const k of ['revealStart','revealDistance','revealSpeed','revealDelay'])delete n.dataset[k]});
 // Credits as on the desktop: the label, its text one step below and broken for the column, the next label
 // 2.5 steps after the last line (60 to 24 there).
 if(credits){
  let baseline=cursor+P.ascent;
  for(const t of credits.querySelectorAll('text')){
   const lines=[t.dataset.label,...t.dataset.body.split('\n').flatMap(p=>wrapSet(p,P.size-1,column))];
   svg.append(setText(lines,P.left,baseline));baseline+=(lines.length-1)*P.step+2.5*P.step;
  }
  cursor=baseline-2.5*P.step+P.descent+P.gap;
 }
 svg.setAttribute('viewBox',`0 0 ${mobileWidth} ${(cursor+P.gap).toFixed(2)}`);
}
function setupMobileArchive(){
 // Positions and row spacing come from archive-mobile.svg (498.17 × 1080).
 const width=mobileWidth,top=517.46;
 document.querySelector('header').innerHTML=`<nav><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${top}">
 <a href="#home"><text x="39.16" y="57.79">marco pröfrock</text></a>
 ${menuButton}
 <line x1="15.15" y1="93.67" x2="484.96" y2="93.67" stroke="black" stroke-width=".5"/>
 <rect x="0" y="93.67" width="498.09" height="320.02"/>
 <image id="mobile-project-preview" x="0" y="93.67" width="498.09" height="320.02" preserveAspectRatio="xMidYMid slice"/>
 <text class="list-head" x="39.16" y="481.57">project name</text><text class="list-head" x="409.73" y="480.87" letter-spacing=".02em">year</text>
 <line x1="15.15" y1="517.21" x2="484.96" y2="517.21" stroke="black" stroke-width=".5"/>
 </svg></nav>`;
 mobileFooter('archive');
 wireMenuButton();
 // Only real projects; the drawn rows beyond them are placeholders.
 // A title that would run into the year breaks before it and its row grows by one line of 36; Serie 57 sets wider
 // than the Rotis these rows were drawn in (“the right way to say thank you” reached into 2026).
 const count=projects.length,drawn=[top,608.42,699.97,790.93,882.47,973.44,1064.98];
 const titles=projects.map(project=>wrapSet(project.title,mobileType.set,401.52-24-39.16));
 const edges=[top];
 for(let i=0;i<count;i++)edges.push(edges[i]+(drawn[i+1]?drawn[i+1]-drawn[i]:91.25)+(titles[i].length-1)*mobileType.step);
 const svg=svgNode('svg',{viewBox:`0 0 ${width} ${edges[count]}`,'aria-label':'Projects and year'});
 const rows=[];
 for(let i=0;i<count;i++){
  const project=projects[i];
  const row=svgNode('g',{'class':'mobile-project-row','aria-label':`${project.title}, ${project.year}`});
  if(project.url){
   row.setAttribute('role','link');row.setAttribute('tabindex','0');
   row.append(svgNode('rect',{x:15.15,y:edges[i],width:469.81,height:edges[i+1]-edges[i],fill:'transparent'}));
   row.addEventListener('click',()=>{location.hash=project.url});
   row.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();location.hash=project.url}});
  }
  const label=setLines(svgNode('text'),39.16,edges[i]+55.08,titles[i],mobileType.step);
  row.append(label,svgNode('text',{x:401.52,y:edges[i]+59.86},project.year));
  svg.append(row,svgNode('line',{x1:15.15,x2:484.96,y1:edges[i+1],y2:edges[i+1],stroke:'black','stroke-width':.5}));
  rows.push(row);
 }
 main.replaceChildren(svg);
 const preview=document.getElementById('mobile-project-preview');
 let selected=-1,frame=0;
 const update=()=>{
  frame=0;
  const scroll=window.scrollY/zoom();
  let index=0;
  while(index<count-1&&edges[index+1]-top<=scroll+.25)index++;
  if(index===selected)return;
  if(selected>=0){rows[selected].classList.remove('selected');rows[selected].removeAttribute('aria-current')}
  selected=index;rows[index].classList.add('selected');rows[index].setAttribute('aria-current','true');
  const project=projects[index];
  if(project?.preview){preview.setAttribute('href',project.preview);preview.setAttribute('aria-label',project.title);preview.style.display=''}
  else{preview.removeAttribute('href');preview.removeAttribute('aria-label');preview.style.display='none'}
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 cleanupRoute=()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame)};
 update();
}
// Mobile film references: full-width strip, image top 109.04, lower cover 665.90,
// headings 739.39 and list boundary 775.17.
const mobileListTop=()=>775.17;
function setupMobileDiary(){
 const width=mobileWidth,pitch=91.25;
 mobileFooter('diary');
 let selected=-1,expanded=-1,frame=0;
 document.querySelector('header').innerHTML=`<nav><svg viewBox="0 0 ${width} 775.17">
 <defs><clipPath id="mobile-film-window"><rect x="0" y="93.67" width="498.17" height="572.23"/></clipPath></defs>
 <g clip-path="url(#mobile-film-window)" id="mobile-film-band"></g>
 <rect width="498.17" height="93.67" fill="white"/>
 <a href="#home"><text x="39.16" y="57.79">marco pröfrock</text></a>${menuButton}
 <line x1="15.15" y1="93.67" x2="484.96" y2="93.67" stroke="black" stroke-width=".5"/>
 <text class="list-head" x="39.12" y="739.39">date</text><text class="list-head" x="242.87" y="739.39">city</text>
 <line x1="15.12" y1="775.17" x2="484.92" y2="775.17" stroke="black" stroke-width=".5"/>
 </svg></nav>`;
 wireMenuButton();
 document.documentElement.style.setProperty('--list-top','775.17px');
 const {group:strip,film,frameTop}=filmStrip(entries.length);
 filmFrames(strip,film,frameTop);
 const band=document.getElementById('mobile-film-band');
 const slider=svgNode('g');slider.append(strip);band.append(slider);
 const magnification=498.17/(film.right-film.left);
 const filmImages=[...strip.querySelectorAll('image')];
 const filmCarrier=strip.querySelector('g[mask]');
 const showFilm=()=>{
  filmCarrier.setAttribute('fill',expanded>=0?'#000':film.fill);
  slider.setAttribute('transform',`translate(${-film.left*magnification} ${109.04-frameTop(selected)*magnification}) scale(${magnification})`);
  // The opened frame reads as a positive, the rest of the roll stays negative.
  filmImages.forEach((image,index)=>image.setAttribute('href',filmFrame(entries[index],index===expanded?'positive':'negative')));
 };
 const svg=svgNode('svg',{'aria-label':'Diary entries, date and location'});
 const list=svgNode('g');svg.append(list);
 const rows=entries.map((entry,index)=>{
  const row=svgNode('g',{'class':'mobile-entry-row',role:'button',tabindex:0,'aria-expanded':'false','aria-label':`${entry.date}, ${entry.location}`});
  row.append(svgNode('rect',{x:0,y:0,width,height:pitch,fill:'transparent'}));
  row.append(svgNode('text',{x:39.16,y:55.08},entry.date));
  // A city that would reach the plus breaks before it and the row grows by a line of 36, as in the archive.
  const city=wrapSet(entry.location,mobileType.set,429.36-24-240.95),extra=(city.length-1)*mobileType.step;
  row.append(setLines(svgNode('text'),240.95,55.08,city,mobileType.step));
  // Plus while closed, upright stroke while open — the two strokes of diary-mobile.svg share one centre.
  const mark=svgNode('g',{'class':'entry-mark',fill:'none',stroke:'black','stroke-width':1});
  mark.append(svgNode('line',{x1:429.36,x2:460.06,y1:45.77,y2:45.77}),svgNode('line',{x1:444.71,x2:444.71,y1:30.42,y2:61.12}));
  const lines=wrapSet(entry.text,mobileType.set,437);
  const story=setLines(svgNode('text',{'class':'entry-story'}),39.16,132.27+extra,lines,mobileType.step);
  const rule=svgNode('line',{x1:15.15,x2:484.96,y1:pitch+extra,y2:pitch+extra,stroke:'black','stroke-width':.5});
  row.append(mark,story,rule);
  row.base=pitch+extra;row.height=132.27+extra+(lines.length-1)*mobileType.step+36.17;
  row.rule=rule;
  row.addEventListener('click',()=>toggle(index));
  row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(index)}});
  list.append(row);
  return row;
 });
 const layout=()=>{
  let offset=0;
  rows.forEach((row,index)=>{
   const open=index===expanded,height=open?row.height:row.base;
   row.setAttribute('transform',`translate(0,${offset.toFixed(2)})`);
   row.rule.setAttribute('y1',height.toFixed(2));row.rule.setAttribute('y2',height.toFixed(2));
   row.classList.toggle('expanded',open);row.setAttribute('aria-expanded',open?'true':'false');
   offset+=height;
  });
  list.setAttribute('transform',`translate(0,${mobileListTop().toFixed(2)})`);
  svg.setAttribute('viewBox',`0 0 ${width} ${(mobileListTop()+offset).toFixed(2)}`);
 };
 const select=index=>{
  if(index===selected)return;
  if(selected>=0){rows[selected].classList.remove('selected');rows[selected].removeAttribute('aria-current')}
  selected=index;rows[index].classList.add('selected');rows[index].setAttribute('aria-current','true');
  showFilm();
 };
 const update=()=>{
  frame=0;if(expanded>=0)return;
  const scroll=window.scrollY/zoom();
  let index=0,top=rows[0].base;
  while(index<entries.length-1&&top<=scroll+.25){index++;top+=rows[index].base}
  select(index);
 };
 const toggle=index=>{
  expanded=expanded===index?-1:index;
  if(expanded>=0)select(index);
  layout();
  if(expanded<0)update();
  showFilm();
 };
 main.replaceChildren(svg);
 layout();
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 cleanupRoute=()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame)};
 update();
}
// Mobile menu after archive-mobile-menu.svg; the arrow moves in the two steps of the animation exports.
const menuButton=`<g class="menu-button" role="button" tabindex="0" aria-label="Open menu"><rect x="418.25" y="25.19" width="55.53" height="43.52" fill="transparent"/>${[35.19,43.03,50.87,58.71].map(y=>`<line x1="428.25" y1="${y}" x2="463.78" y2="${y}" fill="none" stroke="black" stroke-width="1"/>`).join('')}</g>`;
const menuItems=[['archive',276,311.88,270.19],['diary',366.96,402.85,358.99],['vita',458.5,494.39,446.71]];
const arrowRest=[170.24,35.53],arrowStep=[225.56,35.53],arrowStretch=[225.56,235.45],arrowExit=[435.48,28.69];
const wireMenuButton=()=>{
 const button=document.querySelector('.menu-button');if(!button)return;
 button.addEventListener('click',openMenu);
 button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openMenu()}});
};
const sizeMenu=()=>{
 if(!menu)return;
 menu.querySelector('svg').setAttribute('viewBox',`0 0 ${mobileWidth} ${(window.innerHeight/zoom()).toFixed(2)}`);
};
const setArrow=(item,[x,length])=>{
 item.querySelector('.shaft').style.transform=`translate(${x}px,${item.dataset.y}px) scale(${length},1)`;
 item.querySelector('.head').style.transform=`translate(${x+length}px,${item.dataset.y}px)`;
};
function openMenu(){
 if(menu)return;
 menu=document.createElement('div');menu.className='menu';
 menu.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mobileWidth} 1080" role="dialog" aria-modal="true" aria-label="Menu">
 <text x="39.16" y="57.79">menu</text>
 <g class="menu-close" role="button" tabindex="0" aria-label="Close menu"><rect x="431.2" y="27.19" width="40.58" height="40.58" fill="transparent"/><line x1="463.78" y1="35.19" x2="439.2" y2="59.77"/><line x1="439.2" y1="35.19" x2="463.78" y2="59.77"/></g>
 <line class="rule" x1="15.15" y1="93.67" x2="484.96" y2="93.67"/>
 ${menuItems.map(([label,baseline,rule,arrow])=>`<g class="menu-item" role="link" tabindex="0" data-route="${label}" data-y="${arrow}" aria-label="${label}">
  <rect x="0" y="${rule-91.25}" width="${mobileWidth}" height="91.25" fill="transparent"/>
  <text x="39.16" y="${baseline}">${label}</text>
  <g class="menu-arrow"><g class="shaft"><line x1="0" y1="0" x2="1" y2="0"/></g><g class="head"><polyline points="-9.44,-8.77 0,0 -9.44,9.03"/></g></g>
  <line class="rule" x1="15.15" y1="${rule}" x2="484.96" y2="${rule}"/>
 </g>`).join('')}
 </svg>`;
 document.body.append(menu);document.body.classList.add('menu-open');sizeMenu();
 for(const item of menu.querySelectorAll('.menu-item')){
  setArrow(item,arrowRest);
  const choose=()=>chooseMenu(item);
  item.addEventListener('click',choose);
  item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}});
 }
 const close=menu.querySelector('.menu-close');
 close.addEventListener('click',closeMenu);
 close.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeMenu()}});
 close.focus({preventScroll:true});
}
function chooseMenu(chosen){
 if(menu.dataset.busy)return;
 menu.dataset.busy='1';
 for(const item of menu.querySelectorAll('.menu-item'))setArrow(item,item===chosen?arrowStretch:arrowStep);
 setTimeout(()=>{
  chosen.classList.add('leaving');setArrow(chosen,arrowExit);
  setTimeout(()=>{
   const route=chosen.dataset.route;closeMenu();
   if(route===activeRoute)return;
   location.hash=`#${route}`;
  },300);
 },260);
}
function closeMenu(){
 if(!menu)return;
 menu.remove();menu=null;document.body.classList.remove('menu-open');
 document.querySelector('.menu-button')?.focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{
 if(menu&&e.key==='Escape'){e.preventDefault();closeMenu();return}
 if(viewIndex===null)return;
 if(e.key==='ArrowRight'){e.preventDefault();openEntry(viewIndex+1)}
 if(e.key==='ArrowLeft'){e.preventDefault();openEntry(viewIndex-1)}
 if(e.key==='Tab'){
  const controls=[...main.querySelectorAll('.view-control')],index=controls.indexOf(document.activeElement);
  e.preventDefault();controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();
 }
});
Promise.all([
 ...['screens','projects','awards','diary','vita'].map(name=>fetch(`assets/${name}.json?v=launch17-20261003`).then(r=>{if(!r.ok)throw Error(`${name} could not be loaded`);return r.json()})),
 document.fonts.load('400 20px Serie57Archive').catch(()=>{}),
 fetch('assets/rotis-metrics.json?v=launch17-20261003').then(r=>{if(!r.ok)throw Error('rotis-metrics could not be loaded');return r.json()}).then(metrics=>{rotis=metrics}),
 // The sizes of the project pictures (scripts/prepare_image_sizes.py) shape the mobile project pages; without
 // them those pages still work, each picture then counts with its whole frame.
 fetch('assets/image-sizes.json?v=mobile24-20261003').then(r=>r.ok?r.json():{}).catch(()=>({})).then(sizes=>{imageSizes=sizes}),
]).then(([data,projectList,awardList,diary,vitaData])=>{
 screens=data;awards=awardList;vita=vitaData;
 projects=projectList.sort(newestFirst(projectKey));
 entries=diary.sort(newestFirst(diaryKey));
 projects.forEach(project=>{if(project.preview){const image=new Image();image.src=project.preview}});
 render();window.addEventListener('hashchange',render);
 if(!consent())askConsent();
}).catch(error=>{main.textContent='The website could not be loaded. Please reload the page.';console.error(error)});

// The 13 cuts of 500l/s, one per Stuttgart spring, each with its fixed colour — as in the Illustrator randomizer
// of the thesis (Anhang G). The fonts are web copies with their own names, see prepare_500ls.py.
const cuts=[['01_Q_HS','Hofrat-Seyffer-Quelle','#EDEC3F'],['02_Q_GD','Gottlieb-Daimler-Quelle','#9DE89F'],['03_Q_W1','Wilhelmsbrunnen 1','#62C2B1'],['04_Q_IN','Inselquelle (LEUZE)','#FFC03F'],['05_Q_BU','Berger Urquell','#FFAE3B'],['06_Q_SB','Südquelle (M–B Berg)','#FFE552'],['07_Q_LZ','Leuzequelle (LEUZE)','#FCCF61'],['08_Q_VE','Veielquelle','#D4E458'],['09_Q_MG','Maurischer Garten','#0076AD'],['10_Q_SB2','Schiffmannbrunnen','#00ABC2'],['11_Q_MM','Mombachquelle','#3F526F'],['12_Q_AQ','Auquelle','#235BA8'],['13_Q_KA','Kellerbrunnen alt','#008DB1']]
 .map(([code,name,hex],i)=>({code,name,hex,family:`Archive500ls${String(i+1).padStart(2,'0')}`}));
const testerWords=['Calcium','Magnesium','Sodium','Potassium','Chloride','Sulfate','Bicarbonate','Carbonate','Fluoride','Lithium','Strontium'];
// The type tester of marco.ad/500ls in its drawn frame (data-tester). The preview is the input: an invisible text
// field lies over the whole surface, the typed letters are the visible text and a blinking caret shows where the
// next one goes. Mixed, every letter takes a random cut with its colour, never the same cut twice in a row; the
// baseline wave shifts each letter up or down. Weight: the capitals of the font are the light set, its small
// letters the heavy one. Defaults as on marco.ad: mixed, mixed weight, wave 30 % (100 % is half an em).
// It is HTML inside main and carries the page's zoom like the drawing; update() moves it in with its frame.
function typeTester(marker){
 const height=Number(marker.dataset.height),tester=document.createElement('div');tester.className='tester';
 Object.assign(tester.style,{left:marker.dataset.x+'px',top:marker.dataset.y+'px',width:marker.dataset.width+'px',height:height+'px'});
 tester.innerHTML=`<div class="tester-stage"><input class="tester-input" type="text" maxlength="48" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="type your own text — the preview is the input"><div class="tester-preview" aria-hidden="true"></div></div><div class="tester-caption"></div><div class="tester-controls"><label>cut <select class="tester-cut"><option value="mix">mixed — all 13 cuts</option><optgroup label="single cut (spring)">${cuts.map((cut,i)=>`<option value="${i}">${cut.code.slice(0,2)} · ${cut.name.toLowerCase()}</option>`).join('')}</optgroup></select></label><label>weight <select class="tester-weight"><option value="none">as typed</option><option value="upper">light</option><option value="lower">heavy</option><option value="random">mixed</option></select></label><label>baseline wave <input class="tester-wave" type="range" min="0" max="100" value="30"><span class="tester-wave-value">30%</span></label><button type="button" class="tester-shuffle">shuffle</button></div>`;
 main.append(tester);
 const $=selector=>tester.querySelector(selector),input=$('.tester-input'),preview=$('.tester-preview'),caption=$('.tester-caption');
 const cut=$('.tester-cut'),weight=$('.tester-weight'),wave=$('.tester-wave'),waveValue=$('.tester-wave-value');
 // Every position keeps its own dice, so typing and sliding do not reshuffle the letters already there.
 let rolls=[];
 const pick=previous=>{const i=Math.floor(Math.random()*cuts.length);return previous===undefined||i!==previous?i:(i+1)%cuts.length};
 const ensure=count=>{while(rolls.length<count)rolls.push({cut:pick(rolls[rolls.length-1]?.cut),wave:Math.random()*2-1,capital:Math.random()<.5})};
 const letterCase=(letter,mode,capital)=>!/[a-zA-ZäöüÄÖÜß]/.test(letter)||mode==='none'?letter:mode==='upper'||(mode==='random'&&capital)?letter.toUpperCase():letter.toLowerCase();
 const caret=()=>{const mark=document.createElement('i');mark.className='tester-caret';return mark};
 function render(){
  const text=input.value,amplitude=Number(wave.value)/200;ensure(text.length);
  const at=document.activeElement===input&&input.selectionStart!==null?input.selectionStart:text.length;
  preview.replaceChildren();
  for(let i=0;i<text.length;i++){
   if(i===at)preview.append(caret());
   if(/\s/.test(text[i])){preview.append(' ');continue}
   const face=cut.value==='mix'?cuts[rolls[i].cut]:cuts[Number(cut.value)],letter=document.createElement('span');
   letter.textContent=letterCase(text[i],weight.value,rolls[i].capital);letter.dataset.i=i;
   Object.assign(letter.style,{fontFamily:face.family,color:face.hex});
   if(amplitude)letter.style.transform=`translateY(${(-rolls[i].wave*amplitude).toFixed(3)}em)`;
   preview.append(letter);
  }
  if(at>=text.length)preview.append(caret());
  fit();
 }
 // As large as the surface allows for whatever is typed, with the largest wave always kept free, so the size never
 // moves with the slider. Both sides are measured on screen and divided by the frame's scale — the zoom of main
 // then cannot come between them.
 function fit(){
  preview.style.fontSize='';
  const stage=preview.parentNode,scale=stage.getBoundingClientRect().height/height,padding=getComputedStyle(stage);
  if(!scale)return;
  const room=height-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom);
  for(let size=parseFloat(getComputedStyle(preview).fontSize),step=0;step<60&&size>16;step++,size*=.97){
   preview.style.fontSize=size+'px';
   if(preview.getBoundingClientRect().height/scale+size<=room)break;
  }
 }
 function describe(){
  if(cut.value==='mix'){caption.textContent='13 cuts · randomly mixed · no cut twice in a row';return}
  const face=cuts[Number(cut.value)],swatch=document.createElement('i');swatch.style.background=face.hex;
  caption.replaceChildren(swatch,`${face.code.slice(0,2)} · ${face.name.toLowerCase()} · ${face.hex.toLowerCase()}`);
 }
 // The real field below is invisible, so its own hit test would land anywhere: the caret goes to the edge of the
 // letter that was clicked.
 const letterAt=(x,y)=>{
  let best=input.value.length,distance=Infinity;
  for(const letter of preview.querySelectorAll('span[data-i]')){
   const r=letter.getBoundingClientRect(),i=Number(letter.dataset.i),off=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;
   if(off*3+Math.abs(r.left-x)<distance){distance=off*3+Math.abs(r.left-x);best=i}
   if(off*3+Math.abs(r.right-x)<distance){distance=off*3+Math.abs(r.right-x);best=i+1}
  }
  return best;
 };
 const placeCaret=e=>{const i=letterAt(e.clientX,e.clientY);setTimeout(()=>{input.setSelectionRange(i,i);render()},0)};
 input.addEventListener('pointerdown',placeCaret);
 for(const type of ['input','keyup','focus','blur','select'])input.addEventListener(type,render);
 cut.addEventListener('change',()=>{describe();render()});weight.addEventListener('change',render);
 wave.addEventListener('input',()=>{waveValue.textContent=`${wave.value}%`;render()});
 $('.tester-shuffle').addEventListener('click',()=>{rolls=[];render()});
 input.value=testerWords[Math.floor(Math.random()*testerWords.length)];
 cut.value='mix';weight.value='random';wave.value='30';waveValue.textContent='30%';
 describe();render();
 // All 13 cuts are set once, invisibly, so every face loads now and shuffling never waits for one — WebKit let a
 // bare document.fonts.load() this early pass without loading. The size is fitted again once they are there.
 const probes=document.createElement('div');probes.className='tester-probes';probes.setAttribute('aria-hidden','true');
 probes.append(...cuts.map(face=>{const probe=document.createElement('span');probe.style.fontFamily=face.family;probe.textContent='Aa';return probe}));
 tester.append(probes);void probes.offsetWidth;
 Promise.all(cuts.map(face=>document.fonts.load(`100px ${face.family}`))).then(render,()=>{});
 return tester;
}
// The specimen film of marco.ad/500ls (data-scrub): the character set, glyph by glyph. With a mouse it stands still
// and moves only while the pointer slides over it — the top edge is the first glyph, the bottom edge the last;
// leaving keeps the picture. On touch it loops while in view, unless motion is reduced. Like the clips it hangs on
// the body, laid over its frame in page pixels and cut to it like its still.
function scrubFilm(marker,route,signal){
 const stage=document.createElement('div');stage.className='project-scrub';
 const video=document.createElement('video');video.src=marker.dataset.scrub;
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';
 const still=marker.querySelector('image');if(still)video.poster=still.getAttribute('href');
 video.setAttribute('aria-label',`${route} — the full character set, glyph by glyph`);
 const line=document.createElement('i');stage.append(video,line);document.body.append(stage);
 const scrub=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
 if(scrub){
  // Some engines paint the first picture only after a seek.
  const rest=()=>{video.pause();if(!video.currentTime)video.currentTime=.04};
  if(video.readyState>=2)rest();else video.addEventListener('loadeddata',rest,{once:true,signal});
  window.addEventListener('mousemove',e=>{
   const b=stage.getBoundingClientRect(),inside=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom;
   stage.classList.toggle('scrubbing',inside);
   if(!inside||!Number.isFinite(video.duration))return;
   const ratio=(e.clientY-b.top)/b.height;
   video.currentTime=ratio*video.duration;line.style.top=`${ratio*100}%`;
  },{passive:true,signal});
 }else video.loop=true;
 return {marker,stage,video,scrub};
}
// The 13 springs as measured (mg/l, outflow temperature in °C) and the spacing of their three waves in the wave
// files — the data behind the wave lab of marco.ad/500ls, in the order of the cuts.
const springs=[[9010,12900,590,110,385,1910,18.7,120],[2010,4400,1350,189,469,1590,17.7,111.6],[911,1340,716,116,1680,1280,17.6,101.7],[1010,1450,725,104,2070,1190,20,98.4],[667,939,639,97.4,1450,1060,20.3,93.1],[476,685,561,93.6,1060,928,19.1,87],[667,966,551,93.2,1420,956,19.3,88.4],[537,835,553,89.4,1040,851,17.8,83],[49.9,96.4,299,76.1,162,616,16,68.3],[38.3,76.3,213,62.1,109,385,17.4,46.8],[17.1,72.1,215,57.8,61,357,14.7,43.3],[17.1,60.7,209,59,70,342,15.6,41.4],[24.3,59.9,201,59.7,49,332,16,40]]
 .map(([Na,Cl,Ca,Mg,CO2,SO4,t,pitch])=>({Na,Cl,Ca,Mg,CO2,SO4,t,pitch}));
// What every value shapes, in the words of marco.ad (the brandbook's mapping), and the range the wave generator of
// the thesis spreads it over (Anhang D) — logarithmic for sodium, chloride and sulfate — which the bar of each value shows.
const shapes=[['Na','sodium','frequency','mg/l','sodium gives the number of wave periods, the frequency',17.1,9010,true],['Cl','chloride','amplitude','mg/l','chloride gives the amplitude, the deflection up and down',59.9,12900,true],['Ca','calcium','crest shape','mg/l','calcium gives the shape of the crests, the upper half-waves',197,1350,false],['Mg','magnesium','trough shape','mg/l','magnesium gives the shape of the troughs, the lower half-waves',57.8,189,false],['CO2','carbon dioxide','band thickness','mg/l','carbon dioxide gives the thickness of the band, the weight of the wave',49,2070,false],['SO4','sulfate','wave spacing','mg/l','sulfate gives the spacing between the upper, middle and lower wave',332,1910,true],['t','temperature','colour','°C','temperature gives the colour of the spring',14.7,20.3,false]];
// Ink of the R in every cut — left edge, right edge, cap height — from the font outlines. The letter is scaled by what
// is visible: the layout box of these fonts is half again as tall, and the R came out four rows high by it.
const inkR=[[25,124,700],[21,145,659],[25,172,599],[25,174,581],[24,172,550],[27,190,527],[25,173,522],[23,188,490],[50,345,402],[62,433,276],[82,576,255],[82,577,244],[82,577,236]];
// The wave lab of marco.ad/500ls in its drawn frame (data-wavelab), laid out to be taken in at once: the spring's three
// real waves with the values that shape them below, and beside them the grid those waves make on a din-a sheet with
// the cut's letter on it. marco.ad showed these one after another behind two buttons. Pointing at a value marks on the
// waves what it shapes. Only the 13 real springs, no free sliders, as there. The grid follows the brandbook: a line
// through every crest and every trough, and one under every third wave — the letter then takes 3 × 6 of its units.
// The wave lab on a phone, one thing under the other at the given width: springs (two rows), waves, the seven values,
// two lines of caption, the sheet at 60 % of the width, the spring's name. 24 apart, 24 inside the edge.
const waveLabMobile=width=>{
 const pad=24,inner=width-2*pad,springs=2*18+12,waves=pad+springs+pad,wavesHeight=inner*520/3000;
 const data=waves+wavesHeight+pad,caption=data+shapes.length*24+18,sheet=caption+48+18;
 const sheetWidth=inner*.6,sheetHeight=sheetWidth*4243/3000,name=sheet+sheetHeight+12;
 return {pad,waves,data,caption,sheet,sheetWidth,sheetHeight,name,height:name+24+pad};
};
function waveLab(marker){
 const width=Number(marker.dataset.width),height=Number(marker.dataset.height),small=mobile,M=small?waveLabMobile(width):null,pad=small?M.pad:30,top=72;
 const sheetHeight=small?M.sheetHeight:height-2*top,sheetWidth=small?M.sheetWidth:sheetHeight*3000/4243;
 const column=small?width-2*pad:width-3*pad-sheetWidth,wavesHeight=column*520/3000;
 const lab=document.createElement('div');lab.className=small?'wavelab wavelab-mobile':'wavelab';
 Object.assign(lab.style,{left:marker.dataset.x+'px',top:marker.dataset.y+'px',width:width+'px',height:height+'px'});
 lab.innerHTML=`<div class="wavelab-springs" role="group" aria-label="choose a spring"></div><div class="wavelab-name"></div><svg class="wavelab-waves" viewBox="0 0 3000 520" role="img" aria-label="the three waves of the spring"></svg><div class="wavelab-data"></div><svg class="wavelab-sheet" viewBox="0 0 3000 4243" role="img" aria-label="the grid of the spring with the letter of its cut"></svg><div class="wavelab-caption"></div>`;
 main.append(lab);
 const $=selector=>lab.querySelector(selector),row=$('.wavelab-springs'),name=$('.wavelab-name'),waves=$('.wavelab-waves'),data=$('.wavelab-data'),sheet=$('.wavelab-sheet'),caption=$('.wavelab-caption');
 if(small){
  const at=(node,y,extra={})=>Object.assign(node.style,{left:pad+'px',top:y+'px',...extra});
  at(row,pad,{right:pad+'px'});at(waves,M.waves,{width:column+'px',height:wavesHeight+'px'});at(data,M.data,{width:column+'px'});
  at(caption,M.caption);at(sheet,M.sheet,{width:sheetWidth+'px',height:sheetHeight+'px'});at(name,M.name,{right:'auto'});
 }else{
 Object.assign(waves.style,{left:pad+'px',top:top+'px',width:column+'px',height:wavesHeight+'px'});
 Object.assign(data.style,{left:pad+'px',top:(top+wavesHeight+48)+'px',width:column+'px'});
 Object.assign(sheet.style,{left:(width-pad-sheetWidth)+'px',top:top+'px',width:sheetWidth+'px',height:sheetHeight+'px'});
 }
 // The line at the foot stays under the waves; the name of the spring stands under the sheet.
 caption.style.width=column+'px';
 const labelSize=18*3000/column,firstColumn=Math.max(...shapes.map(([, element])=>measure(element,18)))+24,secondColumn=Math.max(...shapes.map(([,,shape])=>measure(shape,18)))+24,valueColumn=measure('12,900 mg/l',18);
 const within=(value,low,high,log)=>Math.max(0,Math.min(1,log?Math.log(value/low)/Math.log(high/low):(value-low)/(high-low)));
 const cache=new Map();let current=0,shown=null;
 const load=index=>cache.has(index)?Promise.resolve(cache.get(index)):fetch(`assets/projects/500ls/waves/${String(index+1).padStart(2,'0')}.svg`).then(r=>r.text()).then(text=>{
  const numbers=text.match(/points="([^"]+)"/)[1].trim().split(/\s+/).map(Number),points=[];
  for(let i=0;i+1<numbers.length;i+=2)points.push([numbers[i],numbers[i+1]]);
  // The outline runs along the upper edge and back along the lower one.
  let turn=points.length;for(let i=1;i<points.length;i++)if(points[i][0]<points[i-1][0]){turn=i;break}
  const upper=points.slice(0,turn),lower=points.slice(turn),ys=upper.map(p=>p[1]),minY=Math.min(...ys),maxY=Math.max(...ys);
  // Crests are the highest points of the upper edge, troughs its lowest; a turn only counts past 30 % of the swing.
  const crests=[],troughs=[],threshold=Math.max(1,(maxY-minY)*.3);
  let low=Infinity,high=-Infinity,lowPoint=upper[0],highPoint=upper[0],seekTrough=true;
  for(const point of upper){
   const y=point[1];if(y>high){high=y;highPoint=point}if(y<low){low=y;lowPoint=point}
   if(seekTrough&&y<high-threshold){troughs.push(highPoint);low=y;lowPoint=point;seekTrough=false}
   else if(!seekTrough&&y>low+threshold){crests.push(lowPoint);high=y;highPoint=point;seekTrough=true}
  }
  const all=points.map(p=>p[1]),bandTop=Math.min(...all),band=Math.max(...all)-bandTop;
  const period=crests.length>1?(crests[crests.length-1][0]-crests[0][0])/(crests.length-1):600;
  const lowerAt=x=>lower.reduce((best,p)=>Math.abs(p[0]-x)<Math.abs(best[0]-x)?p:best,lower[0])[1];
  const wave={points:points.map(p=>p.join(',')).join(' '),upper:upper.map(p=>p.join(',')).join(' '),lower:lower.map(p=>p.join(',')).join(' '),crests,troughs,minY,maxY,bandTop,band,period,lowerAt};
  cache.set(index,wave);return wave;
 });
 const fallback='three waves, spaced by sulfate — point at a value to see what it shapes';
 function drawWaves(){
  const wave=cache.get(current),spring=springs[current],colour=cuts[current].hex;if(!wave)return;
  // A frame of fixed height, fitted to the tallest spring, so the box never changes size between springs.
  const margin=(520-(wave.band+2*spring.pitch))/2,shift=i=>margin+i*spring.pitch-wave.bandTop,y0=shift(0);
  waves.replaceChildren(...[0,1,2].map(i=>svgNode('polygon',{points:wave.points,fill:colour,transform:`translate(0 ${shift(i)})`})));
  const marks=svgNode('g',{'class':'wavelab-marks'});waves.append(marks);
  const line=(x1,y1,x2,y2,opacity=1)=>marks.append(svgNode('line',{x1,y1,x2,y2,opacity}));
  const label=(x,y,text,anchor='start')=>marks.append(svgNode('text',{x,y,'font-size':labelSize,'text-anchor':anchor},text));
  const bracket=(x,from,to,text,reach)=>{line(x,from,x,to);line(x-reach,from,x+reach,from);line(x-reach,to,x+reach,to);label(x+reach*1.2,(from+to)/2+labelSize*.35,text)};
  const reach=labelSize*1.3,[crests,troughs]=[wave.crests,wave.troughs];
  // Under the lowest wave, so the mark keeps clear of the row of springs above.
  if(shown==='Na'&&crests.length>2){
   const edge=wave.bandTop+wave.band+shift(2),rail=edge+labelSize*.5;
   for(const [x] of crests)line(x,edge,x,rail,.45);
   line(crests[1][0],rail,crests[2][0],rail);label((crests[1][0]+crests[2][0])/2,rail+labelSize*1.05,`1 of ${crests.length} periods`,'middle');
  }
  if(shown==='Cl'&&crests.length)bracket((crests[1]||crests[0])[0],wave.minY+y0,wave.maxY+y0,'amplitude',reach);
  if(shown==='Ca'){marks.append(svgNode('polyline',{points:wave.upper,transform:`translate(0 ${y0})`}));label(70,wave.minY+y0-labelSize*.4,'crests')}
  if(shown==='Mg'){marks.append(svgNode('polyline',{points:wave.lower,transform:`translate(0 ${y0})`}));label(70,wave.maxY+y0+labelSize,'troughs')}
  if(shown==='CO2'&&troughs.length){const [x,y]=troughs[1]||troughs[0];bracket(x,y+y0,wave.lowerAt(x)+y0,'thickness',reach*.8)}
  if(shown==='SO4')bracket(260,wave.bandTop+shift(0),wave.bandTop+shift(1),'spacing',reach);
  if(shown==='t')marks.append(svgNode('rect',{x:60,y:wave.minY+y0,width:labelSize*3,height:labelSize*3,fill:colour}));
 }
 function drawSheet(){
  const wave=cache.get(current),spring=springs[current],colour=cuts[current].hex,W=3000,H=4243;if(!wave)return;
  // As many waves as fit with an even margin, the band centred on the sheet.
  const count=Math.max(1,Math.floor((H-48-wave.band)/spring.pitch)+1),start=(H-((count-1)*spring.pitch+wave.band))/2,end=start+(count-1)*spring.pitch+wave.band;
  const field=svgNode('g',{fill:colour,opacity:.25});
  for(let i=0;i<count;i++)field.append(svgNode('polygon',{points:wave.points,transform:`translate(0 ${start+i*spring.pitch-wave.bandTop})`}));
  const grid=svgNode('g',{'class':'wavelab-grid'}),step=wave.period/2,phase=((wave.crests[0]?.[0]??0)%step+step)%step,xs=[],ys=[];
  for(let x=phase;x<W-1;x+=step)if(x>1){xs.push(x);grid.append(svgNode('line',{x1:x,y1:start,x2:x,y2:end}))}
  for(let i=0;i<count;i+=3){const y=start+i*spring.pitch;ys.push(y);grid.append(svgNode('line',{x1:0,y1:y,x2:W,y2:y}))}
  sheet.replaceChildren(field,grid);
  const family=cuts[current].family;
  if(!document.fonts.check(`1000px ${family}`)){const index=current;document.fonts.load(`1000px ${family}`).then(()=>{if(current===index)drawSheet()},()=>{});return}
  // Six rows tall by its ink, near the top; its left ink edge on the grid line closest to a sixth of the width.
  const [left,,cap]=inkR[current],first=Math.max(0,Math.min(1,ys.length-7)),upper=ys[first],base=ys[Math.min(first+6,ys.length-1)],scale=(base-upper)/cap;
  const x=xs.reduce((best,x)=>Math.abs(x-W*.18)<Math.abs(best-W*.18)?x:best,xs[0]??W*.18);
  sheet.append(svgNode('text',{x:0,y:0,'font-size':1000,fill:colour,'class':'wavelab-letter',style:`--cut:${family}`,transform:`translate(${x-left*scale} ${base}) scale(${scale})`},'R'));
 }
 const say=text=>{caption.textContent=text};
 function show(key){
  shown=key;drawWaves();
  for(const entry of data.children)entry.classList.toggle('lit',entry.dataset.key===key);
  const shape=shapes.find(([k])=>k===key);
  say(!shape?fallback:key==='t'?`temperature ${springs[current].t} °C gives ${cuts[current].hex.toLowerCase()}`:shape[4]);
 }
 function select(index){
  current=index;shown=null;
  for(const button of row.children)button.setAttribute('aria-pressed',String(Number(button.dataset.index)===index));
  name.textContent=cuts[index].name.toLowerCase();
  data.replaceChildren(...shapes.map(([key,element,shape,unit,,low,high,log])=>{
   const line=document.createElement('div');line.className='wavelab-row';line.dataset.key=key;line.tabIndex=0;
   line.style.gridTemplateColumns=small?`${firstColumn}px 1fr ${valueColumn*1.15}px`:`${firstColumn}px ${secondColumn}px 1fr ${valueColumn}px`;
   const value=springs[index][key],cells=[element,shape,`${value>=1000?Math.round(value).toLocaleString('en-US'):value} ${unit}`];
   // Where this spring stands among all 13, as on the sketch: a thin line from the lowest to the highest, a mark on it.
   const bar=document.createElement('span');bar.className='wavelab-bar';bar.innerHTML=`<i style="left:${(within(value,low,high,log)*100).toFixed(1)}%"></i>`;
   line.append(...cells.map(text=>{const cell=document.createElement('span');cell.textContent=text;return cell}));
   line.insertBefore(bar,line.lastChild);
   line.addEventListener('pointerenter',()=>show(key));line.addEventListener('pointerleave',()=>show(null));
   line.addEventListener('focus',()=>show(key));line.addEventListener('blur',()=>show(null));
   line.addEventListener('click',()=>show(shown===key?null:key));
   return line;
  }));
  say(fallback);
  load(index).then(()=>{if(current===index){drawWaves();drawSheet()}});
 }
 row.append(...cuts.map((cut,index)=>{
  const button=document.createElement('button');button.type='button';button.dataset.index=index;
  button.setAttribute('aria-label',`${cut.code.slice(0,2)} ${cut.name}`);
  const swatch=document.createElement('i');swatch.style.background=cut.hex;
  const number=document.createElement('span');number.textContent=cut.code.slice(0,2);
  button.append(swatch,number);button.addEventListener('click',()=>select(index));return button;
 }));
 row.addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  e.preventDefault();const next=Math.max(0,Math.min(cuts.length-1,current+(e.key==='ArrowRight'?1:-1)));select(next);row.children[next].focus();
 });
 sheet.addEventListener('pointerenter',()=>say('the letter takes 3 × 6 units — lines on crests, troughs, every third wave'));
 sheet.addEventListener('pointerleave',()=>show(shown));
 select(0);
 return lab;
}

async function setupOpera(route){
 const controller=new AbortController();let frame=0;
 cleanupRoute=()=>{controller.abort();cancelAnimationFrame(frame)};
 try{
  const response=await fetch(`assets/project-layouts/${route}.svg?v=launch17-20261003`,{signal:controller.signal});
  if(!response.ok)throw Error('Projektseite konnte nicht geladen werden.');
  const body=await response.text();if(controller.signal.aborted)return;
  if(typeof body==='string')main.innerHTML=body;else main.replaceChildren(buildProjectPage(body[route]));
  if(mobile)reflowProject(main.querySelector('svg'));
  // Films sit over the drawing, not inside it. WebKit lays HTML inside a foreignObject out against the
  // whole drawing instead of the given frame, which blew every player up past the right edge. As an
  // absolutely placed box inside main they land on the same coordinates — main carries the same scale
  // and the drawing starts at its corner — and both engines can only do one thing with that.
  // Every film looks the same: its own still fills the frame, a ring marks it, the player follows on click.
  // Films sit in main only as an empty black frame. The player itself hangs in an overlay on the body,
  // because main is zoomed: WebKit passes that zoom on into the iframe, and the YouTube player came out
  // smaller than its own frame. Outside main nothing is zoomed, so the overlay is placed in plain page
  // pixels — measured off the frame — and follows it on every resize.
  const films=[];
  for(const marker of main.querySelectorAll('[data-video]')){
   const box=marker.dataset;
   const frame=document.createElement('div');frame.className='project-film';
   Object.assign(frame.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'});
   const stage=document.createElement('div');stage.className='project-stage';
   // data-direct (video_direct in project-pages.json) puts the player in the frame at once, as on Opera.
   const direct='direct' in box&&consent()==='accepted',poster=direct?null:box.poster||firstPicture();
   // A YouTube film set straight into its frame waits for its own play button; only the click on a still
   // (and the showreels, which are local films) start at once.
   const play=(start=true)=>{
    // The player takes the frame it was drawn into — no own width, no own height. Anything set here
    // is a second size next to the frame's, and the two never agree.
    const video=document.createElement('iframe');video.className='project-video';
    video.src=`https://www.youtube-nocookie.com/embed/${box.video}?rel=0&autoplay=${start?1:0}&playsinline=1&enablejsapi=1`;
    video.title=`${route} — film`;
    video.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    video.allowFullscreen=true;video.referrerPolicy='strict-origin-when-cross-origin';
    // The click on the still is the only click there should be: once the frame answers, we press play
    // through it ourselves, so nobody has to find YouTube's own button underneath.
    if(start)video.addEventListener('load',()=>video.contentWindow?.postMessage(
     JSON.stringify({event:'command',func:'playVideo',args:[]}),'https://www.youtube-nocookie.com'));
    stage.replaceChildren(video);
   };
   if(poster){
    const still=document.createElement('button');still.type='button';still.className='project-still';
    still.setAttribute('aria-label',`${route} — play film`);
    const picture=document.createElement('img');picture.src=poster;picture.alt='';picture.loading='lazy';
    still.append(picture);
    still.insertAdjacentHTML('beforeend','<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="25.5" fill="none" stroke="#fff"/><polygon points="19,15 39,26 19,37" fill="#fff"/></svg>');
    still.addEventListener('click',()=>play());
    stage.append(still);
   }else{
    play(false);
    // A direct player keeps its film's cover (data-poster) over the frame while YouTube loads, so the frame is
    // never black. It goes once the player plays (state 1) or stands ready with that same cover and its own play
    // button (2 paused, 5 cued, or autoplay held back by the browser). YouTube only reports its state after it
    // hears that someone listens. The cover lets every click through to the player underneath.
    if(direct&&box.poster){
     const video=stage.querySelector('iframe'),cover=document.createElement('img'),listening=new AbortController();
     cover.src=box.poster;cover.alt='';cover.style.pointerEvents='none';stage.append(cover);
     // Until the cover is ready the frame stays empty, like any picture before it has loaded — no black at all.
     // Whatever comes first — cover ready or player running — makes the frame visible.
     const show=()=>{stage.style.visibility=''};
     frame.style.background='none';stage.style.background='none';stage.style.visibility='hidden';
     if(cover.complete)show();else{cover.addEventListener('load',show,{once:true});cover.addEventListener('error',show,{once:true})}
     const drop=()=>{cover.remove();show();listening.abort()};
     controller.signal.addEventListener('abort',()=>listening.abort());
     window.addEventListener('message',e=>{
      if(e.source!==video.contentWindow)return;
      let data;try{data=JSON.parse(e.data)}catch{return}
      if([1,2,5].includes(data.info?.playerState)||data.event==='onAutoplayBlocked')drop();
     },{signal:listening.signal});
     video.addEventListener('load',()=>{
      video.contentWindow?.postMessage(JSON.stringify({event:'listening',id:1,channel:'widget'}),'https://www.youtube-nocookie.com');
      // A player that never reports must not stay hidden: 4 s after loading the cover goes anyway.
      setTimeout(drop,4000);
     },{signal:listening.signal});
    }
   }
   main.append(frame);document.body.append(stage);marker.remove();
   films.push({frame,stage});
  }
  const placeFilms=()=>{for(const {frame,stage} of films){
   const bounds=frame.getBoundingClientRect();
   Object.assign(stage.style,{left:(bounds.left+window.scrollX)+'px',top:(bounds.top+window.scrollY)+'px',
    width:bounds.width+'px',height:bounds.height+'px'});
  }};
  if(films.length){
   placeFilms();
   window.addEventListener('resize',placeFilms,{signal:controller.signal});
   // The stages hang on the body, so they outlive main. From the moment they exist, leaving the route
   // has to take them along — a click during loading would otherwise leave a player behind.
   const dropped=cleanupRoute;cleanupRoute=()=>{dropped();for(const {stage} of films)stage.remove()};
  }
  function firstPicture(){
   const picture=main.querySelector('svg image[href*="assets/projects/"]');
   return picture?picture.getAttribute('href'):null;
  }
  // A local animation is an image, not a film — no still, no ring, no player. It hangs inside the drawn
  // frame as an <img> in a foreignObject, because an SVG <image> shows only a GIF's first frame in Safari.
  // The marker keeps data-project-image, so the file rides in on the scroll movement like every other motif.
  for(const marker of main.querySelectorAll('[data-gif]')){
   const box=marker.dataset;
   const area=svgNode('foreignObject',{x:box.x,y:box.y,width:box.width,height:box.height});
   const picture=document.createElement('img');picture.src=box.gif;
   picture.alt=`${route} — animation`;picture.loading='lazy';
   Object.assign(picture.style,{display:'block',width:box.width+'px',height:box.height+'px',objectFit:'contain'});
   area.append(picture);marker.append(area);
  }
  // Native local demo: body overlay follows the complete animated phone, including its bezel.
  const localVideos=[];
  for(const marker of main.querySelectorAll('[data-local-video]')){
   const stage=document.createElement('div');stage.className='project-local-demo';
   const video=document.createElement('video');video.src=marker.dataset.localVideo;
   video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='metadata';
   video.setAttribute('aria-label','Plants with benefits — app demo');
   const [x,y,w,h]=marker.dataset.screen.split(',').map(Number);
   Object.assign(video.style,{left:(x*100)+'%',top:(y*100)+'%',width:(w*100)+'%',height:(h*100)+'%',borderRadius:(Number(marker.dataset.radius)/w*100)+'% / '+(Number(marker.dataset.radius)/h*100)+'%'});
   const bezel=document.createElement('img');bezel.src=marker.dataset.videoFrame;bezel.alt='';
   stage.append(video,bezel);document.body.append(stage);
   const toggle=()=>{if(video.paused)video.play().catch(()=>{});else video.pause()};
   stage.tabIndex=0;stage.setAttribute('role','button');stage.setAttribute('aria-label','Play or pause the app demo');
   stage.addEventListener('click',toggle);
   stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
   localVideos.push({marker,stage,video});
  }
  // A local film is a motif, not a player: muted, looping, no controls, over its drawn frame. It hangs on
  // the body like the films (WebKit misplaces video inside a foreignObject) and follows the frame, so it
  // rides in with the scroll movement. The still of the same name stays underneath until it plays.
  const clips=[];
  for(const marker of main.querySelectorAll('[data-clip]')){
   const video=document.createElement('video');video.className='project-clip';video.src=marker.dataset.clip;
   video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';
   const still=marker.querySelector('image');if(still)video.poster=still.getAttribute('href');
   video.setAttribute('aria-label',`${route} — animation`);
   // Look again once it can play: the first look can come before the page is laid out, and a film in the
   // first screen (sentry) would then wait for the first scroll to start.
   video.addEventListener('loadeddata',()=>schedule(),{once:true,signal:controller.signal});
   document.body.append(video);clips.push({marker,video});
  }
  const placeClips=()=>{for(const {marker,video} of clips){
   // The still, not the group: the group also holds the caption above the frame.
   const b=(marker.querySelector('image')||marker).getBoundingClientRect();
   Object.assign(video.style,{left:(b.left+window.scrollX)+'px',top:(b.top+window.scrollY)+'px',width:b.width+'px',height:b.height+'px'});
   const visible=b.top<window.innerHeight&&b.bottom>0;
   if(visible&&video.paused)video.play().catch(()=>{});
   if(!visible&&!video.paused)video.pause();
  }};
  // Live elements of the 500l/s page: the type tester in its frame and the specimen film scrubbed with the pointer.
  const overlays=new Map(),scrubs=[];
  for(const marker of main.querySelectorAll('[data-tester]'))overlays.set(marker,typeTester(marker));
  for(const marker of main.querySelectorAll('[data-wavelab]'))overlays.set(marker,waveLab(marker));
  for(const marker of main.querySelectorAll('[data-scrub]'))scrubs.push(scrubFilm(marker,route,controller.signal));
  const placeScrubs=()=>{for(const {marker,stage,video,scrub} of scrubs){
   const b=(marker.querySelector('image')||marker).getBoundingClientRect();
   Object.assign(stage.style,{left:(b.left+window.scrollX)+'px',top:(b.top+window.scrollY)+'px',width:b.width+'px',height:b.height+'px'});
   if(scrub)continue;
   const visible=b.top<window.innerHeight&&b.bottom>0;
   if(visible&&video.paused&&!reduced.matches)video.play().catch(()=>{});
   if(!visible&&!video.paused)video.pause();
  }};
  const placeLocalVideos=()=>{placeClips();placeScrubs();for(const {marker,stage,video} of localVideos){
   const b=marker.getBoundingClientRect();
   Object.assign(stage.style,{left:(b.left+window.scrollX)+'px',top:(b.top+window.scrollY)+'px',width:b.width+'px',height:b.height+'px'});
   const visible=b.top<window.innerHeight&&b.bottom>0;
   if(visible&&!stage.dataset.entered){stage.dataset.entered='1';video.play().catch(()=>{})}
   if(!visible&&stage.dataset.entered){video.pause();delete stage.dataset.entered}
  }};
  if(localVideos.length){const oldCleanup=cleanupRoute;cleanupRoute=()=>{oldCleanup();for(const v of localVideos){v.video.pause();v.stage.remove()}}}
  const svg=main.querySelector('svg');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  // Keep each illustration's original crop intact; move an outer group only.
  const items=[...svg.querySelectorAll('[data-project-image]')].map(node=>{
   const bounds=node.getBoundingClientRect();
   const wrapper=svgNode('g');node.replaceWith(wrapper);wrapper.append(node);
   return {wrapper,overlay:overlays.get(node),top:(bounds.top+window.scrollY)/zoom(),height:bounds.height/zoom(),initial:bounds.top<window.innerHeight,start:node.hasAttribute('data-reveal-start')?Number(node.dataset.revealStart):null,distance:node.hasAttribute('data-reveal-distance')?Number(node.dataset.revealDistance):null,speed:node.hasAttribute('data-reveal-speed')?Number(node.dataset.revealSpeed):1,delay:Number(node.dataset.revealDelay||0)};
  });
  const update=()=>{
   frame=0;const z=zoom(),bottom=(window.scrollY+window.innerHeight)/z;
   for(const item of items){
    // A full image-height of scroll brings an initially hidden image up into place.
    const distance=item.distance??item.height,start=(item.start??item.top)+item.delay;
    // speed > 1 climbs faster than the page scrolls (staggered parts that start from below the window edge).
    const remaining=item.initial||reduced.matches?0:Math.max(0,Math.min(distance,(start-bottom)*item.speed+distance));
    item.wrapper.setAttribute('transform',`translate(0 ${remaining})`);
    // HTML over a frame (the type tester) takes the same way; main carries the drawing's units.
    if(item.overlay)item.overlay.style.transform=remaining?`translateY(${remaining}px)`:'';
   }
   placeLocalVideos();
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  cleanupRoute=()=>{controller.abort();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
   for(const {stage} of films)stage.remove();for(const {stage,video} of localVideos){video.pause();stage.remove()}
   for(const {video} of clips){video.pause();video.remove()}
   for(const {stage,video} of scrubs){video.pause();stage.remove()}};
  update();
 }catch(error){if(error.name!=='AbortError')main.textContent=error.message;}
}

function buildProjectPage(project){
 const svg=svgNode('svg',{viewBox:'0 0 1920 2755.82','aria-label':project.title});
 // Text baseline, column width and frame positions follow archive_projectpage_opera.svg.
 svg.append(svgNode('text',{x:28.45,y:150,'font-size':20},project.title));
 let y=279.8;
 for(const [index,section] of project.sections.entries()){
  y=Math.max(y,[279.8,436.35,624.73][index]);
  svg.append(svgNode('text',{x:28.45,y,'font-size':20},section.label));
  const lines=wrap(section.text,20,405);
  svg.append(setLines(svgNode('text',{'font-size':20}),28.45,y+21.6,lines,24));
  y+=21.6+lines.length*24+36;
 }
 for(const [label,text] of project.credits||[]){
  svg.append(svgNode('text',{x:28.45,y,'font-size':20},label));
  const lines=wrap(text,20,405);svg.append(setLines(svgNode('text',{'font-size':20}),28.45,y+24,lines,24));y+=lines.length*24+60;
 }
 const slots=[[559.65,89.48,778.73,348.09],[855.77,465.81,1037.85,583.79],[494.12,771.74,331.8,488.24],[202.85,1292.69,831.2,467.55],[1214.38,1204.2,568.76,382.55],[720.56,1792.95,551.64,310.3],[1312.69,1748.24,580.93,871.97],[26.38,2135.96,1037.85,583.79]];
 let imageIndex=0,bottom=2755.82;
 for(let i=0;i<Math.max(slots.length,project.images.length+(project.videos.length?1:0));i++){
  const extra=i-slots.length;
  const [x,top,width,height]=i<slots.length?slots[i]:[slots[3+extra%2][0],2835.82+Math.floor(extra/2)*650,slots[3+extra%2][2],467.55];
  if(i===(project.video_slot??1)&&project.videos.length){svg.append(svgNode('g',{'data-video':project.videos[0],'data-x':x,'data-y':top,'data-width':width,'data-height':height}));continue}
  if(imageIndex>=project.images.length)continue;
  const href=project.images[imageIndex++],g=svgNode('g',{'data-project-image':''});
  if(/\.gif$/i.test(href))Object.entries({'data-gif':href,'data-x':x,'data-y':top,'data-width':width,'data-height':height}).forEach(([k,v])=>g.setAttribute(k,v));
  else g.append(svgNode('image',{href,x,y:top,width,height,preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':`${project.title} — project image ${imageIndex}`}));
  svg.append(g);bottom=Math.max(bottom,top+height+36);
 }
 svg.setAttribute('viewBox',`0 0 1920 ${Math.max(bottom,y+36)}`);return svg;
}
