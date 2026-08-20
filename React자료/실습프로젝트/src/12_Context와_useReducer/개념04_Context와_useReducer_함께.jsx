// ============================================================
// 12단원 · 개념 04 — Context 와 useReducer 함께
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 개념02에서 Context 를, 개념03에서 useReducer 를 배웠습니다. 서로 상관없는 둘이었습니다.
// 이제 합칩니다. 둘을 합치면 이런 것이 됩니다.
//
//   useReducer  → 값이 어떻게 바뀌는지의 규칙을 한 곳에 모은다
//   Context     → 그 값과 dispatch 를 어느 깊이에서든 꺼내 쓴다
//
// 합친 결과를 흔히 '전역 상태' 라고 부릅니다.
// 그런데 이 말은 오해를 부릅니다. 전역이 아니라 'Provider 로 감싼 범위' 입니다.
// 섹션 6에서 직접 확인합니다.
//
// 이 파일에서 만들 것은 장바구니입니다.

import { createContext, useContext, useReducer } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 무엇을 만드나 ──

// 화면 조각이 넷입니다.
//
//   MenuList     메뉴를 보여 주고 [담기] 를 누르면 장바구니에 넣는다
//   CartList     담긴 것을 보여 주고 수량을 조절하거나 뺀다
//   CartTotal    총액을 보여 준다
//   CartBadge    화면 구석에서 담긴 개수만 보여 준다 (깊은 곳에 둡니다)
//
// 넷 다 같은 장바구니를 봅니다. 07단원의 state 끌어올리기로 만들면
// 공통 부모가 items 와 함수 넷을 들고 있다가 네 조각에 전부 내려보내야 합니다.
// 개념01에서 본 그 상황입니다.
//
// 장바구니 한 칸은 이렇게 생겼습니다.
//
//   { id: 1, name: "아메리카노", price: 4000, count: 2 }
//
// 그리고 items 는 이런 칸들의 배열입니다. 처음엔 빈 배열입니다.

const MENU = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// ✏️ 직접 해보기 1 — MENU 에 { id: 5, name: "쿠키", price: 3000 } 을 추가해 보세요.
//                    화면이 어떻게 바뀌는지 확인하세요.

// ── 섹션 2: reducer 를 먼저 만듭니다 ──

// 순서가 중요합니다. 화면보다 규칙을 먼저 정합니다.
// reducer 는 컴포넌트 밖의 그냥 함수라서 화면 없이도 시험해 볼 수 있습니다.

function cartReducer(state, action) {
  // state 는 장바구니 배열입니다. 07단원 불변성 규칙을 그대로 지킵니다.
  switch (action.type) {
    case "add":
      // 이미 담긴 메뉴면 수량만 1 올립니다.
      // some 은 "조건에 맞는 게 하나라도 있나" 를 true/false 로 알려 줍니다(JS자료 08단원).
      if (state.some((item) => item.id === action.payload.id)) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, count: item.count + 1 } // 그 칸만 새 객체로
            : item
        );
      }
      // 처음 담는 메뉴면 count 1 을 붙여 배열 끝에 넣습니다.
      return [...state, { ...action.payload, count: 1 }];

    case "decrease":
      // 수량을 1 내리고, 0이 된 칸은 목록에서 뺍니다.
      return state
        .map((item) =>
          item.id === action.payload ? { ...item, count: item.count - 1 } : item
        )
        .filter((item) => item.count > 0);

    case "remove":
      return state.filter((item) => item.id !== action.payload);

    case "clear":
      return [];

    default:
      return state;
  }
}

// 총액을 구하는 함수입니다. 이것도 컴포넌트 밖의 그냥 함수입니다.
// JS자료 08단원 개념05 섹션4에서 만든 것과 똑같습니다.
function getTotal(items) {
  return items.reduce((acc, item) => acc + item.price * item.count, 0);
}

// 화면 없이 시험해 봅시다. 개념03 섹션3과 같은 방법입니다.
const testSteps = [
  { type: "add", payload: MENU[0] }, // 아메리카노
  { type: "add", payload: MENU[0] }, // 아메리카노 한 잔 더
  { type: "add", payload: MENU[2] }, // 케이크
];

const testResult = testSteps.reduce(cartReducer, []);

console.log(testResult.map((item) => item.name + " " + item.count + "개").join(", "));
// 콘솔: 아메리카노 2개, 케이크 1개

console.log(getTotal(testResult));
// 콘솔: 14000

// 4000 × 2 + 6000 = 14000 입니다.
// 브라우저를 열기 전에 규칙이 맞는지 확인한 것입니다.
// reducer 를 컴포넌트 밖에 두면 이런 검산이 가능합니다. 이게 큰 장점입니다.

// ✏️ 직접 해보기 2 — testSteps 뒤에 { type: "decrease", payload: 1 } 을 넣고
//                    콘솔 두 줄이 어떻게 바뀔지 예상한 뒤 확인해 보세요.

// ── 섹션 3: Provider 컴포넌트로 묶기 ──

// 상자를 만듭니다. 기본값은 null 입니다. 이유는 섹션 4에서 설명합니다.
const CartContext = createContext(null);

// Provider 를 직접 쓰지 않고 '감싸는 컴포넌트' 를 하나 만듭니다.
// children 은 03단원 개념04에서 배웠습니다. 태그 사이에 넣은 것이 그대로 옵니다.
function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // 값과 dispatch 를 한 객체에 담아 내려보냅니다.
  return (
    <CartContext.Provider value={{ items: items, dispatch: dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// 이렇게 컴포넌트로 감싸면 쓰는 쪽이 이렇게 짧아집니다.
//
//   <CartProvider>
//     <아무거나 />
//   </CartProvider>
//
// useReducer 도, cartReducer 도, 초기값도 쓰는 쪽에서는 안 보입니다.
// 나중에 useReducer 를 useState 로 바꿔도 쓰는 쪽 코드는 그대로입니다.

// ✏️ 직접 해보기 3 — CartProvider 의 초기값 [] 을
//                    [{ id: 1, name: "아메리카노", price: 4000, count: 1 }] 로 바꿔 보세요.
//                    화면을 열자마자 한 잔이 담겨 있어야 합니다.

// ── 섹션 4: useCart 커스텀 훅 ──

// 값을 꺼내는 쪽도 짧게 만듭시다. 커스텀 훅은 10단원 개념03에서 배웠습니다.
// use 로 시작하는 이름의 함수를 만들고 그 안에서 훅을 부르면 됩니다.

function useCart() {
  const cart = useContext(CartContext);

  // Provider 밖에서 부르면 여기서 바로 알려 줍니다.
  if (cart === null) {
    throw new Error("useCart 는 <CartProvider> 안에서만 쓸 수 있습니다");
  }

  return cart;
}

// 훅으로 감싸면 좋은 점이 셋입니다.
//
//   1) 쓰는 쪽이 짧아집니다
//        const { items, dispatch } = useCart();
//        ← useContext 도 CartContext 도 몰라도 됩니다
//
//   2) Provider 밖에서 쓴 실수를 바로 잡아 줍니다
//        개념02 [실수 1] 을 떠올려 보세요. Provider 없이 쓰면 기본값이 조용히 나왔습니다.
//        기본값을 null 로 두고 훅에서 검사하면, 조용히 틀리는 대신 그 자리에서 멈춥니다.
//        실습프로젝트에서는 ErrorBox 가 잡아서 빨간 상자에 이 문장을 보여 줍니다.
//        "조용히 틀리는 것" 보다 "요란하게 멈추는 것" 이 고치기 훨씬 쉽습니다.
//
//   3) 나중에 안쪽을 바꿔도 쓰는 쪽이 안 바뀝니다
//        Context 를 둘로 쪼개도(개념05) useCart() 만 고치면 됩니다.
//
// ★ throw 는 "여기서 멈추고 이 에러를 알려라" 는 뜻입니다. JS자료 12단원에서 봤습니다.
//   Provider 안에서만 쓰면 이 줄은 한 번도 실행되지 않습니다.

// ✏️ 직접 해보기 4 — 파일 맨 아래 Concept04CartApp 에서
//                    <CartProvider> 태그를 잠깐 지워 보세요.
//                    빨간 상자에 어떤 문장이 뜨는지 읽고 다시 되돌리세요.

// ── 섹션 5: 화면 조각 만들기 ──

// 이제 네 조각을 만듭니다. 넷 다 props 를 하나도 받지 않습니다.
// 필요한 것은 각자 useCart() 로 꺼냅니다.

function MenuList() {
  const { dispatch } = useCart(); // items 는 안 쓰므로 dispatch 만 꺼냅니다

  return (
    <div className="output">
      <strong>메뉴</strong>
      <ul>
        {MENU.map((menu) => (
          <li key={menu.id}>
            {menu.name} {menu.price}원{" "}
            <button
              onClick={() => {
                dispatch({ type: "add", payload: menu });
                console.log("담기: " + menu.name);
                // 콘솔: 담기: 아메리카노
              }}
            >
              담기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartList() {
  const { items, dispatch } = useCart();

  if (items.length === 0) {
    return <div className="output">장바구니가 비어 있습니다</div>;
  }

  return (
    <div className="output">
      <strong>장바구니</strong>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.count} = {item.price * item.count}원{" "}
            <button onClick={() => dispatch({ type: "add", payload: item })}>+</button>
            <button onClick={() => dispatch({ type: "decrease", payload: item.id })}>
              -
            </button>
            <button onClick={() => dispatch({ type: "remove", payload: item.id })}>
              빼기
            </button>
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
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

// 이 배지는 일부러 깊은 곳에 둡니다. 개념01의 4단계 트리와 같은 깊이입니다.
function CartBadge() {
  const { items } = useCart();
  // 담긴 잔 수를 전부 더합니다. reduce 를 또 씁니다.
  const count = items.reduce((acc, item) => acc + item.count, 0);
  return <span>🛒 {count}</span>;
}

function CornerBox() {
  return (
    <div className="output">
      <CartBadge />
    </div>
  );
}

function SideBar() {
  return (
    <div className="output">
      <strong>사이드바</strong>
      <CornerBox />
    </div>
  );
}

function ShopLayout() {
  // ShopLayout 도 SideBar 도 CornerBox 도 장바구니를 모릅니다. props 가 하나도 없습니다.
  return (
    <div className="output">
      <MenuList />
      <CartList />
      <CartTotal />
      <SideBar />
    </div>
  );
}

// 화면: 메뉴 네 줄, "장바구니가 비어 있습니다", "합계 0원", 사이드바 안에 🛒 0
// 화면(누르면): 아메리카노 [담기] 를 두 번 누르면
//               장바구니에 "아메리카노 × 2 = 8000원", 합계 8000원, 🛒 2
// 화면(누르면): [-] 를 한 번 누르면 × 1 로 줄고, 한 번 더 누르면 목록에서 사라집니다

// ✏️ 직접 해보기 5 — CartTotal 에 "담은 종류: N가지" 를 같이 보여 주세요.
//                    (힌트: items.length 입니다)

// ── 섹션 6: '전역' 이 아니라 'Provider 로 감싼 범위' 입니다 ──

// Context 를 배우면 "이제 어디서나 쓸 수 있는 값" 이라고 생각하기 쉽습니다.
// 정확히는 "그 Provider 로 감싼 안쪽에서만" 입니다.
//
// 확인해 봅시다. CartProvider 를 두 개 두면 장바구니도 두 개가 됩니다.

function MiniShop({ title }) {
  const { items, dispatch } = useCart();
  const count = items.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="output">
      <strong>{title}</strong>
      <p>
        {count}개 담김 / 합계 {getTotal(items)}원
      </p>
      <button onClick={() => dispatch({ type: "add", payload: MENU[0] })}>
        아메리카노 담기
      </button>
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

function TwoProvidersDemo() {
  return (
    <div>
      <CartProvider>
        <MiniShop title="1번 가게" />
      </CartProvider>
      <CartProvider>
        <MiniShop title="2번 가게" />
      </CartProvider>
    </div>
  );
}

// 화면: 두 상자 모두 "0개 담김 / 합계 0원"
// 화면(누르면): 1번 가게에서 담아도 2번 가게는 0개 그대로입니다.
//
// MiniShop 코드는 하나뿐인데 장바구니는 둘입니다.
// useReducer 의 state 는 CartProvider 컴포넌트 '한 개' 가 들고 있기 때문입니다.
// CartProvider 를 두 번 그리면 state 도 두 벌이 됩니다.
//
// 그래서 이렇게 정리할 수 있습니다.
//   Provider 를 앱 맨 위에 하나 두면  → 앱 전체가 하나를 공유합니다
//   Provider 를 화면마다 두면        → 화면마다 따로따로가 됩니다
// 어디에 두느냐가 곧 '공유 범위' 를 정하는 일입니다.

// ✏️ 직접 해보기 6 — TwoProvidersDemo 에서 <CartProvider> 하나로
//                    MiniShop 둘을 함께 감싸 보세요. 그러면 어떻게 될까요?

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] CartProvider 안에서 useCart() 를 부름
//   function CartProvider({ children }) {
//     const { items } = useCart();     ← 자기 자신을 꺼내려 합니다
//     ...
//   }
//   실수: useContext 는 '자기 위' 를 찾습니다. 자기가 만든 Provider 는 자기 아래입니다.
//         그래서 못 찾고 null 이 나와 throw 로 멈춥니다.
//         Provider 안의 값은 그냥 useReducer 가 준 items 를 쓰면 됩니다.

// [실수 2] Provider 로 감싸지 않고 화면 조각만 씀
//   <MenuList />   ← <CartProvider> 밖입니다
//   실수: useCart 의 throw 가 걸려 빨간 상자가 뜹니다.
//         "useCart 는 <CartProvider> 안에서만 쓸 수 있습니다"
//         에러 문장이 원인을 그대로 말해 줍니다. 이게 훅으로 감싼 이유입니다.

// [실수 3] reducer 에서 배열을 직접 고침
//   case "add":
//     state.push({ ...action.payload, count: 1 });
//     return state;
//   실수: 에러가 안 납니다. 화면만 안 바뀝니다.
//         07단원 개념01에서 본 그대로입니다. push 는 원본을 고치고 같은 배열을 돌려줍니다.
//         React 는 같은 배열이면 다시 그리지 않습니다.
//         [...state, 새칸] 처럼 새 배열을 만드세요.

// [실수 4] map 안에서 칸을 직접 고침
//   return state.map((item) => {
//     if (item.id === action.payload) item.count = item.count + 1;
//     return item;
//   });
//   실수: map 이 새 배열을 돌려주니 괜찮아 보입니다. 아닙니다.
//         배열은 새것이지만 안의 객체는 그대로입니다.
//         이 예제에서는 화면이 바뀌긴 합니다. 배열이 새것이니까요.
//         하지만 그 객체를 다른 곳에서도 보고 있으면 조용히 함께 바뀝니다.
//         07단원 개념02의 얕은 복사 함정입니다. { ...item, count: ... } 로 새 객체를 만드세요.

// [실수 5] key 를 안 붙임
//   {items.map((item) => <li>{item.name}</li>)}
//   실수: 화면은 나옵니다. 대신 콘솔에 경고가 뜹니다.
//         Each child in a list should have a unique "key" prop.
//         05단원 개념03에서 배운 그대로입니다. key={item.id} 를 붙이세요.

// [실수 6] payload 모양을 액션마다 다르게 해 놓고 헷갈림
//   dispatch({ type: "add", payload: menu })        ← payload 가 객체
//   dispatch({ type: "remove", payload: item.id })  ← payload 가 숫자
//   실수: 에러가 안 납니다. 잘못 넣으면 조용히 아무 일도 안 일어납니다.
//         이 파일도 위처럼 섞어 썼습니다. reducer 를 볼 때 payload 가 무엇인지 꼭 확인하세요.
//         헷갈리면 payload 대신 { type: "remove", id: item.id } 처럼 이름을 붙여도 됩니다.

export default function Concept04CartApp() {
  return (
    <div>
      <h1>개념 04 — Context 와 useReducer 함께</h1>

      <p className="guide">
        아래 화면 조각들은 <strong>props 를 하나도 받지 않습니다</strong>. 필요한 값은
        각자 <code>useCart()</code> 로 꺼냅니다.
        <br />
        <strong>F12 → Console</strong> 에서 섹션 2의 검산 결과도 확인하세요.
      </p>

      <div className="demo">
        <h3>① 장바구니 (섹션 3·4·5)</h3>
        <CartProvider>
          <ShopLayout />
        </CartProvider>
      </div>

      <div className="demo">
        <h3>② Provider 두 개 = 장바구니 두 개 (섹션 6)</h3>
        <TwoProvidersDemo />
      </div>

      <Summary
        items={[
          "reducer 를 컴포넌트 밖에 먼저 만들고, 화면 없이 reduce 로 검산할 수 있습니다.",
          "Provider 를 직접 쓰지 말고 CartProvider 같은 컴포넌트로 감싸면 쓰는 쪽이 짧아집니다.",
          "children 을 받으면 그 안쪽 전체가 Provider 범위가 됩니다.",
          "useCart 같은 커스텀 훅으로 감싸면 useContext 를 쓰는 쪽에서 몰라도 됩니다.",
          "기본값을 null 로 두고 훅에서 검사하면 Provider 밖 사용을 그 자리에서 잡아 줍니다.",
          "화면 조각들이 props 를 하나도 안 받습니다. 개념01의 중간 컴포넌트 문제가 사라집니다.",
          "'전역' 이 아니라 'Provider 로 감싼 범위' 입니다. Provider 를 둘 두면 값도 두 벌이 됩니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const MENU = [
//      ...,
//      { id: 5, name: "쿠키", price: 3000 },
//    ];
//    // 화면: 메뉴가 다섯 줄이 됩니다
//    → MenuList 는 MENU 를 map 으로 그리기만 하므로 고칠 곳이 없습니다.
//      reducer 도 그대로입니다. 메뉴가 무엇인지 모르고 payload 만 받기 때문입니다.
//
// 2) const testSteps = [
//      { type: "add", payload: MENU[0] },
//      { type: "add", payload: MENU[0] },
//      { type: "add", payload: MENU[2] },
//      { type: "decrease", payload: 1 },
//    ];
//    // 콘솔: 아메리카노 1개, 케이크 1개
//    // 콘솔: 10000
//    → payload 가 1 인 이유는 decrease 가 '아이디' 를 받기 때문입니다.
//      아메리카노의 id 가 1 입니다.
//
// 3) const [items, dispatch] = useReducer(cartReducer, [
//      { id: 1, name: "아메리카노", price: 4000, count: 1 },
//    ]);
//    // 화면: 처음부터 "아메리카노 × 1 = 4000원", 합계 4000원, 🛒 1
//    → count 를 빠뜨리면 화면에 "아메리카노 × " 까지만 나오고 합계가 NaN 이 됩니다.
//      초기값도 reducer 가 만드는 모양과 같아야 합니다.
//
// 4) 빨간 상자에 이렇게 뜹니다.
//    Error: useCart 는 <CartProvider> 안에서만 쓸 수 있습니다
//    → 화면이 통째로 사라지지 않고 이 예제만 빨간 상자가 됩니다. ErrorBox 가 잡아 준 것입니다.
//      만약 useCart 에 throw 가 없었다면 cart 가 null 이고
//      const { items } = null 에서 다른 에러가 났을 겁니다. 원인을 알기 어려웠겠지요.
//
// 5) function CartTotal() {
//      const { items, dispatch } = useCart();
//      return (
//        <div className="output">
//          <strong>합계 {getTotal(items)}원</strong> (담은 종류: {items.length}가지){" "}
//          <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
//        </div>
//      );
//    }
//    // 화면: 합계 8000원 (담은 종류: 1가지)
//    → 종류와 잔 수는 다릅니다. 아메리카노 2잔은 1가지에 2잔입니다.
//
// 6) function TwoProvidersDemo() {
//      return (
//        <CartProvider>
//          <MiniShop title="1번 가게" />
//          <MiniShop title="2번 가게" />
//        </CartProvider>
//      );
//    }
//    // 화면(누르면): 1번 가게에서 담으면 2번 가게 숫자도 같이 올라갑니다
//    → 같은 Provider 안이니 같은 state 를 봅니다.
//      "값을 공유할 범위" 는 Provider 를 어디에 두느냐로 정해집니다.
