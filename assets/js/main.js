document.addEventListener('DOMContentLoaded',()=>{setupBg();setupFilters();});
function setupBg(){
  const canvas=document.createElement('canvas'); canvas.id='site-bg'; document.body.prepend(canvas);
  const orb=document.createElement('div'); orb.className='bg-orb'; document.body.appendChild(orb);
  const radar=document.createElement('div'); radar.className='bg-radar'; document.body.appendChild(radar);
  const sweep=document.createElement('div'); sweep.className='bg-sweep'; document.body.appendChild(sweep);
  const ctx=canvas.getContext('2d'); let w,h,ps=[];
  function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight;const n=Math.min(95,Math.max(45,Math.floor(w/18)));ps=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.34,vy:(Math.random()-.5)*.34,r:Math.random()*2+1}));}
  function draw(){ctx.clearRect(0,0,w,h);for(let i=0;i<ps.length;i++){let p=ps[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(124,240,255,.45)';ctx.fill();for(let j=i+1;j<ps.length;j++){let q=ps[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<130){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(86,199,255,${.12-d/1200})`;ctx.lineWidth=1;ctx.stroke();}}}requestAnimationFrame(draw)}
  resize();draw();addEventListener('resize',resize);
}
function setupFilters(){const chips=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-card]')],search=document.querySelector('[data-search]'),empty=document.querySelector('[data-empty]');if(!chips.length||!cards.length)return;let active='all';function apply(){let q=(search?.value||'').toLowerCase().trim(),visible=0;cards.forEach(c=>{let cat=(c.dataset.category||'').toLowerCase(),txt=((c.dataset.text||'')+' '+c.textContent).toLowerCase(),ok=(active==='all'||cat.includes(active))&&(!q||txt.includes(q));c.classList.toggle('hidden',!ok);if(ok)visible++;});if(empty)empty.style.display=visible?'none':'block'}chips.forEach(b=>b.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.filter;apply()}));search?.addEventListener('input',apply);apply();}
