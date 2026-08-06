// 03_JS_01_기초 개념코드 — 섹션 11. typeof (JavaScript)
// 읽는 순서: [기본] → [축약/다른 방법] → 실수 예시
// "실수:" 로 시작하는 줄은 일부러 틀리게 쓴 예입니다 (실행되지 않게 주석 처리).
// node 섹션11_typeof.js 로 실행하며 결과를 확인합니다.

// ── 섹션 11: typeof ──────────────
console.log("===== 섹션 11: typeof =====");
// 언제 쓰나: 섹션 12에서 보듯 JS는 타입이 안 맞아도 조용히 넘어갑니다.
// 계산 결과가 이상할 때 "이 값이 숫자가 맞나, 글자인가"를 확인하는 검사 도구입니다.
// 결과가 자료형 "이름"인 문자열이라는 점에 주의 — typeof 42 는 "number"라는 글자입니다.
// [기본] 값의 자료형 이름을 문자열로 반환
console.log(typeof "안뇽");     // 출력: string
console.log(typeof 3);          // 출력: number
console.log(typeof true);       // 출력: boolean
console.log(typeof undefined);  // 출력: undefined
// [주의] typeof null은 "object" - JS 초기 설계 버그, null 확인은 === null 사용
console.log(typeof null);       // 출력: object
console.log(typeof [1, 2]);     // 출력: object (배열도 object로 나옴 - 주의)
// 배열인지 확인하는 방법은 따로 있습니다(Array.isArray). 오늘 범위 밖이니 이름만 알아 두세요.

// [기본] 결과는 "글자"입니다 — 자료형 그 자체가 아니라 자료형의 "이름"
console.log(typeof typeof 3);   // 출력: string
// typeof 3 이 "number"라는 글자가 되고, 그 글자의 타입이 string이라 이렇게 나옵니다.

// [다른 방법] 비교에 써서 검사하기 — 결과가 글자이므로 따옴표로 비교합니다
const input = "25";
console.log(typeof input === "number");  // 출력: false  (겉보기엔 숫자지만 글자입니다)
console.log(typeof input === "string");  // 출력: true
// 실수: typeof input === number  // 따옴표를 빼면 number라는 변수를 찾다가 에러

// 실무에서 쓰는 자리: 화면 입력창에서 받은 값은 숫자를 쳐도 항상 문자열입니다.
// 계산이 이상하면 typeof부터 찍어 보세요 — 다음 섹션(형 변환)이 그 처방입니다.

// 실수: typeof x === null  // null 확인은 typeof가 아니라 x === null 로!
