// ============================================================
// 07단원 · 개념 03 — 격리수준 네 가지
// ------------------------------------------------------------
// 실행: node 개념03_격리수준_네_가지.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 개념01 에서 ACID 의 I(격리성)를 봤습니다.
// "커밋 전 변경은 남에게 안 보인다" 였습니다.
//
// 그런데 격리성은 켜고 끄는 스위치가 아닙니다. **손잡이** 입니다.
// 세게 돌리면 안전한 대신 느리고, 약하게 돌리면 빠른 대신 이상한 일이 생깁니다.
// 그 눈금이 네 개 있습니다. 그게 격리수준입니다.
//
// 이 파일에서는 눈금을 낮춰 놓고 **이상한 일을 일부러 일으켜 봅니다.**
// 그리고 눈금을 올려서 그 일이 사라지는 것을 확인합니다.
//
// ★★★ 미리 말해 둘 것이 하나 있습니다.
//   교과서에 실린 표와 PostgreSQL 의 실제 동작이 **다릅니다.**
//   이 파일에서 직접 돌려서 확인합니다. 시험에 나오는 표만 외우면 틀립니다.

import pg from "pg";

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,
  user: "factory",
  password: "secret",
  database: "factory_db",
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

// 두 번째 사람. 이 사람이 옆에서 끼어듭니다.
const 나 = new pg.Client(접속정보);
await 나.connect();
await 나.query("SET search_path TO 단원07");

await 가.query("DROP TABLE IF EXISTS 계측값, 당직 CASCADE");

await 가.query(`
  CREATE TABLE 계측값 (
    번호 INT PRIMARY KEY,
    라인 TEXT NOT NULL,
    온도 INT NOT NULL
  )
`);

await 가.query("INSERT INTO 계측값 VALUES (1, 'A', 100), (2, 'A', 200)");

const 온도읽기 = async (연결) => (await 연결.query("SELECT 온도 FROM 계측값 WHERE 번호 = 1")).rows[0].온도;
const A라인건수 = async (연결) => Number((await 연결.query("SELECT count(*) FROM 계측값 WHERE 라인 = 'A'")).rows[0].count);

async function 처음상태로() {
  await 나.query("DELETE FROM 계측값 WHERE 번호 >= 3");
  await 나.query("UPDATE 계측값 SET 온도 = 100 WHERE 번호 = 1");
}

console.log("기본 격리수준:", (await 가.query("SHOW default_transaction_isolation")).rows[0].default_transaction_isolation);
// 출력: 기본 격리수준: read committed


// ── 섹션 1: 이상 현상 세 가지 ──

// 격리를 약하게 하면 생기는 이상한 일에 이름이 붙어 있습니다. 세 가지입니다.
//
//   ① 더티 읽기(dirty read)
//      남이 **아직 커밋도 안 한** 값을 읽습니다.
//      그 사람이 롤백하면, 나는 세상에 없던 값을 보고 판단한 것이 됩니다.
//
//   ② 반복 불가 읽기(non-repeatable read)
//      같은 SELECT 를 한 트랜잭션 안에서 두 번 했는데 **값이 달라집니다.**
//      사이에 남이 고치고 커밋했기 때문입니다.
//
//   ③ 팬텀 읽기(phantom read)
//      같은 조건으로 두 번 셌는데 **줄 수가 달라집니다.**
//      사이에 남이 조건에 맞는 줄을 새로 넣었기 때문입니다.
//
// ②와 ③은 비슷해 보이지만 다릅니다.
//   ② 는 **이미 있던 줄의 값**이 바뀌는 것
//   ③ 은 **줄 자체가 새로 생기거나 사라지는** 것
// 막는 방법이 달라서 구분합니다.


// ── 섹션 2: ① 더티 읽기 — 일으키려 해도 안 됩니다 ──

// 더티 읽기를 하려면 READ UNCOMMITTED 로 내려가야 합니다. 해 봅니다.

await 나.query("BEGIN");
await 나.query("UPDATE 계측값 SET 온도 = 777 WHERE 번호 = 1"); // 커밋 안 합니다

await 가.query("BEGIN ISOLATION LEVEL READ UNCOMMITTED");
console.log("READ UNCOMMITTED 로 남의 미커밋 값을 보면:", await 온도읽기(가));
// 출력: READ UNCOMMITTED 로 남의 미커밋 값을 보면: 100

console.log("가 요청한 격리수준:", (await 가.query("SHOW transaction_isolation")).rows[0].transaction_isolation);
// 출력: 가 요청한 격리수준: read uncommitted

await 가.query("COMMIT");
await 나.query("ROLLBACK");

// ★★ 777 이 아니라 100 이 나왔습니다. 더티 읽기가 **안 일어났습니다.**
//
//   PostgreSQL 에는 READ UNCOMMITTED 가 사실상 없습니다.
//   문법은 받아 줍니다. SHOW 로 물어보면 "read uncommitted" 라고 대답도 합니다.
//   그런데 **동작은 READ COMMITTED 와 똑같습니다.**
//
//   ★ 왜 못 만들었나가 아니라 **안 만든** 것입니다.
//     Postgres 는 잠금이 아니라 MVCC(섹션 7)로 격리를 구현했습니다.
//     MVCC 에서는 "커밋 안 된 버전을 읽는다" 는 동작 자체가 더 복잡하고 느립니다.
//     막는 것이 더 쉬웠기 때문에 그냥 막았습니다.
//
//   ★★ 그래서 Postgres 를 쓰는 한 더티 읽기는 걱정할 필요가 없습니다.
//     실전에서 쓰는 눈금은 사실상 **세 개** 입니다.


// ── 섹션 3: ② 반복 불가 읽기 — 기본값에서 실제로 일으킵니다 ──

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL READ COMMITTED");
const 첫번째읽기 = await 온도읽기(가);

// 여기서 나가 끼어듭니다. 고치고 커밋까지 합니다.
await 나.query("UPDATE 계측값 SET 온도 = 999 WHERE 번호 = 1");

const 두번째읽기 = await 온도읽기(가);
await 가.query("COMMIT");

console.log(`READ COMMITTED — 같은 SELECT 두 번: ${첫번째읽기} → ${두번째읽기}`);
// 출력: READ COMMITTED — 같은 SELECT 두 번: 100 → 999

console.log("값이 달라졌나:", 첫번째읽기 !== 두번째읽기);
// 출력: 값이 달라졌나: true

// ★★ 한 트랜잭션 안에서 같은 문장을 두 번 실행했는데 답이 다릅니다.
//
//   무엇이 문제인가:
//     보고서를 만든다고 합시다. 위쪽에서 합계를 구하고, 아래쪽에서 항목을 나열합니다.
//     그 사이에 남이 값을 고치면 **합계와 항목이 안 맞습니다.**
//     "이 보고서 숫자가 왜 안 맞죠?" 가 여기서 나옵니다.
//
//   ★ READ COMMITTED 는 문장 하나마다 새로 사진을 찍습니다.
//     그래서 문장 하나 안에서는 일관되지만, 문장 사이에서는 아닙니다.


// ── 섹션 4: ③ 팬텀 읽기 — 역시 기본값에서 일으킵니다 ──

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL READ COMMITTED");
const 첫번째건수 = await A라인건수(가);

// 나가 A라인에 줄을 하나 새로 넣습니다.
await 나.query("INSERT INTO 계측값 VALUES (3, 'A', 300)");

const 두번째건수 = await A라인건수(가);
await 가.query("COMMIT");

console.log(`READ COMMITTED — 같은 COUNT 두 번: ${첫번째건수}건 → ${두번째건수}건`);
// 출력: READ COMMITTED — 같은 COUNT 두 번: 2건 → 3건

console.log("없던 줄이 나타났나:", 두번째건수 > 첫번째건수);
// 출력: 없던 줄이 나타났나: true

// ★ 유령처럼 없던 줄이 나타났다고 해서 팬텀(유령) 읽기입니다.


// ── 섹션 5: ★★★ REPEATABLE READ 로 올려 봅니다 ──

// 이제 눈금을 한 칸 올립니다. 같은 실험을 그대로 다시 합니다.

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
const RR첫값 = await 온도읽기(가);
await 나.query("UPDATE 계측값 SET 온도 = 999 WHERE 번호 = 1");
const RR둘값 = await 온도읽기(가);
await 가.query("COMMIT");

console.log(`REPEATABLE READ — 같은 SELECT 두 번: ${RR첫값} → ${RR둘값}`);
// 출력: REPEATABLE READ — 같은 SELECT 두 번: 100 → 100

console.log("반복 불가 읽기가 막혔나:", RR첫값 === RR둘값);
// 출력: 반복 불가 읽기가 막혔나: true

// 여기까지는 교과서대로입니다. 팬텀은 어떨까요?
// **교과서는 REPEATABLE READ 에서 팬텀이 허용된다고 합니다.**

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
const RR첫건수 = await A라인건수(가);
await 나.query("INSERT INTO 계측값 VALUES (3, 'A', 300)");
const RR둘건수 = await A라인건수(가);
await 가.query("COMMIT");

console.log(`REPEATABLE READ — 같은 COUNT 두 번: ${RR첫건수}건 → ${RR둘건수}건`);
// 출력: REPEATABLE READ — 같은 COUNT 두 번: 2건 → 2건

console.log("팬텀이 막혔나:", RR첫건수 === RR둘건수);
// 출력: 팬텀이 막혔나: true

// ★★★ 여기가 이 파일에서 제일 중요한 곳입니다.
//
//   표준(SQL 표준)은 REPEATABLE READ 에서 팬텀을 **허용** 한다고 정합니다.
//   그런데 PostgreSQL 은 **막았습니다.** 방금 직접 확인했습니다.
//
//   "표에는 팬텀 허용이라던데요?" 라고 물으면 답은 이렇습니다.
//
//   ★ 표준은 **최소 요구조건** 입니다. "여기까지는 반드시 막아라" 입니다.
//     구현이 그보다 **더 세게 막는 것은 허용** 됩니다.
//     Postgres 는 스냅샷 격리로 만들다 보니 팬텀까지 자동으로 막히게 됐습니다.
//     일부러 약하게 만들 이유가 없으니 그대로 뒀습니다.
//
//   ★★ 그러니 시험 답은 "허용", 실제 Postgres 답은 "안 생김" 입니다.
//     둘 다 알고 있어야 합니다. 그리고 **다른 DB 로 옮길 때 조심해야 합니다.**
//     같은 코드가 MySQL 이나 Oracle 에서는 다르게 동작할 수 있습니다.
//
//   ── MySQL 은 여기가 다릅니다 ──
//     MySQL(InnoDB)은 기본값이 REPEATABLE READ 이고, 팬텀을 갭 락(gap lock)이라는
//     다른 방식으로 막습니다. 잠그는 범위가 넓어서 대기가 더 잘 생깁니다.
//     ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다


// ── 섹션 6: 표 두 개를 나란히 ──

//   [교과서 표 — SQL 표준]
//                         더티읽기    반복불가읽기  팬텀읽기
//   READ UNCOMMITTED      허용        허용          허용
//   READ COMMITTED        막음        허용          허용
//   REPEATABLE READ       막음        막음          ★ 허용
//   SERIALIZABLE          막음        막음          막음
//
//   [PostgreSQL 실제 — 위에서 직접 돌린 결과]
//                         더티읽기    반복불가읽기  팬텀읽기
//   READ UNCOMMITTED      ★ 안 생김  허용          허용     ← READ COMMITTED 로 동작
//   READ COMMITTED        안 생김     허용          허용
//   REPEATABLE READ       안 생김     막음          ★★ 막음
//   SERIALIZABLE          안 생김     막음          막음     + 쓰기 왜곡까지 막음
//
// ★ 눈금이 실질적으로 세 개입니다. READ COMMITTED / REPEATABLE READ / SERIALIZABLE.


// ── 섹션 7: MVCC — 왜 읽기가 쓰기를 안 막나 ──

// Postgres 가 이렇게 동작하는 이유는 **MVCC** 때문입니다.
// 다중 버전 동시성 제어(Multi-Version Concurrency Control)의 줄임말입니다.
//
// 핵심은 한 줄입니다.
//
//   ★ 줄을 고칠 때 **덮어쓰지 않습니다.** 새 버전을 하나 더 만듭니다.
//
// 직접 봅니다. 줄이 물리적으로 어디에 있는지는 ctid 로 볼 수 있습니다.

await 가.query("DROP TABLE IF EXISTS 버전보기 CASCADE");
await 가.query("CREATE TABLE 버전보기 (번호 INT PRIMARY KEY, 값 INT)");
await 가.query("INSERT INTO 버전보기 VALUES (1, 100)");

const 위치보기 = async () =>
  (await 가.query("SELECT ctid::text AS 자리, xmin::text AS 만든트랜잭션 FROM 버전보기 WHERE 번호 = 1")).rows[0];

const 고치기전 = await 위치보기();
await 가.query("UPDATE 버전보기 SET 값 = 200 WHERE 번호 = 1");
const 고친후 = await 위치보기();

console.log(`UPDATE 전 자리: ${고치기전.자리} · UPDATE 후 자리: ${고친후.자리}`);
// 출력: UPDATE 전 자리: (0,1) · UPDATE 후 자리: (0,2)

console.log("줄이 다른 자리로 옮겨 갔나:", 고치기전.자리 !== 고친후.자리);
// 출력: 줄이 다른 자리로 옮겨 갔나: true

console.log("만든 트랜잭션 번호가 바뀌었나:", 고치기전.만든트랜잭션 !== 고친후.만든트랜잭션);
// 출력: 만든 트랜잭션 번호가 바뀌었나: true

// ★★ UPDATE 한 번에 줄이 (0,1) 에서 (0,2) 로 갔습니다.
//   옛 버전은 (0,1) 에 **그대로 남아 있습니다.** 지워지지 않았습니다.
//   xmin 은 "이 버전을 만든 트랜잭션 번호" 입니다. 새 버전은 새 번호를 답니다.
//
//   그래서 각 트랜잭션은 시작할 때 "지금 몇 번까지 커밋됐나" 를 적어 둡니다.
//   그게 **스냅샷** 입니다. 사진 한 장이라고 생각하면 됩니다.
//   그 뒤로는 자기 사진에 찍힌 버전만 봅니다. 남이 새 버전을 만들어도 안 보입니다.
//
// ★★★ 이래서 이런 일이 가능합니다.

// 쓰는 중에 읽어 봅니다.
await 나.query("BEGIN");
await 나.query("UPDATE 버전보기 SET 값 = 555 WHERE 번호 = 1"); // 잠금을 쥔 채

const 읽기시작 = performance.now();
const 읽은값 = (await 가.query("SELECT 값 FROM 버전보기 WHERE 번호 = 1")).rows[0].값;
const 읽기ms = performance.now() - 읽기시작;

await 나.query("ROLLBACK");

console.log(`남이 고치는 중에 읽은 값: ${읽은값} (${읽기ms.toFixed(0)} ms 만에)`);
// 출력?: 남이 고치는 중에 읽은 값: 200 (1 ms 만에)

console.log("기다리지 않고 읽었나 (100ms 미만):", 읽기ms < 100);
// 출력: 기다리지 않고 읽었나 (100ms 미만): true

// ★★★ **읽기는 쓰기를 기다리지 않습니다. 쓰기도 읽기를 기다리지 않습니다.**
//
//   이게 Postgres 의 가장 큰 장점입니다. 옛 버전이 남아 있으니
//   읽는 사람은 옛 버전을 보면 됩니다. 잠금을 기다릴 이유가 없습니다.
//
//   ★ 잠금으로 격리를 구현한 DB 는 이게 안 됩니다.
//     "누가 고치는 중이면 읽는 사람도 기다린다" 가 됩니다.
//     보고서 하나 돌리면 서비스 전체가 느려집니다.
//
//   ★★ 공짜는 아닙니다. 옛 버전이 계속 쌓입니다.
//     누군가 치워야 합니다. 그게 VACUUM 입니다.
//     그리고 **긴 트랜잭션이 열려 있으면 치우지 못합니다.**
//     개념04 에서 실제로 못 치우는 것을 확인합니다.


// ── 섹션 8: ★ 사진은 BEGIN 이 아니라 첫 문장에서 찍힙니다 ──

// 흔한 오해입니다. "BEGIN 하는 순간 사진이 찍힌다" 고 생각합니다. 아닙니다.

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL REPEATABLE READ"); // 아직 아무 문장도 안 보냈습니다

await 나.query("UPDATE 계측값 SET 온도 = 888 WHERE 번호 = 1"); // 나가 먼저 고치고 커밋합니다

const BEGIN뒤에본값 = await 온도읽기(가); // 여기가 첫 문장입니다
await 나.query("UPDATE 계측값 SET 온도 = 555 WHERE 번호 = 1"); // 또 고칩니다
const 그다음에본값 = await 온도읽기(가);

await 가.query("COMMIT");

console.log(`BEGIN 뒤에 남이 고친 값: ${BEGIN뒤에본값} · 첫 SELECT 뒤에 고친 값: ${그다음에본값}`);
// 출력: BEGIN 뒤에 남이 고친 값: 888 · 첫 SELECT 뒤에 고친 값: 888

// ★★ 888 이 보입니다. BEGIN 시점이 아니라 **첫 SELECT 시점**의 사진입니다.
//   그 뒤에 고친 555 는 안 보입니다. 사진은 그때 이미 찍혔으니까요.
//
//   ★ 정확한 시점이 중요하면 BEGIN 직후에 아무 문장이나 하나 보내세요.
//     또는 Postgres 전용으로 `BEGIN; SELECT pg_current_snapshot();` 를 씁니다.

// 격리수준은 트랜잭션의 **첫 문장 전에** 정해야 합니다.

await 가.query("BEGIN");
await 가.query("SELECT 1");

try {
  await 가.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
} catch (에러) {
  console.log(`문장을 보낸 뒤 격리수준 변경: ${에러.code} — ${에러.message}`);
  // 출력: 문장을 보낸 뒤 격리수준 변경: 25001 — SET TRANSACTION ISOLATION LEVEL must be called before any query
}

await 가.query("ROLLBACK");


// ── 섹션 9: REPEATABLE READ 의 대가 — 40001 ──

// 사진을 계속 보는 대신 값을 치릅니다. **내가 본 줄을 남이 먼저 고치면 커밋이 거부됩니다.**

await 처음상태로();

await 가.query("BEGIN ISOLATION LEVEL REPEATABLE READ");
await 온도읽기(가); // 사진을 찍습니다

await 나.query("UPDATE 계측값 SET 온도 = 500 WHERE 번호 = 1"); // 나가 먼저 고칩니다

try {
  await 가.query("UPDATE 계측값 SET 온도 = 600 WHERE 번호 = 1");
  console.log("가의 UPDATE 가 성공했습니다"); // 검증무시: 여기까지 오면 격리가 안 걸린 것입니다
} catch (에러) {
  console.log(`REPEATABLE READ 쓰기 충돌: ${에러.code} — ${에러.message}`);
  // 출력: REPEATABLE READ 쓰기 충돌: 40001 — could not serialize access due to concurrent update
}

await 가.query("ROLLBACK");

// ★ 40001 은 "네 잘못이 아니다. 다시 해 봐라" 는 뜻입니다.
//   READ COMMITTED 였다면 기다렸다가 새 값을 다시 읽고 성공했을 것입니다(개념02 섹션4).
//   REPEATABLE READ 는 사진을 지켜야 하니 그럴 수가 없어서 포기합니다.
//
// ★★ 그래서 REPEATABLE READ 이상을 쓰면 **재시도 코드가 반드시 필요합니다.**
//   개념05 에서 제대로 만듭니다.


// ── 섹션 10: SERIALIZABLE — 사진만으로 못 막는 것 ──

// REPEATABLE READ 로도 못 막는 이상 현상이 있습니다. **쓰기 왜곡(write skew)** 입니다.
//
// 상황: 당직은 항상 최소 한 명이 있어야 합니다.
//   김반장과 이반장이 둘 다 당직입니다. 둘 다 동시에 "나 말고 한 명 더 있네" 하고 뺍니다.
//   각자 보기에는 규칙을 안 어겼습니다. 그런데 합치면 당직이 0명이 됩니다.

await 가.query("CREATE TABLE 당직 (번호 INT PRIMARY KEY, 이름 TEXT NOT NULL, 당직여부 BOOLEAN NOT NULL)");

async function 당직초기화() {
  await 나.query("TRUNCATE 당직");
  await 나.query("INSERT INTO 당직 VALUES (1, '김반장', true), (2, '이반장', true)");
}

const 당직수 = async (연결) =>
  Number((await 연결.query("SELECT count(*) FROM 당직 WHERE 당직여부")).rows[0].count);

// 먼저 SERIALIZABLE 로 해 봅니다.
await 당직초기화();

await 가.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
await 나.query("BEGIN ISOLATION LEVEL SERIALIZABLE");

console.log(`가가 센 당직: ${await 당직수(가)}명 · 나가 센 당직: ${await 당직수(나)}명`);
// 출력: 가가 센 당직: 2명 · 나가 센 당직: 2명

// 둘 다 "두 명이니 나 하나 빠져도 되겠다" 고 판단합니다.
await 가.query("UPDATE 당직 SET 당직여부 = false WHERE 번호 = 1");
await 나.query("UPDATE 당직 SET 당직여부 = false WHERE 번호 = 2");

await 가.query("COMMIT");
console.log("가는 커밋 성공");
// 출력: 가는 커밋 성공

try {
  await 나.query("COMMIT");
  console.log("나도 커밋 성공"); // 검증무시: SERIALIZABLE 이 안 걸리면 여기로 옵니다
} catch (에러) {
  console.log(`나는 커밋 거부: ${에러.code} — ${에러.message}`);
  // 출력: 나는 커밋 거부: 40001 — could not serialize access due to read/write dependencies among transactions
  console.log(`   힌트: ${에러.hint}`);
  // 출력:    힌트: The transaction might succeed if retried.
  await 나.query("ROLLBACK");
}

console.log("남은 당직:", await 당직수(가), "명");
// 출력: 남은 당직: 1 명

// ★★ 당직이 0명이 되는 것을 막았습니다.
//
//   ★ 여기서 중요한 것: 두 사람은 **서로 다른 줄**을 고쳤습니다.
//     번호 1과 번호 2입니다. 잠금으로는 절대 못 막습니다. 부딪히는 줄이 없으니까요.
//     REPEATABLE READ 도 못 막습니다. 각자 자기 사진 안에서는 문제가 없습니다.
//
//     SERIALIZABLE 은 **읽은 것까지 추적** 합니다.
//     "나는 당직 목록을 읽고 판단했다" 를 기억해 뒀다가,
//     그 목록을 남이 바꿨으면 커밋을 거부합니다.
//
// ★★★ SERIALIZABLE 을 쓰면 **애플리케이션이 반드시 재시도해야 합니다.**
//   "혹시 실패하면" 이 아닙니다. 정상 동작의 일부로 실패합니다.
//   재시도 코드가 없으면 손님이 그냥 에러 화면을 봅니다.


// ── 섹션 11: 어떻게 정하고, 언제 올리나 ──

// 정하는 방법은 세 가지입니다.
//
//   ① 트랜잭션마다         BEGIN ISOLATION LEVEL REPEATABLE READ
//   ② 트랜잭션 시작 직후   BEGIN;  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
//   ③ 연결 전체            SET default_transaction_isolation = 'repeatable read';
//
// ③ 을 확인해 봅니다.

await 나.query("SET default_transaction_isolation = 'repeatable read'");
await 나.query("BEGIN");
console.log("연결 기본값을 바꾼 뒤:", (await 나.query("SHOW transaction_isolation")).rows[0].transaction_isolation);
// 출력: 연결 기본값을 바꾼 뒤: repeatable read

await 나.query("COMMIT");
await 나.query("SET default_transaction_isolation = 'read committed'");

// ★★ 언제 올려야 하나 — 대부분은 안 올려도 됩니다
//
//   READ COMMITTED (기본값) 로 충분한 경우
//     · 한 문장으로 끝나는 일 (UPDATE ... SET 수량 = 수량 - 1)
//     · 목록 조회, 상세 조회
//     · 갱신 손실은 개념02 의 세 가지 방법으로 막으면 됩니다
//     ★ 실무 코드의 95% 는 여기입니다. 손대지 마세요.
//
//   REPEATABLE READ 로 올릴 때
//     · 여러 문장으로 한 시점의 자료를 읽어야 할 때 (월말 정산, 대사 작업)
//     · 백업이나 대용량 리포트
//     ★ 재시도 코드를 같이 넣으세요. 40001 이 납니다.
//
//   SERIALIZABLE 로 올릴 때
//     · "읽고 판단해서 쓰는" 규칙이 있고, 그 규칙이 여러 줄에 걸칠 때
//       (당직 최소 한 명, 좌석 중복 예약, 잔액이 음수가 되면 안 됨)
//     · 그 규칙을 제약조건 하나로 표현할 수 없을 때
//     ★★ 재시도 코드가 **필수** 입니다. 없으면 쓰지 마세요.
//
//   ★ 격리수준을 올리기 전에 먼저 생각해 볼 것
//     제약조건(UNIQUE, CHECK)으로 표현할 수 있으면 그게 훨씬 쌉니다.
//     "좌석 중복 예약" 은 (공연, 좌석) 에 UNIQUE 를 걸면 끝입니다.
//     격리수준은 제약으로 안 되는 것에만 쓰세요.


// ============================================================
// 정리
// ============================================================
//
//   격리수준             막아 주는 것                           대가
//   ──────────────────────────────────────────────────────────────────────────
//   READ UNCOMMITTED     (Postgres 에는 없음. READ COMMITTED 로 동작)
//   READ COMMITTED       더티 읽기                              없음 — 기본값
//   REPEATABLE READ      + 반복 불가 읽기, 팬텀(Postgres 한정)  40001 재시도 필요
//   SERIALIZABLE         + 쓰기 왜곡 (읽은 것까지 추적)         40001 재시도 필수, 조금 느림
//
//   에러코드   뜻                            어떻게 해야 하나
//   ──────────────────────────────────────────────────────────────────────────
//   40001      직렬화 실패                   트랜잭션 전체를 처음부터 다시 (개념05)
//   25001      문장을 보낸 뒤 격리수준 변경  BEGIN 직후에 정하세요
//
// ★★★ 이 개념에서 꼭 기억할 것
//   ① Postgres 의 REPEATABLE READ 는 **팬텀도 막습니다.** 교과서 표와 다릅니다
//   ② Postgres 에는 READ UNCOMMITTED 가 사실상 없습니다. 더티 읽기는 안 납니다
//   ③ MVCC 덕분에 **읽기와 쓰기가 서로를 안 막습니다.** 대신 옛 버전이 쌓입니다
//   ④ 사진은 BEGIN 이 아니라 **첫 문장**에서 찍힙니다
//   ⑤ 기본값으로 충분한 경우가 대부분입니다. 올리면 재시도 코드가 딸려 옵니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 3 의 격리수준을 REPEATABLE READ 로 바꿔 보세요.
//                    결과가 어떻게 되나요? 섹션 5 와 같아지나요?
//
// ✏️ 직접 해보기 2 — 섹션 4 의 INSERT 를 DELETE 로 바꿔 보세요.
//                    줄이 사라지는 것도 팬텀일까요? (힌트: 네, 그것도 팬텀입니다)
//
// ✏️ 직접 해보기 3 — 섹션 7 에서 UPDATE 를 다섯 번 연속 해 보고 ctid 를 찍어 보세요.
//                    자리가 어떻게 움직이나요? 옛 자리들은 어떻게 될까요?
//
// ✏️ 직접 해보기 4 — 섹션 8 에서 BEGIN 바로 뒤에 `SELECT 1` 을 넣어 보세요.
//                    결과가 888 에서 100 으로 바뀌나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 5 — 섹션 10 을 REPEATABLE READ 로 바꿔서 돌려 보세요.
//                    당직이 몇 명 남나요? 쓰기 왜곡이 실제로 일어나는 것을 확인하세요.
//
// ✏️ 직접 해보기 6 — 섹션 10 에서 가와 나가 **같은 줄**을 고치게 바꿔 보세요.
//                    에러 코드가 40001 그대로인가요? 메시지는 어떻게 다른가요?
//
// ✏️ 직접 해보기 7 — SERIALIZABLE 두 개를 띄우고 **읽기만** 해 보세요.
//                    40001 이 나나요? (힌트: 안 납니다. 읽기만 하면 충돌할 일이 없습니다)


// ── 자주 하는 실수 ──

// [실수 1] 교과서 표를 그대로 믿고 Postgres 에 적용함
//   "REPEATABLE READ 는 팬텀이 나니까 SERIALIZABLE 을 써야지" → Postgres 에서는 불필요합니다.
//   반대로 다른 DB 로 옮길 때는 그 표가 맞습니다. **어느 DB 인지가 답을 바꿉니다.**

// [실수 2] 격리수준을 올리면 갱신 손실도 막힌다고 생각함
//   REPEATABLE READ 는 갱신 손실을 **막는 게 아니라 에러로 알려 줍니다**(40001).
//   재시도를 안 붙이면 손님 화면에 에러가 뜰 뿐입니다.
//   개념02 의 세 가지 방법이 먼저입니다.

// [실수 3] 40001 을 버그로 처리함
//   40001 은 정상 동작입니다. 로그에 error 로 쌓아 두고 원인을 찾으면 안 됩니다.
//   잡아서 다시 시도하세요. 개념05 에서 만듭니다.

// [실수 4] SERIALIZABLE 을 켜고 재시도를 안 붙임
//   가장 위험한 조합입니다. 평소에는 잘 되다가 손님이 몰릴 때만 실패합니다.
//   재시도가 없으면 SERIALIZABLE 은 켜지 마세요.

// [실수 5] 트랜잭션 첫 문장 뒤에 격리수준을 바꾸려고 함
//   25001 이 납니다. BEGIN ISOLATION LEVEL ... 로 한 번에 쓰는 것이 안전합니다.

// [실수 6] 사진이 BEGIN 에서 찍힌다고 믿음
//   BEGIN 과 첫 문장 사이에 남이 커밋한 것은 보입니다. 섹션 8 에서 확인했습니다.
//   연결 풀에서 꺼내고 BEGIN 하고 다른 일 하다가 SELECT 하면 그 사이가 꽤 벌어집니다.

// [실수 7] 격리수준을 올려서 성능 문제를 풀려고 함
//   방향이 반대입니다. 올릴수록 재시도와 대기가 늘어납니다.
//   격리수준은 **정확성** 을 위한 손잡이지 성능 손잡이가 아닙니다.


await 가.end();
await 나.end();
