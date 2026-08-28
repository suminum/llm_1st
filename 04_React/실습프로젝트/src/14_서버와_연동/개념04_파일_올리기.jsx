// ============================================================
// 14단원 · 개념 04 — 파일 올리기
// ------------------------------------------------------------
// 실행: 터미널 두 개 (npm run dev / node 서버.js)
// ============================================================
//
// 개념03에서 글자를 보냈습니다. 이제 **파일**을 보냅니다.
//
// 현장에서 제일 많이 하는 일입니다. 점검일지 사진, 작업표준서 PDF,
// 자재 대장 엑셀 — 전부 파일로 올라옵니다.
//
// ★ 글자를 보낼 때와 두 가지가 다릅니다.
//
//     JSON 으로 못 보냅니다      파일은 글자가 아닙니다
//     → FormData 를 씁니다      브라우저가 만들어 주는 담는 그릇
//
// ★★ 그리고 **Content-Type 을 직접 쓰면 안 됩니다.** 섹션 3의 그 함정입니다.
//   이건 모르면 절대 못 고칩니다.

import { useState } from "react";
import { useForm } from "react-hook-form";
import Summary from "../_ui/Summary.jsx";
import { 서버주소, 서버안내 } from "./_서버주소.js";

// ── 섹션 1: 파일을 고르는 칸 ──

// `<input type="file" />` 입니다. 다른 입력과 크게 다른 점이 하나 있습니다.
//
//     ★ **값을 코드로 정할 수 없습니다.**
//
// `value="C:/사진.jpg"` 라고 쓸 수 없습니다. 브라우저가 막습니다.
// 그게 되면 웹페이지가 몰래 내 파일을 올릴 수 있으니까요.
//
// 그래서 파일 칸은 언제나 **비제어**입니다. 06단원의 제어 컴포넌트가 안 됩니다.

function Section1Demo() {
  const [고른것, set고른것] = useState(null);

  function 골랐을때(e) {
    const 파일 = e.target.files[0];
    if (!파일) {
      set고른것(null);
      return;
    }
    set고른것({
      이름: 파일.name,
      크기: 파일.size,
      종류: 파일.type || "(모름)",
    });
    console.log("고른 파일 종류:", 파일.type || "(모름)");
  }

  return (
    <div className="demo">
      <h3>① 파일을 고르면 무엇을 알 수 있나</h3>

      <input type="file" onChange={골랐을때} />

      <div className="output">
        {고른것 ? (
          <>
            <div>이름: {고른것.이름}</div>
            <div>크기: {고른것.크기.toLocaleString()} 바이트</div>
            <div>종류: {고른것.종류}</div>
          </>
        ) : (
          "파일을 골라 보세요"
        )}
      </div>
    </div>
  );
}

// ★ `e.target.files` 는 **배열이 아닙니다.** FileList 라는 것입니다.
//   `[0]` 으로 첫 번째를 꺼냅니다. `.map()` 은 안 됩니다.
//   여러 개를 다루려면 `[...e.target.files]` 로 배열로 바꿉니다.
//
// ★★ `파일.type` 은 **브라우저가 확장자를 보고 짐작한 값**입니다.
//   `.txt` 를 `.jpg` 로 이름만 바꾸면 `image/jpeg` 라고 합니다.
//   ★ 그래서 이걸로 안전을 판단하면 안 됩니다. 서버가 진짜로 봐야 합니다.
//
// ★ 파일을 고르고 취소하면 `files[0]` 이 `undefined` 가 됩니다.
//   위 코드의 `if (!파일)` 이 그것을 막습니다. 없으면 그 다음 줄에서 터집니다.

// ✏️ 직접 해보기 1 — 아무 `.txt` 파일의 확장자를 `.jpg` 로 바꾼 뒤 골라 보세요.
//                    `종류` 에 무엇이 나옵니까?

// ── 섹션 2: FormData 로 보냅니다 ──

// JSON 대신 `FormData` 라는 그릇에 담습니다.
//
//     const 그릇 = new FormData();
//     그릇.append("파일", 파일);
//     그릇.append("메모", "8월 점검분");
//
//     await fetch(주소, { method: "POST", body: 그릇 });
//
// ★ 파일과 글자를 **같이** 담을 수 있습니다. 그게 FormData 의 쓸모입니다.

function Section2Demo() {
  const [결과, set결과] = useState("");
  const [보내는중, set보내는중] = useState(false);

  async function 올리기(e) {
    e.preventDefault();
    const 파일 = e.target.파일칸.files[0];

    if (!파일) {
      set결과("파일을 먼저 고르세요");
      return;
    }

    set보내는중(true);
    set결과("");

    try {
      const 그릇 = new FormData();
      그릇.append("파일", 파일);
      그릇.append("메모", e.target.메모칸.value);

      const 응답 = await fetch(`${서버주소}/files`, {
        method: "POST",
        body: 그릇,
        // ★★★ headers 를 안 씁니다. 섹션 3을 보세요.
      });

      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        set결과(`실패 (${응답.status}): ${몸.메시지}`);
        return;
      }

      set결과(
        `올렸습니다\n원래 이름: ${몸.원래이름}\n저장된 이름: ${몸.저장이름}\n` +
          `크기: ${몸.크기} 바이트\n메모: ${몸.메모 || "(없음)"}`,
      );
    } catch {
      set결과(서버안내);
    } finally {
      set보내는중(false);
    }
  }

  return (
    <div className="demo">
      <h3>② 올려 보기</h3>

      <form onSubmit={올리기}>
        <div>
          <input type="file" name="파일칸" />
        </div>
        <div style={{ marginTop: 6 }}>
          메모 <input name="메모칸" placeholder="8월 점검분" />
        </div>
        <button type="submit" disabled={보내는중} style={{ marginTop: 8 }}>
          {보내는중 ? "올리는 중..." : "올리기"}
        </button>
      </form>

      <pre className="output">{결과 || "파일을 고르고 [올리기] 를 누르세요"}</pre>
    </div>
  );
}

// ★★ 서버가 **저장된 이름을 바꿔서** 돌려줍니다.
//
//     원래 이름: 점검일지.txt
//     저장된 이름: 1787124281843_b1scby.txt
//
//   왜 바꾸냐 —
//     · 같은 이름을 올리면 **덮어써집니다**
//     · 이름에 `../` 같은 것을 넣어 엉뚱한 곳에 쓰게 만들 수 있습니다
//
//   ★ 원래 이름은 따로 적어 두고 화면에만 보여 줍니다.
//     이건 서버 쪽 이야기라 PART 3(백엔드 09단원)에서 자세히 합니다.

// ✏️ 직접 해보기 2 — 파일을 안 고르고 [올리기] 를 눌러 보세요. 무엇이 나옵니까?
//                    그 다음 서버 터미널을 보세요. 요청이 갔습니까?

// ── 섹션 3: ★★★ Content-Type 을 쓰면 안 됩니다 ──

// 개념03에서는 이렇게 썼습니다.
//
//     headers: { "Content-Type": "application/json" }
//
// 그래서 파일도 이렇게 쓰고 싶어집니다.
//
//     headers: { "Content-Type": "multipart/form-data" }   ← ★ 이러면 깨집니다

function Section3Demo() {
  const [결과, set결과] = useState("");

  async function 해보기(헤더를쓸까) {
    set결과("보내는 중...");

    const 그릇 = new FormData();
    그릇.append(
      "파일",
      new File(["점검 결과: 이상 없음"], "시험.txt", { type: "text/plain" }),
    );
    그릇.append("메모", "헤더 시험");

    const 옵션 = { method: "POST", body: 그릇 };
    if (헤더를쓸까) {
      옵션.headers = { "Content-Type": "multipart/form-data" };
    }

    try {
      const 응답 = await fetch(`${서버주소}/files`, 옵션);
      const 몸 = await 응답.json().catch(() => ({}));
      set결과(`${응답.status} ${JSON.stringify(몸)}`);
      console.log(헤더를쓸까 ? "헤더 씀:" : "헤더 안 씀:", 응답.status);
    } catch {
      set결과(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>③ 헤더를 쓰면 어떻게 되나</h3>

      <button onClick={() => 해보기(false)}>헤더 없이 (맞는 방법)</button>{" "}
      <button onClick={() => 해보기(true)}>Content-Type 을 직접 쓰기</button>

      <pre className="output">{결과 || "두 버튼을 차례로 눌러 보세요"}</pre>
    </div>
  );
}

// ★★★ 왜 깨지나
//
//   multipart 는 조각을 나누는 **경계 글자**가 필요합니다.
//
//     Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryAbC123
//                                        └──────── 이 부분 ────────┘
//
//   이 경계 글자는 **브라우저가 매번 새로 만듭니다.** 그리고 본문 안에도 넣습니다.
//   내가 헤더를 직접 쓰면 그 `boundary=` 가 **빠집니다.**
//   서버는 어디서 조각이 나뉘는지 몰라 본문을 못 읽습니다.
//
// ★★ 그래서 규칙은 —
//
//     JSON 을 보낼 때   →  Content-Type 을 **직접 씁니다**
//     FormData 를 보낼 때 →  ★ **아무것도 쓰지 않습니다**
//
//   `body` 가 FormData 면 브라우저가 알아서 붙여 줍니다. 건드리지 마세요.
//
// ★ 이건 "몰라서 안 쓴 것" 과 "알고 안 쓴 것" 이 결과가 같아서
//   모르고 지나가기 쉽습니다. 그러다 한 번 쓰면 반나절을 잃습니다.

// ✏️ 직접 해보기 3 — 두 버튼의 결과를 비교하고, F12 → Network 에서
//                    두 요청의 Request Headers 의 Content-Type 을 각각 보세요.
//                    `boundary=` 가 어느 쪽에 있습니까?

// ── 섹션 4: useForm 과 같이 쓰기 ──

// 개념02의 `useForm` 으로 파일 칸도 다룰 수 있습니다.

function Section4Demo() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { 메모: "" } });

  const [결과, set결과] = useState("");

  async function 올리기(값들) {
    // ★ 파일은 FileList 로 옵니다. [0] 으로 꺼냅니다.
    const 파일 = 값들.파일[0];

    set결과("");
    try {
      const 그릇 = new FormData();
      그릇.append("파일", 파일);
      그릇.append("메모", 값들.메모);

      const 응답 = await fetch(`${서버주소}/files`, { method: "POST", body: 그릇 });
      const 몸 = await 응답.json().catch(() => ({}));

      if (!응답.ok) {
        set결과(`실패 (${응답.status}): ${몸.메시지}`);
        return;
      }
      set결과(`올렸습니다: ${몸.원래이름} (${몸.크기} 바이트)`);
      reset();
    } catch {
      set결과(서버안내);
    }
  }

  return (
    <div className="demo">
      <h3>④ useForm 으로 (크기 검사까지)</h3>

      <form onSubmit={handleSubmit(올리기)}>
        <div>
          <input
            type="file"
            {...register("파일", {
              required: "파일을 골라야 합니다",
              validate: {
                크기: (목록) =>
                  !목록?.[0] ||
                  목록[0].size <= 2 * 1024 * 1024 ||
                  "2MB 까지만 됩니다",
              },
            })}
          />
          {errors.파일 && <div style={{ color: "#d9534f" }}>{errors.파일.message}</div>}
        </div>

        <div style={{ marginTop: 6 }}>
          메모 <input {...register("메모")} placeholder="8월 점검분" />
        </div>

        <button type="submit" disabled={isSubmitting} style={{ marginTop: 8 }}>
          {isSubmitting ? "올리는 중..." : "올리기"}
        </button>
      </form>

      <div className="output">{결과 || "파일을 고르고 눌러 보세요"}</div>
    </div>
  );
}

// ★ `register("파일")` 이 돌려주는 값은 **FileList** 입니다. 파일 하나가 아닙니다.
//   그래서 `값들.파일[0]` 로 꺼내고, 검증에서도 `목록[0]` 을 봅니다.
//
// ★★ 화면에서 크기를 검사해도 **서버가 또 검사합니다.**
//   서버도 2MB 를 넘으면 `413` 을 보냅니다. 개념03 섹션3과 같은 이야기입니다.
//   ★ 화면 검사는 사용자를 위한 것(요청을 아예 안 보냄),
//     서버 검사는 서버를 위한 것(디스크가 차는 것을 막음)입니다.

// ✏️ 직접 해보기 4 — 2MB 가 넘는 파일(사진 등)을 골라 보세요.
//                    요청이 갑니까? Network 를 확인하세요.

// ✏️ 직접 해보기 5 — `validate` 를 통째로 지우고 2MB 넘는 파일을 올려 보세요.
//                    이번에는 무엇이 나옵니까? 확인했으면 되돌려 두세요.

// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] FormData 에 Content-Type 을 직접 씀 ★★ 섹션 3
//   제일 아픕니다. 원인을 짐작조차 못 합니다.

// [실수 2] `files[0]` 이 없을 수 있다는 것을 잊음
//   파일을 골랐다 취소하면 `undefined` 입니다. 그 다음 줄에서 터집니다.

// [실수 3] `files` 를 배열로 봄
//   `e.target.files.map(...)` → map is not a function
//   `[...e.target.files]` 로 바꾸세요.

// [실수 4] `파일.type` 을 믿음
//   확장자만 바꾸면 따라 바뀝니다. 안전 판단에 쓰면 안 됩니다. (섹션 1)

// [실수 5] 올리는 중에 버튼을 안 잠금
//   큰 파일은 몇 초씩 걸립니다. 두 번 누르면 두 번 올라갑니다.

// [실수 6] 서버 쪽 크기 제한을 안 둠
//   화면에서만 막으면 누군가 그냥 큰 파일을 올려 디스크를 채웁니다. (섹션 4)

// ── 화면 ──

export default function Concept04Upload() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 04 — 파일 올리기</h1>

      <p className="guide">
        <strong>서버를 켜야 합니다.</strong>
        <code>실습프로젝트/14단원_서버</code> 에서 <code>node 서버.js</code>
        <br />
        <br />
        올린 파일은 <code>14단원_서버/올라온파일/</code> 에 쌓입니다.
        연습이 끝나면 그 폴더를 지워도 됩니다.
        <br />
        <br />
        <strong>③번을 꼭 눌러 보세요.</strong> 모르면 절대 못 고치는 함정입니다.
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
          "파일 칸은 value 를 코드로 정할 수 없습니다. 언제나 비제어입니다. e.target.files[0] 로 꺼냅니다.",
          "files 는 배열이 아니라 FileList 입니다. map 을 쓰려면 [...files] 로 바꿉니다. 고르고 취소하면 undefined 가 되니 확인이 필요합니다.",
          "파일.type 은 브라우저가 확장자를 보고 짐작한 값입니다. 확장자만 바꿔도 따라 바뀌므로 안전 판단에 쓰면 안 됩니다.",
          "파일은 FormData 에 담아 보냅니다. append 로 파일과 글자를 같이 담을 수 있습니다.",
          "★★ FormData 를 보낼 때 Content-Type 을 직접 쓰면 깨집니다. boundary 가 빠지기 때문입니다. 브라우저가 붙이게 두세요. JSON 일 때만 직접 씁니다.",
          "useForm 으로도 됩니다. register 가 돌려주는 값이 FileList 라서 [0] 으로 꺼냅니다. validate 로 크기를 검사할 수 있습니다.",
          "서버가 저장 이름을 바꿔서 돌려줍니다. 원래 이름을 그대로 쓰면 덮어쓰기와 경로 조작이 생깁니다. 크기 제한도 서버에 꼭 둡니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) `.txt` 를 `.jpg` 로 바꾸고 고르면 —
//    화면: 종류: image/jpeg
//    // 콘솔: 고른 파일 종류: image/jpeg
//    → 내용은 그대로 글자인데 `image/jpeg` 라고 합니다.
//      ★ 브라우저는 **확장자만 보고** 정합니다. 파일 안을 열어 보지 않습니다.
//        그래서 "이미지만 받는다" 를 이 값으로 막으면 뚫립니다.
//        진짜로 막으려면 서버가 파일 앞부분의 표식을 봐야 합니다. (PART 3)
//
// 2) 화면: "파일을 먼저 고르세요"
//    서버 터미널: ★ 아무것도 안 찍힙니다. **요청이 안 갔습니다.**
//    → `if (!파일) return` 이 먼저 막았기 때문입니다.
//      ★ 이 확인을 빼면 `그릇.append("파일", undefined)` 가 되어
//        서버가 "파일이 안 왔습니다" 로 400 을 보냅니다. 그것도 동작은 합니다.
//        다만 쓸데없는 왕복이 한 번 생깁니다.
//
// 3) 헤더 없이 → 201, 잘 올라갑니다.
//    Content-Type 을 직접 쓰면 → 400 {"메시지":"multipart/form-data 가 아닙니다"}
//
//    Network 의 Request Headers 를 보면 —
//      헤더 없이:  multipart/form-data; boundary=----WebKitFormBoundary…
//      직접 쓰면:  multipart/form-data          ← ★ boundary 가 없습니다
//
//    → 서버는 경계를 몰라 본문을 조각으로 나눌 수조차 없습니다.
//      그래서 "파일이 안 왔다" 보다 앞선 단계에서 걸러집니다.
//      (서버가 "파일이 안 왔습니다" 를 주는 것은 boundary 는 멀쩡한데
//       파일 칸만 비었을 때입니다 — 위 2번이 그 경우입니다)
//    ★★ 이 메시지가 헷갈리는 이유 —
//      나는 분명히 Content-Type 에 multipart/form-data 라고 썼는데
//      서버는 "multipart/form-data 가 아니다" 라고 합니다.
//      빠진 것은 그 뒤에 브라우저가 붙여 줬어야 할 boundary=... 입니다.
//      원인은 헤더 한 줄입니다. 이래서 무서운 함정입니다.
//
// 4) 2MB 넘는 파일을 고르면 —
//    화면: "2MB 까지만 됩니다"
//    Network: ★ 요청이 **안 갑니다.**
//    → `validate` 가 handleSubmit 단계에서 막았습니다.
//      큰 파일을 올리다 거절당하는 것보다 훨씬 낫습니다. 시간과 데이터를 아낍니다.
//
// 5) `validate` 를 지우고 올리면 —
//    화면: 실패 (413): 파일이 너무 큽니다 (2MB 까지)
//    Network: 요청이 **갑니다.** 파일을 다 올린 뒤에 거절당합니다.
//    → ★ 서버도 막고 있다는 뜻입니다. 화면 검사가 없어도 안전은 합니다.
//      다만 사용자는 다 올리고 나서 거절당합니다. 느린 인터넷이면 몇 분입니다.
//    ★★ 그래서 **둘 다** 둡니다. 화면은 빠르라고, 서버는 안전하라고.
//      확인했으면 validate 를 되돌려 두세요.
