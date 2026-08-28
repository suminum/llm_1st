// ============================================================
// 06단원 연습문제 — 제네릭
// ------------------------------------------------------------
// 실행: node 연습문제.ts
// 채점: npm run grade          ← 출력을 기대 출력과 맞춰 봅니다
// 검사: npm run check          ← 타입 검사 (일부 문제만 잡습니다)
// ============================================================
//
// ★ 채점은 npm run grade 로 합니다.
//   실제 출력을 문제의 '기대 출력' 과 줄 단위로 맞춰 봅니다.
//   전부 일치하면 다 맞은 것입니다.
//
//   npm run check(타입 검사)도 같이 쓰세요. 다만 이쪽은 '일부 문제만' 잡습니다.
//   138문항 중 21개뿐입니다. "출력하세요" 류는 안 풀어도 타입 에러가 안 나거든요.
//   그러니 check 가 조용하다고 다 맞은 것이 아닙니다. grade 로 확인하세요.
//   (npm run typecheck 는 개념·정답 파일만 봅니다. 그쪽은 언제나 조용합니다)
//
// 푸는 방법
//   1. TODO 자리에 코드를 씁니다.
//   2. npm run grade 로 채점합니다. (직접 node 연습문제.ts 로 돌려 봐도 됩니다)
//   3. npm run check 로 타입도 봅니다.
//   4. 10분 고민해도 안 되면 연습문제_정답.ts 를 보세요.
//
// 문제 1~8과 14는 기본, 9~12와 15는 응용, 13은 [도전]입니다.
// 문제 14~15는 개념04(keyof)에서 나옵니다.
// 문제 16은 에러를 직접 보는 문제라 맨 뒤에 있습니다.

console.log("=== 06단원 연습문제 ===");


// ───── 문제 1 ───── (개념01 섹션3)
// 배열의 마지막 값을 돌려주는 제네릭 함수 last 를 만드세요.
//
// 【지금까지 하던 방법】 타입마다 하나씩
//     function lastNumber(arr: number[]) { return arr[arr.length - 1]; }
//
// 【이번에 배울 방법】 하나로
//     function last<T>(arr: T[]): T | undefined { ... }
//
// 기대 출력:
// 다
// 30
//
// 기대 검사 결과: 조용함
{
  // TODO: last 를 만들고 ["가","나","다"] 와 [10,20,30] 에 각각 쓰세요
}


// ───── 문제 2 ───── (개념01 섹션4)
// 위 last 를 빈 배열에 쓰면 undefined 가 나옵니다.
// ?? 를 써서 없으면 "없음" 이 나오게 출력하세요.
//
// 기대 출력:
// 없음
//
// 기대 검사 결과: 조용함
{
  function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }

  // TODO: 빈 문자열 배열에 last 를 쓰고 ?? 로 "없음" 을 내보내세요
}


// ───── 문제 3 ───── (개념02 섹션1)
// 값 두 개를 받아 튜플로 돌려주는 pair 를 만들고, 구조분해로 꺼내 출력하세요.
//
// 기대 출력:
// 라떼 4500
//
// 기대 검사 결과: 조용함
{
  // TODO: pair<A, B> 를 만들고 pair("라떼", 4500) 을 구조분해해서 출력하세요
}


// ───── 문제 4 ───── (개념02 섹션2)
// 아래 함수는 넘기는 값이 없어 T 를 알아낼 수 없습니다.
// 부를 때 타입을 직접 정해 주세요.
//
// 기대 출력:
// 4
//
// 기대 검사 결과: 조용함
{
  function makeEmpty<T>(): T[] {
    return [];
  }

  // TODO: makeEmpty 에 타입을 정해 주세요 (지금은 마지막 줄이 걸립니다)
  const nums = makeEmpty();
  nums.push(3);
  console.log(nums[0] + 1);
}


// ───── 문제 5 ───── (개념02 섹션3)
// 아래 함수는 걸립니다. extends 로 조건을 걸어 통과하게 만드세요.
//
// 기대 출력:
// 5
// 3
//
// 기대 검사 결과: 조용함
{
  // TODO: T 에 조건을 거세요
  function getLength<T>(value: T): number {
    return value.length;
  }
  // console.log(getLength("아메리카노"));
  // console.log(getLength([1, 2, 3]));
}


// ───── 문제 6 ───── (개념02 섹션4)
// { ok: boolean; data: T } 모양의 ApiResult 타입을 만들고,
// data 가 문자열인 값을 하나 만들어 글자 수를 출력하세요.
//
// 기대 출력:
// 4
//
// 기대 검사 결과: 조용함
{
  // TODO: type ApiResult<T> 를 만들고 써 보세요
}


// ───── 문제 7 ───── (개념03 섹션1)
// 아래 배열을 Array<...> 표기로 바꿔 쓰세요. 동작은 같아야 합니다.
//
// 기대 출력:
// 2
//
// 기대 검사 결과: 조용함
{
  // TODO: Array<string> 표기로 바꾸세요
  const menus: string[] = ["아메리카노", "라떼"];
  console.log(menus.length);
}


// ───── 문제 8 ───── (개념03 섹션2)
// 숫자를 돌려주는 async 함수를 만들고, await 로 받아 출력하세요.
// 반환 타입을 Promise<number> 로 명시하세요.
//
// 기대 출력:
// 42
//
// 기대 검사 결과: 조용함
{
  // TODO: async 함수를 만들고 await 로 받아 출력하세요
}


// ───── 문제 9 ───── (응용 · 개념03 섹션3)
// Map<string, number> 로 재고를 만들고, 없는 메뉴를 ?? 0 과 함께 꺼내 출력하세요.
//
// 기대 출력:
// 12
// 0
//
// 기대 검사 결과: 조용함
{
  // TODO: Map 을 만들고 있는 것과 없는 것을 각각 출력하세요
}


// ───── 문제 10 ───── (응용 · 개념01 섹션2)
// any[] 로 만든 함수 대신 제네릭을 쓰는 이유를 한 줄로 출력하세요.
//
// 기대 출력:
// 돌려받은 값의 타입이 살아 있어서
//
// 기대 검사 결과: 조용함
{
  // TODO: 이유를 그대로 출력하세요
}


// ───── 문제 11 ───── (응용 · 개념03 섹션4)
// 아래 두 결과의 타입 이름을 순서대로 출력하세요.
//
//     const a = [1, 2, 3].map((n) => n + "원");
//     const b = [1, 2, 3].filter((n) => n > 1);
//
// 기대 출력:
// string[]
// number[]
//
// 기대 검사 결과: 조용함
{
  // TODO: 두 타입 이름을 출력하세요
}


// ───── 문제 12 ───── (응용 · 개념02 섹션3)
// id 를 가진 것이면 무엇이든 찾을 수 있는 findById 를 만드세요.
// Menu 와 User 양쪽에 쓰고, 못 찾으면 "없음" 을 출력하세요.
//
// 기대 출력:
// 라떼
// a@b.c
// 없음
//
// 기대 검사 결과: 조용함
{
  type Menu = { id: number; name: string };
  type User = { id: number; email: string };
  const menus: Menu[] = [
    { id: 1, name: "아메리카노" },
    { id: 2, name: "라떼" },
  ];
  const users: User[] = [{ id: 7, email: "a@b.c" }];

  // TODO: findById 를 만들고 세 번 부르세요 (menus 2 / users 7 / menus 99)
}


// ───── 문제 13 ───── ([도전] · 개념01~03 종합)
// 서버 응답을 흉내 내는 함수와, 그 결과를 다루는 코드를 만드세요.
//   ① type ApiResult<T> = { ok: boolean; data: T } 를 만든다
//   ② async function load<T>(data: T): Promise<ApiResult<T>> 를 만든다
//   ③ 메뉴 배열을 넘겨 await 로 받는다
//   ④ 첫 번째 메뉴 이름을, 없으면 "비어 있음" 을 출력한다
//
// 기대 출력:
// 아메리카노
//
// 기대 검사 결과: 조용함
{
  type Menu = { id: number; name: string };
  const menus: Menu[] = [
    { id: 1, name: "아메리카노" },
    { id: 2, name: "라떼" },
  ];

  // TODO: 위 네 가지를 하세요
}


// ───── 문제 14 ───── (개념04 섹션3)
// 객체와 속성 이름을 받아 그 값을 돌려주는 getField 를 만드세요.
// 넘긴 이름에 맞는 타입이 그대로 돌아와야 합니다.
//
// 【이렇게 하면 안 됩니다】 속성 이름을 string 으로 받기
//     function getField(item: Cafe, key: string) { return item[key]; }
//     → TS7053 으로 걸립니다. key 가 "냐옹" 일 수도 있으니까요.
//
// 【이번에 배울 방법】
//     function getField<T, K extends keyof T>(item: T, key: K): T[K] { ... }
//
// 기대 출력:
// 봄날카페
// 24
// 4
//
// 기대 검사 결과: 조용함
{
  type Cafe = { name: string; open: boolean; seats: number };
  const cafe: Cafe = { name: "봄날카페", open: true, seats: 24 };

  // TODO: getField 를 만들어 name 과 seats 를 출력하고,
  //       이어서 name 의 글자 수(.length)도 출력하세요
}


// ───── 문제 15 ───── (응용 · 개념04 섹션4)
// 목록에서 한 속성만 뽑는 pluck 을 만들어 두 가지를 하세요.
//   ① 제목만 뽑아서 배열째 출력한다
//   ② 재고만 뽑아서 합계를 출력한다
//
// 【이번에 배울 방법】
//     function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { ... }
//
// 기대 출력:
// [ '타입 입문', '제네릭 연습', '실전 TS' ]
// 10
//
// 기대 검사 결과: 조용함
{
  type Book = { title: string; stock: number };
  const books: Book[] = [
    { title: "타입 입문", stock: 3 },
    { title: "제네릭 연습", stock: 0 },
    { title: "실전 TS", stock: 7 },
  ];

  // TODO: pluck 을 만들고 ①②를 하세요 (합계는 reduce 를 쓰세요)
}


// ───── 문제 16 ───── (에러 확인 · 개념03 섹션2)
// 아래 세 줄의 // 를 지우고 npm run check 로 검사해 보세요.
//
//   ① 무슨 에러가 나나요?
//   ② 무엇을 빠뜨린 것일까요?
//
// 확인했으면 다시 // 를 붙이세요.
{
  // async function loadCount(): Promise<number> { return 42; }
  // const n = loadCount();
  // console.log(n.toFixed(0));
}
