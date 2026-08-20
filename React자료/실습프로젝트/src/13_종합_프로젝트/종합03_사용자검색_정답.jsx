// ============================================================
// 13단원 · 종합 03 정답 — 사용자 검색
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// 먼저 스스로 만들어 본 다음에 보세요.
// 받아오기 · 로딩 · 에러 · 검색 · 정렬 · 상세 보기가 전부 동작합니다.
//
// ★ 이 앱은 JS자료 13단원 종합04와 같은 앱입니다.
//   그때는 fetch 와 DOM 으로 만들었고, 이번에는 useEffect 와 state 로 만듭니다.
//
// ★★ 인터넷 연결이 필요합니다.
//   인터넷이 막힌 곳이라면 실습프로젝트 폴더의 index.html 을 열고
//   <script src="/오프라인_대체.js"> 줄을 감싼 주석 기호만 지우세요.
//   인터넷 요청 0건으로 똑같은 값이 나옵니다.
//   흉내 내는 것은 jsonplaceholder.typicode.com 하나뿐입니다.
//
// ★ 콘솔에 빨간 줄이 나오는 것은 정상입니다.
//   [없는 주소] 를 누르면 브라우저가 이렇게 적습니다.
//
//       Failed to load resource: the server responded with a status of 404 (Not Found)
//
//   우리 코드가 낸 에러가 아니라 브라우저가 알려 주는 줄입니다.
//   막을 방법이 없고, 막을 필요도 없습니다. 실무에서도 그냥 나옵니다.
//
// ★ 이 실습에서 가장 어려운 것은 문제 2(다시 불러오기) 입니다.
//   고칠 코드는 두 곳뿐인데, 왜 그래야 하는지가 어렵습니다.

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

function UserSearch() {
  const [users, setUsers] = useState([]); // 받아온 사람들
  const [loading, setLoading] = useState(true); // 기다리는 중인가
  const [error, setError] = useState(null); // 실패했다면 보여 줄 문구

  const [keyword, setKeyword] = useState(""); // 검색어 (06단원 제어 컴포넌트)
  const [sortByName, setSortByName] = useState(false); // 이름순인가
  const [selectedId, setSelectedId] = useState(null); // 상세로 볼 사람

  const [source, setSource] = useState("정상"); // 일부러 실패시켜 보는 스위치
  const [reloadCount, setReloadCount] = useState(0); // 문제 2에서 씁니다

  // [state 를 왜 이렇게 일곱 개나 두나]
  //   일곱 개 다 서로 계산해 낼 수 없는 값입니다.
  //   특히 users · loading · error 셋은 09단원 개념04에서 본 그대로입니다.
  //   users 가 비어 있다는 것만으로는 '아직 기다리는 중' 인지 '실패했는지'
  //   '정말 0명인지' 를 구별할 수 없습니다. 그래서 셋이 다 필요합니다.
  //   반대로 아래 searched · visibleUsers · selectedUser 는 계산해서 씁니다.

  // source 에 따라 부를 주소가 정해집니다.
  // /nousers 는 서버에 없는 주소라 404 로 대답합니다.
  const url = source === "정상" ? `${BASE_URL}/users` : `${BASE_URL}/nousers`;

  useEffect(() => {
    // 09단원 개념05의 깃발입니다.
    // 주소를 빨리 두 번 바꾸면 지난번 응답이 뒤늦게 도착할 수 있습니다.
    // 그때 그 값을 버리기 위한 표시입니다.
    let ignore = false;

    // ───── 문제 1 ───── 목록 받아오기
    async function loadUsers() {
      setLoading(true);
      setError(null); // 새로 시작하니 지난번 에러를 지웁니다

      console.log("[요청] 보냅니다:", url);
      // 콘솔: [요청] 보냅니다: https://jsonplaceholder.typicode.com/users

      // 이 줄이 몇 번 찍히는지 세어 보세요. effect 가 몇 번 돌았는지와 같습니다.
      // 개발 중에는 StrictMode 때문에 처음에 두 번 찍힙니다. 정상입니다(09단원 개념02).

      try {
        const res = await fetch(url);

        // ★ 이 세 줄이 이 파일의 핵심입니다.
        //   fetch 는 404 를 실패로 치지 않습니다. 서버가 대답을 했으니까요.
        //   이 검사가 없으면 없는 주소를 불러도 조용히 지나갑니다(09단원 개념04).
        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        }

        const data = await res.json();

        // 요청은 되돌릴 수 없습니다. 버릴 응답도 도착은 합니다.
        // 그래서 이 줄은 버릴 응답일 때도 찍힙니다(09단원 개념05).
        console.log("[도착] 받은 사람 수:", data.length);
        // 콘솔: [도착] 받은 사람 수: 10

        if (ignore) return; // 옛날 요청의 응답이면 화면에 안 넣고 여기서 끝냅니다

        setUsers(data);
      } catch (err) {
        if (ignore) return;

        // 사용자에게는 다음에 무엇을 하면 되는지 알려 주는 우리말로
        setError("사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");

        // 개발자에게는 자세히 (09단원 개념04 '좋은 에러 처리' 1번)
        console.log("[실패]", err.message);
        // 콘솔: [실패] 서버 응답 오류 (404)
      } finally {
        // ★ 성공하든 실패하든 로딩 표시는 반드시 꺼야 합니다.
        //   try 안에 두면 실패한 사용자의 화면이 영원히 "불러오는 중..." 입니다.
        //   단, 옛날 요청이 뒤늦게 끝난 경우에는 건드리지 않습니다.
        if (!ignore) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };

    // ───── 문제 2 ───── 다시 불러오기  ★ 가장 어려운 문제
    //
    // useEffect 는 '의존성 배열 안의 값이 달라졌을 때' 만 다시 돕니다.
    // 그래서 "다시 받아오게 하라" 는 요구는 React 에서 이렇게 바뀝니다.
    //
    //     "다시 받아오게 하라"  →  "의존성 배열 안의 값을 달라지게 하라"
    //
    // reloadCount 는 그것만을 위해 만든 값입니다. 화면에 보이지도 않습니다.
    // 버튼을 누를 때마다 1씩 늘어나므로 언제나 '달라진 값' 이 됩니다.
    //
    // [왜 loadUsers() 를 버튼에서 직접 부르지 않나]
    //   부를 수 없습니다. loadUsers 는 useEffect 안에 있어서 밖에서 안 보입니다.
    //   밖으로 꺼낼 수도 있지만, 그러면 '언제 받아오는가' 가 두 곳으로 흩어집니다.
    //   지금은 이 한 줄만 보면 됩니다. "url 이 바뀌거나 다시 불러오기를 누르면 받아온다."
    //
    // [의존성에 users 를 넣으면 안 되는 이유]
    //   받아오면 users 가 바뀌고 → effect 가 또 돌고 → 또 받아오고 …
    //   무한 루프입니다. 09단원 개념06에서 본 그것입니다.
    //   의존성에는 '언제 다시 받아올지를 정하는 값' 만 넣습니다.
  }, [url, reloadCount]);

  // ───── 문제 3 ───── 검색으로 걸러내기
  const searched = users.filter((user) => {
    if (keyword.trim() === "") return true; // 검색어가 없으면 전부 남깁니다

    const word = keyword.trim().toLowerCase();
    const nameMatch = user.name.toLowerCase().includes(word);
    const cityMatch = user.address.city.toLowerCase().includes(word);

    return nameMatch || cityMatch;
  });

  // [왜 양쪽 다 toLowerCase 인가]
  //   한쪽만 소문자로 바꾸면 반쪽짜리가 됩니다.
  //   검색어만 소문자로 바꾸면 "Gwen" 을 쳤을 때 못 찾습니다.
  //   데이터만 소문자로 바꾸면 "GWEN" 을 쳤을 때 못 찾습니다.
  //
  // [address.city 를 꺼낼 때]
  //   address 는 객체 안의 객체입니다. user.address.city 로 두 번 들어갑니다.
  //   서버가 준 데이터라 모양이 늘 같으므로 그대로 꺼내 씁니다.

  // ───── 문제 4 ───── 이름순 정렬
  const visibleUsers = sortByName
    ? [...searched].sort((a, b) => a.name.localeCompare(b.name))
    : searched;

  function handleSort() {
    setSortByName(!sortByName);
  }

  // [왜 [...searched] 로 복사했나]
  //   sort 는 원본을 그 자리에서 정렬하고 자기 자신을 돌려줍니다(07단원 개념01).
  //   복사하지 않으면 searched 가, 따라서 그 안의 users 순서까지 바뀝니다.
  //   그러면 [원래 순서] 로 되돌릴 방법이 없어집니다. 받은 순서를 잃어버린 것입니다.
  //
  // [왜 localeCompare 인가]
  //   a - b 는 숫자끼리만 됩니다. 글자를 빼면 NaN 이 나와서 정렬이 안 됩니다.
  //   localeCompare 는 두 글자의 앞뒤를 알려 줍니다(JS자료 08단원 개념06).

  // 상세로 볼 사람을 찾습니다. 이것도 state 가 아니라 계산해서 씁니다.
  // find 는 못 찾으면 undefined 를 돌려줍니다(JS자료 08단원).
  const selectedUser = users.find((user) => user.id === selectedId);

  return (
    <div className="demo">
      <h3>사용자 검색</h3>

      <div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름이나 도시로 검색"
        />{" "}
        {/* 버튼 글자는 '지금 누르면 무엇이 되는지' 를 뜻합니다 */}
        <button onClick={handleSort}>{sortByName ? "원래 순서" : "이름순 정렬"}</button>
        {/* ───── 문제 2 의 ① ───── 누를 때마다 달라지는 값을 만듭니다 */}
        <button onClick={() => setReloadCount(reloadCount + 1)}>다시 불러오기</button>
      </div>

      <div>
        주소 고르기{" "}
        <button className={source === "정상" ? "on" : ""} onClick={() => setSource("정상")}>
          정상 주소
        </button>
        <button
          className={source === "정상" ? "" : "on"}
          onClick={() => setSource("없는주소")}
        >
          없는 주소 (404)
        </button>
      </div>

      {/* ───── 문제 5 ───── 화면 세 갈래 (로딩 → 에러 → 성공) */}
      {loading && <p className="output">불러오는 중...</p>}

      {!loading && error !== null && <p className="output error">{error}</p>}

      {!loading && error === null && (
        <div>
          {/* ───── 문제 6 ───── 목록 그리기 */}
          <ul>
            {visibleUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                style={{ cursor: "pointer" }}
              >
                <strong>{user.name}</strong>
                <div>
                  {user.address.city} · {user.email}
                </div>
              </li>
            ))}
          </ul>

          {/* ───── 문제 7 ───── 검색 결과가 없을 때 */}
          {visibleUsers.length === 0 && (
            <div className="output">검색 결과가 없습니다</div>
          )}
        </div>
      )}

      {/* ───── 문제 8 ───── 상세 보기 */}
      <div className="output">
        {selectedUser ? (
          <div>
            <div>이름: {selectedUser.name}</div>
            <div>이메일: {selectedUser.email}</div>
            <div>전화: {selectedUser.phone}</div>
            <div>도시: {selectedUser.address.city}</div>
            <div>회사: {selectedUser.company.name}</div>
          </div>
        ) : (
          <div>목록에서 사람을 눌러 보세요</div>
        )}
      </div>
    </div>
  );
}

// 화면: 잠깐 "불러오는 중..." 이 보였다가 사람 10명이 나옵니다.
//       첫 줄은 Leanne Graham / Gwenborough · Sincere@april.biz
// 화면(누르면): [이름순 정렬] → 버튼 글자가 "원래 순서" 로 바뀌고
//               맨 위가 Chelsey Dietrich 가 됩니다
// 화면(누르면): [없는 주소 (404)] → 빨간 글씨로
//               "사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
// 화면(누르면): 목록에서 Chelsey Dietrich → 아래 상자에 다섯 줄이 나옵니다

// ── 화면을 가르는 순서가 왜 중요한가 ──
//
// 위 세 갈래를 이 순서로 썼습니다.
//
//     loading  →  error  →  성공
//
// 순서를 바꿔 성공을 먼저 보면 이런 화면이 됩니다.
//   [다시 불러오기] 를 누른 직후, 아직 새 데이터가 안 왔는데
//   지난번 목록이 그대로 남아 있습니다. 사용자는 버튼이 안 먹었다고 생각합니다.
//
// error 를 성공보다 뒤에 두면 이런 화면이 됩니다.
//   [없는 주소] 로 실패했는데, users 에는 아까 받아 둔 10명이 남아 있으니
//   목록과 빨간 안내가 같이 보입니다. 무엇을 믿어야 할지 알 수 없습니다.
//
// 세 상태는 동시에 참일 수 없습니다. 화면도 그렇게 그려야 합니다.

// ── JS 판과 비교 ──
//
//   [1] 상세 보기
//       JS 판은 li 에 data-id 를 심고, 눌린 뒤 closest("li") 로 항목을 되찾고,
//       dataset 값을 Number() 로 바꿔야 했습니다. 그 파일에서 가장 어려운 문제였습니다.
//       여기서는 onClick={() => setSelectedId(user.id)} 한 줄입니다.
//       각 줄이 자기 user 를 이미 알고 있고, id 는 처음부터 숫자입니다.
//
//   [2] '못 불러왔다' 와 '검색 결과가 없다' 구분
//       JS 판은 hasError 라는 변수를 따로 두고, render 안에서
//       "실패한 상태면 안내를 건드리지 말 것" 을 손으로 지켜야 했습니다.
//       여기서는 화면을 세 갈래로 가른 것만으로 저절로 해결됩니다.
//       "검색 결과가 없습니다" 가 성공 갈래 안쪽에 있기 때문입니다.
//
//   [3] 다시 불러오기
//       JS 판은 loadUsers() 를 그냥 한 번 더 부르면 됐습니다.
//       React 에서는 그 대신 의존성 배열 안의 값을 바꿉니다.
//       이것이 이 파일에서 가장 낯선 부분이고, 그래서 문제 2가 가장 어렵습니다.
//
//   [4] 실시간 검색
//       JS 판은 input 이벤트에 render 를 붙였습니다.
//       여기서는 keyword 가 state 라서 글자가 바뀌면 화면이 저절로 다시 그려집니다.
//       "검색할 때 화면을 다시 그려라" 라는 코드가 아예 없습니다.

export default function Project03UserSearchAnswer() {
  return (
    <div>
      <h1>종합 03 정답 — 사용자 검색</h1>

      <p className="guide">
        먼저 스스로 만들어 본 다음에 보세요. <strong>인터넷 연결이 필요합니다.</strong>
        <br />
        <br />
        <strong>F12 → Console</strong> 을 함께 열어 두세요. 받아온 사람 수와 실패 이유가
        찍힙니다.
        <br />
        <br />
        인터넷이 막혀 있다면 실습프로젝트 폴더의 <code>index.html</code> 에서{" "}
        <code>오프라인_대체.js</code> 줄의 주석 기호만 지우세요.
        <br />
        <br />
        <strong>[없는 주소 (404)]</strong> 를 누르면 콘솔에 빨간{" "}
        <code>Failed to load resource ... 404</code> 가 나옵니다. <strong>정상입니다.</strong>{" "}
        브라우저가 알려 주는 줄이지 우리 코드의 에러가 아닙니다. 우리가 낸 것은 한글로,
        브라우저가 낸 것은 영어로 나옵니다.
      </p>

      <UserSearch />

      <Summary
        items={[
          "받아오는 화면은 로딩·에러·성공 셋 중 하나입니다. 화면도 그 순서로 가릅니다. 순서를 바꾸면 조용히 이상해집니다.",
          "fetch 는 404 를 실패로 치지 않습니다. if (!res.ok) throw 한 줄이 그것을 실패로 만들어 줍니다.",
          "로딩을 끄는 일은 finally 에 둡니다. try 안에 두면 실패했을 때 영원히 불러오는 중이 됩니다.",
          "useEffect 를 다시 돌리는 방법은 하나뿐입니다. 의존성 배열 안의 값을 바꾸는 것입니다.",
          "검색·정렬·상세는 전부 계산해서 씁니다. state 는 users·keyword·sortByName·selectedId 로 충분합니다.",
          "sort 는 원본을 바꿉니다. [...배열] 로 복사한 뒤에 정렬해야 원래 순서로 돌아올 수 있습니다.",
          "JS 판의 dataset·closest·hasError 가 통째로 사라졌습니다. 화면을 상태로 가르니 저절로 정리됐습니다.",
        ]}
      />
    </div>
  );
}
