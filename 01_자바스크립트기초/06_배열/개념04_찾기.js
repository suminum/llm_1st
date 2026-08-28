// ============================================================
// 06단원 · 개념 04 — 배열에서 찾기
// ------------------------------------------------------------
// 실행: node 개념04_찾기.js
// ============================================================
//
// "이 값이 배열에 있나?" "몇 번째에 있나?" 를 알아내는 방법입니다.
//
//     includes(값)  있으면 true, 없으면 false
//     indexOf(값)   몇 번째인지. 없으면 -1


// ── 섹션 1: includes — 있는지 없는지 ──

const menu = ["아메리카노", "라떼", "케이크"];

console.log(menu.includes("라떼"));
// 출력: true
console.log(menu.includes("녹차"));
// 출력: false

// 결과가 true / false 라서 조건문에 바로 쓸 수 있습니다.
if (menu.includes("케이크")) {
  console.log("케이크는 판매 중입니다");
}
// 출력: 케이크는 판매 중입니다

if (!menu.includes("녹차")) {
  console.log("녹차는 취급하지 않습니다");
}
// 출력: 녹차는 취급하지 않습니다

// 03단원에서 || 를 길게 이어 쓰던 것을 이렇게 줄일 수 있습니다.
//   before: day === "토" || day === "일"
//   after : ["토", "일"].includes(day)
const day = "일";
console.log(["토", "일"].includes(day));
// 출력: true

// 값이 많아질수록 훨씬 깔끔합니다.
const holiday = "5월 5일";
const holidays = ["1월 1일", "3월 1일", "5월 5일", "8월 15일"];
console.log(holidays.includes(holiday));
// 출력: true

// includes 는 === 로 비교합니다. 자료형이 다르면 못 찾습니다.
console.log([1, 2, 3].includes("2"));
// 출력: false

// ✏️ 직접 해보기 1 — 과일 배열을 만들고 "포도" 가 있는지 확인해 보세요.


// ── 섹션 2: indexOf — 몇 번째인지 ──

const fruits = ["사과", "바나나", "포도", "바나나"];

console.log(fruits.indexOf("바나나"));
// 출력: 1
// 앞에서부터 찾아 처음 만난 위치를 돌려줍니다.

console.log(fruits.indexOf("포도"));
// 출력: 2

// 없으면 -1 입니다. 0이 아니라는 점이 중요합니다.
console.log(fruits.indexOf("귤"));
// 출력: -1

// 왜 -1 일까요? 0은 '첫 번째'라는 진짜 위치이기 때문입니다.
// 그래서 "없음"을 표현할 다른 값이 필요했고 -1 을 쓰기로 한 것입니다.

// lastIndexOf 는 뒤에서부터 찾습니다.
console.log(fruits.lastIndexOf("바나나"));
// 출력: 3

// ✏️ 직접 해보기 2 — 과일 배열에서 "사과" 의 위치를 출력해 보세요.


// ── 섹션 3: indexOf 로 존재 확인하기 (옛날 방식) ──

// includes 가 생기기 전에는 이렇게 썼습니다. 오래된 코드에서 자주 봅니다.
if (fruits.indexOf("포도") !== -1) {
  console.log("포도가 있습니다");
}
// 출력: 포도가 있습니다

// 이 코드는 자주 틀립니다.
if (fruits.indexOf("사과")) {
  console.log("이 줄은 실행되지 않습니다");
}
// 실수: "사과" 는 0번에 있는데, 0 은 falsy 라서 조건이 false 가 됩니다.
//       배열에 있는데도 없다고 판단해 버립니다.

// 그래서 반드시 !== -1 을 붙여야 합니다.
if (fruits.indexOf("사과") !== -1) {
  console.log("사과가 있습니다");
}
// 출력: 사과가 있습니다

// 결론: 있는지만 알면 되면 includes 를 쓰세요. 실수할 일이 없습니다.
//       위치가 필요할 때만 indexOf 를 씁니다.

// ✏️ 직접 해보기 3 — indexOf 로 "귤" 이 없다는 것을 확인하는 if 문을 써 보세요.


// ── 섹션 4: 찾아서 지우기 ──

// indexOf 로 위치를 찾고, splice 로 지우는 조합을 자주 씁니다.
const cart = ["아메리카노", "케이크", "쿠키"];
const targetItem = "케이크";
const targetIndex = cart.indexOf(targetItem);

console.log(targetIndex);
// 출력: 1

if (targetIndex !== -1) {
  cart.splice(targetIndex, 1);
}

console.log(cart);
// 출력: [ '아메리카노', '쿠키' ]

// -1 검사를 빼먹으면 큰일 납니다.
const cart2 = ["아메리카노", "케이크"];
const notFound = cart2.indexOf("녹차"); // -1
cart2.splice(notFound, 1); // splice(-1, 1) → 뒤에서 첫 번째를 지웁니다!
console.log(cart2);
// 출력: [ '아메리카노' ]
// 없는 것을 지우려 했는데 엉뚱한 것이 지워졌습니다.
// 반드시 !== -1 을 확인하고 지우세요.

// ✏️ 직접 해보기 4 — 배열에서 "쿠키" 를 찾아 안전하게 지워 보세요.


// ── 섹션 5: 문자열에서도 똑같이 쓴다 ──

// includes 와 indexOf 는 문자열에도 있습니다. 사용법이 같습니다.
const message = "오늘 날씨가 참 좋습니다";

console.log(message.includes("날씨"));
// 출력: true
console.log(message.includes("비"));
// 출력: false

console.log(message.indexOf("날씨"));
// 출력: 3
// 3번째 글자(0부터 세서)부터 "날씨"가 시작한다는 뜻입니다.

// 검색 기능을 만들 때 이렇게 씁니다.
const keyword = "날씨";
if (message.includes(keyword)) {
  console.log(`"${keyword}" 를 찾았습니다`);
}
// 출력: "날씨" 를 찾았습니다

// 시작·끝 확인용 메소드도 있습니다.
console.log(message.startsWith("오늘"));
// 출력: true
console.log(message.endsWith("좋습니다"));
// 출력: true

// 대소문자를 바꾸는 메소드도 있습니다. 영어에만 효과가 있습니다.
console.log("Hello".toUpperCase());
// 출력: HELLO
console.log("Hello".toLowerCase());
// 출력: hello

// 검색 기능을 만들 때 아주 요긴합니다.
// 사용자가 "APPLE" 이라고 쳐도 "Apple" 을 찾아 줘야 하니까요.
const productName = "Apple iPhone";
const searchWord = "APPLE";

console.log(productName.includes(searchWord));
// 출력: false
// 대소문자가 달라서 못 찾았습니다.

// 양쪽을 다 소문자로 만들어 비교하는 것이 요령입니다.
console.log(productName.toLowerCase().includes(searchWord.toLowerCase()));
// 출력: true

// 원본은 바뀌지 않습니다. 바뀐 새 문자열을 돌려줄 뿐입니다.
console.log(productName);
// 출력: Apple iPhone

// ✏️ 직접 해보기 5 — 이메일 주소 문자열에 "@" 가 들어 있는지 확인해 보세요.


// ── 섹션 6: 조건으로 찾으려면 ──

// includes 와 indexOf 는 '값이 정확히 같은 것'만 찾습니다.
// "80점 넘는 점수를 찾아라" 같은 조건 검색은 못 합니다.

const scores = [55, 90, 72, 88];

// 지금 배운 것으로 하려면 반복문을 써야 합니다.
let found = -1;
for (let i = 0; i < scores.length; i++) {
  if (scores[i] > 80) {
    found = scores[i];
    break;
  }
}
console.log(found);
// 출력: 90

// 08단원에서 배울 find 를 쓰면 이게 한 줄이 됩니다.
console.log(scores.find((score) => score > 80));
// 출력: 90

// 지금은 "정확히 같은 값은 includes / indexOf,
//         조건으로 찾는 건 반복문(나중엔 find)" 로 정리해 두세요.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 없을 때 0이 나온다고 생각하기
console.log(fruits.indexOf("없는과일"));
// 출력: -1
// 실수: 0은 '첫 번째'입니다. 없음은 -1 입니다.

// [실수 2] indexOf 결과를 그대로 조건에 쓰기 (섹션 3에서 봤습니다)

// [실수 3] includes 에 괄호를 빼먹기
console.log(typeof fruits.includes);
// 출력: function
// 실수: 괄호 없이 쓰면 함수 자체가 나옵니다. fruits.includes("사과") 로 쓰세요.

// [실수 4] 자료형이 달라서 못 찾기
const nums = [1, 2, 3];
console.log(nums.includes("1"));
// 출력: false
// 실수: 입력창에서 온 값은 문자열입니다. Number( ) 로 바꾸고 찾으세요.
console.log(nums.includes(Number("1")));
// 출력: true


// ── 정리 ──

// 1. includes(값)  있으면 true — 존재 확인은 이걸 쓴다.
// 2. indexOf(값)   위치. 없으면 -1. 0이 아니다.
// 3. indexOf 결과는 반드시 !== -1 로 비교할 것.
// 4. indexOf + splice 로 '찾아서 지우기'. -1 검사를 꼭 할 것.
// 5. 문자열에도 includes / indexOf / startsWith / endsWith 가 있다.
// 6. 조건으로 찾으려면 반복문(또는 08단원의 find).


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const myFruits = ["사과", "포도", "귤"];
//    console.log(myFruits.includes("포도"));    // 출력: true
//
// 2) console.log(fruits.indexOf("사과"));       // 출력: 0
//
// 3) if (fruits.indexOf("귤") === -1) {
//      console.log("귤이 없습니다");
//    }
//    // 출력: 귤이 없습니다
//
// 4) const box = ["사탕", "쿠키", "젤리"];
//    const idx = box.indexOf("쿠키");
//    if (idx !== -1) {
//      box.splice(idx, 1);
//    }
//    console.log(box);      // 출력: [ '사탕', '젤리' ]
//
// 5) const email = "test@example.com";
//    console.log(email.includes("@"));          // 출력: true
