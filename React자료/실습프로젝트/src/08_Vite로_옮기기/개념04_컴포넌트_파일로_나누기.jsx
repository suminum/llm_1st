// ============================================================
// 08단원 · 개념 04 — 컴포넌트 파일로 나누기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념03에서 import 와 export 를 배웠습니다.
// 이 파일에서는 그것을 실제 코드에 써 봅니다.
//
// 옮길 코드는 여러분이 이미 아는 것입니다.
// 03단원 개념05에서 만든 카페 메뉴판입니다.
//
//     BigMenuBoard   — 메뉴 세 줄을 통째로 적은 것
//     MenuRow        — 메뉴 한 줄
//     MenuBoard      — MenuRow 를 세 번 쓴 메뉴판
//     MenuCard       — note 기본값이 있는 카드
//
// 그때는 이 넷이 전부 한 .html 파일 안에 있었습니다.
// 이제 파일로 나눕니다. 그리고 나누고 나면 무엇이 달라지는지 봅니다.
//
// ★ 이 파일에서 가장 중요한 것은 섹션 4입니다.
//   01~07단원에서 늘 있던 React 라는 이름이 08단원에는 없습니다.
//   그런데도 JSX 가 돌아갑니다. 왜 그런지를 섹션 4에서 다룹니다.
//
// ★ 콘솔에 같은 줄이 두 번씩 찍힙니다. 정상입니다(개념02 3부의 StrictMode).

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

import MenuBoard from "./_부품/MenuBoard.jsx";
import MenuCard from "./_부품/MenuCard.jsx";
import MenuRow from "./_부품/MenuRow.jsx";

// ── 섹션 1: 옮기기 전 — 한 파일 안에 다 있는 코드 ──

// 아래는 03단원 개념05의 BigMenuBoard 를 그대로 가져온 것입니다.
// 메뉴 세 줄을 통째로 적었습니다. 쪼개지 않은 코드입니다.
//
// 이렇게 이 파일 안에 직접 쓴 컴포넌트를 앞으로 '이 파일 안의 컴포넌트' 라고 부르겠습니다.
// 08단원 전에는 전부 이 모양이었습니다.

function BigMenuBoard() {
  return (
    <div className="output">
      <h4>동네 카페 메뉴판</h4>

      <div>
        <strong>아메리카노</strong> — 4000원
        <br />
        <small>가장 많이 팔립니다</small>
      </div>

      <div>
        <strong>라떼</strong> — 4500원
        <br />
        <small>가장 많이 팔립니다</small>
      </div>

      <div>
        <strong>케이크</strong> — 6000원
        <br />
        <small>가장 많이 팔립니다</small>
      </div>
    </div>
  );
}

// 03단원에서 이 코드의 문제를 이미 짚었습니다.
//   - 같은 모양이 세 번 반복됩니다
//   - <small> 문구를 바꾸려면 세 군데를 고쳐야 합니다
//   - 함수 하나가 길어서 구조가 안 보입니다
//
// 그래서 03단원에서 MenuRow 로 쪼갰습니다. 그건 '한 파일 안에서' 쪼갠 것입니다.
// 이제 '파일로' 쪼갭니다. 두 가지는 얻는 것이 다릅니다.
//
//   [한 파일 안에서 쪼개기 — 03단원]
//     그 파일 안에서 고칠 곳이 한 곳이 됩니다.
//     하지만 다른 파일에서 쓰려면 여전히 복사해야 합니다.
//
//   [파일로 쪼개기 — 08단원]
//     프로젝트 전체에서 고칠 곳이 한 곳이 됩니다.
//     어느 파일에서든 import 한 줄로 가져다 씁니다.

function Section1Demo() {
  console.log("① 이 파일 안에 직접 쓴 BigMenuBoard 를 그렸습니다");
  // 콘솔: ① 이 파일 안에 직접 쓴 BigMenuBoard 를 그렸습니다

  return (
    <div className="demo">
      <h3>① 옮기기 전 — 이 파일 안에 통째로 적은 메뉴판</h3>
      <BigMenuBoard />
      {/* 화면: 동네 카페 메뉴판 / 아메리카노 — 4000원 / 라떼 — 4500원 / 케이크 — 6000원 */}
    </div>
  );
}

// ✏️ 직접 해보기 1 — BigMenuBoard 의 <small> 세 개를 전부 "오늘의 추천" 으로 바꾸세요.
//                    몇 군데를 고쳤나요?

// ── 섹션 2: 파일로 옮기기 — 세 단계 ──

// 03단원의 MenuRow 를 파일로 옮겨 봅니다. 순서는 늘 같습니다.
//
//   [1단계] 새 파일을 만든다
//           src/08_Vite로_옮기기/_부품/MenuRow.jsx
//
//   [2단계] 컴포넌트 함수를 통째로 옮겨 붙이고, 앞에 export default 를 붙인다
//
//           export default function MenuRow({ name, price }) {
//             ... 03단원 코드 그대로 ...
//           }
//
//   [3단계] 쓰는 쪽 파일 맨 위에 import 줄을 넣는다
//
//           import MenuRow from "./_부품/MenuRow.jsx";
//
// 이게 전부입니다. **함수 안은 한 글자도 안 고칩니다.**
// _부품/MenuRow.jsx 를 열어서 03단원 개념05의 MenuRow 와 비교해 보세요.
// 앞에 export default 가 붙은 것 말고는 완전히 같습니다.
//
// ★ 왜 _부품 이라는 하위 폴더에 넣었나요?
//
//   왼쪽 메뉴는 단원 폴더 '바로 아래' 의 .jsx 만 훑습니다.
//   MenuRow.jsx 를 08_Vite로_옮기기 폴더 바로 아래에 두면
//   왼쪽 목록에 "MenuRow" 라는 항목이 하나 생겨 버립니다.
//   그건 예제가 아니라 부품이니 목록에 나오면 안 됩니다.
//   그래서 하위 폴더에 넣습니다. 하위 폴더는 메뉴가 안 훑습니다.

function Section2Demo() {
  console.log("② 다른 파일에서 가져온 MenuRow 를 그렸습니다");
  // 콘솔: ② 다른 파일에서 가져온 MenuRow 를 그렸습니다

  return (
    <div className="demo">
      <h3>② 옮긴 뒤 — MenuRow 를 import 해서 세 번</h3>
      <div className="output">
        <h4>동네 카페 메뉴판</h4>
        <MenuRow name="아메리카노" price={4000} />
        <MenuRow name="라떼" price={4500} />
        <MenuRow name="케이크" price={6000} />
      </div>
      {/* 화면: ① 과 똑같습니다 */}
    </div>
  );
}

// 화면 ① 과 ② 를 비교해 보세요. 똑같습니다.
// 달라진 것은 코드입니다.
//   - <small> 문구가 세상에 하나만 있습니다. _부품/MenuRow.jsx 안입니다.
//   - 이 파일에서는 "제목 하나에 메뉴 세 줄" 이라는 구조만 보입니다.
//   - 다른 단원 파일에서도 import 한 줄로 같은 MenuRow 를 씁니다.

// ✏️ 직접 해보기 2 — _부품/MenuRow.jsx 의 <small> 문구를 "오늘의 추천" 으로 바꾸세요.
//                    화면 ② 에서 몇 줄이 바뀌나요? 화면 ① 은 어떤가요?

// ── 섹션 3: 부품이 부품을 부릅니다 ──

// 파일로 나누면 자연스럽게 층이 생깁니다.
// _부품/MenuBoard.jsx 를 열어 보세요. 이렇게 생겼습니다.
//
//     import MenuRow from "./MenuRow.jsx";
//
//     export default function MenuBoard() {
//       return (
//         <div className="output">
//           <h4>동네 카페 메뉴판</h4>
//           <MenuRow name="아메리카노" price={4000} />
//           ...
//         </div>
//       );
//     }
//
// 부품도 다른 부품을 import 합니다. 특별한 문법이 아닙니다. 그냥 같은 import 입니다.
//
// 지금 파일들이 이렇게 이어져 있습니다.
//
//     개념04 (지금 이 파일)
//        └─ MenuBoard.jsx
//              └─ MenuRow.jsx
//
// 여기서 얻는 것이 하나 있습니다.
//
//   ★ 이 파일은 MenuRow 를 몰라도 됩니다.
//
// <MenuBoard /> 한 줄만 쓰면 메뉴판이 통째로 나옵니다.
// 안에 몇 줄이 들어 있는지, 그 줄이 어떻게 생겼는지 이 파일은 알 필요가 없습니다.
// 메뉴가 열 개로 늘어나도 이 파일은 한 글자도 안 고칩니다.
//
// 03단원에서 props 를 배울 때 "부모는 자식 속을 안 봐도 된다" 고 했던 것과 같습니다.
// 그것이 이제 파일 단위로 커진 것입니다.
//
// ★ 경로를 한 번 더 보세요.
//   MenuBoard.jsx 안에서는 "./MenuRow.jsx" 입니다. (둘 다 _부품 안)
//   이 파일에서는  "./_부품/MenuRow.jsx" 입니다.
//   같은 파일을 가리키는데 경로가 다릅니다.
//   경로는 늘 '그 줄이 적힌 파일' 이 기준입니다(개념03 섹션 4).

function Section3Demo() {
  const [showCards, setShowCards] = useState(false);

  console.log("③ MenuBoard 한 줄로 메뉴판 전체를 그렸습니다");
  // 콘솔: ③ MenuBoard 한 줄로 메뉴판 전체를 그렸습니다

  return (
    <div className="demo">
      <h3>③ MenuBoard 한 줄 — 안에 MenuRow 가 들어 있습니다</h3>

      <MenuBoard />
      {/* 화면: ① · ② 와 똑같은 메뉴판이 나옵니다 */}

      <button onClick={() => setShowCards(!showCards)}>
        {showCards ? "카드 접기" : "MenuCard 도 보기"}
      </button>

      {showCards && (
        <div>
          <MenuCard name="아메리카노" price={4000} note="가장 많이 팔립니다" />
          {/* 화면(누르면): 아메리카노 — 4000원 / 가장 많이 팔립니다 */}
          <MenuCard name="삼각김밥" price={1200} />
          {/* 화면(누르면): 삼각김밥 — 1200원 / 설명 없음 */}
        </div>
      )}
    </div>
  );
}

// MenuCard 는 note 를 안 넘기면 "설명 없음" 이 나옵니다.
// 03단원 개념03에서 배운 props 기본값이 그대로 살아 있습니다.
// 파일을 옮겼다고 문법이 달라지지 않습니다.

// ✏️ 직접 해보기 3 — _부품/MenuBoard.jsx 안에
//                    <MenuRow name="삼각김밥" price={1200} /> 를 한 줄 넣으세요.
//                    이 파일(개념04)은 몇 군데 고쳐야 하나요?

// ── 섹션 4: React 를 더 이상 안 꺼내도 되는 이유 ──

// ★ 이 섹션이 개념04에서 가장 중요합니다.
//
// 01~07단원의 파일 위쪽에는 항상 이 줄이 있었습니다.
//
//     <script src="../_lib/react.development.js"></script>
//
// 그리고 훅을 쓸 때는 이렇게 꺼냈습니다.
//
//     const { useState } = React;
//
// React 라는 이름이 늘 거기에 있었습니다. 그런데 이 파일에는 없습니다.
// import React from "react"; 같은 줄이 한 줄도 없습니다.
// _부품/MenuRow.jsx 에도 없습니다. 그런데 JSX 가 잘 돌아갑니다.
//
// 정말 없는지 확인해 봅시다.

function Section4Demo() {
  console.log(typeof React);
  // 콘솔: undefined

  // React 라는 이름이 아예 없습니다. 그런데도 아래 JSX 가 잘 그려집니다.
  //
  // 왜 그럴까요? JSX 가 무엇으로 바뀌는지부터 봐야 합니다.
  //
  // [01~07단원 — Babel 이 이렇게 바꿨습니다]
  //
  //     <p>안녕</p>
  //       ↓
  //     React.createElement("p", null, "안녕")
  //
  //   바뀐 코드 안에 React 라는 이름이 들어 있습니다.
  //   그래서 그 자리에 React 가 없으면 "React is not defined" 에러가 났습니다.
  //   react.development.js 를 script 로 실어 준 이유가 이것입니다.
  //
  // [08단원 — Vite 는 이렇게 바꿉니다]
  //
  //     <p>안녕</p>
  //       ↓
  //     import { jsx } from "react/jsx-runtime";   ← Vite 가 자동으로 넣어 줍니다
  //     jsx("p", { children: "안녕" })
  //
  //   React 라는 이름을 안 씁니다. 대신 jsx 라는 함수를 씁니다.
  //   그리고 그 함수를 가져오는 import 줄을 Vite 가 알아서 파일 맨 위에 넣어 줍니다.
  //   이것을 'JSX 자동 변환' 이라고 부릅니다.
  //
  //   여러분이 쓴 파일에는 그 줄이 안 보입니다. 저장된 파일에도 안 들어갑니다.
  //   Vite 가 번역하는 순간에만 잠깐 끼워 넣습니다.
  //
  // 그래서 08단원부터는 이렇게 됩니다.
  //
  //   [안 써도 되는 것] import React from "react";
  //                     JSX 만 쓸 거라면 필요 없습니다.
  //
  //   [써야 하는 것]   import { useState } from "react";
  //                     훅은 자동으로 안 들어옵니다. 직접 가져와야 합니다.
  //
  // 자동으로 들어오는 것은 'JSX 를 바꾸는 함수' 하나뿐입니다.
  // useState · useEffect 같은 것은 여러분이 이름을 적어 가져와야 합니다.
  // (useEffect 는 아직 안 배웠습니다. 09단원에서 배웁니다. 여기서는 이름만 나온 것입니다)
  //
  // ★ 인터넷의 옛날 예제에는 import React from "react"; 가 맨 위에 있습니다.
  //   자동 변환이 생기기 전에 쓴 코드입니다. 지금도 써도 에러는 안 납니다.
  //   그냥 필요 없는 줄일 뿐입니다. 이 자료에서는 안 씁니다.

  // JSX 가 실제로 무엇이 되는지도 볼 수 있습니다.
  const element = <p>아메리카노 4000원</p>;

  console.log(typeof element);
  // 콘솔: object

  console.log(element.type);
  // 콘솔: p

  // JSX 는 화면이 아니라 '값' 입니다. 평범한 객체입니다.
  // 그 안에 "어떤 태그인지(type)" 가 들어 있습니다.
  // 이 객체를 React 가 읽어서 진짜 화면을 만듭니다.
  // 02단원 개념01에서 Babel 이 만든 결과를 찍어 봤던 것과 같은 이야기입니다.

  return (
    <div className="demo">
      <h3>④ React 없이 도는 JSX</h3>
      <div className="output">
        <div>typeof React 는 {String(typeof React)} 입니다</div>
        {/* 화면: typeof React 는 undefined 입니다 */}
        <div>이 줄도 JSX 인데 잘 나옵니다</div>
        {/* 화면: 이 줄도 JSX 인데 잘 나옵니다 */}
        <div>JSX 를 값으로 만들어 담아 둔 것: {element}</div>
        {/* 화면: JSX 를 값으로 만들어 담아 둔 것: 아메리카노 4000원 */}
      </div>
    </div>
  );
}

// ✏️ 직접 해보기 4 — Section4Demo 안에서
//                    const element2 = <strong>라떼 4500원</strong>; 을 만들고
//                    console.log(element2.type) 을 찍어 보세요. 무엇이 나올까요?

// ── 섹션 5: 어떻게 나눌까 ──

// 파일로 나눌 수 있게 됐다고 무조건 나누면 오히려 힘들어집니다.
// 03단원 개념05에서 "너무 잘게 쪼개지 마세요" 라고 한 것과 같은 이야기입니다.
//
// [언제 파일로 뺄까]
//
//   뺀다   — 두 파일 이상에서 쓰인다
//   뺀다   — 그 컴포넌트만 50줄이 넘는다
//   뺀다   — 이름이 자연스럽게 붙는다 (MenuRow, PriceTag, Header)
//   안 뺀다 — 그 파일에서 한 번만 쓰인다
//   안 뺀다 — 다섯 줄짜리다
//
// 이 자료의 예제 파일들이 그 예입니다.
// Section1Demo · Section2Demo 같은 것은 이 파일에서만 쓰니 그냥 여기 둡니다.
// MenuRow 는 여러 곳에서 쓰니 파일로 뺐습니다.
//
// [파일 이름 규칙]
//
//   컴포넌트 파일은 '컴포넌트 이름 그대로' 짓습니다.
//     MenuRow.jsx    → MenuRow
//     PriceTag.jsx   → PriceTag
//
//   왜 이렇게 할까요? import 줄만 보고 무엇이 오는지 알기 위해서입니다.
//     import MenuRow from "./_부품/MenuRow.jsx";   ← 한눈에 보입니다
//     import A from "./_부품/x.jsx";               ← 열어 봐야 압니다
//
//   화면이 없는 파일(값·함수만 있는 파일)은 .js 로 두고 소문자로 시작합니다.
//     menuPrices.js  → 값과 함수만 들어 있습니다
//
// [폴더 정리]
//
//   이 자료에서는 이렇게 씁니다.
//
//     src/08_Vite로_옮기기/
//       개념03_import와_export.jsx     ← 왼쪽 메뉴에 나옵니다
//       개념04_컴포넌트_파일로_나누기.jsx ← 왼쪽 메뉴에 나옵니다
//       _부품/                          ← 메뉴에 안 나옵니다
//         MenuRow.jsx
//         MenuBoard.jsx
//
//   실제 프로젝트에서는 보통 이런 이름을 씁니다.
//     components/  화면 부품
//     pages/       화면 한 장 (11단원에서 봅니다)
//     utils/       값과 함수
//
//   이 자료가 _부품 이라는 한글 이름을 쓰는 것은
//   "이건 예제가 아니라 부품이다" 를 눈에 띄게 하려는 것뿐입니다.
//
// [한 파일에 컴포넌트 여러 개도 됩니다]
//
//   export default 는 하나뿐이지만, 이름 있는 export 로 여러 개를 내보낼 수 있습니다.
//   다만 처음에는 '한 파일에 대표 하나' 로 두는 편이 찾기 쉽습니다.
//   이 자료는 그 방식을 씁니다.

function Section5Demo() {
  const [count, setCount] = useState(0);

  function handleAdd() {
    setCount(count + 1);

    console.log("장바구니에 담았습니다. 지금", count + 1, "개");
    // 콘솔: 장바구니에 담았습니다. 지금 1 개
  }

  return (
    <div className="demo">
      <h3>⑤ 파일을 나눠도 state 는 그대로입니다</h3>

      <MenuCard name="아메리카노" price={4000} note={`장바구니에 ${count}개`} />
      {/* 화면: 아메리카노 — 4000원 / 장바구니에 0개 */}

      <button onClick={handleAdd}>담기</button>
      {/* 화면(누르면): 장바구니에 1개 */}
    </div>
  );
}

// state 는 이 파일에 있고, 화면은 다른 파일의 MenuCard 가 그립니다.
// 값은 props 로 내려갑니다. 07단원에서 배운 그대로입니다.
// 파일이 나뉘어도 부모-자식 관계는 하나도 안 바뀝니다.

// ✏️ 직접 해보기 5 — Section5Demo 의 MenuCard 에 note 를 넘기지 말고 지워 보세요.
//                    담기 버튼을 눌러도 글자가 안 바뀌는 것을 확인하고 되돌리세요.

// ✏️ 직접 해보기 6 — _부품 폴더에 Footer.jsx 를 새로 만들고
//                    export default function Footer() { return <p>영업시간 09:00~21:00</p>; }
//                    을 넣은 뒤, 이 파일에서 import 해서 Section5Demo 맨 아래에 넣으세요.

// ✏️ 직접 해보기 7 — 방금 만든 Footer.jsx 를 _부품 폴더 밖(08_Vite로_옮기기 바로 아래)으로
//                    옮겨 보세요. 왼쪽 메뉴가 어떻게 되나요? 확인하고 다시 _부품 안으로 옮기세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 옮겨 놓고 export default 를 안 붙임
//   파일은 만들었는데 함수 앞에 export default 가 없는 경우입니다.
//   화면이 빨간 상자가 되고 이런 줄이 나옵니다.
//     The requested module '/src/.../MenuRow.jsx' does not provide an export named 'default'
//   새 부품 파일을 만든 직후에 가장 많이 나는 실수입니다.

// [실수 2] 옮겨 놓고 원래 자리의 함수를 안 지움
//   MenuRow 를 파일로 뺐는데, 이 파일에도 옛날 MenuRow 가 남아 있는 경우입니다.
//   그러면 이런 에러가 납니다.
//     [SyntaxError] Identifier 'MenuRow' has already been declared
//   "MenuRow 라는 이름이 이미 있다" 는 뜻입니다.
//   import 로 들어온 이름과 이 파일에서 만든 이름이 부딪힌 것입니다.
//   옮겼으면 원래 자리는 지우세요.

// [실수 3] 부품 파일을 단원 폴더 바로 아래에 둠 ★ 에러가 안 납니다
//   MenuRow.jsx 를 _부품 안이 아니라 08_Vite로_옮기기 바로 아래에 두면
//   왼쪽 메뉴에 "MenuRow" 라는 항목이 생깁니다.
//   에러는 안 납니다. 코드도 잘 돌아갑니다. 목록만 지저분해집니다.
//   게다가 그 항목을 눌러 보면 props 를 아무것도 안 받은 상태로 그려져서
//   "— 원" 처럼 이상하게 나옵니다(03단원 개념05 실수 3).
//   ✏️ 7번에서 직접 확인해 보세요.

// [실수 4] 부품 파일 안에서 props 이름을 바꿈
//   _부품/MenuRow.jsx 의 { name, price } 를 { title, price } 로 바꿔 놓고
//   쓰는 쪽은 name="아메리카노" 로 그대로 두는 경우입니다.
//   에러가 안 납니다. 이름 자리만 조용히 비어 버립니다.
//   파일이 나뉘어 있으면 이런 어긋남을 못 보고 지나치기 쉽습니다.
//   부품을 고칠 때는 그 부품을 쓰는 곳도 같이 보세요.

// [실수 5] import React from "react"; 를 안 썼다고 걱정함
//   실수라기보다 오해입니다. 안 써도 됩니다. 섹션 4에서 확인했습니다.
//   인터넷 예제를 보고 그 줄을 넣어도 에러는 안 납니다. 그냥 필요 없는 줄입니다.
//   ★ 다만 훅은 다릅니다. useState 를 import 안 하고 쓰면
//     "useState is not defined" 에러가 납니다. 이건 자동으로 안 들어옵니다.

// ── 화면 ──

export default function Concept04SplitFiles() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 04 — 컴포넌트 파일로 나누기</h1>

      <p className="guide">
        이 파일이 쓰는 부품은 <code>src/08_Vite로_옮기기/_부품/</code> 안에 있습니다.
        <strong> MenuRow.jsx · MenuBoard.jsx · MenuCard.jsx</strong> 를 함께 열어 놓고
        보세요.
        <br />
        <br />
        세 파일 모두 <strong>03단원 개념05의 코드를 그대로 옮긴 것</strong>입니다. 앞에{" "}
        <code>export default</code> 가 붙은 것 말고는 달라진 데가 없습니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 도 함께 열어 두세요. 섹션 4는 콘솔로 확인합니다.
      </p>

      <button onClick={() => setRestartKey(restartKey + 1)}>
        이 예제를 처음부터 다시 그리기
      </button>

      <div key={restartKey}>
        <Section1Demo />
        <Section2Demo />
        <Section3Demo />
        <Section4Demo />
        <Section5Demo />
      </div>

      <Summary
        items={[
          "컴포넌트를 파일로 옮기는 것은 세 단계입니다. 새 파일 만들기 → 함수를 통째로 옮기고 export default 붙이기 → 쓰는 쪽에 import 줄 넣기. 함수 안은 한 글자도 안 고칩니다.",
          "03단원의 '한 파일 안에서 쪼개기' 는 그 파일 안에서만 이득이지만, 파일로 쪼개면 프로젝트 전체에서 고칠 곳이 한 곳이 됩니다.",
          "부품도 다른 부품을 import 할 수 있습니다. MenuBoard 를 쓰는 쪽은 그 안의 MenuRow 를 몰라도 됩니다.",
          "JSX 는 Vite 가 자동으로 react/jsx-runtime 의 함수로 바꿔 줍니다. 그래서 import React from \"react\"; 를 안 써도 됩니다. typeof React 는 undefined 입니다.",
          "자동으로 들어오는 것은 JSX 를 바꾸는 함수뿐입니다. useState 같은 훅은 직접 import 해야 합니다.",
          "두 곳 이상에서 쓰이거나 길어지면 파일로 빼고, 한 번만 쓰이는 작은 것은 그대로 둡니다. 파일 이름은 컴포넌트 이름 그대로 짓습니다.",
          "import 해서 쓸 부품은 _부품 같은 하위 폴더에 둡니다. 단원 폴더 바로 아래에 두면 왼쪽 메뉴에 예제처럼 나타납니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) BigMenuBoard 안의 <small> 세 개를 전부 고쳐야 합니다.
//    // 화면: ① 의 세 줄이 모두 "오늘의 추천" 이 됩니다.
//    → 두 군데만 고치면 한 줄만 옛날 문구로 남습니다. 에러가 안 나서 못 보고 지나칩니다.
//      03단원 개념05에서 했던 것과 같은 문제이고, 답도 같습니다. 쪼개면 한 곳이 됩니다.
//
// 2) _부품/MenuRow.jsx 안의 <small> 한 곳만 고칩니다.
//    // 화면: ② 의 세 줄이 전부 바뀝니다. ③ 의 메뉴판도 함께 바뀝니다.
//    //       ① 은 안 바뀝니다.
//    → ② 와 ③ 이 같이 바뀐 것이 핵심입니다.
//      ③ 의 MenuBoard 도 안에서 같은 MenuRow 를 쓰기 때문입니다.
//      ① 은 이 파일 안에 따로 적은 코드라 아무 상관이 없습니다.
//      한 곳을 고쳐 두 화면이 바뀌는 것 — 이것이 파일로 나누는 이유입니다.
//      확인했으면 "가장 많이 팔립니다" 로 되돌려 두세요.
//
// 3) _부품/MenuBoard.jsx 안에 한 줄만 넣습니다.
//
//      <MenuRow name="삼각김밥" price={1200} />
//
// 화면: ③ 의 메뉴판에 "삼각김밥 — 1200원 / 가장 많이 팔립니다" 가 늘어납니다.
//    → 이 파일(개념04)은 한 군데도 안 고칩니다. 그게 이 문제의 답입니다.
//      <MenuBoard /> 라고만 써 뒀으니 안이 몇 줄이든 상관이 없습니다.
//      ② 는 이 파일에서 MenuRow 를 직접 세 번 쓴 것이라 안 바뀝니다.
//
// 4) const element2 = <strong>라떼 4500원</strong>;
//    console.log(element2.type);
//    // 콘솔: strong
//    → JSX 를 쓴 만큼 값이 만들어지고, type 에는 태그 이름이 들어갑니다.
//      <MenuRow /> 처럼 우리가 만든 컴포넌트를 넣으면 type 은 글자가 아니라 함수입니다.
//      React 가 소문자와 대문자를 구분하는 이유가 여기 있습니다(01단원 개념04).
//
// 5) <MenuCard name="아메리카노" price={4000} />
//    // 화면: 아메리카노 — 4000원 / 설명 없음
//    //       담기를 눌러도 "설명 없음" 그대로입니다.
//    → note 를 안 넘겼으니 MenuCard 의 기본값이 쓰입니다.
//      count 가 올라가도 MenuCard 에 전해 주는 값이 없으니 화면이 안 바뀝니다.
//      콘솔에는 숫자가 계속 올라갑니다. state 는 잘 바뀌고 있는데
//      화면에 안 이어져 있을 뿐입니다.
//
// 6) 새 파일 src/08_Vite로_옮기기/_부품/Footer.jsx :
//
//      export default function Footer() {
//        return <p>영업시간 09:00~21:00</p>;
//      }
//
//    이 파일 맨 위에:
//      import Footer from "./_부품/Footer.jsx";
//
//    Section5Demo 의 </div> 바로 앞에:
//      <Footer />
//
// 화면: ⑤ 상자 맨 아래에 "영업시간 09:00~21:00" 이 나옵니다.
//    → import 줄을 빠뜨리면 "Footer is not defined" 로 빨간 상자가 됩니다.
//      export default 를 빠뜨리면 does not provide an export named 'default' 가 납니다.
//
// 7) Footer.jsx 를 08_Vite로_옮기기 폴더 바로 아래로 옮기면:
//    // 화면: 왼쪽 메뉴의 08 단원에 "Footer" 라는 항목이 하나 늘어납니다.
//    //       그 항목을 누르면 "영업시간 09:00~21:00" 만 덩그러니 나옵니다.
//    → 에러는 안 납니다. 다만 부품이 예제인 척 목록에 끼어든 것입니다.
//      import 경로도 "./Footer.jsx" 로 고쳐야 화면이 다시 돌아옵니다.
//      _부품 안으로 돌려놓고 경로도 "./_부품/Footer.jsx" 로 되돌리세요.
