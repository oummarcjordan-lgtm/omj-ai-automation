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
   stable, avec scintillement léger + balayage lumineux
   ============================================ */
(function initBrainCanvas() {
  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles = [];
  let yMin = 0, yMax = 0;
  let startTime = performance.now();
  const INTRO_MS = 2000; // durée de l'assemblage initial au chargement

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    buildParticles();
    startTime = performance.now();
  }

  function buildParticles() {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d');

    const isMobile = window.innerWidth < 640;
    const cx = isMobile ? w * 0.5 : w * 0.76;
    const cy = h * (isMobile ? 0.4 : 0.5);
    const scale = Math.min(w, h) * (isMobile ? 0.30 : 0.42);

    octx.fillStyle = '#fff';
    octx.beginPath();
    octx.ellipse(cx, cy - 0.05 * scale, 0.30 * scale, 0.36 * scale, 0, 0, Math.PI * 2);
    octx.fill();
    octx.beginPath();
    octx.moveTo(cx - 0.58 * scale, cy + 1.05 * scale);
    octx.quadraticCurveTo(cx - 0.58 * scale, cy + 0.38 * scale, cx - 0.28 * scale, cy + 0.30 * scale);
    octx.lineTo(cx + 0.28 * scale, cy + 0.30 * scale);
    octx.quadraticCurveTo(cx + 0.58 * scale, cy + 0.38 * scale, cx + 0.58 * scale, cy + 1.05 * scale);
    octx.closePath();
    octx.fill();

    const data = octx.getImageData(0, 0, w, h).data;
    const gap = isMobile ? 6 : 5;
    const next = [];
    yMin = Infinity; yMax = -Infinity;
    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 120) continue; // en dehors de la silhouette
        next.push({
          tx: x, ty: y,
          x: cx + (Math.random() - 0.5) * scale * 3, // point de départ proche (intro)
          y: cy + (Math.random() - 0.5) * scale * 3,
          size: 0.8 + Math.random() * 1.2,
          alpha: 0.22 + Math.random() * 0.28,
          phase: Math.random() * Math.PI * 2,
        });
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
    particles = next;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(now) {
    ctx.clearRect(0, 0, w, h);

    const introT = easeOut(Math.min(1, (now - startTime) / INTRO_MS));
    const span = Math.max(1, yMax - yMin);
    const scanY = yMin + ((Math.sin(now * 0.0004) * 0.5 + 0.5) * span);

    particles.forEach(p => {
      const floatX = Math.sin(now * 0.0006 + p.phase) * 0.9;
      const floatY = Math.cos(now * 0.0005 + p.phase) * 0.9;
      const targetX = p.tx + floatX;
      const targetY = p.ty + floatY;
      const pull = introT < 1 ? 0.06 : 0.12;
      p.x += (targetX - p.x) * pull;
      p.y += (targetY - p.y) * pull;

      const distToScan = Math.abs(p.ty - scanY);
      const scanBoost = Math.max(0, 1 - distToScan / 60) * 0.45;

      ctx.fillStyle = `rgba(41, 231, 205, ${Math.min(1, p.alpha + scanBoost)})`;
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
