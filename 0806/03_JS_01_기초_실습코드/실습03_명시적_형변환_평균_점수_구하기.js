// 03_JS_01_기초 실습 정답코드 — 명시적 형변환 실습: 평균 점수 구하기 (JavaScript)
// Step 순서대로 따라가며 확인하세요.
// node 실습03_명시적_형변환_평균_점수_구하기.js 로 실행하며 결과를 확인합니다.

// ── 명시적 형변환 실습: 평균 점수 구하기 ──────────────
console.log("===== 명시적 형변환 실습: 평균 점수 구하기 =====");
// 문제: 변수 mathScore = "77", engScore = "88"을 만들고,
//       시험 점수 평균을 계산하여 avgScore에 저장한 뒤
//       console.log(avgScore)로 콘솔창에서 확인하세요.
//       형 변환을 사용하여 평균 점수가 정확하게 나와야 합니다!
//       (prompt로 입력받은 값은 항상 문자열이라는 점을 기억!)
let mathScore = "77";
let engScore = "88";
// Step 1: 형변환 없이 더하면? -> 문자열 연결이 되어 버림
console.log(mathScore + engScore);  // 출력: 7788 (원하는 결과가 아님!)
// Step 2: Number()로 숫자 변환 후 평균 계산
let avgScore = (Number(mathScore) + Number(engScore)) / 2;
// 바깥 괄호가 꼭 필요합니다 — 없으면 나눗셈이 먼저라 88 / 2 만 계산되어 77 + 44 = 121이 됩니다
// Step 3: 결과 확인
console.log(avgScore);  // 출력: 82.5
