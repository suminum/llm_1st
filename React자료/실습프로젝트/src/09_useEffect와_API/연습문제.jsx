// ============================================================
// 09단원 · 연습문제 (14문항)
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요. 7번부터는 인터넷 연결이 필요합니다.
// ============================================================
//
// 푸는 방법
//   1) 문제 설명을 읽습니다.
//   2) TODO 자리에 코드를 씁니다.
//   3) 저장하면 화면이 저절로 새로 그려집니다. 기대 결과와 맞는지 봅니다.
//   4) 막히면 개념 파일의 해당 섹션을 다시 보세요. 문제마다 어느 개념인지 적어 두었습니다.
//
// 순서는 앞에서 뒤로 갈수록 어려워집니다.
//   문제 1~11  기본
//   문제 12    [응용]
//   문제 13    [도전]
//   문제 14    에러 확인
//
// ★ 콘솔에 같은 줄이 두 번씩 찍히는 것은 정상입니다(개념02 StrictMode).
//   기대 결과에는 한 번만 적어 두었습니다.
//
// ★ 인터넷이 막힌 실습실이라면 실습프로젝트 폴더의 index.html 에서
//   오프라인_대체.js 줄을 감싼 주석만 지우세요.

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ───── 문제 1 ───── (개념01)
// 이 컴포넌트가 화면에 처음 나타날 때 콘솔에 "09단원 시작합니다" 를 한 번 찍으세요.
// 처음 한 번만 실행되어야 합니다.
//
// 기대 결과 (콘솔): 09단원 시작합니다
//                  (개발 중에는 두 줄로 보입니다. 정상입니다)
//                  버튼이 없으니 화면을 열자마자 찍혀야 합니다.
//                  한 줄도 안 나오면 useEffect 를 안 썼거나 함수를 안 넘긴 것입니다.

function Problem01() {
  // TODO: 여기에 useEffect 를 쓰세요 (의존성 배열을 잊지 마세요)

  return (
    <div className="demo">
      <h3>문제 1 — 처음 나타날 때 한 번만</h3>
      <p className="output">콘솔(F12)을 보세요</p>
    </div>
  );
}

// ───── 문제 2 ───── (개념01)
// 의존성 배열을 아예 쓰지 않는 useEffect 를 만들어
// 콘솔에 "다시 그려졌습니다" 를 찍으세요.
// 아래 [다시 그리기] 버튼을 누를 때마다 한 줄씩 늘어나야 합니다.
//
// 기대 결과 (콘솔): 다시 그려졌습니다
//                  버튼을 누를 때마다 한 줄씩 늘어납니다.
//                  버튼을 눌러도 안 늘어나면 의존성 배열에 [] 를 붙인 것입니다.

function Problem02() {
  const [tick, setTick] = useState(0);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 2 — 매번 실행되게 하기</h3>
      <p className="output">다시 그린 횟수: {tick}</p>
      <button onClick={() => setTick(tick + 1)}>다시 그리기</button>
    </div>
  );
}

// ───── 문제 3 ───── (개념01)
// count 가 바뀔 때만 콘솔에 "지금 잔 수: N" 을 찍으세요.
// [잔 수 +1] 을 누르면 찍히고, [메뉴 바꾸기] 를 눌러도 찍히면 안 됩니다.
//
// 기대 결과 (콘솔): 지금 잔 수: 0
//                  [잔 수 +1] 을 누르면 → 지금 잔 수: 1
//                  [메뉴 바꾸기] 를 눌렀는데도 줄이 늘어나면 의존성 배열이 비었거나 없는 것입니다.

function Problem03() {
  const [count, setCount] = useState(0);
  const [menu, setMenu] = useState("아메리카노");

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 3 — 특정 값이 바뀔 때만</h3>
      <p className="output">
        {menu} {count}잔
      </p>
      <button onClick={() => setCount(count + 1)}>잔 수 +1</button>
      <button onClick={() => setMenu(menu === "아메리카노" ? "라떼" : "아메리카노")}>
        메뉴 바꾸기
      </button>
    </div>
  );
}

// ───── 문제 4 ───── (개념01)
// 할 일 개수가 바뀔 때마다 브라우저 탭 제목을 "할일 N개" 로 바꾸세요.
// 탭 제목은 document.title 입니다.
//
// 기대 결과 (화면): 창 맨 위 탭 글자가 "할일 0개" 가 됩니다.
//                  [할 일 추가] 를 누르면 "할일 1개" 로 바뀝니다.
//                  탭 글자가 안 바뀌면 useEffect 안에 document.title 을 안 넣은 것입니다.

function Problem04() {
  const [todoCount, setTodoCount] = useState(0);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 4 — 탭 제목 바꾸기</h3>
      <p className="output">할 일 {todoCount}개</p>
      <button onClick={() => setTodoCount(todoCount + 1)}>할 일 추가</button>
    </div>
  );
}

// ───── 문제 5 ───── (개념02)
// 1초마다 seconds 를 1씩 올리는 타이머를 만드세요.
// 정리 함수로 타이머를 반드시 꺼 주어야 합니다.
//
// [힌트] setInterval 안에서 state 를 올릴 때는 함수형 갱신을 쓰세요.
//        setSeconds((prev) => prev + 1)  ← 04단원 개념05
//        이러면 seconds 를 읽지 않으니 의존성 배열이 [] 여도 괜찮습니다.
//
// 기대 결과 (화면): 0초 → 1초 → 2초 ... 로 1초마다 올라갑니다.
//                  숫자가 한 번에 2씩 뛰면 정리 함수를 안 쓴 것입니다.
//                  (StrictMode 가 타이머를 두 개 만들었기 때문입니다)

function Problem05() {
  const [seconds, setSeconds] = useState(0);

  // TODO: 여기에 useEffect 를 쓰세요. 정리 함수도 함께 쓰세요.

  return (
    <div className="demo">
      <h3>문제 5 — 타이머와 정리 함수</h3>
      <p className="output">{seconds}초</p>
    </div>
  );
}

// ───── 문제 6 ───── (개념02)
// 문제 5에서 만든 정리 함수 안에 console.log("타이머를 껐습니다") 를 넣으세요.
// 그리고 왼쪽 메뉴에서 다른 예제를 골랐다가 이 파일로 돌아오세요.
//
// 먼저 예상해 보세요. 그 줄이 언제 찍힐까요?
//   (가) 다른 예제를 고르는 순간
//   (나) 이 파일로 돌아오는 순간
//   (다) 둘 다
//   (라) 안 찍힌다
//
// 기대 결과: 예상한 뒤에 직접 확인하세요. 정답은 정답 파일에 있습니다.
//           화면에는 아무 변화가 없습니다. 콘솔만 보세요.

// (문제 6은 문제 5의 코드를 고치는 문제입니다. 따로 만들 것이 없습니다)

// ───── 문제 7 ───── (개념03)
// 3번 글(/posts/3)을 받아와 제목을 화면에 보여 주세요.
// useEffect 안에 async 함수를 만들어 부르는 방식을 쓰세요.
//
// 기대 결과 (화면): ea molestias quasi exercitationem repellat qui ipsa sit aut
//                  "아직 못 받았습니다" 그대로면 setTitle 을 안 불렀거나 주소가 틀린 것입니다.
//                  화면이 빨간 상자가 되면 useEffect(async () => ...) 를 쓴 것입니다.

function Problem07() {
  const [title, setTitle] = useState("아직 못 받았습니다");

  // TODO: 여기에 useEffect 를 쓰세요
  //       안에 async 함수를 만들고, 만든 함수를 부르는 것을 잊지 마세요.

  return (
    <div className="demo">
      <h3>문제 7 — 글 하나 받아오기</h3>
      <p className="output">{title}</p>
    </div>
  );
}

// ───── 문제 8 ───── (개념03)
// 사용자 3명(/users?_limit=3)을 받아와 이름을 목록으로 그리세요.
// map 으로 <li> 를 만들고 key 를 붙이세요.
//
// 기대 결과 (화면): Leanne Graham / Ervin Howell / Clementine Bauch
//                  콘솔에 key 경고가 뜨면 key 를 안 붙인 것입니다.
//                  화면이 빨간 상자가 되면 초기값을 null 로 두고 map 을 부른 것입니다.

function Problem08() {
  const [users, setUsers] = useState([]);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 8 — 목록 받아서 그리기</h3>
      <ul>{/* TODO: users 를 map 으로 그리세요 */}</ul>
    </div>
  );
}

// ───── 문제 9 ───── (개념04)
// 문제 7과 같은 일을 하되, 받아오는 동안 "불러오는 중..." 을 보여 주세요.
// loading state 를 하나 더 두면 됩니다.
//
// 기대 결과 (화면): 잠깐 "불러오는 중..." 이 보였다가 제목으로 바뀝니다.
//                  "불러오는 중..." 에서 안 바뀌면 setLoading(false) 를 안 부른 것입니다.
//                  너무 빨라서 안 보이면 F12 → Network → Slow 4G 로 바꿔 보세요.

function Problem09() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 9 — 로딩 표시</h3>
      <p className="output">{loading ? "불러오는 중..." : title}</p>
    </div>
  );
}

// ───── 문제 10 ───── (개념04)
// 없는 글(/posts/9999)을 요청하고, res.ok 를 확인해 직접 에러를 던지세요.
// catch 에서 err.message 를 콘솔에 찍으세요.
//
// [힌트] if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
//
// 기대 결과 (콘솔): 문제10 에러: 서버 응답 오류 (404)
//                  이 줄이 안 나오면 res.ok 검사를 빠뜨린 것입니다. 404 는 catch 로 안 갑니다.
//                  콘솔에 빨간 Failed to load resource 줄이 함께 나오는 것은 정상입니다.

function Problem10() {
  const [message, setMessage] = useState("확인 중");

  // TODO: 여기에 useEffect 를 쓰세요
  //       try / catch 로 감싸고, catch 안에서 setMessage("에러가 났습니다") 도 해 주세요.

  return (
    <div className="demo">
      <h3>문제 10 — res.ok 확인하기</h3>
      <p className="output">{message}</p>
    </div>
  );
}

// ───── 문제 11 ───── (개념04)
// 로딩 · 에러 · 성공 세 갈래를 모두 갖춘 화면을 만드세요.
// 주소는 없는 글(/posts/9999)이므로 결과는 에러 화면이 되어야 합니다.
// 에러 문구는 "글을 불러오지 못했습니다" 로 하세요.
//
// [힌트] 화면을 가르는 순서는 loading → error → 성공 입니다.
//        로딩을 끄는 일은 finally 에 두세요.
//
// 기대 결과 (화면): 잠깐 "불러오는 중..." 이 보였다가 "글을 불러오지 못했습니다" 로 바뀝니다.
//                  "불러오는 중..." 에서 멈춰 있으면 setLoading(false) 가 try 안에만 있는 것입니다.

function Problem11() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 11 — 세 갈래 화면</h3>
      {/* TODO: loading / error / 성공 세 가지를 갈라서 그리세요 */}
      <p className="output">여기에 세 갈래 화면을 그리세요</p>
    </div>
  );
}

// ───── 문제 12 ───── [응용] (개념05)
// 버튼으로 사용자 번호를 고르면 그 사람 정보를 다시 받아오게 하세요.
// 1 · 2 · 3 번 버튼이 이미 만들어져 있습니다. useEffect 만 채우면 됩니다.
//
// [힌트] 의존성 배열에 userId 를 넣으세요.
//        다시 받아올 때 로딩 표시도 다시 켜야 합니다.
//
// 기대 결과 (화면): 처음에는 Leanne Graham 이 나옵니다.
//                  [2번] 을 누르면 Ervin Howell, [3번] 을 누르면 Clementine Bauch 로 바뀝니다.
//                  버튼을 눌러도 이름이 안 바뀌면 의존성 배열이 [] 인 것입니다.

function Problem12() {
  const [userId, setUserId] = useState(1);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // TODO: 여기에 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 12 [응용] — 고른 사람 다시 받아오기</h3>
      <button onClick={() => setUserId(1)}>1번</button>
      <button onClick={() => setUserId(2)}>2번</button>
      <button onClick={() => setUserId(3)}>3번</button>
      <p className="output">{loading ? "불러오는 중..." : name}</p>
    </div>
  );
}

// ───── 문제 13 ───── [도전] (개념05)
// 문제 12에 ignore 플래그를 붙여, 늦게 도착한 옛 응답이 화면을 덮어쓰지 못하게 하세요.
//
// 아래 데모는 1번 사용자만 일부러 늦게 답하도록 만들어 두었습니다(wait 함수).
// [경쟁 재현] 버튼은 1번을 고른 뒤 곧바로 2번을 고릅니다.
// ignore 없이 만들면 화면이 뒤늦게 Leanne Graham 으로 되돌아갑니다.
//
// [힌트] effect 맨 위에 let ignore = false;
//        받아온 뒤 if (ignore) return;
//        정리 함수에서 ignore = true;
//
// 기대 결과 (화면): [경쟁 재현] 을 눌러도 Ervin Howell 그대로여야 합니다.
//                  Leanne Graham 으로 되돌아가면 ignore 가 동작하지 않는 것입니다.
//                  ignore = true 를 정리 함수에 안 넣었는지 확인하세요.

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Problem13() {
  const [userId, setUserId] = useState(2);
  const [name, setName] = useState("아직 없음");

  // TODO: 여기에 useEffect 를 쓰세요.
  //       1번을 받아올 때는 res.json() 뒤에 await wait(250); 을 넣어 일부러 늦추세요.
  //       그래야 경쟁 상태가 재현됩니다.

  function runRace() {
    setUserId(1);
    setTimeout(() => setUserId(2), 80);
  }

  return (
    <div className="demo">
      <h3>문제 13 [도전] — 늦게 온 응답 버리기</h3>
      <p className="output">지금 화면에 그린 이름: {name}</p>
      <button onClick={runRace}>경쟁 재현 (1번 → 곧바로 2번)</button>
      <button onClick={() => setUserId(3)}>3번 고르기 (평범하게)</button>
    </div>
  );
}

// ───── 문제 14 ───── 에러 확인 (개념06)
// 아래 코드는 무한 루프에 빠집니다. 주석을 풀지 마세요. 눈으로만 보세요.
//
//     const [count, setCount] = useState(0);
//
//     useEffect(() => {
//       setCount(count + 1);
//     }, [count]);
//
// 물음 1. 왜 끝없이 도는지 한 문장으로 설명해 보세요.
// 물음 2. 이 코드가 하려던 일이 "화면에 나타날 때 숫자를 1 올린다" 라면
//         어떻게 고쳐야 할까요? 아래 TODO 자리에 고친 코드를 쓰세요.
//
// [힌트] effect 안에서 count 를 읽지 않으면 의존성에 넣을 이유가 없어집니다.
//        04단원 개념05의 함수형 갱신을 떠올려 보세요.
//
// 기대 결과 (화면): 숫자가 1 에서 멈춰 있어야 합니다.
//                  (개발 중에는 StrictMode 때문에 2 가 될 수도 있습니다. 그것도 정답입니다)
//                  숫자가 계속 올라가면 아직 루프가 돌고 있는 것입니다. 바로 되돌리세요.

function Problem14() {
  const [count, setCount] = useState(0);

  // TODO: 여기에 고친 useEffect 를 쓰세요

  return (
    <div className="demo">
      <h3>문제 14 — 무한 루프 고치기</h3>
      <p className="output">숫자: {count}</p>
    </div>
  );
}

// ── 화면 ──

export default function Unit09Exercises() {
  return (
    <div>
      <h1>09단원 연습문제 (14문항)</h1>

      <p className="guide">
        각 상자의 <strong>TODO</strong> 자리를 채우세요. 저장하면 화면이 저절로 다시
        그려집니다.
        <br />
        <br />
        <strong>F12 → Console</strong> 을 함께 열어 두세요. 콘솔로 확인하는 문제가 많습니다.
        같은 줄이 두 번씩 찍히는 것은 정상입니다(개념02 StrictMode).
        <br />
        <br />
        7번부터는 <strong>인터넷 연결이 필요합니다.</strong> 막혀 있다면 실습프로젝트
        폴더의 <code>index.html</code> 에서 <code>오프라인_대체.js</code> 줄을 감싼 주석만
        지우세요.
        <br />
        <br />
        10 · 11번은 <strong>일부러 없는 글을 요청</strong>합니다. 콘솔에 빨간{" "}
        <code>Failed to load resource ... 404</code> 줄이 나오는 것이 정상입니다.
      </p>

      <Problem01 />
      <Problem02 />
      <Problem03 />
      <Problem04 />
      <Problem05 />
      <Problem07 />
      <Problem08 />
      <Problem09 />
      <Problem10 />
      <Problem11 />
      <Problem12 />
      <Problem13 />
      <Problem14 />

      <Summary
        items={[
          "문제 1~4는 개념01입니다. 의존성 배열 세 가지(없음 / [] / [값])를 구분할 수 있으면 됩니다.",
          "문제 5~6은 개념02입니다. 켠 것은 정리 함수로 끕니다. 콘솔이 두 줄씩 찍히면 정리를 빠뜨린 신호입니다.",
          "문제 7~8은 개념03입니다. effect 안에 async 함수를 만들어 부르고, 받은 값을 state 에 담습니다.",
          "문제 9~11은 개념04입니다. 로딩·에러·성공 세 갈래와 res.ok 검사가 핵심입니다.",
          "문제 12~13은 개념05입니다. 의존성에 값을 넣어 다시 받아오고, ignore 로 늦은 응답을 버립니다.",
          "문제 14는 개념06입니다. effect 안에서 바꾸는 state 를 의존성에 넣으면 무한 루프가 됩니다.",
          "막히면 정답 파일을 보기 전에 개념 파일의 해당 섹션을 먼저 다시 읽어 보세요.",
        ]}
      />
    </div>
  );
}
