/**
 * HEARTPARTICLES.JS - HỆ THỐNG HẠT TRÁI TIM BAY TRÊN CANVAS
 * Áp dụng Design Pattern: Particle System Pattern
 * Chỉ chịu trách nhiệm hiển thị hiệu ứng đồ họa nền Canvas.
 */

class HeartParticle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true);
  }

  reset(canvasWidth, canvasHeight, isInitial = false) {
    this.x = Math.random() * canvasWidth;
    this.y = isInitial ? Math.random() * canvasHeight : canvasHeight + 20;
    this.size = Math.random() * 14 + 10; // Kích thước trái tim
    this.speedY = Math.random() * 1.5 + 0.8; // Vận tốc bay lên
    this.speedX = (Math.random() - 0.5) * 1.2; // Lắc lư ngang
    this.opacity = Math.random() * 0.6 + 0.3;
    this.fadeSpeed = Math.random() * 0.003 + 0.002;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.04;
    // Tông màu hồng, đỏ, tím mộng mơ
    const colors = [
      "rgba(255, 107, 139, ",
      "rgba(255, 71, 126, ",
      "rgba(255, 143, 163, ",
      "rgba(247, 37, 133, "
    ];
    this.baseColor = colors[Math.floor(Math.random() * colors.length)];
  }

  update(canvasWidth, canvasHeight) {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fadeSpeed;

    // Nếu bay ra khỏi màn hình hoặc đã mờ hết -> reset lại từ dưới đáy
    if (this.y < -20 || this.opacity <= 0) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  // Thuật toán vẽ hình trái tim bằng đường cong Bezier trên Canvas 2D
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = `${this.baseColor}${this.opacity})`;
    ctx.beginPath();

    const topCurveHeight = this.size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Nhánh trái
    ctx.bezierCurveTo(
      -this.size / 2, -this.size / 2,
      -this.size, topCurveHeight,
      0, this.size
    );
    // Nhánh phải
    ctx.bezierCurveTo(
      this.size, topCurveHeight,
      this.size / 2, -this.size / 2,
      0, topCurveHeight
    );

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class HeartParticleSystem {
  constructor(canvasId, particleCount = 35) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particleCount = particleCount;
    this.particles = [];

    this.resizeCanvas();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new HeartParticle(this.width, this.height));
    }
  }

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.width, this.height);
      this.particles[i].draw(this.ctx);
    }

    requestAnimationFrame(() => this.animate());
  }
}
