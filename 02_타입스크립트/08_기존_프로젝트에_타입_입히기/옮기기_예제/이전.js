// ============================================================
// 08단원 · 개념02 부속 — 옮기기 전의 코드 (그냥 자바스크립트)
// ------------------------------------------------------------
// ★ 이 파일은 .js 입니다. 일부러 고치지 않은 채 두었습니다.
//
// 실행해 보세요. 에러 한 줄 없이 끝까지 돌아갑니다.
//
//     node 08_기존_프로젝트에_타입_입히기/옮기기_예제/이전.js
//
// 그런데 마지막 줄의 총액을 보세요. 맞나요?
// 상품 12,500원 + 배송비 3,000원 = 15,500원이어야 합니다.
// ============================================================

function getTotal(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price * item.count;
  }
  return sum;
}

function withShipping(total, shipping) {
  return total + shipping;
}

function describe(item) {
  return item.name + " " + item.count + "잔";
}

const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "라떼", price: 4500, count: 1 },
];

// 배송비는 화면 입력창에서 온 값이라 문자열입니다.
const shippingText = "3000";

console.log(describe(cart[0]));
console.log("상품 합계:", getTotal(cart));
console.log("총액:", withShipping(getTotal(cart), shippingText) + "원");
