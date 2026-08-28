// ============================================================
// 09단원 · 개념 01 — 파일 업로드의 원리
// ------------------------------------------------------------
// 실행: node 개념01_파일_업로드의_원리.js
//       끄려면 Ctrl + C
// ============================================================
//
// 지금까지 주고받은 것은 전부 글자였습니다. JSON 도 결국 글자입니다.
// 그런데 사진·PDF·엑셀은 글자가 아닙니다.
//
// 이번 단원에서 파일을 받는 법을 배웁니다.
// 그 전에 "파일이 어떻게 서버까지 오는가" 부터 봅니다.

const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// ── 섹션 1: 왜 JSON 으로 못 보내나 ──

app.get("/why-not-json", (req, res) => {
  res.json({
    JSON은: "글자만 담을 수 있습니다. 사진의 바이트를 그대로 넣을 수 없습니다.",
    억지로하면: "Base64 로 글자로 바꿔서 담을 수는 있습니다.",
    Base64문제: [
      "크기가 약 33% 커집니다. 3MB 사진이 4MB 가 됩니다.",
      "서버가 통째로 메모리에 올려야 합니다. 큰 파일이면 서버가 멈춥니다.",
      "브라우저가 파일을 읽어 변환하는 시간이 따로 듭니다.",
      "진행률을 보여 주기 어렵습니다.",
    ],
    그래서: "파일은 multipart/form-data 라는 다른 형식으로 보냅니다.",
  });
});

// 확인: GET /why-not-json
// 응답: 200 {"JSON은":"글자만 담을 수 있습니다. 사진의 바이트를 그대로 넣을 수 없습니다.","억지로하면":"Base64 로 글자로 바꿔서 담을 수는 있습니다.","Base64문제":["크기가 약 33% 커집니다. 3MB 사진이 4MB 가 됩니다.","서버가 통째로 메모리에 올려야 합니다. 큰 파일이면 서버가 멈춥니다.","브라우저가 파일을 읽어 변환하는 시간이 따로 듭니다.","진행률을 보여 주기 어렵습니다."],"그래서":"파일은 multipart/form-data 라는 다른 형식으로 보냅니다."}

// ★ Base64 를 아예 안 쓰는 건 아닙니다.
//   아주 작은 이미지(아이콘 등)는 JSON 에 담아 보내기도 합니다.
//   하지만 사용자가 올리는 파일은 크기를 알 수 없으니 multipart 를 씁니다.


// ── 섹션 2: multipart/form-data 는 어떻게 생겼나 ──

// 실제로 서버에 도착하는 본문을 그대로 찍어 봅니다.
// express.json() 이 못 읽는 형식이라, 조각을 직접 모읍니다. (03단원 개념04)

app.post("/raw", (req, res) => {
  let 쌓은것 = "";

  req.setEncoding("utf-8");
  req.on("data", (조각) => (쌓은것 += 조각));
  req.on("end", () => {
    res.json({
      "Content-Type 헤더": req.get("Content-Type"),
      본문줄수: 쌓은것.split("\n").length,
      본문에담긴것: 쌓은것
        .split("\n")
        .filter((줄) => 줄.includes("Content-Disposition") || 줄.includes("Content-Type:"))
        .map((줄) => 줄.trim()),
    });
  });
});

// 확인: POST /raw multipart:@file=report.pdf&desc=hello
// 응답: 200

// ★ 터미널이 아니라 Postman 으로 직접 보내 보세요. 실제 본문은 이렇게 생겼습니다.
//
//   ------WebKitFormBoundaryABC123
//   Content-Disposition: form-data; name="desc"
//
//   설비 사진입니다
//   ------WebKitFormBoundaryABC123
//   Content-Disposition: form-data; name="file"; filename="작업표준서.pdf"
//   Content-Type: application/pdf
//
//   %PDF-1.4 ...(파일의 진짜 바이트)...
//   ------WebKitFormBoundaryABC123--
//
// 하나씩 보면
//
//   ------WebKitFormBoundary...   조각을 나누는 구분선(boundary)입니다.
//                                  본문에 절대 안 나올 만한 글자를 브라우저가 만듭니다.
//   Content-Disposition            이 조각이 무슨 필드인지 알려 줍니다.
//   filename=                      파일이면 원래 이름이 여기 붙습니다.
//   Content-Type                   파일이면 형식이 붙습니다.
//   (빈 줄)                        여기부터 내용입니다.
//
// ★ 글자 필드와 파일이 '한 요청 안에' 함께 들어 있습니다.
//   그래서 "사진 + 설명" 을 한 번에 보낼 수 있습니다.
//   multi(여럿) + part(조각) — 이름 그대로입니다.
//
// ★ Content-Type 헤더를 직접 쓰지 마세요
//   multipart/form-data; boundary=----WebKitFormBoundaryABC123
//   이 boundary 는 요청마다 다릅니다. 브라우저가 만들어 붙입니다.
//   우리가 직접 쓰면 boundary 가 안 맞아서 서버가 못 읽습니다. 섹션 4 에서 다시 봅니다.


// ── 섹션 3: express.json() 은 이걸 못 읽습니다 ──

app.post("/try-json-parser", (req, res) => {
  res.json({
    "req.body": req.body,
    타입: typeof req.body,
    설명: "express.json() 은 application/json 만 읽습니다. multipart 는 그냥 지나칩니다.",
  });
});

// 확인: POST /try-json-parser multipart:@file=report.pdf&desc=hello
// 응답: 200 {"타입":"undefined","설명":"express.json() 은 application/json 만 읽습니다. multipart 는 그냥 지나칩니다."}

// ★★ req.body 가 undefined 입니다.
//   (JSON.stringify 는 undefined 인 속성을 아예 빼고 찍습니다)
//
//   04단원 개념03 에서 본 그대로입니다.
//   express.json() 은 Content-Type 이 application/json 일 때만 일합니다.
//   multipart 요청은 "내가 읽을 게 아니네" 하고 그냥 넘깁니다.
//
//   express.urlencoded() 도 못 읽습니다. 이름이 비슷하지만 완전히 다른 형식입니다.
//
//   그래서 multipart 를 읽어 주는 도구가 따로 필요합니다. 그게 multer 입니다.


// ── 섹션 4: 프론트에서 보내는 법 ──

app.get("/", (req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>업로드 원리</title>
<style>body{font-family:"맑은 고딕",sans-serif;max-width:680px;margin:40px auto;padding:0 20px;line-height:1.7}
h1{border-bottom:3px solid #333;padding-bottom:8px}
.안내{background:#fff8dc;border-left:4px solid #f0c040;padding:12px 16px}
pre{background:#f5f5f5;border:1px solid #ddd;padding:12px;white-space:pre-wrap;word-break:break-all}
button{font-size:15px;padding:8px 16px;cursor:pointer}</style></head>
<body>
<h1>파일이 어떻게 가는지 보기</h1>
<p class="안내">파일을 하나 고르고 버튼을 누르세요.<br>
F12 → Network 에서 그 요청의 <b>Payload</b> 를 함께 보세요.</p>

<input type="file" id="파일" />
<input type="text" id="설명" placeholder="설명을 적으세요" value="설비 사진입니다" />
<button id="보내기">보내기</button>
<pre id="결과">아직 안 보냄</pre>

<script>
document.querySelector("#보내기").addEventListener("click", async () => {
  const 결과 = document.querySelector("#결과");
  const 파일 = document.querySelector("#파일").files[0];

  if (!파일) { 결과.textContent = "파일을 먼저 고르세요."; return; }

  // ★ FormData 를 쓰면 브라우저가 multipart 형식을 알아서 만들어 줍니다.
  const 폼 = new FormData();
  폼.append("file", 파일);
  폼.append("desc", document.querySelector("#설명").value);

  결과.textContent = "보내는 중...";

  // ★★ headers 를 직접 쓰지 마세요.
  //   Content-Type 을 우리가 쓰면 boundary 가 안 붙어서 서버가 못 읽습니다.
  const 응답 = await fetch("/raw", { method: "POST", body: 폼 });

  결과.textContent =
    "고른 파일: " + 파일.name + "\\n" +
    "크기: " + 파일.size + " 바이트\\n" +
    "형식: " + (파일.type || "(브라우저가 모름)") + "\\n\\n" +
    JSON.stringify(await 응답.json(), null, 2);
});
</script></body></html>`);
});

// 확인: GET /
// 응답: 200

// ★ HTML 폼으로도 보낼 수 있습니다. 자바스크립트 없이요.
//
//   <form action="/upload" method="post" enctype="multipart/form-data">
//     <input type="file" name="file" />
//     <input type="text" name="desc" />
//     <button>보내기</button>
//   </form>
//
//   enctype="multipart/form-data" 를 빼면 파일이 안 갑니다.
//   파일 '이름' 만 글자로 갑니다. 내용은 안 갑니다.
//   폼으로 업로드가 안 될 때 1번 원인입니다.


// ── 섹션 5: 서버가 받는 순간 무슨 일이 일어나나 ──

app.get("/what-happens", (req, res) => {
  res.json({
    순서: [
      "브라우저가 파일을 조각내어 보냅니다. 큰 파일은 여러 번에 나눠 옵니다.",
      "서버는 조각을 받는 대로 처리해야 합니다. 다 모을 때까지 기다리면 메모리가 찹니다.",
      "multer 가 조각을 받아 바로 디스크에 씁니다. (또는 메모리에 담습니다)",
      "다 받으면 req.file 에 정보를 담고 next() 를 부릅니다.",
      "우리 라우트가 실행됩니다. 이때 파일은 이미 저장이 끝난 상태입니다.",
    ],
    핵심: "multer 는 미들웨어입니다. 라우트가 실행될 때는 이미 저장이 끝나 있습니다.",
    주의: "그래서 '검사해서 거절' 을 하려면 저장 전에 해야 합니다. 개념03 에서 봅니다.",
  });
});

// 확인: GET /what-happens
// 응답: 200

// ★ 03단원 개념04 의 스트림 이야기가 여기서 다시 나옵니다.
//   "본문은 조각으로 온다" 를 배웠는데, 파일은 그게 훨씬 중요합니다.
//   500MB 동영상을 통째로 메모리에 올리면 서버가 죽습니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
  console.log("브라우저로 열어서 파일을 하나 보내 보세요.");
});


// ============================================================
// 세 가지 본문 형식 정리
// ============================================================
//
//   형식                                무엇을 담나              읽는 도구
//   ─────────────────────────────────────────────────────────────────
//   application/json                    글자·숫자·구조           express.json()
//   application/x-www-form-urlencoded   글자만 (짧은 폼)         express.urlencoded()
//   multipart/form-data                 글자 + 파일              multer
//
// ★ 셋 다 '본문에 담아 보내는 것' 입니다. 담는 방법이 다를 뿐입니다.
//   그래서 읽는 도구도 각각 다릅니다.
//
// ★ 하나의 요청에 하나의 형식만 쓸 수 있습니다.
//   "JSON 도 보내고 파일도 보내고" 는 안 됩니다.
//   파일이 있으면 multipart 를 쓰고, 글자 값은 그 안에 함께 담습니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 브라우저로 열어 파일을 보내고,
//                    F12 → Network → 그 요청 → Payload 를 보세요.
//                    boundary 글자가 어떻게 생겼나요?
//
// ✏️ 직접 해보기 2 — 같은 파일을 두 번 보내 보세요. boundary 가 같나요?
//
// ✏️ 직접 해보기 3 — 화면의 fetch 에 headers 를 직접 넣어 보세요.
//
//       headers: { "Content-Type": "multipart/form-data" }
//
//     서버가 본문을 읽나요? 왜 안 될까요? (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 4 — 아주 큰 파일(10MB 이상)을 골라 보내 보세요.
//                    Network 탭에서 시간이 얼마나 걸리나요?
//
// ✏️ 직접 해보기 5 — 확장자가 없는 파일을 골라 보세요.
//                    화면에 찍히는 '형식' 이 무엇으로 나오나요?
//                    브라우저는 형식을 어떻게 알아낼까요?
//
// ✏️ 직접 해보기 6 — HTML 폼 방식으로도 만들어 보세요.
//                    enctype 을 빼면 서버에 무엇이 도착하나요?


// ── 자주 하는 실수 ──

// [실수 1] JSON 에 파일을 담으려 함
//   JSON 은 글자만 담습니다. Base64 로 바꾸면 되지만 크기와 메모리 문제가 생깁니다.

// [실수 2] fetch 에 Content-Type 을 직접 씀
//   boundary 가 안 붙어서 서버가 조각을 못 나눕니다.
//   FormData 를 body 에 넣으면 브라우저가 알아서 붙입니다. 건드리지 마세요.

// [실수 3] HTML 폼에 enctype 을 안 씀
//   파일 이름만 글자로 가고 내용은 안 갑니다.

// [실수 4] express.json() 으로 파일을 받으려 함
//   req.body 가 undefined 입니다. multer 가 필요합니다.

// [실수 5] 파일을 통째로 메모리에 올림
//   큰 파일 하나로 서버가 멈출 수 있습니다. 디스크에 흘려보내야 합니다.

// [실수 6] 라우트에서 파일을 '받기 전에' 검사하려 함
//   multer 가 미들웨어라, 라우트가 실행될 때는 이미 저장이 끝나 있습니다.
//   검사는 multer 에게 시켜야 합니다. (개념03)


// ── 정리 ──

// 1. 파일은 JSON 으로 못 보낸다. JSON 은 글자만 담는 형식이다.
// 2. 그래서 multipart/form-data 라는 다른 형식을 쓴다.
//    구분선으로 조각을 나누고, 조각마다 이름과 내용을 담는다.
// 3. express.json() 은 이 형식을 못 읽는다. 읽는 도구가 따로 필요하다(multer).
// 4. fetch 로 보낼 때 Content-Type 을 직접 쓰지 않는다.
//    구분선 값이 들어가야 하는데 그건 브라우저만 안다. FormData 를 주면 알아서 붙인다.
// 5. HTML 폼으로 보낼 때는 enctype="multipart/form-data" 를 반드시 적는다.
// 6. 파일을 통째로 메모리에 올리지 않는다. 큰 파일 몇 개면 서버가 넘어간다.
// 7. 검사는 파일을 받은 뒤에 한다. 받기 전에는 무엇이 오는지 알 수 없다.
