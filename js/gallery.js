/**
 * GALLERY.JS - QUẢN LÝ ALBUM KỶ NIỆM VÀ SLIDESHOW
 * Hỗ trợ cả nút bấm Next/Prev và cử chỉ vuốt chạm (Swipe Touch) trên điện thoại di động.
 */

class CarouselGallery {
  constructor(trackId, indicatorsId, slidesData) {
    this.track = document.getElementById(trackId);
    this.indicatorsContainer = document.getElementById(indicatorsId);
    this.slidesData = slidesData || [];
    this.currentIndex = 0;

    this.prevBtn = document.getElementById("prevSlide");
    this.nextBtn = document.getElementById("nextSlide");

    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    if (!this.track || this.slidesData.length === 0) return;

    this.renderSlides();
    this.renderIndicators();
    this.bindEvents();
    this.updateSlidePosition();
  }

  renderSlides() {
    this.track.innerHTML = "";
    this.slidesData.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      slide.innerHTML = `
        <div class="slide-img-wrapper">
          <img src="${item.url}" alt="Kỷ niệm" loading="lazy">
        </div>
        <p class="slide-caption">${item.caption}</p>
      `;
      this.track.appendChild(slide);
    });
  }

  renderIndicators() {
    if (!this.indicatorsContainer) return;
    this.indicatorsContainer.innerHTML = "";
    this.slidesData.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = `indicator ${idx === 0 ? "active" : ""}`;
      dot.addEventListener("click", () => this.goToSlide(idx));
      this.indicatorsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.next());
    }

    // Hỗ trợ cảm ứng vuốt trên màn hình điện thoại
    this.track.addEventListener("touchstart", (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener("touchend", (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const swipeThreshold = 40; // Khoảng cách tối thiểu tính là 1 lần vuốt
    if (this.touchEndX < this.touchStartX - swipeThreshold) {
      this.next(); // Vuốt sang trái -> xem ảnh tiếp
    }
    if (this.touchEndX > this.touchStartX + swipeThreshold) {
      this.prev(); // Vuốt sang phải -> xem ảnh trước
    }
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlidePosition();
  }

  next() {
    if (this.currentIndex < this.slidesData.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Quay về ảnh đầu tiên
    }
    this.updateSlidePosition();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.slidesData.length - 1; // Nhảy đến ảnh cuối cùng
    }
    this.updateSlidePosition();
  }

  updateSlidePosition() {
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // Cập nhật trạng thái chấm indicator
    if (this.indicatorsContainer) {
      const dots = this.indicatorsContainer.querySelectorAll(".indicator");
      dots.forEach((dot, idx) => {
        if (idx === this.currentIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }
  }
}
