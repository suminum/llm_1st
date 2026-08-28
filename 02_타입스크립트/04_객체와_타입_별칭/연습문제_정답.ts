// ============================================================
// 04단원 연습문제 정답 — 객체와 타입 별칭
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

console.log("=== 04단원 연습문제 ===");
// 출력: === 04단원 연습문제 ===


// ───── 문제 1 ─────
{
  function printShop(shop: { name: string; seats: number }) {
    console.log(shop.name + " " + shop.seats + "석");
  }
  printShop({ name: "봄날카페", seats: 24 });
  // 출력: 봄날카페 24석
}
// 해설 ① 안 적으면 TS7006 입니다. 매개변수는 예외 없이 적습니다(03단원).
// 해설 ② 타입 안에서는 세미콜론( ; ), 값 안에서는 쉼표( , )로 통일하면 안 헷갈립니다.
// 해설 ③ 이제 매개변수 자리가 설명서입니다. 이 함수를 쓰는 사람은
//        몸통을 안 열어 봐도 무엇을 넘겨야 하는지 압니다.


// ───── 문제 2 ─────
{
  type Shop = { name: string; seats: number };
  const shop: Shop = { name: "별빛카페", seats: 12 };
  console.log(shop.name, shop.seats);
  // 출력: 별빛카페 12
}
// 해설 ① 타입 이름은 대문자로 시작합니다. 변수(소문자)와 한눈에 구별됩니다.
// 해설 ② type 뒤에는 = 가 있습니다. interface 에는 없습니다. 짝지어 외우세요.
// 해설 ③ 이름을 붙이면 에러 메시지에도 그 이름이 나옵니다.
//        긴 모양이 통째로 찍히는 것보다 훨씬 읽기 쉽습니다.


// ───── 문제 3 ─────
{
  type Menu = { name: string; price: number };
  const menus: Menu[] = [
    { name: "아메리카노", price: 4000 },
    { name: "라떼", price: 4500 },
  ];
  console.log(menus.map((m) => m.name));
  // 출력: [ '아메리카노', '라떼' ]
}
// 해설 ① 객체 배열은 Menu[] 입니다. [] 는 뒤에 붙습니다.
// 해설 ② m 에 타입을 안 적어도 됩니다. menus 가 Menu[] 라 문맥에서 알아냅니다.
// 해설 ③ 사실 이 문제는 타입을 안 적어도 돌아갑니다(추론이 되니까요).
//        적는 연습을 위한 문제이지만, 실무에서도 적어 둡니다.
//        나중에 빈 배열로 시작하거나 서버에서 받아올 때 근거가 없어지기 때문입니다.


// ───── 문제 4 ─────
{
  type Order = { menu: string; memo?: string };
  const o: Order = { menu: "라떼" };
  console.log(o.menu, o.memo);
  // 출력: 라떼 undefined
}
// 해설 ① ? 를 붙이면 빼도 됩니다. 안 붙이면 TS2741(missing)이 납니다.
// 해설 ② 빼면 undefined 입니다. null 이 아닙니다.
// 해설 ③ 대가로 memo 의 타입이 string | undefined 가 됩니다.
//        o.memo.length 를 쓰면 TS18048 로 걸립니다. 문제 11이 그 이야기입니다.


// ───── 문제 5 ─────
{
  type Receipt = { readonly id: number; menu: string };
  const r: Receipt = { id: 1001, menu: "라떼" };
  r.menu = "아메리카노";
  console.log(r.id, r.menu);
  // 출력: 1001 아메리카노
}
// 해설 ① readonly 를 붙이면 r.id = 2002; 가
//        TS2540 Cannot assign to 'id' because it is a read-only property. 로 걸립니다.
// 해설 ② menu 는 readonly 가 아니니 바꿔도 됩니다. 속성마다 따로 붙입니다.
// 해설 ③ const 와 헷갈리지 마세요.
//        const r 은 r 자체를 다른 객체로 바꾸는 것을 막고,
//        readonly id 는 객체 안의 id 를 바꾸는 것을 막습니다.
//        JS자료 06단원에서 "const 객체도 속성은 바뀐다" 던 그 구멍을 막는 것입니다.


// ───── 문제 6 ─────
{
  type Calc = (a: number, b: number) => number;
  const add: Calc = (a, b) => a + b;
  console.log(add(10, 20));
  // 출력: 30
}
// 해설 ① 함수 타입은 (매개변수) => 반환값 입니다. 콜론이 아니라 화살표입니다.
// 해설 ② (a, b) 에 타입을 안 적은 것에 주목하세요.
//        왼쪽에 : Calc 라고 적어 두었으니 문맥에서 알아냅니다.
// 해설 ③ 같은 함수 타입을 두 번 이상 쓰게 되면 이렇게 이름을 붙입니다.
//        03단원 개념03 섹션4에서 예고한 것입니다.


// ───── 문제 7 ─────
{
  type Menu = { name: string; price: number };
  const parsed: Menu = JSON.parse('{"name":"라떼","price":4500}');
  console.log(parsed.name, parsed.price);
  // 출력: 라떼 4500
}
// 해설 ① 안 적으면 any 입니다. parsed.아무거나 를 써도 안 걸립니다.
// 해설 ② : Menu 한 줄로 자동완성과 검사가 살아납니다. 비용 대비 효과가 가장 큰 한 줄입니다.
// 해설 ③ 다만 이것은 '주장' 이지 '확인' 이 아닙니다.
//        실제 응답에 price 가 없어도 조용히 통과합니다. 문제 13·15가 그 이야기입니다.


// ───── 문제 8 ─────
{
  type Menu = { name: string; price: number };
  const text = '[{"name":"아메리카노","price":4000},{"name":"라떼","price":4500}]';
  const list: Menu[] = JSON.parse(text);
  console.log(list.reduce((sum, m) => sum + m.price, 0));
  // 출력: 8500
}
// 해설 ① 목록이면 뒤에 [] 를 붙입니다. Menu 라고만 적으면
//        list.reduce 가 TS2339 로 걸립니다.
// 해설 ② reduce 의 두 번째 인자 0 을 빼면 안 됩니다.
//        빈 배열일 때 터지고, 타입도 이상해집니다.
// 해설 ③ for (const m of list) 로 더해도 정답입니다.


// ───── 문제 9 ─────
{
  console.log("TS2345");
  // 출력: TS2345
  console.log("TS2741");
  // 출력: TS2741
  console.log("TS2322");
  // 출력: TS2322
}
// 해설 ① 객체를 넘길 때 나는 에러는 세 갈래입니다.
//        종류가 통째로 다름 → TS2345
//        속성이 빠짐       → TS2741
//        속성 종류가 다름  → TS2322
// 해설 ② 02단원의 "담을 때 TS2322, 넘길 때 TS2345" 규칙에서
//        '속성이 빠진 것' 만 예외입니다. 양쪽 다 TS2741 입니다.
//        빠진 속성 이름을 콕 집어 주는 쪽이 쓸모 있기 때문입니다.
// 해설 ③ TS2322 는 객체 전체가 아니라 "비쌈" 자리를 가리킵니다.
//        열 번호를 보면 정확히 그 값입니다.


// ───── 문제 10 ─────
{
  console.log(1);
  // 출력: 1
}
// 해설 ① 초과 속성 검사는 '그 자리에 직접 쓴 객체' 에만 적용됩니다.
// 해설 ② 2번처럼 변수를 거치면 통과합니다.
//        직접 쓴 것은 오타일 가능성이 높지만,
//        이미 만들어져 있는 값은 "필요한 게 다 있으니 됐다" 고 보기 때문입니다.
//        이런 방식을 구조적 타이핑이라고 합니다. 이름표가 아니라 모양만 봅니다.
// 해설 ③ 단, 느슨해지는 것은 초과 속성 검사뿐입니다.
//        속성이 '빠진' 것은 변수를 거쳐도 TS2741 로 걸립니다.


// ───── 문제 11 ─────
{
  type Order = { menu: string; memo?: string };
  function showMemo(o: Order) {
    if (o.memo) {
      console.log(o.memo + " (" + o.memo.length + "글자)");
    } else {
      console.log("(메모 없음)");
    }
  }
  showMemo({ menu: "라떼", memo: "얼음 적게" });
  // 출력: 얼음 적게 (5글자)
  showMemo({ menu: "라떼" });
  // 출력: (메모 없음)
}
// 해설 ① 고치기 전에는 TS18048 'o.memo' is possibly 'undefined'. 가 납니다.
// 해설 ② if (o.memo) 안쪽에서는 o.memo 가 확실히 문자열입니다.
//        한 번 확인하면 그 안에서는 몇 번을 써도 됩니다.
// 해설 ③ 흔한 실수 — o.memo!.length 처럼 느낌표로 넘어가는 것.
//        "내가 책임진다" 는 뜻이라 any 만큼 위험합니다.
//        메모 없는 주문이 들어오는 순간 실행 중에 터집니다.


// ───── 문제 12 ─────
{
  type Shop = { name: string; seats: number };
  type Menu = { name: string; price: number };
  type Store = { shop: Shop; menus: Menu[] };

  const store: Store = {
    shop: { name: "봄날카페", seats: 24 },
    menus: [
      { name: "아메리카노", price: 4000 },
      { name: "라떼", price: 4500 },
    ],
  };
  console.log(store.menus[1].price);
  // 출력: 4500
}
// 해설 ① 만든 타입을 다른 타입 안에서 그대로 쓸 수 있습니다.
// 해설 ② store.menus[1]. 까지 치면 name / price 가 자동완성으로 뜹니다.
//        중첩이 깊어져도 끝까지 따라옵니다.
// 해설 ③ 안쪽이 틀리면 안쪽을 콕 집어 줍니다.
//        price: "4500원" 이라고 쓰면 Store 전체가 아니라 그 값을 가리킵니다.


// ───── 문제 13 ─────
{
  console.log(undefined);
  // 출력: undefined
}
// 해설 ① 검사는 통과합니다. JSON.parse 는 any 를 주고, any 는 어디에나 들어갑니다.
// 해설 ② : Menu 라고 적는 것은 "이런 모양일 것이다" 라는 내 주장입니다.
//        타입스크립트는 그 주장을 검사하지 않고 믿습니다.
//        node 는 타입 표기를 지우고 실행하니, 확인해 주는 코드가 어디에도 없습니다.
// 해설 ③ 정리하면 —
//        내가 쓴 코드끼리 안 맞는 것 → 잡아 준다
//        밖에서 들어온 값이 다른 것  → 못 잡는다
//        그래서 밖에서 온 값은 쓰기 전에 확인해야 합니다(05단원).


// ───── 문제 14 ─────
{
  type Menu = { name: string; price: number; stock?: number };
  const text =
    '[{"name":"아메리카노","price":4000,"stock":3},' +
    '{"name":"아이스티","price":5000,"stock":0},' +
    '{"name":"라떼","price":4500,"stock":1},' +
    '{"name":"품절메뉴","price":9000}]';

  const menus: Menu[] = JSON.parse(text);
  const inStock = menus.filter((m) => m.stock !== undefined && m.stock > 0);
  const sum = inStock.reduce((acc, m) => acc + m.price, 0);
  console.log("재고 있는 메뉴 합계: " + sum + "원");
  // 출력: 재고 있는 메뉴 합계: 8500원
}
// 해설 ① 4000(아메리카노) + 4500(라떼) = 8500 입니다.
//        아이스티는 stock 이 0 이라 빠지고, 품절메뉴는 stock 이 아예 없어 빠집니다.
// 해설 ② m.stock > 0 만 쓰면 TS18048 로 걸립니다. stock 이 선택 속성이라
//        undefined 일 수 있기 때문입니다. 먼저 확인해야 합니다.
//        m.stock != null && m.stock > 0 으로 써도 되고,
//        05단원을 배우면 더 깔끔한 방법이 나옵니다.
// 해설 ③ 흔한 실수 — filter((m) => m.stock) 로 끝내는 것.
//        이러면 stock 이 0 인 아이스티도 falsy 라 빠지긴 하지만,
//        "0 은 있는 값인데 없는 것처럼 취급" 하는 것이라 의도가 흐려집니다.
//        JS자료 01단원의 falsy 목록에 0 이 있던 것을 떠올리세요.


// ───── 문제 15 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   ① npm run check
//      조용합니다. 안 걸립니다.
//
//   ② node 연습문제.ts
//      TypeError: Cannot read properties of undefined (reading 'toFixed')
//      → 여기서 프로그램이 멈춥니다.
//
// 해설 ① 02단원 개념03의 any 와 똑같은 구조입니다.
//        "검사는 통과하는데 돌리면 터진다" 입니다.
// 해설 ② 다른 점은, 이번엔 any 를 쓴 적이 없다는 것입니다.
//        모양을 성실하게 적었는데도 이렇게 됩니다.
//        적은 모양이 사실인지는 아무도 확인해 주지 않기 때문입니다.
// 해설 ③ 그래서 서버·파일·사용자 입력처럼 '밖에서 온 값' 은
//        쓰기 전에 확인하는 것이 원칙입니다.
//        확인하는 문법이 05단원의 주제입니다.
