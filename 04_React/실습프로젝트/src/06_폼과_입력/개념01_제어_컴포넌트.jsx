// ============================================================
// 06단원 · 개념 01 — 제어 컴포넌트
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// JS자료 11단원 개념03 에서 입력칸을 이렇게 다뤘습니다.
//
//     nameInput.addEventListener("input", (e) => {
//       out1.textContent = e.target.value;   // ← 화면을 '내가' 고쳤습니다
//     });
//
// 값을 읽는 부분(e.target.value)은 React 에서도 똑같습니다.
// 달라지는 것은 그 다음입니다. React 에서는 화면을 직접 고치지 않습니다.
// 값을 state 에 넣기만 하면 화면은 알아서 따라옵니다. (04단원)
//
// 이 파일에서 하는 일은 세 가지입니다.
//   ① 입력값을 state 에 담는다              → onChange
//   ② 입력칸에 보이는 글자를 state 로 정한다 → value
//   ③ ② 만 하고 ① 을 빠뜨리면 어떻게 되는지 직접 본다
//
// value 와 onChange 를 짝으로 붙인 입력칸을 '제어 컴포넌트' 라고 부릅니다.
// 이름은 지금 외우지 않아도 됩니다. 이 파일을 다 보면 저절로 이해됩니다.

// ── 섹션 1: onChange 로 값 받기 ──

// 입력칸에 글자를 칠 때마다 실행되는 일을 붙여 봅니다.
// React 에서 쓰는 이름은 onChange 입니다.
//
// 이름 때문에 헷갈리기 쉬운 곳이 하나 있습니다.
// JS자료 11단원에서 배운 순수 자바스크립트의 change 이벤트는
// "다 치고 칸을 벗어났을 때" 한 번만 실행됐습니다.
// React 의 onChange 는 그렇지 않습니다. **글자 하나마다** 실행됩니다.
// 즉 JS자료의 input 이벤트와 같은 시점입니다. 이름만 change 입니다.
//
// e 가 무엇인지도 그대로입니다. e.target 은 이벤트가 일어난 요소,
// e.target.value 는 그 입력칸에 들어 있는 글자입니다. (JS자료 11단원 개념02)

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function NameEcho() {
  const [text, setText] = useState("");

  function handleChange(e) {
    // e.target.value 는 언제나 문자열입니다. 숫자 칸이어도 문자열입니다.
    setText(e.target.value);
  }

  return (
    <div className="demo">
      <h3>① onChange 로 값 받기</h3>
      <input onChange={handleChange} placeholder="이름을 입력하세요" />
      <div className="output">입력한 값: {text}</div>
    </div>
  );
}

// 처음 화면입니다. state 가 빈 문자열이라 뒤가 비어 있습니다.
// 화면: 입력한 값:
//
// 여기에 "김민준" 을 한 글자씩 쳐 보세요. 아래 줄이 글자마다 바뀝니다.
// 화면: 입력한 값: 김
// 화면: 입력한 값: 김민
// 화면: 입력한 값: 김민준
//
// 무슨 일이 일어난 걸까요? 한 글자를 칠 때마다 이렇게 됩니다.
//   키를 누름 → onChange 실행 → setText(새 값) → state 가 바뀜
//   → NameEcho 함수가 처음부터 다시 실행됨 → 화면이 새로 그려짐 (04단원 개념03)
//
// out.textContent = ... 같은 줄이 한 줄도 없다는 점을 보세요.
// 화면을 고치는 일은 React 가 합니다.

// ✏️ 직접 해보기 1 — 입력한 글자 수도 함께 보여 주세요.
//                    (힌트: {text.length} — JS자료 01단원의 .length 입니다)

// ── 섹션 2: value 를 붙이면 무엇이 달라지나 ──

// 섹션 1 의 입력칸에는 이상한 점이 하나 있습니다.
// 화면에 보이는 글자를 '두 곳' 이 따로 갖고 있다는 것입니다.
//
//   (1) 입력칸 자신이 갖고 있는 글자   ← 브라우저가 관리합니다
//   (2) state 에 담아 둔 text          ← 우리가 관리합니다
//
// 지금은 둘이 같습니다. 그런데 코드로 입력칸을 비우고 싶으면 어떻게 할까요?
// setText("") 를 불러도 (2)만 바뀝니다. (1)은 그대로라 칸의 글자가 안 지워집니다.
//
// 그래서 입력칸에 value 를 붙입니다.
//
//     <input value={text} onChange={...} />
//
// value={text} 는 이런 뜻입니다.
//   "이 칸에 보이는 글자는 언제나 text 다."
//
// 이러면 (1)이 사라집니다. 값이 state 한 곳에만 있게 됩니다.
// 아래 데모에서 '지우기' 와 '이서연 넣기' 버튼을 눌러 보세요.
// 버튼이 state 만 바꾸는데 입력칸의 글자까지 따라 바뀝니다.

function ControlledName() {
  const [text, setText] = useState("김민준");

  // 함수 안에 그냥 둔 console.log 는 이 컴포넌트가 그려질 때마다 실행됩니다.
  // (04단원 개념03 에서 렌더링 횟수를 셀 때 쓴 방법입니다)
  console.log("[제어] 다시 그려집니다. text =", text);
  // 콘솔: [제어] 다시 그려집니다. text = 김민준

  return (
    <div className="demo">
      <h3>② value + onChange — 제어 컴포넌트</h3>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <button onClick={() => setText("")}>지우기</button>
        <button onClick={() => setText("이서연")}>이서연 넣기</button>
      </div>
      <div className="output">지금 state: {text}</div>
    </div>
  );
}

// 처음 화면입니다. 입력칸 안에 이미 "김민준" 이 들어 있습니다.
// 화면: 입력칸 = 김민준 / 지금 state: 김민준
//
// 화면(누르면): '지우기' 를 누르면 입력칸이 텅 비고, 지금 state: 도 비어 버립니다.
// 화면(누르면): '이서연 넣기' 를 누르면 입력칸에 이서연 이 들어갑니다.
//
// 콘솔도 함께 보세요. 글자를 한 자 칠 때마다 [제어] 줄이 한 줄씩 늘어납니다.
// state 가 바뀌면 컴포넌트 함수가 다시 실행되기 때문입니다.
//
// 정리하면 이렇습니다.
//   value    = state 를 화면으로 내보내는 길  (state → 입력칸)
//   onChange = 사용자가 친 글자를 state 로 들이는 길 (입력칸 → state)
// 두 길이 다 있어야 값이 돕니다. 한 쪽만 있으면 다음 섹션처럼 됩니다.

// ✏️ 직접 해보기 2 — '박지훈 넣기' 버튼을 하나 더 만들어 보세요.
//                    (위 두 버튼 중 하나를 복사해서 글자만 바꾸면 됩니다)

// ── 섹션 3: onChange 를 빼면 — 직접 고장을 내 봅니다 ──

// 아래 BrokenInput 은 value 만 붙이고 onChange 를 일부러 뺐습니다.
//
//     <input value={text} />     ← onChange 가 없습니다
//
// 데모 ③ 의 '고장난 입력칸 켜기' 버튼을 누른 뒤,
// 나타난 칸에 아무 글자나 쳐 보세요.
//
// ★ 한 글자도 안 써집니다. 키보드는 멀쩡한데 칸이 꿈쩍도 안 합니다.

// 검증: 경고허용 You provided a `value` prop to a form field without an `onChange` handler

function BrokenInput() {
  const [text, setText] = useState("김민준");

  console.log("[고장] 다시 그려집니다. text =", text);
  // 콘솔: [고장] 다시 그려집니다. text = 김민준

  return (
    <div>
      <input value={text} placeholder="여기에 글자를 쳐 보세요" />
      <div className="output">지금 state: {text}</div>
      <button onClick={() => setText("이서연")}>state 를 바꿔 보기</button>
    </div>
  );
}

function BrokenDemo() {
  // 페이지를 열자마자 켜지지 않게 해 두었습니다.
  // 켜는 순간 콘솔에 경고가 하나 나오는데, 그것이 이 섹션의 볼거리입니다.
  const [show, setShow] = useState(false);

  return (
    <div className="demo">
      <h3>③ onChange 없는 입력칸 (고장)</h3>
      <button onClick={() => setShow(true)}>고장난 입력칸 켜기</button>
      {show && <BrokenInput />}
    </div>
  );
}

// 화면(누르면): 버튼을 누르면 아래에 "김민준" 이 든 입력칸이 나타납니다.
//               그 칸에 글자를 쳐도 화면이 하나도 안 바뀝니다.
//               (끄고 싶으면 왼쪽에서 다른 예제를 골랐다 돌아오세요)
//
// 왜 안 써질까요? 순서대로 따라가면 이렇습니다.
//   1. 키를 누른다
//   2. 브라우저가 일단 입력칸의 글자를 바꾼다
//   3. onChange 가 없으니 setText 를 부르는 코드가 없다 → state 는 그대로 "김민준" 이다
//   4. 이 칸은 value="김민준" 으로 고정된 제어 컴포넌트이므로, React 가 그 즉시
//      입력칸의 DOM 값을 다시 "김민준" 으로 되돌려 놓는다 (컴포넌트를 다시 그리는 것과는 다른 일입니다)
//   5. 그래서 칸은 계속 "김민준" 으로 보인다
//
// 한 줄로 줄이면 이렇습니다.
//   ★ 화면은 state 를 그대로 비춘다. state 가 안 바뀌면 화면도 안 바뀐다.
//
// 콘솔을 보세요. [고장] 줄이 켤 때 딱 한 번만 찍히고, 아무리 타이핑해도
// 늘어나지 않습니다. 컴포넌트가 다시 그려진 것이 아니라,
// React 가 입력칸의 값만 그때그때 원래대로 되돌려 놓은 것입니다.
// 반대로 'state 를 바꿔 보기' 버튼을 누르면 [고장] 줄이 하나 늘고
// (이번엔 진짜로 다시 그려집니다) 입력칸 글자도 이서연 으로 바뀝니다.
//
// React 도 이걸 실수로 보고 콘솔에 빨간 경고를 냅니다. 전문은 이렇습니다.
//
//   You provided a `value` prop to a form field without an
//   `onChange` handler. This will render a read-only field. If the field
//   should be mutable use `defaultValue`. Otherwise, set either `onChange`
//   or `readOnly`.
//
// 우리말로 옮기면 이렇습니다.
//   "value 는 줬는데 onChange 를 안 줬습니다. 읽기 전용 칸이 됩니다.
//    고칠 수 있어야 하면 defaultValue 를 쓰고,
//    아니면 onChange 나 readOnly 중 하나를 붙이세요."
//
// 즉 고치는 길이 세 개입니다.
//   (a) onChange 를 붙인다 → 제어 컴포넌트. 이 자료는 이 방법을 씁니다.
//   (b) value 대신 defaultValue 를 쓴다 → 섹션 5에서 봅니다.
//   (c) readOnly 를 붙인다 → 일부러 못 고치게 할 때만 씁니다.
//
// 이 경고는 "고장" 을 알리는 것이지 에러가 아닙니다. 화면은 계속 돌아갑니다.
// 그래서 더 위험합니다. 못 보고 지나치기 쉽습니다.

// ✏️ 직접 해보기 3 — BrokenInput 의 input 에 readOnly 를 붙여 보세요.
//                    <input value={text} readOnly />
//                    저장하면 → 다시 켜 보면 경고가 사라집니다.

// ── 섹션 4: state 를 거치면 값에 손을 댈 수 있다 ──

// 섹션 3 이 알려 준 것을 뒤집으면 쓸모가 생깁니다.
//   "setState 를 안 부르면 화면이 안 바뀐다"
//   → 조건에 안 맞을 때 일부러 setState 를 안 부르면, 그 글자는 안 들어갑니다.
//
// 아래는 10자까지만 받는 메모 칸입니다. 11번째 글자부터는 아예 안 써집니다.
// 사용자가 친 글자가 곧바로 화면에 가지 않고 우리 손을 한 번 거치기 때문에
// 이런 일이 가능합니다. value 를 붙인 덕분입니다.

const MAX_LENGTH = 10;

function LimitedMemo() {
  const [memo, setMemo] = useState("아메리카노");

  console.log("[메모] 지금 길이:", memo.length);
  // 콘솔: [메모] 지금 길이: 5

  function handleChange(e) {
    const value = e.target.value;

    if (value.length > MAX_LENGTH) {
      return; // state 를 안 바꿉니다 → 화면도 안 바뀝니다 (섹션 3 그대로)
    }
    setMemo(value);
  }

  return (
    <div className="demo">
      <h3>④ 10자까지만 받는 칸</h3>
      <input value={memo} onChange={handleChange} />
      <div className="output">
        {memo.length} / {MAX_LENGTH} 자
      </div>
    </div>
  );
}

// 화면: 입력칸 = 아메리카노 / 5 / 10 자
//
// 뒤에 "한잔주세요" 를 이어서 쳐 보세요. 10자까지는 들어갑니다.
// 화면: 아메리카노한잔주세요 / 10 / 10 자
// 그 뒤로는 아무리 쳐도 글자가 안 늘어납니다. 11번째에서 return 하기 때문입니다.
//
// 섹션 1처럼 value 를 안 붙였다면 이렇게 못 막습니다.
// 입력칸이 자기 글자를 스스로 갖고 있어서, state 를 안 바꿔도 글자는 들어갑니다.

// ✏️ 직접 해보기 4 — MAX_LENGTH 를 5 로 바꾸고 저장하세요.
//                    이미 들어 있는 "아메리카노" 는 어떻게 되나요?

// ── 섹션 5: value 대신 defaultValue 를 쓰면 ──

// 섹션 3 의 경고가 알려 준 두 번째 길입니다.
//
//     <input defaultValue="아메리카노" />
//
// defaultValue 는 "처음 한 번만 이 글자를 넣어 둬라" 는 뜻입니다.
// 그 다음부터는 입력칸이 자기 글자를 스스로 갖습니다. 그래서 잘 써집니다.
// 경고도 안 납니다. React 가 값을 관리하지 않겠다고 선언한 셈이니까요.
//
// 편해 보이지만 잃는 것이 있습니다.
//   - React 가 그 값을 모릅니다. 화면 다른 곳에 같이 보여 줄 수 없습니다.
//   - 버튼으로 비우거나 채울 수 없습니다.
//   - 섹션 4처럼 글자 수를 막을 수도 없습니다.
//
// 값을 읽으려면 입력칸을 직접 붙잡아야 하는데, 그 방법(useRef)은 10단원입니다.
// 이 자료는 06단원부터 끝까지 value + onChange 만 씁니다.

function DefaultValueDemo() {
  const [copied, setCopied] = useState("(아직 모릅니다)");

  return (
    <div className="demo">
      <h3>⑤ defaultValue — React 가 값을 모르는 칸</h3>
      <input defaultValue="아메리카노" />
      <div>
        <button onClick={() => setCopied("(그래도 여전히 모릅니다)")}>
          옆 칸의 값을 여기로 가져오기
        </button>
      </div>
      <div className="output">가져온 값: {copied}</div>
    </div>
  );
}

// 화면: 입력칸 = 아메리카노 / 가져온 값: (아직 모릅니다)
//
// 이 칸은 글자가 잘 써집니다. 경고도 안 납니다.
// 그런데 버튼을 눌러도 옆 칸의 글자를 가져올 수가 없습니다.
// 화면(누르면): 가져온 값: (그래도 여전히 모릅니다)
//
// 가져올 코드를 쓸 수가 없어서 이렇게 적어 두었습니다.
// 이것이 defaultValue 의 한계입니다. 값이 React 밖에 있습니다.

// ✏️ 직접 해보기 5 — ⑤ 의 입력칸 글자를 지우고 "라떼" 로 바꿔 보세요.
//                    그 다음 왼쪽에서 다른 예제를 골랐다 돌아오면 무엇이 보일까요? 먼저 예상해 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] onChange 에 괄호를 붙임
// <input value={text} onChange={handleChange(e)} />
// 실수: 04단원 개념01 과 같은 실수입니다. 괄호를 붙이면 '함수' 가 아니라
//       '함수를 지금 실행한 결과' 를 넘기는 것이 됩니다.
//       게다가 여기서는 e 라는 이름이 그 자리에 없어서
//       ReferenceError: e is not defined 로 화면이 통째로 안 그려집니다.
//       onChange={handleChange} 처럼 이름만 넘기세요.

// [실수 2] e.target.value 가 아니라 e.target 을 넣음
// setText(e.target);
// 실수: state 에 입력칸 요소 자체가 들어갑니다. 그걸 화면에 그리려다가
//       Objects are not valid as a React child 에러가 나고 화면이 멈춥니다.
//       .value 를 빠뜨리지 마세요.

// [실수 3] onChange 를 소문자로 씀
// <input value={text} onchange={handleChange} />
// 실수: 아무 일도 안 일어납니다. 글자가 안 써집니다.
//       React 는 onChange 처럼 중간이 대문자인 이름만 이벤트로 봅니다.
//       콘솔에는 Unknown event handler property `onchange` 경고가 나옵니다.

// [실수 4] value 자리에 setter 를 넣음
// <input value={setText} onChange={(e) => setText(e.target.value)} />
// 실수: 함수를 화면에 넣은 셈이라 칸이 비어 보이고 경고가 납니다.
//       value 에는 '지금 보여 줄 값' 을 넣습니다.

// [실수 5] 화살표 함수의 화살표를 빠뜨림 [SyntaxError]
// <input value={text} onChange={(e) setText(e.target.value)} />
// 실수: => 가 없어서 Babel 이 파일 전체를 못 읽습니다.
//       화면이 통째로 비고 콘솔에 SyntaxError 가 납니다. 눈으로만 보세요.

// ── 화면 조립 ──

export default function Concept01() {
  return (
    <div>
      <h1>개념 01 — 제어 컴포넌트</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        <strong>직접 타이핑해 보는 파일입니다.</strong> 읽기만 하면 절반도 안 남습니다. 입력칸이 나오면 손을 올리고 글자를 쳐 보세요.
      </p>

      <div>
        <NameEcho />
        <ControlledName />
        <BrokenDemo />
        <LimitedMemo />
        <DefaultValueDemo />
      </div>

      <Summary
        items={[
          <><strong>onChange</strong> 는 글자 하나마다 실행됩니다. 값은 <code>e.target.value</code> 로 읽고, 언제나 문자열입니다.</>,
          <><code>value={"{"}state{"}"}</code> 는 "이 칸에 보이는 글자는 언제나 이 state 다" 라는 뜻입니다.</>,
          <>value 와 onChange 를 짝으로 붙인 입력칸을 <strong>제어 컴포넌트</strong>라고 합니다. 값이 state 한 곳에만 있습니다.</>,
          <>onChange 를 빼면 글자가 한 자도 안 써집니다. <strong>화면은 state 를 그대로 비추기 때문</strong>입니다. React 도 콘솔에 경고를 냅니다.</>,
          "state 를 거치므로 값에 손을 댈 수 있습니다. 조건에 안 맞으면 setState 를 안 부르면 됩니다.",
          "defaultValue 는 첫 값만 정합니다. React 가 그 값을 모르므로 이 자료에서는 쓰지 않습니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) <div className="output">입력한 값: {text} ({text.length}자)</div>
//    // 화면: 입력한 값: 김민준 (3자)
//    → 아무것도 안 쳤을 때는 (0자) 입니다.
//
// 2) <button onClick={() => setText("박지훈")}>박지훈 넣기</button>
//    // 화면(누르면): 입력칸과 '지금 state:' 가 함께 박지훈 으로 바뀝니다.
//    → 버튼은 state 만 바꿉니다. 입력칸을 건드리는 코드는 한 줄도 없습니다.
//
// 3) <input value={text} readOnly />
//    // 화면: 여전히 글자가 안 써집니다. 대신 콘솔의 빨간 경고가 사라집니다.
//    → readOnly 는 "일부러 못 고치게 한 것" 이라고 React 에게 알리는 표시입니다.
//      동작은 그대로고, 경고만 없어집니다.
//
// 4) 화면: 아메리카노 / 5 / 5 자
//    → 이미 들어 있던 다섯 글자는 그대로 남습니다.
//      handleChange 는 '글자를 칠 때' 만 실행되기 때문입니다.
//      첫 값은 검사를 거치지 않고 그냥 들어갑니다.
//      한 글자만 더 쳐 보면 그때부터 막힙니다.
//
// 5) 다시 "아메리카노" 로 돌아옵니다.
//    → 왼쪽에서 다른 예제를 골랐다 돌아오면 컴포넌트가 처음부터 다시 만들어집니다.
//      defaultValue 는 '처음 한 번' 의 값이라 다시 아메리카노 가 들어갑니다.
//      쳐 넣은 "라떼" 는 어디에도 저장되지 않았습니다.
