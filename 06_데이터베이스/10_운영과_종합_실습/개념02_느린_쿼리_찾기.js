// ============================================================
// 10단원 · 개념 02 — 느린 쿼리 찾기
// ------------------------------------------------------------
// 실행: node 개념02_느린_쿼리_찾기.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 일부러 기다리는 실험이 있어서 15초쯤 걸립니다.
// ============================================================
//
// "서비스가 느려요."
//
// 이 말을 들으면 사람들은 대개 이렇게 합니다.
// 코드를 들여다보다가 "이 쿼리가 좀 이상한데" 하고 고칩니다.
// 그리고 아무것도 안 빨라집니다.
//
//   ★★★ **감으로 찾지 마세요. 재서 찾으세요.**
//
// 눈으로 봐서 느려 보이는 쿼리와 실제로 시간을 잡아먹는 쿼리는
// 거의 항상 다릅니다. 이 파일에서 그걸 숫자로 보여 드립니다.
//
// 06단원에서 EXPLAIN ANALYZE 로 **한 쿼리가 왜 느린지** 보는 법을 배웠습니다.
// 그런데 그건 "어느 쿼리를 볼지" 를 이미 알고 있을 때 이야기입니다.
// 이 파일은 그 앞 단계입니다. **어느 쿼리를 볼지 찾는 법**입니다.
//
//   ① pg_stat_statements   — 쌓인 통계로 범인 찾기
//   ② 느린 쿼리 로그        — 오래 걸린 것만 기록으로 남기기
//   ③ pg_stat_activity     — 지금 이 순간 돌고 있는 것 보기
//   ④ auto_explain         — 느린 것의 실행계획을 자동으로 남기기

import pg from "pg";
import { execSync } from "node:child_process";


// ── 섹션 0: 연결 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-slow", // ★ 영어로. 한글을 넣으면 16진수로 깨져 보입니다
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

// 실습용 표를 매번 새로 만듭니다.
await 연결.query("DROP TABLE IF EXISTS 느린점검 CASCADE");

await 연결.query(`
  CREATE TABLE 느린점검 (
    점검번호 INT PRIMARY KEY,
    설비번호 INT NOT NULL,
    라인     TEXT NOT NULL,
    결과     TEXT NOT NULL,
    점검일   DATE NOT NULL
  )
`);

await 연결.query(`
  INSERT INTO 느린점검
  SELECT g, (g % 500) + 1, (ARRAY['A','B','C'])[(g % 3) + 1],
         (ARRAY['정상','주의','고장'])[(g % 3) + 1],
         DATE '2026-01-01' + (g % 200)
  FROM generate_series(1, 120000) g
`);

await 연결.query("ANALYZE 느린점검");

console.log("실습용 표:", (await 연결.query("SELECT count(*)::int AS 수 FROM 느린점검")).rows[0].수, "건");
// 출력: 실습용 표: 120000 건


// ── 섹션 1: pg_stat_statements — 켜는 법 ──

// Postgres 에는 **모든 쿼리의 통계를 자동으로 쌓아 주는** 확장이 있습니다.
// 06단원에서 "10단원에서 pg_stat_statements 로 합니다" 라고 미뤄 뒀던 그것입니다.
//
// 먼저 확장을 만들어 봅니다.

let 만들기결과 = "성공";

try {
  await 연결.query("CREATE EXTENSION IF NOT EXISTS pg_stat_statements");
} catch (에러) {
  만들기결과 = 에러.code;
}

console.log("CREATE EXTENSION 결과:", 만들기결과);
// 출력: CREATE EXTENSION 결과: 성공

// 만들어졌습니다. 그럼 조회해 봅니다.

let 조회에러 = null;

try {
  await 연결.query("SELECT count(*) FROM pg_stat_statements");
} catch (에러) {
  조회에러 = `${에러.code} — ${에러.message}`;
}

console.log("조회하면:", 조회에러);
// 출력: 조회하면: 55000 — pg_stat_statements must be loaded via "shared_preload_libraries"

// ★★★ **이게 이 확장에서 제일 많이 만나는 에러입니다.**
//
//   `CREATE EXTENSION` 은 성공합니다. 그런데 읽으면 실패합니다.
//   확장은 만들어졌는데 **통계를 모으는 부분이 안 켜져 있기** 때문입니다.
//
//   pg_stat_statements 는 모든 쿼리를 가로채야 해서
//   **서버가 시작할 때** 메모리에 올라와 있어야 합니다.
//   나중에 켤 수가 없습니다. 그래서 재시작이 필요합니다.
//
// ★ 켜는 법 (postgresql.conf)
//
//     shared_preload_libraries = 'pg_stat_statements'
//     pg_stat_statements.max = 10000       ← 몇 종류까지 기억할지
//     pg_stat_statements.track = top       ← top(직접 부른 것만) / all(함수 안까지)
//
//   그리고 **서버를 재시작합니다.** 그 뒤에 `CREATE EXTENSION` 을 합니다.
//
// ★★ 이 자료의 컨테이너는 다른 단원들이 같이 쓰고 있어서 재시작을 하지 않습니다.
//   그래서 섹션 2 는 **pg_stat_statements 와 똑같은 방식으로 세는 사본**을 만들어
//   그 통계를 어떻게 읽는지 연습합니다. 읽는 법은 완전히 같습니다.
//
//   ★ 여러분의 서버에서는 위 설정을 넣고 재시작한 뒤 진짜로 써 보세요.

await 연결.query("DROP EXTENSION IF EXISTS pg_stat_statements");

// pg_stat_statements 가 켜져 있으면 이런 칸들이 보입니다.
//
//   칸 이름            뜻
//   ──────────────────────────────────────────────────────────────
//   query             정규화된 쿼리 ($1, $2 로 바뀐 모양)
//   calls             몇 번 불렸나
//   total_exec_time   ★ 전부 합쳐 몇 ms 를 썼나  ← 제일 중요합니다
//   mean_exec_time    한 번에 평균 몇 ms
//   max_exec_time     제일 오래 걸린 한 번
//   rows              돌려준 줄 수의 합
//   shared_blk_read_time  디스크에서 읽느라 쓴 시간


// ── 섹션 2: ★★★ 총 시간이 긴 쿼리가 범인입니다 ──

// 여기가 이 파일에서 제일 중요한 섹션입니다.
//
// pg_stat_statements 와 **똑같은 방식**으로 세는 작은 사본을 만듭니다.
// 쿼리를 정규화해서(값을 $1 로 바꿔서) 같은 모양끼리 묶고,
// 호출 횟수와 걸린 시간을 더합니다. 진짜 확장이 하는 일이 이것입니다.

const 통계 = new Map();

// ★ 정규화 — 값이 다른 같은 모양의 쿼리를 하나로 묶습니다.
//   `WHERE 설비번호 = 3` 과 `WHERE 설비번호 = 7` 은 같은 쿼리입니다.
function 정규화(문장) {
  return 문장
    .replace(/\s+/g, " ")
    // ★ 따옴표로 감싼 값과 숫자를 한 번에 `$1` 로 바꿉니다.
    //   ★★ 바꿀 글자에 쓰는 `$$` 는 달러 하나를 뜻합니다. 그냥 "$1" 로 쓰면
    //     자바스크립트가 **첫 번째 괄호 그룹**으로 알아들어서 엉뚱하게 나옵니다.
    //   ★★★ `(?<!\$)` 는 "앞에 달러가 없는 숫자만" 이라는 뜻입니다.
    //     이게 없으면 이미 파라미터인 `$1` 의 1 까지 바꿔서 `$$1` 이 됩니다.
    //     실제로 이 실수를 했고, 출력에 `$$1` 이 찍혀서 알았습니다.
    .replace(/'[^']*'|(?<!\$)\b\d+\b/g, "$$1")
    .trim();
}

async function 재면서질의(문장, 값들 = []) {
  const 시작 = performance.now();
  const 결과 = await 연결.query(문장, 값들);
  const 걸린 = performance.now() - 시작;

  const 열쇠 = 정규화(문장);
  const 이전 = 통계.get(열쇠) ?? { 호출: 0, 총시간: 0, 최대: 0 };

  통계.set(열쇠, {
    호출: 이전.호출 + 1,
    총시간: 이전.총시간 + 걸린,
    최대: Math.max(이전.최대, 걸린),
  });

  return 결과;
}

// ── 두 종류의 쿼리를 섞어서 돌립니다 ──
//
//   ① 목록 쿼리   — 아주 빠릅니다. 그런데 화면을 열 때마다 부릅니다 (2000번)
//   ② 월간 집계   — 눈에 띄게 느립니다. 그런데 하루에 몇 번 안 부릅니다 (5번)
//
// 어느 쪽이 서버 시간을 더 먹고 있을까요?

await 연결.query("CREATE INDEX 느린점검_설비 ON 느린점검 (설비번호)");
await 연결.query("ANALYZE 느린점검");

for (let 회차 = 0; 회차 < 2000; 회차 += 1) {
  await 재면서질의("SELECT 점검번호, 결과 FROM 느린점검 WHERE 설비번호 = $1 LIMIT 10", [(회차 % 500) + 1]);
}

for (let 회차 = 0; 회차 < 5; 회차 += 1) {
  await 재면서질의(`
    SELECT 라인, count(*)::int AS 건수
    FROM 느린점검 WHERE 결과 <> '정상'
    GROUP BY 라인 ORDER BY 건수 DESC
  `);
}

const 쌓인것 = [...통계.entries()].map(([문장, 값]) => ({
  문장: 문장.slice(0, 42),
  호출: 값.호출,
  총시간: 값.총시간,
  평균: 값.총시간 / 값.호출,
}));

// ── 평균으로 줄 세우면 ──
console.log("[평균이 긴 순서]");
// 출력: [평균이 긴 순서]

for (const 줄 of [...쌓인것].sort((가, 나) => 나.평균 - 가.평균)) {
  console.log(`  ${줄.평균.toFixed(2)} ms/회 · ${줄.호출}회 · ${줄.문장}`);
}
// 출력?:   11.62 ms/회 · 5회 · SELECT 라인, count(*)::int AS 건수 FROM 느린점검 W
// 출력?:   0.57 ms/회 · 2000회 · SELECT 점검번호, 결과 FROM 느린점검 WHERE 설비번호 = $1 

// ── 총 시간으로 줄 세우면 ──
console.log("[총 시간이 긴 순서]");
// 출력: [총 시간이 긴 순서]

for (const 줄 of [...쌓인것].sort((가, 나) => 나.총시간 - 가.총시간)) {
  console.log(`  총 ${줄.총시간.toFixed(0)} ms · ${줄.호출}회 · ${줄.문장}`);
}
// 출력?:   총 1131 ms · 2000회 · SELECT 점검번호, 결과 FROM 느린점검 WHERE 설비번호 = $1 
// 출력?:   총 58 ms · 5회 · SELECT 라인, count(*)::int AS 건수 FROM 느린점검 W

const 평균1등 = [...쌓인것].sort((가, 나) => 나.평균 - 가.평균)[0];
const 총시간1등 = [...쌓인것].sort((가, 나) => 나.총시간 - 가.총시간)[0];

console.log("평균 1등과 총시간 1등이 다른가:", 평균1등.문장 !== 총시간1등.문장);
// 출력: 평균 1등과 총시간 1등이 다른가: true

console.log("총시간 1등이 1회당으로는 더 빠른가:", 총시간1등.평균 < 평균1등.평균);
// 출력: 총시간 1등이 1회당으로는 더 빠른가: true

console.log(`총시간 1등은 ${총시간1등.호출}회, 평균 1등은 ${평균1등.호출}회 불렸습니다`);
// 출력: 총시간 1등은 2000회, 평균 1등은 5회 불렸습니다

console.log(`총시간 1등이 전체의 ${Math.round((총시간1등.총시간 / 쌓인것.reduce((합, 줄) => 합 + 줄.총시간, 0)) * 100)}퍼센트를 씀`);
// 출력?: 총시간 1등이 전체의 95퍼센트를 씀

// ★★★ **0.2ms 짜리가 범인입니다.**
//
//   "7ms 걸리는 집계 쿼리" 를 보면 누구나 저게 문제라고 생각합니다.
//   그런데 그건 5번밖에 안 불립니다. 합쳐서 35ms 입니다.
//
//   0.2ms 짜리는 빠릅니다. 눈으로 보면 아무 문제 없습니다.
//   그런데 2000번 불립니다. 합쳐서 424ms 입니다. **12배**입니다.
//
//   운영에서는 이 비율이 훨씬 극단적입니다.
//   0.1ms 짜리가 하루 100만 번이면 100초입니다.
//   1초짜리가 하루 10번이면 10초입니다. **10배 차이**입니다.
//
// ★★ 그래서 pg_stat_statements 를 볼 때는 **total_exec_time 으로 정렬합니다.**
//   mean 으로 정렬하면 하루에 한 번 도는 배치 쿼리만 잔뜩 나옵니다.
//
//   SELECT query, calls, round(total_exec_time) AS 총ms,
//          round(mean_exec_time::numeric, 2) AS 평균ms
//   FROM pg_stat_statements
//   ORDER BY total_exec_time DESC
//   LIMIT 20;
//
// ★ 그리고 고치는 방법도 다릅니다.
//   · 총시간 1등이 **호출이 많아서** 라면 → 캐시하거나, 아예 덜 부르게 만듭니다
//   · 총시간 1등이 **한 번이 느려서** 라면 → 색인이나 쿼리를 고칩니다 (06단원)
//
//   1등이 호출 200만 번짜리면 색인을 아무리 잘 걸어도 소용이 적습니다.
//   **부르는 횟수를 줄이는 게** 답입니다. 08단원의 N+1 문제가 대표적입니다.


// ── 섹션 3: 느린 쿼리 로그 ──

// pg_stat_statements 는 **합계**를 봅니다. 개별 사건은 안 남습니다.
// "어제 오후 3시에 뭐가 느렸나" 를 보려면 로그가 필요합니다.
//
// `log_min_duration_statement` 를 켜면 그 시간을 넘긴 쿼리만 로그에 남습니다.

console.log("기본값:", (await 연결.query("SHOW log_min_duration_statement")).rows[0].log_min_duration_statement, "(-1 = 안 남김)");
// 출력: 기본값: -1 (-1 = 안 남김)

// ★ 이 설정은 세션에서도 바꿀 수 있습니다. 실제로 켜고 느린 쿼리를 하나 만듭니다.
await 연결.query("SET log_min_duration_statement = '200ms'");

const 표식 = "SLOWQUERY_MARK";

// ★ 아래 두 줄은 SQL 에 글자를 끼워 넣습니다. 보통은 하면 안 되는 일입니다(03단원).
//   여기서는 **로그에서 이 줄을 찾으려고** 표식을 문장 안에 박는 것이고,
//   `표식` 은 바로 위에서 우리가 정한 상수입니다. 사용자 입력이 아닙니다.
//   ★★ 사용자에게서 온 값은 어떤 경우에도 이렇게 넣으면 안 됩니다. `$1` 을 쓰세요.
await 연결.query(`SELECT '${표식}' AS 표식, pg_sleep(0.35)`); // 검증무시: 표식은 우리가 정한 상수입니다
await 연결.query(`SELECT '${표식}' AS 표식, 1 AS 빠른것`); // 검증무시: 이건 빠르니 안 남아야 합니다

await 잠깐(1200); // 로그가 흘러나올 시간을 줍니다

// 이 컨테이너는 로그를 표준출력으로 내보냅니다. docker logs 로 읽습니다.
// ★ `--since 3s` 로 **최근 3초**만 봅니다.
//   `--tail` 로 보면 지난번 실행 때 남은 줄까지 같이 잡혀서 개수가 안 맞습니다.
const 로그 = execSync("docker logs --since 3s db-material-postgres 2>&1", {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

const 남은줄 = 로그.split("\n").filter((줄) => 줄.includes(표식) && 줄.includes("duration:"));

console.log("로그에 남은 줄 수:", 남은줄.length);
// 출력: 로그에 남은 줄 수: 1

console.log("남은 것이 pg_sleep 쪽인가:", 남은줄[0].includes("pg_sleep"));
// 출력: 남은 것이 pg_sleep 쪽인가: true

const 걸린시간 = Number(남은줄[0].match(/duration: ([\d.]+) ms/)[1]);

console.log(`로그가 적어 둔 시간: ${걸린시간.toFixed(0)} ms`);
// 출력?: 로그가 적어 둔 시간: 358 ms

console.log("200ms 를 넘겼나:", 걸린시간 > 200);
// 출력: 200ms 를 넘겼나: true

await 연결.query("SET log_min_duration_statement = -1");

// ★★ 값을 얼마로 잡을지가 중요합니다.
//
//   0        모든 쿼리를 남깁니다. ★ 절대 운영에서 쓰지 마세요.
//            로그 쓰느라 서버가 더 느려지고 디스크가 하루 만에 찹니다
//   200ms    보통 여기서 시작합니다. 사람이 느끼기 시작하는 지점입니다
//   1s       로그가 너무 많이 나올 때 올립니다
//
// ★ 짝이 되는 설정
//     log_min_duration_sample / log_statement_sample_rate  — 일부만 샘플로 남기기
//     log_lock_waits = on                                  — 잠금을 오래 기다린 것 (07단원)
//     log_temp_files = 0                                   — 임시 파일을 쓴 쿼리 (메모리 부족 신호)
//     log_autovacuum_min_duration = 0                      — 오래 걸린 청소 (개념03)


// ── 섹션 4: 지금 돌고 있는 것 보기 ──

// 위의 둘은 **지나간 일**입니다.
// "지금 서비스가 멈춰 있어요" 일 때는 지금 뭐가 도는지 봐야 합니다.
// `pg_stat_activity` 입니다.

const 느린놈 = await 새연결("unit10-victim");

// ★ await 를 안 겁니다. 띄워만 두고 아래로 내려갑니다. (07단원에서 쓴 방법입니다)
const 오래도는쿼리 = 느린놈
  .query("SELECT pg_sleep(30), count(*) FROM 느린점검")
  .then(() => "혼자 끝남")
  .catch((에러) => 에러.code);

await 잠깐(600);

// ★ 이 DB 는 다른 단원도 같이 씁니다. 내 이름표가 붙은 것만 봅니다.
const 돌고있는것 = await 연결.query(`
  SELECT state,
         left(query, 24)                            AS 문장,
         (now() - query_start) > interval '0.3 s'   AS 오래됨,
         wait_event_type                            AS 무엇을기다리나
  FROM pg_stat_activity
  WHERE application_name = 'unit10-victim'
`);

console.log("지금 돌고 있는 것:", JSON.stringify(돌고있는것.rows[0]));
// 출력: 지금 돌고 있는 것: {"state":"active","문장":"SELECT pg_sleep(30), cou","오래됨":true,"무엇을기다리나":"Timeout"}

// ★ 실무에서 쓰는 질의는 이렇게 생겼습니다. **그대로 쓰세요.**
//
//   SELECT pid, now() - query_start AS 걸린시간, state, wait_event_type, left(query, 80)
//   FROM pg_stat_activity
//   WHERE state <> 'idle' AND pid <> pg_backend_pid()
//   ORDER BY query_start;
//
// ★★ `state` 를 꼭 보세요. 셋의 뜻이 완전히 다릅니다.
//
//   active                 지금 진짜 일하는 중
//   idle                   아무것도 안 함. 정상입니다 (연결 풀이 잡고 있는 것)
//   idle in transaction    ★★ BEGIN 만 해 놓고 노는 중 — **제일 위험합니다**
//                          잠금을 쥐고, 청소를 막습니다 (개념03 에서 봅니다)


// ── 섹션 5: 죽이기 ──

// 찾았으면 죽여야 할 때가 있습니다. 두 가지가 있고 **많이 다릅니다.**

const 잡힌pid = (
  await 연결.query("SELECT pid FROM pg_stat_activity WHERE application_name = 'unit10-victim'")
).rows[0].pid;

// ① pg_cancel_backend — **쿼리만** 취소합니다. 연결은 살아 있습니다.
const 취소했나 = await 연결.query("SELECT pg_cancel_backend($1) AS 결과", [잡힌pid]);

console.log("pg_cancel_backend 가 참을 돌려줬나:", 취소했나.rows[0].결과);
// 출력: pg_cancel_backend 가 참을 돌려줬나: true

console.log("취소된 쿼리의 에러코드:", await 오래도는쿼리, "(57014 = 취소됨)");
// 출력: 취소된 쿼리의 에러코드: 57014 (57014 = 취소됨)

// 연결이 아직 살아 있는지 확인합니다.
console.log("취소 뒤에도 그 연결을 쓸 수 있나:", (await 느린놈.query("SELECT 1 AS 값")).rows[0].값 === 1);
// 출력: 취소 뒤에도 그 연결을 쓸 수 있나: true

// ② pg_terminate_backend — **연결을 끊습니다.** 훨씬 셉니다.
//
// ★★ 서버가 연결을 끊으면 pg 드라이버가 'error' 이벤트를 냅니다.
//   이걸 안 받아 두면 **노드 프로세스가 통째로 죽습니다.** 반드시 달아 두세요.
느린놈.on("error", () => {});

const 두번째쿼리 = 느린놈
  .query("SELECT pg_sleep(30)")
  .then(() => "혼자 끝남")
  .catch((에러) => 에러.code ?? "연결끊김");

await 잠깐(500);
await 연결.query("SELECT pg_terminate_backend($1)", [잡힌pid]);

console.log("terminate 뒤 에러코드:", await 두번째쿼리, "(57P01 = 관리자가 끊음)");
// 출력: terminate 뒤 에러코드: 57P01 (57P01 = 관리자가 끊음)

await 느린놈.end().catch(() => {}); // 이미 서버가 끊었을 수 있습니다

// ★★★ 어느 것을 쓰나
//
//   pg_cancel_backend      먼저 이걸 쓰세요. 쿼리만 멈추고 연결은 삽니다.
//                          트랜잭션은 열린 채로 남습니다 (그래서 안 풀릴 수도)
//   pg_terminate_backend   안 죽을 때만. 연결을 끊고 트랜잭션도 롤백됩니다.
//                          ★ 애플리케이션 쪽에서 에러가 납니다. 각오하고 쓰세요
//
// ★ 사람이 손으로 죽이지 않아도 되게 타임아웃을 걸어 두는 게 낫습니다. (07단원)
//     statement_timeout = '30s'
//     idle_in_transaction_session_timeout = '60s'
//     lock_timeout = '3s'


// ── 섹션 6: 찾았으면 원인을 봅니다 — 06단원으로 이어집니다 ──

// 범인을 찾았습니다. 이제 **왜** 느린지 봅니다. 여기서부터 06단원입니다.

async function 계획(sql) {
  const 결과 = await 연결.query(`EXPLAIN (ANALYZE) ${sql}`);
  return 결과.rows.map((줄) => 줄["QUERY PLAN"]).join("\n");
}

// 색인이 없는 칸으로 찾으면 어떻게 되는지 봅니다.
const 색인없는계획 = await 계획("SELECT count(*) FROM 느린점검 WHERE 라인 = 'A'");

console.log("라인으로 찾을 때 순차 훑기가 나오나:", 색인없는계획.includes("Seq Scan"));
// 출력: 라인으로 찾을 때 순차 훑기가 나오나: true

const 색인있는계획 = await 계획("SELECT count(*) FROM 느린점검 WHERE 설비번호 = 42");

console.log("설비번호로 찾을 때 색인을 쓰나:", 색인있는계획.includes("Index"));
// 출력: 설비번호로 찾을 때 색인을 쓰나: true

const 실행시간 = (계획글) => Number(계획글.match(/Execution Time: ([\d.]+) ms/)[1]);

console.log(`색인 없이 ${실행시간(색인없는계획).toFixed(1)} ms / 색인으로 ${실행시간(색인있는계획).toFixed(2)} ms`);
// 출력?: 색인 없이 12.3 ms / 색인으로 0.26 ms

console.log("색인 쪽이 더 빠른가:", 실행시간(색인있는계획) < 실행시간(색인없는계획));
// 출력: 색인 쪽이 더 빠른가: true

// ★★★ 06단원에서 배운 그 경고를 다시 합니다.
//   **EXPLAIN ANALYZE 는 진짜로 실행합니다.**
//   UPDATE 나 DELETE 에 붙이면 진짜로 고치고 진짜로 지웁니다.
//   운영에서 이걸로 사고가 납니다. 반드시 이렇게 하세요.
//
//     BEGIN;
//     EXPLAIN (ANALYZE) DELETE ...;
//     ROLLBACK;

const 지우기전 = (await 연결.query("SELECT count(*)::int AS 수 FROM 느린점검")).rows[0].수;

await 연결.query("BEGIN");
await 연결.query("EXPLAIN (ANALYZE) DELETE FROM 느린점검 WHERE 라인 = 'A'");
const 롤백전 = (await 연결.query("SELECT count(*)::int AS 수 FROM 느린점검")).rows[0].수;
await 연결.query("ROLLBACK");

const 롤백후 = (await 연결.query("SELECT count(*)::int AS 수 FROM 느린점검")).rows[0].수;

console.log(`계획만 봤는데 ${지우기전 - 롤백전}건이 진짜로 지워졌습니다`);
// 출력: 계획만 봤는데 40000건이 진짜로 지워졌습니다

console.log("ROLLBACK 으로 되살아났나:", 롤백후 === 지우기전);
// 출력: ROLLBACK 으로 되살아났나: true


// ── 섹션 7: auto_explain — 느린 것의 계획을 자동으로 남기기 ──

// 문제는 이겁니다. 새벽 3시에 느렸던 쿼리를 낮에 다시 돌리면 빠릅니다.
// 그때는 데이터가 달랐고, 캐시가 달랐고, 통계가 달랐습니다.
//
// `auto_explain` 은 **느릴 때 그 자리에서** 실행계획을 로그에 남겨 줍니다.

await 연결.query("LOAD 'auto_explain'"); // ★ 세션에서 켜 볼 수 있습니다
await 연결.query("SET auto_explain.log_min_duration = '5ms'");
await 연결.query("SET auto_explain.log_analyze = true");

const 표식2 = "AUTOEXPLAIN_MARK";

// ★ 색인이 없는 칸으로 12만 건을 훑고 정렬까지 시킵니다. 진짜로 느립니다.
//   ★★ `pg_sleep` 을 WHERE 에 넣지 마세요. **줄마다** 실행됩니다.
//     4만 줄이면 4만 번 잡니다. 영원히 안 끝납니다.
await 연결.query(`
  SELECT '${표식2}' AS 표식, 결과, count(*)::int AS 건수
  FROM 느린점검 WHERE 라인 <> 'Z'
  GROUP BY 결과 ORDER BY 건수 DESC
`);

await 잠깐(1200);

const 로그2 = execSync("docker logs --since 3s db-material-postgres 2>&1", {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

console.log("auto_explain 이 계획을 남겼나:", 로그2.includes("Seq Scan on") && 로그2.includes(표식2));
// 출력: auto_explain 이 계획을 남겼나: true

await 연결.query("SET auto_explain.log_min_duration = -1");

// ★ 운영에서 켜는 법 (postgresql.conf) — 재시작 없이 되는 방법도 있습니다
//
//     session_preload_libraries = 'auto_explain'    ← 새 연결부터 적용 (재시작 불필요)
//     auto_explain.log_min_duration = '500ms'
//     auto_explain.log_analyze = on                  ← ★ 실제 시간이 찍힙니다
//     auto_explain.log_buffers = on
//     auto_explain.log_nested_statements = on        ← 함수 안의 쿼리까지
//
// ★★ `log_analyze = on` 은 **모든 쿼리에 계측 비용이 붙습니다.**
//   느린 것만 로그에 남지만, 재는 것은 전부 잽니다.
//   처음엔 끄고 쓰다가, 필요할 때만 켜세요.


// 뒷정리
await 연결.query("DROP TABLE IF EXISTS 느린점검 CASCADE");
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   도구                  무엇을 보나                     언제 쓰나
//   ────────────────────────────────────────────────────────────────────────
//   pg_stat_statements    쿼리 종류별 누적 통계            "뭘 고쳐야 하지?"
//   느린 쿼리 로그          느렸던 개별 사건                "어제 3시에 뭐가 느렸지?"
//   pg_stat_activity      지금 돌고 있는 것                "지금 멈췄어요!"
//   auto_explain          느린 것의 실행계획               "왜 그때만 느리지?"
//   EXPLAIN ANALYZE       한 쿼리를 파고들기 (06단원)       "이건 왜 느리지?"
//
//   설정                                기본값   추천
//   ────────────────────────────────────────────────────────────────────────
//   log_min_duration_statement          -1      200ms 부터 시작
//   log_lock_waits                      off     on  (07단원의 잠금 대기)
//   log_temp_files                      -1      0   (메모리 부족 신호)
//   log_autovacuum_min_duration         10min   0   (개념03)
//   auto_explain.log_min_duration       -1      500ms (필요할 때만)
//
//   에러코드   뜻
//   ────────────────────────────────────────────────────────────────────────
//   55000     확장이 shared_preload_libraries 에 안 올라와 있음
//   57014     쿼리가 취소됨 (pg_cancel_backend 또는 statement_timeout)
//   57P01     관리자가 연결을 끊음 (pg_terminate_backend)
//
// ★★★ 꼭 기억할 것
//   ① **감으로 찾지 마세요. 재서 찾으세요.** 눈에 띄는 쿼리는 대개 범인이 아닙니다
//   ② pg_stat_statements 는 **total_exec_time** 으로 정렬합니다. mean 이 아닙니다
//   ③ 0.2ms × 2000번이 7ms × 5번보다 12배 나쁩니다. 실제로 재 봤습니다
//   ④ pg_stat_statements 는 재시작이 필요합니다. 미리 켜 두세요
//   ⑤ pg_cancel_backend 를 먼저, 안 되면 pg_terminate_backend
//   ⑥ `idle in transaction` 을 보면 바로 쫓아가세요. 제일 위험한 상태입니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 의 2000회를 200회로 줄여 보세요.
//                    이제 총시간 1등이 바뀌나요? 몇 회부터 뒤집히나요?
//
// ✏️ 직접 해보기 2 — 섹션 2 의 `정규화` 함수에서 숫자 치환 줄을 지워 보세요.
//                    통계가 몇 종류로 늘어나나요? 왜 정규화가 필요한지 보입니다.
//
// ✏️ 직접 해보기 3 — 섹션 3 의 `200ms` 를 `0` 으로 바꿔 보세요.
//                    로그에 몇 줄이 남나요? 운영에서 왜 위험한지 알 수 있습니다.
//
// ✏️ 직접 해보기 4 — 섹션 4 에서 `BEGIN` 만 하고 쿼리를 안 던지는 연결을 만들어 보세요.
//                    `state` 가 뭐라고 나오나요? (힌트: idle in transaction)
//
// ✏️ 직접 해보기 5 — 섹션 5 에서 `pg_cancel_backend` 를 `pg_terminate_backend` 로
//                    바꿔 보세요. 그 뒤 `느린놈.query("SELECT 1")` 이 되나요?
//
// ✏️ 직접 해보기 6 — 섹션 6 의 `느린점검_설비` 색인을 지우고 다시 돌려 보세요.
//                    설비번호 쿼리의 계획이 어떻게 바뀌나요?
//
// ✏️ 직접 해보기 7 — 여러분의 서버에 `shared_preload_libraries` 를 설정하고
//                    재시작한 뒤 진짜 pg_stat_statements 를 켜 보세요.
//                    total_exec_time 순으로 정렬하면 1등이 무엇인가요?


// ── 자주 하는 실수 ──

// [실수 1] 눈으로 코드를 훑어 느린 쿼리를 찾음
//   이 파일의 주제입니다. 눈에 띄는 쿼리와 시간을 먹는 쿼리는 다릅니다.
//   ★ 반드시 재세요. pg_stat_statements 하나면 몇 분 안에 끝납니다.

// [실수 2] mean_exec_time 으로 정렬함
//   하루에 한 번 도는 배치 쿼리만 1등으로 올라옵니다. 고쳐도 아무도 안 빨라집니다.
//   ★ total_exec_time 입니다. 예외 없습니다.

// [실수 3] `log_min_duration_statement = 0` 을 운영에 켜 둠
//   모든 쿼리가 로그에 남습니다. 로그 쓰느라 더 느려지고 디스크가 찹니다.
//   ★ 200ms 부터 시작해서 로그가 너무 많으면 올리세요.

// [실수 4] pg_stat_statements 를 사고 난 뒤에 켜려고 함
//   재시작이 필요합니다. 장애 중에 재시작을 하면 그게 두 번째 장애입니다.
//   ★ 서버를 만들 때 미리 켜 두세요. 부담은 거의 없습니다.

// [실수 5] pg_terminate_backend 를 먼저 씀
//   연결이 끊기면서 애플리케이션 쪽에 에러가 터집니다.
//   ★ pg_cancel_backend 를 먼저 쓰세요. 대개 그걸로 됩니다.

// [실수 6] 통계를 한 번도 초기화하지 않음
//   서버를 켠 뒤로 계속 쌓여서, 지난달 배치가 아직도 1등에 있습니다.
//   ★ 고친 뒤에는 `SELECT pg_stat_statements_reset();` 하고 다시 재세요.

// [실수 7] 느린 쿼리를 찾고 바로 색인부터 만듦
//   호출이 200만 번이면 색인으로는 별로 안 줄어듭니다.
//   ★ 먼저 물어보세요. "이걸 이렇게 많이 부를 필요가 있나?"
//   그 다음이 색인입니다. (08단원의 N+1)

// [실수 8] `pg_stat_activity` 에서 남의 세션까지 죽임
//   이 DB 는 여러 단원·여러 서비스가 같이 씁니다.
//   ★ `application_name` 으로 이름표를 달고 그것만 거르세요.
