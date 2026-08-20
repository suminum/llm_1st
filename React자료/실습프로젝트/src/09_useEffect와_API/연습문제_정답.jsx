// ============================================================
// 09단원 · 연습문제 정답 (14문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요. 7번부터는 인터넷 연결이 필요합니다.
// ============================================================
//
// 먼저 스스로 풀어 본 다음에 보세요.
// 답이 달라도 결과가 같으면 맞은 것입니다. 여기 적힌 것은 한 가지 예입니다.
//
// ★ 콘솔에 같은 줄이 두 번씩 찍히는 것은 정상입니다(개념02 StrictMode).
//   이 파일의 // 콘솔: 에는 한 번만 적어 두었습니다.
//
// ★ 10 · 11번은 일부러 없는 글을 요청합니다.
//   콘솔의 빨간 Failed to load resource ... 404 줄은 정상입니다.
//   우리 코드가 낸 에러가 아니라 브라우저가 알려 주는 것입니다.

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ───── 문제 1 정답 ───── (개념01)
// 처음 한 번만 실행하려면 의존성 배열을 [] 로 둡니다.
// 빈 배열은 "지켜볼 값이 없다" 는 뜻이라 달라질 것도 없어서 다시 실행되지 않습니다.

function Answer01() {
  useEffect(() => {
    console.log("09단원 시작합니다");
    // 콘솔: 09단원 시작합니다
  }, []);

  return (
    <div className="demo">
      <h3>문제 1 — 처음 나타날 때 한 번만</h3>
      <p className="output">콘솔(F12)을 보세요</p>
    </div>
  );
}

// ───── 문제 2 정답 ───── (개념01)
// 의존성 배열 자리를 아예 비워 두면 화면을 다시 그릴 때마다 실행됩니다.
// 쉼표와 대괄호를 통째로 빼는 것이지, 빈 배열([])을 넣는 것이 아닙니다.
// 둘은 정반대입니다. 이 차이가 09단원에서 가장 많이 틀리는 곳입니다.

function Answer02() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    console.log("다시 그려졌습니다");
    // 콘솔: 다시 그려졌습니다
  });

  return (
    <div className="demo">
      <h3>문제 2 — 매번 실행되게 하기</h3>
      <p className="output">다시 그린 횟수: {tick}</p>
      {/* 화면: 다시 그린 횟수: 0 */}
      <button onClick={() => setTick(tick + 1)}>다시 그리기</button>
      {/* 화면(누르면): 다시 그린 횟수: 1 */}
    </div>
  );
}

// ───── 문제 3 정답 ───── (개념01)
// 의존성 배열에 count 만 넣습니다. menu 는 넣지 않습니다.
// [메뉴 바꾸기] 를 누르면 화면은 다시 그려지지만 effect 는 가만히 있습니다.

function Answer03() {
  const [count, setCount] = useState(0);
  const [menu, setMenu] = useState("아메리카노");

  useEffect(() => {
    console.log("지금 잔 수: " + count);
    // 콘솔: 지금 잔 수: 0
    // 콘솔: 지금 잔 수: 1
  }, [count]);

  return (
    <div className="demo">
      <h3>문제 3 — 특정 값이 바뀔 때만</h3>
      <p className="output">
        {menu} {count}잔
      </p>
      {/* 화면: 아메리카노 0잔 */}
      <button onClick={() => setCount(count + 1)}>잔 수 +1</button>
      <button onClick={() => setMenu(menu === "아메리카노" ? "라떼" : "아메리카노")}>
        메뉴 바꾸기
      </button>
      {/* 화면(누르면): 아메리카노 1잔 → 라떼 1잔 */}
    </div>
  );
}

// ───── 문제 4 정답 ───── (개념01)
// document.title 은 React 가 그리는 #root 바깥에 있습니다.
// JSX 로는 손댈 수 없으니 useEffect 에서 바꿉니다. 전형적인 부작용입니다.

function Answer04() {
  const [todoCount, setTodoCount] = useState(0);

  useEffect(() => {
    document.title = `할일 ${todoCount}개`;
    console.log("탭 제목:", document.title);
    // 콘솔: 탭 제목: 할일 0개
    // 콘솔: 탭 제목: 할일 1개
  }, [todoCount]);

  return (
    <div className="demo">
      <h3>문제 4 — 탭 제목 바꾸기</h3>
      <p className="output">할 일 {todoCount}개</p>
      {/* 화면: 할 일 0개 — 브라우저 탭 글자도 "할일 0개" 가 됩니다 */}
      <button onClick={() => setTodoCount(todoCount + 1)}>할 일 추가</button>
      {/* 화면(누르면): 할 일 1개 — 탭 글자도 "할일 1개" 로 바뀝니다 */}
    </div>
  );
}

// ───── 문제 5 · 6 정답 ───── (개념02)
// setInterval 을 켜고, 정리 함수에서 clearInterval 로 끕니다.
//
// setSeconds((prev) => prev + 1) 로 쓴 것이 중요합니다.
// setSeconds(seconds + 1) 로 쓰면 effect 가 처음 실행될 때의 seconds(0)를
// 계속 붙잡고 있어서 화면이 1에서 멈춥니다. 개념06 섹션 2의 오래된 값 문제입니다.
// 함수형 갱신을 쓰면 seconds 를 읽지 않으니 의존성 배열이 [] 여도 맞습니다.
//
// [문제 6 정답] (다) 둘 다 입니다.
//   다른 예제를 고르면 이 컴포넌트가 화면에서 사라지므로 정리 함수가 불립니다.
//   돌아오면 새로 마운트되는데, StrictMode 가 붙였다 뗐다 다시 붙이므로
//   그때도 정리 함수가 한 번 불립니다.
//   그래서 콘솔에는 "켰습니다 → 껐습니다 → 켰습니다" 순서로 세 줄이 나옵니다.

function Answer05() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log("타이머를 켰습니다");
    // 콘솔: 타이머를 켰습니다

    const id = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(id);
      console.log("타이머를 껐습니다");
      // 콘솔: 타이머를 껐습니다
    };
  }, []);

  return (
    <div className="demo">
      <h3>문제 5 · 6 — 타이머와 정리 함수</h3>
      <p className="output">{seconds}초</p>
      {/* 화면: 0초 → 1초 → 2초 ... 1초마다 올라갑니다 */}
    </div>
  );
}

// ───── 문제 7 정답 ───── (개념03)
// useEffect 에 넘기는 바깥 함수에는 async 를 붙이지 않습니다.
// 안에 async 함수를 만들고, 만든 뒤에 부르는 줄을 잊지 마세요.
// 만들기만 하고 안 부르면 아무 일도 일어나지 않습니다. 에러도 안 납니다.

function Answer07() {
  const [title, setTitle] = useState("아직 못 받았습니다");

  useEffect(() => {
    async function loadPost() {
      const res = await fetch(`${BASE_URL}/posts/3`);
      const data = await res.json();

      console.log("문제7 제목:", data.title);
      // 콘솔: 문제7 제목: ea molestias quasi exercitationem repellat qui ipsa sit aut

      setTitle(data.title);
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>문제 7 — 글 하나 받아오기</h3>
      <p className="output">{title}</p>
      {/* 화면: ea molestias quasi exercitationem repellat qui ipsa sit aut */}
    </div>
  );
}

// ───── 문제 8 정답 ───── (개념03)
// 초기값을 빈 배열로 둔 것이 중요합니다.
// null 로 두면 첫 화면에서 null.map(...) 이 되어 그 자리에서 터집니다.
// 서버가 준 id 를 key 로 쓰면 딱 좋습니다(05단원 개념03).

function Answer08() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      const res = await fetch(`${BASE_URL}/users?_limit=3`);
      const data = await res.json();

      console.log(
        "문제8 이름들:",
        data.map((user) => user.name)
      );
      // 콘솔: 문제8 이름들: ['Leanne Graham', 'Ervin Howell', 'Clementine Bauch']

      setUsers(data);
    }

    loadUsers();
  }, []);

  return (
    <div className="demo">
      <h3>문제 8 — 목록 받아서 그리기</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      {/* 화면: Leanne Graham / Ervin Howell / Clementine Bauch */}
    </div>
  );
}

// ───── 문제 9 정답 ───── (개념04)
// loading 의 초기값은 true 입니다. 화면이 나타나는 순간 이미 요청이 나가 있으니까요.
// 다 받은 뒤에 false 로 바꿉니다.

function Answer09() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      const res = await fetch(`${BASE_URL}/posts/3`);
      const data = await res.json();

      setTitle(data.title);
      setLoading(false);

      console.log("문제9 로딩을 껐습니다");
      // 콘솔: 문제9 로딩을 껐습니다
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>문제 9 — 로딩 표시</h3>
      <p className="output">{loading ? "불러오는 중..." : title}</p>
      {/* 화면: 잠깐 "불러오는 중..." 이 보였다가 영어 제목으로 바뀝니다 */}
    </div>
  );
}

// ───── 문제 10 정답 ───── (개념04)
// 404 는 fetch 입장에서 성공입니다. 서버가 대답을 했으니까요.
// if (!res.ok) throw 로 우리가 직접 "이건 실패다" 라고 정해 주어야 catch 로 갑니다.
// 이 한 줄이 없으면 catch 로 가지 않고 빈 객체 {} 를 받아 화면이 조용히 비어 버립니다.

function Answer10() {
  const [message, setMessage] = useState("확인 중");

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`${BASE_URL}/posts/9999`);

        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        }

        const data = await res.json();
        setMessage(data.title);
      } catch (err) {
        console.log("문제10 에러:", err.message);
        // 콘솔: 문제10 에러: 서버 응답 오류 (404)

        setMessage("에러가 났습니다");
      }
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>문제 10 — res.ok 확인하기</h3>
      <p className="output">{message}</p>
      {/* 화면: 에러가 났습니다 */}
    </div>
  );
}

// ───── 문제 11 정답 ───── (개념04)
// 화면을 가르는 순서는 loading → error → 성공 입니다.
// 로딩을 끄는 일은 finally 에 둡니다. try 안에 두면 실패했을 때 못 끕니다.
// 새 요청을 시작할 때 setError(null) 로 지난 에러를 지우는 습관도 함께 들이세요.

function Answer11() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/posts/9999`);

        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError("글을 불러오지 못했습니다");
        console.log("문제11 실패:", err.message);
        // 콘솔: 문제11 실패: 서버 응답 오류 (404)
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>문제 11 — 세 갈래 화면</h3>
      {loading && <p className="output">불러오는 중...</p>}
      {!loading && error !== null && <p className="output error">{error}</p>}
      {!loading && error === null && post !== null && (
        <p className="output">{post.title}</p>
      )}
      {/* 화면: 잠깐 "불러오는 중..." 이 보였다가 "글을 불러오지 못했습니다" 로 바뀝니다 */}
    </div>
  );
}

// ───── 문제 12 정답 ───── [응용] (개념05)
// 의존성 배열에 userId 를 넣으면 버튼을 누를 때마다 다시 받아옵니다.
// setLoading(true) 를 effect 맨 앞에 다시 넣은 것에 주의하세요.
// 안 넣으면 새 데이터를 기다리는 동안 옛날 이름이 화면에 남아 있습니다.

function Answer12() {
  const [userId, setUserId] = useState(1);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await res.json();

      console.log("문제12 받아온 이름:", data.name);
      // 콘솔: 문제12 받아온 이름: Leanne Graham
      // 콘솔: 문제12 받아온 이름: Ervin Howell
      // 콘솔: 문제12 받아온 이름: Clementine Bauch

      setName(data.name);
      setLoading(false);
    }

    loadUser();
  }, [userId]);

  return (
    <div className="demo">
      <h3>문제 12 [응용] — 고른 사람 다시 받아오기</h3>
      <button onClick={() => setUserId(1)}>1번</button>
      <button onClick={() => setUserId(2)}>2번</button>
      <button onClick={() => setUserId(3)}>3번</button>
      <p className="output">{loading ? "불러오는 중..." : name}</p>
      {/* 화면: Leanne Graham */}
      {/* 화면(누르면): [2번] → Ervin Howell / [3번] → Clementine Bauch */}
    </div>
  );
}

// ───── 문제 13 정답 ───── [도전] (개념05)
// 세 줄이면 됩니다.
//   let ignore = false;              effect 맨 위
//   if (ignore) return;              받아온 뒤, state 를 바꾸기 전
//   ignore = true;                   정리 함수 안
//
// ignore 는 effect 가 실행될 때마다 새로 만들어지는 변수입니다.
// 요청 하나마다 자기 몫을 하나씩 가지므로 서로 간섭하지 않습니다.
// 컴포넌트 본문에 두면 여러 요청이 하나를 같이 써서 망가집니다.

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Answer13() {
  const [userId, setUserId] = useState(2);
  const [name, setName] = useState("아직 없음");

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await res.json();

      // 1번만 일부러 늦게 도착하게 만듭니다 (문제에서 시킨 대로)
      if (userId === 1) {
        await wait(250);
      }

      if (ignore) {
        console.log("문제13 늦게 온 응답을 버렸습니다:", data.name);
        // 콘솔: 문제13 늦게 온 응답을 버렸습니다: Ervin Howell
        return;
      }

      console.log("문제13 화면에 그립니다:", data.name);
      // 콘솔: 문제13 화면에 그립니다: Ervin Howell

      setName(data.name);
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [userId]);

  function runRace() {
    setUserId(1);
    setTimeout(() => setUserId(2), 80);
  }

  return (
    <div className="demo">
      <h3>문제 13 [도전] — 늦게 온 응답 버리기</h3>
      <p className="output">지금 화면에 그린 이름: {name}</p>
      {/* 화면: 지금 화면에 그린 이름: Ervin Howell */}
      <button onClick={runRace}>경쟁 재현 (1번 → 곧바로 2번)</button>
      {/* 화면(누르면): Ervin Howell 그대로입니다. 되돌아가지 않습니다 */}
      <button onClick={() => setUserId(3)}>3번 고르기 (평범하게)</button>
      {/* 화면(누르면): 지금 화면에 그린 이름: Clementine Bauch */}
    </div>
  );
}

// 처음 화면에 나타날 때도 "버렸습니다" 가 한 줄 찍힙니다.
// StrictMode 가 붙였다 뗐다 다시 붙이기 때문입니다(개념02).
// 첫 번째 effect 의 정리 함수가 불리면서 ignore 가 true 가 되고,
// 그 요청의 답은 버려집니다. ignore 가 제대로 도는지 여기서도 확인할 수 있습니다.

// ───── 문제 14 정답 ───── 에러 확인 (개념06)
//
// [물음 1] 왜 끝없이 도는가
//   effect 안에서 count 를 바꾸는데 그 count 가 의존성 배열에 들어 있기 때문입니다.
//   effect 실행 → count 바뀜 → 화면 다시 그림 → 의존성이 달라짐 → effect 실행 → ...
//   멈출 이유가 없습니다.
//
// [물음 2] 어떻게 고치나
//   effect 안에서 count 를 '읽지' 않으면 됩니다.
//   setCount((prev) => prev + 1) 로 쓰면 지난 값을 React 가 넘겨주므로
//   count 를 읽을 일이 없어지고, 의존성 배열도 [] 로 둘 수 있습니다.
//   그러면 처음 한 번만 실행되고 끝납니다.
//
//   다른 방법도 있습니다. 애초에 useEffect 를 안 쓰는 것입니다.
//   "숫자를 하나 올린다" 는 화면 밖의 일이 아니라서 부작용이 아닙니다.
//   useState(1) 로 시작하면 effect 자체가 필요 없습니다.

function Answer14() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("문제14 effect 실행 — 숫자를 1 올립니다");
    // 콘솔: 문제14 effect 실행 — 숫자를 1 올립니다

    setCount((prev) => prev + 1);
  }, []);

  return (
    <div className="demo">
      <h3>문제 14 — 무한 루프 고치기</h3>
      <p className="output">숫자: {count}</p>
      {/* 화면: 숫자: 2 */}
    </div>
  );
}

// 화면에 2 가 나오는 것이 이상해 보일 수 있습니다.
// StrictMode 가 개발 중에 effect 를 두 번 실행하기 때문입니다(개념02).
// 배포한 앱에서는 한 번만 실행되어 1 이 됩니다.
//
// 그런데 이 사실이 알려 주는 것이 하나 더 있습니다.
// "두 번 실행하면 결과가 달라지는 코드" 라는 뜻입니다.
// 정리 함수로도 되돌릴 수 없는 종류라서, 사실 이런 일은 effect 로 하면 안 됩니다.
// 물음 2의 두 번째 방법(useState(1) 로 시작하기)이 더 나은 답인 이유가 이것입니다.

// ── 화면 ──

export default function Unit09Answers() {
  return (
    <div>
      <h1>09단원 연습문제 정답 (14문항)</h1>

      <p className="guide">
        먼저 스스로 풀어 본 다음에 보세요. 답이 달라도 결과가 같으면 맞은 것입니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 을 함께 열어 두세요. 같은 줄이 두 번씩 찍히는 것은
        정상입니다(개념02 StrictMode).
        <br />
        <br />
        10 · 11번은 <strong>일부러 없는 글을 요청</strong>합니다. 콘솔에 빨간{" "}
        <code>Failed to load resource ... 404</code> 줄이 나오는 것이 정상입니다. 우리
        코드가 낸 에러가 아니라 브라우저가 알려 주는 것입니다.
      </p>

      <Answer01 />
      <Answer02 />
      <Answer03 />
      <Answer04 />
      <Answer05 />
      <Answer07 />
      <Answer08 />
      <Answer09 />
      <Answer10 />
      <Answer11 />
      <Answer12 />
      <Answer13 />
      <Answer14 />

      <Summary
        items={[
          "의존성 배열을 아예 안 쓰는 것과 빈 배열([])을 쓰는 것은 정반대입니다. 앞은 매번, 뒤는 처음 한 번입니다.",
          "setInterval 안에서 state 를 올릴 때는 setSeconds((prev) => prev + 1) 를 씁니다. 그러면 그 값을 의존성에 넣지 않아도 됩니다.",
          "켠 것은 정리 함수에서 끕니다. 정리 함수는 다른 예제로 옮길 때도, StrictMode 검사 때도 불립니다.",
          "effect 안에 async 함수를 만들어 부르고, 만든 함수를 부르는 줄을 빠뜨리지 않습니다.",
          "if (!res.ok) throw new Error(...) 가 없으면 404 는 catch 로 가지 않습니다. 화면이 조용히 비어 버립니다.",
          "로딩을 끄는 일은 finally 에, 다시 받아올 때는 로딩을 다시 켜기. 이 두 가지를 함께 기억하세요.",
          "의존성에 값이 든 fetch effect 는 ignore 세 줄을 함께 씁니다. 늦게 온 옛 응답이 화면을 덮어쓰지 못하게 막아 줍니다.",
        ]}
      />
    </div>
  );
}
