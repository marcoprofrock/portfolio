// work (Marco, 14.10.; six since 15.10.): focus projects with their showreels. app.js calls selectedWorks on the work route.
// Desktop: one screen high, scrolling sideways — 3×2 16:9 frames, the name small underneath, the reel plays from its start
// while hovered. Desktop only: a phone has no work page (Marco, 15.10.).
// Values not drawn by Marco: margin and column gap 26.38, name baseline 30 under the picture, 60 from picture to the
// next row, grid from 134.84 (top of the archive preview frame) down to the foot.
(()=>{
 // vote2cop has its own still here: only the words vote to cop, at 12.6 s of the reel (Marco).
 const works=[
  // Far left since 24.11.2026 (Marco): s-neo above i love stuttgart (Stadtwerke), which replaced plants with benefits.
  // Its reel is the three spots joined into one film (02_spots), the only 16:9 film of the case.
  ['s-neo','#s-neo','assets/projects/s-neo/00_showreel'],
  ['i love stuttgart','#i-love-stuttgart','assets/projects/i-love-stuttgart/02_spots'],
  ['500l/s','#500ls','assets/projects/500ls/00_showreel'],
  // hope in action here since 27.10.2026 (Marco).
  ['hope in action','#hope-in-action','assets/projects/hope-in-action/02_showreel'],
  ['vote2cop','#vote2cop','assets/projects/vote2cop/02_showreel','assets/projects/vote2cop/02_showreel-type.webp'],
  ['sentry','#sentry','assets/projects/sentry/02_showreel'],
 ];
 // Desktop: three columns, two rows — s-neo, 500l/s, hope in action on top; i love stuttgart, vote2cop, sentry below.
 const cell=[[0,0],[0,1],[1,0],[2,0],[1,1],[2,1]];
 const L=26.38,GAP=26.38,CAP=60,TOP=134.84;
 // Both rows between 134.84 and the foot (1080 − 58.08), so the page does not scroll up and down. In a window flatter
 // than 16:9 (an external screen under the browser bar) the foot moves up with the window's bottom edge, so the frames
 // shrink with it instead of running under the foot (23.11.2026). The field for “more work” keeps its 477.16.
 const size=()=>{const view=Math.min(1080,document.documentElement.clientHeight/(window.innerWidth/1920)),H=(view-58.08-TOP-2*CAP)/2;return [H,H*16/9]};
 const H0=(1080-58.08-TOP-2*CAP)/2,FIELD=1893.62-(L+2*H0*16/9+GAP);
 // “[published]” centred on the name line under the cases that ran (Marco, 24.11.2026), like the archive's status column.
 const published=new Set(["#s-neo","#i-love-stuttgart"]);
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const frame=(title,url,file,still,height,video)=>{
  const a=document.createElement('a');a.href=url;a.className='selected-work';
  a.innerHTML=`<span class="selected-frame" style="height:${height}px"><img src="${still}" alt="">${file?`<video src="${file}.mp4" muted loop playsinline ${video} aria-hidden="true"></video>`:''}</span><span class="selected-name"><span>${title}</span>${published.has(url)?'<span class="selected-status">[published]</span>':''}</span>`;
  const v=a.querySelector('video');if(v){v.muted=true;v.addEventListener('playing',()=>v.classList.add('ready'))}
  return [a,v];
 };
 const more=()=>{const box=document.createElement('div');box.className='selected-more';box.innerHTML='<span>more work</span><a href="#archive">archive</a>';return box};
 window.selectedWorks=main=>{
  const box=document.createElement('div');box.className='selected-works';box.style.top=TOP+'px';
  const items=works.map(([title,url,file,still=file+'.webp'])=>{
   const [a,v]=frame(title,url,file,still,H0,'preload="metadata"');
   box.append(a);
   if(!v)return a;
   // From its start on every visit, back to the still when the pointer leaves.
   const play=()=>{if(reduced())return;v.currentTime=0;v.play().catch(()=>{})};
   const stop=()=>{v.pause();v.classList.remove('ready');v.currentTime=0};
   a.addEventListener('pointerenter',play);a.addEventListener('pointerleave',stop);a.addEventListener('focus',play);a.addEventListener('blur',stop);
   return a;
  });
  main.append(box);
  // Right of the last column: “more work” over a pill to the archive, centred on a field as wide as the gap it
  // had beside two columns (477.16) and on the middle of the two picture rows; then the page margin.
  const side=more();main.append(side);
  const place=()=>{
   const [H,W]=size();box.style.height=2*(H+CAP)+'px';
   items.forEach((a,i)=>{
    a.style.left=(L+cell[i][0]*(W+GAP))+'px';a.style.top=(cell[i][1]*(H+CAP))+'px';a.style.width=W+'px';
    a.querySelector('.selected-frame').style.height=H+'px';
   });
   const left=L+3*W+2*GAP;
   side.style.left=left+'px';side.style.width=FIELD+'px';side.style.top=(TOP+(2*H+CAP)/2)+'px';
   box.style.width=(left+FIELD+L)+'px';
  };
  place();window.addEventListener('resize',place);
  const wheel=e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&!e.ctrlKey){e.preventDefault();window.scrollBy(e.deltaY,0)}};
  window.addEventListener('wheel',wheel,{passive:false});
  const done=cleanupRoute;cleanupRoute=()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('resize',place);done()};
 };
})();
