// ============================================================
// 10단원 · 개념 03 — 커스텀 훅
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 지금까지 useState, useEffect, useRef 를 배웠습니다. 전부 React 가 준 훅입니다.
// 이 파일에서는 훅을 '직접 만듭니다'.
//
// 먼저 겁먹지 않도록 결론부터 적습니다.
//
//   커스텀 훅은 새로운 문법이 아닙니다.
//   훅을 부르는 코드를 함수 하나로 묶은 것, 그게 전부입니다.
//
// import 도, 특별한 선언도 없습니다. 그냥 함수를 만들면 됩니다.
// JS자료 05단원에서 "같은 코드가 반복되면 함수로 묶는다" 를 배웠습니다.
// 그 이야기를 훅에 그대로 적용하는 것뿐입니다.

import { useState, useRef, useEffect } from "react";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 같은 코드가 자꾸 반복됩니다 ──

// 아래 두 컴포넌트를 보세요. 하나는 커피 잔 수, 하나는 케이크 조각 수를 셉니다.
// 세는 대상만 다르고 코드는 똑같습니다.

function CoffeeCounterOld() {
  //반복되는 동작
  const [count, setCount] = useState(0);

  function increase() {
    setCount((prev) => prev + 1);
  }
  function decrease() {
    setCount((prev) => prev - 1);
  }
  function reset() {
    setCount(0);
  }

  return (
    <div className="output">
      아메리카노 {count} 잔
      <div style={{ marginTop: 6 }}>
        <button onClick={increase}>담기</button>
        <button onClick={decrease}>빼기</button>
        <button onClick={reset}>비우기</button>
      </div>
    </div>
  );
}

function CakeCounterOld() {
  //반복되는 동작 222222
  // 위와 완전히 같은 코드입니다. 이름만 케이크로 바꿨습니다.
  const [count, setCount] = useState(0);

  function increase() {
    setCount((prev) => prev + 1);
  }
  function decrease() {
    setCount((prev) => prev - 1);
  }
  function reset() {
    setCount(0);
  }

  return (
    <div className="output">
      케이크 {count} 조각
      <div style={{ marginTop: 6 }}>
        <button onClick={increase}>담기</button>
        <button onClick={decrease}>빼기</button>
        <button onClick={reset}>비우기</button>
      </div>
    </div>
  );
}

function SectionOne() {
  return (
    <div className="demo">
      <h3>① 코드가 겹치는 두 컴포넌트</h3>
      <CoffeeCounterOld />
      <CakeCounterOld />
    </div>
  );
}

// 화면: 담기·빼기·비우기 버튼이 두 줄로 나옵니다. 둘 다 잘 동작합니다.
//
// 잘 돌아가긴 합니다. 그런데 여기에 요구사항이 하나 붙는다고 해 봅시다.
//   "0 아래로는 내려가지 않게 해 주세요"
//
// 그러면 decrease 를 두 군데 다 고쳐야 합니다.
// 컴포넌트가 다섯 개면 다섯 군데입니다. 한 군데를 빠뜨리면 거기만 조용히 다르게 동작합니다.
//
// 03단원에서 "반복되는 화면은 컴포넌트로 묶는다" 를 배웠습니다.
// 그런데 여기서 겹치는 것은 화면이 아닙니다. 화면은 서로 다릅니다.
// 겹치는 것은 state 와 그 state 를 다루는 함수들, 즉 '동작' 입니다.
//
// 동작을 묶는 것이 커스텀 훅입니다.

// ✏️ 직접 해보기 1 — CoffeeCounterOld 와 CakeCounterOld 에서
//                    서로 다른 줄이 몇 줄인지 세어 보세요.

// ── 섹션 2: 함수로 묶으면 끝입니다 — useCounter ──

// 겹치는 부분(state 와 세 함수)을 그대로 잘라 함수 안에 넣습니다.
// 그리고 컴포넌트가 필요로 하는 것들을 return 으로 돌려줍니다.

function useCounter(initial = 0) {
  ////반복되는 화면이 아닌 반복되는 동작을 묶는게 카스텀 훅 화면는 각각 다르다
  // 훅 안에서 훅을 부릅니다. 이게 됩니다. 커스텀 훅은 컴포넌트와 같은 취급을 받습니다.
  const [count, setCount] = useState(initial);

  function increase() {
    setCount((prev) => prev + 1);
  }
  function decrease() {
    setCount((prev) => prev - 1);
  }
  function reset() {
    setCount(initial);
  }

  // 아래는 { count: count, increase: increase, ... } 를 짧게 쓴 것입니다.
  // 키 이름과 변수 이름이 같으면 한 번만 써도 됩니다. '속성 축약' 이라고 부릅니다.
  return { count, increase, decrease, reset }; //하나의 객체로 한개만 리턴
}

// 쓰는 쪽은 이렇게 짧아집니다.

function CoffeeCounterNew() {
  const coffee = useCounter(0); //객체 훅사용

  function handleIncrease() {
    coffee.increase();
    console.log("useCounter 의 increase 를 불렀습니다");
    // 콘솔: useCounter 의 increase 를 불렀습니다
  }

  return (
    <div className="output">
      아메리카노 {coffee.count} 잔
      <div style={{ marginTop: 6 }}>
        <button onClick={handleIncrease}>담기</button>
        <button onClick={coffee.decrease}>빼기</button>
        <button onClick={coffee.reset}>비우기</button>
      </div>
    </div>
  );
}

function CakeCounterNew() {
  // 같은 훅을 부르고, 시작값만 다르게 줬습니다.
  const cake = useCounter(2); //훅사용

  return (
    <div className="output">
      케이크 {cake.count} 조각
      <div style={{ marginTop: 6 }}>
        <button onClick={cake.increase}>담기</button>
        <button onClick={cake.decrease}>빼기</button>
        <button onClick={cake.reset}>비우기</button>
      </div>
    </div>
  );
}

function SectionTwo() {
  return (
    <div className="demo">
      <h3>② useCounter 로 묶은 뒤</h3>
      <CoffeeCounterNew />
      <CakeCounterNew />
    </div>
  );
}

// 화면: ① 과 똑같이 동작합니다. 케이크만 2 조각에서 시작합니다.
//
// 코드에서 무엇이 달라졌는지 확인하세요.
//   - useState 와 세 함수가 컴포넌트에서 사라졌습니다
//   - 컴포넌트에는 화면 설명만 남았습니다
//   - "0 아래로 안 내려가게" 를 고칠 자리는 이제 useCounter 한 곳뿐입니다
//
// 그리고 다시 강조합니다. useCounter 는 그냥 함수입니다.
// function 으로 만들었고, 매개변수를 받고, return 을 합니다.
// 다른 점은 안에서 useState 를 부른다는 것뿐입니다.
//
// return 은 객체로 해도 되고 배열로 해도 됩니다.
//   return { count, increase };   →  const coffee = useCounter(); coffee.count
//   return [count, increase];     →  const [count, increase] = useCounter();
// useState 는 배열로 돌려줍니다(이름을 마음대로 지으라고).
// 돌려줄 것이 셋 이상이면 객체가 읽기 편합니다. 이 자료는 객체로 씁니다.

// ✏️ 직접 해보기 2 — useCounter 의 decrease 를 고쳐서
//                    0 아래로는 안 내려가게 만들어 보세요.
//                    (힌트: setCount((prev) => ...) 안에서 조건을 씁니다)

// ── 섹션 3: 왜 이름이 use 로 시작해야 하나 ──

// 이름을 useCounter 라고 지었습니다. counterLogic 이라고 지으면 안 될까요?
// 동작은 합니다. 그래도 use 로 시작해야 하는 이유가 두 가지 있습니다.
//
// [이유 1] 도구가 알아보게 하려고
//   개념04에서 배우겠지만 훅에는 지켜야 할 규칙이 있습니다.
//   그 규칙을 어겼는지 검사해 주는 도구(린트)가 있는데,
//   이 도구는 '이름이 use 로 시작하는 함수' 를 훅으로 봅니다.
//   이름이 다르면 검사를 건너뛰어서, 규칙을 어겨도 아무도 안 알려 줍니다.
//
// [이유 2] 사람이 알아보게 하려고
//   use 가 붙어 있으면 "이 함수 안에서 훅을 부르는구나" 를 압니다.
//   그래야 이 함수를 조건문 안에서 부르면 안 된다는 것도 압니다.
//
//     const coffee = useCounter();     ← 훅이구나. 맨 위에서 불러야겠다
//     const total = getTotal(cart);    ← 그냥 함수구나. 아무 데서나 불러도 되겠다
//
// 반대로, 안에서 훅을 하나도 안 부르는 함수에는 use 를 붙이지 마세요.
// 아래 함수는 훅이 아니라 그냥 계산 함수입니다.

function getTotalPrice(items) {
  // useState 도 useRef 도 안 씁니다. 그래서 use 를 안 붙였습니다.
  return items.reduce((sum, item) => sum + item.price * item.count, 0);
}

const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "케이크", price: 6000, count: 1 },
];

function SectionThree() {
  const total = getTotalPrice(cart);

  return (
    <div className="demo">
      <h3>③ 훅인 것과 아닌 것</h3>
      <p>useCounter(...) 는 훅입니다. 안에서 useState 를 부릅니다.</p>
      <p>getTotalPrice(cart) 는 그냥 함수입니다. 훅을 안 부릅니다.</p>
      <div className="output">장바구니 합계: {total} 원</div>
    </div>
  );
}

// 화면: 장바구니 합계: 14000 원

// ✏️ 직접 해보기 3 — 아래 셋 중 use 를 붙여야 하는 것을 고르세요.
//                    (가) 배열에서 가장 비싼 메뉴를 찾아 돌려주는 함수
//                    (나) 창 크기를 state 에 담아 두고 돌려주는 함수
//                    (다) 가격에 콤마를 찍어 문자열로 만드는 함수

// ── 섹션 4: useInput — 입력칸 다루기 묶기 ──

// 06단원에서 제어 컴포넌트를 배웠습니다. 입력칸 하나마다 이 세 줄이 필요했습니다.
//
//     const [name, setName] = useState("");
//     <input value={name} onChange={(e) => setName(e.target.value)} />
//
// 입력칸이 다섯 개면 이 짝이 다섯 벌입니다. 묶어 봅시다.

function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  // 이벤트 객체를 받아 값을 꺼내는 일까지 훅이 맡습니다.
  function onChange(e) {
    setValue(e.target.value); //input에 현재 입력되어 있는 값이
  }

  function clear() {
    setValue("");
  }

  return { value, onChange, clear };
}

function OrderForm() {
  const name = useInput("김민준");
  const memo = useInput("아메리카노 4000원");
  const [saved, setSaved] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // 06단원. 새로고침을 막습니다.
    setSaved(`${name.value} / ${memo.value}`);

    console.log(`저장했습니다: ${name.value} / ${memo.value}`);
    // 콘솔: 저장했습니다: 김민준 / 아메리카노 4000원
  }

  function handleClearName() {
    name.clear();
    console.log("이름 칸을 비웠습니다");
    // 콘솔: 이름 칸을 비웠습니다
  }

  function handleClearMemo() {
    memo.clear();
    console.log("메모 칸을 비웠습니다");
    // 콘솔: 메모 칸을 비웠습니다
  }

  return (
    <div className="demo">
      <h3>④ useInput 으로 묶은 폼</h3>
      <form onSubmit={handleSubmit}>
        <div>
          이름 <input value={name.value} onChange={name.onChange} />
        </div>
        <div style={{ marginTop: 6 }}>
          메모 <input value={memo.value} onChange={memo.onChange} />
        </div>
        <div style={{ marginTop: 8 }}>
          {/* form 안의 버튼은 기본이 submit 입니다. 아닌 것은 type 을 적어 줍니다. */}
          <button type="submit">저장</button>
          <button type="button" onClick={handleClearName}>
            이름 비우기
          </button>
          <button type="button" onClick={handleClearMemo}>
            메모 비우기
          </button>
        </div>
      </form>
      <div className="output">저장된 값: {saved || "(아직 없음)"}</div>
    </div>
  );
}

// 화면(누르면): [저장] → "저장된 값: 김민준 / 아메리카노 4000원"
// 화면(누르면): [이름 비우기] → 이름 칸이 빕니다. 메모 칸은 그대로입니다.
//
// 입력칸이 두 개인데 useState 는 한 줄도 안 보입니다. useInput 두 줄이 끝입니다.
// 입력칸이 열 개로 늘어도 useInput 열 줄입니다.
//
// value 와 onChange 를 따로 적는 것이 번거로워 보일 수 있습니다.
//     <input value={name.value} onChange={name.onChange} />
// 더 짧게 쓰는 문법도 있지만 이 자료에서는 이렇게 또박또박 적습니다.
// 무엇이 어디로 들어가는지 보이는 편이 배울 때 낫습니다.

// ✏️ 직접 해보기 4 — useInput 에 length 라는 값을 하나 더 돌려주게 고치고,
//                    이름 칸 옆에 글자 수를 보여 주세요.

// ── 섹션 5: 훅을 두 번 부르면 값도 두 개입니다 ──

// 가장 흔한 오해를 짚고 갑니다.
//
//   "커스텀 훅을 두 컴포넌트에서 쓰면 값이 같이 움직이나요?"
//   → 아닙니다. 따로 놉니다.
//
// 커스텀 훅이 공유하는 것은 '코드' 이지 '값' 이 아닙니다.
// useCounter 를 부를 때마다 그 안의 useState 가 새로 불립니다.
// 그러니 카운터도 새로 생깁니다.
//
// 섹션 2의 커피와 케이크가 따로 움직인 것도 같은 이유였습니다.
// 이번에는 한 컴포넌트 안에서 두 번 불러 봅니다.

function TwoCounters() {
  const coffee = useCounter(0);
  const cake = useCounter(0);

  function handleCoffee() {
    coffee.increase();
    console.log("커피 카운터만 올렸습니다");
    // 콘솔: 커피 카운터만 올렸습니다
  }

  function handleCake() {
    cake.increase();
    console.log("케이크 카운터만 올렸습니다");
    // 콘솔: 케이크 카운터만 올렸습니다
  }

  return (
    <div className="demo">
      <h3>⑤ 같은 훅을 두 번</h3>
      <div className="output">
        커피 {coffee.count} 잔 / 케이크 {cake.count} 조각
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleCoffee}>커피 담기</button>
        <button onClick={handleCake}>케이크 담기</button>
      </div>
    </div>
  );
}

// 화면(누르면): [커피 담기] 를 세 번 → "커피 3 잔 / 케이크 0 조각"
//
// 값을 정말로 함께 쓰고 싶다면 방법이 따로 있습니다.
//   - 07단원의 state 끌어올리기 (공통 부모에 두고 props 로 내려보내기)
//   - 12단원의 Context
// 커스텀 훅은 그 용도가 아닙니다.

// ✏️ 직접 해보기 5 — TwoCounters 에 세 번째 카운터(삼각김밥)를 추가해 보세요.
//                    한 줄이면 됩니다.

// ── 섹션 6: 훅 안에서 다른 훅도 마음껏 씁니다 ──

// 커스텀 훅 안에서는 useState 뿐 아니라 useEffect, useRef 도 부를 수 있습니다.
// 커스텀 훅을 또 부를 수도 있습니다.
//
// 개념02에서 만든 타이머를 통째로 훅으로 묶어 봅니다.
// state 하나, ref 하나, 정리 함수까지 다 들어갑니다.

function useTimer(interval = 250) {
  const [sec, setSec] = useState(0);
  const timerRef = useRef(null);

  function start() {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(() => {
      setSec((prev) => prev + 1);
    }, interval);
    console.log("useTimer: 시작");
    // 콘솔: useTimer: 시작
  }

  function stop() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    console.log("useTimer: 멈춤");
    // 콘솔: useTimer: 멈춤
  }

  function reset() {
    setSec(0);
    console.log("useTimer: 0 으로");
    // 콘솔: useTimer: 0 으로
  }

  // 09단원의 정리 함수. 이 훅을 쓰는 컴포넌트가 사라지면 타이머도 치웁니다.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return { sec, start, stop, reset };
}

function StopWatch() {
  const timer = useTimer(250);

  return (
    <div className="demo">
      <h3>⑥ useTimer 로 만든 스톱워치</h3>
      <div className="output">{timer.sec} 칸</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={timer.start}>시작</button>
        <button onClick={timer.stop}>멈춤</button>
        <button onClick={timer.reset}>0 으로</button>
      </div>
    </div>
  );
}

// 화면(누르면): [시작] 을 누르면 숫자가 0.25초마다 1씩 올라갑니다.
//
// StopWatch 컴포넌트에는 setInterval 도 clearInterval 도 useRef 도 없습니다.
// 타이머를 다루는 지식이 전부 useTimer 안으로 들어갔습니다.
// 다른 화면에서 스톱워치가 또 필요하면 useTimer 한 줄만 부르면 됩니다.
//
// 이것이 커스텀 훅을 만드는 진짜 이유입니다.
// 줄 수를 줄이는 것보다 "이 컴포넌트가 무엇을 하는지" 가 잘 보이는 것이 더 큽니다.

// ✏️ 직접 해보기 6 — StopWatch 에서 useTimer(250) 을 useTimer(1000) 으로 바꾸고
//                    숫자가 올라가는 속도가 어떻게 달라지는지 보세요.

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 커스텀 훅을 이벤트 핸들러 안에서 부름
//
//   function handleClick() {
//     const coffee = useCounter();     // ← 여기서 터집니다
//   }
//
// 실수: Invalid hook call. Hooks can only be called inside of the body of a function component.
//       훅은 컴포넌트나 다른 훅의 '본문' 에서만 부릅니다.
//       버튼을 눌렀을 때가 아니라, 컴포넌트 맨 위에서 부르세요.
//       자세한 이유는 개념04에서 봅니다.

// [실수 2] 이름을 use 로 시작하지 않음
//
//   function counterLogic() {
//     const [count, setCount] = useState(0);
//     return { count };
//   }
//
// 실수: 에러는 안 납니다. 잘 돌아갑니다.
//       그런데 규칙을 어겨도 아무도 안 알려 줍니다. 섹션 3의 [이유 1] 입니다.
//       그리고 읽는 사람이 훅인 줄 몰라서 조건문 안에서 부르게 됩니다.

// [실수 3] 훅이 값을 공유한다고 생각함
//
//   const a = useCounter();
//   const b = useCounter();
//   a.increase();   // b.count 는 안 움직입니다
//
// 실수: 에러는 안 납니다. "왜 저쪽 숫자가 안 바뀌지?" 하고 한참 헤맵니다.
//       섹션 5에서 본 그대로입니다. 값을 함께 쓰려면 07단원 state 끌어올리기입니다.

// [실수 4] 훅을 안 부르는 함수에 use 를 붙임
//
//   function useTotalPrice(items) {
//     return items.reduce((sum, i) => sum + i.price, 0);
//   }
//
// 실수: 에러는 안 납니다. 대신 검사 도구가 이 함수를 훅으로 보고
//       "훅을 조건문 안에서 부르지 말라" 같은 경고를 엉뚱하게 냅니다.
//       훅을 안 부르면 use 를 떼세요. 그냥 함수입니다.

// [실수 5] 돌려주는 것을 빼먹음
//
//   function useCounter() {
//     const [count, setCount] = useState(0);
//     function increase() { setCount(count + 1); }
//     // return 이 없습니다
//   }
//
// 실수: TypeError: Cannot read properties of undefined (reading 'count')
//       return 이 없는 함수는 undefined 를 돌려줍니다.
//       쓰는 쪽에서 coffee.count 를 읽는 순간 터집니다.

// [실수 6] return 의 중괄호를 빼먹음
//
//   return count, increase;
//
// 실수: 에러가 안 납니다. 쉼표 연산자로 읽혀 increase 함수 하나만 돌아갑니다.
//       쓰는 쪽에서 coffee.count 를 읽으면 undefined 가 나옵니다.
//       객체로 돌려주려면 중괄호가 필요합니다.  return { count, increase };

// [실수 7] 함수의 중괄호를 안 닫음 — 눈으로만
//
//   function useCounter() {
//     const [count, setCount] = useState(0);
//     return { count };
//   // ← 여기 } 를 빼먹었습니다
//
// 실수: [SyntaxError] 커스텀 훅을 만들다 보면 중괄호가 겹쳐서 자주 나는 실수입니다.
//       파일 전체가 안 돌아가고 화면이 통째로 빕니다.
//       에디터에서 여는 중괄호에 커서를 올리면 짝이 되는 중괄호가 표시됩니다.

export default function Concept03CustomHook() {
  return (
    <div>
      <h1>개념 03 — 커스텀 훅</h1>

      <p className="guide">
        커스텀 훅은 <strong>새 문법이 아닙니다.</strong> 훅을 부르는 코드를
        함수로 묶은 것입니다.
        <br />
        섹션 1과 섹션 2의 화면은 똑같습니다. <strong>코드만</strong> 비교해서
        보세요.
      </p>

      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <OrderForm />
      <TwoCounters />
      <StopWatch />

      <Summary
        items={[
          "커스텀 훅은 훅을 부르는 코드를 묶은 그냥 함수입니다. 새로운 문법이 없습니다.",
          "이름은 use 로 시작합니다. 그래야 검사 도구와 사람이 훅인 줄 압니다.",
          "훅을 하나도 안 부르는 함수에는 use 를 붙이지 않습니다.",
          "커스텀 훅 안에서 useState·useRef·useEffect 를 자유롭게 부를 수 있습니다.",
          "커스텀 훅은 코드를 공유합니다. 값은 공유하지 않습니다. 부를 때마다 새 state 가 생깁니다.",
          "묶으면 컴포넌트에 화면 설명만 남습니다. 줄 수보다 '무엇을 하는지 잘 보인다' 는 것이 더 큰 이득입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 두 줄입니다.
//    아메리카노 {count} 잔  /  케이크 {count} 조각
//    → 화면 글자 한 줄과 함수 이름(컴포넌트 이름)뿐입니다.
//      나머지 열 줄 넘게가 완전히 같습니다.
//
// 2) function decrease() {
//      setCount((prev) => (prev > 0 ? prev - 1 : 0));
//    }
//    화면(누르면): 0 에서 [빼기] 를 눌러도 0 그대로입니다.
//    → 고친 곳은 useCounter 한 군데인데 커피와 케이크 둘 다 고쳐졌습니다.
//      이것이 묶어 둔 이득입니다.
//
// 3) (나) 입니다.
//    → (나)는 안에서 useState 를 씁니다. 그래서 훅입니다. useWindowSize 처럼 짓습니다.
//      (가)와 (다)는 값을 받아 계산만 합니다. 훅이 아니라 그냥 함수입니다.
//
// 4) function useInput(initialValue = "") {
//      const [value, setValue] = useState(initialValue);
//      function onChange(e) { setValue(e.target.value); }
//      function clear() { setValue(""); }
//      return { value, onChange, clear, length: value.length };
//    }
//    쓰는 쪽: 이름 <input ... /> <span>{name.length} 자</span>
//    화면: 이름 칸에 "김민준" 이 들어 있으면 옆에 3 자 가 보입니다.
//
// 5) const rice = useCounter(0);
//    화면 줄에 " / 삼각김밥 {rice.count} 개" 를 더하고
//    버튼 <button onClick={rice.increase}>삼각김밥 담기</button> 를 추가합니다.
//    → 훅 한 줄이면 완전히 따로 노는 카운터가 하나 더 생깁니다.
//
// 6) 숫자가 1초에 한 칸씩 올라갑니다. 네 배 느려집니다.
//    → interval 을 매개변수로 받아 두었기 때문에 훅 안을 고칠 필요가 없습니다.
//      커스텀 훅에 매개변수를 두면 이렇게 쓰는 쪽에서 조절할 수 있습니다.
