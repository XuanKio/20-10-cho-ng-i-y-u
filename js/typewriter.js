/**
 * TYPEWRITER.JS - HIỆU ỨNG MÁY ĐÁNH CHỮ CHO BỨC THƯ TÌNH
 * Chịu trách nhiệm hiển thị văn bản xuất hiện từng ký tự một cách tự nhiên.
 */

class TypewriterEffect {
  constructor(targetElementId, text, speed = 40, onComplete = null) {
    this.element = document.getElementById(targetElementId);
    this.text = text;
    this.speed = speed;
    this.onComplete = onComplete;
    this.currentIndex = 0;
    this.timeoutId = null;
    this.isFinished = false;
  }

  start() {
    if (!this.element) return;
    this.element.innerHTML = "";
    this.currentIndex = 0;
    this.isFinished = false;

    // Tạo con trỏ nhấp nháy
    this.cursor = document.createElement("span");
    this.cursor.className = "typewriter-cursor";
    this.cursor.innerHTML = "&nbsp;";
    this.element.appendChild(this.cursor);

    this.typeNextChar();
  }

  typeNextChar() {
    if (this.currentIndex < this.text.length) {
      const char = this.text.charAt(this.currentIndex);
      // Chèn ký tự trước con trỏ
      const textNode = document.createTextNode(char);
      this.element.insertBefore(textNode, this.cursor);
      this.currentIndex++;

      // Tăng một chút độ trễ ngẫu nhiên khi gặp dấu chấm hoặc phẩy để tạo cảm giác tự nhiên như người đang gõ
      let delay = this.speed;
      if (char === "." || char === "!" || char === "?") {
        delay = this.speed * 8;
      } else if (char === "," || char === "\n") {
        delay = this.speed * 4;
      }

      this.timeoutId = setTimeout(() => this.typeNextChar(), delay);
    } else {
      this.isFinished = true;
      if (typeof this.onComplete === "function") {
        this.onComplete();
      }
    }
  }

  // Cho phép người dùng chạm để hiện ngay toàn bộ nội dung nếu không muốn chờ
  skip() {
    if (this.isFinished) return;
    clearTimeout(this.timeoutId);
    this.element.innerHTML = this.text;
    this.element.appendChild(this.cursor);
    this.isFinished = true;
    if (typeof this.onComplete === "function") {
      this.onComplete();
    }
  }
}
