// ============================================================
// 09단원 · 개념 05 — 나머지 매개변수
// ------------------------------------------------------------
// 실행: node 개념05_나머지_매개변수.js
// ============================================================
//
// 함수가 인자를 몇 개 받을지 모를 때 씁니다.
//
//     function sum(...numbers) { ... }
//     sum(1, 2)        → numbers 는 [1, 2]
//     sum(1, 2, 3, 4)  → numbers 는 [1, 2, 3, 4]
//
// 넘어온 인자들을 '배열로 모아 줍니다'.


// ── 섹션 1: 인자를 배열로 모으기 ──

function showAll(...args) {
  console.log(args);
}

showAll(1, 2, 3);
// 출력: [ 1, 2, 3 ]
showAll("가", "나");
// 출력: [ '가', '나' ]
showAll();
// 출력: []

// 배열이므로 06·08단원의 메소드를 전부 쓸 수 있습니다.
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

console.log(sum(1, 2));
// 출력: 3
console.log(sum(1, 2, 3, 4, 5));
// 출력: 15
console.log(sum());
// 출력: 0
// reduce 에 시작값 0 을 줬기 때문에 빈 배열도 에러가 안 납니다.

// ✏️ 직접 해보기 1 — 넘어온 값들의 개수를 돌려주는 함수를 만들어 보세요.


// ── 섹션 2: 앞에 고정 매개변수 두기 ──

// 앞에는 정해진 매개변수를, 뒤에는 나머지를 둘 수 있습니다.
function introduce(name, ...hobbies) {
  // join 의 결과가 빈 문자열이면 falsy 이므로 || 로 기본값을 줍니다 (02단원)
  console.log(`${name}의 취미: ${hobbies.join(", ") || "(없음)"}`);
}

introduce("김민준", "독서", "등산", "요리");
// 출력: 김민준의 취미: 독서, 등산, 요리

introduce("이서연", "영화");
// 출력: 이서연의 취미: 영화

introduce("박지훈");
// 출력: 박지훈의 취미: (없음)
// 취미를 안 넘기면 hobbies 는 빈 배열이라 join 의 결과가 빈 문자열입니다.

// [규칙] 나머지 매개변수는 반드시 맨 마지막에 하나만 쓸 수 있습니다.
// function bad(...args, last) { }
// 실수: SyntaxError: Rest parameter must be last formal parameter

// ✏️ 직접 해보기 2 — 첫 인자를 제목으로, 나머지를 목록으로 출력하는
//                    함수를 만들어 보세요.


// ── 섹션 3: 스프레드와 나머지 — 같은 ... 인데 반대다 ──

// 헷갈리기 쉬운데, 어디에 쓰였는지로 구분합니다.
//
//     받는 쪽(왼쪽)에 있으면  →  모으기 (나머지)
//     주는 쪽(오른쪽)에 있으면 →  펼치기 (스프레드)

// [모으기] 함수를 만들 때 = 받는 쪽
function collect(...values) {
  return values;
}
console.log(collect(1, 2, 3));
// 출력: [ 1, 2, 3 ]

// [펼치기] 함수를 부를 때 = 주는 쪽
const numbers = [1, 2, 3];
console.log(collect(...numbers));
// 출력: [ 1, 2, 3 ]

// 구조분해에서도 같습니다.
// [모으기] const 왼쪽
const [head, ...tail] = [1, 2, 3, 4];
console.log(head, tail);
// 출력: 1 [ 2, 3, 4 ]

// [펼치기] = 오른쪽
const merged = [0, ...tail];
console.log(merged);
// 출력: [ 0, 2, 3, 4 ]

// 한 줄로 정리하면:
//     = 왼쪽 / function 괄호 안  →  모은다
//     = 오른쪽 / 함수 호출 괄호 안 →  펼친다

// ✏️ 직접 해보기 3 — 배열 [10, 20, 30] 을 collect 에 펼쳐 넘겨 보세요.


// ── 섹션 4: 둘을 같이 쓰기 ──

// 받아서 모으고, 다시 펼쳐 넘기는 패턴입니다.
function logWithTime(...args) {
  console.log("[기록]", ...args);
}

logWithTime("사용자", "김민준", "로그인");
// 출력: [기록] 사용자 김민준 로그인

// args 를 그냥 넘기면 배열째로 찍힙니다.
function logWrong(...args) {
  console.log("[기록]", args);
}
logWrong("사용자", "김민준");
// 출력: [기록] [ '사용자', '김민준' ]

// 함수를 감싸서 기능을 덧붙일 때 이 패턴을 씁니다.
function multiply(a, b) {
  return a * b;
}

function loggedMultiply(...args) {
  console.log(`multiply(${args.join(", ")}) 호출됨`);
  return multiply(...args);
}

console.log(loggedMultiply(3, 4));
// 출력: multiply(3, 4) 호출됨
// 출력: 12


// ── 섹션 5: 실전에서 쓰는 모습 ──

// [평균 구하기]
function average(...scores) {
  if (scores.length === 0) {
    return 0; // 조기 반환으로 0으로 나누는 것을 막습니다
  }
  const total = scores.reduce((acc, n) => acc + n, 0);
  return total / scores.length;
}

console.log(average(90, 80, 70));
// 출력: 80
console.log(average());
// 출력: 0

// [최댓값]
function max(...numbers) {
  return Math.max(...numbers);
}
console.log(max(3, 9, 5));
// 출력: 9
// 받을 때 모으고, 넘길 때 펼칩니다. 한 줄에 둘 다 나옵니다.

// [문자열 잇기]
function joinWords(separator, ...words) {
  return words.join(separator);
}
console.log(joinWords(" - ", "월", "화", "수"));
// 출력: 월 - 화 - 수

// ✏️ 직접 해보기 4 — 넘어온 숫자 중 짝수만 골라 배열로 돌려주는 함수를 만들어 보세요.


// ── 섹션 6: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] 나머지 매개변수를 앞이나 중간에 씀 (섹션 2에서 봤습니다)

// [실수 2] 배열을 그냥 넘기고 모아질 거라 기대
console.log(sum([1, 2, 3]));
// 출력: 01,2,3
// 실수: 배열 하나가 인자로 들어가 numbers 는 [[1, 2, 3]] 이 됩니다.
//       reduce 가 0 + [1, 2, 3] 을 계산하는데, 한쪽이 배열이라
//       문자열 "0" 과 "1,2,3" 이 이어붙어 버렸습니다.
console.log(sum(...[1, 2, 3]));
// 출력: 6
// 펼쳐서 넘겨야 합니다.

// [실수 3] 나머지 매개변수를 배열이 아니라고 생각
function check(...args) {
  console.log(Array.isArray(args));
}
check(1, 2);
// 출력: true
// 항상 배열입니다. 인자를 하나만 넘겨도, 아예 안 넘겨도 배열입니다.

// [실수 4] 화살표 함수에서 괄호를 빼먹기
// const f = ...args => args;
// 실수: SyntaxError. 나머지 매개변수를 쓸 때는 괄호가 필요합니다.
const f = (...args) => args;
console.log(f(1, 2));
// 출력: [ 1, 2 ]


// ── 정리 ──

// 1. function f(...args) — 넘어온 인자들을 배열로 모은다.
// 2. 반드시 맨 마지막에 하나만 쓸 수 있다.
// 3. 받는 쪽(왼쪽)이면 모으기, 주는 쪽(오른쪽)이면 펼치기.
// 4. 모아서 다시 펼쳐 넘기는 패턴을 자주 쓴다: f(...args)
// 5. 배열이므로 reduce, filter, join 을 바로 쓸 수 있다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function countArgs(...args) {
//      return args.length;
//    }
//    console.log(countArgs(1, 2, 3));       // 출력: 3
//
// 2) function printList(title, ...items) {
//      console.log(title);
//      items.forEach((item, i) => console.log(`${i + 1}. ${item}`));
//    }
//    printList("할 일", "장보기", "청소");
//    // 출력: 할 일 / 1. 장보기 / 2. 청소
//
// 3) console.log(collect(...[10, 20, 30]));  // 출력: [ 10, 20, 30 ]
//
// 4) function onlyEven(...numbers) {
//      return numbers.filter((n) => n % 2 === 0);
//    }
//    console.log(onlyEven(1, 2, 3, 4));      // 출력: [ 2, 4 ]
