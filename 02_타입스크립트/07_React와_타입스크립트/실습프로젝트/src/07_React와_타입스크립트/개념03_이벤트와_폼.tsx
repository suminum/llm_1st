// ============================================================
// 07단원 · 개념 03 — 이벤트와 폼
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run typecheck
// ============================================================
//
// React자료 06단원에서 폼과 입력을 배웠습니다. 그때 이렇게 썼습니다.
//
//     function handleChange(e) { setText(e.target.value); }
//
// 여기서 e 가 무엇인지는 아무도 안 알려 줬습니다.
// 타입스크립트에서는 이 자리가 바로 TS7006 이 나는 자리입니다.
//
// 다행히 대부분은 안 적어도 됩니다. 적어야 할 때만 구분하면 됩니다.

import { useState } from "react";
import Summary from "../_ui/Summary.tsx";

// ── 섹션 1: 태그 안에 바로 쓰면 안 적어도 된다 ──

function InlineHandler() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* onClick 안에 바로 쓴 함수의 e 에는 타입이 자동으로 붙습니다 */}
      <button type="button" onClick={(e) => setCount(count + e.detail)}>
        누른 횟수만큼 더하기: {count}
      </button>
      <p>더블클릭하면 2씩 오릅니다(e.detail 이 클릭 횟수입니다).</p>
    </div>
  );
}

// e 에 타입을 안 적었는데 e.detail 이 통과했습니다.
// onClick 이 무엇을 넘겨줄지 React 쪽에 이미 적혀 있어서,
// 03단원 개념03의 '문맥에서 알아내기' 가 그대로 작동한 것입니다.
//
// 그래서 없는 것을 쓰면 걸립니다.
//
// 에러: TS2339 Property 'value' does not exist on type 'MouseEvent<HTMLButtonElement, MouseEvent>'.
// const 없는것 = <button onClick={(e) => console.log(e.value)} />;
//
// 실수: 클릭 이벤트에는 value 가 없습니다.
//       메시지에 MouseEvent<HTMLButtonElement, ...> 라고 나오는 것에 주목하세요.
//       "버튼에서 난 마우스 이벤트" 라는 뜻입니다. 이름이 길 뿐 무섭지 않습니다.

// ✏️ 직접 해보기 1 — InlineHandler 의 (e) 에 마우스를 올려 보세요.
//    무슨 타입이라고 나오나요?


// ── 섹션 2: 함수를 따로 빼면 적어야 한다 ──

// 이때는 문맥이 없습니다. 그냥 함수 하나일 뿐이니 알아낼 근거가 없습니다.
//
// 에러: TS7006 Parameter 'e' implicitly has an 'any' type.
// function handleClickNoType(e) {
//   console.log(e.detail);
// }
//
// 실수: 03단원의 그 에러 그대로입니다. 매개변수는 적어야 합니다.

// 그럼 무슨 타입을 적어야 하나 — 알아내는 요령이 있습니다.
//
//   ① 일단 태그 안에 인라인으로 써 본다
//   ② e 에 마우스를 올려 뜨는 이름을 그대로 베낀다
//   ③ 그 이름을 import 해서 함수 밖으로 옮긴다
//
// 외울 필요가 없습니다. 편집기가 알려 줍니다.

function OutsideHandler() {
  const [count, setCount] = useState(0);

  // 위 요령으로 알아낸 이름을 적었습니다.
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setCount(count + e.detail);
  }

  return (
    <button type="button" onClick={handleClick}>
      따로 뺀 핸들러: {count}
    </button>
  );
}

// React.MouseEvent 처럼 React. 을 붙여 쓰면 import 를 따로 안 해도 됩니다.
// import type { MouseEvent } from "react"; 로 가져와 MouseEvent 라고만 써도 됩니다.
// 이 자료는 짧게 React. 을 붙이는 쪽을 씁니다.

// ✏️ 직접 해보기 2 — OutsideHandler 의 handleClick 에서 타입 표기를 지워 보세요.
//    무슨 에러가 나나요? 확인한 뒤 되돌리세요.


// ── 섹션 3: 입력창 — onChange ──

function TextInput() {
  const [text, setText] = useState("");

  // 입력창의 이벤트는 ChangeEvent 이고, 안에 어떤 태그인지까지 적습니다.
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  return (
    <div>
      <input value={text} onChange={handleChange} placeholder="메뉴 이름" />
      <p>{text.length}자 입력됨</p>
    </div>
  );
}

// <HTMLInputElement> 를 적어야 e.target.value 가 통과합니다.
// 그 자리가 무엇인지 알려 줘야 target 에 무엇이 있는지도 알 수 있기 때문입니다.
//
// 태그마다 이름이 다릅니다. 셋만 알면 됩니다.
//
//     <input>     →  HTMLInputElement
//     <textarea>  →  HTMLTextAreaElement
//     <select>    →  HTMLSelectElement

// ✏️ 직접 해보기 3 — TextInput 의 <HTMLInputElement> 를 지워 보세요.
//    무슨 에러가 나나요?


// ── 섹션 4: 폼 — onSubmit ──

function OrderForm() {
  const [menu, setMenu] = useState("");
  const [orders, setOrders] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // React자료 06단원에서 배운 그것입니다
    if (menu.trim() === "") return;
    setOrders([...orders, menu]);
    setMenu("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={menu} onChange={(e) => setMenu(e.target.value)} placeholder="주문할 메뉴" />{" "}
      <button type="submit">주문</button>
      <ul>
        {orders.map((o, i) => (
          <li key={i}>{o}</li>
        ))}
      </ul>
    </form>
  );
}

// 폼은 FormEvent 입니다. 오타를 내면 preventDefault 에서 걸립니다.
//
// 에러: TS2339 Property 'preventDefault' does not exist on type '{}'.
// function handleSubmitWrong(e: {}) {
//   e.preventDefault();
// }
//
// 실수: 타입을 아무렇게나 적으면 그 안에 없는 기능은 못 씁니다.
//       모르겠으면 섹션 2의 요령을 쓰세요. 인라인으로 써 보고 이름을 베낍니다.

// ✏️ 직접 해보기 4 — OrderForm 의 e.preventDefault() 를 지우고
//    화면에서 주문을 눌러 보세요. 무슨 일이 일어나나요?
//    (타입 검사는 뭐라고 하나요?)


// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] 이벤트 타입을 외우려 하기
//   외울 필요가 없습니다. 인라인으로 써 보고 마우스를 올려 베끼세요.
//   실무 개발자도 그렇게 합니다.

// [실수 2] <HTMLInputElement> 를 빼먹기
//   React.ChangeEvent 라고만 쓰면 TS2314 Generic type requires 1 type argument(s). 입니다.
//   무엇에서 난 이벤트인지까지 적어야 합니다.

// [실수 3] e.target 과 e.currentTarget 을 헷갈리기
//   currentTarget 은 핸들러를 붙인 그 태그이고, target 은 실제로 눌린 것입니다.
//   버튼 안에 <span> 이 있으면 target 은 span 일 수 있습니다.
//   입력창에서는 둘이 같아서 문제가 안 생깁니다.

// [실수 4] any 로 넘어가기
//   function handleChange(e: any) 는 검사를 통째로 끕니다.
//   02단원의 규칙 그대로입니다. 쓰지 마세요.

// ── 화면 ──

export default function Page() {
  return (
    <div>
      <h2>개념 03 — 이벤트와 폼</h2>

      <p>섹션 1 — 인라인은 안 적어도 됨</p>
      <InlineHandler />

      <p>섹션 2 — 따로 뺀 핸들러</p>
      <OutsideHandler />

      <p>섹션 3 — 입력창</p>
      <TextInput />

      <p>섹션 4 — 폼</p>
      <OrderForm />

      <Summary
        items={[
          "태그 안에 인라인으로 쓴 핸들러의 e 는 안 적어도 된다(문맥 추론).",
          "따로 뺀 함수는 적어야 한다. 안 적으면 TS7006 이다.",
          "타입 이름은 외우지 말고, 인라인으로 써 본 뒤 마우스를 올려 베낀다.",
          "클릭은 React.MouseEvent<HTMLButtonElement>",
          "입력은 React.ChangeEvent<HTMLInputElement>",
          "폼은 React.FormEvent<HTMLFormElement>",
          "<HTML...Element> 를 빼먹으면 TS2314 로 걸린다. 무엇에서 난 이벤트인지까지 적는다.",
        ]}
      />
    </div>
  );
}


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) React.MouseEvent<HTMLButtonElement, MouseEvent> 라고 나옵니다.
//    이 이름을 그대로 베껴서 함수 밖으로 옮기면 됩니다.
//    (뒤쪽 , MouseEvent 는 생략해도 됩니다)
//
// 2) error TS7006: Parameter 'e' implicitly has an 'any' type.
//    재현:
//    function handleClick(e) { console.log(e.detail); }
//    void handleClick;
//    태그 안에 있을 때는 문맥이 있어서 안 적어도 됐지만,
//    밖으로 빼면 그냥 함수 하나일 뿐이라 알아낼 근거가 없습니다.
//
// 3) error TS2339: Property 'value' does not exist on type 'EventTarget & Element'.
//    재현:
//    function handleChange(e: React.ChangeEvent) { console.log(e.target.value); }
//    void handleChange;
//
//    적는 자리에서는 안 걸립니다. <> 를 빼면 기본값이 들어가기 때문입니다.
//    걸리는 곳은 e.target.value 를 '쓰는' 줄입니다.
//    기본값이 그냥 Element 라서 그 안에 value 가 없습니다.
//    무엇에서 난 이벤트인지까지 적어야 target 에 무엇이 있는지 알 수 있습니다.
//
// 4) 화면이 새로고침되면서 지금까지 쌓은 주문 목록이 전부 사라집니다.
//    타입 검사는 아무 말도 안 합니다.
//    01단원 개념01의 "타입이 못 잡는 것" 이 이런 것입니다.
//    폼의 기본 동작은 타입의 관심사가 아닙니다.
