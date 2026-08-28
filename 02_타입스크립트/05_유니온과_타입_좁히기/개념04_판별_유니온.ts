// ============================================================
// 05단원 · 개념 04 — 판별 유니온: 모양이 여러 가지일 때
// ------------------------------------------------------------
// 실행: node 개념04_판별_유니온.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념01~03은 string | number 처럼 '기본 타입' 의 유니온이었습니다.
// 이번엔 '객체' 의 유니온입니다.
//
// 이름이 어려워 보이지만 하는 일은 단순합니다.
//
//     여러 모양 중 하나가 오는데, 어느 모양인지 알려 주는 표딱지를 하나 붙인다.
//
// 07단원 React 에서 화면 상태를 다룰 때 그대로 씁니다.


// ── 섹션 1: 표딱지가 없으면 못 쓴다 ──

type Dog = { name: string; bark: string };
type Cat = { name: string; meow: string };
type Animal = Dog | Cat;

function printName(a: Animal) {
  console.log(a.name);
}
printName({ name: "바둑이", bark: "멍멍" });
// 출력: 바둑이

// name 은 양쪽에 다 있으니 됩니다(개념01 섹션2의 그 규칙).
//
// 에러: TS2339 Property 'bark' does not exist on type 'Animal'.
// function speakAnyway(a: Animal) {
//   console.log(a.bark);
// }
//
// 실수: 아래에 Property 'bark' does not exist on type 'Cat'. 이 따라옵니다.
//       고양이한테는 bark 가 없으니까요.

// 그럼 어떻게 구분할까요? typeof 로는 안 됩니다. 둘 다 object 니까요.
// in 연산자로 "이 속성이 있느냐" 를 물어볼 수는 있습니다.
function speakByIn(a: Animal) {
  if ("bark" in a) {
    console.log(a.bark);
  } else {
    console.log(a.meow);
  }
}
speakByIn({ name: "바둑이", bark: "멍멍" });
// 출력: 멍멍
speakByIn({ name: "나비", meow: "야옹" });
// 출력: 야옹

// 되기는 하는데 불편합니다.
// 모양이 다섯 개로 늘면 "어느 속성이 어느 모양에만 있는지" 를 다 외워야 합니다.
// 그래서 표딱지를 붙입니다.

// ✏️ 직접 해보기 1 — Animal 에 Bird({ name, tweet })를 추가하고
//    speakByIn 을 고쳐 보세요. 몇 줄이 늘어나나요?


// ── 섹션 2: 표딱지 하나면 끝난다 ──

// 모든 모양에 같은 이름의 속성을 두고, 값만 다르게 합니다.
type DogT = { kind: "dog"; name: string; bark: string };
type CatT = { kind: "cat"; name: string; meow: string };
type BirdT = { kind: "bird"; name: string; tweet: string };
type AnimalT = DogT | CatT | BirdT;

// kind 의 타입이 "dog" 처럼 리터럴인 것이 핵심입니다(개념01 섹션3).
// string 이라고 적으면 아무 소용이 없습니다.

function speak(a: AnimalT) {
  switch (a.kind) {
    case "dog":
      return a.bark;
    case "cat":
      return a.meow;
    case "bird":
      return a.tweet;
  }
}

console.log(speak({ kind: "dog", name: "바둑이", bark: "멍멍" }));
// 출력: 멍멍
console.log(speak({ kind: "bird", name: "짹짹이", tweet: "짹짹" }));
// 출력: 짹짹

// case "dog" 안에서 a 는 DogT 하나로 좁혀집니다.
// 그래서 a.bark 가 통과하고, a.meow 는 걸립니다.
//
// 에러: TS2339 Property 'meow' does not exist on type 'DogT'.
// function speakWrong(a: AnimalT) {
//   switch (a.kind) {
//     case "dog":
//       return a.meow;
//     default:
//       return "";
//   }
// }
//
// 실수: 개 자리에서 고양이 소리를 꺼내려 했습니다.
//       메시지에 'DogT' 라고 정확히 나옵니다. 좁혀졌다는 증거입니다.

// ✏️ 직접 해보기 2 — speak 에 case "cat" 을 지워 보세요.
//    무슨 에러가 나나요? (개념02 섹션2와 같은 것입니다)


// ── 섹션 3: 실전 — 화면 상태 다루기 ★ ──

// 이 패턴을 실제로 가장 많이 쓰는 곳입니다.
// 서버에서 데이터를 받아 오는 화면은 언제나 세 상태 중 하나입니다.
type Menu = { name: string; price: number };

type LoadState =
  | { status: "로딩중" }
  | { status: "성공"; data: Menu[] }
  | { status: "실패"; message: string };

function render(state: LoadState): string {
  switch (state.status) {
    case "로딩중":
      return "불러오는 중...";
    case "성공":
      return state.data.length + "개 메뉴";
    case "실패":
      return "오류: " + state.message;
  }
}

console.log(render({ status: "로딩중" }));
// 출력: 불러오는 중...
console.log(render({ status: "성공", data: [{ name: "라떼", price: 4500 }] }));
// 출력: 1개 메뉴
console.log(render({ status: "실패", message: "서버가 응답하지 않습니다" }));
// 출력: 오류: 서버가 응답하지 않습니다

// 이 방식이 왜 좋은지 비교해 보면 분명해집니다.
//
// [옛날 방식] 속성을 다 늘어놓고 선택으로 만든다
//
//     type BadState = {
//       loading: boolean;
//       data?: Menu[];
//       error?: string;
//     };
//
//   이러면 이런 것들이 전부 만들어집니다.
//
//     { loading: true, data: [...], error: "실패" }   ← 로딩 중인데 성공이고 실패?
//     { loading: false }                              ← 다 끝났는데 결과가 없다?
//
//   말이 안 되는 조합인데 타입은 다 통과시킵니다.
//   그리고 data 와 error 가 선택 속성이라 쓸 때마다 확인해야 합니다.
//
// [판별 유니온] 있을 수 없는 조합은 아예 못 만든다
//
//     "성공" 이면 data 가 반드시 있고, message 는 아예 없습니다.
//     "로딩중" 이면 data 도 message 도 없습니다.
//     확인 없이 state.data 를 바로 쓸 수 있습니다.

// 에러: TS2353 Object literal may only specify known properties, and 'message' does not exist in type '{ status: "성공"; data: Menu[]; }'.
// const impossible: LoadState = { status: "성공", data: [], message: "실패" };
//
// 실수: 성공인데 오류 메시지가 있는 상태를 아예 못 만듭니다.
//       "잘못된 상태를 표현할 수 없게 만든다" — 이게 이 패턴의 핵심 이득입니다.

// ✏️ 직접 해보기 3 — { status: "성공" } 만 써 보세요(data 없이).
//    무슨 에러가 나나요?


// ── 섹션 4: 빠뜨린 경우를 잡아 주는 장치 ──

// 개념02 섹션2에서 봤듯이, 반환 타입을 적어 두면
// case 를 빠뜨렸을 때 TS2366 으로 걸립니다.
//
// 그런데 함수가 아무것도 안 돌려주는 경우(void)에는 그 장치가 안 먹습니다.
// 그럴 때 쓰는 방법이 있습니다. 참고로 알아 두세요.

function log(state: LoadState): void {
  switch (state.status) {
    case "로딩중":
      console.log("...");
      break;
    case "성공":
      console.log("완료:", state.data.length);
      break;
    case "실패":
      console.log("오류:", state.message);
      break;
    default: {
      // 여기까지 오면 안 됩니다. 다 덮었다면 남는 것이 없으니까요.
      const 남은것: never = state;
      console.log("모르는 상태:", 남은것);
    }
  }
}

log({ status: "성공", data: [] });
// 출력: 완료: 0

// never 는 "값이 있을 수 없는 타입" 입니다.
// case 를 다 적었다면 default 에 도달했을 때 남는 타입이 없어서 never 가 되고,
// 통과합니다.
//
// 하나라도 빠뜨리면 그 남은 타입이 never 에 안 들어가서 걸립니다.
// 상태를 하나 추가했을 때 "여기도 고쳐야 한다" 를 자동으로 알려 주는 장치입니다.
//
// 지금 당장 외울 필요는 없습니다.
// "다 덮었는지 확인하는 관용구가 있다" 정도만 기억하세요.

// ✏️ 직접 해보기 4 — LoadState 에 { status: "취소" } 를 추가해 보세요.
//    render 와 log 중 어느 것이 걸리나요? 둘 다 걸리나요?


// ── 섹션 5: 표딱지 이름 정하기 ──

// 이름은 아무거나 됩니다. 관행은 이렇습니다.
//
//     kind    · type    · status    · tag
//
// 이 자료는 상황에 맞춰 씁니다. 상태를 나타내면 status, 종류면 kind 입니다.
//
// 중요한 것은 이름이 아니라 두 가지입니다.
//
//   ① 모든 모양에 '같은 이름' 으로 있어야 한다
//   ② 값이 리터럴 타입이어야 한다 ("dog" 이지 string 이 아님)
//
// ② 를 어기면 조용히 망가집니다.
type LooseDog = { kind: string; bark: string };
type LooseCat = { kind: string; meow: string };
type LooseAnimal = LooseDog | LooseCat;

// 에러: TS2339 Property 'bark' does not exist on type 'LooseAnimal'.
// function looseSpeak(a: LooseAnimal) {
//   if (a.kind === "dog") {
//     return a.bark;
//   }
//   return "";
// }
//
// 실수: kind 가 string 이라 "dog" 와 비교해도 좁혀지지 않습니다.
//       string 은 "dog" 일 수도 있고 "cat" 일 수도 있으니 구분이 안 되는 것입니다.
//       type 을 적을 때 kind: "dog" 처럼 값을 그대로 적어야 합니다.

// ✏️ 직접 해보기 5 — LooseDog 의 kind 를 "dog", LooseCat 을 "cat" 으로 고쳐 보세요.
//    위 함수가 통과하나요?


// ── 섹션 6: 확인을 함수로 빼기 — a is DogT ──

// 지금까지 좁히는 조건은 쓸 때마다 그 자리에 적었습니다.
// 같은 확인을 여러 군데서 하게 되면 함수로 빼고 싶어집니다.
// 그런데 그냥 빼면 좁히기가 사라집니다.

function looksLikeDog(a: AnimalT): boolean {
  return a.kind === "dog";
}

console.log(looksLikeDog({ kind: "dog", name: "바둑이", bark: "멍멍" }));
// 출력: true

// 에러: TS2339 Property 'bark' does not exist on type 'AnimalT'.
// function barkOf1(a: AnimalT) {
//   if (looksLikeDog(a)) return a.bark;
//   return "";
// }
//
// 실수: looksLikeDog 는 true / false 만 돌려줍니다.
//       "그 true 가 무슨 뜻인지" 는 어디에도 안 적혀 있습니다.
//       그래서 if 안으로 들어가도 a 는 여전히 AnimalT 입니다.

// 반환 타입을 boolean 대신 a is DogT 라고 적으면 뜻이 붙습니다.

function isDog(a: AnimalT): a is DogT {
  return a.kind === "dog";
}

function barkOf(a: AnimalT): string {
  if (isDog(a)) {
    return a.bark; // 여기서는 DogT 입니다
  }
  return "(개가 아님)";
}

console.log(barkOf({ kind: "dog", name: "바둑이", bark: "멍멍" }));
// 출력: 멍멍
console.log(barkOf({ kind: "cat", name: "나비", meow: "야옹" }));
// 출력: (개가 아님)

// a is DogT 는 "이 함수가 true 를 주면 a 는 DogT 다" 라는 뜻입니다.
// 이름이 붙은 좁히기라고 보면 됩니다. 05단원 내내 손으로 하던 일을 함수로 포장한 것입니다.
// 확인이 길어지거나 여러 곳에서 같은 확인을 할 때 씁니다.

// ★ 주의 — 몸통이 정말 맞는지는 타입스크립트가 확인하지 않습니다.
//   return a.kind === "cat"; 이라고 적어도 조용히 통과합니다.
//   08단원에서 배울 as 와 같은 종류의 '약속' 입니다.
//   그래서 몸통은 짧고 뻔하게 적으세요. 표딱지 하나만 보는 정도가 안전합니다.

// ✏️ 직접 해보기 6 — isDog 의 몸통을 return a.kind === "cat"; 으로 바꾸고
//    barkOf 에 고양이를 넘겨 보세요. 검사는 조용한가요? 실행하면 무엇이 찍히나요?


// ── 섹션 7: 자주 하는 실수 ──

// [실수 1] 표딱지 값을 string 으로 적기
//   섹션 5입니다. 가장 흔하고, 가장 찾기 어려운 실수입니다.
//   "분명히 if 로 확인했는데 왜 안 되지?" 싶으면 여기를 보세요.

// [실수 2] 표딱지 이름을 모양마다 다르게 쓰기
//   하나는 kind, 하나는 type 이면 공통 속성이 아니라서 못 씁니다.

// [실수 3] 선택 속성으로 상태를 표현하기
//   섹션 3의 BadState 입니다. 있을 수 없는 조합이 만들어지고
//   쓸 때마다 확인해야 합니다.

// [실수 4] switch 에 break 를 빠뜨리기
//   return 을 쓰면 상관없지만, void 함수에서는 아래 case 로 흘러갑니다.
//   JS자료 03단원에서 배운 그대로입니다. 타입스크립트도 이건 안 막아 줍니다.


// ── 정리 ──

// 1. 객체 여러 모양 중 하나가 올 때, 모든 모양에 같은 이름의 표딱지를 둔다.
// 2. 표딱지 값은 반드시 리터럴이어야 한다. "dog" 이지 string 이 아니다.
// 3. switch (a.kind) 하면 각 case 안에서 그 모양 하나로 좁혀진다.
// 4. 가장 큰 이득은 '있을 수 없는 상태를 아예 못 만드는 것' 이다.
//    로딩중인데 데이터가 있는 상태 같은 것이 만들어지지 않는다.
// 5. 선택 속성을 늘어놓는 방식보다 확인할 일이 적다.
// 6. default 에 never 를 두면 빠뜨린 경우를 알려 준다. 관용구로 알아 두면 된다.
// 7. 07단원 React 에서 화면 상태를 이 패턴으로 다룬다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) type Bird = { name: string; tweet: string };
//    type Animal2 = Dog | Cat | Bird;
//    function speakByIn2(a: Animal2) {
//      if ("bark" in a) return a.bark;
//      if ("meow" in a) return a.meow;
//      return a.tweet;
//    }
//    → 한 줄 늘었습니다. 지금은 괜찮아 보이지만,
//      모양이 다섯 개가 되면 "어느 속성이 어느 모양에만 있는지" 를 다 알아야 합니다.
//      표딱지 방식은 kind 하나만 보면 됩니다.
//
// 2) error TS2366: Function lacks ending return statement and return type
//    does not include 'undefined'.
//    "cat" 일 때 돌려줄 것이 없다는 뜻입니다.
//    재현:
//    type DogT = { kind: "dog"; bark: string };
//    type CatT = { kind: "cat"; meow: string };
//    function speak(a: DogT | CatT): string {
//      switch (a.kind) { case "dog": return a.bark; }
//    }
//    반환 타입이 있으면 이렇게 빠뜨린 case 를 잡아 줍니다.
//
// 3) error TS2322: Type '{ status: "성공"; }' is not assignable to type 'LoadState'.
//      Property 'data' is missing in type '{ status: "성공"; }'
//      but required in type '{ status: "성공"; data: Menu[]; }'.
//    재현:
//    type Menu = { name: string; price: number };
//    type LoadState =
//      | { status: "로딩중" }
//      | { status: "성공"; data: Menu[] }
//      | { status: "실패"; message: string };
//    const impossible: LoadState = { status: "성공" };
//    두 줄로 나옵니다. 첫 줄은 "LoadState 에 안 들어간다",
//    둘째 줄이 "왜냐하면 data 가 빠져서" 입니다. 둘째 줄까지 읽어야 답이 나옵니다.
//    (목표가 유니온일 때는 TS2741 이 아니라 TS2322 로 나옵니다.
//     04단원에서 본 단일 타입일 때와 번호가 다릅니다)
//    "성공" 이라고 했으면 data 가 반드시 있어야 합니다.
//    선택 속성이었다면 이 실수가 안 걸렸을 것입니다.
//
// 4) 둘 다 걸립니다.
//    render 는 TS2366(돌려줄 것이 없다),
//    log 는 default 의 never 자리에서
//    TS2322 Type '{ status: "취소"; }' is not assignable to type 'never'.
//    → 상태를 하나 추가하면 고쳐야 할 곳을 타입이 전부 찾아 줍니다.
//      이게 판별 유니온을 쓰는 실질적인 이유입니다.
//
// 5) 통과합니다.
//    kind 가 리터럴이 되는 순간 === "dog" 비교가 좁히기로 동작합니다.
//    딱 두 군데 고쳤을 뿐인데 함수가 살아납니다.
//
// 6) 검사는 조용합니다. 그리고 실행하면 undefined 가 찍힙니다.
//    isDog 가 고양이한테 true 를 주니 if 안으로 들어가고,
//    고양이에게는 bark 가 없어서 undefined 가 나오는 것입니다.
//    타입 서술어(a is DogT)는 몸통을 검사받지 않습니다.
//    "검사는 통과하는데 돌리면 이상하다" 가 여기서도 나옵니다.
