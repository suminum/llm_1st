// ============================================================
// 09단원 · 개념 05 — 값이 바뀌면 다시 받기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요. 인터넷 연결이 필요합니다.
// ============================================================
//
// 지금까지는 의존성 배열이 늘 [] 였습니다. 처음 한 번만 받아왔습니다.
// 하지만 진짜 앱은 이렇게 동작합니다.
//
//     사용자가 목록에서 다른 사람을 고른다   → 그 사람 정보를 다시 받아온다
//     검색창에 다른 글자를 친다              → 그 글자로 다시 검색한다
//     다음 페이지 버튼을 누른다              → 다음 페이지를 다시 받아온다
//
// 방법은 이미 개념01에서 배웠습니다. 의존성 배열에 그 값을 넣으면 됩니다.
//
//     useEffect(() => { 받아오기 }, [userId]);
//
// 정말 이게 전부입니다. 그런데 여기서 새 문제가 하나 생깁니다.
// 요청을 여러 번 보내면 답이 보낸 순서대로 오지 않는다는 것입니다.
// 이 파일의 후반부가 그 이야기입니다.
//
// [연습용 서버의 사용자 이름이 영어인 이유]
//   jsonplaceholder 는 외국에서 만든 연습용 서버라 사람 이름이 영어입니다.
//   Leanne Graham · Ervin Howell 처럼 나오는 것이 정상입니다.

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── 섹션 1: 의존성에 값 넣기 ──

function UserPickerDemo() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await res.json();

      console.log(`[사용자 고르기] ${userId}번을 받아왔습니다: ${data.name}`);
      // 콘솔: [사용자 고르기] 1번을 받아왔습니다: Leanne Graham
      // 콘솔: [사용자 고르기] 2번을 받아왔습니다: Ervin Howell
      // 콘솔: [사용자 고르기] 3번을 받아왔습니다: Clementine Bauch

      setUser(data);
      setLoading(false);
    }

    loadUser();
  }, [userId]); // ★ userId 가 바뀔 때마다 다시 받아옵니다

  return (
    <div className="demo">
      <h3>① 고른 사람의 정보를 받아옵니다</h3>

      <button onClick={() => setUserId(1)}>1번</button>
      <button onClick={() => setUserId(2)}>2번</button>
      <button onClick={() => setUserId(3)}>3번</button>

      {loading ? (
        <p className="output">불러오는 중...</p>
      ) : (
        <div className="output">
          <p>이름: {user.name}</p>
          <p>이메일: {user.email}</p>
        </div>
      )}
      {/* 화면: 이름: Leanne Graham / 이메일: Sincere@april.biz */}
      {/* 화면(누르면): [2번] → 이름: Ervin Howell / 이메일: Shanna@melissa.tv */}
    </div>
  );
}

// 버튼을 눌러 보세요. 누를 때마다 콘솔에 한 줄씩 늘어납니다.
//
// 여기서 벌어지는 일을 순서대로 보면 이렇습니다.
//   1) 버튼을 누른다 → setUserId(2) → state 가 바뀐다
//   2) 컴포넌트가 다시 실행된다 → 화면이 다시 그려진다
//   3) React 가 의존성 배열을 확인한다. userId 가 1에서 2로 달라졌다
//   4) effect 를 다시 실행한다 → 2번 사용자를 받아온다
//   5) setUser 로 state 가 바뀐다 → 화면이 또 그려진다
//
// [같은 번호를 두 번 눌러도 요청이 안 나갑니다]
//   [2번] 을 누르고 또 [2번] 을 누르면 콘솔에 아무것도 안 늘어납니다.
//   userId 가 2에서 2로 그대로라 React 가 "달라진 게 없네" 하고 넘어갑니다.
//   요청을 아껴 주는 셈입니다. 의존성 배열의 이런 성질을 알아 두면 쓸모가 많습니다.
//
// [setLoading(true) 를 왜 다시 부르나]
//   처음 받아온 뒤에는 loading 이 false 입니다.
//   다시 받아올 때 true 로 돌려놓지 않으면, 새 데이터를 기다리는 동안
//   옛날 사람 정보가 화면에 그대로 남아 있습니다.
//   사용자는 이미 [2번] 을 눌렀는데 화면에는 1번이 보이는 상태입니다.

// ✏️ 직접 해보기 1 — [4번] 버튼을 하나 더 만들어 보세요.
//                    (버튼 한 줄만 추가하면 됩니다. 나머지 코드는 그대로입니다)

// ── 섹션 2: 입력창과 이어 붙이기 ──

// 06단원에서 배운 제어 컴포넌트를 그대로 씁니다.
// 입력값을 state 에 담고, 그 state 를 의존성 배열에 넣으면 끝입니다.

function SearchDemo() {
  const [keyword, setKeyword] = useState("1");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 빈 칸이면 요청을 보내지 않습니다. 보낼 이유가 없으니까요.
    if (keyword.trim() === "") {
      setPosts([]);
      return; // effect 를 여기서 끝냅니다
    }

    async function loadPosts() {
      const res = await fetch(`${BASE_URL}/posts?userId=${keyword}&_limit=3`);
      const data = await res.json();

      console.log(`[검색] userId 가 ${keyword} 인 글 ${data.length}개를 받았습니다`);
      // 콘솔: [검색] userId 가 1 인 글 3개를 받았습니다

      setPosts(data);
    }

    loadPosts();
  }, [keyword]); // 입력값이 바뀔 때마다 다시 검색합니다

  return (
    <div className="demo">
      <h3>② 입력한 번호로 글 검색하기</h3>

      <p>
        작성자 번호(1~10):{" "}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </p>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.id}. {post.title}
          </li>
        ))}
      </ul>
      {/* 화면: 1. sunt aut facere... / 2. qui est esse / 3. ea molestias quasi... */}
      {/* 화면(고치면): 2 를 넣으면 11·12·13번 글로 바뀝니다 */}
    </div>
  );
}

// 입력칸의 숫자를 2로 바꿔 보세요. 목록이 바뀝니다.
//
// [글자 하나 칠 때마다 요청이 나갑니다]
//   "12" 를 치면 "1" 로 한 번, "12" 로 한 번, 모두 두 번 요청이 나갑니다.
//   콘솔을 보면 그대로 보입니다.
//
//   진짜 검색창이라면 문제가 됩니다. 열 글자를 치면 요청이 열 번 나가니까요.
//   실무에서는 "타자를 멈추고 0.3초 지나면 그때 보내기" 같은 방법을 씁니다.
//   디바운스라고 부릅니다. 만드는 방법은 이 단원의 범위를 넘으니 이름만 알아 두세요.
//
//   대신 지금 우리가 꼭 알아야 할 문제가 있습니다.
//   요청을 여러 개 겹쳐 보내면 답이 순서대로 오지 않는다는 것입니다.
//   섹션 3에서 그 문제를 봅니다.
//
// [입력값이 없으면 일찍 return]
//   effect 안에서도 return 으로 일찍 끝낼 수 있습니다.
//   위 코드에서 return 뒤에 아무것도 안 적은 것에 주의하세요.
//   effect 에서 무언가를 return 하면 React 가 정리 함수로 씁니다(개념02).
//   여기서는 "그냥 여기서 끝" 이라는 뜻이라 빈손으로 return 합니다.

// ✏️ 직접 해보기 2 — _limit=3 을 _limit=5 로 바꾸고, 입력칸에 1을 넣어 보세요.
//                    몇 줄이 나옵니까?

// ── 섹션 3: 오래된 응답이 나중에 도착한다 ──

// 이제 이 파일의 진짜 주제입니다.
//
// 요청 두 개를 잇달아 보냈다고 해 봅시다.
//
//     1번 사용자를 요청  ────────────────────→ (0.55초 걸림) 도착
//     2번 사용자를 요청     ──────→ (0.25초 걸림) 도착
//
// 2번을 나중에 요청했는데 먼저 도착했습니다.
// 그러면 화면은 이렇게 됩니다.
//
//     2번 도착 → 화면에 2번을 그림
//     1번 도착 → 화면에 1번을 그림      ← 사용자가 마지막으로 고른 건 2번인데!
//
// 화면이 뒤늦게 옛날 것으로 되돌아갑니다.
// 에러는 한 줄도 안 납니다. 화면만 조용히 틀립니다. 이런 버그가 가장 찾기 어렵습니다.
//
// 실제로는 어떤 요청이 늦을지 아무도 모릅니다. 그날의 네트워크 상황에 달렸습니다.
// 그래서 이 데모에서는 확실히 보여 주기 위해 1번 사용자만 일부러 조금 늦게 답하게 했습니다.

// 일부러 늦추는 도우미입니다. JS자료 12단원에서 본 Promise 를 그대로 씁니다.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SLOW_ID = 1; // 이 번호만 일부러 늦게 답합니다
const SLOW_MS = 250; // 얼마나 늦출지

function RaceProblemDemo() {
  const [userId, setUserId] = useState(2);
  const [name, setName] = useState("아직 없음");

  useEffect(() => {
    async function loadUser() {
      console.log(`[문제] ${userId}번 요청을 보냈습니다`);
      // 콘솔: [문제] 2번 요청을 보냈습니다
      // 콘솔: [문제] 1번 요청을 보냈습니다
      // 콘솔: [문제] 3번 요청을 보냈습니다

      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await res.json();

      if (userId === SLOW_ID) {
        await wait(SLOW_MS); // 1번만 일부러 늦게 도착하게 만듭니다
      }

      console.log(`[문제] ${userId}번 응답 도착 → 화면에 그립니다: ${data.name}`);
      // 콘솔: [문제] 2번 응답 도착 → 화면에 그립니다: Ervin Howell
      // 콘솔: [문제] 1번 응답 도착 → 화면에 그립니다: Leanne Graham

      setName(data.name);
    }

    loadUser();
  }, [userId]);

  // 손으로 두 버튼을 아주 빠르게 누르는 것과 같은 일을 대신해 줍니다.
  // 1번을 고르고 곧바로 2번을 고릅니다.
  function runRace() {
    setUserId(1);
    setTimeout(() => setUserId(2), 80);
  }

  return (
    <div className="demo">
      <h3>③ [문제] 늦게 온 옛 응답이 화면을 덮어씁니다</h3>
      <p className="output">지금 화면에 그린 이름: {name}</p>
      {/* 화면: 지금 화면에 그린 이름: Ervin Howell */}
      <button onClick={runRace}>1번 → 곧바로 2번 고르기</button>
      {/* 화면(누르면): 잠깐 Ervin Howell 이었다가 Leanne Graham 으로 되돌아갑니다 */}
      <button onClick={() => setUserId(3)}>3번 고르기 (평범하게)</button>
      {/* 화면(누르면): 지금 화면에 그린 이름: Clementine Bauch */}
    </div>
  );
}

// 버튼을 누르고 화면을 보세요.
//
//   마지막으로 고른 것은 2번(Ervin Howell)인데
//   0.3초쯤 뒤에 화면이 1번(Leanne Graham)으로 바뀝니다.
//
// 콘솔을 보면 도착 순서가 뒤집힌 것이 그대로 보입니다.
// "요청을 보낸 순서" 와 "답이 도착한 순서" 는 다를 수 있습니다.
// 이것을 경쟁 상태(race condition)라고 부릅니다.
// 요청들이 서로 먼저 도착하려고 달리기하는 것 같다고 해서 붙은 이름입니다.
//
// 옆의 [3번 고르기] 버튼도 눌러 보세요. 이쪽은 아무 문제가 없습니다.
// 하나를 고르고, 답이 온 뒤에, 또 하나를 고르는 평범한 경우입니다.
// 문제는 답이 오기 전에 다른 것을 고를 때만 생깁니다.
// 사용자가 목록을 빠르게 훑거나 검색창에 글자를 이어서 칠 때가 바로 그 상황입니다.

// ✏️ 직접 해보기 3 — 위 SLOW_ID 를 1에서 2로 바꿔 보세요.
//                    이번에는 어느 이름이 화면에 남을까요? 먼저 예상하고 확인하세요.

// ── 섹션 4: ignore 플래그로 늦은 응답 버리기 ──

// 요청을 도중에 되돌릴 수는 없습니다. 이미 나간 편지 같은 것입니다.
// 대신 이렇게 할 수 있습니다.
//
//     "답이 오긴 왔는데, 이제 필요 없는 답이면 그냥 버린다"
//
// 필요 없는 답인지 어떻게 알까요? 정리 함수가 알려 줍니다.
// 개념02에서 배운 것을 다시 떠올려 보세요.
//
//     의존성 값이 바뀌면 → 지난 effect 의 정리 함수를 먼저 부르고 → 새 effect 를 실행한다
//
// 즉 정리 함수가 불렸다는 것은 "이 effect 는 이제 옛날 것" 이라는 뜻입니다.
// 그래서 이렇게 씁니다.
//
//     useEffect(() => {
//       let ignore = false;            // 이 요청은 아직 유효하다
//
//       async function load() {
//         const data = await 받아오기();
//         if (ignore) return;          // 옛날 것이면 여기서 그만
//         setState(data);
//       }
//       load();
//
//       return () => {
//         ignore = true;               // 이 effect 는 이제 옛날 것이 됐다
//       };
//     }, [userId]);
//
// ignore 는 effect 가 실행될 때마다 새로 만들어지는 평범한 변수입니다.
// 요청 하나마다 자기 몫의 ignore 를 하나씩 가집니다.
// 그래서 2번 요청이 도착할 때 1번 요청의 ignore 를 건드릴 걱정이 없습니다.

function RaceFixedDemo() {
  const [userId, setUserId] = useState(2);
  const [name, setName] = useState("아직 없음");

  useEffect(() => {
    // 이 effect 만의 표시입니다. 처음에는 "아직 쓸모 있음" 입니다.
    let ignore = false;

    async function loadUser() {
      console.log(`[해결] ${userId}번 요청을 보냈습니다`);
      // 콘솔: [해결] 2번 요청을 보냈습니다
      // 콘솔: [해결] 1번 요청을 보냈습니다
      // 콘솔: [해결] 3번 요청을 보냈습니다

      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await res.json();

      if (userId === SLOW_ID) {
        await wait(SLOW_MS);
      }

      if (ignore) {
        console.log(`[해결] ${userId}번 응답 — 지금 화면과 안 맞아서 버립니다`);
        // 콘솔: [해결] 2번 응답 — 지금 화면과 안 맞아서 버립니다
        // 콘솔: [해결] 1번 응답 — 지금 화면과 안 맞아서 버립니다
        return; // state 를 건드리지 않고 끝냅니다
      }

      console.log(`[해결] ${userId}번 응답 도착 → 화면에 그립니다: ${data.name}`);
      // 콘솔: [해결] 2번 응답 도착 → 화면에 그립니다: Ervin Howell

      setName(data.name);
    }

    loadUser();

    return () => {
      // 이 effect 가 물러날 때 표시를 바꿔 둡니다.
      ignore = true;
    };
  }, [userId]);

  function runRace() {
    setUserId(1);
    setTimeout(() => setUserId(2), 80);
  }

  return (
    <div className="demo">
      <h3>④ [해결] 늦게 온 응답은 버립니다</h3>
      <p className="output">지금 화면에 그린 이름: {name}</p>
      {/* 화면: 지금 화면에 그린 이름: Ervin Howell */}
      <button onClick={runRace}>1번 → 곧바로 2번 고르기</button>
      {/* 화면(누르면): Ervin Howell 그대로입니다. 되돌아가지 않습니다 */}
      <button onClick={() => setUserId(3)}>3번 고르기 (평범하게)</button>
      {/* 화면(누르면): 지금 화면에 그린 이름: Clementine Bauch */}
    </div>
  );
}

// 이번에는 버튼을 눌러도 화면이 Ervin Howell 그대로입니다.
// 1번 응답은 도착했지만 "안 맞아서 버립니다" 하고 지나갔습니다.
//
// [처음 나타날 때도 한 번 버려집니다]
//   콘솔 맨 위를 보면 아무것도 안 했는데 "2번 응답 — 안 맞아서 버립니다" 가 있습니다.
//   개념02에서 배운 StrictMode 때문입니다. 붙였다 뗐다 다시 붙이니까
//   첫 번째 effect 는 정리되고, 그 요청의 답은 버려집니다.
//   ignore 플래그가 제대로 도는지 여기서 확인할 수 있는 셈입니다.
//
// [화면에 안 그릴 뿐, 요청은 그대로 나갔습니다]
//   ignore 는 요청을 취소하는 것이 아닙니다. 이미 나간 요청은 그대로 갔다 옵니다.
//   그 답을 화면에 반영하지 않을 뿐입니다.
//   요청 자체를 도중에 끊는 방법도 있지만 이 자료에서는 다루지 않습니다.
//   화면이 틀리는 것을 막는 데는 ignore 만으로 충분합니다.
//
// [이 모양을 외우세요]
//   의존성 배열에 값이 들어 있는 fetch effect 는 거의 항상 이 모양입니다.
//   let ignore = false → 받아온 뒤 if (ignore) return → 정리 함수에서 ignore = true.
//   세 줄이면 됩니다.

// ✏️ 직접 해보기 4 — 위 정리 함수 안의 ignore = true 줄만 잠시 지우고
//                    버튼을 눌러 보세요. 섹션 3의 문제가 돌아옵니까?
//                    (확인 후 되돌리세요)

// ── 섹션 5: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] 값이 바뀌는데 의존성 배열을 [] 로 둠
// useEffect(() => {
//   loadUser();
// }, []);
// 실수: 처음 한 번만 받아옵니다. 버튼을 눌러도 화면이 안 바뀝니다.
//       에러가 안 나서 "버튼이 고장 났나?" 하고 엉뚱한 데를 찾게 됩니다.
//       버튼을 눌렀는데 화면이 안 바뀌면 의존성 배열부터 보세요.

// [실수 2] 다시 받아올 때 로딩 표시를 안 켬
// 실수: 새 데이터를 기다리는 동안 옛날 데이터가 화면에 남아 있습니다.
//       사용자는 2번을 눌렀는데 화면에는 1번이 보입니다. 섹션 1의 setLoading(true) 참고.

// [실수 3] ignore 를 effect 밖에 둠
// let ignore = false;                 ← 컴포넌트 본문에 두면
// useEffect(() => { ... }, [userId]);
// 실수: 요청마다 자기 몫을 갖지 못하고 하나를 같이 씁니다.
//       한 번 true 가 되면 그다음 요청까지 전부 버려져서 화면이 아예 안 바뀝니다.
//       ignore 는 반드시 useEffect 안, 맨 첫 줄에 둡니다.

// [실수 4] 정리 함수에서 ignore = true 를 빠뜨림
// 실수: 변수만 있고 아무도 안 바꾸니 항상 false 입니다. 없는 것과 같습니다.
//       에러도 경고도 없이 섹션 3의 문제가 그대로 남습니다. ✏️ 4에서 확인해 보세요.

// [실수 5] 검색어를 의존성에 넣고 매 글자마다 요청
// 실수: 틀린 코드는 아닙니다. 다만 열 글자를 치면 요청이 열 번 나갑니다.
//       연습에서는 괜찮지만, 진짜 서비스라면 서버가 힘들어합니다.
//       그럴 때 쓰는 방법이 있다는 것만 알아 두세요. 이 단원의 범위 밖입니다.

// ── 화면 ──

export default function Concept05RefetchOnChange() {
  return (
    <div>
      <h1>개념 05 — 값이 바뀌면 다시 받기</h1>

      <p className="guide">
        <strong>인터넷 연결이 필요합니다.</strong> <strong>F12 → Console</strong> 을 함께
        열어 두세요. 요청이 몇 번 나가는지 콘솔로 세어 볼 수 있습니다.
        <br />
        <br />③ 번 상자는 <strong>일부러 틀리게 만든 예제</strong>입니다. 화면이 뒤늦게
        옛날 이름으로 되돌아가는 것이 정상입니다. ④ 번이 고친 것입니다.
        <br />
        <br />
        이 연습용 서버의 사람 이름은 <strong>영어</strong>입니다. Leanne Graham 처럼 나오는
        것이 정상입니다.
      </p>

      <UserPickerDemo />
      <SearchDemo />
      <RaceProblemDemo />
      <RaceFixedDemo />

      <Summary
        items={[
          "다시 받아오게 하려면 의존성 배열에 그 값을 넣습니다. useEffect(() => { 받아오기 }, [userId]) 면 끝입니다.",
          "같은 값을 다시 넣으면 effect 가 안 돕니다. React 가 지난번 값과 비교해서 달라졌을 때만 실행합니다.",
          "다시 받아올 때는 로딩 표시도 다시 켜세요. 안 그러면 새 데이터를 기다리는 동안 옛날 데이터가 화면에 남습니다.",
          "요청을 여러 번 보내면 답이 보낸 순서대로 오지 않습니다. 늦게 온 옛 응답이 화면을 덮어쓰는 것을 경쟁 상태라고 합니다.",
          "effect 맨 위에 let ignore = false 를 두고, 받아온 뒤 if (ignore) return 하고, 정리 함수에서 ignore = true 로 바꿉니다.",
          "ignore 는 요청을 취소하지 않습니다. 이미 나간 요청의 답을 화면에 반영하지 않을 뿐입니다. 그것으로 충분합니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) <button onClick={() => setUserId(4)}>4번</button>
//    // 콘솔: [사용자 고르기] 4번을 받아왔습니다: Patricia Lebsack
//    → 버튼 한 줄만 늘리면 됩니다. useEffect 도 화면 코드도 손댈 것이 없습니다.
//      의존성 배열에 userId 를 넣어 둔 덕분입니다.
//
// 2) const res = await fetch(`${BASE_URL}/posts?userId=${keyword}&_limit=5`);
//    // 콘솔: [검색] userId 가 1 인 글 5개를 받았습니다
//    → 화면에도 다섯 줄이 나옵니다.
//      1번 사용자가 쓴 글은 모두 10개라 _limit 을 20으로 해도 10개까지만 나옵니다.
//
// 3) SLOW_ID 를 2로 바꾸면 이번에는 1번(Leanne Graham)이 먼저 도착하고
//    2번(Ervin Howell)이 늦게 도착합니다.
//    화면에는 Ervin Howell 이 남습니다.
//    // 콘솔: [문제] 1번 응답 도착 → 화면에 그립니다: Leanne Graham
//    → 결과만 보면 "맞게 나왔네?" 싶습니다. 마지막에 고른 것이 2번이니까요.
//      하지만 우연히 맞은 것입니다. 늦게 온 응답이 이겼다는 사실은 그대로입니다.
//      네트워크가 조금만 달라지면 다시 틀립니다.
//      "가끔 맞는 코드" 가 가장 위험한 코드입니다.
//
// 4) 섹션 3의 문제가 그대로 돌아옵니다.
//    화면이 Ervin Howell 에서 Leanne Graham 으로 되돌아갑니다.
//    // 콘솔: [해결] 1번 응답 도착 → 화면에 그립니다: Leanne Graham
//    → ignore 변수는 그대로 있는데 아무도 true 로 바꾸지 않으니 if (ignore) 가
//      한 번도 참이 되지 않습니다. 있으나 마나입니다.
//      "버립니다" 줄이 콘솔에서 사라진 것이 증거입니다.
//      확인이 끝났으면 ignore = true 를 꼭 되돌려 놓으세요.
