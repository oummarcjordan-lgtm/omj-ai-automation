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
   CANVAS "CERVEAU NUMÉRIQUE" — binaire structuré
   (page d'accueil uniquement)
   ============================================ */
(function initBrainCanvas() {
  const canvas = document.getElementById('brain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, columns;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    const colWidth = 22;
    const count = Math.ceil(w / colWidth);
    columns = Array.from({ length: count }, (_, i) => ({
      x: i * colWidth,
      y: Math.random() * -h,
      speed: 0.4 + Math.random() * 0.8,
      chars: Array.from({ length: Math.ceil(h / 20) + 4 }, () => (Math.random() > 0.5 ? '1' : '0')),
    }));
  }

  function step() {
    ctx.fillStyle = 'rgba(6, 12, 18, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '14px "JetBrains Mono", monospace';

    columns.forEach(col => {
      col.y += col.speed;
      if (col.y > h + 100) col.y = -100;

      col.chars.forEach((ch, idx) => {
        const y = col.y + idx * 20;
        if (y < 0 || y > h) return;
        const fade = 1 - Math.abs((y - h / 2) / (h / 2));
        ctx.fillStyle = `rgba(41, 231, 205, ${Math.max(0.05, fade * 0.55)})`;
        ctx.fillText(ch, col.x, y);
      });
    });
    requestAnimationFrame(step);
  }

  resize();
  step();
  window.addEventListener('resize', resize);
})();
