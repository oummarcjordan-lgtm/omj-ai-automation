/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.classList.add('hidden'), 400);
});

/* ============================================
   CANVAS DE FOND — noeuds connectés
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
    const count = window.innerWidth < 640 ? 22 : 42;
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
          ctx.strokeStyle = `rgba(41, 231, 205, ${0.12 * (1 - d / 160)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(41, 231, 205, 0.7)';
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
   CANVAS "MATÉRIALISATION" — particules qui forment
   la silhouette de la photo de profil (page d'accueil)
   ============================================ */
(function initBrainCanvas() {
  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const imgSrc = canvas.dataset.particleSrc || 'images/hero-accueil.jpg';

  let w, h, particles = [];
  let ready = false;
  const img = new Image();

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    if (ready) buildParticles();
  }

  function buildParticles() {
    // Dessine la photo (en mode "cover", comme le fond CSS) sur un canvas caché
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d');

    const scale = Math.max(w / img.width, h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    const ix = (w - iw) / 2;
    const iy = (h - ih) * 0.2; // aligné avec "background-position: center 20%"
    octx.drawImage(img, ix, iy, iw, ih);

    let data;
    try {
      data = octx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return; // image bloquée (CORS) : pas d'effet particules, la photo de fond reste visible
    }

    const isMobile = window.innerWidth < 640;
    const gap = isMobile ? 6 : 4;
    const maxParticles = isMobile ? 1400 : 3200;

    const next = [];
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const i = (y * w + x) * 4;
        const a = data[i + 3];
        if (a < 100) continue;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 45) continue; // ignore les zones trop sombres du fond
        next.push({
          tx: x,
          ty: y,
          x: Math.random() * w,
          y: Math.random() * h,
          size: 0.8 + Math.random() * 1.3,
          speed: 0.015 + Math.random() * 0.035,
          alpha: 0.2 + (brightness / 255) * 0.65,
        });
      }
    }

    // Limite le nombre de particules pour rester fluide sur mobile
    if (next.length > maxParticles) {
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      next.length = maxParticles;
    }
    particles = next;
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += (p.tx - p.x) * p.speed;
      p.y += (p.ty - p.y) * p.speed;
      ctx.fillStyle = `rgba(41, 231, 205, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(step);
  }

  img.onload = () => {
    ready = true;
    resize();
    step();
  };
  img.onerror = () => {
    console.warn('brain-canvas : image introuvable, animation de particules désactivée.');
  };
  img.src = imgSrc;

  window.addEventListener('resize', () => { if (ready) resize(); });
})();
