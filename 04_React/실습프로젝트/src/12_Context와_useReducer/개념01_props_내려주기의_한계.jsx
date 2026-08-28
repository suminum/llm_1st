// ============================================================
// 12단원 · 개념 01 — props 내려주기의 한계
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요. 이 파일은 콘솔을 많이 씁니다.
// ============================================================
//
// 03단원에서 props 를 배웠습니다. 부모가 자식에게 값을 넘기는 방법입니다.
// 07단원에서는 state 를 공통 부모로 끌어올려 두 컴포넌트가 같은 값을 보게 했습니다.
//
// 여기까지는 잘 됩니다. 화면이 얕을 때는요.
//
// 그런데 실제 앱은 컴포넌트가 깊게 겹칩니다.
// 로그인한 사용자 이름 하나를 화면 맨 아래 구석에 보여 주려면,
// 그 값이 위에서 아래까지 컴포넌트를 몇 개나 지나가야 합니다.
//
// 이 파일에서는 그 불편함을 '눈으로' 봅니다.
// 아직 해결책(Context)은 나오지 않습니다. 개념02에서 나옵니다.
// 문제를 충분히 느끼는 것이 이 파일의 목표입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 4단계 깊이의 화면을 만들어 봅니다 ──

// 로그인한 사용자입니다. 이 값 하나를 맨 아래까지 보내는 것이 목표입니다.
// (JS자료와 같은 등장인물입니다)

// 컴포넌트가 이렇게 겹쳐 있습니다.
//
//   ShopPage            ← user 를 받는다
//     └ HeaderBar       ← user 를 받는다
//         └ UserMenu    ← user 를 받는다
//             └ UserBadge   ← 여기서 '드디어' user 를 쓴다
//
// 실제로 user 를 쓰는 곳은 맨 아래 UserBadge 하나뿐입니다.
// 나머지 셋은 받아서 그대로 아래로 넘기기만 합니다.

function ShopPage({ user, count, toggle }) {
  console.log("ShopPage 실행 — user 를 받았지만 쓰지 않습니다");
  // 콘솔: ShopPage 실행 — user 를 받았지만 쓰지 않습니다
  return (
    <div className="output">
      <strong>쇼핑 페이지</strong>
      {/* user 를 여기서 쓰지 않는데도 넘겨야 합니다 */}
      <HeaderBar user={user} count={count} toggle={toggle} />
    </div>
  );
}

function HeaderBar({ user, count, toggle }) {
  console.log("HeaderBar 실행 — user 를 받았지만 쓰지 않습니다");
  // 콘솔: HeaderBar 실행 — user 를 받았지만 쓰지 않습니다
  return (
    <div className="output">
      <strong>헤더</strong>
      <UserMenu user={user} count={count} toggle={toggle} />
    </div>
  );
}

function UserMenu({ user, count, toggle }) {
  console.log("UserMenu 실행 — user 를 받았지만 쓰지 않습니다");
  // 콘솔: UserMenu 실행 — user 를 받았지만 쓰지 않습니다
  return (
    <div className="output">
      <strong>사용자 메뉴</strong>
      <UserBadge user={user} count={count} toggle={toggle} />
    </div>
  );
}

function UserBadge({ user, count, toggle }) {
  console.log("UserBadge 실행 — 여기서만 user 를 씁니다");
  // 콘솔: UserBadge 실행 — 여기서만 user 를 씁니다
  return (
    <div className="output">
      {user.name} 님 ({user.age}세) /{count} / {toggle ? "on" : "off"}
    </div>
  );
}

function DeepTreeDemo() {
  const [user, setUser] = useState({ name: "김민준", age: 20 });
  const [count, setCount] = useState(0);
  const [toggle, setToggle] = useState(true);

  return (
    <div>
      <button
        onClick={() => {
          (setUser({ name: "이서연", age: 22 }),
            setCount((a) => a + 1),
            setToggle((a) => !a));
        }}
      >
        이서연으로 로그인
      </button>
      <button
        onClick={() => {
          (setUser({ name: "김민준", age: 20 }),
            setCount((a) => a + 1),
            setToggle((a) => !a));
        }}
      >
        김민준으로 로그인
      </button>
      {/* 여기서 시작해서 네 단계를 지나갑니다 */}
      <ShopPage user={user} count={count} toggle={toggle} />
    </div>
  );
}

// 화면: 상자 안에 상자가 네 겹으로 들어 있고 맨 안쪽에 "김민준 님 (20세)" 가 보입니다.
// 화면(누르면): "이서연으로 로그인" 을 누르면 맨 안쪽이 "이서연 님 (22세)" 로 바뀝니다.

// ✏️ 직접 해보기 1 — UserBadge 에서 나이를 빼고 이름만 보이게 고쳐 보세요.
//                    (고칠 곳이 몇 군데인지도 같이 생각해 보세요)

// ── 섹션 2: 중간 컴포넌트가 하는 일을 콘솔로 세어 봅니다 ──

// 위 네 컴포넌트에 console.log 를 하나씩 넣어 두었습니다.
// F12 → Console 을 열면 이렇게 찍혀 있습니다.
//
//   ShopPage 실행 — user 를 받았지만 쓰지 않습니다
//   HeaderBar 실행 — user 를 받았지만 쓰지 않습니다
//   UserMenu 실행 — user 를 받았지만 쓰지 않습니다
//   UserBadge 실행 — 여기서만 user 를 씁니다
//
// "받았지만 쓰지 않습니다" 가 세 줄입니다.
// 값 하나를 옮기려고 관계없는 컴포넌트 셋이 그 값을 들고 있는 것입니다.
//
// ★ 개발 중에는 같은 줄이 두 번씩 찍힙니다. 정상입니다.
//   실습프로젝트의 main.jsx 가 StrictMode 를 쓰기 때문입니다.
//   StrictMode 는 실수를 찾아 주려고 컴포넌트를 일부러 두 번 실행합니다.
//   09단원 개념02에서 이미 봤습니다. 두 줄이 곧 '한 번' 입니다.
//
// 이렇게 값이 중간 컴포넌트를 줄줄이 통과하는 것을
// props drilling(프롭스 내려 뚫기) 이라고 부릅니다.
// '땅을 파고 내려가듯 값을 아래로 뚫고 내려보낸다' 는 뜻입니다.
//
// 비유는 여기까지입니다. 실제로 일어나는 일은 이렇습니다.
//   HeaderBar 는 user 가 무엇인지 관심이 없습니다.
//   그런데도 매개변수에 user 를 적어야 하고, 자식에게 user={user} 를 적어야 합니다.
//   HeaderBar 를 다른 화면에서 재사용하려면 거기서도 user 를 구해서 넘겨야 합니다.

// ✏️ 직접 해보기 2 — "이서연으로 로그인" 을 누른 뒤 콘솔을 보세요.
//                    네 컴포넌트가 모두 다시 실행되는지 확인하세요.

// ── 섹션 3: 넘길 값이 하나 더 늘면 고칠 곳도 늘어납니다 ──

// 이번엔 요구사항이 하나 붙었다고 해 봅시다.
//
//   "다크 모드를 켜면 맨 아래 배지의 글자색도 바뀌게 해 주세요"
//
// 새로 내려보낼 값은 theme 하나뿐입니다.
// 그런데 고쳐야 하는 컴포넌트는 넷입니다. 아래 코드에서 세어 보세요.

function ShopPage2({ user, theme }) {
  // theme 을 쓰지 않는데 매개변수에 적어야 합니다  ← 고침 1
  return (
    <div className="output">
      <strong>쇼핑 페이지</strong>
      <HeaderBar2 user={user} theme={theme} />
    </div>
  );
}

function HeaderBar2({ user, theme }) {
  // 여기도 마찬가지입니다  ← 고침 2
  return (
    <div className="output">
      <strong>헤더</strong>
      <UserMenu2 user={user} theme={theme} />
    </div>
  );
}

function UserMenu2({ user, theme }) {
  // 여기도 마찬가지입니다  ← 고침 3
  return (
    <div className="output">
      <strong>사용자 메뉴</strong>
      <UserBadge2 user={user} theme={theme} />
    </div>
  );
}

function UserBadge2({ user, theme }) {
  // 실제로 theme 을 쓰는 곳은 여기 하나뿐입니다  ← 고침 4
  const color = theme === "dark" ? "#2d6cdf" : "#222";
  return (
    <div className="output" style={{ color: color }}>
      {user.name} 님 ({user.age}세) / 테마: {theme}
    </div>
  );
}

function TwoValuesDemo() {
  const [theme, setTheme] = useState("light");
  const user = { name: "박지훈", age: 28 };

  return (
    <div>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        테마 바꾸기
      </button>
      <ShopPage2 user={user} theme={theme} />
    </div>
  );
}

// 화면: 맨 안쪽에 "박지훈 님 (28세) / 테마: light" 가 검은 글씨로 보입니다.
// 화면(누르면): "테마 바꾸기" 를 누르면 "테마: dark" 로 바뀌고 글자가 파란색이 됩니다.

// 값 하나가 늘 때마다 중간 컴포넌트 전부를 고쳐야 합니다.
// 값이 셋(user, theme, cart)이 되면 중간 컴포넌트의 매개변수도 셋씩 늘어납니다.
// 컴포넌트가 여섯 겹이면 고칠 곳은 여섯 군데입니다.
//
// 더 나쁜 점이 있습니다.
// UserMenu2 만 따로 떼어 다른 화면에서 쓰고 싶어도,
// 그 화면에서 theme 을 구해다가 넘겨 주지 않으면 동작하지 않습니다.
// 관계없는 값이 컴포넌트에 달라붙은 것입니다.

// ✏️ 직접 해보기 3 — 위 네 컴포넌트에 size 라는 값을 하나 더 내려보내
//                    UserBadge2 의 글자 크기를 바꿔 보세요.
//                    (몇 군데를 고쳤는지 세어 보세요)

// ── 섹션 4: 그냥 파일 맨 위의 변수에 두면 안 되나요? ──

// 여기서 많은 사람이 이렇게 생각합니다.
//
//   "컴포넌트 밖에 변수를 하나 두고, 필요한 데서 그냥 꺼내 쓰면 되지 않나?"
//
// 문법상으로는 됩니다. 그런데 화면이 안 바뀝니다. 직접 확인해 봅시다.

// 컴포넌트 밖에 둔 그냥 변수입니다. state 가 아닙니다.
let globalUser = { name: "김민준", age: 20 };

function GlobalNameBox() {
  // props 를 받지 않습니다. 밖의 변수를 그냥 읽습니다.
  return <div className="output">지금 사용자: {globalUser.name}</div>;
}

function GlobalVariableDemo() {
  const [tick, setTick] = useState(0);

  return (
    <div>
      <button
        onClick={() => {
          globalUser = { name: "이서연", age: 22 };
          console.log("변수는 바뀌었습니다: " + globalUser.name);
          // 콘솔: 변수는 바뀌었습니다: 이서연
        }}
      >
        ① 변수 바꾸기
      </button>
      <button onClick={() => setTick(tick + 1)}>
        ② 다른 이유로 다시 그리기 ({tick})
      </button>
      <GlobalNameBox />
    </div>
  );
}

// 화면: "지금 사용자: 김민준"
// 화면(누르면): ① 을 눌러도 화면은 "지금 사용자: 김민준" 그대로입니다.
//               콘솔에는 "변수는 바뀌었습니다: 이서연" 이 찍힙니다.
// 화면(누르면): 그 뒤 ② 를 누르면 그제서야 "지금 사용자: 이서연" 이 됩니다.
//
// 무슨 일이 일어난 걸까요?
//   ① 은 변수만 바꿨습니다. React 는 그 사실을 모릅니다.
//      React 가 화면을 다시 그리는 계기는 오직 set 함수(그리고 뒤에 배울 dispatch)뿐입니다.
//   ② 는 tick state 를 바꿨습니다. 그래서 GlobalVariableDemo 가 다시 실행되고,
//      그 안의 GlobalNameBox 도 다시 실행되면서 '이미 바뀌어 있던' 변수를 읽은 것입니다.
//
// 즉 값이 화면에 반영된 것은 우연입니다. 04단원 개념02에서 본 것과 같은 문제입니다.
// 그래서 "그냥 전역 변수" 는 답이 아닙니다.
// 우리에게 필요한 것은 이 둘을 다 만족하는 방법입니다.
//   (1) 중간 컴포넌트를 거치지 않고 값을 꺼낼 수 있을 것
//   (2) 값이 바뀌면 React 가 화면을 다시 그려 줄 것
//
// 그게 개념02의 Context 입니다.

// ✏️ 직접 해보기 4 — ② 를 먼저 누르고 ① 을 누르면 어떻게 될지 예상한 뒤 해 보세요.

// ── 섹션 5: 그래서 무엇이 문제였나 ──

// 정리하면 props 내려주기는 이런 상황에서 불편합니다.
//
//   [상황 A] 값을 쓰는 곳이 깊다
//            → 중간 컴포넌트들이 관심 없는 값을 들고 있게 된다
//
//   [상황 B] 여러 화면이 같은 값을 본다
//            → 로그인 사용자, 테마, 장바구니, 언어 설정 같은 것들
//
//   [상황 C] 값이 자주 늘어난다
//            → 값 하나 늘 때마다 중간 컴포넌트를 전부 고쳐야 한다
//
// 반대로, 이런 경우엔 props 가 여전히 낫습니다. 잊지 마세요.
//
//   [상황 D] 한두 단계만 내려간다        → 그냥 props 를 쓰세요
//   [상황 E] 그 값을 쓰는 곳이 한 곳뿐   → 그냥 props 를 쓰세요
//
// 개념02부터 Context 를 배우지만, 배우고 나면 전부 Context 로 바꾸고 싶어집니다.
// 그러면 안 되는 이유를 개념05에서 자세히 다룹니다.

// ✏️ 직접 해보기 5 — 아래 두 경우 중 props 로 두는 게 나은 쪽을 골라 보세요.
//                    (가) 앱 전체가 쓰는 로그인 사용자 정보
//                    (나) 목록 한 줄에 보여 줄 상품 이름

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 중간 컴포넌트에서 props 를 넘겨주는 것을 빠뜨림
//   <HeaderBar />           ← user={user} 를 안 적었습니다
//   실수: 에러가 안 납니다. HeaderBar 안의 user 가 undefined 가 되고,
//         맨 아래 UserBadge 에서 user.name 을 읽는 순간 화면이 터집니다.
//         TypeError: Cannot read properties of undefined (reading 'name')
//         ★ 고칠 곳은 UserBadge 가 아니라 '넘기는 걸 빠뜨린 중간 컴포넌트' 입니다.
//         컴포넌트가 깊을수록 어디서 빠뜨렸는지 찾기가 어려워집니다. 이것도 한계입니다.

// [실수 2] props 이름을 중간에서 바꿔 씀
//   <UserMenu userInfo={user} />  ← 받는 쪽은 { user } 로 받고 있습니다
//   실수: 역시 에러가 안 납니다. user 가 undefined 가 되어 아래에서 터집니다.
//         넘기는 이름과 받는 이름은 반드시 같아야 합니다.

// [실수 3] 받은 props 를 컴포넌트 안에서 고침
//   function HeaderBar({ user }) { user.name = "홍길동"; ... }
//   실수: 에러가 안 나고 조용히 잘못 동작합니다. props 는 읽기 전용입니다(03단원 개념05).
//         게다가 위 코드는 부모가 가진 원본 객체를 직접 고칩니다.
//         React 는 값이 바뀐 줄 모르므로 화면이 안 바뀝니다(07단원 불변성).

// [실수 4] 전역 변수로 해결하려 함
//   섹션 4에서 본 그대로입니다. 값은 바뀌지만 화면이 안 바뀝니다.
//   에러가 안 나서 가장 오래 헤매는 실수입니다.

// [실수 5] 구조분해 자리에 중괄호를 빠뜨림
//   function UserBadge(user) { return <p>{user.name}</p>; }
//   실수: SyntaxError 는 아닙니다. 하지만 매개변수 자리에 오는 것은 props '객체' 입니다.
//         중괄호 없이 받으면 user 는 { user: {...} } 가 되어
//         user.name 이 undefined 가 됩니다. 화면에 아무 글자도 안 나옵니다.
//         03단원 개념03에서 배운 구조분해입니다. 중괄호를 빠뜨리지 마세요.

export default function Concept01PropsDrilling() {
  return (
    <div>
      <h1>개념 01 — props 내려주기의 한계</h1>

      <p className="guide">
        <strong>F12 → Console</strong> 을 함께 열어 두세요. 이 파일은 콘솔에
        찍히는 줄을 세어 보는 것이 핵심입니다. 개발 중에는 같은 줄이 두 번씩
        찍힙니다 (StrictMode — 정상입니다).
      </p>

      <div className="demo">
        <h3>① 네 단계를 지나가는 user (섹션 1)</h3>
        <DeepTreeDemo />
      </div>

      <div className="demo">
        <h3>② 값이 하나 더 늘었을 때 (섹션 3)</h3>
        <TwoValuesDemo />
      </div>

      <div className="demo">
        <h3>③ 그냥 변수에 두면? (섹션 4)</h3>
        <GlobalVariableDemo />
      </div>

      <Summary
        items={[
          "값을 쓰는 곳이 깊으면, 중간 컴포넌트들이 쓰지도 않는 props 를 들고 넘기게 됩니다.",
          "이것을 props drilling 이라고 부릅니다. 데모 ① 의 콘솔에서 세 줄로 확인했습니다.",
          "내려보낼 값이 하나 늘면 중간 컴포넌트를 전부 고쳐야 합니다.",
          "중간 컴포넌트에 관계없는 값이 붙으면 다른 곳에서 재사용하기 어려워집니다.",
          "컴포넌트 밖 전역 변수는 답이 아닙니다. 값은 바뀌지만 화면이 다시 그려지지 않습니다.",
          "한두 단계만 내려가거나 쓰는 곳이 한 곳이면 props 가 여전히 낫습니다.",
          "중간을 건너뛰면서 화면도 다시 그려 주는 방법이 Context 입니다. 개념02에서 배웁니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) UserBadge 의 return 을 이렇게 고칩니다.
//      return <div className="output">{user.name} 님</div>;
//    // 화면: 김민준 님
//    → 고칠 곳은 UserBadge 한 군데뿐입니다.
//      화면에 보이는 모양만 바꾸는 일은 원래 이렇게 한 곳만 고치면 됩니다.
//      그런데 섹션 3에서는 '값 하나 추가' 에 네 군데를 고쳤습니다. 이 차이가 이 파일의 요점입니다.
//
// 2) 네 컴포넌트가 모두 다시 실행됩니다.
//    // 콘솔: ShopPage 실행 — user 를 받았지만 쓰지 않습니다
//    // 콘솔: HeaderBar 실행 — user 를 받았지만 쓰지 않습니다
//    // 콘솔: UserMenu 실행 — user 를 받았지만 쓰지 않습니다
//    // 콘솔: UserBadge 실행 — 여기서만 user 를 씁니다
//    → user 가 바뀌면 그 값을 props 로 받은 컴포넌트는 전부 다시 실행됩니다.
//      쓰지 않는 컴포넌트도 예외가 아닙니다.
//
// 3) 네 군데를 고칩니다.
//      function ShopPage2({ user, theme, size }) { ... <HeaderBar2 ... size={size} /> }
//      function HeaderBar2({ user, theme, size }) { ... <UserMenu2 ... size={size} /> }
//      function UserMenu2({ user, theme, size }) { ... <UserBadge2 ... size={size} /> }
//      function UserBadge2({ user, theme, size }) {
//        return <div className="output" style={{ color: color, fontSize: size }}>...</div>;
//      }
//    // 화면: 글자 크기가 바뀝니다
//    → size 를 실제로 쓰는 곳은 마지막 한 곳인데 고친 곳은 네 곳입니다.
//
// 4) ② 를 먼저 누르면 화면은 그대로 "김민준" 입니다. 아직 변수를 안 바꿨으니까요.
//    그 뒤 ① 을 누르면 변수만 바뀌고 화면은 여전히 "김민준" 입니다.
//    // 콘솔: 변수는 바뀌었습니다: 이서연
//    → 화면을 바꾸는 것은 '변수 대입' 이 아니라 'set 함수 호출' 입니다.
//      ② 를 한 번 더 눌러야 "이서연" 이 보입니다.
//
// 5) (나) 상품 이름이 props 로 두는 게 낫습니다.
//    → 목록 한 줄이 쓰는 값은 그 줄에서만 씁니다. 깊지도 않고 여러 화면이 함께 보지도 않습니다.
//      (가) 로그인 사용자는 앱 전체가 보고 깊은 곳에서도 씁니다. Context 후보입니다.
