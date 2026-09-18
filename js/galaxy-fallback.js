// Phép chiếu phối cảnh bằng Canvas 2D cho thiết bị không mở được WebGL.
// Cùng dữ liệu 3D và giao diện điều khiển; không cần ảnh hay dịch vụ bên ngoài.
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export class Galaxy {
  constructor({ canvas, container, config, anchors, reducedMotion }) {
    Object.assign(this, { canvas, container, config, anchors, reducedMotion });
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('Canvas is unavailable');
    this.paused = reducedMotion; this.visible = true; this.disposed = false;
    this.time = 0; this.morph = 0; this.targetMorph = 0; this.raf = null; this.last = 0;
    this.pointers = new Map(); this.listeners = [];
    this.sprites = config.colors.map(color => {
      const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
      const ctx = sprite.getContext('2d'), glow = ctx.createRadialGradient(32,32,0,32,32,32);
      glow.addColorStop(0, '#fff8ef'); glow.addColorStop(0.08,color);
      glow.addColorStop(0.3, color+'66'); glow.addColorStop(1,color+'00');
      ctx.fillStyle = glow; ctx.fillRect(0,0,64,64); return sprite;
    });
    const listen = (target, name, fn, options) => {
      target.addEventListener(name,fn,options); this.listeners.push(() => target.removeEventListener(name,fn,options));
    };
    listen(canvas,'pointerdown',e => {
      if (e.button !== 0) return;
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); canvas.setPointerCapture(e.pointerId);
    });
    listen(canvas,'pointermove',e => {
      const old = this.pointers.get(e.pointerId); if (!old) return;
      if (this.pointers.size === 2) {
        const other = [...this.pointers.entries()].find(([id]) => id !== e.pointerId)[1];
        const before = Math.hypot(old.x-other.x,old.y-other.y);
        const after = Math.hypot(e.clientX-other.x,e.clientY-other.y);
        if (after > 2) this.distance = clamp(this.distance*before/after,18,46);
      } else {
        this.yaw += (e.clientX-old.x)*0.006;
        this.pitch = clamp(this.pitch+(e.clientY-old.y)*0.004,-0.4,1.4);
      }
      this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); this.requestRender();
    });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) listen(canvas,name,e => this.pointers.delete(e.pointerId));
    listen(canvas,'wheel',e => { e.preventDefault(); this.distance=clamp(this.distance*Math.exp(e.deltaY*0.001),18,46); this.requestRender(); },{passive:false});
    listen(canvas,'keydown',e => {
      if (e.key==='ArrowLeft') this.yaw-=0.12;
      else if (e.key==='ArrowRight') this.yaw+=0.12;
      else if (e.key==='ArrowUp') this.pitch=clamp(this.pitch-0.1,-0.4,1.4);
      else if (e.key==='ArrowDown') this.pitch=clamp(this.pitch+0.1,-0.4,1.4);
      else if (['+','='].includes(e.key)) this.distance=clamp(this.distance*0.9,18,46);
      else if (e.key==='-') this.distance=clamp(this.distance*1.1,18,46);
      else if (e.key.toLowerCase()==='r') this.resetView();
      else return;
      e.preventDefault(); this.requestRender();
    });
    listen(document,'visibilitychange',() => { this.last=0; this.syncLoop(); });
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(entries => { this.visible=entries[0].isIntersecting; this.last=0; this.syncLoop(); });
    this.intersectionObserver.observe(container);
    this.resetView(); this.setQuality('auto');
  }

  setQuality(mode) {
    let seed=this.config.seed;
    const random=() => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
    const scatter=n => Math.pow(random(),2.3)*(random()<0.5?-n:n);
    const detailed=mode==='high' || (mode==='auto' && this.container.clientWidth>760);
    const count=detailed?9000:4800;
    this.points=Array.from({length:this.config.colors.length},()=>[]);
    for (let i=0;i<count;i++) {
      const r=Math.pow(random(),0.68)*this.config.radius;
      const a=i%this.config.arms/this.config.arms*Math.PI*2+r*this.config.spin;
      const t=random()*Math.PI*2, fill=Math.sqrt(random()), spread=0.36*(0.7+r*0.42);
      const point={x:Math.cos(a)*r+scatter(spread),y:scatter(0.3+r*0.034),z:Math.sin(a)*r+scatter(spread),
        hx:16*Math.sin(t)**3*0.44*fill,
        hy:(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)+2)*0.44*fill,
        hz:scatter(1.5)*Math.sqrt(1-fill*fill),r,size:0.45+random()**3*1.6,phase:random()*6.28,glow:i%47===0};
      this.points[Math.min(this.points.length-1,Math.floor(r/this.config.radius*this.points.length))].push(point);
    }
    this.background=Array.from({length:180},()=>({x:random(),y:random(),size:0.4+random()*1.1,phase:random()*6.28}));
    this.resize();
  }

  resize() {
    const rect=this.container.getBoundingClientRect();
    this.width=Math.max(1,rect.width); this.height=Math.max(1,rect.height);
    this.dpr=Math.min(devicePixelRatio||1,1.5);
    this.canvas.width=Math.round(this.width*this.dpr); this.canvas.height=Math.round(this.height*this.dpr);
    this.requestRender();
  }
  resetView() { this.yaw=0; this.pitch=0.55; this.distance=28; this.requestRender(); }
  setPaused(paused) { this.paused=paused; this.last=0; this.requestRender(); }
  setLove(active) { this.targetMorph=active?1:0; if(this.reducedMotion)this.morph=this.targetMorph; this.resetView(); }

  project(x,y,z) {
    const rx=x*this.cy-z*this.sy, rz=x*this.sy+z*this.cy;
    const ry=y*this.cp-rz*this.sp, depth=y*this.sp+rz*this.cp;
    const scale=this.height*1.28/Math.max(4,this.distance-depth);
    const tilt=0.16*(1-this.morph), ct=Math.cos(tilt), st=Math.sin(tilt);
    return {x:this.width/2+(rx*ct+ry*st)*scale,y:this.height/2+(rx*st-ry*ct)*scale,scale};
  }
  frame(now) {
    this.raf=null; if(this.disposed)return;
    if(this.last && now-this.last<31){this.requestRender();return;}
    const dt=Math.min(this.last?(now-this.last)/1000:1/30,0.06); this.last=now;
    if(!this.paused)this.time+=dt;
    this.morph+=(this.targetMorph-this.morph)*(1-Math.exp(-3*dt));
    if(Math.abs(this.targetMorph-this.morph)<0.001)this.morph=this.targetMorph;
    const m=this.morph,ctx=this.ctx;
    this.cy=Math.cos(this.yaw); this.sy=Math.sin(this.yaw);
    this.cp=Math.cos(this.pitch*(1-m)); this.sp=Math.sin(this.pitch*(1-m));
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0); ctx.clearRect(0,0,this.width,this.height);
    ctx.globalCompositeOperation='lighter'; ctx.fillStyle='#dcd3ff';
    for(const p of this.background){ctx.globalAlpha=0.25+0.2*Math.sin(this.time+p.phase);ctx.fillRect(p.x*this.width,p.y*this.height,p.size,p.size);}
    this.points.forEach((points,color) => {
      ctx.fillStyle=m>0.5?'#f8afce':this.config.colors[color];
      for(const p of points) {
        const angle=this.time*0.14/(1+p.r*0.24),c=Math.cos(angle),s=Math.sin(angle);
        const projected=this.project((p.x*c-p.z*s)*(1-m)+p.hx*m,p.y*(1-m)+p.hy*m,(p.x*s+p.z*c)*(1-m)+p.hz*m);
        const size=clamp(p.size*projected.scale/25,0.45,3.2);
        ctx.globalAlpha=0.55+0.3*Math.sin(this.time*1.1+p.phase);
        ctx.fillRect(projected.x,projected.y,size,size);
        if(p.glow){ctx.globalAlpha=0.32;const d=size*13;ctx.drawImage(this.sprites[color],projected.x-d/2,projected.y-d/2,d,d);}
      }
    });
    ctx.globalAlpha=1;
    const taken=[];
    for(const {element,position} of this.anchors) {
      const p=this.project(...position);
      element.hidden=m>0.18 || p.x<35 || p.x>this.width-90 || p.y<40 || p.y>this.height-75 || taken.some(q=>Math.abs(q.x-p.x)<115 && Math.abs(q.y-p.y)<45);
      if(!element.hidden){element.style.transform=`translate3d(${Math.round(p.x-18)}px,${Math.round(p.y-24)}px,0)`;taken.push(p);}
    }
    if(!this.paused || m!==this.targetMorph)this.requestRender();
  }
  requestRender(){if(this.raf!==null || this.disposed || document.hidden || !this.visible)return;this.raf=requestAnimationFrame(now=>this.frame(now));}
  stop(){if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;}
  syncLoop(){if(document.hidden || !this.visible)this.stop();else this.requestRender();}
  dispose(){this.disposed=true;this.stop();this.listeners.forEach(remove=>remove());this.resizeObserver.disconnect();this.intersectionObserver.disconnect();}
}
