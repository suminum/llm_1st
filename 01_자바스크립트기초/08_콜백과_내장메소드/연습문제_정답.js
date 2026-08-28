// ============================================================
// 08단원 연습문제 정답 — 콜백과 내장 메소드
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


function runTwice(callback) {
  callback();
  callback();
}


// ───── 문제 1 ─────
function printAttendance() {
  console.log("출석");
}
runTwice(printAttendance);
// 출력: 출석
// 출력: 출석
// runTwice(printAttendance()) 라고 쓰면 "출석" 이 한 번만 찍히고
// 그 결과인 undefined 가 넘어가 TypeError 가 납니다.


// ───── 문제 2 ─────
runTwice(() => console.log("화이팅"));
// 출력: 화이팅
// 출력: 화이팅
// 한 번만 쓸 함수는 이름을 붙이지 않고 그 자리에서 만듭니다.


// ───── 문제 3 ─────
const nums3 = [10, 20, 30];
nums3.forEach((n) => console.log(n));
// 출력: 10
// 출력: 20
// 출력: 30


// ───── 문제 4 ─────
const subjects4 = ["국어", "영어", "수학"];
subjects4.forEach((subject, index) => {
  console.log(`${index + 1}. ${subject}`);
});
// 출력: 1. 국어
// 출력: 2. 영어
// 출력: 3. 수학
// 콜백에 넘어오는 순서는 (값, 인덱스) 로 고정입니다.


// ───── 문제 5 ─────
const menu5 = [
  { name: "아메리카노", price: 4000 },
  { name: "케이크", price: 6000 },
];

menu5.forEach((item) => {
  console.log(`${item.name} ${item.price}원`);
});
// 출력: 아메리카노 4000원
// 출력: 케이크 6000원


// ───── 문제 6 ─────
const nums6 = [1, 2, 3];
console.log(nums6.map((n) => n * 2));
// 출력: [ 2, 4, 6 ]
// forEach 를 쓰면 undefined 가 나옵니다. 새 배열이 필요하면 map 입니다.


// ───── 문제 7 ─────
const scores7 = [90, 85, 70];
console.log(scores7.map((s) => `${s}점`));
// 출력: [ '90점', '85점', '70점' ]
// map 은 자료형을 바꿔도 됩니다. 숫자 배열이 문자열 배열이 되었습니다.


// ───── 문제 8 ─────
const users8 = [
  { name: "김민준", age: 20 },
  { name: "이서연", age: 22 },
  { name: "박지훈", age: 28 },
];

console.log(users8.map((user) => user.name));
// 출력: [ '김민준', '이서연', '박지훈' ]


// ───── 문제 9 ─────
const scores9 = [90, 55, 78, 40, 88];
console.log(scores9.filter((score) => score >= 60));
// 출력: [ 90, 78, 88 ]
// filter 의 콜백은 조건식(true/false)을 돌려줘야 합니다.


// ───── 문제 10 ─────
const products10 = [
  { name: "아메리카노", price: 4000, stock: 10 },
  { name: "라떼", price: 4500, stock: 0 },
  { name: "케이크", price: 6000, stock: 3 },
  { name: "쿠키", price: 3000, stock: 0 },
];

console.log(products10.filter((p) => p.stock === 0).map((p) => p.name));
// 출력: [ '라떼', '쿠키' ]
// filter 로 고르고 map 으로 모양을 바꿉니다. 이렇게 이어 쓰는 것이 체이닝입니다.


// ───── 문제 11 ─────
console.log(products10.find((p) => p.name === "케이크").price);
// 출력: 6000
// filter 를 쓰면 배열이 나와서 [0].price 라고 써야 합니다.
// 하나만 찾을 거면 처음부터 find 를 쓰세요.
//
// 없을 수도 있는 값이라면 ?. 를 붙이는 게 안전합니다.
// 아래 주석을 풀면 "없음" 이 찍힙니다. 확인했으면 다시 주석 처리하세요.
// console.log(products10.find((p) => p.name === "녹차")?.price ?? "없음");


// ───── 문제 12 ─────
console.log(products10.findIndex((p) => p.stock === 0));
// 출력: 1
// 못 찾으면 -1 입니다.


// ───── 문제 13 ─────
console.log(products10.some((p) => p.stock === 0));
// 출력: true
console.log(products10.every((p) => p.price >= 5000));
// 출력: false
// some 은 "하나라도", every 는 "전부" 입니다.


// ───── 문제 14 ─────
const nums14 = [10, 20, 30, 40];
console.log(nums14.reduce((acc, n) => acc + n, 0));
// 출력: 100
// 마지막 0 이 시작값입니다. 빠뜨리면 빈 배열에서 에러가 납니다.


// ───── 문제 15 ─────
const cart15 = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
  { name: "쿠키", price: 3000, count: 3 },
];

console.log(cart15.reduce((acc, item) => acc + item.price * item.count, 0));
// 출력: 23000

// [다른 방법] map 으로 금액을 만든 뒤 더해도 됩니다.
// console.log(cart15.map((i) => i.price * i.count).reduce((a, b) => a + b, 0));


// ───── 문제 16 ─────
const nums16 = [10, 9, 100, 1];
console.log(nums16.sort((a, b) => a - b));
// 출력: [ 1, 9, 10, 100 ]
// 그냥 sort() 를 쓰면 [ 1, 10, 100, 9 ] 가 됩니다. 사전 순으로 비교하기 때문입니다.


// ───── 문제 17 ─────
// 원본을 지켜야 하므로 slice() 로 복사한 뒤 정렬합니다. (06단원 개념03)
console.log(products10.slice().sort((a, b) => a.price - b.price).map((p) => p.name));
// 출력: [ '쿠키', '아메리카노', '라떼', '케이크' ]

console.log(products10.map((p) => p.name));
// 출력: [ '아메리카노', '라떼', '케이크', '쿠키' ]
// 원본은 그대로입니다. 복사 없이 정렬했다면 원본 순서가 망가졌을 겁니다.


// ───── 문제 18 ─────
const assets18 = products10
  .filter((p) => p.stock > 0)
  .reduce((acc, p) => acc + p.price * p.stock, 0);

console.log(`재고 자산 ${assets18}원`);
// 출력: 재고 자산 58000원
// 아메리카노 4000 × 10 = 40000
// 케이크     6000 × 3  = 18000
// 라떼·쿠키는 재고가 0이라 filter 에서 빠졌습니다.


// ───── 문제 19 ─────
const votes19 = ["짜장", "짬뽕", "짜장", "볶음밥", "짜장", "짬뽕"];

const counts19 = votes19.reduce((acc, item) => {
  acc[item] = (acc[item] ?? 0) + 1;
  return acc; // 이 return 을 빠뜨리면 다음 바퀴의 acc 가 undefined 가 됩니다
}, {});

console.log(counts19);
// 출력: { '짜장': 3, '짬뽕': 2, '볶음밥': 1 }

// [다른 방법] 반복문으로 쓰면 이해하기 쉽습니다.
// const counts = {};
// for (const item of votes19) {
//   counts[item] = (counts[item] ?? 0) + 1;
// }


// ───── 문제 20 ─────
// const scoreObject = { 국어: 90, 영어: 85 };
// scoreObject.forEach((v) => console.log(v));
//
// 에러: TypeError: scoreObject.forEach is not a function
//
// 왜:
//   forEach 는 '배열'이 가진 메소드입니다. 객체에는 없습니다.
//   객체는 순서가 아니라 이름으로 되어 있어서 "하나씩 순서대로" 라는 개념이 다릅니다.
//
// 해결:
//   07단원에서 배운 방법을 씁니다.
//
//   for (const key in scoreObject) { ... }
//   Object.keys(scoreObject).forEach((key) => { ... });
//   Object.values(scoreObject).forEach((value) => { ... });
//   Object.entries(scoreObject).forEach(([key, value]) => { ... });
//   (([key, value]) 처럼 괄호 안에서 바로 쪼개는 것은 09단원에서 배웁니다)
//
//   Object.keys / values / entries 는 '배열'을 돌려주므로
//   그 뒤에는 forEach, map, filter 를 마음껏 이어 쓸 수 있습니다.
