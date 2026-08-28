// ============================================================
// 04단원 · 개념 01 — 객체 타입 적기
// ------------------------------------------------------------
// 실행: node 개념01_객체_타입_적기.ts
// 검사: npm run typecheck
// ============================================================
//
// 02단원에서 객체는 추론이 잘 된다고 했습니다. 맞습니다.
// 그런데 값이 없는 자리에는 추론할 근거가 없습니다.
//
//     function order(o) { ... }        ← o 가 무슨 모양인지 알 수 없다
//     const data = JSON.parse(...)     ← 안에 뭐가 들었는지 알 수 없다
//
// 그런 자리에 "이런 모양일 것이다" 를 적는 법이 이 단원입니다.


// ── 섹션 1: { 이름: 종류 } 로 적는다 ──

// 객체의 타입은 객체처럼 생겼습니다. 값 자리에 종류를 쓴 것뿐입니다.
//
//     값:    { name: "라떼",  price: 4500  }
//     타입:  { name: string, price: number }

const menu: { name: string; price: number } = {
  name: "라떼",
  price: 4500,
};

console.log(menu.name, menu.price);
// 출력: 라떼 4500

// 타입 안에서는 쉼표( , ) 대신 세미콜론( ; )을 쓰는 것이 관행입니다.
// 쉼표를 써도 동작은 같습니다. 이 자료는 세미콜론으로 통일합니다.

// 함수 매개변수에 쓰면 이렇게 됩니다. 이게 진짜 쓸 자리입니다.
function printMenu(item: { name: string; price: number }) {
  console.log(item.name + " " + item.price + "원");
}

printMenu({ name: "아메리카노", price: 4000 });
// 출력: 아메리카노 4000원
printMenu(menu);
// 출력: 라떼 4500원

// 이제 매개변수 자리가 설명서 역할을 합니다.
// 이 함수를 쓰는 사람은 몸통을 안 열어 봐도 무엇을 넘겨야 하는지 압니다.

// ✏️ 직접 해보기 1 — 이름(string)과 좌석수(number)를 가진 객체 타입을 적어
//    shop 이라는 변수를 만들고 출력해 보세요.


// ── 섹션 2: 빠뜨리면 걸린다 ──

// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type '{ name: string; price: number; }'.
// const broken: { name: string; price: number } = { name: "라떼" };
//
// 실수: missing = "빠졌다", required = "반드시 있어야 하는".
//       읽는 법: "price 가 빠졌는데 그건 반드시 있어야 합니다"
//       01단원 개념03 섹션4의 단어 표에서 본 그 둘입니다.

// 함수에 넘길 때도 똑같이 TS2741 입니다.
//
// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type '{ name: string; price: number; }'.
// printMenu({ name: "라떼" });
//
// 실수: 02단원에서 "담을 때는 TS2322, 넘길 때는 TS2345" 라고 했는데,
//       '속성이 빠진 것' 만은 양쪽 다 TS2741 입니다.
//       빠진 속성 이름을 콕 집어 주는 것이 더 쓸모 있기 때문입니다.

// ── 객체를 넘길 때 나는 에러는 세 가지로 갈립니다 ──

// [갈래 1] 종류가 통째로 다르다 → TS2345
//
// 에러: TS2345 Argument of type 'string' is not assignable to parameter of type '{ name: string; price: number; }'.
// printMenu("라떼");
//
// 실수: 객체를 받기로 한 자리에 문자열을 넘겼습니다. 통째로 다른 것입니다.

// [갈래 2] 속성이 빠졌다 → TS2741 (위에서 본 것)

// [갈래 3] 속성은 다 있는데 그 속성의 종류가 다르다 → TS2322
//
// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// printMenu({ name: "라떼", price: "비쌈" });
//
// 실수: 에러가 객체 전체가 아니라 "비쌈" 자리를 콕 집어 나옵니다.
//       열 번호를 보면 정확히 그 값입니다.
//       여러 속성이 있어도 어느 것이 문제인지 바로 알 수 있습니다.

// ✏️ 직접 해보기 2 — printMenu({ price: 4000 }) 을 써 보고
//    어느 속성이 빠졌다고 하는지, 세 갈래 중 무엇인지 확인한 뒤 지우세요.


// ── 섹션 3: 없는 것을 넣어도 걸린다 ──

// 에러: TS2353 Object literal may only specify known properties, and 'size' does not exist in type '{ name: string; price: number; }'.
// const extra: { name: string; price: number } = { name: "라떼", price: 4500, size: "L" };
//
// 실수: "적어 둔 것만 쓸 수 있습니다. size 는 그 안에 없습니다" 입니다.
//       이걸 '초과 속성 검사' 라고 합니다.
//
//       왜 막을까요? 대개는 오타이기 때문입니다.
//       priceX 라고 쓰면 "price 를 안 넣었고 priceX 라는 이상한 걸 넣었다" 가 되는데,
//       초과 속성 검사가 없으면 조용히 통과해 버립니다.

// ✏️ 직접 해보기 3 — printMenu({ name: "라떼", price: 4500, isHot: true }) 를
//    써 보고 무슨 에러가 나는지 확인한 뒤 지우세요.


// ── 섹션 4: 그런데 변수를 거치면 통과한다 ★ ──

// 이건 처음 보면 반드시 놀랍니다.
const rawMenu = { name: "라떼", price: 4500, size: "L" };

// 방금 섹션 3에서 막혔던 그 모양인데, 변수에 담아서 넘기면 통과합니다.
printMenu(rawMenu);
// 출력: 라떼 4500원

const stored: { name: string; price: number } = rawMenu;
console.log(stored.name);
// 출력: 라떼

// 왜 이럴까요?
//
//     초과 속성 검사는 '그 자리에 직접 쓴 객체' 에만 적용됩니다.
//
// 직접 쓴 것은 오타일 가능성이 높지만,
// 이미 만들어져 있는 값은 "필요한 게 다 있으니 됐다" 고 봅니다.
// 남는 속성이 있어도 printMenu 는 안 쓸 뿐이니 문제가 없습니다.
//
// 이런 방식을 '구조적 타이핑' 이라고 합니다.
// 이름표가 아니라 모양만 봅니다. 필요한 것이 다 들어 있으면 통과입니다.

// 그래서 이런 것도 됩니다. 이름이 달라도 모양이 맞으니까요.
const 손님이_고른_것 = { name: "아이스티", price: 5000 };
printMenu(손님이_고른_것);
// 출력: 아이스티 5000원

// 다만 '없는 것' 은 여전히 못 만들어 냅니다.
const missing = { name: "라떼" };
//
// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type '{ name: string; price: number; }'.
// printMenu(missing);
//
// 실수: 남는 것은 봐주지만 빠진 것은 안 봐줍니다.
//       변수를 거쳤는데도 걸리는 것에 주목하세요.
//       초과 속성 검사만 느슨해질 뿐, 필수 속성 검사는 언제나 그대로입니다.

// ✏️ 직접 해보기 4 — rawMenu 에서 price 를 지우고 printMenu(rawMenu) 를 해 보세요.
//    통과할까요? 확인한 뒤 되돌리세요.


// ── 섹션 5: 배열 안의 객체 ──

// 객체 배열은 뒤에 [] 를 붙입니다. 02단원의 string[] 과 같은 규칙입니다.
const menus: { name: string; price: number }[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
];

console.log(menus.length);
// 출력: 2
console.log(menus[0].name);
// 출력: 아메리카노

// 배열 메소드도 그대로 됩니다. 콜백 매개변수는 문맥에서 알아냅니다(03단원 개념03).
const names = menus.map((m) => m.name);
console.log(names);
// 출력: [ '아메리카노', '라떼' ]

const total = menus.reduce((sum, m) => sum + m.price, 0);
console.log(total);
// 출력: 8500

// 그런데 이 표기가 슬슬 길어집니다.
//
//     { name: string; price: number }[]
//
// 이게 세 번, 네 번 나오면 고칠 때마다 전부 찾아 고쳐야 합니다.
// 그래서 이름을 붙입니다. 개념02에서 배웁니다.

// ✏️ 직접 해보기 5 — menus 에서 가격이 4200 이상인 것만 골라 출력해 보세요.


// ── 섹션 6: 키 이름을 미리 모를 때 ──

// 지금까지는 속성 이름을 전부 알고 있었습니다. name, price 처럼요.
// 그런데 이름을 미리 못 적는 경우가 있습니다. 메뉴가 늘어날 때마다 키가 늘어난다면요.

const 재고: { [메뉴이름: string]: number } = {
  아메리카노: 12,
  카페라떼: 5,
};

console.log(재고["아메리카노"]);
// 출력: 12
console.log(재고.카페라떼);
// 출력: 5

// 없던 키를 새로 넣어도 됩니다.
재고["바닐라라떼"] = 8;
console.log(재고["바닐라라떼"]);
// 출력: 8

// [메뉴이름: string]: number 는
// "키는 문자열이고, 거기 담긴 값은 전부 number 다" 라는 뜻입니다.
// 대괄호 안의 이름(메뉴이름)은 읽는 사람을 위한 것이라 아무렇게나 지어도 됩니다.
// 값의 종류는 지켜집니다.

// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// 재고["에스프레소"] = "많음";
//
// 실수: 키는 자유지만 값은 자유가 아닙니다.

// ★ 여기에 함정이 하나 있습니다.

const 없는것 = 재고["카페모카"];
console.log(없는것);
// 출력: undefined

// 없는 키를 꺼냈는데도 타입은 number 라고 나옵니다. 실제 값은 undefined 인데요.
// 04단원 개념04의 "타입은 약속이지 검사가 아니다" 가 여기서도 그대로 나옵니다.
// 08단원 개념03의 noUncheckedIndexedAccess 를 켜면 number | undefined 가 되어
// 확인하고 쓰게 강제됩니다.
//
// 그래서 키를 아는 것은 그냥 적으세요. 이 방법은 정말 모를 때만 씁니다.

// ✏️ 직접 해보기 6 — console.log(재고["카페모카"] + 1); 을 써 보세요.
//    검사는 통과하나요? 실행하면 무엇이 찍히나요?


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 타입 자리에 값을 쓰기
//   { name: "라떼" } 가 아니라 { name: string } 입니다.
//   타입 자리에는 '종류' 를 씁니다.

// [실수 2] 세미콜론과 쉼표를 헷갈리기
//   타입 안에서는 둘 다 됩니다. 값 안에서는 쉼표만 됩니다.
//   타입은 ; · 값은 , 로 통일해 두면 헷갈리지 않습니다.

// [실수 3] 초과 속성 검사를 '언제나' 적용된다고 알기
//   섹션 4를 보세요. 직접 쓴 객체에만 적용됩니다.
//   "아까는 걸렸는데 지금은 왜 안 걸리지?" 의 답이 여기 있습니다.

// [실수 4] 객체 배열을 { ... }[] 가 아니라 [{ ... }] 로 쓰기
//   [] 는 뒤에 붙입니다. 02단원의 string[] 과 같습니다.


// ── 정리 ──

// 1. 객체 타입은 { 이름: 종류; ... } 로 적는다. 값 자리에 종류를 쓴 모양이다.
// 2. 진짜 쓸 자리는 함수 매개변수다. 매개변수가 설명서 역할을 하게 된다.
// 3. 빠뜨리면 TS2741(missing), 없는 것을 넣으면 TS2353(초과 속성 검사).
// 4. 초과 속성 검사는 '그 자리에 직접 쓴 객체' 에만 적용된다.
//    변수를 거치면 남는 속성이 있어도 통과한다(구조적 타이핑).
// 5. 남는 것은 봐주지만 빠진 것은 안 봐준다.
// 6. 객체 배열은 뒤에 [] 를 붙인다. 길어지면 이름을 붙인다(개념02).


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const shop: { name: string; seats: number } = { name: "봄날카페", seats: 24 };
//    console.log(shop.name, shop.seats);        // 출력: 봄날카페 24
//
// 2) error TS2741: Property 'name' is missing in type '{ price: number; }'
//    but required in type '{ name: string; price: number; }'.
//    재현:
//    function printMenu(item: { name: string; price: number }) { console.log(item.name); }
//    printMenu({ price: 4000 });
//    [갈래 2] 입니다. name 이 빠졌다고 이름을 콕 집어 알려 줍니다.
//
// 3) error TS2353: Object literal may only specify known properties,
//    and 'isHot' does not exist in type '{ name: string; price: number; }'.
//    재현:
//    function printMenu(item: { name: string; price: number }) { console.log(item.name); }
//    printMenu({ name: "라떼", price: 4500, isHot: true });
//    직접 쓴 객체라 초과 속성 검사에 걸립니다.
//
// 4) 통과하지 않습니다.
//    error TS2741: Property 'price' is missing in type '{ name: string; size: string; }'
//    but required in type '{ name: string; price: number; }'.
//    재현:
//    function printMenu(item: { name: string; price: number }) { console.log(item.name); }
//    const rawMenu = { name: "라떼", size: "L" };
//    printMenu(rawMenu);
//    남는 것(size)은 봐주지만 빠진 것(price)은 안 봐줍니다.
//    변수를 거쳤는데도 걸립니다. 느슨해지는 것은 초과 속성 검사뿐입니다.
//
// 5) console.log(menus.filter((m) => m.price >= 4200));
//    // 출력: [ { name: '라떼', price: 4500 } ]
//
// 6) 검사는 통과합니다. 재고["카페모카"] 의 타입이 number 라고 나오기 때문입니다.
//    실행하면 NaN 이 찍힙니다. 실제로는 undefined + 1 이라서요.
//    "검사는 통과하는데 돌리면 이상하다" — 이 자료가 계속 경계하는 그 자리입니다.
