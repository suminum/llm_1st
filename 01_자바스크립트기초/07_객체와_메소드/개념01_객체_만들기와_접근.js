// ============================================================
// 07단원 · 개념 01 — 객체 만들기와 접근
// ------------------------------------------------------------
// 실행: node 개념01_객체_만들기와_접근.js
// ============================================================
//
// 배열은 값을 '순서'로 묶었습니다.
//
//     const user = ["김민준", 20, "부산"];
//     user[1] 이 뭐였더라? 나이? 순서를 외워야 합니다.
//
// 객체는 값에 '이름표'를 붙여 묶습니다.
//
//     const user = { name: "김민준", age: 20, city: "부산" };
//     user.age  ← 이름으로 꺼내니 외울 필요가 없습니다


// ── 섹션 1: 객체 만들기 ──

const user = {
  name: "김민준",
  age: 20,
  city: "부산",
};

console.log(user);
// 출력: { name: '김민준', age: 20, city: '부산' }

// 생김새를 뜯어봅시다.
//
//     {  name  :  "김민준"  ,  age  :  20  }
//     ^   ^    ^     ^      ^
//     |   |    |     |      └ 쌍마다 쉼표로 구분
//     |   |    |     └ 값(value)
//     |   |    └ 콜론으로 이름과 값을 연결
//     |   └ 이름(key, 속성 이름)
//     └ 중괄호로 감쌈  ← 배열의 대괄호와 다릅니다
//
// 이름과 값의 한 쌍을 '속성(property)'이라고 부릅니다.

// 한 줄로 써도 됩니다. 속성이 적을 때만 그렇게 하세요.
const point = { x: 10, y: 20 };
console.log(point);
// 출력: { x: 10, y: 20 }

// 빈 객체로 시작할 수도 있습니다.
const empty = {};
console.log(empty);
// 출력: {}

// 자료형은 배열과 마찬가지로 object 입니다.
console.log(typeof user);
// 출력: object

// 배열인지 객체인지 구별하려면 Array.isArray 를 씁니다.
console.log(Array.isArray(user));
// 출력: false

// ✏️ 직접 해보기 1 — 자기 정보를 담은 객체(name, age)를 만들어 출력해 보세요.


// ── 섹션 2: 점 표기법으로 꺼내기 ──

console.log(user.name);
// 출력: 김민준
console.log(user.age);
// 출력: 20

// 배열의 [0] 자리에 이름이 들어간다고 생각하면 쉽습니다.
//     배열: 배열[0]
//     객체: 객체.이름

// 템플릿 리터럴 안에서도 그대로 씁니다.
console.log(`${user.name}님은 ${user.age}살, ${user.city} 거주`);
// 출력: 김민준님은 20살, 부산 거주

// 없는 속성을 꺼내면 undefined 입니다. 에러가 아닙니다.
console.log(user.email);
// 출력: undefined
// 배열에서 없는 인덱스를 꺼냈을 때와 같습니다. 조용해서 더 위험합니다.

// ✏️ 직접 해보기 2 — 위에서 만든 객체의 name 을 꺼내 출력해 보세요.


// ── 섹션 3: 대괄호 표기법 ──

// 점 대신 대괄호와 따옴표로도 꺼낼 수 있습니다.
console.log(user["name"]);
// 출력: 김민준

// 결과는 같은데 왜 두 가지가 있을까요?
// 대괄호는 '이름을 변수로 정할 수 있기' 때문입니다.

const key = "age";
console.log(user[key]);
// 출력: 20

// 점으로는 이게 안 됩니다.
console.log(user.key);
// 출력: undefined
// user 에 "key" 라는 이름의 속성을 찾기 때문입니다.

// 그래서 이렇게 씁니다.
//   이름을 코드에 직접 적는다     → 점 표기법 (대부분 이쪽)
//   이름이 변수에 들어 있다       → 대괄호 표기법

// 반복문에서 여러 속성을 돌 때 유용합니다.
const keys = ["name", "age", "city"];
for (const k of keys) {
  console.log(`${k}: ${user[k]}`);
}
// 출력: name: 김민준
// 출력: age: 20
// 출력: city: 부산

// 이름에 띄어쓰기나 특수문자가 있으면 대괄호만 가능합니다.
const weird = { "my name": "김민준", "1st": "첫째" };
console.log(weird["my name"]);
// 출력: 김민준
// console.log(weird.my name);   ← SyntaxError
// 이런 이름은 되도록 쓰지 마세요. 카멜 표기법(myName)이 약속입니다.

// ✏️ 직접 해보기 3 — 변수에 "city" 를 담고 대괄호로 user 의 city 를 꺼내 보세요.


// ── 섹션 4: 값에는 아무거나 들어간다 ──

const product = {
  name: "무선 이어폰",
  price: 89000,
  inStock: true, // 불리언
  tags: ["전자기기", "음향"], // 배열
  seller: {
    // 객체 안에 객체
    name: "봄날전자",
    rating: 4.8,
  },
};

console.log(product.price);
// 출력: 89000
console.log(product.inStock);
// 출력: true

// 배열이 값이면 인덱스로 꺼냅니다.
console.log(product.tags[0]);
// 출력: 전자기기
console.log(product.tags.length);
// 출력: 2

// 객체가 값이면 점을 이어 붙입니다.
console.log(product.seller.name);
// 출력: 봄날전자
console.log(product.seller.rating);
// 출력: 4.8

// 이 조합이 실무 데이터의 기본 모양입니다.
// 서버에서 받아오는 데이터가 대부분 이렇게 생겼습니다.

// ✏️ 직접 해보기 4 — product 의 판매자 평점을 꺼내 출력해 보세요.


// ── 섹션 5: 중첩 객체에서 조심할 것 ──

// 중간 단계가 없으면 에러가 납니다.
const emptyUser = {};

console.log(emptyUser.seller);
// 출력: undefined
// 여기까지는 괜찮습니다.

// console.log(emptyUser.seller.name);
// 실수: TypeError: Cannot read properties of undefined (reading 'name')
//       undefined 에서 name 을 꺼내려 했기 때문입니다.

// [해결 1] 03단원에서 배운 && 로 먼저 확인하기
if (emptyUser.seller && emptyUser.seller.name) {
  console.log(emptyUser.seller.name);
} else {
  console.log("판매자 정보 없음");
}
// 출력: 판매자 정보 없음

// [해결 2] ?. — 옵셔널 체이닝 (더 짧고 요즘 방식)
console.log(emptyUser.seller?.name);
// 출력: undefined
// ?. 은 "앞의 값이 없으면 거기서 멈추고 undefined 를 내놔라"는 뜻입니다.
// 에러 없이 조용히 넘어갑니다.

console.log(product.seller?.name);
// 출력: 봄날전자
// 값이 있으면 그냥 평소처럼 동작합니다.

// 기본값까지 주려면 02단원의 ?? 와 함께 씁니다.
console.log(emptyUser.seller?.name ?? "판매자 미정");
// 출력: 판매자 미정

// ✏️ 직접 해보기 5 — 빈 객체에서 ?. 를 써서 에러 없이 값을 꺼내 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 대괄호 안에 따옴표를 빼먹기
// console.log(user[name]);
// 실수: name 이라는 '변수'를 찾습니다. 없으면 ReferenceError.
//       user["name"] 처럼 따옴표를 붙이거나, user.name 을 쓰세요.

// [실수 2] 배열과 객체의 괄호를 헷갈리기
// const wrong = [name: "김민준"];
// 실수: SyntaxError. 이름표가 있으면 객체이므로 중괄호 { } 입니다.

// [실수 3] 마지막 쉼표 뒤에 값 없이 콜론
// const wrong2 = { name: "김민준", age: };
// 실수: SyntaxError. 값을 안 적을 거면 속성 자체를 지우세요.
//       참고로 마지막 속성 뒤의 쉼표(트레일링 콤마)는 있어도 괜찮습니다.

// [실수 4] 객체끼리 === 로 비교
console.log({ a: 1 } === { a: 1 });
// 출력: false
// 실수: 내용이 같아도 '다른 객체'라 false 입니다. 배열과 같은 이유입니다.

// [실수 5] 없는 속성인데 에러가 안 나서 못 알아차림
console.log(user.nmae);
// 출력: undefined
// 실수: name 의 오타입니다. 에러가 안 나므로 undefined 가 보이면
//       속성 이름 오타부터 의심하세요.


// ── 정리 ──

// 1. const 객체 = { 이름: 값, 이름: 값 };  — 중괄호와 콜론
// 2. 객체.이름 으로 꺼낸다. 없으면 undefined.
// 3. 이름이 변수에 들어 있으면 객체[변수] 로 꺼낸다.
// 4. 값에는 숫자·문자열·배열·객체 무엇이든 들어간다.
// 5. 중첩 객체는 ?. 를 쓰면 중간이 없어도 에러가 나지 않는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const me = { name: "김민준", age: 20 };
//    console.log(me);
//    // 출력: { name: '김민준', age: 20 }
//
// 2) console.log(me.name);            // 출력: 김민준
//
// 3) const k = "city";
//    console.log(user[k]);            // 출력: 부산
//
// 4) console.log(product.seller.rating);   // 출력: 4.8
//
// 5) const nothing = {};
//    console.log(nothing.a?.b);       // 출력: undefined
