// ============================================================
// 13단원 · 종합 01 정답 — 할 일 목록
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 먼저 스스로 만들어 본 다음에 보세요.
// 추가 · 완료 토글 · 삭제 · 필터 · 개수가 전부 동작합니다.
//
// ★ 이 앱은 JS자료 13단원 종합03과 '완전히 같은 앱' 입니다.
//   요구사항이 하나도 다르지 않습니다. 다른 것은 만드는 방법뿐입니다.
//
// [두 코드는 무엇이 다른가]
//   JS 판에서 우리는 화면을 '직접' 고쳤습니다. createElement 로 li 를 만들고,
//   appendChild 로 붙이고, innerHTML = "" 로 지우고, classList.add("done") 로
//   취소선을 그었습니다. 그리고 그 일을 모아 둔 render() 함수를 직접 만들고,
//   무슨 일이 생길 때마다 잊지 않고 다시 불러야 했습니다(JS 판 문제 8).
//   이 파일에는 그런 코드가 한 줄도 없습니다. createElement 도, appendChild 도,
//   innerHTML 도, classList 도, render() 를 다시 부르는 줄도 없습니다.
//   우리는 "todos 가 이러면 화면은 이렇게 생겼다" 만 적었습니다.
//   setTodos 로 데이터를 바꾸면 화면을 고치는 일은 React 가 합니다.
//   01단원 개념01에서 "React 는 그 일을 대신해 줍니다" 라고 했던 이야기가
//   여기서 끝납니다. 아래 섹션 '나란히 놓고 보기' 에 두 코드를 붙여 두었습니다.
//
// ★ 이 실습에서 가장 어려운 것은 문제 5(완료 토글) 입니다.
//   배열도 새것, 그 안의 객체도 새것 — 두 겹을 동시에 지켜야 하기 때문입니다.

import { useState } from "react";
import Summary from "../_ui/Summary.jsx";

const FIRST_TODOS = [
  { id: 1, text: "장보기", done: false },
  { id: 2, text: "설거지", done: true },
];

// 새 항목에 붙일 번호입니다.
// 화면에 보이는 값이 아니므로 state 가 아니어도 됩니다(07단원 개념05).
// 07단원 개념01의 nextCartId 와 같은 방식입니다.
let nextId = 3;

// ── 브라우저를 열기 전에 검산하기 ──
//
// 이 앱이 배열에 하는 일은 세 가지뿐입니다. 추가 · 수정 · 삭제.
// 화면을 만들기 전에 그 세 줄이 정말 '새것' 을 만드는지 콘솔로 확인해 둡니다.
// 12단원 개념04에서 reducer 를 검산했던 것과 같은 방법입니다.

const sample = FIRST_TODOS;

// (1) 추가 — 대괄호를 새로 열었으니 결과는 반드시 새 배열입니다
const afterAdd = [...sample, { id: 3, text: "운동하기", done: false }];

console.log(afterAdd.length);
// 콘솔: 3
console.log(afterAdd !== sample);
// 콘솔: true

// (2) 수정 — map 은 새 배열을 돌려주고, 스프레드는 새 객체를 만듭니다
const afterToggle = sample.map((todo) =>
  todo.id === 1 ? { ...todo, done: !todo.done } : todo
);

console.log(afterToggle[0].done);
// 콘솔: true
console.log(afterToggle[0] !== sample[0]);
// 콘솔: true
console.log(afterToggle[1] === sample[1]);
// 콘솔: true

// 마지막 줄을 눈여겨보세요. 손대지 않은 줄은 '원래 객체 그대로' 입니다.
// map 은 목록 전체를 새로 만드는 것이 아니라 필요한 줄만 새로 만듭니다.

// (3) 삭제 — filter 는 '남길 것' 을 고릅니다
const afterDelete = sample.filter((todo) => todo.id !== 1);

console.log(afterDelete.map((todo) => todo.text).join(", "));
// 콘솔: 설거지
console.log(sample.length);
// 콘솔: 2

// 지우고 나서도 원본 sample 은 그대로 2개입니다. filter 는 원본을 안 건드립니다.
// splice 였다면 원본까지 함께 줄어듭니다. 그래서 splice 를 안 씁니다.

// ── 화면 부품 ──

// 할 일 한 줄입니다. props 로 값 하나와 함수 둘을 받습니다.
// 함수를 props 로 내려보내는 것은 07단원 개념04에서 배웠습니다.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li>
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

// [이 부품이 JS 판과 다른 점]
//   JS 판에서는 li · span · button 을 createElement 로 세 번 만들고
//   appendChild 를 세 번 불러 조립했습니다. 여기서는 생긴 모양을 그대로 적었습니다.
//   그리고 JS 판은 어느 항목을 눌렀는지 알아내려고 li 에 data-id 를 심고
//   e.target.closest("li") 로 거슬러 올라가 dataset 을 Number 로 바꿔야 했습니다.
//   여기서는 그 줄이 통째로 사라졌습니다. 각 줄이 자기 todo 를 이미 알고 있으니
//   onToggle(todo.id) 라고 그냥 부르면 됩니다. id 는 처음부터 숫자입니다.

function FilterButton({ value, label, filter, onChange }) {
  // ───── 문제 7 ─────
  // 지금 고른 필터와 같은 버튼에만 "on" 클래스를 붙입니다.
  return (
    <button className={filter === value ? "on" : ""} onClick={() => onChange(value)}>
      {label}
    </button>
  );
}

// [왜 이렇게 했나]
//   JS 판에서는 버튼 세 개를 전부 돌며 classList.remove("active") 한 뒤
//   눌린 것에만 add("active") 를 해야 했습니다. '떼고 붙이는' 두 단계였습니다.
//   React 에서는 각 버튼이 "나는 지금 고른 값인가?" 만 스스로 답하면 끝입니다.
//   filter 가 바뀌면 세 버튼이 모두 다시 그려지면서 저절로 정리됩니다.
//
//   className 은 02단원 개념03에서 배운 대로 class 가 아니라 className 입니다.
//   삼항 연산자로 값을 고르는 것은 05단원 개념01입니다.

// ── 앱 본체 ──

function TodoApp() {
  const [todos, setTodos] = useState(FIRST_TODOS);
  const [text, setText] = useState(""); // 입력칸 (06단원 제어 컴포넌트)
  const [error, setError] = useState(""); // 빨간 안내 문구
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  // [state 를 왜 이렇게 넷으로 나눴나]
  //   넷 다 '서로 계산해 낼 수 없는 값' 입니다. 그래서 각자 필요합니다.
  //   todos 는 진짜 데이터, text 는 입력 중인 글자, error 는 안내 문구,
  //   filter 는 사용자가 고른 보기 방식입니다.
  //   반대로 아래 visibleTodos · total · doneCount · leftCount 는
  //   todos 와 filter 에서 계산해 낼 수 있으므로 state 로 두지 않습니다.
  //   07단원 개념05의 '파생 state 금지' 가 그 이야기입니다.

  // ───── 문제 1 ───── 보여 줄 목록 고르기
  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.done;
    if (filter === "done") return todo.done;
    return true; // "all"
  });

  // [왜 이렇게 했나]
  //   filter 콜백이 true 를 돌려주면 그 항목이 남습니다.
  //   "all" 일 때는 전부 남겨야 하므로 그냥 true 입니다.
  //   조기 반환을 쓰면 else 없이 읽기 좋습니다(05단원·JS자료 05단원).
  //
  //   이 값을 state 로 두면 어떻게 될까요? 할 일을 추가할 때마다
  //   todos 와 visibleTodos 를 둘 다 고쳐야 합니다. 한쪽을 잊으면
  //   "추가했는데 목록에 안 보이는" 상태가 됩니다. 에러는 안 납니다.
  //   계산해서 쓰면 그런 어긋남이 아예 생길 수 없습니다.

  // ───── 문제 3 ───── 개수 세기
  const total = todos.length;
  const doneCount = todos.filter((todo) => todo.done).length;
  const leftCount = total - doneCount;

  // [왜 전체 todos 로 세나]
  //   상태줄은 '지금 보이는 것' 이 아니라 '내가 가진 할 일 전부' 를 알려 주는 줄입니다.
  //   그래서 visibleTodos 가 아니라 todos 를 셉니다.
  //   leftCount 는 뺄셈으로 구했습니다. 또 한 번 filter 를 돌 이유가 없습니다.

  // ───── 문제 4 ───── 추가
  function handleSubmit(e) {
    e.preventDefault(); // ★ 없으면 페이지가 새로고침되어 담아 둔 것이 전부 날아갑니다

    const trimmed = text.trim(); // 공백만 친 경우도 걸러집니다

    if (trimmed === "") {
      setError("할 일을 입력해 주세요");
      return;
    }

    if (todos.some((todo) => todo.text === trimmed)) {
      setError("이미 있는 항목입니다");
      return;
    }

    setError(""); // 통과했으니 지난 안내를 지웁니다

    setTodos([...todos, { id: nextId, text: trimmed, done: false }]);
    nextId = nextId + 1;

    setText(""); // 입력칸 비우기
  }

  // 화면(누르면): 빈 칸에서 [추가] → 할 일을 입력해 주세요
  // 화면(누르면): "장보기" 를 넣고 [추가] → 이미 있는 항목입니다
  // 화면(누르면): "운동하기" 를 넣고 [추가] → 목록 3줄, 입력칸이 비고 빨간 글자도 사라집니다
  //
  // [왜 이렇게 했나]
  //   · 조기 반환을 세 번 씁니다. 조건마다 return 으로 끊으면 else 가 필요 없습니다.
  //   · setError("") 를 성공 쪽에 둔 이유: 안 지우면 한 번 뜬 빨간 글자가
  //     그 뒤로 계속 남습니다. 에러는 안 나고 화면만 조용히 틀립니다.
  //   · { id: nextId, text: trimmed, done: false } 는
  //     { id: nextId, text, done: false } 로 줄여 쓸 수도 있습니다.
  //     키 이름과 변수 이름이 같으면 한 번만 적어도 되는 줄임 문법입니다.
  //     (여기서는 변수 이름이 trimmed 라 줄일 수 없습니다)
  //   · nextId 는 state 가 아니라 그냥 변수입니다. 화면에 안 보이는 값이라
  //     바뀌어도 다시 그릴 필요가 없기 때문입니다.
  //
  // [JS 판과 비교]
  //   JS 판에서는 여기서 todoInput.value = "" 로 입력칸을 직접 비우고
  //   render() 를 직접 불렀습니다. 여기서는 setText("") 와 setTodos(...) 로
  //   '데이터' 만 바꿉니다. 화면은 저절로 따라옵니다.

  // ───── 문제 5 ───── 완료 토글  ★ 가장 어려운 문제
  function handleToggle(id) {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  }

  // 화면(누르면): "장보기" 글자를 누르면 회색 취소선이 생깁니다
  // 화면(누르면): 상태줄이 "할 일 2개 (완료 2개, 남은 일 0개)" 로 바뀝니다
  //
  // [왜 이 문제가 가장 어려운가]
  //   지켜야 할 것이 두 겹이기 때문입니다.
  //
  //     ① 배열이 새것이어야 한다        → map 이 새 배열을 만들어 줍니다
  //     ② 바꾸는 그 칸도 새 객체여야 한다 → { ...todo, done: !todo.done }
  //
  //   ① 만 지키면 어떻게 될까요? 이렇게 쓰는 실수가 아주 흔합니다.
  //
  //     todos.map((todo) => {
  //       if (todo.id === id) todo.done = !todo.done;   // ← 객체를 직접 고침
  //       return todo;
  //     })
  //
  //   이 코드는 이 화면에서는 '되는 것처럼' 보입니다. 배열이 새것이니까요.
  //   하지만 원래 있던 객체를 그 자리에서 고쳐 버렸습니다. 그 객체를 다른 곳에서도
  //   보고 있으면 그쪽까지 조용히 바뀝니다. 07단원 개념02의 얕은 복사 함정입니다.
  //
  //   ② 만 지키고 ① 을 어기면(= 배열을 그대로 두고 안의 객체만 새로 넣으면)
  //   화면이 아예 안 바뀝니다. 07단원 개념01 데모 ① 에서 본 그 상황입니다.
  //
  // [JS 판과 비교]
  //   JS 판의 문제 5도 가장 어려웠습니다. 하지만 어려운 이유가 전혀 달랐습니다.
  //   그쪽은 ul 하나에 이벤트를 붙이고(위임), e.target.closest("li") 로 항목을 찾고,
  //   dataset 값이 문자열이라 Number() 로 바꿔야 하는 것이 어려웠습니다.
  //   React 판에는 위임도 closest 도 dataset 도 없습니다. 대신 '불변' 이 어렵습니다.

  // ───── 문제 6 ───── 삭제
  function handleDelete(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // 화면(누르면): "설거지" 의 [삭제] 를 누르면 그 줄만 사라집니다
  //
  // [왜 이렇게 했나]
  //   filter 는 '지울 것' 이 아니라 '남길 것' 을 고릅니다.
  //   그래서 !== 입니다. === 로 쓰면 누른 것만 남고 나머지가 전부 사라집니다.
  //   에러가 안 나고 화면만 반대로 나오므로 알아채기 어렵습니다.

  // ───── 문제 8 ───── 완료 항목 한꺼번에 지우기
  function handleClearDone() {
    setTodos(todos.filter((todo) => !todo.done));
  }

  // 화면(누르면): [완료 항목 삭제] → "설거지" 가 사라지고 "장보기" 한 줄만 남습니다
  //
  // [왜 이렇게 했나]
  //   문제 6과 같은 filter 인데 조건만 다릅니다.
  //   "done 이 아닌 것만 남긴다" 이므로 !todo.done 입니다.
  //   지운 개수를 따로 셀 필요도, 반복문을 돌 필요도 없습니다.

  return (
    <div className="demo">
      <h3>할 일 목록</h3>

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

      {/* ───── 문제 2 ───── 목록 그리기 */}
      <ul>
        {visibleTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      {/* 05단원 개념05 — length 를 그대로 && 앞에 쓰면 0이 화면에 찍힙니다.
          그래서 === 0 으로 비교해 true/false 를 만든 뒤 씁니다. */}
      {visibleTodos.length === 0 && <div className="output">항목이 없습니다</div>}

      <div className="output">
        할 일 {total}개 (완료 {doneCount}개, 남은 일 {leftCount}개)
      </div>
    </div>
  );
}

// 화면: 목록에 "장보기" 와 취소선 그어진 "설거지" 두 줄,
//       맨 아래 "할 일 2개 (완료 1개, 남은 일 1개)"
// 화면(누르면): [미완료] → "장보기" 한 줄만 남고 [미완료] 버튼이 파랗게 됩니다
// 화면(누르면): [완료] → "설거지" 한 줄만 남습니다
// 화면(누르면): [완료 항목 삭제] 를 [완료] 필터 상태에서 누르면
//               목록이 비면서 "항목이 없습니다" 가 나옵니다

// ── 나란히 놓고 보기 — JS 판과 React 판 ──
//
// 같은 일을 하는 코드를 붙여 두었습니다. 줄 수보다 '무엇을 적었는가' 를 보세요.
//
// [1] 화면 그리기
//
//   JS 판                                    React 판
//   todoList.innerHTML = "";                 <ul>
//   visible.forEach(({ id, text, done }) => {  {visibleTodos.map((todo) => (
//     const li = document.createElement("li");   <TodoItem key={todo.id} ... />
//     li.dataset.id = id;                      ))}
//     if (done) li.classList.add("done");    </ul>
//     const span = document.createElement("span");
//     span.classList.add("text");
//     span.textContent = text;
//     ... appendChild 세 번 ...
//   });
//
//   JS 판은 '만드는 순서' 를 적었고, React 판은 '생긴 모양' 을 적었습니다.
//   innerHTML = "" 로 먼저 비우는 줄이 React 판에는 없습니다.
//   지난번에 그린 것을 치우는 일도 React 가 합니다.
//
// [2] 완료 토글
//
//   JS 판                                    React 판
//   const li = e.target.closest("li");       function handleToggle(id) {
//   const id = Number(li.dataset.id);          setTodos(todos.map((todo) =>
//   todos = todos.map((todo) =>                  todo.id === id
//     todo.id === id                                 ? { ...todo, done: !todo.done }
//       ? { ...todo, done: !todo.done }              : todo));
//       : todo);                             }
//   render();
//
//   가운데 map 줄은 똑같습니다. 앞뒤가 사라졌을 뿐입니다.
//   앞의 두 줄(누른 항목 찾기)과 마지막 줄(render 다시 부르기)이 없어졌습니다.
//
// [3] 처음 화면 그리기
//
//   JS 판                                    React 판
//   render();   ← 이 한 줄을 빠뜨리면        (없음)
//               화면이 통째로 비었습니다
//
//   JS 판 문제 8이 통째로 사라졌습니다. React 는 컴포넌트를 처음 그릴 때부터
//   todos 를 보고 그리므로, "처음 한 번은 직접 불러야 한다" 는 일이 없습니다.
//
// [4] 그래서 무엇이 남았나
//
//   사라진 것 : createElement · appendChild · innerHTML · classList · dataset ·
//               closest · 이벤트 위임 · render() 를 다시 부르기
//   새로 생긴 것 : 불변하게 바꾸기(스프레드 · map · filter) · key
//
//   공짜는 아닙니다. 하지만 새로 생긴 것은 '데이터를 다루는 규칙' 하나뿐이고,
//   사라진 것은 '화면을 손보는 방법' 여덟 가지입니다.
//   화면이 복잡해질수록 이 차이가 커집니다.

export default function Project01TodoAnswer() {
  return (
    <div>
      <h1>종합 01 정답 — 할 일 목록</h1>

      <p className="guide">
        먼저 스스로 만들어 본 다음에 보세요. <strong>추가 · 완료 · 삭제 · 필터</strong> 가
        전부 동작합니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 도 함께 보세요. 화면을 만들기 전에 배열 세 줄을
        검산해 둔 결과가 찍혀 있습니다.
        <br />
        <br />
        코드 아래쪽 <strong>'나란히 놓고 보기'</strong> 에 JS자료 종합03과 같은 자리의
        코드를 붙여 두었습니다. 두 번 만들어 본 사람만 볼 수 있는 비교입니다.
      </p>

      <TodoApp />

      <Summary
        items={[
          "이 앱은 JS자료 종합03과 같은 앱입니다. 요구사항이 하나도 다르지 않습니다.",
          "JS 판의 createElement · appendChild · innerHTML · classList · dataset · closest 가 전부 사라졌습니다.",
          "직접 만들던 render() 와 '바뀔 때마다 다시 부르기' 도 사라졌습니다. setTodos 가 그 일을 합니다.",
          "대신 새로 지킬 것이 하나 생겼습니다. state 는 고치지 말고 새것을 만들어 넣습니다.",
          "완료 토글은 배열도 새것(map), 그 안의 객체도 새것({ ...todo }) 이어야 합니다. 두 겹입니다.",
          "보여 줄 목록과 개수는 state 가 아닙니다. todos 와 filter 에서 계산합니다(07단원 개념05).",
          "여기까지가 04~07단원의 전부입니다. 다음 종합02부터는 09~12단원을 씁니다.",
        ]}
      />
    </div>
  );
}
