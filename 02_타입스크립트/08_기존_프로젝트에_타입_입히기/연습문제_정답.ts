// ============================================================
// 08단원 연습문제 정답 — 기존 프로젝트에 타입 입히기
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

// 문제 11~14에서 쓰는 모듈입니다(개념04).
import { getDiscounted, getShipping, DEFAULT_PERCENT } from "./타입없는_모듈/할인계산기.js";

console.log("=== 08단원 연습문제 ===");
// 출력: === 08단원 연습문제 ===


// ───── 문제 1 ─────
{
  console.log(undefined);
  // 출력: undefined
}
// 해설 ① as 는 값을 바꾸지 않습니다. 타입스크립트의 생각만 바꿉니다.
//        JSON 에 price 가 없으니 실제로는 undefined 입니다.
// 해설 ② 검사는 조용합니다. m.price.toFixed(0) 을 쓰면 실행할 때 터집니다.
//        02단원의 any, 05단원의 ! 와 완전히 같은 구조입니다.
// 해설 ③ 04단원 개념04의 "타입은 약속이지 검사가 아니다" 를
//        as 로 한 번 더 확인한 것입니다.


// ───── 문제 2 ─────
{
  type Menu = { name: string; price: number };
  const menu = { name: "아메리카노", price: 4000 } satisfies Menu;
  console.log(menu.name);
  // 출력: 아메리카노
}
// 해설 ① as 는 "Menu 라고 쳐 줘"(검사 안 함),
//        satisfies 는 "Menu 가 맞는지 봐 줘"(검사 함) 입니다.
// 해설 ② satisfies 는 확인만 하고 변수의 타입은 안 바꿉니다.
//        여기 Menu 는 name 이 string 이라 : Menu 와 결과가 같습니다.
//        차이는 목표 타입이 헐렁할 때 드러납니다(개념01 섹션4의 설정 예).
// 해설 ③ 값이 눈앞에 있을 때는 as 대신 satisfies 나 : 타입 을 쓰세요.


// ───── 문제 3 ─────
{
  type Menu = { name: string; price: number };
  const menu = { name: "라떼", price: 4500 } satisfies Menu;
  console.log(menu.price);
  // 출력: 4500
}
// 해설 ① satisfies 로 바꾸면 size 자리에서 걸립니다.
//        error TS2353: Object literal may only specify known properties,
//        and 'size' does not exist in type 'Menu'.
//    재현:
//    type Menu = { name: string; price: number };
//    const menu = { name: "라떼", price: 4500, size: "L" } satisfies Menu;
//    void menu;
// 해설 ② as Menu 였을 때는 조용히 통과했습니다.
//        오타로 sizee 라고 썼어도 아무도 안 알려 줬을 것입니다.
// 해설 ③ 04단원 개념01 섹션3의 초과 속성 검사가 satisfies 에서도 그대로 동작합니다.


// ───── 문제 4 ─────
{
  const legacy: unknown = "  글자입니다  ";
  if (typeof legacy === "string") {
    console.log(legacy.trim());
    // 출력: 글자입니다
  }
}
// 해설 ① any 였을 때는 legacy.trim() 이 그냥 통과했습니다.
//        문자열이 아니었다면 실행할 때 터졌을 것입니다.
// 해설 ② unknown 으로 바꾸면 TS18046 'legacy' is of type 'unknown'. 이 납니다.
//        확인하고 쓰라는 뜻입니다.
// 해설 ③ 옮기는 중에 막히면 any 말고 unknown 을 쓰라는 이유가 이것입니다.
//        any 는 빚이 번지고, unknown 은 그 자리에 갇힙니다.


// ───── 문제 5 ─────
{
  const o: { name?: string } = {};
  o.name = "라떼";
  console.log(o.name);
  // 출력: 라떼
}
// 해설 ① const o = {} 는 "속성이 하나도 없는 객체" 로 추론됩니다.
//        그래서 o.name 이 TS2339 로 걸립니다.
// 해설 ② JS 에서 아주 흔하던 패턴이라 옮길 때 반드시 만납니다.
// 해설 ③ 더 나은 방법은 한 번에 다 적는 것입니다.
//        const o = { name: "라떼" };
//        나중에 붙여야만 한다면 위처럼 타입을 미리 정해 둡니다.


// ───── 문제 6 ─────
{
  type Status = "대기" | "조리중" | "완료";
  const current: Status = "조리중";
  console.log(current);
  // 출력: 조리중
}
// 해설 ① enum 이 하려던 일을 리터럴 유니온이 거의 다 합니다.
// 해설 ② 게다가 실행할 때 아무것도 안 남고 사라집니다.
//        enum 은 진짜 객체를 만들어서 번들에 코드가 남습니다.
// 해설 ③ 이 자료는 erasableSyntaxOnly 로 enum 을 아예 막아 두었습니다.
//        node 가 .ts 를 실행할 때 enum 은 '지우기' 만으로 처리가 안 되기 때문입니다.


// ───── 문제 7 ─────
{
  console.log("string");
  // 출력: string
}
// 해설 ① as unknown as number 는 "그래도 하겠다" 고 뚫은 것입니다.
//        타입스크립트는 number 라고 믿지만 실제 값은 문자열 그대로입니다.
// 해설 ② "4500" as number 만 쓰면 TS2352 로 말립니다.
//        그런데 메시지가 "unknown 을 거쳐 가세요" 라고 방법까지 알려 줍니다.
//        말리면서 뚫는 법을 알려 주는 셈이라 오히려 위험합니다.
// 해설 ③ 남의 코드에서 as unknown as 를 보면 그 근처를 의심하세요.
//        거의 항상 설계가 잘못된 자리입니다.


// ───── 문제 8 ─────
{
  function toList(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }
  console.log(toList("라떼"));
  // 출력: [ '라떼' ]
  console.log(toList(["라떼", "아메리카노"]));
  // 출력: [ '라떼', '아메리카노' ]
}
// 해설 ① JS 에서 "문자열도 받고 배열도 받던" 함수를 옮길 때 쓰는 방법입니다.
// 해설 ② typeof 로는 배열을 못 가립니다. typeof [] 는 "object" 입니다.
//        Array.isArray 를 씁니다(05단원 개념02 섹션3).
// 해설 ③ 반환 타입 : string[] 을 적어 두면
//        실수로 문자열을 그냥 돌려주는 것을 함수 안에서 잡아 줍니다.


// ───── 문제 9 ─────
{
  console.log("상수·유틸 → 계산 함수 → 데이터 다루는 곳 → 화면");
  // 출력: 상수·유틸 → 계산 함수 → 데이터 다루는 곳 → 화면
}
// 해설 ① 아래에서 위로 올라가는 순서입니다.
// 해설 ② A 가 B 를 쓰는데 B 에 타입이 없으면, A 를 먼저 옮겨도 B 쪽이 any 라
//        소득이 적습니다. 반대로 B 를 먼저 옮기면 A 가 아직 .js 여도 덕을 봅니다.
// 해설 ③ 화면(컴포넌트)이 가장 많이 얽혀 있어 제일 어렵습니다. 마지막에 하세요.


// ───── 문제 10 ─────
{
  type CartItem = { name: string; price: number; count: number };

  function getTotal(items: CartItem[]): number {
    let sum = 0;
    for (const item of items) {
      sum += item.price * item.count;
    }
    return sum;
  }

  function withShipping(total: number, shipping: number): number {
    return total + shipping;
  }

  const cart: CartItem[] = [
    { name: "아메리카노", price: 4000, count: 2 },
    { name: "라떼", price: 4500, count: 1 },
  ];
  const shippingText = "3000";

  console.log("총액: " + withShipping(getTotal(cart), Number(shippingText)) + "원");
  // 출력: 총액: 15500원
}
// 해설 ① 걸리는 줄은 withShipping(getTotal(cart), shippingText) 입니다.
//        error TS2345: Argument of type 'string' is not assignable to
//        parameter of type 'number'.
//    재현:
//    function withShipping(total: number, shipping: number): number { return total + shipping; }
//    const shippingText = "3000";
//    console.log(withShipping(12500, shippingText));
// 해설 ② 타입을 안 적었다면(= 옮기기 전 .js 상태) 이 줄이 조용히 통과하고
//        "125003000원" 이 나왔을 것입니다. 옮기기_예제/이전.js 로 직접 확인해 보세요.
// 해설 ③ 고친 것은 Number( ) 하나뿐입니다.
//        중요한 것은 '어디를' 고쳐야 하는지를 타입이 정확히 짚어 줬다는 점입니다.
//        JS 였다면 화면에 이상한 숫자가 찍히고 나서야 찾기 시작했을 것입니다.


// ───── 문제 11 ─────
{
  const 할인가 = getDiscounted(4500, DEFAULT_PERCENT);
  console.log(할인가);
  // 출력: 4050
  console.log(getShipping(할인가));
  // 출력: 3000
  console.log(할인가 + getShipping(할인가));
  // 출력: 7050
}
// 해설 ① 남이 만든 .js 인데도 계산이 전부 숫자로 이어집니다.
//        짝이 되는 할인계산기.d.ts 가 있어서입니다.
// 해설 ② .d.ts 를 지우면 TS7016 이 나고, 이 세 줄이 전부 any 가 됩니다.
// 해설 ③ getDiscounted(4500, "10") 처럼 문자열을 넘기면 TS2345 로 걸립니다.
//        타입을 적어 두면 남의 패키지를 쓸 때도 이렇게 막아 줍니다.


// ───── 문제 12 ─────
{
  const cart = [
    { price: 4000, count: 2 },
    { price: 4500, count: 1 },
  ];

  const 합계 = cart.reduce((total, item) => total + item.price * item.count, 0);
  console.log(합계);
  // 출력: 12500

  const 할인후 = getDiscounted(합계, 20);
  console.log(할인후);
  // 출력: 10000

  console.log(할인후 + getShipping(할인후));
  // 출력: 13000
}
// 해설 ① reduce 의 시작값 0 이 숫자라 total 도 숫자로 정해집니다(JS자료 08단원).
// 해설 ② 합계가 number 니까 getDiscounted 에 그대로 넘어갑니다.
//        중간에 문자열이 섞였다면 여기서 걸렸을 것입니다.
// 해설 ③ 할인 뒤 금액이 30000 미만이라 배송비 3000 이 붙습니다.
//        20% 를 DEFAULT_PERCENT 로 바꾸면 11250 + 3000 = 14250 이 됩니다.


// ───── 문제 13 ─────
{
  const 주문금액 = [12000, 35000, 8000];

  console.log(주문금액.map((금액) => 금액 + getShipping(금액)));
  // 출력: [ 15000, 35000, 11000 ]
}
// 해설 ① 35000 은 30000 이상이라 배송비가 0 입니다. 그래서 그대로 35000 입니다.
// 해설 ② map 이 number[] 를 돌려줍니다. getShipping 의 반환이 number 라고
//        .d.ts 에 적혀 있기 때문입니다.
// 해설 ③ 만약 .d.ts 에 string 이라고 잘못 적혀 있었어도 출력은 그대로입니다.
//        .d.ts 는 검사할 때만 읽고 실행에는 아무 영향이 없기 때문입니다.
//        실제 .js 가 숫자를 돌려주니 + 는 그대로 숫자 덧셈입니다.
//        위험한 것은 출력이 바뀌는 게 아니라, 검사가 조용한 채로
//        getShipping(12500).toUpperCase() 같은 줄을 통과시킨다는 점입니다.
//        그 줄은 실행해야 TypeError 로 터집니다. 개념04 섹션5가 말하는 위험입니다.


// ───── 문제 14 ─────
{
  console.log(typeof getShipping(12500));
  // 출력: number
  console.log(typeof DEFAULT_PERCENT);
  // 출력: number
}
// 해설 ① typeof 는 실행할 때 진짜 타입을 봅니다. 타입 검사와는 다른 것입니다.
// 해설 ② .d.ts 에 적은 것과 실제가 같으면 이렇게 number 가 나옵니다.
//        다르게 적혀 있어도 검사는 조용하니, 이렇게 한 번 찍어 보는 것이
//        손으로 적은 선언 파일을 확인하는 가장 쉬운 방법입니다.
// 해설 ③ 04단원 개념04 섹션3의 "타입은 약속이지 검사가 아니다" 가
//        선언 파일에서는 특히 위험합니다. 약속을 내가 적기 때문입니다.


// ───── 문제 15 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   npm run check
//   08_기존_프로젝트에_타입_입히기/연습문제.ts(줄,열): error TS1294:
//   This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
//    재현:
//    enum Color { Red, Blue }
//    void Color;
//
// 해설 ① node 가 .ts 를 실행하는 방식은 '타입을 지우는 것' 뿐입니다.
//        enum 은 지운다고 되는 문법이 아닙니다. 실제로 객체를 만들어야 합니다.
// 해설 ② 그래서 그냥 두면 실행할 때 이렇게 터집니다.
//        SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]:
//        TypeScript enum is not supported in strip-only mode
//        검사 단계에서 미리 막아 두면 이 사고를 안 겪습니다.
// 해설 ③ 같은 이유로 클래스의 '매개변수 속성'(constructor(private name: string))도
//        막혀 있습니다. 둘 다 안 써도 되는 문법입니다.
//        enum 은 05단원의 리터럴 유니온으로 대신합니다(문제 6).
