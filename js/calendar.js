/**
 * CALENDAR.JS - MODULE GIẢI ĐỐ ĐUỔI BẮT TIÊN LINH TRÁI TIM (GENSHIN SEELIE CHASE)
 * Áp dụng State Pattern (Mẫu thiết kế Trạng thái):
 * Quản lý hành trình đuổi bắt Tiên Linh Trái Tim qua tờ lịch Tháng 10, Phong bì Air Mail và bộ lật ảnh Waterfall.
 */

class InteractiveCalendarPuzzle {
  constructor(gridId, envelopeId, statusId, config, callbacks = {}) {
    this.grid = document.getElementById(gridId);
    this.envelope = document.getElementById(envelopeId);
    this.statusBanner = document.getElementById(statusId);
    this.config = config;
    this.onSwitchWing = callbacks.onSwitchWing;
    this.onSolved = callbacks.onSolved;

    // 0: Trái tim ở ngày 20 (chưa chạm)
    // 1: Chạm ngày 20 -> Trái tim nhảy sang ngày 19 (quà sớm!)
    // 2: Chạm ngày 19 -> Trái tim bay xuống Phong bì Air Mail
    // 3: Chạm Phong bì -> Trái tim bay sang Cánh Phải (Lật ảnh Waterfall)
    // 4: Đã lật ảnh -> Trái tim quay về ghim cố định vào ngày 20 & Mở khóa!
    this.step = 0;
    this.dayCells = {};

    this.init();
  }

  init() {
    if (!this.grid) return;
    this.renderCalendar();
    this.bindEnvelope();
  }

  renderCalendar() {
    this.grid.innerHTML = "";
    this.dayCells = {};

    for (let i = 0; i < this.config.startDayOfWeek; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-cell empty";
      this.grid.appendChild(empty);
    }

    for (let day = 1; day <= this.config.totalDays; day++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.dataset.day = day;
      cell.innerHTML = `<span class="day-num">${day}</span>`;

      if (day === 20) {
        cell.classList.add("has-heart", "heart-wiggle");
      }

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleDayClick(day, cell);
      });

      this.grid.appendChild(cell);
      this.dayCells[day] = cell;
    }
  }

  handleDayClick(day, cell) {
    if (this.step >= 3) return;

    if (this.step === 0 && day === 20) {
      this.dayCells[20].classList.remove("has-heart", "heart-wiggle");
      this.dayCells[19].classList.add("has-heart", "heart-wiggle");
      this.step = 1;
      this.updateStatus(APP_CONFIG.stage2.trollMessages[0]);
      return;
    }

    if (this.step === 1 && day === 19) {
      this.dayCells[19].classList.remove("has-heart", "heart-wiggle");
      if (this.envelope) {
        this.envelope.classList.add("has-runaway-heart");
      }
      this.step = 2;
      this.updateStatus(APP_CONFIG.stage2.trollMessages[1]);
      return;
    }

    cell.classList.remove("shake-cell");
    void cell.offsetWidth;
    cell.classList.add("shake-cell");
  }

  bindEnvelope() {
    if (!this.envelope) return;
    this.envelope.addEventListener("click", (e) => {
      e.stopPropagation();
      this.envelope.classList.toggle("is-open");

      if (this.step === 2) {
        this.envelope.classList.remove("has-runaway-heart");
        this.envelope.classList.add("is-open");
        this.step = 3;
        this.updateStatus(APP_CONFIG.stage2.trollMessages[2]);

        // Tự động gợi ý hoặc chuyển qua tab Lật Ảnh sau 1.4s để người yêu dễ thấy
        setTimeout(() => {
          if (typeof this.onSwitchWing === "function") {
            this.onSwitchWing("right");
          }
        }, 1400);
      }
    });
  }

  // Được gọi khi người yêu lật ảnh ở Cánh Phải
  completeFromWaterfall() {
    if (this.step === 4) return;
    if (this.dayCells[19]) this.dayCells[19].classList.remove("has-heart", "heart-wiggle");
    if (this.envelope) this.envelope.classList.remove("has-runaway-heart");
    if (this.dayCells[20]) {
      this.dayCells[20].classList.add("has-heart", "is-pinned");
      this.dayCells[20].classList.remove("heart-wiggle");
    }
    this.step = 4;
    this.updateStatus(APP_CONFIG.stage2.trollMessages[3], true);

    if (typeof this.onSolved === "function") {
      this.onSolved();
    }
  }

  updateStatus(message, isSuccess = false) {
    if (!this.statusBanner) return;
    this.statusBanner.textContent = message;
    this.statusBanner.classList.remove("pop-anim");
    void this.statusBanner.offsetWidth;
    this.statusBanner.classList.add("pop-anim");
    if (isSuccess) {
      this.statusBanner.classList.add("solved");
    }
  }
}
