// ============================================================
// 07단원 · 개념 01 — props 에 타입 붙이기
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run typecheck
// ============================================================
//
// React자료 03단원에서 props 를 배웠습니다. 그때 이렇게 썼습니다.
//
//     function MenuItem({ name, price }) { ... }
//
// 여기서 name 과 price 가 무엇인지는 아무 데도 안 적혀 있었습니다.
// 쓰는 사람이 컴포넌트 안을 열어 봐야 알 수 있었습니다.
//
// 이 파일은 그 자리에 설명서를 붙입니다. 04단원에서 배운 객체 타입 그대로입니다.

import { useState } from "react";
import type { ReactNode } from "react";
import Summary from "../_ui/Summary.tsx";

// ── 섹션 1: props 는 그냥 객체다 ──

// props 는 객체 하나입니다. 그러니 04단원의 객체 타입을 그대로 쓰면 됩니다.
type MenuItemProps = {
  name: string;
  price: number;
};

function MenuItem({ name, price }: MenuItemProps) {
  return (
    <li>
      {name} — {price}원
    </li>
  );
}

// 적는 자리를 그림으로 보면 이렇습니다.
//
//     function MenuItem({ name, price }: MenuItemProps) {
//                       └──── 구조분해 ───┘  └─── 타입 ───┘
//
// 구조분해는 React자료 03단원 개념03에서 배운 그대로이고,
// 그 뒤에 : 타입 만 붙은 것입니다.

// 이제 쓰는 쪽에서 검사가 됩니다.
//
// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type 'MenuItemProps'.
// const 빠뜨림 = <MenuItem name="라떼" />;
//
// 실수: price 를 안 넘겼다고 그 자리에서 알려 줍니다.
//       JS 였다면 화면에 "undefined원" 이 찍히고 나서야 알았습니다.

// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// const 종류틀림 = <MenuItem name="라떼" price="4500" />;
//
// 실수: 따옴표를 붙이면 문자열입니다. 숫자는 {4500} 로 넘겨야 합니다.
//       React자료 03단원에서 "숫자는 중괄호로" 라고 배운 그 규칙을
//       이제 타입이 강제해 줍니다.

// ✏️ 직접 해보기 1 — MenuItem 에 isHot(boolean) props 를 추가하고
//    아래 화면에서 넘겨 보세요. 안 넘기면 어떻게 되나요?


// ── 섹션 2: 안 붙이면 어떻게 되나 ──

// 매개변수 타입을 안 적으면 03단원에서 본 그 에러가 납니다.
//
// 에러: TS7031 Binding element 'name' implicitly has an 'any' type.
// function MenuItemNoType({ name }) {
//   return <li>{name}</li>;
// }
//
// 실수: 03단원의 TS7006 과 형제입니다.
//       구조분해한 자리라서 Binding element 라고 부를 뿐,
//       "은근슬쩍 any 가 됐다" 는 말은 같습니다.
//       props 에도 예외 없이 타입을 적습니다.

// ✏️ 직접 해보기 2 — MenuItem 의 : MenuItemProps 를 지우고 저장해 보세요.
//    무슨 에러가 나나요? 확인한 뒤 되돌리세요.


// ── 섹션 3: 없어도 되는 props ──

// 04단원 개념03의 ? 를 그대로 씁니다.
type BadgeProps = {
  text: string;
  color?: string; // 없으면 기본색
};

function Badge({ text, color = "#555" }: BadgeProps) {
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
      {text}
    </span>
  );
}

// 기본값을 주면 color 는 함수 안에서 string 입니다. undefined 가 안 섞입니다.
// 03단원 개념02에서 "쓸 만한 기본값이 있으면 ? 보다 기본값" 이라고 한 그대로입니다.

// ✏️ 직접 해보기 3 — Badge 의 기본값 = "#555" 를 지워 보세요.
//    검사는 걸릴까요? 화면은 어떻게 되나요?


// ── 섹션 4: children 의 타입 ──

// 태그 사이에 끼워 넣는 것을 받으려면 children 을 적습니다.
type CardProps = {
  title: string;
  children: ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      {children}
    </div>
  );
}

// ReactNode 는 "화면에 그릴 수 있는 것 전부" 입니다.
// 글자 · 숫자 · 태그 · 배열 · null 까지 다 들어갑니다.
//
// import type { ReactNode } from "react"; 처럼 import 앞에 type 을 붙인 것에 주목하세요.
// "이건 타입만 가져오는 것" 이라는 표시입니다.
// 안 붙여도 대개 동작하지만, 붙이면 번들에 안 들어간다는 것이 분명해집니다.

// ✏️ 직접 해보기 4 — Card 를 태그 사이 내용 없이 <Card title="빈 상자" /> 로 써 보세요.
//    걸리나요? children 을 children?: ReactNode 로 바꾸면 어떻게 되나요?


// ── 섹션 5: 함수를 props 로 넘기기 ──

// 03단원 개념03에서 배운 함수 타입을 그대로 씁니다.
type CounterProps = {
  label: string;
  onCount: (next: number) => void;
};

function Counter({ label, onCount }: CounterProps) {
  const [count, setCount] = useState(0);

  function handleClick() {
    const next = count + 1;
    setCount(next);
    onCount(next);
  }

  return (
    <button type="button" onClick={handleClick}>
      {label}: {count}
    </button>
  );
}

// 넘기는 쪽에서 모양이 안 맞으면 걸립니다.
//
// 에러: TS2322 Type '(next: string) => void' is not assignable to type '(next: number) => void'.
// const 잘못넘김 = <Counter label="주문" onCount={(next: string) => console.log(next)} />;
//
// 실수: 숫자를 받기로 한 자리에 문자열을 받는 함수를 넘겼습니다.

// ✏️ 직접 해보기 5 — Counter 의 onCount 를 (next: number) => string 으로 바꿔 보세요.
//    넘기는 쪽과 받는 쪽 중 어디가 걸리나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] props 타입을 안 붙이기
//   TS7031 입니다. 03단원의 TS7006 과 형제입니다.

// [실수 2] children 이 자동으로 있다고 생각하기
//   직접 적어야 합니다. 예전 React.FC 를 쓰던 시절 이야기입니다.

// [실수 3] 숫자를 따옴표로 넘기기
//   price="4500" 은 문자열입니다. price={4500} 로 써야 합니다.
//   React자료에서 배운 규칙을 이제 타입이 강제해 줍니다.

// [실수 4] props 타입 이름을 컴포넌트와 다르게 짓기
//   관행은 컴포넌트 이름 + Props 입니다. MenuItem → MenuItemProps.
//   찾기 쉬워집니다.


// ── 화면 ──

export default function Page() {
  const [last, setLast] = useState(0);

  return (
    <div>
      <h2>개념 01 — props 에 타입 붙이기</h2>

      <Card title="섹션 1 — 기본 props">
        <ul>
          <MenuItem name="아메리카노" price={4000} />
          <MenuItem name="라떼" price={4500} />
        </ul>
      </Card>

      <Card title="섹션 3 — 없어도 되는 props">
        <p>
          <Badge text="기본색" /> <Badge text="지정색" color="#2d6cdf" />
        </p>
      </Card>

      <Card title="섹션 5 — 함수 props">
        <Counter label="주문" onCount={setLast} />
        <p>마지막으로 받은 값: {last}</p>
      </Card>

      <Summary
        items={[
          "props 는 객체 하나다. 04단원의 객체 타입을 그대로 쓴다.",
          "적는 자리는 구조분해 뒤 — function C({ a, b }: CProps) 다.",
          "안 적으면 TS7031(Binding element ... implicitly has an 'any' type)이 난다.",
          "없어도 되는 props 는 ? 를 붙이고, 쓸 만한 기본값이 있으면 = 로 준다.",
          "태그 사이의 내용을 받으려면 children: ReactNode 를 적는다.",
          "함수 props 는 (인자) => void 처럼 03단원의 함수 타입으로 적는다.",
          "타입만 가져올 때는 import type 으로 쓴다.",
        ]}
      />
    </div>
  );
}


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) type MenuItemProps = { name: string; price: number; isHot: boolean };
//    안 넘기면 TS2741 Property 'isHot' is missing ... 가 납니다.
//    선택으로 만들려면 isHot?: boolean 입니다.
//
// 2) error TS7031: Binding element 'name' implicitly has an 'any' type.
//    (price 에 대해서도 한 번 더 납니다)
//    재현:
//    function MenuItem({ name, price }) {
//      return <li>{name} {price}</li>;
//    }
//    void MenuItem;
//    구조분해한 자리라 Binding element 라고 부를 뿐, 뜻은 TS7006 과 같습니다.
//
// 3) 검사는 걸리지 않습니다. 조용합니다.
//    기본값을 지우면 color 가 string | undefined 가 되는데,
//    style 의 background 는 원래 "없어도 되는" 자리라 undefined 를 그냥 받습니다.
//
//    대신 화면이 바뀝니다. <Badge text="기본색" /> 의 배경색이 사라져서
//    흰 바탕에 흰 글씨가 되어 글자가 안 보입니다.
//
//    → 01단원 개념01의 "타입이 못 잡는 것 — 화면이 이상한 것" 이 이것입니다.
//      ? 를 붙였으면 기본값을 주는 편이 안전합니다.
//      타입이 안 막아 주는 자리일수록 기본값이 중요합니다.
//
// 4) 걸립니다. TS2741 Property 'children' is missing ... 입니다.
//    children?: ReactNode 로 바꾸면 통과하고, 안쪽이 비어 있게 그려집니다.
//    "내용이 없어도 되는 상자" 라면 ? 를 붙이는 것이 맞습니다.
//
// 5) 넘기는 쪽이 걸립니다.
//    onCount={setLast} 에서 setLast 는 문자열을 안 돌려주기 때문입니다.
//    받는 쪽(Counter 안)은 onCount(next) 를 부르기만 하므로 문제가 없습니다.
