// ============================================================
// 06단원 · 개념 01 — 제네릭이 왜 필요한가
// ------------------------------------------------------------
// 실행: node 개념01_제네릭이_왜_필요한가.ts
// 검사: npm run typecheck
// ============================================================
//
// 제네릭은 이름 때문에 어려워 보입니다. 하는 일은 한 줄입니다.
//
//     "무슨 타입이 올지는 쓰는 쪽이 정한다" 를 적는 방법.
//
// 왜 그런 게 필요한지부터 봅니다. 이유를 알면 문법은 5분이면 끝납니다.


// ── 섹션 1: 같은 함수를 타입마다 만들게 된다 ──

// 배열의 첫 번째 값을 꺼내는 함수를 만들어 봅시다.
function firstNumber(arr: number[]) {
  return arr[0];
}
console.log(firstNumber([10, 20, 30]));
// 출력: 10

// 문자열 배열에도 쓰고 싶습니다. 그런데 못 씁니다.
const names = ["가", "나"];
//
// 에러: TS2345 Argument of type 'string[]' is not assignable to parameter of type 'number[]'.
// console.log(firstNumber(names));
//
// 실수: number[] 를 받기로 했으니 당연합니다.
//       아래에 Type 'string' is not assignable to type 'number'. 가 따라옵니다.
//       배열 안의 무엇이 안 맞는지까지 알려 줍니다.
console.log(names.length);
// 출력: 2

// 그래서 하나 더 만듭니다.
function firstString(arr: string[]) {
  return arr[0];
}
console.log(firstString(["가", "나"]));
// 출력: 가

// 그리고 boolean 배열이 필요해집니다. 객체 배열도 필요해집니다.
// 몸통은 전부 return arr[0]; 한 줄로 똑같은데 함수만 늘어납니다.
//
//     firstNumber · firstString · firstBoolean · firstMenu · ...
//
// 이게 문제입니다.

// ✏️ 직접 해보기 1 — firstBoolean 을 만들어 [true, false] 의 첫 값을 출력해 보세요.
//    몸통이 위 둘과 무엇이 다른가요?


// ── 섹션 2: any 로 하면 되지 않나 — 안 됩니다 ──

function firstAny(arr: any[]) {
  return arr[0];
}

// 하나로 다 되기는 합니다.
console.log(firstAny([10, 20]));
// 출력: 10
console.log(firstAny(["가", "나"]));
// 출력: 가

// 그런데 돌려받은 값이 any 입니다. 02단원 개념03에서 본 그 문제입니다.
const value = firstAny([10, 20]);
console.log(value.toUpperCase === undefined);
// 출력: true
// 숫자인데 toUpperCase 를 물어봐도 아무도 안 막습니다.

// 검사가 꺼졌으니 실행할 때 터집니다.
try {
  console.log(firstAny([10, 20]).toUpperCase());
} catch (e) {
  console.log("터졌습니다:", String(e));
}
// 출력: 터졌습니다: TypeError: firstAny(...).toUpperCase is not a function

// 정리하면 이런 상황입니다.
//
//     타입마다 함수를 만든다  →  검사는 되는데 함수가 계속 늘어난다
//     any 로 하나만 만든다    →  함수는 하나인데 검사가 꺼진다
//
// 둘 다 싫습니다. 제네릭이 이 둘 사이의 답입니다.

// ✏️ 직접 해보기 2 — firstAny(["가","나"]).toFixed(2) 를 써 보세요.
//    검사는 통과하나요? 실행하면요?


// ── 섹션 3: <T> — 타입을 나중에 정하기 ──

// 값을 나중에 받으려고 매개변수를 두는 것처럼,
// 타입을 나중에 받으려고 '타입 매개변수' 를 둡니다.

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 그림으로 보면 이렇습니다.
//
//     function first<T>(arr: T[]): T | undefined
//                    └┬┘      └┬┘   └┬┘
//                     │        │     └ 돌려주는 것도 T
//                     │        └ 받는 것은 T 들의 배열
//                     └ "T 라는 이름의 타입을 하나 받겠다"
//
// T 가 무엇인지는 안 적혀 있습니다. 쓰는 쪽에서 정해집니다.

const n = first([10, 20, 30]);
console.log(n);
// 출력: 10

const s = first(["가", "나"]);
console.log(s);
// 출력: 가

// 넘긴 것을 보고 T 를 알아냅니다. 적을 필요가 없습니다.
//
//     first([10, 20, 30])  →  T 는 number  →  돌려주는 것은 number | undefined
//     first(["가", "나"])   →  T 는 string  →  돌려주는 것은 string | undefined
//
// 이제 함수는 하나인데 검사는 살아 있습니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(first([10, 20])?.toUpperCase());
//
// 실수: any 였다면 통과했을 자리입니다. 실행 중에 터졌겠죠.
//       제네릭은 "무엇이든 받는다" 지 "검사를 끈다" 가 아닙니다.

// ✏️ 직접 해보기 3 — first([{ name: "라떼" }]) 의 결과에 마우스를 올려 보세요.
//    T 가 무엇으로 정해졌나요?


// ── 섹션 4: 왜 | undefined 가 붙었나 ──

// 반환 타입을 T 가 아니라 T | undefined 라고 적었습니다. 이유가 있습니다.
const empty = first<number>([]);
console.log(empty);
// 출력: undefined

// 빈 배열의 [0] 은 undefined 입니다. JS자료 06단원에서 배운 그대로입니다.
// 그러니 사실대로 적어야 합니다.
//
// 만약 : T 라고만 적었다면, 쓰는 쪽에서 확인 없이 바로 쓰다가 터졌을 것입니다.
// 04단원 개념04의 "사실대로 적는 것이 원칙" 이 여기서도 그대로입니다.

// 그래서 쓰는 쪽은 확인해야 합니다. 05단원에서 배운 그대로입니다.
const maybe = first([10, 20]);
if (maybe !== undefined) {
  console.log(maybe + 1);
}
// 출력: 11

console.log(first([10, 20]) ?? 0);
// 출력: 10
console.log(first<number>([]) ?? 0);
// 출력: 0

// ✏️ 직접 해보기 4 — first(["가"]) 의 결과를 확인 없이 .length 로 써 보세요.
//    무슨 에러가 나나요?


// ── 섹션 5: T 라는 이름 ──

// T 는 그냥 이름입니다. 아무거나 써도 됩니다.
function last<Item>(arr: Item[]): Item | undefined {
  return arr[arr.length - 1];
}
console.log(last(["가", "나", "다"]));
// 출력: 다

// 관행은 이렇습니다.
//
//     T       Type 의 첫 글자. 하나뿐일 때 가장 많이 씁니다
//     K, V    Key, Value. 짝으로 쓸 때
//     T, U    두 개일 때
//     Item    뜻이 분명할 때는 이렇게 풀어 써도 좋습니다
//
// 이 자료는 하나면 T, 뜻이 중요하면 풀어 씁니다.

// 타입 매개변수는 대문자로 시작합니다. 타입 이름이니까요(04단원 개념02 섹션2).

// ✏️ 직접 해보기 5 — last 를 써서 숫자 배열의 마지막 값을 출력해 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] <T> 를 안 쓰고 T 만 쓰기
//   function first(arr: T[]) 는 TS2304 Cannot find name 'T'. 입니다.
//   T 를 쓰려면 먼저 <T> 로 "받겠다" 고 선언해야 합니다.
//   값 매개변수를 (arr) 이라고 적어야 arr 을 쓸 수 있는 것과 같습니다.

// [실수 2] 제네릭을 any 처럼 생각하기
//   섹션 3입니다. 검사는 그대로 살아 있습니다.

// [실수 3] 빈 배열일 때를 안 적기
//   섹션 4입니다. 사실대로 적어야 쓰는 쪽에서 확인하게 됩니다.

// [실수 4] 필요 없는데 제네릭으로 만들기
//   한 종류만 쓸 함수를 <T> 로 만들면 읽기만 어려워집니다.
//   "타입마다 같은 함수를 또 만들게 되는가?" 일 때만 쓰세요.


// ── 정리 ──

// 1. 같은 몸통인데 타입만 다른 함수를 여러 개 만들게 되면 제네릭이 필요한 것이다.
// 2. any 로 하나 만들면 함수는 줄지만 검사가 꺼진다. 제네릭은 둘 다 얻는다.
// 3. <T> 는 "T 라는 이름의 타입을 하나 받겠다" 는 뜻이다.
//    T 가 무엇인지는 쓰는 쪽에서 정해진다.
// 4. 넘긴 값을 보고 알아내므로 부르는 쪽에서 적을 필요가 없다.
// 5. 사실대로 적는다. 빈 배열이면 undefined 가 나오니 T | undefined 다.
// 6. T 는 이름일 뿐이다. 뜻이 중요하면 Item 처럼 풀어 써도 된다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function firstBoolean(arr: boolean[]) { return arr[0]; }
//    console.log(firstBoolean([true, false]));  // 출력: true
//    몸통은 완전히 같습니다. 매개변수 타입만 다릅니다.
//    → 몸통이 같은데 타입 때문에 함수를 또 만들고 있다면 제네릭 자리입니다.
//
// 2) 검사는 통과합니다. any 라서 아무도 안 막습니다.
//    실행하면 터집니다.
//    TypeError: firstAny(...).toFixed is not a function
//    문자열에는 toFixed 가 없기 때문입니다.
//
// 3) T 는 { name: string } 으로 정해집니다.
//    결과 타입은 { name: string } | undefined 입니다.
//    객체든 배열이든 무엇이든 T 가 될 수 있습니다.
//
// 4) error TS2532: Object is possibly 'undefined'.
//    이름이 붙은 변수가 아니라 'first(...) 라는 결과' 라서 TS18048 이 아니라
//    TS2532 로 나옵니다. Object 라고만 부르는 것도 그 때문입니다.
//    둘 다 possibly 'undefined' 이니 하는 말은 같습니다.
//    재현:
//    function first<T>(arr: T[]): T | undefined { return arr[0]; }
//    console.log(first(["가"]).length);
//    빈 배열일 수 있으니 확인하고 쓰라는 뜻입니다.
//    first(["가"])?.length 나 (first(["가"]) ?? "").length 로 쓰면 됩니다.
//
// 5) console.log(last([10, 20, 30]));          // 출력: 30
