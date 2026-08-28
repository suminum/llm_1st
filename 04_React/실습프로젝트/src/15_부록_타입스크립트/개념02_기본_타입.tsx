// ============================================================
// 15단원(부록) · 개념 02 — 기본 타입
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01에서 읽은 것을 한 줄로 줄이면 이렇습니다.
//
//     타입 = "이 자리에 들어올 수 있는 값의 종류" 를 미리 적어 두는 것
//
// 이 파일에서는 그 "종류" 를 적는 법을 봅니다. 새로 배우는 문법은 여섯 개뿐입니다.
//
//     : string     : number     : boolean
//     : string[]   { name: string }   type 별칭
//
// ★ 이 파일은 VS Code 로 열어 두세요.
//   타입 에러는 화면에 안 나옵니다. 빨간 물결 밑줄로만 보입니다. (개념01 4절)
//
// ★ 주석으로 막아 둔 코드가 여러 번 나옵니다.
//   "주석을 풀면 ..." 이라고 적힌 것은 직접 풀어서 밑줄을 확인해 보세요.
//   확인했으면 다시 // 를 붙이세요. 안 붙이면 npm run typecheck 가 실패합니다.
//   01~07단원과 달리 주석을 풀어도 화면은 멀쩡합니다. Vite 가 타입을 지우고 보내기 때문입니다.

import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 타입을 적는 자리 ──

// 모양은 이것 하나입니다. 변수 이름 뒤에 콜론을 찍고 종류를 적습니다.
//
//     const 이름: 타입 = 값;
//              └──┘
//              여기가 새로 배우는 부분입니다
//
// 종류 이름은 전부 소문자입니다.

const menuName: string = "아메리카노"; // 글자
const menuPrice: number = 4000; // 숫자
const isHot: boolean = true; // 참/거짓

console.log(menuName, menuPrice, isHot);
// 콘솔: 아메리카노 4000 true

// 값은 지금까지 쓰던 것과 똑같습니다. 앞에 표시만 붙었습니다.
// JS자료 01단원에서 배운 자료형 세 가지가 그대로 이름이 된 것입니다.
//
//   string  — 따옴표로 감싼 글자
//   number  — 숫자. 정수와 소수를 구분하지 않습니다
//   boolean — true / false
//
// 전부 소문자입니다. String 처럼 대문자로 시작하는 것도 있지만 다른 물건이니 쓰지 마세요.
//
// 이제 종류가 어긋나면 실행하기 전에 걸립니다.

// const wrongPrice: number = "4000";
//   ← 주석을 풀면 VS Code 에 빨간 밑줄이 생기고 npm run typecheck 가 실패합니다
//     error TS2322: Type 'string' is not assignable to type 'number'.
//     "string 타입은 number 타입 자리에 넣을 수 없습니다"

// 한 번 정해진 종류는 나중에도 안 바뀝니다.

let count: number = 0;
count = 5; // 숫자니까 됩니다
// count = "다섯";
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2322: Type 'string' is not assignable to type 'number'.

console.log(count);
// 콘솔: 5

// 종류를 알면 쓸 수 있는 것도 정해집니다.
// menuPrice 는 숫자니까 toUpperCase()(대문자 만들기)가 없습니다.

// console.log(menuPrice.toUpperCase());
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2339: Property 'toUpperCase' does not exist on type 'number'.
//     "number 타입에는 toUpperCase 라는 것이 없습니다"

// JS자료에서 이런 실수를 하면 실행한 뒤에야
// TypeError: x.toUpperCase is not a function 을 봤습니다.
// 이제는 치는 순간 밑줄이 생깁니다. 그 차이 하나가 전부입니다.

// ✏️ 직접 해보기 1 — const menuKcal: number = 0; 을 만들고 값을 "없음" 으로 바꿔 보세요.
//                    어떤 밑줄이 생기는지 확인한 뒤 다시 숫자로 되돌리세요.

// ── 섹션 2: 안 적어도 알아냅니다 — 타입 추론 ──

// 사실 위 세 줄은 `: string` 을 안 적어도 됩니다.
// 오른쪽 값을 보면 종류가 뻔하기 때문입니다.
// 이렇게 타입스크립트가 알아서 알아내는 것을 **타입 추론** 이라고 합니다.

const cakeName = "케이크"; // 알아서 글자
const cakePrice = 6000; // 알아서 숫자
const cakeTotal = cakePrice * 2; // 알아서 숫자

console.log(cakeName, cakePrice, cakeTotal);
// 콘솔: 케이크 6000 12000

// 적은 것과 똑같이 취급됩니다. 아래도 그대로 걸립니다.

// console.log(cakeTotal.trim());
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2339: Property 'trim' does not exist on type 'number'.
//
// [한 가지 더] VS Code 에서 각 변수 위에 마우스를 올려 보면 조금씩 다르게 뜹니다.
//     const cakePrice: 6000      ← const 는 다시 대입할 수 없으니 "그 값" 으로 좁게 잡습니다
//     const cakeTotal: number    ← 계산 결과는 얼마가 나올지 모르니 넓게 잡습니다
// 숫자로 쓰는 데는 아무 차이가 없습니다. 섹션 6의 유니온이 이 성질을 이용한 것입니다.
//
// 어쨌든 실무 코드는 생각보다 타입을 덜 적습니다.
// 값이 바로 옆에 있으면 안 적는 편이 깔끔합니다.
//
// 그럼 어디에 적어야 할까요? **값이 옆에 없는 자리** 입니다.
//
//   1. 함수의 매개변수 — 무엇이 들어올지 함수 안에서는 알 수 없습니다
//   2. 빈 배열이나 null 로 시작하는 값 — 볼 값이 없습니다 (개념04에서 다시 봅니다)
//
// 1번이 가장 중요합니다. 매개변수는 추론이 안 됩니다.

function getTotal(price: number, count: number) {
  return price * count;
}

console.log(getTotal(4000, 3));
// 콘솔: 12000

// 돌려주는 값의 타입은 안 적어도 됩니다. price * count 가 숫자니까 number 로 추론됩니다.
//
// 이제 개념01에서 본 그 사고가 여기서 걸립니다.

// console.log(getTotal("10", 5));
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
//     "string 을 number 자리(매개변수)에 넘길 수 없습니다"
//
// 매개변수 자리에 타입을 안 적으면 이런 밑줄이 생깁니다.
//     error TS7006: Parameter 'price' implicitly has an 'any' type.
// "이 매개변수가 뭔지 못 알아내겠다" 는 뜻입니다.
// tsconfig.json 의 "strict": true 가 이걸 잡아 줍니다.

// ✏️ 직접 해보기 2 — getTotal 을 불러 라떼(4500) 두 잔의 값을 콘솔에 찍어 보세요.

// ── 섹션 3: 배열 ──

// 배열은 "무엇이 들어 있는 배열인지" 까지 적습니다. 뒤에 대괄호를 붙입니다.

const menuList: string[] = ["아메리카노", "라떼", "케이크"];
const priceList: number[] = [4000, 4500, 6000];

console.log(menuList);
// 콘솔: ['아메리카노', '라떼', '케이크']
console.log(priceList);
// 콘솔: [4000, 4500, 6000]

// string[] 는 "글자만 들어 있는 배열" 이라는 뜻입니다.
// 그래서 숫자를 끼워 넣으면 걸립니다.

// const mixed: string[] = ["아메리카노", 4000];
//   ← 주석을 풀면 4000 자리에 밑줄이 생깁니다
//     error TS2322: Type 'number' is not assignable to type 'string'.

// 여기서 진짜 이득이 나옵니다. **꺼내 쓸 때도 종류를 압니다.**

const lengths = menuList.map((name) => name.length);

console.log(lengths);
// 콘솔: [5, 2, 3]

// map 의 name 에는 타입을 안 적었는데도 string 입니다.
// menuList 가 string[] 이니 안에 든 것은 string 일 수밖에 없기 때문입니다.
// VS Code 에서 name 위에 마우스를 올리면 (parameter) name: string 이라고 뜹니다.
//
// 반대로 priceList 는 숫자 배열이라 글자 메소드가 없습니다.

// const trimmed = priceList.map((n) => n.trim());
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2339: Property 'trim' does not exist on type 'number'.

// ✏️ 직접 해보기 3 — priceList 의 값을 전부 10% 올린 배열을 만들어 콘솔에 찍어 보세요.
//                    (JS자료 08단원 map 그대로입니다)

// ── 섹션 4: 객체와 type 별칭 ──

// 객체는 속성마다 종류를 적습니다. 중괄호 안에 줄줄이 적으면 됩니다.

const americano: { name: string; price: number } = {
  name: "아메리카노",
  price: 4000,
};

console.log(americano);
// 콘솔: { name: '아메리카노', price: 4000 }

// 그런데 메뉴가 세 개면 이 긴 것을 세 번 적어야 합니다.
// 그래서 **이름을 붙여 둡니다.** 이것을 타입 별칭이라고 합니다.

type Menu = { name: string; price: number };

// 읽는 법: "앞으로 Menu 라고 쓰면 { name: string; price: number } 를 뜻한다"
//
//   type  Menu  =  { ... };
//   ────  ────     ───────
//   키워드 이름     내용
//
// 이름은 대문자로 시작하는 것이 관례입니다. 컴포넌트 이름과 같은 규칙입니다.

const latte: Menu = { name: "라떼", price: 4500 };
const cake: Menu = { name: "케이크", price: 6000 };

console.log(latte, cake);
// 콘솔: { name: '라떼', price: 4500 } { name: '케이크', price: 6000 }

// 배열에도 그대로 씁니다. Menu[] 는 "Menu 가 여러 개 든 배열" 입니다.

const menus: Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

const sum = menus.reduce((acc, m) => acc + m.price, 0);

console.log(sum);
// 콘솔: 14500

// reduce 의 m 도 자동으로 Menu 입니다. m. 까지만 쳐도 name·price 가 목록으로 뜹니다.
//
// 어긋나면 세 가지 밑줄이 생깁니다. 메시지가 각각 다릅니다.

// const noPrice: Menu = { name: "물" };
//   ← 주석을 풀면 밑줄이 생깁니다 — 빠뜨렸을 때
//     error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Menu'.

// const textPrice: Menu = { name: "물", price: "0" };
//   ← 주석을 풀면 밑줄이 생깁니다 — 종류가 다를 때
//     error TS2322: Type 'string' is not assignable to type 'number'.

// const extra: Menu = { name: "물", price: 0, hot: true };
//   ← 주석을 풀면 밑줄이 생깁니다 — 없는 속성을 넣었을 때
//     error TS2353: Object literal may only specify known properties, and 'hot' does not exist in type 'Menu'.

// 세 번째가 특히 고맙습니다.
// 03단원 개념03 [실수 2] 에서 nmae 라고 잘못 써도 아무 말 없이 undefined 가 됐던 것,
// 그게 이제 밑줄로 잡힙니다.

// ✏️ 직접 해보기 4 — type User = { name: string; age: number }; 를 만들고
//                    김민준(20) 을 담은 변수를 하나 만들어 콘솔에 찍어 보세요.

// ── 섹션 5: 선택 속성 — 있어도 되고 없어도 되는 것 ──

// 03단원 개념03에서 props 에 기본값을 줬습니다. 안 넘어와도 되는 값이 있었습니다.
// 타입에서도 "이건 없어도 된다" 를 표시할 수 있습니다. 이름 뒤에 물음표를 붙입니다.

type Person = {
  name: string;
  nickname?: string; // ← 있어도 되고 없어도 됩니다
};

const minjun: Person = { name: "김민준" }; // 없어도 통과
const seoyeon: Person = { name: "이서연", nickname: "서니" }; // 있어도 통과

console.log(minjun.nickname);
// 콘솔: undefined
console.log(seoyeon.nickname);
// 콘솔: 서니

// 물음표를 붙이면 그 속성의 종류가 이렇게 바뀝니다.
//
//     nickname?: string   →   string | undefined
//                             "글자이거나, 아예 없거나"
//
// 개념01에서 useParams 가 주던 string | undefined 와 같은 모양입니다.
//
// 그래서 그냥 쓰면 안 됩니다. 없을 수도 있으니까요.

// console.log(minjun.nickname.length);
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS18048: 'minjun.nickname' is possibly 'undefined'.
//     "이거 없을 수도 있는데요?"
//
// 이 밑줄이 막아 주는 것이 바로 JS자료에서 제일 많이 보던 그 에러입니다.
//     TypeError: Cannot read properties of undefined (reading 'length')
//
// 확인하고 쓰면 밑줄이 사라집니다. 방법은 JS자료 02단원 개념04에서 배운 ?? 그대로입니다.

const nick1 = minjun.nickname ?? "별명 없음"; // ?? 는 null·undefined 일 때만 오른쪽 (JS자료 02단원 개념04)
const nick2 = seoyeon.nickname ?? "별명 없음";

console.log(nick1, nick2);
// 콘솔: 별명 없음 서니

// ✏️ 직접 해보기 5 — Person 에 age?: number 를 추가하고
//                    박지훈(28) 을 담은 변수를 만들어 콘솔에 찍어 보세요.

// ── 섹션 6: 유니온 — 정해진 것 중 하나 ──

// 사이즈처럼 "이 셋 중 하나여야 하는" 값이 있습니다.
// string 이라고 적으면 아무 글자나 다 들어갑니다. 오타를 못 잡습니다.
// 세로줄(|)로 이어 쓰면 그 목록 중 하나만 받게 됩니다.

type Size = "S" | "M" | "L";

const mySize: Size = "M";

console.log(mySize);
// 콘솔: M

// 세로줄은 "또는" 이라고 읽습니다. JS자료 02단원 개념04의 || 와 같은 뜻입니다.
// 값 자체를 타입으로 쓴 것이라 다른 글자는 못 들어옵니다.

// const bigSize: Size = "XL";
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2322: Type '"XL"' is not assignable to type 'Size'.
//
// 소문자 "m" 도 안 됩니다. 적어 둔 셋과 글자 하나까지 같아야 합니다.

// 유니온은 이런 자리에 씁니다.
//   - 버튼 종류: "primary" | "danger"
//   - 화면 상태: "로딩" | "성공" | "실패"   ← 09단원 개념04에서 state 세 개로 나눠 두던 것
//   - 정렬 방향: "asc" | "desc"
//
// VS Code 에서 따옴표를 열면 셋이 목록으로 떠서 고르기만 하면 됩니다.
//
// 세로줄로는 종류도 섞을 수 있습니다. string | number 는 "글자이거나 숫자" 입니다.
// 개념01에서 본 string | undefined 도 같은 모양이었습니다.
//
// 타입 별칭과 함께 쓰면 이런 것도 됩니다.

type Order = { menu: Menu; size: Size; memo?: string };

const myOrder: Order = { menu: latte, size: "L" };

console.log(myOrder);
// 콘솔: { menu: { name: '라떼', price: 4500 }, size: 'L' }

// ✏️ 직접 해보기 6 — type Pay = "카드" | "현금"; 을 만들고
//                    "카드" 를 담은 변수를 만들어 콘솔에 찍어 보세요.
//                    그 다음 "포인트" 로 바꿔 보고 밑줄을 확인하세요.

// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 물음표와 undefined 를 헷갈림
//   nickname?: string  은 "속성이 아예 없어도 된다" 는 뜻입니다.
//   { name: "김민준" } 처럼 아예 안 적는 것이 정상이고,
//   { name: "김민준", nickname: undefined } 라고 적을 필요는 없습니다.

// [실수 2] 선택 속성을 확인 없이 씀 ★ 가장 자주 납니다
//   섹션 5의 minjun.nickname.length 가 그것입니다.
//   error TS18048: '...' is possibly 'undefined'.
//   ?? 로 기본값을 주거나 if 로 확인하고 쓰세요. 밑줄이 사라집니다.

// [실수 3] 타입이 실행 중에도 검사해 줄 거라고 믿음 ★ 에러 없이 조용히 틀립니다
//
//   개념01 4절에서 본 그대로입니다. 타입은 브라우저에 존재하지 않습니다.
//   아래 코드는 밑줄이 하나도 없고 typecheck 도 통과합니다. 그런데 결과가 틀립니다.

function addTip(m: Menu): number {
  return m.price + 500; // 타입만 보면 4500 + 500 = 5000 이어야 합니다
}

// 서버에서 받은 값이라고 칩시다. JSON.parse 는 무엇이 나올지 모르니 검사하지 않습니다.
const fromServer = JSON.parse('{"name":"라떼","price":"4500"}');

console.log(addTip(fromServer));
// 콘솔: 4500500

//   price 가 문자열 "4500" 이라 + 가 이어 붙이기가 됐습니다. JS자료 01단원 그대로입니다.
//   타입은 "여기 숫자가 온다" 고 적어 둔 메모일 뿐,
//   실행 중에 진짜 숫자인지 확인해 주지는 않습니다.
//
//   그래서 이렇게 정리하면 됩니다.
//     내가 쓴 코드끼리 어긋나는 것  → 타입이 잡아 줍니다
//     바깥에서 들어온 값           → 타입은 못 잡습니다. 직접 확인해야 합니다

// ── 화면에 그리기 ──

export default function Concept02BasicTypes() {
  const sizeLabel: Size = "L";

  return (
    <div>
      <h1>개념 02 — 기본 타입</h1>

      <p className="guide">
        이 화면은 위 코드가 만든 값을 보여 줄 뿐입니다. <strong>진짜 볼 것은 코드입니다.</strong>
        <br />
        VS Code 로 이 파일을 열고, 주석으로 막아 둔 줄을 하나씩 풀어 보세요. 빨간 물결
        밑줄이 어떻게 생기는지 보는 것이 이 파일의 목적입니다.
        <br />
        <br />
        <strong>주석을 풀어도 이 화면은 안 깨집니다.</strong> Vite 가 타입을 지우고 보내기
        때문입니다. 확인이 끝나면 다시 <code>//</code> 를 붙이세요.
      </p>

      <div className="demo">
        <h3>① 기본 타입 세 가지</h3>
        <div className="output">
          {menuName} / {menuPrice}원 / 뜨거움: {String(isHot)}
        </div>
      </div>

      <div className="demo">
        <h3>② 배열 — string[] 과 number[]</h3>
        <div className="output">
          메뉴: {menuList.join(", ")}
          <br />
          가격: {priceList.join(", ")}
          <br />
          이름 길이: {lengths.join(", ")}
        </div>
      </div>

      <div className="demo">
        <h3>③ 객체와 type 별칭</h3>
        <ul>
          {menus.map((m) => (
            <li key={m.name}>
              {m.name} — {m.price}원
            </li>
          ))}
        </ul>
        <div className="output">합계: {sum}원</div>
      </div>

      <div className="demo">
        <h3>④ 선택 속성 — 없어도 되는 값</h3>
        <div className="output">
          {minjun.name} ({nick1})
          <br />
          {seoyeon.name} ({nick2})
        </div>
      </div>

      <div className="demo">
        <h3>⑤ 유니온 — 정해진 것 중 하나</h3>
        <div className="output">
          주문: {myOrder.menu.name} / 사이즈 {myOrder.size} / 내 사이즈 {sizeLabel}
        </div>
      </div>

      <div className="demo">
        <h3>⑥ 실수 3 — 타입은 실행 중에 검사하지 않습니다</h3>
        <div className="output">
          addTip 이 number 를 돌려준다고 적혀 있는데 화면에는 <strong>{addTip(fromServer)}</strong>{" "}
          이 나옵니다.
          <br />
          서버에서 온 price 가 문자열이라 <code>+</code> 가 이어 붙이기가 됐습니다.
        </div>
      </div>

      <Summary
        items={[
          "타입은 변수 이름 뒤에 콜론을 찍고 적습니다. const price: number = 4000; 종류 이름은 전부 소문자입니다.",
          "값이 옆에 있으면 안 적어도 알아냅니다(타입 추론). 꼭 적어야 하는 곳은 함수 매개변수입니다.",
          "배열은 string[] · number[] 처럼 씁니다. 꺼내 쓸 때도 종류를 알아서 map 안의 값에 자동완성이 붙습니다.",
          "객체 타입에 이름을 붙인 것이 type 별칭입니다. type Menu = { name: string; price: number }; 처럼 씁니다.",
          "이름 뒤에 ? 를 붙이면 없어도 되는 속성이 됩니다. 대신 종류가 string | undefined 가 되어 확인 없이 못 씁니다.",
          "세로줄(|)로 이으면 정해진 것 중 하나만 받습니다. type Size = \"S\" | \"M\" | \"L\";",
          "타입은 브라우저에 존재하지 않습니다. 서버에서 온 값처럼 바깥에서 들어온 것은 타입이 못 잡습니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const menuKcal: number = 0;
//    menuKcal 을 "없음" 으로 바꾸면(let 으로 바꾼 뒤 menuKcal = "없음";)
//    // error TS2322: Type 'string' is not assignable to type 'number'.
//    → const 인 채로 초기값만 "없음" 으로 바꿔도 같은 밑줄이 생깁니다.
//      메시지가 안 뜨면 VS Code 가 아니라 다른 편집기로 연 것입니다.
//
// 2) console.log(getTotal(4500, 2));
//    // 콘솔: 9000
//    → getTotal("4500", 2) 라고 따옴표를 붙이면 이 밑줄이 생깁니다.
//      error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
//
// 3) console.log(priceList.map((p) => p * 1.1));
//    // 콘솔: [4400, 4950, 6600.000000000001]
//    → 마지막 값만 소수점이 지저분한 것은 타입과 상관없는 일입니다.
//      JS자료 01단원에서 본 0.1 + 0.2 문제와 같은 이유입니다.
//      p 에 타입을 안 적어도 number 로 자동 추론됩니다. priceList 가 number[] 이기 때문입니다.
//
// 4) type User = { name: string; age: number };
//    const minjunUser: User = { name: "김민준", age: 20 };
//    console.log(minjunUser);
//    // 콘솔: { name: '김민준', age: 20 }
//    → age 를 빼면 이 밑줄이 생깁니다.
//      error TS2741: Property 'age' is missing in type '{ name: string; }' but required in type 'User'.
//
// 5) type Person = {
//      name: string;
//      nickname?: string;
//      age?: number;
//    };
//    const jihun: Person = { name: "박지훈", age: 28 };
//    console.log(jihun);
//    // 콘솔: { name: '박지훈', age: 28 }
//    → nickname 을 안 적어도 통과합니다. 물음표가 붙어 있기 때문입니다.
//      jihun.age * 2 를 하면 밑줄이 생깁니다. age 가 number | undefined 이기 때문입니다.
//      error TS18048: 'jihun.age' is possibly 'undefined'.
//
// 6) type Pay = "카드" | "현금";
//    const myPay: Pay = "카드";
//    console.log(myPay);
//    // 콘솔: 카드
//    → "포인트" 로 바꾸면 이 밑줄이 생깁니다.
//      error TS2322: Type '"포인트"' is not assignable to type 'Pay'.
//      화면은 그대로 잘 돌아갑니다. 밑줄로만 보입니다.
