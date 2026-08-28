// ============================================================
// 10단원 · 개념 05 — 업로드 화면 만들기
// ------------------------------------------------------------
// 실행: node 개념05_업로드_화면_만들기.js
//       브라우저에서 http://localhost:3000 을 여세요.
// ============================================================
//
// 09단원에서 만든 업로드 API 에 화면을 붙입니다.
//
// 화면 쪽에서 새로 배울 것은 셋입니다.
//
//   ① 고른 파일을 보내기 전에 보여 주기 (미리보기)
//   ② 진행률 보여 주기  ← fetch 로는 못 합니다
//   ③ 09단원의 에러(용량·확장자)를 화면에 알려 주기

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/05_업로드.html"));

// 확인: GET /05_업로드.html
// 응답: 200


// ── 섹션 1: 09단원 업로드 서버를 그대로 ──

const 업로드폴더 = path.join(__dirname, "uploads");
fs.rmSync(업로드폴더, { recursive: true, force: true });
fs.mkdirSync(업로드폴더, { recursive: true });

function 이름되돌리기(이름) {
  return Buffer.from(이름, "latin1").toString("utf8");
}

const 허용확장자 = [".png", ".jpg", ".jpeg", ".gif"];

const 업로드 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 업로드폴더),
    filename: (req, file, cb) => {
      const 확장자 = path.extname(이름되돌리기(file.originalname)).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${확장자}`);
    },
  }),
  limits: { fileSize: 2000 }, // 시험용. 실제로는 5 * 1024 * 1024
  fileFilter: (req, file, cb) => {
    const 확장자 = path.extname(이름되돌리기(file.originalname)).toLowerCase();

    if (!허용확장자.includes(확장자)) {
      const 에러 = new Error(`${확장자 || "확장자 없는 파일"} 은(는) 올릴 수 없습니다`);
      에러.status = 400;
      에러.code = "BAD_EXTENSION";
      return cb(에러);
    }

    cb(null, true);
  },
});

let 기록들 = [];
let 다음번호 = 1;

app.get("/api/v1/files", (req, res) => {
  res.json({ data: 기록들 });
});

// 확인: GET /api/v1/files
// 응답: 200 {"data":[]}

app.post("/api/v1/files", 업로드.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "NO_FILE", message: "파일이 없습니다" } });
  }

  const 기록 = {
    id: 다음번호,
    원래이름: 이름되돌리기(req.file.originalname),
    크기: req.file.size,
  };

  다음번호 += 1;
  기록들.push(기록);

  res.status(201).json({ data: 기록 });
});

// 확인: POST /api/v1/files multipart:@file=설비사진.png:30
// 응답: 201 {"data":{"id":1,"원래이름":"설비사진.png","크기":30}}

// 확인: POST /api/v1/files multipart:@file=악성.exe:10
// 응답: 400 {"error":{"code":"BAD_EXTENSION","message":".exe 은(는) 올릴 수 없습니다"}}

// 확인: POST /api/v1/files multipart:@file=큰파일.png:3000
// 응답: 400 {"error":{"code":"LIMIT_FILE_SIZE","message":"파일이 너무 큽니다 (최대 2000바이트)"}}


// ── 섹션 2: 화면으로 확인 ──

// 파일을 고르면 정보가 먼저 보입니다.
// 화면: 05_업로드.html  파일(#파일=10_프론트엔드_연동/시험파일/설비사진.png)
// 보임: #파일정보  설비사진.png

// ★ 서버에 보내기 전입니다. 브라우저가 아는 것만으로 보여 준 것입니다.
//   이름·크기·형식은 File 객체에 이미 들어 있습니다.

// fetch 로 올리기
// 화면: 05_업로드.html  파일(#파일=10_프론트엔드_연동/시험파일/설비사진.png) >> #올리기
// 보임: #알림  올렸습니다
// 보임: #목록  설비사진.png

// 확장자가 안 되는 파일
// 화면: 05_업로드.html  파일(#파일=10_프론트엔드_연동/시험파일/악성.exe) >> #올리기
// 보임: #알림  .exe 은(는) 올릴 수 없습니다

// 용량이 넘는 파일
// 화면: 05_업로드.html  파일(#파일=10_프론트엔드_연동/시험파일/너무큰파일.png) >> #올리기
// 보임: #알림  파일이 너무 큽니다

// ★★ 09단원에서 만든 에러가 그대로 화면에 나왔습니다.
//   서버가 code 와 message 를 잘 만들어 뒀기 때문에
//   화면은 message 를 띄우기만 하면 됩니다.
//
//   09단원에서 "MulterError 를 400 으로 바꾸고 안내 문구를 만들라" 고 한 이유가 이것입니다.
//   그걸 안 했다면 화면에 "서버에서 문제가 생겼습니다" 만 나왔을 것입니다.

// 진행률로 올리기
// 화면: 05_업로드.html  파일(#파일=10_프론트엔드_연동/시험파일/설비사진.png) >> #진행률로
// 보임: #진행칸  100%
// 보임: #알림  올렸습니다

// 파일을 안 고르고 누르면
// 화면: 05_업로드.html  #올리기
// 보임: #알림  파일을 먼저 고르세요


// ── 섹션 3: ★ fetch 로는 진행률을 못 만듭니다 ──

app.get("/api/v1/why-xhr", (req, res) => {
  res.json({
    data: {
      fetch가못하는것: "올리는 도중의 진행률. upload progress 이벤트가 없습니다.",
      fetch가할수있는것: "내려받는 진행률은 됩니다. response.body 를 조금씩 읽으면 됩니다.",
      그래서: "업로드 진행률이 필요하면 아직도 XMLHttpRequest 를 씁니다.",
      언제필요한가: [
        "큰 파일을 올릴 때. 몇 초 이상 걸리면 사용자는 멈춘 줄 압니다.",
        "여러 파일을 올릴 때. 몇 번째인지 알려 줘야 합니다.",
      ],
      언제필요없나: "작은 파일이면 '올리는 중...' 만 보여 줘도 충분합니다.",
    },
  });
});

// 확인: GET /api/v1/why-xhr
// 응답: 200

// ★★ 2026년인데도 XMLHttpRequest 를 쓰는 이유입니다.
//   fetch 가 대부분을 대체했지만, 업로드 진행률만은 아직 안 됩니다.
//
//   axios 같은 라이브러리에 onUploadProgress 가 있는데,
//   그것도 안에서는 XMLHttpRequest 를 씁니다.
//
// ★ 진행률이 100% 가 됐는데도 안 끝나는 경우가 있습니다.
//   100% 는 '다 보냈다' 는 뜻이지 '서버가 다 처리했다' 는 뜻이 아닙니다.
//   서버가 파일을 저장하고 기록을 남기는 시간이 더 걸립니다.
//   그래서 100% 뒤에도 "처리 중..." 을 보여 주는 화면이 많습니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "그런 주소가 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.name === "MulterError") {
    const 안내 = {
      LIMIT_FILE_SIZE: "파일이 너무 큽니다 (최대 2000바이트)",
      LIMIT_FILE_COUNT: "파일이 너무 많습니다",
      LIMIT_UNEXPECTED_FILE: "필드 이름이 file 이 맞나요?",
    };

    return res.status(400).json({
      error: { code: err.code, message: 안내[err.code] ?? err.message },
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
});


// ============================================================
// 업로드 화면이 챙겨야 할 것
// ============================================================
//
//   ① 고르자마자 정보 보여 주기
//      이름·크기·형식은 서버에 안 가도 압니다. File 객체에 들어 있습니다.
//      3MB 를 다 올린 뒤 "너무 큽니다" 를 듣는 것보다 낫습니다.
//
//   ② accept 속성 달기
//      <input type="file" accept=".png,.jpg">
//      파일 고르는 창에서 그 형식만 보입니다.
//      ★ 막는 게 아닙니다. 사용자가 '모든 파일' 을 골라 우회할 수 있습니다.
//        진짜 검사는 서버에서 합니다. (09단원 개념03)
//
//   ③ 버튼 잠그기
//      업로드는 특히 오래 걸립니다. 두 번 누르면 두 번 올라갑니다.
//
//   ④ 진행률 (필요하면)
//      XMLHttpRequest 를 씁니다. fetch 로는 안 됩니다.
//
//   ⑤ 에러를 그대로 보여 주기
//      서버가 만든 message 를 띄우면 됩니다.
//      "업로드 실패" 보다 "파일이 너무 큽니다" 가 훨씬 낫습니다.
//
//   ⑥ 성공하면 목록 새로 그리기
//      올렸는데 목록에 안 보이면 실패한 줄 압니다.


// ============================================================
// URL.createObjectURL 에 대하여
// ============================================================
//
// 고른 이미지를 서버에 안 보내고 화면에 보여 주는 방법입니다.
//
//   그림.src = URL.createObjectURL(파일);
//
// 브라우저가 그 파일을 가리키는 임시 주소를 만들어 줍니다.
//   blob:http://localhost:3000/8f3a...
//
// ★ 다 쓰고 나면 놓아 주는 것이 좋습니다.
//     URL.revokeObjectURL(주소);
//
//   안 하면 그 파일이 브라우저 메모리에 계속 남습니다.
//   사진을 100장 미리 보면 100장이 다 메모리에 있습니다.
//   이 자료에서는 흐름을 단순하게 두려고 생략했습니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 시험파일 폴더의 세 파일을 각각 올려 보세요.
//                    설비사진.png / 악성.exe / 너무큰파일.png
//                    화면에 각각 무엇이 나오나요?
//
// ✏️ 직접 해보기 2 — 진짜 사진 파일을 골라 보세요. 미리보기가 나오나요?
//                    F12 → Elements 에서 img 의 src 가 어떻게 생겼나요?
//
// ✏️ 직접 해보기 3 — F12 → Network 를 Slow 3G 로 바꾸고
//                    '올리기 (진행률 보이기)' 를 눌러 보세요.
//                    숫자가 올라가는 것이 보이나요?
//                    'fetch' 쪽은 어떤가요?
//
// ✏️ 직접 해보기 4 — accept 속성을 지우고 exe 를 골라 보세요.
//                    골라지나요? 서버가 막나요?
//                    accept 가 '막는 것' 이 아닌 이유를 설명해 보세요.
//
// ✏️ 직접 해보기 5 — 한글 이름의 사진 파일을 올려 보세요.
//                    목록에 이름이 제대로 나오나요?
//                    서버의 이름되돌리기 를 지우면 어떻게 되나요? (09단원 개념02)
//
// ✏️ 직접 해보기 6 — 여러 파일을 한 번에 올리게 바꿔 보세요.
//                    <input type="file" multiple> 과 upload.array 를 씁니다.
//                    진행률은 전체 기준인가요, 파일별인가요?
//
// ✏️ 직접 해보기 7 — URL.revokeObjectURL 을 넣어 보세요.
//                    새 파일을 고를 때 앞엣것을 놓아 주면 됩니다.


// ── 자주 하는 실수 ──

// [실수 1] fetch 로 진행률을 만들려고 함
//   방법이 없습니다. XMLHttpRequest 를 쓰세요.

// [실수 2] FormData 에 Content-Type 을 직접 붙임
//   boundary 가 안 붙어서 서버가 못 읽습니다. (09단원 개념01)

// [실수 3] accept 를 검증으로 믿음
//   사용자가 '모든 파일' 을 골라 우회할 수 있습니다. 서버에서 막으세요.

// [실수 4] 서버 에러 메시지를 안 보여 줌
//   "업로드 실패" 만 띄우면 사용자가 무엇을 고쳐야 할지 모릅니다.

// [실수 5] 버튼을 안 잠금
//   업로드는 오래 걸립니다. 두 번 누르면 두 번 올라갑니다.

// [실수 6] 100% 를 '끝' 으로 봄
//   다 보낸 것이지 서버가 다 처리한 것이 아닙니다.

// [실수 7] 올린 뒤 목록을 안 새로 그림
//   사용자는 실패한 줄 압니다.


// ── 정리 ──

// 1. 업로드 화면은 09단원의 업로드 서버를 그대로 쓴다.
// 2. FormData 에 Content-Type 을 직접 붙이지 않는다. 구분선은 브라우저만 안다.
// 3. fetch 로는 진행률을 못 만든다. 보내는 중간을 알려 주지 않기 때문이다.
//    진행률이 필요하면 XMLHttpRequest 를 쓴다. 이 하나 때문에 아직 쓴다.
// 4. accept 는 파일 고르는 창을 걸러 줄 뿐 검증이 아니다.
//    파일을 끌어다 놓으면 그냥 통과한다. 검증은 서버가 한다.
// 5. 서버가 준 에러 메시지를 보여 준다. 용량 초과인지 확장자 문제인지 알려 줘야 한다.
// 6. 보내는 동안 버튼을 잠근다. 두 번 눌러 두 번 올라가는 일이 흔하다.
// 7. 진행률 100% 는 '다 보냈다' 이지 '다 끝났다' 가 아니다.
//    서버가 저장하고 응답을 줄 때까지가 남아 있다.
// 8. 올린 뒤에는 목록을 다시 그린다. 안 그리면 올렸는데 안 보인다고 또 올린다.
