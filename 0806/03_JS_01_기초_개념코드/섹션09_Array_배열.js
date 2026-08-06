// 03_JS_01_기초 개념코드 — 섹션 9. Array 배열 (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션09_Array_배열.js 로 실행하며 결과를 확인합니다.

// ── 섹션 9: Array 배열 ──────────────
console.log("===== 섹션 9: Array 배열 =====");
// [기본] 여러 데이터를 순서대로 저장 - 인덱스는 0부터 시작 (Zero-based Numbering)
// 배열을 쓰는 이유: 값이 4개라고 변수를 4개 만들면 개수가 늘 때마다 코드를 고쳐야 합니다.
// 하나의 이름에 묶어 두면 몇 개든 반복문 하나로 처리할 수 있습니다.
let fruits = ["Orange", "Pineapple", "Apple", "Banana"];
//             [0]        [1]          [2]      [3]     ← 인덱스(자리 번호)
console.log(fruits[0], fruits[3]);  // 출력: Orange Banana
console.log(fruits.length);         // 출력: 4  (개수는 4개인데 마지막 인덱스는 3)
// 자주 쓰는 공식: 마지막 인덱스 = length - 1  → fruits[fruits.length - 1] 이 항상 마지막 값
// ⚠️ 4일차에 배운 CSS의 nth-child는 1부터 셌습니다. 배열은 0부터입니다.
//    같은 "몇 번째"라도 세는 기준이 다르니 섞이지 않게 주의하세요.
// [다른 방법] 다양한 자료형을 섞어 담을 수 있음
let mixed = [1, "Apple", false, null, undefined];
console.log(mixed[1], mixed[2]);    // 출력: Apple false
// [기본] 요소 바꾸기 — 자리 번호를 지정해서 덮어씁니다
fruits[0] = "Grape";
console.log(fruits);   // 출력: [ 'Grape', 'Pineapple', 'Apple', 'Banana' ]
// 위 fruits는 let이지만, const로 선언한 배열도 이 변경은 됩니다.
// const가 막는 건 "다른 배열로 통째로 갈아 끼우기"이지 안의 값 변경이 아닙니다
// (섹션 4의 주소 쪽지 비유 — 집을 바꾸는 건 금지, 안의 물건을 옮기는 건 허용).

// [기본] 빈 배열에서 시작해 채워 나가기 — 반복문에서 자주 쓰는 형태입니다
const basket = [];
console.log(basket.length);   // 출력: 0
// 지금은 값을 넣는 방법(push)을 안 배웠으니 "빈 배열도 만들 수 있다"까지만.
// 10일차에 basket.push("사과") 형태로 채우게 됩니다.

// [다른 방법] 배열 안에 객체를 담을 수 있습니다 — 실무에서 목록 데이터의 표준 모양입니다
const students = [
  { name: "김철수", age: 25 },
  { name: "이영희", age: 23 },
];
console.log(students[0].name);   // 출력: 김철수   0번째를 꺼내고 → 그 안의 name
// 12일차에 서버에서 받는 데이터가 정확히 이 모양입니다. (객체는 다음 섹션에서 배웁니다)

// 실수: fruits[4]  // 마지막 인덱스는 3 -> fruits[4]는 undefined (0부터 세기 때문)
//   에러가 아니라 undefined라서 조용히 넘어갑니다. 반복문에서 한 바퀴를 더 돌면
//   마지막에 undefined가 찍히는데, 원인은 대개 여기입니다.
