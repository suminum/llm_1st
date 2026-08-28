// ============================================================
// 07단원 · 개념 04 — 화면 상태 다루기  ★ 이 단원의 결론
// ------------------------------------------------------------
// 보기: npm run dev → 왼쪽 목록에서 고르기
// 검사: npm run typecheck
// ============================================================
//
// 05단원 개념04 섹션3에서 이런 이야기를 했습니다.
//
//     서버에서 데이터를 받아 오는 화면은 언제나 세 상태 중 하나다.
//     07단원에서 React 화면 상태를 이 패턴 그대로 다룬다.
//
// 그 단원입니다. 05단원에서 만든 LoadState 를 진짜 화면에 붙입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.tsx";

type Menu = { id: number; name: string; price: number };

// ── 섹션 1: 흔히 하는 방식 — 그리고 그 문제 ──

// React자료에서 이렇게 배웠고, 실제로 이렇게 쓰는 코드가 많습니다.
function BadVersion() {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load(shouldFail: boolean) {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      if (shouldFail) setError("서버가 응답하지 않습니다");
      else setMenus([{ id: 1, name: "라떼", price: 4500 }]);
    }, 400);
  }

  return (
    <div>
      <button type="button" onClick={() => load(false)}>
        성공하는 요청
      </button>{" "}
      <button type="button" onClick={() => load(true)}>
        실패하는 요청
      </button>
      {loading && <p>불러오는 중...</p>}
      {error !== null && <p style={{ color: "#c00" }}>오류: {error}</p>}
      {!loading && error === null && <p>{menus.length}개 메뉴</p>}
    </div>
  );
}

// 돌아가기는 합니다. 그런데 문제가 셋 있습니다.
//
//   ① 상태가 셋으로 흩어져 있어서 세 개를 매번 같이 맞춰야 합니다.
//      setError(null) 을 한 줄 빠뜨리면 실패했던 오류 메시지가 남습니다.
//
//   ② 있을 수 없는 조합이 만들어집니다.
//      loading: true 이면서 error 가 있는 상태를 타입이 막지 않습니다.
//
//   ③ 화면 조건이 지저분해집니다.
//      !loading && error === null 처럼 "아닌 것" 을 나열하게 됩니다.
//      상태가 하나 늘면 이 조건을 전부 다시 봐야 합니다.

// ✏️ 직접 해보기 1 — BadVersion 에서 setError(null) 한 줄을 지우고
//    실패 → 성공 순서로 눌러 보세요. 무엇이 이상한가요?


// ── 섹션 2: 판별 유니온으로 바꾸기 ──

// 05단원 개념04 그대로입니다. 상태를 '하나' 로 만듭니다.
type LoadState =
  | { status: "시작전" }
  | { status: "로딩중" }
  | { status: "성공"; data: Menu[] }
  | { status: "실패"; message: string };

function GoodVersion() {
  const [state, setState] = useState<LoadState>({ status: "시작전" });

  function load(shouldFail: boolean) {
    setState({ status: "로딩중" });
    setTimeout(() => {
      if (shouldFail) setState({ status: "실패", message: "서버가 응답하지 않습니다" });
      else setState({ status: "성공", data: [{ id: 1, name: "라떼", price: 4500 }] });
    }, 400);
  }

  return (
    <div>
      <button type="button" onClick={() => load(false)}>
        성공하는 요청
      </button>{" "}
      <button type="button" onClick={() => load(true)}>
        실패하는 요청
      </button>
      <View state={state} />
    </div>
  );
}

// 화면 그리는 부분을 따로 뺐습니다. switch 하나로 끝납니다.
function View({ state }: { state: LoadState }) {
  switch (state.status) {
    case "시작전":
      return <p>버튼을 눌러 보세요.</p>;
    case "로딩중":
      return <p>불러오는 중...</p>;
    case "실패":
      return <p style={{ color: "#c00" }}>오류: {state.message}</p>;
    case "성공":
      return (
        <ul>
          {state.data.map((m) => (
            <li key={m.id}>
              {m.name} — {m.price}원
            </li>
          ))}
        </ul>
      );
  }
}

// case "성공" 안에서 state.data 를 확인 없이 바로 씁니다.
// "성공이면 data 가 반드시 있다" 가 타입에 적혀 있기 때문입니다.
//
// 반대로 없는 곳에서 쓰면 걸립니다.
//
// 에러: TS2339 Property 'data' does not exist on type '{ status: "로딩중"; }'.
// function ViewWrong({ state }: { state: LoadState }) {
//   if (state.status === "로딩중") {
//     return <p>{state.data.length}</p>;
//   }
//   return null;
// }
//
// 실수: 로딩 중에는 데이터가 없습니다. 그걸 타입이 알고 막아 줍니다.
//       섹션 1의 방식이었다면 menus 가 그냥 빈 배열이라 조용히 0 이 나왔을 것입니다.

// 그리고 있을 수 없는 상태는 아예 못 만듭니다.
//
// 에러: TS2353 Object literal may only specify known properties, and 'message' does not exist in type '{ status: "성공"; data: Menu[]; }'.
// const 불가능: LoadState = { status: "성공", data: [], message: "실패" };
//
// 실수: 성공이면서 오류 메시지가 있는 상태를 만들 수 없습니다.
//       "잘못된 상태를 표현할 수 없게 만든다" — 이 패턴의 핵심 이득입니다.

// ✏️ 직접 해보기 2 — GoodVersion 에서 같은 실수를 낼 수 있나요?
//    ✏️1 처럼 '지우면 상태가 어긋나는 줄' 을 찾아보세요.


// ── 섹션 3: 상태가 하나 늘면 ──

// LoadState 에 { status: "빈결과" } 를 추가한다고 해 봅시다.
// 그러면 View 의 switch 가 그 자리에서 걸립니다.
// "빈결과일 때 무엇을 그릴지 안 적었습니다" 라고요.
//
// 섹션 1의 방식이었다면 아무 일도 안 일어납니다.
// 조건 세 개를 손으로 다시 훑어야 하고, 빠뜨려도 아무도 안 알려 줍니다.
//
// 이게 판별 유니온을 쓰는 실질적인 이유입니다.
//
//     고쳐야 할 곳을 타입이 전부 찾아 준다.

// ✏️ 직접 해보기 3 — LoadState 에 { status: "빈결과" } 를 추가해 보세요.
//    어디가 걸리나요? 확인한 뒤 되돌리세요.


// ── 섹션 4: props 로 상태를 넘길 때 ──

// View 의 props 를 { state: LoadState } 라고 그 자리에 적었습니다.
// 짧으면 이렇게 써도 되고, 길어지면 04단원처럼 이름을 붙입니다.
//
//     type ViewProps = { state: LoadState };
//     function View({ state }: ViewProps) { ... }
//
// 어느 쪽이든 됩니다. 이 자료는 한 줄이면 그 자리에, 길면 이름을 붙입니다.

// ✏️ 직접 해보기 4 — View 의 매개변수를 { state: LoadState } 대신
//    type ViewProps 로 빼 보세요. 동작이 달라지나요?


// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] status 를 string 으로 적기
//   05단원 개념04 섹션5입니다. 리터럴이 아니면 좁히기가 안 됩니다.
//   useState<LoadState> 를 적어 두면 이 실수가 안 생깁니다.

// [실수 2] useState 에 <LoadState> 를 안 적기
//   { status: "시작전" } 만 보고 그 모양으로만 잡습니다.
//   그러면 setState({ status: "로딩중" }) 이 걸립니다.
//   개념02 섹션4의 리터럴 유니온 문제와 같습니다.

// [실수 3] 상태를 여러 개로 흩뿌리기
//   섹션 1입니다. 돌아가지만 조합이 어긋나기 시작하면 원인을 못 찾습니다.

// [실수 4] switch 에 default 를 넣어 뭉뚱그리기
//   편하지만, 상태를 추가했을 때 알려 주는 기능을 잃습니다.
//   05단원 개념02 ✏️2 에서 확인한 그대로입니다.

// ── 화면 ──

export default function Page() {
  return (
    <div>
      <h2>개념 04 — 화면 상태 다루기</h2>

      <p>섹션 1 — 흩어진 상태(권하지 않음)</p>
      <BadVersion />

      <p>섹션 2 — 판별 유니온</p>
      <GoodVersion />

      <Summary
        items={[
          "서버를 부르는 화면은 언제나 몇 가지 상태 중 하나다.",
          "상태를 여러 useState 로 흩뿌리면 있을 수 없는 조합이 만들어진다.",
          "판별 유니온으로 하나로 묶으면 그런 조합을 아예 못 만든다.",
          "useState<LoadState>({ status: \"시작전\" }) 처럼 타입을 꼭 적는다.",
          "화면은 switch (state.status) 하나로 끝난다. '아닌 것' 을 나열하지 않는다.",
          "case 안에서는 그 상태로 좁혀져서 data 를 확인 없이 쓸 수 있다.",
          "상태를 하나 추가하면 고쳐야 할 곳을 타입이 전부 찾아 준다.",
        ]}
      />
    </div>
  );
}


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 실패한 뒤 성공을 누르면, 성공했는데도 빨간 오류 문구가 남아 있습니다.
//    상태 세 개를 매번 같이 맞춰 줘야 하는데 한 줄을 빠뜨렸기 때문입니다.
//    타입은 아무 말도 안 합니다. 세 상태가 서로 모순이어도 각각은 올바르니까요.
//
// 2) 낼 수 없습니다.
//    setState 를 한 번 부르면 상태가 통째로 바뀌기 때문에
//    '옛 오류가 남는' 일이 구조적으로 안 생깁니다.
//    → 실수를 조심해서 막는 것이 아니라, 실수할 수 없게 만든 것입니다.
//
// 3) View 의 switch 가 걸립니다.
//    error TS2366: Function lacks ending return statement and return type
//    does not include 'undefined'.
//    "빈결과일 때 무엇을 그릴지 안 적었습니다" 라는 뜻입니다.
//    BadVersion 쪽이었다면 아무 일도 안 일어났을 것입니다.
//    재현:
//    type LoadState =
//      | { status: "로딩중" }
//      | { status: "성공" }
//      | { status: "빈결과" };
//    function View({ state }: { state: LoadState }): string {
//      switch (state.status) {
//        case "로딩중": return "a";
//        case "성공": return "b";
//      }
//    }
//    void View;
//
// 4) 달라지지 않습니다. 완전히 같습니다.
//    한 줄이면 그 자리에 적고, 길어지거나 여러 번 쓰면 이름을 붙입니다.
//    04단원 개념02 섹션5의 기준이 그대로입니다.
