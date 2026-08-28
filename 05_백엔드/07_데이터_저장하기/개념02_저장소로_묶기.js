// ============================================================
// 07단원 · 개념 02 — 저장소로 묶기
// ------------------------------------------------------------
// 실행: node 개념02_저장소로_묶기.js
//       끄려면 Ctrl + C
// ============================================================
//
// 이 파일은 혼자가 아닙니다. 옆의 repositories 폴더를 함께 보세요.
//
//   07_데이터_저장하기/
//     개념02_저장소로_묶기.js        ← 지금 이 파일
//     repositories/
//       설비저장소.js               ← 파일을 읽고 쓰는 코드가 전부 여기
//     data/
//       설비.json                   ← 실제 데이터
//
// 개념01 에서는 불러오기·저장하기를 라우트 파일 안에 두었습니다.
// 라우트가 열 개가 되면 어떻게 될까요?
//
//   · 모든 라우트가 '읽고 → 고치고 → 쓰기' 를 각자 씁니다
//   · id 를 붙이는 방법이 라우트마다 조금씩 다를 수 있습니다
//   · 나중에 데이터베이스로 바꾸면 열 곳을 전부 고쳐야 합니다
//
// 그래서 '데이터를 다루는 코드' 를 한 파일에 모읍니다. 이걸 저장소라고 부릅니다.

const express = require("express");
const 설비저장소 = require("./repositories/설비저장소");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 켤 때 초기값 (수업용) ──

const 처음데이터 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
];

// ★ 초기화는 '비동기' 입니다. 파일에 다 쓰이기 전에 요청이 들어오면 안 됩니다.
//   그래서 이 파일은 맨 아래에서 await 로 기다린 뒤에 listen 을 부릅니다.
//   여기서는 부르지 않습니다. 아래 시작하기() 를 보세요.


// ── 섹션 2: 라우트가 짧아졌습니다 ──

app.get("/equipments", async (req, res) => {
  res.json({ data: await 설비저장소.전부() });
});

// 확인: GET /equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}

app.get("/equipments/:id", async (req, res) => {
  const 설비 = await 설비저장소.하나(Number(req.params.id));

  // ★ 여기서 404 를 냅니다. 저장소는 null 만 줄 뿐입니다.
  if (설비 === null) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "설비를 찾을 수 없습니다" } });
  }

  res.json({ data: 설비 });
});

// 확인: GET /equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"}}

// 확인: GET /equipments/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★★ 역할이 나뉜 것을 보세요.
//
//   저장소   "찾아봤는데 없습니다" → null
//   라우트   "그러면 404 를 보내자"
//
//   저장소는 HTTP 를 모릅니다. 404 라는 숫자를 본 적도 없습니다.
//   이 경계를 지키는 것이 이번 단원의 핵심입니다.


app.post("/equipments", async (req, res) => {
  const { name, line } = req.body || {};

  if (!name || !line) {
    return res.status(400).json({ error: { code: "VALIDATION_FAILED", message: "name 과 line 이 필요합니다" } });
  }

  // ★ status 는 서버가 정합니다. id 는 저장소가 붙입니다.
  const 새설비 = await 설비저장소.추가({ name, line, status: "정지" });

  res.status(201).location(`/equipments/${새설비.id}`).json({ data: 새설비 });
});

// 확인: POST /equipments {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}

// 확인: POST /equipments {"name":"용접로봇 2호"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"name 과 line 이 필요합니다"}}


app.patch("/equipments/:id", async (req, res) => {
  const { status } = req.body || {};

  if (!["가동", "정지", "점검중"].includes(status)) {
    return res.status(400).json({ error: { code: "VALIDATION_FAILED", message: "status 가 올바르지 않습니다" } });
  }

  const 고쳐진것 = await 설비저장소.수정(Number(req.params.id), { status });

  if (고쳐진것 === null) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "설비를 찾을 수 없습니다" } });
  }

  res.json({ data: 고쳐진것 });
});

// 확인: PATCH /equipments/3 {"status":"가동"}
// 응답: 200 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"가동"}}

// 확인: PATCH /equipments/99 {"status":"가동"}
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// 확인: PATCH /equipments/3 {"status":"이상"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"status 가 올바르지 않습니다"}}


app.delete("/equipments/:id", async (req, res) => {
  const 지워졌나 = await 설비저장소.삭제(Number(req.params.id));

  if (!지워졌나) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "설비를 찾을 수 없습니다" } });
  }

  res.sendStatus(204);
});

// 확인: DELETE /equipments/3
// 응답: 204

// 확인: DELETE /equipments/3
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}


// ── 섹션 3: id 는 못 바꿉니다 ──

app.patch("/equipments/:id/try-id-change", async (req, res) => {
  // 일부러 id 를 바꿔 달라고 넘겨 봅니다.
  const 결과 = await 설비저장소.수정(Number(req.params.id), { id: 999, name: "이름만 바뀜" });

  res.json({ data: 결과 });
});

// 확인: PATCH /equipments/1/try-id-change
// 응답: 200 {"data":{"id":1,"name":"이름만 바뀜","line":"A","status":"가동"}}

// ★ name 은 바뀌었는데 id 는 1 그대로입니다.
//   저장소의 수정 함수가 마지막에 id 를 다시 넣기 때문입니다.
//
//     목록[자리] = { ...목록[자리], ...바꿀것, id };
//                                            ─┬─
//                                    맨 뒤라서 이깁니다
//
//   번호가 바뀌면 그 설비를 가리키던 모든 것이 어긋납니다.
//   점검기록의 equipmentId, 프론트가 저장해 둔 주소, 남이 북마크한 링크까지요.
//   "번호는 한 번 정해지면 안 바뀐다" 는 규칙을 저장소가 지켜 줍니다.


// ── 섹션 4: 저장소는 서버 없이도 시험할 수 있습니다 ──

app.get("/self-test", async (req, res) => {
  // 저장소만 따로 불러 쓴 것입니다. Express 와 아무 상관이 없습니다.
  const 전부 = await 설비저장소.전부();
  const 없는것 = await 설비저장소.하나(99999);
  const 지우기실패 = await 설비저장소.삭제(99999);

  res.json({
    전부개수: 전부.length,
    없는것: 없는것,
    지우기실패: 지우기실패,
  });
});

// 확인: GET /self-test
// 응답: 200 {"전부개수":2,"없는것":null,"지우기실패":false}

// ★ 이 세 줄은 서버 없이 그냥 node 로도 실행됩니다.
//
//     const 저장소 = require("./repositories/설비저장소");
//     저장소.하나(99999).then(console.log);   →  null
//
//   저장소가 Express 를 안 쓰기 때문에 가능합니다.
//   테스트를 짤 때 이 차이가 아주 큽니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "그런 주소가 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


// ── 섹션 5: 준비가 끝난 뒤에 요청을 받습니다 ──

async function 시작하기() {
  // ① 먼저 데이터를 준비합니다 (수업용 초기화)
  await 설비저장소.초기화(처음데이터);

  // ② 준비가 끝난 뒤에야 문을 엽니다
  app.listen(PORT, () => {
    console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/equipments`);
  });
}

시작하기();

// ★★ 왜 listen 을 async 함수 안에 넣었나
//
//   초기화(처음데이터) 는 파일에 쓰는 일이라 시간이 걸립니다.
//   await 없이 부르고 바로 listen 하면 이런 일이 생깁니다.
//
//     서버가 켜짐  →  요청이 들어옴  →  아직 파일이 안 쓰였음  →  빈 목록
//
//   대부분은 파일 쓰기가 더 빨라서 문제가 안 보입니다.
//   그래서 더 위험합니다. 열 번에 한 번씩 이상하게 동작합니다.
//
//   "준비가 끝난 뒤에 문을 연다" 는 서버의 기본 순서입니다.
//   PART 4 에서 데이터베이스에 연결할 때도 똑같이 합니다.
//
//     await 데이터베이스연결();
//     app.listen(PORT, ...);
//
// ★ 시작하기() 안에서 에러가 나면
//   준비에 실패했는데 서버가 켜지면 안 됩니다.
//   실무에서는 이렇게 씁니다.
//
//     시작하기().catch((에러) => {
//       console.error("서버를 켜지 못했습니다:", 에러);
//       process.exit(1);
//     });


// ============================================================
// 저장소가 지켜야 할 규칙
// ============================================================
//
//   ① HTTP 를 모른다
//      req, res 를 쓰지 않습니다. 상태코드를 정하지 않습니다.
//
//   ② 못 찾으면 null 이나 false 를 돌려준다
//      에러를 던져도 되지만, 그러면 "없는 것" 이 예외가 됩니다.
//      없는 것은 흔한 일이지 예외가 아닙니다.
//
//   ③ 어떻게 저장하는지를 밖에 안 알린다
//      파일인지 데이터베이스인지 부르는 쪽이 몰라야 합니다.
//      readFile 을 내보내면 안 되는 이유입니다.
//
//   ④ 규칙을 스스로 지킨다
//      id 를 붙이는 것, id 를 못 바꾸게 하는 것은 저장소의 몫입니다.
//
// ★ 반대로 저장소가 하면 안 되는 것
//   "이 사람이 볼 권한이 있나" 같은 판단은 저장소가 하지 않습니다.
//   그건 다음 층의 일입니다. 개념03 에서 봅니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 새 파일 시험.js 를 만들고 아래를 실행해 보세요.
//
//       const 저장소 = require("./repositories/설비저장소");
//       (async () => {
//         console.log(await 저장소.전부());
//         console.log(await 저장소.하나(1));
//         console.log(await 저장소.하나(99));
//       })();
//
//     서버를 안 켜고도 되는 것을 확인하세요.
//
// ✏️ 직접 해보기 2 — 저장소에 라인별로 찾는 함수 라인별(line) 을 추가하고
//                    GET /equipments?line=A 를 만들어 보세요.
//
// ✏️ 직접 해보기 3 — 저장소의 수정 함수에서 맨 뒤의 id 를 지워 보세요.
//                    PATCH /equipments/1/try-id-change 가 어떻게 되나요?
//                    그 뒤에 GET /equipments/1 을 부르면요?
//                    (확인 후 반드시 되돌리세요)
//
// ✏️ 직접 해보기 4 — 저장소의 findIndex 확인을 if (!자리) 로 바꿔 보세요.
//                    PATCH /equipments/1 이 어떻게 되나요? 왜 그럴까요?
//                    (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — module.exports 에 읽기 와 쓰기 를 추가해 보세요.
//                    이제 라우트에서 저장소.쓰기([]) 를 부를 수 있습니다.
//                    이게 왜 위험한지 생각해 보세요. (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 6 — 저장소의 삭제 함수가 그냥 true 를 돌려주게 바꿔 보세요.
//                    DELETE /equipments/99 가 어떻게 되나요?
//                    프론트는 무엇을 잘못 알게 될까요? (확인 후 되돌리세요)


// ── 자주 하는 실수 ──

// [실수 1] 저장소에서 res 를 씀
//   저장소가 HTTP 를 알게 됩니다. 다른 곳에서 못 씁니다.
//   res 가 필요해 보이면, 그건 저장소가 아니라 라우트가 할 일입니다.

// [실수 2] findIndex 결과를 if (!자리) 로 확인
//   0번 자리를 '못 찾음' 으로 봅니다. === -1 로 확인하세요.

// [실수 3] 저장소 함수에 await 를 안 붙임
//   Promise 가 그대로 응답에 담깁니다. {} 만 나갑니다.

// [실수 4] 저장소가 id 를 밖에서 받음
//   부르는 곳마다 다르게 정하면 번호가 겹칩니다.

// [실수 5] 읽기·쓰기를 밖으로 내보냄
//   저장소에 가둔 의미가 사라집니다. 아무나 파일을 통째로 덮어쓸 수 있습니다.

// [실수 6] 못 찾았을 때 빈 객체 {} 를 돌려줌
//   부르는 쪽이 "찾았다" 고 착각합니다. null 로 분명히 알리세요.


// ── 정리 ──

// 1. 읽고 쓰는 일을 '저장소' 로 묶으면 라우트가 짧아진다.
//    라우트는 요청을 받고 응답을 주는 일만 한다.
// 2. 저장소는 req 도 res 도 모른다. 알면 서버 없이 시험할 수 없다.
// 3. 그래서 저장소는 서버를 안 켜도 그냥 불러서 시험할 수 있다. 그게 목적이다.
// 4. id 는 저장소가 붙인다. 밖에서 받으면 겹치거나 건너뛴다.
// 5. id 는 나중에 못 바꾼다. 바꾸면 그것을 가리키던 것들이 전부 어긋난다.
// 6. findIndex 결과는 if (!자리) 로 확인하면 안 된다. 0 번째가 없는 것이 되어 버린다.
//    === -1 로 정확히 본다.
// 7. 저장소 함수는 파일을 다루므로 부를 때 await 를 붙인다.
// 8. 못 찾았으면 빈 객체가 아니라 null 을 돌려준다.
//    {} 를 주면 부르는 쪽이 '찾았다' 고 오해한다.
// 9. 읽기·쓰기 같은 속살은 밖으로 내보내지 않는다. 내보내면 아무나 파일을 건드린다.
