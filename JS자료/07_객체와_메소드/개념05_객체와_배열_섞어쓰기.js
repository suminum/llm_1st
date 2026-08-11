// ============================================================
// 07단원 · 개념 05 — 객체와 배열 섞어 쓰기
// ------------------------------------------------------------
// 실행: node 개념05_객체와_배열_섞어쓰기.js
// ============================================================
//
// 실무 데이터는 거의 항상 이 모양입니다.
//
//     [ {…}, {…}, {…} ]      ← 객체들이 담긴 배열
//
// 상품 목록, 회원 목록, 게시글 목록 — 전부 이렇게 생겼습니다.
// 서버에서 받아오는 데이터도 대부분 이 형태입니다.


// ── 섹션 1: 객체 배열 만들기 ──

const products = [
  { name: "아메리카노", price: 4000, stock: 10 },
  { name: "라떼", price: 4500, stock: 0 },
  { name: "케이크", price: 6000, stock: 3 },
];

console.log(products.length);
// 출력: 3

// 배열이니까 인덱스로 꺼내고, 꺼낸 것은 객체니까 점으로 접근합니다.
console.log(products[0]);
// 출력: { name: '아메리카노', price: 4000, stock: 10 }

console.log(products[0].name);
// 출력: 아메리카노
console.log(products[1].price);
// 출력: 4500

// 순서대로 읽으세요.
//     products      → 배열
//     products[1]   → 그중 두 번째, 객체
//     products[1].price → 그 객체의 price

// 값을 바꿀 수도 있습니다.
products[1].stock = 5;
console.log(products[1]);
// 출력: { name: '라떼', price: 4500, stock: 5 }

// ✏️ 직접 해보기 1 — products 의 세 번째 상품 이름을 출력해 보세요.


// ── 섹션 2: 반복하며 꺼내기 ──

for (const product of products) {
  console.log(`${product.name} ${product.price}원`);
}
// 출력: 아메리카노 4000원
// 출력: 라떼 4500원
// 출력: 케이크 6000원

// 번호가 필요하면 일반 for 문을 씁니다.
for (let i = 0; i < products.length; i++) {
  console.log(`${i + 1}. ${products[i].name}`);
}
// 출력: 1. 아메리카노
// 출력: 2. 라떼
// 출력: 3. 케이크

// ✏️ 직접 해보기 2 — 각 상품의 이름과 재고를 한 줄씩 출력해 보세요.


// ── 섹션 3: 조건으로 찾고 거르기 ──

// [하나 찾기]
let found = null;
for (const product of products) {
  if (product.name === "케이크") {
    found = product;
    break;
  }
}
console.log(found);
// 출력: { name: '케이크', price: 6000, stock: 3 }
console.log(found.price);
// 출력: 6000

// 못 찾았을 때를 대비해 null 로 시작했습니다.
// found 를 바로 쓰기 전에 확인하는 습관을 들이세요.
if (found) {
  console.log(`${found.name} 있습니다`);
}
// 출력: 케이크 있습니다

// [여러 개 거르기]
const cheap = [];
for (const product of products) {
  if (product.price <= 4500) {
    cheap.push(product);
  }
}
console.log(cheap.length);
// 출력: 2

for (const p of cheap) {
  console.log(p.name);
}
// 출력: 아메리카노
// 출력: 라떼

// 08단원에서 배울 find 와 filter 를 쓰면 각각 한 줄이 됩니다.
console.log(products.find((p) => p.name === "케이크").price);
// 출력: 6000
console.log(products.filter((p) => p.price <= 4500).length);
// 출력: 2

// ✏️ 직접 해보기 3 — 재고가 0인 상품이 있는지 찾아 이름을 출력해 보세요.
//                    (섹션 1에서 라떼 재고를 5로 바꿨으니 없을 겁니다)


// ── 섹션 4: 합계와 통계 ──

const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
  { name: "쿠키", price: 3000, count: 3 },
];

let totalPrice = 0;
let totalCount = 0;

for (const item of cart) {
  totalPrice += item.price * item.count;
  totalCount += item.count;
}

console.log(`${totalCount}개 / ${totalPrice}원`);
// 출력: 6개 / 23000원

// 영수증을 만들어 봅시다.
for (const item of cart) {
  const sub = item.price * item.count;
  console.log(`${item.name} x${item.count} = ${sub}원`);
}
// 출력: 아메리카노 x2 = 8000원
// 출력: 케이크 x1 = 6000원
// 출력: 쿠키 x3 = 9000원

console.log(`합계 ${totalPrice}원`);
// 출력: 합계 23000원

// ✏️ 직접 해보기 4 — cart 에서 가장 비싼 상품(단가 기준)의 이름을 출력해 보세요.


// ── 섹션 5: 객체 안에 배열 ──

// 반대 방향도 흔합니다.
const student = {
  name: "김민준",
  scores: [90, 85, 70],
  hobbies: ["독서", "등산"],
};

console.log(student.scores);
// 출력: [ 90, 85, 70 ]
console.log(student.scores[0]);
// 출력: 90
console.log(student.scores.length);
// 출력: 3

console.log(student.hobbies.join(", "));
// 출력: 독서, 등산

// 반복해서 합계 구하기
let scoreSum = 0;
for (const score of student.scores) {
  scoreSum += score;
}
console.log(`${student.name} 총점 ${scoreSum}점`);
// 출력: 김민준 총점 245점

// ✏️ 직접 해보기 5 — student 의 평균 점수를 소수 첫째 자리까지 출력해 보세요.


// ── 섹션 6: 깊게 중첩된 데이터 ──

// 배열 안에 객체, 그 객체 안에 또 배열이 있는 경우입니다.
const classes = [
  { name: "1반", students: ["김민준", "이서연"] },
  { name: "2반", students: ["박지훈", "최유진", "정하늘"] },
];

// 여기서부터 세 겹입니다. 먼저 모양을 그림으로 잡고 들어갑시다.
//
//   classes ─────────────────────── 배열      (1겹)
//     ├ [0] { name, students } ──── 객체      (2겹)
//     │        └ students ───────── 배열      (3겹)
//     │             ├ [0] "김민준"
//     │             └ [1] "이서연"
//     └ [1] { name, students }
//              └ students
//                   ├ [0] "박지훈"  ...
//
// 꺼내는 법도 그림 그대로 따라 내려갑니다.
//   classes[1]                 → { name: '2반', students: [...] }
//   classes[1].students        → [ '박지훈', '최유진', '정하늘' ]
//   classes[1].students[0]     → '박지훈'
//
// 그래서 아래 반복문이 두 겹인 것입니다.
// 바깥 반복문이 반(2겹)을, 안쪽 반복문이 그 반의 학생(3겹)을 돕니다.

// 반 이름과 인원 수
for (const c of classes) {
  console.log(`${c.name}: ${c.students.length}명`);
}
// 출력: 1반: 2명
// 출력: 2반: 3명

// 전체 학생 이름 (중첩 반복문)
for (const c of classes) {
  for (const s of c.students) {
    console.log(`${c.name} - ${s}`);
  }
}
// 출력: 1반 - 김민준
// 출력: 1반 - 이서연
// 출력: 2반 - 박지훈
// 출력: 2반 - 최유진
// 출력: 2반 - 정하늘

// 전체 인원
let totalStudents = 0;
for (const c of classes) {
  totalStudents += c.students.length;
}
console.log("전체:", totalStudents);
// 출력: 전체: 5

// 깊어질수록 헷갈립니다. 한 단계씩 찍어 보면서 확인하세요.
console.log(classes[1]);
// 출력: { name: '2반', students: [ '박지훈', '최유진', '정하늘' ] }
console.log(classes[1].students);
// 출력: [ '박지훈', '최유진', '정하늘' ]
console.log(classes[1].students[0]);
// 출력: 박지훈


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 배열에 점을 바로 붙이기
console.log(products.name);
// 출력: undefined
// 실수: products 는 배열입니다. 먼저 [0] 으로 객체를 꺼내야 합니다.

// [실수 2] 객체에 인덱스를 쓰기
const one = { name: "아메리카노" };
console.log(one[0]);
// 출력: undefined
// 실수: 객체는 이름으로 꺼냅니다. one.name 입니다.

// [실수 3] 못 찾았는데 바로 쓰기
let notFound = null;
for (const product of products) {
  if (product.name === "녹차라떼") {
    notFound = product;
  }
}
// console.log(notFound.price);
// 실수: TypeError: Cannot read properties of null (reading 'price')
//       찾기 전에 반드시 확인하세요.
console.log(notFound?.price ?? "해당 상품 없음");
// 출력: 해당 상품 없음

// [실수 4] 객체 배열을 복사했다고 생각하기
// [...배열] 은 배열을 복사하는 문법입니다. (09단원에서 자세히 배웁니다)
const copy = [...products]; // 배열은 새로 만들어지지만
copy[0].name = "바뀐이름"; // 안의 객체는 원본과 같은 것을 가리킵니다
console.log(products[0].name);
// 출력: 바뀐이름
// 원본까지 바뀌었습니다. 안쪽 객체까지 복사하려면 따로 처리해야 합니다.


// ── 정리 ──

// 1. [ {…}, {…} ] 객체 배열이 실무 데이터의 기본 모양이다.
// 2. 배열[인덱스].속성 순서로 꺼낸다.
// 3. for...of 로 돌면서 item.속성 을 쓴다.
// 4. 찾기 결과는 null 로 시작하고, 쓰기 전에 반드시 확인한다.
// 5. 헷갈리면 한 단계씩 console.log 로 찍어 본다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(products[2].name);        // 출력: 케이크
//
// 2) for (const p of products) {
//      console.log(`${p.name} ${p.stock}개`);
//    }
//
// 3) let soldOut = null;
//    for (const p of products) {
//      if (p.stock === 0) soldOut = p;
//    }
//    console.log(soldOut ? soldOut.name : "품절 상품 없음");
//    // 출력: 품절 상품 없음
//
// 4) let top = cart[0];
//    for (const item of cart) {
//      if (item.price > top.price) top = item;
//    }
//    console.log(top.name);                // 출력: 케이크
//
// 5) let sum = 0;
//    for (const s of student.scores) sum += s;
//    console.log((sum / student.scores.length).toFixed(1));
//    // 출력: 81.7
