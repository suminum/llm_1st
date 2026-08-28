// ============================================================
// 15단원 · 도구모음 — 개념01에서 '가져다 쓰는' 파일
// ------------------------------------------------------------
// 이 파일은 직접 실행하지 않습니다.
// 개념01_모듈.js 가 여기서 필요한 것만 꺼내 씁니다.
// ============================================================
//
// 이렇게 '다른 파일에 나눠 담아 두고 필요할 때 꺼내 쓰는 파일'을
// 모듈(module)이라고 부릅니다.

// ── 내보내기 (export) ──

// 값 앞에 export 를 붙이면 "이건 밖에서 가져다 써도 됩니다" 라는 뜻입니다.
export const TAX_RATE = 0.1;

export function addTax(price) {
  return Math.round(price * (1 + TAX_RATE));
}

export function formatWon(price) {
  return `${price.toLocaleString()}원`;
}

// export 를 안 붙이면 이 파일 안에서만 쓸 수 있습니다.
// 밖에서 가져가려고 하면 에러가 납니다.
const SECRET = "이건 밖으로 안 나갑니다";

// 안 내보낸 것도 이 파일 안에서는 자유롭게 쓸 수 있습니다.
export function peek() {
  return SECRET.length;
}

// ── 기본으로 내보내기 (export default) ──

// 파일마다 딱 하나만 지정할 수 있습니다.
// "이 파일의 대표 선수" 라고 생각하면 됩니다.
export default function greet(name) {
  return `${name}님 안녕하세요`;
}
