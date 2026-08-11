// ============================================================
// 05단원 · 개념 04 — 함수도 값이다 (함수 표현식)
// ------------------------------------------------------------
// 실행: node 개념04_함수도_값이다.js
// ============================================================
//
// 자바스크립트에서 함수는 특별한 존재가 아니라 '값'입니다.
// 숫자나 문자열처럼 변수에 담고, 넘기고, 돌려줄 수 있습니다.
// 이 성질이 08단원(콜백)의 바탕이 됩니다.


// ── 섹션 1: 함수를 변수에 담기 ──

// [지금까지 쓰던 방법 — 함수 선언식]
function add(a, b) {
  return a + b;
}
console.log(add(3, 4));
// 출력: 7

// [함수 표현식] — 이름 없는 함수를 만들어 변수에 담습니다
const subtract = function (a, b) {
  return a - b;
};

console.log(subtract(10, 3));
// 출력: 7

// 부르는 방법은 똑같습니다. 변수 이름 뒤에 괄호를 붙입니다.
//
// 생김새를 비교해 보세요.
//   function add(a, b) { ... }              ← 이름이 function 뒤에
//   const subtract = function (a, b) { ... };  ← 이름이 변수 쪽에, 끝에 세미콜론
//
// 함수 표현식은 '값을 변수에 넣는 문장'이라 세미콜론으로 끝냅니다.

// 함수가 값이라는 증거를 봅시다.
console.log(typeof add);
// 출력: function
console.log(typeof subtract);
// 출력: function

// ✏️ 직접 해보기 1 — 두 수를 곱하는 함수를 '함수 표현식'으로 만들어
//                    multiply 라는 변수에 담고 불러 보세요.


// ── 섹션 2: 다른 이름을 붙여 쓸 수도 있다 ──

// 함수는 값이므로 다른 변수에 옮겨 담을 수 있습니다.
const plus = add;

console.log(plus(5, 5));
// 출력: 10

// add 와 plus 는 같은 함수를 가리킵니다.
// 괄호 없이 대입했다는 점에 주의하세요. add() 라고 쓰면 '결과값'이 담깁니다.

const addResult = add(1, 2); // 결과인 3이 담깁니다
console.log(addResult);
// 출력: 3
console.log(typeof addResult);
// 출력: number

const addFunction = add; // 함수 자체가 담깁니다
console.log(typeof addFunction);
// 출력: function

// 괄호 하나 차이로 완전히 달라집니다. 앞으로 계속 나오니 확실히 구분하세요.


// ── 섹션 3: 만들기 전에 부를 수 있는가 ──

// 이게 선언식과 표현식의 가장 큰 차이입니다.

// [선언식] 만들기 전에 불러도 됩니다
console.log(sayHello());
// 출력: 안녕하세요

function sayHello() {
  return "안녕하세요";
}

// 자바스크립트가 실행 전에 함수 선언을 먼저 훑어서 미리 등록해 두기 때문입니다.
// 이것을 '호이스팅(끌어올리기)'이라고 합니다.

// [표현식] 만들기 전에 부르면 에러입니다
// console.log(sayBye());
// const sayBye = function () {
//   return "안녕히 가세요";
// };
// 실수: ReferenceError: Cannot access 'sayBye' before initialization
//
// const 로 만든 변수는 그 줄에 도달해야 값이 들어가기 때문입니다.

const sayBye = function () {
  return "안녕히 가세요";
};
console.log(sayBye());
// 출력: 안녕히 가세요

// 그럼 뭘 써야 할까요?
//   호이스팅에 기대는 코드는 읽기 어렵습니다. 위에서 아래로 읽히지 않으니까요.
//   그래서 실무에서는 "만든 다음에 부른다"는 순서를 지키는 편이고,
//   표현식(특히 다음 파일의 화살표 함수)을 더 많이 씁니다.


// ── 섹션 4: 함수를 다른 함수에 넘기기 ──

// 함수가 값이라면 인자로도 넘길 수 있습니다.

function callTwice(fn) {
  fn(); // 넘겨받은 함수를 실행합니다
  fn();
}

function printHi() {
  console.log("안녕!");
}

callTwice(printHi);
// 출력: 안녕!
// 출력: 안녕!

// 넘길 때는 괄호를 붙이지 않습니다. printHi 라고만 씁니다.
// printHi() 라고 쓰면 '실행 결과(undefined)'가 넘어가 버립니다.

// callTwice(printHi());
// 실수: TypeError: fn is not a function
//       undefined 를 실행하려 했기 때문입니다.

// 계산 방법 자체를 넘길 수도 있습니다.
function calculate(a, b, operation) {
  return operation(a, b);
}

console.log(calculate(10, 3, add));
// 출력: 13
console.log(calculate(10, 3, subtract));
// 출력: 7

// 같은 calculate 인데 넘긴 함수에 따라 더하기도 하고 빼기도 합니다.
// 이렇게 '넘겨받아 나중에 실행되는 함수'를 콜백이라고 부릅니다.
// 08단원에서 본격적으로 배웁니다.

// ✏️ 직접 해보기 2 — calculate 에 곱하기 함수를 넘겨 10 × 3 을 구해 보세요.


// ── 섹션 5: 이름 없는 함수를 바로 넘기기 ──

// 한 번만 쓸 함수라면 변수에 담지 않고 그 자리에서 만들어 넘깁니다.
console.log(
  calculate(10, 3, function (a, b) {
    return a * b;
  })
);
// 출력: 30

// 괄호 안에 함수가 통째로 들어가 있어서 처음엔 눈이 어지럽습니다.
// 다음 파일에서 배울 화살표 함수를 쓰면 이게 훨씬 짧아집니다.


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 함수를 넘길 때 괄호를 붙임 (섹션 4에서 봤습니다)
//   callTwice(printHi)    ← 함수를 넘김 (맞음)
//   callTwice(printHi())  ← 실행 결과를 넘김 (틀림)

// [실수 2] 함수 표현식 끝에 세미콜론을 안 붙임
// const f = function () { }    ← 세미콜론 빠짐
// 실수: 대부분 동작하지만, 다음 줄이 괄호로 시작하면 이어진 코드로 해석되어
//       이상한 에러가 납니다. 표현식은 세미콜론으로 끝내세요.

// [실수 3] 표현식을 만들기 전에 호출 (섹션 3에서 봤습니다)

// [실수 4] 함수 안에서 자기 자신 이름을 잘못 부르기
// const greet = function () { greeting(); };
// 실수: 변수 이름은 greet 인데 greeting 을 불렀습니다. ReferenceError.
//       표현식은 변수 이름으로 부른다는 것을 기억하세요.


// ── 정리 ──

// 1. 함수는 값이다. typeof 는 "function".
// 2. const 이름 = function (매개변수) { ... };  ← 함수 표현식, 끝에 세미콜론
// 3. 선언식은 만들기 전에도 부를 수 있고(호이스팅), 표현식은 안 된다.
// 4. 함수를 넘길 때는 괄호를 붙이지 않는다. 붙이면 '결과'가 넘어간다.
// 5. 넘겨받아 나중에 실행되는 함수를 콜백이라고 한다. (08단원)


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const multiply = function (a, b) {
//      return a * b;
//    };
//    console.log(multiply(3, 4));       // 출력: 12
//
// 2) console.log(calculate(10, 3, multiply));   // 출력: 30
//    또는 그 자리에서 만들어 넘기기:
//    console.log(calculate(10, 3, function (a, b) { return a * b; }));
