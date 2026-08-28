// ============================================================
// 06단원 서버 연습문제 정답 — README.md 문서대로 만든 설비 API
// ------------------------------------------------------------
// 실행: node 연습문제_서버_정답.js
// ============================================================
//
// 감사무시: 대조 — 이 정답은 번호 블록이 아니라 '완성된 서버 한 벌' 입니다.
//            문제 파일의 11개를 다 반영했지만 코드가 한 흐름으로 이어져
//            번호로 자를 수 없습니다.
//
// 이 파일은 같은 폴더의 README.md 를 그대로 구현한 것입니다.
// 문서와 코드가 한 글자도 어긋나면 안 됩니다.

const express = require("express");
const { 설비목록, 점검기록목록 } = require("./data/설비데이터");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ───── 준비 ─────

// 데이터는 서버가 켜질 때 한 번만 가져옵니다.
// 매번 설비목록() 을 부르면 추가·삭제한 것이 사라집니다.
let 설비들 = 설비목록();
const 점검기록들 = 점검기록목록();

let 다음번호 = 13;

const 라인값들 = ["A", "B", "C"];
const 상태값들 = ["가동", "정지", "점검중"];

const 키별사용자 = {
  "key-user-1": { name: "김민준", role: "user" },
  "key-admin-1": { name: "이서연", role: "admin" },
};


// ───── 연습문제.js 에서 만든 함수들 ─────

function 받침있나(글자) {
  const 코드 = 글자.charCodeAt(0);
  if (코드 < 44032 || 코드 > 55203) return null;
  return (코드 - 44032) % 28 !== 0;
}

function 조사붙이기(단어, 받침있을때, 받침없을때) {
  const 있나 = 받침있나(단어[단어.length - 1]);
  if (있나 === null) return `${단어}(${받침있을때}/${받침없을때})`;
  return 단어 + (있나 ? 받침있을때 : 받침없을때);
}

function 쪽정보(query, 기본 = 10, 최대 = 100) {
  let page = Number(query.page);
  let limit = Number(query.limit);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 기본;
  if (limit > 최대) limit = 최대;

  return { page, limit };
}

function 정렬조건(sort) {
  if (!sort) return [];

  return sort
    .split(",")
    .map((조각) => 조각.trim())
    .filter(Boolean)
    .map((조각) =>
      조각.startsWith("-") ? { 키: 조각.slice(1), 방향: -1 } : { 키: 조각, 방향: 1 }
    );
}

function 비교하기(a, b, 조건들) {
  for (const { 키, 방향 } of 조건들) {
    const 왼쪽 = a[키];
    const 오른쪽 = b[키];

    if (typeof 왼쪽 === "string" && typeof 오른쪽 === "string") {
      const 결과 = 왼쪽.localeCompare(오른쪽, "ko", { numeric: true });
      if (결과 !== 0) return 결과 * 방향;
      continue;
    }

    if (왼쪽 < 오른쪽) return -1 * 방향;
    if (왼쪽 > 오른쪽) return 1 * 방향;
  }

  return 0;
}

function 필드고르기(항목, fields) {
  if (!fields) return 항목;

  const 결과 = {};

  for (const 키 of fields.split(",").map((조각) => 조각.trim())) {
    if (키 in 항목) 결과[키] = 항목[키];
  }

  return 결과;
}


// ───── 에러 ─────

class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const 에러 = {
  없음: (무엇) =>
    new AppError(404, "NOT_FOUND", `${조사붙이기(무엇, "을", "를")} 찾을 수 없습니다`),

  검증실패: (항목들) =>
    new AppError(400, "VALIDATION_FAILED", "입력값이 올바르지 않습니다", 항목들),

  로그인필요: () => new AppError(401, "UNAUTHENTICATED", "로그인이 필요합니다"),

  권한없음: (무엇) => new AppError(403, "FORBIDDEN", `${무엇} 권한이 없습니다`),

  주소없음: () => new AppError(404, "ROUTE_NOT_FOUND", "그런 주소가 없습니다"),
};


// ───── 응답 도우미 ─────

function 보내기(res, data, meta) {
  const 몸통 = { data };
  if (meta) 몸통.meta = meta;
  res.json(몸통);
}


// ───── 미들웨어 ─────

function 인증(req, res, next) {
  const 헤더값 = req.get("Authorization");
  if (!헤더값) return next(에러.로그인필요());

  const [방식, 키] = 헤더값.split(" ");
  if (방식 !== "Bearer" || !키) return next(에러.로그인필요());

  const 사용자 = 키별사용자[키];
  if (!사용자) return next(에러.로그인필요());

  req.user = 사용자;
  next();
}

function 역할확인(...허용역할들) {
  return (req, res, next) => {
    if (!req.user) return next(에러.로그인필요());
    if (!허용역할들.includes(req.user.role)) return next(에러.권한없음("이 작업을 할"));
    next();
  };
}

// :id 를 숫자로. 문서에 "숫자여야 합니다" 라고 적었으니 400 입니다.
app.param("id", (req, res, next, 값) => {
  const 번호 = Number(값);

  if (!Number.isInteger(번호)) {
    return next(에러.검증실패([{ 키: "id", 이유: "숫자여야 합니다" }]));
  }

  req.번호 = 번호;
  next();
});

function 설비찾기(req, res, next) {
  const 설비 = 설비들.find((설비) => 설비.id === req.번호);
  if (!설비) return next(에러.없음("설비"));

  req.설비 = 설비;
  next();
}


// ───── GET /api/v1/equipments ─────

app.get("/api/v1/equipments", (req, res) => {
  const q = (req.query.q ?? "").trim().toLowerCase();
  const { line, status, sort, fields } = req.query;

  let 결과 = 설비들;

  // ① 검색
  if (q) {
    결과 = 결과.filter((설비) =>
      ["name", "line", "status"].some((키) =>
        String(설비[키]).toLowerCase().includes(q)
      )
    );
  }

  // ② 필터
  if (line) {
    const 라인들 = line.split(",").map((조각) => 조각.trim());
    결과 = 결과.filter((설비) => 라인들.includes(설비.line));
  }
  if (status) {
    결과 = 결과.filter((설비) => 설비.status === status);
  }

  // ③ 정렬
  const 조건들 = 정렬조건(sort);
  if (조건들.length > 0) {
    결과 = [...결과].sort((a, b) => 비교하기(a, b, 조건들));
  }

  // ④ 개수는 자르기 전에
  const total = 결과.length;

  // ⑤ 자르기
  const { page, limit } = 쪽정보(req.query);
  const 시작 = (page - 1) * limit;
  const data = 결과.slice(시작, 시작 + limit).map((설비) => 필드고르기(설비, fields));

  보내기(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

// 확인: GET /api/v1/equipments?limit=2&fields=id
// 응답: 200 {"data":[{"id":1},{"id":2}],"meta":{"page":1,"limit":2,"total":12,"totalPages":6}}

// 확인: GET /api/v1/equipments?line=A&limit=2&sort=-id&fields=id,name
// 응답: 200 {"data":[{"id":11,"name":"적재로봇 1호"},{"id":7,"name":"검사기 1호"}],"meta":{"page":1,"limit":2,"total":4,"totalPages":2}}

// ★ README 의 예시 응답과 한 글자도 다르지 않아야 합니다.

// 확인: GET /api/v1/equipments?q=로봇&fields=id
// 응답: 200 {"data":[{"id":5},{"id":6},{"id":11},{"id":12}],"meta":{"page":1,"limit":10,"total":4,"totalPages":1}}

// 확인: GET /api/v1/equipments?line=A,B&status=정지&fields=id
// 응답: 200 {"data":[{"id":2},{"id":8}],"meta":{"page":1,"limit":10,"total":2,"totalPages":1}}

// 확인: GET /api/v1/equipments?line=Z&fields=id
// 응답: 200 {"data":[],"meta":{"page":1,"limit":10,"total":0,"totalPages":0}}

// 확인: GET /api/v1/equipments?page=99&limit=5&fields=id
// 응답: 200 {"data":[],"meta":{"page":99,"limit":5,"total":12,"totalPages":3}}

// ★ 조건에 맞는 게 없어도, 쪽 번호를 넘겨도 200 입니다. 404 가 아닙니다.


// ───── GET /api/v1/equipments/:id ─────

app.get("/api/v1/equipments/:id", 설비찾기, (req, res) => {
  보내기(res, req.설비);
});

// 확인: GET /api/v1/equipments/3
// 응답: 200 {"data":{"id":3,"name":"프레스 1호","line":"B","status":"가동","설치일":"2019-07-02"}}

// 확인: GET /api/v1/equipments/abc
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"id","이유":"숫자여야 합니다"}]}}

// 확인: GET /api/v1/equipments/99
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★ "설비를" 입니다. "설비을(를)" 이 아닙니다.
//   연습문제 1의 조사붙이기 가 여기서 쓰입니다.


// ───── GET /api/v1/equipments/:id/logs ─────

app.get("/api/v1/equipments/:id/logs", 설비찾기, (req, res) => {
  const 결과 = 점검기록들.filter((기록) => 기록.equipmentId === req.번호);
  const { page, limit } = 쪽정보(req.query);
  const 시작 = (page - 1) * limit;

  보내기(res, 결과.slice(시작, 시작 + limit), {
    page,
    limit,
    total: 결과.length,
    totalPages: Math.ceil(결과.length / limit),
  });
});

// 확인: GET /api/v1/equipments/1/logs
// 응답: 200 {"data":[{"id":1,"equipmentId":1,"result":"정상","점검일":"2026-08-01","담당자":"김민준"},{"id":2,"equipmentId":1,"result":"이상","점검일":"2026-08-08","담당자":"이서연"},{"id":5,"equipmentId":1,"result":"정상","점검일":"2026-08-12","담당자":"김민준"}],"meta":{"page":1,"limit":10,"total":3,"totalPages":1}}

// 확인: GET /api/v1/equipments/7/logs
// 응답: 200 {"data":[],"meta":{"page":1,"limit":10,"total":0,"totalPages":0}}

// 확인: GET /api/v1/equipments/99/logs
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★★ 두 번째와 세 번째를 꼭 비교하세요.
//   7번 설비는 있는데 기록이 0건 → 200 과 빈 배열
//   99번 설비는 아예 없음        → 404
//
//   설비찾기 미들웨어를 안 붙이면 둘 다 200 과 빈 배열이 됩니다.
//   "없는 설비의 기록을 달라" 는 요청에 "0건입니다" 라고 답하는 셈입니다.
//   중첩 주소에서는 위쪽 자원이 있는지를 반드시 확인해야 합니다.


// ───── POST /api/v1/equipments ─────

app.post("/api/v1/equipments", 인증, 역할확인("admin"), (req, res, next) => {
  const { name, line } = req.body || {};
  const 항목 = [];

  if (name === undefined || name === "") 항목.push({ 키: "name", 이유: "필수입니다" });
  else if (typeof name !== "string") 항목.push({ 키: "name", 이유: "글자여야 합니다" });
  else if (name.length < 2) 항목.push({ 키: "name", 이유: "2글자 이상이어야 합니다" });
  else if (name.length > 20) 항목.push({ 키: "name", 이유: "20글자 이하여야 합니다" });

  if (line === undefined || line === "") 항목.push({ 키: "line", 이유: "필수입니다" });
  else if (!라인값들.includes(line))
    항목.push({ 키: "line", 이유: "A, B, C 중 하나여야 합니다" });

  if (항목.length > 0) return next(에러.검증실패(항목));

  // ★ status 는 본문에서 안 받습니다. 서버가 정합니다.
  const 새설비 = { id: 다음번호, name, line, status: "정지" };

  다음번호 += 1;
  설비들.push(새설비);

  res.status(201).location(`/api/v1/equipments/${새설비.id}`).json({ data: 새설비 });
});

// 확인: POST /api/v1/equipments {"name":"용접로봇 3호","line":"C"}
// 응답: 401 {"error":{"code":"UNAUTHENTICATED","message":"로그인이 필요합니다"}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-user-1] {"name":"용접로봇 3호","line":"C"}
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"이 작업을 할 권한이 없습니다"}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {"name":"용","line":"Z"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"name","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"A, B, C 중 하나여야 합니다"}]}}

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {"name":"용접로봇 3호","line":"C","status":"가동"}
// 응답: 201 {"data":{"id":13,"name":"용접로봇 3호","line":"C","status":"정지"}}

// ★ 마지막을 보세요. status: "가동" 을 보냈는데 "정지" 로 만들어졌습니다.
//   문서에 "받지 않습니다" 라고 적었고, 코드도 그렇게 되어 있습니다.
//   보낸 값을 그대로 믿으면 규칙이 무너집니다.


// ───── PATCH /api/v1/equipments/:id ─────

app.patch("/api/v1/equipments/:id", 인증, 설비찾기, (req, res, next) => {
  const { status } = req.body || {};

  if (!상태값들.includes(status)) {
    return next(
      에러.검증실패([{ 키: "status", 이유: `${상태값들.join(", ")} 중 하나여야 합니다` }])
    );
  }

  req.설비.status = status;

  보내기(res, req.설비);
});

// 확인: PATCH /api/v1/equipments/13 [Authorization: Bearer key-user-1] {"status":"이상"}
// 응답: 400 {"error":{"code":"VALIDATION_FAILED","message":"입력값이 올바르지 않습니다","details":[{"키":"status","이유":"가동, 정지, 점검중 중 하나여야 합니다"}]}}

// 확인: PATCH /api/v1/equipments/13 [Authorization: Bearer key-user-1] {"status":"점검중"}
// 응답: 200 {"data":{"id":13,"name":"용접로봇 3호","line":"C","status":"점검중"}}

// 확인: PATCH /api/v1/equipments/99 [Authorization: Bearer key-user-1] {"status":"가동"}
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}


// ───── DELETE /api/v1/equipments/:id ─────

app.delete("/api/v1/equipments/:id", 인증, 역할확인("admin"), 설비찾기, (req, res) => {
  설비들 = 설비들.filter((하나) => 하나.id !== req.번호);
  res.sendStatus(204);
});

// 확인: DELETE /api/v1/equipments/13 [Authorization: Bearer key-user-1]
// 응답: 403 {"error":{"code":"FORBIDDEN","message":"이 작업을 할 권한이 없습니다"}}

// 확인: DELETE /api/v1/equipments/13 [Authorization: Bearer key-admin-1]
// 응답: 204

// 확인: DELETE /api/v1/equipments/13 [Authorization: Bearer key-admin-1]
// 응답: 404 {"error":{"code":"NOT_FOUND","message":"설비를 찾을 수 없습니다"}}

// ★ 미들웨어 순서: 인증 → 역할확인 → 설비찾기
//   자격이 없는 사람에게는 있는지 없는지도 알려 주지 않습니다.
//   README 에도 그렇게 적어 두었습니다.


// ───── 404 와 에러 처리기 ─────

app.use((req, res, next) => {
  next(에러.주소없음());
});

// 확인: GET /api/v1/없는주소
// 응답: 404 {"error":{"code":"ROUTE_NOT_FOUND","message":"그런 주소가 없습니다"}}

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.name}: ${err.message}`);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "JSON 형식이 아닙니다" },
    });
  }

  if (err instanceof AppError) {
    const 몸통 = { code: err.code, message: err.message };
    if (err.details !== undefined) 몸통.details = err.details;
    return res.status(err.status).json({ error: 몸통 });
  }

  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" },
  });
});

// 확인: POST /api/v1/equipments [Authorization: Bearer key-admin-1] {깨진:JSON}
// 응답: 400 {"error":{"code":"INVALID_JSON","message":"JSON 형식이 아닙니다"}}


app.listen(PORT, () => {
  console.log(`설비 관리 API 가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
});


// ── 지운 뒤 목록을 다시 보면 ──
//
// 확인: GET /api/v1/equipments?fields=id&limit=100
// 응답: 200 {"data":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":12}],"meta":{"page":1,"limit":100,"total":12,"totalPages":1}}


// ============================================================
// 문서와 코드가 어긋나지 않게 하려면
// ============================================================
//
// 이 파일을 만들면서 README.md 를 계속 옆에 두고 봤습니다.
// 그런데도 어긋나기 쉽습니다. 특히 이런 것들입니다.
//
//   · 문서에는 최대 100 이라 적고 코드에는 상한을 안 둠
//   · 문서에는 404 라 적고 코드는 빈 배열을 돌려줌
//   · 문서에는 status 를 안 받는다고 적고 코드는 받음
//   · 에러 코드 이름이 문서와 코드에서 다름
//
// 확인하는 방법
//   ① 문서의 예시 요청을 그대로 Postman 으로 보내 봅니다
//   ② 응답이 문서의 예시와 한 글자도 다르지 않은지 봅니다
//   ③ 다르면 둘 중 하나가 틀린 것입니다. 어느 쪽이 맞는지 정하고 고칩니다
//
// 이 파일의 // 확인: 주석들이 바로 그 대조표입니다.
// README 의 예시와 같은 값이 적혀 있습니다.


// ============================================================
// Postman 시나리오
// ============================================================
//
//   1  GET    /api/v1/equipments?limit=3                       3건 + meta
//   2  GET    /api/v1/equipments?line=A&sort=-id&fields=id,name 11, 7, 2, 1
//   3  GET    /api/v1/equipments?q=로봇                          4건
//   4  GET    /api/v1/equipments?line=Z                          200 과 []
//   5  GET    /api/v1/equipments/3                               프레스 1호
//   6  GET    /api/v1/equipments/abc                             400
//   7  GET    /api/v1/equipments/99                              404 "설비를"
//   8  GET    /api/v1/equipments/1/logs                          3건
//   9  GET    /api/v1/equipments/7/logs                          200 과 []
//  10  GET    /api/v1/equipments/99/logs                         404  ← 9와 비교
//  11  POST   /api/v1/equipments  (증표 없이)                     401
//  12  POST   /api/v1/equipments  user                           403
//  13  POST   /api/v1/equipments  admin { "name":"용","line":"Z" } 400 details 두 개
//  14  POST   /api/v1/equipments  admin 정상                      201, id 13, status 정지
//  15  PATCH  /api/v1/equipments/13 user { "status":"점검중" }     200
//  16  DELETE /api/v1/equipments/13 user                          403
//  17  DELETE /api/v1/equipments/13 admin                         204
//  18  DELETE /api/v1/equipments/13 admin                         404
//
// 9번과 10번의 차이가 이 단원에서 가장 중요한 부분입니다.
