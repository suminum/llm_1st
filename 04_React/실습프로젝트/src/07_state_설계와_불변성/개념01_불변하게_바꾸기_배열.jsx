// ============================================================
// 07단원 · 개념 01 — 불변하게 바꾸기: 배열
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 06단원 개념05에서 입력한 값을 목록에 담을 때 이렇게 썼습니다.
//
//     setItems([...items, 새것]);
//
// 그때 "왜 이렇게 써야 하는지는 07단원에서 설명합니다" 라고 넘어갔습니다.
// 이제 그 약속을 지킬 차례입니다.
//
// JS자료 06단원에서는 배열에 값을 넣을 때 push 를 썼습니다.
//
//     cart.push("아메리카노");
//
// React 에서 이렇게 하면 어떻게 될까요? 에러가 날까요?
// 에러는 안 납니다. 그런데 화면도 안 바뀝니다.
// 이 파일은 그것부터 직접 보는 데서 시작합니다.
//
// ★ 이 파일에서 배우는 '추가 · 삭제 · 수정' 세 가지 형태는
//   13단원 종합 프로젝트까지 계속 씁니다. 여기서 손에 익혀 두세요.

// ── 섹션 1: push 로 담으면 화면이 안 바뀝니다 ──

// 아래 컴포넌트는 JS자료에서 배운 대로 push 를 씁니다.
// 그리고 바뀐 배열을 set 함수에 그대로 넣습니다. 자연스러워 보입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function WrongPushDemo() {
  const [items, setItems] = useState(["아메리카노"]);

  // 이 state 는 "화면을 억지로 다시 그리게 하는" 용도로만 씁니다.
  // 섹션 1의 마지막에서 왜 필요한지 설명합니다.
  const [redrawCount, setRedrawCount] = useState(0);

  // 컴포넌트 몸통에 적은 console.log 는 '화면을 그릴 때마다' 찍힙니다.
  // 04단원 개념03에서 렌더링 횟수를 세어 볼 때 쓴 방법입니다.
  console.log("[데모①] 화면을 그렸습니다. 지금 items.length:", items.length);
  // 콘솔: [데모①] 화면을 그렸습니다. 지금 items.length: 1
  // 콘솔: [데모①] 화면을 그렸습니다. 지금 items.length: 1
  // ↑ 개발 중에는 같은 줄이 두 번 찍힙니다(09단원 개념02에서 설명).

  function handleWrongAdd() {
    items.push("케이크"); // ← JS자료 06단원에서 배운 방법
    setItems(items); // ← 바뀐 배열을 그대로 넣습니다

    console.log("[잘못된 방법] push 뒤 items.length:", items.length);
    // 콘솔: [잘못된 방법] push 뒤 items.length: 2
    console.log("[잘못된 방법] 배열 안의 값:", items.join(", "));
    // 콘솔: [잘못된 방법] 배열 안의 값: 아메리카노, 케이크
  }

  return (
    <div className="demo">
      <h3>① push 로 담기 — 일부러 고장 난 예제</h3>
      <button onClick={handleWrongAdd}>케이크 담기 (push)</button>
      <button onClick={() => setRedrawCount(redrawCount + 1)}>
        화면 강제로 다시 그리기
      </button>
      <div className="output">담긴 개수: {items.length}</div>
      <ul>
        {items.map((item, index) => (
          // 이 목록은 뒤에만 붙습니다. 순서가 안 바뀌므로
          // index 를 key 로 써도 05단원에서 본 문제가 생기지 않습니다.
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// 데모 ① 의 '케이크 담기 (push)' 를 세 번 눌러 보세요.
//
// 화면(누르면): 아무것도 안 바뀝니다. "담긴 개수: 1" 그대로,
//               목록도 "아메리카노" 한 줄 그대로입니다.
//
// 그런데 콘솔은 다릅니다.
//   [잘못된 방법] push 뒤 items.length: 2
//   [잘못된 방법] push 뒤 items.length: 3
//   [잘못된 방법] push 뒤 items.length: 4
//
// 배열은 분명히 늘어났습니다. 화면만 그대로입니다.
//
// 콘솔을 더 자세히 보세요. "[데모①] 화면을 그렸습니다" 는
// 페이지를 열 때 찍히고, 버튼을 아무리 눌러도 더는 안 찍힙니다.
// (처음에 같은 줄이 두 번 나오는 것은 개발 중 설정 때문입니다 — 09단원 개념02.
//  여기서 볼 것은 '그 뒤로 안 늘어난다' 는 쪽입니다)
// React 가 화면을 다시 그리는 일 자체를 하지 않은 것입니다.
//
// 이제 '화면 강제로 다시 그리기' 를 눌러 보세요.
// 이 버튼은 items 와 아무 상관 없는 다른 state 를 바꿉니다.
// 그것 때문에 컴포넌트가 다시 실행되고, 그제서야
//
// 화면(누르면): 담긴 개수: 4 / 아메리카노 · 케이크 · 케이크 · 케이크
//
// 가 한꺼번에 나타납니다.
//
// 이것이 이 예제의 핵심입니다.
//   · 데이터는 진짜로 바뀌어 있었습니다.
//   · 에러도 경고도 안 났습니다.
//   · 그런데 화면만 안 바뀌었습니다.
//
// 에러가 나면 오히려 고치기 쉽습니다. 이건 조용히 틀립니다.
// 초보자가 "React 가 이상하다" 고 느끼는 순간의 대부분이 이것입니다.

// ✏️ 직접 해보기 1 — 데모 ① 의 '케이크 담기 (push)' 를 두 번 누른 뒤,
//                    '화면 강제로 다시 그리기' 를 한 번 누르세요.
//                    화면의 '담긴 개수' 가 몇으로 나오는지 확인하세요.

// ── 섹션 2: React 는 "같은 것인가" 로 판단합니다 ──

// 왜 화면을 안 그렸을까요? React 의 판단 기준이 이렇기 때문입니다.
//
//     "새로 받은 값이 전에 갖고 있던 값과 같은 것인가?"
//       같다  → 바뀐 게 없다. 다시 그릴 필요 없다. 아무 일도 안 한다.
//       다르다 → 바뀌었다. 컴포넌트를 다시 실행해서 화면을 새로 그린다.
//
// 여기서 '같은 것' 의 뜻이 중요합니다.
// 배열과 객체는 '내용이 같은가' 가 아니라 '같은 물건인가' 로 비교합니다.
// JS자료 09단원에서 본 이야기입니다. 콘솔로 다시 확인해 봅시다.

const listA = ["아메리카노", "케이크"];
const listB = listA; // 이름표만 하나 더 붙인 것
const listC = [...listA]; // 내용은 같지만 새로 만든 배열

console.log(listA === listB);
// 콘솔: true
console.log(listA === listC);
// 콘솔: false

// listC 는 내용이 똑같은데도 false 입니다.
// 같은 물건이 아니라 '똑같이 생긴 다른 물건' 이기 때문입니다.
//
// 비유하면 이렇습니다.
//   listA 와 listB 는 하나의 상자에 이름표 두 개를 붙인 것입니다.
//   listC 는 안에 든 것이 똑같은 새 상자입니다.
//
// 비유는 여기까지입니다. 실제로 일어나는 일은 이렇습니다.
//   배열을 변수에 넣으면 변수에는 '그 배열이 있는 자리' 가 저장됩니다.
//   listB = listA 는 그 자리를 그대로 베낀 것이라 결국 한 배열입니다.
//   [...listA] 는 값을 하나씩 꺼내 새 배열을 만든 것이라 자리가 다릅니다.

// push 는 상자 안에 물건을 하나 더 넣는 일입니다. 상자 자체는 그대로입니다.
listB.push("라떼");

console.log(listA.length);
// 콘솔: 3
console.log(listA.join(", "));
// 콘솔: 아메리카노, 케이크, 라떼
console.log(listA === listB);
// 콘솔: true

// listB 에 넣었는데 listA 도 늘었습니다. 애초에 한 배열이니 당연합니다.
// 그리고 push 한 뒤에도 listA === listB 는 여전히 true 입니다.
//
// 섹션 1에서 벌어진 일이 정확히 이것입니다.
//
//     items.push("케이크");   ← 안에 든 것만 바뀜. 배열 자체는 같은 것
//     setItems(items);        ← React: "전이랑 같은 배열이네. 할 일 없음"
//
// React 는 배열을 하나하나 열어 보지 않습니다. 그건 값이 많을 때 너무 느립니다.
// 대신 '같은 것인지' 만 한 번 비교합니다. 그래서 아주 빠릅니다.
// 그 대신 우리가 지켜야 할 약속이 하나 생깁니다.
//
//     ★ state 를 바꿀 때는 원래 것을 고치지 말고 '새것' 을 만들어서 넣는다.
//
// 이것을 '불변하게 다룬다' 고 합니다. 이 단원의 제목이기도 합니다.

// ✏️ 직접 해보기 2 — 아래 두 줄의 결과를 먼저 예상한 뒤 콘솔로 확인하세요.
//                    const x = [1, 2];
//                    console.log(x === [1, 2]);

// ── 섹션 3: 추가 — [...items, 새것] ──

// 이제 제대로 된 방법입니다. 새 배열을 만들어서 넣습니다.
//
//     setCart([...cart, 새것]);
//
// JS자료 09단원 개념03 섹션6에서 본 그 문법입니다.
// 대괄호를 새로 열었으니 결과는 반드시 '새 배열' 입니다.

// 항목마다 붙일 번호입니다. 화면에 보이는 값이 아니므로 state 가 아니어도 됩니다.
// (04단원에서 본 것처럼 그냥 변수는 바뀌어도 화면을 다시 그리지 않습니다.
//  여기서는 그게 오히려 알맞습니다. 번호는 화면에 안 나오니까요.)
let nextCartId = 3;

function AddDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "아메리카노", price: 4000 },
    { id: 2, name: "케이크", price: 6000 },
  ]);

  function handleAdd(menuName, menuPrice) {
    const nextCart = [...cart, { id: nextCartId, name: menuName, price: menuPrice }];
    nextCartId = nextCartId + 1;

    console.log("[담기] 새 배열인가?", nextCart !== cart);
    // 콘솔: [담기] 새 배열인가? true

    setCart(nextCart);
  }

  return (
    <div className="demo">
      <h3>② 담기 — 스프레드로 새 배열 만들기</h3>
      <button onClick={() => handleAdd("라떼", 4500)}>라떼 담기</button>
      <button onClick={() => handleAdd("삼각김밥", 1200)}>삼각김밥 담기</button>
      <div className="output">담긴 개수: {cart.length}</div>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} — {item.price}원
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): '라떼 담기' 를 누르면 목록에 "라떼 — 4500원" 이 바로 붙고
//               '담긴 개수' 도 2 에서 3 으로 올라갑니다.
//
// 데모 ① 과 딱 한 줄이 다릅니다.
//
//     items.push("케이크"); setItems(items);      ← 안 됨
//     setCart([...cart, 새것]);                    ← 됨
//
// 앞은 '같은 배열의 안을 고친 것' 이고, 뒤는 '새 배열을 만든 것' 입니다.
//
// 여기서는 항목을 객체로 만들었습니다. { id, name, price } 세 가지를 담습니다.
// id 를 따로 두는 이유는 두 가지입니다.
//   · 05단원에서 배운 key 로 쓰기 위해서
//   · 섹션 4·5에서 "어느 항목인지" 를 가리키기 위해서
// 같은 메뉴를 두 번 담아도 id 는 다르므로 서로 구별됩니다.
//
// 앞에 붙이고 싶으면 순서만 바꾸면 됩니다.
//     setCart([새것, ...cart]);

// ✏️ 직접 해보기 3 — AddDemo 의 return 안에 버튼을 하나 더 만들어
//                    "아메리카노" 4000원을 담을 수 있게 하세요.

// ✏️ 직접 해보기 4 — handleAdd 의 첫 줄을 아래처럼 바꾸고 눌러 보세요.
//                    const nextCart = cart;
//                    nextCart.push({ id: nextCartId, name: menuName, price: menuPrice });
//                    화면이 어떻게 되는지, 콘솔의 '새 배열인가?' 가 무엇으로
//                    바뀌는지 확인한 뒤 원래대로 되돌리세요.

// ── 섹션 4: 삭제 — filter ──

// JS자료 06단원에서 배열에서 값을 뺄 때 splice 를 썼습니다.
// splice 도 push 와 마찬가지로 원본을 바꿉니다. 그래서 React 에서는 안 씁니다.
//
// 대신 filter 를 씁니다. filter 는 조건에 맞는 것만 골라
// '새 배열' 을 돌려줍니다(JS자료 08단원). 원본은 건드리지 않습니다.
//
//     setCart(cart.filter((item) => item.id !== 지울id));
//
// 읽는 법: "id 가 지울 id 와 다른 것만 남긴 새 배열"
// 지울 것을 고르는 게 아니라 '남길 것' 을 고른다는 점이 헷갈리기 쉽습니다.

function RemoveDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "아메리카노", price: 4000 },
    { id: 2, name: "케이크", price: 6000 },
    { id: 3, name: "라떼", price: 4500 },
  ]);

  function handleRemove(targetId) {
    const nextCart = cart.filter((item) => item.id !== targetId);

    console.log("[빼기] 지운 뒤 개수:", nextCart.length, "/ 원본 개수:", cart.length);
    // 콘솔: [빼기] 지운 뒤 개수: 2 / 원본 개수: 3
    console.log("[빼기] filter 가 돌려준 것은 새 배열인가?", nextCart !== cart);
    // 콘솔: [빼기] filter 가 돌려준 것은 새 배열인가? true

    setCart(nextCart);
  }

  return (
    <div className="demo">
      <h3>③ 빼기 — filter 로 새 배열 만들기</h3>
      {cart.length === 0 ? (
        <div className="output">장바구니가 비었습니다</div>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.name}
              <button onClick={() => handleRemove(item.id)}>빼기</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 화면(누르면): '케이크' 옆 빼기를 누르면 그 줄만 사라집니다.
//               전부 빼면 "장바구니가 비었습니다" 가 나옵니다(05단원 개념05).
//
// 콘솔의 '지운 뒤 개수: 2 / 원본 개수: 3' 을 눈여겨보세요.
// filter 를 부른 뒤에도 원본 cart 는 여전히 3개입니다. 원본을 안 건드립니다.
// splice 였다면 원본 개수도 함께 2 로 줄어듭니다.
//
// 버튼에 () => handleRemove(item.id) 로 감싼 이유가 기억나시나요?
// onClick={handleRemove(item.id)} 라고 쓰면 화면을 그리는 순간 실행됩니다.
// 04단원 개념01에서 본 "괄호를 붙이면 안 되는 이유" 입니다.
// 인자를 넘겨야 할 때는 이렇게 화살표 함수로 감쌉니다.

// ✏️ 직접 해보기 5 — handleRemove 의 !== 를 === 로 바꿔서 눌러 보세요.
//                    화면이 어떻게 되는지 보고 원래대로 되돌리세요.

// ── 섹션 5: 수정 — map ──

// 목록 안의 항목 하나만 고치고 싶을 때가 있습니다.
// 장바구니라면 수량 늘리기, 할일목록이라면 완료 표시입니다.
//
// 이때는 map 을 씁니다. map 도 새 배열을 돌려줍니다(JS자료 08단원).
//
//     setCart(cart.map((item) => (item.id === 고칠id ? 고친것 : item)));
//
// 읽는 법: "고칠 id 면 고친 것으로, 아니면 원래 것 그대로"
// 고칠 것 하나만 새로 만들고 나머지는 그대로 둡니다.
//
// '고친 것' 은 이렇게 만듭니다.
//
//     { ...item, qty: item.qty + 1 }
//
// JS자료 09단원 개념04 섹션5에서 배운 조합입니다.
// "item 을 복사해서 qty 만 바꾼 새 객체" 라는 뜻입니다.
// 객체 state 자체를 다루는 이야기는 다음 파일(개념02)에서 자세히 합니다.

function UpdateDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "아메리카노", price: 4000, qty: 1 },
    { id: 2, name: "케이크", price: 6000, qty: 1 },
  ]);

  function handlePlus(targetId) {
    const nextCart = cart.map((item) =>
      item.id === targetId ? { ...item, qty: item.qty + 1 } : item
    );

    // 누른 줄과 안 누른 줄이 각각 어떻게 되었는지 확인합니다.
    // find 는 조건에 맞는 첫 항목을 돌려줍니다(JS자료 08단원 개념04).
    const beforeItem = cart.find((item) => item.id === targetId);
    const afterItem = nextCart.find((item) => item.id === targetId);

    console.log("[수량] 누른 줄은 새 객체인가?", afterItem !== beforeItem);
    // 콘솔: [수량] 누른 줄은 새 객체인가? true

    const otherBefore = cart.filter((item) => item.id !== targetId);
    const otherAfter = nextCart.filter((item) => item.id !== targetId);

    console.log("[수량] 안 누른 줄은 그대로인가?", otherAfter[0] === otherBefore[0]);
    // 콘솔: [수량] 안 누른 줄은 그대로인가? true

    setCart(nextCart);
  }

  return (
    <div className="demo">
      <h3>④ 수량 늘리기 — map 으로 한 줄만 바꾸기</h3>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} {item.qty}개
            <button onClick={() => handlePlus(item.id)}>+1</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노 옆 +1 을 누르면 "아메리카노 2개" 가 됩니다.
//               케이크 줄은 그대로입니다.
//
// 콘솔 두 줄이 map 이 하는 일을 그대로 보여 줍니다.
//   누른 줄은 새 객체가 되었고,
//   안 누른 줄은 원래 객체를 그대로 다시 썼습니다.
// 목록 전체를 새로 만드는 것이 아니라, 필요한 줄만 새로 만드는 것입니다.
// 물론 목록(배열) 자체는 map 이 새로 만들어 주므로 화면은 다시 그려집니다.
//
// ★ 여기까지가 이 파일의 핵심 세 줄입니다. 외우려 하지 말고 형태를 익히세요.
//
//   추가   setCart([...cart, 새것])
//   삭제   setCart(cart.filter((item) => item.id !== 지울id))
//   수정   setCart(cart.map((item) => (item.id === 고칠id ? { ...item, 바꿀것 } : item)))
//
// 13단원 종합 프로젝트의 할일목록과 장바구니가 이 세 줄로 굴러갑니다.

// ✏️ 직접 해보기 6 — UpdateDemo 에 '-1' 버튼을 만들어 수량을 1 줄이세요.
//                    (수량이 0 아래로 내려가는 것은 신경 쓰지 않아도 됩니다)

// ── 섹션 6: 원본을 바꾸는 메소드와 안 바꾸는 메소드 ──

// 지금까지 배운 배열 메소드는 두 종류로 나뉩니다.
// React 에서는 이 구분이 아주 중요합니다.
//
//   [원본을 바꾼다 — state 에 그냥 쓰면 안 됨]
//     push · pop · unshift · shift · splice · sort · reverse
//
//   [새 배열을 돌려준다 — 그대로 써도 됨]
//     map · filter · slice · concat · [...배열]
//
// 외우기 어렵다면 이렇게 확인하세요.
// 그 메소드의 결과를 변수에 담아 쓰는지, 아니면 부르는 것만으로 끝나는지 봅니다.
//     const 결과 = 배열.filter(...)   → 결과를 받아 쓴다. 새 배열이다.
//     배열.push(...)                   → 결과를 안 받는다. 원본을 고친 것이다.
//
// sort 가 특히 함정입니다. 정렬은 '보기 좋게 바꾸는 일' 같아서
// 원본을 바꾼다는 생각이 잘 안 듭니다. 하지만 바꿉니다.
// 그래서 항상 복사한 뒤에 정렬합니다.

const priceList = [6000, 4000, 4500];

const sortedCopy = [...priceList].sort((a, b) => a - b);
console.log(sortedCopy.join(", "));
// 콘솔: 4000, 4500, 6000
console.log(priceList.join(", "));
// 콘솔: 6000, 4000, 4500

// [...priceList] 로 새 배열을 만든 다음 그것을 정렬했습니다.
// 원본 priceList 는 그대로입니다.

function SortDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "케이크", price: 6000 },
    { id: 2, name: "아메리카노", price: 4000 },
    { id: 3, name: "라떼", price: 4500 },
  ]);

  function handleSort() {
    // [...cart] 를 빼먹으면 원본 배열을 정렬한 뒤 그것을 다시 넣게 됩니다.
    // 그러면 섹션 1과 똑같은 일이 벌어집니다. 화면이 안 바뀝니다.
    const sorted = [...cart].sort((a, b) => a.price - b.price);
    setCart(sorted);
  }

  return (
    <div className="demo">
      <h3>⑤ 정렬 — 복사한 뒤에 sort</h3>
      <button onClick={handleSort}>싼 것부터 정렬</button>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} — {item.price}원
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노 4000 → 라떼 4500 → 케이크 6000 순서로 바뀝니다.

// ✏️ 직접 해보기 7 — handleSort 의 [...cart] 를 cart 로 바꿔서 눌러 보세요.
//                    화면이 어떻게 되는지 확인한 뒤 되돌리세요.

// ------------------------------------------------------------
// 위에서 만든 데모 다섯 개를 화면에 붙입니다.
// 01단원에서 본 createRoot / render 두 줄입니다.
// ------------------------------------------------------------

export default function Concept01() {
  return (
    <div>
      <h1>개념 01 — 불변하게 바꾸기: 배열</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        이 파일의 데모 ① 은 <strong>일부러 고장 난 예제</strong>입니다. 버튼을 눌러도 화면이 안 바뀌는 것이 정상입니다. 왜 그런지가 이 단원의 시작입니다.
      </p>

      <div>
        <WrongPushDemo />
        <AddDemo />
        <RemoveDemo />
        <UpdateDemo />
        <SortDemo />
      </div>

      <Summary
        items={[
          <>React 는 <strong>이전 값과 같은 것인지</strong>로 다시 그릴지 정합니다. 내용을 하나하나 비교하지 않습니다.</>,
          <>그래서 <code>push</code> 로 배열 안을 고치고 같은 배열을 넣으면 <strong>에러 없이 화면만 안 바뀝니다.</strong></>,
          <>추가는 <code>setCart([...cart, 새것])</code></>,
          <>삭제는 <code>setCart(cart.filter((item) =&gt; item.id !== 지울id))</code></>,
          <>수정은 <code>setCart(cart.map((item) =&gt; (item.id === 고칠id ? {"{"} ...item, 바꿀것 {"}"} : item)))</code></>,
          <><code>sort</code>·<code>reverse</code>·<code>splice</code> 는 원본을 바꿉니다. <code>[...cart]</code> 로 복사한 뒤에 쓰세요.</>,
          "이 세 가지 형태는 13단원 종합 프로젝트까지 계속 씁니다.",
        ]}
      />
    </div>
  );
}

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] push 한 뒤 같은 배열을 넣기 — 섹션 1의 데모 ① 입니다
//   실수: 에러도 경고도 안 납니다. 화면만 조용히 안 바뀝니다.
//         "버튼이 안 먹는다" 싶으면 이것부터 의심하세요.

// [실수 2] 스프레드를 빼먹기
const cartExample = ["아메리카노", "케이크"];
console.log([cartExample, "라떼"].length);
// 콘솔: 2
console.log([...cartExample, "라떼"].length);
// 콘솔: 3
// 실수: ... 을 빼면 배열 안에 배열이 통째로 들어갑니다. 길이가 2 입니다.
//       화면에는 목록이 이상하게 한 줄만 나오거나 아무것도 안 나옵니다.

// [실수 3] sort · reverse 를 state 에 바로 쓰기
//   setCart(cart.sort(...));      ← cart 를 정렬한 뒤 같은 배열을 넣음
//   setCart(cart.reverse());      ← 마찬가지
//   실수: 화면이 안 바뀝니다. sort 와 reverse 는 원본을 바꾸고
//         '자기 자신' 을 돌려주기 때문입니다. [...cart] 를 앞에 붙이세요.

// [실수 4] filter 의 조건을 반대로 쓰기
const idList = [1, 2, 3];
console.log(idList.filter((id) => id !== 2).join(", "));
// 콘솔: 1, 3
console.log(idList.filter((id) => id === 2).join(", "));
// 콘솔: 2
// 실수: filter 는 '남길 것' 을 고릅니다. === 로 쓰면 지우려던 것만 남습니다.
//       화면에서 하나를 지웠는데 그것만 남으면 이 실수입니다.

// [실수 5] map 에서 안 고칠 항목을 안 돌려주기
const qtyList = [{ id: 1, qty: 1 }, { id: 2, qty: 1 }];
const brokenList = qtyList.map((item) => {
  if (item.id === 1) {
    return { ...item, qty: 2 };
  }
});
console.log(brokenList[1]);
// 콘솔: undefined
// 실수: else 쪽에서 아무것도 안 돌려주면 그 자리가 undefined 가 됩니다.
//       화면에는 "Cannot read properties of undefined" 에러가 납니다.
//       삼항 연산자로 쓰면 이 실수를 하기 어렵습니다.

// [실수 6] 대괄호 안에서 쉼표를 빼먹기 → [SyntaxError]
//   setCart([...cart "라떼"]);
//   실수: ... 뒤에 쉼표가 필요합니다. 파일 전체가 안 돌아갑니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 담긴 개수: 3 이 됩니다.
//    // 화면: 담긴 개수: 3 / 아메리카노 · 케이크 · 케이크
//    → push 두 번은 배열을 진짜로 늘렸습니다. 화면만 늦게 따라온 것입니다.
//      '늦게 따라왔다' 는 말이 무섭게 들린다면 맞습니다. 그래서 안 씁니다.
//
// 2) const x = [1, 2];
//    console.log(x === [1, 2]);
//    // 콘솔: false
//    → 내용은 같지만 오른쪽은 그 자리에서 새로 만든 다른 배열입니다.
//      배열끼리의 === 는 내용을 안 봅니다.
//
// 3) <button onClick={() => handleAdd("아메리카노", 4000)}>아메리카노 담기</button>
//    // 화면(누르면): 목록에 "아메리카노 — 4000원" 이 한 줄 더 생깁니다.
//    → 이미 있는 아메리카노와 이름이 같아도 id 가 다르므로 따로 그려집니다.
//
// 4) 화면이 안 바뀝니다. '담긴 개수: 2' 와 두 줄짜리 목록 그대로입니다.
//    // 콘솔: [담기] 새 배열인가? false
//    → nextCart 와 cart 가 같은 배열이 되어 버렸습니다. 섹션 1과 같은 상황입니다.
//      배열에는 진짜로 들어갔지만 React 가 그것을 알 방법이 없습니다.
//
// 5) 누른 것 하나만 남고 나머지가 전부 사라집니다.
//    // 화면(누르면): '케이크' 의 빼기를 누르면 케이크만 남습니다.
//    → filter 는 '남길 것' 을 고르는 것이기 때문입니다.
//
// 6) function handleMinus(targetId) {
//      setCart(cart.map((item) =>
//        item.id === targetId ? { ...item, qty: item.qty - 1 } : item
//      ));
//    }
//    그리고 return 안에 <button onClick={() => handleMinus(item.id)}>-1</button>
//    // 화면(누르면): "아메리카노 1개" 에서 -1 을 누르면 "아메리카노 0개"
//    → +1 과 부호만 다릅니다. map 의 형태는 똑같습니다.
//
// 7) 화면이 안 바뀝니다.
//    // 화면(누르면): 케이크 — 6000원 / 아메리카노 — 4000원 / 라떼 — 4500원
//    → sort 는 cart 를 그 자리에서 정렬하고 cart 자신을 돌려줍니다.
//      그래서 setCart 에 들어가는 것은 '전과 같은 배열' 입니다.
//      정렬은 이미 끝났는데 화면만 안 따라온 상태입니다.
//      데모 ① 처럼 다른 state 를 하나 바꿔 강제로 다시 그리게 하면
//      그때 정렬된 모습이 한꺼번에 나타납니다.
