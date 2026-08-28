// ============================================================
// 14단원 · 개념 02 — 폼을 useForm 으로
// ------------------------------------------------------------
// 실행: npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       이 파일은 **서버가 없어도** 됩니다. 보내는 것은 개념03부터입니다.
// ============================================================
//
// 06단원에서 폼을 만들었습니다. 이렇게요.
//
//     const [이름, set이름] = useState("");
//     <input value={이름} onChange={(e) => set이름(e.target.value)} />
//
// 이것을 **제어 컴포넌트**라고 불렀습니다. 잘 됩니다.
// 그런데 입력칸이 늘어나면 이렇게 됩니다.
//
//     const [이름, set이름] = useState("");
//     const [상태, set상태] = useState("가동");
//     const [담당, set담당] = useState("");
//     const [메모, set메모] = useState("");
//     … 그리고 검증 오류를 담을 state 가 또 그만큼
//
// ★ 06단원 개념02에서 객체 하나로 묶는 법을 배웠습니다. 그걸로 절반은 해결됩니다.
//   그런데 **검증**이 남습니다. "이름은 꼭 넣어야 한다", "두 글자 이상이어야 한다" —
//   이걸 손으로 다 짜면 폼 하나에 100줄이 넘어갑니다.
//
// ★★ 그래서 실무에서는 폼 라이브러리를 씁니다. 제일 많이 쓰는 것이
//   **react-hook-form** 이고, 그 핵심이 `useForm` 입니다.
//
// ★★★ 이 단원의 목표는 "라이브러리를 외우는 것" 이 아닙니다.
//   **무엇이 줄어드는지**와 **무엇을 잃는지**를 보는 것입니다. 섹션 5가 그것입니다.

import { useState } from "react";
import { useForm } from "react-hook-form";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: 손으로 만들면 이렇습니다 ──

// 비교하려고 06단원 방식으로 똑같은 폼을 먼저 만듭니다.

function Section1Demo() {
  const [값들, set값들] = useState({ 이름: "", 담당: "" });
  const [오류들, set오류들] = useState({});
  const [결과, set결과] = useState("");

  function 바뀌면(e) {
    set값들({ ...값들, [e.target.name]: e.target.value });
  }

  function 보내기(e) {
    e.preventDefault();

    // 검증을 손으로 합니다
    const 새오류 = {};
    if (!값들.이름.trim()) 새오류.이름 = "이름은 꼭 넣어야 합니다";
    else if (값들.이름.trim().length < 2) 새오류.이름 = "두 글자 이상 넣으세요";
    if (값들.담당 && 값들.담당.length > 10) 새오류.담당 = "10자까지만 됩니다";

    set오류들(새오류);
    if (Object.keys(새오류).length > 0) return;

    set결과(JSON.stringify(값들));
    console.log("손으로 만든 폼:", JSON.stringify(값들));
  }

  return (
    <div className="demo">
      <h3>① 06단원 방식 (손으로)</h3>

      <form onSubmit={보내기}>
        <div>
          이름{" "}
          <input name="이름" value={값들.이름} onChange={바뀌면} placeholder="3호 프레스" />
          {오류들.이름 && <span style={{ color: "#d9534f" }}> {오류들.이름}</span>}
        </div>
        <div style={{ marginTop: 6 }}>
          담당{" "}
          <input name="담당" value={값들.담당} onChange={바뀌면} placeholder="김철수" />
          {오류들.담당 && <span style={{ color: "#d9534f" }}> {오류들.담당}</span>}
        </div>
        <button type="submit" style={{ marginTop: 8 }}>
          보내기
        </button>
      </form>

      <div className="output">{결과 || "아직 안 보냈습니다"}</div>
    </div>
  );
}

// ★ 입력이 둘뿐인데도 state 가 셋(값들·오류들·결과)이고, 검증이 다섯 줄입니다.
//   입력이 여섯 개가 되면 검증만 스무 줄이 됩니다.
//
// ★★ 그리고 빠진 것이 많습니다.
//   · 보내는 중에 버튼을 잠그기
//   · 칸을 벗어날 때(blur)만 검사하기
//   · 처음부터 빨갛게 뜨지 않게 하기
//   전부 state 를 더 만들어야 합니다.

// ✏️ 직접 해보기 1 — 위 폼에 `메모` 칸을 하나 더 넣어 보세요.
//                    몇 군데를 고쳐야 합니까? 세어 보세요.

// ── 섹션 2: useForm 으로 바꿉니다 ──

function Section2Demo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { 이름: "", 담당: "" },
  });

  const [결과, set결과] = useState("");

  function 보내기(값들) {
    set결과(JSON.stringify(값들));
    console.log("useForm:", JSON.stringify(값들));
  }

  return (
    <div className="demo">
      <h3>② useForm 으로</h3>

      <form onSubmit={handleSubmit(보내기)}>
        <div>
          이름{" "}
          <input
            {...register("이름", {
              required: "이름은 꼭 넣어야 합니다",
              minLength: { value: 2, message: "두 글자 이상 넣으세요" },
            })}
            placeholder="3호 프레스"
          />
          {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        </div>
        <div style={{ marginTop: 6 }}>
          담당{" "}
          <input
            {...register("담당", {
              maxLength: { value: 10, message: "10자까지만 됩니다" },
            })}
            placeholder="김철수"
          />
          {errors.담당 && <span style={{ color: "#d9534f" }}> {errors.담당.message}</span>}
        </div>
        <button type="submit" style={{ marginTop: 8 }}>
          보내기
        </button>
      </form>

      <div className="output">{결과 || "아직 안 보냈습니다"}</div>
    </div>
  );
}

// ★★★ 세 가지가 사라졌습니다.
//
//   · `useState` 가 없습니다        → useForm 이 값을 들고 있습니다
//   · `onChange` 가 없습니다        → register 가 붙여 줍니다
//   · `e.preventDefault()` 가 없습니다 → handleSubmit 이 해 줍니다
//
// ★ `{...register("이름")}` 는 **펼치기(스프레드)** 입니다. (JS자료 09단원)
//   register 가 돌려주는 `{ name, onChange, onBlur, ref }` 를 input 에 한 번에 붙입니다.
//   직접 찍어 보면 무엇이 들어 있는지 보입니다. (✏️2)
//
// ★★ `handleSubmit(보내기)` 는 **검증을 통과했을 때만** `보내기` 를 부릅니다.
//   못 통과하면 `errors` 를 채우고 끝냅니다. 그래서 `보내기` 안에서
//   "값이 비었나" 를 다시 볼 필요가 없습니다.

// ✏️ 직접 해보기 2 — `console.log(register("이름"))` 를 컴포넌트 안에 넣고
//                    무엇이 들어 있는지 콘솔에서 펼쳐 보세요.

// ✏️ 직접 해보기 3 — 이름을 비운 채 [보내기] 를 눌러 보세요.
//                    그 다음 한 글자만 넣고 눌러 보세요. 메시지가 바뀝니까?

// ── 섹션 3: 검증 규칙 ──

// `register` 의 두 번째 인자에 규칙을 적습니다. 자주 쓰는 것들입니다.

function Section3Demo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur", // ★ 칸을 벗어날 때 검사합니다
    defaultValues: { 이름: "", 개수: "", 메일: "" },
  });

  const [결과, set결과] = useState("");

  return (
    <div className="demo">
      <h3>③ 검증 규칙</h3>

      <form onSubmit={handleSubmit((값) => set결과(JSON.stringify(값)))}>
        <div>
          이름{" "}
          <input
            {...register("이름", {
              required: "꼭 넣어야 합니다",
              pattern: {
                value: /^[0-9]+호 .+$/,
                message: "'3호 프레스' 처럼 적으세요",
              },
            })}
            placeholder="3호 프레스"
          />
          {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
        </div>

        <div style={{ marginTop: 6 }}>
          개수{" "}
          <input
            type="number"
            {...register("개수", {
              required: "꼭 넣어야 합니다",
              min: { value: 1, message: "1 이상" },
              max: { value: 99, message: "99 이하" },
              valueAsNumber: true, // ★ 숫자로 바꿔 줍니다
            })}
          />
          {errors.개수 && <span style={{ color: "#d9534f" }}> {errors.개수.message}</span>}
        </div>

        <div style={{ marginTop: 6 }}>
          메일{" "}
          <input
            {...register("메일", {
              validate: (값) =>
                값 === "" || 값.includes("@") || "@ 가 있어야 합니다",
            })}
            placeholder="비워도 됩니다"
          />
          {errors.메일 && <span style={{ color: "#d9534f" }}> {errors.메일.message}</span>}
        </div>

        <button type="submit" style={{ marginTop: 8 }}>
          보내기
        </button>
      </form>

      <div className="output">{결과 || "아직 안 보냈습니다"}</div>
    </div>
  );
}

// ★ 규칙 정리
//
//     required   비면 안 됨
//     minLength  / maxLength   글자 수
//     min / max                숫자 크기 (type="number" 와 같이)
//     pattern                  정규식
//     validate                 ★ 내가 직접 판단. true 면 통과, 글자면 그게 오류 메시지
//
// ★★ `valueAsNumber: true` 를 안 붙이면 **글자로 옵니다.**
//   `type="number"` 를 써도 그렇습니다. HTML 입력은 언제나 글자입니다.
//   `개수 + 1` 이 `"5" + 1` = `"51"` 이 되는 그 함정입니다. (JS자료 01단원)
//
// ★★★ `mode: "onBlur"` 가 없으면 **보낼 때만** 검사합니다.
//   그러면 사용자가 다 채우고 누른 뒤에야 빨간 글씨를 봅니다.
//   `"onBlur"` 는 칸을 벗어날 때, `"onChange"` 는 글자마다 검사합니다.
//   ★ `"onChange"` 는 한 글자 칠 때마다 빨개져서 거슬립니다. 보통 `"onBlur"` 가 낫습니다.

// ✏️ 직접 해보기 4 — 개수에 `5` 를 넣고 보내서 결과가 `"개수":5` 인지 `"개수":"5"` 인지 보세요.
//                    그 다음 `valueAsNumber: true` 를 지우고 다시 해 보세요.

// ✏️ 직접 해보기 5 — `mode: "onBlur"` 를 `"onChange"` 로 바꾸고 이름 칸에 타자를 쳐 보세요.
//                    느낌이 어떻게 다릅니까? 확인했으면 되돌려 두세요.

// ── 섹션 4: 폼의 지금 상태를 봅니다 ──

function Section4Demo() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting, submitCount },
  } = useForm({
    mode: "onChange",
    defaultValues: { 이름: "" },
  });

  const [결과, set결과] = useState("");

  async function 보내기(값들) {
    // 보내는 데 걸리는 시간을 흉내 냅니다
    await new Promise((풀기) => setTimeout(풀기, 800));
    set결과(`보냈습니다: ${값들.이름}`);
    reset(); // ★ 성공하면 폼을 비웁니다
  }

  return (
    <div className="demo">
      <h3>④ 폼의 상태</h3>

      <form onSubmit={handleSubmit(보내기)}>
        <input
          {...register("이름", { required: "꼭 넣어야 합니다" })}
          placeholder="아무거나"
        />
        <button type="submit" disabled={isSubmitting || !isValid} style={{ marginLeft: 6 }}>
          {isSubmitting ? "보내는 중..." : "보내기"}
        </button>
        {errors.이름 && <span style={{ color: "#d9534f" }}> {errors.이름.message}</span>}
      </form>

      <div className="output">
        <div>isDirty (건드렸나): {String(isDirty)}</div>
        <div>isValid (다 맞나): {String(isValid)}</div>
        <div>isSubmitting (보내는 중): {String(isSubmitting)}</div>
        <div>submitCount (보낸 횟수): {submitCount}</div>
        <div style={{ marginTop: 6 }}>{결과}</div>
      </div>
    </div>
  );
}

// ★★★ `isSubmitting` 이 이 단원에서 제일 쓸모 있습니다.
//
//     <button disabled={isSubmitting}>
//
//   이 한 줄이 **두 번 누르기**를 막습니다.
//   서버가 느릴 때 사용자는 반드시 두 번 누릅니다. 그러면 두 개가 저장됩니다.
//   ★ 06단원 방식으로 하려면 `보내는중` state 를 따로 만들어야 했습니다.
//
// ★★ `isValid` 로 버튼을 잠그는 것은 **취향입니다.**
//   잠그면 깔끔하지만, 왜 못 누르는지 모르는 사용자가 생깁니다.
//   잠그지 않고 누르게 한 뒤 빨간 글씨를 보여 주는 쪽이 친절할 때도 많습니다.
//
// ★ `isValid` 는 `mode` 가 `"onChange"` 나 `"onBlur"` 일 때만 제때 갱신됩니다.
//   기본값(`"onSubmit"`)이면 처음에 계속 `false` 입니다. 위에서 `"onChange"` 를 쓴 이유입니다.

// ✏️ 직접 해보기 6 — 아무것도 안 치고 isDirty 를 보세요. 한 글자 치면 어떻게 됩니까?
//                    그 글자를 지우면 다시 false 가 됩니까?

// ✏️ 직접 해보기 7 — `disabled={isSubmitting || !isValid}` 에서 `|| !isValid` 를 빼고
//                    빈 채로 [보내기] 를 눌러 보세요. 무엇이 다릅니까?

// ── 섹션 5: ★★ 무엇을 잃는가 ──

// useForm 은 공짜가 아닙니다. **제어 컴포넌트를 포기**합니다.

function Section5Demo() {
  const { register, watch } = useForm({ defaultValues: { 이름: "" } });
  const [그린횟수, set그린횟수] = useState(0);
  const [보는중, set보는중] = useState(false);

  // 이 컴포넌트가 몇 번 그려지는지 세어 봅니다
  const 보고있는값 = 보는중 ? watch("이름") : null;

  return (
    <div className="demo">
      <h3>⑤ 타자를 쳐도 다시 안 그려집니다</h3>

      <div>
        <input {...register("이름")} placeholder="여기에 타자를 쳐 보세요" />
      </div>

      <div style={{ marginTop: 6 }}>
        <label>
          <input
            type="checkbox"
            checked={보는중}
            onChange={(e) => set보는중(e.target.checked)}
          />{" "}
          watch 로 값을 보기
        </label>{" "}
        <button onClick={() => set그린횟수(그린횟수 + 1)}>일부러 다시 그리기</button>
      </div>

      <div className="output">
        <div>버튼으로 다시 그린 횟수: {그린횟수}</div>
        <div>watch 로 본 값: {보고있는값 === null ? "(안 보는 중)" : 보고있는값}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
          체크를 끈 채 타자를 치면 위 값이 안 바뀝니다. 켜면 바뀝니다.
        </div>
      </div>
    </div>
  );
}

// ★★★ 무슨 일이 벌어지나
//
//   06단원 방식은 **한 글자 칠 때마다** state 가 바뀌고 컴포넌트가 다시 그려졌습니다.
//   useForm 은 값을 React state 밖(ref)에 들고 있어서 **다시 안 그립니다.**
//
//   · 좋은 점 — 입력이 많아도 빠릅니다. 칸 하나 칠 때 다른 칸이 안 그려집니다.
//   · 잃는 것 — **값이 바뀔 때마다 뭘 하는 것**이 그냥은 안 됩니다.
//
//   "글자 수를 세서 옆에 보여 준다" 같은 것을 하려면 `watch` 를 써야 하고,
//   `watch` 를 쓰는 순간 그 값 때문에 다시 그려집니다. 이득이 줄어듭니다.
//
// ★★ 그래서 이렇게 고릅니다.
//
//     칸이 적고 값에 따라 화면이 계속 바뀐다   → 06단원 방식 (제어)
//     칸이 많고 검증이 복잡하다                → useForm
//
//   ★ "무조건 useForm" 이 아닙니다. 검색창 하나에 useForm 을 쓰면 오히려 번거롭습니다.

// ✏️ 직접 해보기 8 — 체크를 끈 채로 타자를 치고, 켠 뒤에 다시 쳐 보세요.
//                    "watch 로 본 값" 이 언제 따라옵니까?

// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] `{...register("이름")}` 의 점 세 개를 빼먹음
//   <input register("이름") /> 는 아예 문법 오류입니다.
//   <input {...register("이름")} /> 처럼 펼쳐서 붙여야 합니다.

// [실수 2] `handleSubmit` 을 안 감쌈
//   <form onSubmit={보내기}>  ← 검증을 건너뜁니다. 그리고 페이지가 새로고침됩니다.
//   <form onSubmit={handleSubmit(보내기)}>  ← 이렇게

// [실수 3] `value` 와 `onChange` 를 같이 붙임
//   <input value={이름} {...register("이름")} />
//   → 제어와 비제어를 섞은 것입니다. React 가 경고를 냅니다.
//     useForm 을 쓰면 value·onChange 는 붙이지 않습니다.

// [실수 4] `valueAsNumber` 를 안 붙이고 숫자로 씀 (섹션 3)

// [실수 5] `mode` 를 안 정하고 `isValid` 를 씀
//   기본값은 보낼 때만 검사라서 `isValid` 가 계속 false 입니다.
//   버튼이 영영 안 눌립니다. (섹션 4)

// [실수 6] 오류 메시지를 안 보여 줌
//   `errors.이름` 을 화면에 안 그리면, 사용자는 버튼을 눌러도 아무 일이 없다고 느낍니다.
//   ★ 검증만 하고 알려 주지 않는 것이 제일 나쁩니다.

// ── 화면 ──

export default function Concept02UseForm() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 02 — 폼을 useForm 으로</h1>

      <p className="guide">
        <strong>이 파일은 서버가 없어도 됩니다.</strong> 값을 화면에 찍기만 합니다.
        서버로 보내는 것은 개념03입니다.
        <br />
        <br />
        <code>react-hook-form</code> 은 <strong>이미 설치돼 있습니다.</strong>
        새 프로젝트에서 쓰려면 <code>npm i react-hook-form</code> 을 하세요.
        <br />
        <br />
        <strong>①과 ②를 나란히 보세요.</strong> 같은 폼을 두 방식으로 만든 것입니다.
      </p>

      <button onClick={() => setRestartKey(restartKey + 1)}>
        이 예제를 처음부터 다시 그리기
      </button>

      <div key={restartKey}>
        <Section1Demo />
        <Section2Demo />
        <Section3Demo />
        <Section4Demo />
        <Section5Demo />
      </div>

      <Summary
        items={[
          "06단원 방식은 입력마다 state 와 검증 코드를 손으로 만듭니다. 칸이 늘면 빠르게 길어집니다.",
          "useForm 을 쓰면 useState·onChange·preventDefault 가 사라집니다. register 가 input 에 필요한 것을 붙여 주고, handleSubmit 이 검증 후에만 함수를 부릅니다.",
          "검증은 register 의 두 번째 인자에 적습니다 — required, minLength, min/max, pattern, validate. 메시지를 같이 적으면 그게 errors 에 담깁니다.",
          "숫자 칸에는 valueAsNumber 를 붙입니다. 안 붙이면 글자로 옵니다. type=number 를 써도 그렇습니다.",
          "mode 를 onBlur 나 onChange 로 정해야 제때 검사합니다. 기본값은 보낼 때만 검사라서 isValid 가 계속 false 입니다.",
          "★ isSubmitting 으로 버튼을 잠급니다. 서버가 느릴 때 사용자는 반드시 두 번 누릅니다.",
          "★ useForm 은 타자를 쳐도 다시 안 그립니다. 그래서 빠른 대신, 값이 바뀔 때마다 뭘 하려면 watch 가 필요하고 그만큼 이득이 줄어듭니다. 칸이 적으면 06단원 방식이 낫습니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) `메모` 칸 하나를 넣으려면 —
//
//      · defaultValues 에 메모: "" 를 추가          (1곳)
//      · <input name="메모" value={값들.메모} … />  (1곳)
//      · 검증이 필요하면 보내기 안에 if 한 줄       (1곳)
//      · 오류를 보여 줄 <span>                      (1곳)
//
//    → 네 곳입니다. ②번(useForm)에서는 <input {...register("메모")} /> 한 줄이면 됩니다.
//      ★ 칸이 여섯 개면 이 차이가 스물네 곳 대 여섯 줄이 됩니다.
//
// 2) console.log(register("이름")) 를 넣으면 —
//    // 콘솔: { name: '이름', onChange: f, onBlur: f, ref: f, … }
//    → input 이 필요로 하는 것을 한 덩어리로 돌려줍니다.
//      `{...}` 로 펼쳐서 붙이는 이유가 이것입니다. 하나씩 쓰면 네 줄이 됩니다.
//      ★ `ref` 가 있는 것에 주목하세요. 10단원의 그 ref 입니다.
//        값을 state 가 아니라 DOM 에서 직접 읽기 때문에 다시 안 그리는 것입니다. (섹션 5)
//
// 3) 화면: 비우고 누르면 "이름은 꼭 넣어야 합니다"
//          한 글자만 넣고 누르면 "두 글자 이상 넣으세요"
//    → 규칙이 순서대로 검사되고 **먼저 걸린 것 하나만** 보여 줍니다.
//      required 를 통과해야 minLength 를 봅니다.
//
// 4) valueAsNumber 가 있으면 —
//    // 콘솔: {"이름":"3호 프레스","개수":5,"메일":""}
//    지우면 —
//    // 콘솔: {"이름":"3호 프레스","개수":"5","메일":""}
//    → 따옴표가 생깁니다. 이대로 서버에 보내면 서버가 글자를 받습니다.
//      ★ `개수 + 1` 을 하면 `"51"` 이 됩니다. 조용히 틀리는 종류의 버그입니다.
//      확인했으면 valueAsNumber 를 되돌려 두세요.
//
// 5) "onChange" 로 바꾸면 한 글자 칠 때마다 빨간 글씨가 나타났다 사라집니다.
//    → 첫 글자를 치는 순간 "'3호 프레스' 처럼 적으세요" 가 뜹니다.
//      아직 다 안 쳤는데 틀렸다고 하니 거슬립니다.
//    ★ 그래서 보통 "onBlur" 를 씁니다. 다 치고 칸을 벗어날 때 봐 주는 것입니다.
//      다만 비밀번호 강도처럼 **치면서 알려 주는 게 나은 것**도 있습니다. 경우에 따라 고르세요.
//      확인했으면 "onBlur" 로 되돌려 두세요.
//
// 6) 아무것도 안 쳤을 때 isDirty 는 false 입니다.
//    한 글자 치면 true 가 됩니다.
//    ★ 그 글자를 지우면 **다시 false** 가 됩니다.
//    → "건드렸나" 가 아니라 **"처음 값과 다른가"** 입니다.
//      그래서 "안 바뀌었으면 저장 버튼을 잠근다" 에 쓸 수 있습니다.
//
// 7) `|| !isValid` 를 빼면 빈 채로도 버튼이 눌립니다.
//    화면: 눌러도 안 보내지고 "꼭 넣어야 합니다" 가 뜹니다.
//    → handleSubmit 이 막아 주기 때문에 **안전은 합니다.**
//      다만 사용자는 "눌렀는데 왜 안 되지" 를 한 번 겪습니다.
//    ★ 잠그느냐 마느냐는 취향입니다. 다만 **왜 못 누르는지 보여 주는 것**이 중요합니다.
//
// 8) 체크를 끈 채로 타자를 치면 "watch 로 본 값" 이 안 바뀝니다.
//    (그 자리에는 "(안 보는 중)" 이 있습니다)
//    체크를 켜면 그때부터 타자마다 따라옵니다.
//    → ★ watch 를 쓰는 순간 그 컴포넌트가 타자마다 다시 그려집니다.
//      useForm 의 "안 그린다" 는 이득이 그만큼 없어집니다.
//      필요한 곳에서만, 될 수 있으면 **작은 컴포넌트 안에서만** 쓰세요.
