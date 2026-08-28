// ============================================================
// 05단원 서버 연습문제 — 작업지시 API (미들웨어 총동원)
// ------------------------------------------------------------
// 실행: npx nodemon 연습문제_서버.js
// ============================================================
//
// ★ 이 문제의 목적
//   라우트 함수 안에서 '검사 코드' 를 전부 없애는 것입니다.
//   로그인 확인·권한 확인·숫자 변환·찾기·404 를 모두 미들웨어로 밀어냅니다.
//
//   다 만들고 나서 라우트 함수들을 보세요.
//   대부분 한두 줄이어야 합니다. 길다면 미들웨어로 뺄 것이 남은 것입니다.
//
// 만들 주소
//
//   GET    /health              누구나
//   GET    /orders              로그인만  (?line= / ?status= 로 걸러 보기)
//   GET    /orders/:id          로그인만
//   POST   /orders              admin 만
//   PATCH  /orders/:id          로그인만  (상태만 바꾸기)
//   DELETE /orders/:id          admin 만
//   그 밖                       405 또는 404
//
// 쓸 수 있는 증표
//   Bearer key-user-1    김민준 (user)
//   Bearer key-admin-1   이서연 (admin)

const express = require("express");
const morgan = require("morgan");

// ★ 05단원에서 만든 미들웨어를 그대로 가져다 씁니다.
const { 번호붙이기 } = require("./middlewares/기록");
const { 인증, 역할확인 } = require("./middlewares/인증");
const { 검증 } = require("./middlewares/검증");
const { HttpError } = require("./utils/HttpError");

const app = express();
const PORT = process.env.PORT || 3000;


// ───── 문제 1 ───── 기본 미들웨어 얹기
// 아래 세 가지를 순서대로 등록하세요.
//
//   ① 번호붙이기
//   ② morgan — 형식은 ":reqid :method :url :status :response-time ms - :user"
//   ③ express.json()
//
// morgan 의 :reqid 와 :user 는 기본에 없습니다. 직접 만들어야 합니다.
//   morgan.token("user", (req) => ...)
//   morgan.token("reqid", (req) => ...)
//
// ★ 번호붙이기가 morgan 보다 먼저여야 :reqid 가 채워집니다. 왜일까요?
//
// 기대 결과 (터미널):
//   #1 GET /health 200 2.431 ms - -
//   #3 GET /orders 200 1.204 ms - 김민준

// TODO: 여기에 코드를 쓰세요


// ───── 준비 (여기는 그대로 두세요) ─────

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
// app.param 으로 ":id" 를 가로채서
//   - 숫자가 아니면  next(HttpError(400, "번호는 숫자여야 합니다"))
//   - 맞으면        req.번호 에 숫자로 담고 next()
//
// ★ 이렇게 해 두면 :id 를 쓰는 라우트가 전부 혜택을 받습니다.
//   Number(req.params.id) 를 다시 쓸 일이 없어집니다.
//
// 힌트: app.param("id", (req, res, next, 값) => { ... })
//       인자가 네 개입니다. 마지막이 그 파라미터의 값입니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 3 ───── 작업지시를 찾아 붙이는 미들웨어
// 함수 작업지시찾기(req, res, next) 를 만드세요.
//   - req.번호 로 작업지시들 에서 찾습니다
//   - 없으면  next(HttpError(404, `${req.번호}번 작업지시가 없습니다`))
//   - 있으면  req.작업 에 담고 next()
//
// ★ 이 함수 하나를 GET·PATCH·DELETE 세 곳이 나눠 씁니다.
//   404 메시지를 바꾸고 싶으면 여기 한 곳만 고치면 됩니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 4 ───── 공개 주소
// GET /health 에 200 과 { status: "ok" } 를 돌려주세요. 증표 없이 됩니다.
//
// 기대 결과:
//   GET /health  →  200  {"status":"ok"}

// TODO: 여기에 코드를 쓰세요


// ───── 문제 5 ───── 목록 (로그인만 하면 볼 수 있음)
// GET /orders 에 목록을 돌려주세요.
// ?line= 과 ?status= 로 걸러 볼 수 있어야 합니다. 둘 다 붙을 수도 있습니다.
//
// 기대 결과:
//   GET /orders               (증표 없이)  →  401
//   GET /orders               user         →  2건
//   GET /orders?line=A        user         →  1건 (벨트 교체)
//   GET /orders?status=완료    user         →  1건 (베어링 점검)
//   GET /orders?line=C        user         →  200 과 []
//
// 힌트: 조건을 겹쳐 쓰려면 let 으로 시작해 filter 를 이어 붙입니다.
//         let 결과 = 작업지시들;
//         if (line) 결과 = 결과.filter(...);
//         if (status) 결과 = 결과.filter(...);

// TODO: 여기에 코드를 쓰세요


// ───── 문제 6 ───── 하나만 보기
// GET /orders/:id 에 그 작업지시를 돌려주세요.
//
// 기대 결과:
//   GET /orders/1    user  →  200  벨트 교체
//   GET /orders/99   user  →  404
//   GET /orders/abc  user  →  400
//
// ★ 문제 2·3 을 제대로 만들었다면 이 라우트는 한 줄입니다.
//   길어졌다면 미들웨어로 갔어야 할 코드가 여기 남아 있는 것입니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 7 ───── 새로 등록 (admin 만)
// POST /orders 로 새 작업지시를 만드세요.
// 인증 → 역할확인("admin") → 검증(작업지시규칙) 순으로 미들웨어를 붙입니다.
//
// 새 작업지시의 모양:
//   { id: 다음번호, title, line, priority: 안 주면 3, status: "대기", 등록자: 로그인한 사람 }
//
// 기대 결과:
//   POST /orders  (증표 없이)                         →  401
//   POST /orders  user   { "title":"모터 점검","line":"C" }  →  403
//   POST /orders  admin  { "title":"모","line":"Z" }          →  400, 항목 두 개
//   POST /orders  admin  { "title":"모터 점검","line":"C" }   →  201, id 3
//
// ★★ 등록자를 본문에서 받지 마세요. req.user.name 을 쓰세요.
//   보낸 쪽이 정하게 두면 남의 이름으로 등록할 수 있습니다.
//   "누가 했는지" 는 언제나 서버가 정합니다.
//
// 힌트: priority 기본값은 req.body.priority ?? 3 입니다.
//       || 3 으로 쓰면 0 을 보냈을 때 3 이 되어 버립니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 8 ───── 상태 바꾸기 (로그인만 하면 됨)
// PATCH /orders/:id 로 status 만 바꾸세요.
//
// 기대 결과:
//   PATCH /orders/3  user  { "status":"이상" }  →  400
//     {"error":"status 는 대기, 진행, 완료 중 하나여야 합니다"}
//   PATCH /orders/3  user  { "status":"진행" }  →  200, status 가 "진행"
//
// ★ 여기서는 검증 미들웨어를 안 써도 됩니다.
//   상태값들 은 이 라우트에서만 쓰는 규칙입니다.
//   "두 곳 이상에서 쓰이면 빼낸다" 정도로 생각하세요.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 9 ───── 지우기 (admin 만)
// DELETE /orders/:id 로 지우세요. 204 를 돌려줍니다.
//
// 기대 결과:
//   DELETE /orders/3  user   →  403
//   DELETE /orders/3  admin  →  204
//   DELETE /orders/3  admin  →  404  (이미 지웠으니)
//
// ★★ 미들웨어 순서를 조심하세요.
//   인증 → 역할확인 → 작업지시찾기 순입니다.
//
//   찾기를 먼저 하면 어떻게 될까요?
//   403 을 받을 사람이 404 를 통해 "그 번호는 있구나" 를 알게 됩니다.
//   사소해 보이지만 이런 것이 정보를 흘리는 통로가 됩니다.
//   자격이 없는 사람에게는 '있는지 없는지' 도 알려 주지 않습니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 10 ───── 405 · 404 · 에러 처리기
// ① app.all("/orders", ...) 로 405 를 만드세요. (모든 /orders 라우트 아래에)
// ② 주소 없는 app.use 로 404 를 JSON 으로 만드세요.
// ③ 인자 네 개짜리 에러 처리기를 맨 마지막에 만드세요.
//    - 터미널에 요청 번호와 함께 남기기
//    - err.type 이 "entity.parse.failed" 면 400 "JSON 형식이 아닙니다"
//    - err.status 가 있으면 그 코드와 err.message
//    - 없으면 500 "서버에서 문제가 생겼습니다"
//
// 기대 결과:
//   PUT /orders   admin  →  405
//   GET /없는주소          →  404

// TODO: 여기에 코드를 쓰세요


app.listen(PORT, () => {
  console.log(`작업지시 API 가 켜졌습니다.  http://localhost:${PORT}/health`);
});


// ============================================================
// 다 만들었으면 이 순서대로 눌러 보세요
// ============================================================
//
// Postman 의 Headers 에  Authorization: Bearer key-user-1  또는  key-admin-1
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
// ★ 터미널을 함께 보세요. 이렇게 남아야 합니다.
//
//   #10 POST /orders 201 3.121 ms - 이서연
//   #12 DELETE /orders/3 403 1.004 ms - 김민준
//
// 이 기록만 봐도 "김민준이 지우려다 막혔다" 를 알 수 있습니다.


// ============================================================
// 다 만든 뒤 답해 보세요
// ============================================================
//
// ① 라우트 함수 중 가장 긴 것이 몇 줄인가요?
//    3줄이 넘는다면, 그 안의 무엇을 미들웨어로 뺄 수 있을까요?
//    __________________________________________
//
// ② 작업지시찾기 를 쓰는 라우트가 몇 개인가요?
//    이걸 안 만들었다면 같은 코드를 몇 번 썼을까요?
//    __________________________________________
//
// ③ 문제 9에서 작업지시찾기 를 역할확인보다 먼저 두면
//    user 가 DELETE /orders/99 를 보냈을 때 무엇이 나오나요?
//    실제로 순서를 바꿔서 확인해 보세요. (확인 후 되돌리세요)
//    __________________________________________
//
// ④ 404 메시지를 "찾을 수 없습니다" 로 바꾸려면 몇 군데를 고쳐야 하나요?
//    __________________________________________
//
// ⑤ 이 서버에 '불량기록' API 를 추가한다면
//    middlewares 폴더에서 무엇을 그대로 쓸 수 있나요?
//    __________________________________________


// ============================================================
// 잘 안 될 때 보는 곳
// ============================================================
//
// 요청이 멈추고 응답이 안 옴
//   → 어느 미들웨어가 next() 를 안 불렀습니다.
//   → 미들웨어마다 console.log 를 넣어 어디까지 갔는지 보세요.
//
// req.user 가 undefined
//   → 인증 미들웨어를 안 붙였거나, 다른 미들웨어보다 뒤에 붙였습니다.
//
// req.번호 가 undefined
//   → app.param 의 이름이 라우트의 :id 와 다릅니다.
//   → app.param("id") 는 :id 에만 걸립니다.
//
// 500 이 나는데 401 이어야 함
//   → 역할확인이 인증보다 먼저 실행되어 req.user 를 못 읽은 것입니다.
//
// morgan 의 :reqid 가 계속 -
//   → 번호붙이기가 morgan 보다 아래에 있습니다.
//
// morgan 의 :user 가 계속 -
//   → 정상입니다. 로그인이 필요 없는 주소이거나 401 이 난 요청입니다.
//
// Cannot find module './middlewares/기록'
//   → 이 파일과 middlewares 폴더가 같은 폴더에 있어야 합니다.
//   → ./ 를 빠뜨리면 node_modules 에서 찾습니다.
