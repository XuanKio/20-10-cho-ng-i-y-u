/**
 * AMBIENTPARTICLES.JS - HIỆU ỨNG ÁNH SÁNG BỤI VÀNG VINTAGE TRÊN CANVAS
 * Áp dụng Particle System Pattern:
 * Tạo các hạt bụi vàng và đốm sáng lung linh bay chậm rãi trên nền đỏ Burgundy.
 */

class AmbientParticle {
  constructor(canvasW, canvasH) {
    this.reset(canvasW, canvasH, true);
  }

  reset(canvasW, canvasH, isInit = false) {
    this.x = Math.random() * canvasW;
    this.y = isInit ? Math.random() * canvasH : canvasH + 15;
    this.radius = Math.random() * 2.5 + 1;
    this.speedY = Math.random() * 0.7 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.fadeSpeed = Math.random() * 0.002 + 0.001;
    this.color = Math.random() > 0.4 ? "255, 215, 0" : "255, 182, 193"; // Vàng kim hoặc hồng phấn
  }

  update(canvasW, canvasH) {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.opacity -= this.fadeSpeed;

    if (this.y < -10 || this.opacity <= 0) {
      this.reset(canvasW, canvasH);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${this.color}, 0.8)`;
    ctx.fill();
    ctx.restore();
  }
}

class AmbientParticleSystem {
  constructor(canvasId, count = 40) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.count = count;
    this.particles = [];

    this.resize();
    this.init();
    window.addEventListener("resize", () => this.resize());
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push(new AmbientParticle(this.width, this.height));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let p of this.particles) {
      p.update(this.width, this.height);
      p.draw(this.ctx);
    }
    requestAnimationFrame(() => this.animate());
  }
}
