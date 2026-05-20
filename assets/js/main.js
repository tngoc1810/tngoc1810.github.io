
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.dataset.theme = savedTheme;
document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
  const sync=()=>btn.textContent = root.dataset.theme === "light" ? "☀" : "☾";
  sync();
  btn.addEventListener("click",()=>{
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", root.dataset.theme);
    sync();
  });
});
const menuBtn=document.querySelector("[data-menu-btn]");
const mobile=document.querySelector("[data-mobile]");
if(menuBtn&&mobile){
  menuBtn.addEventListener("click",()=>mobile.classList.toggle("show"));
  mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.classList.remove("show")));
}
const filterBtns=[...document.querySelectorAll("[data-filter]")];
const search=document.querySelector("[data-search]");
const cards=[...document.querySelectorAll("[data-card]")];
let active="all";
function applyFilters(){
  const q=(search?.value||"").toLowerCase().trim();
  cards.forEach(card=>{
    const cat=card.dataset.category||"";
    const text=((card.dataset.text||"")+" "+card.textContent).toLowerCase();
    const okFilter=active==="all"||cat.includes(active);
    const okSearch=!q||text.includes(q);
    card.style.display=okFilter&&okSearch?"":"none";
  });
}
filterBtns.forEach(btn=>btn.addEventListener("click",()=>{
  filterBtns.forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  active=btn.dataset.filter;
  applyFilters();
}));
if(search) search.addEventListener("input",applyFilters);
