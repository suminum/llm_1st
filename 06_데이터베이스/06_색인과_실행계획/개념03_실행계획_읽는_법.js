// ============================================================
// 06단원 · 개념 03 — 실행계획 읽는 법
// ------------------------------------------------------------
// 실행: node 개념03_실행계획_읽는_법.js
//
// ★ 이 파일은 30초쯤 걸립니다.
// ============================================================
//
// 개념02 에서 색인을 걸고 빨라진 것을 확인했습니다.
// 그런데 색인을 걸어도 안 빨라지는 날이 옵니다. 반드시 옵니다.
//
// 그때 필요한 것이 **실행계획을 읽는 눈**입니다.
// 이 파일에서 다섯 가지를 합니다.
//
//   ① EXPLAIN 과 EXPLAIN ANALYZE 의 차이 — 그리고 위험한 점
//   ② 출력 한 줄을 토막 내서 전부 해석하기
//   ③ ★★ 추정과 실제가 어긋나는 것 — 문제의 신호
//   ④ 스캔 네 종류를 직접 만들어 보기
//   ⑤ 조인 세 종류와, 데이터가 커지면 계획이 바뀌는 것
//
// ★ 계획을 읽는 순서를 먼저 알려 드립니다.
//   **안쪽부터, 들여쓰기가 깊은 것부터 읽습니다.**
//   맨 위 줄이 마지막에 일어나는 일입니다. 거꾸로 읽으세요.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

async function 계획(sql, 옵션 = "") {
  const 결과 = await db.query(`EXPLAIN ${옵션} ${sql}`);
  return 결과.rows.map((줄) => 줄["QUERY PLAN"]).join("\n");
}

// 계획에서 스캔·조인 노드 이름만 뽑습니다. 무엇을 골랐는지 한눈에 보려고요.
function 노드들(계획글) {
  return 계획글
    .split("\n")
    .map((줄) => 줄.match(/^\s*(?:->\s+)?([A-Z][A-Za-z ]+?)(?:\s+(?:on|using)\s|\s+\(cost)/))
    .filter(Boolean)
    .map((맞음) => 맞음[1].trim())
    .join(" / ");
}


// ── 섹션 0: 데이터 ──

await db.exec(`
  CREATE TABLE 설비 (
    id       SERIAL PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인     TEXT NOT NULL,
    상태     TEXT NOT NULL
  );
  INSERT INTO 설비 (이름, 라인, 상태)
  SELECT '설비' || i, (ARRAY['A','B','C','D'])[(i % 4) + 1], (ARRAY['가동','정지','점검'])[(i % 3) + 1]
  FROM generate_series(1, 20000) AS i;

  CREATE TABLE 점검기록 (
    id       SERIAL PRIMARY KEY,
    설비번호 INT NOT NULL,
    상태     TEXT NOT NULL,
    점검자   TEXT NOT NULL,
    점검일   DATE NOT NULL,
    비고     TEXT
  );
  INSERT INTO 점검기록 (설비번호, 상태, 점검자, 점검일, 비고)
  SELECT (i % 20000) + 1,
         (ARRAY['정상','주의','고장'])[(i % 3) + 1],
         '점검원' || ((i % 50) + 1),
         DATE '2024-01-01' + ((i % 365) || ' days')::interval,
         '특이사항 없음. 기록번호 ' || i
  FROM generate_series(1, 200000) AS i;

  CREATE INDEX 점검_설비번호 ON 점검기록 (설비번호);
  ANALYZE;
`);


// ── 섹션 1: EXPLAIN 과 EXPLAIN ANALYZE ──

// EXPLAIN         — 계획만 세워서 보여 줍니다. **실행하지 않습니다.**
// EXPLAIN ANALYZE — **진짜로 실행합니다.** 그리고 실제 값까지 붙여 줍니다.

console.log(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 777"));
// 출력?: Bitmap Heap Scan on "점검기록"  (cost=4.37..42.63 rows=10 width=70)
// 출력?:   Recheck Cond: ("설비번호" = 777)
// 출력?:   ->  Bitmap Index Scan on "점검_설비번호"  (cost=0.00..4.37 rows=10 width=0)
// 출력?:         Index Cond: ("설비번호" = 777)

console.log(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 777", "(ANALYZE)"));
// 출력?: Bitmap Heap Scan on "점검기록"  (cost=4.37..42.63 rows=10 width=70) (actual time=0.121..0.161 rows=10.00 loops=1)
// 출력?:   Recheck Cond: ("설비번호" = 777)
// 출력?:   Heap Blocks: exact=10
// 출력?:   Buffers: shared hit=10 read=2
// 출력?:   ->  Bitmap Index Scan on "점검_설비번호"  (cost=0.00..4.37 rows=10 width=0) (actual time=0.067..0.067 rows=10.00 loops=1)
// 출력?:         Index Cond: ("설비번호" = 777)
// 출력?:         Index Searches: 1
// 출력?:         Buffers: shared read=2
// 출력?: Planning Time: 0.061 ms
// 출력?: Execution Time: 0.295 ms

// ★★★ **ANALYZE 는 진짜로 실행합니다.**
//
//   SELECT 면 상관없습니다. 그런데 UPDATE 나 DELETE 에 붙이면
//   **진짜로 고치고 진짜로 지웁니다.** 계획만 보려던 건데 데이터가 바뀝니다.
//
//   실제로 운영 데이터베이스에서 이걸로 사고가 납니다.
//   "계획만 보려고 했는데요" 는 변명이 안 됩니다.
//
// ★ 안전하게 보는 법: **트랜잭션으로 감싸고 되돌립니다.**

const 지우기전건수 = (await db.query("SELECT count(*) AS 수 FROM 점검기록")).rows[0].수;

await db.exec("BEGIN");
const 지우기계획 = await 계획("DELETE FROM 점검기록 WHERE 상태 = '정상'", "(ANALYZE)");
const 되돌리기전건수 = (await db.query("SELECT count(*) AS 수 FROM 점검기록")).rows[0].수;
await db.exec("ROLLBACK");

const 되돌린뒤건수 = (await db.query("SELECT count(*) AS 수 FROM 점검기록")).rows[0].수;

console.log(`ROLLBACK 전: ${되돌리기전건수} 건 / 원래: ${지우기전건수} 건`);
// 출력: ROLLBACK 전: 133334 건 / 원래: 200000 건

console.log("EXPLAIN ANALYZE 만으로도 진짜 지워졌나:", 되돌리기전건수 < 지우기전건수);
// 출력: EXPLAIN ANALYZE 만으로도 진짜 지워졌나: true

console.log("ROLLBACK 으로 되살아났나:", 되돌린뒤건수 === 지우기전건수);
// 출력: ROLLBACK 으로 되살아났나: true

console.log("계획에 Delete 노드가 있나:", 지우기계획.includes("Delete on"));
// 출력: 계획에 Delete 노드가 있나: true

// ★★ 6만 6천 건이 진짜로 지워졌습니다. ROLLBACK 을 안 했으면 그대로 날아갔습니다.
//   **UPDATE / DELETE / INSERT 에 EXPLAIN ANALYZE 를 쓸 때는 반드시**
//
//     BEGIN;
//     EXPLAIN (ANALYZE) DELETE ...;
//     ROLLBACK;
//
//   순서로 하세요. 예외 없습니다.


// ── 섹션 2: ★ 출력 한 줄을 토막 내기 ──

// 이 한 줄에 여섯 가지 정보가 들어 있습니다.
//
//   Bitmap Heap Scan on "점검기록"  (cost=4.37..42.65 rows=10 width=72)
//                                   (actual time=0.088..0.110 rows=10.00 loops=1)
//   └──────── ① ────────┘           └── ② ──┘ └─ ③ ─┘ └─ ④ ─┘
//                                   └────────── ⑤ ──────────┘ └── ⑥ ──┘
//
//   ① 노드 이름 + 대상 — 무엇을 어떻게 읽나
//
//   ② cost=4.37..42.65
//        플래너의 **비용 점수**. 밀리초가 아닙니다.
//        4.37  = 첫 줄이 나오기까지 드는 비용 (시작 비용)
//        42.65 = 마지막 줄까지 드는 비용 (총 비용)
//        ★ 기준은 "쪽 하나를 순서대로 읽는 비용 = 1.0" 입니다.
//        ★ LIMIT 이 붙으면 시작 비용이 중요해집니다. 빨리 첫 줄을 내는 계획이 이깁니다.
//
//   ③ rows=10
//        **추정** 결과 줄 수. 통계에서 계산한 짐작입니다.
//
//   ④ width=72
//        한 줄의 평균 바이트. 가져오는 칸만 셉니다.
//        SELECT * 대신 필요한 칸만 고르면 이 값이 줄어듭니다.
//
//   ⑤ actual time=0.088..0.110 rows=10.00
//        **실제** 값. 첫 줄까지 0.088ms, 끝까지 0.110ms, 실제로 10줄.
//        ★ ANALYZE 를 붙였을 때만 나옵니다.
//
//   ⑥ loops=1
//        이 노드가 **몇 번 실행됐나.** 1이면 한 번입니다.
//        ★★ 조인 안쪽에 들어가면 이 값이 커집니다. 아래에서 봅니다.
//        ★★ 그리고 `actual time` 은 **한 번 실행할 때의 평균**입니다.
//           총 시간을 알려면 actual time × loops 를 해야 합니다. 여기서 많이 착각합니다.

// loops 가 1이 아닌 계획을 만들어 봅니다.

const 반복계획 = await 계획(
  `SELECT s.이름, p.상태
   FROM 설비 s JOIN 점검기록 p ON p.설비번호 = s.id
   WHERE s.id BETWEEN 1 AND 50`,
  "(ANALYZE)",
);

console.log(반복계획.split("\n").filter((줄) => 줄.includes("loops=")).join("\n"));
// 출력?: Nested Loop  (cost=0.58..2032.45 rows=500 width=18) (actual time=0.123..1.633 rows=500.00 loops=1)
// 출력?:   ->  Index Scan using "설비_pkey" on "설비" s  (cost=0.29..9.29 rows=50 width=15) (actual time=0.094..0.116 rows=50.00 loops=1)
// 출력?:   ->  Index Scan using "점검_설비번호" on "점검기록" p  (cost=0.29..40.36 rows=10 width=11) (actual time=0.002..0.023 rows=10.00 loops=50)

// ★★ 마지막 줄의 `loops=50` 을 보세요.
//   안쪽 색인 스캔이 **50번** 돌았습니다. 바깥에서 설비 50대가 나왔으니까요.
//   `actual time=0.008..0.011` 은 **한 번당** 값입니다.
//   총 시간은 0.011 × 50 = 0.55ms 쯤입니다.
//
//   ★ 느린 질의를 볼 때 `loops` 가 큰 노드를 먼저 의심하세요.
//     한 번은 0.01ms 라도 10000번이면 100ms 입니다.


// ── 섹션 3: ★★ 추정과 실제가 어긋나면 그게 신호입니다 ──

// 플래너는 통계로 짐작합니다. 짐작이 틀리면 계획도 틀립니다.
// 짐작이 얼마나 틀렸는지는 `rows=` 와 `actual ... rows=` 를 비교하면 보입니다.
//
// 일부러 어긋나게 만들어 봅니다.
// 라인이 100개 있고, 라인마다 **라인장이 딱 한 명씩** 있는 표입니다.
// 사람 눈에는 "라인을 알면 라인장도 안다" 가 뻔한데, 플래너는 그걸 모릅니다.

await db.exec(`
  CREATE TABLE 라인별기록 (id SERIAL PRIMARY KEY, 라인 TEXT NOT NULL, 라인장 TEXT NOT NULL);
  INSERT INTO 라인별기록 (라인, 라인장)
  SELECT 'L' || lpad(((i % 100) + 1)::text, 3, '0'),
         '반장' || lpad(((i % 100) + 1)::text, 3, '0')
  FROM generate_series(1, 100000) AS i;
  ANALYZE 라인별기록;
`);

// 라인 L007 은 항상 반장007 입니다. 둘 다 걸어도 결과는 하나도 안 줄어듭니다.
const 어긋난계획 = await 계획(
  "SELECT count(*) FROM 라인별기록 WHERE 라인 = 'L007' AND 라인장 = '반장007'",
  "(ANALYZE)",
);
const 스캔줄 = 어긋난계획.split("\n").find((줄) => 줄.includes("Seq Scan"));

console.log(스캔줄.trim());
// 출력?: ->  Seq Scan on "라인별기록"  (cost=0.00..2137.00 rows=10 width=0) (actual time=0.016..13.053 rows=1000.00 loops=1)

const 추정줄수 = Number(스캔줄.match(/rows=(\d+) width/)[1]);
const 실제줄수 = Number(스캔줄.match(/actual time=[\d.]+\.\.[\d.]+ rows=([\d.]+)/)[1]);

console.log(`추정 ${추정줄수} 줄 / 실제 ${실제줄수} 줄 → ${Math.round(실제줄수 / 추정줄수)}배 어긋남`);
// 출력?: 추정 10 줄 / 실제 1000 줄 → 100배 어긋남

console.log("50배 이상 어긋났나:", 실제줄수 / 추정줄수 > 50);
// 출력: 50배 이상 어긋났나: true

// ★★★ 왜 이렇게 어긋나나.
//
//   플래너는 각 칸을 **따로따로** 봅니다. 그리고 곱합니다.
//     라인 = 'L007'      → 100분의 1
//     라인장 = '반장007'  → 100분의 1
//     둘 다니까 → 100000 × (1/100) × (1/100) = **10 줄**
//
//   실제로는 라인이 L007 이면 라인장은 무조건 반장007 입니다. 하나도 안 줄어듭니다.
//   그래서 1000 줄이 나옵니다.
//
//   플래너가 왜 모르나: **칸들이 서로 독립이라고 가정**하기 때문입니다.
//   현실의 표에는 이런 짝(우편번호-시, 모델명-제조사, 라인-공장)이 아주 많습니다.
//
// ★★ 이게 왜 큰 문제인가:
//   "10줄쯤 나오겠지" 하고 세운 계획이 실제로는 1000줄을 다룹니다.
//   조인 안쪽에 들어가면 10번 예상이 1000번 반복으로 바뀝니다.
//
//   ★ **느린 질의를 볼 때 가장 먼저 볼 것이 이 어긋남입니다.**
//     rows 와 actual rows 가 크게 벌어진 노드를 찾으세요. 거기가 범인입니다.
//
// ★ 고치는 법 (PostgreSQL 10 이상)
//     CREATE STATISTICS 이름 (dependencies) ON 라인, 라인장 FROM 라인별기록;
//     ANALYZE 라인별기록;
//   "이 두 칸은 관계가 있다" 고 알려 주는 것입니다. 실제로 해 봅니다.

await db.exec("CREATE STATISTICS 라인_라인장 (dependencies) ON 라인, 라인장 FROM 라인별기록");
await db.exec("ANALYZE 라인별기록");

const 고친계획 = await 계획(
  "SELECT count(*) FROM 라인별기록 WHERE 라인 = 'L007' AND 라인장 = '반장007'",
  "(ANALYZE)",
);
const 고친줄 = 고친계획.split("\n").find((줄) => 줄.includes("Seq Scan"));
const 고친추정 = Number(고친줄.match(/rows=(\d+) width/)[1]);

console.log(`확장 통계를 준 뒤 추정: ${고친추정} 줄 (실제 ${실제줄수} 줄)`);
// 출력?: 확장 통계를 준 뒤 추정: 1030 줄 (실제 1000 줄)

console.log("추정이 실제에 훨씬 가까워졌나:", Math.abs(고친추정 - 실제줄수) < Math.abs(추정줄수 - 실제줄수));
// 출력: 추정이 실제에 훨씬 가까워졌나: true


// ── 섹션 4: 스캔 네 종류를 직접 만들어 봅니다 ──

// ① Seq Scan — 색인이 없거나, 있어도 대부분을 읽을 때

console.log("① 색인 없는 칸:", 노드들(await 계획("SELECT * FROM 점검기록 WHERE 점검자 = '점검원7'")));
// 출력: ① 색인 없는 칸: Seq Scan

// ② Index Scan — 색인으로 콕 집고, 나오는 줄이 아주 적을 때
//    ★ 기본키처럼 **유일한** 값을 찾으면 거의 항상 이겁니다.

console.log("② 기본키로 한 건:", 노드들(await 계획("SELECT * FROM 점검기록 WHERE id = 12345")));
// 출력: ② 기본키로 한 건: Index Scan

// ③ Bitmap Heap Scan — 색인으로 찾을 줄이 좀 많을 때
//    ★ 어떻게 도나:
//      1) 색인을 훑어서 "표의 몇 쪽 몇 번째" 목록을 **비트맵**으로 모읍니다
//      2) 그 비트맵을 **쪽 번호 순서로 정렬**합니다
//      3) 표를 쪽 번호 순서대로 한 번에 읽습니다
//    → 왔다 갔다 하지 않고 순서대로 읽으니 디스크에 훨씬 친절합니다.

console.log("③ 색인으로 열 줄:", 노드들(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 777")));
// 출력: ③ 색인으로 열 줄: Bitmap Heap Scan / Bitmap Index Scan

console.log("④ 색인으로 삼천 줄:", 노드들(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 BETWEEN 1 AND 300")));
// 출력: ④ 색인으로 삼천 줄: Bitmap Heap Scan / Bitmap Index Scan

// ★ `Recheck Cond` 가 왜 있나
//   비트맵이 너무 커지면 PostgreSQL 은 "줄 단위" 대신 "쪽 단위" 로 기억합니다(lossy).
//   그러면 그 쪽 안의 어느 줄인지 모르니 다시 조건을 확인해야 합니다. 그게 Recheck 입니다.


// ── 섹션 5: ★ Index Only Scan — 표를 아예 안 봅니다 ──

// 지금까지의 색인 스캔은 전부 두 단계였습니다.
//
//   ① 색인에서 "표의 몇 쪽 몇 번째 줄" 을 찾는다
//   ② **표로 가서 그 줄을 읽는다**   ← 이게 비쌉니다
//
// ②를 안 해도 되는 경우가 있습니다. **필요한 칸이 전부 색인 안에 있을 때** 입니다.
// 그런 색인을 **커버링 색인(covering index)** 이라고 합니다.

await db.exec("CREATE INDEX 점검_커버 ON 점검기록 (설비번호) INCLUDE (상태, 점검일)");
await db.exec("DROP INDEX 점검_설비번호");
await db.exec("ANALYZE 점검기록");

const 진공전 = await 계획("SELECT 설비번호, 상태 FROM 점검기록 WHERE 설비번호 = 777", "(ANALYZE)");

console.log("VACUUM 전:", 노드들(진공전));
// 출력: VACUUM 전: Bitmap Heap Scan / Bitmap Index Scan

// ★★ 커버링 색인을 만들었는데도 Index Only Scan 이 안 나왔습니다. 왜일까요?
//
//   색인에는 **그 줄이 지금 보여도 되는 줄인지** 가 안 적혀 있습니다.
//   (누가 지웠는데 아직 정리가 안 된 줄일 수 있습니다 — 07단원에서 다룹니다)
//   그래서 PostgreSQL 은 **가시성 지도(visibility map)** 라는 걸 따로 봅니다.
//   그 지도는 VACUUM 이 채웁니다. VACUUM 을 한 번도 안 했으면 지도가 비어 있습니다.

await db.exec("VACUUM ANALYZE 점검기록");

const 진공후 = await 계획("SELECT 설비번호, 상태 FROM 점검기록 WHERE 설비번호 = 777", "(ANALYZE)");

console.log("VACUUM 후:", 노드들(진공후));
// 출력: VACUUM 후: Index Only Scan

console.log(진공후.split("\n").slice(0, 5).join("\n"));
// 출력?: Index Only Scan using "점검_커버" on "점검기록"  (cost=0.42..4.59 rows=10 width=11) (actual time=0.114..0.119 rows=10.00 loops=1)
// 출력?:   Index Cond: ("설비번호" = 777)
// 출력?:   Heap Fetches: 0
// 출력?:   Index Searches: 1
// 출력?:   Buffers: shared hit=4

const 쪽수뽑기 = (계획글) => Number(계획글.match(/Buffers: shared hit=(\d+)/)[1]);

console.log(`읽은 쪽 — 표까지 보는 경우 ${쪽수뽑기(진공전)} / 색인만 보는 경우 ${쪽수뽑기(진공후)}`);
// 출력?: 읽은 쪽 — 표까지 보는 경우 10 / 색인만 보는 경우 4

console.log("색인만 보는 쪽이 더 적은 쪽을 읽나:", 쪽수뽑기(진공후) < 쪽수뽑기(진공전));
// 출력: 색인만 보는 쪽이 더 적은 쪽을 읽나: true

console.log("Heap Fetches 가 0 인가:", 진공후.includes("Heap Fetches: 0"));
// 출력: Heap Fetches 가 0 인가: true

// ★★ `Heap Fetches: 0` — **표를 한 번도 안 봤습니다.**
//
//   커버링 색인 만드는 법 두 가지:
//
//     CREATE INDEX ... ON 점검기록 (설비번호, 상태);         -- 둘 다 찾기에도 쓸 수 있음
//     CREATE INDEX ... ON 점검기록 (설비번호) INCLUDE (상태); -- 상태는 '들고만 있음'
//
//   INCLUDE 쪽이 색인이 조금 더 작고, 정렬 순서에 영향을 안 줍니다.
//   찾는 조건에 안 쓰고 **결과로만 필요한 칸**은 INCLUDE 에 넣으세요.
//
// ★ 대가: 색인이 커집니다. 그리고 그 칸을 고칠 때마다 색인도 고쳐야 합니다.


// ── 섹션 6: 조인 세 종류 ──

// 두 표를 잇는 방법은 세 가지입니다. 플래너가 **크기를 보고** 고릅니다.
//
//   Nested Loop  — 바깥 표를 한 줄씩 돌면서, 안쪽 표를 그때그때 찾는다
//                  바깥이 작을 때 최고. 안쪽에 색인이 있어야 함
//
//   Hash Join    — 작은 쪽을 통째로 메모리에 해시표로 올려놓고,
//                  큰 쪽을 한 번 훑으면서 맞춰 본다. 둘 다 클 때 최고
//
//   Merge Join   — 양쪽을 정렬해 놓고 지퍼 채우듯 맞춰 나간다
//                  이미 정렬돼 있거나(색인) 결과가 정렬돼 있어야 할 때

await db.exec("CREATE INDEX 점검_설비번호2 ON 점검기록 (설비번호); ANALYZE;");

const 작은조인 = await 계획(
  "SELECT s.이름, p.상태 FROM 설비 s JOIN 점검기록 p ON p.설비번호 = s.id WHERE s.id BETWEEN 1 AND 20",
);

console.log("설비 20대만 조인:", 노드들(작은조인));
// 출력: 설비 20대만 조인: Nested Loop / Index Scan / Index Only Scan

const 큰조인 = await 계획("SELECT s.이름, p.상태 FROM 설비 s JOIN 점검기록 p ON p.설비번호 = s.id");

console.log("설비 전체를 조인:", 노드들(큰조인));
// 출력: 설비 전체를 조인: Hash Join / Seq Scan / Hash / Seq Scan

console.log("작을 때 Nested Loop 를 골랐나:", 작은조인.includes("Nested Loop"));
// 출력: 작을 때 Nested Loop 를 골랐나: true

console.log("클 때 Hash Join 으로 바뀌었나:", 큰조인.includes("Hash Join"));
// 출력: 클 때 Hash Join 으로 바뀌었나: true

// ★★ **같은 SQL 인데 조건 하나 바꾸니 조인 방식이 통째로 바뀌었습니다.**
//   플래너가 크기를 보고 스스로 정한 것입니다. 이게 정상입니다.
//
// Merge Join 도 보고 싶으면 다른 방식을 꺼서 억지로 만들 수 있습니다. (실습용입니다)

await db.exec("SET enable_hashjoin = off; SET enable_nestloop = off;");
const 병합조인 = await 계획("SELECT s.이름, p.상태 FROM 설비 s JOIN 점검기록 p ON p.설비번호 = s.id");
await db.exec("SET enable_hashjoin = on; SET enable_nestloop = on;");

console.log("억지로 만든 Merge Join:", 노드들(병합조인));
// 출력: 억지로 만든 Merge Join: Merge Join / Index Scan / Index Only Scan

// ★ 양쪽이 이미 색인으로 정렬돼 있으니 정렬 없이 바로 지퍼를 채웠습니다.
//   Merge Join 은 이럴 때 좋습니다. 정렬부터 해야 하면 보통 Hash Join 이 이깁니다.


// ── 섹션 7: BUFFERS — 실제로 몇 쪽을 읽었나 ──

// PostgreSQL 18 부터는 EXPLAIN ANALYZE 에 Buffers 가 자동으로 나옵니다.
// 옛날 버전에서는 `EXPLAIN (ANALYZE, BUFFERS)` 라고 써야 했습니다.
//
//   shared hit=N    메모리(캐시)에 이미 있어서 바로 쓴 쪽
//   shared read=N   디스크에서 새로 읽어 온 쪽    ← 이게 진짜 비용
//   shared dirtied  이번에 고쳐서 다시 써야 할 쪽
//
// ★★ **시간보다 이 숫자를 믿으세요.**
//   시간은 그때 서버가 바빴는지, 캐시가 따뜻했는지에 따라 흔들립니다.
//   읽은 쪽 수는 같은 데이터·같은 계획이면 어디서 돌려도 같습니다.

const 훑기버퍼 = 쪽수뽑기(await 계획("SELECT count(*) FROM 점검기록 WHERE 점검자 = '점검원7'", "(ANALYZE)"));
const 색인버퍼 = 쪽수뽑기(await 계획("SELECT count(*) FROM 점검기록 WHERE 설비번호 = 777", "(ANALYZE)"));

console.log(`점검자로 찾기(색인 없음) ${훑기버퍼} 쪽 / 설비번호로 찾기(색인 있음) ${색인버퍼} 쪽`);
// 출력?: 점검자로 찾기(색인 없음) 2568 쪽 / 설비번호로 찾기(색인 있음) 2 쪽

console.log("색인 쪽이 훨씬 적게 읽나:", 색인버퍼 * 100 < 훑기버퍼);
// 출력: 색인 쪽이 훨씬 적게 읽나: true


// ── 섹션 8: ★ 계획 읽는 순서 ──

const 복잡한계획 = await 계획(
  `SELECT s.라인, count(*) AS 건수
   FROM 설비 s JOIN 점검기록 p ON p.설비번호 = s.id
   WHERE p.상태 = '고장'
   GROUP BY s.라인
   ORDER BY 건수 DESC`,
);

console.log(복잡한계획);
// 출력?: Sort  (cost=6160.43..6160.44 rows=4 width=10)
// 출력?:   Sort Key: (count(*)) DESC
// 출력?:   ->  HashAggregate  (cost=6160.35..6160.39 rows=4 width=10)
// 출력?:         Group Key: s."라인"
// 출력?:         ->  Hash Join  (cost=588.00..5829.65 rows=66140 width=2)
// 출력?:               Hash Cond: (p."설비번호" = s.id)
// 출력?:               ->  Seq Scan on "점검기록" p  (cost=0.00..5068.00 rows=66140 width=4)
// 출력?:                     Filter: ("상태" = '고장'::text)
// 출력?:               ->  Hash  (cost=338.00..338.00 rows=20000 width=6)
// 출력?:                     ->  Seq Scan on "설비" s  (cost=0.00..338.00 rows=20000 width=6)

// ★★★ **읽는 순서는 아래에서 위로, 안쪽에서 바깥으로입니다.**
//
//   ⑤ Sort            ← 마지막. 건수 순으로 정렬
//   ④ HashAggregate   ← 라인별로 묶어서 센다
//   ③ Hash Join       ← 둘을 잇는다
//   ② Hash            ← 설비를 통째로 해시표로 올린다
//   ① Seq Scan (설비) ← **여기가 제일 먼저** 일어납니다
//   ① Seq Scan (점검기록) ← 그리고 여기
//
//   요령:
//     · `->` 가 붙은 줄은 "이걸 먼저 해서 위로 올려 준다" 는 뜻입니다
//     · 들여쓰기가 가장 깊은 줄부터 읽으세요
//     · 같은 깊이가 둘이면 **아래쪽이 먼저** 실행되는 경우가 많습니다
//       (Hash Join 은 아래의 Hash 를 먼저 만듭니다)
//
// ★ 그리고 항상 **가장 안쪽 스캔**부터 확인하세요.
//   맨 위의 Sort 가 느린 게 아니라, 맨 아래 Seq Scan 이 6만 줄을 퍼 올려서 느린 것입니다.


// ── 그 밖의 유용한 옵션 ──
//
//   EXPLAIN (ANALYZE, VERBOSE)   각 노드가 어떤 칸을 내보내는지 보여 줍니다
//   EXPLAIN (COSTS OFF)          cost 를 지웁니다. 계획 모양만 볼 때 깔끔합니다
//   EXPLAIN (FORMAT JSON)        도구로 파싱할 때 씁니다
//   EXPLAIN (ANALYZE, SETTINGS)  기본값과 다른 설정을 같이 보여 줍니다

console.log(await 계획("SELECT count(*) FROM 점검기록 WHERE 설비번호 = 777", "(COSTS OFF)"));
// 출력?: Aggregate
// 출력?:   ->  Index Only Scan using "점검_설비번호2" on "점검기록"
// 출력?:         Index Cond: ("설비번호" = 777)

// ★ 계획이 길어지면 https://explain.dank.systems 같은 시각화 도구에
//   FORMAT JSON 결과를 붙여 넣어 보세요. 어디가 오래 걸렸는지 색으로 보입니다.


// ── MySQL 은 여기가 다릅니다 ──
//
//   · `EXPLAIN` 출력이 표 모양입니다. `type`, `key`, `rows`, `Extra` 칸을 봅니다
//   · `EXPLAIN ANALYZE` 는 8.0.18 부터. 그 전에는 실제값을 못 봅니다
//   · `Using index` 가 PostgreSQL 의 Index Only Scan 에 해당합니다
//   · Hash Join 은 8.0.18 부터입니다. 그 전에는 전부 Nested Loop 였습니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 정리 — 계획을 읽는 법
// ============================================================
//
//   무엇을 볼 때                  어디를 보나
//   ──────────────────────────────────────────────────────────────
//   짐작이 맞았나                 rows 대 actual rows  ← 제일 먼저
//   몇 번 돌았나                  loops               ← 곱해서 봐야 함
//   진짜 비용                     Buffers 의 read/hit  ← 시간보다 믿을 만함
//   무슨 방법으로 읽었나           Seq / Index / Index Only / Bitmap
//   무슨 방법으로 이었나           Nested Loop / Hash / Merge
//
//   스캔 종류                    언제 나오나
//   ──────────────────────────────────────────────────────────────
//   Seq Scan                     색인이 없거나, 표의 대부분을 읽을 때
//   Index Scan                   색인으로 콕 집고 나오는 줄이 아주 적을 때
//   Bitmap Heap Scan             색인으로 찾는데 줄이 좀 많을 때
//   Index Only Scan              필요한 칸이 전부 색인 안에 있고, VACUUM 이 돼 있을 때
//
//   조인 종류                    언제 나오나
//   ──────────────────────────────────────────────────────────────
//   Nested Loop                  한쪽이 작고 다른 쪽에 색인이 있을 때
//   Hash Join                    둘 다 크고 등호로 이을 때
//   Merge Join                   양쪽이 이미 정렬돼 있을 때
//
// ★★★ EXPLAIN ANALYZE 는 **진짜로 실행합니다.**
//   UPDATE / DELETE 에는 반드시 BEGIN ... ROLLBACK 으로 감싸세요.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 조인 범위를 1~50 에서 1~5000 으로 넓혀 보세요.
//                    loops 가 5000 이 되나요, 아니면 조인 방식이 바뀌나요?
//
// ✏️ 직접 해보기 2 — 섹션 3 에서 CREATE STATISTICS 를 지우고 다시 돌려 보세요.
//                    추정치가 다시 어긋나나요?
//                    ★ `DROP STATISTICS 라인_라인장;` 뒤에 ANALYZE 를 꼭 하세요.
//
// ✏️ 직접 해보기 3 — 섹션 5 에서 `SELECT 설비번호, 상태, 점검자` 로 바꿔 보세요.
//                    점검자는 색인에 없습니다. Index Only Scan 이 유지되나요?
//
// ✏️ 직접 해보기 4 — `EXPLAIN (ANALYZE, VERBOSE)` 로 섹션 8 의 질의를 보세요.
//                    Output 줄에 무엇이 적혀 있나요?
//
// ✏️ 직접 해보기 5 — 섹션 6 에서 설비 표를 200건으로 줄이고 다시 보세요.
//                    Hash Join 이 Nested Loop 로 바뀌나요?
//
// ✏️ 직접 해보기 6 — BEGIN 없이 `EXPLAIN (ANALYZE) DELETE FROM 점검기록;` 을 돌려 보세요.
//                    ★ 진짜로 다 지워집니다. 이 파일 끝에서 해 보고 결과를 확인하세요.
//                    (겁내지 마세요. 메모리에만 있는 실습용 데이터입니다)


// ── 자주 하는 실수 ──

// [실수 1] EXPLAIN ANALYZE 를 운영 UPDATE 에 그냥 씀
//   섹션 1 에서 6만 건이 진짜로 지워졌습니다.
//   **BEGIN ... ROLLBACK 으로 감싸세요.** 이건 습관으로 만들어야 합니다.

// [실수 2] actual time 을 총 시간으로 읽음
//   `actual time=0.008..0.011 loops=50` 은 **한 번당** 0.011ms 입니다.
//   총 시간은 0.011 × 50 입니다. loops 를 안 곱하면 원인을 못 찾습니다.

// [실수 3] rows 추정치가 틀린 걸 그냥 넘어감
//   섹션 3 에서 100배 어긋났습니다. 이건 "계획이 틀린 전제로 세워졌다" 는 뜻입니다.
//   느린 질의를 볼 때 **가장 먼저** 확인해야 할 곳입니다.

// [실수 4] 커버링 색인을 만들었는데 Index Only Scan 이 안 나온다고 당황함
//   섹션 5 에서 봤습니다. **VACUUM 을 해야** 가시성 지도가 채워집니다.
//   그리고 `Heap Fetches` 가 0 이 아니면 반쪽짜리입니다.

// [실수 5] Nested Loop 를 무조건 나쁘게 봄
//   바깥이 20줄이면 Nested Loop 가 최고입니다.
//   문제는 바깥이 클 때입니다. loops 숫자를 보고 판단하세요.

// [실수 6] cost 만 보고 좋아졌다고 판단함
//   cost 는 플래너의 **짐작**입니다. 짐작이 틀렸을 수도 있습니다.
//   반드시 ANALYZE 를 붙여서 actual 값을 보세요.


await db.close();
