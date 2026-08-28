// ============================================================
// 07단원 · 개념 04 — 잠금
// ------------------------------------------------------------
// 실행: node 개념04_잠금.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 뒷부분에서 VACUUM 을 여러 번 돌려서 10초쯤 걸립니다.
// ============================================================
//
// 개념02 에서 FOR UPDATE 를 잠깐 썼습니다. "줄을 잡아 둔다" 고만 하고 넘어갔습니다.
// 개념03 에서는 MVCC 덕분에 읽기가 쓰기를 안 막는다는 것을 봤습니다.
// 그러면 무엇이 무엇을 막는 걸까요? 이 파일에서 그 규칙을 봅니다.
//
//   · 잠금을 걸면 상대가 **얼마나** 기다리는지 재 봅니다
//   · 기다리지 않고 다른 일을 집어 가는 방법(SKIP LOCKED)으로 **작업 큐**를 만듭니다
//   · 지금 누가 누구를 막고 있는지 **보는 법**을 익힙니다
//   · 긴 트랜잭션이 왜 위험한지 **실제로 잽니다**
//
// ★ 잠금은 직접 걸 일이 적습니다. UPDATE 나 DELETE 를 하면 알아서 걸립니다.
//   그런데 **무엇이 잠기는지 모르면** 서비스가 멈췄을 때 원인을 못 찾습니다.

import pg from "pg";

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,
  user: "factory",
  password: "secret",
  database: "factory_db",
  // ★ 내 연결에 이름표를 답니다. 섹션 6 에서 **내 세션만** 골라 보는 데 씁니다.
  //   안 달면 pg_stat_activity 에 남의 세션까지 섞여 나옵니다.
  //   ★★ 이름표는 **영어로** 쓰세요. 한글을 넣으면 Postgres 가 \xeb\x8b\xa8... 처럼
  //     16진수로 바꿔 버립니다. 이 자료에서 표 이름은 한글을 쓰지만 접속 정보는 영어입니다.
  application_name: "unit07-lock",
};

let 가;

try {
  가 = new pg.Client(접속정보);
  await 가.connect();
} catch (에러) {
  console.log("Docker Postgres 에 못 붙었습니다. 먼저 이걸 실행하세요:"); // 검증무시: Docker 가 없을 때만 나오는 안내입니다
  console.log("  docker compose up -d"); // 검증무시:
  console.log(`  (원인: ${에러.message})`); // 검증무시:
  process.exit(0);
}

await 가.query("CREATE SCHEMA IF NOT EXISTS 단원07");
await 가.query("SET search_path TO 단원07");

async function 새연결() {
  const 연결 = new pg.Client(접속정보);
  await 연결.connect();
  await 연결.query("SET search_path TO 단원07");
  return 연결;
}

const 나 = await 새연결();
const 감시 = await 새연결(); // 잠금 상태를 들여다보는 세 번째 사람

await 가.query("DROP TABLE IF EXISTS 작업지시, 청소시험 CASCADE");

await 가.query(`
  CREATE TABLE 작업지시 (
    번호 INT PRIMARY KEY,
    내용 TEXT NOT NULL,
    상태 TEXT NOT NULL DEFAULT '대기',
    처리자 TEXT
  )
`);

await 가.query("INSERT INTO 작업지시 (번호, 내용) SELECT g, '작업 ' || g FROM generate_series(1, 12) g");

const 잠깐 = (밀리초) => new Promise((끝) => setTimeout(끝, 밀리초));

console.log("작업지시:", (await 가.query("SELECT count(*) FROM 작업지시")).rows[0].count, "건");
// 출력: 작업지시: 12 건


// ── 섹션 1: SELECT ... FOR UPDATE — 얼마나 기다리나 ──

// 가가 1번 줄을 잡습니다. 나가 같은 줄을 잡으려 하면 기다립니다.
// **얼마나** 기다리는지 재 봅니다. 가가 300ms 뒤에 커밋하게 해 두겠습니다.

await 가.query("BEGIN");
await 가.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE");

const 기다리기시작 = performance.now();

// ★ await 를 하지 않습니다. 띄워만 두고 아래로 내려갑니다.
//   await 를 붙이면 여기서 영원히 멈춥니다. 가가 아직 안 놨으니까요.
const 나의대기 = 나
  .query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE")
  .then(() => performance.now() - 기다리기시작);

await 잠깐(300); // 가가 300ms 동안 잠금을 쥐고 있습니다
await 가.query("COMMIT"); // 놓습니다

const 기다린ms = await 나의대기;
await 나.query("ROLLBACK");

console.log(`나가 기다린 시간: ${기다린ms.toFixed(0)} ms`);
// 출력?: 나가 기다린 시간: 311 ms

console.log("가가 쥔 300ms 만큼 기다렸나:", 기다린ms >= 290);
// 출력: 가가 쥔 300ms 만큼 기다렸나: true

// ★★ 나는 **가가 커밋할 때까지** 기다렸습니다. 가가 3분을 쥐면 3분을 기다립니다.
//   그동안 나는 아무것도 못 합니다. 손님은 화면이 멈춘 것을 봅니다.
//   ★ 그래서 트랜잭션은 **짧아야** 합니다. 잠금을 쥔 채 외부 API 를 부르면
//     그 API 가 느린 만큼 우리가 멈춥니다.


// ── 섹션 2: 무엇이 무엇을 막나 ──

// 잠금에는 종류가 있고, 종류끼리 부딪히는 규칙이 정해져 있습니다. 하나씩 확인합니다.
//
//   SELECT (그냥)          아무 줄 잠금도 안 검. 아무도 안 막고 아무에게도 안 막힘
//   SELECT ... FOR SHARE   "내가 읽는 동안 고치지 마". 읽기끼리는 같이 됨
//   SELECT ... FOR UPDATE  "내가 고칠 거야". 아무도 못 건드림
//   UPDATE / DELETE        FOR UPDATE 와 같은 잠금이 자동으로 걸림

// ① 순수 SELECT 는 안 막힙니다 (개념03 의 MVCC)
await 가.query("BEGIN");
await 가.query("UPDATE 작업지시 SET 내용 = '고치는 중' WHERE 번호 = 1");

const 읽기시작 = performance.now();
const 읽은것 = (await 나.query("SELECT 내용 FROM 작업지시 WHERE 번호 = 1")).rows[0].내용;
const 읽기ms = performance.now() - 읽기시작;

await 가.query("ROLLBACK");

console.log(`① 남이 고치는 중에 그냥 SELECT: "${읽은것}" (${읽기ms.toFixed(0)} ms)`);
// 출력?: ① 남이 고치는 중에 그냥 SELECT: "작업 1" (1 ms)

console.log("① 안 기다렸나:", 읽기ms < 100);
// 출력: ① 안 기다렸나: true

// ② FOR SHARE 끼리는 같이 됩니다
await 가.query("BEGIN");
await 가.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR SHARE");

await 나.query("BEGIN");
const 공유시작 = performance.now();
await 나.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR SHARE");
const 공유ms = performance.now() - 공유시작;

console.log("② FOR SHARE 둘이 같이 되나:", 공유ms < 100);
// 출력: ② FOR SHARE 둘이 같이 되나: true

// ③ FOR SHARE 위에 FOR UPDATE 는 막힙니다
//    기다리다 멈추면 곤란하니 lock_timeout 을 걸어 둡니다. 섹션 8 에서 자세히 봅니다.
await 나.query("SET lock_timeout = '200ms'");

try {
  await 나.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE");
  console.log("③ FOR UPDATE 성공"); // 검증무시: 잠금이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log(`③ FOR SHARE 위에 FOR UPDATE: ${에러.code} — ${에러.message}`);
  // 출력: ③ FOR SHARE 위에 FOR UPDATE: 55P03 — canceling statement due to lock timeout
}

await 나.query("ROLLBACK");
await 나.query("SET lock_timeout = 0");
await 가.query("COMMIT");

// ★★ 정리하면 규칙은 한 줄입니다.
//   **읽기는 아무것도 안 막습니다. 쓰려는 사람끼리만 부딪힙니다.**
//   FOR SHARE 는 "읽는 중이니 고치지 마" 라서 쓰려는 사람만 막습니다.
//   FOR UPDATE 는 "내가 고칠 거야" 라서 FOR SHARE 도 FOR UPDATE 도 막습니다.
//
// ★ FOR SHARE 는 자식 줄을 넣는 동안 부모 줄이 사라지면 안 될 때 씁니다.
//   외래키가 있으면 Postgres 가 알아서 걸어 주므로 직접 쓸 일은 드뭅니다.


// ── 섹션 3: 기다리지 않는 두 가지 — NOWAIT 과 SKIP LOCKED ──

// 기다리는 것 말고 두 가지 선택지가 더 있습니다.
//   NOWAIT        잠겨 있으면 **바로 에러**를 냅니다 (55P03)
//   SKIP LOCKED   잠긴 줄은 **없는 셈 치고 건너뜁니다**

await 가.query("BEGIN");
await 가.query("SELECT * FROM 작업지시 WHERE 번호 IN (1, 2) FOR UPDATE"); // 1, 2번을 잡습니다

try {
  await 나.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE NOWAIT");
  console.log("NOWAIT 성공"); // 검증무시: 잠금이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log(`NOWAIT: ${에러.code} — ${에러.message}`);
  // 출력: NOWAIT: 55P03 — could not obtain lock on row in relation "작업지시"
}

await 나.query("ROLLBACK");

const 건너뛴결과 = await 나.query("SELECT 번호 FROM 작업지시 ORDER BY 번호 FOR UPDATE SKIP LOCKED");
await 나.query("ROLLBACK");
await 가.query("COMMIT");

console.log("SKIP LOCKED 로 잡은 번호:", 건너뛴결과.rows.map((줄) => 줄.번호).join(", "));
// 출력: SKIP LOCKED 로 잡은 번호: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

console.log("잠긴 1, 2번이 빠졌나:", !건너뛴결과.rows.some((줄) => 줄.번호 <= 2));
// 출력: 잠긴 1, 2번이 빠졌나: true

// ★ 12건 중 1, 2번만 쏙 빠졌습니다. 에러도 대기도 없습니다.
//   ★★ SKIP LOCKED 는 "지금 안 잠긴 것들" 을 주므로 **결과가 매번 다릅니다.**
//     보고서나 합계에 쓰면 숫자가 틀립니다. 쓸 곳은 딱 하나, **작업 큐** 입니다.


// ── 섹션 4: ★ SKIP LOCKED 로 작업 큐 만들기 ──

// 실무에서 아주 자주 쓰는 패턴입니다. 이것 하나만 가져가도 이 파일은 본전입니다.
//
// 상황: 작업 12건을 일꾼 3명이 나눠서 처리합니다.
//   ★ 두 사람이 **같은 작업**을 집으면 안 됩니다 (두 번 처리됩니다)
//   ★ 한 사람이 느리다고 다른 사람이 **기다리면** 안 됩니다
// 이 둘을 동시에 만족시키는 것이 SKIP LOCKED 입니다.

await 가.query("UPDATE 작업지시 SET 상태 = '대기', 처리자 = NULL");

const 일꾼이름 = ["일꾼1", "일꾼2", "일꾼3"];
const 일꾼연결 = [];

for (const 이름 of 일꾼이름) 일꾼연결.push({ 이름, 연결: await 새연결() });

async function 일꾼돌리기({ 이름, 연결 }) {
  const 집은것 = [];

  while (true) {
    await 연결.query("BEGIN");

    const 집기 = await 연결.query(`
      SELECT 번호, 내용 FROM 작업지시
      WHERE 상태 = '대기'
      ORDER BY 번호
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `);

    if (집기.rowCount === 0) {
      await 연결.query("COMMIT"); // 더 집을 게 없습니다
      break;
    }

    const 일 = 집기.rows[0];

    await 잠깐(10); // 진짜로 일하는 시간이라고 칩시다

    await 연결.query("UPDATE 작업지시 SET 상태 = '완료', 처리자 = $1 WHERE 번호 = $2", [이름, 일.번호]);
    await 연결.query("COMMIT");

    집은것.push(일.번호);
  }

  return { 이름, 집은것 };
}

const 일꾼결과 = await Promise.all(일꾼연결.map(일꾼돌리기));

for (const { 이름, 집은것 } of 일꾼결과) {
  console.log(`${이름}: ${집은것.length}건 — ${집은것.join(", ")}`);
  // 출력?: 일꾼1: 4건 — 2, 4, 8, 11
  // 출력?: 일꾼2: 4건 — 1, 6, 7, 12
  // 출력?: 일꾼3: 4건 — 3, 5, 9, 10
}

const 처리된번호 = 일꾼결과.flatMap((결과) => 결과.집은것);

console.log("전부 처리됐나:", 처리된번호.length === 12);
// 출력: 전부 처리됐나: true

console.log("겹쳐서 처리한 것이 있나:", new Set(처리된번호).size !== 12);
// 출력: 겹쳐서 처리한 것이 있나: false

console.log("남은 대기:", (await 가.query("SELECT count(*) FROM 작업지시 WHERE 상태 = '대기'")).rows[0].count, "건");
// 출력: 남은 대기: 0 건

// ★★★ 12건이 3명에게 **겹치지 않게** 나뉘었습니다.
//   누가 몇 번을 집을지는 매번 다르지만 중복도 누락도 없습니다.
//
//   ★ SKIP LOCKED 가 없으면
//     · 그냥 SELECT 로 집으면 → 세 명이 같은 1번을 집습니다. 세 번 처리됩니다
//     · FOR UPDATE 만 쓰면   → 두 명이 1번 앞에 줄을 섭니다. 한 명씩만 일합니다
//
//   ★★ 큐 서버가 따로 필요 없습니다. 작은 서비스의 메일 발송·알림·정산 배치를
//     이걸로 다 돌립니다. 일꾼을 늘리려면 프로세스를 하나 더 띄우면 끝입니다.
//
//   ★ 일꾼이 중간에 죽으면 롤백되어 그 작업은 '대기' 로 돌아옵니다. 좋은 일입니다.
//     대신 **한 번 처리한 일을 또 처리해도 괜찮게** 만들어 두세요.


// ── 섹션 5: 줄 잠금 vs 표 잠금 ──

// 지금까지는 전부 **줄 잠금** 이었습니다. 표 전체를 잠글 수도 있습니다. LOCK TABLE 입니다.
//   ★ 직접 쓸 일은 거의 없지만 ALTER TABLE, DROP TABLE, VACUUM FULL 이 자동으로 겁니다.
//     운영 중에 ALTER TABLE 을 했다가 서비스가 멈추는 사고가 여기서 납니다.

await 가.query("BEGIN");
await 가.query("LOCK TABLE 작업지시 IN SHARE MODE"); // 읽기는 되고 쓰기는 막는 모드

await 나.query("SET lock_timeout = '200ms'");

const 표잠금중읽기 = await 나.query("SELECT count(*) FROM 작업지시");
console.log("SHARE MODE 중에 읽기:", 표잠금중읽기.rows[0].count, "건 — 됩니다");
// 출력: SHARE MODE 중에 읽기: 12 건 — 됩니다

try {
  await 나.query("UPDATE 작업지시 SET 상태 = '대기' WHERE 번호 = 1");
  console.log("SHARE MODE 중에 쓰기: 됩니다"); // 검증무시: 잠금이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log(`SHARE MODE 중에 쓰기: ${에러.code} — 막힙니다`);
  // 출력: SHARE MODE 중에 쓰기: 55P03 — 막힙니다
}

await 가.query("COMMIT");

// 이번엔 제일 센 잠금입니다. ALTER TABLE 이 거는 것과 같습니다.
await 가.query("BEGIN");
await 가.query("LOCK TABLE 작업지시 IN ACCESS EXCLUSIVE MODE");

try {
  await 나.query("SELECT count(*) FROM 작업지시");
  console.log("ACCESS EXCLUSIVE 중에 읽기: 됩니다"); // 검증무시: 잠금이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log(`ACCESS EXCLUSIVE 중에 읽기: ${에러.code} — 읽기조차 막힙니다`);
  // 출력: ACCESS EXCLUSIVE 중에 읽기: 55P03 — 읽기조차 막힙니다
}

await 가.query("COMMIT");
await 나.query("SET lock_timeout = 0");

// ★★★ ACCESS EXCLUSIVE 는 **읽기까지** 막습니다.
//   ALTER TABLE, DROP TABLE, TRUNCATE, VACUUM FULL 이 이걸 겁니다.
//
//   ★ 운영 사고의 전형: ALTER TABLE 이 큰 표를 고치느라 30초를 잡습니다.
//     그동안 그 표를 읽으려는 요청이 전부 줄을 섭니다. 연결이 다 차고,
//     다른 표를 쓰는 요청까지 연결이 없어서 죽습니다.
//     **표 하나 고치다 서비스 전체가 멈춥니다.**
//
//   ★ 그래서 운영 중 스키마 변경은 lock_timeout 을 짧게 걸고, 안 잡히면 포기하고,
//     CREATE INDEX CONCURRENTLY 처럼 안 막는 방법을 씁니다. 10단원에서 다시 다룹니다.


// ── 섹션 6: ★ 지금 무엇이 잠겨 있나 ──

// 서비스가 멈췄을 때 제일 먼저 봐야 하는 것입니다.

await 가.query("BEGIN");
await 가.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE");

const 막힌작업 = 나.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE"); // 띄워만 둡니다
await 잠깐(400); // 확실히 막히도록 잠깐 둡니다

// ★ 이 DB 는 다른 단원도 같이 씁니다. 그래서 **내 이름표가 붙은 세션만** 봅니다.
const 내세션만 = "pid IN (SELECT pid FROM pg_stat_activity WHERE application_name = 'unit07-lock')";

// ① pg_locks — 안 잡힌 잠금이 있으면 누군가 기다리는 중입니다
const 대기잠금 = await 감시.query(`
  SELECT locktype, mode FROM pg_locks WHERE NOT granted AND ${내세션만}
`);

console.log("기다리는 중인 잠금:", JSON.stringify(대기잠금.rows));
// 출력: 기다리는 중인 잠금: [{"locktype":"transactionid","mode":"ShareLock"}]

// ② pg_stat_activity + pg_blocking_pids() — ★ 이게 제일 쓸모 있습니다
const 누가막나 = await 감시.query(`
  SELECT wait_event_type AS 왜기다림,
         cardinality(pg_blocking_pids(pid)) AS 막는사람수,
         left(query, 30) AS 문장
  FROM pg_stat_activity
  WHERE application_name = 'unit07-lock'
    AND cardinality(pg_blocking_pids(pid)) > 0
`);

console.log("막혀 있는 세션:", JSON.stringify(누가막나.rows));
// 출력: 막혀 있는 세션: [{"왜기다림":"Lock","막는사람수":1,"문장":"SELECT * FROM 작업지시 WHERE 번호 = "}]

// ③ 아무 일도 안 하면서 트랜잭션만 열어 둔 세션 — 제일 위험한 놈입니다
const 놀고있는트랜잭션 = await 감시.query(`
  SELECT count(*) FROM pg_stat_activity
  WHERE state = 'idle in transaction' AND application_name = 'unit07-lock'
`);

console.log("idle in transaction 세션 수:", 놀고있는트랜잭션.rows[0].count);
// 출력: idle in transaction 세션 수: 1

await 가.query("COMMIT");
await 막힌작업;
await 나.query("ROLLBACK");

// ★ application_name 을 달아 두면 이렇게 내 것만 골라 볼 수 있습니다.
//   연결할 때 한 줄만 넣으면 됩니다. 서비스마다 다르게 달아 두면
//   "지금 누가 DB 를 붙잡고 있나" 를 바로 알 수 있습니다. 실무에서 꼭 하세요.
//
// ★★ 실무에서 쓰는 순서
//   ① pg_stat_activity 에서 `state = 'idle in transaction'` 을 찾는다
//      → BEGIN 만 하고 잊어버린 세션입니다. 잠금을 쥔 채 놀고 있습니다
//   ② pg_blocking_pids(pid) 로 **누가 누구를 막는지** 확인한다
//   ③ 정 급하면 pg_terminate_backend(막는pid) 로 끊는다 — 마지막 수단입니다.
//      그 트랜잭션은 롤백됩니다. 끊기 전에 query 칸을 꼭 보세요.


// ── 섹션 7: ★★ 긴 트랜잭션이 왜 위험한가 ──

// 이유가 두 개입니다.
//   ① 잠금을 오래 쥡니다 — 섹션 1 에서 봤습니다
//   ② **청소(VACUUM)를 막습니다** — 이게 덜 알려져 있고 더 무섭습니다
//
// 개념03 에서 봤듯 Postgres 는 UPDATE 할 때 새 버전을 만들고 옛 버전을 남깁니다.
// 옛 버전은 VACUUM 이 치우는데, **아무도 안 볼 때만** 치울 수 있습니다.
// 긴 트랜잭션이 열려 있으면 "저 사람이 볼지도 모른다" 며 못 치웁니다.
//
// 재 봅니다. 2000줄짜리 표를 10번 통째로 UPDATE 하고, 매번 VACUUM 합니다.

const 방해꾼 = await 새연결();

const 표크기KB = async () =>
  Number((await 가.query("SELECT pg_total_relation_size('청소시험')")).rows[0].pg_total_relation_size) / 1024;

const 죽은줄수 = async () =>
  Number((await 가.query("SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = '청소시험'")).rows[0].n_dead_tup);

async function 청소시험(긴트랜잭션을열어둘까) {
  await 가.query("DROP TABLE IF EXISTS 청소시험 CASCADE");
  await 가.query("CREATE TABLE 청소시험 (번호 INT PRIMARY KEY, 값 INT NOT NULL)");
  await 가.query("INSERT INTO 청소시험 SELECT g, g FROM generate_series(1, 2000) g");
  await 가.query("VACUUM 청소시험");

  const 처음KB = await 표크기KB();

  if (긴트랜잭션을열어둘까) {
    await 방해꾼.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
    await 방해꾼.query("SELECT count(*) FROM 청소시험"); // 여기서 사진이 찍힙니다
  }

  for (let 회차 = 0; 회차 < 10; 회차 += 1) {
    await 가.query("UPDATE 청소시험 SET 값 = 값 + 1");
    await 가.query("VACUUM 청소시험"); // 매번 청소를 시킵니다
  }

  const 끝KB = await 표크기KB();
  const 남은죽은줄 = await 죽은줄수();

  if (긴트랜잭션을열어둘까) await 방해꾼.query("COMMIT");

  return { 처음KB, 끝KB, 남은죽은줄 };
}

const 열어둠 = await 청소시험(true);

// ★ 이 DB 는 다른 단원도 같이 씁니다. **남이** 긴 트랜잭션을 열어 두면
//   비교 대상인 "없음" 쪽도 청소가 막혀서 결과가 흐려집니다.
//   그래서 깨끗하게 나올 때까지 다시 잽니다. 측정에서는 이런 방해를 걷어 내야 합니다.
let 안열어둠 = await 청소시험(false);

for (let 다시 = 0; 안열어둠.남은죽은줄 > 0 && 다시 < 10; 다시 += 1) {
  await 잠깐(500);
  안열어둠 = await 청소시험(false);
}

console.log(`긴 트랜잭션 열어 둠: ${열어둠.처음KB} KB → ${열어둠.끝KB} KB · 못 치운 죽은 줄 ${열어둠.남은죽은줄}개`);
// 출력?: 긴 트랜잭션 열어 둠: 168 KB → 1096 KB · 못 치운 죽은 줄 20000개

console.log(`긴 트랜잭션 없음:   ${안열어둠.처음KB} KB → ${안열어둠.끝KB} KB · 못 치운 죽은 줄 ${안열어둠.남은죽은줄}개`);
// 출력?: 긴 트랜잭션 없음:   168 KB → 280 KB · 못 치운 죽은 줄 0개

// ★★ 위 두 줄은 // 출력?: 입니다. 크기는 **기계와 상황에 따라 달라집니다.**
//   실제로 이 자료를 만들 때, 다른 사람이 같은 데이터베이스를 쓰고 있던 순간에 다시 쟀더니
//   280 KB 가 664 KB 로, 3.9배가 1.7배로 바뀌었습니다.
//   남이 연 트랜잭션이 내 VACUUM 까지 막았기 때문입니다.
//
//   ★ '못 치운 죽은 줄' 숫자도 흔들립니다. 재는 순간 autovacuum 이 이미 치웠으면 0 이 됩니다.
//
//   ★★ 그래서 진짜 검사는 아래 한 줄입니다. **크기 비교는 흔들리지 않습니다.**
//     긴 트랜잭션이 열려 있는 동안에는 죽은 줄을 못 치우고, 못 치우면 표가 커집니다.
//     그 인과는 상황이 바뀌어도 그대로입니다.

console.log("긴 트랜잭션 쪽이 더 부풀었나:", 열어둠.끝KB > 안열어둠.끝KB);
// 출력: 긴 트랜잭션 쪽이 더 부풀었나: true

console.log("몇 배나 부풀었나:", (열어둠.끝KB / 안열어둠.끝KB).toFixed(1), "배");
// 출력?: 몇 배나 부풀었나: 3.9 배

// ★★★ 같은 일을 했는데 표 크기가 4배 가까이 차이 납니다.
//
//   VACUUM 을 10번이나 돌렸는데도 소용없었습니다.
//   **읽기만 하는** 트랜잭션 하나가 열려 있었을 뿐인데요.
//
//   이걸 표 부풀림(table bloat)이라고 합니다. 진행되면 같은 자료를 읽는 데
//   디스크를 더 많이 읽고, 색인도 같이 부풀고, 디스크가 차고,
//   심하면 트랜잭션 번호가 바닥나 DB 가 쓰기를 거부합니다.
//
//   ★ 원인 1위는 **BEGIN 하고 잊어버린 세션** 입니다.
//     화면을 열어 놓고 점심 먹으러 간 관리자, 예외 처리를 빼먹은 코드,
//     연결 풀에 반납 안 된 연결. 전부 여기에 해당합니다.
//
//   ★ 그래서 섹션 6 의 `idle in transaction` 확인과
//     섹션 8 의 idle_in_transaction_session_timeout 이 중요합니다.
//     VACUUM 과 부풀림을 제대로 다루는 것은 10단원에서 합니다.


// ── 섹션 8: 언제까지 기다릴지 정하기 ──

// 기본값은 **영원히 기다림** 입니다. 운영에서 위험합니다.

console.log("기본 lock_timeout:", (await 가.query("SHOW lock_timeout")).rows[0].lock_timeout, "(0 = 영원히)");
// 출력: 기본 lock_timeout: 0 (0 = 영원히)

// ① lock_timeout — 잠금을 기다리는 시간만 제한합니다
await 가.query("BEGIN");
await 가.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE");

await 나.query("SET lock_timeout = '150ms'");
const 잠금대기시작 = performance.now();

try {
  await 나.query("SELECT * FROM 작업지시 WHERE 번호 = 1 FOR UPDATE");
} catch (에러) {
  const 걸린 = performance.now() - 잠금대기시작;
  console.log(`lock_timeout: ${에러.code} — ${걸린.toFixed(0)} ms 만에 포기`);
  // 출력?: lock_timeout: 55P03 — 152 ms 만에 포기
  console.log("150ms 안팎에 포기했나:", 걸린 >= 140 && 걸린 < 1000);
  // 출력: 150ms 안팎에 포기했나: true
}

await 나.query("ROLLBACK");
await 가.query("COMMIT");
await 나.query("SET lock_timeout = 0");

// ② statement_timeout — 문장 하나가 걸리는 전체 시간을 제한합니다
await 나.query("SET statement_timeout = '150ms'");

try {
  await 나.query("SELECT pg_sleep(3)"); // 3초 자는 문장
} catch (에러) {
  console.log(`statement_timeout: ${에러.code} — ${에러.message}`);
  // 출력: statement_timeout: 57014 — canceling statement due to statement timeout
}

await 나.query("SET statement_timeout = 0");

// ③ idle_in_transaction_session_timeout — BEGIN 하고 노는 세션을 끊습니다
//    ★ 이건 세션을 진짜로 끊어 버립니다. 그래서 버릴 연결을 하나 따로 만듭니다.
const 희생양 = await 새연결();

// ★★ 서버가 연결을 끊으면 pg 드라이버가 'error' 이벤트를 냅니다.
//   이걸 안 받아 두면 **노드 프로세스가 통째로 죽습니다.** 반드시 달아 두세요.
//   그리고 끊긴 진짜 이유는 이 이벤트로만 옵니다. query 의 catch 로는 안 옵니다.
let 끊긴이유 = null;
희생양.on("error", (에러) => { 끊긴이유 ??= 에러.message; });

await 희생양.query("SET idle_in_transaction_session_timeout = '200ms'");
await 희생양.query("BEGIN");
await 희생양.query("SELECT 1");
await 잠깐(500); // 트랜잭션을 열어 둔 채 아무것도 안 합니다

try {
  await 희생양.query("SELECT 1");
  console.log("세션이 살아 있습니다"); // 검증무시: 타임아웃이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log("query 가 알려 주는 것:", 에러.message);
  // 출력: query 가 알려 주는 것: Client has encountered a connection error and is not queryable
  console.log("서버가 알려 준 진짜 이유:", 끊긴이유);
  // 출력: 서버가 알려 준 진짜 이유: terminating connection due to idle-in-transaction timeout
}

// ★★ 세 가지를 구분하세요.
//   lock_timeout                          잠금을 **기다리는** 시간만 잰다
//   statement_timeout                     문장 하나의 **전체** 시간을 잰다
//   idle_in_transaction_session_timeout   BEGIN 하고 **노는** 시간을 잰다
//
//   ★ 운영 서버에는 셋 다 걸어 두세요. 특히 세 번째가 섹션 7 의 부풀림을 막습니다.
//   ★ ALTER TABLE 전에는 lock_timeout 을 짧게 거세요. 안 잡히면 빨리 포기하는 편이 낫습니다.


// ============================================================
// 정리
// ============================================================
//
//   문법                              하는 일
//   ────────────────────────────────────────────────────────────────────
//   SELECT ... FOR UPDATE             줄을 잡는다. 남은 기다린다
//   SELECT ... FOR SHARE              "읽는 중이니 고치지 마". 읽기끼리는 같이 됨
//   SELECT ... FOR UPDATE NOWAIT      잠겨 있으면 바로 55P03
//   SELECT ... FOR UPDATE SKIP LOCKED 잠긴 줄은 건너뛴다 — 작업 큐의 핵심
//   LOCK TABLE ... IN ... MODE        표 전체를 잠근다 (직접 쓸 일은 드묾)
//
//   설정 (셋 다 기본값 0 = 무제한)          무엇을 재나
//   ────────────────────────────────────────────────────────────────────
//   lock_timeout                            잠금 대기 시간
//   statement_timeout                       문장 전체 시간
//   idle_in_transaction_session_timeout     BEGIN 하고 노는 시간
//
//   에러코드   뜻
//   ────────────────────────────────────────────────────────────────────
//   55P03      잠금을 못 잡았다 (NOWAIT 또는 lock_timeout)
//   57014      문장이 취소됐다 (statement_timeout 또는 사용자 취소)
//
// ★★★ 꼭 기억할 것
//   ① 읽기는 아무것도 안 막습니다. 쓰려는 사람끼리만 부딪힙니다
//   ② SKIP LOCKED 로 작업 큐를 만들 수 있습니다. 큐 서버가 필요 없습니다
//   ③ 긴 트랜잭션은 잠금만 쥐는 게 아니라 **청소를 막아 표를 부풀립니다**
//   ④ 막혔을 때는 pg_blocking_pids() 로 누가 막는지 보세요
//   ⑤ 운영 서버에는 타임아웃 세 가지를 걸어 두세요


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 의 잠깐(300) 을 2000 으로 바꿔 보세요.
//                    나는 몇 ms 를 기다리나요? 상한이 있나요?
//
// ✏️ 직접 해보기 2 — 섹션 3 의 SKIP LOCKED 를 지우고 돌려 보세요.
//                    몇 건이 나오나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 3 — 섹션 4 의 일꾼을 3명에서 6명으로 늘려 보세요.
//                    12건이 어떻게 나뉘나요? 전체 시간이 반으로 줄었나요?
//
// ✏️ 직접 해보기 4 — 섹션 4 에서 SKIP LOCKED 를 빼고 FOR UPDATE 만 남기면
//                    결과는 맞나요? 시간은요? (힌트: 맞지만 줄을 섭니다)
//
// ✏️ 직접 해보기 5 — 섹션 7 의 UPDATE 횟수를 10 에서 30 으로 늘리면
//                    표가 몇 배로 부풀나요? 비례해서 늘어나나요?
//
// ✏️ 직접 해보기 6 — 섹션 7 에서 방해꾼의 격리수준을 READ COMMITTED 로 바꿔 보세요.
//                    여전히 청소를 막나요?
//
// ✏️ 직접 해보기 7 — statement_timeout 을 걸어 놓고 잠금을 기다리면
//                    55P03 이 나오나요 57014 가 나오나요?


// ── 자주 하는 실수 ──

// [실수 1] FOR UPDATE 를 BEGIN 없이 씀
//   자동 커밋이라 그 문장이 끝나는 순간 잠금이 풀립니다. 잠근 의미가 없습니다.

// [실수 2] SKIP LOCKED 를 조회에 씀
//   목록에서 줄이 빠져도 아무 표시가 안 납니다. 작업 큐 말고는 쓰지 마세요.

// [실수 3] 잠금을 쥔 채로 외부 API 를 부름
//   상대가 5초 걸리면 그 줄을 쓰려는 모든 요청이 5초 멈춥니다. 밖으로 빼세요.

// [실수 4] 운영 중에 ALTER TABLE 을 그냥 실행함
//   ACCESS EXCLUSIVE 를 잡습니다. 읽기까지 막힙니다.
//   ★ lock_timeout 을 짧게 걸고 하세요. 안 잡히면 포기하고 다시 시도하세요.

// [실수 5] 타임아웃을 안 걸어 둠
//   기본값이 "영원히 기다림" 입니다. 기다리는 요청이 쌓여 연결이 다 찹니다.

// [실수 6] pg_locks 에 안 보이니 안 잠겼다고 생각함
//   줄 잠금은 줄 자체(튜플 헤더)에 표시되고, 부딪힐 때만 pg_locks 에 나타납니다.

// [실수 7] 긴 배치를 한 트랜잭션으로 돌림
//   백만 건을 한 번에 처리하면 그동안 청소가 멈추고 표가 부풉니다.
//   ★ 만 건씩 끊어서 커밋하세요.


for (const { 연결 } of 일꾼연결) await 연결.end();
await 희생양.end().catch(() => {}); // 이미 서버가 끊었을 수 있습니다
await 방해꾼.end();
await 감시.end();
await 나.end();
await 가.end();
