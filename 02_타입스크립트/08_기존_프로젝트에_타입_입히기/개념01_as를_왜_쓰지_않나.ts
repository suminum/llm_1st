// ============================================================
// 08단원 · 개념 01 — as 를 왜 쓰지 않나
// ------------------------------------------------------------
// 실행: node 개념01_as를_왜_쓰지_않나.ts
// 검사: npm run typecheck
// ============================================================
//
// 이 자료가 쓰지 말라고 정한 것이 셋입니다.
//
//     any   (02단원 개념03)
//     !     (05단원 개념03 섹션5)
//     as    ← 마지막 하나입니다
//
// 셋 다 "검사를 끄는 도구" 라는 공통점이 있습니다.
// as 는 남의 코드에서 가장 자주 보게 되므로, 읽을 줄은 알아야 합니다.


// ── 섹션 1: as 는 "내가 안다고 우기는 것" 이다 ──

type Menu = { name: string; price: number };

// 04단원 개념04에서 본 그 상황입니다. 밖에서 온 값은 타입을 모릅니다.
const raw: unknown = JSON.parse('{"name":"라떼"}');

// unknown 이라 그냥은 못 씁니다(02단원 개념03 섹션5).
//
// 에러: TS18046 'raw' is of type 'unknown'.
// console.log(raw.name);

// as 를 붙이면 "이건 Menu 다" 라고 우기는 것이 됩니다. 그러면 통과합니다.
const menu = raw as Menu;
console.log(menu.name);
// 출력: 라떼

// 문제는 여기부터입니다. 저 JSON 에는 price 가 없습니다.
console.log(menu.price);
// 출력: undefined
// 타입에는 price: number 라고 적혀 있는데 실제로는 없습니다.

try {
  console.log(menu.price.toFixed(0));
} catch (e) {
  console.log("터졌습니다:", String(e));
}
// 출력: 터졌습니다: TypeError: Cannot read properties of undefined (reading 'toFixed')

// 검사는 조용했고, 실행하니 터졌습니다.
// 02단원의 any, 05단원의 ! 와 완전히 같은 구조입니다.
//
//     as 는 값을 바꾸지 않습니다. 타입스크립트의 생각만 바꿉니다.

// ✏️ 직접 해보기 1 — menu 를 만들 때 as Menu 를 지워 보세요.
//    무슨 에러가 나나요?


// ── 섹션 2: 그래도 as 가 막아 주는 것이 조금은 있다 ──

// 아무 데나 아무거나 우길 수는 없습니다.
//
// 에러: TS2352 Conversion of type 'string' to type 'number' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
// const wrong = "4500" as number;
//
// 실수: "문자열과 숫자는 너무 달라서 실수 같습니다" 라고 말립니다.
//       그런데 메시지 뒷부분을 보세요.
//       "정말 그럴 생각이면 unknown 을 거쳐 가세요" 라고 방법까지 알려 줍니다.

// 그 방법을 쓰면 정말로 통과합니다.
const forced = "4500" as unknown as number;
console.log(typeof forced);
// 출력: string
// number 라고 우겼는데 실제로는 문자열입니다. 아무도 안 막았습니다.

// as unknown as ... 를 보면 "여기서 검사를 완전히 껐다" 는 뜻입니다.
// 남의 코드에서 이걸 만나면 그 근처를 의심하세요.

// ✏️ 직접 해보기 2 — forced * 2 와 forced + 2 를 각각 출력해 보세요.
//    왜 다르게 나오나요?


// ── 섹션 3: as 대신 무엇을 쓰나 ──

// [대신 ①] 확인하고 쓰기 — 05단원에서 배운 그대로
function readMenu(text: string): Menu | null {
  const data: unknown = JSON.parse(text);
  // 조건이 여섯 줄인 이유 — 앞에서부터 하나씩 좁혀 나가기 때문입니다.
  //   ① 객체인가        ② null 이 아닌가 (typeof null 은 "object" 라서 따로 봅니다)
  //   ③④ 그 이름이 있는가   ⑤⑥ 그 이름의 값이 제 종류인가
  // ③ 과 ⑤ 를 둘 다 보는 이유는, 이름이 있어도 값이 숫자일 수 있기 때문입니다.
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "price" in data &&
    typeof data.name === "string" &&
    typeof data.price === "number"
  ) {
    return { name: data.name, price: data.price };
  }
  return null;
}

console.log(readMenu('{"name":"라떼","price":4500}'));
// 출력: { name: '라떼', price: 4500 }
console.log(readMenu('{"name":"라떼"}'));
// 출력: null

// 길긴 합니다. 그래서 실무에서는 이 일을 도구에 맡깁니다(개념03에서 소개).
// 중요한 것은 "as 로 우기는 것과 달리, 이건 진짜로 확인한다" 는 점입니다.

// [대신 ②] satisfies — "이 모양이 맞는지 검사만 해 줘"
const 확인된메뉴 = { name: "아메리카노", price: 4000 } satisfies Menu;

console.log(확인된메뉴.name);
// 출력: 아메리카노

// as 와 satisfies 의 차이가 핵심입니다.
//
//     as Menu          →  "Menu 라고 쳐 줘" (검사 안 함, 타입이 Menu 로 바뀜)
//     satisfies Menu   →  "Menu 가 맞는지 봐 줘" (검사 함, 타입은 그대로)
//
// 그래서 satisfies 는 틀리면 걸립니다.
//
// 에러: TS2741 Property 'price' is missing in type '{ name: string; }' but required in type 'Menu'.
// const 모자란메뉴 = { name: "아메리카노" } satisfies Menu;
//
// 실수: as 였다면 조용히 통과했을 자리입니다.

// 그리고 '확인은 받되 원래 타입은 그대로 남는다' 는 것도 이득입니다.
// : Menu 라고 적으면 그 변수는 그때부터 Menu 로만 보입니다.
// satisfies 는 Menu 에 맞는지 확인만 하고, 변수 자신은 적은 그대로 남습니다.
//
// 여기 Menu 는 name 이 string 이라 둘의 결과가 같습니다.
// 차이가 드러나는 것은 목표 타입이 더 헐렁할 때입니다.
//
//     type 설정 = { 모드: string; 값: string | number[] };
//
//     const a: 설정 = { 모드: "빠름", 값: [1, 2] };
//     const b       = { 모드: "빠름", 값: [1, 2] } satisfies 설정;
//
//     a.값.push(3);   // TS2339 — a.값 은 string | number[] 라 push 가 없다
//     b.값.push(3);   // 통과   — b.값 은 number[] 그대로
//
// 확인은 둘 다 받았는데, satisfies 쪽만 원래 타입이 남아 있습니다.

// ✏️ 직접 해보기 3 — { name: "라떼", price: 4500, size: "L" } 를
//    satisfies Menu 로 써 보세요. 걸리나요?


// ── 섹션 4: as 를 어쩔 수 없이 쓰는 자리 ──

// 아주 드물게, 사람이 알고 타입스크립트가 모르는 경우가 있습니다.
// 예를 들어 값 목록을 그 자리에서 바로 늘어놓을 때입니다.
//
//     (["대기", "조리중", "완료"] as Status[]).map(...)
//
// 배열 리터럴만 보면 string[] 로 추론되는데, 우리는 Status[] 인 것을 압니다.
// 이럴 때는 as 가 실용적으로 보입니다. 값이 바로 옆에 눈으로 보이니까요.
//
// 판단 기준은 이것입니다.
//
//     값이 눈앞에 있어서 내가 확인할 수 있다   →  as 를 써도 위험이 작다
//     값이 밖에서 온다(서버·파일·입력)          →  as 를 쓰면 안 된다
//
// 사고는 전부 아래쪽에서 납니다.

// 그런데 위 경우도 as 없이 됩니다. 그리고 이쪽이 더 좋습니다.
type Status = "대기" | "조리중" | "완료";
const statuses: Status[] = ["대기", "조리중", "완료"];
console.log(statuses.length);
// 출력: 3

// 이러면 목록에 오타가 있을 때 그 자리에서 걸립니다. as 로는 안 걸립니다.
// 07단원 실습프로젝트가 이 형태(STATUSES)를 쓰고 있습니다. 열어서 확인해 보세요.
//
// 그래서 이 자료는 as 를 해법으로 쓴 적이 한 번도 없습니다.
// (이 단원에 나오는 as 는 전부 "이렇게 하지 말라" 고 보여 주는 자리입니다)

// ✏️ 직접 해보기 4 — const wrong = ["대기", "취소"] as Status[]; 와
//    const wrong2: Status[] = ["대기", "취소"]; 를 각각 써 보세요. 어느 쪽이 걸리나요?


// ── 섹션 5: 자주 하는 실수 ──

// [실수 1] 에러가 나면 as 를 붙여 없애기
//   가장 흔합니다. 에러가 사라진 게 아니라 검사가 꺼진 것입니다.
//   any · ! · as 셋 다 같습니다.

// [실수 2] as 가 값을 바꾼다고 생각하기
//   안 바꿉니다. "4500" as number 를 해도 실행할 때는 여전히 문자열입니다.
//   값을 바꾸려면 Number("4500") 처럼 진짜 함수를 써야 합니다.

// [실수 3] as 와 satisfies 를 같은 것으로 알기
//   반대입니다. as 는 검사를 끄고, satisfies 는 검사만 합니다.

// [실수 4] as unknown as ... 를 아무렇지 않게 쓰기
//   타입스크립트가 "이건 실수 같다" 고 말린 것을 억지로 뚫은 것입니다.
//   그 자리는 거의 항상 설계가 잘못된 것입니다.

// [실수 5] as const 를 '금지된 as' 로 알기
//   이름만 같고 다른 것입니다. 남의 코드에서 자주 보게 되니 구별해 두세요.
//
//       const 상태들 = ["대기", "조리중", "완료"] as const;
//
//   as 는 "이 타입이라고 우겨라" 인데, as const 는 "이 값들을 그대로 굳혀라" 입니다.
//   검사를 끄는 게 아니라 오히려 더 조입니다 — 위 배열은 읽기 전용이 되어
//   상태들.push("취소") 가 TS2339 로 막힙니다.
//   이 자료는 as const 를 쓰지 않지만, 봤을 때 "아 저건 다른 거구나" 만 알면 됩니다.


// ── 정리 ──

// 1. as 는 값을 바꾸지 않는다. 타입스크립트의 생각만 바꾼다.
// 2. 우긴 것이 사실이 아니면 검사는 통과하고 실행할 때 터진다.
//    any · ! 와 완전히 같은 구조다.
// 3. 너무 동떨어진 타입으로 우기면 TS2352 로 말린다.
//    as unknown as ... 는 그것마저 뚫은 것이니 남의 코드에서 보면 의심하라.
// 4. 대신 쓸 것 — ① 확인하고 쓰기(05단원) ② satisfies
// 5. satisfies 는 "맞는지 봐 줘" 다. 틀리면 걸리고, 타입은 그대로 남는다.
// 6. 값이 눈앞에 있으면 as 도 위험이 작다. 밖에서 온 값에는 절대 쓰지 않는다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) error TS18046: 'raw' is of type 'unknown'.
//    unknown 은 확인하기 전에는 아무것도 못 하게 막습니다(02단원 개념03 섹션5).
//    as 는 그 확인을 건너뛰겠다는 뜻입니다.
//    재현:
//    const raw: unknown = JSON.parse('{"name":"라떼"}');
//    console.log(raw.name);
//
// 2) console.log(forced * 2);              // 출력: 9000
//    console.log(forced + 2);              // 출력: 45002
//    실제 값이 문자열 "4500" 이라 곱하기는 우연히 맞고 더하기는 이어붙입니다.
//    01단원 개념01의 "+ 만 특별하다" 가 마지막 단원에서 또 나옵니다.
//    number 라고 우겼으니 타입스크립트는 둘 다 숫자라고 믿고 있습니다.
//
// 3) 걸립니다.
//    error TS2353: Object literal may only specify known properties,
//    and 'size' does not exist in type 'Menu'.
//    satisfies 는 초과 속성 검사까지 그대로 합니다(04단원 개념01 섹션3).
//    as Menu 였다면 조용히 통과했을 것입니다.
//    재현:
//    type Menu = { name: string; price: number };
//    const m = { name: "라떼", price: 4500, size: "L" } satisfies Menu;
//    void m;
//
// 4) 두 번째만 걸립니다.
//    const wrong2: Status[] = ["대기", "취소"];
//    → error TS2322: Type '"취소"' is not assignable to type 'Status'.
//    as 는 우기는 것이라 오타를 못 잡고, : 타입 은 검사라서 잡습니다.
//    재현:
//    type Status = "대기" | "조리중" | "완료";
//    const wrong2: Status[] = ["대기", "취소"];
//    같은 일을 하는 두 방법 중 하나는 검사를 하고 하나는 안 합니다.
//    되도록 : 타입 쪽을 쓰세요.
