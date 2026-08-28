// ============================================================
// 09단원 · 종합 03 정답 — 서버 응답 다루기
// ------------------------------------------------------------
// 실행: node 종합03_서버_응답_정답.ts
// 검사: npm run typecheck
// ============================================================
//
// 코드보다 해설이 본체입니다. 맞았어도 해설은 읽고 넘어가세요.

const okText = '{"name":"라떼","price":4500}';
const missingText = '{"name":"라떼"}';
const wrongText = '{"name":123,"price":4500}';
const brokenText = "<html>502 Bad Gateway</html>"; // JSON 이 아예 아닌 응답

console.log("===== 서버 응답 =====");
// 출력: ===== 서버 응답 =====


// ───── 문제 1 ─────
type Menu = { name: string; price: number };

const a: Menu = JSON.parse(okText);
console.log(a.name, a.price);
// 출력: 라떼 4500

const b: Menu = JSON.parse(missingText);
console.log(b.name, b.price);
// 출력: 라떼 undefined

// 해설 ① 두 줄 다 검사를 통과합니다. JSON.parse 는 any 를 주고,
//        any 는 어디에나 들어가기 때문입니다.
// 해설 ② : Menu 라고 적는 것은 "이런 모양일 것이다" 라는 내 주장입니다.
//        타입스크립트는 그 주장을 검사하지 않고 믿습니다.
//        node 는 타입 표기를 지우고 실행하니 확인해 주는 코드가 어디에도 없습니다.
// 해설 ③ b.price.toFixed(0) 이었다면 여기서 터졌을 것입니다.
//        undefined 가 화면에 찍히고 나서야 알게 되는 것 —
//        이게 04단원 개념04의 "타입은 약속이지 검사가 아니다" 입니다.


// ───── 문제 2 ─────
function parseMenu(text: string): Menu | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null; // JSON 이 아니면 여기서 끝. 이 줄이 없으면 프로그램이 죽습니다
  }
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

console.log(parseMenu(okText));
// 출력: { name: '라떼', price: 4500 }
console.log(parseMenu(missingText));
// 출력: null
console.log(parseMenu(wrongText));
// 출력: null
console.log(parseMenu(brokenText));
// 출력: null

// 해설 ① : unknown 으로 받는 것이 핵심입니다.
//        any 로 받으면 아래 확인을 안 해도 통과해 버려서 확인이 무의미해집니다.
//        unknown 은 확인을 통과하기 전에는 아무것도 못 하게 막습니다.
// 해설 ② 조건이 여섯 줄인 이유 — 앞에서부터 하나씩 좁혀 나가기 때문입니다.
//        typeof null 이 "object" 라서 ②(null 이 아닌가)를 따로 봐야 합니다.
//        "name" in data 로 이름이 있는지 본 뒤에야 data.name 을 읽을 수 있습니다.
// 해설 ③ wrongText 는 name 이 숫자 123 이라 ⑤ 에서 걸러집니다.
//        as Menu 로 우겼다면 셋 다 통과하고 나중에 터졌을 것입니다.
//        실무에서는 이 일을 zod 에 맡깁니다(08단원 개념03 섹션4).
// 해설 ④ ★ try / catch 가 왜 필요한가 — unknown 확인은 '값의 모양' 만 봅니다.
//        JSON.parse 는 그 확인에 도달하기도 전에 예외를 던집니다.
//        서버가 죽으면 JSON 이 아니라 502 HTML 페이지나 빈 문자열이 옵니다.
//        그러면 try 가 없는 코드는 화면이 통째로 멈춥니다.
//        타입 검사로는 절대 안 잡히는 자리입니다. JSON.parse 는 어디서나 이렇게 감쌉니다.


// ───── 문제 3 ─────
type Shop = { name: string; owner: { name: string; phone: string | null } | null };

const rawShop1 = { name: "봄날카페", owner: { name: "홍길동", phone: null } };
const rawShop2 = { name: "무인카페", owner: null };

const shop1: Shop = rawShop1;
const shop2: Shop = rawShop2;

console.log(shop1.owner?.phone ?? "번호 없음");
// 출력: 번호 없음
console.log(shop2.owner?.name ?? "주인 없음");
// 출력: 주인 없음

// 해설 ① ?. 는 '없을 수 있는 자리마다' 필요합니다.
//        shop1 은 owner 가 있지만 phone 이 null 이라, ?? 가 그걸 받아 줍니다.
//        shop2 는 owner 부터 없어서 ?. 가 거기서 멈춥니다.
// 해설 ② shop2.owner!.name 으로 썼다면 그 줄에서 터집니다.
//        shop2 는 owner 가 null 인데 ! 로 "없을 리 없다" 고 우긴 것이라
//        Cannot read properties of null 이 납니다.
//        (shop1.owner!.phone 은 owner 가 있어서 안 터집니다. 그래서 더 위험합니다 —
//         ! 는 터질 때까지 아무 말도 안 해 줍니다)
//        ! 는 문제를 숨기고 ?. ?? 는 문제를 처리합니다.
// 해설 ③ rawShop1 을 그대로 담을 수 있는 이유는 모양이 맞기 때문입니다.
//        phone: null 은 string | null 자리에 들어갑니다.


// ───── 문제 4 ─────
type LoadState =
  | { status: "로딩중" }
  | { status: "성공"; menu: Menu }
  | { status: "실패"; message: string };

function render(state: LoadState): string {
  switch (state.status) {
    case "로딩중":
      return "불러오는 중...";
    case "성공":
      return state.menu.name + " " + state.menu.price + "원";
    case "실패":
      return "오류: " + state.message;
  }
}

console.log(render({ status: "로딩중" }));
// 출력: 불러오는 중...
console.log(render({ status: "성공", menu: { name: "라떼", price: 4500 } }));
// 출력: 라떼 4500원
console.log(render({ status: "실패", message: "형식이 다릅니다" }));
// 출력: 오류: 형식이 다릅니다

// 해설 ① case "성공" 안에서 state.menu 를 확인 없이 씁니다.
//        "성공이면 menu 가 반드시 있다" 가 타입에 적혀 있기 때문입니다.
// 해설 ② { status: "성공" } 만 쓰면 TS2322 로 걸립니다. menu 가 빠졌으니까요.
//        성공인데 데이터가 없는 상태를 아예 못 만듭니다.
// 해설 ③ 상태를 하나 늘리면 이 switch 가 TS2366 으로 걸립니다.
//        고쳐야 할 곳을 타입이 찾아 줍니다.


// ───── 문제 5 ─────
function load(text: string): LoadState {
  const menu = parseMenu(text);
  if (menu === null) {
    return { status: "실패", message: "형식이 다릅니다" };
  }
  return { status: "성공", menu };
}

console.log(render(load(okText)));
// 출력: 라떼 4500원
console.log(render(load(missingText)));
// 출력: 오류: 형식이 다릅니다

// 해설 ① parseMenu 가 Menu | null 을 주니, null 을 먼저 걸러 내고 돌려보냅니다.
//        그 아래부터 menu 는 확실히 Menu 입니다(이른 반환).
// 해설 ② { status: "성공", menu } 는 { status: "성공", menu: menu } 의 줄임입니다.
//        JS자료 09단원의 속성 축약입니다.
// 해설 ③ 문제 1과 비교해 보세요. 같은 missingText 인데
//        문제 1은 화면에 undefined 를 찍었고, 여기는 "형식이 다릅니다" 로 처리합니다.
//        확인 한 번을 넣었을 뿐인데 결과가 완전히 달라집니다.


// ───── 문제 6 ─────
console.log("----- 처리 결과 -----");
// 출력: ----- 처리 결과 -----

const responses = [okText, missingText, wrongText];
let ok = 0;
let fail = 0;

for (let i = 0; i < responses.length; i++) {
  const text = responses[i];
  const state = load(text);
  if (state.status === "성공") ok++;
  else fail++;
  const 문구 = state.status === "실패" ? state.message : render(state);
  console.log(i + 1 + "번: " + 문구);
}
// 출력: 1번: 라떼 4500원
// 출력: 2번: 형식이 다릅니다
// 출력: 3번: 형식이 다릅니다

console.log("성공 " + ok + "건 / 실패 " + fail + "건");
// 출력: 성공 1건 / 실패 2건

// 해설 ① state.status === "성공" 으로 세면 됩니다. 문자열 비교가 아니라
//        타입에 적힌 세 값 중 하나라, 오타를 내면 TS2367 로 걸립니다.
// 해설 ② responses[i] 가 undefined 일 수 있다고 걱정할 수 있는데,
//        기본 설정에서는 그냥 string 으로 나옵니다.
//        noUncheckedIndexedAccess 를 켜면 확인이 필요해집니다(08단원 개념03 섹션3).
// 해설 ③ ★ "오류: " 를 떼려고 render 결과에 replace 를 쓰면 안 됩니다.
//        판별 유니온으로 갈라 놓고 다시 문자열을 뜯어보는 것은 되돌아가는 것입니다.
//        게다가 replace 는 앞머리만 보는 게 아니라 첫 일치를 아무 데서나 지웁니다.
//        메뉴 이름이 "오류: 라떼" 라면 성공 결과까지 깎입니다.
//        표딱지가 있으면 표딱지로 갈라야 합니다 — 05단원 개념04가 이 이야기입니다.
// 해설 ④ 이 실습 전체에서 any · ! · as 를 한 번도 안 썼습니다.
//        JSON 이 아닌 응답까지 try / catch 로 받아 내므로
//        서버가 무엇을 보내든 화면이 안 터집니다. 그게 목표였습니다.
