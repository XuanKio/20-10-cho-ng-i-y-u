const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Bật CORS cho mọi request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // API Endpoint ghi nhận kết quả chọn món ăn của bé nlinn khi test Localhost
  if (req.method === 'POST' && urlPath === '/api/send-choice') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        console.log('\n========================================================');
        console.log('💌 [NHẬN THÔNG BÁO HẸN HÒ TỪ BÉ NLINN - THIỆP 20/10]');
        console.log(`⏰ Thời gian: ${now}`);
        console.log(`🍲 Món em đã chọn: ${data.dish || 'Chưa rõ'}`);
        console.log(`✨ Nhà tài trợ: Xuân Cường`);
        console.log(`💬 Lời nhắn tình cảm của nlinn: ${data.note || 'Tối nay qua đón em đi ăn ngon nhé anh iu ♥'}`);
        console.log(`📧 Gửi tới Gmail: ${data.toEmail || 'pt7955@gmail.com'}`);
        console.log('💕 Mau chuẩn bị xế xịn qua đón công chúa thôi nào anh Xuân ơi!');
        console.log('========================================================\n');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Đã nhận thông báo của bé nlinn thành công!',
          receivedAt: now,
          data
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Dữ liệu JSON không hợp lệ' }));
      }
    });
    return;
  }

  let reqPath = decodeURI(urlPath);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const range = req.headers.range;

    // Hỗ trợ HTTP Range Requests để iOS Safari (iPhone 17 Pro) tua và phát nhạc .m4a / video .mp4 mượt mà
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
