/* Centered Blue Team shield, defense rings and decorative network signals. */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('siem-canvas');
  const ctx = canvas?.getContext('2d', {alpha:true});
  if (!ctx) return;
  const background = canvas.parentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  try { if (localStorage.getItem('portfolio-motion') === 'off') enabled = false; } catch { /* Optional storage. */ }
  let width=0, height=0, time=0, frame=0, lastDraw=0, disposed=false;
  const button=document.createElement('button');
  button.type='button';button.className='ambient-toggle';button.setAttribute('aria-label','Background animation');
  button.setAttribute('aria-controls','portfolio-background');background.id='portfolio-background';
  document.body.append(button);
  // Viewport-relative center stays the same on Home, Writeups and article pages.
  background.dataset.renderer='canvas-blueteam';
  const tau=Math.PI*2;
  function circle(x,y,r,start=0,end=tau){ctx.beginPath();ctx.arc(x,y,r,start,end);}
  function polygon(x,y,r,rotation=0){
    ctx.beginPath();
    for(let i=0;i<=6;i++){
      const a=rotation+i*tau/6,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
  }
  function shield(x,y,size){
    ctx.beginPath();ctx.moveTo(x,y-size*.59);
    ctx.bezierCurveTo(x+size*.18,y-size*.47,x+size*.36,y-size*.43,x+size*.43,y-size*.42);
    ctx.lineTo(x+size*.40,y+size*.05);
    ctx.bezierCurveTo(x+size*.37,y+size*.32,x+size*.13,y+size*.49,x,y+size*.59);
    ctx.bezierCurveTo(x-size*.13,y+size*.49,x-size*.37,y+size*.32,x-size*.40,y+size*.05);
    ctx.lineTo(x-size*.43,y-size*.42);
    ctx.bezierCurveTo(x-size*.36,y-size*.43,x-size*.18,y-size*.47,x,y-size*.59);
    ctx.closePath();
  }
  function draw(){
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const x=width/2,y=height/2,r=Math.min(width*.43,height*.40,370),mobile=width<600;
    const glow=ctx.createRadialGradient(x,y,r*.1,x,y,r*1.65);
    glow.addColorStop(0,'#167aff20');glow.addColorStop(.55,'#1b63eb14');glow.addColorStop(1,'#0c58db00');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    // The lattice and shield are decorative, never real monitoring data.
    for(let i=0;i<(mobile?24:50);i++){
      const px=((i*.618034+time*.001)%1)*width,py=((i*.414214-time*.0015+100)%1)*height;
      ctx.fillStyle='rgba(108,174,255,.22)';ctx.fillRect(px,py,i%7===0?2:1,i%7===0?2:1);
    }
    for(let ring=0;ring<3;ring++){
      const radius=r*(.74+ring*.24);
      circle(x,y,radius);ctx.strokeStyle=ring===1?'#5d9fe93a':'#5d9fe91c';ctx.lineWidth=1;ctx.stroke();
      for(let i=0;i<48;i++){
        const a=i*tau/48,inner=radius-(i%4===0?8:3);
        ctx.beginPath();ctx.moveTo(x+Math.cos(a)*inner,y+Math.sin(a)*inner);ctx.lineTo(x+Math.cos(a)*radius,y+Math.sin(a)*radius);
        ctx.strokeStyle='#79b8ff38';ctx.stroke();
      }
      const angle=time*(ring%2?-.09:.07)+ring*2;
      circle(x,y,radius,angle,angle+.5);ctx.strokeStyle='#8accff90';ctx.lineWidth=2;ctx.stroke();
    }
    polygon(x,y,r*.89,time*.018);ctx.strokeStyle='#71b7ff24';ctx.lineWidth=1;ctx.stroke();
    polygon(x,y,r*1.12,-time*.012+Math.PI/6);ctx.strokeStyle='#71b7ff1c';ctx.stroke();
    // A soft scan sweeps across the defense perimeter without flashing.
    const scan=time*.19;
    for(let j=0;j<18;j++){
      const a=scan-j*.018;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r*1.22,y+Math.sin(a)*r*1.22);
      ctx.strokeStyle=`rgba(73,156,255,${.018*(1-j/18)})`;ctx.lineWidth=4;ctx.stroke();
    }
    for(let i=0;i<8;i++){
      const a=i*tau/8+Math.PI/8,outer=r*(i%2?1.44:1.30),inner=r*.83;
      const sx=x+Math.cos(a)*inner,sy=y+Math.sin(a)*inner;
      const ex=x+Math.cos(a)*outer,ey=y+Math.sin(a)*outer;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.strokeStyle='#69adff28';ctx.lineWidth=1;ctx.stroke();
      polygon(ex,ey,mobile?8:13,Math.PI/6);ctx.fillStyle='#0b1e36';ctx.fill();ctx.strokeStyle='#7abbff70';ctx.stroke();
      const progress=(time*.10+i*.17)%1,px=ex+(sx-ex)*progress,py=ey+(sy-ey)*progress;
      circle(px,py,2);ctx.fillStyle='#8cccff';ctx.shadowBlur=9;ctx.shadowColor='#469eff';ctx.fill();ctx.shadowBlur=0;
    }
    shield(x,y,r*.92);ctx.fillStyle='#0b1d3528';ctx.fill();
    ctx.strokeStyle='#6fb6ff65';ctx.lineWidth=1.8;ctx.shadowColor='#368eff';ctx.shadowBlur=18;ctx.stroke();ctx.shadowBlur=0;
    shield(x,y,r*.82);ctx.strokeStyle='#90ccff28';ctx.lineWidth=1;ctx.stroke();
    // Quiet checkmark: the recognisable Blue Team motif at the exact center.
    ctx.beginPath();ctx.moveTo(x-r*.17,y);ctx.lineTo(x-r*.035,y+r*.14);ctx.lineTo(x+r*.23,y-r*.17);
    ctx.strokeStyle='#8fcbff70';ctx.lineWidth=Math.max(2,r*.014);ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.lineCap='butt';
    const pulse=(time*.09)%1;
    circle(x,y,r*(.42+pulse*.85));ctx.strokeStyle=`rgba(92,170,255,${(1-pulse)*.13})`;ctx.lineWidth=1;ctx.stroke();
  }
  function tick(now){
    frame=0;if(disposed||!enabled||document.hidden)return;
    if(now-lastDraw>=1000/(width<600?18:24)){time+=Math.min((now-lastDraw)/1000,.1);lastDraw=now;draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(frame)cancelAnimationFrame(frame);frame=0;
    const running=enabled&&!document.hidden&&!disposed;
    button.textContent=enabled?'Pause background':'Play background';button.setAttribute('aria-pressed',String(enabled));
    document.body.dataset.motion=background.dataset.motion=running?'running':'paused';
    if(running){lastDraw=performance.now();frame=requestAnimationFrame(tick);}else if(!disposed)draw();
  }
  function resize(){
    width=background.clientWidth;height=background.clientHeight;
    const ratio=Math.min(devicePixelRatio||1,width<600?1:1.25);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();
  }
  button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('portfolio-motion',enabled?'on':'off');}catch{/* Optional storage. */}sync();});
  reduced.addEventListener('change',event=>{if(event.matches){enabled=false;sync();}});
  document.addEventListener('visibilitychange',sync);
  const observer='ResizeObserver'in window?new ResizeObserver(resize):null;
  if(observer)observer.observe(background);else window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;if(frame)cancelAnimationFrame(frame);observer?.disconnect();});
  resize();sync();
});
