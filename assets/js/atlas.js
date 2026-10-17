/* The original case text stays in HTML; controls progressively enhance it. */
document.addEventListener('DOMContentLoaded',()=>{
  if(document.body.dataset.pageKind==='library'){
    const group=document.createElement('div');group.className='view-switch';group.setAttribute('role','group');group.setAttribute('aria-label','Writeup layout');
    const buttons=['Gallery','List'].map(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>setView(label));group.append(b);return b;});
    function setView(view){document.body.classList.toggle('library-list',view==='List');buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===view)));}
    document.querySelector('.library-summary')?.append(group);setView('Gallery');
  }
  if(document.body.dataset.pageKind!=='article')return;
  const vi=document.documentElement.lang==='vi',root=document.querySelector('.article-card'),nav=document.querySelector('.reading-nav'),tools=document.querySelector('.reading-tools');
  if(!root)return;
  if(nav&&tools){
    tools.classList.remove('wrap');nav.append(tools);
    const focus=document.createElement('button');focus.type='button';focus.textContent=vi?'Tập trung đọc':'Focus view';focus.setAttribute('aria-pressed','false');
    focus.addEventListener('click',()=>{const on=document.body.classList.toggle('reading-focus');focus.setAttribute('aria-pressed',String(on));});tools.prepend(focus);
  }
  root.querySelectorAll('h2[id],h3[id]').forEach(heading=>{
    const link=document.createElement('a');
    link.className='section-permalink';
    link.href='#'+encodeURIComponent(heading.id);
    link.textContent='#';
    link.setAttribute('aria-label',vi?'Liên kết mục này':'Section permalink');
    heading.append(link);
  });
  root.querySelectorAll('img').forEach(img=>{if(img.closest('figure'))return;const figure=document.createElement('figure');figure.className='evidence-shot';const caption=document.createElement('figcaption');caption.textContent=img.alt||(vi?'Ảnh bằng chứng':'Evidence image');img.before(figure);figure.append(caption,img);});
});
