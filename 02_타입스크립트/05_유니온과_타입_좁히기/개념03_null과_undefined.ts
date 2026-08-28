// ============================================================
// 05단원 · 개념 03 — null 과 undefined 다루기
// ------------------------------------------------------------
// 실행: node 개념03_null과_undefined.ts
// 검사: npm run typecheck
// ============================================================
//
// JS 에서 가장 많이 본 에러가 아마 이것일 겁니다.
//
//     TypeError: Cannot read properties of undefined (reading 'name')
//
// 타입스크립트가 실제로 가장 크게 막아 주는 것이 바로 이 에러입니다.
// 그 방법이 이 파일입니다.


// ── 섹션 1: 둘은 다른 값이다 ──

// JS자료 01단원에서 배운 그대로입니다.
//
//     undefined  →  아직 값이 없다 (자동으로 그렇게 됨)
//     null       →  없다고 내가 정했다 (일부러 넣음)
//
// 타입스크립트에서도 이 둘은 서로 다른 타입입니다.
type MaybeName = string | null;

let name1: MaybeName = null;
console.log(name1);
// 출력: null

// 에러: TS2322 Type 'undefined' is not assignable to type 'MaybeName'.
// name1 = undefined;
//
// 실수: null 은 허용했지만 undefined 는 허용하지 않았습니다.
//       둘은 다른 값이라 따로 적어야 합니다.

name1 = "홍길동";
console.log(name1.length);
// 출력: 3
// 문자열을 넣은 아래부터는 좁혀져서 바로 쓸 수 있습니다(개념01 섹션4).

// 실무 관행은 이렇습니다.
//
//     ? 를 붙인 속성·매개변수      →  undefined
//     "값이 없음" 을 담는 변수      →  null
//     서버가 보내 주는 빈 값        →  대개 null (JSON 에 undefined 가 없어서)
//
// 헷갈리면 둘 다 받는 방법도 있습니다. 섹션 4에서 봅니다.

// ✏️ 직접 해보기 1 — string | undefined 타입 변수를 만들고
//    null 을 넣어 보세요. 걸리나요?


// ── 섹션 2: 확인하지 않으면 못 쓴다 ──

type User = { name: string; nickname: string | null };

function printUser(user: User) {
  console.log("이름:", user.name);

  // 에러: TS18047 'user.nickname' is possibly 'null'.
  // console.log("별명 길이:", user.nickname.length);
  //
  // 실수: "null 일 수도 있는데 .length 를 쓰시겠다고요?" 입니다.
  //       JS 에서는 별명 없는 사용자가 들어오는 날 터지던 자리입니다.

  if (user.nickname !== null) {
    console.log("별명 길이:", user.nickname.length);
  } else {
    console.log("별명 없음");
  }
}

printUser({ name: "홍길동", nickname: "길동이" });
// 출력: 이름: 홍길동
// 출력: 별명 길이: 3
printUser({ name: "김철수", nickname: null });
// 출력: 이름: 김철수
// 출력: 별명 없음

// 에러 번호를 구분해 두면 편합니다.
//
//     TS18047  →  null 일 수도 있다
//     TS18048  →  undefined 일 수도 있다
//
// 둘 다 possibly 라는 단어가 들어갑니다. 그것만 봐도 "확인해야겠구나" 입니다.

// ✏️ 직접 해보기 2 — 위 if 를 if (user.nickname) 으로 바꿔 보세요.
//    통과하나요? 별명이 "" 인 사용자에게는 어떻게 될까요?


// ── 섹션 3: ?. — 있으면 꺼내고 없으면 undefined ──

// 확인을 매번 if 로 쓰면 코드가 길어집니다. 짧게 쓰는 문법이 있습니다.
type Shop = { name: string; owner: { name: string; phone: string | null } | null };

const shop1: Shop = { name: "봄날카페", owner: { name: "홍길동", phone: "010-0000" } };
const shop2: Shop = { name: "무인카페", owner: null };

// ?. 는 "앞엣것이 없으면 거기서 멈추고 undefined" 라는 뜻입니다.
console.log(shop1.owner?.name);
// 출력: 홍길동
console.log(shop2.owner?.name);
// 출력: undefined

// if 로 쓰면 이만큼이 됩니다. 같은 일입니다.
if (shop2.owner !== null) {
  console.log(shop2.owner.name);
} else {
  console.log(undefined);
}
// 출력: undefined

// 여러 번 이어 쓸 수 있습니다. 중간에 하나만 없어도 전체가 undefined 입니다.
console.log(shop1.owner?.phone?.length);
// 출력: 8
console.log(shop2.owner?.phone?.length);
// 출력: undefined

// 중요한 것 — ?. 의 결과에는 undefined 가 붙습니다.
//
// 에러: TS2322 Type 'number | undefined' is not assignable to type 'number'.
// const len: number = shop1.owner?.name.length;
//
// 실수: ?. 를 썼다고 문제가 사라지는 게 아닙니다.
//       "없을 수도 있음" 이 결과로 옮겨 갈 뿐입니다.
//       메시지의 'number | undefined' 가 그것을 그대로 보여 줍니다.
//       그래서 대개 ?? 와 짝을 지어 씁니다(섹션 4).

// 함수와 배열에도 씁니다.
type Handler = { onClick?: () => void };
const h: Handler = {};
h.onClick?.();
console.log("터지지 않았습니다");
// 출력: 터지지 않았습니다
// onClick 이 없어도 그냥 넘어갑니다. JS 에서는 여기서 터졌습니다.

// ✏️ 직접 해보기 3 — shop2.owner?.phone?.length 에서 두 번째 ?. 를 지워 보세요.
//    무슨 에러가 나나요?


// ── 섹션 4: ?? — 없으면 이 값으로 ──

// ?? 는 "왼쪽이 null 이나 undefined 면 오른쪽" 이라는 뜻입니다.
const nickname1: string | null = null;
console.log(nickname1 ?? "이름없음");
// 출력: 이름없음

const nickname2: string | null = "길동이";
console.log(nickname2 ?? "이름없음");
// 출력: 길동이

// ?. 와 짝을 지으면 깔끔해집니다.
console.log(shop2.owner?.name ?? "주인 없음");
// 출력: 주인 없음

// 그리고 이제 결과에 undefined 가 안 붙으니 그냥 쓸 수 있습니다.
const ownerName: string = shop1.owner?.name ?? "주인 없음";
console.log(ownerName.length);
// 출력: 3

// ★ || 와 헷갈리지 마세요. 이게 실무에서 진짜 버그를 만듭니다.
//
//     ??  →  null 과 undefined 일 때만 오른쪽
//     ||  →  falsy 전부일 때 오른쪽 (0 · "" · false 포함)

const count: number | null = 0;
console.log(count ?? 99);
// 출력: 0
console.log(count || 99);
// 출력: 99
// ← 0잔이라고 분명히 넣었는데 99 가 됐습니다. 개념02 섹션4의 그 함정입니다.

const memo: string | null = "";
console.log(JSON.stringify(memo ?? "메모 없음"));
// 출력: ""
console.log(JSON.stringify(memo || "메모 없음"));
// 출력: "메모 없음"

// 규칙 — 기본값을 줄 때는 ?? 를 쓰세요. || 는 "비어 있으면" 을 뜻할 때만.

// ✏️ 직접 해보기 4 — false 를 담은 boolean | null 변수에
//    ?? true 와 || true 를 각각 써 보세요. 결과가 어떻게 다른가요?


// ── 섹션 5: ! 는 쓰지 않습니다 ──

// 느낌표를 붙이면 "없을 리 없다, 내가 책임진다" 는 뜻이 됩니다.
// 에러가 사라집니다. 그래서 위험합니다.
//
//     const len = shop2.owner!.name.length;
//                          └ 이것
//
// 이 줄은 검사를 통과하고, 실행하면 터집니다.
// 02단원의 any 와 똑같은 구조입니다. "검사는 통과하는데 돌리면 터진다".

const risky: Shop = shop2;
try {
  console.log(risky.owner!.name);
} catch (e) {
  console.log("터졌습니다:", String(e));
}
// 출력: 터졌습니다: TypeError: Cannot read properties of null (reading 'name')

// ★ 이 자료의 규칙 — ! 를 쓰지 않습니다. any 와 같은 급으로 취급하세요.
//
// ! 를 쓰고 싶어질 때는 대개 이 셋 중 하나입니다.
//
//   ① ?. 와 ?? 로 해결된다 (섹션 3·4)
//   ② if 로 확인하면 된다 (섹션 2)
//   ③ 애초에 null 이 들어올 수 없는 구조로 바꿀 수 있다
//
// 07단원에서 useRef 를 쓸 때 ! 를 붙이고 싶은 순간이 반드시 옵니다.
// 그때도 ?. 로 해결됩니다.

// ✏️ 직접 해보기 5 — risky.owner!.name 을 risky.owner?.name ?? "없음" 으로
//    바꿔 보세요. 터지나요?


// ── 섹션 6: 자주 하는 실수 ──

// [실수 1] ?. 를 썼으니 안전하다고 믿고 그 결과를 바로 쓰기
//   ?. 의 결과에는 undefined 가 붙습니다. ?? 로 마무리해야 깨끗해집니다.

// [실수 2] 기본값에 || 를 쓰기
//   0 과 "" 이 기본값으로 바뀝니다. ?? 를 쓰세요. 섹션 4입니다.

// [실수 3] null 과 undefined 를 같은 것으로 알기
//   타입에서는 다른 값입니다. 둘 다 받으려면 string | null | undefined 입니다.
//   확인은 == null 한 번으로 둘 다 잡힙니다(=== null || === undefined 와 같음).
//   반대로 둘 다 걸러내고 값만 남기려면 != null 입니다.

// [실수 4] ! 로 에러를 없애기
//   섹션 5입니다. 에러가 없어진 게 아니라 검사가 꺼진 것입니다.


// ── 정리 ──

// 1. null 과 undefined 는 다른 타입이다. 둘 다 받으려면 둘 다 적어야 한다.
// 2. TS18047(null) · TS18048(undefined) 가 나오면 확인하고 쓰라는 뜻이다.
// 3. ?. 는 "없으면 거기서 멈추고 undefined". 여러 번 이어 쓸 수 있다.
// 4. ?. 의 결과에는 undefined 가 붙으므로 대개 ?? 와 짝지어 쓴다.
// 5. ?? 는 null·undefined 일 때만 오른쪽. || 는 0 과 "" 도 바꿔 버린다.
//    기본값에는 ?? 를 쓴다.
// 6. ★ ! 는 쓰지 않는다. any 와 같은 급이다. ?. · ?? · if 로 해결된다.


// ============================================================
// 직접 해보기 정답
// ============================================================
//
// 1) 걸립니다.
//    error TS2322: Type 'null' is not assignable to type 'string | undefined'.
//    undefined 를 허용했다고 null 까지 되는 것이 아닙니다.
//    재현:
//    let name1: string | undefined = "홍길동";
//    name1 = null;
//    둘은 다른 값이고, 타입에서도 따로 적어야 합니다.
//
// 2) 통과합니다. 다만 별명이 "" 인 사용자는 "별명 없음" 으로 갑니다.
//    빈 문자열이 falsy 라서입니다(개념02 섹션4).
//    "별명을 빈칸으로 저장한 사람" 과 "별명이 아예 없는 사람" 을
//    구별해야 한다면 !== null 을 써야 합니다.
//
// 3) error TS18047: 'shop2.owner.phone' is possibly 'null'.
//    phone 자체가 string | null 이라 그렇습니다.
//    재현:
//    type Shop = { name: string; owner: { name: string; phone: string | null } | null };
//    const shop2: Shop = { name: "무인카페", owner: null };
//    console.log(shop2.owner?.phone.length);
//    첫 번째 ?. 는 owner 가 없는 경우만 막아 줍니다.
//    phone 이 null 인 경우는 두 번째 ?. 가 막고 있었던 것입니다.
//    ?. 는 '없을 수 있는 자리마다' 필요합니다. 하나 붙였다고 뒤가 안전해지지 않습니다.
//
// 4) const flag: boolean | null = false;
//    console.log(flag ?? true);              // 출력: false
//    console.log(flag || true);              // 출력: true
//    false 는 '있는 값' 인데 || 는 없는 것으로 칩니다.
//    설정 스위치를 껐는데 다시 켜지는 버그가 이렇게 생깁니다.
//
// 5) 터지지 않습니다. "없음" 이 출력됩니다.
//    ! 는 문제를 숨기고, ?. 와 ?? 는 문제를 처리합니다.
//    코드 길이는 비슷한데 결과가 완전히 다릅니다.
