// ============================================================
// 11단원 연습문제 정답 — React Router
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//
// 먼저 스스로 풀어 본 다음에 비교하세요.
// 답이 하나뿐인 문제는 아닙니다. 결과가 같으면 다른 방법도 맞습니다.
//
// ★ 이 파일이 쓰는 주소 앞머리는 /a 입니다. 연습문제 파일(/q)과 겹치지 않게 나눴습니다.
//   주소를 옮긴 뒤에는 새로고침(F5)을 하지 마세요.
//   왼쪽 메뉴 선택이 풀려서 다른 예제가 열립니다. 그때는 메뉴에서 다시 고르면 됩니다.
// ============================================================

import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Summary from "../_ui/Summary.jsx";

const menuItems = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// ───── 문제 1 정답 ───── (개념01)
// Routes 안에 이 한 줄을 넣습니다. 위치는 어디든 상관없습니다.
//
//     <Route path="/a/about" element={<AboutPage />} />
//
// 화면: '소개' 를 누르면 "2020년에 문을 연 작은 카페입니다"
// → Routes 는 순서대로 훑는 것이 아니라 가장 잘 맞는 것을 고릅니다.

function AboutPage() {
  return <p>2020년에 문을 연 작은 카페입니다.</p>;
}

// ───── 문제 2 정답 ───── (개념01)
// element 에는 컴포넌트가 아니라 JSX 를 바로 넣어도 됩니다.
//
//     <Route path="/a/hours" element={<p>10시부터 22시까지 엽니다</p>} />
//
// 화면: '영업시간' 을 누르면 "10시부터 22시까지 엽니다"
// → 화면이 짧을 때는 이렇게 쓰는 것이 간단합니다.
//   길어지면 컴포넌트로 빼는 것이 읽기 좋습니다.

// ───── 문제 3 정답 ───── (개념02)
//     <a href="/a/menu">메뉴(a)</a>   →   <Link to="/a/menu">메뉴</Link>
//
// 화면: 카운터를 3으로 올린 뒤 눌러도 3 그대로입니다
// → <a> 는 페이지를 서버에서 새로 받아 오므로 React 가 다시 시작합니다.
//   그러면 state 인 카운터도, 왼쪽 메뉴 선택도 전부 처음으로 돌아갑니다.
//   <Link> 는 주소만 바꾸고 그 자리만 다시 그립니다.

// ───── 문제 4 정답 ───── (개념02)
//     <NavLink to="/a" end className={({ isActive }) => (isActive ? "on" : "")}>
//       홈
//     </NavLink>
//
// 화면: 주소가 /a 일 때만 '홈' 에 파란 배경이 들어옵니다
// → end 가 없으면 /a/about 처럼 /a 로 시작하는 모든 주소에서 켜집니다.
//   isActive 는 NavLink 가 함수를 부르면서 넘겨 주는 값이라 함수로 받아야 합니다.

// ───── 문제 5 정답 ───── (개념03)

function MenuList() {
  return (
    <div>
      <p>메뉴를 눌러 보세요.</p>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            {/* 값을 끼워 넣을 때는 백틱 문자열을 씁니다. 큰따옴표로는 안 됩니다. */}
            <Link to={`/a/menu/${item.id}`}>
              {item.name} {item.price}원
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 화면: 네 줄이 나오고, '라떼' 를 누르면 주소가 /a/menu/2 가 됩니다
// → key 는 05단원에서 배운 그대로입니다. id 가 있으니 id 를 씁니다.

// ───── 문제 6 정답 ───── (개념03)
//     <Route path="/a/menu/:id" element={<MenuDetail />} />
//
// 화면: 목록에서 아무 메뉴나 누르면 상세 화면이 나옵니다
// → :id 의 콜론이 "여기는 아무 값이나 온다" 는 표시입니다.
//   콜론을 빼면 /a/menu/id 라는 주소일 때만 맞습니다.

// ───── 문제 7 · 문제 8 정답 ───── (개념03)

function MenuDetail() {
  // 문제 7 — useParams 로 꺼냅니다. 이름은 path 에 적은 :id 와 같아야 합니다.
  const { id } = useParams();

  // 문제 8 — menuItems 의 id 는 숫자라서 Number 로 바꿔서 비교합니다.
  const found = menuItems.find((item) => item.id === Number(id));

  return (
    <div>
      <h4>상세 화면</h4>

      <p>
        받은 id: <strong>{id}</strong> (타입: {typeof id})
      </p>

      {/* 못 찾았을 때를 먼저 처리합니다. 안 하면 found.name 에서 화면이 터집니다. */}
      {found ? (
        <p>
          <strong>
            {found.name} {found.price}원
          </strong>
        </p>
      ) : (
        <p>그런 메뉴가 없습니다.</p>
      )}

      <p>
        <Link to="/a/menu">← 목록으로</Link>
      </p>
    </div>
  );
}

// 화면: '라떼' → 받은 id: 2 (타입: string) / 라떼 4500원
// 화면: '없는 메뉴(99)' → 받은 id: 99 (타입: string) / 그런 메뉴가 없습니다
// → 주소는 글자라서 useParams 가 주는 값은 언제나 문자열입니다.
//   item.id === id 로 비교하면 2 와 "2" 를 견주게 되어 늘 못 찾습니다.

// ───── 문제 9 정답 ───── (개념04)

function ShopLayout() {
  return (
    <div>
      <h4>민준이네 카페</h4>
      <nav>
        <Link to="/a/shop">가게 홈</Link> | <Link to="/a/shop/notice">공지</Link>
      </nav>
      <div className="output">
        {/* 자식 Route 의 화면이 이 자리에 들어옵니다 */}
        <Outlet />
      </div>
    </div>
  );
}

// 화면: '공지' 를 누르면 껍데기 아래에 "이번 주 화요일은 쉽니다"
// → Outlet 이 없으면 껍데기만 계속 나옵니다. 에러도 경고도 없어서 찾기 어렵습니다.

// ───── 문제 10 정답 ───── (개념04)
//     <Route path="/a/shop" element={<ShopLayout />}>
//       <Route index element={<ShopHome />} />
//       <Route path="notice" element={<ShopNotice />} />
//     </Route>
//
// 화면: '가게' 를 누르면 "어서 오세요. 위에서 골라 보세요"
// → index 는 "부모 주소와 딱 맞을 때" 라는 뜻입니다. path 를 적지 않습니다.
//   index 가 없으면 /a/shop 에서 껍데기만 나오고 가운데가 빕니다.

function ShopHome() {
  return <p>어서 오세요. 위에서 골라 보세요.</p>;
}

function ShopNotice() {
  return <p>이번 주 화요일은 쉽니다.</p>;
}

// ───── 문제 11 정답 ───── [응용] (개념05)

function OrderScreen() {
  const [item, setItem] = useState("");
  const [error, setError] = useState("");

  // 훅은 컴포넌트 맨 위에서 부릅니다. handleOrder 안에서 부르면 안 됩니다.
  const navigate = useNavigate();

  function handleOrder() {
    // 먼저 검사하고, 문제가 있으면 이동하지 않고 끝냅니다.
    if (item.trim() === "") {
      setError("무엇을 주문할지 적어 주세요");
      return;
    }
    setError("");
    navigate("/a/done");
  }

  return (
    <div>
      <h4>주문 화면</h4>
      <input
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="아메리카노"
      />
      <button onClick={handleOrder}>주문하기</button>
      <p className="error">{error}</p>
    </div>
  );
}

function DoneScreen() {
  return <p>주문이 끝났습니다. 고맙습니다.</p>;
}

// 화면: 빈칸에서 누르면 주소는 /a/order 그대로이고 "무엇을 주문할지 적어 주세요"
// 화면: '라떼' 를 적고 누르면 주소가 /a/done 이 되고 "주문이 끝났습니다"
// → 이것이 <Link> 로는 할 수 없는 일입니다. Link 는 누르면 무조건 갑니다.
//   trim() 을 쓴 이유는 공백만 친 경우도 막기 위해서입니다(06단원).

// ───── 문제 12 정답 ───── [도전] (개념05 + 개념03)

function SearchScreen() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");

  // 검색어가 없으면 null 입니다. 빈 문자열이 아닙니다.
  if (keyword === null) {
    return (
      <div>
        <h4>검색 화면</h4>
        <p>검색어가 없습니다.</p>
      </div>
    );
  }

  // includes 는 그 글자가 들어 있으면 true 입니다(JS자료 06단원).
  const found = menuItems.filter((item) => item.name.includes(keyword));

  return (
    <div>
      <h4>검색 화면</h4>
      <p>'{keyword}' 로 찾은 결과</p>

      {found.length === 0 ? (
        <p>찾은 메뉴가 없습니다.</p>
      ) : (
        <ul>
          {found.map((item) => (
            <li key={item.id}>
              {item.name} {item.price}원
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 화면: '검색(라)' → 라떼 4500원 한 줄
// 화면: '검색(김)' → 삼각김밥 1200원 한 줄
// 화면: '검색(없이)' → 검색어가 없습니다
// → 검색어는 Route 에 등록하지 않았습니다. Route 는 /a/search 하나뿐입니다.
//   조건만 바뀌는 것이라 쿼리스트링으로 받는 것이 맞습니다.
//   found.length === 0 을 && 대신 삼항으로 쓴 이유는 05단원의 0 함정 때문입니다.

function NoRoute() {
  return <p>이 예제가 아는 주소가 아닙니다. 위의 링크를 눌러 보세요.</p>;
}

function AnswerApp() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className="demo">
        <h3>정답 화면</h3>

        <p>
          카운터: <strong>{count}</strong>{" "}
          <button onClick={() => setCount(count + 1)}>+1</button>
        </p>

        <nav>
          {/* 문제 4 — 홈만 NavLink 입니다 */}
          <NavLink to="/a" end className={({ isActive }) => (isActive ? "on" : "")}>
            홈
          </NavLink>{" "}
          | <Link to="/a/about">소개</Link> | <Link to="/a/hours">영업시간</Link> |{" "}
          {/* 문제 3 — <a> 를 Link 로 바꿨습니다 */}
          <Link to="/a/menu">메뉴</Link> | <Link to="/a/menu/99">없는 메뉴(99)</Link>
          <br />
          <Link to="/a/shop">가게</Link> | <Link to="/a/order">주문</Link> |{" "}
          <Link to="/a/search?keyword=라">검색(라)</Link> |{" "}
          <Link to="/a/search?keyword=김">검색(김)</Link> |{" "}
          <Link to="/a/search">검색(없이)</Link> |{" "}
          <Link to="/a/nope">없는 주소</Link>
        </nav>

        <div className="output">
          <Routes>
            <Route path="/a" element={<p>홈 — 어서 오세요.</p>} />
            <Route path="/a/menu" element={<MenuList />} />

            {/* 문제 1 */}
            <Route path="/a/about" element={<AboutPage />} />
            {/* 문제 2 */}
            <Route path="/a/hours" element={<p>10시부터 22시까지 엽니다</p>} />
            {/* 문제 6 */}
            <Route path="/a/menu/:id" element={<MenuDetail />} />

            <Route path="/a/shop" element={<ShopLayout />}>
              {/* 문제 10 */}
              <Route index element={<ShopHome />} />
              <Route path="notice" element={<ShopNotice />} />
            </Route>

            <Route path="/a/order" element={<OrderScreen />} />
            <Route path="/a/done" element={<DoneScreen />} />
            <Route path="/a/search" element={<SearchScreen />} />

            <Route path="*" element={<NoRoute />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function Practice11RouterAnswer() {
  return (
    <div>
      <h1>11단원 연습문제 정답 — React Router</h1>

      <p className="guide">
        먼저 스스로 풀어 본 다음에 보세요. 각 문제의 풀이는 이 파일의 주석에 문제 번호
        순서로 적어 두었습니다.
        <br />
        <br />
        <strong>주소를 옮긴 뒤 새로고침(F5)을 하지 마세요.</strong> 왼쪽 메뉴 선택이 풀려서
        다른 예제가 열립니다. 그때는 왼쪽 메뉴에서 다시 고르면 됩니다.
      </p>

      <AnswerApp />

      <Summary
        items={[
          "Route 는 path 와 element 의 짝입니다. element 에는 JSX 를 넣습니다.",
          "앱 안에서 옮길 때는 <Link>, 다른 사이트로 갈 때는 <a> 입니다.",
          "NavLink 는 isActive 를 함수로 넘겨 줍니다. 짧은 주소에는 end 를 붙입니다.",
          "useParams 가 주는 값은 언제나 문자열입니다. 숫자와 비교하려면 Number() 로 바꿉니다.",
          "중첩 라우트는 부모의 <Outlet /> 자리에 자식이 들어갑니다. 부모 주소용 화면은 index 입니다.",
          "검사한 뒤에 옮기려면 useNavigate 를 씁니다. Link 는 누르면 무조건 갑니다.",
          "조건만 바뀌는 값은 쿼리스트링으로 받고 useSearchParams 로 꺼냅니다. 없으면 null 입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 문제 13 정답 (에러 확인)
// ============================================================
//
// (가) 자식 Route 의 path 를 "/notice" 로 바꾸면
//      → 화면이 통째로 빨간 에러 상자가 됩니다.
//      → 콘솔: Absolute route path "/notice" nested under path "/a/shop" is not valid.
//              An absolute child route path must start with the combined path
//              of all its parent routes.
//      → 자식은 부모 주소 뒤에 이어 붙어야 하는데, 슬래시로 시작하면
//        "앱의 맨 처음부터" 라는 뜻이라 부모와 말이 안 맞습니다.
//        자식 path 에는 슬래시를 붙이지 않습니다.
//
// (나) element={AboutPage} 로 화살괄호를 지우면
//      → 화면: '소개' 를 눌러도 그 자리가 텅 빕니다. 빨간 에러 상자는 안 나옵니다.
//              다른 화면은 멀쩡합니다. 그래서 더 찾기 어렵습니다.
//      → 콘솔: Functions are not valid as a React child.
//              This may happen if you return AboutPage instead of <AboutPage />
//              from render. Or maybe you meant to call this function rather than
//              return it.
//      → element 에는 '함수' 가 아니라 '만들어진 화면' 을 넣습니다.
//        onClick 과 반대라고 기억하면 편합니다.
//        onClick 은 나중에 부를 함수를, element 는 지금 그릴 화면을 받습니다.
//
// (다) Link 의 to 를 href 로 바꾸면
//      → 화면: 글자는 그대로 나오고, 눌러도 아무 일이 안 일어납니다.
//      → 콘솔: 아무것도 안 나옵니다. 에러도 경고도 없습니다.
//      → Link 가 아는 이름은 to 입니다. href 는 모르는 이름이라 그냥 무시합니다.
//        이런 실수는 콘솔이 조용해서 가장 찾기 어렵습니다.
//        "눌러도 반응이 없다" 면 속성 이름부터 확인하세요.
