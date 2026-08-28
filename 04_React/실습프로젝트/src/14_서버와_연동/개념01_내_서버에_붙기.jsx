// ============================================================
// 14단원 · 개념 01 — 내 서버에 붙기
// ------------------------------------------------------------
// 실행: 터미널 두 개가 필요합니다.
//
//   ① 실습프로젝트 에서        npm run dev
//   ② 실습프로젝트/14단원_서버 에서   node 서버.js
//
//   ②를 안 켜면 이 단원의 예제가 전부 "서버가 안 켜져 있습니다" 를 보여 줍니다.
// ============================================================
//
// 09단원에서 fetch 로 데이터를 받아 봤습니다. 그런데 그건 **남의 서버**였습니다.
//
//     https://jsonplaceholder.typicode.com/posts
//
// 연습용으로 누가 열어 둔 곳이고, 우리가 고칠 수 없었습니다.
// 이번에는 **내 서버**에 붙습니다.
//
//     http://localhost:4000/api/v1/equipments
//
// ★ 부르는 방법은 09단원과 **똑같습니다.** fetch 그대로입니다.
//   달라지는 것은 세 가지입니다.
//
//     1) 서버를 내가 켜야 합니다 (안 켜면 아무것도 안 됩니다)
//     2) ★ CORS 라는 것이 나옵니다 (섹션 5)
//     3) 내가 데이터를 **보낼** 수도 있습니다 (개념03·04)
//
// ★★ 서버가 어떻게 만들어졌는지는 지금 몰라도 됩니다.
//   `14단원_서버/서버.js` 는 열어 보지 않아도 됩니다. PART 3 에서 직접 만듭니다.
//   여기서는 **붙는 쪽**만 봅니다.
//
// ★ 콘솔에 같은 줄이 두 번씩 찍힙니다. 정상입니다(09단원 개념02의 StrictMode).

import { useState, useEffect } from "react";
import Summary from "../_ui/Summary.jsx";
import { 서버주소, 서버안내 } from "./_서버주소.js";

// ── 섹션 1: 주소만 바뀝니다 ──

// 09단원에서 이렇게 썼습니다.
//
//     const 응답 = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
//     const 자료 = await 응답.json();
//
// 이번에는 이렇게 씁니다.
//
//     const 응답 = await fetch("http://localhost:4000/api/v1/equipments");
//     const 자료 = await 응답.json();
//
// ★ 코드가 같습니다. 주소만 바뀌었습니다.
//   React 입장에서는 "어디에 있는 서버냐" 가 중요하지 않습니다.

// ★★ `localhost` 는 **내 컴퓨터**라는 뜻입니다.
//   `4000` 은 그 안에서 이 서버가 쓰는 문 번호입니다.
//   Vite 는 `5173` 을 씁니다. 그래서 **둘은 서로 다른 곳**입니다. 섹션 5에서 씁니다.

// ✏️ 직접 해보기 1 — 브라우저 주소창에 http://localhost:4000/api/v1/equipments 를
//                    직접 넣어 보세요. 무엇이 보입니까? 서버를 껐다 켜며 해 보세요.

// ── 섹션 2: 목록을 받아 그립니다 ──

function Section1Demo() {
  const [설비들, set설비들] = useState([]);
  const [상태, set상태] = useState("아직");

  useEffect(() => {
    let 버렸나 = false;

    (async () => {
      set상태("받는중");
      try {
        const 응답 = await fetch(`${서버주소}/equipments`);
        if (!응답.ok) throw new Error(`서버가 ${응답.status} 를 보냈습니다`);

        const 자료 = await 응답.json();
        if (버렸나) return;

        set설비들(자료.설비들);
        set상태("됨");
        console.log("받은 설비 수:", 자료.설비들.length);
      } catch (오류) {
        if (버렸나) return;
        set상태("안됨");
        console.log("못 받았습니다:", 오류.name);
      }
    })();

    return () => {
      버렸나 = true;
    };
  }, []);

  return (
    <div className="demo">
      <h3>① 목록 받아 그리기</h3>

      {상태 === "받는중" && <div className="output">불러오는 중...</div>}
      {상태 === "안됨" && <div className="output">{서버안내}</div>}

      {상태 === "됨" && (
        <ul>
          {설비들.map((하나) => (
            <li key={하나.번호}>
              {하나.이름} — {하나.상태} ({하나.담당})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ★ `버렸나` 는 09단원 개념05에서 본 그것입니다.
//   화면이 사라진 뒤에 답이 오면 set 을 안 하려고 두는 표시입니다.
//
// ★★ `if (!응답.ok) throw` 를 빼먹으면 안 됩니다.
//   fetch 는 404·500 을 **실패로 안 칩니다.** (JS자료 12단원 개념05)
//   그냥 "응답이 왔다" 로 봅니다. 그래서 직접 봐야 합니다.

// ✏️ 직접 해보기 2 — 서버 터미널에서 Ctrl+C 로 서버를 끄고 이 예제를 새로고침하세요.
//                    화면에 무엇이 나옵니까? 콘솔에는 무엇이 찍힙니까?

// ── 섹션 3: 불러오는 중과 안 됐을 때 ──

// 위 예제의 `상태` 가 세 가지였습니다. 이게 중요합니다.
//
//     "받는중"   →  불러오는 중... 을 보여 줍니다
//     "됨"       →  목록을 그립니다
//     "안됨"     →  안내를 보여 줍니다
//
// ★ 셋을 안 나누면 **빈 화면**이 뜹니다.
//   데이터가 없는 것과 아직 안 온 것과 못 받은 것은 전혀 다른 상황인데
//   화면에는 똑같이 "아무것도 없음" 으로 보이기 때문입니다.

// 서버에 일부러 느리게·고장 나게 시킬 수 있습니다.
//
//     /equipments?slow=1500    1.5초 뒤에 답합니다
//     /equipments?fail=yes     500 을 보냅니다

function Section2Demo() {
  const [상태, set상태] = useState("아직");
  const [말, set말] = useState("");

  async function 불러보기(뒤에붙일것) {
    set상태("받는중");
    set말("");

    try {
      const 응답 = await fetch(`${서버주소}/equipments${뒤에붙일것}`);
      if (!응답.ok) {
        const 몸 = await 응답.json().catch(() => ({}));
        throw new Error(몸.메시지 || `서버가 ${응답.status} 를 보냈습니다`);
      }
      const 자료 = await 응답.json();
      set상태("됨");
      set말(`${자료.설비들.length}건 받았습니다`);
    } catch (오류) {
      set상태("안됨");
      set말(오류.name === "TypeError" ? 서버안내 : 오류.message);
      console.log("실패:", 오류.name, "/", 오류.message);
    }
  }

  return (
    <div className="demo">
      <h3>② 느릴 때 · 안 될 때</h3>

      <button onClick={() => 불러보기("")}>보통</button>{" "}
      <button onClick={() => 불러보기("?slow=1500")}>느리게 (1.5초)</button>{" "}
      <button onClick={() => 불러보기("?fail=yes")}>고장 내기 (500)</button>

      <div className="output">
        {상태 === "받는중" ? "불러오는 중..." : 말 || "버튼을 눌러 보세요"}
      </div>
    </div>
  );
}

// ★★ [느리게] 를 누르면 1.5초 동안 "불러오는 중..." 이 보입니다.
//   이걸 눈으로 봐야 왜 필요한지 압니다. 빠른 서버로만 개발하면 안 만들게 됩니다.
//
// ★★★ 오류가 두 종류인 것에 주의하세요.
//
//     TypeError      서버에 **닿지도 못했습니다** (안 켜졌거나 CORS)
//     그 밖         닿았는데 서버가 **잘못됐다고 답했습니다** (500 등)
//
//   앞의 것은 "서버를 켜세요", 뒤의 것은 "서버가 이상합니다" 입니다.
//   ★ 사용자에게 보여 줄 말이 달라야 합니다.

// ✏️ 직접 해보기 3 — [고장 내기] 를 누르고 F12 → Network 에서 그 요청을 찾으세요.
//                    상태가 무엇입니까? 응답 본문에는 무엇이 들어 있습니까?

// ✏️ 직접 해보기 4 — 서버를 끈 채로 [보통] 을 누르고, 콘솔에 찍힌 오류 이름을 보세요.
//                    위 표의 어느 쪽입니까?

// ── 섹션 4: 주소는 영문으로 씁니다 ──

// 이 자료는 코드 안의 이름을 한글로 씁니다. 그런데 **주소는 영문**입니다.
//
//     /api/v1/equipments      ← 이렇게
//     /api/설비                ← 이렇게 안 합니다
//
// ★★★ 왜냐하면 한글은 주소에서 바뀌어 나가기 때문입니다.

function Section3Demo() {
  const [보인것, set보인것] = useState("");

  function 보여주기() {
    const 한글주소 = new URL("http://localhost:4000/api/설비");
    const 영문주소 = new URL("http://localhost:4000/api/v1/equipments");

    const 줄들 = [
      `적은 것 : /api/설비`,
      `나가는 것: ${한글주소.pathname}`,
      ``,
      `적은 것 : /api/v1/equipments`,
      `나가는 것: ${영문주소.pathname}`,
    ];

    set보인것(줄들.join("\n"));
    console.log(한글주소.pathname);
  }

  return (
    <div className="demo">
      <h3>③ 한글 주소는 이렇게 바뀝니다</h3>
      <button onClick={보여주기}>바뀌는 것 보기</button>
      <pre className="output">{보인것 || "버튼을 눌러 보세요"}</pre>
    </div>
  );
}

// ★ `/api/%EC%84%A4%EB%B9%84` 가 됩니다. (JS자료 14단원 개념02에서 본 그것입니다)
//   서버에서 `길 === "/api/설비"` 로 비교하면 안 맞습니다.
//
// ★★ 이 자료의 서버를 만들면서 **실제로 이걸로 404 가 났습니다.**
//   풀어서 비교하게 고칠 수도 있지만, 주소는 그냥 영문으로 쓰는 게 맞습니다.
//   PART 3(백엔드)도 `/api/v1/equipments` 로 씁니다. **같은 주소를 다시 만납니다.**
//
// ★★★ 규칙 하나로 —
//   **주소(경로·쿼리)는 영문, 코드 안의 이름과 JSON 의 키는 한글.**
//   실제로 이 서버가 돌려주는 JSON 은 `{ 설비들: [...] }` 로 한글입니다. 그건 됩니다.

// ✏️ 직접 해보기 5 — 위 코드의 `/api/설비` 를 `/api/설비?이름=프레스` 로 바꿔 보고
//                    `한글주소.search` 도 함께 찍어 보세요. 쿼리도 바뀝니까?

// ── 섹션 5: ★★ CORS — 왜 나오나 ──

// 화면은 http://localhost:5173 (Vite) 에서 돕니다.
// 서버는 http://localhost:4000 에서 돕니다.
//
//     ★ 포트가 다르면 **다른 출처**입니다. 이름이 둘 다 localhost 라도 그렇습니다.
//
// 브라우저는 다른 출처에 요청을 보낼 때 그 서버에게 먼저 물어봅니다.
// "얘가 나한테 요청해도 되나요?" 서버가 된다고 답해야 응답을 코드에 넘겨 줍니다.
//
//     Access-Control-Allow-Origin: *
//
// 이 헤더가 그 대답입니다. 우리 서버는 이렇게 답하도록 만들어져 있습니다.

function Section4Demo() {
  const [본것, set본것] = useState("");

  async function 헤더보기() {
    try {
      const 응답 = await fetch(`${서버주소}/equipments`);
      const 줄들 = [
        `상태: ${응답.status}`,
        `Content-Type: ${응답.headers.get("content-type")}`,
        `Access-Control-Allow-Origin: ${응답.headers.get("access-control-allow-origin")}`,
      ];
      set본것(줄들.join("\n"));
      console.log("CORS 헤더:", 응답.headers.get("access-control-allow-origin"));
    } catch {
      set본것(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>④ 서버가 뭐라고 답하나</h3>
      <button onClick={헤더보기}>응답 헤더 보기</button>
      <pre className="output">{본것 || "버튼을 눌러 보세요"}</pre>
    </div>
  );
}

// ★★★ 이 헤더를 서버가 안 보내면 어떻게 되나 —
//
//   `14단원_서버/서버.js` 의 `CORS붙이기` 함수 안 세 줄을 주석 처리하고
//   서버를 다시 켜 보세요. 그러면 —
//
//     · 콘솔에 빨간 줄:  Access to fetch at 'http://localhost:4000/...'
//                       from origin 'http://localhost:5173' has been blocked
//                       by CORS policy
//     · 코드가 받는 것:  TypeError: Failed to fetch
//
//   ★ **코드에서는 왜 막혔는지 알 수 없습니다.** 콘솔에만 나옵니다.
//     서버가 안 켜진 것과 **똑같아 보입니다.** 그래서 헷갈립니다.
//
// ★★ 가르는 방법 — **Network 탭을 보세요.**
//
//     요청이 아예 없다      → 서버가 안 켜짐 (또는 주소가 틀림)
//     요청은 갔는데 빨감    → CORS
//
//   ★ 이건 내가 못 고칩니다. **서버가 열어 줘야** 합니다.
//     PART 3 에서 서버 쪽에 CORS 를 붙이는 법을 배웁니다.

// ✏️ 직접 해보기 6 — 서버의 `CORS붙이기` 안 세 줄을 주석 처리하고 서버를 다시 켜세요.
//                    ①번 예제가 어떻게 됩니까? 콘솔과 Network 를 둘 다 보세요.
//                    확인했으면 주석을 풀고 다시 켜세요.

// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 서버를 안 켜고 시작함 ★ 제일 흔합니다
//   화면이 계속 "불러오는 중" 이거나 빈 채로 있습니다.
//   터미널 두 개가 필요합니다. 맨 위 안내를 보세요.

// [실수 2] 포트를 헷갈림
//   화면은 5173, 서버는 4000 입니다.
//   5173 에 /api/v1/equipments 를 붙이면 Vite 가 받습니다. 서버가 아닙니다.

// [실수 3] `응답.ok` 를 안 봄
//   500 이 와도 `.json()` 이 그냥 됩니다. 그리고 엉뚱한 값을 화면에 그립니다.
//   fetch 는 404·500 을 실패로 안 칩니다.

// [실수 4] 주소에 한글을 씀 (섹션 4)

// [실수 5] 오류를 한 덩어리로 처리함
//   "서버가 안 켜졌다" 와 "서버가 500 을 냈다" 는 사용자에게 할 말이 다릅니다. (섹션 3)

// [실수 6] CORS 를 프론트에서 고치려 함
//   브라우저 설정을 끄는 방법이 인터넷에 돌아다닙니다. 쓰지 마세요.
//   내 브라우저만 뚫리고 **남의 브라우저에서는 여전히 안 됩니다.**

// ── 화면 ──

export default function Concept01Server() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 01 — 내 서버에 붙기</h1>

      <p className="guide">
        <strong>터미널이 두 개 필요합니다.</strong>
        <br />
        ① <code>실습프로젝트</code> 에서 <code>npm run dev</code>
        <br />
        ② <code>실습프로젝트/14단원_서버</code> 에서 <code>node 서버.js</code>
        <br />
        <br />
        ②를 안 켜면 아래 예제가 전부 안내 문구를 보여 줍니다. <strong>고장이 아닙니다.</strong>
        <br />
        <br />
        <strong>서버 코드는 안 읽어도 됩니다.</strong> 만드는 법은 PART 3 에서 배웁니다.
        여기서는 <strong>붙는 쪽</strong>만 봅니다.
      </p>

      <button onClick={() => setRestartKey(restartKey + 1)}>
        이 예제를 처음부터 다시 그리기
      </button>

      <div key={restartKey}>
        <Section1Demo />
        <Section2Demo />
        <Section3Demo />
        <Section4Demo />
      </div>

      <Summary
        items={[
          "부르는 코드는 09단원과 똑같습니다. fetch 그대로이고 주소만 바뀝니다. 다만 서버를 내가 켜야 합니다.",
          "화면(5173)과 서버(4000)는 포트가 달라서 다른 출처입니다. 그래서 CORS 가 나옵니다. 서버가 Access-Control-Allow-Origin 을 보내 줘야 합니다.",
          "상태를 셋으로 나눕니다 — 받는중 / 됨 / 안됨. 안 나누면 빈 화면이 뜨고 사용자는 무슨 일인지 모릅니다.",
          "fetch 는 404·500 을 실패로 안 칩니다. 응답.ok 를 직접 봐야 합니다.",
          "오류가 두 종류입니다. TypeError 는 서버에 닿지도 못한 것(안 켜짐·CORS), 그 밖은 닿았는데 서버가 잘못됐다고 답한 것입니다. 사용자에게 할 말이 다릅니다.",
          "★ 주소(경로·쿼리)는 영문으로 씁니다. 한글은 /api/%EC%84%A4%EB%B9%84 로 바뀌어 나가서 서버 쪽 비교가 어긋납니다. JSON 안의 키는 한글이어도 됩니다.",
          "CORS 는 프론트에서 못 고칩니다. 서버가 열어 줘야 합니다. 브라우저 설정을 끄는 것은 해결이 아닙니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 주소창에 넣으면 JSON 이 그대로 보입니다.
//
//      {"설비들":[{"번호":1,"이름":"3호 프레스","상태":"가동","담당":"김철수"}, …]}
//
//    서버를 끄고 넣으면 브라우저가 "사이트에 연결할 수 없음" 을 보여 줍니다.
//    → ★ 이게 제일 빠른 확인법입니다. React 를 의심하기 전에 주소창에 직접 넣어 보세요.
//      여기서 JSON 이 보이면 서버는 멀쩡한 것이고, 문제는 React 쪽입니다.
//
// 2) 화면: "서버가 안 켜져 있습니다. 터미널을 하나 더 열고 …" 가 나옵니다.
//    // 콘솔: 못 받았습니다: TypeError
//    → 서버에 닿지도 못했습니다. 그래서 상태 코드가 없습니다.
//      `응답.status` 를 찍어 보려 해도 `응답` 자체가 없습니다.
//
// 3) Network 탭에서 그 요청을 누르면 —
//      Status: 500
//      Response: {"메시지":"서버가 잠깐 이상합니다"}
//    → ★ 서버가 **왜** 잘못됐는지를 본문에 담아 보냅니다.
//      상태 코드만 보지 말고 본문도 읽으세요. 개념03에서 이걸 화면에 씁니다.
//
// 4) // 콘솔: 실패: TypeError / Failed to fetch
//    → 표의 앞쪽입니다. "닿지도 못했다".
//      ★ 그런데 CORS 에 막혔을 때도 똑같이 TypeError 입니다. (섹션 5)
//        코드만으로는 못 가릅니다. Network 탭을 보세요.
//
// 5) const 한글주소 = new URL("http://localhost:4000/api/설비?이름=프레스");
//    console.log(한글주소.pathname, 한글주소.search);
//    // 콘솔: /api/%EC%84%A4%EB%B9%84 ?%EC%9D%B4%EB%A6%84=%ED%94%84%EB%A0%88%EC%8A%A4
//    → 경로도 쿼리도 다 바뀝니다.
//      ★ 다만 쿼리는 `searchParams.get("이름")` 으로 꺼내면 한글로 잘 나옵니다.
//        경로는 직접 비교하니까 문제가 되는 것입니다.
//
// 6) 서버의 CORS붙이기 안을 이렇게 막습니다.
//
//      function CORS붙이기(응답) {
//        // 응답.setHeader("Access-Control-Allow-Origin", "*");
//        // 응답.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//        // 응답.setHeader("Access-Control-Allow-Headers", "Content-Type");
//      }
//
//    화면: ①번이 "서버가 안 켜져 있습니다" 를 보여 줍니다. **서버는 켜져 있는데도요.**
//    // 콘솔: Access to fetch at 'http://localhost:4000/api/v1/equipments'
//    //       from origin 'http://localhost:5173' has been blocked by CORS policy:
//    //       No 'Access-Control-Allow-Origin' header is present on the requested resource.
//    → Network 탭에서는 요청이 **보입니다.** 빨갛게 표시될 뿐입니다.
//      서버가 안 켜졌으면 요청 자체가 안 보입니다. ★ 이 차이로 가릅니다.
//      확인했으면 주석을 풀고 서버를 다시 켜세요.
