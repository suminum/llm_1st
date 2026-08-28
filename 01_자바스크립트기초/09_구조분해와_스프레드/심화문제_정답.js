// ============================================================
// 09단원 심화문제 정답
// ------------------------------------------------------------
// 실행: node 심화문제_정답.js
// ============================================================


// ───── 심화 1 ─────
const order = {
  id: 100,
  customer: {
    name: "정하늘",
    address: { city: "부산" },
  },
  items: [
    { name: "라떼", price: 4500 },
    { name: "쿠키", price: 3000 },
  ],
};

const {
  id,
  customer: {
    name: customerName,
    address: { city = "미입력" } = {},
  },
  items: [{ name: firstItem }],
} = order;

console.log(id, customerName, city, firstItem);
// 출력: 100 정하늘 부산 라떼

// 한 조각씩 읽어 봅시다
//
//   id                              그냥 꺼내기
//   customer: { ... }               customer 안으로 들어가라 (이름 바꾸기 아님)
//   name: customerName              name 을 customerName 으로 (이름 바꾸기)
//   address: { city = "미입력" } = {}
//       바깥 = {}      address 가 없으면 빈 객체로 치고 들어가라
//       city = "미입력" 그 안에 city 가 없으면 이 값을 써라
//   items: [{ name: firstItem }]    items 배열의 첫 번째로 들어가 name 을 꺼내라
//
// 콜론이 두 가지 뜻으로 쓰이는 것이 이 문법의 전부입니다.
//   오른쪽이 '이름' 이면    → 이름 바꾸기
//   오른쪽이 { } 나 [ ] 면  → 더 깊이 들어가기
//
// 이렇게까지 한 줄로 쓸 일은 실무에서 드뭅니다.
// 다만 React 코드에서 이런 모양을 읽어야 할 때가 있어서 한 번은 해 봐야 합니다.
// 직접 쓸 때는 두 단계까지만 하고 나머지는 나눠 쓰는 게 좋습니다.


// ───── 심화 2 ─────
const state = {
  user: { name: "김민준", point: 100 },
  cart: [
    { id: 1, count: 2 },
    { id: 2, count: 1 },
  ],
};

const newState = {
  ...state,
  cart: state.cart.map((item) => (item.id === 2 ? { ...item, count: 5 } : item)),
};

console.log("새 state 의 2번 count:", newState.cart[1].count);
// 출력: 새 state 의 2번 count: 5
console.log("원본의 2번 count:", state.cart[1].count);
// 출력: 원본의 2번 count: 1
console.log("user 객체를 그대로 재사용했나:", newState.user === state.user);
// 출력: user 객체를 그대로 재사용했나: true

// 겉에서 안으로 한 겹씩 새로 만듭니다
//
//   { ...state, cart: 새것 }
//        새 겉껍데기를 만들고, cart 자리만 새것으로 갈아 끼웁니다.
//        user 는 손대지 않았으니 원본의 그 객체를 그대로 가리킵니다.
//
//   state.cart.map(...)
//        map 은 새 배열을 만듭니다. 원본 cart 는 그대로입니다.
//
//   item.id === 2 ? { ...item, count: 5 } : item
//        바꿔야 할 것만 새 객체로 만들고, 나머지는 원래 것을 그대로 넘깁니다.
//
// 마지막 줄이 왜 true 인가
//   손대지 않은 부분은 '복사하지 않고 그대로 재사용' 합니다.
//   이게 낭비가 아니라 의도된 것입니다.
//   React 는 "이 객체가 그대로면 다시 그릴 필요 없다" 를 === 로 판단합니다.
//   그래서 안 바뀐 부분을 그대로 넘겨야 화면을 덜 그립니다.
//
//   반대로 구조분해로 통째 복사하면 전부 새 객체가 되어
//   바뀌지 않은 곳까지 다시 그리게 됩니다.
//
// 이 패턴이 13단원 종합03의 todos 갱신과 똑같은 모양입니다.


// ───── 심화 3 ─────
function summarize(label, ...numbers) {
  if (numbers.length === 0) {
    return `${label} — 자료 없음`; // 조기 반환
  }

  const total = numbers.reduce((sum, n) => sum + n, 0);
  const average = (total / numbers.length).toFixed(1);
  const max = Math.max(...numbers);

  return `${label} — 합계 ${total} / 평균 ${average} / 최대 ${max}`;
}

console.log(summarize("1반", 10, 20, 30));
// 출력: 1반 — 합계 60 / 평균 20.0 / 최대 30
console.log(summarize("2반", 5));
// 출력: 2반 — 합계 5 / 평균 5.0 / 최대 5
console.log(summarize("3반"));
// 출력: 3반 — 자료 없음

// 나머지 매개변수는 항상 마지막에 옵니다
//   summarize(label, ...numbers)  ← label 을 먼저 받고 나머지를 전부 모읍니다
//   순서를 바꿔 ...numbers, label 로 쓰면 SyntaxError 입니다.
//   "나머지" 뒤에 무언가가 더 올 수는 없으니까요.
//
// numbers 는 진짜 배열입니다
//   그래서 length, reduce 를 그대로 쓸 수 있습니다.
//   개념05에서 본 arguments 와 다른 점이 이것입니다.
//
// Math.max(...numbers) 의 점 세 개
//   Math.max 는 배열을 통째로 못 받습니다. 숫자를 하나씩 받습니다.
//   그래서 스프레드로 펼쳐 넣습니다. 06단원에서 못 했던 그 문제의 답입니다.
//
//   같은 ... 인데 매개변수 자리에서는 '모으기', 인자 자리에서는 '펼치기' 입니다.
//   위치로 구분한다는 것을 여기서 한 번에 볼 수 있습니다.
//
// toFixed(1) 은 문자열을 돌려줍니다
//   20.0 처럼 소수점 아래를 강제로 한 자리 보여 주려면 문자열이어야 합니다.
//   숫자로 두면 20 으로 나와서 자릿수가 안 맞습니다.
//   화면에 보여 주는 용도라 문자열로 두는 것이 맞습니다. (02단원)
