// ============================================================
// 07단원 연습문제 정답 — 객체와 메소드
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
const user1 = { name: "이서연", age: 22 };
console.log(user1);
// 출력: { name: '이서연', age: 22 }


// ───── 문제 2 ─────
const book2 = { title: "자바스크립트 입문", price: 25000, author: "김작가" };
console.log(book2.price);
// 출력: 25000


// ───── 문제 3 ─────
const key3 = "author";
console.log(book2[key3]);
// 출력: 김작가
// book2.key3 이라고 쓰면 "key3" 라는 이름의 속성을 찾아 undefined 가 됩니다.
// 이름이 변수에 들어 있을 때는 대괄호 표기법을 씁니다.


// ───── 문제 4 ─────
const product4 = {
  name: "무선 이어폰",
  seller: { name: "봄날전자", rating: 4.8 },
};
console.log(product4.seller.name);
// 출력: 봄날전자
// 객체 안의 객체는 점을 이어 붙입니다.


// ───── 문제 5 ─────
const empty5 = {};
console.log(empty5.seller?.name ?? "판매자 미정");
// 출력: 판매자 미정
// ?. 은 앞이 없으면 거기서 멈추고 undefined 를 냅니다. 에러가 나지 않습니다.
// ?? 는 왼쪽이 null 이나 undefined 일 때만 오른쪽 값을 씁니다.


// ───── 문제 6 ─────
const car6 = {};
car6.brand = "현대";
car6.year = 2024;
console.log(car6);
// 출력: { brand: '현대', year: 2024 }
// 없는 이름에 값을 넣으면 새 속성이 생깁니다.


// ───── 문제 7 ─────
const item7 = { name: "케이크", stock: 3 };
item7.stock = 0;
console.log(item7);
// 출력: { name: '케이크', stock: 0 }
// 추가와 수정의 문법이 같습니다. 이름을 오타 내면 새 속성이 생기니 주의하세요.


// ───── 문제 8 ─────
const sale8 = { name: "이어폰", price: 89000, oldPrice: 120000 };
delete sale8.oldPrice;
console.log(sale8);
// 출력: { name: '이어폰', price: 89000 }
// 배열에는 delete 를 쓰면 안 되지만 객체에는 써도 됩니다.


// ───── 문제 9 ─────
const config9 = { theme: "dark", fontSize: 14 };
console.log("theme" in config9);
// 출력: true
console.log("language" in config9);
// 출력: false
// in 의 왼쪽은 반드시 따옴표로 감싼 문자열입니다.


// ───── 문제 10 ─────
const origin10 = { name: "박지훈", age: 30 };

// const copy10 = origin10;  ← 이건 복사가 아닙니다. 원본까지 바뀝니다.
const copy10 = { ...origin10 };

copy10.age = 99;

console.log(copy10);
// 출력: { name: '박지훈', age: 99 }
console.log(origin10);
// 출력: { name: '박지훈', age: 30 }


// ───── 문제 11 ─────
const person11 = {
  name: "최유진",
  introduce() {
    console.log(`안녕하세요, ${this.name}입니다`);
  },
};

person11.introduce();
// 출력: 안녕하세요, 최유진입니다
// 화살표 함수로 만들면 this 가 person11 을 가리키지 않아 undefined 가 나옵니다.


// ───── 문제 12 ─────
const counter12 = {
  count: 0,
  increase() {
    this.count++;
  },
};

counter12.increase();
counter12.increase();
counter12.increase();

console.log(counter12.count);
// 출력: 3


// ───── 문제 13 ─────
const user13 = { name: "정하늘", age: 28, city: "대구" };

for (const key in user13) {
  console.log(`${key}: ${user13[key]}`);
}
// 출력: name: 정하늘
// 출력: age: 28
// 출력: city: 대구
// for...in 은 '이름'을 줍니다. 값은 user13[key] 로 꺼냅니다.
// user13.key 라고 쓰면 undefined 가 세 번 나옵니다.


// ───── 문제 14 ─────
const scores14 = { 국어: 90, 영어: 85, 수학: 70, 과학: 95 };
console.log(Object.keys(scores14).length);
// 출력: 4
// 객체에는 .length 가 없습니다. Object.keys 로 배열을 만든 뒤 세야 합니다.


// ───── 문제 15 ─────
let sum15 = 0;
for (const score of Object.values(scores14)) {
  sum15 += score;
}
console.log(sum15);
// 출력: 340


// ───── 문제 16 ─────
const products16 = [
  { name: "아메리카노", price: 4000, stock: 10 },
  { name: "라떼", price: 4500, stock: 0 },
  { name: "케이크", price: 6000, stock: 3 },
];

console.log(products16[1].name);
// 출력: 라떼
console.log(products16[2].price);
// 출력: 6000
// 배열[인덱스].속성 순서로 꺼냅니다.
// products16 은 배열이므로 products16.name 이라고 쓰면 undefined 입니다.


// ───── 문제 17 ─────
for (const product of products16) {
  console.log(`${product.name} ${product.price}원`);
}
// 출력: 아메리카노 4000원
// 출력: 라떼 4500원
// 출력: 케이크 6000원

// 재고가 0인 상품 찾기
let soldOut17 = null;
for (const product of products16) {
  if (product.stock === 0) {
    soldOut17 = product;
    break; // 찾았으니 더 볼 필요가 없습니다
  }
}

console.log(`품절: ${soldOut17.name}`);
// 출력: 품절: 라떼

// 못 찾았을 수도 있으므로 null 로 시작했습니다.
// 실제로는 쓰기 전에 확인하는 습관을 들이세요.
//   console.log(soldOut17 ? `품절: ${soldOut17.name}` : "품절 상품 없음");
// 08단원에서 배울 find 를 쓰면 이 반복문이 한 줄이 됩니다.


// ───── 문제 18 ─────
const cart16 = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
  { name: "쿠키", price: 3000, count: 3 },
];

let total16 = 0;
for (const item of cart16) {
  const sub = item.price * item.count;
  console.log(`${item.name} x${item.count} = ${sub}원`);
  total16 += sub;
}
// 출력: 아메리카노 x2 = 8000원
// 출력: 케이크 x1 = 6000원
// 출력: 쿠키 x3 = 9000원

console.log(`합계 ${total16}원`);
// 출력: 합계 23000원


// ───── 문제 19 ─────
const students17 = [
  { name: "김민준", scores: [90, 85, 70] },
  { name: "이서연", scores: [95, 88, 92] },
  { name: "박지훈", scores: [60, 75, 80] },
];

let topName = "";
let topAverage = 0;

for (const student of students17) {
  // 학생 한 명의 평균 구하기
  let sum = 0;
  for (const score of student.scores) {
    sum += score;
  }
  const average = sum / student.scores.length;

  // 지금까지 최고보다 높으면 갈아치우기
  if (average > topAverage) {
    topAverage = average;
    topName = student.name;
  }
}

console.log(`${topName} ${topAverage.toFixed(1)}`);
// 출력: 이서연 91.7

// 중첩 반복문입니다. 바깥은 학생, 안쪽은 그 학생의 점수입니다.
// 평균을 비교할 때는 toFixed 로 다듬기 '전'의 숫자로 비교해야 합니다.
// toFixed 의 결과는 문자열이라 크기 비교가 사전 순이 되어 버립니다.


// ───── 문제 20 ─────
// const empty18 = {};
// console.log(empty18.seller.name);
//
// 에러: TypeError: Cannot read properties of undefined (reading 'name')
//
// 왜:
//   empty18.seller 는 undefined 입니다. 여기까지는 에러가 안 납니다.
//   그런데 undefined 에서 다시 .name 을 꺼내려 하면 에러가 납니다.
//   "없는 것 안에서 무언가를 꺼낼 수는 없다" 는 뜻입니다.
//
// 해결:
//   console.log(empty18.seller?.name);              // 출력: undefined
//   console.log(empty18.seller?.name ?? "없음");     // 출력: 없음
//
//   또는 03단원에서 배운 && 로 먼저 확인해도 됩니다.
//   if (empty18.seller && empty18.seller.name) { ... }
