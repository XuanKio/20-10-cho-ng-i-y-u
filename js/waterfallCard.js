/**
 * WATERFALLCARD.JS - MODULE COSPLAY CHẾ ĐỘ XEM KỶ NIỆM THÁNG CỦA LOCKET (LOCKET MONTHLY RECAP)
 * Áp dụng Single Responsibility Principle (SRP) & Component Pattern:
 * Tái sử dụng cùng một class LocketMonthlyMemories cho cả Cánh Phải (Chặng 2) và Phòng Our Memories (Chặng 4)
 * mà không bị lặp code (DRY). Tuyệt đối không ghi chú thích thoại dưới ảnh.
 */

class LocketMonthlyMemories {
  constructor(containerId, items, options = {}) {
    this.container = document.getElementById(containerId);
    this.items = items || [];
    this.onMilestoneReached = options.onMilestoneReached;
    this.compact = Boolean(options.compact);

    this.currentIndex = 0;
    this.viewMode = "flip"; // "flip" (Lật từng tấm Locket) | "month" (Lưới Kỷ Niệm Tháng Locket)
    this.viewedCount = 0;
    this.milestoneTriggered = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    if (this.container && this.items.length > 0) {
      this.renderShell();
      this.updateActiveSlide();
      this.bindEvents();
    }
  }

  renderShell() {
    const progressSegments = this.items
      .map((_, i) => `<div class="locket-seg" data-idx="${i}"><div class="locket-seg-fill"></div></div>`)
      .join("");

    const monthGridCells = this.renderMonthGridHTML();

    this.container.innerHTML = `
      <div class="locket-widget-shell ${this.compact ? "is-compact" : ""}">
        <!-- Thanh vạch tiến trình kiểu Locket Recap -->
        <div class="locket-progress-row">
          ${progressSegments}
        </div>

        <!-- Header Locket: Avatar đôi + Ngày tháng + Nút chuyển chế độ Lịch Tháng -->
        <div class="locket-top-bar">
          <div class="locket-user-pill">
            <img src="assets/images/photo_glasses_cute.jpg" alt="" class="locket-avatar" draggable="false" />
            <span class="locket-username">Xuân &amp; Em ♥</span>
            <span class="locket-date-tag" data-role="dateTag">02 Th10</span>
          </div>

          <button class="locket-mode-btn" data-role="modeToggleBtn" title="Chuyển chế độ Lịch Kỷ Niệm Tháng">
            📅 Tháng 10
          </button>
        </div>

        <!-- VÙNG 1: CHẾ ĐỘ LẬT ẢNH LOCKET (SQUARE ROUNDED VIEWPORT) -->
        <div class="locket-flip-stage" data-role="flipStage">
          <div class="locket-square-card" data-role="squareCard">
            <div class="locket-media-slot" data-role="mediaSlot"></div>

            <!-- Vùng chạm Trái / Phải để lật nhanh như Locket -->
            <button class="locket-tap-zone zone-prev" data-role="prevBtn" aria-label="Ảnh trước">‹</button>
            <button class="locket-tap-zone zone-next" data-role="nextBtn" aria-label="Ảnh tiếp">›</button>

            <!-- Lớp bắn tim bay lên khi thả cảm xúc Locket -->
            <div class="locket-Verify-burst" data-role="emojiBurstLayer"></div>
          </div>

          <!-- Thanh gửi cảm xúc bên dưới chuẩn giao diện Locket -->
          <div class="locket-reaction-bar">
            <span class="locket-reply-hint">Gửi cảm xúc...</span>
            <div class="locket-emoji-btns">
              <button class="locket-react-btn" data-emoji="❤️">❤️</button>
              <button class="locket-react-btn" data-emoji="🔥">🔥</button>
              <button class="locket-react-btn" data-emoji="🥰">🥰</button>
              <button class="locket-react-btn" data-emoji="✨">✨</button>
            </div>
          </div>
        </div>

        <!-- VÙNG 2: CHẾ ĐỘ XEM LỊCH KỶ NIỆM THÁNG LOCKET (MONTHLY RECAP GRID) -->
        <div class="locket-month-stage hidden" data-role="monthStage">
          <div class="locket-month-header">
            <strong>Kỷ Niệm Tháng 10 • Locket Recap</strong>
            <span>${this.items.length} khoảnh khắc</span>
          </div>
          <div class="locket-month-grid">
            ${monthGridCells}
          </div>
          <p class="locket-month-tip">(Chạm vào ngày bất kỳ để phóng to khoảnh khắc đó)</p>
        </div>
      </div>
    `;
  }

  renderMonthGridHTML() {
    // Tạo bảng 28 ô đại diện cho lưới lịch kỷ niệm tháng Locket, gán các tấm ảnh/video vào các ngày
    const slotMap = {
      2: 0, 5: 1, 7: 2, 10: 3, 12: 4, 14: 5,
      16: 6, 18: 7, 19: 8, 20: 9, 23: 10, 26: 11
    };

    let html = "";
    for (let d = 1; d <= 28; d++) {
      const itemIdx = slotMap[d];
      if (itemIdx !== undefined && this.items[itemIdx]) {
        const item = this.items[itemIdx];
        const thumbUrl = item.type === "video" ? item.poster : item.url;
        html += `
          <button class="locket-cal-thumb has-media" data-jump-idx="${itemIdx}">
            <img src="${thumbUrl}" alt="" draggable="false" />
            <span class="locket-cal-day">${d}</span>
          </button>
        `;
      } else {
        html += `
          <div class="locket-cal-thumb empty-day">
            <span>${d}</span>
          </div>
        `;
      }
    }
    return html;
  }

  updateActiveSlide(direction = "next") {
    const item = this.items[this.currentIndex];
    if (!item) return;

    const mediaSlot = this.container.querySelector('[data-role="mediaSlot"]');
    const dateTag = this.container.querySelector('[data-role="dateTag"]');
    const squareCard = this.container.querySelector('[data-role="squareCard"]');

    if (dateTag) {
      dateTag.textContent = `${item.day} ${item.badge || ""}`;
    }

    if (squareCard) {
      squareCard.classList.remove("flip-anim-next", "flip-anim-prev");
      void squareCard.offsetWidth;
      squareCard.classList.add(direction === "prev" ? "flip-anim-prev" : "flip-anim-next");
    }

    if (mediaSlot) {
      if (item.type === "video") {
        mediaSlot.innerHTML = `
          <video src="${item.url}" poster="${item.poster || ""}" autoplay loop muted playsinline></video>
        `;
      } else {
        mediaSlot.innerHTML = `
          <img src="${item.url}" alt="" draggable="false" />
        `;
      }
    }

    // Cập nhật thanh vạch tiến trình trên cùng
    const segs = this.container.querySelectorAll(".locket-seg");
    segs.forEach((seg, idx) => {
      seg.classList.toggle("done", idx < this.currentIndex);
      seg.classList.toggle("active", idx === this.currentIndex);
    });

    // Kiểm tra hoàn thành nhiệm vụ xem ảnh
    this.viewedCount++;
    if (this.viewedCount >= 3 && !this.milestoneTriggered) {
      this.milestoneTriggered = true;
      if (typeof this.onMilestoneReached === "function") {
        this.onMilestoneReached();
      }
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateActiveSlide("next");
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateActiveSlide("prev");
  }

  toggleViewMode(forceMode) {
    this.viewMode = forceMode || (this.viewMode === "flip" ? "month" : "flip");
    const flipStage = this.container.querySelector('[data-role="flipStage"]');
    const monthStage = this.container.querySelector('[data-role="monthStage"]');
    const modeBtn = this.container.querySelector('[data-role="modeToggleBtn"]');

    if (this.viewMode === "month") {
      if (flipStage) flipStage.classList.add("hidden");
      if (monthStage) monthStage.classList.remove("hidden");
      if (modeBtn) modeBtn.textContent = "▢ Lật Ảnh";
    } else {
      if (monthStage) monthStage.classList.add("hidden");
      if (flipStage) flipStage.classList.remove("hidden");
      if (modeBtn) modeBtn.textContent = "📅 Tháng 10";
    }
  }

  spawnFloatingEmoji(emojiChar) {
    const burstLayer = this.container.querySelector('[data-role="emojiBurstLayer"]');
    if (!burstLayer) return;

    for (let i = 0; i < 6; i++) {
      const span = document.createElement("span");
      span.className = "locket-flying-emoji";
      span.textContent = emojiChar;
      span.style.left = `${20 + Math.random() * 60}%`;
      span.style.animationDelay = `${i * 0.06}s`;
      burstLayer.appendChild(span);

      setTimeout(() => {
        if (span.parentNode) span.parentNode.removeChild(span);
      }, 1100);
    }
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('[data-role="prevBtn"]');
    const nextBtn = this.container.querySelector('[data-role="nextBtn"]');
    const modeBtn = this.container.querySelector('[data-role="modeToggleBtn"]');
    const squareCard = this.container.querySelector('[data-role="squareCard"]');

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.nextSlide();
      });
    }

    if (modeBtn) {
      modeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleViewMode();
      });
    }

    // Chạm vào từng ô ngày trong chế độ Lịch Tháng Locket -> Mở đúng tấm ảnh đó
    this.container.querySelectorAll("[data-jump-idx]").forEach((thumbBtn) => {
      thumbBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(thumbBtn.dataset.jumpIdx, 10);
        this.currentIndex = idx;
        this.toggleViewMode("flip");
        this.updateActiveSlide("next");
      });
    });

    // Nút thả cảm xúc Locket (❤️ 🔥 🥰 ✨)
    this.container.querySelectorAll(".locket-react-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.spawnFloatingEmoji(btn.dataset.emoji || "❤️");
        setTimeout(() => this.nextSlide(), 420);
      });
    });

    // Vuốt Trái / Phải / Lên / Xuống kiểu Locket trên iPhone 17 Pro
    if (squareCard) {
      squareCard.addEventListener("touchstart", (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          this.touchStartX = e.changedTouches[0].clientX;
          this.touchStartY = e.changedTouches[0].clientY;
        }
      }, { passive: true });

      squareCard.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          const dx = e.changedTouches[0].clientX - this.touchStartX;
          const dy = e.changedTouches[0].clientY - this.touchStartY;
          if (Math.abs(dx) > 25 || Math.abs(dy) > 25) {
            if (dx < -25 || dy < -25) this.nextSlide();
            else this.prevSlide();
          }
        }
      }, { passive: true });
    }
  }
}
