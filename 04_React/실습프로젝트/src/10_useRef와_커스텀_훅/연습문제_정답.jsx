// ============================================================
// 10단원 연습문제 정답 — useRef 와 커스텀 훅
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//       F12 → Console 도 함께 보세요.
//
// ★ 먼저 스스로 풀어 보고 나서 여세요.
// ★ 정답이 하나뿐인 문제는 거의 없습니다. 화면이 기대 결과대로 나오면 맞은 것입니다.
//   여기 적힌 것과 코드 모양이 조금 달라도 괜찮습니다.
// ★ 개발 중에는 StrictMode 때문에 콘솔 줄이 두 번씩 찍힙니다. 정상입니다.
// ============================================================

import { useState, useRef, useEffect, memo } from "react";
import Summary from "../_ui/Summary.jsx";

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

// ───── 문제 1 정답 ───── (개념01)

function Q1Focus() {
  // 1) 상자를 만듭니다. 아직 요소가 없으니 null 로 시작합니다.
  const inputRef = useRef(null);

  function handleFocus() {
    // 3) 상자 안(current)에 든 요소에게 시킵니다.
    inputRef.current.focus();

    console.log("문제 1: 입력칸에 커서를 놓았습니다");
    // 콘솔: 문제 1: 입력칸에 커서를 놓았습니다
  }

  return (
    <div className="output">
      {/* 2) 요소에 붙입니다. React 가 이 상자에 요소를 넣어 줍니다. */}
      <input ref={inputRef} placeholder="여기에 커서가 와야 합니다" />
      <button onClick={handleFocus}>커서 놓기</button>
    </div>
  );
}

// 세 걸음이 모두 있어야 동작합니다. 하나만 빠져도 안 됩니다.
//   상자 만들기 → 요소에 붙이기 → current 로 쓰기

// ───── 문제 2 정답 ───── (개념01)

function Q2ClearAndFocus() {
  const [text, setText] = useState("아메리카노");
  const inputRef = useRef(null);

  function handleClear() {
    // 비우는 일은 '화면에 보이는 값' 이므로 state 입니다.
    setText("");
    // 커서를 놓는 일은 '브라우저에게 시키는 동작' 이므로 ref 입니다.
    inputRef.current.focus();

    console.log("문제 2: 지우고 커서를 놓았습니다");
    // 콘솔: 문제 2: 지우고 커서를 놓았습니다
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

// 한 함수 안에서 state 와 ref 를 나눠 쓴 예입니다.
// inputRef.current.value = "" 로 비우면 안 됩니다.
// 개념01 섹션 1에서 본 것처럼 React 가 다음 렌더에서 되돌려 놓습니다.

// ───── 문제 3 정답 ───── (개념01)

function Q3Scroll() {
  const cakeRef = useRef(null);

  function handleGo() {
    cakeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

    console.log("문제 3: 케이크 줄로 스크롤했습니다");
    // 콘솔: 문제 3: 케이크 줄로 스크롤했습니다
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

// behavior 를 빼면 순간이동하고, block 을 빼면 케이크가 상자 맨 위에 붙습니다.
// 둘 다 '보기 좋으라고' 주는 값이라 없어도 동작은 합니다.

// ───── 문제 4 정답 ───── (개념02)

function Q4RefNoRender() {
  const countRef = useRef(0);
  const [tick, setTick] = useState(0);

  function handleUp() {
    // set 함수가 없습니다. 상자 안에 직접 넣습니다.
    countRef.current = countRef.current + 1;

    console.log(`문제 4: 지금 진짜 값: ${countRef.current}`);
    // 콘솔: 문제 4: 지금 진짜 값: 1
    // (두 번째로 누르면 2, 세 번째로 누르면 3 이 찍힙니다)
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

// ref 를 세 번 올려도 화면은 0 입니다. 콘솔에는 1, 2, 3 이 찍힙니다.
// [다시 그리기] 를 누르는 순간 화면에 3 이 나타납니다.
// 값은 이미 3 이었고, 화면이 그것을 몰랐을 뿐입니다.

// ───── 문제 5 정답 ───── (개념02)

function Q5FixToState() {
  // ref 를 state 로 바꿨습니다.
  const [count, setCount] = useState(0);

  function handleAdd() {
    setCount(count + 1);

    console.log("문제 5: 담았습니다. state 라서 화면도 바뀝니다");
    // 콘솔: 문제 5: 담았습니다. state 라서 화면도 바뀝니다
  }

  return (
    <div className="output">
      {/* .current 도 함께 지워야 합니다. state 는 그냥 count 입니다. */}
      <div>아메리카노 {count} 잔</div>
      <button onClick={handleAdd}>담기</button>
    </div>
  );
}

// 판단 기준은 하나였습니다.
//   이 값이 바뀌면 화면도 바뀌어야 하나?  →  예. 그러니 state 입니다.

// ───── 문제 6 정답 ───── (개념02)

function Q6Timer() {
  const [sec, setSec] = useState(0);
  const timerRef = useRef(null);

  function handleStart() {
    // 이미 돌고 있으면 아무것도 안 합니다. 이 줄이 없으면 타이머가 겹칩니다.
    if (timerRef.current !== null) return;

    timerRef.current = setInterval(() => {
      // 함수형 갱신입니다(04단원 개념05). 안에서 옛날 sec 를 보지 않게 합니다.
      setSec((prev) => prev + 1);
    }, 500);

    console.log("문제 6: 타이머 시작");
    // 콘솔: 문제 6: 타이머 시작
  }

  function handleStop() {
    clearInterval(timerRef.current);
    // 상자도 비웁니다. 안 비우면 다음 [시작] 이 위의 검사에 걸려 안 먹습니다.
    timerRef.current = null;

    console.log("문제 6: 타이머 멈춤");
    // 콘솔: 문제 6: 타이머 멈춤
  }

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

// sec 는 화면에 보이니 state, 타이머 id 는 화면에 안 보이니 ref 입니다.
// id 를 state 로 두어도 동작은 하지만, 시작할 때마다 쓸데없이 다시 그립니다.

// ───── 문제 7 정답 ───── (개념03)

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);

  function toggle() {
    setOn((prev) => !prev);
  }

  // { on: on, toggle: toggle } 을 짧게 쓴 것입니다(속성 축약).
  return { on, toggle };
}

function Q7Toggle() {
  const open = useToggle(false);

  function handleToggle() {
    open.toggle();
    console.log("문제 7: 영업 상태를 뒤집었습니다");
    // 콘솔: 문제 7: 영업 상태를 뒤집었습니다
  }

  return (
    <div className="output">
      <div>지금 상태: {open.on ? "영업 중" : "준비 중"}</div>
      <button onClick={handleToggle}>바꾸기</button>
    </div>
  );
}

// setOn(!on) 으로 써도 동작합니다.
// 다만 한 번에 여러 번 부를 일이 생기면 어긋나므로 prev 를 쓰는 편이 안전합니다.

// ───── 문제 8 정답 ───── (개념03)

function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  function onChange(e) {
    setValue(e.target.value);
  }

  function clear() {
    setValue("");
  }

  return { value, onChange, clear };
}

function Q8Form() {
  // 훅을 두 번 부르면 state 도 두 개 생깁니다. 서로 따로 놉니다.
  const name = useInput("김민준");
  const memo = useInput("아메리카노");

  function handleClearName() {
    name.clear();
    console.log("문제 8: 이름 칸을 비웠습니다");
    // 콘솔: 문제 8: 이름 칸을 비웠습니다
  }

  function handleClearMemo() {
    memo.clear();
    console.log("문제 8: 메모 칸을 비웠습니다");
    // 콘솔: 문제 8: 메모 칸을 비웠습니다
  }

  return (
    <div className="output">
      <div>
        이름 <input value={name.value} onChange={name.onChange} />
      </div>
      <div style={{ marginTop: 4 }}>
        메모 <input value={memo.value} onChange={memo.onChange} />
      </div>
      <div style={{ marginTop: 6 }}>
        <button onClick={handleClearName}>이름 비우기</button>
        <button onClick={handleClearMemo}>메모 비우기</button>
      </div>
    </div>
  );
}

// ───── 문제 9 정답 ───── (개념04)

function MenuPicker({ items }) {
  // 훅을 '먼저' 부릅니다. 조건은 그 아래에서 겁니다.
  // items 가 빈 배열이면 items[0] 이 없으므로 빈 문자열을 초기값으로 씁니다.
  const [picked, setPicked] = useState(items.length > 0 ? items[0].name : "");

  function handlePick(name) {
    setPicked(name);
    console.log(`문제 9: 고른 메뉴 — ${name}`);
    // 콘솔: 문제 9: 고른 메뉴 — 아메리카노
  }

  // return 은 훅을 다 부른 뒤에 합니다. 이 순서가 핵심입니다.
  if (items.length === 0) {
    return <p>메뉴가 없습니다</p>;
  }

  return (
    <div>
      <div>
        {items.map((item) => (
          <button key={item.id} onClick={() => handlePick(item.name)}>
            {item.name}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 6 }}>고른 메뉴: {picked}</div>
    </div>
  );
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

// 훅보다 위에서 return 하면 그 렌더에서는 훅이 안 불립니다.
// 그러면 훅 개수가 렌더마다 달라져 이 에러가 납니다.
//   Rendered fewer hooks than expected.
// 09단원의 로딩 처리와 붙여 쓰다가 아주 자주 나옵니다.

// ───── 문제 10 정답 ───── (개념05)

// memo 로 감쌉니다. 파일 맨 바깥에서 한 번만 만듭니다.
const PriceCard = memo(function PriceCard({ name, price }) {
  console.log(`문제 10: PriceCard 를 그렸습니다 — ${name}`);
  // 콘솔: 문제 10: PriceCard 를 그렸습니다 — 아메리카노

  return (
    <div>
      {name} — {price} 원
    </div>
  );
});

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

// [부모만 다시 그리기] 를 누르면 부모 줄만 콘솔에 찍힙니다.
// PriceCard 는 name 과 price 가 그대로라서 다시 안 그립니다.
//
// 주의 — memo(...) 를 컴포넌트 안에서 만들면 안 됩니다.
// 다시 그릴 때마다 새 컴포넌트가 되어 아무 효과가 없습니다.

// ───── 문제 11 정답 ───── [응용] (개념02 + 개념03)

function usePrevious(value) {
  // 상자는 다시 그려도 그대로 남습니다. 그래서 '직전 값' 을 담아 둘 수 있습니다.
  const ref = useRef("(없음)");

  useEffect(() => {
    // 화면을 다 그린 뒤에 넣습니다.
    // 그리는 도중에 넣으면 '지금 값' 이 되어 버려서 늘 같은 값이 나옵니다.
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Q11Previous() {
  const [menu, setMenu] = useState("아메리카노");
  const prevMenu = usePrevious(menu);

  function pick(name) {
    setMenu(name);
    console.log(`문제 11: 고른 메뉴 — ${name}`);
    // 콘솔: 문제 11: 고른 메뉴 — 라떼
  }

  return (
    <div className="output">
      <div>지금: {menu}</div>
      <div>직전: {prevMenu}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={() => pick("라떼")}>라떼</button>
        <button onClick={() => pick("케이크")}>케이크</button>
        <button onClick={() => pick("삼각김밥")}>삼각김밥</button>
      </div>
    </div>
  );
}

// 이 훅을 state 로 만들면 안 되는 이유가 있습니다.
// useEffect 안에서 setPrev 를 부르면 또 다시 그려지고,
// 그러면 useEffect 가 또 돌아서 무한 루프가 됩니다(09단원 개념06).
// ref 는 바꿔도 다시 안 그리므로 안전합니다.

// ───── 문제 12 정답 ───── [도전] (개념01 + 개념03)

function useTodoList(initialTodos = []) {
  const [todos, setTodos] = useState(initialTodos);

  function add(text) {
    // 06단원 trim. 공백만 있는 글자는 넣지 않습니다.
    const trimmed = text.trim();
    if (trimmed === "") return;

    // 07단원 불변 갱신. push 가 아니라 새 배열을 만듭니다.
    setTodos((prev) => [...prev, trimmed]);
  }

  function remove(index) {
    // filter 로 그 자리만 빼고 새 배열을 만듭니다.
    setTodos((prev) => prev.filter((todo, i) => i !== index));
  }

  return { todos, add, remove };
}

function Q12Todo() {
  const list = useTodoList(["아메리카노 사기", "케이크 사기"]);
  const [text, setText] = useState("삼각김밥 사기");
  const inputRef = useRef(null);

  function handleAdd() {
    console.log(`문제 12: 추가 — ${text}`);
    // 콘솔: 문제 12: 추가 — 삼각김밥 사기

    list.add(text); // 커스텀 훅에게 시킵니다
    setText(""); // 입력칸을 비웁니다 (state)
    inputRef.current.focus(); // 커서를 다시 놓습니다 (ref)
  }

  function handleRemove(index) {
    list.remove(index);
    console.log("문제 12: 한 줄 지웠습니다");
    // 콘솔: 문제 12: 한 줄 지웠습니다
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
            {todo} <button onClick={() => handleRemove(index)}>지우기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 세 가지가 한 함수 안에 모여 있습니다. 각각 어느 도구인지 보세요.
//   list.add(text)            커스텀 훅  (목록 다루기를 묶어 둔 것)
//   setText("")               state      (화면에 보이는 값)
//   inputRef.current.focus()  ref        (브라우저에게 시키는 동작)
//
// key 에 index 를 쓴 것이 마음에 걸릴 수 있습니다(05단원 개념03).
// 지우기가 있는 목록이라 원래는 고유한 id 를 붙이는 편이 낫습니다.
// 여기서는 이 단원의 주제에 집중하려고 index 로 두었습니다.

export default function Answer10RefAndHooks() {
  return (
    <div>
      <h1>10단원 연습문제 정답 — useRef 와 커스텀 훅</h1>

      <p className="guide">
        <strong>먼저 스스로 풀어 보고 나서 여세요.</strong>
        <br />
        코드 모양이 조금 달라도 기대 결과대로 나오면 맞은 것입니다.
        <br />
        F12 → Console 도 함께 보세요.
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
        <p>이 문제의 정답은 이 파일 맨 아래 주석에 있습니다.</p>
      </div>

      <Summary
        items={[
          "ref 는 세 걸음입니다. useRef 로 상자 만들기 → 요소에 ref 붙이기 → current 로 쓰기.",
          "화면에 보이는 값은 state, 브라우저에게 시키는 동작은 ref 입니다. 한 함수 안에서 같이 씁니다.",
          "타이머는 시작할 때 겹치지 않게 검사하고, 멈출 때 상자를 null 로 비웁니다.",
          "커스텀 훅은 그냥 함수입니다. 부를 때마다 새 state 가 생겨 서로 따로 놉니다.",
          "훅을 먼저 다 부르고, early return 은 그 아래에 둡니다.",
          "memo 는 파일 맨 바깥에서 감쌉니다. 컴포넌트 안에서 감싸면 효과가 없습니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 문제 13 정답 — 에러 확인
// ============================================================
//
// (가) inputRef.current.focus()  →  inputRef.focus()
//
//      TypeError: inputRef.focus is not a function
//
//      useRef 가 돌려주는 것은 요소가 아니라 { current: 요소 } 상자입니다.
//      상자에는 focus 라는 메소드가 없습니다. 요소는 상자 안에 있습니다.
//
// (나) input 에서 ref={inputRef} 를 지움
//
//      TypeError: Cannot read properties of null (reading 'focus')
//
//      상자는 만들었는데 아무 요소에도 안 붙였습니다.
//      그래서 current 가 처음 값인 null 그대로입니다.
//      null 에서 focus 를 꺼내려 해서 나는 에러입니다.
//      JS자료 10단원에서 querySelector 가 null 을 돌려줬을 때 본 그 에러와 같습니다.
//
//      (가)와 (나)의 차이:
//        (가) 는 상자를 요소인 줄 알고 쓴 것 — .current 를 빠뜨렸습니다
//        (나) 는 상자가 아직 비어 있는 것 — ref={...} 를 안 붙였습니다
//      메시지에서 'inputRef.focus' 인지 'reading focus of null' 인지를 보면 구분됩니다.
//
// (다) 화면 줄에서 {countRef.current}  →  {countRef}
//
//      Objects are not valid as a React child (found: object with keys {current})
//
//      상자는 객체입니다. 객체는 화면에 그릴 수 없습니다.
//      화면에 그릴 수 있는 것은 글자, 숫자, JSX 입니다.
//      메시지에 keys {current} 라고 친절히 알려 줍니다. ref 를 통째로 쓴 것입니다.
//
// (라) if (count > 0) { const [bonus] = useState("보너스"); } 를 넣고 [담기] 클릭
//
//      누르기 전에는 멀쩡합니다. count 가 0 이라 훅이 하나였습니다.
//      누르면 count 가 1 이 되어 훅이 두 개가 됩니다. 그 순간 이렇게 됩니다.
//
//      [콘솔 경고]
//        React has detected a change in the order of Hooks called by Q5FixToState.
//        This will lead to bugs and errors if not fixed.
//
//      [에러]
//        Rendered more hooks than during the previous render.
//
//      개념04에서 본 그대로입니다. 훅 개수가 렌더마다 달라졌습니다.
//
// 네 가지를 한 줄로 구분하면 이렇습니다.
//   (가) 상자와 요소를 헷갈림      → is not a function
//   (나) 상자가 비어 있음          → reading ... of null
//   (다) 상자를 화면에 그리려 함    → Objects are not valid as a React child
//   (라) 훅 개수가 달라짐          → Rendered more hooks than ...
//
// 에러 메시지를 끝까지 읽는 습관이 붙으면 이 넷을 보자마자 구분할 수 있습니다.
