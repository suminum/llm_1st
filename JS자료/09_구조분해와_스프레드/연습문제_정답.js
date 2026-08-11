// ============================================================
// 09단원 연습문제 정답 — 구조분해와 스프레드
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================


// ───── 문제 1 ─────
const colors1 = ["빨강", "파랑", "노랑"];
const [first1, second1] = colors1;
console.log(first1, second1);
// 출력: 빨강 파랑
// 왼쪽 대괄호는 배열을 만드는 게 아니라 '모양을 맞춰 꺼내는 틀' 입니다.


// ───── 문제 2 ─────
const one2 = ["사과"];
const [fruit2, second2 = "없음"] = one2;
console.log(fruit2, second2);
// 출력: 사과 없음
// 값이 undefined 일 때만 기본값이 쓰입니다. null 은 그대로 들어갑니다.


// ───── 문제 3 ─────
const nums3 = [1, 2, 3, 4];
const [head3, ...tail3] = nums3;
console.log(head3);
// 출력: 1
console.log(tail3);
// 출력: [ 2, 3, 4 ]
// ... 은 반드시 맨 마지막에만 쓸 수 있습니다.


// ───── 문제 4 ─────
let left4 = "왼쪽";
let right4 = "오른쪽";

[left4, right4] = [right4, left4];

console.log(left4, right4);
// 출력: 오른쪽 왼쪽
// 앞 줄이 세미콜론으로 끝나야 합니다. 안 그러면 앞 줄과 이어져 에러가 납니다.


// ───── 문제 5 ─────
const dateText5 = "2026-08-11";
const [year5, month5, day5] = dateText5.split("-");
console.log(`${year5}년 ${month5}월 ${day5}일`);
// 출력: 2026년 08월 11일
// split 의 결과가 배열이므로 바로 구조분해로 받을 수 있습니다.


// ───── 문제 6 ─────
const book6 = { title: "입문서", price: 25000, author: "김작가" };
const { title, price } = book6;
console.log(title, price);
// 출력: 입문서 25000
// 객체는 이름으로 찾으므로 순서가 상관없습니다.


// ───── 문제 7 ─────
const { author: writer } = book6;
console.log(writer);
// 출력: 김작가
// 왼쪽이 원래 속성 이름, 오른쪽이 내가 쓸 새 이름입니다. 순서를 헷갈리기 쉽습니다.


// ───── 문제 8 ─────
const config8 = { theme: "dark" };
const { theme, fontSize = 14 } = config8;
console.log(theme, fontSize);
// 출력: dark 14


// ───── 문제 9 ─────
const account9 = { userId: "abc", password: "1234", nickname: "서연" };
const { password, ...safe9 } = account9;
console.log(safe9);
// 출력: { userId: 'abc', nickname: '서연' }
// 비밀번호처럼 빼고 넘겨야 할 값이 있을 때 자주 쓰는 형태입니다.


// ───── 문제 10 ─────
const user10 = { name: "김민준", age: 20, city: "부산" };

function introduce10({ name, city }) {
  console.log(`${name}은 ${city} 거주`);
}

introduce10(user10);
// 출력: 김민준은 부산 거주
// 매개변수만 봐도 이 함수가 무엇을 쓰는지 보입니다.
// age 는 안 쓰므로 아예 안 꺼내면 됩니다.


// ───── 문제 11 ─────
const products11 = [
  { name: "아메리카노", price: 4000 },
  { name: "케이크", price: 6000 },
];

console.log(products11.map(({ name }) => name));
// 출력: [ '아메리카노', '케이크' ]
// (p) => p.name 이라고 써도 맞습니다. 속성이 많아질수록 구조분해가 편합니다.


// ───── 문제 12 ─────
const scores12 = [30, 10, 20];
console.log([...scores12].sort((a, b) => a - b));
// 출력: [ 10, 20, 30 ]
console.log(scores12);
// 출력: [ 30, 10, 20 ]
// sort 는 원본을 바꿉니다. [...배열] 로 복사한 뒤 정렬해야 원본이 지켜집니다.


// ───── 문제 13 ─────
const a13 = [1, 2];
const b13 = [3, 4];
console.log([...a13, ...b13]);
// 출력: [ 1, 2, 3, 4 ]
// [a13, b13] 이라고 쓰면 배열 안에 배열이 들어갑니다. ... 을 빠뜨리지 마세요.


// ───── 문제 14 ─────
const temps14 = [45, 88, 62];
console.log(Math.max(...temps14));
// 출력: 88
// Math.max(temps14) 라고 쓰면 NaN 이 나옵니다. 배열을 통째로는 못 받습니다.


// ───── 문제 15 ─────
const base15 = { name: "박지훈", age: 28 };
console.log({ ...base15, age: 30 });
// 출력: { name: '박지훈', age: 30 }
console.log(base15);
// 출력: { name: '박지훈', age: 28 }
// 같은 이름을 나중에 다시 쓰면 덮어씁니다. 원본은 그대로입니다.


// ───── 문제 16 ─────
const defaults16 = { theme: "light", fontSize: 14 };
const userSetting16 = { theme: "dark" };

console.log({ ...defaults16, ...userSetting16 });
// 출력: { theme: 'dark', fontSize: 14 }
// 순서를 바꾸면 기본값이 사용자 설정을 덮어써 버립니다.
// 규칙: 기본값을 먼저, 덮어쓸 것을 나중에.


// ───── 문제 17 ─────
function sumAll(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

console.log(sumAll(1, 2, 3, 4, 5));
// 출력: 15
console.log(sumAll(1, 2));
// 출력: 3
console.log(sumAll());
// 출력: 0
// reduce 에 시작값 0 을 줬기 때문에 인자가 하나도 없어도 에러가 나지 않습니다.


// ───── 문제 18 ─────
const word18 = "자바스크립트";
console.log([...word18].reverse().join(""));
// 출력: 트립크스바자
// 문자열을 스프레드로 펼치면 글자 배열이 됩니다.
// 배열을 뒤집고 join("") 으로 다시 붙였습니다.
// word18.split("") 을 써도 결과는 같습니다.


// ───── 문제 19 ─────
const todos19 = [
  { id: 1, text: "장보기", done: false },
  { id: 2, text: "청소", done: false },
];

// id 가 2면 복사해서 done 만 바꾸고, 아니면 그대로 둡니다.
const updated19 = todos19.map((todo) => (todo.id === 2 ? { ...todo, done: true } : todo));

updated19.forEach(({ text, done }) => {
  console.log(`${text} ${done ? "완료" : "미완료"}`);
});
// 출력: 장보기 미완료
// 출력: 청소 완료

console.log("원본 확인:", todos19[1].done);
// 출력: 원본 확인: false
// map 은 새 배열을 만들고, { ...todo } 는 새 객체를 만들기 때문에
// 원본은 하나도 건드려지지 않았습니다. React 에서 계속 쓰는 형태입니다.


// ───── 문제 20 ─────
// const { value } = null;
//
// 에러: TypeError: Cannot destructure property 'value' of 'null' as it is null.
//
// 왜:
//   구조분해는 "이 안에서 꺼내라" 는 뜻인데 null 은 안이 없습니다.
//   undefined 여도 같은 에러가 납니다.
//
// 해결:
//   오른쪽에 기본값을 주면 됩니다.
//
//   const { value } = null ?? {};       // 출력: undefined
//   const { value } = someData || {};
//
//   함수 매개변수에서도 같은 방법을 씁니다.
//   function f({ name } = {}) { ... }   // 인자를 안 넘겨도 에러가 안 남
