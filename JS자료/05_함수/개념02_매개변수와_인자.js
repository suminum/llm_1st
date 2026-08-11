// ============================================================
// 05단원 · 개념 02 — 매개변수와 인자: 함수에 값 넘기기
// ------------------------------------------------------------
// 실행: node 개념02_매개변수와_인자.js
// ============================================================
//
// 앞 파일의 함수는 항상 똑같은 일만 했습니다.
// 값을 넘겨 주면 그 값에 따라 다르게 동작하게 만들 수 있습니다.
//
//     function greet(name) {      ← name 이 매개변수 (받는 쪽)
//       console.log(name);
//     }
//
//     greet("김민준");             ← "김민준" 이 인자 (주는 쪽)


// ── 섹션 1: 값 하나 넘기기 ──

function greet(name) {
  console.log(`안녕하세요, ${name}님!`);
}

greet("김민준");
// 출력: 안녕하세요, 김민준님!

greet("이서연");
// 출력: 안녕하세요, 이서연님!

// 같은 함수인데 넘긴 값에 따라 결과가 달라집니다.

// 용어 정리 (헷갈리면 이렇게 외우세요)
//   매개변수(parameter) : 함수를 '만들 때' 괄호 안에 적는 이름 — 받는 그릇
//   인자(argument)      : 함수를 '부를 때' 괄호 안에 넣는 값 — 담기는 내용
//
// 매개변수 이름은 그 함수 안에서만 쓰는 변수입니다. 마음대로 지어도 됩니다.

// 변수를 넘길 수도 있습니다.
const userName = "박지훈";
greet(userName);
// 출력: 안녕하세요, 박지훈님!

// ✏️ 직접 해보기 1 — 음료 이름을 받아 "OOO 나왔습니다" 를 출력하는
//                    함수를 만들어 "라떼" 로 불러 보세요.


// ── 섹션 2: 값 여러 개 넘기기 ──

// 쉼표로 나열하면 됩니다. 순서가 중요합니다.
function printOrder(menu, count) {
  console.log(`${menu} ${count}개 주문되었습니다`);
}

printOrder("아메리카노", 2);
// 출력: 아메리카노 2개 주문되었습니다

printOrder("케이크", 1);
// 출력: 케이크 1개 주문되었습니다

// 순서를 바꿔 넣으면 뜻이 뒤집힙니다.
printOrder(2, "아메리카노");
// 출력: 2 아메리카노개 주문되었습니다
// 에러는 안 나지만 결과가 엉망입니다. 순서를 꼭 맞추세요.

// 계산도 함께 해 봅시다.
function printTotal(price, count) {
  const total = price * count;
  console.log(`합계 ${total}원`);
}

printTotal(4500, 3);
// 출력: 합계 13500원

// ✏️ 직접 해보기 2 — 가로와 세로를 받아 넓이를 출력하는 함수를 만들고
//                    8, 5 로 불러 보세요.


// ── 섹션 3: 인자를 덜 넣으면 undefined ──

function introduce(name, age) {
  console.log(`${name} / ${age}살`);
}

introduce("김민준", 20);
// 출력: 김민준 / 20살

// 두 번째 값을 안 넣으면 age 는 undefined 가 됩니다.
introduce("이서연");
// 출력: 이서연 / undefined살

// 에러가 나지 않는다는 점이 중요합니다. 조용히 undefined 가 들어갑니다.
// 그래서 "왜 화면에 undefined 가 나오지?" 하고 한참 찾게 됩니다.

// 반대로 더 많이 넣으면 남는 것은 그냥 버려집니다.
introduce("박지훈", 30, "부산", "개발자");
// 출력: 박지훈 / 30살

// ✏️ 직접 해보기 3 — introduce 를 아무 인자 없이 불러 보고
//                    무엇이 출력되는지 확인해 보세요.


// ── 섹션 4: 기본값 정해 두기 ──

// 매개변수에 = 로 기본값을 정하면, 안 넘겼을 때 그 값이 쓰입니다.
function order(menu, count = 1) {
  console.log(`${menu} ${count}개`);
}

order("아메리카노", 3);
// 출력: 아메리카노 3개

order("라떼");
// 출력: 라떼 1개
// count 를 안 넘겨서 기본값 1이 쓰였습니다.

// 여러 개에 기본값을 줄 수도 있습니다.
function makeProfile(name = "손님", city = "서울") {
  console.log(`${name} (${city})`);
}

makeProfile();
// 출력: 손님 (서울)
makeProfile("김민준");
// 출력: 김민준 (서울)
makeProfile("김민준", "부산");
// 출력: 김민준 (부산)

// [주의] 기본값이 있는 매개변수는 뒤쪽에 두세요.
// 앞쪽에 두면 건너뛸 방법이 없어서 의미가 없습니다.
function bad(count = 1, menu) {
  console.log(menu, count);
}
bad("라떼");
// 출력: undefined 라떼
// "라떼" 가 첫 번째 자리인 count 로 들어가 버렸습니다.

// ✏️ 직접 해보기 4 — 할인율 기본값이 0인 함수를 만들어
//                    가격 10000에 할인율을 안 넘겼을 때 10000이 나오게 해 보세요.


// ── 섹션 5: 매개변수는 함수 안에서만 산다 ──

function showPrice(price) {
  console.log("함수 안:", price);
}

showPrice(5000);
// 출력: 함수 안: 5000

// 함수 밖에서 price 를 쓰면 에러입니다.
// console.log(price);
// 실수: ReferenceError: price is not defined
//
// 매개변수는 함수가 실행되는 동안에만 존재합니다.
// 자세한 내용은 개념06(스코프)에서 배웁니다.

// 그래서 다른 함수에서 같은 이름을 써도 서로 상관없습니다.
function showTax(price) {
  console.log("세금 계산용 price:", price);
}
showTax(1000);
// 출력: 세금 계산용 price: 1000


// ── 섹션 6: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 매개변수에 값을 미리 넣으려 하기
// function greet2(name = "김민준") { }  ← 이건 기본값이라 괜찮습니다
// function greet3("김민준") { }
// 실수: SyntaxError. 만들 때 괄호 안에는 '이름'만 적습니다.

// [실수 2] 인자 순서를 헷갈리기 (섹션 2에서 봤습니다)
// 매개변수가 세 개를 넘어가면 순서를 외우기 어렵습니다.
// 그럴 땐 07단원에서 배울 객체로 묶어서 넘깁니다.

// [실수 3] 숫자를 넘겼는데 문자열로 계산됨
function addPrice(a, b) {
  console.log(a + b);
}
addPrice(1000, 2000);
// 출력: 3000
addPrice("1000", 2000);
// 출력: 10002000
// 실수: 입력창에서 온 값은 문자열입니다. 넘기기 전에 Number( ) 로 바꾸세요.
addPrice(Number("1000"), 2000);
// 출력: 3000

// [실수 4] 함수 안에서 매개변수 값을 바꾸고 밖에서도 바뀔 거라 기대하기
let outsideValue = 10;
function tryChange(value) {
  value = 999; // 함수 안의 value 만 바뀝니다
}
tryChange(outsideValue);
console.log(outsideValue);
// 출력: 10
// 숫자·문자열 같은 값은 '복사해서' 넘어갑니다. 원본은 그대로입니다.


// ── 정리 ──

// 1. function 이름(매개변수) { ... } / 이름(인자) 로 값을 넘긴다.
// 2. 여러 개는 쉼표로. 순서가 중요하다.
// 3. 인자를 덜 넣으면 undefined. 에러가 안 나서 더 위험하다.
// 4. 매개변수 = 기본값 으로 기본값을 정할 수 있다. 기본값은 뒤쪽에.
// 5. 매개변수는 함수 안에서만 존재한다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function callDrink(drink) {
//      console.log(`${drink} 나왔습니다`);
//    }
//    callDrink("라떼");        // 출력: 라떼 나왔습니다
//
// 2) function printArea(width, height) {
//      console.log(width * height);
//    }
//    printArea(8, 5);          // 출력: 40
//
// 3) introduce();
//    // 출력: undefined / undefined살
//    // 인자를 하나도 안 넘기면 매개변수가 전부 undefined 가 됩니다.
//
// 4) function printDiscounted(price, rate = 0) {
//      console.log(price - price * rate);
//    }
//    printDiscounted(10000);       // 출력: 10000
//    printDiscounted(10000, 0.1);  // 출력: 9000
