document.addEventListener("DOMContentLoaded", () => {
  setupPerformanceBackground();
  setupFilters();
});

function setupPerformanceBackground() {
  const oldCanvas = document.getElementById("site-bg");
  if (oldCanvas) oldCanvas.remove();

  ["bg-orb", "bg-radar", "bg-sweep"].forEach(className => {
    if (!document.querySelector("." + className)) {
      const el = document.createElement("div");
      el.className = className;
      document.body.prepend(el);
    }
  });

  const canvas = document.createElement("canvas");
  canvas.id = "site-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = 1, particles = [], animationId = null, lastFrame = 0;
  let pausedByScroll = false, scrollTimer = null;
  const isSmallScreen = window.matchMedia("(max-width: 760px)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reduceMotion ? 0 : Math.min(isSmallScreen ? 34 : 58, Math.floor(w / 24));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * (isSmallScreen ? 0.16 : 0.22),
      vy: (Math.random() - 0.5) * (isSmallScreen ? 0.16 : 0.22),
      r: Math.random() * 1.6 + 0.8
    }));
    drawStaticFrame();
  }

  function drawStaticFrame() {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.65);
    grad.addColorStop(0, "rgba(86,199,255,0.11)");
    grad.addColorStop(0.45, "rgba(45,140,255,0.045)");
    grad.addColorStop(1, "rgba(2,8,22,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124,240,255,0.36)";
      ctx.fill();
    }
  }

  function draw(now) {
    animationId = requestAnimationFrame(draw);
    if (pausedByScroll || reduceMotion) return;
    if (now - lastFrame < 42) return;
    lastFrame = now;
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.66);
    grad.addColorStop(0, "rgba(86,199,255,0.10)");
    grad.addColorStop(0.45, "rgba(45,140,255,0.040)");
    grad.addColorStop(1, "rgba(2,8,22,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124,240,255,0.42)";
      ctx.fill();

      for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 13500) {
          const alpha = 0.12 * (1 - dist2 / 13500);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(86,199,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function pauseDuringScroll() {
    pausedByScroll = true;
    drawStaticFrame();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { pausedByScroll = false; }, 140);
  }

  resize();
  if (!reduceMotion) animationId = requestAnimationFrame(draw);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", pauseDuringScroll, { passive: true });
  window.addEventListener("pagehide", () => { if (animationId) cancelAnimationFrame(animationId); });
}

function setupFilters() {
  const chips = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-card]");
  const search = document.querySelector("[data-search]");
  const empty = document.querySelector("[data-empty]");
  if (!chips.length || !cards.length) return;

  function applyFilter() {
    const activeChip = document.querySelector("[data-filter].active");
    const activeFilter = activeChip ? activeChip.dataset.filter : "all";
    const keyword = search ? search.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    cards.forEach(card => {
      const category = (card.dataset.category || "").toLowerCase();
      const text = (card.dataset.text || card.textContent || "").toLowerCase();
      const categoryMatch = activeFilter === "all" || category.includes(activeFilter);
      const textMatch = !keyword || text.includes(keyword);
      if (categoryMatch && textMatch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    });

    if (empty) empty.style.display = visibleCount === 0 ? "block" : "none";
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter();
    });
  });
  if (search) search.addEventListener("input", applyFilter);
  applyFilter();
}
