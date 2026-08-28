// ============================================================
// 06단원 · 개념 02 — 색인을 겁니다
// ------------------------------------------------------------
// 실행: node 개념02_색인을_겁니다.js
//
// ★ 이 파일은 60초쯤 걸립니다. 100만 건까지 진짜로 만들어서 잽니다.
// ============================================================
//
// 개념01 에서 봤습니다.
// 열 줄 찾자고 2642 쪽을 전부 읽었습니다.
//
// 이 파일에서는 **색인(index)** 을 겁니다. 그리고 네 가지를 잽니다.
//   ① 얼마나 빨라지는가 ② 왜 그렇게 빨라지는가(B-tree 깊이)
//   ③ 얼마나 느려지는가(넣고 고치는 쪽) ④ 자리를 얼마나 먹는가
//
// ★★ 색인은 공짜가 아닙니다. **읽기를 사고 쓰기를 파는 거래**입니다.
//   그래서 "일단 다 걸어 두자" 가 왜 나쁜지 이 파일에서 숫자로 확인합니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

async function 재기(횟수, 할일) {
  await 할일(0);                       // 예열

  const 잰것 = [];

  for (let 회차 = 0; 회차 < 횟수; 회차 += 1) {
    const 시작 = performance.now();
    await 할일(회차);
    잰것.push(performance.now() - 시작);
  }

  return 잰것.sort((가, 나) => 가 - 나)[Math.floor(횟수 / 2)];
}

async function 계획(sql, 옵션 = "") {
  const 결과 = await db.query(`EXPLAIN ${옵션} ${sql}`);
  return 결과.rows.map((줄) => 줄["QUERY PLAN"]).join("\n");
}

const 메가 = (바이트) => `${(Number(바이트) / 1024 / 1024).toFixed(2)} MB`;


// ── 섹션 1: 기준값을 먼저 잡습니다 ──

await db.exec(`
  CREATE TABLE 점검기록 (
    id        SERIAL PRIMARY KEY,
    설비번호  INT NOT NULL,
    라인      TEXT NOT NULL,
    상태      TEXT NOT NULL,
    점검자    TEXT NOT NULL,
    점검일    DATE NOT NULL,
    비고      TEXT
  );

  INSERT INTO 점검기록 (설비번호, 라인, 상태, 점검자, 점검일, 비고)
  SELECT
    (i % 20000) + 1,
    (ARRAY['A','B','C','D'])[(i % 4) + 1],
    (ARRAY['정상','주의','고장'])[(i % 3) + 1],
    '점검원' || ((i % 50) + 1),
    DATE '2024-01-01' + ((i % 365) || ' days')::interval,
    '특이사항 없음. 기록번호 ' || i
  FROM generate_series(1, 200000) AS i;
`);

await db.exec("ANALYZE 점검기록");

const 찾기 = () => db.query("SELECT * FROM 점검기록 WHERE 설비번호 = $1", [12345]);

const 색인전ms = await 재기(9, 찾기);

console.log(`색인 없이: ${색인전ms.toFixed(2)} ms`);
// 출력?: 색인 없이: 18.61 ms


// ── 섹션 2: CREATE INDEX ──

// 문법은 짧습니다.
//
//   CREATE INDEX 색인이름 ON 표이름 (칸이름);
//
// 이름은 마음대로 정합니다. 안 적으면 PostgreSQL 이 `표_칸_idx` 로 지어 줍니다.
// ★ 회사에서는 `idx_점검기록_설비번호` 처럼 규칙을 정해 둡니다. 나중에 지울 때 안 헷갈리려고요.

const 만들기시작 = performance.now();
await db.exec("CREATE INDEX 점검_설비번호 ON 점검기록 (설비번호)");
const 만드는데 = performance.now() - 만들기시작;

console.log(`20만 건에 색인 만드는 데: ${만드는데.toFixed(0)} ms`);
// 출력?: 20만 건에 색인 만드는 데: 85 ms

await db.exec("ANALYZE 점검기록");


// ── 섹션 3: ★★ 얼마나 빨라졌나 ──

const 색인후ms = await 재기(9, 찾기);

console.log(`색인 후: ${색인후ms.toFixed(2)} ms`);
// 출력?: 색인 후: 0.52 ms

console.log(`몇 배: ${(색인전ms / 색인후ms).toFixed(0)}배`);
// 출력?: 몇 배: 36배

// ★★ 값은 기계마다 다릅니다. 판정은 따로 찍습니다.

console.log("색인이 더 빠른가:", 색인후ms < 색인전ms);
// 출력: 색인이 더 빠른가: true

console.log("10배 이상 빨라졌나:", 색인전ms / 색인후ms > 10);
// 출력: 10배 이상 빨라졌나: true

// 계획도 바뀌었습니다.

const 색인후계획 = await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 12345", "(ANALYZE)");

console.log(색인후계획);
// 출력?: Bitmap Heap Scan on "점검기록"  (cost=4.37..42.65 rows=10 width=72) (actual time=0.083..0.149 rows=10.00 loops=1)
// 출력?:   Recheck Cond: ("설비번호" = 12345)
// 출력?:   Heap Blocks: exact=10
// 출력?:   Buffers: shared hit=12
// 출력?:   ->  Bitmap Index Scan on "점검_설비번호"  (cost=0.00..4.37 rows=10 width=0) (actual time=0.060..0.061 rows=10.00 loops=1)
// 출력?:         Index Cond: ("설비번호" = 12345)
// 출력?:         Index Searches: 1
// 출력?:         Buffers: shared hit=2
// 출력?: Planning Time: 0.182 ms
// 출력?: Execution Time: 0.425 ms

// ★★ `Buffers: shared hit=12` — **12 쪽**입니다.
//   색인 없을 때는 2642 쪽이었습니다. 220분의 1 입니다.
//   그리고 `Rows Removed by Filter` 줄이 **사라졌습니다.** 버린 줄이 없습니다.
//
// ★★★ 그런데 왜 시간은 220배가 아니라 수십 배만 빨라졌을까요?
//   `재기()` 로 잰 값에는 **자바스크립트에서 WASM 으로 오가는 왕복 비용**(0.4ms 쯤)이 섞여
//   있습니다. 실제 일이 0.05ms 로 줄어도 겉으로 잰 값은 0.4ms 밑으로 안 내려갑니다.
//   **데이터베이스가 한 일만** 보려면 계획의 `Execution Time` 을 봐야 합니다.

const 실행시간뽑기 = (계획글) => Number(계획글.match(/Execution Time: ([\d.]+) ms/)[1]);

const 색인전실행 = 실행시간뽑기(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 12345", "(ANALYZE)"));

await db.exec("SET enable_bitmapscan = off; SET enable_indexscan = off;");
const 훑기실행 = 실행시간뽑기(await 계획("SELECT * FROM 점검기록 WHERE 설비번호 = 12345", "(ANALYZE)"));
await db.exec("SET enable_bitmapscan = on; SET enable_indexscan = on;");

console.log(`Execution Time — 순차 훑기 ${훑기실행.toFixed(3)} ms / 색인 ${색인전실행.toFixed(3)} ms`);
// 출력?: Execution Time — 순차 훑기 27.850 ms / 색인 0.054 ms

console.log(`데이터베이스가 한 일만 보면 몇 배: ${(훑기실행 / 색인전실행).toFixed(0)}배`);
// 출력?: 데이터베이스가 한 일만 보면 몇 배: 516배

console.log("100배 이상인가:", 훑기실행 / 색인전실행 > 100);
// 출력: 100배 이상인가: true

// ★ 색인 효과를 잴 때는 **Execution Time 이나 Buffers 로** 재세요.
//   벽시계 시간에는 연결·왕복 비용이 섞여서 효과가 작아 보입니다.

// ── 섹션 4: ★ B-tree 는 어떻게 생겼나 ──

// PostgreSQL 의 기본 색인은 **B-tree** 입니다. (B 는 balanced, 균형)
// 정렬된 값이 층층이 쌓인 나무입니다.
//
//                       ┌───────────────┐
//        뿌리(root)     │  5000 · 15000 │            ← 쪽 1개
//                       └───┬───┬───┬───┘
//              ┌────────────┘   │   └────────────┐
//              ▼                ▼                ▼
//        ┌───────────┐   ┌───────────┐   ┌───────────┐
//  가지  │ 800·2400  │   │6200·10500 │   │16000·18700│   ← 쪽 수십 개
//        └──┬──┬──┬──┘   └──┬──┬──┬──┘   └──┬──┬──┬──┘
//           ▼  ▼  ▼         ▼  ▼  ▼         ▼  ▼  ▼
//        ┌──────────────────────────────────────────┐
//  잎    │ 실제 값 + 표의 어느 쪽 몇 번째 줄인지     │   ← 쪽 수백 개
//        │ (12345 → 쪽 1580, 7번째 줄)              │
//        └──────────────────────────────────────────┘
//
// 12345 를 찾는 과정:
//
//   ① 뿌리에서 본다: 12345 는 5000 과 15000 사이 → 가운데 가지로
//   ② 가지에서 본다: 12345 는 10500 보다 크다 → 오른쪽 잎으로
//   ③ 잎에서 찾는다: 12345 → 표의 1580쪽 7번째 줄
//   ④ 표의 그 쪽만 읽는다
//
// **쪽 네 개**를 읽었습니다. 2642 쪽이 아니라 4 쪽입니다.
//
// ★★ 왜 이렇게 얕은가 — 한 쪽(8KB)에 색인 항목이 500개쯤 들어갑니다.
//     깊이 2 → 500 × 500 = 25만 개 / 깊이 3 → 1억 2500만 개
//   **1억 건짜리 표도 깊이 3~4 입니다.** log₅₀₀(1억) ≈ 3 이니까요.
//
// 말로만 하면 안 믿깁니다. 규모를 1000배로 늘려 가며 **실제로 몇 쪽을 읽는지** 잽니다.

await db.exec("CREATE TABLE 깊이실험 (id INT PRIMARY KEY)");

for (const 건수 of [1000, 20000, 200000, 1000000]) {
  await db.exec("DROP TABLE 깊이실험");
  await db.exec("CREATE TABLE 깊이실험 (id INT PRIMARY KEY)");
  await db.exec(`INSERT INTO 깊이실험 SELECT i FROM generate_series(1, ${건수}) AS i`);

  // ★ VACUUM 은 트랜잭션 안에서 못 돕니다.
  //   db.exec 에 여러 문장을 넣으면 트랜잭션으로 묶이므로 반드시 따로 부릅니다.
  //   묶어서 부르면: "VACUUM cannot run inside a transaction block"
  await db.exec("VACUUM ANALYZE 깊이실험");

  await db.query("SELECT id FROM 깊이실험 WHERE id = 777");   // 예열

  const 잰계획 = await 계획("SELECT id FROM 깊이실험 WHERE id = 777", "(ANALYZE)");
  const 읽은쪽 = 잰계획.match(/Buffers: shared hit=(\d+)/)[1];
  const 색인쪽 = (await db.query("SELECT relpages FROM pg_class WHERE relname = '깊이실험_pkey'")).rows[0].relpages;

  console.log(`${건수.toLocaleString()} 건 · 색인 ${색인쪽} 쪽 · 한 건 찾는 데 읽은 쪽 ${읽은쪽}`);
}
// 출력?: 1,000 건 · 색인 5 쪽 · 한 건 찾는 데 읽은 쪽 3
// 출력?: 20,000 건 · 색인 57 쪽 · 한 건 찾는 데 읽은 쪽 3
// 출력?: 200,000 건 · 색인 551 쪽 · 한 건 찾는 데 읽은 쪽 4
// 출력?: 1,000,000 건 · 색인 2745 쪽 · 한 건 찾는 데 읽은 쪽 4

// ★★★ **데이터가 1000배 늘었는데 읽은 쪽은 3 → 4 로 하나 늘었습니다.**
//
//   순차 훑기였다면 1000배 느려졌을 일입니다.
//   이게 O(n) 과 O(log n) 의 차이입니다. 이 표 한 줄이 색인의 전부입니다.
//
// ★ 그래서 "데이터가 늘어날수록 색인의 값어치가 커집니다."
//   100건짜리 표에 색인을 걸면 별 차이가 없고,
//   1000만 건짜리 표에 색인을 안 걸면 서비스가 멈춥니다.


// ── 섹션 5: ★ ANALYZE — 통계가 없으면 계획이 틀립니다 ──

// 플래너는 데이터를 직접 세지 않습니다. **통계**를 보고 짐작합니다.
// 그 통계를 모으는 명령이 ANALYZE 입니다.
//
// 통계가 낡으면 어떻게 되는지 만들어 봅니다.
// '고장' 이 스무 건뿐일 때 통계를 모아 두고, 그 뒤에 90% 를 고장으로 바꿉니다.

await db.exec(`
  CREATE TABLE 편향 (id SERIAL PRIMARY KEY, 상태 TEXT NOT NULL, 비고 TEXT);
  INSERT INTO 편향 (상태, 비고)
  SELECT CASE WHEN i <= 20 THEN '고장' ELSE '정상' END, '점검 특이사항 없음 기록번호 ' || i
  FROM generate_series(1, 200000) AS i;
  CREATE INDEX 편향_상태 ON 편향 (상태);
  ANALYZE 편향;
`);

// 이 시점의 통계: 고장 20건 (0.01%)
await db.exec("UPDATE 편향 SET 상태 = '고장' WHERE id % 10 <> 0");
// 이제 진짜로는 고장 18만 건 (90%). 그런데 ANALYZE 를 안 했습니다.

const 편향질의 = "SELECT sum(length(비고)) FROM 편향 WHERE 상태 = '고장'";
const 낡은계획 = await 계획(편향질의, "(ANALYZE)");

console.log(낡은계획.split("\n").slice(2, 4).join("\n"));
// 출력?:   ->  Index Scan using "편향_상태" on "편향"  (cost=0.42..9.31 rows=51 width=46) (actual time=0.050..62.759 rows=180002.00 loops=1)
// 출력?:         Index Cond: ("상태" = '고장'::text)

// 계획에서 색인 스캔 줄만 뽑아 추정치와 실제값을 견줍니다.
const 색인줄 = 낡은계획.split("\n").find((줄) => 줄.includes("Index Scan"));
const 추정 = Number(색인줄.match(/rows=(\d+) width/)[1]);
const 실제 = Number(색인줄.match(/actual time=[\d.]+\.\.[\d.]+ rows=([\d.]+)/)[1]);

console.log(`플래너 추정 ${추정} 줄 / 실제 ${실제} 줄 → ${Math.round(실제 / 추정).toLocaleString()}배 어긋남`);
// 출력?: 플래너 추정 51 줄 / 실제 180002 줄 → 3,529배 어긋남

console.log("추정이 1000배 이상 어긋났나:", 실제 / 추정 > 1000);
// 출력: 추정이 1000배 이상 어긋났나: true

await db.exec("ANALYZE 편향");

const 새계획 = await 계획(편향질의, "(ANALYZE)");

console.log(새계획.split("\n").slice(2, 4).join("\n"));
// 출력?:   ->  Seq Scan on "편향"  (cost=0.00..6799.00 rows=180520 width=46) (actual time=0.452..79.591 rows=180002.00 loops=1)
// 출력?:         Filter: ("상태" = '고장'::text)

console.log("ANALYZE 전에는 색인을 썼나:", 낡은계획.includes("Index Scan"));
// 출력: ANALYZE 전에는 색인을 썼나: true

console.log("ANALYZE 후에는 순차 훑기로 바뀌었나:", 새계획.includes("Seq Scan"));
// 출력: ANALYZE 후에는 순차 훑기로 바뀌었나: true

// ★★ 계획이 완전히 뒤집혔습니다.
//
//   통계가 "고장은 수십 줄뿐" 이라고 하니 플래너는 색인으로 콕 집으려 했습니다.
//   실제로는 18만 줄이었습니다. 18만 번을 색인으로 왔다 갔다 한 것입니다.
//
// ★★★ **여기서 정직하게 말씀드릴 것이 있습니다.**
//   PGlite 에서는 이 두 계획의 **시간 차이가 거의 안 납니다.**
//   데이터가 전부 메모리에 있어서 "무작위로 왔다 갔다" 하는 비용이 거의 0 이기 때문입니다.
//   진짜 서버는 디스크에서 읽습니다. 18만 번 무작위 접근은 순서대로 읽기보다
//   수십 배 비쌉니다. 그래서 이게 운영에서 사고가 됩니다.
//
//   ★ 그러니 이 실습에서 봐야 할 것은 시간이 아니라 **rows 추정치와 actual rows 의 차이**입니다.
//     수천 배 어긋났다는 것 — 그게 신호입니다. (개념03 에서 자세히 봅니다)
//
// ★ 실무에서는 autovacuum 이 알아서 ANALYZE 를 돌립니다.
//   문제는 **대량으로 넣거나 고친 직후**입니다. autovacuum 이 오기 전까지는 통계가 낡아 있습니다.
//   대량 작업 뒤에는 손으로 `ANALYZE 표이름;` 을 돌리세요. (10단원에서 운영 이야기를 합니다)


// ── 섹션 6: ★★ 색인의 대가 ① — 넣고 고치는 게 느려집니다 ──

// 색인은 표와 **따로** 관리됩니다. 표에 한 줄 넣으면 색인에도 넣어야 합니다.
// 색인이 다섯 개면 다섯 번 더 씁니다. 똑같이 생긴 표 둘로 재 봅니다.

const 표만들기 = (이름) => `
  CREATE TABLE ${이름} (
    id SERIAL PRIMARY KEY, 설비번호 INT, 라인 TEXT, 상태 TEXT, 점검자 TEXT, 점검일 DATE
  )`;

await db.exec(표만들기("색인없는표"));
await db.exec(표만들기("색인다섯표"));

await db.exec(`
  CREATE INDEX 다섯_1 ON 색인다섯표 (설비번호);
  CREATE INDEX 다섯_2 ON 색인다섯표 (라인);
  CREATE INDEX 다섯_3 ON 색인다섯표 (상태);
  CREATE INDEX 다섯_4 ON 색인다섯표 (점검자);
  CREATE INDEX 다섯_5 ON 색인다섯표 (점검일);
`);

const 십만건넣기 = (표) => `
  INSERT INTO ${표} (설비번호, 라인, 상태, 점검자, 점검일)
  SELECT (i % 20000) + 1,
         (ARRAY['A','B','C','D'])[(i % 4) + 1],
         (ARRAY['정상','주의','고장'])[(i % 3) + 1],
         '점검원' || ((i % 50) + 1),
         DATE '2024-01-01' + ((i % 365) || ' days')::interval
  FROM generate_series(1, 100000) AS i`;

const 없이시작 = performance.now();
await db.exec(십만건넣기("색인없는표"));
const 없이ms = performance.now() - 없이시작;

const 다섯시작 = performance.now();
await db.exec(십만건넣기("색인다섯표"));
const 다섯ms = performance.now() - 다섯시작;

console.log(`10만 건 INSERT — 색인 0개: ${없이ms.toFixed(0)} ms / 색인 5개: ${다섯ms.toFixed(0)} ms`);
// 출력?: 10만 건 INSERT — 색인 0개: 559 ms / 색인 5개: 1280 ms

console.log(`색인 5개가 몇 배 느린가: ${(다섯ms / 없이ms).toFixed(2)}배`);
// 출력?: 색인 5개가 몇 배 느린가: 2.29배

console.log("색인이 있으면 넣기가 느려지나:", 다섯ms > 없이ms);
// 출력: 색인이 있으면 넣기가 느려지나: true

// UPDATE 도 봅니다. 색인이 걸린 칸을 고치면 색인도 고쳐야 합니다.

const u없이 = await 재기(5, (회차) =>
  db.query("UPDATE 색인없는표 SET 상태 = '점검' WHERE id BETWEEN $1 AND $1 + 999", [회차 * 2000 + 1]),
);
const u다섯 = await 재기(5, (회차) =>
  db.query("UPDATE 색인다섯표 SET 상태 = '점검' WHERE id BETWEEN $1 AND $1 + 999", [회차 * 2000 + 1]),
);

console.log(`1000건 UPDATE — 색인 0개: ${u없이.toFixed(1)} ms / 색인 5개: ${u다섯.toFixed(1)} ms`);
// 출력?: 1000건 UPDATE — 색인 0개: 4.9 ms / 색인 5개: 17.8 ms

console.log("색인이 있으면 고치기도 느려지나:", u다섯 > u없이);
// 출력: 색인이 있으면 고치기도 느려지나: true

// ★★★ **읽기를 사면 쓰기를 팝니다.**
//
//   점검기록처럼 하루 종일 쌓이는 표에 색인을 열 개 걸면 넣는 게 몇 배 느려집니다.
//   "혹시 쓸까 봐" 걸어 둔 색인 하나하나가 INSERT 마다 값을 치릅니다.


// ── 섹션 7: 색인의 대가 ② — 자리를 먹습니다 ──

const 크기 = (
  await db.query(`
    SELECT pg_relation_size('색인다섯표') AS 표, pg_indexes_size('색인다섯표') AS 색인들,
           pg_relation_size('점검_설비번호') AS 하나
  `)
).rows[0];

console.log(`색인다섯표 — 표 ${메가(크기.표)} / 색인 6개 합계 ${메가(크기.색인들)}`);
// 출력?: 색인다섯표 — 표 6.77 MB / 색인 6개 합계 7.06 MB

console.log("색인이 표보다 큰가:", Number(크기.색인들) > Number(크기.표));
// 출력: 색인이 표보다 큰가: true

console.log(`점검기록의 설비번호 색인 하나: ${메가(크기.하나)}`);
// 출력?: 점검기록의 설비번호 색인 하나: 1.81 MB

// ★★ **색인 여섯 개(기본키 포함)가 표보다 큽니다.**
//
//   백업도 그만큼 커지고, 메모리 캐시도 그만큼 차지합니다.
//   "디스크 싸잖아요" 라고 하기 쉬운데, 진짜 비싼 건 **메모리 캐시 자리**입니다.
//   자주 쓰는 데이터가 캐시에서 밀려나면 전체가 느려집니다.
//
// 색인 목록과 크기는 이렇게 봅니다. 운영에서 자주 씁니다.

const 색인목록 = (
  await db.query(`
    SELECT indexrelname AS 이름, pg_relation_size(indexrelid) AS 바이트
    FROM pg_stat_user_indexes WHERE relname = '색인다섯표' ORDER BY 이름
  `)
).rows;

for (const { 이름, 바이트 } of 색인목록) {
  console.log(`· ${이름} — ${메가(바이트)}`);
}
// 출력?: · 다섯_1 — 1.73 MB
// 출력?: · 다섯_2 — 0.67 MB
// 출력?: · 다섯_3 — 0.69 MB
// 출력?: · 다섯_4 — 0.80 MB
// 출력?: · 다섯_5 — 0.89 MB
// 출력?: · 색인다섯표_pkey — 2.29 MB


// ── 섹션 8: UNIQUE 색인과 UNIQUE 제약 ──

// UNIQUE 를 걸면 **중복을 막으면서 색인도 생깁니다.** 하나로 두 가지를 합니다.

await db.exec(`
  CREATE TABLE 설비 (
    id       SERIAL PRIMARY KEY,
    관리번호 TEXT NOT NULL UNIQUE,
    이름     TEXT NOT NULL
  );
  INSERT INTO 설비 (관리번호, 이름) VALUES ('EQ-001', '컨베이어 1호');
`);

try {
  await db.query("INSERT INTO 설비 (관리번호, 이름) VALUES ('EQ-001', '가짜 설비')");
} catch (에러) {
  console.log("중복을 막았나:", 에러.code === "23505");
  // 출력: 중복을 막았나: true
}

const 설비색인들 = (
  await db.query("SELECT indexname FROM pg_indexes WHERE tablename = '설비' ORDER BY indexname")
).rows.map((줄) => 줄.indexname);

console.log("설비 표의 색인:", 설비색인들.join(", "));
// 출력: 설비 표의 색인: 설비_pkey, 설비_관리번호_key

// ★ UNIQUE 제약(constraint)과 UNIQUE 색인(index)의 관계
//   · `UNIQUE` 제약을 걸면 → PostgreSQL 이 **UNIQUE 색인을 자동으로 만듭니다**
//   · `CREATE UNIQUE INDEX` 로 색인만 만들어도 → 중복은 똑같이 막힙니다
//   · 다른 점: 제약은 외래키가 참조할 수 있고, 색인만 만든 것은 참조 대상이 못 됩니다
//   ★ 그래서 **UNIQUE 는 제약으로 거는 게 낫습니다.** 색인은 따라옵니다.

await db.exec("CREATE UNIQUE INDEX 설비_이름_유일 ON 설비 (이름)");

try {
  await db.query("INSERT INTO 설비 (관리번호, 이름) VALUES ('EQ-002', '컨베이어 1호')");
} catch (에러) {
  console.log("UNIQUE 색인만으로도 중복이 막히나:", 에러.code === "23505");
  // 출력: UNIQUE 색인만으로도 중복이 막히나: true
}


// ── 섹션 9: ★★ 기본키에는 색인이 생기고, 외래키에는 안 생깁니다 ──

// 여기서 아주 많이 당합니다. 실제로 확인합니다.

await db.exec(`
  CREATE TABLE 점검2 (
    id       SERIAL PRIMARY KEY,
    설비번호 INT NOT NULL REFERENCES 설비(id),
    상태     TEXT NOT NULL
  );
  INSERT INTO 점검2 (설비번호, 상태)
  SELECT 1, (ARRAY['정상','주의','고장'])[(i % 3) + 1]
  FROM generate_series(1, 100000) AS i;
  ANALYZE 점검2;
`);

const 점검2색인 = (
  await db.query("SELECT indexname FROM pg_indexes WHERE tablename = '점검2' ORDER BY indexname")
).rows.map((줄) => 줄.indexname);

console.log("점검2 의 색인:", 점검2색인.join(", "));
// 출력: 점검2 의 색인: 점검2_pkey

console.log("기본키 색인이 자동으로 생겼나:", 점검2색인.includes("점검2_pkey"));
// 출력: 기본키 색인이 자동으로 생겼나: true

console.log("외래키 칸(설비번호)에도 색인이 생겼나:", 점검2색인.some((이름) => 이름.includes("설비번호")));
// 출력: 외래키 칸(설비번호)에도 색인이 생겼나: false

console.log(await 계획("SELECT count(*) FROM 점검2 WHERE 설비번호 = 1"));
// 출력?: Aggregate  (cost=2041.00..2041.01 rows=1 width=8)
// 출력?:   ->  Seq Scan on "점검2"  (cost=0.00..1791.00 rows=100000 width=0)
// 출력?:         Filter: ("설비번호" = 1)

// ★★★ **외래키를 걸어도 색인은 안 생깁니다.**
//
//   왜 문제가 되나:
//
//   ① 조인이 느려집니다. `설비 JOIN 점검2 ON 점검2.설비번호 = 설비.id` 는 거의 모든 화면에서 씁니다
//   ② **부모를 지울 때 자식 표를 전부 훑습니다.** `DELETE FROM 설비 WHERE id = 1` 을 하면
//      "이 설비를 참조하는 점검2 줄이 있나" 를 확인해야 합니다. 색인이 없으면 통째로 훑습니다.
//      자식이 1000만 건이면 그대로 멈춥니다.
//
//   ★ 규칙: **외래키 칸에는 색인을 직접 거세요.** 예외는 거의 없습니다.

await db.exec("CREATE INDEX 점검2_설비번호 ON 점검2 (설비번호)");

const 지우기전 = await 계획("DELETE FROM 설비 WHERE id = 99999");

console.log("색인을 걸면 조인/삭제 확인이 색인을 타나:", !(await 계획("SELECT count(*) FROM 점검2 WHERE 설비번호 = 99999")).includes("Seq Scan"));
// 출력: 색인을 걸면 조인/삭제 확인이 색인을 타나: true

console.log("DELETE 계획도 나오나:", 지우기전.length > 0);
// 출력: DELETE 계획도 나오나: true


// ── MySQL 은 여기가 다릅니다 ──
//
//   · MySQL(InnoDB)은 **외래키를 만들면 색인을 자동으로 만들어 줍니다.** 이건 다릅니다
//   · 기본키가 곧 데이터 저장 순서입니다(클러스터드 인덱스). PostgreSQL 은 안 그렇습니다
//   · `ANALYZE TABLE 표이름;` 으로 통계를 모읍니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ============================================================
// 정리 — 색인을 걸면 무엇이 생기고 무엇을 잃나
// ============================================================
//
//   무엇                      재 본 결과
//   ────────────────────────────────────────────────────────────
//   20만 건 한 건 찾기          2642 쪽 → 12 쪽 (220분의 1), Execution Time 400배
//   1000배 큰 표에서 찾기       읽은 쪽 3 → 4 (하나만 늘어남)
//   10만 건 INSERT             색인 5개면 2~3배 느려짐
//   1000건 UPDATE              색인 5개면 2~3배 느려짐
//   저장 공간                  색인 여섯 개가 표보다 큼
//   통계가 낡으면              추정이 수천 배 어긋나고 계획이 뒤집힘
//
//   명령                      무엇을 하나
//   ────────────────────────────────────────────────────────────
//   CREATE INDEX 이름 ON 표(칸)   색인을 만든다
//   CREATE UNIQUE INDEX ...       중복도 막는다
//   ANALYZE 표이름                통계를 모은다 (대량 작업 뒤에는 꼭)
//   pg_relation_size('이름')      표나 색인 하나의 크기
//   pg_indexes_size('표')         그 표의 색인 전부 합친 크기
//
// ★★★ 색인은 **읽기를 사고 쓰기를 파는 거래**입니다.
//   무엇을 사고 무엇을 파는지 모르고 하면 손해 보는 거래가 됩니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 6 에서 색인 개수를 1개, 3개, 5개, 10개로 바꿔 보세요.
//                    INSERT 시간이 색인 개수에 비례하나요?
//
// ✏️ 직접 해보기 2 — 섹션 4 의 깊이실험에 500만 건을 추가해 보세요.
//                    읽은 쪽이 5 가 되나요? (몇 초 더 걸립니다)
//
// ✏️ 직접 해보기 3 — 색인 이름을 안 주고 `CREATE INDEX ON 점검기록 (라인);` 이라고
//                    해 보세요. 어떤 이름이 붙나요? (pg_indexes 로 확인)
//
// ✏️ 직접 해보기 4 — 섹션 6 의 UPDATE 대상 칸을 `상태`(색인 있음) 대신
//                    색인이 없는 칸으로 바꿔 보세요. 차이가 줄어드나요?
//                    ★ 힌트: HOT 갱신이라는 최적화가 있습니다
//
// ✏️ 직접 해보기 5 — `DROP INDEX 점검_설비번호;` 로 지우고 섹션 3 을 다시 재 보세요.
//                    원래 속도로 돌아오나요?
//
// ✏️ 직접 해보기 6 — 섹션 9 에서 점검2 를 100만 건으로 늘리고,
//                    색인 없이 `DELETE FROM 설비 WHERE id = 99999` 를 EXPLAIN ANALYZE 해 보세요.
//                    Trigger 라는 줄이 보이나요? 얼마나 걸리나요?


// ── 자주 하는 실수 ──

// [실수 1] "일단 자주 쓰는 칸에 다 걸어 두자"
//   섹션 6 에서 재 봤습니다. 색인 다섯 개면 INSERT 가 세 배 가까이 느려집니다.
//   **안 쓰이는 색인은 순수한 손해**입니다. 읽기는 안 빨라지고 쓰기만 느려집니다.
//   무엇을 안 쓰는지 찾는 법은 개념04 에서 합니다.

// [실수 2] 외래키에 색인이 자동으로 생기는 줄 앎
//   섹션 9 에서 확인했습니다. **PostgreSQL 은 안 만들어 줍니다.**
//   MySQL 은 만들어 줍니다. 그래서 MySQL 하다 온 사람이 특히 잘 당합니다.

// [실수 3] 대량으로 넣고 ANALYZE 를 안 함
//   섹션 5 에서 봤습니다. 통계가 낡으면 추정이 수천 배 어긋납니다.
//   대량 INSERT/UPDATE/DELETE 뒤에는 `ANALYZE 표이름;` 을 돌리세요.

// [실수 4] VACUUM 을 db.exec 에 다른 문장과 같이 넣음
//   섹션 4 의 주석대로 "VACUUM cannot run inside a transaction block" 이 납니다.
//   VACUUM 은 항상 혼자 부르세요.

// [실수 5] 색인을 걸어 두고 빨라졌는지 안 재 봄
//   섹션 3 처럼 **전/후를 같은 방법으로** 재세요.
//   그리고 시간이 아니라 `Buffers` 의 쪽 수를 보세요. 시간은 기계마다 다릅니다.

// [실수 6] 색인 크기를 무시함
//   섹션 7 에서 색인 합계가 표보다 컸습니다.
//   백업 시간, 복구 시간, 메모리 캐시가 전부 그만큼 늘어납니다.


await db.close();
