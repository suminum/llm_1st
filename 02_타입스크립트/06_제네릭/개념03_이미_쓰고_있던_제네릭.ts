// ============================================================
// 06단원 · 개념 03 — 이미 쓰고 있던 제네릭
// ------------------------------------------------------------
// 실행: node 개념03_이미_쓰고_있던_제네릭.ts
// 검사: npm run typecheck
// ============================================================
//
// 제네릭은 새로 배우는 것처럼 느껴지지만,
// 사실 01단원부터 계속 쓰고 있었습니다. 표기만 다른 모습으로요.
//
// 이 파일은 그것들을 알아보는 눈을 만듭니다.
// 남의 코드와 라이브러리 설명서를 읽을 때 필요합니다.


// ── 섹션 1: string[] 은 Array<string> 이다 ──

// 두 표기는 완전히 같습니다.
const a: string[] = ["라떼", "아메리카노"];
const b: Array<string> = ["라떼", "아메리카노"];

console.log(a.length, b.length);
// 출력: 2 2

// 서로 오갈 수 있습니다. 같은 타입이니까요.
const c: string[] = b;
console.log(c[0]);
// 출력: 라떼

// 즉 02단원에서 string[] 을 배웠을 때
// 이미 Array 라는 제네릭 타입에 string 을 넣어 쓰고 있었던 것입니다.
//
//     Array<T>  에  T = string  을 넣은 것  →  Array<string>  →  줄여서 string[]
//
// 검사도 당연히 같습니다.
//
// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type 'string'.
// b.push(4500);
//
// 실수: <string> 이라고 정해 줬으니 문자열만 들어갑니다.

// 이 자료는 짧은 string[] 쪽을 씁니다. 실무 관행도 그렇습니다.
// Array<...> 는 남의 코드에서 볼 때 알아보기만 하면 됩니다.

// ✏️ 직접 해보기 1 — Array<number> 로 배열을 만들고 값을 하나 넣어 출력해 보세요.


// ── 섹션 2: Promise<T> — 나중에 올 값 ──

// JS자료 12단원에서 배운 Promise 도 제네릭입니다.
async function loadCount(): Promise<number> {
  return 42;
}

// Promise<number> 는 "지금은 없지만 나중에 숫자가 나올 것" 이라는 뜻입니다.
// <> 안에 있는 것이 '나중에 나올 값' 의 타입입니다.

const result = await loadCount();
console.log(result);
// 출력: 42

// await 하고 나면 알맹이만 남습니다. Promise 가 벗겨집니다.
//
//     loadCount()          →  Promise<number>
//     await loadCount()    →  number
//
// 그래서 await 없이 쓰면 이렇게 됩니다.
//
// 에러: TS2339 Property 'toFixed' does not exist on type 'Promise<number>'.
// console.log(loadCount().toFixed(0));
//
// 실수: 아직 상자에 든 상태라 숫자 기능을 못 씁니다.
//       JS 에서는 undefined 나 [object Promise] 가 조용히 나오던 자리입니다.
//       await 를 빠뜨린 실수를 타입이 잡아 줍니다.

// async 함수의 반환 타입은 안 적어도 추론됩니다.
async function loadName() {
  return "봄날카페";
}
const name1 = await loadName();
console.log(name1.length);
// 출력: 4

// 적을 때는 반드시 Promise<> 로 감싸야 합니다.
//
// 에러: TS1064 The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<string>'?
// async function loadNameWrong(): string {
//   return "봄날카페";
// }
//
// 실수: async 함수는 언제나 Promise 를 돌려줍니다.
//       메시지가 답까지 알려 줍니다. 그대로 고치면 됩니다.

// ✏️ 직접 해보기 2 — 문자열 배열을 돌려주는 async 함수를 만들고
//    await 로 받아 개수를 출력해 보세요.


// ── 섹션 3: Map 과 Set ──

// JS자료에서 잠깐 본 Map 도 제네릭입니다. 두 개를 받습니다.
const stock = new Map<string, number>();
stock.set("아메리카노", 12);
stock.set("라떼", 5);

console.log(stock.get("라떼"));
// 출력: 5
console.log(stock.size);
// 출력: 2

// Map<K, V> 에서 K 는 열쇠(Key), V 는 값(Value)입니다.
// 06단원 개념01 섹션5에서 말한 이름 관행이 여기서 나옵니다.

// 에러: TS2345 Argument of type 'string' is not assignable to parameter of type 'number'.
// stock.set("카페모카", "많음");
//
// 실수: 값은 숫자로 정해 뒀습니다.

// 없는 열쇠를 물어보면 undefined 입니다. 그래서 확인이 필요합니다.
console.log(stock.get("없는메뉴"));
// 출력: undefined

// 에러: TS2532 Object is possibly 'undefined'.
// console.log(stock.get("라떼") + 1);
//
// 실수: get 의 반환 타입이 V | undefined 입니다.
//       이번엔 TS18048 이 아니라 TS2532 입니다. 이름이 붙은 변수가 아니라
//       'stock.get(...) 이라는 결과' 라서 Object 라고만 부르는 것입니다.
//       둘 다 possibly 'undefined' 이니 하는 말은 같습니다.
//       개념01 섹션4의 first 와 같은 이유입니다. 없을 수 있으니 사실대로 적힌 것입니다.

console.log((stock.get("라떼") ?? 0) + 1);
// 출력: 6

// Set 은 하나만 받습니다.
const tags = new Set<string>();
tags.add("따뜻한");
tags.add("따뜻한");
console.log(tags.size);
// 출력: 1

// ✏️ 직접 해보기 3 — Map<string, string> 을 만들어 두 쌍을 넣고
//    없는 열쇠를 ?? 와 함께 꺼내 보세요.


// ── 섹션 4: 함수에도 이미 붙어 있었다 ──

// 배열 메소드들도 제네릭입니다. 그래서 타입이 정확하게 따라온 것입니다.
const prices = [4000, 4500, 5000];

const labels = prices.map((p) => p + "원");
console.log(labels);
// 출력: [ '4000원', '4500원', '5000원' ]

// map 의 반환 타입이 string[] 이 된 것에 주목하세요.
// 콜백이 무엇을 돌려주는지 보고 정해집니다. map<U> 의 U 가 그것입니다.
console.log(labels[0].toUpperCase());
// 출력: 4000원

// 에러: TS2551 Property 'toFixed' does not exist on type 'string'. Did you mean 'fixed'?
// console.log(labels[0].toFixed(0));
//
// 실수: 콜백이 문자열을 돌려줬으니 결과는 string[] 입니다.
//       숫자 기능을 쓸 수 없습니다.

// find 는 개념01 의 first 와 완전히 같은 모양입니다.
const found = prices.find((p) => p > 4200);
console.log(found);
// 출력: 4500

// found 의 타입은 number | undefined 입니다.
// 01단원 개념01 섹션4에서 이걸 처음 만났을 때는 이유를 몰랐지만,
// 지금 보면 "제네릭 함수가 사실대로 적어 둔 것" 이라는 게 보입니다.

console.log((found ?? 0) + 1);
// 출력: 4501

// ✏️ 직접 해보기 4 — prices.filter(...) 의 결과 타입이 무엇일지 예상하고
//    마우스를 올려 확인해 보세요.


// ── 섹션 5: 다음 단원 예고 ──

// 07단원에서 React 의 useState 를 만납니다. 그것도 제네릭입니다.
//
//     const [count, setCount] = useState<number>(0);
//                                       └──┬──┘
//                                    이 상자에 담을 것의 타입
//
// 그리고 돌려주는 것이 [값, 바꾸는 함수] 라는 튜플입니다.
// 개념02 섹션1에서 본 그 모양입니다.
//
// 지금 흉내만 내 보면 이렇습니다.
function fakeUseState<T>(initial: T): [T, (next: T) => void] {
  let value = initial;
  const set = (next: T) => {
    value = next;
    console.log("바뀜:", value);
  };
  return [value, set];
}

const [count, setCount] = fakeUseState(0);
console.log(count);
// 출력: 0
setCount(5);
// 출력: 바뀜: 5

// 에러: TS2345 Argument of type 'string' is not assignable to parameter of type 'number'.
// setCount("다섯");
//
// 실수: 처음에 0 을 넣었으니 T 가 number 로 정해졌습니다.
//       그래서 setCount 도 숫자만 받습니다.
//       React 에서 겪게 될 것이 정확히 이것입니다.

// ✏️ 직접 해보기 5 — fakeUseState("대기") 를 만들고 setState 에 숫자를 넘겨 보세요.
//    무슨 에러가 나나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] await 를 빠뜨리기
//   Promise<number> 에 숫자 기능을 쓰려다 걸립니다.
//   에러 메시지에 Promise 가 보이면 await 를 빠뜨린 것입니다.

// [실수 2] async 함수 반환 타입을 Promise 없이 적기
//   TS1064 입니다. 메시지가 답을 알려 주니 그대로 고치면 됩니다.

// [실수 3] Map.get 결과를 그냥 쓰기
//   V | undefined 입니다. ?? 로 기본값을 주거나 확인하세요.

// [실수 4] Array<string> 과 string[] 이 다르다고 생각하기
//   같습니다. 표기만 다릅니다.


// ── 정리 ──

// 1. string[] 은 Array<string> 의 줄임말이다. 배열도 처음부터 제네릭이었다.
// 2. Promise<T> 의 T 는 '나중에 나올 값' 의 타입이다. await 하면 벗겨진다.
//    await 를 빠뜨리면 타입이 잡아 준다.
// 3. async 함수의 반환 타입은 반드시 Promise<> 로 감싼다.
// 4. Map<K, V> 는 열쇠와 값 두 개를 받는다. get 의 결과는 V | undefined 다.
// 5. map · find 같은 배열 메소드도 제네릭이다.
//    find 가 number | undefined 를 주던 이유가 이제 보인다.
// 6. React 의 useState 도 제네릭이고, [값, 바꾸는 함수] 튜플을 돌려준다(07단원).


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const nums: Array<number> = [];
//    nums.push(10);
//    console.log(nums);                       // 출력: [ 10 ]
//    number[] 라고 써도 완전히 같습니다.
//
// 2) async function loadMenus(): Promise<string[]> {
//      return ["아메리카노", "라떼"];
//    }
//    console.log((await loadMenus()).length);  // 출력: 2
//    반환 타입을 안 적어도 Promise<string[]> 로 추론됩니다.
//
// 3) const memo = new Map<string, string>();
//    memo.set("a", "가"); memo.set("b", "나");
//    console.log(memo.get("z") ?? "없음");     // 출력: 없음
//
// 4) number[] 입니다.
//    map 은 콜백이 돌려주는 것에 따라 타입이 바뀌지만,
//    filter 는 p > 4200 처럼 '참/거짓만 보는' 조건이면 원래 타입 그대로입니다.
//    (조건이 x !== null 처럼 종류를 걸러내는 것이면 그만큼 좁혀집니다.
//     (string | null)[] 를 그렇게 거르면 string[] 이 됩니다)
//
// 5) error TS2345: Argument of type 'number' is not assignable to
//    parameter of type 'string'.
//    "대기" 를 넣었으니 T 가 string 으로 정해졌습니다.
//    재현:
//    function fakeUseState<T>(initial: T): [T, (next: T) => void] {
//      let value = initial;
//      return [value, (next: T) => { value = next; }];
//    }
//    const [s, setS] = fakeUseState("대기");
//    void s;
//    setS(5);
//    처음 값 하나로 그 뒤가 전부 정해지는 것이 useState 의 성질입니다.
