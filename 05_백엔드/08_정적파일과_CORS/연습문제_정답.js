// ============================================================
// 08단원 연습문제 정답 (서버 없이 푸는 것)
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
function 출처만(주소) {
  const 분석 = new URL(주소);
  return `${분석.protocol}//${분석.host}`;
}

function 같은출처인가(a, b) {
  try {
    return 출처만(a) === 출처만(b);
  } catch {
    return false; // 주소 모양이 아니면 비교할 수 없습니다
  }
}

console.log(같은출처인가("http://localhost:3000/a", "http://localhost:3000/b?q=1"));
// 출력: true
console.log(같은출처인가("http://localhost:3000", "http://localhost:5500"));
// 출력: false
console.log(같은출처인가("http://localhost:3000", "https://localhost:3000"));
// 출력: false
console.log(같은출처인가("http://localhost:3000", "http://127.0.0.1:3000"));
// 출력: false
console.log(같은출처인가("https://a.com", "https://a.com:443"));
// 출력: true
console.log(같은출처인가("http://a.com", "http://a.com:80"));
// 출력: true
console.log(같은출처인가("http://a.com", "http://a.com:8080"));
// 출력: false
//
// ★ 다섯 번째와 여섯 번째가 재미있습니다.
//   https 의 기본 포트는 443, http 는 80 입니다.
//   기본 포트는 주소에 안 씁니다. URL 이 알아서 떼어 줍니다.
//     new URL("https://a.com:443").host  →  "a.com"
//   그래서 같은 출처입니다.
//
// ★ 네 번째 — localhost 와 127.0.0.1
//   같은 컴퓨터를 가리키지만 글자가 다릅니다. 다른 출처입니다.
//   "분명 같은 곳인데 왜 막히지?" 의 흔한 원인입니다.
//
// ★ protocol 에는 이미 콜론이 붙어 있습니다
//   new URL("http://a.com").protocol  →  "http:"
//   그래서 `${분석.protocol}//` 라고 씁니다. 콜론을 또 붙이면 안 됩니다.


// ───── 문제 2 ─────
const 단순메서드들 = ["GET", "HEAD", "POST"];
const 단순형식들 = [
  "text/plain",
  "multipart/form-data",
  "application/x-www-form-urlencoded",
];
const 그냥붙는헤더들 = ["accept", "accept-language", "content-language", "content-type"];

function 프리플라이트필요한가(요청) {
  if (!단순메서드들.includes(요청.method)) {
    return true; // PATCH · DELETE · PUT
  }

  const 헤더들 = 요청.headers ?? {};

  for (const 이름 of Object.keys(헤더들)) {
    if (!그냥붙는헤더들.includes(이름.toLowerCase())) {
      return true; // Authorization, X-무엇이든
    }
  }

  const 형식 = 헤더들["Content-Type"] ?? 헤더들["content-type"];

  if (형식 && !단순형식들.includes(형식.split(";")[0].trim())) {
    return true; // application/json
  }

  return false;
}

console.log(프리플라이트필요한가({ method: "GET" }));
// 출력: false
console.log(프리플라이트필요한가({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } }));
// 출력: false
console.log(프리플라이트필요한가({ method: "POST", headers: { "Content-Type": "application/json" } }));
// 출력: true
console.log(프리플라이트필요한가({ method: "DELETE" }));
// 출력: true
console.log(프리플라이트필요한가({ method: "GET", headers: { Authorization: "Bearer key-user-1" } }));
// 출력: true
console.log(프리플라이트필요한가({ method: "POST", headers: { "Content-Type": "text/plain; charset=utf-8" } }));
// 출력: false
//
// ★ 세 번째가 우리 API 의 거의 전부입니다.
//   JSON 을 보내는 순간 프리플라이트가 생깁니다.
//   그래서 "GET 은 되는데 POST 만 안 돼요" 가 나오면 OPTIONS 를 의심합니다.
//
// ★ 두 번째와 여섯 번째 — 이건 왜 단순 요청인가
//   HTML 폼(<form>)으로도 보낼 수 있는 요청이기 때문입니다.
//   폼은 CORS 가 생기기 전부터 있었고, 지금도 다른 출처로 보낼 수 있습니다.
//   그래서 "폼으로도 되는 것" 은 미리 물어볼 필요가 없습니다.
//
// ★ 여섯 번째의 charset=utf-8
//   split(";")[0] 로 앞부분만 잘라서 비교했습니다.
//   실제 헤더에는 charset 이 붙어 오는 경우가 많습니다. (04단원 연습문제 10)


// ───── 문제 3 ─────
const 허용목록 = ["http://localhost:5500", "http://localhost:5173"];

function 허용인가(출처) {
  // Postman·curl·같은 출처 요청에는 Origin 이 없습니다. 보통 허용합니다.
  if (출처 === undefined) {
    return true;
  }

  if (허용목록.includes(출처)) {
    return true;
  }

  try {
    const 호스트 = new URL(출처).hostname;
    return 호스트 === "example.com" || 호스트.endsWith(".example.com");
  } catch {
    return false; // 주소 모양이 아니면 거절
  }
}

console.log(허용인가(undefined));
// 출력: true
console.log(허용인가("http://localhost:5500"));
// 출력: true
console.log(허용인가("https://example.com"));
// 출력: true
console.log(허용인가("https://sub.example.com"));
// 출력: true
console.log(허용인가("https://example.com.evil.net"));
// 출력: false
console.log(허용인가("https://evilexample.com"));
// 출력: false
console.log(허용인가("not-a-url"));
// 출력: false
//
// ★★ 다섯 번째가 이 문제의 핵심입니다.
//
//   이렇게 썼다면 통과해 버립니다.
//     출처.includes("example.com")
//
//   공격자가 example.com.evil.net 이라는 도메인을 사면 끝입니다.
//   실제로 있는 공격 방법입니다.
//
// ★ 여섯 번째 — evilexample.com
//   endsWith("example.com") 으로 썼다면 통과합니다.
//   앞에 점을 붙여 ".example.com" 으로 써야 막힙니다.
//
// ★ 왜 hostname 을 꺼내서 비교했나
//   글자 전체를 놓고 비교하면 이런 것들에 뚫립니다.
//     "https://evil.net/?x=https://example.com"
//   URL 로 분석해서 hostname 만 보면 안전합니다.
//   "글자 비교보다 구조로 비교하라" 가 요령입니다.


// ───── 문제 4 ─────
const 에러별처방 = {
  "No 'Access-Control-Allow-Origin' header is present": "Access-Control-Allow-Origin",
  "Response to preflight request doesn't pass access control check": "OPTIONS 응답에도 Access-Control-Allow-Origin",
  "has a value 'http://다른곳' that is not equal to the supplied origin": "허용 목록에 내 출처 추가",
  "Request header field authorization is not allowed": "Access-Control-Allow-Headers",
  "Method DELETE is not allowed": "Access-Control-Allow-Methods",
  "200 인데 headers.get 이 null": "Access-Control-Expose-Headers",
  "must not be the wildcard '*' when the request's credentials mode is 'include'": "Allow-Origin 을 정확한 출처로",
};

for (const 메시지 of Object.keys(에러별처방)) {
  console.log(`${메시지} → ${에러별처방[메시지]}`);
}
// 출력: No 'Access-Control-Allow-Origin' header is present → Access-Control-Allow-Origin
// 출력: Response to preflight request doesn't pass access control check → OPTIONS 응답에도 Access-Control-Allow-Origin
// 출력: has a value 'http://다른곳' that is not equal to the supplied origin → 허용 목록에 내 출처 추가
// 출력: Request header field authorization is not allowed → Access-Control-Allow-Headers
// 출력: Method DELETE is not allowed → Access-Control-Allow-Methods
// 출력: 200 인데 headers.get 이 null → Access-Control-Expose-Headers
// 출력: must not be the wildcard '*' when the request's credentials mode is 'include' → Allow-Origin 을 정확한 출처로
//
// ★ 여섯 번째만 에러가 안 납니다. 그래서 제일 찾기 어렵습니다.
//   "목록은 나오는데 전체 건수만 0 이에요" 라는 증상으로 나타납니다.
//
// ★ 두 번째에 preflight 이라는 단어가 있으면 OPTIONS 문제입니다.
//   같은 "No 'Access-Control-Allow-Origin'" 인데 앞에 붙은 말이 다릅니다.
//   그 차이가 어디를 고칠지를 알려 줍니다.


// ───── 문제 5 ─────
const 상황별헤더 = {
  "공개 자료를 아무나 읽게": "Access-Control-Allow-Origin: *",
  "우리 프론트만 읽게": "Access-Control-Allow-Origin: (그 출처) + Vary: Origin",
  "JSON 을 POST 로 받게": "OPTIONS 에 Allow-Methods, Allow-Headers",
  "Authorization 헤더를 받게": "Access-Control-Allow-Headers: Authorization",
  "X-Total-Count 를 읽게": "Access-Control-Expose-Headers: X-Total-Count",
  "OPTIONS 를 10분간 기억하게": "Access-Control-Max-Age: 600",
  "쿠키를 함께 받게": "Access-Control-Allow-Credentials: true (* 금지)",
};

for (const 상황 of Object.keys(상황별헤더)) {
  console.log(`${상황} → ${상황별헤더[상황]}`);
}
// 출력: 공개 자료를 아무나 읽게 → Access-Control-Allow-Origin: *
// 출력: 우리 프론트만 읽게 → Access-Control-Allow-Origin: (그 출처) + Vary: Origin
// 출력: JSON 을 POST 로 받게 → OPTIONS 에 Allow-Methods, Allow-Headers
// 출력: Authorization 헤더를 받게 → Access-Control-Allow-Headers: Authorization
// 출력: X-Total-Count 를 읽게 → Access-Control-Expose-Headers: X-Total-Count
// 출력: OPTIONS 를 10분간 기억하게 → Access-Control-Max-Age: 600
// 출력: 쿠키를 함께 받게 → Access-Control-Allow-Credentials: true (* 금지)
//
// ★ 두 번째의 Vary: Origin
//   출처마다 응답이 달라지므로, 중간 캐시가 섞어 쓰면 안 된다고 알리는 것입니다.
//   개발 중에는 티가 안 나고 실제 서비스에서 터집니다.
//   cors 패키지는 알아서 붙여 줍니다.


// ───── 문제 6 ─────
// CORS 가 보안이 아닌 이유
//
// 막는 것은 누구인가:
//   브라우저입니다. 서버가 아닙니다.
//   서버는 200 과 데이터를 그대로 보냅니다. Allow-Origin 헤더만 안 붙일 뿐입니다.
//   브라우저가 그 헤더를 보고 "스크립트에게 안 넘겨준다" 고 판단합니다.
//
// 그래서 무엇이 뚫리나:
//   Postman, curl, 다른 서버에서 부르는 요청은 전부 통과합니다.
//   CORS 헤더를 아예 안 봅니다.
//   즉 데이터를 가져가려는 사람은 브라우저를 안 쓰면 그만입니다.
//
// 그럼 CORS 는 무엇을 막나:
//   "다른 사이트가 사용자의 로그인 상태를 이용해서 우리 API 를 부르는 것" 입니다.
//   사용자가 우리 서비스에 로그인해 둔 상태로 나쁜 사이트에 들어갔을 때,
//   그 사이트의 스크립트가 우리 데이터를 읽어 가는 것을 막습니다.
//
// 진짜 보안은 무엇인가:
//   인증입니다. (05단원)
//   증표가 없으면 데이터를 아예 안 주는 것.
//   Postman 으로 불러도 401 이 나와야 진짜 막힌 것입니다.
//
// 한 줄로:
//   CORS 는 '막는 장치' 가 아니라 '허락하는 방법' 입니다.


// ───── 문제 7 ─────
// 프록시가 CORS 를 없애는 이유
//
// 프록시가 없을 때:
//   브라우저 → API 서버 (출처가 다름 → CORS 검사)
//
// 프록시가 있을 때:
//   브라우저 → 프론트 서버 (같은 출처 → 검사 없음)
//   프론트 서버 → API 서버 (서버끼리 → 브라우저가 아님 → 검사 없음)
//
// 핵심:
//   브라우저는 같은 출처와만 이야기합니다. CORS 를 따질 일이 없습니다.
//   API 서버에 요청을 보내는 것은 Node 이지 브라우저가 아닙니다.
//   Node 는 CORS 를 안 따집니다.
//
// 그래서 API 서버는:
//   CORS 를 한 줄도 안 열어도 됩니다.
//
// 주의할 점:
//   프론트에서 주소를 "/api/..." 로만 써야 합니다.
//   "http://localhost:3000/api/..." 라고 전체 주소를 쓰면 프록시를 건너뜁니다.
//
// 배포하면:
//   개발 서버의 프록시는 사라집니다. Nginx 로 같은 구조를 만들거나 CORS 를 엽니다.
//   "개발에서는 됐는데 배포하니 CORS 에러" 의 원인이 이것입니다.


// ───── 문제 8 ─────
// Expose-Headers 함정
//
// 무슨 일이 일어나나:
//   요청은 성공합니다. 상태코드 200 입니다. 에러도 안 납니다.
//   그런데 response.headers.get("X-Total-Count") 가 null 입니다.
//
// 왜 그런가:
//   브라우저가 기본으로 읽게 해 주는 응답 헤더는 일곱 개뿐입니다.
//     Content-Type, Content-Length, Content-Language,
//     Cache-Control, Expires, Last-Modified, Pragma
//   나머지는 서버가 Expose-Headers 로 "이건 읽어도 된다" 고 해야 보입니다.
//
// 왜 특히 위험한가:
//   에러가 안 나기 때문입니다. 콘솔에도 아무것도 안 나옵니다.
//   "목록은 잘 나오는데 전체 건수만 0 이에요" 라는 증상으로 나타납니다.
//   CORS 를 원인으로 의심하는 사람이 거의 없습니다.
//
// 어떻게 고치나:
//   Access-Control-Expose-Headers: X-Total-Count
//   cors 패키지라면 exposedHeaders: ["X-Total-Count"]
//
// 06단원과의 연결:
//   06단원에서 "전체 개수를 헤더로 주는 방법도 있다" 고 하면서
//   "CORS 를 쓰면 헤더를 따로 열어 줘야 한다" 고 적었습니다. 이 이야기입니다.
//   그래서 그 단원에서는 본문의 meta 에 담는 쪽을 골랐습니다.


// ───── 문제 9 ─────
const path = require("path");

const 공개폴더 = path.join(__dirname, "public");

function 파일경로(주소) {
  const 끝난것 = 주소.endsWith("/") ? `${주소}index.html` : 주소;
  return path.join(공개폴더, 끝난것);
}

// 사람마다 절대 경로가 다르니 기준 폴더에서 본 상대 경로로 찍습니다.
function 보기(주소) {
  return path.relative(공개폴더, 파일경로(주소)).split(path.sep).join("/");
}

console.log(보기("/"));
// 출력: index.html
console.log(보기("/index.html"));
// 출력: index.html
console.log(보기("/css/공통.css"));
// 출력: css/공통.css
console.log(보기("/img/"));
// 출력: img/index.html

// 해설 ① path.join 은 구분자를 알아서 붙이고 ../ 도 정리해 줍니다.
//        직접 문자열을 이어 붙이면 // 나 \ 가 섞여서 윈도우에서 깨집니다.
// 해설 ② __dirname 을 기준으로 잡는 것이 핵심입니다.
//        안 쓰면 'node 를 어디서 쳤느냐' 에 따라 public 을 못 찾습니다.
// 해설 ③ express.static 도 속으로 이 일을 합니다. 다만 없는 파일이면
//        에러를 내지 않고 다음 미들웨어로 넘깁니다(개념01 섹션3).


// ───── 문제 10 ─────
function 안전한가(주소) {
  const 경로 = 파일경로(주소);

  // ★ 구분자까지 붙여서 봅니다.
  //   이게 없으면 public2 같은 이름이 통과합니다.
  return 경로.startsWith(공개폴더 + path.sep);
}

console.log(안전한가("/index.html"));
// 출력: true
console.log(안전한가("/css/../index.html"));
// 출력: true
console.log(안전한가("/../비밀.txt"));
// 출력: false
console.log(안전한가("/../../etc/passwd"));
// 출력: false

// 해설 ① path.join 이 ../ 를 미리 정리하기 때문에
//        "/css/../index.html" 은 public/index.html 이 되어 통과합니다.
//        정리 전 글자로 판단하면 이 정상적인 주소까지 막게 됩니다.
// 해설 ② 반대로 "/../비밀.txt" 는 public 밖으로 나가므로 걸립니다.
// 해설 ③ path.sep 를 안 붙이면 C:\...\public2\비밀.txt 도 startsWith 를 통과합니다.
//        09단원 개념04에서 업로드 파일을 내줄 때 같은 검사를 씁니다.
// 해설 ④ express.static 은 이 검사를 이미 하고 있습니다(개념01 섹션5).
//        직접 sendFile 로 만들 때만 내가 해야 합니다.


// ───── 문제 11 ─────
function 먼저걸리는것(등록들, 주소) {
  const 걸린것 = 등록들.find((하나) => 주소.startsWith(하나.접두));
  return 걸린것 ? 걸린것.이름 : "없음";
}

const 등록들 = [
  { 이름: "정적파일", 접두: "/" },
  { 이름: "API", 접두: "/api" },
];

console.log(먼저걸리는것(등록들, "/api/v1/equipments"));
// 출력: 정적파일
console.log(먼저걸리는것(등록들.slice().reverse(), "/api/v1/equipments"));
// 출력: API

// 해설 ① 정적 파일을 위에 두면 "/" 로 시작하는 모든 주소가 거기 먼저 걸립니다.
//        public 안에 api 폴더가 없으면 파일을 못 찾아 다음으로 넘어가므로
//        평소에는 아무 문제가 없어 보입니다.
// 해설 ② 그런데 public 안에 api 라는 폴더가 생기는 순간
//        API 요청이 그 폴더의 파일로 응답됩니다. 에러는 안 납니다.
//        "어제까지 되던 API 가 갑자기 HTML 을 돌려준다" 가 이 사고의 증상입니다.
// 해설 ③ 그래서 API 라우트를 정적 파일보다 위에 둡니다.
//        아니면 정적 파일에 접두를 줍니다 — app.use("/static", express.static(...)).


// ───── 문제 12 ─────
//
// 고른 것:
//   ② .env, ④ 회원 명단 엑셀, ⑥ 백업.sql
//   ③ 관리자 화면 html 은 조건부입니다(아래).
//
// 왜 안 되나:
//   public 안의 파일은 주소만 알면 누구나 받아 갑니다. 서버가 아무것도 안 물어봅니다.
//
// ③ 관리자 화면은 왜 애매한가:
//   화면 파일 자체는 껍데기라 공개돼도 큰일은 아닙니다.
//   진짜 방어는 그 화면이 부르는 API 에 인증을 거는 것입니다(05단원).
//   화면을 숨겨서 지키려는 것을 '숨김으로 지키기' 라고 하는데, 지키는 것이 아닙니다.
//   다만 관리자용 주소 구조가 통째로 드러나므로 공개 폴더 밖에 두는 편이 낫습니다.
//
// "주소를 아무도 모르니 괜찮다" 가 왜 안 통하나:
//   · 브라우저 주소창 자동완성·확장 프로그램·회사 프록시에 기록이 남습니다.
//   · 화면 코드에 그 주소가 적혀 있으면 F12 로 그냥 보입니다.
//   · 검색 로봇이 링크를 타고 들어와 색인해 버리는 일이 실제로 있습니다.
//   막고 싶으면 '못 찾게' 가 아니라 '물어보게' 만들어야 합니다. 그게 인증입니다.
