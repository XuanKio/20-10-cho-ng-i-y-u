/**
 * CONFIG.JS - TẬP TRUNG TOÀN BỘ DỮ LIỆU CỦA TRANG WEB
 * Tuân thủ Single Responsibility Principle (SRP) & Open/Closed Principle (OCP):
 * Tách biệt hoàn toàn dữ liệu cấu hình khỏi logic xử lý.
 */

const APP_CONFIG = {
  // Số tim kỷ niệm hiển thị đồng nhất cho mọi bài hát trên trình phát nhạc SoundCloud
  defaultTrackLikes: "22.4K",

  // 1. Playlist 7 bài hát lãng mạn hay nhất của SEVENTEEN (Đã thêm Run to You & Fallin' Flower)
  playlist: [
    {
      id: 0,
      title: "Darl+ing",
      artist: "SEVENTEEN",
      vibe: "Ngọt ngào, ấm áp",
      likes: "22.4K",
      src: "assets/audio/seventeen_1.m4a"
    },
    {
      id: 1,
      title: "Run to You",
      artist: "SEVENTEEN",
      vibe: "Chạy ngay đến bên em",
      likes: "22.4K",
      src: "assets/audio/seventeen_6.m4a"
    },
    {
      id: 2,
      title: "Fallin' Flower",
      artist: "SEVENTEEN",
      vibe: "Cánh hoa rơi lãng mạn",
      likes: "22.4K",
      src: "assets/audio/seventeen_7.m4a"
    },
    {
      id: 3,
      title: "To You",
      artist: "SEVENTEEN",
      vibe: "Rung động, dịu dàng",
      likes: "22.4K",
      src: "assets/audio/seventeen_2.m4a"
    },
    {
      id: 4,
      title: "Same Dream, Same Mind, Same Night",
      artist: "SEVENTEEN",
      vibe: "Lãng mạn đêm thu",
      likes: "22.4K",
      src: "assets/audio/seventeen_3.m4a"
    },
    {
      id: 5,
      title: "Pretty U",
      artist: "SEVENTEEN",
      vibe: "Đáng yêu, tươi sáng",
      likes: "22.4K",
      src: "assets/audio/seventeen_4.m4a"
    },
    {
      id: 6,
      title: "_WORLD",
      artist: "SEVENTEEN",
      vibe: "Thế giới của đôi ta",
      likes: "22.4K",
      src: "assets/audio/seventeen_5.m4a"
    }
  ],

  // 2. Chặng 1: Nhét đĩa than SEVENTEEN -> Đốt cháy phong ấn Pyro -> Mở phong bì tiếng Đức
  stage1: {
    burnPromptTitle: "Phong Ấn Nguyên Tố Hỏa",
    burnPromptSub: "Chạm và xoa ngón tay như ngọn lửa Pyro để đốt cháy lớp giấy niêm phong cổ...",
    germanTitle: "Für meine Liebste",
    germanSubtitle: "Ich hab da was ganz Besonderes für dich...",
    vietHint: "(Chạm vào dấu sáp hồng để mở niêm phong)",
    sealDodges: [
      "Khoan đã! Hôm nay mới mở quà 20/10 sớm mà vội thế à?",
      "Trượt rồi nhé lêu lêu! Chạm chuẩn vào dấu sáp lần nữa xem nào!"
    ],
    reactionPrompt: "Don’t open it yet.\nLet me see your reaction first!",
    wrongReactionTitle: "Ơ kìa, sao lại làm mặt đấy?",
    wrongReactionSub: "Nhận quà 20/10 sớm mà mặt căng thế! Phải chọn biểu cảm đáng yêu nhất mới kích hoạt Phản Ứng Nguyên Tố mở khóa nhé!",
    tryAgainBtn: "Thử lại ngay",
    unlockedTitle: "Open it and find out.\nIt's all for you!",
    unlockedSub: "Alles Liebe zum Frauentag im Voraus ♥"
  },

  // 3. Chặng 2: Thiệp Handmade Vintage 3 khúc & Giải đố đuổi bắt Tiên Linh Trái Tim (Seelie Chase)
  stage2: {
    puzzleHint: "Nhiệm vụ Tiên Linh (0/3): Hãy chạm vào Trái Tim Đỏ ngày 20/10 trên tờ lịch!",
    trollMessages: [
      "Bước 1/3: Ủa hôm nay anh tặng quà sớm mà! Tiên Linh Trái Tim nhảy sang ngày 19 rồi kìa, bắt lấy nó!",
      "Bước 2/3: Nó bay trốn vào chiếc phong bì London Air Mail bên dưới rồi, chạm vào phong bì đi!",
      "Bước 3/3: Tiên Linh đã bay sang Cánh Phải (3. Locket)! Hãy lật xem ảnh Locket để đưa Tiên Linh về đích nhé!",
      "Hoàn thành! Tiên Linh Trái Tim đã ghim cố định vào ngày 20/10 ♥ Đã mở khóa cổng Chặng 3!"
    ],
    calendar: {
      monthName: "October",
      startDayOfWeek: 4, // Thứ Năm
      totalDays: 31,
      specialDay: 20
    },
    airmailSecret: "Für meine süße Freundin ♥\nChúc cô gái của anh một mùa 20/10 sớm thật hạnh phúc!",
    handwrittenLetter:
`Alles Liebe zum Frauentag!
Chúc em một mùa 20/10 sớm thật ý nghĩa và tràn đầy kỷ niệm vui. Mong rằng mỗi ngày trôi qua sẽ mang đến cho em thật nhiều sức khỏe, niềm vui và may mắn. Những điều em mong ước sẽ dần trở thành hiện thực và mỗi khoảnh khắc bên nhau đều là một ngày đáng nhớ. Hãy luôn mỉm cười rạng rỡ em nhé!`,
    handwrittenSign: "Dein Xuân ♥",

    // Locket chia thành 2 đoạn: đoạn 1 xem ở thiệp (Chặng 2), đoạn 2 xem ở Ấn Ký 02 (Chặng 4)
    locketParts: [
      [
        { type: "image", url: "assets/images/photo_helmet.jpg", day: "02 Th10" },
        { type: "image", url: "assets/images/photo_cat_booth.jpg", day: "05 Th10" },
        { type: "image", url: "assets/images/photo_gametopia.jpg", day: "08 Th10" },
        { type: "image", url: "assets/images/photo_flight_booth.jpg", day: "11 Th10" },
        { type: "image", url: "assets/images/photo_heart_hands.jpg", day: "14 Th10" },
        { type: "image", url: "assets/images/photo_pillow.jpg", day: "16 Th10" }
      ],
      [
        { type: "image", url: "assets/images/photo_eating.jpg", day: "17 Th10" },
        { type: "image", url: "assets/images/photo_gaming.jpg", day: "18 Th10" },
        { type: "image", url: "assets/images/photo_parking.jpg", day: "19 Th10" },
        { type: "image", url: "assets/images/photo_pinching_cheek.jpg", day: "20 Th10" },
        { type: "video", url: "assets/videos/video_1.mp4", poster: "assets/images/photo_helmet.jpg", day: "Video 1" },
        { type: "video", url: "assets/videos/video_2.mp4", poster: "assets/images/photo_cat_booth.jpg", day: "Video 2" }
      ]
    ]
  },

  // 4. Chặng 3: Giải đố Gỡ Rối Dây Tơ Hồng (Untangle Heart) + Thiệp Ren & Câu Hỏi Troll
  stage3: {
    untangleTitle: "Gỡ Rối Dây Tơ Hồng",
    untangleSub: "Chạm và kéo các ngôi sao sao cho không còn sợi dây nào cắt chéo nhau để thắp sáng Chòm Sao Trái Tim!",
    untanglePuzzle: {
      width: 320,
      height: 250,
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
        [0, 3], [0, 2], [0, 4]
      ],
      goalNodes: [
        { id: 0, x: 160, y: 78, label: "Tâm Giao" },
        { id: 1, x: 100, y: 46, label: "Sao Mai" },
        { id: 2, x: 50,  y: 118, label: "Duyên Nợ" },
        { id: 3, x: 160, y: 220, label: "Chân Tình" },
        { id: 4, x: 270, y: 118, label: "Nguyện Ước" },
        { id: 5, x: 220, y: 46, label: "Tri Kỷ" }
      ],
      // Vị trí xáo trộn ban đầu (tạo đúng 4 nút thắt giao nhau):
      scrambledNodes: [
        { id: 0, x: 100, y: 46, label: "Tâm Giao" },
        { id: 1, x: 160, y: 78, label: "Sao Mai" },
        { id: 2, x: 50,  y: 118, label: "Duyên Nợ" },
        { id: 3, x: 270, y: 118, label: "Chân Tình" },
        { id: 4, x: 160, y: 220, label: "Nguyện Ước" },
        { id: 5, x: 220, y: 46, label: "Tri Kỷ" }
      ]
    },
    cardTitle: "Happy 20/10",
    cardDate: "20 . 10 . 2026",
    cardPhoto: "assets/images/photo_glasses_cute.jpg",
    trollQuestion: "Câu hỏi bảo mật cuối để mở 3 Ấn Ký:\nAi là người chiều chuộng và thương em nhất?",
    correctOption: "Chắc chắn là anh Xuân rồi ♥",
    trollOption: "Hông biết đâu",
    trollTransformedText: "Vẫn là anh Xuân chứ ai nữa! ♥"
  },

  // 5. Chặng 4: "Choose One" - Giải đố kích hoạt 3 Ấn Ký Trái Tim Ren (Canva Page 5, 6, 7, 8)
  stage4: {
    title: "Choose one",
    subtitle: "Khám phá đủ 3 mảnh ghép ký ức để thắp sáng 3 Ấn Ký Nguyên Tố mở khóa lịch trình tối nay!",

    // Phòng 1: Giải đố Thám Tử Murdle (Vòng tròn 5 bông hoa - Tìm 1 bông hoa nói dối) -> Mở Bó hoa hồng
    room1: {
      murdleCase: {
        suspects: [
          {
            id: 0,
            seat: "1",
            photo: "assets/flowers/rose.jpg",
            focus: "50% 45%",
            name: "Hoa Hồng",
            neighbors: "Ngồi cạnh Oải Hương (5) và Tulip (2)",
            statement: "“Kẻ nói dối không phải là tôi, và cũng không ngồi ngay cạnh tôi.”",
            isLiar: false,
            wrongReason: "Chưa đúng. Nếu Hoa Hồng nói dối thì Hướng Dương và Anh Đào đều phải nói thật, nhưng hai bông này đang tố nhau."
          },
          {
            id: 1,
            seat: "2",
            photo: "assets/flowers/tulip.jpg",
            focus: "50% 40%",
            name: "Tulip",
            neighbors: "Ngồi cạnh Hoa Hồng (1) và Hướng Dương (3)",
            statement: "“Đúng một trong hai bông ngồi cạnh tôi (Hoa Hồng hoặc Hướng Dương) đang nói dối.”",
            isLiar: false,
            wrongReason: "Chưa đúng. Hướng Dương và Anh Đào tố nhau nên kẻ nói dối nằm trong hai bông đó, vậy Tulip đang nói thật."
          },
          {
            id: 2,
            seat: "3",
            photo: "assets/flowers/sunflower.jpg",
            focus: "50% 38%",
            name: "Hướng Dương",
            neighbors: "Ngồi cạnh Tulip (2) và Anh Đào (4)",
            statement: "“Anh Đào ngồi cạnh tôi mới là kẻ đang nói dối.”",
            isLiar: true,
            solvedReason: "Chính xác! Hướng Dương và Anh Đào tố nhau nên Hoa Hồng, Tulip, Oải Hương đều nói thật. Theo lời Tulip và Hoa Hồng thì Hướng Dương là kẻ nói dối."
          },
          {
            id: 3,
            seat: "4",
            photo: "assets/flowers/cherry.jpg",
            focus: "50% 22%",
            name: "Anh Đào",
            neighbors: "Ngồi cạnh Hướng Dương (3) và Oải Hương (5)",
            statement: "“Hướng Dương đang vu khống tôi. Kẻ nói dối ngồi cạnh Tulip cơ.”",
            isLiar: false,
            wrongReason: "Chưa đúng. Nếu Anh Đào nói dối thì Tulip phải nói thật, nhưng Tulip khẳng định kẻ nói dối ngồi cạnh Tulip, không phải Anh Đào."
          },
          {
            id: 4,
            seat: "5",
            photo: "assets/flowers/lavender.jpg",
            focus: "30% 40%",
            name: "Oải Hương",
            neighbors: "Ngồi cạnh Anh Đào (4) và Hoa Hồng (1)",
            statement: "“Tôi và Hoa Hồng ngồi cạnh tôi đều trung thực.”",
            isLiar: false,
            wrongReason: "Chưa đúng. Giữa Hướng Dương và Anh Đào chắc chắn có một kẻ nói dối vì họ tố nhau, nên Oải Hương không thể là kẻ nói dối."
          }
        ]
      },
      photos: [
        "assets/images/photo_heart_hands.jpg",
        "assets/images/photo_pinching_cheek.jpg",
        "assets/images/photo_pillow.jpg"
      ],
      quotes: [
        { text: "Ich liebe dich", top: "4%", left: "6%", rot: -16 },
        { text: "Aishiteru", top: "2%", left: "42%", rot: 4 },
        { text: "Te amo", top: "5%", left: "72%", rot: 14 },
        { text: "Je t’aime", top: "22%", left: "3%", rot: -20 },
        { text: "S’agapo", top: "20%", left: "76%", rot: 18 },
        { text: "Saranghae", top: "50%", left: "3%", rot: -14 },
        { text: "Wo ai ni", top: "52%", left: "75%", rot: 14 },
        { text: "I love you", top: "80%", left: "6%", rot: 10 },
        { text: "Für immer", top: "80%", left: "68%", rot: -12 }
      ]
    },

    // Phòng 2: Ảnh vuông 1:1 (1440x1440) không bị méo hình cho trò chơi Vuốt Ghép Tranh 3x3
    room2: {
      puzzlePhoto: "assets/images/photo_eating.jpg"
    },

    // Phòng 3: Giấy thư viền răng cưa & Dây chuyền trái tim lồng ảnh 2 đứa (Canva Page 8)
    room3: {
      letterBody:
`Für meine Liebste,
Vậy là lại thêm một dịp đặc biệt nữa anh được ở bên cạnh em. Hôm nay anh làm chiếc web nhỏ này để chúc mừng 20/10 sớm cô gái của anh!

Cảm ơn em vì đã luôn ở bên anh, từ những lúc cùng nhau đi ăn, đi chụp photobooth nhắng nhít, những buổi ngồi net chơi game cùng nhau, cho đến những khoảnh khắc bình yên nhất. Không cần những lời hoa mỹ, chỉ cần em biết rằng với anh, em luôn là ngoại lệ đẹp đẽ nhất.

Chúc em luôn rạng rỡ, hạnh phúc, bớt dỗi anh lại một xíu và cười thật tươi mỗi ngày nhé.
Ich liebe dich über alles! ♥`,
      letterSign: "Xuân"
    }
  },

  // 6. Chặng 5: Ủy Thác Đặc Biệt Tối Nay - Đi Ăn & Chụp Photobooth
  stage5: {
    headerLabel: "DAILY COMMISSION • 20/10 EARLY PASS",
    germanGreeting: "Ein kleiner Plan für heute Abend",
    title: "Ủy Thác Tối Nay Của Đôi Ta",
    subtitle: "Không cần nhìn đồng hồ, chỉ cần em lên đồ thật xinh!",
    question: "Em đã sẵn sàng nhận Ủy Thác đi chơi tối nay cùng anh chưa?",
    acceptBtn: "Chốt kèo luôn! ♥",
    declineBtn: "Ở nhà ngủ cơ",
    finalToast: "Ủy thác hoàn tất! Tối nay anh qua đón công chúa đi ăn ngon và chụp photobooth nhé ♥"
  }
};
