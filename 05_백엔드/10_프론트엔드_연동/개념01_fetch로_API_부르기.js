// ============================================================
// 10단원 · 개념 01 — fetch 로 API 부르기
// ------------------------------------------------------------
// 실행: node 개념01_fetch로_API_부르기.js
//       브라우저에서 http://localhost:3000 을 여세요.
// ============================================================
//
// 09단원까지 서버를 만들었습니다. 이제 화면을 붙입니다.
//
// ★ 이 단원은 '프론트엔드 수업' 이 아닙니다.
//   화면을 예쁘게 만드는 법이 아니라,
//   **서버가 준 응답을 화면이 어떻게 다뤄야 하는가** 를 배웁니다.
//
//   그래서 06단원에서 응답 형식을 통일해 둔 것이 여기서 값을 합니다.
//
// 이 파일은 화면과 API 를 같은 서버에서 줍니다. (08단원 ① 방식)
// 같은 출처라 CORS 를 신경 쓸 필요가 없습니다.
//
// ★★ 여기 화면은 **순수 HTML/JS** 입니다. React 가 아닙니다.
//   서버가 무엇을 주고받는지에 집중하려고 일부러 그렇게 했습니다.
//
//   ★ React 쪽에서 같은 일을 하는 자료가 따로 있습니다.
//     `React자료/실습프로젝트/src/14_서버와_연동`
//     거기서는 useForm 으로 폼을 만들고 FormData 로 파일을 올립니다.
//     주소도 `/api/v1/equipments` 로 여기와 똑같이 맞춰 두었습니다.
//
//   ★★ 두 자료가 **같은 이야기의 양쪽 끝**입니다.
//     PART 2 에서 붙는 쪽을 배웠고, 여기서 받는 쪽을 만듭니다.

const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());


// ── 섹션 1: 화면은 정적 파일로 ──

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/01_기본.html");
});

// 확인: GET /01_기본.html
// 응답: 200

// 확인: GET /api.js
// 응답: 200

// ★ public/api.js 를 꼭 열어 보세요.
//   이 단원의 핵심이 그 파일에 있습니다. 화면 코드가 아니라요.


// ── 화면 확인 ──
// 아래 선언은 진짜 크롬으로 버튼을 눌러서 확인합니다.
//   node _검증도구/화면검증.js 10_프론트엔드_연동

// 화면: 01_기본.html  button[data-할일="목록"]
// 보임: #결과  컨베이어 1호

// 화면: 01_기본.html  button[data-할일="하나"]
// 보임: #결과  성공

// 화면: 01_기본.html  button[data-할일="만들기"]
// 보임: #결과  용접로봇 1호

// 화면: 01_기본.html  button[data-할일="지우기"]
// 보임: #결과  "data": null

// 화면: 01_기본.html  button[data-할일="없음"]
// 보임: #결과  NOT_FOUND

// 화면: 01_기본.html  button[data-할일="검증"]
// 보임: #결과  VALIDATION_FAILED

// 화면: 01_기본.html  button[data-할일="터짐"]
// 보임: #결과  INTERNAL_ERROR

// 화면: 01_기본.html  button[data-할일="html"]
// 보임: #결과  BAD_RESPONSE

// 화면: 01_기본.html  button[data-할일="끊김"]
// 보임: #결과  NETWORK

// ★★ 마지막 두 개가 이 파일의 핵심입니다.
//   BAD_RESPONSE — JSON 이 아닌 응답이 와도 화면이 안 터집니다
//   NETWORK      — 서버에 닿지도 못해도 화면이 안 터집니다
//   api.js 가 없었다면 둘 다 콘솔에 빨간 에러를 내고 화면은 멈췄을 것입니다.


// ── 섹션 2: 화면이 부를 API ──

let 설비들 = [
  { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
  { id: 2, name: "프레스 1호", line: "B", status: "정지" },
];

app.get("/api/v1/equipments", (req, res) => {
  res.json({ data: 설비들, meta: { total: 설비들.length } });
});

// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}],"meta":{"total":2}}

app.get("/api/v1/equipments/:id", (req, res) => {
  const 설비 = 설비들.find((설비) => 설비.id === Number(req.params.id));

  if (!설비) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "설비를 찾을 수 없습니다" },
    });
  }

  res.json({ data: 설비 });
});

// 확인: GET /api/v1/equipments/1
// 응답: 200 {"data":{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"}}

// 확인: GET /api/v1/equipments/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

app.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};
  const 항목 = [];

  if (!name) 항목.push({ 키: "name", 이유: "필수입니다" });
  else if (name.length < 2) 항목.push({ 키: "name", 이유: "2글자 이상이어야 합니다" });

  if (!line) 항목.push({ 키: "line", 이유: "필수입니다" });
  else if (!["A", "B", "C"].includes(line))
    항목.push({ 키: "line", 이유: "A, B, C 중 하나여야 합니다" });

  if (항목.length > 0) {
    return res.status(400).json({
      error: { code: "VALIDATION_FAILED", message: "입력값이 올바르지 않습니다", details: 항목 },
    });
  }

  const 새설비 = { id: 3, name, line, status: "정지" };
  res.status(201).json({ data: 새설비 });
});

// 확인: POST /api/v1/equipments {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}

// 확인: POST /api/v1/equipments {"name":"용"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"필수입니다"}]}}

app.delete("/api/v1/equipments/:id", (req, res) => {
  res.sendStatus(204);
});

// 확인: DELETE /api/v1/equipments/1
// 응답: 204

// ★ 204 는 본문이 없습니다. 화면에서 res.json() 을 부르면 터집니다.
//   api.js 가 204 를 먼저 걸러 내는 이유입니다.


// ── 섹션 3: 일부러 실패하는 주소들 ──

app.get("/api/v1/boom", (req, res) => {
  const 없는것 = undefined;
  res.json(없는것.속성); // TypeError
});

// 확인: GET /api/v1/boom
// 응답: 500 {"error":{"code":"INTERNAL_ERROR","message":"서버에서 문제가 생겼습니다"}}

app.get("/api/v1/html", (req, res) => {
  // JSON 을 기대했는데 HTML 이 오는 경우입니다.
  res.status(500).type("html").send("<!DOCTYPE html><p>서버 점검 중입니다</p>");
});

// 확인: GET /api/v1/html
// 응답: 500

// ★★ 이 경우가 실무에서 정말 자주 납니다.
//   앞단에 Nginx 같은 것이 있으면, 서버가 죽었을 때 HTML 에러 페이지를 대신 줍니다.
//   화면이 res.json() 을 부르면 "Unexpected token '<'" 로 터집니다.
//
//   api.js 는 json() 을 try/catch 로 감싸서 BAD_RESPONSE 로 바꿉니다.
//   덕분에 화면은 "서버 응답을 읽지 못했습니다" 를 보여 줄 수 있습니다.


// ── 섹션 4: 404 와 에러 처리기 ──

app.use((req, res) => {
  res.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "그런 주소가 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
});


// ============================================================
// public/api.js 가 하는 일
// ============================================================
//
// 화면이 부르는 것은 세 줄뿐입니다.
//
//   const 답 = await api.get("/api/v1/equipments");
//   화면그리기(답.data);
//
// 그런데 그 사이에 이런 일이 다 처리됩니다.
//
//   ① fetch 가 던지는 경우      → NETWORK (서버에 닿지도 못함)
//   ② 204 라 본문이 없는 경우    → { data: null }
//   ③ JSON 이 아닌 응답          → BAD_RESPONSE
//   ④ 몸통에 error 가 있는 경우  → API에러 로 던짐
//   ⑤ 그 밖                      → 몸통을 그대로 돌려줌
//
// 화면은 try/catch 하나로 ①③④를 전부 받습니다.
//
// ★★ ①이 왜 중요한가
//   fetch 는 404·500 에 던지지 않습니다. 응답이 왔으니까요.
//   던지는 것은 '서버에 닿지도 못한' 경우뿐입니다.
//
//     서버가 꺼짐 / 인터넷 끊김 / CORS 로 막힘 (08단원)
//
//   그래서 fetch 만 쓰면 500 을 성공으로 착각합니다.
//   반드시 응답 내용을 확인해야 합니다.


// ============================================================
// res.ok 로 판단할까, error 필드로 판단할까
// ============================================================
//
//   res.ok        상태코드가 200~299 면 true
//   몸통.error    06단원에서 정한 형식
//
// 둘 다 됩니다. 이 자료는 error 필드로 판단합니다.
//
//   · 06단원에서 "성공엔 error 없고 실패엔 data 없다" 고 정해 뒀습니다
//   · 상태코드를 안 봐도 되니 화면 코드가 단순해집니다
//   · code 로 갈래를 나눌 수 있습니다 (NOT_FOUND 면 이 화면, UNAUTHENTICATED 면 저 화면)
//
// ★ 다만 남이 만든 API 를 부를 때는 res.ok 를 봐야 합니다.
//   형식이 우리와 다를 테니까요.
//   그때도 api.js 같은 파일을 하나 만들어 그 안에서만 처리하세요.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 아홉 개 버튼을 전부 눌러 보세요.
//                    F12 → Network 에서 상태코드가 각각 무엇인가요?
//
// ✏️ 직접 해보기 2 — '서버에 못 닿음' 버튼을 누르고 Console 을 보세요.
//                    빨간 에러가 하나 더 있습니다. 그건 왜 나올까요?
//                    (힌트: 브라우저가 연결 실패를 알리는 것입니다. 우리 코드와 별개입니다)
//
// ✏️ 직접 해보기 3 — 서버를 Ctrl+C 로 끄고 'GET 목록' 을 눌러 보세요.
//                    화면에 무엇이 나오나요? code 가 무엇인가요?
//
// ✏️ 직접 해보기 4 — api.js 의 204 처리를 지우고 'DELETE' 를 눌러 보세요.
//                    어떤 에러가 나나요? (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — api.js 에서 json() 의 try/catch 를 지우고
//                    'JSON 이 아닌 응답' 을 눌러 보세요.
//                    Console 의 에러 메시지를 그대로 적어 보세요.
//
// ✏️ 직접 해보기 6 — api.js 의 판단을 res.ok 로 바꿔 보세요.
//                    아홉 버튼이 전부 그대로 동작하나요?
//                    무엇이 달라지나요?
//
// ✏️ 직접 해보기 7 — api.put 을 추가해 보세요. api.patch 를 복사하면 됩니다.


// ── 자주 하는 실수 ──

// [실수 1] fetch 만 쓰고 응답을 확인 안 함
//   404·500 도 '성공' 으로 흘러갑니다. 화면에 undefined 가 나옵니다.

// [실수 2] 204 에 res.json() 을 부름
//   본문이 없어서 터집니다. 상태코드를 먼저 보세요.

// [실수 3] json() 을 try/catch 없이 부름
//   HTML 에러 페이지가 오면 "Unexpected token '<'" 로 터집니다.

// [실수 4] 화면마다 fetch 를 직접 씀
//   에러 처리를 화면 수만큼 반복하게 됩니다. 한 군데를 빠뜨리면 그 화면만 이상해집니다.

// [실수 5] 에러 메시지 글자로 갈래를 나눔
//   서버에서 맞춤법만 고쳐도 화면이 깨집니다. code 로 판단하세요. (06단원 개념04)

// [실수 6] catch 에서 아무것도 안 함
//   사용자는 버튼을 눌렀는데 아무 일도 안 일어난 것처럼 보입니다.
//   반드시 화면에 알려야 합니다. 개념02 에서 자세히 합니다.


// ── 정리 ──

// 1. fetch 는 응답이 오기만 하면 성공으로 친다. 404 도 500 도 catch 로 안 간다.
//    res.ok 를 반드시 확인한다.
// 2. catch 로 오는 것은 아예 못 갔을 때다 — 서버가 꺼졌거나, 네트워크가 끊겼거나, CORS.
// 3. 204 에는 본문이 없다. res.json() 을 부르면 그 자리에서 터진다.
// 4. 서버가 JSON 이 아닌 것을 줄 수도 있다. json() 은 try/catch 로 감싼다.
// 5. 화면마다 fetch 를 직접 쓰지 않는다. 한곳에 모아 두고 그것만 부른다.
//    안 그러면 규칙이 바뀔 때 모든 화면을 고쳐야 한다.
// 6. 갈래는 에러 메시지 글자로 나누지 않는다. 06단원에서 정한 에러 코드로 나눈다.
//    메시지는 언제든 바뀐다.
// 7. catch 에서 아무것도 안 하면 안 된다. 사용자는 화면이 멈춘 줄 안다.
