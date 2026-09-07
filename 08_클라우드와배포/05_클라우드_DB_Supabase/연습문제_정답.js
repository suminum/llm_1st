// ============================================================
// 03단원 연습문제 정답 — 클라우드 DB (Supabase)
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
// ============================================================
//
// ★ 돌리기 전에 세 가지가 되어 있어야 합니다.
//
//   1) SQL Editor 에 준비.sql 을 붙여 넣고 Run 했다
//   2) cp .env.예시 .env 하고 URL 과 anon key 를 채웠다
//   3) 인터넷이 된다
//
//   진짜 Supabase 프로젝트에 붙어서 돕니다. 흉내가 아닙니다.
//   .env 가 없으면 설정.js 가 안내를 찍고 멈춥니다. 그게 정상입니다.
//
// 먼저 스스로 풀어 본 다음에 보세요. 설명을 꼭 읽으세요.

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


// ── 뒷정리 ──

async function 연습줄지우기(sb) {
  await sb.from("products").delete().like("name", "연습-%");
  await sb.from("products").delete().eq("name", "검사용 상품");
}

// ★★★ 이 두 줄이 이 파일에서 제일 중요한 부분일 수도 있습니다.
//
//   문제를 풀면 표가 바뀝니다. 바뀐 채로 두면 다음 번에 결과가 달라집니다.
//   "어제는 됐는데 오늘은 안 돼요" 의 절반이 이겁니다.
//
//   그래서 넣는 줄은 전부 "연습-" 으로 시작하고, 분류는 C 로 씁니다.
//   그러면 문제 1(A·판매중)·11(A)·12(A) 의 결과가 흔들리지 않습니다.
//
// ★ finally 에 넣는 이유
//   가운데에서 오류가 나도 뒷정리는 돌아야 합니다.
//   try 끝에 적어 두면 오류가 났을 때 건너뜁니다.


// ── 요청 수를 세는 클라이언트 (문제 12) ──

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

// ★ createClient 의 세 번째 인자로 fetch 를 갈아 끼울 수 있습니다.
//   요청은 진짜 서버로 그대로 나갑니다. 여기서는 세기만 합니다.
//   같은 자리에 로그를 넣으면 요청 주소도 볼 수 있습니다. (문제 2·10)


// ───── 문제 1 ─────
async function 문제1(sb) {
  const { data, error } = await sb
    .from("products")
    .select("name")
    .eq("category", "A")
    .eq("status", "판매중")
    .order("id");

  if (error) throw error;

  console.log(data.map((상품) => 상품.name).join(", "));
  // 출력: USB 허브
}

// ★ .eq() 를 이어 붙이면 AND 입니다. OR 는 .or("...") 로 따로 씁니다.
//
// ★★ if (error) throw error 를 습관으로 만드세요.
//   Supabase 는 오류를 **던지지 않습니다.** error 에 담아 줄 뿐입니다.
//   확인 안 하면 data 가 null 인 채로 다음 줄에서 터집니다. (문제 8 에서 봅니다)


// ───── 문제 2 ───── [손으로 적는 문제]
//
//   답:
//
//   GET /products?select=id,name&category=eq.B&price=gte.10000&order=price.desc,id.asc&limit=2
//
// ★★ 규칙이 보이시죠. "칸=연산.값" 입니다.
//
//   .select("id, name")   → select=id,name        (공백은 빠집니다)
//   .eq("category","B")   → category=eq.B
//   .gte("price",10000)   → price=gte.10000
//   .order("price", { ascending: false })
//   .order("id")          → order=price.desc,id.asc
//   .limit(2)             → limit=2
//
// ★ .order() 를 두 번 부르면 쉼표로 이어집니다. 부른 순서 그대로입니다.
//   마지막을 id 로 끝낸 것은 02단원 개념03 의 규칙입니다.
//   안 그러면 쪽을 넘길 때 같은 줄이 두 번 나올 수 있습니다.
//
// ★★★ 이 주소를 직접 보는 방법
//
//   진짜 클라이언트는 만든 주소를 돌려주지 않습니다. 그래서 밖에서 봅니다.
//
//     · 브라우저 개발자도구 Network 탭
//     · 대시보드 Logs → API Gateway
//
//   왜 볼 줄 알아야 하나 — 느린 화면을 만나면 제일 먼저 여기를 봅니다.
//   요청이 몇 번 나가는지, select 에 * 를 쓰고 있는지가 여기서 보입니다.


// ───── 문제 3 ─────
async function 문제3(sb) {
  const 있는것 = await sb.from("products").select("name").eq("id", 1).maybeSingle();
  console.log(있는것.data.name);
  // 출력: USB 허브

  const 없는것 = await sb.from("products").select("name").eq("id", 999999).maybeSingle();
  console.log(없는것.data);
  // 출력: null
}

// ★★★ maybeSingle 이 정답입니다.
//
//   single()      0건이면 오류(PGRST116, 406) → 404 를 내야 할 자리에서 500 이 됩니다
//   maybeSingle() 0건이면 data 가 null, error 는 없음
//
//   "없을 수도 있는 조회" 에는 maybeSingle 을 쓰세요.
//   02단원 SQLite 저장소의 `?? null` 과 정확히 같은 자리입니다.
//
// ★ 반대로 "반드시 있어야 하는 것" 에는 single 이 맞습니다.
//   방금 insert 한 줄을 받을 때 같은 경우입니다. 0건이면 진짜 문제니까요.


// ───── 문제 4 ─────
async function 문제4(sb) {
  try {
    const { data, error } = await sb
      .from("products")
      .insert({ name: "연습-웹캠", category: "C" })
      .select("id, status")
      .single();

    if (error) throw error;

    console.log(`id 를 받았나: ${typeof data.id === "number"}`);
    // 출력: id 를 받았나: true
    console.log(`status=${data.status}`);
    // 출력: status=품절
  } finally {
    await 연습줄지우기(sb);
  }
}

// ★ .select().single() 을 붙여야 만든 줄이 옵니다. (DB자료의 RETURNING 과 같은 일)
//   조회를 두 번 하지 않아도 됩니다.
//
// ★ status 를 안 줬는데 '품절' 입니다. DB 의 DEFAULT 가 채웠습니다.
//   그래서 만든 줄을 받아 봐야 실제로 뭐가 들어갔는지 알 수 있습니다.
//
// ★★★ id 숫자를 안 찍은 이유
//
//   id 는 generated always as identity 입니다.
//   번호는 **한 방향으로만 올라갑니다.** 지워도 되돌아오지 않습니다.
//
//     첫 번째로 돌리면 4, 다음에 돌리면 5, 그다음은 6 ...
//
//   그래서 "id=6" 같은 기대 출력을 적으면 두 번째 실행부터 틀립니다.
//   기대 출력에는 **몇 번을 돌려도 같은 것**만 적어야 합니다.
//   이건 시험 코드를 쓸 때도 그대로 지키는 규칙입니다.


// ───── 문제 5 ─────
async function 문제5(sb) {
  try {
    const 결과 = await sb.from("products").insert({ name: "연습-파우치", category: "C" });
    console.log(`고치기 전: data=${결과.data} error=${결과.error} status=${결과.status}`);
    // 출력: 고치기 전: data=null error=null status=201

    const 고친것 = await sb
      .from("products")
      .insert({ name: "연습-거치대", category: "C" })
      .select("name")
      .single();

    console.log(`고친 뒤: ${고친것.data.name}`);
    // 출력: 고친 뒤: 연습-거치대
  } finally {
    await 연습줄지우기(sb);
  }
}

// ★★★ error 가 null 인데 data 도 null 입니다. 여기가 함정입니다.
//
//   "자료가 안 와요" 를 보면 오류부터 찾게 됩니다. 그런데 오류가 없습니다.
//   실패한 게 아니라 **성공했는데 돌려줄 게 없는** 것입니다.
//
//   Supabase 는 기본으로 만든 줄을 안 돌려줍니다.
//   Prefer: return=representation 헤더가 있어야 돌려주는데,
//   그 헤더는 .select() 를 붙일 때 붙습니다.
//
// ★★ status 도 같이 봐 두세요. 세 개 다 "됐다" 입니다.
//
//     201  POST(insert) 가 성공, 돌려줄 것 없음
//     204  PATCH(update)·DELETE 가 성공, 돌려줄 것 없음
//     200  .select() 를 붙여서 줄이 딸려 옴
//
// ★ 만든 것의 id 가 필요 없으면 .select() 를 안 붙이는 게 낫습니다.
//   응답이 가벼워집니다. 대량으로 넣을 때 차이가 큽니다.
//
// ★★ 두 번째는 **다른 이름**(연습-거치대) 으로 넣었습니다.
//   name 이 UNIQUE 라 "연습-파우치" 를 또 넣으면 23505 가 납니다. (문제 7)
//   고치는 문제인데 이름을 그대로 두면 고친 코드가 오류로 죽습니다.


// ───── 문제 6 ─────
async function 문제6(sb) {
  try {
    const 만든것 = await sb
      .from("products")
      .insert({ name: "연습-지울것", category: "C" })
      .select("id")
      .single();

    const 지운것 = await sb.from("products").delete().eq("id", 만든것.data.id).select("id");
    console.log(`있는 것 지움: ${지운것.data.length}건`);
    // 출력: 있는 것 지움: 1건

    const 없는것 = await sb.from("products").delete().eq("id", 999999).select("id");
    console.log(`없는 id 지움: ${없는것.data.length}건`);
    // 출력: 없는 id 지움: 0건
  } finally {
    await 연습줄지우기(sb);
  }
}

// ★★ 없는 것을 지워도 **오류가 아닙니다.** 빈 배열입니다.
//   DB자료의 changes === 0 과 같은 자리입니다.
//
//   404 를 내려면 배열 길이를 봐야 합니다.
//     if (data.length === 0) return res.status(404)...
//
// ★★★ .select() 를 빼먹으면 data 가 null 이라 length 를 못 셉니다.
//   그러면 "지웠는지" 를 알 방법이 없습니다. 없는 걸 지워도 204 가 나갑니다.
//
// ★ 조건 없는 delete 는 Supabase 가 거절합니다.
//   .eq() 를 빼먹어도 표가 비워지지 않습니다. 다행스러운 안전장치입니다.
//   (연습줄지우기 가 .like() 로 조건을 붙인 것도 같은 이유입니다)


// ───── 문제 7 ─────
async function 문제7(sb) {
  const 결과 = await sb.from("products").insert({ name: "USB 허브", category: "A" }).select();

  console.log(`code=${결과.error.code} status=${결과.status}`);
  // 출력: code=23505 status=409
}

// ★ 23505 는 Postgres 표준 오류 코드입니다. UNIQUE 위반입니다.
//   Supabase 만의 코드가 아니라 Postgres 어디서나 같습니다.
//
// ★ 실패한 insert 라 표는 안 바뀝니다. 그래서 뒷정리가 없습니다.
//
// ★★ error.message 에는 표 이름과 제약 이름이 들어 있습니다.
//     duplicate key value violates unique constraint "products_name_key"
//   이걸 사용자에게 그대로 보내면 안 됩니다.
//   { 오류: "이미 있는 상품 이름입니다" } 로 바꿔서 보내세요.


// ───── 문제 8 ─────
async function 문제8(sb) {
  const 결과 = await sb.from("products").insert({ name: "27인치 모니터", category: "A" }).select();

  console.log(결과.data === null ? "data 는 null 입니다" : "data 가 있습니다");
  // 출력: data 는 null 입니다

  try {
    console.log(결과.data.length);
  } catch (에러) {
    console.log(`${에러.constructor.name} 가 납니다`);
    // 출력: TypeError 가 납니다
  }
}

// ★★★ 이게 error 를 안 보면 생기는 일입니다.
//
//     const { data } = await sb.from("t").insert(...);
//     data.map(...)      ← 여기서 Cannot read properties of null
//
//   오류가 난 줄에서 안 터지고 **한참 뒤에** 터집니다.
//   스택을 봐도 진짜 원인(23505) 이 안 보입니다.
//
// ★ 그래서 둘 중 하나를 항상 하세요.
//
//     const { data, error } = await ...;
//     if (error) throw error;
//
//   또는
//
//     const { data } = await sb.from("t").insert(...).select().throwOnError();
//
//   throwOnError() 를 쓰면 오류일 때 진짜로 던집니다.
//   Express 5 는 async 핸들러의 예외를 자동으로 잡아 줍니다. (백엔드 04단원)


// ───── 문제 9 ─────
async function 문제9(sb) {
  const 소문자 = await sb.from("products").select("name").like("name", "%usb%");
  console.log(`like %usb%: ${소문자.data.length}건`);
  // 출력: like %usb%: 0건

  const 대문자 = await sb.from("products").select("name").like("name", "%USB%");
  console.log(`like %USB%: ${대문자.data.length}건`);
  // 출력: like %USB%: 1건

  const 안가림 = await sb.from("products").select("name").ilike("name", "%usb%");
  console.log(`ilike %usb%: ${안가림.data.length}건`);
  // 출력: ilike %usb%: 1건
}

// ★★★ 오류가 안 났습니다. 0건이 나왔을 뿐입니다.
//
//   SQLite 의 LIKE 는 영문 대소문자를 안 가립니다.
//   Postgres 의 LIKE 는 가립니다. 그대로 옮기면 검색이 조용히 죽습니다.
//
//   "검색이 안 돼요" 를 만나면 여기를 의심하세요.
//   오류 로그에는 아무것도 안 남습니다. 그래서 찾는 데 오래 걸립니다.
//
// ★★ Postgres 에서 안 가리게 하려면 ILIKE 입니다.
//     .ilike("name", "%usb%")   → name=ilike.*usb*
//
//   반대 방향(Postgres → SQLite)으로 옮길 때는 ILIKE 가 없어서 또 고쳐야 합니다.
//
// ★ 한글은 대소문자가 없어서 차이가 안 납니다.
//   그래서 한글로만 시험하면 이 문제를 놓칩니다.
//   영문이 섞인 자료로 꼭 확인하세요.
//
// ★★ ILIKE 는 보통 색인을 못 씁니다. 자료가 커지면 느려집니다.
//   그때는 시티텍스트(citext) 나 pg_trgm 색인을 봅니다.
//   여기서는 "결과가 다르다" 까지만 알면 됩니다.
//
// ★ group_concat → string_agg 는 맨 아래 S6 에서 직접 써 봅니다.


// ───── 문제 10 ───── [손으로 적는 문제]
//
//   답:
//
//   ① .order("price", { ascending: true, nullsFirst: false })
//   ② GET /products?select=id&order=price.asc.nullslast
//
// ★★ nullsFirst: false → 주소 끝에 nullslast 가 붙습니다.
//
//   이걸 안 붙이면 DB 마다 다릅니다.
//     SQLite   NULL 을 작게 봅니다 → ASC 에서 맨 앞
//     Postgres NULL 을 크게 봅니다 → ASC 에서 맨 뒤
//
//   SQLite 로 개발하고 Supabase 로 옮기면 목록 첫 줄이 바뀝니다.
//   명시해 두면 어디서나 같습니다.
//
// ★ DESC 일 때도 nullsFirst: false 를 쓰면 NULL 이 뒤로 갑니다.
//   "값이 없는 건 항상 뒤로" 가 보통 원하는 동작입니다.
//   그리고 DESC 는 Postgres 기본이 NULL 먼저라, 여기서 차이가 눈에 보입니다.
//   products 에 price 가 null 인 줄(무선 마우스)이 있으니 직접 해 보세요.
//
// ★★★ 주소를 직접 보는 방법은 문제 2 와 같습니다.
//     · 브라우저 개발자도구 Network 탭
//     · 대시보드 Logs → API Gateway


// ───── 문제 11 ─────
async function 문제11(sb) {
  const 남의아이디 = "00000000-0000-0000-0000-000000000000";

  const 상품 = await sb.from("products").select("*").eq("category", "A");
  console.log(`products 읽기: ${상품.data.length}줄, error=${상품.error}`);
  // 출력: products 읽기: 2줄, error=null

  const 메모 = await sb.from("memos").select("*");
  console.log(`memos 읽기: ${메모.data.length}줄, error=${메모.error}`);
  // 출력: memos 읽기: 0줄, error=null

  const 쓴것 = await sb.from("memos").insert({ user_id: 남의아이디, content: "연습 메모" });
  console.log(`memos 쓰기: code=${쓴것.error.code} status=${쓴것.status}`);
  // 출력: memos 쓰기: code=42501 status=403
}

// ★★★ "쓰기는 403 인데 읽기는 왜 빈 배열인가"
//
//   같은 표, 같은 anon 키, 같은 클라이언트입니다. 그런데 응답이 다릅니다.
//
//     읽기가 막히면  오류가 아니라 **빈 배열**입니다
//     쓰기가 막히면  42501 / 403 이 옵니다
//
//   이유는 **RLS 가 막는 방식이 다르기 때문**입니다.
//
//     select 는 정책을 WHERE 조건처럼 붙입니다.
//              정책이 없으면 "항상 거짓" 이 붙습니다.
//              → 조건에 맞는 줄이 0개. 그건 오류가 아니라 그냥 0건입니다.
//
//     insert 는 만들어진 줄을 WITH CHECK 로 검사합니다.
//              통과 못 하면 그 자리에서 거절합니다.
//              → new row violates row-level security policy → 42501
//
//   말을 바꾸면 이렇습니다.
//     "없는 것처럼 보인다" 와 "있는데 못 쓴다" 는 다른 대답입니다.
//
// ★★★ 읽기를 굳이 빈 배열로 만드는 이유
//
//   403 을 주면 "여기 뭔가 있구나" 를 알려 주는 셈입니다.
//   /memos?id=eq.1 은 403, /memos?id=eq.2 는 200 이면
//   내용은 못 봐도 **어떤 id 가 존재하는지** 다 셀 수 있습니다.
//   그래서 아예 "0건" 으로 대답합니다. 있고 없고를 안 알려 줍니다.
//
// ★★★ 그래서 이런 신고를 받으면 순서가 정해져 있습니다.
//
//   "자료를 넣었는데 목록이 비어 있어요. 오류는 없어요."
//   → 코드보다 **RLS 를 먼저** 의심하세요.
//   → 대시보드 Table Editor 로 보면 줄이 멀쩡히 있습니다.
//     Table Editor 는 service_role 로 보기 때문입니다. RLS 를 건너뜁니다.
//   → 그러면 "코드가 이상한데?" 로 한참을 헤맵니다. 여기서 제일 많이 막힙니다.
//
// ★★ 남의 uuid 를 적어 넣어도 통과 못 했습니다.
//   "남의 user_id 를 적어 넣으면 되지 않나" 는 여기서 끝납니다.
//   RLS 는 **보내온 값**이 아니라 **토큰의 auth.uid()** 를 봅니다.
//   보내온 값으로 판단했다면 그건 보안이 아니라 그냥 부탁입니다.
//
// ★ 그리고 42501 이 먼저 났다는 것도 봐 두세요.
//   user_id 를 아예 빼고 넣었어도 결과는 같습니다.
//   RLS 검사가 not null 검사보다 앞이라, 그쪽으로는 아무것도 안 새어 나갑니다.
//
// ★ 정책을 붙여서 열어 보는 것은 개념04 에서 한 줄씩 합니다.


// ───── 문제 12 ─────
async function 문제12() {
  const { 클라이언트: sb, 센것 } = 세는클라이언트();

  const 상품들 = (await sb.from("products").select("id").eq("category", "A")).data;
  for (const 상품 of 상품들) {
    await sb.from("reviews").select("id").eq("product_id", 상품.id);
  }
  console.log("N+1 요청 수:", 센것.수);
  // 출력: N+1 요청 수: 3

  센것.수 = 0;

  const { data } = await sb.from("products").select("id, reviews(id)").eq("category", "A");
  console.log("고친 뒤 요청 수:", 센것.수);
  // 출력: 고친 뒤 요청 수: 1
  console.log("가져온 리뷰 수:", data.reduce((합, 상품) => 합 + 상품.reviews.length, 0));
  // 출력: 가져온 리뷰 수: 3
}

// ★★★ 3번이 1번이 됐습니다. 가져온 리뷰 수는 똑같이 3개입니다.
//
//   로컬 SQLite 였다면 3배 차이였습니다. (DB자료 06단원 개념05)
//   Supabase 는 네트워크 건너입니다. 왕복 하나가 3~30ms 입니다.
//   여기서는 상품이 2개라 티가 안 나지만, 상품이 200개면 201번입니다.
//   201 × 3ms = 0.6초. 자료가 는다고 3배가 아니라 **줄 수만큼** 늡니다.
//
// ★★ 중첩 select 가 되려면 **외래키가 있어야 합니다.**
//   reviews.product_id 가 products(id) 를 references 해야 합니다. (준비.sql)
//   Supabase 가 그 외래키를 보고 관계를 알아냅니다.
//   외래키를 안 걸었으면 이 문법이 동작하지 않습니다.
//     "Could not find a relationship between 'products' and 'reviews'"
//
// ★ 결과 모양이 SQL 의 JOIN 과 다릅니다.
//   JOIN 은 줄이 늘어나는데, 여기서는 중첩 배열로 옵니다.
//     [{ id: 1, reviews: [{id:1},{id:2}] }, { id: 2, reviews: [{id:3}] }]
//   자바스크립트에서 쓰기에는 이쪽이 편합니다.
//
// ★★ 요청 수를 어떻게 셌나 — createClient 에 fetch 를 감싸서 넣었습니다.
//   진짜 서버로 그대로 나갑니다. 세기만 한 것입니다.
//   실제 화면에서는 개발자도구 Network 탭에 그대로 보입니다.


// ───── 문제 13 ─────
function 오류다듬기(오류, 상태) {
  if (상태 === 0) return { 종류: "연결실패", status: 503 };

  const 표 = {
    23505: { 종류: "중복", status: 409 },
    23514: { 종류: "값오류", status: 400 },
    23502: { 종류: "값오류", status: 400 },
    23503: { 종류: "대상없음", status: 400 },
    42501: { 종류: "권한없음", status: 403 },
  };

  return 표[오류.code] ?? { 종류: "알수없음", status: 500 };
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
  // 출력: 23505 → 중복/409
  // 출력: 23514 → 값오류/400
  // 출력: 42501 → 권한없음/403
  // 출력: (연결실패) → 연결실패/503
  // 출력: 42P01 → 알수없음/500

  // ★★ status 0 을 **먼저** 봐야 합니다.
  //   네트워크가 끊기면 code 가 빈 문자열입니다. 표에서 못 찾습니다.
  //   그러면 500 으로 떨어져서 "내 서버 잘못" 이 됩니다. 사실이 아닙니다.
  //
  // ★★★ 503 과 500 을 구분하는 이유
  //
  //   500  내 코드가 잘못했다. 재시도해도 똑같다.
  //   503  지금은 안 된다. 나중에 다시 오면 될 수도 있다.
  //
  //   클라이언트가 재시도할지 말지를 이걸로 정합니다.
  //   전부 500 으로 내보내면 재시도하면 될 것도 그냥 실패로 끝납니다.
  //
  // ★ 42P01(없는 표) 과 42703(없는 칸) 은 **내 오타**입니다.
  //   500 이 맞습니다. 그리고 로그에 꼭 남기세요.
  //   사용자가 아무리 다시 해도 안 됩니다. 내가 고쳐야 합니다.
}


// ───── 문제 14 ─────
function 저장소만들기(sb) {
  async function 하나(id) {
    const { data, error, status } = await sb
      .from("products")
      .select("id, name, category, status")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      const 다듬은것 = 오류다듬기(error, status);
      const 새오류 = new Error(error.message);
      새오류.code = error.code;
      새오류.status = 다듬은것.status;
      새오류.종류 = 다듬은것.종류;
      throw 새오류;
    }

    return data;
  }

  return { 하나 };
}

async function 문제14(sb) {
  const 저장소 = 저장소만들기(sb);

  console.log((await 저장소.하나(1)).name);
  // 출력: USB 허브
  console.log(await 저장소.하나(999999));
  // 출력: null

  // 오류만 내는 클라이언트를 손으로 만들어 끼웁니다.
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

  try {
    await 오류저장소.하나(1);
  } catch (에러) {
    console.log("던져진 오류 code:", 에러.code);
    // 출력: 던져진 오류 code: 42501
  }
}

// ★★ maybeSingle 이라 못 찾아도 error 가 안 옵니다. data 가 null 일 뿐입니다.
//   그래서 `if (error) throw` 와 `return data` 두 줄이면 끝납니다.
//
//   single 을 썼다면 못 찾을 때도 error 가 와서, 그 오류가 PGRST116 인지
//   진짜 오류인지 구분하는 코드를 또 써야 했을 겁니다.
//
// ★★★ 앞의 두 줄은 진짜 서버에 물어본 것입니다.
//   마지막 한 줄만 손으로 만든 것입니다. 왜 그랬는지가 중요합니다.
//
//   "오류가 왔을 때 던지는가" 를 확인하려면 오류가 나야 합니다.
//   그런데 진짜 서버에서 42501 을 부르려면 RLS 를 조였다 풀었다 해야 합니다.
//   시험 하나 때문에 표 설정을 바꾸는 것은 좋지 않습니다.
//
//   그래서 maybeSingle 만 흉내 내는 객체를 열 줄 짜리로 만들어 끼웠습니다.
//   개념05 에서 '선이 끊긴 클라이언트' 를 넣던 것과 같은 자리입니다.
//   저장소가 클라이언트를 **밖에서 받기** 때문에 이게 됩니다.
//   모듈 안에서 createClient 를 불렀다면 방법이 없습니다.
//   이게 "만들어서 쓰지 말고 받아서 쓰기" 의 값어치입니다. (개념05)
//
// ★ 던질 때 새 Error 를 만들어 code·status·종류 를 붙였습니다.
//   Supabase 의 error 는 Error 가 아니라 그냥 객체입니다.
//   그대로 throw 하면 스택이 안 남아서 어디서 났는지 못 찾습니다.


// ───── 문제 15 ─────
function 내저장소(sb) {
  const 칸들 = "id, name, category, status";

  const 확인 = (결과) => {
    if (결과.error) throw Object.assign(new Error(결과.error.message), { code: 결과.error.code });
    return 결과.data;
  };

  return {
    전부: async () => 확인(await sb.from("products").select(칸들).order("id")),

    하나: async (id) => 확인(await sb.from("products").select(칸들).eq("id", id).maybeSingle()),

    추가: async (값) =>
      확인(await sb.from("products")
        .insert({ name: 값.name, category: 값.category, status: 값.status ?? "품절" })
        .select(칸들).single()),

    수정: async (id, 바꿀것) => {
      const 고칠칸 = ["name", "category", "status"].filter((칸) => 바꿀것[칸] !== undefined);
      if (고칠칸.length === 0) return 확인(await sb.from("products").select(칸들).eq("id", id).maybeSingle());

      const 값 = {};
      for (const 칸 of 고칠칸) 값[칸] = 바꿀것[칸];

      return 확인(await sb.from("products").update(값).eq("id", id).select(칸들).maybeSingle());
    },

    삭제: async (id) => 확인(await sb.from("products").delete().eq("id", id).select("id")).length > 0,
  };
}

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

async function 문제15(sb) {
  try {
    const 결과 = await 저장소검사(내저장소(sb));
    console.log(`통과: ${결과.통과}개, 실패: ${JSON.stringify(결과.실패)}`);
    // 출력: 통과: 5개, 실패: []
  } finally {
    await 연습줄지우기(sb);
  }
}

// ★★★ 다섯 군데가 요령입니다.
//
//   하나()   maybeSingle — single 이면 없을 때 오류라 500 이 됩니다
//   추가()   .select().single() — 안 붙이면 201 에 data 가 null
//   수정()   고칠 칸 목록에 id 가 없음 — 그래야 id 가 안 바뀝니다
//   수정()   maybeSingle — 없는 id 를 고치면 null 이어야 합니다
//   삭제()   .select("id") 뒤 length — 안 붙이면 지웠는지 알 수 없습니다
//
// ★★ id 를 update 에 끼워 넣으면 Postgres 가 아예 거절합니다.
//     ERROR: 428C9 cannot insert a non-DEFAULT value into column "id"
//   generated always as identity 라서 그렇습니다.
//   02단원 SQLite 판에서는 조용히 id 가 바뀌었습니다. Postgres 가 더 깐깐합니다.
//   그래도 코드 쪽에서 거르세요. DB 가 막아 준다고 안 거르면 안 됩니다.
//
// ★★ 이 시험은 02단원 연습문제 15번과 **같은 함수**입니다. 한 글자도 안 고쳤습니다.
//   저장소가 파일이든 SQLite 든 Supabase 든 통과해야 합니다.
//   통과하면 services·controllers·routes 를 안 고쳐도 된다는 뜻입니다.
//
// ★ 시험이 확인 못 하는 것도 있습니다.
//   RLS, 네트워크 실패, 성능. 그건 실제 프로젝트에서 봐야 합니다.
//
// ★★★ 초기화 를 안 만들었습니다. 검사가 안 보기도 하지만, 더 큰 이유가 있습니다.
//
//   초기화 는 표를 통째로 비웁니다. 그런데 reviews 가 products 를
//   `on delete cascade` 로 참조합니다. (준비.sql)
//   products 를 비우면 **reviews 도 같이 사라집니다.**
//   그러면 문제 12 의 중첩 select 가 0건이 되고, 왜 그런지 알기 어렵습니다.
//
//   되살리려면 준비.sql 을 한 번 더 Run 하면 됩니다.
//   그래도 연습문제에서 표를 통째로 비우는 일은 안 하는 게 낫습니다.
//   그래서 뒷정리도 이름으로만 지웁니다. (연습줄지우기)
//
// ★ 검사가 만든 "검사용 상품" 은 검사 끝에서 지웁니다.
//   그래도 finally 에서 한 번 더 지웁니다. 중간에서 죽었을 때를 위해서입니다.


// ============================================================
// 실행
// ============================================================

async function 실행() {
  // ★ 지난번에 중간에 멈췄다면 "연습-" 줄이 남아 있습니다. 먼저 쓸어 냅니다.
  await 연습줄지우기(sb);

  await 문제1(sb);
  // (문제 2 는 손으로 적는 문제입니다)
  await 문제3(sb);
  await 문제4(sb);
  await 문제5(sb);
  await 문제6(sb);
  await 문제7(sb);
  await 문제8(sb);
  await 문제9(sb);
  // (문제 10 은 손으로 적는 문제입니다)
  await 문제11(sb);
  await 문제12();
  문제13();
  await 문제14(sb);
  await 문제15(sb);
}

실행();


// ============================================================
// SQL 로 써 볼 것 — 정답
// ============================================================
//
// ── S1 ──
//
//   create table products (
//     id          bigint      generated always as identity primary key,
//     name        text        not null unique,
//     category    text        not null check (category in ('A','B','C')),
//     status      text        not null default '품절'
//                             check (status in ('판매중','품절','검토중')),
//     price       integer,
//     created_at  timestamptz not null default now()
//   );
//
//   ★ AUTOINCREMENT 가 아니라 generated always as identity 입니다.
//   ★ INTEGER 는 integer 로 그대로 씁니다. (실수라면 REAL → double precision)
//   ★ STRICT 가 없습니다. Postgres 는 원래 타입을 지킵니다.
//   ★ 칸 이름이 전부 소문자입니다. 대문자를 쓰면 따옴표를 계속 써야 합니다.
//   ★ 준비.sql 과 대조해 보세요. 같으면 됩니다.
//
// ── S2 ──
//
//   -- ★★★ 두 단계로 나눕니다. 이유는 아래에 있습니다.
//   alter table products add column owner_id uuid default auth.uid();
//   -- (이미 있던 줄을 채웁니다. 내 계정 id 를 넣거나, 관리자 계정 id 를 넣습니다)
//   update products set owner_id = '여기에-내-uuid' where owner_id is null;
//   alter table products alter column owner_id set not null;
//
//   ★★★ 왜 한 줄로 안 하나
//
//     alter table products add column owner_id uuid not null default auth.uid();
//
//     이렇게 쓰면 표에 줄이 하나라도 있을 때 **실패합니다.**
//
//     · SQL Editor 에는 로그인 토큰이 없습니다. auth.uid() 가 null 입니다
//     · 기존 줄들이 전부 null 로 채워집니다
//     · not null 을 어겨서 ALTER 자체가 거절됩니다
//       → ERROR: column "owner_id" of relation "products" contains null values
//
//     빈 표라면 한 줄로도 통과합니다. 하지만 통과했다고 안심하면 안 됩니다.
//     **앞으로 SQL Editor 로 넣는 줄도 owner_id 가 null 입니다.**
//     default auth.uid() 는 로그인한 사람이 앱을 통해 넣을 때만 채워집니다.
//
//   -- 그다음에 RLS 와 정책입니다.
//   alter table products enable row level security;
//
//   create policy "로그인한 사람은 읽기"
//     on products for select
//     using (auth.uid() is not null);
//
//   create policy "내 것만 고치기"
//     on products for update
//     using (auth.uid() = owner_id)
//     with check (auth.uid() = owner_id);
//
//   ★★ update 에 using 과 with check 를 **둘 다** 썼습니다.
//     with check 를 빼면 내 상품을 남의 것으로 넘길 수 있습니다.
//       update products set owner_id = '남의id' where id = 1;
//     using 만 있으면 "내 줄이니 고쳐도 된다" 를 통과하고,
//     바뀐 뒤 모양은 검사하지 않습니다.
//
//   ★ insert 정책도 필요합니다. 안 만들면 아무도 못 넣습니다.
//       create policy "내 것으로 만들기" on products for insert
//         with check (auth.uid() = owner_id);
//
//   ★ 준비.sql 의 memos 가 바로 "RLS 만 켜고 정책이 없는" 상태입니다.
//     그래서 문제 11 에서 읽기는 0건, 쓰기는 42501 이 났습니다.
//
// ── S3 ──
//
//   select categories.code,
//          categories.name,
//          coalesce(string_agg(products.name, ', ' order by products.id), '(없음)') as 상품들,
//          count(products.id) as 개수
//   from categories
//   left join products on categories.code = products.category
//   group by categories.code, categories.name
//   order by categories.code;
//
//   ★ LEFT JOIN 이라 상품이 없는 분류도 나옵니다. (DB자료 05단원)
//   ★ count(products.id) 입니다. count(*) 를 쓰면 빈 분류가 1 로 나옵니다.
//   ★ group by 에 categories.name 도 넣었습니다.
//     Postgres 는 SELECT 에 적은 칸을 전부 GROUP BY 에 요구합니다. (개념02)
//     SQLite 였다면 categories.code 만 적어도 통과했을 겁니다.
//   ★ string_agg 안에 order by 를 넣을 수 있습니다. 순서가 보장됩니다.
//
// ── S4 ──
//
//   create function record_review(product_id bigint, result text)
//   returns bigint
//   language plpgsql
//   as $$
//   declare new_id bigint;
//   begin
//     insert into reviews (product_id, result)
//     values (record_review.product_id, record_review.result)
//     returning id into new_id;
//
//     if result = '비추천' then
//       update products set status = '검토중' where id = record_review.product_id;
//     end if;
//
//     return new_id;
//   end;
//   $$;
//
//   클라이언트에서:
//
//     const { data, error } = await sb.rpc("record_review", {
//       product_id: 1,
//       result: "비추천",
//     });
//
//   ★★★ 함수 하나가 통째로 한 트랜잭션입니다.
//     update 에서 실패하면 insert 도 되돌아갑니다.
//
//     클라이언트에서 insert 와 update 를 따로 부르면 이게 안 됩니다.
//     REST 요청 하나가 트랜잭션 하나라서, 두 요청을 묶을 방법이 없습니다.
//     그래서 "두 표를 같이 고쳐야 하는 업무" 는 DB 함수로 만듭니다.
//
//   ★ 인자 이름이 칸 이름과 겹쳐서 record_review.product_id 로 적었습니다.
//     안 그러면 Postgres 가 어느 쪽인지 몰라서 오류를 냅니다.
//     인자 이름에 p_ 를 붙이는 관례도 많이 씁니다 (p_product_id).
//
//   ★ 준비.sql 의 reviews 에는 result 칸이 없습니다. 먼저 더하세요.
//       alter table reviews add column result text;
//
// ── S5 ──
//
//   # 로그인 안 한 상태로 직접 부르기
//   curl "https://xxxx.supabase.co/rest/v1/memos?select=*" \
//        -H "apikey: 여러분의_anon_key"
//
//   [] 가 나와야 정상입니다. 자료가 나오면 RLS 가 뚫린 것입니다.
//
//   # 넣어지는지도 확인
//   curl -X POST "https://xxxx.supabase.co/rest/v1/memos" \
//        -H "apikey: 여러분의_anon_key" \
//        -H "Content-Type: application/json" \
//        -d '{"content":"뚫리나"}'
//
//   42501 이 나와야 정상입니다. 문제 11 에서 코드로 본 그것입니다.
//
//   ★★★ 화면에서 확인하면 안 됩니다.
//     화면은 코드가 걸러 준 결과를 보여 줄 뿐입니다.
//     공격자는 화면을 안 씁니다. curl 을 씁니다.
//
//   ★ Supabase 대시보드의 Database → Advisors 도 확인하세요.
//     RLS 가 꺼진 표를 찾아 줍니다. 배포 전에 반드시 보세요.
//
// ── S6 ──
//
//   select category, string_agg(name, ', ') as names
//   from products
//   where name ilike '%usb%'
//   group by category
//   order by category;
//
//   ★★ 두 가지를 바꿨습니다.
//
//     ① group_concat → string_agg
//        붙여 넣자마자 오류가 납니다.
//          ERROR: 42883  function group_concat(text, unknown) does not exist
//        이름만 다릅니다. 인자도 같습니다. 그래서 고치기 쉽습니다.
//
//     ② LIKE → ILIKE
//        **이게 더 중요합니다.** 오류가 안 납니다. 0건이 나옵니다.
//        SQLite 의 LIKE 는 영문 대소문자를 안 가리고,
//        Postgres 의 LIKE 는 가립니다. 문제 9 에서 코드로 본 그것입니다.
//
//        오류가 안 나고 결과만 안 나옵니다. 찾기 어려운 종류입니다.
//
//   ★★★ 옮길 때 무서운 것은 ①이 아니라 ②입니다.
//     ①은 붙여 넣는 순간 빨간 글씨가 뜹니다. 못 지나갑니다.
//     ②는 조용히 지나가서, 몇 주 뒤에 "검색이 안 돼요" 로 돌아옵니다.
//
//   ★ GROUP BY 는 그대로 둬도 됩니다.
//     category 로 묶고 category 만 SELECT 에 있으니 Postgres 규칙에 맞습니다.
//     여기에 name 을 그냥 적었다면 오류가 났을 겁니다. (개념02)
