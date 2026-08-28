// ============================================================
// 13단원 · 종합 04 — 메모장 (정답)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// ★ 먼저 종합04_메모장.jsx 를 스스로 풀어 본 뒤에 이 파일을 여세요.
//
// 이 파일은 완성본입니다. 각 문제 자리에 [문제 N 정답] 표시를 해 두었고,
// 왜 그렇게 했는지도 함께 적었습니다. **답보다 이유를 읽으세요.**
//
// [쓰는 단원]
//   09 useEffect · fetch · 로딩/에러
//   11 Router · Link · useParams · useNavigate
//   12 Context · useReducer
//   06 제어 컴포넌트 / 07 불변 갱신
//
// ★ 이 예제 안에서는 새로고침(F5)을 하지 마세요.
//   왼쪽 메뉴 선택이 처음으로 돌아가서 이 예제가 화면에서 사라집니다.
//   주소를 되돌리려면 왼쪽 메뉴에서 이 예제를 다시 고르면 됩니다.
//
// ★★ 인터넷 연결이 필요합니다.
//   막힌 곳이라면 실습프로젝트 폴더의 index.html 을 열고
//   <script src="/오프라인_대체.js"> 줄을 감싼 주석 기호만 지우세요.

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ============================================================
// 1. 메모 보관소 — Context + useReducer (12단원)
// ============================================================

const MemoContext = createContext(null);

// [문제 1·2·3 정답] reducer 세 갈래
//
// reducer 는 "지금 상태 + 무슨 일 = 새 상태" 를 적는 함수입니다.
// 규칙이 하나 있습니다. **state 를 고치지 말고 새로 만들어 돌려줍니다.** (07단원)
// state.push(...) 를 쓰면 화면이 안 바뀝니다.
function memoReducer(state, action) {
  switch (action.type) {
    case "채우기":
      // 서버에서 받아온 것으로 통째로 갈아 끼웁니다.
      return action.memos;

    case "추가": {
      // [문제 1 정답]
      // 새 번호는 지금 있는 것 중 가장 큰 번호 + 1 로 정합니다.
      // 목록이 비어 있으면 Math.max() 가 -Infinity 를 주므로 따로 처리합니다.
      const nextId = state.length === 0 ? 1 : Math.max(...state.map((m) => m.id)) + 1;

      // 새 메모를 맨 앞에 붙입니다. [새것, ...기존] 이라 원본은 그대로입니다.
      return [{ id: nextId, title: action.title, body: action.body }, ...state];
    }

    case "삭제":
      // [문제 2 정답] filter 는 조건에 맞는 것만 남긴 '새 배열' 을 줍니다.
      return state.filter((m) => m.id !== action.id);

    case "수정":
      // [문제 3 정답]
      // map 으로 전부 훑으면서 번호가 같은 것만 새 객체로 바꿔 넣습니다.
      // { ...m, title: ... } 은 나머지는 그대로 두고 두 칸만 바꾼 새 객체입니다. (07단원)
      return state.map((m) =>
        m.id === action.id ? { ...m, title: action.title, body: action.body } : m
      );

    default:
      // 모르는 이름이 오면 아무것도 하지 않습니다.
      return state;
  }
}

function MemoProvider({ children }) {
  const [memos, dispatch] = useReducer(memoReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [문제 4 정답] 처음 한 번만 서버에서 메모 5개를 받아옵니다. (09단원)
  useEffect(() => {
    let ignore = false; // 09단원 개념05의 깃발

    async function loadMemos() {
      try {
        const res = await fetch(`${BASE_URL}/posts?_limit=5`);

        // ★ fetch 는 404 를 실패로 치지 않습니다. 이 한 줄이 실패로 만들어 줍니다. (09단원)
        if (!res.ok) throw new Error(`서버가 ${res.status} 로 답했습니다`);

        const data = await res.json();
        if (ignore) return;

        // 서버가 주는 모양은 { userId, id, title, body } 입니다.
        // 우리에게 필요한 세 칸만 골라 담습니다.
        dispatch({
          type: "채우기",
          memos: data.map((post) => ({
            id: post.id,
            title: post.title,
            body: post.body,
          })),
        });

        console.log("메모를 받아왔습니다:", data.length);
        // 콘솔: 메모를 받아왔습니다: 5
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        // ★ 로딩을 끄는 일은 finally 에 둡니다.
        //   try 안에 두면 실패했을 때 영원히 "불러오는 중" 이 됩니다.
        if (!ignore) setLoading(false);
      }
    }

    loadMemos();
    return () => {
      ignore = true;
    };
  }, []);

  // Provider 로 감싼 안쪽이면 어디서든 이 값을 꺼내 쓸 수 있습니다.
  return (
    <MemoContext.Provider value={{ memos, dispatch, loading, error }}>
      {children}
    </MemoContext.Provider>
  );
}

// Context 를 꺼내는 일을 커스텀 훅으로 감쌌습니다. (10단원)
// 이러면 쓰는 쪽에서 useContext 와 MemoContext 를 몰라도 됩니다.
function useMemos() {
  return useContext(MemoContext);
}

// ============================================================
// 2. 화면들
// ============================================================

// ── 목록 화면 ──
function MemoListPage() {
  const { memos, loading, error } = useMemos();

  if (loading) return <p>불러오는 중…</p>;
  if (error) return <p className="error">못 불러왔습니다: {error}</p>;
  if (memos.length === 0) return <p>메모가 하나도 없습니다.</p>;

  return (
    <div>
      <p>메모 {memos.length}개</p>
      <ul>
        {memos.map((memo) => (
          <li key={memo.id}>
            {/* 목록에서 상세로 가는 링크입니다. 주소에 번호를 끼워 넣습니다. */}
            <Link to={`/m/${memo.id}`}>{memo.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── 상세 · 수정 화면 ──
function MemoDetailPage() {
  const { memos, dispatch, loading } = useMemos();
  const { id } = useParams();
  const navigate = useNavigate();

  // ★★ [문제 6 정답] 이 파일에서 가장 어려운 곳입니다.
  //
  //   useParams 가 주는 값은 **언제나 문자열**입니다. 주소는 글자니까요.
  //   반면 memo.id 는 숫자입니다. 그래서 이렇게 쓰면 영원히 못 찾습니다.
  //
  //       memos.find((m) => m.id === id)      ← "3" === 3 은 false
  //
  //   Number(id) 로 숫자로 바꿔서 비교해야 합니다.
  //   JS자료 11단원에서 dataset 값이 문자열이라 계산이 틀렸던 것과 같은 함정입니다.
  const memo = memos.find((m) => m.id === Number(id));

  // (상세 화면에 들어가면) 콘솔: 주소에서 받은 id: 3 string
  console.log("주소에서 받은 id:", id, typeof id);

  // 수정용 입력칸입니다. 처음 값은 찾은 메모에서 가져옵니다. (06단원 제어 컴포넌트)
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // 메모를 찾은 뒤에 입력칸을 채웁니다.
  // memo 가 바뀔 때만 돌아야 하므로 의존성에 memo 를 적었습니다. (09단원)
  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setBody(memo.body);
    }
  }, [memo]);

  // 아직 받아오는 중이면 "없는 메모" 라고 단정하면 안 됩니다.
  if (loading) return <p>불러오는 중…</p>;

  // [문제 8 정답] 없는 번호로 들어왔을 때
  if (!memo) {
    return (
      <div>
        <p className="error">{id}번 메모는 없습니다.</p>
        <Link to="/m">목록으로 돌아가기</Link>
      </div>
    );
  }

  function handleSave(e) {
    e.preventDefault(); // 06단원 — 새로고침 막기
    dispatch({ type: "수정", id: memo.id, title: title, body: body });

    // [문제 7 정답] 저장한 뒤 목록으로 보냅니다. (11단원 useNavigate)
    // Link 는 사용자가 '누르는' 것이고, navigate 는 코드가 '보내는' 것입니다.
    navigate("/m");
  }

  function handleDelete() {
    dispatch({ type: "삭제", id: memo.id });
    navigate("/m");
  }

  return (
    <form onSubmit={handleSave}>
      <p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          size="40"
        />
      </p>
      <p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows="4"
          cols="45"
        />
      </p>
      <button type="submit">저장</button>
      <button type="button" onClick={handleDelete}>
        삭제
      </button>
      {/* ★ type="button" 을 빼면 이 버튼도 폼을 제출합니다. (06단원 개념04) */}
    </form>
  );
}

// ── 새 메모 화면 ──
function MemoNewPage() {
  const { dispatch } = useMemos();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // 공백만 친 것도 빈 것으로 봅니다. (06단원 trim)
    if (title.trim() === "") {
      setMessage("제목을 입력해 주세요");
      return;
    }

    // 여기서 { type, title, body } 처럼 쓰지 않고 이름을 또박또박 적었습니다.
    // 같은 이름일 때 title: title 을 title 하나로 줄여 쓸 수 있는데,
    // 처음 보면 헷갈리므로 이 자료에서는 줄이지 않았습니다.
    dispatch({ type: "추가", title: title.trim(), body: body.trim() });
    navigate("/m");
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          size="40"
        />
      </p>
      <p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows="4"
          cols="45"
          placeholder="내용"
        />
      </p>
      <div className="error">{message}</div>
      <button type="submit">저장</button>
    </form>
  );
}

// 어느 주소에도 안 맞을 때 나오는 화면입니다.
// 이 예제는 왼쪽 메뉴 안에서 도는 작은 앱이라, 처음 골랐을 때의 주소가
// 이 앱이 아는 주소가 아닙니다. 그래서 이 화면이 먼저 보입니다.
function StartHere() {
  return <p>위의 [메모 목록] 을 눌러 시작하세요.</p>;
}

// ============================================================
// 3. 조립
// ============================================================

function MemoApp() {
  return (
    // 예제가 메뉴 안에서 돌기 때문에 파일마다 자기 BrowserRouter 를 가집니다.
    // 진짜 앱에서는 맨 바깥에 딱 한 번만 둡니다. (11단원 개념01)
    <BrowserRouter>
      <MemoProvider>
        <div className="demo">
          <p>
            <Link to="/m">메모 목록</Link> · <Link to="/m/new">새 메모</Link>
          </p>

          {/* [문제 5 정답] 주소 세 개 + 나머지 전부 */}
          <Routes>
            <Route path="/m" element={<MemoListPage />} />
            <Route path="/m/new" element={<MemoNewPage />} />
            {/* ★ /m/new 를 /m/:id 보다 먼저 써야 합니다.
                순서가 바뀌면 "new" 가 :id 로 잡혀서 새 메모 화면이 안 나옵니다. */}
            <Route path="/m/:id" element={<MemoDetailPage />} />
            <Route path="*" element={<StartHere />} />
          </Routes>
        </div>
      </MemoProvider>
    </BrowserRouter>
  );
}

export default function Project04MemoPadAnswer() {
  return (
    <div>
      <h1>종합 04 — 메모장 (정답)</h1>

      <p className="guide">
        <strong>정답 파일입니다.</strong> 먼저 <strong>종합04_메모장.jsx</strong> 를 스스로
        풀어 본 뒤에 보세요.
        <br />
        <br />
        <strong>가장 어려운 것은 문제 6(상세 화면에서 메모 찾기)</strong> 입니다.
        <code>useParams</code> 가 주는 값이 <strong>문자열</strong>이라는 것 하나 때문에
        에러도 경고도 없이 "없는 메모" 가 나옵니다.
        <br />
        <br />
        이 예제 안에서 <strong>새로고침(F5)을 하지 마세요.</strong> 왼쪽 메뉴 선택이
        처음으로 돌아가 예제가 사라집니다. 그때는 메뉴에서 다시 고르면 됩니다.
      </p>

      <MemoApp />

      <Summary
        items={[
          "Context 는 값을 내려보내는 통로, useReducer 는 그 값을 바꾸는 규칙입니다. 둘을 한 Provider 에 묶으면 전역 보관소가 됩니다.",
          "reducer 는 state 를 고치지 않고 새로 만들어 돌려줍니다. push 를 쓰면 화면이 안 바뀝니다.",
          "받아온 데이터로 화면을 만들 때는 로딩·에러·성공 세 갈래를 먼저 가릅니다.",
          "useParams 가 주는 값은 언제나 문자열입니다. 숫자 id 와 비교하려면 Number() 로 바꿉니다.",
          "Link 는 사용자가 누르는 것, useNavigate 는 코드가 보내는 것입니다. 저장한 뒤 이동은 navigate 입니다.",
          "/m/new 처럼 고정된 주소는 /m/:id 보다 먼저 적어야 합니다. 순서가 바뀌면 new 가 id 로 잡힙니다.",
          "없는 번호로 들어왔을 때의 화면을 반드시 만들어 두세요. 안 만들면 빈 화면이 됩니다.",
        ]}
      />
    </div>
  );
}
