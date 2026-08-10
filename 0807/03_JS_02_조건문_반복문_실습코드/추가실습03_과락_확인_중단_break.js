// 03_JS_02_조건문_반복문 실습 정답코드 — [추가 실습] 과락 확인 중단 - break (보너스 — 빨리 끝냈다면 도전해 보세요) (JavaScript)
// Step 순서대로 따라가며 확인하세요.
// node 추가실습03_과락_확인_중단_break.js 로 실행하며 결과를 확인합니다.

// ── [추가 실습] 과락 확인 중단 - break (보너스 — 빨리 끝냈다면 도전해 보세요) ──
console.log("===== [추가 실습] 과락 확인 중단 =====");
// 문제: 과목별 시험 점수 배열을 앞에서부터 확인해, 처음 발견한 과락 점수(60점 미만)에서
//       확인을 중단(break)하세요.
// Step 1: while로 배열 순회, 과락 점수 발견 시 break
const subjectScores = [82, 91, 75, 48, 88, 30];
let idx = 0;
while (idx < subjectScores.length) {
  if (subjectScores[idx] < 60) {
    console.log(`${idx}번 과목 과락(${subjectScores[idx]}점) - 확인 중단`);
    break;  // 과락 과목을 찾았으니 반복 전체 종료
  }
  console.log(`${idx}번 과목 통과(${subjectScores[idx]}점)`);
  idx++;
}
// 출력: 0번 과목 통과(82점)
// 출력: 1번 과목 통과(91점)
// 출력: 2번 과목 통과(75점)
// 출력: 3번 과목 과락(48점) - 확인 중단
