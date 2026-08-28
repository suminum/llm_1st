// ============================================================
// 02단원 · 개념 01 — 기본 타입
// ------------------------------------------------------------
// 실행: node 개념01_기본_타입.ts
// 검사: npm run typecheck
// ============================================================
//
// 01단원에서 : number 와 : string 을 봤습니다.
// 이 파일에서는 실제로 쓰게 될 기본 타입을 한 번에 정리합니다.
//
// 개수가 적습니다. string · number · boolean 셋 + 배열이 전부입니다.


// ── 섹션 1: string · number · boolean ──

// 이 셋이 전체의 90% 입니다.
const cafeName: string = "봄날카페";
const seatCount: number = 24;
const isOpen: boolean = true;

console.log(cafeName, seatCount, isOpen);
// 출력: 봄날카페 24 true

// 이름은 전부 소문자로 시작합니다. 이것만 지키면 됩니다.
//
//     string    글자
//     number    숫자 (정수·소수 구분이 없습니다)
//     boolean   true / false
//
// JS자료 01단원에서 typeof 로 찍어 보던 그 이름과 똑같습니다.
console.log(typeof cafeName, typeof seatCount, typeof isOpen);
// 출력: string number boolean

// number 는 정수와 소수를 나누지 않습니다. 둘 다 number 입니다.
const price: number = 4500;
const rate: number = 0.1;
console.log(price * rate);
// 출력: 450

// ✏️ 직접 해보기 1 — 여러분 이름(string), 나이(number),
//    커피를 좋아하는지(boolean) 를 타입과 함께 만들어 출력해 보세요.


// ── 섹션 2: 대문자로 시작하는 String 은 쓰면 안 된다 ──

// 문법상으로는 이렇게도 써집니다.
const wrong: String = "이것도 되기는 합니다";
console.log(wrong);
// 출력: 이것도 되기는 합니다

// 되기는 하는데 쓰면 안 됩니다. 다른 것이기 때문입니다.
//
//     string   우리가 쓰는 글자값
//     String   글자를 감싼 '객체'  ← JS자료 06단원에서 잠깐 나온 그것
//
// 문제가 언제 생기냐면 이럴 때입니다.
//
// 에러: TS2322 Type 'String' is not assignable to type 'string'.
// const plain: string = wrong;
//
// 실수: String 은 string 자리에 못 들어갑니다. 반대는 됩니다.
//       규칙은 하나입니다 — 타입 이름은 전부 소문자.
//       Number, Boolean 도 마찬가지입니다.

// ✏️ 직접 해보기 2 — const n: Number = 3; 을 만들고
//    const m: number = n; 을 써 보세요. 무슨 에러가 나는지 확인 후 지우세요.


// ── 섹션 3: 배열 — 타입 뒤에 [] ──

// 배열은 "무엇이 들어 있는 배열인가" 를 적습니다.
const menus: string[] = ["아메리카노", "라떼", "카페모카"];
const prices: number[] = [4000, 4500, 5000];

console.log(menus);
// 출력: [ '아메리카노', '라떼', '카페모카' ]
console.log(prices.length);
// 출력: 3

// string[] 은 "문자열이 들어 있는 배열" 이라고 읽습니다.
// [] 는 "여러 개" 라는 뜻입니다.

// 다른 종류를 넣으면 그 자리에서 걸립니다.
//
// 에러: TS2322 Type 'number' is not assignable to type 'string'.
// const wrongMenus: string[] = ["아메리카노", 4500];
//
// 실수: 배열 전체가 아니라 4500 이 있는 자리를 콕 집어 줍니다.
//       열 번호를 보면 몇 번째 값인지 알 수 있습니다.

// 배열에 넣을 때도 검사합니다.
const newMenus: string[] = ["아메리카노"];
newMenus.push("라떼");
console.log(newMenus);
// 출력: [ '아메리카노', '라떼' ]

// 에러: TS2345 Argument of type 'number' is not assignable to parameter of type 'string'.
// newMenus.push(4500);
//
// 실수: push 는 '넘기는' 것이라 TS2345 입니다. 01단원 개념03 ④ 를 보세요.
//       담을 때는 TS2322, 넘길 때는 TS2345 — 이 구분이 계속 나옵니다.

// ✏️ 직접 해보기 3 — boolean 이 들어가는 배열 checkList 를 만들고
//    [true, false, true] 를 담아 출력해 보세요.


// ── 섹션 4: 배열 안의 값을 꺼내 쓸 때 ──

// 배열에서 꺼낸 값에는 그 배열의 타입이 그대로 붙습니다.
const firstMenu = menus[0];
console.log(firstMenu.toUpperCase());
// 출력: 아메리카노

// firstMenu 는 string 이라서 toUpperCase 를 쓸 수 있습니다.
// (한글은 대문자가 없어서 그대로 나옵니다)

// 숫자 배열에서 꺼낸 값에는 문자열 메소드를 못 씁니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'number'.
// console.log(prices[0].toUpperCase());
//
// 실수: prices 는 number[] 니까 prices[0] 은 number 입니다.
//       JS 에서는 실행하다 TypeError 로 터지던 자리입니다.

// 배열끼리 섞으면 이렇게 됩니다.
const mixed = [1, "둘", 3];
console.log(mixed);
// 출력: [ 1, '둘', 3 ]

// mixed 의 타입은 (string | number)[] 가 됩니다.
// "문자열이거나 숫자인 것들의 배열" 이라는 뜻입니다.
// 세로줄( | )이 '이거나' 입니다. 05단원에서 제대로 배웁니다.
//
// 이렇게 섞인 배열은 꺼내 써먹기가 번거롭습니다.
//
// 에러: TS2339 Property 'toUpperCase' does not exist on type 'string | number'.
// console.log(mixed[0].toUpperCase());
//
// 실수: "문자열일 수도 숫자일 수도 있는데 toUpperCase 를 쓰겠다고요?" 입니다.
//       숫자일 때는 없는 기능이니까요.
//       → 배열에는 되도록 한 종류만 넣으세요. 이게 실무 규칙입니다.

// ✏️ 직접 해보기 4 — prices 의 첫 번째 값에 100 을 더해 출력해 보세요.


// ── 섹션 5: 자리마다 종류가 다른 배열 — 튜플 ──

// string[] 은 "문자열이 몇 개든" 입니다. 개수도 순서도 정해져 있지 않습니다.
// 그런데 "첫 번째는 이름, 두 번째는 가격" 처럼 자리가 정해진 경우가 있습니다.
// 그때는 대괄호 안에 종류를 순서대로 적습니다.

const 메뉴한줄: [string, number] = ["아메리카노", 4000];

console.log(메뉴한줄[0]);
// 출력: 아메리카노
console.log(메뉴한줄[1] + 500);
// 출력: 4500

// [0] 은 string, [1] 은 number 로 나옵니다. 자리마다 종류가 다릅니다.
// (string | number)[] 과는 다릅니다. 그쪽은 꺼낼 때마다 어느 쪽인지 확인해야 합니다.
// 튜플은 자리로 이미 정해져 있어서 바로 쓸 수 있습니다.

// 순서를 바꾸면 두 자리 다 걸립니다.
//
// 에러: TS2322 Type 'number' is not assignable to type 'string'.
// 에러: TS2322 Type 'string' is not assignable to type 'number'.
// const 뒤집힘: [string, number] = [4000, "아메리카노"];

// 개수도 약속입니다. 튜플은 길이까지 정해 둔 것입니다.
//
// 에러: TS2322 Type '[string]' is not assignable to type '[string, number]'.
// const 짧음: [string, number] = ["아메리카노"];

// 07단원에서 만날 React 의 useState 가 바로 이 모양입니다.
//
//     const [count, setCount] = useState(0);
//     //     ^ number   ^ 값을 바꾸는 함수
//
// 배열처럼 생겼는데 자리마다 종류가 다른 것 — 그게 튜플입니다.
// 자주 쓰지는 않습니다. 자리가 두셋으로 딱 정해진 것에만 쓰고,
// 그보다 늘어나면 객체로 이름을 붙이는 편이 낫습니다(04단원).

// ✏️ 직접 해보기 5 — [string, number, boolean] 로 주문한줄 을 만들고
//    세 값을 각각 출력해 보세요. 두 번째 자리에 문자열을 넣으면 어떻게 되나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] 타입 이름을 대문자로 쓰기
//   String / Number / Boolean 은 다른 것입니다. 섹션 2를 보세요.
//   VS Code 가 자동완성으로 대문자를 먼저 보여 줄 때가 있어 잘 걸립니다.

// [실수 2] 배열 타입을 []string 이라고 쓰기
//   순서가 반대입니다. string[] 입니다. "무엇이" 가 먼저입니다.

// [실수 3] 배열에 여러 종류를 섞어 넣기
//   문법상 되지만 꺼내 쓸 때마다 걸립니다. 섹션 4 마지막을 보세요.

// [실수 4] number 에 정수·소수 구분이 있다고 생각하기
//   int 나 float 같은 것은 없습니다. 전부 number 입니다.
//   (다른 언어를 해 본 분들이 자주 찾습니다)


// ── 정리 ──

// 1. 기본 타입은 string · number · boolean 셋이면 대부분 끝난다.
// 2. 타입 이름은 전부 소문자로 시작한다. String 은 다른 것이니 쓰지 않는다.
// 3. 배열은 종류 뒤에 [] 를 붙인다. string[] = 문자열들의 배열.
// 4. 배열에서 꺼낸 값에는 그 종류가 그대로 붙는다. number[] 에서 꺼내면 number.
// 5. 담을 때 안 맞으면 TS2322, 넘길 때 안 맞으면 TS2345.
// 6. number 에 정수·소수 구분은 없다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) const myName: string = "홍길동";
//    const myAge: number = 25;
//    const likesCoffee: boolean = true;
//    console.log(myName, myAge, likesCoffee);    // 출력: 홍길동 25 true
//
// 2) error TS2322: Type 'Number' is not assignable to type 'number'.
//    재현:
//    const n: Number = 3;
//    const m: number = n;
//    대문자 Number 를 소문자 number 자리에 넣을 수 없습니다.
//    반대로 const n2: Number = 3; 은 됩니다. 그래서 더 헷갈립니다.
//    소문자만 쓰면 이 문제는 아예 안 생깁니다.
//
// 3) const checkList: boolean[] = [true, false, true];
//    console.log(checkList);                    // 출력: [ true, false, true ]
//
// 4) console.log(prices[0] + 100);              // 출력: 4100
//    prices[0] 이 number 라서 그냥 더해집니다.
//    menus[0] + 100 이었다면 "아메리카노100" 이 됐을 것입니다.
//    (문자열에 + 는 이어붙이기 — 01단원 개념01 섹션1)
//
// 5) const 주문한줄: [string, number, boolean] = ["아메리카노", 2, true];
//    console.log(주문한줄[0]);              // 출력: 아메리카노
//    console.log(주문한줄[1]);              // 출력: 2
//    console.log(주문한줄[2]);              // 출력: true
//    두 번째에 문자열을 넣으면 그 자리에서 걸립니다.
//    error TS2322: Type 'string' is not assignable to type 'number'.
//    재현: const 잘못: [string, number, boolean] = ["아메리카노", "둘", true];
