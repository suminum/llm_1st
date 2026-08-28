// ============================================================
// 06단원 · 개념 03 — 체크박스와 선택
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01·02 에서 다룬 것은 전부 '글자를 치는 칸' 이었습니다.
// 짝은 언제나 value + onChange 였습니다.
//
// 그런데 체크박스는 글자를 치는 칸이 아닙니다. 켜졌나 꺼졌나만 있습니다.
// 그래서 짝이 다릅니다.
//
//     글자 칸    value   + onChange     값은 e.target.value    (문자열)
//     체크박스   checked + onChange     값은 e.target.checked  (true / false)
//
// JS자료 11단원 개념03 에서 배운 것과 똑같습니다.
// 순수 자바스크립트에서도 체크박스는 .value 가 아니라 .checked 를 읽었습니다.
// React 라고 달라지지 않습니다. 읽는 방법은 그대로고, 담는 곳만 state 로 바뀝니다.
//
// 이 파일에서 하는 일
//   ① 체크박스 하나 (동의 여부)
//   ② 라디오 — 여럿 중 하나만
//   ③ select — 목록에서 고르기
//   ④ 체크박스 여러 개 — 배열 state
//   ⑤ 글자 칸과 체크박스를 한 핸들러로

// ── 섹션 1: 체크박스는 checked ──

// 체크박스에는 value 대신 checked 를 붙입니다.
//
//     <input type="checkbox" checked={agree} onChange={...} />
//
// "이 칸이 켜져 있는지는 언제나 agree 가 정한다" 는 뜻입니다.
// 개념01 의 value 와 하는 일이 똑같습니다. 이름만 checked 입니다.
//
// 읽을 때도 e.target.value 가 아니라 e.target.checked 를 씁니다.
// 아래 데모에서 체크박스를 켜 보면 그 이유가 바로 보입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function AgreeCheck() {
  const [agree, setAgree] = useState(false);
  const [lastValue, setLastValue] = useState("(아직 안 눌렀습니다)");

  console.log("[동의] agree =", agree);
  // 콘솔: [동의] agree = false

  function handleChange(e) {
    setAgree(e.target.checked); // ★ .checked 를 읽습니다
    setLastValue(e.target.value); // 비교용으로 .value 도 담아 둡니다
  }

  return (
    <div className="demo">
      <h3>① 체크박스 하나</h3>
      <label>
        <input type="checkbox" checked={agree} onChange={handleChange} /> 약관에
        동의합니다
      </label>
      <div className="output">동의: {agree ? "함" : "안 함"}</div>
      <div className="output">e.target.value 는: {lastValue}</div>
      <button disabled={!agree}>주문하기</button>
    </div>
  );
}

// 화면: 동의: 안 함 / e.target.value 는: (아직 안 눌렀습니다)
//       '주문하기' 버튼은 눌리지 않는 회색 상태입니다.
//
// 화면(누르면): 체크박스를 켜면 → 동의: 함 / e.target.value 는: on
//               '주문하기' 버튼이 살아납니다.
// 화면(누르면): 다시 끄면 → 동의: 안 함 / e.target.value 는: on
//
// ★ 켜도 꺼도 e.target.value 는 계속 "on" 입니다. 값이 안 바뀝니다.
//   체크박스의 value 는 "이 칸이 켜졌을 때 보낼 값" 이라서
//   켜졌는지 꺼졌는지와는 상관이 없습니다.
//   그래서 체크박스에서 .value 를 읽으면 언제나 같은 값만 나옵니다.
//   켜짐/꺼짐은 .checked 로 읽어야 합니다.
//
// 버튼의 disabled 는 02단원 개념03 의 불리언 속성입니다.
// disabled={!agree} 는 "동의를 안 했으면 못 누르게" 라는 뜻입니다.
// 체크박스 state 하나가 화면 두 곳을 동시에 바꿉니다.

// ✏️ 직접 해보기 1 — 동의하지 않았을 때 버튼 글자를 "동의가 필요합니다" 로
//                    바꿔 보세요. (힌트: 삼항 연산자 — 05단원 개념01)

// ── 섹션 2: 라디오 — 여럿 중 하나만 ──

// 라디오 버튼은 여러 개가 한 묶음으로 움직입니다.
// 하나를 고르면 나머지가 저절로 꺼집니다.
//
// 여기서 헷갈리기 쉬운 점이 하나 있습니다.
// 라디오는 checked 와 value 를 '둘 다' 씁니다. 하는 일이 다릅니다.
//
//     value="S"              골랐을 때 무슨 값이 되나
//     checked={size === "S"} 지금 이게 골라진 것인가 (true / false)
//
// checked 자리에 비교식을 그대로 넣은 것을 보세요.
// size === "S" 는 true 아니면 false 입니다. 그게 그대로 checked 가 됩니다.
// 05단원에서 조건을 화면에 쓰던 것과 같은 방식입니다.
//
// state 는 하나뿐입니다. 라디오가 세 개여도 size 하나로 충분합니다.
// "지금 골라진 것" 이 하나뿐이니 담을 값도 하나면 됩니다.

const SIZES = [
  { value: "S", label: "작은 것" },
  { value: "M", label: "보통" },
  { value: "L", label: "큰 것" },
];

function SizePicker() {
  const [size, setSize] = useState("M");

  return (
    <div className="demo">
      <h3>② 라디오 — 사이즈 고르기</h3>
      {SIZES.map((item) => (
        <label key={item.value} style={{ marginRight: "12px" }}>
          <input
            type="radio"
            name="size"
            value={item.value}
            checked={size === item.value}
            onChange={(e) => setSize(e.target.value)}
          />
          {item.label}
        </label>
      ))}
      <div className="output">고른 사이즈: {size}</div>
    </div>
  );
}

// 화면: 고른 사이즈: M   (처음부터 '보통' 이 켜져 있습니다)
// 화면(누르면): '큰 것' 을 누르면 → 고른 사이즈: L
//
// 라디오는 e.target.value 를 읽습니다. 체크박스와 다릅니다.
// 켜짐/꺼짐이 아니라 "무엇을 골랐나" 가 알고 싶은 것이니까요.
//
// name="size" 를 셋 다 같게 적었습니다. 브라우저가 한 묶음으로 보게 하는 표시입니다.
// React 가 checked 로 이미 관리하고 있어서 없어도 동작은 하지만,
// 붙여 두면 키보드 화살표로 옮겨 다닐 수 있어서 쓰는 사람이 편합니다.
//
// map 과 key 는 05단원 개념02·03 그대로입니다.
// 라디오를 손으로 세 벌 쓰지 않고 배열을 돌려 그렸습니다.

// ✏️ 직접 해보기 2 — SIZES 에 { value: "XL", label: "아주 큰 것" } 을 더해 보세요.
//                    다른 곳은 한 줄도 안 고쳐도 됩니다.

// ── 섹션 3: select — 목록에서 고르기 ──

// select 는 React 에서 모양이 조금 달라집니다.
//
//   순수 HTML  <option value="M" selected>보통</option>   ← option 에 표시
//   React      <select value={menu} onChange={...}>       ← select 에 value
//
// option 에는 아무것도 안 붙입니다. select 하나에만 value 를 줍니다.
// 글자 칸의 value 와 똑같이 생각하면 됩니다.
//
// 고른 값은 option 의 value 입니다. 화면에 보이는 글자가 아닙니다.
// JS자료 11단원 개념03 에서 "큰 것" 을 골라도 "L" 이 나왔던 것과 같습니다.

const MENU_PRICE = {
  아메리카노: 4000,
  라떼: 4500,
  케이크: 6000,
};

function MenuSelect() {
  const [menu, setMenu] = useState("아메리카노");

  // 객체에서 대괄호로 꺼내는 방법입니다. (JS자료 07단원)
  const price = MENU_PRICE[menu];

  console.log("[메뉴] 고른 것:", menu, "/ 가격:", price);
  // 콘솔: [메뉴] 고른 것: 아메리카노 / 가격: 4000

  return (
    <div className="demo">
      <h3>③ select — 메뉴 고르기</h3>
      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
        <option value="아메리카노">아메리카노</option>
        <option value="라떼">라떼</option>
        <option value="케이크">케이크</option>
      </select>
      <div className="output">
        {menu} — {price}원
      </div>
    </div>
  );
}

// 화면: 아메리카노 — 4000원
// 화면(누르면): 목록에서 '케이크' 를 고르면 → 케이크 — 6000원
//
// 가격은 state 로 두지 않았습니다. menu 만 있으면 계산되기 때문입니다.
// 이렇게 "계산할 수 있는 값은 state 로 두지 않는다" 는 07단원 개념05 에서 다룹니다.
//
// 참고로 여러 개를 고를 수 있는 select(multiple)도 있습니다.
// 그때는 value 에 배열을 넣습니다. 잘 안 쓰니 여기서는 넘어갑니다.
// 여러 개를 고르게 하려면 다음 섹션의 체크박스가 훨씬 편합니다.

// ✏️ 직접 해보기 3 — MENU_PRICE 에 삼각김밥: 1200 을 넣고
//                    option 도 한 줄 추가해 보세요.

// ── 섹션 4: 여러 개 체크 — 배열 state ──

// 토핑처럼 "여러 개를 동시에 고를 수 있는" 화면입니다.
// 체크박스를 세 개 두고 state 를 세 개 만들어도 되지만,
// 개수가 늘면 힘들고 "몇 개 골랐나" 를 세기도 번거롭습니다.
//
// 고른 것만 배열에 담으면 편합니다.
//
//     const [picked, setPicked] = useState(["시럽"]);
//
// 그러면 체크박스마다 이렇게 물어보면 됩니다.
//   checked={picked.includes(t)}   ← 배열 안에 있으면 켜진 것 (JS자료 06단원)
//
// 켜고 끌 때는 배열을 새로 만들어 넣습니다.
//   켜짐 → [...picked, 값]                  값을 더한 새 배열
//   꺼짐 → picked.filter((t) => t !== 값)   그것만 뺀 새 배열 (JS자료 08단원)
//
// 둘 다 원래 배열을 건드리지 않고 새 배열을 만듭니다.
// ★ push 를 쓰면 안 되는데, 그 이유는 07단원에서 제대로 설명합니다.
//   지금은 이 모양만 눈에 익히세요.

const TOPPINGS = ["시럽", "휘핑크림", "샷 추가"];

function ToppingPicker() {
  const [picked, setPicked] = useState(["시럽"]);

  console.log("[토핑]", picked);
  // 콘솔: [토핑] ['시럽']

  function handleChange(e) {
    const value = e.target.value;

    if (e.target.checked) {
      setPicked([...picked, value]);
    } else {
      setPicked(picked.filter((item) => item !== value));
    }
  }

  return (
    <div className="demo">
      <h3>④ 토핑 여러 개 고르기</h3>
      {TOPPINGS.map((topping) => (
        <label key={topping} style={{ marginRight: "12px" }}>
          <input
            type="checkbox"
            value={topping}
            checked={picked.includes(topping)}
            onChange={handleChange}
          />
          {topping}
        </label>
      ))}
      <div className="output">고른 것: {picked.join(", ")}</div>
      <div className="output">모두 {picked.length}개</div>
    </div>
  );
}

// 화면: 고른 것: 시럽 / 모두 1개
// 화면(누르면): '휘핑크림' 을 켜면 → 고른 것: 시럽, 휘핑크림 / 모두 2개
// 화면(누르면): 이어서 '시럽' 을 끄면 → 고른 것: 휘핑크림 / 모두 1개
// 화면(누르면): 셋 다 끄면 → 고른 것: / 모두 0개
//
// 여기서는 체크박스에 value 를 직접 적어 줬습니다("시럽" 등).
// 섹션 1 처럼 value 를 안 적으면 전부 "on" 이라 누가 눌렸는지 알 수 없습니다.
// 체크박스가 여러 개일 때는 value 를 꼭 적어 주세요.
//
// join(", ") 은 배열을 글자로 이어 붙입니다. (JS자료 06단원)
// 배열을 그대로 {picked} 라고 쓰면 "시럽휘핑크림" 처럼 붙어 나옵니다.

// ✏️ 직접 해보기 4 — TOPPINGS 에 "얼음 많이" 를 더해 보세요.
//                    체크박스가 네 개로 늘어나는지 확인하세요.

// ── 섹션 5: 글자 칸과 체크박스를 한 핸들러로 ──

// 개념02 에서 name 과 대괄호 키로 핸들러를 하나로 묶었습니다.
//
//     setForm({ ...form, [name]: value });
//
// 체크박스가 섞이면 한 군데만 손보면 됩니다.
// 값을 e.target.value 에서 읽을지 e.target.checked 에서 읽을지 갈라 주는 것입니다.
//
// 어느 쪽인지는 e.target.type 으로 압니다. 그 칸의 type 속성 글자가 들어 있습니다.
//   글자 칸  → "text"
//   체크박스 → "checkbox"
//   라디오   → "radio"
//   숫자 칸  → "number"
//   select   → "select-one"   (하나만 고르는 select 라는 뜻입니다)

function OrderForm() {
  const [order, setOrder] = useState({
    name: "김민준",
    takeout: true,
    size: "M",
  });

  console.log("[주문]", order);
  // 콘솔: [주문] { name: '김민준', takeout: true, size: 'M' }

  function handleChange(e) {
    const name = e.target.name;
    // 체크박스면 checked, 아니면 value — 이 한 줄이 전부입니다
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setOrder({ ...order, [name]: value });
  }

  return (
    <div className="demo">
      <h3>⑤ 한 핸들러로 섞어 쓰기</h3>
      <div>
        이름 <input name="name" value={order.name} onChange={handleChange} />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="takeout"
            checked={order.takeout}
            onChange={handleChange}
          />
          포장하기
        </label>
      </div>
      <div>
        사이즈
        <select name="size" value={order.size} onChange={handleChange}>
          <option value="S">작은 것</option>
          <option value="M">보통</option>
          <option value="L">큰 것</option>
        </select>
      </div>
      <div className="output">
        {order.name} / {order.takeout ? "포장" : "매장"} / {order.size}
      </div>
    </div>
  );
}

// 화면: 김민준 / 포장 / M
// 화면(누르면): '포장하기' 를 끄면 → 김민준 / 매장 / M
// 화면(누르면): 사이즈를 '큰 것' 으로 바꾸면 → 김민준 / 매장 / L
//
// 칸이 세 개고 종류도 세 가지인데 핸들러는 하나입니다.
// select 에도 name 을 붙였습니다. select 도 e.target.name 을 그대로 줍니다.
//
// true / false 를 화면에 그대로 쓰면 아무것도 안 보입니다.
// 그래서 {order.takeout ? "포장" : "매장"} 처럼 글자로 바꿔서 보여 줍니다.

// ✏️ 직접 해보기 5 — "일회용 컵 안 받기" 체크박스를 하나 더 만들어 보세요.
//                    초기값은 false 로 두세요. handleChange 는 안 고쳐도 됩니다.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 체크박스에서 e.target.value 를 읽음
// setAgree(e.target.value);
// 실수: 언제나 "on" 이 들어갑니다. 껐는데도 "on" 입니다.
//       게다가 "on" 은 truthy 라서 조건문이 늘 참이 됩니다.
//       에러는 안 납니다. 섹션 1의 데모에서 직접 확인한 그대로입니다.

// [실수 2] 체크박스에 checked 만 주고 onChange 를 안 붙임
// <input type="checkbox" checked={agree} />
// 실수: 아무리 눌러도 체크가 안 됩니다. 개념01 섹션 3과 완전히 같은 일입니다.
//       콘솔에 이런 경고가 나옵니다.
//         You provided a `checked` prop to a form field without an
//         `onChange` handler. ...
//       value 자리에 checked 만 들어갔을 뿐 나머지는 똑같은 문장입니다.

// [실수 3] option 에 selected 를 씀
// <option value="M" selected>보통</option>
// 실수: React 가 콘솔에 이렇게 알려 줍니다.
//         Use the `defaultValue` or `value` props on <select>
//         instead of setting `selected` on <option>.
//       "option 에 selected 를 붙이지 말고 select 에 value 를 주세요" 라는 뜻입니다.

// [실수 4] 체크를 풀 때 배열에서 안 뺌
// setPicked([...picked, value]);   ← if 없이 이 줄만 씀
// 실수: 껐다 켰다 할 때마다 같은 토핑이 계속 쌓입니다.
//       "고른 것: 시럽, 시럽, 시럽" 이 되고 개수도 계속 늘어납니다.
//       에러는 안 납니다. 켜짐/꺼짐을 if 로 갈라 줘야 합니다.

// [실수 5] 체크박스 여러 개에 value 를 안 적음
// <input type="checkbox" checked={...} onChange={handleChange} />
// 실수: e.target.value 가 전부 "on" 이라 어느 것을 눌렀는지 구분이 안 됩니다.
//       배열에 "on" 만 쌓입니다.

// [실수 6] JSX 속성 사이에 쉼표를 찍음 [SyntaxError]
// <input type="checkbox", checked={agree} />
// 실수: JSX 속성은 쉼표 없이 띄어쓰기로만 나열합니다.
//       쉼표를 찍으면 Babel 이 파일 전체를 못 읽어 화면이 통째로 빕니다.

// ── 화면 조립 ──

export default function Concept03() {
  return (
    <div>
      <h1>개념 03 — 체크박스와 선택</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        <strong>직접 눌러 보는 파일입니다.</strong> 체크박스를 켰다 껐다 하고, 목록을 이것저것 골라 보세요.
      </p>

      <div>
        <AgreeCheck />
        <SizePicker />
        <MenuSelect />
        <ToppingPicker />
        <OrderForm />
      </div>

      <Summary
        items={[
          <>체크박스는 value 가 아니라 <strong>checked</strong> 를 씁니다. 값도 <code>e.target.checked</code> 로 읽습니다 (true / false).</>,
          <>체크박스의 <code>e.target.value</code> 는 켜도 꺼도 늘 같습니다. 안 적으면 "on" 입니다.</>,
          <>라디오는 <code>value</code> 와 <code>checked={"{"}조건{"}"}</code> 를 함께 씁니다. state 는 고른 값 하나면 됩니다.</>,
          <>select 는 option 이 아니라 <strong>select 에 value</strong> 를 줍니다. 고른 값은 option 의 value 입니다.</>,
          <>여러 개 체크는 <strong>배열 state</strong> 로 다룹니다. 켜면 스프레드로 더하고, 끄면 filter 로 뺍니다.</>,
          <><code>e.target.type</code> 으로 갈라 주면 글자 칸과 체크박스를 한 핸들러로 처리할 수 있습니다.</>,
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) <button disabled={!agree}>{agree ? "주문하기" : "동의가 필요합니다"}</button>
//    // 화면: 동의가 필요합니다   (체크 전)
//    // 화면(누르면): 체크하면 → 주문하기
//    → state 하나가 버튼의 글자와 눌림 여부를 함께 정합니다.
//
// 2) SIZES 배열에 한 줄만 더합니다.
//    { value: "XL", label: "아주 큰 것" },
//    // 화면: 라디오가 네 개가 됩니다. '아주 큰 것' 을 고르면 → 고른 사이즈: XL
//    → map 이 배열을 돌면서 그리므로 화면 코드는 손댈 것이 없습니다.
//
// 3) MENU_PRICE 에 삼각김밥: 1200, 을 넣고
//    <option value="삼각김밥">삼각김밥</option> 을 추가합니다.
//    // 화면(누르면): '삼각김밥' 을 고르면 → 삼각김밥 — 1200원
//    → option 의 value 와 MENU_PRICE 의 키가 같아야 합니다.
//      다르면 가격 자리가 비어 버립니다.
//
// 4) const TOPPINGS = ["시럽", "휘핑크림", "샷 추가", "얼음 많이"];
//    // 화면: 체크박스가 네 개가 됩니다.
//    // 화면(누르면): '얼음 많이' 를 켜면 → 고른 것: 시럽, 얼음 많이 / 모두 2개
//    → handleChange 도 배열 state 도 그대로입니다.
//
// 5) useState 초기값에 noCup: false 를 넣고 아래 한 줄을 추가합니다.
//    <label><input type="checkbox" name="noCup" checked={order.noCup}
//      onChange={handleChange} /> 일회용 컵 안 받기</label>
//    // 화면(누르면): 켜면 order 의 noCup 이 true 가 됩니다.
//    → e.target.type 이 "checkbox" 라서 handleChange 가 알아서 checked 를 읽습니다.
//      콘솔의 [주문] 줄에 noCup 이 함께 찍히는지 보세요.
