// ============================================================
// 09단원 · 개념 02 — multer 시작하기 (그리고 한글 함정 세 가지)
// ------------------------------------------------------------
// 실행: node 개념02_multer_시작하기.js
//       끄려면 Ctrl + C
//
// ★★ 이 파일의 섹션 4·5·6 은 한국에서 개발할 때 반드시 만나는 문제입니다.
//   영어권 자료에는 아예 안 나옵니다. 꼭 읽으세요.
// ============================================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// ── 섹션 1: 가장 단순한 사용법 ──

//   npm install multer
//
// dest 만 주면 그 폴더에 저장해 줍니다.

const 업로드폴더 = path.join(__dirname, "uploads");
fs.mkdirSync(업로드폴더, { recursive: true });

const 간단업로드 = multer({ dest: 업로드폴더 });

// ★ upload.single("필드이름")
//   "이 이름으로 파일 하나가 올 것이다" 라고 알려 주는 것입니다.
//   프론트의 formData.append("file", 파일) 의 "file" 과 같아야 합니다.

app.post("/upload", 간단업로드.single("file"), (req, res) => {
  // 파일 정보는 req.file 에, 글자 필드는 req.body 에 담깁니다.
  res.json({
    파일있나: !!req.file,
    fieldname: req.file?.fieldname,
    mimetype: req.file?.mimetype,
    저장된이름: req.file?.filename ? "무작위 글자" : null,
    본문: req.body,
  });
});

// 확인: POST /upload multipart:@file=report.pdf&desc=설비 사진입니다
// 응답: 200 {"파일있나":true,"fieldname":"file","mimetype":"application/octet-stream","저장된이름":"무작위 글자","본문":{"desc":"설비 사진입니다"}}

// ★ 저장된 파일 이름이 무작위입니다.
//   uploads 폴더를 열어 보면 105c3f104f8bd626... 같은 이름이 있습니다.
//   확장자도 없습니다.
//
//   왜 이렇게 하나
//     같은 이름의 파일을 두 사람이 올리면 덮어써지기 때문입니다.
//     그리고 파일 이름에 위험한 글자가 들어올 수 있습니다. (../../.env 같은)
//
//   그런데 이대로는 나중에 무슨 파일인지 알 수가 없습니다.
//   그래서 보통 이름을 직접 정합니다. 섹션 3 에서 합니다.


// ── 섹션 2: req.file 에는 무엇이 들어 있나 ──

app.post("/file-info", 간단업로드.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "NO_FILE", message: "파일이 없습니다" } });
  }

  const f = req.file;

  res.json({
    fieldname: f.fieldname, // 프론트가 쓴 필드 이름
    originalname: f.originalname, // 원래 파일 이름 ★ 섹션 5 를 꼭 보세요
    mimetype: f.mimetype, // 브라우저가 알려 준 형식
    size: f.size, // 바이트
    destination: "(저장 폴더)", // 컴퓨터마다 달라서 가렸습니다
    filename: "(저장된 이름)",
    path: "(폴더 + 이름)",
  });
});

// 확인: POST /file-info multipart:@file=report.pdf
// 응답: 200 {"fieldname":"file","originalname":"report.pdf","mimetype":"application/octet-stream","size":20,"destination":"(저장 폴더)","filename":"(저장된 이름)","path":"(폴더 + 이름)"}

// ★ size 는 바이트입니다. 글자 수가 아닙니다.
//   여기서 보낸 내용은 "가짜 파일 내용" 인데 20 바이트입니다.
//   한글 한 글자가 UTF-8 에서 3바이트라서 그렇습니다. (02단원 개념02)

// ★★ mimetype 을 믿지 마세요.
//   이건 '브라우저가 알려 준 것' 입니다. 보내는 쪽이 마음대로 정할 수 있습니다.
//   Postman 으로 exe 파일에 image/png 라고 붙여 보낼 수 있습니다.
//   진짜 검사는 개념03 에서 봅니다.

// 확인: POST /file-info
// 응답: 400 {"error":{"code":"NO_FILE","message":"파일이 없습니다"}}

// ★★★ 파일을 안 보내도 에러가 안 납니다.
//   multer 는 그냥 req.file 을 undefined 로 두고 넘어갑니다.
//   "파일이 필수" 라면 우리가 직접 확인해서 400 을 내야 합니다.
//   이걸 빠뜨리면 req.file.originalname 에서 TypeError 로 서버가 500 을 냅니다.


// ── 섹션 3: 저장 이름을 직접 정하기 (diskStorage) ──

const 저장방식 = multer.diskStorage({
  // 어느 폴더에 저장할지
  destination: (req, file, cb) => {
    cb(null, 업로드폴더);
  },

  // 어떤 이름으로 저장할지
  filename: (req, file, cb) => {
    // ★ 여기서도 originalname 은 깨져 있습니다. 섹션 5 를 보세요.
    const 원래이름 = Buffer.from(file.originalname, "latin1").toString("utf8");
    const 확장자 = path.extname(원래이름).toLowerCase();

    // 겹치지 않는 이름을 만듭니다.
    const 고유값 = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${고유값}${확장자}`);
  },
});

const 업로드 = multer({ storage: 저장방식 });

app.post("/upload-named", 업로드.single("file"), (req, res) => {
  const 원래이름 = Buffer.from(req.file.originalname, "latin1").toString("utf8");

  res.json({
    원래이름,
    확장자: path.extname(원래이름).toLowerCase(),
    저장된이름끝: path.extname(req.file.filename),
    이름에한글있나: /[가-힣]/.test(req.file.filename),
  });
});

// 확인: POST /upload-named multipart:@file=작업표준서.PDF
// 응답: 200 {"원래이름":"작업표준서.PDF","확장자":".pdf","저장된이름끝":".pdf","이름에한글있나":false}

// ★ 저장된 이름에는 한글이 없습니다. 확장자만 남겼기 때문입니다.
//
//   왜 원래 이름을 그대로 안 쓰나
//     ① 같은 이름이 겹칩니다
//     ② 파일 이름에 위험한 글자가 들어올 수 있습니다 (../ 같은)
//     ③ 서버 운영체제에 따라 한글 파일 이름이 깨지기도 합니다
//
//   원래 이름은 데이터베이스나 JSON 에 따로 적어 둡니다.
//   보여 줄 때는 원래 이름, 저장은 안전한 이름 — 이렇게 나눕니다. (개념05)
//
// ★ 확장자를 소문자로 바꾼 것에 주의하세요.
//   .PDF 로 올려도 .pdf 로 저장됩니다. (02단원 연습문제 2·13)


// ── 섹션 4: ★★★ 한글 함정 ① — 필드 이름 ──

// 프론트에서 이렇게 보내면 어떻게 될까요?
//
//   formData.append("파일", 파일);
//
// 그리고 서버에서 upload.single("파일") 이라고 씁니다. 당연히 될 것 같습니다.

app.post("/ko-field", 간단업로드.single("파일"), (req, res) => {  // 검증무시: 일부러 안 되는 예
  res.json({ 여기까지왔나: true });
});

// 확인: POST /ko-field multipart:@파일=report.pdf
// 응답: 400

// ★★★ 400 이 납니다. MulterError: Unexpected field
//
//   왜 그럴까요?
//   multipart 본문의 필드 이름은 latin1 로 해석됩니다.
//   "파일" 이 "íì¼" 처럼 바뀌어서 도착합니다.
//   upload.single("파일") 은 "파일" 을 기다리는데 "íì¼" 가 오니 못 알아봅니다.
//
//   에러 메시지가 "Unexpected field" 라서 원인을 짐작하기 어렵습니다.
//   "필드 이름을 분명히 맞췄는데 왜 안 되지?" 로 한참 헤매게 됩니다.
//
// ★ 규칙: 필드 이름은 반드시 영어로.
//     formData.append("file", 파일)
//     upload.single("file")
//
//   04단원의 "라우트 주소는 영어로", 05단원의 "헤더는 영어로" 와 같은 이야기입니다.
//   한글은 '값' 에만 쓰세요.


// ── 섹션 5: ★★★ 한글 함정 ② — 파일 이름이 깨진다 ──

app.post("/ko-filename", 간단업로드.single("file"), (req, res) => {
  const 그대로 = req.file.originalname;
  const 되돌림 = Buffer.from(그대로, "latin1").toString("utf8");

  // ★ 깨진 글자를 응답에 그대로 담으면, 눈에 안 보이는 글자가 섞여
  //   비교할 때마다 결과가 달라집니다. 그래서 길이만 함께 보여 줍니다.
  //   깨진 모습은 터미널에서 직접 보세요.
  console.log(`   깨진 그대로: ${그대로}`);

  res.json({
    깨진글자수: 그대로.length,
    되돌린것: 되돌림,
    되돌린글자수: 되돌림.length,
    바뀌었나: 그대로 !== 되돌림,
  });
});

// 확인: POST /ko-filename multipart:@file=작업표준서.pdf
// 응답: 200 {"깨진글자수":19,"되돌린것":"작업표준서.pdf","되돌린글자수":9,"바뀌었나":true}

// 확인: POST /ko-filename multipart:@file=report-2026.png
// 응답: 200 {"깨진글자수":15,"되돌린것":"report-2026.png","되돌린글자수":15,"바뀌었나":false}

// ★ 글자 수를 보세요.
//   한글 5글자 + ".pdf" = 9글자여야 하는데 19글자로 도착했습니다.
//   한글 한 글자가 UTF-8 에서 3바이트인데, 그 바이트 하나하나를
//   글자 하나로 잘못 읽어서 5 × 3 = 15, 거기에 .pdf 4글자를 더해 19 입니다.
//
//   터미널에는 이렇게 찍힙니다.
//     깨진 그대로: ììíì¤ì.pdf
//
// ★★★ 작업표준서.pdf 가 이렇게 도착합니다.
//
//   왜 그런가
//     multipart 규격이 아주 오래전에 만들어져서, 파일 이름을 latin1 로 읽습니다.
//     브라우저는 UTF-8 로 보내는데 받는 쪽이 latin1 로 해석하니 깨집니다.
//
//   어떻게 고치나
//     Buffer.from(이름, "latin1").toString("utf8")
//
//     "latin1 로 잘못 읽은 것을 바이트로 되돌린 뒤, utf8 로 다시 읽어라" 입니다.
//
// ★ 두 번째를 보세요. 영어 파일 이름은 안 바뀝니다.
//   그래서 이 되돌리기를 '항상' 적용해도 안전합니다.
//   조건문 없이 그냥 감싸면 됩니다.
//
// ★★ 이 함정이 왜 무서운가
//   영어 파일로만 시험하면 아무 문제가 없습니다.
//   한글 이름 파일을 올린 사용자만 이름이 깨집니다.
//   그리고 그 파일은 이미 저장된 뒤라 되돌리기 어렵습니다.
//
//   개발할 때 반드시 한글 파일 이름으로 시험해 보세요.


// ── 섹션 6: ★★★ 한글 함정 ③ — 글자 필드는 안 깨진다 ──

app.post("/ko-body", 간단업로드.single("file"), (req, res) => {
  const 원본 = req.body.desc;
  const 괜히되돌림 = Buffer.from(원본, "latin1").toString("utf8");

  console.log(`   괜히 되돌리면: ${괜히되돌림}`);

  res.json({
    본문값그대로: 원본,
    되돌리면망가지나: 원본 !== 괜히되돌림,
    파일이름은: Buffer.from(req.file.originalname, "latin1").toString("utf8"),
  });
});

// 확인: POST /ko-body multipart:@file=작업표준서.pdf&desc=설비 사진입니다
// 응답: 200 {"본문값그대로":"설비 사진입니다","되돌리면망가지나":true,"파일이름은":"작업표준서.pdf"}

// ★★★ 여기가 가장 헷갈리는 부분입니다.
//
//   req.body.desc 는 안 깨졌습니다. "설비 사진입니다" 그대로입니다.
//   그런데 여기에 되돌리기를 적용하면 오히려 망가집니다.
//
//   왜 다른가
//     파일 '이름' 은 헤더 줄(Content-Disposition)에 들어 있어서 latin1 로 읽힙니다.
//     글자 필드의 '값' 은 본문 내용이라 UTF-8 로 제대로 읽힙니다.
//
//   같은 요청 안에서 한쪽은 깨지고 한쪽은 안 깨집니다.
//
// ★ 규칙 한 줄
//     되돌리기는 file.originalname 에만 적용합니다.
//     req.body 의 값에는 절대 적용하지 마세요.
//
//   "한글이 깨지네? 전부 되돌리자" 하고 감싸면 멀쩡한 값까지 망가집니다.


// ── 섹션 7: 메모리에 담기 (memoryStorage) ──

const 메모리업로드 = multer({ storage: multer.memoryStorage() });

app.post("/to-memory", 메모리업로드.single("file"), (req, res) => {
  res.json({
    버퍼인가: Buffer.isBuffer(req.file.buffer),
    크기: req.file.size,
    앞부분: req.file.buffer.toString("utf8").slice(0, 10),
    path있나: req.file.path !== undefined,
  });
});

// 확인: POST /to-memory multipart:@file=report.txt
// 응답: 200 {"버퍼인가":true,"크기":20,"앞부분":"가짜 파일 내용","path있나":false}

// ★ 디스크에 안 쓰고 메모리에만 담습니다. req.file.buffer 로 내용을 바로 볼 수 있습니다.
//   대신 path 와 filename 은 없습니다. 저장한 게 아니니까요.
//
// ★ 언제 쓰나
//   · 받자마자 S3 같은 곳으로 넘길 때 (PART 4)
//   · 엑셀·CSV 를 읽어서 데이터베이스에 넣고 파일은 버릴 때
//   · 이미지 크기를 줄여서 저장할 때
//
// ★★ 반드시 용량 제한을 함께 두세요.
//   제한이 없으면 500MB 파일 하나로 서버 메모리가 찹니다.
//   여러 명이 동시에 올리면 서버가 죽습니다. (개념03)


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.name === "MulterError") {
    return res.status(400).json({
      error: { code: err.code, message: err.message, field: err.field },
    });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
  console.log(`업로드 폴더: ${업로드폴더}`);
});


// ============================================================
// 한글 함정 세 가지 정리
// ============================================================
//
//   무엇                  한글이 되나    어떻게
//   ────────────────────────────────────────────────────────────
//   필드 이름             ✗             영어로 쓰세요 (file, photo)
//   파일 이름             △             Buffer.from(x,"latin1").toString("utf8")
//   글자 필드의 값        ○             그대로 쓰세요. 건드리면 망가집니다
//   응답 JSON             ○             그대로
//
// △ 는 "받을 수는 있는데 되돌려야 한다" 는 뜻입니다.
//
// ★ 이 자료에서 지금까지 나온 '한글이 안 되는 곳' 을 모으면
//
//   라우트 주소        (04단원)  조용히 404
//   응답 헤더 값        (05단원)  500 으로 터짐
//   요청 헤더 값        (05단원)  요청이 안 나감
//   업로드 필드 이름    (09단원)  Unexpected field
//   업로드 파일 이름    (09단원)  깨져서 도착
//
//   공통점: 전부 '헤더에 실려 가는 것' 입니다.
//   본문에 담기는 것(JSON, 폼 값, 응답 내용)은 한글이 잘 됩니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — Postman 으로 파일을 올려 보세요.
//                    Body → form-data → 왼쪽 칸에 file, 오른쪽에서 File 을 고릅니다.
//                    한글 이름 파일과 영어 이름 파일을 각각 올려 비교하세요.
//
// ✏️ 직접 해보기 2 — uploads 폴더를 열어 보세요.
//                    /upload 로 올린 것과 /upload-named 로 올린 것의 이름이 어떻게 다른가요?
//
// ✏️ 직접 해보기 3 — /ko-filename 에서 되돌리기를 지우고 한글 파일을 올려 보세요.
//                    깨진 이름이 그대로 나옵니다. 그 이름으로 저장하면 어떻게 될까요?
//
// ✏️ 직접 해보기 4 — /ko-body 의 되돌리기를 req.body 전체에 적용해 보세요.
//                    설명이 어떻게 되나요? (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — diskStorage 의 filename 에서 확장자를 안 붙여 보세요.
//                    저장된 파일을 더블클릭하면 열리나요?
//
// ✏️ 직접 해보기 6 — 되돌리기를 함수로 빼서 utils 에 두세요.
//
//       function 파일이름되돌리기(이름) {
//         return Buffer.from(이름, "latin1").toString("utf8");
//       }
//
//     앞으로 모든 업로드에서 쓰게 됩니다.
//
// ✏️ 직접 해보기 7 — memoryStorage 로 텍스트 파일을 올리고
//                    req.file.buffer.toString("utf8") 로 내용을 통째로 찍어 보세요.


// ── 자주 하는 실수 ──

// [실수 1] 필드 이름을 한글로 씀
//   MulterError: Unexpected field. 원인을 짐작하기 어렵습니다.

// [실수 2] originalname 을 그대로 씀
//   한글 파일 이름이 깨진 채로 저장되거나 화면에 나옵니다.

// [실수 3] 되돌리기를 req.body 에도 적용
//   멀쩡한 글자가 망가집니다. originalname 에만 쓰세요.

// [실수 4] req.file 이 있는지 확인 안 함
//   파일 없이 요청하면 undefined 라서 TypeError 로 500 이 납니다.

// [실수 5] mimetype 을 믿음
//   보내는 쪽이 마음대로 정합니다. 진짜 검사는 개념03 에서 합니다.

// [실수 6] 원래 파일 이름 그대로 저장
//   같은 이름이 덮어써지고, ../ 같은 위험한 글자가 들어올 수 있습니다.

// [실수 7] memoryStorage 를 용량 제한 없이 씀
//   큰 파일 몇 개로 서버 메모리가 찹니다.


// ── 정리 ──

// 1. multer 가 multipart 를 읽어서 req.file(또는 req.files)에 담아 준다.
// 2. 필드 이름에 한글을 쓰면 안 된다. Unexpected field 로 거절당한다.
//    헤더에 실려 가는 것에는 한글을 못 쓰기 때문이다.
// 3. 파일 이름의 한글은 깨져서 도착한다.
//    Buffer.from(originalname, "latin1").toString("utf8") 로 되돌린다.
// 4. 그 되돌리기를 req.body 값에는 하면 안 된다. 글자 필드는 안 깨져서 오므로
//    되돌리면 오히려 망가진다. 깨지는 것은 헤더에 실리는 것뿐이다.
// 5. originalname 을 그대로 저장 이름으로 쓰지 않는다.
//    같은 이름이 오면 덮어쓰고, 이상한 글자가 섞이면 경로가 망가진다.
// 6. 저장 이름은 diskStorage 에서 직접 정한다. 겹치지 않게 만든다.
// 7. req.file 이 있는지 먼저 확인한다. 안 보냈으면 undefined 다.
// 8. mimetype 은 보내는 쪽이 정하는 값이라 믿으면 안 된다.
// 9. memoryStorage 는 용량 제한과 함께 쓴다. 안 그러면 메모리가 바로 찬다.
