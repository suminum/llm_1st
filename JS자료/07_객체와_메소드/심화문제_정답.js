// ============================================================
// 07단원 심화문제 정답
// ------------------------------------------------------------
// 실행: node 심화문제_정답.js
// ============================================================


// ───── 심화 1 ─────
const store = {
  items: {
    아메리카노: 10,
    라떼: 3,
  },

  sell(name, count) {
    if (this.items[name] < count) {
      console.log("재고 부족");
      return; // 조기 반환 — 재고를 건드리지 않고 끝냅니다
    }
    this.items[name] -= count;
  },

  restock(name, count) {
    this.items[name] += count;
  },

  report() {
    let line = "";

    for (const entry of Object.entries(this.items)) {
      // entry[0] 은 이름, entry[1] 은 개수입니다 (개념04 섹션 4)
      line += `${entry[0]} ${entry[1]}개 / `;
    }

    // 마지막 " / " 를 빼려고 뒤에서 3글자를 잘라냅니다
    console.log(line.slice(0, -3));
  },
};

store.sell("아메리카노", 2);
// 출력: 재고 부족
store.sell("라떼", 5);
store.restock("라떼", 4);
store.report();
// 출력: 아메리카노 8개 / 라떼 7개

// 잠깐 — 출력 순서가 이상하지 않나요?
//   "재고 부족" 은 라떼를 5개 팔려 할 때(재고 3개) 나온 것입니다.
//   아메리카노 2개는 정상으로 팔려서 10 → 8 이 되었고,
//   라떼는 팔리지 않은 채 3 → 4개 입고 → 7 이 되었습니다.
//
// this 를 왜 쓰나
//   store.items 라고 직접 써도 지금은 동작합니다.
//   그런데 나중에 가게가 두 개가 되어 객체를 복사하면,
//   복사본의 메소드가 여전히 원본 store 를 보게 됩니다. (개념03 섹션 4의 그 함정)
//   this 는 "나를 부른 그 객체" 라서 복사본에서도 제대로 동작합니다.
//
// slice(0, -3) 은 무엇인가
//   "처음부터 뒤에서 3번째 전까지" 입니다. 마지막 " / " 를 지웁니다.
//   08단원의 join(" / ") 을 쓰면 이런 뒤처리가 필요 없습니다.


// ───── 심화 2 ─────
const orders = [
  { menu: "아메리카노", price: 4000, count: 2 },
  { menu: "케이크", price: 6000, count: 1 },
  { menu: "아메리카노", price: 4000, count: 3 },
  { menu: "라떼", price: 4500, count: 2 },
];

// ① 총 매출
let total = 0;
for (const order of orders) {
  total += order.price * order.count;
}
console.log(`총 매출: ${total}원`);
// 출력: 총 매출: 35000원

// ② 가장 비싼 주문 한 건
let topOrder = orders[0];
for (const order of orders) {
  if (order.price * order.count > topOrder.price * topOrder.count) {
    topOrder = order;
  }
}
console.log(`가장 비싼 주문: ${topOrder.menu}`);
// 출력: 가장 비싼 주문: 아메리카노

// ③ 메뉴별 판매 개수
const countByMenu = {};
for (const order of orders) {
  if (countByMenu[order.menu]) {
    countByMenu[order.menu] += order.count; // 이미 있으면 더한다
  } else {
    countByMenu[order.menu] = order.count; // 없으면 새로 넣는다
  }
}
console.log(countByMenu);
// 출력: { '아메리카노': 5, '케이크': 1, '라떼': 2 }
// 한글 속성 이름은 찍을 때 따옴표가 붙습니다. 영어 이름이면 안 붙습니다.

// ②에서 왜 orders[0] 으로 시작하나
//   0 으로 시작하면 "가장 비싼 것" 은 찾을 수 있지만,
//   그 주문의 menu 를 꺼낼 수가 없습니다. 객체 전체를 들고 있어야 합니다.
//   첫 항목을 후보로 두고, 더 큰 것을 만나면 바꿔치기하는 것이 정석입니다.
//
//   아메리카노 3개 = 12000원이 가장 큽니다. (케이크 6000, 라떼 9000, 아메 2개 8000)
//   총 매출 = 8000 + 6000 + 12000 + 9000 = 35000원
//
// ③의 대괄호 접근이 핵심입니다
//   countByMenu.order.menu 라고 쓰면 안 됩니다. 그건 "order 라는 속성" 을 찾습니다.
//   countByMenu[order.menu] 라고 써야 "아메리카노 라는 속성" 이 됩니다.
//   변수에 담긴 이름으로 찾을 때는 반드시 대괄호입니다. (개념01 섹션 4)
//
// 08단원에서 reduce 를 배우면 ①과 ③이 각각 한 줄이 됩니다.
// 지금은 반복문으로 "무슨 일이 일어나는지" 를 보는 게 목적입니다.


// ───── 심화 3 ─────
const users = [
  { name: "김민준", address: { city: "부산" } },
  { name: "이서연", address: {} },
  { name: "박지훈" },
];

for (const user of users) {
  console.log(`${user.name}: ${user.address?.city || "정보 없음"}`);
}
// 출력: 김민준: 부산
// 출력: 이서연: 정보 없음
// 출력: 박지훈: 정보 없음

// ?. 가 없으면 어떻게 되나
//   박지훈에게는 address 가 아예 없습니다. undefined 입니다.
//   user.address.city 라고 쓰면
//   → TypeError: Cannot read properties of undefined (reading 'city')
//   여기서 프로그램이 통째로 멈춥니다.
//
//   ?. 는 "왼쪽이 없으면 더 들어가지 말고 undefined 를 내놔라" 입니다.
//   에러 대신 undefined 가 나오니 프로그램이 살아남습니다.
//
// || 가 하는 일
//   이서연은 address 는 있는데 city 가 없어서 undefined 입니다.
//   박지훈은 ?. 때문에 undefined 입니다.
//   둘 다 falsy 라서 || 가 "정보 없음" 으로 바꿔 줍니다.
//
//   ?. 는 "에러를 막는 것", || 는 "빈 값을 채우는 것" 입니다.
//   역할이 다르니 둘 다 필요합니다.
//
// 서버에서 받은 데이터에는 이런 구멍이 항상 있습니다. (12단원)
// 이 한 줄 패턴을 손에 익혀 두세요.
