// ============================================================
// 06단원 · 개념 02 — 제네릭 쓰기
// ------------------------------------------------------------
// 실행: node 개념02_제네릭_쓰기.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념01에서 <T> 하나를 봤습니다.
// 이 파일은 실제로 쓸 때 필요한 것 네 가지를 더합니다.
//
//     여러 개 받기 · 직접 정해 주기 · 조건 걸기 · 타입에 붙이기


// ── 섹션 1: 타입 매개변수를 여러 개 ──

// 쉼표로 나열하면 됩니다.
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const p1 = pair("라떼", 4500);
console.log(p1);
// 출력: [ '라떼', 4500 ]

// p1 의 타입은 [string, number] 입니다. 02단원 개념01 섹션5의 그 튜플입니다.
// 거기서는 [string, number] 처럼 종류를 직접 적었는데,
// 여기서는 [A, B] 라고 적어 두고 부를 때 정해집니다. 그게 다른 점입니다.
//
//     string[]            길이 제한 없이 문자열만
//     [string, number]    딱 두 개, 앞은 문자열 뒤는 숫자
//     [A, B]              딱 두 개, 종류는 부를 때 정해짐
//
// 07단원에서 React 의 useState 가 정확히 이 모양을 돌려줍니다.

console.log(p1[0].toUpperCase());
// 출력: 라떼
console.log(p1[1].toFixed(0));
// 출력: 4500

// 자리마다 타입이 다른 것에 주목하세요. [0] 은 문자열, [1] 은 숫자입니다.
//
// 에러: TS2551 Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?
// console.log(p1[0].toFixed(0));
//
// 실수: 0번 자리는 문자열입니다. 순서가 타입에 적혀 있습니다.
//       Did you mean 'fixed'? 는 무시하세요. 문자열에 정말로 fixed 라는
//       옛날 기능이 있어서 비슷한 이름으로 골라 준 것입니다.
//       제안이 항상 옳지는 않습니다(01단원 개념03 ③).

// 구조분해로 꺼내면 더 편합니다. JS자료 09단원에서 배운 그대로입니다.
const [menuName, menuPrice] = pair("아메리카노", 4000);
console.log(menuName, menuPrice);
// 출력: 아메리카노 4000

// ✏️ 직접 해보기 1 — pair(true, "확인") 을 만들어 두 값을 각각 출력해 보세요.


// ── 섹션 2: T 를 직접 정해 주기 ──

// 대개는 넘긴 값을 보고 알아냅니다. 하지만 알아낼 근거가 없을 때가 있습니다.
function makeEmpty<T>(): T[] {
  return [];
}

// 넘기는 값이 없으니 T 를 알아낼 방법이 없습니다. 그럴 때는 직접 적습니다.
const names = makeEmpty<string>();
names.push("라떼");
console.log(names);
// 출력: [ '라떼' ]

// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type 'string'.
// names.push(4500);
//
// 실수: <string> 이라고 정해 줬으니 문자열만 들어갑니다.

// 적어 준 것과 넘긴 것이 다르면 걸립니다.
function wrap<T>(value: T): T[] {
  return [value];
}
console.log(wrap<string>("라떼"));
// 출력: [ '라떼' ]

// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type 'string'.
// console.log(wrap<string>(4500));
//
// 실수: string 이라고 해 놓고 숫자를 넘겼습니다.

// 규칙 — 알아낼 수 있으면 맡기고, 없으면 적습니다.
// 굳이 적으면 코드만 길어집니다.
console.log(wrap("라떼"));
// 출력: [ '라떼' ]

// ✏️ 직접 해보기 2 — makeEmpty 를 써서 숫자 배열을 만들고 3 을 넣어 출력해 보세요.


// ── 섹션 3: extends — 아무거나는 곤란할 때 ──

// T 는 정말 아무 타입이나 될 수 있습니다. 그래서 T 로는 할 수 있는 게 거의 없습니다.
//
// 에러: TS2339 Property 'length' does not exist on type 'T'.
// function badLength<T>(value: T) {
//   return value.length;
// }
//
// 실수: T 가 숫자일 수도 있는데 length 를 쓰려고 했습니다.
//       05단원의 "공통으로 있는 것만" 규칙과 같은 이유입니다.
//       T 는 '모든 타입' 이니 공통인 것이 거의 없습니다.

// 그래서 조건을 겁니다. "length 가 있는 것만 받겠다" 는 뜻입니다.
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

console.log(getLength("아메리카노"));
// 출력: 5
console.log(getLength([1, 2, 3]));
// 출력: 3
console.log(getLength({ length: 99, name: "가짜" }));
// 출력: 99

// 문자열에도 배열에도 length 가 있으니 둘 다 됩니다.
//
// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
// console.log(getLength(123));
//
// 실수: 숫자에는 length 가 없어서 조건에 안 맞습니다.
//       부르는 쪽에서 막아 주는 것이 핵심입니다. 함수 안이 아니라요.

// extends 는 "상속" 이 아니라 "적어도 이건 갖고 있어야 한다" 로 읽으세요.
//
//     T extends { length: number }   →  length 가 있는 것이면 무엇이든
//     T extends string               →  문자열이거나 그 하위인 것
//     T extends { id: number }       →  id 가 있는 객체면 무엇이든

// 실전 예 — id 가 있는 것들 중에서 찾기
type Menu = { id: number; name: string };
type User = { id: number; email: string };

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

const menus: Menu[] = [
  { id: 1, name: "아메리카노" },
  { id: 2, name: "라떼" },
];
const users: User[] = [{ id: 7, email: "a@b.c" }];

console.log(findById(menus, 2)?.name);
// 출력: 라떼
console.log(findById(users, 7)?.email);
// 출력: a@b.c

// 하나의 함수로 Menu 도 User 도 찾습니다.
// 그런데 돌려받은 값에는 각각 제대로 된 타입이 붙어 있습니다.
//
// 에러: TS2339 Property 'email' does not exist on type 'Menu'.
// console.log(findById(menus, 2)?.email);
//
// 실수: menus 를 넘겼으니 T 는 Menu 입니다. Menu 에는 email 이 없습니다.
//       any 로 만들었다면 이게 조용히 통과했을 것입니다.

// ✏️ 직접 해보기 3 — findById(menus, 99) 를 출력해 보세요. 무엇이 나오나요?


// ── 섹션 4: 타입에도 붙일 수 있다 ──

// 함수뿐 아니라 type 에도 <T> 를 붙입니다.
type ApiResult<T> = {
  ok: boolean;
  data: T;
};

// 쓸 때 <> 안에 무엇을 담을지 적습니다.
const menuResult: ApiResult<Menu> = {
  ok: true,
  data: { id: 1, name: "아메리카노" },
};
console.log(menuResult.data.name);
// 출력: 아메리카노

const countResult: ApiResult<number> = { ok: true, data: 42 };
console.log(countResult.data.toFixed(0));
// 출력: 42

const listResult: ApiResult<Menu[]> = { ok: true, data: menus };
console.log(listResult.data.length);
// 출력: 2

// data 자리만 바뀌고 ok 는 그대로입니다.
// 서버 응답이 언제나 { ok, data } 모양이라면 이렇게 한 번만 만들어 두고 씁니다.
//
// 에러: TS2741 Property 'name' is missing in type '{ id: number; }' but required in type 'Menu'.
// const wrong: ApiResult<Menu> = { ok: true, data: { id: 1 } };
//
// 실수: <Menu> 라고 했으니 data 는 Menu 모양이어야 합니다.

// ✏️ 직접 해보기 4 — ApiResult<string> 값을 하나 만들어 data 의 글자 수를 출력해 보세요.


// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] T 로 아무 일이나 하려 하기
//   섹션 3입니다. T 는 모든 타입이라 공통인 것이 거의 없습니다.
//   무언가를 하려면 extends 로 조건을 거세요.

// [실수 2] extends 를 상속으로 읽기
//   "적어도 이건 갖고 있어야 한다" 입니다. 클래스 상속과는 다른 이야기입니다.

// [실수 3] 부를 때마다 <타입> 을 적기
//   대개는 안 적어도 알아냅니다. 적어야 하는 건 알아낼 근거가 없을 때뿐입니다(섹션 2).

// [실수 4] 튜플과 배열을 같은 것으로 알기
//   [string, number] 는 딱 두 개, 순서가 정해진 것입니다(02단원 개념01 섹션5).
//   (string | number)[] 와 다릅니다. 05단원 개념01 섹션5의 그 구분과 비슷합니다.


// ── 정리 ──

// 1. 타입 매개변수는 <A, B> 처럼 여러 개 받을 수 있다.
// 2. [A, B] 는 튜플이다(02단원 개념01 섹션5). 종류를 부를 때 정하는 것만 다르다.
//    07단원의 useState 가 이 모양을 돌려준다.
// 3. 알아낼 근거가 없으면 부를 때 <타입> 을 직접 적는다. 있으면 맡긴다.
// 4. T 로는 할 수 있는 것이 거의 없다. extends 로 "적어도 이건 있다" 를 걸어 준다.
// 5. type 에도 <T> 를 붙일 수 있다. ApiResult<Menu> 처럼 담을 것만 바꿔 쓴다.
// 6. 제네릭을 쓰면 함수는 하나인데 돌려받는 값에는 제대로 된 타입이 붙는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const p2 = pair(true, "확인");
//    console.log(p2[0], p2[1]);              // 출력: true 확인
//    p2 의 타입은 [boolean, string] 입니다.
//    p2[0].toUpperCase() 를 쓰면 TS2339 로 걸립니다. 0번 자리는 불리언이니까요.
//
// 2) const nums = makeEmpty<number>();
//    nums.push(3);
//    console.log(nums);                      // 출력: [ 3 ]
//    <number> 를 안 적으면 T 를 알아낼 근거가 없어 unknown[] 이 됩니다.
//    그러면 push(3) 은 되지만 꺼내 쓸 때 막힙니다.
//
// 3) console.log(findById(menus, 99));       // 출력: undefined
//    find 는 못 찾으면 undefined 를 줍니다. 그래서 반환 타입이 T | undefined 입니다.
//    ?. 를 붙여 둔 이유가 이것입니다(05단원 개념03).
//
// 4) const textResult: ApiResult<string> = { ok: true, data: "봄날카페" };
//    console.log(textResult.data.length);    // 출력: 4
//    data 가 string 이라고 정해 줬으니 .length 가 통과합니다.
