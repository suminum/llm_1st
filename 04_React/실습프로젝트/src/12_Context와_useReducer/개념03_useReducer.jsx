// ============================================================
// 12단원 · 개념 03 — useReducer
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 이 파일은 Context 와 상관없습니다. state 를 다루는 또 다른 방법입니다.
// 개념04에서 둘을 합칩니다.
//
// 이름부터 봅시다. useReducer 의 reducer 는 JS자료 08단원 개념05의 reduce 입니다.
//
//     배열.reduce((누적값, 현재값) => 새누적값, 시작값)
//                  ^^^^^^  ^^^^^^     ^^^^^^^^
//
//     reducer(현재state, action) => 새state
//              ^^^^^^^^  ^^^^^^     ^^^^^^^
//
// 모양이 같습니다. 하는 일도 같습니다.
//   reduce  는 '값들' 을 하나씩 접어서 최종 값 하나를 만듭니다.
//   useReducer 는 '사용자의 행동들' 을 하나씩 접어서 지금의 state 를 만듭니다.
//
// 섹션 3에서 실제로 reducer 를 reduce 에 넣어 돌려 봅니다. 그냥 돌아갑니다.
//
// switch 문은 JS자료 03단원 개념04에서 배웠습니다. 여기서 다시 씁니다.

import { useState, useReducer } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 먼저 useState 로 만들어 봅니다 ──

// 아메리카노를 몇 잔 담았는지 세는 화면입니다.
// 규칙이 둘 있습니다.
//   - 0잔 아래로는 안 내려간다
//   - 10잔을 넘지 않는다

function CounterWithState() {
  const [count, setCount] = useState(0);

  function handleAdd() {
    // 규칙이 여기에 한 벌
    if (count >= 10) return;
    setCount(count + 1);
  }

  function handleRemove() {
    // 규칙이 여기에 또 한 벌
    if (count <= 0) return;
    setCount(count - 1);
  }

  function handleClear() {
    setCount(0);
  }

  return (
    <div className="output">
      <strong>useState 방식</strong>
      <p>아메리카노 {count}잔</p>
      <button onClick={handleAdd}>담기</button>
      <button onClick={handleRemove}>빼기</button>
      <button onClick={handleClear}>비우기</button>
    </div>
  );
}

// 화면: 아메리카노 0잔
// 화면(누르면): [담기] 를 누르면 1잔, 2잔… 10잔에서 멈춥니다.
//
// 잘 돌아갑니다. 문제도 없습니다. 그런데 한 가지가 눈에 걸립니다.
// "숫자를 어떻게 바꾸는가" 하는 규칙이 handleAdd · handleRemove 두 곳에 흩어져 있습니다.
//
// 여기에 "쿠폰을 쓰면 최대 20잔" 같은 규칙이 붙으면 두 곳을 다 고쳐야 합니다.
// 버튼이 다섯 개가 되면 다섯 곳이 됩니다.
// 개념01에서 본 것과 같은 종류의 불편함입니다. 이번엔 화면이 아니라 state 쪽입니다.

// ✏️ 직접 해보기 1 — CounterWithState 에 "5잔 담기" 버튼을 추가해 보세요.
//                    (10잔을 넘지 않게 하는 규칙도 그 안에 또 적어야 합니다)

// ── 섹션 2: 같은 것을 useReducer 로 ──

// useReducer 는 "규칙을 함수 하나에 모으는" 방법입니다.
//
//   const [state, dispatch] = useReducer(reducer, 초기값);
//
//   state    지금 값. useState 의 첫 번째와 같습니다.
//   dispatch "이런 일이 있었다" 고 알리는 함수입니다.
//   reducer  그 알림을 받아 새 state 를 돌려주는 함수입니다.
//
// dispatch 를 부르면 React 가 대신 reducer(지금state, 우리가준action) 을 부릅니다.
// 그 결과를 새 state 로 삼고 화면을 다시 그립니다.
//
// action 은 "무슨 일이 있었는지" 를 담은 객체입니다.
// type 속성에 이름을 적는 것이 관례입니다. 다른 이름을 써도 동작은 합니다.

function counterReducer(state, action) {
  // state 는 지금 잔 수(숫자), action 은 { type: "..." } 모양의 객체입니다.
  switch (action.type) {
    case "add":
      // 규칙이 여기 한 곳에만 있습니다
      if (state >= 10) return state;
      return state + 1;
    case "remove":
      if (state <= 0) return state;
      return state - 1;
    case "clear":
      return 0;
    default:
      // 모르는 action 이 오면 아무 일도 없던 것으로 합니다
      return state;
  }
}

// ★ reducer 는 컴포넌트 '밖' 에 둡니다. 훅도 state 도 쓰지 않는 그냥 함수입니다.
//   값을 받아 값을 돌려줄 뿐입니다. 그래서 테스트하기 쉽습니다(섹션 3).

function CounterWithReducer() {
  const [count, dispatch] = useReducer(counterReducer, 0);

  return (
    <div className="output">
      <strong>useReducer 방식</strong>
      <p>아메리카노 {count}잔</p>
      {/* setCount(...) 대신 dispatch({ type: "..." }) 를 부릅니다 */}
      <button onClick={() => dispatch({ type: "add" })}>담기</button>
      <button onClick={() => dispatch({ type: "remove" })}>빼기</button>
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

// 화면: 아메리카노 0잔
// 화면(누르면): 왼쪽 useState 방식과 똑같이 동작합니다.
//
// 두 방식을 나란히 놓고 비교해 보세요.
//
//   [useState]  버튼마다 "숫자를 어떻게 바꿀지" 를 적는다
//               → 규칙이 화면 쪽 코드에 흩어진다
//
//   [useReducer] 버튼은 "무슨 일이 있었는지" 만 말한다
//               → 규칙은 reducer 한 곳에 모인다
//
// 버튼은 dispatch({ type: "add" }) 만 압니다. 10잔 제한이 있는 줄도 모릅니다.
// 규칙을 고칠 때 화면 코드를 열 필요가 없습니다.

// ✏️ 직접 해보기 2 — counterReducer 에 case "addFive" 를 만들고
//                    CounterWithReducer 에 "5잔 담기" 버튼을 붙여 보세요.
//                    직접 해보기 1과 비교하면 고친 곳이 어디가 다른가요?

// ── 섹션 3: reducer 는 그냥 함수입니다 — reduce 로 돌려 보기 ──

// reducer 는 React 와 아무 상관이 없는 순수한 함수입니다.
// 그래서 배열 메소드 reduce 에 그대로 넣을 수 있습니다. JS자료 08단원 개념05 그대로입니다.

const steps = [{ type: "add" }, { type: "add" }, { type: "add" }, { type: "remove" }];

console.log(steps.reduce(counterReducer, 0));
// 콘솔: 2

// 담기 3번, 빼기 1번 → 2잔입니다.
// reduce 의 콜백 자리에 counterReducer 를 그대로 넣었습니다. 아무것도 안 고쳤습니다.
//
// 한 바퀴씩 들여다봅시다. JS자료에서 acc 를 찍어 본 것과 같은 방법입니다.

steps.reduce((state, action) => {
  const next = counterReducer(state, action);
  console.log(`state=${state}, action=${action.type}, 결과=${next}`);
  return next;
}, 0);
// 콘솔: state=0, action=add, 결과=1
// 콘솔: state=1, action=add, 결과=2
// 콘솔: state=2, action=add, 결과=3
// 콘솔: state=3, action=remove, 결과=2

// 읽는 법
//   reduce 에서 콜백이 return 한 값이 다음 바퀴의 acc 가 되었습니다.
//   useReducer 에서도 reducer 가 return 한 값이 다음 state 가 됩니다.
//   다른 점은 '다음 바퀴' 가 언제 오는가입니다.
//     reduce      → 배열의 다음 칸에서 바로
//     useReducer  → 사용자가 버튼을 누를 때
//
// 그래서 useReducer 로 만든 화면은 이렇게 말할 수 있습니다.
//   "지금 state 는, 처음 값에 사용자가 한 행동들을 차례로 접은 결과다"
//
// ★ 이 코드는 컴포넌트 밖에 있어서 파일을 처음 불러올 때 한 번만 실행됩니다.
//   화면을 다시 그려도 콘솔에 다시 찍히지 않습니다.

// ✏️ 직접 해보기 3 — steps 뒤에 { type: "clear" } 를 하나 더 넣으면
//                    최종 결과가 얼마일지 예상한 뒤 확인해 보세요.

// ── 섹션 4: action 에 값을 실어 보내기 ──

// 지금까지 action 에는 type 만 있었습니다. 값을 같이 보낼 수도 있습니다.
// 속성 이름은 자유입니다. 관례로 payload(실어 보내는 짐) 를 많이 씁니다.

function amountReducer(state, action) {
  switch (action.type) {
    case "addMany":
      // action.payload 만큼 더합니다. 10잔은 여전히 최대입니다.
      if (state + action.payload > 10) return 10;
      return state + action.payload;
    case "clear":
      return 0;
    default:
      return state;
  }
}

function PayloadDemo() {
  const [count, dispatch] = useReducer(amountReducer, 0);

  return (
    <div className="output">
      <p>아메리카노 {count}잔</p>
      <button onClick={() => dispatch({ type: "addMany", payload: 1 })}>
        1잔 담기
      </button>
      <button onClick={() => dispatch({ type: "addMany", payload: 3 })}>
        3잔 담기
      </button>
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

// 화면: 아메리카노 0잔
// 화면(누르면): [3잔 담기] 를 네 번 누르면 3 → 6 → 9 → 10 이 됩니다. 12가 아닙니다.
//
// 버튼 세 개가 reducer 하나를 씁니다. 값만 다르게 실어 보냈습니다.
// "10을 넘지 않는다" 는 규칙은 여전히 reducer 안에만 있습니다.

// ✏️ 직접 해보기 4 — case "removeMany" 를 만들고
//                    payload 만큼 빼되 0 아래로는 안 내려가게 해 보세요.

// ── 섹션 5: state 가 객체일 때 ──

// 지금까지 state 는 숫자 하나였습니다. useReducer 의 진짜 쓸모는 값이 여럿일 때 나옵니다.
//
// 잔 수와 총액을 같이 관리해 봅시다. 아메리카노는 4000원입니다.
//
//   useState 라면  → setCount 와 setTotal 을 매번 짝지어 불러야 합니다
//                   한쪽만 부르면 두 값이 어긋납니다
//   useReducer 라면 → dispatch 한 번에 두 값이 같이 바뀝니다

const PRICE = 4000;

function cartReducer(state, action) {
  // state 는 { count, total } 모양의 객체입니다.
  switch (action.type) {
    case "add":
      // 07단원 불변성 그대로입니다. 원본을 고치지 않고 새 객체를 만듭니다.
      return { count: state.count + 1, total: state.total + PRICE };
    case "remove":
      if (state.count <= 0) return state;
      return { count: state.count - 1, total: state.total - PRICE };
    case "clear":
      return { count: 0, total: 0 };
    default:
      return state;
  }
}

function ObjectStateDemo() {
  const [cart, dispatch] = useReducer(cartReducer, { count: 0, total: 0 });

  return (
    <div className="output">
      <p>
        아메리카노 {cart.count}잔 / 합계 {cart.total}원
      </p>
      <button onClick={() => dispatch({ type: "add" })}>담기</button>
      <button onClick={() => dispatch({ type: "remove" })}>빼기</button>
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

// 화면: 아메리카노 0잔 / 합계 0원
// 화면(누르면): [담기] 를 두 번 누르면 "아메리카노 2잔 / 합계 8000원"
//
// 두 값이 절대 어긋나지 않습니다. 항상 같은 reducer 를 거쳐서 바뀌기 때문입니다.
//
// ※ 사실 이 예제의 total 은 count * PRICE 로 계산할 수 있습니다.
//   계산할 수 있는 값은 state 로 두지 말라고 07단원 개념05에서 배웠습니다.
//   여기서는 '두 값이 같이 바뀌는 모양' 을 보여 주려고 일부러 둘 다 두었습니다.
//   실제로 만들 때는 total 을 빼고 count * PRICE 로 그리는 쪽이 낫습니다.

// ✏️ 직접 해보기 5 — case "addLatte" 를 만들어 4500원짜리 라떼도 담을 수 있게 해 보세요.
//                    (잔 수는 1 늘고 총액은 4500 늘어야 합니다)

// ── 섹션 6: useState 와 useReducer 중 무엇을 쓸까 ──

// 정답은 "대부분 useState" 입니다. useReducer 가 더 좋은 도구가 아닙니다.
//
//   [useState 를 쓴다]
//     · 값이 하나거나 둘이다
//     · 바꾸는 방법이 단순하다 (그냥 새 값을 넣는다)
//     · 바꾸는 곳이 한두 곳이다
//
//   [useReducer 를 생각해 본다]
//     · 값이 여럿이고 서로 맞물려 바뀐다 (섹션 5의 count 와 total)
//     · 바꾸는 방법이 여러 가지다 (담기 · 빼기 · 비우기 · 쿠폰 적용 …)
//     · 같은 규칙을 여러 화면에서 쓴다
//     · 다음 값이 이전 값에 많이 의존한다
//
// 바꾸는 규칙이 늘어날수록 useReducer 가 유리해집니다.
// 반대로 규칙이 하나뿐이면 useReducer 는 코드만 길어집니다.
//
// 두 방법은 성능 차이가 없습니다. 읽기 쉬운 쪽을 고르는 문제입니다.
//
// 그리고 useState 로 시작했다가 나중에 바꿔도 됩니다.
// 섹션 1과 섹션 2에서 봤듯이 화면 부분은 거의 그대로입니다.

// ✏️ 직접 해보기 6 — 아래 셋 중 useReducer 가 어울리는 것을 골라 보세요.
//                    (가) 입력칸 하나의 글자
//                    (나) 모달 창이 열렸는지 여부
//                    (다) 담기·빼기·수량변경·쿠폰적용이 있는 장바구니

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] reducer 안에서 state 를 직접 고침
//   case "add":
//     state.count = state.count + 1;   ← 원본을 고쳤습니다
//     return state;                     ← 같은 객체를 돌려줬습니다
//   실수: 에러가 안 납니다. 그런데 화면이 안 바뀝니다.
//         React 는 이전 state 와 새 state 가 '같은 객체' 면 다시 그리지 않습니다.
//         07단원에서 배운 불변성이 여기서도 그대로 적용됩니다.
//         반드시 { ...state, count: state.count + 1 } 처럼 새 객체를 만드세요.

// [실수 2] reducer 에서 return 을 빠뜨림
//   case "clear":
//     { count: 0, total: 0 };   ← return 이 없습니다
//   실수: 새 state 가 undefined 가 됩니다. 다음 화면에서 state.count 를 읽는 순간 터집니다.
//         TypeError: Cannot read properties of undefined (reading 'count')
//         JS자료 08단원 reduce 에서 본 것과 완전히 같은 실수입니다.

// [실수 3] default 를 빼먹음
//   switch 에 default 가 없으면 모르는 action 에서 undefined 가 돌아옵니다.
//   실수: 실수 2와 같은 증상입니다. default: return state; 를 항상 적으세요.

// [실수 4] action 의 type 을 오타냄
//   dispatch({ type: "ad" })   ← "add" 를 잘못 적었습니다
//   실수: 에러도 경고도 안 납니다. default 로 가서 state 를 그대로 돌려줍니다.
//         버튼을 눌러도 아무 일이 안 일어납니다. 원인을 찾기 어렵습니다.
//         reducer 의 default 에 console.log 를 넣어 두면 금방 찾습니다.
//           default:
//             console.log("모르는 action:", action.type);
//             return state;

// [실수 5] dispatch 에 괄호를 붙여서 넘김
//   <button onClick={dispatch({ type: "add" })}>
//   실수: 04단원 개념01과 같은 실수입니다. 화면을 그리는 중에 dispatch 가 실행됩니다.
//         그러면 state 가 바뀌고 → 다시 그리고 → 또 실행되고 … 무한히 반복됩니다.
//         React 가 "Too many re-renders" 에러를 내고 화면이 멈춥니다.
//         onClick={() => dispatch({ type: "add" })} 처럼 감싸세요.

// [실수 6] reducer 를 컴포넌트 안에 정의
//   function Cart() {
//     function reducer(state, action) { ... }   ← 동작은 합니다
//     const [state, dispatch] = useReducer(reducer, 0);
//   실수: 에러는 안 납니다. 다만 화면을 그릴 때마다 함수를 새로 만듭니다.
//         무엇보다 '화면과 상관없는 규칙' 이 화면 코드 안에 다시 들어가 버립니다.
//         useReducer 를 쓰는 이유가 사라집니다. 컴포넌트 밖에 두세요.

export default function Concept03UseReducer() {
  return (
    <div>
      <h1>개념 03 — useReducer</h1>

      <p className="guide">
        <code>reducer(state, action)</code> 은 JS자료 08단원의{" "}
        <code>reduce((acc, 값) =&gt; 새acc)</code> 와 같은 모양입니다.
        <br />
        <strong>F12 → Console</strong> 을 열면 섹션 3의 한 바퀴씩 도는 모습을 볼 수 있습니다.
      </p>

      <div className="demo">
        <h3>① 같은 기능, 두 방식 (섹션 1·2)</h3>
        <CounterWithState />
        <CounterWithReducer />
      </div>

      <div className="demo">
        <h3>② action 에 값 싣기 (섹션 4)</h3>
        <PayloadDemo />
      </div>

      <div className="demo">
        <h3>③ state 가 객체일 때 (섹션 5)</h3>
        <ObjectStateDemo />
      </div>

      <Summary
        items={[
          "useReducer(reducer, 초기값) 은 [state, dispatch] 를 돌려줍니다.",
          "dispatch({ type: '...' }) 는 '무슨 일이 있었다' 고 알리는 것입니다. 값을 직접 정하지 않습니다.",
          "reducer(state, action) 이 새 state 를 돌려줍니다. 규칙이 이 함수 한 곳에 모입니다.",
          "reducer 는 컴포넌트 밖의 그냥 함수입니다. 배열의 reduce 에 그대로 넣어도 돌아갑니다.",
          "action 에 payload 를 실어 값을 같이 보낼 수 있습니다.",
          "state 가 객체면 반드시 새 객체를 돌려주세요. 직접 고치면 화면이 안 바뀝니다.",
          "대부분은 useState 로 충분합니다. 규칙이 여럿이고 값이 맞물릴 때 useReducer 를 생각하세요.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function handleAddFive() {
//      if (count + 5 > 10) return;
//      setCount(count + 5);
//    }
//    <button onClick={handleAddFive}>5잔 담기</button>
//    // 화면(누르면): 0 → 5 → 10, 그 뒤로는 안 늘어납니다
//    → "10을 넘지 않는다" 는 규칙을 세 번째로 또 적었습니다.
//
// 2) case "addFive":
//      if (state + 5 > 10) return state;
//      return state + 5;
//    <button onClick={() => dispatch({ type: "addFive" })}>5잔 담기</button>
//    // 화면(누르면): 0 → 5 → 10, 그 뒤로는 안 늘어납니다
//    → 화면 쪽에 새로 적은 것은 dispatch 한 줄뿐입니다.
//      규칙은 reducer 안에서만 늘었습니다. 1번과 비교해 보세요.
//
// 3) 0 입니다.
//    const steps = [{ type: "add" }, { type: "add" }, { type: "add" },
//                   { type: "remove" }, { type: "clear" }];
//    console.log(steps.reduce(counterReducer, 0));
//    // 콘솔: 0
//    → clear 는 앞의 결과와 상관없이 0을 돌려줍니다. 그래서 마지막 값이 답입니다.
//
// 4) case "removeMany":
//      if (state - action.payload < 0) return 0;
//      return state - action.payload;
//    <button onClick={() => dispatch({ type: "removeMany", payload: 3 })}>3잔 빼기</button>
//    // 화면(누르면): 10잔에서 세 번 누르면 7 → 4 → 1, 한 번 더 누르면 0
//
// 5) case "addLatte":
//      return { count: state.count + 1, total: state.total + 4500 };
//    <button onClick={() => dispatch({ type: "addLatte" })}>라떼 담기</button>
//    // 화면(누르면): 아메리카노 1잔 담고 라떼 1잔 담으면 "2잔 / 합계 8500원"
//    → 화면 글자가 "아메리카노 2잔" 인 것이 어색해집니다.
//      메뉴별로 나누려면 state 를 배열로 바꿔야 합니다. 개념04에서 그렇게 만듭니다.
//
// 6) (다) 입니다.
//    → (가) 는 값 하나에 바꾸는 방법도 하나입니다. useState 가 짧습니다.
//      (나) 도 true/false 뿐입니다. useState 가 짧습니다.
//      (다) 는 바꾸는 방법이 넷이고 값들이 서로 맞물립니다. reducer 한 곳에 모을 값어치가 있습니다.
