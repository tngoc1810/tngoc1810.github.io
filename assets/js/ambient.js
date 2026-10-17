/* Decorative SOC pipeline. Every event and packet is a simulated illustration. */
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
  background.dataset.renderer='canvas-siem';document.body.append(button);
  const sources=[
    {x:.43,y:.23,label:'ENDPOINT',event:'Sysmon · ProcessCreate',icon:'endpoint'},
    {x:.67,y:.14,label:'CLOUD',event:'Identity · Sign-in',icon:'cloud'},
    {x:.93,y:.28,label:'DNS',event:'Resolver · Query',icon:'dns'},
    {x:.94,y:.63,label:'FIREWALL',event:'Network · Connection',icon:'shield'},
    {x:.49,y:.76,label:'NETWORK',event:'Sensor · Flow',icon:'network'}
  ];
  const core={x:.71,y:.46},analyst={x:.79,y:.81};
  const point=node=>({x:node.x*width,y:node.y*height});
  const scale=()=>Math.max(.72,Math.min(width/1200,height/800,1.18));
  function pathPoints(from,to){
    const a=point(from),b=point(to),bend=(b.x-a.x)*.58;
    return [a,{x:a.x+bend,y:a.y},{x:b.x-bend,y:b.y},b];
  }
  function along(points,t){
    const [a,b,c,d]=points,u=1-t;
    return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};
  }
  function trace(points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);ctx.bezierCurveTo(points[1].x,points[1].y,points[2].x,points[2].y,points[3].x,points[3].y);}
  function hexagon(x,y,r,angle=0){
    ctx.beginPath();
    for(let i=0;i<=6;i++){const a=angle+i*Math.PI/3,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
  }
  function label(text,x,y,size,color='#9bcaff'){
    ctx.font=`500 ${size}px "JetBrains Mono",monospace`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,x,y);
  }
  function icon(kind,x,y,s){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineWidth=1.3;ctx.strokeStyle='#8fc6ff';ctx.beginPath();
    if(kind==='endpoint'){
      ctx.rect(-11,-9,22,15);ctx.moveTo(0,6);ctx.lineTo(0,11);ctx.moveTo(-7,11);ctx.lineTo(7,11);
    }else if(kind==='cloud'){
      ctx.moveTo(-10,7);ctx.bezierCurveTo(-20,6,-17,-7,-9,-5);ctx.bezierCurveTo(-8,-19,12,-17,12,-4);ctx.bezierCurveTo(22,-3,20,8,11,8);ctx.lineTo(-10,7);
    }else if(kind==='shield'){
      ctx.moveTo(0,-13);ctx.lineTo(11,-8);ctx.lineTo(9,6);ctx.lineTo(0,14);ctx.lineTo(-9,6);ctx.lineTo(-11,-8);ctx.closePath();ctx.moveTo(-5,0);ctx.lineTo(-1,4);ctx.lineTo(6,-4);
    }else if(kind==='dns'){
      ctx.arc(0,0,12,0,Math.PI*2);ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.bezierCurveTo(-9,-7,-9,7,0,12);ctx.bezierCurveTo(9,7,9,-7,0,-12);
    }else{
      ctx.rect(-4,-12,8,7);ctx.rect(-14,7,8,7);ctx.rect(6,7,8,7);ctx.moveTo(0,-5);ctx.lineTo(0,2);ctx.moveTo(-10,7);ctx.lineTo(-10,2);ctx.lineTo(10,2);ctx.lineTo(10,7);
    }
    ctx.stroke();ctx.restore();
  }
  function connection(from,to,index,outbound=false){
    const points=pathPoints(from,to),s=scale();
    trace(points);ctx.strokeStyle='#3975bc46';ctx.lineWidth=1;ctx.stroke();
    trace(points);ctx.setLineDash([3,9]);ctx.lineDashOffset=-time*8;ctx.strokeStyle='#78b9ff30';ctx.stroke();ctx.setLineDash([]);
    for(let j=0;j<3;j++){
      const t=(time*(outbound ? .07 : .055)+index*.173+j/3)%1,color=outbound?'#b6ddff':'#54acff';
      ctx.beginPath();
      for(let k=0;k<=8;k++){const p=along(points,Math.max(0,t-k*.006));if(k===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
      ctx.strokeStyle=color+'77';ctx.lineWidth=2*s;ctx.stroke();
      const p=along(points,t);ctx.beginPath();ctx.arc(p.x,p.y,2.5*s,0,Math.PI*2);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10*s;ctx.fill();ctx.shadowBlur=0;
    }
  }
  function draw(){
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const s=scale(),c=point(core),a=point(analyst),mobile=width<600;
    const glow=ctx.createRadialGradient(c.x,c.y,10,c.x,c.y,310*s);glow.addColorStop(0,'#166efb28');glow.addColorStop(1,'#166efb00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=0;i<(mobile?22:48);i++){
      const x=((i*.618033+time*.0015)%1)*width,y=((i*.41421+time*.002)%1)*height;
      ctx.fillStyle=`rgba(107,176,255,${.12+.12*Math.sin(time*.5+i)})`;ctx.fillRect(x,y,i%5===0?2:1,i%5===0?2:1);
    }
    sources.forEach((node,i)=>connection(node,core,i));connection(core,analyst,6,true);
    for(let i=0;i<3;i++){
      const phase=(time*.12+i/3)%1;ctx.beginPath();ctx.arc(c.x,c.y,(75+phase*90)*s,0,Math.PI*2);ctx.strokeStyle=`rgba(82,157,255,${(1-phase)*.18})`;ctx.lineWidth=1;ctx.stroke();
    }
    ctx.beginPath();ctx.arc(c.x,c.y,128*s,-Math.PI*.6+time*.06,Math.PI*.1+time*.06);ctx.strokeStyle='#61b4ff65';ctx.lineWidth=2*s;ctx.stroke();
    hexagon(c.x,c.y,91*s,time*.018);ctx.strokeStyle='#579dff30';ctx.lineWidth=1;ctx.stroke();
    hexagon(c.x,c.y,69*s,Math.PI/6);ctx.fillStyle='#0b1e38e8';ctx.fill();ctx.strokeStyle='#62aaff90';ctx.lineWidth=1.5;ctx.stroke();
    label('SIEM',c.x,c.y-2*s,25*s,'#c1e1ff');label('CORRELATION',c.x,c.y+19*s,8*s,'#82b7ed');
    sources.forEach(node=>{
      const p=point(node);hexagon(p.x,p.y,30*s,Math.PI/6);ctx.fillStyle='#0a1b31ed';ctx.fill();ctx.strokeStyle='#548dcc65';ctx.lineWidth=1;ctx.stroke();icon(node.icon,p.x,p.y,s);
      if(!mobile)label(node.label,p.x,p.y+49*s,10*s,'#8dbce9');
    });
    hexagon(a.x,a.y,32*s,Math.PI/6);ctx.fillStyle='#0b203ced';ctx.fill();ctx.strokeStyle='#679fe777';ctx.stroke();
    ctx.strokeStyle='#a3cfff';ctx.lineWidth=1.4;ctx.strokeRect(a.x-10*s,a.y-11*s,20*s,22*s);
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(a.x-5*s,a.y+(-5+i*5)*s);ctx.lineTo(a.x+5*s,a.y+(-5+i*5)*s);ctx.stroke();}
    if(!mobile){
      label('ANALYST TRIAGE',a.x,a.y+53*s,10*s,'#a8cef4');label('SIMULATED EVENT FLOW',width*.84,Math.max(112,height*.125),9*s,'#709ac4');
      const phase=(time/5)%sources.length,index=Math.floor(phase),fade=Math.sin((phase-index)*Math.PI);
      ctx.globalAlpha=.3+fade*.6;label(sources[index].event,width*.72,height*.94,10*s,'#80b6e9');ctx.globalAlpha=1;
    }
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
