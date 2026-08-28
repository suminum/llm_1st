// ============================================================
// 07단원 · 개념 02 — useState 와 타입
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run typecheck
// ============================================================
//
// 06단원 개념03 섹션5에서 useState 를 미리 흉내 내 봤습니다.
//
//     function fakeUseState<T>(initial: T): [T, (next: T) => void]
//
// 진짜 useState 도 이 모양입니다. 제네릭 함수이고 튜플을 돌려줍니다.
// 그래서 대부분은 아무것도 안 적어도 됩니다.

import { useState } from "react";
import Summary from "../_ui/Summary.tsx";

// ── 섹션 1: 대개는 안 적어도 된다 ──

function Counter() {
  // 0 을 보고 number 로 정해집니다. useState<number> 라고 적을 필요가 없습니다.
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      눌린 횟수: {count}
    </button>
  );
}

// 정해지고 나면 검사가 살아 있습니다.
//
// 에러: TS2345 Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'.
// function CounterWrong() {
//   const [count, setCount] = useState(0);
//   return <button onClick={() => setCount("다섯")}>{count}</button>;
// }
//
// 실수: 처음에 0 을 넣었으니 숫자 상자입니다.
//       SetStateAction<number> 는 "number 이거나, number 를 돌려주는 함수" 라는 뜻입니다.
//       setCount(count + 1) 도 되고 setCount((c) => c + 1) 도 되기 때문에 이런 이름입니다.

// ✏️ 직접 해보기 1 — Counter 를 useState("0") 으로 바꾸고
//    setCount(count + 1) 이 어떻게 되는지 확인해 보세요.


// ── 섹션 2: 적어야 하는 경우 ①  null 로 시작할 때 ──

type Menu = { name: string; price: number };

function Selected() {
  // null 만 보고는 "나중에 Menu 가 들어올 것" 을 알 수가 없습니다.
  // 02단원 개념02 섹션5의 "초기값이 없으면 적는다" 와 같은 상황입니다.
  const [selected, setSelected] = useState<Menu | null>(null);

  return (
    <div>
      <button type="button" onClick={() => setSelected({ name: "라떼", price: 4500 })}>
        라떼 고르기
      </button>{" "}
      <button type="button" onClick={() => setSelected(null)}>
        취소
      </button>
      {/* selected 는 Menu | null 이라 그냥 못 씁니다. 05단원 개념03 그대로입니다 */}
      <p>고른 것: {selected?.name ?? "없음"}</p>
    </div>
  );
}

// 안 적으면 이렇게 됩니다.
//
// 에러: TS2353 Object literal may only specify known properties, and 'name' does not exist in type '(prevState: null) => null'.
// function SelectedWrong() {
//   const [selected, setSelected] = useState(null);
//   return <button onClick={() => setSelected({ name: "라떼", price: 4500 })}>고르기</button>;
// }
//
// 실수: null 만 보고 "이 상자에는 null 만 들어간다" 고 정해 버린 것입니다.
//       null 로 시작하는 useState 는 거의 항상 <T | null> 을 적어야 합니다.
//
//       메시지에 (prevState: null) => null 이라는 낯선 것이 나오는데 놀라지 마세요.
//       setState 는 '값' 도 받고 '이전 값을 받아 새 값을 돌려주는 함수' 도 받습니다.
//       값 쪽이 안 맞으니 함수 쪽으로도 맞춰 보다가 낸 말입니다.
//       핵심은 하나입니다 — 상자가 null 전용으로 잡혔다.

// ✏️ 직접 해보기 2 — Selected 의 selected?.name 에서 ?. 를 . 로 바꿔 보세요.
//    무슨 에러가 나나요? 확인한 뒤 되돌리세요.


// ── 섹션 3: 적어야 하는 경우 ②  빈 배열로 시작할 때 ──

function Cart() {
  // [] 만 보고는 무엇이 들어올 배열인지 알 수 없습니다.
  const [items, setItems] = useState<Menu[]>([]);

  function add() {
    // React자료 07단원에서 배운 불변 갱신 그대로입니다.
    setItems([...items, { name: "아메리카노", price: 4000 }]);
  }

  const total = items.reduce((sum, m) => sum + m.price, 0);

  return (
    <div>
      <button type="button" onClick={add}>
        담기
      </button>{" "}
      <button type="button" onClick={() => setItems([])}>
        비우기
      </button>
      <p>
        {items.length}개 / 합계 {total}원
      </p>
      <ul>
        {items.map((m, i) => (
          <li key={i}>{m.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 안 적으면 never[] 가 됩니다. 이게 초보자를 가장 많이 괴롭히는 에러입니다.
//
// 에러: TS2322 Type '{ name: string; price: number; }' is not assignable to type 'never'.
// function CartWrong() {
//   const [items, setItems] = useState([]);
//   return <button onClick={() => setItems([{ name: "라떼", price: 4500 }])}>담기</button>;
// }
//
// 실수: never 는 "값이 있을 수 없는 타입" 입니다(05단원 개념04 섹션4).
//       빈 배열에는 아무것도 없으니 "아무것도 못 들어가는 배열" 로 잡힌 것입니다.
//       메시지에 never 가 보이면 useState([]) 를 의심하세요. 답은 <Menu[]> 입니다.

// ✏️ 직접 해보기 3 — Cart 의 <Menu[]> 를 지우고 저장해 보세요.
//    에러가 몇 개 나나요? 전부 같은 원인인가요?


// ── 섹션 4: 적어야 하는 경우 ③  리터럴 유니온일 때 ──

type Status = "대기" | "조리중" | "완료";
const STATUSES: Status[] = ["대기", "조리중", "완료"];

function StatusPicker() {
  // "대기" 만 보면 string 으로 넓혀 잡습니다. 그러면 "취소" 같은 오타가 안 걸립니다.
  const [status, setStatus] = useState<Status>("대기");

  return (
    <div>
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          className={s === status ? "navBtn on" : "navBtn"}
          style={{ display: "inline-block", width: "auto", marginRight: 6 }}
          onClick={() => setStatus(s)}
        >
          {s}
        </button>
      ))}
      <p>현재 상태: {status}</p>
    </div>
  );
}

// <Status> 를 적어 뒀으니 목록에 없는 값은 막힙니다.
//
// 에러: TS2345 Argument of type '"취소"' is not assignable to parameter of type 'SetStateAction<Status>'.
// function StatusWrong() {
//   const [status, setStatus] = useState<Status>("대기");
//   return <button onClick={() => setStatus("취소")}>{status}</button>;
// }
//
// 실수: 05단원 개념01 섹션3의 리터럴 유니온이 그대로 작동합니다.
//       <Status> 를 안 적었다면 status 가 string 이 되어 이 오타가 통과했을 것입니다.

// ✏️ 직접 해보기 4 — StatusPicker 의 <Status> 를 지우고
//    setStatus("취소") 를 써 보세요. 걸리나요?


// ── 섹션 5: 규칙 한 줄 ──

// 02단원의 그 규칙이 여기서도 그대로입니다.
//
//     초기값만 보고 알 수 있으면 안 적는다.
//     알 수 없으면 적는다.
//
// 실제로 적게 되는 경우는 딱 셋입니다.
//
//     useState<T | null>(null)    나중에 값이 들어올 때
//     useState<T[]>([])           빈 배열로 시작할 때
//     useState<리터럴유니온>(...)  정해진 값만 담을 때
//
// 이 셋만 외우면 useState 에서 막힐 일이 없습니다.

// ✏️ 직접 해보기 5 — 위 세 경우 말고, 타입을 안 적어도 되는 useState 를
//    이 파일에서 찾아보세요. 왜 안 적어도 되나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] useState([]) 로 시작하기
//   never[] 가 됩니다. 07단원에서 가장 많이 나오는 질문입니다.

// [실수 2] useState(null) 로 시작하기
//   null 전용 상자가 됩니다. <T | null> 을 적으세요.

// [실수 3] 상태를 직접 고치기
//   items.push(...) 는 화면을 안 바꿉니다. React자료 07단원의 불변 갱신 그대로입니다.
//   타입스크립트도 이건 안 막아 줍니다. readonly Menu[] 로 적어 두면 막힙니다.

// [실수 4] 리터럴 유니온에 <Status> 를 안 적기
//   string 이 되어 오타가 안 걸립니다. 겉으로는 잘 돌아가서 더 위험합니다.


// ── 화면 ──

export default function Page() {
  return (
    <div>
      <h2>개념 02 — useState 와 타입</h2>

      <p>섹션 1 — 초기값에서 추론</p>
      <Counter />

      <p>섹션 2 — null 로 시작</p>
      <Selected />

      <p>섹션 3 — 빈 배열로 시작</p>
      <Cart />

      <p>섹션 4 — 리터럴 유니온</p>
      <StatusPicker />

      <Summary
        items={[
          "useState 는 제네릭 함수다. 초기값을 보고 T 를 알아낸다.",
          "대부분은 useState(0) 처럼 그냥 쓰면 된다. 적을 필요가 없다.",
          "적어야 하는 경우 ① null 로 시작 — useState<Menu | null>(null)",
          "적어야 하는 경우 ② 빈 배열로 시작 — useState<Menu[]>([])",
          "적어야 하는 경우 ③ 리터럴 유니온 — useState<Status>(\"대기\")",
          "에러에 never 가 보이면 useState([]) 를 의심한다.",
          "SetStateAction<T> 는 'T 이거나 T 를 돌려주는 함수' 라는 뜻이다.",
        ]}
      />
    </div>
  );
}


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) count 가 string 이 되어 count + 1 이 "01" 이 됩니다.
//    화면에 "눌린 횟수: 01" 이 찍히고, 더 누르면 "011" 이 됩니다.
//    검사는 통과합니다. 문자열에 + 는 이어붙이기라서 정당한 연산이니까요.
//    01단원 개념01 섹션1의 그 이야기가 React 에서 그대로 재현됩니다.
//
// 2) error TS18047: 'selected' is possibly 'null'.
//    재현:
//    type Menu = { name: string; price: number };
//    function Selected() {
//      const [selected] = useState<Menu | null>(null);
//      return <p>{selected.name}</p>;
//    }
//    void Selected;
//    <Menu | null> 이라고 적어 두었으니 확인 없이 못 씁니다.
//    ?. 를 지우면 "라떼 고르기" 를 누르기 전에 화면이 터집니다.
//
// 3) 여러 개 납니다. 담을 때(never 에 못 넣음)와 꺼낼 때(never 에 name 이 없음)
//    양쪽에서 나옵니다. 원인은 하나입니다 — useState([]).
//    01단원 개념03 섹션3의 "맨 위부터 하나씩" 이 그대로 통합니다.
//
// 4) 걸리지 않습니다. 그게 문제입니다.
//    <Status> 를 지우면 status 가 string 이 되어 "취소" 도 들어갑니다.
//    화면에는 "현재 상태: 취소" 가 찍힙니다. 아무도 안 막아 줍니다.
//
// 5) Counter 의 useState(0) 과 TextInput 류의 useState("") 입니다.
//    초기값만 보고 number · string 인 것이 분명하기 때문입니다.
//    02단원 개념02의 "초기값이 옆에 있으면 안 적는다" 가 그대로입니다.
