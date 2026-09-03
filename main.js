/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.classList.add('hidden'), 400);
});

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
