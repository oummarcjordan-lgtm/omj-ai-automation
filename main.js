/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.classList.add('hidden'), 400);
});

/* ============================================
   CANVAS DE FOND — reseau de noeuds (discret)
   ============================================ */
(function initNodeCanvas() {
  const canvas = document.getElementById('node-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function makeNodes() {
    const count = window.innerWidth < 640 ? 18 : 34;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 160) {
          ctx.strokeStyle = `rgba(24, 169, 87, ${0.12 * (1 - d / 160)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(24, 169, 87, 0.7)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }
  resize();
  makeNodes();
  step();
  window.addEventListener('resize', () => { resize(); makeNodes(); });
})();

/* ============================================
   VIDEO HERO — adaptatif selon la connexion
   + fondu progressif au scroll
   ============================================ */
(function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  const fallbackImg = document.getElementById('heroFallbackImg');
  const hero = document.getElementById('hero');
  if (!video || !fallbackImg || !hero) return;

  function useFallbackImage() {
    video.pause();
    video.style.display = 'none';
    fallbackImg.style.display = 'block';
  }

  // 1) Detection de connexion lente / economie de donnees
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowTypes = ['slow-2g', '2g', '3g'];
  if (conn && (conn.saveData || slowTypes.includes(conn.effectiveType))) {
    useFallbackImage();
  } else {
    // 2) Si la video met trop de temps a charger ou echoue, on bascule sur l'image
    let switched = false;
    const loadTimeout = setTimeout(() => {
      if (video.readyState < 2 && !switched) { switched = true; useFallbackImage(); }
    }, 4000);
    video.addEventListener('canplay', () => clearTimeout(loadTimeout));
    video.addEventListener('error', () => { if (!switched) { switched = true; useFallbackImage(); } });
  }

  // 3) Fondu progressif au scroll (le fond s'estompe en descendant la page)
  function onScroll() {
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const progress = Math.min(1, window.scrollY / (heroHeight * 0.8));
    const opacity = 0.55 * (1 - progress) + 0.08 * progress;
    video.style.opacity = opacity;
    fallbackImg.style.opacity = opacity;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================
   MENU MOBILE — hamburger / tiroir
   ============================================ */
(function initMobileNav() {
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');
  const scrim = document.getElementById('navScrim');
  if (!burger || !drawer || !scrim) return;

  function toggle(open) {
    burger.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => toggle(!drawer.classList.contains('open')));
  scrim.addEventListener('click', () => toggle(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
})();
