/**
 * MAIN.JS - BỘ ĐIỀU PHỐI TRUNG TÂM (FACADE & STRICT SEQUENTIAL STATE MACHINE)
 * Đảm bảo nguyên tắc: Phải hoàn thành xong thử thách trước mới mở khóa phần tiếp theo.
 */

class RomanticAppController {
  constructor(config) {
    this.config = config;
    this.currentStage = 1;

    // Trạng thái mở khóa tuần tự nghiêm ngặt
    this.pyroBurnCompleted = false;
    this.sealDodgeCount = 0;
    this.stage2WingPhase = "left"; // "left" -> "center" -> "right" -> "done"
    this.quizTrollCount = 0;
    this.unlockedRoomLevel = 1; // 1 -> mở xong phòng 1 mới lên 2 -> mở xong phòng 2 mới lên 3 -> 4 (mở Stage 5)
    this.solvedRooms = new Set();
    this.pyroGameInitialized = false;

    this.initModules();
    this.populateStaticContent();
    this.bindStage1Events();
    this.bindStage2Events();
    this.bindStage3Events();
    this.bindStage4Events();
    this.bindStage5Events();
  }

  initModules() {
    // 1. Không gian 3D Three.js + 2D Canvas Texture
    this.threeScene = new RomanticThreeScene("threeCanvasContainer");

    // 2. Bộ phát nhạc SEVENTEEN (Dynamic Island + SoundCloud Shuffle)
    this.audioPlayer = new SeventeenAudioPlayer(this.config.playlist);

    // 3. Chặng 1A: Trình phát nhạc SoundCloud Waveform + Mâm đĩa than
    this.turntableGame = new VinylTurntableGame({
      playlist: this.config.playlist,
      audioPlayer: this.audioPlayer,
      onTrackInserted: () => {
        if (this.threeScene) this.threeScene.burstHearts(22);
        this.showStage1Subscreen("s1SubCover");
        this.ensurePyroBurnGame();
      }
    });

    // 4. Chặng 2: Đuổi bắt Tiên Linh Trái Tim trên Lịch & Phong bì Air Mail
    const s2Btn = document.getElementById("stage2StepBtn");
    if (s2Btn) s2Btn.classList.add("hidden");

    this.calendarPuzzle = new InteractiveCalendarPuzzle(
      "octoberCalendarGrid",
      "airmailEnvelope",
      "calPuzzleStatus",
      this.config.stage2.calendar,
      {
        onSwitchWing: () => {
          // Khi mở xong phong bì Air Mail ở Cánh 1 -> Cho phép bấm sang Cánh 2 (Tâm Thư)
          if (this.threeScene) this.threeScene.burstHearts(24);
          if (s2Btn && this.stage2WingPhase === "left") {
            s2Btn.textContent = "Đã bắt được Tiên Linh! Đọc Tâm Thư →";
            s2Btn.classList.remove("hidden");
            s2Btn.classList.add("glow-pulse");
          }
        },
        onSolved: () => {
          if (this.threeScene) this.threeScene.burstHearts(32);
        }
      }
    );

    // 5. Locket đoạn 1 ở Cánh Phải của thiệp (Chặng 2)
    this.stage2Locket = new LocketMonthlyMemories(
      "stage2LocketContainer",
      this.config.stage2.locketParts[0],
      {
        onMilestoneReached: () => {
          if (this.calendarPuzzle) {
            this.calendarPuzzle.completeFromWaterfall();
          }
          if (s2Btn && this.stage2WingPhase === "right") {
            this.stage2WingPhase = "done";
            s2Btn.textContent = "Sang giải đố chòm sao →";
            s2Btn.classList.remove("hidden");
            s2Btn.classList.add("glow-pulse");
          }
        }
      }
    );

    // 6. Locket đoạn 2 ở Ấn Ký 02 (Chặng 4)
    this.room2Locket = new LocketMonthlyMemories(
      "room2LocketContainer",
      this.config.stage2.locketParts[1],
      {
        onMilestoneReached: () => {
          if (this.threeScene) this.threeScene.burstHearts(18);
        }
      }
    );

    // 7. Chặng 3: Nối Chòm Sao Định Mệnh Genshin Impact
    this.constellationGame = new StarConstellationGame(
      "constellationCanvas",
      "constellationStatusText",
      () => {
        if (this.threeScene) this.threeScene.burstHearts(35);
        document.getElementById("s3SubConstellation")?.classList.remove("active");
        document.getElementById("s3SubCardQuiz")?.classList.add("active");
      }
    );

    // 8. Chặng 4 - Puzzle Phòng 1: Thám Tử Murdle - Vòng Tròn 5 Bông Hoa Tìm Kẻ Nói Dối
    this.room1Puzzle = new MurdleFlowerCirclePuzzle(
      "murdleFlowerCircle",
      this.config.stage4.room1?.murdleCase,
      "r1ResetBtn",
      () => this.onRoomPuzzleSolved(1)
    );

    // 9. Chặng 4 - Puzzle Phòng 2: Vuốt Ghép Mảnh Ký Ức 3x3 (Dùng ảnh vuông 1:1 không bị méo)
    this.room2Puzzle = new PhotoTileSwapPuzzle(
      "photoTilePuzzleBoard",
      this.config.stage4.room2?.puzzlePhoto || "assets/images/photo_eating.jpg",
      () => this.onRoomPuzzleSolved(2),
      "r2ResetBtn"
    );

    // 10. Chặng 4 - Puzzle Phòng 3: La Bàn Cổ Học Fontaine 3 Vòng Liên Kết
    this.room3Puzzle = new FontaineCompassPuzzle(
      "compassRingsCanvas",
      "r3ResetBtn",
      () => this.onRoomPuzzleSolved(3)
    );
  }

  ensurePyroBurnGame() {
    if (this.pyroGameInitialized) return;
    this.pyroGameInitialized = true;

    setTimeout(() => {
      this.pyroBurnGame = new PyroBurnRevealGame(
        "pyroBurnCanvas",
        "pyroSealOverlay",
        "pyroProgressText",
        () => {
          this.pyroBurnCompleted = true;
          if (this.threeScene) this.threeScene.burstHearts(26);
        }
      );
    }, 60);
  }

  populateStaticContent() {
    // Chặng 1: Dấu sáp & Subtitle tiếng Đức
    const s1Sub = document.getElementById("s1GermanSub");
    if (s1Sub && this.config.stage1?.germanSubtitle) {
      s1Sub.textContent = this.config.stage1.germanSubtitle;
    }

    // Chặng 2: Tâm thư viết tay & Phong bì Air Mail
    const hwBody = document.getElementById("handwrittenLetterText");
    const hwSign = document.getElementById("handwrittenSignText");
    const airSecret = document.getElementById("airmailSecretText");
    if (hwBody && this.config.stage2?.handwrittenLetter) {
      hwBody.textContent = this.config.stage2.handwrittenLetter;
    }
    if (hwSign && this.config.stage2?.handwrittenSign) {
      hwSign.textContent = this.config.stage2.handwrittenSign;
    }
    if (airSecret && this.config.stage2?.airmailSecret) {
      airSecret.innerHTML = this.config.stage2.airmailSecret.replace(/\n/g, "<br />");
    }

    // Chặng 3: Câu hỏi troll mật khẩu
    const quizQ = document.getElementById("trollQuizQuestion");
    const quizCorrect = document.getElementById("trollCorrectBtn");
    const quizWrong = document.getElementById("trollWrongBtn");
    if (quizQ && this.config.stage3?.trollQuestion) {
      quizQ.innerHTML = this.config.stage3.trollQuestion.replace(/\n/g, "<br />");
    }
    if (quizCorrect && this.config.stage3?.correctOption) {
      quizCorrect.textContent = this.config.stage3.correctOption;
    }
    if (quizWrong && this.config.stage3?.trollOption) {
      quizWrong.textContent = this.config.stage3.trollOption;
    }

    // Chặng 4: Lời yêu đa ngôn ngữ (Phòng 1) & Thư tay (Phòng 3)
    const quotesLayer = document.getElementById("multilingualLoveContainer");
    if (quotesLayer && this.config.stage4?.room1?.quotes) {
      quotesLayer.innerHTML = "";
      this.config.stage4.room1.quotes.forEach((q) => {
        const span = document.createElement("span");
        span.className = "love-lang-word";
        span.textContent = q.text;
        span.style.top = q.top;
        span.style.left = q.left;
        span.style.transform = `rotate(${q.rot}deg)`;
        quotesLayer.appendChild(span);
      });
    }

    const r3Body = document.getElementById("room3LetterBody");
    const r3Sign = document.getElementById("room3LetterSign");
    if (r3Body && this.config.stage4?.room3?.letterBody) {
      r3Body.textContent = this.config.stage4.room3.letterBody;
    }
    if (r3Sign && this.config.stage4?.room3?.letterSign) {
      r3Sign.textContent = `${this.config.stage4.room3.letterSign} ♥`;
    }

    // Chặng 5: Vé Ủy Thác Tối Nay & Thông điệp hoàn tất
    const s5Header = document.getElementById("s5HeaderLabel");
    const s5German = document.getElementById("s5GermanGreeting");
    const s5Title = document.getElementById("s5Title");
    const s5Sub = document.getElementById("s5Subtitle");
    const s5Q = document.getElementById("s5Question");
    const s5Accept = document.getElementById("acceptDateBtn");
    const s5Decline = document.getElementById("declineDateBtn");
    const s5Toast = document.getElementById("finalToastText");

    if (s5Header && this.config.stage5?.headerLabel) s5Header.textContent = this.config.stage5.headerLabel;
    if (s5German && this.config.stage5?.germanGreeting) s5German.textContent = this.config.stage5.germanGreeting;
    if (s5Title && this.config.stage5?.title) s5Title.textContent = this.config.stage5.title;
    if (s5Sub && this.config.stage5?.subtitle) s5Sub.textContent = this.config.stage5.subtitle;
    if (s5Q && this.config.stage5?.question) s5Q.textContent = this.config.stage5.question;
    if (s5Accept && this.config.stage5?.acceptBtn) s5Accept.textContent = this.config.stage5.acceptBtn;
    if (s5Decline && this.config.stage5?.declineBtn) s5Decline.textContent = this.config.stage5.declineBtn;
    if (s5Toast && this.config.stage5?.finalToast) s5Toast.textContent = this.config.stage5.finalToast;
  }

  goToStage(stageNum) {
    this.currentStage = stageNum;
    document.querySelectorAll(".stage-screen").forEach((sec, idx) => {
      sec.classList.toggle("active", idx + 1 === stageNum);
    });
  }

  /* ========================================================================
     CHẶNG 1: SOUNDCLOUD VINYL -> ĐỐT PHONG ẤN PYRO -> MỞ DẤU SÁP
     ======================================================================== */
  bindStage1Events() {
    const waxSealBtn = document.getElementById("runawayWaxSeal");
    const trollBubble = document.getElementById("sealTrollBubble");

    if (waxSealBtn) {
      waxSealBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!this.pyroBurnCompleted) return;

        if (this.sealDodgeCount < 2) {
          const offsets = [
            { x: -62, y: -28, rot: -18 },
            { x: 58, y: 24, rot: 22 }
          ];
          const move = offsets[this.sealDodgeCount];
          waxSealBtn.style.transform = `translate(calc(-50% + ${move.x}px), calc(-50% + ${move.y}px)) rotate(${move.rot}deg)`;

          if (trollBubble) {
            trollBubble.textContent = this.config.stage1.sealDodges[this.sealDodgeCount];
            trollBubble.classList.remove("hidden", "pop-anim");
            void trollBubble.offsetWidth;
            trollBubble.classList.add("pop-anim");
          }

          this.sealDodgeCount++;
          return;
        }

        this.showStage1Subscreen("s1SubReaction");
      });
    }

    document.querySelectorAll(".emoji-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const reaction = btn.dataset.reaction;
        if (reaction === "correct") {
          if (this.threeScene) this.threeScene.burstHearts(26);
          this.showStage1Subscreen("s1SubUnlocked");
        } else {
          this.showStage1Subscreen("s1SubWrong");
        }
      });
    });

    document.getElementById("s1TryAgainBtn")?.addEventListener("click", () => {
      this.showStage1Subscreen("s1SubReaction");
    });

    document.getElementById("s1OpenCardBtn")?.addEventListener("click", () => {
      if (this.threeScene) this.threeScene.burstHearts(28);
      this.goToStage(2);
    });
  }

  showStage1Subscreen(subId) {
    document.querySelectorAll(".s1-subscreen").forEach((el) => {
      el.classList.toggle("active", el.id === subId);
    });
  }

  /* ========================================================================
     CHẶNG 2: THIỆP HANDMADE MỞ TUẦN TỰ TỪNG CÁNH (LỊCH -> TÂM THƯ -> LOCKET)
     ======================================================================== */
  bindStage2Events() {
    const trifold = document.getElementById("trifoldCard");
    const stepBtn = document.getElementById("stage2StepBtn");
    const statusEl = document.getElementById("calPuzzleStatus");

    if (stepBtn) {
      stepBtn.addEventListener("click", () => {
        if (this.stage2WingPhase === "left") {
          // Chuyển sang Cánh 2: Tâm Thư Viết Tay
          this.stage2WingPhase = "center";
          if (trifold) trifold.dataset.activeWing = "center";
          if (statusEl) statusEl.textContent = "Đọc thư anh viết cho em, rồi xem Locket nhé.";
          stepBtn.textContent = "Tiếp tục: Xem Locket →";
          return;
        }

        if (this.stage2WingPhase === "center") {
          // Chuyển sang Cánh 3: Locket đoạn 1 (phải lật ít nhất 3 ảnh khác nhau mới hiện nút tiếp)
          this.stage2WingPhase = "right";
          if (trifold) trifold.dataset.activeWing = "right";
          if (statusEl) {
            statusEl.textContent = "Lật xem ít nhất 3 ảnh Locket để mở khóa chặng tiếp theo.";
          }
          if (this.stage2Locket && this.stage2Locket.milestoneTriggered) {
            this.stage2WingPhase = "done";
            stepBtn.textContent = "Sang giải đố chòm sao →";
          } else {
            stepBtn.classList.add("hidden");
          }
          return;
        }

        if (this.stage2WingPhase === "done") {
          if (this.threeScene) this.threeScene.burstHearts(24);
          this.goToStage(3);
        }
      });
    }
  }

  /* ========================================================================
     CHẶNG 3: CHÒM SAO ĐỊNH MỆNH & CÂU HỎI TROLL MẬT KHẨU
     ======================================================================== */
  bindStage3Events() {
    const correctBtn = document.getElementById("trollCorrectBtn");
    const wrongBtn = document.getElementById("trollWrongBtn");

    if (correctBtn) {
      correctBtn.addEventListener("click", () => {
        if (this.threeScene) this.threeScene.burstHearts(30);
        this.goToStage(4);
      });
    }

    if (wrongBtn) {
      wrongBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.quizTrollCount < 2) {
          const shifts = [
            "translate3d(44px, -10px, 0) rotate(5deg)",
            "translate3d(-46px, 8px, 0) rotate(-5deg)"
          ];
          wrongBtn.style.transform = shifts[this.quizTrollCount];
          this.quizTrollCount++;
        } else {
          wrongBtn.style.transform = "translate3d(0, 0, 0)";
          wrongBtn.textContent = this.config.stage3.trollTransformedText;
          wrongBtn.classList.remove("quiz-btn-troll");
          wrongBtn.classList.add("glow-pulse");
          setTimeout(() => {
            if (this.threeScene) this.threeScene.burstHearts(30);
            this.goToStage(4);
          }, 600);
        }
      });
    }
  }

  /* ========================================================================
     CHẶNG 4: 3 ẤN KÝ GIẢI ĐỐ TUẦN TỰ NGHIÊM NGẶT (01 -> 02 -> 03)
     ======================================================================== */
  onRoomPuzzleSolved(roomNum) {
    if (this.threeScene) this.threeScene.burstHearts(35);
    this.solvedRooms.add(roomNum);

    // Ẩn màn giải đố, hiện phần thưởng của phòng đó
    document.getElementById(`room${roomNum}PuzzleView`)?.classList.add("hidden");
    document.getElementById(`room${roomNum}RewardView`)?.classList.remove("hidden");

    // Đánh dấu hoàn thành lên trái tim ở sảnh
    const heartBtn = document.getElementById(`laceHeartBtn${roomNum}`);
    if (heartBtn) heartBtn.classList.add("visited");

    // Mở khóa trái tim tiếp theo (01 mở 02, 02 mở 03)
    if (roomNum === 1 && this.unlockedRoomLevel < 2) {
      this.unlockedRoomLevel = 2;
      const btn2 = document.getElementById("laceHeartBtn2");
      if (btn2) {
        btn2.classList.remove("locked-heart");
        const lbl = btn2.querySelector(".heart-num-label");
        if (lbl) lbl.textContent = "02";
      }
    } else if (roomNum === 2 && this.unlockedRoomLevel < 3) {
      this.unlockedRoomLevel = 3;
      const btn3 = document.getElementById("laceHeartBtn3");
      if (btn3) {
        btn3.classList.remove("locked-heart");
        const lbl = btn3.querySelector(".heart-num-label");
        if (lbl) lbl.textContent = "03";
      }
    }

    const progressText = document.getElementById("s4ProgressText");
    if (progressText) {
      if (this.solvedRooms.size < 3) {
        progressText.textContent = `Đã giải mã ${this.solvedRooms.size}/3 Ấn Ký! Hãy mở tiếp trái tim 0${this.unlockedRoomLevel} nhé ♥`;
      } else {
        progressText.textContent = "Xuất sắc! Em đã giải mã đủ cả 3 Ấn Ký Ký Ức!";
        document.getElementById("toStage5Btn")?.classList.remove("hidden");
      }
    }
  }

  bindStage4Events() {
    const hub = document.getElementById("stage4Hub");
    const progressText = document.getElementById("s4ProgressText");
    const heartBtns = document.querySelectorAll(".lace-heart-item");

    heartBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const roomNum = parseInt(btn.dataset.room, 10);

        // Chặn nếu chưa giải xong trái tim trước đó!
        if (roomNum > this.unlockedRoomLevel) {
          btn.classList.remove("shake-cell");
          void btn.offsetWidth;
          btn.classList.add("shake-cell");
          if (progressText) {
            progressText.textContent = `Phải giải đố xong Ấn Ký 0${this.unlockedRoomLevel} trước thì mới mở được Ấn Ký 0${roomNum} nhé!`;
          }
          return;
        }

        if (hub) hub.classList.remove("active");
        const targetModal = document.getElementById(`scrapbookRoom${roomNum}`);
        if (targetModal) targetModal.classList.add("active");
      });
    });

    document.querySelectorAll(".back-to-hub-btn").forEach((backBtn) => {
      backBtn.addEventListener("click", () => {
        document.querySelectorAll(".s4-room-modal").forEach((m) => m.classList.remove("active"));
        if (hub) hub.classList.add("active");
      });
    });

    document.getElementById("toStage5Btn")?.addEventListener("click", () => {
      if (this.solvedRooms.size < 3) return;
      if (this.threeScene) this.threeScene.burstHearts(40);
      this.goToStage(5);
    });
  }

  /* ========================================================================
     CHẶNG 5: ỦY THÁC HẸN HÒ TỐI NAY (ĐI ĂN & PHOTOBOOTH)
     ======================================================================== */
  bindStage5Events() {
    const acceptBtn = document.getElementById("acceptDateBtn");
    const declineBtn = document.getElementById("declineDateBtn");
    const modal = document.getElementById("finalCelebrationModal");
    const closeBtn = document.getElementById("closeCelebrationBtn");

    if (declineBtn) {
      const dodgeDecline = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const randX = Math.floor(Math.random() * 120) - 60;
        const randY = Math.floor(Math.random() * 64) - 32;
        const randRot = Math.floor(Math.random() * 24) - 12;
        declineBtn.style.transform = `translate3d(${randX}px, ${randY}px, 0) rotate(${randRot}deg)`;
      };

      declineBtn.addEventListener("touchstart", dodgeDecline, { passive: false });
      declineBtn.addEventListener("mouseenter", dodgeDecline);
      declineBtn.addEventListener("click", dodgeDecline);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        if (this.threeScene) this.threeScene.burstHearts(50);
        if (modal) modal.classList.remove("hidden");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (modal) modal.classList.add("hidden");
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.romanticApp = new RomanticAppController(APP_CONFIG);
});
