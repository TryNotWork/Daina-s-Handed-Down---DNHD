<template>
  <div 
    ref="containerRef" 
    class="circular-gallery-container"
  />
</template>

<style scoped>
.circular-gallery-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  cursor: -webkit-grab;
  position: relative;
  background: #000;
}

.circular-gallery-container:active {
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

.visibility-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  pointer-events: none;
  opacity: 0;
  z-index: 1000;
}
</style>

<script>
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

function debounce(func, wait = 200) {
  let timeout;
  return function (...args) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  if (!proto) return;
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof proto[key] === 'function') {
      instance[key] = proto[key].bind(instance);
    }
  });
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取2D画布上下文');

  ctx.font = font;
  const textMetrics = ctx.measureText(text);
  const textWidth = Math.ceil(textMetrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor(options) {
    autoBind(this);
    const { gl, plane, text, textColor = '#545050', font = '30px sans-serif' } = options;
    this.gl = gl;
    this.plane = plane;
    this.textColor = textColor;
    this.font = font;
    this.mesh = null;

    this.createMesh(text);
  }

  createMesh(text) {
    const { texture, width, height } = createTextTexture(this.gl, text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });

    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspectRatio = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspectRatio;

    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor(options) {
    autoBind(this);
    const {
      geometry, gl, image, index, length, scene,
      screen, text, viewport, bend, textColor, borderRadius = 0, font, lazyLoad = true,
      container
    } = options;

    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.lazyLoad = lazyLoad;
    this.container = container;

    this.extra = 0;
    this.speed = 0;
    this.isBefore = false;
    this.isAfter = false;
    this.loaded = false;
    this.inView = false;
    this.observer = null;
    this.markerElement = null;

    this.program = null;
    this.plane = null;
    this.title = null;
    this.currentTexture = null;

    this.createShader();
    this.createMesh();
    if (text) {
      this.createTitle(text);
    }
    this.onResize();
    
    if (!this.lazyLoad) {
      setTimeout(() => {
        this.loadImage();
      }, 100);
    } else {
      this.initLazyLoadObserver();
    }
  }

  createShader() {
    const placeholderCanvas = document.createElement('canvas');
    placeholderCanvas.width = 512;
    placeholderCanvas.height = 512;
    const placeholderCtx = placeholderCanvas.getContext('2d');
    
    const gradient = placeholderCtx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    placeholderCtx.fillStyle = gradient;
    placeholderCtx.fillRect(0, 0, 512, 512);
    
    placeholderCtx.fillStyle = '#ffffff';
    placeholderCtx.font = 'bold 24px Arial';
    placeholderCtx.textAlign = 'center';
    placeholderCtx.textBaseline = 'middle';
    placeholderCtx.fillText(`Media ${this.index}`, 256, 256);
    
    this.currentTexture = new Texture(this.gl, { 
      generateMipmaps: false,
      image: placeholderCanvas
    });
    
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        uniform float uLoaded;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 uv = vUv;
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - 0.05), 0.05);
          if(d > 0.0) discard;
          
          gl_FragColor = color;
        }
      `,
      uniforms: {
        tMap: { value: this.currentTexture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uTime: { value: 0 },
        uBorderRadius: { value: this.borderRadius },
        uLoaded: { value: 0 }
      },
      transparent: true
    });
  }

  loadImage() {
    if (this.loaded) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const loadTimeout = setTimeout(() => {
      this.handleImageError();
    }, 10000);
    
    img.onload = () => {
      clearTimeout(loadTimeout);
      
      if (!this.gl || this.gl.isContextLost()) {
        return;
      }
      
      try {
        const newTexture = new Texture(this.gl, {
          generateMipmaps: false,
          image: img
        });
        
        this.program.uniforms.tMap.value = newTexture;
        this.currentTexture = newTexture;
        
        if (this.program && this.program.uniforms) {
          this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
          this.program.uniforms.uLoaded.value = 1;
        }
        
        this.loaded = true;
      } catch (error) {
        this.handleImageError();
      }
      
      this.destroyObserver();
    };
    
    img.onerror = () => {
      clearTimeout(loadTimeout);
      this.handleImageError();
    };
    
    img.src = this.image;
  }

  handleImageError() {
    const errorCanvas = document.createElement('canvas');
    errorCanvas.width = 512;
    errorCanvas.height = 512;
    const errorCtx = errorCanvas.getContext('2d');
    
    errorCtx.fillStyle = '#ff4757';
    errorCtx.fillRect(0, 0, 512, 512);
    errorCtx.fillStyle = '#ffffff';
    errorCtx.font = 'bold 20px Arial';
    errorCtx.textAlign = 'center';
    errorCtx.textBaseline = 'middle';
    errorCtx.fillText('加载失败刷新重试', 256, 256);
    
    try {
      const errorTexture = new Texture(this.gl, {
        generateMipmaps: false,
        image: errorCanvas
      });
      
      this.program.uniforms.tMap.value = errorTexture;
      this.currentTexture = errorTexture;
      this.program.uniforms.uLoaded.value = 1;
      this.loaded = true;
    } catch (error) {
      // 忽略纹理创建错误
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
    this.plane.position.z = 0;
  }

  createTitle(text) {
    if (!text) return;
    
    try {
      this.title = new Title({
        gl: this.gl,
        plane: this.plane,
        text: text,
        textColor: this.textColor,
        font: this.font
      });
    } catch (error) {
      // 忽略标题创建错误
    }
  }

  createVisibilityMarker() {
    if (!this.container || this.markerElement) return;
    
    this.markerElement = document.createElement('div');
    this.markerElement.className = 'visibility-marker';
    this.markerElement.setAttribute('data-media-index', this.index);
    this.container.appendChild(this.markerElement);
  }

  updateMarkerPosition() {
    if (!this.markerElement || !this.plane) return;
    
    try {
      const normalizedX = (this.plane.position.x / this.viewport.width) * this.screen.width + this.screen.width / 2;
      const normalizedY = (this.plane.position.y / this.viewport.height) * this.screen.height + this.screen.height / 2;
      
      this.markerElement.style.left = `${normalizedX}px`;
      this.markerElement.style.top = `${normalizedY}px`;
    } catch (error) {
      // 忽略标题创建错误
    }
  }

  initLazyLoadObserver() {
    if (this.loaded || !this.container) return;
    
    this.createVisibilityMarker();
    
    if ('IntersectionObserver' in window && this.markerElement) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loaded) {
            this.loadImage();
          }
        });
      }, {
        root: null,
        threshold: 0.01,
        rootMargin: '500px'
      });

      this.observer.observe(this.markerElement);
      
      setTimeout(() => {
        if (!this.loaded && this.markerElement) {
          const rect = this.markerElement.getBoundingClientRect();
          const isVisible = (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0 &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right >= 0
          );
          if (isVisible) {
            this.loadImage();
          }
        }
      }, 500);
    } else {
      this.loadImage();
    }
  }

  destroyObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.markerElement && this.markerElement.parentNode) {
      this.markerElement.parentNode.removeChild(this.markerElement);
      this.markerElement = null;
    }
  }

  checkVisibility(scroll) {
    this.updateMarkerPosition();
    
    if (!this.lazyLoad && !this.loaded) {
      const planePosX = this.x - scroll.current - this.extra;
      const planeHalfWidth = this.width / 2;
      const viewportHalfWidth = this.viewport.width / 2;
      
      const isVisible = planePosX + planeHalfWidth > -viewportHalfWidth - this.width && 
                       planePosX - planeHalfWidth < viewportHalfWidth + this.width;
      
      if (isVisible && !this.inView) {
        this.inView = true;
        this.loadImage();
      } else if (!isVisible && this.inView) {
        this.inView = false;
      }
    }
  }

  update(scroll, direction) {
    if (!this.plane) return;
    
    this.plane.position.x = this.x - scroll.current - this.extra;
    const xPos = this.plane.position.x;
    const viewportHalfWidth = this.viewport.width / 2;

    if (this.bend !== 0) {
      const bendAbs = Math.abs(this.bend);
      const radius = (viewportHalfWidth * viewportHalfWidth + bendAbs * bendAbs) / (2 * bendAbs);
      const effectiveX = Math.min(Math.abs(xPos), viewportHalfWidth);
      const arc = radius - Math.sqrt(radius * radius - effectiveX * effectiveX);

      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(xPos) * Math.asin(effectiveX / radius);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(xPos) * Math.asin(effectiveX / radius);
      }
    } else {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    }

    this.speed = scroll.current - scroll.last;
    if (this.program && this.program.uniforms) {
      this.program.uniforms.uTime.value += 0.04;
      this.program.uniforms.uSpeed.value = this.speed;
    }

    const planeHalfWidth = this.plane.scale.x / 2;
    this.isBefore = xPos + planeHalfWidth < -viewportHalfWidth;
    this.isAfter = xPos - planeHalfWidth > viewportHalfWidth;

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    this.updateMarkerPosition();
    
    if (!this.lazyLoad) {
      this.checkVisibility(scroll);
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    if (!this.plane) return;

    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    
    if (this.program && this.program.uniforms) {
      this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    }

    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }

  destroy() {
    this.destroyObserver();
  }
}

class App {
  constructor(container, config) {
    autoBind(this);
    this.container = container;
    this.config = config;
    const { 
      scrollSpeed = 2, 
      scrollEase = 0.05, 
      autoScroll = true, 
      autoScrollSpeed = 0.5,
      lazyLoad = false
    } = config;

    this.scrollSpeed = scrollSpeed;
    this.autoScroll = autoScroll;
    this.autoScrollSpeed = autoScrollSpeed;
    this.lazyLoad = lazyLoad;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck);

    this.medias = [];
    this.mediasImages = [];
    this.raf = 0;
    this.isDown = false;
    this.start = 0;
    this.isAutoScrolling = autoScroll;

    this.renderer = null;
    this.gl = null;
    this.camera = null;
    this.scene = null;
    this.planeGeometry = null;

    this.init();
  }

  init() {
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGeometry();
    this.onResize();
    this.createMedias();
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ 
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    
    const canvas = this.renderer.gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    this.container.appendChild(canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 10,
      widthSegments: 10
    });
  }

  createMedias() {
    const { 
      items = [], 
      bend = 1, 
      textColor = '#ffffff', 
      borderRadius = 0.05, 
      font = 'bold 30px Arial',
      lazyLoad = false
    } = this.config;

    this.mediasImages = items && items.length ? items.concat(items) : [];

    this.medias = this.mediasImages.map((data, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        lazyLoad,
        container: this.container
      });
      
      return media;
    });
  }

  onTouchDown(e) {
    this.isDown = true;
    this.isAutoScrolling = false;
    this.scroll.position = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e) {
    if (!this.isDown) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - currentX) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position || 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    setTimeout(() => {
      this.isAutoScrolling = this.autoScroll;
    }, 1000);
    this.onCheck();
  }

  onWheel(e) {
    this.isAutoScrolling = false;
    const delta = e.deltaY ?? e.wheelDelta ?? e.detail ?? 0;
    this.scroll.target += delta > 0 ? this.scrollSpeed : -this.scrollSpeed;
    this.onCheckDebounce();
    setTimeout(() => {
      this.isAutoScrolling = this.autoScroll;
    }, 1000);
  }

  onCheck() {
    if (!this.medias[0]) return;
    const itemWidth = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / itemWidth);
    const targetPos = itemWidth * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -targetPos : targetPos;
  }

  onResize() {
    if (!this.container) return;
    
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };

    if (!this.screen.width || !this.screen.height) {
      setTimeout(() => this.onResize(), 100);
      return;
    }

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });

    const fovRad = (this.camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    this.viewport = {
      width: viewportHeight * this.camera.aspect,
      height: viewportHeight
    };

    this.medias.forEach(media => media.onResize({
      screen: this.screen,
      viewport: this.viewport
    }));
  }

  update() {
    if (this.isAutoScrolling && !this.isDown) {
      this.scroll.target += this.autoScrollSpeed;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const scrollDirection = this.scroll.current > this.scroll.last ? 'right' : 'left';

    this.medias.forEach(media => media.update(this.scroll, scrollDirection));

    this.renderer.render({ scene: this.scene, camera: this.camera });

    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update);
  }

  addEventListeners() {
    this.boundOnResize = this.onResize;
    this.boundOnWheel = this.onWheel;
    this.boundOnTouchDown = this.onTouchDown;
    this.boundOnTouchMove = this.onTouchMove;
    this.boundOnTouchUp = this.onTouchUp;

    window.addEventListener('resize', this.boundOnResize);

    this.container.addEventListener('wheel', this.boundOnWheel);
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });

    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
    }

    this.medias.forEach(media => {
      if (media.destroy) {
        media.destroy();
      }
    });

    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);

    if (this.container) {
      this.container.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    }

    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default {
  name: 'CircularGallery',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    bend: {
      type: Number,
      default: 3
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    borderRadius: {
      type: Number,
      default: 0.05
    },
    font: {
      type: String,
      default: 'bold 30px Arial'
    },
    scrollSpeed: {
      type: Number,
      default: 2
    },
    scrollEase: {
      type: Number,
      default: 0.05
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    autoScrollSpeed: {
      type: Number,
      default: 0.5
    },
    lazyLoad: {
      type: Boolean,
      default: true
    },
    lazyLoadThreshold: {
      type: Number,
      default: 0.1
    }
  },
  data() {
    return {
      app: null
    };
  },
  mounted() {
    this.initializeGallery();
  },
  beforeUnmount() {
    if (this.app) {
      this.app.destroy();
      this.app = null;
    }
  },
  watch: {
    items: {
      handler: 'reloadApp',
      deep: true
    },
    bend: 'reloadApp',
    textColor: 'reloadApp',
    borderRadius: 'reloadApp',
    font: 'reloadApp',
    scrollSpeed: 'reloadApp',
    scrollEase: 'reloadApp',
    autoScroll: 'reloadApp',
    autoScrollSpeed: 'reloadApp',
    lazyLoad: 'reloadApp',
    lazyLoadThreshold: 'reloadApp'
  },
  methods: {
    initializeGallery() {
      if (this.$refs.containerRef) {
        const galleryItems = this.items.length > 0 
          ? this.items 
          : this.extractImagesFromSlots();
        
        setTimeout(() => {
          this.app = new App(this.$refs.containerRef, {
            items: galleryItems,
            bend: this.bend,
            textColor: this.textColor,
            borderRadius: this.borderRadius,
            font: this.font,
            scrollSpeed: this.scrollSpeed,
            scrollEase: this.scrollEase,
            autoScroll: this.autoScroll,
            autoScrollSpeed: this.autoScrollSpeed,
            lazyLoad: this.lazyLoad,
            lazyLoadThreshold: this.lazyLoadThreshold
          });
        }, 100);
      }
    },

    extractImagesFromSlots() {
      const slotContent = this.$slots.default && this.$slots.default();
      if (!slotContent) return [];

      const images = [];
      
      const extractFromVNodes = (vnodes) => {
        for (const vnode of vnodes) {
          if (vnode.type === 'img' && vnode.props) {
            let src = vnode.props.src || '';
            
            if (vnode.dirs) {
              const lazyDirective = vnode.dirs.find(dir => 
                dir.name === 'lazy' || dir.name === 'Lazy'
              );
              if (lazyDirective && lazyDirective.value) {
                src = lazyDirective.value;
              }
            }
            
            if (vnode.props['data-src']) {
              src = vnode.props['data-src'];
            }
            
            if (src) {
              images.push({
                image: src,
                text: vnode.props.alt || ''
              });
            }
          }
          
          if (vnode.children && Array.isArray(vnode.children)) {
            extractFromVNodes(vnode.children);
          }
        }
      };
      
      extractFromVNodes(slotContent);
      return images;
    },
    
    reloadApp() {
      if (this.app) {
        this.app.destroy();
      }
      this.initializeGallery();
    }
  }
};
</script>