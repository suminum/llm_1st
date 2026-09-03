// ============================================================
// 08단원 서버 연습문제 — 화면도 주고 CORS 도 여는 서버
// ------------------------------------------------------------
// 실행: npx nodemon 연습문제_서버.js
// ============================================================
//
// ★ 이 문제의 목적
//   한 서버가 세 가지를 동시에 하게 만드는 것입니다.
//
//     ① 화면(HTML·CSS·JS)을 준다        → 같은 출처라 CORS 불필요
//     ② 공개 API 를 아무나 쓰게 연다      → *
//     ③ 내부 API 를 정해진 곳만 쓰게 연다 → 허용 목록
//
//   그리고 확인은 '세 가지 방법' 으로 합니다.
//     같은 출처(브라우저) · 다른 출처(브라우저) · 브라우저가 아닌 곳(Postman)
//
// ★ 세 번째 확인이 이 단원의 결론입니다.

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ★ Number() 를 씌운 것에 주의하세요.
//   환경변수는 언제나 '글자' 입니다. 숫자로 쓸 거면 반드시 바꿔야 합니다.
//   (개념05 에서 이 실수로 서버가 안 켜졌습니다)

app.use(express.json());

// ───── 문제 1 ───── 출처 판단 함수
// 연습문제.js 문제 3의 허용인가(출처) 를 여기로 가져오세요.
// 그리고 cors 가 쓸 수 있는 모양으로 감싸세요.
//
//   function 출처판단(출처, 알려주기) {
//     알려주기(null, 허용인가(출처));
//   }
//
// ★ 거절할 때 에러를 던지지 마세요. 500 이 됩니다.
//   알려주기(null, false) 로 "허락 안 함" 을 알립니다.
//
// 허용목록: ["http://localhost:5500", "http://localhost:5173"]
// 그리고 example.com 과 그 하위 도메인

// TODO: 여기에 코드를
const 허용목록 = ["http://localhost:5500", "http://localhost:5173"];

function 허용인가(출처) {
  // Postman·curl·같은 출처 요청에는 Origin 이 없습니다.
  if (출처 === undefined) return true;

  if (허용목록.includes(출처)) return true;

  try {
    // ★ 글자로 비교하지 않고 hostname 을 꺼내서 비교합니다.
    //   includes("example.com") 로 하면 example.com.evil.net 이 통과합니다.
    const 호스트 = new URL(출처).hostname;
    return 호스트 === "example.com" || 호스트.endsWith(".example.com");
  } catch {
    return false;
  }
}

function 출처판단(출처, 알려주기) {
  //출처 검사할값
  // ★ 거절할 때 에러를 던지지 마세요. 500 이 됩니다.
  알려주기(null, 허용인가(출처)); //에러 ,결과 -> 검사 결과를 전달할 함수
}
app.use("/public-api", cors());
app.get("/public-api/notice ", (req, res) => {
  res.json({ data: { 제목: "8월 정기 점검 안내", 작성일: "2026-08-01" } });
});

// ───── 문제 2 ───── 공개 API 는 아무나
// /public-api 아래를 아무 출처나 읽을 수 있게 하세요.
// 그리고 GET /public-api/notice 를 만드세요.
//
// 기대 결과:
//   GET /public-api/notice  (Origin 이 무엇이든)
//     →  200  {"data":{"제목":"8월 정기 점검 안내","작성일":"2026-08-01"}}
//     헤더에 Access-Control-Allow-Origin: *
//
// ★ * 를 써도 되는 경우인지 판단해 보세요.
//   로그인이 필요 없고, 누가 봐도 상관없고, 쿠키를 안 쓰는 자료인가요?

// TODO: 여기에 코드를 쓰세요
app.use("/api", cors()); //q보통 cors 조건검사는위에서 거침 이 주소가 접근가능한 주소인지
app.get("/public-api/notice", (req, res) => {
  res.json({ data: { 제목: "8월 정기 점검 안내", 작성일: "2026-08-01" } });
});

// ───── 문제 3 ───── 내부 API 는 허용 목록만
// /api 아래에 cors 를 붙이세요. 옵션은 이렇게 주세요.
//
//   origin           문제 1의 출처판단 함수
//   methods          GET, POST, PATCH, DELETE
//   allowedHeaders   Content-Type, Authorization
//   exposedHeaders   X-Total-Count
//   maxAge           600
//
// 그리고 두 주소를 만드세요. 둘 다 X-Total-Count 헤더를 붙입니다.
//
//   GET /api/v1/equipments
//   GET /api/v1/equipments-with-count
//     ← front/다른출처.html 의 ⑤ 버튼이 이 주소를 부릅니다.
//       08단원의 모든 서버를 같은 페이지로 확인하려고 이름을 맞춰 둔 것입니다.
//
// 기대 결과:
//   Origin: http://localhost:5500          → 200, Allow-Origin 있음, X-Total-Count 읽힘
//   Origin: https://sub.example.com        → 200, Allow-Origin 있음
//   Origin: https://example.com.evil.net   → 200, Allow-Origin 없음  ★
//
// ★★ 세 번째를 보세요. 데이터는 그대로 나갑니다.
//   서버가 막는 게 아니라 헤더를 안 붙일 뿐입니다.
//   이게 "CORS 는 보안이 아니다" 의 증거입니다.

// TODO: 여기에 코드를 쓰세요

// ───── 문제 4 ───── 프리플라이트
// POST /api/v1/equipments 와 DELETE /api/v1/equipments/:id 를 만드세요.
//
//   POST   name 과 line 이 없으면 400, 있으면 201
//   DELETE 204. 그리고 터미널에 "★ DELETE 가 서버까지 도착했습니다" 를 찍으세요
//
// ★ OPTIONS 라우트는 만들지 마세요. cors 가 알아서 합니다.
//
// 기대 결과:
//   OPTIONS /api/v1/equipments  (허용 출처)
//     →  204, Allow-Methods 와 Allow-Headers 와 Max-Age 가 있음
//   POST    (허용 출처, 정상 본문)   →  201, Allow-Origin 있음
//   DELETE  (허용 출처)              →  204, 터미널에 ★ 찍힘
//   OPTIONS (거절 출처)              →  ?
//
// ★★ 마지막 상태코드를 직접 확인해 보세요. 204 일까요 404 일까요?
//   origin 을 '함수' 로 줬는지 '배열' 로 줬는지에 따라 다릅니다.
//   왜 그런지, 브라우저 입장에서는 차이가 있는지 설명해 보세요.
//   (개념04 섹션 4 아래에 재 본 결과가 있습니다)

// TODO: 여기에 코드를 쓰세요

// ───── 문제 5 ───── 정적 파일
// public 폴더를 정적으로 서비스하세요.
//
// ★★ 어디에 두어야 할까요? API 라우트보다 위일까요 아래일까요?
//   public 안에 실수로 api 라는 폴더가 생기면 어떻게 될지 생각해 보세요.
//   에러가 나나요, 조용히 이상해지나요?
//
// 기대 결과:
//   GET /                →  200 (public/index.html)
//   GET /css/공통.css     →  200

// TODO: 여기에 코드를 쓰세요

// ───── 문제 6 ───── 404 와 에러 처리기
// 개념03·04 와 같습니다.
//
// 기대 결과:
//   GET /없는주소  →  404 {"error":{"code":"NOT_FOUND","message":"찾을 수 없습니다"}}

// TODO: 여기에 코드를 쓰세요

app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
});

// ============================================================
// 세 가지 방법으로 확인하기
// ============================================================
//
// ── ① 같은 출처 ──
//
//   브라우저로 http://localhost:3000 을 엽니다.
//   버튼을 누르면 목록이 나옵니다.
//   F12 → Network 에서 Origin 헤더가 있나요? 없을 것입니다. 같은 출처니까요.
//
// ── ② 다른 출처 (CORS) ──
//
//   front/다른출처.html 을 다른 포트로 엽니다.
//     · VS Code 라면 우클릭 → Open with Live Server (보통 5500)
//     · 또는 터미널을 하나 더 열어  npx serve front
//
//   다섯 버튼을 전부 눌러 보세요.
//     ① 단순 GET       → 성공
//     ② POST + JSON    → 성공 (프리플라이트가 통과했다는 뜻)
//     ③ Authorization  → 성공 (Allow-Headers 가 있다는 뜻)
//     ④ DELETE         → 성공 (Allow-Methods 가 있다는 뜻)
//     ⑤ 응답 헤더 읽기  → X-Total-Count 가 숫자로 보여야 합니다
//
//   ⑤가 "못 읽음 (null)" 이면 exposedHeaders 를 빠뜨린 것입니다.
//
// ── ③ 브라우저가 아닌 곳 ──
//
//   Postman 으로 GET http://localhost:3000/api/v1/equipments 를 부릅니다.
//   Headers 에 Origin: https://example.com.evil.net 을 직접 넣어 보세요.
//
//   데이터가 그대로 나옵니다. Allow-Origin 헤더만 없습니다.
//
// ★★★ ③이 이 단원의 결론입니다.
//   CORS 로는 아무것도 못 막습니다.
//   진짜로 막으려면 05단원의 인증을 붙여야 합니다.

// ============================================================
// 다 만든 뒤 답해 보세요
// ============================================================
//
// ① ②번 확인에서 ②번 버튼(POST)을 누를 때 Network 탭에 요청이 몇 개 보이나요?
//    앞엣것의 Method 는 무엇인가요?
//    __________________________________________
//
// ② exposedHeaders 를 빼면 ⑤번 버튼이 어떻게 되나요?
//    에러가 나나요? 콘솔에 뭐라도 나오나요?
//    __________________________________________
//
// ③ allowedHeaders 에서 Authorization 을 빼면 ③번 버튼이 어떻게 되나요?
//    콘솔 메시지를 그대로 적어 보세요.
//    __________________________________________
//
// ④ methods 에서 DELETE 를 빼고 ④번을 누르면,
//    터미널에 "★ DELETE 가 서버까지 도착했습니다" 가 찍히나요?
//    그게 무슨 뜻인가요?
//    __________________________________________
//
// ⑤ ③번 확인(Postman)에서 데이터가 그대로 나온 것을 보고,
//    "CORS 로 API 를 보호한다" 는 말이 왜 틀렸는지 설명해 보세요.
//    __________________________________________
//
// ⑥ 정적 파일을 API 라우트 위에 두면 무엇이 위험한가요?
//    실제로 public 안에 api 폴더를 만들어 확인해 보세요.
//    __________________________________________

// ============================================================
// 잘 안 될 때 보는 곳
// ============================================================
//
// 화면은 나오는데 버튼이 안 됨 (같은 출처)
//   → CORS 문제가 아닙니다. API 라우트나 주소를 확인하세요.
//
// TypeError: Failed to fetch
//   → F12 → Console 의 빨간 글씨를 끝까지 읽으세요. 진짜 이유는 거기 있습니다.
//
// GET 은 되는데 POST 만 안 됨
//   → 프리플라이트입니다. cors 를 라우트보다 위에 붙였는지 확인하세요.
//
// 콘솔에 preflight 이라는 단어가 보임
//   → OPTIONS 응답 문제입니다. 진짜 요청이 아니라 그 앞 요청을 보세요.
//
// 200 인데 X-Total-Count 가 null
//   → exposedHeaders 입니다. 에러가 안 나니 이걸 떠올려야 합니다.
//
// OPTIONS 가 404 로 찍힘
//   → origin 을 함수로 줬고, 그 함수가 false 를 돌려준 것입니다. 정상입니다.
//
// 서버가 안 켜지고 포트 관련 에러
//   → Number(process.env.PORT) 를 안 썼습니다. "3000" + 100 은 "3000100" 입니다.
//
// Postman 은 되는데 브라우저만 안 됨
//   → 정상입니다. CORS 는 브라우저만 따집니다. 그게 이 단원의 핵심입니다.
