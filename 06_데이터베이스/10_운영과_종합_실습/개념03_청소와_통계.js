// ============================================================
// 10단원 · 개념 03 — 청소와 통계
// ------------------------------------------------------------
// 실행: node 개념03_청소와_통계.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ VACUUM 을 여러 번 돌려서 20초쯤 걸립니다.
// ============================================================
//
// 03단원에서 이런 걸 쟀습니다.
//
//   10만 건을 한 문장으로 고쳤더니 표 크기가 7.2 MB → 14.3 MB.
//   **정확히 두 배**가 됐습니다.
//
// 그리고 이렇게 설명했습니다.
//   "Postgres 는 줄을 고칠 때 그 자리를 덮어쓰지 않습니다.
//    새 줄을 뒤에 쓰고, 옛 줄에 '죽었다' 고 표시합니다."
//
// 07단원에서는 이렇게 미뤘습니다.
//   "누군가 치워야 합니다. 그게 VACUUM 입니다.
//    그리고 **긴 트랜잭션이 열려 있으면 치우지 못합니다.**"
//   "VACUUM 과 부풀림을 제대로 다루는 것은 10단원에서 합니다."
//
// 그 빚을 여기서 전부 갚습니다. 재면서 갚습니다.
//
//   ① 왜 죽은 줄이 생기는가 (MVCC)
//   ② 얼마나 부푸는가 — 직접 재기
//   ③ VACUUM 이 하는 일 — ★ 파일을 안 줄입니다. 그런데도 효과가 있습니다
//   ④ VACUUM FULL 이 하는 일 — 줄입니다. 대신 서비스가 멈춥니다
//   ⑤ ★★ 긴 트랜잭션이 청소를 막는 것 — 눈으로 보여 드립니다
//   ⑥ autovacuum 과 ANALYZE

import pg from "pg";


// ── 섹션 0: 연결 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-vacuum", // ★ 영어로
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


// ── 섹션 1: 왜 청소가 필요한가 ──

// 07단원에서 배운 것을 한 문장으로 다시 씁니다.
//
//   **Postgres 는 줄을 고칠 때 그 자리를 덮어쓰지 않습니다.**
//   새 줄을 뒤에 쓰고, 옛 줄에 "이 시점 이후로는 죽음" 이라고 표시합니다.
//
// 왜 이렇게 할까요. 그래야 **같은 순간에 읽고 있던 사람**이 옛 값을 볼 수 있으니까요.
// 이걸 MVCC(Multi-Version Concurrency Control, 여러 판을 두는 동시성 제어)라고 합니다.
// 07단원에서 "읽기는 쓰기를 안 막는다" 고 했던 것의 정체가 이겁니다.
//
// 값을 직접 확인할 수 있습니다. 줄마다 숨은 칸이 붙어 있습니다.

await 연결.query("DROP TABLE IF EXISTS 청소시험 CASCADE");

await 연결.query(`
  CREATE TABLE 청소시험 (
    번호 INT PRIMARY KEY,
    값   TEXT NOT NULL
  )
`);

await 연결.query("INSERT INTO 청소시험 VALUES (1, '처음')");

// ★ ctid = 이 줄이 몇 번째 쪽, 몇 번째 자리에 있는지
//   xmin  = 어느 트랜잭션이 이 줄을 만들었는지
const 고치기전 = await 연결.query("SELECT ctid::text AS 자리, xmin::text AS 만든이 FROM 청소시험 WHERE 번호 = 1");

await 연결.query("UPDATE 청소시험 SET 값 = '고침' WHERE 번호 = 1");

const 고친뒤 = await 연결.query("SELECT ctid::text AS 자리, xmin::text AS 만든이 FROM 청소시험 WHERE 번호 = 1");

console.log(`고치기 전 자리: ${고치기전.rows[0].자리} / 고친 뒤 자리: ${고친뒤.rows[0].자리}`);
// 출력?: 고치기 전 자리: (0,1) / 고친 뒤 자리: (0,2)

console.log("줄이 다른 자리로 옮겨 갔나:", 고치기전.rows[0].자리 !== 고친뒤.rows[0].자리);
// 출력: 줄이 다른 자리로 옮겨 갔나: true

console.log("만든 트랜잭션 번호가 바뀌었나:", 고치기전.rows[0].만든이 !== 고친뒤.rows[0].만든이);
// 출력: 만든 트랜잭션 번호가 바뀌었나: true

// ★ `(0,1)` 에 있던 줄이 `(0,2)` 로 갔습니다. **덮어쓴 게 아닙니다.**
//   `(0,1)` 은 아직 그 자리에 있습니다. 죽은 것으로 표시됐을 뿐입니다.
//   지금은 아무도 안 보지만, 자리는 차지하고 있습니다.
//
// ★★ DELETE 도 똑같습니다. 지웠다고 표시만 합니다.
//   03단원에서 "DELETE 후에도 자리가 남아 있는가: true" 를 봤던 이유가 이것입니다.


// ── 섹션 2: ★★ 얼마나 부푸는지 직접 재기 ──

// 03단원의 그 측정을 다시 합니다. 이번엔 Docker 위에서, 여러 번 반복해서요.

const 크기 = async () =>
  Number(
    (
      await 연결.query("SELECT pg_relation_size('단원10.청소시험'::regclass)::int AS 바이트")
    ).rows[0].바이트,
  );

const 킬로 = (바이트) => `${Math.round(바이트 / 1024)}kB`;

// ★ `pg_relation_size` 는 **표 본체만** 잽니다.
//   03단원에서 쓴 `pg_total_relation_size` 는 색인까지 합칩니다.
//   여기서는 표가 부푸는 것만 보려고 본체만 잽니다.

async function 표새로만들기() {
  await 연결.query("DROP TABLE IF EXISTS 청소시험 CASCADE");
  await 연결.query("CREATE TABLE 청소시험 (번호 INT PRIMARY KEY, 값 TEXT NOT NULL)");
  await 연결.query("INSERT INTO 청소시험 SELECT g, '처음' FROM generate_series(1, 50000) g");
  await 연결.query("VACUUM FULL 청소시험"); // 딱 붙은 상태에서 시작합니다
}

// ★★ 이 DB 는 다른 단원도 같이 씁니다. **남이** 긴 트랜잭션을 열어 두면
//   VACUUM 이 아무것도 못 치워서 측정이 통째로 흐려집니다. (그 이유는 섹션 5 에서 봅니다)
//   그래서 측정을 하나로 묶고, **깨끗하게 나올 때까지 다시 잽니다.**
//   측정에서는 이런 방해를 걷어 내야 합니다. 실제로 이 파일이 그것 때문에 뒤집혔습니다.
async function 부풀림과청소재기() {
  await 표새로만들기();

  const 처음크기 = await 크기();

  await 연결.query("UPDATE 청소시험 SET 값 = '한번'");
  const 한번뒤 = await 크기();

  await 연결.query("UPDATE 청소시험 SET 값 = '두번'");
  const 두번뒤 = await 크기();

  const 줄통계 = await 죽은줄세기();

  // VACUUM — 파일은 그대로인데 안이 비워집니다
  await 연결.query("VACUUM 청소시험");
  const 청소후 = await 크기();

  // 비워 둔 자리를 다시 쓰는지 봅니다
  await 연결.query("UPDATE 청소시험 SET 값 = '세번'");
  const 청소하고고친뒤 = await 크기();

  // VACUUM FULL — 파일을 진짜로 줄입니다
  const 풀청소시작 = performance.now();
  await 연결.query("VACUUM FULL 청소시험");
  const 풀청소시간 = performance.now() - 풀청소시작;
  const 풀청소후 = await 크기();

  return { 처음크기, 한번뒤, 두번뒤, 줄통계, 청소후, 청소하고고친뒤, 풀청소시간, 풀청소후 };
}

// ★ 죽은 줄 수는 **조금 늦게** 옵니다. 통계는 따로 모아서 나중에 반영됩니다.
//   바로 읽으면 0 이 나옵니다. 실제로 그 함정에 빠졌습니다.
async function 죽은줄세기() {
  const 읽기 = async () => {
    await 연결.query("ANALYZE 청소시험");

    const 결과 = await 연결.query(`
      SELECT n_live_tup::int AS 산줄, n_dead_tup::int AS 죽은줄
      FROM pg_stat_user_tables WHERE schemaname = '단원10' AND relname = '청소시험'
    `);

    return 결과.rows[0] ?? { 산줄: 0, 죽은줄: 0 };
  };

  let 값 = await 읽기();

  for (let 다시 = 0; 값.죽은줄 === 0 && 다시 < 12; 다시 += 1) {
    await 잠깐(500);
    값 = await 읽기();
  }

  return 값;
}

let 잰것 = await 부풀림과청소재기();

// ★ 판정 두 개가 다 참이어야 방해가 없었던 것입니다.
//   ① VACUUM 뒤에 고쳤는데 안 커졌다 → 빈자리를 재사용했다
//   ② VACUUM FULL 뒤에 처음 크기로 돌아왔다 → 죽은 줄을 다 치웠다
const 깨끗한가 = (재본것) =>
  재본것.청소하고고친뒤 === 재본것.청소후 && 재본것.풀청소후 === 재본것.처음크기;

for (let 다시 = 0; !깨끗한가(잰것) && 다시 < 10; 다시 += 1) {
  await 잠깐(800);
  잰것 = await 부풀림과청소재기();
}

const { 처음크기, 한번뒤, 두번뒤, 줄통계, 청소후, 청소하고고친뒤, 풀청소시간, 풀청소후 } = 잰것;

console.log(`처음 ${킬로(처음크기)} → 1회 UPDATE ${킬로(한번뒤)} → 2회 UPDATE ${킬로(두번뒤)}`);
// 출력?: 처음 2168kB → 1회 UPDATE 4328kB → 2회 UPDATE 6488kB

console.log("1회 고쳤더니 2배 가까이 됐나:", 한번뒤 / 처음크기 > 1.9 && 한번뒤 / 처음크기 < 2.1);
// 출력: 1회 고쳤더니 2배 가까이 됐나: true

console.log("2회 고쳤더니 3배 가까이 됐나:", 두번뒤 / 처음크기 > 2.9 && 두번뒤 / 처음크기 < 3.1);
// 출력: 2회 고쳤더니 3배 가까이 됐나: true

console.log("산 줄 / 죽은 줄:", JSON.stringify(줄통계));
// 출력?: 산 줄 / 죽은 줄: {"산줄":100000,"죽은줄":100000}

console.log("죽은 줄이 생겼나:", 줄통계.죽은줄 > 0);
// 출력: 죽은 줄이 생겼나: true

// ★ `산줄` 은 **어림값**입니다. ANALYZE 가 표본만 보고 추정하기 때문에
//   실제(5만)보다 크게 나오기도 합니다. 이 자료를 만들 때 10만으로 나온 적이 있습니다.
//   ★★ 정확히 세려면 `pgstattuple` 확장을 쓰거나 `count(*)` 를 직접 하세요.
//     운영에서는 어림값으로 충분합니다. "많다/적다" 만 보면 되니까요.

// ★★★ 5만 건을 두 번 고쳤더니 죽은 줄이 10만 개 생겼습니다.
//   위에서 잰 크기가 그것을 말해 줍니다. 표가 **세 배**가 됐습니다.
//   디스크의 3분의 2가 아무도 안 보는 쓰레기입니다.
//
//   이게 왜 문제인가
//     · 디스크가 세 배로 늡니다. 꽉 차면 데이터베이스가 멈춥니다
//     · ★ **순차 훑기가 세 배 느려집니다.** 쓰레기까지 읽어야 하니까요
//     · 캐시에도 쓰레기가 올라갑니다. 진짜 데이터가 밀려납니다
//     · 백업도 세 배가 됩니다


// ── 섹션 3: VACUUM — ★ 파일을 안 줄입니다 ──

// 여기서 대부분이 오해합니다.
// "VACUUM 을 돌리면 표가 작아지겠지" 라고 생각합니다. **아닙니다.**

console.log(`VACUUM 전 ${킬로(두번뒤)} → VACUUM 후 ${킬로(청소후)}`);
// 출력?: VACUUM 전 6488kB → VACUUM 후 6488kB

console.log("파일이 작아졌나:", 청소후 < 두번뒤);
// 출력: 파일이 작아졌나: false

// ★ 하나도 안 줄었습니다. 그럼 VACUUM 은 뭘 한 걸까요.
//
//   **죽은 줄을 지워서 그 자리를 "다시 써도 되는 빈칸" 으로 만듭니다.**
//   파일 크기는 그대로인데, 안이 비었습니다.
//
// 진짜 효과는 다음 UPDATE 에서 나타납니다.

console.log(`VACUUM 하고 또 UPDATE → ${킬로(청소하고고친뒤)}`);
// 출력?: VACUUM 하고 또 UPDATE → 6488kB

console.log("이번엔 안 커졌나:", 청소하고고친뒤 === 청소후);
// 출력: 이번엔 안 커졌나: true

// ★★ **이게 VACUUM 의 진짜 효과입니다.**
//
//   앞의 두 번은 고칠 때마다 2544kB 씩 늘었습니다.
//   VACUUM 을 돌린 뒤에는 고쳐도 **한 바이트도 안 늘었습니다.**
//   비워 둔 자리에 새 줄이 들어갔기 때문입니다.
//
//   그래서 VACUUM 을 꾸준히 돌리면 표 크기가 **어느 선에서 멈춥니다.**
//   안 돌리면 계속 자랍니다. 그게 부풀림(bloat)입니다.
//
// ★ VACUUM 이 하는 다른 일들
//   · 죽은 줄이 가리키던 색인 항목도 같이 치웁니다
//   · 가시성 지도(visibility map)를 갱신합니다 → 06단원의 Index Only Scan 이 가능해집니다
//   · 트랜잭션 번호를 얼립니다(freeze) → 번호가 한 바퀴 도는 사고를 막습니다
//   · 통계는 갱신하지 **않습니다**. 그건 ANALYZE 입니다 (섹션 7)


// ── 섹션 4: VACUUM FULL — 줄입니다. 대신 멈춥니다 ──

// 파일을 진짜로 줄이려면 `VACUUM FULL` 입니다.
// 표를 통째로 새로 써서 옆에 만들고, 옛 것을 버립니다.

console.log(`VACUUM FULL 후: ${킬로(풀청소후)} (${풀청소시간.toFixed(0)} ms 걸림)`);
// 출력?: VACUUM FULL 후: 2168kB (79 ms 걸림)

console.log("원래 크기로 돌아왔나:", 풀청소후 === 처음크기);
// 출력: 원래 크기로 돌아왔나: true

// ★★★ 그런데 **운영에서는 함부로 쓰면 안 됩니다.**
//
//   `VACUUM FULL` 은 그 표에 **ACCESS EXCLUSIVE 잠금**을 겁니다. (07단원)
//   그 표를 읽지도 쓰지도 못합니다. 읽기까지 막힙니다.
//   100GB 짜리 표면 **몇 시간** 걸립니다. 그동안 서비스가 멈춥니다.
//
//   게다가 새 표를 옆에 만들기 때문에 **디스크가 잠깐 두 배** 필요합니다.
//   디스크가 꽉 차서 VACUUM FULL 을 돌리려는 상황이면 그것마저 실패합니다.

// 잠금을 진짜로 거는지 확인해 봅니다.
const 읽는사람 = await 새연결("unit10-vacuum-lock");

await 연결.query("BEGIN");
await 연결.query("LOCK TABLE 청소시험 IN ACCESS EXCLUSIVE MODE"); // VACUUM FULL 이 잡는 것과 같은 잠금

await 읽는사람.query("SET lock_timeout = '300ms'");

let 읽기결과 = "읽었음";

try {
  await 읽는사람.query("SELECT count(*) FROM 청소시험");
} catch (에러) {
  읽기결과 = 에러.code;
}

console.log("ACCESS EXCLUSIVE 중에 SELECT 하면:", 읽기결과, "(55P03 = 잠금을 못 잡음)");
// 출력: ACCESS EXCLUSIVE 중에 SELECT 하면: 55P03 (55P03 = 잠금을 못 잡음)

await 연결.query("ROLLBACK");
await 읽는사람.query("SET lock_timeout = 0");

// ★ 운영에서 부푼 표를 줄여야 한다면
//   · `pg_repack` 확장을 쓰세요. 거의 안 잠그고 같은 일을 합니다
//   · 아니면 새 표에 복사하고 이름을 바꾸세요 (개념04 의 확장 → 이전 → 축소)
//   · `VACUUM FULL` 은 **서비스를 세워도 되는 시간**에만


// ── 섹션 5: ★★★ 긴 트랜잭션이 청소를 막습니다 ──

// 이 파일에서 제일 중요한 섹션입니다. 07단원이 예고한 그것입니다.
//
// VACUUM 은 죽은 줄을 아무 때나 못 치웁니다.
// **아직도 그 줄을 볼 수 있는 사람이 있으면** 못 치웁니다.
//
// 07단원의 격리 수준을 떠올려 보세요.
// REPEATABLE READ 로 트랜잭션을 열면 그 순간의 사진을 계속 봅니다.
// 그 사람이 아직 안 끝났으면, 그 사진에 찍힌 옛 줄들을 지울 수 없습니다.
//
// 실제로 해 봅니다. **같은 실험을 두 번** 합니다. 방해 없이 한 번, 방해하며 한 번.

async function 세번고치고청소하기() {
  await 표새로만들기();

  const 기록 = [await 크기()];

  for (let 회차 = 0; 회차 < 3; 회차 += 1) {
    await 연결.query(`UPDATE 청소시험 SET 값 = '판${회차}'`);
    await 연결.query("VACUUM 청소시험");
    기록.push(await 크기());
  }

  return 기록;
}

// ── ① 방해 없이 ──
//
// ★ 이 DB 는 다른 단원도 같이 씁니다. **남이** 긴 트랜잭션을 열어 두면
//   비교 대상인 "없음" 쪽도 청소가 막혀서 결과가 흐려집니다.
//   그래서 깨끗하게 나올 때까지 다시 잽니다. 측정에서는 방해를 걷어 내야 합니다.
let 방해없이 = await 세번고치고청소하기();

for (let 다시 = 0; 방해없이[3] > 방해없이[1] && 다시 < 8; 다시 += 1) {
  await 잠깐(700);
  방해없이 = await 세번고치고청소하기();
}

console.log("방해 없음:", 방해없이.map(킬로).join(" → "));
// 출력?: 방해 없음: 2168kB → 4328kB → 4328kB → 4328kB

console.log("한 번 늘고 그 뒤로는 안 늘었나:", 방해없이[3] === 방해없이[1]);
// 출력: 한 번 늘고 그 뒤로는 안 늘었나: true

// ── ② 긴 트랜잭션을 열어 두고 ──

const 방해꾼 = await 새연결("unit10-blocker");

// ★★ 격리 수준이 중요합니다.
//   READ COMMITTED(기본)로 BEGIN 만 해 두면 **문장이 끝날 때 사진을 놓습니다.**
//   그래서 놀고 있는 READ COMMITTED 트랜잭션은 청소를 막지 **않습니다.**
//   REPEATABLE READ 는 트랜잭션이 끝날 때까지 사진을 쥐고 있습니다. 이게 막습니다.
//   (쓰기를 한 트랜잭션은 READ COMMITTED 라도 막습니다. 자기 번호가 살아 있으니까요)
await 방해꾼.query("BEGIN ISOLATION LEVEL REPEATABLE READ");

// ★★★ 여기를 잘 보세요. **`SELECT 1` 입니다.**
//   방해꾼은 `청소시험` 표를 건드리지도 않았습니다.
//   REPEATABLE READ 는 **첫 문장에서** 데이터베이스 전체의 사진을 찍습니다.
//   무슨 문장이든 상관없습니다. 그 순간부터 청소가 막힙니다.
//
//   ★ 그래서 "우리 표를 쓰는 코드는 다 확인했는데요" 는 소용이 없습니다.
//     전혀 상관없는 화면 하나가 트랜잭션을 안 닫고 있어도 막힙니다.
await 방해꾼.query("SELECT 1");

const 방해받으며 = await 세번고치고청소하기();

console.log("긴 트랜잭션 있음:", 방해받으며.map(킬로).join(" → "));
// 출력?: 긴 트랜잭션 있음: 2168kB → 4328kB → 6488kB → 8656kB

console.log("VACUUM 을 돌렸는데도 계속 커졌나:", 방해받으며[3] > 방해받으며[1]);
// 출력: VACUUM 을 돌렸는데도 계속 커졌나: true

console.log("방해받은 쪽이 더 큰가:", 방해받으며[3] > 방해없이[3]);
// 출력: 방해받은 쪽이 더 큰가: true

// ★★★ **VACUUM 을 세 번 돌렸는데 표가 계속 자랐습니다.**
//   명령은 성공했습니다. 에러도 없습니다. 그냥 아무것도 못 치운 것입니다.

// VACUUM 이 직접 말해 줍니다. VERBOSE 를 켜면 알림으로 이유가 옵니다.
const 알림들 = [];
연결.on("notice", (메시지) => 알림들.push(메시지.message));

await 연결.query("UPDATE 청소시험 SET 값 = '또'");
await 연결.query("VACUUM (VERBOSE) 청소시험");

const 못치운줄 = 알림들.join("\n").match(/(\d+) are dead but not yet removable/);

console.log("VACUUM 이 남긴 말:", 못치운줄 ? 못치운줄[0] : "없음");
// 출력?: VACUUM 이 남긴 말: 200000 are dead but not yet removable

console.log("'아직 치울 수 없다' 고 했나:", 못치운줄 !== null);
// 출력: '아직 치울 수 없다' 고 했나: true

// 누가 막고 있는지도 찾을 수 있습니다.
const 범인 = await 연결.query(`
  SELECT application_name AS 이름표, state,
         age(backend_xmin) > 0 AS 오래된사진을쥠
  FROM pg_stat_activity
  WHERE backend_xmin IS NOT NULL AND application_name = 'unit10-blocker'
`);

console.log("막고 있는 세션:", JSON.stringify(범인.rows[0]));
// 출력: 막고 있는 세션: {"이름표":"unit10-blocker","state":"idle in transaction","오래된사진을쥠":true}

await 방해꾼.query("ROLLBACK");
await 방해꾼.end();

// 방해꾼이 끝나면 바로 치울 수 있게 됩니다.
await 연결.query("VACUUM 청소시험");
const 풀린뒤 = await 크기();

await 연결.query("UPDATE 청소시험 SET 값 = '풀린뒤'");
const 풀린뒤고침 = await 크기();

console.log(`방해꾼이 끝난 뒤 UPDATE → ${킬로(풀린뒤)} 에서 ${킬로(풀린뒤고침)}`);
// 출력?: 방해꾼이 끝난 뒤 UPDATE → 10424kB 에서 10424kB

console.log("다시 자리를 재사용하나:", 풀린뒤고침 === 풀린뒤);
// 출력: 다시 자리를 재사용하나: true

// ★★★ 그래서 운영에서 이렇게 합니다.
//
//   ① `idle_in_transaction_session_timeout` 을 걸어 두세요 (07단원)
//        BEGIN 하고 노는 연결을 서버가 알아서 끊습니다
//   ② 오래된 트랜잭션을 감시하세요
//        SELECT pid, application_name, state, now() - xact_start AS 나이
//        FROM pg_stat_activity
//        WHERE xact_start < now() - interval '5 min' ORDER BY xact_start;
//   ③ 배치를 한 트랜잭션으로 묶지 마세요. 만 건씩 끊어서 커밋하세요 (03단원)
//
// ★ 사람이 psql 을 열어 놓고 점심 먹으러 간 것도 같은 사고입니다.
//   REPEATABLE READ 나 쓰기를 했다면 그동안 청소가 멈춰 있습니다.


// ── 섹션 6: autovacuum — 알아서 도는 청소부 ──

// 다행히 손으로 VACUUM 을 돌릴 일은 거의 없습니다.
// Postgres 는 청소부를 상시 돌립니다. `autovacuum` 입니다.

const 자동설정 = await 연결.query(`
  SELECT current_setting('autovacuum')                          AS 켜짐,
         current_setting('autovacuum_vacuum_threshold')          AS 기본줄수,
         current_setting('autovacuum_vacuum_scale_factor')       AS 비율,
         current_setting('autovacuum_naptime')                   AS 쉬는시간
`);

console.log("autovacuum 설정:", JSON.stringify(자동설정.rows[0]));
// 출력: autovacuum 설정: {"켜짐":"on","기본줄수":"50","비율":"0.2","쉬는시간":"1min"}

// ★ 언제 도나 — 공식이 있습니다
//
//     죽은 줄 > autovacuum_vacuum_threshold + (표의 줄 수 × autovacuum_vacuum_scale_factor)
//     죽은 줄 > 50 + (줄 수 × 0.2)
//
//   즉 **줄의 20% 가 죽으면** 돕니다.

const 언제도나 = await 연결.query(`
  SELECT n_live_tup::int AS 산줄,
         (50 + n_live_tup * 0.2)::int AS 필요한죽은줄,
         n_dead_tup::int AS 지금죽은줄
  FROM pg_stat_user_tables WHERE schemaname = '단원10' AND relname = '청소시험'
`);

console.log("청소시험 표:", JSON.stringify(언제도나.rows[0]));
// 출력?: 청소시험 표: {"산줄":50000,"필요한죽은줄":10050,"지금죽은줄":200000}

// ★★ 20% 규칙의 함정
//
//   1000줄짜리 표면 250줄만 죽어도 돕니다. 자주 돕니다. 좋습니다.
//   ★ **1억 줄짜리 표는 2000만 줄이 죽어야 돕니다.**
//     그때쯤이면 이미 표가 크게 부풀어 있고, 청소도 오래 걸립니다.
//
//   그래서 큰 표는 표마다 따로 낮춰 줍니다.
//
//     ALTER TABLE 큰표 SET (autovacuum_vacuum_scale_factor = 0.01);   -- 1%
//     ALTER TABLE 큰표 SET (autovacuum_vacuum_threshold = 1000);
//
// ★ 왜 autovacuum 이 안 돌 때가 있나 — 실무에서 만나는 순서대로
//
//   ① 긴 트랜잭션이 막고 있다        → 섹션 5. **제일 흔합니다**
//   ② 20% 에 아직 안 닿았다          → 큰 표. scale_factor 를 낮추세요
//   ③ 일꾼이 모자란다               → autovacuum_max_workers (기본 3)
//                                     표가 수천 개면 순번이 안 옵니다
//   ④ 너무 얌전하다                 → autovacuum_vacuum_cost_delay
//                                     일부러 천천히 돕니다. 못 따라가면 줄이세요
//   ⑤ 그 표만 꺼져 있다             → ALTER TABLE ... SET (autovacuum_enabled = false)
//                                     누가 꺼 놓고 잊은 경우입니다
//   ⑥ 잠금 때문에 못 들어간다        → VACUUM 도 잠깐 잠금이 필요합니다
//
// ★ 마지막으로 언제 돌았는지 보는 질의입니다. 그대로 쓰세요.
//
//   SELECT relname, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze,
//          n_live_tup, n_dead_tup
//   FROM pg_stat_user_tables
//   ORDER BY n_dead_tup DESC LIMIT 20;
//
// ★★ `log_autovacuum_min_duration = 0` 을 켜 두세요.
//   청소가 언제 얼마나 걸렸는지 로그에 남습니다. (개념02)


// ── 섹션 7: ANALYZE 와 통계 ──

// VACUUM 은 청소입니다. **통계는 갱신하지 않습니다.**
// 통계는 `ANALYZE` 가 모읍니다. 06단원에서 본 그것입니다.

await 연결.query("DROP TABLE IF EXISTS 통계시험 CASCADE");
await 연결.query("CREATE TABLE 통계시험 (번호 INT, 상태 TEXT)");
await 연결.query(`
  INSERT INTO 통계시험
  SELECT g, CASE WHEN g % 10000 = 0 THEN '고장' ELSE '정상' END
  FROM generate_series(1, 100000) g
`);

const 통계전 = await 연결.query(`
  SELECT relpages::int AS 쪽수, reltuples::int AS 줄수
  FROM pg_class WHERE oid = '단원10.통계시험'::regclass
`);

console.log("ANALYZE 전:", JSON.stringify(통계전.rows[0]), "(-1 = 모른다는 뜻)");
// 출력: ANALYZE 전: {"쪽수":0,"줄수":-1} (-1 = 모른다는 뜻)

await 연결.query("ANALYZE 통계시험");

const 통계후 = await 연결.query(`
  SELECT relpages::int AS 쪽수, reltuples::int AS 줄수
  FROM pg_class WHERE oid = '단원10.통계시험'::regclass
`);

console.log("ANALYZE 후:", JSON.stringify(통계후.rows[0]));
// 출력?: ANALYZE 후: {"쪽수":541,"줄수":100000}

console.log("이제 줄 수를 아나:", 통계후.rows[0].줄수 > 0);
// 출력: 이제 줄 수를 아나: true

// 통계가 실제로 어떻게 생겼는지 볼 수 있습니다.
const 분포 = await 연결.query(`
  SELECT most_common_vals::text AS 흔한값, most_common_freqs::text AS 비율
  FROM pg_stats WHERE schemaname = '단원10' AND tablename = '통계시험' AND attname = '상태'
`);

console.log("가장 흔한 값:", 분포.rows[0].흔한값);
// 출력?: 가장 흔한 값: {정상,고장}

console.log("정상이 흔한 값 목록에 있나:", 분포.rows[0].흔한값.includes("정상"));
// 출력: 정상이 흔한 값 목록에 있나: true

// ★★ 플래너는 이 통계를 보고 계획을 세웁니다. 06단원에서 본 그대로입니다.
//   통계가 낡으면 계획이 뒤집힙니다. 색인을 써야 할 때 안 쓰고, 안 써야 할 때 씁니다.
//
// ★ 그래서 **대량으로 넣거나 고친 직후에는 손으로 ANALYZE 를 돌리세요.**
//   autoanalyze 는 10% 가 바뀌어야 돕니다. 그때까지는 통계가 낡아 있습니다.
//   06단원에서 "대량 작업 뒤에는 손으로 ANALYZE 를 돌리세요" 라고 한 이유입니다.
//
//   VACUUM ANALYZE 표이름;     ← 둘을 같이 하는 명령입니다


// ── 섹션 8: ★ VACUUM 은 다른 문장과 같이 못 넣습니다 ──

// 마지막으로 실무에서 꼭 걸리는 것 하나.

let 트랜잭션안결과 = "성공";

try {
  await 연결.query("BEGIN; VACUUM 통계시험; COMMIT;");
} catch (에러) {
  트랜잭션안결과 = `${에러.code} — ${에러.message}`;
}

await 연결.query("ROLLBACK").catch(() => {});

console.log("트랜잭션 안에서 VACUUM:", 트랜잭션안결과);
// 출력: 트랜잭션 안에서 VACUUM: 25001 — VACUUM cannot run inside a transaction block

// ★★ 왜 안 되나
//   VACUUM 은 여러 트랜잭션에 걸쳐서 조금씩 일합니다.
//   자기가 트랜잭션 안에 있으면 그렇게 할 수가 없습니다.
//
// ★ 걸리는 곳
//   · 마이그레이션 도구 (08단원) — 파일마다 BEGIN 을 겁니다. VACUUM 을 넣으면 실패합니다
//   · ORM 의 트랜잭션 안
//   · `pg` 의 `query` 에 세미콜론으로 이어 붙인 문장 (지금 본 것)
//
// ★ 같은 이유로 안 되는 것들
//   CREATE INDEX CONCURRENTLY   (개념04 에서 봅니다)
//   CREATE DATABASE
//   ALTER SYSTEM
//
// 혼자 보내면 잘 됩니다.
await 연결.query("VACUUM 통계시험");

console.log("혼자 보내면 되나: true");
// 출력: 혼자 보내면 되나: true


// 뒷정리
await 연결.query("DROP TABLE IF EXISTS 청소시험, 통계시험 CASCADE");
await 읽는사람.end();
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   명령                 파일 크기   잠금            언제
//   ────────────────────────────────────────────────────────────────────
//   VACUUM               그대로     거의 안 막음     autovacuum 이 알아서
//   VACUUM FULL          줄어듦     ★ 전부 막음      서비스를 세울 수 있을 때만
//   ANALYZE              그대로     거의 안 막음     대량 작업 직후에 손으로
//   VACUUM ANALYZE       그대로     거의 안 막음     둘을 같이
//   TRUNCATE             0 이 됨    ★ 전부 막음      전부 지울 때 (03단원)
//
//   보는 곳                          무엇이 보이나
//   ────────────────────────────────────────────────────────────────────
//   pg_stat_user_tables              죽은 줄 수, 마지막 청소 시각
//   pg_relation_size(표)             표 본체 크기
//   pg_total_relation_size(표)       색인까지 합친 크기
//   VACUUM (VERBOSE)                 몇 개를 치웠고 몇 개를 못 치웠는지
//   pgstattuple(표)                  ★ 진짜로 훑어서 정확히 셈 (느립니다. 큰 표엔 쓰지 마세요)
//   pg_stat_activity.backend_xmin    누가 옛 사진을 쥐고 있는지
//
//   설정                                     기본값   큰 표라면
//   ────────────────────────────────────────────────────────────────────
//   autovacuum_vacuum_scale_factor           0.2      0.01 ~ 0.05
//   autovacuum_vacuum_threshold              50       1000
//   autovacuum_max_workers                   3        표가 많으면 늘리기
//   log_autovacuum_min_duration              10min    0 (전부 남기기)
//   idle_in_transaction_session_timeout      0        60s ~ 5min
//
// ★★★ 꼭 기억할 것
//   ① UPDATE 는 덮어쓰지 않습니다. 새로 쓰고 옛 줄을 죽었다고 표시합니다
//   ② 그래서 고칠 때마다 표가 커집니다. 두 번 고치면 세 배가 됩니다 — 실제로 쟀습니다
//   ③ **VACUUM 은 파일을 안 줄입니다.** 빈자리를 만들어 다음에 재사용하게 합니다
//   ④ VACUUM FULL 은 줄입니다. 대신 표를 통째로 잠급니다. 운영에서는 조심하세요
//   ⑤ ★★ **긴 트랜잭션이 열려 있으면 VACUUM 이 아무것도 못 치웁니다.** 에러도 안 납니다
//   ⑥ 큰 표는 20% 규칙이 너무 늦습니다. scale_factor 를 표마다 낮추세요
//   ⑦ VACUUM 은 통계를 갱신하지 않습니다. 그건 ANALYZE 입니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 UPDATE 를 5번으로 늘려 보세요.
//                    표가 정확히 6배가 되나요? 비례하나요?
//
// ✏️ 직접 해보기 2 — 섹션 2 에서 `pg_relation_size` 를 `pg_total_relation_size` 로
//                    바꿔 보세요. 숫자가 어떻게 달라지나요? (힌트: 색인도 부풉니다)
//
// ✏️ 직접 해보기 3 — 섹션 5 의 `REPEATABLE READ` 를 `READ COMMITTED` 로 바꿔 보세요.
//                    이번에도 청소가 막히나요? 왜 다를까요?
//
// ✏️ 직접 해보기 4 — 섹션 5 에서 방해꾼이 `SELECT` 대신 `UPDATE` 를 하게 해 보세요.
//                    READ COMMITTED 라도 막히나요? (힌트: 자기 번호가 살아 있습니다)
//
// ✏️ 직접 해보기 5 — `ALTER TABLE 청소시험 SET (autovacuum_vacuum_scale_factor = 0.01);`
//                    을 걸고 UPDATE 를 한 뒤 1분쯤 기다려 보세요.
//                    `last_autovacuum` 이 채워지나요?
//
// ✏️ 직접 해보기 6 — 섹션 4 의 `LOCK TABLE` 을 `IN SHARE MODE` 로 바꿔 보세요.
//                    이번에도 SELECT 가 막히나요? (힌트: 07단원의 잠금 표)
//
// ✏️ 직접 해보기 7 — 섹션 7 에서 `ANALYZE` 를 빼고 06단원처럼 EXPLAIN 을 찍어 보세요.
//                    플래너가 `고장` 이 몇 줄이라고 추정하나요? 실제와 얼마나 다른가요?


// ── 자주 하는 실수 ──

// [실수 1] "VACUUM 을 돌렸는데 디스크가 안 줄었어요"
//   VACUUM 은 원래 안 줄입니다. 안을 비워서 재사용하게 만듭니다.
//   ★ 줄이려면 VACUUM FULL 인데, 그건 표를 통째로 잠급니다.

// [실수 2] 운영 시간에 VACUUM FULL 을 돌림
//   그 표를 읽지도 쓰지도 못합니다. 100GB 면 몇 시간입니다.
//   ★ pg_repack 을 쓰거나, 서비스를 세워도 되는 시간에 하세요.

// [실수 3] 긴 트랜잭션을 열어 두고 "왜 청소가 안 되지" 함
//   섹션 5 그대로입니다. VACUUM 은 성공했다고 나오는데 아무것도 안 치웁니다.
//   ★ `pg_stat_activity` 에서 오래된 `xact_start` 를 먼저 찾으세요.

// [실수 4] 큰 표에 기본 설정을 그대로 둠
//   1억 줄이면 2000만 줄이 죽어야 청소가 시작됩니다. 이미 늦습니다.
//   ★ 큰 표는 `autovacuum_vacuum_scale_factor` 를 0.01 로 낮추세요.

// [실수 5] autovacuum 을 꺼 버림
//   "청소하느라 느려지니까 끄자" 는 몇 주 뒤에 훨씬 큰 사고로 돌아옵니다.
//   트랜잭션 번호가 한 바퀴 돌면 데이터베이스가 **읽기 전용으로 멈춥니다.**
//   ★ 끄지 말고, `autovacuum_vacuum_cost_delay` 로 속도를 조절하세요.

// [실수 6] 대량 INSERT 후 ANALYZE 를 안 함
//   통계가 없으면 플래너가 "0쪽 / -1줄" 로 봅니다. 계획이 엉뚱해집니다.
//   ★ 대량 작업 뒤에는 `VACUUM ANALYZE 표이름;` 을 돌리세요.

// [실수 7] VACUUM 을 마이그레이션 파일에 넣음
//   마이그레이션 도구는 파일마다 BEGIN 을 겁니다. 25001 로 실패합니다.
//   ★ 트랜잭션 밖에서 따로 돌리세요. (08단원의 그 예외 표시)

// [실수 8] 죽은 줄만 보고 색인 부풀림을 놓침
//   표를 청소해도 색인은 따로 부풉니다. 색인이 표보다 커져 있기도 합니다.
//   ★ `pg_total_relation_size` 와 `pg_indexes_size` 를 같이 보세요. (06단원)
