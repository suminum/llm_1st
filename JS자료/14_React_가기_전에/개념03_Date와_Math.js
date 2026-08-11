// ============================================================
// 14단원 · 개념 03 — 날짜와 무작위 (Date, Math.random)
// ------------------------------------------------------------
// 실행: node 개념03_Date와_Math.js
// ============================================================
//
// 지금까지 만든 예제는 값이 항상 정해져 있었습니다.
// 실제 앱에는 '지금 몇 시인지', '무작위로 하나 골라 줘' 같은 게 늘 필요합니다.
//   할 일에 등록 날짜 붙이기 / 오늘의 추천 메뉴 / 주사위 / 로또 번호
//
// 두 가지만 알면 됩니다. Date 와 Math.random 입니다.
//
// [먼저 알아둘 것] 이 파일에는 '출력:' 이 없는 console.log 가 몇 개 있습니다.
// 실행할 때마다 값이 달라지는 것들이라 적어 둘 수가 없습니다.
// 그런 줄에는 대신 "실행할 때마다 다릅니다" 라고 적어 두었습니다.

// ── 섹션 1: Math.random — 0 이상 1 미만 ──

// 괄호 안에 아무것도 안 넣습니다. 부를 때마다 다른 소수가 나옵니다.
//
//     console.log(Math.random());
//     → 0.5488135039273248  처럼 나옵니다. 실행할 때마다 다릅니다.
//
// 이 자료의 다른 줄들은 '출력:' 에 적힌 값이 항상 똑같이 나옵니다.
// 그런데 무작위 값은 매번 달라서 적어 둘 수가 없습니다.
// 그래서 이 파일에서는 무작위 값 자체를 찍는 대신,
// "범위 안에 들어왔는가" 처럼 항상 같은 답이 나오는 것을 찍습니다.
// 진짜 값이 궁금하면 ✏️ 에서 직접 찍어 보세요.

// 딱 세 가지만 기억하면 됩니다.
//   ① 0 은 나올 수 있다
//   ② 1 은 절대 안 나온다
//   ③ 항상 소수다 (정수가 필요하면 우리가 바꿔야 한다)

// 확인해 봅시다. 이건 언제 실행해도 결과가 같습니다.
const r = Math.random();
console.log(r >= 0 && r < 1);
// 출력: true

console.log(typeof Math.random());
// 출력: number

// ✏️ 직접 해보기 1 — Math.random() 을 세 번 찍어 보고 값이 다 다른지 보세요.

// ── 섹션 2: 원하는 범위의 정수 만들기 ──

// 0~1 사이 소수만으로는 쓸 데가 없습니다. 주사위를 만들어 봅시다.
//
//   Math.random()        0 이상 1 미만의 소수
//   * 6                  0 이상 6 미만의 소수   → 0.0 ~ 5.999...
//   Math.floor(...)      소수점 버림           → 0, 1, 2, 3, 4, 5
//   + 1                  1 부터 시작하게       → 1, 2, 3, 4, 5, 6

const dice = Math.floor(Math.random() * 6) + 1;
console.log(dice >= 1 && dice <= 6);
// 출력: true

// 공식으로 외워 두면 편합니다.
//
//     Math.floor(Math.random() * (최대 - 최소 + 1)) + 최소
//
// 1~45 (로또 번호 하나) 라면 최소 1, 최대 45 이므로
//     Math.floor(Math.random() * 45) + 1

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const lotto = randomInt(1, 45);
console.log(lotto >= 1 && lotto <= 45);
// 출력: true

console.log(Number.isInteger(lotto));
// 출력: true
// Math.floor 를 거쳤으니 소수가 아니라 정수입니다.

// ✏️ 직접 해보기 2 — randomInt 로 10~20 사이 숫자를 만들어
//                    범위 안에 들어오는지 확인해 보세요.

// ── 섹션 3: 배열에서 하나 무작위로 뽑기 ──

// 인덱스를 무작위로 만들면 됩니다. 인덱스는 0부터 length-1 까지죠. (06단원)
const menus = ["김치찌개", "제육볶음", "냉면", "돈까스"];

const pickedIndex = Math.floor(Math.random() * menus.length);
const picked = menus[pickedIndex];

console.log(menus.includes(picked));
// 출력: true
// 뽑은 것이 원래 배열 안에 있는 값입니다.

console.log(picked === undefined);
// 출력: false
// 범위를 벗어나지 않았다는 뜻입니다.

// 여기서 * menus.length 인 것이 중요합니다. + 1 을 하면 안 됩니다.
//   길이가 4면 인덱스는 0,1,2,3 입니다. 4는 없습니다.
//   Math.random() * 4 는 0 이상 4 미만이라 딱 맞습니다.

// 함수로 만들어 두면 어디서든 씁니다.
function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

console.log(typeof pickOne(menus));
// 출력: string

// ✏️ 직접 해보기 3 — pickOne 으로 오늘의 점심을 다섯 번 뽑아 출력해 보세요.

// ── 섹션 4: Date — 날짜와 시간 ──

// 괄호를 비우면 '지금' 입니다.
const now = new Date();
console.log(now.getFullYear() >= 2024);
// 출력: true

// 09단원에서 본 new 입니다. "이 설계도로 새것을 하나 만들어라" 였죠.
//     new Date()  →  날짜 객체를 하나 만들어라

// 특정 날짜를 만들 수도 있습니다. 이건 값이 고정이라 결과가 항상 같습니다.
const someday = new Date(2026, 7, 11, 14, 30);
//                       ────  ─  ──  ──  ──
//                        년   월  일  시  분

console.log(someday.getFullYear());
// 출력: 2026
console.log(someday.getDate());
// 출력: 11
console.log(someday.getHours(), someday.getMinutes());
// 출력: 14 30

// ★ 여기가 가장 많이 틀리는 곳입니다.
console.log(someday.getMonth());
// 출력: 7
// 8월인데 7이 나옵니다! 월은 0부터 셉니다. (0=1월, 7=8월)
// 배열 인덱스처럼 0부터라고 생각하세요.

console.log(someday.getMonth() + 1);
// 출력: 8
// 사람에게 보여 줄 때는 +1 을 해야 합니다.

// 요일도 0부터입니다. 0=일요일, 1=월요일 ... 6=토요일
console.log(someday.getDay());
// 출력: 2
// 2는 화요일입니다. 2026년 8월 11일은 화요일입니다.

// ✏️ 직접 해보기 4 — 자기 생일로 Date 를 만들고, 무슨 요일이었는지 숫자로 출력해 보세요.
//                    (월은 실제 월보다 1 작게 넣어야 합니다)

// ── 섹션 5: 사람이 읽을 수 있게 ──

// getMonth() + 1 을 매번 하기는 번거롭습니다. 한국식으로 바꿔 주는 게 있습니다.
console.log(someday.toLocaleDateString("ko-KR"));
// 출력: 2026. 8. 11.

console.log(someday.toLocaleTimeString("ko-KR"));
// 출력: 오후 2:30:00

// 요일 이름도 받을 수 있습니다.
console.log(someday.toLocaleDateString("ko-KR", { weekday: "long" }));
// 출력: 화요일

// 직접 조립해도 됩니다. 배운 것만으로 충분합니다.
const y = someday.getFullYear();
const m = someday.getMonth() + 1;
const d = someday.getDate();
console.log(`${y}년 ${m}월 ${d}일`);
// 출력: 2026년 8월 11일

// 앞에 0을 붙이고 싶으면 (08월 처럼) padStart 를 씁니다.
console.log(String(m).padStart(2, "0"));
// 출력: 08
// "글자 수가 2가 될 때까지 앞을 0으로 채워라" 라는 뜻입니다.

// ✏️ 직접 해보기 5 — someday 를 "2026-08-11" 형태로 만들어 출력해 보세요.
//                    (힌트: padStart 를 월과 일에 각각 쓰고 - 로 이으세요)

// ── 섹션 6: 날짜 사이의 차이 ──

// 날짜끼리 빼면 '밀리초' 단위 숫자가 나옵니다.
const start = new Date(2026, 7, 11);
const end = new Date(2026, 7, 20);

console.log(end - start);
// 출력: 777600000
// 밀리초라 숫자가 큽니다. 사람이 읽을 수 있게 바꿔야 합니다.

// 1초 = 1000, 1분 = 60초, 1시간 = 60분, 1일 = 24시간
const oneDay = 1000 * 60 * 60 * 24;
console.log((end - start) / oneDay);
// 출력: 9
// 9일 차이입니다.

// "며칠 남았나" 를 구할 때 이 방법을 씁니다.
// 시간까지 들어 있으면 소수가 나오니 Math.floor 나 Math.round 로 다듬으세요.

// ✏️ 직접 해보기 6 — 2026년 1월 1일과 2026년 12월 31일 사이가 며칠인지 구해 보세요.

// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] getMonth 를 그대로 씀
console.log(`${someday.getMonth()}월`);
// 출력: 7월
// 실수: 8월인데 7월이라고 나옵니다. +1 을 빠뜨린 것입니다. 가장 흔한 실수입니다.

// [실수 2] new 를 빼먹음
// const bad = Date();
// 실수: 에러는 안 나지만 날짜 객체가 아니라 '글자' 가 나옵니다.
//       getFullYear 같은 걸 부르면 TypeError 가 납니다. new 를 꼭 붙이세요.

// [실수 3] Math.random 에 괄호를 안 붙임
console.log(typeof Math.random);
// 출력: function
// 실수: 괄호가 없으면 함수 그 자체입니다. 08·11단원에서 계속 본 그 실수입니다.

// [실수 4] Math.floor 를 안 함
const wrongDice = Math.random() * 6 + 1;
console.log(Number.isInteger(wrongDice));
// 출력: false
// 실수: 3.7 같은 소수가 나옵니다. 주사위에 3.7은 없죠. floor 로 버려야 합니다.

// [실수 5] 배열 뽑기에서 length 에 +1
// const bad2 = menus[Math.floor(Math.random() * (menus.length + 1))];
// 실수: 가끔 undefined 가 나옵니다. 없는 인덱스를 골랐기 때문입니다.
//       에러가 안 나서 원인을 찾기 어렵습니다. length 그대로 쓰세요.

// ── 정리 ──

// 1. Math.random() 은 0 이상 1 미만의 소수. 1은 안 나온다.
// 2. 정수 범위: Math.floor(Math.random() * (최대 - 최소 + 1)) + 최소
// 3. 배열에서 뽑기: list[Math.floor(Math.random() * list.length)]  — +1 하지 않는다
// 4. new Date() 는 지금. new Date(년, 월, 일) 로 특정 날짜.
// 5. getMonth() 는 0부터. 보여 줄 때는 +1 을 한다. getDay() 는 0=일요일.
// 6. toLocaleDateString("ko-KR") 로 한국식 표기. padStart(2, "0") 로 0 채우기.
// 7. 날짜끼리 빼면 밀리초. 1000*60*60*24 로 나누면 일수.

// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) console.log(Math.random());
//    console.log(Math.random());
//    console.log(Math.random());
//    → 세 번 다 다른 소수가 나옵니다. 같은 값이 나오는 일은 사실상 없습니다.
//
// 2) const n = randomInt(10, 20);
//    console.log(n, n >= 10 && n <= 20);
//    // 출력: (매번 다른 숫자) true
//
// 3) for (let i = 0; i < 5; i++) {
//      console.log(pickOne(menus));
//    }
//    → 같은 메뉴가 연달아 나올 수도 있습니다. 무작위라 정상입니다.
//
// 4) const birthday = new Date(2005, 2, 15);   // 2005년 3월 15일
//    console.log(birthday.getDay());
//    // 출력: 2   (화요일)
//    → 월에 2를 넣은 것에 주의하세요. 3월이라서 3-1=2 입니다.
//
// 5) const mm = String(someday.getMonth() + 1).padStart(2, "0");
//    const dd = String(someday.getDate()).padStart(2, "0");
//    console.log(`${someday.getFullYear()}-${mm}-${dd}`);
//    // 출력: 2026-08-11
//
// 6) const jan1 = new Date(2026, 0, 1);
//    const dec31 = new Date(2026, 11, 31);
//    console.log((dec31 - jan1) / (1000 * 60 * 60 * 24));
//    // 출력: 364
//    → 365일이 아니라 364입니다. 1월 1일 '부터' 세면 365일째가 12월 31일이지만,
//      두 날짜의 '차이' 는 364일입니다. 하루 차이가 나는 흔한 함정입니다.
