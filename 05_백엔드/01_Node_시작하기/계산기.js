// ============================================================
// 01단원 · 계산기 — 개념02에서 '가져다 쓰는' 파일
// ------------------------------------------------------------
// 이 파일은 직접 실행하지 않습니다.
// 개념02_모듈_불러오기.js 가 여기서 필요한 것을 꺼내 씁니다.
// ============================================================
//
// 이렇게 '기능을 따로 담아 두고 필요할 때 꺼내 쓰는 파일' 을
// 모듈(module)이라고 부릅니다.

const TAX_RATE = 0.1;

function add(a, b) {
  return a + b;
}

function addTax(price) {
  return Math.round(price * (1 + TAX_RATE));
}

// 이 파일 안에서만 쓰는 값입니다. 밖으로 안 내보냅니다.
const SECRET_KEY = "밖으로 안 나갑니다";

function keyLength() {
  return SECRET_KEY.length;
}

// ── 내보내기 ──
//
// module.exports 에 담은 것만 밖에서 쓸 수 있습니다.
// 담지 않은 것(SECRET_KEY)은 이 파일 안의 비밀입니다.

module.exports = {
  TAX_RATE,
  add,
  addTax,
  keyLength,
};

// { TAX_RATE, add, ... } 는 { TAX_RATE: TAX_RATE, add: add, ... } 의 줄임입니다.
// 이름과 값이 같으면 한 번만 써도 됩니다. (JS자료 09단원 객체 속성 축약)
