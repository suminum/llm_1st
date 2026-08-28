// ============================================================
// 06단원 · 개념 04 — keyof: 속성 이름을 타입으로 다루기
// ------------------------------------------------------------
// 실행: node 개념04_keyof로_속성_다루기.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념02 섹션3에서 extends 로 "적어도 이건 갖고 있어야 한다" 를 걸었습니다.
// 이번엔 한 걸음 더 갑니다.
//
//     "이 객체가 가진 속성 이름" 자체를 타입으로 쓴다.
//
// 속성 이름을 값으로 넘기는 함수를 만들 때 필요합니다.
// 목록에서 이름만 뽑기, 표를 원하는 열로 정렬하기 같은 것들입니다.


type Menu = { name: string; price: number };

const menu: Menu = { name: "아메리카노", price: 4000 };


// ── 섹션 1: 속성 이름을 그냥 string 으로 받으면 ──

// "객체와 속성 이름을 받아서 그 값을 돌려주는 함수" 를 만들어 봅시다.
// 속성 이름은 글자니까 string 으로 받으면 될 것 같습니다.
//
// 에러: TS7053 Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Menu'.
// function getLoose(item: Menu, key: string) {
//   return item[key];
// }
//
// 실수: key 가 string 이면 "name" 일 수도 있지만 "냐옹" 일 수도 있습니다.
//       Menu 에 "냐옹" 은 없으니 무엇을 돌려줄지 타입스크립트가 모릅니다.
//       모르면 any 가 되는데, 이 자료는 any 를 막아 두었으니 여기서 걸립니다.

// 억지로 통과시키면 어떻게 되는지 보겠습니다.
// (실제로 쓰지 마세요. 무엇이 문제인지 보려고 적은 것입니다)
function getByHand(item: Menu, key: "name" | "price"): string | number {
  return item[key];
}

console.log(getByHand(menu, "name"));
// 출력: 아메리카노
console.log(getByHand(menu, "price"));
// 출력: 4000

// 이건 되기는 합니다. 오타도 막아 줍니다.
//
// 에러: TS2345 Argument of type '"nmae"' is not assignable to parameter of type '"name" | "price"'.
// console.log(getByHand(menu, "nmae"));
//
// 실수: 오타는 잡혔습니다. 여기까지는 좋습니다.

// 그런데 두 가지가 불편합니다.
//
//   ① 돌려받은 값이 string | number 라 바로 못 씁니다.
//      "name" 을 넘겼는데도 숫자일 수 있다고 나옵니다.
//   ② Menu 에 속성을 하나 추가하면 "name" | "price" 도 손으로 고쳐야 합니다.
//
// ① 을 확인해 봅시다.
//
// 에러: TS2339 Property 'length' does not exist on type 'string | number'.
// console.log(getByHand(menu, "name").length);
//
// 실수: 우리는 "name" 을 넘겼으니 문자열이 온다는 것을 압니다.
//       그런데 타입에는 그 연결이 안 적혀 있습니다.
//       05단원 개념01의 "공통으로 있는 것만" 규칙에 걸린 것입니다.

// ✏️ 직접 해보기 1 — Menu 에 size: string 을 추가해 보세요.
//    getByHand 를 고치지 않으면 getByHand(menu, "size") 가 되나요?


// ── 섹션 2: keyof — 속성 이름들의 유니온 ──

// 손으로 적던 "name" | "price" 를 타입스크립트가 만들어 줍니다.
type MenuKey = keyof Menu;

// MenuKey 는 "name" | "price" 입니다. 05단원에서 배운 유니온 그대로입니다.
const key1: MenuKey = "name";
const key2: MenuKey = "price";
console.log(key1, key2);
// 출력: name price

// 에러: TS2322 Type '"nmae"' is not assignable to type 'keyof Menu'.
// const key3: MenuKey = "nmae";
//
// 실수: Menu 에 없는 이름이라 걸립니다.
//       메시지에 keyof Menu 라고 나오는 것에 주목하세요.
//       "Menu 의 속성 이름이어야 한다" 는 뜻입니다.

// keyof 의 좋은 점은 Menu 를 고치면 따라온다는 것입니다.
type Cafe = { name: string; open: boolean; seats: number };
type CafeKey = keyof Cafe;

const ck: CafeKey = "seats";
console.log(ck);
// 출력: seats

// Cafe 에 속성을 더하면 CafeKey 도 저절로 늘어납니다.
// 손으로 적은 "name" | "open" | "seats" 였다면 고치는 것을 잊어버립니다.

// ✏️ 직접 해보기 2 — keyof Cafe 에 "price" 를 넣어 보세요. 무슨 에러가 나나요?


// ── 섹션 3: K extends keyof T — 값의 타입까지 따라온다 ★ ──

// 섹션 1의 불편함 ① 을 해결합니다.
// 넘긴 이름에 맞는 타입이 그대로 돌아오게 만듭니다.
function getField<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}

// 읽는 법은 이렇습니다.
//
//     T            객체의 타입 (Menu)
//     K extends keyof T   그 객체의 속성 이름 중 하나 ("name" 또는 "price")
//     T[K]         T 에서 K 자리에 적힌 타입
//
// T[K] 를 '인덱스 접근 타입' 이라고 합니다.
// 객체에서 값을 꺼낼 때 item["name"] 이라고 쓰는 것과 모양이 같습니다.
// 값이 아니라 타입에 대고 같은 일을 하는 것입니다.
//
//     Menu["name"]    →  string
//     Menu["price"]   →  number

console.log(getField(menu, "name").length);
// 출력: 5
console.log(getField(menu, "price").toFixed(0));
// 출력: 4000

// 섹션 1과 비교해 보세요. 같은 .length 가 이번에는 통과합니다.
// "name" 을 넘겼으니 string 이 온다는 것이 타입에 적혀 있기 때문입니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(getField(menu, "price").toUpperCase());
//
// 실수: "price" 를 넘겼으니 number 가 옵니다. 숫자에는 toUpperCase 가 없습니다.
//       넘긴 이름에 따라 돌아오는 타입이 달라진다는 증거입니다.

// 오타도 그대로 걸립니다.
//
// 에러: TS2345 Argument of type '"nmae"' is not assignable to parameter of type 'keyof Menu'.
// console.log(getField(menu, "nmae"));
//
// 실수: keyof 가 만들어 준 목록에 없는 이름입니다.

// Menu 말고 다른 타입에도 그대로 씁니다. 함수는 하나뿐입니다.
const cafe: Cafe = { name: "봄날카페", open: true, seats: 24 };
console.log(getField(cafe, "seats").toFixed(0));
// 출력: 24
console.log(getField(cafe, "open"));
// 출력: true

// ✏️ 직접 해보기 3 — getField(cafe, "name") 의 결과에 .toFixed(0) 을 써 보세요.
//    무슨 에러가 나나요?


// ── 섹션 4: 실전 — 목록에서 한 속성만 뽑기 ──

// 이 패턴을 실제로 가장 많이 쓰는 곳입니다.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const menus: Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "카푸치노", price: 5000 },
];

console.log(pluck(menus, "name"));
// 출력: [ '아메리카노', '라떼', '카푸치노' ]
console.log(pluck(menus, "price"));
// 출력: [ 4000, 4500, 5000 ]

// 돌려받은 것이 제대로 된 배열이라 이어서 계산이 됩니다.
const total = pluck(menus, "price").reduce((sum, p) => sum + p, 0);
console.log(total);
// 출력: 13500

// pluck(menus, "price") 가 number[] 이니 sum + p 가 숫자 덧셈입니다.
// JS자료 08단원의 reduce 그대로인데, 타입이 붙어 있어서 실수가 안 납니다.
//
// 에러: TS2345 Argument of type '"prcie"' is not assignable to parameter of type 'keyof Menu'.
// console.log(pluck(menus, "prcie"));
//
// 실수: 오타입니다. 자바스크립트였다면 [undefined, undefined, undefined] 가
//       조용히 나오고, 합계는 NaN 이 됐을 것입니다.

// ✏️ 직접 해보기 4 — pluck(menus, "name") 에 reduce 로 합계를 내 보세요.
//    무슨 일이 생기나요?


// ── 섹션 5: Object.keys 는 왜 keyof 를 안 주나 ──

// 속성 이름을 전부 훑고 싶을 때 Object.keys 를 씁니다.
const loose = Object.keys(menu);
console.log(loose);
// 출력: [ 'name', 'price' ]

// 값은 맞는데 타입이 string[] 입니다. (keyof Menu)[] 가 아닙니다.
//
// 에러: TS7053 Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Menu'.
// for (const k of loose) {
//   console.log(menu[k]);
// }
//
// 실수: 섹션 1과 똑같은 에러입니다. loose 의 원소가 string 이기 때문입니다.

// 왜 이렇게 만들어 두었을까요? 04단원 개념04 섹션3의 그 이야기입니다.
//
//     타입은 약속이지 검사가 아니다.
//
// menu 에 실제로는 타입에 안 적힌 속성이 더 붙어 있을 수 있습니다.
// 그래서 Object.keys 가 "keyof Menu 만 나온다" 고 약속할 수 없습니다.
// 거짓말을 하느니 string[] 이라고 하는 쪽을 고른 것입니다.

// 훑어야 한다면 키 목록을 직접 적습니다.
const keys: (keyof Menu)[] = ["name", "price"];

for (const k of keys) {
  console.log(k, getField(menu, k));
}
// 출력: name 아메리카노
// 출력: price 4000

// 이렇게 적어 두면 Menu 에서 속성을 지웠을 때 이 줄이 걸립니다.
//
// 에러: TS2322 Type '"size"' is not assignable to type 'keyof Menu'.
// const keysWrong: (keyof Menu)[] = ["name", "price", "size"];
//
// 실수: Menu 에 size 가 없습니다. 손으로 적은 목록도 타입이 지켜 줍니다.

// ✏️ 직접 해보기 5 — keys 에서 "price" 를 빼고 위 for 문을 돌려 보세요.
//    에러가 나나요? 출력은 어떻게 되나요?


// ── 섹션 6: 언제 쓰고 언제 안 쓰나 ──

// keyof 는 "속성 이름을 값으로 넘길 때" 만 필요합니다.
// 그 상황이 아니면 쓰지 마세요. 읽기만 어려워집니다.
//
// [쓸 만한 자리]
//   · 목록에서 원하는 열만 뽑기          pluck(menus, "name")
//   · 표를 원하는 열로 정렬하기          sortBy(menus, "price")
//   · 설정 객체에서 이름으로 값 읽기      getField(config, "포트")
//
// [안 써도 되는 자리]
//   · 속성이 하나로 정해져 있으면 그냥 적으면 됩니다.

// 이렇게 쓰지 말고
console.log(getField(menu, "name"));
// 출력: 아메리카노

// 이렇게 쓰세요. 짧고 읽기 쉽습니다.
console.log(menu.name);
// 출력: 아메리카노

// 둘은 같은 값을 냅니다. 아래가 낫습니다.
// 제네릭은 "여러 경우를 하나로 묶을 때" 쓰는 것이지,
// 한 가지 경우를 어렵게 쓰려고 쓰는 것이 아닙니다.

// ✏️ 직접 해보기 6 — 메뉴 이름만 모아 글자 수 합계를 내 보세요.
//    pluck 을 쓰는 것과 menus.map((m) => m.name) 을 쓰는 것 중
//    어느 쪽이 읽기 좋은가요?


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 속성 이름을 string 으로 받기
//   섹션 1입니다. TS7053 이 나오면 거의 이것입니다.
//   key: string 을 key: K extends keyof T 로 바꾸세요.

// [실수 2] keyof 를 붙일 자리를 헷갈리기
//   keyof T 는 '이름들' 이고, T[K] 는 '그 이름 자리의 타입' 입니다.
//   돌려주는 타입에 keyof T 를 적으면 이름이 나옵니다. 값이 아니라요.

// [실수 3] Object.keys 결과를 keyof 로 알기
//   섹션 5입니다. string[] 입니다. 훑어야 하면 목록을 직접 적으세요.

// [실수 4] 안 써도 되는 곳에 쓰기
//   섹션 6입니다. menu.name 으로 끝나는 일에 제네릭을 넣지 마세요.


// ── 정리 ──

// 1. keyof T 는 T 의 속성 이름을 모은 유니온이다. keyof Menu 는 "name" | "price".
// 2. T 를 고치면 keyof T 도 따라온다. 손으로 적은 유니온은 안 따라온다.
// 3. T[K] 는 '인덱스 접근 타입' 이다. Menu["price"] 는 number.
// 4. <T, K extends keyof T>(item: T, key: K): T[K] 가 기본 꼴이다.
//    넘긴 이름에 맞는 타입이 그대로 돌아온다.
// 5. 목록에서 한 속성만 뽑는 pluck 이 대표적인 쓰임이다.
// 6. Object.keys 는 string[] 을 준다. 타입은 약속이지 검사가 아니기 때문이다.
//    훑어야 하면 (keyof T)[] 목록을 직접 적는다.
// 7. 속성 이름을 값으로 넘길 때만 쓴다. menu.name 으로 끝나는 일에는 쓰지 않는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) size 를 추가해도 getByHand(menu, "size") 는 안 됩니다.
//    error TS2345: Argument of type '"size"' is not assignable to parameter of type '"name" | "price"'.
//    재현:
//    type Menu = { name: string; price: number; size: string };
//    function getByHand(item: Menu, key: "name" | "price"): string | number {
//      return item[key];
//    }
//    const menu: Menu = { name: "아메리카노", price: 4000, size: "L" };
//    void getByHand(menu, "size");
//    매개변수에 "name" | "price" 라고 손으로 적어 두었기 때문입니다.
//    Menu 를 고쳐도 저 줄은 안 따라옵니다. 이것이 섹션 2에서 keyof 를 쓰는 이유입니다.
//    섹션 3의 getField 는 고칠 것 없이 바로 됩니다. keyof Menu 가 따라오니까요.
//
// 2) Cafe 에는 price 가 없습니다. keyof Cafe 는 "name" | "open" | "seats" 입니다.
//    error TS2322: Type '"price"' is not assignable to type 'keyof Cafe'.
//    재현:
//    type Cafe = { name: string; open: boolean; seats: number };
//    const ck: keyof Cafe = "price";
//    void ck;
//    손으로 적은 유니온이었다면 Cafe 를 고쳤을 때 이 줄이 안 따라옵니다.
//
// 3) "name" 을 넘겼으니 Cafe["name"] 즉 string 이 돌아옵니다.
//    error TS2551: Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?
//    재현:
//    type Cafe = { name: string; open: boolean; seats: number };
//    function getField<T, K extends keyof T>(item: T, key: K): T[K] {
//      return item[key];
//    }
//    const cafe: Cafe = { name: "봄날카페", open: true, seats: 24 };
//    void getField(cafe, "name").toFixed(0);
//    문자열에는 toFixed 가 없습니다.
//    Did you mean 'fixed'? 는 무시하세요. 개념02 섹션1에서 본 그 헛다리입니다.
//    같은 함수인데 "seats" 를 넘기면 toFixed 가 통과합니다(섹션 3 마지막 줄).
//
// 4) 타입 에러가 납니다. 번호가 2345 가 아니라 2769 인 것에 주의하세요.
//    error TS2769: No overload matches this call.
//    재현:
//    type Menu = { name: string; price: number };
//    function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
//      return items.map((item) => item[key]);
//    }
//    const menus: Menu[] = [{ name: "라떼", price: 4500 }];
//    void pluck(menus, "name").reduce((sum, p) => sum + p, 0);
//    쓰는 방법이 여러 가지인 함수라 "맞는 사용법이 하나도 없다" 고 나옵니다.
//    이어지는 줄에 Type 'string' is not assignable to type 'number'. 가 붙습니다.
//    그 줄까지 읽어야 이유가 나옵니다.
//    pluck(menus, "name") 은 string[] 이라 sum + p 가 글자 붙이기가 되는데,
//    시작값 0 은 숫자라 어긋난 것입니다.
//    자바스크립트였다면 "0아메리카노라떼카푸치노" 가 조용히 나왔을 것입니다.
//
// 5) 에러는 안 납니다. 출력만 한 줄로 줄어듭니다.
//    출력: name 아메리카노
//    (keyof Menu)[] 는 "전부 다 적어야 한다" 는 뜻이 아니라
//    "Menu 의 속성 이름만 넣어라" 는 뜻이기 때문입니다.
//    빠뜨린 것까지 잡고 싶으면 07단원 이후에 만나는 Record 를 씁니다.
//
// 6) const sum = pluck(menus, "name").reduce((n, s) => n + s.length, 0);
//    console.log(sum);                       // 출력: 11
//    아메리카노 5 + 라떼 2 + 카푸치노 4 = 11 입니다.
//    문제 4와 달리 s.length 로 숫자를 꺼내 더했으니 타입이 맞습니다.
//    읽기는 menus.map((m) => m.name) 쪽이 낫습니다.
//    여기서는 뽑을 속성이 "name" 하나로 정해져 있기 때문입니다.
//    pluck 은 뽑을 속성이 그때그때 달라질 때 값어치가 있습니다.
