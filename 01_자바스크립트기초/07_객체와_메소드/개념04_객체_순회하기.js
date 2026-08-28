// ============================================================
// 07단원 · 개념 04 — 객체 순회하기
// ------------------------------------------------------------
// 실행: node 개념04_객체_순회하기.js
// ============================================================
//
// 배열은 for...of 로 돌았습니다. 객체는 순서가 아니라 이름으로 되어 있어서
// 다른 방법을 씁니다.
//
//     for...in          이름을 하나씩 꺼낸다
//     Object.keys()     이름들을 배열로 만든다
//     Object.values()   값들을 배열로 만든다
//     Object.entries()  [이름, 값] 쌍들을 배열로 만든다


// ── 섹션 1: for...in — 이름을 하나씩 ──

const user = {
  name: "김민준",
  age: 20,
  city: "부산",
};

for (const key in user) {
  console.log(key);
}
// 출력: name
// 출력: age
// 출력: city

// 나오는 것은 '이름'입니다. 값이 아닙니다.
// 값을 꺼내려면 대괄호 표기법을 씁니다. (개념01 섹션 3)

for (const key in user) {
  console.log(`${key}: ${user[key]}`);
}
// 출력: name: 김민준
// 출력: age: 20
// 출력: city: 부산

// user.key 라고 쓰면 안 됩니다. key 라는 이름의 속성을 찾아 undefined 가 됩니다.
for (const key in user) {
  console.log(user.key);
}
// 출력: undefined
// 출력: undefined
// 출력: undefined

// for...of 와 for...in 을 헷갈리지 마세요.
//     for...of  → 배열의 '값'
//     for...in  → 객체의 '이름'

// ✏️ 직접 해보기 1 — 객체를 만들고 for...in 으로 "이름: 값" 을 출력해 보세요.


// ── 섹션 2: Object.keys — 이름들을 배열로 ──

const keys = Object.keys(user);
console.log(keys);
// 출력: [ 'name', 'age', 'city' ]

// 배열이 되었으니 06단원에서 배운 것을 전부 쓸 수 있습니다.
console.log(keys.length);
// 출력: 3
console.log(keys.includes("age"));
// 출력: true
console.log(keys.join(", "));
// 출력: name, age, city

// 속성이 몇 개인지 세는 표준 방법입니다.
// 객체에는 .length 가 없습니다.
console.log(user.length);
// 출력: undefined
console.log(Object.keys(user).length);
// 출력: 3

// for...of 로 돌 수도 있습니다.
for (const key of Object.keys(user)) {
  console.log(`${key} 확인`);
}
// 출력: name 확인
// 출력: age 확인
// 출력: city 확인

// ✏️ 직접 해보기 2 — 객체의 속성 개수를 출력해 보세요.


// ── 섹션 3: Object.values — 값들을 배열로 ──

const values = Object.values(user);
console.log(values);
// 출력: [ '김민준', 20, '부산' ]

// 값만 필요할 때 편합니다.
const scores = { 국어: 90, 영어: 85, 수학: 70 };
const scoreList = Object.values(scores);
console.log(scoreList);
// 출력: [ 90, 85, 70 ]

// 배열이 되었으니 합계를 낼 수 있습니다.
let sum = 0;
for (const score of scoreList) {
  sum += score;
}
console.log("합계:", sum);
// 출력: 합계: 245
console.log("평균:", sum / scoreList.length);
// 출력: 평균: 81.66666666666667
console.log("평균:", (sum / scoreList.length).toFixed(1));
// 출력: 평균: 81.7

// ✏️ 직접 해보기 3 — scores 의 값 중 최고점을 구해 보세요.


// ── 섹션 4: Object.entries — 이름과 값을 한꺼번에 ──

const entries = Object.entries(user);
console.log(entries);
// 출력: [ [ 'name', '김민준' ], [ 'age', 20 ], [ 'city', '부산' ] ]

// [이름, 값] 짝이 담긴 배열들의 배열입니다.
console.log(entries[0]);
// 출력: [ 'name', '김민준' ]
console.log(entries[0][0]);
// 출력: name
console.log(entries[0][1]);
// 출력: 김민준

// for...of 로 돌면서 인덱스로 꺼내 씁니다.
for (const entry of Object.entries(user)) {
  console.log(`${entry[0]} = ${entry[1]}`);
}
// 출력: name = 김민준
// 출력: age = 20
// 출력: city = 부산

// entry[0], entry[1] 이 읽기 불편하죠?
// 09단원의 구조분해를 배우면 이렇게 쓸 수 있습니다.
for (const [key, value] of Object.entries(user)) {
  console.log(`${key} = ${value}`);
}
// 출력: name = 김민준
// 출력: age = 20
// 출력: city = 부산
// 훨씬 읽기 좋습니다. 지금은 이런 게 있다는 것만 봐 두세요.

// ✏️ 직접 해보기 4 — Object.entries 로 scores 를 "과목: 점수" 형태로 출력해 보세요.


// ── 섹션 5: 무엇을 쓸까 ──

// 이름만 필요하다        → Object.keys
// 값만 필요하다          → Object.values
// 둘 다 필요하다         → Object.entries (또는 for...in)
//
// 실무에서는 for...in 보다 Object.keys / entries 를 더 많이 씁니다.
// 결과가 배열이라 06단원의 메소드들과 08단원의 filter / map 을 이어 쓸 수 있기 때문입니다.

// 조건에 맞는 것만 골라내는 예
const stock = { 아메리카노: 10, 라떼: 0, 케이크: 3, 쿠키: 0 };

const soldOut = [];
for (const entry of Object.entries(stock)) {
  // entry[0] 은 이름, entry[1] 은 개수입니다. (섹션 4에서 봤습니다)
  if (entry[1] === 0) {
    soldOut.push(entry[0]);
  }
}

console.log("품절:", soldOut.join(", "));
// 출력: 품절: 라떼, 쿠키

// 09단원의 구조분해를 배우면 entry[0], entry[1] 대신
// for (const [name, count] of ...) 처럼 이름을 바로 붙여 쓸 수 있습니다.

// ✏️ 직접 해보기 5 — stock 에서 재고가 1개 이상인 메뉴만 모아 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] for...in 에서 값이 나올 거라 기대 (섹션 1에서 봤습니다)

// [실수 2] 객체에 length 쓰기
console.log(user.length);
// 출력: undefined
// 실수: 객체에는 length 가 없습니다. Object.keys(객체).length 를 쓰세요.

// [실수 3] Object.keys 를 object.keys 로 씀 → ReferenceError
// console.log(object.keys(user));
// 실수: ReferenceError: object is not defined
//       object 라는 이름의 변수가 없어서 .keys 를 꺼내기도 전에 멈춥니다.
//       첫 글자가 대문자인 Object 입니다.

// [실수 4] 배열에 for...in 을 씀
const arr = ["a", "b"];
for (const i in arr) {
  console.log(i, typeof i);
}
// 출력: 0 string
// 출력: 1 string
// 실수: 인덱스가 나오는데, 심지어 숫자가 아니라 문자열입니다.
//       배열에는 for...of 를 쓰세요.

// [실수 5] 객체의 순서를 믿기
const mixed = { 10: "십", 2: "이", name: "이름" };
console.log(Object.keys(mixed));
// 출력: [ '2', '10', 'name' ]
// 실수: 숫자로 된 이름은 작은 수부터 앞으로 정렬됩니다.
//       순서가 중요한 데이터는 객체가 아니라 배열에 담으세요.


// ── 정리 ──

// 1. for (const key in 객체) — 이름이 나온다. 값은 객체[key].
// 2. Object.keys(객체)    이름 배열
// 3. Object.values(객체)  값 배열
// 4. Object.entries(객체) [이름, 값] 짝의 배열
// 5. 객체에는 length 가 없다. Object.keys(객체).length 를 쓴다.
// 6. 배열은 for...of, 객체는 for...in / Object.keys.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const book = { title: "입문서", price: 25000 };
//    for (const key in book) {
//      console.log(`${key}: ${book[key]}`);
//    }
//    // 출력: title: 입문서
//    // 출력: price: 25000
//
// 2) console.log(Object.keys(book).length);      // 출력: 2
//
// 3) const list = Object.values(scores);
//    let max = list[0];
//    for (const s of list) {
//      if (s > max) max = s;
//    }
//    console.log(max);                            // 출력: 90
//
// 4) for (const entry of Object.entries(scores)) {
//      console.log(`${entry[0]}: ${entry[1]}`);
//    }
//    // 출력: 국어: 90 / 영어: 85 / 수학: 70
//    (09단원을 배우면 for (const [subject, score] of ...) 로 짧아집니다)
//
// 5) const available = [];
//    for (const entry of Object.entries(stock)) {
//      if (entry[1] >= 1) available.push(entry[0]);
//    }
//    console.log(available);
//    // 출력: [ '아메리카노', '케이크' ]
