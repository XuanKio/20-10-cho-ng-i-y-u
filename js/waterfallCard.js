/**
 * WATERFALLCARD.JS - LOCKET: LẬT ẢNH VUÔNG + LƯỚI KỶ NIỆM
 * Single Responsibility: class này chỉ lo hiển thị một "đoạn" Locket (danh sách ảnh/video truyền vào).
 * Component Pattern: tạo nhiều instance cho nhiều đoạn (thiệp Chặng 2, Ấn Ký 02 Chặng 4) mà không lặp code.
 * Không ghi chú thoại dưới ảnh, không emoji, chỉ có: thanh tiến trình, ngày, ảnh vuông, nút tim, nút xem lưới.
 */

class LocketMonthlyMemories {
  constructor(containerId, items, options = {}) {
    this.container = document.getElementById(containerId);
    this.items = items || [];
    this.onMilestoneReached = options.onMilestoneReached;
    this.milestoneViews = options.milestoneViews || 3;

    this.currentIndex = 0;
    this.viewMode = "flip"; // "flip" (lật từng ảnh) | "grid" (lưới thu nhỏ)
    this.seenIndexes = new Set();
    this.milestoneTriggered = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    if (this.container && this.items.length > 0) {
      this.renderShell();
      this.bindEvents();
      this.updateActiveSlide();
    }
  }

  // Mỗi phần tử được tìm bằng thuộc tính data-role để không phụ thuộc id toàn cục (tránh trùng giữa 2 instance)
  role(name) {
    return this.container.querySelector(`[data-role="${name}"]`);
  }

  renderShell() {
    const progressSegments = this.items
      .map(() => `<div class="locket-seg"><div class="locket-seg-fill"></div></div>`)
      .join("");

    const gridCells = this.items
      .map((item, idx) => {
        const thumbUrl = item.type === "video" ? item.poster : item.url;
        return `
          <button class="locket-cal-thumb" data-jump-idx="${idx}">
            <img src="${thumbUrl}" alt="" draggable="false" />
            <span class="locket-cal-day">${item.day}</span>
          </button>`;
      })
      .join("");

    this.container.innerHTML = `
      <div class="locket-widget-shell">
        <div class="locket-progress-row">${progressSegments}</div>

        <div class="locket-top-bar">
          <span class="locket-date-tag" data-role="dateTag"></span>
          <button class="locket-mode-btn" data-role="modeToggleBtn">Xem lưới</button>
        </div>

        <div class="locket-flip-stage" data-role="flipStage">
          <div class="locket-square-card" data-role="squareCard">
            <div class="locket-media-slot" data-role="mediaSlot"></div>
            <button class="locket-tap-zone zone-prev" data-role="prevBtn" aria-label="Ảnh trước"></button>
            <button class="locket-tap-zone zone-next" data-role="nextBtn" aria-label="Ảnh tiếp"></button>
            <div class="locket-burst-layer" data-role="burstLayer"></div>
          </div>
          <button class="locket-heart-btn" data-role="heartBtn" aria-label="Thả tim">&hearts;</button>
        </div>

        <div class="locket-month-stage hidden" data-role="gridStage">
          <div class="locket-month-grid">${gridCells}</div>
        </div>
      </div>
    `;
  }

  updateActiveSlide(direction = "next") {
    const item = this.items[this.currentIndex];
    if (!item) return;

    const dateTag = this.role("dateTag");
    const mediaSlot = this.role("mediaSlot");
    const squareCard = this.role("squareCard");

    if (dateTag) dateTag.textContent = item.day;

    if (squareCard) {
      squareCard.classList.remove("flip-anim-next", "flip-anim-prev");
      void squareCard.offsetWidth; // ép trình duyệt tính lại layout để animation chạy lại
      squareCard.classList.add(direction === "prev" ? "flip-anim-prev" : "flip-anim-next");
    }

    if (mediaSlot) {
      mediaSlot.innerHTML =
        item.type === "video"
          ? `<video src="${item.url}" poster="${item.poster || ""}" autoplay loop muted playsinline></video>`
          : `<img src="${item.url}" alt="" draggable="false" />`;
    }

    this.container.querySelectorAll(".locket-seg").forEach((seg, idx) => {
      seg.classList.toggle("done", idx < this.currentIndex);
      seg.classList.toggle("active", idx === this.currentIndex);
    });

    // Đếm số ảnh KHÁC NHAU đã xem (trước đây đếm cả lần mở đầu nên mở khóa sớm)
    this.seenIndexes.add(this.currentIndex);
    if (!this.milestoneTriggered && this.seenIndexes.size >= this.milestoneViews) {
      this.milestoneTriggered = true;
      if (typeof this.onMilestoneReached === "function") this.onMilestoneReached();
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

  setViewMode(mode) {
    this.viewMode = mode;
    const isGrid = mode === "grid";
    this.role("flipStage").classList.toggle("hidden", isGrid);
    this.role("gridStage").classList.toggle("hidden", !isGrid);
    this.role("modeToggleBtn").textContent = isGrid ? "Lật ảnh" : "Xem lưới";
  }

  spawnHearts() {
    const layer = this.role("burstLayer");
    if (!layer) return;
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement("span");
      heart.className = "locket-flying-heart";
      heart.innerHTML = "&hearts;";
      heart.style.left = `${20 + Math.random() * 60}%`;
      heart.style.animationDelay = `${i * 0.07}s`;
      layer.appendChild(heart);
      setTimeout(() => heart.remove(), 1100);
    }
  }

  bindEvents() {
    this.role("prevBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.prevSlide();
    });
    this.role("nextBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.nextSlide();
    });
    this.role("modeToggleBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.setViewMode(this.viewMode === "flip" ? "grid" : "flip");
    });
    this.role("heartBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.spawnHearts();
    });

    // Chạm vào ảnh nhỏ trong lưới -> mở đúng ảnh đó
    this.container.querySelectorAll("[data-jump-idx]").forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentIndex = parseInt(thumb.dataset.jumpIdx, 10);
        this.setViewMode("flip");
        this.updateActiveSlide("next");
      });
    });

    // Vuốt trái/phải để lật ảnh
    const squareCard = this.role("squareCard");
    squareCard.addEventListener("touchstart", (e) => {
      this.touchStartX = e.changedTouches[0].clientX;
      this.touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    squareCard.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) this.nextSlide();
      else this.prevSlide();
    }, { passive: true });
  }
}
