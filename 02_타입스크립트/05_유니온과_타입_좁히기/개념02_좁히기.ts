// ============================================================
// 05단원 · 개념 02 — 좁히기: 확인하면 쓸 수 있다  ★ 실무 체감 1위
// ------------------------------------------------------------
// 실행: node 개념02_좁히기.ts
// 검사: npm run typecheck
// ============================================================
//
// 개념01에서 이렇게 끝났습니다.
//
//     유니온 값으로는 공통으로 있는 것만 쓸 수 있다.
//     "지금 어느 쪽인지" 를 확인하면 그쪽 기능을 다 쓸 수 있다.
//
// 그 '확인' 을 타입 좁히기(narrowing)라고 합니다.
//
// 문법을 새로 배우는 게 아닙니다. JS자료에서 쓰던 if · typeof 그대로입니다.
// 달라진 것은 타입스크립트가 그 if 를 읽고 안쪽에서 타입을 바꿔 준다는 것뿐입니다.


// ── 섹션 1: typeof 로 좁히기 ──

function describe(value: string | number) {
  if (typeof value === "string") {
    // 이 안에서 value 는 string 입니다
    console.log("글자 " + value.length + "자");
  } else {
    // 여기서는 number 입니다
    console.log("숫자 " + value.toFixed(1));
  }
}

describe("아메리카노");
// 출력: 글자 5자
describe(4500);
// 출력: 숫자 4500.0

// if 안에서 .length 를, else 에서 .toFixed 를 썼습니다.
// 개념01 섹션2에서는 둘 다 막혔던 것입니다.
//
// 재미있는 것은 else 쪽입니다.
// "문자열이 아니다" 만 알려 줬는데, string | number 에서 string 을 빼면
// number 밖에 안 남으니 알아서 number 로 봅니다.

// ✏️ 직접 해보기 1 — boolean 을 유니온에 추가하고(string | number | boolean)
//    describe 를 돌려 보세요. else 쪽이 여전히 통과하나요?


// ── 섹션 2: === 로 좁히기 (리터럴 유니온) ──

type Status = "대기" | "조리중" | "완료";

function statusMessage(status: Status) {
  if (status === "대기") {
    return "곧 시작합니다";
  } else if (status === "조리중") {
    return "만들고 있어요";
  } else {
    // 여기서 status 는 "완료" 하나만 남았습니다
    return "나왔습니다";
  }
}

console.log(statusMessage("대기"));
// 출력: 곧 시작합니다
console.log(statusMessage("완료"));
// 출력: 나왔습니다

// switch 로 써도 똑같이 좁혀집니다. 이쪽이 더 읽기 좋을 때가 많습니다.
function statusEmoji(status: Status): string {
  switch (status) {
    case "대기":
      return "[  ]";
    case "조리중":
      return "[..]";
    case "완료":
      return "[OK]";
  }
}
console.log(statusEmoji("조리중"));
// 출력: [..]

// 위 함수에 return 이 없는 길이 없다는 점에 주목하세요.
// 세 경우를 다 적었으니 타입스크립트가 "다 덮었다" 고 인정해 줍니다.
// 하나라도 빠뜨리면 이렇게 됩니다.
//
// 에러: TS2366 Function lacks ending return statement and return type does not include 'undefined'.
// function statusEmojiBroken(status: Status): string {
//   switch (status) {
//     case "대기":
//       return "[  ]";
//     case "조리중":
//       return "[..]";
//   }
// }
//
// 실수: "완료" 일 때 돌려줄 것이 없다는 뜻입니다.
//       나중에 Status 에 "취소" 를 추가하면, 이 함수가 그 자리에서 걸립니다.
//       → 상태를 하나 늘렸을 때 고쳐야 할 곳을 타입이 전부 찾아 줍니다.
//       이게 리터럴 유니온을 쓰는 가장 큰 이득입니다.

// ✏️ 직접 해보기 2 — Status 에 "취소" 를 추가해 보세요.
//    어느 함수가 걸리나요? 확인한 뒤 되돌리세요.


// ── 섹션 3: Array.isArray 로 좁히기 ──

function printNames(value: string | string[]) {
  if (Array.isArray(value)) {
    console.log(value.join(", "));
  } else {
    console.log(value);
  }
}

printNames("아메리카노");
// 출력: 아메리카노
printNames(["아메리카노", "라떼"]);
// 출력: 아메리카노, 라떼

// typeof 로는 배열을 못 가립니다. 배열의 typeof 는 "object" 이기 때문입니다.
console.log(typeof ["a"]);
// 출력: object
// JS자료 06단원에서 배운 그 함정입니다. 그래서 Array.isArray 를 씁니다.

// ✏️ 직접 해보기 3 — number | number[] 를 받아
//    하나면 그대로, 배열이면 합계를 출력하는 함수를 만들어 보세요.


// ── 섹션 4: 그냥 if (값) 로 좁히기 — 그리고 함정 ──

// 03단원·04단원에서 계속 쓰던 방법입니다.
function showMemo(memo?: string) {
  if (memo) {
    console.log("메모:", memo.length, "자");
  } else {
    console.log("메모 없음");
  }
}
showMemo("얼음 적게");
// 출력: 메모: 5 자
showMemo();
// 출력: 메모 없음

// 편하지만 함정이 있습니다. JS자료 01단원의 falsy 목록을 떠올리세요.
//
//     0 · "" · null · undefined · NaN · false
//
// 이 값들은 '있는데도' else 로 갑니다.
function showCount(count?: number) {
  if (count) {
    console.log("수량:", count);
  } else {
    console.log("수량 없음");
  }
}
showCount(3);
// 출력: 수량: 3
showCount(0);
// 출력: 수량 없음
// ← 0잔이라고 분명히 넘겼는데 "없음" 이 됐습니다. 이게 함정입니다.

// 그래서 숫자·문자열에는 undefined 인지를 직접 물어봅니다.
function showCountSafe(count?: number) {
  if (count !== undefined) {
    console.log("수량:", count);
  } else {
    console.log("수량 없음");
  }
}
showCountSafe(0);
// 출력: 수량: 0

// 규칙으로 정리하면 이렇습니다.
//
//     객체·배열     →  if (값) 로 충분하다
//     숫자·문자열   →  if (값 !== undefined) 로 물어봐야 한다
//                      (0 과 "" 이 있는 값인데도 falsy 라서)

// ✏️ 직접 해보기 4 — showMemo 에 "" (빈 문자열)을 넘겨 보세요.
//    무엇이 출력되나요? 그게 맞는 동작일까요?


// ── 섹션 5: 좁힌 것은 어디까지 유지되나 ──

function process(value: string | number) {
  if (typeof value !== "string") {
    // 문자열이 아니면 여기서 끝냅니다
    console.log("숫자라서 그냥 씁니다:", value.toFixed(0));
    return;
  }

  // return 으로 걸러 냈으니, 이 아래는 전부 string 입니다
  console.log(value.toUpperCase());
  console.log(value.length);
}

process(4500);
// 출력: 숫자라서 그냥 씁니다: 4500
process("latte");
// 출력: LATTE
// 출력: 5

// if 블록 안이 아니라 '그 아래 전체' 가 좁혀졌습니다.
// 아니면 먼저 돌려보내는 이 방식을 '이른 반환' 이라고 하고,
// 중첩이 깊어지는 것을 막아 주어 실무에서 많이 씁니다.

// 다만 좁힌 뒤에 다른 값을 넣으면 그때부터 풀립니다.
function reassign(value: string | number) {
  if (typeof value === "string") {
    console.log(value.length);
    value = 100; // 여기서 숫자를 넣었습니다
    //
    // 에러: TS2339 Property 'length' does not exist on type 'number'.
    // console.log(value.length);
    //
    // 실수: 같은 if 안인데도 아래에서는 안 됩니다.
    //       타입스크립트는 블록이 아니라 '줄 순서' 를 따라갑니다.
    console.log(value.toFixed(0));
  }
}
reassign("latte");
// 출력: 5
// 출력: 100

// ✏️ 직접 해보기 5 — process 에서 return; 을 지워 보세요.
//    아래 두 줄이 걸리나요? 왜 그럴까요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] typeof 결과를 오타로 쓰기
//   typeof v === "sting" 은 영원히 false 입니다.
//   다행히 이건 타입스크립트가 잡아 줍니다(TS2367).
//   JS 에서는 조용히 안 걸리는 버그였습니다.

// [실수 2] 배열을 typeof 로 가리려 하기
//   typeof [] 는 "object" 입니다. Array.isArray 를 쓰세요.

// [실수 3] if (count) 로 숫자를 확인하기
//   0 이 없는 것 취급됩니다. 섹션 4의 함정입니다.
//   실무 버그로 가장 자주 나오는 자리입니다.

// [실수 4] 좁혀 놓고, 그 변수에 나중에 다시 값을 넣기
//   if (memo) { setTimeout(() => memo.length, 100) } 자체는 통과합니다.
//   그런데 같은 함수 어딘가에서 memo = "z"; 처럼 다시 대입하면
//   콜백 안의 좁힘이 풀려 TS18048 이 납니다. 나중에 실행되니 확신할 수 없어서입니다.
//   그럴 때는 const m = memo; 처럼 상수에 담아 두면 풀립니다.


// ── 정리 ──

// 1. 유니온은 확인하면 그쪽 기능을 다 쓸 수 있다. 이것이 좁히기다.
// 2. 문법은 JS 그대로다. typeof · === · switch · Array.isArray · if (값).
// 3. else 쪽은 "나머지" 로 알아서 좁혀진다. 두 개짜리 유니온이면 하나만 남는다.
// 4. switch 로 리터럴 유니온을 다 덮으면 return 이 빠졌다는 에러가 안 난다.
//    나중에 값을 하나 추가하면 고쳐야 할 곳을 타입이 전부 찾아 준다.
// 5. if (값) 은 0 과 "" 도 없는 것으로 친다. 숫자·문자열에는 !== undefined 를 쓴다.
// 6. 좁힌 상태는 줄 순서를 따라간다. 이른 반환을 쓰면 아래 전체가 좁혀진다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 걸립니다.
//    error TS2339: Property 'toFixed' does not exist on type 'number | boolean'.
//    string 을 빼고도 number | boolean 이 남기 때문입니다.
//    else 가 "나머지 전부" 라는 것이 여기서 분명해집니다.
//    재현:
//    function describe(value: string | number | boolean) {
//      if (typeof value === "string") { console.log(value.length); }
//      else { console.log(value.toFixed(1)); }
//    }
//    셋 이상이면 else if 로 하나씩 더 걸러야 합니다.
//
// 2) statusEmoji 가 걸립니다.
//    error TS2366: Function lacks ending return statement and return type
//    does not include 'undefined'.
//    "취소" 일 때 돌려줄 것이 없다는 뜻입니다.
//    statusMessage 는 else 로 나머지를 다 받고 있어서 안 걸립니다.
//    재현:
//    type Status = "대기" | "조리중" | "완료" | "취소";
//    function statusEmoji(status: Status): string {
//      switch (status) {
//        case "대기": return "[  ]";
//        case "조리중": return "[..]";
//        case "완료": return "[OK]";
//      }
//    }
//    → else 로 뭉뚱그리면 편하지만, 이런 알림을 못 받습니다. switch 쪽이 안전합니다.
//
// 3) function sumAll(v: number | number[]) {
//      if (Array.isArray(v)) {
//        console.log(v.reduce((a, b) => a + b, 0));
//      } else {
//        console.log(v);
//      }
//    }
//    sumAll(5);                                // 출력: 5
//    sumAll([1, 2, 3]);                        // 출력: 6
//
// 4) "메모 없음" 이 출력됩니다.
//    빈 문자열은 falsy 라서 else 로 갑니다.
//    "메모를 빈칸으로 남긴 것" 과 "메모를 아예 안 쓴 것" 이 구별되지 않습니다.
//    구별해야 한다면 if (memo !== undefined) 를 써야 합니다.
//
// 5) 걸립니다.
//    error TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
//    return 이 없으면 숫자인 경우도 아래로 흘러 내려오기 때문입니다.
//    재현:
//    function process(value: string | number) {
//      if (typeof value !== "string") { console.log(value.toFixed(0)); }
//      console.log(value.toUpperCase());
//    }
//    이른 반환이 좁히기와 잘 맞는 이유가 이것입니다.
//    걸러 낸 뒤 돌려보내야 그 아래가 깨끗해집니다.
