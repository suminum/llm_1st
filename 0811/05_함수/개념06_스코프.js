// ============================================================
// 05단원 · 개념 06 — 스코프: 변수가 사는 범위
// ------------------------------------------------------------
// 실행: node 개념06_스코프.js
// ============================================================
//
// 변수는 아무 데서나 쓸 수 있는 게 아닙니다.
// "이 변수를 어디서부터 어디까지 쓸 수 있는가"를 스코프라고 합니다.
//
// 핵심 규칙은 딱 하나입니다. 나머지는 전부 여기서 따라 나옵니다.
//     중괄호 { } 안에서 만든 변수는 그 중괄호 안에서만 쓸 수 있다.


// ── 섹션 1: 함수 안의 변수는 밖에서 못 쓴다 ──

function makeCoffee() {
  const beans = "에티오피아 원두"; // 함수 안에서 만든 변수
  console.log("함수 안:", beans);
}

makeCoffee();
// 출력: 함수 안: 에티오피아 원두

// 함수 밖에서 beans 를 쓰면 에러입니다.
// console.log(beans);
// 실수: ReferenceError: beans is not defined
//
// 함수가 끝나면 그 안의 변수는 사라집니다.

// 이건 불편한 게 아니라 좋은 것입니다.
// 함수마다 자기 변수를 마음껏 만들어도 다른 함수와 부딪히지 않으니까요.

function makeTea() {
  const beans = "녹차 잎"; // 위와 같은 이름이지만 완전히 다른 변수입니다
  console.log("다른 함수 안:", beans);
}

makeTea();
// 출력: 다른 함수 안: 녹차 잎

// 용어 두 개만 알고 갑시다. 앞으로 계속 나옵니다.
//   지역 변수 : 함수(또는 중괄호) 안에서 만든 변수. 그 안에서만 산다.  ← beans
//   전역 변수 : 함수 밖, 파일의 맨 바깥에서 만든 변수. 어디서나 보인다. (섹션 2)
// '지역' 은 동네, '전역' 은 나라 전체라고 생각하면 쉽습니다.

// ✏️ 직접 해보기 1 — 함수 안에서 변수를 만들고, 함수 밖에서 출력해 보세요.
//                    (에러가 나는 것을 직접 확인하고 다시 주석 처리하세요)


// ── 섹션 2: 밖의 변수는 안에서 쓸 수 있다 ──

const shopName = "봄날카페"; // 함수 밖 — 전역 변수

function printShop() {
  console.log("가게 이름:", shopName); // 밖의 변수를 그대로 씁니다
}

printShop();
// 출력: 가게 이름: 봄날카페

// 안에서 밖은 보이고, 밖에서 안은 안 보입니다.
// 선팅한 자동차 유리를 생각하세요. 안에서는 밖이 보이지만 밖에서는 안이 안 보입니다.

// 중첩된 함수도 마찬가지입니다. 바깥으로는 계속 찾아 나갑니다.
function outer() {
  const outerValue = "바깥 값";

  function inner() {
    console.log("안쪽에서 본 바깥:", outerValue);
    console.log("안쪽에서 본 전역:", shopName);
  }

  inner();
}

outer();
// 출력: 안쪽에서 본 바깥: 바깥 값
// 출력: 안쪽에서 본 전역: 봄날카페

// ✏️ 직접 해보기 2 — 함수 밖에 taxRate 를 만들고, 함수 안에서 써 보세요.


// ── 섹션 3: 같은 이름이면 가까운 쪽이 이긴다 ──

const message = "전역 메시지";

function printMessage() {
  const message = "함수 안 메시지"; // 같은 이름을 다시 만들었습니다
  console.log(message);
}

printMessage();
// 출력: 함수 안 메시지

console.log(message);
// 출력: 전역 메시지

// 함수 안의 message 가 전역 message 를 '가린' 것입니다.
// 전역 변수가 바뀐 건 아닙니다. 함수가 끝나면 원래대로 보입니다.

// 매개변수도 마찬가지입니다.
const price = 1000;

function showPrice(price) {
  console.log("매개변수 price:", price);
}

showPrice(9999);
// 출력: 매개변수 price: 9999
console.log("전역 price:", price);
// 출력: 전역 price: 1000

// ✏️ 직접 해보기 3 — 전역에 count 를 10으로 만들고,
//                    함수 안에서 같은 이름으로 99를 만들어 각각 출력해 보세요.


// ── 섹션 4: 중괄호면 다 스코프다 (if, for) ──

// 함수만이 아니라 if 와 for 의 중괄호도 스코프를 만듭니다.

if (true) {
  const insideIf = "if 안의 변수";
  console.log(insideIf);
}
// 출력: if 안의 변수

// console.log(insideIf);
// 실수: ReferenceError: insideIf is not defined

for (let i = 0; i < 2; i++) {
  const insideFor = `for 안 ${i}`;
  console.log(insideFor);
}
// 출력: for 안 0
// 출력: for 안 1

// console.log(i);
// 실수: ReferenceError: i is not defined
//       for 의 let i 도 중괄호 안에서만 삽니다. (04단원에서 봤죠)

// 그래서 반복문 결과를 밖에서 쓰려면 변수를 밖에 만들어야 합니다.
let total = 0; // 밖에서 만들기

for (let i = 1; i <= 3; i++) {
  total += i; // 안에서 밖의 변수를 고치는 건 됩니다
}

console.log("합계:", total);
// 출력: 합계: 6

// ✏️ 직접 해보기 4 — for 문 안에서만 쓸 변수와, 밖에서도 쓸 변수를
//                    각각 만들어 차이를 확인해 보세요.


// ── 섹션 5: 전역 변수를 함부로 쓰면 안 되는 이유 ──

// 전역 변수는 어디서든 고칠 수 있습니다. 편해 보이지만 위험합니다.

let sharedCount = 0; // 전역

function addOne() {
  sharedCount++;
}

function reset() {
  sharedCount = 0;
}

addOne();
addOne();
console.log("두 번 더한 뒤:", sharedCount);
// 출력: 두 번 더한 뒤: 2

reset();
console.log("리셋 뒤:", sharedCount);
// 출력: 리셋 뒤: 0

// 지금은 함수가 두 개뿐이라 흐름이 보입니다.
// 함수가 50개가 되면 "이 값이 언제 누구에 의해 바뀌었는지" 알 수 없게 됩니다.

// 그래서 이렇게 하세요.
//   1) 값은 매개변수로 받는다
//   2) 결과는 return 으로 돌려준다
//   3) 전역 변수는 정말 안 바뀌는 것(가게 이름, 세율)에만 쓴다

function addOneBetter(count) {
  return count + 1;
}

let myCount = 0;
myCount = addOneBetter(myCount);
myCount = addOneBetter(myCount);
console.log("매개변수/return 방식:", myCount);
// 출력: 매개변수/return 방식: 2

// 이 함수는 밖의 무엇도 건드리지 않습니다.
// 같은 값을 넣으면 항상 같은 결과가 나오니 테스트하기도 쉽습니다.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 함수 안에서 만든 값을 밖에서 쓰려 함
function calc() {
  const answer = 42;
  console.log(answer);
}
calc();
// 출력: 42
// console.log(answer);   ← ReferenceError
// 해결: return 으로 돌려주세요.
function calcBetter() {
  return 42;
}
const answer2 = calcBetter();
console.log(answer2);
// 출력: 42

// [실수 2] let / const 없이 변수 만들기
function makeGlobal() {
  leaked = "실수로 만들어진 전역 변수"; // let, const 가 없습니다
}
makeGlobal();
console.log(leaked);
// 출력: 실수로 만들어진 전역 변수
// 실수: 함수 안에서 만들었는데 밖에서도 보입니다.
//       어디서 만들어졌는지 추적할 수 없는 변수가 생겨 버그의 원인이 됩니다.
//       반드시 const 나 let 을 붙이세요.

// [실수 3] if 안에서 만든 변수를 밖에서 쓰기 (섹션 4에서 봤습니다)
// 해결: if 밖에 let 으로 만들고 안에서 값을 넣거나, 삼항 연산자를 쓰세요.
const grade = 85 >= 80 ? "B" : "C";
console.log(grade);
// 출력: B

// [실수 4] 매개변수 이름과 전역 변수 이름이 같아서 헷갈리기 (섹션 3)
// 문법 문제는 아니지만, 이름을 다르게 지으면 읽기가 훨씬 편합니다.


// ── 정리 ──

// 1. 중괄호 { } 안에서 만든 변수는 그 안에서만 쓸 수 있다.
// 2. 안에서 밖은 보이고, 밖에서 안은 안 보인다.
// 3. 같은 이름이면 가까운(안쪽) 변수가 이긴다. 밖의 값이 바뀌는 건 아니다.
// 4. if, for 의 중괄호도 스코프를 만든다.
// 5. 값은 매개변수로 받고 결과는 return 으로 돌려준다. 전역 변수에 기대지 말 것.
// 6. const / let 없이 변수를 만들면 전역이 새어 나온다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function test1() {
//      const secret = "비밀";
//    }
//    test1();
//    // console.log(secret);   ← ReferenceError: secret is not defined
//
// 2) const taxRate = 0.1;
//    function printTax(price) {
//      console.log(price * taxRate);
//    }
//    printTax(10000);        // 출력: 1000
//
// 3) const count = 10;
//    function showCount() {
//      const count = 99;
//      console.log(count);   // 출력: 99
//    }
//    showCount();
//    console.log(count);     // 출력: 10
//
// 4) let outside = 0;
//    for (let i = 1; i <= 3; i++) {
//      const inside = i * 10;
//      outside += inside;
//      console.log(inside);  // 출력: 10 / 20 / 30
//    }
//    console.log(outside);   // 출력: 60
//    // console.log(inside); ← ReferenceError
