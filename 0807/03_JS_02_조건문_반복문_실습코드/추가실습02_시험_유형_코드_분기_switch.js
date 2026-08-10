// 03_JS_02_조건문_반복문 실습 정답코드 — [추가 실습] 시험 유형 코드 분기 - switch (보너스 — 빨리 끝냈다면 도전해 보세요) (JavaScript)
// Step 순서대로 따라가며 확인하세요.
// node 추가실습02_시험_유형_코드_분기_switch.js 로 실행하며 결과를 확인합니다.

// ── [추가 실습] 시험 유형 코드 분기 - switch (보너스 — 빨리 끝냈다면 도전해 보세요) ──
console.log("===== [추가 실습] 시험 유형 코드 분기 =====");
// 문제: 시험 유형 코드(1 중간고사 / 2 기말고사 / 3 모의고사)를 switch로 분기하세요.
// Step 1: switch - case마다 break 필수
const examTypeCode = 3;
switch (examTypeCode) {
  case 1:
    console.log("중간고사 기간");
    break;
  case 2:
    console.log("기말고사 기간");
    break;
  case 3:
    console.log("모의고사 - 성적표 배부 예정");  // 출력: 모의고사 - 성적표 배부 예정
    break;
  default:
    console.log("알 수 없는 코드");
    break;
}
