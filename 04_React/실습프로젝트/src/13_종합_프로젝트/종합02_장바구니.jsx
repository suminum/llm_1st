// ============================================================
// 13단원 · 종합 02 — 장바구니
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 카페 주문 화면을 만듭니다. 담기 · 수량 조절 · 빼기 · 총액 · 비우기까지 합니다.
//
// [왜 Context 와 useReducer 를 쓰나]
//   화면 조각이 넷입니다. 메뉴판 · 주문표 · 합계줄 · 머리띠의 장바구니 배지.
//   넷 다 같은 장바구니를 봅니다. 07단원의 state 끌어올리기로 만들면
//   공통 부모가 장바구니와 함수들을 들고 있다가 넷에 전부 내려보내야 합니다.
//   특히 배지는 화면 맨 위 깊은 곳에 있어서 중간 컴포넌트들이 쓰지도 않는 값을
//   손에서 손으로 넘겨야 합니다. 12단원 개념01에서 본 그 불편함입니다.
//
//   그리고 장바구니가 바뀌는 방법이 다섯 가지나 됩니다.
//   담기 · 수량 올리기 · 수량 내리기 · 빼기 · 비우기.
//   이렇게 '바뀌는 방법이 여러 가지' 일 때가 useReducer 를 쓸 자리입니다(12단원 개념03).
//
// [쓰는 단원] 07(불변 갱신) · 12(Context · useReducer · 커스텀 훅)
//
// ★ 이 실습에서 가장 어려운 것은 문제 1 입니다.
//   '담기' 하나가 상황에 따라 완전히 다른 두 가지 일을 하기 때문입니다.
//   처음 담는 메뉴면 새 칸을 만들고, 이미 담긴 메뉴면 수량만 올립니다.
//
// [푸는 법]
//   1) 문제 1~3(규칙) → 문제 4(저장소) → 문제 5~8(화면) 순서로 푸세요.
//   2) 문제 1~3은 화면 없이 콘솔로 먼저 확인할 수 있습니다. 아래 '검산' 을 보세요.
//   3) 저장하면 화면이 저절로 바뀝니다(Vite).
//
// ★ 아직 아무것도 안 고친 지금도 화면은 나옵니다.
//   장바구니에 아메리카노 2잔이 담겨 있고 버튼만 안 먹는 것이 정상입니다.

import { createContext, useContext, useReducer } from "react";
import Summary from "../_ui/Summary.jsx";

// 메뉴판입니다. 07단원까지 쓰던 것과 같은 모양입니다.
const MENU = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// 장바구니 한 칸의 모양입니다. 메뉴에 count 가 하나 붙었습니다.
//   { id: 1, name: "아메리카노", price: 4000, count: 2 }
const FIRST_ITEMS = [{ id: 1, name: "아메리카노", price: 4000, count: 2 }];

// ── 액션의 모양 ──
//
// 12단원 개념04에서는 값을 payload 라는 이름 하나에 담았습니다.
// 이 파일은 개념04 [실수 6]에서 권한 대로 값마다 이름을 붙입니다.
// 무엇이 들어오는지 이름만 봐도 알 수 있어서 헷갈릴 일이 줄어듭니다.
//
//   { type: "add", menu: { id, name, price } }   메뉴 하나를 담는다
//   { type: "increase", id: 1 }                  그 칸의 수량을 1 올린다
//   { type: "decrease", id: 1 }                  그 칸의 수량을 1 내린다 (1 아래로는 안 내려감)
//   { type: "remove", id: 1 }                    그 칸을 목록에서 뺀다
//   { type: "clear" }                            전부 비운다

function cartReducer(state, action) {
  // state 는 장바구니 배열입니다. 07단원 불변성 규칙을 그대로 지킵니다.
  switch (action.type) {
    // ───── 문제 1 ───── 담기  ★ 이 파일에서 가장 어렵습니다
    // 두 가지 경우를 갈라야 합니다.
    //   ① 이미 담긴 메뉴다  → 그 칸의 count 만 1 올린 새 배열을 돌려준다
    //      (map + { ...item, count: item.count + 1 })
    //   ② 처음 담는 메뉴다  → count 1 을 붙여 배열 끝에 넣는다
    //      ([...state, { ...action.menu, count: 1 }])
    //
    // 어느 쪽인지는 some 으로 확인합니다. "하나라도 있나" 를 알려 줍니다(JS자료 08단원).
    //
    // ★ state 를 직접 고치면 안 됩니다. push 도 item.count = ... 도 안 됩니다.
    //   에러가 안 나고 화면만 조용히 안 바뀝니다(07단원 개념01).
    //
    // 기대 결과 (콘솔): 아래 검산 첫 줄이 → 아메리카노 1개, 케이크 1개
    //                  빈 줄이면 아직 ② 를 안 한 것입니다.
    //                  "아메리카노 1개, 아메리카노 1개, 케이크 1개" 처럼 같은 메뉴가
    //                  두 줄이 되면 ① 을 빠뜨리고 무조건 새 칸을 만든 것입니다.
    //
    // TODO: 여기에 코드를 쓰세요
    case "add":
      return state;

    // ───── 문제 2 ───── 수량 올리기 / 내리기
    // increase 는 그 칸의 count 를 1 올립니다.
    // decrease 는 1 내리되 ★ 1 아래로는 안 내려갑니다.
    //   (0잔이 담겨 있는 것은 이상하니까요. 빼려면 아래 remove 를 씁니다)
    //   1 일 때 [−] 를 눌러도 그대로 1 이면 맞게 한 것입니다.
    //
    // 둘 다 map 과 { ...item, count: ... } 형태입니다.
    //
    // 기대 결과 (화면): 주문표의 [+] 를 누르면 "아메리카노 × 3" 이 됩니다.
    //                  [−] 를 두 번 누르면 × 1 까지만 내려가고 멈춥니다.
    //                  × 0 이나 음수가 나오면 아래 한계를 안 둔 것입니다.
    //                  (문제 4·7까지 해야 버튼이 살아납니다)
    //
    // TODO: 여기에 코드를 쓰세요
    case "increase":
      return state;

    // TODO: 여기에 코드를 쓰세요
    case "decrease":
      return state;

    // ───── 문제 3 ───── 빼기 / 비우기
    // remove 는 그 칸만 목록에서 지웁니다 (filter — 07단원 개념01).
    // clear 는 전부 비웁니다. 빈 배열을 돌려주면 됩니다.
    //
    // 기대 결과 (화면): [빼기] 를 누르면 그 줄만 사라집니다.
    //                  [전부 비우기] 를 누르면 "장바구니가 비었습니다" 가 나오고
    //                  합계가 0원, 배지가 🛒 0 이 됩니다.
    //                  누른 것만 남고 나머지가 사라지면 filter 조건을 반대로 쓴 것입니다.
    //
    // TODO: 여기에 코드를 쓰세요
    case "remove":
      return state;

    // TODO: 여기에 코드를 쓰세요
    case "clear":
      return state;

    default:
      // 모르는 type 이 오면 아무 일도 하지 않고 지금 값을 그대로 돌려줍니다.
      return state;
  }
}

// ── 화면 없이 검산하기 ──
//
// reducer 는 컴포넌트 밖의 그냥 함수입니다. 그래서 브라우저를 열기 전에
// 콘솔로 먼저 시험해 볼 수 있습니다. 12단원 개념04 섹션2와 같은 방법입니다.
//
// reduce 는 배열을 하나씩 접어 나가며 값을 만듭니다(JS자료 08단원).
// 액션 목록을 빈 장바구니에 차례로 적용한 결과가 나옵니다.

const testActions = [
  { type: "add", menu: MENU[0] }, // 아메리카노
  { type: "add", menu: MENU[0] }, // 아메리카노 한 잔 더 → 수량만 2
  { type: "add", menu: MENU[2] }, // 케이크
  { type: "decrease", id: 1 }, // 아메리카노를 1잔으로
];

const tested = testActions.reduce(cartReducer, []);

console.log("[검산] " + tested.map((item) => item.name + " " + item.count + "개").join(", "));
// 문제 1~3을 다 풀면 이렇게 나옵니다 →  [검산] 아메리카노 1개, 케이크 1개
// 지금은 reducer 가 아무 일도 안 하므로 "[검산] " 뒤가 비어 있습니다.

// ── 저장소 (Context) ──

// 상자를 만듭니다. 기본값을 null 로 두는 이유는 아래 useCart 에 있습니다.
const CartContext = createContext(null);

function CartProvider({ children }) {
  // ───── 문제 4 ───── 저장소 만들기
  // 지금은 '고정된 값' 과 '아무 일도 안 하는 dispatch' 를 내려보내고 있습니다.
  // 그래서 화면은 나오지만 버튼이 하나도 안 먹습니다.
  //
  // useReducer 로 진짜 저장소를 만들어 내려보내세요.
  //   const [items, dispatch] = useReducer(cartReducer, FIRST_ITEMS);
  //   ...
  //   value={{ items: items, dispatch: dispatch }}
  //
  // ★ value 의 중괄호가 두 겹인 것에 주의하세요.
  //   바깥 중괄호는 "여기부터 자바스크립트" 라는 뜻이고(02단원 개념03),
  //   안쪽 중괄호는 객체입니다. style={{ }} 와 같은 이야기입니다.
  //
  // 기대 결과 (화면): 문제 1~3을 이미 풀었다면 이 문제를 푸는 순간
  //                  [담기] 버튼이 살아납니다. 아메리카노를 담으면 × 3 이 됩니다.
  //                  버튼이 여전히 안 먹으면 dispatch 를 바꾸지 않은 것입니다.
  //                  화면이 통째로 빨간 상자가 되면 value 의 중괄호를 한 겹만 쓴 것입니다.
  //
  // TODO: 아래 두 줄을 고치세요
  const notYet = { items: FIRST_ITEMS, dispatch: () => {} };

  return <CartContext.Provider value={notYet}>{children}</CartContext.Provider>;
}

// 값을 꺼내는 커스텀 훅입니다. 이미 만들어 두었습니다(12단원 개념04 섹션4).
// Provider 밖에서 부르면 조용히 틀리는 대신 그 자리에서 멈춥니다.
function useCart() {
  const cart = useContext(CartContext);

  if (cart === null) {
    throw new Error("useCart 는 <CartProvider> 안에서만 쓸 수 있습니다");
  }

  return cart;
}

// ───── 문제 5 ───── 총액 구하기
// items 를 받아 총액을 돌려주는 함수입니다.
// 한 칸의 값은 price × count 이고, 그것을 전부 더하면 총액입니다.
// reduce 를 씁니다(JS자료 08단원 개념05).
//
// 기대 결과 (화면): 처음에 아메리카노 2잔이 담겨 있으므로 → 합계 8000원
//                  0원 그대로면 아직 안 고친 것입니다.
//                  4000원이 나오면 count 를 안 곱한 것입니다.
//                  NaN 원이 나오면 reduce 의 시작값 0 을 빠뜨린 것입니다.
//
// TODO: 여기에 코드를 쓰세요
function getTotal(items) {
  return 0;
}

// ── 화면 조각 ──
//
// 아래 네 조각은 props 를 하나도 받지 않습니다. 필요한 것은 각자 useCart() 로 꺼냅니다.

function MenuList() {
  const { dispatch } = useCart(); // items 는 안 쓰므로 dispatch 만 꺼냅니다

  // ───── 문제 6 ───── 담기 버튼
  // [담기] 를 누르면 그 메뉴를 장바구니에 넣으세요.
  //   dispatch({ type: "add", menu: menu })
  //
  // ★ onClick 에 괄호를 붙이면 안 됩니다(04단원 개념01).
  //   값을 같이 넘겨야 하므로 화살표 함수로 감쌉니다.
  //
  // 기대 결과 (화면): [케이크] 의 [담기] 를 누르면 주문표에 "케이크 × 1 = 6000원"
  //                  이 생기고 합계가 14000원, 배지가 🛒 3 이 됩니다.
  //                  아메리카노의 [담기] 를 누르면 새 줄이 아니라 × 3 이 되어야 합니다.
  //                  아무 반응이 없으면 dispatch 를 안 부른 것입니다.
  //                  화면을 열자마자 저절로 담기면 onClick 에 괄호를 붙인 것입니다.
  //
  // TODO: 아래 button 의 onClick 을 채우세요
  return (
    <div className="output">
      <strong>메뉴판</strong>
      <ul>
        {MENU.map((menu) => (
          <li key={menu.id}>
            {menu.name} {menu.price}원{" "}
            <button>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartList() {
  const { items, dispatch } = useCart();

  // 05단원 개념01의 '일찍 return' 입니다. 비었을 때는 여기서 끝냅니다.
  if (items.length === 0) {
    return <div className="output">장바구니가 비었습니다</div>;
  }

  // ───── 문제 7 ───── 수량 버튼과 빼기 버튼
  // 버튼 세 개에 각각 알맞은 dispatch 를 붙이세요.
  //   [+]    { type: "increase", id: item.id }
  //   [−]    { type: "decrease", id: item.id }
  //   [빼기] { type: "remove", id: item.id }
  //
  // 기대 결과 (화면): 아메리카노 줄의 [+] → × 3 = 12000원, 합계 12000원
  //                  [−] 를 눌러 × 1 까지 내려간 뒤 한 번 더 눌러도 × 1 그대로
  //                  [빼기] → 그 줄이 사라지고 "장바구니가 비었습니다" 가 나옵니다
  //                  버튼을 눌렀는데 다른 줄이 바뀌면 item.id 를 안 넘긴 것입니다.
  //
  // TODO: 아래 button 세 개의 onClick 을 채우세요
  return (
    <div className="output">
      <strong>주문표</strong>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.count} = {item.price * item.count}원{" "}
            <button>+</button>
            <button>−</button>
            <button>빼기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartTotal() {
  const { items, dispatch } = useCart();

  return (
    <div className="output">
      <strong>합계 {getTotal(items)}원</strong>{" "}
      {/* 담긴 것이 있을 때만 비우기 버튼을 보여 줍니다 (05단원 개념01) */}
      {items.length > 0 && (
        <button onClick={() => dispatch({ type: "clear" })}>전부 비우기</button>
      )}
    </div>
  );
}

// 화면 맨 위 머리띠에 붙는 배지입니다. 일부러 깊은 곳에 두었습니다.
function CartBadge() {
  const { items } = useCart();

  // ───── 문제 8 ───── 담긴 잔 수 세기
  // 배지에는 '종류' 가 아니라 '전부 몇 개인가' 를 보여 줍니다.
  // 아메리카노 2잔 + 케이크 1개 = 3 입니다. items.length 는 2 라서 답이 아닙니다.
  // count 를 전부 더하세요. reduce 를 다시 씁니다.
  //
  // 기대 결과 (화면): 처음에 아메리카노 2잔이 담겨 있으므로 → 🛒 2
  //                  케이크를 담으면 🛒 3 이 됩니다.
  //                  케이크를 담았는데 🛒 2 로 나오면 items.length 를 쓴 것입니다.
  //
  // TODO: 아래 줄을 고치세요
  const count = 0;

  return <span>🛒 {count}</span>;
}

// 배지는 이렇게 세 겹 안쪽에 있습니다. 그런데 props 가 하나도 없습니다.
function HeaderRight() {
  return <CartBadge />;
}

function ShopHeader() {
  return (
    <div className="output">
      <strong>민준이네 카페</strong> — <HeaderRight />
    </div>
  );
}

function ShopScreen() {
  // 이 컴포넌트도, ShopHeader 도, HeaderRight 도 장바구니를 모릅니다.
  return (
    <div>
      <ShopHeader />
      <MenuList />
      <CartList />
      <CartTotal />
    </div>
  );
}

export default function Project02CartApp() {
  return (
    <div>
      <h1>종합 02 — 장바구니</h1>

      <p className="guide">
        <strong>Context + useReducer</strong> 로 만드는 카페 주문 화면입니다. 문제는{" "}
        <strong>8개</strong>입니다.
        <br />
        <br />
        <strong>가장 어려운 것은 문제 1(담기)</strong> 입니다. 처음 담는 메뉴와 이미 담긴
        메뉴를 갈라야 합니다.
        <br />
        <br />
        문제 1~3은 화면 없이 <strong>F12 → Console</strong> 의 검산 줄로 먼저 확인할 수
        있습니다. 화면을 고치기 전에 규칙부터 맞추세요.
        <br />
        <br />
        막히면 <strong>종합02_장바구니_정답.jsx</strong> 를 보세요.
      </p>

      <div className="demo">
        <CartProvider>
          <ShopScreen />
        </CartProvider>
      </div>

      <Summary
        items={[
          "장바구니 한 칸은 { id, name, price, count } 입니다. 메뉴에 count 가 붙은 모양입니다.",
          "바뀌는 방법이 다섯 가지(담기·올리기·내리기·빼기·비우기)라서 useReducer 를 씁니다.",
          "reducer 는 컴포넌트 밖의 함수라 화면 없이 reduce 로 검산할 수 있습니다.",
          "reducer 안에서도 07단원의 불변 규칙을 지킵니다. push 도, item.count = ... 도 안 됩니다.",
          "Provider 를 CartProvider 컴포넌트로 감싸면 쓰는 쪽은 useReducer 를 몰라도 됩니다.",
          "화면 조각 넷이 props 를 하나도 안 받습니다. 각자 useCart() 로 꺼냅니다.",
          "총액과 담긴 개수는 state 가 아닙니다. items 에서 reduce 로 계산합니다.",
        ]}
      />
    </div>
  );
}
