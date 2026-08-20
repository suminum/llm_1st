// ============================================================
// 08단원 연습문제 — Vite 로 옮기기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//       고치고 저장하면 화면이 바로 바뀝니다. F12 → Console 도 함께 보세요.
//
// 문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다.
// 문제마다 '기대 결과' 가 적혀 있으니 그대로 나오는지 확인하세요.
//
// ★ 아직 안 푼 문제는 "문제 N: ..." 같은 안내 글자가 그대로 보입니다. 정상입니다.
// ★ 개발 중에는 StrictMode 때문에 콘솔 줄이 두 번씩 찍힙니다. 이것도 정상입니다.
//
// ★ 이 단원은 import 를 다룹니다. import 는 파일 맨 위에만 쓸 수 있으므로,
//   아래 [import 연습 구역] 에 줄을 추가하면서 풉니다.
//   부품 파일들은 _부품 폴더에 이미 다 만들어 두었습니다. 열어서 읽어 보세요.
// ============================================================

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// 이 파일이 쓰는 CSS 입니다. 문제 8·9가 여기 있는 이름을 씁니다.
import "./연습문제.css";

// ══════════════════ [import 연습 구역] ══════════════════
//
// 문제 1 · 2 · 3 · 4 · 5 · 6 · 10 · 12 는 여기에 import 줄을 씁니다.
// 문제를 읽고 필요한 줄을 하나씩 늘려 가세요.
//
// TODO: 여기에 import 줄을 쓰세요
//
// ══════════════════ 여기까지 ══════════════════

// 문제에서 함께 쓰는 데이터입니다. 고치지 마세요.
const menuItems = [
  { id: 1, name: "아메리카노", price: 4000, soldOut: false },
  { id: 2, name: "라떼", price: 4500, soldOut: false },
  { id: 3, name: "케이크", price: 6000, soldOut: true },
  { id: 4, name: "삼각김밥", price: 1200, soldOut: false },
];

// ───── 문제 1 ───── (개념03)
// _부품/연습_Welcome.jsx 를 열어 보세요. Welcome 이라는 컴포넌트를
// export default 로 내보내고 있습니다.
// 그것을 이 파일로 가져와서 화면에 그리세요.
//
// 할 일은 두 가지입니다.
//   (1) [import 연습 구역] 에 import 줄을 한 줄 쓴다
//   (2) 아래 Q1Welcome 안의 안내 문구를 <Welcome name="김민준" /> 으로 바꾼다
//
// 기대 결과 (화면): 김민준님, 환영합니다.
//                  화면 전체가 빨간 상자가 되고 Failed to resolve import 가 보이면
//                  경로 앞의 ./ 를 빠뜨린 것입니다.
//                  Welcome is not defined 가 나오면 import 줄을 안 쓴 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q1Welcome() {
  return (
    <div className="output">문제 1: _부품/연습_Welcome.jsx 를 가져와 쓰세요</div>
  );
}

// ───── 문제 2 ───── (개념03)
// _부품/연습_가격.js 에는 이름 있는 export 가 여러 개 있습니다.
// 그중 cakePrice 와 applyDiscount 두 개만 가져와서 아래 화면을 만드세요.
//
//   할 일: [import 연습 구역] 에 한 줄 쓰고, 아래 함수 안을 고치기
//
// 기대 결과 (화면): 케이크 6000원 → 할인가 5400원
//                  값이 undefined 로 나오면 중괄호를 안 쓴 것입니다.
//                  does not provide an export named 이 나오면 이름을 잘못 적은 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q2Discount() {
  return (
    <div className="output">문제 2: cakePrice 와 applyDiscount 를 가져오세요</div>
  );
}

// ───── 문제 3 ───── (개념03)
// 같은 파일(_부품/연습_가격.js)의 americanoPrice 를 가져오려고 합니다.
// 그런데 이 파일에는 이미 americanoPrice 라는 이름이 아래에 있습니다(바로 다음 줄).
// 이름이 부딪히지 않게 coffeePrice 라는 이름으로 가져오세요.
//
// 기대 결과 (화면): 가져온 값 4000 / 이 파일의 값 9999
//                  Identifier 'americanoPrice' has already been declared 가 나오면
//                  as 를 안 쓰고 그냥 가져온 것입니다.
// TODO: [import 연습 구역] 에 as 를 쓴 import 줄을 넣고, 아래 함수 안을 고치세요

// 이 줄은 일부러 이름을 겹치게 만들어 둔 것입니다. 지우지 마세요.
const americanoPrice = 9999;

function Q3Rename() {
  return (
    <div className="output">
      문제 3: americanoPrice 를 coffeePrice 라는 이름으로 가져오세요 (이 파일의 값:{" "}
      {americanoPrice})
    </div>
  );
}

// ───── 문제 4 ───── (개념03)
// _부품/연습_뱃지.jsx 에는 export default(Badge)와 이름 있는 export(hotLabel)가
// 함께 들어 있습니다. 한 줄로 둘 다 가져와서 아래 화면을 만드세요.
//
// 기대 결과 (화면): 아메리카노 옆에 파란 바탕의 "인기" 딱지가 붙습니다.
//                  딱지에 글자가 없으면 hotLabel 을 안 넘긴 것입니다.
//                  중괄호 안에 Badge 까지 넣으면 does not provide an export named
//                  'Badge' 가 납니다. 대표는 중괄호 밖입니다.
// TODO: 아래 함수 안을 고치세요

function Q4Badge() {
  return (
    <div className="output">문제 4: Badge 와 hotLabel 을 한 줄로 가져오세요</div>
  );
}

// ───── 문제 5 ───── (개념04)
// 아래 코드는 같은 모양이 세 번 반복됩니다. 03단원에서 배운 그 문제입니다.
// _부품/연습_카드.jsx 의 CoffeeCard 를 가져와서 세 줄로 줄이세요.
//
//   <CoffeeCard name="..." price={...} note="..." />
//
// 기대 결과 (화면): 지금과 똑같은 카드 세 개가 나옵니다. 화면은 하나도 안 바뀝니다.
//                  note 를 안 넘긴 카드가 있으면 그 카드만 "설명 없음" 이 됩니다.
// TODO: 아래 함수 안을 고치세요

function Q5UseCard() {
  return (
    <div>
      <div className="output">
        <strong>아메리카노</strong> — 4000원
        <br />
        <small>가장 많이 팔립니다</small>
      </div>
      <div className="output">
        <strong>라떼</strong> — 4500원
        <br />
        <small>우유가 들어갑니다</small>
      </div>
      <div className="output">
        <strong>케이크</strong> — 6000원
        <br />
        <small>달아요</small>
      </div>
    </div>
  );
}

// ───── 문제 6 ───── (개념04)
// _부품/연습_카드목록.jsx 를 열어 보세요.
// CoffeeList 가 안에서 CoffeeCard 를 세 번 쓰고 있습니다. 부품이 부품을 부르는 모양입니다.
// CoffeeList 를 가져와서 이 화면에 한 줄로 그리세요.
//
// 기대 결과 (화면): 아메리카노 · 라떼 · 케이크 카드 세 개가 나옵니다.
//                  (케이크는 note 를 안 넘겨서 "설명 없음" 입니다)
//                  이 파일에서 CoffeeCard 를 import 할 필요는 없습니다.
//                  CoffeeCard 를 가져와야 한다고 생각했다면, 부품 안이 밖에서 보이는지
//                  다시 생각해 보세요.
// TODO: 아래 함수 안을 고치세요

function Q6UseList() {
  return (
    <div className="output">문제 6: CoffeeList 를 가져와 한 줄로 그리세요</div>
  );
}

// ───── 문제 7 ───── (개념04)
// 이 파일에는 import React from "react"; 가 없습니다. 그런데 JSX 가 잘 돕니다.
// 아래 함수 안에서 두 가지를 확인하세요.
//
//   (1) 이미 적어 둔 console.log(typeof React) 의 결과를 콘솔에서 본다
//   (2) const element = <strong>라떼</strong>; 를 만들고
//       console.log(element.type) 을 찍는다
//
// 기대 결과 (콘솔): undefined
//                  strong
//                  React is not defined 에러가 나면 typeof 를 빼고 쓴 것입니다.
// 기대 결과 (화면): 지금과 같습니다. 이 문제는 콘솔로 확인합니다.
// TODO: 아래 함수 안에 (2) 를 추가하세요

function Q7NoReact() {
  console.log(typeof React);
  // 콘솔: undefined

  // TODO 7: 여기에 (2) 를 쓰세요

  return (
    <div className="output">문제 7: 콘솔을 보세요 (F12 → Console)</div>
  );
}

// ───── 문제 8 ───── (개념05)
// 이 파일 맨 위에서 ./연습문제.css 를 이미 불러 두었습니다.
// 그 안에는 .q08Card 와 .q08Price 가 들어 있습니다.
// 아래 상자에 className 을 붙여 카드 모양으로 만드세요.
//
//   바깥 div  → q08Card
//   가격 span → q08Price
//
// 기대 결과 (화면): 왼쪽에 파란 굵은 세로줄이 있는 흰 카드가 되고,
//                  가격이 파란 굵은 글씨가 됩니다.
//                  아무것도 안 바뀌면 이름을 잘못 적었거나 class 라고 쓴 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q8ClassName() {
  return (
    <div>
      <strong>아메리카노</strong> — <span>4000원</span>
    </div>
  );
}

// ───── 문제 9 ───── (개념05)
// [할인 켜기] 를 누르면 카드가 할인 모양으로 바뀌게 하세요.
//   할인이 꺼져 있으면  className 은 "q08Card"
//   할인이 켜져 있으면  className 은 "q08Card q08Sale"
// 삼항 연산자로 글자를 만들면 됩니다.
//
// 기대 결과 (화면): [할인 켜기] 를 누르면 세로줄이 빨갛게 바뀌고 배경이 연분홍이 됩니다.
//                  한 번 더 누르면 원래대로 돌아옵니다.
//                  눌러도 아무 일이 없으면 className 을 안 바꾼 것입니다.
//                  카드 모양이 통째로 사라지면 q08Card 를 빼먹고 q08Sale 만 넣은 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q9Conditional() {
  const [isSale, setIsSale] = useState(false);

  return (
    <div>
      <div className="q08Card">
        <strong>케이크</strong> — <span className="q08Price">6000원</span>
      </div>
      <button onClick={() => setIsSale(!isSale)}>
        {isSale ? "할인 끄기" : "할인 켜기"}
      </button>
    </div>
  );
}

// ───── 문제 10 ───── (개념05)
// 같은 폴더에 연습문제.module.css 가 있습니다. .box 와 .label 이 들어 있습니다.
// CSS Modules 로 가져와서 아래 상자에 붙이세요.
//
//   할 일: [import 연습 구역] 에 styles 를 받는 import 줄을 쓰고,
//          바깥 div 에 styles.box, 이름 자리에 styles.label 을 붙인다
//
// 기대 결과 (화면): 왼쪽에 초록 세로줄이 있는 카드가 되고, "삼각김밥" 이 초록 굵은 글씨가 됩니다.
//                  className="box" 라고 글자로 적으면 아무 일도 안 일어납니다.
//                  Vite 가 이름을 바꿔 놨기 때문입니다.
// TODO: 아래 함수 안을 고치세요

function Q10Modules() {
  return (
    <div>
      <span>삼각김밥</span> — 1200원
    </div>
  );
}

// ───── 문제 11 ───── [응용] (개념03 + 개념05)
// 위 menuItems 배열을 목록으로 그리세요. 세 가지를 지켜야 합니다.
//
//   (1) 05단원에서 배운 map 으로 그립니다. key 는 item.id 를 씁니다.
//   (2) 가격은 _부품/연습_가격.js 의 formatPrice 를 가져와서 씁니다. (문제 2에서 쓴 그 파일)
//   (3) soldOut 이 true 인 줄에는 이름에 q08SoldOut 을 함께 붙입니다.
//
// 기대 결과 (화면): 네 줄이 나오고 각 줄은 "아메리카노 — 4000원" 모양입니다.
//                  케이크 줄만 이름에 회색 취소선이 그어집니다.
//                  전부 취소선이 그어지면 조건을 안 걸고 그냥 붙인 것입니다.
//                  콘솔에 key 경고가 나오면 key={item.id} 를 안 넣은 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q11List() {
  return (
    <div className="output">문제 11: menuItems 를 map 으로 그리세요</div>
  );
}

// ───── 문제 12 ───── [도전] (개념03 + 개념04)
// 부품 파일을 직접 하나 만듭니다.
//
//   (1) src/08_Vite로_옮기기/_부품/연습_주문표.jsx 를 새로 만든다
//   (2) 그 안에서 CoffeeCard 와 formatPrice 를 import 한다
//       ★ 경로에 주의하세요. 그 파일도 _부품 폴더 안에 있습니다.
//   (3) OrderTable 이라는 컴포넌트를 export default 로 내보낸다
//       - items 를 props 로 받는다
//       - map 으로 CoffeeCard 를 그린다 (key 는 item.id)
//       - 맨 아래에 <p className="output"><strong>합계 ...</strong></p> 로 합계를 보여 준다
//         합계는 items 의 price 를 전부 더한 값이고, formatPrice 로 감쌉니다
//   (4) 이 파일에서 OrderTable 을 가져와 <OrderTable items={menuItems} /> 로 그린다
//
// 기대 결과 (화면): 카드 네 개가 나오고 맨 아래에 "합계 15700원" 이 굵게 나옵니다.
//                  menuItems 에는 note 가 없으므로 카드마다 "설명 없음" 이 나옵니다. 정상입니다.
//                  합계가 NaN 이면 숫자가 아닌 것을 더한 것입니다.
//                  합계가 0 이면 더하기를 안 하고 처음 값만 쓴 것입니다.
//                  왼쪽 메뉴에 "연습 주문표" 라는 항목이 새로 생겼다면
//                  파일을 _부품 폴더 밖에 만든 것입니다.
// TODO: 새 파일을 만들고, 아래 함수 안을 고치세요

function Q12OrderTable() {
  return (
    <div className="output">
      문제 12: _부품/연습_주문표.jsx 를 만들고 OrderTable 을 가져오세요
    </div>
  );
}

// ───── 문제 13 ───── (에러 확인)
// 아래 네 가지를 하나씩 실제로 만들어 보고, 무슨 일이 나는지 확인하세요.
// 하나 확인할 때마다 반드시 원래대로 되돌리고 다음으로 넘어가세요.
//
//   (가) 문제 1을 푼 뒤, import 경로에서 ./ 를 지운다
//        "./_부품/연습_Welcome.jsx"  →  "_부품/연습_Welcome.jsx"
//
//   (나) 문제 1의 import 를 중괄호로 바꾼다
//        import Welcome from ...  →  import { Welcome } from ...
//
//   (다) 문제 2의 import 에서 중괄호를 지운다
//        import { cakePrice, applyDiscount } from ...  →  import cakePrice from ...
//        (지운 뒤 화면에서 케이크 가격 자리가 어떻게 되는지 보세요)
//
//   (라) 문제 8의 className 을 class 로 바꾼다
//        className="q08Card"  →  class="q08Card"
//
// 기대 결과: 넷의 결과가 서로 다릅니다. 아래 빈칸을 채워 보세요.
//   (가) → 화면이 (              ) 되고, 터미널과 화면에 (              ) 가 나온다
//   (나) → 화면이 (              ) 되고, 콘솔에 (              ) 가 나온다
//   (다) → 에러가 (   난다 / 안 난다   ). 화면의 값이 (              ) 이 된다
//   (라) → 에러가 (   난다 / 안 난다   ). 콘솔에 (              ) 가 나온다
//
// 네 가지 중 '에러가 안 나는데 틀린' 것이 어느 것인지도 적어 보세요.
// 정답은 연습문제_정답.jsx 맨 아래에 있습니다.

export default function Practice08Vite() {
  return (
    <div>
      <h1>08단원 연습문제 — Vite 로 옮기기</h1>

      <p className="guide">
        이 파일을 <strong>직접 고치면서</strong> 푸는 문제입니다. 저장하면 아래 화면이
        바로 바뀝니다. <strong>F5 는 안 눌러도 됩니다.</strong>
        <br />
        <br />
        문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다. 문제마다{" "}
        <strong>기대 결과</strong>가 적혀 있으니 그대로 나오는지 확인하세요.
        <br />
        <br />
        <strong>import 줄은 파일 맨 위의 [import 연습 구역] 에 쓰세요.</strong> 부품
        파일은 <code>_부품</code> 폴더에 이미 다 만들어 두었습니다. 열어서 읽어 보고
        시작하세요.
        <br />
        <br />
        <strong>F12 → Console 을 열어 두세요.</strong> 문제 7과 문제 13은 콘솔로
        확인합니다.
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
        <p>이 문제는 화면이 아니라 코드와 콘솔로 확인합니다. 위 주석을 보세요.</p>
      </div>

      <Summary
        items={[
          "문제 1~4: import 네 가지 모양 — export default / 이름 있는 export / as 로 이름 바꾸기 / 한 줄에 둘 다",
          "문제 5~6: 반복을 부품으로 줄이기, 그리고 부품이 부품을 부르는 구조",
          "문제 7: import React 없이 JSX 가 도는 것을 콘솔로 확인하기",
          "문제 8~10: className 붙이기, 조건에 따라 바꾸기, CSS Modules",
          "문제 11: map + key + 가져온 함수 + 조건부 className 을 한꺼번에",
          "문제 12: 부품 파일을 직접 만들고 그 안에서 또 다른 부품을 가져다 쓰기",
          "문제 13: import 를 잘못 썼을 때 나는 네 가지 결과를 직접 확인하기",
        ]}
      />
    </div>
  );
}
