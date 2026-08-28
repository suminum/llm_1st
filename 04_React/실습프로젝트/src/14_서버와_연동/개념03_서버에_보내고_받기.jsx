// ============================================================
// 14단원 · 개념 03 — 서버에 보내고 받기
// ------------------------------------------------------------
// 실행: 터미널 두 개 (npm run dev / node 서버.js)
// ============================================================
//
// 개념01에서 **받아 왔고**, 개념02에서 **폼을 만들었습니다.**
// 이제 둘을 잇습니다. 폼에 쓴 것을 서버로 보냅니다.
//
// ★ 여기서 처음으로 **내가 데이터를 바꿉니다.**
//   지금까지는 읽기만 했습니다. 읽기는 틀려도 화면만 이상하지만,
//   쓰기는 틀리면 **자료가 잘못 남습니다.** 그래서 볼 것이 많습니다.
//
// ★★ 이 파일의 핵심은 하나입니다.
//
//     **화면에서 막았다고 끝이 아닙니다. 서버도 막습니다.**
//     그리고 서버가 막았을 때 그것을 **폼에 되돌려 보여 줘야** 합니다.

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Summary from "../_ui/Summary.jsx";
import { 서버주소, 서버안내 } from "./_서버주소.js";

// ── 섹션 1: POST 로 보냅니다 ──

// 받을 때와 다른 것이 셋입니다.
//
//     method: "POST"                          어떤 일을 할지
//     headers: { "Content-Type": ... }        무엇을 보내는지
//     body: JSON.stringify(값)                ★ 글자로 바꿔서 보냅니다
//
// ★ `body` 에 객체를 그냥 넣으면 안 됩니다. `[object Object]` 가 나갑니다.
//   HTTP 로는 글자만 보낼 수 있습니다. (JS자료 12단원 개념03)

async function 설비추가(값들) {
  const 응답 = await fetch(`${서버주소}/equipments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(값들),
  });

  const 몸 = await 응답.json().catch(() => ({}));

  // ★ 실패해도 본문에 이유가 들어 있습니다. 버리지 말고 같이 돌려줍니다.
  return { ok: 응답.ok, 상태: 응답.status, 몸 };
}

function Section1Demo() {
  const [결과, set결과] = useState("");

  async function 눌렀을때() {
    set결과("보내는 중...");
    try {
      const 답 = await 설비추가({ 이름: `시험설비 ${Date.now() % 10000}`, 담당: "홍길동" });
      set결과(`${답.상태} ${JSON.stringify(답.몸)}`);
    } catch {
      set결과(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>① 그냥 보내 보기</h3>
      <button onClick={눌렀을때}>설비 하나 추가</button>
      <pre className="output">{결과 || "버튼을 눌러 보세요"}</pre>
    </div>
  );
}

// ★ `201` 이 옵니다. `200` 이 아닙니다.
//   `201 Created` 는 "받아서 **새로 만들었다**" 는 뜻입니다.
//   `200` 은 그냥 "잘 됐다" 입니다. 만들었을 때는 201 을 쓰는 것이 관례입니다.
//   ★★ `응답.ok` 는 200~299 면 참이라 둘 다 통과합니다. 그래서 코드는 안 바뀝니다.

// ✏️ 직접 해보기 1 — 버튼을 두 번 누르고, 개념01의 목록 예제를 새로고침해 보세요.
//                    추가한 것이 보입니까?

// ── 섹션 2: 폼에서 보냅니다 ──

function Section2Demo() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { 이름: "", 담당: "" },
  });

  const [알림, set알림] = useState("");

  async function 보내기(값들) {
    set알림("");
    try {
      const 답 = await 설비추가(값들);
      if (!답.ok) {
        set알림(`실패 (${답.상태}): ${답.몸.메시지}`);
        return;
      }
      set알림(`추가했습니다: ${답.몸.설비.이름} (번호 ${답.몸.설비.번호})`);
      reset();
    } catch {
      set알림(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>② 폼에서 보내기</h3>

      <form onSubmit={handleSubmit(보내기)}>
        <div>
          이름{" "}
          <input
            {...register("이름", {
              required: "이름은 꼭 넣어야 합니다",
              minLength: { value: 2, message: "두 글자 이상" },
            })}
            placeholder="3호 프레스"
          />
          {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        </div>
        <div style={{ marginTop: 6 }}>
          담당 <input {...register("담당")} placeholder="김철수" />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ marginTop: 8 }}>
          {isSubmitting ? "보내는 중..." : "추가"}
        </button>
      </form>

      <div className="output">{알림 || "이름을 넣고 [추가] 를 눌러 보세요"}</div>
    </div>
  );
}

// ★ `disabled={isSubmitting}` 이 두 번 누르기를 막습니다. (개념02 섹션4)
//   서버가 느릴 때 이게 없으면 같은 설비가 두 개 생깁니다.
//
// ★★ 성공하면 `reset()` 으로 폼을 비웁니다.
//   안 비우면 방금 넣은 값이 남아 있어서 "또 눌러도 되나?" 싶어집니다.

// ✏️ 직접 해보기 2 — 이름을 비운 채 [추가] 를 눌러 보세요.
//                    F12 → Network 에 요청이 갑니까? 안 갑니까? 왜 그렇습니까?

// ── 섹션 3: ★★ 서버가 막았을 때 ──

// 화면에서 "두 글자 이상" 을 막았습니다. 그런데 서버는 다른 것도 봅니다.
//
//     · 이름이 비었나            (화면에서도 봅니다)
//     · ★ 이미 있는 이름인가     ← 화면에서는 **알 수가 없습니다**
//
// 이미 있는지는 서버만 압니다. 그래서 서버가 막고, 그것을 폼에 되돌려야 합니다.

function Section3Demo() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    defaultValues: { 이름: "3호 프레스" }, // 일부러 이미 있는 이름
  });

  const [알림, set알림] = useState("");

  async function 보내기(값들) {
    set알림("");
    try {
      const 답 = await 설비추가(값들);

      if (!답.ok) {
        // ★★★ 서버가 어느 칸이 문제인지 알려 주면 그 칸에 붙입니다
        if (답.몸.칸) {
          setError(답.몸.칸, { type: "server", message: 답.몸.메시지 });
        } else {
          set알림(답.몸.메시지 || `서버가 ${답.상태} 를 보냈습니다`);
        }
        return;
      }

      set알림(`추가했습니다: ${답.몸.설비.이름}`);
    } catch {
      set알림(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>③ 서버가 막으면 폼에 붙입니다</h3>

      <form onSubmit={handleSubmit(보내기)}>
        <div>
          이름{" "}
          <input {...register("이름", { required: "꼭 넣어야 합니다" })} />
          {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ marginTop: 8 }}>
          추가
        </button>
      </form>

      <div className="output">
        {알림 || "이미 있는 이름(3호 프레스)이 들어 있습니다. 그대로 눌러 보세요."}
      </div>
    </div>
  );
}

// ★★★ `setError` 가 이 섹션의 핵심입니다.
//
//   서버가 이렇게 답합니다.
//
//     409 { "메시지": "이미 있는 이름입니다", "칸": "이름" }
//
//   `칸` 을 보고 그 입력칸 옆에 빨간 글씨를 붙입니다.
//   화면에서 검사한 것과 **같은 자리에 같은 모양으로** 보입니다.
//   사용자는 그게 어디서 온 판정인지 알 필요가 없습니다.
//
// ★★ 서버가 `칸` 을 안 알려 주면 폼 전체 알림으로 보여 줍니다.
//   그래서 위 코드가 `if (답.몸.칸)` 로 갈라져 있습니다.
//
// ★ `type: "server"` 는 그냥 이름표입니다. 아무 글자나 됩니다.
//   나중에 "서버에서 온 오류만 지우기" 같은 것을 할 때 씁니다.
//
// ★★★ 왜 서버도 검사해야 하나 —
//   **화면 코드는 사용자가 고칠 수 있습니다.** F12 로 검사를 지우고 보낼 수 있습니다.
//   화면의 검사는 **친절**이고, 서버의 검사가 **진짜**입니다.
//   (백엔드자료에서 이 이야기를 자세히 합니다)

// ✏️ 직접 해보기 3 — ③번을 눌러 409 를 받아 보세요.
//                    그 다음 이름을 다른 것으로 바꾸고 다시 눌러 보세요.
//                    빨간 글씨가 언제 사라집니까?

// ✏️ 직접 해보기 4 — 서버 코드에서 `칸: "이름"` 을 지우고 서버를 다시 켜 보세요.
//                    같은 오류가 어디에 표시됩니까? 확인했으면 되돌리세요.

// ── 섹션 4: 보내고 나서 목록을 맞춥니다 ──

// 추가했는데 목록이 그대로면 사용자는 "안 됐나?" 합니다.
// 방법이 둘입니다.

function Section4Demo() {
  const [설비들, set설비들] = useState([]);
  const [상태, set상태] = useState("아직");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { 이름: "" },
  });

  async function 목록받기() {
    set상태("받는중");
    try {
      const 응답 = await fetch(`${서버주소}/equipments`);
      const 자료 = await 응답.json();
      set설비들(자료.설비들);
      set상태("됨");
    } catch {
      set상태("안됨");
    }
  }

  useEffect(() => {
    목록받기();
  }, []);

  async function 보내기(값들) {
    if (!값들.이름.trim()) return;
    try {
      const 답 = await 설비추가(값들);
      if (답.ok) {
        reset();
        await 목록받기(); // ★ 다시 받아 옵니다
      }
    } catch {
      set상태("안됨");
    }
  }

  return (
    <div className="demo">
      <h3>④ 추가하면 목록도 바뀝니다</h3>

      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} placeholder="새 설비 이름" />
        <button type="submit" disabled={isSubmitting} style={{ marginLeft: 6 }}>
          추가
        </button>
      </form>

      <div className="output">
        {상태 === "받는중" && "불러오는 중..."}
        {상태 === "안됨" && 서버안내}
        {상태 === "됨" && (
          <ul>
            {설비들.map((하나) => (
              <li key={하나.번호}>
                {하나.이름} — {하나.상태}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ★ 두 가지 방법
//
//   (가) 다시 받아 오기 (위 코드)
//        추가한 뒤 목록을 한 번 더 부릅니다.
//        · 좋은 점 — 서버와 **확실히** 같습니다
//        · 나쁜 점 — 요청이 한 번 더 갑니다. 느립니다
//
//   (나) 화면에만 더하기
//        `set설비들([...설비들, 답.몸.설비])`
//        · 좋은 점 — 즉시 반응합니다
//        · 나쁜 점 — ★ 서버가 정한 값(번호·기본 상태)을 놓칠 수 있습니다
//
// ★★ 이 서버는 응답에 만들어진 설비를 통째로 돌려줍니다(`답.몸.설비`).
//   그래서 (나) 도 안전합니다. **돌려주지 않는 서버라면 (가) 를 쓰세요.**
//
// ★★★ 초보일 때는 (가) 를 쓰세요. 느려도 틀리지 않습니다.
//   화면과 서버가 어긋나는 버그는 찾기가 아주 어렵습니다.

// ✏️ 직접 해보기 5 — `await 목록받기()` 를
//                    `set설비들([...설비들, 답.몸.설비])` 로 바꿔 보세요.
//                    잘 됩니까? 확인했으면 되돌려 두세요.

// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] `JSON.stringify` 를 빼먹음
//   body: 값들  →  서버가 [object Object] 를 받습니다.
//   ★ 서버는 "JSON 이 아닙니다" 라고 400 을 냅니다. 이 서버가 그렇게 답합니다.

// [실수 2] `Content-Type` 헤더를 빼먹음
//   서버가 무엇을 받았는지 몰라 본문을 안 읽는 경우가 있습니다.
//   ★ 이 연습용 서버는 그래도 읽지만, Express 는 안 읽습니다. (PART 3)

// [실수 3] 실패했는데 성공한 것처럼 처리
//   `응답.ok` 를 안 보고 바로 `reset()` 을 부릅니다.
//   사용자는 저장된 줄 압니다. 나중에 없어진 것을 알고 화냅니다.

// [실수 4] 오류 본문을 버림
//   `if (!응답.ok) throw new Error("실패")` 로 뭉뚱그립니다.
//   서버가 "이미 있는 이름입니다" 라고 알려 줬는데 그걸 버린 것입니다. (섹션 3)

// [실수 5] `isSubmitting` 없이 둠
//   느린 서버에서 두 번 눌러 두 개가 저장됩니다.

// [실수 6] 서버 검사를 안 만들고 화면 검사만 함
//   화면 검사는 F12 로 지울 수 있습니다. 서버가 진짜 문지기입니다. (섹션 3)

// ── 화면 ──

export default function Concept03Post() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 03 — 서버에 보내고 받기</h1>

      <p className="guide">
        <strong>서버를 켜야 합니다.</strong>
        <code>실습프로젝트/14단원_서버</code> 에서 <code>node 서버.js</code>
        <br />
        <br />
        여기서 추가한 설비는 <strong>서버가 꺼지면 사라집니다.</strong> 메모리에만 있습니다.
        마음껏 눌러 보세요.
        <br />
        <br />
        <strong>③번이 이 파일의 핵심입니다.</strong> 서버가 막은 것을 폼에 되돌리는 방법입니다.
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
          "보낼 때는 method·headers·body 셋을 붙입니다. body 에는 JSON.stringify 로 글자를 만들어 넣습니다. 객체를 그냥 넣으면 [object Object] 가 나갑니다.",
          "새로 만들면 서버가 201 을 보냅니다. 응답.ok 는 200~299 를 참으로 보므로 코드는 안 바뀝니다.",
          "실패해도 본문에 이유가 들어 있습니다. 버리지 말고 화면에 쓰세요. 상태 코드만으로는 사용자에게 할 말이 안 나옵니다.",
          "★ 화면 검사는 친절이고 서버 검사가 진짜입니다. 화면 코드는 F12 로 고칠 수 있습니다.",
          "★ 서버가 어느 칸이 문제인지 알려 주면 setError 로 그 칸에 붙입니다. 사용자는 화면 검사와 서버 검사를 구분할 필요가 없습니다.",
          "isSubmitting 으로 버튼을 잠급니다. 안 잠그면 느린 서버에서 두 개가 저장됩니다.",
          "추가한 뒤에는 목록을 다시 받아 옵니다. 화면에만 더하는 방법은 빠르지만 서버가 정한 값을 놓칠 수 있습니다. 초보일 때는 다시 받아 오세요.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 두 번 누르면 `시험설비 1234`, `시험설비 5678` 처럼 다른 이름이 들어갑니다.
//    (`Date.now() % 10000` 으로 이름을 다르게 만들어 중복을 피했습니다)
//    개념01의 목록을 새로고침하면 늘어나 있습니다.
//    → ★ 두 예제가 **같은 서버**를 봅니다. 화면이 달라도 자료는 하나입니다.
//      서버를 껐다 켜면 처음 셋으로 돌아갑니다.
//
// 2) 화면: "이름은 꼭 넣어야 합니다" 가 뜹니다.
//    Network: ★ **요청이 아예 안 갑니다.**
//    → `handleSubmit` 이 검증을 먼저 하고, 통과했을 때만 `보내기` 를 부르기 때문입니다.
//      ★ 서버에 쓸데없는 요청을 안 보내는 것이 화면 검사의 이득입니다.
//        (그렇다고 서버 검사를 빼도 되는 것은 아닙니다. 섹션 3)
//
// 3) 화면: 이름칸 옆에 "이미 있는 이름입니다" 가 빨갛게 붙습니다.
//    이름을 바꾸면 —
//    → ★ 바로 안 사라집니다. **다시 [추가] 를 눌러야** 사라집니다.
//      `setError` 로 넣은 오류는 그 칸을 다시 검사할 때 지워지는데,
//      서버 검사는 보낼 때만 하기 때문입니다.
//    ★★ 거슬리면 이렇게 지울 수 있습니다.
//         const { clearErrors } = useForm(...);
//         <input {...register("이름", { onChange: () => clearErrors("이름") })} />
//
// 4) 서버에서 `칸: "이름"` 을 지우면 —
//    화면: 빨간 글씨가 칸 옆이 아니라 **아래 알림 상자**에 나옵니다.
//    → `if (답.몸.칸)` 이 거짓이 되어 `set알림` 쪽으로 갔기 때문입니다.
//      ★ 서버가 어디가 문제인지 알려 주느냐 마느냐로 화면이 달라집니다.
//        서버를 만들 때 `칸` 을 같이 보내 주면 프론트가 훨씬 편해집니다.
//        PART 3 에서 서버를 만들 때 기억해 두세요.
//
// 5) set설비들([...설비들, 답.몸.설비]) 로 바꾸면 —
//    화면: 잘 됩니다. 그리고 **더 빠릅니다.** 요청이 한 번만 갑니다.
//    → 이 서버가 만들어진 설비를 통째로 돌려주기 때문입니다.
//      `번호` 도 `상태` 도 서버가 정한 값이 그대로 들어옵니다.
//    ★ 만약 서버가 `{ ok: true }` 만 돌려줬다면 번호를 몰라서
//      `key={하나.번호}` 가 깨졌을 것입니다. 그때는 다시 받아 와야 합니다.
//    확인했으면 되돌려 두세요.
