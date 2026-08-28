// ============================================================
// 11단원 연습문제 — React Router
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 파일을 고르세요.
//       고치고 저장하면 화면이 바로 바뀝니다. F12 → Console 도 함께 보세요.
//
// 문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다.
// 화면 아래 '연습 화면' 상자에서 결과를 확인합니다.
//
// ★ 이 파일에서 주소를 옮긴 뒤에는 새로고침(F5)을 하지 마세요.
//   왼쪽 메뉴 선택이 풀려서 다른 예제가 열립니다.
//   그때는 왼쪽 메뉴에서 '연습문제' 를 다시 고르면 됩니다.
//
// ★ 이 파일이 쓰는 주소 앞머리는 /q 입니다.
//   진짜 앱은 BrowserRouter 를 맨 바깥에 한 번만 두지만,
//   이 자료는 예제를 메뉴로 골라 보는 구조라 파일마다 하나씩 둡니다.
// ============================================================

// 필요한 것은 미리 다 꺼내 두었습니다. 문제를 풀면서 골라 쓰세요.
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

// 문제에서 함께 쓰는 데이터입니다. 고치지 마세요.
const menuItems = [
  { id: 1, name: "아메리카노", price: 4000 },
  { id: 2, name: "라떼", price: 4500 },
  { id: 3, name: "케이크", price: 6000 },
  { id: 4, name: "삼각김밥", price: 1200 },
];

// ───── 문제 1 ───── (개념01)
// 아래 AboutPage 는 이미 만들어져 있습니다.
// 주소가 /q/about 일 때 이 화면이 나오도록 Routes 안에 Route 를 추가하세요.
// (Routes 는 이 파일 아래쪽 PracticeApp 안에 있습니다)
//
// 기대 결과 (화면): '소개' 링크를 누르면 "2020년에 문을 연 작은 카페입니다" 가 나옵니다.
//                  "이 예제가 아는 주소가 아닙니다" 가 나오면 Route 를 아직 안 넣은 것입니다.
// TODO: PracticeApp 의 Routes 안에 코드를 쓰세요

function AboutPage() {
  return <p>2020년에 문을 연 작은 카페입니다.</p>;
}

// ───── 문제 2 ───── (개념01)
// 주소가 /q/hours 일 때 "10시부터 22시까지 엽니다" 가 나오게 하세요.
// 이번에는 컴포넌트를 따로 만들지 말고, element 에 JSX 를 직접 넣으세요.
//
// 기대 결과 (화면): '영업시간' 링크를 누르면 "10시부터 22시까지 엽니다" 가 나옵니다.
//                  화면이 비면 element 에 화살괄호를 안 썼는지 확인하세요.
// TODO: PracticeApp 의 Routes 안에 코드를 쓰세요

// ───── 문제 3 ───── (개념02)
// PracticeApp 의 링크 줄에 <a href="/q/menu">메뉴(a)</a> 가 있습니다.
// 이것을 <Link> 로 바꾸고, 글자는 "메뉴" 로 고치세요.
//
// 기대 결과 (화면): 카운터를 3까지 올린 뒤 눌러도 카운터가 3 그대로입니다.
//                  카운터가 0이 되고 왼쪽 메뉴 선택까지 풀리면 아직 <a> 인 것입니다.
// TODO: PracticeApp 의 nav 안을 고치세요

// ───── 문제 4 ───── (개념02)
// PracticeApp 의 '홈' 링크를 NavLink 로 바꾸고,
// 지금 보고 있는 곳일 때만 "on" 클래스가 붙게 하세요.
// 주소가 딱 /q 일 때만 켜져야 합니다.
//
// 기대 결과 (화면): 주소가 /q 일 때만 '홈' 에 파란 배경이 들어옵니다.
//                  /q/about 에서도 파란 배경이면 end 를 안 붙인 것입니다.
// TODO: PracticeApp 의 nav 안을 고치세요

// ───── 문제 5 ───── (개념03)
// (문제 3을 먼저 푸세요. 안 그러면 메뉴 화면으로 갈 때마다 앱이 다시 시작합니다)
// MenuList 가 menuItems 를 목록으로 그리게 하세요.
// 항목마다 Link 를 걸어서, 누르면 /q/menu/1 처럼 그 항목의 id 가 주소에 들어가야 합니다.
// key 도 잊지 마세요(05단원).
//
// 기대 결과 (화면): 메뉴 네 줄이 나오고, '라떼' 를 누르면 주소가 /q/menu/2 가 됩니다.
//                  주소가 /q/menu/$%7B... 처럼 되면 백틱(`) 대신 따옴표를 쓴 것입니다.
// TODO: 아래 함수 안을 고치세요

function MenuList() {
  return (
    <div>
      <p>문제 5: 여기에 메뉴 목록을 그리세요.</p>
    </div>
  );
}

// ───── 문제 6 ───── (개념03)
// 주소가 /q/menu/1 처럼 뒤에 값이 붙었을 때 아래 MenuDetail 이 나오도록
// Routes 에 Route 를 추가하세요. 값이 오는 자리 이름은 id 로 하세요.
//
// 기대 결과 (화면): 목록에서 '라떼' 를 누르면 상세 화면 틀이 나옵니다.
//                  "이 예제가 아는 주소가 아닙니다" 가 나오면 Route 가 없는 것입니다.
// TODO: PracticeApp 의 Routes 안에 코드를 쓰세요

// ───── 문제 7 ───── (개념03)
// (문제 6을 먼저 풀어야 상세 화면이 화면에 나옵니다)
// MenuDetail 에서 주소에 들어온 값을 꺼내 화면에 보여 주세요.
// "받은 id: 2 (타입: string)" 처럼 값과 타입을 함께 보여 주면 됩니다.
//
// 기대 결과 (화면): '라떼' 를 누르면 → 받은 id: 2 (타입: string)
//                  타입이 number 로 나오면 잘못 본 것입니다. 주소에서 온 값은 문자열입니다.
// TODO: 아래 함수 안을 고치세요 (문제 8과 같은 함수입니다)

// ───── 문제 8 ───── (개념03)
// 문제 7에서 꺼낸 id 로 menuItems 에서 그 메뉴를 찾아 이름과 가격을 보여 주세요.
// menuItems 의 id 는 숫자라는 점에 주의하세요.
// 못 찾았을 때는 "그런 메뉴가 없습니다" 가 나와야 합니다.
//
// 기대 결과 (화면): '라떼' → 라떼 4500원
//                  '없는 메뉴(99)' → 그런 메뉴가 없습니다
//                  늘 "그런 메뉴가 없습니다" 면 문자열과 숫자를 그냥 === 로 비교한 것입니다.
// TODO: 아래 함수 안을 고치세요

function MenuDetail() {
  return (
    <div>
      <p>문제 7: 여기에 받은 id 와 타입을 보여 주세요.</p>
      <p>문제 8: 여기에 찾은 메뉴의 이름과 가격을 보여 주세요.</p>
      <p>
        <Link to="/q/menu">← 목록으로</Link>
      </p>
    </div>
  );
}

// ───── 문제 9 ───── (개념04)
// PracticeApp 의 Routes 에 /q/shop 부모 Route 와 자식 notice 가 이미 들어 있습니다.
// 그런데 '공지' 를 눌러도 내용이 안 보입니다.
// ShopLayout 을 고쳐서 자식 화면이 그려지게 하세요.
//
// 기대 결과 (화면): '가게' → '공지' 를 누르면 껍데기 아래에 "이번 주 화요일은 쉽니다" 가 나옵니다.
//                  껍데기만 계속 나오면 자식이 그려질 자리를 안 정해 준 것입니다.
// TODO: 아래 함수 안을 고치세요

function ShopLayout() {
  return (
    <div>
      <h4>민준이네 카페</h4>
      <nav>
        <Link to="/q/shop">가게 홈</Link> | <Link to="/q/shop/notice">공지</Link>
      </nav>
      <div className="output">
        <p>문제 9: 여기에 자식 화면이 들어와야 합니다.</p>
      </div>
    </div>
  );
}

// ───── 문제 10 ───── (개념04)
// 주소가 딱 /q/shop 일 때 아래 ShopHome 이 나오도록 자식 Route 를 추가하세요.
// (문제 9를 먼저 풀어야 결과가 보입니다)
//
// 기대 결과 (화면): '가게' 를 누르면 껍데기 아래에 "어서 오세요. 위에서 골라 보세요" 가 나옵니다.
//                  path="" 대신 쓰는 더 분명한 방법이 있습니다.
// TODO: PracticeApp 의 /q/shop 부모 Route 안에 코드를 쓰세요

function ShopHome() {
  return <p>어서 오세요. 위에서 골라 보세요.</p>;
}

function ShopNotice() {
  return <p>이번 주 화요일은 쉽니다.</p>;
}

// ───── 문제 11 ───── [응용] (개념05)
// OrderScreen 의 [주문하기] 버튼을 완성하세요.
//   - 입력칸이 비어 있으면(공백만 있는 것도 포함) 옮겨 가지 말고
//     error 에 "무엇을 주문할지 적어 주세요" 를 넣으세요.
//   - 값이 있으면 /q/done 으로 옮기세요.
//
// 기대 결과 (화면): 빈칸에서 누르면 주소는 /q/order 그대로이고 빨간 안내가 나옵니다.
//                  '라떼' 를 적고 누르면 주소가 /q/done 이 되고 "주문이 끝났습니다" 가 나옵니다.
//                  빈칸인데도 옮겨 가면 검사보다 이동이 먼저 실행된 것입니다.
// TODO: 아래 함수 안을 고치세요

function OrderScreen() {
  const [item, setItem] = useState("");
  const [error, setError] = useState("");

  function handleOrder() {
    // TODO: 여기에 코드를 쓰세요
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

// ───── 문제 12 ───── [도전] (개념05 + 개념03)
// SearchScreen 을 완성하세요.
// 주소의 ?keyword= 뒤에 적힌 글자가 이름에 들어 있는 메뉴만 목록으로 보여 줍니다.
//   - 검색어가 없으면(null) "검색어가 없습니다" 만 보여 주세요.
//   - 검색어가 있는데 맞는 것이 하나도 없으면 "찾은 메뉴가 없습니다" 를 보여 주세요.
//   - 맞는 것이 있으면 이름과 가격을 목록으로 보여 주세요.
// 힌트: 글자가 들어 있는지 보는 것은 JS자료 06단원의 includes 입니다.
//
// 기대 결과 (화면): '검색(라)' → 라떼 4500원 한 줄만 나옵니다
//                  '검색(김)' → 삼각김밥 1200원 한 줄만 나옵니다
//                  '검색(없이)' → 검색어가 없습니다
//                  네 줄이 다 나오면 걸러 내지 않은 것입니다.
// TODO: 아래 함수 안을 고치세요

function SearchScreen() {
  return (
    <div>
      <h4>검색 화면</h4>
      <p>문제 12: 여기에 걸러 낸 메뉴 목록을 보여 주세요.</p>
    </div>
  );
}

// ───── 문제 13 ───── (에러 확인)
// 아래 세 가지를 하나씩 실제로 만들어 보고, 무슨 일이 나는지 확인하세요.
// 확인한 뒤에는 반드시 원래대로 되돌리세요.
//
//   (가) PracticeApp 의 /q/shop 자식 Route 를 path="/notice" 로 바꾼다
//   (나) 문제 1에서 만든 Route 를 element={AboutPage} 로 바꾼다 (화살괄호를 지운다)
//   (다) PracticeApp 의 '영업시간' Link 에서 to 를 href 로 바꾼다
//
// 기대 결과: 셋 다 나타나는 모습이 다릅니다. 아래 빈칸을 채워 보세요.
//   (가) → 화면이 (            ) 이 되고, 콘솔에 (                        ) 가 나온다
//   (나) → 화면이 (            ) 되고, 콘솔에 (                        ) 가 나온다
//   (다) → 화면은 그대로인데 (                        )
//
// 정답은 연습문제_정답.jsx 맨 아래에 있습니다.

function NoRoute() {
  return <p>이 예제가 아는 주소가 아닙니다. 위의 링크를 눌러 보세요.</p>;
}

function PracticeApp() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className="demo">
        <h3>연습 화면</h3>

        <p>
          카운터: <strong>{count}</strong>{" "}
          <button onClick={() => setCount(count + 1)}>+1</button> (문제 3에서 씁니다)
        </p>

        <nav>
          {/* 문제 3 · 문제 4에서 이 줄들을 고칩니다 */}
          <Link to="/q">홈</Link> | <Link to="/q/about">소개</Link> |{" "}
          <Link to="/q/hours">영업시간</Link> | <a href="/q/menu">메뉴(a)</a> |{" "}
          <Link to="/q/menu/99">없는 메뉴(99)</Link>
          <br />
          <Link to="/q/shop">가게</Link> | <Link to="/q/order">주문</Link> |{" "}
          <Link to="/q/search?keyword=라">검색(라)</Link> |{" "}
          <Link to="/q/search?keyword=김">검색(김)</Link> |{" "}
          <Link to="/q/search">검색(없이)</Link> |{" "}
          <Link to="/q/nope">없는 주소</Link>
        </nav>

        <div className="output">
          <Routes>
            <Route path="/q" element={<p>홈 — 어서 오세요.</p>} />
            <Route path="/q/menu" element={<MenuList />} />

            {/* TODO 문제 1: /q/about Route 를 여기에 */}
            {/* TODO 문제 2: /q/hours Route 를 여기에 */}
            {/* TODO 문제 6: /q/menu/:id Route 를 여기에 */}

            <Route path="/q/shop" element={<ShopLayout />}>
              {/* TODO 문제 10: index Route 를 여기에 */}
              <Route path="notice" element={<ShopNotice />} />
            </Route>

            <Route path="/q/order" element={<OrderScreen />} />
            <Route path="/q/done" element={<DoneScreen />} />
            <Route path="/q/search" element={<SearchScreen />} />

            <Route path="*" element={<NoRoute />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function Practice11Router() {
  return (
    <div>
      <h1>11단원 연습문제 — React Router</h1>

      <p className="guide">
        이 파일을 <strong>직접 고치면서</strong> 푸는 문제입니다. 저장하면 아래 '연습 화면'
        이 바로 바뀝니다.
        <br />
        <br />
        문제 1~10은 기본, 11은 응용, 12는 도전, 13은 에러 확인입니다. 문제마다{" "}
        <strong>기대 결과</strong>가 적혀 있으니 그대로 나오는지 확인하세요.
        <br />
        <br />
        <strong>주소를 옮긴 뒤 새로고침(F5)을 하지 마세요.</strong> 왼쪽 메뉴 선택이 풀려서
        다른 예제가 열립니다. 그때는 왼쪽 메뉴에서 '연습문제' 를 다시 고르면 됩니다.
      </p>

      <PracticeApp />

      <Summary
        items={[
          "문제 1~2: Route 로 주소와 화면을 짝짓기",
          "문제 3~4: Link 와 NavLink, <a> 와의 차이",
          "문제 5~8: 목록에서 상세로, :id 와 useParams, 문자열 함정",
          "문제 9~10: Outlet 과 index 라우트",
          "문제 11: useNavigate 로 검사한 뒤 이동하기",
          "문제 12: useSearchParams 로 조건 받아 걸러 내기",
          "문제 13: 자주 나는 에러 세 가지를 직접 만들어 보기",
        ]}
      />
    </div>
  );
}
