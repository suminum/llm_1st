// ============================================================
// 14단원(부록) · 개념 03 — props 에 타입 붙이기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 03단원 개념03에서 이렇게 썼습니다.
//
//     function MenuItem({ name, price }) {
//       return <p>{name} — {price}원</p>;
//     }
//
// 그때 이런 말을 했습니다.
//
//     "매개변수만 봐도 이 컴포넌트가 무엇을 받는지 보입니다.
//      남이 만든 컴포넌트를 읽을 때 이 한 줄이 설명서 역할을 합니다."
//
// 그런데 이 설명서에는 빠진 것이 있습니다. **이름만 있고 종류가 없습니다.**
// price 가 숫자인지 문자열인지, 안 넘겨도 되는지는 안 적혀 있습니다.
//
// 이 파일은 그 한 줄을 완성합니다. 새로 배우는 것은 두 개뿐입니다.
//
//     type Props = { ... }   그리고   ({ name, price }: Props)
//
// ★ VS Code 로 열어 두세요. 타입 에러는 화면에 안 나옵니다. (개념01 4절)
// ★ "주석을 풀면 ..." 이라고 적힌 것은 직접 풀어서 밑줄을 확인하고 다시 붙이세요.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 타입을 안 붙이면 어떻게 되나 ──

// .tsx 파일에서 03단원 코드를 그대로 쓰면 밑줄이 생깁니다.

// function NoTypeItem({ name, price }) {
//   return (
//     <p>
//       {name} — {price}원
//     </p>
//   );
// }
//   ← 주석을 풀면 name 과 price 에 각각 밑줄이 생깁니다
//     error TS7031: Binding element 'name' implicitly has an 'any' type.
//     error TS7031: Binding element 'price' implicitly has an 'any' type.

// 읽는 법은 이렇습니다.
//
//   Binding element      구조분해로 꺼낸 것
//   implicitly           내가 안 적었는데 저절로
//   has an 'any' type    아무거나 다 되는 종류가 됐다
//
// 합치면 "구조분해로 꺼낸 name 이 뭔지 못 알아내겠다" 입니다.
//
// 왜 못 알아낼까요? 개념02 섹션2에서 본 그대로입니다.
// **함수 매개변수는 추론이 안 됩니다.** 무엇이 들어올지 함수 안에서는 볼 수가 없습니다.
//
// any 는 "아무거나" 라는 뜻의 특별한 타입입니다.
// any 가 되면 검사를 아예 안 합니다. 타입스크립트를 쓰는 의미가 사라집니다.
// 그래서 tsconfig.json 의 "strict": true 가 "그건 안 된다" 고 막아 주는 것입니다.

// ✏️ 직접 해보기 1 — 위 NoTypeItem 의 주석을 풀고, name 에 마우스를 올려
//                    무슨 메시지가 뜨는지 읽어 보세요. 확인했으면 다시 주석을 붙이세요.

// ── 섹션 2: type 으로 설명서 적기 ──

// 개념02 섹션4의 타입 별칭을 그대로 씁니다. 달라지는 것은 쓰는 자리뿐입니다.

type MenuItemProps = {
  name: string;
  price: number;
};

function MenuItem({ name, price }: MenuItemProps) {
  return (
    <p>
      {name} — {price}원
    </p>
  );
}

// 모양을 뜯어 보면 이렇습니다.
//
//     function MenuItem({ name, price }: MenuItemProps) {
//                       └───────────┘  └────────────┘
//                       03단원에서 배운   여기가 새로
//                       구조분해 그대로   붙은 부분
//
// 구조분해는 하나도 안 바뀌었습니다. 닫는 중괄호 뒤에 콜론과 타입 이름만 붙었습니다.
//
// props 는 객체 하나라고 했습니다(03단원 개념02).
// 그러니 "그 객체가 어떻게 생겼는지" 를 적어 주는 것이고,
// 그게 개념02에서 배운 객체 타입 별칭입니다. 새 문법이 아닙니다.
//
// 쓰는 쪽은 이렇게 됩니다.
//
//     <MenuItem name="아메리카노" price={4000} />
//
// 넘기는 쪽 코드는 03단원과 완전히 똑같습니다. 한 글자도 안 바뀝니다.
//
// 이제 세 가지가 잡힙니다. 메시지가 각각 다릅니다.

// <MenuItem name="라떼" />
//   ← 빠뜨렸을 때
//     error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'MenuItemProps'.

// <MenuItem name="라떼" price="4500" />
//   ← 종류가 다를 때 (숫자 자리에 문자열)
//     error TS2322: Type 'string' is not assignable to type 'number'.

// <MenuItem nmae="라떼" price={4500} />
//   ← 이름을 틀렸을 때
//     error TS2322: Type '{ nmae: string; price: number; }' is not assignable to type 'IntrinsicAttributes & MenuItemProps'.
//       Property 'nmae' does not exist on type 'IntrinsicAttributes & MenuItemProps'.
//
// 세 번째가 03단원 개념03 [실수 2] 바로 그것입니다.
// 그때는 nmae 라고 잘못 써도 아무 말 없이 화면에 빈칸만 나왔습니다.
// 이제는 넘기는 쪽에 밑줄이 생깁니다.
//
// (IntrinsicAttributes 는 React 가 key 같은 것을 위해 몰래 끼워 넣는 자리입니다.
//  우리가 적은 것이 아니니 그냥 넘어가세요. & 는 "그리고" 라는 뜻입니다.)

console.log("MenuItem 은 name(string) 과 price(number) 를 받습니다");
// 콘솔: MenuItem 은 name(string) 과 price(number) 를 받습니다

// ✏️ 직접 해보기 2 — MenuItemProps 에 kcal: number 를 추가해 보세요.
//                    화면에 그려 둔 <MenuItem ... /> 세 곳에 전부 밑줄이 생깁니다.
//                    확인했으면 되돌리세요.

// ── 섹션 3: 기본값과 함께 쓰기 ──

// 03단원 개념03 섹션3의 기본값도 그대로 됩니다. 타입은 그 뒤에 붙습니다.

type GreetingProps = {
  name: string;
};

function Greeting({ name = "손님" }: GreetingProps) {
  return <p>{name}님, 어서 오세요.</p>;
}

// 그런데 여기에 함정이 하나 있습니다.
// 기본값을 줬는데도 **안 넘기면 밑줄이 생깁니다.**
//
//     <Greeting />
//     error TS2741: Property 'name' is missing in type '{}' but required in type 'GreetingProps'.
//
// 기본값과 타입은 서로 모르는 사이이기 때문입니다.
//   기본값  — 안 넘어왔을 때 함수 안에서 대신 쓸 값
//   타입    — 넘기는 쪽이 지켜야 할 약속
//
// 기본값을 줬다는 것은 "안 넘겨도 된다" 는 뜻이니, 타입에도 그렇게 적어야 합니다.
// 그 표시가 개념02 섹션5의 물음표입니다.

type GreetingProps2 = {
  name?: string; // ← 안 넘겨도 됩니다
};

function Greeting2({ name = "손님" }: GreetingProps2) {
  return <p>{name}님, 어서 오세요.</p>;
}

// 이제 둘 다 됩니다.
//
//     <Greeting2 name="이서연" />   →  이서연님, 어서 오세요.
//     <Greeting2 />                 →  손님님, 어서 오세요.
//
// 그리고 여기에 이득이 하나 더 있습니다.
// 물음표를 붙이면 name 은 string | undefined 가 되는데,
// 기본값이 있으니 함수 안에서는 그냥 string 입니다. 밑줄이 안 생깁니다.
// 기본값을 안 주면 함수 안에서 name.length 같은 것을 쓸 때 밑줄이 생깁니다.

// ✏️ 직접 해보기 3 — MenuItemProps 의 price 를 price?: number 로 바꾸고
//                    함수 쪽도 { name, price = 0 } 으로 고쳐 보세요.
//                    그러면 <MenuItem name="물" /> 이 밑줄 없이 통과합니다.
//                    확인했으면 되돌리세요.

// ── 섹션 4: 안 넘겨도 되는 props 를 다루는 법 ──

// 물음표를 붙였지만 기본값은 안 주고 싶을 때가 있습니다.
// "넘어오면 보여 주고, 안 넘어오면 아무것도 안 그린다" 같은 경우입니다.

type BadgeProps = {
  text: string;
  note?: string; // 안 넘겨도 됩니다
};

function Badge({ text, note }: BadgeProps) {
  return (
    <span>
      [{text}]{note ? ` (${note})` : ""}
    </span>
  );
}

// note 는 string | undefined 입니다.
// 그래서 그냥 note.length 라고 쓰면 밑줄이 생깁니다.

// function BadBadge({ note }: BadgeProps) {
//   return <span>{note.length}</span>;
// }
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS18048: 'note' is possibly 'undefined'.

// 위 Badge 처럼 삼항으로 확인하고 쓰면 밑줄이 사라집니다.
// 05단원 개념01의 조건부 렌더링을 그대로 쓴 것뿐입니다.
// 타입스크립트는 "if 나 삼항으로 확인한 뒤" 라는 것을 알아봅니다.

// ✏️ 직접 해보기 4 — BadgeProps 에 count?: number 를 추가하고
//                    넘어왔을 때만 [텍스트] x3 처럼 보이게 해 보세요.

// ── 섹션 5: children 의 타입 ──

// 03단원 개념04에서 만든 상자 컴포넌트입니다. 태그 사이에 넣은 것이 children 으로 옵니다.
// children 도 props 하나이니 타입에 적어 줘야 합니다.
// 그런데 무엇이 들어올지 모릅니다. 글자일 수도, 태그일 수도, 목록일 수도 있습니다.
//
// 그래서 React 가 미리 만들어 둔 이름을 씁니다.

type BoxProps = {
  title: string;
  children: React.ReactNode;
};

function Box({ title, children }: BoxProps) {
  return (
    <div className="output">
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}

// React.ReactNode 는 "화면에 그릴 수 있는 것 아무거나" 라는 뜻입니다.
// 글자·숫자·JSX·배열·null 을 전부 포함합니다.
// children 에는 거의 언제나 이것을 씁니다. 다른 것은 몰라도 됩니다.
//
// React. 를 앞에 붙이는데도 import 를 따로 안 했습니다.
// @types/react 가 React 라는 이름을 어디서나 쓸 수 있게 미리 등록해 두기 때문입니다.
// (개념01 6절에서 말한 "React 설명서" 가 이 일을 합니다)
//
// children 도 물음표를 붙일 수 있습니다. 차이는 이렇습니다.
//
//     children: React.ReactNode     →  <Box title="가" /> 는 밑줄
//         error TS2741: Property 'children' is missing in type '{ title: string; }' but required in type 'BoxProps'.
//     children?: React.ReactNode    →  <Box title="가" /> 도 통과
//
// 안이 비어도 되는 상자면 물음표를 붙이세요.

type CardProps = {
  title: string;
  children?: React.ReactNode; // 비어 있어도 됩니다
};

function Card({ title, children }: CardProps) {
  return (
    <div className="output">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

// ✏️ 직접 해보기 5 — 화면 ④ 에 <Card title="빈 상자" /> 를 하나 더 넣어 보세요.
//                    밑줄 없이 통과하는지 확인하세요.

// ── 섹션 6: 객체·배열·함수를 props 로 받기 ──

// 03단원 개념03 섹션5에서 객체를 통째로 넘겼습니다. 타입도 그대로 씁니다.

type Menu = { name: string; price: number };

type MenuCardProps = {
  menu: Menu; // 개념02에서 만든 타입을 그대로 씁니다
};

function MenuCard({ menu }: MenuCardProps) {
  return (
    <div className="output">
      <strong>{menu.name}</strong> — {menu.price}원
    </div>
  );
}

// 목록을 통째로 넘길 때는 대괄호를 붙입니다. 05단원 개념02의 map 그대로입니다.

type MenuListProps = {
  menus: Menu[];
};

function MenuList({ menus }: MenuListProps) {
  return (
    <ul>
      {menus.map((m) => (
        <li key={m.name}>
          {m.name} — {m.price}원
        </li>
      ))}
    </ul>
  );
}

// map 안의 m 에는 타입을 안 적었는데도 Menu 입니다. menus 가 Menu[] 이기 때문입니다.
// m. 까지만 쳐 보세요. name 과 price 가 목록으로 뜹니다.
// 그래서 m.nmae 같은 오타가 그 자리에서 밑줄로 잡힙니다.
//
// 07단원 개념04에서 함수를 props 로 내려보냈습니다. 그것도 타입을 적을 수 있습니다.

type AddButtonProps = {
  label: string;
  onAdd: () => void; // "받는 것 없고 돌려주는 것도 없는 함수"
};

function AddButton({ label, onAdd }: AddButtonProps) {
  return (
    <button type="button" onClick={onAdd}>
      {label}
    </button>
  );
}

// () => void 는 "()" 매개변수 없음 + "=>" 화살표 함수 모양 + "void" 돌려주는 값 없음 입니다.
// 값을 하나 받는 함수라면 (name: string) => void 라고 적습니다. 이 정도면 충분합니다.

// ✏️ 직접 해보기 6 — AddButtonProps 의 onAdd 를 (name: string) => void 로 바꾸고
//                    아래 handleAdd 도 이름을 받아 콘솔에 찍게 고쳐 보세요.

// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 타입을 매개변수 안쪽에 붙임 ★ 가장 자주 납니다
// function Bad1({ name: string, price: number }) { ... }
//   실수: 밑줄이 잔뜩 생깁니다. 이건 타입이 아니라 03단원 개념03 섹션4의
//         **이름 바꾸기** 입니다. "name 을 string 이라는 변수로 받겠다" 가 됩니다.
//         컴포넌트가 받는 것은 객체 하나이니(03단원 개념02) 타입도 객체 하나에 대해 적습니다.
//         그러니 닫는 중괄호 **바깥**에 붙입니다.
//           ({ name, price }: MenuItemProps)
//                          └ 여기입니다

// [실수 2] 기본값을 줬으니 안 넘겨도 되는 줄 앎 ★ 자주 납니다
//   섹션 3에서 본 그대로입니다. 기본값과 물음표는 다른 것입니다.
//   기본값을 줬으면 타입에도 물음표를 붙이세요.

// [실수 3] children 을 타입에 안 적음
// type Bad3Props = { title: string };
// function Bad3({ title, children }: Bad3Props) { ... }
//   실수: children 자리에 밑줄이 생깁니다.
//         error TS2339: Property 'children' does not exist on type 'Bad3Props'.
//         React 가 알아서 넣어 주지 않습니다. 쓸 것이면 직접 적어야 합니다.

// [실수 4] 타입만 고치고 넘기는 쪽을 안 고침 ★ 에러가 두 곳에 생깁니다
//   Props 에 속성을 추가하면, 그 컴포넌트를 쓰는 **모든 자리**에 밑줄이 생깁니다.
//   놀라지 마세요. 그게 타입의 목적입니다.
//   "여기도 고쳐야 한다" 를 전부 찾아 주는 것이라, 오히려 빠뜨릴 일이 없어집니다.
//   VS Code 왼쪽 아래 문제 탭을 열면 고칠 곳이 목록으로 나옵니다.

// ── 화면에 그리기 ──

const menus: Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

export default function Concept03PropsTypes() {
  // useState 에 타입을 붙이는 것은 개념04에서 봅니다. 여기서는 그냥 씁니다.
  const [cart, setCart] = useState(0);

  // 담기를 누르면 콘솔에 이렇게 찍힙니다.
  function handleAdd() {
    setCart((prev) => prev + 1);
    console.log("담기를 눌렀습니다");
    // 콘솔: 담기를 눌렀습니다
  }

  return (
    <div>
      <h1>개념 03 — props 에 타입 붙이기</h1>

      <p className="guide">
        화면은 03단원 개념03·04와 거의 같습니다. <strong>달라진 것은 코드뿐입니다.</strong>
        <br />
        VS Code 로 이 파일을 열고, 컴포넌트 이름 위에 마우스를 올려 보세요. 무엇을 받는지
        그대로 뜹니다.
      </p>

      <div className="demo">
        <h3>① type 으로 설명서를 적은 컴포넌트</h3>
        <div className="output">
          <MenuItem name="아메리카노" price={4000} />
          <MenuItem name="라떼" price={4500} />
          <MenuItem name="케이크" price={6000} />
        </div>
      </div>

      <div className="demo">
        <h3>② 기본값 — 물음표가 있어야 안 넘길 수 있습니다</h3>
        <div className="output">
          <Greeting name="이서연" />
          <Greeting2 name="김민준" />
          <Greeting2 />
        </div>
      </div>

      <div className="demo">
        <h3>③ 선택 속성 — 넘어왔을 때만 보이기</h3>
        <div className="output">
          <Badge text="아메리카노" note="뜨거움" />
          <br />
          <Badge text="삼각김밥" />
        </div>
      </div>

      <div className="demo">
        <h3>④ children — 태그 사이에 넣은 것</h3>
        <Box title="오늘의 메뉴">
          <p>아메리카노가 제일 잘 나갑니다.</p>
        </Box>
        <Card title="안이 비어도 되는 상자" />
      </div>

      <div className="demo">
        <h3>⑤ 객체·배열·함수를 props 로</h3>
        <MenuCard menu={menus[1]} />
        <MenuList menus={menus} />
        <div className="output">
          <AddButton label="담기" onAdd={handleAdd} />
          장바구니: {cart}개
        </div>
      </div>

      <Summary
        items={[
          "props 타입은 type Props = { ... } 로 적고, 구조분해 뒤에 붙입니다. ({ name, price }: MenuItemProps) 처럼 닫는 중괄호 바깥입니다.",
          ".tsx 에서 타입을 안 붙이면 밑줄이 생깁니다. error TS7031: Binding element 'name' implicitly has an 'any' type.",
          "넘기는 쪽 코드는 03단원과 한 글자도 안 바뀝니다. 받는 쪽에 설명서 한 줄이 붙는 것뿐입니다.",
          "빠뜨림·종류 다름·이름 오타가 전부 넘기는 쪽에서 잡힙니다. 03단원에서 조용히 undefined 가 되던 오타가 밑줄이 됩니다.",
          "기본값과 물음표는 다른 것입니다. 기본값을 줬으면 타입에도 name?: string 처럼 물음표를 붙여야 안 넘길 수 있습니다.",
          "children 은 React.ReactNode 로 적습니다. '화면에 그릴 수 있는 것 아무거나' 라는 뜻입니다. 안 적으면 children 을 못 씁니다.",
          "객체는 Menu, 목록은 Menu[], 함수는 () => void 로 적습니다. map 안의 값에는 타입이 저절로 붙습니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 주석을 풀면 name 과 price 양쪽에 빨간 물결이 생깁니다.
//    마우스를 올리면 이렇게 뜹니다.
//      Binding element 'name' implicitly has an 'any' type.
//    → 화면은 멀쩡합니다. 이 상태로 npm run typecheck 를 돌리면 실패합니다.
//      다시 주석을 붙이면 통과합니다.
//
// 2) type MenuItemProps = {
//      name: string;
//      price: number;
//      kcal: number;
//    };
//    → 화면 ① 의 <MenuItem /> 세 개에 전부 이 밑줄이 생깁니다.
//      error TS2741: Property 'kcal' is missing in type '{ name: string; price: number; }' but required in type 'MenuItemProps'.
//      실수 4에서 말한 그것입니다. 고칠 곳을 전부 찾아 준 것입니다.
//      kcal?: number 로 물음표를 붙이면 밑줄이 한 번에 사라집니다.
//
// 3) type MenuItemProps = {
//      name: string;
//      price?: number;
//    };
//    function MenuItem({ name, price = 0 }: MenuItemProps) { ... }
//    // 화면: 물 — 0원
//    → price = 0 을 안 주고 price?: number 만 붙이면
//      {price}원 자리는 밑줄 없이 통과하지만(그냥 그리기만 하니까)
//      화면에는 "물 — 원" 이 나옵니다. undefined 는 화면에 안 그려집니다(02단원).
//
// 4) type BadgeProps = {
//      text: string;
//      note?: string;
//      count?: number;
//    };
//    function Badge({ text, note, count }: BadgeProps) {
//      return (
//        <span>
//          [{text}]{note ? ` (${note})` : ""}{count ? ` x${count}` : ""}
//        </span>
//      );
//    }
//    쓸 때: <Badge text="아메리카노" note="뜨거움" count={3} />
//    // 화면: [아메리카노] (뜨거움) x3
//    → count 를 안 넘기면 x 부분이 안 나옵니다.
//      count && ` x${count}` 라고 쓰면 count 가 0 일 때 화면에 0 이 찍힙니다.
//      05단원 개념05의 falsy 함정 그대로입니다. 삼항이 안전합니다.
//
// 5) <Card title="빈 상자" />
//    // 화면: 빈 상자   (제목만 나오고 아래는 비어 있습니다)
//    → CardProps 의 children 에 물음표가 있어서 통과합니다.
//      Box 로 바꿔서 <Box title="빈 상자" /> 라고 하면 밑줄이 생깁니다.
//      error TS2741: Property 'children' is missing in type '{ title: string; }' but required in type 'BoxProps'.
//
// 6) type AddButtonProps = {
//      label: string;
//      onAdd: (name: string) => void;
//    };
//    function AddButton({ label, onAdd }: AddButtonProps) {
//      return (
//        <button type="button" onClick={() => onAdd("아메리카노")}>
//          {label}
//        </button>
//      );
//    }
//    function handleAdd(name: string) {
//      setCart((prev) => prev + 1);
//      console.log("담기를 눌렀습니다:", name);
//    }
//    // 콘솔(누르면): 담기를 눌렀습니다: 아메리카노
//    → onClick={onAdd} 로 그대로 두면 밑줄이 생깁니다.
//      onClick 은 함수에 이벤트 객체를 넘기는데, onAdd 는 문자열을 기다리기 때문입니다.
//      그래서 () => onAdd("아메리카노") 로 감싸야 합니다. 04단원 개념01에서 배운 그 모양입니다.
