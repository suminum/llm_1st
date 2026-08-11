// ============================================================
// 01단원 연습문제 정답 — 변수와 자료형
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요.
// 정답과 다르게 썼더라도 기대 출력이 같으면 맞은 것입니다.
// 다만 "왜 그렇게 되는지" 설명을 꼭 읽으세요.


// ───── 문제 1 ─────
console.log("자바스크립트 시작!");
// 출력: 자바스크립트 시작!


// ───── 문제 2 ─────
// 쉼표로 나열하면 띄어쓰기로 구분되어 한 줄에 찍힙니다.
console.log("삼각김밥", 1200, "원");
// 출력: 삼각김밥 1200 원

// [다른 방법] + 로 이어 붙일 수도 있지만 띄어쓰기를 직접 넣어야 합니다.
// console.log("삼각김밥 " + 1200 + " 원");


// ───── 문제 3 ─────
const cafeName = "봄날카페";
console.log(cafeName);
// 출력: 봄날카페


// ───── 문제 4 ─────
let stock = 10;
console.log(stock);
// 출력: 10

// 값을 바꿀 때는 let 을 다시 쓰지 않습니다. 이름 = 새값 만 씁니다.
stock = 7;
console.log(stock);
// 출력: 7


// ───── 문제 5 ─────
const bread = 3200;
const milk = 1500;
console.log(bread + milk);
// 출력: 4700


// ───── 문제 6 ─────
// 값과 typeof 를 같이 찍으면 자료형을 눈으로 확인할 수 있습니다.
console.log(42, typeof 42);
// 출력: 42 number
console.log("42", typeof "42");
// 출력: 42 string
console.log(true, typeof true);
// 출력: true boolean
// 42 와 "42" 는 화면에 똑같이 보이지만 자료형이 다릅니다.


// ───── 문제 7 ─────
const city = "부산";
console.log(city + " 여행 가자");
// 출력: 부산 여행 가자
// 띄어쓰기는 자동으로 안 들어갑니다. 따옴표 안에 직접 넣어야 합니다.


// ───── 문제 8 ─────
console.log("대한민국만세".length);
// 출력: 6

// [다른 방법] 변수에 담아서 써도 됩니다.
// const word = "대한민국만세";
// console.log(word.length);


// ───── 문제 9 ─────
const myScore = 85;
const isPass = myScore > 60;
console.log(isPass);
// 출력: true
// 비교의 결과는 true / false 인 불리언입니다.


// ───── 문제 10 ─────
// null 은 "일부러 비워 뒀다"는 뜻이라 나중에 바꿉니다. 그래서 let 입니다.
let selectedMenu = null;
console.log(selectedMenu);
// 출력: null

selectedMenu = "김밥";
console.log(selectedMenu);
// 출력: 김밥


// ───── 문제 11 ─────
const input1 = "3000";
const input2 = "4500";

// 그냥 더하면 이어붙기 때문에 30004500 이 나옵니다.
// 반드시 Number 로 바꾼 뒤 더해야 합니다.
console.log(Number(input1) + Number(input2));
// 출력: 7500


// ───── 문제 12 ─────
const height = "180cm";

// Number("180cm") 은 NaN 입니다. cm 때문에 전체를 숫자로 못 바꿉니다.
// 앞에서부터 읽히는 만큼만 가져오는 parseInt 를 씁니다.
console.log(parseInt(height));
// 출력: 180


// ───── 문제 13 ─────
console.log(Boolean(0));
// 출력: false
console.log(Boolean(""));
// 출력: false
console.log(Boolean("0"));
// 출력: true
// "0" 은 글자가 한 개 들어 있는 문자열이라 true 입니다.
// falsy 6개: 0, "", null, undefined, NaN, false


// ───── 문제 14 ─────
const bigNumber2 = 987654321;

// 숫자에는 .length 가 없어서 undefined 가 나옵니다.
// String 으로 바꿔 문자열의 글자 수를 세면 자릿수가 됩니다.
console.log(String(bigNumber2).length);
// 출력: 9


// ───── 문제 15 ─────
const before = "10";

console.log(before + 5);
// 출력: 105
console.log(Number(before) + 5);
// 출력: 15

// 왜 다른가:
//   before 는 문자열 "10" 입니다.
//   + 는 한쪽이라도 문자열이면 '더하기'가 아니라 '이어붙이기'가 됩니다.
//   그래서 "10" + 5 는 "105" 가 됩니다.
//   Number 로 숫자 10 으로 바꾸면 그때부터 진짜 덧셈이 됩니다.


// ───── 문제 16 ─────
const itemName = "우유";
const itemPrice = "1500"; // 문자열!
const itemCount = 3;

// 문자열 * 숫자는 자동으로 숫자 계산이 되지만,
// 의도를 분명히 하려고 Number 로 직접 바꿉니다.
const itemTotal = Number(itemPrice) * itemCount;

console.log(itemName + " " + itemCount + "개 = " + itemTotal + "원");
// 출력: 우유 3개 = 4500원


// ───── 문제 17 ─────
// const fixedValue = "고정";
// fixedValue = "변경";
//
// 에러: TypeError: Assignment to constant variable.
//
// 왜:
//   const 로 만든 변수는 "이 값은 안 바뀝니다"라고 약속한 것입니다.
//   약속을 어기고 새 값을 넣으려 하면 자바스크립트가 막습니다.
//   값을 바꿀 생각이라면 처음부터 let 으로 만들어야 합니다.
