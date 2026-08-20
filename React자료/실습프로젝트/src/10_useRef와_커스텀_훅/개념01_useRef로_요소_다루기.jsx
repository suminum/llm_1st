// ============================================================
// 10단원 · 개념 01 — useRef 로 요소 다루기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// JS자료 10단원에서 이렇게 배웠습니다.
//
//     const input = document.querySelector("#nameInput");
//     input.focus();
//
// 화면의 요소를 고르고, 그 요소에 무언가를 시켰습니다.
//
// React 를 쓰는 지금도 "입력칸에 커서를 놓아 주세요" 같은 일은 필요합니다.
// 그런데 React 에서는 querySelector 를 쓰지 않습니다. 대신 ref 를 씁니다.
//
// 이 파일에서 볼 것은 두 가지입니다.
//   1) 왜 querySelector 를 쓰면 안 되는지  (섹션 1)
//   2) 그럼 무엇을 쓰는지                   (섹션 2부터)

import { useState, useRef, useEffect } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 화면은 React 가 관리합니다 ──

// 01단원에서 이런 말을 했습니다.
//   "여러분은 데이터만 바꾸고, 화면을 고치는 일은 React 가 한다"
//
// 이 말에는 뒷면이 있습니다.
//   화면을 고치는 일이 React 것이라면, 그 화면을 내가 직접 고치면 어떻게 될까요?
//
// React 는 "지금 화면이 이렇게 생겼을 것이다" 를 자기 기억 속에 들고 있습니다.
// 그 기억과 실제 화면이 같다고 믿고, 다음에 바뀐 부분만 골라 고칩니다.
// 그래서 내가 몰래 화면을 고치면 React 의 기억과 실제 화면이 어긋납니다.
//
// 말로만 하면 안 믿기니 직접 해 봅니다.
// 아래 데모에서 [입력칸을 직접 바꾸기] 를 누르면 querySelector 로 입력칸을 찾아
// value 에 "라떼" 를 직접 넣습니다. JS자료에서 하던 그대로입니다.

function DirectDom() {
  const [name, setName] = useState("아메리카노");
  const [tick, setTick] = useState(0);

  function handleDirect() {
    // JS자료 10단원에서 하던 방식 그대로입니다.
    const el = document.querySelector("#nameInput");
    el.value = "라떼";

    console.log(`입력칸에 직접 넣은 값: ${el.value}`);
    // 콘솔: 입력칸에 직접 넣은 값: 라떼

    console.log(`React 가 알고 있는 값: ${name}`);
    // 콘솔: React 가 알고 있는 값: 아메리카노
    //
    // 두 줄이 다릅니다. 화면에는 "라떼" 가 보이는데
    // React 는 아직 "아메리카노" 인 줄 알고 있습니다. 이미 어긋났습니다.
  }

  return (
    <div className="demo">
      <h3>① 화면을 직접 고치면</h3>
      <input
        id="nameInput"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleDirect}>입력칸을 직접 바꾸기</button>
      <button onClick={() => setTick(tick + 1)}>다른 값 바꾸기</button>
      <div className="output">
        React 가 아는 값: {name} / 다른 값: {tick}
      </div>
    </div>
  );
}

// 데모 ① 을 이 순서로 눌러 보세요.
//
//   1) [입력칸을 직접 바꾸기]  → 입력칸 글자가 "라떼" 로 바뀝니다.
//                                아래 "React 가 아는 값" 은 아메리카노 그대로입니다.
//   2) [다른 값 바꾸기]        → 입력칸이 "아메리카노" 로 되돌아갑니다.
//
// 화면(누르면): 입력칸 "라떼" → 다른 값 바꾸기 → 입력칸 "아메리카노"
//
// 2)번에서 우리는 입력칸을 건드리지도 않았습니다. tick 만 1 올렸습니다.
// 그런데 입력칸이 제멋대로 되돌아갔습니다.
//
// 이유는 이렇습니다.
//   tick 이 바뀌었으니 React 가 이 컴포넌트를 다시 그립니다.
//   다시 그리면서 "입력칸의 value 는 name, 즉 아메리카노여야 한다" 를 확인합니다.
//   실제 화면에는 "라떼" 가 들어 있으니 다르다고 보고 아메리카노로 되돌립니다.
//
// 내가 직접 고친 것은 이렇게 조용히 지워집니다.
// 에러도 경고도 안 납니다. 이게 가장 나쁜 종류의 버그입니다.
//
// 정리하면 이렇습니다.
//   React 가 그린 화면의 '내용' 은 React 가 관리합니다.
//   내용을 바꾸고 싶으면 state 를 바꿉니다. 화면을 직접 만지지 않습니다.
//
// 그런데 화면에는 '내용' 말고도 다룰 것이 있습니다.
//   - 이 입력칸에 커서를 놓아라 (포커스)
//   - 이 줄이 보이게 스크롤해라
//   - 이 동영상을 재생해라
//
// 이런 것은 화면에 그려지는 글자가 아닙니다. 브라우저에게 시키는 '동작'입니다.
// JSX 로는 적을 수가 없습니다. 그래서 요소를 직접 잡아야 합니다.
// 그 통로가 ref 입니다.

// ✏️ 직접 해보기 1 — 데모 ① 에서 [입력칸을 직접 바꾸기] 를 누른 뒤,
//                    입력칸에 아무 글자나 타이핑해 보세요.
//                    "라떼" 가 어떻게 되는지 보고, 왜 그런지 생각해 보세요.

// ── 섹션 2: useRef — React 에게 요소를 건네받기 ──

// 쓰는 법은 세 걸음입니다.
//
//   1) 상자를 만든다            const inputRef = useRef(null);
//   2) 요소에 ref 로 붙인다     <input ref={inputRef} />
//   3) inputRef.current 로 쓴다 inputRef.current.focus();
//
// useRef(null) 의 null 은 '처음 값' 입니다.
// 아직 요소가 없으니 null 로 시작합니다.
//
// 그러면 React 가 화면을 그린 다음, 만들어진 실제 요소를 그 상자에 넣어 줍니다.
// 상자 이름은 항상 current 입니다. 이 이름은 바꿀 수 없습니다.
//
// querySelector 와 비교하면 이렇습니다.
//
//   querySelector("#nameInput")   내가 페이지 전체를 뒤져서 찾는다
//   ref                           React 가 만들면서 나에게 건네준다
//
// 찾을 필요가 없으니 id 를 붙이지 않아도 되고, id 가 겹칠 걱정도 없습니다.
// 화면에 없는 요소를 잘못 잡는 일도 없습니다.

function RefBasic() {
  const boxRef = useRef(null);

  // 그리는 도중에는 아직 요소가 만들어지기 전입니다.
  console.log(`그리는 중 boxRef.current: ${String(boxRef.current)}`);
  // 콘솔: 그리는 중 boxRef.current: null

  useEffect(() => {
    // useEffect 는 09단원에서 배웠습니다. '화면을 다 그린 뒤' 에 실행됩니다.
    // 그래서 여기서는 요소가 들어 있습니다.
    console.log(`그린 뒤 boxRef.current 의 태그: ${boxRef.current.tagName}`);
    // 콘솔: 그린 뒤 boxRef.current 의 태그: INPUT

    console.log(`그린 뒤 boxRef.current 의 값: ${boxRef.current.value}`);
    // 콘솔: 그린 뒤 boxRef.current 의 값: 라떼
  }, []);

  return (
    <div className="demo">
      <h3>② ref 상자 안을 콘솔에서 확인</h3>
      <input ref={boxRef} defaultValue="라떼" />
      <p>F12 → Console 을 열어 위 두 줄을 확인하세요.</p>
    </div>
  );
}

// 위 콘솔 결과가 알려 주는 것이 하나 더 있습니다.
//
//   그리는 중  → null
//   그린 뒤    → INPUT
//
// ref 상자는 화면을 다 그린 뒤에 채워집니다.
// 그래서 컴포넌트 본문(그리는 중)에서 ref.current 를 쓰면 null 입니다.
// ref 를 쓰는 곳은 두 군데뿐이라고 외워도 됩니다.
//   - 이벤트 핸들러 안 (버튼을 누른 뒤니까 이미 다 그려졌습니다)
//   - useEffect 안     (화면을 다 그린 뒤에 실행되니까요)
//
// 참고로 defaultValue 는 "처음에만 이 값으로 두고, 그 뒤로는 브라우저가 알아서" 라는 뜻입니다.
// value 와 달리 React 가 계속 관리하지 않습니다. 06단원에서 배운 value 와는 다릅니다.

// ✏️ 직접 해보기 2 — RefBasic 의 useEffect 안에 아래 줄을 추가하고
//                    콘솔에 무엇이 찍히는지 보세요.
//                    console.log(boxRef.current.id);

// ── 섹션 3: 입력칸에 커서 놓기 (포커스) ──

// ref 를 가장 많이 쓰는 곳입니다.
//
// 왜 이건 state 로 못 할까요?
// "포커스가 여기 있다" 는 화면에 그려지는 글자가 아니기 때문입니다.
// <input focus> 같은 JSX 는 없습니다.
// 브라우저에게 "이 요소에 커서를 놓아라" 라고 시켜야 합니다.
// 시키려면 그 요소가 손에 있어야 하고, 그래서 ref 가 필요합니다.

function FocusDemo() {
  const searchRef = useRef(null);
  const [keyword, setKeyword] = useState("");

  function handleFocus() {
    searchRef.current.focus();
    console.log("검색칸에 커서를 놓았습니다");
    // 콘솔: 검색칸에 커서를 놓았습니다
  }

  function handleSelect() {
    // select() 는 입력칸의 글자를 통째로 선택합니다. 바로 덮어쓰기 좋습니다.
    searchRef.current.focus();
    searchRef.current.select();
    console.log("검색칸의 글자를 전부 선택했습니다");
    // 콘솔: 검색칸의 글자를 전부 선택했습니다
  }

  function handleClear() {
    // 지우고 나서 커서를 다시 놓아 줍니다. 실제 검색창이 이렇게 동작합니다.
    setKeyword("");
    searchRef.current.focus();
    console.log("검색칸을 비우고 커서를 다시 놓았습니다");
    // 콘솔: 검색칸을 비우고 커서를 다시 놓았습니다
  }

  return (
    <div className="demo">
      <h3>③ 포커스 주기</h3>
      <input
        ref={searchRef}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="메뉴 검색"
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleFocus}>커서 놓기</button>
        <button onClick={handleSelect}>글자 전체 선택</button>
        <button onClick={handleClear}>지우고 커서 놓기</button>
      </div>
      <div className="output">검색어: {keyword || "(비어 있음)"}</div>
    </div>
  );
}

// 화면(누르면): [커서 놓기] 를 누르면 검색칸 테두리가 진해지고 커서가 깜빡입니다.
// 화면(누르면): 검색칸에 "라떼" 를 치고 [글자 전체 선택] 을 누르면 라떼가 파랗게 덮입니다.
// 화면(누르면): [지우고 커서 놓기] 를 누르면 검색칸이 비고 커서가 그 자리에 놓입니다.
//
// 세 번째가 실전에서 자주 쓰는 모양입니다.
// 값을 비우는 일(setKeyword)은 state 로, 커서를 놓는 일(focus)은 ref 로 합니다.
// 한 함수 안에서 둘을 같이 쓰는 것이 자연스럽습니다.

// ✏️ 직접 해보기 3 — 버튼을 하나 더 만들어, 누르면 검색칸에서 커서를 빼앗도록
//                    해 보세요. (힌트: focus 의 반대는 blur 입니다)

// ── 섹션 4: 화면이 뜨자마자 커서 놓기 ──

// 로그인 화면을 열면 아이디 칸에 이미 커서가 놓여 있는 것을 본 적 있을 겁니다.
// 09단원의 useEffect 와 ref 를 같이 쓰면 됩니다.
//
//   useEffect(() => { ... }, [])  → 화면을 처음 그린 뒤에 한 번
//   그 안에서 ref.current.focus() → 그때는 요소가 이미 만들어져 있습니다
//
// 순서를 다시 확인하세요.
//   컴포넌트 함수 실행 → 화면에 그림 → ref 상자 채움 → useEffect 실행
// useEffect 가 마지막이라서 ref 를 안전하게 쓸 수 있습니다.

function AutoFocusForm() {
  const idRef = useRef(null);
  const [id, setId] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    idRef.current.focus();
    console.log("화면이 뜨자마자 아이디 칸에 커서를 놓았습니다");
    // 콘솔: 화면이 뜨자마자 아이디 칸에 커서를 놓았습니다
  }, []);

  function handleSubmit(e) {
    e.preventDefault(); // 06단원에서 배웠습니다. 새로고침을 막습니다.
    setSaved(id);
    setId("");
    idRef.current.focus(); // 저장하고 다시 커서를 놓아 줍니다
  }

  return (
    <div className="demo">
      <h3>④ 열자마자 커서</h3>
      <form onSubmit={handleSubmit}>
        <input
          ref={idRef}
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="이름"
        />
        <button type="submit">저장</button>
      </form>
      <div className="output">저장된 이름: {saved || "(아직 없음)"}</div>
    </div>
  );
}

// 이 예제를 골라 화면에 나오면 아이디 칸이 이미 선택돼 있습니다.
// 화면: 이름 칸의 테두리가 진하고 커서가 깜빡입니다.
//
// 주의 — 이 예제를 고른 순간 화면이 그 입력칸까지 스르륵 내려갈 수 있습니다.
// 포커스를 주면 브라우저가 그 요소를 보이게 스크롤하기 때문입니다. 정상입니다.

// ✏️ 직접 해보기 4 — handleSubmit 의 마지막 줄 idRef.current.focus() 를 지우고,
//                    이름을 넣어 [저장] 을 눌러 보세요. 무엇이 불편해지나요?

// ── 섹션 5: 원하는 줄까지 스크롤하기 ──

// 목록이 길 때 "케이크 줄로 데려다 주세요" 같은 일도 ref 로 합니다.
// 요소에는 scrollIntoView() 라는 메소드가 있습니다.
// 부르면 그 요소가 보이도록 브라우저가 스크롤해 줍니다.
//
//   scrollIntoView({ behavior: "smooth", block: "center" })
//     behavior: "smooth"  스르륵 움직입니다 (없으면 순간이동)
//     block: "center"     화면 가운데로 옵니다 (기본값은 "start", 즉 맨 위)

const menuList = [
  "아메리카노",
  "카페라떼",
  "바닐라라떼",
  "카페모카",
  "녹차라떼",
  "케이크",
  "쿠키",
  "삼각김밥",
];

function ScrollDemo() {
  const cakeRef = useRef(null);

  function handleScroll() {
    cakeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    console.log("케이크 줄로 스크롤했습니다");
    // 콘솔: 케이크 줄로 스크롤했습니다
  }

  return (
    <div className="demo">
      <h3>⑤ 스크롤 이동</h3>
      <button onClick={handleScroll}>케이크로 가기</button>
      <div
        style={{
          height: 120,
          overflowY: "auto",
          border: "1px solid #ccc",
          background: "#fff",
          marginTop: 8,
        }}
      >
        <ul>
          {menuList.map((name) => (
            // ref 를 케이크 줄에만 붙입니다. 나머지 줄에는 안 붙입니다.
            <li key={name} ref={name === "케이크" ? cakeRef : null}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 화면(누르면): 목록 상자가 스르륵 내려가 '케이크' 줄이 가운데에 보입니다.
//
// ref 를 조건부로 붙인 것에 주목하세요.
//   ref={name === "케이크" ? cakeRef : null}
// 05단원에서 배운 삼항 연산자입니다. 케이크 줄에만 상자를 연결하고
// 나머지 줄에는 null 을 줘서 아무것도 안 붙입니다.

// ✏️ 직접 해보기 5 — cakeRef 를 "삼각김밥" 줄에 붙게 바꾸고 버튼을 눌러 보세요.
//                    어디로 스크롤되는지 확인하세요.

// ── 섹션 6: ref 로 해도 되는 일과 하면 안 되는 일 ──

// 판단 기준은 하나입니다.
//
//   화면에 '보이는 내용' 인가?           → state 로 합니다
//   브라우저에게 시키는 '동작' 인가?     → ref 로 합니다
//
//   [ref 로 해도 되는 것]
//     focus()        커서 놓기
//     blur()         커서 빼앗기
//     select()       글자 전체 선택
//     scrollIntoView()  스크롤 이동
//     play() / pause()  동영상·소리 재생과 정지
//     요소의 크기·위치 재기 (offsetWidth 등)
//
//   [ref 로 하면 안 되는 것]
//     textContent 로 글자 바꾸기
//     value 에 값 넣기
//     style 로 색·크기 바꾸기
//     appendChild 로 요소 붙이기
//     classList 로 클래스 넣고 빼기
//
// 아래 데모로 왼쪽(잘못된 방법)과 오른쪽(옳은 방법)을 나란히 봅니다.

function GoodAndBad() {
  const msgRef = useRef(null);
  const [count, setCount] = useState(0);
  const [color, setColor] = useState("black");

  function handleBad() {
    // ref 로 글자를 직접 바꿉니다. 화면은 바뀝니다. 하지만 React 는 모릅니다.
    msgRef.current.textContent = "직접 넣은 글자";
    console.log("ref 로 글자를 직접 바꿨습니다 (나쁜 방법)");
    // 콘솔: ref 로 글자를 직접 바꿨습니다 (나쁜 방법)
  }

  function handleGood() {
    // 색은 화면에 보이는 것이니 state 로 바꿉니다.
    setColor(color === "black" ? "#2d6cdf" : "black");
    console.log("state 로 색을 바꿨습니다 (옳은 방법)");
    // 콘솔: state 로 색을 바꿨습니다 (옳은 방법)
  }

  return (
    <div className="demo">
      <h3>⑥ 나쁜 방법과 옳은 방법</h3>
      <p ref={msgRef} style={{ color: color }}>
        담은 개수는 {count} 개입니다
      </p>
      <button onClick={handleBad}>ref 로 글자 바꾸기</button>
      <button onClick={handleGood}>state 로 색 바꾸기</button>
      <button onClick={() => setCount(count + 1)}>담기</button>
    </div>
  );
}

// 이 순서로 눌러 보세요.
//   1) [ref 로 글자 바꾸기] → 문장이 "직접 넣은 글자" 가 됩니다
//   2) [담기]               → 개수를 올렸는데도 문장이 그대로입니다
//
// 화면(누르면): "담은 개수는 0 개입니다" → ref 로 글자 바꾸기 → "직접 넣은 글자"
// 화면(누르면): 그 뒤로는 [담기] 를 아무리 눌러도 문장이 안 바뀝니다
//
// 2)번이 무서운 부분입니다. 화면이 그냥 안 되돌아온 게 아니라,
// 그 뒤로 React 가 이 문장을 고치는 능력을 잃었습니다.
//
// 왜냐하면 React 는 "담은 개수는 / 0 / 개입니다" 를 조각으로 기억해 두고
// 숫자 조각만 갈아 끼우는 식으로 화면을 고칩니다.
// textContent 로 통째로 덮어쓰면 그 조각들이 사라져서,
// React 가 갈아 끼우려고 손을 뻗어도 잡을 것이 없습니다.
//
// 반대로 [state 로 색 바꾸기] 는 몇 번을 눌러도 멀쩡합니다.
// state 를 바꿨으니 React 가 알고 있고, 화면도 그에 맞춰 다시 그려집니다.

// ✏️ 직접 해보기 6 — [담기] 를 먼저 세 번 누르고,
//                    그 다음에 [ref 로 글자 바꾸기] 를 눌러 보세요.
//                    그 뒤 [담기] 를 또 눌렀을 때 숫자가 어떻게 되는지 보세요.

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 컴포넌트 본문에서 ref.current 를 씀
//
//   function Bad() {
//     const inputRef = useRef(null);
//     inputRef.current.focus();          // ← 여기서 터집니다
//     return <input ref={inputRef} />;
//   }
//
// 실수: TypeError: Cannot read properties of null (reading 'focus')
//       그리는 도중에는 상자가 아직 null 입니다. 섹션 2에서 확인했습니다.
//       JS자료 10단원에서 script 를 head 에 두면 났던 그 에러와 같은 모양입니다.
//       고치는 법: useEffect 안이나 이벤트 핸들러 안으로 옮깁니다.

// [실수 2] ref 를 요소에 안 붙임
//
//   const inputRef = useRef(null);
//   return <input />;                    // ← ref={inputRef} 를 빼먹었습니다
//   ...
//   inputRef.current.focus();            // ← 상자가 영영 null 입니다
//
// 실수: TypeError: Cannot read properties of null (reading 'focus')
//       에러 메시지가 실수 1과 똑같아서 헷갈립니다.
//       ref={...} 를 붙였는지부터 확인하세요.

// [실수 3] .current 를 빼먹음
//
//   inputRef.focus();
//
// 실수: TypeError: inputRef.focus is not a function
//       useRef 가 돌려주는 것은 요소가 아니라 상자입니다.
//       요소는 상자 안, 즉 .current 에 들어 있습니다.

// [실수 4] ref 에 .current 를 붙여서 넘김
//
//   return <input ref={inputRef.current} />;
//
// 실수: 에러는 안 납니다. 그런데 상자가 영영 안 채워집니다.
//       React 에게는 '상자' 를 줘야 합니다. 상자 안에 든 것(null)을 주면 안 됩니다.
//       조용히 안 되는 쪽이라 찾기 어렵습니다.

// [실수 5] ref 로 화면 내용을 바꿈
//
//   msgRef.current.textContent = "새 글자";
//
// 실수: 섹션 6에서 본 그것입니다. 에러는 안 나고 그 뒤로 화면이 안 고쳐집니다.
//       내용은 state 로 바꿉니다.

// [실수 6] 태그를 안 닫음 — 눈으로만
//
//   return <input ref={inputRef}>;
//
// 실수: [SyntaxError] 02단원에서 배운 대로 input 은 스스로 닫는 태그입니다.
//       <input ... /> 로 써야 합니다. 이건 파일 전체가 안 돌아갑니다.

export default function Concept01ElementRef() {
  return (
    <div>
      <h1>개념 01 — useRef 로 요소 다루기</h1>

      <p className="guide">
        F12 → Console 을 함께 열어 두세요. 이 파일은 콘솔에도 결과를 찍습니다.
        <br />
        각 데모의 버튼을 <strong>파일에 적힌 순서대로</strong> 눌러 보세요.
        순서가 다르면 다른 결과가 나옵니다.
      </p>

      <DirectDom />
      <RefBasic />
      <FocusDemo />
      <AutoFocusForm />
      <ScrollDemo />
      <GoodAndBad />

      <Summary
        items={[
          "React 가 그린 화면의 내용은 React 가 관리합니다. querySelector 로 직접 고치면 조용히 어긋납니다.",
          "화면에 보이는 내용은 state 로, 브라우저에게 시키는 동작은 ref 로 다룹니다.",
          "useRef(null) 로 상자를 만들고, 요소에 ref={상자} 로 붙이면 React 가 상자의 current 에 요소를 넣어 줍니다.",
          "ref.current 는 화면을 다 그린 뒤에 채워집니다. 그래서 이벤트 핸들러 안이나 useEffect 안에서만 씁니다.",
          "포커스(focus)·글자 선택(select)·스크롤(scrollIntoView)·재생(play)이 ref 의 대표 용도입니다.",
          "ref 로 textContent 나 style 을 바꾸면 그 뒤로 React 가 그 부분을 못 고칩니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) "라떼" 인 상태에서 "ㄱ" 을 치면 입력칸이 "라떼ㄱ" 이 되고,
//    아래 "React 가 아는 값" 까지 "라떼ㄱ" 으로 바뀝니다.
//    화면: 입력칸 "라떼ㄱ" / React 가 아는 값: 라떼ㄱ
//    → 타이핑하면 onChange 가 그 순간 입력칸에 들어 있는 글자 '전부' 를 읽어
//      state 에 넣습니다. 내가 몰래 넣은 "라떼" 가 그대로 state 로 들어와 버립니다.
//
//    여기서 진짜 문제가 보입니다. 몰래 고친 값은
//      · 다른 곳 때문에 다시 그려지면 → 조용히 지워지고
//      · 사용자가 타이핑하면        → 반대로 state 를 덮어씁니다
//    어느 쪽이 될지 코드만 봐서는 알 수 없습니다.
//    "화면을 직접 고치지 마세요" 는 이런 이유 때문입니다.
//
// 2) console.log(boxRef.current.id);
//    // 콘솔: (빈 줄)
//    → 그 input 에는 id 를 안 붙였습니다. 그래서 빈 문자열이 나옵니다.
//      ref 를 쓰면 id 가 필요 없다는 것을 보여 주는 결과이기도 합니다.
//
// 3) <button onClick={() => searchRef.current.blur()}>커서 빼앗기</button>
//    화면(누르면): 검색칸 테두리가 다시 옅어지고 커서가 사라집니다.
//
// 4) 저장하고 나면 커서가 [저장] 버튼에 남아 있습니다.
//    화면(누르면): 저장은 되는데 이름 칸이 비어 있고 커서가 거기 없습니다.
//                  다음 이름을 치려면 입력칸을 한 번 더 클릭해야 합니다.
//    → 버튼을 누르면 브라우저는 그 버튼에 포커스를 둡니다. 그게 기본 동작입니다.
//      그래서 저장한 뒤 focus() 로 커서를 입력칸에 되돌려 놓는 것입니다.
//      이름을 여러 개 연달아 넣어 보면 한 줄 있고 없고의 차이가 크게 느껴집니다.
//      확인했으면 지운 줄을 다시 넣으세요.
//
// 5) <li key={name} ref={name === "삼각김밥" ? cakeRef : null}>
//    화면(누르면): 목록이 맨 아래 '삼각김밥' 줄까지 내려갑니다.
//
// 6) [담기] 를 세 번 누르면 "담은 개수는 3 개입니다" 가 됩니다.
//    그 뒤 [ref 로 글자 바꾸기] 를 누르면 "직접 넣은 글자" 로 바뀌고,
//    다시 [담기] 를 눌러도 문장은 그대로입니다.
//    화면(누르면): "직접 넣은 글자" 에서 더 이상 안 바뀝니다.
//    → count 는 계속 올라가고 있습니다. 화면만 못 따라오는 것입니다.
//      React 가 숫자를 갈아 끼우려던 자리를 내가 지워 버렸기 때문입니다.
//      다른 예제를 골랐다가 돌아오면 화면이 처음부터 다시 그려져 정상으로 돌아옵니다.
