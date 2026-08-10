// 03_JS_02_조건문_반복문 개념코드 — 섹션 13. break - 반복문 즉시 종료 (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션13_break.js 로 실행하며 결과를 확인합니다.

// ── 섹션 13: break - 반복문 즉시 종료 ──────────────
console.log("===== 섹션 13: break =====");
// [기본] 찾는 값을 발견하면 반복문 전체를 빠져나감
for (let i = 0; i < 100; i++) {
  if (i === 3) {
    console.log("멈춰!");
    break;  // 100번 돌 예정이었지만 여기서 즉시 종료
  }
  console.log(i);
}
// 출력: 0
// 출력: 1
// 출력: 2
// 출력: 멈춰!
// [다른 방법] while (true) + break - 종료 조건을 블록 안에서 검사
let tryCount = 0;
while (true) {
  tryCount++;
  if (tryCount === 3) break;
}
console.log("반복 횟수:", tryCount);  // 출력: 반복 횟수: 3
// 실수: break 조건이 절대 실행되지 않으면 무한 루프 -> 조건 도달 가능성을 항상 확인
