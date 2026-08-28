// ============================================================
// 11단원 · 개념 05 — 이동과 없는 페이지
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
// ============================================================
//
// 지금까지 주소를 바꾸는 방법은 <Link> 하나였습니다. 사용자가 눌러야 움직입니다.
// 그런데 사용자가 누르지 않았는데 옮겨야 할 때가 있습니다.
//
//   주문 버튼을 눌렀다 → 값을 검사하고 → 문제가 없으면 완료 화면으로
//   로그인에 성공했다 → 원래 보려던 화면으로
//   3초가 지났다      → 다음 화면으로
//
// 공통점은 "먼저 무언가를 하고, 그 결과에 따라 옮긴다" 입니다.
// <Link> 는 누르면 무조건 갑니다. 중간에 검사를 끼워 넣을 수 없습니다.
// 이럴 때 쓰는 것이 useNavigate 입니다.
//
// 이 파일에서는 그것과 함께, 아무 Route 와도 안 맞는 주소를 어떻게 다룰지도 봅니다.
//
// ★ 이 자료만의 사정: 진짜 앱은 BrowserRouter 를 앱 맨 바깥에 한 번만 둡니다.
//   이 자료는 예제를 왼쪽 메뉴로 골라 보는 구조라 파일마다 하나씩 두었습니다.
//   이 파일이 쓰는 주소 앞머리는 /r5 입니다.
//   이동한 뒤 새로고침(F5)을 하면 왼쪽 메뉴 선택이 풀립니다. 하지 마세요.

import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: useNavigate — 코드로 이동하기 ──

// 쓰는 법은 두 줄입니다.
//
//     const navigate = useNavigate();   // 컴포넌트 맨 위에서 한 번 부릅니다
//     navigate("/r5/done");             // 옮기고 싶은 순간에 부릅니다
//
// useNavigate() 는 '이동시키는 함수' 를 돌려줍니다. 이동을 바로 하지는 않습니다.
// 그래서 컴포넌트 맨 위에서 불러 두고, 이동해야 할 때 그 함수를 부릅니다.
//
// 04단원에서 배운 것과 같은 함정이 있습니다. 훅은 컴포넌트 맨 위에서만 부릅니다.
// 버튼 안에서 useNavigate() 를 부르면 안 됩니다.
//
//     onClick={() => useNavigate()("/r5/done")}   ← 훅 규칙 위반입니다
//
// 아래 데모 ① 은 링크가 아니라 버튼입니다. 눌러 보면 주소가 바뀝니다.
// 화면 생김새는 <Link> 와 다르지만 하는 일은 같습니다.

function MoveButtons() {
  const navigate = useNavigate();

  // 버튼 세 개가 이 함수 하나를 같이 씁니다. 누른 버튼에 따라 path 만 달라집니다.
  function goTo(path) {
    console.log("navigate 로 이동합니다:", path);
    // 콘솔: navigate 로 이동합니다: /r5
    // 콘솔: navigate 로 이동합니다: /r5/search?keyword=케이크
    // 콘솔: navigate 로 이동합니다: /r5/nope
    navigate(path);
  }
  // 위 세 줄은 차례로 [주문 화면으로] · [케이크 검색으로] · [없는 주소로] 를 눌렀을 때입니다.

  return (
    <div className="demo">
      <h3>① 버튼으로 이동하기</h3>
      <p>링크가 아니라 버튼입니다. 누르면 아래 상자와 주소창이 함께 바뀝니다.</p>

      <button onClick={() => goTo("/r5")}>주문 화면으로</button>
      <button onClick={() => goTo("/r5/search?keyword=케이크")}>케이크 검색으로</button>
      <button onClick={() => goTo("/r5/nope")}>없는 주소로</button>
    </div>
  );
}

// ✏️ 직접 해보기 1 — 데모 ① 의 [주문 화면으로] 버튼을 누르고 주소창을 보세요.
//                    링크를 안 눌렀는데도 주소가 바뀌나요?

// ── 섹션 2: 뒤로 가기와 replace ──

// navigate 에 숫자를 넣으면 브라우저의 뒤로/앞으로 가기와 같은 일을 합니다.
//
//     navigate(-1);    // 한 칸 뒤로 (브라우저 뒤로 가기 버튼과 같습니다)
//     navigate(1);     // 한 칸 앞으로
//     navigate(-2);    // 두 칸 뒤로
//
// 주의할 점이 하나 있습니다. 뒤로 갈 곳이 없으면 이 앱 밖으로 나가 버립니다.
// 방금 들어온 사람에게는 '뒤' 가 이 앱이 아니기 때문입니다.
// 그래서 뒤로 가기 버튼은 '앞에서 온 사람만 보는 화면' 에 두는 것이 안전합니다.
// 아래 데모에서도 [뒤로] 버튼은 주문 완료 화면에만 두었습니다.
//
// [replace — 뒤로 가기 기록을 남기지 않기]
// 주소를 바꾸는 방법에는 두 가지가 있습니다.
//
//     navigate("/r5/done");                     // 쌓기  — 뒤로 가면 주문 화면으로 돌아옴
//     navigate("/r5/done", { replace: true });  // 갈아치우기 — 주문 화면이 기록에서 사라짐
//
// 주문 완료 화면에서 뒤로 가기를 눌러 주문 화면으로 돌아가면 어떻게 될까요?
// 사용자가 주문 버튼을 또 누를 수 있습니다. 그래서 이런 화면에는 replace 를 씁니다.
// 데모 ② 에 두 가지 버튼을 다 두었으니 차이를 직접 확인해 보세요.

function OrderScreen() {
  const [item, setItem] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 06단원에서 배운 제어 컴포넌트입니다.
  function handleChange(e) {
    setItem(e.target.value);
  }

  function order(useReplace) {
    // 여기가 <Link> 로는 할 수 없는 부분입니다. 먼저 검사합니다.
    if (item.trim() === "") {
      setError("무엇을 주문할지 적어 주세요");
      return; // 이동하지 않고 여기서 끝냅니다
    }
    setError("");
    // 두 번째 인자로 { replace: true } 를 주면 지금 주소를 갈아치웁니다.
    navigate("/r5/done", { replace: useReplace });
  }

  return (
    <div>
      <h4>주문 화면</h4>
      <input value={item} onChange={handleChange} placeholder="아메리카노" />
      <button onClick={() => order(false)}>주문하기</button>
      <button onClick={() => order(true)}>주문하기 (replace)</button>
      <p className="error">{error}</p>
      <p>빈칸이면 옮겨 가지 않고 안내만 나옵니다.</p>
    </div>
  );
}

// ✏️ 직접 해보기 2 — 데모 ② 의 주문 화면에서 입력칸을 비운 채 [주문하기] 를 눌러 보세요.
//                    화면이 옮겨 가나요?

function DoneScreen() {
  const navigate = useNavigate();

  return (
    <div>
      <h4>주문이 끝났습니다</h4>
      <p>고맙습니다. 잠시만 기다려 주세요.</p>
      <button onClick={() => navigate(-1)}>뒤로</button>
      <button onClick={() => navigate("/r5")}>주문 화면으로</button>
      <p>
        [주문하기] 로 왔으면 [뒤로] 가 주문 화면으로 돌아갑니다.
        <br />
        [주문하기 (replace)] 로 왔으면 주문 화면을 건너뛰고 그 앞으로 갑니다.
      </p>
    </div>
  );
}

// ✏️ 직접 해보기 3 — 주문 화면에서 '라떼' 를 적고 [주문하기] 로 완료 화면에 간 뒤,
//                    [뒤로] 를 눌러 보세요. 어디로 돌아가나요?
//                    그다음 [주문하기 (replace)] 로 다시 가서 [뒤로] 를 눌러 보세요.

// ── 섹션 3: 없는 페이지 — path="*" ──

// 개념01부터 계속 써 온 마지막 줄을 이제 제대로 봅니다.
//
//     <Route path="*" element={<NotFound />} />
//
// * 는 "위의 어느 것과도 안 맞는 모든 주소" 라는 뜻입니다.
// Routes 는 가장 잘 맞는 것을 고르므로, 다른 것이 하나라도 맞으면 * 는 안 골립니다.
// 그래서 * 는 어디에 적어도 됩니다. 맨 아래에 적는 것은 읽기 편해서일 뿐입니다.
//
// 이것이 없으면 그 자리가 조용히 텅 빕니다. 화면에는 아무 표시가 없고
// 콘솔에 노란 경고 한 줄만 나옵니다.
//
//     No routes matched location "/r5/nope"
//
// 사용자는 콘솔을 안 봅니다. 그러니 * 는 늘 넣어 두세요.
//
// [지금 주소를 알아내기 — useLocation]
// 안내를 잘 하려면 "무엇이 잘못됐는지" 를 보여 주는 것이 좋습니다.
//
//     const location = useLocation();
//     location.pathname   // "/r5/nope"
//     location.search     // "?keyword=케이크"  (없으면 빈 문자열 "")
//
// useLocation 도 훅입니다. 컴포넌트 맨 위에서, BrowserRouter 안에서 씁니다.
//
// [알아 둘 것 하나]
// 이 404 화면은 서버가 만든 것이 아닙니다. 서버는 정상 응답을 보냈고,
// 그것을 받은 우리 앱이 "이런 주소는 없다" 고 판단해서 보여 준 것입니다.
// 그래서 브라우저 개발자 도구의 Network 탭에는 빨간 404 가 안 보입니다.

function NotFound() {
  const location = useLocation();

  return (
    <div>
      <h4>없는 페이지입니다</h4>
      <p>
        요청한 주소: <strong>{location.pathname}</strong>
      </p>
      <p>주소를 다시 확인해 주세요.</p>
      <p>
        <Link to="/r5">주문 화면으로 돌아가기</Link>
      </p>
    </div>
  );
}

// ✏️ 직접 해보기 4 — 데모 ① 의 [없는 주소로] 를 누른 뒤,
//                    화면에 나오는 '요청한 주소' 를 확인하세요.

// ── 섹션 4: 쿼리스트링 맛보기 ──

// 주소에는 물음표 뒤에 값을 더 붙일 수 있습니다. 이것을 쿼리스트링이라고 합니다.
//
//     /r5/search?keyword=라떼
//     /r5/search?keyword=라떼&sort=price
//
//   ?  여기부터 쿼리스트링이라는 표시
//   =  이름과 값을 잇는 것
//   &  값이 여러 개일 때 사이에 넣는 것
//
// 개념03의 :id 와 무엇이 다를까요? 두 가지가 다릅니다.
//
//   [1] Route 에 등록하지 않습니다.
//       Route 는 /r5/search 하나면 됩니다. ?keyword=무엇이든 다 이 Route 로 옵니다.
//
//   [2] 없어도 됩니다.
//       /r5/search 만 와도 Route 는 맞습니다. keyword 만 없을 뿐입니다.
//
// 그래서 이렇게 나눠 씁니다.
//
//   :id      — 그 화면이 '무엇에 대한 것인지' 를 정하는 값 (없으면 화면이 성립 안 됨)
//   ?검색어  — 화면은 같고 '조건' 만 다를 때 (없어도 화면은 성립함)
//
// 꺼내는 법은 useSearchParams 입니다.
//
//     const [searchParams] = useSearchParams();
//     const keyword = searchParams.get("keyword");
//
// useState 처럼 배열을 돌려줍니다. 두 번째 자리에는 값을 바꾸는 함수가 있습니다.
// 여기서는 읽기만 할 것이라 첫 번째만 꺼냈습니다.
//
// get 은 없는 이름을 물으면 null 을 돌려줍니다. 빈 문자열이 아니라 null 입니다.
// 그리고 개념03과 똑같이, 있는 값은 언제나 문자열입니다.

function SearchScreen() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const sort = searchParams.get("sort");

  return (
    <div>
      <h4>검색 화면</h4>
      <p>
        keyword: <strong>{String(keyword)}</strong> (타입: {typeof keyword})
      </p>
      <p>
        sort: <strong>{String(sort)}</strong> (타입: {typeof sort})
      </p>

      {/* keyword 가 없을 때와 있을 때를 나눠 그립니다. 05단원 조건부 렌더링입니다. */}
      {keyword === null ? (
        <p>검색어가 없습니다. 주소 끝에 ?keyword=라떼 를 붙여 보세요.</p>
      ) : (
        <p>'{keyword}' 로 찾은 결과가 여기 나옵니다.</p>
      )}

      <p>
        <Link to="/r5/search?keyword=라떼">라떼</Link> |{" "}
        <Link to="/r5/search?keyword=케이크&sort=price">케이크 + 가격순</Link> |{" "}
        <Link to="/r5/search">검색어 없이</Link>
      </p>
    </div>
  );
}

// ✏️ 직접 해보기 5 — 검색 화면에서 '검색어 없이' 를 눌러 보세요.
//                    keyword 의 값과 타입이 무엇으로 나오나요?

// ✏️ 직접 해보기 6 — 검색 화면에서 '케이크 + 가격순' 을 눌러 보세요.
//                    sort 에 무엇이 들어오나요? 주소의 & 뒤에 적은 것과 대 보세요.

function Demo() {
  return (
    <BrowserRouter>
      <MoveButtons />

      <div className="demo">
        <h3>② 화면</h3>

        <nav>
          <Link to="/r5">주문 화면</Link> |{" "}
          <Link to="/r5/search?keyword=라떼">검색 (라떼)</Link> |{" "}
          <Link to="/r5/nope">없는 주소</Link>
        </nav>

        <div className="output">
          <Routes>
            <Route path="/r5" element={<OrderScreen />} />
            <Route path="/r5/done" element={<DoneScreen />} />
            <Route path="/r5/search" element={<SearchScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

// ── 섹션 5: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] useNavigate 를 부르지 않고 바로 쓴다  — [런타임 에러]
//
//     <button onClick={() => navigate("/r5/done")}>주문</button>
//     // 위에 const navigate = useNavigate(); 가 없음
//
// 실수: "navigate is not defined" 로 화면이 터집니다.
//       useNavigate 는 '이동시키는 함수를 만들어 주는 것' 입니다.
//       만들어 받아 두지 않으면 쓸 함수가 없습니다.

// [실수 2] navigate 를 부르는 것을 잊고 함수만 넘긴다  — [조용히 틀림]
//
//     onClick={navigate}
//
// 실수: 눌러도 아무 데도 안 갑니다. 에러도 없습니다.
//       onClick 이 navigate 를 부를 때 클릭 이벤트 객체를 넘기는데,
//       navigate 는 그것을 주소로 이해하지 못합니다.
//       onClick={() => navigate("/r5")} 처럼 감싸서 주소를 직접 적으세요.

// [실수 3] 훅을 조건문이나 이벤트 안에서 부른다  — [런타임 에러]
//
//     function order() {
//       const navigate = useNavigate();   // 함수 안에서 부름
//       navigate("/r5/done");
//     }
//
// 실수: "Invalid hook call" 또는 "Rendered more hooks than during the previous render"
//       가 납니다. 10단원 개념04에서 배운 훅의 규칙 그대로입니다.
//       훅은 컴포넌트 맨 위에서만 부릅니다.

// [실수 4] path="*" 를 안 둔다  — [조용히 틀림]
//
// 실수: 없는 주소로 가면 그 자리가 텅 빕니다. 화면에는 아무 표시가 없습니다.
//       콘솔에만 No routes matched location "..." 이 나옵니다.
//       사용자는 콘솔을 안 봅니다. 빈 화면을 보고 고장났다고 생각합니다.

// [실수 5] 쿼리스트링을 Route 의 path 에 적는다  — [조용히 틀림]
//
//     <Route path="/r5/search?keyword=라떼" element={<SearchScreen />} />
//
// 실수: 이 Route 는 영영 안 맞습니다. path 는 물음표 앞부분만 봅니다.
//       쿼리스트링은 Route 가 아니라 useSearchParams 로 다룹니다.

// [실수 6] Route 를 닫는 / 를 빠뜨린다  — [SyntaxError]
//
//     <Route path="*" element={<NotFound />}>
//
// 실수: 파일 전체가 안 돌아가고 화면이 통째로 빕니다.
//       자식이 없는 Route 는 스스로 닫는 태그입니다. 끝을 /> 로 맺어야 합니다.
//       > 로만 맺으면 "여기부터 자식이 온다" 는 뜻이 되어 닫는 태그를 기다립니다.

// [실수 7] searchParams.get 의 결과를 숫자로 그냥 쓴다  — [조용히 틀림]
//
//     const page = searchParams.get("page");   // "2" 입니다
//     const next = page + 1;                   // "21" 이 됩니다
//
// 실수: 개념03의 useParams 와 똑같습니다. 주소에서 온 값은 전부 문자열입니다.
//       숫자로 쓸 것이면 Number(page) 로 바꾸세요.

export default function Concept05NavigateAndNotFound() {
  return (
    <div>
      <h1>개념 05 — 이동과 없는 페이지</h1>

      <p className="guide">
        데모 ① 은 <strong>링크가 아니라 버튼</strong>입니다. 눌러 보면 주소창이 바뀝니다.
        코드로 옮기는 것이 useNavigate 입니다.
        <br />
        <br />
        데모 ② 의 주문 화면에서 <strong>입력칸을 비운 채</strong> [주문하기] 를 눌러 보세요.
        옮겨 가지 않습니다. 이렇게 검사를 끼워 넣을 수 있는 것이 <code>&lt;Link&gt;</code>
        와의 차이입니다.
        <br />
        <br />이 예제에서는 <strong>새로고침(F5)을 하지 마세요.</strong> 왼쪽 메뉴 선택이
        풀려서 다른 예제가 열립니다. 그때는 왼쪽 메뉴에서 다시 고르면 됩니다.
      </p>

      <Demo />

      <Summary
        items={[
          "코드로 주소를 옮길 때는 useNavigate 를 씁니다. 검사한 뒤에 옮길 수 있습니다.",
          "const navigate = useNavigate(); 를 컴포넌트 맨 위에서 부르고, 옮길 때 navigate(\"/주소\") 를 부릅니다.",
          "navigate(-1) 은 뒤로 가기입니다. 뒤가 없으면 앱 밖으로 나가므로 둘 자리를 고르세요.",
          "navigate(\"/주소\", { replace: true }) 는 지금 주소를 갈아치웁니다. 뒤로 가도 안 돌아옵니다.",
          "path=\"*\" 는 아무 Route 와도 안 맞는 주소를 받습니다. 없으면 화면이 조용히 빕니다.",
          "useLocation() 으로 지금 주소(pathname)를 꺼내 안내에 보여 줄 수 있습니다.",
          "물음표 뒤의 쿼리스트링은 Route 에 안 적습니다. useSearchParams 의 get 으로 꺼냅니다. 없으면 null 입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 주소창이 /r5 로 바뀝니다.
//    화면: 아래 상자가 주문 화면으로 바뀝니다.
//    콘솔: navigate 로 이동합니다: /r5
//    → 링크를 안 눌렀는데도 주소가 바뀌었습니다.
//      <Link> 가 하던 일을 코드로 한 것입니다. 결과는 완전히 같습니다.
//      브라우저 뒤로 가기도 <Link> 로 갔을 때와 똑같이 동작합니다.
//
// 2) 옮겨 가지 않습니다.
//    화면: 빨간 글씨로 "무엇을 주문할지 적어 주세요" 가 나오고 주소는 /r5 그대로입니다.
//    → order 함수가 item 을 검사하고 return 으로 먼저 끝냈기 때문입니다.
//      <Link> 였다면 검사할 틈 없이 그냥 옮겨 갔을 것입니다.
//
// 3) [주문하기] 로 갔을 때는 주문 화면(/r5)으로 돌아옵니다.
//    화면: 입력칸에 적었던 '라떼' 는 사라지고 빈칸입니다.
//         (주문 화면 컴포넌트가 새로 만들어져서 state 가 처음 값으로 돌아갑니다)
//    [주문하기 (replace)] 로 갔을 때는 주문 화면으로 안 돌아옵니다.
//    화면: 그 전에 보던 화면(검색 화면이나 안내 화면)으로 건너뜁니다.
//    → replace 는 기록을 쌓지 않고 지금 것을 갈아치우기 때문입니다.
//
// 4) 요청한 주소: /r5/nope
//    화면: "없는 페이지입니다" 와 함께 주소가 그대로 보입니다.
//    → useLocation() 이 준 location.pathname 값입니다.
//      주소에 물음표 뒤가 있었다면 그 부분은 location.search 에 따로 들어갑니다.
//
// 5) keyword: null (타입: object)
//    화면: "검색어가 없습니다. 주소 끝에 ?keyword=라떼 를 붙여 보세요."
//    → get 은 없는 이름을 물으면 null 을 돌려줍니다.
//      typeof null 이 "object" 로 나오는 것은 자바스크립트의 오래된 성질입니다.
//      JS자료 01단원에서 한 번 나왔습니다. null 은 여전히 '값이 없다' 는 뜻입니다.
//
// 6) sort: price (타입: string)
//    화면: keyword: 케이크 (타입: string) / sort: price (타입: string)
//    → 주소의 &sort=price 에서 온 값입니다. 숫자처럼 생긴 값이 와도 문자열입니다.
