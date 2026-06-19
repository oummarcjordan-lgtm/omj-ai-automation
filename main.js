// ============================================
// Animated background: connected nodes
// Evokes an automation workflow graph
// ============================================

const canvas = document.getElementById('node-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
const NODE_COUNT_DESKTOP = 55;
const NODE_COUNT_MOBILE = 28;
const MAX_DIST = 160;
const ACCENT = '255, 107, 53';
const LINE_COLOR = '35, 41, 56';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function initNodes() {
  const count = window.innerWidth < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
  nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 1,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function step() {
  ctx.clearRect(0, 0, width, height);

  // update positions
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    n.pulse += 0.02;

    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;
  }

  // draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        const opacity = (1 - dist / MAX_DIST) * 0.35;
        ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // draw nodes
  for (const n of nodes) {
    const glow = (Math.sin(n.pulse) + 1) / 2;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ACCENT}, ${0.15 + glow * 0.25})`;
    ctx.fill();
  }

  if (!prefersReducedMotion) {
    requestAnimationFrame(step);
  }
}

function start() {
  resize();
  initNodes();
  if (prefersReducedMotion) {
    // draw a single static frame
    step();
  } else {
    step();
  }
}

window.addEventListener('resize', () => {
  resize();
  initNodes();
});

start();

// ============================================
// Smooth nav scroll offset handling
// (anchors already use scroll-behavior: smooth via CSS)
// ============================================
