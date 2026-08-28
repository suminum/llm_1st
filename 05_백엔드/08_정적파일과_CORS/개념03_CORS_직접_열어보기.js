// ============================================================
// 08단원 · 개념 03 — CORS 직접 열어 보기
// ------------------------------------------------------------
// 실행: node 개념03_CORS_직접_열어보기.js
//       끄려면 Ctrl + C
// ============================================================
//
// 개념02 에서 막히는 것을 봤습니다. 이제 엽니다.
//
// ★ 다음 파일(개념04)에서 cors 패키지를 씁니다. 한 줄이면 끝납니다.
//   그런데 한 번은 직접 붙여 봐야 합니다.
//   패키지가 무슨 헤더를 붙이는지 알아야, 안 될 때 어디를 볼지 압니다.

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 아무나 볼 수 있는 자료라면 ──

// 로그인이 필요 없고, 누가 봐도 상관없는 자료입니다.
// 공지사항, 공개 통계, 오픈 데이터 같은 것들이죠.

app.get("/public-api/notice", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json({ data: { 제목: "8월 정기 점검 안내" } });
});

// 확인: GET /public-api/notice [Origin: http://example.com]
// 응답: 200 {"data":{"제목":"8월 정기 점검 안내"}}
// 헤더: access-control-allow-origin=*

// 확인: GET /public-api/notice [Origin: http://another-site.com]
// 응답: 200 {"data":{"제목":"8월 정기 점검 안내"}}
// 헤더: access-control-allow-origin=*

// ★ * 는 "어느 출처든 읽어도 된다" 는 뜻입니다.
//   어느 출처에서 오든 같은 * 가 나갑니다.
//
// ★ * 를 써도 되는 경우
//   · 로그인이 필요 없다
//   · 누가 봐도 문제없는 자료다
//   · 쿠키를 안 쓴다  ← 이게 중요합니다. 섹션 6 에서 봅니다
//
// ★ * 를 쓰면 안 되는 경우
//   · 로그인한 사람만 보는 자료
//   · 사내에서만 쓰는 API
//   * 를 열어 두면 아무 사이트나 우리 API 를 자기 화면에 붙일 수 있습니다.


// ── 섹션 2: 정해진 곳만 허락하기 ──

// 우리 프론트엔드만 허락하고 싶습니다.
// 출처 목록을 만들어 두고, 그 안에 있을 때만 허락합니다.

const 허용출처들 = [
  "http://localhost:5500", // VS Code Live Server
  "http://localhost:5173", // Vite 개발 서버 (React)
  "https://설비관리.example.com", // 실제 서비스 주소
];

app.use((req, res, next) => {
  const 출처 = req.get("Origin");

  // ★ Origin 헤더는 '다른 출처에서 왔을 때만' 붙습니다.
  //   주소창으로 직접 열거나 Postman 으로 부르면 없습니다.
  if (출처 && 허용출처들.includes(출처)) {
    // ★★ * 가 아니라 '요청한 출처 그대로' 를 돌려줍니다.
    //   Allow-Origin 에는 여러 개를 쉼표로 못 씁니다. 딱 하나만 됩니다.
    //   그래서 매번 "이번 요청의 출처" 를 확인해서 그것만 적어 줍니다.
    res.set("Access-Control-Allow-Origin", 출처);

    // ★ Vary: Origin 은 왜 필요한가
    //   중간에 캐시 서버가 있으면, 한 출처에게 준 응답을 다른 출처에게도 줍니다.
    //   그러면 A 사이트에게 준 Allow-Origin 이 B 사이트에게 전달되어 막힙니다.
    //   "출처에 따라 응답이 달라진다" 를 알려 주는 것이 Vary 입니다.
    res.vary("Origin");
  }

  next();
});

app.get("/api/v1/equipments", (req, res) => {
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
// 헤더: access-control-allow-origin=http://localhost:5500 | vary=Origin

// 확인: GET /api/v1/equipments [Origin: http://evil.example.com]
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=(없음)

// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}
// 헤더: access-control-allow-origin=(없음)

// ★★★ 두 번째를 잘 보세요.
//
//   허락하지 않은 출처인데도 200 과 데이터가 그대로 나갔습니다.
//   서버는 아무것도 안 막았습니다. Allow-Origin 헤더만 안 붙였을 뿐입니다.
//
//   막는 것은 브라우저입니다. 브라우저가 그 헤더를 보고 판단합니다.
//   헤더가 없으니 "읽지 마" 하고 스크립트에게 안 넘겨줍니다.
//
// ★★ 그래서 CORS 는 보안이 아닙니다.
//
//   Postman·curl·다른 서버는 헤더를 무시하고 데이터를 그대로 가져갑니다.
//   "CORS 로 막아 뒀으니 안전하다" 는 완전히 틀린 생각입니다.
//
//   진짜 보안은 인증(05단원)입니다.
//   로그인 안 한 사람에게 데이터를 아예 안 주는 것이죠.
//   CORS 는 "브라우저에서 남의 사이트가 내 로그인 상태를 이용하는 것" 만 막습니다.
//
// ★ 세 번째 — Origin 이 아예 없으면 헤더도 안 붙습니다.
//   같은 출처이거나 브라우저가 아닌 경우입니다. 붙일 필요가 없습니다.


// ── 섹션 3: 프리플라이트 — 미리 물어보기 ──

// 개념02 의 ✏️5 에서 "POST 를 누르면 요청이 두 개 보인다" 고 했습니다.
// 앞엣것이 프리플라이트(preflight)입니다.
//
// 브라우저가 진짜 요청을 보내기 전에 먼저 물어봅니다.
//
//   브라우저: "OPTIONS 입니다. localhost:5500 인데, POST 로 Content-Type 붙여
//              보내도 될까요?"
//   서버:     "204. 됩니다. GET·POST·PATCH·DELETE 되고,
//              Content-Type 과 Authorization 헤더 받습니다."
//   브라우저: "좋습니다." → 그제야 진짜 POST 를 보냅니다.
//
// ★ 왜 미리 물어보나
//   DELETE 요청을 그냥 보냈다가 서버가 진짜로 지워 버리면 늦습니다.
//   "읽지 마" 라고 해도 이미 지워진 뒤입니다.
//   그래서 '바꾸는 요청' 은 먼저 허락을 받고 보냅니다.

app.get("/preflight-rules", (req, res) => {
  res.json({
    프리플라이트가없는요청: {
      조건: [
        "메서드가 GET · HEAD · POST 중 하나",
        "Content-Type 이 text/plain · multipart/form-data · application/x-www-form-urlencoded 중 하나",
        "직접 붙인 헤더가 없음 (Authorization 같은 것)",
      ],
      설명: "이 조건을 전부 만족하면 '단순 요청' 이라 바로 보냅니다. HTML 폼으로도 할 수 있는 일이라서요.",
    },
    프리플라이트가생기는요청: [
      "PATCH · DELETE · PUT",
      "Content-Type: application/json  ← ★ 우리 API 가 거의 다 여기 걸립니다",
      "Authorization 헤더를 붙임",
      "직접 만든 헤더를 붙임 (X-Request-Id 등)",
    ],
  });
});

// 확인: GET /preflight-rules
// 응답: 200

// ★★ 두 번째 목록의 두 번째 줄이 핵심입니다.
//
//   우리가 만든 API 는 전부 JSON 을 주고받습니다.
//   POST 에 Content-Type: application/json 을 붙이는 순간 프리플라이트가 생깁니다.
//
//   즉 "GET 은 되는데 POST 만 안 돼요" 라는 말이 나오면
//   십중팔구 OPTIONS 를 처리 안 한 것입니다.


// ── 섹션 4: OPTIONS 처리하기 ──

app.use((req, res, next) => {
  if (req.method !== "OPTIONS") {
    return next();
  }

  const 출처 = req.get("Origin");

  // 허락한 출처가 아니면 CORS 헤더 없이 그냥 끝냅니다.
  if (!출처 || !허용출처들.includes(출처)) {
    return res.sendStatus(204);
  }

  // Allow-Origin 은 위쪽 미들웨어가 이미 붙였습니다.
  res.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ★ 이 답을 10분 동안 기억해 두라는 뜻입니다.
  //   없으면 요청마다 OPTIONS 가 한 번씩 더 갑니다. 요청 수가 두 배가 됩니다.
  res.set("Access-Control-Max-Age", "600");

  // ★ 204 는 '성공했고 돌려줄 내용 없음' 입니다. 프리플라이트에 딱 맞습니다.
  //   200 을 줘도 됩니다. 다만 본문이 없으니 204 가 정확합니다.
  res.sendStatus(204);
});

// 확인: OPTIONS /api/v1/equipments [Origin: http://localhost:5500; Access-Control-Request-Method: POST; Access-Control-Request-Headers: content-type]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-allow-methods=GET,POST,PATCH,DELETE | access-control-allow-headers=Content-Type, Authorization | access-control-max-age=600

// 확인: OPTIONS /api/v1/equipments [Origin: http://evil.example.com; Access-Control-Request-Method: POST]
// 응답: 204
// 헤더: access-control-allow-origin=(없음) | access-control-allow-methods=(없음)

// ★ 허락 안 한 출처에는 헤더를 안 줍니다.
//   브라우저는 "허락을 못 받았다" 고 보고 진짜 요청을 아예 안 보냅니다.

app.post("/api/v1/equipments", (req, res) => {
  const { name, line } = req.body || {};
  res.status(201).json({ data: { id: 3, name, line, status: "정지" } });
});

// 확인: POST /api/v1/equipments [Origin: http://localhost:5500] {"name":"용접로봇 1호","line":"C"}
// 응답: 201 {"data":{"id":3,"name":"용접로봇 1호","line":"C","status":"정지"}}
// 헤더: access-control-allow-origin=http://localhost:5500

// ★ 프리플라이트가 통과한 뒤에 오는 진짜 요청입니다.
//   여기에도 Allow-Origin 이 있어야 합니다. OPTIONS 에만 붙이면 안 됩니다.
//   프리플라이트와 진짜 요청은 별개입니다. 둘 다 허락을 받아야 합니다.


app.delete("/api/v1/equipments/:id", (req, res) => {
  console.log(`   ★ DELETE 가 서버까지 도착했습니다. id=${req.params.id}`);
  res.sendStatus(204);
});

// 확인: DELETE /api/v1/equipments/1 [Origin: http://localhost:5500]
// 응답: 204
// 헤더: access-control-allow-origin=http://localhost:5500

// ★ 터미널의 ★ 표시를 보세요.
//   프리플라이트가 막히면 이 줄이 안 찍힙니다. 진짜 요청이 아예 안 오니까요.
//   Allow-Methods 에서 DELETE 를 빼고 다시 해 보면 확인할 수 있습니다. (✏️4)


// ── 섹션 5: 응답 헤더를 읽게 해 주기 ──

// 개념02 에서 본 '조용한 사고' 입니다.
// 200 이 오는데 X-Total-Count 만 null 인 경우요.

app.get("/api/v1/equipments-with-count", (req, res) => {
  res.set("X-Total-Count", "12");

  // ★ 이 줄이 없으면 브라우저가 X-Total-Count 를 못 읽게 합니다.
  //   에러도 안 나고 그냥 null 이 나옵니다.
  res.set("Access-Control-Expose-Headers", "X-Total-Count");

  res.json({ data: [{ id: 1 }, { id: 2 }] });
});

// 확인: GET /api/v1/equipments-with-count [Origin: http://localhost:5500]
// 응답: 200 {"data":[{"id":1},{"id":2}]}
// 헤더: access-control-allow-origin=http://localhost:5500 | access-control-expose-headers=X-Total-Count | x-total-count=12

// ★ 브라우저가 기본으로 읽게 해 주는 응답 헤더는 몇 개뿐입니다.
//     Content-Type, Content-Length, Content-Language,
//     Cache-Control, Expires, Last-Modified, Pragma
//
//   그 밖의 헤더는 전부 Expose-Headers 에 적어야 보입니다.
//   우리가 만든 X-Request-Id, X-Total-Count 같은 것들이죠.
//
// ★ 실제로 재 봤습니다 (진짜 크롬으로)
//     Expose-Headers 없음  →  headers.get("X-Total-Count") 는 null
//     Expose-Headers 있음  →  "12"
//   요청은 둘 다 200 으로 성공합니다. 차이는 헤더가 보이느냐뿐입니다.


// ── 섹션 6: 쿠키를 함께 보내려면 ──

app.get("/credentials-rules", (req, res) => {
  res.json({
    프론트에서: 'fetch(주소, { credentials: "include" })',
    서버에서: 'Access-Control-Allow-Credentials: true 를 붙인다',
    금지: "이때는 Allow-Origin 에 * 를 쓸 수 없습니다. 정확한 출처를 적어야 합니다.",
    이유: "* 는 '아무나' 라는 뜻인데, 쿠키까지 아무나 쓰게 하면 개념02 의 은행 시나리오가 그대로 일어납니다.",
    에러메시지:
      "The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*' when the request's credentials mode is 'include'.",
  });
});

// 확인: GET /credentials-rules
// 응답: 200

// ★ 우리 자료는 쿠키 대신 Authorization 헤더를 씁니다 (05단원).
//   헤더 방식은 credentials 가 필요 없습니다.
//   프론트가 직접 붙여 보내니까요. 브라우저가 자동으로 붙이는 게 아닙니다.
//
//   대신 Allow-Headers 에 Authorization 을 넣어야 합니다. 섹션 4 에 있습니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
  console.log(`허용 출처: ${허용출처들.join(", ")}`);
});


// ============================================================
// CORS 헤더 정리
// ============================================================
//
//   Access-Control-Allow-Origin        누가 읽어도 되나        (필수)
//   Access-Control-Allow-Methods       어떤 메서드가 되나      (프리플라이트 응답)
//   Access-Control-Allow-Headers       어떤 헤더를 받나        (프리플라이트 응답)
//   Access-Control-Max-Age             프리플라이트를 몇 초 기억하나
//   Access-Control-Expose-Headers      어떤 응답 헤더를 읽게 하나
//   Access-Control-Allow-Credentials   쿠키를 함께 받나
//   Vary: Origin                       캐시가 출처별로 나누게
//
// 요청 쪽 헤더 (브라우저가 자동으로 붙임 — 우리가 안 씁니다)
//   Origin                             지금 페이지의 출처
//   Access-Control-Request-Method      프리플라이트에서 "이 메서드로 갈게요"
//   Access-Control-Request-Headers     프리플라이트에서 "이 헤더 붙일게요"


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 이 서버를 켜고 front/다른출처.html 을 5500 포트로 여세요.
//                    다섯 버튼이 전부 되나요?
//                    개념02 서버일 때와 비교해 보세요.
//
// ✏️ 직접 해보기 2 — 허용출처들 에서 http://localhost:5500 을 빼고 다시 켜세요.
//                    콘솔 메시지가 개념02 때와 어떻게 다른가요?
//                    ('헤더가 없다' 와 '값이 다르다' 는 다른 메시지입니다)
//
// ✏️ 직접 해보기 3 — 섹션 4의 Allow-Headers 에서 Authorization 을 빼고
//                    ③ 증표 버튼을 눌러 보세요. 콘솔에 뭐라고 나오나요?
//
// ✏️ 직접 해보기 4 — Allow-Methods 에서 DELETE 를 빼고 ④ 삭제 버튼을 누르세요.
//                    Network 탭에 요청이 몇 개 보이나요?
//                    진짜 DELETE 가 서버까지 갔나요? (터미널을 보세요)
//
// ✏️ 직접 해보기 5 — 섹션 5의 Expose-Headers 줄을 지우고
//                    ⑤ 헤더읽기 버튼을 눌러 보세요.
//                    에러가 나나요? X-Total-Count 는 어떻게 나오나요?
//
// ✏️ 직접 해보기 6 — Max-Age 를 지우고 Network 탭을 보면서
//                    ② POST 를 여러 번 눌러 보세요. OPTIONS 가 매번 가나요?
//                    다시 넣으면 어떻게 되나요?
//
// ✏️ 직접 해보기 7 — 허용출처들 을 함수로 바꿔 보세요.
//                    "localhost 로 시작하면 전부 허용" 처럼요.
//                    개발 중에는 편한데, 실제 서비스에서는 왜 위험할까요?


// ── 자주 하는 실수 ──

// [실수 1] Allow-Origin 에 여러 출처를 쉼표로 씀
//   "http://a.com, http://b.com" 은 통째로 하나의 값으로 봅니다. 안 됩니다.
//   요청의 Origin 을 확인해서 하나만 적어 주세요.

// [실수 2] OPTIONS 를 처리 안 함
//   "GET 은 되는데 POST 만 안 돼요" 의 1번 원인입니다.

// [실수 3] OPTIONS 에만 헤더를 붙이고 진짜 요청에는 안 붙임
//   프리플라이트는 통과하는데 본 요청에서 막힙니다.

// [실수 4] 주소 끝에 / 를 붙임
//   "http://localhost:5500/" 과 "http://localhost:5500" 은 다릅니다.
//   Origin 헤더에는 / 가 안 붙습니다. 목록에도 붙이지 마세요.

// [실수 5] Vary: Origin 을 빼먹음
//   개발 중에는 티가 안 납니다. 중간에 캐시가 있는 실제 서비스에서 터집니다.

// [실수 6] CORS 를 보안이라고 생각
//   Postman 으로는 그냥 뚫립니다. 진짜 보안은 인증입니다.

// [실수 7] credentials 를 쓰면서 Allow-Origin 에 * 를 씀
//   브라우저가 거부합니다. 정확한 출처를 적어야 합니다.


// ── 정리 ──

// 1. 허락은 응답 헤더로 한다 — Access-Control-Allow-Origin.
// 2. 여러 출처를 쉼표로 못 쓴다. 하나만 적거나, 요청한 출처를 보고 그것만 돌려준다.
// 3. 출처를 보고 정할 때는 Vary: Origin 을 함께 붙인다.
//    안 붙이면 캐시가 다른 출처에 엉뚱한 답을 준다.
// 4. 주소 끝에 / 를 붙이면 안 맞는다. 출처는 글자 그대로 비교된다.
// 5. 단순하지 않은 요청은 브라우저가 먼저 OPTIONS 로 물어본다. 이것이 프리플라이트다.
//    이걸 처리 안 하면 진짜 요청은 오지도 않는다.
// 6. OPTIONS 에만 헤더를 붙이면 안 된다. 진짜 요청의 응답에도 붙어야 한다.
// 7. 응답 헤더를 프론트가 읽게 하려면 Expose-Headers 로 따로 열어 준다.
// 8. 쿠키를 함께 보내려면 credentials 를 켜는데, 그때는 Allow-Origin 에 * 를 못 쓴다.
// 9. CORS 는 보안 장치가 아니다. 브라우저 안에서만 도는 규칙이다.
//    진짜 보호는 인증과 권한이 한다.
