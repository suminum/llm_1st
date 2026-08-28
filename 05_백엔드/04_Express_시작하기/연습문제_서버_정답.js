// ============================================================
// 04단원 서버 연습문제 정답 — 설비 관리 API 를 Express 로
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
//       또는  npx nodemon 연습문제_서버_정답.js
// ============================================================
//
// 03단원 연습문제_서버_정답.js 와 나란히 놓고 보세요.
// 하는 일이 완전히 같습니다. 코드만 절반으로 줄었습니다.

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ───── 준비 ─────

let 설비들 = [
  { id: 1, name: "컨베이어", line: "A", status: "가동" },
  { id: 2, name: "프레스", line: "B", status: "정지" },
];

let 다음번호 = 3;

const 상태값들 = ["가동", "정지"];

// 상태코드가 붙은 에러를 만드는 도구입니다. (개념04 섹션 4)
function HttpError(코드, 메시지) {
  const 에러 = new Error(메시지);
  에러.status = 코드;
  return 에러;
}

// ───── 문제 0 ───── 공통 함수 만들기
// 번호로 설비를 찾고, 없으면 에러를 던집니다.
// 문제 3·5·6 에서 똑같이 쓰니까 함수로 묶었습니다.
function 설비찾기(번호글자) {
  const 번호 = Number(번호글자);

  if (!Number.isInteger(번호)) {
    throw HttpError(400, "번호는 숫자여야 합니다");
  }

  const 설비 = 설비들.find((설비) => 설비.id === 번호);

  if (!설비) {
    throw HttpError(404, `${번호}번 설비가 없습니다`);
  }

  return 설비;
}


// ───── 문제 1 ───── /health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 확인: GET /health
// 응답: 200 {"status":"ok"}


// ───── 문제 2 ───── 목록 + 라인으로 걸러 보기
app.get("/equipments", (req, res) => {
  const 라인 = req.query.line;
  const 결과 = 라인 ? 설비들.filter((설비) => 설비.line === 라인) : 설비들;

  res.json(결과);
});

// 확인: GET /equipments
// 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"},{"id":2,"name":"프레스","line":"B","status":"정지"}]

// 확인: GET /equipments?line=A
// 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"}]

// 확인: GET /equipments?line=Z
// 응답: 200 []

// 03단원에서는 이랬습니다.
//   const 주소 = new URL(req.url, `http://${req.headers.host}`);
//   const 라인 = 주소.searchParams.get("line");
// 두 줄이 req.query.line 한 조각이 되었습니다.


// ───── 문제 3 ───── 하나만 보기
app.get("/equipments/:id", (req, res) => {
  res.json(설비찾기(req.params.id));
});

// 확인: GET /equipments/1
// 응답: 200 {"id":1,"name":"컨베이어","line":"A","status":"가동"}

// 확인: GET /equipments/abc
// 응답: 400 {"error":"번호는 숫자여야 합니다"}

// 확인: GET /equipments/99
// 응답: 404 {"error":"99번 설비가 없습니다"}

// ★ 라우트가 한 줄이 되었습니다.
//   03단원에서는 이 부분이 열다섯 줄이었습니다.
//   "찾고, 없으면 404" 를 설비찾기 안으로 밀어 넣었기 때문입니다.
//
//   throw 한 에러는 맨 아래 에러 처리기가 받아서 응답으로 바꿔 줍니다.
//   라우트는 "무엇을 돌려줄지" 만 말하면 됩니다.


// ───── 문제 4 ───── 새로 등록하기
app.post("/equipments", (req, res) => {
  const { name, line } = req.body || {};

  const 빠진것 = [];
  if (!name) 빠진것.push("name");
  if (!line) 빠진것.push("line");

  if (빠진것.length > 0) {
    throw HttpError(400, `${빠진것.join(", ")} 을(를) 넣어 주세요`);
  }

  const 새설비 = { id: 다음번호, name, line, status: "정지" };

  다음번호 += 1;
  설비들.push(새설비);

  res.status(201).location(`/equipments/${새설비.id}`).json(새설비);
});

// 확인: POST /equipments
// 응답: 400 {"error":"name, line 을(를) 넣어 주세요"}

// 확인: POST /equipments {"name":"용접로봇"}
// 응답: 400 {"error":"line 을(를) 넣어 주세요"}

// 확인: POST /equipments {깨진:JSON}
// 응답: 400 {"error":"JSON 형식이 아닙니다"}

// 확인: POST /equipments {"name":"용접로봇","line":"C"}
// 응답: 201 {"id":3,"name":"용접로봇","line":"C","status":"정지"}

// ★ 깨진 JSON 을 우리가 막지 않았습니다.
//   express.json() 이 잡아서 에러로 넘기고, 에러 처리기가 400 으로 바꿉니다.
//   03단원의 try/catch 가 통째로 사라졌습니다.
//
// ★ req.body || {} 를 잊으면
//   본문 없이 POST 가 왔을 때 TypeError 로 서버가 500 을 냅니다.
//   400 이어야 하는데 500 이 나면 원인을 엉뚱한 데서 찾게 됩니다.


// ───── 문제 5 ───── 상태만 바꾸기
app.patch("/equipments/:id", (req, res) => {
  const 설비 = 설비찾기(req.params.id);
  const { status } = req.body || {};

  if (!상태값들.includes(status)) {
    throw HttpError(400, "status 는 가동 또는 정지여야 합니다");
  }

  설비.status = status;

  res.json(설비);
});

// 확인: PATCH /equipments/3 {"status":"이상한값"}
// 응답: 400 {"error":"status 는 가동 또는 정지여야 합니다"}

// 확인: PATCH /equipments/99 {"status":"가동"}
// 응답: 404 {"error":"99번 설비가 없습니다"}

// 확인: PATCH /equipments/3 {"status":"가동"}
// 응답: 200 {"id":3,"name":"용접로봇","line":"C","status":"가동"}

// ★ 순서를 보세요. 먼저 찾고, 그다음에 값을 검사합니다.
//   반대로 하면 없는 설비에 대해 "status 가 틀렸다" 는 엉뚱한 답이 나갑니다.
//   "그 자원이 있는가" 를 언제나 먼저 확인하세요.
//
// ★ find 로 찾은 객체의 속성을 바꾸면 배열 안의 것도 함께 바뀝니다.
//   같은 객체를 가리키고 있기 때문입니다. (JS자료 07단원)
//   따로 배열에 다시 넣는 코드가 필요 없습니다.


// ───── 문제 6 ───── 지우기
app.delete("/equipments/:id", (req, res) => {
  const 설비 = 설비찾기(req.params.id);

  설비들 = 설비들.filter((하나) => 하나.id !== 설비.id);

  res.sendStatus(204);
});

// 확인: DELETE /equipments/3
// 응답: 204

// 확인: DELETE /equipments/3
// 응답: 404 {"error":"3번 설비가 없습니다"}

// ★ filter 의 인자 이름을 '하나' 로 바꿨습니다.
//   바깥에 이미 설비 라는 변수가 있어서, 같은 이름을 쓰면
//   안쪽 설비가 바깥 설비를 가려 버립니다. 헷갈리기 쉬우니 이름을 다르게.


// ───── 문제 7 ───── 405 만들기
// Express 는 기본으로 405 를 안 만들어 줍니다. app.all 로 직접 만듭니다.
// ★ 위의 모든 /equipments 라우트보다 '아래' 에 있어야 합니다.
app.all("/equipments", (req, res) => {
  throw HttpError(405, "이 주소에서는 쓸 수 없는 방법입니다");
});

// 확인: PUT /equipments
// 응답: 405 {"error":"이 주소에서는 쓸 수 없는 방법입니다"}

// ★ 왜 위의 GET / POST 는 안 잡아먹히나
//   Express 는 위에서부터 찾다가 처음 맞는 것에서 멈춥니다.
//   GET /equipments 는 위쪽 app.get 에 먼저 걸립니다.
//   여기까지 내려온 것은 GET 도 POST 도 아닌 요청뿐입니다.
//
//   그래서 이 줄을 맨 위로 옮기면 API 전체가 405 가 됩니다. 순서가 전부입니다.


// ───── 문제 8 ───── 없는 주소를 JSON 으로
app.use((req, res) => {
  res.status(404).json({ error: "그런 주소가 없습니다" });
});

// 확인: GET /없는주소
// 응답: 404 {"error":"그런 주소가 없습니다"}


// ───── 문제 9 ───── 에러 처리기 (맨 마지막, 인자 네 개)
app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);

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
  console.log(`설비 관리 API 가 켜졌습니다.  http://localhost:${PORT}/equipments`);
});


// ── 지우고 나서 목록을 다시 보면 ──
//
// 확인: GET /equipments
// 응답: 200 [{"id":1,"name":"컨베이어","line":"A","status":"가동"},{"id":2,"name":"프레스","line":"B","status":"정지"}]


// ============================================================
// 03단원 것과 나란히 놓고 세어 보기
// ============================================================
//
//                        03단원 (http)    04단원 (Express)
//   ──────────────────────────────────────────────────────
//   전체 줄 수            약 200줄         약 100줄
//   경로 분석             직접 split       app.get("/:id")
//   메서드 갈래           if 세 겹         app.get / app.post ...
//   본문 읽기             함수 15줄        express.json() 한 줄
//   깨진 JSON             try/catch        자동
//   응답 만들기           writeHead+end    res.json
//   에러 응답             갈래마다 직접     에러 처리기 한 곳
//   에러가 나면           서버가 죽음      그 요청만 500
//
// 특히 마지막 두 줄이 중요합니다.
//
//   03단원에서는 응답 만드는 코드가 열두 군데 흩어져 있었습니다.
//   Express 에서는 에러 응답이 맨 아래 한 곳에 모여 있습니다.
//   응답 모양을 바꾸고 싶으면 거기 한 곳만 고치면 됩니다.
//
//   그리고 라우트 안에서 무슨 에러가 나든 서버가 안 죽습니다.
//   03단원 서버는 undefined 하나에 통째로 멈췄습니다.


// ============================================================
// Postman 시나리오 (03단원과 완전히 같습니다)
// ============================================================
//
//   1  GET    /health                        200
//   2  GET    /equipments                    2건
//   3  GET    /equipments?line=A             1건
//   4  GET    /equipments?line=Z             200 과 []
//   5  GET    /equipments/1                  컨베이어
//   6  GET    /equipments/99                 404
//   7  GET    /equipments/abc                400
//   8  POST   /equipments  { "name": "용접로봇" }                400
//   9  POST   /equipments  { "name": "용접로봇", "line": "C" }   201, id 3
//  10  PATCH  /equipments/3  { "status": "폭발" }                400
//  11  PATCH  /equipments/3  { "status": "가동" }                200
//  12  DELETE /equipments/3                  204
//  13  DELETE /equipments/3                  404
//  14  PUT    /equipments                    405
//  15  Ctrl+C 후 다시 켜고 2번을 다시         2건 — 3번은 사라짐
//
// 03단원 때와 결과가 한 글자도 다르지 않아야 합니다.
// 이게 '같은 API 를 다른 도구로 만들었다' 는 뜻입니다.
