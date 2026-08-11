// ============================================================
// 13단원 · 종합 02 정답 — 장바구니
// ------------------------------------------------------------
// 실행: node 종합02_장바구니_정답.js
// ============================================================

const products = [
  { id: 1, name: "아메리카노", price: 4000, stock: 10 },
  { id: 2, name: "카페라떼", price: 4500, stock: 3 },
  { id: 3, name: "케이크", price: 6000, stock: 0 },
  { id: 4, name: "쿠키", price: 3000, stock: 7 },
];

const cart = [
  { id: 1, count: 2 },
  { id: 4, count: 3 },
];

console.log("===== 장바구니 =====");
// 출력: ===== 장바구니 =====


// ───── 문제 1 ─────
console.log(products.filter(({ stock }) => stock > 0).map(({ name }) => name));
// 출력: [ '아메리카노', '카페라떼', '쿠키' ]
// filter 로 고르고 map 으로 이름만 뽑는 체이닝입니다.


// ───── 문제 2 ─────
function findProduct(id) {
  return products.find((product) => product.id === id);
}

console.log(findProduct(2));
// 출력: { id: 2, name: '카페라떼', price: 4500, stock: 3 }
console.log(findProduct(99));
// 출력: undefined
// find 는 못 찾으면 undefined 를 돌려줍니다. filter 였다면 빈 배열이 나옵니다.
// 결과를 바로 쓰기 전에 확인하는 습관을 들이세요. findProduct(99)?.name


// ───── 문제 3 ─────
cart.forEach(({ id, count }) => {
  const product = findProduct(id);
  console.log(`${product.name} x${count} = ${product.price * count}원`);
});
// 출력: 아메리카노 x2 = 8000원
// 출력: 쿠키 x3 = 9000원
// 장바구니에는 id 와 개수만 있고 이름·가격은 상품 목록에 있습니다.
// 이렇게 데이터를 나눠 두면 가격이 바뀌어도 한 곳만 고치면 됩니다.


// ───── 문제 4 ─────
function getCartTotal(cartItems) {
  return cartItems.reduce((acc, { id, count }) => {
    const product = findProduct(id);
    return acc + product.price * count;
  }, 0);
}

console.log(`총액 ${getCartTotal(cart)}원`);
// 출력: 총액 17000원
// reduce 안에서도 구조분해를 쓸 수 있습니다.
// 콜백에 중괄호를 썼으므로 return 을 반드시 적어야 합니다.


// ───── 문제 5 ─────
function addToCart(cartItems, id, count) {
  const exists = cartItems.find((item) => item.id === id);

  if (exists) {
    // 이미 있으면: 그 항목만 개수를 늘린 새 객체로 바꾼 새 배열
    return cartItems.map((item) => (item.id === id ? { ...item, count: item.count + count } : item));
  }

  // 없으면: 뒤에 새 항목을 붙인 새 배열
  return [...cartItems, { id, count }];
}

console.log(addToCart(cart, 2, 1));
// 출력: [ { id: 1, count: 2 }, { id: 4, count: 3 }, { id: 2, count: 1 } ]
console.log(addToCart(cart, 1, 3));
// 출력: [ { id: 1, count: 5 }, { id: 4, count: 3 } ]
console.log(cart);
// 출력: [ { id: 1, count: 2 }, { id: 4, count: 3 } ]
// 원본이 그대로입니다.
//
// push 나 item.count++ 를 쓰면 원본이 바뀝니다.
// map + 스프레드로 "그 항목만 바꾼 새 배열" 을 만드는 것이 핵심 패턴입니다.
// { id, count } 는 { id: id, count: count } 의 줄임 표현입니다.


// ───── 문제 6 ─────
function removeFromCart(cartItems, id) {
  return cartItems.filter((item) => item.id !== id);
}

console.log(removeFromCart(cart, 1));
// 출력: [ { id: 4, count: 3 } ]
// filter 는 새 배열을 돌려주므로 원본이 안 바뀝니다.
// splice 를 쓰면 원본이 바뀝니다.


// ───── 문제 7 ─────
function hasEnoughStock(cartItems) {
  return cartItems.every(({ id, count }) => {
    const product = findProduct(id);
    return product.stock >= count;
  });
}

console.log(hasEnoughStock(cart));
// 출력: true

const tooMany = addToCart(cart, 4, 7); // 쿠키 3 + 7 = 10개, 재고는 7개
console.log(hasEnoughStock(tooMany));
// 출력: false
// every 는 "전부 만족해야 true" 입니다. 하나라도 넘치면 false 입니다.
// some 을 쓰면 "하나라도 넘치는가" 를 물을 수 있습니다.


// ───── 문제 8 ─────
function getFinalPrice(total) {
  if (total >= 30000) {
    return Math.round(total * 0.9);
  }
  return total;
}

console.log(getFinalPrice(17000));
// 출력: 17000
console.log(getFinalPrice(50000));
// 출력: 45000
// 소수 오차가 생길 수 있으므로 돈 계산은 Math.round 로 마무리합니다.


// ───── 문제 9 ─────
function printReceipt(cartItems) {
  console.log("---------------");

  cartItems.forEach(({ id, count }) => {
    const product = findProduct(id);
    console.log(`${product.name} x${count} = ${product.price * count}원`);
  });

  console.log("---------------");

  const total = getCartTotal(cartItems);
  console.log(`합계 ${total}원`);
  console.log(`결제 ${getFinalPrice(total)}원`);
}

printReceipt(cart);
// 출력: ---------------
// 출력: 아메리카노 x2 = 8000원
// 출력: 쿠키 x3 = 9000원
// 출력: ---------------
// 출력: 합계 17000원
// 출력: 결제 17000원
// 작은 함수를 조립해 큰 함수를 만들었습니다.
// 각 함수를 따로 확인할 수 있어 버그를 찾기 쉽습니다.


// ───── 문제 10 ─────
function addToCartSafe(cartItems, id, count) {
  const product = findProduct(id);

  // 없는 상품이면 그대로
  if (!product) {
    console.log("그런 상품이 없습니다");
    return cartItems;
  }

  // 품절이면 그대로 (조기 반환)
  if (product.stock === 0) {
    console.log(`${product.name}은(는) 품절입니다`);
    return cartItems;
  }

  return addToCart(cartItems, id, count);
}

console.log(addToCartSafe(cart, 3, 1)); // 케이크는 재고 0
// 출력: 케이크은(는) 품절입니다
// 출력: [ { id: 1, count: 2 }, { id: 4, count: 3 } ]

// console.log 가 함수 안에서 먼저 실행되고, 돌려준 값이 밖에서 찍힙니다.
// 그래서 품절 메시지가 배열보다 먼저 나옵니다.
//
// 조기 반환을 쓰면 "안 되는 경우" 를 위에서 걸러내고
// 아래는 정상 흐름만 남아 읽기 좋아집니다.


// ============================================================
// 정리 — 이 파일에서 쓴 것들
// ============================================================
//
//   03단원  조건문, 조기 반환, 삼항 연산자
//   05단원  함수로 쪼개고 조립하기
//   06단원  배열
//   07단원  객체, 객체 배열, 데이터를 나눠 두기(상품 목록 ↔ 장바구니)
//   08단원  find, filter, map, reduce, every
//   09단원  구조분해, 스프레드로 '새 배열 / 새 객체' 만들기
//
// 이 파일에서 가장 중요한 것:
//   원본을 직접 고치지 않고 항상 새 배열·새 객체를 만들었습니다.
//     담기  → map 으로 그 항목만 바꾼 새 배열, 또는 [...cart, 새항목]
//     빼기  → filter 로 걸러낸 새 배열
//   push 나 item.count++ 를 쓰면 원본이 바뀝니다.
//   React 를 배우면 이 방식이 선택이 아니라 규칙이 됩니다.
