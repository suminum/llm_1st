// ============================================================
// 03단원 연습문제 정답
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요. 설명을 꼭 읽으세요.


// ───── 문제 1 ─────
const 주소글자 = "http://localhost:3000/api/documents?page=2&size=10";
const 주소 = new URL(주소글자);

console.log(주소.pathname);
// 출력: /api/documents
console.log(주소.host);
// 출력: localhost:3000
console.log(주소.port);
// 출력: 3000
console.log(typeof 주소.port);
// 출력: string
//
// port 가 문자열인 것에 주의하세요. URL 에서 나오는 것은 거의 다 글자입니다.
// host 는 포트를 포함하고, hostname 은 포함하지 않습니다.
//   주소.host     → localhost:3000
//   주소.hostname → localhost


// ───── 문제 2 ─────
console.log(주소.searchParams.get("page"));
// 출력: 2
console.log(주소.searchParams.get("sort"));
// 출력: null
console.log(주소.searchParams.has("sort"));
// 출력: false
//
// 없는 쿼리는 null 입니다. undefined 가 아닙니다.
// "있는지 없는지" 만 알고 싶으면 has 가 더 분명합니다.
//
// 위의 2 는 숫자가 아니라 글자 "2" 입니다.
// console.log 는 글자를 찍을 때 따옴표를 안 붙여서 똑같아 보입니다.
// 배열 안에 넣어서 찍어 보면 구별됩니다. console.log([주소.searchParams.get("page")])


// ───── 문제 3 ─────
function 페이지번호(주소) {
  const 값 = 주소.searchParams.get("page");
  const 번호 = Number(값);

  if (!Number.isInteger(번호) || 번호 < 1) {
    return 1; // 이상하면 그냥 1쪽으로
  }
  return 번호;
}

console.log(페이지번호(new URL("http://localhost:3000/x?page=3")));
// 출력: 3
console.log(페이지번호(new URL("http://localhost:3000/x")));
// 출력: 1
console.log(페이지번호(new URL("http://localhost:3000/x?page=abc")));
// 출력: 1
console.log(페이지번호(new URL("http://localhost:3000/x?page=0")));
// 출력: 1
//
// ★ 여기 함정이 하나 있습니다.
//   page 가 없으면 get 은 null 을 줍니다. 그런데 Number(null) 은 0 입니다.
//   NaN 이 아닙니다! 그래서 Number.isInteger(0) 은 true 가 되어 통과해 버립니다.
//
//   막아 주는 것은 뒤의 `번호 < 1` 조건입니다. 이게 없으면 0쪽을 보여 주려다
//   목록이 텅 비는 버그가 납니다. 실제로 아주 흔한 버그입니다.
//
//   Number("")   → 0     (빈 글자도 0입니다)
//   Number(null) → 0
//   Number("abc")→ NaN
//   Number(undefined) → NaN
//
//   "숫자로 바꿨으니 됐다" 가 아니라 "범위까지 확인했다" 여야 안전합니다.


// ───── 문제 4 ─────
const 주소4 = new URL("http://localhost:3000/search?tag=안전&tag=품질&q=점검");

console.log(주소4.searchParams.get("tag"));
// 출력: 안전
console.log(주소4.searchParams.getAll("tag"));
// 출력: [ '안전', '품질' ]
console.log(주소4.searchParams.getAll("없는것"));
// 출력: []
//
// 같은 이름이 여러 번 올 수 있습니다. 체크박스를 여러 개 고른 경우입니다.
//   get    → 첫 번째 하나만
//   getAll → 전부 배열로. 없으면 빈 배열 (null 이 아닙니다)
//
// 여러 개가 올 수 있는 값이라면 처음부터 getAll 을 쓰세요.
// get 만 쓰면 두 번째부터 조용히 사라져서 원인을 찾기 아주 어렵습니다.


// ───── 문제 5 ─────
const 상황별코드 = {
  "목록을 잘 돌려줌": 200,
  "새 문서를 만듦": 201,
  "지웠고 돌려줄 내용이 없음": 204,
  "title 을 안 보냄": 400,
  "로그인을 안 함": 401,
  "로그인은 했지만 권한이 없음": 403,
  "그 번호의 문서가 없음": 404,
  "내 코드에서 TypeError 가 남": 500,
};

for (const 상황 of Object.keys(상황별코드)) {
  console.log(`${상황} → ${상황별코드[상황]}`);
}
// 출력: 목록을 잘 돌려줌 → 200
// 출력: 새 문서를 만듦 → 201
// 출력: 지웠고 돌려줄 내용이 없음 → 204
// 출력: title 을 안 보냄 → 400
// 출력: 로그인을 안 함 → 401
// 출력: 로그인은 했지만 권한이 없음 → 403
// 출력: 그 번호의 문서가 없음 → 404
// 출력: 내 코드에서 TypeError 가 남 → 500
//
// 헷갈리기 쉬운 두 쌍만 다시 봅니다.
//
//   401 vs 403
//     401 = 너 누구니? (증표를 안 냈다)
//     403 = 누군지는 알겠는데, 너는 안 된다 (권한이 없다)
//
//   400 vs 500
//     400 = 네가 잘못 보냈다
//     500 = 내가 잘못 짰다
//     이걸 바꿔 쓰면 상대가 원인을 엉뚱한 데서 찾습니다.


// ───── 문제 6 ─────
function 분류(코드) {
  if (코드 >= 200 && 코드 < 300) return "성공";
  if (코드 >= 300 && 코드 < 400) return "다른 곳으로";
  if (코드 >= 400 && 코드 < 500) return "보낸 쪽 잘못";
  if (코드 >= 500) return "서버 잘못";
  return "알 수 없음";
}

console.log([200, 204, 301, 404, 500].map(분류).join(" / "));
// 출력: 성공 / 성공 / 다른 곳으로 / 보낸 쪽 잘못 / 서버 잘못
//
// 첫 자리 숫자만 보면 됩니다. 2로 시작하면 성공, 4면 보낸 쪽, 5면 서버.
// 세 자리를 다 외울 필요 없습니다. 자주 쓰는 여덟 개만 알면 충분합니다.


// ───── 문제 7 ─────
function 조각내기(경로) {
  return 경로.split("/").filter(Boolean);
}

console.log(조각내기("/documents"));
// 출력: [ 'documents' ]
console.log(조각내기("/documents/12"));
// 출력: [ 'documents', '12' ]
console.log(조각내기("/documents/12/files"));
// 출력: [ 'documents', '12', 'files' ]
console.log(조각내기("/"));
// 출력: []
//
// filter(Boolean) 이 없으면 맨 앞에 빈 글자가 들어옵니다.
//   "/documents".split("/")  →  [ '', 'documents' ]
//
// Boolean 을 넘긴다는 게 이상해 보이면 이렇게 읽으세요.
//   filter((조각) => Boolean(조각))   ← 빈 글자는 false 라서 버려집니다
// 짧게 쓴 것뿐입니다. (JS자료 08단원)


// ───── 문제 8 ─────
function 경로분석(경로) {
  const 조각 = 경로.split("/").filter(Boolean);

  return {
    resource: 조각[0] ?? null,
    id: 조각[1] ? Number(조각[1]) : null,
  };
}

console.log(경로분석("/documents"));
// 출력: { resource: 'documents', id: null }
console.log(경로분석("/documents/12"));
// 출력: { resource: 'documents', id: 12 }
console.log(경로분석("/"));
// 출력: { resource: null, id: null }
//
// id 가 12 (따옴표 없음) 인 것을 보세요. Number 로 바꿨기 때문입니다.
// resource 는 'documents' (따옴표 있음) 라 글자입니다.
// 콘솔에서 따옴표만 봐도 글자인지 숫자인지 알 수 있습니다.
//
// ★ 속성 이름을 왜 영어로 썼나
//   node 는 객체를 찍을 때 한글 속성 이름에 따옴표를 붙입니다.
//     { '자원': 'documents' }
//   틀린 건 아니지만 지저분해 보여서, 객체 키는 영어로 쓰는 편이 낫습니다.
//   실무에서도 키는 영어로 씁니다. 프론트와 주고받는 이름이니까요.
//
// ★ 04단원에서 Express 를 쓰면 이 함수가 통째로 사라집니다.
//   app.get("/documents/:id", ...) 라고만 쓰면 알아서 꺼내 줍니다.


// ───── 문제 9 ─────
const headers = {
  host: "localhost:3000",
  "content-type": "application/json; charset=utf-8",
  "user-agent": "PostmanRuntime/7.36.0",
};

console.log(headers["Content-Type"]);
// 출력: undefined
console.log(headers["content-type"]);
// 출력: application/json; charset=utf-8

function 헤더값(headers, 이름) {
  return headers[이름.toLowerCase()];
}

console.log(헤더값(headers, "Content-Type"));
// 출력: application/json; charset=utf-8
console.log(헤더값(headers, "USER-AGENT"));
// 출력: PostmanRuntime/7.36.0
//
// Node 는 받은 헤더 이름을 전부 소문자로 바꿔서 담습니다.
// 브라우저가 Content-Type 이라고 보내도 content-type 으로 들어옵니다.
//
// 헤더가 undefined 로 나오면 없는 게 아니라 이름을 잘못 찾은 것일 수 있습니다.
// 무엇이 들어왔는지 통째로 찍어 보는 게 가장 빠릅니다.
//   console.log(req.headers)


// ───── 문제 10 ─────
function JSON본문인가(headers) {
  const 형식 = headers["content-type"] || "";
  return 형식.includes("application/json");
}

console.log(JSON본문인가({ "content-type": "application/json; charset=utf-8" }));
// 출력: true
console.log(JSON본문인가({ "content-type": "application/json" }));
// 출력: true
console.log(JSON본문인가({ "content-type": "text/plain" }));
// 출력: false
console.log(JSON본문인가({}));
// 출력: false
//
// ★ === 로 비교하면 안 되는 이유
//   실제로 오는 값은 "application/json; charset=utf-8" 인 경우가 많습니다.
//   === "application/json" 은 여기서 false 가 됩니다.
//   includes 로 "들어 있나" 를 봐야 합니다.
//
// ★ || "" 를 붙인 이유
//   헤더가 아예 없으면 undefined 입니다.
//   undefined.includes(...) 는 TypeError 로 서버를 죽입니다.
//   빈 글자로 바꿔 두면 그냥 false 가 나옵니다.


// ───── 문제 11 ─────
function 빠진값찾기(데이터, 필수들) {
  return 필수들.filter((키) => !데이터[키]);
}

console.log(빠진값찾기({ title: "작업표준서" }, ["title", "type", "author"]));
// 출력: [ 'type', 'author' ]
console.log(빠진값찾기({ title: "a", type: "b", author: "c" }, ["title", "type", "author"]));
// 출력: []

const 빠진것 = 빠진값찾기({ title: "작업표준서" }, ["title", "type"]);

if (빠진것.length === 0) {
  console.log(201);
} else {
  console.log(`400 ${빠진것.join(", ")} 을(를) 넣어 주세요`);
}
// 출력: 400 type 을(를) 넣어 주세요
//
// ★ 왜 "첫 번째로 빠진 것" 이 아니라 전부 모으나
//   하나씩 알려 주면 사용자가 고치고 → 또 틀리고 → 또 고치고를 반복합니다.
//   빠진 것을 한 번에 다 알려 주는 게 훨씬 친절합니다.
//
// ★ !데이터[키] 의 한계
//   숫자 0 이나 빈 글자 "" 를 '안 보낸 것' 으로 봅니다.
//   수량: 0 을 보냈는데 "수량을 넣어 주세요" 가 나오면 이것 때문입니다.
//   정확히 하려면 데이터[키] === undefined 로 봐야 합니다.
//   지금은 title 같은 글자만 다루니 이대로 두고, 함정만 기억해 두세요.


// ───── 문제 12 ─────
const 고친주소 = [
  "GET /documents",
  "POST /documents",
  "GET /documents/3",
  "DELETE /documents/3",
  "GET /documents?type=표준",
];

for (const 줄 of 고친주소) {
  console.log(줄);
}
// 출력: GET /documents
// 출력: POST /documents
// 출력: GET /documents/3
// 출력: DELETE /documents/3
// 출력: GET /documents?type=표준
//
// 규칙 세 가지만 지키면 됩니다.
//
//   ① 주소에는 동사를 쓰지 않습니다
//      무엇을 할지는 메서드가 말합니다. 주소는 '무엇을' 만 말합니다.
//      /getDocuments  ✗      GET /documents   ○
//
//   ② 자원 이름은 복수형 명사입니다
//      /document ✗   /documents ○
//      한 개를 가리킬 때도 /documents/3 입니다. /document/3 이 아닙니다.
//
//   ③ 하나를 콕 집을 때는 경로, 걸러 볼 때는 쿼리입니다
//      /documents/3          3번 문서 하나 (없으면 404)
//      /documents?type=표준   조건에 맞는 것들 (없으면 200 + [])
//
// 이 규칙을 따르는 주소 설계를 REST 라고 부릅니다. 06단원에서 자세히 봅니다.
// 지금은 "동사 쓰지 말자" 하나만 기억해도 충분합니다.


// ───── 문제 13 ─────
// const 나쁜주소 = new URL("/documents?page=2");
// console.log(나쁜주소.pathname);
//
// 에러: TypeError: Invalid URL
//
// 왜:
//   URL 은 '완전한 주소' 를 요구합니다.
//   /documents 만으로는 어느 컴퓨터의 어느 포트인지 알 수가 없습니다.
//   http:// 로 시작하는 앞부분이 반드시 있어야 합니다.
//
// 어떻게 고치나:
//   두 번째 인자로 '기준 주소' 를 주면 됩니다.
//
//     new URL("/documents?page=2", "http://localhost:3000")
//
//   서버에서는 req.url 이 항상 /documents 같은 반쪽짜리로 옵니다.
//   그래서 개념03·04·05 에서 늘 이렇게 썼습니다.
//
//     new URL(req.url, `http://${req.headers.host}`)
//
//   host 헤더에는 브라우저가 접속한 주소가 들어 있습니다.
//   localhost:3000 이든 회사 서버 주소든 알아서 맞춰집니다.

const 고친주소13 = new URL("/documents?page=2", "http://localhost:3000");
console.log(고친주소13.pathname);
// 출력: /documents
console.log(고친주소13.href);
// 출력: http://localhost:3000/documents?page=2
