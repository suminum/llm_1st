// ============================================================
// 14단원 연습문제 · 도구 파일
// ------------------------------------------------------------
// 이 파일은 직접 실행하지 않습니다.
// 연습문제.js 가 여기서 필요한 것을 가져다 씁니다.
// 문제 1~3을 풀려면 이 파일을 먼저 읽어 보세요.
// ============================================================

// 이름을 지정해서 내보낸 것들
export const SHIPPING_FEE = 3000;

export function addShipping(price) {
  return price + SHIPPING_FEE;
}

export function toPercent(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

// 이 파일에만 있는 값 (export 가 없으니 밖에서 못 가져갑니다)
const STORE = "우리편의점";

// 기본으로 내보낸 것 (파일당 하나)
export default function welcome(name) {
  return `${STORE}에 오신 ${name}님 환영합니다`;
}
