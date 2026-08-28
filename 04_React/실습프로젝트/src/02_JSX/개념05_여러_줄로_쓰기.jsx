// ============================================================
// 02단원 · 개념 05 — 여러 줄로 쓰기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 앞의 파일들에서 이런 모양을 계속 봤습니다.
//
//     return (
//       <div>
//         ...
//       </div>
//     );
//
// return 뒤에 소괄호가 붙어 있습니다. 저것이 왜 있을까요?
// 없으면 무슨 일이 생기는지부터 직접 보겠습니다.
// 이 파일은 문법 이야기가 아니라 '안 그러면 조용히 망가지는' 이야기입니다.

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

// ── 섹션 1: return 뒤에서 줄을 바꾸면 undefined 가 된다 ──

// JS자료 05단원 개념03의 [실수 2] 를 기억하나요? 이런 코드였습니다.
//
//     function brokenReturn() {
//       return
//       1 + 2;
//     }
//     console.log(brokenReturn());   →  undefined
//
// 자바스크립트가 return 뒤에 세미콜론을 자동으로 넣어 버려서
// 아래 줄이 통째로 버려졌습니다.
// 같은 일이 JSX 에서도 그대로 일어납니다. 진짜로 해 봅시다.

function makeTitleBad() {
  return
  <h1>오늘의 메뉴</h1>;
}

console.log(makeTitleBad());
// 콘솔: undefined

// 에러가 하나도 안 났습니다. 그냥 undefined 가 나왔습니다.
// 이런 것이 가장 찾기 어렵습니다. 화면만 비고 콘솔은 조용합니다.
//
// 왜 그런지는 개념01의 도구로 확인하면 끝납니다.

console.log(toJs("function App() {\n  return\n  <h1>안녕</h1>;\n}"));
// 콘솔: function App() { return; /*#__PURE__*/React.createElement("h1", null, "안녕"); }

// return 뒤에 세미콜론이 붙어 있습니다. 우리가 안 찍었는데 생겼습니다.
// 그 뒤의 createElement 는 이미 끝난 함수 뒤에 남은, 아무도 안 보는 줄입니다.
//
// 순서를 정리하면 이렇습니다.
//   1. 자바스크립트가 return 뒤에 세미콜론을 자동으로 넣는다
//   2. 함수는 거기서 끝난다. 돌려주는 값이 없으니 undefined
//   3. 아래 줄의 JSX 는 만들어지기는 하지만 아무 데도 안 간다
//
// 이것을 그대로 render 에 넣으면 어떻게 될까요?
// undefined 를 render 에 넣는 것이라 화면에 아무것도 안 그려집니다.
//
// 같은 줄에 쓰면 아무 문제가 없습니다.

function makeTitleSameLine() {
  return <h1>오늘의 메뉴</h1>;
}

console.log(makeTitleSameLine().type);
// 콘솔: h1

// ✏️ 직접 해보기 1 — makeTitleBad 의 return 과 <h1> 을 한 줄로 붙여 보세요.
//                    콘솔의 undefined 가 무엇으로 바뀌는지 확인하세요.

// ── 섹션 2: 소괄호가 하는 일 ──

// 그런데 화면이 열 줄, 스무 줄이 되면 한 줄로 쓸 수가 없습니다.
// 그래서 소괄호를 씁니다.

function makeTitleGood() {
  return (
    <h1>오늘의 메뉴</h1>
  );
}

console.log(makeTitleGood().type);
// 콘솔: h1

// 소괄호가 무슨 일을 한 걸까요? 두 가지입니다.
//
//   1. return 과 소괄호가 '같은 줄' 에 있습니다.
//      자바스크립트는 return 바로 뒤에 무언가 있으면 세미콜론을 안 넣습니다.
//
//   2. 소괄호는 닫힐 때까지 하나의 값으로 묶입니다.
//      그래서 중간에서 줄을 몇 번 바꿔도 끊기지 않습니다.
//
// 변환 결과를 보면 세미콜론이 사라진 것이 보입니다.

console.log(toJs("function App() {\n  return (\n    <h1>안녕</h1>\n  );\n}"));
// 콘솔: function App() { return /*#__PURE__*/React.createElement("h1", null, "안녕"); }

// 섹션 1의 결과와 나란히 놓고 비교해 보세요.
//
//     return; /*#__PURE__*/React.createElement(...)   ← 소괄호 없음. 끊겼습니다.
//     return /*#__PURE__*/React.createElement(...)    ← 소괄호 있음. 이어졌습니다.
//
// 세미콜론 하나 차이입니다. 그 하나 때문에 화면이 비었던 것입니다.
//
// 소괄호는 JSX 만을 위한 문법이 아닙니다. 그냥 자바스크립트의 소괄호입니다.
// JS자료 05단원에서도 "값이 길면 괄호로 감싸세요" 라고 했습니다. 같은 이야기입니다.
//
// 소괄호를 어디에 쓰나 정리하면 이렇습니다.
//
//   [필요함]     return 뒤에 여러 줄 JSX 를 쓸 때
//   [필요함]     변수에 여러 줄 JSX 를 담을 때 (아래 card 처럼)
//   [필요 없음]  JSX 가 한 줄이면 안 써도 됩니다
//
// 변수에 담을 때도 똑같이 씁니다.

const card = (
  <div className="output">
    <h3>아메리카노</h3>
    <p>4000원</p>
  </div>
);

console.log(card.type);
// 콘솔: div

// 사실 변수에 담을 때는 소괄호가 없어도 동작합니다.
// const card = <div ... 로 시작하면 return 이 아니라서 세미콜론이 안 끼어듭니다.
// 그래도 모두가 소괄호를 씁니다. 시작과 끝이 눈에 잘 보이기 때문입니다.

// ✏️ 직접 해보기 2 — makeTitleGood 의 소괄호를 지우고, return 뒤에서 줄을 바꿔 보세요.
//                    콘솔이 어떻게 되는지 확인하고 다시 되돌리세요.

// ── 섹션 3: 여러 줄로 나누는 방법 ──

// 규칙은 세 개뿐입니다.
//
//   1. return ( 를 같은 줄에 쓰고, 그 줄에서는 더 안 씁니다.
//   2. 태그 하나가 안으로 들어갈 때마다 두 칸씩 더 들여씁니다.
//   3. 닫는 소괄호와 세미콜론 ); 은 return 과 같은 칸에 둡니다.
//
// 눈으로 보면 이렇습니다.
//
//     function App() {
//       return (
//         <div>                ← 두 칸 들어감
//           <h3>제목</h3>      ← 또 두 칸
//           <p>내용</p>        ← 형제니까 같은 칸
//         </div>
//       );                     ← return 과 같은 칸
//     }
//
// 형제 태그는 반드시 같은 칸에 둡니다. 칸이 어긋나면 누가 누구 안에 있는지
// 코드만 보고는 알 수 없습니다. JSX 는 화면 구조를 눈으로 보라고 쓰는 문법인데,
// 들여쓰기가 어긋나면 그 장점이 사라집니다.
//
// 들여쓰기는 화면에 아무 영향이 없습니다. 사람이 읽으라고 하는 것입니다.
// 개념01에서 확인했던 것을 다시 확인해 봅시다.

console.log(toJs("<div><h3>제목</h3></div>") === toJs("<div>\n  <h3>제목</h3>\n</div>"));
// 콘솔: true

// 실제로 여러 줄로 쓴 화면을 하나 만들어 봅시다.

const name = "김민준";
const price = 4000;

function App() {
  return (
    <div className="output">
      <h3>{name}님의 주문</h3>
      <p>아메리카노 {price.toLocaleString()}원</p>
      <p>
        라떼 {(4500).toLocaleString()}원
        <br />
        케이크 {(6000).toLocaleString()}원
      </p>
      <p>합계 {(price + 4500 + 6000).toLocaleString()}원</p>
    </div>
  );
}

// 화면: 데모 ① 에 주문서 한 장이 보입니다.
// 화면: 김민준님의 주문 / 아메리카노 4,000원 / 라떼 4,500원 / 케이크 6,000원 / 합계 14,500원

console.log((price + 4500 + 6000).toLocaleString());
// 콘솔: 14,500

// ✏️ 직접 해보기 3 — App 안에 <p>삼각김밥 1,200원</p> 을 한 줄 더 넣어 보세요.
//                    들여쓰기를 형제 태그와 같은 칸에 맞추세요.

// ── 섹션 4: 줄을 바꾸면 공백은 어떻게 되나 ──

// 여러 줄로 쓰다 보면 뜻하지 않은 일이 생깁니다. 세 가지 경우를 만들어 봅시다.

const spaceTest = (
  <div className="output">
    <p>
      아메리카노는
      4000원입니다
    </p>
    <p>
      <span>김민준</span>
      <span>이서연</span>
    </p>
    <p>
      <span>김민준</span>{" "}
      <span>이서연</span>
    </p>
  </div>
);

// 화면: 데모 ② 에 세 줄이 보입니다. 둘째 줄만 두 이름이 붙어 있습니다.

그려진뒤("#rootSpace", (자리) => {
  const lines = 자리.querySelectorAll("p");

  console.log(lines[0].textContent);
  // 콘솔: 아메리카노는 4000원입니다

  console.log(lines[1].textContent);
  // 콘솔: 김민준이서연

  console.log(lines[2].textContent);
  // 콘솔: 김민준 이서연
});

// 결과를 보면 규칙이 보입니다.
//
//   글자와 글자 사이에서 줄을 바꾸면   → 공백 한 칸으로 이어집니다
//   태그와 태그 사이에서 줄을 바꾸면   → 아무것도 안 남습니다. 붙습니다
//
// 첫째 줄은 글자 두 줄이라 "아메리카노는 4000원입니다" 로 한 칸 띄워졌습니다.
// 둘째 줄은 span 두 개라 "김민준이서연" 으로 붙어 버렸습니다.
//
// 붙는 게 싫으면 셋째 줄처럼 {" "} 를 넣습니다.
// 개념02에서 배운 대로 중괄호 안에 공백 한 칸짜리 문자열을 넣은 것입니다.
// 특별한 문법이 아닙니다.

console.log(toJs('<div><span>가</span>{" "}<span>나</span></div>'));
// 콘솔: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "가"), " ", /*#__PURE__*/React.createElement("span", null, "나"));

// 인자 사이에 " " 가 하나 들어갔습니다. 그것뿐입니다.
//
// 참고로 태그 두 개를 '같은 줄' 에 띄어쓰기로 두면 그 공백은 남습니다.

console.log(toJs("<div><span>가</span> <span>나</span></div>"));
// 콘솔: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "가"), " ", /*#__PURE__*/React.createElement("span", null, "나"));

// 위 {" "} 버전과 결과가 완전히 같습니다.
// 그래서 줄만 안 바꾸면 {" "} 도 필요 없습니다. 줄을 바꿀 때만 필요합니다.

// ✏️ 직접 해보기 4 — spaceTest 의 둘째 p 안에 있는 두 span 을 한 줄로 붙여 쓰고
//                    사이에 띄어쓰기를 하나 넣어 보세요. 화면이 어떻게 되나요?

// ── 섹션 5: 여러 개를 배열에 담아 두기 ──

// JSX 는 값입니다. 값이니까 배열에도 담깁니다. (개념01 섹션 4)
// 여러 줄짜리 화면을 만들다 보면 이 성질이 쓸모 있어집니다.

const menu = ["아메리카노", "라떼", "케이크"];

const items = menu.map((item) => <li>{item}</li>);

console.log(items.length);
// 콘솔: 3

console.log(items[0].type);
// 콘솔: li

console.log(items[0].props);
// 콘솔: { children: '아메리카노' }

// JS자료 08단원의 map 그대로입니다. 글자 배열이 JSX 배열이 되었습니다.
//
// 이 배열을 화면에 그리는 것이 목록 만들기입니다.
// 다만 그냥 그리면 React 가 "key 를 넣으세요" 라고 경고합니다.
// key 가 무엇이고 왜 필요한지는 05단원에서 제대로 배웁니다.
// 여기서는 "배열까지는 만들 수 있다" 까지만 확인하고 넘어갑니다.
//
// 지금 당장 화면에 뿌리고 싶다면 글자로 이어 붙이면 됩니다. (개념02 섹션 2)

console.log(menu.join(", "));
// 콘솔: 아메리카노, 라떼, 케이크

const menuLine = <p className="output">오늘의 메뉴: {menu.join(", ")}</p>;

// 화면: 데모 ③ 에 "오늘의 메뉴: 아메리카노, 라떼, 케이크" 가 보입니다.

// ✏️ 직접 해보기 5 — menu 를 map 으로 <p>{item}</p> 배열로 만들고
//                    items2.length 와 items2[2].props 를 콘솔에 찍어 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] return 뒤에서 줄을 바꾼다 (섹션 1에서 봤습니다)
//
// 실수: 에러가 안 납니다. 화면만 비고 콘솔은 조용합니다.
//       "화면이 안 나오는데 에러도 없다" 면 return 줄을 가장 먼저 보세요.
//       return 바로 뒤에 ( 가 있는지만 확인하면 됩니다.

// [실수 2] 소괄호를 열고 닫는 것을 잊는다
//
//   return (
//     <div>...</div>
//   ;
//
// 실수: [SyntaxError] 가 납니다. 소괄호를 열었으면 반드시 닫아야 합니다.
//       마지막 줄은 ); 로 끝납니다. ) 와 ; 의 순서를 바꾸면 안 됩니다.

// [실수 3] 소괄호 안을 비워 둔다
//
//   return (
//   );
//
// 실수: [SyntaxError] 가 납니다. 소괄호 안에는 값이 하나 있어야 합니다.
//       아무것도 안 그리고 싶으면 return null; 이라고 씁니다.

console.log(tryJsx("function App() {\n  return (\n  );\n}"));
// 콘솔: unknown: Unexpected token (3:2)

// (3:2) 는 세 번째 줄에서 막혔다는 뜻입니다. 닫는 소괄호를 만난 자리입니다.

// [실수 4] 소괄호 대신 중괄호를 쓴다
//
//   return {
//     <div>...</div>
//   };
//
// 실수: [SyntaxError] 가 납니다. 중괄호는 '객체' 이거나 '코드 묶음' 입니다.
//       JSX 를 감싸는 것은 소괄호입니다. 모양이 비슷해서 자주 틀립니다.

// [실수 5] 태그와 태그 사이가 붙어 버린다 (섹션 4에서 봤습니다)
//
// 실수: 에러가 안 납니다. 글자만 붙어서 나옵니다.
//       "김민준이서연" 처럼 붙었으면 사이에 {" "} 를 넣으세요.

// [실수 6] 여러 줄 텍스트를 그대로 두면 줄이 안 나뉜다
//
// 코드에서 줄을 바꿨다고 화면에서도 줄이 바뀌지 않습니다.
// 섹션 4의 첫째 줄이 "아메리카노는 4000원입니다" 한 줄로 나온 것이 그 예입니다.
// 화면에서 줄을 나누려면 개념04의 <br /> 을 넣어야 합니다.
// 위 App 함수의 라떼와 케이크 사이에 <br /> 이 들어간 이유가 그것입니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function makeTitleBad() {
//      return <h1>오늘의 메뉴</h1>;
//    }
//    console.log(makeTitleBad().type);
//    // 콘솔: h1
//    → undefined 가 사라졌습니다. 함수가 값을 돌려주기 시작한 것입니다.
//      makeTitleBad() 를 그대로 찍으면 React 엘리먼트 객체가 통째로 나옵니다.
//      길고 읽기 어려워서 .type 만 찍었습니다.
//
// 2) function makeTitleGood() {
//      return
//        <h1>오늘의 메뉴</h1>;
//    }
//    // 콘솔: Uncaught TypeError: Cannot read properties of undefined (reading 'type')
//    → 여기서 중요한 것은 이 에러가 "문법 에러가 아니다" 라는 점입니다.
//      소괄호를 지워도 문법은 멀쩡합니다. Babel 은 아무 말도 안 합니다.
//      makeTitleGood() 이 undefined 가 되었을 뿐이고,
//      undefined 에서 .type 을 꺼내려다가 그제서야 에러가 난 것입니다.
//      .type 을 안 찍었다면 에러도 없이 화면만 비었을 것입니다.
//
// 3) <p>아메리카노 {price.toLocaleString()}원</p>
//    <p>삼각김밥 {(1200).toLocaleString()}원</p>
//    // 화면: 데모 ① 에 "삼각김밥 1,200원" 줄이 하나 더 생깁니다.
//    → 형제 태그와 같은 칸에 두면 됩니다. 합계 줄은 그대로라 값이 안 맞으니,
//      합계도 고치고 싶으면 + 1200 을 더하세요.
//
// 4) <span>김민준</span> <span>이서연</span>
//    // 화면: 두 이름 사이가 한 칸 띄워집니다. {" "} 를 쓴 셋째 줄과 같아집니다.
//    → 같은 줄에 둔 띄어쓰기는 살아남습니다. 줄을 바꿀 때만 사라집니다.
//
// 5) const items2 = menu.map((item) => <p>{item}</p>);
//    console.log(items2.length);
//    // 콘솔: 3
//    console.log(items2[2].props);
//    // 콘솔: { children: '케이크' }
//    → li 가 p 로 바뀌었을 뿐 구조는 같습니다.
//      화면에 그리는 것은 05단원입니다. 지금 그리면 key 경고가 납니다.

export default function Concept05() {
  return (
    <div>
      <h1>개념 05 — 여러 줄로 쓰기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
      </p>

      <div className="demo">
        <h3>① 여러 줄로 쓴 화면 (섹션 3)</h3>
        <div id="root">
          <App />
        </div>
      </div>

      <div className="demo">
        <h3>② 줄바꿈과 공백 실험 (섹션 4)</h3>
        <div id="rootSpace">
          {spaceTest}
        </div>
      </div>

      <div className="demo">
        <h3>③ 배열을 글자로 이어 붙인 화면 (섹션 5)</h3>
        <div id="rootMenu">
          {menuLine}
        </div>
      </div>

      <Summary
        items={[
          <><code>return</code> 뒤에서 줄을 바꾸면 자바스크립트가 세미콜론을 자동으로 넣어 <code>undefined</code> 가 됩니다. 에러는 안 납니다.</>,
          <>그래서 여러 줄 JSX 는 <code>return (</code> 처럼 소괄호를 같은 줄에 열고 <code>);</code> 로 닫습니다.</>,
          "소괄호는 JSX 전용 문법이 아닙니다. 값이 길 때 감싸는 평범한 소괄호입니다.",
          "안으로 들어갈 때마다 두 칸씩 들여쓰고, 형제 태그는 같은 칸에 둡니다. 들여쓰기는 화면에 영향이 없습니다.",
          <>글자 사이에서 줄을 바꾸면 공백 한 칸이 남고, 태그 사이에서 줄을 바꾸면 아무것도 안 남습니다. 띄우려면 <code>{"{"}" "{"}"}</code> 를 넣습니다.</>,
          <>코드에서 줄을 바꿔도 화면에서는 안 나뉩니다. 화면에서 줄을 나누려면 <code>&lt;br /&gt;</code> 을 씁니다.</>,
          "JSX 를 배열에 담을 수 있습니다. 화면에 목록으로 그리는 것은 05단원입니다.",
        ]}
      />
    </div>
  );
}
