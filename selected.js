// work (Marco, 14.10.): four focus projects with their showreels. app.js calls selectedWorks on the work route.
// Desktop: one screen like vita — a 2×2 grid of 16:9 frames, the name small underneath, the reel plays from its start
// while hovered. Phone: the four under each other, every reel looping all the time (no hover on a phone).
// Values not drawn by Marco: margin and column gap 26.38, name baseline 30 under the picture, 60 from picture to the
// next row, grid from 134.84 (top of the archive preview frame) down to the foot.
(()=>{
 // vote2cop has its own still here: only the words vote to cop, at 12.6 s of the reel (Marco).
 const works=[
  ['500l/s','#500ls','assets/projects/500ls/00_showreel'],
  ['heritage identity','#heritage-identity','assets/projects/heritage-identity/02_showreel'],
  ['vote2cop','#vote2cop','assets/projects/vote2cop/02_showreel','assets/projects/vote2cop/02_showreel-type.webp'],
  ['sentry','#sentry','assets/projects/sentry/02_showreel'],
 ];
 const L=26.38,GAP=26.38,CAP=60,TOP=134.84;
 // All four between 134.84 and the foot (1080 − 58.08), so the page does not scroll.
 const H=(1080-58.08-TOP-2*CAP)/2,W=H*16/9;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const frame=(title,url,file,still,height,video)=>{
  const a=document.createElement('a');a.href=url;a.className='selected-work';
  a.innerHTML=`<span class="selected-frame" style="height:${height}px"><img src="${still}" alt=""><video src="${file}.mp4" muted loop playsinline ${video} aria-hidden="true"></video></span><span class="selected-name">${title}</span>`;
  const v=a.querySelector('video');v.muted=true;v.addEventListener('playing',()=>v.classList.add('ready'));
  return [a,v];
 };
 const more=()=>{const box=document.createElement('div');box.className='selected-more';box.innerHTML='<span>more work</span><a href="#archive">archive</a>';return box};
 window.selectedWorks=(main,mode)=>{
  if(mode==='mobile'){
   // The column of the mobile home (39.16–459.01), then “more work” and the archive pill.
   const ML=39.16,MW=459.01-39.16,box=document.createElement('div');box.className='selected-works mobile-works';
   box.style.marginLeft=ML+'px';box.style.width=MW+'px';box.style.paddingTop=(93.67+39.16)+'px';
   for(const [title,url,file,still=file+'.webp'] of works){
    const [a,v]=frame(title,url,file,still,MW*9/16,'autoplay preload="auto"');
    if(!reduced())v.play().catch(()=>{});box.append(a);
   }
   box.append(more());main.append(box);return;
  }
  const box=document.createElement('div');box.className='selected-works';box.style.top=TOP+'px';box.style.height=2*(H+CAP)+'px';
  works.forEach(([title,url,file,still=file+'.webp'],i)=>{
   const [a,v]=frame(title,url,file,still,H,'preload="metadata"');
   a.style.left=(L+(i%2)*(W+GAP))+'px';a.style.top=(Math.floor(i/2)*(H+CAP))+'px';a.style.width=W+'px';
   // From its start on every visit, back to the still when the pointer leaves.
   const play=()=>{if(reduced())return;v.currentTime=0;v.play().catch(()=>{})};
   const stop=()=>{v.pause();v.classList.remove('ready');v.currentTime=0};
   a.addEventListener('pointerenter',play);a.addEventListener('pointerleave',stop);a.addEventListener('focus',play);a.addEventListener('blur',stop);
   box.append(a);
  });
  main.append(box);
  // The gap on the right: “more work” over a pill to the archive, centred across the gap and on the middle of the
  // two picture rows.
  const left=L+2*W+GAP,side=more();
  side.style.left=left+'px';side.style.width=(1893.62-left)+'px';side.style.top=(TOP+(2*H+CAP)/2)+'px';
  main.append(side);
 };
})();
