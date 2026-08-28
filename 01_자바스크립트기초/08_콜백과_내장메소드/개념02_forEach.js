// ============================================================
// 08단원 · 개념 02 — forEach: 하나씩 처리하기
// ------------------------------------------------------------
// 실행: node 개념02_forEach.js
// ============================================================
//
// 배열의 값을 하나씩 꺼내 콜백에 넘겨 주는 메소드입니다.
// 06단원에서 for...of 로 하던 일을 대신합니다.
//
// 왜 굳이 갈아타나?
//   for...of 도 충분히 좋습니다. 다만 forEach 는 인덱스를 자동으로 넘겨 주고,
//   무엇보다 다음 파일부터 배울 map·filter·reduce 와 생김새가 똑같습니다.
//   여기서 모양에 익숙해지면 나머지가 전부 쉬워집니다.
//
//     배열.forEach((값) => { 할 일 });


// ── 섹션 1: for...of 를 forEach 로 ──

const fruits = ["사과", "바나나", "포도"];

// [for...of 버전]
for (const fruit of fruits) {
  console.log(fruit);
}
// 출력: 사과
// 출력: 바나나
// 출력: 포도

// [forEach 버전]
fruits.forEach((fruit) => {
  console.log(fruit);
});
// 출력: 사과
// 출력: 바나나
// 출력: 포도

// 한 줄이면 중괄호를 없앨 수 있습니다.
fruits.forEach((fruit) => console.log(fruit));
// 출력: 사과
// 출력: 바나나
// 출력: 포도

// 동작을 따라가 보면
//   forEach 가 배열을 처음부터 끝까지 돌면서
//   매 바퀴 콜백을 부르고, 그때 그 자리의 값을 넘겨 줍니다.
//   fruit 라는 이름은 우리가 지은 것입니다. item, f 무엇이든 됩니다.

// ✏️ 직접 해보기 1 — 숫자 배열 [10, 20, 30] 을 forEach 로 출력해 보세요.


// ── 섹션 2: 인덱스도 받을 수 있다 ──

// 콜백의 두 번째 매개변수로 인덱스가 넘어옵니다.
fruits.forEach((fruit, index) => {
  console.log(`${index}: ${fruit}`);
});
// 출력: 0: 사과
// 출력: 1: 바나나
// 출력: 2: 포도

// 번호를 1부터 붙이려면 index + 1 을 씁니다.
fruits.forEach((fruit, index) => {
  console.log(`${index + 1}번 ${fruit}`);
});
// 출력: 1번 사과
// 출력: 2번 바나나
// 출력: 3번 포도

// 세 번째로는 배열 전체가 넘어옵니다. 거의 안 씁니다.
fruits.forEach((fruit, index, array) => {
  console.log(`${fruit} (전체 ${array.length}개 중 ${index + 1}번째)`);
});
// 출력: 사과 (전체 3개 중 1번째)
// 출력: 바나나 (전체 3개 중 2번째)
// 출력: 포도 (전체 3개 중 3번째)

// 필요한 만큼만 받으면 됩니다. 순서는 항상 (값, 인덱스, 배열) 로 고정입니다.

// ✏️ 직접 해보기 2 — 아래 배열을 "1. 국어" 형태로 출력해 보세요.
//                    const subjects = ["국어", "영어", "수학"];


// ── 섹션 3: 객체 배열에 쓰기 ──

const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
];

cart.forEach((item) => {
  console.log(`${item.name} x${item.count} = ${item.price * item.count}원`);
});
// 출력: 아메리카노 x2 = 8000원
// 출력: 케이크 x1 = 6000원

// 합계를 구하려면 밖에 변수를 두고 더합니다.
let total = 0;
cart.forEach((item) => {
  total += item.price * item.count;
});
console.log(`합계 ${total}원`);
// 출력: 합계 14000원

// (합계는 개념05의 reduce 로 더 깔끔하게 쓸 수 있습니다)

// ✏️ 직접 해보기 3 — cart 의 상품 이름만 한 줄씩 출력해 보세요.


// ── 섹션 4: forEach 는 아무것도 돌려주지 않는다 ──

const result = fruits.forEach((fruit) => fruit + "!");
console.log(result);
// 출력: undefined

// forEach 의 결과는 언제나 undefined 입니다.
// "각 값으로 무언가를 하는" 메소드이지 "새 배열을 만드는" 메소드가 아닙니다.
//
// 새 배열이 필요하면 다음 파일의 map 을 씁니다.

// 원본을 바꾸지도 않습니다.
const numbers = [1, 2, 3];
numbers.forEach((n) => {
  n = n * 2; // 콜백 안의 n 만 바뀝니다
});
console.log(numbers);
// 출력: [ 1, 2, 3 ]

// 원본을 바꾸려면 인덱스로 직접 넣어야 합니다. (권장하지 않습니다)
const numbers2 = [1, 2, 3];
numbers2.forEach((n, i) => {
  numbers2[i] = n * 2;
});
console.log(numbers2);
// 출력: [ 2, 4, 6 ]
// 이렇게 쓰지 말고 map 을 쓰세요.


// ── 섹션 5: forEach 는 중간에 멈출 수 없다 ──

// break 를 쓰면 에러입니다.
// fruits.forEach((fruit) => {
//   if (fruit === "바나나") break;
// });
// 실수: SyntaxError: Illegal break statement
//       break 는 반복문의 문법인데, forEach 는 반복문이 아니라 메소드입니다.

// return 은 이번 바퀴만 건너뜁니다. continue 처럼 동작합니다.
fruits.forEach((fruit) => {
  if (fruit === "바나나") {
    return; // 이번 바퀴만 건너뜀
  }
  console.log(fruit);
});
// 출력: 사과
// 출력: 포도

// 그래서 중간에 멈춰야 하면 for 문이나 for...of 를 쓰세요.
for (const fruit of fruits) {
  if (fruit === "바나나") {
    break;
  }
  console.log("for...of:", fruit);
}
// 출력: for...of: 사과

// 정리:
//   전부 다 돌아도 된다        → forEach (읽기 편함)
//   중간에 멈춰야 한다         → for / for...of
//   조건에 맞는 첫 개를 찾는다 → find (개념04)

// ✏️ 직접 해보기 4 — forEach 로 짝수만 출력해 보세요. (홀수는 return 으로 건너뛰기)


// ── 섹션 6: for 문과 비교해서 언제 무엇을 ──

const list = ["a", "b", "c"];

// forEach — 값과 인덱스가 자동으로 넘어옴. 읽기 편함.
list.forEach((v, i) => console.log(`forEach ${i} ${v}`));
// 출력: forEach 0 a
// 출력: forEach 1 b
// 출력: forEach 2 c

// for...of — break / continue 를 쓸 수 있음
for (const v of list) {
  console.log(`for...of ${v}`);
}
// 출력: for...of a
// 출력: for...of b
// 출력: for...of c

// for — 거꾸로 돌기, 건너뛰기 등 자유로움
for (let i = list.length - 1; i >= 0; i--) {
  console.log(`for(거꾸로) ${list[i]}`);
}
// 출력: for(거꾸로) c
// 출력: for(거꾸로) b
// 출력: for(거꾸로) a

// 실무에서는 forEach 와 for...of 를 가장 많이 씁니다.


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] forEach 의 결과를 변수에 담기 (섹션 4에서 봤습니다)
// const doubled = numbers.forEach((n) => n * 2);   ← undefined
// 새 배열이 필요하면 map 입니다.

// [실수 2] 콜백에 괄호를 붙여 넘기기
// fruits.forEach(console.log());
// 실수: console.log() 가 먼저 실행되어 빈 줄이 하나 찍히고,
//       그 결과인 undefined 가 콜백 자리로 넘어갑니다.
//       undefined 는 함수가 아니므로
//       TypeError: undefined is not a function 으로 프로그램이 멈춥니다.

// 참고로 이건 됩니다. 함수 자체를 넘기는 것이니까요.
fruits.forEach(console.log);
// 출력: 사과 0 [ '사과', '바나나', '포도' ]
// 출력: 바나나 1 [ '사과', '바나나', '포도' ]
// 출력: 포도 2 [ '사과', '바나나', '포도' ]
// 값, 인덱스, 배열 세 개가 전부 넘어가서 지저분합니다.
// 그래서 보통 (f) => console.log(f) 처럼 감싸서 씁니다.

// [실수 3] break 를 쓰기 (섹션 5)

// [실수 4] 화살표 함수 매개변수 순서를 바꿔 쓰기
fruits.forEach((index, fruit) => {
  console.log(index, fruit);
});
// 출력: 사과 0
// 출력: 바나나 1
// 출력: 포도 2
// 실수: 이름만 바꿨을 뿐 넘어오는 순서는 (값, 인덱스) 로 고정입니다.
//       이름에 속아 값과 인덱스가 뒤바뀐 코드를 쓰게 됩니다.


// ── 정리 ──

// 1. 배열.forEach((값, 인덱스) => { ... })
// 2. 넘어오는 순서는 (값, 인덱스, 배열) 로 고정. 이름은 마음대로.
// 3. forEach 는 undefined 를 돌려준다. 새 배열이 필요하면 map.
// 4. break 를 쓸 수 없다. return 은 continue 처럼 동작한다.
// 5. 중간에 멈춰야 하면 for / for...of 를 쓴다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) [10, 20, 30].forEach((n) => console.log(n));
//
// 2) const subjects = ["국어", "영어", "수학"];
//    subjects.forEach((s, i) => console.log(`${i + 1}. ${s}`));
//    // 출력: 1. 국어 / 2. 영어 / 3. 수학
//
// 3) cart.forEach((item) => console.log(item.name));
//    // 출력: 아메리카노 / 케이크
//
// 4) [1, 2, 3, 4, 5].forEach((n) => {
//      if (n % 2 === 1) return;
//      console.log(n);
//    });
//    // 출력: 2 / 4
