// ============================================================
// 02단원 · 개념 02 — 중괄호로 값 넣기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01 마지막에 이런 실수를 봤습니다.
//
//     const name = "김민준";
//     <p>name 님 안녕하세요</p>     → 화면: name 님 안녕하세요
//
// 태그와 태그 사이는 '글자 자리' 입니다. 변수 이름을 적어도 글자로 봅니다.
// 여기에 자바스크립트 값을 넣으려면 표시가 하나 필요합니다.
//
//     { }  ← 중괄호
//
// 중괄호는 "여기부터는 글자가 아니라 자바스크립트다" 라는 표시입니다.
// 이 파일에서는 중괄호 안에 무엇을 넣을 수 있고 무엇은 안 되는지를 정합니다.

// ── 섹션 1: 중괄호로 값 넣기 ──

import Summary from "../_ui/Summary.jsx";
import * as Babel from "@babel/standalone";

const name = "김민준";
const age = 20;

// 중괄호를 씌우면 글자가 아니라 값으로 읽습니다.
const hello = <p>{name}님 안녕하세요</p>;

console.log(hello.props);
// 콘솔: { children: ['김민준', '님 안녕하세요'] }

// children 이 배열이 되었습니다. React 가 이렇게 나눠서 기억합니다.
//   "김민준"        ← 중괄호에서 꺼낸 값
//   "님 안녕하세요"  ← 그냥 글자
//
// 화면에서는 이어 붙어서 한 문장으로 보입니다.

// 중괄호는 한 태그 안에 여러 번 써도 됩니다.
const card = (
  <div className="output">
    <h3>{name}님</h3>
    <p>나이: {age}살</p>
  </div>
);

// className 은 개념03에서 배웁니다. 지금은 화면 색을 입히는 것이라고만 알면 됩니다.
// 소괄호로 감싸 여러 줄로 쓴 이유는 개념05에서 설명합니다.

// 화면: 데모 ① 에 "김민준님" 과 "나이: 20살" 이 보입니다.

// 개념01의 도구로 중괄호가 무엇이 되는지 봅시다.
function toJs(jsxCode) {
  return Babel.transform(jsxCode, {
    presets: [["react", { runtime: "classic" }]],
    generatorOpts: { jsescOption: { minimal: true }, concise: true },
  }).code;
}

console.log(toJs("<p>{name}님</p>"));
// 콘솔: /*#__PURE__*/React.createElement("p", null, name, "님");

// 중괄호가 통째로 사라지고 name 이 그냥 변수로 들어갔습니다.
// 중괄호 자체는 코드가 아니라 "여기는 자바스크립트다" 라는 표시일 뿐입니다.
//
// 글자 자리와 비교하면 차이가 분명합니다.

console.log(toJs("<p>name님</p>"));
// 콘솔: /*#__PURE__*/React.createElement("p", null, "name님");

// 중괄호가 없으면 따옴표가 붙어서 문자열이 됩니다. 그래서 글자로 보였던 것입니다.

// ✏️ 직접 해보기 1 — const menu = "아메리카노"; 를 만들고
//                    <p>오늘은 {menu}</p> 의 props 를 콘솔에 찍어 보세요.

// ── 섹션 2: 중괄호 안에는 '식' 이 들어간다 ──

// 개념01에서 '식' 을 이렇게 정했습니다.
//
//     식 = 계산하고 나면 값 하나가 남는 것
//
// 중괄호 안에는 이 '식' 이 들어갑니다. 변수만 되는 것이 아닙니다.
// 값 하나가 남기만 하면 무엇이든 됩니다. 하나씩 확인해 봅시다.

const price = 4000;
const menu = ["아메리카노", "라떼", "케이크"];
const user = { name: "이서연", age: 22 };

// (1) 계산
console.log(toJs("<p>{price * 2}원</p>"));
// 콘솔: /*#__PURE__*/React.createElement("p", null, price * 2, "원");

// (2) 함수 호출 — 부르고 나면 돌려준 값 하나가 남습니다
console.log(price.toLocaleString());
// 콘솔: 4,000

// (3) 메소드 이어 쓰기 (JS자료 06단원)
console.log(menu.join(" / "));
// 콘솔: 아메리카노 / 라떼 / 케이크

// (4) 객체의 속성 꺼내기 (JS자료 07단원)
console.log(user.name);
// 콘솔: 이서연

// (5) 삼항 연산자 (JS자료 03단원 개념05)
console.log(age >= 19 ? "성인" : "미성년");
// 콘솔: 성인

// 위 다섯 가지를 전부 한 화면에 넣어 봅시다.
const detail = (
  <div className="output">
    <p>메뉴 수: {menu.length}개</p>
    <p>두 잔 값: {price * 2}원</p>
    <p>가격 표기: {price.toLocaleString()}원</p>
    <p>메뉴: {menu.join(" / ")}</p>
    <p>
      {user.name}님은 {user.age >= 19 ? "성인" : "미성년"}입니다
    </p>
  </div>
);

// 화면: 데모 ② 에 다섯 줄이 보입니다.
// 화면: 메뉴 수: 3개 / 두 잔 값: 8000원 / 가격 표기: 4,000원
// 화면: 메뉴: 아메리카노 / 라떼 / 케이크 / 이서연님은 성인입니다

// 여기서 꼭 기억할 것이 있습니다.
// 중괄호 안의 코드는 '화면을 그리기 전에' 먼저 계산됩니다.
// {price * 2} 는 8000 이라는 값이 되고 나서 화면에 들어갑니다.
// 화면에 "price * 2" 라는 글자가 남는 일은 없습니다.

// ✏️ 직접 해보기 2 — <p>{price + 500}원</p> 을 만들어 props 를 찍어 보세요.
//                    children 배열에 무엇이 들어가는지 확인하세요.

// ── 섹션 3: if 문과 for 문은 왜 안 되나 ──

// 여기가 이 파일에서 가장 중요한 곳입니다.
// 중괄호 안에 if 문을 넣으면 어떻게 될까요? 직접 시켜 봅시다.
//
// 진짜로 쓰면 파일이 멈추니까, 개념01의 Babel 에게 '문자열로' 물어봅니다.
// 이렇게 하면 에러 문구만 안전하게 받아 볼 수 있습니다.

function tryJsx(code) {
  try {
    Babel.transform(code, { presets: [["react", { runtime: "classic" }]] });
    return "문제 없음";
  } catch (e) {
    return e.message.split("\n")[0];
  }
}

console.log(tryJsx("const x = <div>{ if (age >= 19) { '성인' } }</div>;"));
// 콘솔: unknown: Unexpected token (1:17)

console.log(tryJsx("const x = <div>{ for (const m of menu) {} }</div>;"));
// 콘솔: unknown: Unexpected token (1:17)

console.log(tryJsx("const x = <div>{ const y = 1; }</div>;"));
// 콘솔: unknown: Unexpected token (1:17)

// 셋 다 같은 에러입니다. (1:17) 은 17번째 글자에서 막혔다는 뜻이고,
// 그 자리가 바로 if / for / const 가 시작하는 자리입니다.
//
// 삼항 연산자는 어떨까요?

console.log(tryJsx("const x = <div>{ age >= 19 ? '성인' : '미성년' }</div>;"));
// 콘솔: 문제 없음

// 되는 것과 안 되는 것의 차이가 무엇일까요.
// 개념01에서 본 변환 결과를 다시 떠올리면 답이 나옵니다.

console.log(toJs("<div>{age >= 19 ? '성인' : '미성년'}</div>"));
// 콘솔: /*#__PURE__*/React.createElement("div", null, age >= 19 ? '성인' : '미성년');

// 중괄호 안의 것은 createElement 의 '인자 자리' 로 들어갑니다.
// 인자 자리에는 값이 들어가야 합니다. 그래서 값이 남는 것만 됩니다.
//
//   createElement("div", null, age >= 19 ? "성인" : "미성년")   ← 값이 남는다. 된다.
//   createElement("div", null, if (age >= 19) { "성인" })       ← 값이 안 남는다. 안 된다.
//
// 두 번째 줄을 소리 내어 읽어 보면 이상합니다.
// 함수에 if 문을 인자로 넘긴 적이 없지 않습니까. 그래서 안 되는 것입니다.
//
// if 문과 for 문은 '문' 입니다. 값을 남기지 않고 '일을 시키는' 것입니다.
//   if (a) { b }   → 실행은 되지만 남는 값이 없습니다.
//   for (...) {}   → 마찬가지입니다.
//
// 삼항 연산자는 '식' 입니다. 계산하면 값 하나가 남습니다.
//   age >= 19 ? "성인" : "미성년"   → "성인" 이 남습니다.
//
// 그래서 JSX 안에서 조건을 다룰 때는 삼항 연산자를 씁니다.
// 이것이 React 코드에 삼항 연산자가 유난히 많이 보이는 이유입니다.

const seat = <p>{user.age >= 19 ? "성인석" : "어린이석"}</p>;
console.log(seat.props);
// 콘솔: { children: '성인석' }

// if 문을 꼭 쓰고 싶으면 방법이 있습니다. 중괄호 '밖' 에서 쓰는 것입니다.
// 미리 계산해서 변수에 담아 두고, 중괄호에는 그 변수만 넣습니다.

let grade;
if (user.age >= 19) {
  grade = "성인";
} else {
  grade = "미성년";
}

console.log(grade);
// 콘솔: 성인

const seat2 = <p>{grade}</p>;
console.log(seat2.props);
// 콘솔: { children: '성인' }

// 화면 모양이 복잡하면 이 방법이 더 읽기 좋습니다.
// 조건에 따라 화면을 그리는 방법은 05단원에서 더 자세히 배웁니다.

// ✏️ 직접 해보기 3 — tryJsx 에 "const x = <div>{ menu.length > 0 ? '있음' : '없음' }</div>;"
//                    를 넣어 결과가 무엇인지 확인해 보세요.

// ── 섹션 4: 중괄호에 넣어도 화면에 안 나오는 값들 ──

// 중괄호에 넣은 값이 전부 글자로 보이는 것은 아닙니다.
// React 는 몇 가지 값을 일부러 '안 그립니다'. 직접 눈으로 확인합시다.

const nothing = (
  <div className="output">
    <p>[{true}] ← true</p>
    <p>[{false}] ← false</p>
    <p>[{null}] ← null</p>
    <p>[{undefined}] ← undefined</p>
    <p>[{""}] ← 빈 문자열</p>
    <p>[{0}] ← 숫자 0</p>
  </div>
);

// 화면: 데모 ③ 의 대괄호 안이 다섯 줄은 비어 있고, 마지막 줄만 [0] 입니다.

// 정리하면 이렇습니다.
//   true / false / null / undefined  → 아무것도 안 그립니다
//   숫자 0                            → 0 이라고 그립니다
//   빈 문자열 ""                      → 아무것도 안 그립니다
//
// 0 만 그려지는 것이 05단원에서 함정이 됩니다. 그때 다시 다룹니다.
//
// 글자로 보고 싶으면 String 으로 바꿔서 넣으면 됩니다. (JS자료 02단원)

console.log(String(true));
// 콘솔: true

const shown = <p>{String(user.age >= 19)}</p>;
console.log(shown.props);
// 콘솔: { children: 'true' }

// 그리고 절대 못 넣는 값이 하나 있습니다. 바로 객체입니다.
//
//   const bad = <p>{user}</p>;
//   root.render(bad);
//
// 이렇게 하면 에러가 나면서 화면이 통째로 비어 버립니다.
// 콘솔에 나오는 문구는 이렇습니다.
//
//   Objects are not valid as a React child (found: object with keys {name, age}).
//   If you meant to render a collection of children, use an array instead.
//
// "객체는 React 의 자식이 될 수 없습니다" 라는 뜻입니다.
// 왜 그럴까요? 객체를 글자로 바꾸면 이렇게 되기 때문입니다.

console.log(String(user));
// 콘솔: [object Object]

// 화면에 [object Object] 라고 나와도 아무 도움이 안 됩니다.
// 그래서 React 는 조용히 이상하게 그리는 대신 에러를 내서 알려 줍니다.
// 화면 어딘가에 [object Object] 가 보인다면 그건 여러분이 직접 String 을
// 씌운 경우입니다. React 가 그렇게 그려 준 것이 아닙니다.
//
// 고치는 방법은 둘 중 하나입니다.

// (1) 필요한 속성만 꺼내서 넣는다 — 대부분 이쪽입니다
const good1 = (
  <p>
    {user.name} ({user.age}살)
  </p>
);
console.log(good1.props);
// 콘솔: { children: ['이서연', ' (', 22, '살)'] }

// (2) 통째로 보고 싶으면 JSON.stringify 로 글자를 만든다 (JS자료 12단원)
console.log(JSON.stringify(user));
// 콘솔: {"name":"이서연","age":22}

// 배열은 어떨까요? 배열은 에러가 안 납니다. 하나씩 이어서 그립니다.
const numbers = <p>{[1, 2, 3]}</p>;
console.log(numbers.props);
// 콘솔: { children: [1, 2, 3] }

// 화면에는 123 으로 붙어서 나옵니다. 사이에 아무것도 안 넣어 주기 때문입니다.
// 사이를 띄우려면 join 을 쓰면 됩니다.
console.log([1, 2, 3].join(", "));
// 콘솔: 1, 2, 3

// 배열 안에 태그를 담아 그리는 방법은 05단원에서 배웁니다.

// ✏️ 직접 해보기 4 — <p>{menu}</p> 를 만들어 화면에 어떻게 나올지 먼저 예상하고,
//                    props 를 콘솔에 찍어 확인해 보세요.

// ── 섹션 5: 중괄호 안의 주석 ──

// JSX 한가운데에 주석을 달고 싶을 때가 있습니다.
// 그런데 태그 사이는 '글자 자리' 라서, // 를 쓰면 그대로 화면에 나옵니다.

const wrongComment = <p>// 이건 주석이 아닙니다</p>;
console.log(wrongComment.props);
// 콘솔: { children: '// 이건 주석이 아닙니다' }

// 글자로 들어갔습니다. 화면에도 그대로 보일 것입니다.
//
// 그러면 어떻게 할까요? 답은 이미 배운 것 안에 있습니다.
// 중괄호 안은 자바스크립트 자리입니다. 자바스크립트 주석을 쓰면 됩니다.
//
//     {/* 이렇게 씁니다 */}
//
// 중괄호를 열고, 여러 줄 주석을 쓰고, 중괄호를 닫습니다.
// 실제로 어떻게 처리되는지 확인해 봅시다.

console.log(toJs("<p>{/* 안 보이는 메모 */}보이는 글자</p>"));
// 콘솔: /*#__PURE__*/React.createElement("p", null, "보이는 글자");

// 주석이 통째로 사라졌습니다. 화면에도 당연히 안 나옵니다.

const withComment = (
  <p className="output">
    {/* 아래 줄은 손님 이름입니다 */}
    {name}님
  </p>
);
console.log(withComment.props.children);
// 콘솔: ['김민준', '님']

// children 에 주석은 흔적도 없습니다.
//
// 참고로 태그 '밖' 에서는 평소처럼 // 를 쓰면 됩니다.
// 지금 여러분이 읽고 있는 이 줄이 그 경우입니다.

// ✏️ 직접 해보기 5 — toJs 에 "<p>{/* 메모 */}아메리카노</p>" 를 넣어
//                    변환 결과에 주석이 남는지 확인해 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 중괄호를 빼먹는다
//
// 에러가 안 납니다. 화면에 변수 이름이 그대로 나옵니다.

const forgot = <p>name 님 안녕하세요</p>;
console.log(forgot.props);
// 콘솔: { children: 'name 님 안녕하세요' }
// 실수: children 이 통째로 문자열이면 중괄호를 빠뜨린 것입니다.
//       화면에 변수 이름이 보이면 이 실수부터 의심하세요.

// [실수 2] 중괄호를 따옴표 안에 넣는다
//
// 이것도 에러가 안 납니다.

const inQuote = <p className="output">{"{name}"}</p>;
console.log(inQuote.props.children);
// 콘솔: {name}
// 실수: 따옴표 안의 중괄호는 그냥 글자입니다. 화면에 {name} 이 그대로 나옵니다.

// [실수 3] 중괄호 안에 if 문을 쓴다 (섹션 3에서 봤습니다)
//
//   <div>{ if (age >= 19) { "성인" } }</div>
//
// 실수: [SyntaxError] Unexpected token 이 납니다. 삼항 연산자를 쓰거나,
//       중괄호 밖에서 미리 변수에 담아 두고 그 변수를 넣으세요.

// [실수 4] 객체를 그대로 넣는다 (섹션 4에서 봤습니다)
//
//   <p>{user}</p>
//
// 실수: Objects are not valid as a React child 에러가 나고 화면이 빕니다.
//       user.name 처럼 속성을 꺼내서 넣으세요.

// [실수 5] 중괄호 안에 세미콜론을 찍는다
//
//   <p>{name;}</p>
//
// 실수: [SyntaxError] 가 납니다. 중괄호 안은 '식' 자리라서 문장 끝 표시가 못 옵니다.
//       세미콜론을 지우면 됩니다.

console.log(tryJsx("const x = <p>{name;}</p>;"));
// 콘솔: unknown: Unexpected token, expected "}" (1:18)

// [실수 6] 중괄호를 두 개 겹쳐 쓴다
//
//   <p>{{name}}</p>
//
// 실수: 화면이 통째로 비고 섹션 4의 객체 에러가 납니다.
//       안쪽 중괄호가 객체로 읽히기 때문입니다.
//       자바스크립트에서 { name } 은 { name: name } 의 줄여 쓴 모양입니다.
//       (키와 변수 이름이 같으면 한 번만 적어도 됩니다. 이 자료에서 처음 나왔습니다)
//       그래서 객체 하나를 통째로 넣은 셈이 됩니다.
//       중괄호 두 개를 제대로 쓰는 자리는 style 뿐입니다. 개념03에서 배웁니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const menu2 = "아메리카노";
//    console.log((<p>오늘은 {menu2}</p>).props);
//    // 콘솔: { children: ['오늘은 ', '아메리카노'] }
//    → 글자 "오늘은 " 과 중괄호에서 꺼낸 값이 배열로 나뉘어 담깁니다.
//      뒤의 공백까지 글자에 포함된다는 점을 보세요.
//
// 2) console.log((<p>{price + 500}원</p>).props);
//    // 콘솔: { children: [4500, '원'] }
//    → 4500 은 따옴표가 없습니다. 계산이 먼저 끝나서 숫자로 들어갔기 때문입니다.
//
// 3) console.log(tryJsx("const x = <div>{ menu.length > 0 ? '있음' : '없음' }</div>;"));
//    // 콘솔: 문제 없음
//    → 삼항 연산자는 값이 하나 남는 '식' 이라 인자 자리에 들어갈 수 있습니다.
//
// 4) console.log((<p>{menu}</p>).props);
//    // 콘솔: { children: ['아메리카노', '라떼', '케이크'] }
//    → 화면에는 "아메리카노라떼케이크" 로 붙어서 나옵니다.
//      사이를 띄우려면 {menu.join(" / ")} 처럼 join 을 쓰세요.
//
// 5) console.log(toJs("<p>{/* 메모 */}아메리카노</p>"));
//    // 콘솔: /*#__PURE__*/React.createElement("p", null, "아메리카노");
//    → 주석은 변환 결과에 남지 않습니다. 화면에도 안 나옵니다.

export default function Concept02() {
  return (
    <div>
      <h1>개념 02 — 중괄호로 값 넣기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
      </p>

      <div className="demo">
        <h3>① 중괄호로 값을 넣은 화면 (섹션 1)</h3>
        <div id="root">
          {card}
        </div>
      </div>

      <div className="demo">
        <h3>② 중괄호 안에 넣을 수 있는 것들 (섹션 2)</h3>
        <div id="rootDetail">
          {detail}
        </div>
      </div>

      <div className="demo">
        <h3>③ 화면에 안 보이는 값들 (섹션 4)</h3>
        <div id="rootFalsy">
          {nothing}
        </div>
      </div>

      <Summary
        items={[
          <>태그 사이에 자바스크립트 값을 넣으려면 <code>{"{"} {"}"}</code> 로 감쌉니다. 안 감싸면 글자가 됩니다.</>,
          <>중괄호 안에는 <strong>식</strong>만 들어갑니다. 계산·함수 호출·속성 꺼내기·삼항 연산자가 됩니다.</>,
          <><code>if</code> 문과 <code>for</code> 문은 값을 남기지 않아서 안 됩니다. 밖에서 변수에 담아 두고 그 변수를 넣으세요.</>,
          <>중괄호 안의 것은 <code>createElement</code> 의 인자 자리로 들어갑니다. 그래서 값만 됩니다.</>,
          <><code>true</code>·<code>false</code>·<code>null</code>·<code>undefined</code>·빈 문자열은 화면에 안 나옵니다. 숫자 <code>0</code> 은 나옵니다.</>,
          "객체를 그대로 넣으면 에러입니다. 속성을 꺼내서 넣으세요. 배열은 이어 붙여 그립니다.",
          <>JSX 안의 주석은 <code>{"{"}/* ... */{"}"}</code> 로 씁니다.</>,
        ]}
      />
    </div>
  );
}
