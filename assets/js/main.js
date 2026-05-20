
(function(){
  const canvas=document.getElementById('fx-canvas');
  if(canvas){
    const ctx=canvas.getContext('2d');
    let w,h,dpr,points=[];
    function resize(){
      dpr=Math.min(window.devicePixelRatio||1,2);
      w=canvas.width=Math.floor(innerWidth*dpr);
      h=canvas.height=Math.floor(innerHeight*dpr);
      canvas.style.width=innerWidth+'px';
      canvas.style.height=innerHeight+'px';
      const count=Math.min(110,Math.floor(innerWidth/13));
      points=Array.from({length:count},()=>({
        x:Math.random()*w,y:Math.random()*h,
        vx:(Math.random()-.5)*.22*dpr,vy:(Math.random()-.5)*.22*dpr,
        r:(Math.random()*1.6+0.6)*dpr
      }));
    }
    function tick(){
      ctx.clearRect(0,0,w,h);
      for(const p of points){
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>w)p.vx*=-1;
        if(p.y<0||p.y>h)p.vy*=-1;
      }
      for(let i=0;i<points.length;i++){
        const a=points[i];
        ctx.beginPath();
        ctx.fillStyle='rgba(125,211,252,.42)';
        ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();
        for(let j=i+1;j<points.length;j++){
          const b=points[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<145*dpr){
            ctx.strokeStyle=`rgba(56,189,248,${(1-dist/(145*dpr))*0.13})`;
            ctx.lineWidth=1*dpr;
            ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }
    addEventListener('resize',resize);resize();tick();
  }

  const mt=document.querySelector('.mobile-toggle');
  const panel=document.querySelector('.mobile-panel');
  if(mt && panel){mt.addEventListener('click',()=>panel.classList.toggle('show'));}

  const filters=document.querySelectorAll('[data-filter]');
  const cards=document.querySelectorAll('[data-card]');
  const search=document.querySelector('#searchInput');
  let active='all';
  function apply(){
    const q=(search?.value||'').toLowerCase().trim();
    cards.forEach(c=>{
      const cat=c.dataset.category||'';
      const text=(c.dataset.text+' '+c.textContent).toLowerCase();
      const ok=(active==='all'||cat.includes(active)) && (!q || text.includes(q));
      c.style.display=ok?'':'none';
    });
  }
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    active=btn.dataset.filter;
    apply();
  }));
  if(search)search.addEventListener('input',apply);
})();
