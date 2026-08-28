// ============================================================
// 08단원 · 개념 05 — 프론트와 붙이는 세 가지 방법
// ------------------------------------------------------------
// 실행: node 개념05_프론트와_붙이는_세_가지_방법.js
//       끄려면 Ctrl + C
//
// ★ 이 파일은 서버를 '두 개' 띄웁니다.
//   API 서버 하나, 프론트 서버 하나. 실제 상황을 흉내 내기 위해서입니다.
// ============================================================
//
// 프론트엔드와 백엔드를 붙이는 방법은 셋뿐입니다.
//
//   ① 같은 서버가 화면도 준다        → CORS 문제 없음 (개념01)
//   ② 출처가 다르고 CORS 를 연다      → 개념03·04
//   ③ 프론트 서버가 대신 전달해 준다   → 프록시. 이번 파일의 주제
//
// React·Vue 를 쓰면 개발 중에는 ③을 씁니다.
// 무슨 일이 일어나는지 모르고 쓰는 사람이 많습니다. 직접 만들어 봅시다.

const express = require("express");

// ★★ Number() 를 꼭 씌우세요. 안 그러면 서버가 안 켜집니다.
//
//   process.env.PORT 는 '글자' 입니다. 환경변수는 언제나 글자입니다.
//   Number 없이 PORT + 100 을 하면 더하기가 아니라 '이어 붙이기' 가 됩니다.
//
//     "3000" + 100  →  "3000100"     ← 이런 포트는 없습니다
//     3000 + 100    →  3100          ← 이게 맞습니다
//
//   이 파일을 만들 때 실제로 이 실수를 했습니다.
//   에러 메시지가 포트 이야기를 안 해서 원인을 찾는 데 한참 걸렸습니다.
//
//   쿼리(04단원), 경로 파라미터(04단원), 환경변수(여기) —
//   밖에서 들어오는 값은 전부 글자입니다. 숫자로 쓸 거면 Number 를 거치세요.
const PORT = Number(process.env.PORT) || 3000;
const API포트 = PORT + 100; // API 서버는 다른 포트에서 돕니다


// ============================================================
// 1부 — API 서버 (다른 포트에서 도는 백엔드)
// ============================================================

const api = express();
api.use(express.json());

// ★ CORS 를 하나도 안 열었습니다. 일부러입니다.
//   프록시를 쓰면 CORS 가 필요 없다는 것을 보여 주려고요.

const 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
];

api.get("/api/v1/equipments", (req, res) => {
  res.set("X-Total-Count", String(설비들.length));
  res.json({ data: 설비들 });
});

api.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};

  if (!name || !line) {
    return res.status(400).json({ error: { code: "VALIDATION_FAILED", message: "name 과 line 이 필요합니다" } });
  }

  res.status(201).json({ data: { id: 3, name, line, status: "정지" } });
});

api.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});


// ============================================================
// 2부 — 프론트 서버 (화면을 주고, API 요청을 대신 전달)
// ============================================================

const app = express();
app.use(express.json());


// ── 섹션 1: 프록시란 무엇인가 ──

// 프록시(proxy)는 '대신 해 주는 것' 입니다.
//
//   프록시 없이
//     브라우저 ──────────────→ API 서버 (다른 출처. 막힘)
//
//   프록시로
//     브라우저 ──→ 프론트 서버 ──→ API 서버
//                  (같은 출처)      (서버끼리라 CORS 없음)
//
// 브라우저가 보기에는 같은 출처와만 이야기합니다. 그래서 CORS 가 안 걸립니다.
// 프론트 서버가 뒤에서 몰래 API 서버에 다녀오는 것이죠.

app.use("/api", async (req, res, next) => {
  // 브라우저가 /api/v1/equipments 를 부르면
  // 우리가 대신 http://localhost:API포트/api/v1/equipments 를 부릅니다.
  const 진짜주소 = `http://localhost:${API포트}${req.originalUrl}`;

  try {
    const 보낼것 = {
      method: req.method,
      headers: {},
    };

    // 본문이 있는 요청만 본문을 실어 보냅니다.
    if (req.method !== "GET" && req.method !== "HEAD") {
      보낼것.headers["Content-Type"] = "application/json";
      보낼것.body = JSON.stringify(req.body ?? {});
    }

    // 증표는 그대로 전달합니다. 없으면 안 붙입니다.
    const 증표 = req.get("Authorization");
    if (증표) 보낼것.headers["Authorization"] = 증표;

    const 응답 = await fetch(진짜주소, 보낼것);
    const 글자 = await 응답.text();

    // 상태코드와 몇몇 헤더를 그대로 옮깁니다.
    res.status(응답.status);

    const 형식 = 응답.headers.get("Content-Type");
    if (형식) res.set("Content-Type", 형식);

    const 개수 = 응답.headers.get("X-Total-Count");
    if (개수) res.set("X-Total-Count", 개수);

    res.send(글자);
  } catch (에러) {
    // API 서버가 꺼져 있으면 여기로 옵니다.
    next(에러);
  }
});

// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: x-total-count=2 | access-control-allow-origin=(없음)

// 확인: POST /api/v1/equipments {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}

// 확인: POST /api/v1/equipments {"name":"용접로봇 1호"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"name 과 line 이 필요합니다"}}

// 확인: GET /api/v1/없는것
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"찾을 수 없습니다"}}

// ★★★ Allow-Origin 헤더가 없습니다. 그런데도 브라우저에서 잘 됩니다.
//
//   왜냐하면 브라우저는 프론트 서버(같은 출처)와만 이야기했기 때문입니다.
//   CORS 를 따질 일이 아예 없습니다.
//
//   API 서버는 CORS 를 한 줄도 안 열었습니다. 그래도 됩니다.
//   요청을 보낸 것이 브라우저가 아니라 프론트 서버(Node)니까요.
//
// ★ 상태코드와 에러도 그대로 전달됩니다.
//   400 이든 404 든 API 서버가 준 그대로 브라우저에 갑니다.
//   프록시는 '전달' 만 합니다. 내용을 바꾸지 않습니다.


// ── 섹션 2: 화면 ──

app.get("/", (req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>프록시 확인</title>
<style>body{font-family:"맑은 고딕",sans-serif;max-width:640px;margin:40px auto;padding:0 20px;line-height:1.7}
pre{background:#f5f5f5;border:1px solid #ddd;padding:12px;white-space:pre-wrap}
button{font-size:15px;padding:8px 16px;cursor:pointer}</style></head>
<body>
<h1>프록시로 부르기</h1>
<p>이 화면은 <b>${PORT}</b> 번 포트가 주었습니다.<br>
API 서버는 <b>${API포트}</b> 번 포트에서 돌고 있고, CORS 를 하나도 안 열었습니다.</p>
<button id="누르기">설비 목록 불러오기</button>
<pre id="결과">버튼을 누르세요.</pre>
<script>
document.querySelector("#누르기").addEventListener("click", async () => {
  const 결과 = document.querySelector("#결과");
  결과.textContent = "불러오는 중...";
  try {
    // ★ 주소를 반쪽만 씁니다. 지금 페이지와 같은 곳으로 갑니다.
    const 응답 = await fetch("/api/v1/equipments");
    const 답 = await 응답.json();
    결과.textContent =
      "성공 " + 응답.status + "\\n" +
      "X-Total-Count: " + 응답.headers.get("X-Total-Count") + "\\n\\n" +
      JSON.stringify(답, null, 2);
  } catch (에러) {
    결과.textContent = "실패: " + 에러.message;
  }
});
</script></body></html>`);
});

// 확인: GET /
// 응답: 200


// ── 섹션 3: 실제로는 직접 안 만듭니다 ──

app.get("/real-world", (req, res) => {
  res.json({
    설명: "React·Vue 개발 서버에 프록시 기능이 이미 있습니다. 설정 몇 줄이면 됩니다.",
    Vite: {
      파일: "vite.config.js",
      설정: "server: { proxy: { '/api': 'http://localhost:3000' } }",
      뜻: "/api 로 시작하는 요청은 3000 번으로 대신 보내 줘",
    },
    CRA: {
      파일: "package.json",
      설정: '"proxy": "http://localhost:3000"',
      뜻: "내가 못 찾는 요청은 3000 번으로 보내 줘",
    },
    Next: {
      파일: "next.config.js",
      설정: "rewrites() { return [{ source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' }] }",
    },
    Express에서: "http-proxy-middleware 패키지를 씁니다. 지금 만든 것을 훨씬 잘 해 줍니다.",
  });
});

// 확인: GET /real-world
// 응답: 200

// ★ 우리가 만든 프록시는 아주 단순합니다.
//   실제 프록시는 이런 것들까지 처리합니다.
//     · 파일 업로드처럼 큰 본문을 통째로 안 읽고 흘려보내기 (09단원)
//     · 쿠키와 헤더를 정확히 옮기기
//     · 웹소켓 연결 전달하기
//     · 연결이 끊겼을 때 처리
//
//   그래서 실무에서는 직접 안 만듭니다. 다만 무슨 일이 일어나는지는 알아야 합니다.


// ── 섹션 4: 세 가지 방법 비교 ──

app.get("/compare", (req, res) => {
  res.json({
    같은서버가화면도줌: {
      CORS: "필요 없음",
      장점: "설정이 없습니다. 배포도 서버 하나면 끝",
      단점: "화면을 고칠 때마다 서버에 다시 올려야 합니다",
      언제: "관리자 화면, 작은 프로젝트, 사내 도구",
    },
    CORS를연다: {
      CORS: "필요함",
      장점: "프론트와 백엔드를 완전히 따로 배포할 수 있습니다",
      단점: "허용 목록을 관리해야 합니다. 주소가 바뀌면 서버도 고쳐야 합니다",
      언제: "프론트를 S3·Vercel 같은 곳에 따로 올릴 때",
    },
    프록시: {
      CORS: "필요 없음",
      장점: "프론트가 주소를 '/api/...' 로만 씁니다. 개발이 편합니다",
      단점: "프록시가 한 단계 더 거칩니다. 배포할 때 따로 설정이 필요합니다",
      언제: "React·Vue 개발 중. 그리고 배포에서도 Nginx 로 같은 구조를 만듭니다",
    },
  });
});

// 확인: GET /compare
// 응답: 200


// ── 섹션 5: 배포하면 무엇이 바뀌나 ──

app.get("/deploy", (req, res) => {
  res.json({
    개발중: "프론트 5173, 백엔드 3000. 프록시로 붙임",
    배포후: [
      "프론트를 빌드하면 HTML·CSS·JS 파일 몇 개가 나옵니다.",
      "그 파일들을 Nginx 나 S3 에 올립니다.",
      "Nginx 가 /api 로 오는 요청만 백엔드로 넘깁니다. 개발할 때의 프록시와 같은 구조입니다.",
      "브라우저가 보기에는 전부 한 주소입니다. 그래서 CORS 가 필요 없습니다.",
    ],
    그런데: "프론트를 Vercel 에, 백엔드를 다른 곳에 올리면 출처가 달라집니다. 그때는 CORS 를 열어야 합니다.",
    결론: "개발 중에 어떻게 했든, 배포 구조에 따라 다시 정해야 합니다. PART 4 에서 합니다.",
  });
});

// 확인: GET /deploy
// 응답: 200

// ★★ 가장 흔한 사고
//   개발 중에는 프록시라 잘 되다가, 배포하고 나서 CORS 에러가 납니다.
//   개발 환경과 배포 환경의 구조가 다르기 때문입니다.
//
//   막으려면 배포 구조를 미리 정하고, 개발에서도 비슷하게 맞춰 두는 게 좋습니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[프록시 에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(502).json({
    error: { code: "BAD_GATEWAY", message: "API 서버에 연결하지 못했습니다" },
  });
});

// ★ 502 Bad Gateway
//   "내가 대신 물어보러 갔는데 그쪽이 답을 안 준다" 는 뜻입니다.
//   프록시가 있을 때만 나오는 상태코드입니다.
//   500 과 구별해서 쓰면 원인을 훨씬 빨리 찾습니다.


// ── 두 서버를 함께 켭니다 ──

api.listen(API포트, () => {
  console.log(`API 서버:    http://localhost:${API포트}  (CORS 안 열었음)`);

  app.listen(PORT, () => {
    console.log(`프론트 서버: http://localhost:${PORT}      (프록시 있음)`);
    console.log("");
    console.log(`브라우저로 http://localhost:${PORT} 를 열고 버튼을 눌러 보세요.`);
    console.log(`직접 http://localhost:${API포트}/api/v1/equipments 를 열어 봐도 됩니다.`);
  });
});


// ============================================================
// 무엇을 고를까
// ============================================================
//
//   화면이 몇 개 안 되고 혼자 만든다
//     → ① 같은 서버. public 폴더에 넣으면 끝입니다.
//
//   React·Vue 로 만들고, 프론트 담당이 따로 있다
//     → 개발 중에는 ③ 프록시, 배포는 구조에 따라 ①이나 ②
//
//   프론트를 Vercel·S3 에 올리고 백엔드는 따로 둔다
//     → ② CORS. 허용 목록을 환경변수로 관리하세요.
//
//   모바일 앱도 이 API 를 쓴다
//     → 앱은 브라우저가 아니라 CORS 와 무관합니다.
//       대신 인증(05단원)이 더 중요해집니다.
//
// ★ 어느 쪽이든 인증은 따로 해야 합니다.
//   CORS 는 보안이 아닙니다. 개념03 섹션 2 에서 본 그대로입니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 브라우저로 이 서버(3000)를 열고 버튼을 눌러 보세요.
//                    F12 → Network 에서 요청 주소가 무엇인가요?
//                    3100 번이 보이나요?
//
// ✏️ 직접 해보기 2 — 브라우저 주소창에 http://localhost:3100/api/v1/equipments
//                    를 직접 쳐 보세요. 나오나요?
//                    같은 주소를 front/다른출처.html 에서 부르면요?
//
// ✏️ 직접 해보기 3 — 프록시 안의 fetch 주소를 없는 포트로 바꿔 보세요.
//                    버튼을 누르면 어떤 상태코드가 나오나요?
//                    502 가 왜 맞는 답인지 설명해 보세요.
//
// ✏️ 직접 해보기 4 — 프록시에서 Authorization 전달 부분을 지워 보세요.
//                    05단원의 인증이 붙은 API 라면 무슨 일이 생길까요?
//
// ✏️ 직접 해보기 5 — 프록시가 X-Total-Count 를 안 옮기게 바꿔 보세요.
//                    화면에 어떻게 나오나요?
//                    (개념03 의 Expose-Headers 문제와 증상이 같습니다)
//
// ✏️ 직접 해보기 6 — API 서버에 cors 를 붙이고, 프록시를 지워 보세요.
//                    화면의 fetch 주소를 http://localhost:3100/... 으로 바꾸면
//                    ②번 방법이 됩니다. 둘 다 되는지 확인하세요.


// ── 자주 하는 실수 ──

// [실수 1] 프록시를 쓰면서 프론트에서 전체 주소를 씀
//   fetch("http://localhost:3000/api/...") 라고 쓰면 프록시를 건너뜁니다.
//   그러면 다시 CORS 문제가 됩니다. "/api/..." 로만 쓰세요.

// [실수 2] 프록시가 헤더를 안 옮김
//   Authorization 을 안 옮기면 전부 401 이 됩니다.
//   Content-Type 을 안 옮기면 본문이 안 읽힙니다.

// [실수 3] 개발에서만 확인하고 배포함
//   프록시는 개발 서버 기능입니다. 배포하면 사라집니다.
//   Nginx 설정이나 CORS 를 따로 준비해야 합니다.

// [실수 4] 프록시 에러를 500 으로 냄
//   내 코드가 터진 게 아니라 상대가 응답을 안 준 것입니다. 502 가 정확합니다.

// [실수 5] CORS 와 프록시를 둘 다 씀
//   틀리지는 않지만, 어느 쪽이 동작하는지 헷갈립니다. 하나만 고르세요.

// [실수 6] "프록시를 쓰면 인증이 필요 없다" 고 생각
//   프록시는 출처 문제만 없앱니다. 누가 부르는지는 여전히 확인해야 합니다.


// ── 정리 ──

// 1. 프론트와 붙이는 방법은 셋이다 — CORS 열기 · 프록시 · 같은 서버에서 함께 주기.
// 2. 프록시는 프론트 쪽 서버가 요청을 대신 받아 백엔드로 넘겨 주는 것이다.
//    브라우저가 보기에는 같은 출처라 CORS 가 아예 안 생긴다.
// 3. 프록시를 쓰면 프론트에서 전체 주소를 쓰지 않는다. /api/... 처럼 상대 주소로 쓴다.
//    전체 주소를 쓰면 프록시를 지나치지 않고 곧장 가서 다시 막힌다.
// 4. 프록시가 헤더를 안 옮기면 인증이 통째로 빠진다.
// 5. 프록시를 쓴다고 인증이 필요 없어지는 것이 아니다. 출처만 같아 보이게 만든 것이다.
// 6. CORS 와 프록시를 둘 다 켜지 않는다. 문제가 생겼을 때 어디가 원인인지 못 가린다.
// 7. 개발에서만 확인하고 배포하지 않는다. 배포하면 출처가 바뀐다.
// 8. 실제로는 프록시를 직접 만들 일이 거의 없다. Vite 같은 도구가 해 준다.
//    다만 무엇을 해 주는지는 알고 써야 문제가 생겼을 때 찾을 수 있다.
