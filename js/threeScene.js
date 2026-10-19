/**
 * THREESCENE.JS - KHÔNG GIAN 3D BẰNG THREE.JS KẾT HỢP ĐỒ HỌA 2D CANVAS
 * Áp dụng Particle System Pattern & Adapter Pattern:
 * Dùng Canvas 2D cơ bản để vẽ texture cánh hoa hồng & ánh sáng bokeh sắc nét,
 * sau đó đưa vào không gian WebGL 3D của Three.js với chuyển động 120fps trên iPhone 17 Pro.
 */

class RomanticThreeScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === "undefined") return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pointer = new THREE.Vector2(9999, 9999);
    this.targetCameraOffset = new THREE.Vector2(0, 0);

    this.petals = [];
    this.burstParticles = [];
    this.clock = new THREE.Clock();

    this.initThree();
    this.createTextures();
    this.createAmbientPetals(38);
    this.createGoldenBokeh(45);
    this.bindEvents();
    this.animate();
  }

  initThree() {
    this.scene = new THREE.Scene();

    // Camera phối cảnh 3D
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 100);
    this.camera.position.z = 18;

    // WebGLRenderer tối ưu cho màn hình Retina / Super Retina XDR của iPhone 17 Pro
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
  }

  // Dùng đồ họa 2D Canvas cơ bản để vẽ Texture cánh hoa đào/hồng và trái tim mềm mại
  createTextures() {
    // 1. Texture cánh hoa / trái tim mềm bằng Bezier Curve 2D
    const heartCanvas = document.createElement("canvas");
    heartCanvas.width = 128;
    heartCanvas.height = 128;
    const hCtx = heartCanvas.getContext("2d");

    const grad = hCtx.createRadialGradient(64, 58, 8, 64, 64, 56);
    grad.addColorStop(0, "rgba(255, 225, 230, 0.95)");
    grad.addColorStop(0.55, "rgba(235, 130, 150, 0.85)");
    grad.addColorStop(1, "rgba(180, 40, 65, 0)");

    hCtx.fillStyle = grad;
    hCtx.beginPath();
    hCtx.moveTo(64, 38);
    hCtx.bezierCurveTo(42, 12, 12, 36, 64, 104);
    hCtx.bezierCurveTo(116, 36, 86, 12, 64, 38);
    hCtx.closePath();
    hCtx.fill();

    this.heartTexture = new THREE.CanvasTexture(heartCanvas);

    // 2. Texture đốm sáng Bokeh vàng kem ấm áp
    const bokehCanvas = document.createElement("canvas");
    bokehCanvas.width = 64;
    bokehCanvas.height = 64;
    const bCtx = bokehCanvas.getContext("2d");

    const bGrad = bCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    bGrad.addColorStop(0, "rgba(255, 245, 220, 1)");
    bGrad.addColorStop(0.4, "rgba(239, 224, 193, 0.6)");
    bGrad.addColorStop(1, "rgba(239, 224, 193, 0)");

    bCtx.fillStyle = bGrad;
    bCtx.beginPath();
    bCtx.arc(32, 32, 30, 0, Math.PI * 2);
    bCtx.fill();

    this.bokehTexture = new THREE.CanvasTexture(bokehCanvas);
  }

  // Tạo các cánh hoa/trái tim 3D bay lơ lửng trong không gian
  createAmbientPetals(count) {
    const geometry = new THREE.PlaneGeometry(0.85, 0.85);

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: this.heartTexture,
        transparent: true,
        opacity: Math.random() * 0.45 + 0.25,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      this.resetPetal(mesh, true);
      this.scene.add(mesh);

      this.petals.push({
        mesh,
        speedY: Math.random() * 0.018 + 0.008,
        swayAmp: Math.random() * 0.015 + 0.005,
        swayFreq: Math.random() * 1.5 + 0.6,
        phase: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.025,
        rotSpeedZ: (Math.random() - 0.5) * 0.015
      });
    }
  }

  resetPetal(mesh, initial = false) {
    const spreadX = 22;
    const spreadY = 26;
    mesh.position.x = (Math.random() - 0.5) * spreadX;
    mesh.position.y = initial ? (Math.random() - 0.5) * spreadY : -14;
    mesh.position.z = (Math.random() - 0.5) * 10;
    const scale = Math.random() * 0.8 + 0.45;
    mesh.scale.set(scale, scale, scale);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
  }

  // Tạo lớp hạt bụi vàng Bokeh 3D
  createGoldenBokeh(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      map: this.bokehTexture,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.bokehPoints = new THREE.Points(geo, mat);
    this.scene.add(this.bokehPoints);
  }

  // Hiệu ứng nổ tung chùm trái tim 3D khi mở khóa câu đố
  burstHearts(count = 28) {
    if (!this.scene) return;
    const geometry = new THREE.PlaneGeometry(0.9, 0.9);

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: this.heartTexture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 4);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.22 + 0.08;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + 0.06;
      const vz = (Math.random() - 0.5) * 0.16;

      this.scene.add(mesh);
      this.burstParticles.push({
        mesh,
        vx,
        vy,
        vz,
        gravity: 0.0032,
        life: 1.0,
        decay: Math.random() * 0.012 + 0.01
      });
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    // Tương tác cảm ứng / di chuột tạo hiệu ứng Parallax 3D nhẹ nhàng
    const onMove = (clientX, clientY) => {
      const nx = (clientX / this.width) * 2 - 1;
      const ny = -(clientY / this.height) * 2 + 1;
      this.pointer.set(nx * 10, ny * 12);
      this.targetCameraOffset.set(nx * 0.7, ny * 0.7);
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const elapsed = this.clock.getElapsedTime();

    // Camera Parallax mượt mà
    this.camera.position.x += (this.targetCameraOffset.x - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetCameraOffset.y - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    // Cập nhật các cánh hoa 3D bay lên nhẹ nhàng
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.mesh.position.y += p.speedY;
      p.mesh.position.x += Math.sin(elapsed * p.swayFreq + p.phase) * p.swayAmp;

      // Tương tác đẩy nhẹ khi ngón tay lướt gần trên màn hình cảm ứng
      const dx = p.mesh.position.x - this.pointer.x;
      const dy = p.mesh.position.y - this.pointer.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 9 && distSq > 0.01) {
        const force = (3 - Math.sqrt(distSq)) * 0.015;
        p.mesh.position.x += (dx / Math.sqrt(distSq)) * force;
        p.mesh.position.y += (dy / Math.sqrt(distSq)) * force;
      }

      p.mesh.rotation.x += p.rotSpeedX;
      p.mesh.rotation.y += p.rotSpeedY;
      p.mesh.rotation.z += p.rotSpeedZ;

      if (p.mesh.position.y > 14) {
        this.resetPetal(p.mesh, false);
      }
    }

    // Xoay nhẹ bầu trời Bokeh vàng
    if (this.bokehPoints) {
      this.bokehPoints.rotation.y = elapsed * 0.03;
      this.bokehPoints.position.y = Math.sin(elapsed * 0.4) * 0.4;
    }

    // Cập nhật hạt nổ Burst 3D
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const b = this.burstParticles[i];
      b.mesh.position.x += b.vx;
      b.mesh.position.y += b.vy;
      b.mesh.position.z += b.vz;
      b.vy -= b.gravity;
      b.mesh.rotation.z += 0.06;
      b.mesh.rotation.y += 0.08;
      b.life -= b.decay;
      b.mesh.material.opacity = Math.max(0, b.life);

      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        b.mesh.material.dispose();
        this.burstParticles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
