/* Decorative globe: local COBE 2.0.1, with an abstract Canvas 2D fallback. */
document.addEventListener('DOMContentLoaded', async () => {
  const hero = document.querySelector('.landing-hero'), stage = document.querySelector('.globe-stage');
  if (!hero || !stage) return;
  const canvas = document.getElementById('globe-canvas'), fallback = document.getElementById('globe-fallback');
  const ctx = fallback.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  try { if (localStorage.getItem('portfolio-motion') === 'off') enabled = false; } catch { /* Optional. */ }
  let visible = true, frame = 0, lastDraw = 0, phi = 4.15, size = 0, globe = null, disposed = false;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'ambient-toggle'; button.setAttribute('aria-label', 'Background animation');
  hero.querySelector('.hero-visual')?.append(button);
  function project(lat, lon) {
    const x = Math.cos(lat) * Math.sin(lon + phi), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon + phi), tilt = -.2;
    return {x:size/2+x*size*.405,y:size/2+(y*Math.cos(tilt)-z*Math.sin(tilt))*size*.405,z:y*Math.sin(tilt)+z*Math.cos(tilt)};
  }
  function fallbackDraw() {
    if (!ctx || !size) return;
    ctx.clearRect(0,0,size,size);
    const gradient=ctx.createRadialGradient(size*.4,size*.35,0,size/2,size/2,size*.48);
    gradient.addColorStop(0,'#246ad149'); gradient.addColorStop(.72,'#0b255947'); gradient.addColorStop(1,'#04112600');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,size,size);
    // This wire sphere is an illustration, never live incident telemetry.
    for (let lat=-80;lat<=80;lat+=10) {
      let started=false; ctx.beginPath();
      for (let lon=0;lon<=360;lon+=3) {
        const p=project(lat*Math.PI/180,lon*Math.PI/180);
        if(p.z<0){started=false;continue;}
        if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle='rgba(78,151,255,.27)';ctx.lineWidth=.75;ctx.stroke();
    }
    for(let lon=0;lon<360;lon+=15){
      let started=false;ctx.beginPath();
      for(let lat=-90;lat<=90;lat+=3){
        const p=project(lat*Math.PI/180,lon*Math.PI/180);
        if(p.z<0){started=false;continue;}
        if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);
      }
      ctx.strokeStyle='rgba(101,177,255,.33)';ctx.stroke();
    }
    for(let i=0;i<180;i++){
      const p=project(Math.asin(1-2*(i+.5)/180),i*2.399963);if(p.z<0)continue;
      ctx.beginPath();ctx.arc(p.x,p.y,1.2+p.z,0,Math.PI*2);ctx.fillStyle=`rgba(157,211,255,${.25+p.z*.65})`;ctx.fill();
    }
  }
  function render(){if(globe)globe.update({phi});else fallbackDraw();}
  function tick(time){
    frame=0;if(disposed||!enabled||!visible||document.hidden)return;
    const interval=innerWidth<600?1000/24:1000/30;
    if(time-lastDraw>=interval){phi+=Math.min((time-lastDraw)/1000,.1)*.16;lastDraw=time;render();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(frame)cancelAnimationFrame(frame);frame=0;
    const running=enabled&&visible&&!document.hidden&&!disposed;
    button.textContent=enabled?'Motion on · pause':'Motion off · play';button.setAttribute('aria-pressed',String(enabled));
    document.body.dataset.motion=running?'running':'paused';
    if(running){lastDraw=performance.now();frame=requestAnimationFrame(tick);}else if(!disposed)render();
  }
  function resize(){
    size=Math.max(1,stage.getBoundingClientRect().width);
    const ratio=Math.min(devicePixelRatio||1,innerWidth<600?1:1.25);
    fallback.width=Math.round(size*ratio);fallback.height=Math.round(size*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);
    if(globe)globe.update({width:size,height:size,devicePixelRatio:ratio});render();
  }
  button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('portfolio-motion',enabled?'on':'off');}catch{/* Optional. */}sync();});
  reduced.addEventListener('change',event=>{if(event.matches){enabled=false;sync();}});
  document.addEventListener('visibilitychange',sync);
  const intersection='IntersectionObserver'in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}):null;
  intersection?.observe(hero);
  const observer='ResizeObserver'in window?new ResizeObserver(resize):null;
  if(observer)observer.observe(stage);else window.addEventListener('resize',resize,{passive:true});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();globe?.destroy();globe=null;stage.dataset.renderer='canvas';render();});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;if(frame)cancelAnimationFrame(frame);observer?.disconnect();intersection?.disconnect();globe?.destroy();});
  resize();sync();
  try{
    const {default:createGlobe}=await import('/assets/vendor/cobe/cobe-2.0.1.js');if(disposed)return;
    const ratio=Math.min(devicePixelRatio||1,innerWidth<600?1:1.25);
    const context={alpha:true,antialias:false,powerPreference:'low-power'};
    const gl=canvas.getContext('webgl2',context)||canvas.getContext('webgl',context);
    if(!gl)throw new Error('WebGL unavailable');
    globe=createGlobe(canvas,{devicePixelRatio:ratio,width:size,height:size,phi,theta:.18,dark:1,diffuse:1.6,scale:1.03,mapSamples:innerWidth<600?8000:14000,mapBrightness:7,mapBaseBrightness:.03,baseColor:[.26,.48,.95],markerColor:[.45,.75,1],glowColor:[.11,.34,.8],markers:[],arcs:[],context});
    // COBE returns a no-op object on context/shader failure instead of throwing.
    if(!gl.getParameter(gl.CURRENT_PROGRAM)){globe.destroy();globe=null;throw new Error('Globe shader unavailable');}
    stage.dataset.renderer='webgl';render();
  }catch{stage.dataset.renderer='canvas';render();}
});
