// ============================================================
// 11단원 · 개념 04 — 중첩 라우트
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
// ============================================================
//
// 지금까지는 주소가 바뀌면 화면을 통째로 갈아 끼웠습니다.
// 그런데 실제 앱을 보면 화면이 전부 바뀌는 일은 별로 없습니다.
//
//   가게 이름과 탭 메뉴는 위에 그대로 있고,
//   그 아래 내용만 바뀝니다.
//
// 쇼핑몰도, 은행 앱도, 이 자료의 왼쪽 메뉴도 그렇습니다.
// 이렇게 여러 화면이 함께 쓰는 껍데기를 '레이아웃' 이라고 부릅니다.
//
// 레이아웃을 화면마다 복사해 붙이면 어떻게 될까요?
// 탭 이름 하나 고치는 데 여러 파일을 고쳐야 합니다.
// 01단원에서 본 "고칠 곳이 흩어진다" 문제가 그대로 돌아옵니다.
//
// 라우터에는 이것을 위한 방법이 있습니다. Route 안에 Route 를 넣는 것입니다.
//
// ★ 이 자료만의 사정: 진짜 앱은 BrowserRouter 를 앱 맨 바깥에 한 번만 둡니다.
//   이 자료는 예제를 왼쪽 메뉴로 골라 보는 구조라 파일마다 하나씩 두었습니다.
//   이 파일이 쓰는 주소 앞머리는 /r4 입니다.
//   이동한 뒤 새로고침(F5)을 하면 왼쪽 메뉴 선택이 풀립니다. 하지 마세요.

import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, Outlet } from "react-router-dom";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 껍데기를 복사해 붙이면 생기는 일 ──

// 중첩 라우트를 모르면 이렇게 씁니다. 화면마다 컴포넌트를 만들고,
// 그 안에 같은 머리말과 탭 메뉴를 각각 적습니다.
//
//     function OldMenu() {
//       return (
//         <div>
//           <h4>민준이네 카페</h4>                    ← 복사 1
//           <nav>메뉴 | 장바구니 | 공지</nav>          ← 복사 1
//           <p>아메리카노 4000원 ...</p>
//         </div>
//       );
//     }
//
// 화면이 세 개면 같은 것을 세 번 적습니다.
// 지금은 견딜 만합니다. 화면이 열 개가 되고 탭이 하나 늘면 열 군데를 고쳐야 합니다.
// 그리고 한 군데를 빠뜨리면 그 화면에서만 탭이 다릅니다.
// 이런 버그는 그 화면에 직접 들어가 보기 전까지 아무도 모릅니다.
//
// 아래 데모 ① 이 딱 그 상태입니다. 일부러 한 군데를 빠뜨려 두었습니다.

// 화면 세 개가 각자 머리말과 탭을 들고 있습니다. 잘 보면 셋이 똑같지 않습니다.
function OldTabs({ onGo }) {
  // props 로 받은 함수를 부릅니다. 07단원 개념04에서 배운 방식입니다.
  return (
    <nav>
      <button onClick={() => onGo("menu")}>메뉴</button>
      <button onClick={() => onGo("cart")}>장바구니</button>
      <button onClick={() => onGo("notice")}>공지</button>
    </nav>
  );
}

function OldWayDemo() {
  const [tab, setTab] = useState("menu");

  function goTab(name) {
    setTab(name);
    console.log("복붙 방식 — 화면을 갈아 끼웠습니다");
    // 콘솔: 복붙 방식 — 화면을 갈아 끼웠습니다
  }

  return (
    <div className="demo">
      <h3>① 복붙 방식 — 화면마다 껍데기를 따로 들고 있습니다</h3>

      {tab === "menu" && (
        <div className="output">
          <h4>민준이네 카페</h4>
          <OldTabs onGo={goTab} />
          <p>아메리카노 4000원 / 라떼 4500원 / 케이크 6000원</p>
        </div>
      )}

      {tab === "cart" && (
        <div className="output">
          <h4>민준이네 카페</h4>
          <OldTabs onGo={goTab} />
          <p>담은 것이 없습니다.</p>
        </div>
      )}

      {tab === "notice" && (
        <div className="output">
          {/* 이 화면만 머리말을 안 고쳤고 탭도 하나 빠졌습니다. 복붙하다 생긴 일입니다. */}
          <h4>민준이네 커피</h4>
          <nav>
            <button onClick={() => goTab("menu")}>메뉴</button>
            <button onClick={() => goTab("cart")}>장바구니</button>
          </nav>
          <p>이번 주 화요일은 쉽니다.</p>
        </div>
      )}

      <p>
        '공지' 로 가 보세요. 가게 이름이 다르고 '공지' 탭이 사라져 있습니다. 껍데기를 세 번
        적었기 때문에 생긴 일입니다.
      </p>
    </div>
  );
}

// ✏️ 직접 해보기 1 — 데모 ① 에서 '공지' 를 눌러 보세요.
//                    앞의 두 화면과 다른 점을 두 가지 찾아보세요.

// ── 섹션 2: Route 안에 Route 넣기 ──

// 껍데기를 한 번만 쓰고 싶으면 Route 를 이렇게 겹쳐 씁니다.
//
//     <Route path="/r4" element={<ShopLayout />}>
//       <Route path="menu" element={<ShopMenu />} />
//       <Route path="cart" element={<ShopCart />} />
//     </Route>
//
// 바깥 Route 를 부모, 안쪽 Route 를 자식이라고 부릅니다.
// 부모는 껍데기를, 자식은 내용을 맡습니다.
//
// [주소는 이어 붙습니다]
// 자식의 path 에는 슬래시를 붙이지 않습니다. 부모 주소 뒤에 이어 붙기 때문입니다.
//
//     부모 /r4  +  자식 menu   →  /r4/menu
//     부모 /r4  +  자식 cart   →  /r4/cart
//
// 자식에 path="/menu" 라고 슬래시를 붙이면 "앱의 맨 처음부터 /menu" 라는 뜻이 됩니다.
// 부모가 /r4 인데 자식이 /menu 면 서로 말이 안 맞아서 에러가 납니다.
// 이 실수는 섹션 6에서 다시 봅니다.
//
// [주소가 맞으면 둘 다 그립니다]
// 주소가 /r4/menu 면 React Router 는 부모와 자식을 함께 그립니다.
// 부모 ShopLayout 을 그리고, 그 안에 자식 ShopMenu 를 넣습니다.
// 그러면 "그 안" 이 정확히 어디일까요? 그것을 정하는 것이 다음 섹션의 Outlet 입니다.

// ✏️ 직접 해보기 2 — 아래 Demo 의 Routes 안에 자식 Route 를 하나 더 넣으세요.
//                    path 는 hours, element 는 <p>10시부터 22시까지 엽니다</p> 입니다.
//                    넣은 뒤 탭에도 <NavLink to="hours">영업시간</NavLink> 를 추가하세요.

// ── 섹션 3: Outlet — 자식이 그려질 자리 ──

// 부모 컴포넌트 안에서 <Outlet /> 을 쓴 곳에 자식 화면이 들어갑니다.
//
//     function ShopLayout() {
//       return (
//         <div>
//           <h4>민준이네 카페</h4>
//           <nav>...</nav>
//           <Outlet />        {/* ← 여기에 자식 화면이 들어옵니다 */}
//         </div>
//       );
//     }
//
// 03단원에서 배운 children 과 비슷하지만 다릅니다.
// children 은 부모가 쓸 때 직접 넣어 준 것이고,
// Outlet 은 '지금 주소에 맞는 자식 Route' 를 라우터가 골라서 넣어 주는 것입니다.
//
// [레이아웃은 다시 만들어지지 않습니다]
// 탭을 옮기면 Outlet 안쪽만 바뀝니다. 바깥 껍데기는 그대로 있습니다.
// 그래서 껍데기가 들고 있는 state 도 그대로 남습니다.
// 아래 데모에 숫자 두 개를 두었으니 직접 비교해 보세요.
//
//   [담은 개수]   껍데기(ShopLayout)가 들고 있습니다  → 탭을 옮겨도 그대로
//   [본 횟수]     자식(ShopMenu)이 들고 있습니다      → 탭을 옮겼다 오면 0

function ShopLayout() {
  const [cartCount, setCartCount] = useState(0);

  function addToCart() {
    setCartCount(cartCount + 1);
  }

  // NavLink 의 className 에 넣을 함수입니다(개념02에서 배웠습니다).
  function markActive({ isActive }) {
    return isActive ? "on" : "";
  }

  return (
    <div>
      <h4>민준이네 카페</h4>

      <p>
        담은 개수: <strong>{cartCount}</strong>{" "}
        <button onClick={addToCart}>담기</button>
      </p>

      <nav>
        {/* 이 링크만 절대 경로입니다. 슬래시로 시작하면 앱의 맨 처음부터 세는 주소입니다. */}
        <NavLink to="/r4" end className={markActive}>
          홈
        </NavLink>{" "}
        |{" "}
        {/* 아래 셋은 슬래시가 없습니다. 지금 부모(/r4) 뒤에 이어 붙습니다. */}
        <NavLink to="menu" className={markActive}>
          메뉴
        </NavLink>{" "}
        |{" "}
        <NavLink to="cart" className={markActive}>
          장바구니
        </NavLink>{" "}
        |{" "}
        <NavLink to="notice" className={markActive}>
          공지
        </NavLink>
      </nav>

      <div className="output">
        {/* 여기에 자식 화면이 들어옵니다 */}
        <Outlet />
      </div>

      <p>— 여기까지가 껍데기입니다. 탭을 옮겨도 위아래는 그대로 있습니다. —</p>
    </div>
  );
}

// ✏️ 직접 해보기 3 — ShopLayout 의 <Outlet /> 줄을 잠깐 지우고 저장한 뒤
//                    탭을 눌러 보세요. 무엇이 사라지나요? 확인했으면 되돌리세요.

// ── 섹션 4: index 라우트 — 부모 주소 그대로일 때 ──

// 주소가 /r4/menu 면 자식 menu 가 Outlet 자리에 들어갑니다.
// 그러면 주소가 딱 /r4 일 때는 Outlet 자리에 무엇이 들어갈까요?
// 아무 자식도 안 맞으니 그 자리가 빕니다. 껍데기만 나옵니다.
//
// 그 자리를 채우려고 쓰는 것이 index 라우트입니다.
//
//     <Route path="/r4" element={<ShopLayout />}>
//       <Route index element={<ShopHome />} />
//       <Route path="menu" element={<ShopMenu />} />
//     </Route>
//
// index 는 path 가 없습니다. "부모 주소와 딱 맞을 때" 라는 뜻입니다.
// path="" 라고 적어도 같은 뜻이 되지만, index 라고 적는 쪽이 뜻이 분명합니다.
//
// index 라우트는 부모마다 하나만 둡니다. 여러 개 두면 어느 것을 골라야 할지 모릅니다.

function ShopHome() {
  return <p>어서 오세요. 위 탭에서 골라 보세요.</p>;
}

function ShopMenu() {
  // 이 숫자는 자식 화면이 들고 있습니다. 탭을 옮기면 이 컴포넌트가 사라지고,
  // 돌아오면 새로 만들어집니다. 그래서 0부터 다시 셉니다.
  const [viewCount, setViewCount] = useState(0);

  return (
    <div>
      <ul>
        <li>아메리카노 4000원</li>
        <li>라떼 4500원</li>
        <li>케이크 6000원</li>
      </ul>
      <p>
        본 횟수: <strong>{viewCount}</strong>{" "}
        <button onClick={() => setViewCount(viewCount + 1)}>+1</button>
      </p>
      <p>이 숫자는 자식 화면이 들고 있습니다. 다른 탭에 갔다 오면 0이 됩니다.</p>
    </div>
  );
}

function ShopCart() {
  return <p>담은 것이 없습니다. 위 [담기] 버튼은 껍데기에 있습니다.</p>;
}

function ShopNotice() {
  return <p>이번 주 화요일은 쉽니다.</p>;
}

// ✏️ 직접 해보기 4 — '메뉴' 탭에서 [+1] 을 세 번 누른 뒤 '공지' 로 갔다가
//                    다시 '메뉴' 로 돌아오세요. 두 숫자가 각각 어떻게 되나요?

// ── 섹션 5: 자식 링크는 슬래시 없이 ──

// 링크에도 같은 규칙이 있습니다. 슬래시로 시작하면 앱의 맨 처음부터 세는 주소입니다.
//
//     <NavLink to="menu">    → 지금 있는 곳(/r4) 뒤에 붙어서 /r4/menu
//     <NavLink to="/menu">   → 앱의 맨 처음부터라서 그냥 /menu
//
// 위 ShopLayout 의 탭은 슬래시 없이 적었습니다. 그래서 /r4/menu 로 갑니다.
// 슬래시를 붙이면 /menu 로 가 버리고, 그런 Route 는 없으니 안내 화면이 나옵니다.
//
// 슬래시 없이 적으면 좋은 점이 하나 더 있습니다.
// 나중에 부모 주소를 /r4 에서 /shop 으로 바꾸더라도 자식 링크는 안 고쳐도 됩니다.
// 부모만 고치면 자식은 알아서 따라갑니다.
//
// 아래 데모의 '잘못된 링크' 를 눌러 확인해 보세요.

function NotHere() {
  return (
    <div>
      <p>이 예제가 아는 주소가 아닙니다.</p>
      <p>
        <Link to="/r4">민준이네 카페로 돌아가기</Link>
      </p>
    </div>
  );
}

function Demo() {
  return (
    <BrowserRouter>
      <div className="demo">
        <h3>② 중첩 라우트 — 껍데기 하나에 화면 여러 개</h3>

        <p>
          <Link to="/r4">가게 열기 (/r4)</Link> |{" "}
          <Link to="/menu">잘못된 링크 (/menu)</Link>
        </p>

        <Routes>
          {/* 부모 — 껍데기 */}
          <Route path="/r4" element={<ShopLayout />}>
            {/* 자식 — Outlet 자리에 들어갑니다. path 에 슬래시가 없습니다. */}
            <Route index element={<ShopHome />} />
            <Route path="menu" element={<ShopMenu />} />
            <Route path="cart" element={<ShopCart />} />
            <Route path="notice" element={<ShopNotice />} />
          </Route>

          <Route path="*" element={<NotHere />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ✏️ 직접 해보기 5 — 데모 위쪽의 '잘못된 링크 (/menu)' 를 눌러 보세요.
//                    주소창이 무엇이 되고 화면에는 무엇이 나오나요?

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 부모에 Outlet 을 안 쓴다  — [조용히 틀림]
//
//     function ShopLayout() {
//       return (
//         <div>
//           <h4>민준이네 카페</h4>
//           <nav>...</nav>
//         </div>
//       );
//     }
//
// 실수: 탭을 눌러도 껍데기만 계속 나옵니다. 내용이 영영 안 보입니다.
//       에러도 경고도 없습니다. Route 는 잘 맞았는데 그릴 자리가 없는 것입니다.
//       "주소는 바뀌는데 화면이 안 바뀐다" 면 Outlet 부터 찾아보세요.

// [실수 2] 자식 path 에 슬래시를 붙인다  — [런타임 에러]
//
//     <Route path="/r4" element={<ShopLayout />}>
//       <Route path="/menu" element={<ShopMenu />} />
//     </Route>
//
// 실수: 화면이 빨간 에러 상자가 됩니다.
//       "Absolute route path "/menu" nested under path "/r4" is not valid"
//       라고 알려 줍니다. 자식은 부모 뒤에 이어 붙어야 하는데,
//       슬래시로 시작하면 맨 처음부터라는 뜻이라 부모와 말이 안 맞습니다.

// [실수 3] index 를 안 둬서 부모 주소가 비어 보인다  — [조용히 틀림]
//
//     <Route path="/r4" element={<ShopLayout />}>
//       <Route path="menu" element={<ShopMenu />} />
//     </Route>
//
// 실수: /r4 로 들어가면 껍데기만 나오고 가운데가 텅 빕니다.
//       에러가 없어서 "왜 아무것도 없지" 하고 한참 찾게 됩니다.
//       부모 주소로 들어왔을 때 보여 줄 것을 index 로 정해 두세요.

// [실수 4] 자식 Route 를 부모 밖에 적는다  — [조용히 틀림]
//
//     <Route path="/r4" element={<ShopLayout />} />
//     <Route path="/r4/menu" element={<ShopMenu />} />
//
// 실수: 에러는 안 납니다. /r4/menu 로 가면 ShopMenu 만 나옵니다.
//       껍데기가 사라져서 탭도 담은 개수도 함께 사라집니다.
//       "탭을 누르면 탭이 없어진다" 면 자식을 부모 안에 넣었는지 보세요.

// [실수 5] 부모 Route 를 스스로 닫고 자식을 그 아래에 적는다  — [SyntaxError]
//
//     <Route path="/r4" element={<ShopLayout />} />
//       <Route index element={<ShopHome />} />
//     </Route>
//
// 실수: 파일 전체가 안 돌아가고 화면이 통째로 빕니다.
//       자식이 없던 Route 에 자식을 붙일 때 가장 많이 하는 실수입니다.
//       끝의 /> 를 > 로 고쳐서 '여는 태그' 로 만들어야 합니다.
//       자식이 있으면 <Route ...> ... </Route> 모양이 됩니다.

// [실수 6] 링크에 슬래시를 붙여서 밖으로 나간다  — [조용히 틀림]
//
//     <NavLink to="/menu">메뉴</NavLink>
//
// 실수: 껍데기까지 통째로 사라지고 안내 화면이 나옵니다.
//       /r4/menu 가 아니라 /menu 로 갔기 때문입니다.
//       자식으로 갈 때는 슬래시 없이 적으세요.

export default function Concept04NestedRoutes() {
  return (
    <div>
      <h1>개념 04 — 중첩 라우트</h1>

      <p className="guide">
        데모 ① 은 껍데기를 화면마다 복사해 붙인 것입니다. <strong>'공지' 탭</strong>에서
        무엇이 어긋났는지 먼저 찾아보세요.
        <br />
        <br />
        데모 ② 에서 <strong>가게 열기 (/r4)</strong> 를 누른 다음 탭을 눌러 보세요. 위쪽
        가게 이름과 탭은 그대로 있고 가운데 상자만 바뀝니다.
        <br />
        <br />
        <strong>숫자 두 개를 꼭 비교해 보세요.</strong> [담은 개수]는 껍데기가, [본 횟수]는
        메뉴 화면이 들고 있습니다. 탭을 옮겼다 오면 하나만 0이 됩니다.
        <br />
        <br />이 예제에서는 <strong>새로고침(F5)을 하지 마세요.</strong> 왼쪽 메뉴 선택이
        풀려서 다른 예제가 열립니다. 그때는 왼쪽 메뉴에서 다시 고르면 됩니다.
      </p>

      <OldWayDemo />
      <Demo />

      <Summary
        items={[
          "여러 화면이 함께 쓰는 껍데기(레이아웃)는 Route 안에 Route 를 넣어 한 번만 만듭니다.",
          "자식 Route 의 path 에는 슬래시를 붙이지 않습니다. 부모 주소 뒤에 이어 붙습니다.",
          "부모 컴포넌트의 <Outlet /> 자리에 지금 주소에 맞는 자식 화면이 들어갑니다.",
          "Outlet 을 빠뜨리면 에러 없이 내용만 안 보입니다. 화면이 안 바뀌면 여기부터 보세요.",
          "주소가 부모와 딱 맞을 때 보여 줄 화면은 <Route index element={...} /> 로 정합니다.",
          "탭을 옮겨도 껍데기는 다시 만들어지지 않습니다. 그래서 껍데기의 state 는 그대로 남습니다.",
          "링크도 같습니다. to=\"menu\" 는 지금 있는 곳 뒤에, to=\"/menu\" 는 맨 처음부터입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 두 가지입니다.
//    화면: 가게 이름이 "민준이네 카페" 가 아니라 "민준이네 커피" 입니다
//    화면: 탭에 '공지' 가 없어서, 공지 화면에서는 공지로 다시 갈 수 없습니다
//    콘솔: 복붙 방식 — 화면을 갈아 끼웠습니다
//    → 껍데기를 세 번 적었기 때문입니다. 고칠 때 한 군데를 빠뜨려도 아무 경고가 없습니다.
//      화면이 열 개면 고칠 곳도 열 군데입니다.
//      중첩 라우트로 만들면 껍데기가 한 곳뿐이라 한 번만 고치면 됩니다.
//
// 2) Routes 안, /r4 부모 Route 의 자식으로 이 줄을 넣습니다.
//
//      <Route path="hours" element={<p>10시부터 22시까지 엽니다</p>} />
//
//    화면: '영업시간' 탭을 누르면 주소가 /r4/hours 가 되고
//         껍데기는 그대로인 채 가운데 상자만 "10시부터 22시까지 엽니다" 로 바뀝니다.
//    → 자식 path 에 슬래시를 붙이면 에러가 납니다. hours 라고만 적습니다.
//
// 3) 가운데 상자의 내용이 전부 사라집니다.
//    화면: 가게 이름과 탭, [담기] 버튼, 맨 아래 줄은 그대로 남습니다.
//         탭을 눌러 주소가 바뀌어도 가운데는 계속 비어 있습니다.
//    → 콘솔에는 아무 에러가 없습니다. 자식을 그릴 자리를 안 정해 준 것뿐입니다.
//
// 4) [담은 개수]는 그대로, [본 횟수]는 0이 됩니다.
//    화면: 담은 개수 2 → 공지 → 메뉴 → 담은 개수 2 / 본 횟수 0
//    → 껍데기 ShopLayout 은 계속 화면에 있었으므로 state 가 살아 있습니다.
//      자식 ShopMenu 는 탭을 옮길 때 화면에서 없어졌다가 새로 만들어졌습니다.
//      React 는 화면에서 사라진 컴포넌트의 state 를 버립니다.
//
// 5) 주소는 /menu 가 되고, 가게 껍데기까지 통째로 사라집니다.
//    화면: "이 예제가 아는 주소가 아닙니다" 와 돌아가기 링크만 남습니다
//    → /menu 와 맞는 Route 가 없어서 path="*" 가 대신 나온 것입니다.
//      to 앞의 슬래시 하나 때문에 완전히 다른 곳으로 간 것입니다.
