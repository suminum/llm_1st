// ============================================================
// 06단원 연습문제 정답 — 배열
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
const colors1 = ["빨강", "파랑", "노랑"];
console.log(colors1);
// 출력: [ '빨강', '파랑', '노랑' ]


// ───── 문제 2 ─────
const animals2 = ["강아지", "고양이", "토끼"];
console.log(animals2[1]);
// 출력: 고양이
// 인덱스는 0부터입니다. "두 번째"는 [1] 입니다.


// ───── 문제 3 ─────
const week3 = ["월", "화", "수", "목", "금"];
console.log(week3.length);
// 출력: 5
console.log(week3[week3.length - 1]);
// 출력: 금
// 마지막 인덱스는 length - 1 입니다. week3.at(-1) 로도 됩니다.


// ───── 문제 4 ─────
const menu4 = ["김밥", "라면", "돈까스"];
menu4[1] = "우동";
console.log(menu4);
// 출력: [ '김밥', '우동', '돈까스' ]
// const 로 만들어도 배열 '안의 내용'은 바꿀 수 있습니다.


// ───── 문제 5 ─────
const basket5 = [];
basket5.push("사과");
basket5.push("바나나", "포도");
console.log(basket5);
// 출력: [ '사과', '바나나', '포도' ]
// basket5[0] = "사과" 처럼 직접 넣지 말고 push 를 쓰세요.


// ───── 문제 6 ─────
const stack6 = ["첫째", "둘째", "셋째"];
const last6 = stack6.pop();
console.log(last6);
// 출력: 셋째
console.log(stack6);
// 출력: [ '첫째', '둘째' ]
// pop 은 '빼낸 값'을 돌려줍니다. push 는 '넣은 뒤의 개수'를 돌려줍니다.


// ───── 문제 7 ─────
const days7 = ["월", "수", "목"];
days7.splice(1, 0, "화");
console.log(days7);
// 출력: [ '월', '화', '수', '목' ]
// 두 번째 인자 0 은 "하나도 지우지 말라"는 뜻입니다.


// ───── 문제 8 ─────
const nums8 = [10, 20, 30, 40, 50];
console.log(nums8.slice(1, 4));
// 출력: [ 20, 30, 40 ]
console.log(nums8);
// 출력: [ 10, 20, 30, 40, 50 ]
// slice 는 끝 인덱스를 포함하지 않습니다. 1, 2, 3 만 가져옵니다.
// 원본은 그대로입니다. splice 였다면 원본이 잘려 나갔을 겁니다.


// ───── 문제 9 ─────
const a9 = [1, 2];
const b9 = [3, 4];
console.log(a9.concat(b9));
// 출력: [ 1, 2, 3, 4 ]
// a9 + b9 로 쓰면 "1,23,4" 라는 문자열이 나옵니다.


// ───── 문제 10 ─────
const fruits10 = ["사과", "바나나", "포도"];
console.log(fruits10.join(", "));
// 출력: 사과, 바나나, 포도
// join 의 결과는 문자열입니다. 따옴표와 대괄호가 사라집니다.


// ───── 문제 11 ─────
const text11 = "월-화-수";
console.log(text11.split("-"));
// 출력: [ '월', '화', '수' ]
// split 은 문자열의 메소드입니다. 배열 → 문자열은 join, 문자열 → 배열은 split.


// ───── 문제 12 ─────
const menu12 = ["아메리카노", "라떼", "케이크"];
console.log(menu12.includes("라떼"));
// 출력: true
console.log(menu12.includes("녹차"));
// 출력: false


// ───── 문제 13 ─────
const list13 = ["사과", "바나나", "포도"];
console.log(list13.indexOf("포도"));
// 출력: 2
console.log(list13.indexOf("귤"));
// 출력: -1
// 없으면 0이 아니라 -1 입니다. 0은 '첫 번째'라는 진짜 위치니까요.


// ───── 문제 14 ─────
const scores14 = [90, 85, 70];
for (const score of scores14) {
  console.log(score);
}
// 출력: 90
// 출력: 85
// 출력: 70

// [다른 방법] 인덱스가 필요하면 일반 for 문을 씁니다.
// for (let i = 0; i < scores14.length; i++) {
//   console.log(scores14[i]);
// }


// ───── 문제 15 ─────
const prices15 = [1200, 4500, 3000];

let sum15 = 0; // 누적 변수는 반복문 밖에서 0으로 시작
for (const price of prices15) {
  sum15 += price;
}

console.log(sum15);
// 출력: 8700
console.log(sum15 / prices15.length);
// 출력: 2900


// ───── 문제 16 ─────
const ages16 = [15, 22, 34, 17, 40];

const adults16 = [];
for (const age of ages16) {
  if (age >= 19) {
    adults16.push(age);
  }
}

console.log(adults16);
// 출력: [ 22, 34, 40 ]
// 08단원에서 배울 filter 를 쓰면 한 줄이 됩니다.
// console.log(ages16.filter((age) => age >= 19));


// ───── 문제 17 ─────
const cart17 = ["아메리카노", "케이크", "쿠키"];
const prices17 = [4500, 6000, 3000];

// 두 배열을 같은 인덱스로 짝지어야 하므로 for...of 가 아니라 for 문을 씁니다.
let total17 = 0;
for (let i = 0; i < cart17.length; i++) {
  console.log(`${i + 1}. ${cart17[i]} ${prices17[i]}원`);
  total17 += prices17[i];
}
// 출력: 1. 아메리카노 4500원
// 출력: 2. 케이크 6000원
// 출력: 3. 쿠키 3000원

console.log(`합계 ${total17}원`);
// 출력: 합계 13500원


// ───── 문제 18 ─────
const temps18 = [23, 31, 18, 27];

// 최댓값은 반드시 배열의 첫 번째 값으로 시작합니다. 0으로 시작하면 음수에서 틀립니다.
let maxTemp = temps18[0];
let maxIndex = 0;

for (let i = 0; i < temps18.length; i++) {
  if (temps18[i] > maxTemp) {
    maxTemp = temps18[i];
    maxIndex = i;
  }
}

console.log(`최고 기온 ${maxTemp}도 (${maxIndex + 1}번째)`);
// 출력: 최고 기온 31도 (2번째)
// 인덱스는 0부터이므로 "몇 번째"로 말하려면 +1 을 합니다.


// ───── 문제 19 ─────
// const notArray = "안녕";
// notArray.push("!");
//
// 에러: TypeError: notArray.push is not a function
//
// 왜:
//   push 는 배열이 가진 메소드입니다. 문자열에는 없습니다.
//   문자열은 한 번 만들어지면 내용을 바꿀 수 없기 때문입니다.
//   글자를 덧붙이려면 새 문자열을 만들어야 합니다.
//
//   let text = "안녕";
//   text += "!";          // 출력: 안녕!
//
// 참고: 문자열과 배열은 length, includes, indexOf 처럼 겹치는 것도 있어서
//       헷갈리기 쉽습니다. push / pop / splice 는 배열에만 있습니다.
