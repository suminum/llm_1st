// ============================================================
// 12단원 · 개념 05 — 언제 쓰나
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 을 반드시 여세요. 이 파일은 콘솔 없이는 볼 것이 없습니다.
// ============================================================
//
// 개념01~04에서 Context 와 useReducer 로 장바구니를 만들었습니다.
// 편했습니다. 그래서 이런 생각이 듭니다.
//
//   "props 로 내려보내는 건 번거로우니까, 앞으로는 다 Context 에 넣자"
//
// 이 파일은 그 생각을 말리는 파일입니다.
//
// Context 는 성능을 좋게 하는 도구가 아닙니다. 값을 '전달' 하는 도구입니다.
// 오히려 잘못 쓰면 화면을 더 많이 다시 그리게 만듭니다.
// 그리고 값이 어디서 바뀌는지 코드만 보고는 알 수 없게 만듭니다.
//
// 이 파일에서는 무엇이 얼마나 다시 그려지는지 콘솔로 직접 세어 봅니다.
// 짐작하지 말고 세어 보세요. 이 파일의 숫자는 전부 실제로 세어서 적은 것입니다.
//
// ★ 개발 중에는 StrictMode 때문에 컴포넌트가 두 번 실행됩니다.
//   그래서 콘솔에 같은 줄이 두 번씩 찍힙니다. 두 줄이 곧 '한 번 다시 그려짐' 입니다.
//   아래 설명의 '한 번' 은 전부 이 기준입니다.

import { createContext, useContext, useReducer, useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 다시 그려지는 범위를 세어 봅니다 ──

// 흔히 하는 설계입니다. 앱이 쓰는 값을 한 상자에 다 담았습니다.
const AppContext = createContext(null);

function UserName() {
  console.log("[한 상자] UserName 실행");
  // 콘솔: [한 상자] UserName 실행
  const app = useContext(AppContext);
  return <div className="output">사용자: {app.user}</div>;
}

function ThemeLabel() {
  console.log("[한 상자] ThemeLabel 실행");
  // 콘솔: [한 상자] ThemeLabel 실행
  const app = useContext(AppContext);
  return <div className="output">테마: {app.theme}</div>;
}

// Provider 컴포넌트의 JSX 안에 '직접' 들어 있는 컴포넌트입니다. context 는 안 씁니다.
function InsideBox() {
  console.log("[한 상자] InsideBox 실행 (context 안 씀)");
  // 콘솔: [한 상자] InsideBox 실행 (context 안 씀)
  return <div className="output">Provider 안쪽에 직접 놓인 상자</div>;
}

// children 으로 넘어온 컴포넌트입니다. 역시 context 는 안 씁니다.
function FromChildren() {
  console.log("[한 상자] FromChildren 실행 (children 으로 넘어옴)");
  // 콘솔: [한 상자] FromChildren 실행 (children 으로 넘어옴)
  return <div className="output">children 으로 넘어온 상자</div>;
}

function OneBoxProvider({ children }) {
  const [user, setUser] = useState("김민준");
  const [theme, setTheme] = useState("light");

  return (
    <AppContext.Provider value={{ user: user, theme: theme }}>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        테마만 바꾸기
      </button>
      <button onClick={() => setUser(user === "김민준" ? "이서연" : "김민준")}>
        사용자만 바꾸기
      </button>
      <InsideBox />
      {children}
    </AppContext.Provider>
  );
}

function OneBoxDemo() {
  return (
    <OneBoxProvider>
      <UserName />
      <ThemeLabel />
      <FromChildren />
    </OneBoxProvider>
  );
}

// 콘솔을 비우고 [테마만 바꾸기] 를 한 번 눌러 보세요. 실제로 세어 본 결과입니다.
//
//   다시 그려짐    UserName      ← 테마와 상관없습니다. user 만 읽는데도 그려집니다
//   다시 그려짐    ThemeLabel    ← 이건 당연합니다
//   다시 그려짐    InsideBox     ← context 를 안 쓰는데도 그려집니다
//   안 그려짐      FromChildren  ← context 를 안 쓰고 children 으로 넘어와서 안 그려집니다
//
// 두 가지를 알 수 있습니다.
//
// [1] 상자 하나에 값을 여럿 담으면, 그중 하나만 바뀌어도
//     그 상자를 읽는 컴포넌트가 전부 다시 그려집니다.
//     React 는 "이 컴포넌트는 app.user 만 읽더라" 를 구분하지 못합니다.
//     value 객체가 통째로 바뀐 것만 압니다.
//
// [2] Provider 를 가진 컴포넌트(OneBoxProvider)가 다시 실행되면
//     그 JSX 안에 직접 쓴 컴포넌트(InsideBox)도 같이 다시 그려집니다.
//     context 와는 상관없이, 부모가 다시 그려졌기 때문입니다.
//     반대로 children 으로 받은 것(FromChildren)은 다시 그려지지 않습니다.
//     그 자리에 들어갈 화면 조각을 '위에서 이미 만들어서 넘겨준' 것이라
//     내용이 그대로면 React 가 건너뜁니다.
//
// [2] 는 그냥 알아 두면 좋은 정도이고, 문제가 되는 것은 [1] 입니다.

// ✏️ 직접 해보기 1 — 콘솔을 지우고 [사용자만 바꾸기] 를 한 번 누르세요.
//                    ThemeLabel 이 다시 그려지는지 확인하세요.

// ── 섹션 2: 상자를 쪼개면 범위가 줄어듭니다 ──

// 같은 화면을 상자 두 개로 만들어 봅시다. user 상자, theme 상자.

const UserOnlyContext = createContext(null);
const ThemeOnlyContext = createContext(null);

function SplitUserName() {
  console.log("[쪼갠 상자] SplitUserName 실행");
  // 콘솔: [쪼갠 상자] SplitUserName 실행
  const user = useContext(UserOnlyContext);
  return <div className="output">사용자: {user}</div>;
}

function SplitThemeLabel() {
  console.log("[쪼갠 상자] SplitThemeLabel 실행");
  // 콘솔: [쪼갠 상자] SplitThemeLabel 실행
  const theme = useContext(ThemeOnlyContext);
  return <div className="output">테마: {theme}</div>;
}

function SplitProvider({ children }) {
  const [user, setUser] = useState("김민준");
  const [theme, setTheme] = useState("light");

  return (
    <UserOnlyContext.Provider value={user}>
      <ThemeOnlyContext.Provider value={theme}>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          테마만 바꾸기 (쪼갠 쪽)
        </button>
        <button onClick={() => setUser(user === "김민준" ? "이서연" : "김민준")}>
          사용자만 바꾸기 (쪼갠 쪽)
        </button>
        {children}
      </ThemeOnlyContext.Provider>
    </UserOnlyContext.Provider>
  );
}

function SplitDemo() {
  return (
    <SplitProvider>
      <SplitUserName />
      <SplitThemeLabel />
    </SplitProvider>
  );
}

// 콘솔을 비우고 [테마만 바꾸기 (쪼갠 쪽)] 를 한 번 누른 결과입니다.
//
//   다시 그려짐    SplitThemeLabel
//   안 그려짐      SplitUserName    ← 섹션 1에서는 그려졌습니다
//
// 상자를 나눈 것만으로 범위가 줄었습니다.
// 성격이 다른 값은 상자를 따로 두세요. 이것이 가장 쉬운 해결입니다.

// 값과 dispatch 를 나누는 것도 같은 이야기입니다.
// 개념04에서는 value={{ items, dispatch }} 로 함께 담았습니다.
// 그러면 items 가 바뀔 때 dispatch 만 쓰는 컴포넌트도 같이 다시 그려집니다.

function itemsReducer(state, action) {
  if (action.type === "add") return [...state, "아메리카노"];
  if (action.type === "clear") return [];
  return state;
}

const ItemsContext = createContext(null);
const DispatchContext = createContext(null);

function ItemsView() {
  console.log("[분리] ItemsView 실행");
  // 콘솔: [분리] ItemsView 실행
  const items = useContext(ItemsContext);
  return <div className="output">담긴 것: {items.length}개</div>;
}

function AddButton() {
  console.log("[분리] AddButton 실행");
  // 콘솔: [분리] AddButton 실행
  const dispatch = useContext(DispatchContext);
  return (
    <div className="output">
      <button onClick={() => dispatch({ type: "add" })}>담기</button>
      <button onClick={() => dispatch({ type: "clear" })}>비우기</button>
    </div>
  );
}

function DispatchSplitProvider({ children }) {
  const [items, dispatch] = useReducer(itemsReducer, []);
  return (
    <DispatchContext.Provider value={dispatch}>
      <ItemsContext.Provider value={items}>{children}</ItemsContext.Provider>
    </DispatchContext.Provider>
  );
}

function DispatchSplitDemo() {
  return (
    <DispatchSplitProvider>
      <ItemsView />
      <AddButton />
    </DispatchSplitProvider>
  );
}

// 콘솔을 비우고 [담기] 를 한 번 누른 결과입니다.
//
//   다시 그려짐    ItemsView
//   안 그려짐      AddButton    ← 목록이 바뀌어도 버튼은 그대로입니다
//
// 왜 AddButton 은 안 그려질까요?
// dispatch 는 화면을 다시 그려도 '같은 함수' 이기 때문입니다. React 가 그렇게 만들어 줍니다.
// 그래서 DispatchContext 의 value 는 한 번도 바뀌지 않습니다.
//
// 버튼처럼 '값은 안 보고 바꾸기만 하는' 컴포넌트가 많을수록 이 분리가 이득입니다.

// ✏️ 직접 해보기 2 — DispatchSplitProvider 를 개념04처럼
//                    value={{ items, dispatch }} 상자 하나로 되돌려 보세요.
//                    [담기] 를 눌렀을 때 AddButton 이 다시 그려지는지 확인하세요.

// ── 섹션 3: value 를 매번 새로 만들면 손해입니다 ──

// 이건 실수인데 눈에 잘 안 띕니다. 세어 봐야 보입니다.

const InlineContext = createContext(null);
const FixedContext = createContext(null);

// 컴포넌트 밖에 한 번만 만든 객체입니다. 늘 같은 객체입니다.
const FIXED_VALUE = { shopName: "우리카페" };

function InlineReader() {
  console.log("[매번 새 객체] InlineReader 실행");
  // 콘솔: [매번 새 객체] InlineReader 실행
  const info = useContext(InlineContext);
  return <div className="output">매번 새 객체: {info.shopName}</div>;
}

function FixedReader() {
  console.log("[같은 객체] FixedReader 실행");
  // 콘솔: [같은 객체] FixedReader 실행
  const info = useContext(FixedContext);
  return <div className="output">같은 객체: {info.shopName}</div>;
}

function ValueIdentityDemo() {
  const [tick, setTick] = useState(0);

  return (
    <div>
      <p>아래 버튼은 Context 와 아무 상관 없는 state 를 바꿉니다.</p>
      <button onClick={() => setTick(tick + 1)}>상관없는 state 바꾸기 ({tick})</button>

      {/* value 자리에서 객체를 새로 만듭니다. 내용은 늘 같습니다. */}
      <InlineContext.Provider value={{ shopName: "우리카페" }}>
        <InlineReader />
      </InlineContext.Provider>

      {/* 밖에서 한 번 만든 객체를 그대로 씁니다. */}
      <FixedContext.Provider value={FIXED_VALUE}>
        <FixedReader />
      </FixedContext.Provider>
    </div>
  );
}

// 콘솔을 비우고 [상관없는 state 바꾸기] 를 한 번 누른 결과입니다.
//
//   다시 그려짐    InlineReader   ← 화면에 보이는 글자는 하나도 안 바뀌었는데 그려집니다
//   안 그려짐      FixedReader
//
// 이유는 JS자료 09단원에서 배운 그대로입니다.
//   { shopName: "우리카페" } 와 { shopName: "우리카페" } 는 내용이 같아도 다른 객체입니다.
// React 는 value 가 이전과 '같은 것' 인지만 봅니다. 내용을 하나씩 비교하지 않습니다.
// 그래서 매 렌더마다 새 객체를 만들어 넣으면 매번 "바뀌었다" 로 처리됩니다.
//
// 그럼 어떻게 하나요? 값이 정말 안 바뀌는 것이면 밖에 한 번만 만들어 두세요.
// 안에서 만들어야 하면 10단원 개념05의 useMemo 로 감쌉니다.
//
//   const value = useMemo(() => ({ items, dispatch }), [items]);
//   <CartContext.Provider value={value}>
//
// 이렇게 하면 items 가 바뀔 때만 새 객체가 됩니다. 실제로 세어서 확인했습니다.
//
// ★ 다만 개념04처럼 Provider 컴포넌트가 오직 그 state 때문에만 다시 그려진다면
//   value 가 어차피 매번 바뀌어야 맞습니다. 이럴 땐 useMemo 가 하는 일이 없습니다.
//   문제가 되는 것은 '상관없는 이유로 Provider 가 다시 그려질 때' 입니다.
//   10단원에서 배운 대로, 먼저 재지 말고 쓰지는 마세요.

// ✏️ 직접 해보기 3 — InlineContext 쪽도 밖에 만들어 둔 객체를 쓰도록 고치고
//                    콘솔에서 InlineReader 가 사라지는지 확인해 보세요.

// ── 섹션 4: 먼저 검토할 것 (1) state 끌어올리기 ──

// 여기서부터가 이 파일의 진짜 요점입니다.
// Context 를 꺼내기 전에 먼저 볼 것이 둘 있습니다. 07단원에서 이미 배운 것들입니다.
//
// 첫째는 state 끌어올리기(07단원 개념03)입니다.
// 두 컴포넌트가 같은 값을 본다고 곧바로 Context 가 필요한 것이 아닙니다.
// 둘의 공통 부모가 가까이 있으면 거기에 state 를 두면 끝입니다.

function PriceInput({ price, onChange }) {
  return (
    <div className="output">
      가격{" "}
      <input
        value={price}
        onChange={(e) => onChange(Number(e.target.value))}
        type="number"
      />
    </div>
  );
}

function PriceResult({ price }) {
  return <div className="output">10잔이면 {price * 10}원입니다</div>;
}

function LiftingDemo() {
  // 두 컴포넌트가 같은 값을 봅니다. 공통 부모가 바로 여기입니다.
  const [price, setPrice] = useState(4000);

  return (
    <div>
      <PriceInput price={price} onChange={setPrice} />
      <PriceResult price={price} />
    </div>
  );
}

// 화면: 가격 입력칸에 4000, 아래에 "10잔이면 40000원입니다"
// 화면(누르면): 숫자를 4500 으로 고치면 "10잔이면 45000원입니다" 가 됩니다.
//
// Context 가 한 줄도 없습니다. 그리고 이게 더 좋습니다.
//   · PriceInput 과 PriceResult 는 어디에 갖다 놔도 그대로 동작합니다
//   · 값이 어디서 오는지 코드에 그대로 보입니다
//   · Provider 로 감싸는 것을 잊을 일도 없습니다
//
// props 로 한두 단계 내려보내는 것은 문제가 아닙니다. 정상입니다.
// 개념01에서 문제였던 것은 '쓰지도 않는 컴포넌트가 셋 이상 끼어 있을 때' 였습니다.

// ✏️ 직접 해보기 4 — LiftingDemo 에 "5잔이면 얼마" 를 보여 주는 컴포넌트를 하나 더 붙여 보세요.
//                    Context 없이 됩니까?

// ── 섹션 5: 먼저 검토할 것 (2) children 으로 구멍 뚫기 ──

// 둘째 방법입니다. 03단원 개념04의 children 을 쓰면 중간 단계를 건너뛸 수 있습니다.
//
// 개념01의 문제를 다시 봅시다.
//   Layout 이 user 를 받아서 Sidebar 에 넘기고, Sidebar 가 UserPanel 에 넘겼습니다.
//   Layout 과 Sidebar 는 user 를 쓰지도 않는데 말입니다.
//
// 그런데 왜 넘겨야 했을까요? UserPanel 을 Sidebar '안에서' 만들었기 때문입니다.
// UserPanel 을 '바깥에서' 만들어서 통째로 넘기면 됩니다.

function UserPanel({ user }) {
  return <div className="output">{user.name} 님 ({user.age}세)</div>;
}

// sidebar 자리에는 '이미 다 만들어진 화면 조각' 이 들어옵니다.
// Layout 은 그것이 무엇인지 몰라도 됩니다.
function Layout({ sidebar }) {
  return (
    <div className="output">
      <strong>레이아웃</strong>
      <div className="output">
        <strong>사이드바 자리</strong>
        {sidebar}
      </div>
    </div>
  );
}

function CompositionDemo() {
  const [user, setUser] = useState({ name: "김민준", age: 20 });

  return (
    <div>
      <button onClick={() => setUser({ name: "이서연", age: 22 })}>
        이서연으로 바꾸기
      </button>
      {/* UserPanel 을 여기서 만들어 통째로 넘깁니다 */}
      <Layout sidebar={<UserPanel user={user} />} />
    </div>
  );
}

// 화면: 레이아웃 상자 안에 사이드바 자리, 그 안에 "김민준 님 (20세)"
// 화면(누르면): 버튼을 누르면 "이서연 님 (22세)" 가 됩니다.
//
// Layout 에는 user 라는 글자가 없습니다. Context 도 없습니다.
// props 로 넘기는 것이 '값' 이 아니라 '이미 만들어진 화면' 이라는 점만 다릅니다.
//
// children 을 쓰면 <Layout><UserPanel user={user} /></Layout> 처럼 쓸 수도 있습니다.
// 자리가 여러 개면 위처럼 이름을 붙여(sidebar, header) props 로 넘깁니다.
//
// 이 방법으로 해결되는 경우가 생각보다 많습니다.
// 특히 "레이아웃 컴포넌트가 값을 나르고 있다" 면 거의 이 방법이 답입니다.

// ✏️ 직접 해보기 5 — Layout 에 header 자리를 하나 더 만들고
//                    <Layout header={...} sidebar={...} /> 로 넘겨 보세요.

// ── 섹션 6: 그래서 언제 쓰나 ──

// 순서대로 물어보세요. 위에서 걸리면 아래로 안 내려갑니다.
//
//   1) 한두 단계만 내려가나?                → props 를 쓰세요. 끝입니다.
//   2) 공통 부모가 가까운가?                → state 끌어올리기(07단원 개념03)
//   3) 중간이 레이아웃 컴포넌트인가?        → children / 화면 조각을 props 로 (섹션 5)
//   4) 그래도 셋 이상 깊고 여러 곳에서 쓰나? → Context 를 씁니다
//
// 4)까지 왔다면 다음도 같이 보세요.
//
//   [Context 에 잘 맞는 값]
//     · 앱 전체가 보고, 잘 안 바뀌는 값
//     · 로그인한 사용자, 테마, 언어 설정, 장바구니
//
//   [Context 에 넣으면 안 되는 값]
//     · 자주 바뀌는 값. 입력 중인 글자, 마우스 위치, 스크롤 위치, 타이머 숫자
//       → 섹션 1에서 봤듯이 그 상자를 읽는 컴포넌트가 전부 다시 그려집니다.
//         글자 한 자 칠 때마다 앱 절반이 다시 그려지는 화면이 이렇게 만들어집니다.
//     · 한 화면에서만 쓰는 값
//       → 그 화면의 state 로 두세요.
//
// ── 전역 상태가 정답처럼 보이는 함정 ──
//
// Context 를 배우면 "전역 상태" 라는 말이 매력적으로 들립니다.
// 어디서나 꺼내 쓸 수 있으니 편할 것 같습니다. 실제로는 이런 일이 생깁니다.
//
//   [함정 1] 상자가 하나로 뭉칩니다
//     처음엔 user 만 넣었는데, 곧 theme 이 들어오고, 장바구니가 들어오고,
//     모달 열림 여부가 들어옵니다. 어느새 AppContext 하나에 전부 들어 있습니다.
//     그러면 섹션 1의 [1] 이 앱 전체 규모로 벌어집니다.
//
//   [함정 2] 값이 어디서 바뀌는지 안 보입니다
//     props 는 코드에 경로가 그대로 보입니다. 부모를 따라 올라가면 됩니다.
//     Context 는 안 보입니다. 앱 어디에서든 dispatch 를 부를 수 있기 때문입니다.
//     "이 숫자를 누가 바꿨지?" 를 찾는 데 시간이 걸립니다.
//     그래서 개념03처럼 규칙을 reducer 한 곳에 모아 두는 것이 중요합니다.
//
//   [함정 3] 컴포넌트를 혼자 못 씁니다
//     useCart 를 쓰는 컴포넌트는 CartProvider 없이는 못 씁니다.
//     '어디서나 쓸 수 있게' 하려다 '한 곳에서만 쓸 수 있게' 된 것입니다.
//     재사용할 컴포넌트라면 값을 props 로 받는 편이 낫습니다.
//
//   [함정 4] 서버에서 받아온 데이터를 Context 에 쌓아 둡니다
//     09단원에서 fetch 로 받은 목록을 Context 에 넣고 캐시처럼 쓰고 싶어집니다.
//     그러면 언제 다시 받아야 하는지, 낡은 값을 언제 버릴지를 직접 다 관리해야 합니다.
//     이 자료의 범위를 넘어섭니다. 그런 일에는 따로 만들어진 도구들이 있습니다.
//
// 마지막으로 한 가지만 기억하세요.
// props 로 넘기는 것은 부끄러운 일이 아닙니다. 대부분의 화면은 props 로 충분합니다.

// ✏️ 직접 해보기 6 — 아래 넷 중 Context 가 어울리는 것을 골라 보세요.
//                    (가) 검색창에 지금 입력 중인 글자
//                    (나) 로그인한 사용자 정보
//                    (다) 목록 한 줄에 보여 줄 상품 이름
//                    (라) 지금 열려 있는 아코디언 항목 번호 (그 목록 안에서만 씀)

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 앱의 모든 state 를 상자 하나에 몰아넣음
//   섹션 1에서 세어 본 그대로입니다. 에러는 안 납니다. 화면만 계속 다시 그려집니다.
//   성격별로 상자를 나누세요. 나누는 데는 비용이 거의 없습니다.

// [실수 2] value 자리에서 객체를 새로 만듦
//   <CartContext.Provider value={{ items, dispatch }}>
//   실수: 섹션 3에서 세어 봤습니다. 상관없는 이유로 Provider 가 다시 그려질 때마다
//         value 가 새 객체가 되어, 읽는 컴포넌트가 전부 다시 그려집니다.
//         내용이 하나도 안 바뀌었는데도 그렇습니다.
//         고치려면 useMemo 로 감싸거나(10단원), 안 바뀌는 값은 밖에 만들어 두세요.

// [실수 3] memo 로 감싸면 Context 변경을 막을 수 있다고 생각함
//   const Row = memo(function Row() { const c = useContext(AppContext); ... });
//   실수: 막히지 않습니다. 실제로 세어서 확인했습니다.
//         memo 는 'props 가 같으면 건너뛴다' 는 도구입니다(10단원 개념05).
//         useContext 로 읽는 값은 props 가 아닙니다. 그 값이 바뀌면 memo 여도 다시 그려집니다.
//         memo 가 도움이 되는 것은 'context 를 안 쓰는데 부모 때문에 그려지는' 컴포넌트입니다.

// [실수 4] Context 를 성능 도구로 오해함
//   "props 를 많이 내려보내면 느리니까 Context 로 바꾸자"
//   실수: props 를 내려보내는 것 자체는 느리지 않습니다. 값을 넘기는 것뿐입니다.
//         Context 로 바꾸면 오히려 다시 그려지는 범위가 넓어질 수 있습니다.
//         Context 는 '코드를 정리하는 도구' 이지 '빠르게 만드는 도구' 가 아닙니다.

// [실수 5] Provider 를 조건부로 넣었다 뺐다 함
//   {로그인했나 && <CartProvider><Shop /></CartProvider>}
//   실수: 조건이 false 가 되면 CartProvider 가 화면에서 사라집니다.
//         컴포넌트가 사라지면 그 안의 state 도 같이 사라집니다.
//         다시 true 가 되면 장바구니가 빈 채로 새로 시작합니다.
//         에러가 안 나서 "왜 장바구니가 비었지?" 로만 보입니다.
//         Provider 는 화면 맨 위에 항상 두고, 안쪽에서 조건을 거세요.

// [실수 6] 상자를 쪼갠 뒤 Provider 순서를 헷갈림
//   <ItemsContext.Provider value={items}>
//     <DispatchContext.Provider value={dispatch}>
//   실수: 순서는 결과에 영향이 없습니다. 겹치는 순서는 자유입니다.
//         다만 잘 안 바뀌는 것(dispatch)을 바깥에 두면 코드를 읽기 좋습니다.
//         진짜 실수는 '한쪽 Provider 를 빼먹는 것' 입니다. 그러면 그 상자만 null 이 됩니다.

export default function Concept05WhenToUse() {
  return (
    <div>
      <h1>개념 05 — 언제 쓰나</h1>

      <p className="guide">
        <strong>F12 → Console 을 꼭 여세요.</strong> 버튼을 누르기 전에 콘솔을 한 번
        지우고(🚫 아이콘) 누르면 무엇이 다시 그려졌는지 정확히 보입니다.
        <br />
        StrictMode 때문에 한 번 그려질 때 두 줄씩 찍힙니다. <strong>두 줄이 한 번</strong>입니다.
      </p>

      <div className="demo">
        <h3>① 상자 하나에 값 둘 (섹션 1)</h3>
        <OneBoxDemo />
      </div>

      <div className="demo">
        <h3>② 상자를 쪼갠 경우 (섹션 2)</h3>
        <SplitDemo />
      </div>

      <div className="demo">
        <h3>③ 값 상자 / dispatch 상자 (섹션 2)</h3>
        <DispatchSplitDemo />
      </div>

      <div className="demo">
        <h3>④ value 를 매번 새로 만들면 (섹션 3)</h3>
        <ValueIdentityDemo />
      </div>

      <div className="demo">
        <h3>⑤ 대안 A — state 끌어올리기 (섹션 4)</h3>
        <LiftingDemo />
      </div>

      <div className="demo">
        <h3>⑥ 대안 B — 화면 조각을 통째로 넘기기 (섹션 5)</h3>
        <CompositionDemo />
      </div>

      <Summary
        items={[
          "Context 값이 바뀌면 그 상자를 읽는 컴포넌트가 전부 다시 그려집니다. 어느 속성을 읽었는지는 구분되지 않습니다.",
          "성격이 다른 값은 상자를 나누세요. 값 상자와 dispatch 상자를 나누면 버튼들은 다시 안 그려집니다.",
          "value 자리에서 객체를 새로 만들면 내용이 같아도 '바뀐 것'이 됩니다. 밖에 두거나 useMemo 로 고정하세요.",
          "memo 는 Context 변경을 막지 못합니다. memo 는 props 만 비교합니다.",
          "Context 를 꺼내기 전에 props → state 끌어올리기 → children 순서로 먼저 검토하세요.",
          "자주 바뀌는 값(입력 중인 글자 등)은 Context 에 넣지 마세요. 화면 절반이 매 글자마다 다시 그려집니다.",
          "Context 는 정리하는 도구지 빠르게 만드는 도구가 아닙니다. props 로 충분한 화면이 대부분입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) ThemeLabel 도 다시 그려집니다.
//    // 콘솔: [한 상자] UserName 실행
//    // 콘솔: [한 상자] ThemeLabel 실행
//    // 콘솔: [한 상자] InsideBox 실행 (context 안 씀)
//    → 테마를 바꿨을 때와 완전히 같은 결과입니다. FromChildren 만 빠집니다.
//      한 상자에 담긴 이상 어느 값이 바뀌든 결과가 같습니다.
//
// 2) function DispatchSplitProvider({ children }) {
//      const [items, dispatch] = useReducer(itemsReducer, []);
//      return (
//        <ItemsContext.Provider value={{ items: items, dispatch: dispatch }}>
//          {children}
//        </ItemsContext.Provider>
//      );
//    }
//    (ItemsView 는 useContext(ItemsContext).items, AddButton 은 .dispatch 를 쓰게 고칩니다)
//    // 콘솔: [분리] ItemsView 실행
//    // 콘솔: [분리] AddButton 실행
//    → AddButton 이 다시 그려집니다. 상자를 합치면 손해가 그대로 돌아옵니다.
//
// 3) const INLINE_VALUE = { shopName: "우리카페" };   ← 컴포넌트 밖에 둡니다
//    <InlineContext.Provider value={INLINE_VALUE}>
//    // 콘솔: (InlineReader 줄이 안 나옵니다)
//    → FixedReader 와 같은 결과가 됩니다. value 가 늘 같은 객체이기 때문입니다.
//
// 4) function PriceResultFive({ price }) {
//      return <div className="output">5잔이면 {price * 5}원입니다</div>;
//    }
//    LiftingDemo 안에 <PriceResultFive price={price} /> 를 한 줄 더 씁니다.
//    // 화면: 5잔이면 20000원입니다
//    → 됩니다. 공통 부모가 바로 위라서 Context 가 필요 없습니다.
//      이 상황에서 Context 를 쓰면 코드만 길어집니다.
//
// 5) function Layout({ header, sidebar }) {
//      return (
//        <div className="output">
//          <div className="output">{header}</div>
//          <div className="output"><strong>사이드바 자리</strong>{sidebar}</div>
//        </div>
//      );
//    }
//    <Layout header={<strong>우리카페</strong>} sidebar={<UserPanel user={user} />} />
//    // 화면: 위 상자에 "우리카페", 아래 상자에 "김민준 님 (20세)"
//    → Layout 은 여전히 user 를 모릅니다. 자리만 빌려줄 뿐입니다.
//
// 6) (나) 로그인한 사용자 정보입니다.
//    → (가) 는 글자를 칠 때마다 바뀝니다. 그 상자를 읽는 컴포넌트가 매 글자마다 다시 그려집니다.
//        검색창과 결과 목록의 공통 부모에 state 를 두세요(섹션 4).
//      (다) 는 그 줄에서만 씁니다. props 로 충분합니다.
//      (라) 는 그 목록 안에서만 씁니다. 목록 컴포넌트의 state 로 두세요.
//      (나) 만 앱 전체가 보고, 자주 바뀌지도 않습니다.
