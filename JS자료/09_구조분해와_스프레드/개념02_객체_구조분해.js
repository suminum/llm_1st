// ============================================================
// 09단원 · 개념 02 — 객체 구조분해
// ------------------------------------------------------------
// 실행: node 개념02_객체_구조분해.js
// ============================================================
//
// 배열 구조분해는 '위치'로 꺼냈습니다.
// 객체 구조분해는 '이름'으로 꺼냅니다. 그래서 순서가 상관없습니다.
//
//     const { name, age } = user;
//
// 실무에서 배열 구조분해보다 훨씬 많이 씁니다. React 를 배우면 매 줄 나옵니다.
// (React 는 이 자료를 마친 뒤에 배울, 화면 만들기를 훨씬 편하게 해 주는 도구입니다)

// ── 섹션 1: 이름으로 꺼내기 ──

const user = {
  name: "김민준",
  age: 20,
  city: "부산",
};
for (key in user) {
  console.log(key);
}

// [지금까지 하던 방법]
const name1 = user.name;
const age1 = user.age;
console.log(name1, age1);
// 출력: 김민준 20

// [구조분해]
const { name, age } = user;
console.log(name, age);
// 출력: 김민준 20

// 왼쪽 중괄호 안의 이름은 '속성 이름'과 같아야 합니다.
// 순서는 상관없습니다.
const { city, name: name2 } = user;
console.log(city, name2);
// 출력: 부산 김민준

// 없는 속성을 꺼내면 undefined 입니다.
const { email } = user;
console.log(email);
// 출력: undefined

// ✏️ 직접 해보기 1 — { title: "입문서", price: 25000 } 에서
//                    title 과 price 를 구조분해로 꺼내 보세요.

// ── 섹션 2: 다른 이름으로 받기 ──

// 콜론을 쓰면 다른 이름으로 담을 수 있습니다.
const { name: userName, age: userAge } = user;
console.log(userName, userAge);
// 출력: 김민준 20

// 읽는 법: "name 속성을 꺼내서 userName 이라는 변수에 담아라"
//
//     const { name : userName } = user;
//              ^^^^   ^^^^^^^^
//            속성 이름   내가 쓸 변수 이름
//
// 순서를 헷갈리기 쉽습니다. 왼쪽이 원래 이름, 오른쪽이 새 이름입니다.

// 이미 같은 이름의 변수가 있을 때 유용합니다.
const product = { name: "이어폰", price: 89000 };
const { name: productName } = product;
console.log(userName, productName);
// 출력: 김민준 이어폰
// name 이라는 이름을 이미 위에서 썼기 때문에 다른 이름이 필요했습니다.

// ✏️ 직접 해보기 2 — product 의 price 를 productPrice 라는 이름으로 꺼내 보세요.

// ── 섹션 3: 기본값 ──

const config = { theme: "dark" };

const { theme, fontSize = 14 } = config;
console.log(theme, fontSize);
// 출력: dark 14
// fontSize 가 없어서 기본값 14가 쓰였습니다.

// 값이 있으면 기본값은 무시됩니다.
const config2 = { theme: "light", fontSize: 20 };
const { fontSize: size2 = 14 } = config2;
console.log(size2);
// 출력: 20

// 이름 바꾸기와 기본값을 함께 쓸 수도 있습니다.
const { language: lang = "ko" } = config;
console.log(lang);
// 출력: ko

// [주의] undefined 일 때만 기본값이 쓰입니다.
const { theme: t = "기본테마" } = { theme: null };
console.log(t);
// 출력: null

// ✏️ 직접 해보기 3 — 빈 객체에서 count 를 기본값 0 으로 꺼내 보세요.

// ── 섹션 4: 나머지 모으기 ──

const fullUser = {
  id: 1,
  name: "이서연",
  age: 22,
  city: "서울",
};

const { id, ...profile } = fullUser;
console.log(id);
// 출력: 1
console.log(profile);
// 출력: { name: '이서연', age: 22, city: '서울' }

// "id 만 빼고 나머지" 를 만들 때 씁니다.
// 원본은 그대로입니다.
console.log(fullUser);
// 출력: { id: 1, name: '이서연', age: 22, city: '서울' }

// 비밀번호처럼 빼고 넘겨야 할 값이 있을 때 자주 씁니다.
const account = { userId: "abc", password: "1234", nickname: "서연" };
const { password, ...safeAccount } = account;
console.log(safeAccount);
// 출력: { userId: 'abc', nickname: '서연' }

// ✏️ 직접 해보기 4 — account 에서 userId 만 빼고 나머지를 모아 보세요.

// ── 섹션 5: 함수 매개변수에서 쓰기 ──

// 이게 객체 구조분해의 진짜 쓸모입니다.

// [구조분해 없이] 매번 user. 을 붙여야 합니다
function introduce1(user) {
  console.log(`${user.name} / ${user.age}세 / ${user.city}`);
}
introduce1(user);
// 출력: 김민준 / 20세 / 부산

// [매개변수에서 바로 구조분해]
function introduce2({ name, age, city }) {
  console.log(`${name} / ${age}세 / ${city}`);
}
introduce2(user);
// 출력: 김민준 / 20세 / 부산

// 함수 안이 깔끔해지고, 매개변수만 봐도 "이 함수가 무엇을 쓰는지" 보입니다.

// 화살표 함수에서도 똑같습니다.
const introduce3 = ({ name, city }) => console.log(`${name}은 ${city} 거주`);
introduce3(user);
// 출력: 김민준은 부산 거주

// 기본값도 쓸 수 있습니다.
function createUser({ name, role = "일반회원" }) {
  console.log(`${name} (${role})`);
}
createUser({ name: "박지훈" });
// 출력: 박지훈 (일반회원)
createUser({ name: "최유진", role: "관리자" });
// 출력: 최유진 (관리자)

// 05단원에서 "매개변수가 세 개를 넘어가면 순서를 외우기 어렵다" 고 했습니다.
// 객체로 묶어 넘기면 순서를 몰라도 되고, 이름이 보여서 읽기도 좋습니다.
function order1(menu, size, ice, count) {
  console.log(menu, size, ice, count);
}
order1("라떼", "L", true, 2);
// 출력: 라떼 L true 2
// 부르는 쪽만 봐서는 true 가 뭔지 알 수 없습니다.

function order2({ menu, size, ice, count }) {
  console.log(menu, size, ice, count);
}
order2({ menu: "라떼", size: "L", ice: true, count: 2 });
// 출력: 라떼 L true 2
// 이쪽은 부르는 쪽만 봐도 무슨 값인지 다 보입니다.

// ✏️ 직접 해보기 5 — { name, price } 를 받아 "이름 가격원" 을 출력하는
//                    함수를 매개변수 구조분해로 만들어 보세요.

// ── 섹션 6: 배열 메소드 콜백에서 쓰기 ──

const products = [
  { name: "아메리카노", price: 4000 },
  { name: "케이크", price: 6000 },
];

// [구조분해 없이]
products.forEach((p) => console.log(`${p.name} ${p.price}원`));
// 출력: 아메리카노 4000원
// 출력: 케이크 6000원

// [구조분해]
products.forEach(({ name, price }) => console.log(`${name} ${price}원`));
// 출력: 아메리카노 4000원
// 출력: 케이크 6000원

// map, filter 에서도 같습니다.
console.log(products.map(({ name }) => name));
// 출력: [ '아메리카노', '케이크' ]
console.log(
  products.filter(({ price }) => price >= 5000).map(({ name }) => name),
);
// 출력: [ '케이크' ]

// ── 섹션 7: 중첩 객체 구조분해 ──

const order = {
  id: 100,
  customer: {
    name: "정하늘",
    phone: "010-0000-0000",
  },
};

// ★ 여기서 콜론( : )이 두 가지 뜻으로 쓰입니다. 헷갈리기 쉬우니 먼저 읽으세요.
//
//   const { customer: { name: customerName } } = order;
//            ────────    ──────────────────
//            ①              ②
//
//   ① 바깥 콜론은 '이름 바꾸기' 가 아닙니다. "customer 안으로 더 들어가라" 는 뜻입니다.
//      오른쪽이 이름이 아니라 또 다른 중괄호 { } 라서 그렇게 읽습니다.
//   ② 안쪽 콜론만 섹션 2에서 배운 '이름 바꾸기' 입니다. name 을 customerName 으로.
//
//   읽는 법: "order 에서 customer 안으로 들어가, 그 안의 name 을 customerName 에 담아라"
//
//   참고로 이렇게 하면 customer 라는 변수는 만들어지지 않습니다.
//   들어가는 통로로만 쓰였기 때문입니다.

const {
  customer: { name: customerName },
} = order;
console.log(customerName);
// 출력: 정하늘

// 중첩이 깊어지면 읽기 어렵습니다. 두 단계까지만 쓰고,
// 더 깊으면 나눠 쓰는 게 낫습니다.
const { customer } = order;
const { phone } = customer;
console.log(phone);
// 출력: 010-0000-0000

// [주의] 중간이 없으면 에러가 납니다.
// const { seller: { name: sellerName } } = order;
// 실수: TypeError: Cannot read properties of undefined
//       07단원의 ?. 는 구조분해에서 쓸 수 없습니다. 기본값을 주세요.
const { seller: { name: sellerName } = {} } = order;
console.log(sellerName);
// 출력: undefined

// ── 섹션 8: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 이름을 틀리게 씀
const { nmae } = user;
console.log(nmae);
// 출력: undefined
// 실수: 객체 구조분해는 '이름'으로 찾습니다. 오타가 나면 조용히 undefined 입니다.

// [실수 2] 이름 바꾸기 순서를 반대로
// const { userName: myName } = user;
// 실수: user 에 userName 이라는 속성이 없어서 myName 이 undefined 가 됩니다.
//       왼쪽이 원래 속성 이름, 오른쪽이 내가 쓸 새 이름입니다.

// [실수 3] 배열에 중괄호를 씀
const arr = [1, 2, 3];
const { 0: firstItem } = arr;
console.log(firstItem);
// 출력: 1
// 되긴 하지만 이상한 코드입니다. 배열은 대괄호로 구조분해하세요.

// [실수 4] const 없이 객체 구조분해
// { name } = user;
// 실수: SyntaxError. 줄 맨 앞의 중괄호를 '블록'으로 해석합니다.
//       const 나 let 을 붙이거나, 소괄호로 감싸야 합니다: ({ name } = user);

// [실수 5] null 이나 undefined 를 구조분해
// const { a } = null;
// 실수: TypeError: Cannot destructure property 'a' of 'null'
//       값이 있는지 확실하지 않으면 기본값을 주세요: = {}

// ── 정리 ──

// 1. const { name, age } = 객체;  — 이름으로 꺼낸다. 순서 무관.
// 2. const { name: newName } = 객체;  — 왼쪽이 원래 이름, 오른쪽이 새 이름.
// 3. const { size = 14 } = 객체;  — undefined 일 때만 기본값.
// 4. const { id, ...rest } = 객체;  — "id 만 빼고 나머지".
// 5. function f({ name, age }) — 매개변수에서 바로 구조분해. 아주 많이 쓴다.
// 6. 배열 메소드 콜백에서도 ({ name }) => ... 로 쓴다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const book = { title: "입문서", price: 25000 };
//    const { title, price } = book;
//    console.log(title, price);        // 출력: 입문서 25000
//
// 2) const { price: productPrice } = product;
//    console.log(productPrice);        // 출력: 89000
//
// 3) const { count = 0 } = {};
//    console.log(count);               // 출력: 0
//
// 4) const { userId, ...withoutId } = account;
//    console.log(withoutId);
//    // 출력: { password: '1234', nickname: '서연' }
//
// 5) const printItem = ({ name, price }) => console.log(`${name} ${price}원`);
//    printItem({ name: "쿠키", price: 3000 });
//    // 출력: 쿠키 3000원
