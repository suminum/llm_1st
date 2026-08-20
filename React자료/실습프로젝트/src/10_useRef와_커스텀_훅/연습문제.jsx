// ============================================================
// 10단원 연습문제 — useRef 와 커스텀 훅
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//       고치고 저장하면 화면이 바로 바뀝니다. F12 → Console 도 함께 보세요.
//
// 문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다.
// 문제마다 '기대 결과' 가 적혀 있으니 그대로 나오는지 확인하세요.
//
// ★ 아직 안 푼 문제는 "문제 N: ..." 같은 안내 글자가 그대로 보입니다. 정상입니다.
// ★ 개발 중에는 StrictMode 때문에 콘솔 줄이 두 번씩 찍힙니다. 이것도 정상입니다.
// ============================================================

// 필요한 것은 미리 다 꺼내 두었습니다. 문제를 풀면서 골라 쓰세요.
import { useState, useRef, useEffect, memo } from "react";
import Summary from "../_ui/Summary.jsx";

// 문제에서 함께 쓰는 데이터입니다. 고치지 마세요.
const menuNames = [
  "아메리카노",
  "카페라떼",
  "바닐라라떼",
  "카페모카",
  "녹차라떼",
  "케이크",
  "쿠키",
  "삼각김밥",
];

const menuItems = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// ───── 문제 1 ───── (개념01)
// [커서 놓기] 를 누르면 입력칸에 커서가 놓이게 하세요.
// 할 일은 세 가지입니다. useRef 로 상자 만들기 / input 에 ref 붙이기 / focus 부르기.
//
// 기대 결과 (화면): 버튼을 누르면 입력칸 테두리가 진해지고 커서가 깜빡입니다.
//                  아무 일도 안 일어나면 input 에 ref={...} 를 안 붙인 것입니다.
//                  콘솔에 Cannot read properties of null 이 나오면
//                  ref 는 만들었는데 input 에 안 붙인 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q1Focus() {
  // TODO 1: 여기에 ref 상자를 만드세요

  function handleFocus() {
    // TODO 1: 여기에서 입력칸에 커서를 놓으세요
  }

  return (
    <div className="output">
      <input placeholder="여기에 커서가 와야 합니다" />
      <button onClick={handleFocus}>커서 놓기</button>
    </div>
  );
}

// ───── 문제 2 ───── (개념01)
// [지우고 커서 놓기] 를 누르면 입력칸을 비우고, 그 자리에 커서를 놓으세요.
// 상자(inputRef)는 이미 만들어서 input 에 붙여 두었습니다.
// 비우는 일과 커서를 놓는 일 중 어느 쪽이 state 이고 어느 쪽이 ref 인지 생각해 보세요.
//
// 기대 결과 (화면): 입력칸이 비고, 그 자리에 커서가 깜빡입니다.
//                  글자만 지워지고 커서가 없으면 focus() 를 안 부른 것입니다.
//                  커서만 오고 글자가 남아 있으면 setText 를 안 부른 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q2ClearAndFocus() {
  const [text, setText] = useState("아메리카노");
  const inputRef = useRef(null);

  function handleClear() {
    // TODO 2: 여기에 코드를 쓰세요
  }

  return (
    <div className="output">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleClear}>지우고 커서 놓기</button>
      <div>지금 값: {text || "(비어 있음)"}</div>
    </div>
  );
}

// ───── 문제 3 ───── (개념01)
// [케이크로 가기] 를 누르면 목록이 '케이크' 줄까지 스르륵 내려가게 하세요.
// ref 는 이미 '케이크' 줄에 붙여 두었습니다. 부르는 코드만 쓰면 됩니다.
// 스르륵 움직이게 하고, 케이크 줄이 상자 가운데에 오게 하세요.
//
// 기대 결과 (화면): 목록 상자가 스르륵 내려가 '케이크' 가 가운데에 보입니다.
//                  순간이동하듯 툭 움직이면 behavior 옵션을 안 준 것입니다.
//                  케이크가 상자 맨 위에 붙으면 block 옵션을 안 준 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q3Scroll() {
  const cakeRef = useRef(null);

  function handleGo() {
    // TODO 3: 여기에 코드를 쓰세요
  }

  return (
    <div className="output">
      <button onClick={handleGo}>케이크로 가기</button>
      <div
        style={{
          height: 110,
          overflowY: "auto",
          border: "1px solid #ccc",
          background: "#fff",
          marginTop: 6,
        }}
      >
        <ul>
          {menuNames.map((name) => (
            <li key={name} ref={name === "케이크" ? cakeRef : null}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ───── 문제 4 ───── (개념02)
// [ref 올리기] 를 누르면 상자 안의 값을 1 올리고,
// 콘솔에 "지금 진짜 값: N" 을 찍으세요. 화면은 손대지 마세요.
//
// 기대 결과 (화면): [ref 올리기] 를 세 번 눌러도 "화면에 보이는 값" 은 0 그대로입니다.
//                  그 다음 [다시 그리기] 를 누르면 화면 값이 3 으로 바뀝니다.
// 기대 결과 (콘솔): 누를 때마다 지금 진짜 값: 1 / 2 / 3 이 찍힙니다.
//                  화면 값이 누를 때마다 바로 바뀌면 useState 로 만든 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q4RefNoRender() {
  const countRef = useRef(0);
  const [tick, setTick] = useState(0);

  function handleUp() {
    // TODO 4: 여기에 코드를 쓰세요
  }

  return (
    <div className="output">
      <div>화면에 보이는 값: {countRef.current}</div>
      <div>다시 그린 횟수: {tick}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={handleUp}>ref 올리기</button>
        <button onClick={() => setTick(tick + 1)}>다시 그리기</button>
      </div>
    </div>
  );
}

// ───── 문제 5 ───── (개념02)
// 아래 코드는 잘못됐습니다. [담기] 를 눌러도 화면 숫자가 안 바뀝니다.
// 화면에 보여야 하는 값이 ref 에 들어 있기 때문입니다.
// ref 를 state 로 바꿔서 고치세요. (화면 글자와 버튼은 그대로 두세요)
//
// 기대 결과 (화면): [담기] 를 누를 때마다 숫자가 1씩 올라갑니다.
//                  안 올라가면 아직 ref 인 것입니다.
//                  화면이 빨간 상자가 되면 .current 를 지우지 않고 남겨 둔 것입니다.
// TODO: 아래 함수 안을 고치세요

function Q5FixToState() {
  const countRef = useRef(0);

  function handleAdd() {
    countRef.current = countRef.current + 1;
  }

  return (
    <div className="output">
      <div>아메리카노 {countRef.current} 잔</div>
      <button onClick={handleAdd}>담기</button>
    </div>
  );
}

// ───── 문제 6 ───── (개념02)
// 시작·멈춤이 되는 타이머를 완성하세요.
//   - [시작] 을 누르면 0.5초마다 1씩 올라갑니다
//   - [멈춤] 을 누르면 그 자리에 섭니다
//   - [시작] 을 두 번 눌러도 타이머가 두 개 돌면 안 됩니다
// 타이머 id 를 어디에 둬야 하는지 생각해 보세요. 상자는 만들어 뒀습니다.
//
// 기대 결과 (화면): [시작] → 숫자가 올라감 → [멈춤] → 그 자리에 섭니다.
//                  [시작] 을 두 번 눌렀을 때 두 배로 빨라지면
//                  "이미 돌고 있나" 검사를 안 넣은 것입니다.
//                  [멈춤] 뒤에 [시작] 이 안 먹으면 멈출 때 상자를 안 비운 것입니다.
// TODO: 아래 두 함수 안을 고치세요

function Q6Timer() {
  const [sec, setSec] = useState(0);
  const timerRef = useRef(null);

  function handleStart() {
    // TODO 6: 여기에 코드를 쓰세요
  }

  function handleStop() {
    // TODO 6: 여기에 코드를 쓰세요
  }

  // 이 예제를 떠날 때 타이머를 치우는 코드입니다. 이미 적어 뒀습니다(09단원).
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="output">
      <div>{sec} 칸</div>
      <button onClick={handleStart}>시작</button>
      <button onClick={handleStop}>멈춤</button>
    </div>
  );
}

// ───── 문제 7 ───── (개념03)
// useToggle 커스텀 훅을 완성하세요.
// true / false 를 뒤집는 훅입니다. on 과 toggle 을 돌려주면 됩니다.
//
// 기대 결과 (화면): [바꾸기] 를 누를 때마다 "영업 중" 과 "준비 중" 이 번갈아 나옵니다.
//                  계속 "준비 중" 이면 useState 를 안 쓰고 그냥 값을 돌려준 것입니다.
// TODO: 아래 훅 안을 고치세요

function useToggle(initial = false) {
  // TODO 7: 여기에 코드를 쓰세요

  // 아래 줄은 아직 안 푼 상태에서도 화면이 나오게 하려고 넣어 둔 것입니다.
  // 문제를 풀면서 통째로 바꾸세요.
  return { on: initial, toggle: () => {} };
}

function Q7Toggle() {
  const open = useToggle(false);

  return (
    <div className="output">
      <div>지금 상태: {open.on ? "영업 중" : "준비 중"}</div>
      <button onClick={open.toggle}>바꾸기</button>
    </div>
  );
}

// ───── 문제 8 ───── (개념03)
// useInput 커스텀 훅을 완성하세요.
// 입력칸 하나를 다루는 데 필요한 것을 묶습니다. value, onChange, clear 를 돌려주세요.
//
// 기대 결과 (화면): 두 입력칸에 글자를 칠 수 있고,
//                  [이름 비우기] 를 누르면 이름 칸만 비워집니다.
//                  글자가 안 쳐지면 onChange 안에서 setValue 를 안 부른 것입니다.
//                  두 칸이 같이 움직이면 훅을 한 번만 부르고 나눠 쓴 것입니다.
// TODO: 아래 훅 안을 고치세요

function useInput(initialValue = "") {
  // TODO 8: 여기에 코드를 쓰세요

  // 아직 안 푼 상태를 위한 임시 줄입니다. 통째로 바꾸세요.
  return { value: initialValue, onChange: () => {}, clear: () => {} };
}

function Q8Form() {
  const name = useInput("김민준");
  const memo = useInput("아메리카노");

  return (
    <div className="output">
      <div>
        이름 <input value={name.value} onChange={name.onChange} />
      </div>
      <div style={{ marginTop: 4 }}>
        메모 <input value={memo.value} onChange={memo.onChange} />
      </div>
      <div style={{ marginTop: 6 }}>
        <button onClick={name.clear}>이름 비우기</button>
        <button onClick={memo.clear}>메모 비우기</button>
      </div>
    </div>
  );
}

// ───── 문제 9 ───── (개념04)
// 아래 코드는 훅 규칙을 어겼습니다. 눈으로만 보세요.
//
//   function MenuPicker({ items }) {
//     if (items.length === 0) {
//       return <p>메뉴가 없습니다</p>;          // ← 훅보다 위에서 나가 버립니다
//     }
//     const [picked, setPicked] = useState(items[0].name);
//     ...
//   }
//
// 규칙에 맞게 MenuPicker 를 완성하세요.
//   - 항목이 있으면: 메뉴 이름 버튼들과 "고른 메뉴: OOO" 를 보여 줍니다
//   - 항목이 없으면: "메뉴가 없습니다" 만 보여 줍니다
// 아래 화면에는 MenuPicker 를 두 번 그려 뒀습니다(항목 있음 / 항목 없음).
//
// 기대 결과 (화면): 위 상자에는 버튼 네 개와 "고른 메뉴: 아메리카노",
//                  아래 상자에는 "메뉴가 없습니다" 가 나옵니다.
//                  아래 상자에서 예제가 빨간 상자로 바뀌면
//                  아직 훅보다 return 이 위에 있는 것입니다.
// TODO: 아래 함수 안을 고치세요

function MenuPicker({ items }) {
  // TODO 9: 여기에 코드를 쓰세요

  return <p>문제 9: 여기를 완성하세요 (받은 항목 {items.length} 개)</p>;
}

function Q9Rules() {
  return (
    <div>
      <div className="output">
        <MenuPicker items={menuItems} />
      </div>
      <div className="output" style={{ marginTop: 6 }}>
        <MenuPicker items={[]} />
      </div>
    </div>
  );
}

// ───── 문제 10 ───── (개념05)
// PriceCard 에 memo 를 붙여, 부모가 다시 그려져도 다시 안 그려지게 하세요.
//
// 기대 결과 (화면): 화면 모양은 지금과 똑같습니다. 바뀌는 것은 콘솔뿐입니다.
// 기대 결과 (콘솔): [부모만 다시 그리기] 를 눌렀을 때
//                  "문제 10: 부모를 그렸습니다" 만 찍히고
//                  "문제 10: PriceCard 를 그렸습니다" 는 안 찍혀야 합니다.
//                  둘 다 계속 찍히면 memo 를 안 붙였거나 붙인 자리가 틀린 것입니다.
// TODO: 아래 컴포넌트를 고치세요

function PriceCard({ name, price }) {
  console.log(`문제 10: PriceCard 를 그렸습니다 — ${name}`);
  // 콘솔: 문제 10: PriceCard 를 그렸습니다 — 아메리카노

  return (
    <div>
      {name} — {price} 원
    </div>
  );
}

function Q10Memo() {
  const [tick, setTick] = useState(0);

  console.log("문제 10: 부모를 그렸습니다");
  // 콘솔: 문제 10: 부모를 그렸습니다

  return (
    <div className="output">
      <PriceCard name="아메리카노" price={4000} />
      <div>부모의 숫자: {tick}</div>
      <button onClick={() => setTick(tick + 1)}>부모만 다시 그리기</button>
    </div>
  );
}

// ───── 문제 11 ───── [응용] (개념02 + 개념03)
// usePrevious 커스텀 훅을 완성하세요.
// 값을 받아서 '직전에 받았던 값' 을 돌려주는 훅입니다.
// 개념02 섹션 5에서 한 일을 훅으로 묶는 문제입니다.
//
// 기대 결과 (화면): 처음에는 "지금: 아메리카노 / 직전: (없음)" 입니다.
//                  [라떼] 를 누르면 "지금: 라떼 / 직전: 아메리카노"
//                  이어서 [케이크] 를 누르면 "지금: 케이크 / 직전: 라떼"
//                  '직전' 이 늘 '지금' 과 같으면
//                  useEffect 안이 아니라 본문에서 상자를 바꾼 것입니다.
//                  '직전' 이 계속 (없음) 이면 상자에 값을 안 넣은 것입니다.
// TODO: 아래 훅 안을 고치세요

function usePrevious(value) {
  // TODO 11: 여기에 코드를 쓰세요

  // 아직 안 푼 상태를 위한 임시 줄입니다.
  return "(없음)";
}

function Q11Previous() {
  const [menu, setMenu] = useState("아메리카노");
  const prevMenu = usePrevious(menu);

  return (
    <div className="output">
      <div>지금: {menu}</div>
      <div>직전: {prevMenu}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={() => setMenu("라떼")}>라떼</button>
        <button onClick={() => setMenu("케이크")}>케이크</button>
        <button onClick={() => setMenu("삼각김밥")}>삼각김밥</button>
      </div>
    </div>
  );
}

// ───── 문제 12 ───── [도전] (개념01 + 개념03)
// 할일 목록을 만드세요. 두 군데를 채워야 합니다.
//
//   (1) useTodoList 훅을 완성합니다
//       - todos  : 할 일 목록 배열
//       - add    : 글자를 받아 목록 맨 뒤에 붙입니다.
//                  공백만 있는 글자는 넣지 않습니다 (06단원 trim)
//                  원본 배열을 바꾸지 말고 새 배열을 만드세요 (07단원)
//       - remove : 몇 번째인지를 받아 그 줄을 지웁니다
//
//   (2) Q12Todo 의 handleAdd 를 완성합니다
//       - 훅의 add 를 부르고
//       - 입력칸을 비우고
//       - 입력칸에 커서를 다시 놓습니다 (개념01)
//
// 기대 결과 (화면): "삼각김밥 사기" 가 적힌 채로 [추가] 를 누르면
//                  목록 맨 아래에 한 줄이 늘고, 입력칸이 비며, 커서가 그 칸에 놓입니다.
//                  [지우기] 를 누르면 그 줄만 사라집니다.
//                  빈칸에서 [추가] 를 눌러도 아무 줄도 안 늘어야 합니다.
//                  빈 줄이 늘어나면 trim 검사를 안 넣은 것입니다.
//                  목록이 아예 안 늘어나면 새 배열을 안 만들고 push 를 쓴 것입니다.
// TODO: 아래 훅과 함수 안을 고치세요

function useTodoList(initialTodos = []) {
  // TODO 12: 여기에 코드를 쓰세요

  // 아직 안 푼 상태를 위한 임시 줄입니다.
  return { todos: initialTodos, add: () => {}, remove: () => {} };
}

function Q12Todo() {
  const list = useTodoList(["아메리카노 사기", "케이크 사기"]);
  const [text, setText] = useState("삼각김밥 사기");
  const inputRef = useRef(null);

  function handleAdd() {
    // TODO 12: 여기에 코드를 쓰세요
  }

  return (
    <div className="output">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일"
      />
      <button onClick={handleAdd}>추가</button>
      <ul>
        {list.todos.map((todo, index) => (
          <li key={index}>
            {todo}{" "}
            <button onClick={() => list.remove(index)}>지우기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───── 문제 13 ───── (에러 확인)
// 아래 네 가지를 하나씩 실제로 만들어 보고, 무슨 일이 나는지 확인하세요.
// 하나 확인할 때마다 반드시 원래대로 되돌리고 다음으로 넘어가세요.
//
//   (가) 문제 1을 푼 뒤, handleFocus 안에서 .current 를 지운다
//        inputRef.current.focus();  →  inputRef.focus();
//
//   (나) 문제 2의 input 에서 ref={inputRef} 를 지운다
//        (handleClear 안의 코드는 그대로 둡니다)
//
//   (다) 문제 4의 화면 줄에서 .current 를 지운다
//        {countRef.current}  →  {countRef}
//
//   (라) 문제 5를 state 로 고친 뒤, 아래 두 줄을 컴포넌트 안에 넣는다
//        if (count > 0) {
//          const [bonus] = useState("보너스");
//        }
//        넣은 다음 [담기] 를 한 번 눌러 보세요.
//
// 기대 결과: 넷 다 에러가 나는데 메시지가 서로 다릅니다. 아래 빈칸을 채워 보세요.
//   (가) → 콘솔에 (                                        ) 에러가 난다
//   (나) → 콘솔에 (                                        ) 에러가 난다
//   (다) → 콘솔에 (                                        ) 에러가 난다
//   (라) → 누르기 전에는 멀쩡하다가, 누르는 순간
//          (                                        ) 에러가 난다
//
// (가)와 (나)는 메시지가 다릅니다. 무엇이 다른지도 한 줄로 적어 보세요.
// 정답은 연습문제_정답.jsx 맨 아래에 있습니다.

export default function Practice10RefAndHooks() {
  return (
    <div>
      <h1>10단원 연습문제 — useRef 와 커스텀 훅</h1>

      <p className="guide">
        이 파일을 <strong>직접 고치면서</strong> 푸는 문제입니다. 저장하면 아래 화면이
        바로 바뀝니다.
        <br />
        <br />
        문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다. 문제마다{" "}
        <strong>기대 결과</strong>가 적혀 있으니 그대로 나오는지 확인하세요.
        <br />
        <br />
        <strong>F12 → Console 을 열어 두세요.</strong> 문제 4와 문제 10은 콘솔로
        확인합니다.
      </p>

      <div className="demo">
        <h3>문제 1 — 커서 놓기</h3>
        <Q1Focus />
      </div>
      <div className="demo">
        <h3>문제 2 — 지우고 커서 놓기</h3>
        <Q2ClearAndFocus />
      </div>
      <div className="demo">
        <h3>문제 3 — 스크롤 이동</h3>
        <Q3Scroll />
      </div>
      <div className="demo">
        <h3>문제 4 — ref 는 다시 안 그린다</h3>
        <Q4RefNoRender />
      </div>
      <div className="demo">
        <h3>문제 5 — ref 를 state 로 고치기</h3>
        <Q5FixToState />
      </div>
      <div className="demo">
        <h3>문제 6 — 타이머 id 보관</h3>
        <Q6Timer />
      </div>
      <div className="demo">
        <h3>문제 7 — useToggle</h3>
        <Q7Toggle />
      </div>
      <div className="demo">
        <h3>문제 8 — useInput</h3>
        <Q8Form />
      </div>
      <div className="demo">
        <h3>문제 9 — 훅의 규칙</h3>
        <Q9Rules />
      </div>
      <div className="demo">
        <h3>문제 10 — memo</h3>
        <Q10Memo />
      </div>
      <div className="demo">
        <h3>문제 11 [응용] — usePrevious</h3>
        <Q11Previous />
      </div>
      <div className="demo">
        <h3>문제 12 [도전] — 할일 목록</h3>
        <Q12Todo />
      </div>
      <div className="demo">
        <h3>문제 13 — 에러 확인</h3>
        <p>이 문제는 화면이 아니라 코드와 콘솔로 확인합니다. 위 주석을 보세요.</p>
      </div>

      <Summary
        items={[
          "문제 1~3: ref 로 요소 다루기 — 포커스, 지우고 커서, 스크롤",
          "문제 4~5: ref 는 다시 안 그린다 / 화면에 보이는 값은 state 로",
          "문제 6: 타이머 id 를 ref 에 보관하기",
          "문제 7~8: 커스텀 훅 만들기 — useToggle, useInput",
          "문제 9: 훅 규칙에 맞게 early return 위치 고치기",
          "문제 10: memo 로 자식 다시 그리기 막기",
          "문제 11~12: usePrevious, 그리고 커스텀 훅과 ref 를 함께 쓰기",
        ]}
      />
    </div>
  );
}
