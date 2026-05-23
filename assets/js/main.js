document.addEventListener("DOMContentLoaded", () => {
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
});

/* =========================================================
   DUAL BACKGROUND SYSTEM
   Home: angular cinematic cyber city / neural grid, no circular portal.
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
  let towers = [];
  let dataLines = [];
  let drones = [];
  let comets = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  const fps = 34;
  const frameInterval = 1000 / fps;

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));

    stars = Array.from({ length: width < 1200 ? 120 : 190 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.22,
      a: Math.random() * 0.38 + 0.08,
      tw: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.055 + 0.015
    }));

    towers = Array.from({ length: width < 1200 ? 18 : 28 }, (_, i) => {
      const w = Math.random() * 42 + 26;
      const h = Math.random() * height * 0.34 + height * 0.16;
      return {
        x: (i / (width < 1200 ? 17 : 27)) * width + (Math.random() - 0.5) * 38,
        w,
        h,
        depth: Math.random() * 0.6 + 0.4,
        blink: Math.random() * Math.PI * 2,
        color: i % 3
      };
    });

    dataLines = Array.from({ length: width < 1200 ? 36 : 58 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 160 + 70,
      speed: Math.random() * 1.2 + 0.55,
      alpha: Math.random() * 0.18 + 0.06,
      vertical: i % 3 !== 0,
      color: i % 4
    }));

    drones = Array.from({ length: width < 1200 ? 18 : 30 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.72,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.7,
      pulse: Math.random() * Math.PI * 2,
      color: i % 4
    }));

    comets = Array.from({ length: width < 1200 ? 2 : 3 }, () => resetComet(true));
  }

  function resetComet(randomize = false) {
    return {
      x: randomize ? Math.random() * width : -280,
      y: randomize ? Math.random() * height * 0.65 : Math.random() * height * 0.45 + 40,
      len: Math.random() * 340 + 360,
      speed: Math.random() * 2.0 + 1.6,
      alpha: Math.random() * 0.16 + 0.12,
      angle: -0.25 + Math.random() * 0.08
    };
  }

  function drawSpaceWash(time) {
    const t = time * 0.00012;
    ctx.fillStyle = "#010512";
    ctx.fillRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "rgba(2, 8, 22, 1)");
    bg.addColorStop(0.38, "rgba(4, 31, 57, 0.88)");
    bg.addColorStop(0.76, "rgba(8, 18, 40, 0.92)");
    bg.addColorStop(1, "rgba(2, 8, 22, 1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blobs = [
      [width * (0.18 + Math.sin(t) * 0.04), height * 0.12, Math.min(width, height) * 0.75, "rgba(86, 199, 255, 0.25)"],
      [width * (0.84 + Math.cos(t) * 0.04), height * 0.30, Math.min(width, height) * 0.70, "rgba(45, 212, 191, 0.17)"],
      [width * 0.48, height * 0.92, Math.min(width, height) * 0.72, "rgba(251, 191, 36, 0.11)"]
    ];

    for (const [x, y, radius, color] of blobs) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.48, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStars() {
    for (const s of stars) {
      s.tw += 0.02;
      s.y += s.drift;
      if (s.y > height + 10) {
        s.y = -10;
        s.x = Math.random() * width;
      }
      const alpha = s.a * (0.56 + Math.sin(s.tw) * 0.44);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215, 252, 255, ${alpha})`;
      ctx.fill();
    }
  }

  function drawPerspectiveGrid() {
    const horizon = height * 0.68;
    const vanishingX = width * (0.52 + (pointerX - 0.5) * 0.05);
    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < 22; i++) {
      const y = horizon + Math.pow(i / 21, 1.9) * height * 0.36;
      ctx.strokeStyle = `rgba(86, 199, 255, ${0.17 * (1 - i / 24)})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let i = -18; i <= 18; i++) {
      const bottomX = width * 0.5 + i * width * 0.058;
      ctx.strokeStyle = "rgba(124, 240, 255, 0.085)";
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCyberCity(time) {
    const ground = height * 0.88;
    ctx.save();

    for (const b of towers) {
      b.blink += 0.035;
      const px = b.x + (pointerX - 0.5) * b.depth * 34;
      const py = ground - b.h + (pointerY - 0.5) * b.depth * 14;
      const alpha = 0.16 + b.depth * 0.16;

      const wall = ctx.createLinearGradient(px, py, px + b.w, ground);
      wall.addColorStop(0, `rgba(86, 199, 255, ${0.045 + b.depth * 0.035})`);
      wall.addColorStop(1, `rgba(2, 8, 22, ${0.40 + b.depth * 0.22})`);
      ctx.fillStyle = wall;
      ctx.beginPath();
      ctx.moveTo(px, ground);
      ctx.lineTo(px + b.w * 0.12, py + b.w * 0.25);
      ctx.lineTo(px + b.w * 0.88, py);
      ctx.lineTo(px + b.w, ground);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = b.color === 1 ? `rgba(45, 212, 191, ${alpha})` : b.color === 2 ? `rgba(251, 191, 36, ${alpha * 0.75})` : `rgba(86, 199, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const rows = Math.floor(b.h / 28);
      for (let r = 1; r < rows; r++) {
        if ((r + Math.floor(b.blink)) % 3 !== 0) continue;
        const wy = ground - r * 24;
        ctx.fillStyle = b.color === 2 ? "rgba(251, 191, 36, 0.22)" : "rgba(124, 240, 255, 0.18)";
        ctx.fillRect(px + b.w * 0.24, wy, b.w * 0.12, 2);
        ctx.fillRect(px + b.w * 0.58, wy - 4, b.w * 0.14, 2);
      }
    }

    ctx.restore();
  }

  function drawDataRain() {
    ctx.save();
    ctx.lineCap = "round";
    for (const l of dataLines) {
      const color = l.color === 1 ? "45, 212, 191" : l.color === 2 ? "251, 191, 36" : "86, 199, 255";
      if (l.vertical) {
        const g = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.len);
        g.addColorStop(0, `rgba(${color}, 0)`);
        g.addColorStop(0.45, `rgba(${color}, ${l.alpha})`);
        g.addColorStop(1, `rgba(${color}, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.len);
        ctx.stroke();
        l.y += l.speed;
        if (l.y > height + l.len) {
          l.y = -l.len;
          l.x = Math.random() * width;
        }
      } else {
        const g = ctx.createLinearGradient(l.x, l.y, l.x + l.len, l.y);
        g.addColorStop(0, `rgba(${color}, 0)`);
        g.addColorStop(0.5, `rgba(${color}, ${l.alpha * 0.75})`);
        g.addColorStop(1, `rgba(${color}, 0)`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.len, l.y);
        ctx.stroke();
        l.x += l.speed * 0.9;
        if (l.x > width + l.len) {
          l.x = -l.len;
          l.y = Math.random() * height;
        }
      }
    }
    ctx.restore();
  }

  function drawNetworkDrones() {
    const maxDist = 150;
    const maxDistSq = maxDist * maxDist;
    ctx.save();

    for (let i = 0; i < drones.length; i++) {
      const a = drones[i];
      a.x += a.vx;
      a.y += a.vy;
      a.pulse += 0.03;
      if (a.x < -30) a.x = width + 30;
      if (a.x > width + 30) a.x = -30;
      if (a.y < -30) a.y = height * 0.72;
      if (a.y > height * 0.75) a.y = -30;

      for (let j = i + 1; j < drones.length; j++) {
        const b = drones[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) continue;
        const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.18;
        ctx.strokeStyle = `rgba(124, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const d of drones) {
      const color = d.color === 1 ? "45, 212, 191" : d.color === 2 ? "251, 191, 36" : "124, 240, 255";
      const pulse = 0.7 + Math.sin(d.pulse) * 0.3;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.72)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.055)`;
      ctx.fill();
    }

    ctx.restore();
  }

  function drawComets() {
    ctx.save();
    ctx.lineCap = "round";
    for (const c of comets) {
      const dx = Math.cos(c.angle) * c.len;
      const dy = Math.sin(c.angle) * c.len;
      const g = ctx.createLinearGradient(c.x, c.y, c.x - dx, c.y - dy);
      g.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      g.addColorStop(0.22, `rgba(124, 240, 255, ${c.alpha * 0.8})`);
      g.addColorStop(1, "rgba(124, 240, 255, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - dx, c.y - dy);
      ctx.stroke();
      c.x += c.speed;
      c.y += Math.sin(c.angle) * c.speed;
      if (c.x > width + c.len || c.y < -c.len) Object.assign(c, resetComet(false));
    }
    ctx.restore();
  }

  function drawScan(time) {
    const y = (time * 0.07) % (height + 320) - 160;
    const g = ctx.createLinearGradient(0, y - 95, 0, y + 95);
    g.addColorStop(0, "rgba(124, 240, 255, 0)");
    g.addColorStop(0.5, "rgba(124, 240, 255, 0.10)");
    g.addColorStop(1, "rgba(124, 240, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 95, width, 190);
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawSpaceWash(time);
    drawStars();
    drawPerspectiveGrid();
    drawDataRain();
    drawComets();
    drawNetworkDrones();
    drawCyberCity(time);
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
