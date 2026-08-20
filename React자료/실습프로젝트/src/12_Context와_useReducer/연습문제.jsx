// ============================================================
// 12단원 · 연습문제 (13문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 푸는 법
//   1) 아래로 내려가며 // TODO 를 찾아 코드를 고칩니다.
//   2) 저장하면 화면이 저절로 바뀝니다(Vite). F5 를 누르지 않아도 됩니다.
//   3) 각 문제의 '기대 결과' 와 화면을 비교합니다.
//   4) 막히면 개념01~05 파일의 해당 섹션을 다시 보세요.
//
// 순서는 기본 10문제 → [응용] → [도전] → 에러 확인 입니다. 뒤로 갈수록 어렵습니다.
// 정답은 연습문제_정답.jsx 에 있습니다. 먼저 스스로 해 보세요.
//
// ★ 고치기 전 지금 화면에는 "(아직 안 고쳤습니다)" 같은 글자가 보입니다. 정상입니다.

import { createContext, useContext, useReducer, useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ───── 문제 1 ───── (개념01)
// props 를 세 단계로 내려보내 보세요.
// Q1Parent 가 nickname 을 가지고 있습니다. 이것이 Q1GrandChild 에 보여야 합니다.
// Q1Child 는 nickname 을 쓰지 않지만 받아서 넘겨야 합니다.
//
// 기대 결과 (화면): 별명: 민준
//                  "별명: (아직 안 고쳤습니다)" 가 그대로면 아직 안 넘긴 것입니다.
//                  "별명: " 뒤가 비면 이름을 잘못 적어(nickName 등) undefined 가 된 것입니다.

function Q1GrandChild() {
  // TODO: props 를 받아 nickname 을 화면에 보여 주세요
  return <div className="output">별명: (아직 안 고쳤습니다)</div>;
}

function Q1Child() {
  // TODO: props 를 받아 Q1GrandChild 에 그대로 넘기세요
  return (
    <div className="output">
      <Q1GrandChild />
    </div>
  );
}

function Q1Parent() {
  const nickname = "민준";
  // TODO: Q1Child 에 nickname 을 넘기세요
  return (
    <div className="output">
      <strong>문제 1</strong>
      <Q1Child />
    </div>
  );
}

// ───── 문제 2 ───── (개념02)
// createContext 의 기본값을 "라이트" 로 지정하세요.
// 지금은 인자를 안 줬기 때문에 기본값이 undefined 입니다.
//
// 기대 결과 (화면): 테마: 라이트
//                  "테마:" 뒤가 비어 있으면 아직 기본값을 안 준 것입니다.
//                  (JSX 는 undefined 를 화면에 아무것도 그리지 않습니다 — 02단원)

// TODO: createContext 안에 "라이트" 를 넣으세요
const Q2Context = createContext();

function Q2Label() {
  const theme = useContext(Q2Context);
  return <div className="output">테마: {theme}</div>;
}

// ───── 문제 3 ───── (개념02)
// Q3Label 을 Provider 로 감싸서 "다크" 가 보이게 하세요.
// 상자와 라벨은 이미 만들어져 있습니다. Q3Demo 만 고치면 됩니다.
//
// 기대 결과 (화면): 테마: 다크
//                  "테마: 라이트" 가 보이면 아직 Provider 로 안 감싼 것입니다(기본값이 나온 것).

const Q3Context = createContext("라이트");

function Q3Label() {
  const theme = useContext(Q3Context);
  return <div className="output">테마: {theme}</div>;
}

function Q3Demo() {
  // TODO: <Q3Label /> 을 <Q3Context.Provider value="다크"> 로 감싸세요
  return (
    <div className="output">
      <strong>문제 3</strong>
      <Q3Label />
    </div>
  );
}

// ───── 문제 4 ───── (개념02)
// 아래 Q4Demo 에는 같은 컴포넌트가 두 번 놓여 있습니다.
// 하나는 Provider 안, 하나는 Provider 밖입니다.
// 화면을 보기 전에 각각 무엇이 보일지 예상해서 아래 빈칸에 적어 보세요.
//
//   Provider 안:  ____________
//   Provider 밖:  ____________
//
// 기대 결과: 먼저 예상해서 적은 뒤 화면과 비교하세요.
//           예상이 틀렸다면 개념02 섹션 4를 다시 보세요.
// TODO: 예상을 위 빈칸에 적은 뒤, 아래 코드는 고치지 말고 화면만 확인하세요.

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

// ───── 문제 5 ───── (개념03)
// reducer 에 case "add" 와 case "remove" 를 만드세요.
// add 는 1 늘리고, remove 는 1 줄입니다. 0 아래로는 내려가지 않습니다.
//
// 기대 결과 (화면): [담기] 를 세 번 누르면 "아메리카노 3잔"
//                  [빼기] 를 여러 번 눌러도 0잔에서 멈춥니다.
//                  버튼을 눌러도 숫자가 안 변하면 case 가 default 로 빠진 것입니다.

function q5Reducer(state, action) {
  switch (action.type) {
    // TODO: case "add" 와 case "remove" 를 여기에 쓰세요
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

// ───── 문제 6 ───── (개념03)
// 아래 reducer 에 case "reset" 을 추가해 0으로 되돌리세요.
// 그리고 Q6Demo 에 [비우기] 버튼을 만들어 dispatch 하세요.
// (add 는 이미 만들어져 있습니다)
//
// 기대 결과 (화면): [담기] 를 두 번 눌러 2잔이 된 뒤 [비우기] 를 누르면 0잔
//                  [비우기] 를 눌렀는데 그대로면 type 이름이 서로 다른 것입니다.

function q6Reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    // TODO: case "reset" 을 여기에 쓰세요
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
      {/* TODO: [비우기] 버튼을 여기에 만드세요 */}
    </div>
  );
}

// ───── 문제 7 ───── (개념03)
// action 에 값을 실어 보내세요.
// case "addMany" 를 만들고 action.payload 만큼 늘리세요.
// 버튼 두 개는 각각 1과 3을 실어 보냅니다.
//
// 기대 결과 (화면): [3잔 담기] 를 두 번 누르면 "6잔"
//                  숫자가 안 변하면 case 이름이 다르거나 payload 를 안 읽은 것입니다.
//                  NaN 이 나오면 payload 를 안 보냈거나 이름을 잘못 읽은 것입니다.

function q7Reducer(state, action) {
  switch (action.type) {
    // TODO: case "addMany" 를 여기에 쓰세요
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

// ───── 문제 8 ───── (개념03)
// reducer 는 컴포넌트 밖의 그냥 함수라서 배열의 reduce 에 넣어 돌릴 수 있습니다.
// 아래 q8Steps 를 q8Reducer 로 접으면 결과가 얼마일까요?
// 먼저 종이에 예상해 보고, 그 다음 console.log 를 써서 확인하세요.
//
// 기대 결과 (콘솔): 예상한 숫자와 같아야 합니다.
//                  틀렸다면 한 바퀴씩 찍어 보세요(개념03 섹션 3의 방법).

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

// TODO: 아래 줄의 주석을 풀어 결과를 콘솔에서 확인하세요
// console.log(q8Steps.reduce(q8Reducer, 0));

// ───── 문제 9 ───── (개념04)
// 아래 장바구니는 Provider 와 useCart 훅까지 다 만들어져 있습니다.
// Q9MenuList 의 [담기] 버튼이 아무 일도 하지 않습니다. dispatch 를 부르게 고치세요.
//
// 기대 결과 (화면): [담기] 를 누르면 아래에 "아메리카노 1개" 가 생깁니다.
//                  한 번 더 누르면 "아메리카노 2개" 가 됩니다.
//                  아무 변화가 없으면 dispatch 를 안 부른 것입니다.

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
            {/* TODO: 누르면 dispatch({ type: "add", payload: menu }) 가 되게 하세요 */}
            <button>담기</button>
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

// ───── 문제 10 ───── (개념04)
// Q10Total 이 총액을 보여 주게 만드세요. reduce 를 쓰세요(JS자료 08단원 개념05).
// 한 칸의 금액은 price * count 입니다.
// (문제 9의 장바구니를 그대로 씁니다. 문제 9를 먼저 푸세요)
//
// 기대 결과 (화면): 아메리카노 2개, 라떼 1개를 담으면 "합계 12500원"
//                  "합계 0원" 에서 안 변하면 아직 안 고친 것입니다.
//                  "합계 8500원" 이면 count 를 안 곱한 것입니다.

function Q10Total() {
  const { items } = useQ9Cart();
  // TODO: reduce 로 총액을 구해 total 에 담으세요
  const total = 0;
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

// ───── 문제 11 ───── [응용] (개념04)
// 수량을 줄이는 기능을 만드세요.
// case "decrease" 를 추가해서 count 를 1 줄이되, 0이 되면 목록에서 아예 빼세요.
// (힌트: map 으로 줄인 다음 filter 로 거릅니다. 개념04 섹션 2와 같은 방법입니다)
//
// 기대 결과 (화면): [담기] 두 번 → "아메리카노 2개" → [-] → "1개" → [-] → 목록에서 사라짐
//                  "아메리카노 0개" 가 남아 있으면 filter 를 안 한 것입니다.
//                  숫자가 음수로 내려가면 filter 조건이 잘못된 것입니다.

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
    // TODO: case "decrease" 를 여기에 쓰세요 (payload 는 id 입니다)
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

// ───── 문제 12 ───── [도전] (개념05)
// 아래는 상자 하나에 user 와 theme 을 같이 담은 코드입니다.
// [테마만 바꾸기] 를 누르면 Q12UserName 도 같이 다시 그려집니다. 콘솔에서 확인하세요.
//
// 이것을 상자 두 개로 쪼개서, 테마를 바꿔도 Q12UserName 이 다시 그려지지 않게 만드세요.
// 고칠 곳은 세 군데입니다. 상자 만들기 / Provider / 꺼내 쓰는 곳.
//
// 기대 결과 (콘솔): 콘솔을 지우고 [테마만 바꾸기] 를 한 번 누르면
//                  "[문제12] Q12ThemeLabel 실행" 만 나와야 합니다.
//                  "[문제12] Q12UserName 실행" 이 같이 나오면 아직 한 상자인 것입니다.
//                  ★ StrictMode 때문에 같은 줄이 두 번씩 찍힙니다. 두 줄이 한 번입니다.

// TODO: 상자를 Q12UserContext 와 Q12ThemeContext 두 개로 나누세요
const Q12Context = createContext(null);

function Q12UserName() {
  console.log("[문제12] Q12UserName 실행");
  // 콘솔: [문제12] Q12UserName 실행
  // TODO: user 만 담긴 상자에서 꺼내도록 고치세요
  const app = useContext(Q12Context);
  return <div className="output">사용자: {app.user}</div>;
}

function Q12ThemeLabel() {
  console.log("[문제12] Q12ThemeLabel 실행");
  // 콘솔: [문제12] Q12ThemeLabel 실행
  // TODO: theme 만 담긴 상자에서 꺼내도록 고치세요
  const app = useContext(Q12Context);
  return <div className="output">테마: {app.theme}</div>;
}

function Q12Demo() {
  const [user, setUser] = useState("김민준");
  const [theme, setTheme] = useState("light");

  // TODO: Provider 를 두 개로 겹쳐서 각각 user 와 theme 만 내려보내세요
  return (
    <div className="output">
      <strong>문제 12 [도전]</strong>
      <Q12Context.Provider value={{ user: user, theme: theme }}>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          테마만 바꾸기
        </button>
        <button onClick={() => setUser(user === "김민준" ? "이서연" : "김민준")}>
          사용자만 바꾸기
        </button>
        <Q12UserName />
        <Q12ThemeLabel />
      </Q12Context.Provider>
    </div>
  );
}

// ───── 문제 13 ───── 에러 확인 (개념02 · 개념04)
// 아래 Q13Badge 는 기본값이 null 인 상자에서 값을 꺼냅니다.
// 그런데 Provider 로 감싸지 않았습니다.
//
// (1) 아래 TODO 의 주석을 풀고 저장하세요. 화면에 빨간 상자가 뜹니다.
//     에러 문장을 읽고 무슨 뜻인지 생각해 보세요.
// (2) 확인했으면 Q13Demo 에서 Provider 로 감싸 고치세요.
//     value 는 { name: "김민준" } 입니다.
// (3) 고친 뒤에는 주석을 푼 채로 두어도 빨간 상자가 안 뜹니다.
//
// 기대 결과 (화면): 고치기 전 → 빨간 상자에
//                    TypeError: Cannot read properties of null (reading 'name')
//                  고친 뒤   → 김민준 님
//                  ★ 이 예제만 빨간 상자가 되고 왼쪽 메뉴와 다른 예제는 멀쩡합니다.
//                    ErrorBox 가 잡아 주기 때문입니다.

const Q13Context = createContext(null);

function Q13Badge() {
  const user = useContext(Q13Context);
  // TODO: 아래 줄의 주석을 풀어 어떤 에러가 나는지 확인하세요
  // return <div className="output">{user.name} 님</div>;
  return <div className="output">(아직 확인하지 않았습니다)</div>;
}

function Q13Demo() {
  // TODO: (2)에서 여기를 Q13Context.Provider 로 감싸세요
  return (
    <div className="output">
      <strong>문제 13 (에러 확인)</strong>
      <Q13Badge />
    </div>
  );
}

export default function Exercise12() {
  return (
    <div>
      <h1>12단원 연습문제</h1>

      <p className="guide">
        <strong>F12 → Console</strong> 을 함께 여세요. 문제 8과 12는 콘솔로 확인합니다.
        <br />
        고치기 전에는 "(아직 안 고쳤습니다)" 같은 글자가 보입니다. 정상입니다.
        <br />
        저장하면 화면이 저절로 바뀝니다. F5 를 누르지 않아도 됩니다.
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
        <p>콘솔에서 확인하는 문제입니다. 화면에는 아무것도 안 나옵니다.</p>
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
          "문제 1~4: props 로 내려보내기와 Context 세 단계(createContext · Provider · useContext).",
          "문제 5~8: reducer 를 만들고 dispatch 로 부르기. reducer 는 reduce 에 넣어 돌려볼 수 있습니다.",
          "문제 9~11: Context 와 useReducer 를 합쳐 장바구니 만들기. 불변 갱신을 지키세요.",
          "문제 12: 상자를 쪼개면 다시 그려지는 범위가 줄어듭니다. 콘솔로 세어서 확인하세요.",
          "문제 13: Provider 없이 useContext 를 쓰면 어떤 에러가 나는지 직접 보고 고칩니다.",
          "다 풀었으면 연습문제_정답.jsx 와 비교해 보세요. 답이 하나만 있는 것은 아닙니다.",
        ]}
      />
    </div>
  );
}
