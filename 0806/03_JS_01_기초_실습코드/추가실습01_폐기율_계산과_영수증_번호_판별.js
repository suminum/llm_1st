// 03_JS_01_기초 실습 정답코드 — [추가 실습] 폐기율 계산과 영수증 번호 판별 (보너스 — 빨리 끝냈다면 도전해 보세요) (JavaScript)
// Step 순서대로 따라가며 확인하세요.
// node 추가실습01_폐기율_계산과_영수증_번호_판별.js 로 실행하며 결과를 확인합니다.

// ── [추가 실습] 폐기율 계산과 영수증 번호 판별 (보너스 — 빨리 끝냈다면 도전해 보세요) ──
console.log("===== [추가 실습] 폐기율 계산과 영수증 번호 판별 =====");
// 문제: 오늘 편의점에 진열한 상품 1250개 중 유통기한이 지나 폐기한 상품이 15개입니다.
//       1) 폐기율(%)을 계산해 템플릿 리터럴로 출력
//       2) 영수증 번호 47이 홀수 번호인지 %와 ===로 판별
//       3) "폐기율 2% 미만이면서 영업 중"인지 &&로 종합 판정
// Step 1: 폐기율 = 폐기 수 * 100 / 진열 수
const totalCount = 1250;
const expiredCount = 15;
const expiredRate = (expiredCount * 100) / totalCount;
console.log(`오늘 폐기율: ${expiredRate}%`);  // 출력: 오늘 폐기율: 1.2%
// Step 2: 나머지 연산자로 홀짝 판별 (결과를 의미 있는 변수에 저장)
const receiptNo = 47;
const isOddReceipt = receiptNo % 2 === 1;
// 읽는 순서: % 가 === 보다 먼저 계산됩니다 → (47 % 2) === 1 → 1 === 1 → true
// 2로 나눈 나머지가 1이면 홀수, 0이면 짝수 — 홀짝 판별의 표준 공식입니다
console.log(`영수증 ${receiptNo}번은 홀수 번호인가?`, isOddReceipt);  // 출력: 영수증 47번은 홀수 번호인가? true
// Step 3: 논리 연산자 &&로 종합 판정
const isOpen = true;
console.log("우수 관리 판정:", expiredRate < 2 && isOpen);  // 출력: 우수 관리 판정: true
