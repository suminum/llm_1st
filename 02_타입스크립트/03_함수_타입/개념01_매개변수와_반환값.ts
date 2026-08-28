// ============================================================
// 03단원 · 개념 01 — 매개변수와 반환값
// ------------------------------------------------------------
// 실행: node 개념01_매개변수와_반환값.ts
// 검사: npm run typecheck
// ============================================================
//
// 02단원에서 "초기값이 옆에 있으면 안 적어도 된다" 고 했습니다.
// 함수의 매개변수는 그 반대입니다. 값이 옆에 없습니다.
//
//     function greet(name) { ... }
//                    └──┘  ← 여기에 무엇이 들어올지 알 방법이 없다
//
// 그래서 매개변수는 예외 없이 적습니다. 이 단원에서 제일 중요한 규칙입니다.


// ── 섹션 1: 매개변수는 무조건 적는다 ──

// 안 적으면 이렇게 됩니다.
//
// 에러: TS7006 Parameter 'name' implicitly has an 'any' type.
// function greetWrong(name) {
//   return "안녕하세요 " + name + "님";
// }
//
// 실수: implicitly = "은근슬쩍", "적지도 않았는데 any 가 됐다" 는 뜻입니다.
//       02단원 개념03에서 any 를 쓰지 않기로 했는데,
//       매개변수를 비워 두면 자동으로 any 가 되어 버립니다.
//       → 그래서 매개변수만은 반드시 적어야 합니다.

// 제대로 적으면 이렇습니다.
function greet(name: string) {
  return "안녕하세요 " + name + "님";
}

console.log(greet("홍길동"));
// 출력: 안녕하세요 홍길동님

// 이제 잘못 넘기면 그 자리에서 걸립니다.
//
// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type 'string'.
// console.log(greet(123));
//
// 실수: argument(넘긴 값) 가 parameter(받기로 한 자리) 에 안 맞는다는 뜻입니다.
//       01단원 개념03 ④ 에서 본 그 에러입니다.

// 개수가 틀려도 걸립니다.
//
// 에러: TS2554 Expected 1 arguments, but got 2.
// console.log(greet("홍길동", "추가"));
//
// 실수: "1개를 받기로 했는데 2개를 주셨습니다" 입니다.
//       JS 에서는 남는 것을 그냥 버리고 조용히 돌아가던 자리입니다.

// ✏️ 직접 해보기 1 — 숫자 두 개를 받아 곱한 값을 돌려주는 multiply 를 만들고
//    multiply(3, 4) 를 출력해 보세요.


// ── 섹션 2: 반환값은 안 적어도 된다 ──

// 돌려주는 값은 함수 몸통을 보면 알 수 있으니 추론됩니다.
function add(a: number, b: number) {
  return a + b;
}

// add 의 타입은 (a: number, b: number) => number 로 추론됩니다.
// 화살표 오른쪽이 돌려주는 것입니다.
const sum = add(3, 4);
console.log(sum);
// 출력: 7

// 그리고 돌려받은 값에도 타입이 붙어 있습니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(add(3, 4).toUpperCase());
//
// 실수: add 가 숫자를 준다는 것을 알기 때문에 막습니다.
//       JS 에서는 실행하다 터지던 자리입니다.

// ✏️ 직접 해보기 2 — greet("홍길동") 의 결과에 .length 를 붙여 출력해 보세요.
//    걸리나요? 왜 그럴까요?


// ── 섹션 3: 그래도 반환값을 적으면 좋은 경우 ──

// 안 적어도 되지만, 적어 두면 '실수를 함수 안에서' 잡을 수 있습니다.

// [안 적은 경우] — 실수가 함수 밖으로 새어 나갑니다
function getPriceLoose(count: number) {
  return String(count * 4000); // 실수로 문자열을 돌려줌
}

const looseResult = getPriceLoose(2);
console.log(looseResult, typeof looseResult);
// 출력: 8000 string
// 숫자를 원했는데 문자열이 나왔습니다. 함수는 아무 말도 안 했습니다.
// 이 값을 쓰는 쪽에 가서야 문제가 드러납니다.

// [적은 경우] — 함수 안에서 바로 잡힙니다
//
// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// function getPriceStrict(count: number): number {
//   return String(count * 4000);
// }
//
// 실수: return 하는 그 줄에서 걸립니다.
//       "number 를 주기로 해 놓고 string 을 주시네요" 입니다.
//       실수한 자리에서 바로 잡히니 원인을 찾을 필요가 없습니다.

// 제대로 쓰면 이렇습니다.
function getPrice(count: number): number {
  return count * 4000;
}
console.log(getPrice(2));
// 출력: 8000

// 규칙으로 정하면 이렇습니다.
//
//     짧고 뻔한 함수  → 안 적어도 된다
//     길거나 중요한 함수 → 적어 두면 실수를 그 자리에서 잡는다

// ✏️ 직접 해보기 3 — getPrice 의 : number 는 그대로 두고
//    몸통을 return "공짜"; 로 바꿔 보세요. 어디서 걸리나요? 확인 후 되돌리세요.


// ── 섹션 4: void — 돌려주는 것이 없는 함수 ──

// 화면에 찍기만 하고 아무것도 안 돌려주는 함수가 있습니다.
function printReceipt(menu: string, price: number): void {
  console.log("주문: " + menu);
  console.log("금액: " + price + "원");
}

printReceipt("라떼", 4500);
// 출력: 주문: 라떼
// 출력: 금액: 4500원

// void 는 "돌려주는 것이 없다" 는 뜻입니다.
// return 이 없는 함수는 안 적어도 void 로 추론됩니다. 적는 것은 선택입니다.

// void 함수의 결과를 받아서 쓰려고 하면 막아 줍니다.
//
// 에러: TS2339 Property 'length' does not exist on type 'void'.
// console.log(printReceipt("라떼", 4500).length);
//
// 실수: 아무것도 안 돌려주는 함수의 결과를 쓰려고 한 것입니다.
//       JS 에서는 undefined 가 되어 "Cannot read properties of undefined" 로
//       실행 중에 터지던 자리입니다.

// ✏️ 직접 해보기 4 — printReceipt 의 : void 를 : string 으로 바꿔 보세요.
//    무슨 에러가 나는지 확인한 뒤 되돌리세요.


// ── 섹션 5: 화살표 함수도 똑같다 ──

// JS자료 05단원에서 배운 화살표 함수도 적는 자리가 같습니다.
const double = (n: number): number => n * 2;
console.log(double(21));
// 출력: 42

// 반환 타입을 생략하면 이렇게 됩니다. 이쪽이 더 흔합니다.
const triple = (n: number) => n * 3;
console.log(triple(5));
// 출력: 15

// 적는 자리를 그림으로 보면 이렇습니다.
//
//     const double = (n: number): number => n * 2;
//                       └──┬──┘  └──┬──┘
//                       매개변수    반환값
//                       (필수)      (선택)

// 매개변수가 없어도 괄호는 있어야 합니다.
const now = (): string => "지금";
console.log(now());
// 출력: 지금

// ✏️ 직접 해보기 5 — 문자열을 받아 "안녕, ○○!" 를 돌려주는
//    화살표 함수 hello 를 만들어 hello("봄날") 을 출력해 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 매개변수 타입을 빼먹기
//   가장 흔합니다. TS7006 이 나오면 100% 이것입니다.
//   에러 메시지에 implicitly 라는 단어가 보이면 매개변수를 확인하세요.

// [실수 2] 매개변수와 반환값의 콜론을 헷갈리기
//   function f(a: number): string { }
//              └─ 매개변수      └─ 반환값
//   반환값 콜론은 닫는 괄호 '뒤' 입니다.

// [실수 3] 반환 타입을 적어 놓고 return 을 안 쓰기
//   function f(): number { console.log(1); } 은
//   TS2355 A function whose declared type is neither 'undefined', 'void',
//   nor 'any' must return a value. 로 걸립니다.

// [실수 4] void 를 '아무 타입이나' 로 알기
//   void 는 "돌려줄 것이 없다" 입니다. any 와는 정반대입니다.


// ── 정리 ──

// 1. 매개변수는 예외 없이 적는다. 안 적으면 TS7006 으로 은근슬쩍 any 가 된다.
// 2. 반환값은 몸통을 보고 추론되므로 안 적어도 된다.
// 3. 반환값을 적어 두면 실수를 함수 '안' 에서 잡는다. 중요한 함수에는 적는다.
// 4. 돌려줄 것이 없으면 void 다. void 함수의 결과는 쓸 수 없다.
// 5. 화살표 함수도 적는 자리가 같다. 매개변수는 괄호 안, 반환값은 괄호 뒤.
// 6. 넘긴 값이 안 맞으면 TS2345, 개수가 안 맞으면 TS2554.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function multiply(a: number, b: number) {
//      return a * b;
//    }
//    console.log(multiply(3, 4));            // 출력: 12
//
// 2) 걸리지 않습니다.
//    console.log(greet("홍길동").length);    // 출력: 10
//    greet 는 문자열을 돌려주니 .length 를 쓸 수 있습니다.
//    "안녕하세요 홍길동님" 이 10글자입니다(띄어쓰기 포함).
//    반대로 add(3,4).length 는 TS2339 로 걸립니다. 숫자에는 length 가 없으니까요.
//
// 3) return 하는 줄에서 걸립니다.
//    error TS2322: Type 'string' is not assignable to type 'number'.
//    재현:
//    function getPrice(count: number): number { return "공짜"; }
//    함수를 쓰는 쪽이 아니라 함수 '안' 에서 잡히는 것이 핵심입니다.
//    이게 반환 타입을 적는 이유입니다.
//
// 4) error TS2355: A function whose declared type is neither 'undefined',
//    'void', nor 'any' must return a value.
//    "string 을 주기로 해 놓고 아무것도 안 돌려주시네요" 입니다.
//    재현:
//    function printReceipt(menu: string): string { console.log(menu); }
//
// 5) const hello = (name: string) => "안녕, " + name + "!";
//    console.log(hello("봄날"));             // 출력: 안녕, 봄날!
