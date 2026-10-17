/* Decorative canvas only. No telemetry, tracking or simulated incident counts. */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.landing-hero');
  const canvas = document.getElementById('signal-field');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  try { if (localStorage.getItem('portfolio-motion') === 'off') enabled = false; } catch { /* Storage is optional. */ }
  let visible = true;
  let frame = 0;
  let lastDraw = 0;
  let phase = 0;
  let width = 0;
  let height = 0;
  let nodes = [];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ambient-toggle';
  button.setAttribute('aria-label', 'Background animation');
  hero.querySelector('.start-links')?.after(button);

  function syncButton() {
    button.textContent = enabled ? 'Motion on · pause' : 'Motion off · play';
    button.setAttribute('aria-pressed', String(enabled));
    document.body.dataset.motion = enabled && visible && !document.hidden ? 'running' : 'paused';
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cx = width * .79;
    const cy = Math.min(height * .48, 360);
    // Orbit guides keep the field structured; moving points suggest connections.
    [115, 195, 275].forEach((radius, index) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * .68, -.4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(99,162,255,${.09 - index * .017})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    const points = nodes.map(n => ({
      x: n.x * width + Math.sin(phase * n.speed + n.angle) * 14,
      y: n.y * height + Math.cos(phase * n.speed + n.angle) * 10,
      size: n.size
    }));
    const reach = width < 600 ? 130 : 195;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > reach) continue;
        ctx.strokeStyle = `rgba(104,169,255,${(1 - distance / reach) * .2})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if ((i + j) % 7 === 0) {
          const t = (phase * .1 + i * .17) % 1;
          ctx.beginPath();
          ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(158,204,255,.65)'; ctx.fill();
        }
      }
      ctx.beginPath(); ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(125,184,255,.5)'; ctx.fill();
    }
  }

  function tick(time) {
    frame = 0;
    if (!enabled || !visible || document.hidden) return;
    // Cap drawing at 30 fps, with a smaller field on mobile and a capped DPR.
    if (time - lastDraw >= 1000 / 30) {
      phase += Math.min((time - lastDraw) / 1000, .06);
      lastDraw = time;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    syncButton();
    if (enabled && visible && !document.hidden) {
      lastDraw = performance.now();
      frame = requestAnimationFrame(tick);
    } else draw();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 600 ? 18 : 38;
    nodes = Array.from({length: count}, (_, i) => ({
      x: .09 + ((i * .61803398875) % .87),
      y: .06 + ((i * .38196601125) % .87),
      speed: .3 + (i % 5) * .12,
      angle: i * 1.7,
      size: i % 5 === 0 ? 2.1 : 1.2
    }));
    draw();
  }

  button.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('portfolio-motion', enabled ? 'on' : 'off'); } catch { /* Optional preference. */ }
    sync();
  });
  reduced.addEventListener('change', event => {
    if (event.matches) { enabled = false; sync(); }
  });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize, {passive: true});
  resize();
  sync();
});
