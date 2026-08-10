// 03_JS_03_함수 개념코드 — 섹션 7. 화살표 함수
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션07_화살표함수.js 로 실행하며 결과를 확인합니다.

// ── 섹션 7: 화살표 함수 ──────────────
console.log("===== 섹션 7: 화살표 함수 =====");
{
  // [기본] 함수 표기법 세 가지 비교
  function sayHello1(name) {
    console.log(`Hello, ${name}`);
  }
  const sayHello2 = function (name) {
    console.log(`Hello, ${name}`);
  };
  const sayHello3 = (name) => {
    console.log(`Hello, ${name}`);
  };
  sayHello1("선언문"); // 출력: Hello, 선언문
  sayHello2("표현식"); // 출력: Hello, 표현식
  sayHello3("화살표"); // 출력: Hello, 화살표

  // [축약] 본문이 한 줄이면 중괄호와 return 생략 가능
  // 최종형만 보면 못 따라옵니다. 계단처럼 한 단계씩 줄여 보세요:
  //   1단계  const f = function (n) { return n * 2; };   ← 함수 표현식
  //   2단계  const f = (n) => { return n * 2; };         ← function 지우고 =>  붙이기
  //   3단계  const f = (n) => n * 2;                     ← 중괄호와 return 함께 지우기
  const double = (n) => n * 2;   // 위 3단계 형태입니다
  console.log(double(7)); // 출력: 14
  // ★ 3단계의 조건: 중괄호를 지울 때 return도 반드시 같이 지웁니다.
  //   둘 중 하나만 지우면 안 됩니다 (아래 실수 참고).
  // 매개변수 소괄호는 하나일 때 생략할 수 있지만( n => n * 2 ),
  // 없거나 둘 이상이면 반드시 필요합니다. 헷갈리니 항상 쓰는 것으로 통일하세요.

  // 셋 중 무엇을 쓸까:
  //   화살표 함수 → 짧은 함수, 그리고 map·filter에 넘기는 함수(섹션 12에서 계속 나옴)
  //   선언문      → 파일 위쪽에 정의해 두고 여러 곳에서 부르는 함수
  // 요즘 코드는 화살표 함수가 기본이라고 보면 됩니다.

  // 실수: const bad = (n) => { n * 2 };  // 중괄호를 쓰면 return을 직접 써야 함 -> undefined 반환
  // 중괄호는 남기고 return만 빠뜨린 경우입니다. 에러가 안 나고 undefined가 나옵니다.
  // 섹션 2의 "return 없으면 undefined"가 여기서 또 나옵니다 — 오늘 두 번째 만남입니다.
}
