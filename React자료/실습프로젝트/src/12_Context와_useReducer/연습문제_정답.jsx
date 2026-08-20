// ============================================================
// 12단원 · 연습문제 정답 (13문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 먼저 연습문제.jsx 를 스스로 풀어 보세요. 여기는 답을 맞춰 보는 곳입니다.
// 답이 하나만 있는 것은 아닙니다. 화면이 기대 결과와 같으면 맞은 것입니다.
//
// 각 문제마다 '왜 그런지' 를 같이 적어 두었습니다. 그 부분을 읽는 것이 더 중요합니다.

import { createContext, useContext, useReducer, useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ───── 문제 1 정답 ───── (개념01)
// props 를 한 단계씩 이어서 넘깁니다. 이름을 넘길 때와 받을 때가 같아야 합니다.

function Q1GrandChild({ nickname }) {
  return <div className="output">별명: {nickname}</div>;
}

function Q1Child({ nickname }) {
  // Q1Child 는 nickname 을 쓰지 않습니다. 받아서 넘기기만 합니다.
  // 이것이 개념01에서 본 props drilling 입니다.
  return (
    <div className="output">
      <Q1GrandChild nickname={nickname} />
    </div>
  );
}

function Q1Parent() {
  const nickname = "민준";
  return (
    <div className="output">
      <strong>문제 1</strong>
      <Q1Child nickname={nickname} />
    </div>
  );
}

// 화면: 별명: 민준
//
// 중간에서 이름을 바꿔 <Q1GrandChild nick={nickname} /> 라고 쓰면
// 받는 쪽 { nickname } 이 undefined 가 되어 "별명: " 만 나옵니다. 에러는 안 납니다.

// ───── 문제 2 정답 ───── (개념02)
// createContext 의 인자가 곧 기본값입니다.

const Q2Context = createContext("라이트");

function Q2Label() {
  const theme = useContext(Q2Context);
  return <div className="output">테마: {theme}</div>;
}

// 화면: 테마: 라이트
//
// 인자를 안 주면 기본값이 undefined 가 되고, JSX 는 undefined 를 아무것도 안 그립니다.
// 그래서 "테마:" 뒤가 비어 보입니다. 에러가 안 나는 것이 함정입니다.

// ───── 문제 3 정답 ───── (개념02)
// Provider 로 감싼 안쪽에서는 기본값 대신 value 가 나옵니다.

const Q3Context = createContext("라이트");

function Q3Label() {
  const theme = useContext(Q3Context);
  return <div className="output">테마: {theme}</div>;
}

function Q3Demo() {
  return (
    <div className="output">
      <strong>문제 3</strong>
      <Q3Context.Provider value="다크">
        <Q3Label />
      </Q3Context.Provider>
    </div>
  );
}

// 화면: 테마: 다크
//
// Provider 를 <Q3Label /> 아래에 두면 소용이 없습니다. 반드시 위를 감싸야 합니다.

// ───── 문제 4 정답 ───── (개념02)
//   Provider 안:  Provider 가 준 값
//   Provider 밖:  기본값입니다
//
// useContext 는 자기 위로 올라가며 같은 상자의 Provider 를 찾습니다.
// 못 찾으면 createContext 에 적어 둔 기본값을 돌려줍니다.
// 밖에 있는 라벨은 화면상 Provider 바로 아래에 그려지지만, 컴포넌트 관계로는 밖입니다.
// '화면에서 아래' 와 '컴포넌트 안' 은 다른 이야기입니다.

const Q4Context = createContext("기본값입니다");

function Q4Label({ where }) {
  const value = useContext(Q4Context);
  return (
    <div className="output">
      {where}: {value}
    </div>
  );
}

function Q4Demo() {
  return (
    <div className="output">
      <strong>문제 4</strong>
      <Q4Context.Provider value="Provider 가 준 값">
        <Q4Label where="Provider 안" />
      </Q4Context.Provider>
      <Q4Label where="Provider 밖" />
    </div>
  );
}

// 화면: Provider 안: Provider 가 준 값
// 화면: Provider 밖: 기본값입니다

// ───── 문제 5 정답 ───── (개념03)

function q5Reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    case "remove":
      if (state <= 0) return state;
      return state - 1;
    default:
      return state;
  }
}

function Q5Demo() {
  const [count, dispatch] = useReducer(q5Reducer, 0);
  return (
    <div className="output">
      <strong>문제 5</strong>
      <p>아메리카노 {count}잔</p>
      <button onClick={() => dispatch({ type: "add" })}>담기</button>
      <button onClick={() => dispatch({ type: "remove" })}>빼기</button>
    </div>
  );
}

// 화면(누르면): [담기] 세 번 → 아메리카노 3잔 / [빼기] 를 계속 눌러도 0잔에서 멈춤
//
// remove 에서 return state 를 쓴 것이 핵심입니다.
// 아무것도 return 하지 않으면 새 state 가 undefined 가 되어 화면이 터집니다.
// Math.max(state - 1, 0) 으로 써도 같은 결과입니다.

// ───── 문제 6 정답 ───── (개념03)

function q6Reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    case "reset":
      // 지금 값과 상관없이 0을 돌려줍니다
      return 0;
    default:
      return state;
  }
}

function Q6Demo() {
  const [count, dispatch] = useReducer(q6Reducer, 0);
  return (
    <div className="output">
      <strong>문제 6</strong>
      <p>아메리카노 {count}잔</p>
      <button onClick={() => dispatch({ type: "add" })}>담기</button>
      <button onClick={() => dispatch({ type: "reset" })}>비우기</button>
    </div>
  );
}

// 화면(누르면): [담기] 두 번 → 2잔 → [비우기] → 0잔
//
// dispatch 의 type 과 case 의 이름이 글자 하나라도 다르면 default 로 갑니다.
// 그러면 에러 없이 아무 일도 안 일어납니다. 개념03 [실수 4] 입니다.

// ───── 문제 7 정답 ───── (개념03)

function q7Reducer(state, action) {
  switch (action.type) {
    case "addMany":
      return state + action.payload;
    default:
      return state;
  }
}

function Q7Demo() {
  const [count, dispatch] = useReducer(q7Reducer, 0);
  return (
    <div className="output">
      <strong>문제 7</strong>
      <p>아메리카노 {count}잔</p>
      <button onClick={() => dispatch({ type: "addMany", payload: 1 })}>1잔 담기</button>
      <button onClick={() => dispatch({ type: "addMany", payload: 3 })}>3잔 담기</button>
    </div>
  );
}

// 화면(누르면): [3잔 담기] 두 번 → 아메리카노 6잔
//
// payload 라는 이름은 규칙이 아닙니다. { type: "addMany", n: 3 } 이라고 해도 됩니다.
// 다만 보내는 쪽과 읽는 쪽의 이름이 같아야 합니다.
// 이름이 다르면 action.payload 가 undefined 가 되고 state + undefined 는 NaN 이 됩니다.

// ───── 문제 8 정답 ───── (개념03)
// 답은 5 입니다.

function q8Reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    case "double":
      return state * 2;
    case "reset":
      return 0;
    default:
      return state;
  }
}

const q8Steps = [
  { type: "add" },
  { type: "add" },
  { type: "double" },
  { type: "add" },
  { type: "모르는것" },
];

console.log(q8Steps.reduce(q8Reducer, 0));
// 콘솔: 5

// 한 바퀴씩 보면 이렇습니다. JS자료 08단원 개념05에서 쓴 방법 그대로입니다.
q8Steps.reduce((state, action) => {
  const next = q8Reducer(state, action);
  console.log(`state=${state}, action=${action.type}, 결과=${next}`);
  return next;
}, 0);
// 콘솔: state=0, action=add, 결과=1
// 콘솔: state=1, action=add, 결과=2
// 콘솔: state=2, action=double, 결과=4
// 콘솔: state=4, action=add, 결과=5
// 콘솔: state=5, action=모르는것, 결과=5
//
// 마지막 "모르는것" 은 default 로 가서 state 를 그대로 돌려줍니다.
// 그래서 값이 안 바뀝니다. 실제 화면에서도 이런 일이 생기면 버튼이 먹통이 됩니다.

// ───── 문제 9 정답 ───── (개념04)

const Q9_MENU = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
];

function q9Reducer(state, action) {
  switch (action.type) {
    case "add":
      if (state.some((item) => item.id === action.payload.id)) {
        return state.map((item) =>
          item.id === action.payload.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...state, { ...action.payload, count: 1 }];
    default:
      return state;
  }
}

const Q9Context = createContext(null);

function Q9Provider({ children }) {
  const [items, dispatch] = useReducer(q9Reducer, []);
  return (
    <Q9Context.Provider value={{ items: items, dispatch: dispatch }}>
      {children}
    </Q9Context.Provider>
  );
}

function useQ9Cart() {
  const cart = useContext(Q9Context);
  if (cart === null) {
    throw new Error("useQ9Cart 는 <Q9Provider> 안에서만 쓸 수 있습니다");
  }
  return cart;
}

function Q9MenuList() {
  const { dispatch } = useQ9Cart();
  return (
    <div className="output">
      <ul>
        {Q9_MENU.map((menu) => (
          <li key={menu.id}>
            {menu.name} {menu.price}원{" "}
            <button onClick={() => dispatch({ type: "add", payload: menu })}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Q9CartList() {
  const { items } = useQ9Cart();
  if (items.length === 0) {
    return <div className="output">장바구니가 비어 있습니다</div>;
  }
  return (
    <div className="output">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} {item.count}개
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노 [담기] → "아메리카노 1개", 한 번 더 → "아메리카노 2개"
//
// onClick={dispatch({ type: "add", payload: menu })} 처럼 괄호를 붙이면 안 됩니다.
// 그리는 중에 dispatch 가 실행되어 "Too many re-renders" 에러가 납니다.
// 04단원 개념01에서 배운 그대로입니다. 화살표로 감싸세요.

// ───── 문제 10 정답 ───── (개념04)

function Q10Total() {
  const { items } = useQ9Cart();
  // JS자료 08단원 개념05 섹션4와 같은 모양입니다. 시작값 0 을 꼭 주세요.
  const total = items.reduce((acc, item) => acc + item.price * item.count, 0);
  return (
    <div className="output">
      <strong>합계 {total}원</strong>
    </div>
  );
}

function Q9Q10Demo() {
  return (
    <div className="output">
      <strong>문제 9 · 10</strong>
      <Q9Provider>
        <Q9MenuList />
        <Q9CartList />
        <Q10Total />
      </Q9Provider>
    </div>
  );
}

// 화면(누르면): 아메리카노 두 번, 라떼 한 번 담으면 "합계 12500원"
//               (4000 × 2 + 4500 × 1 = 12500)
//
// item.count 를 안 곱하면 8500 이 나옵니다. 단가만 더한 것입니다.
// 시작값 0 을 빼먹으면 빈 배열에서 TypeError 가 납니다(JS자료 08단원 섹션3).

// ───── 문제 11 정답 ───── [응용] (개념04)

const Q11_MENU = { id: 1, name: "아메리카노", price: 4000 };

function q11Reducer(state, action) {
  switch (action.type) {
    case "add":
      if (state.some((item) => item.id === action.payload.id)) {
        return state.map((item) =>
          item.id === action.payload.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...state, { ...action.payload, count: 1 }];
    case "decrease":
      // 먼저 map 으로 수량을 1 줄이고, 그 다음 filter 로 0이 된 칸을 뺍니다.
      // 순서가 반대면 안 됩니다. 먼저 걸러 버리면 줄일 대상이 사라집니다.
      return state
        .map((item) =>
          item.id === action.payload ? { ...item, count: item.count - 1 } : item
        )
        .filter((item) => item.count > 0);
    default:
      return state;
  }
}

function Q11Demo() {
  const [items, dispatch] = useReducer(q11Reducer, []);
  return (
    <div className="output">
      <strong>문제 11 [응용]</strong>
      <button onClick={() => dispatch({ type: "add", payload: Q11_MENU })}>담기</button>
      {items.length === 0 ? (
        <div className="output">비어 있습니다</div>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} {item.count}개{" "}
              <button onClick={() => dispatch({ type: "decrease", payload: item.id })}>
                -
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 화면(누르면): [담기] 두 번 → "아메리카노 2개" → [-] → "1개" → [-] → "비어 있습니다"
//
// { ...item, count: item.count - 1 } 로 새 객체를 만드는 것이 중요합니다.
// item.count = item.count - 1 처럼 직접 고치면 07단원의 얕은 복사 함정에 빠집니다.
//
// add 와 decrease 의 payload 모양이 다른 점도 보세요.
//   add 는 메뉴 객체, decrease 는 id 하나입니다. 개념04 [실수 6] 에서 짚은 부분입니다.

// ───── 문제 12 정답 ───── [도전] (개념05)
// 상자를 둘로 나누고 Provider 를 겹쳐 씁니다.

const Q12UserContext = createContext(null);
const Q12ThemeContext = createContext(null);

function Q12UserName() {
  console.log("[문제12] Q12UserName 실행");
  // 콘솔: [문제12] Q12UserName 실행
  const user = useContext(Q12UserContext);
  return <div className="output">사용자: {user}</div>;
}

function Q12ThemeLabel() {
  console.log("[문제12] Q12ThemeLabel 실행");
  // 콘솔: [문제12] Q12ThemeLabel 실행
  const theme = useContext(Q12ThemeContext);
  return <div className="output">테마: {theme}</div>;
}

function Q12Demo() {
  const [user, setUser] = useState("김민준");
  const [theme, setTheme] = useState("light");

  return (
    <div className="output">
      <strong>문제 12 [도전]</strong>
      <Q12UserContext.Provider value={user}>
        <Q12ThemeContext.Provider value={theme}>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            테마만 바꾸기
          </button>
          <button onClick={() => setUser(user === "김민준" ? "이서연" : "김민준")}>
            사용자만 바꾸기
          </button>
          <Q12UserName />
          <Q12ThemeLabel />
        </Q12ThemeContext.Provider>
      </Q12UserContext.Provider>
    </div>
  );
}

// 콘솔을 지우고 [테마만 바꾸기] 를 한 번 누른 결과입니다. 실제로 세어서 확인했습니다.
//   [문제12] Q12ThemeLabel 실행   ← 두 줄 (StrictMode)
//   Q12UserName 은 안 나옵니다
//
// 반대로 [사용자만 바꾸기] 를 누르면 Q12UserName 만 나옵니다.
//
// 한 상자였을 때는 어느 쪽을 눌러도 둘 다 나왔습니다.
// value 를 객체로 담으면 그 안의 한 속성만 바뀌어도 객체 전체가 새것이 되기 때문입니다.
// React 는 "이 컴포넌트는 user 만 읽더라" 를 구분하지 못합니다.

// ───── 문제 13 정답 ───── 에러 확인 (개념02 · 개념04)
// 고치기 전에는 이런 에러가 났습니다.
//
//   TypeError: Cannot read properties of null (reading 'name')
//
// 읽는 법: "null 의 name 을 읽을 수 없다" 입니다.
//   useContext 가 Provider 를 못 찾아 기본값 null 을 돌려줬고,
//   그 null 에서 .name 을 읽으려다 멈춘 것입니다.
//   에러는 user.name 을 읽는 Q13Badge 에서 났지만,
//   진짜 원인은 Provider 로 감싸지 않은 Q13Demo 에 있습니다.
//
// 고치는 방법은 Provider 로 감싸는 것입니다.

const Q13Context = createContext(null);

function Q13Badge() {
  const user = useContext(Q13Context);
  return <div className="output">{user.name} 님</div>;
}

function Q13Demo() {
  return (
    <div className="output">
      <strong>문제 13 (에러 확인)</strong>
      <Q13Context.Provider value={{ name: "김민준" }}>
        <Q13Badge />
      </Q13Context.Provider>
    </div>
  );
}

// 화면: 김민준 님
//
// 개념04에서 배운 대로 useCart 같은 커스텀 훅으로 감싸 두면
// "Cannot read properties of null" 대신
// "useCart 는 <CartProvider> 안에서만 쓸 수 있습니다" 라는 문장이 나옵니다.
// 같은 실수인데 고치기가 훨씬 쉬워집니다.

export default function Exercise12Answer() {
  return (
    <div>
      <h1>12단원 연습문제 — 정답</h1>

      <p className="guide">
        <strong>F12 → Console</strong> 을 함께 여세요. 문제 8의 계산 과정과 문제 12의
        다시 그려지는 범위를 콘솔에서 확인할 수 있습니다.
        <br />
        StrictMode 때문에 같은 줄이 두 번씩 찍힙니다. <strong>두 줄이 한 번</strong>입니다.
      </p>

      <div className="demo">
        <Q1Parent />
      </div>

      <div className="demo">
        <strong>문제 2</strong>
        <Q2Label />
      </div>

      <div className="demo">
        <Q3Demo />
      </div>

      <div className="demo">
        <Q4Demo />
      </div>

      <div className="demo">
        <Q5Demo />
      </div>

      <div className="demo">
        <Q6Demo />
      </div>

      <div className="demo">
        <Q7Demo />
      </div>

      <div className="demo">
        <strong>문제 8</strong>
        <p>콘솔에서 확인하세요. 답은 5 입니다.</p>
      </div>

      <div className="demo">
        <Q9Q10Demo />
      </div>

      <div className="demo">
        <Q11Demo />
      </div>

      <div className="demo">
        <Q12Demo />
      </div>

      <div className="demo">
        <Q13Demo />
      </div>

      <Summary
        items={[
          "props 는 넘기는 이름과 받는 이름이 같아야 합니다. 다르면 에러 없이 undefined 가 됩니다.",
          "createContext 의 인자가 기본값입니다. Provider 를 만나면 기본값은 쓰이지 않습니다.",
          "reducer 의 case 이름과 dispatch 의 type 이 다르면 default 로 가서 조용히 아무 일도 안 합니다.",
          "reducer 는 순수한 함수라 reduce 에 넣어 화면 없이 검산할 수 있습니다.",
          "배열 state 는 map 으로 고치고 filter 로 걸러 새 배열을 만듭니다. 원본을 고치지 마세요.",
          "상자를 쪼개면 다시 그려지는 범위가 줄어듭니다. 콘솔로 직접 세어서 확인하세요.",
          "Provider 없이 useContext 를 쓰면 기본값이 나옵니다. null 이면 그것을 읽는 자리에서 터집니다.",
        ]}
      />
    </div>
  );
}
