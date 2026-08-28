// ============================================================
// 05단원 서버 연습문제 정답 — 작업지시 API (미들웨어 총동원)
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
// ============================================================

const express = require("express");
const morgan = require("morgan");

const { 번호붙이기 } = require("./middlewares/기록");
const { 인증, 역할확인 } = require("./middlewares/인증");
const { 검증 } = require("./middlewares/검증");
const { HttpError } = require("./utils/HttpError");

const app = express();
const PORT = process.env.PORT || 3000;


// ───── 문제 1 ───── 기본 미들웨어 얹기
morgan.token("user", (req) => (req.user ? req.user.name : "-"));
morgan.token("reqid", (req) => (req.요청번호 ? `#${req.요청번호}` : "-"));

app.use(번호붙이기);
app.use(morgan(":reqid :method :url :status :response-time ms - :user"));
app.use(express.json());


// ───── 준비 ─────

let 작업지시들 = [
  { id: 1, title: "벨트 교체", line: "A", priority: 2, status: "대기", 등록자: "김민준" },
  { id: 2, title: "베어링 점검", line: "B", priority: 4, status: "완료", 등록자: "이서연" },
];

let 다음번호 = 3;

const 상태값들 = ["대기", "진행", "완료"];

const 작업지시규칙 = [
  { 키: "title", 필수: true, 타입: "string", 최소길이: 2, 최대길이: 30 },
  { 키: "line", 필수: true, 허용: ["A", "B", "C"] },
  { 키: "priority", 필수: false, 타입: "number", 최소: 1, 최대: 5 },
];


// ───── 문제 2 ───── :id 를 숫자로 바꾸는 미들웨어
app.param("id", (req, res, next, 값) => {
  const 번호 = Number(값);

  if (!Number.isInteger(번호)) {
    return next(HttpError(400, "번호는 숫자여야 합니다"));
  }

  req.번호 = 번호;
  next();
});


// ───── 문제 3 ───── 작업지시를 찾아 req 에 붙이는 미들웨어
function 작업지시찾기(req, res, next) {
  const 작업 = 작업지시들.find((작업) => 작업.id === req.번호);

  if (!작업) {
    return next(HttpError(404, `${req.번호}번 작업지시가 없습니다`));
  }

  req.작업 = 작업;
  next();
}

// ★ 이게 미들웨어의 진짜 힘입니다.
//   "번호를 숫자로 바꾸고 → 찾고 → 없으면 404" 가 미들웨어 두 개로 끝났습니다.
//   아래 라우트 세 개가 이 혜택을 함께 받습니다.


// ───── 문제 4 ───── 공개 주소
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 확인: GET /health
// 응답: 200 {"status":"ok"}


// ───── 문제 5 ───── 목록 (로그인만 하면 볼 수 있음)
app.get("/orders", 인증, (req, res) => {
  const { line, status } = req.query;

  let 결과 = 작업지시들;
  if (line) 결과 = 결과.filter((작업) => 작업.line === line);
  if (status) 결과 = 결과.filter((작업) => 작업.status === status);

  res.json(결과);
});

// 확인: GET /orders
// 응답: 401 {"error":"로그인이 필요합니다"}

// 확인: GET /orders [Authorization: Bearer key-user-1]
// 응답: 200 [{"id":1,"title":"벨트 교체","line":"A","priority":2,"status":"대기","등록자":"김민준"},{"id":2,"title":"베어링 점검","line":"B","priority":4,"status":"완료","등록자":"이서연"}]

// 확인: GET /orders?line=A [Authorization: Bearer key-user-1]
// 응답: 200 [{"id":1,"title":"벨트 교체","line":"A","priority":2,"status":"대기","등록자":"김민준"}]

// 확인: GET /orders?status=완료 [Authorization: Bearer key-user-1]
// 응답: 200 [{"id":2,"title":"베어링 점검","line":"B","priority":4,"status":"완료","등록자":"이서연"}]

// 확인: GET /orders?line=C [Authorization: Bearer key-user-1]
// 응답: 200 []

// ★ 조건을 여러 개 받을 때는 결과를 계속 좁혀 나갑니다.
//   let 으로 시작해서 조건마다 filter 를 겹칩니다.
//   조건이 없으면 그냥 통과하니 if 안에서만 좁히면 됩니다.


// ───── 문제 6 ───── 하나만 보기
app.get("/orders/:id", 인증, 작업지시찾기, (req, res) => {
  res.json(req.작업);
});

// 확인: GET /orders/1 [Authorization: Bearer key-user-1]
// 응답: 200 {"id":1,"title":"벨트 교체","line":"A","priority":2,"status":"대기","등록자":"김민준"}

// 확인: GET /orders/99 [Authorization: Bearer key-user-1]
// 응답: 404 {"error":"99번 작업지시가 없습니다"}

// 확인: GET /orders/abc [Authorization: Bearer key-user-1]
// 응답: 400 {"error":"번호는 숫자여야 합니다"}

// 라우트가 한 줄입니다. 검사는 전부 앞에서 끝났습니다.


// ───── 문제 7 ───── 새로 등록 (admin 만)
app.post("/orders", 인증, 역할확인("admin"), 검증(작업지시규칙), (req, res) => {
  const 새작업 = {
    id: 다음번호,
    title: req.body.title,
    line: req.body.line,
    priority: req.body.priority ?? 3, // 안 주면 보통 우선순위
    status: "대기",
    등록자: req.user.name,
  };

  다음번호 += 1;
  작업지시들.push(새작업);

  res.status(201).location(`/orders/${새작업.id}`).json(새작업);
});

// 확인: POST /orders {"title":"모터 점검","line":"C"}
// 응답: 401 {"error":"로그인이 필요합니다"}

// 확인: POST /orders [Authorization: Bearer key-user-1] {"title":"모터 점검","line":"C"}
// 응답: 403 {"error":"admin 만 할 수 있습니다"}

// 확인: POST /orders [Authorization: Bearer key-admin-1] {"title":"모","line":"Z"}
// 응답: 400 {"error":"입력값이 올바르지 않습니다","항목":[{"키":"title","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"A, B, C 중 하나여야 합니다"}]}

// 확인: POST /orders [Authorization: Bearer key-admin-1] {"title":"모터 점검","line":"C"}
// 응답: 201 {"id":3,"title":"모터 점검","line":"C","priority":3,"status":"대기","등록자":"이서연"}

// ★ 세 개의 400·401·403 이 각각 다른 미들웨어에서 나왔습니다.
//   401 은 인증에서, 403 은 역할확인에서, 400 은 검증에서.
//   라우트 함수는 한 번도 실행되지 않았습니다.
//
// ★ ?? 3 을 쓴 이유
//   || 3 으로 쓰면 priority: 0 을 보냈을 때 3 이 되어 버립니다.
//   지금 규칙은 1 이상이라 0 이 안 오지만, 습관을 들여 두세요.
//
// ★ 등록자를 본문에서 안 받았습니다
//   req.user.name 을 씁니다. 보낸 쪽이 정하게 두면 남의 이름으로 등록할 수 있습니다.
//   "누가 했는지" 는 언제나 서버가 정합니다.


// ───── 문제 8 ───── 상태 바꾸기 (로그인만 하면 됨)
app.patch("/orders/:id", 인증, 작업지시찾기, (req, res, next) => {
  const { status } = req.body || {};

  if (!상태값들.includes(status)) {
    return next(HttpError(400, `status 는 ${상태값들.join(", ")} 중 하나여야 합니다`));
  }

  req.작업.status = status;

  res.json(req.작업);
});

// 확인: PATCH /orders/3 [Authorization: Bearer key-user-1] {"status":"이상"}
// 응답: 400 {"error":"status 는 대기, 진행, 완료 중 하나여야 합니다"}

// 확인: PATCH /orders/3 [Authorization: Bearer key-user-1] {"status":"진행"}
// 응답: 200 {"id":3,"title":"모터 점검","line":"C","priority":3,"status":"진행","등록자":"이서연"}

// ★ 여기서는 검증 미들웨어를 안 쓰고 라우트 안에서 확인했습니다.
//   상태값들 은 이 라우트에서만 쓰는 규칙이라, 굳이 규칙 표로 만들 필요가 없습니다.
//   "두 곳 이상에서 쓰이면 빼낸다" 정도로 생각하면 됩니다.


// ───── 문제 9 ───── 지우기 (admin 만)
app.delete("/orders/:id", 인증, 역할확인("admin"), 작업지시찾기, (req, res) => {
  작업지시들 = 작업지시들.filter((하나) => 하나.id !== req.작업.id);
  res.sendStatus(204);
});

// 확인: DELETE /orders/3 [Authorization: Bearer key-user-1]
// 응답: 403 {"error":"admin 만 할 수 있습니다"}

// 확인: DELETE /orders/3 [Authorization: Bearer key-admin-1]
// 응답: 204

// 확인: DELETE /orders/3 [Authorization: Bearer key-admin-1]
// 응답: 404 {"error":"3번 작업지시가 없습니다"}

// ★ 미들웨어 순서를 보세요.
//   인증 → 역할확인 → 작업지시찾기
//   자격이 없는 사람에게는 "그 작업이 있는지 없는지" 도 알려 주지 않습니다.
//   찾기를 먼저 하면, 403 을 받을 사람이 404 를 통해 "그 번호는 있구나" 를 알게 됩니다.
//   사소해 보이지만 이런 것이 정보를 흘리는 통로가 됩니다.


// ───── 문제 10 ───── 405 · 404 · 에러 처리기
app.all("/orders", (req, res, next) => {
  next(HttpError(405, "이 주소에서는 쓸 수 없는 방법입니다"));
});

// 확인: PUT /orders [Authorization: Bearer key-admin-1]
// 응답: 405 {"error":"이 주소에서는 쓸 수 없는 방법입니다"}

app.use((req, res) => {
  res.status(404).json({ error: "그런 주소가 없습니다" });
});

// 확인: GET /없는주소
// 응답: 404 {"error":"그런 주소가 없습니다"}

app.use((err, req, res, next) => {
  console.error(`   └★#${req.요청번호} [에러] ${err.message}`);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON 형식이 아닙니다" });
  }

  const 코드 = err.status || 500;

  if (코드 === 500) {
    return res.status(500).json({ error: "서버에서 문제가 생겼습니다" });
  }

  res.status(코드).json({ error: err.message });
});


app.listen(PORT, () => {
  console.log(`작업지시 API 가 켜졌습니다.  http://localhost:${PORT}/health`);
});


// ── 지우고 나서 목록을 다시 보면 ──
//
// 확인: GET /orders [Authorization: Bearer key-user-1]
// 응답: 200 [{"id":1,"title":"벨트 교체","line":"A","priority":2,"status":"대기","등록자":"김민준"},{"id":2,"title":"베어링 점검","line":"B","priority":4,"status":"완료","등록자":"이서연"}]


// ============================================================
// 이 파일에서 확인할 것
// ============================================================
//
// ① 라우트 함수 안에 '검사 코드' 가 거의 없습니다
//    로그인 확인, 권한 확인, 숫자 변환, 찾기, 404 — 전부 미들웨어입니다.
//    라우트는 "무엇을 돌려줄지" 만 말합니다.
//
// ② 같은 미들웨어를 여러 라우트가 나눠 씁니다
//    작업지시찾기 하나를 GET·PATCH·DELETE 세 곳이 씁니다.
//    404 메시지를 바꾸고 싶으면 한 곳만 고치면 됩니다.
//
// ③ 미들웨어 순서가 곧 정책입니다
//    인증 → 역할확인 → 찾기 순서에는 이유가 있습니다.
//    순서를 바꾸면 응답이 달라지고, 때로는 정보가 새어 나갑니다.
//
// ④ 파일이 나뉘어 있습니다
//    이 파일 200줄 중 미들웨어 코드는 한 줄도 없습니다. 전부 require 로 가져왔습니다.
//    다음 프로젝트에서도 middlewares 폴더를 통째로 복사해 쓸 수 있습니다.


// ============================================================
// Postman 시나리오
// ============================================================
//
// Headers 에  Authorization: Bearer key-user-1  또는  key-admin-1
//
//   1  GET    /health                                      200
//   2  GET    /orders            (증표 없이)                401
//   3  GET    /orders            user                       2건
//   4  GET    /orders?line=A     user                       1건
//   5  GET    /orders?line=C     user                       200 과 []
//   6  GET    /orders/1          user                       벨트 교체
//   7  GET    /orders/99         user                       404
//   8  GET    /orders/abc        user                       400
//   9  POST   /orders            user                       403
//        { "title": "모터 점검", "line": "C" }
//  10  POST   /orders            admin                      201, id 3
//  11  PATCH  /orders/3          user   { "status": "진행" } 200
//  12  DELETE /orders/3          user                       403
//  13  DELETE /orders/3          admin                      204
//  14  PUT    /orders            admin                      405
//
// 터미널을 함께 보세요. 요청 번호와 누가 했는지가 한 줄씩 남습니다.
//
//   #10 POST /orders 201 3.121 ms - 이서연
//   #12 DELETE /orders/3 403 1.004 ms - 김민준
//
// 이 기록만 봐도 "김민준이 지우려다 막혔다" 를 알 수 있습니다.
