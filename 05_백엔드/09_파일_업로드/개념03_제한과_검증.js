// ============================================================
// 09단원 · 개념 03 — 제한과 검증
// ------------------------------------------------------------
// 실행: node 개념03_제한과_검증.js
//       끄려면 Ctrl + C
// ============================================================
//
// 업로드는 서버에서 가장 위험한 입구입니다.
//
//   · 500MB 파일 몇 개면 디스크가 찹니다
//   · 실행 파일을 올려 두고 그 주소를 열면 서버에서 실행될 수도 있습니다
//   · 파일 이름에 ../ 를 넣어 서버 파일을 덮어쓸 수 있습니다
//
// 그래서 "무엇을, 얼마나, 어떤 이름으로" 를 전부 정해 둬야 합니다.

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const 업로드폴더 = path.join(__dirname, "uploads");
fs.mkdirSync(업로드폴더, { recursive: true });

// 09단원 내내 쓸 도우미입니다. (개념02 섹션 5)
function 이름되돌리기(이름) {
  return Buffer.from(이름, "latin1").toString("utf8");
}


// ── 섹션 1: 날짜별 폴더에 저장하기 ──

// 한 폴더에 파일이 십만 개 쌓이면 열어 보기도 힘듭니다.
// 날짜로 나눠 두면 찾기도 쉽고, 오래된 것을 지우기도 쉽습니다.

function 오늘폴더() {
  const 지금 = new Date();
  const 년 = 지금.getFullYear();
  const 월 = String(지금.getMonth() + 1).padStart(2, "0");

  const 폴더 = path.join(업로드폴더, String(년), 월);
  fs.mkdirSync(폴더, { recursive: true }); // ★ 그 달의 첫 업로드에서 폴더를 만듭니다

  return 폴더;
}

// ★ 02단원 연습문제 13·15 에서 만든 그 함수입니다.
//   "저장하기 직전에 항상 mkdirSync 를 부르라" 고 했던 이유가 여기 있습니다.

const 저장방식 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 오늘폴더());
  },

  filename: (req, file, cb) => {
    const 원래이름 = 이름되돌리기(file.originalname);
    const 확장자 = path.extname(원래이름).toLowerCase();
    const 고유값 = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${고유값}${확장자}`);
  },
});


// ── 섹션 2: 확장자 검사 (fileFilter) ──

const 허용확장자 = [".jpg", ".jpeg", ".png", ".gif", ".pdf"];

function 확장자검사(req, file, cb) {
  const 원래이름 = 이름되돌리기(file.originalname);
  const 확장자 = path.extname(원래이름).toLowerCase();

  if (!허용확장자.includes(확장자)) {
    // ★ cb(에러) 를 부르면 그 파일은 저장되지 않습니다.
    //   에러는 우리 에러 처리기로 갑니다.
    const 에러 = new Error(`${확장자 || "확장자 없는 파일"} 은(는) 올릴 수 없습니다`);
    에러.status = 400;
    에러.code = "BAD_EXTENSION";
    return cb(에러);
  }

  cb(null, true); // 통과
}

// ★★ fileFilter 안에서도 이름을 되돌려야 합니다.
//   안 하면 한글 이름 파일의 확장자를 못 읽어서 전부 거절됩니다.
//   "영어 파일은 되는데 한글 파일만 거절돼요" 의 원인입니다.
//
// ★ 허용 목록 방식으로 쓰세요.
//   "이건 안 됨" 목록(.exe, .bat ...)은 빠뜨리는 게 반드시 생깁니다.
//   "이것만 됨" 목록은 빠뜨려도 안전한 쪽으로 틀립니다.


// ── 섹션 3: 용량과 개수 제한 ──

const 업로드 = multer({
  storage: 저장방식,
  fileFilter: 확장자검사,
  limits: {
    fileSize: 100, // 시험용으로 100 바이트. 실제로는 5 * 1024 * 1024 처럼 씁니다
    files: 2, // 한 번에 두 개까지
    fields: 10, // 글자 필드 개수
    fieldNameSize: 100, // 필드 이름 길이
  },
});

app.post("/upload", 업로드.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "NO_FILE", message: "파일이 없습니다" } });
  }

  res.status(201).json({
    data: {
      원래이름: 이름되돌리기(req.file.originalname),
      크기: req.file.size,
      저장위치: path.relative(업로드폴더, req.file.path).replace(/\\/g, "/"),
    },
  });
});

// 확인: POST /upload multipart:@file=작업표준서.pdf:50
// 응답: 201

// 확인: POST /upload multipart:@file=큰파일.pdf:500
// 응답: 400 {"error":{"code":"LIMIT_FILE_SIZE","message":"파일이 너무 큽니다 (최대 100바이트)","field":"file"}}

// 확인: POST /upload multipart:@file=악성.exe:10
// 응답: 400 {"error":{"code":"BAD_EXTENSION","message":".exe 은(는) 올릴 수 없습니다"}}

// 확인: POST /upload multipart:@file=이름없음:10
// 응답: 400 {"error":{"code":"BAD_EXTENSION","message":"확장자 없는 파일 은(는) 올릴 수 없습니다"}}

// 확인: POST /upload
// 응답: 400 {"error":{"code":"NO_FILE","message":"파일이 없습니다"}}

// ★ 실제 서비스에서 쓰는 값
//     fileSize: 5 * 1024 * 1024      사진 5MB
//     fileSize: 20 * 1024 * 1024     문서 20MB
//
//   숫자를 그대로 5242880 이라고 쓰지 마세요. 읽는 사람이 계산해야 합니다.
//   5 * 1024 * 1024 로 쓰면 한눈에 보입니다.


// ── 섹션 4: 여러 개 올릴 때 ──

app.post("/upload-many", 업로드.array("files", 2), (req, res) => {
  res.status(201).json({
    data: {
      개수: req.files.length,
      이름들: req.files.map((f) => 이름되돌리기(f.originalname)),
    },
  });
});

// 확인: POST /upload-many multipart:@files=a.pdf:10&@files=b.png:10
// 응답: 201 {"data":{"개수":2,"이름들":["a.pdf","b.png"]}}

// 확인: POST /upload-many multipart:@files=a.pdf:10&@files=b.png:10&@files=c.pdf:10
// 응답: 400 {"error":{"code":"LIMIT_FILE_COUNT","message":"파일이 너무 많습니다"}}

// ★ array("필드", 최대개수) 의 최대개수와 limits.files 는 둘 다 있어야 안전합니다.
//   array 의 숫자는 그 필드만, limits.files 는 요청 전체를 봅니다.
//
// ★ field 가 없는 것에 주의하세요.
//   LIMIT_FILE_SIZE 에는 err.field 가 있는데 LIMIT_FILE_COUNT 에는 없습니다.
//   "몇 번째 파일이 문제인가" 를 셀 수 없는 상황이라 그렇습니다.
//   그래서 안내 문구를 만들 때 err.field 가 undefined 일 수 있다고 생각해야 합니다.
//   (JSON.stringify 는 undefined 인 속성을 아예 빼고 찍습니다)


// ── 섹션 5: ★ mimetype 을 믿으면 안 되는 이유 ──

// req.file.mimetype 은 '보내는 쪽이 알려 준 값' 입니다.
// Postman 이나 직접 만든 요청에서는 마음대로 정할 수 있습니다.
//
// 진짜로 확인하려면 파일 '내용의 첫 몇 바이트' 를 봐야 합니다.
// 파일 형식마다 정해진 시작 바이트가 있습니다. 이걸 매직 넘버라고 합니다.

const 매직넘버 = {
  ".png": [0x89, 0x50, 0x4e, 0x47], // ‰PNG
  ".jpg": [0xff, 0xd8, 0xff],
  ".jpeg": [0xff, 0xd8, 0xff],
  ".gif": [0x47, 0x49, 0x46], // GIF
  ".pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
};

function 진짜형식인가(버퍼, 확장자) {
  const 기대 = 매직넘버[확장자];
  if (!기대) return true; // 우리가 모르는 형식은 통과시킵니다

  return 기대.every((바이트, i) => 버퍼[i] === 바이트);
}

// 내용을 봐야 하니 메모리에 담습니다.
const 메모리업로드 = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 },
  fileFilter: 확장자검사,
});

app.post("/upload-checked", 메모리업로드.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "NO_FILE", message: "파일이 없습니다" } });
  }

  const 원래이름 = 이름되돌리기(req.file.originalname);
  const 확장자 = path.extname(원래이름).toLowerCase();

  if (!진짜형식인가(req.file.buffer, 확장자)) {
    return res.status(400).json({
      error: {
        code: "CONTENT_MISMATCH",
        message: `확장자는 ${확장자} 인데 내용이 다릅니다`,
      },
    });
  }

  res.status(201).json({ data: { 원래이름, 크기: req.file.size } });
});

// 확인: POST /upload-checked multipart:@file=사진.png:20
// 응답: 400 {"error":{"code":"CONTENT_MISMATCH","message":"확장자는 .png 인데 내용이 다릅니다"}}

// ★★ 이름은 사진.png 인데 내용은 그냥 글자입니다.
//   확장자 검사만 했다면 통과했을 것입니다.
//   내용의 첫 바이트를 보니 PNG 가 아니라는 게 드러났습니다.
//
// ★ 이게 왜 중요한가
//   .png 로 이름만 바꾼 실행 파일을 올릴 수 있습니다.
//   그 파일을 다른 사람이 내려받아 실행하면 그때 문제가 됩니다.
//   또는 이미지 처리 라이브러리가 이상한 파일을 읽다가 터질 수 있습니다.
//
// ★ 세 단계로 막습니다
//   ① 확장자 검사   가장 싸고 빠릅니다. 대부분 여기서 걸러집니다
//   ② 매직 넘버     내용이 진짜 그 형식인지
//   ③ 실제로 열어 보기   이미지 라이브러리로 읽어 봅니다. 가장 확실하지만 느립니다
//
//   보통 ①②까지 합니다. ③은 이미지 크기 조절을 함께 할 때 자연스럽게 됩니다.


// ── 섹션 6: 거절된 파일은 남을까 ──

app.get("/leftover", (req, res) => {
  // uploads 폴더 전체에서 파일 개수를 셉니다.
  function 세기(폴더) {
    let 수 = 0;
    for (const 항목 of fs.readdirSync(폴더, { withFileTypes: true })) {
      const 경로 = path.join(폴더, 항목.name);
      수 += 항목.isDirectory() ? 세기(경로) : 1;
    }
    return 수;
  }

  res.json({ 저장된파일수: 세기(업로드폴더) });
});

// ★ 직접 재 본 결과입니다.
//
//   용량 초과로 거절     →  조각 파일이 남지 않습니다 (multer 2.x 가 지워 줍니다)
//   확장자로 거절        →  아예 안 씁니다
//   정상 저장            →  남습니다
//
//   예전 자료에는 "거절돼도 파일이 남으니 직접 지우라" 는 말이 있습니다.
//   지금 버전은 알아서 지워 줍니다. 그래도 확인해 볼 가치는 있습니다.
//
// ★★ 그런데 이건 여전히 문제입니다.
//
//   multer 는 통과했는데 '우리 라우트' 에서 실패하는 경우입니다.
//
//     app.post("/upload", 업로드.single("file"), async (req, res) => {
//       await 데이터베이스에저장(req.file);   ← 여기서 실패하면?
//       res.status(201).json(...);
//     });
//
//   파일은 디스크에 남고 기록은 없습니다. 아무도 모르는 쓰레기 파일이 됩니다.
//   개념05 에서 이 이야기를 다시 합니다.


// ── 섹션 7: MulterError 처리하기 ──

app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  // ★ multer 가 만드는 에러는 name 이 "MulterError" 입니다.
  //   code 로 무엇이 문제인지 알 수 있습니다.
  if (err.name === "MulterError") {
    const 안내 = {
      LIMIT_FILE_SIZE: `파일이 너무 큽니다 (최대 ${업로드.limits?.fileSize ?? 100}바이트)`,
      LIMIT_FILE_COUNT: "파일이 너무 많습니다",
      LIMIT_UNEXPECTED_FILE: "예상하지 못한 필드 이름입니다. 필드 이름을 영어로 맞췄나요?",
      LIMIT_FIELD_COUNT: "글자 필드가 너무 많습니다",
    };

    return res.status(400).json({
      error: {
        code: err.code,
        message: 안내[err.code] ?? err.message,
        field: err.field,
      },
    });
  }

  // 우리가 만든 에러 (fileFilter 등)
  if (err.status) {
    return res.status(err.status).json({
      error: { code: err.code ?? "BAD_REQUEST", message: err.message },
    });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});

// ★★ multer 에러는 400 입니다. 500 이 아닙니다.
//   보낸 쪽이 고칠 수 있는 문제이기 때문입니다. (03단원 개념02)
//
//   에러 처리기를 안 만들면 Express 기본 처리기가 500 을 냅니다.
//   사용자는 "서버가 고장났나?" 하고 다시 시도합니다. 계속 실패합니다.
//   "파일이 5MB 를 넘습니다" 라고 알려 주면 바로 해결됩니다.


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
  console.log(`용량 제한: 100바이트 (시험용), 허용 확장자: ${허용확장자.join(", ")}`);
});


// ============================================================
// MulterError 종류
// ============================================================
//
//   code                      언제
//   ──────────────────────────────────────────────────────────
//   LIMIT_FILE_SIZE           파일이 limits.fileSize 를 넘음
//   LIMIT_FILE_COUNT          파일 개수가 limits.files 를 넘음
//   LIMIT_UNEXPECTED_FILE     기대하지 않은 필드로 파일이 옴
//                             ★ 필드 이름을 한글로 썼을 때 이게 납니다
//   LIMIT_FIELD_COUNT         글자 필드가 limits.fields 를 넘음
//   LIMIT_FIELD_KEY           필드 이름이 너무 김
//   LIMIT_FIELD_VALUE         필드 값이 너무 김
//   LIMIT_PART_COUNT          조각이 너무 많음
//
// err.field 에 어느 필드에서 났는지가 들어 있습니다. 안내에 함께 넣으면 좋습니다.


// ============================================================
// 업로드에서 반드시 정해야 할 다섯 가지
// ============================================================
//
//   ① 용량 제한        limits.fileSize        없으면 디스크가 찹니다
//   ② 개수 제한        limits.files           없으면 한 번에 천 개도 옵니다
//   ③ 허용 확장자      fileFilter             "이것만 됨" 목록으로
//   ④ 저장 이름        diskStorage.filename   원래 이름을 쓰지 마세요
//   ⑤ 저장 위치        diskStorage.destination 날짜별로 나누세요
//
// 다섯 개를 다 정하지 않은 업로드는 만들지 마세요.
// 하나라도 빠지면 언젠가 사고가 납니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — Postman 으로 100바이트가 넘는 파일을 올려 보세요.
//                    어떤 code 가 나오나요? field 는요?
//
// ✏️ 직접 해보기 2 — .exe 파일을 .png 로 이름만 바꿔서 /upload 에 올려 보세요.
//                    통과하나요? /upload-checked 에는요?
//
// ✏️ 직접 해보기 3 — uploads 폴더를 열어 보세요.
//                    연도/월 폴더가 만들어져 있나요?
//
// ✏️ 직접 해보기 4 — 확장자검사 에서 이름되돌리기 를 빼 보세요.
//                    한글 이름의 .pdf 파일이 통과하나요? 왜일까요?
//                    (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — 에러 처리기에서 MulterError 갈래를 지워 보세요.
//                    큰 파일을 올리면 상태코드가 몇이 되나요?
//                    사용자가 무엇을 해야 할지 알 수 있나요?
//
// ✏️ 직접 해보기 6 — 허용확장자 를 '금지 목록' 방식으로 바꿔 보세요.
//                    [".exe", ".bat", ".sh"] 를 막는 식으로요.
//                    빠뜨린 위험한 확장자가 있는지 생각해 보세요.
//                    (.cmd? .ps1? .jar? .html?)
//
// ✏️ 직접 해보기 7 — fileSize 를 5 * 1024 * 1024 로 바꾸고
//                    진짜 사진을 올려 /upload-checked 를 통과시켜 보세요.


// ── 자주 하는 실수 ──

// [실수 1] limits 를 안 정함
//   500MB 파일 하나로 디스크가 찰 수 있습니다. 반드시 정하세요.

// [실수 2] fileFilter 에서 이름을 안 되돌림
//   한글 이름 파일의 확장자를 못 읽어서 전부 거절됩니다.

// [실수 3] mimetype 으로만 검사
//   보내는 쪽이 마음대로 정합니다. 매직 넘버까지 보세요.

// [실수 4] 금지 목록 방식으로 막음
//   빠뜨리는 게 반드시 생깁니다. 허용 목록으로 하세요.

// [실수 5] MulterError 를 안 다룸
//   사용자가 500 을 받고 "서버 고장" 이라고 생각합니다.

// [실수 6] 확장자를 소문자로 안 바꿈
//   .PNG 로 올리면 허용 목록에 없어서 거절됩니다.

// [실수 7] 라우트에서 실패했을 때 파일을 안 지움
//   기록은 없고 파일만 남는 쓰레기가 쌓입니다. (개념05)


// ── 정리 ──

// 1. limits 를 반드시 정한다. 안 정하면 크기도 개수도 무제한이다.
// 2. 확장자 검사는 fileFilter 에서 한다.
//    이때도 이름을 먼저 되돌려야 한다. 안 되돌리면 깨진 글자에서 확장자를 찾게 된다.
// 3. mimetype 으로만 검사하면 안 된다. 보내는 쪽이 마음대로 적을 수 있다.
//    확장자와 함께 본다.
// 4. 허용 목록으로 막는다. 금지 목록은 빠뜨린 것이 반드시 생긴다.
// 5. 확장자는 소문자로 바꿔서 비교한다. .JPG 도 통과해야 한다.
// 6. 용량이나 개수를 넘기면 MulterError 가 난다. 따로 다뤄서 알아듣게 알려 준다.
//    안 다루면 그냥 500 이 나가서 부르는 쪽이 이유를 모른다.
// 7. 라우트에서 실패했으면 이미 저장된 파일을 지운다. 안 지우면 쓰레기가 쌓인다.
