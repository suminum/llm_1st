// ============================================================
// 부품 — 08단원 연습문제가 쓰는 값과 함수
// ------------------------------------------------------------
// 이 파일은 이미 다 되어 있습니다. 고치지 마세요.
// 전부 '이름 있는 export' 입니다. 가져올 때 중괄호가 필요합니다.
// ============================================================

export const americanoPrice = 4000;
export const lattePrice = 4500;
export const cakePrice = 6000;
export const riceBallPrice = 1200;

// 할인율 10%
export const discountRate = 0.1;

// 할인가를 돌려줍니다. 6000 을 넣으면 5400 이 나옵니다.
export function applyDiscount(price) {
  return price - price * discountRate;
}

// 숫자 뒤에 '원' 을 붙여 돌려줍니다. 4000 을 넣으면 "4000원" 이 나옵니다.
export function formatPrice(price) {
  return `${price}원`;
}
