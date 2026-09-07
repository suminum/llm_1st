// ============================================================
// 개념 03 — 자바스크립트 클라이언트
// ============================================================
//
// Supabase 는 표를 만들면 REST API 가 자동으로 생깁니다.
// 그 API 를 편하게 부르는 것이 @supabase/supabase-js 입니다.
//
// ★ 이 파일은 **진짜 Supabase 프로젝트에 붙어서 돕니다.**
//   흉내 낸 서버가 아니라, 여러분이 만든 프로젝트가 진짜로 대답합니다.
//
//   실행 전제 세 가지
//     1) .env 에 SUPABASE_URL 과 SUPABASE_ANON_KEY  (cp .env.예시 .env)
//     2) SQL Editor 에 준비.sql 을 붙여 넣고 Run
//     3) 인터넷 연결
//
//   .env 가 없으면 설정.js 가 안내를 찍고 멈춥니다. **그게 정상입니다.**
//
// ★★ 이 파일은 표를 진짜로 바꿉니다. 넣고, 고치고, 지웁니다.
//   그리고 **끝에서 전부 되돌립니다.** (8절)
//
// 실행: node 개념03_자바스크립트_클라이언트.js
// ============================================================

// 이파일은Supabase가필요합니다

// ============================================================
// 1. 만들기
// ============================================================

const { createClient } = require("@supabase/supabase-js");
const 설정 = require("./설정");

const sb = createClient(설정.SUPABASE_URL, 설정.SUPABASE_ANON_KEY);

// 이게 전부입니다. URL 과 anon key 두 개면 됩니다.
// (패키지는 이미 깔려 있습니다. 새 프로젝트라면 npm i @supabase/supabase-js)
//
// ★ 키에 한글을 쓰면 안 됩니다.
//   키는 apikey·Authorization 헤더에 실리는데, 헤더는 ASCII 만 받습니다.
//   진짜 키는 어차피 ASCII 니 문제없지만, 시험용 값을 한글로 지으면 터집니다.
//   설정.js 가 이걸 미리 잡아 줍니다. (백엔드 05단원 개념02 의 '헤더에 한글')
//
// ★★ anon key 는 브라우저에 그대로 나가는 키입니다. 숨기는 키가 아닙니다.
//   "그래도 되는 이유" 가 RLS 입니다. 개념04 에서 봅니다.
//   숨겨야 하는 것은 service_role key 입니다. 이건 서버에만 둡니다.

// ============================================================
// 2. 어떤 요청이 만들어지는가
// ============================================================
//
// 체이닝은 마법이 아닙니다. **주소 문자열을 조립하는 것**뿐입니다.
// 조립이 끝나면 평범한 GET/POST/PATCH/DELETE 한 번이 나갑니다. 헤더에는
// apikey 와 Authorization: Bearer <키> 가 함께 실립니다.
//
//   https://<프로젝트>.supabase.co/rest/v1/products?select=*&category=eq.A
//
//     https://<프로젝트>.supabase.co   프로젝트 주소 (SUPABASE_URL)
//     /rest/v1                        PostgREST 가 사는 곳. 늘 붙습니다
//     /products                       .from("products")
//     ?select=*&category=eq.A         .select("*").eq("category","A")
//
// ★ 진짜 주소를 눈으로 보고 싶으면 브라우저 개발자도구 → Network 탭,
//   또는 대시보드 → Logs → API Gateway 를 보세요.
//   Node 에서 돌리는 이 파일은 주소를 직접 보여 주지 않아서 아래에 표로 정리합니다.
//
//
// ── 조건 (필터) ────────────────────────────────────────────
//
//   .select("id, name")                 →  /products?select=id,name
//   .eq("category", "A")                →  /products?select=*&category=eq.A
//   .neq("status", "품절")              →  /products?select=*&status=neq.품절
//   .gt("price", 10000)                 →  /products?select=*&price=gt.10000
//   .gte("price",10000).lt("price",100000)
//                                       →  /products?select=*&price=gte.10000&price=lt.100000
//   .lte("price", 100000)               →  /products?select=*&price=lte.100000
//   .is("price", null)                  →  /products?select=*&price=is.null
//   .in("category", ["A","B"])          →  /products?select=*&category=in.(A,B)
//   .like("name", "USB%")               →  /products?select=*&name=like.USB%
//   .ilike("name", "%usb%")             →  /products?select=*&name=ilike.%usb%
//   .or("category.eq.A,category.eq.B")  →  /products?select=*&or=(category.eq.A,category.eq.B)
//   .not("status", "eq", "품절")        →  /products?select=*&status=not.eq.품절
//
// ★★ 규칙이 보이시죠.
//
//     칸 = 연산 . 값
//
//   `category=eq.A` 는 "category 칸을, eq 로, A 와" 입니다. 이 한 줄만 알면
//   문서를 훨씬 덜 봐도 됩니다. 나머지는 연산 이름 목록일 뿐입니다.
//
//     eq  같다        neq 다르다
//     gt  크다        gte 크거나 같다
//     lt  작다        lte 작거나 같다
//     is  null 비교   in  목록 안에 있다
//     like  대소문자 구분 패턴      ilike 대소문자 무시 패턴
//     not   뒤에 오는 연산을 뒤집는다  (not.eq.품절 = 품절이 아닌 것)
//     or    괄호 안을 OR 로 묶는다
//
// ★★ .is(칸, null) 을 쓰세요. .eq(칸, null) 이 아닙니다.
//   SQL 에서 `= NULL` 이 아니라 `IS NULL` 이었던 것과 같은 이유입니다. (DB자료 02단원)
//
// ★★★ 조건을 여러 개 붙이면 **전부 AND** 입니다.
//   위 표의 gte + lt 를 보세요. `price=gte.10000&price=lt.100000` 두 개가 나란히 붙습니다.
//   OR 를 쓰려면 .or("a.eq.1,b.eq.2") 처럼 **문자열 한 덩어리**로 적어야 합니다.
//   이 문자열은 PostgREST 문법이지 SQL 이 아닙니다. `=` 도 `AND` 도 쓰지 않습니다.
//
//
// ── 정렬 · 개수 ────────────────────────────────────────────
//
//   .order("price",{ascending:false}).order("id")
//                                       →  /products?select=*&order=price.desc,id.asc
//   .order("price",{nullsFirst:false})  →  /products?select=*&order=price.asc.nullslast
//   .limit(5)                           →  /products?select=*&limit=5
//   .range(20, 39)                      →  /products?select=*&offset=20&limit=20
//
// ★ .range(20, 39) 는 offset·limit 으로 바뀝니다. 끝 번호를 **포함**합니다.
//   range(0, 19) 가 20개입니다. 0부터 세고 끝을 포함한다는 점을 헷갈리기 쉽습니다.
//
// ★ .order() 를 안 붙이면 순서가 보장되지 않습니다. Postgres 도 마찬가지입니다.
//   (DB자료 02단원 개념03 에서 배운 그 규칙입니다)
//
//
// ── 값에 특수문자가 들어가면 ────────────────────────────────
//
// 값은 결국 **주소 문자열 안에** 들어갑니다. 그래서 규칙이 조금 있습니다.
//
//   .eq("name", "택배박스,택배봉투")
//     →  /t?select=*&name=eq.택배박스,택배봉투
//
//   .in("name", ["택배박스,택배봉투", "지퍼백"])
//     →  /t?select=*&name=in.("택배박스,택배봉투","지퍼백")
//
// ★★ in 만 따옴표로 감싸는 이유는 **자리** 때문입니다.
//   in 의 괄호 안에서는 쉼표가 값을 나누는 구분자입니다. 그냥 넣으면 값이 셋으로
//   읽히니, supabase-js 가 `,` `(` `)` 가 든 값을 큰따옴표로 감싸 줍니다.
//   eq 는 값이 하나뿐이라 나눌 일이 없습니다. 그래서 감싸지 않습니다.
//
// ★★★ 그런데 값 안에 **큰따옴표**가 있으면 감싸지 않습니다.
//
//   .in("name", ['따옴표"있음', "지퍼백"])  →  name=in.(따옴표"있음,지퍼백)
//
//   PostgREST 가 이걸 어떻게 읽을지 보장되지 않습니다. 겪을 일은 드물지만,
//   **사용자 입력을 .in() 에 그대로 넣지 마세요.** 허용 목록으로 거르세요.
//
// ★ 덤: .in() 은 배열의 중복을 알아서 지웁니다. ["A","A","B"] → in.(A,B)
//
// ★★ 이게 SQL 자리표시자와 다른 점입니다.
//   DB자료의 `?` 는 값이 무엇이든 완벽하게 지켜 줬습니다.
//   PostgREST 는 값을 **URL 문자열로 조립**합니다. 규칙이 더 약합니다.
//   그래도 SQL 인젝션은 안 됩니다. SQL 을 직접 이어 붙이지 않으니까요.
//
// ★ 한글과 공백은 실제로는 퍼센트 인코딩되어 나갑니다. 위 표는 읽기 좋게 푼 것입니다.
//     status=neq.품절  →  status=neq.%ED%92%88%EC%A0%88

// ============================================================
// 3. 결과 모양 — data 와 error
// ============================================================
//
// ★★★ 여기서 쓰는 세 줄은 **준비.sql 이 만들어 둔 것**입니다.
//
//     id 1  USB 허브       A  판매중   23900
//     id 2  27인치 모니터  A  품절    189000
//     id 3  무선 마우스    B  판매중   null
//
//   문법을 보여 주기 좋게 값을 골라 놓았습니다.
//     · category 가 A 인 것이 **둘**  → .eq("category","A") 가 2건을 냅니다
//     · price 가 null 인 것이 **하나** → .is("price", null) 을 보여 줄 수 있습니다
//     · 값이 벌어진 가격 둘          → .gte(...).lt(...) 구간을 보여 줄 수 있습니다
//
//   `price` 칸도 그래서 있습니다. **정본 상품표에는 없는 칸**입니다.
//
// ★★ 그래서 **번호가 02단원·개념05 와 다릅니다.**
//
//     02단원 · 이 단원 개념05   1 무선 마우스 · 2 27인치 모니터
//     여기(개념03)              1 USB 허브 · 2 27인치 모니터 · 3 무선 마우스
//
//   표 이름이 products 로 같아서 죽 읽으면 부딪힙니다. 일부러 그런 것입니다.
//
// ★ 진짜 서비스라면 이러면 안 됩니다. 여기 번호는 상품을 가리키는 게 아니라
//   **문법을 보여 주기 위한 것**입니다. (02단원 → 개념05 에서는 번호가 이어집니다)

async function 결과모양() {
  const 결과 = await sb.from("products").select("id, name").eq("category", "A").order("id");

  console.log("키들:", Object.keys(결과).join(", "));
  // 출력: 키들: success, error, data, count, status, statusText
  console.log("data:", JSON.stringify(결과.data));
  // 출력: data: [{"id":1,"name":"USB 허브"},{"id":2,"name":"27인치 모니터"}]
  console.log("error:", 결과.error, "| status:", 결과.status);
  // 출력: error: null | status: 200

  // ★★ .select("id, name") 이라고 적었으니 **그 두 칸만** 옵니다.
  //   category·status·price·created_at 은 안 옵니다. SQL 의 SELECT 와 같습니다.
  //   전부 필요하면 .select("*") 또는 .select() 라고 쓰세요.
  //
  //   ★ 필요한 칸만 적는 습관을 들이세요. 오가는 양이 줄고, 실수로 남의 개인정보를
  //     흘릴 일도 줄어듭니다. (개념04 의 phone 칸 이야기로 이어집니다)
  //
  // ★★★ 여기가 가장 중요합니다.
  //
  //   **오류가 나도 예외를 던지지 않습니다.** error 에 담아서 돌려줄 뿐입니다.
  //
  //     const { data } = await sb.from("t").select();
  //     data.map(...)     ← 오류였다면 data 가 null 이라 여기서 터집니다
  //
  //   그래서 error 를 **반드시** 확인해야 합니다.
  //
  //     const { data, error } = await sb.from("t").select();
  //     if (error) throw error;
  //
  //   백엔드 03단원의 fetch 와 반대입니다. fetch 는 404 여도 성공으로 치고,
  //   여기는 오류를 error 에 담습니다. 둘 다 "직접 확인해야 한다" 는 점은 같습니다.
  //
  // ★ 그래서 .throwOnError() 를 붙이는 방식도 많이 씁니다. 오류일 때 진짜로 던집니다.
  //   상품저장소.js 는 던지는 자리를 확인() 한 곳으로 모았습니다. 그것도 방법입니다.
}

// ============================================================
// 4. 한 줄만 꺼내기 — single 과 maybeSingle
// ============================================================

async function 하나꺼내기() {
  const 있는것 = await sb.from("products").select("*").eq("id", 1).single();
  console.log("single 있음:", 있는것.data.name, "| error:", 있는것.error);
  // 출력: single 있음: USB 허브 | error: null

  const 없는것 = await sb.from("products").select("*").eq("id", 9999).single();
  console.log("single 없음: data =", 없는것.data, "| code =", 없는것.error.code, "| status =", 없는것.status);
  // 출력: single 없음: data = null | code = PGRST116 | status = 406
  console.log("message:", 없는것.error.message);
  // 출력?: message: JSON object requested, multiple (or no) rows returned

  const 없는것2 = await sb.from("products").select("*").eq("id", 9999).maybeSingle();
  console.log("maybeSingle 없음: data =", 없는것2.data, "| error:", 없는것2.error, "| status:", 없는것2.status);
  // 출력: maybeSingle 없음: data = null | error: null | status: 200

  // ★★ 차이가 명확합니다.
  //
  //   single()       0건이면 **오류**입니다 (PGRST116, 406)
  //   maybeSingle()  0건이면 data 가 null, error 는 없습니다 (200)
  //
  //   "반드시 있어야 하는 것" 은 single, "없을 수도 있는 것" 은 maybeSingle.
  //
  //   404 를 내야 하는 조회(GET /products/:id) 에는 maybeSingle 이 낫습니다.
  //   error 가 없으니 data === null 만 보면 됩니다. 02단원 저장소의 `?? null` 자리입니다.
  //   상품저장소.js 의 하나(id) 가 maybeSingle 을 쓴 이유가 이것입니다.
  //
  // ★★★ 재미있는 점: 이 둘은 **검사하는 곳이 다릅니다.**
  //
  //   single()      Accept 헤더를 바꿔서 **서버**가 검사하게 합니다.
  //                 "객체 하나로 달라" 는 뜻이라 0건이나 2건이면 서버가 거절합니다.
  //                 거절이니 HTTP 상태가 붙습니다 → 406 Not Acceptable
  //   maybeSingle() 헤더를 안 바꿉니다. 배열을 그대로 받아 **클라이언트**가 개수를
  //                 셉니다. 0건이면 data 를 null 로. 서버는 200 을 준 것입니다.
  //
  //   ★ 그래서 2건 이상일 때는 둘 다 PGRST116 을 냅니다.
  //     "없어도 되지만 둘이면 안 된다" 는 뜻입니다.
}

// ============================================================
// 5. 넣기 · 고치기 · 지우기
// ============================================================
//
// ★ 여기부터 표를 진짜로 바꿉니다. 이 절이 넣은 것은 이 절 끝에서 지웁니다.
//   그래도 못 지우고 죽을 수 있으니, 8절이 finally 로 한 번 더 치웁니다.

async function 넣고고치기() {
  // ── 넣기 ──
  const 만든것 = await sb
    .from("products")
    .insert({ name: "웹캠", category: "C" })
    .select("id, name, category, status")
    .single();

  console.log("insert:", 만든것.data.name, "|", 만든것.data.category, "| status 칸:", 만든것.data.status);
  // 출력: insert: 웹캠 | C | status 칸: 품절
  console.log("DB 가 붙여 준 id:", 만든것.data.id, "| HTTP status:", 만든것.status);
  // 출력?: DB 가 붙여 준 id: 4 | HTTP status: 201

  // ★ status 를 안 줬는데 '품절' 이 들어갔습니다. 준비.sql 의 DEFAULT 입니다.
  //   id 도 created_at 도 안 줬습니다. DB 가 채웁니다.
  //   **기본값과 번호는 DB 가 정합니다.** 코드에서 흉내 내지 마세요.

  // ── .select() 를 안 붙이면 ──
  const 조용히 = await sb.from("products").insert({ name: "노트북 거치대", category: "C" });
  console.log("select 없이 insert:", 조용히.data, "| status:", 조용히.status, "| error:", 조용히.error);
  // 출력: select 없이 insert: null | status: 201 | error: null

  // ★★ 만든 줄이 안 옵니다. 201 은 "만들었다", 몸통은 비었다는 뜻입니다.
  //   만든 것의 id 가 필요하면 .select() 를 붙이세요.
  //   (DB자료의 RETURNING 과 같은 일을 합니다. Prefer: return=representation 헤더가 붙습니다)

  // ── 여러 줄 한 번에 ──
  const 여러개 = await sb
    .from("products")
    .insert([
      { name: "외장 SSD", category: "A" },
      { name: "USB 메모리", category: "B" },
    ])
    .select("name");

  console.log("여러 줄:", 여러개.data.length, "개 |", 여러개.data.map((줄) => 줄.name).join(", "));
  // 출력: 여러 줄: 2 개 | 외장 SSD, USB 메모리

  // ★ 배열로 넘기면 **한 번의 요청**으로 여러 줄이 들어갑니다. 반복문으로 하나씩
  //   넣지 마세요. N+1 입니다. 여기는 왕복마다 네트워크입니다. (DB자료 06단원 개념05)

  // ── 고치기 ──
  const 조용한고치기 = await sb.from("products").update({ status: "검토중" }).eq("id", 2);
  console.log("select 없이 update: data =", 조용한고치기.data, "| status:", 조용한고치기.status);
  // 출력: select 없이 update: data = null | status: 204

  const 고친것 = await sb
    .from("products")
    .update({ status: "검토중" })
    .eq("id", 2)
    .select("name, status")
    .single();

  console.log("update:", 고친것.data.name, "→", 고친것.data.status, "| status:", 고친것.status);
  // 출력: update: 27인치 모니터 → 검토중 | status: 200

  // ★ 상태 코드를 정리해 둡시다. .select() 유무로 갈립니다.
  //
  //     insert  .select() 없음 → 201      .select() 있음 → 201 + 몸통
  //     update  .select() 없음 → 204      .select() 있음 → 200 + 몸통
  //     delete  .select() 없음 → 204      .select() 있음 → 200 + 몸통
  //
  //   204 는 "됐는데 줄 게 없다" 입니다. 오류가 아닙니다.
  //
  // ★★★ WHERE 를 빠뜨리면 전부 바뀝니다. (DB자료 03단원 의 그 사고)
  //
  //     await sb.from("products").update({ status: "품절" });
  //
  //   .eq() 를 안 붙였습니다. 표 전체가 품절이 됩니다.
  //
  //   ★ 다행히 Supabase 는 이걸 막아 줍니다.
  //     조건 없는 update·delete 는 서버가 거절합니다. (21000 오류가 옵니다)
  //
  //   ★★★ 이건 **PostgREST 의 기능이 아닙니다.**
  //     `pg_safeupdate` 라는 Postgres 확장이 하는 일이고, Supabase 가 켜 둔 것뿐입니다.
  //     그래서 **직접 Postgres + PostgREST 를 띄운 곳에서는 이 보호가 없습니다.**
  //     남의 안전장치에 기대지 마세요. 조건을 빼먹지 않는 게 먼저입니다.

  // ── 지우기 ──
  const 지운것 = await sb.from("products").delete().eq("name", "웹캠").select("name");
  console.log("delete:", JSON.stringify(지운것.data.map((줄) => 줄.name)), "| status:", 지운것.status);
  // 출력: delete: ["웹캠"] | status: 200

  const 없는것지우기 = await sb.from("products").delete().eq("id", 999999).select();
  console.log("없는 것 지우기:", JSON.stringify(없는것지우기.data), "| error:", 없는것지우기.error);
  // 출력: 없는 것 지우기: [] | error: null

  // ★★ 없는 것을 지워도 **오류가 아닙니다.** 빈 배열입니다.
  //   DB자료의 changes === 0 과 같은 자리입니다. 404 를 내려면 배열 길이를 봐야 합니다.
  //
  //     const { data } = await sb.from("t").delete().eq("id", id).select();
  //     if (data.length === 0) return res.status(404)...
  //
  //   상품저장소.js 의 삭제(id) 가 정확히 이 판단을 합니다.

  // ── 있으면 고치고 없으면 넣기 (UPSERT) ──
  await sb.from("products").upsert({ name: "외장 SSD", category: "C" }, { onConflict: "name" });

  const 확인 = await sb.from("products").select("name, category").eq("name", "외장 SSD").single();
  console.log("upsert 뒤 category:", 확인.data.category);
  // 출력: upsert 뒤 category: C

  // ★★ 방금 A 로 넣었던 '외장 SSD' 가 C 로 바뀌었습니다. 새로 만들지 않았습니다.
  //   onConflict 에 적은 칸(name)에 UNIQUE 가 걸려 있어야 합니다.
  //   준비.sql 에 `name text not null unique` 가 있어서 됩니다. 없으면 오류입니다.
  //
  // ★ 보낸 칸만 바뀝니다. status·price 는 그대로 남습니다. "통째로 갈아 끼우기" 가
  //   아니라 "보낸 것만 덮기" 입니다.

  // ── 이 절이 넣은 것 치우기 ──
  //
  // ★ 웹캠은 위에서 이미 지웠습니다. 남은 셋을 .in() 으로 한 번에 지웁니다.
  //   지우기도 조건 문법은 조회와 똑같습니다.
  const 치운것 = await sb
    .from("products")
    .delete()
    .in("name", ["노트북 거치대", "외장 SSD", "USB 메모리"])
    .select("name");

  console.log("이 절이 넣은 것 치우기:", 치운것.data.length, "줄");
  // 출력: 이 절이 넣은 것 치우기: 3 줄

  // ★★ 줄은 사라져도 **번호는 안 돌아옵니다.**
  //   이 파일을 다시 돌리면 웹캠에 4 가 아니라 훨씬 큰 번호가 붙습니다.
  //
  //   ★ 실패한 insert 도 번호를 하나씩 써 버립니다. (6절에서 한 번 실패합니다)
  //     번호는 표가 아니라 **sequence** 가 발급합니다. 롤백해도 되감기지 않습니다.
  //
  //   **번호에 빈칸이 생기는 것이 정상입니다.** 촘촘하기를 기대하지 마세요.
  //   "몇 개 팔렸나" 를 마지막 id 로 세면 틀립니다. count 로 세세요.
}

// ============================================================
// 6. 오류 — Postgres 코드로 판단합니다
// ============================================================

async function 오류처리() {
  // ── 23505 UNIQUE 위반 ──
  //
  // 준비.sql 의 name 에 UNIQUE 가 걸려 있습니다. 있는 이름을 또 넣어 봅니다.
  const 중복 = await sb.from("products").insert({ name: "USB 허브", category: "A" }).select();

  console.log("이름 중복 → code:", 중복.error.code, "| status:", 중복.status);
  // 출력: 이름 중복 → code: 23505 | status: 409
  console.log("message:", 중복.error.message);
  // 출력?: message: duplicate key value violates unique constraint "products_name_key"
  console.log("error 키:", Object.keys(중복.error).join(", "));
  // 출력?: error 키: code, details, hint, message

  // ★★ 이 메시지를 사용자에게 그대로 보내면 안 됩니다. 표 이름과 제약 이름이 새어
  //   나갑니다. 상품저장소.js 의 다듬은오류() 가 그 일(바꿔서 내보내기)을 합니다.

  // ★ 실패한 insert 는 **아무것도 안 남깁니다.** 그래서 이 절은 표를 바꾸지 않습니다.
  //   23514(CHECK)·23502(NOT NULL) 같은 것도 마찬가지입니다. 아래 코드표에 정리해 뒀습니다.

  // ── 42501 RLS 에 막힘 ──
  //
  // ★ products 는 준비.sql 이 "수업용 전체 허용" 정책을 걸어 둬서 이 오류가 안 납니다.
  //   memos 표는 RLS 만 켜고 **정책을 하나도 안 걸었습니다.** 그래서 여기로 봅니다.

  const 메모읽기 = await sb.from("memos").select("*");
  console.log("memos 읽기: data =", JSON.stringify(메모읽기.data), "| error:", 메모읽기.error);
  // 출력: memos 읽기: data = [] | error: null

  const 메모쓰기 = await sb.from("memos").insert({ content: "들어갈 수 있을까요" }).select();
  console.log("memos 쓰기 → code:", 메모쓰기.error.code, "| status:", 메모쓰기.status);
  // 출력: memos 쓰기 → code: 42501 | status: 403
  console.log("message:", 메모쓰기.error.message);
  // 출력?: message: new row violates row-level security policy for table "memos"

  // ★★★ 읽기와 쓰기가 다르게 굽니다. 이게 RLS 의 성격입니다.
  //
  //   읽기  오류가 아닙니다. **빈 배열**입니다. "볼 수 있는 줄이 없다" 이지
  //         "막혔다" 가 아닙니다. 표에 줄이 있어도 없는 것처럼 보입니다.
  //   쓰기  42501 로 **거절**합니다. 새 줄이 정책을 통과 못 했다는 뜻입니다.
  //
  // ★★ 그래서 "조회했는데 왜 빈 배열이지?" 는 RLS 를 의심해야 하는 신호입니다.
  //   오류가 안 나니 코드만 봐서는 절대 모릅니다. 제일 많이 헤매는 곳입니다.
  //   정책을 어떻게 거는지는 **개념04** 에서 합니다.

  // ── 없는 표를 부르면 ──
  const 오타 = await sb.from("prodcuts").select("*");
  console.log("표 이름 오타 → code:", 오타.error.code, "| status:", 오타.status);
  // 출력?: 표 이름 오타 → code: PGRST205 | status: 404
  console.log("message:", 오타.error.message);
  // 출력?: message: Could not find the table 'public.prodcuts' in the schema cache

  // ★★ 표 이름 오타 → PGRST205 (404). 옛 버전이나 직접 띄운 PostgREST 는 42P01 이 옵니다.
  //   어느 쪽이든 **내 오타**입니다. 사용자 잘못이 아닙니다.
  //
  //   ★ 표를 방금 만들었는데 PGRST205 가 나면 **캐시가 아직 모르는 것**입니다.
  //     준비.sql 을 막 돌린 직후에 겪을 수 있습니다. 잠깐 뒤에 다시 해 보세요.

  // ★ 자주 만나는 코드들 (PGRST 로 시작하는 둘 말고는 전부 Postgres 표준 코드입니다)

  const 코드표 = [
    ["23505", "UNIQUE 위반 — 겹치는 값", "409 이미 있습니다"],
    ["23503", "외래키 위반 — 가리키는 게 없음", "400 대상이 없습니다"],
    ["23502", "NOT NULL 위반 — 값이 빠짐", "400 필수입니다"],
    ["23514", "CHECK 위반 — 허용 안 되는 값", "400 값이 올바르지 않습니다"],
    ["42501", "RLS 에 막힘 — 권한 없음", "403 권한이 없습니다"],
    ["42P01", "그런 표가 없음 (오타)", "500 내 잘못입니다"],
    ["42703", "그런 칸이 없음 (오타)", "500 내 잘못입니다"],
    ["PGRST116", "single() 인데 0건 또는 2건 이상", "404 또는 500"],
    ["PGRST205", "스키마 캐시에 그런 표가 없음 (오타)", "500 내 잘못입니다"],
  ];

  for (const [코드, 뜻, 내응답] of 코드표) {
    console.log(`${코드} | ${뜻} | ${내응답}`);
  }
  // 출력: 23505 | UNIQUE 위반 — 겹치는 값 | 409 이미 있습니다
  // 출력: 23503 | 외래키 위반 — 가리키는 게 없음 | 400 대상이 없습니다
  // 출력: 23502 | NOT NULL 위반 — 값이 빠짐 | 400 필수입니다
  // 출력: 23514 | CHECK 위반 — 허용 안 되는 값 | 400 값이 올바르지 않습니다
  // 출력: 42501 | RLS 에 막힘 — 권한 없음 | 403 권한이 없습니다
  // 출력: 42P01 | 그런 표가 없음 (오타) | 500 내 잘못입니다
  // 출력: 42703 | 그런 칸이 없음 (오타) | 500 내 잘못입니다
  // 출력: PGRST116 | single() 인데 0건 또는 2건 이상 | 404 또는 500
  // 출력: PGRST205 | 스키마 캐시에 그런 표가 없음 (오타) | 500 내 잘못입니다

  // ★★ 세 번째 칸은 **내 API 가 손님에게 줄 답**입니다. Supabase 가 준 상태가 아닙니다.
  //   23503 은 서버가 409 로 주지만 우리 API 는 400 이 더 맞습니다. **번역해서** 내보내세요.
  //
  // ★★ 42P01·42703·PGRST205 는 **내 코드의 오타**입니다.
  //   사용자 잘못이 아니니 400 이 아니라 500 이고, 로그에 남겨야 합니다.
}

// ============================================================
// 6-2. 네트워크가 끊기면
// ============================================================
//
// ★★★ 이 절만 **일부러 고장 낸 클라이언트**를 씁니다. 진짜로 랜선을 뽑을 수는 없으니,
//   fetch 자리에 "무조건 던지는 함수" 를 끼워 넣어 요청이 아예 못 나간 상황을 만듭니다.
//   나머지 절은 전부 진짜 Supabase 에 붙어 있습니다. 여기만 예외입니다.

async function 망가짐() {
  const 끊긴것 = createClient("https://example.supabase.co", "example-key", {
    auth: { persistSession: false },
    global: { fetch: async () => { throw new TypeError("fetch failed"); } },
  });

  const 결과 = await 끊긴것.from("products").select().retry(false);

  console.log("data:", 결과.data, "| status:", 결과.status);
  // 출력: data: null | status: 0
  console.log("code:", JSON.stringify(결과.error.code), "| message:", 결과.error.message.split("\n")[0]);
  // 출력: code: "" | message: TypeError: fetch failed

  // ★★★ 여기서도 예외를 안 던집니다. error 에 담아 줍니다.
  //   status 가 **0** 입니다. HTTP 응답 자체를 못 받았다는 뜻입니다.
  //   code 는 빈 문자열입니다. Postgres 가 대답한 게 아니니까요.
  //
  // ★ 그래서 오류를 나눌 때 이렇게 봅니다.
  //
  //     status === 0        → 네트워크·DNS 문제. 재시도해 볼 만합니다.
  //     code 가 23xxx       → 자료 문제. 재시도해도 똑같습니다.
  //     code 가 42xxx       → 내 코드 문제. 고쳐야 합니다.
  //
  //   상품저장소.js 의 다듬은오류() 가 status 0 을 503 으로 바꾸는 것도 같은 판단입니다.
  //
  // ★★ .retry(false) 를 붙인 이유
  //   supabase-js 는 **GET·HEAD 를 자동으로 3번까지 다시 보냅니다.** 1초 → 2초 → 4초 를
  //   쉬면서요. 그냥 두면 여기서 7초를 기다립니다. 그래서 껐습니다.
  //
  //   ★ POST·PATCH·DELETE 는 자동 재시도를 **안 합니다.** 두 번 들어가면 큰일이니까요.
  //     "다시 해도 안전한 것만 다시 한다" — 멱등성 이야기입니다. (백엔드 03단원)
  //
  // ★★ SQLite 에서는 이런 경우가 없었습니다. 같은 컴퓨터에 있었으니까요.
  //   클라우드 DB 로 오면 **네트워크 실패를 반드시 다뤄야 합니다.**
}

// ============================================================
// 7. 표를 이어서 가져오기
// ============================================================
//
// 준비.sql 이 reviews 표를 만들어 뒀습니다.
//
//   reviews.product_id → products.id  (외래키)
//   (1,5) (1,4) (2,3)   ← USB 허브에 둘, 27인치 모니터에 하나, 무선 마우스는 없음

async function 관계() {
  const 붙여서 = await sb.from("products").select("id, name, reviews(score)").order("id");

  console.log("한 줄의 모양:", JSON.stringify(붙여서.data[0]));
  // 출력?: 한 줄의 모양: {"id":1,"name":"USB 허브","reviews":[{"score":5},{"score":4}]}

  for (const 줄 of 붙여서.data) {
    const 점수들 = 줄.reviews.map((리뷰) => 리뷰.score);
    const 평균 = 점수들.length
      ? (점수들.reduce((합, 값) => 합 + 값, 0) / 점수들.length).toFixed(1)
      : "-";
    console.log(`${줄.name} | 리뷰 ${점수들.length}개 | 평균 ${평균}`);
  }
  // 출력: USB 허브 | 리뷰 2개 | 평균 4.5
  // 출력: 27인치 모니터 | 리뷰 1개 | 평균 3.0
  // 출력: 무선 마우스 | 리뷰 0개 | 평균 -

  // ★★ 요청은 **한 번**입니다. 주소는 `/products?select=id,name,reviews(score)` 입니다.
  //
  //   DB자료의 JOIN 을 이렇게 씁니다. 그런데 결과 모양이 다릅니다.
  //   SQL 의 JOIN 은 **줄이 늘어나는데**(DB자료 05단원), 여기서는 **중첩된 배열**로 옵니다.
  //
  //     SQL      USB 허브 | 5     ← 같은 상품이 두 줄
  //              USB 허브 | 4
  //     여기     { name: "USB 허브", reviews: [{score:5},{score:4}] }   ← 한 줄
  //
  //   자바스크립트에서 쓰기에는 이쪽이 훨씬 편합니다. 화면에 그대로 뿌리면 됩니다.
  //
  // ★ 리뷰가 없는 상품(무선 마우스)은 **빈 배열**로 옵니다. LEFT JOIN 과 같습니다.
  //   그래서 .length 로 안전하게 셀 수 있습니다.

  // ── 거꾸로 ──
  const 거꾸로 = await sb.from("reviews").select("score, products(name)").order("id");
  console.log("리뷰 쪽에서 보기:", JSON.stringify(거꾸로.data[0]));
  // 출력: 리뷰 쪽에서 보기: {"score":5,"products":{"name":"USB 허브"}}

  // ★★ 방향이 바뀌면 **모양도 바뀝니다.**
  //
  //     products → reviews   리뷰가 여럿일 수 있으니 **배열**
  //     reviews  → products  상품은 하나뿐이니 **객체**
  //
  //   외래키를 보고 알아서 정해 줍니다. 배열인 줄 알고 .map 을 부르면 터집니다.

  // ── N+1 이야기 ──
  //
  // ★★★ 이게 N+1 을 없애는 방법입니다. (DB자료 06단원 개념05)
  //
  //     ✗ 목록 1번 + 상품마다 리뷰 1번씩       →  요청 1 + N 번
  //     ○ select("id,name,reviews(score)")     →  요청 1번
  //
  //   상품이 200개면 201번 대 1번입니다.
  //   같은 컴퓨터의 SQLite 였다면 201번이 그럭저럭 빨랐습니다.
  //   여기서는 한 번이 네트워크 왕복입니다. 201 × 30ms = 6초. **1번이면 30ms 입니다.**
  //
  //   ★ 개발자도구 Network 탭을 열어 두면 요청 줄 수가 눈에 보입니다.
  //
  // ★ 이게 되려면 두 표 사이에 **외래키가 있어야 합니다.**
  //   Supabase 가 외래키를 보고 관계를 알아냅니다. 안 걸었으면 이 문법이 안 됩니다.
  //   준비.sql 의 `references products(id)` 가 그것입니다.

  // ── DB 함수 부르기 (rpc) ──
  //
  // ★ 준비.sql 에는 함수가 없습니다. 그래서 여기서는 돌리지 않고 적어만 둡니다.
  //   해 보고 싶으면 SQL Editor 에 이걸 붙여 넣으세요.
  //
  //     create function count_by_category(target_category text)
  //     returns integer language sql as $$
  //       select count(*)::integer from products where category = target_category;
  //     $$;
  //
  //   그리고 이렇게 부릅니다.
  //
  //     await sb.rpc("count_by_category", { target_category: "A" });
  //     →  POST /rpc/count_by_category   {"target_category":"A"}
  //
  //   ★ 조회인데 POST 입니다. 인자를 몸통에 실어 보내기 때문입니다.
  //
  // ★★ 여러 표를 **한 트랜잭션으로** 고쳐야 할 때 이걸 씁니다.
  //   클라이언트에서 update 를 두 번 부르면 그 사이에 아무 일이나 일어납니다.
  //   중간에 네트워크가 끊기면 앞의 것만 반영된 채로 남습니다. (6-2 절)
  //   트랜잭션으로 묶으려면 DB 함수 안에서 해야 합니다. (개념05 에서 다시 봅니다)
}

// ============================================================
// 8. 되돌리기 — 예제가 바꾼 것은 예제가 치웁니다
// ============================================================
//
// ★★★ 자료용 예제의 규칙입니다.
//
//   **돌리기 전과 돌린 뒤의 표가 같아야 합니다.**
//
//   그래야 다음 사람이 준비.sql 을 다시 붙여 넣지 않고도 그대로 또 볼 수 있습니다.
//   두 번째 실행부터 출력이 달라지는 예제는 자료로 못 씁니다.
//
// ★★ 5절이 끝에서 스스로 치우기는 합니다. 그런데 **중간에 죽으면 거기까지 못 갑니다.**
//   그래서 아래 전부실행() 이 try / finally 로 감쌌습니다.
//   무슨 일이 있어도 finally 는 돕니다.
//
// ★ 되돌리기는 **여러 번 돌려도 괜찮게** 짰습니다.
//   이미 지워진 것을 또 지워도 오류가 아니고(5절), update 도 같은 값을 다시 쓸 뿐입니다.
//   이걸 멱등이라고 합니다. 뒷정리 코드는 멱등으로 짜세요.

async function 되돌리기() {
  // 5절이 검토중으로 바꿔 둔 것을 원래대로
  await sb.from("products").update({ status: "품절" }).eq("id", 2);

  // 5절이 넣었을 수 있는 것들을 전부
  await sb
    .from("products")
    .delete()
    .in("name", ["웹캠", "노트북 거치대", "외장 SSD", "USB 메모리"]);

  const 남은것 = await sb.from("products").select("id, name, status").order("id");
  console.log("되돌린 뒤:", JSON.stringify(남은것.data));
  // 출력: 되돌린 뒤: [{"id":1,"name":"USB 허브","status":"판매중"},{"id":2,"name":"27인치 모니터","status":"품절"},{"id":3,"name":"무선 마우스","status":"판매중"}]

  // ★ 준비.sql 을 막 돌린 직후와 똑같은 세 줄입니다.
  //   id 만 그대로고, 그 뒤의 번호는 이미 써 버렸습니다. (5절 마지막 ★★)
  //   완전히 처음으로 돌리고 싶으면 준비.sql 을 한 번 더 Run 하세요.
}

// ============================================================
// 실행 순서
// ============================================================

async function 전부실행() {
  await 결과모양();     // 3
  await 하나꺼내기();   // 4

  try {
    await 넣고고치기(); // 5   ← 여기부터 표를 바꿉니다
    await 오류처리();   // 6
    await 망가짐();     // 6-2
    await 관계();       // 7
  } finally {
    await 되돌리기();   // 8   ← 위에서 무슨 일이 나도 여기는 돕니다
  }
}

전부실행().catch((오류) => {
  console.error("예제가 끝까지 못 갔습니다:", 오류.message);
  process.exit(1);
});

// ============================================================
// 정리
// ============================================================
//
//   createClient(URL, ANON_KEY)  — 키는 ASCII 여야 합니다
//
//   조건    .eq .neq .gt .gte .lt .lte .in .is .like .ilike .not .or
//           →  ?칸=연산.값  으로 바뀝니다. 여러 개는 전부 AND
//   정렬    .order("칸", { ascending: false, nullsFirst: false })
//   범위    .range(0, 19)  ← 0부터, 끝을 포함, 20개
//   주소를 눈으로 보려면 Network 탭 또는 대시보드 Logs → API Gateway
//
//   결과    { success, data, error, count, status, statusText }
//           **오류를 던지지 않습니다.** error 를 반드시 확인하세요.
//           .throwOnError() 를 붙이면 던집니다.
//
//   single()      0건이면 오류 (PGRST116, 406) — Accept 헤더로 **서버**가 검사
//   maybeSingle() 0건이면 data 가 null (200)  — **클라이언트**가 개수를 셈
//   404 를 낼 조회에는 maybeSingle 이 낫습니다
//
//   insert/update/delete 는 .select() 를 붙여야 결과가 옵니다
//           안 붙이면  insert 201 · update 204 · delete 204, data 는 null
//   없는 것을 지워도 오류가 아닙니다. data.length 로 판단하세요.
//   upsert 는 onConflict 칸에 UNIQUE 가 있어야 합니다. 보낸 칸만 덮습니다.
//
//   오류 코드  23505 중복 · 23503 외래키 · 23502 NOT NULL · 23514 CHECK
//              42501 RLS — 쓰기는 막히고, **읽기는 빈 배열**입니다
//              42P01·42703·PGRST205 는 내 오타 → 500
//              status 0 은 네트워크 실패 (GET 은 3번 자동 재시도합니다)
//
//   .select("id, name, reviews(score)")  로 N+1 을 없애세요. 외래키가 있어야 합니다.
//           products → reviews 는 배열, reviews → products 는 객체
//   트랜잭션이 필요하면 DB 함수 + rpc 를 쓰세요.
//
//   예제가 표를 바꿨으면 **끝에서 되돌리세요.** try / finally 로 감싸세요.
//
// 다음(개념04) 에서 브라우저에 키를 노출해도 되는 이유 — RLS 를 봅니다.
//   방금 memos 가 왜 빈 배열이었는지, 왜 42501 이 났는지가 거기서 풀립니다.
