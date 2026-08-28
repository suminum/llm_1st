// ============================================================
// 07단원 · 개념 03 — state 끌어올리기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 03단원에서 컴포넌트를 여러 개 만들었습니다.
// 04단원에서 컴포넌트가 자기 state 를 갖는 법을 배웠습니다.
//
// 그런데 이런 상황이 생깁니다.
//
//     장바구니 목록과 '담긴 개수' 를 각각 다른 컴포넌트로 만들었다.
//     둘 다 '지금 담긴 것' 을 알아야 한다.
//
// 컴포넌트가 각자 state 를 가지면 어떻게 될까요?
// 이 파일은 그것부터 직접 보고 시작합니다.

// ── 섹션 1: 각자 state 를 가지면 어긋납니다 ──

// 아래 두 컴포넌트는 똑같은 목록으로 시작합니다.
// 그런데 각자 자기 state 를 갖고 있습니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function BrokenCartList() {
  const [items, setItems] = useState(["아메리카노"]);

  function handleAdd() {
    setItems([...items, "라떼"]); // 개념01에서 배운 제대로 된 방법입니다
    console.log("[목록 컴포넌트] 내 items 의 개수:", items.length + 1);
    // 콘솔: [목록 컴포넌트] 내 items 의 개수: 2
  }

  return (
    <div>
      <button onClick={handleAdd}>라떼 담기</button>
      <ul>
        {items.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

function BrokenCartCount() {
  // 이 컴포넌트도 '자기' items 를 갖고 있습니다.
  // 배열 구조분해에서 뒤쪽을 안 쓸 때는 이렇게 앞만 꺼낼 수 있습니다
  // (JS자료 09단원 개념01). 여기서는 값을 바꿀 일이 없어서 set 함수를 안 꺼냈습니다.
  const [items] = useState(["아메리카노"]);

  return <div className="output">담긴 개수: {items.length}개</div>;
}

function BrokenCartDemo() {
  return (
    <div className="demo">
      <h3>① 각자 state 를 가진 두 컴포넌트 — 일부러 고장 난 예제</h3>
      <BrokenCartList />
      <BrokenCartCount />
    </div>
  );
}

// 데모 ① 의 '라떼 담기' 를 눌러 보세요.
//
// 화면(누르면): 목록에는 "라떼" 가 붙습니다.
//               그런데 아래 '담긴 개수' 는 1개 그대로입니다.
//
// 두 컴포넌트가 서로를 모르기 때문입니다.
// BrokenCartList 의 items 와 BrokenCartCount 의 items 는
// 이름만 같을 뿐 완전히 다른 두 개의 state 입니다.
//
// useState 는 '컴포넌트마다' 따로 만들어집니다.
// 컴포넌트를 두 번 쓰면 state 도 두 개 생깁니다. 서로 영향을 안 줍니다.
// 04단원에서 배운 그대로인데, 그게 여기서는 문제가 됩니다.
//
// 이 버그는 화면이 커질수록 무섭습니다.
// 어떤 곳은 3개라고 하고 어떤 곳은 1개라고 합니다.
// 무엇이 맞는지 아무도 모릅니다.

// ✏️ 직접 해보기 1 — 데모 ① 의 '라떼 담기' 를 세 번 누르고
//                    목록의 줄 수와 '담긴 개수' 를 각각 세어 보세요.

// ── 섹션 2: 공통 부모로 올립니다 ──

// 답은 간단합니다. 값을 한 군데에만 둡니다.
// 두 컴포넌트를 함께 담고 있는 '부모' 로 state 를 옮깁니다.
// 이것을 state 끌어올리기(lifting state up)라고 부릅니다.
//
// 옮기는 순서는 세 단계입니다.
//
//   ① 두 컴포넌트가 함께 봐야 하는 값을 고른다        → items
//   ② 그 값을 가장 가까운 공통 부모로 옮긴다          → CartApp
//   ③ 자식에게는 props 로 내려보낸다                  → <CartList items={items} />
//
// 자식은 이제 state 를 안 가집니다. 받은 것을 그리기만 합니다.

function CartList({ items }) {
  // props 를 매개변수 자리에서 바로 구조분해했습니다(03단원 개념03).
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name} — {item.price}원
        </li>
      ))}
    </ul>
  );
}

function CartCount({ items }) {
  return <div className="output">담긴 개수: {items.length}개</div>;
}

let nextCartId = 3;

function CartApp() {
  // ★ state 는 여기 한 곳에만 있습니다.
  const [items, setItems] = useState([
    { id: 1, name: "아메리카노", price: 4000 },
    { id: 2, name: "케이크", price: 6000 },
  ]);

  function handleAdd() {
    setItems([...items, { id: nextCartId, name: "라떼", price: 4500 }]);
    nextCartId = nextCartId + 1;
  }

  return (
    <div className="demo">
      <h3>② state 를 부모로 올리기</h3>
      <button onClick={handleAdd}>라떼 담기</button>
      <CartList items={items} />
      <CartCount items={items} />
    </div>
  );
}

// 화면(누르면): 목록에 "라떼 — 4500원" 이 붙고
//               같은 순간 '담긴 개수' 도 2개 → 3개가 됩니다.
//
// 두 자식이 같은 items 를 받아 그리므로 어긋날 방법이 없습니다.
// '맞춰 주는 코드' 를 한 줄도 안 썼다는 점이 중요합니다.
// 값이 하나뿐이니 맞출 것도 없습니다.
//
// 자식이 state 를 잃으면서 오히려 좋아진 것이 있습니다.
// CartCount 는 이제 '어떤 목록이든' 받아서 개수를 보여 줍니다.
// 장바구니에도 쓰고, 할일목록에도 그대로 쓸 수 있습니다.
// 자기 데이터를 갖고 있었다면 그 화면에서만 쓸 수 있었습니다.
//
// 컴포넌트를 이렇게 두 종류로 보면 도움이 됩니다.
//   받은 것만 그리는 컴포넌트   — 재사용하기 쉽습니다. 개수를 늘려도 됩니다.
//   state 를 갖고 있는 컴포넌트 — 그 화면의 주인 노릇을 합니다.
// 한 화면에 주인은 적을수록 좋습니다. 바뀌는 곳이 적다는 뜻이니까요.
//
// 담기 버튼은 지금 부모에 있습니다.
// 자식 안에 있는 버튼으로 부모의 값을 바꾸려면 방법이 하나 더 필요합니다.
// 그건 개념04에서 배웁니다.

// ✏️ 직접 해보기 2 — CartApp 에 <CartCount items={items} /> 를 한 줄 더 쓰세요.
//                    개수 줄이 두 개가 되고, 담을 때 둘 다 같이 바뀝니다.

// ── 섹션 3: 어디까지 올릴까 — 가장 가까운 공통 부모 ──

// "부모로 올린다" 고 했는데, 부모가 여럿이면 어디까지 올려야 할까요?
// 답은 '그 값을 쓰는 컴포넌트를 전부 담고 있는, 가장 가까운 부모' 입니다.
//
// 아래 데모의 구조는 이렇습니다.
//
//     CartPage            ← items 를 여기에 둡니다
//       ├── CartHeader    (개수를 보여 줌)
//       └── CartBody
//             └── CartList  (목록을 보여 줌)
//
// CartHeader 와 CartList 를 둘 다 담고 있는 가장 가까운 부모가 CartPage 입니다.
// 그래서 items 는 CartPage 에 둡니다.
//
// CartBody 는 items 를 화면에 쓰지 않습니다. 그냥 아래로 넘기기만 합니다.
// 이렇게 '지나가기만 하는' 컴포넌트가 많아지면 코드가 지저분해집니다.
// 그 문제를 푸는 방법은 12단원(Context)에서 배웁니다.
// 두세 단계까지는 props 로 내려보내는 것이 오히려 읽기 쉽습니다.

function CartHeader({ items }) {
  return <div className="output">🛒 담긴 물건 {items.length}개</div>;
}

function CartBody({ items }) {
  // 자기는 안 쓰고 아래로 넘기기만 합니다.
  return (
    <div>
      <CartList items={items} />
    </div>
  );
}

function CartPage() {
  const [items, setItems] = useState([
    { id: 1, name: "아메리카노", price: 4000 },
  ]);

  function handleAdd() {
    setItems([...items, { id: nextCartId, name: "케이크", price: 6000 }]);
    nextCartId = nextCartId + 1;
  }

  return (
    <div className="demo">
      <h3>③ 두 단계 아래까지 내려보내기</h3>
      <button onClick={handleAdd}>케이크 담기</button>
      <CartHeader items={items} />
      <CartBody items={items} />
    </div>
  );
}

// 화면(누르면): 위의 "🛒 담긴 물건 1개" 가 2개가 되고
//               아래 목록에도 "케이크 — 6000원" 이 함께 붙습니다.
//
// 두 단계 떨어져 있어도 값은 하나입니다. 그래서 항상 같이 움직입니다.
//
// 반대로 너무 위로 올리면 어떻게 될까요?
// 예를 들어 이 items 를 페이지 맨 위 App 까지 올리면,
// items 와 상관없는 컴포넌트들까지 props 를 받아 넘겨야 합니다.
// '가장 가까운' 공통 부모를 찾는 이유가 이것입니다.

// ✏️ 직접 해보기 3 — CartBody 안에 <CartCount items={items} /> 를 추가하세요.
//                    (섹션 2에서 만든 컴포넌트를 그대로 쓸 수 있습니다)

// ── 섹션 4: 안 올려도 되는 state 도 있습니다 ──

// 모든 state 를 올리면 안 됩니다. 올리는 건 '함께 봐야 하는 값' 만입니다.
//
// 아래 데모의 각 줄에는 '설명 보기' 버튼이 있습니다.
// 어느 줄이 펼쳐져 있는지는 그 줄만 알면 됩니다. 옆줄은 알 필요가 없습니다.
// 그래서 이 state 는 각 줄 컴포넌트 안에 그대로 둡니다.

function CartRow({ item }) {
  // 이 state 는 이 줄에만 필요합니다. 올리지 않습니다.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      {item.name}
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "설명 닫기" : "설명 보기"}
      </button>
      {isOpen ? <div className="output">{item.desc}</div> : null}
    </li>
  );
}

function RowStateDemo() {
  const [items] = useState([
    { id: 1, name: "아메리카노", desc: "쓴맛이 강한 기본 커피입니다" },
    { id: 2, name: "케이크", desc: "달콤한 디저트입니다" },
  ]);

  return (
    <div className="demo">
      <h3>④ 안 올려도 되는 state</h3>
      <ul>
        {items.map((item) => (
          <CartRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노의 '설명 보기' 를 눌러도 케이크는 닫힌 채입니다.
//               둘은 서로 모릅니다. 그리고 그게 맞습니다.
//
// 판단 기준은 하나입니다.
//
//     이 값을 두 곳 이상에서 봐야 하나?
//       그렇다 → 공통 부모로 올린다
//       아니다 → 쓰는 컴포넌트 안에 그대로 둔다
//
// 미리 올려 두면 나중에 편할 것 같지만 그렇지 않습니다.
// 위로 올릴수록 props 가 길어지고, 어디서 바뀌는지 찾기 어려워집니다.
// 필요해질 때 올리면 됩니다. 옮기는 건 어렵지 않습니다.

// ✏️ 직접 해보기 4 — CartRow 의 useState(false) 를 useState(true) 로 바꿔 보세요.
//                    왼쪽에서 다른 예제를 골랐다 돌아오면 두 줄이 어떤 상태로 시작하는지 보세요.

// ── 섹션 5: props 는 자식이 고칠 수 없습니다 ──

// "자식도 items 를 갖고 있는데 거기서 바로 고치면 안 되나요?"
// 안 됩니다. 03단원 개념05에서 배운 대로 props 는 읽기 전용입니다.
//
// 그런데 React 는 이것을 막아 주지 않습니다.
// 자식에서 props.items.push(...) 를 하면 에러가 안 납니다.
// 대신 아주 이상한 일이 벌어집니다. 직접 봅시다.

// 몰래 담는 것들에 붙일 번호입니다. 05단원에서 배운 key 가 겹치지 않게 하려고 둡니다.
let sneakyId = 101;

function SneakyChild({ items }) {
  function handleSneak() {
    // ❌ 이렇게 하면 안 됩니다. 부모의 배열을 몰래 고치는 것입니다.
    items.push({ id: sneakyId, name: "몰래 담긴 것", price: 0 });
    sneakyId = sneakyId + 1;

    console.log("[자식] 몰래 push 했습니다. 배열 길이:", items.length);
    // 콘솔: [자식] 몰래 push 했습니다. 배열 길이: 2
  }

  return <button onClick={handleSneak}>자식이 몰래 담기</button>;
}

function SneakyDemo() {
  const [items, setItems] = useState([
    { id: 1, name: "아메리카노", price: 4000 },
  ]);
  const [redrawCount, setRedrawCount] = useState(0);

  return (
    <div className="demo">
      <h3>⑤ 자식이 props 를 고치면 — 일부러 고장 난 예제</h3>
      <SneakyChild items={items} />
      <button onClick={() => setRedrawCount(redrawCount + 1)}>
        화면 강제로 다시 그리기
      </button>
      <CartList items={items} />
    </div>
  );
}

// 데모 ⑤ 의 '자식이 몰래 담기' 를 두 번 누른 뒤
// '화면 강제로 다시 그리기' 를 눌러 보세요.
//
// 화면(누르면): 몰래 담기 두 번 — 화면은 그대로 "아메리카노" 한 줄
// 화면(누르면): 강제로 다시 그리기 — 갑자기 "몰래 담긴 것" 두 줄이 나타납니다
//
// 개념01의 push 문제가 그대로 재현됐습니다.
// props 로 받은 배열은 사실 '부모의 state 배열 그 자체' 입니다.
// 자식이 그것을 고치면 부모 데이터가 오염되는데,
// 부모는 set 함수를 안 불렀으니 화면을 다시 그릴 생각이 없습니다.
//
// 게다가 이 코드는 나중에 읽을 때 최악입니다.
// "items 가 언제 바뀌었지?" 를 찾으려면 자식들을 전부 뒤져야 합니다.
//
// "그럼 React 가 막아 주면 되잖아요?" 라고 생각할 수 있습니다.
// 자바스크립트에는 "이 객체는 못 고친다" 고 표시하는 방법이 있긴 합니다.
// 그런데 화면을 그릴 때마다 모든 props 에 그 처리를 하면 그만큼 느려집니다.
// 그래서 React 는 막지 않습니다. 경고도 안 띄웁니다.
// 지키는 것은 온전히 우리 몫입니다. 그래서 규칙을 알아 두는 것이 중요합니다.
//
// ★ 규칙: state 를 바꾸는 것은 그 state 를 가진 컴포넌트뿐입니다.
//
// 그럼 자식 안의 버튼으로 목록에 담으려면 어떻게 할까요?
// 부모가 '바꾸는 함수' 를 만들어서 props 로 내려보내면 됩니다.
// 다음 파일(개념04)에서 그 방법을 배웁니다.

// ✏️ 직접 해보기 5 — 데모 ⑤ 의 SneakyChild 에서 items.push(...) 줄을
//                    지우고 console.log 만 남겨 보세요.
//                    '화면 강제로 다시 그리기' 를 눌러도 목록이 그대로인지 확인하세요.

// ------------------------------------------------------------
// 위에서 만든 데모 다섯 개를 화면에 붙입니다.
// ------------------------------------------------------------

export default function Concept03() {
  return (
    <div>
      <h1>개념 03 — state 끌어올리기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        데모 ① 과 데모 ⑤ 는 <strong>일부러 고장 난 예제</strong>입니다.
      </p>

      <div>
        <BrokenCartDemo />
        <CartApp />
        <CartPage />
        <RowStateDemo />
        <SneakyDemo />
      </div>

      <Summary
        items={[
          <><code>useState</code> 는 <strong>컴포넌트마다 따로</strong> 만들어집니다. 같은 값을 각자 가지면 어긋납니다.</>,
          <>두 컴포넌트가 같은 값을 봐야 하면 그 값을 <strong>가장 가까운 공통 부모</strong>로 옮깁니다. 이것이 state 끌어올리기입니다.</>,
          <>부모는 <code>props</code> 로 내려보내고, 자식은 받은 것을 그리기만 합니다.</>,
          <>값이 한 곳뿐이므로 <strong>어긋날 방법이 없습니다.</strong> 맞추는 코드가 필요 없습니다.</>,
          <>한 컴포넌트만 쓰는 값(펼침 여부 같은 것)은 <strong>올리지 않습니다.</strong> 필요해질 때 올리면 됩니다.</>,
          <><code>props</code> 는 읽기 전용입니다. 자식이 고치면 에러 없이 부모 데이터만 오염됩니다.</>,
          "자식 안의 버튼으로 부모 값을 바꾸는 방법은 개념04에서 배웁니다.",
        ]}
      />
    </div>
  );
}

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 같은 값을 두 컴포넌트가 각자 state 로 갖기 — 섹션 1의 데모 ① 입니다
//   실수: 에러가 안 납니다. 두 화면이 서로 다른 값을 보여 줄 뿐입니다.
//         "여기는 3개인데 저기는 1개" 라면 이 실수입니다.

// [실수 2] props 로 받은 값을 자식의 state 초기값으로 복사하기
//   const [myItems, setMyItems] = useState(items);
//   실수: useState 의 초기값은 '처음 한 번' 만 쓰입니다.
//         부모의 items 가 바뀌어도 자식의 myItems 는 그대로입니다.
//         이 실수는 개념05에서 화면으로 재현해 봅니다.

// [실수 3] props 이름을 잘못 적기
//   <CartList item={items} />        ← items 가 아니라 item 이라고 씀
//   실수: 자식에서 items 는 undefined 가 됩니다.
//         undefined.map(...) 이 되어 "Cannot read properties of undefined" 에러가 납니다.
//         에러 문구에 나온 이름이 props 이름과 같은지부터 확인하세요.

// [실수 4] 값을 넘길 때 중괄호를 빠뜨리기
const countExample = 3;
console.log(typeof countExample);
// 콘솔: number
console.log(typeof "countExample");
// 콘솔: string
// 실수: <CartCount count="count" /> 라고 쓰면 숫자가 아니라 "count" 라는 글자가 갑니다.
//       에러는 안 나고 화면에 이상한 글자가 나옵니다.
//       값을 넘길 때는 중괄호가 필요합니다(02단원 개념03).

// [실수 5] 자식에서 props 를 고치기 — 섹션 5의 데모 ⑤ 입니다
//   실수: 에러가 안 납니다. 부모 데이터만 조용히 오염됩니다.

// [실수 6] 컴포넌트를 다른 컴포넌트 '안에서' 만들기 → 잘 돌아가는 것처럼 보임
//   function CartApp() {
//     function CartList() { ... }    ← 부모 함수 안에 만들면
//     ...
//   }
//   실수: 부모가 다시 그려질 때마다 CartList 가 '새 컴포넌트' 로 취급됩니다.
//         그 안의 state 가 매번 처음 값으로 돌아갑니다.
//         컴포넌트는 항상 맨 바깥에 만드세요.

// [실수 7] JSX 에서 태그를 안 닫기 → [SyntaxError]
//   <CartList items={items}
//   실수: 스스로 닫는 태그는 /> 로 닫아야 합니다(02단원 개념04).
//         파일 전체가 안 돌아갑니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 목록은 4줄(아메리카노 + 라떼 3줄)이고 '담긴 개수' 는 1개입니다.
//    // 화면: 아메리카노 · 라떼 · 라떼 · 라떼 / 담긴 개수: 1개
//    → 두 컴포넌트가 서로 다른 state 를 보고 있어서 그렇습니다.
//
// 2) <CartList items={items} />
//    <CartCount items={items} />
//    <CartCount items={items} />     ← 한 줄 더
//    // 화면(누르면): 개수 줄 두 개가 동시에 2개 → 3개가 됩니다.
//    → 값이 하나이므로 몇 곳에서 보든 항상 같습니다.
//
// 3) function CartBody({ items }) {
//      return (
//        <div>
//          <CartList items={items} />
//          <CartCount items={items} />
//        </div>
//      );
//    }
//    // 화면(누르면): 위쪽 헤더와 아래쪽 개수가 같이 2개가 됩니다.
//    → CartBody 는 items 를 화면에 안 쓰지만 아래로 넘겨야 하므로 props 로 받습니다.
//
// 4) 두 줄 다 설명이 펼쳐진 채로 시작합니다.
//    // 화면: 두 줄 모두 '설명 닫기' 버튼과 설명이 보입니다.
//    → 컴포넌트를 두 번 썼으니 state 도 두 개 생기고, 둘 다 초기값 true 입니다.
//      각자의 값이라 하나를 닫아도 다른 하나는 그대로입니다.
//
// 5) 목록이 "아메리카노" 한 줄 그대로입니다.
//    // 화면: 아메리카노 — 4000원
//    → push 를 지웠으니 부모 배열이 오염되지 않았습니다.
//      화면이 안 바뀌는 건 같지만, 데이터가 깨끗하다는 점이 다릅니다.
