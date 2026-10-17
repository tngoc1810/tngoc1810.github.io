/* Reading controls progressively enhance the original article markup. */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.pageKind !== 'article') return;
  const root = document.querySelector('.article-card, .lab-content, .writeup-article');
  const wrap = document.querySelector('main > .wrap, main > .lab-wrap');
  if (!root || !wrap) return;
  const vietnamese = document.documentElement.lang === 'vi';
  const nav = document.createElement('nav');
  nav.className = 'reading-nav';
  nav.setAttribute('aria-label', vietnamese ? 'Điều hướng bài viết' : 'Article navigation');
  const back = document.createElement('a');
  back.href = '/writeups/';
  back.textContent = vietnamese ? '← Thư viện writeup' : '← All writeups';
  const estimate = document.createElement('span');
  estimate.className = 'reading-estimate';
  // Approximation includes prose, code and captions; no invented publication dates.
  const words = root.textContent.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  estimate.textContent = vietnamese ? `Khoảng ${minutes} phút đọc` : `About ${minutes} min read`;
  nav.append(back, estimate);
  wrap.before(nav);
  nav.classList.add('wrap');

  const tools = document.createElement('div');
  tools.className = 'reading-tools';
  const size = document.createElement('button');
  size.type = 'button';
  size.textContent = vietnamese ? 'Chữ lớn hơn' : 'Larger text';
  size.setAttribute('aria-pressed', 'false');
  size.addEventListener('click', () => {
    const large = document.body.classList.toggle('reading-large');
    size.setAttribute('aria-pressed', String(large));
  });
  tools.append(size);
  nav.after(tools);
  tools.classList.add('wrap');

  root.querySelectorAll('table').forEach(table => {
    if (table.parentElement.classList.contains('table-scroll')) return;
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', vietnamese ? 'Bảng dữ liệu, có thể cuộn ngang' : 'Data table, scroll horizontally if needed');
    table.before(scroll);
    scroll.append(table);
  });
  root.querySelectorAll('pre').forEach(pre => {
    // Existing copy controls remain responsible for their own blocks.
    if (pre.closest('.code-block-wrapper') || !pre.textContent.trim()) return;
    const shell = document.createElement('div');
    shell.className = 'code-shell';
    const bar = document.createElement('div');
    bar.className = 'code-toolbar';
    const copy = document.createElement('button');
    copy.className = 'code-copy';
    copy.type = 'button';
    const label = vietnamese ? 'Sao chép' : 'Copy';
    copy.textContent = label;
    copy.setAttribute('aria-label', vietnamese ? 'Sao chép khối mã' : 'Copy code block');
    copy.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        copy.textContent = vietnamese ? 'Đã sao chép' : 'Copied';
      } catch {
        copy.textContent = vietnamese ? 'Hãy chọn mã để sao chép' : 'Select code to copy';
      }
      setTimeout(() => { copy.textContent = label; }, 2000);
    });
    pre.before(shell);
    bar.append(copy);
    shell.append(bar, pre);
  });
});
