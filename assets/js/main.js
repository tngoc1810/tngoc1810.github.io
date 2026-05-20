document.addEventListener("DOMContentLoaded", () => {
  initOptimizedNetworkBackground();
  setupFilters();
});

function initOptimizedNetworkBackground() {
  // Remove older background systems if they still exist
  [
    "#site-bg",
    "#network-bg",
    ".bg-orb",
    ".bg-radar",
    ".bg-sweep",
    ".bg-stars"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  });

  const canvas = document.createElement("canvas");
  canvas.id = "network-bg";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  let w = 0;
  let h = 0;
  let dpr = 1;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };

  let lastFrame = 0;
  const fps = 26;
  const frameInterval = 1000 / fps;

  let isScrolling = false;
  let scrollTimeout = null;

  function setScrolling() {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 140);
  }

  window.addEventListener("scroll", setScrolling, { passive: true });
  window.addEventListener("wheel", setScrolling, { passive: true });
  window.addEventListener("touchmove", setScrolling, { passive: true });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function getParticleCount() {
    if (w < 640) return 18;
    if (w < 900) return 24;
    if (w < 1280) return 30;
    return 36;
  }

  function createParticles() {
    const count = getParticleCount();
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.8 + 1.1,
        a: Math.random() * 0.45 + 0.25
      });
    }
  }

  function resizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawBackgroundGlow(time) {
    const t = time * 0.00025;

    // Main center orb area
    const cx = w * 0.55 + Math.sin(t) * 14;
    const cy = h * 0.46 + Math.cos(t * 0.9) * 10;

    // soft center glow
    let g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.34);
    g1.addColorStop(0, "rgba(65, 200, 255, 0.12)");
    g1.addColorStop(0.35, "rgba(40, 150, 255, 0.08)");
    g1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // radar rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.00008);

    const rings = isScrolling ? [120, 190, 260] : [120, 190, 260, 330];
    for (let i = 0; i < rings.length; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, rings[i], 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(70, 210, 255, ${isScrolling ? 0.055 : 0.08})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // spokes
    const spokeCount = isScrolling ? 8 : 12;
    for (let i = 0; i < spokeCount; i++) {
      const ang = (Math.PI * 2 * i) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * 330, Math.sin(ang) * 330);
      ctx.strokeStyle = `rgba(70, 210, 255, ${isScrolling ? 0.035 : 0.05})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // sweep wedge
    const sweep = ctx.createRadialGradient(0, 0, 0, 0, 0, 330);
    sweep.addColorStop(0, "rgba(110, 235, 255, 0.12)");
    sweep.addColorStop(1, "rgba(110, 235, 255, 0)");
    ctx.fillStyle = sweep;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 330, -0.18, 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function updateParticles() {
    const speedFactor = isScrolling ? 0.55 : 1;

    for (const p of particles) {
      p.x += p.vx * speedFactor;
      p.y += p.vy * speedFactor;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // subtle mouse attraction
      if (mouse.active && !isScrolling) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 180 * 180) {
          p.x += dx * 0.00045;
          p.y += dy * 0.00045;
        }
      }
    }
  }

  function drawParticles() {
    const maxDist = isScrolling ? 92 : 125;
    const maxDist2 = maxDist * maxDist;

    // draw connection lines
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        if (isScrolling && (i + j) % 2 === 1) continue;

        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < maxDist2) {
          const dist = Math.sqrt(dist2);
          const alpha = (1 - dist / maxDist) * (isScrolling ? 0.12 : 0.20);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(40, 220, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(120, 235, 255, ${p.a})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 220, 255, ${p.a * 0.08})`;
      ctx.fill();
    }
  }

  function render(time) {
    ctx.clearRect(0, 0, w, h);

    drawBackgroundGlow(time);
    updateParticles();
    drawParticles();
  }

  function animate(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
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

    cards.forEach((card) => {
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

    if (empty) {
      empty.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter();
    });
  });

  if (search) {
    search.addEventListener("input", applyFilter);
  }

  applyFilter();
}
