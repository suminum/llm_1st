// ============================================================
// 04단원 · 개념 04 — 여러 state 다루기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       버튼을 눌러 보세요. F12 → Console 도 함께.
// ============================================================
//
// 지금까지 state 는 한 컴포넌트에 하나뿐이었습니다.
// 실제 화면에는 바뀌는 값이 여러 개 있습니다.
//   담은 개수, 고른 메뉴, 포장할지 말지, 로그인했는지 ...
//
// 이 파일에서 두 가지를 배웁니다.
//   ① state 를 여러 개 두는 법과, 숫자 말고 어떤 값을 담을 수 있는지
//   ② 값을 언제 나누고 언제 하나로 묶는지

// ── 섹션 1: state 를 여러 개 두기 ──

// 방법은 아주 단순합니다. useState 를 필요한 만큼 줄줄이 적으면 됩니다.
// 서로 아무 상관이 없습니다. 각자 자기 값을 따로 기억합니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function TwoCounters() {
  const [americano, setAmericano] = useState(0);
  const [latte, setLatte] = useState(0);

  function addAmericano() {
    setAmericano(americano + 1);
    console.log("아메리카노를 담았습니다. 지금까지:", americano + 1, "잔");
    // 콘솔: 아메리카노를 담았습니다. 지금까지: 1 잔
  }

  function addLatte() {
    setLatte(latte + 1);
    console.log("라떼를 담았습니다. 지금까지:", latte + 1, "잔");
    // 콘솔: 라떼를 담았습니다. 지금까지: 1 잔
  }

  return (
    <div className="demo">
      <h3>① state 두 개 — 따로 셉니다</h3>
      <div className="output" id="twoOut">
        아메리카노 {americano}잔 / 라떼 {latte}잔
      </div>
      <button id="btnAmericano" onClick={addAmericano}>
        아메리카노 +1
      </button>
      <button id="btnLatte" onClick={addLatte}>
        라떼 +1
      </button>
    </div>
  );
}

// 화면(누르면): 아메리카노 1잔 / 라떼 0잔
//
// 아메리카노 쪽을 눌러도 라떼는 그대로입니다. 서로 남남입니다.
//
// 다만 둘 중 하나만 바뀌어도 컴포넌트 전체가 다시 실행됩니다.
// 개념03에서 본 그대로입니다. useState 두 줄이 모두 다시 지나가고,
// 그때 React 는 각각 기억해 둔 값을 순서대로 돌려줍니다.
//
// '순서대로' 라는 말을 기억해 두세요.
// React 는 이름으로 구분하지 않습니다. 몇 번째로 부른 useState 인지로 구분합니다.
// 그래서 useState 를 부르는 순서가 렌더링마다 달라지면 안 됩니다.
// 이 규칙은 개념06에서 다시 나옵니다.

// ✏️ 직접 해보기 1 — 케이크 개수를 세는 state 를 하나 더 넣고
//                    '케이크 +1' 버튼을 만들어 보세요.

// ── 섹션 2: 숫자 말고 다른 값도 state 가 됩니다 ──

// state 에는 자바스크립트 값이면 무엇이든 담깁니다.
// 이번에는 문자열을 담아 봅시다. 오늘 고른 메뉴 이름입니다.

function MenuPicker() {
  const [menu, setMenu] = useState("아직 안 골랐습니다");

  function pick(name) {
    setMenu(name);
    console.log("고른 메뉴:", name);
    // 콘솔: 고른 메뉴: 아메리카노
    // 콘솔: 고른 메뉴: 라떼
    // 콘솔: 고른 메뉴: 케이크
  }

  return (
    <div className="demo">
      <h3>② 문자열 state — 고른 메뉴</h3>
      <div className="output" id="menuOut">
        오늘의 메뉴: {menu}
      </div>
      <button id="btnPickAmericano" onClick={() => pick("아메리카노")}>
        아메리카노
      </button>
      <button id="btnPickLatte" onClick={() => pick("라떼")}>
        라떼
      </button>
      <button id="btnPickCake" onClick={() => pick("케이크")}>
        케이크
      </button>
    </div>
  );
}

// 화면(누르면): 오늘의 메뉴: 아메리카노
//
// 버튼 세 개가 함수 하나를 같이 씁니다. 넘기는 값만 다릅니다.
// 개념01 섹션 3에서 배운 () => 함수(값) 모양입니다.
//
// 여기서 state 는 '고른 메뉴 이름' 하나입니다.
// 버튼마다 state 를 하나씩 두면 어떻게 될까요?
//   isAmericanoPicked, isLattePicked, isCakePicked ...
// 이러면 "라떼를 고르면 아메리카노를 꺼야 한다" 같은 일을 손으로 해야 합니다.
// 한 번에 하나만 고를 수 있는 값이라면, 고른 것 하나만 state 로 두는 편이 낫습니다.

// ✏️ 직접 해보기 2 — '삼각김밥' 버튼을 하나 더 만들어 보세요.

// ── 섹션 3: 참/거짓 state 와 토글 ──

// true / false 를 담는 state 는 아주 자주 씁니다.
//   포장할까 말까, 열려 있나 닫혀 있나, 다 했나 안 했나 ...
//
// 뒤집을 때는 JS자료 02단원의 ! 를 씁니다. JS자료 11단원의 그 토글과 같습니다.
//
//     setIsPacked(!isPacked);
//
// ! 는 true 를 false 로, false 를 true 로 뒤집습니다.

function PackToggle() {
  const [isPacked, setIsPacked] = useState(false);

  function toggle() {
    setIsPacked(!isPacked);
    console.log("포장 여부를 뒤집었습니다:", !isPacked);
    // 콘솔: 포장 여부를 뒤집었습니다: true
  }

  // 화면에 쓸 글자를 미리 만들어 둡니다.
  // 삼항 연산자는 JS자료 03단원, 그리고 이 자료 02단원 개념02에서 봤습니다.
  const packText = isPacked ? "포장" : "매장에서 마시기";
  const boxClass = isPacked ? "output on" : "output";
  const buttonText = isPacked ? "매장으로 바꾸기" : "포장으로 바꾸기";

  return (
    <div className="demo">
      <h3>③ 참/거짓 state — 켜고 끄기</h3>
      <div className={boxClass} id="packOut">
        지금 선택: {packText}
      </div>
      <button id="btnPack" onClick={toggle}>
        {buttonText}
      </button>
    </div>
  );
}

// 화면(누르면): 지금 선택: 포장
//
// 눌러 보면 글자와 배경색과 버튼 글자가 한꺼번에 바뀝니다.
// 그런데 우리가 바꾼 값은 isPacked 하나뿐입니다.
//
// JS자료 11단원에서는 이 세 곳을 전부 손으로 고쳤습니다.
//   out4.textContent = ... / out4.classList.toggle(...) / btn4.textContent = ...
// React 에서는 값 하나만 바꾸고, 화면 설명은 그 값으로부터 매번 새로 만듭니다.
// 이것이 01단원에서 말한 선언형입니다.
//
// 값을 미리 변수에 담아 둔 이유는 return 안이 복잡해지지 않게 하려는 것뿐입니다.
// 이런 변수는 렌더링마다 새로 계산됩니다. state 로 둘 필요가 없습니다.

// ✏️ 직접 해보기 3 — buttonText 를 "포장 ON" / "포장 OFF" 로 바꿔 보세요.

// ── 섹션 4: 나눌까, 하나로 묶을까 ──

// 값이 늘어나면 이런 고민이 생깁니다.
//
//     const [name, setName] = useState("김민준");
//     const [age, setAge] = useState(20);
//
// 이렇게 따로 둘까요, 아니면 객체 하나로 묶을까요?
//
//     const [user, setUser] = useState({ name: "김민준", age: 20 });
//
// 둘 다 됩니다. 판단 기준은 이렇습니다.
//
//   따로 둔다  — 각자 따로 바뀌는 값. 대부분 이쪽이 편합니다.
//   묶는다     — 항상 같이 붙어 다니는 값. 한 덩어리로 다뤄야 할 때.
//
// 처음에는 따로 두는 쪽을 권합니다. 실수할 여지가 적습니다.
// 묶어 두면 아래처럼 '나머지를 옮겨 담는' 일을 잊기 쉽기 때문입니다.

function ProfileCard() {
  const [user, setUser] = useState({ name: "김민준", age: 20 });

  function birthday() {
    // 객체를 그대로 고치지 않습니다. 새 객체를 만들어 넣습니다.
    // ... 은 JS자료 09단원 개념04의 객체 스프레드입니다.
    // "user 의 내용을 전부 옮겨 담고, age 만 새 값으로 덮어쓴다" 는 뜻입니다.
    const nextUser = { ...user, age: user.age + 1 };

    console.log("새 객체를 만들어 넣습니다:", nextUser);
    // 콘솔: 새 객체를 만들어 넣습니다: { name: '김민준', age: 21 }

    setUser(nextUser);
  }

  function rename() {
    const nextUser = { ...user, name: "이서연" };

    console.log("이름만 바꿨습니다:", nextUser.name, "/ 나이는 그대로:", nextUser.age === user.age);
    // 콘솔: 이름만 바꿨습니다: 이서연 / 나이는 그대로: true

    setUser(nextUser);
  }

  return (
    <div className="demo">
      <h3>④ 객체 하나로 묶기 (맛보기)</h3>
      <div className="output" id="profileOut">
        {user.name} ({user.age}세)
      </div>
      <button id="btnBirthday" onClick={birthday}>
        생일 축하 (나이 +1)
      </button>
      <button id="btnRename" onClick={rename}>
        이름을 이서연으로
      </button>
    </div>
  );
}

// 화면(누르면): 김민준 (21세)
//
// 여기서 꼭 봐야 할 것은 { ...user, age: ... } 입니다.
// user 를 직접 고치지 않고 '새 객체' 를 만들어 넣었습니다.
//
// 왜 그래야 하는지는 개념06에서 재현해 보고,
// 배열·중첩 객체까지 제대로 다루는 것은 07단원입니다.
// 지금은 "객체 state 는 새로 만들어 넣는다" 만 기억하세요.

// ✏️ 직접 해보기 4 — user 에 city: "서울" 을 넣고 화면에도 보여 주세요.
//                    (시작값과 화면 두 곳을 고치면 됩니다)

// ── 섹션 5: 계산으로 나오는 값은 state 로 두지 않는다 ──

// 초보자가 가장 자주 하는 설계 실수입니다.
// 아메리카노 개수와 케이크 개수가 state 라면, 합계도 state 로 둬야 할까요?
//
// 두지 않습니다. 합계는 두 값으로 '계산할 수 있는' 값이기 때문입니다.
// state 는 개념03에서 봤듯이 렌더링마다 다시 계산되는 자리가 아닙니다.
// 계산되는 값은 그냥 보통 변수로 두면 매번 새로 맞춰집니다.

function Cart() {
  const [americanoCount, setAmericanoCount] = useState(0);
  const [cakeCount, setCakeCount] = useState(0);

  // ↓ state 가 아닙니다. 렌더링할 때마다 다시 계산되는 보통 변수입니다.
  const total = americanoCount * 4000 + cakeCount * 6000;
  const itemCount = americanoCount + cakeCount;

  function addAmericano() {
    setAmericanoCount(americanoCount + 1);
    console.log("아메리카노 담기 — 합계는 따로 안 고칩니다");
    // 콘솔: 아메리카노 담기 — 합계는 따로 안 고칩니다
  }

  function addCake() {
    setCakeCount(cakeCount + 1);
    console.log("케이크 담기 — 합계는 따로 안 고칩니다");
    // 콘솔: 케이크 담기 — 합계는 따로 안 고칩니다
  }

  function clear() {
    setAmericanoCount(0);
    setCakeCount(0);
    console.log("장바구니를 비웠습니다");
    // 콘솔: 장바구니를 비웠습니다
  }

  return (
    <div className="demo">
      <h3>⑤ 합계는 state 가 아닙니다</h3>
      <div className="output" id="cartOut">
        아메리카노 {americanoCount}개 + 케이크 {cakeCount}개 = 모두 {itemCount}개,{" "}
        {total}원
      </div>
      <button id="btnCartAmericano" onClick={addAmericano}>
        아메리카노 담기
      </button>
      <button id="btnCartCake" onClick={addCake}>
        케이크 담기
      </button>
      <button id="btnCartClear" onClick={clear}>
        비우기
      </button>
    </div>
  );
}

// 화면(누르면): 아메리카노 1개 + 케이크 0개 = 모두 1개, 4000원
//
// total 을 state 로 뒀다면 어떻게 됐을까요?
// 담을 때마다 setTotal 도 같이 불러 줘야 합니다. 한 번만 잊어도 값이 어긋납니다.
// 게다가 '비우기' 에서도, 나중에 '빼기' 를 만들어도 매번 챙겨야 합니다.
//
// 지금처럼 두면 계산식이 한 곳에만 있습니다. 어긋날 수가 없습니다.
// 이 이야기는 07단원 개념05에서 어긋나는 장면까지 직접 재현해 봅니다.
//
// 판단 기준 한 줄: 다른 state 로 계산해 낼 수 있으면 state 로 두지 않습니다.
//
// clear 에서 set 함수를 두 번 불렀지만 화면은 한 번만 다시 그려집니다.
// React 가 같은 이벤트 안의 변경들을 모아서 한 번에 처리하기 때문입니다.

// ✏️ 직접 해보기 5 — 라떼(4500원) 담기 버튼을 추가하고
//                    합계에도 반영되게 해 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 객체 state 를 갈아 끼우면서 나머지를 빠뜨렸다
//   setUser({ age: user.age + 1 });      // ← ...user 가 없습니다
// 실수: 에러가 안 납니다. 그런데 name 이 사라집니다.
//       "새 객체를 통째로 넣는다" 는 뜻이라, 안 적은 속성은 없어집니다.
//       화면에서는 이름 자리가 그냥 빈칸이 됩니다. 아래 데모 ⑥ 에서 직접 보세요.

function BrokenProfile() {
  const [user, setUser] = useState({ name: "박지훈", age: 28 });

  function wrongBirthday() {
    setUser({ age: user.age + 1 }); // ...user 를 빠뜨린 코드입니다
    console.log("스프레드 없이 넣었습니다. 이름이 어떻게 될까요?");
    // 콘솔: 스프레드 없이 넣었습니다. 이름이 어떻게 될까요?
  }

  return (
    <div className="demo">
      <h3>⑥ [실수 1] 눌러 보세요 — 이름이 사라집니다</h3>
      <div className="output" id="brokenProfileOut">
        이름: {user.name} / 나이: {user.age}
      </div>
      <button id="btnWrongBirthday" onClick={wrongBirthday}>
        생일 축하 (잘못된 코드)
      </button>
    </div>
  );
}

// 화면(누르면): 이름:  / 나이: 29
// 이름 자리가 비었습니다. user.name 이 undefined 가 되었기 때문입니다.
// React 는 undefined 를 화면에 아무것도 안 그립니다. 그래서 에러 없이 조용히 빕니다.

// [실수 2] 관련 없는 값까지 객체 하나에 다 몰아넣었다
//   const [everything, setEverything] = useState({ count: 0, menu: "", isOpen: false });
// 실수: 에러는 없지만 값 하나 바꿀 때마다 매번 ...everything 을 적어야 합니다.
//       나눠 두면 setCount(1) 한 줄이면 끝납니다. 처음에는 나누는 쪽이 편합니다.

// [실수 3] 계산할 수 있는 값을 state 로 뒀다 (섹션 5)
//   const [total, setTotal] = useState(0);
// 실수: 에러가 안 납니다. 대신 어느 날 화면의 개수와 합계가 서로 안 맞습니다.
//       set 을 한 군데서 빠뜨렸기 때문인데, 찾기가 아주 어렵습니다.

// [실수 4] 토글할 때 값을 그냥 true 로 넣었다
//   setIsPacked(true);
// 실수: 처음 한 번은 잘 되는 것처럼 보입니다. 그런데 다시 눌러도 계속 true 입니다.
//       꺼지지 않습니다. 뒤집으려면 !isPacked 를 넣어야 합니다.

// [실수 5] useState 를 조건문 안에서 불렀다
//   if (isPacked) {
//     const [box, setBox] = useState("");
//   }
// 실수: React 는 useState 를 부른 '순서' 로 값을 찾습니다.
//       조건에 따라 순서가 달라지면 값이 뒤섞이거나 에러가 납니다.
//       개념06에서 다시 짚고, 자세한 이유는 10단원에서 다룹니다.

// [실수 6] 시작값 객체 안에 쉼표를 빠뜨렸다
//   useState({ name: "김민준" age: 20 })
// 실수: [SyntaxError] 입니다. 파일 전체가 안 돌아가고 화면이 통째로 빕니다.
//         [PARSE_ERROR] Expected `,` or `}` but found `Identifier`
//       메시지 아래 그림이 막힌 자리를 짚어 줍니다.
//       객체의 속성 사이는 쉼표로 나눕니다. 속성이 늘어날수록 자주 나는 실수입니다.

// ── 마지막: 위에서 만든 컴포넌트를 한 화면에 모으기 ──

export default function Concept04() {
  return (
    <div>
      <h1>개념 04 — 여러 state 다루기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
      </p>

      <div>
        <TwoCounters />
        <MenuPicker />
        <PackToggle />
        <ProfileCard />
        <Cart />
        <BrokenProfile />
      </div>

      <Summary
        items={[
          "useState 는 필요한 만큼 여러 줄 적습니다. 서로 영향을 주지 않습니다.",
          "state 에는 숫자·문자열·참거짓·객체 등 무엇이든 담을 수 있습니다.",
          <>참/거짓을 뒤집을 때는 <strong>set값(!값)</strong> 을 씁니다.</>,
          <>한 번에 하나만 고르는 값은 <strong>고른 것 하나</strong>를 state 로 둡니다. 버튼마다 두지 않습니다.</>,
          "따로 바뀌는 값은 따로 둡니다. 항상 같이 다니는 값만 객체로 묶습니다. 처음에는 나누는 쪽이 안전합니다.",
          <>객체 state 를 바꿀 때는 <strong>{"{"} ...기존값, 바꿀것 {"}"}</strong> 으로 새 객체를 만듭니다. 자세히는 07단원입니다.</>,
          "다른 state 로 계산할 수 있는 값은 state 로 두지 않고 그때그때 계산합니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const [cake, setCake] = useState(0);
//
//    function addCake() {
//      setCake(cake + 1);
//      console.log("케이크를 담았습니다. 지금까지:", cake + 1, "개");
//    }
//    ... <button onClick={addCake}>케이크 +1</button>
//    ... 화면에도 케이크 {cake}개 를 추가합니다
//    // 화면(누르면): 아메리카노 0잔 / 라떼 0잔 / 케이크 1개
//    → useState 를 몇 개 적어도 됩니다. 서로 영향을 주지 않습니다.
//
// 2) <button onClick={() => pick("삼각김밥")}>삼각김밥</button>
//    // 콘솔: 고른 메뉴: 삼각김밥
//    // 화면(누르면): 오늘의 메뉴: 삼각김밥
//    → pick 함수는 손댈 필요가 없습니다. 버튼만 한 줄 늘리면 됩니다.
//
// 3) const buttonText = isPacked ? "포장 ON" : "포장 OFF";
//    // 화면: 처음에는 "포장 OFF", 한 번 누르면 "포장 ON" 이 됩니다.
//    → isPacked 가 false 일 때 보이는 글자가 뒤쪽입니다. 순서를 헷갈리기 쉽습니다.
//
// 4) const [user, setUser] = useState({ name: "김민준", age: 20, city: "서울" });
//    ... <div className="output" id="profileOut">
//          {user.name} ({user.age}세) — {user.city}
//        </div>
//    // 화면: 김민준 (20세) — 서울
//    → birthday 와 rename 은 고칠 필요가 없습니다.
//      { ...user, age: ... } 가 city 까지 알아서 옮겨 담기 때문입니다.
//      이것이 스프레드를 쓰는 이유입니다.
//
// 5) const [latteCount, setLatteCount] = useState(0);
//
//    const total =
//      americanoCount * 4000 + cakeCount * 6000 + latteCount * 4500;
//    const itemCount = americanoCount + cakeCount + latteCount;
//
//    function addLatte() {
//      setLatteCount(latteCount + 1);
//    }
//    ... <button onClick={addLatte}>라떼 담기</button>
//    ... clear 안에도 setLatteCount(0) 을 넣습니다
//    // 화면(누르면): 아메리카노 0개 + 케이크 0개 = 모두 1개, 4500원
//    → 화면에 라떼 개수를 안 보여 줘도 합계에는 들어갑니다.
//      total 은 state 가 아니라 계산식이라 저절로 맞춰집니다.
