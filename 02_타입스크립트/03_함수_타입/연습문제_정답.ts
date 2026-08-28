// ============================================================
// 03단원 연습문제 정답 — 함수 타입
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

console.log("=== 03단원 연습문제 ===");
// 출력: === 03단원 연습문제 ===


// ───── 문제 1 ─────
{
  function callMenu(menu: string) {
    return menu + " 나왔습니다";
  }
  console.log(callMenu("라떼"));
  // 출력: 라떼 나왔습니다
}
// 해설 ① 안 적으면 TS7006 (implicitly has an 'any' type) 이 납니다.
// 해설 ② implicitly = "은근슬쩍". 적지도 않았는데 any 가 됐다는 뜻입니다.
//        02단원에서 any 를 안 쓰기로 했는데, 매개변수를 비우면 자동으로 any 가 됩니다.
// 해설 ③ 반환 타입은 안 적었습니다. 몸통을 보면 문자열인 게 뻔하니 추론됩니다.


// ───── 문제 2 ─────
{
  function bigger(a: number, b: number) {
    return a > b ? a : b;
  }
  console.log(bigger(4, 9));
  // 출력: 9
}
// 해설 ① Math.max(a, b) 를 써도 정답입니다.
// 해설 ② 반환 타입을 안 적었지만 (a: number, b: number) => number 로 추론됩니다.
//        마우스를 올려 확인해 보세요.
// 해설 ③ 흔한 실수 — function bigger(a, b: number) 처럼 하나만 적는 것.
//        안 적은 a 만 TS7006 으로 걸립니다. 매개변수는 하나씩 따로 봅니다.


// ───── 문제 3 ─────
{
  function getTotal(count: number): number {
    return count * 4000;
  }
  console.log(getTotal(2));
  // 출력: 8000
}
// 해설 ① : number 를 붙이는 순간 return String(...) 줄에서 걸립니다.
//        error TS2322: Type 'string' is not assignable to type 'number'.
//    재현:
//    function getTotal(count: number): number { return String(count * 4000); }
// 해설 ② 핵심은 '어디서' 걸리느냐입니다. 함수를 쓰는 쪽이 아니라 함수 '안' 입니다.
//        실수한 자리에서 바로 잡히니 원인을 찾을 필요가 없습니다.
// 해설 ③ 반환 타입을 안 적었다면 이 함수는 문자열을 돌려주는 함수가 되고,
//        문제가 이 값을 쓰는 먼 곳에서 드러났을 것입니다.
//        중요한 함수에 반환 타입을 적는 이유입니다.


// ───── 문제 4 ─────
{
  function announce(message: string): void {
    console.log("[공지] " + message);
  }
  announce("문 닫습니다");
  // 출력: [공지] 문 닫습니다
}
// 해설 ① void 는 "돌려주는 것이 없다" 는 뜻입니다.
// 해설 ② return 이 없으면 안 적어도 void 로 추론됩니다. 적는 것은 선택입니다.
//        다만 적어 두면 "이 함수는 값을 안 준다" 가 읽는 사람에게 분명해집니다.
// 해설 ③ announce(...).length 처럼 결과를 쓰려고 하면
//        TS2339 Property 'length' does not exist on type 'void'. 로 막힙니다.
//        JS 에서는 undefined 가 되어 실행 중에 터지던 자리입니다.


// ───── 문제 5 ─────
{
  const half = (n: number): number => n / 2;
  console.log(half(42));
  // 출력: 21
}
// 해설 ① 적는 자리는 같습니다. 매개변수는 괄호 안, 반환값은 괄호 뒤입니다.
// 해설 ② const half = (n: number) => n / 2; 처럼 반환 타입을 빼도 정답입니다.
//        실무에서는 이쪽이 더 흔합니다.
// 해설 ③ 매개변수가 없어도 괄호는 필요합니다. const f = (): string => "x";


// ───── 문제 6 ─────
{
  function order(menu: string, memo?: string) {
    console.log(menu, memo);
  }
  order("아메리카노");
  // 출력: 아메리카노 undefined
  order("아메리카노", "얼음 적게");
  // 출력: 아메리카노 얼음 적게
}
// 해설 ① ? 를 붙이면 개수 검사(TS2554)를 통과합니다.
// 해설 ② 안 넘긴 값은 undefined 입니다. null 이 아닙니다.
// 해설 ③ 대가가 있습니다. memo 의 타입이 string | undefined 가 되어
//        .length 같은 것을 바로 못 씁니다. 문제 9가 그 이야기입니다.


// ───── 문제 7 ─────
{
  function total(unit: number, count: number = 1) {
    return unit * count;
  }
  console.log(total(4000));
  // 출력: 4000
  console.log(total(4000, 3));
  // 출력: 12000
}
// 해설 ① 기본값을 주면 ? 없이도 생략할 수 있습니다.
// 해설 ② 그리고 count 의 타입이 number 그대로입니다. undefined 가 안 섞입니다.
//        그래서 확인 없이 바로 곱셈에 쓸 수 있습니다. ? 보다 나은 점이 이것입니다.
// 해설 ③ count = 1 처럼 타입을 빼도 됩니다. 1 을 보고 number 로 추론합니다.
//        function total(unit: number, count = 1) 이 실무에서 가장 흔한 모양입니다.


// ───── 문제 8 ─────
{
  const nums: number[] = [1, 2, 3];
  console.log(nums.map((n) => n * 10));
  // 출력: [ 10, 20, 30 ]
}
// 해설 ① n 에 타입을 안 적었는데 TS7006 이 안 납니다.
//        nums 가 number[] 이므로 map 이 꺼내 주는 값은 number 일 수밖에 없어서,
//        타입스크립트가 문맥에서 알아낸 것입니다.
// 해설 ② 그래도 검사는 그대로 합니다. n.toUpperCase() 를 쓰면 TS2339 로 걸립니다.
// 해설 ③ 규칙 — 내가 만드는 함수의 매개변수는 적고, 남의 함수에 넘기는 콜백은 맡긴다.


// ───── 문제 9 ─────
{
  function showMemo(memo?: string) {
    if (memo) {
      console.log(memo.length);
    } else {
      console.log("메모 없음");
    }
  }
  showMemo("얼음 적게");
  // 출력: 5
  showMemo();
  // 출력: 메모 없음
}
// 해설 ① 고치기 전에는 TS18048 'memo' is possibly 'undefined'. 가 납니다.
// 해설 ② if (memo) 안쪽에서는 memo 가 확실히 문자열입니다.
//        타입스크립트가 그것을 알고 .length 를 허락합니다. 이것이 '타입 좁히기' 입니다.
//        05단원의 주제이니 지금은 "if 로 감싸면 된다" 만 익히세요.
// 해설 ③ 흔한 실수 — memo!.length 처럼 느낌표를 붙여 넘어가는 것.
//        "내가 책임질 테니 그냥 해라" 라는 뜻이라 any 와 비슷하게 위험합니다.
//        showMemo() 를 부르는 순간 실행 중에 터집니다.


// ───── 문제 10 ─────
{
  const format: (n: number) => string = (n) => n + "원";
  console.log(format(4000));
  // 출력: 4000원
}
// 해설 ① 함수 타입은 (매개변수) => 반환값 으로 적습니다.
//        함수를 '정의' 할 때 쓰는 콜론( : )과 헷갈리지 마세요.
//        정의: (n: number): string => ...
//        타입: (n: number) => string
// 해설 ② 왼쪽에 타입을 적어 두면 오른쪽 (n) 에는 타입을 안 적어도 됩니다.
//        문제 8과 같은 문맥 추론입니다.
// 해설 ③ 이 표기가 길어지면 이름을 붙일 수 있습니다. 04단원에서 배웁니다.


// ───── 문제 11 ─────
{
  function sumWith(values: number[], fn: (n: number) => number): number {
    let sum = 0;
    for (const v of values) {
      sum += fn(v);
    }
    return sum;
  }
  console.log(sumWith([1, 2, 3], (n) => n * 10));
  // 출력: 60
}
// 해설 ① values.map(fn).reduce((a, b) => a + b, 0) 으로 써도 정답입니다.
// 해설 ② fn 의 타입을 적어 두었기 때문에 넘기는 쪽의 (n) 이 자유로워집니다.
//        콜백을 받는 함수를 만들 때는 그 자리에 함수 타입을 꼭 적어야 합니다.
//        안 적으면 TS7006 으로 걸립니다.
// 해설 ③ 흔한 실수 — sumWith([1,2,3], (n) => "값" + n) 처럼 문자열을 돌려주는 것.
//        TS2322 로 걸립니다. 화살표 안쪽까지 검사해 줍니다.


// ───── 문제 12 ─────
{
  function tag(message: string, prefix: string = "[알림]") {
    return prefix + " " + message;
  }
  console.log(tag("문 닫습니다"));
  // 출력: [알림] 문 닫습니다
}
// 해설 ① 원래 코드는 TS1016 A required parameter cannot follow an optional parameter.
//        선택 매개변수 뒤에 필수 매개변수가 올 수 없습니다.
// 해설 ② 생각해 보면 당연합니다. tag("문 닫습니다") 라고 부르면
//        그 값이 prefix 인지 message 인지 알 방법이 없습니다.
// 해설 ③ 규칙 — 반드시 필요한 것을 먼저, 선택인 것을 뒤에.
//        ? 대신 기본값을 쓴 것에도 주목하세요. 쓸 만한 기본값이 있으면 그쪽이 낫습니다.


// ───── 문제 13 ─────
{
  const orders = [
    { menu: "아메리카노", price: 4000, isHot: true },
    { menu: "아이스티", price: 5000, isHot: false },
    { menu: "라떼", price: 4500, isHot: true },
  ];

  function sumHot(
    list: { menu: string; price: number; isHot: boolean }[],
    pick: (o: { menu: string; price: number; isHot: boolean }) => boolean,
  ): number {
    let sum = 0;
    for (const o of list.filter(pick)) {
      sum += o.price;
    }
    return sum;
  }

  console.log("뜨거운 음료 합계: " + sumHot(orders, (o) => o.isHot) + "원");
  // 출력: 뜨거운 음료 합계: 8500원
}
// 해설 ① 4000 + 4500 = 8500 입니다. 아이스티는 빠집니다.
// 해설 ② 매개변수 타입이 끔찍하게 깁니다.
//        { menu: string; price: number; isHot: boolean } 가 두 번이나 나옵니다.
//        고칠 일이 생기면 두 군데를 다 고쳐야 합니다.
//        → 이게 04단원(타입에 이름 붙이기)이 필요한 이유입니다.
//        04단원을 배우고 나면 이렇게 됩니다.
//            type Order = { menu: string; price: number; isHot: boolean };
//            function sumHot(list: Order[], pick: (o: Order) => boolean): number
// 해설 ③ 넘기는 쪽 (o) => o.isHot 에는 타입을 안 적었습니다.
//        pick 의 모양을 적어 두었으니 문맥에서 알아냅니다. 문제 8·11과 같습니다.


// ───── 문제 14 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   npm run check
//   03_함수_타입/연습문제.ts(줄,열): error TS7006:
//   Parameter 'n' implicitly has an 'any' type.
//    재현:
//    function double(n) { return n * 2; }
//
// 해설 ① implicitly = "은근슬쩍", "적지도 않았는데 그렇게 됐다" 는 뜻입니다.
//        여기서는 "n 이 자동으로 any 가 됐다" 입니다.
// 해설 ② node 로 돌리면 42 가 잘 나옵니다. 실행에는 아무 문제가 없습니다.
//        타입 검사에서만 걸립니다. 01단원 개념02의 그 구조 그대로입니다.
// 해설 ③ 이 에러는 이 자료에서 가장 자주 보게 될 것입니다.
//        implicitly 라는 단어가 보이면 "매개변수에 타입을 안 적었구나" 라고
//        바로 떠올리면 됩니다.
