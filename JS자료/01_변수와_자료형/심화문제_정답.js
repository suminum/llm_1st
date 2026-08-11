// ============================================================
// 01단원 심화문제 정답
// ------------------------------------------------------------
// 실행: node 심화문제_정답.js
// ============================================================
//
// 답만 보지 말고 '왜 그런지' 를 꼭 읽으세요. 심화문제는 그게 전부입니다.


// ───── 심화 1 ─────
console.log(Number(""));
// 출력: 0
console.log(Number(" "));
// 출력: 0
console.log(Number("12abc"));
// 출력: NaN
console.log(Number(null));
// 출력: 0

// 왜 이렇게 되나
//   Number 는 "이 값 전체가 숫자로 읽히는가" 를 봅니다.
//   빈 문자열과 공백은 "아무것도 없다" 로 보고 0 으로 칩니다.
//   "12abc" 는 뒤에 글자가 붙어 있어서 전체를 숫자로 못 읽습니다 → NaN
//   null 은 "비어 있음" 이라 0 입니다.
//
// 여기서 진짜 위험한 것
//   빈 입력칸에서 값을 받아 Number 로 바꾸면 0 이 됩니다.
//   "아무것도 안 넣었다" 와 "0을 넣었다" 가 구분이 안 됩니다.
//   나중에 입력값을 다룰 때(10단원) 이것 때문에 버그가 납니다.


// ───── 심화 2 ─────
console.log(parseInt(""));
// 출력: NaN
console.log(parseInt(" "));
// 출력: NaN
console.log(parseInt("12abc"));
// 출력: 12
console.log(parseInt(null));
// 출력: NaN

// Number 와 정반대입니다. 네 개 중 네 개가 다 다릅니다.
//
//   Number   : 전체가 숫자여야 한다. 아니면 NaN. 빈 값은 0.
//   parseInt : 앞에서부터 읽히는 만큼만. 하나도 못 읽으면 NaN.
//
// 그래서 쓰는 곳이 다릅니다.
//   "1200"     → 둘 다 1200. 아무거나 써도 됩니다.
//   "30px"     → parseInt 를 써야 30 이 나옵니다. (CSS 값 다룰 때)
//   빈 입력칸   → Number 는 0, parseInt 는 NaN.
//                "안 넣었다" 를 잡아내려면 parseInt 쪽이 낫습니다.


// ───── 심화 3 ─────
console.log(
  Boolean(0),
  Boolean(""),
  Boolean(null),
  Boolean(undefined),
  Boolean(NaN),
  Boolean(false)
);
// 출력: false false false false false false

console.log(Boolean("0"), Boolean(" "), Boolean("false"));
// 출력: true true true

// 왜 아래 셋이 true 인가
//   문자열은 '내용' 을 보지 않습니다. '비어 있는가' 만 봅니다.
//   따옴표 안에 뭐라도 하나 들어 있으면 true 입니다.
//
//   "0"      → 글자 '0' 이 들어 있음  → true
//   " "      → 공백도 글자입니다      → true
//   "false"  → 글자 다섯 개           → true
//
//   빈 문자열 "" 만 false 입니다.
//
// 이게 왜 중요한가
//   나중에 화면 입력칸에서 값을 받으면 전부 문자열로 옵니다. (10단원)
//   사용자가 공백만 눌렀는데 if 가 true 가 되어 통과해 버립니다.
//   그래서 실무에서는 공백을 지운 뒤에 검사합니다. (10단원의 trim)
