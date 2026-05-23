document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   DUAL BACKGROUND SYSTEM
   Home: aurora security lab theme.
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
  let stars = [];
  let beams = [];
  let nodes = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 32;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));

    stars = Array.from({ length: width < 1200 ? 120 : 190 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.35 + 0.22,
      a: Math.random() * 0.34 + 0.08,
      tw: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.035 + 0.01
    }));

    beams = Array.from({ length: width < 1200 ? 7 : 11 }, (_, i) => ({
      x: (i / (width < 1200 ? 6 : 10)) * width + (Math.random() - 0.5) * 80,
      w: Math.random() * 90 + 80,
      speed: Math.random() * 0.00035 + 0.00018,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.07 + 0.045,
      color: i % 4
    }));

    nodes = Array.from({ length: width < 1200 ? 26 : 42 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.72,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 0.7,
      pulse: Math.random() * Math.PI * 2,
      color: i % 4
    }));
  }

  function drawNightSky(time) {
    const t = time * 0.0001;
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#010512");
    bg.addColorStop(0.35, "#06172d");
    bg.addColorStop(0.72, "#03101f");
    bg.addColorStop(1, "#020816");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blooms = [
      [width * (0.18 + Math.sin(t) * 0.04), height * 0.18, Math.min(width, height) * 0.70, "rgba(86,199,255,0.20)"],
      [width * (0.82 + Math.cos(t) * 0.04), height * 0.22, Math.min(width, height) * 0.68, "rgba(45,212,191,0.15)"],
      [width * 0.56, height * 0.78, Math.min(width, height) * 0.66, "rgba(251,191,36,0.075)"]
    ];

    for (const [x, y, radius, color] of blooms) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.45, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars() {
    for (const s of stars) {
      s.tw += 0.018;
      s.y += s.drift;
      if (s.y > height + 10) {
        s.y = -10;
        s.x = Math.random() * width;
      }
      const alpha = s.a * (0.55 + Math.sin(s.tw) * 0.45);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215,252,255,${alpha})`;
      ctx.fill();
    }
  }

  function drawAurora(time) {
    const t = time * 0.001;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const b of beams) {
      const color = b.color === 1 ? "45,212,191" : b.color === 2 ? "251,191,36" : "86,199,255";
      const x = b.x + Math.sin(t * b.speed * 900 + b.phase) * 70 + (pointerX - 0.5) * 26;
      const top = height * 0.08;
      const bottom = height * 0.82;
      const gradient = ctx.createLinearGradient(x, top, x + b.w * 0.5, bottom);
      gradient.addColorStop(0, `rgba(${color},0)`);
      gradient.addColorStop(0.18, `rgba(${color},${b.alpha * 0.55})`);
      gradient.addColorStop(0.48, `rgba(${color},${b.alpha})`);
      gradient.addColorStop(1, `rgba(${color},0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x - b.w * 0.7, top);
      for (let y = top; y <= bottom; y += 34) {
        const wave = Math.sin(y * 0.012 + t + b.phase) * 42;
        ctx.lineTo(x + wave, y);
      }
      for (let y = bottom; y >= top; y -= 34) {
        const wave = Math.sin(y * 0.012 + t + b.phase + 1.6) * 42;
        ctx.lineTo(x + b.w + wave, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawLabGrid(time) {
    const horizon = height * 0.70;
    const vanishingX = width * (0.52 + (pointerX - 0.5) * 0.04);
    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < 18; i++) {
      const y = horizon + Math.pow(i / 17, 1.85) * height * 0.34;
      ctx.strokeStyle = `rgba(86,199,255,${0.13 * (1 - i / 20)})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let i = -14; i <= 14; i++) {
      const bottomX = width * 0.5 + i * width * 0.072;
      ctx.strokeStyle = "rgba(124,240,255,0.07)";
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSecurityNodes() {
    const maxDist = 135;
    const maxDistSq = maxDist * maxDist;
    ctx.save();

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      a.pulse += 0.028;
      if (a.x < -30) a.x = width + 30;
      if (a.x > width + 30) a.x = -30;
      if (a.y < -30) a.y = height * 0.72;
      if (a.y > height * 0.74) a.y = -30;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) continue;
        const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.16;
        ctx.strokeStyle = `rgba(124,240,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const n of nodes) {
      const color = n.color === 1 ? "45,212,191" : n.color === 2 ? "251,191,36" : "124,240,255";
      const pulse = 0.7 + Math.sin(n.pulse) * 0.3;
      ctx.beginPath();
      ctx.arc(n.x + (pointerX - 0.5) * n.r * 9, n.y + (pointerY - 0.5) * n.r * 6, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.72)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.055)`;
      ctx.fill();
    }

    ctx.restore();
  }

  function drawScan(time) {
    const y = (time * 0.055) % (height + 280) - 140;
    const g = ctx.createLinearGradient(0, y - 85, 0, y + 85);
    g.addColorStop(0, "rgba(124,240,255,0)");
    g.addColorStop(0.5, "rgba(124,240,255,0.085)");
    g.addColorStop(1, "rgba(124,240,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 85, width, 170);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawNightSky(time);
    drawStars();
    drawAurora(time);
    drawLabGrid(time);
    drawSecurityNodes();
    drawScan(time);
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
