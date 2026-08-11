// ============================================================
// 09단원 · 개념 01 — 배열 구조분해
// ------------------------------------------------------------
// 실행: node 개념01_배열_구조분해.js
// ============================================================
//
// 배열에서 값을 꺼내 변수에 담는 일을 짧게 쓰는 문법입니다.
//
//     const [a, b] = [1, 2];
//
// 왼쪽의 대괄호는 '배열을 만드는 것'이 아니라 '모양을 맞춰 꺼내는 틀'입니다.


// ── 섹션 1: 하나씩 꺼내기 vs 구조분해 ──

const colors = ["빨강", "파랑", "노랑"];

// [지금까지 하던 방법]
const first1 = colors[0];
const second1 = colors[1];
console.log(first1, second1);
// 출력: 빨강 파랑

// [구조분해] 한 줄이면 됩니다
const [first2, second2] = colors;
console.log(first2, second2);
// 출력: 빨강 파랑

// 왼쪽에 적은 이름 순서대로 배열의 값이 담깁니다.
//     const [ first2 , second2 ] = colors;
//              ↑          ↑
//           colors[0]  colors[1]

// 이름은 마음대로 지어도 됩니다. 위치만 맞으면 됩니다.
const [a, b, c] = colors;
console.log(a, b, c);
// 출력: 빨강 파랑 노랑

// 필요한 만큼만 꺼내도 됩니다.
const [onlyFirst] = colors;
console.log(onlyFirst);
// 출력: 빨강

// ✏️ 직접 해보기 1 — [10, 20] 을 구조분해로 x, y 에 담아 출력해 보세요.


// ── 섹션 2: 개수가 안 맞으면 ──

const two = ["하나", "둘"];

// 왼쪽이 더 많으면 남는 것은 undefined 입니다. 에러가 아닙니다.
const [x1, y1, z1] = two;
console.log(x1, y1, z1);
// 출력: 하나 둘 undefined

// 기본값을 정해 둘 수 있습니다.
const [x2, y2, z2 = "셋"] = two;
console.log(x2, y2, z2);
// 출력: 하나 둘 셋

// 값이 있으면 기본값은 무시됩니다.
const [x3 = "기본값"] = two;
console.log(x3);
// 출력: 하나

// [주의] undefined 일 때만 기본값이 쓰입니다. null 은 그대로 들어갑니다.
const [n1 = "기본값"] = [null];
console.log(n1);
// 출력: null

// ✏️ 직접 해보기 2 — ["사과"] 에서 두 번째 값의 기본값을 "없음" 으로 꺼내 보세요.


// ── 섹션 3: 건너뛰기 ──

const week = ["월", "화", "수", "목", "금"];

// 쉼표만 남기면 그 자리를 건너뜁니다.
const [mon, , wed] = week;
console.log(mon, wed);
// 출력: 월 수

// 쉼표 두 개면 두 칸을 건너뜁니다.
const [first3, , , fourth] = week;
console.log(first3, fourth);
// 출력: 월 목

// 건너뛰기가 많아지면 읽기 어렵습니다. 세 칸 이상이면 그냥 인덱스를 쓰세요.
console.log(week[0], week[4]);
// 출력: 월 금

// ✏️ 직접 해보기 3 — week 에서 "화" 와 "금" 만 꺼내 보세요.


// ── 섹션 4: 나머지 모으기 (...) ──

// 마지막에 ... 을 붙이면 남은 값들이 배열로 모입니다.
const scores = [95, 88, 76, 64, 50];

const [top, ...others] = scores;
console.log(top);
// 출력: 95
console.log(others);
// 출력: [ 88, 76, 64, 50 ]

const [gold, silver, ...rest] = scores;
console.log(gold, silver);
// 출력: 95 88
console.log(rest);
// 출력: [ 76, 64, 50 ]

// 남은 게 없으면 빈 배열입니다.
const [only, ...nothing] = [1];
console.log(only, nothing);
// 출력: 1 []

// [규칙] ... 은 반드시 맨 마지막에 와야 합니다.
// const [...head, last] = scores;
// 실수: SyntaxError: Rest element must be last element

// ✏️ 직접 해보기 4 — [1, 2, 3, 4] 에서 첫 값과 나머지를 나눠 출력해 보세요.


// ── 섹션 5: 값 교환 ──

// 구조분해로 두 변수의 값을 한 줄에 맞바꿀 수 있습니다.
let p = "왼쪽";
let q = "오른쪽";

[p, q] = [q, p];

console.log(p, q);
// 출력: 오른쪽 왼쪽

// 구조분해가 없던 시절에는 임시 변수가 필요했습니다.
let m = 1;
let n = 2;
const temp = m;
m = n;
n = temp;
console.log(m, n);
// 출력: 2 1

// [주의] 위처럼 const 없이 쓸 때는 앞줄이 반드시 세미콜론으로 끝나야 합니다.
// 세미콜론을 빼먹으면 대괄호가 앞 줄과 한 문장으로 이어져 버립니다.
// 문법 검사는 통과하는데 실행할 때 엉뚱한 에러가 나서 더 찾기 어렵습니다.

// ✏️ 직접 해보기 5 — 변수 두 개를 만들어 값을 맞바꿔 보세요.


// ── 섹션 6: 실제로 쓰이는 곳 ──

// [1] Object.entries 순회 — 07단원에서 미리 봤습니다
const user = { name: "김민준", age: 20 };

for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
// 출력: name: 김민준
// 출력: age: 20

// 구조분해가 없다면 entry[0], entry[1] 이라고 써야 합니다.

// [2] 함수가 값 두 개를 돌려줄 때
function getMinMax(numbers) {
  const sorted = numbers.slice().sort((a, b) => a - b); // 원본 보호 (06단원 개념03)
  return [sorted[0], sorted[sorted.length - 1]];
}

const [min, max] = getMinMax([5, 1, 9, 3]);
console.log(min, max);
// 출력: 1 9

// 05단원에서 "여러 값은 return 할 수 없다" 고 했는데,
// 배열에 담아 돌려주고 구조분해로 받으면 됩니다.

// [3] split 결과 받기
const dateText = "2026-08-11";
const [year, month, day] = dateText.split("-");
console.log(`${year}년 ${month}월 ${day}일`);
// 출력: 2026년 08월 11일

// [4] 배열 메소드 콜백에서
const pairs = [
  ["사과", 1000],
  ["바나나", 2000],
];
pairs.forEach(([name, price]) => {
  console.log(`${name} ${price}원`);
});
// 출력: 사과 1000원
// 출력: 바나나 2000원


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 왼쪽 대괄호를 배열 만들기로 착각
// const [1, 2] = colors;
// 실수: SyntaxError. 왼쪽에는 '변수 이름'만 적습니다.

// [실수 2] 순서를 헷갈림
const [wrong1, wrong2] = ["첫째", "둘째"];
console.log(wrong1);
// 출력: 첫째
// 이름을 second, first 로 지어도 값은 위치대로 들어갑니다.
// 이름에 속지 마세요. 객체 구조분해(개념02)는 이름으로 찾습니다.

// [실수 3] ... 을 앞이나 중간에 쓰기 (섹션 4에서 봤습니다)

// [실수 4] 값 교환에서 세미콜론 빠뜨리기
// let s = 1
// let t = 2
// [s, t] = [t, s]
// 실수: let t = 2[s, t] = [t, s]  한 문장으로 이어져 버립니다.
//       문법 에러가 아니라서 더 헷갈립니다. 실행할 때 이런 에러가 납니다.
//         ReferenceError: Cannot access 't' before initialization
//       앞줄이 console.log(...) 였다면 TypeError 가 납니다.
//       세미콜론을 붙이면 전부 해결됩니다.

// [실수 5] 배열이 아닌 것을 구조분해
// const [k] = 5;
// 실수: TypeError: 5 is not iterable
//       숫자는 하나씩 꺼낼 수 있는 형태가 아닙니다.
// 문자열은 됩니다. 한 글자씩 꺼낼 수 있으니까요.
const [char1, char2] = "안녕";
console.log(char1, char2);
// 출력: 안 녕


// ── 정리 ──

// 1. const [a, b] = 배열;  — 위치대로 값이 담긴다.
// 2. 없으면 undefined. = 로 기본값을 정할 수 있다.
// 3. 쉼표만 남기면 건너뛴다.
// 4. const [first, ...rest] — 나머지를 배열로 모은다. ... 은 맨 뒤에만.
// 5. [a, b] = [b, a] 로 값을 맞바꾼다.
// 6. Object.entries 순회, 여러 값 return, split 결과에 자주 쓴다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const [x, y] = [10, 20];
//    console.log(x, y);            // 출력: 10 20
//
// 2) const [f, s = "없음"] = ["사과"];
//    console.log(f, s);            // 출력: 사과 없음
//
// 3) const [, tue, , , fri] = week;
//    console.log(tue, fri);        // 출력: 화 금
//
// 4) const [head, ...tail] = [1, 2, 3, 4];
//    console.log(head);            // 출력: 1
//    console.log(tail);            // 출력: [ 2, 3, 4 ]
//
// 5) let one = "A";
//    let other = "B";
//    [one, other] = [other, one];
//    console.log(one, other);      // 출력: B A
