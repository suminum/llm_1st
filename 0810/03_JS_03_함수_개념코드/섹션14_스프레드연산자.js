// 03_JS_03_함수 개념코드 — 섹션 14. 스프레드 연산자
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션14_스프레드연산자.js 로 실행하며 결과를 확인합니다.

// ── 섹션 14: 스프레드 연산자 ──────────────
console.log("===== 섹션 14: 스프레드 연산자 =====");
{
  // 왜 배우는가부터: const copy2 = fruits;  는 복사가 아닙니다.
  // 같은 배열에 이름표를 하나 더 붙인 것이라 한쪽을 고치면 양쪽이 다 바뀝니다.
  // 비유: 같은 집에 문패를 두 개 단 것. 스프레드는 짐을 새 집으로 옮겨 담는 것입니다.
  //
  // ... 은 "껍데기를 벗겨 알맹이를 펼친다"는 뜻입니다.
  //   fruits    → ["사과", "바나나"]        (배열 한 덩어리)
  //   ...fruits → "사과", "바나나"           (알맹이 두 개로 펼쳐짐)
  // 그래서 [...fruits] 는 펼친 알맹이를 새 대괄호에 다시 담는 것 = 복사본이 됩니다.
  // [기본] 배열 복사·결합
  const fruits = ["사과", "바나나"];
  const vegs = ["당근", "브로콜리"];
  const copy = [...fruits]; // 독립적 복사본
  const merged = [...fruits, ...vegs]; // 결합
  console.log(merged); // 출력: [ '사과', '바나나', '당근', '브로콜리' ]

  copy.push("망고"); // 복사본만 수정
  console.log(fruits); // 출력: [ '사과', '바나나' ]  <- 원본은 영향 없음

  // [기본] 객체 복사·병합 - 뒤에 오는 값이 덮어씀
  const defaults = { theme: "light", lang: "ko" };
  const userPrefs = { theme: "dark" };
  const config = { ...defaults, ...userPrefs };
  console.log(config); // 출력: { theme: 'dark', lang: 'ko' }

  // [다른 방법] immutable 업데이트 (React 패턴)
  const user = { id: 1, name: "김철수", age: 28 };
  const updated = { ...user, age: 29 }; // 원본은 그대로, 새 객체 생성
  console.log(updated); // 출력: { id: 1, name: '김철수', age: 29 }

  // 실수: const copy2 = fruits;  // 복사가 아니라 같은 배열을 가리킴 -> 한쪽 수정이 양쪽에 반영됨
}
