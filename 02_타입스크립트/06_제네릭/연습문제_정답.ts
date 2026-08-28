// ============================================================
// 06단원 연습문제 정답 — 제네릭
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

console.log("=== 06단원 연습문제 ===");
// 출력: === 06단원 연습문제 ===


// ───── 문제 1 ─────
{
  function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }
  console.log(last(["가", "나", "다"]));
  // 출력: 다
  console.log(last([10, 20, 30]));
  // 출력: 30
}
// 해설 ① <T> 는 "T 라는 이름의 타입을 하나 받겠다" 는 뜻입니다.
//        무엇인지는 부르는 쪽에서 정해집니다.
// 해설 ② 넘긴 값을 보고 알아내므로 last<string>(...) 처럼 적을 필요가 없습니다.
// 해설 ③ 반환 타입에 | undefined 를 꼭 적으세요.
//        빈 배열의 [length-1] 은 undefined 이기 때문입니다.
//        : T 라고만 적으면 쓰는 쪽이 확인 없이 쓰다가 실행 중에 터집니다.


// ───── 문제 2 ─────
{
  function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }
  const empty: string[] = [];
  console.log(last(empty) ?? "없음");
  // 출력: 없음
}
// 해설 ① last(empty) 는 string | undefined 입니다. ?? 로 마무리하면 string 이 됩니다.
// 해설 ② const empty = []; 처럼 타입 없이 쓰면 암시적 any[] 가 되어
//        TS7034 · TS7005 로 걸립니다. 검사를 껐을 때와 같은 상태가 됩니다.
//        빈 배열로 시작할 때는 타입을 적어야 합니다(02단원 개념02 섹션5).
// 해설 ③ ?? 대신 if (v !== undefined) 로 확인해도 됩니다. 05단원 개념03입니다.


// ───── 문제 3 ─────
{
  function pair<A, B>(a: A, b: B): [A, B] {
    return [a, b];
  }
  const [name, price] = pair("라떼", 4500);
  console.log(name, price);
  // 출력: 라떼 4500
}
// 해설 ① 타입 매개변수는 쉼표로 여러 개 받습니다. <A, B> 든 <T, U> 든 이름은 자유입니다.
// 해설 ② [A, B] 는 튜플입니다. 개수와 순서가 정해져 있고 자리마다 타입이 다릅니다.
//        name 은 string, price 는 number 로 정확히 나뉩니다.
// 해설 ③ 07단원의 useState 가 정확히 이 모양을 돌려줍니다.
//        const [count, setCount] = useState(0) 의 그 대괄호가 튜플 구조분해입니다.


// ───── 문제 4 ─────
{
  function makeEmpty<T>(): T[] {
    return [];
  }
  const nums = makeEmpty<number>();
  nums.push(3);
  console.log(nums[0] + 1);
  // 출력: 4
}
// 해설 ① 넘기는 값이 없으니 T 를 알아낼 근거가 없습니다. 그럴 때만 직접 적습니다.
// 해설 ② 안 적으면 T 가 unknown 이 되고, nums[0] + 1 이
//        TS2571 Object is of type 'unknown'. 으로 걸립니다.
//        (이름 붙은 변수였다면 TS18046 입니다. 개념01 섹션5의 TS2532/TS18048 과 같은 구분입니다)
//        push(3) 까지는 통과해서 더 헷갈립니다. 꺼내 쓸 때 드러납니다.
// 해설 ③ 규칙 — 알아낼 수 있으면 맡기고, 없으면 적습니다.
//        굳이 적으면 코드만 길어집니다.


// ───── 문제 5 ─────
{
  function getLength<T extends { length: number }>(value: T): number {
    return value.length;
  }
  console.log(getLength("아메리카노"));
  // 출력: 5
  console.log(getLength([1, 2, 3]));
  // 출력: 3
}
// 해설 ① 조건 없는 T 로는 아무것도 못 합니다. T 는 '모든 타입' 이라
//        숫자일 수도 있고, 숫자에는 length 가 없기 때문입니다.
//        05단원의 "공통으로 있는 것만" 규칙과 같은 이유입니다.
// 해설 ② extends 는 상속이 아니라 "적어도 이건 갖고 있어야 한다" 로 읽으세요.
// 해설 ③ getLength(123) 은 부르는 쪽에서 TS2345 로 막힙니다.
//        함수 안이 아니라 부르는 자리에서 막아 주는 것이 핵심입니다.


// ───── 문제 6 ─────
{
  type ApiResult<T> = { ok: boolean; data: T };
  const result: ApiResult<string> = { ok: true, data: "봄날카페" };
  console.log(result.data.length);
  // 출력: 4
}
// 해설 ① type 에도 <T> 를 붙일 수 있습니다. 쓸 때 <> 안에 담을 것을 적습니다.
// 해설 ② data 가 string 이라고 정해 줬으니 .length 가 통과합니다.
//        <number> 였다면 .toFixed 가 되고 .length 는 걸립니다.
// 해설 ③ 서버 응답이 언제나 { ok, data } 모양이라면
//        이렇게 한 번 만들어 두고 data 자리만 바꿔 쓰면 됩니다.


// ───── 문제 7 ─────
{
  const menus: Array<string> = ["아메리카노", "라떼"];
  console.log(menus.length);
  // 출력: 2
}
// 해설 ① string[] 과 Array<string> 은 완전히 같습니다. 서로 오갈 수도 있습니다.
// 해설 ② 즉 02단원에서 string[] 을 배웠을 때 이미 제네릭을 쓰고 있었던 것입니다.
// 해설 ③ 이 자료는 짧은 string[] 쪽을 씁니다.
//        Array<...> 는 남의 코드에서 볼 때 알아보기만 하면 됩니다.


// ───── 문제 8 ─────
{
  async function loadCount(): Promise<number> {
    return 42;
  }
  console.log(await loadCount());
  // 출력: 42
}
// 해설 ① async 함수의 반환 타입은 반드시 Promise<> 로 감싸야 합니다.
//        : number 라고만 쓰면 TS1064 로 걸리고, 메시지가 답까지 알려 줍니다.
// 해설 ② await 하면 Promise 가 벗겨지고 알맹이만 남습니다.
//            loadCount()        → Promise<number>
//            await loadCount()  → number
// 해설 ③ await 를 빠뜨리면 Promise<number> 에 숫자 기능을 쓰려다 걸립니다.
//        JS 에서는 [object Promise] 가 조용히 찍히던 자리입니다(문제 14).


// ───── 문제 9 ─────
{
  const stock = new Map<string, number>();
  stock.set("아메리카노", 12);
  console.log(stock.get("아메리카노") ?? 0);
  // 출력: 12
  console.log(stock.get("없는메뉴") ?? 0);
  // 출력: 0
}
// 해설 ① Map<K, V> 는 열쇠와 값 두 개를 받습니다. K 는 Key, V 는 Value 입니다.
// 해설 ② get 의 반환 타입은 V | undefined 입니다.
//        없는 열쇠를 물어볼 수 있으니 사실대로 적힌 것입니다.
//        문제 1의 last 와 같은 이유입니다.
// 해설 ③ ?? 0 을 안 붙이고 + 1 을 하면 TS2532 Object is possibly 'undefined'. 입니다.


// ───── 문제 10 ─────
{
  console.log("돌려받은 값의 타입이 살아 있어서");
  // 출력: 돌려받은 값의 타입이 살아 있어서
}
// 해설 ① any[] 로 만들면 함수는 하나로 줄지만 돌려받은 값이 any 가 됩니다.
//        그러면 무엇을 해도 안 막히고, 실행할 때 터집니다.
// 해설 ② 제네릭은 함수도 하나이고 검사도 살아 있습니다. 둘 다 얻습니다.
// 해설 ③ 제네릭은 "무엇이든 받는다" 지 "검사를 끈다" 가 아닙니다.
//        이 구분이 06단원 전체의 요점입니다.


// ───── 문제 11 ─────
{
  console.log("string[]");
  // 출력: string[]
  console.log("number[]");
  // 출력: number[]
}
// 해설 ① map 은 콜백이 돌려주는 것에 따라 결과 타입이 바뀝니다.
//        n + "원" 이 문자열이니 string[] 입니다.
// 해설 ② filter 는 걸러 내기만 하고 종류를 바꾸지 않으니 원래 타입 그대로입니다.
// 해설 ③ 이 둘이 다르게 동작하는 이유가 제네릭입니다.
//        map<U> 는 U 를 콜백에서 새로 받고, filter 는 T 를 그대로 씁니다.


// ───── 문제 12 ─────
{
  type Menu = { id: number; name: string };
  type User = { id: number; email: string };
  const menus: Menu[] = [
    { id: 1, name: "아메리카노" },
    { id: 2, name: "라떼" },
  ];
  const users: User[] = [{ id: 7, email: "a@b.c" }];

  function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
    return items.find((item) => item.id === id);
  }

  console.log(findById(menus, 2)?.name ?? "없음");
  // 출력: 라떼
  console.log(findById(users, 7)?.email ?? "없음");
  // 출력: a@b.c
  console.log(findById(menus, 99)?.name ?? "없음");
  // 출력: 없음
}
// 해설 ① 함수는 하나인데 Menu 도 User 도 찾습니다.
//        그런데 돌려받은 값에는 각각 제대로 된 타입이 붙어 있습니다.
// 해설 ② findById(menus, 2)?.email 을 쓰면
//        TS2339 Property 'email' does not exist on type 'Menu'. 로 걸립니다.
//        any 로 만들었다면 이게 조용히 통과했을 것입니다.
// 해설 ③ extends { id: number } 가 없으면 item.id 에서 걸립니다.
//        T 로는 id 가 있는지 알 수 없기 때문입니다.


// ───── 문제 13 ─────
{
  type Menu = { id: number; name: string };
  type ApiResult<T> = { ok: boolean; data: T };
  const menus: Menu[] = [
    { id: 1, name: "아메리카노" },
    { id: 2, name: "라떼" },
  ];

  async function load<T>(data: T): Promise<ApiResult<T>> {
    return { ok: true, data };
  }

  const res = await load(menus);
  console.log(res.data[0]?.name ?? "비어 있음");
  // 출력: 아메리카노
}
// 해설 ① Promise<ApiResult<T>> 처럼 제네릭 안에 제네릭이 들어갑니다.
//        읽는 법은 안에서부터입니다 — "T 를 담은 ApiResult 를 담은 Promise".
// 해설 ② await 로 Promise 를 벗기면 ApiResult<Menu[]> 가 남고,
//        res.data 는 Menu[] 입니다. 아무것도 안 적었는데 끝까지 따라옵니다.
// 해설 ③ res.data[0] 에 ?. 를 붙인 이유 — 배열의 [0] 은 빈 배열이면 undefined 입니다.
//        타입스크립트는 기본 설정에서 이걸 안 잡아 주므로(noUncheckedIndexedAccess
//        를 켜야 잡습니다) 습관으로 ?. 를 붙이는 편이 안전합니다.


// ───── 문제 14 ─────
{
  type Cafe = { name: string; open: boolean; seats: number };
  const cafe: Cafe = { name: "봄날카페", open: true, seats: 24 };

  function getField<T, K extends keyof T>(item: T, key: K): T[K] {
    return item[key];
  }

  console.log(getField(cafe, "name"));
  // 출력: 봄날카페
  console.log(getField(cafe, "seats"));
  // 출력: 24
  console.log(getField(cafe, "name").length);
  // 출력: 4
}
// 해설 ① key: string 으로 받으면 TS7053 입니다.
//        Cafe 에 없는 이름이 올 수도 있어서 무엇을 돌려줄지 모르기 때문입니다.
// 해설 ② K extends keyof T 는 "T 의 속성 이름 중 하나" 라는 뜻입니다.
//        keyof Cafe 는 "name" | "open" | "seats" 입니다.
// 해설 ③ 돌려주는 타입이 T[K] 라 "name" 이면 string, "seats" 면 number 가 옵니다.
//        그래서 마지막 줄의 .length 가 그대로 통과합니다.
//        "seats" 에 .length 를 쓰면 걸립니다. 넘긴 이름에 따라 달라집니다.


// ───── 문제 15 ─────
{
  type Book = { title: string; stock: number };
  const books: Book[] = [
    { title: "타입 입문", stock: 3 },
    { title: "제네릭 연습", stock: 0 },
    { title: "실전 TS", stock: 7 },
  ];

  function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
    return items.map((item) => item[key]);
  }

  console.log(pluck(books, "title"));
  // 출력: [ '타입 입문', '제네릭 연습', '실전 TS' ]
  console.log(pluck(books, "stock").reduce((sum, n) => sum + n, 0));
  // 출력: 10
}
// 해설 ① pluck(books, "stock") 이 number[] 라 sum + n 이 숫자 덧셈입니다.
//        아무것도 안 적었는데 뽑은 속성에 맞는 타입이 따라옵니다.
// 해설 ② "title" 로 뽑아 같은 reduce 를 쓰면 TS2769 로 걸립니다.
//        string[] 이라 글자 붙이기가 되는데 시작값 0 은 숫자라서입니다.
//        개념04 ✏️4에서 본 그것입니다.
// 해설 ③ 이름에 오타를 내면(예: "stok") TS2345 로 걸립니다.
//        자바스크립트였다면 [undefined, undefined, undefined] 가 조용히 나오고
//        합계가 NaN 이 됐을 것입니다.


// ───── 문제 16 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   npm run check
//   06_제네릭/연습문제.ts(줄,열): error TS2339:
//   Property 'toFixed' does not exist on type 'Promise<number>'.
//    재현:
//    async function loadCount(): Promise<number> { return 42; }
//    const n = loadCount();
//    console.log(n.toFixed(0));
//
// 해설 ① await 를 빠뜨린 것입니다. n 이 아직 상자에 든 상태입니다.
// 해설 ② 고치는 법은 const n = await loadCount(); 입니다.
// 해설 ③ JS 에서는 이 실수가 조용히 지나가서
//        화면에 [object Promise] 나 undefined 가 찍히고서야 알아챘습니다.
//        에러 메시지에 Promise 가 보이면 await 를 빠뜨린 것입니다.
