// ============================================================
// 13단원 · 종합 01 — 할 일 목록
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// ★ 이 앱은 JS자료 13단원 종합03과 '완전히 같은 앱' 입니다.
//   추가 · 완료 토글 · 삭제 · 필터 · 개수까지 요구사항이 하나도 다르지 않습니다.
//   같은 앱을 이번에는 React 로 다시 만듭니다.
//
// [두 코드는 무엇이 다른가]
//   JS 판에서 우리는 화면을 '직접' 고쳤습니다. createElement 로 li 를 만들고,
//   appendChild 로 붙이고, innerHTML = "" 로 지우고, classList.add("done") 로
//   취소선을 그었습니다. 데이터가 한 번 바뀔 때마다 "화면의 어느 부분을 어떻게
//   고칠지" 를 우리가 전부 적어 줬습니다. 그래서 render() 라는 함수를 직접 만들고,
//   무슨 일이 생길 때마다 그것을 잊지 않고 다시 불러야 했습니다(JS 판 문제 8).
//   React 판에는 그런 코드가 한 줄도 없습니다. createElement 도, appendChild 도,
//   classList 도, render() 를 다시 부르는 줄도 없습니다. 우리는 "todos 가 이러면
//   화면은 이렇게 생겼다" 만 적습니다. 데이터를 setTodos 로 바꾸면 화면을 고치는
//   일은 React 가 합니다. 01단원 개념01에서 "React 는 그 일을 대신해 줍니다" 라고
//   했던 이야기가 여기서 끝납니다. 같은 앱을 두 번 만들어 봤으니 이제 그 말이
//   무슨 뜻이었는지 코드로 확인할 수 있습니다.
//
// [쓰는 단원] 04(state·이벤트) · 05(조건부 렌더링·리스트·key) ·
//            06(폼·제어 컴포넌트) · 07(불변 갱신·컴포넌트 쪼개기)
//
// ★ 이 실습에서 가장 어려운 것은 문제 5 입니다.
//   재미있게도 JS 판에서도 가장 어려운 것이 문제 5였습니다. 이유는 전혀 다릅니다.
//   JS 판은 '이벤트 위임과 dataset 문자열' 이 어려웠고,
//   React 판은 '배열도 새것, 그 안의 객체도 새것' 이라는 두 겹이 어렵습니다.
//
// [푸는 법]
//   1) 아래로 내려가며 // TODO 를 찾아 코드를 고칩니다.
//   2) 저장하면 화면이 저절로 바뀝니다(Vite). F5 를 누르지 않아도 됩니다.
//   3) 각 문제의 '기대 결과' 와 화면을 비교합니다.
//   4) 막히면 07단원 개념01(추가·삭제·수정 세 줄)을 다시 보세요.
//
// ★ 아직 아무것도 안 고친 지금도 화면은 나옵니다.
//   목록 자리에 "여기에 목록이 나옵니다 (문제 2)" 같은 안내가 보이는 것이 정상입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

// 할 일 하나의 모양입니다. JS 판과 똑같습니다.
//   { id: 1, text: "장보기", done: false }
const FIRST_TODOS = [
  { id: 1, text: "장보기", done: false },
  { id: 2, text: "설거지", done: true },
];

// 새 항목에 붙일 번호입니다.
// 화면에 보이는 값이 아니므로 state 가 아니어도 됩니다(07단원 개념05).
// 07단원 개념01의 nextCartId 와 같은 방식입니다.
let nextId = 3;

// ── 한 줄짜리 부품 두 개 (이미 만들어 두었습니다) ──

// 할 일 한 줄입니다. 03단원에서 배운 대로 props 로 값과 함수를 받습니다.
// 함수를 props 로 내려보내는 것은 07단원 개념04에서 배웠습니다.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li>
      {/* done 이면 취소선이 그어집니다. 05단원 개념01의 삼항 연산자입니다. */}
      <span
        className={todo.done ? "done" : ""}
        style={{ cursor: "pointer" }}
        onClick={() => onToggle(todo.id)}
      >
        {todo.text}
      </span>{" "}
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
}

// 필터 버튼 한 개입니다. 문제 7에서 이 안을 고칩니다.
function FilterButton({ value, label, filter, onChange }) {
  // ───── 문제 7 ─────
  // 지금 고른 필터와 같은 버튼에만 "on" 클래스를 붙이세요.
  // (className 이 "on" 이면 파란 배경이 됩니다. 05단원 개념01)
  //
  // 기대 결과 (화면): [전체] 만 파란색인 상태로 시작합니다.
  //                  [미완료] 를 누르면 [미완료] 만 파란색이 됩니다.
  //                  세 개가 다 파랗거나 다 회색이면 조건을 반대로 쓴 것입니다.
  //                  누른 버튼이 안 파래지면 value 와 filter 를 비교하지 않은 것입니다.
  //
  // TODO: className 을 filter === value 일 때만 "on" 으로 만드세요
  return (
    <button className="" onClick={() => onChange(value)}>
      {label}
    </button>
  );
}

// ── 여기서부터가 앱 본체입니다 ──

function TodoApp() {
  const [todos, setTodos] = useState(FIRST_TODOS);
  const [text, setText] = useState(""); // 입력칸 (06단원 제어 컴포넌트)
  const [error, setError] = useState(""); // 빨간 안내 문구
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  // ───── 문제 1 ───── 보여 줄 목록 고르기
  // filter 값에 따라 화면에 보여 줄 배열을 만드세요.
  //   "all"    → 전부
  //   "active" → done 이 false 인 것만
  //   "done"   → done 이 true 인 것만
  //
  // ★ 이것을 state 로 두지 마세요. todos 와 filter 로 언제든 계산할 수 있습니다.
  //   계산할 수 있는 값을 state 로 두면 두 값이 어긋납니다(07단원 개념05).
  //
  // 기대 결과 (화면): [미완료] 를 누르면 "장보기" 한 줄만,
  //                  [완료] 를 누르면 "설거지" 한 줄만 남습니다.
  //                  필터를 눌러도 두 줄 그대로면 아직 todos 를 그대로 쓰는 것입니다.
  //                  (문제 2까지 해야 목록이 눈에 보입니다)
  //
  // TODO: 아래 줄을 filter 를 반영하도록 고치세요
  const visibleTodos = todos;

  // ───── 문제 3 ───── 개수 세기
  // 아래 세 값을 실제 개수로 채우세요. 필터와 상관없이 '전체 todos' 기준입니다.
  //   total     전체 개수
  //   doneCount 완료한 개수
  //   leftCount 남은 개수
  //
  // ★ 이것도 state 로 두지 않습니다. todos 하나에서 전부 나옵니다.
  //
  // 기대 결과 (화면): 맨 아래 줄 → 할 일 2개 (완료 1개, 남은 일 1개)
  //                  필터를 [미완료] 로 바꿔도 이 줄은 그대로여야 합니다.
  //                  필터에 따라 숫자가 변하면 visibleTodos 를 세고 있는 것입니다.
  //
  // TODO: 아래 세 줄을 고치세요
  const total = 0;
  const doneCount = 0;
  const leftCount = 0;

  // ───── 문제 4 ───── 추가
  // 아래 순서로 채우세요.
  //   1) 입력값 양옆 공백을 없앤다 (trim)
  //   2) 비어 있으면 error 에 "할 일을 입력해 주세요" 를 넣고 끝낸다
  //   3) 같은 내용이 이미 있으면 "이미 있는 항목입니다" 를 넣고 끝낸다
  //      (some 은 "하나라도 있나" 를 알려 줍니다 — JS자료 08단원)
  //   4) 통과하면 error 를 비우고, todos 에 새 항목을 추가한다
  //      새 항목: { id: nextId, text: 다듬은글, done: false }
  //      ★ push 가 아니라 [...todos, 새것] 입니다 (07단원 개념01)
  //   5) nextId 를 1 늘리고, 입력칸(text)을 비운다
  //
  // e.preventDefault() 는 미리 넣어 두었습니다. 이 줄을 지우면 폼이 제출되면서
  // 페이지가 통째로 새로고침되어 담아 둔 할 일이 전부 날아갑니다(06단원 개념04).
  //
  // 기대 결과 (화면):
  //   빈 칸에서 [추가]        → 할 일을 입력해 주세요   (목록은 2줄 그대로)
  //   "장보기" 넣고 [추가]    → 이미 있는 항목입니다     (목록은 2줄 그대로)
  //   "운동하기" 넣고 [추가]  → 목록 3줄, 입력칸이 비워지고 빨간 글자도 사라집니다
  //                            상태줄 → 할 일 3개 (완료 1개, 남은 일 2개)
  //   추가는 되는데 입력칸에 글자가 남아 있으면 5)를 빠뜨린 것입니다.
  //   추가할 때마다 목록이 하나로 덮어써지면 [...todos, 새것] 의 ... 을 뺀 것입니다.
  //
  function handleSubmit(e) {
    e.preventDefault();

    // TODO: 여기에 코드를 쓰세요
  }

  // ───── 문제 5 ───── 완료 토글  ★ 이 파일에서 가장 어렵습니다
  // 누른 항목의 done 을 뒤집으세요.
  //
  // 두 가지를 동시에 지켜야 합니다.
  //   ① todos 배열이 '새 배열' 이어야 한다        → map 을 씁니다
  //   ② 바꾸는 그 항목도 '새 객체' 여야 한다      → { ...todo, done: !todo.done }
  //
  // 형태는 07단원 개념01 섹션5의 그 줄입니다.
  //   setTodos(todos.map((todo) => (todo.id === 고칠id ? { ...todo, 바꿀것 } : todo)))
  //
  // 기대 결과 (화면): "장보기" 글자를 누르면 회색 취소선이 생깁니다.
  //                  상태줄 → 할 일 2개 (완료 2개, 남은 일 0개)
  //                  한 번 더 누르면 취소선이 없어집니다.
  //                  아무 반응이 없으면 setTodos 를 안 불렀거나, 배열을 직접 고친 것입니다.
  //                  누른 줄 말고 다른 줄까지 바뀌면 todo.id === id 조건을 빠뜨린 것입니다.
  //
  function handleToggle(id) {
    // TODO: 여기에 코드를 쓰세요
  }

  // ───── 문제 6 ───── 삭제
  // 누른 항목을 목록에서 지우세요. filter 는 '남길 것' 을 고릅니다(07단원 개념01).
  //
  // 기대 결과 (화면): "설거지" 의 [삭제] 를 누르면 그 줄만 사라집니다.
  //                  상태줄 → 할 일 1개 (완료 0개, 남은 일 1개)
  //                  누른 것만 남고 나머지가 사라지면 !== 를 === 로 쓴 것입니다.
  //
  function handleDelete(id) {
    // TODO: 여기에 코드를 쓰세요
  }

  // ───── 문제 8 ───── 완료 항목 한꺼번에 지우기
  // done 이 true 인 항목을 전부 지우세요. 문제 6과 조건만 다릅니다.
  //
  // 기대 결과 (화면): 처음 상태에서 [완료 항목 삭제] → "설거지" 가 사라지고
  //                  "장보기" 한 줄만 남습니다.
  //                  상태줄 → 할 일 1개 (완료 0개, 남은 일 1개)
  //                  한 번 더 누르면 아무 일도 안 일어나야 정상입니다.
  //                  목록이 통째로 비면 조건을 반대로 쓴 것입니다.
  //
  function handleClearDone() {
    // TODO: 여기에 코드를 쓰세요
  }

  return (
    <div className="demo">
      <h3>할 일 목록</h3>

      {/* 입력칸은 06단원의 제어 컴포넌트입니다. 이미 만들어 두었습니다. */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하고 Enter"
        />{" "}
        <button type="submit">추가</button>
      </form>

      <div className="error">{error}</div>

      <div>
        <FilterButton value="all" label="전체" filter={filter} onChange={setFilter} />
        <FilterButton value="active" label="미완료" filter={filter} onChange={setFilter} />
        <FilterButton value="done" label="완료" filter={filter} onChange={setFilter} />{" "}
        <button onClick={handleClearDone}>완료 항목 삭제</button>
      </div>

      {/* ───── 문제 2 ───── 목록 그리기
          visibleTodos 를 map 으로 돌면서 <TodoItem /> 을 그리세요.
          TodoItem 에 넘겨야 하는 것 (위쪽 TodoItem 정의를 보세요)
            todo={todo}  onToggle={handleToggle}  onDelete={handleDelete}
          그리고 key 를 잊지 마세요. key 는 todo.id 를 씁니다(05단원 개념03).

          기대 결과 (화면): 두 줄이 나옵니다.
            장보기   [삭제]
            설거지   [삭제]   ← 회색 + 취소선 (done 이 true 라서)
          key 를 빠뜨리면 화면은 나오지만 콘솔에 노란 경고가 뜹니다.
            Each child in a list should have a unique "key" prop.
          아무것도 안 나오면 map 이 JSX 를 돌려주지 않는 것입니다(return 확인).

          TODO: 아래 ul 안을 고치세요 */}
      <ul>
        <li>여기에 목록이 나옵니다 (문제 2)</li>
      </ul>

      {/* 비었을 때 안내입니다. 05단원 개념05에서 배운 && 입니다.
          length 를 그대로 && 앞에 쓰면 0이 화면에 찍히므로 === 0 으로 비교합니다. */}
      {visibleTodos.length === 0 && <div className="output">항목이 없습니다</div>}

      <div className="output">
        할 일 {total}개 (완료 {doneCount}개, 남은 일 {leftCount}개)
      </div>
    </div>
  );
}

export default function Project01TodoApp() {
  return (
    <div>
      <h1>종합 01 — 할 일 목록</h1>

      <p className="guide">
        <strong>JS자료 13단원 종합03과 같은 앱</strong>입니다. 이번에는 React 로 만듭니다.
        <br />
        <br />
        문제는 <strong>8개</strong>입니다. 위에서부터 순서대로 푸세요. 문제 1·2를 풀면
        목록이 눈에 보이기 시작합니다.
        <br />
        <br />
        <strong>가장 어려운 것은 문제 5(완료 토글)</strong> 입니다. 배열도 새것, 그 안의
        객체도 새것 — 두 겹을 지켜야 합니다.
        <br />
        <br />
        막히면 <strong>종합01_할일목록_정답.jsx</strong> 를 보세요. 먼저 스스로 해 보고
        나서 보는 것이 훨씬 남습니다.
      </p>

      <TodoApp />

      <Summary
        items={[
          "이 앱은 JS자료 종합03과 같은 앱입니다. 요구사항이 하나도 다르지 않습니다.",
          "JS 판에는 createElement · appendChild · innerHTML · classList 가 가득했습니다. React 판에는 한 줄도 없습니다.",
          "JS 판에서 손으로 만들던 render() 와 '바뀔 때마다 다시 부르기' 가 통째로 사라졌습니다. setTodos 가 그 일을 대신합니다.",
          "우리가 적는 것은 '데이터가 이러면 화면은 이렇게 생겼다' 하나뿐입니다.",
          "화면에 보여 줄 목록과 개수는 state 가 아닙니다. todos 와 filter 에서 계산해 냅니다(07단원 개념05).",
          "추가는 [...todos, 새것], 삭제는 filter, 수정은 map + 스프레드입니다(07단원 개념01).",
          "목록을 map 으로 그릴 때는 key 를 붙입니다(05단원 개념03).",
        ]}
      />
    </div>
  );
}
