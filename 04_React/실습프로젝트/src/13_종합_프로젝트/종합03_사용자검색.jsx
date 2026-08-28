// ============================================================
// 13단원 · 종합 03 — 사용자 검색
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 여세요.
// ============================================================
//
// ★ 이 앱은 JS자료 13단원 종합04와 같은 앱입니다.
//   연습용 서버에서 사람 10명을 받아 와서 검색 · 정렬 · 상세 보기를 합니다.
//   그때는 fetch 와 DOM 으로 만들었고, 이번에는 useEffect 와 state 로 만듭니다.
//
// ★★ 인터넷 연결이 필요합니다.
//   인터넷이 막힌 곳이라면 실습프로젝트 폴더의 index.html 을 열고
//   <script src="/오프라인_대체.js"> 줄을 감싼 주석 기호만 지우세요.
//   인터넷 요청 0건으로 똑같은 값이 나옵니다.
//   흉내 내는 것은 jsonplaceholder.typicode.com 하나뿐입니다.
//
// ★ 콘솔에 빨간 줄이 나오는 것은 정상입니다.
//   이 실습에는 일부러 없는 주소를 부르는 [없는 주소] 버튼이 있습니다.
//   그것을 누르면 브라우저가 이렇게 적습니다.
//
//       Failed to load resource: the server responded with a status of 404 (Not Found)
//
//   우리 코드가 낸 에러가 아니라 브라우저가 알려 주는 줄입니다.
//   막을 방법이 없고, 막을 필요도 없습니다. 실무에서도 그냥 나옵니다.
//   우리가 낸 것은 한글로 나오고, 브라우저가 낸 것은 영어로 나옵니다.
//
// [서버에서 오는 데이터의 모양] — 필요한 것만 적었습니다
//   { id: 1, name: "Leanne Graham", email: "...", phone: "...",
//     address: { city: "Gwenborough" }, company: { name: "..." } }
//
// [쓰는 단원] 09(useEffect · fetch · 로딩 · 에러) · 05·06·07(리스트 · 입력 · 파생 값)
//
// ★ 이 실습에서 가장 어려운 것은 문제 2 입니다.
//   고칠 코드는 몇 줄 안 됩니다. 어려운 것은 '왜 그래야 하는가' 입니다.
//   "한 번 받아온 화면을 어떻게 다시 받아오게 만드나" 라는 물음입니다.
//
// [푸는 법]
//   1) 아래로 내려가며 // TODO 를 찾아 코드를 고칩니다.
//   2) 저장하면 화면이 저절로 바뀝니다(Vite).
//   3) 화면 위쪽 [정상 주소] / [없는 주소] 버튼으로 성공과 실패를 둘 다 확인하세요.
//
// ★ 아직 아무것도 안 고친 지금도 화면은 나옵니다. 목록만 비어 있습니다.

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

  // 일부러 실패시켜 보는 스위치입니다. 이미 만들어 두었습니다.
  const [source, setSource] = useState("정상");

  // 문제 2에서 씁니다. 지금은 아무 데서도 안 쓰이는 값입니다.
  const [reloadCount, setReloadCount] = useState(0);

  // source 에 따라 부를 주소가 정해집니다.
  // /nousers 는 서버에 없는 주소라 404 로 대답합니다.
  const url = source === "정상" ? `${BASE_URL}/users` : `${BASE_URL}/nousers`;

  useEffect(() => {
    // 09단원 개념05의 깃발입니다. 이미 넣어 두었습니다.
    // 주소를 빨리 두 번 바꾸면 지난번 응답이 뒤늦게 도착할 수 있습니다.
    // 그때 그 값을 버리기 위한 표시입니다.
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      // 이 줄은 미리 넣어 두었습니다. effect 가 몇 번 돌았는지 세어 볼 수 있습니다.
      console.log("[요청] 보냅니다:", url);
      // 콘솔: [요청] 보냅니다: https://jsonplaceholder.typicode.com/users
      // 개발 중에는 처음에 두 번 찍힙니다. StrictMode 때문이고 정상입니다(09단원 개념02).

      // ───── 문제 1 ───── 목록 받아오기
      // 아래 순서로 채우세요. 09단원 개념04에서 만든 완성형과 같은 모양입니다.
      //   1) try 안에서 url 로 fetch 합니다
      //   2) res.ok 가 false 면 throw new Error(`서버 응답 오류 (${res.status})`)
      //      ★ 이 줄이 없으면 404 가 조용히 지나갑니다. fetch 는 404 를 실패로
      //        치지 않습니다. 대답을 받았으니 성공으로 봅니다(09단원 개념04).
      //   3) res.json() 으로 데이터를 꺼냅니다
      //   4) 몇 명을 받았는지 콘솔에 찍습니다
      //        console.log("[도착] 받은 사람 수:", data.length);
      //   5) if (ignore) return; 으로 오래된 응답이면 버리고, 아니면 setUsers(데이터)
      //   6) catch 에서 setError("사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.")
      //      콘솔에는 err.message 를 남깁니다 (사용자용 말과 개발자용 정보를 나눕니다)
      //   7) finally 에서 setLoading(false)
      //      ★ try 안에 두면 실패했을 때 영원히 "불러오는 중..." 이 됩니다.
      //
      // 기대 결과 (화면): 잠깐 뒤 목록에 사람 10명이 나옵니다.
      //                  첫 줄은 Leanne Graham / Gwenborough · Sincere@april.biz 입니다.
      //                  (문제 5·6까지 해야 목록이 눈에 보입니다)
      //                  콘솔에 "[도착] 받은 사람 수: 10" 이 찍히면 성공입니다.
      //                  개발 중에는 이 줄이 처음에 두 번 찍힙니다. StrictMode 때문이고
      //                  정상입니다(09단원 개념02).
      //                  [없는 주소] 를 눌렀을 때 아무 일도 없으면 res.ok 검사를 빠뜨린 것입니다.
      //
      // TODO: 여기에 코드를 쓰세요

      setLoading(false); // ← 문제 1을 풀면 이 줄은 finally 안으로 들어갑니다
    }

    loadUsers();

    return () => {
      ignore = true;
    };

    // ───── 문제 2 ───── 다시 불러오기  ★ 이 파일에서 가장 어렵습니다
    // 화면에 [다시 불러오기] 버튼이 있습니다. 지금 눌러도 아무 일도 안 일어납니다.
    //
    // 왜 그럴까요? useEffect 는 '의존성 배열 안의 값이 달라졌을 때' 만 다시 돕니다.
    // 지금 의존성 배열에는 url 하나뿐입니다. 버튼을 눌러도 url 은 그대로이니
    // React 는 "달라진 게 없네" 하고 아무 일도 하지 않습니다.
    //
    // 그래서 '누를 때마다 달라지는 값' 을 하나 만들어 의존성에 넣습니다.
    // 위에 만들어 둔 reloadCount 가 그 값입니다.
    //   ① [다시 불러오기] 버튼이 reloadCount 를 1 늘리게 하세요 (화면 아래쪽)
    //   ② 아래 의존성 배열에 reloadCount 를 넣으세요
    //
    // ★ 여기서 loadUsers() 를 버튼에서 직접 부르면 안 되나요?
    //   이 함수는 useEffect 안에 있어서 밖에서는 부를 수 없습니다.
    //   밖으로 꺼낼 수도 있지만, 그러면 '언제 받아오는가' 가 두 곳으로 흩어집니다.
    //   받아오는 조건을 전부 의존성 배열 한 줄에 모아 두는 편이 읽기 쉽습니다.
    //
    // 기대 결과 (화면): [다시 불러오기] 를 누르면 "불러오는 중..." 이 잠깐 보였다가
    //                  다시 10명이 나옵니다.
    //                  콘솔에 "[요청] 보냅니다: ..." 가 누를 때마다 한 줄씩 늘어납니다.
    //                  이 줄이 안 늘어나면 effect 가 다시 안 돈 것입니다.
    //                  [없는 주소] 상태에서 누르면 빨간 안내가 다시 나옵니다.
    //                  아무 일도 안 일어나면 ② 를 빠뜨린 것입니다.
    //                  화면이 멈추고 콘솔이 끝없이 늘어나면(무한 루프) 의존성에
    //                  reloadCount 대신 users 같은 것을 넣은 것입니다(09단원 개념06).
    //
    // TODO: 아래 대괄호 안을 고치세요
  }, [url]);

  // ───── 문제 3 ───── 검색으로 걸러내기
  // keyword 에 맞는 사람만 남기세요.
  //   - 검색어가 비어 있으면 전부
  //   - 이름(name) 또는 도시(user.address.city)에 검색어가 들어 있으면 남김
  //   - 대소문자를 구분하지 않습니다 (양쪽 다 toLowerCase)
  //
  // ★ 이것을 state 로 두지 마세요. users 와 keyword 로 언제든 계산됩니다(07단원 개념05).
  //
  // 기대 결과 (화면): 검색창에 gwen → 1명 (Leanne Graham)
  //                  이름이 아니라 도시 Gwenborough 로 걸린 것입니다. 대소문자도 무시됩니다.
  //                  검색창에 zzz → 0명
  //                  검색창을 비우면 다시 10명
  //                  대문자로 Gwen 을 쳤을 때만 나오면 toLowerCase 를 한쪽만 한 것입니다.
  //
  // TODO: 아래 줄을 고치세요
  const searched = users;

  // ───── 문제 4 ───── 이름순 정렬
  // sortByName 이 true 면 이름순으로 정렬한 배열을, 아니면 받은 순서 그대로 쓰세요.
  //   - 글자 정렬은 a - b 가 아니라 localeCompare 입니다(JS자료 08단원)
  //   - ★ sort 는 원본을 바꿉니다. [...searched] 로 복사한 뒤에 정렬하세요(07단원 개념01)
  //   - 그리고 아래 버튼 글자도 바꾸세요. 글자는 '지금 누르면 무엇이 되는지' 를 뜻합니다.
  //       정렬 안 된 상태 → "이름순 정렬"
  //       정렬된 상태     → "원래 순서"
  //
  // 기대 결과 (화면): [이름순 정렬] 을 누르면 버튼 글자가 "원래 순서" 로 바뀌고
  //                  목록 맨 위가 Chelsey Dietrich 가 됩니다.
  //                  한 번 더 누르면 맨 위가 Leanne Graham 으로 돌아옵니다.
  //                  원래 순서로 못 돌아오면 복사하지 않고 원본을 정렬한 것입니다.
  //
  // TODO: 아래 줄을 고치세요
  const visibleUsers = searched;

  function handleSort() {
    setSortByName(!sortByName);
  }

  // 상세로 볼 사람을 찾습니다. 이것도 계산해서 씁니다.
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
        <button onClick={handleSort}>이름순 정렬</button>
        {/* 문제 2의 ① 을 이 버튼에 씁니다 */}
        <button>다시 불러오기</button>
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

      {/* ───── 문제 5 ───── 화면 세 갈래
          지금은 세 경우를 안 가르고 목록만 그립니다. 그래서 불러오는 동안에는
          빈 화면이 잠깐 보이고, 실패해도 아무 말이 없습니다.
          아래를 이렇게 갈라 주세요. 순서가 중요합니다.
            ① loading 이면            → "불러오는 중..." 만 보여 준다
            ② 아니고 error 가 있으면  → 빨간 안내만 보여 준다 (className="output error")
            ③ 아니면                  → 목록을 그린다
          기다리는 중에는 다른 것을 볼 필요가 없으니 loading 을 가장 먼저 봅니다.
          순서를 바꾸면 로딩 중에 지난번 목록이 잠깐 다시 나타나는 이상한 화면이 됩니다.

          기대 결과 (화면): 화면을 열면 "불러오는 중..." 이 잠깐 보였다가 목록이 나옵니다.
            [없는 주소] 를 누르면 빨간 글씨로
            "사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
            로딩 글자가 계속 남아 있으면 finally 에서 setLoading(false) 를 안 한 것입니다.
            에러와 목록이 같이 보이면 ③ 에 error 검사를 안 넣은 것입니다.

          TODO: 아래를 세 갈래로 고치세요 */}

      {/* ───── 문제 6 ───── 목록 그리기
          visibleUsers 를 map 으로 돌면서 li 를 그리세요. key 는 user.id 입니다.
          li 하나의 모양:
            <li key={...} onClick={...} style={{ cursor: "pointer" }}>
              <strong>{user.name}</strong>
              <div>{user.address.city} · {user.email}</div>
            </li>
          누르면 setSelectedId(user.id) 가 되게 하세요.

          기대 결과 (화면): 사람 10명이 나옵니다. 첫 줄은
            Leanne Graham
            Gwenborough · Sincere@april.biz
          key 를 빠뜨리면 화면은 나오지만 콘솔에 노란 경고가 뜹니다.
          누르는데 아래 상세가 안 바뀌면 onClick 에 setSelectedId 를 안 넣은 것입니다.

          TODO: 아래 ul 안을 고치세요 */}
      <ul>
        <li>여기에 목록이 나옵니다 (문제 6)</li>
      </ul>

      {/* ───── 문제 7 ───── 검색 결과가 없을 때
          걸러낸 결과가 0명이면 "검색 결과가 없습니다" 를 보여 주세요.
          ★ 로딩 중이거나 에러일 때는 이 문구가 나오면 안 됩니다.
            "못 불러왔다" 와 "검색 결과가 없다" 는 전혀 다른 이야기입니다.
            둘을 섞으면 사용자가 원인을 알 수 없습니다. 문제 5의 ③ 안쪽에 두면 됩니다.

          기대 결과 (화면): 검색창에 zzz → 검색 결과가 없습니다
            [없는 주소] 를 눌렀을 때는 이 문구 대신 빨간 안내만 보여야 합니다.
            둘 다 같이 보이면 문제 5의 ③ 바깥에 둔 것입니다.

          TODO: 여기에 코드를 쓰세요 */}

      {/* ───── 문제 8 ───── 상세 보기
          selectedUser 가 있으면 아래 다섯 줄을 보여 주세요. 없으면 안내 한 줄입니다.
            이름 / 이메일 / 전화 / 도시(user.address.city) / 회사(user.company.name)

          기대 결과 (화면): 목록에서 Chelsey Dietrich 를 누르면
            이름: Chelsey Dietrich
            이메일: Lucio_Hettinger@annie.ca
            전화: (254)954-1289
            도시: Roscoeview
            회사: Keebler LLC
          "Cannot read properties of undefined" 로 화면이 터지면
          selectedUser 가 있는지 확인하지 않고 바로 꺼내 쓴 것입니다(11단원 개념03 [실수 4]).

          TODO: 아래 output 안을 고치세요 */}
      <div className="output">목록에서 사람을 눌러 보세요 (문제 8)</div>
    </div>
  );
}

export default function Project03UserSearch() {
  return (
    <div>
      <h1>종합 03 — 사용자 검색</h1>

      <p className="guide">
        <strong>인터넷 연결이 필요합니다.</strong> JS자료 13단원 종합04와 같은 앱을
        React 로 다시 만듭니다. 문제는 <strong>8개</strong>입니다.
        <br />
        <br />
        <strong>가장 어려운 것은 문제 2(다시 불러오기)</strong> 입니다. 고칠 코드는 몇 줄
        안 되지만 "왜 그래야 하는가" 가 어렵습니다.
        <br />
        <br />
        인터넷이 막혀 있다면 실습프로젝트 폴더의 <code>index.html</code> 에서{" "}
        <code>오프라인_대체.js</code> 줄의 주석 기호만 지우세요. 인터넷 없이 똑같이
        동작합니다.
        <br />
        <br />
        <strong>[없는 주소 (404)]</strong> 를 누르면 콘솔에 빨간{" "}
        <code>Failed to load resource ... 404</code> 가 나옵니다. <strong>정상입니다.</strong>{" "}
        브라우저가 알려 주는 줄이지 우리 코드의 에러가 아닙니다.
        <br />
        <br />
        막히면 <strong>종합03_사용자검색_정답.jsx</strong> 를 보세요.
      </p>

      <UserSearch />

      <Summary
        items={[
          "데이터를 받아오는 화면은 로딩·에러·성공 세 가지 상태 중 하나입니다. 화면도 그 순서로 가릅니다.",
          "fetch 는 404 를 실패로 치지 않습니다. if (!res.ok) throw 한 줄이 그것을 실패로 만들어 줍니다.",
          "로딩을 끄는 일은 finally 에 둡니다. try 안에 두면 실패했을 때 영원히 불러오는 중이 됩니다.",
          "useEffect 는 의존성 배열의 값이 달라졌을 때만 다시 돕니다. 다시 받아오려면 그 안의 값을 바꿉니다.",
          "검색 결과와 정렬 결과는 state 가 아닙니다. users 와 keyword 에서 계산합니다.",
          "sort 는 원본을 바꿉니다. [...배열] 로 복사한 뒤에 정렬하세요.",
          "'못 불러왔다' 와 '검색 결과가 없다' 는 다른 이야기입니다. 화면에서 섞이지 않게 하세요.",
        ]}
      />
    </div>
  );
}
