// ============================================================
// 06단원 · 개념 03 — 검색과 필터
// ------------------------------------------------------------
// 실행: node 개념03_검색과_필터.js
//       끄려면 Ctrl + C
// ============================================================
//
// 목록을 나눠 주는 법(개념02)을 배웠으니, 이제 골라 주는 법입니다.
//
//   필터   정해진 값과 정확히 같은 것만    ?line=A
//   검색   글자가 들어 있는 것을 찾기      ?q=로봇
//
// 둘은 비슷해 보이지만 다르게 다뤄야 합니다.

const express = require("express");
const { 설비목록 } = require("./data/설비데이터");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 필터 — 정확히 같은 것 ──

// line=A 는 "line 이 정확히 A 인 것" 입니다.
// 이런 건 === 로 비교합니다.

app.get("/api/v1/filter-basic", (req, res) => {
  const { line, status } = req.query;

  let 결과 = 설비목록();

  if (line) 결과 = 결과.filter((설비) => 설비.line === line);
  if (status) 결과 = 결과.filter((설비) => 설비.status === status);

  res.json({ 개수: 결과.length, ids: 결과.map((설비) => 설비.id) });
});

// 확인: GET /api/v1/filter-basic
// 응답: 200 {"개수":12,"ids":[1,2,3,4,5,6,7,8,9,10,11,12]}

// 확인: GET /api/v1/filter-basic?line=A
// 응답: 200 {"개수":4,"ids":[1,2,7,11]}

// 확인: GET /api/v1/filter-basic?line=A&status=가동
// 응답: 200 {"개수":3,"ids":[1,7,11]}

// 확인: GET /api/v1/filter-basic?line=Z
// 응답: 200 {"개수":0,"ids":[]}

// ★ 조건을 겹칠 때는 결과를 계속 좁혀 나갑니다.
//   let 으로 시작해서 조건마다 filter 를 이어 붙이면 됩니다.
//   조건이 없으면 if 를 통과하지 않으니 자동으로 무시됩니다.
//
// ★ 결과가 0건이어도 404 가 아닙니다.
//   "조건에 맞는 목록을 달라" 는 요청은 성공했습니다. 200 과 빈 배열입니다.
//   05단원부터 계속 나오는 이야기인데, 정말 많이 틀립니다.


// ── 섹션 2: 여러 값 중 하나 ──

// "A라인이거나 B라인" 은 어떻게 받을까요?
// 쉼표로 이어서 받는 것이 흔한 방법입니다.
//
//   ?line=A,B

app.get("/api/v1/filter-multi", (req, res) => {
  const { line } = req.query;

  let 결과 = 설비목록();

  if (line) {
    const 라인들 = line.split(",").map((조각) => 조각.trim());
    결과 = 결과.filter((설비) => 라인들.includes(설비.line));
  }

  res.json({ 개수: 결과.length, ids: 결과.map((설비) => 설비.id) });
});

// 확인: GET /api/v1/filter-multi?line=A
// 응답: 200 {"개수":4,"ids":[1,2,7,11]}

// 확인: GET /api/v1/filter-multi?line=A,B
// 응답: 200 {"개수":8,"ids":[1,2,3,4,7,8,11,12]}

// 확인: GET /api/v1/filter-multi?line=A,%20B
// 응답: 200 {"개수":8,"ids":[1,2,3,4,7,8,11,12]}

// ★ 세 번째를 보세요. A, B 처럼 쉼표 뒤에 공백이 있어도 됩니다.
//   trim() 을 안 하면 " B" 를 찾게 되어 B라인이 하나도 안 나옵니다.
//   사람이 손으로 주소를 칠 수도 있으니 공백은 미리 지워 두세요.
//
// ★ ?line=A&line=B 방식도 있습니다
//   Express 는 이걸 배열 ["A","B"] 로 줍니다. (04단원 개념03)
//   다만 하나만 오면 배열이 아니라 글자라서, 받는 쪽이 매번 확인해야 합니다.
//   쉼표 방식이 다루기 쉬워서 이 자료에서는 이쪽을 씁니다.


// ── 섹션 3: 검색 — 글자가 들어 있는 것 ──

// 이름에 '로봇' 이 든 것을 찾는다면 === 로는 안 됩니다.
// includes 로 "들어 있나" 를 봅니다.

app.get("/api/v1/search-basic", (req, res) => {
  const { q } = req.query;

  let 결과 = 설비목록();

  if (q) {
    결과 = 결과.filter((설비) => 설비.name.includes(q));
  }

  res.json({ 검색어: q ?? null, 개수: 결과.length, ids: 결과.map((설비) => 설비.id) });
});

// 확인: GET /api/v1/search-basic?q=로봇
// 응답: 200 {"검색어":"로봇","개수":4,"ids":[5,6,11,12]}

// 확인: GET /api/v1/search-basic?q=1호
// 응답: 200 {"검색어":"1호","개수":6,"ids":[1,3,5,7,9,11]}

// 확인: GET /api/v1/search-basic?q=없는말
// 응답: 200 {"검색어":"없는말","개수":0,"ids":[]}

// 확인: GET /api/v1/search-basic
// 응답: 200 {"검색어":null,"개수":12,"ids":[1,2,3,4,5,6,7,8,9,10,11,12]}

// ★ 검색어가 없으면 전부 돌려줍니다.
//   "검색어를 넣으라" 며 400 을 내는 것도 방법이지만,
//   같은 주소로 목록도 보고 검색도 하려면 이쪽이 편합니다.


// ── 섹션 4: ★ 검색에서 꼭 챙겨야 할 세 가지 ──

app.get("/api/v1/search-good", (req, res) => {
  // ① 앞뒤 공백 지우기
  //    사용자가 실수로 공백을 넣거나, 복사·붙여넣기하면 따라옵니다.
  const q = (req.query.q ?? "").trim();

  // ② 빈 검색어는 검색 안 한 것으로
  //    ?q= 로 보내면 빈 글자입니다. "" 는 모든 글자에 들어 있으므로
  //    includes("") 는 항상 true 입니다. 걸러 내나 마나가 됩니다.
  if (!q) {
    const 전부 = 설비목록();
    return res.json({ 검색어: null, 개수: 전부.length, ids: 전부.map((설비) => 설비.id) });
  }

  // ③ 대소문자 무시
  //    Robot 으로 찾든 robot 으로 찾든 나와야 합니다.
  const 소문자q = q.toLowerCase();

  const 결과 = 설비목록().filter((설비) =>
    설비.name.toLowerCase().includes(소문자q)
  );

  res.json({ 검색어: q, 개수: 결과.length, ids: 결과.map((설비) => 설비.id) });
});

// 확인: GET /api/v1/search-good?q=%20%20로봇%20%20
// 응답: 200 {"검색어":"로봇","개수":4,"ids":[5,6,11,12]}

// 확인: GET /api/v1/search-good?q=
// 응답: 200 {"검색어":null,"개수":12,"ids":[1,2,3,4,5,6,7,8,9,10,11,12]}

// 확인: GET /api/v1/search-good?q=%20
// 응답: 200 {"검색어":null,"개수":12,"ids":[1,2,3,4,5,6,7,8,9,10,11,12]}

// ★ 두 번째와 세 번째를 비교해 보세요.
//   ?q= 도, ?q=(공백) 도 전부 '검색 안 함' 으로 처리했습니다.
//   trim 을 먼저 하고 비어 있는지 확인했기 때문입니다. 순서가 중요합니다.
//
// ★ 04단원 개념03 에서 본 것 — req.query 는 못 고칩니다.
//   req.query.q = req.query.q.trim() 은 조용히 무시됩니다.
//   그래서 여기서는 새 변수 q 에 담았습니다.

// 대소문자 무시가 실제로 되는지 확인합니다.
app.get("/api/v1/search-case", (req, res) => {
  const q = (req.query.q ?? "").trim().toLowerCase();
  const 목록 = ["Robot Arm", "robot hand", "ROBOT LEG", "컨베이어"];

  res.json({
    대소문자무시: 목록.filter((이름) => 이름.toLowerCase().includes(q)),
    그냥비교: 목록.filter((이름) => 이름.includes(req.query.q ?? "")),
  });
});

// 확인: GET /api/v1/search-case?q=robot
// 응답: 200 {"대소문자무시":["Robot Arm","robot hand","ROBOT LEG"],"그냥비교":["robot hand"]}

// 그냥 비교하면 소문자로 쓴 것 하나만 나옵니다.
// 사용자는 세 개가 다 나오길 기대합니다.


// ── 섹션 5: 여러 속성에서 한꺼번에 찾기 ──

// 보통 검색창은 하나입니다. 이름이든 라인이든 어디서든 찾아 줘야 합니다.

app.get("/api/v1/search-fields", (req, res) => {
  const q = (req.query.q ?? "").trim().toLowerCase();

  if (!q) {
    return res.json({ 개수: 0, ids: [], 안내: "검색어를 넣어 주세요" });
  }

  // 찾아볼 속성들을 정해 둡니다.
  const 검색대상 = ["name", "line", "status"];

  const 결과 = 설비목록().filter((설비) =>
    검색대상.some((키) => String(설비[키]).toLowerCase().includes(q))
  );

  res.json({ 개수: 결과.length, ids: 결과.map((설비) => 설비.id) });
});

// 확인: GET /api/v1/search-fields?q=점검중
// 응답: 200 {"개수":2,"ids":[4,10]}

// 확인: GET /api/v1/search-fields?q=프레스
// 응답: 200 {"개수":2,"ids":[3,4]}

// 확인: GET /api/v1/search-fields?q=c
// 응답: 200 {"개수":4,"ids":[5,6,9,10]}

// ★ some 은 "하나라도 맞으면 true" 입니다. (JS자료 08단원)
//   every 를 쓰면 "전부 맞아야" 가 되어 아무것도 안 나옵니다.
//
// ★ String(설비[키]) 로 감싼 이유
//   숫자 속성을 검색 대상에 넣으면 toLowerCase 가 없어서 터집니다.
//   글자로 바꿔 두면 무엇이 와도 안전합니다.
//
// ★ 세 번째를 보세요. c 한 글자로 C라인 네 개가 나왔습니다.
//   짧은 검색어는 엉뚱한 것까지 걸립니다.
//   실무에서는 "두 글자 이상" 같은 제한을 두기도 합니다.


// ── 섹션 6: 검색과 필터와 페이징을 함께 ──

app.get("/api/v1/equipments", (req, res) => {
  const q = (req.query.q ?? "").trim().toLowerCase();
  const { line, status } = req.query;

  let 결과 = 설비목록();

  // ① 검색 (넓게 찾기)
  if (q) {
    결과 = 결과.filter((설비) =>
      ["name", "line", "status"].some((키) =>
        String(설비[키]).toLowerCase().includes(q)
      )
    );
  }

  // ② 필터 (정확히 좁히기)
  if (line) {
    const 라인들 = line.split(",").map((조각) => 조각.trim());
    결과 = 결과.filter((설비) => 라인들.includes(설비.line));
  }
  if (status) 결과 = 결과.filter((설비) => 설비.status === status);

  // ③ 개수는 자르기 전에 셉니다
  const total = 결과.length;

  // ④ 페이징
  let page = Number(req.query.page);
  let limit = Number(req.query.limit);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const 시작 = (page - 1) * limit;
  const data = 결과.slice(시작, 시작 + limit).map((설비) => ({ id: 설비.id }));

  res.json({
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// 확인: GET /api/v1/equipments?q=로봇&limit=2
// 응답: 200 {"data":[{"id":5},{"id":6}],"meta":{"page":1,"limit":2,"total":4,"totalPages":2}}

// 확인: GET /api/v1/equipments?q=로봇&limit=2&page=2
// 응답: 200 {"data":[{"id":11},{"id":12}],"meta":{"page":2,"limit":2,"total":4,"totalPages":2}}

// 확인: GET /api/v1/equipments?q=로봇&line=A
// 응답: 200 {"data":[{"id":11}],"meta":{"page":1,"limit":10,"total":1,"totalPages":1}}

// 확인: GET /api/v1/equipments?status=점검중
// 응답: 200 {"data":[{"id":4},{"id":10}],"meta":{"page":1,"limit":10,"total":2,"totalPages":1}}

// ★★ 순서가 중요합니다. 걸러 내기 → 개수 세기 → 자르기.
//
//   total 을 자른 뒤에 세면 항상 limit 이하가 나옵니다.
//   화면에 "전체 4건" 이 아니라 "전체 2건" 이 표시됩니다.
//   실무에서 정말 많이 나오는 버그입니다.
//
// ★ 검색을 먼저 하고 필터를 나중에 한 이유
//   순서를 바꿔도 결과는 같습니다. filter 는 겹쳐 쓰면 교집합이니까요.
//   다만 데이터가 많아지면, 많이 걸러 내는 조건을 먼저 두는 게 빠릅니다.


app.use((req, res) => {
  res.status(404).json({ error: "그런 주소가 없습니다" });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  const 코드 = err.status || 500;
  res.status(코드).json({ error: 코드 === 500 ? "서버에서 문제가 생겼습니다" : err.message });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments?q=로봇`);
});


// ============================================================
// 검색과 필터, 무엇을 쿼리 이름으로 쓸까
// ============================================================
//
//   ?q=              검색어. 관례적으로 q 또는 search 를 씁니다
//   ?line=A          속성 이름을 그대로. 무엇을 거르는지 분명합니다
//   ?status=가동
//   ?line=A,B        여러 값은 쉼표로
//   ?page= ?limit=   페이징
//   ?sort=-id        정렬
//   ?fields=id,name  원하는 속성만
//
// 이 이름들은 거의 표준처럼 쓰입니다.
// 남이 쓰던 이름을 그대로 쓰면 설명할 것이 줄어듭니다.
//
// ★ 하면 안 되는 것
//   ?filter={"line":"A"}   JSON 을 쿼리에 넣는 방식입니다.
//   되긴 하는데 주소가 지저분해지고, 인코딩 때문에 사고가 잦습니다.
//   조건이 아주 복잡한 경우가 아니면 쓰지 마세요.


// ============================================================
// 지금 방식의 한계
// ============================================================
//
// 여기서 만든 검색은 '전부 꺼내서 훑는' 방식입니다.
// 설비 12개니까 순식간입니다. 10만 개라면 요청마다 10만 번을 훑습니다.
//
// 그래서 진짜 서버는 데이터베이스에게 시킵니다.
//
//   SELECT * FROM equipments WHERE name LIKE '%로봇%' LIMIT 10 OFFSET 0
//
// 데이터베이스는 이런 걸 빠르게 하도록 만들어진 프로그램입니다. (PART 4)
//
// ★ 그래도 지금 배운 것이 그대로 쓰입니다
//   "검색어를 trim 한다", "빈 검색어는 무시한다", "대소문자를 맞춘다",
//   "total 은 자르기 전에 센다" — 전부 데이터베이스를 써도 똑같습니다.
//   도구가 바뀌어도 규칙은 안 바뀝니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 4의 trim() 을 지우고 ?q=%20%20로봇 을 보내 보세요.
//                    몇 건이 나오나요? (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 2 — 섹션 4의 빈 검색어 확인을 지우고 ?q= 를 보내 보세요.
//                    includes("") 가 무엇을 돌려주는지 생각해 보세요.
//
// ✏️ 직접 해보기 3 — 섹션 6에서 total 을 slice 뒤에 세도록 바꿔 보세요.
//                    ?q=로봇&limit=2 의 meta 가 어떻게 되나요?
//                    화면에 "전체 몇 건" 을 그린다면 무엇이 잘못될까요?
//                    (확인 후 반드시 되돌리세요)
//
// ✏️ 직접 해보기 4 — 검색어가 한 글자면 400 을 내도록 바꿔 보세요.
//                    두 글자 이상만 검색하게 하는 것입니다.
//
// ✏️ 직접 해보기 5 — ?installedAfter=2022-01-01 을 만들어
//                    그 날짜 이후에 설치된 설비만 나오게 해 보세요.
//                    (힌트: 날짜가 "2021-03-15" 모양이라 글자 비교로도 됩니다.
//                     왜 될까요? 다른 모양이었다면 어땠을까요?)
//
// ✏️ 직접 해보기 6 — 섹션 5의 some 을 every 로 바꿔 보세요.
//                    몇 건이 나오나요? 왜 그럴까요? (확인 후 되돌리세요)


// ── 자주 하는 실수 ──

// [실수 1] 빈 검색어를 안 거름
//   "".includes 는 언제나 true 라서 전부 통과합니다.
//   "검색했는데 왜 다 나오지?" 의 원인입니다.

// [실수 2] trim 을 안 함
//   복사·붙여넣기하면 공백이 따라옵니다. 아무것도 안 나옵니다.
//   사용자는 "분명히 맞게 썼는데" 라고 생각합니다.

// [실수 3] 대소문자를 안 맞춤
//   양쪽 다 toLowerCase 해야 합니다. 한쪽만 하면 소용없습니다.

// [실수 4] total 을 자른 뒤에 셈
//   화면의 전체 건수와 쪽 수가 전부 틀립니다.

// [실수 5] 결과가 0건일 때 404 를 줌
//   목록 조회는 0건도 성공입니다. 200 과 빈 배열입니다.

// [실수 6] 쉼표로 나눈 뒤 trim 을 안 함
//   ?line=A, B 에서 " B" 를 찾게 되어 B라인이 하나도 안 나옵니다.

// [실수 7] 숫자 속성에 toLowerCase 를 부름
//   → TypeError. String() 으로 감싸 두세요.


// ── 정리 ──

// 1. 필터는 '정확히 같은 것', 검색은 '글자가 들어 있는 것' 이다.
// 2. 검색에서 꼭 챙길 것이 셋이다 — 빈 검색어 거르기 · trim · 대소문자 맞추기.
// 3. 빈 검색어를 안 거르면 전부가 걸린다. 검색이 아니라 목록이 되어 버린다.
// 4. 대소문자는 양쪽 다 toLowerCase 로 맞춘다.
//    숫자 속성에 toLowerCase 를 부르면 터지니 글자인지 먼저 본다.
// 5. 여러 값 중 하나는 쉼표로 받아 나눈다. 나눈 뒤 trim 을 빼먹지 않는다.
// 6. total 은 여기서도 자르기 전에 센다.
// 7. 결과가 0건인 것은 404 가 아니다. 빈 배열에 200 이다.
//    잘 찾아봤는데 없는 것이지, 주소가 틀린 것이 아니다.
