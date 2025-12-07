<template>
  <div ref="hostRef">
    <slot></slot>
  </div>
</template>

<script>
const AUTO_ROTATE_SPEED_DEG_PER_MS = 0.008;

export default {
  name: 'DomeGallery',

  props: {
    fit: {
      type: Number,
      default: 0.5
    },
    fitBasis: {
      type: String,
      default: 'auto'
    },
    minRadius: {
      type: Number,
      default: 600
    },
    maxRadius: {
      type: Number,
      default: Infinity
    },
    padFactor: {
      type: Number,
      default: 0.25
    },
    overlayBlurColor: {
      type: String,
      default: '#060010'
    },
    maxVerticalRotationDeg: {
      type: Number,
      default: 5
    },
    dragSensitivity: {
      type: Number,
      default: 20
    },
    enlargeTransitionMs: {
      type: Number,
      default: 300
    },
    segments: {
      type: Number,
      default: 35
    },
    dragDampening: {
      type: Number,
      default: 2
    },
    openedImageWidth: {
      type: String,
      default: '400px'
    },
    openedImageHeight: {
      type: String,
      default: '400px'
    },
    imageBorderRadius: {
      type: String,
      default: '30px'
    },
    openedImageBorderRadius: {
      type: String,
      default: '30px'
    },
    grayscale: {
      type: Boolean,
      default: true
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
      rotation: { x: 0, y: 0 },
      startRotation: { x: 0, y: 0 },
      startPosition: null,
      isDragging: false,
      hasMoved: false,
      isOpening: false,
      focusedElement: null,
      originalTilePosition: null,
      scrollLocked: false,
      openStartedAt: 0,
      lastDragEndAt: 0,

      inertiaAnimationFrame: null,
      autoRotateAnimationFrame: null,
      lastAutoRotateTime: 0,

      resizeObserver: null,
      keydownHandler: null,
      lazyLoadObserver: null,

      shadowRoot: null,
      contentElement: null,
      slotElements: [],
      
      mediaElements: new Map(),
      playingVideos: new Set(),
      loadingStates: new Map(),
      loadedImages: new Set()
    };
  },

  computed: {
    items() {
      return this.buildItems(this.slotElements, this.segments);
    }
  },

  methods: {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    normalizeAngle(degrees) {
      return ((degrees % 360) + 360) % 360;
    },

    wrapAngleSigned(degrees) {
      const angle = (((degrees + 180) % 360) + 360) % 360;
      return angle - 180;
    },

    getDataNumber(element, name, fallback) {
      const attr = element.dataset[name] ?? element.getAttribute(`data-${name}`);
      const number = attr == null ? NaN : parseFloat(attr);
      return Number.isFinite(number) ? number : fallback;
    },

    buildItems(elements, segments) {
      const xColumns = Array.from({ length: segments }, (_, index) => -37 + index * 2);
      const evenYs = [-4, -2, 0, 2, 4];
      const oddYs = [-3, -1, 1, 3, 5];

      const coordinates = xColumns.flatMap((x, columnIndex) => {
        const ys = columnIndex % 2 === 0 ? evenYs : oddYs;
        return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
      });

      const totalSlots = coordinates.length;
      
      if (elements.length === 0) {
        return coordinates.map(coordinate => ({ 
          ...coordinate, 
          element: null, 
          alt: '',
          type: 'img'
        }));
      }

      if (elements.length > totalSlots) {
        console.warn(
          `[DomeGallery] Provided element count (${elements.length}) exceeds available tiles (${totalSlots}). Some elements will not be shown.`
        );
      }

      const usedElements = Array.from({ length: totalSlots }, (_, index) => 
        elements[index % elements.length] || null
      );

      for (let i = 1; i < usedElements.length; i++) {
        if (usedElements[i] === usedElements[i - 1]) {
          for (let j = i + 1; j < usedElements.length; j++) {
            if (usedElements[j] !== usedElements[i]) {
              const temp = usedElements[i];
              usedElements[i] = usedElements[j];
              usedElements[j] = temp;
              break;
            }
          }
        }
      }

      return coordinates.map((coordinate, index) => {
        const element = usedElements[index];
        const alt = element?.getAttribute('alt') || `Item ${index + 1}`;
        const type = element?.tagName?.toLowerCase() || 'img';
        
        const imgUrl = element?.getAttribute('data-img-url') || element?.getAttribute('src');
        const videoUrl = element?.getAttribute('data-video-url');
        
        return {
          ...coordinate,
          element,
          alt,
          type,
          imgUrl,
          videoUrl
        };
      });
    },

    computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
      const unit = 360 / segments / 2;
      const rotateY = unit * (offsetX + (sizeX - 1) / 2);
      const rotateX = unit * (offsetY - (sizeY - 1) / 2);
      return { rotateX, rotateY };
    },

    applyTransform(xDeg, yDeg) {
      const element = this.shadowRoot.querySelector('.dome-gallery-sphere');
      if (element) {
        element.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
      }
    },

    lockScroll() {
      if (this.scrollLocked) return;
      this.scrollLocked = true;
      document.body.classList.add('overflow-hidden');
    },

    unlockScroll() {
      if (!this.scrollLocked) return;
      if (this.contentElement?.getAttribute('data-enlarging') === 'true') return;
      this.scrollLocked = false;
      document.body.classList.remove('overflow-hidden');
    },

    stopInertia() {
      if (this.inertiaAnimationFrame) {
        cancelAnimationFrame(this.inertiaAnimationFrame);
        this.inertiaAnimationFrame = null;
      }
    },

    startInertia(velocityX, velocityY) {
      const MAX_VELOCITY = 1.4;
      let vx = this.clamp(velocityX, -MAX_VELOCITY, MAX_VELOCITY) * 80;
      let vy = this.clamp(velocityY, -MAX_VELOCITY, MAX_VELOCITY) * 80;
      let frames = 0;
      const damping = this.clamp(this.dragDampening ?? 0.6, 0, 1);
      const frictionMultiplier = 0.94 + 0.055 * damping;
      const stopThreshold = 0.015 - 0.01 * damping;
      const maxFrames = Math.round(90 + 270 * damping);

      const step = () => {
        vx *= frictionMultiplier;
        vy *= frictionMultiplier;
        if (Math.abs(vx) < stopThreshold && Math.abs(vy) < stopThreshold) {
          this.inertiaAnimationFrame = null;
          return;
        }
        if (++frames > maxFrames) {
          this.inertiaAnimationFrame = null;
          return;
        }
        const nextX = this.clamp(this.rotation.x - vy / 200, -this.maxVerticalRotationDeg, this.maxVerticalRotationDeg);
        const nextY = this.wrapAngleSigned(this.rotation.y + vx / 200);
        this.rotation = { x: nextX, y: nextY };
        this.applyTransform(nextX, nextY);
        this.inertiaAnimationFrame = requestAnimationFrame(step);
      };

      this.stopInertia();
      this.inertiaAnimationFrame = requestAnimationFrame(step);
    },

    stopAutoRotate() {
      if (this.autoRotateAnimationFrame) {
        cancelAnimationFrame(this.autoRotateAnimationFrame);
        this.autoRotateAnimationFrame = null;
      }
      this.lastAutoRotateTime = 0;
    },

    autoRotateStep(now) {
      if (!this.lastAutoRotateTime) {
        this.lastAutoRotateTime = now;
      }
      const deltaMs = now - this.lastAutoRotateTime;
      this.lastAutoRotateTime = now;

      const canSpin =
        !this.isDragging &&
        !this.isOpening &&
        !this.focusedElement &&
        this.inertiaAnimationFrame === null;

      if (canSpin && deltaMs > 0) {
        const nextY = this.wrapAngleSigned(this.rotation.y + deltaMs * AUTO_ROTATE_SPEED_DEG_PER_MS);
        if (nextY !== this.rotation.y) {
          this.rotation = { x: this.rotation.x, y: nextY };
        }
      }

      this.autoRotateAnimationFrame = requestAnimationFrame(this.autoRotateStep);
    },

    startAutoRotate() {
      if (this.autoRotateAnimationFrame !== null) return;
      this.lastAutoRotateTime = 0;
      this.autoRotateAnimationFrame = requestAnimationFrame(this.autoRotateStep);
    },

    // 修复：移除 IntersectionObserver 的 root 配置
    initLazyLoad() {
      if (!this.lazyLoad) return;
      
      const lazyImages = this.shadowRoot.querySelectorAll('.lazy-image');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              imageObserver.unobserve(img);
            }
          });
        }, {
          // 移除 root 选项，使用默认的文档视口
          threshold: this.lazyLoadThreshold
        });

        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });

        this.lazyLoadObserver = imageObserver;
      } else {
        // 不支持 IntersectionObserver 的浏览器，直接加载所有图片
        lazyImages.forEach(img => {
          this.loadImage(img);
        });
      }
    },

    loadImage(imgElement) {
      const src = imgElement.dataset.src;
      if (!src) return;

      // 如果图片已经加载过，直接使用
      if (this.loadedImages.has(src)) {
        imgElement.src = src;
        imgElement.classList.remove('lazy-image');
        imgElement.classList.add('loaded');
        imgElement.style.opacity = '1';
        return;
      }

      // 显示加载状态
      imgElement.style.opacity = '0.3';
      
      const tempImg = new Image();
      tempImg.onload = () => {
        imgElement.src = src;
        imgElement.classList.remove('lazy-image');
        imgElement.classList.add('loaded');
        imgElement.style.opacity = '1';
        this.loadedImages.add(src);
      };
      
      tempImg.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        imgElement.style.opacity = '1';
        imgElement.classList.remove('lazy-image');
        imgElement.classList.add('error');
      };
      
      tempImg.src = src;
    },

    onDragStart(event) {
      if (this.focusedElement) return;
      this.stopInertia();

      this.isDragging = true;
      this.hasMoved = false;
      this.startRotation = { ...this.rotation };

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      this.startPosition = { x: clientX, y: clientY };
    },

    onDragMove(event) {
      if (this.focusedElement || !this.isDragging || !this.startPosition) return;

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      const dxTotal = clientX - this.startPosition.x;
      const dyTotal = clientY - this.startPosition.y;

      if (!this.hasMoved) {
        const distanceSquared = dxTotal * dxTotal + dyTotal * dyTotal;
        if (distanceSquared > 16) this.hasMoved = true;
      }

      const nextX = this.clamp(
        this.startRotation.x - dyTotal / this.dragSensitivity,
        -this.maxVerticalRotationDeg,
        this.maxVerticalRotationDeg
      );
      const nextY = this.wrapAngleSigned(this.startRotation.y + dxTotal / this.dragSensitivity);

      if (this.rotation.x !== nextX || this.rotation.y !== nextY) {
        this.rotation = { x: nextX, y: nextY };
        this.applyTransform(nextX, nextY);
      }
    },

    onDragEnd(event) {
      if (!this.isDragging) return;

      this.isDragging = false;

      if (this.hasMoved && this.startPosition) {
        const clientX = 'touches' in event ? event.changedTouches?.[0]?.clientX ?? 0 : event.clientX;
        const clientY = 'touches' in event ? event.changedTouches?.[0]?.clientY ?? 0 : event.clientY;

        const dxTotal = clientX - this.startPosition.x;
        const dyTotal = clientY - this.startPosition.y;

        const velocityX = this.clamp((dxTotal / this.dragSensitivity) * 0.02, -1.2, 1.2);
        const velocityY = this.clamp((dyTotal / this.dragSensitivity) * 0.02, -1.2, 1.2);

        if (Math.abs(velocityX) > 0.005 || Math.abs(velocityY) > 0.005) {
          this.startInertia(velocityX, velocityY);
        }

        this.lastDragEndAt = performance.now();
      }

      this.hasMoved = false;
    },

    playVideo(videoElement) {
      if (!videoElement) return;
      
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Video play failed:', error);
        });
      }
      
      this.playingVideos.add(videoElement);
    },

    pauseVideo(videoElement) {
      if (!videoElement) return;
      
      videoElement.pause();
      this.playingVideos.delete(videoElement);
    },

    setLoadingState(overlay, isLoading) {
      this.loadingStates.set(overlay, isLoading);
      
      const loadingElement = overlay.querySelector('.video-loading, .image-loading');
      if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
      }
      
      const mediaElement = overlay.querySelector('video, img');
      if (mediaElement) {
        mediaElement.style.opacity = isLoading ? '0.3' : '1';
      }
    },

    openItemFromElement(element) {
      if (this.isOpening) return;
      this.isOpening = true;
      this.openStartedAt = performance.now();
      this.lockScroll();

      const parent = element.parentElement;
      if (!parent) return;

      this.focusedElement = element;
      element.setAttribute('data-focused', 'true');

      const offsetX = this.getDataNumber(parent, 'offsetX', 0);
      const offsetY = this.getDataNumber(parent, 'offsetY', 0);
      const sizeX = this.getDataNumber(parent, 'sizeX', 2);
      const sizeY = this.getDataNumber(parent, 'sizeY', 2);

      const parentRotation = this.computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, this.segments);
      const parentY = this.normalizeAngle(parentRotation.rotateY);
      const globalY = this.normalizeAngle(this.rotation.y);
      let rotationY = -(parentY + globalY) % 360;
      if (rotationY < -180) rotationY += 360;
      const rotationX = -parentRotation.rotateX - this.rotation.x;

      parent.style.setProperty('--rot-y-delta', `${rotationY}deg`);
      parent.style.setProperty('--rot-x-delta', `${rotationX}deg`);

      const referenceDiv = document.createElement('div');
      referenceDiv.className = 'item__image item__image--reference';
      referenceDiv.style.opacity = '0';
      referenceDiv.style.transform = `rotateX(${-parentRotation.rotateX}deg) rotateY(${-parentRotation.rotateY}deg)`;
      parent.appendChild(referenceDiv);

      const tileRect = referenceDiv.getBoundingClientRect();
      const mainRect = this.shadowRoot.querySelector('.dome-gallery-main')?.getBoundingClientRect();
      const frameRect = this.shadowRoot.querySelector('.dome-gallery-viewer-frame')?.getBoundingClientRect();

      if (!mainRect || !frameRect) return;

      this.originalTilePosition = {
        left: tileRect.left,
        top: tileRect.top,
        width: tileRect.width,
        height: tileRect.height
      };

      element.style.visibility = 'hidden';
      element.style.zIndex = '0';

      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      overlay.style.position = 'absolute';
      overlay.style.left = `${frameRect.left - mainRect.left}px`;
      overlay.style.top = `${frameRect.top - mainRect.top}px`;
      overlay.style.width = `${frameRect.width}px`;
      overlay.style.height = `${frameRect.height}px`;
      overlay.style.opacity = '0';
      overlay.style.zIndex = '30';
      overlay.style.willChange = 'transform, opacity';
      overlay.style.transformOrigin = 'top left';
      overlay.style.transition = `transform ${this.enlargeTransitionMs}ms ease, opacity ${this.enlargeTransitionMs}ms ease`;

      const itemIndex = Array.from(parent.parentElement.children).indexOf(parent);
      const currentItem = this.items[itemIndex];
      
      let enlargedElement;
      
      if (currentItem.videoUrl) {
        enlargedElement = document.createElement('video');
        enlargedElement.src = currentItem.videoUrl;
        enlargedElement.setAttribute('loop', '');
        enlargedElement.setAttribute('muted', '');
        enlargedElement.setAttribute('playsinline', '');
        enlargedElement.setAttribute('autoplay', '');
        enlargedElement.style.cssText = 'width:100%;height:100%;object-fit:cover;opacity:0.3;';
        
        const loadingElement = document.createElement('div');
        loadingElement.className = 'video-loading';
        loadingElement.innerHTML = '加载中...';
        loadingElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 16px;
          z-index: 2;
        `;
        
        overlay.appendChild(loadingElement);
        overlay.appendChild(enlargedElement);
        
        this.setLoadingState(overlay, true);
        
        enlargedElement.addEventListener('loadeddata', () => {
          this.setLoadingState(overlay, false);
        });
        
        enlargedElement.addEventListener('canplay', () => {
          this.setLoadingState(overlay, false);
        });
        
        enlargedElement.addEventListener('error', (e) => {
          console.error('Video loading error:', e);
          loadingElement.innerHTML = '加载失败';
          this.setLoadingState(overlay, false);
        });
        
        this.mediaElements.set(overlay, enlargedElement);
        
        enlargedElement.load();
        
        setTimeout(() => {
          if (!this.loadingStates.get(overlay)) {
            this.playVideo(enlargedElement);
          }
        }, this.enlargeTransitionMs);
        
      } else if (currentItem.imgUrl) {
        // 图片元素 - 添加图片加载状态
        enlargedElement = document.createElement('img');
        
        // 检查是否已经懒加载过
        if (this.loadedImages.has(currentItem.imgUrl)) {
          enlargedElement.src = currentItem.imgUrl;
          enlargedElement.style.opacity = '1';
        } else {
          enlargedElement.src = currentItem.imgUrl;
          enlargedElement.style.opacity = '0.3';
          
          // 图片加载处理
          const loadingElement = document.createElement('div');
          loadingElement.className = 'image-loading';
          loadingElement.innerHTML = '加载中...';
          loadingElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 16px;
            z-index: 2;
          `;
          
          overlay.appendChild(loadingElement);
          this.setLoadingState(overlay, true);
          
          enlargedElement.addEventListener('load', () => {
            this.setLoadingState(overlay, false);
            this.loadedImages.add(currentItem.imgUrl);
          });
          
          enlargedElement.addEventListener('error', (e) => {
            console.error('Image loading error:', e);
            if (loadingElement) {
              loadingElement.innerHTML = '加载失败';
            }
            this.setLoadingState(overlay, false);
          });
        }
        
        enlargedElement.alt = currentItem.alt;
        enlargedElement.style.cssText += 'width:100%;height:100%;object-fit:cover;';
        overlay.appendChild(enlargedElement);
      }
      
      if (enlargedElement) {
        overlay.appendChild(enlargedElement);
      }

      this.shadowRoot.querySelector('.dome-gallery-viewer')?.appendChild(overlay);

      const translateX = tileRect.left - frameRect.left;
      const translateY = tileRect.top - frameRect.top;
      const scaleX = tileRect.width / frameRect.width;
      const scaleY = tileRect.height / frameRect.height;
      overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(0px, 0px) scale(1,1)';
        this.contentElement?.setAttribute('data-enlarging', 'true');
        const scrim = this.shadowRoot.querySelector('.dome-gallery-viewer-scrim');
        scrim?.classList.add('active');
      });

      if (this.openedImageWidth || this.openedImageHeight) {
        const onTransitionEnd = (transitionEvent) => {
          if (transitionEvent.propertyName !== 'transform') return;
          overlay.removeEventListener('transitionend', onTransitionEnd);
          overlay.style.transition = 'none';
          
          const tempWidth = this.openedImageWidth || `${frameRect.width}px`;
          const tempHeight = this.openedImageHeight || `${frameRect.height}px`;
          
          overlay.style.left = '50%';
          overlay.style.top = '50%';
          overlay.style.transform = 'translate(-50%, -50%)';
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
          
          void overlay.offsetWidth;
          overlay.style.transition = `width ${this.enlargeTransitionMs}ms ease, height ${this.enlargeTransitionMs}ms ease`;
        };
        overlay.addEventListener('transitionend', onTransitionEnd);
      }
    },

    closeEnlargedImage() {
      if (performance.now() - this.openStartedAt < 250) return;
      const element = this.focusedElement;
      if (!element) return;
      const parent = element.parentElement;
      const overlay = this.shadowRoot.querySelector('.enlarge');
      if (!overlay || !parent) return;
      
      this.loadingStates.delete(overlay);
      
      const mediaElement = this.mediaElements.get(overlay);
      if (mediaElement && mediaElement.tagName.toLowerCase() === 'video') {
        this.pauseVideo(mediaElement);
        this.mediaElements.delete(overlay);
      }
      
      const referenceDiv = parent.querySelector('.item__image--reference');
      const originalPosition = this.originalTilePosition;

      if (!originalPosition) {
        overlay.remove();
        if (referenceDiv) referenceDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        element.style.visibility = '';
        element.style.zIndex = '0';
        this.focusedElement = null;
        this.contentElement?.removeAttribute('data-enlarging');
        const scrim = this.shadowRoot.querySelector('.dome-gallery-viewer-scrim');
        scrim?.classList.remove('active');
        this.isOpening = false;
        this.unlockScroll();
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = this.contentElement?.getBoundingClientRect();
      if (!rootRect) return;

      const originalPositionRelativeToRoot = {
        left: originalPosition.left - rootRect.left,
        top: originalPosition.top - rootRect.top,
        width: originalPosition.width,
        height: originalPosition.height
      };

      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };

      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${this.enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

      const originalMedia = overlay.querySelector('video, img');
      if (originalMedia) {
        const media = originalMedia.cloneNode(true);
        media.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        animatingOverlay.appendChild(media);
      }

      overlay.remove();
      this.contentElement?.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = `${originalPositionRelativeToRoot.left}px`;
        animatingOverlay.style.top = `${originalPositionRelativeToRoot.top}px`;
        animatingOverlay.style.width = `${originalPositionRelativeToRoot.width}px`;
        animatingOverlay.style.height = `${originalPositionRelativeToRoot.height}px`;
        animatingOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animatingOverlay.remove();
        this.originalTilePosition = null;
        if (referenceDiv) referenceDiv.remove();
        parent.style.transition = 'none';
        element.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        requestAnimationFrame(() => {
          element.style.visibility = '';
          element.style.opacity = '0';
          element.style.zIndex = '0';
          this.focusedElement = null;
          this.contentElement?.removeAttribute('data-enlarging');
          const scrim = this.shadowRoot.querySelector('.dome-gallery-viewer-scrim');
          scrim?.classList.remove('active');
          requestAnimationFrame(() => {
            parent.style.transition = '';
            element.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              element.style.opacity = '1';
              setTimeout(() => {
                element.style.transition = '';
                element.style.opacity = '';
                this.isOpening = false;
                this.unlockScroll();
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
    },

    onTileClick(event) {
      if (this.isDragging) return;
      if (performance.now() - this.lastDragEndAt < 80) return;
      if (this.isOpening) return;
      this.openItemFromElement(event.currentTarget);
    },

    onTilePointerUp(event) {
      if (event.pointerType !== 'touch') return;
      if (this.isDragging) return;
      if (performance.now() - this.lastDragEndAt < 80) return;
      if (this.isOpening) return;
      this.openItemFromElement(event.currentTarget);
    },

    onTileTouchEnd(event) {
      if (this.isDragging) return;
      if (performance.now() - this.lastDragEndAt < 80) return;
      if (this.isOpening) return;
      this.openItemFromElement(event.currentTarget);
    },

    extractSlotElements() {
      const slot = this.$refs.hostRef;
      if (!slot) return [];

      const elements = [];
      
      for (const child of slot.children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const clonedElement = child.cloneNode(true);
          elements.push(clonedElement);
        }
      }

      while (slot.firstChild) {
        slot.removeChild(slot.firstChild);
      }

      return elements;
    },

    createShadowDOM() {
      const host = this.$refs.hostRef;
      this.shadowRoot = host.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = this.getStyles();
      this.shadowRoot.appendChild(style);

      this.contentElement = document.createElement('div');
      this.contentElement.className = 'dome-gallery-root';
      this.contentElement.innerHTML = this.getTemplate();
      this.shadowRoot.appendChild(this.contentElement);

      this.setStyleVariables();
    },

    getTemplate() {
      return `
    <main class="dome-gallery-main">
      <div class="dome-gallery-perspective">
        <div class="dome-gallery-sphere">
          ${this.items.map((item) => `
            <div class="dome-gallery-segment"
              data-offset-x="${item.x}"
              data-offset-y="${item.y}"
              data-size-x="${item.sizeX}"
              data-size-y="${item.sizeY}"
              style="
                --offset-x: ${item.x};
                --offset-y: ${item.y};
                --item-size-x: ${item.sizeX};
                --item-size-y: ${item.sizeY};
                width: calc(var(--item-width) * var(--item-size-x));
                height: calc(var(--item-height) * var(--item-size-y));
                transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) translateZ(var(--radius))
              ">
              <div class="dome-gallery-image-wrapper" role="button" tabindex="0" aria-label="${item.alt}" style="border-radius: var(--tile-radius, 12px)">
                ${item.imgUrl ? 
                  this.lazyLoad ? 
                    `<img class="lazy-image" data-src="${item.imgUrl}" alt="${item.alt}" style="width:100%;height:100%;object-fit:cover;">` 
                    : `<img src="${item.imgUrl}" alt="${item.alt}" style="width:100%;height:100%;object-fit:cover;">`
                  : ''
                }
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dome-gallery-overlay mask"></div>

      <div class="dome-gallery-viewer">
        <div class="dome-gallery-viewer-scrim"></div>
        <div class="dome-gallery-viewer-frame" style="border-radius: var(--enlarge-radius, 32px)"></div>
      </div>
    </main>
  `;
    },

    getStyles() {
      return `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .dome-gallery-root {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .dome-gallery-main {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      background-color: transparent;
    }

    .dome-gallery-perspective {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      contain: layout paint size;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }

    .dome-gallery-sphere {
      will-change: transform;
      transform-style: preserve-3d;
      transform: translateZ(calc(var(--radius) * -1));
    }

    .dome-gallery-segment {
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transition: transform 300ms;
      transform-style: preserve-3d;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
    }

    .dome-gallery-image-wrapper {
      border: 2px solid #fff;
      position: absolute;
      display: block;
      top: 10px;
      right: 10px;
      bottom: 10px;
      left: 10px;
      background-color: transparent;
      overflow: hidden;
      transition: transform 300ms;
      cursor: pointer;
      pointer-events: auto;
      transform: translateZ(0);
      transform-style: preserve-3d;
      backface-visibility: hidden;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      -webkit-transform: translateZ(0);
    }

    .dome-gallery-image-wrapper:focus {
      outline: none;
    }

    .dome-gallery-image-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      backface-visibility: hidden;
      filter: var(--image-filter, none);
      transition: opacity 0.3s ease;
      background: #000;
    }

    .dome-gallery-image-wrapper img.lazy-image {
      opacity: 0.3;
      background: #f0f0f0;
    }

    .dome-gallery-image-wrapper img.loaded {
      opacity: 1;
    }

    .dome-gallery-image-wrapper img.error {
      opacity: 1;
      background: #ffebee;
    }

    .dome-gallery-overlay {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      margin: auto;
      pointer-events: none;
    }

    .dome-gallery-overlay.mask {
      z-index: 3;
      backdrop-filter: blur(3px);
      -webkit-mask-image: radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, #060010) 90%);
      mask-image: radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, #060010) 90%);
    }

    .dome-gallery-viewer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 20;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--viewer-pad);
    }

    .dome-gallery-viewer-scrim {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10;
      pointer-events: none;
      opacity: 0;
      transition: opacity 500ms ease-linear;
      backdrop-filter: blur(3px);
      background: rgba(0, 0, 0, 0.5);
    }

    .dome-gallery-viewer-scrim.active {
      opacity: 1;
      pointer-events: auto;
    }

    .dome-gallery-viewer-frame {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
    }

    @media (max-aspect-ratio: 1/1) {
      .dome-gallery-viewer-frame {
        height: auto;
        width: 100%;
      }
    }

    .enlarge {
      border: 2px solid #fff;
      position: absolute;
      z-index: 30;
      will-change: transform, opacity;
      transform-origin: top left;
      border-radius: var(--enlarge-radius, 32px);
      overflow: hidden;
      background: #000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .enlarge video,
    .enlarge img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center !important;
      transition: opacity 0.3s ease;
    }

    .video-loading,
    .image-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 16px;
      z-index: 2;
    }

    .enlarge-closing {
      position: absolute;
      z-index: 9999;
      border-radius: var(--enlarge-radius, 32px);
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      transition: all var(--enlarge-transition-ms, 300ms) ease-out;
      pointer-events: none;
      margin: 0;
      transform: none;
      background: #000;
    }

    .item__image--reference {
      opacity: 0;
      pointer-events: none;
    }
  `;
    },

    setStyleVariables() {
      if (!this.contentElement) return;

      this.contentElement.style.setProperty('--segments-x', this.segments);
      this.contentElement.style.setProperty('--segments-y', this.segments);
      this.contentElement.style.setProperty('--overlay-blur-color', this.overlayBlurColor);
      this.contentElement.style.setProperty('--tile-radius', this.imageBorderRadius);
      this.contentElement.style.setProperty('--enlarge-radius', this.openedImageBorderRadius);
      this.contentElement.style.setProperty('--image-filter', this.grayscale ? 'grayscale(1)' : 'none');
      this.contentElement.style.setProperty('--radius', '520px');
      this.contentElement.style.setProperty('--viewer-pad', '72px');
      this.contentElement.style.setProperty('--circ', 'calc(var(--radius) * 3.14)');
      this.contentElement.style.setProperty('--rot-y', 'calc((360deg / var(--segments-x)) / 2)');
      this.contentElement.style.setProperty('--rot-x', 'calc((360deg / var(--segments-y)) / 2)');
      this.contentElement.style.setProperty('--item-width', 'calc(var(--circ) / var(--segments-x))');
      this.contentElement.style.setProperty('--item-height', 'calc(var(--circ) / var(--segments-y))');
    },

    setupEventListeners() {
      const main = this.shadowRoot.querySelector('.dome-gallery-main');
      const scrim = this.shadowRoot.querySelector('.dome-gallery-viewer-scrim');

      if (main) {
        main.addEventListener('mousedown', this.onDragStart, { passive: true });
        main.addEventListener('touchstart', this.onDragStart, { passive: true });
      }

      window.addEventListener('mousemove', this.onDragMove, { passive: true });
      window.addEventListener('touchmove', this.onDragMove, { passive: true });
      window.addEventListener('mouseup', this.onDragEnd);
      window.addEventListener('touchend', this.onDragEnd);

      if (scrim) {
        scrim.addEventListener('click', this.closeEnlargedImage);
      }

      const imageWrappers = this.shadowRoot.querySelectorAll('.dome-gallery-image-wrapper');
      imageWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', this.onTileClick);
        wrapper.addEventListener('pointerup', this.onTilePointerUp);
        wrapper.addEventListener('touchend', this.onTileTouchEnd);
      });

      this.keydownHandler = (event) => {
        if (event.key === 'Escape') {
          this.closeEnlargedImage();
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    },

    initMedia() {
      const images = this.shadowRoot.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('error', (event) => {
          console.error('Image loading error:', event);
        });
      });
    }
  },

  mounted() {
    this.slotElements = this.extractSlotElements();
    
    this.createShadowDOM();
    this.applyTransform(this.rotation.x, this.rotation.y);
    this.startAutoRotate();
    this.setupEventListeners();
    this.initMedia();
    
    // 初始化图片懒加载
    this.initLazyLoad();

    const host = this.$refs.hostRef;
    this.resizeObserver = new ResizeObserver(entries => {
      const contentRect = entries[0].contentRect;
      const width = Math.max(1, contentRect.width);
      const height = Math.max(1, contentRect.height);
      const minDimension = Math.min(width, height);
      const maxDimension = Math.max(width, height);
      const aspectRatio = width / height;

      let basis;
      switch (this.fitBasis) {
        case 'min':
          basis = minDimension;
          break;
        case 'max':
          basis = maxDimension;
          break;
        case 'width':
          basis = width;
          break;
        case 'height':
          basis = height;
          break;
        default:
          basis = aspectRatio >= 1.3 ? width : minDimension;
      }

      let radius = basis * this.fit;
      const heightGuard = height * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = this.clamp(radius, this.minRadius, this.maxRadius);

      const viewerPadding = Math.max(8, Math.round(minDimension * this.padFactor));
      const roundedRadius = Math.round(radius);

      this.contentElement.style.setProperty('--radius', `${roundedRadius}px`);
      this.contentElement.style.setProperty('--viewer-pad', `${viewerPadding}px`);

      const overlay = this.shadowRoot.querySelector('.enlarge');
      if (overlay) {
        const frameRect = this.shadowRoot.querySelector('.dome-gallery-viewer-frame')?.getBoundingClientRect();
        const mainRect = this.shadowRoot.querySelector('.dome-gallery-main')?.getBoundingClientRect();

        if (frameRect && mainRect) {
          if (this.openedImageWidth && this.openedImageHeight) {
            overlay.style.left = '50%';
            overlay.style.top = '50%';
            overlay.style.transform = 'translate(-50%, -50%)';
            overlay.style.width = this.openedImageWidth;
            overlay.style.height = this.openedImageHeight;
          } else {
            overlay.style.left = `${frameRect.left - mainRect.left}px`;
            overlay.style.top = `${frameRect.top - mainRect.top}px`;
            overlay.style.width = "100%";
            overlay.style.height = "100%";
          }
        }
      }
    });

    this.resizeObserver.observe(host);
  },

  beforeUnmount() {
    this.stopInertia();
    this.stopAutoRotate();

    this.playingVideos.forEach(video => {
      this.pauseVideo(video);
    });
    this.playingVideos.clear();
    this.mediaElements.clear();
    this.loadingStates.clear();
    this.loadedImages.clear();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
      this.lazyLoadObserver = null;
    }

    const main = this.shadowRoot?.querySelector('.dome-gallery-main');
    const scrim = this.shadowRoot?.querySelector('.dome-gallery-viewer-scrim');

    if (main) {
      main.removeEventListener('mousedown', this.onDragStart);
      main.removeEventListener('touchstart', this.onDragStart);
    }

    if (scrim) {
      scrim.removeEventListener('click', this.closeEnlargedImage);
    }

    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('touchmove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragEnd);
    window.removeEventListener('touchend', this.onDragEnd);

    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }

    document.body.classList.remove('overflow-hidden');
  },

  watch: {
    rotation: {
      handler(newRotation) {
        this.applyTransform(newRotation.x, newRotation.y);
      },
      deep: true
    }
  }
};
</script>