// ============================================================
// 01단원 · 개념 05 — 형변환: 자료형 바꾸기
// ------------------------------------------------------------
// 실행: node 개념05_형변환.js
// ============================================================
//
// 개념03에서 이런 문제를 봤습니다.
//
//     "100" + 50   →   "10050"     (더하기가 아니라 이어붙이기)
//
// 화면 입력창에서 받아온 값은 숫자를 입력해도 전부 문자열로 옵니다.
// 그래서 계산하기 전에 '숫자로 바꾸는' 작업이 반드시 필요합니다.
// 자료형을 바꾸는 것을 형변환이라고 합니다.


// ── 섹션 1: 문자열 → 숫자 : Number( ) ──

const inputValue = "100"; // 입력창에서 받아온 값이라고 생각하세요
console.log(inputValue + 50);
// 출력: 10050
// 원하는 결과가 아닙니다.

// Number( ) 로 감싸면 숫자로 바뀝니다.
const numberValue = Number(inputValue);
console.log(numberValue, typeof numberValue);
// 출력: 100 number

console.log(numberValue + 50);
// 출력: 150
// 이제 제대로 더해집니다.

// 소수도 됩니다.
console.log(Number("3.14"));
// 출력: 3.14

// 앞뒤 공백은 알아서 무시합니다.
console.log(Number("  42  "));
// 출력: 42

// 빈 문자열은 0 이 됩니다. (직관적이지 않으니 기억해 두세요)
console.log(Number(""));
// 출력: 0

// ✏️ 직접 해보기 1 — "250" 을 숫자로 바꿔서 100 을 더한 결과를 출력해 보세요.


// ── 섹션 2: 숫자로 못 바꾸면 NaN ──

// 숫자가 아닌 글자가 섞여 있으면 NaN 이 나옵니다.
console.log(Number("1200원"));
// 출력: NaN

console.log(Number("안녕"));
// 출력: NaN

// NaN 은 Not a Number, "숫자가 아님"의 줄임말입니다.
// 그런데 자료형은 number 입니다. "고장 난 숫자"라고 생각하세요.
console.log(typeof NaN);
// 출력: number

// NaN 이 섞이면 그다음 계산도 전부 NaN 이 됩니다.
console.log(Number("1200원") + 500);
// 출력: NaN

// [함정] NaN 은 자기 자신과도 같지 않습니다.
console.log(NaN === NaN);
// 출력: false

// 그래서 NaN 인지 확인할 때는 === 가 아니라 Number.isNaN( ) 을 씁니다.
console.log(Number.isNaN(Number("안녕")));
// 출력: true

// 결과에 NaN 이 찍히면 "숫자로 못 바꾸는 값이 들어왔구나" 하고
// 그 값을 거슬러 올라가면서 찾으면 됩니다.

// ✏️ 직접 해보기 2 — "3개" 를 Number 로 바꿔서 출력하고, 결과가 왜 그런지 생각해 보세요.


// ── 섹션 3: parseInt / parseFloat — 앞에서부터 읽히는 만큼만 ──

// Number 는 조금이라도 이상하면 NaN 이지만,
// parseInt 는 앞에서부터 읽을 수 있는 숫자까지만 가져옵니다.
console.log(parseInt("1200원"));
// 출력: 1200

console.log(parseInt("30px"));
// 출력: 30

// 단, 앞부터 숫자가 아니면 이것도 NaN 입니다.
console.log(parseInt("원1200"));
// 출력: NaN

// parseInt 는 정수만 가져옵니다. 소수점 아래는 버립니다.
console.log(parseInt("3.9"));
// 출력: 3

// 소수까지 살리려면 parseFloat 를 씁니다.
console.log(parseFloat("3.9"));
// 출력: 3.9

// 정리하면 이렇습니다.
//   Number     : 값 전체가 깔끔한 숫자일 때 (입력창 값 대부분)
//   parseInt   : "30px" 처럼 단위가 붙어 있을 때
//   parseFloat : 위와 같은데 소수점까지 필요할 때

// ✏️ 직접 해보기 3 — "24.5도" 에서 24.5 만 뽑아서 출력해 보세요.


// ── 섹션 4: 숫자 → 문자열 : String( ) ──

const score = 95;
const scoreText = String(score);

console.log(scoreText, typeof scoreText);
// 출력: 95 string

// .toString( ) 을 붙여도 같습니다.
console.log((95).toString(), typeof (95).toString());
// 출력: 95 string

// 문자열이 되면 .length 를 쓸 수 있습니다. 자릿수 세기에 씁니다.
console.log(String(12345).length);
// 출력: 5

// 숫자를 문자열로 바꿔야 하는 경우는 사실 드뭅니다.
// + 로 이어붙일 때 자동으로 바뀌기 때문입니다. (다음 섹션)

// ✏️ 직접 해보기 4 — 1234567 이 몇 자리 숫자인지 출력해 보세요.


// ── 섹션 5: 자동 형변환 — 컴퓨터가 알아서 바꿔 버린다 ──

// 우리가 시키지 않아도 자바스크립트가 알아서 형을 바꿀 때가 있습니다.
// 편할 때도 있지만 버그의 단골 원인입니다.

// [규칙 1] + 는 한쪽이라도 문자열이면 '이어붙이기'가 된다
console.log(1 + "2");
// 출력: 12
console.log("가격: " + 1200);
// 출력: 가격: 1200
// ↑ 이 덕분에 문자열과 숫자를 섞어 쓸 수 있습니다.

// [규칙 2] - * / % 는 문자열을 숫자로 바꿔서 계산한다
console.log("10" - 5);
// 출력: 5
console.log("10" * 2);
// 출력: 20
console.log("10" / 2);
// 출력: 5

// 같은 값인데 + 만 결과가 다릅니다. 이게 가장 헷갈리는 지점입니다.
console.log("10" + 5, "10" - 5);
// 출력: 105 5

// [규칙 3] 불리언은 숫자로 바뀌면 true=1, false=0
console.log(true + 1);
// 출력: 2
console.log(false + 1);
// 출력: 1

// 자동 형변환에 기대지 말고, 계산 전에 Number( ) 로 직접 바꾸는 습관을 들이세요.

// ✏️ 직접 해보기 5 — "7" + 3 과 "7" - 3 을 각각 출력해서 비교해 보세요.


// ── 섹션 6: 불리언으로 바꾸기 : Boolean( ) ──

// 어떤 값이든 참/거짓으로 바꿀 수 있습니다.
console.log(Boolean(1));
// 출력: true
console.log(Boolean("안녕"));
// 출력: true

// 거짓이 되는 값은 아래 여섯 가지입니다. 이것만 외우면 됩니다.
console.log(Boolean(0));
// 출력: false
console.log(Boolean(""));
// 출력: false
console.log(Boolean(null));
// 출력: false
console.log(Boolean(undefined));
// 출력: false
console.log(Boolean(NaN));
// 출력: false
console.log(Boolean(false));
// 출력: false

// 이 여섯 가지를 falsy(거짓 같은 값)라고 부르고, 나머지는 전부 truthy 입니다.

// [주의] 글자가 하나라도 있으면 true 입니다.
console.log(Boolean("false"));
// 출력: true
console.log(Boolean("0"));
// 출력: true
console.log(Boolean(" "));
// 출력: true
// 빈 문자열 "" 만 false 이고, 공백 한 칸 " " 은 true 입니다.

// 이 falsy 목록은 03단원 조건문에서 "값이 비었으면" 을 판단할 때 그대로 쓰입니다.

// ✏️ 직접 해보기 6 — 빈 문자열과 공백 한 칸을 각각 Boolean 으로 바꿔 비교해 보세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 입력값을 안 바꾸고 더하기
const price1 = "3000"; // 입력창에서 온 값
const price2 = "2000";
console.log(price1 + price2);
// 출력: 30002000
// 실수: 숫자로 바꿔야 합니다.
console.log(Number(price1) + Number(price2));
// 출력: 5000

// [실수 2] Number 를 number 로 쓰기 → ReferenceError
// console.log(number("100"));
// 실수: 첫 글자가 대문자인 Number 입니다. String, Boolean 도 마찬가지입니다.

// [실수 3] NaN 을 === 로 비교
// if (result === NaN) ...
// 실수: 항상 false 라서 절대 걸리지 않습니다. Number.isNaN(result) 를 쓰세요.

// [실수 4] parseInt 가 소수를 반올림한다고 착각
console.log(parseInt("3.9"));
// 출력: 3
// 실수: 반올림이 아니라 그냥 버립니다. 4가 아니라 3입니다.


// ── 정리 ──

// 1. Number(값)   : 문자열 → 숫자.  못 바꾸면 NaN
// 2. parseInt(값) : "30px" 처럼 단위가 붙었을 때 앞의 숫자만
// 3. String(값)   : 숫자 → 문자열
// 4. + 는 한쪽이 문자열이면 이어붙이기, - * / 는 숫자로 바꿔서 계산
// 5. falsy 6개 : 0, "", null, undefined, NaN, false — 나머지는 전부 true


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(Number("250") + 100);        // 출력: 350
//
// 2) console.log(Number("3개"));               // 출력: NaN
//    '개'라는 글자 때문에 전체를 숫자로 못 바꿉니다.
//    숫자만 뽑으려면 parseInt("3개") → 3
//
// 3) console.log(parseFloat("24.5도"));        // 출력: 24.5
//    parseInt 를 쓰면 24 만 나옵니다.
//
// 4) console.log(String(1234567).length);      // 출력: 7
//
// 5) console.log("7" + 3);                     // 출력: 73   (이어붙이기)
//    console.log("7" - 3);                     // 출력: 4    (뺄셈)
//
// 6) console.log(Boolean(""));                 // 출력: false
//    console.log(Boolean(" "));                // 출력: true
