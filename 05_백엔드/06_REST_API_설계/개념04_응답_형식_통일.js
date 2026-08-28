// ============================================================
// 06단원 · 개념 04 — 응답 형식 통일하기
// ------------------------------------------------------------
// 실행: node 개념04_응답_형식_통일.js
//       끄려면 Ctrl + C
// ============================================================
//
// 지금까지 응답을 그때그때 지어서 보냈습니다. 모아 놓고 보면 이렇습니다.
//
//   [{...}, {...}]                          목록
//   {"id":1,"title":"..."}                  하나
//   {"data":[...],"meta":{...}}             페이징한 목록
//   {"error":"그런 설비가 없습니다"}          에러
//   {"error":"입력값이 올바르지 않습니다","항목":[...]}   검증 실패
//
// 프론트엔드가 이걸 받으면 어떻게 될까요?
//
//   const 답 = await res.json();
//   // 목록이면 답 자체가 배열
//   // 페이징이면 답.data
//   // 에러면 답.error 인데, 어떤 건 글자고 어떤 건 객체
//
// 주소마다 다르게 써야 합니다. 주소가 서른 개면 서른 번 다릅니다.
// 그래서 형식을 하나로 정합니다.

const express = require("express");
const { 설비목록 } = require("./data/설비데이터");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 형식 정하기 ──

// 이 자료에서 쓸 형식입니다. 정답이 하나만 있는 건 아닙니다.
// 중요한 것은 '정하고 끝까지 지키는 것' 입니다.
//
//   성공  { "data": ... , "meta": {...} }        meta 는 있을 때만
//   실패  { "error": { "code": "...", "message": "...", "details": ... } }
//
// 규칙 하나
//   성공 응답에는 error 가 절대 없고, 실패 응답에는 data 가 절대 없습니다.
//   그래서 프론트는 이렇게만 쓰면 됩니다.
//
//     if (답.error) { 에러표시(답.error.message); return; }
//     화면그리기(답.data);
//
//   주소가 서른 개여도 이 두 줄로 끝납니다.


// ── 섹션 2: 성공 응답 도우미 ──

function 보내기(res, data, meta) {
  const 몸통 = { data };

  if (meta) {
    몸통.meta = meta;
  }

  res.json(몸통);
}

function 만들었음(res, data, 주소) {
  res.status(201).location(주소).json({ data });
}

app.get("/api/v1/equipments", (req, res) => {
  const 전부 = 설비목록();
  const data = 전부.slice(0, 3).map((설비) => ({ id: 설비.id, name: 설비.name }));

  보내기(res, data, { page: 1, limit: 3, total: 전부.length, totalPages: 4 });
});

// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호"},{"id":2,"name":"컨베이어 2호"},{"id":3,"name":"프레스 1호"}],"meta":{"page":1,"limit":3,"total":12,"totalPages":4}}

app.get("/api/v1/equipments/:id", (req, res, next) => {
  const 설비 = 설비목록().find((설비) => 설비.id === Number(req.params.id));

  if (!설비) {
    return next(에러.없음("설비"));
  }

  보내기(res, 설비); // meta 없이
});

// 확인: GET /api/v1/equipments/3
// 응답: 200 {"data":{"id":3,"name":"프레스 1호","line":"B","status":"가동","설치일":"2019-07-02"}}

// ★ 하나를 줄 때도 data 로 감쌉니다.
//   감싸는 게 번거로워 보이지만, 프론트 코드가 한 가지로 통일됩니다.
//   나중에 meta 를 붙일 일이 생겨도 형식이 안 깨집니다.


// ── 섹션 3: 에러 클래스 만들기 ──

// 지금까지는 이렇게 썼습니다.
//
//   function HttpError(코드, 메시지) {
//     const 에러 = new Error(메시지);
//     에러.status = 코드;
//     return 에러;
//   }
//
// 이제 코드(code)와 자세한 내용(details)까지 담아야 하니 class 로 만듭니다.

class AppError extends Error {
  constructor(status, code, message, details) {
    super(message); // Error 가 message 를 담당합니다

    this.name = "AppError";
    this.status = status; // HTTP 상태코드 — 404
    this.code = code; // 우리가 정한 코드 — "NOT_FOUND"
    this.details = details; // 필요하면 자세한 내용
  }
}

// ★ extends Error 를 왜 하나
//   Error 를 물려받으면 throw 로 던질 수 있고 스택도 자동으로 붙습니다.
//   그냥 객체를 던져도 되긴 하지만, 에러 처리 도구들이 Error 를 기대합니다.
//
// ★ super(message) 를 빼먹으면
//   → ReferenceError: Must call super constructor ...
//   물려받은 클래스는 자기 것을 만들기 전에 부모부터 만들어야 합니다.

// 자주 쓰는 에러를 미리 만들어 둡니다.
const 에러 = {
  없음: (무엇) => new AppError(404, "NOT_FOUND", `${무엇}을(를) 찾을 수 없습니다`),

  검증실패: (항목들) =>
    new AppError(400, "VALIDATION_FAILED", "입력값이 올바르지 않습니다", 항목들),

  로그인필요: () => new AppError(401, "UNAUTHENTICATED", "로그인이 필요합니다"),

  권한없음: (무엇) => new AppError(403, "FORBIDDEN", `${무엇} 권한이 없습니다`),

  중복: (무엇) => new AppError(409, "DUPLICATED", `이미 있는 ${무엇}입니다`),
};

// 확인: GET /api/v1/equipments/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비을(를) 찾을 수 없습니다"}}

// ★ "설비을(를)" 이 어색합니다. 조사 문제입니다.
//   받침이 있으면 '을', 없으면 '를' 인데 프로그램은 그걸 모릅니다.
//   그래서 '을(를)' 로 씁니다. 한국어 서비스에서 흔히 보는 표기입니다.
//   제대로 하려면 받침을 계산해야 합니다. 연습문제에서 만들어 봅니다.


// ── 섹션 4: 에러 코드를 왜 따로 두나 ──

app.get("/api/v1/why-code", (req, res) => {
  보내기(res, {
    이유1: "메시지는 바뀌어도 코드는 안 바뀝니다. 프론트가 코드로 판단하면 안 깨집니다.",
    이유2: "영어·일본어 화면을 만들 때, 프론트가 코드를 보고 자기 언어 메시지를 고릅니다.",
    이유3: "'없음' 인지 '권한없음' 인지를 상태코드만으로는 구별이 안 될 때가 있습니다.",
    나쁜예: 'if (답.error.message === "설비을(를) 찾을 수 없습니다")',
    좋은예: 'if (답.error.code === "NOT_FOUND")',
  });
});

// 확인: GET /api/v1/why-code
// 응답: 200 {"data":{"이유1":"메시지는 바뀌어도 코드는 안 바뀝니다. 프론트가 코드로 판단하면 안 깨집니다.","이유2":"영어·일본어 화면을 만들 때, 프론트가 코드를 보고 자기 언어 메시지를 고릅니다.","이유3":"'없음' 인지 '권한없음' 인지를 상태코드만으로는 구별이 안 될 때가 있습니다.","나쁜예":"if (답.error.message === \"설비을(를) 찾을 수 없습니다\")","좋은예":"if (답.error.code === \"NOT_FOUND\")"}}

// ★ 메시지로 판단하면 안 되는 이유
//   "설비를 찾을 수 없습니다" 를 "해당 설비가 없습니다" 로 다듬는 순간
//   프론트의 if 문이 조용히 false 가 됩니다. 에러가 안 납니다.
//   맞춤법 하나 고쳤다가 기능이 멈추는 일이 실제로 일어납니다.
//
// ★ 코드는 영어 대문자에 밑줄로 씁니다
//   NOT_FOUND, VALIDATION_FAILED, DUPLICATED
//   관례입니다. 한글로 쓰면 안 되는 건 아니지만 남들이 다 이렇게 씁니다.


// ── 섹션 5: 검증 실패는 자세히 ──

app.post("/api/v1/equipments", (req, res, next) => {
  const { name, line } = req.body || {};
  const 항목 = [];

  if (!name) 항목.push({ 키: "name", 이유: "필수입니다" });
  else if (name.length < 2) 항목.push({ 키: "name", 이유: "2글자 이상이어야 합니다" });

  if (!line) 항목.push({ 키: "line", 이유: "필수입니다" });
  else if (!["A", "B", "C"].includes(line))
    항목.push({ 키: "line", 이유: "A, B, C 중 하나여야 합니다" });

  if (항목.length > 0) {
    return next(에러.검증실패(항목));
  }

  만들었음(res, { id: 13, name, line }, "/api/v1/equipments/13");
});

// 확인: POST /api/v1/equipments
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"필수입니다"},{"키":"line","이유":"필수입니다"}]}}

// 확인: POST /api/v1/equipments {"name":"용","line":"Z"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"A, B, C 중 하나여야 합니다"}]}}

// 확인: POST /api/v1/equipments {"name":"용접로봇","line":"A"}
// 응답: 201 {"data":{"id":13,"name":"용접로봇","line":"A"}}

// ★ details 가 있으니 프론트가 입력칸마다 빨간 글씨를 붙일 수 있습니다.
//   message 만 주면 "입력값이 올바르지 않습니다" 하나만 띄우게 됩니다.
//   사용자는 어디가 틀렸는지 모릅니다.
//
// ★ 05단원에서는 { error, 항목 } 이라는 다른 모양이었습니다.
//   여기서는 error 안으로 넣어 형식을 통일했습니다.
//   "실패 응답의 정보는 전부 error 안에" 라는 규칙이 생긴 것입니다.


// ── 섹션 6: 다른 에러들 ──

app.get("/api/v1/secret", (req, res, next) => {
  next(에러.로그인필요());
});

// 확인: GET /api/v1/secret
// 응답: 401 {"error":{"code":"UNAUTHENTICATED","message":"로그인이 필요합니다"}}

app.delete("/api/v1/equipments/:id", (req, res, next) => {
  next(에러.권한없음("삭제"));
});

// 확인: DELETE /api/v1/equipments/3
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"삭제 권한이 없습니다"}}

app.post("/api/v1/users", (req, res, next) => {
  next(에러.중복("아이디"));
});

// 확인: POST /api/v1/users
// 응답: 409 {"error":{"code":"DUPLICATED","message":"이미 있는 아이디입니다"}}

// ★ 409 Conflict
//   "지금 상태와 안 맞는다" 는 뜻입니다. 아이디 중복이 대표적입니다.
//   400 을 써도 되지만, 409 면 프론트가 "중복" 이라고 바로 알 수 있습니다.

app.get("/api/v1/boom", (req, res) => {
  const 없는것 = undefined;
  res.json(없는것.속성); // 일부러 터뜨립니다
});

// 확인: GET /api/v1/boom
// 응답: 500 {"error":{"code":"INTERNAL_ERROR","message":"서버에서 문제가 생겼습니다"}}

// ★ 예상 못 한 에러도 같은 형식으로 나갑니다.
//   TypeError 메시지는 밖으로 안 나갑니다. 터미널에만 남습니다.


// ── 섹션 7: 404 와 에러 처리기 ──

app.use((req, res, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", "그런 주소가 없습니다"));
});

// 확인: GET /api/v1/없는주소
// 응답: 404 {"error":{"code":"ROUTE_NOT_FOUND","message":"그런 주소가 없습니다"}}

// ★ 없는 자원(NOT_FOUND)과 없는 주소(ROUTE_NOT_FOUND)를 코드로 구별했습니다.
//   둘 다 404 지만 프론트가 해야 할 일이 다릅니다.
//   앞은 "그 설비가 지워졌나 보다", 뒤는 "내가 주소를 잘못 썼다" 입니다.

app.use((err, req, res, next) => {
  // ① 터미널에는 전부 남깁니다
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  // ② 본문 JSON 이 깨진 경우 (express.json 이 만든 에러)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "JSON 형식이 아닙니다" },
    });
  }

  // ③ 우리가 만든 에러
  if (err instanceof AppError) {
    const 몸통 = { code: err.code, message: err.message };

    // details 가 있을 때만 넣습니다. 없는데 넣으면 null 이 지저분하게 남습니다.
    if (err.details !== undefined) {
      몸통.details = err.details;
    }

    return res.status(err.status).json({ error: 몸통 });
  }

  // ④ 그 밖 — 예상 못 한 에러
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" },
  });
});

// 확인: POST /api/v1/equipments {깨진:JSON}
// 응답: 400 {"error":{"code":"INVALID_JSON","message":"JSON 형식이 아닙니다"}}

// ★ err instanceof AppError 로 구별하는 것이 핵심입니다.
//   "내가 일부러 만든 에러" 와 "예상 못 한 에러" 를 나눠야 합니다.
//   앞은 메시지를 그대로 보여 줘도 되고, 뒤는 감춰야 합니다.
//
// ★ 스택은 절대 응답에 넣지 마세요
//   err.stack 에는 파일 경로가 전부 들어 있습니다.
//   서버 폴더 구조가 그대로 노출됩니다. 터미널에만 남기세요.


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
});


// ============================================================
// 프론트엔드에서 쓰는 모습
// ============================================================
//
//   async function 설비가져오기(id) {
//     const res = await fetch(`/api/v1/equipments/${id}`);
//     const 답 = await res.json();
//
//     if (답.error) {
//       if (답.error.code === "NOT_FOUND") {
//         화면에("그 설비는 삭제되었습니다");
//       } else if (답.error.code === "UNAUTHENTICATED") {
//         로그인화면으로();
//       } else {
//         화면에(답.error.message);
//       }
//       return;
//     }
//
//     그리기(답.data);
//   }
//
// 주소가 서른 개여도 이 모양 하나로 전부 처리됩니다.
// 형식을 통일한 대가로 얻는 것이 이것입니다.
//
// ★ res.ok 로 판단해도 됩니다
//   fetch 의 res.ok 는 상태코드가 200~299 면 true 입니다.
//   다만 error 필드를 보는 편이 더 분명합니다. 둘 다 봐도 됩니다.


// ============================================================
// 응답에 넣을 것과 넣지 말 것
// ============================================================
//
//   넣을 것
//     code       프론트가 판단할 기준
//     message    사람이 읽을 한 줄
//     details    입력값 오류처럼 자세히 알려 줄 것
//     requestId  문의할 때 쓸 번호 (05단원의 요청 번호)
//
//   넣지 말 것
//     stack          파일 경로가 그대로 노출됩니다
//     쿼리문          데이터베이스 구조가 노출됩니다
//     내부 IP·포트    "connect ECONNREFUSED 10.0.1.23:5432"
//     사용자 비밀번호  당연합니다. 에러 메시지에 딸려 나가는 경우가 실제로 있습니다
//
// ★ 판단 기준
//   "이걸 보고 상대가 무엇을 고칠 수 있나?"
//   고칠 수 있으면 알려 주고(400·404), 못 고치면 감춥니다(500).


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 에러 응답에 requestId 를 넣어 보세요.
//                    05단원의 번호붙이기 미들웨어를 가져와 req.요청번호 를 쓰면 됩니다.
//                    터미널 기록과 같은 번호가 나오는지 확인하세요.
//
// ✏️ 직접 해보기 2 — 에러 처리기에서 err instanceof AppError 확인을 지우고
//                    /api/v1/boom 을 불러 보세요. 무엇이 나오나요?
//                    (확인 후 반드시 되돌리세요)
//
// ✏️ 직접 해보기 3 — 500 응답에 err.message 를 담아 보고,
//                    /api/v1/boom 이 무엇을 알려 주는지 보세요.
//                    이 정보로 공격자가 무엇을 알 수 있을까요?
//                    (확인 후 반드시 되돌리세요)
//
// ✏️ 직접 해보기 4 — 에러 목록에 '너무 많이 요청함' 을 추가해 보세요.
//                    상태코드는 429, 코드는 TOO_MANY_REQUESTS 입니다.
//
// ✏️ 직접 해보기 5 — 성공 응답도 { success: true, data: ... } 로 바꿔 보세요.
//                    프론트 코드가 더 편해지나요, 더 번거로워지나요?
//                    (정답은 없습니다. 왜 그렇게 생각하는지가 중요합니다)
//
// ✏️ 직접 해보기 6 — "설비을(를)" 문제를 고쳐 보세요.
//                    받침이 있으면 '을', 없으면 '를' 입니다.
//                    (힌트: 마지막 글자의 코드에서 (코드 - 44032) % 28 이 0이면 받침이 없습니다.
//                     연습문제에서 자세히 만듭니다)


// ── 자주 하는 실수 ──

// [실수 1] 주소마다 응답 모양이 다름
//   프론트가 주소마다 다르게 써야 합니다. 형식을 하나로 정하세요.

// [실수 2] 성공인데 error 필드가 있음
//   { data: [...], error: null } 같은 모양입니다.
//   틀린 건 아니지만, "error 가 있으면 실패" 규칙이 깨집니다.
//   없으면 아예 넣지 마세요.

// [실수 3] 에러 코드 없이 메시지만 줌
//   프론트가 메시지 글자를 비교하게 됩니다. 맞춤법만 고쳐도 깨집니다.

// [실수 4] 500 에 상세 내용을 담음
//   내부 구조가 밖으로 새어 나갑니다.

// [실수 5] super(message) 를 빼먹음
//   → ReferenceError. class 를 물려받을 때는 부모부터 만들어야 합니다.

// [실수 6] instanceof 대신 err.status 유무로 판단
//   남이 만든 미들웨어의 에러에도 status 가 붙어 있을 수 있습니다.
//   내 에러인지 확실히 알려면 instanceof 를 쓰세요.


// ── 정리 ──

// 1. 응답 모양을 하나로 정해 두면 받는 쪽 코드가 단순해진다.
//    주소마다 다르면 부르는 쪽이 매번 다르게 읽어야 한다.
// 2. 성공에는 error 를 넣지 않고, 실패에는 data 를 넣지 않는다.
// 3. 에러에는 사람이 읽을 메시지와 함께 기계가 볼 '코드' 를 준다.
//    메시지는 언제든 바뀌지만 코드는 안 바뀌므로, 프론트는 코드로 갈래를 나눈다.
// 4. 에러 클래스를 만들어 두면 던지는 쪽이 짧아진다. super(message) 를 빼먹지 않는다.
// 5. 검증 실패는 자세히 준다. 어느 필드가 왜 틀렸는지 알려 줘야 화면에 표시할 수 있다.
// 6. 500 에는 상세 내용을 담지 않는다. 안쪽 사정이 밖으로 나간다.
// 7. 내가 만든 에러인지는 instanceof 로 가린다.
//    err.status 가 있는지로 가리면 남이 던진 에러가 섞여 들어온다.
// 8. 404 처리기와 에러 처리기는 여전히 맨 아래다.
