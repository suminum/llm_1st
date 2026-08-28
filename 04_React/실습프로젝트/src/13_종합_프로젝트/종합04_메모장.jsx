// ============================================================
// 13단원 · 종합 04 — 메모장
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 이 자료의 마지막 실습입니다. 09 · 11 · 12단원을 한자리에 모읍니다.
//
//   서버에서 메모를 받아오고(09)  →  보관소에 담고(12)
//   →  목록 · 상세 · 새 메모 세 화면을 오갑니다(11)
//
// [쓰는 단원]
//   09 useEffect · fetch · 로딩/에러
//   11 Router · Link · useParams · useNavigate
//   12 Context · useReducer
//   06 제어 컴포넌트 / 07 불변 갱신
//
// ★ 이 실습에서 가장 어려운 것은 문제 6 입니다.
//   고칠 글자는 여덟 자뿐입니다. 어려운 것은 **에러도 경고도 안 난다**는 점입니다.
//   화면은 멀쩡히 나오는데 메모만 안 찾아집니다. 원인을 스스로 찾아보세요.
//
// ★ 이 예제 안에서는 새로고침(F5)을 하지 마세요.
//   왼쪽 메뉴 선택이 처음으로 돌아가서 이 예제가 화면에서 사라집니다.
//   그때는 왼쪽 메뉴에서 이 예제를 다시 고르면 됩니다.
//
// ★★ 인터넷 연결이 필요합니다.
//   막힌 곳이라면 실습프로젝트 폴더의 index.html 을 열고
//   <script src="/오프라인_대체.js"> 줄을 감싼 주석 기호만 지우세요.
//   인터넷 요청 0건으로 똑같은 값이 나옵니다.
//
// [푸는 법]
//   1) 아래로 내려가며 // TODO 를 찾아 고칩니다.
//   2) 저장하면 화면이 저절로 바뀝니다(Vite). F5 를 누르지 마세요.
//   3) 화면 위의 [메모 목록] / [새 메모] 를 눌러 확인하세요.
//
// ★ 아직 아무것도 안 고친 지금도 화면은 나옵니다.
//   [메모 목록] 을 누르면 "메모가 하나도 없습니다" 가 보입니다. 정상입니다.

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

// reducer 는 "지금 상태 + 무슨 일 = 새 상태" 를 적는 함수입니다.
// 규칙이 하나 있습니다. state 를 고치지 말고 **새로 만들어** 돌려주세요. (07단원)
function memoReducer(state, action) {
  switch (action.type) {
    case "채우기":
      // 서버에서 받아온 것으로 통째로 갈아 끼웁니다. (이건 이미 되어 있습니다)
      return action.memos;

    // ───── 문제 1 ───── 메모 추가하기
    // action 에는 { type: "추가", title, body } 가 들어옵니다.
    // 새 메모를 만들어 목록 **맨 앞**에 붙인 새 배열을 돌려주세요.
    //   - 번호(id)는 지금 있는 것 중 가장 큰 번호 + 1 로 정합니다.
    //   - 목록이 비어 있으면 1 번으로 합니다.
    //     (Math.max() 를 빈 배열에 쓰면 -Infinity 가 나옵니다)
    //
    // 기대 결과 (화면): [새 메모] 에서 "케이크 사기" 를 저장하면
    //                  목록 맨 위에 "케이크 사기" 가 생기고 개수가 1 늘어납니다.
    //                  저장했는데 목록이 그대로면 이 문제를 아직 안 푼 것입니다.
    //                  맨 아래에 생겼다면 [...state, 새것] 순서로 쓴 것입니다.
    case "추가":
      // TODO: 여기를 고치세요
      return state;

    // ───── 문제 2 ───── 메모 삭제하기
    // action 에는 { type: "삭제", id } 가 들어옵니다.
    // 그 번호만 뺀 새 배열을 돌려주세요. (07단원 filter)
    //
    // 기대 결과 (화면): 메모를 열어 [삭제] 를 누르면 목록에서 사라지고
    //                  개수가 1 줄어듭니다. 그대로면 아직 안 푼 것입니다.
    case "삭제":
      // TODO: 여기를 고치세요
      return state;

    // ───── 문제 3 ───── 메모 수정하기
    // action 에는 { type: "수정", id, title, body } 가 들어옵니다.
    // 번호가 같은 것 하나만 새 내용으로 바꾼 새 배열을 돌려주세요.
    //   - map 으로 전부 훑으면서, 번호가 같을 때만 바꿉니다. (07단원)
    //   - { ...m, title: ..., body: ... } 를 쓰면 나머지 칸은 그대로 둡니다.
    //
    // 기대 결과 (화면): 목록에서 메모를 열어 제목을 고치고 [저장] 을 누르면
    //                  목록의 제목이 바뀌어 있습니다.
    //                  제목이 그대로면 이 문제를 아직 안 푼 것입니다.
    case "수정":
      // TODO: 여기를 고치세요
      return state;

    default:
      return state;
  }
}

function MemoProvider({ children }) {
  const [memos, dispatch] = useReducer(memoReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false; // 09단원 개념05의 깃발입니다. 이미 넣어 두었습니다.

    async function loadMemos() {
      // ───── 문제 4 ───── 서버에서 메모 5개 받아오기
      // 아래 순서로 채우세요. (09단원 개념03·04)
      //   ① `${BASE_URL}/posts?_limit=5` 를 await fetch 로 부릅니다.
      //   ② if (!res.ok) 이면 throw new Error(...) 로 실패로 만듭니다.
      //      ★ fetch 는 404 를 실패로 치지 않습니다. 이 줄이 있어야 실패가 됩니다.
      //   ③ await res.json() 으로 값을 꺼냅니다.
      //   ④ if (ignore) return; 으로 늦게 온 응답을 버립니다.
      //   ⑤ dispatch({ type: "채우기", memos: ... }) 로 보관소에 넣습니다.
      //      서버가 주는 모양은 { userId, id, title, body } 입니다.
      //      우리에게 필요한 것은 id · title · body 세 칸뿐이니 map 으로 골라 담으세요.
      //   ⑥ 실패하면 catch 에서 setError(e.message) 를 합니다.
      //   ⑦ 아래 setLoading(false) 를 finally 안으로 옮깁니다.
      //      ★ try 안에 두면 실패했을 때 영원히 "불러오는 중" 이 됩니다.
      //
      // 기대 결과 (화면): [메모 목록] 에 "메모 5개" 와 제목 5줄이 나옵니다.
      //                  첫 줄은 sunt aut facere ... 로 시작합니다.
      // 기대 결과 (콘솔): 메모를 받아왔습니다: 5
      //                  (개발 중에는 두 번 찍힐 수 있습니다. 09단원 개념02의 StrictMode 입니다)

      // TODO: 여기에 코드를 쓰세요

      setLoading(false); // ← 문제 4를 풀면 이 줄은 finally 안으로 들어갑니다
    }

    loadMemos();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <MemoContext.Provider value={{ memos, dispatch, loading, error }}>
      {children}
    </MemoContext.Provider>
  );
}

// Context 를 꺼내는 일을 커스텀 훅으로 감쌌습니다. (10단원)
function useMemos() {
  return useContext(MemoContext);
}

// ============================================================
// 2. 화면들
// ============================================================

// ── 목록 화면 ── (이미 되어 있습니다)
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

  // ───── 문제 6 ───── 주소의 번호로 메모 찾기   ★ 이 파일에서 가장 어렵습니다
  // 아래 줄은 **일부러 틀리게** 써 두었습니다. 고치세요.
  //
  // 힌트: 콘솔에 찍히는 줄을 보세요. id 가 무슨 자료형인지 나옵니다.
  //       주소는 글자입니다. 그래서 useParams 가 주는 값은 언제나 문자열입니다.
  //       반면 memo.id 는 숫자입니다. JS자료 11단원의 dataset 함정과 같습니다.
  //
  // 기대 결과 (화면): 목록에서 메모를 누르면 입력칸에 제목과 내용이 채워집니다.
  //                  입력칸이 비어 있고 "…번 메모는 없습니다" 가 나오면
  //                  아직 못 찾은 것입니다. 에러도 경고도 안 나니 주의하세요.
  //
  // TODO: 아래 줄을 고치세요
  const memo = memos.find((m) => m.id === id);

  // (상세 화면에 들어가면) 콘솔: 주소에서 받은 id: 3 string
  console.log("주소에서 받은 id:", id, typeof id);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // 메모를 찾으면 입력칸을 채웁니다. (이미 되어 있습니다)
  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setBody(memo.body);
    }
  }, [memo]);

  if (loading) return <p>불러오는 중…</p>;

  // ───── 문제 8 ───── 없는 번호로 들어왔을 때
  // 지금은 임시 문구가 나옵니다. 아래 두 가지가 보이게 고치세요.
  //   ① "{id}번 메모는 없습니다" (빨간 글씨 — className="error")
  //   ② 목록으로 돌아가는 Link
  //
  // 기대 결과 (화면): 주소창에 .../m/9999 를 넣으면
  //                  9999번 메모는 없습니다  +  [목록으로 돌아가기] 링크
  //                  ★ 문제 6을 아직 안 풀었다면 모든 메모가 여기로 옵니다.
  //
  // TODO: 아래 return 을 고치세요
  if (!memo) {
    return <p>(문제 8) 여기에 안내를 넣으세요</p>;
  }

  function handleSave(e) {
    e.preventDefault(); // 06단원 — 새로고침 막기
    dispatch({ type: "수정", id: memo.id, title: title, body: body });

    // ───── 문제 7 ───── 저장한 뒤 목록으로 보내기
    // 위에 만들어 둔 navigate 를 써서 "/m" 으로 보내세요. (11단원 개념05)
    // Link 는 사용자가 '누르는' 것이고, navigate 는 코드가 '보내는' 것입니다.
    //
    // 기대 결과 (화면): [저장] 을 누르면 곧바로 목록 화면으로 돌아갑니다.
    //                  상세 화면에 그대로 머물러 있으면 아직 안 푼 것입니다.
    // TODO: 여기에 코드를 쓰세요
  }

  function handleDelete() {
    dispatch({ type: "삭제", id: memo.id });
    // TODO: 문제 7 — 여기도 목록으로 보내세요
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

// ── 새 메모 화면 ── (이미 되어 있습니다)
function MemoNewPage() {
  const { dispatch } = useMemos();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === "") {
      setMessage("제목을 입력해 주세요");
      return;
    }

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

          {/* ───── 문제 5 ───── 주소 두 개 더 등록하기
              지금은 목록 화면만 등록돼 있습니다. 두 줄을 더 넣으세요.
                ① /m/new     → <MemoNewPage />
                ② /m/:id     → <MemoDetailPage />
              ★ 순서에 주의하세요. /m/new 를 /m/:id 보다 **먼저** 써야 합니다.
                반대로 쓰면 "new" 가 :id 로 잡혀서 새 메모 화면이 안 나옵니다.

              기대 결과 (화면): [새 메모] 를 누르면 입력 폼이 나오고,
                               목록에서 제목을 누르면 상세 화면이 나옵니다.
                               "위의 [메모 목록] 을 눌러 시작하세요" 가 나오면
                               그 주소가 아직 등록되지 않은 것입니다.
              TODO: 아래 Routes 안에 두 줄을 넣으세요 */}
          <Routes>
            <Route path="/m" element={<MemoListPage />} />
            <Route path="*" element={<StartHere />} />
          </Routes>
        </div>
      </MemoProvider>
    </BrowserRouter>
  );
}

export default function Project04MemoPad() {
  return (
    <div>
      <h1>종합 04 — 메모장</h1>

      <p className="guide">
        <code>// TODO</code> 를 찾아 코드를 쓰고 저장하세요. 저장하면 화면이 저절로
        바뀝니다. <strong>F5 를 누르지 마세요.</strong>
        <br />
        <br />
        <strong>가장 어려운 것은 문제 6</strong> 입니다. 고칠 글자는 여덟 자뿐인데,
        <strong>에러도 경고도 나지 않아서</strong> 원인을 찾기가 어렵습니다.
        <br />
        <br />
        막히면 <strong>종합04_메모장_정답.jsx</strong> 를 보세요. 다만 먼저 10분은 혼자
        고민해 보세요.
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
