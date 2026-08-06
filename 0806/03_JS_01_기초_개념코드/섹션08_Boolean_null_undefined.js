// 03_JS_01_기초 개념코드 — 섹션 8. Boolean / null / undefined (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션08_Boolean_null_undefined.js 로 실행하며 결과를 확인합니다.

// ── 섹션 8: Boolean / null / undefined ──────────────
console.log("===== 섹션 8: Boolean / null / undefined =====");
// Boolean이 중요한 이유: 내일 배울 if 문이 "참인가 거짓인가"만 보고 갈림길을 정합니다.
// 즉 모든 조건문의 재료가 boolean입니다.
// [기본] Boolean은 true, false 두 가지 값만 가짐
let checked = true;    // 따옴표를 붙이면 안 됩니다 — "true"는 boolean이 아니라 문자열입니다
let isShow = 5 < 3;    // 비교 결과가 boolean으로 저장됨
//           └ 크기 비교 기호입니다. 5는 3보다 작지 않으니 false.
//             비교 연산자는 섹션 15에서 정식으로 배웁니다 — 여기서는 "결과가 boolean"만 보세요.
// 이 줄이 중요합니다. boolean은 내가 손으로 적는 값만이 아니라
// "컴퓨터가 판정해서 담아 주는 값"이기도 합니다. 9일차 조건문이 여기서 출발합니다.
// 이름 관례: boolean 변수는 is / has 로 시작시킵니다 (isShow, isStudent, hasCoupon).
// 이름만 보고도 true/false가 들었다는 걸 알 수 있게 하려는 것입니다.
console.log(checked);  // 출력: true
console.log(isShow);   // 출력: false
// [기본] undefined: 값을 안 넣으면 JS가 자동 부여 / null: 개발자가 "지금 비어있다"고 의도적 표시
let notYet;            // 자동 할당
let selected = null;   // 의도적 부재
console.log(notYet);   // 출력: undefined
console.log(selected); // 출력: null
// 비유: 아예 안 쓴 칸(undefined) vs 빗금 긋고 "해당 없음"이라 적은 칸(null).
// 종이는 둘 다 비어 있지만 뜻이 다릅니다 —
// 전자는 "아직 안 정해짐", 후자는 "없다고 내가 확인함"입니다.

// [다른 방법] boolean이 아닌 값도 참·거짓처럼 취급됩니다 (9일차 조건문의 밑바탕)
// 거짓처럼 취급되는 값 여섯 개만 외우면 나머지는 전부 참입니다:
//   false · 0 · ""(빈 문자열) · null · undefined · NaN
console.log(Boolean(0));     // 출력: false
console.log(Boolean(""));    // 출력: false   빈 문자열은 거짓
console.log(Boolean("0"));   // 출력: true    "0"은 글자가 들어 있으니 참!
console.log(Boolean([]));    // 출력: true    빈 배열도 참 (0이나 ""와 다릅니다)
// 그래서 내일 if (userName) 처럼 쓰면 "이름이 비어 있지 않은가"를 검사할 수 있습니다.
