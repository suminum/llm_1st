// ============================================================
// 14단원 · 연습문제 (12문항)
// ------------------------------------------------------------
// 실행: 터미널 두 개
//   ① 실습프로젝트 에서              npm run dev
//   ② 실습프로젝트/14단원_서버 에서   node 서버.js
//
// F12 → Console 과 Network 를 함께 열어 두세요.
// ============================================================
//
// 푸는 방법
//   1) 문제 설명을 읽습니다.
//   2) TODO 자리에 코드를 씁니다.
//   3) 저장하면 화면이 저절로 새로 그려집니다. 기대 결과와 맞는지 봅니다.
//   4) 막히면 개념 파일의 해당 섹션을 보세요. 문제마다 적어 두었습니다.
//
//   문제 1~9   기본
//   문제 10    [응용]
//   문제 11    [도전]
//   문제 12    에러 확인
//
// ★ 콘솔에 같은 줄이 두 번씩 찍히는 것은 정상입니다(StrictMode).
//   기대 결과에는 한 번만 적어 두었습니다.
//
// ★★ 서버를 껐다 켜면 설비 목록이 처음 셋으로 돌아갑니다.
//   연습하다 이름이 겹쳐 409 가 나면 서버를 다시 켜세요.

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Summary from "../_ui/Summary.jsx";
import { 서버주소, 서버안내 } from "./_서버주소.js";

// ───── 문제 1 ───── (개념01 섹션2)
// 화면이 처음 나타날 때 설비 목록을 받아 와 이름만 <li> 로 그리세요.
// 주소는 `${서버주소}/equipments` 입니다. 응답은 { 설비들: [...] } 모양입니다.
//
// 기대 결과 (화면): 3호 프레스 / 5호 컨베이어 / 7호 절단기 세 줄
//                  아무것도 안 나오면 useEffect 를 안 썼거나 .json() 을 빠뜨린 것입니다.
//                  서버를 안 켰으면 화면이 계속 비어 있습니다.

function Problem01() {
  const [설비들, set설비들] = useState([]);

  // TODO: 여기에 useEffect 를 쓰세요

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

// ───── 문제 2 ───── (개념01 섹션3)
// 상태를 셋으로 나누세요. "받는중" 이면 "불러오는 중...",
// "안됨" 이면 서버안내, "됨" 이면 몇 건인지 보여 주세요.
// [느리게] 버튼은 ?slow=1200 을 붙여 부릅니다.
//
// 기대 결과 (화면): [느리게] 를 누르면 1.2초 동안 "불러오는 중..." 이 보이고
//                  그 뒤에 "3건 받았습니다" 가 나옵니다.
//                  누르자마자 결과가 나오면 상태를 안 나눈 것입니다.

function Problem02() {
  const [상태, set상태] = useState("아직");
  const [말, set말] = useState("");

  async function 불러오기() {
    // TODO: 상태를 "받는중" 으로 바꾸고, 받아 온 뒤 "됨" 또는 "안됨" 으로 바꾸세요
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

// ───── 문제 3 ───── (개념01 섹션3, 개념05 섹션1)
// ?fail=yes 를 붙여 부르면 서버가 500 을 보냅니다.
// 그때 서버가 보낸 본문의 `메시지` 를 화면에 보여 주세요.
//
// 기대 결과 (화면): 서버가 잠깐 이상합니다
//                  "실패했습니다" 같은 내 마음대로 쓴 말이 나오면 본문을 안 읽은 것입니다.
//                  ★ 500 은 catch 로 안 갑니다. 응답.ok 를 봐야 합니다.

function Problem03() {
  const [말, set말] = useState("");

  async function 눌렀을때() {
    // TODO: ?fail=yes 로 부르고, 응답.ok 가 거짓이면 본문의 메시지를 보여 주세요
  }

  return (
    <div className="demo">
      <h3>문제 3 — 서버가 보낸 이유 보여 주기</h3>
      <button onClick={눌렀을때}>고장 내기</button>
      <div className="output">{말 || "버튼을 눌러 보세요"}</div>
    </div>
  );
}

// ───── 문제 4 ───── (개념02 섹션2)
// useForm 으로 이름 하나만 받는 폼을 만드세요.
// 보내면 콘솔에 값을 찍습니다. 화면 새로고침이 일어나면 안 됩니다.
//
// 기대 결과 (콘솔): {"이름":"3호 프레스"}
//                  누를 때 페이지가 깜빡이면 handleSubmit 으로 안 감싼 것입니다.

function Problem04() {
  // TODO: useForm 에서 register 와 handleSubmit 을 꺼내세요

  return (
    <div className="demo">
      <h3>문제 4 — useForm 기본</h3>
      {/* TODO: form 을 만들고 input 에 register 를 붙이세요 */}
      <div className="output">콘솔(F12)을 보세요</div>
    </div>
  );
}

// ───── 문제 5 ───── (개념02 섹션3)
// 이름 칸에 규칙을 붙이세요.
//   · 비면 "이름은 꼭 넣어야 합니다"
//   · 두 글자 미만이면 "두 글자 이상 넣으세요"
// 오류 메시지를 칸 옆에 보여 주세요. 칸을 벗어날 때 검사되게 하세요.
//
// 기대 결과 (화면): 빈 칸에서 다른 곳을 누르면 "이름은 꼭 넣어야 합니다"
//                  한 글자만 넣고 벗어나면 "두 글자 이상 넣으세요"
//                  누를 때까지 아무 말도 없으면 mode 를 안 정한 것입니다.

function Problem05() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // TODO: mode 를 정하세요
    defaultValues: { 이름: "" },
  });

  return (
    <div className="demo">
      <h3>문제 5 — 검증 규칙 붙이기</h3>
      <form onSubmit={handleSubmit(() => {})}>
        {/* TODO: register 에 required 와 minLength 를 넣으세요 */}
        <input {...register("이름")} placeholder="3호 프레스" />
        {/* TODO: errors.이름 이 있으면 메시지를 보여 주세요 */}
        <button type="submit" style={{ marginLeft: 6 }}>
          보내기
        </button>
      </form>
      <div className="output">칸을 벗어나 보세요</div>
    </div>
  );
}

// ───── 문제 6 ───── (개념02 섹션4)
// 보내는 동안 버튼을 잠그고 글자를 "보내는 중..." 으로 바꾸세요.
// `보내기` 함수는 일부러 1초가 걸립니다.
//
// 기대 결과 (화면): 누르면 1초 동안 버튼이 회색이 되고 "보내는 중..." 이 보입니다.
//                  두 번 눌러도 한 번만 실행됩니다.
//                  잠기지 않으면 isSubmitting 을 안 꺼낸 것입니다.

function Problem06() {
  const {
    register,
    handleSubmit,
    formState: {
      /* TODO: 여기서 isSubmitting 을 꺼내세요 */
    },
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
        {/* TODO: disabled 와 글자를 isSubmitting 으로 바꾸세요 */}
        <button type="submit" style={{ marginLeft: 6 }}>
          보내기
        </button>
      </form>
      <div className="output">보낸 횟수: {센수}</div>
    </div>
  );
}

// ───── 문제 7 ───── (개념03 섹션1)
// 폼의 값을 서버에 POST 로 보내세요. 성공하면 서버가 돌려준 설비의 번호를 보여 줍니다.
// 주소는 `${서버주소}/equipments`, method·headers·body 셋을 다 붙여야 합니다.
//
// 기대 결과 (화면): 추가했습니다 (번호 4)
//                  번호는 누를 때마다 늘어납니다.
//                  400 이 오면 body 에 JSON.stringify 를 안 한 것입니다.

function Problem07() {
  const { register, handleSubmit } = useForm({ defaultValues: { 이름: "" } });
  const [말, set말] = useState("");

  async function 보내기(값들) {
    // TODO: POST 로 보내고, 성공하면 "추가했습니다 (번호 N)" 을 보여 주세요
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

// ───── 문제 8 ───── (개념03 섹션3)
// 이미 있는 이름(3호 프레스)을 보내면 서버가 409 와 함께
// { 메시지, 칸 } 을 보냅니다. 그 메시지를 **이름 칸 옆에** 붙이세요.
//
// 기대 결과 (화면): 이름 칸 옆에 빨갛게 "이미 있는 이름입니다"
//                  아래 알림 상자에 나오면 setError 를 안 쓴 것입니다.

function Problem08() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { 이름: "3호 프레스" } });

  const [말, set말] = useState("");

  async function 보내기(값들) {
    const 응답 = await fetch(`${서버주소}/equipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(값들),
    });
    const 몸 = await 응답.json().catch(() => ({}));

    if (!응답.ok) {
      // TODO: 몸.칸 이 있으면 setError 로 그 칸에 붙이세요
      return;
    }
    set말(`추가했습니다: ${몸.설비.이름}`);
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

// ───── 문제 9 ───── (개념04 섹션2)
// 고른 파일을 FormData 에 담아 `${서버주소}/files` 로 올리세요.
// 성공하면 서버가 준 `저장이름` 을 보여 줍니다.
//
// 기대 결과 (화면): 올렸습니다: 1787…_ab12cd.txt
//                  400 "파일이 안 왔습니다" → FormData 에 파일을 안 담은 것입니다.
//                  400 "multipart/form-data 가 아닙니다" → Content-Type 을 직접 쓴 것입니다.

function Problem09() {
  const [말, set말] = useState("");

  async function 올리기(e) {
    e.preventDefault();
    const 파일 = e.target.파일칸.files[0];
    if (!파일) {
      set말("파일을 먼저 고르세요");
      return;
    }
    // TODO: FormData 에 담아 POST 로 보내고 저장이름을 보여 주세요
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

// ───── 문제 10 ───── [응용] (개념03 섹션4)
// 목록과 추가 폼을 한 화면에 두세요.
// 추가에 성공하면 목록도 같이 바뀌어야 합니다.
//
// 기대 결과 (화면): 처음에 세 줄이 보이고, 이름을 넣어 [추가] 하면 네 줄이 됩니다.
//                  추가했는데 목록이 그대로면 다시 받아 오지 않은 것입니다.

function Problem10() {
  const [설비들, set설비들] = useState([]);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { 이름: "" } });

  async function 목록받기() {
    // TODO: 목록을 받아 set설비들 하세요
  }

  useEffect(() => {
    목록받기();
  }, []);

  async function 보내기(값들) {
    // TODO: 추가하고, 성공하면 reset 하고 목록을 다시 받으세요
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

// ───── 문제 11 ───── [도전] (개념05 섹션3)
// 이 컴포넌트가 사라질 때 진행 중인 요청을 끊으세요.
// 끊겼으면 콘솔에 "끊었습니다" 를 찍습니다. (set 은 부르지 않습니다)
//
// 기대 결과 (콘솔): [보이기] 를 누르고 1초 안에 [숨기기] 를 누르면
//                  끊었습니다
//                  1초를 넘겨 기다린 뒤 숨기면 안 찍힙니다.

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
    // TODO: AbortController 를 만들어 signal 을 넘기고,
    //       돌려주는 함수에서 abort() 를 부르세요.
    //       AbortError 면 "끊었습니다" 를 찍고 set 은 부르지 마세요.
    (async () => {
      const 응답 = await fetch(`${서버주소}/equipments?slow=1200`);
      const 자료 = await 응답.json();
      set말(`${자료.설비들.length}건`);
    })().catch(() => set말("안 됐습니다"));
  }, []);

  return <div style={{ marginTop: 6 }}>{말}</div>;
}

// ───── 문제 12 ───── 에러 확인 (개념04 섹션3)
// 아래 [잘못 보내기] 는 FormData 에 Content-Type 을 직접 붙입니다.
// 눌러서 무슨 일이 생기는지 보고, 아래 답을 주석으로 적으세요.
//
//   (1) 상태 코드와 메시지는 무엇입니까?
//   (2) Network 탭의 Request Headers 에서 Content-Type 을 보세요.
//       개념04 ②번의 것과 무엇이 다릅니까?
//   (3) 왜 그것 때문에 서버가 못 읽습니까?
//
// 답:
//
//
// 기대 결과: 일부러 실패하는 문항입니다. 고치지 마세요.

function Problem12() {
  const [말, set말] = useState("");

  async function 잘못보내기() {
    const 그릇 = new FormData();
    그릇.append("파일", new File(["시험"], "시험.txt", { type: "text/plain" }));

    try {
      const 응답 = await fetch(`${서버주소}/files`, {
        method: "POST",
        body: 그릇,
        headers: { "Content-Type": "multipart/form-data" }, // ★ 이 줄이 문제입니다
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

// ── 화면 ──

export default function Exercise14() {
  return (
    <div>
      <h1>14단원 연습문제</h1>

      <p className="guide">
        <strong>터미널 두 개가 필요합니다.</strong>
        <br />
        ① <code>실습프로젝트</code> → <code>npm run dev</code>
        <br />
        ② <code>실습프로젝트/14단원_서버</code> → <code>node 서버.js</code>
        <br />
        <br />
        <code>TODO</code> 자리에 코드를 쓰고 저장하세요. 화면이 저절로 새로 그려집니다.
        <br />
        <strong>F12 → Console 과 Network</strong> 를 함께 열어 두세요.
        <br />
        <br />
        서버를 껐다 켜면 목록이 처음 셋으로 돌아갑니다. 이름이 겹쳐 막히면 다시 켜세요.
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
          "1~3번은 받아 오기입니다. 상태를 셋으로 나누고, 응답.ok 를 보고, 서버가 보낸 이유를 화면에 쓰는 것까지가 한 묶음입니다.",
          "4~6번은 useForm 입니다. register·handleSubmit 으로 줄이고, mode 로 검사 시점을 정하고, isSubmitting 으로 두 번 누르기를 막습니다.",
          "7~8번은 보내기입니다. method·headers·body 셋을 붙이고, 서버가 막았을 때 setError 로 그 칸에 되돌립니다.",
          "9번과 12번은 파일입니다. FormData 에 담고 Content-Type 은 건드리지 않습니다.",
          "10번은 화면과 서버를 맞추는 문제, 11번은 사라질 때 요청을 끊는 문제입니다.",
          "막히면 개념 파일의 해당 섹션을 보세요. 문제마다 어디인지 적어 두었습니다.",
        ]}
      />
    </div>
  );
}
