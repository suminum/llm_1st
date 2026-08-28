// ============================================================
// 08단원 · 개념 02 — CORS 란 무엇인가
// ------------------------------------------------------------
// 실행: node 개념02_CORS란_무엇인가.js
//       끄려면 Ctrl + C
//
// ★ 이 파일은 '일부러 CORS 를 안 열어 둔' 서버입니다.
//   front/다른출처.html 을 다른 포트로 열어서 막히는 것을 직접 보세요.
// ============================================================
//
// 개념01 마지막에서 이렇게 끝냈습니다.
//
//   "같은 출처라서 아무 문제가 없었습니다. 출처가 다르면?"
//
// 이제 그 이야기입니다.

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ── 섹션 1: 출처(origin)란 ──

// 출처는 세 가지가 합쳐진 것입니다.
//
//   http :// localhost : 3000
//   ────    ─────────    ────
//   프로토콜   호스트      포트
//
// 이 셋이 '전부' 같아야 같은 출처입니다. 하나라도 다르면 다른 출처입니다.

app.get("/origin-quiz", (req, res) => {
  const 기준 = "http://localhost:3000";

  res.json({
    기준,
    비교: [
      { 주소: "http://localhost:3000/api/x", 같은출처: true, 이유: "경로는 상관없습니다" },
      { 주소: "http://localhost:3000/?q=1", 같은출처: true, 이유: "쿼리도 상관없습니다" },
      { 주소: "http://localhost:5500", 같은출처: false, 이유: "포트가 다릅니다" },
      { 주소: "https://localhost:3000", 같은출처: false, 이유: "프로토콜이 다릅니다" },
      { 주소: "http://127.0.0.1:3000", 같은출처: false, 이유: "글자가 다르면 다른 호스트입니다" },
      { 주소: "http://api.mysite.com", 같은출처: false, 이유: "호스트가 다릅니다" },
    ],
  });
});

// 확인: GET /origin-quiz
// 응답: 200 {"기준":"http://localhost:3000","비교":[{"주소":"http://localhost:3000/api/x","같은출처":true,"이유":"경로는 상관없습니다"},{"주소":"http://localhost:3000/?q=1","같은출처":true,"이유":"쿼리도 상관없습니다"},{"주소":"http://localhost:5500","같은출처":false,"이유":"포트가 다릅니다"},{"주소":"https://localhost:3000","같은출처":false,"이유":"프로토콜이 다릅니다"},{"주소":"http://127.0.0.1:3000","같은출처":false,"이유":"글자가 다르면 다른 호스트입니다"},{"주소":"http://api.mysite.com","같은출처":false,"이유":"호스트가 다릅니다"}]}

// ★★ localhost 와 127.0.0.1 은 다른 출처입니다.
//   같은 컴퓨터를 가리키는데도 그렇습니다. 브라우저는 글자로만 비교합니다.
//   "분명 같은 곳인데 왜 막히지?" 의 흔한 원인입니다.
//
// ★ 포트만 달라도 다른 출처입니다.
//   React 개발 서버는 5173, 우리 서버는 3000. 이미 다른 출처입니다.
//   그래서 프론트를 따로 만들면 반드시 CORS 를 만납니다.


// ── 섹션 2: 왜 이런 규칙이 있나 ──

app.get("/why-sop", (req, res) => {
  res.json({
    시나리오: [
      "여러분이 은행 사이트에 로그인해 둡니다.",
      "그 상태로 나쁜 사이트에 들어갑니다.",
      "그 사이트의 스크립트가 fetch('https://은행.com/내계좌') 를 부릅니다.",
      "브라우저는 은행 쿠키를 자동으로 붙여 보냅니다. 은행은 로그인한 사람으로 봅니다.",
      "막지 않으면 나쁜 사이트가 여러분의 계좌 정보를 읽습니다.",
    ],
    그래서: "브라우저는 '다른 출처의 응답을 스크립트가 읽는 것' 을 기본으로 막습니다.",
    이름: "같은 출처 정책 (Same-Origin Policy)",
    CORS는: "그 막힌 것을 서버가 '얘는 괜찮다' 고 허락해 주는 방법입니다.",
  });
});

// 확인: GET /why-sop
// 응답: 200 {"시나리오":["여러분이 은행 사이트에 로그인해 둡니다.","그 상태로 나쁜 사이트에 들어갑니다.","그 사이트의 스크립트가 fetch('https://은행.com/내계좌') 를 부릅니다.","브라우저는 은행 쿠키를 자동으로 붙여 보냅니다. 은행은 로그인한 사람으로 봅니다.","막지 않으면 나쁜 사이트가 여러분의 계좌 정보를 읽습니다."],"그래서":"브라우저는 '다른 출처의 응답을 스크립트가 읽는 것' 을 기본으로 막습니다.","이름":"같은 출처 정책 (Same-Origin Policy)","CORS는":"그 막힌 것을 서버가 '얘는 괜찮다' 고 허락해 주는 방법입니다."}

// ★ CORS 는 '보안 장치' 가 아니라 '허락하는 방법' 입니다.
//   이름 그대로입니다. Cross-Origin Resource Sharing — 출처를 넘어 자원 공유하기.
//   막는 쪽은 브라우저이고, CORS 는 그걸 푸는 쪽입니다.
//
//   그래서 "CORS 를 열면 위험한가?" 는 상황에 따라 다릅니다.
//   누구에게 여는지가 중요합니다. 개념03 에서 봅니다.


// ── 섹션 3: ★★ 브라우저만 막습니다 ──

app.get("/api/v1/equipments", (req, res) => {
  // ★ CORS 헤더를 하나도 안 붙입니다. 일부러입니다.
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
// 헤더: access-control-allow-origin=(없음)

// ★★★ 여기를 보세요.
//
//   다른 출처(localhost:5500)에서 온 것처럼 Origin 헤더를 붙여 보냈습니다.
//   그런데 서버는 200 과 데이터를 그대로 돌려줬습니다.
//   Access-Control-Allow-Origin 헤더는 없습니다.
//
//   즉 서버는 아무것도 안 막았습니다.
//
// ★ 이 검증은 Node 로 요청을 보낸 것입니다. Node 는 CORS 를 안 따집니다.
//   Postman 도, curl 도 마찬가지입니다. 전부 잘 됩니다.
//
//   막는 것은 오직 브라우저입니다.
//   정확히는 "브라우저에서 도는 스크립트가 응답을 읽는 것" 만 막습니다.
//
// ★★ 그래서 이런 일이 벌어집니다.
//
//   프론트 개발자: "API 가 안 돼요. CORS 에러가 나요."
//   백엔드 개발자: "Postman 으로는 잘 되는데요?"
//
//   둘 다 맞습니다. Postman 은 브라우저가 아니니까요.
//   이 대화를 안 하려면 백엔드가 CORS 를 알아야 합니다.


// ── 섹션 4: 브라우저에서 실제로 막히는 것 보기 ──

app.get("/how-to-test", (req, res) => {
  res.json({
    준비: [
      "이 서버를 켜 둡니다 (포트 3000).",
      "front/다른출처.html 을 '다른 포트' 로 엽니다.",
      "VS Code 라면 파일을 우클릭 → Open with Live Server (보통 5500 포트).",
      "또는 터미널을 하나 더 열어  npx serve front  를 실행합니다.",
    ],
    주의: [
      "파일을 더블클릭해서 열면 주소가 file:// 이 됩니다.",
      "그것도 다른 출처라 막히긴 하는데, 에러 메시지가 다르게 나옵니다.",
      "http:// 로 여는 것이 실제 상황과 같습니다.",
    ],
    반드시: "F12 → Console 탭을 함께 여세요. 진짜 원인은 콘솔에만 나옵니다.",
  });
});

// 확인: GET /how-to-test
// 응답: 200 {"준비":["이 서버를 켜 둡니다 (포트 3000).","front/다른출처.html 을 '다른 포트' 로 엽니다.","VS Code 라면 파일을 우클릭 → Open with Live Server (보통 5500 포트).","또는 터미널을 하나 더 열어  npx serve front  를 실행합니다."],"주의":["파일을 더블클릭해서 열면 주소가 file:// 이 됩니다.","그것도 다른 출처라 막히긴 하는데, 에러 메시지가 다르게 나옵니다.","http:// 로 여는 것이 실제 상황과 같습니다."],"반드시":"F12 → Console 탭을 함께 여세요. 진짜 원인은 콘솔에만 나옵니다."}


// ── 섹션 5: ★ 에러 메시지 읽는 법 ──

// 진짜 크롬으로 다섯 가지 경우를 실제로 재 봤습니다.
// 아래는 지어낸 것이 아니라 크롬이 찍은 그대로입니다.

app.get("/error-messages", (req, res) => {
  res.json({
    자바스크립트가받는것: "TypeError: Failed to fetch",
    설명: "이 메시지만 봐서는 원인을 알 수 없습니다. 네트워크가 끊겨도 같은 메시지가 나옵니다.",
    콘솔에나오는진짜이유: [
      {
        경우: "서버가 CORS 헤더를 아예 안 줌",
        메시지: "No 'Access-Control-Allow-Origin' header is present on the requested resource.",
        고치는법: "서버에서 Access-Control-Allow-Origin 을 붙여 주세요.",
      },
      {
        경우: "POST/PATCH/DELETE 인데 CORS 헤더가 없음 (프리플라이트가 막힌 경우)",
        메시지: "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
        고치는법: "OPTIONS 요청에도 CORS 헤더를 주세요. 앞부분에 preflight 이 붙어 있으면 OPTIONS 문제입니다.",
      },
      {
        경우: "허용한 출처가 내 출처와 다름",
        메시지: "The 'Access-Control-Allow-Origin' header has a value 'http://example.com' that is not equal to the supplied origin.",
        고치는법: "허용 목록에 내 출처를 추가하세요. 포트까지 정확히 맞춰야 합니다.",
      },
      {
        경우: "Authorization 같은 헤더를 보냈는데 허용 안 함",
        메시지: "Request header field authorization is not allowed by Access-Control-Allow-Headers in preflight response.",
        고치는법: "Access-Control-Allow-Headers 에 그 헤더 이름을 넣으세요.",
      },
      {
        경우: "DELETE 를 보냈는데 허용 안 함",
        메시지: "Method DELETE is not allowed by Access-Control-Allow-Methods in preflight response.",
        고치는법: "Access-Control-Allow-Methods 에 그 메서드를 넣으세요.",
      },
      {
        경우: "요청은 됐는데 응답 헤더를 못 읽음",
        메시지: "(에러가 안 납니다. 200 이 오는데 헤더만 null 입니다)",
        고치는법: "Access-Control-Expose-Headers 에 그 헤더 이름을 넣으세요.",
      },
    ],
  });
});

// 확인: GET /error-messages
// 응답: 200

// ★★ 다섯 번째가 제일 무섭습니다.
//
//   요청은 성공하고 200 이 옵니다. 에러도 안 납니다.
//   그런데 response.headers.get("X-Total-Count") 가 null 입니다.
//
//   06단원에서 "전체 개수를 헤더로 주는 방법도 있다" 고 했는데,
//   그때 "CORS 를 쓰면 헤더를 따로 열어 줘야 보인다" 고 적은 게 이것입니다.
//
//   화면에 "전체 0건" 이 나오는데 목록은 잘 나옵니다.
//   원인을 CORS 라고는 아무도 생각 안 합니다.
//
// ★ 읽는 순서
//   ① Console 탭의 빨간 글씨를 끝까지 읽습니다
//   ② "blocked by CORS policy:" 뒤가 진짜 이유입니다
//   ③ 그 이유가 위 표의 어느 줄인지 찾습니다
//   ④ Network 탭에서 그 요청을 눌러 Response Headers 를 확인합니다


// ── 섹션 6: Network 탭에서 무엇을 보나 ──

app.get("/network-tab", (req, res) => {
  res.json({
    볼것: [
      "요청이 두 번 보이면 앞엣것이 OPTIONS 입니다. 이게 프리플라이트입니다 (개념03).",
      "Request Headers 에 Origin 이 있는지 — 없으면 같은 출처라 CORS 대상이 아닙니다.",
      "Response Headers 에 Access-Control-Allow-Origin 이 있는지.",
      "그 값이 내 Origin 과 글자 단위로 같은지 — 끝의 / 하나도 다르면 안 됩니다.",
      "상태가 200 인데도 빨간 줄이면, 응답은 왔지만 브라우저가 읽기를 막은 것입니다.",
    ],
    함정: "Network 탭에는 200 으로 보이는데 코드에서는 실패합니다. 정상입니다. 응답은 도착했고, 읽는 것만 막힌 것입니다.",
  });
});

// 확인: GET /network-tab
// 응답: 200

// ★ 마지막 줄이 정말 헷갈리는 부분입니다.
//   "서버는 200 을 줬는데 왜 실패라고 나오지?"
//   응답이 도착한 것과 스크립트가 읽을 수 있는 것은 다릅니다.
//   브라우저가 중간에서 가로채 버립니다.


app.use((req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" } });
});


app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}/api/v1/equipments`);
  console.log("★ 이 서버는 일부러 CORS 를 안 열어 두었습니다.");
  console.log("  front/다른출처.html 을 다른 포트로 열어서 막히는 것을 확인하세요.");
});


// ============================================================
// 실험 순서
// ============================================================
//
//   1. 이 서버를 켭니다.
//
//   2. 브라우저에서 직접 http://localhost:3000/api/v1/equipments 를 엽니다.
//      → 잘 나옵니다. 주소창으로 연 것은 같은 출처니까요.
//
//   3. Postman 으로 같은 주소를 부릅니다.
//      → 잘 됩니다. Postman 은 브라우저가 아닙니다.
//
//   4. front/다른출처.html 을 Live Server(5500 포트)로 엽니다.
//      버튼을 누릅니다.
//      → 실패합니다. 화면에는 "TypeError: Failed to fetch" 만 나옵니다.
//
//   5. F12 → Console 을 봅니다.
//      → No 'Access-Control-Allow-Origin' header is present...
//
//   6. F12 → Network 에서 그 요청을 누릅니다.
//      → Status 는 200 입니다. 응답은 왔습니다. 읽기만 막힌 것입니다.
//
// 2·3번은 되고 4번만 안 되는 것 — 이게 CORS 의 전부입니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 위 실험 순서를 그대로 해 보세요. 여섯 단계 전부요.
//
// ✏️ 직접 해보기 2 — front/다른출처.html 의 API 를
//                    "http://127.0.0.1:3000" 으로 바꿔 보세요.
//                    같은 컴퓨터인데도 막히나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 3 — 다른출처.html 을 public 폴더로 옮기고
//                    http://localhost:3000/다른출처.html 로 열어 보세요.
//                    이제 되나요? 무엇이 달라졌나요?
//
// ✏️ 직접 해보기 4 — 다른출처.html 을 파일 탐색기에서 더블클릭해 열어 보세요.
//                    주소가 file:// 로 시작합니다. 콘솔 메시지가 어떻게 다른가요?
//
// ✏️ 직접 해보기 5 — Network 탭에서 ② POST 버튼을 눌러 보세요.
//                    요청이 몇 개 보이나요? 앞엣것의 Method 는 무엇인가요?
//                    (이게 개념03 의 주제입니다)
//
// ✏️ 직접 해보기 6 — 아래 다섯 상황이 CORS 대상인지 판단해 보세요.
//
//     ① 브라우저 주소창에 API 주소를 직접 침
//     ② <img src="http://다른서버/사진.png">
//     ③ fetch("http://다른서버/api")
//     ④ Postman 으로 요청
//     ⑤ 서버에서 다른 서버로 fetch (Node 에서)
//
//     (힌트: "브라우저의 스크립트가 응답을 읽는가?" 를 물어보세요)


// ── 자주 하는 실수 ──

// [실수 1] "Failed to fetch" 만 보고 서버가 죽었다고 생각
//   콘솔의 빨간 글씨를 끝까지 읽으세요. 진짜 이유는 거기 있습니다.

// [실수 2] Postman 으로 되니까 서버는 문제없다고 결론
//   Postman 은 CORS 를 안 따집니다. 브라우저로 확인해야 합니다.

// [실수 3] localhost 와 127.0.0.1 을 같다고 생각
//   브라우저는 글자로 비교합니다. 다른 출처입니다.

// [실수 4] 프론트 코드를 고치려고 함
//   CORS 는 서버가 허락해 주는 것입니다. 프론트에서 할 수 있는 게 없습니다.
//   (브라우저 확장으로 끄는 방법이 있지만, 내 컴퓨터에서만 되는 임시방편입니다)

// [실수 5] Network 탭이 200 이라 CORS 가 아니라고 생각
//   응답이 온 것과 읽을 수 있는 것은 다릅니다.

// [실수 6] 응답 헤더가 안 읽히는데 CORS 를 의심 안 함
//   에러가 안 나서 알아채기 어렵습니다. Expose-Headers 를 떠올리세요.


// ── 정리 ──

// 1. 출처(origin)는 프로토콜·호스트·포트 셋을 합친 것이다. 하나라도 다르면 다른 출처다.
//    localhost 와 127.0.0.1 도 다른 출처다. 같은 컴퓨터인 것은 상관없다.
// 2. CORS 는 브라우저만 막는다. 서버는 응답을 이미 정상으로 보냈다.
// 3. 그래서 Postman 으로는 언제나 잘 된다. Postman 이 된다고 문제가 없는 것이 아니다.
// 4. Network 탭에도 200 으로 보인다. 응답은 왔고 브라우저가 안 넘겨준 것뿐이다.
//    200 이니까 CORS 가 아니라고 판단하면 안 된다.
// 5. "Failed to fetch" 만 보고 서버가 죽었다고 하지 않는다.
//    Console 에 있는 CORS 문구를 끝까지 읽는다.
// 6. 고칠 곳은 서버다. 프론트 코드를 아무리 고쳐도 안 된다.
// 7. 응답 헤더가 안 읽히는 것도 CORS 다. 기본으로는 몇 개만 보여 준다.
