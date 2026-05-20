document.addEventListener("DOMContentLoaded", () => {
  setupStableBackground();
  setupFilters();
});

function setupStableBackground() {
  // Remove old canvas if it exists, because canvas repaint can cause white flash on fast scrolling.
  const oldCanvas = document.getElementById("site-bg");
  if (oldCanvas) oldCanvas.remove();

  const layers = [
    ["div", "bg-orb"],
    ["div", "bg-radar"],
    ["div", "bg-sweep"],
    ["div", "bg-stars"]
  ];

  for (const [tag, className] of layers) {
    if (!document.querySelector("." + className)) {
      const el = document.createElement(tag);
      el.className = className;
      document.body.prepend(el);
    }
  }
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
