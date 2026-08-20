// ============================================================
// 12단원 · 개념 02 — Context 기본
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 개념01에서 이런 문제를 봤습니다.
//   - 값 하나를 깊은 곳에 보내려고 중간 컴포넌트 셋이 그 값을 들고 넘겼다
//   - 그렇다고 컴포넌트 밖 변수에 두면 화면이 다시 그려지지 않는다
//
// Context 는 이 둘을 한 번에 해결합니다.
//   - 중간 컴포넌트를 건너뛰고 값을 꺼낼 수 있습니다
//   - 값이 바뀌면 React 가 화면을 다시 그려 줍니다
//
// 쓰는 순서는 딱 세 단계입니다. 이 파일은 이 세 단계가 전부입니다.
//
//   1) createContext(기본값)      상자를 만든다        ← 컴포넌트 밖에서 한 번
//   2) <상자.Provider value={값}> 상자에 값을 넣는다   ← 위쪽 컴포넌트에서
//   3) useContext(상자)           상자에서 값을 꺼낸다 ← 아래쪽 컴포넌트에서
//
// 비유하면 '택배' 가 아니라 '방송' 입니다.
// props 는 옆집을 하나씩 거쳐 손으로 전달하는 택배이고,
// Context 는 위에서 한 번 방송하면 아래에 있는 누구나 듣는 것입니다.
//
// 비유는 여기까지입니다. 실제로 일어나는 일은 이렇습니다.
//   useContext 를 부르면 React 가 그 컴포넌트에서 위로 거슬러 올라가며
//   같은 상자의 Provider 를 찾습니다. 처음 만난 Provider 의 value 를 돌려줍니다.
//   끝까지 못 찾으면 createContext 에 적어 둔 기본값을 돌려줍니다.

import { createContext, useContext, useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: createContext — 상자를 만든다 ──

// createContext 는 컴포넌트 '밖' 에서 부릅니다. 파일 맨 위가 보통입니다.
// 인자로 준 값이 '기본값' 입니다. Provider 를 못 찾았을 때 쓰입니다.
//
// 이름은 보통 XxxContext 로 짓습니다. 대문자로 시작합니다.
// 상자 자체는 컴포넌트가 아닙니다. 값을 담는 통로일 뿐입니다.

const UserContext = createContext({ name: "손님", age: 0 });

console.log("UserContext 를 만들었습니다");
// 콘솔: UserContext 를 만들었습니다

// 이 줄은 파일이 처음 불릴 때 한 번만 찍힙니다.
// 컴포넌트 밖에 있으니 화면을 다시 그려도 다시 찍히지 않습니다.

// ✏️ 직접 해보기 1 — 기본값의 이름을 "손님" 에서 "비회원" 으로 바꾸면
//                    아래 데모 ③ 의 글자가 어떻게 바뀔지 예상해 보세요.

// ── 섹션 2: Provider — 상자에 값을 넣는다 ──

// 값을 넣고 싶은 범위를 <UserContext.Provider> 로 감쌉니다.
// value 속성에 넣은 값이 그 안쪽 전체에서 꺼내집니다.
//
//   <UserContext.Provider value={{ name: "김민준", age: 20 }}>
//     ... 이 안쪽 어디서든 꺼낼 수 있습니다 ...
//   </UserContext.Provider>
//
// value 의 중괄호가 두 겹인 이유는 02단원 개념03에서 본 것과 같습니다.
// 바깥 중괄호는 "JSX 에 자바스크립트 값을 넣는다", 안쪽 중괄호는 "객체 리터럴" 입니다.
//
// ※ React 19 부터는 <UserContext value={...}> 처럼 .Provider 를 빼고 써도 됩니다.
//    인터넷 예제에서 두 모양이 다 보일 겁니다. 이 자료는 어디서나 되는 .Provider 를 씁니다.

// ✏️ 직접 해보기 2 — 아래 ProviderDemo 의 value 를
//                    { name: "박지훈", age: 28 } 로 바꾸고 화면을 확인해 보세요.

// ── 섹션 3: useContext — 어느 깊이에서든 꺼낸다 ──

// 개념01의 네 단계 트리를 그대로 다시 만듭니다.
// 다른 점은 하나입니다. 중간 컴포넌트가 props 를 하나도 받지 않습니다.

function ShopPage() {
  // user 라는 글자가 아예 없습니다
  return (
    <div className="output">
      <strong>쇼핑 페이지</strong>
      <HeaderBar />
    </div>
  );
}

function HeaderBar() {
  return (
    <div className="output">
      <strong>헤더</strong>
      <UserMenu />
    </div>
  );
}

function UserMenu() {
  return (
    <div className="output">
      <strong>사용자 메뉴</strong>
      <UserBadge />
    </div>
  );
}

function UserBadge() {
  // 여기서 상자를 열어 값을 꺼냅니다. 위에서 아무것도 안 받았습니다.
  const user = useContext(UserContext);
  console.log("UserBadge 가 꺼낸 이름: " + user.name);
  // 콘솔: UserBadge 가 꺼낸 이름: 김민준
  return (
    <div className="output">
      {user.name} 님 ({user.age}세)
    </div>
  );
}

function ProviderDemo() {
  return (
    <UserContext.Provider value={{ name: "김민준", age: 20 }}>
      <ShopPage />
    </UserContext.Provider>
  );
}

// 화면: 상자 네 겹 안에 "김민준 님 (20세)" 가 보입니다.
//
// 개념01과 화면은 똑같습니다. 코드가 다릅니다.
//   개념01: ShopPage · HeaderBar · UserMenu 가 user 를 받아서 넘겼습니다
//   개념02: 셋 다 user 라는 글자를 쓰지 않습니다
//
// 값을 쓰는 UserBadge 와 값을 주는 Provider 만 user 를 압니다.
// 그래서 중간에 컴포넌트를 하나 더 끼워 넣어도 고칠 것이 없습니다.

// ✏️ 직접 해보기 3 — UserMenu 와 UserBadge 사이에 컴포넌트를 하나 더 끼워 보세요.
//                    (예: function Corner() { return <div className="output"><UserBadge /></div>; })
//                    화면이 그대로 나오는지 확인하세요.

// ── 섹션 4: Provider 를 못 찾으면 어떻게 되나 ──

// 두 경우가 있습니다. 결과가 다릅니다. 둘 다 에러가 안 납니다. 그래서 위험합니다.

// [경우 가] Provider 가 아예 없다 → createContext 의 기본값이 나옵니다

function OutsideBadge() {
  const user = useContext(UserContext);
  console.log("Provider 밖에서 꺼낸 이름: " + user.name);
  // 콘솔: Provider 밖에서 꺼낸 이름: 손님
  return <div className="output">{user.name} 님 ({user.age}세)</div>;
}

// 화면: 손님 님 (0세)
//
// 위 UserBadge 와 코드가 똑같은데 결과가 다릅니다.
// Provider 안이냐 밖이냐만 다릅니다.
// 이름이 안 나오는 게 아니라 '엉뚱한 이름' 이 나온다는 점이 무섭습니다.
// 화면이 멀쩡해 보여서 한참 뒤에야 발견합니다.

// [경우 나] Provider 는 있는데 value 가 undefined 다 → 기본값이 아니라 undefined 가 나옵니다

// "value 가 없으면 기본값이 나오겠지" 라고 생각하기 쉽습니다. 아닙니다.
// Provider 를 만난 순간 기본값은 더 이상 쓰이지 않습니다. value 에 있는 것이 그대로 나옵니다.
//
// 실제로 이런 실수가 자주 납니다.
//   value={settings.theme}   ← settings 에 theme 이라는 속성이 없었다
// 이러면 value 가 undefined 가 되고, 아래에서는 기본값 "light" 가 아니라 undefined 를 받습니다.

const ThemeContext = createContext("light");

function ThemeLabel() {
  const theme = useContext(ThemeContext);
  console.log("꺼낸 테마: " + theme);
  // 콘솔: 꺼낸 테마: light
  // 콘솔: 꺼낸 테마: undefined
  // ← 아래 데모에서 같은 컴포넌트를 두 자리에 놓았기 때문에 두 줄이 찍힙니다
  return <div className="output">테마: {String(theme)}</div>;
}

// 값을 구해 오다 실패한 상황을 흉내낸 것입니다. 실수로 이런 값이 들어갑니다.
const settings = { color: "blue" }; // theme 이라는 속성이 없습니다

function DefaultValueDemo() {
  return (
    <div>
      <p>Provider 밖 (기본값이 나옵니다)</p>
      <ThemeLabel />
      {/* settings.theme 은 없는 속성이라 undefined 입니다 */}
      <ThemeContext.Provider value={settings.theme}>
        <p>Provider 안인데 value 가 undefined 입니다</p>
        <ThemeLabel />
      </ThemeContext.Provider>
    </div>
  );
}

// 화면: 테마: light        ← Provider 밖이라 기본값
// 화면: 테마: undefined    ← Provider 는 만났는데 value 가 undefined
//
// 에러도 경고도 안 납니다. 화면에만 이상한 값이 보입니다.
// "기본값을 적어 뒀으니 안전하겠지" 라는 생각이 통하지 않는 경우입니다.
//
// String(theme) 로 감싼 이유가 있습니다.
// JSX 는 undefined 를 화면에 아무것도 안 그립니다(02단원). 그러면 빈칸만 보입니다.
// 여기서는 undefined 인 것을 눈으로 봐야 해서 글자로 바꿔 찍었습니다.

// ✏️ 직접 해보기 4 — DefaultValueDemo 의 Provider 를 value="dark" 로 고치고
//                    화면이 어떻게 바뀌는지 보세요.

// ── 섹션 5: 값이 바뀌면 화면도 바뀐다 ──

// 지금까지 value 에 고정된 값을 넣었습니다. 그러면 개념01의 전역 변수와 다를 게 없습니다.
// Context 의 진짜 쓸모는 value 에 state 를 넣을 때 나옵니다.
//
// value 에 state 를 넣으면
//   set 함수 호출 → Provider 를 가진 컴포넌트가 다시 실행 → value 가 새 값이 됨
//   → 그 값을 useContext 로 꺼내 쓰던 컴포넌트들이 다시 그려집니다.
//
// 값을 바꾸는 함수까지 같이 넣어 주면, 깊은 곳에서 로그인/로그아웃도 할 수 있습니다.

// 상자는 컴포넌트 밖에서 만듭니다. 기본값은 null 로 두었습니다.
// (항상 Provider 로 감쌀 계획이라 기본값을 쓸 일이 없습니다)
const AuthContext = createContext(null);

function LoginButton() {
  // 객체 안의 세 개를 한 번에 꺼냅니다(JS자료 09단원 구조분해)
  const { login, logout } = useContext(AuthContext);
  return (
    <div className="output">
      <button onClick={() => login("이서연", 22)}>로그인</button>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}

function AuthStatus() {
  const { user } = useContext(AuthContext);
  return (
    <div className="output">
      {user === null ? "로그인하지 않았습니다" : user.name + " 님 환영합니다"}
    </div>
  );
}

// 두 컴포넌트를 감싸는 중간 컴포넌트입니다. 역시 props 가 없습니다.
function AuthPage() {
  return (
    <div className="output">
      <strong>마이 페이지</strong>
      <AuthStatus />
      <LoginButton />
    </div>
  );
}

function AuthProviderDemo() {
  const [user, setUser] = useState(null);

  function login(name, age) {
    setUser({ name: name, age: age });
    console.log("로그인: " + name);
    // 콘솔: 로그인: 이서연
  }

  function logout() {
    setUser(null);
    console.log("로그아웃");
    // 콘솔: 로그아웃
  }

  // value 에 값과 함수를 함께 담아 내려보냅니다.
  // 이렇게 하면 아래 어느 컴포넌트든 login() 을 부를 수 있습니다.
  return (
    <AuthContext.Provider value={{ user: user, login: login, logout: logout }}>
      <AuthPage />
    </AuthContext.Provider>
  );
}

// 화면: "로그인하지 않았습니다" 와 [로그인] [로그아웃] 버튼
// 화면(누르면): [로그인] 을 누르면 "이서연 님 환영합니다" 로 바뀝니다.
// 화면(누르면): [로그아웃] 을 누르면 다시 "로그인하지 않았습니다" 가 됩니다.
//
// AuthPage 는 user 도 login 도 모릅니다. 그냥 자식을 그릴 뿐입니다.
// 07단원의 state 끌어올리기와 비교해 보세요.
// 그때는 부모가 함수를 props 로 자식에게 내려보냈습니다(개념04).
// 여기서는 그 함수를 Provider 의 value 에 실어 보냈습니다. 중간을 건너뜁니다.

// ✏️ 직접 해보기 5 — login 을 부를 때 이름을 "박지훈", 나이를 28 로 바꿔 보세요.

// ── 섹션 6: 상자는 여러 개 만들어도 됩니다 ──

// Context 는 하나만 쓰는 규칙이 없습니다.
// 성격이 다른 값은 상자를 나누는 편이 낫습니다. 이유는 개념05에서 자세히 다룹니다.
//
// Provider 는 겹쳐서 쓸 수 있습니다. 아래처럼요.

const LangContext = createContext("ko");

function GreetingBox() {
  const user = useContext(UserContext);
  const lang = useContext(LangContext);
  // useContext 를 두 번 부르면 상자 두 개에서 각각 꺼냅니다.
  const hello = lang === "ko" ? "안녕하세요" : "Hello";
  return (
    <div className="output">
      {hello}, {user.name}
    </div>
  );
}

function TwoContextDemo() {
  const [lang, setLang] = useState("ko");

  return (
    <div>
      <button onClick={() => setLang(lang === "ko" ? "en" : "ko")}>
        언어 바꾸기 ({lang})
      </button>
      <UserContext.Provider value={{ name: "박지훈", age: 28 }}>
        <LangContext.Provider value={lang}>
          <GreetingBox />
        </LangContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

// 화면: 안녕하세요, 박지훈
// 화면(누르면): "언어 바꾸기" 를 누르면 "Hello, 박지훈" 이 됩니다.
//
// 같은 상자의 Provider 를 겹쳐 쓰면 '가장 가까운 것' 이 이깁니다.
// 예를 들어 UserContext.Provider 안에 UserContext.Provider 를 또 두면
// 안쪽 컴포넌트는 안쪽 Provider 의 값을 봅니다. 자주 쓰는 방식은 아닙니다.

// ✏️ 직접 해보기 6 — GreetingBox 안에 UserContext.Provider 를 하나 더 만들어
//                    이름을 "김민준" 으로 덮어써 보세요. 어느 이름이 보일까요?
//                    (힌트: GreetingBox 자신이 아니라 그 '자식' 이 덮어쓴 값을 봅니다)

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] Provider 로 감싸는 것을 잊음
//   섹션 4 [경우 가] 그대로입니다. 에러가 안 나고 기본값이 조용히 나옵니다.
//   화면에 엉뚱한 값이 보이면 제일 먼저 "이 컴포넌트가 Provider 안에 있나" 를 보세요.

// [실수 2] Provider 에 value 를 아예 안 적음
//   <UserContext.Provider>  ← value 없음
//   실수: 이건 React 가 콘솔에 빨간 글씨로 알려 주는 몇 안 되는 Context 실수입니다.
//         The `value` prop is required for the `<Context.Provider>`.
//         Did you misspell it or forget to pass it?
//         화면이 멈추지는 않습니다. 값은 undefined 가 되어 아래로 내려갑니다.
//         꺼낸 값이 객체라고 생각하고 user.name 을 읽으면 그 자리에서 터집니다.
//         TypeError: Cannot read properties of undefined (reading 'name')
//   ★ value 를 '적긴 적었는데 그 값이 undefined' 인 경우는 아무 말도 안 해 줍니다.
//     섹션 4 [경우 나] 가 그 경우입니다. 그쪽이 훨씬 찾기 어렵습니다.

// [실수 3] createContext 를 컴포넌트 '안' 에서 만듦
//   function App() {
//     const MyContext = createContext(0);   ← 안 됩니다
//     ...
//   }
//   실수: 에러는 안 납니다. 그런데 App 이 다시 실행될 때마다 '새 상자' 가 만들어집니다.
//         새 상자는 아까 그 상자가 아니므로, 아래에서 꺼낸 값이 매번 초기화됩니다.
//         createContext 는 반드시 컴포넌트 밖에서 한 번만 부르세요.

// [실수 4] Provider 를 값 쓰는 컴포넌트보다 아래에 둠
//   <UserBadge />
//   <UserContext.Provider value={...}>
//     <다른것 />
//   </UserContext.Provider>
//   실수: UserBadge 는 Provider 밖입니다. 기본값이 나옵니다.
//         Provider 는 값을 쓰는 컴포넌트보다 '위' 를 감싸야 합니다.

// [실수 5] useContext 에 값을 넣음
//   const user = useContext(UserContext.Provider);
//   실수: useContext 에는 상자 자체를 넣습니다. Provider 나 value 를 넣는 것이 아닙니다.
//         잘못 넣으면 값이 undefined 가 되거나 경고가 납니다.

// [실수 6] useContext 를 조건문 안에서 부름
//   if (로그인했나) { const user = useContext(UserContext); }
//   실수: 훅의 규칙 위반입니다(10단원 개념04). 컴포넌트 맨 위에서만 부릅니다.
//         React 가 훅을 '부른 순서' 로 기억하기 때문입니다.
//         [SyntaxError] 는 아니지만 조건이 바뀌는 순간 에러가 납니다.

export default function Concept02ContextBasic() {
  return (
    <div>
      <h1>개념 02 — Context 기본</h1>

      <p className="guide">
        <strong>세 단계</strong>만 기억하세요. <code>createContext</code> 로 상자를
        만들고, <code>Provider</code> 로 값을 넣고, <code>useContext</code> 로 꺼냅니다.
        <br />
        <strong>F12 → Console</strong> 도 함께 보세요.
      </p>

      <div className="demo">
        <h3>① Provider 안에서 꺼내기 (섹션 3)</h3>
        <ProviderDemo />
      </div>

      <div className="demo">
        <h3>② Provider 밖에서 꺼내기 — 기본값 (섹션 4)</h3>
        <OutsideBadge />
      </div>

      <div className="demo">
        <h3>③ 기본값 vs value 없음 (섹션 4)</h3>
        <DefaultValueDemo />
      </div>

      <div className="demo">
        <h3>④ value 에 state 를 넣기 (섹션 5)</h3>
        <AuthProviderDemo />
      </div>

      <div className="demo">
        <h3>⑤ 상자 두 개 겹치기 (섹션 6)</h3>
        <TwoContextDemo />
      </div>

      <Summary
        items={[
          "createContext(기본값) 으로 상자를 만듭니다. 반드시 컴포넌트 밖에서 한 번만 만듭니다.",
          "<상자.Provider value={값}> 으로 감싼 범위 안에 값이 전달됩니다.",
          "useContext(상자) 로 어느 깊이에서든 값을 꺼냅니다. 중간 컴포넌트는 아무것도 안 받습니다.",
          "Provider 가 없으면 기본값이 나옵니다. 에러가 안 나므로 엉뚱한 값이 조용히 보입니다.",
          "Provider 는 있는데 value 를 안 주면 기본값이 아니라 undefined 가 나옵니다.",
          "value 에 state 를 넣으면 값이 바뀔 때 화면도 다시 그려집니다. 함수도 같이 실어 보낼 수 있습니다.",
          "상자는 여러 개 만들어도 되고 Provider 는 겹쳐 쓸 수 있습니다. 가장 가까운 Provider 가 이깁니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 기본값을 { name: "비회원", age: 0 } 으로 바꾸면
//    데모 ② 가 "비회원 님 (0세)" 로 바뀝니다.
//    // 화면: 비회원 님 (0세)
//    → 데모 ① 은 그대로 "김민준 님 (20세)" 입니다. Provider 가 있어서 기본값을 안 씁니다.
//
// 2) <UserContext.Provider value={{ name: "박지훈", age: 28 }}>
//    // 화면: 박지훈 님 (28세)
//    // 콘솔: UserBadge 가 꺼낸 이름: 박지훈
//
// 3) function Corner() {
//      return <div className="output"><UserBadge /></div>;
//    }
//    UserMenu 안에서 <UserBadge /> 대신 <Corner /> 를 씁니다.
//    // 화면: 상자가 한 겹 늘어나고 "김민준 님 (20세)" 는 그대로 보입니다
//    → 고친 곳은 UserMenu 한 줄뿐입니다. Corner 는 user 를 몰라도 됩니다.
//      개념01이었다면 Corner 에도 user 를 받아 넘기는 코드를 적어야 했습니다.
//
// 4) <ThemeContext.Provider value="dark">   ← value={settings.theme} 대신
//    // 화면: 테마: light  (Provider 밖 — 기본값)
//    // 화면: 테마: dark   (Provider 안)
//    // 콘솔: 꺼낸 테마: dark
//    → undefined 가 사라집니다. value 에 '제대로 된 값' 이 들어갔기 때문입니다.
//
// 5) <button onClick={() => login("박지훈", 28)}>로그인</button>
//    // 화면(누르면): 박지훈 님 환영합니다
//    // 콘솔: 로그인: 박지훈
//
// 6) 덮어쓴 이름은 GreetingBox 자신에게는 안 보입니다.
//    useContext 는 '자기 위' 를 찾기 때문입니다. 자기가 만든 Provider 는 자기 아래입니다.
//    // 화면: 안녕하세요, 박지훈   (GreetingBox 는 그대로)
//    → 덮어쓴 값을 보려면 그 Provider 안에 자식 컴포넌트를 하나 두고 거기서 꺼내야 합니다.
//      그 자식에서는 "김민준" 이 나옵니다.
