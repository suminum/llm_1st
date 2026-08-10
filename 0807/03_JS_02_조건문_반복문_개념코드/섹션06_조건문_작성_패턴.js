// 03_JS_02_조건문_반복문 개념코드 — 섹션 6. 조건문 작성 패턴 (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션06_조건문_작성_패턴.js 로 실행하며 결과를 확인합니다.

// ── 섹션 6: 조건문 작성 패턴 ──────────────
console.log("===== 섹션 6: 조건문 작성 패턴 =====");
// [기본] 패턴 1: 조건을 의미 있는 변수에 저장 - 의도가 보이는 이름
let orderCount = 120;
const isBulkOrder = orderCount >= 100;
if (isBulkOrder) {
  console.log("대량 주문 - 할인 적용");  // 출력: 대량 주문 - 할인 적용
}
// [기본] 패턴 2: 중첩 펼치기 - 예외(잘못된 값)를 먼저 걸러내고, 메인 로직은 마지막에
let itemName = "베어링";
let qty = 0;
let price = 1000;
// 펼치기 전: 정상 로직이 중첩 안쪽에 숨어 있고, 왜 안 되는지 알려 주지도 못함
if (itemName) {
  if (qty > 0) {
    if (price > 0) {
      console.log(`${itemName} ${qty}개 - ${qty * price}원`);  // qty가 0이라 출력 없음
    }
  }
}
// 펼친 후: 예외를 위에서부터 하나씩 검사 - 걸린 이유가 출력되고, 정상 로직은 마지막 한 곳
if (!itemName) {
  console.log("상품명 없음");
} else if (qty <= 0) {
  console.log("수량 오류");  // 출력: 수량 오류 (qty가 0이라 여기서 걸림)
} else if (price <= 0) {
  console.log("가격 오류");
} else {
  console.log(`${itemName} ${qty}개 - ${qty * price}원`);
}
// 예고: 내일 배울 "함수"의 return을 쓰면 이 펼치기를 early return 패턴이라 부름
//       (함수는 내일 배움 - 오늘은 여기까지만!)
// 패턴 3: 공통 코드는 조건문 밖으로 / 패턴 4: 비교는 항상 === 사용
