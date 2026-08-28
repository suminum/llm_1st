// ============================================================
// 08단원 연습문제 — 정적 파일과 CORS
// ------------------------------------------------------------
// 실행: node 연습문제.js
// ============================================================
//
// 서버 없이 푸는 문제들입니다.
// 여기서 만든 함수를 연습문제_서버.js 에서 그대로 씁니다.


// ───── 문제 1 ───── 같은 출처인가
// 두 주소가 같은 출처인지 판단하는 함수 같은출처인가(a, b) 를 만드세요.
//
// 출처 = 프로토콜 + 호스트 + 포트. 경로와 쿼리는 상관없습니다.
//
// 힌트: new URL(주소) 로 분석하고 `${분석.protocol}//${분석.host}` 를 비교합니다.
//       protocol 에는 이미 콜론이 붙어 있습니다. ("http:")
//       host 에는 포트가 포함되고, hostname 에는 안 됩니다.
//       주소 모양이 아니면 URL 이 TypeError 를 던집니다. try/catch 로 false 를 주세요.
//
// 시험할 것 (이 순서로)
//   ("http://localhost:3000/a", "http://localhost:3000/b?q=1")
//   ("http://localhost:3000", "http://localhost:5500")
//   ("http://localhost:3000", "https://localhost:3000")
//   ("http://localhost:3000", "http://127.0.0.1:3000")
//   ("https://a.com", "https://a.com:443")
//   ("http://a.com", "http://a.com:80")
//   ("http://a.com", "http://a.com:8080")

// 기대 출력:
// true
// false
// false
// false
// true
// true
// false
//
// ★ 다섯 번째와 여섯 번째가 true 인 이유를 설명할 수 있어야 합니다.
// ★ 네 번째가 false 인 것도요. 같은 컴퓨터인데 왜 다를까요?

// TODO: 여기에 코드를 쓰세요


// ───── 문제 2 ───── 프리플라이트가 필요한가
// 요청을 받아 프리플라이트(OPTIONS)가 생기는지 판단하는 함수를 만드세요.
//
// 프리플라이트가 '없는' 조건 (전부 만족해야 함)
//   · 메서드가 GET · HEAD · POST 중 하나
//   · 직접 붙인 헤더가 없음
//     (그냥 붙는 헤더: accept, accept-language, content-language, content-type)
//   · Content-Type 이 text/plain · multipart/form-data ·
//     application/x-www-form-urlencoded 중 하나
//
// 힌트: Content-Type 에 charset 이 붙어 올 수 있습니다.
//       split(";")[0].trim() 으로 앞부분만 비교하세요.
//
// 시험할 것 (이 순서로)
//   { method: "GET" }
//   { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//   { method: "POST", headers: { "Content-Type": "application/json" } }
//   { method: "DELETE" }
//   { method: "GET", headers: { Authorization: "Bearer key-user-1" } }
//   { method: "POST", headers: { "Content-Type": "text/plain; charset=utf-8" } }

// 기대 출력:
// false
// false
// true
// true
// true
// false
//
// ★ 세 번째가 우리 API 의 거의 전부입니다.
//   "GET 은 되는데 POST 만 안 돼요" 가 왜 생기는지 설명해 보세요.
//
// ★ 두 번째와 여섯 번째는 왜 '단순 요청' 일까요?
//   (힌트: HTML 폼으로도 보낼 수 있는 요청인가요?)

// TODO: 여기에 코드를 쓰세요


// ───── 문제 3 ───── 허용할 출처인가
// 출처를 받아 허락할지 판단하는 함수 허용인가(출처) 를 만드세요.
//
//   Origin 이 없으면(undefined)     허용 (Postman·curl·같은 출처)
//   허용목록에 있으면               허용
//   호스트가 example.com 이거나
//   .example.com 으로 끝나면        허용
//   그 밖                           거절
//
// 허용목록: ["http://localhost:5500", "http://localhost:5173"]
//
// ★★ 글자로 비교하지 마세요.
//   출처.includes("example.com") 으로 쓰면
//   "https://example.com.evil.net" 이 통과합니다. 공격자가 이런 도메인을 삽니다.
//
//   new URL(출처).hostname 을 꺼내서 비교하세요.
//
// 시험할 것 (이 순서로)
//   undefined
//   "http://localhost:5500"
//   "https://example.com"
//   "https://sub.example.com"
//   "https://example.com.evil.net"
//   "https://evilexample.com"
//   "not-a-url"

// 기대 출력:
// true
// true
// true
// true
// false
// false
// false
//
// ★ 여섯 번째 — endsWith("example.com") 이라고 썼다면 통과합니다.
//   앞에 점을 붙여야 하는 이유입니다.

// TODO: 여기에 코드를 쓰세요


// ───── 문제 4 ───── 에러 메시지 → 고칠 헤더
// 아래 일곱 가지 상황에 어떤 헤더를 고쳐야 할까요? 짝지어 출력하세요.

// 기대 출력:
// No 'Access-Control-Allow-Origin' header is present → Access-Control-Allow-Origin
// Response to preflight request doesn't pass access control check → OPTIONS 응답에도 Access-Control-Allow-Origin
// has a value 'http://다른곳' that is not equal to the supplied origin → 허용 목록에 내 출처 추가
// Request header field authorization is not allowed → Access-Control-Allow-Headers
// Method DELETE is not allowed → Access-Control-Allow-Methods
// 200 인데 headers.get 이 null → Access-Control-Expose-Headers
// must not be the wildcard '*' when the request's credentials mode is 'include' → Allow-Origin 을 정확한 출처로
//
// ★ 여섯 번째만 에러가 안 납니다. 왜 그게 더 위험한지 생각해 보세요.
// ★ 두 번째에 preflight 이라는 단어가 있으면 어디를 봐야 하나요?

// TODO: 여기에 코드를 쓰세요


// ───── 문제 5 ───── 상황별로 어떤 헤더가 필요한가
// 일곱 가지 상황에 필요한 헤더를 짝지어 출력하세요.

// 기대 출력:
// 공개 자료를 아무나 읽게 → Access-Control-Allow-Origin: *
// 우리 프론트만 읽게 → Access-Control-Allow-Origin: (그 출처) + Vary: Origin
// JSON 을 POST 로 받게 → OPTIONS 에 Allow-Methods, Allow-Headers
// Authorization 헤더를 받게 → Access-Control-Allow-Headers: Authorization
// X-Total-Count 를 읽게 → Access-Control-Expose-Headers: X-Total-Count
// OPTIONS 를 10분간 기억하게 → Access-Control-Max-Age: 600
// 쿠키를 함께 받게 → Access-Control-Allow-Credentials: true (* 금지)

// TODO: 여기에 코드를 쓰세요


// ───── 문제 6 ───── CORS 는 왜 보안이 아닌가
// 막는 것은 누구인가:
//   __________________________________________
//
// 서버는 무엇을 하나 (데이터를 안 주나?):
//   __________________________________________
//
// 그래서 무엇이 뚫리나:
//   __________________________________________
//
// 그럼 CORS 는 무엇을 막나:
//   __________________________________________
//
// 진짜 보안은 무엇인가:
//   __________________________________________
//
// 한 줄로 정리하면:
//   __________________________________________


// ───── 문제 7 ───── 프록시가 CORS 를 없애는 이유
// 프록시가 없을 때 브라우저는 누구와 이야기하나:
//   __________________________________________
//
// 프록시가 있을 때는:
//   __________________________________________
//
// API 서버에 요청을 보내는 것은 누구인가:
//   __________________________________________
//
// 그래서 API 서버는 CORS 를 열어야 하나:
//   __________________________________________
//
// 프론트에서 주소를 어떻게 써야 하나, 왜:
//   __________________________________________
//
// 배포하면 무엇이 달라지나:
//   __________________________________________


// ───── 문제 8 ───── Expose-Headers 함정
// 무슨 일이 일어나나 (상태코드와 에러 여부를 포함해서):
//   __________________________________________
//
// 왜 그런가:
//   __________________________________________
//
// 왜 특히 위험한가:
//   __________________________________________
//
// 화면에는 어떤 증상으로 나타나나:
//   __________________________________________
//
// 어떻게 고치나:
//   __________________________________________
//
// 06단원에서 이 이야기가 이미 나왔습니다. 어디였나요:
//   __________________________________________


// ───── 문제 9 ───── 주소를 파일 경로로 바꾸기
// express.static 이 속으로 하는 일을 손으로 해 봅니다.
// 주소를 받아 public 안의 파일 경로를 돌려주는 파일경로(주소) 를 만드세요.
//
//   · 기준 폴더는 path.join(__dirname, "public") 입니다.
//   · 주소가 "/" 이거나 "/" 로 끝나면 index.html 을 붙입니다.
//   · 결과는 기준 폴더에서 본 '상대 경로' 로 출력하세요.
//     절대 경로는 사람마다 다르니 path.relative 로 찍습니다.
//
// 힌트: path.join(공개폴더, 주소) · path.relative(공개폴더, 만든경로)
//       윈도우는 폴더 구분자가 다르니 .split(path.sep).join("/") 로 맞춰서 찍으세요.
//
// 시험할 것 (이 순서로)
//   "/"   "/index.html"   "/css/공통.css"   "/img/"
//
// 기대 출력:
// index.html
// index.html
// css/공통.css
// img/index.html

// TODO: 여기에 코드를 쓰세요


// ───── 문제 10 ───── 상위 폴더로 못 나가게 막기
// 문제 9로 만든 경로가 정말 public 안인지 보는 안전한가(주소) 를 만드세요.
//
// ★ startsWith 로 볼 때 폴더 구분자까지 붙여서 봐야 합니다(개념04 실수 6).
//   그냥 startsWith(공개폴더) 로 보면 public2 같은 이름이 통과합니다.
//
// 힌트: path.join 은 ../ 를 알아서 정리해 줍니다.
//       그래서 "/css/../index.html" 은 안쪽으로 정리되어 통과해야 맞습니다.
//
// 시험할 것 (이 순서로)
//   "/index.html"   "/css/../index.html"   "/../비밀.txt"   "/../../etc/passwd"
//
// 기대 출력:
// true
// true
// false
// false

// TODO: 여기에 코드를 쓰세요


// ───── 문제 11 ───── 먼저 걸리는 쪽이 이긴다
// Express 는 등록한 순서대로 찾습니다. 그래서 정적 파일과 API 주소가 겹치면
// 먼저 등록한 쪽이 이깁니다. 그걸 흉내 내 보세요.
//
// 등록 하나는 { 이름, 접두 } 모양이고, 주소가 접두로 시작하면 걸립니다.
// 먼저걸리는것(등록들, 주소) 를 만들어 걸린 것의 이름을 돌려주세요.
//
//   const 등록들 = [
//     { 이름: "정적파일", 접두: "/" },
//     { 이름: "API", 접두: "/api" },
//   ];
//
// 시험할 것 (이 순서로)
//   먼저걸리는것(등록들, "/api/v1/equipments")
//   먼저걸리는것(등록들.slice().reverse(), "/api/v1/equipments")
//
// 기대 출력:
// 정적파일
// API
//
// ★ 첫 줄이 왜 사고인지 생각해 보세요.
//   public 안에 실수로 api 라는 폴더가 생기면 무슨 일이 일어날까요?
//   에러가 나나요, 조용히 이상해지나요?

// TODO: 여기에 코드를 쓰세요


// ───── 문제 12 ───── public 에 두면 안 되는 것
// 아래 중 public 폴더에 두면 안 되는 것을 전부 고르고 이유를 쓰세요.
//
//   ① 로고 이미지   ② .env   ③ 관리자 화면 html
//   ④ 회원 명단 엑셀   ⑤ 공통.css   ⑥ 아직 안 쓰는 백업.sql
//
// 고른 것:
//   __________________________________________
//
// 왜 안 되나 (한 문장으로):
//   __________________________________________
//
// ③ 관리자 화면은 왜 애매한가:
//   __________________________________________
//
// "주소를 아무도 모르니 괜찮다" 는 왜 안 통하나:
//   __________________________________________
