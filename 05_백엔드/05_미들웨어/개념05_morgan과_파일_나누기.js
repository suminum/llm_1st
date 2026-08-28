// ============================================================
// 05단원 · 개념 05 — morgan 과 미들웨어 파일 나누기
// ------------------------------------------------------------
// 실행: node 개념05_morgan과_파일_나누기.js
//       끄려면 Ctrl + C
//
// ★ 이 파일도 터미널을 함께 보세요.
// ============================================================
//
// 이 파일은 혼자가 아닙니다. 옆 폴더들을 함께 보세요.
//
//   05_미들웨어/
//     개념05_morgan과_파일_나누기.js   ← 지금 이 파일
//     middlewares/
//       기록.js       요청 번호 + 기록
//       인증.js       누구인지 확인 + 권한
//       검증.js       값의 모양 확인
//     utils/
//       HttpError.js  상태코드가 붙은 에러
//
// 지금까지 만든 미들웨어를 전부 파일로 옮겼습니다.
// 이 파일에는 '무엇을 어디에 붙일지' 만 남습니다.

const express = require("express");
const morgan = require("morgan");

const { 번호붙이기, 요청기록 } = require("./middlewares/기록");
const { 인증, 역할확인 } = require("./middlewares/인증");
const { 필수값, 검증 } = require("./middlewares/검증");
const { HttpError } = require("./utils/HttpError");

const app = express();
const PORT = process.env.PORT || 3000;


// ── 섹션 1: morgan — 남이 만든 기록 미들웨어 ──

// 개념02 에서 기록 미들웨어를 직접 만들었습니다.
// 같은 일을 하는 도구가 이미 있습니다. morgan 입니다.
//
//   npm install morgan
//
// 왜 직접 만들어 보고 나서 도구를 배우나
//   morgan 이 무슨 일을 하는지 이미 알기 때문에, 안 될 때 어디를 볼지 압니다.
//   도구부터 배우면 "마법처럼 되는 것" 이 되어 버립니다.

// morgan 은 형식 이름을 받습니다.
//
//   morgan("dev")       개발용. 짧고 색이 붙습니다
//   morgan("tiny")      제일 짧습니다
//   morgan("combined")  운영용. 접속 IP, 브라우저 정보까지 전부
//
// 형식을 직접 적을 수도 있습니다. : 로 시작하는 것이 자리표시자입니다.

// 내가 만든 자리표시자도 추가할 수 있습니다.
morgan.token("user", (req) => (req.user ? req.user.name : "-"));
morgan.token("reqid", (req) => (req.요청번호 ? `#${req.요청번호}` : "-"));

// ★ 자리표시자 이름은 영어로 쓰세요. 값에는 한글이 들어가도 됩니다.
//   터미널에 찍는 것이라 헤더와 달리 한글이 괜찮습니다.

app.use(번호붙이기); // morgan 보다 먼저 실행되어야 :reqid 를 채울 수 있습니다
app.use(morgan(":reqid :method :url :status :response-time ms - :user"));

app.use(express.json());

// ★ 우리가 만든 요청기록 대신 morgan 을 쓰고 있습니다.
//   둘 다 켜면 같은 내용이 두 번 나옵니다.
//   요청기록 이 어떻게 생겼는지 보고 싶으면 아래 줄의 주석을 지우세요.
// app.use(요청기록);


// ── 섹션 2: 공개 주소 ──

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 확인: GET /health
// 응답: 200 {"status":"ok"}

// 터미널에 이렇게 나옵니다.
//   #1 GET /health 200 2.431 ms - -
//   맨 끝의 - 는 로그인을 안 했다는 뜻입니다. (:user 자리)


// ── 섹션 3: 로그인이 필요한 주소 ──

app.get("/me", 인증, (req, res) => {
  res.json({ 이름: req.user.name, 역할: req.user.role });
});

// 확인: GET /me
// 응답: 401 {"error":"로그인이 필요합니다"}

// 확인: GET /me [Authorization: Bearer key-user-1]
// 응답: 200 {"이름":"김민준","역할":"user"}

// 두 번째 요청은 터미널에 이렇게 나옵니다.
//   #3 GET /me 200 1.204 ms - 김민준
//
// ★ 누가 무엇을 했는지가 기록에 남습니다.
//   인증 미들웨어가 req.user 를 붙여 뒀기 때문입니다.
//   morgan 은 응답이 끝난 뒤에 찍기 때문에, 그때는 req.user 가 이미 있습니다.


// ── 섹션 4: 역할까지 확인하는 주소 ──

app.delete("/users/:id", 인증, 역할확인("admin"), (req, res) => {
  res.json({ 지운사람: req.params.id, 지시한사람: req.user.name });
});

// 확인: DELETE /users/7 [Authorization: Bearer key-user-1]
// 응답: 403 {"error":"admin 만 할 수 있습니다"}

// 확인: DELETE /users/7 [Authorization: Bearer key-admin-1]
// 응답: 200 {"지운사람":"7","지시한사람":"이서연"}

// 개념03 의 관리자만 이 역할확인("admin") 이 되었습니다.
// 나중에 manager 도 허용하려면 역할확인("admin", "manager") 로 끝납니다.

app.get("/reports", 인증, 역할확인("admin", "user"), (req, res) => {
  res.json({ 보고서: "둘 다 볼 수 있습니다", 보는사람: req.user.name });
});

// 확인: GET /reports [Authorization: Bearer key-user-1]
// 응답: 200 {"보고서":"둘 다 볼 수 있습니다","보는사람":"김민준"}


// ── 섹션 5: 검증까지 얹기 ──

const 설비규칙 = [
  { 키: "name", 필수: true, 타입: "string", 최소길이: 2, 최대길이: 20 },
  { 키: "line", 필수: true, 허용: ["A", "B", "C"] },
];

app.post("/equipments", 인증, 역할확인("admin"), 검증(설비규칙), (req, res) => {
  res.status(201).json({ 등록됨: req.body.name, 등록자: req.user.name });
});

// 확인: POST /equipments {"name":"용접로봇","line":"A"}
// 응답: 401 {"error":"로그인이 필요합니다"}

// 확인: POST /equipments [Authorization: Bearer key-user-1] {"name":"용접로봇","line":"A"}
// 응답: 403 {"error":"admin 만 할 수 있습니다"}

// 확인: POST /equipments [Authorization: Bearer key-admin-1] {"name":"용","line":"Z"}
// 응답: 400 {"error":"입력값이 올바르지 않습니다","항목":[{"키":"name","이유":"2글자 이상이어야 합니다"},{"키":"line","이유":"A, B, C 중 하나여야 합니다"}]}

// 확인: POST /equipments [Authorization: Bearer key-admin-1] {"name":"용접로봇","line":"A"}
// 응답: 201 {"등록됨":"용접로봇","등록자":"이서연"}

// ★★ 이 한 줄을 다시 보세요.
//
//   app.post("/equipments", 인증, 역할확인("admin"), 검증(설비규칙), (req, res) => {...})
//                            ───  ───────────────  ─────────────  ─────────────────
//                            누구니  자격 있니        모양 맞니      진짜 하는 일
//
//   라우트 함수 안에는 '진짜 하는 일' 만 두 줄 남았습니다.
//   검사 코드는 한 줄도 없습니다. 전부 앞에서 끝냈습니다.
//
//   이게 미들웨어를 배우는 이유입니다.
//   실무 서버의 라우트는 대부분 이 모양입니다.
//
// ★ 순서가 중요합니다
//   인증 → 역할확인 → 검증 순입니다.
//   검증을 먼저 하면, 로그인도 안 한 사람에게 "name 이 짧습니다" 라고 알려 주게 됩니다.
//   들어올 자격부터 보고, 내용은 나중에 봅니다.


// ── 섹션 6: 404 와 에러 처리기 ──

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

// ★ 에러 기록에도 요청 번호를 넣었습니다.
//   morgan 의 기록과 짝을 맞춰 볼 수 있습니다.
//   "#5 요청이 500 이 났고, 그 이유가 이것" 을 한눈에 알 수 있습니다.


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/health`);
});


// ============================================================
// 폴더 구조 정리
// ============================================================
//
//   프로젝트/
//     server.js           라우트 연결 + listen
//     middlewares/        거쳐 가는 것들
//       기록.js
//       인증.js
//       검증.js
//     utils/              여기저기서 쓰는 작은 도구
//       HttpError.js
//     routes/             주소별 라우트 (04단원 개념05)
//
// 나누는 기준
//   여러 라우트가 함께 쓰는가         → middlewares
//   여러 파일이 함께 쓰는 작은 함수인가 → utils
//   특정 자원만 다루는가              → routes
//
// ★ 실무에서 파일 이름은 보통 영어로 씁니다
//   middlewares/auth.js, middlewares/validate.js 처럼요.
//   이 자료는 처음 배우는 사람이 읽기 쉽도록 한글로 썼습니다.
//   회사에 가면 영어 이름을 쓰게 될 텐데, 구조는 똑같습니다.
//   파일 '이름' 은 한글이어도 됩니다. 안 되는 건 라우트 주소와 헤더입니다.


// ============================================================
// morgan 형식 정리
// ============================================================
//
//   :method          GET
//   :url             /equipments?line=A
//   :status          201
//   :response-time   1.234   (ms 는 직접 붙여야 합니다)
//   :res[content-length]  응답 크기
//   :remote-addr     보낸 쪽 IP
//   :user-agent      브라우저 정보
//
// 미리 만들어진 묶음
//   morgan("dev")       :method :url :status :response-time ms - :res[content-length]
//   morgan("combined")  운영용 표준 형식. 접속 기록 분석 도구들이 이걸 읽습니다
//
// ★ 운영에서는 파일로 남깁니다
//   터미널에만 찍으면 서버를 껐다 켤 때 사라집니다.
//   morgan 에 stream 옵션을 주면 파일에 쌓입니다. PART 4 에서 합니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — morgan 형식을 "dev" 로 바꿔 보세요.
//                    app.use(morgan("dev"))
//                    무엇이 달라지나요? 색이 붙나요?
//
// ✏️ 직접 해보기 2 — app.use(번호붙이기) 를 morgan 아래로 옮겨 보세요.
//                    :reqid 자리가 어떻게 되나요? 왜 그럴까요?
//                    (확인했으면 되돌리세요)
//
// ✏️ 직접 해보기 3 — 응답 크기를 함께 남기도록 형식을 고쳐 보세요.
//                    (힌트: :res[content-length])
//
// ✏️ 직접 해보기 4 — middlewares/기록.js 의 요청기록 을 켜 보세요.
//                    morgan 과 무엇이 다른가요? 어느 쪽이 읽기 좋나요?
//
// ✏️ 직접 해보기 5 — middlewares/검증.js 를 서버 없이 시험해 보세요.
//                    새 파일을 만들고
//                      const { 한줄검사 } = require("./middlewares/검증");
//                      console.log(한줄검사({ 필수: true }, undefined));
//                    미들웨어를 파일로 빼면 이렇게 따로 시험할 수 있습니다.
//
// ✏️ 직접 해보기 6 — middlewares/인증.js 에 manager 역할 사용자를 추가하고,
//                    /reports 를 역할확인("admin", "manager") 로 바꿔 보세요.
//                    user 키로는 403 이 나와야 합니다.


// ── 자주 하는 실수 ──

// [실수 1] morgan 을 번호붙이기보다 위에 둠
//   :reqid 가 - 로만 나옵니다. 아직 req.요청번호 가 없기 때문입니다.

// [실수 2] morgan 에 괄호를 안 붙임
//   app.use(morgan)  ← 미들웨어를 만드는 함수를 그대로 넘긴 것입니다.
//   app.use(morgan("dev")) 처럼 불러서 넘기세요.

// [실수 3] require 경로에서 ../ 를 빠뜨림
//   middlewares/인증.js 에서 utils 를 부르려면 ../utils/HttpError 입니다.
//   한 칸 위로 올라갔다가 내려가야 합니다.

// [실수 4] 미들웨어 순서를 인증보다 검증 먼저로 둠
//   로그인도 안 한 사람에게 "name 이 짧습니다" 를 알려 주게 됩니다.
//   자격을 먼저, 내용을 나중에.

// [실수 5] module.exports 를 = router 처럼 통째로 덮어씀
//   { 인증, 역할확인 } 처럼 여러 개를 내보낼 때는 객체로 묶으세요.
//   하나만 내보내면 받는 쪽에서 구조 분해가 안 됩니다.

// [실수 6] 기록에 비밀번호나 증표를 남김
//   morgan("combined") 는 referrer 와 user-agent 헤더만 남기고 Authorization 은 남기지 않지만,
//   직접 만든 기록에서 req.headers 를 통째로 찍으면 증표가 그대로 남습니다.


// ── 정리 ──

// 1. morgan 은 남이 만든 기록 미들웨어다. 직접 만든 기록기를 걷어내고 이걸 쓴다.
// 2. morgan 은 요청 번호를 붙이는 미들웨어보다 아래에 둔다.
//    위에 두면 번호가 아직 없는 채로 기록된다.
// 3. morgan 도 괄호를 붙여서 넘긴다 — app.use(morgan("dev")).
// 4. 미들웨어 순서는 기록 → 인증 → 권한 → 검증 → 라우트다.
//    검증을 인증보다 먼저 두면 누구인지 모른 채 값부터 따지게 된다.
// 5. 파일을 나눌 때 require 경로의 ../ 를 빠뜨리지 않는다.
// 6. 여러 개를 내보낼 때는 { 인증, 역할확인 } 처럼 객체로 묶는다.
//    하나만 내보내면 받는 쪽에서 구조 분해가 안 된다.
// 7. 404 처리기와 에러 처리기는 나눈 뒤에도 여전히 맨 아래다.
// 8. 기록에 비밀번호나 증표를 남기지 않는다.
