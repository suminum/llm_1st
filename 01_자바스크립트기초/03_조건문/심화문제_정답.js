// ============================================================
// 03단원 심화문제 정답
// ------------------------------------------------------------
// 실행: node 심화문제_정답.js
// ============================================================


// ───── 심화 1 ─────
const score1 = 95;

// [틀린 코드] 그대로 두었습니다. 왜 D가 나오는지 보세요.
if (score1 >= 60) {
  console.log("틀린 결과: D");
} else if (score1 >= 70) {
  console.log("틀린 결과: C");
} else if (score1 >= 80) {
  console.log("틀린 결과: B");
} else if (score1 >= 90) {
  console.log("틀린 결과: A");
}
// 출력: 틀린 결과: D

// 왜 D 인가
//   else if 는 '위에서부터 순서대로' 확인하고, 맞는 것을 찾으면 거기서 끝냅니다.
//   95 는 첫 줄의 60 이상 조건에 이미 맞습니다.
//   그래서 아래 줄들은 아예 확인조차 하지 않습니다.
//
//   이게 else if 의 핵심 성질입니다. "먼저 쓴 것이 이깁니다."

// [고친 코드] 좁은 조건(큰 수)부터 위에 씁니다.
if (score1 >= 90) {
  console.log("올바른 결과: A");
} else if (score1 >= 80) {
  console.log("올바른 결과: B");
} else if (score1 >= 70) {
  console.log("올바른 결과: C");
} else if (score1 >= 60) {
  console.log("올바른 결과: D");
}
// 출력: 올바른 결과: A

// 규칙 하나만 기억하세요.
//   범위를 나눌 때는 한 방향으로 정렬합니다. 90 → 80 → 70 → 60.
//   거꾸로 60 → 70 → 80 → 90 도 안 됩니다. 위 코드가 그 예입니다.


// ───── 심화 2 ─────
const month1 = 1;
const month2 = 7;
const month3 = 10;

switch (month1) {
  case 12:
  case 1:
  case 2:
    console.log("겨울");
    break;
  case 3:
  case 4:
  case 5:
    console.log("봄");
    break;
  case 6:
  case 7:
  case 8:
    console.log("여름");
    break;
  default:
    console.log("가을");
}
// 출력: 겨울

switch (month2) {
  case 12:
  case 1:
  case 2:
    console.log("겨울");
    break;
  case 3:
  case 4:
  case 5:
    console.log("봄");
    break;
  case 6:
  case 7:
  case 8:
    console.log("여름");
    break;
  default:
    console.log("가을");
}
// 출력: 여름

switch (month3) {
  case 12:
  case 1:
  case 2:
    console.log("겨울");
    break;
  case 3:
  case 4:
  case 5:
    console.log("봄");
    break;
  case 6:
  case 7:
  case 8:
    console.log("여름");
    break;
  default:
    console.log("가을");
}
// 출력: 가을

// case 를 나란히 붙여 쓰면 "이 중 아무거나" 가 됩니다.
// 12·1·2 는 아래에 코드가 없으니 그대로 흘러내려 "겨울" 을 실행합니다.
//
// 가을(9·10·11)은 나머지 전부라서 default 로 처리했습니다.
// case 9, 10, 11 을 다 써도 되지만 default 가 짧습니다.
//
// [더 생각해 볼 것]
//   같은 switch 를 세 번 썼습니다. 똑같은 코드가 세 번 반복되죠.
//   05단원에서 함수를 배우면 이걸 함수 하나로 묶어
//   getSeason(1), getSeason(7), getSeason(10) 으로 끝낼 수 있습니다.
//   "같은 코드가 두 번 이상 나오면 함수로 묶는다" 를 기억해 두세요.


// ───── 심화 3 ─────
const input1 = "안녕하세요";
const input2 = " ";
const input3 = null;

if (input1 && typeof input1 === "string" && input1 !== " ") {
  console.log("사용 가능");
} else {
  console.log("사용 불가");
}
// 출력: 사용 가능

if (input2 && typeof input2 === "string" && input2 !== " ") {
  console.log("사용 가능");
} else {
  console.log("사용 불가");
}
// 출력: 사용 불가

if (input3 && typeof input3 === "string" && input3 !== " ") {
  console.log("사용 가능");
} else {
  console.log("사용 불가");
}
// 출력: 사용 불가

// 순서가 중요합니다.
//   ① input && ...        먼저 값이 있는지 봅니다.
//                         null 이면 여기서 멈춰서 뒤를 아예 확인 안 합니다.
//   ② typeof ... string   글자인지 봅니다.
//   ③ !== " "             공백만 있는 건 아닌지 봅니다.
//
// ①을 빼면 어떻게 되나
//   input3 은 null 인데 typeof null 은 "object" 라서 ②에서 걸러지긴 합니다.
//   하지만 값이 있는지 먼저 보는 습관을 들이는 게 안전합니다.
//   07단원에서 null.속성 을 읽다 터지는 에러를 만나면 이 습관이 살립니다.
//
// [한계] " " 와 직접 비교하는 건 공백 하나만 잡습니다.
//   공백 두 개("  ")면 통과해 버립니다.
//   10단원에서 trim() 을 배우면 이렇게 씁니다.
//     input.trim() !== ""     ← 공백이 몇 개든 전부 잡힙니다
