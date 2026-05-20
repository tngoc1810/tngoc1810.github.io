document.addEventListener("DOMContentLoaded", () => {
  initLightCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

function initLightCyberBackground() {
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
  let scrolling = false;
  let scrollTimer = null;

  const FPS = 22;
  const FRAME_TIME = 1000 / FPS;

  function markScrolling() {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      scrolling = false;
    }, 160);
  }

  window.addEventListener("scroll", markScrolling, { passive: true });
  window.addEventListener("wheel", markScrolling, { passive: true });
  window.addEventListener("touchmove", markScrolling, { passive: true });

  function getCount() {
    if (window.innerWidth < 700) return 14;
    if (window.innerWidth < 1100) return 20;
    return 26;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from({ length: getCount() }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 1,
      a: Math.random() * 0.28 + 0.22
    }));
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  function drawGlow(time) {
    const t = time * 0.00018;
    const cx = w * 0.55 + Math.sin(t) * 18;
    const cy = h * 0.42 + Math.cos(t) * 12;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.48);
    g.addColorStop(0, "rgba(90, 220, 255, 0.12)");
    g.addColorStop(0.35, "rgba(45, 140, 255, 0.07)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.48, 0, Math.PI * 2);
    ctx.fill();

    if (scrolling) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.00005);

    [130, 220, 320].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 225, 255, 0.055)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 320, Math.sin(a) * 320);
      ctx.strokeStyle = "rgba(100, 225, 255, 0.03)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  function updateParticles() {
    const speed = scrolling ? 0.35 : 1;

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
    const maxDist = scrolling ? 70 : 115;
    const maxDistSq = maxDist * maxDist;

    if (!scrolling) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.16;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(80, 220, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130, 240, 255, ${p.a})`;
      ctx.fill();
    }
  }

  function render(time) {
    ctx.clearRect(0, 0, w, h);
    drawGlow(time);
    updateParticles();
    drawParticles();
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= FRAME_TIME) {
      lastFrame = time;
      render(time);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
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
      if (rect.top <= offset) current = item;
      else break;
    }

    tocLinks.forEach(link => link.classList.remove("active"));
    current.link.classList.add("active");
  }

  setActiveToc();
  window.addEventListener("scroll", setActiveToc, { passive: true });
  window.addEventListener("resize", setActiveToc);
}
