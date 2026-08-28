// ============================================================
// 13단원 · 종합 02 정답 — 장바구니
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 먼저 스스로 만들어 본 다음에 보세요.
// 담기 · 수량 조절 · 빼기 · 총액 · 비우기가 전부 동작합니다.
//
// [이 파일의 순서]
//   1) 액션의 모양을 정한다        — 무엇이 일어날 수 있는지 목록을 만듭니다
//   2) reducer 를 만든다           — 그 일이 일어나면 값이 어떻게 되는지 적습니다
//   3) 콘솔로 검산한다             — 화면을 열기 전에 규칙이 맞는지 확인합니다
//   4) Provider 로 감싼다          — 어느 깊이에서든 꺼내 쓸 수 있게 합니다
//   5) 화면 조각을 만든다          — 조각들은 props 를 하나도 안 받습니다
//
//   화면을 먼저 만들고 규칙을 나중에 붙이는 것보다 이 순서가 훨씬 편합니다.
//   규칙이 컴포넌트 밖의 그냥 함수라서 브라우저 없이도 시험할 수 있기 때문입니다.
//
// ★ 이 실습에서 가장 어려운 것은 문제 1(담기) 입니다.
//   '담기' 하나가 상황에 따라 완전히 다른 두 가지 일을 하기 때문입니다.

import { createContext, useContext, useReducer } from "react";
import Summary from "../_ui/Summary.jsx";

const MENU = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// 장바구니 한 칸의 모양입니다. 메뉴에 count 가 하나 붙었습니다.
const FIRST_ITEMS = [{ id: 1, name: "아메리카노", price: 4000, count: 2 }];

// ── 액션의 모양 ──
//
// 12단원 개념04에서는 값을 payload 라는 이름 하나에 담았습니다.
// 이 파일은 개념04 [실수 6]에서 권한 대로 값마다 이름을 붙였습니다.
//
//   { type: "add", menu: { id, name, price } }
//   { type: "increase", id: 1 }
//   { type: "decrease", id: 1 }
//   { type: "remove", id: 1 }
//   { type: "clear" }
//
// 이름을 붙이면 reducer 를 읽을 때 action.menu 인지 action.id 인지 헷갈리지 않습니다.
// payload 하나로 쓰면 액션마다 그 안에 무엇이 들었는지 따로 기억해야 합니다.

function cartReducer(state, action) {
  switch (action.type) {
    // ───── 문제 1 ───── 담기  ★ 가장 어려운 문제
    case "add": {
      // some 은 "조건에 맞는 게 하나라도 있나" 를 true/false 로 알려 줍니다(JS자료 08단원).
      const already = state.some((item) => item.id === action.menu.id);

      if (already) {
        // ① 이미 담긴 메뉴 — 그 칸만 새 객체로 바꾼 새 배열
        return state.map((item) =>
          item.id === action.menu.id ? { ...item, count: item.count + 1 } : item
        );
      }

      // ② 처음 담는 메뉴 — count 1 을 붙여 끝에 넣습니다
      return [...state, { ...action.menu, count: 1 }];
    }

    // ───── 문제 2 ───── 수량 올리기 / 내리기
    case "increase":
      return state.map((item) =>
        item.id === action.id ? { ...item, count: item.count + 1 } : item
      );

    case "decrease":
      return state.map((item) => {
        if (item.id !== action.id) return item; // 다른 칸은 손대지 않습니다
        if (item.count <= 1) return item; // ★ 1 아래로는 안 내려갑니다
        return { ...item, count: item.count - 1 };
      });

    // ───── 문제 3 ───── 빼기 / 비우기
    case "remove":
      return state.filter((item) => item.id !== action.id);

    case "clear":
      return [];

    default:
      // 모르는 type 이 오면 아무 일도 하지 않고 지금 값을 그대로 돌려줍니다.
      return state;
  }
}

// [왜 이렇게 했나 — 문제 1]
//   '담기' 는 이름이 하나인데 하는 일이 둘입니다. 이것이 어려운 이유입니다.
//   먼저 some 으로 "이미 있나?" 를 묻고, 답에 따라 갈라야 합니다.
//   ① 쪽에서 map 을 쓴 이유: 목록 전체를 새 배열로 만들면서 그 칸만 새 객체로 바꿉니다.
//   ② 쪽에서 { ...action.menu, count: 1 } 을 쓴 이유: 메뉴 객체를 그대로 넣으면
//      장바구니와 메뉴판이 같은 객체를 보게 됩니다. 나중에 수량을 올리면
//      메뉴판까지 함께 바뀔 수 있습니다. 복사해서 넣어야 안전합니다.
//
//   case 에 중괄호 { } 를 씌운 것은 그 안에서 const already 를 선언하기 때문입니다.
//   중괄호가 없으면 다른 case 와 이름이 겹쳐서 에러가 납니다.
//
// [왜 이렇게 했나 — 문제 2]
//   decrease 는 map 콜백을 여러 줄로 썼습니다. 조건이 둘이라 삼항으로는 읽기 나쁩니다.
//   "다른 칸이면 그대로 / 1잔 이하면 그대로 / 아니면 하나 줄인 새 객체" 세 갈래입니다.
//   ★ map 안에서 아무것도 안 돌려주는 갈래가 있으면 그 자리가 undefined 가 되어
//     화면이 터집니다(07단원 개념01 [실수 5]). 세 갈래 모두 return 이 있는지 보세요.
//
//   12단원 개념04의 장바구니는 수량이 0이 되면 목록에서 저절로 빠졌습니다.
//   이 파일은 1에서 멈추고, 빼는 것은 [빼기] 버튼으로만 하게 했습니다.
//   어느 쪽이 옳은 것은 아닙니다. 다만 '저절로 사라지는' 화면은 사용자가 놀랍니다.
//
// [왜 이렇게 했나 — 문제 3]
//   remove 는 filter 입니다. '지울 것' 이 아니라 '남길 것' 을 고르므로 !== 입니다.
//   clear 는 [] 입니다. state.length = 0 처럼 원본을 고치면 안 됩니다.
//   빈 배열을 '새로' 만들어 돌려줘야 React 가 바뀐 것을 알아챕니다.

// ── 화면 없이 검산하기 ──
//
// reducer 는 컴포넌트 밖의 그냥 함수입니다. 브라우저를 열기 전에 시험할 수 있습니다.
// reduce 는 액션 목록을 하나씩 접어 나가며 최종 장바구니를 만듭니다(JS자료 08단원).

const testActions = [
  { type: "add", menu: MENU[0] }, // 아메리카노
  { type: "add", menu: MENU[0] }, // 아메리카노 한 잔 더 → 수량만 2
  { type: "add", menu: MENU[2] }, // 케이크
  { type: "decrease", id: 1 }, // 아메리카노를 1잔으로
];

const tested = testActions.reduce(cartReducer, []);

console.log("[검산] " + tested.map((item) => item.name + " " + item.count + "개").join(", "));
// 콘솔: [검산] 아메리카노 1개, 케이크 1개

// 같은 메뉴를 두 번 담았는데 줄이 하나뿐입니다. 문제 1의 ① 이 동작한 것입니다.

const twiceDown = [
  { type: "decrease", id: 1 },
  { type: "decrease", id: 1 },
].reduce(cartReducer, tested);

console.log("[검산] 1개에서 두 번 더 내리면 " + twiceDown[0].count + "개");
// 콘솔: [검산] 1개에서 두 번 더 내리면 1개

// 1 아래로 안 내려간다는 규칙도 화면 없이 확인했습니다.

const cleared = cartReducer(tested, { type: "clear" });

console.log("[검산] 비운 뒤 칸 수: " + cleared.length + " / 원래 칸 수: " + tested.length);
// 콘솔: [검산] 비운 뒤 칸 수: 0 / 원래 칸 수: 2

// 비운 뒤에도 원래 배열 tested 는 2칸 그대로입니다. 원본을 안 건드렸다는 뜻입니다.

// ── 저장소 (Context) ──

// 상자를 만듭니다. 기본값은 null 입니다. 이유는 useCart 에 있습니다.
const CartContext = createContext(null);

function CartProvider({ children }) {
  // ───── 문제 4 ───── 저장소 만들기
  const [items, dispatch] = useReducer(cartReducer, FIRST_ITEMS);

  return (
    <CartContext.Provider value={{ items: items, dispatch: dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// [왜 이렇게 했나]
//   Provider 를 직접 쓰지 않고 컴포넌트로 감쌌습니다. 그래서 쓰는 쪽이 이렇게 짧아집니다.
//
//     <CartProvider>
//       <ShopScreen />
//     </CartProvider>
//
//   useReducer 도, cartReducer 도, 초기값도 쓰는 쪽에서는 안 보입니다.
//   children 은 03단원 개념04에서 배웠습니다. 태그 사이에 넣은 것이 그대로 옵니다.
//
//   value={{ ... }} 의 중괄호가 두 겹인 이유:
//   바깥 중괄호는 "여기부터 자바스크립트" 라는 뜻이고(02단원 개념03),
//   안쪽 중괄호는 객체입니다. style={{ }} 와 똑같은 이야기입니다.
//   한 겹만 쓰면 items 가 무슨 뜻인지 몰라서 그 자리에서 멈춥니다.

function useCart() {
  const cart = useContext(CartContext);

  // Provider 밖에서 부르면 조용히 틀리는 대신 그 자리에서 알려 줍니다.
  if (cart === null) {
    throw new Error("useCart 는 <CartProvider> 안에서만 쓸 수 있습니다");
  }

  return cart;
}

// ───── 문제 5 ───── 총액 구하기
function getTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.count, 0);
}

// [왜 이렇게 했나]
//   한 칸의 값은 price × count 입니다. 그것을 전부 더하면 총액입니다.
//   reduce 의 마지막 인자 0 이 '시작값' 입니다. 이것을 빠뜨리면 빈 배열일 때
//   에러가 나고, 첫 칸이 숫자가 아니라 객체라서 결과가 NaN 이 됩니다.
//
//   총액을 state 로 두지 않은 이유가 중요합니다.
//   items 가 바뀔 때마다 총액도 같이 고쳐야 하고, 한 군데라도 잊으면
//   "화면에 담긴 것과 합계가 안 맞는" 상태가 됩니다. 에러는 안 납니다.
//   items 하나에서 계산해 내면 어긋날 수가 없습니다(07단원 개념05).

// ── 화면 조각 ──
//
// 아래 네 조각은 props 를 하나도 받지 않습니다. 필요한 것은 각자 useCart() 로 꺼냅니다.

function MenuList() {
  const { dispatch } = useCart(); // items 는 안 쓰므로 dispatch 만 꺼냅니다

  // ───── 문제 6 ───── 담기 버튼
  return (
    <div className="output">
      <strong>메뉴판</strong>
      <ul>
        {MENU.map((menu) => (
          <li key={menu.id}>
            {menu.name} {menu.price}원{" "}
            <button onClick={() => dispatch({ type: "add", menu: menu })}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): [케이크]의 [담기] → 주문표에 "케이크 × 1 = 6000원" 이 생깁니다
// 화면(누르면): [아메리카노]의 [담기] → 새 줄이 아니라 "아메리카노 × 3" 이 됩니다
//
// [왜 화살표 함수로 감쌌나]
//   onClick={dispatch({ type: "add", menu: menu })} 라고 쓰면
//   화면을 그리는 순간 dispatch 가 실행됩니다. 04단원 개념01에서 본 그 함정입니다.
//   게다가 dispatch 는 화면을 다시 그리게 하므로, 그리자마자 또 그리는
//   끝없는 반복이 됩니다. 값을 같이 넘겨야 할 때는 반드시 화살표로 감쌉니다.

function CartList() {
  const { items, dispatch } = useCart();

  // 05단원 개념01의 '일찍 return' 입니다. 비었을 때는 여기서 끝냅니다.
  if (items.length === 0) {
    return <div className="output">장바구니가 비었습니다</div>;
  }

  // ───── 문제 7 ───── 수량 버튼과 빼기 버튼
  return (
    <div className="output">
      <strong>주문표</strong>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.count} = {item.price * item.count}원{" "}
            <button onClick={() => dispatch({ type: "increase", id: item.id })}>+</button>
            <button onClick={() => dispatch({ type: "decrease", id: item.id })}>−</button>
            <button onClick={() => dispatch({ type: "remove", id: item.id })}>빼기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노 줄의 [+] → "아메리카노 × 3 = 12000원"
// 화면(누르면): [−] 를 눌러 × 1 까지 내려간 뒤 한 번 더 눌러도 × 1 그대로입니다
// 화면(누르면): [빼기] → 그 줄이 사라집니다
//
// [왜 id 를 같이 넘기나]
//   dispatch 는 "무슨 일이 일어났다" 만 알립니다. 어느 칸인지는 우리가 알려 줘야 합니다.
//   여기서 item.id 를 안 넘기면 reducer 의 item.id === action.id 가 언제나 false 라서
//   아무 일도 안 일어납니다. 에러는 한 줄도 안 납니다.
//
//   각 줄이 자기 item 을 이미 알고 있다는 점을 눈여겨보세요.
//   JS자료였다면 li 에 data-id 를 심고 눌린 뒤에 closest 로 되찾아야 했습니다.

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

// 화면: 합계 8000원  [전부 비우기]
// 화면(누르면): [전부 비우기] → "장바구니가 비었습니다", 합계 0원,
//               그리고 비우기 버튼 자체가 화면에서 사라집니다

function CartBadge() {
  const { items } = useCart();

  // ───── 문제 8 ───── 담긴 잔 수 세기
  const count = items.reduce((sum, item) => sum + item.count, 0);

  return <span>🛒 {count}</span>;
}

// [왜 items.length 가 아닌가]
//   items.length 는 '종류' 입니다. 아메리카노 2잔은 1종류에 2잔입니다.
//   배지에 보여 줄 것은 '몇 개 담았나' 이므로 count 를 전부 더해야 합니다.
//   이것도 에러가 안 나는 실수입니다. 한 종류만 담아 보면 두 값이 같아서
//   틀린 줄 모르고 지나가기 쉽습니다. 꼭 두 종류를 담아서 확인하세요.

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

// 화면: 민준이네 카페 — 🛒 2 / 메뉴판 네 줄 / 주문표에 "아메리카노 × 2 = 8000원" /
//       합계 8000원  [전부 비우기]

// ── 여기서 12단원 개념04와 달라진 점 ──
//
//   [1] 액션에 이름을 붙였습니다
//       개념04:  { type: "add", payload: menu } / { type: "remove", payload: item.id }
//       여기  :  { type: "add", menu: menu }    / { type: "remove", id: item.id }
//       payload 하나로 쓰면 액션마다 그 안에 무엇이 들었는지 따로 기억해야 합니다.
//
//   [2] 수량을 1 아래로 안 내립니다
//       개념04는 0이 되면 목록에서 저절로 빠졌습니다.
//       여기서는 1에서 멈추고 [빼기] 로만 뺍니다. 사용자가 덜 놀랍니다.
//
//   [3] 담기와 수량 올리기를 나눴습니다
//       개념04는 주문표의 [+] 도 "add" 를 썼습니다. 메뉴 객체 전체를 다시 보내야 했지요.
//       여기서는 "increase" 를 따로 두어 id 만 보냅니다. 하는 일이 다르면 이름도 나눕니다.
//
//   [4] 비우기 버튼이 담긴 것이 있을 때만 나옵니다
//       빈 장바구니에 [비우기] 가 있는 것은 이상합니다. 05단원의 && 로 가렸습니다.

export default function Project02CartAnswer() {
  return (
    <div>
      <h1>종합 02 정답 — 장바구니</h1>

      <p className="guide">
        먼저 스스로 만들어 본 다음에 보세요. <strong>담기 · 수량 · 빼기 · 합계 · 비우기</strong>
        가 전부 동작합니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 에서 검산 세 줄을 확인하세요. 화면을 열기 전에
        규칙이 맞는지 확인해 둔 것입니다.
        <br />
        <br />
        아래 화면 조각 넷은 <strong>props 를 하나도 받지 않습니다</strong>. 배지는 세 겹
        안쪽에 있는데도 장바구니를 바로 꺼내 씁니다.
      </p>

      <div className="demo">
        <CartProvider>
          <ShopScreen />
        </CartProvider>
      </div>

      <Summary
        items={[
          "바뀌는 방법이 다섯 가지라서 useReducer 를 씁니다. 규칙이 reducer 한 곳에 모입니다.",
          "reducer 는 컴포넌트 밖의 함수라 화면 없이 reduce 로 검산할 수 있습니다. 화면보다 먼저 만드세요.",
          "'담기' 는 상황에 따라 두 가지 일을 합니다. some 으로 갈라 주는 것이 이 실습의 고비입니다.",
          "reducer 안에서도 07단원의 불변 규칙을 지킵니다. push 도, item.count = ... 도 안 됩니다.",
          "액션에 payload 대신 menu·id 처럼 이름을 붙이면 무엇이 들어오는지 헷갈리지 않습니다.",
          "Provider 를 컴포넌트로 감싸고 useCart 훅으로 꺼내면, 화면 조각이 props 를 하나도 안 받습니다.",
          "총액과 담긴 개수는 state 가 아닙니다. items 에서 reduce 로 계산하면 어긋날 수가 없습니다.",
        ]}
      />
    </div>
  );
}
