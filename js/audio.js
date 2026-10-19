/**
 * AUDIO.JS - BỘ PHÁT NHẠC SEVENTEEN (CHỌN BÀI BAN ĐẦU & RANDOM TIẾP THEO)
 * Áp dụng Single Responsibility Principle (SRP) & Strategy Pattern:
 * Cho phép người yêu chọn 1 bài yêu thích của SEVENTEEN ở đầu trang (hoặc chọn Random),
 * sau đó khi hết bài hoặc bấm Next sẽ phát ngẫu nhiên (Random Shuffle) không trùng lặp bài vừa phát.
 */

class SeventeenAudioPlayer {
  constructor(playlist) {
    this.playlist = playlist || [];
    this.currentIndex = 0;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.isPlaying = false;

    this.toggleBtn = document.getElementById("musicToggleBtn");
    this.nextBtn = document.getElementById("musicNextBtn");
    this.songLabel = document.getElementById("currentSongLabel");
    this.roomSongLabel = document.getElementById("roomSongTitle");

    this.loadTrack(0);
    this.bindEvents();
  }

  loadTrack(index) {
    if (this.playlist.length === 0) return;
    this.currentIndex = (index + this.playlist.length) % this.playlist.length;
    const track = this.playlist[this.currentIndex];
    this.audio.src = track.src;
    this.updateLabels(track);
  }

  updateLabels(track) {
    const text = `SEVENTEEN - ${track.title}`;
    if (this.songLabel) this.songLabel.textContent = text;
    if (this.roomSongLabel) this.roomSongLabel.textContent = text;
  }

  bindEvents() {
    // Khi hết bài hiện tại -> Tự động chuyển sang một bài ngẫu nhiên khác trong playlist
    this.audio.addEventListener("ended", () => {
      this.nextRandomTrack();
    });

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.nextRandomTrack();
      });
    }
  }

  // Chọn 1 bài cụ thể từ bảng chọn đầu trang và phát ngay
  selectAndPlay(index) {
    this.loadTrack(index);
    this.play();
  }

  // Phát ngẫu nhiên 1 bài bất kỳ
  playRandom() {
    if (this.playlist.length === 0) return;
    const randIdx = Math.floor(Math.random() * this.playlist.length);
    this.selectAndPlay(randIdx);
  }

  // Chuyển sang bài ngẫu nhiên tiếp theo (khác bài hiện tại)
  nextRandomTrack() {
    if (this.playlist.length <= 1) {
      this.play();
      return;
    }
    let nextIdx = this.currentIndex;
    while (nextIdx === this.currentIndex) {
      nextIdx = Math.floor(Math.random() * this.playlist.length);
    }
    this.loadTrack(nextIdx);
    this.play();
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.syncUI();
    }).catch(() => {
      this.isPlaying = false;
      this.syncUI();
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.syncUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  syncUI() {
    if (this.toggleBtn) {
      this.toggleBtn.classList.toggle("playing", this.isPlaying);
    }
    const diHud = document.getElementById("dynamicIslandHud");
    if (diHud) {
      diHud.classList.toggle("is-playing", this.isPlaying);
    }
    document.querySelectorAll(".spinning-vinyl").forEach((disk) => {
      disk.classList.toggle("paused", !this.isPlaying);
    });
  }
}
