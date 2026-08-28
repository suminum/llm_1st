// ============================================================
// 08단원 연습문제 정답 — Vite 로 옮기기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//
// ★ 먼저 스스로 풀어 보고 여세요. 막힌 문제만 보는 편이 훨씬 남습니다.
// ★ 답이 하나뿐인 것은 아닙니다. 화면이 기대 결과대로 나오면 맞은 것입니다.
// ★ 개발 중에는 StrictMode 때문에 콘솔 줄이 두 번씩 찍힙니다. 정상입니다.
// ============================================================

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

import "./연습문제.css";

// ══════════════════ [import 연습 구역] 정답 ══════════════════
//
// 문제를 풀면 이만큼이 쌓입니다. 어느 줄이 어느 문제인지 옆에 적어 두었습니다.
// 순서는 상관없습니다. 다만 보통은
//   ① 남이 만든 도구(react) → ② 자료가 준 부품(_ui) → ③ 내 파일
// 순서로 적습니다. 읽기 편하기 때문입니다.

import Welcome from "./_부품/연습_Welcome.jsx"; // 문제 1
import { cakePrice, applyDiscount, formatPrice } from "./_부품/연습_가격.js"; // 문제 2, 11
import { americanoPrice as coffeePrice } from "./_부품/연습_가격.js"; // 문제 3
import Badge, { hotLabel } from "./_부품/연습_뱃지.jsx"; // 문제 4
import CoffeeCard from "./_부품/연습_카드.jsx"; // 문제 5
import CoffeeList from "./_부품/연습_카드목록.jsx"; // 문제 6
import styles from "./연습문제.module.css"; // 문제 10
import OrderTable from "./_부품/연습_주문표_정답.jsx"; // 문제 12

// ★ 문제 2와 문제 3은 같은 파일에서 가져오는데 줄이 두 개입니다.
//   as 를 쓰는 것만 따로 떼어 놓으면 읽기 쉬워서 이렇게 나눴습니다.
//   한 줄로 합쳐도 똑같이 돕니다.
//
//     import { cakePrice, applyDiscount, formatPrice, americanoPrice as coffeePrice }
//       from "./_부품/연습_가격.js";
//
// ══════════════════ 여기까지 ══════════════════

const menuItems = [
  { id: 1, name: "아메리카노", price: 4000, soldOut: false },
  { id: 2, name: "라떼", price: 4500, soldOut: false },
  { id: 3, name: "케이크", price: 6000, soldOut: true },
  { id: 4, name: "삼각김밥", price: 1200, soldOut: false },
];

// ───── 문제 1 정답 ───── (개념02)

function Q1Welcome() {
  return <Welcome name="김민준" />;
}

// export default 로 나온 것은 중괄호 없이 가져오고, 이름은 마음대로 지어도 됩니다.
// 다만 파일 이름과 같게 짓는 편이 나중에 찾기 좋습니다(개념02 섹션 2).
// <Welcome /> 은 컴포넌트이므로 대문자로 시작해야 합니다.

// ───── 문제 2 정답 ───── (개념02)

function Q2Discount() {
  const salePrice = applyDiscount(cakePrice);

  return (
    <div className="output">
      케이크 {cakePrice}원 → 할인가 {salePrice}원
    </div>
  );
}

// 이름 있는 export 는 중괄호 안에 이름을 정확히 적어야 합니다.
// 중괄호를 빼면 "그 파일의 대표를 주세요" 가 되는데,
// 연습_가격.js 에는 대표가 없어서 값이 undefined 가 됩니다.
// ★ 그런데 에러가 안 납니다. 화면의 숫자 자리만 비어 버립니다.
//   이것이 개념02 섹션 6의 [실수 2] 입니다. 문제 13의 (다) 에서 직접 봅니다.

// ───── 문제 3 정답 ───── (개념02)

// 이 줄이 이미 있어서 이름이 부딪힙니다.
const americanoPrice = 9999;

function Q3Rename() {
  return (
    <div className="output">
      가져온 값 {coffeePrice} / 이 파일의 값 {americanoPrice}
    </div>
  );
}

// as 를 안 쓰고 그냥 import { americanoPrice } 라고 쓰면
// [SyntaxError] Identifier 'americanoPrice' has already been declared 가 납니다.
// "이미 있는 이름이다" 라는 뜻입니다. 화면이 통째로 빕니다.
//
// as 는 이럴 때 씁니다. 겹치지 않는데 굳이 이름을 바꾸지는 마세요. 찾기만 어려워집니다.

// ───── 문제 4 정답 ───── (개념02)

function Q4Badge() {
  return (
    <div className="output">
      아메리카노 <Badge text={hotLabel} />
    </div>
  );
}

// 대표(Badge)가 앞, 중괄호(hotLabel)가 뒤입니다. 순서가 정해져 있습니다.
// 중괄호가 없는 쪽이 대표라고 기억하면 됩니다.
//
// import { Badge, hotLabel } 처럼 둘 다 중괄호에 넣으면 이런 에러가 납니다.
//   The requested module ... does not provide an export named 'Badge'

// ───── 문제 5 정답 ───── (개념03)

function Q5UseCard() {
  return (
    <div>
      <CoffeeCard name="아메리카노" price={4000} note="가장 많이 팔립니다" />
      <CoffeeCard name="라떼" price={4500} note="우유가 들어갑니다" />
      <CoffeeCard name="케이크" price={6000} note="달아요" />
    </div>
  );
}

// 화면은 하나도 안 바뀌었습니다. 바뀐 것은 코드뿐입니다.
// 15줄이 3줄이 됐고, <small> 문구의 모양을 고치려면 이제 한 곳만 고치면 됩니다.
// 03단원 개념05에서 한 일과 같은데, 이번에는 파일이 나뉘어 있습니다.

// ───── 문제 6 정답 ───── (개념03)

function Q6UseList() {
  return <CoffeeList />;
}

// 한 줄입니다. 그리고 이 파일은 CoffeeCard 를 import 하지 않았습니다.
// CoffeeList 가 자기 안에서 알아서 가져다 씁니다.
//
// (이 정답 파일은 문제 5 때문에 CoffeeCard 도 import 하고 있습니다.
//  문제 6만 놓고 보면 필요 없는 줄입니다)
//
// 이것이 파일을 나눠 얻는 것입니다. 쓰는 쪽은 안을 몰라도 됩니다.
// CoffeeList 안의 카드가 세 개든 열 개든 이 파일은 그대로입니다.

// ───── 문제 7 정답 ───── (개념03)

function Q7NoReact() {
  console.log(typeof React);
  // 콘솔: undefined

  const element = <strong>라떼</strong>;

  console.log(element.type);
  // 콘솔: strong

  return <div className="output">문제 7: 콘솔을 보세요 (F12 → Console)</div>;
}

// React 라는 이름이 이 파일에 없는데도 JSX 가 돕니다.
// Vite 가 JSX 를 react/jsx-runtime 의 함수로 바꾸고, 그 import 를 자동으로 넣어 주기 때문입니다.
// 개념03 섹션 4에서 본 그것입니다.
//
// typeof 를 빼고 console.log(React) 라고 쓰면 ReferenceError 가 나면서
// 예제가 빨간 상자로 바뀝니다. typeof 는 없는 이름에 써도 되는 몇 안 되는 문법입니다.
//
// element 는 화면이 아니라 값입니다. 평범한 객체이고 type 에 태그 이름이 들어 있습니다.

// ───── 문제 8 정답 ───── (개념04)

function Q8ClassName() {
  return (
    <div className="q08Card">
      <strong>아메리카노</strong> — <span className="q08Price">4000원</span>
    </div>
  );
}

// class 라고 쓰면 React 가 경고를 냅니다.
//   Invalid DOM property `class`. Did you mean `className`?
// 경고만 나고 화면은 안 멈춥니다. 대신 스타일이 하나도 안 걸립니다.
// 문제 13의 (라) 에서 직접 봅니다.

// ───── 문제 9 정답 ───── (개념04)

function Q9Conditional() {
  const [isSale, setIsSale] = useState(false);

  // className 은 결국 글자입니다. 그러니 삼항으로 골라 넣으면 됩니다.
  const cardClass = isSale ? "q08Card q08Sale" : "q08Card";

  return (
    <div>
      <div className={cardClass}>
        <strong>케이크</strong> — <span className="q08Price">6000원</span>
      </div>
      <button onClick={() => setIsSale(!isSale)}>
        {isSale ? "할인 끄기" : "할인 켜기"}
      </button>
    </div>
  );
}

// 템플릿 리터럴로 써도 똑같습니다.
//   const cardClass = `q08Card ${isSale ? "q08Sale" : ""}`;
//
// 할인일 때 "q08Sale" 만 넣으면 카드 모양(테두리·여백)이 통째로 사라집니다.
// .q08Sale 은 색만 바꾸는 규칙이라 혼자서는 카드가 되지 않습니다.
// '기본 모양 + 상태' 로 나눠 두고 둘 다 붙이는 것이 요령입니다.

// ───── 문제 10 정답 ───── (개념04)

function Q10Modules() {
  return (
    <div className={styles.box}>
      <span className={styles.label}>삼각김밥</span> — 1200원
    </div>
  );
}

// 전역 CSS 는 이름을 안 받고(import "./x.css"), CSS Modules 는 이름을 받습니다.
// styles 는 평범한 객체입니다. 키가 CSS 에 적은 이름, 값이 Vite 가 새로 지은 이름입니다.
//
// className="box" 라고 글자로 적으면 아무 일도 안 일어납니다.
// 에러도 경고도 없습니다. Vite 가 이름을 바꿔 놨기 때문입니다.

// ───── 문제 11 정답 ───── [응용] (개념02 + 개념04)

function Q11List() {
  return (
    <ul>
      {menuItems.map((item) => (
        <li key={item.id}>
          <span className={item.soldOut ? "q08SoldOut" : ""}>{item.name}</span> —{" "}
          <span className="q08Price">{formatPrice(item.price)}</span>
        </li>
      ))}
    </ul>
  );
}

// 세 가지가 한 줄에 모여 있습니다.
//   map + key            05단원
//   formatPrice          08단원에서 다른 파일에서 가져온 함수
//   조건부 className      08단원 개념04
//
// className={item.soldOut ? "q08SoldOut" : ""} 에서 빈 문자열을 쓴 것에 주의하세요.
// className 은 글자라서 "아무것도 안 붙임" 은 빈 글자입니다.
// null 을 넣어도 React 가 무시해 주지만, 빈 글자가 더 헷갈리지 않습니다.

// ───── 문제 12 정답 ───── [도전] (개념02 + 개념03)

function Q12OrderTable() {
  return <OrderTable items={menuItems} />;
}

// ★ 여러분이 만들 파일은 _부품/연습_주문표.jsx 입니다.
//   이 정답 파일은 _부품/연습_주문표_정답.jsx 라는 이름으로 미리 만들어 둔 것을 씁니다.
//   같은 이름으로 두면 여러분이 만든 파일과 부딪히기 때문에 이름만 다르게 했습니다.
//   그 파일을 열어 보세요. 내용은 여러분이 만들 것과 똑같습니다.
//
// 그 파일 안에서 중요한 것 두 가지입니다.
//
//   [1] 경로
//       그 파일도 _부품 폴더 안에 있으므로 "./연습_카드.jsx" 입니다.
//       "./_부품/연습_카드.jsx" 라고 쓰면 _부품 안에 또 _부품 을 찾다가 실패합니다.
//       경로는 늘 '그 줄이 적힌 파일' 이 기준입니다(개념02 섹션 4).
//
//   [2] 합계
//       items.reduce((sum, item) => sum + item.price, 0)
//       JS자료 08단원의 reduce 입니다. 시작값 0 을 빼면
//       첫 번째 항목(객체)이 시작값이 되어 합계가 이상해집니다.
//
//       reduce 가 낯설면 이렇게 해도 됩니다. 결과는 같습니다.
//         let total = 0;
//         for (const item of items) { total = total + item.price; }
//
// 합계는 4000 + 4500 + 6000 + 1200 = 15700 입니다.

// ───── 문제 13 정답 ───── (에러 확인)
//
// 정답은 이 파일 맨 아래 '문제 13 — 에러 확인 정답' 블록에 있습니다.

export default function Answer08Vite() {
  return (
    <div>
      <h1>08단원 연습문제 정답 — Vite 로 옮기기</h1>

      <p className="guide">
        <strong>먼저 스스로 풀어 보고 여세요.</strong> 막힌 문제만 보는 편이 훨씬
        남습니다.
        <br />
        <br />
        답이 하나뿐인 것은 아닙니다. <strong>기대 결과대로 나오면 맞은 것</strong>입니다.
        각 정답 아래에 왜 그런지와, 자주 하는 실수를 적어 두었습니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 도 함께 열어 두세요. 문제 7은 콘솔로 확인합니다.
      </p>

      <div className="demo">
        <h3>문제 1 — export default 가져오기</h3>
        <Q1Welcome />
      </div>
      <div className="demo">
        <h3>문제 2 — 이름 있는 export 가져오기</h3>
        <Q2Discount />
      </div>
      <div className="demo">
        <h3>문제 3 — as 로 이름 바꾸기</h3>
        <Q3Rename />
      </div>
      <div className="demo">
        <h3>문제 4 — default 와 이름 있는 export 를 한 줄에</h3>
        <Q4Badge />
      </div>
      <div className="demo">
        <h3>문제 5 — 반복을 부품으로 줄이기</h3>
        <Q5UseCard />
      </div>
      <div className="demo">
        <h3>문제 6 — 부품이 부품을 부른다</h3>
        <Q6UseList />
      </div>
      <div className="demo">
        <h3>문제 7 — React 없이 도는 JSX</h3>
        <Q7NoReact />
      </div>
      <div className="demo">
        <h3>문제 8 — className 붙이기</h3>
        <Q8ClassName />
      </div>
      <div className="demo">
        <h3>문제 9 — 조건에 따라 className 바꾸기</h3>
        <Q9Conditional />
      </div>
      <div className="demo">
        <h3>문제 10 — CSS Modules</h3>
        <Q10Modules />
      </div>
      <div className="demo">
        <h3>문제 11 [응용] — 목록 + 조건부 className</h3>
        <Q11List />
      </div>
      <div className="demo">
        <h3>문제 12 [도전] — 부품 파일 직접 만들기</h3>
        <Q12OrderTable />
      </div>
      <div className="demo">
        <h3>문제 13 — 에러 확인</h3>
        <p>이 문제는 화면이 아니라 코드와 콘솔로 확인합니다. 파일 맨 아래를 보세요.</p>
      </div>

      <Summary
        items={[
          "export default 는 중괄호 없이, 이름 있는 export 는 중괄호 안에 정확한 이름으로 가져옵니다. 둘을 바꿔 쓰면 결과가 완전히 다릅니다.",
          "이름이 겹치면 as 로 바꿉니다. 안 바꾸면 Identifier ... has already been declared 로 파일이 통째로 멈춥니다.",
          "부품을 쓰는 쪽은 그 부품 안이 어떻게 생겼는지 몰라도 됩니다. CoffeeList 를 쓰면서 CoffeeCard 를 import 할 필요가 없습니다.",
          "경로는 늘 그 줄이 적힌 파일이 기준입니다. _부품 안의 파일끼리는 ./ 만으로 서로를 부릅니다.",
          "className 은 글자입니다. 조건부는 삼항이나 템플릿 리터럴로 글자를 만들면 됩니다. '기본 모양 + 상태' 로 나눠 두고 둘 다 붙이세요.",
          "CSS Modules 는 이름을 Vite 가 새로 지어 주므로 className={styles.box} 처럼 값을 넣어야 합니다. 글자로 적으면 조용히 안 걸립니다.",
          "import 실수 중 '이름 있는 export 를 중괄호 없이 가져오기' 와 'class 라고 쓰기' 는 에러가 안 납니다. 가장 찾기 어려운 종류입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 문제 13 — 에러 확인 정답
// ============================================================
//
// (가) import 경로에서 ./ 를 지웠을 때
//        "./_부품/연습_Welcome.jsx"  →  "_부품/연습_Welcome.jsx"
//
//      화면: 예제가 통째로 안 나옵니다.
//      터미널과 화면에 이 줄이 뜹니다.
//        Failed to resolve import "_부품/연습_Welcome.jsx" from "src/08_.../연습문제.jsx".
//        Does the file exist?
//
//      → ./ 가 없으면 경로가 아니라 '도구 이름' 으로 읽힙니다.
//        node_modules 에서 _부품 이라는 도구를 찾다가 실패한 것입니다.
//        Vite 가 파일을 읽는 단계에서 막히므로 화면이 아예 안 그려집니다.
//
// (나) 중괄호로 바꿨을 때
//        import Welcome from ...  →  import { Welcome } from ...
//
//      화면: 빨간 상자로 바뀝니다.
//      콘솔:
//        SyntaxError: The requested module '/src/08_.../_부품/연습_Welcome.jsx'
//        does not provide an export named 'Welcome'
//
//      → 파일은 잘 찾았습니다. 그 안에 'Welcome 이라는 이름으로 내보낸 것' 이 없을 뿐입니다.
//        연습_Welcome.jsx 는 export default 로 내보냈습니다.
//        (가)와 (나)의 차이가 여기 있습니다.
//          (가) 파일 자체를 못 찾았다   → Failed to resolve import
//          (나) 파일은 찾았는데 그 이름이 없다 → does not provide an export named
//        메시지만 읽어도 어느 쪽인지 구분할 수 있습니다.
//
// (다) 중괄호를 지웠을 때
//        import { cakePrice, applyDiscount } from ...  →  import cakePrice from ...
//
//      ★ 에러가 안 납니다. 경고도 없습니다.
//      화면: "케이크 원 → 할인가 원" 처럼 숫자 자리가 비어 버립니다.
//            (그리고 applyDiscount 를 안 가져왔으므로 그 줄에서 다른 에러가 따로 납니다.
//             cakePrice 하나만 놓고 보면 조용히 undefined 가 됩니다)
//
//      → "그 파일의 대표를 주세요" 라고 말했는데 연습_가격.js 에는 대표가 없습니다.
//        없는 것을 달라고 했으니 undefined 가 옵니다.
//        {undefined} 는 화면에 아무것도 안 그립니다(05단원 개념05).
//        그래서 에러 없이 자리만 빕니다.
//
// (라) className 을 class 로 바꿨을 때
//
//      ★ 에러가 안 납니다. 화면도 안 멈춥니다.
//      화면: 카드 모양이 사라지고 밋밋한 글자만 남습니다.
//      콘솔에 노란 경고가 뜹니다.
//        Invalid DOM property `class`. Did you mean `className`?
//
//      → 02단원 개념03에서 배운 것입니다. class 는 자바스크립트가 쓰는 낱말이라
//        React 는 className 을 씁니다. 경고를 안 읽으면 못 찾습니다.
//
// [에러가 안 나는데 틀린 것] — (다) 와 (라) 입니다.
//
//   (가)·(나)는 화면이 멈추니 바로 알아챕니다. 오히려 고치기 쉬운 쪽입니다.
//   (다)·(라)는 화면이 계속 돌아갑니다. 값만 비고 스타일만 안 걸립니다.
//   그래서 며칠 뒤에야 발견되기도 합니다.
//
//   ★ 값이 undefined 로 보이면  → 중괄호를 확인하세요
//   ★ CSS 가 안 걸리면          → className 철자와 import 를 확인하세요
//   ★ 그리고 콘솔의 노란 경고를 그냥 넘기지 마세요. 대부분 이런 것을 알려 줍니다.
