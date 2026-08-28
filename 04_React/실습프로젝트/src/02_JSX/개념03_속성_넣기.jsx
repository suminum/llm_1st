// ============================================================
// 02단원 · 개념 03 — 속성 넣기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 지금까지는 태그 '사이' 에 무엇을 넣을지만 봤습니다.
//
//     <p>여기에 들어가는 것</p>
//
// 이번에는 태그 '안쪽' 에 붙이는 것을 봅니다.
//
//     <p className="output" title="설명">글자</p>
//         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//         이 부분을 속성이라고 부릅니다
//
// 속성은 그 태그를 어떻게 다룰지 알려 주는 추가 정보입니다.
// 색을 입히거나, 그림 주소를 지정하거나, 버튼을 잠그는 데 씁니다.
//
// JSX 의 속성은 HTML 의 속성과 아주 비슷하지만 몇 군데가 다릅니다.
// 그 '다른 몇 군데' 가 이 파일의 내용 전부입니다.

import Summary from "../_ui/Summary.jsx";
import * as Babel from "@babel/standalone";

function toJs(jsxCode) {
  return Babel.transform(jsxCode, {
    presets: [["react", { runtime: "classic" }]],
    generatorOpts: { jsescOption: { minimal: true }, concise: true },
  }).code;
}

// ── 섹션 1: 속성은 두 번째 인자로 들어간다 ──

// 개념01에서 createElement 의 두 번째 인자가 null 이었던 것을 기억하세요.
//
//     React.createElement("h1", null, "안녕")
//                                ~~~~
//                                여기가 속성 자리였습니다
//
// 속성을 붙이면 그 자리에 무엇이 들어가는지 봅시다.

console.log(toJs('<p title="설명">글자</p>'));
// 콘솔: /*#__PURE__*/React.createElement("p", { title: "설명" }, "글자");

// null 이던 자리에 객체가 들어갔습니다. (JS자료 07단원 객체)
// 속성 이름이 키가 되고, 속성 값이 값이 됩니다.
//
// 속성을 두 개 붙이면 키가 두 개인 객체가 됩니다.

console.log(toJs('<p title="설명" lang="ko">글자</p>'));
// 콘솔: /*#__PURE__*/React.createElement("p", { title: "설명", lang: "ko" }, "글자");

// 만들어진 엘리먼트에서도 확인할 수 있습니다.
const withTitle = <p title="마우스를 올려 보세요">아메리카노</p>;

console.log(withTitle.props);
// 콘솔: { title: '마우스를 올려 보세요', children: '아메리카노' }

// props 안에 속성과 children 이 함께 들어 있습니다.
// 즉 React 에게 속성과 '태그 사이의 내용' 은 같은 종류의 정보입니다.
// 둘 다 props 라는 객체 하나에 담깁니다.
//
// 이 props 라는 이름은 03단원에서 다시 아주 중요하게 나옵니다.

// ✏️ 직접 해보기 1 — toJs 에 '<p lang="ko">라떼</p>' 를 넣어
//                    두 번째 인자가 어떤 객체가 되는지 확인해 보세요.

// ── 섹션 2: class 가 아니라 className ──

// HTML 에서 색이나 모양을 주려면 class 를 씁니다.
//
//     <p class="output">글자</p>          ← HTML
//
// JSX 에서는 이렇게 씁니다.
//
//     <p className="output">글자</p>       ← JSX
//
// 왜 이름이 다를까요? 규칙이라서가 아닙니다. 이유가 있습니다.
//
// 개념01에서 본 것처럼 속성은 결국 자바스크립트 객체의 키가 됩니다.
// 그런데 class 는 자바스크립트가 이미 쓰고 있는 예약어입니다.
// (클래스를 만들 때 쓰는 단어입니다. 이 자료에서는 안 씁니다)
//
// 예약어를 키로 쓰면 옛날 브라우저에서 문제가 생겼습니다.
// 그래서 React 는 실제 DOM 이 쓰는 이름을 그대로 가져왔습니다.
// JS자료 10단원에서 클래스를 붙일 때 이렇게 썼던 것을 떠올려 보세요.
//
//     element.className = "output";
//     element.classList.add("on");
//
// className 은 React 가 새로 만든 말이 아니라, 여러분이 이미 쓰던 말입니다.

const styled = (
  <div>
    <p className="output">className 을 붙인 줄입니다</p>
    <p className="output on">클래스 두 개는 한 문자열에 띄어쓰기로 씁니다</p>
  </div>
);

// 화면: 데모 ① 첫 줄은 흰 상자, 둘째 줄은 파란 바탕에 흰 글자입니다.

console.log(styled.props.children[1].props.className);
// 콘솔: output on

// 클래스를 여러 개 줄 때 className 을 두 번 쓰지 않습니다.
// 한 문자열 안에 띄어쓰기로 이어 씁니다. HTML 과 같습니다.

// ✏️ 직접 해보기 2 — <p className="output"> 의 className 을 "output done" 으로
//                    바꿔 보세요. 화면의 글자에 줄이 그어지는지 확인하세요.

// ── 섹션 3: 속성에 값 넣기 ──

// 속성 값에도 자바스크립트 값을 넣을 수 있습니다. 방법은 개념02와 같습니다.
// 따옴표 대신 중괄호를 씁니다.
//
//     title="설명"      ← 글자 그대로
//     title={message}   ← 변수의 값
//
// 따옴표와 중괄호를 같이 쓰지 않습니다. 둘 중 하나만 씁니다.

const linkUrl = "https://example.com";

console.log(toJs("<a href={linkUrl}>이동</a>"));
// 콘솔: /*#__PURE__*/React.createElement("a", { href: linkUrl }, "이동");

console.log(toJs('<a href="linkUrl">이동</a>'));
// 콘솔: /*#__PURE__*/React.createElement("a", { href: "linkUrl" }, "이동");

// 위는 변수의 값이 들어가고, 아래는 "linkUrl" 이라는 글자가 그대로 들어갑니다.
// 개념02에서 본 차이와 완전히 같습니다.
//
// 그림 주소를 변수로 넣어 봅시다.
// 아래 긴 글자는 그림 파일 하나를 글자로 적어 둔 것입니다.
// 인터넷 없이도 보이라고 이렇게 넣었습니다. 내용은 몰라도 됩니다.

const blueBox =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='60' height='60' fill='%232d6cdf'/></svg>";

const attrDemo = (
  <div>
    <img src={blueBox} alt="파란 사각형" width={60} height={60} />
    <p>
      <a href={linkUrl}>이 링크의 주소는 변수에서 왔습니다</a>
    </p>
    <input type="text" placeholder="여기는 04단원부터 씁니다" />
    <p>
      <button>누를 수 있는 버튼</button>
      <button disabled>못 누르는 버튼</button>
    </p>
  </div>
);

// 화면: 데모 ② 에 파란 사각형, 링크, 입력칸, 버튼 두 개가 보입니다.
// 화면: 오른쪽 버튼은 회색이고 눌리지 않습니다.

// 숫자를 넣을 때를 특히 조심하세요.
//
//     width={60}    ← 숫자 60
//     width="60"    ← 글자 "60"
//
// 이 둘은 그림에서는 결과가 같아 보이지만 값의 종류가 다릅니다.
// 03단원에서 값을 넘겨줄 때 이 차이가 중요해집니다.

console.log(toJs("<img width={60} />"));
// 콘솔: /*#__PURE__*/React.createElement("img", { width: 60 });

console.log(toJs('<img width="60" />'));
// 콘솔: /*#__PURE__*/React.createElement("img", { width: "60" });

console.log(typeof 60, typeof "60");
// 콘솔: number string

// ✏️ 직접 해보기 3 — 위 attrDemo 의 <img> 에 width={120} height={120} 을 주고
//                    사각형이 커지는지 확인해 보세요.

// ── 섹션 4: style 은 중괄호가 두 개다 ──

// 여기가 처음 볼 때 가장 헷갈리는 곳입니다.
//
//     <p style={{ color: "white" }}>글자</p>
//              ~~              ~~
//              중괄호가 두 개입니다
//
// 두 개가 각각 무슨 뜻인지 떼어 놓고 보면 하나도 안 어렵습니다.
//
//     바깥 중괄호  {  }   ← 개념02에서 배운 것. "여기는 자바스크립트다"
//     안쪽 중괄호  {  }   ← JS자료 07단원의 객체. "이건 객체다"
//
// 즉 style 에는 '객체를 넣는다' 는 뜻입니다.
// 그래서 객체를 먼저 만들어 두면 중괄호가 하나로 줄어듭니다. 확인해 봅시다.

const boxStyle = { color: "white", backgroundColor: "#2d6cdf", padding: 10 };

console.log(typeof boxStyle);
// 콘솔: object

console.log(boxStyle);
// 콘솔: { color: 'white', backgroundColor: '#2d6cdf', padding: 10 }

// 이렇게 만들어 두면 중괄호 한 개로 넣습니다.
//
//     <p style={boxStyle}>글자</p>
//
// 두 방식이 완전히 같다는 것을 변환 결과로 확인합시다.

console.log(toJs("<p style={boxStyle}>글자</p>"));
// 콘솔: /*#__PURE__*/React.createElement("p", { style: boxStyle }, "글자");

console.log(toJs('<p style={{ color: "white" }}>글자</p>'));
// 콘솔: /*#__PURE__*/React.createElement("p", { style: { color: "white" } }, "글자");

// 아래쪽은 객체를 그 자리에서 바로 만들어 넣은 것뿐입니다.
// 중괄호가 두 개라서 특별한 문법인 것이 아닙니다.
//
// 이제 CSS 속성 이름을 봅시다. HTML 과 이름이 다릅니다.
//
//     background-color   ← CSS 에서 쓰는 이름
//     backgroundColor    ← JSX 에서 쓰는 이름
//
// 이것도 이유가 있습니다. 객체의 키로 쓰기 때문입니다.
// 자바스크립트에서 이렇게 쓰면 어떻게 될까요?
//
//     { background-color: "yellow" }
//
// 자바스크립트는 이 줄을 "background 빼기 color" 라는 뺄셈으로 읽습니다.
// 키 이름에 빼기 기호를 그냥 쓸 수 없기 때문입니다.
// 그래서 대시를 없애고 뒷 글자를 대문자로 올립니다. 카멜케이스입니다.
//
//     background-color  →  backgroundColor
//     font-size         →  fontSize
//     text-align        →  textAlign
//     border-radius     →  borderRadius
//
// 이름 짓는 규칙 하나면 전부 해결됩니다. 외울 목록이 아닙니다.

const styleDemo = (
  <div>
    <p style={boxStyle}>미리 만든 객체를 넣었습니다</p>
    <p style={{ color: "#c00", fontWeight: "bold" }}>그 자리에서 만든 객체입니다</p>
    <p style={{ fontSize: 24 }}>숫자만 쓰면 px 이 자동으로 붙습니다</p>
    <p style={{ fontSize: "24pt" }}>px 이 아니면 단위를 글자로 적습니다</p>
  </div>
);

// 화면: 데모 ③ 첫 줄은 파란 바탕에 흰 글자입니다.
// 화면: 둘째 줄은 빨간 굵은 글자, 셋째·넷째 줄은 큰 글자입니다.

// 숫자 이야기를 한 번 더 봅시다.
//
//     fontSize: 24       →  화면에서는 24px
//     fontSize: "24pt"   →  화면에서는 24pt
//
// 숫자만 쓰면 React 가 px 을 붙여 줍니다. 다른 단위는 글자로 적어야 합니다.
// 실제로 붙는지 화면의 셋째 줄과 넷째 줄 크기를 비교해 보세요.

// ✏️ 직접 해보기 4 — styleDemo 의 두 번째 줄 style 에 textAlign: "center" 를
//                    더해 보세요. 글자가 가운데로 가는지 확인하세요.

// ── 섹션 5: 이름이 바뀐 다른 속성들 ──

// className 말고도 이름이 바뀐 속성이 몇 개 있습니다.
// 전부 같은 이유입니다. 자바스크립트 예약어이거나, 대시가 들어 있어서입니다.
//
//     HTML          JSX             왜
//     ----------------------------------------------------
//     class      →  className       class 는 예약어
//     for        →  htmlFor         for 는 예약어 (반복문)
//     tabindex   →  tabIndex        카멜케이스로
//     maxlength  →  maxLength       카멜케이스로
//     readonly   →  readOnly        카멜케이스로
//
// htmlFor 는 입력칸에 이름표를 붙일 때 씁니다.
// 이름표를 눌러도 입력칸이 선택되게 해 주는 속성입니다.

const labelDemo = (
  <p>
    <label htmlFor="nameBox">이름: </label>
    <input id="nameBox" type="text" placeholder="이름표를 눌러 보세요" />
  </p>
);

console.log(labelDemo.props.children[0].props.htmlFor);
// 콘솔: nameBox

// 화면: 데모 ④ 에 "이름:" 이름표와 입력칸이 보입니다.
// 화면: "이름:" 글자를 눌러도 입력칸에 커서가 갑니다.

// 반대로 안 바뀌는 것이 훨씬 많습니다. 대부분은 HTML 이름 그대로입니다.
//   id · src · href · alt · title · type · placeholder · value · width · height
//
// 그래서 외울 것은 사실상 className 과 htmlFor 두 개뿐입니다.
// 나머지는 잘못 쓰면 React 가 콘솔에서 바른 이름을 알려 줍니다.
// 그 경고 문구는 섹션 7에서 그대로 보여 드립니다.

// ✏️ 직접 해보기 5 — labelDemo 의 input 에 maxLength={3} 을 넣고,
//                    입력칸에 네 글자를 쳐 보세요. 세 글자에서 멈춥니다.

// ── 섹션 6: 불리언 속성 ──

// 값이 없이 이름만 적는 속성이 있습니다.
//
//     <button disabled>못 누름</button>
//
// HTML 에서도 이렇게 씁니다. 값을 안 적으면 "켜짐" 이라는 뜻입니다.
// JSX 에서 이것이 무엇이 되는지 봅시다.

console.log(toJs("<button disabled>못 누름</button>"));
// 콘솔: /*#__PURE__*/React.createElement("button", { disabled: true }, "못 누름");

// true 가 자동으로 들어갔습니다.
// 그러면 "끄고 싶을 때" 는 어떻게 할까요? 이름을 지우거나, false 를 넣습니다.

console.log(toJs("<button disabled={false}>누를 수 있음</button>"));
// 콘솔: /*#__PURE__*/React.createElement("button", { disabled: false }, "누를 수 있음");

// 여기서 아주 자주 하는 실수가 하나 나옵니다.
//
//     <button disabled="false">   ← 이러면 잠깁니다
//
// "false" 는 글자입니다. 빈 문자열이 아닌 글자는 참으로 취급됩니다.
// (JS자료 03단원에서 본 truthy 이야기입니다)
// 그래서 잠금이 풀리지 않습니다. 반드시 중괄호로 값을 넣어야 합니다.

console.log(Boolean("false"));
// 콘솔: true

console.log(Boolean(false));
// 콘솔: false

// 조건에 따라 잠그려면 중괄호 안에 비교식을 넣습니다.
const stock = 0;

const buyButton = <button disabled={stock === 0}>담기</button>;

console.log(buyButton.props.disabled);
// 콘솔: true

// 화면: 데모 ⑤ 에 회색 "담기" 버튼이 보입니다. 재고가 0이라 잠겼습니다.

// ✏️ 직접 해보기 6 — stock 을 3 으로 바꾸고 저장해 보세요.
//                    "담기" 버튼의 잠금이 풀리는지 확인하세요.

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] className 대신 class 를 쓴다
//
//   <p class="output">글자</p>
//
// 실수: 에러는 안 납니다. 화면도 어찌어찌 그려집니다.
//       하지만 콘솔에 빨간 경고가 나옵니다.
//
//         Invalid DOM property `class`. Did you mean `className`?
//
//       "class 라는 속성은 없습니다. className 을 말한 건가요?" 라는 뜻입니다.
//       콘솔에 Did you mean 이 보이면 그 이름으로 바꾸면 끝입니다.

// [실수 2] htmlFor 대신 for 를 쓴다
//
//   <label for="nameBox">이름</label>
//
// 실수: 같은 모양의 경고가 나옵니다.
//
//         Invalid DOM property `for`. Did you mean `htmlFor`?

// [실수 3] style 에 문자열을 넣는다
//
//   <p style="color: red">글자</p>
//
// 실수: 에러가 나면서 화면이 비어 버립니다. HTML 습관이 그대로 나오는 자리입니다.
//       콘솔 문구는 이렇습니다.
//
//         The `style` prop expects a mapping from style properties to values,
//         not a string.
//
//       "style 에는 문자열이 아니라 객체를 달라" 는 뜻입니다.
//       style={{ color: "red" }} 로 고치세요.

// [실수 4] style 객체에 CSS 이름을 그대로 쓴다
//
//   <p style={{ "background-color": "yellow" }}>글자</p>
//
// 실수: 에러는 안 나지만 색이 안 칠해집니다. 그리고 콘솔에 경고가 나옵니다.
//
//         Unsupported style property background-color.
//         Did you mean backgroundColor?
//
//       "안 칠해지는데 에러도 없다" 면 이름부터 카멜케이스로 고쳐 보세요.

// [실수 5] 중괄호와 따옴표를 같이 쓴다
//
//   <img src="{blueBox}" />
//
// 실수: 에러는 안 납니다. 그런데 그림이 안 보입니다.
//       따옴표 안이라서 "{blueBox}" 라는 글자가 주소로 들어갔기 때문입니다.
//       그런 주소는 없으니 그림도 없습니다. 따옴표를 지우세요.

const wrongSrc = <img src="{blueBox}" alt="안 보이는 그림" />;
console.log(wrongSrc.props.src);
// 콘솔: {blueBox}
// 실수: props.src 가 주소가 아니라 중괄호 글자 그대로면 이 실수입니다.

// [실수 6] 속성 이름과 값 사이에 띄어쓰기를 넣는다
//
//   <p className = "output">글자</p>
//
// 실수: 이건 사실 동작합니다. 하지만 아무도 이렇게 쓰지 않습니다.
//       속성은 className="output" 처럼 붙여 씁니다.

// [실수 7] disabled="false" 로 끄려고 한다 (섹션 6에서 봤습니다)
//
// 실수: 글자 "false" 는 참으로 취급되어 버튼이 계속 잠깁니다.
//       disabled={false} 로 쓰거나 속성을 아예 지우세요.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(toJs('<p lang="ko">라떼</p>'));
//    // 콘솔: /*#__PURE__*/React.createElement("p", { lang: "ko" }, "라떼");
//    → 속성 이름이 키, 속성 값이 값인 객체 하나가 두 번째 인자로 들어갑니다.
//
// 2) <p className="output done">className 을 붙인 줄입니다</p>
//    // 화면: 글자에 취소선이 그어지고 회색이 됩니다.
//    → done 은 전역 CSS(src/index.css)에 미리 정의해 둔 클래스입니다.
//      클래스 두 개는 한 문자열에 띄어쓰기로 이어 씁니다.
//
// 3) <img src={blueBox} alt="파란 사각형" width={120} height={120} />
//    // 화면: 파란 사각형이 가로세로 두 배가 됩니다.
//    → 중괄호 안은 숫자입니다. 따옴표를 쓰면 글자가 됩니다.
//
// 4) <p style={{ color: "#c00", fontWeight: "bold", textAlign: "center" }}>
//    // 화면: 빨간 굵은 글자가 상자 가운데로 옮겨집니다.
//    → text-align 이 아니라 textAlign 입니다. 대시를 빼고 뒷 글자를 대문자로.
//
// 5) <input id="nameBox" type="text" maxLength={3} placeholder="이름표를 눌러 보세요" />
//    // 화면: 네 글자를 쳐도 세 글자에서 더 들어가지 않습니다.
//    → maxlength 가 아니라 maxLength 입니다. 소문자로 쓰면 경고가 납니다.
//
// 6) const stock = 3;
//    // 콘솔: false
//    // 화면: "담기" 버튼이 검은 글씨가 되고 눌립니다.
//    → stock === 0 이 false 라서 disabled 가 꺼집니다.
//      누른 뒤에 무슨 일이 일어나게 하는 것은 04단원입니다.

export default function Concept03() {
  return (
    <div>
      <h1>개념 03 — 속성 넣기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        이 파일에는 <strong>버튼이 나옵니다. 눌러도 아무 일도 일어나지 않습니다.</strong> 버튼을 동작하게 만드는 것은 04단원입니다. 여기서는 모양만 봅니다.
      </p>

      <div className="demo">
        <h3>① className (섹션 2)</h3>
        <div id="rootClass">
          {styled}
        </div>
      </div>

      <div className="demo">
        <h3>② 속성에 값 넣기 (섹션 3)</h3>
        <div id="rootAttr">
          {attrDemo}
        </div>
      </div>

      <div className="demo">
        <h3>③ style (섹션 4)</h3>
        <div id="root">
          {styleDemo}
        </div>
      </div>

      <div className="demo">
        <h3>④ htmlFor 로 이름표 붙이기 (섹션 5)</h3>
        <div id="rootLabel">
          {labelDemo}
        </div>
      </div>

      <div className="demo">
        <h3>⑤ 불리언 속성 (섹션 6)</h3>
        <div id="rootBuy">
          {buyButton}
        </div>
      </div>

      <Summary
        items={[
          <>속성은 <code>createElement</code> 의 <strong>두 번째 인자</strong>, 즉 객체가 됩니다. 태그 사이 내용과 함께 <code>props</code> 에 담깁니다.</>,
          <><code>class</code> 는 자바스크립트 예약어라서 <code>className</code> 을 씁니다. <code>for</code> 도 같은 이유로 <code>htmlFor</code> 입니다.</>,
          "속성 값에 자바스크립트를 넣으려면 중괄호를 씁니다. 따옴표와 같이 쓰지 않습니다.",
          <><code>style={"{"}{"{"} {"}"}{"}"}</code> 의 바깥 중괄호는 "자바스크립트다", 안쪽 중괄호는 "객체다" 라는 뜻입니다.</>,
          <>CSS 속성 이름은 대시를 빼고 카멜케이스로 씁니다. <code>background-color</code> → <code>backgroundColor</code>.</>,
          <>숫자만 쓴 크기 값에는 <code>px</code> 이 자동으로 붙습니다. 다른 단위는 글자로 적습니다.</>,
          <>이름만 적은 속성은 <code>true</code> 입니다. 끌 때는 <code>{"{"}false{"}"}</code> 로 씁니다. <code>"false"</code> 는 글자라서 켜진 것으로 취급됩니다.</>,
        ]}
      />
    </div>
  );
}
