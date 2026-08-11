// ============================================================
// 08단원 · 개념 04 — filter 와 find: 골라내기
// ------------------------------------------------------------
// 실행: node 개념04_filter와_find.js
// ============================================================
//
// map 은 개수를 그대로 두고 모양만 바꿨습니다.
// 이번에는 조건에 맞는 것만 골라냅니다.
//
//     filter  조건에 맞는 것을 '전부' 모아 새 배열로
//     find    조건에 맞는 '첫 번째 하나'만
//
// 콜백이 true 를 돌려주면 통과, false 면 탈락입니다.


// ── 섹션 1: filter — 조건에 맞는 것 전부 ──

const scores = [90, 55, 78, 40, 88];

const passed = scores.filter((score) => score >= 60);
console.log(passed);
// 출력: [ 90, 78, 88 ]

// 원본은 그대로입니다.
console.log(scores);
// 출력: [ 90, 55, 78, 40, 88 ]

// 06단원에서 반복문으로 쓰던 코드와 비교해 보세요.
const passed2 = [];
for (const score of scores) {
  if (score >= 60) {
    passed2.push(score);
  }
}
console.log(passed2);
// 출력: [ 90, 78, 88 ]

// filter 가 이 다섯 줄을 한 줄로 만들어 준 것입니다.

// 하나도 안 맞으면 빈 배열이 나옵니다. null 이 아닙니다.
console.log(scores.filter((score) => score > 100));
// 출력: []
console.log(scores.filter((score) => score > 100).length);
// 출력: 0

// 개수만 필요하면 .length 를 붙입니다.
console.log(`합격자 ${scores.filter((s) => s >= 60).length}명`);
// 출력: 합격자 3명

// ✏️ 직접 해보기 1 — [12, 7, 30, 5] 에서 10 이상인 값만 골라 보세요.


// ── 섹션 2: filter 는 true/false 만 본다 ──

// 콜백이 돌려주는 값이 true 면 남고 false 면 빠집니다.
const words = ["사과", "", "바나나", "", "포도"];

// 빈 문자열 걸러내기 — 빈 문자열은 falsy 입니다 (01단원)
console.log(words.filter((w) => w !== ""));
// 출력: [ '사과', '바나나', '포도' ]

// 값 자체를 돌려줘도 됩니다. falsy 면 자동으로 걸러집니다.
console.log(words.filter((w) => w));
// 출력: [ '사과', '바나나', '포도' ]

// 숫자 배열에서 0 과 NaN 을 한 번에 걸러내는 데도 쓰입니다.
const mixed = [1, 0, 2, NaN, 3];
console.log(mixed.filter((n) => n));
// 출력: [ 1, 2, 3 ]

// [주의] filter 는 값을 바꾸지 않습니다. 걸러내기만 합니다.
console.log(scores.filter((s) => s * 2));
// 출력: [ 90, 55, 78, 40, 88 ]
// s * 2 는 전부 0이 아니라 truthy 라서 모두 통과했습니다.
// 값을 바꾸려면 map 입니다.

// ✏️ 직접 해보기 2 — ["a", "", "b", ""] 에서 빈 문자열을 걸러 보세요.


// ── 섹션 3: 객체 배열에서 filter ──

const products = [
  { name: "아메리카노", price: 4000, stock: 10 },
  { name: "라떼", price: 4500, stock: 0 },
  { name: "케이크", price: 6000, stock: 3 },
  { name: "쿠키", price: 3000, stock: 0 },
];

// 재고가 있는 것만
const available = products.filter((p) => p.stock > 0);
console.log(available.length);
// 출력: 2

available.forEach((p) => console.log(p.name));
// 출력: 아메리카노
// 출력: 케이크

// 품절인 것만
console.log(products.filter((p) => p.stock === 0).map((p) => p.name));
// 출력: [ '라떼', '쿠키' ]
// filter 로 고르고 map 으로 이름만 뽑았습니다. 이렇게 이어 쓰는 것을 체이닝이라고 합니다.

// 조건 두 개
console.log(products.filter((p) => p.stock > 0 && p.price <= 5000).map((p) => p.name));
// 출력: [ '아메리카노' ]

// ✏️ 직접 해보기 3 — products 에서 5000원 이상인 상품 이름만 뽑아 보세요.


// ── 섹션 4: find — 첫 번째 하나만 ──

// filter 는 배열을 돌려주지만, find 는 값 하나를 돌려줍니다.
const firstPass = scores.find((score) => score >= 60);
console.log(firstPass);
// 출력: 90

// filter 와 비교
console.log(scores.filter((score) => score >= 60));
// 출력: [ 90, 78, 88 ]
console.log(scores.find((score) => score >= 60));
// 출력: 90

// 못 찾으면 undefined 입니다. 빈 배열이 아닙니다.
console.log(scores.find((score) => score > 100));
// 출력: undefined

// 객체 배열에서 하나 찾을 때 가장 많이 씁니다.
const cake = products.find((p) => p.name === "케이크");
console.log(cake);
// 출력: { name: '케이크', price: 6000, stock: 3 }
console.log(cake.price);
// 출력: 6000

// 없는 것을 찾으면 undefined 이므로 바로 쓰면 에러가 납니다.
const notFound = products.find((p) => p.name === "녹차");
console.log(notFound);
// 출력: undefined
// console.log(notFound.price);
// 실수: TypeError: Cannot read properties of undefined (reading 'price')

// 안전하게 쓰려면 ?. 를 붙입니다. (07단원 개념01)
console.log(notFound?.price ?? "해당 상품 없음");
// 출력: 해당 상품 없음

// ✏️ 직접 해보기 4 — products 에서 이름이 "쿠키" 인 상품의 가격을 출력해 보세요.


// ── 섹션 5: findIndex — 몇 번째인지 ──

console.log(products.findIndex((p) => p.name === "케이크"));
// 출력: 2

// 없으면 -1 입니다. (06단원 indexOf 와 같습니다)
console.log(products.findIndex((p) => p.name === "녹차"));
// 출력: -1

// indexOf 와의 차이:
//     indexOf(값)      정확히 같은 값을 찾는다
//     findIndex(조건)  조건에 맞는 것을 찾는다
// 객체 배열에서는 indexOf 가 거의 쓸모없습니다. 객체는 === 로 비교되니까요.

// 찾아서 지우기
const list = products.slice(); // 원본을 지키려고 복사 (06단원 개념03)
const idx = list.findIndex((p) => p.name === "라떼");
if (idx !== -1) {
  list.splice(idx, 1);
}
console.log(list.map((p) => p.name));
// 출력: [ '아메리카노', '케이크', '쿠키' ]

// ✏️ 직접 해보기 5 — products 에서 재고가 0인 첫 상품의 위치를 출력해 보세요.


// ── 섹션 6: some 과 every — 있나? 전부인가? ──

// some : 하나라도 조건에 맞으면 true
console.log(products.some((p) => p.stock === 0));
// 출력: true
// "품절인 게 하나라도 있나?"

// every : 전부 조건에 맞아야 true
console.log(products.every((p) => p.stock === 0));
// 출력: false
// "전부 품절인가?"

console.log(products.every((p) => p.price >= 3000));
// 출력: true
// "전부 3000원 이상인가?"

// filter 로도 할 수 있지만 some / every 가 뜻이 더 분명합니다.
console.log(products.filter((p) => p.stock === 0).length > 0);
// 출력: true
// some 이 더 읽기 좋습니다. 게다가 조건에 맞는 걸 찾는 순간 멈추므로 빠릅니다.

// 조건문에 그대로 씁니다.
if (products.some((p) => p.stock === 0)) {
  console.log("품절 상품이 있습니다");
}
// 출력: 품절 상품이 있습니다

// ✏️ 직접 해보기 6 — scores 에 90점 이상이 하나라도 있는지 확인해 보세요.


// ── 섹션 7: 무엇을 쓸까 ──

// 조건에 맞는 것 전부, 배열로     → filter
// 조건에 맞는 첫 개, 값 하나      → find
// 조건에 맞는 첫 개의 위치        → findIndex
// 하나라도 있는지 (true/false)    → some
// 전부 그런지 (true/false)        → every
// 모양을 바꾸기                   → map
// 그냥 하나씩 처리                → forEach
//
// "무엇이 나오는가" 를 기준으로 고르면 헷갈리지 않습니다.
//     filter → 배열      find → 값 하나
//     some/every → 불리언  map → 배열(같은 개수)


// ── 섹션 8: 자주 하는 실수 ──

// [실수 1] filter 결과를 값 하나로 착각
const one = products.filter((p) => p.name === "케이크");
console.log(one);
// 출력: [ { name: '케이크', price: 6000, stock: 3 } ]
// console.log(one.price);   → undefined 가 나옵니다.
// 배열이라서 one[0].price 라고 써야 값이 나옵니다.
console.log(one[0].price);
// 출력: 6000
// 하나만 찾을 거면 처음부터 find 를 쓰세요.

// [실수 2] find 결과를 확인 없이 사용 (섹션 4에서 봤습니다)

// [실수 3] 조건식 대신 '계산 결과' 를 돌려줌
console.log(scores.filter((s) => s + 1));
// 출력: [ 90, 55, 78, 40, 88 ]
// 실수: s + 1 은 전부 0이 아닌 숫자라 truthy 입니다. 그래서 하나도 안 걸러집니다.
//       filter 는 "이 값을 남길까?" 를 묻는 것이지 "이 값을 어떻게 바꿀까?" 가 아닙니다.
//       값을 바꾸려면 map 을 쓰세요.
//       (섹션 2의 filter((w) => w) 는 "이 값이 truthy 인가?" 를 묻는 것이라 다릅니다)

// [실수 4] 중괄호를 쓰고 return 을 빠뜨림
console.log(
  scores.filter((s) => {
    s >= 60;
  })
);
// 출력: []
// 실수: 아무것도 안 돌려주니 전부 undefined(falsy)로 취급되어 다 걸러집니다.


// ── 정리 ──

// 1. filter(조건) — 맞는 것 전부를 새 배열로. 없으면 빈 배열.
// 2. find(조건)   — 맞는 첫 개 하나. 없으면 undefined.
// 3. findIndex(조건) — 위치. 없으면 -1.
// 4. some / every  — 하나라도 / 전부. 결과는 true·false.
// 5. 콜백이 돌려준 값이 truthy 면 남고 falsy 면 빠진다. 값을 '바꾸는' 게 아니다.
// 6. filter → map 처럼 이어 쓰는 것을 체이닝이라고 한다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log([12, 7, 30, 5].filter((n) => n >= 10));
//    // 출력: [ 12, 30 ]
//
// 2) console.log(["a", "", "b", ""].filter((w) => w !== ""));
//    // 출력: [ 'a', 'b' ]
//
// 3) console.log(products.filter((p) => p.price >= 5000).map((p) => p.name));
//    // 출력: [ '케이크' ]
//
// 4) console.log(products.find((p) => p.name === "쿠키").price);
//    // 출력: 3000
//    // 안전하게: products.find((p) => p.name === "쿠키")?.price
//
// 5) console.log(products.findIndex((p) => p.stock === 0));
//    // 출력: 1
//
// 6) console.log(scores.some((s) => s >= 90));
//    // 출력: true
