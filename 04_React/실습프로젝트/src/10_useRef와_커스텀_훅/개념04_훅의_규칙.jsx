// ============================================================
// 10단원 · 개념 04 — 훅의 규칙
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 04단원 개념06에서 이런 문장을 한 번 봤습니다.
//
//     "훅은 컴포넌트 맨 위에서만 부릅니다."
//
// 그때는 "그렇구나" 하고 넘어갔습니다. 이제 이유를 볼 차례입니다.
//
// 이 파일의 목표는 규칙을 외우게 하는 것이 아닙니다.
// React 가 값을 어떻게 기억하는지 알면 규칙은 저절로 따라옵니다.
// 그래서 순서가 이렇습니다.
//
//   1) 규칙이 무엇인지 (섹션 1)
//   2) React 흉내를 직접 내 보며 왜 그런지 알기 (섹션 2)
//   3) 진짜 React 에서 깨뜨려 보기 (섹션 3, 4)
//   4) 그럼 조건부로 하고 싶을 땐 어떻게 하나 (섹션 5)

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 규칙은 두 개뿐입니다 ──

// [규칙 1] 훅은 컴포넌트(또는 커스텀 훅)의 맨 위에서만 부릅니다.
//          조건문 안, 반복문 안, 중첩 함수 안, early return 뒤에서 부르지 않습니다.
//
// [규칙 2] 훅은 React 컴포넌트나 커스텀 훅 안에서만 부릅니다.
//          그냥 함수, 이벤트 핸들러, 일반 파일 맨 위에서는 부르지 않습니다.
//
// 여기서 '맨 위' 는 파일의 맨 위가 아니라 '함수 본문의 바깥쪽' 이라는 뜻입니다.
//
//   function Menu() {
//     const [name, setName] = useState("");     // ← 맨 위. 좋습니다
//     const [price, setPrice] = useState(0);    // ← 좋습니다
//
//     if (name === "") {
//       const [x, setX] = useState(0);          // ← 안 됩니다. 조건문 안입니다
//     }
//
//     function handleClick() {
//       const [y, setY] = useState(0);          // ← 안 됩니다. 중첩 함수 안입니다
//     }
//
//     return <div>...</div>;
//   }
//
// 왜 이런 규칙이 있을까요? 다음 섹션에서 직접 만들어 보면 알게 됩니다.

// ✏️ 직접 해보기 1 — 위 예시에서 규칙을 어긴 줄이 몇 줄인지 세어 보세요.

// ── 섹션 2: React 는 '부른 순서' 로 기억합니다 ──

// 궁금한 것부터 짚고 갑시다.
//
//     const [name, setName] = useState("김민준");
//     const [age, setAge] = useState(20);
//
// 두 줄 다 useState 입니다. 이름도 안 알려 줬습니다.
// 그런데 다시 그릴 때 React 는 어느 값이 name 이고 어느 값이 age 인지 어떻게 알까요?
//
// 답은 '순서' 입니다.
// React 는 컴포넌트마다 상자를 여러 칸 준비해 두고,
// useState 가 불릴 때마다 0번 칸, 1번 칸, 2번 칸 … 순서대로 담습니다.
// 이름은 안 봅니다. 몇 번째로 불렸는지만 봅니다.
//
// 말로만 하면 안 와닿으니 흉내를 내 봅니다. React 없이 순수 자바스크립트입니다.

let slots = []; // 값을 담는 칸들
let slotIndex = 0; // 지금 몇 번 칸을 쓸 차례인지

// React 의 useState 를 아주 단순하게 흉내 낸 것입니다.
function myUseState(initial) {
  const i = slotIndex;
  slotIndex = slotIndex + 1; // 다음 훅은 다음 칸을 씁니다

  if (slots[i] === undefined) {
    slots[i] = initial; // 처음이면 초기값을 넣습니다
  }
  return slots[i]; // 이미 있으면 초기값은 무시하고 담아 둔 값을 돌려줍니다
}

// 컴포넌트를 한 번 그리는 것을 흉내 낸 함수입니다.
function myRender(useCoupon) {
  slotIndex = 0; // 그릴 때마다 0번 칸부터 다시 셉니다. React 도 이렇게 합니다.

  const name = myUseState("김민준");

  let coupon = "(안 씀)";
  if (useCoupon) {
    // 규칙을 어긴 자리입니다. 조건문 안에서 훅을 부릅니다.
    coupon = myUseState("첫 잔 무료");
  }

  const menu = myUseState("아메리카노");

  return { name, coupon, menu };
}

function SlotSimulation() {
  function runSimulation() {
    // 여러 번 눌러도 같은 결과가 나오도록 칸을 비우고 시작합니다.
    slots = [];
    slotIndex = 0;

    const first = myRender(false); // 쿠폰을 안 쓰는 상태로 한 번 그립니다
    console.log(
      `1번째 그리기 → 이름: ${first.name} / 쿠폰: ${first.coupon} / 메뉴: ${first.menu}`
    );
    // 콘솔: 1번째 그리기 → 이름: 김민준 / 쿠폰: (안 씀) / 메뉴: 아메리카노

    // [...slots] 는 지금 상태를 사진 찍듯 복사한 것입니다.
    // 그냥 slots 를 찍으면 콘솔이 나중에 바뀐 값을 보여 줘서 헷갈립니다.
    console.log([...slots]);
    // 콘솔: ['김민준', '아메리카노']

    const second = myRender(true); // 이번엔 쿠폰을 쓰는 상태로 다시 그립니다
    console.log(
      `2번째 그리기 → 이름: ${second.name} / 쿠폰: ${second.coupon} / 메뉴: ${second.menu}`
    );
    // 콘솔: 2번째 그리기 → 이름: 김민준 / 쿠폰: 아메리카노 / 메뉴: 아메리카노

    console.log([...slots]);
    // 콘솔: ['김민준', '아메리카노', '아메리카노']
  }

  return (
    <div className="demo">
      <h3>① React 흉내내기 — 칸에 순서대로 담기</h3>
      <p>버튼을 누르고 콘솔을 보세요. 두 번 그리는 것을 흉내 냅니다.</p>
      <button onClick={runSimulation}>순서 시뮬레이션 실행</button>
    </div>
  );
}

// 콘솔 결과를 한 줄씩 따라가 봅시다.
//
// [1번째 그리기 — 쿠폰 안 씀]
//   myUseState("김민준")     → 0번 칸이 비었으니 "김민준" 을 넣고 돌려줍니다
//   (쿠폰은 건너뜁니다)
//   myUseState("아메리카노") → 1번 칸이 비었으니 "아메리카노" 를 넣고 돌려줍니다
//   칸: ['김민준', '아메리카노']
//
// [2번째 그리기 — 쿠폰 씀]
//   myUseState("김민준")     → 0번 칸에 이미 "김민준" 이 있으니 그것을 돌려줍니다
//   myUseState("첫 잔 무료") → 1번 칸에 이미 "아메리카노" 가 있습니다!
//                              초기값은 무시되고 "아메리카노" 가 돌아옵니다
//   myUseState("아메리카노") → 2번 칸이 비었으니 "아메리카노" 를 넣습니다
//
// 그래서 쿠폰 자리에 메뉴 이름이 들어갔습니다.
//
//     쿠폰: 아메리카노
//
// 조건문 하나 때문에 이후의 모든 훅이 한 칸씩 밀렸습니다.
// React 도 정확히 이렇게 동작합니다. 그래서 규칙 1이 있는 것입니다.
//
// 다시 말하면, 규칙 1은 이렇게 바꿔 읽을 수 있습니다.
//
//   "몇 번째 그리든 훅이 같은 개수, 같은 순서로 불리게 하라"

// ✏️ 직접 해보기 2 — myRender 에서 쿠폰 부분(let coupon 줄부터 if 블록 끝까지)을
//                    menu 줄 아래로 통째로 옮기면 2번째 그리기 결과가 어떻게 나올까요?
//                    먼저 예상해 보고, 그 다음 실제로 옮겨서 확인하세요.

// ── 섹션 3: 진짜 React 에서 깨뜨려 보기 ──

// 이번에는 흉내가 아니라 진짜 React 입니다.
//
// 아래 컴포넌트는 useState 를 두 번 부릅니다. 개수는 늘 두 개로 같습니다.
// 순서만 바꿉니다. 그런데도 값이 뒤바뀝니다.
//
// useState 는 배열을 돌려줍니다. [0] 이 값, [1] 이 바꾸는 함수입니다.
// 04단원에서는 구조분해로 받았는데, 여기서는 순서를 눈에 띄게 하려고 [0] 으로 씁니다.

function SwapDemo({ swapped }) {
  let name;
  let price;

  if (swapped) {
    price = useState(4000)[0]; // 가격이 먼저 (0번 칸)
    name = useState("아메리카노")[0]; // 이름이 나중에 (1번 칸)
  } else {
    name = useState("아메리카노")[0]; // 이름이 먼저 (0번 칸)
    price = useState(4000)[0]; // 가격이 나중에 (1번 칸)
  }

  console.log(`이름 칸에 든 값: ${name} / 가격 칸에 든 값: ${price}`);
  // 콘솔: 이름 칸에 든 값: 아메리카노 / 가격 칸에 든 값: 4000
  // 콘솔: 이름 칸에 든 값: 4000 / 가격 칸에 든 값: 아메리카노

  return (
    <div className="output">
      <div>이름: {name}</div>
      <div>가격: {price}</div>
    </div>
  );
}

function SwapSection() {
  const [swapped, setSwapped] = useState(false);

  function handleSwap() {
    setSwapped((prev) => !prev);
    console.log("훅을 부르는 순서를 바꿨습니다");
    // 콘솔: 훅을 부르는 순서를 바꿨습니다
  }

  return (
    <div className="demo">
      <h3>② 순서만 바꿔도 값이 뒤바뀝니다</h3>
      <p>지금 순서: {swapped ? "가격 → 이름" : "이름 → 가격"}</p>
      <SwapDemo swapped={swapped} />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleSwap}>순서 바꾸기</button>
      </div>
    </div>
  );
}

// 화면(누르면): 이름: 아메리카노 / 가격: 4000
//               → [순서 바꾸기] →
//               이름: 4000 / 가격: 아메리카노
//
// 이름 자리에 가격이, 가격 자리에 이름이 들어갔습니다.
//
// 여기서 가장 무서운 점은 이것입니다.
//   에러가 안 납니다. 콘솔에 빨간 줄 하나 없습니다.
//   화면만 조용히 틀립니다.
//
// 왜 이렇게 되는지는 이제 설명할 수 있습니다.
// 순서를 바꿔도 useState 는 여전히 0번 칸, 1번 칸을 차례로 봅니다.
// 0번 칸에는 이미 "아메리카노" 가 들어 있으니,
// useState(4000) 이라고 적었어도 4000 은 무시되고 "아메리카노" 가 돌아옵니다.
// 초기값은 '칸이 비었을 때만' 쓰인다는 것을 섹션 2에서 확인했습니다.
//
// 이 예제를 떠났다가 다시 오면 칸이 새로 만들어져 정상으로 돌아옵니다.
// [순서 바꾸기] 를 한 번 더 눌러도 값은 계속 뒤바뀐 채입니다. 칸은 그대로니까요.

// ✏️ 직접 해보기 3 — [순서 바꾸기] 를 두 번 눌러 원래 순서로 되돌린 뒤,
//                    화면의 이름과 가격이 원래대로 돌아오는지 확인하세요.

// ── 섹션 4: 개수가 달라지면 아예 터집니다 ──

// ⚠️ 이 섹션의 코드는 주석을 풀지 마세요. 눈으로만 보세요.
//    풀면 이 예제가 빨간 상자로 바뀌어 화면이 안 나옵니다.
//
// 섹션 3은 개수가 같아서 '조용히 틀리는' 정도로 끝났습니다.
// 개수가 달라지면 React 가 알아채고 멈춰 세웁니다.
//
//   function Broken({ on }) {
//     const [a] = useState("아메리카노");
//     if (on) {
//       const [b] = useState("라떼");     // ← on 이 true 일 때만 훅이 하나 더
//       return <p>{a} {b}</p>;
//     }
//     return <p>{a}</p>;
//   }
//
// on 을 false 에서 true 로 바꾸면 이렇게 됩니다.
//
//   [콘솔 경고]
//     React has detected a change in the order of Hooks called by Broken.
//     This will lead to bugs and errors if not fixed.
//
//   [에러]
//     Rendered more hooks than during the previous render.
//
// 반대로 true 에서 false 로 줄면 이런 에러가 납니다.
//
//     Rendered fewer hooks than expected.
//     This may be caused by an accidental early return statement.
//
// 두 번째 메시지에 나오는 early return 이 바로 아래 같은 코드입니다.
//
//   function Menu({ items }) {
//     if (items.length === 0) {
//       return <p>메뉴가 없습니다</p>;      // ← 여기서 나가 버리면
//     }
//     const [selected, setSelected] = useState(items[0]);   // ← 이 훅은 안 불립니다
//     ...
//   }
//
// 05단원에서 배운 '일찍 return 하기' 는 좋은 습관입니다.
// 다만 훅보다 위에 두면 안 됩니다. 훅을 먼저 다 부르고 나서 return 하세요.
//
// 정리하면, 이 두 에러 메시지를 보면 이렇게 생각하면 됩니다.
//
//   "어딘가에서 훅을 조건부로 부르고 있구나. if 문이나 early return 을 찾아보자"

// ✏️ 직접 해보기 4 — 위 Menu 예시를 규칙에 맞게 고쳐 보세요.
//                    (힌트: 훅 두 줄을 먼저 부르고, 그 아래에서 return 합니다)

// ── 섹션 5: 그럼 조건부로 하고 싶을 땐 어떻게 하나 ──

// "쿠폰을 쓸 때만 쿠폰 state 가 필요한데요?" 라는 질문이 자연스럽습니다.
// 답은 두 가지입니다.
//
//   [방법 1] 훅은 언제나 부르고, '쓰는 쪽' 에서만 조건을 건다
//   [방법 2] 컴포넌트를 나누고, 컴포넌트를 조건부로 그린다
//
// 방법 1이 대부분의 경우에 맞습니다.
// state 하나가 안 쓰이고 놀아도 손해가 거의 없습니다.

function CouponPanel() {
  // 훅은 조건 없이 늘 부릅니다. 순서도 개수도 항상 같습니다.
  const [useCoupon, setUseCoupon] = useState(false);
  const [coupon, setCoupon] = useState("첫 잔 무료");
  const [menu] = useState("아메리카노");

  function handleToggle() {
    setUseCoupon((prev) => !prev);
    console.log("쿠폰 사용 여부를 바꿨습니다");
    // 콘솔: 쿠폰 사용 여부를 바꿨습니다
  }

  function handleChangeCoupon() {
    setCoupon("케이크 1000원 할인");
    console.log("쿠폰을 바꿨습니다");
    // 콘솔: 쿠폰을 바꿨습니다
  }

  return (
    <div className="demo">
      <h3>③ 훅은 늘 부르고, 조건은 화면에서</h3>
      <div className="output">
        <div>메뉴: {menu}</div>
        {/* 05단원의 && 입니다. 조건은 여기서 겁니다. 훅에는 안 겁니다. */}
        {useCoupon && <div>쿠폰: {coupon}</div>}
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleToggle}>쿠폰 쓰기 / 안 쓰기</button>
        <button onClick={handleChangeCoupon}>쿠폰 바꾸기</button>
      </div>
    </div>
  );
}

// 화면(누르면): [쿠폰 쓰기 / 안 쓰기] → "쿠폰: 첫 잔 무료" 줄이 생겼다 사라집니다.
//
// useState 세 개를 조건 없이 다 불렀습니다. 그래서 순서가 절대 안 흔들립니다.
// 쿠폰을 안 쓸 때 coupon state 는 그냥 놀고 있습니다. 그래도 됩니다.
//
// 방법 2는 이렇게 생겼습니다. 쿠폰 관련 코드가 많아질 때 씁니다.
//
//   function CouponBox() {
//     const [coupon, setCoupon] = useState("첫 잔 무료");   // 여기서는 맨 위입니다
//     return <div>쿠폰: {coupon}</div>;
//   }
//
//   function Panel() {
//     const [useCoupon, setUseCoupon] = useState(false);
//     return (
//       <div>
//         {useCoupon && <CouponBox />}     ← 컴포넌트를 조건부로 그리는 것은 괜찮습니다
//       </div>
//     );
//   }
//
// 헷갈리기 쉬운 부분입니다. 다시 확인하세요.
//   훅을 조건부로 부르는 것    → 안 됩니다
//   컴포넌트를 조건부로 그리는 것 → 괜찮습니다
//
// CouponBox 가 화면에 나타나면 그때 새 컴포넌트가 시작되고,
// 그 컴포넌트는 자기만의 칸을 새로 받습니다. 순서가 밀릴 일이 없습니다.

// ✏️ 직접 해보기 5 — CouponPanel 에서 [쿠폰 바꾸기] 를 먼저 누른 뒤
//                    [쿠폰 쓰기] 를 눌러 보세요. 어떤 쿠폰이 보이나요?

// ── 섹션 6: 규칙 2 — 훅은 React 함수 안에서만 ──

// 두 번째 규칙입니다. 훅을 부를 수 있는 곳은 두 군데뿐입니다.
//
//   - React 컴포넌트의 본문
//   - 커스텀 훅의 본문
//
// 아래는 전부 안 됩니다.
//
//   const [x, setX] = useState(0);        // 파일 맨 위 (컴포넌트 밖)
//   function handleClick() { useState(0); }   // 이벤트 핸들러 안
//   function getTotal() { useState(0); }      // 그냥 함수 안
//
// 어기면 이 에러가 납니다.
//
//     Invalid hook call. Hooks can only be called inside of the body of a function component.
//
// 이유는 섹션 2와 같습니다.
// React 는 "지금 이 컴포넌트를 그리는 중" 이라는 표시를 켜 두고,
// 그 동안 불린 훅을 그 컴포넌트의 칸에 담습니다.
// 그리는 중이 아닐 때 훅을 부르면 담을 칸이 없습니다. 그래서 멈춥니다.
//
// 버튼을 눌렀을 때 값을 새로 만들고 싶다면 이렇게 합니다.
//   훅은 맨 위에서 부르고, 핸들러에서는 그 결과(set 함수)를 씁니다.

function HandlerRule() {
  // 훅은 여기, 맨 위에서 한 번만 부릅니다.
  const [menu, setMenu] = useState("아메리카노");

  function handleChange() {
    // 여기서는 useState 를 부르지 않습니다. 위에서 받은 setMenu 만 씁니다.
    setMenu(menu === "아메리카노" ? "케이크" : "아메리카노");
    console.log("핸들러에서는 set 함수만 씁니다");
    // 콘솔: 핸들러에서는 set 함수만 씁니다
  }

  return (
    <div className="demo">
      <h3>④ 핸들러에서는 set 함수만</h3>
      <div className="output">지금 메뉴: {menu}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleChange}>메뉴 바꾸기</button>
      </div>
    </div>
  );
}

// 화면(누르면): "지금 메뉴: 아메리카노" 와 "지금 메뉴: 케이크" 가 번갈아 나옵니다.

// ✏️ 직접 해보기 6 — HandlerRule 의 handleChange 안에
//                    const [x, setX] = useState(0); 를 넣으면 어떤 에러가 날지
//                    먼저 예상해 보세요. (확인은 안 해도 됩니다. 예제가 멈춥니다)

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 데이터가 없을 때 일찍 return 하고, 그 아래에서 훅을 부름
//
//   if (!user) return <p>불러오는 중</p>;
//   const [name, setName] = useState(user.name);
//
// 실수: Rendered fewer hooks than expected.
//       09단원에서 배운 로딩 처리와 붙여 쓰다가 아주 자주 나옵니다.
//       훅을 위로 올리고, return 을 훅 아래로 내리세요.

// [실수 2] 반복문 안에서 훅을 부름
//
//   for (const item of items) {
//     const [checked, setChecked] = useState(false);
//   }
//
// 실수: items 의 길이가 바뀌면 훅 개수가 바뀌어 터집니다.
//       고치는 법 두 가지입니다.
//         - state 하나에 배열이나 객체로 모아 담는다 (07단원)
//         - 항목 하나를 컴포넌트로 만들고, 그 안에서 useState 를 부른다

// [실수 3] 이벤트 핸들러 안에서 훅을 부름
//
//   function handleClick() {
//     const [x, setX] = useState(0);
//   }
//
// 실수: Invalid hook call. 섹션 6에서 본 그것입니다.

// [실수 4] 훅을 부르는 함수를 만들어 놓고 조건부로 부름
//
//   if (isLogin) {
//     const counter = useCounter();     // 커스텀 훅도 훅입니다
//   }
//
// 실수: 커스텀 훅은 안에서 useState 를 부릅니다. 조건부로 부르면 똑같이 밀립니다.
//       이름이 use 로 시작하면 훅이라고 생각하세요.

// [실수 5] 삼항 연산자 안에서 훅을 부름
//
//   const value = isBig ? useState(100)[0] : useState(1)[0];
//
// 실수: if 문만 조심하면 되는 줄 알기 쉬운데, 삼항도 조건문입니다.
//       한쪽만 실행되므로 훅 개수가 흔들립니다.

// [실수 6] && 로 훅을 부름 — 눈으로만
//
//   isLogin && const [x, setX] = useState(0);
//
// 실수: [SyntaxError] const 는 문(statement)이라 && 오른쪽에 올 수 없습니다.
//       이건 다행히 바로 에러가 나서 금방 알아챕니다.

export default function Concept04HookRules() {
  return (
    <div>
      <h1>개념 04 — 훅의 규칙</h1>

      <p className="guide">
        F12 → Console 을 열어 두세요. 섹션 1의 버튼을 누르면 콘솔에 결과가 나옵니다.
        <br />
        <strong>섹션 4의 주석은 풀지 마세요.</strong> 예제가 빨간 상자로 바뀝니다.
      </p>

      <SlotSimulation />
      <SwapSection />
      <CouponPanel />
      <HandlerRule />

      <Summary
        items={[
          "훅은 컴포넌트나 커스텀 훅의 맨 위에서만 부릅니다. 조건문·반복문·중첩 함수 안에서는 부르지 않습니다.",
          "React 는 훅의 이름이 아니라 '부른 순서' 로 값을 기억합니다. 0번 칸, 1번 칸 하는 식입니다.",
          "조건문 하나로 훅이 한 칸 밀리면 그 뒤 값이 전부 어긋납니다.",
          "훅 개수가 같고 순서만 바뀌면 에러 없이 값만 조용히 뒤바뀝니다. 가장 찾기 어려운 종류입니다.",
          "개수가 달라지면 Rendered more/fewer hooks than ... 에러가 납니다. early return 을 의심하세요.",
          "조건부로 쓰고 싶으면 훅은 늘 부르고 쓰는 쪽에서 조건을 걸거나, 컴포넌트를 나눠 조건부로 그립니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 두 줄입니다.
//    const [x, setX] = useState(0);   ← 조건문 안
//    const [y, setY] = useState(0);   ← 중첩 함수(handleClick) 안
//    → 위의 name, price 두 줄은 맨 위에 있으니 괜찮습니다.
//
// 2) 쿠폰 줄을 menu 줄 아래로 옮기면 이렇게 됩니다.
//    2번째 그리기 → 이름: 김민준 / 쿠폰: 첫 잔 무료 / 메뉴: 아메리카노
//    → 이번에는 name(0번), menu(1번)까지 순서가 그대로이고,
//      쿠폰만 마지막 2번 칸에 새로 담깁니다. 그래서 앞의 값들이 안 밀립니다.
//      "맨 뒤에서만 늘어나면 괜찮은 것 아닌가?" 싶겠지만 아닙니다.
//      진짜 React 에서는 개수가 달라지는 순간 섹션 4의 에러가 납니다.
//      이 시뮬레이션은 그런 검사를 안 넣은 단순한 흉내입니다.
//
// 3) 원래대로 안 돌아옵니다. 이름: 아메리카노 / 가격: 4000 이 되긴 하는데,
//    그건 값이 고쳐진 것이 아니라 순서가 다시 원래대로 돌아왔기 때문입니다.
//    화면(누르면): 이름: 아메리카노 / 가격: 4000
//    → 칸에는 여전히 0번 "아메리카노", 1번 4000 이 들어 있습니다.
//      값이 뒤바뀐 채로 두 번 뒤집혀 우연히 맞아 보이는 것입니다.
//      이런 버그가 "가끔은 맞고 가끔은 틀린" 모양으로 나타나 찾기 어렵습니다.
//
// 4) function Menu({ items }) {
//      const [selected, setSelected] = useState(items[0]);   // 훅을 먼저
//
//      if (items.length === 0) {
//        return <p>메뉴가 없습니다</p>;                       // return 은 그 뒤에
//      }
//      ...
//    }
//    → items 가 빈 배열이면 items[0] 이 undefined 라서 초기값이 undefined 가 됩니다.
//      그것이 걱정되면 useState(items[0] || "") 처럼 기본값을 줍니다.
//      (|| 는 JS자료 03단원에서 배웠습니다)
//
// 5) "첫 잔 무료" 가 아니라 "케이크 1000원 할인" 이 보입니다.
//    화면(누르면): 쿠폰: 케이크 1000원 할인
//    → 쿠폰 줄이 화면에 안 보이는 동안에도 coupon state 는 살아 있습니다.
//      화면에 안 그린 것과 state 가 없는 것은 다릅니다.
//
// 6) Invalid hook call. Hooks can only be called inside of the body of a function component.
//    → 이벤트 핸들러는 컴포넌트를 그리는 중에 실행되는 것이 아닙니다.
//      버튼을 누른 뒤, 즉 그리기가 다 끝난 뒤에 실행됩니다.
//      그래서 React 는 이 훅을 담을 칸을 찾지 못합니다.
