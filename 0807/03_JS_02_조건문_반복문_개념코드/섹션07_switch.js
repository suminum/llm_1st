// 03_JS_02_조건문_반복문 개념코드 — 섹션 7. switch (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션07_switch.js 로 실행하며 결과를 확인합니다.

// ── 섹션 7: switch ──────────────
console.log("===== 섹션 7: switch =====");
// if와 언제 나눠 쓰나:
//   값 하나를 여러 후보와 "같은지"만 비교 → switch (메뉴 코드, 등급, 요일)
//   범위 비교(>, <)나 복잡한 조건        → if / else if
// switch의 비교는 === 방식이라 "2"와 2를 다른 값으로 봅니다.
// [기본] 소괄호의 변수 값이 case 값과 일치하는 블록을 실행
let gradeLevel = 2;
switch (gradeLevel) {
  case 1:
    console.log("1학년");
    break;
  case 2:
    console.log("2학년");  // 출력: 2학년
    break;
  default:
    console.log("알 수 없는 학년");  // 일치하는 case가 없을 때 실행
    break;
}
// 실수: case 안의 break를 빼먹으면 아래 case까지 줄줄이 실행됨 (fall-through)
// 비유 — 엘리베이터: case는 "몇 층에서 내릴지" 정하는 것뿐이고,
// break가 있어야 실제로 내립니다. 없으면 문이 안 닫혀 아래층까지 쭉 끌려 내려갑니다.
// (case 1의 break를 지우고 gradeLevel = 1로 실행하면 세 줄이 한꺼번에 찍힙니다)
// 마지막 default의 break는 사실 없어도 되지만 습관으로 붙입니다 —
// 나중에 case를 더 추가할 때 사고가 나는 걸 막아 줍니다.
