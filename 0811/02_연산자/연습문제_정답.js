// ============================================================
// 02단원 연습문제 정답 — 연산자
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
const applePrice = 1200;
const appleCount = 3;
console.log(applePrice * appleCount);
// 출력: 3600


// ───── 문제 2 ─────
console.log(25 % 4);
// 출력: 1
// 25 ÷ 4 = 6 ... 나머지 1


// ───── 문제 3 ─────
const totalSec = 350;
const min3 = Math.floor(totalSec / 60);
const sec3 = totalSec % 60;
console.log(`${min3}분 ${sec3}초`);
// 출력: 5분 50초

// [다른 방법] 백틱 안에서 바로 계산해도 됩니다. 다만 읽기가 나빠집니다.
// console.log(`${Math.floor(totalSec / 60)}분 ${totalSec % 60}초`);


// ───── 문제 4 ─────
const rawValue = 12345.678;
console.log(rawValue.toFixed(1));
// 출력: 12345.7
// 주의: toFixed 의 결과는 문자열입니다. 계산에 다시 쓰려면 Number( ) 로 되돌리세요.


// ───── 문제 5 ─────
// 누적 변수는 반드시 0으로 시작합니다. 안 그러면 NaN 이 됩니다.
let sumTotal = 0;
sumTotal += 1200;
sumTotal += 800;
sumTotal += 500;
console.log(sumTotal);
// 출력: 2500


// ───── 문제 6 ─────
let visitorCount = 99;
visitorCount++;
console.log(visitorCount);
// 출력: 100


// ───── 문제 7 ─────
const checkAge = 17;
console.log(checkAge >= 19);
// 출력: false
// '이상'은 >= 입니다. > 로 쓰면 19살이 빠집니다.


// ───── 문제 8 ─────
console.log("7" === 7);
// 출력: false
console.log("7" == 7);
// 출력: true
// === 는 자료형까지 비교합니다. 문자열 "7" 과 숫자 7 은 자료형이 다르므로 false.
// == 는 자료형을 맞춰 준 뒤 비교해서 true 가 됩니다. 그래서 == 를 쓰면 안 됩니다.


// ───── 문제 9 ─────
console.log("80" > "100");
// 출력: true
console.log(80 > 100);
// 출력: false
// 문자열끼리 비교하면 사전 순으로 한 글자씩 봅니다.
// "8" 과 "1" 을 비교해서 "8" 이 뒤에 있으므로 "80" 이 크다고 나옵니다.
// 입력창에서 받은 값을 크기 비교할 때는 반드시 Number( ) 로 바꿔야 합니다.


// ───── 문제 10 ─────
const score2 = 75;
console.log(score2 >= 70 && score2 < 80);
// 출력: true
// 70 <= score2 < 80 처럼 쓰면 안 됩니다. && 로 이어야 합니다.


// ───── 문제 11 ─────
const inputNick = "";
console.log(inputNick || "익명");
// 출력: 익명
// 빈 문자열은 falsy 라서 오른쪽 값이 나옵니다.


// ───── 문제 12 ─────
const isRaining = false;
console.log(!isRaining);
// 출력: true


// ───── 문제 13 ─────
const name3 = "이서연";
const age3 = 22;
console.log(`안녕하세요, ${name3}님! ${age3}살이시군요.`);
// 출력: 안녕하세요, 이서연님! 22살이시군요.

// [다른 방법] + 로도 되지만 훨씬 지저분합니다.
// console.log("안녕하세요, " + name3 + "님! " + age3 + "살이시군요.");


// ───── 문제 14 ─────
const numA = 3;
const numB = 4;
console.log(`${numA} 곱하기 ${numB} 는 ${numA * numB}`);
// 출력: 3 곱하기 4 는 12


// ───── 문제 15 ─────
const itemName15 = "샌드위치";
const itemPrice15 = 4800;
const itemCount15 = 2;

const itemTotal15 = itemPrice15 * itemCount15;
console.log(`${itemName15} ${itemCount15}개 ${itemTotal15}원`);
// 출력: 샌드위치 2개 9600원


// ───── 문제 16 ─────
const menu16 = "아메리카노";
const price16 = 4500;
const count16 = 2;

// 백틱 안에서 엔터를 치면 그대로 줄이 바뀝니다.
// 들여쓰기한 공백도 출력에 포함되므로 왼쪽 끝에 붙여 씁니다.
console.log(`=== 주문서 ===
${menu16} x ${count16}
합계 ${price16 * count16}원`);
// 출력: === 주문서 ===
// 출력: 아메리카노 x 2
// 출력: 합계 9000원


// ───── 문제 17 ─────
// const clickCount = 0;
// clickCount++;
//
// 에러: TypeError: Assignment to constant variable.
//
// 왜:
//   clickCount++ 는 clickCount = clickCount + 1 을 줄여 쓴 것입니다.
//   즉 겉보기와 달리 '값을 다시 넣는' 동작입니다.
//   const 는 값을 다시 넣을 수 없으므로 에러가 납니다.
//   1씩 늘어나는 변수는 처음부터 let 으로 만들어야 합니다.
