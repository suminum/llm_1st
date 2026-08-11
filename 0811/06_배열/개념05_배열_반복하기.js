// ============================================================
// 06단원 · 개념 05 — 배열 반복하기
// ------------------------------------------------------------
// 실행: node 개념05_배열_반복하기.js
// ============================================================
//
// 배열의 값을 하나씩 꺼내 처리하는 것이 배열을 쓰는 진짜 이유입니다.
// 04단원의 for 문과 배열이 만나는 지점입니다.


// ── 섹션 1: for 문으로 하나씩 꺼내기 ──

// 배열을 처음부터 끝까지 하나씩 훑는 것을 '순회한다' 고 말합니다.
// 앞으로 이 말이 종종 나오니 기억해 두세요.

const students = ["김민준", "이서연", "박지훈"];

for (let i = 0; i < students.length; i++) {
  console.log(students[i]);
}
// 출력: 김민준
// 출력: 이서연
// 출력: 박지훈

// 조건이 왜 i < students.length 인지 확인해 보세요.
//   인덱스는 0, 1, 2 까지입니다. length 는 3입니다.
//   i < 3 이면 0, 1, 2 에서 멈춥니다. 정확히 맞습니다.
//   i <= 3 으로 쓰면 students[3] 즉 undefined 까지 나옵니다.

// 번호를 붙여 출력하려면 i + 1 을 씁니다.
for (let i = 0; i < students.length; i++) {
  console.log(`${i + 1}번: ${students[i]}`);
}
// 출력: 1번: 김민준
// 출력: 2번: 이서연
// 출력: 3번: 박지훈

// ✏️ 직접 해보기 1 — 숫자 배열 [10, 20, 30] 을 for 문으로 하나씩 출력해 보세요.


// ── 섹션 2: for...of — 값만 필요할 때 ──

// 인덱스가 필요 없다면 for...of 가 훨씬 간단합니다.
for (const student of students) {
  console.log(student);
}
// 출력: 김민준
// 출력: 이서연
// 출력: 박지훈

// 읽는 법: "students 안의 각 student 에 대해"
//
//     for (const 하나씩담을변수 of 배열) { ... }
//
// 인덱스 계산도, length 도 신경 쓸 필요가 없습니다.
// 매 바퀴 새 변수가 만들어지므로 const 를 쓸 수 있습니다.

// for 와 for...of 비교
//   for      : 인덱스가 필요하다 / 거꾸로 돌아야 한다 / 건너뛰어야 한다
//   for...of : 값만 순서대로 필요하다  ← 대부분 이쪽

// ✏️ 직접 해보기 2 — 위 for 문 예제를 for...of 로 바꿔 보세요.


// ── 섹션 3: 합계와 평균 ──

const scores = [90, 85, 70, 95];

let sum = 0; // 누적 변수는 반복문 '밖'에서 0으로 시작
for (const score of scores) {
  sum += score;
}

console.log("합계:", sum);
// 출력: 합계: 340

const average = sum / scores.length;
console.log("평균:", average);
// 출력: 평균: 85

// 평균이 소수로 나오면 다듬습니다.
const scores2 = [90, 85, 70];
let sum2 = 0;
for (const score of scores2) {
  sum2 += score;
}
console.log(sum2 / scores2.length);
// 출력: 81.66666666666667
console.log((sum2 / scores2.length).toFixed(1));
// 출력: 81.7

// ✏️ 직접 해보기 3 — 가격 배열 [1200, 4500, 3000] 의 합계를 구해 보세요.


// ── 섹션 4: 최댓값과 최솟값 ──

const temps = [23, 31, 18, 27];

// 첫 번째 값을 일단 최댓값으로 두고, 더 큰 게 나오면 바꿉니다.
let max = temps[0];
for (const temp of temps) {
  if (temp > max) {
    max = temp;
  }
}
console.log("최고 기온:", max);
// 출력: 최고 기온: 31

let min = temps[0];
for (const temp of temps) {
  if (temp < min) {
    min = temp;
  }
}
console.log("최저 기온:", min);
// 출력: 최저 기온: 18

// [주의] 최댓값의 시작을 0으로 두면 음수 배열에서 틀립니다.
const cold = [-5, -12, -3];
let wrongMax = 0; // 잘못된 시작값
for (const c of cold) {
  if (c > wrongMax) {
    wrongMax = c;
  }
}
console.log("잘못된 최댓값:", wrongMax);
// 출력: 잘못된 최댓값: 0
// 배열에 없는 0이 답으로 나왔습니다. 반드시 첫 번째 값으로 시작하세요.

// 간단한 방법도 있습니다.
console.log(Math.max(23, 31, 18));
// 출력: 31
// 다만 Math.max 는 배열을 통째로 못 받습니다.
// 배열을 펼쳐 넣는 방법은 09단원(스프레드)에서 배웁니다.

// ✏️ 직접 해보기 4 — [45, 88, 62] 의 최솟값을 구해 보세요.


// ── 섹션 5: 조건에 맞는 것만 세기 / 모으기 ──

const ages = [15, 22, 34, 17, 40];

// [세기]
let adultCount = 0;
for (const age of ages) {
  if (age >= 19) {
    adultCount++;
  }
}
console.log("성인 수:", adultCount);
// 출력: 성인 수: 3

// [모으기] 새 배열에 push 합니다.
const adults = [];
for (const age of ages) {
  if (age >= 19) {
    adults.push(age);
  }
}
console.log(adults);
// 출력: [ 22, 34, 40 ]

// [바꿔서 모으기]
const doubled = [];
for (const age of ages) {
  doubled.push(age * 2);
}
console.log(doubled);
// 출력: [ 30, 44, 68, 34, 80 ]

// 이 세 가지 패턴(세기 / 거르기 / 바꾸기)은 프로그래밍에서 끝없이 반복됩니다.
// 08단원에서 배울 filter 와 map 을 쓰면 각각 한 줄로 줄어듭니다.
console.log(ages.filter((age) => age >= 19));
// 출력: [ 22, 34, 40 ]
console.log(ages.map((age) => age * 2));
// 출력: [ 30, 44, 68, 34, 80 ]

// 지금은 반복문으로 직접 해 보세요. 그래야 filter / map 이 무엇을 대신해 주는지 압니다.

// ✏️ 직접 해보기 5 — 점수 배열 [55, 90, 72, 88] 에서 80점 이상만 모아 보세요.


// ── 섹션 6: 배열을 반복하며 화면 만들기 ──

// 실무에서 가장 많이 하는 일입니다. 목록을 글자로 만들어 냅니다.
const cart = ["아메리카노", "케이크", "쿠키"];

let receipt = "";
for (let i = 0; i < cart.length; i++) {
  receipt += `${i + 1}. ${cart[i]}\n`;
}
console.log(receipt);
// 출력: 1. 아메리카노
// 출력: 2. 케이크
// 출력: 3. 쿠키
// 출력:
// \n 은 '줄바꿈'을 뜻하는 특별한 표시입니다. 마지막에도 붙어서 빈 줄이 하나 생깁니다.

// join 을 쓰면 훨씬 간단합니다. (개념03)
console.log(cart.join("\n"));
// 출력: 아메리카노
// 출력: 케이크
// 출력: 쿠키


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 조건에 <= 를 씀
const arr = ["a", "b"];
for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i]);
}
// 출력: a
// 출력: b
// 출력: undefined
// 실수: 인덱스 2는 없습니다. i < arr.length 여야 합니다.

// [실수 2] for...of 와 for...in 을 헷갈리기
for (const idx in arr) {
  console.log("for...in 은 인덱스가 나옵니다:", idx);
}
// 출력: for...in 은 인덱스가 나옵니다: 0
// 출력: for...in 은 인덱스가 나옵니다: 1
// for...in 은 07단원에서 객체를 순회할 때 쓰는 문법입니다.
// 배열에는 for...of 를 쓰세요.

// [실수 3] 누적 변수를 반복문 안에서 만들기 (04단원에서 봤습니다)

// [실수 4] 반복 도중에 배열 길이를 바꾸기
const items = ["a", "b", "c"];
for (let i = 0; i < items.length; i++) {
  if (items[i] === "b") {
    items.splice(i, 1); // 지우면 뒤가 한 칸씩 당겨집니다
  }
}
console.log(items);
// 출력: [ 'a', 'c' ]
// 이번엔 맞았지만, 연속으로 지울 값이 있으면 하나를 건너뜁니다.
// 반복 중에는 원본을 건드리지 말고, 새 배열에 모으는 방식을 쓰세요.


// ── 정리 ──

// 1. for (let i = 0; i < 배열.length; i++) — 인덱스가 필요할 때
// 2. for (const 값 of 배열) — 값만 필요할 때. 대부분 이쪽.
// 3. 합계는 sum 을 밖에서 0으로 시작. 최댓값은 배열[0] 으로 시작.
// 4. 세기 / 거르기 / 바꾸기 — 세 가지 기본 패턴을 몸에 익힐 것.
// 5. 반복 도중에 원본 배열의 길이를 바꾸지 말 것.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const nums = [10, 20, 30];
//    for (let i = 0; i < nums.length; i++) {
//      console.log(nums[i]);
//    }
//
// 2) for (const n of nums) {
//      console.log(n);
//    }
//
// 3) const prices = [1200, 4500, 3000];
//    let priceSum = 0;
//    for (const p of prices) {
//      priceSum += p;
//    }
//    console.log(priceSum);          // 출력: 8700
//
// 4) const list = [45, 88, 62];
//    let minValue = list[0];
//    for (const v of list) {
//      if (v < minValue) minValue = v;
//    }
//    console.log(minValue);          // 출력: 45
//
// 5) const sc = [55, 90, 72, 88];
//    const high = [];
//    for (const s of sc) {
//      if (s >= 80) high.push(s);
//    }
//    console.log(high);              // 출력: [ 90, 88 ]
