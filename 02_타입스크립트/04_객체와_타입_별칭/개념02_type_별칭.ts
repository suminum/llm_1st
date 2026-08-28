// ============================================================
// 04단원 · 개념 02 — type: 타입에 이름 붙이기
// ------------------------------------------------------------
// 실행: node 개념02_type_별칭.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념01 마지막에서 이런 표기가 나왔습니다.
//
//     { name: string; price: number }[]
//
// 이게 세 번, 네 번 나오면 고칠 때마다 전부 찾아 고쳐야 합니다.
// 가격을 문자열로 바꾸기로 했다면 다섯 군데를 다 찾아야 합니다. 하나라도 빠뜨리면 어긋납니다.
//
// 그래서 이름을 붙입니다. 변수에 이름을 붙이는 것과 똑같은 이유입니다.


// ── 섹션 1: type 이름 = 모양; ──

type Menu = { name: string; price: number };

// 이제 Menu 라고만 쓰면 됩니다.
const latte: Menu = { name: "라떼", price: 4500 };
console.log(latte.name, latte.price);
// 출력: 라떼 4500

function printMenu(item: Menu) {
  console.log(item.name + " " + item.price + "원");
}
printMenu(latte);
// 출력: 라떼 4500원

// 배열도 짧아집니다.
const menus: Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
];
console.log(menus.length);
// 출력: 2

// 개념01의 그 표기와 비교해 보세요.
//
//     전:  const menus: { name: string; price: number }[] = [...]
//     후:  const menus: Menu[] = [...]
//
// 그리고 가격을 문자열로 바꿔야 한다면, 고칠 곳은 type Menu 한 줄뿐입니다.

// 검사는 똑같이 합니다. 이름만 붙였을 뿐입니다.
//
// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type 'Menu'.
// const broken: Menu = { name: "라떼" };
//
// 실수: 메시지에 'Menu' 라는 이름이 그대로 나옵니다.
//       긴 모양이 통째로 찍히던 것보다 훨씬 읽기 쉽습니다. 이것도 이득입니다.

// ✏️ 직접 해보기 1 — 이름(string)과 좌석수(number)를 가진 Shop 타입을 만들고
//    변수 하나를 만들어 출력해 보세요.


// ── 섹션 2: 이름 짓는 관행 ──

// 타입 이름은 대문자로 시작합니다.
//
//     type Menu     ○
//     type menu     × (문법상 되지만 아무도 안 씁니다)
//
// 변수는 소문자, 타입은 대문자로 시작하니 한눈에 구별됩니다.
//
//     const menu: Menu = ...
//           └변수  └타입
//
// 이 자료도 그렇게 씁니다. 02단원에서 "타입 이름은 전부 소문자" 라고 한 것은
// string · number 같은 '기본 타입' 이야기입니다. 내가 만든 타입은 대문자입니다.

type Shop = { name: string; seats: number };
const shop: Shop = { name: "봄날카페", seats: 24 };
console.log(shop.name);
// 출력: 봄날카페

// ✏️ 직접 해보기 2 — 위 shop 에 마우스를 올려 보세요.
//    타입이 Shop 이라고 나오나요, 아니면 { name: string; seats: number } 라고 나오나요?


// ── 섹션 3: 함수 타입에도 이름을 붙인다 ──

// 03단원 개념03 섹션4에서 예고한 것입니다.
type Calc = (a: number, b: number) => number;

function runA(fn: Calc) {
  return fn(1, 2);
}
function runB(fn: Calc) {
  return fn(10, 20);
}

const add: Calc = (a, b) => a + b;
console.log(runA(add), runB(add));
// 출력: 3 30

// add 의 매개변수 (a, b) 에 타입을 안 적은 것에 주목하세요.
// 왼쪽에 : Calc 라고 적어 두었으니 문맥에서 알아냅니다.

// 여기서 놀라운 것 하나 — 매개변수를 '적게' 받는 함수는 통과합니다.
const half: Calc = (a) => a / 2;
console.log(runA(half));
// 출력: 0.5

// Calc 는 두 개를 받기로 했는데 하나만 받는 함수를 넣었는데도 통과했습니다.
// 두 번째 값을 그냥 안 쓸 뿐이니 문제가 될 게 없기 때문입니다.
//
// JS자료 08단원에서 arr.map((x) => x) 처럼 index 를 안 받고 써도 됐던 이유가 이것입니다.
// map 은 값·인덱스·배열 셋을 넘기지만, 안 받으면 안 받는 대로 됩니다.

// 반대로 '돌려주는 종류' 가 다르면 걸립니다.
//
// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// const label: Calc = (a, b) => "합계 " + (a + b);
//
// 실수: 화살표 안쪽을 콕 집어 줍니다. 숫자를 주기로 했는데 문자열을 줬습니다.

// 매개변수의 '종류' 가 다른 것도 걸립니다.
//
// 에러: TS2322 Type '(a: string, b: number) => number' is not assignable to type 'Calc'.
// const wrongParam: Calc = (a: string, b: number) => 1;
//
// 실수: 메시지가 여러 줄로 나옵니다.
//       Types of parameters 'a' and 'a' are incompatible.
//       두 번째 줄까지 읽어야 어느 매개변수가 문제인지 알 수 있습니다.
//
//       정리하면 — 개수가 모자란 것은 봐주고, 종류가 다른 것은 안 봐줍니다.

// ✏️ 직접 해보기 3 — 문자열 하나를 받아 숫자를 돌려주는 함수 타입 Measure 를 만들고,
//    글자 수를 세는 함수를 담아 써 보세요.


// ── 섹션 4: 타입 안에 타입 ──

// 만든 타입을 다른 타입 안에서 쓸 수 있습니다.
type Order = {
  shop: Shop;
  items: Menu[];
  memo: string;
};

const todayOrder: Order = {
  shop: { name: "봄날카페", seats: 24 },
  items: [
    { name: "아메리카노", price: 4000 },
    { name: "라떼", price: 4500 },
  ],
  memo: "포장",
};

console.log(todayOrder.shop.name);
// 출력: 봄날카페
console.log(todayOrder.items[1].price);
// 출력: 4500

// 자동완성도 끝까지 따라옵니다. todayOrder.items[0]. 까지 치면 name / price 가 뜹니다.

// 안쪽이 틀리면 안쪽을 콕 집어 줍니다.
//
// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// const wrongOrder: Order = {
//   shop: { name: "봄날카페", seats: 24 },
//   items: [{ name: "라떼", price: "4500원" }],
//   memo: "",
// };
//
// 실수: Order 전체가 아니라 "4500원" 자리를 가리킵니다.
//       중첩이 깊어도 정확한 자리를 알려 줍니다.

// ✏️ 직접 해보기 4 — todayOrder 의 items 에 메뉴를 하나 더 넣고
//    전체 개수를 출력해 보세요.


// ── 섹션 5: 언제 이름을 붙이나 ──

// 규칙은 단순합니다.
//
//     같은 모양을 두 번 이상 쓰게 되면 이름을 붙인다.
//
// 한 번만 쓰는 모양은 그냥 그 자리에 적어도 됩니다.
function logSize(box: { width: number; height: number }) {
  console.log(box.width * box.height);
}
logSize({ width: 3, height: 4 });
// 출력: 12

// 다만 이름을 붙이면 부수적인 이득이 둘 있습니다.
//
//   ① 에러 메시지가 짧아진다 (섹션 1)
//   ② 이름 자체가 설명이 된다
//
// { name: string; price: number } 보다 Menu 가 뜻이 분명합니다.
// 그래서 실무에서는 한 번만 써도 이름을 붙이는 경우가 많습니다.

// ✏️ 직접 해보기 5 — 위 logSize 의 매개변수 모양에 Box 라는 이름을 붙여 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] type 뒤에 = 를 빼먹기
//   type Menu { ... } 는 안 됩니다. type Menu = { ... }; 입니다.
//   (뒤에서 배울 interface 는 = 가 없어서 더 헷갈립니다. 개념03을 보세요)

// [실수 2] 타입 이름을 변수처럼 쓰기
//   console.log(Menu) 는 안 됩니다. Menu 는 실행되는 값이 아닙니다.
//   node 로 돌리면 타입은 통째로 지워집니다(01단원 개념02).

// [실수 3] 세미콜론 빠뜨리기
//   type Menu = { ... } 뒤의 ; 는 있는 편이 안전합니다.
//   없어도 대개 동작하지만 다음 줄과 붙어 이상한 에러가 날 때가 있습니다.

// [실수 4] 이름을 소문자로 짓기
//   문법상 되지만 변수와 구별이 안 됩니다. 대문자로 시작하세요.


// ── 정리 ──

// 1. type 이름 = 모양; 으로 타입에 이름을 붙인다.
// 2. 이름은 대문자로 시작한다. 변수(소문자)와 한눈에 구별된다.
// 3. 고칠 곳이 한 군데로 모인다. 이게 이름을 붙이는 가장 큰 이유다.
// 4. 에러 메시지에도 그 이름이 나와서 읽기 쉬워진다.
// 5. 함수 타입에도 붙일 수 있다. type Calc = (a: number, b: number) => number;
// 6. 만든 타입을 다른 타입 안에서 쓸 수 있다. 중첩이 깊어도 자리를 정확히 짚어 준다.
// 7. 같은 모양을 두 번 쓰게 되면 이름을 붙인다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) type Cafe = { name: string; seats: number };
//    const myCafe: Cafe = { name: "봄날카페", seats: 24 };
//    console.log(myCafe.name, myCafe.seats);    // 출력: 봄날카페 24
//    (이 파일에는 이미 Shop 이 있으니 다른 이름을 쓰세요.
//     같은 이름을 두 번 만들면 TS2300 Duplicate identifier 가 납니다)
//
// 2) const shop: Shop 이라고 나옵니다.
//    붙여 둔 이름을 그대로 보여 줍니다.
//    모양이 궁금하면 Shop 위에 마우스를 올리면 펼쳐집니다.
//
// 3) type Measure = (s: string) => number;
//    const count: Measure = (s) => s.length;
//    console.log(count("봄날카페"));            // 출력: 4
//    (s) 에 타입을 안 적어도 되는 것에 주목하세요. : Measure 가 알려 줍니다.
//
// 4) todayOrder.items.push({ name: "카페모카", price: 5000 });
//    console.log(todayOrder.items.length);      // 출력: 3
//    push 에 넘기는 객체도 Menu 모양이어야 합니다. 아니면 TS2345 로 걸립니다.
//
// 5) type Box = { width: number; height: number };
//    function logSize2(box: Box) { console.log(box.width * box.height); }
//    logSize2({ width: 3, height: 4 });         // 출력: 12
