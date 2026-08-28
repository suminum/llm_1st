// ============================================================
// 06단원 · 개념 01 — 자원과 주소 설계
// ------------------------------------------------------------
// 실행: node 개념01_자원과_주소_설계.js
//       끄려면 Ctrl + C
// ============================================================
//
// 지금까지 주소를 그때그때 지어서 썼습니다. 이제 규칙을 정합니다.
//
// 왜 규칙이 필요한가
//   주소는 한 번 공개하면 못 바꿉니다.
//   프론트엔드가 그 주소를 쓰고 있고, 다른 회사가 쓰고 있을 수도 있습니다.
//   나중에 고치려면 옛 주소와 새 주소를 둘 다 유지해야 합니다.
//
//   그래서 처음에 잘 지어야 합니다.
//   다행히 규칙이 정해져 있습니다. 이걸 REST 라고 부릅니다.

const express = require("express");
const { 설비목록, 점검기록목록 } = require("./data/설비데이터");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 자원이란 무엇인가 ──

// 자원(resource)은 '이 시스템이 다루는 것' 입니다.
//
//   설비 관리 시스템   설비, 점검기록, 작업지시, 사용자
//   쇼핑몰            상품, 주문, 장바구니, 리뷰, 회원
//   게시판            글, 댓글, 회원
//
// 주소를 지을 때는 '무엇을 할까' 가 아니라 '무엇에 대해서인가' 를 먼저 정합니다.
//
//   ✗ 설비를 등록한다, 설비를 조회한다, 설비를 삭제한다   ← 할 일 목록
//   ○ 설비                                              ← 자원 하나
//
// 자원 하나가 정해지면 주소는 두 개뿐입니다.
//
//   /equipments       설비 전부 (컬렉션)
//   /equipments/3     설비 하나 (개별)
//
// 나머지는 메서드가 말합니다.


// ── 섹션 2: 다섯 가지 기본 주소 ──

const 라우터 = express.Router();

라우터.get("/equipments", (req, res) => {
  res.json({ 설명: "목록", 개수: 설비목록().length });
});

라우터.get("/equipments/:id", (req, res) => {
  const 설비 = 설비목록().find((설비) => 설비.id === Number(req.params.id));

  if (!설비) {
    return res.status(404).json({ error: "그 설비가 없습니다" });
  }

  res.json(설비);
});

라우터.post("/equipments", (req, res) => {
  res.status(201).json({ 설명: "새로 만들기" });
});

라우터.patch("/equipments/:id", (req, res) => {
  res.json({ 설명: "일부만 고치기", id: Number(req.params.id) });
});

라우터.delete("/equipments/:id", (req, res) => {
  res.sendStatus(204);
});

// ── 섹션 3: 주소 앞에 /api/v1 을 붙입니다 ──

app.use("/api/v1", 라우터);

// 확인: GET /api/v1/equipments
// 응답: 200 {"설명":"목록","개수":12}

// 확인: GET /api/v1/equipments/3
// 응답: 200 {"id":3,"name":"프레스 1호","line":"B","status":"가동","설치일":"2019-07-02"}

// 확인: POST /api/v1/equipments
// 응답: 201 {"설명":"새로 만들기"}

// 확인: PATCH /api/v1/equipments/3
// 응답: 200 {"설명":"일부만 고치기","id":3}

// 확인: DELETE /api/v1/equipments/3
// 응답: 204

// ★ /api 를 붙이는 이유
//   나중에 같은 서버에서 HTML 화면도 줘야 할 때가 옵니다.
//
//     GET /equipments        사람이 보는 HTML 페이지
//     GET /api/v1/equipments 프로그램이 쓰는 JSON
//
//   섞이면 "이 주소가 HTML 인가 JSON 인가" 를 매번 확인해야 합니다.
//   처음부터 나눠 두면 그럴 일이 없습니다.
//
// ★ /v1 을 붙이는 이유
//   주소는 한 번 공개하면 못 바꾼다고 했습니다.
//   그런데 언젠가는 꼭 바꿔야 할 일이 생깁니다.
//
//   그때 /api/v2/equipments 를 새로 만들고, v1 은 그대로 둡니다.
//   기존에 쓰던 곳은 안 깨지고, 새로 만드는 곳은 v2 를 씁니다.
//   준비가 되면 v1 을 없앱니다.
//
//   v1 없이 시작하면 나중에 붙일 데가 없어서 주소가 지저분해집니다.
//   처음부터 붙여 두세요. 붙이는 비용은 0 입니다.


// ── 섹션 4: 포함 관계는 주소로 나타냅니다 ──

// "1번 설비의 점검기록" 은 어떻게 쓸까요?
//
//   ✗ /checkLogs?equipmentId=1     됩니다. 되지만 관계가 안 보입니다
//   ○ /equipments/1/logs           1번 설비에 딸린 것이 분명합니다

라우터.get("/equipments/:id/logs", (req, res) => {
  const 설비번호 = Number(req.params.id);
  const 기록들 = 점검기록목록().filter((기록) => 기록.equipmentId === 설비번호);

  res.json({ 설비번호, 개수: 기록들.length, ids: 기록들.map((기록) => 기록.id) });
});

// 확인: GET /api/v1/equipments/1/logs
// 응답: 200 {"설비번호":1,"개수":3,"ids":[1,2,5]}

// 확인: GET /api/v1/equipments/7/logs
// 응답: 200 {"설비번호":7,"개수":0,"ids":[]}

라우터.get("/equipments/:id/logs/:logId", (req, res) => {
  const 기록 = 점검기록목록().find(
    (기록) =>
      기록.id === Number(req.params.logId) && 기록.equipmentId === Number(req.params.id)
  );

  if (!기록) {
    return res.status(404).json({ error: "그 점검기록이 없습니다" });
  }

  res.json(기록);
});

// 확인: GET /api/v1/equipments/1/logs/2
// 응답: 200 {"id":2,"equipmentId":1,"result":"이상","점검일":"2026-08-08","담당자":"이서연"}

// 확인: GET /api/v1/equipments/3/logs/2
// 응답: 404 {"error":"그 점검기록이 없습니다"}

// ★ 두 번째 확인이 중요합니다.
//   2번 기록은 분명히 있습니다. 그런데 3번 설비의 것이 아닙니다.
//   주소가 "3번 설비의 2번 기록" 이라고 했으니, 그런 것은 없는 게 맞습니다.
//
//   logId 만 보고 찾으면 남의 설비 기록이 보입니다.
//   중첩 주소를 만들 때는 반드시 '위쪽 번호까지' 확인하세요.
//   실무에서 정말 자주 나는 사고입니다. 남의 주문서가 보이는 식으로요.
//
// ★ 얼마나 깊이 중첩해도 되나
//   두 단계까지만 하세요.
//     /equipments/1/logs/2        ○
//     /lines/A/equipments/1/logs/2  ✗ 너무 깁니다
//
//   깊어지면 이렇게 나눕니다.
//     /logs/2                     기록 하나는 그냥 최상위로
//     /equipments/1/logs          목록만 중첩으로


// ── 섹션 5: 동사가 꼭 필요할 때 ──

// "주소에 동사를 쓰지 마라" 고 했지만 예외가 있습니다.
// CRUD 로 표현이 안 되는 '행동' 이 있습니다.
//
//   설비를 점검한다        만들기? 고치기? 애매합니다
//   주문을 취소한다        지우기가 아닙니다. 기록은 남아야 합니다
//   비밀번호를 바꾼다      고치기지만 보통과 다릅니다

라우터.post("/equipments/:id/checks", (req, res) => {
  // 점검을 '실행' 하면 점검기록이 하나 '생깁니다'.
  // 그러면 이건 '점검기록을 만드는 것' 입니다. 명사로 표현할 수 있습니다.
  res.status(201).json({ 설명: "점검을 실행해 기록을 하나 만들었습니다" });
});

// 확인: POST /api/v1/equipments/3/checks
// 응답: 201 {"설명":"점검을 실행해 기록을 하나 만들었습니다"}

라우터.post("/orders/:id/cancel", (req, res) => {
  // 이건 명사로 바꾸기 어렵습니다. 이럴 때는 동사를 씁니다.
  res.json({ 설명: "취소했습니다", id: Number(req.params.id) });
});

// 확인: POST /api/v1/orders/7/cancel
// 응답: 200 {"설명":"취소했습니다","id":7}

// ★ 순서대로 생각하세요.
//   ① 명사로 표현할 수 있나?      → /equipments/1/checks (점검기록을 만든다)
//   ② 상태를 바꾸는 것인가?       → PATCH /orders/7  { "status": "취소" }
//   ③ 둘 다 아니면 동사를 쓴다    → POST /orders/7/cancel
//
//   ③을 쓸 때는 반드시 POST 입니다. GET 으로 만들면 안 됩니다.
//   GET 은 "가져오기만 한다" 는 약속이라, 브라우저가 미리 불러 볼 수도 있습니다.
//   주소창에 넣거나 링크를 걸면 주문이 취소되어 버립니다.


// ── 섹션 6: 나쁜 주소 모아 보기 ──

app.get("/design-guide", (req, res) => {
  res.json({
    나쁨: [
      "GET /getEquipments",
      "GET /equipment/3",
      "POST /createEquipment",
      "GET /deleteEquipment?id=3",
      "POST /equipments/3/update",
      "GET /equipmentsByLine?line=A",
    ],
    좋음: [
      "GET /api/v1/equipments",
      "GET /api/v1/equipments/3",
      "POST /api/v1/equipments",
      "DELETE /api/v1/equipments/3",
      "PATCH /api/v1/equipments/3",
      "GET /api/v1/equipments?line=A",
    ],
  });
});

// 확인: GET /design-guide
// 응답: 200 {"나쁨":["GET /getEquipments","GET /equipment/3","POST /createEquipment","GET /deleteEquipment?id=3","POST /equipments/3/update","GET /equipmentsByLine?line=A"],"좋음":["GET /api/v1/equipments","GET /api/v1/equipments/3","POST /api/v1/equipments","DELETE /api/v1/equipments/3","PATCH /api/v1/equipments/3","GET /api/v1/equipments?line=A"]}

// 한 줄씩 무엇이 틀렸는지
//
//   /getEquipments          동사가 들어갔습니다. GET 이 이미 '가져온다' 입니다
//   /equipment/3            단수형입니다. 컬렉션에서 하나를 고르는 것이니 복수형
//   /createEquipment        동사 + 메서드가 GET/POST 어느 쪽인지도 안 보입니다
//   /deleteEquipment?id=3   ★ 가장 위험합니다. GET 으로 지우고 있습니다
//   /equipments/3/update    고치기는 PATCH 가 이미 있습니다
//   /equipmentsByLine       걸러 보기는 쿼리로. 조건마다 주소를 만들면 끝이 없습니다


app.use((req, res) => {
  res.status(404).json({ error: "그런 주소가 없습니다" });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  const 코드 = err.status || 500;
  res.status(코드).json({ error: 코드 === 500 ? "서버에서 문제가 생겼습니다" : err.message });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
});


// ============================================================
// 주소 설계 규칙 정리
// ============================================================
//
//   ① 자원은 복수형 명사       /equipments  (/equipment ✗)
//   ② 동사는 메서드가 말한다   GET/POST/PATCH/DELETE
//   ③ 하나는 경로로           /equipments/3
//   ④ 걸러 보기는 쿼리로      /equipments?line=A
//   ⑤ 포함 관계는 중첩으로     /equipments/1/logs   (두 단계까지)
//   ⑥ 앞에 /api/v1 을 붙인다
//   ⑦ 영어 소문자와 하이픈만   /work-orders  (/작업지시 ✗, /workOrders 도 피함)
//
// ⑦의 하이픈
//   주소는 대소문자를 구별하는 곳도 있고 안 하는 곳도 있어서
//   /workOrders 는 위험합니다. /work-orders 로 쓰세요.
//
// 그리고 04단원에서 본 것 — 주소에 한글을 쓰면 조용히 404 가 납니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 아래 요구사항의 주소와 메서드를 지어 보세요.
//
//     ① 모든 작업지시 목록
//     ② A라인 작업지시만
//     ③ 3번 작업지시 하나
//     ④ 3번 작업지시에 댓글 달기
//     ⑤ 3번 작업지시의 댓글 목록
//     ⑥ 3번 작업지시를 완료 처리
//     ⑦ 5번 댓글 지우기
//
// ✏️ 직접 해보기 2 — /api/v1/equipments/1/logs/2 를 만들었습니다.
//                    /api/v1/logs/2 도 함께 만들면 어떤 문제가 생길까요?
//                    (힌트: 같은 것을 두 주소로 가리키게 됩니다)
//
// ✏️ 직접 해보기 3 — 섹션 4의 logId 확인에서 equipmentId 조건을 빼 보세요.
//                    /api/v1/equipments/3/logs/2 가 어떻게 되나요?
//                    이게 왜 사고인지 설명해 보세요. (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 4 — POST /orders/:id/cancel 을 GET 으로 바꿔 보세요.
//                    브라우저 주소창에 넣으면 어떻게 되나요?
//                    이게 왜 위험한지 생각해 보세요. (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — 여러분이 만들고 싶은 서비스의 자원을 세 개 적고,
//                    각각의 다섯 가지 기본 주소를 써 보세요.


// ── 자주 하는 실수 ──

// [실수 1] 주소에 동사를 넣음
//   /getX, /createX, /updateX, /deleteX
//   메서드가 이미 그 말을 하고 있습니다.

// [실수 2] GET 으로 데이터를 바꿈
//   /deleteEquipment?id=3 은 링크를 누르는 것만으로 지워집니다.
//   검색 엔진이 링크를 따라가다 데이터를 다 지운 사고가 실제로 있었습니다.
//   GET 은 몇 번을 불러도 아무것도 안 바뀌어야 합니다.

// [실수 3] 자원을 단수형으로 씀
//   /equipment/3 보다 /equipments/3 입니다.
//   "설비 목록에서 3번" 이라고 읽으면 복수형이 자연스럽습니다.

// [실수 4] 중첩 주소에서 위쪽 번호를 확인 안 함
//   /equipments/3/logs/2 에서 logId 만 보면 남의 기록이 보입니다.

// [실수 5] 조건마다 새 주소를 만듦
//   /equipmentsByLine, /equipmentsByStatus, /equipmentsByLineAndStatus ...
//   조건이 늘 때마다 주소가 두 배씩 늘어납니다. 쿼리를 쓰세요.

// [실수 6] /api/v1 을 안 붙이고 시작함
//   나중에 붙이려면 기존 주소를 전부 바꿔야 합니다.
//   처음에 붙이는 것은 공짜입니다.


// ── 정리 ──

// 1. 주소는 '무엇' 을 가리키고, '무엇을 하는지' 는 메서드가 말한다.
// 2. 그래서 주소에 동사를 넣지 않는다. /getDocuments 가 아니라 GET /documents 다.
// 3. 자원은 복수형으로 쓴다. /document 가 아니라 /documents.
// 4. 기본은 다섯 가지다 — 목록·하나 보기·만들기·고치기·지우기.
// 5. 주소 앞에 /api/v1 을 붙이고 시작한다.
//    나중에 붙이려면 이미 쓰고 있는 쪽을 전부 고쳐야 한다.
// 6. 포함 관계는 주소로 나타낸다 — /documents/12/comments.
//    이때 위쪽 번호(12)가 진짜 있는지 반드시 먼저 확인한다.
// 7. GET 으로 데이터를 바꾸지 않는다. GET 은 봐도 아무 일이 없어야 한다.
// 8. 조건마다 새 주소를 만들지 않는다. 조건은 쿼리로 받는다.
