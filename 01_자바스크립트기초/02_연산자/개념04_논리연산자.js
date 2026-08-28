// ============================================================
// 02단원 · 개념 04 — 논리 연산자
// ------------------------------------------------------------
// 실행: node 개념04_논리연산자.js
// ============================================================
//
// 조건 하나로는 부족할 때가 많습니다.
//
//     "19살 이상이고, 회원인 사람"        → 둘 다 만족
//     "쿠폰이 있거나, 5만원 이상 샀으면"   → 하나만 만족해도 됨
//     "품절이 아니면"                    → 반대로 뒤집기
//
// 이걸 이어 주는 기호가 논리 연산자입니다.
//
//     &&   그리고 (and)  — 둘 다 true 여야 true
//     ||   또는  (or)   — 하나라도 true 면 true
//     !    아니다 (not)  — true 를 false 로, false 를 true 로


// ── 섹션 1: && — 둘 다 참이어야 참 ──

console.log(true && true);
// 출력: true
console.log(true && false);
// 출력: false
console.log(false && true);
// 출력: false
console.log(false && false);
// 출력: false

// "둘 다 만족해야 통과" — 하나라도 어긋나면 false 입니다.

const age = 22;
const isMember = true;
console.log(age >= 19 && isMember);
// 출력: true
// 22 >= 19 는 true, isMember 도 true → 둘 다 true 라서 true

const age2 = 17;
console.log(age2 >= 19 && isMember);
// 출력: false
// 나이 조건이 false 라서 전체가 false

// 키보드에서 & 는 숫자 7 위에 있습니다. 두 개를 붙여 씁니다.

// ✏️ 직접 해보기 1 — 점수 85점이 "60점 이상이고 90점 미만"인지 판단해 출력해 보세요.


// ── 섹션 2: 범위 판단 — && 의 대표 쓰임 ──

// 개념03에서 10 < x < 30 은 틀린 코드라고 했습니다. 이렇게 써야 합니다.
const temp = 25;
console.log(temp > 10 && temp < 30);
// 출력: true

// 아까 틀렸던 예도 이제 제대로 나옵니다.
const temp2 = 100;
console.log(temp2 > 10 && temp2 < 30);
// 출력: false

// 조건을 세 개 이상 이을 수도 있습니다.
const score = 85;
console.log(score >= 0 && score <= 100 && score >= 80);
// 출력: true

// ✏️ 직접 해보기 2 — 나이가 13 이상 19 이하인지 판단하는 식을 만들어 출력해 보세요. (나이는 15로)


// ── 섹션 3: || — 하나라도 참이면 참 ──

console.log(true || true);
// 출력: true
console.log(true || false);
// 출력: true
console.log(false || true);
// 출력: true
console.log(false || false);
// 출력: false

// "둘 중 하나만 만족해도 통과"

const hasCoupon = false;
const totalPrice = 60000;
console.log(hasCoupon || totalPrice >= 50000);
// 출력: true
// 쿠폰은 없지만 5만원 이상이라 무료배송

// 키보드에서 | 는 백스페이스 아래, 역슬래시(\)와 같은 키입니다.
// Shift 를 누르고 칩니다. 대문자 I 나 소문자 l 이 아닙니다.

// ✏️ 직접 해보기 3 — 요일이 "토" 이거나 "일" 인지 판단해 출력해 보세요. (요일은 "일"로)


// ── 섹션 4: ! — 뒤집기 ──

console.log(!true);
// 출력: false
console.log(!false);
// 출력: true

const isSoldOut = false;
console.log(!isSoldOut);
// 출력: true
// "품절이 아니다" → 살 수 있다

// 비교식 앞에 붙일 때는 반드시 괄호로 감싸세요.
const temperature = -5;

// [맞는 코드] "영상이 아니다" = 영하다
console.log(!(temperature > 0));
// 출력: true

// [틀린 코드] 괄호를 빼면 뜻이 완전히 달라집니다.
console.log(!temperature > 0);
// 출력: false
// ! 이 > 보다 먼저 계산되기 때문입니다. 순서대로 따라가 보면
//   1) !temperature  →  !(-5)  →  -5 는 truthy 라서  false
//   2) false > 0     →  false 는 숫자로 0  →  0 > 0  →  false
// 영하 5도인데 "영하가 아니다"라는 답이 나왔습니다.
// ! 는 바로 뒤에 오는 것 하나에만 걸린다고 기억하세요.

// ✏️ 직접 해보기 4 — isLoggedIn 이 false 일 때 "로그인하지 않았다"를
//                    ! 로 판단해 출력해 보세요.


// ── 섹션 5: 계산 순서 — ! → && → || ──

// 셋이 섞이면 ! 이 먼저, 그다음 && , 마지막이 || 입니다.
console.log(true || false && false);
// 출력: true
// && 를 먼저 계산합니다. false && false = false → true || false = true

console.log((true || false) && false);
// 출력: false
// 괄호로 순서를 바꾸면 결과가 달라집니다.

// 헷갈리면 괄호를 쓰세요. 읽는 사람도 편합니다.
const isWeekend = true;
const isHoliday = false;
const isWorkday = !(isWeekend || isHoliday);
console.log(isWorkday);
// 출력: false

// ✏️ 직접 해보기 5 — (나이가 19 이상) 그리고 (회원이거나 쿠폰이 있음) 을
//                    괄호를 써서 판단해 보세요. (나이 20, 회원 false, 쿠폰 true)


// ── 섹션 6: 값이 비었을 때 기본값 채우기 (|| 와 ??) ──

// 지금까지 배운 true / false 이야기는 전부 맞습니다. 여기에 하나만 더합니다.
// && 와 || 는 true/false 가 아니라 '값' 을 그대로 내놓습니다.
// || 는 왼쪽이 falsy 면 오른쪽을 내놓습니다.
// (falsy 6개: 0, "", null, undefined, NaN, false — 01단원 개념05)

const inputName = ""; // 이름을 안 적고 보냈다고 가정
console.log(inputName || "손님");
// 출력: 손님

const inputName2 = "김민준";
console.log(inputName2 || "손님");
// 출력: 김민준

// "값이 없으면 기본값을 쓴다"를 한 줄로 쓰는 방법입니다. 아주 자주 씁니다.

// [주의] 0 도 falsy 라서 기본값으로 밀려납니다.
const count = 0;
console.log(count || 10);
// 출력: 10
// 재고가 진짜 0인데 10으로 바뀌어 버립니다. 이건 버그입니다.

// 그래서 ?? 라는 기호가 새로 생겼습니다.
// ?? 는 null 과 undefined 일 때만 오른쪽을 씁니다.
console.log(count ?? 10);
// 출력: 0
// 0은 그대로 살아남습니다.

const notChosen = null;
console.log(notChosen ?? 10);
// 출력: 10

// 정리:
//   ||  값이 falsy(0, "", null, undefined, NaN, false)면 기본값
//   ??  값이 null 이나 undefined 일 때만 기본값   ← 대부분 이게 안전합니다

// ✏️ 직접 해보기 6 — nickname 이 빈 문자열일 때 || 로 "익명" 이 나오게 해 보세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] & 나 | 를 하나만 쓰기
console.log(true & true);
// 출력: 1
// 실수: & 하나는 완전히 다른 기호(비트 연산자)입니다. 결과도 숫자로 나옵니다.
//       반드시 두 개씩 && , || 로 쓰세요.

// [실수 2] 범위를 수학처럼 쓰기 (개념03에서 봤습니다)
// 10 < x < 30   ← 틀림
// x > 10 && x < 30   ← 맞음

// [실수 3] "또는"을 말로 옮기다 틀리기
const day = "일";
console.log(day === "토" || "일");
// 출력: 일
// 실수: true/false 가 아니라 "일" 이 나옵니다.
//       || 오른쪽의 "일" 은 비교식이 아니라 그냥 글자입니다.
//       비교를 양쪽에 다 써야 합니다.
console.log(day === "토" || day === "일");
// 출력: true

// [실수 4] 부정을 이중으로 써서 헷갈리기
const isNotClosed = true;
console.log(!isNotClosed);
// 출력: false
// 실수는 아니지만, 변수 이름에 부정을 넣으면 !isNotClosed 처럼
// 부정의 부정이 되어 읽기 힘듭니다. isOpen 처럼 긍정으로 이름 지으세요.


// ── 정리 ──

// 1. &&  둘 다 true 여야 true.  범위 판단에 쓴다.
// 2. ||  하나라도 true 면 true.
// 3. !   뒤집기. 비교식 앞에 붙일 땐 괄호로 감쌀 것.
// 4. 순서는 ! → && → || . 헷갈리면 괄호.
// 5. 값 || 기본값  /  값 ?? 기본값  — 0을 살리려면 ?? 를 쓴다.
// 6. day === "토" || day === "일"  — 비교는 양쪽에 다 쓴다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const s = 85;
//    console.log(s >= 60 && s < 90);          // 출력: true
//
// 2) const a = 15;
//    console.log(a >= 13 && a <= 19);         // 출력: true
//
// 3) const d = "일";
//    console.log(d === "토" || d === "일");    // 출력: true
//
// 4) const isLoggedIn = false;
//    console.log(!isLoggedIn);                // 출력: true
//
// 5) const myAge = 20;
//    const member = false;
//    const coupon = true;
//    console.log(myAge >= 19 && (member || coupon));   // 출력: true
//
// 6) const nickname = "";
//    console.log(nickname || "익명");           // 출력: 익명
