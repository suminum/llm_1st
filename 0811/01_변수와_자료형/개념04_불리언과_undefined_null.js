// ============================================================
// 01단원 · 개념 04 — 자료형 (2) 불리언, undefined, null
// ------------------------------------------------------------
// 실행: node 개념04_불리언과_undefined_null.js
// ============================================================
//
// 숫자와 문자열 말고도 자주 만나는 값이 세 가지 더 있습니다.
//
//   boolean    참이냐 거짓이냐  →  true / false
//   undefined  아직 값이 없음   (컴퓨터가 알아서 넣어 준 '없음')
//   null       비어 있음        (사람이 일부러 넣은 '없음')


// ── 섹션 1: boolean — 참과 거짓 ──

// true(참)와 false(거짓), 딱 두 가지 값만 있는 자료형입니다.
// 따옴표를 씌우지 않습니다. 전부 소문자입니다.
const isOpen = true;
const isClosed = false;

console.log(isOpen, typeof isOpen);
// 출력: true boolean
console.log(isClosed, typeof isClosed);
// 출력: false boolean

// 따옴표를 씌우면 그냥 글자가 됩니다. 완전히 다른 값입니다.
console.log("true", typeof "true");
// 출력: true string

// 참/거짓을 담는 변수는 이름을 is~ , has~ 로 시작하면 읽기 좋습니다.
const isMember = true;
const hasCoupon = false;
console.log(isMember, hasCoupon);
// 출력: true false

// ✏️ 직접 해보기 1 — isStudent 라는 변수에 true 를 담고,
//                    값과 자료형을 같이 출력해 보세요.


// ── 섹션 2: 비교하면 불리언이 나온다 ──

// 값을 비교하면 그 결과가 true 나 false 로 나옵니다.
console.log(10 > 5);
// 출력: true
console.log(10 < 5);
// 출력: false
console.log(10 === 10);
// 출력: true

// === 는 "같다"인지 묻는 기호입니다. = 하나는 "넣어라"였죠.
//   =    넣어라
//   ===  같으냐?
// 비교 기호는 02단원에서 자세히 배웁니다. 여기서는 "비교하면 불리언이 나온다"만
// 기억하면 됩니다.

// 결과를 변수에 담을 수도 있습니다.
const stock = 3;
const isSoldOut = stock === 0;
console.log(isSoldOut);
// 출력: false

// 이 true/false 가 있어야 "재고가 0이면 품절이라고 띄워라" 같은 판단을 할 수 있습니다.
// 그 판단문(조건문)은 03단원에서 배웁니다.

// ✏️ 직접 해보기 2 — 내 나이가 19보다 큰지 비교한 결과를 출력해 보세요.


// ── 섹션 3: undefined — 아직 값이 없음 ──

// 변수를 만들어 놓고 값을 안 넣으면 undefined 가 들어갑니다.
let orderMemo;
console.log(orderMemo, typeof orderMemo);
// 출력: undefined undefined

// 나중에 값을 넣으면 그때부터 그 값이 됩니다.
orderMemo = "얼음 적게";
console.log(orderMemo, typeof orderMemo);
// 출력: 얼음 적게 string

// undefined 는 "내가 안 넣었다"는 신호입니다. 직접 넣는 값이 아닙니다.
// 앞 파일에서 봤던 이 결과도 undefined 였습니다.
console.log("안녕".lenght); // length 오타
// 출력: undefined
// 없는 것을 꺼내려 하면 에러 대신 undefined 가 나옵니다.
// 그래서 undefined 가 찍히면 "이름을 잘못 썼나?" 부터 의심하세요.

// const 는 만들 때 값을 반드시 넣어야 합니다.
// const something;
// 실수: SyntaxError: Missing initializer in const declaration
//       바꿀 수 없는 변수를 비워 두면 영원히 비어 있으니 애초에 막아 둔 것입니다.

// ✏️ 직접 해보기 3 — let 으로 nickname 변수를 만들되 값은 넣지 말고 출력해 보세요.


// ── 섹션 4: null — 일부러 비워 둔 값 ──

// null 은 "여기에 값이 없다"고 사람이 직접 넣는 값입니다.
let coupon = null;
console.log(coupon);
// 출력: null

// 예를 들어 쿠폰을 아직 안 골랐다는 뜻으로 null 을 넣어 두었다가
coupon = "3000원 할인";
console.log(coupon);
// 출력: 3000원 할인

// 다시 취소하면 null 로 되돌립니다.
coupon = null;
console.log(coupon);
// 출력: null

// undefined 와 null 의 차이를 한 줄로 정리하면 이렇습니다.
//   undefined : 컴퓨터가 넣은 '없음'  → 아직 아무도 손대지 않았다
//   null      : 사람이 넣은 '없음'    → 일부러 비웠다
// 실무에서는 "값 없음"을 표현할 때 주로 null 을 씁니다.

// ✏️ 직접 해보기 4 — selectedSeat 변수에 null 을 담아 출력한 뒤,
//                    "A12" 로 바꿔 다시 출력해 보세요.


// ── 섹션 5: typeof null 은 "object" — 유명한 함정 ──

console.log(typeof undefined);
// 출력: undefined

console.log(typeof null);
// 출력: object

// null 인데 왜 object 일까요? 자바스크립트가 처음 만들어질 때 생긴 버그인데,
// 지금 고치면 세상의 수많은 코드가 깨져서 그냥 두고 있습니다.
// "typeof null 은 object 다"는 그냥 외우세요. 면접 단골 질문입니다.

// null 인지 확인하려면 typeof 말고 값을 직접 비교합니다.
const value = null;
console.log(value === null);
// 출력: true


// ── 섹션 6: 지금까지 나온 자료형 한눈에 보기 ──

console.log(typeof 1200);
// 출력: number
console.log(typeof "안녕");
// 출력: string
console.log(typeof true);
// 출력: boolean
console.log(typeof undefined);
// 출력: undefined
console.log(typeof null);
// 출력: object
// ↑ 이 한 줄만 함정입니다. 나머지는 예상대로 나옵니다.

// 이 다섯 가지를 원시 자료형이라고 부릅니다. "값 하나"를 담는 종류입니다.
// (원시 자료형은 사실 두 가지가 더 있지만 아주 특수한 용도라 이 자료에서는 다루지 않습니다)
// 값을 여러 개 묶어 담는 배열과 객체는 06·07단원에서 배웁니다.


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] true 를 대문자로 쓰기 → ReferenceError
// console.log(True);
// 실수: 자바스크립트는 전부 소문자 true / false 입니다. (파이썬은 True)

// [실수 2] 불리언에 따옴표 씌우기
console.log(typeof "false");
// 출력: string
// 실수: "false" 는 글자입니다. 조건문에서 참으로 취급되어 버그가 됩니다.

// [실수 3] undefined 를 직접 넣기
// let x = undefined;
// 실수: 문법 오류는 아니지만, "비었다"를 표현할 땐 null 을 쓰는 게 약속입니다.

// [실수 4] null 과 undefined 를 같다고 생각하기
console.log(null === undefined);
// 출력: false
// 실수: 둘 다 '없음'이지만 서로 다른 값입니다.


// ── 정리 ──

// 1. boolean : true / false 두 가지. 소문자, 따옴표 없음.
// 2. 비교( > , === )의 결과는 불리언이다.
// 3. undefined : 값을 안 넣었을 때 자동으로 들어가는 '없음'
// 4. null : 사람이 일부러 넣는 '없음'
// 5. typeof null 은 "object" — 언어의 오래된 버그. 외울 것.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const isStudent = true;
//    console.log(isStudent, typeof isStudent);   // 출력: true boolean
//
// 2) const myAge = 20;
//    console.log(myAge > 19);                    // 출력: true
//
// 3) let nickname;
//    console.log(nickname);                      // 출력: undefined
//
// 4) let selectedSeat = null;
//    console.log(selectedSeat);                  // 출력: null
//    selectedSeat = "A12";
//    console.log(selectedSeat);                  // 출력: A12
