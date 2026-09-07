// ============================================================
// 03단원 연습문제 — 클라우드 DB (Supabase)
// ------------------------------------------------------------
// 실행: node 연습문제.js
// ============================================================
//
// ★ 풀기 전에 세 가지가 되어 있어야 합니다.
//
//   1) SQL Editor 에 준비.sql 을 붙여 넣고 Run 했다
//   2) cp .env.예시 .env 하고 URL 과 anon key 를 채웠다
//   3) 인터넷이 된다
//
//   진짜 Supabase 프로젝트에 붙어서 돕니다. 흉내가 아닙니다.
//   .env 가 없으면 설정.js 가 안내를 찍고 멈춥니다. 그게 정상입니다.
//
// TODO 자리에 코드를 쓰고, '기대 출력' 과 같은지 확인하세요.
// 1~10 은 기본, 11~14 는 응용, 15 는 [도전] 입니다.
//
// ★★ 문제를 풀면 표가 바뀝니다.
//   그래서 새로 넣는 줄은 이름 앞에 "연습-" 을 붙이고, 분류는 C 로 씁니다.
//   그리고 문제가 끝나면 finally 에서 지웁니다.
//   여러 번 풀어도 매번 같은 결과가 나와야 하니까요.
//
// ★★ 2·10 번은 손으로 적는 문제입니다. 코드가 없습니다.
//   맨 아래 'SQL 로 써 볼 것' 도 SQL Editor 에서 직접 칩니다.

// 이파일은Supabase가필요합니다

const { createClient } = require("@supabase/supabase-js");
const 설정 = require("./설정");

const sb = createClient(설정.SUPABASE_URL, 설정.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});


// ── 준비.sql 이 만들어 둔 자료 ──
//
//   products   1  USB 허브        A  판매중   23900
//              2  27인치 모니터   A  품절    189000
//              3  무선 마우스     B  판매중   null
//   reviews    (product_id, score) = (1,5) (1,4) (2,3)
//   memos      비어 있음 · RLS 켜짐 · 정책 없음
//
//   products·reviews 에는 "수업용 전체 허용" 정책이 걸려 있습니다.
//
// ★ id 는 generated always as identity 입니다.
//   넣을 때마다 번호가 올라가고, 지워도 돌아오지 않습니다.
//   그래서 기대 출력에 "id=6" 같은 숫자를 적지 않습니다. (문제 4)


// ── 뒷정리 ──
//
// ★ 문제를 풀다 중간에 멈추면 "연습-" 줄이 남습니다.
//   남아 있으면 name 이 UNIQUE 라 다음 번에 23505 가 납니다.
//   그래서 실행() 맨 앞에서 한 번 쓸고, 문제마다 finally 에서 또 지웁니다.

async function 연습줄지우기(sb) {
  await sb.from("products").delete().like("name", "연습-%");
  await sb.from("products").delete().eq("name", "검사용 상품");
}


// ── 요청 수를 세는 클라이언트 (문제 12 에서 씁니다) ──
//
// ★ createClient 에 fetch 를 넣어 줄 수 있습니다.
//   요청은 진짜 서버로 그대로 나갑니다. 세기만 합니다.

function 세는클라이언트() {
  const 센것 = { 수: 0 };

  const 클라이언트 = createClient(설정.SUPABASE_URL, 설정.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: {
      fetch: (...인자) => {
        센것.수 += 1;
        return fetch(...인자);
      },
    },
  });

  return { 클라이언트, 센것 };
}


// ───── 문제 1 ───── (개념03)
// A 분류의 판매 중인 상품 이름을 id 순으로 출력하세요.
//
// 힌트: .eq() 를 두 번 이어 붙이면 AND 입니다.
//
// 기대 출력:
// USB 허브

async function 문제1(sb) {
  // TODO: 여기에 코드를 쓰세요
}


// ───── 문제 2 ───── (개념03) [손으로 적는 문제]
//
// 아래 체이닝이 만드는 REST 주소를 손으로 적으세요. 코드는 없습니다.
//
//   sb.from("products")
//     .select("id, name")
//     .eq("category", "B")
//     .gte("price", 10000)
//     .order("price", { ascending: false })
//     .order("id")
//     .limit(2)
//
// 이렇게 시작합니다. 뒤를 채우세요.
//
//   GET /products?select=...
//
// ★ 왜 손으로 적나
//   진짜 클라이언트는 만든 주소를 알려 주지 않습니다.
//   주소를 눈으로 보려면 이렇게 하세요.
//     · 브라우저 개발자도구 Network 탭
//     · 또는 대시보드 Logs → API Gateway
//
// 답과 규칙 설명은 연습문제_정답.js 에 있습니다.


// ───── 문제 3 ───── (개념03)
// id 가 1 인 상품 하나를 꺼내되, 없으면 null 이 되게 하세요.
// 오류가 나면 안 됩니다.
//
// 힌트: single 과 maybeSingle 중 어느 쪽일까요?
//
// 기대 출력:
// USB 허브
// null

async function 문제3(sb) {
  // TODO: id 1 을 꺼내서 name 을 출력하세요
  // TODO: 없는 id 999999 를 꺼내서 data 를 출력하세요
}


// ───── 문제 4 ───── (개념03)
// 상품을 하나 넣고, 만들어진 id 와 status 를 받으세요.
// 조회를 두 번 하면 안 됩니다.
//
//   넣을 것: { name: "연습-웹캠", category: "C" }
//
// ★ status 는 주지 마세요. DB 의 DEFAULT 가 채웁니다.
// ★ id 숫자는 찍지 마세요. 돌릴 때마다 올라갑니다. 받았는지만 확인하세요.
//
// 기대 출력:
// id 를 받았나: true
// status=품절

async function 문제4(sb) {
  try {
    // TODO: 여기에 코드를 쓰세요
  } finally {
    await 연습줄지우기(sb);
  }
}


// ───── 문제 5 ───── (개념03)
// 아래 코드는 만든 줄을 못 받습니다. 오류도 안 납니다.
// 왜 그런지 확인하고, 만든 줄이 오게 고치세요.
//
// ★ name 은 UNIQUE 입니다. 같은 이름으로 두 번 넣으면 23505 가 납니다.
//   그래서 고칠 때는 **다른 이름**(연습-거치대) 으로 넣으세요.
//
// 기대 출력:
// 고치기 전: data=null error=null status=201
// 고친 뒤: 연습-거치대

async function 문제5(sb) {
  try {
    const 결과 = await sb.from("products").insert({ name: "연습-파우치", category: "C" });
    console.log(`고치기 전: data=${결과.data} error=${결과.error} status=${결과.status}`);

    // TODO: "연습-거치대" 를 넣으면서 만든 줄을 받아 name 을 출력하세요
  } finally {
    await 연습줄지우기(sb);
  }
}


// ───── 문제 6 ───── (개념03)
// 지울 줄을 하나 만들어 두었습니다.
// 그것을 지우고, 없는 id 999999 도 지워 보세요.
// 각각 몇 건이 지워졌는지 출력하세요.
//
// 힌트: 지운 건수를 세려면 무엇을 붙여야 할까요?
//
// 기대 출력:
// 있는 것 지움: 1건
// 없는 id 지움: 0건

async function 문제6(sb) {
  try {
    const 만든것 = await sb
      .from("products")
      .insert({ name: "연습-지울것", category: "C" })
      .select("id")
      .single();

    // TODO: 만든것.data.id 를 지우고 몇 건인지 출력하세요
    // TODO: 없는 id 999999 도 지우고 몇 건인지 출력하세요
  } finally {
    await 연습줄지우기(sb);
  }
}


// ───── 문제 7 ───── (개념03)
// 이름 중복으로 오류가 나게 하고, 오류 코드와 status 를 출력하세요.
//
// 힌트: 이미 있는 이름이 무엇인지는 위의 '준비.sql 이 만들어 둔 자료' 에 있습니다.
//
// 기대 출력:
// code=23505 status=409

async function 문제7(sb) {
  // TODO: 여기에 코드를 쓰세요
  // ★ 오류가 나니까 표는 안 바뀝니다. 뒷정리가 필요 없습니다.
}


// ───── 문제 8 ───── (개념03)
// 오류를 확인하지 않으면 어떤 일이 생기는지 직접 보세요.
// 중복 insert 의 data 를 그대로 쓰면 어떻게 되나요?
//
// 기대 출력:
// data 는 null 입니다
// TypeError 가 납니다

async function 문제8(sb) {
  // TODO: 중복 insert 를 하고 data 가 null 인지 출력하세요
  // TODO: data.length 를 try/catch 로 감싸서 TypeError 를 확인하세요
}


// ───── 문제 9 ───── (개념02)
// SQLite 의 LIKE 는 영문 대소문자를 안 가립니다.
// Postgres 의 LIKE 는 가립니다. 진짜로 그런지 확인하세요.
//
// 세 번 조회하고 각각 몇 건인지 출력하세요.
//
//   .like("name", "%usb%")
//   .like("name", "%USB%")
//   .ilike("name", "%usb%")
//
// ★★ 오류가 안 납니다. 결과만 안 나옵니다. 이런 종류가 제일 찾기 어렵습니다.
//
// 기대 출력:
// like %usb%: 0건
// like %USB%: 1건
// ilike %usb%: 1건

async function 문제9(sb) {
  // TODO: 여기에 코드를 쓰세요
}


// ───── 문제 10 ───── (개념02) [손으로 적는 문제]
//
// 가격 오름차순으로 정렬하면서 NULL 을 맨 뒤로 보내려고 합니다.
// SQLite 와 Postgres 에서 결과가 같아야 합니다.
//
// ① .order() 의 두 번째 인자에 무엇을 적어야 합니까?
// ② 그때 만들어지는 REST 주소를 손으로 적으세요.
//
//   sb.from("products").select("id").order("price", { /* ① */ })
//
//   GET /products?select=id&order=...        ← ②
//
// ★ 진짜 주소를 눈으로 보려면
//     · 브라우저 개발자도구 Network 탭
//     · 또는 대시보드 Logs → API Gateway
//
// 답과 규칙 설명은 연습문제_정답.js 에 있습니다.


// ───── 문제 11 ───── (개념04, 응용)
// memos 는 RLS 가 켜져 있고 **정책이 하나도 없습니다.** (준비.sql)
// anon 키로 읽고 쓰면 각각 어떻게 되는지 확인하세요.
//
// 비교하려고 products 도 같이 읽습니다.
// products 에는 "수업용 전체 허용" 정책이 걸려 있습니다.
//
//   ① products 를 category=A 로 읽고, 줄 수와 error 를 출력
//   ② memos 를 select("*") 로 읽고, 줄 수와 error 를 출력
//   ③ memos 에 아래를 insert 하고, error.code 와 status 를 출력
//
//        { user_id: 남의아이디, content: "연습 메모" }
//
// ★ user_id 를 손으로 채우는 이유
//   memos.user_id 는 not null 이고 기본값이 auth.uid() 입니다.
//   로그인을 안 했으니 auth.uid() 가 null 입니다.
//   "그러면 아무 uuid 나 적어 넣으면 되지 않나?" 를 같이 시험하는 것입니다.
//
// 기대 출력:
// products 읽기: 2줄, error=null
// memos 읽기: 0줄, error=null
// memos 쓰기: code=42501 status=403
//
// ★★ 다 하고 나서 스스로 답해 보세요. 이게 이 문제의 진짜 질문입니다.
//   "쓰기는 403 인데, 읽기는 왜 403 이 아니라 빈 배열입니까?"
//   답은 연습문제_정답.js 에 있습니다.

async function 문제11(sb) {
  const 남의아이디 = "00000000-0000-0000-0000-000000000000";

  // TODO: 여기에 코드를 쓰세요
}


// ───── 문제 12 ───── (개념03, 응용)
// N+1 을 없애세요.
// 아래는 상품마다 리뷰를 따로 조회합니다. 한 번의 요청으로 바꾸세요.
//
// 힌트: .select("id, reviews(id)") 처럼 중첩해서 적을 수 있습니다.
//
// 기대 출력:
// N+1 요청 수: 3
// 고친 뒤 요청 수: 1
// 가져온 리뷰 수: 3

async function 문제12() {
  const { 클라이언트: sb, 센것 } = 세는클라이언트();

  // N+1 방식
  const 상품들 = (await sb.from("products").select("id").eq("category", "A")).data;
  for (const 상품 of 상품들) {
    await sb.from("reviews").select("id").eq("product_id", 상품.id);
  }
  console.log("N+1 요청 수:", 센것.수);

  센것.수 = 0;

  // TODO: 한 번의 요청으로 같은 것을 가져오고, 요청 수를 출력하세요
  // TODO: 가져온 리뷰를 다 더해서 몇 개인지 출력하세요
}


// ───── 문제 13 ───── (개념05, 응용)
// 오류를 다듬는 함수를 만드세요.
//   23505 → { 종류: "중복", status: 409 }
//   23514 → { 종류: "값오류", status: 400 }
//   42501 → { 종류: "권한없음", status: 403 }
//   status 0 → { 종류: "연결실패", status: 503 }
//   그 밖 → { 종류: "알수없음", status: 500 }
//
// 기대 출력:
// 23505 → 중복/409
// 23514 → 값오류/400
// 42501 → 권한없음/403
// (연결실패) → 연결실패/503
// 42P01 → 알수없음/500

function 오류다듬기(오류, 상태) {
  // TODO: { 종류, status } 를 돌려주세요
}

function 문제13() {
  const 경우들 = [
    ["23505", { code: "23505" }, 409],
    ["23514", { code: "23514" }, 400],
    ["42501", { code: "42501" }, 403],
    ["(연결실패)", { code: "" }, 0],
    ["42P01", { code: "42P01" }, 404],
  ];

  for (const [라벨, 오류, 상태] of 경우들) {
    const 결과 = 오류다듬기(오류, 상태);
    console.log(`${라벨} → ${결과.종류}/${결과.status}`);
  }
}


// ───── 문제 14 ───── (개념05, 응용)
// 저장소의 하나(id) 를 만드세요.
//   못 찾으면 null
//   오류가 오면 던지기 (문제 13 의 오류다듬기 를 쓰세요)
//
// 기대 출력:
// USB 허브
// null
// 던져진 오류 code: 42501

function 저장소만들기(sb) {
  // TODO: { 하나 } 를 돌려주세요
}

async function 문제14(sb) {
  const 저장소 = 저장소만들기(sb);

  console.log((await 저장소.하나(1)).name);
  console.log(await 저장소.하나(999999));

  // ★ 오류가 오는 경우는 진짜 서버로 만들기 어렵습니다.
  //   그래서 오류만 내는 클라이언트를 손으로 만들어 끼웁니다.
  //   저장소가 클라이언트를 **밖에서 받기** 때문에 이렇게 할 수 있습니다. (개념05)
  const 오류저장소 = 저장소만들기({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { code: "42501", message: "권한 없음" },
            status: 403,
          }),
        }),
      }),
    }),
  });

  // TODO: 오류저장소.하나(1) 이 던지는지 try/catch 로 확인하고 code 를 출력하세요
}


// ───── 문제 15 ───── (개념05, [도전])
// 02단원에서 만든 저장소검사를 통과하는 Supabase 저장소를 만드세요.
// 상품저장소.js 를 보지 말고 먼저 해 보세요.
//
// ★ 힌트 — 검사가 수정(id, { id: 888888, category: "B" }) 을 부릅니다.
//   받은 것을 그대로 .update() 에 넘기면 Postgres 가 거절합니다.
//     428C9  cannot insert a non-DEFAULT value into column "id"
//   id 는 generated always as identity 라 DB 가 정합니다.
//   02단원 SQLite 에서는 그냥 됐습니다. 고칠 칸을 골라서 넘기세요.
//
// ★ 초기화 는 안 만들어도 됩니다. 검사가 안 봅니다.
//   그리고 products 를 통째로 비우면 reviews 까지 cascade 로 사라집니다.
//   되살리려면 준비.sql 을 한 번 더 Run 해야 합니다. 하지 마세요.
//
// 기대 출력:
// 통과: 5개, 실패: []

async function 저장소검사(저장소) {
  const 실패 = [];
  let 통과 = 0;
  const 확인 = (이름, 조건) => { if (조건) 통과 += 1; else 실패.push(이름); };

  확인("내보내는함수", ["전부", "하나", "추가", "수정", "삭제"]
    .every((이름) => typeof 저장소[이름] === "function"));
  확인("없으면null", (await 저장소.하나(999999)) === null);
  확인("삭제false", (await 저장소.삭제(999999)) === false);

  const 시험용 = await 저장소.추가({ name: "검사용 상품", category: "A" });
  확인("id고정", (await 저장소.수정(시험용.id, { id: 888888, category: "B" })).id === 시험용.id);

  const 고친것 = await 저장소.수정(시험용.id, { category: "C" });
  확인("칸유지", 고친것.name === 시험용.name && 고친것.status === 시험용.status);

  await 저장소.삭제(시험용.id);
  return { 통과, 실패 };
}

function 내저장소(sb) {
  // TODO: 전부, 하나, 추가, 수정, 삭제 를 만드세요
}

async function 문제15(sb) {
  try {
    const 결과 = await 저장소검사(내저장소(sb));
    console.log(`통과: ${결과.통과}개, 실패: ${JSON.stringify(결과.실패)}`);
  } finally {
    await 연습줄지우기(sb);
  }
}


// ============================================================
// 실행 (TODO 를 채우면서 주석을 하나씩 푸세요)
// ============================================================

async function 실행() {
  // ★ 지난번에 중간에 멈췄다면 "연습-" 줄이 남아 있습니다. 먼저 쓸어 냅니다.
  await 연습줄지우기(sb);

  // await 문제1(sb);
  // (문제 2 는 손으로 적는 문제입니다)
  // await 문제3(sb);
  // await 문제4(sb);
  // await 문제5(sb);
  // await 문제6(sb);
  // await 문제7(sb);
  // await 문제8(sb);
  // await 문제9(sb);
  // (문제 10 은 손으로 적는 문제입니다)
  // await 문제11(sb);
  // await 문제12();
  //       문제13();
  // await 문제14(sb);
  // await 문제15(sb);
}

실행();


// ============================================================
// SQL 로 써 볼 것 — Supabase SQL Editor 에서
// ============================================================
//
// ★ 아래는 코드로 확인할 수 없습니다. SQL Editor 에서 직접 치세요.
//   답은 연습문제_정답.js 맨 아래에 있습니다.
//
// ── S1 ──
//   products 표를 Postgres 문법으로 만드세요.
//     id          자동 번호
//     name        글자, 비면 안 되고 겹치면 안 됨
//     category    A/B/C 중 하나
//     status      판매중/품절/검토중 중 하나, 기본값 품절
//     price       정수(원), 비어도 됨
//     created_at  시각, 기본값 지금
//
//   ★ 준비.sql 에 답이 그대로 있습니다. **먼저 스스로 쓰고** 대조하세요.
//     보고 베끼면 아무것도 안 남습니다.
//
// ── S2 ──
//   그 표에 RLS 를 켜세요.
//   그리고 "로그인한 사람은 읽기, 자기가 만든 것만 고치기" 정책을 쓰세요.
//   (owner_id uuid 칸을 추가해야 합니다)
//
// ── S3 ──
//   분류별로 상품 이름을 모아서 보여 주는 조회를 쓰세요.
//   상품이 없는 분류도 나와야 합니다. (categories 표가 따로 있다고 가정)
//
// ── S4 ──
//   리뷰를 기록하면서 결과가 '비추천' 이면 상품 상태를 '검토중' 으로 바꾸는
//   함수를 만드세요. 둘 다 되거나 둘 다 안 되어야 합니다.
//   그리고 클라이언트에서 부르는 코드도 쓰세요.
//
// ── S5 ──
//   RLS 가 정말 막는지 curl 로 확인하는 명령을 쓰세요.
//
// ── S6 ──
//   아래는 SQLite 에서 돌던 조회입니다. Postgres 용으로 고쳐서 SQL Editor 에
//   붙여 넣고, 진짜로 도는지 확인하세요.
//
//     SELECT category, group_concat(name, ', ') AS names
//     FROM products
//     WHERE name LIKE '%usb%'
//     GROUP BY category
//     ORDER BY category;
//
//   ★ 고칠 곳이 두 군데입니다.
//     하나는 붙여 넣자마자 **오류**가 납니다.
//     하나는 오류가 안 나고 **0건**이 나옵니다. (문제 9 에서 본 그것입니다)
