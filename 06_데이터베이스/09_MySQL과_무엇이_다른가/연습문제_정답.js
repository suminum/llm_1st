// ============================================================
// 09단원 · 연습문제 정답 — MySQL 과 무엇이 다른가
// ------------------------------------------------------------
// 실행: node 연습문제_정답.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 정답과 **왜 그런지**를 함께 적었습니다.
// 답만 베끼지 말고 설명을 읽으세요. 이 단원의 값어치는 설명에 있습니다.
//
// ★ 답이 하나가 아닌 문제도 있습니다. 다른 방법도 함께 적어 두었습니다.

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

async function 채점(번호, 제목, 답, 검사) {
  let 통과 = false;

  try {
    통과 = (await 검사(답)) === true;
  } catch (에러) {
    통과 = false;
  }

  console.log(`문제 ${번호} — ${통과 ? "✅ 정답" : "❌ 다시"} · ${제목}`);
}

console.log("=== 09단원 연습문제 정답 ===");
// 출력: === 09단원 연습문제 정답 ===


// ============================================================
// 문제 1 — MySQL 서버가 엄격한지 검사하기
// ============================================================

const 답1 = (모드) => 모드.includes("STRICT_TRANS_TABLES") && 모드.includes("ONLY_FULL_GROUP_BY");

await 채점(1, "엄격한 sql_mode 인지 검사", 답1, (답) => {
  return (
    답("IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_DATE") === true &&
    답("NO_ENGINE_SUBSTITUTION") === false &&
    답("STRICT_TRANS_TABLES") === false
  );
});
// 출력: 문제 1 — ✅ 정답 · 엄격한 sql_mode 인지 검사

// ★ 왜 이 검사가 중요한가
//
//   개념02 에서 재 봤습니다. MySQL 8.4 는 기본 설정에서 PostgreSQL 만큼 엄격합니다.
//   그런데 그 엄격함은 **버전의 성질이 아니라 설정값**입니다.
//   `SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION'` 한 줄이면 옛날로 돌아갑니다.
//
//   그래서 MySQL 서버를 처음 만나면 버전이 아니라 **sql_mode 를 봐야** 합니다.
//   옛 버전에서 올린 서버는 옛 설정을 그대로 들고 옵니다.
//
// ★ 두 개만 봤는데, 실무에서는 이것도 같이 봅니다.
//     NO_ZERO_DATE, NO_ZERO_IN_DATE  — '0000-00-00' 을 막습니다
//     ERROR_FOR_DIVISION_BY_ZERO     — INSERT 안에서 0 나누기를 경고합니다
//
// ★★ 그리고 **접속마다 다를 수 있습니다.**
//   `@@GLOBAL.sql_mode` 가 아니라 `@@SESSION.sql_mode` 를 보세요.
//   드라이버나 프레임워크가 붙을 때 바꾸는 경우가 있습니다.


// ============================================================
// 문제 2 — `||` 를 양쪽에서 통하게 고치기
// ============================================================

const 답2 = "SELECT concat('설비', 'A') AS 결과";

await 채점(2, "양쪽에서 글자 잇기", 답2, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return 가[0].결과 === "설비A" && 나[0].결과 === "설비A";
});
// 출력: 문제 2 — ✅ 정답 · 양쪽에서 글자 잇기

// ★ 왜 `||` 를 쓰면 안 되나
//
//   표준 SQL 에서 `||` 는 문자열 연결입니다. PostgreSQL 은 표준을 따릅니다.
//   MySQL 은 `||` 를 **OR** 로 씁니다. C 언어 습관에서 온 것입니다.
//
//   `'설비' || 'A'` → MySQL 은 `'설비' OR 'A'` 로 읽습니다.
//   글자를 숫자로 바꾸면 둘 다 0 이라 결과가 0 입니다.
//
// ★★★ **에러가 안 납니다.** 이게 핵심입니다.
//   옮긴 날에는 아무도 모릅니다. 화면에 설비 이름 대신 0 이 뜬 뒤에야 압니다.
//
// ★ 다른 방법도 있습니다. 그런데 권하지 않습니다.
//
//     SET SESSION sql_mode = CONCAT(@@SESSION.sql_mode, ',PIPES_AS_CONCAT');
//
//   이러면 MySQL 에서도 `||` 가 연결이 됩니다. 하지만
//     · 접속마다 설정해야 하고
//     · 이미 `||` 를 OR 로 쓰던 옛 코드가 망가집니다
//   운영 중인 서버에서는 못 켭니다.
//
// ★★ NULL 이 섞이면 또 갈립니다. 이것도 외워 두세요.
//     PostgreSQL 의 concat('A', NULL, 'B') → 'AB'   (NULL 을 빈 글자로 봅니다)
//     MySQL 의     CONCAT('A', NULL, 'B') → NULL   (전체가 NULL 이 됩니다)
//   → NULL 이 들어올 수 있으면 `COALESCE(칸, '')` 로 감싸세요.


// ============================================================
// 문제 3 — 글자 수를 양쪽에서 똑같이 세기
// ============================================================

const 답3 = "SELECT char_length('설비🔧') AS 개수";

await 채점(3, "글자 수 세기", 답3, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return Number(가[0].개수) === 3 && Number(나[0].개수) === 3;
});
// 출력: 문제 3 — ✅ 정답 · 글자 수 세기

// ★ 같은 이름의 함수인데 뜻이 다릅니다
//
//     PostgreSQL 의 length()  = 글자 수    → '설비🔧' 은 3
//     MySQL 의     LENGTH()   = 바이트 수  → '설비🔧' 은 10
//
//   한글 한 자는 UTF-8 에서 3바이트, 이 이모지는 4바이트라서 3+3+4 = 10 입니다.
//
// ★ 반대편에 해당하는 함수도 있습니다.
//     PostgreSQL 에서 바이트를 세려면 → octet_length()
//     MySQL 에서 글자를 세려면        → CHAR_LENGTH()
//
//   `char_length()` 는 **양쪽에 다 있습니다.** 그래서 이걸 쓰면 됩니다.
//
// ★★ 이게 왜 사고가 되나
//   "제목이 20자 넘으면 자르기" 같은 코드를 생각해 보세요.
//   MySQL 로 옮기면 한글 제목이 **7자**에서 잘립니다.
//   에러는 없습니다. 그냥 화면이 이상해집니다.


// ============================================================
// 문제 4 — NULL 을 맨 뒤로 보내기
// ============================================================

const 답4 =
  "SELECT x FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3) AS t ORDER BY (x IS NULL), x";

await 채점(4, "NULL 을 맨 뒤로", 답4, async (답) => {
  const 바른순서 = (행들) => 행들.length === 3 && 행들[0].x === 1 && 행들[1].x === 3 && 행들[2].x === null;
  return 바른순서(await 피지(답)) && 바른순서(await 마이(답));
});
// 출력: 문제 4 — ✅ 정답 · NULL 을 맨 뒤로

// ★ 기본 자리가 반대입니다
//
//     PostgreSQL — NULL 을 **가장 큰 값**으로 봅니다 → 오름차순에서 맨 뒤
//     MySQL      — NULL 을 **가장 작은 값**으로 봅니다 → 오름차순에서 맨 앞
//
//   표준 SQL 은 "구현이 정하라" 고만 해 놨습니다. 그래서 둘 다 틀린 게 아닙니다.
//
// ★ PostgreSQL 에는 `ORDER BY x NULLS LAST` 문법이 있습니다.
//   **MySQL 에는 없습니다.** 1064 문법 오류가 납니다.
//
// ★★ 그래서 `ORDER BY (x IS NULL), x` 를 씁니다.
//   `x IS NULL` 은 참/거짓입니다. 거짓(0)이 먼저 오므로 값이 있는 줄이 앞에 옵니다.
//   그 안에서 다시 x 로 정렬됩니다. **양쪽에서 똑같이 동작합니다.**
//
// ★ NULL 을 맨 앞으로 보내고 싶으면 `ORDER BY (x IS NOT NULL), x` 입니다.
//
// ★★ 실무에서 어디서 터지나
//   "마지막 점검일" 처럼 NULL 이 있는 칸으로 정렬하는 목록 화면입니다.
//   미점검 설비가 맨 위에 있다가 맨 아래로 내려갑니다.
//   페이지를 나눠서 보여 주면 **1페이지 내용이 통째로 바뀝니다.**


// ============================================================
// 문제 5 — 0 으로 나누기를 안전하게
// ============================================================

const 답5 = "SELECT COALESCE(100 / NULLIF(0, 0), 0) AS 가동률";

await 채점(5, "0 으로 나누기 막기", 답5, async (답) => {
  const 가 = await 피지(답);
  const 나 = await 마이(답);
  return Number(가[0].가동률) === 0 && Number(나[0].가동률) === 0;
});
// 출력: 문제 5 — ✅ 정답 · 0 으로 나누기 막기

// ★ 두 DB 의 철학이 정확히 갈리는 자리입니다
//
//     PostgreSQL — "그건 계산할 수 없습니다" → 22012 로 **멈춥니다**
//     MySQL      — "값이 없네요"           → **NULL** 을 주고 계속 갑니다
//
//   어느 쪽도 우리가 원하는 답은 아닙니다.
//   화면에는 "0%" 라고 뜨는 게 맞지, 에러 페이지나 빈 칸이 맞는 게 아닙니다.
//
// ★ 그래서 **직접 막습니다.**
//     NULLIF(a, b)  — a 와 b 가 같으면 NULL, 아니면 a
//     COALESCE(...)  — 앞에서부터 NULL 이 아닌 첫 값
//
//   `100 / NULLIF(0,0)` → 나누는 수가 NULL 이 되어 결과가 NULL (에러 없음)
//   `COALESCE(NULL, 0)` → 0
//
//   두 함수 다 **양쪽에 있습니다.** 표준 함수입니다.
//
// ★★ 결과가 자바스크립트로 올 때 모양이 다릅니다. 조심하세요.
//     PostgreSQL → 0        (숫자)
//     MySQL      → "0.0000" (글자)
//   MySQL 의 `/` 는 결과를 DECIMAL 로 만들고, 드라이버는 DECIMAL 을 글자로 줍니다.
//   그래서 채점 코드에서 `Number(...)` 로 감쌌습니다.
//   ★ 계산에 쓰기 전에 반드시 숫자로 바꾸세요. `"0.0000" + 1` 은 `"0.00001"` 입니다.


// ============================================================
// 문제 6 — CREATE TABLE 을 MySQL 용으로 바꾸기
// ============================================================

const 답6 = `
  CREATE TABLE 구구_문제6 (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    이름 VARCHAR(50) NOT NULL,
    가동 BOOLEAN DEFAULT true,
    메모 JSON
  )
`;

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
// 출력: 문제 6 — ✅ 정답 · CREATE TABLE 을 MySQL 용으로

// ★ 바꾼 곳을 하나씩 봅니다
//
//   ① SERIAL PRIMARY KEY → INT AUTO_INCREMENT PRIMARY KEY
//      ★★ MySQL 에도 `SERIAL` 이라는 말이 **있습니다.** 그런데 뜻이 다릅니다.
//        MySQL 의 SERIAL = `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE`
//        기본키가 아니라 UNIQUE 이고, INT 가 아니라 BIGINT 입니다.
//        "돌긴 도는데 다른 표가 만들어지는" 최악의 경우입니다. 조심하세요.
//
//   ② JSONB → JSON
//      MySQL 에 JSONB 는 없습니다. JSON 하나뿐입니다.
//      ★ 이름만 바꾸면 되는 게 아닙니다. **색인 방법이 다릅니다.**
//        PostgreSQL 은 `USING GIN (칸)` 으로 통째로 색인합니다.
//        MySQL 은 JSON 칸에 직접 색인을 못 겁니다(3152 에러).
//        자주 찾는 키마다 생성 칸을 만들고 거기에 색인을 겁니다.
//
//   ③ BOOLEAN 은 그대로 써도 **돕니다.** 그런데 진짜 BOOLEAN 이 아닙니다.
//      MySQL 이 만드는 실제 타입은 `TINYINT(1)` 입니다.
//      그래서 5 나 -1 도 들어갑니다. 그리고 그 값은 `= true` 로 안 잡힙니다.
//      ★ `WHERE 가동` 이나 `WHERE 가동 <> 0` 을 쓰세요.
//      ★ 더 좋은 방법: `가동 TINYINT(1) NOT NULL DEFAULT 1 CHECK (가동 IN (0,1))`
//
// ★★ 그리고 실무에서는 문자셋도 명시합니다 (문제 11 참고).
//     ... ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4


// ============================================================
// 문제 7 — 파라미터 기호를 바꿔 주는 함수
// ============================================================

const 답7 = (sql) => sql.replace(/\$\d+/g, "?");

await 채점(7, "$1 을 ? 로 바꾸기", 답7, (답) => {
  return (
    답("SELECT * FROM 설비 WHERE 라인=$1 AND 가동=$2") === "SELECT * FROM 설비 WHERE 라인=? AND 가동=?" &&
    답("INSERT INTO 점검(설비,내용) VALUES ($1,$2)") === "INSERT INTO 점검(설비,내용) VALUES (?,?)" &&
    답("SELECT $10, $2") === "SELECT ?, ?"
  );
});
// 출력: 문제 7 — ✅ 정답 · $1 을 ? 로 바꾸기

// ★ `\d+` 를 쓴 이유
//   `\$\d` 라고만 쓰면 `$10` 이 `?0` 이 됩니다. 파라미터가 10개를 넘는 쿼리는 흔합니다.
//   `+` 를 붙여서 숫자를 끝까지 먹게 해야 합니다.
//
// ★★★ 그런데 이 함수만으로는 부족합니다. **가장 중요한 함정이 남아 있습니다.**
//
//   PostgreSQL 의 `$1` 은 **번호가 있어서 같은 값을 여러 번** 쓸 수 있습니다.
//
//     SELECT * FROM 설비 WHERE 이름 = $1 OR 별칭 = $1
//     → 값은 한 개만 넘깁니다: [이름]
//
//   이걸 기계적으로 바꾸면
//
//     SELECT * FROM 설비 WHERE 이름 = ? OR 별칭 = ?
//     → 값은 **두 개**를 넘겨야 합니다: [이름, 이름]
//
//   SQL 만 바꾸고 값 배열을 안 고치면 실행할 때 터집니다.
//   ★ 그래서 진짜 변환 도구는 값 배열도 같이 만들어 줘야 합니다.
//
//     function 바꾸기(sql, 값들) {
//       const 새값 = [];
//       const 새sql = sql.replace(/\$(\d+)/g, (_, 번호) => {
//         새값.push(값들[Number(번호) - 1]);
//         return "?";
//       });
//       return { sql: 새sql, 값: 새값 };
//     }
//
// ★ 또 하나: 글자 안에 든 `$1` 도 바뀝니다.
//   `SELECT '가격은 $100 입니다'` 가 `'가격은 ?00 입니다'` 가 됩니다.
//   정규식으로 SQL 을 다루는 도구의 한계입니다. 사람이 한 번 봐야 합니다.


// ============================================================
// 문제 8 — RETURNING 없이 방금 넣은 id 받기
// ============================================================

const 답8 = async (연결, 내용) => {
  const [결과] = await 연결.query("INSERT INTO 구구_문제8(내용) VALUES (?)", [내용]);
  return 결과.insertId;
};

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
// 출력: 문제 8 — ✅ 정답 · MySQL 에서 새 id 받기

// ★ SQL 로 받는 방법도 있습니다. 결과는 같습니다.
//
//     await 연결.query("INSERT INTO 구구_문제8(내용) VALUES (?)", [내용]);
//     const [행] = await 연결.query("SELECT LAST_INSERT_ID() AS id");
//     return 행[0].id;
//
//   쿼리를 한 번 더 보내는 것뿐이라 `insertId` 를 쓰는 편이 낫습니다.
//
// ★ `LAST_INSERT_ID()` 는 **접속마다 따로** 기억합니다.
//   그 사이에 다른 사람이 INSERT 해도 내 값은 안 바뀝니다. 그건 안전합니다.
//
// ★★★ 진짜 위험한 곳은 **여러 건을 한 번에 넣을 때**입니다.
//
//     INSERT INTO 구구_점검(내용) VALUES ('여섯'),('일곱'),('여덟');
//     → insertId 는 **첫 번째 번호 하나**만 줍니다. 나머지는 안 알려 줍니다.
//
//   "연속으로 붙었을 테니 +1, +2 겠지" 라고 계산하면 안 됩니다.
//   `innodb_autoinc_lock_mode` 설정과 동시성에 따라 **띄엄띄엄 붙습니다.**
//   ★ 서버가 여러 대일 때만 틀려서 재현이 안 됩니다. 최악의 버그입니다.
//
//   → MySQL 에서 여러 건의 id 를 다 알아야 하면 **한 건씩 넣는 수밖에** 없습니다.
//   → PostgreSQL 은 `INSERT ... VALUES (...),(...),(...) RETURNING id` 한 줄로 끝납니다.
//     이게 RETURNING 이 없어서 생기는 가장 큰 차이입니다.


// ============================================================
// 문제 9 — PostgreSQL 에서 대소문자를 무시하는 중복 막기
// ============================================================

const 답9 = "CREATE UNIQUE INDEX 작업자9_소문자 ON 작업자9 (lower(아이디))";

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
// 출력: 문제 9 — ✅ 정답 · PG 에서 대소문자 무시 중복 막기

// ★ 이 문제는 개념03 에서 예상이 뒤집힌 자리입니다
//
//   "MySQL 이 허술하다" 고 배웠다면 MySQL 쪽이 뚫릴 거라고 생각했을 겁니다.
//   **반대입니다.**
//
//     MySQL      — 기본 collation 이 `utf8mb4_0900_ai_ci` (ci = 대소문자 무시)
//                  → UNIQUE 색인이 'Admin' 과 'admin' 을 같게 보고 **막습니다**
//     PostgreSQL — 글자 그대로 비교합니다
//                  → 둘 다 들어갑니다. **계정이 두 개** 생깁니다
//
//   여기서는 MySQL 이 더 안전하게 동작했습니다.
//   ★ 좋고 나쁨의 문제가 아닙니다. 아이디에는 `_ci` 가 좋고,
//     상품 코드나 토큰에는 `_ci` 가 나쁩니다. **다르다는 것을 아는 게 중요합니다.**
//
// ★★ 옮길 때 무슨 일이 나나 — 양쪽 다 사고입니다.
//
//   MySQL → PostgreSQL : 지금까지 막히던 'Admin'/'admin' 이 둘 다 가입됩니다
//   PostgreSQL → MySQL : 이미 들어 있는 두 계정을 옮기다가
//                        **UNIQUE 충돌(1062)로 이관이 멈춥니다**
//
//   ★ 그래서 옮기기 전에 반드시 세어 보세요.
//       SELECT lower(아이디), COUNT(*) FROM 작업자
//        GROUP BY lower(아이디) HAVING COUNT(*) > 1;
//
// ★ 다른 방법도 있습니다.
//
//   ① `citext` 확장 — 칸 타입을 아예 대소문자 무시로 만듭니다
//        CREATE EXTENSION IF NOT EXISTS citext;
//        CREATE TABLE 작업자 (아이디 citext UNIQUE);
//      ★ 확장을 깔 권한이 필요합니다. 관리형 서비스에서는 안 될 수 있습니다.
//
//   ② PostgreSQL 12+ 의 대소문자 무시 collation 을 칸에 지정
//
//   ③ ★★ **가장 확실한 방법: 앱에서 소문자로 바꿔서 저장합니다.**
//      `아이디.trim().toLowerCase()` 한 줄이면 DB 가 무엇이든 같아집니다.
//      뒤 공백 문제(개념03 섹션 3)까지 같이 해결됩니다.


// ============================================================
// 문제 10 — MySQL 에서 UPSERT
// ============================================================

const 답10 =
  "INSERT INTO 구구_재고10 VALUES ('베어링', 5) AS 새값 " +
  "ON DUPLICATE KEY UPDATE 수량 = 구구_재고10.수량 + 새값.수량";

await 채점(10, "MySQL 의 UPSERT", 답10, async (답) => {
  await 마이("DROP TABLE IF EXISTS 구구_재고10");
  await 마이("CREATE TABLE 구구_재고10 (부품 VARCHAR(20) PRIMARY KEY, 수량 INT)");

  await 마이(답);
  await 마이(답);
  await 마이(답);

  const 확인 = await 마이("SELECT 부품, 수량 FROM 구구_재고10");
  return 확인.length === 1 && 확인[0].수량 === 15;
});
// 출력: 문제 10 — ✅ 정답 · MySQL 의 UPSERT

// ★ 문법 대응
//
//     PostgreSQL : ON CONFLICT (부품) DO UPDATE SET 수량 = 재고.수량 + EXCLUDED.수량
//     MySQL      : AS 새값 ON DUPLICATE KEY UPDATE 수량 = 구구_재고10.수량 + 새값.수량
//
//   "넣으려던 값" 을 가리키는 이름이 다릅니다.
//     PostgreSQL — `EXCLUDED` (고정된 이름입니다)
//     MySQL      — `AS 별명` 으로 **내가 이름을 붙입니다** (8.0.20 부터)
//
// ★ 옛 MySQL 문법도 아직 돕니다. 그런데 경고가 뜨고, 곧 없어집니다.
//     ON DUPLICATE KEY UPDATE 수량 = 수량 + VALUES(수량)
//   새 코드에는 `AS 별명` 을 쓰세요.
//
// ★★ 진짜 차이는 **어느 제약과 충돌했는지 고를 수 있느냐**입니다.
//
//   PostgreSQL 은 `ON CONFLICT (부품)` 처럼 **칸을 지정**합니다.
//   그래서 "부품이 겹칠 때만 고치고, 다른 UNIQUE 가 겹치면 에러" 를 만들 수 있습니다.
//
//   MySQL 의 `ON DUPLICATE KEY` 는 **아무 UNIQUE 든 겹치면** 동작합니다.
//   표에 UNIQUE 가 두 개 있으면 의도하지 않은 줄이 고쳐질 수 있습니다.
//   ★ 이건 조용히 데이터가 망가지는 종류의 차이입니다.
//
// ★ `affectedRows` 로 무엇이 일어났는지 압니다.
//     1 = 새로 넣었음   ·   2 = 이미 있어서 고쳤음
//   ★★ 문서에는 "값이 그대로면 0" 이라고 적혀 있는데 드라이버 설정에 따라 다릅니다.
//     이 자료의 mysql2 에서는 값이 안 바뀌어도 1 이 나옵니다. 믿지 마세요.
//     "새로 만들어졌는지" 를 확실히 알아야 하면 PostgreSQL 의 RETURNING 이 낫습니다.


// ============================================================
// 문제 11 — 이모지가 들어가는 MySQL 표 만들기
// ============================================================

const 답11 = "CREATE TABLE 구구_문제11 (메모 VARCHAR(50)) CHARACTER SET utf8mb4";

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
// 출력: 문제 11 — ✅ 정답 · 이모지가 들어가는 표

// ★★★ MySQL 에서 `utf8` 은 진짜 UTF-8 이 아닙니다
//
//   MySQL 의 `utf8` = `utf8mb3` = **한 글자당 최대 3바이트**입니다.
//   한글은 3바이트라 들어갑니다. 이모지는 4바이트라 **안 들어갑니다.**
//   `utf8mb4` 가 진짜 UTF-8 입니다.
//
// ★ STRICT 가 켜져 있으면 거절합니다 (1366).
//   STRICT 가 꺼져 있으면 **이모지가 물음표로 바뀝니다.** 에러도 없습니다.
//   개념03 섹션 8 에서 직접 확인했습니다: '점검 완료 🔧 이상없음' → '점검 완료 ? 이상없음'
//
// ★ MySQL 8.0 부터는 서버 기본이 `utf8mb4` 라서 새로 만들면 대개 괜찮습니다.
//   문제는 **5.x 시절에 만든 옛 표**입니다. 그때 기본이 `utf8`(=utf8mb3) 이었습니다.
//   회사 표를 만나면 이걸로 확인하세요.
//
//     SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES
//      WHERE TABLE_SCHEMA = '내디비';
//
// ★★ 그래서 이 문제는 "명시해서 쓰라" 고 했습니다.
//   기본값에 기대면 서버가 바뀔 때 조용히 달라집니다.
//   실무에서는 데이터베이스·표·칸·접속 **네 곳 다** utf8mb4 로 맞춥니다.
//
// ★ PostgreSQL 에는 이 함정이 없습니다.
//   데이터베이스 인코딩을 UTF8 로 만들면 그냥 진짜 UTF-8 입니다.
//   "반쪽짜리 UTF-8" 이라는 개념 자체가 없습니다.


// ============================================================
// 문제 12 [도전] — 옮기기 점검 도구 만들기
// ============================================================

const 답12 = (sql) => {
  const 규칙들 = [
    ["||", /\|\|/],
    ["RETURNING", /\bRETURNING\b/i],
    ["$파라미터", /\$\d+/],
  ];

  return 규칙들.filter(([, 정규식]) => 정규식.test(sql)).map(([이름]) => 이름);
};

await 채점(12, "[도전] 옮기기 점검 도구", 답12, (답) => {
  const 같나 = (가, 나) => JSON.stringify(가) === JSON.stringify(나);

  return (
    같나(답("INSERT INTO t(a) VALUES ($1) RETURNING id"), ["RETURNING", "$파라미터"]) &&
    같나(답("SELECT a || b FROM t"), ["||"]) &&
    같나(답("SELECT concat(a,b) FROM t WHERE id = 3"), []) &&
    같나(답("SELECT a || b FROM t WHERE id=$1 RETURNING x"), ["||", "RETURNING", "$파라미터"])
  );
});
// 출력: 문제 12 — ✅ 정답 · [도전] 옮기기 점검 도구

// ★ 설계 요령
//
//   규칙을 **배열로** 만들고 `filter` 로 거르면 순서가 저절로 지켜집니다.
//   `if` 를 세 번 쓰면 규칙이 늘어날 때마다 코드를 고쳐야 합니다.
//   규칙만 추가하면 되게 만드세요. 개념05 의 `옮길때규칙` 이 이 구조입니다.
//
// ★ 정규식 하나씩 보면
//     /\|\|/        — `|` 는 정규식에서 특별한 뜻이라 `\` 로 막아야 합니다
//     /\bRETURNING\b/i  — `\b` 로 단어 경계를 잡아야 `RETURNINGS` 를 안 잡습니다
//     /\$\d+/       — `$` 도 특별한 뜻(문자열 끝)이라 막아야 합니다. `\d+` 는 문제 7 과 같은 이유
//
// ★★ 이 도구의 한계를 정확히 알고 쓰세요
//
//   ① **글자 안에 든 것도 잡습니다.** `SELECT 'a || b'` 도 경고가 납니다
//      → 작은따옴표 안을 먼저 지우면 줄어듭니다:
//        `sql.replace(/'(?:[^'\\]|\\.)*'/g, "''")`
//   ② **진짜 파서가 아닙니다.** 여러 줄에 나뉜 문법을 놓칠 수 있습니다
//   ③ ★★★ **개념03 의 조용한 차이는 못 잡습니다.**
//      `WHERE 아이디 = '설비관리자'` 는 문법에 아무 문제가 없습니다.
//      그런데 대소문자 규칙 때문에 양쪽 답이 다를 수 있습니다.
//
//   그래도 씁니다. 쿼리가 수백 개면 **볼 곳을 좁혀 주는 것**만으로 충분합니다.
//   ★ 경고 0개가 "안전하다" 는 뜻이 아니라는 것만 기억하세요.


// ============================================================
// 문제 13 [도전] — 갭 락을 피하기
// ============================================================

const 답13 = "SELECT * FROM 구구_생산13 WHERE 번호 = 10 FOR UPDATE";

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

  return 넣었나 === true && 잠근것.length === 1 && 잠근것[0].번호 === 10;
});
// 출력: 문제 13 — ✅ 정답 · [도전] 갭 락 피하기

// ★ 왜 범위로 잠그면 막히나
//
//   MySQL 의 REPEATABLE READ 는 팬텀 읽기를 **넥스트키 락**으로 막습니다.
//   줄뿐 아니라 **줄과 줄 사이의 빈 자리(갭)** 까지 잠급니다.
//   `BETWEEN 10 AND 20` 으로 훑으면 10 과 20 사이가 통째로 잠깁니다.
//   그래서 다른 접속이 15번을 못 넣고 1205(잠금 대기 시간 초과)로 죽습니다.
//
// ★★ 개념05 에서 더 놀라운 것도 봤습니다.
//   범위 밖인 **100번도 막혔습니다.**
//   20번 다음에 아무것도 없는 것을 확인하면서 "20번 뒤의 모든 자리" 를 잠갔기 때문입니다.
//
// ★ `번호 = 10` 은 왜 안 막히나
//   기본키에 **정확히 하나**를 찍었기 때문입니다.
//   찾는 값이 유일 색인에 딱 하나 있으면 InnoDB 는 갭을 안 잡고
//   그 줄 하나만 잠급니다(record lock).
//
// ★★ 실무 규칙 네 가지
//   ① 잠글 때는 **정확한 값 하나**로 좁히세요
//   ② 잠그는 쿼리의 WHERE 절에 **반드시 색인**이 있어야 합니다.
//      색인이 없으면 훑은 줄을 전부 잠급니다. 사실상 표 잠금입니다
//   ③ 정말 넓게 잠가야 하면 격리수준을 `READ COMMITTED` 로 낮춥니다.
//      갭 락이 거의 사라집니다. 대신 팬텀은 허용됩니다
//   ④ 트랜잭션을 짧게 잡으세요. 이건 어느 DB 에서나 맞는 말입니다
//
// ★★★ 반대 방향도 조심하세요.
//   MySQL 에서 "갭 락이 중복을 막아 주겠지" 하고 짠 코드를 PostgreSQL 로 옮기면
//   **아무도 안 막아 줍니다.** PostgreSQL 은 스냅샷으로 팬텀을 막기 때문에
//   빈 자리를 잠그지 않습니다.
//   → 중복을 막는 것은 잠금이 아니라 **UNIQUE 제약**입니다. 어느 DB 든 그게 정답입니다.


// ============================================================
// 문제 14 [도전] — 양쪽 결과를 비교하는 함수
// ============================================================

const 답14 = async (피지SQL, 마이SQL) => {
  const 가 = await 피지(피지SQL);
  const 나 = await 마이(마이SQL);

  return JSON.stringify(가) === JSON.stringify(나);
};

await 채점(14, "[도전] 양쪽 결과 비교하기", 답14, async (답) => {
  const 같은것 = await 답("SELECT 1 AS x", "SELECT 1 AS x");
  const 다른것 = await 답("SELECT 'a' || 'b' AS x", "SELECT 'a' || 'b' AS x");
  const 또같은것 = await 답("SELECT concat('a','b') AS x", "SELECT concat('a','b') AS x");

  return 같은것 === true && 다른것 === false && 또같은것 === true;
});
// 출력: 문제 14 — ✅ 정답 · [도전] 양쪽 결과 비교하기

// ★★★ 이게 이 단원 전체의 결론입니다
//
//   개념02 의 차이(문법 오류)는 옮기면 바로 터져서 어차피 눈에 띕니다.
//   개념03 의 차이(조용히 다른 답)는 **아무도 알려 주지 않습니다.**
//
//   그걸 잡는 유일한 방법이 **같은 쿼리를 양쪽에 보내고 답을 맞춰 보는 것**입니다.
//   위 함수가 그 도구입니다. 개념02~05 의 `나란히()` 함수와 같은 생각입니다.
//
// ★ 실무에서 쓰려면 이렇게 키웁니다
//
//   ① 실제로 도는 쿼리 목록을 모읍니다 (느린 쿼리 로그·코드 검색)
//   ② 같은 데이터를 양쪽에 넣습니다
//   ③ 쿼리마다 이 함수를 돌려서 **다른 것만** 뽑습니다
//   ④ 다른 것을 하나씩 봅니다. 대부분 이 단원의 표에 나오는 것들입니다
//
// ★★ 비교할 때 조심할 점
//
//   ① **타입이 다르게 옵니다.** MySQL 은 참/거짓을 1/0 으로, DECIMAL 을 글자로 줍니다.
//      `JSON.stringify` 로 그냥 비교하면 "값은 같은데 다르다" 는 거짓 경고가 납니다.
//      → 숫자는 `Number(...)`, 참거짓은 `!!...` 로 맞춘 뒤 비교하는 게 좋습니다.
//   ② **줄 순서가 다를 수 있습니다.** `ORDER BY` 가 없으면 순서는 보장이 없습니다.
//      비교하기 전에 정렬하거나, 쿼리에 `ORDER BY` 를 넣으세요.
//   ③ NULL 의 자리가 다릅니다 (문제 4). 이것도 순서 문제로 나타납니다.
//
// ★ 그래서 이 함수가 "다르다" 고 하면 두 가지 중 하나입니다.
//     · 진짜 의미가 다르다  → 고쳐야 합니다
//     · 모양만 다르다       → 비교 방법을 다듬어야 합니다
//   둘 다 **직접 눈으로 봐야** 판단할 수 있습니다. 자동화의 끝은 사람입니다.


// ── 뒷정리 ──

await PG.query("DROP TABLE IF EXISTS 작업자9");

for (const 표 of ["구구_문제6", "구구_문제8", "구구_재고10", "구구_문제11", "구구_생산13"]) {
  await MY.query(`DROP TABLE IF EXISTS ${표}`);
}

console.log("=== 정답 확인 끝 ===");
// 출력: === 정답 확인 끝 ===


// ============================================================
// 한 장 요약 — 이 단원에서 꼭 가져갈 것
// ============================================================
//
//   ① "MySQL 은 허술하다" 는 **낡은 말**입니다.
//      8.4 는 잘못된 타입·길이 초과·범위 초과·GROUP BY 위반·CHECK 위반을 전부 거절합니다.
//      개념02 에서 일곱 가지를 재서 **7 대 7** 로 확인했습니다.
//
//   ② 대신 **설정을 보세요.** `SELECT @@sql_mode` 한 줄입니다.
//      STRICT 를 끄면 5분 만에 옛날로 돌아갑니다. 버전이 아니라 설정입니다.
//
//   ③ 진짜 위험한 것은 **에러가 안 나는 차이**입니다.
//      `||`, 대소문자, 뒤 공백, 0 나누기, 자동 형변환, LENGTH, NULL 정렬.
//      전부 양쪽에서 통하는 대체 문법이 있습니다. 그걸 쓰세요.
//
//   ④ 없는 기능은 오히려 안전합니다. 옮기면 터지니까요.
//      RETURNING · 부분 색인 · 배열 · 트랜잭션 DDL.
//      ★ 이 중 **트랜잭션 DDL** 만은 미리 대비해야 합니다. 마이그레이션이 반쯤 멈춥니다.
//
//   ⑤ 마지막 확인은 **양쪽에 같은 쿼리를 보내고 답을 맞춰 보는 것**입니다.
//      문제 14 의 함수가 그것입니다.
//
//   ★ 그리고 둘 다 훌륭한 데이터베이스입니다.
//     운영할 사람이 아는 DB 가 제일 좋은 DB 입니다.


await PG.end();
await MY.end();
await MY2.end();
