document.addEventListener("DOMContentLoaded", () => {
  initBootScreen();
  initCyberBackground();
  setupFilters();
  initTocActiveHighlight();
  initScrollReveal();
  initCardTilt();
  initSocStatusBar();
  initTerminal();
});

function initBootScreen() {
  const bootScreen = document.getElementById("boot-screen");
  if (!bootScreen) return;
  
  if (sessionStorage.getItem("booted") || location.pathname.includes("writeups")) {
    bootScreen.style.display = "none";
    return;
  }

  const bootText = document.getElementById("boot-text");
  const lines = [
    { text: "Initializing kernel...", delay: 200 },
    { text: "[OK] Core modules loaded.", delay: 300, class: "info" },
    { text: "Mounting file systems...", delay: 150 },
    { text: "[OK] File systems mounted.", delay: 200, class: "info" },
    { text: "Starting security daemon...", delay: 400 },
    { text: "[WARN] Unauthorized access attempt detected. Blocking...", delay: 500, class: "warn" },
    { text: "[OK] Network secured. Firewall active.", delay: 300, class: "info" },
    { text: "Loading SOC Analyst Profile: Nguyen Thai Ngoc", delay: 600 },
    { text: "Access Granted. Welcome.", delay: 400, class: "info" }
  ];

  let currentLine = 0;
  
  function renderLine() {
    if (currentLine >= lines.length) {
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        sessionStorage.setItem("booted", "true");
      }, 500);
      return;
    }
    
    const line = lines[currentLine];
    const p = document.createElement("p");
    if (line.class) p.className = line.class;
    p.innerText = line.text;
    bootText.appendChild(p);
    
    currentLine++;
    setTimeout(renderLine, line.delay);
  }
  
  setTimeout(renderLine, 300);
}

function initTerminal() {
  const input = document.getElementById("term-input");
  const body = document.getElementById("terminal-body");
  if (!input || !body) return;

  const commands = {
    "help": "Available commands: \n- whoami: About me\n- skills: My tech stack\n- clear: Clear terminal",
    "whoami": "guest@thaingoc\nRole: SOC Analyst & Threat Hunter in training\nLocation: Vietnam\nStatus: Always learning",
    "skills": "Security: SOC Analysis, Forensics, Malware Analysis, Reverse Engineering\nTools: Wireshark, Splunk, Ghidra, Volatility\nLanguages: Python, C/C++, Bash",
    "clear": ""
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = input.value.trim().toLowerCase();
      input.value = "";
      
      if (!val) return;

      const line = document.createElement("div");
      line.className = "term-line";
      line.innerHTML = `<span class="prompt">guest@thaingoc:~$</span> <span>${val}</span>`;
      input.parentElement.before(line);

      if (val === "clear") {
        const lines = body.querySelectorAll(".term-line:not(:last-child), .term-output");
        lines.forEach(l => l.remove());
        return;
      }

      const out = document.createElement("div");
      out.className = "term-output";
      out.innerText = commands[val] || `bash: ${val}: command not found. Type 'help' for available commands.`;
      input.parentElement.before(out);

      body.scrollTop = body.scrollHeight;
    }
  });
  
  body.addEventListener("click", () => input.focus());
}

/* =========================================================
   BACKGROUND SYSTEM
   Home uses animated SOC map. Writeups use a calmer reading background.
   ========================================================= */

function initCyberBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  removeOldBackgrounds();

  const isWriteupsPage = location.pathname.includes("writeups");
  document.body.classList.add(isWriteupsPage ? "writeups-bg-mode" : "home-bg-mode");

  if (isWriteupsPage) {
    initWriteupsReadingBackground();
    return;
  }

  if (prefersReducedMotion || window.innerWidth <= 760) return;
  initHomeBackground(false);
}

function initWriteupsReadingBackground() {
  if (document.getElementById("writeups-reading-bg-style")) return;

  const style = document.createElement("style");
  style.id = "writeups-reading-bg-style";
  style.textContent = `
    body.writeups-bg-mode {
      background:
        radial-gradient(circle at 12% 8%, rgba(56,189,248,.10), transparent 28%),
        radial-gradient(circle at 86% 18%, rgba(168,85,247,.11), transparent 30%),
        radial-gradient(circle at 55% 92%, rgba(20,184,166,.08), transparent 34%),
        linear-gradient(180deg, #030712 0%, #07111f 42%, #0b1020 100%) !important;
    }

    body.writeups-bg-mode::before {
      opacity: .45;
      background:
        linear-gradient(rgba(148,163,184,.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148,163,184,.03) 1px, transparent 1px),
        radial-gradient(circle at 20% 20%, rgba(56,189,248,.08), transparent 30%),
        radial-gradient(circle at 78% 35%, rgba(168,85,247,.08), transparent 34%) !important;
      background-size: 44px 44px, 44px 44px, 900px 900px, 960px 960px !important;
      animation: writeupGridDrift 55s linear infinite !important;
    }

    body.writeups-bg-mode::after {
      opacity: .22;
      width: min(680px, 84vw);
      height: min(680px, 84vw);
      background:
        radial-gradient(circle, transparent 0 34%, rgba(56,189,248,.08) 34.4%, transparent 35.2%, transparent 58%, rgba(168,85,247,.055) 58.4%, transparent 59.2%, transparent 100%),
        conic-gradient(from 150deg, transparent 0deg, rgba(56,189,248,.08) 26deg, rgba(168,85,247,.06) 54deg, transparent 86deg, transparent 360deg) !important;
      animation: writeupSlowRotate 44s linear infinite !important;
    }

    body.writeups-bg-mode .glass-card,
    body.writeups-bg-mode .section-card,
    body.writeups-bg-mode .toc,
    body.writeups-bg-mode .glass,
    body.writeups-bg-mode .card {
      background-color: rgba(6, 13, 27, .72);
    }

    @keyframes writeupGridDrift {
      to { background-position: 44px 44px, 44px 44px, 120px -90px, -120px 110px; }
    }

    @keyframes writeupSlowRotate {
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
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

function initHomeBackground(isWriteupsPage = false) {
  const { canvas, ctx } = createBgCanvas();
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let endpoints = [];
  let packets = [];
  let alerts = [];
  let scanBeams = [];
  let lastFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let isScrolling = false;
  let scrollTimer = null;
  const fps = isWriteupsPage ? 24 : 30;
  const frameInterval = 1000 / fps;

  function setScrolling() {
    if (!isScrolling) document.body.classList.add("is-scrolling");
    isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { 
      isScrolling = false; 
      document.body.classList.remove("is-scrolling");
    }, 120);
  }

  function createScene() {
    ({ width, height } = fitCanvas(canvas, ctx));
    const nodeCount = isWriteupsPage ? (width < 1200 ? 24 : 38) : (width < 1200 ? 30 : 48);
    const packetCount = isWriteupsPage ? (width < 1200 ? 9 : 15) : (width < 1200 ? 12 : 20);
    const alertCount = isWriteupsPage ? (width < 1200 ? 2 : 4) : (width < 1200 ? 3 : 5);
    const beamCount = isWriteupsPage ? (width < 1200 ? 2 : 3) : (width < 1200 ? 2 : 4);

    endpoints = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: height * 0.12 + Math.random() * height * 0.70,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.10,
      r: Math.random() * 1.7 + 0.8,
      pulse: Math.random() * Math.PI * 2,
      type: i % 7 === 0 ? "alert" : i % 5 === 0 ? "asset" : "node"
    }));

    packets = Array.from({ length: packetCount }, () => createPacket(true));
    alerts = Array.from({ length: alertCount }, () => ({
      x: Math.random() * width,
      y: height * 0.16 + Math.random() * height * 0.58,
      t: Math.random() * 1000,
      life: Math.random() * 260 + 220,
      max: Math.random() * 88 + 70
    }));
    scanBeams = Array.from({ length: beamCount }, () => ({
      x: Math.random() * width,
      speed: Math.random() * 0.45 + 0.25,
      w: Math.random() * 90 + 80,
      alpha: Math.random() * 0.045 + 0.028
    }));
  }

  function createPacket(randomize = false) {
    const a = Math.floor(Math.random() * Math.max(1, endpoints.length));
    let b = Math.floor(Math.random() * Math.max(1, endpoints.length));
    if (a === b) b = (b + 1) % Math.max(1, endpoints.length);
    return { a, b, t: randomize ? Math.random() : 0, speed: Math.random() * 0.006 + 0.003, size: Math.random() * 2 + 1, color: Math.random() > 0.78 ? "amber" : "cyan" };
  }

  function drawBackground(time) {
    const t = time * 0.00012;
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#010612");
    bg.addColorStop(0.38, "#061a31");
    bg.addColorStop(0.74, "#020d1d");
    bg.addColorStop(1, "#020816");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const blooms = [
      [width * (0.16 + Math.sin(t) * 0.04), height * 0.18, Math.min(width, height) * 0.70, "rgba(86,199,255,0.18)"],
      [width * (0.86 + Math.cos(t) * 0.04), height * 0.30, Math.min(width, height) * 0.72, "rgba(45,212,191,0.13)"],
      [width * 0.56, height * 0.88, Math.min(width, height) * 0.68, "rgba(251,191,36,0.075)"]
    ];

    for (const [x, y, radius, color] of blooms) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.46, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMapGrid(time) {
    if (isScrolling) return;
    const drift = (time * 0.014) % 58;
    ctx.save();
    ctx.lineWidth = 1;
    for (let x = -58 + drift; x < width + 58; x += 58) {
      ctx.strokeStyle = "rgba(124,240,255,0.045)";
      ctx.beginPath();
      ctx.moveTo(x + (pointerX - 0.5) * 18, 0);
      ctx.lineTo(x + height * 0.12 + (pointerX - 0.5) * 18, height);
      ctx.stroke();
    }
    for (let y = -58 + drift; y < height + 58; y += 58) {
      ctx.strokeStyle = "rgba(124,240,255,0.04)";
      ctx.beginPath();
      ctx.moveTo(0, y + (pointerY - 0.5) * 12);
      ctx.lineTo(width, y - width * 0.04 + (pointerY - 0.5) * 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateEndpoints() {
    const speed = isScrolling ? 0.35 : 1;
    for (const e of endpoints) {
      e.x += e.vx * speed;
      e.y += e.vy * speed;
      e.pulse += 0.028 * speed;
      if (e.x < -30) e.x = width + 30;
      if (e.x > width + 30) e.x = -30;
      if (e.y < height * 0.08) e.y = height * 0.80;
      if (e.y > height * 0.83) e.y = height * 0.08;
    }
  }

  function drawNetwork() {
    if (isScrolling) return;
    const maxDist = width < 1200 ? 150 : 180;
    const maxDistSq = maxDist * maxDist;
    ctx.save();
    for (let i = 0; i < endpoints.length; i++) {
      const a = endpoints[i];
      for (let j = i + 1; j < endpoints.length; j++) {
        const b = endpoints[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistSq) continue;
        const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.16;
        ctx.strokeStyle = a.type === "alert" || b.type === "alert" ? `rgba(251,191,36,${alpha * 0.9})` : `rgba(124,240,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPackets() {
    ctx.save();
    for (const p of packets) {
      const a = endpoints[p.a];
      const b = endpoints[p.b];
      if (!a || !b) continue;
      p.t += p.speed * (isScrolling ? 0.35 : 1);
      if (p.t >= 1) Object.assign(p, createPacket(false));
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const color = p.color === "amber" ? "251,191,36" : "124,240,255";
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.85)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.08)`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEndpoints() {
    ctx.save();
    for (const e of endpoints) {
      const color = e.type === "alert" ? "251,191,36" : e.type === "asset" ? "45,212,191" : "124,240,255";
      const pulse = 0.72 + Math.sin(e.pulse) * 0.28;
      ctx.beginPath();
      ctx.arc(e.x + (pointerX - 0.5) * e.r * 8, e.y + (pointerY - 0.5) * e.r * 6, e.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.78)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * (e.type === "alert" ? 8 : 4.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${e.type === "alert" ? 0.075 : 0.045})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAlerts() {
    if (isScrolling) return;
    ctx.save();
    for (const a of alerts) {
      a.t += 1.5;
      const radius = (a.t % a.life) / a.life * a.max;
      const opacity = Math.max(0, 1 - radius / a.max) * 0.22;
      ctx.beginPath();
      ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251,191,36,${opacity})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      if (radius > a.max - 2) {
        a.x = Math.random() * width;
        a.y = height * 0.16 + Math.random() * height * 0.58;
      }
    }
    ctx.restore();
  }

  function drawScanBeams() {
    if (isScrolling) return;
    ctx.save();
    for (const b of scanBeams) {
      const g = ctx.createLinearGradient(b.x - b.w, 0, b.x + b.w, 0);
      g.addColorStop(0, "rgba(124,240,255,0)");
      g.addColorStop(0.5, `rgba(124,240,255,${b.alpha})`);
      g.addColorStop(1, "rgba(124,240,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(b.x - b.w, 0, b.w * 2, height);
      b.x += b.speed;
      if (b.x - b.w > width) b.x = -b.w;
    }
    ctx.restore();
  }

  function drawHudLabels(time) {
    if (isScrolling) return;
    ctx.save();
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.fillStyle = "rgba(160,230,255,0.16)";
    const labels = ["SIEM", "EDR", "IDS", "SOC", "LOG", "IOC", "DNS", "FW"];
    for (let i = 0; i < labels.length; i++) {
      const x = ((i * 173 + time * 0.012) % (width + 120)) - 60;
      const y = height * (0.18 + (i % 5) * 0.12);
      ctx.fillText(labels[i], x, y);
    }
    ctx.restore();
  }

  function render(time) {
    if (!document.body.contains(canvas)) return;
    ctx.clearRect(0, 0, width, height);
    drawBackground(time);
    drawMapGrid(time);
    drawScanBeams();
    drawHudLabels(time);
    updateEndpoints();
    drawNetwork();
    drawPackets();
    drawEndpoints();
    drawAlerts();
  }

  function loop(time) {
    // Pause rendering entirely while scrolling or hidden to save CPU/GPU and ensure buttery smooth scroll
    if (document.hidden || isScrolling) {
      requestAnimationFrame(loop);
      return;
    }
    if (!lastFrame || time - lastFrame >= frameInterval) {
      lastFrame = time;
      render(time);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", debounce(createScene, 160), { passive: true });
  window.addEventListener("scroll", setScrolling, { passive: true });
  window.addEventListener("wheel", setScrolling, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;
  }, { passive: true });

  createScene();
  requestAnimationFrame(loop);
}

function removeOldBackgrounds() {
  const selectors = ["#site-bg", "#network-bg", ".bg-orb", ".bg-radar", ".bg-sweep", ".bg-stars", ".cmdk-overlay"];
  for (const selector of selectors) document.querySelectorAll(selector).forEach((element) => element.remove());
}

/* =========================================================
   PREMIUM MICRO INTERACTIONS
   ========================================================= */

function initScrollReveal() {
  const items = Array.from(document.querySelectorAll(".hero-copy, .profile-card, .section, .card, .article-card, .toc"));
  if (!items.length) return;

  // Fail-safe: content must never stay invisible if IntersectionObserver is blocked,
  // delayed, or a card was hidden/shown by the writeup filters before being observed.
  function revealAll() {
    for (const item of items) item.classList.add("is-visible");
  }

  if (!('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  items.forEach((item) => item.classList.add("reveal-item"));

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.05, rootMargin: "0px 0px 120px 0px" });

  items.forEach((item) => observer.observe(item));
  window.addEventListener("load", () => setTimeout(revealAll, 600), { once: true });
  setTimeout(revealAll, 1500);
}

function initCardTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth <= 900) return;
  const cards = document.querySelectorAll(".card");
  for (const card of cards) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 8;
      card.style.setProperty("--tilt-x", `${rotateX}deg`);
      card.style.setProperty("--tilt-y", `${rotateY}deg`);
      card.style.setProperty("--glow-x", `${x * 100}%`);
      card.style.setProperty("--glow-y", `${y * 100}%`);
      card.classList.add("tilting");
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("tilting");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  }
}

function initSocStatusBar() {
  if (document.querySelector(".soc-status")) return;
  const bar = document.createElement("div");
  bar.className = "soc-status";
  bar.innerHTML = `<span class="soc-dot"></span><span>SOC Analyst Mode</span><span>Threat Hunting</span><span>CTF</span><span>Blue Team</span>`;
  document.body.appendChild(bar);
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
        card.classList.add("is-visible");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
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
