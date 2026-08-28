// ============================================================
// 05단원 연습문제 정답 — 함수
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
function printWelcome() {
  console.log("환영합니다!");
}
printWelcome();
// 출력: 환영합니다!
// 만들기만 하면 아무 일도 안 일어납니다. 괄호를 붙여 호출해야 실행됩니다.


// ───── 문제 2 ─────
function printStar() {
  console.log("*****");
}

function printTitle() {
  console.log("MENU");
}

function printHeader() {
  printStar();
  printTitle();
  printStar();
}

printHeader();
// 출력: *****
// 출력: MENU
// 출력: *****
// 작은 함수를 조립해 큰 함수를 만드는 것이 프로그램을 짜는 기본 방식입니다.


// ───── 문제 3 ─────
function callName(name) {
  console.log(`${name}님, 안녕하세요`);
}
callName("이서연");
// 출력: 이서연님, 안녕하세요


// ───── 문제 4 ─────
function printArea(width, height) {
  console.log(width * height);
}
printArea(8, 5);
// 출력: 40


// ───── 문제 5 ─────
function order(menu, count = 1) {
  console.log(`${menu} ${count}개`);
}
order("라떼");
// 출력: 라떼 1개
order("케이크", 3);
// 출력: 케이크 3개
// 기본값이 있는 매개변수는 반드시 뒤쪽에 둡니다.


// ───── 문제 6 ─────
function getSum(a, b) {
  return a + b;
}
console.log(getSum(3, 7));
// 출력: 10
// 함수 안에서 console.log 를 하면 값을 다시 쓸 수 없습니다.
// return 으로 돌려줘야 계산에 재사용할 수 있습니다.


// ───── 문제 7 ─────
function getTotal(price, count) {
  return price * count;
}

const total7 = getTotal(4500, 4);
console.log(`합계 ${total7}원`);
// 출력: 합계 18000원


// ───── 문제 8 ─────
function divide(a, b) {
  if (b === 0) {
    return "0으로 나눌 수 없습니다"; // 여기서 함수가 끝납니다
  }
  return a / b;
}

console.log(divide(10, 0));
// 출력: 0으로 나눌 수 없습니다
console.log(divide(10, 2));
// 출력: 5
// 걸러낼 조건을 위에서 먼저 return 으로 끝내는 것을 '조기 반환'이라고 합니다.
// else 가 필요 없어져서 들여쓰기가 얕아집니다.


// ───── 문제 9 ─────
function isPass(score) {
  return score >= 60;
}
console.log(isPass(45));
// 출력: false
console.log(isPass(80));
// 출력: true

// 이렇게 쓰지 마세요. 불필요합니다.
// if (score >= 60) { return true; } else { return false; }
// score >= 60 자체가 이미 true / false 입니다.


// ───── 문제 10 ─────
const minus = function (a, b) {
  return a - b;
};
console.log(minus(10, 3));
// 출력: 7
// 함수 표현식은 '값을 변수에 넣는 문장'이라 끝에 세미콜론을 붙입니다.


// ───── 문제 11 ─────
function calculate(a, b, operation) {
  return operation(a, b);
}

function multiply(a, b) {
  return a * b;
}

console.log(calculate(6, 7, multiply));
// 출력: 42
// multiply 라고만 씁니다. multiply() 라고 쓰면 실행 결과(NaN)가 넘어갑니다.


// ───── 문제 12 ─────
const arrowDouble = (n) => {
  return n * 2;
};
console.log(arrowDouble(7));
// 출력: 14

// [줄여 쓰면] const arrowDouble = (n) => n * 2;


// ───── 문제 13 ─────
const square = (n) => n * n;
console.log(square(9));
// 출력: 81
// 중괄호를 없애면 "이 식의 결과를 돌려준다"는 뜻이 됩니다.
// 중괄호와 return 은 반드시 같이 지워야 합니다.


// ───── 문제 14 ─────
const getDiscounted = (price, rate) => {
  const discount = price * rate;
  return price - discount;
};
console.log(getDiscounted(10000, 0.3));
// 출력: 7000
// 중괄호를 쓰면 return 을 반드시 써야 합니다. 안 쓰면 undefined 가 나옵니다.


// ───── 문제 15 ─────
const taxRate = 0.1; // 함수 밖 — 전역

function printTax(price) {
  console.log(price * taxRate); // 밖의 변수를 그대로 씁니다
}

printTax(10000);
// 출력: 1000
// 안에서 밖은 보이고, 밖에서 안은 안 보입니다.


// ───── 문제 16 ─────
function getRawTotal(price, count) {
  return price * count;
}

function applyDiscount(total, isMember) {
  if (!isMember) {
    return total;
  }
  return Math.round(total * 0.9);
}

const raw16 = getRawTotal(1200, 5); // 6000
const final16 = applyDiscount(raw16, true); // 5400

console.log(`합계 ${final16}원`);
// 출력: 합계 5400원
// 함수를 작게 나누면 각각을 따로 확인할 수 있어 버그를 찾기 쉽습니다.


// ───── 문제 17 ─────
function getSumRange(start, end) {
  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += i;
  }
  return sum; // 반복이 '끝난 뒤'에 돌려줘야 합니다
}

console.log(getSumRange(1, 10));
// 출력: 55
console.log(getSumRange(5, 10));
// 출력: 45
// return 을 for 문 안에 두면 첫 바퀴에서 함수가 끝나 버립니다.


// ───── 문제 18 ─────
// function makeSecret() {
//   const secret = "비밀번호";
// }
// makeSecret();
// console.log(secret);
//
// 에러: ReferenceError: secret is not defined
//
// 왜:
//   함수 안 중괄호에서 만든 변수는 그 중괄호 안에서만 삽니다.
//   함수가 끝나면 사라지기 때문에 밖에서는 존재하지 않습니다.
//
// 해결:
//   return 으로 돌려받으면 됩니다.
//
//   function makeSecret() {
//     const secret = "비밀번호";
//     return secret;
//   }
//   const result = makeSecret();
//   console.log(result);   // 출력: 비밀번호
