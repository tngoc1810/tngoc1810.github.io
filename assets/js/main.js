document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   DUAL BACKGROUND SYSTEM
   Home: premium digital-ocean wave / data current theme.
   Writeups: lightweight elegant reading background.
   ========================================================= */

function initCyberBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  removeOldBackgrounds();

  if (prefersReducedMotion || window.innerWidth <= 760) return;

  const isArticlePage = Boolean(document.querySelector(".article-layout"));
  const isWriteupsIndex = location.pathname.includes("writeups");

  if (isArticlePage || isWriteupsIndex) {
    document.body.classList.add("reading-bg-mode");
    initReadingBackground(isArticlePage);
    return;
  }

  document.body.classList.add("home-bg-mode");
  initHomeBackground();
}

function createBgCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "network-bg";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  return { canvas, ctx };
}

function fitCanvas(canvas, ctx) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
}

function initHomeBackground() {
  const { canvas, ctx } = createBgCanvas();
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let currents = [];
  let glints = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 34;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));

    particles = Array.from({ length: width < 1200 ? 85 : 140 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.random() * 0.22 + 0.04,
      vy: (Math.random() - 0.5) * 0.11,
      r: Math.random() * 1.6 + 0.35,
      a: Math.random() * 0.22 + 0.07,
      phase: Math.random() * Math.PI * 2,
      color: i % 5
    }));

    currents = Array.from({ length: width < 1200 ? 10 : 15 }, (_, i) => ({
      y: height * (0.16 + i * 0.055) + Math.random() * 24,
      amp: Math.random() * 34 + 26,
      freq: Math.random() * 0.006 + 0.004,
      speed: Math.random() * 0.0008 + 0.00042,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.075 + 0.045,
      color: i % 4
    }));

    glints = Array.from({ length: width < 1200 ? 7 : 11 }, () => resetGlint(true));
  }

  function resetGlint(randomize = false) {
    return {
      x: randomize ? Math.random() * width : -240,
      y: randomize ? Math.random() * height : Math.random() * height,
      len: Math.random() * 260 + 210,
      speed: Math.random() * 1.6 + 1.0,
      alpha: Math.random() * 0.13 + 0.08,
      curve: Math.random() * 0.7 + 0.3
    };
  }

  function drawAtmosphere(time) {
    const t = time * 0.00012;
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#020816");
    bg.addColorStop(0.34, "#05223f");
    bg.addColorStop(0.70, "#03172d");
    bg.addColorStop(1, "#020816");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blooms = [
      [width * (0.18 + Math.sin(t) * 0.05), height * 0.22, Math.min(width, height) * 0.70, "rgba(86, 199, 255, 0.24)"],
      [width * (0.78 + Math.cos(t) * 0.04), height * 0.42, Math.min(width, height) * 0.74, "rgba(45, 212, 191, 0.18)"],
      [width * 0.50, height * (0.86 + Math.sin(t * 0.9) * 0.03), Math.min(width, height) * 0.70, "rgba(251, 191, 36, 0.09)"]
    ];

    for (const [x, y, radius, color] of blooms) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.42, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWaveGrid(time) {
    const t = time * 0.001;
    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < currents.length; i++) {
      const c = currents[i];
      const color = c.color === 1 ? "45, 212, 191" : c.color === 2 ? "251, 191, 36" : "86, 199, 255";
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 18) {
        const px = x;
        const parallax = (pointerY - 0.5) * (i + 1) * 3;
        const y = c.y + parallax + Math.sin(x * c.freq + t * (0.9 + c.speed * 1000) + c.phase) * c.amp;
        if (x === -20) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.strokeStyle = `rgba(${color}, ${c.alpha})`;
      ctx.stroke();
    }

    for (let x = -120; x < width + 120; x += 90) {
      const shift = (time * 0.018 + pointerX * 22) % 90;
      ctx.beginPath();
      for (let y = height * 0.28; y <= height + 30; y += 20) {
        const px = x + shift + Math.sin(y * 0.018 + t) * 24;
        if (y === height * 0.28) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.strokeStyle = "rgba(124, 240, 255, 0.045)";
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDataCurrents() {
    ctx.save();
    ctx.lineCap = "round";
    for (const g of glints) {
      const y = g.y + Math.sin(g.x * 0.009) * 34 * g.curve;
      const gradient = ctx.createLinearGradient(g.x, y, g.x + g.len, y - 40);
      gradient.addColorStop(0, "rgba(124, 240, 255, 0)");
      gradient.addColorStop(0.36, `rgba(124, 240, 255, ${g.alpha})`);
      gradient.addColorStop(0.70, `rgba(45, 212, 191, ${g.alpha * 0.55})`);
      gradient.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(g.x, y);
      ctx.quadraticCurveTo(g.x + g.len * 0.5, y - 46, g.x + g.len, y - 12);
      ctx.stroke();

      g.x += g.speed;
      if (g.x > width + g.len) Object.assign(g, resetGlint(false));
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (const p of particles) {
      p.phase += 0.018;
      p.x += p.vx;
      p.y += p.vy + Math.sin(p.phase) * 0.025;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const color = p.color === 1 ? "45, 212, 191" : p.color === 2 ? "251, 191, 36" : "180, 245, 255";
      const alpha = p.a * (0.7 + Math.sin(p.phase) * 0.3);
      ctx.beginPath();
      ctx.arc(p.x + (pointerX - 0.5) * p.r * 10, p.y + (pointerY - 0.5) * p.r * 7, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLightShelf(time) {
    const y = height * 0.66 + Math.sin(time * 0.0006) * 18;
    const g = ctx.createLinearGradient(0, y - 100, 0, y + 160);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.36, "rgba(124, 240, 255, 0.095)");
    g.addColorStop(0.55, "rgba(45, 212, 191, 0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 100, width, 260);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawAtmosphere(time);
    drawLightShelf(time);
    drawWaveGrid(time);
    drawDataCurrents();
    drawParticles();
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(createScene, 160), { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;
  }, { passive: true });

  createScene();
  requestAnimationFrame(loop);
}

function initReadingBackground(isArticlePage) {
  const { canvas, ctx } = createBgCanvas();
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dots = [];
  let lastFrame = 0;
  const fps = isArticlePage ? 10 : 14;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    dots = Array.from({ length: isArticlePage ? 12 : 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.045,
      vy: (Math.random() - 0.5) * 0.04,
      r: Math.random() * 1 + 0.45,
      a: Math.random() * 0.10 + 0.045
    }));
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    const t = time * 0.000055;

    const g1 = ctx.createRadialGradient(width * (0.22 + Math.sin(t) * 0.018), height * 0.16, 0, width * 0.22, height * 0.16, Math.min(width, height) * 0.55);
    g1.addColorStop(0, "rgba(86, 199, 255, 0.065)");
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, width, height);

    const g2 = ctx.createRadialGradient(width * 0.82, height * (0.76 + Math.cos(t) * 0.018), 0, width * 0.82, height * 0.76, Math.min(width, height) * 0.55);
    g2.addColorStop(0, "rgba(45, 212, 191, 0.038)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, width, height);

    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < -20) d.x = width + 20;
      if (d.x > width + 20) d.x = -20;
      if (d.y < -20) d.y = height + 20;
      if (d.y > height + 20) d.y = -20;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 235, 255, ${d.a})`;
      ctx.fill();
    }
  }

  function loop(time) {
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(createScene, 180), { passive: true });
  createScene();
  requestAnimationFrame(loop);
}

function removeOldBackgrounds() {
  const selectors = ["#site-bg", "#network-bg", ".bg-orb", ".bg-radar", ".bg-sweep", ".bg-stars"];
  for (const selector of selectors) document.querySelectorAll(selector).forEach((element) => element.remove());
}

function setupFilters() {
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const searchInput = document.querySelector("[data-search]");
  const emptyState = document.querySelector("[data-empty]");
  if (!chips.length || !cards.length) return;

  function getActiveFilter() {
    const activeChip = document.querySelector("[data-filter].active");
    return activeChip ? activeChip.dataset.filter : "all";
  }

  function normalize(value) { return String(value || "").trim().toLowerCase(); }

  function applyFilter() {
    const activeFilter = normalize(getActiveFilter());
    const keyword = normalize(searchInput ? searchInput.value : "");
    let visibleCount = 0;

    for (const card of cards) {
      const category = normalize(card.dataset.category);
      const text = normalize(card.dataset.text || card.textContent);
      const categoryMatch = activeFilter === "all" || category.includes(activeFilter);
      const textMatch = !keyword || text.includes(keyword);
      if (categoryMatch && textMatch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else card.classList.add("hidden");
    }
    if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  for (const chip of chips) chip.addEventListener("click", () => {
    for (const item of chips) item.classList.remove("active");
    chip.classList.add("active");
    applyFilter();
  });

  if (searchInput) searchInput.addEventListener("input", debounce(applyFilter, 80));
  applyFilter();
}

function initTocActiveHighlight() {
  const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));
  if (!tocLinks.length) return;
  const sections = tocLinks.map((link) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return null;
    return { link, target };
  }).filter(Boolean);
  if (!sections.length) return;

  function setActiveToc() {
    const offset = 120;
    let current = sections[0];
    for (const item of sections) {
      const rect = item.target.getBoundingClientRect();
      if (rect.top <= offset) current = item;
      else break;
    }
    for (const link of tocLinks) link.classList.remove("active");
    current.link.classList.add("active");
  }

  setActiveToc();
  window.addEventListener("scroll", throttle(setActiveToc, 80), { passive: true });
  window.addEventListener("resize", debounce(setActiveToc, 120), { passive: true });
}

function copyCode(button) {
  const wrapper = button.closest(".code-block-wrapper");
  const code = wrapper ? wrapper.querySelector("pre code") : null;
  if (!code) return;
  const text = code.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const oldText = button.textContent;
    button.textContent = "Copied";
    button.classList.add("copied");
    setTimeout(() => {
      button.textContent = oldText || "Copy";
      button.classList.remove("copied");
    }, 1200);
  }).catch(() => {
    button.textContent = "Failed";
    setTimeout(() => { button.textContent = "Copy"; }, 1200);
  });
}

window.copyCode = copyCode;

function debounce(fn, wait = 100) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, wait = 100) {
  let lastTime = 0;
  let timer = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      lastTime = now;
      fn.apply(this, args);
      return;
    }
    if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
