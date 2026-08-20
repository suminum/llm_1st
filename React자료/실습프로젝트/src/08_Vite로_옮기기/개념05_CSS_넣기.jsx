// ============================================================
// 08단원 · 개념 05 — CSS 넣기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 08단원의 마지막 개념 파일입니다.
// 개념03에서 import 를 배우고, 개념04에서 컴포넌트를 파일로 나눴습니다.
// 남은 것은 화면 모양, 즉 CSS 입니다.
//
// ★ 이 자료는 CSS 를 가르치지 않습니다.
//   색을 어떻게 고르고 여백을 어떻게 주는지는 다루지 않습니다.
//   여기서 배우는 것은 딱 세 가지입니다.
//
//     1. CSS 파일을 어떻게 프로젝트에 넣는가
//     2. className 을 어떻게 붙이는가 (여러 개 / 조건부)
//     3. 이름이 겹치면 무슨 일이 나고, 어떻게 막는가
//
// ★ 콘솔에 같은 줄이 두 번씩 찍힙니다. 정상입니다(개념02 3부의 StrictMode).

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// [1] 전역 CSS — 이름을 안 받습니다. 그냥 "이 파일도 같이 실어 달라" 는 뜻입니다.
import "./개념05_CSS_넣기.css";
import "./개념05_다른팀.css";

// [2] CSS Modules — 이름을 받습니다. 섹션 5에서 다룹니다.
import styles from "./개념05_CSS_넣기.module.css";

// ── 섹션 1: 스타일은 이미 들어와 있습니다 ──

// 01~07단원에서는 파일마다 위쪽에 <style> 블록이 85줄씩 붙어 있었습니다.
// 그리고 그 85줄이 49개 파일에 전부 복사돼 있었습니다(개념01 한계 1).
//
// 실습프로젝트에는 그 85줄이 한 파일로 모여 있습니다.
//
//     src/index.css
//
// 열어 보면 .demo · .output · .guide · .summary 같은 이름이 그대로 들어 있습니다.
// 01~07단원에서 쓰던 이름과 같습니다.
//
// 그런데 이 파일은 지금 이 파일(개념05)에서 import 하지 않았습니다.
// 그래도 화면 모양이 나옵니다. 왜일까요?
//
// src/main.jsx 를 열어 보면 이런 줄이 있습니다.
//
//     import "./index.css";
//
// main.jsx 는 앱이 켜질 때 딱 한 번 도는 파일입니다(개념02 3부).
// 거기서 한 번 불러 두면 프로젝트 전체에 걸립니다.
// 그래서 각 예제 파일에서 다시 import 할 필요가 없습니다.
//
// 이것이 '전역 CSS' 입니다. 한 번 들어오면 화면 전체에 걸립니다.
// 편리한 만큼 위험한 점도 있습니다. 섹션 4에서 그 이야기를 합니다.

function Section1Demo() {
  console.log("① index.css 는 main.jsx 가 이미 불러 두었습니다");
  // 콘솔: ① index.css 는 main.jsx 가 이미 불러 두었습니다

  return (
    <div className="demo">
      <h3>① 이 상자들은 index.css 가 만든 모양입니다</h3>

      <p className="output">className=&quot;output&quot; — 흰 상자에 회색 테두리</p>
      {/* 화면: 흰 배경에 회색 테두리가 있는 상자 */}

      <p className="error">className=&quot;error&quot; — 빨간 굵은 글씨</p>
      {/* 화면: 빨간 굵은 글씨 */}

      <p className="done">className=&quot;done&quot; — 취소선</p>
      {/* 화면: 회색 취소선이 그어진 글씨 */}
    </div>
  );
}

// ✏️ 직접 해보기 1 — src/index.css 를 열어 .output 규칙이 몇 줄인지 찾아보세요.
//                    (읽기만 하세요. 이 파일은 고치지 않습니다)

// ── 섹션 2: 내 CSS 파일 넣기 ──

// 예제마다 필요한 모양이 다를 수 있습니다. 그럴 때 CSS 파일을 따로 만듭니다.
// 이 파일은 같은 폴더에 이런 파일을 하나 두었습니다.
//
//     src/08_Vite로_옮기기/개념05_CSS_넣기.css
//
// 그리고 이 파일 맨 위에서 이렇게 불렀습니다.
//
//     import "./개념05_CSS_넣기.css";
//
// ★ 개념03에서 본 import 와 모양이 다릅니다. 이름을 안 받습니다.
//
//     import Greeting from "./_부품/Greeting.jsx";   ← 이름을 받습니다
//     import "./개념05_CSS_넣기.css";                ← 이름이 없습니다
//
//   CSS 파일에는 가져올 값이 없기 때문입니다. 함수도 변수도 없습니다.
//   그래서 "가져올 건 없고, 이 파일도 같이 실어 달라" 는 뜻만 남습니다.
//
// ★ 그런데 CSS 는 자바스크립트가 아닌데 어떻게 import 가 되나요?
//
//   Vite 가 대신 처리해 줍니다.
//   Vite 는 이 줄을 보고 CSS 파일을 읽어서, 브라우저 화면에 <style> 태그를
//   하나 만들어 붙입니다. 01~07단원에서 여러분이 손으로 넣던 그 <style> 을
//   Vite 가 대신 만들어 주는 것입니다.
//   그래서 F12 → Elements 로 보면 <head> 안에 style 태그가 들어 있습니다.
//
//   ★ 그리고 CSS 파일을 고치고 저장하면 화면 색만 바뀝니다.
//     페이지가 새로 열리지도 않고 state 도 안 사라집니다. HMR 이 CSS 에도 걸립니다.
//
// ★ .css 파일은 단원 폴더 바로 아래에 둬도 됩니다.
//   왼쪽 메뉴는 .jsx 만 훑기 때문에 .css 는 목록에 안 나타납니다.
//   (개념04에서 부품 .jsx 는 _부품 폴더에 넣어야 했던 것과 다릅니다)
//
// 파일 이름은 자유입니다. 보통은 쓰는 파일과 같은 이름으로 짓습니다.
// 그래야 나중에 짝을 찾기 쉽습니다.

function Section2Demo() {
  console.log("② 내가 만든 CSS 파일의 이름을 쓰고 있습니다");
  // 콘솔: ② 내가 만든 CSS 파일의 이름을 쓰고 있습니다

  return (
    <div className="demo">
      <h3>② 내 CSS 파일이 만든 모양</h3>

      <div className="c05Card">
        <div className="c05Title">아메리카노</div>
        <div className="c05Price">4000원</div>
      </div>
      {/* 화면: 왼쪽에 파란 굵은 세로줄이 있는 흰 카드. 가격은 파란 굵은 글씨 */}

      <div className="c05Card">
        <div className="c05Title">라떼</div>
        <div className="c05Price">4500원</div>
      </div>
      {/* 화면: 같은 모양의 카드 하나 더 */}
    </div>
  );
}

// ✏️ 직접 해보기 2 — 개념05_CSS_넣기.css 의 .c05Price 색을 #2d6cdf 에서
//                    #2e9e4f (초록) 로 바꾸고 저장하세요. 화면이 어떻게 되나요?

// ✏️ 직접 해보기 3 — Section2Demo 에 케이크 6000원 카드를 하나 더 넣으세요.
//                    (CSS 는 안 고칩니다)

// ── 섹션 3: className 다시 보기 ──

// className 은 02단원 개념03에서 이미 배웠습니다. 복습부터 합니다.
//
//   왜 class 가 아니라 className 인가?
//     class 는 자바스크립트가 이미 쓰고 있는 낱말이라 속성 이름으로 못 씁니다.
//     그래서 React 는 className 을 씁니다. 브라우저에 붙을 때는 class 가 됩니다.
//
// 여기서는 08단원에 필요한 두 가지를 더 봅니다.
//
// [1] 여러 개 붙이기 — 공백으로 나눠 씁니다
//
//     <div className="c05Card c05Sale">
//
//   CSS 에서 .c05Card 와 .c05Sale 이 둘 다 걸립니다.
//   .c05Sale 은 테두리 색과 배경만 바꾸므로, 카드 모양은 그대로 두고 색만 달라집니다.
//   이렇게 '기본 모양 + 상태' 로 나눠 두면 조합해 쓸 수 있습니다.
//
// [2] 조건에 따라 바꾸기 — 그냥 문자열을 만들면 됩니다
//
//     className={isSale ? "c05Card c05Sale" : "c05Card"}
//
//   className 은 결국 '글자' 입니다. 그러니 05단원에서 배운 삼항 연산자로
//   글자를 골라 넣으면 됩니다. 새 문법이 아닙니다.
//
//   템플릿 리터럴로 써도 똑같습니다.
//
//     className={`c05Card ${isSale ? "c05Sale" : ""}`}
//
//   둘 중 읽기 편한 쪽을 쓰세요. 이 자료는 삼항 쪽을 씁니다.
//
// [3] style={{ }} 과 어떻게 나눠 쓰나
//
//   02단원 개념03에서 style={{ color: "red" }} 도 배웠습니다. 둘 다 됩니다.
//
//     className  — 정해진 모양. 여러 곳에서 같이 쓰는 것. CSS 파일에 적습니다.
//     style      — 그때그때 계산해서 정해지는 값. 예를 들어 막대 그래프의 길이.
//
//   섞어 써도 됩니다. 보통은 className 을 주로 쓰고, 계산이 필요할 때만 style 을 씁니다.

function Section3Demo() {
  const [isSale, setIsSale] = useState(false);
  const [soldOut, setSoldOut] = useState(false);

  // className 은 결국 글자입니다. 무엇이 들어가는지 콘솔로 확인해 봅시다.
  const cardClass = isSale ? "c05Card c05Sale" : "c05Card";

  console.log("지금 붙은 className:", cardClass);
  // 콘솔: 지금 붙은 className: c05Card

  return (
    <div className="demo">
      <h3>③ className 여러 개 붙이기와 조건부</h3>

      <div className={cardClass}>
        <div className={soldOut ? "c05Title c05SoldOut" : "c05Title"}>케이크</div>
        <div className="c05Price">6000원</div>
      </div>
      {/* 화면: 파란 세로줄 카드에 "케이크 / 6000원" */}

      <button onClick={() => setIsSale(!isSale)}>
        {isSale ? "할인 끄기" : "할인 켜기"}
      </button>
      {/* 화면(누르면): 카드 세로줄이 빨갛게 바뀌고 배경이 연분홍이 됩니다 */}

      <button onClick={() => setSoldOut(!soldOut)}>
        {soldOut ? "판매 재개" : "품절 표시"}
      </button>
      {/* 화면(누르면): "케이크" 글자에 취소선이 그어집니다 */}

      <p className="output">지금 className: {cardClass}</p>
      {/* 화면: 지금 className: c05Card */}
    </div>
  );
}

// ✏️ 직접 해보기 4 — Section3Demo 의 cardClass 를 템플릿 리터럴로 다시 쓰세요.
//                    `c05Card ${isSale ? "c05Sale" : ""}` 로 바꿔도 똑같이 도는지 보세요.

// ✏️ 직접 해보기 5 — 가격 줄에 style={{ fontSize: 20 }} 을 붙여 보세요.
//                    className 과 style 이 같이 걸리는 것을 확인하세요.

// ── 섹션 4: 전역 CSS 의 문제 — 이름이 부딪힙니다 ──

// 여기가 이 파일에서 가장 중요한 부분입니다.
//
// 전역 CSS 는 한 번 불려 오면 화면 전체에 걸립니다.
// 그래서 두 파일이 같은 이름을 쓰면 서로 부딪힙니다.
//
// 이 폴더에는 일부러 그런 파일을 하나 더 만들어 두었습니다.
//
//     개념05_CSS_넣기.css   →   .c05Box { border: 2px solid 파랑; 배경 연파랑 }
//     개념05_다른팀.css     →   .c05Box { border: 2px dashed 빨강; 배경 연분홍 }
//
// 이름이 똑같습니다. 이 파일 맨 위에서 둘 다 import 했습니다.
//
//     import "./개념05_CSS_넣기.css";
//     import "./개념05_다른팀.css";     ← 이쪽이 나중입니다
//
// 결과가 어떻게 될까요? 아래 화면 ④ 를 보세요.
//
//   ★ 에러가 안 납니다. 경고도 없습니다.
//   ★ 나중에 불려 온 쪽이 이깁니다. 빨간 점선이 나옵니다.
//
// 지금은 두 파일이 나란히 보이니 알아채기 쉽습니다.
// 그런데 실제 프로젝트에서는 CSS 파일이 스무 개쯤 됩니다.
// 어제 만든 화면이 오늘 갑자기 이상해졌는데,
// 원인은 다른 사람이 오늘 만든 CSS 파일의 이름이 겹친 것 — 이런 일이 실제로 일어납니다.
//
// [지금까지 쓴 해결책]
//
// 이름 앞에 붙임말을 붙이는 것입니다. 이 파일이 c05 를 붙인 이유가 그것입니다.
//
//     .c05Card · .c05Title · .c05Price
//
// 겹칠 확률이 크게 줄어듭니다. 하지만 사람이 지키는 규칙이라 언젠가 깨집니다.
// 붙임말을 빠뜨린 것을 아무도 못 잡아 줍니다.
//
// 그리고 한 가지 더 확인할 것이 있습니다.
//
//   ★ 이 예제를 한 번 열면, 다른 예제로 옮겨 가도 이 CSS 는 살아 있습니다.
//
// 전역이라는 말이 그런 뜻입니다. 예제를 바꾼다고 CSS 가 사라지지 않습니다.
// 만약 이 파일이 .demo 나 .output 같은 이름을 다시 정의했다면,
// 09단원·10단원 예제까지 전부 이상해졌을 것입니다.
// c05 를 붙여 둔 덕분에 아무 일도 안 일어난 것입니다.
//
// 이것을 규칙이 아니라 도구로 막는 방법이 다음 섹션의 CSS Modules 입니다.

function Section4Demo() {
  console.log("④ 같은 이름의 .c05Box 가 두 파일에 있습니다");
  // 콘솔: ④ 같은 이름의 .c05Box 가 두 파일에 있습니다

  return (
    <div className="demo">
      <h3>④ 이름이 겹치면 나중 것이 이깁니다</h3>

      <div className="c05Box">
        이 상자의 className 은 c05Box 하나입니다.
        <br />
        그런데 CSS 파일 두 개가 이 이름을 서로 다르게 정해 두었습니다.
      </div>
      {/* 화면: 빨간 점선 테두리에 연분홍 배경. 나중에 import 한 개념05_다른팀.css 가 이겼습니다 */}

      <p className="output">
        F12 → Elements 에서 이 상자를 눌러 보세요. 오른쪽에 두 규칙이 다 보이고, 진
        쪽에 취소선이 그어져 있습니다.
      </p>
    </div>
  );
}

// ✏️ 직접 해보기 6 — 이 파일 맨 위의 CSS import 두 줄의 순서를 바꿔 보세요.
//                    (개념05_다른팀.css 를 먼저 쓰기) 화면 ④ 가 어떻게 되나요?

// ── 섹션 5: CSS Modules 맛보기 ──

// 이름이 겹치는 문제를 도구로 막는 방법입니다. 하는 일은 한 줄로 요약됩니다.
//
//   ★ 내가 쓴 이름을 Vite 가 '아무도 안 쓸 것 같은 긴 이름' 으로 바꿔 줍니다.
//
// 쓰는 법은 두 가지만 다릅니다.
//
//   [1] 파일 이름을 .module.css 로 끝냅니다
//
//         개념05_CSS_넣기.module.css
//
//   [2] import 할 때 이름을 받습니다
//
//         import styles from "./개념05_CSS_넣기.module.css";
//
//       전역 CSS 는 이름을 안 받았는데(섹션 2), 이쪽은 받습니다.
//       styles 는 평범한 객체입니다. 키가 CSS 에 적은 이름이고,
//       값이 Vite 가 새로 지어 준 이름입니다.
//
// 그리고 className 에 그 값을 넣습니다.
//
//     <div className={styles.card}>       ← 글자가 아니라 값을 넣습니다
//
// 전역 CSS 때와 비교해 보세요.
//
//     <div className="c05Card">           전역: 내가 적은 이름 그대로
//     <div className={styles.card}>       모듈: Vite 가 지어 준 이름
//
// styles 안에 무엇이 들었는지 콘솔로 확인해 봅시다.

function Section5Demo() {
  const [isSale, setIsSale] = useState(false);

  console.log(typeof styles.card);
  // 콘솔: string

  console.log(styles.card === styles.title);
  // 콘솔: false

  // 값은 그냥 글자입니다. 다만 우리가 적은 card 가 아니라 Vite 가 새로 지은 이름입니다.
  // 실제로 무슨 글자인지는 화면에 찍어 봅니다. 컴퓨터마다 다를 수 있습니다.
  //
  // 이름이 저렇게 생긴 덕분에, 다른 파일에 card 라는 이름이 있어도 부딪히지 않습니다.
  // 사람이 c05 같은 붙임말을 붙이는 것과 목적은 같은데,
  // 이쪽은 도구가 자동으로 해 주니 빠뜨릴 일이 없습니다.
  //
  // ★ 여러 개를 붙일 때는 템플릿 리터럴을 씁니다.
  //   글자가 아니라 값이라서 공백으로 이어 붙이려면 문자열을 만들어야 합니다.
  //
  //     className={`${styles.card} ${styles.sale}`}
  //
  // ★ 언제 쓰나요?
  //   여러 사람이 함께 만드는 큰 프로젝트에서 씁니다.
  //   혼자 연습하는 지금은 전역 CSS 가 더 간단합니다.
  //   이 자료의 09~13단원도 전역(index.css)만 씁니다.
  //   "이런 방법도 있다" 만 알아 두면 충분합니다.

  const cardClass = isSale
    ? `${styles.card} ${styles.sale}`
    : styles.card;

  return (
    <div className="demo">
      <h3>⑤ CSS Modules — 이름을 Vite 가 새로 지어 줍니다</h3>

      <div className={cardClass}>
        <div className={styles.title}>삼각김밥</div>
        <div className={styles.price}>1200원</div>
      </div>
      {/* 화면: 왼쪽에 초록 세로줄이 있는 카드. 제목이 초록 글씨 */}

      <button onClick={() => setIsSale(!isSale)}>
        {isSale ? "할인 끄기" : "할인 켜기"}
      </button>
      {/* 화면(누르면): 세로줄이 빨갛게 바뀌고 배경이 연분홍이 됩니다 */}

      <p className="output">
        CSS 에 적은 이름: <code>card</code>
        <br />
        Vite 가 지어 준 이름: <code>{styles.card}</code>
      </p>
      {/* 화면: Vite 가 지어 준 이름 자리에 _card_ 로 시작하는 긴 글자가 보입니다 */}
    </div>
  );
}

// ✏️ 직접 해보기 7 — 개념05_CSS_넣기.module.css 에 .soldOut 규칙을 추가하고
//                    ( color: #999; text-decoration: line-through; )
//                    삼각김밥 제목에 styles.soldOut 을 붙여 보세요.

// ✏️ 직접 해보기 8 — Section5Demo 의 className={styles.title} 을
//                    className="title" 로 바꿔 보세요. 화면이 어떻게 되나요?

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] class 라고 씀
// <div class="c05Card">
//   실수: React 가 이런 경고를 냅니다.
//           Warning: Invalid DOM property `class`. Did you mean `className`?
//         에러는 아니지만 스타일이 안 걸립니다. 02단원 개념03에서 배운 것입니다.

// [실수 2] CSS 파일 import 를 빠뜨림 ★ 에러가 안 납니다
//   className="c05Card" 라고 잘 써 놓고 import "./개념05_CSS_넣기.css"; 를 안 쓴 경우입니다.
//   에러도 경고도 없습니다. 글자만 밋밋하게 나옵니다.
//   "CSS 를 분명히 썼는데 안 먹어요" 의 1순위 원인입니다.
//   ★ 브라우저는 모르는 class 이름을 그냥 무시합니다. 그래서 아무 말도 안 합니다.

// [실수 3] CSS Modules 인데 글자로 씀 ★ 이것도 에러가 안 납니다
// <div className="card">
//   실수: styles.card 라고 써야 하는데 글자 "card" 를 넣은 경우입니다.
//         Vite 가 이름을 바꿔 놨으니 화면에는 그런 이름이 없습니다.
//         에러 없이 스타일만 안 걸립니다. ✏️ 8번에서 직접 봅니다.

// [실수 4] .module.css 가 아닌 파일에서 styles 를 받으려 함
// import styles from "./개념05_CSS_넣기.css";
//   실수: 파일 이름이 .module.css 로 끝나지 않으면 그냥 전역 CSS 입니다.
//         가져올 것이 없으니 styles 가 비어 있습니다.
//         styles.card 는 undefined 가 되고, className={undefined} 는 조용히 무시됩니다.
//         이것도 에러 없이 스타일만 안 걸립니다.

// [실수 5] CSS 이름에 하이픈을 써 놓고 점으로 꺼냄
//   .module.css 안에 .sold-out 이라고 적으면 styles.sold-out 으로는 못 꺼냅니다.
//   자바스크립트가 뺄셈으로 읽기 때문입니다. styles["sold-out"] 이라고 써야 합니다.
//   번거로우니 CSS Modules 에서는 이름을 soldOut 처럼 카멜케이스로 짓습니다.

// [실수 6] CSS 파일에 이름이 겹치는 줄 추가 ★ 남의 화면이 망가집니다
//   전역 CSS 에 .output 이나 .demo 를 다시 정의하면
//   09단원·10단원 예제까지 전부 영향을 받습니다.
//   섹션 4에서 본 것과 같은 일입니다. 다만 피해 범위가 훨씬 넓습니다.
//   전역 CSS 에 이름을 새로 만들 때는 반드시 붙임말을 붙이세요.

// ── 화면 ──

export default function Concept05Css() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 05 — CSS 넣기</h1>

      <p className="guide">
        이 파일이 쓰는 CSS 는 <strong>같은 폴더</strong>에 있습니다.
        <code>개념05_CSS_넣기.css</code>, <code>개념05_다른팀.css</code>,
        <code>개념05_CSS_넣기.module.css</code> 세 개입니다. 함께 열어 놓고 보세요.
        <br />
        <br />
        <strong>.css 는 단원 폴더 바로 아래에 둬도 됩니다.</strong> 왼쪽 메뉴는{" "}
        <code>.jsx</code> 만 훑기 때문에 목록에 안 나타납니다.
        <br />
        <br />
        <strong>CSS 자체는 이 자료에서 가르치지 않습니다.</strong> 색과 여백은 몰라도
        됩니다. 파일을 넣는 방법과 이름을 붙이는 방법만 보세요.
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
          "실습프로젝트의 src/index.css 는 main.jsx 가 한 번 import 해 두어서 모든 예제에 이미 걸려 있습니다. 01~07단원의 <style> 85줄이 여기 한 곳으로 모인 것입니다.",
          "내 CSS 파일은 import \"./파일.css\"; 로 넣습니다. 이름을 안 받는 import 입니다. Vite 가 읽어서 <style> 태그를 대신 만들어 줍니다.",
          ".css 파일은 단원 폴더 바로 아래에 둬도 됩니다. 왼쪽 메뉴는 .jsx 만 보기 때문입니다.",
          "className 은 결국 글자입니다. 여러 개는 공백으로 잇고, 조건부는 삼항이나 템플릿 리터럴로 글자를 만들면 됩니다. 새 문법이 아닙니다.",
          "전역 CSS 는 이름이 겹치면 나중에 불려 온 쪽이 이깁니다. 에러도 경고도 없이 화면만 바뀝니다. 이름 앞에 붙임말을 붙여 막습니다.",
          "CSS Modules(.module.css)는 이름을 Vite 가 새로 지어 줘서 겹치지 않게 합니다. import styles from ... 로 받고 className={styles.card} 로 씁니다.",
          "CSS 가 안 먹으면 import 를 빠뜨렸는지부터 보세요. 브라우저는 모르는 class 이름을 조용히 무시하므로 아무 말도 안 해 줍니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) src/index.css 의 .output 규칙은 이렇게 생겼습니다.
//
//      .output {
//        background: #fff;
//        border: 1px solid #ccc;
//        padding: 10px;
//        margin-top: 6px;
//      }
//
//    → 네 줄입니다. 01~07단원 파일 위쪽 <style> 안에 있던 것과 똑같습니다.
//      다른 점은 딱 하나, 이제 세상에 한 벌만 있다는 것입니다.
//
// 2) .c05Price { color: #2e9e4f; }
//    // 화면: ② 상자의 가격 두 줄(4000원 · 4500원)이 초록 글씨가 됩니다.
//    //       ③ 의 6000원 도 함께 초록이 됩니다.
//    → 저장하는 순간 색만 바뀝니다. 페이지가 새로 열리지 않고 state 도 안 사라집니다.
//      ③ 의 [할인 켜기] 를 눌러 놓고 CSS 를 고쳐 보세요. 켜 둔 상태가 그대로 남습니다.
//      확인했으면 #2d6cdf 로 되돌려 두세요.
//
// 3) Section2Demo 안에 이 덩어리를 하나 더 넣습니다.
//
//      <div className="c05Card">
//        <div className="c05Title">케이크</div>
//        <div className="c05Price">6000원</div>
//      </div>
//
// 화면: 같은 모양의 카드가 세 개가 됩니다.
//    → CSS 는 한 글자도 안 고쳤습니다. 이름만 붙이면 같은 모양이 나옵니다.
//
// 4) const cardClass = `c05Card ${isSale ? "c05Sale" : ""}`;
//    // 화면: 똑같이 돕니다.
//    // 콘솔: 지금 붙은 className: c05Card
//    → 할인을 안 켰을 때 뒤에 공백이 하나 더 붙지만 브라우저는 신경 쓰지 않습니다.
//      삼항이 읽기 쉬우면 삼항을, 붙일 게 많으면 템플릿 리터럴을 쓰세요.
//
// 5) <div className="c05Price" style={{ fontSize: 20 }}>6000원</div>
//    // 화면: 가격 글씨가 커집니다. 파란 굵은 글씨는 그대로입니다.
//    → 둘이 싸우지 않습니다. className 이 색과 굵기를, style 이 크기를 맡았습니다.
//      같은 것을 둘 다 정하면 style 이 이깁니다.
//
// 6) import "./개념05_다른팀.css";
//    import "./개념05_CSS_넣기.css";
//    // 화면: ④ 상자가 파란 실선 테두리에 연파랑 배경이 됩니다.
//    → 순서만 바꿨는데 화면이 바뀌었습니다. 에러도 경고도 없습니다.
//      "누가 나중에 불려 오는가" 로 결과가 정해지는 것 —
//      이것이 전역 CSS 가 위험한 이유입니다.
//      확인했으면 원래 순서로 되돌려 두세요.
//
// 7) 개념05_CSS_넣기.module.css 에 추가:
//
//      .soldOut {
//        color: #999;
//        text-decoration: line-through;
//      }
//
//    Section5Demo 에서:
//      <div className={`${styles.title} ${styles.soldOut}`}>삼각김밥</div>
//
// 화면: "삼각김밥" 에 회색 취소선이 그어집니다.
//    → 이름을 soldOut 처럼 카멜케이스로 지은 이유는 실수 5에 있습니다.
//      sold-out 이라고 지으면 styles.sold-out 으로 못 꺼냅니다.
//
// 8) <div className="title">삼각김밥</div>
//    // 화면: "삼각김밥" 이 초록 굵은 글씨가 아니라 그냥 검은 글씨가 됩니다.
//    → 에러도 경고도 없습니다. 스타일만 조용히 사라집니다.
//      Vite 가 title 이라는 이름을 다른 이름으로 바꿔 놨기 때문입니다.
//      화면에 찍어 둔 "Vite 가 지어 준 이름" 을 보면 title 이 아닌 것을 알 수 있습니다.
//      되돌려 두세요.
