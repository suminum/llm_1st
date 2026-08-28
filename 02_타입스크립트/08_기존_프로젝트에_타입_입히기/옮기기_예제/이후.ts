// ============================================================
// 08단원 · 개념02 부속 — 옮긴 뒤의 코드
// ------------------------------------------------------------
// 실행: node 08_기존_프로젝트에_타입_입히기/옮기기_예제/이후.ts
// 검사: npm run typecheck
// ============================================================
//
// 옆의 이전.js 와 같은 코드입니다. 달라진 것은 두 가지뿐입니다.
//
//   ① 확장자가 .ts
//   ② 매개변수에 타입을 적음
//
// 그랬더니 이전.js 가 조용히 틀리던 곳이 드러났습니다.
// ============================================================

type CartItem = {
  name: string;
  price: number;
  count: number;
};

function getTotal(items: CartItem[]): number {
  let sum = 0;
  for (const item of items) {
    sum += item.price * item.count;
  }
  return sum;
}

function withShipping(total: number, shipping: number): number {
  return total + shipping;
}

function describe(item: CartItem): string {
  return item.name + " " + item.count + "잔";
}

const cart: CartItem[] = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "라떼", price: 4500, count: 1 },
];

const shippingText = "3000";

// ── 여기가 이전.js 가 조용히 틀리던 자리입니다 ──
//
// 에러: TS2345 Argument of type 'string' is not assignable to parameter of type 'number'.
// console.log("총액:", withShipping(getTotal(cart), shippingText) + "원");
//
// 실수: 이전.js 에서는 이 줄이 "125003000원" 을 조용히 내놓았습니다.
//       withShipping 의 shipping 에 : number 를 적었더니 그 자리에서 걸립니다.
//       고치는 방법은 넘기기 전에 숫자로 바꾸는 것입니다.

const first = cart[0];
console.log(first === undefined ? "빈 장바구니" : describe(first));
// 출력: 아메리카노 2잔

console.log("상품 합계:", getTotal(cart));
// 출력: 상품 합계: 12500

console.log("총액:", withShipping(getTotal(cart), Number(shippingText)) + "원");
// 출력: 총액: 15500원

// 15500원. 이제 맞습니다.
//
// 고친 것은 Number( ) 한 번뿐인데, 그것을 '어디서' 고쳐야 하는지를
// 타입이 정확히 짚어 줬다는 것이 핵심입니다.
// 이전.js 에서는 화면에 125003000원이 찍히고 나서야 찾기 시작했을 것입니다.
