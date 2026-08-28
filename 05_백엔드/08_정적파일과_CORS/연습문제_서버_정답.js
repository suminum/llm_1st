// ============================================================
// 08단원 서버 연습문제 정답 — 화면도 주고 CORS 도 여는 서버
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// ───── 문제 1 ───── 출처 판단 함수
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
  // ★ 거절할 때 에러를 던지지 마세요. 500 이 됩니다.
  알려주기(null, 허용인가(출처));
}


// ───── 문제 2 ───── 공개 API 는 아무나
app.use("/public-api", cors());

app.get("/public-api/notice", (req, res) => {
  res.json({ data: { 제목: "8월 정기 점검 안내", 작성일: "2026-08-01" } });
});

// 확인: GET /public-api/notice [Origin: http://anywhere.example.net]
// 응답: 200 {"data":{"제목":"8월 정기 점검 안내","작성일":"2026-08-01"}}
// 헤더: access-control-allow-origin=*

// ★ 로그인이 필요 없고, 누가 봐도 상관없는 자료에만 * 를 씁니다.
//
// ★ 시험용 출처를 영어로 쓴 이유
//   헤더 값에는 한글을 담을 수 없습니다. (05단원 개념02 섹션 4-2)
//   Origin 에 한글 도메인을 넣으면 요청 자체가 안 나갑니다.


// ───── 문제 3 ───── 내부 API 는 허용 목록만
app.use(
  "/api",
  cors({
    origin: 출처판단,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 600,
  })
);

const 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
];

app.get("/api/v1/equipments", (req, res) => {
  res.set("X-Total-Count", String(설비들.length));
  res.json({ data: 설비들 });
});

// 확인: GET /api/v1/equipments [Origin: http://localhost:5500]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-expose-headers=X-Total-Count | vary=Origin | x-total-count=2

// 확인: GET /api/v1/equipments [Origin: https://sub.example.com]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=https://sub.example.com

// 확인: GET /api/v1/equipments [Origin: https://example.com.evil.net]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=(없음)

// ★★ 세 번째를 보세요. 비슷하게 생긴 도메인을 막았습니다.
//   hostname 을 꺼내 비교했기 때문입니다.
//   그리고 데이터는 그대로 나갔다는 것도 보세요. 서버는 안 막습니다.


// front/다른출처.html 의 ⑤ 버튼이 부르는 주소입니다.
// 08단원의 모든 서버가 같은 페이지로 확인할 수 있게 맞춰 두었습니다.
app.get("/api/v1/equipments-with-count", (req, res) => {
  res.set("X-Total-Count", String(설비들.length));
  res.json({ data: 설비들 });
});

// 확인: GET /api/v1/equipments-with-count [Origin: http://localhost:5500]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=http://localhost:5500 | x-total-count=2 | access-control-expose-headers=X-Total-Count


// ───── 문제 4 ───── 프리플라이트
app.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};

  if (!name || !line) {
    return res.status(400).json({
      error: { code: "VALIDATION_FAILED", message: "name 과 line 이 필요합니다" },
    });
  }

  res.status(201).json({ data: { id: 3, name, line, status: "정지" } });
});

app.delete("/api/v1/equipments/:id", (req, res) => {
  console.log(`   ★ DELETE 가 서버까지 도착했습니다. id=${req.params.id}`);
  res.sendStatus(204);
});

// 확인: OPTIONS /api/v1/equipments [Origin: http://localhost:5500; Access-Control-Request-Method: POST; Access-Control-Request-Headers: content-type]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-allow-methods=GET,POST,PATCH,DELETE | access-control-allow-headers=Content-Type,Authorization | access-control-max-age=600

// 확인: POST /api/v1/equipments [Origin: http://localhost:5500] {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}
// 헤더: access-control-allow-origin=http://localhost:5500

// 확인: DELETE /api/v1/equipments/1 [Origin: http://localhost:5500]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500

// 확인: OPTIONS /api/v1/equipments [Origin: https://example.com.evil.net; Access-Control-Request-Method: POST]
// 응답: 404
// 헤더: access-control-allow-origin=(없음)

// ★ 마지막 — 허락 안 한 출처에는 프리플라이트 응답에도 헤더를 안 줍니다.
//   브라우저는 진짜 요청을 아예 안 보냅니다. 터미널의 ★ 도 안 찍힙니다.
//
// ★★ 그런데 상태코드가 204 가 아니라 404 입니다. 왜일까요?
//
//   origin 을 '함수' 로 준 경우, 그 함수가 false 를 돌려주면
//   cors 패키지는 응답을 만들지 않고 next() 를 부릅니다.
//   그래서 요청이 아래로 흘러가 404 처리기까지 내려갑니다.
//
//   origin 을 '배열' 로 주면 다릅니다. 직접 재 본 결과입니다.
//
//     origin 설정   허용 출처              거절 출처
//     ─────────────────────────────────────────────────
//     배열          204 + Allow-Origin     204, 헤더 없음
//     함수(false)   204 + Allow-Origin     404, 헤더 없음
//
//   브라우저 입장에서는 둘 다 똑같이 막힙니다.
//   Allow-Origin 헤더가 없으면 상태코드가 무엇이든 거절이니까요.
//
//   다만 서버 기록을 볼 때 헷갈릴 수 있습니다.
//   "OPTIONS 가 404 로 잔뜩 찍히는데요?" → 허락 안 한 출처가 두드리고 있는 것입니다.


// ───── 문제 5 ───── 정적 파일
// ★ API 라우트보다 아래에 두었습니다.
//   public 안에 api 라는 폴더가 생겨도 API 가 먼저 걸리게 하려는 것입니다.
app.use(express.static(path.join(__dirname, "public")));

// 확인: GET /
// 응답: 200

// 확인: GET /css/공통.css
// 응답: 200

// ★ 같은 출처라 CORS 가 필요 없습니다.
//   http://localhost:3000 으로 열면 화면과 API 가 같은 곳에서 옵니다.


// ───── 문제 6 ───── 404 와 에러 처리기
app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

// 확인: GET /없는주소
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"찾을 수 없습니다"}}

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" },
  });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
  console.log(`허용 출처: ${허용목록.join(", ")} + *.example.com`);
});


// ============================================================
// 세 가지 방법으로 확인하기
// ============================================================
//
//   ① 같은 출처
//      http://localhost:3000 을 브라우저로 엽니다.
//      버튼을 누르면 목록이 나옵니다. CORS 가 전혀 안 걸립니다.
//
//   ② 다른 출처 (CORS)
//      front/다른출처.html 을 Live Server(5500)로 엽니다.
//      다섯 버튼이 전부 됩니다. ⑤에서 X-Total-Count 도 읽힙니다.
//
//   ③ 브라우저가 아닌 곳
//      Postman 으로 부릅니다. 잘 됩니다.
//      Headers 에 Origin: https://example.com.evil.net 을 넣어 보세요.
//      데이터가 그대로 나옵니다. Allow-Origin 헤더만 없습니다.
//
// ★ ③이 중요합니다. CORS 로는 아무것도 못 막습니다.
//   진짜로 막으려면 05단원의 인증을 붙여야 합니다.


// ============================================================
// 이 서버의 구조
// ============================================================
//
//   app.use(express.json())              본문 읽기
//   app.use("/public-api", cors())       공개 API 는 누구나
//   app.use("/api", cors({ 목록 }))       내부 API 는 허용 목록만
//   app.get("/api/...")                  API 라우트들
//   app.use(express.static("public"))    화면 (API 아래에)
//   app.use(404)                         못 찾음
//   app.use(에러 처리기)                  인자 네 개
//
// ★ cors 를 라우트별로 나눠 붙였습니다.
//   app.use(cors()) 한 줄로 끝냈다면 내부 API 도 아무나 부를 수 있게 됩니다.
//
// ★ static 을 API 아래에 두었습니다.
//   public 에 api 라는 폴더가 실수로 생겨도 API 가 먼저 걸립니다.
//   반대로 두면 조용히 API 가 안 걸립니다. 에러도 안 납니다.
