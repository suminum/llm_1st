// ============================================================
// 05단원 · 개념 05 — 화살표 함수
// ------------------------------------------------------------
// 실행: node 개념05_화살표함수.js
// ============================================================
//
// 함수 표현식을 더 짧게 쓰는 문법입니다. 요즘 코드는 대부분 이걸 씁니다.
// React 를 배울 때도 계속 나오니 눈에 익혀 두세요.
//
//     const 이름 = (매개변수) => { 코드 };
//                              ^^
//                              화살표 (= 와 > 를 붙여서 씁니다)


// ── 섹션 1: function 을 화살표로 바꾸기 ──

// [함수 표현식]
const add1 = function (a, b) {
  return a + b;
};
console.log(add1(3, 4));
// 출력: 7

// [화살표 함수] — function 을 지우고, 괄호와 중괄호 사이에 => 를 넣습니다
const add2 = (a, b) => {
  return a + b;
};
console.log(add2(3, 4));
// 출력: 7

// 바뀐 것은 딱 두 가지입니다.
//   1) function 이라는 글자를 지운다
//   2) 매개변수 괄호와 중괄호 사이에 => 를 넣는다

// ✏️ 직접 해보기 1 — 아래 함수를 화살표 함수로 바꿔 보세요.
//                    const sub = function (a, b) { return a - b; };


// ── 섹션 2: 줄여 쓰기 3단계 ──

// 화살표 함수는 조건이 맞으면 더 줄일 수 있습니다.

// [1단계] 기본형
const square1 = (n) => {
  return n * n;
};
console.log(square1(5));
// 출력: 25

// [2단계] 몸통이 return 한 줄뿐이면 → 중괄호와 return 을 함께 생략
const square2 = (n) => n * n;
console.log(square2(5));
// 출력: 25

// 중괄호를 없애면 "이 식의 결과를 돌려준다"는 뜻이 됩니다.
// 중괄호와 return 은 반드시 같이 지워야 합니다. 하나만 지우면 이렇게 됩니다.
//
//   (n) => return n * n     중괄호만 지움  → SyntaxError. 바로 알 수 있습니다.
//   (n) => { n * n }        return 만 지움 → 에러 없이 조용히 undefined  ← 이쪽이 위험
//
// 아래쪽이 훨씬 무섭습니다. 에러가 안 나니 어디가 잘못됐는지 알 수가 없습니다.
// 섹션 4에서 실제로 확인합니다.

// [3단계] 매개변수가 딱 하나면 → 괄호도 생략 가능
const square3 = n => n * n;
console.log(square3(5));
// 출력: 25

// 셋 다 완전히 같은 함수입니다.
// 다만 3단계는 취향이 갈립니다. 매개변수 괄호는 남겨 두는 편이
// 나중에 매개변수를 추가할 때 편하고 보기에도 일관돼서 권장됩니다.

// ✏️ 직접 해보기 2 — 숫자를 두 배로 만드는 함수를 2단계 형태로 써 보세요.


// ── 섹션 3: 매개변수 개수에 따른 형태 ──

// [0개] 빈 괄호가 반드시 필요합니다
const sayHi = () => {
  console.log("안녕하세요");
};
sayHi();
// 출력: 안녕하세요

const getPi = () => 3.14;
console.log(getPi());
// 출력: 3.14

// [1개] 괄호 생략 가능
const double = (n) => n * 2;
console.log(double(7));
// 출력: 14

// [2개 이상] 괄호 필수
const sum = (a, b) => a + b;
console.log(sum(1, 2));
// 출력: 3

const sum3 = (a, b, c) => a + b + c;
console.log(sum3(1, 2, 3));
// 출력: 6

// [기본값도 그대로 쓸 수 있습니다]
const greet = (name = "손님") => `${name}, 어서 오세요`;
console.log(greet());
// 출력: 손님, 어서 오세요
console.log(greet("김민준"));
// 출력: 김민준, 어서 오세요

// ✏️ 직접 해보기 3 — 매개변수가 없고 "오늘도 화이팅" 을 돌려주는
//                    화살표 함수를 만들어 보세요.


// ── 섹션 4: 여러 줄이면 중괄호와 return 을 쓴다 ──

// 몸통이 두 줄 이상이면 줄여 쓸 수 없습니다.
const getDiscountPrice = (price, rate) => {
  const discount = price * rate;
  const final = price - discount;
  return final;
};

console.log(getDiscountPrice(10000, 0.2));
// 출력: 8000

// 중괄호를 썼다면 return 을 반드시 써야 합니다.
const broken = (price) => {
  price * 2; // return 이 없습니다
};
console.log(broken(100));
// 출력: undefined
// 아주 흔한 실수입니다. 중괄호를 쓰는 순간 return 이 필요합니다.

// ✏️ 직접 해보기 4 — 가격과 개수를 받아 "총액에 10% 세금을 더한 값" 을
//                    돌려주는 화살표 함수를 여러 줄로 써 보세요. (4500원 2개 → 9900)


// ── 섹션 5: 조건과 함께 쓰기 ──

// 삼항 연산자와 화살표 함수는 궁합이 좋습니다.
const isAdult = (age) => age >= 19;
console.log(isAdult(20));
// 출력: true

const getGrade = (score) => (score >= 90 ? "A" : "B");
console.log(getGrade(95));
// 출력: A
console.log(getGrade(80));
// 출력: B

// 갈림길이 셋 이상이면 중괄호를 쓰고 조기 반환을 씁니다.
const getGrade2 = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "F";
};
console.log(getGrade2(85));
// 출력: B

// ✏️ 직접 해보기 5 — 나이를 받아 19 이상이면 "성인", 아니면 "미성년자" 를
//                    돌려주는 화살표 함수를 삼항 연산자로 써 보세요.


// ── 섹션 6: 화살표 함수의 주의점 ──

// [1] 호이스팅이 안 됩니다
// 화살표 함수는 함수 표현식이라 만들기 전에 부를 수 없습니다.
// console.log(later());
// const later = () => "나중";
// 실수: ReferenceError: Cannot access 'later' before initialization

// [2] this 가 다릅니다
// 화살표 함수는 자기만의 this 를 갖지 않습니다.
// this 는 07단원(객체의 메소드)에서 배웁니다. 그때 다시 비교합니다.
// 지금은 "객체의 메소드를 만들 때는 화살표 함수를 쓰지 않는다" 만 기억하세요.

// [3] 객체를 바로 돌려줄 때는 괄호가 필요합니다
// 07단원에서 객체를 배우고 나면 다시 만날 규칙입니다.
// const makeUser = (name) => ({ name: name });   ← 중괄호를 소괄호로 감쌉니다


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 중괄호를 쓰고 return 을 빠뜨림 (섹션 4에서 봤습니다)
//   (n) => { n * 2 }     ← undefined
//   (n) => n * 2         ← 맞음
//   (n) => { return n * 2; }  ← 맞음

// [실수 2] 화살표를 =< 나 -> 로 씀 → SyntaxError
// const f = (n) -> n * 2;
// 실수: 반드시 = 다음에 > 입니다. => 입니다.

// [실수 3] 비교 연산자 >= 와 헷갈림
const check = (n) => n >= 10;
console.log(check(15));
// 출력: true
// => 는 화살표, >= 는 '크거나 같다'. 순서가 반대입니다.

// [실수 4] 매개변수가 0개인데 괄호를 뺌 → SyntaxError
// const f2 = => "안녕";
// 실수: 매개변수가 없어도 빈 괄호 ( ) 는 있어야 합니다.


// ── 정리 ──

// 1. const 이름 = (매개변수) => { 코드 };
// 2. return 한 줄이면 중괄호와 return 을 같이 생략할 수 있다.
// 3. 매개변수 0개면 빈 괄호 필수, 1개면 괄호 생략 가능, 2개 이상은 필수.
// 4. 중괄호를 쓰면 return 을 반드시 써야 한다. 안 쓰면 undefined.
// 5. 화살표 함수는 호이스팅되지 않는다. 만든 다음에 부를 것.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const sub = (a, b) => {
//      return a - b;
//    };
//    또는 줄여서: const sub = (a, b) => a - b;
//
// 2) const twice = (n) => n * 2;
//    console.log(twice(7));            // 출력: 14
//
// 3) const cheer = () => "오늘도 화이팅";
//    console.log(cheer());             // 출력: 오늘도 화이팅
//
// 4) const getTotalWithTax = (price, count) => {
//      const total = price * count;
//      return total + total * 0.1;
//    };
//    console.log(getTotalWithTax(4500, 2));   // 출력: 9900
//
// 5) const checkAge = (age) => (age >= 19 ? "성인" : "미성년자");
//    console.log(checkAge(20));        // 출력: 성인
