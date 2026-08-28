// ============================================================
// 15단원(부록) · 개념 04 — useState 와 이벤트 타입
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념02에서 값에, 개념03에서 props 에 타입을 붙였습니다.
// 남은 것은 화면을 움직이게 하는 두 가지입니다. state 와 이벤트입니다.
//
// 이 파일에서 배우는 것은 세 가지입니다.
//
//   1. useState 는 대부분 알아서 알아냅니다 — 안 알아내는 두 경우가 있습니다
//   2. 못 알아낼 때 useState<타입> 으로 알려 줍니다
//   3. 이벤트 매개변수에는 이름이 긴 타입을 적습니다 — 외우지 않고 찾는 법을 봅니다
//
// ★ VS Code 로 열어 두세요. 타입 에러는 화면에 안 나옵니다. (개념01 4절)
// ★ "주석을 풀면 ..." 이라고 적힌 것은 직접 풀어서 밑줄을 확인하고 다시 붙이세요.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

type Menu = { name: string; price: number };

const menus: Menu[] = [
  { name: "아메리카노", price: 4000 },
  { name: "라떼", price: 4500 },
  { name: "케이크", price: 6000 },
];

// ── 섹션 1: 대부분은 알아서 알아냅니다 ──

// 04단원에서 쓰던 그대로입니다. 타입을 한 글자도 안 적어도 됩니다.
//
//     const [count, setCount] = useState(0);
//
// 개념02 섹션2의 타입 추론이 여기서도 일합니다.
// 초기값이 0 이니 count 는 number 이고, setCount 는 number 를 받는 함수가 됩니다.
//
// VS Code 에서 count 위에 마우스를 올려 보세요.
//     const count: number
// 라고 뜹니다. 안 적었는데도 이미 정해져 있습니다.
//
// 그래서 이런 것이 잡힙니다. (실제 코드는 아래 CounterDemo 안에 있습니다)
//
//     setCount("3");
//     error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.
//
// SetStateAction<number> 라는 낯선 이름이 보입니다.
// "setCount 에 넣을 수 있는 것" 이라는 뜻이고, 두 가지를 뜻합니다.
//
//     setCount(3)                 숫자를 그대로
//     setCount((prev) => prev+1)  이전 값을 받아 새 값을 돌려주는 함수  ← 04단원 개념05
//
// 04단원에서 배운 두 가지 방식이 그대로 한 이름에 들어 있는 것입니다.
// 이름이 길어서 그렇지 새로운 이야기가 아닙니다.

function CounterDemo() {
  const [count, setCount] = useState(0); // 초기값 0 → number

  function handlePlus() {
    setCount((prev) => prev + 1);
    // setCount("3");
    //   ← 주석을 풀면 밑줄이 생깁니다
    //     error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.
  }

  return (
    <div className="output">
      담긴 잔 수: {count}
      <br />
      <button type="button" onClick={handlePlus}>
        한 잔 담기
      </button>
    </div>
  );
}

// 문자열·불리언도 똑같습니다.
//
//     const [text, setText] = useState("");        → string
//     const [isOpen, setIsOpen] = useState(false); → boolean
//
// 초기값만 보고 다 알아냅니다. 여기까지는 타입스크립트를 쓴다는 느낌도 안 납니다.

// ✏️ 직접 해보기 1 — CounterDemo 안에 const [isHot, setIsHot] = useState(true); 를 넣고
//                    setIsHot("뜨거움") 을 써 보세요. 어떤 밑줄이 생기는지 확인하세요.

// ── 섹션 2: 못 알아내는 두 경우 ──

// 문제는 **초기값에 볼 것이 없을 때** 생깁니다. 두 가지가 있습니다.

// [경우 1] 빈 배열로 시작할 때
//
//     const [items, setItems] = useState([]);
//
// 06단원 개념05에서 목록을 만들 때 늘 이렇게 시작했습니다.
// 그런데 빈 배열에는 안에 아무것도 없습니다. 무엇이 들어올 배열인지 알 수가 없습니다.
//
// 이때 타입스크립트는 never[] 라고 정합니다.
// never 는 "아무것도 될 수 없는 것" 이라는 뜻입니다.
// 아무것도 못 넣는 배열이 되어 버립니다.

// function BrokenList() {
//   const [items, setItems] = useState([]);
//   function add() {
//     setItems(["아메리카노"]);
//   }
//   return <p>{items.map((item) => item.name)}</p>;
// }
//
//   ← 위 함수의 주석을 풀면(아래 두 줄은 그대로 두세요) 밑줄이 두 군데 생깁니다
//     "아메리카노" 자리:  error TS2322: Type 'string' is not assignable to type 'never'.
//     item.name 자리:    error TS2339: Property 'name' does not exist on type 'never'.

// "type 'never'" 라는 말이 나오면 십중팔구 useState([]) 입니다.
// 처음 보면 뜻을 알 수 없는 메시지인데, 원인은 늘 같습니다.

// [경우 2] null 로 시작할 때
//
//     const [user, setUser] = useState(null);
//
// 09단원에서 "아직 안 받아온 상태" 를 null 로 두던 그 코드입니다.
// 초기값이 null 이니 타입스크립트는 "이건 언제나 null 인 값" 이라고 정합니다.
// 그래서 나중에 진짜 값을 넣으면 걸립니다.

// function BrokenUser() {
//   const [user, setUser] = useState(null);
//   function load() {
//     setUser({ name: "김민준" });
//   }
//   return <p>{String(user)}</p>;
// }
//
//   ← 위 함수의 주석을 풀면 { name: "김민준" } 자리에 밑줄이 생깁니다
//     error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '(prevState: null) => null'.

// 두 경우의 공통점은 하나입니다.
// **초기값만 봐서는 앞으로 무엇이 들어올지 알 수 없다.**
// 그러면 우리가 직접 말해 주면 됩니다. 그게 다음 섹션입니다.

// ✏️ 직접 해보기 2 — 위 BrokenList 의 주석을 풀고 밑줄 두 개를 눈으로 확인하세요.
//                    확인했으면 다시 주석을 붙이세요.

// ── 섹션 3: useState<타입> 으로 알려 주기 ──

// useState 이름 뒤에 꺾쇠를 붙이고 그 안에 타입을 적습니다.
//
//     useState<string[]>([])
//             └──────┘
//             "글자가 들어올 배열이다"
//
// 꺾쇠 안에 타입을 적는 이 모양은 다른 데서도 자주 보게 됩니다.
// 지금은 "useState 에 알려 주는 자리" 로만 알아 두면 됩니다.

function TodoDemo() {
  const [todos, setTodos] = useState<string[]>([]); // 글자 목록
  const [text, setText] = useState(""); // 이건 추론됩니다
  const [picked, setPicked] = useState<Menu | null>(null); // 메뉴 하나 또는 아직 없음

  function handleAdd() {
    if (text.trim() === "") return;
    setTodos([...todos, text]); // 07단원 개념01 그대로
    setText("");
  }

  function handleReset() {
    setTodos([]);
    setPicked(null);
    console.log("비웠습니다");
    // 콘솔: 비웠습니다
  }

  return (
    <div className="output">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 적으세요"
      />
      <button type="button" onClick={handleAdd}>
        추가
      </button>
      <button type="button" onClick={handleReset}>
        비우기
      </button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>

      <div>
        {menus.map((m) => (
          <button key={m.name} type="button" onClick={() => setPicked(m)}>
            {m.name}
          </button>
        ))}
      </div>

      {/* picked 는 Menu | null 이라 확인하고 써야 합니다 */}
      {picked === null ? <p>고른 메뉴가 없습니다.</p> : <p>고른 메뉴: {picked.name}</p>}
    </div>
  );
}

// todos 는 이제 string[] 입니다. map 안의 todo 도 string 이라 todo.toUpperCase() 가 됩니다.
// 숫자를 넣으려 하면 밑줄이 생깁니다.
//
//     setTodos([...todos, 4000]);
//     error TS2322: Type 'string | number' is not assignable to type 'string'.
//       Type 'number' is not assignable to type 'string'.
//     error TS2322: Type 'number' is not assignable to type 'string'.
//
// 밑줄이 두 군데 생깁니다. 배열 전체에 하나, 4000 자리에 하나입니다.
// 고칠 곳은 한 곳(4000)이고, 나머지 하나는 그 때문에 배열 전체가 어긋난 것입니다.
//
// picked 는 Menu | null 입니다. "메뉴 하나 또는 아직 없음" 입니다.
// 개념02 섹션6의 유니온이 여기서 제 일을 합니다.
// 그리고 확인 없이 쓰면 막습니다.
//
//     <p>{picked.name}</p>
//     error TS18047: 'picked' is possibly 'null'.
//
// 이 밑줄이 막아 주는 것이 JS자료 10단원에서 제일 많이 보던 그 에러입니다.
//     TypeError: Cannot read properties of null (reading 'name')
//
// 위 코드처럼 picked === null 을 먼저 확인하면 밑줄이 사라집니다.
// 삼항의 오른쪽에서는 "여기까지 왔으면 null 이 아니다" 를 타입스크립트가 알아봅니다.

console.log("todos 는 string[] 이고 picked 는 Menu | null 입니다");
// 콘솔: todos 는 string[] 이고 picked 는 Menu | null 입니다

// ✏️ 직접 해보기 3 — TodoDemo 안에 const [prices, setPrices] = useState<number[]>([]); 를
//                    넣고 setPrices([...prices, "4000"]) 을 써 보세요. 밑줄을 확인하세요.

// ── 섹션 4: 입력칸의 이벤트 타입 ──

// 06단원 개념01에서 제어 컴포넌트를 배웠습니다.
//
//     <input value={text} onChange={handleChange} />
//
// 핸들러를 따로 빼면 매개변수 e 에 타입이 필요합니다.

// function handleChange(e) {
//   setText(e.target.value);
// }
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS7006: Parameter 'e' implicitly has an 'any' type.
//     개념03 섹션1의 그 밑줄과 같은 이야기입니다. 매개변수는 추론이 안 됩니다.
//
// 그럼 뭐라고 적어야 할까요? 이렇게 적습니다.
//
//     React.ChangeEvent<HTMLInputElement>
//     └───┘└────────┘ └───────────────┘
//     React 의  바뀜 이벤트   어느 태그에서 났나
//
// 이름이 깁니다. **외우지 마세요.** 찾는 방법이 있습니다.
//
//   1. 일단 화살표 함수로 그 자리에 바로 씁니다.  onChange={(e) => ...}
//      이러면 React 가 무슨 이벤트인지 아니까 타입이 저절로 붙습니다.
//   2. e 위에 마우스를 올립니다. 타입 이름이 그대로 뜹니다.
//   3. 그걸 복사해서 함수를 밖으로 뺄 때 붙입니다.
//
// 실무에서도 이렇게 합니다. 아무도 안 외웁니다.

function InputDemo() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("M");

  // 입력칸에서 난 바뀜 이벤트
  function handleText(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  // 고르기 칸에서 난 바뀜 이벤트 — 태그 이름이 다릅니다
  function handleSize(e: React.ChangeEvent<HTMLSelectElement>) {
    setSize(e.target.value);
  }

  return (
    <div className="output">
      <input value={text} onChange={handleText} placeholder="이름을 적으세요" />
      <select value={size} onChange={handleSize}>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
      </select>
      <p>
        {text === "" ? "(비어 있음)" : text} / 사이즈 {size}
      </p>
    </div>
  );
}

// 꺾쇠 안이 왜 필요할까요? **e.target 이 무엇인지 정해 주기 때문**입니다.
//
//   HTMLInputElement  → e.target.value 가 있습니다. 입력칸이니까요
//   HTMLSelectElement → 고르기 칸입니다
//   HTMLButtonElement → 버튼입니다
//
// 태그를 잘못 적으면 넘기는 자리에서 걸립니다.
//
//     <select onChange={handleText}>
//     error TS2322: Type '(e: ChangeEvent<HTMLInputElement, Element>) => void' is not assignable to type 'ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>'.
//
// 이 메시지는 아래로 몇 줄 더 이어집니다. **첫 줄만 읽으면 됩니다.**
// "input 용 함수를 select 자리에 넣었다" 는 뜻입니다.
// 태그 이름을 HTMLSelectElement 로 바꾸면 사라집니다.

// ✏️ 직접 해보기 4 — InputDemo 의 <select> 에 onChange={handleText} 를 넣어 보세요.
//                    첫 줄만 읽어 보고 다시 handleSize 로 되돌리세요.

// ── 섹션 5: form 과 버튼의 이벤트 타입 ──

// 06단원 개념04의 폼입니다. submit 이벤트에는 다른 이름을 씁니다.
//
//     React.FormEvent
//
// 입력칸의 e 는 "무엇이 입력됐나" 를 알아야 해서 태그까지 적었지만,
// submit 은 e.preventDefault() 만 부르는 경우가 대부분이라 꺾쇠를 안 붙여도 됩니다.

function FormDemo() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 06단원 개념04 · JS자료 11단원
    console.log("form 이 submit 됐습니다");
    // 콘솔: form 이 submit 됐습니다

    if (name.trim() === "") return;
    setSaved([...saved, name]);
    setName("");
  }

  // 버튼 클릭은 MouseEvent 입니다
  function handleClear(e: React.MouseEvent<HTMLButtonElement>) {
    console.log("누른 버튼의 글자:", e.currentTarget.textContent);
    // 콘솔: 누른 버튼의 글자: 지우기
    setSaved([]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 적으세요"
      />
      <button type="submit">저장</button>
      <button type="button" onClick={handleClear}>
        지우기
      </button>
      <ul>
        {saved.map((s, index) => (
          <li key={index}>{s}</li>
        ))}
      </ul>
    </form>
  );
}

// FormEvent 에서 e.target.value 를 꺼내려고 하면 걸립니다.

// function BadSubmit(e: React.FormEvent) {
//   console.log(e.target.value);
// }
//   ← 주석을 풀면 밑줄이 생깁니다
//     error TS2339: Property 'value' does not exist on type 'EventTarget'.
//
// submit 이벤트의 target 은 form 태그이지 입력칸이 아니기 때문입니다.
// 06단원 개념04에서 "입력값은 state 에서 꺼내 쓴다" 고 한 이유가 이것입니다.
// 위 handleSubmit 도 e 가 아니라 name 을 씁니다.
//
// 오타도 잡아 줍니다. 이건 특히 고맙습니다.
//
//     e.preventDefualt();
//     error TS2551: Property 'preventDefualt' does not exist on type 'FormEvent<Element>'. Did you mean 'preventDefault'?
//
// 맨 뒤에 "Did you mean 'preventDefault'?" 까지 붙습니다.
// 06단원에서 이 오타를 내면 새로고침이 일어나 화면이 초기화됐고,
// 원인을 찾느라 한참 걸렸습니다. 이제는 치는 순간 밑줄입니다.

// ✏️ 직접 해보기 5 — FormDemo 의 e.preventDefault() 를 e.preventDefualt() 로 바꿔 보세요.
//                    Did you mean 이 뜨는지 확인하고 되돌리세요.

// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] useState([]) 로 시작하고 이유를 모름 ★ 가장 자주 납니다
//   섹션 2의 그것입니다. "type 'never'" 가 보이면 useState([]) 를 찾으세요.
//   useState<string[]>([]) 처럼 무엇이 들어올 배열인지 적어 주면 끝납니다.

// [실수 2] useState(null) 로 시작하고 이유를 모름
//   섹션 2의 두 번째입니다. useState<Menu | null>(null) 이라고 적으세요.
//   "메뉴 하나 또는 아직 없음" 이라는 뜻입니다.

// [실수 3] null 검사를 안 하고 씀
//   error TS18047: 'picked' is possibly 'null'.
//   귀찮아 보이지만 이게 09단원에서 "받아오기 전에 화면이 먼저 그려져서" 터지던
//   그 사고를 통째로 막아 줍니다. if 나 삼항으로 먼저 확인하세요.

// [실수 4] 입력값이 문자열이라는 것을 잊음 ★ 개념01의 그 사고입니다
//   e.target.value 는 언제나 문자열입니다. 숫자 입력칸이어도 문자열입니다.

function NumberDemo() {
  const [count, setCount] = useState(0); // number

  function handleCount(e: React.ChangeEvent<HTMLInputElement>) {
    // setCount(e.target.value);
    //   ← 주석을 풀면 밑줄이 생깁니다
    //     error TS2345: Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.

    setCount(Number(e.target.value)); // 이렇게 바꿔서 넣어야 합니다
  }

  return (
    <div className="output">
      <input type="number" value={count} onChange={handleCount} />
      <p>두 배: {count * 2}</p>
    </div>
  );
}

//   type="number" 를 써도 e.target.value 는 문자열입니다. HTML 속성이라 그렇습니다.
//   개념01 2절의 dataset 이야기와 완전히 같은 이유입니다.
//   JS자료에서는 이걸 잊으면 화면에 "00" 이나 NaN 이 조용히 찍혔습니다.

// [실수 5] 메시지가 길다고 안 읽음
//   타입 에러 메시지는 아래로 길게 이어질 때가 많습니다.
//   **거의 언제나 첫 줄에 답이 있습니다.** 아래는 자세한 설명입니다.
//   첫 줄을 읽고 모르겠으면 그때 아래를 보세요.

// ── 화면에 그리기 ──

export default function Concept04StateAndEvents() {
  return (
    <div>
      <h1>개념 04 — useState 와 이벤트 타입</h1>

      <p className="guide">
        화면은 04·06단원에서 만든 것과 같습니다. <strong>달라진 것은 코드뿐입니다.</strong>
        <br />
        VS Code 로 이 파일을 열고 <code>count</code>·<code>todos</code>·<code>picked</code> 위에
        마우스를 올려 보세요. 타입이 어떻게 정해졌는지 그대로 뜹니다.
      </p>

      <div className="demo">
        <h3>① 추론되는 state — useState(0)</h3>
        <CounterDemo />
      </div>

      <div className="demo">
        <h3>② 알려 줘야 하는 state — useState&lt;string[]&gt;([]) 와 useState&lt;Menu | null&gt;(null)</h3>
        <TodoDemo />
      </div>

      <div className="demo">
        <h3>③ 입력칸과 고르기 칸의 이벤트</h3>
        <InputDemo />
      </div>

      <div className="demo">
        <h3>④ form 의 submit 과 버튼의 클릭</h3>
        <FormDemo />
      </div>

      <div className="demo">
        <h3>⑤ 실수 4 — 입력값은 언제나 문자열입니다</h3>
        <NumberDemo />
      </div>

      <Summary
        items={[
          "useState 는 초기값을 보고 타입을 알아냅니다. useState(0) 이면 number, useState('') 면 string 입니다.",
          "빈 배열 useState([]) 는 never[] 가 되어 아무것도 못 넣습니다. 'type never' 가 보이면 이걸 의심하세요.",
          "null 로 시작한 useState(null) 도 마찬가지입니다. 나중에 진짜 값을 넣을 때 걸립니다.",
          "못 알아낼 때는 useState<string[]>([]) · useState<Menu | null>(null) 처럼 꺾쇠 안에 적어 줍니다.",
          "Menu | null 로 적으면 확인 없이 못 씁니다. error TS18047: 'picked' is possibly 'null'. 09단원에서 터지던 사고를 막아 줍니다.",
          "이벤트 타입은 React.ChangeEvent<HTMLInputElement> 처럼 깁니다. 외우지 말고 화살표 함수로 먼저 쓴 뒤 e 에 마우스를 올려 복사하세요.",
          "submit 은 React.FormEvent 입니다. e.target.value 는 없습니다. 입력값은 state 에서 꺼내 씁니다.",
          "e.target.value 는 type='number' 여도 문자열입니다. Number() 로 바꿔서 넣어야 합니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const [isHot, setIsHot] = useState(true);
//    setIsHot("뜨거움");
//    // error TS2345: Argument of type '"뜨거움"' is not assignable to parameter of type 'SetStateAction<boolean>'.
//    → 초기값이 true 라서 boolean 으로 정해졌습니다.
//      섹션 1의 number 짜리와 메시지 모양이 같고 뒤쪽 이름만 boolean 으로 바뀌었습니다.
//      앞쪽이 'string' 이 아니라 '"뜨거움"' 으로 나오는 것은
//      내가 적은 그 값을 그대로 보여 주는 것뿐입니다. 읽는 데는 차이가 없습니다.
//
// 2) 밑줄 두 개가 이렇게 뜹니다.
//    // error TS2322: Type 'string' is not assignable to type 'never'.
//    // error TS2339: Property 'name' does not exist on type 'never'.
//    → 고치는 법은 useState<string[]>([]) 처럼 무엇이 들어올 배열인지 적는 것입니다.
//      그러면 두 밑줄이 한 번에 사라집니다.
//      (두 번째 줄은 item.name 을 쓰려던 것이니 Menu[] 가 맞겠지요)
//
// 3) const [prices, setPrices] = useState<number[]>([]);
//    setPrices([...prices, "4000"]);
//    // error TS2322: Type 'string | number' is not assignable to type 'number'.
//    //   Type 'string' is not assignable to type 'number'.
//    // error TS2322: Type 'string' is not assignable to type 'number'.
//    → 섹션 3에서 본 그대로 밑줄이 두 군데 생깁니다. 고칠 곳은 "4000" 하나뿐입니다.
//      따옴표를 빼고 setPrices([...prices, 4000]) 이라고 하면 둘 다 사라집니다.
//      개념01 2절의 "10" + 5 사고를 state 에서 막아 주는 것이 이것입니다.
//
// 4) <select value={size} onChange={handleText}>
//    // error TS2322: Type '(e: ChangeEvent<HTMLInputElement, Element>) => void' is not assignable to type 'ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>'.
//    → 아래로 네 줄쯤 더 이어지는데, 마지막 줄에는
//      HTMLSelectElement 에 없는 속성 이름이 잔뜩 나옵니다. 읽을 필요 없습니다.
//      첫 줄의 HTMLInputElement 와 HTMLSelectElement 두 단어만 보면 원인이 보입니다.
//
// 5) e.preventDefualt();
//    // error TS2551: Property 'preventDefualt' does not exist on type 'FormEvent<Element>'. Did you mean 'preventDefault'?
//    → 화면에서 저장을 누르면 페이지가 새로고침되면서 입력한 것이 다 날아갑니다.
//      06단원에서 이 사고가 났을 때는 원인을 찾기가 어려웠습니다.
//      이제는 저장 버튼을 누르기 전에 밑줄로 먼저 보입니다.
