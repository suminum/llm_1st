// ============================================================
// 08단원 · 개념 04 — cors 패키지 쓰기
// ------------------------------------------------------------
// 실행: node 개념04_cors_패키지.js
//       끄려면 Ctrl + C
// ============================================================
//
// 개념03 에서 직접 붙였습니다. 40줄쯤 됐습니다.
// 같은 일을 해 주는 패키지가 있습니다.
//
//   npm install cors
//
// ★ 직접 만들어 본 뒤에 패키지를 쓰는 이유
//   이제 이 패키지가 무슨 헤더를 붙이는지 압니다.
//   안 될 때 Network 탭에서 무엇을 봐야 할지도 압니다.
//   처음부터 패키지만 썼다면 "왜 안 되지?" 에서 막혔을 것입니다.

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── 섹션 1: 아무 옵션 없이 ──

// cors() 하나면 개념03 섹션 1의 * 방식이 됩니다.
// 여기서는 공개 자료에만 붙여 봅니다.

app.get("/public-api/notice", cors(), (req, res) => {
  res.json({ data: { 제목: "8월 정기 점검 안내" } });
});

// 확인: GET /public-api/notice [Origin: http://example.com]
// 응답: 200 {"data":{"제목":"8월 정기 점검 안내"}}
// 헤더: access-control-allow-origin=*

// ★ 라우트마다 붙일 수도 있고, app.use(cors()) 로 전부에 붙일 수도 있습니다.
//   미들웨어니까요. (05단원)
//
// ★★ app.use(cors()) 한 줄로 끝내지 마세요.
//   많은 블로그가 이렇게만 알려 줍니다. 개발 중에는 편합니다.
//   그런데 그 순간 우리 API 를 아무 사이트나 쓸 수 있게 됩니다.
//   섹션 2 처럼 목록을 정하세요.

// ── 섹션 2: 허용 목록 정하기 ──

const 허용출처들 = [
  "http://localhost:5500",
  "http://localhost:5173",
  "https://설비관리.example.com",
];

const cors설정 = {
  // origin 에 배열을 주면 그 안에 있을 때만 허락합니다.
  origin: 허용출처들,

  // 프리플라이트 응답에 들어갈 값들
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],

  // 브라우저가 읽게 해 줄 응답 헤더
  exposedHeaders: ["X-Total-Count", "X-Request-Id"],

  // 프리플라이트를 몇 초 기억할지
  maxAge: 600,
};

app.use("/api", cors(cors설정)); // aoi로 들어온 요청에 대해 조건이 cors안에 있음  안에 조건이 없으면 다 허용

app.get("/api/v1/equipments", (req, res) => {
  //요청준 주소가 아니라 응답처리해야하는 경로
  res.set("X-Total-Count", "2");
  res.json({
    data: [
      { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
      { id: 2, name: "프레스 1호", line: "B", status: "정지" },
    ],
  });
});

// 확인: GET /api/v1/equipments [Origin: http://localhost:5500]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-expose-headers=X-Total-Count,X-Request-Id | vary=Origin

// ★ Vary: Origin 을 자동으로 붙여 줍니다.
//   개념03 에서 직접 써야 했던 것입니다. 이런 걸 빠뜨리지 않는 게 패키지의 장점입니다.

// 확인: GET /api/v1/equipments [Origin: http://evil.example.com]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=(없음)

// ★ 개념03 과 똑같습니다. 서버는 안 막습니다. 헤더만 안 붙입니다.
//   막는 것은 브라우저입니다.

// front/다른출처.html 의 ⑤ 버튼이 부르는 주소입니다.
// 08단원의 모든 서버를 같은 페이지로 확인하려고 이름을 맞춰 두었습니다.
app.get("/api/v1/equipments-with-count", (req, res) => {
  res.set("X-Total-Count", "2");
  res.json({ data: [{ id: 1 }, { id: 2 }] });
});

// 확인: GET /api/v1/equipments-with-count [Origin: http://localhost:5500]
// 응답: 200 {"data":[{"id":1},{"id":2}]}
// 헤더: access-control-allow-origin=http://localhost:5500 | x-total-count=2 | access-control-expose-headers=X-Total-Count,X-Request-Id

// ── 섹션 3: 프리플라이트도 알아서 ──

app.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};
  res.status(201).json({ data: { id: 3, name, line, status: "정지" } });
});

app.delete("/api/v1/equipments/:id", (req, res) => {
  console.log(`   ★ DELETE 가 서버까지 도착했습니다. id=${req.params.id}`);
  res.sendStatus(204);
});

// 확인: DELETE /api/v1/equipments/1 [Origin: http://localhost:5500]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500

// ★ 터미널의 ★ 표시를 보세요.
//   프리플라이트가 막히면 이 줄이 안 찍힙니다. 진짜 요청이 아예 안 오니까요.
//   methods 에서 DELETE 를 빼고 다시 해 보면 확인할 수 있습니다. (✏️5)

// 확인: OPTIONS /api/v1/equipments [Origin: http://localhost:5500; Access-Control-Request-Method: POST; Access-Control-Request-Headers: content-type]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-allow-methods=GET,POST,PATCH,DELETE | access-control-allow-headers=Content-Type,Authorization | access-control-max-age=600

// 확인: POST /api/v1/equipments [Origin: http://localhost:5500] {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}
// 헤더: access-control-allow-origin=http://localhost:5500

// ★ OPTIONS 라우트를 하나도 안 만들었는데 204 가 나왔습니다.
//   cors 미들웨어가 "이건 프리플라이트구나" 하고 알아서 답하고 끝냅니다.
//   개념03 에서 직접 쓴 열 줄이 사라졌습니다.

// 확인: OPTIONS /api/v1/equipments [Origin: http://evil.example.com; Access-Control-Request-Method: POST]
// 응답: 204
// 헤더: access-control-allow-origin=(없음)

// ── 섹션 4: 조건을 함수로 정하기 ──

// 배열로 안 되는 경우가 있습니다.
//   · 우리 회사 도메인의 하위 주소는 전부 허용
//   · 개발 중에는 localhost 아무 포트나 허용
//
// 이럴 때는 함수를 줍니다.

function 출처판단(출처, 알려주기) {
  // ★ 출처가 undefined 인 경우
  //   Postman·curl·같은 출처 요청은 Origin 헤더가 없습니다.
  //   이때 거절하면 Postman 으로 시험할 수가 없습니다. 보통 허용합니다.
  if (!출처) {
    return 알려주기(null, true);
  }

  const 허용 =
    허용출처들.includes(출처) ||
    출처.endsWith(".example.com") ||
    /^http:\/\/localhost:\d+$/.test(출처);

  // ★ 첫 번째 인자는 '에러', 두 번째는 '허용할지' 입니다.
  //   거절할 때 에러를 던지면 500 이 됩니다. 그냥 false 를 주세요.
  알려주기(null, 허용);
}

app.use("/open-api", cors({ origin: 출처판단 }));

app.get("/open-api/stats", (req, res) => {
  res.json({ data: { 가동중: 8, 정지: 3, 점검중: 1 } });
});

// 확인: GET /open-api/stats [Origin: http://localhost:9999]
// 응답: 200 {"data":{"가동중":8,"정지":3,"점검중":1}}
// 헤더: access-control-allow-origin=http://localhost:9999

// 확인: GET /open-api/stats [Origin: https://sub.example.com]
// 응답: 200 {"data":{"가동중":8,"정지":3,"점검중":1}}
// 헤더: access-control-allow-origin=https://sub.example.com

// 확인: GET /open-api/stats [Origin: http://evil.example.net]
// 응답: 200 {"data":{"가동중":8,"정지":3,"점검중":1}}
// 헤더: access-control-allow-origin=(없음)

// 확인: GET /open-api/stats
// 응답: 200 {"data":{"가동중":8,"정지":3,"점검중":1}}
// 헤더: access-control-allow-origin=(없음)

// 확인: OPTIONS /open-api/stats [Origin: http://evil.example.net; Access-Control-Request-Method: POST]
// 응답: 404

// 확인: OPTIONS /api/v1/equipments [Origin: http://evil.example.net; Access-Control-Request-Method: POST]
// 응답: 204

// ★★ 위 두 줄을 비교해 보세요. 같은 '거절' 인데 상태코드가 다릅니다.
//
//   /open-api 는 origin 을 '함수' 로 줬고, /api 는 '배열' 로 줬습니다.
//   직접 재 본 결과입니다.
//
//     origin 설정    허용 출처               거절 출처
//     ──────────────────────────────────────────────────
//     배열           204 + Allow-Origin      204, 헤더 없음
//     함수(false)    204 + Allow-Origin      404, 헤더 없음
//
//   함수가 false 를 돌려주면 cors 는 응답을 안 만들고 next() 를 부릅니다.
//   그래서 요청이 아래로 흘러가 404 처리기까지 내려갑니다.
//
//   브라우저 입장에서는 둘 다 똑같이 막힙니다.
//   Allow-Origin 이 없으면 상태코드가 무엇이든 거절이니까요.
//
//   다만 서버 기록에서 헷갈릴 수 있습니다.
//   "OPTIONS 가 404 로 잔뜩 찍히는데 공격인가요?" 라는 질문의 답이 이것입니다.
//   허락 안 한 출처가 두드리고 있는 것뿐입니다.

// ★★ 세 번째를 보세요. evil.example.net 은 막혔습니다.
//   endsWith(".example.com") 이라 .example.net 은 안 걸립니다.
//
//   그런데 이런 걸 조심해야 합니다.
//     출처.includes("example.com")  ← ✗ 위험합니다
//   "http://example.com.evil.net" 도 통과합니다. 공격자가 이런 도메인을 삽니다.
//
//   endsWith 를 쓰되 앞에 점을 붙이세요. ".example.com"
//   더 확실하게 하려면 정규식으로 전체를 맞추세요.
//     /^https:\/\/([a-z0-9-]+\.)?example\.com$/

// ── 섹션 5: 개발과 운영을 나누기 ──

app.get("/env-strategy", (req, res) => {
  res.json({
    개발: "localhost 아무 포트나 허용. 팀원마다 포트가 다르니까요.",
    운영: "실제 프론트 주소만. 목록을 코드에 박지 말고 환경변수로 받으세요.",
    예시: 'const 허용 = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:5173"];',
    이유: "주소가 바뀔 때 코드를 고치고 다시 배포할 필요가 없습니다. (PART 4)",
    주의: "운영에서 * 를 쓰지 마세요. 아무 사이트나 우리 API 를 자기 화면에 붙일 수 있습니다.",
  });
});

// 확인: GET /env-strategy
// 응답: 200

// ★ 환경변수는 PART 4 에서 자세히 배웁니다.
//   지금은 "코드에 주소를 박지 않는다" 만 기억하세요.

// ── 섹션 6: 직접 만든 것과 비교 ──

app.get("/compare", (req, res) => {
  res.json({
    직접만들기: {
      줄수: "약 40줄",
      장점: "무슨 일이 일어나는지 전부 보입니다",
      빠뜨리기쉬운것: [
        "Vary: Origin",
        "OPTIONS 를 라우트보다 위에 두기",
        "프리플라이트와 진짜 요청 둘 다에 헤더 붙이기",
        "Origin 이 없을 때의 처리",
      ],
    },
    cors패키지: {
      줄수: "약 8줄 (설정 포함)",
      장점: "빠뜨릴 게 없습니다. 위 네 가지를 전부 알아서 합니다",
      단점: "안에서 무슨 일이 일어나는지 안 보입니다",
    },
    결론: "직접 한 번 만들어 보고, 실무에서는 패키지를 쓰세요.",
  });
});

// 확인: GET /compare
// 응답: 200

app.use((req, res) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res
    .status(500)
    .json({
      error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" },
    });
});

app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
  console.log(`허용 출처: ${허용출처들.join(", ")}`);
});

// ============================================================
// cors 옵션 정리
// ============================================================
//
//   origin            누구를 허락하나
//                       true         아무나 (*)
//                       "http://..." 그 하나만
//                       [배열]       그중 하나면
//                       함수         직접 판단
//
//   methods           프리플라이트에서 허락할 메서드
//                       기본: GET,HEAD,PUT,PATCH,POST,DELETE
//
//   allowedHeaders    받을 요청 헤더
//                       안 주면 브라우저가 물어본 것을 그대로 허락합니다
//
//   exposedHeaders    브라우저가 읽게 해 줄 응답 헤더
//                       X-Total-Count 같은 것. 안 주면 못 읽습니다
//
//   credentials       쿠키를 받을지 (true 면 origin 에 * 못 씀)
//
//   maxAge            프리플라이트를 몇 초 기억할지
//
//   optionsSuccessStatus  프리플라이트 응답 코드 (기본 204)
//
// ★ allowedHeaders 를 안 주면 어떻게 되나
//   브라우저가 "Content-Type 붙일게요" 하면 "Content-Type 됩니다" 라고 답합니다.
//   즉 아무 헤더나 허락하는 셈입니다.
//   편하지만, 무엇을 받는지 코드에 안 남습니다. 적어 두는 편이 낫습니다.

// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 이 서버를 켜고 front/다른출처.html 을 5500 으로 여세요.
//                    다섯 버튼이 전부 되나요? 개념03 과 결과가 같나요?
//
// ✏️ 직접 해보기 2 — ⑤ 헤더읽기 버튼을 눌러 X-Total-Count 가 보이는지 확인하세요.
//                    exposedHeaders 에서 X-Total-Count 를 빼고 다시 해 보세요.
//
// ✏️ 직접 해보기 3 — 허용출처들 에서 5500 을 빼고 다시 켜세요.
//                    출처판단 함수 때문에 /open-api 는 여전히 될 것입니다.
//                    /api 와 /open-api 의 차이를 확인하세요.
//
// ✏️ 직접 해보기 4 — 출처판단 의 endsWith 를 includes 로 바꾸고,
//                    Origin 을 http://example.com.evil.net 으로 보내 보세요.
//                    (Postman 의 Headers 에 Origin 을 직접 넣으면 됩니다)
//                    통과하나요? 왜 위험한가요? (확인 후 되돌리세요)
//
// ✏️ 직접 해보기 5 — cors 설정에서 methods 를 ["GET"] 으로 바꾸고
//                    ② POST 버튼을 눌러 보세요. 콘솔에 뭐라고 나오나요?
//
// ✏️ 직접 해보기 6 — app.use(cors()) 를 맨 위에 한 줄만 두는 방식으로 바꿔 보세요.
//                    전부 잘 됩니다. 그런데 무엇이 위험해졌나요?
//                    (힌트: 아무 사이트나 우리 API 를 부를 수 있습니다)
//
// ✏️ 직접 해보기 7 — 07단원의 계층 구조 서버에 cors 를 붙여 보세요.
//                    어느 파일에 붙이는 게 맞을까요?

// ── 자주 하는 실수 ──

// [실수 1] app.use(cors()) 한 줄로 끝냄
//   아무 사이트나 우리 API 를 쓸 수 있게 됩니다. 목록을 정하세요.

// [실수 2] origin 함수에서 거절할 때 에러를 던짐
//   콜백(null, false) 를 쓰세요. 에러를 던지면 500 이 됩니다.
//   CORS 로 막히는 것과 서버가 터지는 것은 다릅니다.

// [실수 3] 출처를 includes 로 확인
//   example.com.evil.net 이 통과합니다. endsWith(".example.com") 을 쓰세요.

// [실수 4] exposedHeaders 를 빠뜨림
//   에러가 안 나서 못 알아챕니다. 헤더만 조용히 null 이 됩니다.

// [실수 5] cors 를 라우트 아래에 붙임
//   미들웨어입니다. 라우트보다 위에 있어야 합니다. (05단원)

// [실수 6] credentials: true 와 origin: true 를 함께 씀
//   origin: true 는 * 를 뜻합니다. 브라우저가 거부합니다.

// ── 정리 ──

// 1. 직접 만들던 것을 cors 패키지가 대신해 준다. 프리플라이트도 알아서 처리한다.
// 2. app.use(cors()) 한 줄로 끝내지 않는다. 그건 모두에게 여는 것이다.
// 3. 허용 목록을 정해서 준다. 확인은 includes 가 아니라 정확히 같은지로 한다.
//    includes 로 하면 evil-mysite.com 같은 것이 통과한다.
// 4. 조건이 복잡하면 origin 자리에 함수를 준다.
// 5. 거절할 때 에러를 던지지 않는다. 던지면 500 이 된다. '허락 안 함' 으로 넘긴다.
// 6. 프론트가 읽어야 할 응답 헤더가 있으면 exposedHeaders 에 적는다.
// 7. cors 는 라우트보다 위에 붙인다. 아래에 두면 안 거친다.
// 8. credentials: true 와 origin: true 를 함께 쓰지 않는다.
//    요청한 곳을 전부 허락하면서 쿠키까지 보내는 셈이 된다.
// 9. 개발과 운영의 허용 목록을 나눠 둔다.
