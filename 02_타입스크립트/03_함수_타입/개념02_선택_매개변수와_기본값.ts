// ============================================================
// 03단원 · 개념 02 — 선택 매개변수와 기본값
// ------------------------------------------------------------
// 실행: node 개념02_선택_매개변수와_기본값.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념01에서 "개수가 틀리면 TS2554 로 걸린다" 고 했습니다.
// 그런데 실제로는 "있어도 되고 없어도 되는" 값이 자주 있습니다.
//
//     주문할 때 메모는 남겨도 되고 안 남겨도 된다
//     할인율은 대부분 0 이지만 가끔 다르다
//
// 이 파일은 그 두 가지를 다루는 방법입니다.


// ── 섹션 1: ? — 없어도 되는 매개변수 ──

// 이름 뒤에 ? 를 붙이면 "안 넘겨도 된다" 가 됩니다.
function order(menu: string, memo?: string) {
  console.log("주문:", menu);
  console.log("메모:", memo);
}

order("아메리카노", "얼음 적게");
// 출력: 주문: 아메리카노
// 출력: 메모: 얼음 적게

order("라떼");
// 출력: 주문: 라떼
// 출력: 메모: undefined

// 두 번째 호출에서 memo 를 안 넘겼는데 에러가 안 났습니다.
// ? 가 붙어 있으니 개수 검사가 통과한 것입니다.
//
// 그리고 안 넘긴 memo 는 undefined 가 됩니다.
// JS자료에서 "없는 값은 undefined" 라고 배운 그대로입니다.

// ✏️ 직접 해보기 1 — 이름을 받고 직급은 선택으로 받는 함수 intro 를 만들어
//    intro("홍길동") 과 intro("홍길동", "대리") 를 각각 불러 보세요.


// ── 섹션 2: ? 의 대가 — undefined 일 수 있다 ──

// ? 를 붙이면 편해지는 대신, 그 값의 타입이 바뀝니다.
//
//     memo?: string    →   memo 의 타입은 string | undefined
//
// "문자열이거나, 아예 없거나" 라는 뜻입니다.
// 세로줄( | )은 '이거나' 입니다. 05단원에서 제대로 배웁니다.
//
// 그래서 그냥 쓰려고 하면 막힙니다.
//
// 에러: TS18048 'memo' is possibly 'undefined'.
// function orderWrong(menu: string, memo?: string) {
//   console.log(menu, memo.length);
// }
//
// 실수: "안 넘길 수도 있다고 해 놓고 .length 를 쓰시겠다고요?" 입니다.
//       안 넘기면 undefined 이고, undefined 에는 length 가 없으니까요.
//       JS 에서는 이 자리가 "Cannot read properties of undefined" 였습니다.

// 그럼 어떻게 쓰나 — 있는지 확인하고 씁니다.
function orderSafe(menu: string, memo?: string) {
  if (memo) {
    console.log(menu, "/ 메모", memo.length, "글자");
  } else {
    console.log(menu, "/ 메모 없음");
  }
}

orderSafe("아메리카노", "얼음 적게");
// 출력: 아메리카노 / 메모 5 글자
orderSafe("라떼");
// 출력: 라떼 / 메모 없음

// if (memo) 안쪽에서는 memo 가 확실히 문자열입니다.
// 타입스크립트가 그걸 알고 .length 를 허락해 줍니다.
// 이것이 02단원 개념03에서 잠깐 본 '타입 좁히기' 이고, 05단원의 주제입니다.

// ✏️ 직접 해보기 2 — orderSafe 의 if (memo) 를 지우고 memo.length 만 남겨 보세요.
//    무슨 에러가 나는지 확인한 뒤 되돌리세요.


// ── 섹션 3: 기본값을 주면 ? 가 필요 없다 ──

// "안 넘기면 이 값으로 해라" 를 정해 줄 수 있습니다. JS자료 05단원의 그것입니다.
function orderWithDefault(menu: string, count: number = 1) {
  console.log(menu, count + "잔");
}

orderWithDefault("아메리카노", 3);
// 출력: 아메리카노 3잔
orderWithDefault("라떼");
// 출력: 라떼 1잔

// 기본값을 주면 좋은 점이 두 가지입니다.
//
//   ① 안 넘겨도 된다 (? 와 같음)
//   ② 타입이 number 그대로다. undefined 가 섞이지 않는다
//
// ② 가 핵심입니다. 섹션 2처럼 매번 확인할 필요가 없습니다.
function totalPrice(unit: number, count: number = 1) {
  return unit * count; // 확인 없이 바로 계산해도 됩니다
}
console.log(totalPrice(4000));
// 출력: 4000
console.log(totalPrice(4000, 3));
// 출력: 12000

// 그리고 기본값이 있으면 타입을 안 적어도 됩니다. 값을 보고 추론하니까요.
function greetWithDefault(name: string, greeting = "안녕하세요") {
  return greeting + " " + name + "님";
}
console.log(greetWithDefault("홍길동"));
// 출력: 안녕하세요 홍길동님
console.log(greetWithDefault("홍길동", "반갑습니다"));
// 출력: 반갑습니다 홍길동님

// 규칙으로 정리하면 이렇습니다.
//
//     쓸 만한 기본값이 있다   →  = 기본값     (이쪽을 먼저 고려하세요)
//     없는 것이 의미가 있다   →  ?

// ✏️ 직접 해보기 3 — 할인율을 받되 안 넘기면 0 이 되는 함수 discount 를 만들어
//    원가 10000 에 대해 discount(10000) 과 discount(10000, 0.2) 를 출력해 보세요.


// ── 섹션 4: 순서 규칙 — 필수가 먼저 ──

// ? 가 붙은 것은 뒤로 가야 합니다.
//
// 에러: TS1016 A required parameter cannot follow an optional parameter.
// function wrongOrder(memo?: string, menu: string) {
//   console.log(menu, memo);
// }
//
// 실수: "필수 매개변수가 선택 매개변수 뒤에 올 수 없습니다" 입니다.
//       생각해 보면 당연합니다. wrongOrder("라떼") 라고 부르면
//       "라떼" 가 memo 인지 menu 인지 알 방법이 없습니다.

// 기본값도 같은 규칙입니다. 다만 이유가 조금 다릅니다.
function tagged(prefix = "[알림]", message: string) {
  return prefix + " " + message;
}
// 이건 문법상 걸리지는 않습니다. 대신 앞엣것을 생략할 수가 없어서
// tagged("[알림]", "문 닫습니다") 처럼 항상 둘 다 넘겨야 합니다. 쓸모가 없습니다.
console.log(tagged("[공지]", "문 닫습니다"));
// 출력: [공지] 문 닫습니다

// 그래서 실무 규칙은 하나입니다.
//
//     반드시 필요한 것부터 쓰고, 선택인 것을 뒤에 쓴다.

// ✏️ 직접 해보기 4 — 위 tagged 의 순서를 (message: string, prefix = "[알림]") 으로
//    바꾸고 tagged("문 닫습니다") 를 출력해 보세요.


// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] ? 를 붙여 놓고 그냥 쓰기
//   TS18048 이 나오는 가장 흔한 이유입니다.
//   ? 를 붙였으면 쓰기 전에 확인해야 합니다(섹션 2).

// [실수 2] ? 와 기본값을 같이 쓰기
//   function f(a?: number = 1) 은 TS1015 로 걸립니다.
//   기본값이 있으면 이미 생략 가능하니 ? 가 필요 없습니다. 둘 중 하나만 쓰세요.

// [실수 3] 선택 매개변수를 앞에 두기
//   TS1016 입니다. 섹션 4를 보세요.

// [실수 4] "안 넘기면 null 이 들어오겠지" 라고 생각하기
//   undefined 입니다. null 이 아닙니다. 둘은 다른 값입니다.
//   05단원에서 이 둘의 차이를 다룹니다.


// ── 정리 ──

// 1. 매개변수 뒤에 ? 를 붙이면 안 넘겨도 된다.
// 2. 그 대가로 타입이 'string | undefined' 가 된다. 쓰기 전에 확인해야 한다.
// 3. 기본값( = 값 )을 주면 안 넘겨도 되면서 타입도 깨끗하게 유지된다.
//    쓸 만한 기본값이 있으면 ? 보다 이쪽이 낫다.
// 4. 기본값이 있으면 타입 표기도 생략할 수 있다. 값을 보고 추론한다.
// 5. 선택 매개변수는 반드시 뒤에. 앞에 두면 TS1016.
// 6. 안 넘기면 undefined 다. null 이 아니다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function intro(name: string, rank?: string) {
//      console.log(name, rank);
//    }
//    intro("홍길동");                          // 출력: 홍길동 undefined
//    intro("홍길동", "대리");                   // 출력: 홍길동 대리
//
// 2) error TS18048: 'memo' is possibly 'undefined'.
//    재현:
//    function orderSafe(menu: string, memo?: string) { console.log(menu, memo.length); }
//    ? 를 붙인 순간 memo 는 string | undefined 가 됩니다.
//    if 로 확인해야만 .length 를 쓸 수 있습니다.
//
// 3) function discount(price: number, rate: number = 0) {
//      return price - price * rate;
//    }
//    console.log(discount(10000));             // 출력: 10000
//    console.log(discount(10000, 0.2));        // 출력: 8000
//    기본값 0 을 주었으니 rate 의 타입은 그냥 number 입니다.
//    확인 없이 바로 곱셈에 쓸 수 있습니다.
//
// 4) function tagged2(message: string, prefix = "[알림]") {
//      return prefix + " " + message;
//    }
//    console.log(tagged2("문 닫습니다"));       // 출력: [알림] 문 닫습니다
//    이렇게 해야 기본값이 제 역할을 합니다.
