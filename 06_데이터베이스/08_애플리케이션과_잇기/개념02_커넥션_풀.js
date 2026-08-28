// ============================================================
// 08단원 · 개념 02 — 커넥션 풀
// ------------------------------------------------------------
// 실행: node 개념02_커넥션_풀.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 일부러 기다리는 실험이 있어서 15초쯤 걸립니다.
// ============================================================
//
// 개념01 에서 `pg.Client` 하나로 데이터베이스를 불렀습니다.
// 혼자 쓰는 스크립트라면 그걸로 충분합니다.
//
// 그런데 서버는 손님을 **동시에** 받습니다. 김반장과 이반장이 같은 순간에 누릅니다.
//
// 이 파일에서 재 볼 것:
//
//   ① 연결 하나를 계속 쓰면 요청이 **줄을 섭니다** — 얼마나 느려지나
//   ② 매번 새로 연결하면 **연결 만드는 값**을 냅니다 — 얼마나 비싼가
//   ③ ★★ 빌린 연결을 안 돌려주면 풀이 **마릅니다** — 진짜로 말려 봅니다
//   ④ ★★ 트랜잭션을 풀에 그냥 던지면 **롤백이 안 됩니다** — 진짜로 깨 봅니다

import pg from "pg";

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434,
  user: "factory",
  password: "secret",
  database: "factory_db",
};

let 준비;

try {
  준비 = new pg.Client(접속정보);
  await 준비.connect();
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 안내입니다. 정상 종료합니다.
  console.log("데이터베이스에 연결하지 못했습니다.", 에러.code ?? 에러.message);
  console.log("이 파일은 Docker 가 필요합니다. 아래를 치고 다시 실행하세요.");
  console.log("  docker compose up -d");
  process.exit(0);
}

await 준비.query("CREATE SCHEMA IF NOT EXISTS 단원08");
await 준비.query("SET search_path TO 단원08");
await 준비.query("DROP TABLE IF EXISTS 잔고");
await 준비.query("CREATE TABLE 잔고 (계정 TEXT PRIMARY KEY, 값 INT NOT NULL)");
await 준비.query("INSERT INTO 잔고 VALUES ('A라인', 100)");

const 중앙값 = (잰것) => 잰것.slice().sort((가, 나) => 가 - 나)[Math.floor(잰것.length / 2)];

console.log("준비됐습니다.");
// 출력: 준비됐습니다.


// ── 섹션 1: ★ 연결 하나로 여덟 명을 받으면 ──

// `pg.Client` 는 전화선 한 가닥입니다.
// 여덟 명이 동시에 걸어도 **한 명씩** 통화합니다. 나머지는 기다립니다.
//
// 재 봅니다. `pg_sleep(0.1)` 은 데이터베이스가 0.1초 동안 일하는 흉내입니다.

const 하나짜리 = new pg.Client({ ...접속정보, application_name: "unit08-one" });
await 하나짜리.connect();

const 하나로시작 = performance.now();

// ★ 여덟 개를 **동시에** 던집니다. 기다리지 않고 한꺼번에 보냅니다.
await Promise.all(Array.from({ length: 8 }, () => 하나짜리.query("SELECT pg_sleep(0.1)")));

const 하나로걸린ms = performance.now() - 하나로시작;

await 하나짜리.end();

console.log(`연결 1개로 0.1초짜리 8건: ${하나로걸린ms.toFixed(0)} ms`);
// 출력?: 연결 1개로 0.1초짜리 8건: 833 ms

console.log("8건이 겹치지 않고 줄을 섰나 (0.7초 넘게 걸렸나):", 하나로걸린ms > 700);
// 출력: 8건이 겹치지 않고 줄을 섰나 (0.7초 넘게 걸렸나): true

// ★★ 0.1초짜리 여덟 개인데 0.8초가 걸렸습니다. **하나도 안 겹쳤습니다.**
//   `Promise.all` 로 동시에 보냈는데도 그렇습니다. 연결이 하나뿐이라
//   드라이버가 큐에 넣고 한 개씩 보냅니다.
//
// ★ 위 코드를 돌리면 터미널에 이런 경고가 뜹니다. `pg` 가 하지 말라고 말하는 것입니다.
//   pg 9 부터는 아예 에러가 됩니다. 이 경고를 보면 풀을 떠올리세요.
//
//     DeprecationWarning: Calling client.query() when the client is already
//     executing a query is deprecated
//
// ★ 손님이 100명이면 100번째는 10초를 기다립니다.
//   그 사이 데이터베이스는 **놀고 있습니다.** 일을 시킬 방법이 없을 뿐입니다.


// ── 섹션 2: ★ 그럼 매번 새로 연결하면? ──

// "요청마다 새 Client 를 만들면 되잖아요" — 되기는 됩니다. 비쌉니다.
// 연결 하나를 만들 때 이 네 가지가 일어납니다.
//
//   ① TCP 를 엽니다  ② (운영에서는) TLS 를 협상합니다
//   ③ 비밀번호로 인증합니다 (SCRAM-SHA-256 — 왕복이 여러 번입니다)
//   ④ 서버가 **프로세스를 하나 새로 만듭니다** (Postgres 는 연결마다 프로세스입니다)
//
// 재 봅니다.

const 새로만들기ms = [];

for (let 회차 = 0; 회차 < 7; 회차 += 1) {
  const 시작 = performance.now();
  const 임시 = new pg.Client(접속정보);
  await 임시.connect();
  await 임시.query("SELECT 1");
  await 임시.end();
  새로만들기ms.push(performance.now() - 시작);
}

// ★ 풀이 만드는 연결에도 스키마를 걸어 둡니다.
//   `풀.query("SET search_path ...")` 로는 안 됩니다. 그 연결 하나에만 걸리기 때문입니다.
//   풀을 만들 때 `options` 로 주면 **모든 연결**에 걸립니다. (섹션 7 에서 다시 봅니다)
const 풀 = new pg.Pool({
  ...접속정보,
  max: 10,
  application_name: "unit08-pool",
  options: "-c search_path=단원08",
});

await 풀.query("SELECT 1");   // 첫 연결을 미리 만들어 둡니다 (워밍업)

const 빌리기ms = [];

for (let 회차 = 0; 회차 < 7; 회차 += 1) {
  const 시작 = performance.now();
  const 빌린것 = await 풀.connect();
  await 빌린것.query("SELECT 1");
  빌린것.release();
  빌리기ms.push(performance.now() - 시작);
}

console.log(`새 Client 를 만들어서 한 번 물어보기: ${중앙값(새로만들기ms).toFixed(1)} ms`);
// 출력?: 새 Client 를 만들어서 한 번 물어보기: 9.5 ms

console.log(`풀에서 빌려서 한 번 물어보기: ${중앙값(빌리기ms).toFixed(2)} ms`);
// 출력?: 풀에서 빌려서 한 번 물어보기: 0.55 ms

console.log("풀이 더 빠른가:", 중앙값(빌리기ms) < 중앙값(새로만들기ms));
// 출력: 풀이 더 빠른가: true

console.log(`몇 배 빠른가: ${(중앙값(새로만들기ms) / 중앙값(빌리기ms)).toFixed(0)} 배`);
// 출력?: 몇 배 빠른가: 17 배

// ★★ 열 배가 넘게 차이 납니다. 그리고 이건 **같은 노트북 안**에서 잰 값입니다.
//   서버와 DB 가 다른 기계면 왕복이 여러 번이라 20~50ms 가 나오는 경우도 흔합니다.
//   시간만 문제가 아닙니다. 초당 100건이면 초당 100개의 프로세스를 만들었다 지웁니다.


// ── 섹션 3: 풀은 이 둘을 동시에 해결합니다 ──

// 풀(pool)은 **미리 만들어 둔 연결 여러 개를 돌려 쓰는 것**입니다.
// 빌리고 → 쓰고 → 돌려줍니다. 끊지 않습니다.
// 다음 요청은 **이미 만들어진** 연결을 쓰고, 연결이 여러 개라 줄서기도 사라집니다.

const 풀로시작 = performance.now();

await Promise.all(Array.from({ length: 8 }, () => 풀.query("SELECT pg_sleep(0.1)")));

const 풀로걸린ms = performance.now() - 풀로시작;

console.log(`풀(max 10)로 0.1초짜리 8건: ${풀로걸린ms.toFixed(0)} ms`);
// 출력?: 풀(max 10)로 0.1초짜리 8건: 124 ms

console.log("풀이 연결 1개보다 빠른가:", 풀로걸린ms < 하나로걸린ms);
// 출력: 풀이 연결 1개보다 빠른가: true

// ★★ 833ms → 124ms. 여덟 건이 **겹쳐서** 처리됐습니다.
//   0.1초짜리 여덟 개가 0.12초에 끝났습니다. 거의 완전히 병렬입니다.

console.log("풀 상태 — 만든 연결:", 풀.totalCount, "· 노는 연결:", 풀.idleCount, "· 기다리는 요청:", 풀.waitingCount);
// 출력?: 풀 상태 — 만든 연결: 8 · 노는 연결: 8 · 기다리는 요청: 0

// ★ `totalCount` 가 8 입니다. 처음부터 10개를 만든 게 아니라,
//   **필요할 때 하나씩** 만듭니다. 8건이 겹쳤으니 8개가 됐습니다.
//   `max: 10` 은 "최대 10개까지" 라는 뜻이지 "항상 10개" 가 아닙니다.


// ── 섹션 4: 쓰는 법 두 가지 ──

// ① `풀.query(...)` — 한 문장이면 이게 제일 낫습니다.
//    빌리고, 쓰고, 돌려주는 것을 풀이 알아서 합니다.

const 한문장 = await 풀.query("SELECT 값 FROM 잔고 WHERE 계정 = $1", ["A라인"]);

console.log("pool.query 로 조회:", 한문장.rows[0].값);
// 출력: pool.query 로 조회: 100

// ② `풀.connect()` — **같은 연결**을 계속 써야 할 때만 씁니다.
//    트랜잭션이 대표적입니다. 임시 표나 `SET` 도 그렇습니다.

const 빌린연결 = await 풀.connect();

try {
  await 빌린연결.query("BEGIN");
  await 빌린연결.query("UPDATE 잔고 SET 값 = 값 + 50 WHERE 계정 = $1", ["A라인"]);
  await 빌린연결.query("COMMIT");
} catch (에러) {
  await 빌린연결.query("ROLLBACK");
  throw 에러;
} finally {
  빌린연결.release();   // ★★ 이 줄이 이 파일에서 제일 중요한 줄입니다
}

console.log("트랜잭션 뒤 잔고:", (await 풀.query("SELECT 값 FROM 잔고")).rows[0].값);
// 출력: 트랜잭션 뒤 잔고: 150

// ★ `release()` 는 연결을 **끊는 게 아닙니다.** 풀에 돌려주는 것입니다.
//   `end()` 와 헷갈리지 마세요. `client.end()` 를 부르면 풀이 망가집니다.


// ── 섹션 5: ★★ 안 돌려주면 풀이 마릅니다 ──

// `release()` 를 빠뜨리면 그 연결은 **영원히 빌려 간 상태**로 남습니다.
// 풀이 `max` 만큼 다 빌려주고 나면, 그다음 요청은 아무도 못 받습니다.
//
// 진짜로 말려 봅니다. 작은 풀(max 3)을 만들고 안 돌려주는 함수를 씁니다.

const 새는풀 = new pg.Pool({ ...접속정보, max: 3, connectionTimeoutMillis: 1500 });

const 새어나간것 = [];

async function 안돌려주는조회() {
  const 빌린것 = await 새는풀.connect();
  const 결과 = await 빌린것.query("SELECT 1 AS 값");

  새어나간것.push(빌린것);   // 실습에서 정리하려고 보관만 해 둡니다
  return 결과.rows[0].값;    // ★ release() 가 없습니다
}

for (let 번째 = 1; 번째 <= 3; 번째 += 1) {
  await 안돌려주는조회();
}

console.log("세 번 부른 뒤 — 만든 연결:", 새는풀.totalCount, "· 노는 연결:", 새는풀.idleCount);
// 출력: 세 번 부른 뒤 — 만든 연결: 3 · 노는 연결: 0

// ★ `노는 연결: 0` 입니다. 세 개를 다 빌려 갔고 하나도 안 돌아왔습니다.
//   이제 네 번째를 부르면 어떻게 되나 봅니다.

const 네번째시작 = performance.now();
let 네번째결과;

try {
  await 안돌려주는조회();
  네번째결과 = "성공";
} catch (에러) {
  네번째결과 = 에러.message;
}

const 기다린ms = performance.now() - 네번째시작;

console.log("네 번째 요청:", 네번째결과);
// 출력: 네 번째 요청: timeout exceeded when trying to connect

console.log("얼마나 기다렸나 (1.5초쯤이면 맞습니다):", 기다린ms > 1400 && 기다린ms < 3000);
// 출력: 얼마나 기다렸나 (1.5초쯤이면 맞습니다): true

// ★★★ 이게 운영에서 벌어지면 이렇게 보입니다.
//
//   · 서비스가 **멀쩡하다가 갑자기** 전부 멈춥니다
//   · CPU 도 메모리도 DB 도 한가합니다. 재시작하면 잠깐 괜찮았다가 또 멈춥니다
//   · 로그에는 "timeout exceeded when trying to connect" 만 쌓입니다
//
//   원인은 `release()` 를 빠뜨린 경로가 **하나** 있는 것입니다.
//   ★ 특히 **에러가 난 경로**에서 잘 빠집니다. 정상 경로에는 썼는데 `throw` 뒤에는
//     안 쓴 코드가 흔합니다. 그래서 **에러가 몇 번 난 다음에** 죽습니다.

// 실습을 계속하려고 새어 나간 것들을 돌려줍니다.
for (const 빌린것 of 새어나간것) 빌린것.release();

console.log("돌려준 뒤 노는 연결:", 새는풀.idleCount);
// 출력: 돌려준 뒤 노는 연결: 3

// 고친 모양입니다. **`finally` 에 넣습니다.**

async function 제대로조회() {
  const 빌린것 = await 새는풀.connect();

  try {
    return (await 빌린것.query("SELECT 1 AS 값")).rows[0].값;
  } finally {
    빌린것.release();   // 성공하든 던지든 반드시 돌아갑니다
  }
}

for (let 번째 = 1; 번째 <= 20; 번째 += 1) {
  await 제대로조회();
}

console.log("20번 불러도 — 만든 연결:", 새는풀.totalCount, "· 노는 연결:", 새는풀.idleCount);
// 출력: 20번 불러도 — 만든 연결: 3 · 노는 연결: 3

// 에러가 나는 경로도 새지 않는지 확인합니다.

async function 터지는조회() {
  const 빌린것 = await 새는풀.connect();

  try {
    await 빌린것.query("SELEC 1");   // 검증무시: 일부러 낸 문법 오류입니다
  } finally {
    빌린것.release();
  }
}

for (let 번째 = 1; 번째 <= 5; 번째 += 1) {
  await 터지는조회().catch(() => {});
}

console.log("다섯 번 터진 뒤에도 노는 연결:", 새는풀.idleCount);
// 출력: 다섯 번 터진 뒤에도 노는 연결: 3

await 새는풀.end();

// ★★ `풀.end()` 도 **빌려준 연결이 있으면 안 끝납니다.**
//   테스트가 안 끝나고 멈춰 있다면 십중팔구 `release()` 를 빠뜨린 것입니다.


// ── 섹션 6: 풀 크기를 어떻게 정하나 ──

// ★ 크게 잡으면 좋을 것 같지만 **아닙니다.**
//
// 먼저 데이터베이스가 받아 줄 수 있는 한계를 봅니다.

const 최대연결 = (await 풀.query("SHOW max_connections")).rows[0].max_connections;
const 예약분 = (await 풀.query("SHOW superuser_reserved_connections")).rows[0].superuser_reserved_connections;

console.log("이 서버의 max_connections:", 최대연결, "· 관리자 예약:", 예약분);
// 출력: 이 서버의 max_connections: 100 · 관리자 예약: 3

// ★★ 100 이 전부입니다. 그런데 이건 **서버 전체**의 숫자입니다.
//   서버 4대에 각자 `max: 30` 이면 120 이라 넘칩니다. 그러면 이 에러가 납니다.
//
//     53300  sorry, too many clients already
//
//   ★ 계산: (서버 대수 × 풀 max) + 배치 + 마이그레이션 + 사람이 붙는 psql
//     이 합계가 (max_connections − superuser_reserved) 보다 작아야 합니다.
//
// ★ 그럼 얼마로 잡나 — 많이 잡는다고 빨라지지 않습니다.
//   연결을 100개 열어도 CPU 가 4개면 동시에 4개만 진짜로 일합니다.
//   나머지는 문맥 교환 비용만 늘립니다. 출발점으로 많이 쓰는 값은 이렇습니다.
//
//     풀 크기 = CPU 코어 수 × 2 + 디스크 개수     → 4코어면 10 안팎
//
//   `pg.Pool` 의 기본값도 10 입니다. 그 뒤에는 **재 보고** 정하세요.
//
// ★ `풀.waitingCount` 가 꾸준히 0 보다 크면 풀이 작은 것입니다.
//   그런데 **쿼리가 느려서** 그런 경우가 더 많습니다. 그때는 06단원(색인)이 답입니다.

console.log("pg.Pool 의 기본 max:", new pg.Pool({ ...접속정보 }).options.max);
// 출력: pg.Pool 의 기본 max: 10

// ★ 서버 대수가 많아지면 애플리케이션 풀만으로 부족합니다.
//   그때는 DB 앞에 **PgBouncer** 같은 연결 중개기를 둡니다.
//   수천 개의 애플리케이션 연결을 수십 개의 실제 연결로 줄여 줍니다.
//   10단원(운영)에서 이름을 다시 봅니다.


// ── 섹션 7: ★★★ 트랜잭션은 반드시 같은 연결에서 ──

// 여기서 틀리면 **데이터가 깨집니다.** 이 파일에서 가장 중요한 섹션입니다.
//
// 이렇게 쓰고 싶어집니다. 짧고 깔끔해 보입니다.
//
//   await 풀.query("BEGIN");
//   await 풀.query("UPDATE ...");
//   await 풀.query("COMMIT");
//
// **안 됩니다.** `풀.query` 는 **매번 다른 연결을 쓸 수 있습니다.**
//
// 트랜잭션은 연결에 붙어 있는 상태입니다.
// `BEGIN` 을 A 연결에 보내고 `UPDATE` 를 B 연결에 보내면,
// B 는 트랜잭션 밖이라 **그 자리에서 커밋됩니다.**
//
// 진짜로 깨 봅니다.

await 풀.query("UPDATE 잔고 SET 값 = 100 WHERE 계정 = 'A라인'");

// ★ 두 문장을 `await` 없이 **동시에** 던집니다.
//   풀은 놀고 있는 연결이 있으면 그걸 주고, 없으면 새로 만듭니다.
//   그래서 이 둘은 **서로 다른 연결**로 갑니다.

const 시작보내기 = 풀.query("BEGIN");
const 고치기보내기 = 풀.query("UPDATE 잔고 SET 값 = 999 WHERE 계정 = 'A라인'");

await Promise.all([시작보내기, 고치기보내기]);

await 풀.query("ROLLBACK");

const 롤백뒤값 = (await 풀.query("SELECT 값 FROM 잔고 WHERE 계정 = 'A라인'")).rows[0].값;

console.log("ROLLBACK 을 했는데 잔고:", 롤백뒤값);
// 출력: ROLLBACK 을 했는데 잔고: 999

console.log("롤백이 됐나 (100 이어야 정상):", 롤백뒤값 === 100);
// 출력: 롤백이 됐나 (100 이어야 정상): false

// ★★★ **롤백이 안 됐습니다.** 에러도 안 났습니다.
//   `UPDATE` 가 트랜잭션 밖의 다른 연결로 가서 곧바로 커밋됐고, `ROLLBACK` 은
//   또 다른 연결에서 경고 하나 남기고 끝났습니다.
//   07단원에서 배운 **원자성**이 통째로 사라졌습니다.
//   돈을 옮기는 코드라면 한쪽만 빠지고 한쪽은 안 들어옵니다.
//
// ★ 게다가 **부하가 없으면 안 납니다.** 혼자 테스트하면 늘 같은 연결이 잡혀서 잘 됩니다.
//   손님이 몰리는 순간에만 깨집니다. 최악의 버그입니다.

// 제대로 하는 법 — 연결을 하나 빌려서 **그 연결에만** 보냅니다.

async function 트랜잭션으로(할일) {
  const 빌린것 = await 풀.connect();

  try {
    await 빌린것.query("BEGIN");
    const 결과 = await 할일(빌린것);      // ★ 빌린 연결을 그대로 넘겨 줍니다
    await 빌린것.query("COMMIT");
    return 결과;
  } catch (에러) {
    await 빌린것.query("ROLLBACK");
    throw 에러;
  } finally {
    빌린것.release();
  }
}

await 풀.query("UPDATE 잔고 SET 값 = 100 WHERE 계정 = 'A라인'");

try {
  await 트랜잭션으로(async (연결) => {
    await 연결.query("UPDATE 잔고 SET 값 = 999 WHERE 계정 = 'A라인'");
    throw new Error("여기서 일이 터졌다고 칩시다");
  });
} catch {
  // 일부러 던진 것입니다
}

const 제대로롤백 = (await 풀.query("SELECT 값 FROM 잔고 WHERE 계정 = 'A라인'")).rows[0].값;

console.log("같은 연결로 하면 잔고:", 제대로롤백);
// 출력: 같은 연결로 하면 잔고: 100

console.log("이번에는 롤백이 됐나:", 제대로롤백 === 100);
// 출력: 이번에는 롤백이 됐나: true

// ★★ `트랜잭션으로` 같은 껍데기 함수를 하나 만들어 두고 **그것만 쓰세요.**
//   `BEGIN` 을 손으로 치는 곳이 코드에 남아 있으면 언젠가 위 사고가 납니다.
//   개념03 에서 이 함수를 저장소 계층과 어떻게 맞추는지 봅니다.
//
// ★ 같은 이유로 이런 것들도 `풀.query` 로 하면 안 됩니다.
//   · `SET search_path TO ...`   — 그 연결에만 걸립니다
//   · `CREATE TEMP TABLE ...`    — 그 연결에만 보입니다
//   · `LOCK TABLE ...`           — 그 연결의 트랜잭션에만 걸립니다
//   · `SET LOCAL ...`            — 트랜잭션 안에서만 삽니다
//
//   ★ 풀 전체에 걸고 싶은 설정은 풀을 만들 때 `options` 로 주세요.
//     `new pg.Pool({ ..., options: "-c search_path=단원08" })`


// ── 섹션 8: 타임아웃 세 가지 ──

// 기본값은 **전부 무제한**입니다. 그래서 아무 설정 없이 띄운 서버는
// 한 번 막히면 영원히 막힙니다. 세 개를 구분해서 알아 두세요.

// ① connectionTimeoutMillis — **풀에서 연결을 못 빌릴 때** 얼마나 기다리나
//    섹션 5 에서 이미 봤습니다. 이게 없으면 요청이 영원히 매달립니다.

// ② statement_timeout — **데이터베이스가** 쿼리를 얼마나 오래 돌리나
//    서버 쪽에서 잘라 줍니다. 그래서 확실합니다.

const 시간제한풀 = new pg.Pool({ ...접속정보, max: 2, statement_timeout: 300 });

try {
  await 시간제한풀.query("SELECT pg_sleep(2)");
} catch (에러) {
  console.log("statement_timeout:", 에러.code, "-", 에러.message);
}
// 출력: statement_timeout: 57014 - canceling statement due to statement timeout

console.log("풀은 살아 있나:", (await 시간제한풀.query("SELECT 1 AS 값")).rows[0].값 === 1);
// 출력: 풀은 살아 있나: true

// ★ 잘린 뒤에도 연결은 멀쩡합니다. 그 쿼리만 취소된 것입니다.

// ③ idleTimeoutMillis — **놀고 있는 연결**을 언제 정리하나
//    기본 10초입니다. 트래픽이 없을 때 연결을 붙잡고 있지 않게 해 줍니다.

const 노는것정리 = new pg.Pool({ ...접속정보, max: 2, idleTimeoutMillis: 300 });

await 노는것정리.query("SELECT 1");

console.log("쓴 직후 연결 수:", 노는것정리.totalCount);
// 출력: 쓴 직후 연결 수: 1

await new Promise((풀기) => setTimeout(풀기, 700));

console.log("0.7초 논 뒤 연결 수:", 노는것정리.totalCount);
// 출력: 0.7초 논 뒤 연결 수: 0

await 노는것정리.end();
await 시간제한풀.end();

// ★ 실무 출발점
//
//   new pg.Pool({
//     connectionString: process.env.DATABASE_URL,
//     max: 10,
//     connectionTimeoutMillis: 5000,     // 5초 안에 연결을 못 빌리면 포기
//     idleTimeoutMillis: 30000,          // 30초 놀면 정리
//     statement_timeout: 10000,          // 10초 넘는 쿼리는 서버가 자름
//   });
//
// ★ 배치나 마이그레이션은 값이 다릅니다. 풀을 따로 만드세요.
//   웹 요청용 풀에 10분짜리 집계 쿼리를 태우면 다른 손님이 다 굶습니다.


// ── 섹션 9: 풀도 닫아야 합니다 ──

// 웹 서버는 켜 놓고 계속 쓰니 닫을 일이 없습니다.
// 스크립트나 테스트는 **반드시** 닫아야 프로그램이 끝납니다.

const 이벤트기록 = [];
const 구경할풀 = new pg.Pool({ ...접속정보, max: 2 });

구경할풀.on("connect", () => 이벤트기록.push("connect"));
구경할풀.on("acquire", () => 이벤트기록.push("acquire"));
구경할풀.on("release", () => 이벤트기록.push("release"));

await 구경할풀.query("SELECT 1");
await 구경할풀.query("SELECT 1");
await 구경할풀.end();

console.log("풀 이벤트 차례:", 이벤트기록.join(" → "));
// 출력: 풀 이벤트 차례: connect → acquire → release → acquire → release

// ★ 첫 번째만 `connect` 가 있습니다. 두 번째는 있는 연결을 빌렸습니다. 이게 전부입니다.
//
// ★ 서버를 끌 때도 닫습니다. 안 닫으면 처리 중이던 요청이 잘립니다.
//
//   process.on("SIGTERM", async () => {
//     await 서버닫기();   // 새 요청 그만 받기
//     await 풀.end();     // 남은 쿼리 끝나면 연결 반납
//     process.exit(0);
//   });
//
// ★ `풀.end()` 는 **빌려준 연결이 다 돌아올 때까지** 기다립니다.
//   그래서 `release()` 를 빠뜨리면 여기서 영원히 멈춥니다.


// 뒷정리
await 풀.query("DROP TABLE IF EXISTS 잔고");
await 풀.end();
await 준비.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   무엇                       언제 쓰나                        주의
//   ─────────────────────────────────────────────────────────────────────────
//   pg.Client                  스크립트, 마이그레이션            연결 하나. 요청이 줄을 섭니다
//   pg.Pool                    웹 서버                          거의 항상 이것입니다
//   풀.query(...)              한 문장짜리                       매번 다른 연결일 수 있습니다
//   풀.connect() + release()   트랜잭션, SET, 임시 표            release 는 finally 에
//   풀.end()                   스크립트 끝, 서버 종료             빌려준 게 있으면 안 끝납니다
//
//   설정                        무엇을 재나                       없으면
//   ─────────────────────────────────────────────────────────────────────────
//   max                        연결을 몇 개까지 만드나            기본 10
//   connectionTimeoutMillis    연결을 빌리는 대기 시간            영원히 기다립니다
//   idleTimeoutMillis          노는 연결을 언제 정리하나          기본 10초
//   statement_timeout          쿼리 한 개의 최대 시간             영원히 돕니다
//
//   ★★★ 세 줄 요약
//     ① 서버에서는 Pool 을 씁니다. Client 하나로는 손님을 못 받습니다
//     ② 빌렸으면 finally 에서 돌려줍니다. 안 돌려주면 서비스가 멈춥니다
//     ③ 트랜잭션은 반드시 **빌린 연결 하나**에만 보냅니다


// ── MySQL 은 여기가 다릅니다 ──
//
//   · `mysql2/promise` 의 `createPool` 을 씁니다
//   · 돌려줄 때 `release()` 가 아니라 `connection.release()` — 이름은 같습니다
//   · `statement_timeout` 이 없습니다. `MAX_EXECUTION_TIME` 힌트를 씁니다
//   ★ 자세한 비교는 09단원에서 합니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 의 8건을 40건으로 늘려 보세요. 몇 초가 걸리나요?
//                    풀 쪽은 얼마나 걸리나요? (풀은 max 10 이라 4번에 나눠 돕니다)
//
// ✏️ 직접 해보기 2 — 섹션 3 의 풀을 `max: 1` 로 만들어 보세요.
//                    연결 하나짜리 Client 와 시간이 같아지나요?
//
// ✏️ 직접 해보기 3 — 섹션 5 에서 `connectionTimeoutMillis` 를 지워 보세요.
//                    네 번째 요청이 어떻게 되나요? (★ Ctrl+C 로 끄셔야 합니다)
//
// ✏️ 직접 해보기 4 — 섹션 7 의 깨지는 코드를 `Promise.all` 없이
//                    `await 풀.query("BEGIN")` 처럼 하나씩 기다리게 바꿔 보세요.
//                    잔고가 100 이 되나요? 그럼 이 코드는 안전한가요?
//                    (힌트: 손님이 한 명일 때만 그렇습니다)
//
// ✏️ 직접 해보기 5 — `statement_timeout` 을 10 밀리초로 줄여 보세요.
//                    평범한 `SELECT 1` 도 잘리나요?
//
// ✏️ 직접 해보기 6 — 풀에 `풀.on("error", ...)` 를 달고 `docker compose restart postgres`
//                    를 해 보세요. 어떤 에러가 오나요?
//                    (★ 이 핸들러가 없으면 서버가 통째로 죽습니다)
//
// ✏️ 직접 해보기 7 — 30개 요청을 동시에 던지면서 `풀.waitingCount` 를 찍어 보세요.
//                    언제 0 이 아니게 되나요?


// ── 자주 하는 실수 ──

// [실수 1] 요청마다 `new pg.Pool(...)` 을 만듦
//   풀은 **앱에 하나**입니다. 요청마다 만들면 연결이 폭발해 `53300` 을 보게 됩니다.
//   모듈 하나에서 만들어 `export` 하고 모두가 그걸 가져다 쓰세요.

// [실수 2] `release()` 를 정상 경로에만 씀
//   `try` 블록 끝에 두면 에러가 났을 때 안 돌아옵니다.
//   반드시 `finally` 에 두세요. 이 실수 하나가 서비스를 멈춥니다.

// [실수 3] `client.end()` 를 부름
//   빌린 연결에 `end()` 를 부르면 풀은 그 연결이 돌아오기를 계속 기다립니다.
//   빌린 것에는 `release()`, 풀 자체에는 `end()` 입니다.

// [실수 4] 트랜잭션을 `풀.query` 로 함
//   섹션 7 에서 본 대로 롤백이 안 됩니다. 그리고 **부하가 있을 때만** 깨집니다.
//   테스트에서는 절대 안 잡힙니다.

// [실수 5] 풀 크기를 크게 잡으면 빨라진다고 생각함
//   DB 의 CPU 는 그대로입니다. 100 으로 잡으면 문맥 교환만 늘고 더 느려집니다.
//   그리고 서버를 여러 대 띄우면 `max_connections` 를 넘겨 버립니다.

// [실수 6] `풀.on("error", ...)` 를 안 달아 둠
//   **놀고 있는** 연결이 끊기면 (DB 재시작 등) 풀이 `error` 를 냅니다.
//   핸들러가 없으면 Node 의 규칙에 따라 **프로세스가 통째로 죽습니다.** 한 줄이면 됩니다.
//   `풀.on("error", (에러) => console.error(에러.message));`

// [실수 7] 타임아웃을 하나도 안 걸어 둠
//   기본값이 전부 무제한입니다. 느린 쿼리 하나가 풀을 다 채우면 그 순간부터
//   아무 요청도 못 받습니다. 최소한 `statement_timeout` 은 거세요.
