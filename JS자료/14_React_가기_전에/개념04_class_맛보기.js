// ============================================================
// 14단원 · 개념 04 — class 맛보기
// ------------------------------------------------------------
// 실행: node 개념04_class_맛보기.js
// ============================================================
//
// 먼저 솔직하게 말씀드립니다.
//
//   이 자료를 여기까지 배운 것만으로 앱을 만들 수 있습니다.
//   class 를 몰라도 됩니다. 요즘 React 도 class 를 쓰지 않습니다.
//
// 그런데도 배우는 이유는 하나입니다.
//   남이 쓴 코드에 나오기 때문입니다.
//   인터넷 예제, 회사 코드, 오래된 라이브러리에 흔합니다.
//   "쓸 줄 아는 것" 보다 "읽을 줄 아는 것" 이 목표입니다.
//
// 그래서 이 파일은 짧습니다. 부담 없이 읽으세요.

// ── 섹션 1: 같은 모양을 여러 개 만들어야 할 때 ──

// 07단원 방식으로 학생 세 명을 만들어 봅시다.
const student1 = { name: "김민준", score: 90 };
const student2 = { name: "이서연", score: 95 };
const student3 = { name: "박지훈", score: 60 };

console.log(student1.name, student2.name, student3.name);
// 출력: 김민준 이서연 박지훈

// 세 명이면 괜찮습니다. 그런데 30명이면요?
// 게다가 "합격인지 알려 주는 기능" 을 붙이고 싶다면
// 객체 30개에 똑같은 함수를 30번 써야 합니다.
//
// 05단원에서 배운 대로, 반복되면 함수로 묶습니다.
// class 는 '객체를 찍어 내는 틀' 을 만드는 문법입니다.

// ── 섹션 2: class 로 틀 만들기 ──

class Student {
  // constructor 는 new 로 만들 때 딱 한 번 실행되는 특별한 함수입니다.
  // "처음 값을 채워 넣는 곳" 이라고 생각하면 됩니다.
  constructor(name, score) {
    this.name = name; // this 는 '지금 만들어지는 그 객체'
    this.score = score;
  }
}

const s1 = new Student("김민준", 90);
const s2 = new Student("이서연", 95);

console.log(s1.name, s1.score);
// 출력: 김민준 90
console.log(s2.name, s2.score);
// 출력: 이서연 95

// 만들어진 것은 그냥 객체입니다. 07단원에서 쓰던 것과 똑같이 다룹니다.
console.log(typeof s1);
// 출력: object

// class 이름은 첫 글자를 대문자로 씁니다. 약속입니다.
//     Student, Product, Timer   ← class
//     student, product, timer   ← 그냥 변수

// ✏️ 직접 해보기 1 — Student 로 자기 이름과 점수를 넣은 객체를 만들어 출력해 보세요.

// ── 섹션 3: 메소드 — 틀에 기능 붙이기 ──

class Product {
  constructor(name, price, stock) {
    this.name = name;
    this.price = price;
    this.stock = stock;
  }

  // 07단원의 '줄여 쓰기' 와 모양이 같습니다. function 을 안 씁니다.
  isSoldOut() {
    return this.stock === 0;
  }

  totalValue() {
    return this.price * this.stock;
  }

  // 07단원 개념03에서 배운 그 this 입니다. 점 왼쪽에 있는 것.
  describe() {
    const state = this.isSoldOut() ? "품절" : `재고 ${this.stock}개`;
    return `${this.name} ${this.price}원 (${state})`;
  }
}

const coffee = new Product("아메리카노", 4000, 10);
const cake = new Product("케이크", 6000, 0);

console.log(coffee.describe());
// 출력: 아메리카노 4000원 (재고 10개)
console.log(cake.describe());
// 출력: 케이크 6000원 (품절)

console.log(coffee.isSoldOut(), cake.isSoldOut());
// 출력: false true

console.log(coffee.totalValue());
// 출력: 40000

// 여기가 class 의 진짜 장점입니다.
// describe 라는 함수는 '한 번만' 썼는데, 만들어진 모든 상품이 쓸 수 있습니다.
// 객체를 100개 만들어도 함수는 하나뿐입니다.

// 만들어진 것들은 배열에 담아 지금까지 배운 대로 다루면 됩니다.
const products = [coffee, cake, new Product("쿠키", 3000, 5)];

const soldOut = products.filter((p) => p.isSoldOut());
console.log(soldOut.length);
// 출력: 1

const totalAssets = products.reduce((sum, p) => sum + p.totalValue(), 0);
console.log(totalAssets);
// 출력: 55000

// ✏️ 직접 해보기 2 — products 에서 품절이 아닌 상품의 이름만 뽑아 출력해 보세요.

// ── 섹션 4: 07단원 객체와 뭐가 다른가 ──

// 하나만 만들 거면 07단원 방식이 더 간단합니다.
const singleProduct = {
  name: "이어폰",
  price: 89000,
  describe() {
    return `${this.name} ${this.price}원`;
  },
};
console.log(singleProduct.describe());
// 출력: 이어폰 89000원

// 정리하면 이렇습니다.
//
//     객체 하나만 필요하다        → 07단원 방식 { }
//     같은 모양을 여러 개 만든다   → class
//
// class 도 결국 객체를 만드는 것입니다. 완전히 새로운 게 아닙니다.
// 문법만 다를 뿐, 만들어진 결과는 07단원에서 배운 그 객체입니다.

// ── 섹션 5: 그래서 지금 써야 하나 ──

// 아닙니다. 지금은 몰라도 됩니다. 아래만 기억하세요.
//
//   ① class 이름( ) 앞에 new 가 붙어 있으면 "객체를 하나 만드는 중" 이다
//   ② constructor 는 처음 값을 채우는 곳이다
//   ③ 안에 있는 함수들은 만들어진 객체가 점으로 부를 수 있는 기능이다
//
// 이 셋만 알면 남의 코드를 읽을 수 있습니다. 그게 이 파일의 목표입니다.
//
// 참고로 우리는 이미 class 를 써 왔습니다.
//     new Promise(...)   ← 12단원
//     new Date(...)      ← 개념03
//     new Error(...)     ← 12단원
// 전부 누군가 만들어 둔 class 를 new 로 찍어 낸 것이었습니다.

console.log(new Date(2026, 0, 1).getFullYear());
// 출력: 2026

// ✏️ 직접 해보기 3 — Product 로 상품을 하나 더 만들어 products 에 넣고,
//                    전체 재고 자산이 얼마가 되는지 다시 구해 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] new 를 빼먹음
// const bad = Product("아메리카노", 4000, 10);
// 실수: TypeError: Class constructor Product cannot be invoked without 'new'
//       다행히 class 는 에러를 내 줍니다. new 를 붙이세요.

// [실수 2] constructor 에서 this 를 안 씀
//   constructor(name) {
//     name = name;        ← 매개변수에 자기를 넣은 것뿐, 객체에는 안 담김
//   }
// 실수: 만들어진 객체가 텅 비어 있습니다. this.name = name 이어야 합니다.

// [실수 3] 메소드에 function 을 붙임
//   describe: function () { ... }      ← 이건 07단원의 객체 방식
// 실수: class 안에서는 describe() { ... } 처럼 씁니다. 콜론도 쉼표도 없습니다.

// [실수 4] 메소드를 화살표 함수로 쓰려다 헷갈림
// 07단원에서 배운 대로, 객체의 메소드는 화살표 함수로 만들지 않습니다.
// class 안에서도 마찬가지입니다. 위 예제들처럼 줄여 쓰기로 쓰세요.

// ── 정리 ──

// 1. class 는 '같은 모양의 객체를 여러 개 찍어 내는 틀' 이다.
// 2. new 로 만든다. new 를 빼면 에러가 난다.
// 3. constructor 는 처음 값을 채우는 곳. this.속성 = 값 으로 담는다.
// 4. 안의 함수(메소드)는 만들어진 객체가 점으로 부른다. function 을 안 붙인다.
// 5. 만들어진 것은 결국 07단원의 그 객체다. map, filter 를 그대로 쓴다.
// 6. 지금 당장 쓸 일은 없다. 남의 코드를 읽는 게 목적이다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const me = new Student("최유진", 88);
//    console.log(me.name, me.score);
//    // 출력: 최유진 88
//
// 2) const 가능 = products.filter((p) => !p.isSoldOut()).map((p) => p.name);
//    console.log(가능);
//    // 출력: [ '아메리카노', '쿠키' ]
//    (변수 이름은 영어로 쓰는 게 좋습니다. available 같은 이름이 낫습니다)
//
// 3) products.push(new Product("샌드위치", 5000, 4));
//    const total = products.reduce((sum, p) => sum + p.totalValue(), 0);
//    console.log(total);
//    // 출력: 75000
//    → 55000 에 5000 × 4 = 20000 이 더해졌습니다.
