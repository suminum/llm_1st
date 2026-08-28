// ============================================================
// 14단원 · 연습문제 정답 (12문항)
// ------------------------------------------------------------
// 실행: 터미널 두 개
//   ① 실습프로젝트 에서              npm run dev
//   ② 실습프로젝트/14단원_서버 에서   node 서버.js
// ============================================================
//
// ★ 코드만 보지 말고 각 문제 아래의 설명을 읽으세요.
//   왜 그렇게 쓰는지가 답보다 중요합니다.
//
// ★★ 그리고 정답을 본 뒤에 **연습문제 파일에서 다시 손으로** 써 보세요.

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Summary from "../_ui/Summary.jsx";
import { 서버주소, 서버안내 } from "./_서버주소.js";

// ───── 문제 1 정답 ─────

function Problem01() {
  const [설비들, set설비들] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const 응답 = await fetch(`${서버주소}/equipments`);
        if (!응답.ok) return;
        const 자료 = await 응답.json();
        set설비들(자료.설비들);
      } catch {
        // 서버가 안 켜졌으면 그냥 빈 채로 둡니다 (문제 2에서 다룹니다)
      }
    })();
  }, []);

  return (
    <div className="demo">
      <h3>문제 1 — 목록 받아 그리기</h3>
      <ul className="output">
        {설비들.map((하나) => (
          <li key={하나.번호}>{하나.이름}</li>
        ))}
      </ul>
    </div>
  );
}

// ★ `useEffect` 안에서 바로 `async` 를 못 씁니다.
//   `useEffect(async () => {...})` 는 안 됩니다. useEffect 는 **치우는 함수**를
//   돌려받길 기대하는데, async 함수는 Promise 를 돌려주기 때문입니다.
//   그래서 안에서 async 함수를 만들어 바로 부릅니다. (09단원 개념03)
//
// ★★ `[]` 를 빼먹으면 받아올 때마다 다시 그려지고, 다시 그려지니 또 받아옵니다.
//   무한히 돕니다. Network 탭이 요청으로 가득 찹니다.

// ───── 문제 2 정답 ─────

function Problem02() {
  const [상태, set상태] = useState("아직");
  const [말, set말] = useState("");

  async function 불러오기() {
    set상태("받는중");
    set말("");

    try {
      const 응답 = await fetch(`${서버주소}/equipments?slow=1200`);
      if (!응답.ok) throw new Error(`서버가 ${응답.status} 를 보냈습니다`);

      const 자료 = await 응답.json();
      set상태("됨");
      set말(`${자료.설비들.length}건 받았습니다`);
    } catch (오류) {
      set상태("안됨");
      set말(오류.name === "TypeError" ? 서버안내 : 오류.message);
    }
  }

  return (
    <div className="demo">
      <h3>문제 2 — 불러오는 중 보여 주기</h3>
      <button onClick={불러오기}>느리게 불러오기</button>
      <div className="output">
        {상태 === "받는중" ? "불러오는 중..." : 말 || "버튼을 눌러 보세요"}
      </div>
    </div>
  );
}

// ★★ `set상태("받는중")` 을 **try 밖 맨 위**에 둡니다.
//   try 안에 두면 오류가 났을 때 "받는중" 인 채로 멈출 수 있습니다.
//
// ★ 오류를 두 갈래로 갈랐습니다. `TypeError` 면 "서버를 켜세요",
//   그 밖이면 서버가 알려 준 말. 사용자에게 할 말이 다릅니다. (개념01 섹션3)

// ───── 문제 3 정답 ─────

function Problem03() {
  const [말, set말] = useState("");

  async function 눌렀을때() {
    set말("");
    try {
      const 응답 = await fetch(`${서버주소}/equipments?fail=yes`);
      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        set말(몸.메시지 || `서버가 ${응답.status} 를 보냈습니다`);
        return;
      }
      set말("이번에는 성공했습니다");
    } catch {
      set말(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>문제 3 — 서버가 보낸 이유 보여 주기</h3>
      <button onClick={눌렀을때}>고장 내기</button>
      <div className="output">{말 || "버튼을 눌러 보세요"}</div>
    </div>
  );
}

// ★★★ `.json()` 을 **응답.ok 를 보기 전에** 부른 것에 주목하세요.
//   실패한 응답에도 본문이 들어 있기 때문입니다.
//   `if (!응답.ok) throw new Error("실패")` 로 끝내면 그 본문을 버리게 됩니다.
//
// ★ `.catch(() => ({}))` 를 붙인 이유 —
//   서버가 JSON 이 아닌 것(HTML 오류 페이지 등)을 보낼 수도 있습니다.
//   그때 `.json()` 이 터지면 진짜 원인이 가려집니다. (JS자료 14단원 개념05)

// ───── 문제 4 정답 ─────

function Problem04() {
  const { register, handleSubmit } = useForm({ defaultValues: { 이름: "" } });

  function 보내기(값들) {
    console.log(JSON.stringify(값들));
  }

  return (
    <div className="demo">
      <h3>문제 4 — useForm 기본</h3>
      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} placeholder="3호 프레스" />
        <button type="submit" style={{ marginLeft: 6 }}>
          보내기
        </button>
      </form>
      <div className="output">콘솔(F12)을 보세요</div>
    </div>
  );
}

// ★ `handleSubmit` 이 `e.preventDefault()` 를 대신 불러 줍니다.
//   그래서 페이지가 새로고침되지 않습니다.
//   `onSubmit={보내기}` 로 직접 넘기면 폼이 기본 동작을 해서 화면이 깜빡입니다.

// ───── 문제 5 정답 ─────

function Problem05() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur", // ★ 칸을 벗어날 때 검사
    defaultValues: { 이름: "" },
  });

  return (
    <div className="demo">
      <h3>문제 5 — 검증 규칙 붙이기</h3>
      <form onSubmit={handleSubmit(() => {})}>
        <input
          {...register("이름", {
            required: "이름은 꼭 넣어야 합니다",
            minLength: { value: 2, message: "두 글자 이상 넣으세요" },
          })}
          placeholder="3호 프레스"
        />
        {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        <button type="submit" style={{ marginLeft: 6 }}>
          보내기
        </button>
      </form>
      <div className="output">칸을 벗어나 보세요</div>
    </div>
  );
}

// ★ `mode` 를 안 정하면 기본값이 `"onSubmit"` 입니다. 버튼을 눌러야만 검사합니다.
//   사용자는 다 채우고 누른 뒤에야 빨간 글씨를 봅니다.
//
// ★★ `minLength` 는 숫자만 줘도 되지만(`minLength: 2`),
//   그러면 메시지를 못 붙입니다. `{ value, message }` 로 주는 편이 낫습니다.

// ───── 문제 6 정답 ─────

function Problem06() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { 이름: "" } });

  const [센수, set센수] = useState(0);

  async function 보내기() {
    await new Promise((풀기) => setTimeout(풀기, 1000));
    set센수((전) => 전 + 1);
  }

  return (
    <div className="demo">
      <h3>문제 6 — 두 번 누르기 막기</h3>
      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} placeholder="아무거나" />
        <button type="submit" disabled={isSubmitting} style={{ marginLeft: 6 }}>
          {isSubmitting ? "보내는 중..." : "보내기"}
        </button>
      </form>
      <div className="output">보낸 횟수: {센수}</div>
    </div>
  );
}

// ★★ `isSubmitting` 은 `handleSubmit` 이 넘겨받은 함수가 **Promise 를 돌려줄 때만**
//   참이 됩니다. `보내기` 가 `async` 라서 됩니다.
//   `async` 를 빼고 안에서 그냥 `setTimeout` 을 쓰면 **바로 끝난 것으로 봅니다.**
//   버튼이 안 잠깁니다.
//
// ★ `set센수((전) => 전 + 1)` 로 쓴 이유 — 빠르게 여러 번이면 `센수 + 1` 이
//   낡은 값을 볼 수 있습니다. (04단원 개념05)

// ───── 문제 7 정답 ─────

function Problem07() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { 이름: "" } });
  const [말, set말] = useState("");

  async function 보내기(값들) {
    set말("");
    try {
      const 응답 = await fetch(`${서버주소}/equipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(값들),
      });
      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        set말(`실패 (${응답.status}): ${몸.메시지}`);
        return;
      }
      set말(`추가했습니다 (번호 ${몸.설비.번호})`);
      reset();
    } catch {
      set말(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>문제 7 — 서버로 보내기</h3>
      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} placeholder="새 설비 이름" />
        <button type="submit" style={{ marginLeft: 6 }}>
          추가
        </button>
      </form>
      <div className="output">{말 || "이름을 넣고 눌러 보세요"}</div>
    </div>
  );
}

// ★★ 셋을 다 붙여야 합니다.
//     method   안 쓰면 GET 이 됩니다. 서버가 404 를 냅니다.
//     headers  안 쓰면 서버가 본문을 안 읽을 수 있습니다.
//     body     ★ JSON.stringify 를 안 하면 [object Object] 가 나갑니다
//
// ★ 성공하면 `reset()` 으로 비웁니다. 안 비우면 같은 이름을 또 보내서 409 가 납니다.

// ───── 문제 8 정답 ─────

function Problem08() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { 이름: "3호 프레스" } });

  const [말, set말] = useState("");

  async function 보내기(값들) {
    set말("");
    try {
      const 응답 = await fetch(`${서버주소}/equipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(값들),
      });
      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        if (몸.칸) {
          setError(몸.칸, { type: "server", message: 몸.메시지 });
        } else {
          set말(몸.메시지 || `서버가 ${응답.status} 를 보냈습니다`);
        }
        return;
      }
      set말(`추가했습니다: ${몸.설비.이름}`);
    } catch {
      set말(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>문제 8 — 서버 오류를 칸에 붙이기</h3>
      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} />
        {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        <button type="submit" style={{ marginLeft: 6 }}>
          추가
        </button>
      </form>
      <div className="output">{말 || "그대로 눌러 보세요"}</div>
    </div>
  );
}

// ★★★ 사용자 입장에서는 화면이 검사한 것과 서버가 검사한 것이 **똑같이 보입니다.**
//   그게 맞습니다. 어디서 판정했는지는 사용자가 알 바가 아닙니다.
//
// ★ `몸.칸` 이 없을 때를 대비해 갈랐습니다.
//   서버가 늘 칸을 알려 주는 것은 아닙니다. 알려 주지 않으면 폼 전체 알림으로 갑니다.

// ───── 문제 9 정답 ─────

function Problem09() {
  const [말, set말] = useState("");

  async function 올리기(e) {
    e.preventDefault();
    const 파일 = e.target.파일칸.files[0];
    if (!파일) {
      set말("파일을 먼저 고르세요");
      return;
    }

    try {
      const 그릇 = new FormData();
      그릇.append("파일", 파일);

      const 응답 = await fetch(`${서버주소}/files`, {
        method: "POST",
        body: 그릇,
        // ★ headers 를 쓰지 않습니다
      });
      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        set말(`실패 (${응답.status}): ${몸.메시지}`);
        return;
      }
      set말(`올렸습니다: ${몸.저장이름}`);
    } catch {
      set말(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>문제 9 — 파일 올리기</h3>
      <form onSubmit={올리기}>
        <input type="file" name="파일칸" />
        <button type="submit" style={{ marginLeft: 6 }}>
          올리기
        </button>
      </form>
      <div className="output">{말 || "파일을 고르고 눌러 보세요"}</div>
    </div>
  );
}

// ★★★ `headers` 를 안 쓰는 것이 핵심입니다.
//   FormData 를 body 에 넣으면 브라우저가 `boundary=` 까지 붙은
//   Content-Type 을 알아서 만듭니다. 내가 쓰면 그게 빠집니다. (개념04 섹션3)
//
// ★ 서버가 저장 이름을 바꿔서 돌려줍니다. 같은 이름을 올려도 안 덮어씁니다.

// ───── 문제 10 정답 [응용] ─────

function Problem10() {
  const [설비들, set설비들] = useState([]);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { 이름: "" } });

  async function 목록받기() {
    try {
      const 응답 = await fetch(`${서버주소}/equipments`);
      if (!응답.ok) return;
      const 자료 = await 응답.json();
      set설비들(자료.설비들);
    } catch {
      set설비들([]);
    }
  }

  useEffect(() => {
    목록받기();
  }, []);

  async function 보내기(값들) {
    if (!값들.이름.trim()) return;
    try {
      const 응답 = await fetch(`${서버주소}/equipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(값들),
      });
      if (!응답.ok) return;
      reset();
      await 목록받기(); // ★ 다시 받아 옵니다
    } catch {
      // 서버가 없으면 그냥 둡니다
    }
  }

  return (
    <div className="demo">
      <h3>문제 10 [응용] — 추가하면 목록도 바뀌게</h3>
      <form onSubmit={handleSubmit(보내기)}>
        <input {...register("이름")} placeholder="새 설비 이름" />
        <button type="submit" style={{ marginLeft: 6 }}>
          추가
        </button>
      </form>
      <ul className="output">
        {설비들.map((하나) => (
          <li key={하나.번호}>{하나.이름}</li>
        ))}
      </ul>
    </div>
  );
}

// ★ `await 목록받기()` 에 `await` 를 붙였습니다. 안 붙이면 `reset()` 과 겹쳐
//   순서가 어긋날 수 있습니다.
//
// ★★ 화면에만 더하는 방법(`set설비들([...설비들, 몸.설비])`)도 됩니다.
//   이 서버가 만들어진 설비를 돌려주기 때문입니다.
//   ★ 돌려주지 않는 서버라면 번호를 몰라서 `key` 가 깨집니다. 그때는 다시 받아야 합니다.
//   (개념03 섹션4)

// ───── 문제 11 정답 [도전] ─────

function Problem11() {
  const [보일까, set보일까] = useState(false);

  return (
    <div className="demo">
      <h3>문제 11 [도전] — 사라질 때 요청 끊기</h3>
      <button onClick={() => set보일까(!보일까)}>{보일까 ? "숨기기" : "보이기"}</button>
      {보일까 && <느린칸 />}
      <div className="output">콘솔(F12)을 보세요</div>
    </div>
  );
}

function 느린칸() {
  const [말, set말] = useState("받는 중...");

  useEffect(() => {
    const 끊개 = new AbortController();

    (async () => {
      try {
        const 응답 = await fetch(`${서버주소}/equipments?slow=1200`, {
          signal: 끊개.signal,
        });
        const 자료 = await 응답.json();
        set말(`${자료.설비들.length}건`);
      } catch (오류) {
        if (오류.name === "AbortError") {
          console.log("끊었습니다");
          return; // ★ set 을 안 부릅니다
        }
        set말("안 됐습니다");
      }
    })();

    return () => 끊개.abort();
  }, []);

  return <div style={{ marginTop: 6 }}>{말}</div>;
}

// ★★ `return () => 끊개.abort()` 가 화면이 사라질 때 불립니다.
//   그러면 진행 중이던 fetch 가 `AbortError` 로 끝납니다.
//
// ★★★ `if (오류.name === "AbortError") return;` 이 꼭 있어야 합니다.
//   없으면 "안 됐습니다" 를 set 하려 하는데, 그 컴포넌트는 이미 사라졌습니다.
//   React 18 부터 조용히 무시되지만 **의미 없는 일**입니다.
//
// ★ StrictMode 때문에 개발 중에는 이 효과가 두 번 돕니다.
//   그래서 처음 열자마자 한 번 끊기고 다시 요청합니다. **정상입니다.**
//   콘솔에 "끊었습니다" 가 한 번 더 보이는 것이 그 때문입니다.

// ───── 문제 12 정답 (에러 확인) ─────

function Problem12() {
  const [말, set말] = useState("");

  async function 잘못보내기() {
    const 그릇 = new FormData();
    그릇.append("파일", new File(["시험"], "시험.txt", { type: "text/plain" }));

    try {
      const 응답 = await fetch(`${서버주소}/files`, {
        method: "POST",
        body: 그릇,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const 몸 = await 응답.json().catch(() => ({}));
      set말(`${응답.status} ${JSON.stringify(몸)}`);
    } catch {
      set말(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>문제 12 — 에러 확인</h3>
      <button onClick={잘못보내기}>잘못 보내기</button>
      <div className="output">{말 || "눌러서 오류를 확인하세요"}</div>
    </div>
  );
}

// ── 모범 답안 ──
//
// (1) 400 {"메시지":"multipart/form-data 가 아닙니다"}
//     boundary 가 없어서 서버가 본문을 조각으로 나누지도 못한 것입니다.
//
// (2) Request Headers 의 Content-Type 이 —
//
//       개념04 ②번:  multipart/form-data; boundary=----WebKitFormBoundaryAbC123…
//       이 문제:      multipart/form-data
//
//     ★ `boundary=` 가 통째로 없습니다.
//
// (3) multipart 는 조각을 나누는 **경계 글자**가 있어야 읽을 수 있습니다.
//     본문 안에는 그 경계가 들어 있는데, 헤더에 안 적혀 있으니
//     서버는 무엇으로 나눠야 할지 모릅니다. 그래서 조각을 하나도 못 찾습니다.
//     → 서버는 "파일이 없다" 고 판단합니다.
//
//     ★★ 경계 글자는 브라우저가 **매번 새로 만듭니다.** 그래서 내가 미리 쓸 수 없습니다.
//       `body` 가 FormData 면 헤더는 브라우저에게 맡기세요.
//
//     ★★★ 이 오류가 헷갈리는 이유 —
//       메시지는 "multipart/form-data 가 아닙니다" 인데, 나는 분명히 그렇게 썼습니다.
//       빠진 것은 그 뒤에 브라우저가 붙여 줬어야 할 boundary=... 입니다.
//       ★ 오류 메시지의 글자만 보지 말고, Network 탭에서
//         **실제로 나간 헤더**를 보는 습관이 여기서 값을 합니다.

// ── 화면 ──

export default function Exercise14Answer() {
  return (
    <div>
      <h1>14단원 연습문제 정답</h1>

      <p className="guide">
        <strong>답만 보지 마세요.</strong> 각 문제 아래의 <strong>★</strong> 설명이 본론입니다.
        <br />
        <br />
        <strong>터미널 두 개가 필요합니다.</strong> ① <code>npm run dev</code> ②{" "}
        <code>node 서버.js</code>
        <br />
        <br />
        정답을 본 뒤 <strong>연습문제 파일에서 다시 손으로</strong> 써 보세요.
      </p>

      <Problem01 />
      <Problem02 />
      <Problem03 />
      <Problem04 />
      <Problem05 />
      <Problem06 />
      <Problem07 />
      <Problem08 />
      <Problem09 />
      <Problem10 />
      <Problem11 />
      <Problem12 />

      <Summary
        items={[
          "useEffect 안에서 async 를 바로 못 씁니다. 안에서 async 함수를 만들어 부릅니다. 의존성 배열 [] 을 빠뜨리면 무한히 돕니다.",
          "실패한 응답에도 본문이 있습니다. 응답.ok 를 보기 전에 .json() 을 부르고, 서버가 적어 준 이유를 화면에 쓰세요.",
          "handleSubmit 이 preventDefault 를 대신 부릅니다. mode 를 정해야 제때 검사하고, isSubmitting 은 넘긴 함수가 async 일 때만 참이 됩니다.",
          "보낼 때는 method·headers·body 셋. body 에는 JSON.stringify. 성공하면 reset 으로 비웁니다.",
          "★ 서버가 알려 준 칸에 setError 로 붙이면, 사용자는 화면 검사와 서버 검사를 구분할 필요가 없습니다.",
          "★★ FormData 를 보낼 때는 headers 를 쓰지 않습니다. boundary 가 빠져서 서버가 본문을 못 읽고 400 을 줍니다. 헤더는 브라우저에게 맡기세요.",
          "사라질 때는 AbortController 로 끊고, AbortError 면 set 을 부르지 않고 빠져나옵니다.",
        ]}
      />
    </div>
  );
}
