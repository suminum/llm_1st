// ============================================================
// 14단원 연습문제 정답
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요.
// 다만 '왜 그렇게 되는지' 설명은 꼭 읽으세요. 답보다 그게 중요합니다.

// ───── 문제 1 · 2 · 3 ─────
// import 는 파일 맨 위에 모아 씁니다. 세 문제의 답이 여기 다 들어 있습니다.
import welcome, { SHIPPING_FEE, addShipping, toPercent as percent } from "./연습문제_도구.js";
// default(welcome) 가 앞, 중괄호가 뒤입니다. 순서가 반대면 SyntaxError 입니다.
// toPercent 는 as 로 이름을 바꿔 가져왔습니다.

// ───── 문제 1 ─────
console.log(SHIPPING_FEE);
// 출력: 3000
console.log(addShipping(12000));
// 출력: 15000

// ───── 문제 2 ─────
console.log(percent(0.35));
// 출력: 35%
// 원래 이름 toPercent 는 이제 쓸 수 없습니다. as 로 바꿨기 때문입니다.

// ───── 문제 3 ─────
console.log(welcome("김민준"));
// 출력: 우리편의점에 오신 김민준님 환영합니다
// default 라서 이름을 마음대로 지을 수 있습니다. hello 라고 해도 똑같이 동작합니다.
// STORE 는 export 가 없어서 가져올 수 없지만, welcome 안에서는 쓰입니다.

// ───── 문제 4 ─────
const randomScore = Math.floor(Math.random() * 100) + 1;
console.log(randomScore >= 1 && randomScore <= 100);
// 출력: true
// 공식: Math.floor(Math.random() * (최대 - 최소 + 1)) + 최소
//       최소 1, 최대 100 이므로 (100 - 1 + 1) = 100 입니다.

// ───── 문제 5 ─────
console.log(Number.isInteger(randomScore));
// 출력: true
// Math.floor 를 거쳤으니 정수입니다. 빠뜨렸다면 false 가 나옵니다.

// ───── 문제 6 ─────
const drinks = ["아메리카노", "라떼", "녹차", "주스"];

const picked = drinks[Math.floor(Math.random() * drinks.length)];
console.log(drinks.includes(picked));
// 출력: true
// length 에 +1 을 하면 가끔 undefined 가 뽑혀서 false 가 나옵니다.

// ───── 문제 7 ─────
const openDay = new Date(2026, 2, 5);
// 3월인데 2를 넣었습니다. 월은 0부터 세기 때문입니다.

console.log(openDay.getFullYear());
// 출력: 2026
console.log(openDay.getDate());
// 출력: 5

// ───── 문제 8 ─────
console.log(openDay.getMonth() + 1);
// 출력: 3
// getMonth() 만 쓰면 2가 나옵니다. 보여 줄 때는 항상 +1 입니다.

// ───── 문제 9 ─────
const mm = String(openDay.getMonth() + 1).padStart(2, "0");
const dd = String(openDay.getDate()).padStart(2, "0");
console.log(`${openDay.getFullYear()}-${mm}-${dd}`);
// 출력: 2026-03-05
// padStart 는 문자열 메소드입니다. 숫자에 바로 쓰면 TypeError 가 납니다.

// ───── 문제 10 · 11 ─────
class Menu {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  label() {
    return `${this.name} ${this.price}원`;
  }
}

const americano = new Menu("아메리카노", 4000);

// ───── 문제 10 ─────
console.log(americano.name, americano.price);
// 출력: 아메리카노 4000

// ───── 문제 11 ─────
console.log(americano.label());
// 출력: 아메리카노 4000원
// class 안에서는 label() { } 처럼 씁니다. label: function () 이 아닙니다.

// ───── 문제 12 ─────
const menuData = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

const menus = menuData.map(({ name, price }) => new Menu(name, price));
const expensive = menus.filter((m) => m.price >= 4500).map((m) => m.label());

console.log(expensive);
// 출력: [ '라떼 4500원', '케이크 6000원' ]
// map 안에서 new 로 객체를 만들 수 있습니다. 만들어진 것은 그냥 객체라
// filter 와 map 을 그대로 이어 쓸 수 있습니다. (08단원)

// ───── 문제 13 ─────
function daysUntilChristmas() {
  const today = new Date();
  const christmas = new Date(2026, 11, 25); // 12월이라 11
  const oneDay = 1000 * 60 * 60 * 24;

  return Math.ceil((christmas - today) / oneDay);
}

const left = daysUntilChristmas();
console.log(typeof left);
// 출력: number
console.log(Number.isInteger(left));
// 출력: true

// 오늘이 크리스마스를 지났다면 음수가 나옵니다. 그것도 정상입니다.
// Math.ceil 을 쓴 이유: 오늘이 12월 24일 오후라면 0.5일 정도가 남는데
// floor 를 쓰면 0일이 되어 "오늘이 크리스마스" 처럼 보입니다.
// ceil 은 1일로 올려 줍니다. 남은 날짜를 셀 때는 보통 ceil 이 자연스럽습니다.

// ───── 문제 14 ─────
// const bad = Menu("라떼", 4500);
//
// 에러: TypeError: Class constructor Menu cannot be invoked without 'new'
//
// 왜:
//   class 는 '틀' 이라서 그냥 부를 수 없습니다.
//   new 를 붙여야 그 틀로 객체를 하나 찍어 냅니다.
//
// 고치는 방법:
//   const good = new Menu("라떼", 4500);
//
// 다행히 class 는 이렇게 에러로 알려 줍니다.
// 07단원의 일반 함수였다면 에러 없이 undefined 만 나와서 더 헤맸을 겁니다.
