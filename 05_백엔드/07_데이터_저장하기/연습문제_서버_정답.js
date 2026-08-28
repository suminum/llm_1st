// ============================================================
// 07단원 서버 연습문제 정답 — 점검기록을 같은 구조로 추가하기
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
// ============================================================
//
// 감사무시: 대조 — 이 정답은 번호 블록이 아니라 '완성된 서버 한 벌' 입니다.
//            07단원은 저장소·서비스·컨트롤러·라우트를 층으로 나누는 것이 문제라
//            정답도 층별 파일 구조 그대로 두었습니다.
//
// 설비에 이어 '점검기록' 이라는 두 번째 자원을 붙였습니다.
// 아래 파일들을 함께 보세요. 전부 설비 것과 같은 모양입니다.
//
//   repositories/점검기록저장소.js
//   services/점검기록서비스.js
//   controllers/점검기록컨트롤러.js
//   routes/점검기록라우트.js
//
// ★ 이 문제의 목적
//   "구조를 나눠 두면 두 번째 자원부터는 쉽다" 를 손으로 겪는 것입니다.
//   설비 파일을 복사해서 이름만 바꾸고, 규칙만 다르게 넣으면 됩니다.

const express = require("express");

const 설비저장소 = require("./repositories/설비저장소");
const 점검기록저장소 = require("./repositories/점검기록저장소");
const 설비라우트 = require("./routes/설비라우트");
const 점검기록라우트 = require("./routes/점검기록라우트");
const { AppError, 에러 } = require("./utils/AppError");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/equipments", 설비라우트);
app.use("/api/v1/logs", 점검기록라우트);


// ───── 설비는 그대로 동작합니다 ─────

// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}


// ───── 점검기록 목록 ─────

// 확인: GET /api/v1/logs
// 응답: 200 {"data":[{"id":1,"equipmentId":1,"result":"정상","담당자":"김민준"},{"id":2,"equipmentId":2,"result":"이상","담당자":"이서연"}]}

// 확인: GET /api/v1/logs?equipmentId=1
// 응답: 200 {"data":[{"id":1,"equipmentId":1,"result":"정상","담당자":"김민준"}]}

// 확인: GET /api/v1/logs?equipmentId=99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★★ 여기가 이 문제의 핵심입니다.
//   99번 설비는 없습니다. 그러니 "기록이 0건" 이 아니라 "그런 설비가 없다" 입니다.
//   점검기록서비스가 설비저장소를 함께 보기 때문에 이 구별이 가능합니다.
//
//   서비스끼리 서로를 볼 수 있습니다. 같은 층이니까요.
//   저장소가 서비스를 보는 것만 안 됩니다. 아래층은 위층을 모릅니다.


// ───── 점검기록 하나 ─────

// 확인: GET /api/v1/logs/1
// 응답: 200 {"data":{"id":1,"equipmentId":1,"result":"정상","담당자":"김민준"}}

// 확인: GET /api/v1/logs/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"점검기록을 찾을 수 없습니다"}}

// ★ "점검기록을" 입니다. 받침이 있으니 '을' 이 붙었습니다.
//   utils/한국어.js 의 조사 함수가 붙여 준 것입니다.


// ───── 점검기록 등록 ─────

// 확인: POST /api/v1/logs {"equipmentId":99,"result":"정상","담당자":"박지훈"}
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// 확인: POST /api/v1/logs {"equipmentId":1,"result":"이상함","담당자":"박지훈"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"result","이유":"정상, 이상 중 하나여야 합니다"}]}}

// 확인: POST /api/v1/logs {"equipmentId":1,"result":"정상"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"담당자","이유":"필수입니다"}]}}

// 확인: POST /api/v1/logs {"result":"정상","담당자":"박지훈"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"equipmentId","이유":"숫자여야 합니다"}]}}

// ★ equipmentId 를 아예 빠뜨리면 404 가 아니라 400 입니다.
//   Number(undefined) 는 NaN — 이대로 설비를 찾으면 "없는 설비"(404) 로
//   잘못 보고됩니다. 빠뜨린 입력(400)과 없는 설비(404)는 다른 문제입니다.

// 확인: POST /api/v1/logs {"equipmentId":1,"result":"정상","담당자":"박지훈"}
// 응답: 201 {"data":{"id":3,"equipmentId":1,"result":"정상","담당자":"박지훈"}}

// ★ 없는 설비에 기록을 남기려 하면 404 입니다.
//   저장소는 이걸 못 막습니다. equipmentId 가 숫자인지만 알 뿐입니다.
//   "그 설비가 실제로 있어야 한다" 는 업무 규칙이라 서비스가 막습니다.


// ───── 점검 결과가 '이상' 이면 설비가 점검중이 됩니다 ─────

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"}}

// 확인: POST /api/v1/logs {"equipmentId":1,"result":"이상","담당자":"박지훈"}
// 응답: 201 {"data":{"id":4,"equipmentId":1,"result":"이상","담당자":"박지훈"}}

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"점검중"}}

// ★★★ 기록 하나를 남겼는데 설비의 상태가 바뀌었습니다.
//
//   이런 걸 '업무 규칙' 이라고 합니다.
//   화면에서 두 번 클릭하게 만드는 게 아니라, 서버가 알아서 함께 처리합니다.
//
//   이 규칙은 점검기록서비스 안에 있습니다.
//   컨트롤러에도, 저장소에도, 프론트엔드에도 없습니다.
//
//   프론트가 이걸 하면 어떻게 될까요?
//   관리자 도구에서 기록을 남기면 설비 상태가 안 바뀝니다.
//   같은 회사 데이터인데 화면마다 규칙이 달라집니다.


// ───── 점검기록 삭제 ─────

// 확인: DELETE /api/v1/logs/4
// 응답: 204

// 확인: DELETE /api/v1/logs/4
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"점검기록을 찾을 수 없습니다"}}

// ★ 기록을 지워도 설비 상태는 안 되돌립니다.
//   "점검 결과를 실수로 잘못 입력해서 지웠다" 와
//   "설비가 정상으로 돌아왔다" 는 다른 일이기 때문입니다.
//   되돌리려면 PATCH /api/v1/equipments/1 로 따로 바꿔야 합니다.
//
//   이런 판단도 업무 규칙입니다. 정답은 회사마다 다릅니다.
//   중요한 건 '정하고 한 곳에 적어 두는 것' 입니다.


// ───── 404 와 에러 처리기 ─────

app.use((req, res, next) => {
  next(에러.주소없음());
});

// 확인: GET /api/v1/없는주소
// 응답: 404 {"error":{"code":"ROUTE_NOT_FOUND","message":"그런 주소가 없습니다"}}

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON 형식이 아닙니다" } });
  }

  if (err instanceof AppError) {
    const 몸통 = { code: err.code, message: err.message };
    if (err.details !== undefined) 몸통.details = err.details;
    return res.status(err.status).json({ error: 몸통 });
  }

  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});

// ★ 에러 처리기는 하나뿐입니다.
//   자원이 두 개가 되어도 에러 응답 모양은 그대로입니다.
//   자원이 열 개가 되어도 마찬가지입니다.


// ───── 준비하고 문 열기 ─────

async function 시작하기() {
  await 설비저장소.초기화([
    { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
    { id: 2, name: "프레스 1호", line: "B", status: "정지" },
  ]);

  await 점검기록저장소.초기화([
    { id: 1, equipmentId: 1, result: "정상", 담당자: "김민준" },
    { id: 2, equipmentId: 2, result: "이상", 담당자: "이서연" },
  ]);

  app.listen(PORT, () => {
    console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/logs`);
  });
}

시작하기().catch((에러) => {
  console.error("서버를 켜지 못했습니다:", 에러);
  process.exit(1);
});


// ============================================================
// 두 번째 자원을 만들면서 한 일
// ============================================================
//
//   ① repositories/점검기록저장소.js   설비저장소를 복사해서 파일 이름만 바꿈
//   ② services/점검기록서비스.js       규칙을 새로 씀 (여기만 진짜 생각이 필요)
//   ③ controllers/점검기록컨트롤러.js  설비컨트롤러를 복사해서 서비스 이름만 바꿈
//   ④ routes/점검기록라우트.js         설비라우트를 복사해서 컨트롤러 이름만 바꿈
//   ⑤ 이 파일에 app.use 한 줄 추가
//
// ★ ①③④는 거의 복사입니다. ②만 새로 생각했습니다.
//   구조가 정해져 있으니 "어디에 뭘 쓰지?" 를 고민할 필요가 없었습니다.
//
// ★ 개념03 에서 "지금은 파일만 많아진 것 같다" 고 했습니다.
//   두 번째 자원에서 이득이 나옵니다. 세 번째, 네 번째는 더 빨라집니다.
//
// ★ 복사가 많은 게 마음에 걸린다면
//   맞습니다. 저장소 네 개가 거의 같은 코드입니다.
//   공통 부분을 뽑아 '만들어 주는 함수' 로 바꿀 수 있습니다.
//
//     const 점검기록저장소 = 저장소만들기("점검기록.json");
//
//   다만 처음부터 이렇게 하면 읽기 어렵습니다.
//   세 번쯤 복사해 본 뒤에 묶는 편이 낫습니다.
//   "같은 걸 세 번 쓰면 그때 묶는다" 가 흔한 기준입니다.


// ============================================================
// Postman 시나리오
// ============================================================
//
//   1  GET    /api/v1/logs                        2건
//   2  GET    /api/v1/logs?equipmentId=1          1건
//   3  GET    /api/v1/logs?equipmentId=99         404  ← 0건이 아닙니다
//   4  GET    /api/v1/logs/99                     404 "점검기록을"
//   5  POST   /api/v1/logs { equipmentId: 99 ... } 404
//   6  POST   /api/v1/logs { result: "이상함" }     400
//   7  POST   /api/v1/logs { 담당자 없이 }          400
//   8  POST   /api/v1/logs 정상 등록                201, id 3
//   9  GET    /api/v1/equipments/1                 status 가 "가동"
//  10  POST   /api/v1/logs { result: "이상" }       201, id 4
//  11  GET    /api/v1/equipments/1                 status 가 "점검중"  ★
//  12  DELETE /api/v1/logs/4                       204
//  13  GET    /api/v1/equipments/1                 여전히 "점검중"
//
// 11번이 이 문제의 핵심입니다.
// 기록을 남겼을 뿐인데 설비 상태가 바뀌었습니다. 규칙이 서버에 있기 때문입니다.
