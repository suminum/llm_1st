// ============================================================
// 09단원 · 개념 04 — 로딩과 에러
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요. 인터넷 연결이 필요합니다.
// ============================================================
//
// 개념03의 예제는 전부 "잘 받아온다" 를 전제했습니다.
// 실제 서비스에서는 두 가지가 더 일어납니다.
//
//     느리다   — 데이터가 1초 뒤에 올 수도 있습니다. 그동안 화면은 텅 비어 있습니다.
//     실패한다 — 인터넷이 끊기거나, 주소가 틀렸거나, 서버가 죽었습니다.
//
// 둘 다 우리가 막을 수 없습니다. 대신 화면이 그 상황을 감당하게 만듭니다.
// 이 파일에서 만드는 것이 그것입니다.
//
// ★ 이 파일은 일부러 실패하는 요청을 보냅니다.
//   그래서 콘솔에 빨간 줄이 몇 개 나옵니다.
//
//       Failed to load resource: the server responded with a status of 404
//
//   이 빨간 줄은 정상입니다. 우리 코드가 낸 에러가 아니라
//   브라우저가 "이런 요청이 실패했어요" 하고 알려 주는 것입니다.
//   막을 수 없고, 막을 필요도 없습니다. 실무에서도 그냥 나옵니다.

import { useEffect, useState } from "react";
import Summary from "../_ui/Summary.jsx";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── 섹션 1: 화면은 세 가지 상태 중 하나다 ──

// 데이터를 받아오는 화면은 언제나 셋 중 하나입니다.
//
//   [로딩] 요청을 보냈고 아직 답이 안 왔다      → "불러오는 중..."
//   [에러] 실패했다                            → "불러오지 못했습니다"
//   [성공] 데이터가 있다                       → 데이터를 그린다
//
// 그래서 state 도 보통 세 개를 둡니다.
//
//     const [data, setData] = useState(null);      // 성공했을 때의 내용
//     const [loading, setLoading] = useState(true); // 지금 기다리는 중인가
//     const [error, setError] = useState(null);     // 실패했다면 무슨 이유인가
//
// [왜 loading 의 초기값이 true 인가]
//   처음 화면이 나타나는 순간 이미 요청이 나갑니다. 그러니 처음부터 로딩 중입니다.
//   false 로 시작하면 아주 잠깐 "데이터 없음" 화면이 번쩍이고 지나갑니다.
//
// [세 가지가 동시에 참이면 안 됩니다]
//   로딩이면서 에러일 수는 없습니다. 그래서 화면을 그릴 때 순서대로 갈라 줍니다.
//   로딩인가? → 에러인가? → 아니면 성공. 이 순서가 가장 안전합니다.
//
// 07단원 개념05에서 "state 를 최소로 두라" 고 배웠는데 세 개나 두는 것이 이상해 보일 수 있습니다.
// 이 셋은 서로 계산해 낼 수 없는 값이라 각자 필요합니다.
// data 가 null 이라는 것만으로는 아직 기다리는 중인지 실패한 것인지 알 수 없으니까요.

// ✏️ 직접 해보기 1 — loading 의 초기값을 false 로 두면 화면이 어떻게 달라질지
//                    말로 설명해 보세요. (정답은 파일 맨 아래에)

// ── 섹션 2: 로딩 표시 붙이기 ──

function LoadingDemo() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      console.log("[로딩 데모] 요청을 보냈습니다");
      // 콘솔: [로딩 데모] 요청을 보냈습니다

      const res = await fetch(`${BASE_URL}/posts/1`);
      const data = await res.json();

      console.log("[로딩 데모] 데이터가 도착했습니다");
      // 콘솔: [로딩 데모] 데이터가 도착했습니다

      setPost(data);
      setLoading(false); // 다 받았으니 로딩 표시를 끕니다
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>① 로딩 표시</h3>
      {loading ? (
        <p className="output">불러오는 중...</p>
      ) : (
        <p className="output">{post.title}</p>
      )}
      {/* 화면: 잠깐 "불러오는 중..." 이 보였다가 영어 제목으로 바뀝니다 */}
    </div>
  );
}

// 삼항 연산자로 갈랐습니다(05단원 개념01).
// loading 이 false 인 쪽에서는 post 가 반드시 있으니 post.title 을 마음 놓고 씁니다.
//
// [너무 빨라서 "불러오는 중" 이 안 보인다면]
//   서버가 가까우면 0.1초 만에 옵니다. 눈으로 보려면 두 가지 방법이 있습니다.
//   ① F12 → Network 탭 → 위쪽 속도 목록에서 "Slow 4G" 를 고릅니다.
//   ② 오프라인 대체본을 켜면 일부러 0.4초 기다렸다가 응답합니다.
//
// [로딩 표시가 왜 중요한가]
//   화면이 비어 있으면 사용자는 고장 났다고 생각하고 버튼을 계속 누릅니다.
//   그러면 요청이 여러 번 나가고 문제가 더 커집니다.
//   "지금 일하는 중" 이라는 한 줄이 그것을 막아 줍니다.

// ✏️ 직접 해보기 2 — "불러오는 중..." 을 "글을 가져오고 있습니다" 로 바꿔 보세요.

// ── 섹션 3: 404 는 실패가 아니다 ──

// 여기서부터가 이 파일의 핵심입니다. JS자료 12단원 개념05에서 만난 그 함정입니다.
//
//     fetch 는 '서버와 연결이 안 될 때' 만 실패로 칩니다.
//     서버가 "그런 글 없어요(404)" 라고 대답한 것은 fetch 입장에서 성공입니다.
//     대답을 받았으니까요.
//
// 그래서 없는 글을 요청해도 catch 로 가지 않습니다. 아래에서 직접 확인합니다.

function NoOkCheckDemo() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        // 9999번 글은 없습니다. 서버가 404 로 대답합니다.
        const res = await fetch(`${BASE_URL}/posts/9999`); //연결이 안됟ㄹ떄만 실패 그래서 catch 로 404 안남

        console.log("[확인 안 함] res.ok 는", res.ok);
        // 콘솔: [확인 안 함] res.ok 는 false

        const data = await res.json();
        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        } //잡혀서 아래 두줄은 실행 안됨
        console.log("[확인 안 함] res.status 는", res.status);
        // 콘솔: [확인 안 함] res.status 는 404

        console.log("[확인 안 함] 받은 데이터의 title 은", data.title);
        // 콘솔: [확인 안 함] 받은 데이터의 title 은 undefined

        setTitle(data.title);
      } catch (error) {
        // 여기로 오지 않습니다. 그것을 보여 주려고 일부러 로그를 넣어 두었습니다. 근데 throw으로 catch로 이동
        console.log("[확인 안 함] catch 로 왔습니다:", error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, []);

  return (
    <div className="demo">
      <h3>② res.ok 를 확인하지 않으면</h3>
      {loading ? (
        <p className="output">불러오는 중...</p>
      ) : (
        <p className="output">제목: {title}</p>
      )}
      {/* 화면: 제목:   ← 제목 뒤가 텅 빕니다. 에러 화면은 안 나옵니다 */}
    </div>
  );
}

// 콘솔을 보세요. "catch 로 왔습니다" 는 한 줄도 없습니다.
// 프로그램 입장에서는 다 잘된 것입니다. 그런데 화면은 비어 있습니다.
// 사용자는 "왜 아무것도 안 나오지?" 하고, 개발자는 에러가 없어서 원인을 못 찾습니다.
//
// 서버는 404 일 때 빈 객체 {} 를 줍니다. 그래서 data.title 이 undefined 입니다.
//
// [해결은 한 줄입니다]
//
//     if (!res.ok) {
//       throw new Error(`서버 응답 오류 (${res.status})`);
//     }
//
//   res.ok    200번대 응답이면 true, 아니면 false
//   res.status 200 · 404 · 500 같은 숫자
//
// throw 하면 즉시 catch 로 뜁니다. 우리가 직접 "이건 실패다" 라고 정해 주는 것입니다.
// 404 를 실패로 만들어 주는 것은 오직 이 검사뿐입니다.
//
// [콘솔의 빨간 줄에 대해]
//   이 데모 때문에 콘솔에 빨간 줄이 하나 뜹니다.
//
//       Failed to load resource: the server responded with a status of 404 (Not Found)
//
//   우리 코드가 낸 것이 아닙니다. 브라우저가 "요청 하나가 404 였어요" 하고 적는 줄입니다.
//   try/catch 로도 못 막고, 막을 방법이 아예 없습니다. 정상입니다.
//   우리 코드가 낸 에러인지 구분하는 방법이 있습니다.
//   우리 것은 우리가 적은 글자(한글)로 나오고, 이 줄은 브라우저 말투(영어)로 나옵니다.

// ✏️ 직접 해보기 3 — 위 코드에 if (!res.ok) throw 를 넣어 보세요.
//                    이번에는 catch 안의 줄이 찍힙니까?

// ── 섹션 4: 세 갈래 화면 만들기 ──

// 이제 로딩 · 에러 · 성공을 모두 갖춘 완성형을 만듭니다.
// 버튼으로 요청할 대상을 바꿔 가며 세 가지 결과를 모두 볼 수 있게 했습니다.

function CompleteDemo() {
  // 어떤 요청을 보낼지 고르는 값입니다. 바뀌면 아래 effect 가 다시 돕니다.
  const [target, setTarget] = useState("정상");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 고른 값에 따라 주소를 정합니다
    let url = `${BASE_URL}/posts/1`;
    if (target === "없는글") url = `${BASE_URL}/posts/9999`;
    if (target === "안되는주소")
      url = "https://이런서버는없습니다-abcxyz.example/posts/1";

    async function loadPost() {
      // 새로 시작할 때마다 상태를 초기화합니다. 지난번 에러가 남아 있으면 안 되니까요.
      setLoading(true);
      // setError(null);
      setPost(null);

      try {
        const res = await fetch(url);

        // ★ 이 세 줄이 이 파일의 핵심입니다
        if (!res.ok) {
          throw new Error(`서버 응답 오류 (${res.status})`);
        }

        const data = await res.json();
        setPost(data);

        console.log("[완성형] 성공 — 글 번호", data.id);
        // 콘솔: [완성형] 성공 — 글 번호 1
      } catch (err) {
        // 사용자에게는 쉬운 말로
        setError("글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");

        // 개발자에게는 자세히
        console.log("[완성형] 실패 —", err.message);
        // 콘솔: [완성형] 실패 — 서버 응답 오류 (404)
      } finally {
        // 성공하든 실패하든 로딩 표시는 반드시 꺼야 합니다
        setLoading(false);
        console.log("[완성형] finally — 로딩 표시를 껐습니다");
        // 콘솔: [완성형] finally — 로딩 표시를 껐습니다
      }
    }

    loadPost();
  }, [target]); // 고른 값이 바뀌면 다시 받아옵니다

  return (
    <div className="demo">
      <h3>③ 로딩 · 에러 · 성공 세 갈래</h3>

      <button onClick={() => setTarget("정상")}>정상 글 (1번)</button>
      <button onClick={() => setTarget("없는글")}>없는 글 (9999번)</button>
      <button onClick={() => setTarget("안되는주소")}>안 되는 주소</button>

      {/* 순서대로 갈라 줍니다. 로딩 → 에러 → 성공 */}
      {loading && <p className="output">불러오는 중...</p>}
      {!loading && error !== null && <p className="output error">{error}</p>}
      {!loading &&
        error === null &&
        post !== null && ( //여러줄이여서 ()로 묶은거 사실 필요없음
          <p className="output">{post.title}</p>
        )}
      {/* 화면(누르면): [없는 글] → 글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. */}
    </div>
  );
}

// [세 버튼을 다 눌러 보세요]
//
//   정상 글      → 영어 제목이 나옵니다. 콘솔에 "성공 — 글 번호 1"
//   없는 글      → 빨간 안내 문구가 나옵니다. 콘솔에 "실패 — 서버 응답 오류 (404)"
//   안 되는 주소 → 같은 안내 문구가 나옵니다. 콘솔에 "실패 — Failed to fetch"
//
// 마지막 것은 서버까지 가지도 못한 경우입니다. fetch 가 스스로 실패하니
// res.ok 검사까지 갈 것도 없이 곧바로 catch 로 갑니다.
// 이 경우 브라우저는 콘솔에 net::ERR_NAME_NOT_RESOLVED 라고 적습니다. 역시 정상입니다.
//
// [화면을 가르는 순서]
//   loading 을 가장 먼저 봅니다. 기다리는 중에는 다른 것을 볼 필요가 없으니까요.
//   그다음 error, 마지막이 성공입니다.
//   순서를 바꿔 성공을 먼저 보면, 지난번에 받아 둔 옛날 데이터가
//   로딩 중에 잠깐 다시 나타나는 이상한 화면이 됩니다.

// ✏️ 직접 해보기 4 — 에러 문구를 화면에 보여 줄 때 err.message 를 그대로 쓰면
//                    사용자에게 무엇이 보일까요? 위 코드를 잠깐 고쳐 확인해 보세요.
//                    (확인 후 되돌리세요)

// ── 섹션 5: finally 와 좋은 에러 처리 ──

// 위 코드에서 setLoading(false) 가 finally 에 있는 것을 눈여겨보세요.
// try 안 마지막에 두면 성공했을 때만 실행됩니다.
// 실패한 사용자의 화면은 "불러오는 중..." 에서 영원히 멈춥니다.
//
//     try     실패할 수 있는 일
//     catch   실패했을 때 할 일
//     finally 성공하든 실패하든 반드시 할 일
//
// JS자료 12단원 개념05에서 버튼 잠금을 풀 때 쓴 그 finally 와 같습니다.
//
// [좋은 에러 처리의 조건 다섯 가지]
//
//   1) 사용자에게 보여 줄 말과 개발자용 정보를 나눈다
//      화면 : "글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
//      콘솔 : err.message, 상태 코드, 요청 주소
//      "Failed to fetch" 는 사용자에게 아무 의미가 없는 영어입니다.
//
//   2) 로딩 중임을 알린다 — 화면이 비어 있으면 고장으로 보입니다.
//
//   3) 뒷정리를 finally 에 둔다 — 실패했을 때 로딩이 안 꺼지는 사고를 막습니다.
//
//   4) 새 요청을 시작할 때 지난 에러를 지운다
//      위 코드의 setError(null) 이 그것입니다. 안 지우면 성공했는데도
//      옛날 에러 문구가 화면에 남아 있습니다.
//
//   5) 실패해도 화면이 깨지지 않는다
//      데이터가 없어도 "내용 없음" 정도는 나와야 합니다.
//
// [try 로 전부 감싸지는 마세요]
//   JS자료 12단원 개념05에서 배운 그대로입니다.
//   실패할 만한 곳(요청 보내기, JSON 읽기)에만 씁니다.
//   화면 그리는 코드까지 감싸면 우리가 낸 오타까지 조용히 삼켜 버립니다.

// ✏️ 직접 해보기 5 — 위 완성형에서 setError(null) 줄을 지우고
//                    [없는 글] → [정상 글] 순서로 눌러 보세요. 무엇이 이상해집니까?
//                    (확인 후 되돌리세요)

// ── 섹션 6: 자주 하는 실수 ──

// ⚠️ [SyntaxError] 라고 적힌 것은 주석을 풀지 말고 눈으로만 보세요.
//    풀면 파일 전체가 멈춰서 화면이 통째로 비어 버립니다. 다시 // 를 붙이면 돌아옵니다.

// [실수 1] res.ok 를 확인하지 않음 — 섹션 3에서 실제로 돌려 봤습니다.
//   이 단원에서 가장 중요한 한 가지입니다. 404 는 조용히 지나갑니다.

// [실수 2] 로딩을 try 안에서만 끔
// try {
//   ...
//   setLoading(false);
// } catch (err) { ... }
// 실수: 실패하면 setLoading(false) 까지 못 갑니다. 화면이 영원히 "불러오는 중..." 입니다.
//       finally 에 두세요.

// [실수 3] 에러 객체를 화면에 그대로 보여 줌
// setError(err.message);
// ...
// <p>{error}</p>
// 실수: 사용자에게 "Failed to fetch" 같은 영어가 보입니다.
//       무슨 뜻인지도 모르고, 무엇을 해야 할지도 모릅니다.

// [실수 4] 에러 객체를 그대로 state 에 넣고 화면에 그림
// setError(err);
// ...
// <p>{error}</p>
// 실수: "Objects are not valid as a React child" 에러가 나면서 이 예제가 빨간 상자가 됩니다.
//       화면에는 객체를 넣을 수 없습니다. err.message 처럼 글자를 꺼내 넣거나,
//       위 완성형처럼 우리가 만든 문장을 넣으세요.

// [실수 5] 새 요청을 보내면서 지난 에러를 안 지움
// 실수: 에러가 났다가 다시 성공해도 빨간 문구가 화면에 남아 있습니다.
//       에러는 안 나고 화면만 조용히 틀립니다. ✏️ 5에서 직접 확인해 보세요.

// ── 화면 ──

export default function Concept04LoadingAndError() {
  return (
    <div>
      <h1>개념 04 — 로딩과 에러</h1>

      <p className="guide">
        <strong>인터넷 연결이 필요합니다.</strong>{" "}
        <strong>F12 → Console</strong> 을 함께 열어 두세요.
        <br />
        <br />이 파일은 <strong>일부러 실패하는 요청</strong>을 보냅니다. 그래서
        콘솔에 <code>Failed to load resource ... 404</code> 같은 빨간 줄이
        나옵니다. <strong>정상입니다.</strong> 우리 코드가 낸 에러가 아니라
        브라우저가 알려 주는 것입니다.
        <br />
        <br />② 번 상자는 <strong>일부러 틀리게 만든 예제</strong>입니다. 제목
        자리가 비어 있는 것이 정상입니다.
      </p>

      <LoadingDemo />
      <NoOkCheckDemo />
      <CompleteDemo />

      <Summary
        items={[
          "데이터를 받아오는 화면은 로딩·에러·성공 세 가지 상태 중 하나입니다. state 도 보통 data·loading·error 세 개를 둡니다.",
          "loading 의 초기값은 true 입니다. 화면이 나타나는 순간 이미 요청이 나가 있기 때문입니다.",
          "fetch 는 404·500 을 실패로 치지 않습니다. 서버가 대답을 했으니 성공으로 봅니다. res.ok 를 직접 확인해야 합니다.",
          "if (!res.ok) throw new Error(...) 한 줄이 404 를 진짜 실패로 만들어 줍니다. 이 줄이 없으면 화면이 조용히 비어 버립니다.",
          "로딩 표시를 끄는 일은 finally 에 둡니다. try 안에 두면 실패했을 때 영원히 불러오는 중이 됩니다.",
          "사용자에게는 쉬운 우리말 안내를, 콘솔에는 err.message 같은 자세한 정보를 남깁니다.",
          "없는 주소를 부르면 브라우저가 콘솔에 빨간 줄을 찍습니다. 막을 수 없고 정상입니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 첫 화면에 "데이터 없음" 쪽 화면이 아주 잠깐 번쩍이고 지나갑니다.
//    → loading 이 false 이니 화면은 성공 쪽으로 갑니다. 그런데 데이터는 아직 null 입니다.
//      운이 나쁘면 post.title 을 읽다가 그 자리에서 터집니다.
//      "요청이 나가 있는 동안은 로딩 중" 이 사실이므로 초기값도 true 여야 맞습니다.
//
// 2) {loading ? (
//      <p className="output">글을 가져오고 있습니다</p>
//    ) : (
//      <p className="output">{post.title}</p>
//    )}
//    // 화면: 글을 가져오고 있습니다 → (잠시 후) sunt aut facere repellat ...
//
// 3) 찍힙니다.
//    const res = await fetch(`${BASE_URL}/posts/9999`);
//    if (!res.ok) {
//      throw new Error(`서버 응답 오류 (${res.status})`);
//    }
//    // 콘솔: [확인 안 함] catch 로 왔습니다: 서버 응답 오류 (404)
//    → 이제 catch 로 갑니다. 달라진 것은 그 한 줄뿐입니다.
//      404 를 실패로 만들어 주는 것은 오직 이 검사입니다.
//      콘솔의 빨간 Failed to load resource 줄은 그대로 나옵니다. 그건 브라우저 몫입니다.
//
// 4) 사용자에게 "서버 응답 오류 (404)" 또는 "Failed to fetch" 가 그대로 보입니다.
//    setError(err.message);
//    → 404 가 무슨 뜻인지 아는 사용자는 거의 없습니다.
//      Failed to fetch 는 영어인 데다, 무엇을 해야 하는지도 안 알려 줍니다.
//      화면에는 "잠시 후 다시 시도해 주세요" 처럼 다음 행동을 알려 주는 말을 씁니다.
//      err.message 는 콘솔에만 남깁니다.
//
// 5) [없는 글] 로 나온 빨간 문구가 [정상 글] 을 눌러도 사라지지 않습니다.
//    제목도 나오고 그 위에 에러 문구도 같이 남아 있는 이상한 화면이 됩니다.
//    → 위 화면 코드가 error !== null 인지부터 보기 때문입니다.
//      성공했는데도 error 에 지난번 값이 남아 있으니 에러 화면으로 갑니다.
//      에러는 한 줄도 안 나고 화면만 조용히 틀립니다.
//      새 요청을 시작할 때 setError(null) 로 지우는 이유가 이것입니다.
