/* Navigation enhancement; all links remain available when JavaScript is disabled. */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.topbar');
  const nav = header?.querySelector('.nav');
  if (header && nav) {
    nav.id = 'primary-navigation';
    nav.setAttribute('aria-label', 'Main navigation');
    const button = document.createElement('button');
    button.className = 'menu-toggle';
    button.type = 'button';
    button.textContent = 'Menu';
    button.setAttribute('aria-controls', nav.id);
    button.setAttribute('aria-expanded', 'false');
    nav.before(button);
    header.classList.add('nav-ready');
    const closeMenu = () => {
      header.classList.remove('nav-open');
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      button.setAttribute('aria-expanded', String(open));
    });
    header.addEventListener('keydown', event => {
      if (event.key === 'Escape' && header.classList.contains('nav-open')) {
        closeMenu();
        button.focus();
      }
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
    const current = location.pathname.replace(/index\.html$/, '');
    nav.querySelectorAll('a').forEach(link => {
      const path = new URL(link.href).pathname;
      const active = path === '/' ? current === '/' : current.startsWith(path);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  const main = document.querySelector('main');
  if (main) {
    main.id = 'main-content';
    main.tabIndex = -1;
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }
  document.querySelectorAll('[data-filter]').forEach(chip => {
    chip.setAttribute('aria-pressed', String(chip.classList.contains('active')));
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item.classList.contains('active'))));
    });
  });
  const empty = document.querySelector('[data-empty]');
  if (empty) { empty.setAttribute('role', 'status'); empty.setAttribute('aria-live', 'polite'); }
  initLibrarySummary();
  initContactCopy();
});

function initLibrarySummary() {
  const filters = document.querySelector('.filters-bar');
  const cards = [...document.querySelectorAll('[data-card]')];
  if (!filters || !cards.length) return;
  const toolbar = document.createElement('div');
  toolbar.className = 'library-summary';
  const count = document.createElement('p');
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  count.setAttribute('aria-atomic', 'true');
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'reset-filters';
  reset.textContent = 'Reset filters';
  const search = document.querySelector('[data-search]');
  const update = () => {
    const visible = cards.filter(card => !card.classList.contains('hidden')).length;
    const noun = location.pathname.startsWith('/achievements/') ? 'entries' : 'writeups';
    count.textContent = `Showing ${visible} of ${cards.length} ${noun}`;
    const active = document.querySelector('[data-filter].active');
    reset.hidden = !(search?.value.trim() || (active && active.dataset.filter !== 'all'));
  };
  reset.addEventListener('click', () => {
    if (search) search.value = '';
    const all = document.querySelector('[data-filter="all"]');
    if (all) all.click();
    else search?.dispatchEvent(new Event('input', {bubbles: true}));
    search?.focus();
  });
  toolbar.append(count, reset);
  filters.after(toolbar);
  document.addEventListener('portfolio:filter-change', update);
  update();
}

function initContactCopy() {
  const button = document.querySelector('[data-copy-email]');
  const status = document.querySelector('[data-copy-status]');
  if (!button || !status) return;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      status.textContent = 'Email address copied.';
    } catch {
      status.textContent = 'Copy is unavailable here. You can select the email address or use the email link.';
    }
  });
}
