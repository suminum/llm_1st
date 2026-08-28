// ============================================================
// 09단원 · 개념 04 — 기능과 문법의 차이
// ------------------------------------------------------------
// 실행: node 개념04_기능과_문법의_차이.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 개념03 은 **에러가 안 나는데 답이 다른 것**들이었습니다. 제일 위험합니다.
// 이 파일은 반대입니다. **아예 문법 오류가 나는 것**들입니다.
//
// 이건 오히려 마음이 편합니다. 옮기면 바로 터지니까 못 넘어갑니다.
// 대신 **개수가 많습니다.** 하나하나 어떻게 바꿔 쓰는지 알아야 합니다.
//
//   ① 파라미터 기호가 다릅니다              $1  vs  ?
//   ② 자동 번호 만드는 법이 다릅니다        SERIAL  vs  AUTO_INCREMENT
//   ③ RETURNING 이 MySQL 에 없습니다        ★★
//   ④ 부분 색인·배열·진짜 BOOLEAN 이 없습니다
//   ⑤ 트랜잭션 안의 DDL 이 안 되돌아갑니다  ★★★
//   ⑥ 표 이름 대소문자 규칙이 반대입니다    ★★
//   ⑦ UPSERT 문법이 다릅니다
//   ⑧ JSON 다루는 법이 다릅니다

import pg from "pg";
import mysql from "mysql2/promise";


// ── 섹션 0: 붙기 · 도우미 ──

let PG = null;
let MY = null;

try {
  PG = new pg.Client({ host: "127.0.0.1", port: 5434, user: "factory", password: "secret", database: "factory_db" });
  await PG.connect();
  MY = await mysql.createConnection({ host: "127.0.0.1", port: 3307, user: "factory", password: "secret", database: "factory_db" });
} catch (에러) {
  // 검증무시: Docker 가 없으면 여기로 옵니다.
  console.log("★ 데이터베이스에 못 붙었습니다:", 에러.code || 에러.message);
  console.log("  docker compose up -d 를 먼저 실행하세요.");
  if (PG) await PG.end().catch(() => {});
  process.exit(0);
}

await PG.query("CREATE SCHEMA IF NOT EXISTS 단원09");
await PG.query("SET search_path TO 단원09");

async function 피지(sql, 값 = []) {
  try {
    const 결과 = await PG.query(sql, 값);
    const 조회인가 = 결과.command === "SELECT" || 결과.command === "SHOW";

    return { 됨: true, 값: 결과.rows, 조회: 조회인가, 건수: 결과.rowCount ?? 0 };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code };
  }
}

async function 마이(sql, 값 = []) {
  try {
    const [행들] = await MY.query(sql, 값);
    const 조회인가 = Array.isArray(행들);

    return {
      됨: true,
      값: 조회인가 ? 행들 : [],
      조회: 조회인가,
      건수: 조회인가 ? 행들.length : 행들.affectedRows,
      새번호: 조회인가 ? null : 행들.insertId,
    };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code, 번호: 에러.errno };
  }
}

function 짧게(결과) {
  if (!결과.됨) return `거절 ${결과.코드}${결과.번호 === undefined ? "" : "/" + 결과.번호}`;
  // 조회이거나, RETURNING 처럼 돌려준 줄이 있으면 그 줄을 보여 줍니다.
  if (결과.조회 || 결과.값.length > 0) return JSON.stringify(결과.값);
  return `성공 ${결과.건수}건`;
}

async function 나란히(제목, 피지문, 마이문) {
  const 가 = await 피지(피지문);
  const 나 = await 마이(마이문 === undefined ? 피지문 : 마이문);

  console.log(`· ${제목}`);
  console.log(`    PostgreSQL — ${짧게(가)}`);
  console.log(`    MySQL      — ${짧게(나)}`);

  return { 가, 나 };
}


// ── 섹션 1: 파라미터 기호 ──

// 08단원에서 "SQL 에 값을 직접 붙이지 말고 파라미터로 넘기라" 고 했습니다.
// 그 기호가 다릅니다.

const 피지파라 = await 피지("SELECT $1::int + 1 AS 결과", [10]);
console.log("PostgreSQL 에 $1 로 보내기:", 짧게(피지파라));
// 출력: PostgreSQL 에 $1 로 보내기: [{"결과":11}]

const 피지물음 = await 피지("SELECT ? + 1 AS 결과", [10]);
console.log("PostgreSQL 에 ? 로 보내기:", 짧게(피지물음));
// 출력: PostgreSQL 에 ? 로 보내기: 거절 42883

const 마이물음 = await 마이("SELECT ? + 1 AS 결과", [10]);
console.log("MySQL 에 ? 로 보내기:", 짧게(마이물음));
// 출력: MySQL 에 ? 로 보내기: [{"결과":11}]

const 마이달러 = await 마이("SELECT $1 + 1 AS 결과", [10]);
console.log("MySQL 에 $1 로 보내기:", 짧게(마이달러));
// 출력: MySQL 에 $1 로 보내기: 거절 ER_BAD_FIELD_ERROR/1054

// ★ 코드를 옮기면 **모든 쿼리의 파라미터를 다 바꿔야 합니다.**
//   쿼리가 200개면 200개를 다 봅니다. 이게 옮길 때 가장 지루한 작업입니다.
//
// ★★ 차이가 하나 더 있습니다. **번호가 있느냐 없느냐** 입니다.
//
//   PostgreSQL : $1, $2 — 번호가 있어서 **같은 값을 여러 번** 쓸 수 있습니다
//   MySQL      : ?      — 번호가 없어서 나오는 순서대로 값을 하나씩 씁니다

const 두번쓰기피지 = await 피지("SELECT $1::int AS 처음, $1::int * 2 AS 두배", [7]);
console.log("PostgreSQL 에서 $1 을 두 번 쓰기:", 짧게(두번쓰기피지));
// 출력: PostgreSQL 에서 $1 을 두 번 쓰기: [{"처음":7,"두배":14}]

const 두번쓰기마이 = await 마이("SELECT ? AS 처음, ? * 2 AS 두배", [7, 7]);
console.log("MySQL 에서는 값을 두 번 넘겨야 함:", 짧게(두번쓰기마이));
// 출력: MySQL 에서는 값을 두 번 넘겨야 함: [{"처음":7,"두배":14}]

// ★ 옮길 때 `$1` 을 기계적으로 `?` 로 바꾸면 **값 개수가 안 맞아서 터집니다.**
//   같은 번호를 두 번 쓴 곳이 있으면 값 배열도 고쳐야 합니다.


// ── 섹션 2: 자동 번호 ──

await 피지("DROP TABLE IF EXISTS 점검");
await 마이("DROP TABLE IF EXISTS 구구_점검");

await 피지("CREATE TABLE 점검 (id SERIAL PRIMARY KEY, 내용 VARCHAR(30))");
await 마이("CREATE TABLE 구구_점검 (id INT AUTO_INCREMENT PRIMARY KEY, 내용 VARCHAR(30))");

// ★ PostgreSQL 에는 표준 문법도 있습니다. 새 코드에서는 이쪽을 권합니다.
const 아이덴티티 = await 피지(
  "CREATE TABLE 표준자동번호 (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, v VARCHAR(10))",
);
console.log("PostgreSQL 의 GENERATED ... AS IDENTITY:", 짧게(아이덴티티));
// 출력: PostgreSQL 의 GENERATED ... AS IDENTITY: 성공 0건

const 마이아이덴 = await 마이(
  "CREATE TABLE 구구_표준자동번호 (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, v VARCHAR(10))",
);
console.log("MySQL 에서 같은 문법:", 짧게(마이아이덴));
// 출력: MySQL 에서 같은 문법: 거절 ER_PARSE_ERROR/1064

await 피지("DROP TABLE IF EXISTS 표준자동번호");

// ★★ 그럼 **롤백하면 번호가 어떻게 되나요?** 이건 자주 나오는 질문입니다.
//   "MySQL 은 번호가 꼬인다" 는 말도 있는데, 재 봤습니다.

await 피지("INSERT INTO 점검(내용) VALUES ('첫 점검')");
await 피지("BEGIN");
await 피지("INSERT INTO 점검(내용) VALUES ('취소될 점검')");
await 피지("ROLLBACK");
await 피지("INSERT INTO 점검(내용) VALUES ('세 번째 점검')");

await 마이("INSERT INTO 구구_점검(내용) VALUES ('첫 점검')");
await 마이("BEGIN");
await 마이("INSERT INTO 구구_점검(내용) VALUES ('취소될 점검')");
await 마이("ROLLBACK");
await 마이("INSERT INTO 구구_점검(내용) VALUES ('세 번째 점검')");

const 번호피지 = await 피지("SELECT id, 내용 FROM 점검 ORDER BY id");
const 번호마이 = await 마이("SELECT id, 내용 FROM 구구_점검 ORDER BY id");

console.log("롤백 뒤 PostgreSQL 의 번호:", 짧게(번호피지));
// 출력: 롤백 뒤 PostgreSQL 의 번호: [{"id":1,"내용":"첫 점검"},{"id":3,"내용":"세 번째 점검"}]
console.log("롤백 뒤 MySQL 의 번호:", 짧게(번호마이));
// 출력: 롤백 뒤 MySQL 의 번호: [{"id":1,"내용":"첫 점검"},{"id":3,"내용":"세 번째 점검"}]

// ★★★ **똑같습니다.** 양쪽 다 2번을 건너뛰었습니다.
//
//   왜 그럴까요. 자동 번호는 **트랜잭션 밖에서** 돌아가기 때문입니다.
//   번호를 되돌리려면 다른 트랜잭션이 그 번호를 못 쓰게 기다려야 합니다.
//   그러면 동시에 INSERT 하는 사람들이 전부 줄을 서야 합니다. 너무 느립니다.
//
// ★ 그래서 이걸 외우세요.
//   **자동 번호에 "빠진 번호가 없다" 고 기대하지 마세요.**
//   1, 2, 3 다음에 7 이 나올 수 있습니다. 정상입니다.
//   "오늘 몇 건 들어왔나" 를 `MAX(id) - MIN(id)` 로 세면 안 됩니다.


// ── 섹션 3: ★★ RETURNING 이 MySQL 에 없습니다 ──

const 반환피지 = await 피지("INSERT INTO 점검(내용) VALUES ('네 번째') RETURNING id, 내용");
console.log("PostgreSQL 의 RETURNING:", 짧게(반환피지));
// 출력: PostgreSQL 의 RETURNING: [{"id":4,"내용":"네 번째"}]

const 반환마이 = await 마이("INSERT INTO 구구_점검(내용) VALUES ('네 번째') RETURNING id, 내용");
console.log("MySQL 에서 RETURNING:", 짧게(반환마이));
// 출력: MySQL 에서 RETURNING: 거절 ER_PARSE_ERROR/1064

// ★ PostgreSQL 은 UPDATE·DELETE 에도 RETURNING 을 씁니다. 아주 편합니다.
const 고침반환 = await 피지("UPDATE 점검 SET 내용 = '고친 내용' WHERE id = 1 RETURNING id, 내용");
console.log("UPDATE ... RETURNING:", 짧게(고침반환));
// 출력: UPDATE ... RETURNING: [{"id":1,"내용":"고친 내용"}]

const 지움반환 = await 피지("DELETE FROM 점검 WHERE id = 1 RETURNING id, 내용");
console.log("DELETE ... RETURNING:", 짧게(지움반환));
// 출력: DELETE ... RETURNING: [{"id":1,"내용":"고친 내용"}]

// ★★ MySQL 에서는 어떻게 방금 넣은 id 를 받나
//   드라이버가 주는 `insertId` 를 씁니다. SQL 로는 `LAST_INSERT_ID()` 입니다.

const 한건 = await 마이("INSERT INTO 구구_점검(내용) VALUES ('다섯 번째')");
console.log("mysql2 가 준 insertId:", 한건.새번호);
// 출력: mysql2 가 준 insertId: 4

const 함수로 = await 마이("SELECT LAST_INSERT_ID() AS 마지막");
console.log("LAST_INSERT_ID() 로 받기:", 짧게(함수로));
// 출력: LAST_INSERT_ID() 로 받기: [{"마지막":4}]

// ★ `LAST_INSERT_ID()` 는 **접속마다 따로** 기억합니다.
//   다른 사람이 그 사이에 INSERT 해도 내 값은 안 바뀝니다. 그건 안전합니다.
//
// ★★★ 그런데 **여러 건을 한 번에 넣으면 위험합니다.**

const 여러건 = await 마이("INSERT INTO 구구_점검(내용) VALUES ('여섯'),('일곱'),('여덟')");
console.log("세 건 넣었을 때 insertId:", 여러건.새번호, "· 넣은 건수:", 여러건.건수);
// 출력: 세 건 넣었을 때 insertId: 5 · 넣은 건수: 3

const 실제번호 = await 마이("SELECT id FROM 구구_점검 WHERE 내용 IN ('여섯','일곱','여덟') ORDER BY id");
console.log("실제로 들어간 번호들:", 짧게(실제번호));
// 출력: 실제로 들어간 번호들: [{"id":5},{"id":6},{"id":7}]

// ★★★ `insertId` 는 5 입니다. **첫 번째 번호만** 줍니다.
//   나머지 6, 7 은 알려 주지 않습니다.
//   "연속으로 붙었을 테니 5,6,7 이겠지" 라고 계산하는 코드를 짜면 안 됩니다.
//   ★ 실제로 `innodb_autoinc_lock_mode` 설정에 따라 **연속이 아닐 수 있습니다.**
//     여러 서버가 동시에 넣거나, 복제 설정이 다르면 띄엄띄엄 붙습니다.
//
// ★ 그래서 MySQL 에서 여러 건을 넣고 번호를 알아야 하면
//   **한 건씩 넣고 매번 insertId 를 받는 수밖에 없습니다.** 느립니다.
//   PostgreSQL 은 `RETURNING` 한 줄로 끝납니다.

const 피지여러건 = await 피지("INSERT INTO 점검(내용) VALUES ('여섯'),('일곱'),('여덟') RETURNING id, 내용");
console.log("PostgreSQL 은 세 건의 번호를 다 줍니다:", 짧게(피지여러건));
// 출력: PostgreSQL 은 세 건의 번호를 다 줍니다: [{"id":5,"내용":"여섯"},{"id":6,"내용":"일곱"},{"id":7,"내용":"여덟"}]


// ── 섹션 4: 없는 기능들 ──

console.log("── 부분 색인 ──");
// 출력: ── 부분 색인 ──

await 나란히(
  "미완료 점검만 색인하기",
  "CREATE INDEX 미완료색인 ON 점검(id) WHERE 내용 IS NULL",
  "CREATE INDEX 미완료색인 ON 구구_점검(id) WHERE 내용 IS NULL",
);
// 출력: · 미완료 점검만 색인하기
// 출력:     PostgreSQL — 성공 0건
// 출력:     MySQL      — 거절 ER_PARSE_ERROR/1064

// ★ 부분 색인(partial index)은 **조건에 맞는 줄만** 색인에 담습니다.
//   "처리 안 된 주문" 처럼 전체의 1% 만 자주 찾는 경우에 아주 효율적입니다.
//   (색인 이야기는 06단원에서 했습니다)
//
// ★ MySQL 에서 대신하는 법: 생성 칸(generated column) + 그 칸에 색인.
//   또는 그냥 전체 색인을 만들고 크기를 감수합니다.

console.log("── 표현식 색인 ──");
// 출력: ── 표현식 색인 ──

await 나란히(
  "소문자로 만든 값에 색인",
  "CREATE INDEX 소문자색인 ON 점검((lower(내용)))",
  "CREATE INDEX 소문자색인 ON 구구_점검((lower(내용)))",
);
// 출력: · 소문자로 만든 값에 색인
// 출력:     PostgreSQL — 성공 0건
// 출력:     MySQL      — 성공 0건

// ★ 표현식 색인은 **양쪽 다 됩니다.** MySQL 은 8.0.13 부터 생겼습니다.
//   괄호를 두 겹 쓰는 것까지 문법이 같습니다.

console.log("── 배열 타입 ──");
// 출력: ── 배열 타입 ──

await 나란히("ARRAY[1,2,3] 만들기", "SELECT ARRAY[1,2,3] AS 목록");
// 출력: · ARRAY[1,2,3] 만들기
// 출력:     PostgreSQL — [{"목록":[1,2,3]}]
// 출력:     MySQL      — 거절 ER_PARSE_ERROR/1064

await 나란히(
  "배열 칸 만들기",
  "CREATE TABLE 태그시험 (태그 TEXT[])",
  "CREATE TABLE 구구_태그시험 (태그 TEXT[])",
);
// 출력: · 배열 칸 만들기
// 출력:     PostgreSQL — 성공 0건
// 출력:     MySQL      — 거절 ER_PARSE_ERROR/1064

await 피지("DROP TABLE IF EXISTS 태그시험");

// ★ MySQL 에서 여러 값을 한 칸에 넣고 싶으면 JSON 배열을 씁니다.
//   또는 **표를 따로 만드는 것**이 정석입니다 (04단원 정규화).
//   ★ 사실 배열 칸은 PostgreSQL 에서도 남용하면 안 됩니다.
//     검색·조인·제약이 어려워집니다.

console.log("── 진짜 BOOLEAN 이 있나 ──");
// 출력: ── 진짜 BOOLEAN 이 있나 ──

await 피지("DROP TABLE IF EXISTS 가동상태");
await 마이("DROP TABLE IF EXISTS 구구_가동상태");
await 피지("CREATE TABLE 가동상태 (설비 VARCHAR(10), 가동 BOOLEAN)");
await 마이("CREATE TABLE 구구_가동상태 (설비 VARCHAR(10), 가동 BOOLEAN)");

await 피지("INSERT INTO 가동상태 VALUES ('프레스', true)");
await 마이("INSERT INTO 구구_가동상태 VALUES ('프레스', true)");

await 나란히(
  "true 를 넣고 다시 읽기",
  "SELECT 가동 FROM 가동상태",
  "SELECT 가동 FROM 구구_가동상태",
);
// 출력: · true 를 넣고 다시 읽기
// 출력:     PostgreSQL — [{"가동":true}]
// 출력:     MySQL      — [{"가동":1}]

const 피지타입 = await 피지(
  "SELECT data_type AS 타입 FROM information_schema.columns WHERE table_schema='단원09' AND table_name='가동상태' AND column_name='가동'",
);
const 마이타입 = await 마이(
  "SELECT COLUMN_TYPE AS 타입 FROM information_schema.columns WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME='구구_가동상태' AND COLUMN_NAME='가동'",
);

console.log("PostgreSQL 이 실제로 만든 타입:", 피지타입.값[0].타입);
// 출력: PostgreSQL 이 실제로 만든 타입: boolean
console.log("MySQL 이 실제로 만든 타입:", 마이타입.값[0].타입);
// 출력: MySQL 이 실제로 만든 타입: tinyint(1)

// ★★ MySQL 의 `BOOLEAN` 은 **별명**입니다. 진짜 타입은 `TINYINT(1)` 입니다.
//   그래서 참·거짓 말고 다른 숫자도 들어갑니다.

const 오오넣기 = await 마이("INSERT INTO 구구_가동상태 VALUES ('용접로봇', 5)");
console.log("MySQL 의 BOOLEAN 칸에 5 넣기:", 짧게(오오넣기));
// 출력: MySQL 의 BOOLEAN 칸에 5 넣기: 성공 1건

const 오오피지 = await 피지("INSERT INTO 가동상태 VALUES ('용접로봇', 5)");
console.log("PostgreSQL 의 BOOLEAN 칸에 5 넣기:", 짧게(오오피지));
// 출력: PostgreSQL 의 BOOLEAN 칸에 5 넣기: 거절 42804

// ★★★ 그리고 5 는 `= true` 로 안 잡힙니다. 이게 진짜 함정입니다.
const 참비교 = await 마이("SELECT COUNT(*) AS 개수 FROM 구구_가동상태 WHERE 가동 = true");
const 참자체 = await 마이("SELECT COUNT(*) AS 개수 FROM 구구_가동상태 WHERE 가동");

console.log("MySQL 에서 `가동 = true` 로 센 것:", 참비교.값[0].개수, "건");
// 출력: MySQL 에서 `가동 = true` 로 센 것: 1 건
console.log("MySQL 에서 `WHERE 가동` 으로 센 것:", 참자체.값[0].개수, "건");
// 출력: MySQL 에서 `WHERE 가동` 으로 센 것: 2 건

// ★★★ 같은 표에서 답이 1 건과 2 건으로 갈립니다.
//   `= true` 는 `= 1` 이라서 5 를 놓칩니다. `WHERE 가동` 은 0 이 아닌 값을 다 잡습니다.
//   → MySQL 에서는 `= true` 대신 **`WHERE 가동 <> 0`** 이나 `WHERE 가동` 을 쓰세요.
//   → 더 좋은 방법은 앱에서 0/1 만 넣도록 막고, `CHECK (가동 IN (0,1))` 를 거는 것입니다.


// ── 섹션 5: ★★★ 트랜잭션 안의 DDL — 마이그레이션이 여기서 갈립니다 ──

// 08단원에서 스키마 변경(마이그레이션)을 했습니다.
// 스키마 변경은 보통 여러 문장을 이어서 실행합니다.
//
//   ① 표를 만든다
//   ② 칸을 추가한다
//   ③ 데이터를 옮긴다
//   ④ 옛 칸을 지운다
//
// **③에서 실패하면 어떻게 될까요?**

await 피지("DROP TABLE IF EXISTS 이력");
await 마이("DROP TABLE IF EXISTS 구구_이력");
await 피지("CREATE TABLE 이력 (기록 VARCHAR(30))");
await 마이("CREATE TABLE 구구_이력 (기록 VARCHAR(30))");

await 피지("DROP TABLE IF EXISTS 새표");
await 마이("DROP TABLE IF EXISTS 구구_새표");

// PostgreSQL — 트랜잭션 안에서 INSERT + CREATE TABLE 을 하고 롤백
await 피지("BEGIN");
await 피지("INSERT INTO 이력 VALUES ('마이그레이션 시작')");
await 피지("CREATE TABLE 새표 (id INT)");
await 피지("ROLLBACK");

// MySQL — 똑같이
await 마이("BEGIN");
await 마이("INSERT INTO 구구_이력 VALUES ('마이그레이션 시작')");
await 마이("CREATE TABLE 구구_새표 (id INT)");
await 마이("ROLLBACK");

const 표남았나피지 = await 피지("SELECT to_regclass('단원09.새표') IS NOT NULL AS 남음");
const 표남았나마이 = await 마이(
  "SELECT COUNT(*) > 0 AS 남음 FROM information_schema.TABLES WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME='구구_새표'",
);

console.log("ROLLBACK 뒤 새 표가 남았나 — PostgreSQL:", 표남았나피지.값[0].남음);
// 출력: ROLLBACK 뒤 새 표가 남았나 — PostgreSQL: false
console.log("ROLLBACK 뒤 새 표가 남았나 — MySQL:", 표남았나마이.값[0].남음 === 1);
// 출력: ROLLBACK 뒤 새 표가 남았나 — MySQL: true

// ★★★ 그리고 더 무서운 것이 있습니다. **앞의 INSERT 도 같이 커밋됩니다.**

const 이력피지 = await 피지("SELECT 기록 FROM 이력");
const 이력마이 = await 마이("SELECT 기록 FROM 구구_이력");

console.log("ROLLBACK 뒤 INSERT 가 남았나 — PostgreSQL:", 짧게(이력피지));
// 출력: ROLLBACK 뒤 INSERT 가 남았나 — PostgreSQL: []
console.log("ROLLBACK 뒤 INSERT 가 남았나 — MySQL:", 짧게(이력마이));
// 출력: ROLLBACK 뒤 INSERT 가 남았나 — MySQL: [{"기록":"마이그레이션 시작"}]

// ★★★ MySQL 은 `CREATE TABLE` 을 만나는 순간 **암묵적 커밋(implicit commit)** 을 합니다.
//   지금까지의 트랜잭션이 그 자리에서 확정됩니다.
//   그 뒤의 `ROLLBACK` 은 되돌릴 것이 없어서 아무 일도 안 합니다.
//
//   `ALTER TABLE`, `DROP TABLE`, `CREATE INDEX`, `TRUNCATE` 도 마찬가지입니다.
//
// ★★ 이게 실무에서 무슨 뜻인가
//
//   PostgreSQL — 마이그레이션 스크립트를 `BEGIN ... COMMIT` 으로 감싸면
//                중간에 실패해도 **통째로 원래대로 돌아갑니다.** 다시 돌리면 됩니다.
//
//   MySQL      — 중간에 실패하면 **반쯤 바뀐 상태로 멈춥니다.**
//                어디까지 됐는지 직접 확인하고 손으로 되돌려야 합니다.
//                새벽 배포 중에 이 상황이 오면 정말 곤란합니다.
//
// ★ MySQL 에서 대비하는 법
//   ① 마이그레이션을 **한 파일에 한 가지 변경**만 담습니다. 실패 지점이 분명해집니다
//   ② 되돌리는 스크립트(down)를 **미리 짜 둡니다**
//   ③ 운영에 하기 전에 **똑같은 데이터로 연습**합니다
//   ④ Flyway·Liquibase 같은 도구를 씁니다. 어디까지 됐는지 기록해 줍니다


// ── 섹션 6: ★★ 표 이름 대소문자 ──

await 피지("DROP TABLE IF EXISTS SeolBi");
await 피지("DROP TABLE IF EXISTS seolbi");
await 마이("DROP TABLE IF EXISTS SeolBi");
await 마이("DROP TABLE IF EXISTS seolbi");

await 피지("CREATE TABLE SeolBi (id INT)");
await 마이("CREATE TABLE SeolBi (id INT)");

// 소문자로 찾아봅니다.
const 소문자피지 = await 피지("SELECT COUNT(*) AS c FROM seolbi");
const 소문자마이 = await 마이("SELECT COUNT(*) AS c FROM seolbi");

console.log("대문자로 만들고 소문자로 찾기 — PostgreSQL:", 짧게(소문자피지));
// 출력: 대문자로 만들고 소문자로 찾기 — PostgreSQL: [{"c":"0"}]
console.log("대문자로 만들고 소문자로 찾기 — MySQL:", 짧게(소문자마이));
// 출력: 대문자로 만들고 소문자로 찾기 — MySQL: 거절 ER_NO_SUCH_TABLE/1146

// 큰따옴표로 원래 대소문자 그대로 찾아봅니다.
const 그대로피지 = await 피지(`SELECT COUNT(*) AS c FROM "SeolBi"`);
console.log("PostgreSQL 에서 \"SeolBi\" 로 찾기:", 짧게(그대로피지));
// 출력: PostgreSQL 에서 "SeolBi" 로 찾기: 거절 42P01

const 이름피지 = await 피지(
  "SELECT tablename AS 이름 FROM pg_tables WHERE schemaname='단원09' AND lower(tablename)='seolbi'",
);
const 이름마이 = await 마이(
  "SELECT TABLE_NAME AS 이름 FROM information_schema.TABLES WHERE TABLE_SCHEMA='factory_db' AND LOWER(TABLE_NAME)='seolbi'",
);

console.log("실제로 저장된 표 이름 — PostgreSQL:", 짧게(이름피지));
// 출력: 실제로 저장된 표 이름 — PostgreSQL: [{"이름":"seolbi"}]
console.log("실제로 저장된 표 이름 — MySQL:", 짧게(이름마이));
// 출력: 실제로 저장된 표 이름 — MySQL: [{"이름":"SeolBi"}]

// ★★ 규칙이 정확히 반대입니다.
//
//   PostgreSQL — 따옴표가 없으면 **소문자로 접어서** 저장합니다.
//                `SeolBi` 로 만들면 실제 이름은 `seolbi` 입니다.
//                그래서 `SELECT * FROM SEOLBI` 도 되고 `seolbi` 도 됩니다.
//                반대로 `"SeolBi"` 라고 따옴표를 붙이면 **없는 표**입니다.
//
//   MySQL      — 적은 그대로 저장합니다. `SeolBi` 는 `SeolBi` 입니다.
//                그래서 `seolbi` 로는 못 찾습니다.
//
// ★★★ 그런데 MySQL 은 **운영체제를 탑니다.** 이게 진짜 문제입니다.

const 접기설정 = await 마이("SELECT @@lower_case_table_names AS 값");
console.log("이 서버의 lower_case_table_names:", 접기설정.값[0].값);
// 출력: 이 서버의 lower_case_table_names: 0

//   lower_case_table_names 값의 뜻
//     0 — 적은 그대로 저장하고 **구분해서** 찾습니다 (리눅스 기본)
//     1 — 전부 소문자로 바꿔서 저장하고 구분하지 않습니다 (윈도 기본)
//     2 — 적은 대로 저장하지만 찾을 때는 구분하지 않습니다 (macOS 기본)
//
// ★★★ **개발은 맥에서 하고 배포는 리눅스에 하는 팀이 여기서 터집니다.**
//
//   맥에서는 `SELECT * FROM Seolbi` 가 잘 돕니다 (구분 안 함).
//   같은 코드를 리눅스 서버에 올리면 `Table doesn't exist` 가 납니다.
//   ★ 이 자료의 docker 는 리눅스 컨테이너라서 값이 0 입니다. **구분합니다.**
//
// ★ 예방하는 법 — 아주 간단합니다.
//   **표 이름·칸 이름을 전부 소문자로 쓰세요.** 그러면 어느 쪽에서도 안 터집니다.
//   (이 자료는 읽기 쉬우라고 한글 이름을 쓰지만, 회사에서는 소문자 영어가 많습니다)

// ★ 칸 이름은 어떨까요. 여기는 MySQL 이 더 너그럽습니다.
const 칸대소문자 = await 마이("SELECT COUNT(ID) AS c FROM SeolBi");
console.log("MySQL 에서 칸 이름을 대문자로 써도 되나:", 짧게(칸대소문자));
// 출력: MySQL 에서 칸 이름을 대문자로 써도 되나: [{"c":0}]

// ★ MySQL 에서 **칸 이름은 항상 대소문자를 구분하지 않습니다.** OS 와 무관합니다.
//   PostgreSQL 은 칸 이름도 소문자로 접습니다. 결과적으로 둘 다 대소문자를 안 가립니다.

await 피지("DROP TABLE IF EXISTS seolbi");
await 마이("DROP TABLE IF EXISTS SeolBi");


// ── 섹션 7: UPSERT — 있으면 고치고 없으면 넣기 ──

await 피지("DROP TABLE IF EXISTS 부품재고");
await 마이("DROP TABLE IF EXISTS 구구_부품재고");
await 피지("CREATE TABLE 부품재고 (부품 VARCHAR(20) PRIMARY KEY, 수량 INT)");
await 마이("CREATE TABLE 구구_부품재고 (부품 VARCHAR(20) PRIMARY KEY, 수량 INT)");

// PostgreSQL — ON CONFLICT
const 피지업1 = await 피지(
  "INSERT INTO 부품재고 VALUES ('베어링', 10) ON CONFLICT (부품) DO UPDATE SET 수량 = 부품재고.수량 + EXCLUDED.수량 RETURNING *",
);
const 피지업2 = await 피지(
  "INSERT INTO 부품재고 VALUES ('베어링', 5) ON CONFLICT (부품) DO UPDATE SET 수량 = 부품재고.수량 + EXCLUDED.수량 RETURNING *",
);

console.log("PostgreSQL 첫 번째(새로 넣기):", 짧게(피지업1));
// 출력: PostgreSQL 첫 번째(새로 넣기): [{"부품":"베어링","수량":10}]
console.log("PostgreSQL 두 번째(더하기):", 짧게(피지업2));
// 출력: PostgreSQL 두 번째(더하기): [{"부품":"베어링","수량":15}]

// MySQL — ON DUPLICATE KEY UPDATE
//   ★ 8.0.20 부터 `AS 별명` 문법을 씁니다. 옛 문법 `VALUES(칸)` 은 곧 없어집니다.
const 마이업1 = await 마이(
  "INSERT INTO 구구_부품재고 VALUES ('베어링', 10) AS 새값 ON DUPLICATE KEY UPDATE 수량 = 구구_부품재고.수량 + 새값.수량",
);
const 마이업2 = await 마이(
  "INSERT INTO 구구_부품재고 VALUES ('베어링', 5) AS 새값 ON DUPLICATE KEY UPDATE 수량 = 구구_부품재고.수량 + 새값.수량",
);

console.log("MySQL 첫 번째 affectedRows:", 마이업1.건수);
// 출력: MySQL 첫 번째 affectedRows: 1
console.log("MySQL 두 번째 affectedRows:", 마이업2.건수);
// 출력: MySQL 두 번째 affectedRows: 2

const 마이재고 = await 마이("SELECT 부품, 수량 FROM 구구_부품재고");
console.log("MySQL 결과:", 짧게(마이재고));
// 출력: MySQL 결과: [{"부품":"베어링","수량":15}]

// ★★ `affectedRows` 가 1 과 2 로 다릅니다. 이게 MySQL 의 신호입니다.
//     1 = 새로 넣었음   ·   2 = 이미 있어서 고쳤음
//   ★ 문서에는 "값이 그대로면 0" 이라고 적혀 있는데, 드라이버 설정에 따라 다릅니다.
//     이 자료의 mysql2 에서는 값이 안 바뀌어도 1 이 나옵니다. **믿지 마세요.**
//   → "새로 만들어졌는지" 를 알아야 하면 PostgreSQL 의 `RETURNING` 이 훨씬 확실합니다.

// ★ "있으면 그냥 넘어가기" 도 문법이 다릅니다.
const 피지무시 = await 피지("INSERT INTO 부품재고 VALUES ('베어링', 99) ON CONFLICT DO NOTHING");
const 마이무시 = await 마이("INSERT IGNORE INTO 구구_부품재고 VALUES ('베어링', 99)");

console.log("PostgreSQL ON CONFLICT DO NOTHING:", 짧게(피지무시));
// 출력: PostgreSQL ON CONFLICT DO NOTHING: 성공 0건
console.log("MySQL INSERT IGNORE:", 짧게(마이무시));
// 출력: MySQL INSERT IGNORE: 성공 0건

// ★★ `INSERT IGNORE` 는 조심해서 쓰세요.
//   중복만 무시하는 게 아니라 **다른 에러도 경고로 바꿔 버립니다.**
//   개념02 에서 본 "값이 잘려 들어가는" 일이 `INSERT IGNORE` 에서는 STRICT 를 켜도 일어납니다.
//   → 중복만 넘기고 싶으면 `ON DUPLICATE KEY UPDATE 부품 = 부품` 처럼 쓰는 편이 안전합니다.


// ── 섹션 8: JSON ──

await 피지("DROP TABLE IF EXISTS 센서");
await 마이("DROP TABLE IF EXISTS 구구_센서");
await 피지("CREATE TABLE 센서 (id INT, 값 JSONB)");
await 마이("CREATE TABLE 구구_센서 (id INT, 값 JSON)");

const 센서값 = '{"온도":78,"진동":0.4}';
await 피지("INSERT INTO 센서 VALUES (1, $1)", [센서값]);
await 마이("INSERT INTO 구구_센서 VALUES (1, ?)", [센서값]);

const 피지꺼내기 = await 피지("SELECT 값->>'온도' AS 온도 FROM 센서");
const 마이꺼내기 = await 마이(`SELECT 값->>'$."온도"' AS 온도 FROM 구구_센서`);

console.log("PostgreSQL 에서 값 꺼내기:", 짧게(피지꺼내기));
// 출력: PostgreSQL 에서 값 꺼내기: [{"온도":"78"}]
console.log("MySQL 에서 값 꺼내기:", 짧게(마이꺼내기));
// 출력: MySQL 에서 값 꺼내기: [{"온도":"78"}]

// ★ `->` 와 `->>` 기호는 같습니다. 그런데 **가리키는 방법이 다릅니다.**
//     PostgreSQL — `값->>'온도'`          (키 이름을 그냥 적습니다)
//     MySQL      — `값->>'$."온도"'`      (JSON 경로 문법입니다)
//   ★★ MySQL 의 경로에서 한글 키는 **큰따옴표로 감싸야 합니다.** 안 그러면 3143 에러입니다.

const 경로실수 = await 마이("SELECT 값->>'$.온도' AS 온도 FROM 구구_센서");
console.log("MySQL 에서 한글 키를 따옴표 없이:", 짧게(경로실수));
// 출력: MySQL 에서 한글 키를 따옴표 없이: 거절 ER_INVALID_JSON_PATH/3143

// 포함 검사
const 피지포함 = await 피지(`SELECT COUNT(*)::int AS c FROM 센서 WHERE 값 @> '{"온도":78}'`);
const 마이포함 = await 마이(`SELECT COUNT(*) AS c FROM 구구_센서 WHERE JSON_CONTAINS(값, '{"온도":78}')`);
const 마이꺽쇠 = await 마이(`SELECT COUNT(*) AS c FROM 구구_센서 WHERE 값 @> '{"온도":78}'`);

console.log("PostgreSQL 포함 검사(@>):", 짧게(피지포함));
// 출력: PostgreSQL 포함 검사(@>): [{"c":1}]
console.log("MySQL 포함 검사(JSON_CONTAINS):", 짧게(마이포함));
// 출력: MySQL 포함 검사(JSON_CONTAINS): [{"c":1}]
console.log("MySQL 에서 @> 를 쓰면:", 짧게(마이꺽쇠));
// 출력: MySQL 에서 @> 를 쓰면: 거절 ER_PARSE_ERROR/1064

// 색인
const 피지진 = await 피지("CREATE INDEX 센서색인 ON 센서 USING GIN (값)");
const 마이직접 = await 마이("CREATE INDEX 센서색인 ON 구구_센서 (값)");

console.log("PostgreSQL 의 GIN 색인:", 짧게(피지진));
// 출력: PostgreSQL 의 GIN 색인: 성공 0건
console.log("MySQL 에서 JSON 칸에 직접 색인:", 짧게(마이직접));
// 출력: MySQL 에서 JSON 칸에 직접 색인: 거절 ER_JSON_USED_AS_KEY/3152

const 마이생성칸 = await 마이(
  `ALTER TABLE 구구_센서 ADD COLUMN 온도 INT AS (값->>'$."온도"') STORED, ADD INDEX (온도)`,
);
console.log("MySQL 은 생성 칸을 만들어 색인합니다:", 짧게(마이생성칸));
// 출력: MySQL 은 생성 칸을 만들어 색인합니다: 성공 1건

const 생성칸값 = await 마이("SELECT id, 온도 FROM 구구_센서");
console.log("생성 칸에 들어간 값:", 짧게(생성칸값));
// 출력: 생성 칸에 들어간 값: [{"id":1,"온도":78}]

// ★ 정리하면
//   PostgreSQL — `JSONB` 는 **통째로 색인**할 수 있습니다(GIN). 어떤 키로 찾아도 빠릅니다
//   MySQL      — JSON 칸 자체에는 색인을 못 겁니다.
//                자주 찾는 키마다 **생성 칸을 만들고 거기에 색인**을 겁니다
//
// ★★ 그래서 "무엇이 들어올지 모르는 데이터" 는 PostgreSQL 이 편합니다.
//   미리 정해진 몇 개만 찾을 거라면 MySQL 도 충분합니다.
//   ★ 어느 쪽이든, **자주 찾는 값은 JSON 밖으로 꺼내서 진짜 칸으로 만드는 것**이 정석입니다.


// ── 뒷정리 ──

for (const 표 of ["점검", "가동상태", "이력", "새표", "부품재고", "센서", "seolbi"]) {
  await 피지(`DROP TABLE IF EXISTS ${표}`);
}
for (const 표 of ["구구_점검", "구구_가동상태", "구구_이력", "구구_새표", "구구_부품재고", "구구_센서", "SeolBi"]) {
  await 마이(`DROP TABLE IF EXISTS ${표}`);
}

console.log("실습에 쓴 표를 모두 지웠습니다.");
// 출력: 실습에 쓴 표를 모두 지웠습니다.


// ============================================================
// 정리 — 문법·기능 대응표
// ============================================================
//
//   하고 싶은 것          PostgreSQL                   MySQL 8.4
//   ────────────────────────────────────────────────────────────────────────
//   파라미터              $1, $2 (번호 있음)            ? (순서대로)
//   자동 번호             SERIAL / IDENTITY             AUTO_INCREMENT
//   롤백 뒤 번호          건너뜀                        건너뜀 (같음)
//   넣은 뒤 id 받기       RETURNING id                  insertId / LAST_INSERT_ID()
//   여러 건 넣고 id       RETURNING 이 전부 줌          첫 번째만 알려 줌 ★
//   부분 색인             CREATE INDEX ... WHERE        ✗ 없음
//   표현식 색인           ○                             ○ (8.0.13+)
//   배열 타입             TEXT[] , ARRAY[...]           ✗ 없음 (JSON 으로 대신)
//   BOOLEAN               진짜 타입                     TINYINT(1) 별명 ★
//   트랜잭션 안의 DDL     롤백됨                        암묵적 커밋 ★★★
//   표 이름 대소문자      소문자로 접음                 그대로 · OS 를 탐 ★★
//   칸 이름 대소문자      소문자로 접음                 안 가림
//   UPSERT                ON CONFLICT DO UPDATE         ON DUPLICATE KEY UPDATE
//   중복 무시             ON CONFLICT DO NOTHING        INSERT IGNORE (주의)
//   JSON 꺼내기           값->>'키'                     값->>'$."키"'
//   JSON 포함             @>                            JSON_CONTAINS()
//   JSON 색인             GIN 으로 통째로               생성 칸 + 색인
//   이름 감싸기           "큰따옴표"                    `역따옴표`
//
// ★★★ 이 표에서 별표가 붙은 다섯 개만 확실히 외우면 됩니다.
//   나머지는 옮길 때 문법 오류가 나서 어차피 눈에 띕니다.
//
// ★ 다음 파일에서 **옮기기 전에 확인할 목록**을 코드로 만듭니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 에서 롤백 대신 **에러가 난 INSERT** 를 넣어 보세요.
//                    (예: NOT NULL 위반) 번호가 건너뛰나요?
//
// ✏️ 직접 해보기 2 — MySQL 에서 `ALTER TABLE 구구_점검 AUTO_INCREMENT = 100` 을 해 보세요.
//                    다음 번호가 100 이 되나요?
//                    PostgreSQL 에서는 `ALTER SEQUENCE 점검_id_seq RESTART WITH 100` 입니다.
//
// ✏️ 직접 해보기 3 — 섹션 3 을 응용해서, MySQL 에서 세 건을 넣고
//                    각각의 id 를 **정확히** 받는 코드를 짜 보세요.
//                    (힌트: 한 건씩 넣는 수밖에 없습니다. 몇 줄이 더 필요한가요?)
//
// ✏️ 직접 해보기 4 — 섹션 5 를 `ALTER TABLE` 로 바꿔 보세요.
//                    `BEGIN → INSERT → ALTER TABLE ... ADD COLUMN → ROLLBACK`.
//                    ★ MySQL 에서 칸이 남나요? INSERT 도 남나요?
//
// ✏️ 직접 해보기 5 — 섹션 6 에서 `CREATE TABLE "설비 목록"` 처럼
//                    공백이 든 이름을 양쪽에서 만들어 보세요. 어떻게 감싸야 하나요?
//
// ✏️ 직접 해보기 6 — 섹션 7 의 UPSERT 를 **여러 건 한꺼번에** 해 보세요.
//                    `VALUES ('a',1),('b',2),('c',3)` 에서
//                    b 만 이미 있으면 MySQL 의 affectedRows 는 얼마일까요?
//
// ✏️ 직접 해보기 7 — 섹션 8 에서 JSON 배열을 넣어 보세요.
//                    `'{"태그":["점검","긴급"]}'` 에서 '긴급' 이 들어 있는 줄을
//                    양쪽에서 찾는 SQL 을 각각 써 보세요.
//
// ✏️ 직접 해보기 8 — PostgreSQL 의 `TEXT[]` 칸을 MySQL 로 옮긴다면
//                    어떻게 설계하시겠습니까? 방법 두 가지를 적어 보세요.


// ── 자주 하는 실수 ──

// [실수 1] `$1` 을 `?` 로 기계적으로 바꾼다
//   같은 번호를 두 번 쓴 쿼리가 있으면 **값 개수가 안 맞아 터집니다.**
//   반대로 `?` 를 `$1,$2,...` 로 바꿀 때는 순서를 세어야 합니다.

// [실수 2] 자동 번호가 연속일 거라고 믿는다
//   ★ 양쪽 다 건너뜁니다. 롤백해도 번호는 안 돌아옵니다.
//   "번호 = 건수" 로 계산하는 코드는 언젠가 틀립니다.

// [실수 3] MySQL 에서 여러 건 넣고 `insertId + i` 로 번호를 계산한다
//   ★★★ 연속이라는 보장이 없습니다. 설정과 동시성에 따라 띄엄띄엄 붙습니다.
//   운영에서 사용자가 몰릴 때만 틀려서 재현이 안 됩니다. 최악의 버그입니다.

// [실수 4] 마이그레이션을 트랜잭션으로 감싸면 MySQL 도 안전할 거라고 믿는다
//   ★★★ 안 됩니다. DDL 이 암묵적 커밋을 일으킵니다.
//   섹션 5 에서 확인했습니다. INSERT 까지 같이 커밋됩니다.

// [실수 5] 맥에서 개발하고 리눅스에 배포한다 + 표 이름에 대문자를 쓴다
//   ★★ 맥에서는 잘 돌고 서버에서만 `Table doesn't exist` 가 납니다.
//   표 이름은 소문자로 통일하세요.

// [실수 6] MySQL 의 BOOLEAN 을 진짜 BOOLEAN 이라고 믿는다
//   `TINYINT(1)` 입니다. 5 도 들어가고, 그러면 `= true` 로 안 잡힙니다.
//   `WHERE 가동` 이나 `WHERE 가동 <> 0` 을 쓰세요.

// [실수 7] `INSERT IGNORE` 를 "중복만 넘기는 것" 으로 안다
//   다른 에러까지 경고로 바꿉니다. 값이 조용히 잘려 들어갈 수 있습니다.

// [실수 8] MySQL 의 JSON 경로에 한글 키를 그냥 쓴다
//   `$.온도` 는 3143 에러입니다. `$."온도"` 로 감싸야 합니다.
//   영어 키만 쓰면 이 문제가 안 생깁니다.


await PG.end();
await MY.end();
