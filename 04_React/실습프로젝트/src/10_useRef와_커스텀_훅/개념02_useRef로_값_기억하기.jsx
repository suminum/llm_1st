// ============================================================
// 10단원 · 개념 02 — useRef 로 값 기억하기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념01에서 useRef 를 '요소를 담는 통로' 로 썼습니다.
// 사실 useRef 는 요소 전용 도구가 아닙니다.
//
// useRef 가 하는 일은 딱 하나입니다.
//   "다시 그려도 안 없어지는 상자를 하나 준다"
//
// 그 상자에 요소를 넣으면 개념01이 되고, 숫자나 타이머 id 를 넣으면 이 파일이 됩니다.
//
// 그리고 아주 중요한 성질이 하나 있습니다.
//   상자 안의 값을 바꿔도 React 는 화면을 다시 그리지 않습니다.
//
// state 와 정반대입니다. 이 파일은 그 차이를 눈으로 확인하는 파일입니다.

import { useState, useRef, useEffect } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: useRef 가 주는 것은 '상자' 입니다 ──

// useRef(0) 을 부르면 React 는 이런 객체를 하나 만들어 돌려줍니다.
//
//     { current: 0 }
//
// 안에 든 값을 꺼낼 때도, 넣을 때도 current 를 씁니다.
//
//     boxRef.current          꺼내기
//     boxRef.current = 5      넣기
//
// current 라는 이름은 정해져 있습니다. 바꿀 수 없습니다.
//
// 이 상자에는 특별한 점이 하나 있습니다.
// 컴포넌트가 몇 번을 다시 그려져도 React 가 '같은 상자' 를 계속 돌려줍니다.
// 그래서 값이 사라지지 않습니다.

function RefShape() {
  // 이 상자는 이 파일에서 한 번도 바꾸지 않습니다. 모양만 보는 용도입니다.
  const boxRef = useRef(0);

  console.log(boxRef);
  // 콘솔: { current: 0 }

  console.log(typeof boxRef);
  // 콘솔: object

  return (
    <div className="demo">
      <h3>① useRef 가 돌려주는 것</h3>
      <p>
        useRef(0) 의 결과: <code>{"{ current: 0 }"}</code>
      </p>
      <p>F12 → Console 에서 실제 모양을 확인하세요.</p>
    </div>
  );
}

// useState 와 모양부터 다릅니다.
//
//   const [count, setCount] = useState(0);   ← 값과 바꾸는 함수, 두 개를 받습니다
//   const countRef = useRef(0);              ← 상자 하나를 받습니다
//
// useRef 에는 바꾸는 함수가 없습니다.
// 상자 안에 직접 넣습니다. 그래서 React 는 값이 바뀐 줄도 모릅니다.

// ✏️ 직접 해보기 1 — RefShape 안에서 useRef(0) 을 useRef("아메리카노") 로 바꾸고
//                    콘솔에 무엇이 찍히는지 확인하세요.

// ── 섹션 2: 나란히 놓고 비교하기 (이 파일의 핵심) ──

// 아래 데모에는 값이 두 개 있습니다. 하는 일은 똑같이 '1 올리기' 입니다.
//
//   refCount    useRef 로 만든 상자
//   stateCount  useState 로 만든 state
//
// 두 값을 화면에도 나란히 보여 줍니다.
// [ref 올리기] 를 눌러 보고, 그 다음 [state 올리기] 를 눌러 보세요.

function RefVsState() {
  const refCount = useRef(0);
  const [stateCount, setStateCount] = useState(0);

  // 이 줄은 컴포넌트가 다시 그려질 때마다 실행됩니다.
  // 즉 이 줄이 콘솔에 찍혔다면 '화면을 다시 그렸다' 는 뜻입니다.
  console.log("[다시 그림] RefVsState 를 다시 그렸습니다");
  // 콘솔: [다시 그림] RefVsState 를 다시 그렸습니다

  function handleRefUp() {
    // set 함수가 없습니다. 상자에 직접 넣습니다.
    refCount.current = refCount.current + 1;

    console.log(`ref 를 올렸습니다. 진짜 값은 ${refCount.current} 입니다`);
    // 콘솔: ref 를 올렸습니다. 진짜 값은 1 입니다
    // (두 번째로 누르면 2, 세 번째로 누르면 3 이 찍힙니다)
  }

  function handleStateUp() {
    setStateCount(stateCount + 1);

    console.log("state 를 올렸습니다. React 가 화면을 다시 그립니다");
    // 콘솔: state 를 올렸습니다. React 가 화면을 다시 그립니다
  }

  return (
    <div className="demo">
      <h3>② ref 와 state 를 나란히</h3>
      <div className="output">
        <div>화면에 보이는 ref 값: {refCount.current}</div>
        <div>화면에 보이는 state 값: {stateCount}</div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleRefUp}>ref 올리기</button>
        <button onClick={handleStateUp}>state 올리기</button>
      </div>
    </div>
  );
}

// 이 순서대로 눌러 보세요. 콘솔도 같이 보셔야 합니다.
//
//   1) [ref 올리기] 를 세 번 누른다
//      화면(누르면): "화면에 보이는 ref 값: 0" 그대로입니다. 안 바뀝니다.
//      콘솔에는 진짜 값이 1, 2, 3 으로 올라간 것이 찍힙니다.
//      [다시 그림] 은 한 번도 안 찍힙니다.
//
//   2) [state 올리기] 를 한 번 누른다
//      화면(누르면): state 값이 1 이 되고,
//                    그와 동시에 ref 값이 갑자기 3 으로 튀어나옵니다.
//      콘솔에 [다시 그림] 이 찍힙니다.
//
// 2)번이 이 파일에서 가장 중요한 장면입니다.
//
// ref 값은 사실 1)번에서 이미 3 이었습니다. 상자 안에서 잘 올라가고 있었습니다.
// 다만 React 가 화면을 다시 그리지 않아서 화면이 옛날 값을 계속 보여 준 것입니다.
// state 를 올리는 순간 React 가 화면을 다시 그렸고, 그때 비로소 3 이 나왔습니다.
//
// 여기서 두 가지를 얻습니다.
//
//   ① ref 를 바꾸는 것은 React 에게 아무 신호도 주지 않습니다.
//      그래서 화면에 보여야 하는 값을 ref 에 두면 화면이 안 바뀝니다.
//      에러도 안 납니다. 조용히 틀립니다.
//
//   ② 반대로, 화면에 안 보여도 되는 값을 state 로 두면
//      바꿀 때마다 쓸데없이 화면을 다시 그립니다.
//
// 그래서 판단 기준은 하나입니다.
//   이 값이 바뀌면 화면도 바뀌어야 하나?  →  예: state / 아니오: ref

// 개발 중에는 [다시 그림] 이 두 번씩 찍힙니다. 이것은 정상입니다.
// main.jsx 가 StrictMode 를 켜 두었기 때문입니다.
// 실수를 미리 찾아 주려고 개발 중에만 컴포넌트를 두 번 실행합니다.
// 09단원에서 useEffect 가 두 번 도는 것과 같은 이유입니다.

// ✏️ 직접 해보기 2 — [ref 올리기] 를 다섯 번 누른 뒤 [state 올리기] 를 한 번 누르면
//                    화면의 ref 값이 얼마가 될지 먼저 예상하고, 확인해 보세요.

// ── 섹션 3: 그냥 변수로는 왜 안 되나 ──

// "다시 안 그려도 되는 값이면 그냥 let 변수를 쓰면 되지 않나?" 라고 생각할 수 있습니다.
// 04단원 개념02에서 이미 한 번 본 이야기입니다. 다시 확인해 봅니다.
//
// 컴포넌트는 '함수' 입니다. 다시 그린다는 것은 그 함수를 처음부터 다시 실행한다는 뜻입니다.
// 함수 안의 let 변수는 함수가 다시 실행되면 처음 값으로 되돌아갑니다.

function LocalVarDemo() {
  // 다시 그릴 때마다 이 줄이 다시 실행됩니다. 그래서 항상 0 부터 시작합니다.
  let localCount = 0;

  const [tick, setTick] = useState(0);

  function handleLocalUp() {
    localCount = localCount + 1;
    console.log(`지역 변수는 지금 ${localCount} 입니다`);
    // 콘솔: 지역 변수는 지금 1 입니다
    // (다시 그리기 전까지는 2, 3 으로 올라갑니다)
  }

  return (
    <div className="demo">
      <h3>③ 그냥 변수는 다시 그리면 사라집니다</h3>
      <div className="output">
        <div>화면에 보이는 지역 변수: {localCount}</div>
        <div>다시 그린 횟수 세는 state: {tick}</div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleLocalUp}>지역 변수 올리기</button>
        <button onClick={() => setTick(tick + 1)}>다시 그리기</button>
      </div>
    </div>
  );
}

// 이렇게 눌러 보세요.
//   1) [지역 변수 올리기] 세 번 → 콘솔에 1, 2, 3
//   2) [다시 그리기] 한 번
//   3) [지역 변수 올리기] 한 번 → 콘솔에 다시 1
//
// 3)번에서 값이 1 로 돌아갔습니다. 쌓아 둔 3 이 사라진 것입니다.
//
// useRef 는 바로 이 문제를 풉니다.
//   지역 변수  다시 그리면 사라진다
//   state      안 사라지지만, 바꿀 때마다 화면을 다시 그린다
//   ref        안 사라지고, 바꿔도 화면을 안 그린다   ← 이 자리가 비어 있었습니다

// ✏️ 직접 해보기 3 — LocalVarDemo 의 let localCount = 0 을
//                    const localCount = useRef(0) 로 바꾸고,
//                    handleLocalUp 안을 localCount.current = localCount.current + 1 로
//                    고쳐 보세요. 그 다음 1) 2) 3) 을 다시 해 보세요.

// ── 섹션 4: 실전 — 타이머 id 보관하기 ──

// 여기서부터가 useRef 를 실제로 쓰는 자리입니다.
//
// JS자료 12단원에서 setTimeout 과 setInterval 을 배웠습니다.
//
//     const id = setInterval(함수, 1000);   // 시작하면 번호(id)를 돌려줍니다
//     clearInterval(id);                    // 그 번호로 멈춥니다
//
// 멈추려면 시작할 때 받은 번호를 어딘가에 적어 둬야 합니다.
// 그 '어딘가' 가 어디여야 할까요? 셋 다 해 봅니다.
//
//   지역 변수 → 다시 그리면 사라집니다. 멈출 수가 없습니다.  ← 아래에서 확인
//   state     → 되긴 됩니다. 그런데 id 는 화면에 안 보이는 값입니다.
//               state 로 두면 시작할 때마다 쓸데없이 화면을 다시 그립니다.
//   ref       → 안 사라지고, 화면도 안 건드립니다. 정답입니다.

function BrokenTimer() {
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);

  // 여기가 문제의 줄입니다. 다시 그릴 때마다 null 로 돌아갑니다.
  let timerId = null;

  function handleStart() {
    if (running) return;

    const id = setInterval(() => {
      setSec((prev) => prev + 1);
    }, 250);

    timerId = id;
    setRunning(true);

    console.log("고장난 타이머를 시작했습니다");
    // 콘솔: 고장난 타이머를 시작했습니다

    // 이 자료가 멈추지 않는 타이머를 남기면 곤란하니
    // 2초 뒤에는 스스로 멈추도록 안전장치를 넣어 뒀습니다.
    // 원래 코드에는 없는 줄입니다.
    setTimeout(() => {
      clearInterval(id);
      setRunning(false);
    }, 2000);
  }

  function handleStop() {
    console.log(`멈추려 했지만 기억해 둔 id 는 ${String(timerId)} 입니다`);
    // 콘솔: 멈추려 했지만 기억해 둔 id 는 null 입니다

    clearInterval(timerId); // null 을 넘기므로 아무 일도 안 일어납니다
  }

  return (
    <div className="demo">
      <h3>④-1 고장난 타이머 (지역 변수에 id 를 뒀습니다)</h3>
      <div className="output">
        {sec} 칸 {running ? "(도는 중)" : "(멈춤)"}
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleStart}>시작</button>
        <button onClick={handleStop}>멈춤</button>
      </div>
    </div>
  );
}

// [시작] 을 누르면 숫자가 올라갑니다. 그때 [멈춤] 을 눌러 보세요.
// 화면(누르면): 숫자가 계속 올라갑니다. 안 멈춥니다.
//
// 왜 그럴까요? 순서를 따라가 봅시다.
//
//   1) [시작] 을 누른다 → timerId 에 번호가 들어간다
//   2) setRunning(true) 때문에 화면을 다시 그린다
//   3) 다시 그리면서 let timerId = null 이 또 실행된다  ← 번호가 지워졌습니다
//   4) [멈춤] 을 누르면 null 로 멈추려 한다 → 아무 일도 안 일어난다
//
// 콘솔에 "기억해 둔 id 는 null 입니다" 가 찍히는 것으로 확인할 수 있습니다.
//
// (위 데모는 2초 뒤 스스로 멈춥니다. 자료가 안전하도록 넣어 둔 장치이고,
//  원래 잘못된 코드에는 그런 장치가 없어서 영영 안 멈춥니다.)

function RefTimer() {
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);

  // 상자에 넣어 둡니다. 다시 그려도 이 상자는 그대로입니다.
  const timerRef = useRef(null);

  function handleStart() {
    if (timerRef.current !== null) return; // 이미 돌고 있으면 무시

    timerRef.current = setInterval(() => {
      setSec((prev) => prev + 1);
    }, 250);
    setRunning(true);

    console.log("타이머를 시작했습니다");
    // 콘솔: 타이머를 시작했습니다
  }

  function handleStop() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);

    console.log("타이머를 멈췄습니다");
    // 콘솔: 타이머를 멈췄습니다
  }

  function handleReset() {
    setSec(0);
    console.log("0 으로 되돌렸습니다");
    // 콘솔: 0 으로 되돌렸습니다
  }

  // 09단원 개념02의 정리 함수입니다.
  // 이 예제를 떠나면(다른 메뉴를 고르면) 돌던 타이머를 치웁니다.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="demo">
      <h3>④-2 제대로 도는 타이머 (ref 에 id 를 뒀습니다)</h3>
      <div className="output">
        {sec} 칸 {running ? "(도는 중)" : "(멈춤)"}
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleStart}>시작</button>
        <button onClick={handleStop}>멈춤</button>
        <button onClick={handleReset}>0 으로</button>
      </div>
    </div>
  );
}

// 화면(누르면): [시작] 을 누르면 0.25초마다 한 칸씩 올라가고,
//               [멈춤] 을 누르면 그 자리에 섭니다.
//
// 두 컴포넌트의 차이는 딱 한 줄입니다.
//
//   let timerId = null;                      ← 고장난 쪽
//   const timerRef = useRef(null);           ← 제대로 도는 쪽
//
// 여기서 sec 는 state 인 것에 주의하세요. 화면에 보여야 하는 값이니까요.
// 반대로 timerRef 는 화면에 한 번도 안 나옵니다. 그래서 ref 입니다.
// 한 컴포넌트 안에서 state 와 ref 를 이렇게 나눠 씁니다.

// ✏️ 직접 해보기 4 — RefTimer 의 handleStop 에서
//                    timerRef.current = null; 줄만 지워 보세요.
//                    [시작] [멈춤] [시작] 순서로 눌렀을 때 무슨 일이 생기는지 보세요.

// ── 섹션 5: 실전 — 직전 값 기억하기 ──

// "방금 전에는 무엇이었지?" 를 알아야 할 때가 있습니다.
// 화면에 꼭 보여야 하는 값은 아니니 ref 가 알맞습니다.
//
// 방법은 이렇습니다.
//   화면을 다 그린 뒤(useEffect)에 지금 값을 상자에 넣어 둡니다.
//   그러면 다음번에 그릴 때 상자 안에는 '직전 값' 이 들어 있습니다.

function PreviousValue() {
  const [menu, setMenu] = useState("아메리카노");
  const prevMenuRef = useRef("(없음)");

  useEffect(() => {
    // 그리기가 끝난 뒤에 실행되므로, 화면에는 아직 옛날 값이 쓰였습니다.
    prevMenuRef.current = menu;
  }, [menu]);

  function pick(name) {
    setMenu(name);
    console.log(`고른 메뉴: ${name}`);
    // 콘솔: 고른 메뉴: 라떼
    // 콘솔: 고른 메뉴: 케이크
    // 콘솔: 고른 메뉴: 삼각김밥
  }

  return (
    <div className="demo">
      <h3>⑤ 직전 값 기억하기</h3>
      <div className="output">
        <div>지금 고른 메뉴: {menu}</div>
        <div>직전에 고른 메뉴: {prevMenuRef.current}</div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => pick("라떼")}>라떼</button>
        <button onClick={() => pick("케이크")}>케이크</button>
        <button onClick={() => pick("삼각김밥")}>삼각김밥</button>
      </div>
    </div>
  );
}

// 화면(누르면): [라떼] → 지금 라떼 / 직전 아메리카노
// 화면(누르면): 이어서 [케이크] → 지금 케이크 / 직전 라떼
//
// prevMenuRef 를 state 로 만들면 어떻게 될까요?
// setPrevMenu 를 부르면 그 순간 렌더가 한 번 더 일어납니다. 하지만 이 useEffect 의
// 의존성은 [menu] 뿐이고 setPrevMenu 는 menu 를 바꾸지 않으므로, 그 렌더에서
// effect 가 다시 돌지는 않습니다. 09단원 개념06의 무한 루프는 effect 안에서 바꾼
// state 가 그 effect 자신의 의존성에도 들어 있어서 생긴 것이라 여기와는 다릅니다.
// 렌더가 딱 한 번 더 늘어날 뿐, 무한 루프는 아닙니다.
// 그래도 ref 가 더 알맞습니다. 직전 값은 menu 가 바뀔 때 이미 일어나는 렌더에
// 실려서 화면에 나오므로, 굳이 렌더를 하나 더 만들 필요가 없습니다.

// ✏️ 직접 해보기 5 — 같은 버튼을 두 번 연달아 누르면
//                    "직전에 고른 메뉴" 가 어떻게 되는지 확인하고 이유를 생각해 보세요.

// ── 섹션 6: state 와 ref, 무엇으로 할까 ──

// 표로 정리하면 이렇습니다.
//
//   | 묻는 것            | useState              | useRef                   |
//   | 만들기             | const [x, setX] = ... | const xRef = useRef(...) |
//   | 읽기               | x                     | xRef.current             |
//   | 바꾸기             | setX(새 값)           | xRef.current = 새 값     |
//   | 바꾸면 다시 그리나 | 예                    | 아니오                   |
//   | 바로 읽으면        | 옛날 값 (04단원)      | 방금 넣은 값             |
//   | 어디에 쓰나        | 화면에 보이는 값      | 화면과 상관없는 값       |
//
// 표에서 '바로 읽으면' 줄을 눈여겨보세요. 04단원 개념05에서 배운 것입니다.
//
//     setCount(count + 1);
//     console.log(count);        // 아직 옛날 값입니다
//
//     countRef.current = countRef.current + 1;
//     console.log(countRef.current);   // 방금 넣은 값이 그대로 나옵니다
//
// ref 는 그냥 객체의 속성을 바꾸는 것이라 즉시 반영됩니다.
// state 는 React 에게 부탁하는 것이라 다음 렌더에 반영됩니다.
//
// ref 를 쓸 자리는 생각보다 적습니다. 아래 정도입니다.
//   - 요소 다루기 (개념01)
//   - 타이머 id, 구독 해제 함수 같은 '치울 것' 보관
//   - 직전 값 기억
//   - 화면과 무관한 누적값 (예: 몇 번 눌렀는지 몰래 세기)
//
// 헷갈리면 state 로 시작하세요.
// 화면에 안 나오는데 자꾸 다시 그려서 곤란할 때 ref 로 옮기면 됩니다.

// ✏️ 직접 해보기 6 — 아래 값들은 state 일까요 ref 일까요? 하나씩 답해 보세요.
//                    (가) 장바구니에 담긴 개수
//                    (나) 입력칸 요소 자체
//                    (다) 사용자가 이 화면에 들어온 시각
//                    (라) 검색 결과 목록

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 화면에 보여야 할 값을 ref 에 둠
//
//   const countRef = useRef(0);
//   <button onClick={() => (countRef.current += 1)}>담기</button>
//   <p>{countRef.current} 개</p>
//
// 실수: 에러가 안 납니다. 그런데 눌러도 화면 숫자가 안 바뀝니다.
//       섹션 2에서 본 그 장면입니다. 이 단원에서 가장 많이 나는 실수입니다.
//       화면에 나오는 값이면 state 로 바꾸세요.

// [실수 2] .current 를 빼먹음
//
//   countRef = countRef + 1;
//
// 실수: TypeError: Assignment to constant variable.
//       const 로 만든 상자 자체를 바꾸려 했습니다. 바꿀 것은 상자 안(current)입니다.

// [실수 3] 그리는 도중에 ref 를 바꿈
//
//   function Bad() {
//     const countRef = useRef(0);
//     countRef.current = countRef.current + 1;   // ← 컴포넌트 본문
//     return <p>{countRef.current}</p>;
//   }
//
// 실수: 에러는 안 납니다. 그런데 값이 예상과 다릅니다.
//       개발 중에는 StrictMode 때문에 컴포넌트가 두 번 실행되므로 2씩 올라갑니다.
//       그리는 일은 '값을 읽어 화면을 만드는 일' 이어야 합니다.
//       값을 바꾸는 일은 이벤트 핸들러나 useEffect 안에서 하세요.

// [실수 4] ref 를 useEffect 의 의존성 배열에 넣음
//
//   useEffect(() => { ... }, [countRef.current]);
//
// 실수: 에러는 안 납니다. 그런데 값이 바뀌어도 useEffect 가 다시 안 돕니다.
//       ref 를 바꿔도 다시 그리지 않으니, 의존성을 비교할 기회 자체가 없습니다.
//       다시 돌게 하고 싶으면 그 값은 state 여야 합니다.

// [실수 5] 상자 안에 넣지 않고 상자를 통째로 씀
//
//   <p>{countRef}</p>
//
// 실수: Objects are not valid as a React child (found: object with keys {current})
//       상자는 객체입니다. 화면에 그릴 수 없습니다. countRef.current 로 써야 합니다.

// [실수 6] 화살표 함수의 중괄호를 빼먹음 — 눈으로만
//
//   <button onClick={() => { countRef.current += 1 }>담기</button>
//
// 실수: [SyntaxError] 중괄호를 안 닫았습니다. 파일 전체가 멈춥니다.
//       JSX 안에서는 괄호가 많아 자주 나는 실수입니다.

export default function Concept02ValueRef() {
  return (
    <div>
      <h1>개념 02 — useRef 로 값 기억하기</h1>

      <p className="guide">
        이 파일은 <strong>콘솔을 함께 봐야</strong> 뜻이 통합니다. F12 → Console 을 열어 두세요.
        <br />
        데모 ② 는 <strong>[ref 올리기] 를 세 번 누른 다음 [state 올리기]</strong> 순서로
        눌러 보세요.
      </p>

      <RefShape />
      <RefVsState />
      <LocalVarDemo />
      <BrokenTimer />
      <RefTimer />
      <PreviousValue />

      <Summary
        items={[
          "useRef 는 { current: 값 } 모양의 상자를 줍니다. 다시 그려도 같은 상자가 유지됩니다.",
          "상자 안의 값을 바꿔도 화면을 다시 그리지 않습니다. state 와 가장 큰 차이입니다.",
          "그래서 화면에 보여야 하는 값을 ref 에 두면 화면이 안 바뀝니다. 에러 없이 조용히 틀립니다.",
          "지역 변수는 다시 그리면 사라지고, state 는 바꿀 때마다 다시 그립니다. ref 는 그 사이를 메웁니다.",
          "타이머 id 처럼 화면에 안 나오지만 기억해야 하는 값이 ref 의 대표 용도입니다.",
          "판단 기준: 이 값이 바뀌면 화면도 바뀌어야 하나? 예면 state, 아니오면 ref.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const boxRef = useRef("아메리카노");
//    콘솔에 { current: '아메리카노' } 가 찍힙니다.
//    → 상자에는 어떤 값이든 넣을 수 있습니다. 숫자, 문자열, 객체, 요소, 함수 모두 됩니다.
//
// 2) 5 가 됩니다.
//    → [ref 올리기] 를 다섯 번 누르는 동안 화면은 0 인 채였지만
//      상자 안에서는 1, 2, 3, 4, 5 로 올라가고 있었습니다.
//      [state 올리기] 가 화면을 다시 그리는 순간 그 5 가 화면에 나타납니다.
//      개발 중이라면 [다시 그림] 이 두 번 찍힙니다. StrictMode 때문이고 정상입니다.
//
// 3) let localCount = 0;  →  const localCount = useRef(0);
//    localCount = localCount + 1;  →  localCount.current = localCount.current + 1;
//    화면에 보이는 값은 {localCount.current} 로 고칩니다.
//    결과: [다시 그리기] 를 눌러도 값이 사라지지 않습니다.
//          [지역 변수 올리기] 를 세 번 → [다시 그리기] → 화면에 3 이 나옵니다.
//
// 4) 두 번째 [시작] 이 안 먹습니다.
//    화면(누르면): [시작] → 숫자가 올라감 → [멈춤] → 섬 → [시작] → 그대로 서 있음
//    → handleStop 에서 clearInterval 로 타이머는 멈췄지만 상자는 안 비웠습니다.
//      상자 안에는 아직 옛날 번호가 들어 있습니다.
//      그래서 handleStart 첫 줄의
//        if (timerRef.current !== null) return;
//      에 걸려 "이미 돌고 있다" 고 오해하고 그냥 돌아가 버립니다.
//      치울 때는 clearInterval 과 함께 상자도 null 로 비워야 합니다.
//
// 5) 같은 버튼을 두 번 누르면 "직전에 고른 메뉴" 가 안 바뀝니다.
//    화면(누르면): [라떼] [라떼] → 지금 라떼 / 직전 아메리카노
//    → 두 번째 클릭에서는 menu 가 "라떼" 에서 "라떼" 로 바뀌는 셈이라
//      React 가 값이 같다고 보고 다시 그리지 않습니다.
//      다시 안 그리니 useEffect 도 안 돌고, 상자도 그대로입니다.
//
// 6) (가) state — 화면에 개수가 보여야 합니다.
//    (나) ref   — 요소는 화면에 그리는 값이 아닙니다. 개념01에서 배운 그대로입니다.
//    (다) ref   — 들어온 시각을 화면에 안 보여 준다면 ref 가 알맞습니다.
//                 화면에 "머문 시간" 을 계속 보여 준다면 그 시간은 state 입니다.
//    (라) state — 목록이 화면에 그려집니다.
