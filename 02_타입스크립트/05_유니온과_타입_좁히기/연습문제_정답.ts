// ============================================================
// 05단원 연습문제 정답 — 유니온과 타입 좁히기
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

console.log("=== 05단원 연습문제 ===");
// 출력: === 05단원 연습문제 ===


// ───── 문제 1 ─────
{
  type Id = string | number;
  function printId(id: Id) {
    console.log(id);
  }
  printId(3);
  // 출력: 3
  printId("A-3");
  // 출력: A-3
}
// 해설 ① | 는 "둘 중 하나" 입니다. 개수 제한은 없습니다.
// 해설 ② console.log 는 아무거나 받으니 통과합니다.
//        id.toUpperCase() 를 썼다면 걸렸을 것입니다. 숫자에는 없으니까요.
// 해설 ③ 유니온 값으로는 '양쪽에 공통으로 있는 것' 만 쓸 수 있습니다.
//        이게 05단원 전체를 관통하는 규칙입니다.


// ───── 문제 2 ─────
{
  type Size = "S" | "M" | "L";
  function printSize(s: Size) {
    console.log("사이즈:", s);
  }
  printSize("M");
  // 출력: 사이즈: M
}
// 해설 ① 값을 그대로 적어 | 로 이으면 "이 값들 중 하나만" 이 됩니다.
// 해설 ② printSize( 까지 치면 세 개가 자동완성으로 뜹니다. 외울 필요가 없습니다.
// 해설 ③ "XL" 을 넘기면 TS2345 로 걸립니다. 오타도 이걸로 잡힙니다.
//        JS 에서는 오타가 조용히 통과해 if 비교가 영원히 false 가 됐습니다.


// ───── 문제 3 ─────
{
  function describe(value: string | number) {
    if (typeof value === "string") {
      console.log(value.length);
    } else {
      console.log(value.toFixed(1));
    }
  }
  describe("아메리카노");
  // 출력: 5
  describe(4500);
  // 출력: 4500.0
}
// 해설 ① if 안에서는 string, else 에서는 number 로 좁혀집니다.
// 해설 ② else 쪽이 재미있습니다. "문자열이 아니다" 만 알려 줬는데
//        string | number 에서 string 을 빼면 number 밖에 안 남으니 알아서 압니다.
// 해설 ③ 유니온이 셋 이상이면 else 에 둘이 남습니다.
//        그때는 else if 로 하나씩 더 걸러야 합니다.


// ───── 문제 4 ─────
{
  type Status = "대기" | "조리중" | "완료";
  function message(status: Status): string {
    switch (status) {
      case "대기":
        return "곧 시작합니다";
      case "조리중":
        return "만들고 있어요";
      case "완료":
        return "나왔습니다";
    }
  }
  console.log(message("조리중"));
  // 출력: 만들고 있어요
}
// 해설 ① 세 경우를 다 적었으니 "return 이 없는 길" 이 없습니다. 그래서 통과합니다.
// 해설 ② case 를 하나 빠뜨리면 TS2366 으로 걸립니다.
//        나중에 Status 에 "취소" 를 추가하면 이 함수가 그 자리에서 걸립니다.
//        → 고쳐야 할 곳을 타입이 전부 찾아 줍니다. 리터럴 유니온의 가장 큰 이득입니다.
// 해설 ③ default 로 뭉뚱그리면 편하지만 이 알림을 못 받습니다.
//        상태가 늘어날 수 있는 코드라면 default 없이 다 적는 편이 안전합니다.


// ───── 문제 5 ─────
{
  function sumAll(v: number | number[]) {
    if (Array.isArray(v)) {
      console.log(v.reduce((a, b) => a + b, 0));
    } else {
      console.log(v);
    }
  }
  sumAll(5);
  // 출력: 5
  sumAll([1, 2, 3]);
  // 출력: 6
}
// 해설 ① typeof 로는 배열을 못 가립니다. typeof [] 는 "object" 입니다.
//        JS자료 06단원에서 배운 그 함정입니다.
// 해설 ② Array.isArray 는 타입스크립트가 좁히기로 인정해 주는 함수입니다.
// 해설 ③ v.reduce 의 두 번째 인자 0 을 빼면 안 됩니다. 빈 배열일 때 터집니다.


// ───── 문제 6 ─────
{
  type Shop = { name: string; owner: { name: string } | null };
  const shop1: Shop = { name: "봄날카페", owner: { name: "홍길동" } };
  const shop2: Shop = { name: "무인카페", owner: null };

  console.log(shop1.owner?.name);
  // 출력: 홍길동
  console.log(shop2.owner?.name);
  // 출력: undefined
}
// 해설 ① ?. 는 "앞엣것이 없으면 거기서 멈추고 undefined" 입니다.
// 해설 ② ?. 없이 shop2.owner.name 을 쓰면 TS18047 로 걸립니다.
//        JS 에서는 검사가 없으니 실행 중에 터지던 자리입니다.
// 해설 ③ ?. 의 결과에는 undefined 가 붙습니다. 문제가 사라진 게 아니라
//        다음으로 옮겨 간 것입니다. 그래서 문제 7처럼 ?? 와 짝지어 씁니다.


// ───── 문제 7 ─────
{
  type Shop = { name: string; owner: { name: string } | null };
  const shop1: Shop = { name: "봄날카페", owner: { name: "홍길동" } };
  const shop2: Shop = { name: "무인카페", owner: null };

  console.log(shop1.owner?.name ?? "주인 없음");
  // 출력: 홍길동
  console.log(shop2.owner?.name ?? "주인 없음");
  // 출력: 주인 없음
}
// 해설 ① ?? 는 "왼쪽이 null 이나 undefined 면 오른쪽" 입니다.
// 해설 ② 이제 결과에 undefined 가 안 붙으니 const s: string = ... 에 바로 담깁니다.
// 해설 ③ ?. 와 ?? 는 거의 항상 짝으로 나옵니다. 한 쌍으로 외우세요.


// ───── 문제 8 ─────
{
  type Dog = { kind: "dog"; bark: string };
  type Cat = { kind: "cat"; meow: string };
  type Animal = Dog | Cat;

  function speak(a: Animal): string {
    switch (a.kind) {
      case "dog":
        return a.bark;
      case "cat":
        return a.meow;
    }
  }
  console.log(speak({ kind: "dog", bark: "멍멍" }));
  // 출력: 멍멍
  console.log(speak({ kind: "cat", meow: "야옹" }));
  // 출력: 야옹
}
// 해설 ① kind 의 값이 "dog" 처럼 리터럴이어야 합니다. string 이면 안 됩니다(문제 13).
// 해설 ② case "dog" 안에서 a 는 Dog 하나로 좁혀집니다. 그래서 a.bark 가 통과합니다.
//        a.meow 를 쓰면 TS2339 Property 'meow' does not exist on type 'Dog'. 입니다.
// 해설 ③ 표딱지 이름은 kind · type · status 아무거나 됩니다.
//        중요한 건 모든 모양에 '같은 이름' 으로 있어야 한다는 것입니다.


// ───── 문제 9 ─────
{
  console.log("숫자에는 toUpperCase 가 없어서");
  // 출력: 숫자에는 toUpperCase 가 없어서
}
// 해설 ① 유니온 값으로는 양쪽에 공통으로 있는 것만 쓸 수 있습니다.
// 해설 ② 에러 메시지 두 번째 줄에
//        Property 'toUpperCase' does not exist on type 'number'. 가 나옵니다.
//        어느 쪽이 문제인지 알려 주니 두 줄까지 읽으세요.
// 해설 ③ 고치려면 typeof 로 확인하면 됩니다(문제 3).


// ───── 문제 10 ─────
{
  function showCount(count?: number) {
    if (count !== undefined) {
      console.log("수량:", count);
    } else {
      console.log("수량 없음");
    }
  }
  showCount(3);
  // 출력: 수량: 3
  showCount(0);
  // 출력: 수량: 0
  showCount();
  // 출력: 수량 없음
}
// 해설 ① if (count) 는 0 을 없는 것으로 칩니다. 0 이 falsy 이기 때문입니다.
//        JS자료 01단원의 falsy 목록 — 0 · "" · null · undefined · NaN · false.
// 해설 ② 숫자·문자열에는 !== undefined 로 직접 물어봐야 합니다.
//        객체·배열은 if (값) 로 충분합니다. 그것들은 falsy 가 될 일이 없으니까요.
// 해설 ③ 실무 버그로 가장 자주 나오는 자리입니다.
//        "0잔 주문" · "빈 메모" · "0원 할인" 이 전부 사라집니다.


// ───── 문제 11 ─────
{
  console.log(0);
  // 출력: 0
  console.log(99);
  // 출력: 99
}
// 해설 ① ?? 는 null·undefined 일 때만 오른쪽을 씁니다. 0 은 있는 값이라 그대로입니다.
// 해설 ② || 는 falsy 전부를 바꿉니다. 그래서 0 이 99 가 됐습니다.
// 해설 ③ 기본값을 줄 때는 ?? 를 쓰세요.
//        || 는 "비어 있으면" 을 뜻할 때만 씁니다.
//        문제 10과 같은 함정입니다. 확인이든 기본값이든 0 과 "" 을 조심하세요.


// ───── 문제 12 ─────
{
  type Shop = { owner: { name: string } | null };
  const shop: Shop = { owner: null };
  console.log(shop.owner?.name ?? "없음");
  // 출력: 없음
}
// 해설 ① ! 를 쓰면 검사는 통과하고 실행하면 터집니다.
//        TypeError: Cannot read properties of null (reading 'name')
// 해설 ② ?. 와 ?? 로 바꾸면 코드 길이는 비슷한데 결과가 완전히 다릅니다.
//        ! 는 문제를 숨기고, ?. ?? 는 문제를 처리합니다.
// 해설 ③ if (shop.owner) { ... } else { ... } 로 써도 정답입니다.
//        어느 쪽이든 ! 만 안 쓰면 됩니다.


// ───── 문제 13 ─────
{
  type Dog = { kind: "dog"; bark: string };
  type Cat = { kind: "cat"; meow: string };
  type Animal = Dog | Cat;

  function speak(a: Animal) {
    if (a.kind === "dog") {
      return a.bark;
    }
    return "";
  }
  console.log(speak({ kind: "dog", bark: "멍멍" }));
  // 출력: 멍멍
}
// 해설 ① 고친 곳은 kind: string → kind: "dog" · kind: "cat" 두 군데입니다.
// 해설 ①-b 사실 Cat 쪽만 "cat" 으로 고쳐도 통과합니다. Cat 이 "dog" 일 수 없게 되면
//        === "dog" 로 Cat 을 걷어낼 수 있기 때문입니다. 반대로 Dog 만 고치면
//        Cat 의 kind 가 여전히 string 이라 "dog" 일 수도 있어서 안 걸러집니다.
//        둘 다 리터럴로 적는 것이 뜻이 분명하고 실무에서도 그렇게 씁니다.
// 해설 ② kind 가 string 이면 === "dog" 로 비교해도 안 좁혀집니다.
//        string 은 "dog" 일 수도 "cat" 일 수도 있어서 구분이 안 되기 때문입니다.
// 해설 ③ "분명히 if 로 확인했는데 왜 안 되지?" 싶으면 여기를 보세요.
//        판별 유니온에서 가장 흔하고 가장 찾기 어려운 실수입니다.


// ───── 문제 14 ─────
{
  function process(value: string | number) {
    if (typeof value !== "string") {
      return;
    }
    console.log(value.toUpperCase());
    console.log(value.length);
  }
  process("latte");
  // 출력: LATTE
  // 출력: 5
}
// 해설 ① if 블록 '안' 이 아니라 '그 아래 전체' 가 좁혀집니다.
//        걸러 낸 뒤 돌려보냈으니 아래로는 문자열만 내려옵니다.
// 해설 ② 이 방식을 '이른 반환' 이라고 합니다.
//        중첩이 깊어지는 것을 막아 주어 실무에서 많이 씁니다.
// 해설 ③ return 을 지우면 아래 두 줄이 TS2339 로 걸립니다.
//        숫자인 경우도 아래로 흘러 내려오기 때문입니다.


// ───── 문제 15 ─────
{
  type LoadState =
    | { status: "로딩중" }
    | { status: "성공"; data: string[] }
    | { status: "실패"; message: string };

  function render(state: LoadState): string {
    switch (state.status) {
      case "로딩중":
        return "불러오는 중...";
      case "성공":
        return state.data.length + "개: " + state.data.join(", ");
      case "실패":
        return "오류: " + state.message;
    }
  }

  console.log(render({ status: "로딩중" }));
  // 출력: 불러오는 중...
  console.log(render({ status: "성공", data: ["아메리카노", "라떼"] }));
  // 출력: 2개: 아메리카노, 라떼
  console.log(render({ status: "실패", message: "서버 없음" }));
  // 출력: 오류: 서버 없음
}
// 해설 ① case "성공" 안에서 state.data 를 확인 없이 바로 씁니다.
//        "성공" 이면 data 가 반드시 있다고 타입에 적혀 있기 때문입니다.
// 해설 ② 선택 속성으로 만들었다면 이렇게 됐을 것입니다.
//            { loading: boolean; data?: string[]; error?: string }
//        그러면 data 를 쓸 때마다 확인해야 하고,
//        { loading: true, data: [...], error: "실패" } 같은 말 안 되는 상태도
//        만들어집니다. 판별 유니온은 그런 조합을 아예 못 만들게 합니다.
// 해설 ③ 07단원에서 React 화면 상태를 이 패턴 그대로 다룹니다.
//        지금 손에 익혀 두면 그때 새로 배울 것이 없습니다.


// ───── 문제 16 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   ① npm run check
//      조용합니다. 안 걸립니다.
//      ! 는 "없을 리 없다, 내가 책임진다" 는 뜻이라 검사를 꺼 버립니다.
//
//   ② node 연습문제.ts
//      TypeError: Cannot read properties of null (reading 'name')
//      → 여기서 프로그램이 멈춥니다.
//
// 해설 ① 02단원의 any, 04단원의 "타입은 약속이지 검사가 아니다" 와 같은 구조입니다.
//        "검사는 통과하는데 돌리면 터진다".
// 해설 ② 이 자료가 쓰지 말라고 정한 것이 셋입니다 — any · ! · 그리고 as(08단원).
//        셋 다 "검사를 끄는" 도구라는 공통점이 있습니다.
// 해설 ③ ! 를 쓰고 싶어질 때는 대개 ?. 와 ?? 로 해결됩니다(문제 12).
