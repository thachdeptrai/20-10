import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

// Mỗi lớp là một draw call. Chuyển động, lấp lánh và morph chạy trên GPU.
const vertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aHeart;
  uniform float uTime;
  uniform float uMorph;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uRotate;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float radius = length(position.xz);
    float angle = uTime * 0.14 / (1.0 + radius * 0.24) * uRotate;
    float s = sin(angle), c = cos(angle);
    vec3 orbit = vec3(position.x*c-position.z*s, position.y, position.x*s+position.z*c);
    vec3 p = mix(orbit, aHeart, uMorph);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(aSize * uSize * uPixelRatio * 90.0 / max(1.0, -viewPosition.z), 1.0, 64.0);
    vColor = mix(color, mix(vec3(1.0,0.3,0.55),vec3(1.0,0.8,0.72),aPhase/6.283),uMorph*0.75);
    vTwinkle = 0.75 + 0.25 * sin(uTime * 1.1 + aPhase);
  }
`;
const fragmentShader = `
  uniform float uOpacity;
  uniform float uDust;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = exp(-d*d*5.0) * 0.43;
    float core = pow(max(0.0,1.0-d),5.0) * 0.8;
    float strength = mix(halo + core, exp(-d*d*3.0)*0.25, uDust);
    gl_FragColor = vec4(vColor, strength * uOpacity * vTwinkle);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function seededRandom(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

export class Galaxy {
  constructor({ canvas, container, config, anchors, reducedMotion, onUnavailable }) {
    this.canvas = canvas; this.container = container; this.config = config;
    this.anchors = anchors; this.reducedMotion = reducedMotion;
    this.onUnavailable = onUnavailable; this.visible = true; this.paused = reducedMotion;
    this.time = 0; this.morph = 0; this.targetMorph = 0; this.raf = null;
    this.lastFrame = 0; this.qualityMode = 'auto'; this.disposed = false;
    this.resources = []; this.point = new THREE.Vector3();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 130);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'default' });
    this.renderer.setClearColor(0x070611, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.debug.onShaderError = (gl, program, vs, fs) => {
      throw new Error(`Shader error: ${gl.getShaderInfoLog(vs)} ${gl.getShaderInfoLog(fs)} ${gl.getProgramInfoLog(program)}`);
    };
    this.group = new THREE.Group(); this.group.rotation.z = 0.16;
    this.scene.add(this.group);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.075;
    this.controls.enablePan = false; this.controls.minDistance = 16; this.controls.maxDistance = 46;
    this.controls.minPolarAngle = 0.22; this.controls.maxPolarAngle = Math.PI * 0.64;
    this.controls.rotateSpeed = 0.42; this.controls.zoomSpeed = 0.65;
    this.controls.addEventListener('change', () => this.requestRender());
    this.controls.addEventListener('start', () => { this.cameraGoal = null; });
    this.onKeyDown = e => this.handleKey(e);
    this.onVisibility = () => { this.lastFrame = 0; this.syncLoop(); };
    this.onLost = e => { e.preventDefault(); this.lost = true; this.stop(); this.onUnavailable('context-lost'); };
    this.onRestored = () => { this.lost = false; this.lastFrame = 0; this.onUnavailable(null); this.syncLoop(); };
    canvas.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('webglcontextlost', this.onLost);
    canvas.addEventListener('webglcontextrestored', this.onRestored);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting; this.lastFrame = 0; this.syncLoop();
    }, { threshold: 0.01 });
    this.intersectionObserver.observe(container);
    this.setQuality('auto'); this.resetView(true); this.resize();
    this.renderer.compile(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.syncLoop();
  }

  makeParticles(count, type, random) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const hearts = new Float32Array(count * 3), sizes = new Float32Array(count), phases = new Float32Array(count);
    const palette = this.config.colors.map(value => new THREE.Color(value));
    const color = new THREE.Color();
    const scatter = amount => Math.pow(random(), 2.3) * (random() < 0.5 ? -1 : 1) * amount;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      if (type === 'background') {
        const a = random() * Math.PI * 2, z = random() * 2 - 1, r = 35 + random() * 24;
        positions[j] = Math.sqrt(1-z*z) * Math.cos(a) * r;
        positions[j+1] = z*r; positions[j+2] = Math.sqrt(1-z*z) * Math.sin(a) * r;
        color.set(random() > 0.7 ? '#bea8ed' : '#c9d4e9');
        sizes[i] = 0.35 + random() * 1.1;
      } else {
        const r = Math.pow(random(), 0.68) * this.config.radius;
        const a = (i % this.config.arms) / this.config.arms * Math.PI * 2 + r * this.config.spin;
        const spread = (type === 'dust' ? 0.68 : 0.36) * (0.7 + r * 0.42);
        positions[j] = Math.cos(a) * r + scatter(spread);
        positions[j+1] = scatter(0.3 + r * (type === 'dust' ? 0.08 : 0.034));
        positions[j+2] = Math.sin(a) * r + scatter(spread);
        const t = Math.min(0.999, r / this.config.radius) * (palette.length - 1);
        color.copy(palette[Math.floor(t)]).lerp(palette[Math.min(palette.length-1, Math.floor(t)+1)], t%1);
        if (random() > 0.9) color.lerp(new THREE.Color('#ffffff'), 0.7);
        sizes[i] = type === 'dust' ? 4 + random()*8 : 0.3 + Math.pow(random(), 3)*1.35;
      }
      color.toArray(colors, j); phases[i] = random() * Math.PI * 2;
      // Trái tim là một đám mây có chiều dày, không phải ảnh nền.
      const angle = random() * Math.PI * 2;
      const fill = Math.sqrt(random());
      hearts[j] = 16 * Math.pow(Math.sin(angle), 3) * 0.44 * fill;
      hearts[j+1] = (13*Math.cos(angle)-5*Math.cos(2*angle)-2*Math.cos(3*angle)-Math.cos(4*angle)+2)*0.44*fill;
      hearts[j+2] = scatter(2.1) * Math.sqrt(1-fill*fill);
      if (type === 'background') hearts.set(positions.subarray(j,j+3),j);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aHeart', new THREE.BufferAttribute(hearts, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, vertexColors: true, transparent: true,
      depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: this.time }, uMorph: { value: 0 }, uPixelRatio: { value: this.pixelRatio },
        uSize: { value: 1 }, uRotate: { value: type === 'background' ? 0.025 : 1 },
        uOpacity: { value: type === 'dust' ? 0.14 : type === 'background' ? 0.85 : 1.05 },
        uDust: { value: type === 'dust' ? 1 : 0 },
      },
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    this.resources.push({ geometry, material, points, type });
    (type === 'background' ? this.scene : this.group).add(points);
  }

  setQuality(mode) {
    this.qualityMode = mode;
    const mobile = matchMedia('(max-width: 760px)').matches;
    const modestDevice = (navigator.hardwareConcurrency || 4) <= 4;
    const name = mode === 'auto' ? (mobile || modestDevice ? 'low' : 'high') : mode;
    this.settings = this.config.quality[name] || this.config.quality.low;
    this.pixelRatio = Math.min(devicePixelRatio || 1, this.settings.pixelRatio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.resources.forEach(({geometry, material, points}) => { points.removeFromParent(); geometry.dispose(); material.dispose(); });
    this.resources = [];
    const random = seededRandom(this.config.seed);
    this.makeParticles(this.settings.stars, 'stars', random);
    this.makeParticles(this.settings.dust, 'dust', random);
    this.makeParticles(this.settings.background, 'background', random);
    this.sampleTime = 0; this.sampleFrames = 0;
    this.resize(); this.requestRender();
  }

  resize() {
    if (this.disposed) return;
    const { width, height } = this.container.getBoundingClientRect();
    this.width = Math.max(1, width); this.height = Math.max(1, height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    this.requestRender();
  }

  resetView(immediate = false) {
    this.controls.target.set(0, 0, 0);
    const goal = new THREE.Vector3(0, this.targetMorph ? 2 : 14, this.targetMorph ? 27 : 24);
    if (immediate || this.reducedMotion) { this.camera.position.copy(goal); this.controls.update(); this.cameraGoal = null; }
    else this.cameraGoal = goal;
    this.requestRender();
  }

  setLove(active) {
    this.targetMorph = active ? 1 : 0;
    if (this.reducedMotion) this.morph = this.targetMorph;
    this.resetView();
    this.requestRender();
  }

  setPaused(paused) { this.paused = paused; this.lastFrame = 0; this.requestRender(); }

  handleKey(event) {
    const spherical = new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target));
    if (event.key === 'ArrowLeft') spherical.theta -= 0.12;
    else if (event.key === 'ArrowRight') spherical.theta += 0.12;
    else if (event.key === 'ArrowUp') spherical.phi -= 0.1;
    else if (event.key === 'ArrowDown') spherical.phi += 0.1;
    else if (['+', '='].includes(event.key)) spherical.radius *= 0.9;
    else if (event.key === '-') spherical.radius *= 1.1;
    else if (event.key.toLowerCase() === 'r') { event.preventDefault(); this.resetView(); return; }
    else return;
    event.preventDefault(); this.cameraGoal = null;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, this.controls.minPolarAngle, this.controls.maxPolarAngle);
    spherical.radius = THREE.MathUtils.clamp(spherical.radius, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.setFromSpherical(spherical).add(this.controls.target);
    this.controls.update(); this.requestRender();
  }

  updateLabels() {
    this.group.updateMatrixWorld();
    const taken = [];
    this.anchors.forEach(({ element, position }) => {
      this.point.fromArray(position).applyMatrix4(this.group.matrixWorld).project(this.camera);
      const x = (this.point.x*0.5+0.5)*this.width, y = (-this.point.y*0.5+0.5)*this.height;
      const hidden = this.morph > 0.18 || this.point.z > 1 || this.point.z < -1 || x < 35 || x > this.width-90 || y < 40 || y > this.height-75 || taken.some(p => Math.abs(p.x-x)<115 && Math.abs(p.y-y)<45);
      element.hidden = hidden;
      if (!hidden) {
        element.style.transform = `translate3d(${Math.round(x-18)}px,${Math.round(y-24)}px,0)`;
        taken.push({x,y});
      }
    });
  }

  requestRender() {
    if (this.raf !== null || this.disposed || this.lost || document.hidden || !this.visible) return;
    this.raf = requestAnimationFrame(now => this.frame(now));
  }
  stop() { if (this.raf !== null) cancelAnimationFrame(this.raf); this.raf = null; }
  syncLoop() { if (document.hidden || !this.visible) this.stop(); else this.requestRender(); }

  frame(now) {
    this.raf = null;
    if (this.disposed || this.lost) return;
    const elapsed = this.lastFrame ? (now-this.lastFrame)/1000 : 1/60;
    if (this.lastFrame && elapsed < 1/this.settings.fps - 0.002) { this.requestRender(); return; }
    this.lastFrame = now;
    const dt = Math.min(elapsed, 0.06);
    if (!this.paused) this.time += dt;
    this.morph = THREE.MathUtils.damp(this.morph, this.targetMorph, 2.5, dt);
    if (Math.abs(this.morph-this.targetMorph) < 0.001) this.morph = this.targetMorph;
    if (this.cameraGoal) {
      this.camera.position.lerp(this.cameraGoal, 1-Math.exp(-3*dt));
      if (this.camera.position.distanceTo(this.cameraGoal) < 0.015) this.cameraGoal = null;
    }
    this.controls.update();
    this.group.rotation.z = 0.16 * (1-this.morph);
    for (const item of this.resources) {
      item.material.uniforms.uTime.value = this.time;
      item.material.uniforms.uMorph.value = item.type === 'background' ? 0 : this.morph;
      if (item.type === 'dust') item.material.uniforms.uOpacity.value = 0.14 * (1-this.morph*0.75);
    }
    try { this.renderer.render(this.scene, this.camera); }
    catch (error) { console.error('Không thể vẽ ngân hà:', error); this.stop(); this.lost = true; this.onUnavailable('render'); return; }
    this.updateLabels();
    // Auto hạ pixel ratio một lần khi GPU chậm; không đo/đọc GPU trong mỗi frame.
    if (!this.paused && this.qualityMode === 'auto' && this.pixelRatio > 1) {
      this.sampleTime += elapsed; this.sampleFrames++;
      if (this.sampleTime > 5) {
        if (this.sampleFrames / this.sampleTime < 27) {
          this.pixelRatio = 1; this.renderer.setPixelRatio(1);
          this.resources.forEach(r => { r.material.uniforms.uPixelRatio.value = 1; }); this.resize();
        }
        this.sampleTime = 0; this.sampleFrames = 0;
      }
    }
    if (!this.paused || this.morph !== this.targetMorph || this.cameraGoal) this.requestRender();
  }

  dispose() {
    this.disposed = true; this.stop(); this.controls.dispose();
    this.resizeObserver.disconnect(); this.intersectionObserver.disconnect();
    this.canvas.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resources.forEach(({geometry,material}) => { geometry.dispose(); material.dispose(); });
    this.renderer.dispose();
  }
}
