// ============================================================
// 09단원 · 개념 04 — 올린 파일 보여 주고 내려받게 하기
// ------------------------------------------------------------
// 실행: node 개념04_올린_파일_보여주기.js
//       끄려면 Ctrl + C
// ============================================================
//
// 파일을 받아 저장까지 했습니다. 이제 다시 보여 줘야 합니다.
//
//   · 사진이면 화면에 <img> 로
//   · PDF 면 새 탭에서 열리게
//   · 엑셀이면 내려받아지게
//
// 셋이 조금씩 다릅니다. 그리고 여기에도 위험한 구멍이 있습니다.

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const 업로드폴더 = path.join(__dirname, "uploads");
fs.mkdirSync(업로드폴더, { recursive: true });

function 이름되돌리기(이름) {
  return Buffer.from(이름, "latin1").toString("utf8");
}


// ── 섹션 1: 파일 기록을 따로 남깁니다 ──

// 저장된 이름은 무작위입니다. 원래 이름은 어디에 둘까요?
// 파일과 짝을 이루는 '기록' 을 따로 만듭니다.
//
//   저장된 이름   1786683001682-123456789.pdf   ← 겹치지 않고 안전한 이름
//   원래 이름     작업표준서.pdf                ← 사람에게 보여 줄 이름
//
// 진짜 서버라면 데이터베이스에 넣습니다. 여기서는 배열에 둡니다. (07단원)

let 파일기록들 = [
  {
    id: 1,
    저장이름: "sample-report.pdf",
    원래이름: "작업표준서.pdf",
    크기: 12,
    형식: "application/pdf",
    올린날: "2026-08-01",
  },
];

let 다음번호 = 2;

// 시험용 파일을 하나 만들어 둡니다.
fs.writeFileSync(path.join(업로드폴더, "sample-report.pdf"), "가짜 PDF", "utf-8");

const 저장방식 = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 업로드폴더),
  filename: (req, file, cb) => {
    const 확장자 = path.extname(이름되돌리기(file.originalname)).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${확장자}`);
  },
});

const 업로드 = multer({ storage: 저장방식, limits: { fileSize: 1024 } });

app.post("/api/v1/files", 업로드.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: "NO_FILE", message: "파일이 없습니다" } });
  }

  const 기록 = {
    id: 다음번호,
    저장이름: req.file.filename,
    원래이름: 이름되돌리기(req.file.originalname),
    크기: req.file.size,
    형식: req.file.mimetype,
    올린날: "2026-08-14",
  };

  다음번호 += 1;
  파일기록들.push(기록);

  // ★ 응답에 저장이름을 넣지 않았습니다.
  //   밖에서 알 필요가 없습니다. id 로 주소를 만들면 되니까요.
  res.status(201).json({
    data: { id: 기록.id, 원래이름: 기록.원래이름, 크기: 기록.크기 },
  });
});

// 확인: POST /api/v1/files multipart:@file=검사성적서.pdf:30
// 응답: 201 {"data":{"id":2,"원래이름":"검사성적서.pdf","크기":30}}

app.get("/api/v1/files", (req, res) => {
  res.json({
    data: 파일기록들.map((기록) => ({
      id: 기록.id,
      원래이름: 기록.원래이름,
      크기: 기록.크기,
      보기: `/api/v1/files/${기록.id}/view`,
      내려받기: `/api/v1/files/${기록.id}/download`,
    })),
  });
});

// 확인: GET /api/v1/files
// 응답: 200 {"data":[{"id":1,"원래이름":"작업표준서.pdf","크기":12,"보기":"/api/v1/files/1/view","내려받기":"/api/v1/files/1/download"},{"id":2,"원래이름":"검사성적서.pdf","크기":30,"보기":"/api/v1/files/2/view","내려받기":"/api/v1/files/2/download"}]}

// ★ 주소를 함께 알려 주는 것이 친절합니다.
//   프론트가 주소 규칙을 외우지 않아도 됩니다.
//   주소가 바뀌어도 프론트를 안 고쳐도 됩니다.


// ── 섹션 2: 방법 ① — 정적 폴더로 통째로 열기 ──

// 가장 쉬운 방법입니다. 한 줄이면 됩니다.
app.use("/uploads", express.static(업로드폴더));

// 확인: GET /uploads/sample-report.pdf
// 응답: 200

// ★ 아주 편하지만 큰 문제가 있습니다.
//
//   저장 이름만 알면 누구나 받아 갑니다.
//   "로그인한 사람만" 이나 "자기가 올린 것만" 같은 규칙을 걸 수가 없습니다.
//
//   저장 이름이 무작위라 못 맞힌다고요?
//   한 사람이 자기 파일 주소를 알면, 그 주소를 남에게 그냥 넘길 수 있습니다.
//   그리고 무작위 이름은 '비밀번호' 가 아닙니다.
//
// ★ 언제 써도 되나
//   · 프로필 사진, 공개 게시글 첨부처럼 누가 봐도 되는 것
//   · 어차피 공개인 자료
//
// ★ 쓰면 안 되는 것
//   · 계약서, 급여명세서, 신분증 사진
//   · 사내 문서
//
//   이런 건 다음 방법을 쓰세요.


// ── 섹션 3: 방법 ② — 라우트로 하나씩 내주기 ──

function 기록찾기(req, res, next) {
  const 번호 = Number(req.params.id);

  if (!Number.isInteger(번호)) {
    return res.status(400).json({ error: { code: "VALIDATION_FAILED", message: "번호는 숫자여야 합니다" } });
  }

  const 기록 = 파일기록들.find((기록) => 기록.id === 번호);

  if (!기록) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "파일을 찾을 수 없습니다" } });
  }

  req.기록 = 기록;
  next();
}

// ★ 여기에 05단원의 인증·권한 미들웨어를 얹을 수 있습니다.
//   app.get("/api/v1/files/:id/view", 인증, 기록찾기, 내것인지확인, ...)
//   정적 폴더 방식으로는 이게 불가능합니다.

app.get("/api/v1/files/:id/view", 기록찾기, (req, res) => {
  const 진짜경로 = path.join(업로드폴더, req.기록.저장이름);

  // ★ res.sendFile 은 절대 경로를 요구합니다.
  //   그리고 Content-Type 을 확장자로 알아서 정해 줍니다.
  res.sendFile(진짜경로);
});

// 확인: GET /api/v1/files/1/view
// 응답: 200

// 확인: GET /api/v1/files/99/view
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"파일을 찾을 수 없습니다"}}

// 확인: GET /api/v1/files/abc/view
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"번호는 숫자여야 합니다"}}

// ★★ 주소에 저장 이름이 안 나옵니다. id 만 있습니다.
//   그래서 규칙을 걸 수 있고, 파일을 다른 곳으로 옮겨도 주소가 안 바뀝니다.


// ── 섹션 4: 보기와 내려받기의 차이 ──

app.get("/api/v1/files/:id/download", 기록찾기, (req, res) => {
  const 진짜경로 = path.join(업로드폴더, req.기록.저장이름);

  // ★ res.download 는 Content-Disposition: attachment 를 붙입니다.
  //   브라우저가 화면에 열지 않고 '저장' 창을 띄웁니다.
  //   두 번째 인자로 '사용자에게 보일 이름' 을 줍니다.
  res.download(진짜경로, req.기록.원래이름);
});

// 확인: GET /api/v1/files/1/download
// 응답: 200
// 헤더: content-disposition=attachment; filename="?????.pdf"; filename*=UTF-8''%EC%9E%91%EC%97%85%ED%91%9C%EC%A4%80%EC%84%9C.pdf

// ★★★ 헤더를 보세요. 한글 이름이 두 가지 방식으로 들어 있습니다.
//
//   filename="?????.pdf"                          ← 옛날 방식. 한글이 물음표가 됩니다
//   filename*=UTF-8''%EC%9E%91%EC%97%85...        ← 새 방식. 퍼센트 인코딩
//
//   헤더에는 한글을 담을 수 없다고 했습니다. (05단원 개념02)
//   그래서 이런 방법이 생겼습니다.
//
//   요즘 브라우저는 filename* 을 보고 한글 이름으로 저장합니다.
//   아주 오래된 브라우저는 filename 을 보고 물음표로 저장합니다.
//
//   ★ Express 가 이걸 알아서 해 줍니다. 직접 만들지 마세요.
//     res.set("Content-Disposition", `attachment; filename="${원래이름}"`)
//     이렇게 쓰면 한글 이름에서 500 이 납니다. 헤더에 한글을 담은 셈이니까요.

app.get("/api/v1/files/:id/inline", 기록찾기, (req, res) => {
  const 진짜경로 = path.join(업로드폴더, req.기록.저장이름);

  // 화면에 열되 이름은 알려 주고 싶을 때
  res.set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(req.기록.원래이름)}`);
  res.sendFile(진짜경로);
});

// 확인: GET /api/v1/files/1/inline
// 응답: 200
// 헤더: content-disposition=inline; filename*=UTF-8''%EC%9E%91%EC%97%85%ED%91%9C%EC%A4%80%EC%84%9C.pdf

// ★ 정리
//     attachment  →  저장 창이 뜹니다
//     inline      →  브라우저가 열 수 있으면 화면에 엽니다 (PDF, 이미지)
//
//   직접 쓸 때는 encodeURIComponent 로 감싸야 합니다.
//   한글을 그대로 넣으면 ERR_INVALID_CHAR 로 500 이 납니다.


// ── 섹션 5: ★★ 경로 탈출을 막아야 합니다 ──

// 이런 라우트를 만들면 안 됩니다. 아주 흔한 실수입니다.
//
//   app.get("/bad/:name", (req, res) => {
//     res.sendFile(path.join(업로드폴더, req.params.name));
//   });
//
// /bad/..%2F..%2Fpackage.json 을 부르면 서버 파일이 나갑니다.
// .env 파일이면 데이터베이스 비밀번호가 통째로 새어 나갑니다.

app.get("/api/v1/raw/:name", (req, res) => {
  const 요청이름 = req.params.name;
  const 노린경로 = path.join(업로드폴더, 요청이름);

  // ★ 만들어진 경로가 정말 업로드 폴더 '안' 인지 확인합니다.
  //   path.resolve 로 ../ 를 전부 정리한 뒤 비교합니다.
  const 정리된경로 = path.resolve(노린경로);
  const 정리된폴더 = path.resolve(업로드폴더);

  if (!정리된경로.startsWith(정리된폴더 + path.sep)) {
    return res.status(400).json({
      error: { code: "BAD_PATH", message: "폴더 밖으로 나갈 수 없습니다" },
    });
  }

  if (!fs.existsSync(정리된경로)) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "파일을 찾을 수 없습니다" } });
  }

  res.sendFile(정리된경로);
});

// 확인: GET /api/v1/raw/sample-report.pdf
// 응답: 200

// 확인: GET /api/v1/raw/..%2F..%2Fpackage.json
// 응답: 400 {"error":{"code":"BAD_PATH","message":"폴더 밖으로 나갈 수 없습니다"}}

// 확인: GET /api/v1/raw/없는파일.pdf
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"파일을 찾을 수 없습니다"}}

// ★★ 두 번째를 보세요. ..%2F 는 ../ 를 인코딩한 것입니다.
//   req.params 는 되돌려진 상태로 오기 때문에 ../ 가 그대로 들어옵니다.
//   path.join 이 그걸 계산해서 업로드 폴더 밖을 가리키게 됩니다.
//
// ★ 막는 방법 두 가지
//   ① 아예 이름을 안 받는다        → 섹션 3 방식. id 로만 찾습니다. 가장 안전합니다
//   ② 받되 폴더 안인지 확인한다     → 이 섹션 방식
//
//   ①이 훨씬 낫습니다. 사용자가 파일 이름을 정할 이유가 없습니다.
//   08단원의 express.static 도 이 확인을 안에서 해 줍니다.
//
// ★ path.sep 을 붙인 이유
//   startsWith(정리된폴더) 만 쓰면 "uploads-secret" 같은 폴더도 통과합니다.
//   구분자까지 붙여야 정확히 '그 폴더 안' 이 됩니다.


// ── 섹션 6: 화면 ──

app.get("/", (req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>파일 목록</title>
<style>body{font-family:"맑은 고딕",sans-serif;max-width:680px;margin:40px auto;padding:0 20px;line-height:1.7}
h1{border-bottom:3px solid #333;padding-bottom:8px}
li{margin:6px 0}a{margin-right:10px}</style></head>
<body>
<h1>올린 파일</h1>
<input type="file" id="파일" /><button id="올리기">올리기</button>
<p id="알림"></p>
<ul id="목록"></ul>
<script>
async function 그리기() {
  const 답 = await (await fetch("/api/v1/files")).json();
  // ★ 실무에서는 사용자가 정한 값(파일 이름)을 innerHTML 에 그대로 넣으면 안 됩니다(XSS).
  //   textContent 나 이스케이프를 쓰세요. 여기서는 학습용으로 단순화했습니다.
  document.querySelector("#목록").innerHTML = 답.data
    .map((f) =>
      "<li>" + f.원래이름 + " (" + f.크기 + "바이트) " +
      '<a href="' + f.보기 + '" target="_blank">보기</a>' +
      '<a href="' + f.내려받기 + '">내려받기</a></li>')
    .join("");
}
document.querySelector("#올리기").addEventListener("click", async () => {
  const 파일 = document.querySelector("#파일").files[0];
  if (!파일) { document.querySelector("#알림").textContent = "파일을 고르세요."; return; }
  const 폼 = new FormData();
  폼.append("file", 파일);
  const 응답 = await fetch("/api/v1/files", { method: "POST", body: 폼 });
  const 답 = await 응답.json();
  document.querySelector("#알림").textContent =
    응답.ok ? "올렸습니다: " + 답.data.원래이름 : "실패: " + 답.error.message;
  그리기();
});
그리기();
</script></body></html>`);
});

// 확인: GET /
// 응답: 200


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.name === "MulterError") {
    return res.status(400).json({ error: { code: err.code, message: err.message } });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
});


// ============================================================
// 세 가지 방법 비교
// ============================================================
//
//   방법                     규칙을 걸 수 있나   주소에 파일명   언제
//   ────────────────────────────────────────────────────────────────
//   express.static           ✗                  나옴           공개 자료
//   라우트 + sendFile(id)    ○                  안 나옴        비공개 자료 ★
//   라우트 + 이름 받기       △                  나옴           쓰지 마세요
//
// ★ 기본은 두 번째입니다.
//   id 로만 찾으면 경로 탈출이 원천적으로 불가능하고, 인증도 걸 수 있습니다.
//
// ★ 실제 서비스에서는
//   파일을 서버에 두지 않고 S3 같은 곳에 올립니다. (PART 4)
//   그리고 '잠깐만 유효한 주소' 를 만들어 줍니다.
//   구조는 지금과 같습니다. sendFile 자리가 주소 만들기로 바뀔 뿐입니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 브라우저로 열어 한글 이름 파일을 올리고 '내려받기' 를 누르세요.
//                    저장 창의 파일 이름이 한글로 나오나요?
//
// ✏️ 직접 해보기 2 — F12 → Network 에서 내려받기 요청의
//                    Content-Disposition 헤더를 보세요. filename 과 filename* 이 있나요?
//
// ✏️ 직접 해보기 3 — '보기' 와 '내려받기' 를 각각 눌러 보세요. 무엇이 다른가요?
//                    PDF 와 이미지에서 각각 해 보세요.
//
// ✏️ 직접 해보기 4 — /api/v1/raw/..%2F..%2Fpackage.json 을 브라우저로 열어 보세요.
//                    막히나요? 확인 코드를 지우고 다시 해 보세요.
//                    package.json 이 나오나요? (확인 후 반드시 되돌리세요)
//
// ✏️ 직접 해보기 5 — /api/v1/files/:id/inline 에서 encodeURIComponent 를 지우고
//                    한글 이름 파일을 열어 보세요. 어떤 에러가 나나요?
//
// ✏️ 직접 해보기 6 — 05단원의 인증 미들웨어를 가져와
//                    /api/v1/files/:id/download 에만 붙여 보세요.
//                    /uploads/ 정적 주소로는 여전히 받아지나요?
//                    그게 왜 문제인가요?
//
// ✏️ 직접 해보기 7 — 기록에 '올린사람' 을 추가하고,
//                    자기가 올린 파일만 내려받을 수 있게 만들어 보세요.


// ── 자주 하는 실수 ──

// [실수 1] 업로드 폴더를 통째로 static 으로 염
//   비공개 파일도 주소만 알면 누구나 받습니다.

// [실수 2] 주소에 파일 이름을 받음
//   ../ 로 서버 파일이 새어 나갑니다. id 로 찾으세요.

// [실수 3] Content-Disposition 에 한글을 직접 씀
//   ERR_INVALID_CHAR 로 500 이 납니다. res.download 를 쓰거나 encodeURIComponent 하세요.

// [실수 4] sendFile 에 상대 경로를 줌
//   절대 경로여야 합니다. path.join(__dirname, ...) 을 쓰세요.

// [실수 5] 기록 없이 파일만 저장
//   무작위 이름만 남아서 무슨 파일인지 알 수 없게 됩니다.

// [실수 6] startsWith 에 구분자를 안 붙임
//   uploads-secret 같은 옆 폴더가 통과합니다.


// ── 정리 ──

// 1. 파일만 저장하지 않는다. 누가 언제 무엇을 올렸는지 기록을 따로 남긴다.
//    기록이 없으면 폴더에 파일만 쌓이고 아무도 손댈 수 없게 된다.
// 2. 보여 주는 방법은 둘이다 — 정적 폴더로 통째로 열기, 라우트로 하나씩 내주기.
// 3. 업로드 폴더를 통째로 static 으로 열면 안 된다.
//    주소만 알면 남의 파일까지 다 받아 갈 수 있다.
// 4. 주소에는 파일 이름이 아니라 기록의 번호를 받는다.
//    이름을 받으면 ../ 를 섞어 넣어 서버 안을 돌아다닐 수 있다.
// 5. 그래도 경로 탈출은 따로 막는다. 만든 경로가 업로드 폴더 안인지 확인한다.
//    startsWith 로 볼 때는 폴더 구분자까지 붙여서 본다. 안 붙이면 uploads2 가 통과한다.
// 6. 보기와 내려받기는 Content-Disposition 으로 갈린다. inline 이면 보기, attachment 면 저장.
// 7. Content-Disposition 에 한글을 직접 쓰지 않는다. 헤더라서 500 이 난다.
//    filename* 형식으로 인코딩해서 넣는다.
// 8. sendFile 에는 절대 경로를 준다. 상대 경로는 받지 않는다.
