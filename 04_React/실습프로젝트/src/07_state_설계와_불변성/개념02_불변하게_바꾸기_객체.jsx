// ============================================================
// 07단원 · 개념 02 — 불변하게 바꾸기: 객체
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01에서 배열 state 를 배웠습니다. 정리하면 이랬습니다.
//
//   · React 는 '전과 같은 것인지' 로 다시 그릴지 정한다
//   · 그래서 배열 안을 고치지 말고 새 배열을 만들어 넣는다
//
// 객체도 똑같습니다. 문법만 대괄호에서 중괄호로 바뀝니다.
//
//     배열   setCart([...cart, 새것])
//     객체   setUser({ ...user, name: "이서연" })
//
// 그런데 객체에는 배열에 없던 함정이 하나 더 있습니다.
// 객체 안에 객체가 들어 있을 때입니다.
// JS자료 09단원 개념04 섹션6에서 본 '얕은 복사' 이야기가 여기서 그대로 나옵니다.
// 그 함정을 화면으로 직접 보는 것이 이 파일의 목표입니다.

// ── 섹션 1: 객체 state 를 직접 고치면 화면이 안 바뀝니다 ──

// JS자료 07단원에서 객체의 값을 바꿀 때 이렇게 했습니다.
//
//     user.name = "이서연";
//
// React 에서 이렇게 하면 어떻게 될까요? 개념01의 push 와 같은 일이 벌어집니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

function WrongObjectDemo() {
  const [user, setUser] = useState({ name: "김민준", age: 20 });
  const [redrawCount, setRedrawCount] = useState(0);

  console.log("[데모①] 화면을 그렸습니다. 지금 이름:", user.name);
  // 콘솔: [데모①] 화면을 그렸습니다. 지금 이름: 김민준

  function handleWrongChange() {
    const beforeObject = user; // 고치기 전의 객체를 기억해 둡니다

    user.name = "이서연"; // ← JS자료 07단원에서 배운 방법
    setUser(user); // ← 고친 객체를 그대로 넣습니다

    console.log("[잘못된 방법] 고친 뒤 user.name:", user.name);
    // 콘솔: [잘못된 방법] 고친 뒤 user.name: 이서연
    console.log("[잘못된 방법] 전과 같은 객체인가?", beforeObject === user);
    // 콘솔: [잘못된 방법] 전과 같은 객체인가? true
  }

  return (
    <div className="demo">
      <h3>① 객체를 직접 고치기 — 일부러 고장 난 예제</h3>
      <button onClick={handleWrongChange}>이름을 이서연으로</button>
      <button onClick={() => setRedrawCount(redrawCount + 1)}>
        화면 강제로 다시 그리기
      </button>
      <div className="output">
        이름: {user.name} / 나이: {user.age}
      </div>
    </div>
  );
}

// 데모 ① 의 '이름을 이서연으로' 를 눌러 보세요.
//
// 화면(누르면): 안 바뀝니다. "이름: 김민준 / 나이: 20" 그대로입니다.
// 콘솔에는 "고친 뒤 user.name: 이서연" 이 찍힙니다.
//
// 그리고 '화면 강제로 다시 그리기' 를 누르면
//
// 화면(누르면): 이름: 이서연 / 나이: 20
//
// 이 됩니다. 개념01의 데모 ① 과 완전히 같은 상황입니다.
// 값은 진작 바뀌어 있었고, 화면만 안 따라온 것입니다.
//
// 콘솔의 "전과 같은 객체인가? true" 가 이유를 말해 줍니다.
// 속성을 고쳐도 객체 자체는 그대로입니다. 상자 안의 물건만 바꾼 것입니다.
// React 는 상자만 보고 "전과 같네" 하고 넘어갑니다.

// ✏️ 직접 해보기 1 — 데모 ① 에서 '이름을 이서연으로' 를 세 번 누른 뒤
//                    '화면 강제로 다시 그리기' 를 눌러 보세요.
//                    이름이 무엇으로 나오는지 확인하세요.

// ── 섹션 2: { ...user, 바꿀것 } 으로 새 객체 만들기 ──

// 제대로 된 방법은 이것입니다. JS자료 09단원 개념04에서 배운 문법 그대로입니다.
//
//     setUser({ ...user, name: "이서연" });
//
// 읽는 법: "user 를 통째로 펼쳐 놓고, name 만 새 값으로 덮어쓴 새 객체"
//
// 중괄호를 새로 열었으니 결과는 반드시 새 객체입니다.
// 콘솔로 먼저 확인해 봅시다.

const baseUser = { name: "김민준", age: 20 };
const changedUser = { ...baseUser, name: "이서연" };

console.log(changedUser);
// 콘솔: { name: '이서연', age: 20 }
console.log(baseUser);
// 콘솔: { name: '김민준', age: 20 }
console.log(baseUser === changedUser);
// 콘솔: false

// name 만 바뀌었고 age 는 따라왔습니다. 그리고 원본은 그대로입니다.
// 같은 이름을 뒤에 다시 쓰면 덮어쓴다는 규칙(JS자료 09단원 개념04 섹션3)입니다.

function ProfileDemo() {
  const [user, setUser] = useState({ name: "김민준", age: 20, city: "서울" });

  function handleRename() {
    setUser({ ...user, name: "이서연" });
  }

  function handleBirthday() {
    setUser({ ...user, age: user.age + 1 });
  }

  function handleMove() {
    // 두 가지를 한 번에 바꿀 수도 있습니다. 뒤에 나란히 적으면 됩니다.
    setUser({ ...user, city: "대구", age: user.age + 1 });
  }

  return (
    <div className="demo">
      <h3>② 스프레드로 한 속성만 바꾸기</h3>
      <button onClick={handleRename}>이름 바꾸기</button>
      <button onClick={handleBirthday}>나이 +1</button>
      <button onClick={handleMove}>대구로 이사(나이도 +1)</button>
      <div className="output">
        {user.name} / {user.age}살 / {user.city}
      </div>
    </div>
  );
}

// 화면(누르면): '이름 바꾸기' → 이서연 / 20살 / 서울
//               이어서 '나이 +1' → 이서연 / 21살 / 서울
//               이어서 '대구로 이사(나이도 +1)' → 이서연 / 22살 / 대구
//
// 안 건드린 속성은 그대로 따라옵니다. 그것이 ...user 가 하는 일입니다.

// ✏️ 직접 해보기 2 — ProfileDemo 에 '서울로 이사' 버튼을 만드세요.
//                    나이는 그대로 두고 city 만 "서울" 로 바꿉니다.

// ── 섹션 3: 스프레드를 빼먹으면 나머지가 사라집니다 ──

// 아주 흔한 실수입니다. 바꿀 속성만 적는 것입니다.
//
//     setUser({ name: "이서연" });
//
// 이렇게 하면 React 는 state 를 '합쳐 주지' 않습니다.
// state 는 통째로 갈아끼워집니다. age 와 city 는 사라집니다.
// 콘솔로 보면 이렇습니다.

console.log({ name: "이서연" });
// 콘솔: { name: '이서연' }

// age 도 city 도 없습니다. 우리가 안 적었으니 없는 게 당연합니다.
// 그런데 이 실수는 화면에서 잘 안 보입니다. 에러가 안 나기 때문입니다.
// 사라진 값 자리는 그냥 빈칸으로 나옵니다. 직접 봅시다.

function ReplaceDemo() {
  const [user, setUser] = useState({ name: "김민준", age: 20, city: "서울" });

  function handleWrongRename() {
    setUser({ name: "이서연" }); // ← ...user 를 빼먹었습니다
  }

  function handleRightRename() {
    setUser({ ...user, name: "이서연" });
  }

  function handleReset() {
    setUser({ name: "김민준", age: 20, city: "서울" });
  }

  return (
    <div className="demo">
      <h3>③ 스프레드를 빼먹으면 — 나머지가 사라집니다</h3>
      <button onClick={handleWrongRename}>이름만 적어서 바꾸기</button>
      <button onClick={handleRightRename}>스프레드로 바꾸기</button>
      <button onClick={handleReset}>처음으로</button>
      <div className="output">
        이름: {user.name} / 나이: {user.age} / 도시: {user.city}
      </div>
    </div>
  );
}

// 화면(누르면): '이름만 적어서 바꾸기' → 이름: 이서연 / 나이:  / 도시:
//               나이와 도시 자리가 빈칸이 됩니다.
//               '처음으로' 를 누른 뒤 '스프레드로 바꾸기' 를 누르면
// 화면(누르면): 이름: 이서연 / 나이: 20 / 도시: 서울
//
// 빈칸으로 나오는 이유는 없는 속성을 꺼내면 undefined 이고,
// React 는 undefined 를 화면에 아무것도 안 그리기 때문입니다(05단원).
// 그래서 에러 없이 조용히 값이 사라집니다.
//
// "왜 React 가 알아서 합쳐 주지 않나요?" 라고 생각할 수 있습니다.
// React 는 여러분의 state 에 무엇이 들어 있는지 모릅니다.
// 숫자일 수도, 문자열일 수도, 배열일 수도, 객체일 수도 있습니다.
// "객체면 합치고 아니면 갈아끼운다" 같은 특별 대우를 만들면
// 어떤 때 합쳐지고 어떤 때 안 합쳐지는지 매번 헷갈리게 됩니다.
// '받은 것을 그대로 새 값으로 삼는다' 는 규칙 하나가 훨씬 예측하기 쉽습니다.
//
// 합치는 일은 우리가 ...원본 한 조각으로 하면 되니까요.
//
// ★ 객체 state 를 바꿀 때는 항상 ...원본 부터 적고 시작하세요.
//   그러면 이 실수를 아예 안 하게 됩니다.

// ✏️ 직접 해보기 3 — handleWrongRename 을 고쳐서 나이와 도시가 남게 하세요.
//                    ...user 를 쓰지 말고, 세 속성을 손으로 다 적는 방법으로요.

// ── 섹션 4: 객체 안의 객체 — 얕은 복사의 함정 ──

// 지금까지는 속성 값이 전부 문자열이나 숫자였습니다.
// 값이 또 객체라면 이야기가 달라집니다.
//
//     const order = {
//       menu: "아메리카노",
//       option: { size: "M", ice: true },   ← 안에 객체가 또 있습니다
//     };
//
// { ...order } 는 '한 겹만' 복사합니다. JS자료 09단원 개념04 섹션6의 그 이야기입니다.
// 겉 객체는 새것이지만, option 은 원본과 '같은 객체' 를 가리킵니다.
// 콘솔로 확인해 봅시다.

const orderExample = { menu: "아메리카노", option: { size: "M", ice: true } };

const shallowCopy = { ...orderExample };
const deepCopy = { ...orderExample, option: { ...orderExample.option } };

console.log(shallowCopy === orderExample);
// 콘솔: false
console.log(shallowCopy.option === orderExample.option);
// 콘솔: true
console.log(deepCopy.option === orderExample.option);
// 콘솔: false

// 겉은 다른 객체인데(false) 안쪽 option 은 같은 객체입니다(true).
// 그래서 안쪽을 고치면 원본까지 같이 바뀝니다.

shallowCopy.option.size = "L";

console.log(orderExample.option.size);
// 콘솔: L
console.log(deepCopy.option.size);
// 콘솔: M

// shallowCopy 를 고쳤는데 orderExample 까지 L 이 되었습니다.
// 안쪽까지 새로 만든 deepCopy 만 M 을 지켰습니다.
//
// 이제 이 함정이 화면에서 어떻게 보이는지 봅시다.
// 주문 화면에 '임시저장' 기능이 있다고 해 봅시다.
// 임시저장은 지금 주문을 { ...order } 로 복사해 둡니다.

function SharedNestedDemo() {
  const [order, setOrder] = useState({
    menu: "아메리카노",
    option: { size: "M", ice: true },
  });
  const [saved, setSaved] = useState(null);

  function handleSave() {
    setSaved({ ...order }); // 겉만 복사해서 저장해 둡니다
  }

  function handleSizeWrong() {
    const next = { ...order };
    next.option.size = "L"; // ← 안쪽 객체를 직접 고쳤습니다
    setOrder(next);
  }

  function handleReset() {
    setOrder({ menu: "아메리카노", option: { size: "M", ice: true } });
    setSaved(null);
  }

  return (
    <div className="demo">
      <h3>④ 임시저장이 같이 바뀝니다 — 일부러 고장 난 예제</h3>
      <button onClick={handleSave}>임시저장</button>
      <button onClick={handleSizeWrong}>사이즈를 L 로 (안쪽을 직접 고침)</button>
      <button onClick={handleReset}>처음으로</button>
      <div className="output">지금 주문: {order.option.size} 사이즈</div>
      <div className="output">
        임시저장: {saved === null ? "아직 없음" : saved.option.size + " 사이즈"}
      </div>
    </div>
  );
}

// 순서대로 눌러 보세요. '임시저장' → '사이즈를 L 로'
//
// 화면(누르면): 임시저장 직후 — 지금 주문: M 사이즈 / 임시저장: M 사이즈
// 화면(누르면): 사이즈를 L 로 — 지금 주문: L 사이즈 / 임시저장: L 사이즈
//
// 임시저장해 둔 것까지 L 로 바뀌었습니다. 저장한 뜻이 사라졌습니다.
//
// 화면은 제대로 다시 그려졌다는 점을 눈여겨보세요.
// { ...order } 로 겉 객체를 새로 만들었으니 React 는 바뀐 걸 알아챕니다.
// 문제는 '어디까지 새로 만들었는가' 입니다.
// 겉만 새로 만들고 안쪽은 원본과 같은 객체를 그대로 물려줬습니다.
// 그 하나뿐인 option 객체를 고쳤으니 그것을 보고 있던 둘 다 바뀐 것입니다.

// ✏️ 직접 해보기 4 — 데모 ④ 에서 '처음으로' → '사이즈를 L 로' → '임시저장'
//                    순서로 눌러 보세요. 두 줄이 어떻게 나오는지 확인하세요.

// ── 섹션 5: 안쪽까지 새로 만들면 됩니다 ──

// 고치는 방법은 간단합니다. 바꾸려는 값까지 가는 길에 있는 객체를
// 전부 새로 만들면 됩니다.
//
//     setOrder({
//       ...order,
//       option: { ...order.option, size: "L" },
//     });
//
// 겉 객체도 새것, option 객체도 새것입니다.
// 원본의 option 은 아무도 안 건드렸으니 그대로 남습니다.

function SafeNestedDemo() {
  const [order, setOrder] = useState({
    menu: "아메리카노",
    option: { size: "M", ice: true },
  });
  const [saved, setSaved] = useState(null);

  function handleSave() {
    setSaved({ ...order }); // 저장 방식은 데모 ④ 와 똑같습니다
  }

  function handleSizeRight() {
    setOrder({
      ...order,
      option: { ...order.option, size: "L" },
    });
  }

  function handleIceToggle() {
    // 불리언 뒤집기도 같은 모양입니다(04단원 개념04의 토글).
    setOrder({
      ...order,
      option: { ...order.option, ice: !order.option.ice },
    });
  }

  function handleReset() {
    setOrder({ menu: "아메리카노", option: { size: "M", ice: true } });
    setSaved(null);
  }

  return (
    <div className="demo">
      <h3>⑤ 안쪽까지 새로 만들기 — 제대로 된 방법</h3>
      <button onClick={handleSave}>임시저장</button>
      <button onClick={handleSizeRight}>사이즈를 L 로</button>
      <button onClick={handleIceToggle}>얼음 켜기/끄기</button>
      <button onClick={handleReset}>처음으로</button>
      <div className="output">
        지금 주문: {order.option.size} 사이즈 / 얼음 {order.option.ice ? "있음" : "없음"}
      </div>
      <div className="output">
        임시저장: {saved === null ? "아직 없음" : saved.option.size + " 사이즈"}
      </div>
    </div>
  );
}

// 순서대로 눌러 보세요. '임시저장' → '사이즈를 L 로'
//
// 화면(누르면): 임시저장 직후 — 지금 주문: M 사이즈 / 임시저장: M 사이즈
// 화면(누르면): 사이즈를 L 로 — 지금 주문: L 사이즈 / 임시저장: M 사이즈
//
// 이번에는 임시저장한 것이 M 그대로입니다. 데모 ④ 와 저장 방식은 똑같은데
// 바꾸는 방법만 달랐습니다. 문제는 저장이 아니라 '안쪽을 직접 고친 것' 이었습니다.
//
// ★ 규칙 한 줄: 바꾸려는 값까지 가는 길에 있는 객체를 전부 새로 만든다.
//
// 이것을 '길 따라가기' 로 생각하면 쉽습니다.
//
//   바꿀 값        order.option.size
//   길             order → option → size
//   새로 만들 것   order, option    (마지막 size 는 값이라 그냥 넣습니다)
//
//     setOrder({
//       ...order,                        ← order 를 새로
//       option: {
//         ...order.option,               ← option 도 새로
//         size: "L",                     ← 여기가 진짜 바꾸는 곳
//       },
//     });
//
// 길이 한 칸 길어질 때마다 중괄호가 한 겹 늘어납니다. 그게 전부입니다.
//
//   order.option.size 를 바꾸려면 → order 도 새로, option 도 새로.
//   order.menu 를 바꾸려면 → order 만 새로 만들면 됩니다. 길이 짧으니까요.
//
// 세 겹, 네 겹이 되면 이 코드는 금방 길어집니다.
// 그럴 때는 state 구조를 얕게 바꾸는 것이 답입니다. 개념05에서 다룹니다.

// ✏️ 직접 해보기 5 — SafeNestedDemo 에 '메뉴를 라떼로' 버튼을 만드세요.
//                    menu 는 바깥에 있으니 option 까지 새로 만들 필요가 없습니다.

// ── 섹션 6: 배열 안의 객체 안의 객체 ──

// 실제 장바구니는 이렇게 생겼습니다. 배열 안에 객체, 그 안에 또 객체입니다.
//
//     [ { id: 1, name: "아메리카노", option: { size: "M" } }, ... ]
//
// 개념01의 map 과 이 파일의 중첩 스프레드를 합치면 됩니다.
//
//     setCart(cart.map((item) =>
//       item.id === 고칠id
//         ? { ...item, option: { ...item.option, size: "L" } }
//         : item
//     ));
//
// 길어 보이지만 새로 만든 것은 세 개뿐입니다. 배열 하나, 항목 하나, option 하나.
// 나머지 항목은 원래 객체를 그대로 다시 씁니다.

function CartOptionDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "아메리카노", option: { size: "M" } },
    { id: 2, name: "라떼", option: { size: "M" } },
  ]);

  function handleSizeUp(targetId) {
    const nextCart = cart.map((item) =>
      item.id === targetId
        ? { ...item, option: { ...item.option, size: "L" } }
        : item
    );

    console.log("[장바구니] 배열이 새것인가?", nextCart !== cart);
    // 콘솔: [장바구니] 배열이 새것인가? true

    const beforeOther = cart.filter((item) => item.id !== targetId);
    const afterOther = nextCart.filter((item) => item.id !== targetId);
    console.log("[장바구니] 안 누른 줄은 그대로인가?", afterOther[0] === beforeOther[0]);
    // 콘솔: [장바구니] 안 누른 줄은 그대로인가? true

    setCart(nextCart);
  }

  return (
    <div className="demo">
      <h3>⑥ 배열 + 객체 + 객체</h3>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} — {item.option.size} 사이즈
            <button onClick={() => handleSizeUp(item.id)}>L 로</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면(누르면): 아메리카노 옆 'L 로' 를 누르면
//               "아메리카노 — L 사이즈" 가 되고 라떼 줄은 그대로입니다.
//
// 13단원 종합 프로젝트의 장바구니가 정확히 이 모양입니다.

// ✏️ 직접 해보기 6 — handleSizeUp 을 흉내 내어 'M 으로' 버튼을 만드세요.
//                    누르면 그 항목만 M 사이즈로 돌아가야 합니다.

// ------------------------------------------------------------
// 위에서 만든 데모 여섯 개를 화면에 붙입니다.
// ------------------------------------------------------------

export default function Concept02() {
  return (
    <div>
      <h1>개념 02 — 불변하게 바꾸기: 객체</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        데모 ① 과 데모 ④ 는 <strong>일부러 고장 난 예제</strong>입니다. 이상하게 동작하는 것이 정상입니다.
      </p>

      <div>
        <WrongObjectDemo />
        <ProfileDemo />
        <ReplaceDemo />
        <SharedNestedDemo />
        <SafeNestedDemo />
        <CartOptionDemo />
      </div>

      <Summary
        items={[
          <>객체 state 도 배열과 같습니다. 속성을 직접 고치면 <strong>에러 없이 화면만 안 바뀝니다.</strong></>,
          <>바꿀 때는 <code>setUser({"{"} ...user, name: "이서연" {"}"})</code></>,
          <><code>...user</code> 를 빼먹으면 <strong>안 적은 속성이 사라집니다.</strong> React 는 state 를 합쳐 주지 않습니다.</>,
          <><code>{"{"} ...order {"}"}</code> 는 <strong>한 겹만</strong> 복사합니다. 안쪽 객체는 원본과 같은 것입니다(얕은 복사).</>,
          <>그래서 안쪽 값을 바꿀 때는 <code>{"{"} ...order, option: {"{"} ...order.option, size: "L" {"}"} {"}"}</code> 처럼 <strong>가는 길에 있는 객체를 전부 새로</strong> 만듭니다.</>,
          <>배열 안의 객체는 <code>map</code> 과 함께 씁니다. 안 바꾸는 항목은 원래 것을 그대로 씁니다.</>,
          "중첩이 세 겹을 넘으면 구조를 의심하세요. 개념05에서 다룹니다.",
        ]}
      />
    </div>
  );
}

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 속성을 직접 고치고 같은 객체를 넣기 — 섹션 1의 데모 ① 입니다
//   실수: 에러도 경고도 안 납니다. 화면만 조용히 안 바뀝니다.

// [실수 2] ...원본 을 빼먹기 — 섹션 3의 데모 ③ 입니다
//   실수: 안 적은 속성이 전부 사라집니다. 화면에는 빈칸으로 나옵니다.

// [실수 3] 안쪽 객체를 직접 고치기 — 섹션 4의 데모 ④ 입니다
//   실수: 화면은 바뀌는데, 같은 객체를 보고 있던 다른 곳까지 바뀝니다.
//         "왜 저기까지 바뀌지?" 싶으면 이 실수부터 의심하세요.

// [실수 4] 객체를 대괄호로 펼치기
//   setUser([...user, "이서연"]);
//   실수: TypeError: user is not iterable 이 납니다.
//         그 순간부터 화면이 안 그려집니다.
//         객체는 { ...객체 }, 배열은 [...배열] 입니다. 괄호만 다릅니다.
//         (JS자료 09단원 개념03 섹션8의 실수 3과 같은 것입니다)

// [실수 5] 새 값을 계산할 때 옛 값을 쓰는 것을 깜빡하기
const priceObject = { price: 4000 };
console.log({ ...priceObject, price: priceObject.price + 500 });
// 콘솔: { price: 4500 }
console.log({ ...priceObject, price: 500 });
// 콘솔: { price: 500 }
// 실수: 아래처럼 쓰면 더하는 게 아니라 500 으로 갈아끼웁니다.
//       "+1 을 눌렀는데 1 이 된다" 면 이 실수입니다.

// [실수 6] 중괄호 안에서 쉼표를 빼먹기 → [SyntaxError]
//   setUser({ ...user name: "이서연" });
//   실수: ...user 뒤에 쉼표가 필요합니다. 파일 전체가 안 돌아갑니다.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 이름: 이서연 / 나이: 20 이 됩니다.
//    // 화면: 이름: 이서연 / 나이: 20
//    → 세 번 다 같은 값을 넣었으므로 결과는 한 번 누른 것과 같습니다.
//      값은 첫 번째 클릭에서 이미 바뀌어 있었습니다.
//
// 2) function handleMoveToSeoul() {
//      setUser({ ...user, city: "서울" });
//    }
//    <button onClick={handleMoveToSeoul}>서울로 이사</button>
//    // 화면(누르면): 이름과 나이는 그대로, 도시만 서울이 됩니다.
//
// 3) setUser({ name: "이서연", age: user.age, city: user.city });
//    // 화면(누르면): 이름: 이서연 / 나이: 20 / 도시: 서울
//    → 이렇게도 됩니다. 다만 속성이 열 개면 열 줄을 적어야 하고,
//      나중에 속성이 하나 늘면 여기도 고쳐야 합니다.
//      그래서 ...user 를 씁니다.
//
// 4) 지금 주문: L 사이즈 / 임시저장: L 사이즈
//    → 이번엔 순서가 반대인데도 같이 L 입니다.
//      L 로 바꾸면서 안쪽 객체를 고쳤고, 그 뒤에 그 객체를 그대로 저장했으니
//      둘이 또 같은 객체를 보게 된 것입니다.
//      '처음으로' 를 누르면 새 객체를 넣으므로 다시 깨끗해집니다.
//
// 5) function handleMenuChange() {
//      setOrder({ ...order, menu: "라떼" });
//    }
//    <button onClick={handleMenuChange}>메뉴를 라떼로</button>
//    → menu 는 겉 객체의 속성이라 겉만 새로 만들면 됩니다.
//      화면에는 사이즈만 나오고 있으니 확인하려면
//      출력에 {order.menu} 를 한 번 넣어 보세요.
//
// 6) function handleSizeDown(targetId) {
//      setCart(cart.map((item) =>
//        item.id === targetId
//          ? { ...item, option: { ...item.option, size: "M" } }
//          : item
//      ));
//    }
//    <button onClick={() => handleSizeDown(item.id)}>M 으로</button>
//    // 화면(누르면): 누른 줄만 "M 사이즈" 로 돌아갑니다.
//    → 'L 로' 와 마지막 값만 다릅니다. 형태는 똑같습니다.
