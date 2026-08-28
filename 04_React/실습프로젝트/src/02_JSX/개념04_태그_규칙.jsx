// ============================================================
// 02단원 · 개념 04 — 태그 규칙
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// JSX 는 HTML 과 비슷하게 생겼습니다. 그래서 HTML 습관대로 쓰다가 막힙니다.
// 막히는 자리는 딱 네 군데입니다.
//
//   1. 태그를 나란히 두 개 쓸 수 없다
//   2. 안 닫은 태그를 그냥 둘 수 없다
//   3. 태그 이름의 대소문자가 뜻을 바꾼다
//   4. 여는 태그와 닫는 태그의 이름이 정확히 같아야 한다
//
// 네 가지 다 "규칙이니 외우세요" 로 넘어갈 것이 없습니다.
// 개념01에서 본 변환 결과를 보면 전부 이유가 보입니다.


import React from "react";
import Summary from "../_ui/Summary.jsx";
import * as Babel from "@babel/standalone";
import 그려진뒤 from "../_ui/그려진뒤.js";

function toJs(jsxCode) {
  return Babel.transform(jsxCode, {
    presets: [["react", { runtime: "classic" }]],
    generatorOpts: { jsescOption: { minimal: true }, concise: true },
  }).code;
}

function tryJsx(code) {
  try {
    Babel.transform(code, { presets: [["react", { runtime: "classic" }]] });
    return "문제 없음";
  } catch (e) {
    return e.message.split("\n")[0];
  }
}

// ── 섹션 1: 반드시 하나로 감싸야 한다 ──

// 화면에 제목과 가격을 나란히 보여 주고 싶습니다.
// 01단원에서 배운 대로 App 함수가 화면을 돌려주게 만들어 봅시다.
//
//     function App() {
//       return <h1>아메리카노</h1><p>4000원</p>;
//     }
//
// 이렇게 쓰면 안 됩니다. Babel 에게 물어봅시다.

console.log(tryJsx("function App() { return <h1>아메리카노</h1><p>4000원</p>; }"));
// 콘솔: unknown: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (1:38)

// "나란히 있는 JSX 는 감싸는 태그 하나로 묶어야 합니다" 라는 뜻입니다.
// 친절하게도 뒤에 해결 방법까지 알려 줍니다. 그건 섹션 3에서 씁니다.
//
// 왜 이런 제한이 있을까요? JS자료 05단원에서 이미 답을 봤습니다.
//
//     function getTwo() {
//       return 1, 2;
//     }
//     console.log(getTwo());   →  2
//
// 함수는 값을 하나만 돌려줍니다. 두 개를 적어도 하나만 나갑니다.
// 그래서 여러 값을 돌려주려면 배열이나 객체로 '묶어서' 하나로 만들었습니다.
//
// JSX 도 똑같습니다. 개념01에서 본 것처럼 JSX 는 값 하나입니다.

const one = <h1>아메리카노</h1>;
console.log(one.type);
// 콘솔: h1

// 태그 하나 = 값 하나입니다. 그러면 태그 두 개는 값 두 개입니다.
// 값 두 개를 return 자리에 그냥 늘어놓을 수 없습니다.
//
// 실제로 값 두 개를 만들어 보면 이렇게 됩니다.

const two = [<h1>아메리카노</h1>, <p>4000원</p>];
console.log(two.length);
// 콘솔: 2

// 배열에 넣으면 두 개를 담을 수 있습니다. 담긴 것이 두 개라는 게 눈에 보입니다.
// return 뒤에 늘어놓은 것은 이 두 개를 묶지 않고 그냥 둔 것과 같습니다.
//
// 그래서 답은 하나입니다. 하나로 묶어야 합니다.
// 묶는 방법이 두 가지 있습니다. 섹션 2와 섹션 3에서 하나씩 봅니다.

// ✏️ 직접 해보기 1 — tryJsx 에 "const x = <p>가</p><p>나</p>;" 를 넣어
//                    같은 에러가 나는지 확인해 보세요.

// ── 섹션 2: 방법 1 — 태그로 감싸기 ──

// 가장 쉬운 방법은 div 같은 태그로 감싸는 것입니다.

function App() {
  return (
    <div className="output">
      <h1>아메리카노</h1>
      <p>4000원</p>
    </div>
  );
}

console.log(App().type);
// 콘솔: div

console.log(App().props.children.length);
// 콘솔: 2

// 바깥은 div 하나입니다. 그래서 return 이 돌려주는 값은 하나입니다.
// 그 하나 안에 두 개가 들어 있습니다. 배열로 묶었던 것과 같은 방식입니다.

// 화면: 데모 ① 에 "아메리카노" 와 "4000원" 이 흰 상자 안에 보입니다.

// 방금 <App /> 이라고 대문자로 쓴 것이 눈에 띄었을 것입니다.
// 그 규칙은 섹션 5에서 설명합니다. 지금은 넘어가세요.
//
// 이 방법에는 대가가 하나 있습니다. 실제 화면에 div 가 하나 더 생깁니다.
// 눈으로는 안 보이니 코드로 확인합시다.

그려진뒤("#rootDiv", (자리) => {
  console.log(자리.innerHTML);
  // 콘솔: <div class="output"><h1>아메리카노</h1><p>4000원</p></div>
});

// 우리가 원한 것은 h1 과 p 두 개인데 div 가 하나 더 붙었습니다.
// 대부분은 문제가 없습니다. 그런데 문제가 되는 자리가 있습니다.
//
//   - ul 안에는 li 만 들어가야 하는데 div 가 끼면 목록 모양이 깨집니다
//   - 표(table) 안에도 아무 태그나 넣을 수 없습니다
//   - 화면 모양을 잡는 규칙이 div 하나 때문에 어긋나기도 합니다
//
// 이럴 때 쓰라고 만든 것이 섹션 3의 Fragment 입니다.

// ✏️ 직접 해보기 2 — App 의 바깥 div 를 section 으로 바꿔 보세요.
//                    App().type 이 무엇으로 바뀌는지 확인하세요.

// ── 섹션 3: 방법 2 — Fragment <>...</> ──

// 이름은 낯설지만 생김새는 아주 단순합니다.
//
//     <>  ...  </>
//
// 이름 없는 태그입니다. 감싸는 역할만 하고 화면에는 안 남습니다.

function AppFragment() {
  return (
    <>
      <h1>아메리카노</h1>
      <p>4000원</p>
    </>
  );
}

// 화면: 데모 ② 는 데모 ① 과 거의 같아 보입니다. 흰 상자 테두리만 없습니다.

// 화면에 정말 안 남는지 확인합시다.

그려진뒤("#rootFrag", (자리) => {
  console.log(자리.innerHTML);
  // 콘솔: <h1>아메리카노</h1><p>4000원</p>
});

// 데모 ① 에는 있던 바깥 div 가 없습니다. 우리가 쓴 두 개만 남았습니다.
//
// 그러면 Fragment 는 무엇으로 바뀔까요?

console.log(toJs("<><h1>아메리카노</h1><p>4000원</p></>"));
// 콘솔: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "아메리카노"), /*#__PURE__*/React.createElement("p", null, "4000원"));

// 첫 번째 인자가 "div" 같은 글자가 아니라 React.Fragment 입니다.
// React 가 미리 만들어 둔 특별한 표시입니다.
// "이건 화면에 만들지 말고 안쪽만 꺼내 놓아라" 라는 뜻입니다.

console.log(AppFragment().type === React.Fragment);
// 콘솔: true

// 언제 무엇을 쓰면 될까요.
//
//   감싸는 태그에 className 이나 style 을 줄 것이다   → div 로 감싼다
//   그냥 묶기만 하면 된다                             → Fragment 로 감싼다
//
// 헷갈리면 Fragment 를 먼저 쓰고, 꾸밀 일이 생기면 div 로 바꾸면 됩니다.

// ✏️ 직접 해보기 3 — AppFragment 의 <> </> 를 <div> </div> 로 바꾸고
//                    데모 ② 의 innerHTML 이 어떻게 바뀌는지 확인하세요.

// ── 섹션 4: 스스로 닫는 태그 ──

// HTML 에서는 이렇게 써도 잘 돌아갔습니다.
//
//     <br>      <hr>      <img src="...">      <input type="text">
//
// JSX 에서는 안 됩니다. 확인해 봅시다.

console.log(tryJsx("const x = <br>;"));
// 콘솔: unknown: Unterminated JSX contents. (1:14)

// "JSX 내용이 안 끝났습니다" 라는 뜻입니다.
// Babel 은 <br> 을 '여는 태그' 로 읽고 </br> 을 계속 찾다가 파일 끝에 닿았습니다.
//
// 왜 HTML 은 되고 JSX 는 안 될까요?
// HTML 은 브라우저가 알아서 봐 주는 문서입니다. 조금 틀려도 고쳐서 읽습니다.
// JSX 는 코드입니다. 코드는 짝이 안 맞으면 그 자리에서 멈춥니다.
//
// 해결은 끝에 슬래시를 붙이는 것입니다.
//
//     <br />    <hr />    <img src="..." />    <input type="text" />
//
// "여기서 바로 닫는다" 는 표시입니다.

console.log(toJs("<br />"));
// 콘솔: /*#__PURE__*/React.createElement("br", null);

const selfClosing = (
  <div>
    <p>
      첫째 줄<br />
      둘째 줄
    </p>
    <hr />
    <input type="text" placeholder="입력칸도 스스로 닫습니다" />
  </div>
);

// 화면: 데모 ③ 에 두 줄짜리 글, 가로줄, 입력칸이 차례로 보입니다.

// 안이 비어 있는 태그는 무엇이든 이렇게 줄여 쓸 수 있습니다.

console.log(toJs("<div></div>") === toJs("<div />"));
// 콘솔: true

// <div></div> 와 <div /> 는 완전히 같습니다.
// 안에 넣을 것이 없으면 짧은 쪽을 쓰면 됩니다.

// ✏️ 직접 해보기 4 — selfClosing 의 <hr /> 을 하나 더 넣어 보세요.
//                    데모 ③ 에 가로줄이 두 개가 되는지 확인하세요.

// ── 섹션 5: 소문자는 HTML, 대문자는 여러분의 함수 ──

// 섹션 2에서 <App /> 이라고 대문자로 썼습니다. 왜 대문자였을까요?
// 변환 결과를 나란히 놓으면 한눈에 보입니다.

console.log(toJs("<div />"));
// 콘솔: /*#__PURE__*/React.createElement("div", null);

console.log(toJs("<App />"));
// 콘솔: /*#__PURE__*/React.createElement(App, null);

// 자세히 보세요. 따옴표가 있고 없고의 차이입니다.
//
//     소문자  →  "div"   따옴표가 붙습니다. 문자열입니다.
//     대문자  →  App     따옴표가 없습니다. 변수입니다.
//
// 문자열이면 React 는 "브라우저야, div 태그를 만들어라" 라고 시킵니다.
// 변수면 React 는 "App 이라는 함수를 찾아서 불러라" 라고 합니다.
//
// 첫 글자 하나로 완전히 다른 일이 됩니다. 그래서 대소문자가 규칙이 아니라 뜻입니다.

console.log(toJs("<myBox />"));
// 콘솔: /*#__PURE__*/React.createElement("myBox", null);

// myBox 는 소문자로 시작하니 문자열이 되었습니다.
// 여러분이 myBox 라는 함수를 만들어 뒀어도 React 는 그 함수를 안 찾습니다.
// 브라우저에게 "myBox 태그를 만들어라" 라고 시키고, 브라우저는 그런 태그를 모릅니다.
//
// 그래서 규칙은 이렇습니다.
//
//     여러분이 만든 화면 함수는 이름을 반드시 대문자로 시작한다
//
// 이 '화면을 돌려주는 함수' 를 컴포넌트라고 부릅니다. 03단원에서 제대로 배웁니다.
// 02단원에서는 App 하나만 쓰고, 대문자로 쓴다는 것만 기억하면 됩니다.
//
// 참고로 Fragment 도 같은 규칙을 따릅니다.

console.log(toJs("<React.Fragment><p>가</p></React.Fragment>") === toJs("<><p>가</p></>"));
// 콘솔: true

// <>...</> 는 <React.Fragment>...</React.Fragment> 의 짧은 표기입니다.
// React 가 대문자로 시작하니 변수로 읽힙니다. 규칙이 그대로 맞아떨어집니다.

// ✏️ 직접 해보기 5 — toJs 에 "<Card />" 와 "<card />" 를 각각 넣어
//                    따옴표가 붙는 쪽과 안 붙는 쪽을 확인해 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 태그를 나란히 두 개 쓴다 (섹션 1에서 봤습니다)
//
//   return <h1>아메리카노</h1><p>4000원</p>;
//
// 실수: [SyntaxError] Adjacent JSX elements must be wrapped in an enclosing tag.
//       <> </> 로 감싸거나 <div> </div> 로 감싸세요.

// [실수 2] 닫는 슬래시를 빠뜨린다 (섹션 4에서 봤습니다)
//
//   <img src="a.png">
//
// 실수: [SyntaxError] Unterminated JSX contents.
//       에러가 나는 자리가 실제로 틀린 자리보다 훨씬 아래로 잡힙니다.
//       "이 줄은 멀쩡한데 왜 여기서 에러가 나지" 싶으면 위쪽에서 안 닫은 태그를 찾으세요.

console.log(tryJsx("const x = <img src='a.png'>;"));
// 콘솔: unknown: Unterminated JSX contents. (1:27)

// 위 문자열은 27글자밖에 안 되는데 에러 자리가 (1:27), 즉 맨 끝입니다.
// 정작 틀린 곳은 11번째 글자 부근의 <img 입니다.

// [실수 3] 여는 태그와 닫는 태그 이름이 다르다
//
//   <div>가</dv>
//
// 실수: [SyntaxError] 가 납니다. 이 에러는 친절해서 어느 태그를 찾는지 알려 줍니다.

console.log(tryJsx("const x = <div>가</dv>;"));
// 콘솔: unknown: Expected corresponding JSX closing tag for <div>. (1:16)

// "div 에 맞는 닫는 태그를 기대했다" 는 뜻입니다. 오타 찾기가 쉬워집니다.

// [실수 4] 태그가 서로 엇갈린다
//
//   <div><p>가</div></p>
//
// 실수: 안쪽 태그를 먼저 닫아야 합니다. 나중에 연 것을 먼저 닫는 순서입니다.

console.log(tryJsx("const x = <div><p>가</div></p>;"));
// 콘솔: unknown: Expected corresponding JSX closing tag for <p>. (1:19)

// [실수 5] 컴포넌트 이름을 소문자로 시작한다
//
//   function app() { return <h1>안녕</h1>; }
//   root.render(<app />);
//
// 실수: 에러가 안 납니다. 화면만 이상해집니다. 그래서 찾기 어렵습니다.
//       React 는 app 을 브라우저 태그로 보고 그대로 만들어 버립니다.
//       콘솔에 이런 경고가 나옵니다.
//
//         The tag <app> is unrecognized in this browser.
//         If you meant to render a React component, start its name with an uppercase letter.
//
//       "React 컴포넌트를 그리려던 거면 이름을 대문자로 시작하세요" 라고
//       고치는 방법까지 알려 줍니다. 이 경고가 보이면 함수 이름을 대문자로 바꾸세요.

// [실수 6] Fragment 에 className 을 준다
//
//   <div className="output"> ... </div>   ← 됩니다
//   <> ... </>                            ← 감싸기만 합니다. 속성을 못 줍니다
//
// 실수: <> </> 는 화면에 남지 않으니 꾸밀 대상도 없습니다.
//       속성을 주고 싶으면 div 같은 진짜 태그로 감싸야 합니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(tryJsx("const x = <p>가</p><p>나</p>;"));
//    // 콘솔: unknown: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (1:18)
//    → 함수 안이 아니어도 똑같습니다. 나란히 둔 것 자체가 문제입니다.
//      뒤의 (1:18) 만 다릅니다. 문자열 길이가 달라서 막힌 자리도 달라진 것입니다.
//
// 2) function App() {
//      return (
//        <section className="output">
//          <h1>아메리카노</h1>
//          <p>4000원</p>
//        </section>
//      );
//    }
//    // 콘솔: section
//    → 감싸는 태그는 div 여야만 하는 것이 아닙니다. 하나면 무엇이든 됩니다.
//
// 3) function AppFragment() {
//      return (
//        <div>
//          <h1>아메리카노</h1>
//          <p>4000원</p>
//        </div>
//      );
//    }
//    // 콘솔: <div><h1>아메리카노</h1><p>4000원</p></div>
//    → 감싼 div 가 화면에 그대로 남습니다. Fragment 였을 때는 없던 것입니다.
//
// 4) <hr />
//    <hr />
//    // 화면: 데모 ③ 의 가로줄이 두 개가 됩니다.
//    → 스스로 닫는 태그는 안에 넣을 것이 없으니 그냥 여러 번 쓰면 됩니다.
//
// 5) console.log(toJs("<Card />"));
//    // 콘솔: /*#__PURE__*/React.createElement(Card, null);
//    console.log(toJs("<card />"));
//    // 콘솔: /*#__PURE__*/React.createElement("card", null);
//    → 대문자는 따옴표 없이 변수로, 소문자는 따옴표가 붙어 문자열로 들어갑니다.
//      Card 라는 변수가 없으면 실행할 때 ReferenceError 가 납니다.

export default function Concept04() {
  return (
    <div>
      <h1>개념 04 — 태그 규칙</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
      </p>

      <div className="demo">
        <h3>① div 로 감싼 화면</h3>
        <div id="rootDiv">
          <App />
        </div>
      </div>

      <div className="demo">
        <h3>② Fragment 로 감싼 화면 — 눈으로는 ① 과 같습니다</h3>
        <div id="rootFrag">
          <AppFragment />
        </div>
      </div>

      <div className="demo">
        <h3>③ 스스로 닫는 태그</h3>
        <div id="rootSelf">
          {selfClosing}
        </div>
      </div>

      <Summary
        items={[
          "JSX 는 값 하나입니다. 함수는 값을 하나만 돌려주므로 태그를 나란히 둘 수 없습니다.",
          <>묶는 방법은 두 가지입니다. <code>&lt;div&gt;</code> 로 감싸면 화면에 div 가 남고, <code>&lt;&gt;...&lt;/&gt;</code> 로 감싸면 안 남습니다.</>,
          <>꾸밀 일이 있으면 <code>div</code>, 묶기만 하면 <code>&lt;&gt;...&lt;/&gt;</code>(Fragment) 를 씁니다.</>,
          <>안이 빈 태그는 반드시 스스로 닫습니다. <code>&lt;br /&gt;</code>, <code>&lt;hr /&gt;</code>, <code>&lt;img ... /&gt;</code>.</>,
          "소문자 태그는 문자열이 되어 브라우저 태그가 되고, 대문자 태그는 변수가 되어 여러분의 함수를 찾습니다.",
          "여는 태그와 닫는 태그의 이름은 정확히 같아야 하고, 나중에 연 것을 먼저 닫습니다.",
        ]}
      />
    </div>
  );
}
