// ============================================================
// 03단원 · 개념 02 — props 전달하기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01에서 같은 컴포넌트를 여러 번 썼습니다. 그런데 내용이 전부 같았습니다.
//
//     <ShopCard />
//     <ShopCard />     ← 글자 하나까지 똑같은 카드 두 개
//
// 쓸모가 있으려면 "모양은 같고 내용은 다른" 것을 만들 수 있어야 합니다.
// 메뉴판이라면 카드 모양은 같고 이름과 가격만 달라야 합니다.
//
// 함수에서는 이미 해 본 일입니다. 인자를 다르게 넘기면 결과가 달라졌습니다.
// 컴포넌트에 값을 넘기는 것을 props 라고 부릅니다.
// properties(속성)를 줄인 말입니다.
//
// 이 파일에서 배우는 것
//   1. 컴포넌트에 값을 넘기고 받는 법
//   2. props 는 객체 하나로 온다
//   3. 언제 중괄호가 필요한가 — 이것 때문에 조용히 틀리는 일이 자주 생깁니다

// ── 섹션 1: 값을 넘기면 결과가 달라집니다 ──

// 먼저 JS자료 05단원 개념02(매개변수와 인자)를 떠올려 봅시다.

import Summary from "../_ui/Summary.jsx";

function greet(name) {
  return `${name}님 환영합니다`;
}

console.log(greet("김민준"));
// 콘솔: 김민준님 환영합니다
console.log(greet("이서연"));
// 콘솔: 이서연님 환영합니다

// 함수는 하나인데 넘긴 값이 달라서 결과가 달라졌습니다.
// 컴포넌트도 똑같이 합니다. 넘기는 '모양' 만 다릅니다.

function Greet(props) {
  return <p>{props.name}님 환영합니다</p>;
}

// 쓸 때는 HTML 속성처럼 씁니다.
//
//     <Greet name="김민준" />
//     <Greet name="이서연" />
//
// 나란히 놓고 보면 이렇습니다.
//
//   함수      greet("김민준")
//   컴포넌트  <Greet name="김민준" />
//
// 함수는 '순서' 로 넘겼습니다. 첫 번째 자리에 있으니 name 이었습니다.
// 컴포넌트는 '이름' 을 붙여 넘깁니다. 그래서 순서를 바꿔도 상관없습니다.
// JS자료 09단원 개념02 마지막에서 본 order2({ menu, size, ice }) 와 같은 방식입니다.
//
// 화면 ① 을 보세요. 같은 Greet 인데 두 줄의 이름이 다릅니다.

// ✏️ 직접 해보기 1 — <Greet name="박지훈" /> 을 화면 ① 상자에 한 줄 더 넣어 보세요.

// ── 섹션 2: props 는 객체 하나로 옵니다 ──

// 넘긴 값들이 각각 매개변수로 오는 것이 아닙니다.
// 전부 하나의 객체에 담겨서 '첫 번째 매개변수' 하나로 옵니다.

function ShowProps(props) {
  console.log(props);
  // 콘솔: { name: '이서연', age: 22 }

  return (
    <p>
      {props.name} / {props.age}세
    </p>
  );
}

// 위 컴포넌트를 <ShowProps name="이서연" age={22} /> 로 썼습니다.
// 넘긴 두 개가 { name: '이서연', age: 22 } 라는 객체 하나가 되었습니다.
//
// 그래서 꺼낼 때는 JS자료 07단원에서 배운 점 표기법을 그대로 씁니다.
//
//     props.name
//     props.age
//
// 매개변수 이름은 마음대로 지어도 동작합니다. p 라고 써도 됩니다.
// 하지만 React 를 쓰는 사람들은 거의 전부 props 라고 씁니다.
// 남의 코드를 읽을 때 헷갈리지 않도록 여러분도 props 라고 쓰세요.
//
// 몇 개를 넘기든 매개변수는 항상 하나입니다. 열 개를 넘겨도 객체 하나에 다 담깁니다.

// ✏️ 직접 해보기 2 — ShowProps 에 city="부산" 을 하나 더 넘기고
//                    콘솔에 찍히는 객체가 어떻게 바뀌는지 보세요.

// ── 섹션 3: 문자열은 따옴표, 나머지는 중괄호 ──

// 값을 넘기는 방법은 두 가지입니다.
//
//     title="아메리카노"     ← 문자열
//     price={4000}          ← 그 밖의 값 (숫자·불리언·배열·객체·변수)
//
// 왜 나뉘어 있을까요? 02단원 개념02에서 배운 것과 같은 규칙 때문입니다.
// JSX 의 속성 자리는 기본이 '글자' 입니다. 따옴표 안에 쓴 것은 글자 그대로 갑니다.
// 자바스크립트 값을 넣고 싶으면 "여기부터는 자바스크립트다" 라고 표시해야 하고,
// 그 표시가 중괄호입니다.
//
// 실제로 어떤 자료형으로 들어가는지 확인해 봅시다.

function TypeCheck(props) {
  console.log(typeof props.price, typeof props.priceText);
  // 콘솔: number string
  console.log(typeof props.hot, Array.isArray(props.tags));
  // 콘솔: boolean true

  return (
    <p>
      {props.name} {props.price}원 (문자열로 넘긴 것: {props.priceText})
    </p>
  );
}

// 위 컴포넌트에 이렇게 넘겼습니다.
//
//     <TypeCheck
//       name="아메리카노"          ← 문자열
//       price={4000}               ← 숫자
//       priceText="4000"           ← 따옴표로 넘긴 숫자 → 문자열이 됩니다
//       hot={true}                 ← 불리언
//       tags={["인기", "따뜻함"]}   ← 배열
//     />
//
// priceText 를 눈여겨보세요. 화면에는 4000 이라고 똑같이 나옵니다.
// 그런데 자료형은 문자열입니다. 계산에 쓰는 순간 조용히 틀립니다.
// 섹션 6 [실수 1] 에서 실제로 확인합니다.
//
// 몇 가지 더 알아 두면 좋은 것
//
//   변수 넘기기        name={menuName}       ← 중괄호 안에 변수 이름
//   객체 넘기기        user={{ name: "김민준" }}
//                      중괄호가 두 개입니다. 바깥은 "여기부터 자바스크립트",
//                      안쪽은 객체를 만드는 중괄호입니다. (02단원 style={{ }} 와 같습니다)
//   불리언 축약        hot         ← hot={true} 와 같습니다
//   문자열도 중괄호로  title={"아메리카노"}   ← 되기는 하지만 굳이 이렇게 쓰지 않습니다

const menuName = "라떼";
console.log(menuName);
// 콘솔: 라떼

// ✏️ 직접 해보기 3 — TypeCheck 에 count={2} 를 넘기고,
//                    컴포넌트 안에서 typeof props.count 를 콘솔에 찍어 보세요.

// ── 섹션 4: 여러 개 넘기고 여러 번 쓰기 ──

// 이제 개념01에서 못 했던 것을 할 수 있습니다.
// 모양은 한 번만 적고, 내용은 쓸 때마다 다르게 넣습니다.

function MenuItem(props) {
  return (
    <div className="output">
      <strong>{props.name}</strong> — {props.price}원
      <br />
      세 개 사면 {props.price * 3}원
    </div>
  );
}

// props 는 그냥 값이라서 계산에 써도 됩니다.
// {props.price * 3} 처럼 중괄호 안에서 식을 쓸 수 있습니다. (02단원 개념02)
//
// 화면 ④ 를 보세요. 카드 세 개가 같은 모양, 다른 내용으로 나옵니다.
// 이 세 줄이 화면 ④ 를 만듭니다.
//
//     <MenuItem name="아메리카노" price={4000} />
//     <MenuItem name="라떼" price={4500} />
//     <MenuItem name="케이크" price={6000} />
//
// 지금은 손으로 세 번 썼습니다. 배열을 받아 자동으로 여러 개 그리는 방법(map)은
// 05단원에서 배웁니다.

// ✏️ 직접 해보기 4 — 화면 ④ 에 삼각김밥 1200원 카드를 한 줄 더 추가해 보세요.

// ── 섹션 5: props 는 위에서 아래로만 갑니다 ──

// props 는 '쓰는 쪽' 에서 '만든 쪽' 으로 갑니다.
// 즉 부모 컴포넌트가 자식 컴포넌트에게 주는 것입니다. 반대 방향은 안 됩니다.
//
//     App  ──  name="김민준"  ──▶  Greet
//
// 자식이 부모에게 무언가 알려 주고 싶을 때는 다른 방법을 씁니다. 07단원에서 배웁니다.
//
// 그럼 부모가 아무것도 안 넘기면 어떻게 될까요?

function NoProps(props) {
  console.log("안 넘겼을 때:", String(props.name));
  // 콘솔: 안 넘겼을 때: undefined
  console.log(Object.keys(props));
  // 콘솔: []

  return <p>{props.name}님 환영합니다</p>;
}

// 화면 ⑤ 를 보세요. "님 환영합니다" 만 나옵니다.
// props.name 이 undefined 인데도 에러가 나지 않습니다.
// JSX 안의 undefined 는 '아무것도 안 그림' 으로 처리되기 때문입니다.
//
// 이름이 안 나오는데 콘솔은 조용합니다. 그래서 원인을 찾기 어렵습니다.
// 화면에 값 하나가 비어 있으면 "넘겼는지" 와 "이름이 같은지" 부터 확인하세요.
//
// 안 넘겼을 때 쓸 기본값을 정해 두는 방법은 개념03에서 배웁니다.

// ✏️ 직접 해보기 5 — 화면 ⑤ 의 <NoProps /> 에 name="박지훈" 을 넘겨
//                    콘솔의 undefined 가 사라지는지 확인하세요.

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 숫자를 따옴표로 넘김 ★ 가장 자주 납니다
//   에러가 나지 않습니다. 화면도 멀쩡해 보입니다. 계산할 때만 틀립니다.

function BadPrice(props) {
  console.log(props.price + 500);
  // 콘솔: 4000500
  console.log(typeof (props.price + 500));
  // 콘솔: string

  return <p>4000원에 500원을 더하면 {props.price + 500}원</p>;
}

//   <BadPrice price="4000" /> 처럼 따옴표로 넘겼습니다.
//   문자열 + 숫자는 이어 붙이기가 됩니다. JS자료 02단원 개념01에서 본 그대로입니다.
//   고치는 법: price={4000} 처럼 중괄호로 넘깁니다.

// [실수 2] 중괄호를 빼먹고 그냥 씀
//   글자가 그대로 화면에 나옵니다. 이것도 에러가 안 납니다.

function NoBrace(props) {
  return <p>props.name</p>;
}

//   화면: props.name 이라는 글자가 그대로 나옵니다.
//   고치는 법: <p>{props.name}</p>

// [실수 3] 속성 이름의 대소문자를 틀림
//   넘기는 쪽은 Name, 받는 쪽은 name 이면 서로 다른 이름입니다.

function TypoProps(props) {
  console.log("실수 3 키 목록:", Object.keys(props));
  // 콘솔: 실수 3 키 목록: ['Name']

  return <p>[{props.name}] 이름이 비어 있습니다</p>;
}

//   <TypoProps Name="김민준" /> 로 넘겼습니다.
//   props.Name 에는 값이 있지만 props.name 은 undefined 입니다.
//   경고 한 줄 없습니다. 이름은 넘기는 쪽과 받는 쪽이 글자까지 같아야 합니다.

// [실수 4] 받는 쪽에 매개변수를 안 적음
// function Bad() {
//   return <p>{props.name}</p>;
// }
//   실수: ReferenceError: props is not defined 가 납니다.
//         이건 빨간 에러가 나므로 오히려 찾기 쉽습니다.
//         화면은 그 지점부터 안 그려집니다.

// [실수 5] 숫자에 중괄호를 안 붙임
// <Greet name="김민준" age=20 />
//   실수: [SyntaxError] 입니다. 화면이 통째로 빕니다.
//         JSX 속성값 자리에는 따옴표 아니면 중괄호만 올 수 있습니다.
//         age={20} 이라고 써야 합니다.

// ============================================================
// 화면에 그리기
// ============================================================

export default function Concept02() {
  return (
    <div>
      <h1>개념 02 — props 전달하기</h1>

      <p className="guide">
        왼쪽 목록에서 이 예제를 고르면 이 화면이 나옵니다. <strong>F12 → Console</strong> 도 함께 보세요.
        <br />
        <br />
        아래 회색 상자 ① ~ ⑦ 은 전부 React 가 그린 것입니다. 번호가 같은 코드와 함께 보세요.
      </p>

      <>
        <div className="demo">
          <h3>① 같은 컴포넌트, 다른 값</h3>
          <div className="output">
            <Greet name="김민준" />
            <Greet name="이서연" />
          </div>
        </div>

        <div className="demo">
          <h3>② props 는 객체 하나 (콘솔도 함께 보세요)</h3>
          <div className="output">
            <ShowProps name="이서연" age={22} />
          </div>
        </div>

        <div className="demo">
          <h3>③ 중괄호가 필요한 값들</h3>
          <div className="output">
            <TypeCheck
              name="아메리카노"
              price={4000}
              priceText="4000"
              hot={true}
              tags={["인기", "따뜻함"]}
            />
          </div>
        </div>

        <div className="demo">
          <h3>④ 모양은 하나, 내용은 셋</h3>
          <MenuItem name="아메리카노" price={4000} />
          <MenuItem name="라떼" price={4500} />
          <MenuItem name="케이크" price={6000} />
        </div>

        <div className="demo">
          <h3>⑤ 아무것도 안 넘겼을 때</h3>
          <div className="output">
            <NoProps />
          </div>
        </div>

        <div className="demo">
          <h3>⑥ 숫자를 따옴표로 넘긴 결과</h3>
          <div className="output">
            <BadPrice price="4000" />
          </div>
        </div>

        <div className="demo">
          <h3>⑦ 중괄호를 빼먹은 결과 / 이름을 틀린 결과</h3>
          <div className="output">
            <NoBrace name="김민준" />
            <TypoProps Name="김민준" />
          </div>
        </div>
      </>

      <Summary
        items={[
          <>컴포넌트에 값을 넘기는 것을 <strong>props</strong> 라고 합니다. 함수의 인자와 같은 역할입니다.</>,
          <>넘길 때는 <code>&lt;Greet name="김민준" /&gt;</code> 처럼 속성으로 씁니다.</>,
          <>받을 때는 매개변수 하나로 받습니다. 넘긴 것이 전부 <strong>객체 하나</strong>에 담겨 옵니다. <code>props.name</code> 으로 꺼냅니다.</>,
          <>문자열은 <code>title="글자"</code>, 그 밖의 값은 <code>price={"{"}4000{"}"}</code> 처럼 <strong>중괄호</strong>가 필요합니다. 중괄호는 "여기부터 자바스크립트" 표시입니다.</>,
          "숫자를 따옴표로 넘기면 문자열이 됩니다. 에러 없이 계산만 틀립니다.",
          "props 는 부모 → 자식 한 방향입니다. 반대 방향은 07단원에서 배웁니다.",
          "안 넘긴 props 는 undefined 이고, 화면에는 아무것도 안 나옵니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) App 의 ① 상자 안에 한 줄 넣습니다.
//
//      <Greet name="박지훈" />
//
// 화면: 김민준님 환영합니다 / 이서연님 환영합니다 / 박지훈님 환영합니다
//    → "님 환영합니다" 만 나오면 name 을 안 넘겼거나 이름을 틀린 것입니다.
//
// 2) <ShowProps name="이서연" age={22} city="부산" />
//    // 콘솔: { name: '이서연', age: 22, city: '부산' }
//    → 넘긴 것이 늘어난 만큼 객체의 속성도 늘어납니다.
//      화면은 그대로입니다. ShowProps 가 city 를 안 쓰기 때문입니다.
//
// 3) 넘기는 쪽:  <TypeCheck ... count={2} />
//    받는 쪽:    console.log(typeof props.count);
//    // 콘솔: number
//    → count="2" 로 넘기면 string 이 나옵니다. 중괄호 하나 차이입니다.
//
// 4) App 의 ④ 상자 안에 한 줄 넣습니다.
//
//      <MenuItem name="삼각김밥" price={1200} />
//
// 화면: 삼각김밥 — 1200원 / 세 개 사면 3600원
//    → 카드가 아예 안 늘어나면 <MenuItem /> 을 App 의 ④ 상자 밖에 쓴 것입니다.
//      "원" 앞이 비어 있으면 price 를 안 넘긴 것입니다.
//      참고로 price="1200" 처럼 따옴표로 넘겨도 곱하기는 3600 으로 잘 나옵니다.
//      곱하기는 문자열을 숫자로 바꿔서 계산하기 때문입니다. 더하기만 틀립니다.
//
// 5) <NoProps name="박지훈" />
//    // 콘솔: 안 넘겼을 때: 박지훈
//    // 콘솔: ['name']
//    // 화면: 박지훈님 환영합니다
//    → 넘기지 않았을 때는 props 가 빈 객체 {} 라서 키 목록도 빈 배열이었습니다.
