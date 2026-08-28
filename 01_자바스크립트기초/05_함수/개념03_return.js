// ============================================================
// 05단원 · 개념 03 — return: 결과를 돌려주기
// ------------------------------------------------------------
// 실행: node 개념03_return.js
// ============================================================
//
// 지금까지 함수는 안에서 console.log 로 '출력'만 했습니다.
// 그런데 계산 결과를 다른 곳에서 다시 쓰려면 '돌려받아야' 합니다.
//
//     return 값;   ← 이 값을 함수를 부른 자리로 돌려보냅니다


// ── 섹션 1: 출력하는 함수 vs 돌려주는 함수 ──

// [출력만 하는 함수]
function printSum(a, b) {
  console.log(a + b);
}

printSum(3, 4);
// 출력: 7

// 화면에는 잘 나옵니다. 하지만 이 7을 다시 쓸 수는 없습니다.
const result1 = printSum(3, 4);
// 출력: 7
console.log("돌려받은 값:", result1);
// 출력: 돌려받은 값: undefined
// 함수가 아무것도 돌려주지 않아서 undefined 입니다.

// [돌려주는 함수]
function getSum(a, b) {
  return a + b;
}

const result2 = getSum(3, 4);
console.log("돌려받은 값:", result2);
// 출력: 돌려받은 값: 7

// 돌려받았으니 다시 계산에 쓸 수 있습니다.
console.log(getSum(3, 4) * 10);
// 출력: 70

console.log(getSum(getSum(1, 2), 4));
// 출력: 7
// 함수의 결과를 다른 함수의 인자로 바로 넘길 수도 있습니다.

// 기억할 것:
//   console.log 는 '사람에게 보여 주는' 것
//   return    은 '코드에게 돌려주는' 것
// 둘은 완전히 다릅니다. 초보자가 가장 많이 헷갈리는 지점입니다.

// ✏️ 직접 해보기 1 — 두 수를 곱해서 돌려주는 getProduct 함수를 만들고
//                    결과를 변수에 담아 출력해 보세요.


// ── 섹션 2: return 한 값을 바로 쓰기 ──

function getTotal(price, count) {
  return price * count;
}

// 변수에 담아 쓰기
const total = getTotal(4500, 3);
console.log(total);
// 출력: 13500

// 바로 출력하기
console.log(getTotal(1200, 5));
// 출력: 6000

// 템플릿 리터럴 안에서 쓰기
console.log(`합계는 ${getTotal(3000, 2)}원입니다`);
// 출력: 합계는 6000원입니다

// 조건문에서 쓰기
if (getTotal(4500, 3) >= 10000) {
  console.log("무료 배송 대상입니다");
}
// 출력: 무료 배송 대상입니다

// ✏️ 직접 해보기 2 — 원의 넓이를 돌려주는 함수를 만들어 보세요.
//                    (반지름 × 반지름 × 3.14, 반지름 10으로 확인)


// ── 섹션 3: return 을 만나면 함수가 끝난다 ──

function testReturn() {
  console.log("첫 줄");
  return "돌려준 값";
  console.log("이 줄은 절대 실행되지 않습니다");
}

const r = testReturn();
// 출력: 첫 줄
console.log(r);
// 출력: 돌려준 값

// return 아래의 코드는 실행되지 않습니다.
// 이 성질을 이용하면 "조건에 안 맞으면 즉시 끝내기"를 할 수 있습니다. (섹션 5)


// ── 섹션 4: return 이 없으면 undefined ──

function noReturn() {
  console.log("일만 하고 아무것도 안 돌려줍니다");
}

const value = noReturn();
// 출력: 일만 하고 아무것도 안 돌려줍니다
console.log(value);
// 출력: undefined

// return 만 쓰고 값을 안 적어도 undefined 입니다.
function emptyReturn() {
  return;
}
console.log(emptyReturn());
// 출력: undefined

// 그래서 "함수 결과가 자꾸 undefined 로 나온다" 면
// 십중팔구 return 을 안 썼거나 console.log 로 잘못 쓴 것입니다.

// ✏️ 직접 해보기 3 — console.log 만 있는 함수의 결과를 변수에 담아 찍어 보고
//                    undefined 가 나오는 것을 직접 확인해 보세요.


// ── 섹션 5: 조기 반환 — 조건에 안 맞으면 즉시 끝내기 ──

// [중첩이 깊은 코드]
function checkAge1(age) {
  if (age >= 0) {
    if (age >= 19) {
      return "성인";
    } else {
      return "미성년자";
    }
  } else {
    return "잘못된 나이";
  }
}

console.log(checkAge1(20));
// 출력: 성인
console.log(checkAge1(-5));
// 출력: 잘못된 나이

// [조기 반환으로 편 코드] — 걸러낼 것을 먼저 처리하고 끝내 버립니다
function checkAge2(age) {
  if (age < 0) {
    return "잘못된 나이"; // 여기서 함수가 끝납니다
  }

  if (age >= 19) {
    return "성인";
  }

  return "미성년자";
}

console.log(checkAge2(20));
// 출력: 성인
console.log(checkAge2(-5));
// 출력: 잘못된 나이
console.log(checkAge2(15));
// 출력: 미성년자

// else 가 사라지고 들여쓰기가 얕아졌습니다. 훨씬 읽기 쉽습니다.
// 이 패턴을 '조기 반환' 또는 '가드 절'이라고 부릅니다. 실무에서 아주 많이 씁니다.

// ✏️ 직접 해보기 4 — 나누기 함수를 만들되, 나누는 수가 0이면
//                    "0으로 나눌 수 없습니다" 를 조기 반환하게 해 보세요.


// ── 섹션 6: 참/거짓을 돌려주는 함수 ──

// 판단 결과를 돌려주는 함수는 이름을 is~ / has~ 로 짓습니다.
function isAdult(age) {
  return age >= 19;
}

console.log(isAdult(20));
// 출력: true
console.log(isAdult(15));
// 출력: false

// 조건문에 그대로 넣어 쓸 수 있습니다.
if (isAdult(20)) {
  console.log("입장 가능");
}
// 출력: 입장 가능

// 이렇게 쓰지 마세요. 불필요합니다.
function isAdultBad(age) {
  if (age >= 19) {
    return true;
  } else {
    return false;
  }
}
console.log(isAdultBad(20));
// 출력: true
// age >= 19 자체가 이미 true / false 입니다. 그대로 return 하면 됩니다.

// ✏️ 직접 해보기 5 — 짝수인지 판단해 true/false 를 돌려주는 isEven 함수를
//                    만들어 4와 7로 확인해 보세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] return 대신 console.log 를 씀 (섹션 1)
// 가장 흔한 실수입니다. "값을 다시 쓸 건가?" 를 기준으로 고르세요.

// [실수 2] return 뒤에서 줄을 바꿈
function brokenReturn() {
  return // ← 세미콜론을 안 찍고 줄을 바꿨습니다
  1 + 2; // 자바스크립트가 return 뒤에 세미콜론을 자동으로 넣어 버려서
  // 이 줄은 돌려주는 값이 아니라 그냥 버려지는 코드가 됩니다
}
console.log(brokenReturn());
// 출력: undefined
// 실수: return 과 값 사이에서 줄을 바꾸면 안 됩니다.
//       자바스크립트가 return 뒤에 세미콜론을 자동으로 넣어 버립니다.
//       값이 길면 괄호로 감싸세요.
function fixedReturn() {
  return 1 + 2;
}
console.log(fixedReturn());
// 출력: 3

// [실수 3] return 을 반복문 안에 잘못 넣기
function sumTo(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
    // return sum;   ← 여기에 두면 첫 바퀴에서 함수가 끝나 버립니다
  }
  return sum; // 반복이 끝난 뒤에 돌려줘야 합니다
}
console.log(sumTo(5));
// 출력: 15

// [실수 4] 여러 값을 return 하려고 쉼표로 나열
function getTwo() {
  return 1, 2;
}
console.log(getTwo());
// 출력: 2
// 실수: 마지막 값만 돌아옵니다. 여러 값을 돌려주려면
//       06단원의 배열이나 07단원의 객체로 묶어야 합니다.


// ── 정리 ──

// 1. return 값;  — 함수를 부른 자리로 값을 돌려준다.
// 2. console.log 는 사람에게 보여 주기, return 은 코드에게 돌려주기.
// 3. return 을 만나면 함수가 즉시 끝난다. 아래 코드는 실행되지 않는다.
// 4. return 이 없으면 결과는 undefined.
// 5. 걸러낼 조건은 위에서 먼저 return 으로 끝내라 (조기 반환).
// 6. 판단 함수는 is~ / has~ 이름에 비교식을 그대로 return.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function getProduct(a, b) {
//      return a * b;
//    }
//    const p = getProduct(3, 4);
//    console.log(p);              // 출력: 12
//
// 2) function getCircleArea(radius) {
//      return radius * radius * 3.14;
//    }
//    console.log(getCircleArea(10));   // 출력: 314
//
// 3) function onlyLog() {
//      console.log("출력만 합니다");
//    }
//    const v = onlyLog();
//    console.log(v);              // 출력: undefined
//
// 4) function divide(a, b) {
//      if (b === 0) {
//        return "0으로 나눌 수 없습니다";
//      }
//      return a / b;
//    }
//    console.log(divide(10, 0));  // 출력: 0으로 나눌 수 없습니다
//    console.log(divide(10, 2));  // 출력: 5
//
// 5) function isEven(n) {
//      return n % 2 === 0;
//    }
//    console.log(isEven(4));      // 출력: true
//    console.log(isEven(7));      // 출력: false
