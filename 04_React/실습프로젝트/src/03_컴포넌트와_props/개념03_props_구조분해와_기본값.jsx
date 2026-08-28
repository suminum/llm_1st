// ============================================================
// 03단원 · 개념 03 — props 구조분해와 기본값
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념02에서 props 를 이렇게 꺼냈습니다.
//
//     function MenuItem(props) {
//       return <p>{props.name} {props.price}원</p>;
//     }
//
// props 가 늘어나면 props. 를 계속 붙여야 합니다. 다섯 개면 다섯 번입니다.
// 이미 이 문제를 겪었고 해결책도 배웠습니다. JS자료 09단원 개념02입니다.
//
//     function introduce({ name, age, city }) { ... }
//
// React 에서는 이 문법을 거의 모든 컴포넌트에서 씁니다.
// 09단원에서 "React 를 배우면 매 줄 나옵니다" 라고 적었던 것이 바로 이것입니다.
//
// 이 파일에서 배우는 것
//   1. props 를 매개변수 자리에서 바로 꺼내기
//   2. 안 넘어왔을 때 쓸 기본값 정하기
//   3. 객체를 통째로 넘기고 안에서 꺼내기

// ── 섹션 1: props. 를 반복하지 않기 ──

// 먼저 순수한 자바스크립트로 09단원을 한 번 복습합시다.

import Summary from "../_ui/Summary.jsx";

const user = { name: "김민준", age: 20, city: "부산" };

// [구조분해 없이] user. 를 계속 붙입니다
function introduce1(person) {
  return `${person.name} / ${person.age}세 / ${person.city}`;
}

console.log(introduce1(user));
// 콘솔: 김민준 / 20세 / 부산

// [매개변수 자리에서 구조분해]
function introduce2({ name, age, city }) {
  return `${name} / ${age}세 / ${city}`;
}

console.log(introduce2(user));
// 콘솔: 김민준 / 20세 / 부산

// 결과가 같습니다. 함수 안이 짧아졌을 뿐입니다.
//
// 컴포넌트도 함수라고 했습니다. props 도 객체 하나라고 했습니다.
// 그러니 똑같이 하면 됩니다.

function MenuItemA(props) {
  return (
    <p>
      {props.name} — {props.price}원
    </p>
  );
}

function MenuItemB({ name, price }) {
  return (
    <p>
      {name} — {price}원
    </p>
  );
}

// 두 컴포넌트는 완전히 같은 일을 합니다. 쓰는 쪽도 똑같습니다.
//
//     <MenuItemA name="아메리카노" price={4000} />
//     <MenuItemB name="아메리카노" price={4000} />
//
// 화면 ① 에서 두 줄이 똑같이 나오는 것을 확인하세요.
//
// 넘기는 쪽은 하나도 바뀌지 않습니다. 받는 쪽 괄호 안만 바뀝니다.
// 그리고 매개변수만 봐도 "이 컴포넌트가 무엇을 받는지" 가 보입니다.
// 남이 만든 컴포넌트를 읽을 때 이 한 줄이 설명서 역할을 합니다.

// ✏️ 직접 해보기 1 — MenuItemB 를 고쳐서 "아메리카노 — 4000원 (뜨거움)" 처럼
//                    hot 이라는 props 도 함께 받아 화면에 찍어 보세요.
//                    (넘길 때는 hot="뜨거움" 으로 넘기면 됩니다)

// ── 섹션 2: 꺼내는 자리는 두 곳입니다 ──

// 구조분해는 매개변수 자리 말고 함수 안에서 해도 됩니다.
// JS자료 09단원 개념02 섹션1에서 하던 방식 그대로입니다.

function MenuItemC(props) {
  const { name, price } = props; // ← 함수 안에서 꺼내기

  return (
    <p>
      {name} — {price}원
    </p>
  );
}

// 세 가지 방법(A·B·C)이 전부 같은 결과를 냅니다.
//
//   A: props.name 을 그때그때        — props 가 한두 개일 때 편합니다
//   B: 매개변수 자리에서 { name }    — 가장 많이 씁니다
//   C: 함수 안에서 const { name }    — props 전체도 함께 써야 할 때 편합니다
//
// 무엇을 써도 틀리지 않습니다. 이 자료는 앞으로 B 를 주로 씁니다.

// ✏️ 직접 해보기 2 — MenuItemC 안에서 console.log(props) 를 찍어
//                    구조분해를 해도 props 객체는 그대로 있는지 확인하세요.

// ── 섹션 3: 기본값 — 안 넘어왔을 때 쓸 값 ──

// 개념02 섹션5에서 props 를 안 넘기면 undefined 라고 했습니다.
// 화면에는 아무것도 안 나왔습니다.
//
// 이럴 때 쓸 값을 미리 정해 둘 수 있습니다.
// 이것도 09단원 개념02 섹션3에서 배운 문법 그대로입니다.

function pickName({ name = "손님" }) {
  return name;
}

console.log(pickName({ name: "이서연" }));
// 콘솔: 이서연
console.log(pickName({}));
// 콘솔: 손님

// 값이 있으면 그 값을, 없으면 기본값을 씁니다.
//
// [주의] 기본값이 쓰이는 것은 undefined 일 때뿐입니다. 09단원에서 본 그대로입니다.

console.log(pickName({ name: null }));
// 콘솔: null
console.log(pickName({ name: "" }) === "");
// 콘솔: true

// null 이나 빈 문자열을 넘기면 그 값이 그대로 쓰입니다.
// 빈 문자열이면 화면에 아무것도 안 나옵니다. 기본값이 안 먹는 것처럼 보입니다.
//
// 컴포넌트에 그대로 옮기면 이렇게 됩니다.

function Greeting({ name = "손님" }) {
  return <p>{name}님, 어서 오세요.</p>;
}

// 화면 ③ 에서 확인하세요.
//
//     <Greeting name="이서연" />   →  이서연님, 어서 오세요.
//     <Greeting />                 →  손님님, 어서 오세요.
//
// "손님님" 이 어색하지만, 기본값이 실제로 쓰였다는 것은 확실히 보입니다.
//
// 기본값은 이럴 때 씁니다.
//   - 대부분 같은 값이고 가끔만 다를 때 (버튼 색, 크기 같은 것)
//   - 안 넘겨도 화면이 깨지지 않게 하고 싶을 때

// ✏️ 직접 해보기 3 — MenuItemB 에 price = 0 기본값을 주고
//                    <MenuItemB name="물" /> 을 화면 ③ 에 넣어 보세요.

// ── 섹션 4: 이름을 바꿔 받기 ──

// 09단원 개념02 섹션2에서 배운 것입니다. 왼쪽이 원래 이름, 오른쪽이 내가 쓸 이름입니다.

function ItemLine({ name: itemName, price: itemPrice = 0 }) {
  return (
    <p>
      {itemName} / {itemPrice}원
    </p>
  );
}

// 넘기는 쪽은 여전히 name, price 입니다. 받는 쪽 안에서만 이름이 바뀝니다.
//
//     <ItemLine name="케이크" price={6000} />
//
// 이렇게 쓰는 이유는 두 가지입니다.
//   1. 같은 이름의 변수가 이미 있을 때 (09단원 개념02 섹션2의 productName 예)
//   2. name 처럼 너무 흔한 이름을 더 분명하게 바꾸고 싶을 때
//
// 이름 바꾸기와 기본값은 함께 쓸 수 있습니다. 위 price 가 그렇습니다.
//
//     price: itemPrice = 0
//     ─────  ─────────   ─
//     원래   내가 쓸     기본값
//     이름   이름

// ✏️ 직접 해보기 4 — ItemLine 을 <ItemLine name="삼각김밥" /> 으로 써 보고
//                    가격 자리에 무엇이 나오는지 확인하세요.

// ── 섹션 5: 객체를 통째로 넘기기 ──

// props 를 하나하나 넘기다 보면 이런 코드가 나옵니다.
//
//     <UserCard name="이서연" age={22} city="서울" />
//
// 그런데 원래 데이터가 객체 하나였다면, 통째로 넘기는 편이 짧습니다.

const seoyeon = { name: "이서연", age: 22, city: "서울" };

function UserCard({ user }) {
  const { name, age, city } = user; // 받은 객체에서 다시 꺼냅니다

  return (
    <div className="output">
      <strong>{name}</strong> ({age}세)
      <br />
      사는 곳: {city}
    </div>
  );
}

// 쓸 때는 이렇게 씁니다.
//
//     <UserCard user={seoyeon} />
//
// 중괄호가 필요합니다. 객체는 문자열이 아니기 때문입니다. (개념02 섹션3)
//
// 매개변수 자리에서 한 번에 꺼낼 수도 있습니다. 09단원 개념02 섹션7의 중첩 구조분해입니다.
//
//     function UserCard({ user: { name, age, city } }) { ... }
//
// 되기는 하지만 읽기 어렵습니다. 위처럼 두 줄로 나누는 편이 낫습니다.
//
// 하나씩 넘기기와 통째로 넘기기 중 무엇이 나을까요?
//   - 컴포넌트가 그 객체의 대부분을 쓴다  → 통째로
//   - 두세 개만 쓴다                     → 필요한 것만
// 통째로 넘기면 그 컴포넌트는 "그 모양의 객체" 에만 쓸 수 있게 됩니다.

// ✏️ 직접 해보기 5 — const jihun = { name: "박지훈", age: 28, city: "대구" }; 를 만들고
//                    화면 ⑤ 에 카드를 하나 더 그려 보세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 구조분해해 놓고 props 를 계속 씀
// function Bad1({ name }) {
//   return <p>{props.name}</p>;
// }
//   실수: ReferenceError: props is not defined 입니다.
//         매개변수 자리에 { name } 이라고 쓰면 props 라는 이름은 만들어지지 않습니다.
//         구조분해로 꺼낸 name 을 그대로 쓰세요.

// [실수 2] 속성 이름을 틀림 ★ 조용히 틀립니다
//   09단원 개념02 [실수 1] 과 똑같습니다. 객체 구조분해는 '이름' 으로 찾습니다.

function TypoItem({ nmae }) {
  console.log("실수 2 —", String(nmae));
  // 콘솔: 실수 2 — undefined

  return <p>[{nmae}] 여기가 비어 있습니다</p>;
}

//   <TypoItem name="아메리카노" /> 로 제대로 넘겨도 nmae 는 undefined 입니다.
//   에러도 경고도 없습니다. 화면에 빈칸만 남습니다.
//   화면에 값 하나가 안 보이면 넘기는 쪽과 받는 쪽의 철자를 나란히 놓고 비교하세요.

// [실수 3] 중괄호를 빼먹음 ★ 자주 납니다

function NoBraceItem(name, price) {
  console.log("실수 3 — 첫 번째 매개변수:", typeof name, Object.keys(name));
  // 콘솔: 실수 3 — 첫 번째 매개변수: object ['name', 'price']
  console.log("실수 3 — price 가 4000 인가?", price === 4000);
  // 콘솔: 실수 3 — price 가 4000 인가? false

  return <p>콘솔을 보세요</p>;
}

//   <NoBraceItem name="아메리카노" price={4000} /> 로 넘겼습니다.
//   중괄호를 빼면 '구조분해' 가 아니라 그냥 매개변수 두 개가 됩니다.
//   컴포넌트는 언제나 props 객체 하나만 받으므로
//     name  → props 객체 전체가 통째로 들어옵니다
//     price → 우리가 넘긴 4000 이 아닙니다. React 가 내부에서 쓰는 값이 옵니다
//   이 됩니다.
//
//   이 상태에서 화면에 {name} 을 그리면 이런 에러가 납니다.
//     Error: Objects are not valid as a React child
//   "객체는 화면에 그릴 수 없다" 는 뜻입니다. 이 에러를 보면 중괄호부터 확인하세요.

// [실수 4] 기본값을 등호가 아니라 콜론으로 씀
// function Bad4({ name: "손님" }) {
//   return <p>{name}</p>;
// }
//   실수: [SyntaxError] 입니다. 화면이 통째로 빕니다.
//         콜론은 '이름 바꾸기' 이고 등호가 '기본값' 입니다. (09단원 개념02)
//         { name = "손님" } 이라고 써야 합니다.

// [실수 5] 기본값이 안 먹는다고 생각함
//   섹션 3에서 본 것처럼 기본값은 undefined 일 때만 쓰입니다.
//   빈 문자열("")이나 null 을 넘기면 그 값이 그대로 화면에 갑니다.
//   빈 문자열은 화면에 아무것도 안 그려서 "안 넘긴 것" 처럼 보입니다.

// ============================================================
// 화면에 그리기
// ============================================================

export default function Concept03() {
  return (
    <div>
      <h1>개념 03 — props 구조분해와 기본값</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        이 파일은 새 React 문법이 거의 없습니다. <strong>JS자료 09단원 개념02(객체 구조분해)를 그대로 씁니다.</strong> 기억이 흐리면 그 파일을 먼저 한 번 열어 보세요.
      </p>

      <>
        <div className="demo">
          <h3>① 같은 결과 — props. 방식과 구조분해 방식</h3>
          <div className="output">
            <MenuItemA name="아메리카노" price={4000} />
            <MenuItemB name="아메리카노" price={4000} />
          </div>
        </div>

        <div className="demo">
          <h3>② 함수 안에서 꺼낸 것</h3>
          <div className="output">
            <MenuItemC name="라떼" price={4500} />
          </div>
        </div>

        <div className="demo">
          <h3>③ 기본값 — 넘긴 것과 안 넘긴 것</h3>
          <div className="output">
            <Greeting name="이서연" />
            <Greeting />
          </div>
        </div>

        <div className="demo">
          <h3>④ 이름을 바꿔 받기</h3>
          <div className="output">
            <ItemLine name="케이크" price={6000} />
          </div>
        </div>

        <div className="demo">
          <h3>⑤ 객체를 통째로 넘기기</h3>
          <UserCard user={seoyeon} />
        </div>

        <div className="demo">
          <h3>⑥ 실수 2 · 3 (콘솔도 함께 보세요)</h3>
          <div className="output">
            <TypoItem name="아메리카노" />
            <NoBraceItem name="아메리카노" price={4000} />
          </div>
        </div>
      </>

      <Summary
        items={[
          <><code>function Item({"{"} name, price {"}"})</code> — 매개변수 자리에서 props 를 꺼냅니다. JS자료 09단원 객체 구조분해 그대로입니다.</>,
          "넘기는 쪽은 바뀌지 않습니다. 받는 쪽 괄호 안만 바뀝니다.",
          "매개변수 한 줄만 봐도 그 컴포넌트가 무엇을 받는지 보입니다. 설명서 역할을 합니다.",
          <><code>{"{"} name = "손님" {"}"}</code> — 안 넘어왔을 때 쓸 <strong>기본값</strong>을 정합니다.</>,
          <>기본값은 <strong>undefined 일 때만</strong> 쓰입니다. <code>null</code> 이나 빈 문자열은 그대로 쓰입니다.</>,
          <><code>{"{"} name: itemName {"}"}</code> — 왼쪽이 원래 이름, 오른쪽이 내가 쓸 이름입니다.</>,
          <>객체를 통째로 넘기고(<code>user={"{"}seoyeon{"}"}</code>) 컴포넌트 안에서 다시 꺼내도 됩니다.</>,
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) function MenuItemB({ name, price, hot }) {
//      return (
//        <p>
//          {name} — {price}원 ({hot})
//        </p>
//      );
//    }
//    쓸 때: <MenuItemB name="아메리카노" price={4000} hot="뜨거움" />
//    // 화면: 아메리카노 — 4000원 (뜨거움)
//    → 괄호만 남고 안이 비면 hot 을 안 넘겼거나 철자를 틀린 것입니다.
//
// 2) function MenuItemC(props) {
//      const { name, price } = props;
//      console.log(props);
//      // 콘솔: { name: '라떼', price: 4500 }
//      ...
//    }
//    → 구조분해는 '꺼내서 복사' 하는 것이라 원본 props 는 그대로 남습니다.
//      09단원 개념02 섹션4에서 원본이 안 바뀐 것과 같습니다.
//
// 3) function MenuItemB({ name, price = 0 }) { ... }
//    쓸 때: <MenuItemB name="물" />
//    // 화면: 물 — 0원
//    → "물 — 원" 이 나오면 기본값을 안 준 것입니다. undefined 는 화면에 안 그려집니다.
//
// 4) <ItemLine name="삼각김밥" />
//    // 화면: 삼각김밥 / 0원
//    → price 를 안 넘겼으므로 기본값 0 이 쓰였습니다.
//      기본값이 없었다면 "삼각김밥 / 원" 이 됐을 것입니다.
//
// 5) const jihun = { name: "박지훈", age: 28, city: "대구" };
//    App 의 ⑤ 상자 안에 <UserCard user={jihun} /> 를 한 줄 넣습니다.
//    // 화면: 박지훈 (28세) / 사는 곳: 대구
//    → user={jihun} 에서 중괄호를 빼고 user="jihun" 이라고 쓰면
//      문자열이 넘어가서 const { name } = "jihun" 이 되고 name 은 undefined 가 됩니다.
