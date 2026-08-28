// ============================================================
// 01단원 연습문제 정답 — 타입스크립트 시작하기
// ------------------------------------------------------------
// 실행: node 연습문제_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

console.log("=== 01단원 연습문제 ===");
// 출력: === 01단원 연습문제 ===


// ───── 문제 1 ─────
{
  const seatCount: number = 24;
  console.log(seatCount);
  // 출력: 24
}
// 해설 ① 이름 뒤에 : 과 종류를 씁니다. 이게 타입 표기의 전부입니다.
// 해설 ② 사실 이 줄은 타입을 안 붙여도 됩니다. 24 를 보고 타입스크립트가
//        알아서 number 라고 압니다. 그것을 '추론' 이라 하고 02단원에서 배웁니다.
//        지금은 손에 익히려고 일부러 적는 것입니다.
// 해설 ③ 흔한 실수 — const seatCount = number 24; 처럼 쓰는 것.
//        타입은 = 왼쪽, 값은 = 오른쪽입니다.


// ───── 문제 2 ─────
{
  const menuName: string = "아메리카노";
  const isHot: boolean = true;
  console.log(menuName, isHot);
  // 출력: 아메리카노 true
}
// 해설 ① 참/거짓의 타입 이름은 boolean 입니다. bool 이나 Boolean 이 아닙니다.
// 해설 ② 대문자로 시작하는 String / Number / Boolean 도 문법상 되기는 하지만
//        전혀 다른 것이고 쓰면 안 됩니다. 02단원에서 이유를 설명합니다.
// 해설 ③ 타입 이름은 전부 소문자로 시작한다고 외워 두면 편합니다.


// ───── 문제 3 ─────
{
  const quantityText = "2";
  const shipping = 3000;
  console.log(typeof (quantityText + shipping));
  // 출력: string
}
// 해설 ① 문자열에 + 를 쓰면 숫자가 섞여 있어도 결과는 문자열입니다.
//        실제 값은 "23000" 입니다. 2 + 3000 = 3002 가 아닙니다.
// 해설 ② 이 줄은 타입 검사도 통과합니다. 개념01 섹션1에서 본 그대로입니다.
//        이어붙이기는 정당한 연산이라 타입스크립트가 막을 이유가 없습니다.
// 해설 ③ typeof 를 쓸 때 괄호를 빠뜨려 typeof quantityText + shipping 이라고 쓰면
//        "string3000" 이 나옵니다. typeof 가 먼저 붙어 버리기 때문입니다.


// ───── 문제 4 ─────
{
  const quantityText = "2";
  const shipping = 3000;
  const total: number = Number(quantityText) + shipping;
  console.log(total);
  // 출력: 3002
}
// 해설 ① : number 라고 적어 두었기 때문에 Number( ) 를 빼면 그 자리에서 걸립니다.
//        error TS2322: Type 'string' is not assignable to type 'number'.
//    재현:
//    const quantityText = "2";
//    const shipping = 3000;
//    const total: number = quantityText + shipping;
// 해설 ② 이게 개념01 섹션3의 핵심입니다. 타입을 적어 둔 자리에서만 걸립니다.
//        문제 3처럼 그냥 출력만 하면 아무도 안 막아 줍니다.
// 해설 ③ Number( ) 대신 parseInt( ) 도 됩니다. JS자료 01단원 개념05를 보세요.


// ───── 문제 5 ─────
{
  console.log(2);
  // 출력: 2
}
// 해설 ① 2번만 잡힙니다. 숫자 자리에 문자열이 왔기 때문입니다.
// 해설 ② 1번(-5)은 타입이 number 라서 통과합니다. 나이가 음수인 것이
//        말이 안 된다는 것은 타입의 관심사가 아닙니다.
// 해설 ③ 3번도 통과합니다. 1000 도 2000 도 결과도 전부 number 입니다.
//        "더해야 하는데 뺐다" 는 사람만 알 수 있는 일입니다.
//        → 타입 검사를 통과했다는 것과 코드가 맞다는 것은 다른 말입니다.


// ───── 문제 6 ─────
{
  console.log("4000");
  // 출력: 4000
  console.log("string");
  // 출력: string
}
// 해설 ① node 는 타입을 검사하지 않고 지웁니다. 그래서 4000 이 그대로 찍힙니다.
// 해설 ② 화면에 찍힌 4000 은 문자열 "4000" 입니다. 눈으로는 구별이 안 됩니다.
//        typeof 로 찍어 봐야 string 인 것이 드러납니다.
// 해설 ③ 이걸 직접 본 것이 개념02 섹션3의 틀린예제입니다.


// ───── 문제 7 ─────
{
  console.log("통과");
  // 출력: 통과
  console.log("VS Code 빨간 밑줄");
  // 출력: VS Code 빨간 밑줄
  console.log("npx tsc --noEmit");
  // 출력: npx tsc --noEmit
}
// 해설 ⓪ 둘뿐입니다. node 로 실행해서는 절대 안 보입니다. 그게 이 단원 전체의 이야기입니다.
// 해설 ① tsc 는 문제가 없으면 아무 말도 안 합니다. '성공' 같은 글자는 안 나옵니다.
// 해설 ② 처음에는 "명령이 안 먹었나?" 싶은데 그게 정상입니다.
// 해설 ③ 반대로 뭔가 나왔다면 전부 고쳐야 할 것입니다. 경고와 에러의 구분이 없습니다.


// ───── 문제 8 ─────
{
  const seatCount: number = 24;
  console.log(seatCount + 1);
  // 출력: 25
}
// 해설 ① 고치기 전 에러는 이렇습니다.
//        연습문제.ts(줄,9): error TS2322: Type 'string' is not assignable to type 'number'.
//        재현:
//        const seatCount: number = "24";
//        console.log(seatCount + 1);
//        괄호 안에서 앞이 줄, 뒤가 열(그 줄의 몇 번째 글자)입니다.
// 해설 ② 고치기 전에 node 로 돌리면 "241" 이 나옵니다. 에러가 아닙니다.
//        "24" + 1 이 이어붙이기가 되기 때문입니다(01단원 개념01 섹션1).
//        → 검사는 걸리고 실행은 조용히 틀린, 이 단원의 전형적인 자리입니다.
// 해설 ③ 열 번호는 한 줄에 값이 여러 개일 때 쓸모가 있습니다.
//        배열 [90, 85, "칠십"] 에서 어느 값이 문제인지 알려 줍니다.


// ───── 문제 9 ─────
{
  console.log("내가 넣은 것:", "boolean");
  // 출력: 내가 넣은 것: boolean
  console.log("들어가야 하는 것:", "string");
  // 출력: 들어가야 하는 것: string
}
// 해설 ① Type 'A' is not assignable to type 'B' 에서
//        A 가 내가 넣은 것, B 가 들어가야 하는 것입니다.
// 해설 ② 순서를 거꾸로 읽으면 엉뚱한 곳을 고치게 됩니다. 가장 흔한 오독입니다.
// 해설 ③ 외우는 법 — 앞에 있는 것이 '지금 상태', 뒤에 있는 것이 '되어야 할 상태'.


// ───── 문제 10 ─────
{
  const stockText = "12";
  const sold = 5;
  const left: number = Number(stockText) - sold;
  console.log(left);
  // 출력: 7
}
// 해설 ① 걸리는 줄은 const left = stockText - sold; 입니다.
//        error TS2362: The left-hand side of an arithmetic operation must be ...
//    재현:
//    const stockText = "12";
//    const sold = 5;
//    const left = stockText - sold;
// 해설 ② 문제 4와 달리 이번에는 : number 를 안 적어도 걸립니다.
//        - 는 숫자 전용 연산이라 그 자체로 안 되기 때문입니다.
//        + 만 특별하다는 것을 다시 확인하세요.
// 해설 ③ JS 에서는 이 줄이 조용히 7 을 내놓았습니다. 우연히 맞았던 것입니다.
//        stockText 가 "12개" 였다면 NaN 이 됐을 것입니다.


// ───── 문제 11 ─────
{
  console.log("TS2339");
  // 출력: TS2339
}
// 해설 ① Property 'toUpperCase' does not exist on type 'number'.
//        숫자에는 toUpperCase 가 없습니다. 문자열에만 있습니다.
// 해설 ② TS2551 이 아닌 이유는 비슷한 이름 후보를 못 찾았기 때문입니다.
//        number 에 toUpperCase 와 닮은 이름이 아예 없습니다.
// 해설 ③ JS 에서는 실행하다가 TypeError 로 터지던 자리입니다.
//        타입스크립트는 실행 전에 잡습니다.


// ───── 문제 12 ─────
{
  const unitPrice: number = 4000;
  const quantityText: string = "2";
  const shipping: number = 3000;

  const total: number = unitPrice * Number(quantityText) + shipping;
  console.log("총액: " + total + "원");
  // 출력: 총액: 11000원
}
// 해설 ① unitPrice * quantityText 를 그대로 쓰면 TS2363 으로 걸립니다.
//        곱하기의 오른쪽도 숫자여야 하기 때문입니다.
//        (왼쪽이면 TS2362, 오른쪽이면 TS2363 입니다)
// 해설 ② 마지막 줄의 + 는 일부러 쓴 이어붙이기입니다.
//        결과를 string 자리에 담을 것이므로 이건 올바른 사용입니다.
//        console.log("총액:", total + "원") 처럼 써도 됩니다.
// 해설 ③ 흔한 실수 — Number( ) 를 total 전체에 씌우는 것.
//        Number(unitPrice * quantityText) 로는 안 걸러집니다.
//        문자열인 quantityText 하나에만 씌워야 합니다.


// ───── 문제 13 ─────
// 주석을 풀면 이렇게 됩니다.
//
//   ① node 연습문제.ts
//      여는 시간: 아홉시
//      → 아무 일도 안 일어납니다. 그냥 돌아갑니다.
//        : number 라고 적어 놓았는데 한글이 그대로 찍힙니다.
//
//   ② npx tsc --noEmit
//      연습문제.ts(줄,열): error TS2322:
//      Type 'string' is not assignable to type 'number'.
//    재현:
//    const openHour: number = "아홉시";
//      → 여기서 걸립니다.
//
// 해설 ① 이 단원에서 제일 중요한 것이 이 차이입니다.
//        node 는 실행만, tsc 는 검사만 합니다.
// 해설 ② 그래서 "돌아가니까 맞겠지" 가 통하지 않습니다.
//        저장할 때마다 VS Code 의 빨간 밑줄을 보는 습관을 들이세요.
// 해설 ③ 07단원에서 Vite 를 쓸 때도 똑같습니다. Vite 도 타입을 지웁니다.
//        도구가 바뀌어도 이 구조는 그대로입니다.
