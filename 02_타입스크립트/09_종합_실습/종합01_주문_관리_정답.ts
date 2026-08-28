// ============================================================
// 09단원 · 종합 01 정답 — 주문 관리
// ------------------------------------------------------------
// 실행: node 종합01_주문_관리_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

const rawMenus = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "카페라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
];

const rawOrders = [
  { menuId: 1, count: 2, memo: "얼음 적게" },
  { menuId: 3, count: 1 },
  { menuId: 99, count: 1 },
];

console.log("===== 주문 관리 =====");
// 출력: ===== 주문 관리 =====


// ───── 문제 1 ─────
type Menu = { id: number; name: string; price: number };
type Order = { menuId: number; count: number; memo?: string };

const menus: Menu[] = rawMenus;
const orders: Order[] = rawOrders;

console.log("메뉴 " + menus.length + "개 / 주문 " + orders.length + "건");
// 출력: 메뉴 3개 / 주문 3건

// 해설 ① memo 에 ? 를 붙여야 합니다. 세 주문 중 하나만 memo 가 있으니까요.
//        안 붙이면 rawOrders 를 Order[] 에 담는 순간 TS2741 로 걸립니다.
// 해설 ② rawMenus 를 그대로 담을 수 있는 이유는 모양이 맞기 때문입니다.
//        이름표가 아니라 모양만 봅니다(04단원 개념01 섹션4, 구조적 타이핑).
// 해설 ③ 흔한 실수 — rawMenus 자체에 : Menu[] 를 붙이려 하는 것.
//        그것도 되지만 문제가 "고치지 마세요" 라고 했으니 새 이름에 담습니다.


// ───── 문제 2 ─────
function findMenu(id: number): Menu | undefined {
  return menus.find((m) => m.id === id);
}

console.log(findMenu(2)?.name ?? "없는 메뉴");
// 출력: 카페라떼
console.log(findMenu(99)?.name ?? "없는 메뉴");
// 출력: 없는 메뉴

// 해설 ① find 는 못 찾으면 undefined 를 줍니다. 반환 타입에 사실대로 적어야 합니다.
//        : Menu 라고만 적으면 그 자리에서 TS2322 로 막힙니다.
//        find 가 Menu | undefined 를 주는데 Menu 에 담을 수 없기 때문입니다.
//        ★ 여기는 타입스크립트가 잡아 주는 자리입니다. 거짓말을 아예 못 적습니다.
//        반대로 종합02의 arr[0] 은 안 잡아 줍니다(그쪽 문제1 해설 ①을 보세요).
//        같은 "사실대로 적어라" 인데 한쪽만 강제되는 이유 — 05단원 개념03입니다.
// 해설 ② ?. 와 ?? 를 짝지어 쓰면 한 줄로 끝납니다(05단원 개념03).
//        if (menu !== undefined) 로 풀어 써도 정답입니다.
// 해설 ③ 흔한 실수 — findMenu(99)!.name 처럼 ! 로 넘어가는 것.
//        99번은 실제로 없으니 그 자리에서 터집니다.


// ───── 문제 3 ─────
function orderLine(order: Order): string {
  const menu = findMenu(order.menuId);
  if (menu === undefined) {
    return "알 수 없는 메뉴(" + order.menuId + "번)";
  }
  return menu.name + " x" + order.count + " = " + menu.price * order.count + "원";
}

for (const o of orders) {
  console.log(orderLine(o));
}
// 출력: 아메리카노 x2 = 8000원
// 출력: 케이크 x1 = 6000원
// 출력: 알 수 없는 메뉴(99번)

// 해설 ① 못 찾은 경우를 먼저 걸러 내고 돌려보냅니다.
//        그 아래부터는 menu 가 확실히 Menu 라 menu.name 을 그냥 씁니다.
//        05단원 개념02 섹션5의 '이른 반환' 입니다.
// 해설 ② if 로 안 감싸고 menu.name 을 쓰면 TS18048 로 걸립니다.
//        "없을 수도 있는데 그냥 쓰시려고요?" 입니다.
// 해설 ③ 반환 타입 : string 을 적어 두면 어느 갈래에서든 문자열을 돌려주는지
//        함수 안에서 확인해 줍니다.


// ───── 문제 4 ─────
for (const o of orders) {
  if (o.memo !== undefined) {
    console.log(findMenu(o.menuId)?.name + ": " + o.memo);
  }
}
// 출력: 아메리카노: 얼음 적게

// 해설 ① 이 if 는 타입이 강제하는 게 아니라 '메모 있는 주문만 찍으려고' 두는 것입니다.
//        o.memo 를 가드 없이 " : " + o.memo 로 이어도 에러가 안 납니다.
//        문자열 결합 자리에서는 undefined 도 그냥 허용되기 때문입니다.
//        ★ 타입이 안 잡아 주는 자리입니다. 빼고 돌려 보면 "undefined" 가 찍힙니다.
// 해설 ② if (o.memo) 로 써도 지금 데이터에서는 같은 결과입니다.
//        다만 메모가 "" 인 주문이 들어오면 '없는 것' 으로 취급됩니다.
//        "빈 메모" 와 "메모 없음" 을 구별해야 한다면 !== undefined 를 쓰세요
//        (05단원 개념02 섹션4).
// 해설 ③ orders.filter((o) => o.memo !== undefined) 로 걸러도 정답입니다.


// ───── 문제 5 ─────
type Status = "대기" | "조리중" | "완료";

function statusText(status: Status): string {
  switch (status) {
    case "대기":
      return "곧 시작합니다";
    case "조리중":
      return "만들고 있어요";
    case "완료":
      return "나왔습니다";
  }
}

console.log(statusText("대기"));
// 출력: 곧 시작합니다
console.log(statusText("완료"));
// 출력: 나왔습니다

// 해설 ① 세 경우를 다 적었으니 "return 이 없는 길" 이 없습니다.
//        하나라도 빠뜨리면 TS2366 으로 걸립니다. 그게 반환 타입을 적는 이유입니다.
// 해설 ② statusText("취소") 는 TS2345 로 막힙니다. 오타도 이걸로 잡힙니다.
// 해설 ③ 나중에 Status 에 "취소" 를 추가하면 이 함수가 그 자리에서 걸립니다.
//        고쳐야 할 곳을 타입이 찾아 주는 것 — 리터럴 유니온의 가장 큰 이득입니다.


// ───── 문제 6 ─────
function total(list: Order[], discount: number = 0): number {
  let sum = 0;
  for (const o of list) {
    const menu = findMenu(o.menuId);
    if (menu === undefined) continue;
    sum += menu.price * o.count;
  }
  return Math.round(sum * (1 - discount));
}

console.log(total(orders));
// 출력: 14000
console.log(total(orders, 0.1));
// 출력: 12600

// 해설 ① 8000 + 6000 = 14000. 99번은 못 찾으니 0원으로 건너뜁니다.
// 해설 ② 할인율에 기본값 0 을 주면 discount 의 타입이 number 그대로입니다.
//        ? 를 붙였다면 number | undefined 가 되어 곱하기 전에 확인해야 했습니다.
//        쓸 만한 기본값이 있으면 ? 보다 기본값입니다(03단원 개념02 섹션3).
// 해설 ③ Math.round 를 쓴 이유 — 할인율에 따라 소수가 나올 수 있어서입니다.
//        14000 * 0.9 는 마침 정수지만, 0.07 같은 값이면 소수가 됩니다.


// ───── 문제 7 ─────
console.log("----- 영수증 -----");
// 출력: ----- 영수증 -----
for (const o of orders) {
  console.log(orderLine(o));
}
// 출력: 아메리카노 x2 = 8000원
// 출력: 케이크 x1 = 6000원
// 출력: 알 수 없는 메뉴(99번)
console.log("합계: " + total(orders) + "원");
// 출력: 합계: 14000원
console.log(statusText("조리중"));
// 출력: 만들고 있어요

// 해설 ① 앞에서 만든 orderLine · total · statusText 를 그대로 가져다 씁니다.
//        새로 쓴 코드가 거의 없습니다. 그게 함수로 쪼개 둔 이유입니다.
// 해설 ② 타입을 적어 둔 덕분에 이 조립이 안전합니다.
//        total 에 문자열을 넘기거나 statusText 에 "취소" 를 넘기면 그 자리에서 걸립니다.
// 해설 ③ 이 실습에서 any · ! · as 를 한 번도 안 썼습니다.
//        "없을 수도 있는 값" 은 전부 ?. · ?? · if 로 처리했습니다.
//        실무에서도 이 정도면 충분합니다.
