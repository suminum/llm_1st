// ============================================================
// 04단원 · 개념 03 — 선택 속성 · readonly · interface
// ------------------------------------------------------------
// 실행: node 개념03_선택속성과_interface.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념02까지로 객체 타입은 거의 다 됩니다.
// 이 파일은 실무에서 꼭 만나는 세 가지를 더합니다.
//
//     ? 없어도 되는 속성 · readonly 못 바꾸는 속성 · interface 또 하나의 표기


// ── 섹션 1: ? — 없어도 되는 속성 ──

// 03단원 개념02에서 매개변수에 ? 를 붙였습니다. 속성에도 똑같이 붙습니다.
type Order = {
  menu: string;
  count: number;
  memo?: string; // 메모는 없어도 된다
};

const a: Order = { menu: "라떼", count: 1 };
const b: Order = { menu: "라떼", count: 1, memo: "얼음 적게" };

console.log(a.memo);
// 출력: undefined
console.log(b.memo);
// 출력: 얼음 적게

// ? 가 없으면 빠뜨렸을 때 TS2741 이 났습니다. ? 를 붙였으니 통과합니다.

// 대가도 같습니다. memo 의 타입이 string | undefined 가 됩니다.
//
// 에러: TS18048 'a.memo' is possibly 'undefined'.
// console.log(a.memo.length);
//
// 실수: "없어도 된다면서 .length 를 쓰시겠다고요?" 입니다.
//       03단원 개념02 섹션2와 완전히 같은 이야기입니다.

// 쓰려면 확인하고 씁니다.
if (b.memo) {
  console.log("메모 길이:", b.memo.length);
}
// 출력: 메모 길이: 5

// ✏️ 직접 해보기 1 — Order 에 선택 속성 isHot(boolean)을 추가하고
//    그것 없이 객체를 하나 만들어 보세요.


// ── 섹션 2: ? 와 '값이 undefined 인 것' 은 다르다 ──

// 이건 헷갈리는 자리라 따로 봅니다.
type Strict = { memo: string | undefined }; // ? 가 없다
type Loose = { memo?: string }; // ? 가 있다

// Loose 는 아예 빼도 됩니다.
const loose: Loose = {};
console.log(loose.memo);
// 출력: undefined

// Strict 는 '반드시 있어야 하되, 값이 undefined 여도 된다' 입니다.
const strict: Strict = { memo: undefined };
console.log(strict.memo);
// 출력: undefined

// 그래서 빼면 걸립니다.
//
// 에러: TS2741 Property 'memo' is missing in type '{}' but required in type 'Strict'.
// const strictBroken: Strict = {};
//
// 실수: "값이 undefined 인 것" 과 "속성이 아예 없는 것" 은 다릅니다.
//       거의 항상 ? 쪽(Loose)을 쓰게 됩니다.
//       Strict 같은 모양은 "빠뜨린 게 아니라 일부러 비운 것" 을 구분해야 할 때만 씁니다.

// ✏️ 직접 해보기 2 — const x: Loose = { memo: undefined }; 는 될까요?
//    써 보고 확인하세요.


// ── 섹션 3: readonly — 만든 뒤에는 못 바꾼다 ──

type Receipt = {
  readonly id: number;
  menu: string;
};

const receipt: Receipt = { id: 1001, menu: "라떼" };

receipt.menu = "아메리카노"; // 이건 됩니다
console.log(receipt.menu);
// 출력: 아메리카노

// 에러: TS2540 Cannot assign to 'id' because it is a read-only property.
// receipt.id = 2002;
//
// 실수: "id 는 읽기 전용이라 바꿀 수 없습니다" 입니다.
//       영수증 번호처럼 한 번 정해지면 바뀌면 안 되는 값에 씁니다.

// const 와 헷갈리지 마세요. 막는 대상이 다릅니다.
//
//     const receipt = ...    →  receipt 자체를 다른 객체로 바꾸는 것을 막는다
//     readonly id            →  객체 '안' 의 id 를 바꾸는 것을 막는다
//
// JS자료 06단원에서 "const 객체는 속성은 바꿀 수 있다" 고 배웠습니다.
// 그 구멍을 막는 것이 readonly 입니다.

// 배열에도 쓸 수 있습니다.
type Menu = { name: string; price: number };
const fixedMenus: readonly Menu[] = [
  { name: "아메리카노", price: 4000 },
];
console.log(fixedMenus.length);
// 출력: 1

// 에러: TS2339 Property 'push' does not exist on type 'readonly Menu[]'.
// fixedMenus.push({ name: "라떼", price: 4500 });
//
// 실수: readonly 배열에는 push 자체가 없습니다.
//       "바꾸지 마세요" 가 아니라 "바꾸는 기능이 아예 없다" 로 막습니다.

// ✏️ 직접 해보기 3 — Receipt 의 menu 에도 readonly 를 붙이고
//    receipt.menu = "..." 를 해 보세요. 확인한 뒤 되돌리세요.


// ── 섹션 4: interface — 또 하나의 표기 ──

// 같은 것을 이렇게도 쓸 수 있습니다.
interface Shop {
  name: string;
  seats: number;
}

const shop: Shop = { name: "봄날카페", seats: 24 };
console.log(shop.name, shop.seats);
// 출력: 봄날카페 24

// type 으로 쓴 것과 비교해 보세요.
//
//     type Shop = { name: string; seats: number };     ← = 가 있고 ; 로 끝난다
//     interface Shop { name: string; seats: number }   ← = 가 없고 ; 가 없다
//
// 쓰는 쪽에서는 완전히 똑같습니다. 검사도 똑같이 합니다.

// 에러: TS2741 Property 'seats' is missing in type '{ name: string; }' but required in type 'Shop'.
// const brokenShop: Shop = { name: "봄날카페" };

// 구조적 타이핑도 그대로입니다. type 으로 만든 것과 서로 오갑니다.
type ShopType = { name: string; seats: number };
const fromInterface: ShopType = shop;
console.log(fromInterface.seats);
// 출력: 24

// 이름표가 아니라 모양만 보기 때문입니다(개념01 섹션4).

// ✏️ 직접 해보기 4 — interface 로 Customer(name: string, age: number)를 만들고
//    변수를 하나 만들어 출력해 보세요.


// ── 섹션 5: 그럼 type 과 interface 중 뭘 쓰나 ──

// 인터넷에 이 주제로 글이 아주 많습니다. 대부분은 지금 알 필요가 없습니다.
// 이 자료는 기준을 하나로 정합니다.
//
//     ★ type 을 씁니다. 하나만 쓰세요.
//
// 이유는 이렇습니다.
//
//   ① type 은 객체가 아닌 것에도 쓸 수 있습니다.
//      interface 는 객체 모양에만 씁니다.
//
//        type Calc = (a: number, b: number) => number;   ← 함수
//        type Id = string;                                ← 그냥 별명
//        type Status = "대기" | "완료";                    ← 05단원에서 배웁니다
//
//      interface 로는 위 셋을 못 쓰거나 어색합니다.
//      그러니 type 하나로 통일하는 편이 배울 것이 적습니다.
//
//   ② 섞어 쓰면 "왜 여긴 이걸 썼지?" 를 매번 생각하게 됩니다.
//
// 그럼 interface 는 왜 배웠냐면, 남의 코드에 나오기 때문입니다.
// React 라이브러리 설명서도 interface 로 쓰인 것이 많습니다.
// 읽을 줄만 알면 됩니다. 쓸 때는 type 을 쓰세요.

// 참고로 딱 하나 실제로 다른 점이 있습니다. interface 는 같은 이름을 또 쓰면 합쳐집니다.
interface Box {
  width: number;
}
interface Box {
  height: number;
}
const box: Box = { width: 3, height: 4 };
console.log(box.width * box.height);
// 출력: 12

// type 으로 같은 짓을 하면 TS2300 Duplicate identifier 로 걸립니다.
// 이 '합쳐지는' 성질은 남의 라이브러리를 확장할 때 쓰는 것이고,
// 우리 코드에서는 오히려 실수를 놓치게 만듭니다. type 이 안전합니다.

// ✏️ 직접 해보기 5 — type Box2 = { width: number }; 를 두 번 써 보세요.
//    무슨 에러가 나나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] ? 를 붙여 놓고 그냥 쓰기
//   TS18048 입니다. 확인하고 쓰세요. 이 자료에서 두 번째로 자주 보게 됩니다.

// [실수 2] interface 뒤에 = 를 쓰기
//   interface Shop = { ... } 는 안 됩니다. type 만 = 를 씁니다.
//   반대로 type 에 = 를 빼먹는 실수도 흔합니다. 짝을 지어 외우세요.

// [실수 3] readonly 를 const 와 같은 것으로 알기
//   const 는 변수를, readonly 는 속성을 막습니다. 섹션 3을 보세요.

// [실수 4] type 과 interface 를 섞어 쓰기
//   동작에는 문제가 없지만 코드가 지저분해집니다. 하나로 정하세요.


// ── 정리 ──

// 1. 속성 뒤 ? 는 "없어도 된다". 대가로 타입에 undefined 가 섞인다.
// 2. memo?: string 과 memo: string | undefined 는 다르다.
//    앞은 빼도 되고, 뒤는 반드시 있어야 하되 값이 undefined 여도 된다.
// 3. readonly 는 객체 '안' 의 속성을 못 바꾸게 한다. const 와 막는 대상이 다르다.
// 4. readonly 배열에는 push 가 아예 없다.
// 5. interface 도 같은 일을 한다. 표기만 다르다(= 없음, ; 없음).
// 6. 이 자료의 기준 — 쓸 때는 type 하나만. interface 는 읽을 줄만 알면 된다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) type Order2 = { menu: string; count: number; memo?: string; isHot?: boolean };
//    const c: Order2 = { menu: "라떼", count: 1 };
//    console.log(c.isHot);                      // 출력: undefined
//
// 2) 됩니다. 에러가 나지 않습니다.
//    ? 는 "빼도 되고, undefined 를 넣어도 된다" 입니다. 둘 다 허용합니다.
//    반대로 Strict 는 undefined 를 넣는 것만 되고 빼는 것은 안 됩니다.
//
// 3) error TS2540: Cannot assign to 'menu' because it is a read-only property.
//    id 때와 똑같은 에러가 menu 에 대해 납니다.
//    재현:
//    type Receipt = { readonly id: number; readonly menu: string };
//    const receipt: Receipt = { id: 1001, menu: "라떼" };
//    receipt.menu = "아메리카노";
//
// 4) interface Customer { name: string; age: number }
//    const cust: Customer = { name: "홍길동", age: 25 };
//    console.log(cust.name, cust.age);          // 출력: 홍길동 25
//
// 5) error TS2300: Duplicate identifier 'Box2'.
//    type 은 같은 이름을 두 번 만들 수 없습니다.
//    interface 는 조용히 합쳐지므로, 오타로 같은 이름을 써도 안 걸립니다.
//    재현:
//    type Box2 = { width: number };
//    type Box2 = { width: number };
//    그래서 이 자료는 type 을 권합니다.
