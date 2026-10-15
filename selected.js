// work (Marco, 14.10.; six since 15.10.): focus projects with their showreels. app.js calls selectedWorks on the work route.
// Desktop: one screen high, scrolling sideways — 3×2 16:9 frames, the name small underneath, the reel plays from its start
// while hovered. Desktop only: a phone has no work page (Marco, 15.10.).
// Values not drawn by Marco: margin and column gap 26.38, name baseline 30 under the picture, 60 from picture to the
// next row, grid from 134.84 (top of the archive preview frame) down to the foot.
(()=>{
 // vote2cop has its own still here: only the words vote to cop, at 12.6 s of the reel (Marco).
 const works=[
  ['500l/s','#500ls','assets/projects/500ls/00_showreel'],
  ['heritage identity','#heritage-identity','assets/projects/heritage-identity/02_showreel'],
  ['vote2cop','#vote2cop','assets/projects/vote2cop/02_showreel','assets/projects/vote2cop/02_showreel-type.webp'],
  ['sentry','#sentry','assets/projects/sentry/02_showreel'],
  // Added on the right (Marco, 15.10.): s-neo above plants with benefits. Its reel was built for this (54_Sparkasse_OOH/06_SHOWREEL).
  ['s-neo','#s-neo','assets/projects/s-neo/00_showreel'],
  ['plants with benefits','#plants-with-benefits','assets/projects/plants-with-benefits/showreel'],
 ];
 // Desktop: three columns, two rows — 500l/s, heritage, s-neo on top; vote2cop, sentry, plants with benefits below.
 const cell=[[0,0],[1,0],[0,1],[1,1],[2,0],[2,1]];
 const L=26.38,GAP=26.38,CAP=60,TOP=134.84;
 // Both rows between 134.84 and the foot (1080 − 58.08), so the page does not scroll up and down.
 const H=(1080-58.08-TOP-2*CAP)/2,W=H*16/9;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const frame=(title,url,file,still,height,video)=>{
  const a=document.createElement('a');a.href=url;a.className='selected-work';
  a.innerHTML=`<span class="selected-frame" style="height:${height}px"><img src="${still}" alt="">${file?`<video src="${file}.mp4" muted loop playsinline ${video} aria-hidden="true"></video>`:''}</span><span class="selected-name">${title}</span>`;
  const v=a.querySelector('video');if(v){v.muted=true;v.addEventListener('playing',()=>v.classList.add('ready'))}
  return [a,v];
 };
 const more=()=>{const box=document.createElement('div');box.className='selected-more';box.innerHTML='<span>more work</span><a href="#archive">archive</a>';return box};
 window.selectedWorks=main=>{
  const box=document.createElement('div');box.className='selected-works';box.style.top=TOP+'px';box.style.height=2*(H+CAP)+'px';
  works.forEach(([title,url,file,still=file+'.webp'],i)=>{
   const [a,v]=frame(title,url,file,still,H,'preload="metadata"');
   a.style.left=(L+cell[i][0]*(W+GAP))+'px';a.style.top=(cell[i][1]*(H+CAP))+'px';a.style.width=W+'px';
   if(!v){box.append(a);return}
   // From its start on every visit, back to the still when the pointer leaves.
   const play=()=>{if(reduced())return;v.currentTime=0;v.play().catch(()=>{})};
   const stop=()=>{v.pause();v.classList.remove('ready');v.currentTime=0};
   a.addEventListener('pointerenter',play);a.addEventListener('pointerleave',stop);a.addEventListener('focus',play);a.addEventListener('blur',stop);
   box.append(a);
  });
  main.append(box);
  // Right of the last column: “more work” over a pill to the archive, centred on a field as wide as the gap it
  // had beside two columns (477.16) and on the middle of the two picture rows; then the page margin.
  const left=L+3*W+2*GAP,field=1893.62-(L+2*W+GAP),side=more();
  side.style.left=left+'px';side.style.width=field+'px';side.style.top=(TOP+(2*H+CAP)/2)+'px';
  main.append(side);box.style.width=(left+field+L)+'px';
  const wheel=e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&!e.ctrlKey){e.preventDefault();window.scrollBy(e.deltaY,0)}};
  window.addEventListener('wheel',wheel,{passive:false});
  const done=cleanupRoute;cleanupRoute=()=>{window.removeEventListener('wheel',wheel);done()};
 };
})();
