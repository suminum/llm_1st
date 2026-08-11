// ============================================================
// 08단원 · 개념 05 — reduce: 하나의 값으로 접기
// ------------------------------------------------------------
// 실행: node 개념05_reduce.js
// ============================================================
//
// 배열 전체를 '값 하나'로 줄일 때 씁니다. 합계가 대표적입니다.
//
//     배열.reduce((누적값, 현재값) => 새누적값, 시작값)
//                  ^^^^^^  ^^^^^^                ^^^^^^
//                  지금까지  이번 바퀴의 값        누적값의 시작
//
// 이 파일은 08단원에서 가장 어렵습니다. 천천히 보세요.
// 어렵다면 for 문으로 먼저 쓰고 나중에 바꿔도 됩니다.


// ── 섹션 1: 합계를 세 가지 방법으로 ──

const numbers = [10, 20, 30, 40];

// [방법 1] for...of — 06단원에서 배운 것
let sum1 = 0;
for (const n of numbers) {
  sum1 += n;
}
console.log(sum1);
// 출력: 100

// [방법 2] forEach — 08단원 개념02
let sum2 = 0;
numbers.forEach((n) => {
  sum2 += n;
});
console.log(sum2);
// 출력: 100

// [방법 3] reduce — 밖에 변수를 두지 않아도 됩니다
const sum3 = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum3);
// 출력: 100

// acc 는 accumulator(누적값)의 줄임말입니다. total 이라고 이름 지어도 됩니다.

// ✏️ 직접 해보기 1 — [1, 2, 3, 4, 5] 의 합을 reduce 로 구해 보세요.


// ── 섹션 2: 어떻게 도는지 한 바퀴씩 보기 ──

const small = [1, 2, 3];

small.reduce((acc, n) => {
  console.log(`acc=${acc}, n=${n}, 결과=${acc + n}`);
  return acc + n;
}, 0);
// 출력: acc=0, n=1, 결과=1
// 출력: acc=1, n=2, 결과=3
// 출력: acc=3, n=3, 결과=6

// 읽는 법
//   1바퀴: acc 는 시작값 0, n 은 1 → 돌려준 1이 다음 acc 가 됩니다
//   2바퀴: acc 는 1, n 은 2 → 3
//   3바퀴: acc 는 3, n 은 3 → 6
//   끝나면 마지막 acc 인 6이 reduce 의 결과가 됩니다
//
// 핵심: 콜백이 return 한 값이 '다음 바퀴의 acc' 가 됩니다.
//
// ✏️ 여기서 멈추고 직접 해 보세요.
//    위 코드의 배열을 [10, 20, 30] 으로 바꿔서 실행해 보세요.
//    acc 와 n 이 어떻게 바뀌는지 눈으로 보는 것이 reduce 를 이해하는 가장 빠른 길입니다.
//    (결과는 acc=0,n=10 → acc=10,n=20 → acc=30,n=30 이 됩니다)

// return 을 빠뜨리면 acc 가 undefined 가 되어 무너집니다.
console.log(
  small.reduce((acc, n) => {
    acc + n; // return 이 없습니다
  }, 0)
);
// 출력: undefined
// reduce 를 쓸 때 가장 흔한 실수입니다.


// ── 섹션 3: 시작값을 빠뜨리면 ──

// 시작값(두 번째 인자)을 안 주면 배열의 첫 값이 시작값이 됩니다.
console.log([10, 20, 30].reduce((acc, n) => acc + n));
// 출력: 60
// 이 경우엔 결과가 같습니다. 첫 값 10이 acc 가 되고 20부터 돌기 때문입니다.

// 하지만 빈 배열에서는 에러가 납니다.
// console.log([].reduce((acc, n) => acc + n));
// 실수: TypeError: Reduce of empty array with no initial value

// 시작값을 주면 안전합니다.
console.log([].reduce((acc, n) => acc + n, 0));
// 출력: 0

// 그리고 자료형이 다른 결과를 만들 때는 반드시 시작값이 필요합니다.
console.log(["a", "b", "c"].reduce((acc, s) => acc + s, ""));
// 출력: abc

// 규칙: 시작값은 항상 쓰세요. 숫자면 0, 글자면 "", 배열이면 [], 객체면 {}.

// ✏️ 직접 해보기 2 — ["안", "녕", "하", "세", "요"] 를 reduce 로 이어붙여 보세요.


// ── 섹션 4: 객체 배열의 합계 ──

const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
  { name: "쿠키", price: 3000, count: 3 },
];

const total = cart.reduce((acc, item) => acc + item.price * item.count, 0);
console.log(total);
// 출력: 23000

// 개수 합계
const countTotal = cart.reduce((acc, item) => acc + item.count, 0);
console.log(countTotal);
// 출력: 6

// map 과 reduce 를 이어 쓸 수도 있습니다. 뜻이 더 잘 보일 때가 있습니다.
const total2 = cart.map((item) => item.price * item.count).reduce((acc, n) => acc + n, 0);
console.log(total2);
// 출력: 23000

// ✏️ 직접 해보기 3 — cart 에서 단가(price)의 합만 구해 보세요.


// ── 섹션 5: 최댓값 구하기 ──

const scores = [90, 55, 78, 88];

const max = scores.reduce((acc, n) => (n > acc ? n : acc), scores[0]);
console.log(max);
// 출력: 90

// 시작값이 0 이 아니라 scores[0] 이라는 점에 주의하세요.
// 섹션 3에서 "숫자면 0" 이라고 했지만 그건 '합계' 일 때 이야기입니다.
// 최댓값을 0부터 비교하면 전부 음수인 배열에서 0이 답으로 나옵니다. (06단원 개념05)
// 시작값은 "아무것도 없을 때의 답" 으로 정하세요.
//   합계  → 0 (아무것도 없으면 0원)
//   최댓값 → 첫 번째 값 (비교할 기준이 하나는 있어야 하므로)

// 삼항 연산자를 풀어 쓰면 이렇습니다.
const max2 = scores.reduce((acc, n) => {
  if (n > acc) {
    return n;
  }
  return acc;
}, scores[0]);
console.log(max2);
// 출력: 90

// 사실 최댓값은 Math.max 가 더 간단합니다. (09단원 스프레드와 함께)
console.log(Math.max(...scores));
// 출력: 90

// 객체 배열에서 "가장 비싼 것" 을 찾을 때는 reduce 가 유용합니다.
const expensive = cart.reduce((acc, item) => (item.price > acc.price ? item : acc), cart[0]);
console.log(expensive.name);
// 출력: 케이크

// ✏️ 직접 해보기 4 — scores 의 최솟값을 reduce 로 구해 보세요.


// ── 섹션 6: 개수 세기 — 결과가 객체인 경우 ──

// reduce 의 결과가 꼭 숫자일 필요는 없습니다. 객체도 됩니다.
const votes = ["짜장", "짬뽕", "짜장", "볶음밥", "짜장", "짬뽕"];

const counts = votes.reduce((acc, item) => {
  // acc[item] 이 아직 없으면 0에서 시작
  acc[item] = (acc[item] ?? 0) + 1;
  return acc; // 매 바퀴 acc 를 돌려줘야 합니다
}, {});

console.log(counts);
// 출력: { '짜장': 3, '짬뽕': 2, '볶음밥': 1 }

// 시작값이 빈 객체 {} 라는 점이 핵심입니다.
// 매 바퀴 acc 에 값을 넣고, 그 acc 를 그대로 돌려줍니다.

// 반복문으로 쓰면 이렇습니다. 처음엔 이쪽이 이해하기 쉬울 겁니다.
const counts2 = {};
for (const item of votes) {
  counts2[item] = (counts2[item] ?? 0) + 1;
}
console.log(counts2);
// 출력: { '짜장': 3, '짬뽕': 2, '볶음밥': 1 }

// ✏️ 직접 해보기 5 — ["A", "B", "A", "A"] 의 개수를 세어 보세요.


// ── 섹션 7: 언제 reduce 를 쓸까 ──

// 배열 → 값 하나 (숫자, 문자열, 객체)  → reduce
// 배열 → 배열(같은 개수)               → map
// 배열 → 배열(줄어듦)                  → filter
//
// 다만 reduce 는 읽기가 어렵습니다. 억지로 쓰지 마세요.
// 합계 정도는 reduce 가 깔끔하지만, 복잡해지면 for 문이 더 읽기 좋습니다.
//
// [나쁜 예] reduce 로 filter 흉내내기
console.log(scores.reduce((acc, n) => (n >= 80 ? acc.concat(n) : acc), []));
// 출력: [ 90, 88 ]
// 동작은 하지만 아무도 이렇게 안 씁니다.
console.log(scores.filter((n) => n >= 80));
// 출력: [ 90, 88 ]
// filter 를 쓰세요.


// ── 섹션 8: 자주 하는 실수 ──

// [실수 1] return 을 빠뜨림 (섹션 2에서 봤습니다)

// [실수 2] 시작값을 안 줌 (섹션 3)

// [실수 3] acc 와 현재값의 순서를 바꿔 쓰기
console.log([10, 20, 30].reduce((n, acc) => n + acc, 0));
// 출력: 60
// 이번엔 더하기라 결과가 같지만, 빼기였다면 완전히 달라집니다.
// 순서는 항상 (누적값, 현재값) 으로 고정입니다. 이름에 속지 마세요.

// [실수 4] 객체를 누적할 때 acc 를 안 돌려줌
// votes.reduce((acc, item) => { acc[item] = 1; }, {});
// 실수: return acc 가 없어서 다음 바퀴의 acc 가 undefined 가 됩니다.
//       TypeError: Cannot set properties of undefined

// [실수 5] 빈 배열에 시작값 없이 reduce
// [].reduce((a, b) => a + b);
// 실수: TypeError. 시작값을 주면 해결됩니다.


// ── 정리 ──

// 1. 배열.reduce((acc, 값) => 새acc, 시작값) — 배열을 값 하나로 줄인다.
// 2. 콜백이 return 한 값이 다음 바퀴의 acc 가 된다. return 필수.
// 3. 시작값은 항상 쓴다. 숫자 0, 글자 "", 배열 [], 객체 {}.
// 4. 결과가 객체나 배열이어도 된다. (개수 세기)
// 5. 어렵게 느껴지면 for 문으로 쓰고, 익숙해지면 바꿔라.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log([1, 2, 3, 4, 5].reduce((acc, n) => acc + n, 0));
//    // 출력: 15
//
// 2) console.log(["안", "녕", "하", "세", "요"].reduce((acc, s) => acc + s, ""));
//    // 출력: 안녕하세요
//    // 배열.join("") 을 쓰면 더 간단합니다.
//
// 3) console.log(cart.reduce((acc, item) => acc + item.price, 0));
//    // 출력: 13000
//
// 4) console.log(scores.reduce((acc, n) => (n < acc ? n : acc), scores[0]));
//    // 출력: 55
//
// 5) const r = ["A", "B", "A", "A"].reduce((acc, v) => {
//      acc[v] = (acc[v] ?? 0) + 1;
//      return acc;
//    }, {});
//    console.log(r);        // 출력: { A: 3, B: 1 }
