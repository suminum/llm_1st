// ============================================================
// 10단원 · 개념 04 — 멈추지 않고 스키마 바꾸기
// ------------------------------------------------------------
// 실행: node 개념04_멈추지_않고_스키마_바꾸기.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 표를 다시 쓰는 변경을 실제로 재서 20초쯤 걸립니다.
// ============================================================
//
// 08단원에서 마이그레이션을 만들었습니다.
// 번호 붙은 .sql 파일, 적용 기록 표, 한 파일 = 한 트랜잭션.
// 그리고 이런 경고를 남겼습니다.
//
//   시각    서버1        서버2        데이터베이스
//   ──────────────────────────────────────────────
//   10:00   옛 코드      옛 코드      옛 스키마
//   10:01   옛 코드      옛 코드      ★ 새 스키마 (마이그레이션 적용)
//   10:02   새 코드      옛 코드      새 스키마      ← 여기가 위험합니다
//   10:03   새 코드      새 코드      새 스키마
//
// 07단원에서는 이렇게 미뤘습니다.
//   "그래서 운영 중 스키마 변경은 lock_timeout 을 짧게 걸고, 안 잡히면 포기하고,
//    CREATE INDEX CONCURRENTLY 처럼 안 막는 방법을 씁니다. 10단원에서 다시 다룹니다."
//
// 이 파일이 그 답입니다. 두 가지를 다룹니다.
//
//   ① **얼마나 오래 잠그나** — 변경 종류별로 직접 잽니다
//   ② **어떻게 안 멈추고 바꾸나** — 확장 → 이전 → 축소를 실제 코드로
//
// ★★★ 배포 중에는 **옛 코드와 새 코드가 같이 돕니다.**
//   이 한 문장이 이 파일 전부입니다.
//   `ALTER TABLE ... RENAME COLUMN` 한 줄이면 되는 일을
//   왜 세 번에 나눠서 며칠에 걸쳐 하는지, 그 이유가 이것입니다.

import pg from "pg";


// ── 섹션 0: 연결 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-ddl", // ★ 영어로
};

let 연결;

try {
  연결 = new pg.Client(접속정보);
  await 연결.connect();
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 안내입니다. 정상 종료합니다.
  console.log("데이터베이스에 연결하지 못했습니다.", 에러.code ?? 에러.message);
  console.log("이 파일은 Docker 가 필요합니다. 아래를 치고 다시 실행하세요.");
  console.log("  docker compose up -d");
  process.exit(0);
}

// ★★ 07~10단원이 같은 데이터베이스를 씁니다. 자기 스키마를 씁니다.
await 연결.query("CREATE SCHEMA IF NOT EXISTS 단원10");
await 연결.query("SET search_path TO 단원10");

async function 새연결(이름표) {
  const 새것 = new pg.Client({ ...접속정보, application_name: 이름표 });
  await 새것.connect();
  await 새것.query("SET search_path TO 단원10");
  return 새것;
}

const 잠깐 = (밀리초) => new Promise((끝) => setTimeout(끝, 밀리초));

console.log("연결됐습니다.");
// 출력: 연결됐습니다.


// ── 섹션 1: ★★ 어떤 변경이 표를 잠그나 — 직접 재기 ──

// 08단원에서 표로만 보여 줬던 것을 여기서는 **잽니다.**
// 20만 건짜리 표를 만들고, 변경마다 몇 ms 걸리는지 봅니다.
//
// ★ 걸린 시간 = 그 표가 잠겨 있던 시간입니다.
//   `ALTER TABLE` 은 거의 다 ACCESS EXCLUSIVE 를 잡습니다. (07단원)
//   그동안 그 표는 **읽지도 쓰지도 못합니다.**

async function 시험표만들기() {
  await 연결.query("DROP TABLE IF EXISTS 변경시험 CASCADE");

  await 연결.query(`
    CREATE TABLE 변경시험 (
      번호 INT PRIMARY KEY,
      이름 VARCHAR(20) NOT NULL,
      수량 INT NOT NULL
    )
  `);

  await 연결.query("INSERT INTO 변경시험 SELECT g, '설비' || g, g % 100 FROM generate_series(1, 200000) g");
  await 연결.query("VACUUM ANALYZE 변경시험");
}

await 시험표만들기();

async function 재기(sql) {
  const 시작 = performance.now();
  await 연결.query(sql);
  return performance.now() - 시작;
}

// ★★★ 시간만 재면 안 됩니다. 기계가 바쁘면 몇 배씩 흔들립니다.
//   **표를 다시 썼는지는 흔들리지 않습니다.** 그걸 같이 봅니다.
//
//   `relfilenode` 는 그 표가 담긴 **디스크 파일의 번호**입니다.
//   표를 통째로 다시 쓰면 새 파일에 쓰고 옛 파일을 버리므로 **번호가 바뀝니다.**
//   카탈로그만 고치는 변경은 번호가 그대로입니다.
//   ★ 이게 "이 ALTER 가 비싼가" 를 재는 가장 정확한 방법입니다.
const 파일번호 = async () =>
  (
    await 연결.query("SELECT relfilenode::int AS 번호 FROM pg_class WHERE oid = '단원10.변경시험'::regclass")
  ).rows[0].번호;

async function 재고다시썼나보기(sql) {
  const 전 = await 파일번호();
  const 걸린 = await 재기(sql);
  const 후 = await 파일번호();

  return { 걸린, 다시썼나: 전 !== 후 };
}

const 칸추가 = await 재고다시썼나보기("ALTER TABLE 변경시험 ADD COLUMN 비고 TEXT");
const 기본값칸추가 = await 재고다시썼나보기("ALTER TABLE 변경시험 ADD COLUMN 등급 TEXT DEFAULT 'B'");
const 낫널추가 = await 재고다시썼나보기("ALTER TABLE 변경시험 ALTER COLUMN 등급 SET NOT NULL");
const 타입넓히기 = await 재고다시썼나보기("ALTER TABLE 변경시험 ALTER COLUMN 이름 TYPE VARCHAR(50)");
const 타입좁히기 = await 재고다시썼나보기("ALTER TABLE 변경시험 ALTER COLUMN 이름 TYPE VARCHAR(30)");
const 타입바꾸기 = await 재고다시썼나보기("ALTER TABLE 변경시험 ALTER COLUMN 수량 TYPE TEXT");
// ★ 색인 두 가지는 차이가 작아서 한 번만 재면 뒤집힙니다.
//   제작 지침대로 **세 번 재고 중앙값**을 씁니다. 실제로 한 번만 쟀다가 뒤집혔습니다.
async function 중앙값으로재기(sql) {
  const 잰것 = [];

  for (let 회차 = 0; 회차 < 3; 회차 += 1) {
    잰것.push(await 재기(sql));
    await 연결.query("DROP INDEX 변경_수량");
  }

  return 잰것.sort((가, 나) => 가 - 나)[1];
}

const 색인만들기 = await 중앙값으로재기("CREATE INDEX 변경_수량 ON 변경시험 (수량)");
const 동시색인 = await 중앙값으로재기("CREATE INDEX CONCURRENTLY 변경_수량 ON 변경시험 (수량)");

await 연결.query("CREATE INDEX 변경_수량 ON 변경시험 (수량)"); // 표를 다시 만들 때까지 자리를 맞춰 둡니다
await 연결.query("DROP INDEX 변경_수량");

const 잰것 = [
  ["칸 추가 (기본값 없음)", 칸추가.걸린],
  ["칸 추가 (기본값 있음)", 기본값칸추가.걸린],
  ["NOT NULL 걸기", 낫널추가.걸린],
  ["VARCHAR(20) → VARCHAR(50) 넓히기", 타입넓히기.걸린],
  ["VARCHAR(50) → VARCHAR(30) 좁히기", 타입좁히기.걸린],
  ["INT → TEXT 바꾸기", 타입바꾸기.걸린],
  ["색인 만들기 (보통)", 색인만들기],
  ["색인 만들기 CONCURRENTLY", 동시색인],
];

for (const [이름, 걸린] of 잰것) console.log(`  ${걸린.toFixed(1)} ms — ${이름}`);
// 출력?:   2.5 ms — 칸 추가 (기본값 없음)
// 출력?:   1.9 ms — 칸 추가 (기본값 있음)
// 출력?:   10.1 ms — NOT NULL 걸기
// 출력?:   5.6 ms — VARCHAR(20) → VARCHAR(50) 넓히기
// 출력?:   177.6 ms — VARCHAR(50) → VARCHAR(30) 좁히기
// 출력?:   174.5 ms — INT → TEXT 바꾸기
// 출력?:   106.0 ms — 색인 만들기 (보통)
// 출력?:   142.2 ms — 색인 만들기 CONCURRENTLY

// ── 판정은 시간이 아니라 **표를 다시 썼는지**로 합니다 ──
//
// ★ 시간은 기계와 부하에 따라 흔들립니다. 파일 번호가 바뀌었는지는 안 흔들립니다.

const 다시쓴것 = [
  ["칸 추가 (기본값 없음)", 칸추가],
  ["칸 추가 (기본값 있음)", 기본값칸추가],
  ["NOT NULL 걸기", 낫널추가],
  ["VARCHAR 넓히기", 타입넓히기],
  ["VARCHAR 좁히기", 타입좁히기],
  ["INT → TEXT", 타입바꾸기],
];

for (const [이름, 결과] of 다시쓴것) {
  console.log(`  ${결과.다시썼나 ? "표를 다시 씀" : "카탈로그만 고침"} — ${이름}`);
}
// 출력:   카탈로그만 고침 — 칸 추가 (기본값 없음)
// 출력:   카탈로그만 고침 — 칸 추가 (기본값 있음)
// 출력:   카탈로그만 고침 — NOT NULL 걸기
// 출력:   카탈로그만 고침 — VARCHAR 넓히기
// 출력:   표를 다시 씀 — VARCHAR 좁히기
// 출력:   표를 다시 씀 — INT → TEXT

console.log("칸 추가는 표를 안 다시 쓰나:", 칸추가.다시썼나 === false && 기본값칸추가.다시썼나 === false);
// 출력: 칸 추가는 표를 안 다시 쓰나: true

console.log("넓히기는 안 다시 쓰고, 좁히기는 다시 쓰나:", 타입넓히기.다시썼나 === false && 타입좁히기.다시썼나 === true);
// 출력: 넓히기는 안 다시 쓰고, 좁히기는 다시 쓰나: true

console.log("타입 바꾸기는 표를 다시 쓰나:", 타입바꾸기.다시썼나);
// 출력: 타입 바꾸기는 표를 다시 쓰나: true

console.log(`참고 — 타입 바꾸기가 칸 추가보다 ${Math.round(타입바꾸기.걸린 / 칸추가.걸린)}배 걸렸습니다`);
// 출력?: 참고 — 타입 바꾸기가 칸 추가보다 69배 걸렸습니다

// ★★★ 이 숫자들이 말하는 것
//
//   **칸 추가는 공짜입니다.** 몇 ms 입니다. 20만 건이든 2억 건이든 같습니다.
//   Postgres 11 부터는 기본값이 있어도 그렇습니다. 카탈로그만 고치고 끝냅니다.
//
//   **타입을 바꾸면 표를 통째로 다시 씁니다.** 수십~수백 배 걸립니다.
//   ★ 그리고 이건 **줄 수에 비례합니다.** 20만 건에 0.2초면 2억 건에는 200초입니다.
//     칸 추가는 아무리 커도 그대로인데, 타입 바꾸기는 표가 클수록 정직하게 늘어납니다.
//     그동안 그 표는 읽지도 쓰지도 못합니다.
//
//   ★ 넓히기(VARCHAR(20) → VARCHAR(50))는 빠릅니다. 값이 그대로 들어가니까요.
//     좁히기(50 → 30)는 느립니다. **한 줄씩 확인해야** 하니까요.
//     "안 넘치는지 봐야 한다" 가 그대로 시간이 됩니다.
//
//   ★★ 그러니 규칙은 이렇습니다.
//     · **넓히는 방향은** 대체로 안전합니다
//     · **좁히거나 바꾸는 방향은** 표를 다시 씁니다. 큰 표면 못 합니다


// ── 섹션 2: ★★★ 잠금 큐 — 진짜 사고는 여기서 납니다 ──

// 위에서 "1.8초 멈춘다" 고 했습니다. 그 정도면 참을 만하다고 생각할 수 있습니다.
// **그런데 진짜 사고는 다른 데서 납니다.**
//
// `ALTER TABLE` 이 잠금을 **못 잡고 기다리는 동안**,
// 그 뒤에 줄 선 모든 쿼리가 같이 막힙니다. **읽기까지 포함해서요.**

await 시험표만들기();

const 오래도는쿼리 = await 새연결("unit10-queue");
const 바꾸는사람 = await 새연결("unit10-queue");
const 읽는사람 = await 새연결("unit10-queue");

// ① 누군가 그 표를 읽는 트랜잭션을 열어 둡니다. 아주 흔한 일입니다.
await 오래도는쿼리.query("BEGIN");
await 오래도는쿼리.query("SELECT count(*) FROM 변경시험");

const 시작시각 = performance.now();

// ② ALTER 를 겁니다. ①이 안 끝나서 잠금을 못 잡습니다. 기다립니다.
//    ★ await 를 안 겁니다. 띄워만 둡니다. (07단원에서 쓴 방법)
const 알터대기 = 바꾸는사람
  .query("ALTER TABLE 변경시험 ADD COLUMN 새칸 TEXT")
  .then(() => performance.now() - 시작시각);

await 잠깐(400);

// ③ ★★★ 그냥 평범한 SELECT 하나가 뒤에 옵니다.
//    SELECT 는 SELECT 를 절대 안 막습니다. ①과는 아무 문제가 없습니다.
//    그런데 **②가 앞에 줄 서 있어서** 같이 막힙니다.
const 읽기대기 = 읽는사람
  .query("SELECT count(*) FROM 변경시험")
  .then(() => performance.now() - 시작시각);

await 잠깐(400);

const 줄선것 = await 연결.query(`
  SELECT left(query, 26)                          AS 문장,
         wait_event_type                          AS 무엇을기다리나,
         cardinality(pg_blocking_pids(pid)) > 0   AS 막혀있나
  FROM pg_stat_activity
  WHERE application_name = 'unit10-queue' AND state <> 'idle'
  ORDER BY query_start
`);

for (const 줄 of 줄선것.rows) {
  console.log(`  ${줄.막혀있나 ? "막힘" : "안막힘"} · ${줄.무엇을기다리나 ?? "없음"} · ${줄.문장}`);
}
// 출력:   안막힘 · Client · SELECT count(*) FROM 변경시험
// 출력:   막힘 · Lock · ALTER TABLE 변경시험 ADD COLUM
// 출력:   막힘 · Lock · SELECT count(*) FROM 변경시험

// ①이 놓아 줍니다.
await 오래도는쿼리.query("COMMIT");

const 알터가기다린 = await 알터대기;
const 읽기가기다린 = await 읽기대기;

console.log(`ALTER 가 기다린 시간: ${알터가기다린.toFixed(0)} ms`);
// 출력?: ALTER 가 기다린 시간: 814 ms

console.log(`뒤에 선 SELECT 가 기다린 시간: ${읽기가기다린.toFixed(0)} ms`);
// 출력?: 뒤에 선 SELECT 가 기다린 시간: 821 ms

console.log("죄 없는 SELECT 도 같이 막혔나:", 읽기가기다린 > 300);
// 출력: 죄 없는 SELECT 도 같이 막혔나: true

await 오래도는쿼리.end();
await 바꾸는사람.end();
await 읽는사람.end();

// ★★★ **이게 운영 장애의 전형적인 모양입니다.**
//
//   ① 누가 그 표를 읽는 긴 트랜잭션을 열어 뒀습니다 (보고서 쿼리, 백업, 사람이 연 psql)
//   ② 배포 스크립트가 `ALTER TABLE` 을 겁니다. 잠금을 못 잡고 기다립니다
//   ③ ★ 그 뒤로 오는 **모든 요청**이 줄을 섭니다. 읽기도요
//   ④ 몇 초 만에 커넥션 풀이 다 찹니다 (08단원)
//   ⑤ 서비스 전체가 죽습니다
//
//   ALTER 자체는 2ms 짜리였습니다. 문제는 **기다리는 동안**입니다.
//
// ★★ 왜 뒤의 SELECT 가 막히나
//   Postgres 의 잠금은 **먼저 온 순서**를 지킵니다.
//   ALTER 가 ACCESS EXCLUSIVE 를 기다리는 중이면,
//   그 뒤에 온 요청은 ALTER 와 부딪히는지부터 봅니다. 그래서 같이 섭니다.
//   새치기를 허용하면 ALTER 가 영원히 못 들어가니까요.


// ── 섹션 3: lock_timeout — 못 잡으면 포기하게 ──

// 답은 간단합니다. **오래 기다리지 않게 하면 됩니다.**

await 시험표만들기();

const 붙잡는사람 = await 새연결("unit10-lt");

await 붙잡는사람.query("BEGIN");
await 붙잡는사람.query("SELECT count(*) FROM 변경시험");

await 연결.query("SET lock_timeout = '150ms'");

const 포기시작 = performance.now();
let 포기결과 = "잠갔음";

try {
  await 연결.query("ALTER TABLE 변경시험 ADD COLUMN 못들어감 TEXT");
} catch (에러) {
  포기결과 = 에러.code;
}

const 포기까지 = performance.now() - 포기시작;

console.log(`lock_timeout: ${포기결과} — ${포기까지.toFixed(0)} ms 만에 포기`);
// 출력?: lock_timeout: 55P03 — 156 ms 만에 포기

console.log("150ms 안팎에 포기했나:", 포기까지 >= 140 && 포기까지 < 3000);
// 출력: 150ms 안팎에 포기했나: true

console.log("에러코드가 55P03 인가:", 포기결과 === "55P03");
// 출력: 에러코드가 55P03 인가: true

await 연결.query("SET lock_timeout = 0");
await 붙잡는사람.query("ROLLBACK");
await 붙잡는사람.end();

// ★★ 운영 마이그레이션의 표준 서식입니다. **외워 두세요.**
//
//   SET lock_timeout = '3s';
//   ALTER TABLE 설비 ADD COLUMN 담당자 TEXT;
//
//   못 잡으면 3초 만에 실패합니다. 실패는 괜찮습니다. **다시 하면 됩니다.**
//   기다리는 것이 나쁩니다. 뒤에 줄이 서니까요.
//
// ★ 재시도까지 붙이면 이렇게 됩니다.
//
//   for (let 시도 = 0; 시도 < 10; 시도 += 1) {
//     try {
//       await 연결.query("SET lock_timeout = '3s'");
//       await 연결.query("ALTER TABLE ...");
//       break;
//     } catch (에러) {
//       if (에러.code !== "55P03") throw 에러;
//       await 잠깐(5000);   // 조금 쉬었다 다시
//     }
//   }
//
// ★★★ 그리고 `statement_timeout` 과 헷갈리지 마세요. (07단원)
//   lock_timeout       잠금을 **기다리는** 시간만 제한
//   statement_timeout  문장 **전체** 시간을 제한
//   → ALTER 에 statement_timeout 을 걸면, 표를 다시 쓰는 중에 잘려서
//     그 시간이 통째로 날아갑니다. lock_timeout 을 쓰세요.


// ── 섹션 4: CREATE INDEX CONCURRENTLY ──

// 색인 만들기는 그 자체로 오래 걸립니다. 큰 표면 몇십 분입니다.
// 보통 `CREATE INDEX` 는 그동안 **쓰기를 막습니다.**
// `CONCURRENTLY` 를 붙이면 안 막습니다.

await 시험표만들기();

// 색인을 만드는 **동안** 쓰기가 되는지 확인해 봅니다.
const 쓰는사람 = await 새연결("unit10-cic");

const 색인시작 = performance.now();

const 색인만드는중 = 연결
  .query("CREATE INDEX CONCURRENTLY 변경_이름 ON 변경시험 (이름)")
  .then(() => "색인 완성");

await 잠깐(30);

let 쓰기됐나 = "됨";

try {
  await 쓰는사람.query("SET lock_timeout = '2s'");
  await 쓰는사람.query("INSERT INTO 변경시험 VALUES (900001, '색인만드는중에넣음', 7)");
} catch (에러) {
  쓰기됐나 = 에러.code;
}

console.log("CONCURRENTLY 로 색인 만드는 중에 INSERT:", 쓰기됐나);
// 출력: CONCURRENTLY 로 색인 만드는 중에 INSERT: 됨

console.log(await 색인만드는중, `(${(performance.now() - 색인시작).toFixed(0)} ms)`);
// 출력?: 색인 완성 (198 ms)

await 쓰는사람.end();

// ── 왜 하나는 막고 하나는 안 막나 — **잠금 종류**가 다릅니다 ──
//
// 위의 실험은 "색인을 만드는 동안" 을 노려야 해서 타이밍을 맞춰야 합니다.
// 표가 작으면 색인이 순식간에 끝나서 실험 자체가 어긋납니다.
//
// ★ 그래서 **색인이 잡는 것과 같은 잠금을 직접 걸어** 봅니다. 타이밍이 필요 없습니다.
//
//   CREATE INDEX                → SHARE                    ★ 쓰기를 막습니다
//   CREATE INDEX CONCURRENTLY   → SHARE UPDATE EXCLUSIVE     안 막습니다
//
//   07단원의 잠금 표를 다시 보세요. SHARE 는 INSERT 가 잡는 ROW EXCLUSIVE 와
//   부딪히고, SHARE UPDATE EXCLUSIVE 는 안 부딪힙니다.

async function 이잠금중에쓰기가되나(잠금종류, 번호) {
  const 쓰려는이 = await 새연결("unit10-lockmode");

  await 연결.query("BEGIN");
  await 연결.query(`LOCK TABLE 변경시험 IN ${잠금종류} MODE`);

  await 쓰려는이.query("SET lock_timeout = '400ms'");

  let 됐나 = true;

  try {
    await 쓰려는이.query("INSERT INTO 변경시험 VALUES ($1, '잠금시험', 1)", [번호]);
  } catch {
    됐나 = false; // 55P03 — 잠금을 못 잡았습니다
  }

  await 연결.query("ROLLBACK");
  await 쓰려는이.end();

  return 됐나;
}

const 보통일때쓰기 = await 이잠금중에쓰기가되나("SHARE", 900002);
const 동시일때쓰기 = await 이잠금중에쓰기가되나("SHARE UPDATE EXCLUSIVE", 900003);

console.log("보통 색인의 잠금(SHARE) 중에 쓰기가 되나:", 보통일때쓰기);
// 출력: 보통 색인의 잠금(SHARE) 중에 쓰기가 되나: false

console.log("CONCURRENTLY 의 잠금(SHARE UPDATE EXCLUSIVE) 중에 쓰기가 되나:", 동시일때쓰기);
// 출력: CONCURRENTLY 의 잠금(SHARE UPDATE EXCLUSIVE) 중에 쓰기가 되나: true

// ★★★ **이게 CONCURRENTLY 를 쓰는 진짜 이유입니다.**
//   빨라서가 아닙니다. 오히려 표를 두 번 훑어서 대체로 **더 느립니다.**
//   그 느림을 감수하고 쓰는 것입니다. 서비스가 안 멈추니까요.
//
//   섹션 1 에서 잰 시간 차이는 표가 작아서 얼마 안 났습니다.
//   ★ 그런데 시간은 재는 기계와 그때 부하에 따라 흔들립니다.
//     **잠금은 안 흔들립니다.** 그래서 판단은 잠금으로 하세요.

// ★★★ 그런데 **트랜잭션 안에서는 못 씁니다.**
//   08단원에서 봤던 그 에러입니다. 마이그레이션 도구가 파일마다 BEGIN 을 걸기 때문에
//   이 문장만 예외로 빼야 합니다.

let 트랜잭션안 = "성공";

try {
  await 연결.query("BEGIN; CREATE INDEX CONCURRENTLY 안됨 ON 변경시험 (수량); COMMIT;");
} catch (에러) {
  트랜잭션안 = `${에러.code} — ${에러.message}`;
}

await 연결.query("ROLLBACK").catch(() => {});

console.log("트랜잭션 안에서 CONCURRENTLY:", 트랜잭션안);
// 출력: 트랜잭션 안에서 CONCURRENTLY: 25001 — CREATE INDEX CONCURRENTLY cannot run inside a transaction block

// ★★ CONCURRENTLY 의 대가
//   · 표를 **두 번** 훑습니다. 그래서 더 오래 걸립니다 (섹션 1 에서 쟀습니다)
//   · 중간에 실패하면 **못 쓰는 색인**이 남습니다. 이게 함정입니다
//
// 못 쓰는 색인은 이렇게 찾습니다. 운영에서 꼭 확인하세요.
//
//   SELECT indexrelid::regclass AS 색인 FROM pg_index WHERE NOT indisvalid;
//
// 찾으면 `DROP INDEX CONCURRENTLY 이름;` 으로 지우고 다시 만드세요.

const 망가진색인 = await 연결.query(`
  SELECT count(*)::int AS 개수 FROM pg_index i
  JOIN pg_class c ON c.oid = i.indrelid
  WHERE NOT i.indisvalid AND c.relnamespace = '단원10'::regnamespace
`);

console.log("지금 못 쓰는 색인 개수:", 망가진색인.rows[0].개수);
// 출력: 지금 못 쓰는 색인 개수: 0


// ── 섹션 5: ★★★ 확장 → 이전 → 축소 ──

// 여기가 이 파일의 결론입니다.
//
// **`설비.이름` 을 `설비.설비명` 으로 바꾸고 싶습니다.**
//
// 한 줄이면 됩니다.
//     ALTER TABLE 설비 RENAME COLUMN 이름 TO 설비명;
//
// ★ 이 한 줄은 빠릅니다. 잠금도 짧습니다.
//   **그런데 이걸 하는 순간 옛 코드가 전부 깨집니다.**
//   아직 배포가 안 끝난 서버들이 `이름` 을 찾고 있으니까요. 42703 입니다.
//
// 그래서 세 번에 나눕니다. 배포도 세 번 합니다.

await 연결.query("DROP TABLE IF EXISTS 무중단설비 CASCADE");

await 연결.query(`
  CREATE TABLE 무중단설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인     TEXT NOT NULL
  )
`);

await 연결.query("INSERT INTO 무중단설비 VALUES (1, '프레스1호', 'A'), (2, '절삭기1호', 'B')");

// 옛 코드와 새 코드를 함수로 흉내 냅니다. 둘 다 계속 돌아야 합니다.
const 옛코드가읽기 = async () =>
  (await 연결.query("SELECT 이름 FROM 무중단설비 WHERE 설비번호 = 1")).rows[0].이름;

const 새코드가읽기 = async () =>
  (await 연결.query("SELECT 설비명 FROM 무중단설비 WHERE 설비번호 = 1")).rows[0].설비명;

const 옛코드가쓰기 = (번호, 값) =>
  연결.query("INSERT INTO 무중단설비 (설비번호, 이름, 라인) VALUES ($1, $2, 'A')", [번호, 값]);

const 새코드가쓰기 = (번호, 값) =>
  연결.query("INSERT INTO 무중단설비 (설비번호, 설비명, 라인) VALUES ($1, $2, 'A')", [번호, 값]);

const 해보기 = async (할일) => {
  try {
    return await 할일();
  } catch (에러) {
    return `실패(${에러.code})`;
  }
};

// ── 0단계: 지금 상태 ──
console.log(`0단계 — 옛 코드: ${await 해보기(옛코드가읽기)} / 새 코드: ${await 해보기(새코드가읽기)}`);
// 출력: 0단계 — 옛 코드: 프레스1호 / 새 코드: 실패(42703)

// ── 1단계 (확장): 새 칸을 **더합니다.** 옛 칸은 그대로 둡니다 ──
//
// ★ 이 배포에서는 코드를 안 바꿉니다. 스키마만 바꿉니다.
//   칸 추가는 2ms 입니다 (섹션 1). 안전합니다.

await 연결.query("SET lock_timeout = '3s'");
await 연결.query("ALTER TABLE 무중단설비 ADD COLUMN 설비명 TEXT");

// ★★ 그리고 **양쪽을 자동으로 맞춰 주는 트리거**를 답니다.
//   이게 없으면 옛 코드가 넣은 줄은 `설비명` 이 비고,
//   새 코드가 넣은 줄은 `이름` 이 비어서 NOT NULL 에 걸립니다(23502).
await 연결.query(`
  CREATE FUNCTION 이름맞추기() RETURNS trigger AS $$
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      -- 어느 쪽이 바뀌었는지 보고 반대쪽에 옮겨 씁니다
      IF NEW.이름 IS DISTINCT FROM OLD.이름 THEN
        NEW.설비명 := NEW.이름;
      ELSIF NEW.설비명 IS DISTINCT FROM OLD.설비명 THEN
        NEW.이름 := NEW.설비명;
      END IF;
    ELSE
      -- INSERT: 채워진 쪽을 빈 쪽에 복사합니다
      NEW.설비명 := COALESCE(NEW.설비명, NEW.이름);
      NEW.이름   := COALESCE(NEW.이름, NEW.설비명);
    END IF;

    RETURN NEW;
  END $$ LANGUAGE plpgsql
`);

await 연결.query(`
  CREATE TRIGGER 이름맞추기트리거 BEFORE INSERT OR UPDATE ON 무중단설비
  FOR EACH ROW EXECUTE FUNCTION 이름맞추기()
`);

console.log(`1단계 — 옛 코드: ${await 해보기(옛코드가읽기)} / 새 코드: ${(await 해보기(새코드가읽기)) ?? "(아직 비어 있음)"}`);
// 출력: 1단계 — 옛 코드: 프레스1호 / 새 코드: (아직 비어 있음)

// ── 2단계 (이전): 값을 옮깁니다. 그리고 새 코드를 배포합니다 ──
//
// ★ 큰 표라면 이 UPDATE 도 나눠서 하세요. (03단원)
//   한 번에 하면 표가 두 배로 부풉니다 (개념03).

await 연결.query("UPDATE 무중단설비 SET 설비명 = 이름 WHERE 설비명 IS NULL");

console.log(`2단계 — 옛 코드: ${await 해보기(옛코드가읽기)} / 새 코드: ${await 해보기(새코드가읽기)}`);
// 출력: 2단계 — 옛 코드: 프레스1호 / 새 코드: 프레스1호

// ★★ 이 시점이 08단원의 그 "10:02" 입니다. 두 버전이 같이 돕니다.
//   양쪽에서 넣어 보고 둘 다 되는지 확인합니다.

await 옛코드가쓰기(10, "옛코드가넣음");
await 새코드가쓰기(11, "새코드가넣음");

const 양쪽확인 = await 연결.query(`
  SELECT 설비번호, 이름, 설비명 FROM 무중단설비 WHERE 설비번호 IN (10, 11) ORDER BY 설비번호
`);

for (const 줄 of 양쪽확인.rows) console.log(`  ${줄.설비번호}번 — 이름:${줄.이름} 설비명:${줄.설비명}`);
// 출력:   10번 — 이름:옛코드가넣음 설비명:옛코드가넣음
// 출력:   11번 — 이름:새코드가넣음 설비명:새코드가넣음

console.log("양쪽 칸이 다 채워졌나:", 양쪽확인.rows.every((줄) => 줄.이름 === 줄.설비명));
// 출력: 양쪽 칸이 다 채워졌나: true

// 고치는 것도 양쪽에서 되는지 봅니다.
await 연결.query("UPDATE 무중단설비 SET 이름 = '옛코드가고침' WHERE 설비번호 = 10");
await 연결.query("UPDATE 무중단설비 SET 설비명 = '새코드가고침' WHERE 설비번호 = 11");

const 고친뒤 = await 연결.query(`
  SELECT 설비번호, 이름, 설비명 FROM 무중단설비 WHERE 설비번호 IN (10, 11) ORDER BY 설비번호
`);

console.log("고쳐도 양쪽이 맞나:", 고친뒤.rows.every((줄) => 줄.이름 === 줄.설비명));
// 출력: 고쳐도 양쪽이 맞나: true

// ── 3단계 (축소): 며칠 뒤, 모든 서버가 새 코드가 된 뒤에 옛 칸을 지웁니다 ──
//
// ★★ **같은 날 하지 마세요.**
//   되돌릴 일이 생길 수 있습니다. 옛 칸이 남아 있으면 옛 코드로 되돌릴 수 있습니다.
//   지우고 나면 못 돌아갑니다.

await 연결.query("DROP TRIGGER 이름맞추기트리거 ON 무중단설비");
await 연결.query("DROP FUNCTION 이름맞추기()");
await 연결.query("ALTER TABLE 무중단설비 ALTER COLUMN 설비명 SET NOT NULL");
await 연결.query("ALTER TABLE 무중단설비 DROP COLUMN 이름");

console.log(`3단계 — 옛 코드: ${await 해보기(옛코드가읽기)} / 새 코드: ${await 해보기(새코드가읽기)}`);
// 출력: 3단계 — 옛 코드: 실패(42703) / 새 코드: 프레스1호

// ★★★ 정리하면 이렇습니다.
//
//   단계          스키마 변경                  코드 배포        옛 코드   새 코드
//   ──────────────────────────────────────────────────────────────────────────
//   0             —                            —               ✓        —
//   1 확장        새 칸 추가 + 동기화 트리거     안 함            ✓        —
//   2 이전        값 복사                       ★ 새 코드 배포    ✓        ✓
//   3 축소        트리거·옛 칸 제거              안 함            ✗        ✓
//
//   배포가 세 번 필요합니다. 귀찮습니다.
//   ★ 그런데 이게 **유일하게 안 죽는 방법**입니다.
//
// ★ 트리거 대신 새 코드가 **양쪽에 다 쓰게** 만들어도 됩니다.
//   그러면 DB 에 트리거를 안 걸어도 됩니다. 대신 코드가 지저분해집니다.
//   표가 크고 쓰기가 많으면 트리거가 낫습니다. 놓치는 경로가 없으니까요.


// ── 섹션 6: 위험한 변경 목록 ──

// 마이그레이션을 리뷰할 때 이 목록을 보세요.
//
//   변경                    왜 위험한가                    안전한 방법
//   ──────────────────────────────────────────────────────────────────────────
//   칸 이름 바꾸기           옛 코드가 옛 이름을 찾음        확장 → 이전 → 축소
//   칸 지우기               옛 코드가 그 칸에 씀            안 쓰게 만들고 며칠 뒤
//   NOT NULL 추가           NULL 이 있으면 실패(23502)      기본값 → 채우기 → CHECK → 걸기
//   타입 좁히기·바꾸기       표를 통째로 다시 씀             새 칸 만들어 옮기기
//   색인 만들기             쓰기를 막음                    CONCURRENTLY (트랜잭션 밖)
//   외래키 추가             양쪽 표를 다 잠그고 전부 검사    NOT VALID 로 걸고 나중에 VALIDATE
//   UNIQUE 추가             색인을 만드는 것과 같음          CONCURRENTLY 로 만들고 붙이기
//
// ★ 큰 표에 NOT NULL 을 안 멈추고 거는 방법
//
//     ALTER TABLE 설비 ADD CONSTRAINT 담당자_있음
//       CHECK (담당자 IS NOT NULL) NOT VALID;      -- 즉시. 새 줄만 검사합니다
//     ALTER TABLE 설비 VALIDATE CONSTRAINT 담당자_있음;  -- 훑지만 안 막습니다
//
//   `NOT VALID` 가 핵심입니다. 붙이는 것은 즉시, 검사는 나중에 천천히.

// 외래키를 NOT VALID 로 붙여 보면 얼마나 빠른지 재 봅니다.
await 연결.query("DROP TABLE IF EXISTS 자식표 CASCADE");
await 연결.query("CREATE TABLE 자식표 (번호 INT PRIMARY KEY, 부모 INT NOT NULL)");
await 연결.query("INSERT INTO 자식표 SELECT g, (g % 200000) + 1 FROM generate_series(1, 200000) g");
await 연결.query("VACUUM ANALYZE 자식표");

const 낫밸리드 = await 재기(
  "ALTER TABLE 자식표 ADD CONSTRAINT 자식_부모_fk FOREIGN KEY (부모) REFERENCES 변경시험(번호) NOT VALID",
);

const 검사하기 = await 재기("ALTER TABLE 자식표 VALIDATE CONSTRAINT 자식_부모_fk");

console.log(`외래키 붙이기 NOT VALID: ${낫밸리드.toFixed(1)} ms / 나중에 VALIDATE: ${검사하기.toFixed(1)} ms`);
// 출력?: 외래키 붙이기 NOT VALID: 5.7 ms / 나중에 VALIDATE: 52.9 ms

console.log("NOT VALID 로 붙이는 게 훨씬 빠른가:", 낫밸리드 < 검사하기);
// 출력: NOT VALID 로 붙이는 게 훨씬 빠른가: true

// ★ 둘 다 해야 하는 건 같습니다. 그런데 **잠그는 시간**이 다릅니다.
//   NOT VALID 는 카탈로그만 고치고 끝냅니다. VALIDATE 는 훑지만 쓰기를 안 막습니다.
//   한 번에 붙이면 훑는 **동안 내내** 강한 잠금을 쥡니다.


// 뒷정리
await 연결.query("DROP TABLE IF EXISTS 자식표, 변경시험, 무중단설비 CASCADE");
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   변경                              표를 다시 쓰나   표가 커지면
//   ──────────────────────────────────────────────────────────────────────
//   ADD COLUMN (기본값 있든 없든)      ✗              그대로 (몇 ms)
//   SET NOT NULL                      ✗ (훑기만)      비례해서 늘어남
//   VARCHAR 넓히기                     ✗              그대로 (몇 ms)
//   VARCHAR 좁히기                     ★ ✓            비례 — 큰 표는 못 함
//   타입 바꾸기 (INT → TEXT)           ★ ✓            비례 — 큰 표는 못 함
//   CREATE INDEX                      ✗ (쓰기 막음)   비례
//   CREATE INDEX CONCURRENTLY         ✗ (안 막음)     비례 (보통의 1.5배쯤)
//   외래키 NOT VALID                   ✗              그대로 (몇 ms)
//   외래키 VALIDATE                    ✗ (안 막음)     비례
//
//   확인하는 법                                무엇을 알 수 있나
//   ──────────────────────────────────────────────────────────────────────
//   ALTER 전후의 pg_class.relfilenode 비교      ★ 표를 다시 썼는지 (흔들리지 않음)
//   LOCK TABLE ... IN <종류> MODE 걸어 보기      그 잠금이 쓰기를 막는지
//   pg_blocking_pids(pid)                      누가 나를 막고 있는지 (07단원)
//   pg_index.indisvalid = false                CONCURRENTLY 가 실패해 남은 색인
//
//   설정               무엇을 재나                운영 마이그레이션 값
//   ──────────────────────────────────────────────────────────────────────
//   lock_timeout       잠금을 기다리는 시간        3s  (★ 반드시 거세요)
//   statement_timeout  문장 전체 시간             ALTER 에는 걸지 마세요
//
//   에러코드   뜻
//   ──────────────────────────────────────────────────────────────────────
//   55P03     잠금을 못 잡음 (lock_timeout) — ★ 좋은 실패입니다. 다시 하세요
//   25001     트랜잭션 안에서 못 쓰는 명령 (CONCURRENTLY, VACUUM)
//   42703     없는 칸 — 옛 코드가 지운 칸을 찾을 때
//   23502     NOT NULL 위반 — 새 코드가 안 채운 옛 칸
//
// ★★★ 꼭 기억할 것
//   ① **배포 중에는 옛 코드와 새 코드가 같이 돕니다.** 그 사이에 안 깨져야 합니다
//   ② 칸 추가는 카탈로그만 고칩니다. 타입 좁히기·바꾸기는 **표를 통째로 다시 씁니다**
//      ★ 시간이 아니라 `relfilenode` 가 바뀌는지로 확인하세요. 시간은 흔들립니다
//   ③ ★★ 진짜 사고는 ALTER 가 **기다리는 동안** 납니다. 뒤의 SELECT 까지 막힙니다
//   ④ 운영 마이그레이션에는 **항상 `SET lock_timeout`** 을 거세요. 실패는 괜찮습니다
//   ⑤ 색인은 `CONCURRENTLY`. 단, 트랜잭션 밖에서만 (25001)
//   ⑥ 이름 바꾸기·칸 지우기는 **확장 → 이전 → 축소**. 배포 세 번입니다
//   ⑦ 축소는 며칠 뒤에 하세요. 그래야 되돌릴 수 있습니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 의 20만 건을 100만 건으로 늘려 보세요.
//                    칸 추가 시간이 5배가 되나요? 타입 바꾸기는 어떤가요?
//
// ✏️ 직접 해보기 2 — 섹션 1 에 `ALTER TABLE 변경시험 ADD COLUMN 새것 INT DEFAULT 0 NOT NULL`
//                    을 넣어 보세요. Postgres 11+ 에서는 이것도 빠릅니다. 왜일까요?
//
// ✏️ 직접 해보기 3 — 섹션 2 에서 ③ 의 SELECT 를 ALTER 보다 **먼저** 던져 보세요.
//                    이번엔 막히나요? 순서가 왜 중요한지 알 수 있습니다.
//
// ✏️ 직접 해보기 4 — 섹션 3 의 `150ms` 를 `10s` 로 바꿔 보세요.
//                    파일이 얼마나 오래 멈추나요? 운영이라면 어떤 일이 날까요?
//
// ✏️ 직접 해보기 5 — 섹션 4 의 `CONCURRENTLY` 를 빼고 돌려 보세요.
//                    색인 만드는 중에 INSERT 가 되나요? (힌트: lock_timeout 이 걸려 있습니다)
//
// ✏️ 직접 해보기 6 — 섹션 5 의 트리거를 만들지 말고 2단계를 해 보세요.
//                    `새코드가쓰기(11, ...)` 가 어떤 에러를 내나요? (힌트: 23502)
//
// ✏️ 직접 해보기 7 — 섹션 5 의 3단계에서 `DROP COLUMN 이름` 만 하고
//                    트리거는 그대로 둬 보세요. 무슨 일이 나나요?
//
// ✏️ 직접 해보기 8 — 섹션 6 의 `NOT VALID` 를 빼고 외래키를 붙여 보세요.
//                    시간이 얼마나 차이 나나요?


// ── 자주 하는 실수 ──

// [실수 1] `RENAME COLUMN` 을 그냥 실행함
//   빠르고 잠금도 짧습니다. 그래서 안전해 보입니다.
//   ★ 그런데 아직 배포 안 끝난 서버가 42703 으로 전부 죽습니다.
//   확장 → 이전 → 축소로 나누세요.

// [실수 2] `lock_timeout` 없이 ALTER 를 날림
//   앞에 긴 트랜잭션이 있으면 무한정 기다립니다.
//   ★ 그동안 뒤의 모든 쿼리가 같이 막혀서 서비스가 죽습니다. 섹션 2 그대로입니다.

// [실수 3] `statement_timeout` 을 걸고 ALTER 를 함
//   표를 다시 쓰는 중에 잘립니다. 그 시간이 통째로 날아가고 처음부터입니다.
//   ★ ALTER 에는 `lock_timeout` 만 거세요.

// [실수 4] 새벽에 하니까 괜찮다고 생각함
//   새벽에는 배치와 백업이 돕니다. 오히려 긴 트랜잭션이 더 많습니다.
//   ★ 시간대보다 `lock_timeout` 과 재시도가 확실합니다.

// [실수 5] 확장과 축소를 같은 배포에 넣음
//   그러면 나눈 의미가 없습니다. 옛 코드가 그 순간 깨집니다.
//   ★ 축소는 **다음 배포**에, 되도록 며칠 뒤에 하세요.

// [실수 6] CONCURRENTLY 를 마이그레이션 파일에 그냥 넣음
//   도구가 BEGIN 을 걸어서 25001 로 실패합니다.
//   ★ "이 파일은 트랜잭션 없이" 표시를 지원하는지 확인하고 쓰세요. (08단원)

// [실수 7] CONCURRENTLY 실패를 안 확인함
//   실패하면 **못 쓰는 색인**이 조용히 남습니다. 자리는 차지하는데 안 쓰입니다.
//   ★ `SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;` 로 확인하세요.

// [실수 8] 큰 표에 NOT NULL 을 한 번에 걸음
//   표 전체를 훑는 동안 강한 잠금을 쥡니다.
//   ★ `CHECK ... NOT VALID` → `VALIDATE CONSTRAINT` 로 나누세요.
