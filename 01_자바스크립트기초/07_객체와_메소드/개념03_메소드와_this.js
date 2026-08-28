// ============================================================
// 07단원 · 개념 03 — 메소드와 this
// ------------------------------------------------------------
// 실행: node 개념03_메소드와_this.js
// ============================================================
//
// 객체의 값에는 함수도 들어갈 수 있습니다.
// 객체 안에 들어 있는 함수를 '메소드'라고 부릅니다.
//
// 사실 우리는 이미 계속 써 왔습니다.
//     배열.push()   ← 배열이라는 객체의 메소드
//     문자열.split() ← 문자열의 메소드
//     console.log()  ← console 이라는 객체의 log 메소드


// ── 섹션 1: 객체 안에 함수 넣기 ──

const counter = {
  count: 0,
  increase: function () {
    console.log("증가시킵니다");
  },
};

counter.increase();
// 출력: 증가시킵니다

// 값을 꺼낼 때처럼 점으로 접근하고, 뒤에 괄호를 붙여 실행합니다.
//     counter.count      ← 속성 (값)
//     counter.increase() ← 메소드 (실행)

// 괄호를 빼면 함수 자체가 나옵니다. (05단원에서 배웠죠)
console.log(typeof counter.increase);
// 출력: function

// ✏️ 직접 해보기 1 — greet 라는 메소드를 가진 객체를 만들어
//                    "안녕하세요" 를 출력해 보세요.


// ── 섹션 2: 줄여 쓰기 ──

// function 이라는 글자를 생략할 수 있습니다. 요즘은 이 형태를 씁니다.
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

console.log(calculator.add(3, 4));
// 출력: 7
console.log(calculator.subtract(10, 3));
// 출력: 7

// 세 가지 다 같은 뜻입니다.
//   add: function (a, b) { ... }   ← 옛날 방식
//   add(a, b) { ... }              ← 줄여 쓰기 (권장)
//   add: (a, b) => { ... }         ← 화살표 (this 때문에 주의, 섹션 5)

// ✏️ 직접 해보기 2 — 곱하기 메소드를 줄여 쓰기 형태로 추가해 보세요.


// ── 섹션 3: this — 나를 부른 객체 ──

// 메소드 안에서 같은 객체의 다른 속성을 쓰려면 this 를 씁니다.

const user = {
  name: "김민준",
  age: 20,
  introduce() {
    console.log(`저는 ${this.name}이고 ${this.age}살입니다`);
  },
};

user.introduce();
// 출력: 저는 김민준이고 20살입니다

// this 는 "이 메소드를 부른 객체"를 가리킵니다.
// user.introduce() 라고 불렀으니 this 는 user 입니다.
//
// 외우기 쉬운 규칙 하나만 기억하세요.
//
//     this = 부를 때 점( . ) 왼쪽에 있는 것
//
//     user.introduce()
//     ────
//     이것이 this
//
// 이 규칙 하나로 이 파일의 모든 경우가 설명됩니다.
// 점 왼쪽에 아무것도 없이 그냥 introduce() 로 부르면?
// 가리킬 것이 없어집니다. 그게 뒤에 나오는 실수의 정체입니다.

// this 를 빼면 어떻게 될까요?
const user2 = {
  name: "이서연",
  introduceBad() {
    // console.log(name);
    // 실수: ReferenceError. name 이라는 변수는 어디에도 없습니다.
    //       객체 안이라고 해서 속성 이름을 그냥 쓸 수는 없습니다.
    console.log(this.name);
  },
};
user2.introduceBad();
// 출력: 이서연

// 값을 고치는 메소드도 만들 수 있습니다.
const counter2 = {
  count: 0,
  increase() {
    this.count++;
  },
  show() {
    console.log(`현재 ${this.count}회`);
  },
};

counter2.increase();
counter2.increase();
counter2.show();
// 출력: 현재 2회

// ✏️ 직접 해보기 3 — price 속성과, 그 값을 10% 올리는 메소드를 가진
//                    객체를 만들어 보세요.


// ── 섹션 4: this 대신 객체 이름을 써도 될까 ──

// 됩니다. 하지만 문제가 있습니다.
const product = {
  name: "이어폰",
  showName() {
    console.log(product.name); // this 대신 객체 이름
  },
};

product.showName();
// 출력: 이어폰

// 잘 됩니다. 그런데 이 객체를 복사해서 쓰는 순간 깨집니다.
const product2 = { ...product }; // 내용을 복사한 새 객체 (09단원에서 배웁니다)
product2.name = "블루투스 스피커";

product2.showName();
// 출력: 이어폰
// product2 의 이름은 "블루투스 스피커" 인데 "이어폰" 이 나왔습니다.
// showName 안이 product 라는 '이름' 을 직접 가리키고 있어서,
// 복사본으로 불러도 원래 객체를 읽어 버리기 때문입니다.

// this 를 쓰면 이름과 상관없이 "나를 부른 객체" 를 따라갑니다.
// 객체를 복사하거나 이름을 바꿔도 안전합니다.
// 그래서 메소드 안에서는 this 를 쓰는 것이 약속입니다.


// ── 섹션 5: 화살표 함수는 자기 this 가 없다 ──

// 이게 화살표 함수의 유일한 함정입니다.

const badUser = {
  name: "박지훈",
  introduce: () => {
    console.log(`저는 ${this.name}입니다`);
  },
};

badUser.introduce();
// 출력: 저는 undefined입니다

// 왜 undefined 일까요?
//   화살표 함수는 자기만의 this 를 만들지 않습니다.
//   그래서 this 가 badUser 가 아니라 '바깥의 this' 를 그대로 씁니다.
//   지금은 파일 맨 바깥이라 거기에 name 이 없어서 undefined 입니다.

// 일반 함수(줄여 쓰기)로 바꾸면 정상입니다.
const goodUser = {
  name: "박지훈",
  introduce() {
    console.log(`저는 ${this.name}입니다`);
  },
};

goodUser.introduce();
// 출력: 저는 박지훈입니다

// 규칙 하나만 기억하세요.
//     객체의 메소드는 화살표 함수로 만들지 않는다.
//
// 반대로 08단원에서 배울 콜백(배열 메소드에 넘기는 함수)에서는
// 화살표 함수가 오히려 안전합니다. 그때 다시 설명합니다.

// ✏️ 직접 해보기 4 — 위 badUser 를 정상 동작하도록 고쳐 보세요.


// ── 섹션 6: 우리가 이미 쓰던 것들도 메소드였다 ──

const list = [3, 1, 2];
list.push(4); // 배열 객체의 메소드
console.log(list);
// 출력: [ 3, 1, 2, 4 ]

const text = "안녕하세요";
console.log(text.includes("안녕")); // 문자열의 메소드
// 출력: true

console.log(Math.round(3.7)); // Math 라는 객체의 메소드
// 출력: 4

console.log(Math.PI); // Math 의 속성 (괄호 없음)
// 출력: 3.141592653589793

// 괄호가 붙으면 메소드, 안 붙으면 속성입니다.
//     배열.length     속성 (괄호 없음)
//     배열.push()     메소드 (괄호 있음)
// 이 구분을 헷갈리면 "is not a function" 에러가 납니다.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 메소드에 괄호를 안 붙임
console.log(calculator.add);
// 출력: [Function: add]
// 실수: 실행 결과가 아니라 함수 자체가 나옵니다. add(1, 2) 로 써야 합니다.

// [실수 2] 메소드 안에서 this 를 빼먹기 (섹션 3에서 봤습니다)

// [실수 3] 객체 메소드를 화살표 함수로 만들기 (섹션 5)

// [실수 4] 메소드를 꺼내서 따로 부르기
const introduceFn = goodUser.introduce;
introduceFn();
// 출력: 저는 undefined입니다
// 실수: 에러가 나지 않습니다. 값만 조용히 틀리게 나옵니다. 그래서 더 위험합니다.
//       goodUser.introduce() 가 아니라 그냥 introduceFn() 으로 불렀기 때문에
//       "나를 부른 객체" 가 없어서 this 가 goodUser 를 가리키지 못합니다.
//       메소드는 반드시 객체에 붙여서 부르세요.
goodUser.introduce();
// 출력: 저는 박지훈입니다

// [실수 5] 속성 뒤에 괄호를 붙임
// console.log(list.length());
// 실수: TypeError: list.length is not a function


// ── 정리 ──

// 1. 객체 안의 함수를 메소드라고 한다. 객체.메소드() 로 부른다.
// 2. 줄여 쓰기: { add(a, b) { ... } }
// 3. 메소드 안에서 같은 객체의 속성을 쓰려면 this.속성 이라고 쓴다.
// 4. this 는 "나를 부른 객체" 다.
// 5. 객체의 메소드는 화살표 함수로 만들지 않는다. this 가 사라진다.
// 6. 속성은 괄호 없이, 메소드는 괄호를 붙여서.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const hello = {
//      greet() {
//        console.log("안녕하세요");
//      },
//    };
//    hello.greet();               // 출력: 안녕하세요
//
// 2) const calc = {
//      multiply(a, b) {
//        return a * b;
//      },
//    };
//    console.log(calc.multiply(3, 4));   // 출력: 12
//
// 3) const item = {
//      price: 10000,
//      raise() {
//        this.price = Math.round(this.price * 1.1);
//      },
//    };
//    item.raise();
//    console.log(item.price);     // 출력: 11000
//
// 4) introduce: () => { ... } 를
//    introduce() { ... } 로 바꾸면 됩니다.
