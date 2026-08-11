// ============================================================
// 08단원 · 개념 03 — map: 모양을 바꿔 새 배열 만들기
// ------------------------------------------------------------
// 실행: node 개념03_map.js
// ============================================================
//
// forEach 는 하나씩 처리만 하고 아무것도 안 돌려줬습니다.
// map 은 각 값을 바꿔서 '새 배열'을 만들어 돌려줍니다.
//
//     배열.map((값) => 바꾼값)
//
// 개수는 그대로입니다. 3개를 넣으면 3개가 나옵니다.


// ── 섹션 1: forEach 와 map 의 차이 ──

const numbers = [1, 2, 3];

// [forEach] 결과가 없습니다
const r1 = numbers.forEach((n) => n * 2);
console.log(r1);
// 출력: undefined

// [map] 새 배열이 나옵니다
const r2 = numbers.map((n) => n * 2);
console.log(r2);
// 출력: [ 2, 4, 6 ]

// 원본은 그대로입니다.
console.log(numbers);
// 출력: [ 1, 2, 3 ]

// 06단원에서 반복문으로 쓰던 코드를 비교해 보세요.
const doubled = [];
for (const n of numbers) {
  doubled.push(n * 2);
}
console.log(doubled);
// 출력: [ 2, 4, 6 ]

// map 이 이 세 줄을 한 줄로 만들어 준 것입니다.

// ✏️ 직접 해보기 1 — [1, 2, 3] 의 각 값을 10배로 만든 새 배열을 만들어 보세요.


// ── 섹션 2: 반드시 값을 돌려줘야 한다 ──

// map 의 콜백은 '바꾼 값'을 return 해야 합니다.
const prices = [1000, 2000, 3000];

// [화살표 한 줄] return 이 자동으로 됩니다
console.log(prices.map((p) => p * 1.1));
// 출력: [ 1100, 2200, 3300.0000000000005 ]

// 세 번째 값에 이상한 꼬리가 붙었습니다. 소수 오차입니다. (02단원 개념01)
// 돈 계산은 Math.round 로 다듬습니다.
console.log(prices.map((p) => Math.round(p * 1.1)));
// 출력: [ 1100, 2200, 3300 ]

// [중괄호를 쓰면 return 필수]
console.log(
  prices.map((p) => {
    return Math.round(p * 1.1);
  })
);
// 출력: [ 1100, 2200, 3300 ]

// return 을 빠뜨리면 undefined 로 가득 찬 배열이 나옵니다.
console.log(
  prices.map((p) => {
    Math.round(p * 1.1); // return 이 없습니다
  })
);
// 출력: [ undefined, undefined, undefined ]
// map 을 쓸 때 가장 흔한 실수입니다. undefined 가 보이면 return 부터 확인하세요.

// ✏️ 직접 해보기 2 — 가격 배열의 각 값에 500원을 더한 새 배열을 만들어 보세요.


// ── 섹션 3: 자료형을 바꿔도 된다 ──

// 숫자 배열 → 문자열 배열
const scores = [90, 85, 70];
console.log(scores.map((s) => `${s}점`));
// 출력: [ '90점', '85점', '70점' ]

// 숫자 배열 → 불리언 배열
console.log(scores.map((s) => s >= 80));
// 출력: [ true, true, false ]

// 문자열 배열 → 숫자 배열 (입력창에서 온 값 처리에 자주 씁니다)
const inputs = ["10", "20", "30"];
const nums = inputs.map((v) => Number(v));
console.log(nums);
// 출력: [ 10, 20, 30 ]
console.log(typeof nums[0]);
// 출력: number

// 숫자 배열 → 객체 배열
console.log(scores.map((s) => ({ score: s })));
// 출력: [ { score: 90 }, { score: 85 }, { score: 70 } ]
// 객체를 바로 돌려줄 때는 중괄호를 소괄호로 감싸야 합니다.
// 안 그러면 자바스크립트가 중괄호를 '함수 몸통'으로 오해합니다. (05단원 개념05)

// ✏️ 직접 해보기 3 — ["1", "2", "3"] 을 숫자 배열로 바꿔 보세요.


// ── 섹션 4: 객체 배열에서 값만 뽑기 ──

// 실무에서 가장 많이 쓰는 형태입니다.
const users = [
  { name: "김민준", age: 20 },
  { name: "이서연", age: 22 },
  { name: "박지훈", age: 28 },
];

// 이름만 뽑기
const names = users.map((user) => user.name);
console.log(names);
// 출력: [ '김민준', '이서연', '박지훈' ]

// 뽑았으니 06단원의 메소드를 이어 쓸 수 있습니다.
console.log(names.join(", "));
// 출력: 김민준, 이서연, 박지훈
console.log(names.includes("이서연"));
// 출력: true

// 나이만 뽑기
console.log(users.map((user) => user.age));
// 출력: [ 20, 22, 28 ]

// 모양을 바꿔서 새 객체 배열 만들기
const cards = users.map((user) => ({
  title: user.name,
  isAdult: user.age >= 19,
}));
console.log(cards);
// 출력: [
// 출력:   { title: '김민준', isAdult: true },
// 출력:   { title: '이서연', isAdult: true },
// 출력:   { title: '박지훈', isAdult: true }
// 출력: ]

// ✏️ 직접 해보기 4 — users 에서 이름만 뽑아 " / " 로 이어 출력해 보세요.


// ── 섹션 5: 인덱스도 받을 수 있다 ──

const menu = ["아메리카노", "라떼", "케이크"];

const numbered = menu.map((item, index) => `${index + 1}. ${item}`);
console.log(numbered);
// 출력: [ '1. 아메리카노', '2. 라떼', '3. 케이크' ]

// join 과 함께 쓰면 화면에 그대로 뿌릴 목록이 됩니다.
console.log(numbered.join("\n"));
// 출력: 1. 아메리카노
// 출력: 2. 라떼
// 출력: 3. 케이크

// 한 번에 쓰면 이렇게 됩니다. 10단원에서 화면을 만들 때 이 패턴을 계속 씁니다.
console.log(menu.map((item, i) => `${i + 1}. ${item}`).join("\n"));
// 출력: 1. 아메리카노
// 출력: 2. 라떼
// 출력: 3. 케이크

// ✏️ 직접 해보기 5 — 아래 배열에 번호를 붙인 새 배열을 만들어 보세요.
//                    const fruits = ["사과", "포도"];
//                    결과는 [ '1 사과', '2 포도' ] 형태면 됩니다.


// ── 섹션 6: 언제 map, 언제 forEach ──

// 새 배열이 필요하다      → map
// 그냥 출력하거나 처리만  → forEach
//
// 결과를 안 쓸 거면서 map 을 쓰면, 쓸데없는 배열이 만들어집니다.
// 동작은 하지만 읽는 사람이 "이 결과를 어디에 쓰지?" 하고 헷갈립니다.

// [나쁜 예] 결과를 안 쓰는데 map
menu.map((item) => console.log("나쁜 예:", item));
// 출력: 나쁜 예: 아메리카노
// 출력: 나쁜 예: 라떼
// 출력: 나쁜 예: 케이크

// [좋은 예]
menu.forEach((item) => console.log("좋은 예:", item));
// 출력: 좋은 예: 아메리카노
// 출력: 좋은 예: 라떼
// 출력: 좋은 예: 케이크


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 중괄호를 쓰고 return 을 빠뜨림 (섹션 2에서 봤습니다)

// [실수 2] 객체를 돌려줄 때 소괄호를 안 감쌈
// const bad = users.map((u) => { name: u.name });
// 실수: 중괄호를 함수 몸통으로 해석해서 undefined 가 나옵니다.
//       ({ name: u.name }) 처럼 소괄호로 감싸세요.
console.log(users.map((u) => ({ name: u.name })));
// 출력: [ { name: '김민준' }, { name: '이서연' }, { name: '박지훈' } ]

// [실수 3] 개수가 줄어들 거라 기대
console.log(scores.map((s) => (s >= 80 ? s : null)));
// 출력: [ 90, 85, null ]
// 실수: map 은 개수를 바꾸지 않습니다. 걸러 내려면 filter 입니다. (개념04)

// [실수 4] 원본이 바뀔 거라 기대
const original = [1, 2, 3];
original.map((n) => n * 10);
console.log(original);
// 출력: [ 1, 2, 3 ]
// 실수: map 은 새 배열을 '돌려줄' 뿐입니다. 받아서 써야 합니다.
const changed = original.map((n) => n * 10);
console.log(changed);
// 출력: [ 10, 20, 30 ]


// ── 정리 ──

// 1. 배열.map((값) => 바꾼값) — 새 배열을 돌려준다. 개수는 그대로.
// 2. 콜백은 반드시 값을 돌려줘야 한다. 중괄호를 쓰면 return 필수.
// 3. 자료형을 바꿔도 된다. 숫자 → 문자열, 객체 → 값 등.
// 4. 객체를 돌려줄 때는 ({ ... }) 처럼 소괄호로 감싼다.
// 5. 원본은 바뀌지 않는다. 결과를 변수에 받아야 한다.
// 6. 결과를 안 쓸 거면 map 이 아니라 forEach.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log([1, 2, 3].map((n) => n * 10));
//    // 출력: [ 10, 20, 30 ]
//
// 2) console.log(prices.map((p) => p + 500));
//    // 출력: [ 1500, 2500, 3500 ]
//
// 3) console.log(["1", "2", "3"].map((v) => Number(v)));
//    // 출력: [ 1, 2, 3 ]
//
// 4) console.log(users.map((u) => u.name).join(" / "));
//    // 출력: 김민준 / 이서연 / 박지훈
//
// 5) const fs = ["사과", "포도"];
//    console.log(fs.map((f, i) => `${i + 1} ${f}`));
//    // 출력: [ '1 사과', '2 포도' ]
