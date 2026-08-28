// ============================================================
// 09단원 · 종합 02 정답 — 재고 보고서
// ------------------------------------------------------------
// 실행: node 종합02_재고_보고서_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

const products = [
  { id: 1, name: "아메리카노", stock: 12 },
  { id: 2, name: "카페라떼", stock: 3 },
  { id: 3, name: "케이크", stock: 0 },
];

// 모양이 다른 두 번째 목록입니다. id 가 있다는 것만 같습니다.
const suppliers = [
  { id: 7, company: "봄날로스터리", phone: "010-1111-2222" },
  { id: 9, company: "여름제과", phone: "010-3333-4444" },
];

console.log("===== 재고 보고서 =====");
// 출력: ===== 재고 보고서 =====


// ───── 문제 1 ─────
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

console.log(first(products)?.name ?? "비었음");
// 출력: 아메리카노
console.log(last(products)?.name ?? "비었음");
// 출력: 케이크

const empty: string[] = [];
console.log(first(empty) ?? "비었음");
// 출력: 비었음

// 해설 ① 반환 타입에 | undefined 를 꼭 적어야 합니다. 빈 배열이면 없으니까요.
//        : T 라고만 적으면 쓰는 쪽이 확인 없이 쓰다가 실행 중에 터집니다.
// 해설 ② const empty = []; 처럼 타입 없이 쓰면 안 됩니다.
//        빈 배열로 시작할 때는 : string[] 을 적어야 합니다(02단원 개념02 섹션5).
// 해설 ③ products 를 넘기면 T 가 { id, name, stock } 으로 정해집니다.
//        그래서 ?.name 이 통과합니다. any[] 였다면 오타도 안 걸렸을 것입니다.


// ───── 문제 2 ─────
function toList(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

console.log(toList("아메리카노"));
// 출력: [ '아메리카노' ]
console.log(toList(["아메리카노", "케이크"]));
// 출력: [ '아메리카노', '케이크' ]

// 해설 ① typeof 로는 배열을 못 가립니다. typeof [] 는 "object" 입니다.
//        Array.isArray 를 씁니다(05단원 개념02 섹션3).
// 해설 ② 반환 타입 : string[] 을 적어 두면
//        실수로 문자열을 그냥 돌려주는 것을 함수 안에서 잡아 줍니다.
// 해설 ③ if / else 로 풀어 써도 정답입니다. 삼항이 짧을 뿐입니다.


// ───── 문제 3 ─────
type StockState =
  | { level: "품절" }
  | { level: "부족"; left: number }
  | { level: "충분"; left: number };

function checkStock(stock: number): StockState {
  if (stock === 0) return { level: "품절" };
  if (stock <= 5) return { level: "부족", left: stock };
  return { level: "충분", left: stock };
}

function stockText(s: StockState): string {
  switch (s.level) {
    case "품절":
      return "품절입니다";
    case "부족":
      return s.left + "개 남았습니다 (주문 필요)";
    case "충분":
      return s.left + "개 있습니다";
  }
}

console.log(stockText(checkStock(12)));
// 출력: 12개 있습니다
console.log(stockText(checkStock(3)));
// 출력: 3개 남았습니다 (주문 필요)
console.log(stockText(checkStock(0)));
// 출력: 품절입니다

// 해설 ① "품절" 에는 left 가 아예 없습니다. 그게 판별 유니온의 요점입니다.
//        품절인데 남은 개수가 있는 상태를 아예 못 만듭니다.
// 해설 ② case "품절" 안에서 s.left 를 쓰면 TS2339 로 걸립니다.
//        그 갈래에는 없는 속성이니까요. 타입이 갈래마다 다르게 좁혀집니다.
// 해설 ③ level 을 string 으로 적으면 좁히기가 통째로 안 됩니다.
//        "품절" 처럼 값을 그대로 적어야 합니다(05단원 개념04 섹션5).
//        판별 유니온에서 가장 흔하고 가장 찾기 어려운 실수입니다.


// ───── 문제 4 ─────
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

console.log(findById(products, 2)?.name ?? "없음");
// 출력: 카페라떼
console.log(findById(products, 99)?.name ?? "없음");
// 출력: 없음
console.log(findById(suppliers, 9)?.company ?? "없음");
// 출력: 여름제과

// 해설 ① extends { id: number } 가 없으면 item.id 에서 걸립니다.
//        조건 없는 T 는 '모든 타입' 이라 id 가 있는지 알 수 없기 때문입니다.
// 해설 ② extends 는 상속이 아니라 "적어도 이건 갖고 있어야 한다" 로 읽으세요.
// 해설 ③ ★ 돌려받은 값에는 넘긴 것의 모양이 그대로 붙습니다.
//        products 에서 찾으면 .name 이 되고, suppliers 에서 찾으면 .company 가 됩니다.
//        함수는 하나인데 나오는 타입이 다릅니다. 이게 제네릭을 쓰는 이유입니다.
//        findById(products, 2)?.company 는 TS2339 로 걸립니다.
//        any[] 로 만들었다면 셋 다 조용히 통과하고 실행할 때 undefined 가 나왔을 것입니다.


// ───── 문제 5 ─────
type ApiResult<T> = { ok: boolean; data: T };

const listResult: ApiResult<{ id: number; name: string; stock: number }[]> = {
  ok: true,
  data: products,
};
console.log(listResult.data.length);
// 출력: 3

const textResult: ApiResult<string> = { ok: true, data: "봄날카페" };
console.log(textResult.data.length);
// 출력: 4

// 해설 ① data 자리만 바뀌고 ok 는 그대로입니다.
//        서버 응답이 늘 같은 모양이면 이렇게 한 번 만들어 두고 씁니다.
// 해설 ② <string> 이면 .length 가 글자 수, <배열> 이면 개수입니다.
//        같은 .length 인데 담은 것에 따라 뜻이 달라지는데, 타입이 알아서 맞춰 줍니다.
// 해설 ③ 상품 타입에 이름을 붙여 두었다면 ApiResult<Product[]> 로 짧아집니다.
//        같은 모양을 두 번 이상 쓰면 이름을 붙이세요(04단원 개념02 섹션5).


// ───── 문제 6 ─────
console.log("----- 재고 보고서 -----");
// 출력: ----- 재고 보고서 -----

let needOrder = 0;
for (const p of products) {
  const state = checkStock(p.stock);
  console.log(p.name + ": " + stockText(state));
  if (state.level !== "충분") needOrder++;
}
// 출력: 아메리카노: 12개 있습니다
// 출력: 카페라떼: 3개 남았습니다 (주문 필요)
// 출력: 케이크: 품절입니다

console.log("주문 필요: " + needOrder + "건");
// 출력: 주문 필요: 2건

// 해설 ① 앞에서 만든 checkStock · stockText 를 그대로 씁니다.
//        새로 쓴 것은 세는 줄 하나뿐입니다.
// 해설 ② state.level !== "충분" 으로 셌습니다.
//        나중에 "예약중" 같은 상태가 늘어나도 이 줄은 그대로 맞습니다.
//        반대로 === "품절" || === "부족" 으로 썼다면 그때 고쳐야 합니다.
// 해설 ③ 그런데 stockText 는 상태가 늘면 TS2366 으로 걸립니다.
//        "고쳐야 할 곳만 정확히 걸리고, 안 고쳐도 되는 곳은 안 걸리는" 것이
//        판별 유니온을 쓰는 이유입니다.
