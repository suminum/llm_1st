// ============================================================
// 02단원 · 개념 03 — any 는 왜 금지인가  ★ 이 자료의 규칙 하나
// ------------------------------------------------------------
// 실행: node 개념03_any는_왜_금지인가.ts
// 검사: npm run typecheck
// ============================================================
//
// 타입 에러가 나면 반드시 이런 유혹이 옵니다.
//
//     "귀찮은데 any 라고 적으면 에러가 없어진대"
//
// 없어집니다. 진짜 없어집니다. 그래서 위험합니다.
//
// 이 자료에는 규칙이 하나 있습니다.
//
//     ★ any 를 쓰지 않습니다.
//
// 이 파일은 그 이유를 보여 줍니다. 이유를 알아야 안 쓰게 됩니다.


// ── 섹션 1: any 는 타입 검사를 '끄는' 스위치다 ──

const data: any = { name: "봄날카페" };

// any 를 붙이면 이 값에 대해서는 타입스크립트가 아무것도 안 봅니다.
// 아래 줄들이 전부 검사를 통과합니다. 하나도 안 걸립니다.

console.log(data.name);
// 출력: 봄날카페

console.log(typeof data.존재하지않는속성);
// 출력: undefined
// 없는 이름인데 아무 말이 없습니다. TS2339 가 안 납니다.

const asNumber: number = data;
console.log(typeof asNumber);
// 출력: object
// 객체를 number 자리에 넣었는데 통과했습니다.
// : number 라고 적어 놓은 것이 완전히 무의미해졌습니다.

// any 는 "이 값은 검사하지 마세요" 라는 뜻입니다.
// 타입을 적는 것이 아니라, 타입 검사를 끄는 것입니다.

// ✏️ 직접 해보기 1 — const x: any = "글자"; 를 만들고
//    x.toFixed(2) 를 써 보세요. 검사는 통과하나요? 실행하면 어떻게 되나요?


// ── 섹션 2: 검사를 껐으니 실행할 때 터진다 ──

// 01단원에서 "타입스크립트는 실행 전에 잡아 준다" 고 배웠습니다.
// any 를 쓰면 그 보호가 사라지고, JS 로 되돌아갑니다.

try {
  console.log(data.price.toFixed(2));
} catch (e) {
  console.log("터졌습니다:", String(e));
}
// 출력: 터졌습니다: TypeError: Cannot read properties of undefined (reading 'toFixed')

// data 에 price 가 없으니 data.price 는 undefined 이고,
// undefined 에 .toFixed 를 부르니 터졌습니다.
//
// 중요한 것은 이겁니다 —
//
//     이 줄은 타입 검사를 통과했습니다.
//     npx tsc --noEmit 이 조용했습니다.
//     그런데 실행하니 터졌습니다.
//
// 01단원 개념02에서 본 "돌아가는데 검사는 걸린다" 의 정반대입니다.
// 이번엔 "검사는 통과하는데 돌리면 터진다" 입니다. 이쪽이 훨씬 나쁩니다.

// ✏️ 직접 해보기 2 — 위 try 를 지우고 그냥 console.log(data.price.toFixed(2)) 를
//    써 보세요. 프로그램이 어디까지 돌아가는지 확인한 뒤 되돌리세요.


// ── 섹션 3: any 는 옆으로 번진다 ──

// 이게 any 의 진짜 문제입니다. 한 군데만 끄고 끝나지 않습니다.

const settings: any = { theme: "dark", fontSize: 14 };

// any 에서 점( . )으로 꺼낸 값도 any 가 됩니다.
const theme = settings.theme; // 이것도 any
const upper = theme.toUpperCase(); // 이것도 any

console.log(upper);
// 출력: DARK

// upper 는 실제로는 문자열인데 타입은 any 입니다. 그래서 이런 것도 통과합니다.
console.log(upper.toFixed === undefined);
// 출력: true
// 문자열에 toFixed(숫자 전용)가 있는지 물어봤는데 아무도 안 막았습니다.

// 아무리 깊이 들어가도 마찬가지입니다.
console.log(typeof settings.없는것?.더없는것);
// 출력: undefined
// settings.없는것.더없는것 이라고 써도 검사는 통과합니다.
// (실행하면 터지니까 여기서는 ?. 를 붙여 두었습니다)

// 그림으로 보면 이렇습니다.
//
//     settings(any) ──.theme──> theme(any) ──.toUpperCase()──> upper(any) ──> ...
//         └─ 여기서 한 번 껐더니 점을 따라 계속 꺼진 채로 흘러갑니다
//
// 처음 한 줄만 any 였는데, 그 값을 파고드는 코드 전체가 검사 밖으로 나갑니다.
// 그래서 "여기 한 군데만" 이 안 됩니다.

// ── 다만, 번짐이 끊기는 자리가 있습니다 ──

// 계산을 거치면 결과는 any 가 아니라 제대로 된 타입이 됩니다.
const doubled = settings.fontSize * 2; // any 가 아니라 number
const label = "테마: " + settings.theme; // any 가 아니라 string

console.log(doubled, label);
// 출력: 28 테마: dark

// * 의 결과는 무조건 숫자이고, 문자열에 + 한 결과는 무조건 문자열이라
// 타입스크립트가 확신할 수 있기 때문입니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(doubled.toUpperCase());
//
// 실수: doubled 는 number 라서 여기서는 정상적으로 막힙니다.
//       "any 가 무조건 끝까지 번진다" 는 아닙니다.
//       점( . )을 따라갈 때 번지고, 계산을 거치면 끊깁니다.

// ✏️ 직접 해보기 3 — settings 의 : any 를 지우고 저장해 보세요.
//    upper.toFixed === undefined 줄이 걸리는지 확인한 뒤 되돌리세요.


// ── 섹션 4: 안 적었는데 any 가 몰래 생기는 곳 ──

// any 라고 쓴 적이 없어도 any 가 들어오는 자리가 있습니다.
// 가장 흔한 것이 JSON.parse 입니다.

const parsed = JSON.parse('{"name":"봄날카페","seats":24}');

// parsed 의 타입은 any 입니다.
// JSON 문자열 안에 뭐가 들었는지는 실행해 봐야 알 수 있으니,
// 타입스크립트가 알아낼 방법이 없어서 any 로 둔 것입니다.

console.log(parsed.name);
// 출력: 봄날카페

console.log(parsed.아무거나 === undefined);
// 출력: true
// 없는 이름인데 통과합니다. any 니까요.

// 서버에서 받아온 데이터가 바로 이 자리입니다.
// fetch 로 받은 것을 .json() 하면 그것도 마찬가지입니다(07단원에서 만납니다).
//
// 그래서 이렇게 하는 것이 실무 방식입니다.
//
//     받자마자 "이런 모양일 것이다" 를 적어 준다
//
// 그 '모양을 적는 법' 이 04단원입니다.

// ✏️ 직접 해보기 4 — parsed.seats + 10 을 출력해 보세요.
//    parsed.seats 가 문자열이었어도 이 줄이 통과할까요?


// ── 섹션 5: any 대신 쓰는 것 — unknown ──

// "정말 뭐가 올지 모르는" 자리에는 any 말고 unknown 을 씁니다.

const mystery: unknown = "사실은 글자입니다";

// unknown 은 any 와 반대입니다. 확인하기 전까지 아무것도 못 하게 막습니다.
//
// 에러: TS18046 'mystery' is of type 'unknown'.
// console.log(mystery.length);
//
// 실수: "뭔지 모른다면서 length 를 쓰시겠다고요?" 라고 막습니다.
//       any 였다면 그냥 통과했을 자리입니다.

// 담는 것도 막습니다.
//
// 에러: TS2322 Type 'unknown' is not assignable to type 'string'.
// const text: string = mystery;

// 그럼 unknown 은 어떻게 쓰나 — 확인하고 나서 씁니다.
if (typeof mystery === "string") {
  console.log(mystery.length);
}
// 출력: 9

// typeof 로 확인한 안쪽에서는 mystery 가 string 인 것을 타입스크립트가 압니다.
// 이것을 '타입 좁히기' 라고 하고 05단원의 주제입니다.
//
// 차이를 한 줄로 하면 이렇습니다.
//
//     any      = 검사하지 마세요            (위험을 넘김)
//     unknown  = 확인한 다음에 쓰겠습니다   (위험을 막음)

// ✏️ 직접 해보기 5 — mystery 에 숫자 42 를 넣고 위 if 를 그대로 두면
//    무엇이 출력될지 예상한 뒤 확인해 보세요.


// ── 섹션 6: 그럼 any 는 절대 안 쓰나 ──

// (✏️ 없음: 규칙의 예외를 설명하는 섹션입니다. 해 볼 것이 없습니다)
// 딱 한 자리에서 씁니다. 08단원의 '기존 JS 프로젝트를 옮길 때' 입니다.
//
// 수천 줄짜리 JS 를 하루아침에 다 고칠 수는 없으니,
// 일단 any 로 막아 두고 한 파일씩 제대로 고쳐 나가는 방법을 씁니다.
// 그때도 "빚을 지는 것" 이라는 표시를 남깁니다.
//
// 그 경우가 아니라면, any 를 쓰고 싶어질 때는 대개 이 셋 중 하나입니다.
//
//     1. 04단원의 '모양 적기' 를 아직 안 배운 것
//     2. 05단원의 '좁히기' 를 아직 안 배운 것
//     3. 06단원의 '제네릭' 을 아직 안 배운 것
//
// 세 개 다 이 자료 안에 있습니다. any 없이 갈 수 있습니다.


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 에러를 없애려고 any 를 붙이기
//   에러가 없어진 게 아니라 검사가 꺼진 것입니다. 문제는 그대로 있습니다.
//   섹션 2에서 본 것처럼 실행할 때 터집니다.

// [실수 2] "한 군데만 any 니까 괜찮겠지"
//   섹션 3을 보세요. 그 값을 쓰는 코드 전체로 번집니다.

// [실수 3] JSON.parse 결과를 그냥 쓰기
//   any 라는 자각 없이 쓰는 가장 흔한 경우입니다.
//   서버 데이터는 04단원에서 모양을 적어 주고 씁니다.

// [실수 4] any 와 unknown 을 같은 것으로 알기
//   정반대입니다. any 는 다 열고, unknown 은 다 막습니다.


// ── 정리 ──

// 1. any 는 타입을 적는 것이 아니라 타입 검사를 끄는 스위치다.
// 2. 검사를 껐으니 실행할 때 터진다. "검사는 통과하는데 돌리면 터진다" 가 된다.
// 3. any 는 점( . )을 따라갈 때 번진다. any 에서 꺼낸 값도 any 다.
//    다만 계산을 거치면 끊긴다 — any * 2 는 number, "글자" + any 는 string.
// 4. JSON.parse 결과처럼 안 적었는데 any 인 자리가 있다. 서버 데이터가 대표적이다.
// 5. 정말 모를 때는 any 말고 unknown. 확인한 뒤에 쓰게 강제한다.
// 6. any 를 쓰고 싶어지면 04·05·06단원 중 하나를 아직 안 배운 것이다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 검사는 통과합니다. npx tsc --noEmit 이 조용합니다.
//    실행하면 터집니다.
//    TypeError: x.toFixed is not a function
//    문자열에는 toFixed 가 없기 때문입니다.
//    any 를 안 썼다면 TS2339 로 실행 전에 잡혔을 자리입니다.
//
// 2) 거기서 멈춥니다. 그 아래 코드는 하나도 안 돌아갑니다.
//    try 로 감싸면 터진 것을 잡아서 계속 갈 수 있지만,
//    실제 화면에서는 그 지점부터 아무것도 안 그려집니다.
//
// 3) 걸립니다.
//    error TS2551: Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?
//    (Did you mean 'fixed'? 는 무시하세요. 문자열에 옛날 fixed 가 있어서 나온 제안입니다)
//    재현:
//    const settings = { theme: "dark", fontSize: 14 };
//    const theme = settings.theme;
//    const upper = theme.toUpperCase();
//    console.log(upper.toFixed === undefined);
//    : any 를 지우면 { theme: string; fontSize: number } 로 추론되고,
//    theme 이 string, upper 도 string 이 되어 번짐이 사라집니다.
//    세 글자 지웠을 뿐인데 검사가 되살아납니다.
//
// 4) 출력: 34
//    통과합니다. parsed.seats 가 문자열 "24" 였어도 통과합니다.
//    그때는 "2410" 이 나왔을 것입니다(문자열 이어붙이기).
//    any 라서 아무도 안 막아 줍니다. 이게 섹션 4의 요점입니다.
//
// 5) 아무것도 출력되지 않습니다.
//    42 는 문자열이 아니니 if 안으로 안 들어갑니다.
//    unknown 은 이렇게 "확인을 통과한 것만" 쓰게 만듭니다.
