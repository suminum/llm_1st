// ============================================================
// 03단원 연습문제 정답 — 조건문
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
const temp1 = 33;
if (temp1 >= 33) {
  console.log("폭염 주의보");
}
// 출력: 폭염 주의보


// ───── 문제 2 ─────
const balance1 = 0;
if (balance1 === 0) {
  console.log("잔액이 부족합니다");
  console.log("충전해 주세요");
}
// 출력: 잔액이 부족합니다
// 출력: 충전해 주세요
// 중괄호 안에 여러 줄을 넣을 수 있습니다.


// ───── 문제 3 ─────
const memo1 = "";
if (!memo1) {
  console.log("메모 없음");
}
// 출력: 메모 없음
// memo1 === "" 라고 써도 맞습니다. 뜻이 더 분명해서 이쪽이 나을 때도 많습니다.


// ───── 문제 4 ─────
const age4 = 15;
if (age4 >= 19) {
  console.log("성인");
} else {
  console.log("미성년자");
}
// 출력: 미성년자


// ───── 문제 5 ─────
const score5 = 72;
if (score5 >= 90) {
  console.log("A");
} else if (score5 >= 80) {
  console.log("B");
} else if (score5 >= 70) {
  console.log("C");
} else {
  console.log("F");
}
// 출력: C
// 큰 수부터 내려오는 순서입니다. 70을 먼저 쓰면 90점도 C가 됩니다.


// ───── 문제 6 ─────
const total6 = 30000;
if (total6 >= 50000) {
  console.log("배송비 0원");
} else if (total6 >= 30000) {
  console.log("배송비 1500원");
} else {
  console.log("배송비 3000원");
}
// 출력: 배송비 1500원


// ───── 문제 7 ─────
const age7 = 70;
const member7 = true;

// 두 조건은 서로 무관하므로 if 를 따로 씁니다.
if (age7 >= 65) {
  console.log("경로 할인");
}
if (member7) {
  console.log("회원 할인");
}
// 출력: 경로 할인
// 출력: 회원 할인
// else if 로 이으면 "경로 할인" 하나만 나옵니다.


// ───── 문제 8 ─────
const member8 = true;
const total8 = 60000;
if (member8 && total8 >= 50000) {
  console.log("무료 배송");
}
// 출력: 무료 배송


// ───── 문제 9 ─────
const day9 = "일";
if (day9 === "토" || day9 === "일") {
  console.log("주말입니다");
}
// 출력: 주말입니다
// day9 === "토" || "일" 이라고 쓰면 안 됩니다. 비교를 양쪽에 다 써야 합니다.


// ───── 문제 10 ─────
const nickname10 = null;

// && 는 왼쪽이 false 면 오른쪽을 아예 계산하지 않습니다.
// 그래서 nickname10 이 null 이어도 .length 를 건드리지 않아 에러가 안 납니다.
if (nickname10 && nickname10.length > 0) {
  console.log(nickname10);
} else {
  console.log("닉네임 없음");
}
// 출력: 닉네임 없음


// ───── 문제 11 ─────
const profile11 = "";
console.log(profile11 || "기본이미지.png");
// 출력: 기본이미지.png


// ───── 문제 12 ─────
const menu12 = "케이크";
switch (menu12) {
  case "아메리카노":
    console.log("4000원");
    break;
  case "라떼":
    console.log("4500원");
    break;
  case "케이크":
    console.log("6000원");
    break;
  default:
    console.log("메뉴에 없습니다");
}
// 출력: 6000원


// ───── 문제 13 ─────
const grade13 = "C";
switch (grade13) {
  case "A":
  case "B":
    console.log("합격");
    break;
  case "C":
  case "D":
    console.log("재시험");
    break;
}
// 출력: 재시험
// case "C": 아래에 코드가 없으니 case "D": 로 흘러내려 같은 코드를 실행합니다.


// ───── 문제 14 ─────
const age14 = 20;
console.log(age14 >= 19 ? "성인" : "미성년자");
// 출력: 성인


// ───── 문제 15 ─────
const stock15 = 0;
console.log(stock15 === 0 ? "품절" : `재고 ${stock15}개`);
// 출력: 품절

// [다른 방법] 변수에 담아서 쓰면 더 읽기 쉽습니다.
// const stockText = stock15 === 0 ? "품절" : `재고 ${stock15}개`;
// console.log(stockText);


// ───── 문제 16 ─────
const price16 = 1200;
const count16 = 5;
const member16 = true;

const rawTotal16 = price16 * count16; // 6000
// 회원이면 10% 할인 = 90% 만 낸다
const finalTotal16 = member16 ? Math.round(rawTotal16 * 0.9) : rawTotal16;

console.log(`합계 ${finalTotal16}원`);
// 출력: 합계 5400원

// 이 계산은 마침 딱 떨어지지만, 할인율에 따라서는
// 5400.000000000001 같은 값이 나옵니다. (02단원 개념01 소수 오차)
// 돈 계산은 마지막에 Math.round 로 다듬는 습관을 들이세요.


// ───── 문제 17 ─────
const age17 = 25;
const member17 = true;
const total17 = 120000;

if (member17 && total17 >= 100000) {
  console.log("VIP");
} else if (member17) {
  console.log("일반회원");
} else {
  console.log("비회원");
}
// 출력: VIP

// 순서가 중요합니다. member17 만 검사하는 조건을 위에 두면
// VIP 인 사람도 "일반회원" 에서 걸려 버립니다.
// age17 은 조건에 쓰이지 않습니다. 주어진 값을 다 써야 하는 건 아닙니다.


// ───── 문제 18 ─────
// const nullMemo = null;
// console.log(nullMemo.length);
//
// 에러: TypeError: Cannot read properties of null (reading 'length')
//
// 왜:
//   null 은 "값이 없음" 이라 안에서 꺼낼 게 아무것도 없습니다.
//   없는 것에서 .length 를 꺼내려 하니 에러가 납니다.
//
// 해결:
//   먼저 값이 있는지 확인하고, 있을 때만 꺼냅니다.
//   if (nullMemo && nullMemo.length > 0) { ... }
//   && 는 왼쪽이 false 면 오른쪽을 계산조차 하지 않기 때문에 안전합니다.
