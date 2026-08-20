// ============================================================
// 08단원 · 개념 03 — import 와 export
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01·02는 읽는 문서였습니다. 여기서부터 코드입니다.
//
// 이 파일에서 배우는 것은 딱 두 단어입니다. export 와 import.
// 그런데 이 두 단어가 08단원 전체의 이유입니다.
// 개념01에서 "파일을 못 나눈다" 를 첫 번째 한계로 꼽았는데,
// 그것을 푸는 문법이 이 둘입니다.
//
// ★ 여러분은 import 를 여기서 처음 봅니다.
//   01~07단원에서는 훅을 이렇게 꺼냈습니다.
//
//       const { useState } = React;
//
//   이제부터는 이렇게 씁니다.
//
//       import { useState } from "react";
//
//   모양이 비슷합니다. 우연이 아닙니다. 섹션 5에서 둘을 나란히 놓고 봅니다.
//
// ★ 이 파일 맨 위(바로 아래)에 import 줄이 여러 개 있습니다.
//   그게 오늘의 주제입니다. 읽으면서 하나씩 돌아와 보세요.
//
// ★ 콘솔에 같은 줄이 두 번씩 찍힙니다. 정상입니다.
//   main.jsx 의 StrictMode 때문입니다(개념02 3부). 여러분이 잘못한 게 아닙니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

import Greeting from "./_부품/Greeting.jsx";
import Hello from "./_부품/Greeting.jsx";
import { americanoPrice, lattePrice, formatPrice, shopLabel } from "./_부품/menuPrices.js";
import { cakePrice as dessertPrice } from "./_부품/menuPrices.js";
import PriceTag, { defaultNote } from "./_부품/PriceTag.jsx";

// ── 섹션 1: 파일 안에서 만든 것은 그 파일 안에서만 삽니다 ──

// 01~07단원에서 이런 코드를 썼습니다.
//
//     function MenuRow({ name, price }) { ... }
//
// 이렇게 만든 MenuRow 는 그 .html 파일 안에서만 살았습니다.
// 다른 파일에서 부를 방법이 없어서, 03단원에서 만든 것을 05단원에서 또 쓰려면
// 복사해서 붙여 넣어야 했습니다. 그리고 붙여 넣는 순간 두 벌이 됩니다.
//
// 이제는 다릅니다. 파일마다 이런 문이 하나씩 달려 있다고 생각하세요.
//
//     export  — 이 파일에서 밖으로 내보낼 것을 정한다
//     import  — 다른 파일이 내보낸 것을 가져온다
//
// 비유하면 export 는 '가게 진열대', import 는 '장 보기' 입니다.
// 진열대에 안 올린 물건은 손님이 살 수 없습니다.
//
// 비유는 여기까지입니다. 실제로 일어나는 일은 이렇습니다.
//   Vite 가 import 줄을 보고 "아, 저 파일도 필요하구나" 하고 그 파일을 읽어 옵니다.
//   그리고 그 파일이 export 한 것만 이쪽으로 건네줍니다.
//   export 를 안 붙인 것은 애초에 건네줄 목록에 없습니다.
//
// 이 파일 맨 위에 이런 줄이 있습니다.
//
//     import Greeting from "./_부품/Greeting.jsx";
//
// 그래서 아래에서 Greeting 을 마치 이 파일에서 만든 것처럼 쓸 수 있습니다.
// _부품/Greeting.jsx 를 열어 보세요. 03단원에서 만들던 컴포넌트와 똑같이 생겼습니다.
// 앞에 export default 가 붙은 것만 다릅니다.

function Section1Demo() {
  // 가져온 Greeting 이 무엇인지 콘솔로 확인해 봅니다.
  console.log(typeof Greeting);
  // 콘솔: function

  // 평범한 함수입니다. 특별한 물건이 아닙니다.

  return (
    <div className="demo">
      <h3>① 다른 파일에서 가져온 컴포넌트</h3>
      <Greeting name="김민준" />
      {/* 화면: 김민준님, 안녕하세요. */}
      <Greeting name="이서연" />
      {/* 화면: 이서연님, 안녕하세요. */}
    </div>
  );
}

// ✏️ 직접 해보기 1 — 위 Section1Demo 에 <Greeting name="박지훈" /> 을 한 줄 더 넣으세요.
//                    저장하면 F5 없이 화면이 바뀝니다.

// ── 섹션 2: export default — 대표 하나 내보내기 ──

// _부품/Greeting.jsx 는 이렇게 생겼습니다.
//
//     export default function Greeting({ name }) { ... }
//
// export default 는 "이 파일의 대표는 이것이다" 라는 뜻입니다.
// 한 파일에 딱 하나만 둘 수 있습니다. 대표가 둘일 수는 없으니까요.
//
// 가져올 때는 중괄호 없이 이름만 씁니다.
//
//     import Greeting from "./_부품/Greeting.jsx";
//
// 여기서 중요한 것이 하나 있습니다.
//
//   ★ export default 로 나온 것은 가져오는 쪽이 이름을 마음대로 지어도 됩니다.
//
// "대표를 하나 주세요" 라고만 말했으니, 그걸 뭐라고 부를지는 받는 쪽 마음입니다.
// 실제로 이 파일 맨 위에는 같은 파일을 두 번 가져온 줄이 있습니다.
//
//     import Greeting from "./_부품/Greeting.jsx";
//     import Hello    from "./_부품/Greeting.jsx";
//
// 이름만 다르지 알맹이는 같은 물건입니다. 아래에서 확인합니다.

function Section2Demo() {
  const same = Greeting === Hello;

  console.log(same);
  // 콘솔: true

  // 같다고 나왔습니다. 두 번 가져왔지만 파일은 한 번만 읽힙니다.
  // 이름표만 두 개 붙인 것입니다.

  return (
    <div className="demo">
      <h3>② 같은 파일, 이름만 다르게 가져오기</h3>
      <Hello name="박지훈" />
      {/* 화면: 박지훈님, 안녕하세요. */}
      <p className="output">Greeting 과 Hello 가 같은 물건인가: {String(same)}</p>
      {/* 화면: Greeting 과 Hello 가 같은 물건인가: true */}
    </div>
  );
}

// String(...) 은 값을 글자로 바꾸는 함수입니다.
// true / false 를 그냥 {} 안에 넣으면 화면에 아무것도 안 나오기 때문입니다(05단원 개념05).
//
// 그럼 이름을 아무렇게나 지어도 되나요? 됩니다. 다만 두 가지를 지키세요.
//
//   [1] 컴포넌트라면 반드시 대문자로 시작하세요.
//       소문자로 지으면 React 가 HTML 태그로 오해합니다(01단원 개념04).
//   [2] 되도록 파일 이름과 같게 지으세요.
//       Greeting.jsx 에서 가져온 것을 Zzz 라고 부르면 나중에 찾을 수가 없습니다.
//
// 이 자료는 앞으로 [2] 를 지킵니다. Hello 는 이 섹션을 보여 주려고 한 번 쓴 것입니다.

// ✏️ 직접 해보기 2 — 파일 맨 위의 import Hello ... 줄에서 Hello 를 Annyeong 으로 바꾸고,
//                    Section2Demo 안의 <Hello ... /> 도 <Annyeong ... /> 로 바꾸세요.
//                    화면이 그대로인지 확인하세요.

// ── 섹션 3: 이름 있는 export — 여러 개 내보내기 ──

// 대표가 하나뿐이면 값 여러 개를 어떻게 내보낼까요?
// 그때는 export 를 만드는 자리마다 하나씩 붙입니다. 이것을 '이름 있는 export' 라고 합니다.
//
// _부품/menuPrices.js 는 이렇게 생겼습니다.
//
//     export const americanoPrice = 4000;
//     export const lattePrice = 4500;
//     export const cakePrice = 6000;
//     export function formatPrice(price) { ... }
//
// 가져올 때는 중괄호 안에 이름을 적습니다. 필요한 것만 골라 담으면 됩니다.
//
//     import { americanoPrice, lattePrice, formatPrice } from "./_부품/menuPrices.js";
//
// ★ export default 와 결정적으로 다른 점이 있습니다.
//
//   이름 있는 export 는 이름을 정확히 맞춰야 합니다.
//
// import { americanoPrice } 라고 적었는데 그 파일에 그런 이름이 없으면 못 가져옵니다.
// "대표 하나 주세요" 가 아니라 "americanoPrice 라는 걸 주세요" 라고 말한 것이기 때문입니다.
//
// 그래도 이름을 바꾸고 싶을 때가 있습니다. 그때는 as 를 씁니다.
//
//     import { cakePrice as dessertPrice } from "./_부품/menuPrices.js";
//
// "cakePrice 를 주는데, 여기서는 dessertPrice 라고 부르겠다" 는 뜻입니다.
// as 는 이름이 겹칠 때 씁니다. 두 파일에서 똑같이 formatPrice 를 가져와야 한다면
// 한쪽을 as 로 바꿔야 합니다. 겹치지 않는데 굳이 바꾸지는 마세요. 찾기만 어려워집니다.

function Section3Demo() {
  console.log(americanoPrice);
  // 콘솔: 4000

  console.log(lattePrice);
  // 콘솔: 4500

  console.log(formatPrice(americanoPrice));
  // 콘솔: 4000원

  console.log(dessertPrice);
  // 콘솔: 6000

  // ★ export 를 안 붙인 것은 밖으로 안 나옵니다.
  //
  // menuPrices.js 에는 이런 줄도 있습니다.
  //
  //     const shopName = "동네 카페";       // ← export 가 없습니다
  //     export function shopLabel() { return `${shopName} 메뉴판`; }
  //
  // shopName 은 export 가 없으니 이 파일에서는 볼 수 없습니다.

  console.log(typeof shopName);
  // 콘솔: undefined

  // 여기서 shopName 은 "없는 이름" 입니다.
  // (typeof 는 없는 이름에 써도 에러가 안 나는 몇 안 되는 문법입니다.
  //  그냥 console.log(shopName) 이라고 쓰면 ReferenceError 가 납니다)
  //
  // 그런데 shopLabel 은 잘 돌아갑니다.

  console.log(shopLabel());
  // 콘솔: 동네 카페 메뉴판

  // shopLabel 은 menuPrices.js 안에 있으니 shopName 이 잘 보입니다.
  // 이것이 파일을 나누는 또 하나의 이득입니다.
  // 밖에 안 보여도 되는 것은 안 보이게 둘 수 있습니다.
  // 그러면 다른 파일에서 실수로 건드릴 일이 없습니다.

  return (
    <div className="demo">
      <h3>③ 값과 함수를 가져다 쓰기</h3>
      <p className="output">{shopLabel()}</p>
      {/* 화면: 동네 카페 메뉴판 */}
      <ul>
        <li>아메리카노 {formatPrice(americanoPrice)}</li>
        {/* 화면: 아메리카노 4000원 */}
        <li>라떼 {formatPrice(lattePrice)}</li>
        {/* 화면: 라떼 4500원 */}
        <li>케이크 {formatPrice(dessertPrice)}</li>
        {/* 화면: 케이크 6000원 */}
      </ul>
    </div>
  );
}

// ✏️ 직접 해보기 3 — _부품/menuPrices.js 를 열어
//                    export const riceBallPrice = 1200; 을 추가하고,
//                    이 파일의 import 줄에도 riceBallPrice 를 넣으세요.
//                    (아직 화면에 넣지는 마세요. 다음 문제에서 합니다)

// ✏️ 직접 해보기 4 — 위 Section3Demo 의 목록에
//                    <li>삼각김밥 {formatPrice(riceBallPrice)}</li> 를 한 줄 넣으세요.

// ── 섹션 4: 경로 읽는 법 ──

// import 줄의 따옴표 안에 들어가는 것이 '경로' 입니다. 세 가지 모양이 있습니다.
//
//   [1] ./ 로 시작   — 나와 같은 폴더에서 찾아라
//   [2] ../ 로 시작  — 한 단계 위 폴더로 나가서 찾아라
//   [3] 아무것도 없음 — node_modules 에서 찾아라 (남이 만든 도구)
//
// 이 파일 맨 위 줄들을 다시 보면 셋이 다 들어 있습니다.
//
//     import { useState } from "react";                  ← [3]
//     import Summary from "../_ui/Summary.jsx";           ← [2]
//     import Greeting from "./_부품/Greeting.jsx";        ← [1]
//
// 폴더 모양으로 보면 이렇습니다.
//
//     src/
//       _ui/
//         Summary.jsx          ← ../_ui/Summary.jsx
//       08_Vite로_옮기기/
//         개념03_import와_export.jsx   ← 지금 이 파일
//         _부품/
//           Greeting.jsx       ← ./_부품/Greeting.jsx
//
// ./ 는 '개념03 파일이 들어 있는 폴더', 즉 08_Vite로_옮기기 폴더입니다.
// 그 안의 _부품 폴더로 들어가니 ./_부품/Greeting.jsx 가 됩니다.
//
// ../ 는 거기서 한 단계 나갑니다. src 폴더입니다.
// 그 안의 _ui 폴더로 들어가니 ../_ui/Summary.jsx 가 됩니다.
//
// ★ 경로는 늘 '그 줄이 적힌 파일' 을 기준으로 읽습니다.
//   _부품/MenuBoard.jsx 를 열어 보면 "./MenuRow.jsx" 라고 적혀 있습니다.
//   같은 _부품 폴더 안에 있으니 ./ 만으로 충분한 것입니다.
//   같은 파일을 가리키는데도 경로가 다릅니다. 어디서 부르는가에 따라 달라집니다.
//
// [헷갈리면] ./ 를 빠뜨리는 실수가 가장 많습니다.
//
//     import Greeting from "_부품/Greeting.jsx";   ← ./ 가 없습니다
//
// 이렇게 쓰면 [3] 으로 읽혀서 node_modules 에서 _부품 이라는 도구를 찾습니다.
// 그런 게 없으니 실패합니다. 실수 섹션에서 실제 메시지를 봅니다.
//
// ★ 확장자를 쓰나요?
//   Vite 는 .jsx 를 생략해도 찾아 줍니다. 하지만 이 자료는 항상 붙입니다.
//   이유는 두 가지입니다.
//     - 붙여 두면 그 줄만 보고도 어떤 파일인지 압니다.
//     - 도구를 바꿨을 때 생략이 안 되는 경우가 있습니다.
//   ★ 다만 [3] 번, 즉 node_modules 의 도구에는 확장자를 붙이지 않습니다.
//     "react" 이지 "react.js" 가 아닙니다. 그건 파일 이름이 아니라 도구 이름입니다.

function Section4Demo() {
  const [open, setOpen] = useState(false);

  console.log("경로 세 가지를 화면에 그렸습니다");
  // 콘솔: 경로 세 가지를 화면에 그렸습니다

  return (
    <div className="demo">
      <h3>④ 경로 세 가지 다시 보기</h3>
      <button onClick={() => setOpen(!open)}>{open ? "접기" : "펼치기"}</button>
      {/* 화면: [펼치기] 버튼만 보입니다 */}
      {open && (
        <div className="output">
          <div>
            <code>&quot;react&quot;</code> — node_modules 에서 찾습니다 (남이 만든 도구)
          </div>
          <div>
            <code>&quot;../_ui/Summary.jsx&quot;</code> — 한 단계 위로 나가서 찾습니다
          </div>
          <div>
            <code>&quot;./_부품/Greeting.jsx&quot;</code> — 나와 같은 폴더에서 찾습니다
          </div>
        </div>
      )}
      {/* 화면(누르면): 경로 세 줄이 나타나고 버튼 글자가 [접기] 로 바뀝니다 */}
    </div>
  );
}

// ✏️ 직접 해보기 5 — 파일 맨 위의 Summary import 줄을
//                    "../_ui/Summary.jsx" 에서 "./_ui/Summary.jsx" 로 바꿔 보세요.
//                    화면이 어떻게 되는지 확인하고 다시 되돌리세요.

// ── 섹션 5: 한 파일에서 둘 다 쓰기 ──

// export default 와 이름 있는 export 는 한 파일에 같이 있어도 됩니다.
// _부품/PriceTag.jsx 가 그렇게 생겼습니다.
//
//     export const defaultNote = "가장 많이 팔립니다";       ← 이름 있는 export
//     export default function PriceTag({ ... }) { ... }      ← 대표
//
// 가져올 때는 이렇게 한 줄에 씁니다.
//
//     import PriceTag, { defaultNote } from "./_부품/PriceTag.jsx";
//
// 순서가 정해져 있습니다. 대표가 앞, 중괄호가 뒤입니다.
// 중괄호가 없는 쪽이 대표라고 기억하면 됩니다.
//
// ★ 이제 맨 앞에서 예고한 것을 봅니다.
//
//   [01~07단원]  const { useState } = React;
//   [08단원부터] import { useState } from "react";
//
// 모양이 비슷한 데는 이유가 있습니다. 중괄호가 하는 일이 비슷합니다.
// 둘 다 "여러 개 중에서 이 이름을 골라 꺼낸다" 는 뜻입니다.
//
// 다만 완전히 다른 문법입니다. 헷갈리지 않게 차이를 적어 둡니다.
//
//   const { useState } = React;
//     이미 있는 React 라는 '객체' 에서 속성을 꺼내는 것입니다.
//     JS자료 09단원의 객체 구조분해입니다. React 가 없으면 에러가 납니다.
//     그리고 <script src="react.development.js"> 가 React 를 만들어 줘야 했습니다.
//
//   import { useState } from "react";
//     "react" 라는 도구에서 useState 라는 export 를 가져오는 것입니다.
//     Vite 가 node_modules 에서 react 를 찾아 읽어 옵니다.
//     이 줄은 반드시 파일 맨 위에 있어야 합니다. 함수 안에는 못 씁니다.
//
// 배운 useState 는 똑같습니다. 꺼내 오는 방법만 바뀐 것입니다.
// 아래에서 확인해 봅시다. 04단원에서 만든 것과 한 글자도 안 다릅니다.

function Section5Demo() {
  const [count, setCount] = useState(0);

  console.log(defaultNote);
  // 콘솔: 가장 많이 팔립니다

  function handleAdd() {
    setCount(count + 1);

    console.log("담은 잔 수:", count + 1);
    // 콘솔: 담은 잔 수: 1
  }

  return (
    <div className="demo">
      <h3>⑤ default 와 이름 있는 export 를 함께 / import 한 useState</h3>

      <PriceTag name="아메리카노" price={americanoPrice} />
      {/* 화면: 아메리카노 — 4000원 / 가장 많이 팔립니다 */}

      <PriceTag name="케이크" price={dessertPrice} note="달아요" />
      {/* 화면: 케이크 — 6000원 / 달아요 */}

      <p className="output">기본 문구는 &quot;{defaultNote}&quot; 입니다.</p>
      {/* 화면: 기본 문구는 "가장 많이 팔립니다" 입니다. */}

      <p className="output">지금 {count}잔 담았습니다.</p>
      {/* 화면: 지금 0잔 담았습니다. */}

      <button onClick={handleAdd}>아메리카노 담기</button>
      {/* 화면(누르면): 지금 1잔 담았습니다. */}
    </div>
  );
}

// ✏️ 직접 해보기 6 — Section5Demo 에 <PriceTag name="라떼" price={lattePrice} /> 를
//                    한 줄 넣으세요. note 를 안 넘기면 무엇이 나올까요?

// ✏️ 직접 해보기 7 — _부품/PriceTag.jsx 의 defaultNote 를 "오늘의 추천" 으로 바꾸세요.
//                    화면에서 몇 군데가 바뀌는지 세어 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.
//
// ★ 08단원부터는 에러가 두 곳에 나타납니다. 둘 다 보세요.
//     - 브라우저 화면 (빨간 글씨가 화면을 덮기도 합니다)
//     - npm run dev 를 켜 둔 터미널
//   터미널 쪽이 더 자세할 때가 많습니다.

// [실수 1] ./ 를 빠뜨림
// import Greeting from "_부품/Greeting.jsx";
//   실수: 경로가 아니라 도구 이름으로 읽힙니다. node_modules 에서 찾다가 실패합니다.
//         터미널과 화면에 이런 줄이 뜹니다.
//           Failed to resolve import "_부품/Greeting.jsx" from ...
//         resolve 는 "어디 있는지 알아내다" 라는 뜻입니다.
//         이 메시지가 보이면 90%는 ./ 나 ../ 를 빠뜨린 것입니다.

// [실수 2] 이름 있는 export 인데 중괄호를 안 씀 ★ 이건 에러가 안 납니다
// import americanoPrice from "./_부품/menuPrices.js";
//   실수: 에러가 안 납니다. 화면도 안 멈춥니다. 그런데 값이 undefined 입니다.
//         "그 파일의 대표를 주세요" 라고 말했는데, menuPrices.js 에는 대표가 없기 때문입니다.
//         화면에는 4000 이 나와야 할 자리가 비어 버립니다.
//         ★ 이 실수는 조용히 틀리는 쪽이라 제일 위험합니다.
//         값이 undefined 로 나오면 중괄호부터 확인하세요.

// [실수 3] export default 인데 중괄호를 씀
// import { Greeting } from "./_부품/Greeting.jsx";
//   실수: 이건 에러가 납니다. 화면이 빨간 상자로 바뀝니다.
//           The requested module ... does not provide an export named 'Greeting'
//         "Greeting 이라는 이름으로 내보낸 게 없다" 는 뜻입니다.
//         맞습니다. Greeting.jsx 는 default 로 내보냈지 이름을 붙여 내보내지 않았습니다.

// [실수 4] export 를 아예 안 붙임
//   부품 파일에서 function 앞의 export default 를 지우면 이렇게 됩니다.
//     The requested module ... does not provide an export named 'default'
//   새 부품 파일을 만들었는데 이 메시지가 나오면 export 를 빠뜨린 것입니다.

// [실수 5] import 를 함수 안에 씀
// function Bad() {
//   import Greeting from "./_부품/Greeting.jsx";
//   return <Greeting name="김민준" />;
// }
//   실수: [SyntaxError] 입니다. 화면이 통째로 빕니다.
//         import 는 파일 맨 위에만 쓸 수 있습니다.
//         Vite 가 파일을 읽기도 전에 import 줄부터 먼저 훑어서
//         "어떤 파일들이 더 필요한지" 를 알아내기 때문입니다.
//         그래서 조건문 안이나 함수 안에는 못 넣습니다.

// [실수 6] 컴포넌트 이름을 소문자로 지음 ★ 이것도 에러가 안 납니다
// import greeting from "./_부품/Greeting.jsx";
// ... <greeting name="김민준" />
//   실수: 에러가 안 나고 화면만 이상해집니다.
//         React 가 소문자를 HTML 태그로 봐서 <greeting> 이라는 없는 태그를 만듭니다.
//         01단원 개념04에서 본 것과 같은 실수입니다.
//         export default 는 이름을 마음대로 지어도 되지만, 대문자 규칙은 남아 있습니다.

// ── 화면 ──

// 아래 restartKey 는 데모들을 '처음부터 다시' 그리기 위한 것입니다.
// 05단원에서 배운 key 를 그대로 씁니다. key 가 달라지면 React 는 그것을
// 고쳐 쓸 물건이 아니라 '다른 물건' 으로 보고 통째로 새로 만듭니다.

export default function Concept03ImportExport() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 03 — import 와 export</h1>

      <p className="guide">
        이 파일은 <strong>왼쪽 목록에서 골라</strong> 봅니다. 더블클릭이 아닙니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 도 함께 열어 두세요. 이 파일은 콘솔에 나오는 값이
        많습니다. 같은 줄이 <strong>두 번씩</strong> 찍히는 것은 정상입니다(개념02 3부의
        StrictMode).
        <br />
        <br />
        이 파일이 쓰는 부품은 <code>src/08_Vite로_옮기기/_부품/</code> 안에 있습니다. 그
        폴더의 파일들도 같이 열어 놓고 보세요.{" "}
        <strong>하위 폴더라서 왼쪽 목록에는 안 나타납니다.</strong>
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
          "export 는 이 파일에서 밖으로 내보낼 것을 정하고, import 는 다른 파일이 내보낸 것을 가져옵니다. export 를 안 붙인 것은 밖에서 볼 수 없습니다.",
          "export default 는 파일의 대표 하나입니다. 가져올 때 중괄호를 안 쓰고, 이름을 마음대로 지어도 됩니다(컴포넌트면 대문자로).",
          "이름 있는 export 는 개수 제한이 없습니다. 가져올 때 중괄호 안에 이름을 정확히 적어야 하고, 바꾸고 싶으면 as 를 씁니다.",
          "경로는 ./ 면 같은 폴더, ../ 면 한 단계 위, 아무것도 없으면 node_modules 의 도구입니다. ./ 를 빠뜨리면 Failed to resolve import 가 납니다.",
          "경로는 늘 그 줄이 적힌 파일을 기준으로 읽습니다. 같은 파일이라도 어디서 부르느냐에 따라 경로가 달라집니다.",
          "01~07단원의 const { useState } = React; 가 import { useState } from \"react\"; 로 바뀌었을 뿐, useState 자체는 똑같습니다.",
          "import 는 파일 맨 위에만 쓸 수 있습니다. 함수 안이나 조건문 안에는 못 씁니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) <Greeting name="박지훈" />
//    // 화면: ① 상자에 "박지훈님, 안녕하세요." 가 한 줄 늘어납니다.
//    → 저장만 하면 바뀝니다. F5 는 누를 필요가 없습니다.
//
// 2) import Annyeong from "./_부품/Greeting.jsx";
//    ... <Annyeong name="박지훈" />
//    // 화면: ② 상자가 그대로입니다. "박지훈님, 안녕하세요."
//    → export default 는 받는 쪽이 이름을 정합니다. 그래서 무슨 이름이든 됩니다.
//      단 <annyeong ... /> 처럼 소문자로 지으면 화면이 빕니다(실수 6).
//      import 줄만 바꾸고 <Hello ... /> 를 그대로 두면
//      "Hello is not defined" 에러가 나면서 예제가 빨간 상자가 됩니다.
//
// 3) menuPrices.js 에 한 줄 추가:
//      export const riceBallPrice = 1200;
//    이 파일의 import 줄을 이렇게 고칩니다:
//      import { americanoPrice, lattePrice, formatPrice, shopLabel, riceBallPrice } from "./_부품/menuPrices.js";
//    → 화면은 아직 그대로입니다. 가져오기만 하고 안 썼기 때문입니다.
//      가져와 놓고 안 쓰면 아무 일도 안 일어납니다. 에러도 안 납니다.
//
// 4) <li>삼각김밥 {formatPrice(riceBallPrice)}</li>
//    // 화면: ③ 목록에 "삼각김밥 1200원" 이 한 줄 늘어납니다.
//    → 3번을 안 하고 4번만 하면 "riceBallPrice is not defined" 로 빨간 상자가 됩니다.
//
// 5) import Summary from "./_ui/Summary.jsx";
//    // 화면: 예제가 통째로 안 나오고, 터미널과 화면에 이런 줄이 뜹니다.
//    //       Failed to resolve import "./_ui/Summary.jsx" from "src/08_Vite로_옮기기/개념03_import와_export.jsx"
//    → ./ 는 08_Vite로_옮기기 폴더입니다. 그 안에는 _ui 가 없습니다.
//      _ui 는 한 단계 위인 src 안에 있으므로 ../ 로 나가야 합니다.
//      되돌리면 화면이 저절로 돌아옵니다.
//
// 6) <PriceTag name="라떼" price={lattePrice} />
//    // 화면: 라떼 — 4500원 / 가장 많이 팔립니다
//    → note 를 안 넘겼으니 기본값 defaultNote 가 쓰였습니다.
//      기본값이 그냥 글자가 아니라 '가져온 값' 이라는 것이 이 문제의 핵심입니다.
//
// 7) _부품/PriceTag.jsx 에서:
//      export const defaultNote = "오늘의 추천";
//    // 화면: ⑤ 상자에서 두 군데가 바뀝니다.
//    //       아메리카노 카드의 작은 글씨, 그리고 "기본 문구는 ..." 줄.
//    → 케이크 카드는 note="달아요" 를 직접 넘겼으므로 안 바뀝니다.
//      한 파일만 고쳤는데 여러 곳이 함께 바뀌었습니다.
//      개념01에서 말한 "고칠 곳이 한 곳" 이 바로 이것입니다.
//      확인했으면 "가장 많이 팔립니다" 로 되돌려 두세요. 뒤 설명과 어긋납니다.
