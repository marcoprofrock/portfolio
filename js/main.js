(function () {
  // Mark active section in top nav based on scroll position.
  const topLinks = Array.from(document.querySelectorAll('.top nav a'));
  const topTargets = topLinks
    .map((a) => {
      const id = a.getAttribute('href');
      return id && id.startsWith('#') ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && topTargets.length) {
    const map = new Map();
    topTargets.forEach((t, i) => map.set(t, topLinks[i]));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const link = map.get(e.target);
          if (!link) return;
          if (e.isIntersecting) {
            topLinks.forEach((l) => l.removeAttribute('aria-current'));
            link.setAttribute('aria-current', 'page');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    topTargets.forEach((t) => io.observe(t));
  }

  // Highlight active project in the sticky work sub-nav.
  const workNav = document.querySelector('.work-nav');
  const workLinks = Array.from(document.querySelectorAll('.work-nav a'));
  const projectTargets = workLinks
    .map((a) => {
      const id = a.getAttribute('href');
      return id && id.startsWith('#') ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && projectTargets.length) {
    const pmap = new Map();
    projectTargets.forEach((t, i) => pmap.set(t, workLinks[i]));

    // Track which projects are currently in view; pick the topmost.
    const visible = new Set();

    const setActive = () => {
      if (!visible.size) return;
      // Pick the project whose top is closest to (but not above) the activation line.
      const activationY = (window.innerHeight || document.documentElement.clientHeight) * 0.4;
      let best = null;
      let bestDist = Infinity;
      visible.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - activationY);
        if (dist < bestDist) {
          bestDist = dist;
          best = el;
        }
      });
      if (!best) return;
      workLinks.forEach((l) => l.removeAttribute('aria-current'));
      const link = pmap.get(best);
      if (link) {
        link.setAttribute('aria-current', 'true');
        // Auto-scroll the sub-nav so the active link stays in view.
        const navUl = workNav && workNav.querySelector('ul');
        if (navUl) {
          const linkRect = link.getBoundingClientRect();
          const navRect = navUl.getBoundingClientRect();
          if (linkRect.left < navRect.left + 16) {
            navUl.scrollBy({ left: linkRect.left - navRect.left - 24, behavior: 'smooth' });
          } else if (linkRect.right > navRect.right - 16) {
            navUl.scrollBy({ left: linkRect.right - navRect.right + 24, behavior: 'smooth' });
          }
        }
      }
    };

    const pio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        });
        setActive();
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    projectTargets.forEach((t) => pio.observe(t));
  }

  // --- Photography strip: auto-load images from the asset folder ---
  // Works without a build step: parses python -m http.server's directory listing.
  // If the listing isn't available (some hosts disable it), falls back to a
  // hardcoded list. To update images, just drop files into assets/08_Photography/.
  (async function loadPhotos() {
    const track = document.querySelector('[data-photo-track]');
    if (!track) return;

    const folder = 'assets/08_Photography/';
    const exts = /\.(jpe?g|png|webp|avif|gif)$/i;
    const fallback = [
      '08_76564d4c.png',
      '09_a491f091.png',
      '10_bc8b5033.png',
      '12_d4b200dc.png',
      '13_267bfe02.jpg',
      '16_9cdb04b0.jpg',
    ];

    let files = [];
    try {
      const res = await fetch(folder, { headers: { Accept: 'text/html' } });
      if (res.ok) {
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        files = Array.from(doc.querySelectorAll('a'))
          .map((a) => decodeURIComponent(a.getAttribute('href') || ''))
          .filter((h) => h && exts.test(h) && !h.includes('/') && !h.startsWith('.'));
      }
    } catch (_) {
      /* fall through to fallback */
    }
    if (!files.length) files = fallback;
    files.sort();

    const frag = document.createDocumentFragment();
    files.forEach((name) => {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = folder + name;
      img.alt = '';
      img.loading = 'lazy';
      fig.appendChild(img);
      frag.appendChild(fig);
    });
    track.appendChild(frag);
  })();

  // --- Lightbox: click any gallery / cover / photo image to open fullscreen ---
  (function lightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const lbImg = lb.querySelector('img');
    const lbClose = lb.querySelector('.lb-close');

    const isZoomable = (el) =>
      el.tagName === 'IMG' &&
      (el.closest('.gallery') ||
        el.closest('.project .cover') ||
        el.closest('.photo-track'));

    const open = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.removeAttribute('hidden');
      // Force layout, then add open class so the transition runs
      void lb.offsetHeight;
      lb.classList.add('is-open');
      document.body.classList.add('lb-open');
    };

    const close = () => {
      lb.classList.remove('is-open');
      document.body.classList.remove('lb-open');
      setTimeout(() => {
        lb.setAttribute('hidden', '');
        lbImg.src = '';
      }, 240);
    };

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t instanceof Element && isZoomable(t)) {
        e.preventDefault();
        open(t.currentSrc || t.src, t.alt);
      }
    });

    lbClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => {
      // Click on backdrop (not on image) closes
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  })();
})();
