// ============================================================
// 10단원 · 개념 05 — memo 와 useMemo
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 이 파일에서 배울 도구는 셋입니다.
//
//   useMemo      무거운 계산 결과를 기억해 두고 다시 안 합니다
//   memo         props 가 그대로면 자식 컴포넌트를 다시 안 그립니다
//   useCallback  함수를 매번 새로 만들지 않고 그대로 씁니다
//
// 그런데 이 파일에서 가장 중요한 문장은 도구 설명이 아닙니다.
//
//     ★ 먼저 쓰지 마세요. ★
//
// 이 문장을 먼저 읽고 아래로 내려가세요. 섹션 1이 그 이야기입니다.

import { useState, useMemo, useCallback, memo } from "react";
import Summary from "../_ui/Summary.jsx";

// 이 파일에서 계속 쓸 장바구니입니다.
const cart = [
  { name: "아메리카노", price: 4000, count: 2 },
  { name: "라떼", price: 4500, count: 1 },
  { name: "케이크", price: 6000, count: 1 },
  { name: "삼각김밥", price: 1200, count: 3 },
];

// 일부러 느리게 만든 합계 계산입니다.
// 같은 계산을 repeat 번 반복해서 시간을 끕니다. 실제 코드에는 이런 함수가 없습니다.
// 진짜 느린 계산(큰 목록 정렬, 수만 줄 걸러내기)을 흉내 내려고 만든 것입니다.
function slowTotal(items, repeat) {
  let total = 0;
  for (let r = 0; r < repeat; r++) {
    total = 0;
    for (const item of items) {
      total = total + item.price * item.count;
    }
  }
  return total;
}

const HEAVY = 5000000; // 반복 횟수. 컴퓨터에 따라 40~120ms 쯤 걸립니다.

// ── 섹션 1: 먼저 쓰지 마세요 ──

// 이 도구들을 배우면 "그럼 전부 붙여 두면 더 빠르겠네" 라고 생각하기 쉽습니다.
// 그러면 대개 더 느려지고, 코드는 확실히 어려워집니다. 이유가 셋입니다.
//
// [이유 1] 공짜가 아닙니다
//   useMemo 는 "의존성이 바뀌었나" 를 매번 비교합니다.
//   memo 는 "props 가 다 같은가" 를 매번 비교합니다.
//   비교하는 데도 시간이 듭니다. 아낀 시간보다 비교하는 시간이 더 클 수 있습니다.
//   더하기 몇 번 하는 계산에 useMemo 를 붙이면 손해입니다.
//
// [이유 2] 기억해 두려면 자리를 차지합니다
//   계산 결과와 의존성을 계속 들고 있어야 합니다. 메모리를 씁니다.
//
// [이유 3] 코드가 어려워집니다
//   의존성 배열이 늘어납니다. 하나 빠뜨리면 옛날 값이 화면에 남습니다.
//   에러가 안 나는 종류라 찾기 어렵습니다. 섹션 7에서 실제로 봅니다.
//
// 그래서 순서는 언제나 이렇습니다.
//
//   1) 먼저 그냥 만든다
//   2) 느리다고 느껴지면 어디가 느린지 잰다
//   3) 잰 결과가 가리키는 그 자리만 고친다
//   4) 고친 뒤 다시 재서 정말 빨라졌는지 확인한다
//
// 2번을 건너뛰고 3번부터 하는 것을 '넘겨짚기' 라고 합니다.
// 대부분의 화면은 이 도구들 없이도 충분히 빠릅니다.
// React 는 화면 전체를 다시 그리는 것처럼 보여도, 실제로 손대는 것은 바뀐 부분뿐입니다.
// 01단원에서 본 그대로입니다.

function IntroBox() {
  return (
    <div className="demo">
      <h3>① 순서를 기억하세요</h3>
      <div className="output">
        <div>1. 그냥 만든다</div>
        <div>2. 느리면 잰다</div>
        <div>3. 잰 자리만 고친다</div>
        <div>4. 다시 재서 확인한다</div>
      </div>
      <p>이 파일의 도구들은 3번에서만 씁니다.</p>
    </div>
  );
}

// ✏️ 직접 해보기 1 — 위 네 단계 중 사람들이 가장 자주 건너뛰는 단계는 몇 번일까요?

// ── 섹션 2: 재는 법 ──

// 재는 방법은 여러 가지인데, 코드로 재는 가장 쉬운 두 가지를 봅니다.
//
// [방법 1] performance.now()
//   지금 시각을 밀리초로 돌려줍니다. 앞뒤로 찍어 빼면 걸린 시간입니다.
//
// [방법 2] console.time / console.timeEnd
//   같은 이름으로 짝을 맞추면 걸린 시간을 콘솔이 직접 찍어 줍니다.
//
// 화면이 얼마나 자주, 얼마나 오래 그려지는지를 제대로 보려면
// React DevTools 의 Profiler 탭을 씁니다. 01단원 개념04에서 설치를 안내했습니다.
// 여기서는 코드로 재는 것까지만 합니다.

function MeasureDemo() {
  const [result, setResult] = useState("아직 안 쟀습니다");

  function handleMeasure() {
    const start = performance.now();
    const total = slowTotal(cart, HEAVY);
    const ms = Math.round(performance.now() - start);

    console.log(`장바구니 합계는 ${total} 원입니다`);
    // 콘솔: 장바구니 합계는 22100 원입니다

    console.log(`계산에 걸린 시간:`, ms, "ms");
    // 콘솔: 계산에 걸린 시간:
    // 뒤의 숫자는 컴퓨터마다 다릅니다. 40~120 사이면 정상입니다.

    setResult(`${total} 원 · ${ms}ms`);
  }

  function handleConsoleTime() {
    // console.time 과 console.timeEnd 는 이름을 똑같이 맞춰야 짝이 됩니다.
    console.time("합계 계산");
    slowTotal(cart, HEAVY);
    console.timeEnd("합계 계산");
    // 콘솔에 "합계 계산: 52.3ms" 같은 줄이 나옵니다. 숫자는 컴퓨터마다 다릅니다.

    setResult("console.timeEnd 로 쟀습니다. 콘솔을 보세요");
  }

  return (
    <div className="demo">
      <h3>② 재 보기</h3>
      <div className="output">{result}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={handleMeasure}>performance.now 로 재기</button>
        <button onClick={handleConsoleTime}>console.time 으로 재기</button>
      </div>
    </div>
  );
}

// 40~120ms 는 사람이 느낄 수 있는 시간입니다.
// 화면을 그릴 때마다 이만큼 걸린다면 버튼이 굼떠 보입니다.
// 이 정도가 되어야 비로소 useMemo 를 꺼낼 자리입니다.

// ✏️ 직접 해보기 2 — HEAVY 를 5000000 에서 500000 으로 (0 하나 뺍니다) 바꾸고
//                    다시 재 보세요. 몇 ms 가 나오나요?

// ── 섹션 3: useMemo — 무거운 계산 건너뛰기 ──

// 문제 상황부터 봅니다.
//
// 컴포넌트는 다시 그릴 때마다 함수 본문을 처음부터 다시 실행합니다(04단원 개념03).
// 본문 안에 무거운 계산이 있으면 그 계산도 매번 다시 합니다.
// 계산에 쓰이는 값이 하나도 안 바뀌었는데도 그렇습니다.
//
// useMemo 는 이렇게 씁니다.
//
//     const 결과 = useMemo(() => 무거운계산(), [바뀌면 다시 할 값들]);
//
// 의존성 배열은 09단원 useEffect 에서 배운 것과 같은 규칙입니다.
//     []        한 번만 계산합니다
//     [cart]    cart 가 바뀌면 다시 계산합니다
//     (없음)    매번 계산합니다 — 그러면 useMemo 를 쓸 이유가 없습니다
//
// 아래 데모는 같은 화면에서 두 방식을 나란히 돌립니다.

function MemoCompare() {
  const [tick, setTick] = useState(0);

  // (1) useMemo 없이 — 다시 그릴 때마다 계산합니다
  const start = performance.now();
  const totalPlain = slowTotal(cart, HEAVY);
  const plainMs = Math.round(performance.now() - start);
  console.log(`useMemo 없이 계산했습니다`, plainMs, "ms");
  // 콘솔: useMemo 없이 계산했습니다

  // (2) useMemo 로 — cart 가 안 바뀌면 계산을 건너뜁니다
  const totalMemo = useMemo(() => {
    //useMemo의 진짜 목적은 "무조건 처음 한 번만 계산"이 아니라, "비싼 계산의 결과를 재사용해서 불필요한 재계산을 막는 것"**이야.
    const s = performance.now();
    const value = slowTotal(cart, HEAVY);
    console.log(
      `useMemo 안에서 계산했습니다`,
      Math.round(performance.now() - s),
      "ms",
    );
    // 콘솔: useMemo 안에서 계산했습니다
    return value;
  }, []); // cart 는 이 파일에서 바뀌지 않으므로 빈 배열입니다

  return (
    <div className="demo">
      <h3>③ useMemo 있고 없고</h3>
      <div className="output">
        <div>
          useMemo 없이: {totalPlain} 원 (이번 렌더에서 {plainMs}ms 걸림)
        </div>
        <div>useMemo 로: {totalMemo} 원(이번 렌더에서 )</div>
        <div>버튼 누른 횟수: {tick}</div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setTick(tick + 1)}>이 값만 올리기</button>
      </div>
    </div>
  );
}

// [이 값만 올리기] 를 여러 번 눌러 보세요. 콘솔을 함께 보셔야 합니다.
//
// 화면(누르면): 숫자가 올라갑니다. 그런데 버튼 반응이 살짝 굼뜹니다.
// 콘솔에는 "useMemo 없이 계산했습니다" 만 계속 찍힙니다.
// "useMemo 안에서 계산했습니다" 는 처음 한 번 나오고 다시 안 나옵니다.
//
// 눌러도 장바구니는 하나도 안 바뀌었습니다. 그런데 위쪽은 매번 다시 계산했습니다.
// 아래쪽은 "cart 가 그대로니 지난번 답을 그냥 쓰자" 하고 넘어갔습니다.
// 그것이 useMemo 입니다.
//
// 개발 중에는 StrictMode 때문에 "useMemo 없이 계산했습니다" 가 두 번씩 찍힙니다.
// 정상입니다. 09단원에서 본 그 이유와 같습니다.
//
// 여기서 놓치면 안 되는 것이 있습니다.
// useMemo 는 계산을 '더 빠르게' 만들지 않습니다. '덜 하게' 만들 뿐입니다.
// 처음 한 번은 똑같이 오래 걸립니다.

// ✏️ 직접 해보기 3 — useMemo 의 의존성 배열 [] 을 지워 보세요.
//                    (useMemo(() => {...}) 로 만듭니다)
//                    [이 값만 올리기] 를 눌렀을 때 콘솔이 어떻게 달라지나요?

// ── 섹션 4: memo — props 가 그대로면 자식을 다시 안 그린다 ──

// 부모가 다시 그려지면 자식도 전부 다시 그려집니다. 기본 동작입니다.
// 자식이 받는 props 가 하나도 안 바뀌었어도 그렇습니다.
//
// memo 로 감싸면 React 가 이렇게 바꿉니다.
//   "이 컴포넌트는 props 를 먼저 비교해라. 다 같으면 지난번 화면을 그대로 써라."
//
// 쓰는 법은 컴포넌트를 memo(...) 로 감싸는 것뿐입니다.

const MemoCard = memo(function MemoCard({ name, price }) {
  console.log(`MemoCard 를 그렸습니다: ${name}`); //지금name 아니라 틱으로 값이 갱신되니 새로 그려짐
  // 콘솔: MemoCard 를 그렸습니다: 아메리카노

  return (
    <div className="output">
      [memo 붙임] {name} — {price} 원
    </div>
  );
});

function PlainCard({ name, price }) {
  console.log(`PlainCard 를 그렸습니다: ${name}`);
  // 콘솔: PlainCard 를 그렸습니다: 라떼

  return (
    <div className="output">
      [memo 안 붙임] {name} — {price} 원
    </div>
  );
}

function MemoSection() {
  const [tick, setTick] = useState(0);

  console.log("부모(MemoSection)를 그렸습니다");
  // 콘솔: 부모(MemoSection)를 그렸습니다

  return (
    <div className="demo">
      <h3>④ memo 있고 없고</h3>
      <MemoCard name="아메리카노" price={tick} />
      <PlainCard name="라떼" price={4500} />
      <div className="output">부모의 숫자: {tick}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setTick(tick + 1)}>부모만 다시 그리기</button>
      </div>
    </div>
  );
}

// [부모만 다시 그리기] 를 눌러 보세요.
//
// 콘솔에 찍히는 것:
//   부모(MemoSection)를 그렸습니다
//   PlainCard 를 그렸습니다: 라떼
//
// MemoCard 는 안 찍힙니다. props(name, price)가 지난번과 같기 때문입니다.
//
// 화면(누르면): 두 카드의 글자는 그대로이고 "부모의 숫자" 만 올라갑니다.
//
// 여기서 오해하기 쉬운 점 하나.
// PlainCard 가 다시 그려졌다고 해서 화면이 실제로 다시 칠해진 것은 아닙니다.
// React 는 다시 그려 본 뒤 "결과가 같네" 하고 실제 화면은 안 건드립니다.
// 그래서 memo 를 안 붙여도 눈에 보이는 문제는 대개 없습니다.
// memo 가 아끼는 것은 '컴포넌트 함수를 실행하는 시간' 입니다.
// 그 함수가 무겁지 않으면 아낄 것도 별로 없습니다.

// ✏️ 직접 해보기 4 — MemoCard 에 price={tick} 을 넘기도록 바꾸고
//                    [부모만 다시 그리기] 를 눌러 보세요. 콘솔이 어떻게 달라지나요?

// ── 섹션 5: useCallback — memo 를 무력하게 만드는 함정 ──

// memo 를 붙였는데도 자식이 계속 다시 그려지는 일이 있습니다.
// 열에 아홉은 함수를 props 로 넘기고 있기 때문입니다.
//
// 컴포넌트를 다시 그릴 때 본문의 함수도 '새로' 만들어집니다.
// 함수도 객체입니다(JS자료 07단원). 객체는 모양이 같아도 새로 만들면 다른 것입니다.
//
//     console.log({ a: 1 } === { a: 1 });
//     // false — 안이 같아도 서로 다른 객체입니다
//     console.log(function () {} === function () {});
//     // false — 함수도 마찬가지입니다
//
// memo 는 props 를 === 로 비교합니다.
// 그러니 함수 props 는 매번 "달라졌다" 로 판정되고, memo 는 아무 일도 못 합니다.
//
// useCallback 이 이 문제를 풉니다.
//
//     const 함수 = useCallback(() => { ... }, [바뀌면 새로 만들 값들]);
//
// 의존성이 그대로면 지난번에 만든 그 함수를 다시 씁니다.

const ActionButton = memo(function ActionButton({ label, onPress }) {
  console.log(`ActionButton 을 그렸습니다: ${label}`);
  // 콘솔: ActionButton 을 그렸습니다: 매번 새 함수
  // 콘솔: ActionButton 을 그렸습니다: useCallback 함수

  return <button onClick={onPress}>{label} 담기</button>;
});

function CallbackSection() {
  const [tick, setTick] = useState(0);

  // (1) 다시 그릴 때마다 새로 만들어지는 함수
  const unstablePress = () => {
    console.log("매번 새 함수 쪽 버튼을 눌렀습니다");
    // 콘솔: 매번 새 함수 쪽 버튼을 눌렀습니다
  };

  // (2) 언제나 같은 함수
  const stablePress = useCallback(() => {
    console.log("useCallback 쪽 버튼을 눌렀습니다"); //왜냐하면 useCallback의 주요 목적은:
    //함수를 다른 곳에 전달할 때 같은 함수 참조를 유지하는 것
    // 콘솔: useCallback 쪽 버튼을 눌렀습니다
  }, []);

  return (
    <div className="demo">
      <h3>⑤ useCallback 있고 없고</h3>
      <div>
        <ActionButton label="매번 새 함수" onPress={unstablePress} />
      </div>
      <div style={{ marginTop: 6 }}>
        <ActionButton label="useCallback 함수" onPress={stablePress} />
      </div>
      <div className="output" style={{ marginTop: 8 }}>
        부모의 숫자: {tick}
      </div>
      <button onClick={() => setTick(tick + 1)}>부모만 다시 그리기</button>
    </div>
  );
}

// [부모만 다시 그리기] 를 눌러 보세요.
//
// 콘솔에 "ActionButton 을 그렸습니다: 매번 새 함수" 만 찍힙니다.
// "useCallback 함수" 쪽은 안 찍힙니다.
//
// 두 자식 모두 memo 를 붙였습니다. 그런데 결과가 다릅니다.
// 위쪽은 onPress 가 매번 새 함수라서 memo 가 "달라졌다" 고 판단한 것입니다.
//
// 그래서 이 셋의 관계는 이렇습니다.
//   memo 를 안 붙였으면 useCallback 은 대개 쓸모가 없습니다.
//   useCallback 은 memo 와 짝으로 쓰는 도구라고 생각하면 편합니다.
//
// useMemo 와 useCallback 의 차이도 한 줄로 정리됩니다.
//   useMemo(() => 값, [])       계산한 '값' 을 기억합니다
//   useCallback(() => {}, [])   '함수 자체' 를 기억합니다
// 사실 useCallback(fn, deps) 는 useMemo(() => fn, deps) 와 같습니다.
// 함수를 기억하는 일이 워낙 잦아서 짧은 이름을 따로 만든 것입니다.

// ✏️ 직접 해보기 5 — unstablePress 를 useCallback 으로 감싸 보세요.
//                    [부모만 다시 그리기] 를 눌렀을 때 콘솔이 어떻게 달라지나요?

// ── 섹션 6: 언제 쓰고 언제 안 쓰나 ──

// 판단 기준을 정리합니다.
//
//   [useMemo 를 쓸 자리]
//     - 재 봤더니 수십 ms 이상 걸리는 계산이 렌더마다 돈다
//     - 예: 수천 개짜리 목록 정렬, 큰 목록 걸러내기, 무거운 변환
//
//   [useMemo 를 안 써도 되는 자리]
//     - 더하기, 곱하기, 짧은 배열의 map/filter
//     - 열 개짜리 장바구니 합계 — 이건 그냥 계산하세요
//
//   [memo 를 쓸 자리]
//     - 자식이 무거운데 부모가 자주 다시 그려진다
//     - 예: 큰 목록을 그리는 컴포넌트, 차트
//
//   [memo 를 안 써도 되는 자리]
//     - 자식이 글자 몇 줄짜리다
//     - 어차피 props 가 매번 바뀐다 (비교만 하고 어차피 다시 그립니다. 손해입니다)
//
//   [useCallback 을 쓸 자리]
//     - memo 붙은 자식에게 함수를 넘길 때
//     - useEffect 의 의존성에 함수가 들어갈 때 (09단원)
//
// 그리고 성능 문제라고 생각한 것이 사실은 설계 문제인 경우가 많습니다.
// 아래를 먼저 확인하세요. 이쪽이 훨씬 효과가 큽니다.
//   - state 를 필요한 곳보다 위에 두지 않았나 (07단원 개념05)
//   - 계산할 수 있는 값을 state 로 또 들고 있지 않나 (파생 state)
//   - 목록에 key 를 제대로 줬나 (05단원 개념03)
//
// 마지막으로 한마디. React 팀은 이런 손질을 자동으로 해 주는 도구를 만들고 있습니다.
// 언젠가는 이 세 도구를 손으로 붙일 일이 줄어들 것입니다.
// 그래도 '왜 다시 그려지는가' 를 아는 것은 계속 필요합니다.

function ChecklistBox() {
  const [checked, setChecked] = useState(false);

  function handleCheck() {
    setChecked((prev) => !prev);
    console.log("확인 목록을 열고 닫았습니다");
    // 콘솔: 확인 목록을 열고 닫았습니다
  }

  return (
    <div className="demo">
      <h3>⑥ 손대기 전에 확인할 것</h3>
      <button onClick={handleCheck}>{checked ? "접기" : "펼치기"}</button>
      {checked && (
        <div className="output" style={{ marginTop: 8 }}>
          <div>· 정말 느린지 재 봤나요?</div>
          <div>· state 를 너무 위에 두지 않았나요?</div>
          <div>· 계산할 수 있는 값을 state 로 또 들고 있지 않나요?</div>
          <div>· 목록에 key 를 제대로 줬나요?</div>
        </div>
      )}
    </div>
  );
}

// ✏️ 직접 해보기 6 — 아래 두 경우 중 useMemo 가 필요한 쪽을 고르세요.
//                    (가) 장바구니 4개의 합계를 더하는 계산
//                    (나) 사용자 5000명을 이름순으로 정렬하는 계산

// ── 섹션 7: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 재 보지도 않고 전부에 붙이기
//
//   const name = useMemo(() => user.firstName + user.lastName, [user]);
//
// 실수: 에러는 안 납니다. 그런데 문자열 더하기보다 useMemo 쪽이 더 비쌉니다.
//       코드만 길어지고 느려집니다. 이 파일에서 가장 흔한 실수입니다.

// [실수 2] 의존성을 빠뜨리기
//
//   const total = useMemo(() => slowTotal(items, HEAVY), []);
//
// 실수: 에러가 안 납니다. 그런데 items 가 바뀌어도 합계가 안 바뀝니다.
//       화면에 옛날 합계가 계속 남습니다. 조용히 틀리는 종류입니다.
//       계산 안에서 쓰는 값은 전부 의존성 배열에 넣으세요.
//       09단원 useEffect 의 의존성과 완전히 같은 규칙입니다.

// [실수 3] memo 를 붙이고 객체나 배열을 그대로 넘기기
//
//   <MemoCard style={{ color: "red" }} items={[1, 2]} />
//
// 실수: 에러는 안 납니다. 그런데 memo 가 전혀 안 먹습니다.
//       { } 와 [ ] 는 쓸 때마다 새 객체를 만듭니다. 함수와 같은 문제입니다.
//       useMemo 로 감싸거나, 컴포넌트 바깥의 상수로 빼세요.

// [실수 4] useMemo 안에서 화면 밖 일을 하기
//
//   useMemo(() => { fetch(url); }, [url]);
//
// 실수: useMemo 는 '값을 만드는' 자리입니다. 언제 몇 번 실행될지 보장하지 않습니다.
//       서버에서 받아오기, 타이머 걸기 같은 일은 useEffect 입니다(09단원).

// [실수 5] memo 를 컴포넌트 안에서 만들기
//
//   function Parent() {
//     const Card = memo(function Card() { ... });   // ← 매번 새로 만들어집니다
//     return <Card />;
//   }
//
// 실수: 에러는 안 납니다. 그런데 다시 그릴 때마다 새 컴포넌트가 되어
//       memo 가 무의미해지고, 자식의 state 도 매번 초기화됩니다.
//       memo(...) 는 파일 맨 바깥에서 한 번만 만드세요.

// [실수 6] useMemo 에 함수가 아니라 값을 바로 넘기기
//
//   const total = useMemo(slowTotal(cart, HEAVY), []);
//
// 실수: TypeError: nextCreate is not a function
//       useMemo 는 '함수' 를 받아 두었다가 필요할 때 자기가 부릅니다.
//       위처럼 쓰면 계산을 먼저 다 해 놓고 그 결과(숫자)를 넘기는 셈입니다.
//       React 가 부르려고 보니 함수가 아니라서 나는 에러입니다.
//       () => 를 빠뜨리지 마세요.  useMemo(() => slowTotal(cart, HEAVY), [])

// [실수 7] memo 의 닫는 괄호를 빠뜨림 — 눈으로만
//
//   const Card = memo(function Card() {
//     return <div>...</div>;
//   }                                    ← memo( 를 닫는 ) 가 없습니다
//
// 실수: [SyntaxError] memo(...) 는 괄호 안에 함수를 통째로 넣는 모양이라
//       닫는 괄호를 빠뜨리기 쉽습니다. 파일 전체가 멈춰서 화면이 통째로 빕니다.
//       에디터에서 여는 괄호에 커서를 올리면 짝이 되는 괄호가 표시됩니다.

export default function Concept05MemoAndUseMemo() {
  return (
    <div>
      <h1>개념 05 — memo 와 useMemo</h1>

      <p className="guide">
        <strong>이 파일의 도구들은 먼저 쓰는 것이 아닙니다.</strong> 느려진
        다음에 재고, 잰 자리만 고칩니다.
        <br />
        F12 → Console 을 열고 각 데모의 버튼을 눌러 콘솔이 어떻게 달라지는지
        보세요.
      </p>

      <IntroBox />
      <MeasureDemo />
      <MemoCompare />
      <MemoSection />
      <CallbackSection />
      <ChecklistBox />

      <Summary
        items={[
          "먼저 쓰지 마세요. 그냥 만들고, 느리면 재고, 잰 자리만 고칩니다.",
          "useMemo(() => 계산, [의존성]) 은 의존성이 그대로면 지난 계산 결과를 다시 씁니다.",
          "memo(컴포넌트) 는 props 가 전부 같으면 자식을 다시 안 그립니다.",
          "함수·객체·배열은 다시 그릴 때마다 새로 만들어져서 memo 를 무력하게 만듭니다.",
          "useCallback 은 그 함수를 그대로 유지합니다. memo 와 짝으로 쓸 때만 뜻이 있습니다.",
          "의존성 배열을 빠뜨리면 에러 없이 옛날 값이 화면에 남습니다. useEffect 와 같은 규칙입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 2번(재기)입니다.
//    → "여기가 느릴 것 같다" 는 짐작은 대개 틀립니다.
//      재 보면 엉뚱한 곳이 느린 경우가 훨씬 많습니다.
//
// 2) 5~10ms 쯤 나옵니다. Math.round 를 쓰고 있으니 5 나 6 처럼 찍힙니다.
//    → 반복이 열 배 줄었으니 시간도 대략 열 배 줄어듭니다(70ms → 7ms).
//      이 정도면 사람이 거의 못 느낍니다. useMemo 를 붙일 자리가 아닙니다.
//      확인했으면 HEAVY 를 5000000 으로 되돌리세요.
//
// 3) 두 줄이 다 찍힙니다.
//    // 콘솔에 "useMemo 없이 계산했습니다" 와 "useMemo 안에서 계산했습니다" 가 같이 나옵니다.
//    → 의존성 배열이 없으면 매번 다시 계산합니다. useEffect 와 같은 규칙입니다.
//      이러면 useMemo 를 쓴 의미가 없고, 비교하는 비용만 더 듭니다.
//      확인했으면 [] 를 다시 넣으세요.
//
// 4) MemoCard 도 매번 다시 그려집니다.
//    // 콘솔에 "MemoCard 를 그렸습니다: 아메리카노" 가 누를 때마다 나옵니다.
//    → price 가 매번 달라지니 memo 가 "props 가 바뀌었다" 고 판단합니다.
//      props 가 어차피 매번 바뀌면 memo 는 비교만 하고 손해를 봅니다.
//
// 5) 두 자식 모두 다시 안 그려집니다.
//    // 콘솔에 ActionButton 줄이 하나도 안 나옵니다. 부모 줄만 나옵니다.
//    → const unstablePress = useCallback(() => { ... }, []); 로 감싸면 됩니다.
//
// 6) (나) 입니다.
//    → 5000명 정렬은 수십 ms 가 걸릴 수 있습니다. 재 보고 필요하면 useMemo 를 씁니다.
//      (가) 는 더하기 네 번입니다. 0.001ms 도 안 걸립니다. 그냥 계산하세요.
