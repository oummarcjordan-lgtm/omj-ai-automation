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
   CANVAS "VISAGE IA" — buste stylisé en particules,
   dessiné en code (pas depuis une photo), avec un
   cycle continu dispersion / reformation
   ============================================ */
(function initBrainCanvas() {
  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles = [];
  let cycleStart = performance.now();
  const CYCLE_MS = 9000;       // durée totale d'un cycle
  const DISPERSE_MS = 1800;    // durée de la phase "dispersion"

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    buildParticles();
  }

  // Dessine un buste stylisé (tête + épaules) sur un canvas caché,
  // puis échantillonne les pixels pleins pour placer les particules.
  function buildParticles() {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d');

    const isMobile = window.innerWidth < 640;
    const cx = isMobile ? w * 0.5 : w * 0.76;
    const cy = h * (isMobile ? 0.42 : 0.5);
    const scale = Math.min(w, h) * (isMobile ? 0.34 : 0.46);

    octx.fillStyle = '#fff';
    // Tête
    octx.beginPath();
    octx.ellipse(cx, cy - 0.05 * scale, 0.30 * scale, 0.36 * scale, 0, 0, Math.PI * 2);
    octx.fill();
    // Épaules / buste
    octx.beginPath();
    octx.moveTo(cx - 0.58 * scale, cy + 1.05 * scale);
    octx.quadraticCurveTo(cx - 0.58 * scale, cy + 0.38 * scale, cx - 0.28 * scale, cy + 0.30 * scale);
    octx.lineTo(cx + 0.28 * scale, cy + 0.30 * scale);
    octx.quadraticCurveTo(cx + 0.58 * scale, cy + 0.38 * scale, cx + 0.58 * scale, cy + 1.05 * scale);
    octx.closePath();
    octx.fill();

    const data = octx.getImageData(0, 0, w, h).data;
    const gap = isMobile ? 5 : 4;
    const next = [];
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 120) continue; // en dehors de la silhouette
        next.push({
          tx: x,
          ty: y,
          // position de dispersion propre à chaque particule (aléatoire mais fixe)
          sx: Math.random() * w,
          sy: Math.random() * h,
          x, y,
          size: 0.9 + Math.random() * 1.4,
          alpha: 0.35 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2, // pour le léger flottement
        });
      }
    }
    particles = next;
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function step(now) {
    ctx.clearRect(0, 0, w, h);

    const elapsed = (now - cycleStart) % CYCLE_MS;
    let mix; // 0 = totalement assemblé (visage), 1 = totalement dispersé
    if (elapsed < DISPERSE_MS) {
      mix = easeInOut(elapsed / DISPERSE_MS);                // dispersion
    } else if (elapsed < DISPERSE_MS * 2) {
      mix = 1 - easeInOut((elapsed - DISPERSE_MS) / DISPERSE_MS); // reformation
    } else {
      mix = 0; // reste assemblé un moment avant de recommencer
    }

    const t = now * 0.001;
    particles.forEach(p => {
      const floatX = Math.sin(t * 0.6 + p.phase) * 1.2;
      const floatY = Math.cos(t * 0.5 + p.phase) * 1.2;
      const targetX = p.tx + (p.sx - p.tx) * mix + floatX;
      const targetY = p.ty + (p.sy - p.ty) * mix + floatY;
      p.x += (targetX - p.x) * 0.12;
      p.y += (targetY - p.y) * 0.12;

      ctx.fillStyle = `rgba(41, 231, 205, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  resize();
  requestAnimationFrame(step);
  window.addEventListener('resize', resize);
})();
