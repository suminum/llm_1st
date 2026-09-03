// ============================================================
// 08단원 · 개념 01 — 정적 파일 서비스하기 (express.static)
// ------------------------------------------------------------
// 실행: node 개념01_정적_파일_서비스하기.js
//       그다음 브라우저에서 http://localhost:3000 을 여세요.
//       끄려면 Ctrl + C
// ============================================================
//
// 지금까지 만든 것은 전부 JSON 이었습니다.
// 그런데 사람이 보는 것은 화면입니다. HTML·CSS·이미지가 필요합니다.
//
// 이런 파일들을 '정적 파일' 이라고 부릅니다.
//
//   정적(static)  누가 요청하든 똑같은 것을 돌려줌. HTML·CSS·JS·이미지
//   동적(dynamic) 요청에 따라 달라짐. 우리가 만든 API 응답
//
// 정적 파일은 만들 것이 없습니다. 있는 파일을 그대로 보내면 됩니다.
// 그래서 Express 에 이미 들어 있습니다.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "테스트 성공" });
});
// ── 섹션 1: 한 줄이면 됩니다 ──

//app.use(express.static(path.join(__dirname, "public"))); //이 폴더안에있는것만 반환 밖에 파일은 못함
//이걸 씀으로 써 app.get(경로,라우터 가능 )-> express.static이란 조건 (get: 경로확인후 있으면 끝내고
// 없으면  함수실행함
//__dirname: 이 노드가 실행되는 파일 위치

// 이 한 줄이 하는 일
//
//   요청이 오면 public 폴더에서 같은 이름의 파일을 찾습니다.
//   있으면 그 파일을 보내고 끝냅니다. (next() 를 안 부릅니다)
//   없으면 next() 를 불러 아래 라우트로 넘깁니다.//없다고 에러 안남
//
//   GET /              →  public/index.html
//   GET /css/공통.css   →  public/css/공통.css
//   GET /js/화면.js     →  public/js/화면.js
//   GET /api/v1/...    →  public 에 없으니 아래 라우트로
//
// ★ 미들웨어입니다. 05단원에서 배운 그것입니다.
//   "요청이 오면 먼저 여기를 거친다" 는 것이죠.
//   찾으면 응답하고 끝, 못 찾으면 next(). 딱 그 모양입니다.
//
// ★ __dirname 을 꼭 쓰세요
//   express.static("public") 이라고만 쓰면 터미널 위치 기준이 됩니다.
//   다른 폴더에서 node 로 실행하면 파일을 못 찾습니다. (02단원 개념01)

// 확인: GET /
// 응답: 200

// 확인: GET /css/공통.css
// 응답: 200

// 확인: GET /js/화면.js
// 응답: 200

// ── 섹션 2: index.html 은 자동입니다 ──//npm 실행할떄 index.html 을 가장먼저 기본값으로 실행

// GET / 로 요청하면 public/index.html 을 찾아 줍니다.
// 아무 폴더나 마찬가지입니다. /docs/ 면 public/docs/index.html 을 찾습니다.
//
// ★ 이건 아주 오래된 약속입니다.
//   웹 서버는 폴더를 요청받으면 index.html 을 찾습니다.
//   그래서 홈 화면 파일 이름을 index.html 로 짓는 것입니다.

// ── 섹션 3: 없는 파일은 아래로 넘어갑니다 ──

app.get("/api/v1/equipments", (req, res) => {
  res.json({
    data: [
      { id: 1, name: "컨베이어 1호", line: "A", status: "가동" },
      { id: 2, name: "프레스 1호", line: "B", status: "정지" },
    ],
  });
});

//물어보고 싶은거
app.get("/css1", (req, res, next) => {
  //인코딩 문제였다

  console.log("지나감");
  //express가 직접 다음 미들웨어를 찾아서 넣어줌  등록된 순서대로
  next();
});

app.get("/css1", (req, res) => {
  res.json({ message: "안녕" });
});
// 확인: GET /api/v1/equipments
// 응답: 200 {"data":[{"id":1,"name":"컨베이어 1호","line":"A","status":"가동"},{"id":2,"name":"프레스 1호","line":"B","status":"정지"}]}

// public 폴더에 api 라는 파일이 없으니 static 이 next() 를 불렀고,
// 이 라우트가 걸렸습니다.
//
// ★★ 그래서 순서가 중요합니다.
//   static 을 라우트보다 아래에 두면?
//   /css/공통.css 요청이 라우트를 먼저 훑고 내려옵니다. 결과는 같습니다.
//
//   그런데 이런 경우가 문제입니다.
//   public 에 api 라는 폴더를 만들면, static 이 그걸 먼저 찾아서
//   우리 API 라우트가 영영 실행되지 않습니다.
//
//   그래서 API 주소에 /api 접두어를 붙이고,
//   public 안에는 api 라는 이름을 안 쓰는 것이 안전합니다. (06단원 개념01)

// ── 섹션 4: 없는 파일을 요청하면 ──

// 확인: GET /없는파일.png
// 응답: 404

// static 이 못 찾고 next() 를 불렀고, 아래 404 처리기까지 내려온 것입니다.

// ★ 여기서 판단이 필요합니다.
//   /없는파일.png 는 404 JSON 이 맞을까요, 404 HTML 페이지가 맞을까요?
//
//   API 서버라면 JSON 입니다.
//   화면까지 주는 서버라면, 브라우저 주소창으로 들어온 것에는 HTML 이 낫습니다.
//   이 자료는 API 가 중심이라 JSON 으로 통일합니다.

// ── 섹션 5: ★ 상위 폴더로 못 나갑니다 ──

// 이런 요청을 보내면 어떻게 될까요?
//
//   GET /../package.json
//   GET /..%2F..%2F.env
//
// public 밖으로 나가서 서버 파일을 가져가려는 시도입니다.
// 실제로 아주 흔한 공격입니다. '경로 탈출(path traversal)' 이라고 합니다.

// 확인: GET /../package.json
// 응답: 404

// 확인: GET /..%2F..%2Fpackage.json
// 응답: 404

// ★ express.static 이 막아 줍니다.
//   요청 경로를 정리한 뒤, public 폴더 밖으로 나가는지 확인합니다.
//   나가려 하면 그냥 안 줍니다.
//
// ★★ 그런데 직접 만들면 이게 안 막힙니다.
//   "정적 파일 정도는 직접 만들지" 하고 이렇게 쓰면 큰일 납니다.
//
//     app.get("/files/:name", (req, res) => {
//       res.sendFile(path.join(__dirname, "public", req.params.name));
//     });
//
//   :name 에 ../../.env 를 넣으면 서버 비밀 파일이 그대로 나갑니다.
//   비밀번호와 API 키가 들어 있는 파일입니다.
//
//   express.static 을 쓰세요. 남이 이미 고민해서 막아 둔 것을 쓰는 게 낫습니다.

// ── 섹션 6: 옵션 몇 가지 ──

// 자주 쓰는 것만 봅니다.
//
//   express.static(폴더, {
//     maxAge: "1d",          브라우저에게 "하루 동안 다시 안 물어봐도 된다"
//     index: false,          index.html 자동 찾기를 끔
//     dotfiles: "ignore",    .env 같은 점으로 시작하는 파일은 무시 (기본값)
//     extensions: ["html"],  /about 으로 about.html 을 찾아 줌
//   })
//
// ★ maxAge 를 주면 빨라집니다
//   브라우저가 파일을 저장해 두고 다시 안 받아 갑니다.
//   그런데 파일을 고쳐도 사용자 화면이 안 바뀝니다. 하루 동안요.
//
//   그래서 실무에서는 파일 이름에 번호를 붙입니다.
//     화면.a3f21c.js
//   내용이 바뀌면 이름이 바뀌니 브라우저가 새로 받아 갑니다.
//   React 를 빌드하면 이런 이름이 나오는 이유입니다.
//
// ★ 지금은 maxAge 를 안 주는 게 낫습니다
//   개발 중에는 고칠 때마다 바로 보여야 하니까요.
//   "왜 안 바뀌지?" 의 원인이 캐시인 경우가 정말 많습니다.
//   그럴 때는 Ctrl + Shift + R 로 강제 새로고침해 보세요.

app.use(
  "/docs",
  express.static(path.join(__dirname, "public"), { index: false }),
);

// 확인: GET /docs/css/공통.css
// 응답: 200

// 확인: GET /docs/
// 응답: 404

// 같은 폴더를 /docs 아래에도 붙였습니다. index: false 라 /docs/ 는 404 입니다.
//
// ★ static 은 여러 번 붙일 수 있습니다.
//   app.use(express.static("public"))
//   app.use(express.static("uploads"))
//   위에서부터 찾다가 처음 있는 것을 줍니다.
//   (09단원에서는 접두어를 붙인 변형 app.use("/uploads", express.static(...)) 을 씁니다)

// ── 섹션 7: 404 와 에러 처리기 ──

// ★ 07단원에서는 없는 주소를 ROUTE_NOT_FOUND 로 구분했지만,
//   이 단원의 서버는 '없는 파일' 의 404 까지 겸하므로 NOT_FOUND 하나로 씁니다.
app.use((req, res) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "찾을 수 없습니다" } });
});

app.use((err, req, res, next) => {
  console.error(`[에러] ${req.method} ${req.path} — ${err.message}`);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "서버에서 문제가 생겼습니다" },
  });
});

app.listen(PORT, () => {
  console.log(`서버가 켜졌습니다.  http://localhost:${PORT}`);
  console.log("브라우저로 열어서 버튼을 눌러 보세요.");
});

// ============================================================
// 브라우저로 확인하기
// ============================================================
//
// http://localhost:3000 을 여세요.
//
//   ① 화면이 나옵니다 (public/index.html)
//   ② 글자에 스타일이 붙어 있습니다 (public/css/공통.css)
//   ③ 버튼을 누르면 목록이 나옵니다 (public/js/화면.js 가 fetch)
//
// F12 → Network 탭을 켜고 새로고침해 보세요.
// 네 개의 요청이 보입니다.
//
//   localhost      document    index.html
//   공통.css        stylesheet
//   화면.js         script
//   equipments     fetch       ← 버튼을 눌렀을 때
//
// ★★ 여기가 이 단원의 출발점입니다.
//
//   네 개가 전부 localhost:3000 입니다. 같은 곳에서 왔습니다.
//   이걸 '같은 출처(same origin)' 라고 합니다.
//
//   화면.js 의 fetch 를 보세요.
//
//     fetch("/api/v1/equipments")
//
//   주소를 반쪽만 썼습니다. 앞부분(http://localhost:3000)이 없습니다.
//   브라우저가 "지금 페이지와 같은 곳" 으로 알아서 붙여 줍니다.
//
//   같은 출처라서 아무 문제가 없습니다.
//   출처가 다르면? 그때부터 CORS 이야기가 시작됩니다. 개념02 에서 봅니다.

// ============================================================
// 정적 파일을 어디서 줄 것인가
// ============================================================
//
//   ① 우리 Express 서버가 준다 (지금 방식)
//      장점: 서버 하나면 끝. CORS 문제가 없음
//      단점: 화면을 고칠 때마다 서버를 다시 올려야 함
//      언제: 작은 프로젝트, 관리자 화면
//
//   ② 프론트를 따로 띄운다 (React 개발 서버 등)
//      장점: 프론트와 백엔드를 따로 개발·배포
//      단점: ★ 출처가 달라서 CORS 설정이 필요함
//      언제: 프론트가 React·Vue 인 경우. PART 3 이후
//
//   ③ S3 같은 곳에 올린다
//      장점: 서버가 안 죽고, 전 세계에서 빠름
//      단점: 역시 CORS 설정 필요
//      언제: 실제 서비스 배포. PART 4
//
// ★ ②와 ③은 반드시 CORS 를 만납니다.
//   여러분이 만들 프로젝트도 대부분 ②나 ③입니다.
//   그래서 이 단원이 필요합니다.

// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — public/index.html 의 제목을 바꾸고 새로고침해 보세요.
//                    서버를 다시 켜야 하나요? 왜 그럴까요?
//                    (힌트: HTML 은 서버가 켜질 때 읽는 게 아닙니다)
//
// ✏️ 직접 해보기 2 — public 안에 사진.png 를 아무거나 넣고
//                    http://localhost:3000/사진.png 로 열어 보세요.
//                    한글 파일 이름도 되나요?
//
// ✏️ 직접 해보기 3 — express.static 줄을 API 라우트 '아래' 로 옮겨 보세요.
//                    화면이 여전히 나오나요? 무엇이 달라지나요?
//
// ✏️ 직접 해보기 4 — public 안에 api 라는 폴더를 만들고
//                    그 안에 v1/equipments 라는 파일을 만들어 보세요.
//                    이제 GET /api/v1/equipments 는 무엇을 돌려주나요?
//                    (확인 후 지우세요)
//
// ✏️ 직접 해보기 5 — 섹션 5의 위험한 코드를 실제로 만들어 보세요.
//
//       app.get("/files/:name", (req, res) => {
//         res.sendFile(path.join(__dirname, "public", req.params.name));
//       });
//
//     그리고 /files/..%2F..%2Fpackage.json 을 열어 보세요.
//     무엇이 나오나요? (확인 후 반드시 지우세요)
//
// ✏️ 직접 해보기 6 — F12 → Network 에서 공통.css 를 눌러 보세요.
//                    Response Headers 에 Content-Type 이 무엇으로 되어 있나요?
//                    Express 가 어떻게 알았을까요?
//                    (힌트: 파일 확장자를 봅니다)

// ── 자주 하는 실수 ──

// [실수 1] express.static 에 __dirname 을 안 씀
//   터미널 위치에 따라 파일을 못 찾습니다.

// [실수 2] 폴더 이름을 주소에 포함시킴
//   public/index.html 은 /index.html 로 접근합니다. /public/index.html 이 아닙니다.
//   static 에 준 폴더가 '뿌리' 가 됩니다.

// [실수 3] 정적 파일을 직접 sendFile 로 만듦
//   경로 탈출을 막아야 하는데 대부분 빠뜨립니다. express.static 을 쓰세요.

// [실수 4] public 안에 비밀 파일을 둠
//   .env, 설정 파일, 백업 파일이 public 에 있으면 누구나 받아 갑니다.
//   public 은 '전 세계에 공개하는 폴더' 라고 생각하세요.

// [실수 5] 고쳤는데 안 바뀐다고 서버를 다시 켬
//   정적 파일은 요청할 때마다 읽습니다. 서버를 다시 켤 필요가 없습니다.
//   안 바뀌면 브라우저 캐시입니다. Ctrl + Shift + R 을 눌러 보세요.

// [실수 6] API 주소와 파일 이름이 겹침
//   public 에 api 폴더가 있으면 API 라우트가 안 걸립니다.
//   에러도 안 나서 원인을 찾기 어렵습니다.

// ── 정리 ──

// 1. app.use(express.static(폴더)) 한 줄이면 그 폴더의 파일이 그대로 서비스된다.
// 2. 경로는 여기서도 __dirname 기준으로 만든다.
// 3. 폴더 이름은 주소에 안 들어간다. public/a.html 은 /a.html 로 열린다.
// 4. index.html 은 자동이다. / 로 열면 나온다.
// 5. 없는 파일이면 아래로 넘어간다. 그래서 맨 아래의 404 처리기가 받는다.
// 6. 상위 폴더로는 못 나간다. 주소에 ../ 를 넣어도 Express 가 막는다.
// 7. public 안에 비밀 파일을 두지 않는다. 주소만 알면 누구나 받아 간다.
// 8. 고쳤는데 안 바뀌면 서버가 아니라 브라우저 캐시를 먼저 의심한다.
// 9. API 주소와 파일 이름이 겹치지 않게 한다. 먼저 걸리는 쪽이 이긴다.
