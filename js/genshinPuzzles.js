/**
 * GENSHINPUZZLES.JS - HỆ THỐNG MINIGAME GIẢI ĐỐ PHONG CÁCH GENSHIN IMPACT & SOUNDCLOUD
 * Tuân thủ Single Responsibility Principle (SRP):
 * 1. VinylTurntableGame: Trình phát nhạc SoundCloud Waveform + Mâm đĩa than SEVENTEEN.
 * 2. PyroBurnRevealGame: Dùng ngón tay như ngọn lửa Pyro đốt cháy lớp giấy niêm phong cổ (2D Canvas).
 * 3. StarConstellationGame: Nối 6 ngôi sao Chòm Sao Trái Tim (Mona Astrolabe).
 * 4. InazumaLanternPuzzle (Ấn Ký 01): Giải đố 5 đèn Hoa Sen liên kết (Lights Out).
 * 5. PhotoTileSwapPuzzle (Ấn Ký 02): Ghép mảnh ký ức 3x3 (Sliding/Swap Tile Puzzle).
 * 6. FontaineCompassPuzzle (Ấn Ký 03): Xoay 3 vòng La Bàn Cơ Học đồng tâm liên kết.
 */

/* ============================================================================
   1. SOUNDCLOUD WAVEFORM x VINYL TURNTABLE PLAYER (CHẶNG 1A)
   ============================================================================ */
class VinylTurntableGame {
  constructor(options) {
    this.playlist = options.playlist || [];
    this.audioPlayer = options.audioPlayer;
    this.onTrackInserted = options.onTrackInserted;

    this.rackEl = document.getElementById("vinylDiscRack");
    this.dropZone = document.getElementById("turntableDropZone");
    this.insertedDisc = document.getElementById("platterInsertedDisc");
    this.tonearm = document.getElementById("turntableTonearm");
    this.statusText = document.getElementById("turntableStatusText");
    this.randomBtn = document.getElementById("turntableRandomBtn");
    this.continueBtn = document.getElementById("turntableContinueBtn");

    this.scPlayBtn = document.getElementById("scHeroPlayBtn");
    this.scTitleEl = document.getElementById("scActiveTitle");
    this.scVibeEl = document.getElementById("scActiveVibe");
    this.scWaveEl = document.getElementById("scWaveformBars");

    this.hasInserted = false;
    this.dragClone = null;

    this.init();
  }

  init() {
    this.renderWaveform();
    if (!this.rackEl) return;
    this.renderTracklist();
    this.bindEvents();
  }

  renderWaveform() {
    if (!this.scWaveEl) return;
    this.scWaveEl.innerHTML = "";
    const heights = [
      28, 45, 62, 38, 75, 90, 54, 68, 84, 42, 60, 95,
      72, 50, 88, 64, 40, 78, 92, 58, 70, 85, 48, 66,
      94, 62, 46, 80, 74, 52, 68, 44, 60, 36, 48, 30
    ];
    heights.forEach((h, i) => {
      const bar = document.createElement("span");
      bar.className = "sc-wave-bar";
      bar.style.height = `${h}%`;
      bar.style.animationDelay = `${(i % 8) * 0.08}s`;
      this.scWaveEl.appendChild(bar);
    });
  }

  renderTracklist() {
    this.rackEl.innerHTML = "";

    this.playlist.forEach((track, idx) => {
      const row = document.createElement("div");
      row.className = "sc-track-row";
      row.dataset.index = idx;

      const likes = track.likes || (typeof APP_CONFIG !== "undefined" && APP_CONFIG.defaultTrackLikes) || "22.4K";
      row.innerHTML = `
        <div class="sc-row-thumb">
          <img src="assets/canva/MAG6KrmbpeQ.png" alt="" draggable="false" />
          <span class="sc-row-play-icon">▶</span>
        </div>
        <div class="sc-row-info">
          <div class="sc-row-top">
            <strong class="sc-row-title">${track.title}</strong>
            <span class="sc-row-likes">♥ ${likes}</span>
          </div>
          <div class="sc-row-bottom">
            <span class="sc-row-vibe">SEVENTEEN • ${track.vibe}</span>
            <span class="sc-row-badge">Lắp đĩa</span>
          </div>
        </div>
      `;

      row.addEventListener("click", () => {
        this.insertDisc(idx, row);
      });

      this.rackEl.appendChild(row);
    });
  }

  bindEvents() {
    if (this.randomBtn) {
      this.randomBtn.addEventListener("click", () => {
        const randIdx = Math.floor(Math.random() * this.playlist.length);
        const rows = this.rackEl.querySelectorAll(".sc-track-row");
        this.insertDisc(randIdx, rows[randIdx]);
      });
    }

    if (this.scPlayBtn) {
      this.scPlayBtn.addEventListener("click", () => {
        if (!this.hasInserted) {
          const rows = this.rackEl.querySelectorAll(".sc-track-row");
          this.insertDisc(0, rows[0]);
        } else if (this.audioPlayer) {
          this.audioPlayer.toggle();
          this.syncHeroPlayerState();
        }
      });
    }

    if (this.continueBtn) {
      this.continueBtn.addEventListener("click", () => {
        if (typeof this.onTrackInserted === "function") {
          this.onTrackInserted();
        }
      });
    }
  }

  insertDisc(trackIndex, activeRowEl) {
    const track = this.playlist[trackIndex];
    if (!track) return;

    this.rackEl.querySelectorAll(".sc-track-row").forEach((r) => {
      const isSelected = r === activeRowEl;
      r.classList.toggle("selected", isSelected);
      const badge = r.querySelector(".sc-row-badge");
      if (badge) badge.textContent = isSelected ? "Đang phát ♫" : "Lắp đĩa";
    });

    if (this.insertedDisc) {
      this.insertedDisc.classList.add("loaded", "spinning-vinyl");
      this.insertedDisc.classList.remove("paused");
    }

    if (this.tonearm) {
      this.tonearm.classList.add("playing");
    }

    if (this.scTitleEl) this.scTitleEl.textContent = track.title;
    if (this.scVibeEl) this.scVibeEl.textContent = `♫ ${track.vibe} • Random tiếp theo`;
    if (this.scPlayBtn) this.scPlayBtn.textContent = "⏸";
    if (this.scWaveEl) this.scWaveEl.classList.add("is-playing");

    if (this.statusText) {
      this.statusText.innerHTML = `Đã lắp đĩa: <strong>SEVENTEEN - ${track.title}</strong>`;
    }

    if (this.audioPlayer) {
      this.audioPlayer.selectAndPlay(trackIndex);
    }

    if (this.continueBtn) {
      this.continueBtn.classList.remove("hidden");
    }

    this.hasInserted = true;
  }

  syncHeroPlayerState() {
    if (!this.audioPlayer) return;
    const playing = this.audioPlayer.isPlaying;
    if (this.scPlayBtn) this.scPlayBtn.textContent = playing ? "⏸" : "▶";
    if (this.scWaveEl) this.scWaveEl.classList.toggle("is-playing", playing);
  }
}

/* ============================================================================
   2. MINIGAME ĐỐT CHÁY GIẤY NIÊM PHONG BẰNG LỬA PYRO (2D CANVAS BURN REVEAL)
   ============================================================================ */
class PyroBurnRevealGame {
  constructor(canvasId, wrapperId, progressId, onBurnComplete) {
    this.canvas = document.getElementById(canvasId);
    this.wrapper = document.getElementById(wrapperId);
    this.progressEl = document.getElementById(progressId);
    this.onBurnComplete = onBurnComplete;

    if (!this.canvas || !this.wrapper) return;
    this.ctx = this.canvas.getContext("2d");

    this.fxCanvas = document.getElementById(`${canvasId}Fx`);
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext("2d") : null;

    this.embers = [];
    this.isDrawing = false;
    this.completed = false;
    this.autoBurning = false;
    this.autoBurnRadius = 10;

    this.gridCols = 16;
    this.gridRows = 16;
    this.burnedGrid = new Uint8Array(this.gridCols * this.gridRows);

    this.init();
  }

  init() {
    this.resizeAndDrawParchment();
    this.bindEvents();
    this.animateEmbers();
  }

  resizeAndDrawParchment() {
    const rect = this.wrapper.getBoundingClientRect();
    const w = Math.max(rect.width || 310, 270);
    const h = Math.max(rect.height || 215, 190);

    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;

    if (this.fxCanvas) {
      this.fxCanvas.width = w;
      this.fxCanvas.height = h;
    }

    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";

    const grad = ctx.createRadialGradient(w / 2, h / 2, 12, w / 2, h / 2, Math.max(w, h) * 0.65);
    grad.addColorStop(0, "#5e1914");
    grad.addColorStop(0.6, "#3b0d0b");
    grad.addColorStop(1, "#220504");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(245, 198, 130, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f9dfb8";
    ctx.font = "bold 15px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PHONG ẤN NGUYÊN TỐ HỎA", w / 2, h / 2 - 10);

    ctx.fillStyle = "#f3c392";
    ctx.font = "12px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("Chạm & xoa ngón tay lên đây để đốt cháy!", w / 2, h / 2 + 16);
  }

  bindEvents() {
    const getPos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleBurn = (clientX, clientY) => {
      if (this.completed) return;
      const pos = getPos(clientX, clientY);
      this.burnAt(pos.x, pos.y, 34);
    };

    this.canvas.addEventListener("touchstart", (e) => {
      this.isDrawing = true;
      if (e.touches.length > 0) handleBurn(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener("touchmove", (e) => {
      if (!this.isDrawing) return;
      if (e.touches.length > 0) handleBurn(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener("touchend", () => { this.isDrawing = false; });

    this.canvas.addEventListener("mousedown", (e) => {
      this.isDrawing = true;
      handleBurn(e.clientX, e.clientY);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDrawing) return;
      handleBurn(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", () => { this.isDrawing = false; });
  }

  burnAt(x, y, radius) {
    if (this.completed) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    const rimGrad = ctx.createRadialGradient(x, y, radius * 0.4, x, y, radius * 1.35);
    rimGrad.addColorStop(0, "rgba(255, 220, 110, 0.95)");
    rimGrad.addColorStop(0.5, "rgba(255, 95, 20, 0.85)");
    rimGrad.addColorStop(1, "rgba(60, 10, 0, 0)");
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const holeGrad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    holeGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
    holeGrad.addColorStop(0.75, "rgba(0, 0, 0, 0.92)");
    holeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 5; i++) {
      this.embers.push({
        x: x + (Math.random() - 0.5) * radius,
        y: y + (Math.random() - 0.5) * radius,
        vx: (Math.random() - 0.5) * 2.2,
        vy: -Math.random() * 2.6 - 0.8,
        size: Math.random() * 4.5 + 2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        hue: Math.floor(Math.random() * 38) + 12
      });
    }

    const col = Math.floor((x / this.width) * this.gridCols);
    const row = Math.floor((y / this.height) * this.gridRows);
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.gridRows && c >= 0 && c < this.gridCols) {
          this.burnedGrid[r * this.gridCols + c] = 1;
        }
      }
    }

    const burnedCount = this.burnedGrid.reduce((acc, v) => acc + v, 0);
    const ratio = burnedCount / (this.gridCols * this.gridRows);
    const displayPercent = Math.min(100, Math.round((ratio / 0.36) * 100));

    if (this.progressEl) {
      this.progressEl.textContent = `Đang đốt cháy phong ấn: ${displayPercent}% (Tiếp tục xoa ngón tay!)`;
    }

    if (ratio >= 0.36 && !this.autoBurning) {
      this.autoBurning = true;
    }
  }

  animateEmbers() {
    if (this.completed && this.embers.length === 0) return;
    requestAnimationFrame(() => this.animateEmbers());

    if (this.autoBurning && !this.completed) {
      this.autoBurnRadius += 15;
      this.burnAt(this.width / 2, this.height / 2, this.autoBurnRadius);

      if (this.autoBurnRadius > Math.hypot(this.width, this.height)) {
        this.completed = true;
        this.wrapper.classList.add("burned-away");
        if (this.progressEl) {
          this.progressEl.textContent = "Đã phá giải Phong Ấn! Hãy chạm vào Dấu Sáp Hồng trên phong bì!";
        }
        if (typeof this.onBurnComplete === "function") {
          this.onBurnComplete();
        }
      }
    }

    if (!this.fxCtx) return;
    this.fxCtx.clearRect(0, 0, this.width, this.height);

    for (let i = this.embers.length - 1; i >= 0; i--) {
      const p = this.embers[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.embers.splice(i, 1);
        continue;
      }

      this.fxCtx.save();
      this.fxCtx.globalAlpha = Math.max(0, p.life);
      this.fxCtx.fillStyle = `hsl(${p.hue}, 100%, 60%)`;
      this.fxCtx.shadowColor = "#ff6a00";
      this.fxCtx.shadowBlur = 8;
      this.fxCtx.beginPath();
      this.fxCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.fxCtx.fill();
      this.fxCtx.restore();
    }
  }
}

/* ============================================================================
   3. MINIGAME GỠ RỐI DÂY TƠ HỒNG (UNTANGLE HEART CONSTELLATION PUZZLE)
   Áp dụng nguyên lý Đồ Thị Phẳng (Planar Graph):
   - Các ngôi sao ban đầu bị đan chéo các sợi dây tơ hồng ánh sáng.
   - Người chơi chạm và kéo thả các ngôi sao sao cho không còn sợi dây nào cắt nhau.
   - Khi gỡ rối hoàn toàn (0 nút thắt), các sợi dây phát quang vàng rực rỡ và hội tụ thành Trái Tim tỏa sáng!
   ============================================================================ */
class UntangleHeartGame {
  constructor(canvasId, statusId, onSolved, resetBtnId = "untangleResetBtn") {
    this.canvas = document.getElementById(canvasId);
    this.statusEl = document.getElementById(statusId);
    this.counterEl = document.getElementById("untangleCrossingsCount");
    this.counterPill = document.querySelector(".untangle-counter-pill");
    this.resetBtn = document.getElementById(resetBtnId);
    this.onSolved = onSolved;

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.width = 320;
    this.height = 250;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const config = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.stage3?.untanglePuzzle) || {};
    this.edges = config.edges || [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [0, 3], [0, 2], [0, 4]
    ];
    this.goalNodes = config.goalNodes || [
      { id: 0, x: 160, y: 78, label: "Tâm Giao" },
      { id: 1, x: 100, y: 46, label: "Sao Mai" },
      { id: 2, x: 50,  y: 118, label: "Duyên Nợ" },
      { id: 3, x: 160, y: 220, label: "Chân Tình" },
      { id: 4, x: 270, y: 118, label: "Nguyện Ước" },
      { id: 5, x: 220, y: 46, label: "Tri Kỷ" }
    ];
    this.initialNodes = config.scrambledNodes || [
      { id: 0, x: 100, y: 46, label: "Tâm Giao" },
      { id: 1, x: 160, y: 78, label: "Sao Mai" },
      { id: 2, x: 50,  y: 118, label: "Duyên Nợ" },
      { id: 3, x: 270, y: 118, label: "Chân Tình" },
      { id: 4, x: 160, y: 220, label: "Nguyện Ước" },
      { id: 5, x: 220, y: 46, label: "Tri Kỷ" }
    ];

    this.nodes = this.initialNodes.map((n) => ({ ...n }));
    this.draggedNodeIdx = -1;
    this.dragOffset = { x: 0, y: 0 };
    this.solved = false;
    this.pulsePhase = 0;

    // Các điểm sao nền lấp lánh ngẫu nhiên
    this.bgStars = Array.from({ length: 26 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: 0.6 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2
    }));

    this.crossings = this.findCrossings();
    this.updateHUD();

    this.bindEvents();
    this.animate();
  }

  // Thuật toán kiểm tra 2 đoạn thẳng có cắt nhau (Segment-Segment Intersection)
  ccw(p1, p2, p3) {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }

  intersect(p1, p2, p3, p4) {
    return (
      this.ccw(p1, p3, p4) !== this.ccw(p2, p3, p4) &&
      this.ccw(p1, p2, p3) !== this.ccw(p1, p2, p4)
    );
  }

  computeIntersectionPoint(p1, p2, p3, p4) {
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(d) < 1e-5) return null;
    const px =
      ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / d;
    const py =
      ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / d;
    return { x: px, y: py };
  }

  findCrossings() {
    const points = [];
    const intersectingEdges = new Set();

    for (let i = 0; i < this.edges.length; i++) {
      for (let j = i + 1; j < this.edges.length; j++) {
        const [u1, v1] = this.edges[i];
        const [u2, v2] = this.edges[j];

        // Hai cạnh có chung đỉnh thì không tính là cắt nhau
        if (u1 === u2 || u1 === v2 || v1 === u2 || v1 === v2) continue;

        const p1 = this.nodes[u1];
        const p2 = this.nodes[v1];
        const p3 = this.nodes[u2];
        const p4 = this.nodes[v2];

        if (this.intersect(p1, p2, p3, p4)) {
          intersectingEdges.add(i);
          intersectingEdges.add(j);
          const pt = this.computeIntersectionPoint(p1, p2, p3, p4);
          if (pt) points.push(pt);
        }
      }
    }

    return { count: points.length, intersectingEdges, points };
  }

  updateHUD() {
    if (this.counterEl) {
      this.counterEl.textContent = this.crossings.count;
    }
    if (this.counterPill) {
      this.counterPill.classList.toggle("is-solved", this.crossings.count === 0);
      if (this.crossings.count === 0) {
        this.counterPill.textContent = "Hoàn hảo: 0 nút thắt! Đang thắp sáng thiệp...";
      } else {
        this.counterPill.innerHTML = `Nút thắt còn lại: <strong>${this.crossings.count}</strong>`;
      }
    }
  }

  reset() {
    if (this.solved) return;
    this.nodes = this.initialNodes.map((n) => ({ ...n }));
    this.crossings = this.findCrossings();
    this.updateHUD();
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const onStart = (pos) => {
      if (this.solved) return;
      // Tìm ngôi sao gần nhất trong bán kính chạm (32px để bấm trên điện thoại cực nhạy)
      let nearestIdx = -1;
      let minDist = 34;
      this.nodes.forEach((node, idx) => {
        const d = Math.hypot(pos.x - node.x, pos.y - node.y);
        if (d < minDist) {
          minDist = d;
          nearestIdx = idx;
        }
      });

      if (nearestIdx !== -1) {
        this.draggedNodeIdx = nearestIdx;
        this.dragOffset.x = pos.x - this.nodes[nearestIdx].x;
        this.dragOffset.y = pos.y - this.nodes[nearestIdx].y;
        this.canvas.classList.add("is-dragging");
      }
    };

    const onMove = (pos) => {
      if (this.draggedNodeIdx === -1 || this.solved) return;
      const node = this.nodes[this.draggedNodeIdx];
      // Giới hạn trong khung canvas
      const pad = 24;
      node.x = Math.max(pad, Math.min(this.width - pad, pos.x - this.dragOffset.x));
      node.y = Math.max(pad, Math.min(this.height - pad, pos.y - this.dragOffset.y));

      this.crossings = this.findCrossings();
      this.updateHUD();

      // Kiểm tra chiến thắng khi không còn bất kỳ nút thắt nào
      if (this.crossings.count === 0 && !this.solved) {
        this.solved = true;
        this.canvas.classList.remove("is-dragging");
        this.updateHUD();
        if (this.statusEl) {
          this.statusEl.textContent = "Dây tơ hồng đã gỡ rối hoàn toàn! Chòm Sao Trái Tim tỏa sáng!";
        }
        setTimeout(() => {
          if (typeof this.onSolved === "function") this.onSolved();
        }, 900);
      }
    };

    const onEnd = () => {
      this.draggedNodeIdx = -1;
      this.canvas.classList.remove("is-dragging");
    };

    // Chuột (Desktop)
    this.canvas.addEventListener("mousedown", (e) => onStart(getPos(e)));
    window.addEventListener("mousemove", (e) => onMove(getPos(e)));
    window.addEventListener("mouseup", onEnd);

    // Cảm ứng (Mobile iPhone)
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) onStart(getPos(e));
      },
      { passive: true }
    );
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.cancelable && this.draggedNodeIdx !== -1) e.preventDefault();
        if (e.touches.length > 0) onMove(getPos(e));
      },
      { passive: false }
    );
    this.canvas.addEventListener("touchend", onEnd);
    this.canvas.addEventListener("touchcancel", onEnd);

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.reset());
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.pulsePhase += 0.055;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Vẽ bầu trời sao nền lấp lánh
    this.bgStars.forEach((st) => {
      const alpha = 0.25 + 0.35 * Math.sin(this.pulsePhase + st.phase);
      ctx.fillStyle = `rgba(240, 223, 190, ${alpha})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Vẽ các sợi dây tơ hồng nối giữa các ngôi sao
    this.edges.forEach(([u, v], edgeIdx) => {
      const p1 = this.nodes[u];
      const p2 = this.nodes[v];
      const isIntersecting = this.crossings.intersectingEdges.has(edgeIdx);

      ctx.save();
      if (this.solved) {
        // Trạng thái chiến thắng: Dây phát quang vàng rực rỡ
        ctx.strokeStyle = "rgba(255, 235, 140, 0.95)";
        ctx.shadowColor = "#ffbb33";
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2.8;
      } else if (isIntersecting) {
        // Dây đang bị rối: màu hồng đỏ với nhịp đập cảnh báo
        const pulse = Math.sin(this.pulsePhase * 2) * 0.2;
        ctx.strokeStyle = `rgba(255, 107, 129, ${0.75 + pulse})`;
        ctx.shadowColor = "#ff4757";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.2;
      } else {
        // Dây đã được giải phóng: màu vàng hổ phách êm dịu
        ctx.strokeStyle = "rgba(246, 195, 68, 0.7)";
        ctx.shadowColor = "rgba(246, 195, 68, 0.35)";
        ctx.shadowBlur = 4;
        ctx.lineWidth = 1.8;
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Vẽ điểm nút thắt (giao điểm giữa các dây đang rối)
    if (!this.solved && this.crossings.points.length > 0) {
      this.crossings.points.forEach((pt) => {
        const ringR = 6 + Math.sin(this.pulsePhase * 3) * 2;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 71, 87, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 4. Vẽ các ngôi sao tình yêu
    this.nodes.forEach((node, idx) => {
      const isDragged = idx === this.draggedNodeIdx;
      const r = isDragged ? 13 : 10;

      ctx.save();

      // Vòng hào quang phát sáng khi đang kéo
      if (isDragged) {
        ctx.strokeStyle = "rgba(246, 195, 68, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22 + Math.sin(this.pulsePhase * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bóng sáng của ngôi sao
      ctx.shadowColor = this.solved ? "#ffe299" : isDragged ? "#f6c344" : "#ff6b81";
      ctx.shadowBlur = this.solved ? 18 : isDragged ? 14 : 8;

      // Vẽ viên ngọc ngôi sao tỏa sáng
      const grad = ctx.createRadialGradient(node.x - 2, node.y - 2, 1, node.x, node.y, r);
      if (this.solved) {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#ffe699");
        grad.addColorStop(1, "#d49a20");
      } else if (isDragged) {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.6, "#f6c344");
        grad.addColorStop(1, "#8e1628");
      } else {
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#ffb8c4");
        grad.addColorStop(1, "#750d1d");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Viền ngọc
      ctx.strokeStyle = this.solved ? "#fff" : "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Nhãn tên ngôi sao bên dưới
      ctx.font = "bold 9.5px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = this.solved ? "#ffe699" : "rgba(255, 240, 220, 0.85)";
      ctx.shadowBlur = 3;
      ctx.shadowColor = "#000";
      ctx.fillText(node.label, node.x, node.y + (isDragged ? 24 : 20));

      ctx.restore();
    });
  }
}

// Giữ alias tương thích nếu có code cũ tham chiếu StarConstellationGame
class StarConstellationGame extends UntangleHeartGame {}

/* ============================================================================
   4. ẤN KÝ 01: THÁM TỬ MURDLE - VÒNG TRÒN 5 BÔNG HOA TÌM KẺ NÓI DỐI
   Lấy cảm hứng từ Murdle.com: 5 nghi phạm hoa xếp vòng tròn, 4 hoa nói thật,
   duy nhất 1 hoa nói dối dựa trên mâu thuẫn lời khai và vị trí ngồi kề nhau.
   ============================================================================ */
class MurdleFlowerCirclePuzzle {
  constructor(circleId, murdleConfig, resetBtnId, onSolved) {
    this.circleEl = document.getElementById(circleId);
    this.config = murdleConfig || {};
    this.suspects = this.config.suspects || [];
    this.resetBtn = document.getElementById(resetBtnId);
    this.onSolved = onSolved;

    this.titleEl = document.getElementById("murdleSuspectTitle");
    this.neighborsEl = document.getElementById("murdleSuspectNeighbors");
    this.statementEl = document.getElementById("murdleSuspectStatement");
    this.feedbackEl = document.getElementById("murdleFeedbackText");
    this.markTruthBtn = document.getElementById("murdleMarkTruthBtn");
    this.accuseBtn = document.getElementById("murdleAccuseBtn");

    this.selectedIdx = 0;
    this.truthMarks = new Set(); // Lưu các bông hoa người chơi tự ghi chú là "Nói thật"
    this.solved = false;

    this.init();
  }

  init() {
    if (!this.circleEl || this.suspects.length === 0) return;

    if (this.markTruthBtn) {
      this.markTruthBtn.addEventListener("click", () => {
        if (this.solved) return;
        if (this.truthMarks.has(this.selectedIdx)) {
          this.truthMarks.delete(this.selectedIdx);
        } else {
          this.truthMarks.add(this.selectedIdx);
        }
        this.hideFeedback();
        this.renderCircle();
        this.updateDossier();
      });
    }

    if (this.accuseBtn) {
      this.accuseBtn.addEventListener("click", () => {
        if (this.solved) return;
        this.accuseCurrentSuspect();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        if (this.solved) return;
        this.truthMarks.clear();
        this.selectedIdx = 0;
        this.hideFeedback();
        this.renderCircle();
        this.updateDossier();
      });
    }

    this.renderCircle();
    this.updateDossier();
  }

  hideFeedback() {
    if (this.feedbackEl) {
      this.feedbackEl.classList.add("hidden");
      this.feedbackEl.classList.remove("is-error", "is-success");
    }
  }

  accuseCurrentSuspect() {
    const suspect = this.suspects[this.selectedIdx];
    if (!suspect) return;

    if (suspect.isLiar) {
      this.solved = true;
      if (this.feedbackEl) {
        this.feedbackEl.textContent = suspect.solvedReason;
        this.feedbackEl.classList.remove("hidden", "is-error");
        this.feedbackEl.classList.add("is-success");
      }
      this.renderCircle();
      setTimeout(() => {
        if (typeof this.onSolved === "function") this.onSolved();
      }, 1100);
    } else {
      if (this.feedbackEl) {
        this.feedbackEl.textContent = suspect.wrongReason;
        this.feedbackEl.classList.remove("hidden", "is-success");
        this.feedbackEl.classList.add("is-error");
      }
      const dossier = document.getElementById("murdleDossierBox");
      if (dossier) {
        dossier.classList.remove("shake-cell");
        void dossier.offsetWidth;
        dossier.classList.add("shake-cell");
      }
    }
  }

  renderCircle() {
    this.circleEl.innerHTML = `<div class="murdle-ring-line"></div>`;

    const total = this.suspects.length;
    const radiusPct = 36;

    this.suspects.forEach((s, idx) => {
      // Xếp các bông hoa thành vòng tròn bắt đầu từ đỉnh 12 giờ (-90 độ)
      const angleRad = ((-90 + idx * (360 / total)) * Math.PI) / 180;
      const xPct = 50 + Math.cos(angleRad) * radiusPct;
      const yPct = 50 + Math.sin(angleRad) * radiusPct;

      const isSelected = idx === this.selectedIdx;
      const isMarkedTrue = this.truthMarks.has(idx);
      const isCulpritRevealed = this.solved && s.isLiar;

      const node = document.createElement("button");
      node.type = "button";
      node.className = [
        "murdle-flower-node",
        isSelected ? "is-selected" : "",
        isMarkedTrue ? "is-marked-true" : "",
        isCulpritRevealed ? "is-culprit" : ""
      ].join(" ").trim();

      node.style.left = `${xPct}%`;
      node.style.top = `${yPct}%`;

      node.innerHTML = `
        <img class="murdle-flower-photo" src="${s.photo}" alt="${s.name}" draggable="false" style="object-position:${s.focus || "50% 50%"}" />
        <span class="murdle-seat-pill">${s.seat}</span>
        <span class="murdle-flower-name">${s.name}</span>
        ${isMarkedTrue ? '<span class="murdle-truth-tag">Thật</span>' : ""}
      `;

      node.addEventListener("click", () => {
        if (this.solved) return;
        this.selectedIdx = idx;
        this.hideFeedback();
        this.renderCircle();
        this.updateDossier();
      });

      this.circleEl.appendChild(node);
    });
  }

  updateDossier() {
    const s = this.suspects[this.selectedIdx];
    if (!s) return;

    if (this.titleEl) {
      this.titleEl.textContent = `${s.name} (số ${s.seat})`;
    }
    if (this.neighborsEl) {
      this.neighborsEl.textContent = s.neighbors;
    }
    if (this.statementEl) {
      this.statementEl.textContent = s.statement;
    }
    if (this.markTruthBtn) {
      const marked = this.truthMarks.has(this.selectedIdx);
      this.markTruthBtn.textContent = marked ? "✓ Đã ghi: Nói thật (Bỏ)" : "Đánh dấu: Nói thật";
    }
  }
}

/* ============================================================================
   5. ẤN KÝ 02: VUỐT GHÉP TRANH KÝ ỨC 3x3 (1:1 SQUARE CROP & SWIPE-TO-SWAP)
   - Tự động cắt ảnh chuẩn tỉ lệ vuông 1:1 bằng Offscreen Canvas (không bao giờ méo hình)
   - Cơ chế Vuốt 4 hướng (Lên, Xuống, Trái, Phải) để trượt đổi chỗ với ô liền kề
   ============================================================================ */
class PhotoTileSwapPuzzle {
  constructor(boardId, imageUrl, onSolved, resetBtnId = "r2ResetBtn") {
    this.board = document.getElementById(boardId);
    this.imageUrl = imageUrl;
    this.onSolved = onSolved;
    this.resetBtn = document.getElementById(resetBtnId);
    this.progressEl = document.getElementById("tilePuzzleProgress");
    this.previewImgEl = document.getElementById("tilePuzzlePreviewImg");

    // Trạng thái xáo trộn hợp lý từ các phép trượt liền kề:
    // Hàng 1: [1, 2, 0] (vuốt mảnh 0 sang trái 2 lần)
    // Hàng 2: [3, 5, 4] (vuốt mảnh 4 sang trái 1 lần)
    // Hàng 3: [6, 8, 7] (vuốt mảnh 7 sang trái 1 lần)
    this.initialOrder = [1, 2, 0, 3, 5, 4, 6, 8, 7];
    this.tiles = [...this.initialOrder];
    this.sliceUrls = [];
    this.solved = false;

    this.dragState = null;
    this.init();
  }

  init() {
    if (!this.board) return;
    if (this.previewImgEl && this.imageUrl) {
      this.previewImgEl.src = this.imageUrl;
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.reset());
    }

    this.prepareSquareSlices(() => {
      this.render();
    });
  }

  reset() {
    if (this.solved) return;
    this.tiles = [...this.initialOrder];
    this.render();
  }

  /**
   * Cắt bức ảnh thành 9 mảnh vuông 1:1 chuẩn xác bằng Canvas (center-crop)
   * Đảm bảo dù ảnh gốc là kích thước nào cũng không bao giờ bị co kéo hay méo hình.
   */
  prepareSquareSlices(callback) {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const offsetX = (img.naturalWidth - side) / 2;
      const offsetY = (img.naturalHeight - side) / 2;
      const tileSourceSize = side / 3;
      const tileOutSize = 240;

      this.sliceUrls = [];
      for (let i = 0; i < 9; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const canvas = document.createElement("canvas");
        canvas.width = tileOutSize;
        canvas.height = tileOutSize;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          offsetX + col * tileSourceSize,
          offsetY + row * tileSourceSize,
          tileSourceSize,
          tileSourceSize,
          0,
          0,
          tileOutSize,
          tileOutSize
        );
        this.sliceUrls.push(canvas.toDataURL("image/jpeg", 0.92));
      }
      callback();
    };
    img.onerror = () => {
      callback();
    };
    img.src = this.imageUrl;
  }

  swapSlots(slotA, slotB) {
    if (this.solved || slotA === slotB || slotA < 0 || slotB < 0 || slotA > 8 || slotB > 8) return;

    const temp = this.tiles[slotA];
    this.tiles[slotA] = this.tiles[slotB];
    this.tiles[slotB] = temp;
    this.render(slotA, slotB);

    if (this.tiles.every((pieceId, idx) => pieceId === idx)) {
      this.solved = true;
      if (this.progressEl) {
        this.progressEl.textContent = "Hoàn hảo: 9 / 9 ô!";
      }
      setTimeout(() => {
        if (typeof this.onSolved === "function") this.onSolved();
      }, 550);
    }
  }

  bindTileSwipe(tileEl, slotIdx) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let hasSwapped = false;

    const onStart = (clientX, clientY) => {
      if (this.solved) return;
      startX = clientX;
      startY = clientY;
      isDragging = true;
      hasSwapped = false;
      tileEl.classList.add("is-dragging");
    };

    const onMove = (clientX, clientY) => {
      if (!isDragging || hasSwapped || this.solved) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const dist = Math.hypot(dx, dy);

      // Hiệu ứng ô ảnh nhích nhẹ theo ngón tay khi đang vuốt
      const clampX = Math.max(-28, Math.min(28, dx * 0.55));
      const clampY = Math.max(-28, Math.min(28, dy * 0.55));
      tileEl.style.transform = `translate3d(${clampX}px, ${clampY}px, 0) scale(1.04)`;

      // Khi vuốt vượt ngưỡng 24px -> Xác định hướng vuốt (Trái/Phải/Lên/Xuống) và trượt đổi chỗ ngay
      if (dist >= 24) {
        const col = slotIdx % 3;
        const row = Math.floor(slotIdx / 3);
        let targetSlot = -1;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Vuốt ngang
          if (dx > 0 && col < 2) targetSlot = slotIdx + 1;
          else if (dx < 0 && col > 0) targetSlot = slotIdx - 1;
        } else {
          // Vuốt dọc
          if (dy > 0 && row < 2) targetSlot = slotIdx + 3;
          else if (dy < 0 && row > 0) targetSlot = slotIdx - 3;
        }

        if (targetSlot !== -1) {
          hasSwapped = true;
          isDragging = false;
          tileEl.classList.remove("is-dragging");
          tileEl.style.transform = "";
          this.swapSlots(slotIdx, targetSlot);
        }
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      tileEl.classList.remove("is-dragging");
      tileEl.style.transform = "";
    };

    // Hỗ trợ cả cảm ứng điện thoại (Touch) và chuột máy tính (Pointer/Mouse)
    tileEl.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    tileEl.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    tileEl.addEventListener("touchend", onEnd);
    tileEl.addEventListener("touchcancel", onEnd);

    tileEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      const moveListener = (ev) => onMove(ev.clientX, ev.clientY);
      const upListener = () => {
        onEnd();
        window.removeEventListener("mousemove", moveListener);
        window.removeEventListener("mouseup", upListener);
      };
      window.addEventListener("mousemove", moveListener);
      window.addEventListener("mouseup", upListener);
    });
  }

  render(swappedA = -1, swappedB = -1) {
    this.board.innerHTML = "";
    let correctCount = 0;

    this.tiles.forEach((pieceId, slotIdx) => {
      const tile = document.createElement("div");
      const isCorrect = pieceId === slotIdx;
      if (isCorrect) correctCount++;

      const justSwapped = slotIdx === swappedA || slotIdx === swappedB;
      tile.className = `photo-tile-cell ${isCorrect ? "is-correct" : ""} ${justSwapped ? "pop-anim" : ""}`;

      if (this.sliceUrls[pieceId]) {
        const img = document.createElement("img");
        img.src = this.sliceUrls[pieceId];
        img.alt = "";
        img.draggable = false;
        img.className = "tile-slice-img";
        tile.appendChild(img);
      } else {
        const col = pieceId % 3;
        const row = Math.floor(pieceId / 3);
        tile.style.backgroundImage = `url('${this.imageUrl}')`;
        tile.style.backgroundSize = "300% 300%";
        tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
      }

      if (isCorrect) {
        const badge = document.createElement("span");
        badge.className = "tile-check";
        badge.textContent = "✓";
        tile.appendChild(badge);
      }

      this.bindTileSwipe(tile, slotIdx);
      this.board.appendChild(tile);
    });

    if (this.progressEl && !this.solved) {
      this.progressEl.textContent = `Đúng vị trí: ${correctCount} / 9 ô`;
    }
  }
}

/* ============================================================================
   6. ẤN KÝ 03: LA BÀN CỔ HỌC FONTAINE 3 VÒNG ĐỒNG TÂM LIÊN KẾT
   ============================================================================ */
class FontaineCompassPuzzle {
  constructor(canvasId, resetBtnId, onSolved) {
    this.canvas = document.getElementById(canvasId);
    this.resetBtn = document.getElementById(resetBtnId);
    this.onSolved = onSolved;

    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Mỗi vòng có 6 nấc (0..5, tương ứng 0°, 60°, 120°, 180°, 240°, 300°). Đích là [0, 0, 0] (12 giờ).
    // Trạng thái khởi đầu: [3, 4, 5] -> Giải bằng cách: Bấm (1+2) 2 lần, (2+3) 1 lần, (1+3) 1 lần!
    this.initialSteps = [3, 4, 5];
    this.ringSteps = [...this.initialSteps];
    this.displayAngles = this.ringSteps.map((s) => (s * Math.PI) / 3);
    this.solved = false;

    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    document.querySelectorAll(".compass-rot-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.solved) return;
        const pair = btn.dataset.pair;
        if (pair === "AB") {
          this.ringSteps[0] = (this.ringSteps[0] + 1) % 6;
          this.ringSteps[1] = (this.ringSteps[1] + 1) % 6;
        } else if (pair === "BC") {
          this.ringSteps[1] = (this.ringSteps[1] + 1) % 6;
          this.ringSteps[2] = (this.ringSteps[2] + 1) % 6;
        } else if (pair === "AC") {
          this.ringSteps[0] = (this.ringSteps[0] + 1) % 6;
          this.ringSteps[2] = (this.ringSteps[2] + 1) % 6;
        }
        this.checkSolved();
      });
    });

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        if (this.solved) return;
        this.ringSteps = [...this.initialSteps];
      });
    }
  }

  checkSolved() {
    if (this.ringSteps.every((s) => s === 0)) {
      this.solved = true;
      setTimeout(() => {
        if (typeof this.onSolved === "function") this.onSolved();
      }, 650);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Mốc chuẩn 12 giờ ở đỉnh trên cùng
    ctx.save();
    ctx.fillStyle = "#f6c344";
    ctx.font = "bold 12px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("▼ MỐC 12H", cx, 16);
    ctx.strokeStyle = "rgba(246, 195, 68, 0.35)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, cy - 25);
    ctx.stroke();
    ctx.restore();

    const radii = [102, 74, 46];
    const colors = ["#f6c344", "#f29b76", "#f7d486"];

    radii.forEach((r, idx) => {
      const targetAngle = (this.ringSteps[idx] * Math.PI) / 3;
      // Nội suy góc xoay mượt mà
      let diff = targetAngle - (this.displayAngles[idx] % (Math.PI * 2));
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      this.displayAngles[idx] += diff * 0.18;

      const angle = this.displayAngles[idx] - Math.PI / 2; // 0 rad ở hướng 12 giờ (-PI/2)
      const isAligned = this.ringSteps[idx] === 0;

      // Vẽ vành la bàn
      ctx.save();
      ctx.strokeStyle = isAligned ? "#55efc4" : colors[idx];
      ctx.lineWidth = 6;
      ctx.shadowColor = isAligned ? "#55efc4" : colors[idx];
      ctx.shadowBlur = isAligned ? 12 : 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Vẽ viên ngọc Trái Tim trên vành
      const gx = cx + Math.cos(angle) * r;
      const gy = cy + Math.sin(angle) * r;

      ctx.fillStyle = isAligned ? "#00b894" : "#b31b2c";
      ctx.beginPath();
      ctx.arc(gx, gy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♥", gx, gy + 1);
      ctx.restore();
    });

    // Tâm la bàn
    ctx.save();
    ctx.fillStyle = this.solved ? "#00b894" : "#5e0814";
    ctx.strokeStyle = "#f6c344";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f6c344";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.solved ? "✓" : "20/10", cx, cy);
    ctx.restore();
  }
}
