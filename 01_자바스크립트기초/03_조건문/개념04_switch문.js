// ============================================================
// 03단원 · 개념 04 — switch 문
// ------------------------------------------------------------
// 실행: node 개념04_switch문.js
// ============================================================
//
// "값이 A면 이거, B면 저거, C면 그거" 처럼
// 하나의 값을 여러 값과 하나씩 맞춰 볼 때 쓰는 문법입니다.
//
//     switch (검사할값) {
//       case 값1:
//         실행할 코드;
//         break;
//       case 값2:
//         실행할 코드;
//         break;
//       default:
//         아무것도 안 맞을 때;
//     }


// ── 섹션 1: 기본 형태 ──

const menu = "라떼";

switch (menu) {
  case "아메리카노":
    console.log("4000원입니다");
    break;
  case "라떼":
    console.log("4500원입니다");
    break;
  case "케이크":
    console.log("6000원입니다");
    break;
  default:
    console.log("메뉴에 없습니다");
}
// 출력: 4500원입니다

// 읽는 법
//   switch 괄호 안의 값을 위에서부터 case 값과 하나씩 비교합니다.
//   같은 case 를 만나면 거기서부터 실행합니다.
//   break 를 만나면 switch 를 빠져나옵니다.
//   끝까지 못 만나면 default 를 실행합니다.

// ✏️ 직접 해보기 1 — 요일이 "월" 이면 "한 주 시작", "금" 이면 "불금",
//                    그 외엔 "평범한 날" 을 출력하는 switch 를 써 보세요. (요일은 "금")


// ── 섹션 2: break 를 빠뜨리면 아래로 흘러내린다 ──

// break 가 없으면 다음 case 로 그냥 넘어가서 계속 실행됩니다.
// 이걸 fall-through(흘러내림)라고 합니다.

const grade = "B";

switch (grade) {
  case "A":
    console.log("A 실행");
  case "B":
    console.log("B 실행");
  case "C":
    console.log("C 실행");
  default:
    console.log("default 실행");
}
// 출력: B 실행
// 출력: C 실행
// 출력: default 실행

// B 에서 시작했지만 break 가 없어서 아래까지 전부 실행됐습니다.
// 대부분 이건 실수입니다. case 마다 break 를 꼭 쓰세요.

// ✏️ 직접 해보기 2 — 위 코드에 break 를 넣어 "B 실행" 만 나오게 고쳐 보세요.


// ── 섹션 3: 흘러내림을 일부러 쓰기 — 여러 case 묶기 ──

// 여러 값을 똑같이 처리하고 싶을 때는 일부러 break 를 생략합니다.

const day = "토";

switch (day) {
  case "토":
  case "일":
    console.log("주말입니다");
    break;
  case "월":
  case "화":
  case "수":
  case "목":
  case "금":
    console.log("평일입니다");
    break;
  default:
    console.log("잘못된 요일입니다");
}
// 출력: 주말입니다

// case "토": 아래에 아무 코드도 없으니 바로 case "일": 로 흘러내려
// "주말입니다" 를 실행합니다. 이 형태는 실수가 아니라 정식 사용법입니다.

// ✏️ 직접 해보기 3 — 등급이 "A", "B" 면 "합격", "C", "D" 면 "재시험" 을
//                    출력하는 switch 를 써 보세요. (등급은 "C")


// ── 섹션 4: default — 아무것도 안 맞을 때 ──

// default 는 "아무것도 안 맞을 때"입니다. 생략할 수도 있습니다.
const pay = "현금";

switch (pay) {
  case "카드":
    console.log("카드 결제");
    break;
  case "간편결제":
    console.log("간편 결제");
    break;
}
// (현금은 어느 case 에도 안 맞고 default 도 없어서 아무것도 출력되지 않습니다)

console.log("결제 처리 끝");
// 출력: 결제 처리 끝

// 하지만 default 는 웬만하면 쓰세요.
// "예상 못 한 값이 들어왔다"를 알려 주는 안전장치가 됩니다.
switch (pay) {
  case "카드":
    console.log("카드 결제");
    break;
  default:
    console.log("지원하지 않는 결제수단:", pay);
}
// 출력: 지원하지 않는 결제수단: 현금


// ── 섹션 5: switch 는 === 로 비교한다 ──

// 아주 중요합니다. switch 는 자료형까지 따지는 === 로 비교합니다.

const inputNumber = "3"; // 입력창에서 온 값이라 문자열

switch (inputNumber) {
  case 3:
    console.log("숫자 3");
    break;
  case "3":
    console.log("문자열 3");
    break;
}
// 출력: 문자열 3
// 숫자 3 이 아니라 문자열 "3" 에 걸립니다.

// 그래서 입력값을 숫자로 다루려면 먼저 바꿔야 합니다.
switch (Number(inputNumber)) {
  case 3:
    console.log("Number 로 바꾸니 숫자 3");
    break;
}
// 출력: Number 로 바꾸니 숫자 3

// ✏️ 직접 해보기 4 — "2" 라는 문자열을 숫자 case 2 에 걸리게 하려면
//                    어떻게 고쳐야 할지 써 보세요.


// ── 섹션 6: switch 와 else if, 언제 무엇을? ──

// switch 는 "하나의 값"을 "여러 값"과 맞춰 볼 때만 쓸 수 있습니다.
// 범위 판단(>= 같은 것)은 못 합니다.

const score = 85;

// [불가능] switch 로 범위를 나눌 수는 없습니다
// switch (score) { case >= 90: ... }   ← SyntaxError

// [범위는 else if 로]
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}
// 출력: B

// 정리:
//   값이 딱 정해져 있다 (요일, 메뉴, 등급 문자)  → switch 가 읽기 좋다
//   범위나 복잡한 조건 (>=, &&, ||)             → if / else if 만 가능


// ── 섹션 7: 자주 하는 실수 ──

// ★ 아래에서 SyntaxError 라고 적힌 것은 눈으로만 보세요. 주석을 풀지 마세요.
//   다른 에러(ReferenceError, TypeError)는 주석을 풀어도
//   그 줄에서만 나고 그 앞의 출력은 그대로 다 나옵니다.
//   그런데 SyntaxError 는 다릅니다. 자바스크립트가 파일을 아예 못 읽어서
//   출력이 한 줄도 안 나옵니다. 여러분이 망가뜨린 것이 아닙니다.
//   실수로 풀었다면 다시 // 를 붙이면 그대로 돌아옵니다.

// [실수 1] break 빠뜨리기 (섹션 2에서 봤습니다)

// [실수 2] case 뒤에 콜론이 아니라 세미콜론
// case "A";   ← SyntaxError. 콜론( : )이어야 합니다.

// [실수 3] switch 괄호 안에 조건식을 넣기
const age = 20;
switch (age >= 19) {
  case true:
    console.log("성인");
    break;
  case false:
    console.log("미성년자");
    break;
}
// 출력: 성인
// 문법 오류는 아니고 동작도 합니다. 다만 이렇게 쓸 거면
// if / else 가 훨씬 읽기 쉽습니다. 굳이 switch 를 쓰지 마세요.

// [실수 4] case 안에서 만든 변수가 충돌
// case 마다 중괄호가 없어서 같은 이름을 두 번 만들면 에러가 납니다.
// 필요하면 case 안을 중괄호로 감싸세요.
const type = "A";
switch (type) {
  case "A": {
    const message = "A 타입";
    console.log(message);
    break;
  }
  case "B": {
    const message = "B 타입"; // 중괄호가 있어서 충돌하지 않습니다
    console.log(message);
    break;
  }
}
// 출력: A 타입


// ── 정리 ──

// 1. switch (값) { case 값1: ... break; default: ... }
// 2. break 를 빠뜨리면 아래 case 로 흘러내린다.
// 3. 여러 case 를 묶을 때는 일부러 break 를 생략한다.
// 4. switch 는 === 로 비교한다. "3" 과 3 은 다르다.
// 5. 범위 판단은 switch 로 못 한다. else if 를 쓴다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const weekday = "금";
//    switch (weekday) {
//      case "월":
//        console.log("한 주 시작");
//        break;
//      case "금":
//        console.log("불금");
//        break;
//      default:
//        console.log("평범한 날");
//    }
//    // 출력: 불금
//
// 2) case 마다 break; 를 넣으면 됩니다.
//    switch (grade) {
//      case "A":
//        console.log("A 실행");
//        break;
//      case "B":
//        console.log("B 실행");
//        break;
//      ...
//    }
//    // 출력: B 실행
//
// 3) const g = "C";
//    switch (g) {
//      case "A":
//      case "B":
//        console.log("합격");
//        break;
//      case "C":
//      case "D":
//        console.log("재시험");
//        break;
//    }
//    // 출력: 재시험
//
// 4) switch (Number(inputNumber)) { case 2: ... }
//    검사할 값을 Number( ) 로 감싸서 숫자로 바꾼 뒤 비교하면 됩니다.
