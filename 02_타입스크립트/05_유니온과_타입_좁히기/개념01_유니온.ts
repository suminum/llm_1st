// ============================================================
// 05단원 · 개념 01 — 유니온: 둘 중 하나
// ------------------------------------------------------------
// 실행: node 개념01_유니온.ts
// 검사: npm run typecheck
// ============================================================
//
// 세로줄( | )은 앞 단원들에서 계속 스쳐 지나갔습니다.
//
//     string | undefined     ? 를 붙였을 때 (03단원 개념02)
//     Menu | null            없을 수도 있을 때 (04단원 개념04)
//     (string | number)[]    배열에 섞여 있을 때 (02단원 개념01)
//
// 그때마다 "05단원에서 배웁니다" 라고 미뤘습니다. 그 단원입니다.
//
// 이 단원은 실무에서 가장 자주 쓰게 되는 단원이기도 합니다.


// ── 섹션 1: A | B 는 "둘 중 하나" ──

// 게시글 번호가 숫자로 올 때도 있고 문자열로 올 때도 있다고 해 봅시다.
type Id = string | number;

function printId(id: Id) {
  console.log("번호:", id);
}

printId(3);
// 출력: 번호: 3
printId("A-3");
// 출력: 번호: A-3

// 셋 이상도 됩니다. 개수 제한은 없습니다.
type Value = string | number | boolean;

function printValue(v: Value) {
  console.log("값:", v);
}
printValue(true);
// 출력: 값: true

// 둘 다 아닌 것은 막습니다.
//
// 에러: TS2345 Argument of type 'null' is not assignable to parameter of type 'Id'.
// printId(null);
//
// 실수: string 도 number 도 아니니 걸립니다.
//       null 을 허용하려면 string | number | null 이라고 적어야 합니다.

// ✏️ 직접 해보기 1 — 숫자이거나 불리언인 타입 Flag 를 만들고
//    두 종류를 각각 넘겨 출력해 보세요.


// ── 섹션 2: 유니온에서는 '공통으로 있는 것' 만 쓸 수 있다 ★ ──

// 이게 유니온의 핵심 규칙입니다.
function shout(value: string | number) {
  // toString 은 문자열에도 숫자에도 있으니 됩니다.
  console.log(value.toString());
}
shout("라떼");
// 출력: 라떼
shout(4500);
// 출력: 4500

// 에러: TS2339 Property 'toUpperCase' does not exist on type 'string | number'.
// function shoutWrong(value: string | number) {
//   console.log(value.toUpperCase());
// }
//
// 실수: toUpperCase 는 문자열에만 있습니다.
//       숫자가 들어왔을 때는 없는 기능이니, 타입스크립트가 미리 막습니다.
//       JS 에서는 숫자가 들어오는 날 실행 중에 터지던 자리입니다.

// 메시지를 두 줄까지 읽으면 어느 쪽이 문제인지 알려 줍니다.
//
// 에러: TS2339 Property 'toFixed' does not exist on type 'string | number'.
// function roundIt(value: string | number) {
//   return value.toFixed(1);
// }
//
// 실수: 아래에 Property 'toFixed' does not exist on type 'string'. 이 따라옵니다.
//       "문자열 쪽에 없다" 를 짚어 줍니다.

// 그럼 유니온은 못 써먹는 것 아닌가? 아닙니다.
// "지금 어느 쪽인지" 를 확인하면 그때부터 그쪽 기능을 다 쓸 수 있습니다.
// 그 확인하는 방법이 개념02(좁히기)입니다.

// ✏️ 직접 해보기 2 — string | number 를 받아 length 를 출력하려고 해 보세요.
//    어느 쪽에 없다고 하나요? 확인한 뒤 지우세요.


// ── 섹션 3: 리터럴 유니온 — 정해진 값만 허용하기 ★ ──

// 여기가 실무에서 가장 많이 쓰는 자리입니다.
// 02단원 개념02에서 "const 는 값 자체가 타입이 된다" 고 했습니다.
// 그 리터럴 타입을 | 로 이으면 "이 값들 중 하나만" 이 됩니다.

type Status = "대기" | "조리중" | "완료";

function printStatus(status: Status) {
  console.log("상태:", status);
}

printStatus("대기");
// 출력: 상태: 대기
printStatus("완료");
// 출력: 상태: 완료

// 목록에 없는 값은 막습니다.
//
// 에러: TS2345 Argument of type '"취소"' is not assignable to parameter of type 'Status'.
// printStatus("취소");
//
// 실수: 오타도 이걸로 잡힙니다. "완로" 라고 쓰면 그 자리에서 걸립니다.
//       JS 에서는 오타가 조용히 통과해서, if (status === "완료") 가
//       영원히 false 가 되는 버그로 나타났습니다.

// 자동완성까지 됩니다. printStatus( 까지 치면 세 개가 목록으로 뜹니다.
// 외우고 있을 필요가 없습니다.

// 숫자도 됩니다.
type Rating = 1 | 2 | 3 | 4 | 5;
function printRating(r: Rating) {
  console.log("별점:", r);
}
printRating(5);
// 출력: 별점: 5

// 에러: TS2345 Argument of type '6' is not assignable to parameter of type 'Rating'.
// printRating(6);
//
// 실수: 별점이 6점이 되는 사고를 타입이 막아 줍니다.
//       01단원에서 "타입은 값이 옳은지는 안 본다" 고 했는데,
//       리터럴 유니온은 값의 범위까지 좁혀 주는 예외적인 도구입니다.

// ✏️ 직접 해보기 3 — "S" | "M" | "L" 인 Size 타입을 만들고
//    함수 하나를 만들어 "XL" 을 넘겨 보세요. 확인한 뒤 지우세요.


// ── 섹션 4: 그런데 변수에서는 그냥 되던데요? ──

// 섹션 2를 읽고 나서 이걸 해 보면 헷갈립니다.
const fixedId: Id = "A-3";
console.log(fixedId.toUpperCase());
// 출력: A-3

// Id 라고 적었는데 문자열 기능이 그냥 됩니다. let 도 마찬가지입니다.
let movingId: Id = "A-3";
console.log(movingId.toUpperCase());
// 출력: A-3

// 왜냐하면 타입스크립트가 '지금 그 자리에 무엇이 들어 있는지' 를 보고 있기 때문입니다.
// 눈에 보이는 값을 대입했으니, 그 순간부터 그 종류로 취급합니다.

// 그래서 다른 종류를 넣으면 그때부터 바뀝니다.
movingId = 3;
console.log(movingId.toFixed(1));
// 출력: 3.0

// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(movingId.toUpperCase());
//
// 실수: 방금 위에서는 됐는데 여기서는 안 됩니다.
//       같은 변수인데 줄에 따라 다릅니다. 3 을 넣은 아래부터는 숫자니까요.
//       메시지도 'string | number' 가 아니라 'number' 라고 나옵니다.

// 그럼 섹션 2는 언제 적용되는가 —
//
//     무엇이 들어올지 '모르는' 자리에서 적용됩니다.
//
// 함수 매개변수가 대표적입니다. 누가 무엇을 넘길지 알 수 없습니다.
function idLength(id: Id) {
  // 에러: TS2339 Property 'toUpperCase' does not exist on type 'Id'.
  // return id.toUpperCase();
  return String(id).length;
}
console.log(idLength("A-3"), idLength(3));
// 출력: 3 1

// 함수가 돌려준 값도 마찬가지입니다. 실행해 봐야 아는 값이니까요.
//
// 정리하면 이렇습니다.
//
//     눈에 보이는 값을 대입했다   →  그 종류로 좁혀진다. 바로 쓸 수 있다
//     밖에서 들어온 값이다        →  유니온 그대로다. 확인해야 쓸 수 있다
//
// 그리고 실무 코드에서 유니온을 만나는 자리는 거의 다 아래쪽입니다.

// ✏️ 직접 해보기 4 — movingId = 3; 아래에 movingId = "B-7"; 을 한 줄 넣고
//    그 아래에서 .toUpperCase() 를 써 보세요. 이번에는 될까요?


// ── 섹션 5: 배열에서 헷갈리는 자리 ──

// 두 표기는 완전히 다릅니다. 괄호 하나 차이입니다.
type MixedArray = (string | number)[]; // 문자열이거나 숫자인 것들의 배열
type TwoArrays = string[] | number[]; // 문자열 배열이거나 숫자 배열

const mixed: MixedArray = ["라떼", 4500, "아메리카노"];
console.log(mixed.length);
// 출력: 3

const onlyStrings: TwoArrays = ["라떼", "아메리카노"];
console.log(onlyStrings.length);
// 출력: 2

// 에러: TS2322 Type '(string | number)[]' is not assignable to type 'TwoArrays'.
// const wrong: TwoArrays = ["라떼", 4500];
//
// 실수: TwoArrays 는 '섞인 배열' 을 허용하지 않습니다.
//       전부 문자열이거나 전부 숫자여야 합니다.
//       메시지를 보면 내가 넣은 것이 (string | number)[] 로 추론됐고,
//       그것이 TwoArrays 에 안 들어간다고 말하고 있습니다.
//       왼쪽이 내가 넣은 것, 오른쪽이 필요한 것 — 01단원 개념03의 그 규칙입니다.

// 어느 쪽이 필요한지 헷갈리면 이렇게 생각하세요.
//
//     (A | B)[]   →  한 배열 안에 A 와 B 가 섞여 있어도 된다
//     A[] | B[]   →  배열 자체가 A 전용이거나 B 전용이다

// ✏️ 직접 해보기 5 — mixed 의 첫 번째 값에 .toUpperCase() 를 써 보세요.
//    걸리나요? 섹션 2와 무슨 관계일까요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 유니온이면 양쪽 기능을 다 쓸 수 있다고 생각하기
//   반대입니다. 공통으로 있는 것만 됩니다. 섹션 2가 이 단원의 핵심입니다.

// [실수 2] 리터럴 유니온에 큰따옴표를 빼먹기
//   type Status = 대기 | 완료 는 안 됩니다. "대기" | "완료" 입니다.
//   따옴표가 없으면 그 이름의 '타입' 을 찾다가 TS2304 로 걸립니다.

// [실수 3] (A | B)[] 와 A[] | B[] 를 같은 것으로 알기
//   섹션 5입니다. 괄호 위치가 뜻을 바꿉니다.

// [실수 4] 유니온을 너무 길게 만들기
//   string | number | boolean | null | undefined 처럼 다 넣으면
//   공통으로 있는 것이 거의 없어져서 아무것도 못 하게 됩니다.
//   그럴 때는 정말 그 모두가 필요한지 다시 생각해 보세요.


// ── 정리 ──

// 1. A | B 는 "둘 중 하나" 다. 개수 제한은 없다.
// 2. ★ 유니온 값으로는 '양쪽에 공통으로 있는 것' 만 쓸 수 있다.
//    한쪽에만 있는 기능은 TS2339 로 막힌다.
// 3. 리터럴 값을 | 로 이으면 "정해진 값만" 이 된다. 오타와 잘못된 값을 막아 준다.
//    자동완성까지 되어서 실무에서 가장 많이 쓴다.
// 4. const 든 let 이든 눈에 보이는 값을 대입했으면 그 종류로 좁혀져 바로 쓸 수 있다.
//    밖에서 들어오는 값(매개변수)만 유니온 그대로다. 확인해야 쓸 수 있다.
// 5. (A | B)[] 는 섞인 배열, A[] | B[] 는 한 종류로만 채운 배열이다.
// 6. "지금 어느 쪽인지" 를 확인하면 그쪽 기능을 다 쓸 수 있다 → 개념02.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) type Flag = number | boolean;
//    function printFlag(f: Flag) { console.log(f); }
//    printFlag(1);                             // 출력: 1
//    printFlag(true);                          // 출력: true
//
// 2) error TS2339: Property 'length' does not exist on type 'string | number'.
//      Property 'length' does not exist on type 'number'.
//    재현:
//    function f(v: string | number) { return v.length; }
//    숫자 쪽에 없다고 알려 줍니다. 두 번째 줄까지 읽어야 어느 쪽인지 나옵니다.
//
// 3) type Size = "S" | "M" | "L";
//    error TS2345: Argument of type '"XL"' is not assignable to parameter of type 'Size'.
//    재현:
//    type Size = "S" | "M" | "L";
//    function printSize(s: Size) { console.log(s); }
//    printSize("XL");
//    목록에 없는 값이라 걸립니다.
//
// 4) 됩니다. "B-7" 을 넣은 아래부터는 다시 문자열로 좁혀지기 때문입니다.
//    한 변수의 타입이 줄에 따라 string → number → string 으로 바뀐 것입니다.
//    타입스크립트는 코드가 흘러가는 순서를 따라가며 판단합니다.
//    이 성질이 개념02(좁히기)의 바탕입니다.
//
// 5) 걸립니다.
//    error TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
//    mixed[0] 을 꺼내면 그 값의 타입이 string | number 입니다.
//    재현:
//    const mixed: (string | number)[] = ["라떼", 4500];
//    console.log(mixed[0].toUpperCase());
//    섹션 2의 규칙이 그대로 적용됩니다. 배열이라고 예외가 아닙니다.
