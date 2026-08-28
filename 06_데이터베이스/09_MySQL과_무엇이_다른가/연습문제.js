// ============================================================
// 09단원 · 연습문제 — MySQL 과 무엇이 다른가
// ------------------------------------------------------------
// 실행: node 연습문제.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 13번 문제는 잠금을 기다려서 1~2초쯤 걸립니다.
// ============================================================
//
// `// TODO:` 자리를 채우고 실행하세요.
// 채점 코드가 **진짜 데이터베이스 두 개**에 SQL 을 보내서 확인합니다.
//
//   ⬜ 아직 안 풀었습니다   — 답을 안 채웠습니다
//   ✅ 정답                 — 통과했습니다
//   ❌ 다시                 — 답은 채웠는데 통과 못 했습니다
//
// 답은 하나가 아닌 문제도 있습니다. 채점을 통과하면 맞은 것입니다.
// 막히면 `연습문제_정답.js` 를 보세요. 왜 그런지까지 적어 두었습니다.

import pg from "pg";
import mysql from "mysql2/promise";


// ── 준비 ──

const 피지설정 = { host: "127.0.0.1", port: 5434, user: "factory", password: "secret", database: "factory_db" };
const 마이설정 = { host: "127.0.0.1", port: 3307, user: "factory", password: "secret", database: "factory_db" };

let PG = null;
let MY = null;
let MY2 = null;

try {
  PG = new pg.Client(피지설정);
  await PG.connect();
  MY = await mysql.createConnection(마이설정);
  MY2 = await mysql.createConnection(마이설정);
} catch (에러) {
  // 검증무시: Docker 가 없으면 여기로 옵니다.
  console.log("★ 데이터베이스에 못 붙었습니다:", 에러.code || 에러.message);
  console.log("  docker compose up -d 를 먼저 실행하세요.");
  if (PG) await PG.end().catch(() => {});
  if (MY) await MY.end().catch(() => {});
  process.exit(0);
}

await PG.query("CREATE SCHEMA IF NOT EXISTS 단원09");
await PG.query("SET search_path TO 단원09");

async function 피지(sql, 값 = []) {
  const 결과 = await PG.query(sql, 값);
  return 결과.rows;
}

async function 마이(sql, 값 = []) {
  const [행들] = await MY.query(sql, 값);
  return 행들;
}

const 안푼답 = Symbol("안품");

async function 채점(번호, 제목, 답, 검사) {
  const 비었나 = 답 === 안푼답 || 답 === null || 답 === undefined || (typeof 답 === "string" && 답.trim() === "");

  if (비었나) {
    console.log(`문제 ${번호} — ⬜ 아직 안 풀었습니다 · ${제목}`);
    return;
  }

  let 통과 = false;

  try {
    통과 = (await 검사(답)) === true;
  } catch (에러) {
    통과 = false;
  }

  console.log(`문제 ${번호} — ${통과 ? "✅ 정답" : "❌ 다시"} · ${제목}`);
}

console.log("=== 09단원 연습문제 ===");
// 출력: === 09단원 연습문제 ===


// ============================================================
// 문제 1 — MySQL 서버가 엄격한지 검사하기
// ============================================================
//
// MySQL 서버를 처음 만나면 `SELECT @@sql_mode` 를 봐야 합니다 (개념02).
// sql_mode 문자열을 받아서, **STRICT_TRANS_TABLES 와 ONLY_FULL_GROUP_BY 가
// 둘 다 켜져 있으면 true** 를 주는 함수를 만드세요.

// TODO: 아래 안푼답 을 함수로 바꾸세요.
//   예) const 답1 = (모드) => { ... };
const 답1 = 안푼답;

await 채점(1, "엄격한 sql_mode 인지 검사", 답1, (답) => {
  return (
    답("IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_DATE") === true &&
    답("NO_ENGINE_SUBSTITUTION") === false &&
    답("STRICT_TRANS_TABLES") === false
  );
});
// 출력: 문제 1 — ⬜ 아직 안 풀었습니다 · 엄격한 sql_mode 인지 검사


// ============================================================
// 문제 2 — `||` 를 양쪽에서 통하게 고치기
// ============================================================
//
// PostgreSQL 에서 `SELECT '설비' || 'A' AS 결과` 는 '설비A' 를 줍니다.
// MySQL 에 그대로 보내면 0 이 나옵니다 (`||` 가 OR 이라서).
//
// **양쪽에서 똑같이 '설비A' 가 나오는 SQL** 을 쓰세요.
// 결과 칸 이름은 `결과` 여야 합니다.

// TODO: SQL 을 문자열로 쓰세요.
const 답2 = 안푼답;

await 채점(2, "양쪽에서 글자 잇기", 답2, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return 가[0].결과 === "설비A" && 나[0].결과 === "설비A";
});
// 출력: 문제 2 — ⬜ 아직 안 풀었습니다 · 양쪽에서 글자 잇기


// ============================================================
// 문제 3 — 글자 수를 양쪽에서 똑같이 세기
// ============================================================
//
// `'설비🔧'` 는 글자 3 개입니다.
// PostgreSQL 의 `length()` 는 3 을 주지만 MySQL 의 `LENGTH()` 는 10 을 줍니다(바이트).
//
// **양쪽에서 3 이 나오는 SQL** 을 쓰세요. 칸 이름은 `개수` 입니다.

// TODO
const 답3 = 안푼답;

await 채점(3, "글자 수 세기", 답3, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return Number(가[0].개수) === 3 && Number(나[0].개수) === 3;
});
// 출력: 문제 3 — ⬜ 아직 안 풀었습니다 · 글자 수 세기


// ============================================================
// 문제 4 — NULL 을 맨 뒤로 보내기
// ============================================================
//
// 아래 자료를 정렬하면 PostgreSQL 은 NULL 을 맨 뒤에, MySQL 은 맨 앞에 둡니다.
//
//   SELECT x FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3) AS t
//
// **양쪽에서 1, 3, NULL 순서가 나오는 SQL** 을 쓰세요.
// ★ MySQL 에는 `NULLS LAST` 문법이 없습니다.

// TODO
const 답4 = 안푼답;

await 채점(4, "NULL 을 맨 뒤로", 답4, async (답) => {
  const 바른순서 = (행들) => 행들.length === 3 && 행들[0].x === 1 && 행들[1].x === 3 && 행들[2].x === null;
  return 바른순서(await 피지(답)) && 바른순서(await 마이(답));
});
// 출력: 문제 4 — ⬜ 아직 안 풀었습니다 · NULL 을 맨 뒤로


// ============================================================
// 문제 5 — 0 으로 나누기를 안전하게
// ============================================================
//
// `SELECT 100 / 0` 은 PostgreSQL 에서 에러(22012), MySQL 에서 NULL 입니다.
//
// **가동시간이 0 이어도 에러 없이 0 이 나오는 SQL** 을 쓰세요.
// 아래 식을 고치면 됩니다. 칸 이름은 `가동률` 입니다.
//
//   SELECT 100 / 0 AS 가동률

// TODO
const 답5 = 안푼답;

await 채점(5, "0 으로 나누기 막기", 답5, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return Number(가[0].가동률) === 0 && Number(나[0].가동률) === 0;
});
// 출력: 문제 5 — ⬜ 아직 안 풀었습니다 · 0 으로 나누기 막기


// ============================================================
// 문제 6 — PostgreSQL 의 CREATE TABLE 을 MySQL 용으로 바꾸기
// ============================================================
//
// 아래는 PostgreSQL 용 표 정의입니다.
//
//   CREATE TABLE 구구_문제6 (
//     id     SERIAL PRIMARY KEY,
//     이름   VARCHAR(50) NOT NULL,
//     가동   BOOLEAN DEFAULT true,
//     메모   JSONB
//   )
//
// **MySQL 에서 그대로 실행되는 CREATE TABLE 문**으로 바꿔 쓰세요.
// 표 이름은 `구구_문제6` 그대로 두세요.
//
// ★ 조건: id 는 자동 번호 + 기본키, 이름은 NOT NULL, 메모는 JSON 이어야 합니다.

// TODO
const 답6 = 안푼답;

await 채점(6, "CREATE TABLE 을 MySQL 용으로", 답6, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_문제6");
  await 마이(답);

  const 칸들 = await 마이(
    "SELECT COLUMN_NAME AS 이름, DATA_TYPE AS 타입, IS_NULLABLE AS 널허용, EXTRA AS 덤 " +
      "FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME='구구_문제6'",
  );
  const 찾기 = (이름) => 칸들.find((칸) => 칸.이름 === 이름);

  return (
    칸들.length === 4 &&
    찾기("id").덤 === "auto_increment" &&
    찾기("이름").널허용 === "NO" &&
    찾기("메모").타입 === "json"
  );
});
// 출력: 문제 6 — ⬜ 아직 안 풀었습니다 · CREATE TABLE 을 MySQL 용으로


// ============================================================
// 문제 7 — 파라미터 기호를 바꿔 주는 함수
// ============================================================
//
// PostgreSQL 의 `$1, $2, $3` 을 MySQL 의 `?` 로 바꾸는 함수를 만드세요.
//
//   "SELECT * FROM 설비 WHERE 라인=$1 AND 가동=$2"
//     → "SELECT * FROM 설비 WHERE 라인=? AND 가동=?"

// TODO: 함수로 바꾸세요.
const 답7 = 안푼답;

await 채점(7, "$1 을 ? 로 바꾸기", 답7, (답) => {
  return (
    답("SELECT * FROM 설비 WHERE 라인=$1 AND 가동=$2") === "SELECT * FROM 설비 WHERE 라인=? AND 가동=?" &&
    답("INSERT INTO 점검(설비,내용) VALUES ($1,$2)") === "INSERT INTO 점검(설비,내용) VALUES (?,?)" &&
    답("SELECT $10, $2") === "SELECT ?, ?"
  );
});
// 출력: 문제 7 — ⬜ 아직 안 풀었습니다 · $1 을 ? 로 바꾸기


// ============================================================
// 문제 8 — RETURNING 없이 방금 넣은 id 받기
// ============================================================
//
// PostgreSQL 은 `INSERT ... RETURNING id` 로 한 번에 받습니다.
// MySQL 에는 없습니다.
//
// 아래 함수를 완성하세요. **MySQL 에 한 건을 넣고 그 id 를 돌려줘야** 합니다.
// 표는 채점 코드가 미리 만들어 둡니다: `구구_문제8 (id INT AUTO_INCREMENT PRIMARY KEY, 내용 VARCHAR(30))`

// TODO: async (연결, 내용) => 새 id
const 답8 = 안푼답;

await 채점(8, "MySQL 에서 새 id 받기", 답8, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_문제8");
  await 마이("CREATE TABLE 구구_문제8 (id INT AUTO_INCREMENT PRIMARY KEY, 내용 VARCHAR(30))");

  const 첫번째 = await 답(MY, "첫 점검");
  const 두번째 = await 답(MY, "둘째 점검");

  const 확인 = await 마이("SELECT id, 내용 FROM 구구_문제8 ORDER BY id");

  return (
    Number(첫번째) === 확인[0].id &&
    Number(두번째) === 확인[1].id &&
    확인[0].내용 === "첫 점검" &&
    확인[1].내용 === "둘째 점검"
  );
});
// 출력: 문제 8 — ⬜ 아직 안 풀었습니다 · MySQL 에서 새 id 받기


// ============================================================
// 문제 9 — PostgreSQL 에서 대소문자를 무시하는 중복 막기
// ============================================================
//
// MySQL 은 기본 collation 이 `_ci` 라서 'Admin' 과 'admin' 을 같게 봅니다.
// PostgreSQL 은 다르게 봐서 둘 다 가입됩니다 (개념03).
//
// `작업자9 (아이디 VARCHAR(30))` 표에서
// **'Admin' 을 넣은 뒤 'admin' 이 거절되게** 만드는 SQL 한 줄을 쓰세요.

// TODO
const 답9 = 안푼답;

await 채점(9, "PG 에서 대소문자 무시 중복 막기", 답9, async (답) => {
  await 피지("DROP TABLE IF EXISTS 작업자9");
  await 피지("CREATE TABLE 작업자9 (아이디 VARCHAR(30))");
  await 피지(답);
  await 피지("INSERT INTO 작업자9 VALUES ('Admin')");

  try {
    await 피지("INSERT INTO 작업자9 VALUES ('admin')");
    return false;
  } catch (에러) {
    return 에러.code === "23505";
  }
});
// 출력: 문제 9 — ⬜ 아직 안 풀었습니다 · PG 에서 대소문자 무시 중복 막기


// ============================================================
// 문제 10 — MySQL 에서 UPSERT
// ============================================================
//
// PostgreSQL 코드는 이렇습니다.
//
//   INSERT INTO 재고10 VALUES ('베어링', 5)
//     ON CONFLICT (부품) DO UPDATE SET 수량 = 재고10.수량 + EXCLUDED.수량
//
// **MySQL 에서 같은 일을 하는 SQL** 을 쓰세요.
// 표 이름은 `구구_재고10`, 넣을 값은 `('베어링', 5)` 입니다.
// 채점 코드가 이 SQL 을 **세 번** 실행합니다. 수량이 15 가 되어야 합니다.

// TODO
const 답10 = 안푼답;

await 채점(10, "MySQL 의 UPSERT", 답10, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_재고10");
  await 마이("CREATE TABLE 구구_재고10 (부품 VARCHAR(20) PRIMARY KEY, 수량 INT)");

  await 마이(답);
  await 마이(답);
  await 마이(답);

  const 확인 = await 마이("SELECT 부품, 수량 FROM 구구_재고10");
  return 확인.length === 1 && 확인[0].수량 === 15;
});
// 출력: 문제 10 — ⬜ 아직 안 풀었습니다 · MySQL 의 UPSERT


// ============================================================
// 문제 11 — 이모지가 들어가는 MySQL 표 만들기
// ============================================================
//
// 옛날 MySQL 습관대로 `CHARACTER SET utf8` 로 만들면 이모지가 안 들어갑니다.
//
// **`🔧` 가 들어가는 표**를 만드는 CREATE TABLE 문을 쓰세요.
// 표 이름은 `구구_문제11`, 칸은 `메모 VARCHAR(50)` 하나입니다.
// ★ 문자셋을 **명시**해서 쓰세요. 기본값에 기대지 마세요.

// TODO
const 답11 = 안푼답;

await 채점(11, "이모지가 들어가는 표", 답11, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_문제11");
  await 마이(답);
  await 마이("INSERT INTO 구구_문제11 VALUES ('점검 🔧')");

  const 확인 = await 마이("SELECT 메모 FROM 구구_문제11");
  const 문자셋 = await 마이(
    "SELECT CHARACTER_SET_NAME AS c FROM information_schema.COLUMNS " +
      "WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME='구구_문제11' AND COLUMN_NAME='메모'",
  );

  return 확인[0].메모 === "점검 🔧" && 문자셋[0].c === "utf8mb4";
});
// 출력: 문제 11 — ⬜ 아직 안 풀었습니다 · 이모지가 들어가는 표


// ============================================================
// 문제 12 [도전] — 옮기기 점검 도구 만들기
// ============================================================
//
// SQL 문자열을 받아서 **MySQL 로 옮길 때 문제될 곳의 이름 배열**을 주는 함수를 만드세요.
//
// 찾아야 할 것은 세 가지입니다. 이름은 정확히 이렇게 주세요.
//
//   "||"          — 글자 잇기 (MySQL 에서는 OR)
//   "RETURNING"   — MySQL 에 없는 문법
//   "$파라미터"    — $1, $2 같은 파라미터
//
// 걸린 것만, **위 순서대로** 배열에 담아 주세요. 없으면 빈 배열입니다.

// TODO: 함수로 바꾸세요.
const 답12 = 안푼답;

await 채점(12, "[도전] 옮기기 점검 도구", 답12, (답) => {
  const 같나 = (가, 나) => JSON.stringify(가) === JSON.stringify(나);

  return (
    같나(답("INSERT INTO t(a) VALUES ($1) RETURNING id"), ["RETURNING", "$파라미터"]) &&
    같나(답("SELECT a || b FROM t"), ["||"]) &&
    같나(답("SELECT concat(a,b) FROM t WHERE id = 3"), []) &&
    같나(답("SELECT a || b FROM t WHERE id=$1 RETURNING x"), ["||", "RETURNING", "$파라미터"])
  );
});
// 출력: 문제 12 — ⬜ 아직 안 풀었습니다 · [도전] 옮기기 점검 도구


// ============================================================
// 문제 13 [도전] — 갭 락을 피하기
// ============================================================
//
// MySQL 에서 아래처럼 범위를 잠그면, 그 사이의 빈 자리까지 잠깁니다 (개념05).
//
//   SELECT * FROM 구구_생산13 WHERE 번호 BETWEEN 10 AND 20 FOR UPDATE
//
// 이 상태에서는 다른 접속이 15번을 못 넣습니다.
//
// **10번 줄만 잠그고, 다른 접속이 15번을 넣을 수 있게** 하는 SQL 을 쓰세요.
// 표: `구구_생산13 (번호 INT PRIMARY KEY, 수량 INT)` — 10번, 20번이 들어 있습니다.
// ★ `FOR UPDATE` 는 그대로 쓰세요. 잠그긴 잠가야 합니다.

// TODO
const 답13 = 안푼답;

await 채점(13, "[도전] 갭 락 피하기", 답13, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_생산13");
  await 마이("CREATE TABLE 구구_생산13 (번호 INT PRIMARY KEY, 수량 INT)");
  await 마이("INSERT INTO 구구_생산13 VALUES (10,100),(20,200)");

  await MY2.query("SET SESSION innodb_lock_wait_timeout = 1");

  await 마이("BEGIN");
  const 잠근것 = await 마이(답);

  let 넣었나 = false;

  try {
    await MY2.query("INSERT INTO 구구_생산13 VALUES (15, 150)");
    넣었나 = true;
  } catch (에러) {
    넣었나 = false;
  }

  await 마이("ROLLBACK");

  // 잠그긴 잠갔는지도 확인합니다 (10번 한 줄만 나와야 합니다).
  return 넣었나 === true && 잠근것.length === 1 && 잠근것[0].번호 === 10;
});
// 출력: 문제 13 — ⬜ 아직 안 풀었습니다 · [도전] 갭 락 피하기


// ============================================================
// 문제 14 [도전] — 양쪽 결과를 비교하는 함수
// ============================================================
//
// 개념03 에서 봤듯이 **에러 없이 답만 다른 것**이 가장 위험합니다.
// 그걸 잡으려면 같은 뜻의 SQL 을 양쪽에 보내고 결과를 비교해야 합니다.
//
// 아래 함수를 만드세요.
//
//   답14(피지SQL, 마이SQL) → 결과가 같으면 true, 다르면 false
//
// ★ 위에 있는 `피지()` 와 `마이()` 함수를 쓰면 됩니다. 둘 다 줄 배열을 줍니다.
// ★ 비교는 `JSON.stringify` 로 해도 충분합니다.

// TODO: async 함수로 바꾸세요.
const 답14 = 안푼답;

await 채점(14, "[도전] 양쪽 결과 비교하기", 답14, async (답) => {
  const 같은것 = await 답("SELECT 1 AS x", "SELECT 1 AS x");
  const 다른것 = await 답("SELECT 'a' || 'b' AS x", "SELECT 'a' || 'b' AS x");
  const 또같은것 = await 답("SELECT concat('a','b') AS x", "SELECT concat('a','b') AS x");

  return 같은것 === true && 다른것 === false && 또같은것 === true;
});
// 출력: 문제 14 — ⬜ 아직 안 풀었습니다 · [도전] 양쪽 결과 비교하기


// ── 뒷정리 ──

for (const 표 of ["작업자9"]) {
  await PG.query(`DROP TABLE IF EXISTS ${표}`);
}
for (const 표 of ["구구_문제6", "구구_문제8", "구구_재고10", "구구_문제11", "구구_생산13"]) {
  await MY.query(`DROP TABLE IF EXISTS ${표}`);
}

console.log("=== 채점 끝 ===");
// 출력: === 채점 끝 ===

// ★ 위 `// 출력:` 은 **아무것도 안 푼 상태**의 결과입니다.
//   답을 채우면 ⬜ 가 ✅ 로 바뀝니다. 그러면 출력이 달라지는 것이 정상입니다.


await PG.end();
await MY.end();
await MY2.end();
