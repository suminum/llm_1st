// ============================================================
// 08단원 · 개념 05 — styled-components
// ------------------------------------------------------------
// 실행: 실습프로젝트에서 npm run dev → 왼쪽 목록에서 이 예제를 고르세요.
//       F12 → Console 도 함께 보세요.
// ============================================================
//
// 개념04에서 CSS 를 넣는 방법 두 가지를 봤습니다.
//
//     전역 CSS       import "./파일.css"        이름이 겹치면 조용히 덮입니다
//     CSS Modules    import styles from ...     Vite 가 이름을 새로 지어 줍니다
//
// 여기서는 세 번째 방법을 봅니다. **styled-components** 입니다.
//
// ★ 앞의 둘과 생각이 다릅니다.
//   앞의 둘은 "CSS 파일을 따로 두고 이름으로 잇는" 방식입니다.
//   styled-components 는 **CSS 를 컴포넌트로 만듭니다.** 파일을 따로 안 둡니다.
//
// ★★ 셋 중 뭐가 맞는지는 섹션 4에서 정리합니다.
//   지금은 "이런 것도 있다" 가 아니라 **무엇이 달라지는가**를 보세요.
//   특히 섹션 2(props)는 앞의 둘로는 못 하던 것입니다.
//
// ★ 콘솔에 같은 줄이 두 번씩 찍힙니다. 정상입니다(09단원 개념02에서 배우는 StrictMode 때문입니다).
//
// ★★ 이 파일은 **일부러 경고를 냅니다.** 섹션 5에서 잘못된 코드를 돌리기 때문입니다.
//   콘솔에 노란 줄이 보이면 고장이 아니라 그 실습입니다.

// 검증: 경고허용 has been created dynamically
//   ↑ 섹션 5에서 **일부러** 잘못된 코드를 돌립니다. 그때 나는 경고를 미리 적어 둔 것입니다.
//     검증 도구는 여기 적힌 경고가 진짜로 나는지까지 확인합니다.

import { useState } from "react";
import styled from "styled-components";
import Summary from "../_ui/Summary.jsx";

// ── 섹션 1: CSS 를 컴포넌트로 만듭니다 ──

// 아래 한 덩어리가 **컴포넌트 하나**입니다.
// `styled.button` 뒤에 백틱을 붙이고 그 안에 CSS 를 그대로 씁니다.

const 담기버튼 = styled.button`
  background: #2d6cdf;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
`;

// ★ 이제 `<담기버튼>담기</담기버튼>` 처럼 씁니다. className 이 없습니다.
//
//   개념04 방식              styled-components 방식
//   ────────────────────    ────────────────────────
//   .css 파일을 만든다        만들 파일이 없습니다
//   className="c05Btn"      <담기버튼>
//   이름을 서로 맞춘다        맞출 이름이 없습니다
//
// ★★ 이름을 맞출 필요가 없다는 게 핵심입니다.
//   개념04 섹션6 [실수 3]에서 "className 오타는 아무 말도 안 해 준다" 고 했습니다.
//   여기서는 이름을 안 쓰니 오타가 날 곳이 없습니다.
//   `<담기버튼>` 을 잘못 쓰면 **그냥 에러가 납니다.** 조용히 지나가지 않습니다.

// 백틱 안은 그냥 CSS 입니다. 중첩도 됩니다.
const 상자 = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;

  h4 {
    margin: 0 0 6px;
    font-size: 15px;
  }
`;

// ★ `h4 { ... }` 는 "이 상자 **안의** h4" 라는 뜻입니다.
//   CSS 에서 `.상자 h4 { }` 라고 쓰던 것과 같습니다.
//   ★★ 밖의 h4 는 영향을 안 받습니다. 이 상자 안에서만 먹습니다.

function Section1Demo() {
  const [담은수, set담은수] = useState(0);

  return (
    <div className="demo">
      <h3>① CSS 를 컴포넌트로</h3>

      <상자>
        <h4>삼각김밥</h4>
        <div>1200원</div>
        <담기버튼 onClick={() => set담은수(담은수 + 1)}>담기</담기버튼>
      </상자>

      <div className="output">담은 개수: {담은수}</div>
    </div>
  );
}

// ★ `onClick` 이 그냥 먹습니다. `<담기버튼>` 이 결국 `<button>` 이기 때문입니다.
//   styled-components 가 만든 것은 **button 을 감싼 컴포넌트**입니다.
//   그래서 button 에 주던 것(onClick, disabled, type…)을 그대로 줄 수 있습니다.

// ✏️ 직접 해보기 1 — 담기버튼 의 background 를 #d9534f 로 바꿔 보세요.
//                    저장하는 순간 화면이 바뀝니까? 담은 개수는 그대로입니까?

// ✏️ 직접 해보기 2 — `styled.button` 을 `styled.a` 로 바꾸고
//                    `<담기버튼 href="#">` 처럼 써 보세요. 무엇이 달라집니까?

// ── 섹션 2: props 로 모양을 바꿉니다 ──

// 여기가 앞의 두 방법과 제일 크게 다른 곳입니다.
//
// 개념04에서 조건부 스타일을 이렇게 했습니다.
//
//     const cardClass = isSale ? "c05Card c05Sale" : "c05Card";
//     <div className={cardClass}>
//
// 클래스 이름을 **글자로 조립**했습니다. styled-components 는 값을 그대로 받습니다.

const 값표시 = styled.span`
  font-weight: bold;
  color: ${(props) => (props.$큰가 ? "#d9534f" : "#2d6cdf")};
  font-size: ${(props) => (props.$큰가 ? "20px" : "15px")};
`;

// ★★★ `$` 를 왜 붙이나 — 이게 이 섹션의 핵심입니다.
//
//   `$` 로 시작하는 props 는 **스타일을 정하는 데만 쓰고 DOM 으로 안 내려갑니다.**
//   이런 것을 transient props (지나가는 props) 라고 부릅니다.
//
//   `$` 를 빼고 `<값표시 큰가={true}>` 라고 쓰면 —
//   `큰가` 를 진짜 HTML 속성으로 알고 `<span 큰가="true">` 를 만들려 합니다.
//
// ★★ 그러면 경고가 **두 개** 납니다. 진짜 크롬으로 재 본 것입니다.
//
//   ① styled-components 가 먼저 말립니다
//
//     styled-components: it looks like an unknown prop "큰가" is being sent
//     through to the DOM, which will likely trigger a React console error.
//     … or consider using transient props (`$` prefix for automatic filtering.)
//
//   ② 그 다음 React 가 실제로 화를 냅니다
//
//     Received `true` for a non-boolean attribute `큰가`.
//     If you want to write it to the DOM, pass a string instead:
//     큰가="true" or 큰가={value.toString()}.
//
//   ★ ①의 마지막 줄이 답을 그대로 알려 줍니다. "transient props (`$` prefix)" 를 쓰라고요.
//     경고문을 끝까지 읽으면 고치는 법이 대개 그 안에 있습니다.
//
//   ★★ 화면은 멀쩡하게 나옵니다. 색도 크기도 제대로 바뀝니다.
//     콘솔에만 쌓입니다. 그래서 안 보고 지나가기 쉽습니다. 섹션 6에서 다시 다룹니다.

function Section2Demo() {
  const [금액, set금액] = useState(1200);
  const 큰가 = 금액 >= 5000;

  return (
    <div className="demo">
      <h3>② props 로 모양 바꾸기</h3>

      <div>
        <button onClick={() => set금액(1200)}>1200원</button>{" "}
        <button onClick={() => set금액(8000)}>8000원</button>
      </div>

      <div className="output">
        가격: <값표시 $큰가={큰가}>{금액}원</값표시>
        {큰가 && " ← 5000원이 넘어 빨간 큰 글씨가 됩니다"}
      </div>
    </div>
  );
}

// ★★ 클래스 이름을 조립하지 않았습니다. **값을 그대로 넘겼습니다.**
//   `$큰가={큰가}` 하나로 색과 크기가 같이 바뀝니다.
//
//   CSS Modules 로 같은 것을 하려면 —
//     .큼 { color: #d9534f; font-size: 20px; }
//     className={`${styles.값} ${큰가 ? styles.큼 : ""}`}
//   클래스를 하나 더 만들고 이름을 조립해야 합니다.
//
//   ★ 값이 두 가지(크다/작다)면 별 차이가 없습니다.
//     값이 이어지는 수(0~100 같은)면 이야기가 달라집니다.
//     클래스로는 100개를 미리 만들 수 없습니다.

// ✏️ 직접 해보기 3 — 값표시 에 `$흐림` props 를 하나 더 만들어
//                    참이면 opacity 를 0.4 로 만들어 보세요.

// ✏️ 직접 해보기 4 — `$큰가` 를 `큰가` 로 (달러를 빼고) 바꿔 보세요.
//                    화면은 그대로입니까? F12 → Console 에 무엇이 뜹니까?
//                    확인했으면 되돌려 두세요.

// ── 섹션 3: 이름이 겹치지 않습니다 ──

// 개념04 섹션4에서 전역 CSS 의 이름이 부딪히는 것을 봤습니다.
// `.card` 를 두 팀이 각자 정의하면 나중에 불려 온 쪽이 이겼습니다.
//
// styled-components 는 클래스 이름을 **직접 짓지 않습니다.**
// 그래서 부딪힐 이름이 없습니다.

const 파랑상자 = styled.div`
  background: #eef4ff;
  padding: 8px;
  margin: 4px 0;
`;

const 초록상자 = styled.div`
  background: #eefaf0;
  padding: 8px;
  margin: 4px 0;
`;

function Section3Demo() {
  return (
    <div className="demo">
      <h3>③ 이름이 겹치지 않습니다</h3>

      <파랑상자>파랑상자입니다</파랑상자>
      <초록상자>초록상자입니다</초록상자>

      <div className="output">
        <div>파랑상자가 받은 class: {파랑상자.styledComponentId}</div>
        <div>초록상자가 받은 class: {초록상자.styledComponentId}</div>
        <div style={{ marginTop: 6 }}>
          ★ F12 로 위 상자를 눌러 보세요. class 가 두 개 붙어 있습니다.
        </div>
      </div>
    </div>
  );
}

// ★ 진짜 화면에서는 이렇게 나옵니다.
//
//     <div class="sc-bdvwhi bjovqr">파랑상자입니다</div>
//                 ────────  ──────
//                 ①         ②
//
//   ① 이 컴포넌트를 가리키는 이름 (styledComponentId)
//   ② 지금 이 스타일 묶음을 가리키는 이름 (내용이 바뀌면 이것도 바뀝니다)
//
// ★★ 둘 다 사람이 안 짓습니다. 그래서 남과 겹칠 수가 없습니다.
//   개념04의 붙임말(c05Card 같은)을 붙이던 일이 필요 없어집니다.
//
// ★ 대신 **F12 에서 이름만 보고는 어느 컴포넌트인지 모릅니다.**
//   `sc-bdvwhi` 를 보고 "아 담기버튼이구나" 할 수가 없습니다.
//   이게 실제로 불편합니다. (섹션 4의 단점 칸)

// ✏️ 직접 해보기 5 — F12 → Elements 에서 파랑상자를 눌러 class 두 개를 확인하세요.
//                    그 다음 배경색을 #ffeeee 로 바꾸고 저장해, 둘 중 어느 쪽이
//                    바뀌는지 보세요.

// ── 섹션 4: 셋 중 무엇을 쓰나 ──

// 개념04의 둘과 여기의 하나를 나란히 놓습니다.

const 비교표 = [
  {
    이름: "전역 CSS",
    좋은점: "제일 단순합니다. 배운 CSS 그대로입니다",
    나쁜점: "★ 이름이 겹치면 조용히 덮입니다",
    쓸때: "사이트 전체에 걸리는 것 (글꼴·기본 색)",
  },
  {
    이름: "CSS Modules",
    좋은점: "겹침이 없고, 설치할 게 없습니다",
    나쁜점: "조건부 스타일에 이름을 조립해야 합니다",
    쓸때: "★ 대부분의 경우. 기본으로 삼으세요",
  },
  {
    이름: "styled-components",
    좋은점: "props 로 값을 그대로 넘깁니다",
    나쁜점: "설치가 필요하고, F12 에서 이름을 못 알아봅니다",
    쓸때: "값에 따라 스타일이 이어서 바뀔 때",
  },
];

function Section4Demo() {
  return (
    <div className="demo">
      <h3>④ 셋 비교</h3>

      {비교표.map((하나) => (
        <상자 key={하나.이름}>
          <h4>{하나.이름}</h4>
          <div>○ {하나.좋은점}</div>
          <div>✕ {하나.나쁜점}</div>
          <div>→ {하나.쓸때}</div>
        </상자>
      ))}
    </div>
  );
}

// ★★★ 이 자료의 09~13단원은 **전역 CSS(index.css)를 기본**으로 씁니다.
//   혼자 연습하는 지금은 그게 가장 간단하기 때문입니다(개념04 참고).
//
//   styled-components 는 **팀이 이미 쓰고 있으면** 따라 쓰세요.
//   혼자 시작하는 프로젝트에 굳이 넣을 이유는 없습니다.
//
// ★★ 섞어 써도 됩니다. 실제로 많이 그렇게 합니다.
//   전역 CSS 로 글꼴과 기본 색을 깔고, 화면은 CSS Modules 로 만들고,
//   값에 따라 변하는 것 몇 개만 styled-components 로 하는 식입니다.
//
// ★ "무엇이 정답인가" 보다 **"팀이 하나로 정했는가"** 가 훨씬 중요합니다.
//   한 프로젝트에 세 방식이 아무 규칙 없이 섞여 있으면 그게 제일 나쁩니다.

// ✏️ 직접 해보기 6 — 09단원에서 만들 화면을 떠올리고,
//                    셋 중 무엇을 쓸지와 그 이유를 주석으로 적어 보세요.

// ── 섹션 5: ★★ 컴포넌트를 함수 밖에서 만드세요 ──

// 지금까지 만든 styled 컴포넌트는 전부 **파일 맨 위**에 있습니다.
// 함수 안에 넣으면 안 됩니다. 그런데 왜 안 되는지는 안 해 보면 모릅니다.

// [올바른 자리] 파일 맨 위 — 한 번만 만들어집니다
const 바깥에서만든칸 = styled.div`
  border: 2px solid #2d6cdf;
  padding: 8px;
  margin: 4px 0;
`;

function Section5Demo() {
  const [센수, set센수] = useState(0);

  // ★★★ [잘못된 자리] 함수 안 — 그릴 때마다 **새로 만들어집니다**
  const 안에서만든칸 = styled.div`
    border: 2px solid #d9534f;
    padding: 8px;
    margin: 4px 0;
  `;

  return (
    <div className="demo">
      <h3>⑤ 함수 안에서 만들면</h3>

      <button onClick={() => set센수(센수 + 1)}>다시 그리기 ({센수}번)</button>

      <바깥에서만든칸>
        <div>바깥에서 만든 칸 (파랑)</div>
        <div>
          여기에 글자를 쳐 보세요: <input placeholder="아무거나" />
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          class: {바깥에서만든칸.styledComponentId}
        </div>
      </바깥에서만든칸>

      <안에서만든칸>
        <div>안에서 만든 칸 (빨강) ★</div>
        <div>
          여기에도 쳐 보세요: <input placeholder="아무거나" />
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          class: {안에서만든칸.styledComponentId}
        </div>
      </안에서만든칸>

      <div className="output">
        양쪽 칸에 글자를 친 다음 <strong>[다시 그리기]</strong> 를 누르세요.
        <br />
        빨강 칸의 글자만 사라집니다. class 이름도 바뀝니다.
      </div>
    </div>
  );
}

// ★★★ 무슨 일이 벌어지나
//
//   `styled.div` 는 **컴포넌트를 만드는 함수**입니다.
//   함수 안에 두면 그릴 때마다 새 컴포넌트가 만들어집니다.
//
//   React 는 "컴포넌트가 바뀌었다" 고 보고 **옛것을 버리고 새로 그립니다.**
//   그 안에 있던 것이 전부 없어집니다.
//
//     · input 에 친 글자가 사라집니다
//     · 커서(포커스)도 풀립니다
//     · 그 안에 useState 가 있었다면 값도 초기화됩니다
//
// ★★ 그리고 스타일이 **매번 새로 만들어져 쌓입니다.**
//   백 번 그리면 백 개가 쌓입니다. 화면이 점점 느려집니다.
//
// ★★ 콘솔을 열어 보세요. styled-components 가 **경고를 냅니다.**
//
//     The component styled.div with the id of "sc-gKckzE" has been created dynamically.
//     You may see this warning because you've called styled inside another component.
//     To resolve this only create new StyledComponents outside of any render method
//     and function component.
//
//   ★ 이 자료를 만들면서 여기를 틀렸습니다.
//     "에러도 경고도 없다" 고 적어 놨는데, 진짜 크롬으로 돌려 보니 **경고가 있었습니다.**
//     검증 도구가 잡아 줬습니다. 감으로 적으면 이렇게 됩니다.
//
// ★★★ 그런데 안심하면 안 됩니다. 이 경고는 **개발 중에만** 나옵니다.
//
//   styled-components 는 `개발 모드일 때만` 이 경고를 내도록 만들어져 있습니다.
//   `npm run build` 로 빌드한 결과에는 이 경고가 **아예 들어 있지 않습니다.**
//
//   · 개발 중  → 경고가 뜹니다 (다행히)
//   · 배포 뒤  → 아무 말도 없습니다. 증상만 남습니다
//
//   ★ 그래서 "배포하고 나서 가끔 입력이 지워져요" 가 됩니다.
//     개발할 때 콘솔을 안 봤으면 못 잡고 넘어간 것입니다.
//     ★★ 콘솔에 노란 줄이 쌓여 있으면 배포 전에 한 번 훑으세요.
//
// ★★★ 규칙은 하나입니다.
//   **styled 컴포넌트는 파일 맨 위에서 만든다.** 예외 없습니다.
//   값에 따라 바꿀 게 있으면 섹션 2처럼 props 로 넘기세요.

// ✏️ 직접 해보기 7 — 두 칸에 글자를 친 다음 [다시 그리기] 를 누르세요.
//                    어느 쪽 글자가 남습니까? class 이름은 어떻게 됩니까?

// ✏️ 직접 해보기 8 — 안에서만든칸 을 함수 밖으로 옮기고(이름은 그대로) 다시 해 보세요.
//                    이번엔 글자가 남습니까? 확인했으면 되돌려 두세요.

// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] props 에 `$` 를 안 붙임 ★ 제일 흔합니다
//   <값표시 큰가={true}> 라고 쓰면 경고가 두 개 뜹니다 (섹션 2).
//   화면은 멀쩡해서 모르고 지나갑니다. 콘솔을 열어 두세요.
//   스타일을 정하는 데만 쓰는 props 에는 전부 `$` 를 붙이세요.
//   ★ 영문 prop 이름이라도 마찬가지입니다. `primary` 도 HTML 속성이 아닙니다.

// [실수 2] styled 컴포넌트를 함수 안에서 만듦 ★ 섹션 5
//   개발 중에는 콘솔에 "has been created dynamically" 경고가 뜹니다.
//   ★ 빌드하면 그 경고가 사라집니다. 증상만 남습니다.
//     콘솔의 노란 줄을 그냥 두면 이런 것을 놓칩니다.

// [실수 3] 백틱 대신 괄호를 씀
//   styled.button("color: red")  ← 이렇게 쓰는 게 아닙니다
//   styled.button`color: red;`   ← 백틱을 바로 붙입니다
//   ★ 함수 호출이 아니라 태그드 템플릿이라는 문법입니다.
//     지금은 "백틱을 붙여 쓴다" 로만 알아도 됩니다.

// [실수 4] 컴포넌트 이름을 소문자로 시작
//   const 버튼 = ... 처럼 한글은 괜찮습니다.
//   영문으로 지을 때 const button = styled.button`` 이라고 하면
//   <button> 이 진짜 HTML 버튼과 헷갈립니다. Button 처럼 대문자로 시작하세요.
//   (01단원 개념04에서 본 규칙 그대로입니다)

// [실수 5] CSS 에 세미콜론을 빠뜨림
//   백틱 안은 진짜 CSS 라서 줄마다 `;` 가 필요합니다.
//   빠뜨리면 그 줄부터 조용히 무시됩니다. 에러가 안 납니다.

// [실수 6] 설치를 안 하고 import
//   Failed to resolve import "styled-components" 가 뜹니다.
//   실습프로젝트에는 이미 넣어 뒀습니다. 새 프로젝트에서는
//   npm i styled-components 를 먼저 하세요.

// ── 화면 ──

export default function Concept05Styled() {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div>
      <h1>개념 05 — styled-components</h1>

      <p className="guide">
        개념04의 CSS Modules 를 먼저 보고 오세요. <strong>비교하는 파일</strong>입니다.
        <br />
        <br />
        <strong>이 방법을 꼭 써야 하는 것은 아닙니다.</strong> 이 단원에서 기본으로 다룬 것은
        CSS Modules 이고, 09단원부터는 다시 전역 <code>index.css</code> 만 씁니다.
        다만 styled-components 는 회사에서 아주 많이 쓰기 때문에 읽을 줄은 알아야 합니다.
        <br />
        <br />
        <strong>섹션 5가 이 파일에서 제일 중요합니다.</strong> 에러가 안 나는 함정이라
        모르면 못 찾습니다.
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
          "styled-components 는 CSS 를 컴포넌트로 만듭니다. styled.button 뒤에 백틱을 붙이고 그 안에 CSS 를 그대로 씁니다. .css 파일도 className 도 없습니다.",
          "만들어진 것은 결국 그 태그입니다. <담기버튼> 은 <button> 이라서 onClick·disabled 같은 것을 그대로 줄 수 있습니다.",
          "props 로 값을 그대로 넘겨 스타일을 바꿉니다. CSS Modules 처럼 클래스 이름을 조립하지 않아도 됩니다. 값이 이어지는 수일 때 특히 편합니다.",
          "스타일에만 쓰는 props 에는 $ 를 붙입니다($큰가). 안 붙이면 styled-components 와 React 가 각각 경고를 냅니다. 화면은 멀쩡해서 모르고 지나가기 쉽습니다.",
          "클래스 이름을 사람이 안 짓습니다. 그래서 겹칠 일이 없습니다. 대신 F12 에서 sc-bdvwhi 같은 이름만 보여서 어느 컴포넌트인지 알아보기 어렵습니다.",
          "★ styled 컴포넌트는 반드시 파일 맨 위에서 만듭니다. 함수 안에서 만들면 그릴 때마다 새 컴포넌트가 되어 입력값과 포커스가 사라지고 스타일이 쌓입니다.",
          "그 실수는 개발 중에만 콘솔 경고(has been created dynamically)로 알려 줍니다. 빌드하면 경고가 사라지고 증상만 남습니다. 그래서 콘솔의 노란 줄을 그냥 두면 안 됩니다.",
          "이 과정의 기본은 CSS Modules 입니다. styled-components 는 팀이 이미 쓰고 있으면 따라 쓰세요. 무엇을 쓰든 팀이 하나로 정하는 게 더 중요합니다.",
        ]}
      />
    </div>
  );
}

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const 담기버튼 = styled.button`
//      background: #d9534f;
//      ...
//    `;
// 화면: 버튼이 빨갛게 바뀝니다. 담은 개수는 그대로 남습니다.
//    → 개념04의 ✏️2와 같습니다. Vite 가 바뀐 부분만 갈아 끼우기 때문입니다.
//      확인했으면 #2d6cdf 로 되돌려 두세요.
//
// 2) const 담기버튼 = styled.a`
//      ... (그대로)
//    `;
//    <담기버튼 href="#" onClick={...}>담기</담기버튼>
// 화면: 모양은 거의 같은데 글자에 밑줄이 생기고, 커서가 손 모양이 됩니다.
//    → styled.무엇 의 '무엇' 이 진짜 만들어지는 태그입니다.
//      a 로 만들면 href 를 줄 수 있고, button 으로 만들면 못 줍니다.
//      ★ 모양이 같다고 아무 태그나 쓰면 안 됩니다. 누르는 것은 button 입니다.
//      확인했으면 button 으로 되돌려 두세요.
//
// 3) const 값표시 = styled.span`
//      font-weight: bold;
//      color: ${(props) => (props.$큰가 ? "#d9534f" : "#2d6cdf")};
//      font-size: ${(props) => (props.$큰가 ? "20px" : "15px")};
//      opacity: ${(props) => (props.$흐림 ? 0.4 : 1)};
//    `;
//
//    <값표시 $큰가={큰가} $흐림={true}>{금액}원</값표시>
// 화면: 글자가 흐려집니다.
//    → props 를 몇 개든 늘릴 수 있습니다. 각각이 CSS 한 줄을 맡습니다.
//      ★ 이걸 CSS Modules 로 하려면 흐림 클래스를 따로 만들고
//        className 조립에 한 조각을 더 붙여야 합니다.
//
// 4) <값표시 큰가={큰가}>{금액}원</값표시>
// 화면: 똑같습니다. 색도 크기도 그대로 바뀝니다.
//    // 콘솔: styled-components: it looks like an unknown prop "큰가" is being sent
//    //       through to the DOM, which will likely trigger a React console error. …
//    // 콘솔: Received `true` for a non-boolean attribute `큰가`.
//    //       If you want to write it to the DOM, pass a string instead:
//    //       큰가="true" or 큰가={value.toString()}.
//    → 두 개가 연달아 뜹니다. 앞엣것이 styled-components, 뒤엣것이 React 입니다.
//      화면이 멀쩡한 게 함정입니다. 콘솔을 안 열면 모릅니다.
//      8000원을 눌렀을 때만 뜹니다(그때만 true 가 넘어가니까요).
//      ★ F12 → Elements 로 그 span 을 봐도 큰가 속성은 **안 붙어 있습니다.**
//        React 가 경고만 내고 붙이지는 않습니다. 그래서 더 티가 안 납니다.
//      확인했으면 $큰가 로 되돌려 두세요.
//
// 5) F12 → Elements 에서 파랑상자를 누르면 이렇게 보입니다.
//
//      <div class="sc-bdvwhi bjovqr">파랑상자입니다</div>
//
//    background 를 #ffeeee 로 바꾸면 —
// 화면: 배경이 분홍이 되고, class 두 개 중 **뒤엣것만** 바뀝니다.
//    → 앞엣것(sc-...)은 "이 컴포넌트" 를 가리키므로 그대로입니다.
//      뒤엣것은 "지금 이 스타일 내용" 을 가리키므로 내용이 바뀌면 같이 바뀝니다.
//      ★ 정확한 글자는 컴퓨터마다·저장할 때마다 다릅니다. 값이 아니라 모양을 보세요.
//      확인했으면 #eef4ff 로 되돌려 두세요.
//
// 6) 정답이 하나가 아닙니다. 이런 식이면 됩니다.
//
//      // 09단원 사용자 목록 화면
//      // → CSS Modules. 목록·카드 모양이 값에 따라 변하지 않고,
//      //   설치할 게 없어서 바로 시작할 수 있습니다.
//      // 다만 '불러오는 중' 표시의 흐림 정도를 진행률에 맞춰 바꾼다면
//      // 그 부분만 styled-components 가 편합니다.
//
//    → ★ "무조건 이것" 이 답이 아닙니다. 이유를 댈 수 있으면 맞은 것입니다.
//
// 7) 양쪽에 글자를 치고 [다시 그리기] 를 누르면 —
// 화면: 파랑 칸의 글자는 남고, **빨강 칸의 글자만 사라집니다.**
//       빨강 칸의 class 이름도 누를 때마다 바뀝니다. 파랑은 그대로입니다.
//    → 빨강 칸은 그릴 때마다 **다른 컴포넌트**가 됩니다.
//      React 는 그것을 "다른 것" 으로 보고 옛것을 버립니다.
//      그 안의 input 도 같이 버려지니 글자가 사라집니다.
//    // 콘솔: The component styled.div with the id of "sc-…" has been created dynamically.
//    → ★ 경고는 **뜹니다.** 다만 개발 중에만 뜹니다.
//      빌드한 결과에는 이 경고가 없습니다. 배포한 다음에는 증상만 남습니다.
//
// 8) Section5Demo 위(파일 맨 위 쪽)로 옮깁니다.
//
//      const 안에서만든칸 = styled.div`
//        border: 2px solid #d9534f;
//        padding: 8px;
//        margin: 4px 0;
//      `;
//
//      function Section5Demo() {
//        const [센수, set센수] = useState(0);
//        ...
//
// 화면: 이번에는 빨강 칸의 글자도 남습니다. class 이름도 안 바뀝니다.
//    → 옮긴 것 말고는 아무것도 안 고쳤습니다. **자리 하나가 전부**였습니다.
//      ★ 이름은 그대로 두는 게 좋습니다. "안에서 만들면 이렇게 된다" 를
//        기억하는 이름이니까요. 확인했으면 되돌려 두세요.
