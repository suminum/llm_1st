// ============================================================
// 05단원 심화문제 정답
// ------------------------------------------------------------
// 실행: node 심화문제_정답.js
// ============================================================


// ───── 심화 1 ─────
function getSubtotal(price, count) {
  return price * count;
}

function applyDiscount(total, isMember) {
  if (!isMember) {
    return total; // 조기 반환 — 회원이 아니면 여기서 끝
  }
  return Math.round(total * 0.9);
}

function addTax(total) {
  return Math.round(total * 1.1);
}

console.log(getSubtotal(1200, 5));
// 출력: 6000
console.log(applyDiscount(getSubtotal(1200, 5), true));
// 출력: 5400
console.log(addTax(applyDiscount(getSubtotal(1200, 5), true)));
// 출력: 5940

// 안쪽부터 바깥쪽으로 읽습니다.
//   getSubtotal(1200, 5)          →  6000
//   applyDiscount(6000, true)     →  5400
//   addTax(5400)                  →  5940
//
// 왜 이렇게 나누나
//   함수 하나가 한 가지 일만 하면, 그중 하나가 바뀌어도 거기만 고치면 됩니다.
//   부가세율이 바뀌면 addTax 만 고칩니다. 나머지는 건드릴 필요가 없습니다.
//
// 다만 너무 깊게 겹치면 읽기 어렵습니다. 실무에서는 이렇게 나눠 쓰기도 합니다.
//   const subtotal = getSubtotal(1200, 5);
//   const discounted = applyDiscount(subtotal, true);
//   const final = addTax(discounted);
//   중간 이름이 설명 역할을 해서 오히려 읽기 좋습니다.


// ───── 심화 2 ─────
function makeGreeter(greeting) {
  return (name) => `${greeting}, ${name}님`;
}

const hello = makeGreeter("안녕하세요");
const nice = makeGreeter("반갑습니다");

console.log(hello("김민준"));
// 출력: 안녕하세요, 김민준님
console.log(nice("이서연"));
// 출력: 반갑습니다, 이서연님
console.log(hello("박지훈"));
// 출력: 안녕하세요, 박지훈님

// 무슨 일이 일어난 건가
//   makeGreeter("안녕하세요") 를 부르면 계산 결과가 아니라 '함수' 가 나옵니다.
//   그 함수는 자기가 태어날 때 받았던 greeting 을 계속 기억합니다.
//
//   hello 와 nice 는 생김새가 같은 함수지만 기억하는 인사말이 다릅니다.
//   그래서 hello("박지훈") 은 몇 번을 불러도 "안녕하세요" 를 씁니다.
//
// 이게 왜 쓸모 있나
//   "설정을 미리 넣어 둔 함수" 를 만들 수 있습니다.
//   08단원에서 콜백을 배우면 이 방식이 자주 나옵니다.
//   React 에서도 이벤트 핸들러를 만들 때 이 모양을 씁니다.
//
//   const 삭제하기 = (id) => () => remove(id);
//   버튼마다 다른 id 를 미리 넣어 둔 함수를 만들어 주는 것입니다.
//
// 이것을 클로저(closure)라고 부릅니다.
// 이름은 몰라도 됩니다. "안쪽 함수가 바깥 값을 기억한다" 만 기억하세요.


// ───── 심화 3 ─────
let message = "바깥";

function test() {
  console.log(message);
  let message2 = "안쪽";
  console.log(message2);
}

test();
// 출력: 바깥
// 출력: 안쪽
console.log(message);
// 출력: 바깥

function test2() {
  let message = "안에서 새로 만든 것";
  console.log(message);
}

test2();
// 출력: 안에서 새로 만든 것
console.log(message);
// 출력: 바깥

// 왜 바깥 message 가 안 바뀌었나
//   test2 안의 let message 는 '바깥 것을 고친 것' 이 아니라
//   '같은 이름의 새 변수를 안쪽에 하나 더 만든 것' 입니다.
//   함수가 끝나면 안쪽 것은 사라지고, 바깥 것은 처음부터 손댄 적이 없습니다.
//
//   안에서 밖은 보이지만(test 에서 message 를 읽었죠),
//   안에서 새로 만들면 그건 별개입니다. 이것을 '가려짐(shadowing)' 이라고 합니다.
//
// 진짜 바깥 것을 바꾸고 싶었다면 let 을 빼야 합니다.
//
//   function test3() {
//     message = "진짜로 바꿈";   ← let 없이 쓰면 바깥 것을 고칩니다
//   }
//
//   다만 이렇게 바깥 값을 함수가 몰래 바꾸면
//   나중에 "누가 이 값을 바꿨지?" 를 찾기 어려워집니다.
//   필요한 값은 매개변수로 받고, 결과는 return 으로 돌려주는 편이 안전합니다.
