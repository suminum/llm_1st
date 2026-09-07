// ============================================================
// 개념 02 — Postgres 는 SQLite 와 무엇이 다른가
// ============================================================
//
// 02~02단원에서 배운 SQL 은 그대로 씁니다.
// SELECT · WHERE · JOIN · GROUP BY · 색인 · 트랜잭션 — 전부 같습니다.
//
// 다른 건 주로 "표를 만들 때" 와 "몇 가지 함정" 입니다.
// 그 차이만 정리합니다.
//
// ★ 이 파일은 Postgres 를 실행하지 않습니다.
//   SQLite 로 확인할 수 있는 것은 실제로 재고, 나머지는 표로 정리합니다.
//   Supabase 프로젝트를 만들었으면 SQL Editor 에 직접 쳐 보세요.
//
// 실행: node 개념02_Postgres는_무엇이_다른가.js
// ============================================================

const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(":memory:");

// ============================================================
// 1. 표 만들기 — 문법이 다릅니다
// ============================================================
//
// ── SQLite (02단원에서 쓴 것) ──
//
//   CREATE TABLE 상품 (
//     id     INTEGER PRIMARY KEY AUTOINCREMENT,
//     name   TEXT    NOT NULL UNIQUE,
//     category   TEXT    NOT NULL CHECK (category IN ('A','B','C')),
//     status TEXT    NOT NULL DEFAULT '품절',
//     가격   INTEGER,
//     등록시각 TEXT  NOT NULL DEFAULT (datetime('now','localtime'))
//   ) STRICT
//
// ── Postgres ──
//
//   create table products (
//     id     bigint generated always as identity primary key,
//     name   text   not null unique,
//     category   text   not null check (category in ('A','B','C')),
//     status text   not null default '품절',
//     price integer,
//     created_at  timestamptz not null default now()
//   );
//
// 하나씩 봅시다.

const 표차이 = [
  ["자동 번호", "INTEGER PRIMARY KEY AUTOINCREMENT", "bigint generated always as identity"],
  ["글자", "TEXT", "text (varchar 도 있지만 text 를 쓰세요)"],
  ["정수", "INTEGER", "integer / bigint"],
  ["실수", "REAL", "double precision"],
  ["참거짓", "INTEGER 에 0/1", "boolean (true/false 가 진짜 있습니다)"],
  ["시각", "TEXT 에 문자열", "timestamptz"],
  ["타입 지키기", "STRICT 를 붙여야", "원래 지킵니다"],
];

for (const [항목, sqlite, pg] of 표차이) {
  console.log(`${항목} | ${sqlite} | ${pg}`);
}
// 출력: 자동 번호 | INTEGER PRIMARY KEY AUTOINCREMENT | bigint generated always as identity
// 출력: 글자 | TEXT | text (varchar 도 있지만 text 를 쓰세요)
// 출력: 정수 | INTEGER | integer / bigint
// 출력: 실수 | REAL | double precision
// 출력: 참거짓 | INTEGER 에 0/1 | boolean (true/false 가 진짜 있습니다)
// 출력: 시각 | TEXT 에 문자열 | timestamptz
// 출력: 타입 지키기 | STRICT 를 붙여야 | 원래 지킵니다

// ★★ STRICT 가 없습니다. **원래 지키기 때문입니다.**
//   02단원에서 STRICT 를 붙인 이유가 "Postgres 처럼 만들려고" 였습니다.
//   그러니 지금까지 STRICT 로 짜 왔다면 옮길 때 놀랄 일이 적습니다.
//
// ★★ 참거짓이 진짜 있습니다.
//   SQLite 에서 true 를 못 넣어 1/0 을 썼던 것 기억하시죠. (02단원)
//   Postgres 에서는 boolean 칸에 true 를 그대로 넣습니다. 훨씬 편합니다.
//
// ★ serial 은 옛날 방식입니다.
//     id serial primary key          ← 오래된 자료에 많이 나옵니다
//     id bigint generated always as identity primary key   ← 지금 권장
//   둘 다 동작하지만 새로 만들 때는 identity 를 쓰세요. 표준 문법입니다.

// ============================================================
// 2. ★★★ 대소문자 — 여기서 제일 많이 막힙니다
// ============================================================
//
// Postgres 는 따옴표 없이 쓴 이름을 **전부 소문자로 바꿉니다.**
//
//   create table Products (userName text);
//     → 실제로는 products 표에 username 칸이 만들어집니다
//
//   select userName from Products;   → 됩니다 (둘 다 소문자로 바뀌니까)
//   select "userName" from products; → ✗ column "userName" does not exist
//
// ★★ 따옴표를 쓰면 대소문자가 그대로 남습니다. 그러면 **항상** 따옴표를 써야 합니다.
//
//   create table "Products" ("userName" text);
//   select username from Products;      → ✗ 표를 못 찾습니다
//   select "userName" from "Products";  → ○ 매번 이렇게 써야 합니다
//
// ★★★ 규칙: **전부 소문자에 밑줄** 로 지으세요.
//
//   ✗  userName, createdAt, Products
//   ○  user_name, created_at, products
//
//   이걸 snake_case 라고 합니다. Postgres 세계의 관례입니다.
//
// ★ 그럼 자바스크립트 쪽은요?
//   자바스크립트는 camelCase 가 관례라 어긋납니다.
//   보통 이렇게 합니다.
//
//     DB       created_at
//     JS       row.created_at 을 그대로 쓰거나, 꺼낼 때 바꿉니다
//
//   저장소 계층에서 바꿔 주면 위층이 깔끔해집니다. (개념05 에서 합니다)

function 바꾸기(줄) {
  const 새것 = {};
  for (const [칸, 값] of Object.entries(줄)) {
    새것[칸.replace(/_([a-z])/g, (_, 글자) => 글자.toUpperCase())] = 값;
  }
  return 새것;
}

console.log(JSON.stringify(바꾸기({ id: 1, user_name: "김민준", created_at: "2026-08-18" })));
// 출력: {"id":1,"userName":"김민준","createdAt":"2026-08-18"}

// ★ 이런 변환을 저장소에서 한 번만 하면, 서비스·컨트롤러는 몰라도 됩니다.
//   02단원의 "저장소가 바깥의 모양을 지킨다" 와 같은 이야기입니다.

// ============================================================
// 2-2. 한글 칸 이름을 쓸 수 있나
// ============================================================
//
// 됩니다. **따옴표도 필요 없습니다.**
//
//   create table 상품 (이름 text);      → 됩니다
//   select 이름 from 상품;               → 됩니다
//
// ★ Postgres 는 따옴표 없는 이름을 전부 소문자로 바꿔서 봅니다.
//   한글에는 대소문자가 없어서 바뀔 게 없습니다. 그래서 그냥 통과합니다.
//
//   따옴표가 필요한 건 **영어 대문자**를 쓸 때입니다.
//
//     create table "userName" (...);    → 쓸 때마다 "userName" 이라고 따옴표를 쳐야 합니다
//     create table user_name (...);     → 따옴표 없이 편하게 씁니다
//
// ★ 그런데 권하지 않습니다.
//
//   · Supabase 화면·문서·에러 메시지가 전부 영어 기준입니다
//   · 라이브러리들이 한글 칸 이름에서 종종 문제를 냅니다
//   · 나중에 다른 사람이 볼 때 헷갈립니다
//
//   DB자료에서는 배우기 쉬우라고 한글을 썼습니다.
//   02단원은 상품 표만 영어입니다. 백엔드자료 07단원의 JSON 에 맞춘 것이고,
//   같은 단원의 리뷰·이력 표는 한글 그대로입니다.
//   Supabase 부터는 전부 영어 소문자로 갑니다. 이 단원의 예제도 영어입니다.

// ============================================================
// 3. GROUP BY 가 엄격합니다
// ============================================================
//
// DB자료 05단원 에서 예고한 것입니다. SQLite 로 다시 봅시다.

db.exec("CREATE TABLE 상품 (id INTEGER PRIMARY KEY, name TEXT, category TEXT) STRICT");
db.exec(`
  INSERT INTO 상품 (name, category) VALUES
    ('USB 허브','A'), ('27인치 모니터','A'), ('무선 마우스','B')
`);

const SQLite결과 = db.prepare(`
  SELECT category, name, COUNT(*) AS 개수 FROM 상품 GROUP BY category ORDER BY category
`).all();

console.log("SQLite:", JSON.stringify(SQLite결과.map((행) => `${행.category}:${행.name}(${행.개수})`)));
// 출력: SQLite: ["A:USB 허브(2)","B:무선 마우스(1)"]

// SQLite 는 통과시킵니다. A 분류 2개 중 아무거나 한 개의 이름을 줍니다.
//
// ★★ Postgres 에서는 오류입니다.
//
//   ERROR: column "상품.name" must appear in the GROUP BY clause
//          or be used in an aggregate function
//
//   SQLite 에서 잘 돌던 조회가 Supabase 로 옮기면 터집니다.
//   그래서 DB자료에서 "처음부터 쓰지 말라" 고 한 것입니다.
//
// ★ 고치는 법 세 가지
//
//   ① GROUP BY 에 넣는다        GROUP BY category, name  ← 묶음이 달라집니다. 조심.
//   ② 집계 함수를 씌운다        MIN(name), MAX(name)
//   ③ 모아서 본다               string_agg(name, ', ')
//                               ← SQLite 의 group_concat 에 해당합니다

// ============================================================
// 4. 함수 이름이 다른 것들
// ============================================================

const 함수차이 = [
  ["글자 잇기", "이름 || '호'", "이름 || '호'  (같음)"],
  ["여러 개 모으기", "group_concat(name, ', ')", "string_agg(name, ', ')"],
  ["NULL 대신 쓰기", "COALESCE(a, 0)", "COALESCE(a, 0)  (같음)"],
  ["지금 시각", "datetime('now','localtime')", "now()"],
  ["날짜만", "date(시각)", "시각::date"],
  ["대소문자 무시 검색", "LIKE (영문만 무시)", "ILIKE  ← 전용 연산자가 있습니다"],
  ["글자 길이", "length(s)", "length(s)  (같음)"],
  ["형 바꾸기", "CAST(a AS TEXT)", "a::text  ← 짧게 쓸 수 있습니다"],
  ["랜덤", "random()", "random()  (범위가 다릅니다)"],
];

for (const [항목, sqlite, pg] of 함수차이) {
  console.log(`${항목} | ${sqlite} | ${pg}`);
}
// 출력: 글자 잇기 | 이름 || '호' | 이름 || '호'  (같음)
// 출력: 여러 개 모으기 | group_concat(name, ', ') | string_agg(name, ', ')
// 출력: NULL 대신 쓰기 | COALESCE(a, 0) | COALESCE(a, 0)  (같음)
// 출력: 지금 시각 | datetime('now','localtime') | now()
// 출력: 날짜만 | date(시각) | 시각::date
// 출력: 대소문자 무시 검색 | LIKE (영문만 무시) | ILIKE  ← 전용 연산자가 있습니다
// 출력: 글자 길이 | length(s) | length(s)  (같음)
// 출력: 형 바꾸기 | CAST(a AS TEXT) | a::text  ← 짧게 쓸 수 있습니다
// 출력: 랜덤 | random() | random()  (범위가 다릅니다)

// ★★ LIKE 의 뜻이 다릅니다. 이건 꼭 기억하세요.
//
//   SQLite  LIKE 는 영문 대소문자를 **안 가립니다** (DB자료 03단원)
//   Postgres LIKE 는 대소문자를 **가립니다**. 안 가리려면 ILIKE 를 쓰세요.
//
//   SQLite 에서 name LIKE 'USB' 로 'usb' 가 찾아졌는데
//   Postgres 에서는 0건이 됩니다. 검색이 갑자기 안 되는 원인입니다.

// ============================================================
// 5. ★★ NULL 의 정렬 순서가 반대입니다
// ============================================================

db.exec("CREATE TABLE 가격 (id INTEGER PRIMARY KEY, 값 INTEGER) STRICT");
db.exec("INSERT INTO 가격 (id, 값) VALUES (1, 23900), (2, NULL), (3, 189000)");

console.log("SQLite ASC :", JSON.stringify(
  db.prepare("SELECT id FROM 가격 ORDER BY 값").all().map((행) => 행.id)
));
// 출력: SQLite ASC : [2,1,3]
console.log("SQLite DESC:", JSON.stringify(
  db.prepare("SELECT id FROM 가격 ORDER BY 값 DESC").all().map((행) => 행.id)
));
// 출력: SQLite DESC: [3,1,2]

// SQLite 는 NULL 을 **가장 작은 값**으로 봅니다. ASC 에서 맨 앞입니다.
//
// ★★ Postgres 는 NULL 을 **가장 큰 값**으로 봅니다. ASC 에서 맨 뒤입니다.
//
//   SQLite   ASC  → [NULL, 23900, 189000]
//   Postgres ASC  → [23900, 189000, NULL]
//
//   목록 첫 줄이 달라집니다. "왜 순서가 바뀌었지?" 의 원인입니다.
//
// ★ 어느 쪽에서도 같게 하려면 직접 지정하세요.
//
//     ORDER BY 가격 ASC NULLS LAST
//     ORDER BY 가격 DESC NULLS LAST
//
//   Supabase 클라이언트에서는 이렇게 씁니다.
//
//     .order("price", { ascending: false, nullsFirst: false })
//
//   ★ SQLite 도 3.30 부터 NULLS LAST 를 지원합니다. 양쪽 다 됩니다.

console.log("SQLite NULLS LAST:", JSON.stringify(
  db.prepare("SELECT id FROM 가격 ORDER BY 값 ASC NULLS LAST").all().map((행) => 행.id)
));
// 출력: SQLite NULLS LAST: [1,3,2]

// ============================================================
// 6. Postgres 에만 있는 좋은 것들
// ============================================================
//
// ── ① 진짜 날짜·시각 타입 ──
//
//   SQLite   TEXT 에 '2026-08-18 15:00:00' 을 넣었습니다
//            문자열이라 비교는 되지만 계산이 어렵습니다
//
//   Postgres timestamptz 는 시간대까지 압니다
//            created_at + interval '7 days'
//            age(now(), created_at)
//            date_trunc('month', created_at)   ← 월별 집계에 아주 유용
//
//   ★ timestamptz 를 쓰세요. timestamp (tz 없음) 는 쓰지 마세요.
//     시간대 정보가 없으면 서버 위치가 바뀔 때 값이 어긋납니다.
//
// ── ② JSON 을 칸에 넣을 수 있습니다 ──
//
//   options jsonb
//
//   select * from products where options->>'브랜드' = '한화';
//   create index on products using gin (options);
//
//   ★ 편하지만 남용하지 마세요.
//     "칸을 정하기 귀찮아서" jsonb 에 다 넣으면
//     NOT NULL·CHECK·외래키를 하나도 못 겁니다. DB 를 쓰는 값어치가 없어집니다.
//     정말 모양이 제각각인 것만 jsonb 에 넣으세요.
//
// ── ③ 배열 타입 ──
//
//   tags text[]
//   insert into posts (tags) values (array['상품','리뷰']);
//   select * from posts where '상품' = any(tags);
//
//   ★ 이것도 남용 금지입니다. 태그가 그 자체로 관리 대상이면
//     DB자료에서 배운 연결 표(N:M) 가 맞습니다.
//
// ── ④ 진짜 여러 명이 동시에 씁니다 ──
//
//   SQLite   쓰는 사람은 한 번에 한 명 (DB자료 07단원)
//   Postgres 여러 명이 동시에 씁니다. database is locked 가 없습니다
//
//   대신 다른 걸 만납니다 — 교착(deadlock) 과 잠금 대기.
//   기본은 같습니다. 트랜잭션을 짧게 유지하세요.
//
// ── ⑤ 함수와 트리거 ──
//
//   DB 안에 함수를 만들어 둘 수 있습니다.
//   Supabase 에서는 rpc 로 부릅니다. (개념03)

// ============================================================
// 7. 옮길 때 확인할 목록
// ============================================================

const 확인목록 = [
  "칸·표 이름이 전부 소문자+밑줄인가",
  "GROUP BY 에 안 넣은 칸을 SELECT 에 적지 않았는가",
  "LIKE 를 대소문자 무시로 쓰고 있었다면 ILIKE 로 바꿨는가",
  "NULL 정렬을 NULLS LAST 로 명시했는가",
  "group_concat 을 string_agg 로 바꿨는가",
  "datetime('now') 를 now() 로 바꿨는가",
  "참거짓을 1/0 대신 boolean 으로 바꿨는가",
  "AUTOINCREMENT 를 identity 로 바꿨는가",
  "N+1 이 없는가 (네트워크 왕복이 생깁니다)",
];

확인목록.forEach((줄, 자리) => console.log(`${자리 + 1}. ${줄}`));
// 출력: 1. 칸·표 이름이 전부 소문자+밑줄인가
// 출력: 2. GROUP BY 에 안 넣은 칸을 SELECT 에 적지 않았는가
// 출력: 3. LIKE 를 대소문자 무시로 쓰고 있었다면 ILIKE 로 바꿨는가
// 출력: 4. NULL 정렬을 NULLS LAST 로 명시했는가
// 출력: 5. group_concat 을 string_agg 로 바꿨는가
// 출력: 6. datetime('now') 를 now() 로 바꿨는가
// 출력: 7. 참거짓을 1/0 대신 boolean 으로 바꿨는가
// 출력: 8. AUTOINCREMENT 를 identity 로 바꿨는가
// 출력: 9. N+1 이 없는가 (네트워크 왕복이 생깁니다)

// ★ 마지막 항목이 제일 아픕니다.
//   나머지는 오류가 나서 바로 알지만, N+1 은 그냥 느려질 뿐입니다.

// ============================================================
// 8. 직접 해 볼 것 — Supabase SQL Editor 에서
// ============================================================
//
// ★ 이 아래는 코드로 확인할 수 없습니다. 프로젝트를 만들었으면 쳐 보세요.
//
// ── ① 표 만들기 ──
//
//   create table products (
//     id     bigint generated always as identity primary key,
//     name   text   not null unique,
//     category   text   not null check (category in ('A','B','C')),
//     status text   not null default '품절'
//                   check (status in ('판매중','품절','검토중')),
//     price integer,
//     created_at  timestamptz not null default now()
//   );
//
//   insert into products (name, category, status, price) values
//     ('USB 허브','A','판매중',23900),
//     ('27인치 모니터','A','품절',189000),
//     ('무선 마우스','B','판매중',null);
//
// ── ② GROUP BY 가 정말 막는지 ──
//
//   select category, name, count(*) from products group by category;
//   → ERROR 가 나야 정상입니다. 나오면 아래처럼 고쳐 보세요.
//
//   select category, string_agg(name, ', ') as names, count(*) as 개수
//   from products group by category order by category;
//
// ── ③ NULL 정렬 ──
//
//   select id, price from products order by price;
//   → NULL 이 **맨 뒤**에 나오는지 확인하세요. SQLite 와 반대입니다.
//
// ── ④ LIKE 와 ILIKE ──
//
//   insert into products (name, category) values ('Usb Cable','C');
//   select name from products where name like 'USB CABLE';   -- 0건
//   select name from products where name ilike 'USB CABLE';  -- 1건
//
// ── ⑤ 색인 만들고 계획 보기 ──
//
//   create index on products (category);
//   explain analyze select * from products where category = 'A';
//
//   ★ SQLite 의 EXPLAIN QUERY PLAN 에 해당합니다.
//     Seq Scan 이 나오면 다 훑는 것, Index Scan 이면 색인을 쓴 것입니다.
//     analyze 를 붙이면 실제로 실행해서 걸린 시간까지 보여 줍니다.
//     ★ analyze 는 정말 실행합니다. UPDATE·DELETE 에 붙이지 마세요.

db.close();

// ============================================================
// 정리
// ============================================================
//
//   SQL 의 대부분은 그대로입니다. 다른 것만 외우세요.
//
//   이름      전부 소문자+밑줄. 따옴표를 쓰면 계속 써야 합니다.
//   타입      STRICT 불필요, boolean·timestamptz·jsonb·배열이 있습니다
//   자동번호  generated always as identity
//   GROUP BY  묶은 칸만 SELECT 에 적을 수 있습니다 (엄격)
//   LIKE      대소문자를 가립니다. 무시하려면 ILIKE
//   NULL 정렬  Postgres 는 큰 값 취급 (SQLite 와 반대) → NULLS LAST 로 명시
//   함수      group_concat→string_agg, datetime('now')→now(), CAST→::타입
//
//   그리고 네트워크 왕복이 생깁니다. N+1 을 다시 확인하세요.
//
// 다음(개념03) 에서 자바스크립트 클라이언트로 이 표를 다룹니다.
