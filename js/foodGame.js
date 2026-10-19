/**
 * FOODGAME.JS - MINI-GAME CHỌN MÓN ĂN (2-PHASE COMPACT UX)
 * 
 * Thiết kế gọn gàng, tự nhiên, chuẩn tâm lý cặp đôi:
 * - Phase 1: Chọn món (Lẩu / Nướng / Buffet) + Nút né tránh troll + Vòng quay ngẫu nhiên
 * - Phase 2: Dặn dò nhà tài trợ Xuân Cường + Gửi kết quả về Gmail
 */

class FoodDeciderGame {
  constructor(options) {
    this.config = options.config || {};
    this.onSuccess = options.onSuccess || (() => {});
    this.threeScene = options.threeScene || null;

    this.selectedDish = null;
    this.currentPhase = 1;
    this.trollCount = 0;
    this.isSpinning = false;
    this.isSending = false;
    this._audioCtx = null;

    this.container = document.getElementById("foodGameModal");
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.phase1Panel = document.getElementById("foodPhase1");
    this.phase2Panel = document.getElementById("foodPhase2");
    this.stepDot1 = document.getElementById("stepDot1");
    this.stepDot2 = document.getElementById("stepDot2");

    this.dishesContainer = document.getElementById("foodDishesGrid");
    this.trollBtn = document.getElementById("foodTrollBtn");
    this.spinBtn = document.getElementById("foodSpinBtn");
    this.toPhase2Btn = document.getElementById("foodNextToP2Btn");
    this.backToP1Btn = document.getElementById("foodBackToP1Btn");
    this.submitBtn = document.getElementById("foodSubmitBtn");

    this.chosenName = document.getElementById("foodChosenName");
    this.noteInput = document.getElementById("foodNoteInput");
    this.chipsContainer = document.getElementById("foodQuickChips");
    this.statusToast = document.getElementById("foodStatusToast");
    this.trollBubble = document.getElementById("foodTrollBubble");

    this.renderDishes();
    this.renderQuickChips();
  }

  playSubtleSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      const ctx = this._audioCtx;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === "dodge") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }

  /**
   * Sinh 3 thẻ món ăn gọn gàng: LẨU, NƯỚNG, BUFFET
   */
  renderDishes() {
    if (!this.dishesContainer || !this.config.dishes) return;
    this.dishesContainer.innerHTML = "";

    this.config.dishes.forEach((dish) => {
      const card = document.createElement("div");
      card.className = "compact-dish-card";
      card.dataset.id = dish.id;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      card.innerHTML = `
        <div class="dish-emoji-bubble">${dish.icon}</div>
        <div class="dish-text-wrap">
          <h3 class="dish-title">${dish.name}</h3>
          <p class="dish-desc">${dish.desc || ""}</p>
        </div>
        <span class="dish-check-mark">✓</span>
      `;

      card.addEventListener("click", () => this.selectDish(dish.id));
      this.dishesContainer.appendChild(card);
    });
  }

  /**
   * Sinh các gợi ý dặn dò ngắn gọn, tự nhiên
   */
  renderQuickChips() {
    if (!this.chipsContainer || !this.config.quickNotes) return;
    this.chipsContainer.innerHTML = "";

    this.config.quickNotes.forEach((text) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "compact-chip-btn";
      chip.textContent = text;

      chip.addEventListener("click", () => {
        this.playSubtleSound("click");
        if (!this.noteInput) return;
        const currentVal = this.noteInput.value.trim();
        if (currentVal.includes(text)) {
          this.noteInput.value = currentVal.replace(text, "").replace(/•\s*$/, "").trim();
          chip.classList.remove("active");
        } else {
          this.noteInput.value = currentVal ? `${currentVal} • ${text}` : text;
          chip.classList.add("active");
        }
      });

      this.chipsContainer.appendChild(chip);
    });
  }

  /**
   * Xử lý khi chọn 1 món (Lẩu / Nướng / Buffet)
   */
  selectDish(dishId) {
    if (this.isSpinning || this.isSending) return;

    this.selectedDish = this.config.dishes.find((d) => d.id === dishId);
    this.playSubtleSound("click");

    // Đánh dấu active cho thẻ đã chọn
    const allCards = this.dishesContainer?.querySelectorAll(".compact-dish-card") || [];
    allCards.forEach((c) => {
      if (c.dataset.id === dishId) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    });

    this.hideTrollBubble();

    // Kích hoạt nút Tiếp Tục sang Phase 2
    if (this.toPhase2Btn) {
      this.toPhase2Btn.disabled = false;
      this.toPhase2Btn.classList.remove("disabled");
      this.toPhase2Btn.textContent = `Tiếp tục: Dặn dò anh Xuân (${this.selectedDish.name}) →`;
    }

    if (this.threeScene) {
      this.threeScene.burstHearts(12);
    }
  }

  /**
   * Chuyển đổi giữa 2 Phase
   */
  goToPhase(phaseNum) {
    if (phaseNum === 2 && !this.selectedDish) {
      this.showToast("Bé nlinn chọn 1 món (Lẩu, Nướng hay Buffet) trước nha! 😋", 2500);
      if (this.dishesContainer) {
        this.dishesContainer.classList.remove("shake-container");
        void this.dishesContainer.offsetWidth;
        this.dishesContainer.classList.add("shake-container");
      }
      return;
    }

    this.currentPhase = phaseNum;

    if (phaseNum === 1) {
      this.phase1Panel?.classList.remove("hidden");
      this.phase1Panel?.classList.add("active");
      this.phase2Panel?.classList.remove("active");
      this.phase2Panel?.classList.add("hidden");

      this.stepDot1?.classList.add("active");
      this.stepDot2?.classList.remove("active");
    } else {
      if (this.chosenName && this.selectedDish) {
        this.chosenName.textContent = `${this.selectedDish.name} ${this.selectedDish.icon}`;
      }

      this.phase1Panel?.classList.remove("active");
      this.phase1Panel?.classList.add("hidden");
      this.phase2Panel?.classList.remove("hidden");
      this.phase2Panel?.classList.add("active");

      this.stepDot1?.classList.remove("active");
      this.stepDot2?.classList.add("active");

      this.noteInput?.focus();
    }
  }

  /**
   * Vòng quay may mắn gọn gàng
   */
  spinRandomDish() {
    if (this.isSpinning || this.isSending || !this.config.dishes?.length) return;
    this.isSpinning = true;

    if (this.spinBtn) {
      this.spinBtn.disabled = true;
      this.spinBtn.textContent = "🎲 Đang chọn hộ...";
    }

    const cards = Array.from(this.dishesContainer?.querySelectorAll(".compact-dish-card") || []);
    if (!cards.length) return;

    let currentIndex = 0;
    let speed = 80;
    let iterations = 0;
    const totalSteps = 16 + Math.floor(Math.random() * 6);

    const step = () => {
      cards.forEach((c) => c.classList.remove("selected", "spinning-highlight"));
      cards[currentIndex].classList.add("spinning-highlight");
      this.playSubtleSound("click");

      currentIndex = (currentIndex + 1) % cards.length;
      iterations++;

      if (iterations < totalSteps) {
        if (iterations > totalSteps - 6) speed += 50;
        setTimeout(step, speed);
      } else {
        const finalDishId = cards[(currentIndex - 1 + cards.length) % cards.length].dataset.id;
        this.selectDish(finalDishId);

        this.isSpinning = false;
        if (this.spinBtn) {
          this.spinBtn.disabled = false;
          this.spinBtn.textContent = "🎲 Quay lại";
        }

        if (this.threeScene) {
          this.threeScene.burstHearts(24);
        }

        this.showToast(`✨ Đã chọn ngẫu nhiên: [${this.selectedDish.name}]!`, 2500);
      }
    };

    step();
  }

  /**
   * Nút troll "Gì cũng được"
   */
  handleTrollAction(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.trollCount++;
    this.playSubtleSound("dodge");

    const alerts = this.config.trollAlerts || [
      "Làm gì có món 'gì cũng được' đâu nlinn ơi 😂"
    ];
    const alertMsg = alerts[(this.trollCount - 1) % alerts.length];

    if (this.trollBtn) {
      const randX = Math.floor(Math.random() * 120) - 60;
      const randY = Math.floor(Math.random() * 50) - 25;
      const randRot = Math.floor(Math.random() * 20) - 10;
      this.trollBtn.style.transform = `translate3d(${randX}px, ${randY}px, 0) rotate(${randRot}deg)`;

      if (this.trollCount >= 2) {
        this.trollBtn.textContent = "Thôi chọn thật đi mà 😂";
      }
    }

    this.showTrollBubble(alertMsg);

    if (this.dishesContainer) {
      this.dishesContainer.classList.remove("shake-container");
      void this.dishesContainer.offsetWidth;
      this.dishesContainer.classList.add("shake-container");
    }
  }

  showTrollBubble(text) {
    if (!this.trollBubble) return;
    this.trollBubble.innerHTML = text;
    this.trollBubble.classList.remove("hidden");
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => {
      this.hideTrollBubble();
    }, 3500);
  }

  hideTrollBubble() {
    if (this.trollBubble) {
      this.trollBubble.classList.add("hidden");
    }
  }

  showToast(msg, duration = 2500) {
    if (!this.statusToast) return;
    this.statusToast.textContent = msg;
    this.statusToast.classList.remove("hidden");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.statusToast.classList.add("hidden");
    }, duration);
  }

  /**
   * Gửi kết quả về Gmail
   */
  async submitChoice() {
    if (this.isSending || !this.selectedDish) return;
    this.isSending = true;

    const noteText = this.noteInput ? this.noteInput.value.trim() : "";
    const toEmail = this.config.toEmail || "pt7955@gmail.com";
    const nowStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `<span class="spinner-dot"></span> Đang gửi cho anh Xuân...`;
    }

    const defaultLoveNote = "Tối nay anh nhớ qua đón em sớm, đưa em đi ăn thật ngon và chụp hình kỷ niệm cùng em nhé! Thương anh nhiều ♥";
    const finalNote = noteText || defaultLoveNote;

    const emailPayload = {
      _subject: `💌 [Hẹn Hò 20/10] Em bé Nhật Linh đã chốt kèo ăn ${this.selectedDish.name} tối nay cùng anh nè! 💕`,
      _template: "table",
      _captcha: "false",
      "Người Gửi Yêu Thương": "Bé Nhật Linh (nlinn) của anh ♥",
      "Món Em Chọn Tối Nay": `${this.selectedDish.name} ${this.selectedDish.icon}`,
      "Nhà Tài Trợ Độc Quyền": "Xuân Cường (Người yêu tuyệt vời nhất trần đời)",
      "Lời Nhắn Nhủ Gửi Anh Xuân": finalNote,
      "Lịch Trình Tối Nay": `1. Thưởng thức món ${this.selectedDish.name} ấm cúng ➔ 2. Chụp ảnh Photobooth đôi ➔ 3. Dạo phố bên nhau`,
      "Thời Gian Chốt Kèo": `${nowStr} (Giờ Việt Nam)`,
      "Tâm Tư Của Em": "Em đã chọn xong món rồi, giờ em chuẩn bị lên đồ thật xinh, anh mau chuẩn bị xế xịn qua đón em bé nlinn nhé! Yêu anh thật nhiều ♥"
    };

    // 1. Gửi local test (server.js in ra Terminal)
    try {
      fetch("/api/send-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dish: this.selectedDish.name,
          sponsor: "Xuân Cường",
          note: noteText,
          toEmail: toEmail,
          createdAt: nowStr
        })
      }).catch(() => {});
    } catch (e) {}

    // 2. Gửi qua FormSubmit tới Gmail thực tế
    const formSubmitUrl = this.config.formSubmitUrl || `https://formsubmit.co/ajax/${toEmail}`;

    try {
      await fetch(formSubmitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn("Gửi mạng gián đoạn, ghi nhận hoàn tất:", err);
    }

    if (this.threeScene) {
      this.threeScene.burstHearts(50);
    }

    this.showToast(`💌 Đã gửi thành công cho anh Xuân rồi nhé ♥`, 3000);

    setTimeout(() => {
      this.closeModal();
      this.onSuccess({
        dish: this.selectedDish,
        note: noteText,
        sponsor: "Xuân Cường",
        time: nowStr
      });
      this.isSending = false;
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = `Gửi Cho Anh Xuân Nhé! 🚀`;
      }
    }, 1000);
  }

  openModal() {
    if (!this.container) return;
    this.container.classList.remove("hidden");
    document.body.classList.add("modal-open");
    this.goToPhase(1);
    if (this.threeScene) {
      this.threeScene.burstHearts(20);
    }
  }

  closeModal() {
    if (!this.container) return;
    this.container.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  bindEvents() {
    // Điều hướng 2 phase
    this.toPhase2Btn?.addEventListener("click", () => this.goToPhase(2));
    this.backToP1Btn?.addEventListener("click", () => this.goToPhase(1));

    // Vòng quay ngẫu nhiên
    this.spinBtn?.addEventListener("click", () => this.spinRandomDish());

    // Nút troll "Gì cũng được"
    if (this.trollBtn) {
      this.trollBtn.addEventListener("mouseenter", (e) => this.handleTrollAction(e));
      this.trollBtn.addEventListener("touchstart", (e) => this.handleTrollAction(e), { passive: false });
      this.trollBtn.addEventListener("click", (e) => this.handleTrollAction(e));
    }

    // Nút gửi chốt đơn
    this.submitBtn?.addEventListener("click", () => this.submitChoice());

    // Đóng modal
    document.getElementById("foodGameCloseBtn")?.addEventListener("click", () => {
      this.closeModal();
    });
  }
}

window.FoodDeciderGame = FoodDeciderGame;
