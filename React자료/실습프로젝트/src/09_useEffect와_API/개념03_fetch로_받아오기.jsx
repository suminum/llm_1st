// ============================================================
// 09단원 · 개념 03 — fetch 로 받아오기
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요. 인터넷 연결이 필요합니다.
// ============================================================
//
// 드디어 useEffect 를 가장 많이 쓰는 자리에 왔습니다. 서버에서 데이터 받아오기입니다.
//
// 좋은 소식이 있습니다. fetch 는 이미 다 배웠습니다.
// JS자료 12단원 개념03·04에서 이렇게 썼습니다.
//
//     const res = await fetch(주소);
//     const data = await res.json();
//
// React 라고 해서 달라지는 것은 하나도 없습니다. 똑같은 fetch, 똑같은 await 입니다.
// 새로 배울 것은 딱 두 가지뿐입니다.
//
//     ① 이 코드를 '어디에' 두는가        →  useEffect 안
//     ② 받은 데이터를 '어떻게' 화면에 넣는가 →  state 에 담는다
//
// 인터넷이 막힌 실습실이라면 실습프로젝트 폴더의 index.html 에서
// 오프라인_대체.js 줄을 감싼 주석만 지우세요 (개념01 머리말 참고).

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

// JS자료 12단원에서 쓰던 연습용 서버와 같은 곳입니다.
const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── 섹션 1: 왜 useEffect 안에서 부르나 ──

// 먼저 useEffect 없이 해 보면 왜 필요한지 알 수 있습니다.
// 컴포넌트 본문에 fetch 를 그냥 적었다고 생각해 봅시다.
//
// function PostView() {
//   const [post, setPost] = useState(null);

//   fetch(`${BASE_URL}/posts/1`)          ← 본문에 그냥 적으면
//     .then((res) => res.json())
//     .then((data) => setPost(data));     ← 여기서 state 를 바꾸고

//   return <p>{post.title}</p>;
// }

// 이 코드는 이렇게 돕니다.
//
//     화면을 그린다 → 요청을 보낸다 → 데이터가 온다 → state 를 바꾼다
//     → 화면을 다시 그린다 → 또 요청을 보낸다 → 또 데이터가 온다 → ...
//
// 끝이 없습니다. 서버에 요청이 끝없이 나갑니다.
// 게다가 StrictMode 는 컴포넌트 본문을 두 번 부르니(개념02) 요청도 두 배로 나갑니다.
//
// 그래서 규칙이 하나 생깁니다.
//
//     컴포넌트 본문에서는 요청을 보내지 않는다. useEffect 안에서 보낸다.
//
// useEffect 는 화면을 다 그린 뒤에, 그것도 의존성 배열이 허락할 때만 실행됩니다.
// [] 를 붙이면 처음 한 번만 요청이 나갑니다. 이것이 우리가 원하는 동작입니다.
//
// 아래 데모로 "본문이 몇 번 실행되는지" 를 먼저 눈으로 확인하세요.

function RenderCountDemo() {
  const [tick, setTick] = useState(0);

  // 여기가 컴포넌트 본문입니다.
  // 이 자리에 fetch 를 두면, 이 줄이 찍힐 때마다 요청이 한 번씩 나갑니다.
  console.log("[섹션 1] 본문 실행 — 여기에 fetch 를 두면 요청이 나갑니다");
  // 콘솔: [섹션 1] 본문 실행 — 여기에 fetch 를 두면 요청이 나갑니다

  // function PostView() {
  //   const [post, setPost] = useState(null);
  //   console.log("fetch");

  //   fetch(`${BASE_URL}/posts/1`)
  //     .then((res) => res.json())
  //     .then((data) => setPost(data));

  //   return <p>{post.title}</p>;
  // }

  return (
    <div className="demo">
      <h3>① 본문은 화면을 그릴 때마다 실행됩니다</h3>
      <p className="output">다시 그린 횟수: {tick}</p>
      {/* 화면: 다시 그린 횟수: 0 */}
      <button onClick={() => setTick(tick + 1)}>다시 그리기</button>
      {/* 화면(누르면): 다시 그린 횟수: 1 */}
    </div>
  );
}

// 이 데모는 요청을 보내지 않습니다. 글자만 찍습니다.
// 하지만 저 console.log 자리에 fetch 가 있었다면, 찍힌 줄 수만큼 요청이 나갔을 것입니다.
// state 를 바꾸는 다른 코드가 하나만 있어도 이 숫자는 끝없이 올라갑니다.

// ✏️ 직접 해보기 1 — [다시 그리기] 를 세 번 누르고 콘솔 줄 수를 세어 보세요.
//                    그 자리에 fetch 가 있었다면 요청이 몇 번 나갔을까요?
//                    (개발 중에는 StrictMode 때문에 두 배로 찍힙니다 — 개념02)

// ── 섹션 2: useEffect(async () => ...) 가 안 되는 이유 ──

// await 를 쓰려면 async 함수 안이어야 합니다(JS자료 12단원 개념04 규칙 1).
// 그러니 이렇게 쓰고 싶어집니다. 누구나 처음에 이렇게 씁니다.
//
//     useEffect(async () => {              ← ✕ 이렇게 쓰면 안 됩니다
//       const res = await fetch(url);
//       const data = await res.json();
//       setPost(data);
//     }, []);
//
// 문법 에러는 아닙니다. 화면도 얼추 나옵니다. 그런데 콘솔에 경고가 뜹니다.
//
//     useEffect must not return anything besides a function,
//     which is used for clean-up.
//
// 왜 그럴까요? 두 가지를 이어 붙이면 답이 나옵니다.
//
//   (가) async 함수는 '항상 Promise 를 돌려준다'  (JS자료 12단원 개념04 규칙 2)
//   (나) useEffect 는 '돌려받은 것을 정리 함수로 쓴다'  (개념02 섹션 2)
//
// 그러니 React 는 Promise 를 정리 함수라고 믿게 됩니다.
// 나중에 정리하려고 그것을 함수처럼 부르면 함수가 아니라 낭패입니다.
// 그래서 React 가 미리 "함수 말고 다른 걸 돌려주지 마" 라고 알려 주는 것입니다.
//
// ★ 위 코드를 진짜로 써 보고 싶다면, 확인만 하고 반드시 되돌리세요.
//   경고가 콘솔에 계속 남아서 다른 문제를 가립니다.
//
// [해결책] effect 안에 async 함수를 만들고, 그 함수를 부릅니다.
//
//     useEffect(() => {              ← 이 함수는 async 가 아닙니다
//       async function load() {      ← 안쪽에 async 함수를 만들고
//         const res = await fetch(url);
//         ...
//       }
//       load();                      ← 부릅니다
//     }, []);
//
// useEffect 에 넘긴 바깥 함수는 여전히 평범한 함수라 아무것도 return 하지 않습니다.
// await 는 안쪽 async 함수 안에 들어 있으니 규칙도 지켜집니다.
// 처음 보면 번거로워 보이지만, 이유를 알고 나면 자연스러운 모양입니다.

// ✏️ 직접 해보기 2 — load 라는 이름이 마음에 안 들면 다른 이름으로 바꿔도 될까요?
//                    아래 섹션 3의 함수 이름을 fetchPost 로 바꿔 보세요.

// ── 섹션 3: 글 하나 받아오기 ──

function OnePostDemo() {
  // 아직 아무것도 못 받았으니 null 로 시작합니다. 이 선택은 섹션 5에서 다시 봅니다.
  const [post, setPost] = useState(null);

  useEffect(() => {
    // ① effect 안에 async 함수를 만들고
    async function loadPost() {
      const res = await fetch(`${BASE_URL}/posts/1`);
      const data = await res.json();

      console.log("받은 글의 제목:", data.title);
      // 콘솔: 받은 글의 제목: sunt aut facere repellat provident occaecati excepturi optio reprehenderit

      // ② 받은 데이터를 state 에 담습니다. 그래야 화면이 다시 그려집니다.
      setPost(data);
    }

    // ③ 만든 함수를 부릅니다
    loadPost();
  }, []); // 처음 한 번만 받아옵니다

  return (
    <div className="demo">
      <h3>② 글 하나 받아오기</h3>
      {post === null ? (
        <p className="output">아직 못 받았습니다</p>
      ) : (
        <div className="output">
          <p>
            <strong>{post.title}</strong>
          </p>
          <p>{post.body}</p>
        </div>
      )}
      {/* 화면: 잠깐 "아직 못 받았습니다" 가 보였다가 영어 제목과 본문으로 바뀝니다 */}
    </div>
  );
}

// 여기서 일어나는 일을 시간 순서로 보면 이렇습니다.
//
//   1) 컴포넌트가 처음 실행된다. post 는 null 이다.
//   2) 화면이 그려진다. "아직 못 받았습니다" 가 보인다.
//   3) useEffect 가 실행되어 요청이 나간다.
//   4) 데이터가 도착한다. setPost(data) 로 state 가 바뀐다.
//   5) 컴포넌트가 다시 실행된다. 이번엔 post 에 값이 있다.
//   6) 화면이 다시 그려진다. 제목과 본문이 보인다.
//
// 화면이 두 번 그려집니다. 그래서 초기값이 반드시 필요합니다.
// 첫 번째 화면에 넣을 것이 있어야 하니까요.
//
// 5)에서 컴포넌트가 다시 실행되면 useEffect 도 또 도는 것 아니냐고요?
// 의존성 배열이 [] 이니 다시 돌지 않습니다. 그래서 무한 루프가 안 생깁니다.
// 섹션 1의 나쁜 예와 갈리는 지점이 정확히 여기입니다.

// ✏️ 직접 해보기 3 — /posts/1 을 /posts/5 로 바꿔 보세요. 제목이 바뀝니까?

// ── 섹션 4: 목록 받아서 그리기 ──

// 받은 것이 배열이면 05단원에서 배운 map 을 그대로 씁니다.
// 서버에서 왔다고 특별한 배열이 아닙니다. 그냥 배열입니다.

function PostListDemo() {
  // 목록이니 빈 배열로 시작합니다. 이러면 map 을 바로 써도 안전합니다.
  const [posts, setPosts] = useState(null); //[]를 null로 바꾸면 정상작동 하는가??

  useEffect(() => {
    async function loadPosts() {
      // 주소 뒤의 ?_limit=3 은 "3개만 주세요" 입니다 (JS자료 12단원 개념03)
      const res = await fetch(`${BASE_URL}/posts?_limit=3`);
      const data = await res.json();

      console.log("받은 글 개수:", data.length);
      // 콘솔: 받은 글 개수: 3

      setPosts(data);
    }

    loadPosts();
  }, []);

  return (
    //return으로 화면을 만든 다음 useEffect가 실행되고 그 안에서 setPosts가 실행되는 흐름이야.
    <div className="demo">
      <h3>③ 목록 받아서 그리기</h3>
      <ul>
        {posts?.map(
          //null이기 때문에 map 을 실행안함 undifined반환하면 그냥 빈 ul을 반환함 {}에서는 map을 사용할 수 없음
          (
            post, //.? 하면 에러가 안남??
          ) => (
            // key 는 05단원 개념03에서 배운 그것입니다. 서버가 준 id 를 쓰면 딱 좋습니다.
            <li key={post.id}>
              {post.id}. {post.title}
            </li>
          ),
        )}
      </ul>
      {/* 화면: 1. sunt aut facere... / 2. qui est esse / 3. ea molestias quasi... */}
    </div>
  );
}

// 초기값을 빈 배열([])로 둔 것이 중요합니다.
// null 로 두면 첫 화면에서 null.map(...) 이 되어 그 자리에서 터집니다.
// 배열을 그릴 것이면 빈 배열로, 객체 하나를 그릴 것이면 null 로 시작하는 것이 편합니다.
//
// 빈 배열이면 map 이 아무것도 안 만들고 조용히 빈 목록이 나옵니다.
// "받아오는 중" 이라는 표시는 개념04에서 제대로 붙입니다.

// ✏️ 직접 해보기 4 — _limit=3 을 _limit=5 로 바꾸고, 콘솔의 개수도 함께 확인하세요.

// ── 섹션 5: 첫 렌더에는 데이터가 없다 ──

// 이 단원에서 학생들이 가장 많이 터지는 지점입니다.
//
//     const [user, setUser] = useState(null);
//     ...
//     return <p>{user.name}</p>;      ← 첫 화면에서 여기가 터집니다
//
// 에러 메시지는 이렇게 나옵니다.
//     Cannot read properties of null (reading 'name')
//
// 데이터가 늦게 오는 것은 고칠 수 없습니다. 네트워크는 원래 느립니다.
// 그러니 "아직 없는 상태" 를 화면이 감당하게 만들어야 합니다. 방법은 세 가지입니다.
//
//   [방법 1] 초기값을 빈 배열·빈 문자열로 둔다 — 목록이나 글자에 잘 맞습니다
//   [방법 2] 조건부 렌더링으로 갈라 준다 — 05단원의 삼항 연산자나 &&
//   [방법 3] 일찍 return 한다 — 05단원 개념01
//
// 아래 데모는 방법 3을 씁니다.

function FirstRenderDemo() {
  const [user, setUser] = useState(null);

  // 컴포넌트 본문입니다. 화면을 그릴 때마다 실행됩니다.
  console.log("[화면 그리는 중] user 가 아직 null 인가?", user === null);
  // 콘솔: [화면 그리는 중] user 가 아직 null 인가? true
  // 콘솔: [화면 그리는 중] user 가 아직 null 인가? false

  useEffect(() => {
    async function loadUser() {
      const res = await fetch(`${BASE_URL}/users/1`);
      const data = await res.json();
      setUser(data);
    }

    loadUser();
  }, []);

  // [방법 3] 아직 없으면 여기서 끝내 버립니다. 아래 줄은 실행되지 않습니다.
  if (user === null) {
    return (
      <div className="demo">
        <h3>④ 첫 렌더에는 데이터가 없다</h3>
        <p className="output">사용자 정보를 기다리는 중</p>
      </div>
    );
  }
  // return (
  //      <div className="demo">
  //        <h3>③ 첫 렌더에는 데이터가 없다</h3>
  //        {user === null ? (
  //          <p className="output">사용자 정보를 기다리는 중</p>
  //        ) : (
  //          <div className="output">
  //            <p>이름: {user.name}</p>
  //            <p>이메일: {user.email}</p>
  //          </div>
  //        )}
  //      </div>
  //    );
  // 여기까지 왔다면 user 는 반드시 객체입니다. 마음 놓고 점을 찍어도 됩니다.
  return (
    <div className="demo">
      <h3>④ 첫 렌더에는 데이터가 없다</h3>
      <div className="output">
        <p>이름: {user.name}</p>
        <p>이메일: {user.email}</p>
      </div>
      {/* 화면: 이름: Leanne Graham / 이메일: Sincere@april.biz */}
      <button onClick={() => setUser(null)}>받은 정보 지우기</button>
      {/* 화면(누르면): 사용자 정보를 기다리는 중 — 첫 화면을 다시 볼 수 있습니다 */}
    </div>
  );
}

// 콘솔을 보면 "user 가 아직 null 인가?" 가 처음엔 true, 나중엔 false 로 바뀝니다.
// 컴포넌트가 두 번 실행됐다는 뜻입니다. 데이터가 오기 전에 한 번, 온 뒤에 한 번.
//
// [일찍 return 하는 방법의 장점]
//   아래쪽 코드에서는 user 가 null 일 경우를 다시 생각하지 않아도 됩니다.
//   user && user.name 같은 검사를 화면 곳곳에 뿌리지 않아도 됩니다.
//   화면에 넣을 값이 많을수록 이 방식이 편합니다.
//
// [훅은 일찍 return 하기 전에 부릅니다]
//   위 코드에서 useState 와 useEffect 가 if 문보다 위에 있습니다. 우연이 아닙니다.
//   훅은 컴포넌트 맨 위에서만 부를 수 있습니다(04단원 개념06).
//   if 문 아래에 useEffect 를 두면 어떤 날은 실행되고 어떤 날은 안 되니 규칙 위반입니다.
//
// [받은 정보 지우기] 버튼을 눌러 보세요. 첫 화면이 다시 나옵니다.
//   그런데 아무리 기다려도 데이터가 다시 오지 않습니다. 고장이 아닙니다.
//   의존성 배열이 [] 라서 effect 가 다시 돌지 않기 때문입니다.
//   다시 받아오게 하려면 화면 맨 위의 [이 예제를 처음부터 다시 그리기] 를 누르세요.
//   컴포넌트가 새로 만들어지면서 [] effect 도 처음처럼 한 번 실행됩니다.
//   값이 바뀔 때마다 다시 받아오는 방법은 개념05에서 배웁니다.

// ✏️ 직접 해보기 5 — 위 일찍 return 을 삼항 연산자 한 개로 바꿔 보세요.
//                    (05단원 개념01에서 배운 방법입니다)

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] useEffect(async () => { ... }, []) — 섹션 2에서 설명했습니다.
//   경고가 뜨고, 정리 함수를 쓸 수 없게 됩니다.

// [실수 2] 의존성 배열을 아예 안 씀
// useEffect(() => {
//   loadPost();
// });
// 실수: 화면을 그릴 때마다 요청이 나갑니다. 받아온 데이터를 state 에 넣으면
//       다시 그려지고 또 요청이 나갑니다. 섹션 1의 무한 루프와 같습니다.
//       ★ 주석을 풀지 마세요. 서버에 요청이 끝없이 나갑니다.

// [실수 3] 초기값 null 인데 바로 점을 찍음
// return <p>{post.title}</p>;
// 실수: Cannot read properties of null 로 이 예제가 빨간 상자가 됩니다.
//       섹션 5의 세 가지 방법 중 하나를 쓰세요.

// [실수 4] res 를 데이터라고 생각함
// const res = await fetch(url);
// setPost(res);
// 실수: res 는 '응답' 이지 내용이 아닙니다. res.json() 을 한 번 더 거쳐야 데이터입니다.
//       JS자료 12단원 개념03에서 then 이 두 번이었던 것과 같은 이야기입니다.

// [실수 5] res.json() 앞에 await 를 빠뜨림
// 이건 에러가 안 납니다. 조용히 아무것도 안 나옵니다. 그래서 아래에 실제로 돌려 둡니다.

function MissingAwaitDemo() {
  const [title, setTitle] = useState("아직 못 받았습니다");

  useEffect(() => {
    async function loadPost() {
      const res = await fetch(`${BASE_URL}/posts/2`);

      const data = res.json(); // ← await 를 일부러 빠뜨렸습니다

      console.log("[실수 5] data.title 은", data.title);
      // 콘솔: [실수 5] data.title 은 undefined

      setTitle(data.title);
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>⑤ [실수 5] await 를 빠뜨리면 조용히 빈 화면</h3>
      <p className="output">제목: {title}</p>
      {/* 화면: 제목:   ← 제목 자리가 텅 빕니다. 에러는 한 줄도 안 납니다 */}
    </div>
  );
}

// await 를 빼면 data 에는 내용이 아니라 Promise 가 들어갑니다.
// Promise 에는 title 이라는 속성이 없으니 undefined 입니다.
// React 는 undefined 를 화면에 아무것도 안 그리고 넘어갑니다. 그래서 조용합니다.
//
// 이런 버그를 만나면 순서가 있습니다.
//   ① 화면이 비었다 → ② 넣으려던 값을 console.log 로 찍어 본다
//   → ③ undefined 면 그 값을 만든 줄로 거슬러 올라간다
// 이 습관이 디버깅 시간을 가장 많이 줄여 줍니다.

// ── 화면 ──

export default function Concept03FetchInEffect() {
  // 개념01에서 쓴 것과 같은 방법입니다. key 가 바뀌면 아래 상자들이 통째로 새로 만들어져
  // [] 를 쓴 useEffect 도 처음처럼 한 번 더 실행됩니다.
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 03 — fetch 로 받아오기</h1>

      <p className="guide">
        <strong>인터넷 연결이 필요합니다.</strong>{" "}
        <strong>F12 → Console</strong> 과 <strong>Network</strong> 탭을 함께
        보면 요청이 나가는 것이 보입니다.
        <br />
        <br />
        인터넷이 막힌 실습실이라면 실습프로젝트 폴더의 <code>
          index.html
        </code>{" "}
        에서 <code>오프라인_대체.js</code> 줄을 감싼 주석만 지우세요.
        <br />
        <br />⑤ 번 상자는 <strong>일부러 틀리게 만든 예제</strong>입니다. 제목
        자리가 비어 있는 것이 정상입니다.
      </p>

      <button onClick={() => setRestartKey(restartKey + 1)}>
        이 예제를 처음부터 다시 그리기
      </button>

      <div key={restartKey}>
        <RenderCountDemo />
        <OnePostDemo />
        <PostListDemo />
        <FirstRenderDemo />
        <MissingAwaitDemo />
      </div>

      <Summary
        items={[
          "fetch·async·await 는 JS자료 12단원에서 배운 그대로입니다. React 에서 달라지는 것은 '어디에 두는가' 와 '받은 값을 state 에 담는다' 뿐입니다.",
          "요청은 컴포넌트 본문이 아니라 useEffect 안에서 보냅니다. 본문에서 보내면 화면을 그릴 때마다 요청이 나가고 무한 루프가 됩니다.",
          "useEffect(async () => ...) 는 쓸 수 없습니다. async 함수는 Promise 를 돌려주는데 useEffect 는 그것을 정리 함수로 착각하기 때문입니다.",
          "대신 effect 안에 async 함수를 만들고 그 함수를 부릅니다. 바깥 함수는 평범한 함수로 남습니다.",
          "처음 한 번만 받아올 때는 의존성 배열을 [] 로 둡니다. 그래야 state 를 바꿔도 다시 요청하지 않습니다.",
          "첫 화면에는 데이터가 없습니다. 초기값을 빈 배열로 두거나, 조건부 렌더링이나 일찍 return 으로 '아직 없는 상태' 를 그려 주세요.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 세 번 누르면 여섯 줄이 늘어납니다. 한 번에 두 줄씩입니다.
//    // 콘솔: [섹션 1] 본문 실행 — 여기에 fetch 를 두면 요청이 나갑니다
//    → 두 줄인 이유는 StrictMode 가 본문을 두 번 부르기 때문입니다(개념02).
//      그 자리에 fetch 가 있었다면 요청이 여섯 번 나갔을 것입니다.
//      버튼 세 번 누른 것만으로 말입니다.
//      게다가 받아온 데이터를 state 에 넣으면 다시 그려지고 또 요청이 나가서
//      끝이 없어집니다. 이것이 본문에서 요청을 보내면 안 되는 이유입니다.
//
// 2) 됩니다. 아무 이름이나 괜찮습니다.
//    useEffect(() => {
//      async function fetchPost() {
//        const res = await fetch(`${BASE_URL}/posts/1`);
//        const data = await res.json();
//        setPost(data);
//      }
//      fetchPost();
//    }, []);
//    → 이름을 바꿨으면 아래 부르는 줄도 함께 바꿔야 합니다.
//      "load 라고 써야 한다" 는 규칙은 없습니다. 다만 loadPost·fetchUser 처럼
//      무엇을 받아오는지 드러나는 이름이 나중에 읽기 좋습니다.
//
// 3) 바뀝니다.
//    const res = await fetch(`${BASE_URL}/posts/5`);
//    // 콘솔: 받은 글의 제목: nesciunt quas odio
//    → 주소의 숫자 하나만 바꾸면 됩니다. 나머지 코드는 손댈 것이 없습니다.
//
// 4) const res = await fetch(`${BASE_URL}/posts?_limit=5`);
//    // 콘솔: 받은 글 개수: 5
//    → 화면에도 다섯 줄이 나옵니다. map 은 배열 길이에 맞춰 알아서 늘어납니다.
//
// 5) return (
//      <div className="demo">
//        <h3>③ 첫 렌더에는 데이터가 없다</h3>
//        {user === null ? (
//          <p className="output">사용자 정보를 기다리는 중</p>
//        ) : (
//          <div className="output">
//            <p>이름: {user.name}</p>
//            <p>이메일: {user.email}</p>
//          </div>
//        )}
//      </div>
//    );
//    // 화면: 이름: Leanne Graham / 이메일: Sincere@april.biz
//    → 결과는 같습니다. 다만 삼항 안쪽에서는 user 가 null 일 수 있다는 것을
//      계속 신경 써야 합니다. 화면에 넣을 값이 두세 개를 넘어가면
//      일찍 return 쪽이 읽기 편해집니다. 둘 중 무엇이 옳다기보다 상황에 따라 고릅니다.
