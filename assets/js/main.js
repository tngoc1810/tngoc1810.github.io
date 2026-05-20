document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
});

function initCyberBackground() {
  // Xóa các background cũ nếu còn tồn tại
  [
    "#site-bg",
    "#network-bg",
    ".bg-orb",
    ".bg-radar",
    ".bg-sweep",
    ".bg-stars"
  ].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
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
  let lastFrame = 0;

  const FPS = 28;
  const FRAME_INTERVAL = 1000 / FPS;

  let isScrolling = false;
  let scrollTimer = null;

  function markScrolling() {
    isScrolling = true;
    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 120);
  }

  window.addEventListener("scroll", markScrolling, { passive: true });
  window.addEventListener("wheel", markScrolling, { passive: true });
  window.addEventListener("touchmove", markScrolling, { passive: true });

  function particleCount() {
    if (w < 640) return 22;
    if (w < 1000) return 30;
    if (w < 1400) return 38;
    return 46;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.4);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from({ length: particleCount() }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.9 + 1.1,
      alpha: Math.random() * 0.38 + 0.28
    }));
  }

  window.addEventListener("resize", resize);
  resize();

  function drawAurora(time) {
    const t = time * 0.00022;

    const cx = w * 0.55 + Math.sin(t) * 22;
    const cy = h * 0.42 + Math.cos(t * 0.8) * 16;

    // glow trung tâm
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.48);
    glow.addColorStop(0, "rgba(80, 220, 255, 0.16)");
    glow.addColorStop(0.32, "rgba(40, 145, 255, 0.09)");
    glow.addColorStop(0.72, "rgba(0, 40, 90, 0.04)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // vòng hologram
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.00007);

    const ringOpacity = isScrolling ? 0.045 : 0.075;
    const rings = [120, 195, 275, 360];

    for (const r of rings) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(95, 220, 255, ${ringOpacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // đường chéo radar
    const spokes = isScrolling ? 8 : 12;
    for (let i = 0; i < spokes; i++) {
      const a = (Math.PI * 2 * i) / spokes;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 370, Math.sin(a) * 370);
      ctx.strokeStyle = `rgba(95, 220, 255, ${isScrolling ? 0.025 : 0.045})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // scan sweep
    if (!isScrolling) {
      const sweep = ctx.createRadialGradient(0, 0, 0, 0, 0, 370);
      sweep.addColorStop(0, "rgba(120, 245, 255, 0.13)");
      sweep.addColorStop(1, "rgba(120, 245, 255, 0)");

      ctx.fillStyle = sweep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 370, -0.16, 0.16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function updateParticles() {
    const speed = isScrolling ? 0.45 : 1;

    for (const p of particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }
  }

  function drawParticles() {
    const maxDistance = isScrolling ? 90 : 135;
    const maxDistanceSq = maxDistance * maxDistance;

    // lines
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        if (isScrolling && (i + j) % 2 === 0) continue;

        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistanceSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / maxDistance) * (isScrolling ? 0.10 : 0.20);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(60, 220, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(135, 240, 255, ${p.alpha})`;
      ctx.fill();

      if (!isScrolling) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 210, 255, ${p.alpha * 0.08})`;
        ctx.fill();
      }
    }
  }

  function drawStars(time) {
    const t = time * 0.00012;

    ctx.save();
    ctx.globalAlpha = isScrolling ? 0.22 : 0.34;

    for (let i = 0; i < 28; i++) {
      const x = ((i * 193 + Math.sin(t + i) * 14) % w + w) % w;
      const y = ((i * 97 + Math.cos(t + i) * 10) % h + h) % h;
      const size = i % 5 === 0 ? 2 : 1;

      ctx.fillStyle = "rgba(120, 235, 255, 0.55)";
      ctx.fillRect(x, y, size, size);
    }

    ctx.restore();
  }

  function render(time) {
    ctx.clearRect(0, 0, w, h);

    drawAurora(time);
    drawStars(time);
    updateParticles();
    drawParticles();
  }

  function animate(time) {
    if (!lastFrame || time - lastFrame >= FRAME_INTERVAL) {
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

    if (empty) {
      empty.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter();
    });
  });

  if (search) {
    search.addEventListener("input", applyFilter);
  }

  applyFilter();
}
/* =========================================================
   TOC ACTIVE SECTION HIGHLIGHT
   Highlights current heading while scrolling writeup pages.
   Paste at the END of assets/js/main.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initTocActiveHighlight();
});

function initTocActiveHighlight() {
  const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));
  if (!tocLinks.length) return;

  const sections = tocLinks
    .map(link => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActiveToc() {
    const offset = 145;
    let current = sections[0];

    for (const item of sections) {
      const rect = item.target.getBoundingClientRect();

      if (rect.top <= offset) {
        current = item;
      } else {
        break;
      }
    }

    tocLinks.forEach(link => link.classList.remove("active"));
    current.link.classList.add("active");
  }

  setActiveToc();

  window.addEventListener("scroll", setActiveToc, { passive: true });
  window.addEventListener("resize", setActiveToc);
}
