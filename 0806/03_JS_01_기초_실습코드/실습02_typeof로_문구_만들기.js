// 03_JS_01_기초 실습 정답코드 — 실습: typeof로 문구 만들기 (JavaScript)
// Step 순서대로 따라가며 확인하세요.
// node 실습02_typeof로_문구_만들기.js 로 실행하며 결과를 확인합니다.

// ── 실습: typeof로 문구 만들기 ──────────────
console.log("===== 실습: typeof로 문구 만들기 =====");
// 문제: "" 안의 문구를 typeof의 결과값으로 채워 아래 문장을 출력하세요.
//       "number" isn't "string" data type.
// Step 1: typeof는 자료형 이름을 문자열로 반환 (typeof 42 -> "number")
// Step 2: 템플릿 리터럴 안에 ${typeof 값} 형태로 끼워 넣기
console.log(`"${typeof 42}" isn't "${typeof "hello"}" data type.`);
// 출력: "number" isn't "string" data type.
// 읽는 순서: 백틱 안에서 ${ } 부분이 먼저 계산되고, 그 결과가 제자리에 끼워집니다.
//   ${typeof 42}      → "number"
//   ${typeof "hello"} → "string"
// 바깥의 큰따옴표(")는 ${} 밖에 있으므로 결과 문장에 글자 그대로 남습니다 —
// 그래서 출력에 따옴표가 보이는 것입니다.
// Step 3: null에 typeof를 쓰면 "object"가 나옴을 확인 (JS 초기 설계 버그)
console.log(typeof null);  // 출력: object
