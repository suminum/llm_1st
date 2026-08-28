// ============================================================
// 09단원 · 개념 03 — 조용히 다른 결과
// ------------------------------------------------------------
// 실행: node 개념03_조용히_다른_결과.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 개념02 에서 본 것들은 사실 **안전한 차이**였습니다.
// 에러가 났으니까요. 에러는 고칠 수 있습니다.
//
// 이 파일에서 보는 것은 **에러가 안 나는 차이**입니다.
//
//   같은 SQL 을 보냈는데
//   양쪽 다 성공했다고 하고
//   **값이 다릅니다.**
//
// 이게 진짜 사고를 냅니다.
// 옮긴 날에는 아무 일도 없습니다. 테스트도 다 통과합니다.
// 몇 주 뒤에 "왜 목록이 이상하죠?" 라는 전화가 옵니다.
//
// 이 파일에서 여섯 가지를 봅니다. 전부 실제로 양쪽에서 돌립니다.
//
//   ① `||` 가 문자열 연결이 아니다        ★★★
//   ② 글자 비교가 대소문자를 무시한다      ★★★
//   ③ 뒤 공백을 무시할 때가 있다           ★★
//   ④ 0 으로 나누면 NULL 이 나온다         ★★
//   ⑤ 글자를 숫자로 알아서 바꿔 준다       ★★★
//   ⑥ 글자 수를 세면 바이트가 나온다       ★

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
    // ★ 조회면 줄을 보여 주고, 넣기·고치기면 몇 건인지 보여 줍니다.
    const 조회인가 = 결과.command === "SELECT" || 결과.command === "SHOW";

    return { 됨: true, 값: 결과.rows, 조회: 조회인가, 건수: 결과.rowCount ?? 0 };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code };
  }
}

async function 마이(sql, 값 = []) {
  try {
    const [행들] = await MY.query(sql, 값);
    // ★ mysql2 는 조회면 배열을, 넣기·고치기면 요약 객체를 줍니다.
    const 조회인가 = Array.isArray(행들);

    return {
      됨: true,
      값: 조회인가 ? 행들 : [],
      조회: 조회인가,
      건수: 조회인가 ? 행들.length : 행들.affectedRows,
    };
  } catch (에러) {
    // ★ MySQL 에러는 code 가 글자입니다(ER_...). 숫자는 errno 입니다.
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

// ★ MySQL 은 참/거짓이 1/0 으로 옵니다. 비교하기 편하게 바꿔 주는 함수입니다.
function 참인가(값) {
  return 값 === true || 값 === 1;
}


// ── 섹션 1: ★★★ `||` — 같은 기호, 완전히 다른 뜻 ──

const 이어붙이기 = await 나란히("설비 이름 만들기 — 'A동' || 'B동'", "SELECT 'A동' || 'B동' AS 결과");
// 출력: · 설비 이름 만들기 — 'A동' || 'B동'
// 출력:     PostgreSQL — [{"결과":"A동B동"}]
// 출력:     MySQL      — [{"결과":0}]

// ★★★ PostgreSQL 은 `'A동B동'` 을 줬고, MySQL 은 `0` 을 줬습니다.
//
//   왜 그런가:
//     표준 SQL 에서 `||` 는 **문자열 연결**입니다. PostgreSQL 은 그대로 따릅니다.
//     MySQL 은 `||` 를 **OR** 로 씁니다. C 언어 습관입니다.
//     그래서 `'A동' || 'B동'` 은 `'A동' OR 'B동'` 이 됩니다.
//     글자를 참/거짓으로 바꿀 때 숫자로 읽을 수 없으면 0(거짓)이라서 결과가 0 입니다.
//
// ★★ 에러가 안 납니다. 이게 핵심입니다.
//   설비 이름을 만들어 붙이는 코드가 있었다면, 옮긴 뒤 이름이 전부 `0` 이 됩니다.

console.log("PG 결과가 글자인가:", typeof 이어붙이기.가.값[0].결과 === "string");
// 출력: PG 결과가 글자인가: true
console.log("MySQL 결과가 숫자인가:", typeof 이어붙이기.나.값[0].결과 === "number");
// 출력: MySQL 결과가 숫자인가: true

// ★★★ 그리고 값에 따라 **0 이 되기도 하고 1 이 되기도 합니다.** 더 나쁩니다.

await 나란히("숫자로 시작하는 글자를 붙이면 — 'A동' || '3호'", "SELECT 'A동' || '3호' AS 결과");
// 출력: · 숫자로 시작하는 글자를 붙이면 — 'A동' || '3호'
// 출력:     PostgreSQL — [{"결과":"A동3호"}]
// 출력:     MySQL      — [{"결과":1}]

// ★ `'3호'` 는 숫자 3 으로 읽힙니다. `0 OR 3` 은 참이라서 1 이 됐습니다.
//   같은 코드가 데이터에 따라 0 을 주기도 1 을 주기도 합니다.
//   "값이 0 이면 문제" 라고 찍어 보는 점검 코드도 이걸 못 잡습니다.

await 나란히("정말 OR 이 맞는지 — 1 || 0", "SELECT 1 || 0 AS 결과");
// 출력: · 정말 OR 이 맞는지 — 1 || 0
// 출력:     PostgreSQL — 거절 42883
// 출력:     MySQL      — [{"결과":1}]

// ★ `1 || 0` 이 MySQL 에서 1 입니다. `1 OR 0` 이 참이니까요. OR 이 맞습니다.
//   PostgreSQL 은 "숫자 || 숫자 라는 연산자는 없다"(42883) 고 합니다.

// ── 어떻게 맞추나 ①: MySQL 에서 `||` 를 연결로 만들기

const 원래모드 = (await 마이("SELECT @@SESSION.sql_mode AS m")).값[0].m;

await 마이("SET SESSION sql_mode = CONCAT(@@SESSION.sql_mode, ',PIPES_AS_CONCAT')");

const 켠뒤 = await 마이("SELECT 'A동' || 'B동' AS 결과");
console.log("PIPES_AS_CONCAT 켠 뒤 MySQL:", 짧게(켠뒤));
// 출력: PIPES_AS_CONCAT 켠 뒤 MySQL: [{"결과":"A동B동"}]

await 마이("SET SESSION sql_mode = ?", [원래모드]);

const 끈뒤 = await 마이("SELECT 'A동' || 'B동' AS 결과");
console.log("되돌린 뒤 MySQL:", 짧게(끈뒤));
// 출력: 되돌린 뒤 MySQL: [{"결과":0}]

// ★ `PIPES_AS_CONCAT` 을 켜면 됩니다. 그런데 **기본이 아닙니다.**
//   그리고 이 설정을 켜면 `||` 를 OR 로 쓰던 옛 코드가 망가집니다.
//   운영 중인 서버에서 함부로 못 켭니다.
//
// ── 어떻게 맞추나 ②: 양쪽에서 다 되는 문법을 쓰기

await 나란히("concat() 으로 쓰면", "SELECT concat('A동', 'B동') AS 결과");
// 출력: · concat() 으로 쓰면
// 출력:     PostgreSQL — [{"결과":"A동B동"}]
// 출력:     MySQL      — [{"결과":"A동B동"}]

// ★★★ **이게 정답입니다.** `concat()` 은 양쪽에서 똑같이 동작합니다.
//   두 DB 를 다 지원해야 하는 코드라면 `||` 를 아예 쓰지 마세요.
//
// ★ 주의: NULL 을 다루는 방식은 다릅니다.
//   PostgreSQL 의 `concat()` 은 NULL 을 빈 글자로 봅니다.
//   PostgreSQL 의 `||` 는 NULL 이 하나라도 있으면 전체가 NULL 입니다.

await 나란히("concat 에 NULL 이 섞이면", "SELECT concat('A', NULL, 'B') AS 결과");
// 출력: · concat 에 NULL 이 섞이면
// 출력:     PostgreSQL — [{"결과":"AB"}]
// 출력:     MySQL      — [{"결과":null}]

// ★★ 여기도 다릅니다. PostgreSQL 은 `'AB'`, MySQL 은 `NULL` 입니다.
//   MySQL 의 `CONCAT()` 은 NULL 이 하나라도 있으면 전체가 NULL 입니다.
//   → NULL 이 섞일 수 있으면 `COALESCE(칸, '')` 로 감싸세요. 양쪽에서 같아집니다.

await 나란히("COALESCE 로 감싸면", "SELECT concat('A', COALESCE(NULL,''), 'B') AS 결과");
// 출력: · COALESCE 로 감싸면
// 출력:     PostgreSQL — [{"결과":"AB"}]
// 출력:     MySQL      — [{"결과":"AB"}]


// ── 섹션 2: ★★★ 대소문자 — 로그인과 중복확인이 갈립니다 ──

await 나란히("'ABC' = 'abc'", "SELECT ('ABC' = 'abc') AS 결과");
// 출력: · 'ABC' = 'abc'
// 출력:     PostgreSQL — [{"결과":false}]
// 출력:     MySQL      — [{"결과":1}]

// 왜 그런가 — **collation(정렬·비교 규칙)** 때문입니다.
//
//   collation 은 "글자를 어떻게 비교하고 어떻게 정렬할지" 를 정한 규칙표입니다.
//   MySQL 의 기본은 `utf8mb4_0900_ai_ci` 입니다. 이름 뒤 두 글자가 핵심입니다.
//
//     ai = accent insensitive  — 악센트를 무시합니다 (e 와 é 를 같게 봅니다)
//     ci = case insensitive    — 대소문자를 무시합니다 (A 와 a 를 같게 봅니다)
//
//   PostgreSQL 의 기본은 운영체제 규칙을 따르는 정렬이고, **글자 그대로 비교**합니다.

const 콜레이션 = await 마이("SELECT @@collation_database AS c");
console.log("MySQL 표의 기본 collation:", 콜레이션.값[0].c);
// 출력: MySQL 표의 기본 collation: utf8mb4_0900_ai_ci

await 나란히("악센트도 무시할까 — 'e' = 'é'", "SELECT ('e' = 'é') AS 결과");
// 출력: · 악센트도 무시할까 — 'e' = 'é'
// 출력:     PostgreSQL — [{"결과":false}]
// 출력:     MySQL      — [{"결과":1}]

// ★ `ai` 가 진짜로 동작합니다. 프랑스어·독일어 이름을 다루면 이게 문제가 됩니다.

// ── ★★ 실제 시나리오: 아이디 중복확인 ──

// 현장 코드가 보통 이렇게 생겼습니다.
//
//   ① SELECT COUNT(*) FROM 작업자 WHERE 아이디 = ?     ← 중복확인
//   ② 0 이면 INSERT
//
// 이 코드가 양쪽에서 **정반대로** 동작합니다. 직접 해 봅니다.

await 피지("DROP TABLE IF EXISTS 작업자");
await 마이("DROP TABLE IF EXISTS 구구_작업자");
await 피지("CREATE TABLE 작업자 (아이디 VARCHAR(30) UNIQUE, 이름 VARCHAR(20))");
await 마이("CREATE TABLE 구구_작업자 (아이디 VARCHAR(30) UNIQUE, 이름 VARCHAR(20))");

// 관리자가 'Admin' 으로 먼저 가입합니다.
await 피지("INSERT INTO 작업자 VALUES ('Admin', '김반장')");
await 마이("INSERT INTO 구구_작업자 VALUES ('Admin', '김반장')");

// 이제 누군가 'admin' 으로 가입하려고 합니다. 먼저 중복확인을 합니다.
const 확인피지 = await 피지("SELECT COUNT(*)::int AS 개수 FROM 작업자 WHERE 아이디 = 'admin'");
const 확인마이 = await 마이("SELECT COUNT(*) AS 개수 FROM 구구_작업자 WHERE 아이디 = 'admin'");

console.log("중복확인 결과 — PG:", 확인피지.값[0].개수, "· MySQL:", 확인마이.값[0].개수);
// 출력: 중복확인 결과 — PG: 0 · MySQL: 1

// ★★★ 벌써 갈렸습니다.
//   PostgreSQL 은 "그런 아이디 없습니다" 라고 합니다 → **가입 화면이 통과됩니다.**
//   MySQL 은 "이미 있습니다" 라고 합니다 → 막습니다.

const 가입피지 = await 피지("INSERT INTO 작업자 VALUES ('admin', '이반장')");
const 가입마이 = await 마이("INSERT INTO 구구_작업자 VALUES ('admin', '이반장')");

console.log("실제 가입 — PG:", 짧게(가입피지));
// 출력: 실제 가입 — PG: 성공 1건
console.log("실제 가입 — MySQL:", 짧게(가입마이));
// 출력: 실제 가입 — MySQL: 거절 ER_DUP_ENTRY/1062

const 목록피지 = await 피지("SELECT 아이디, 이름 FROM 작업자 ORDER BY 아이디");
const 목록마이 = await 마이("SELECT 아이디, 이름 FROM 구구_작업자 ORDER BY 아이디");

console.log("PG 에 남은 계정:", 짧게(목록피지));
// 출력: PG 에 남은 계정: [{"아이디":"Admin","이름":"김반장"},{"아이디":"admin","이름":"이반장"}]
console.log("MySQL 에 남은 계정:", 짧게(목록마이));
// 출력: MySQL 에 남은 계정: [{"아이디":"Admin","이름":"김반장"}]

// ★★★ 결과를 정리하면 이렇습니다.
//
//   PostgreSQL — 'Admin' 과 'admin' 이 **다른 계정 두 개**가 됐습니다.
//   MySQL      — UNIQUE 색인이 같은 값으로 보고 **막았습니다.**
//
// ★ 놀랐을 겁니다. "MySQL 이 허술하다" 는 예상과 정반대입니다.
//   여기서는 **MySQL 이 더 안전하게 동작했습니다.**
//   대신 MySQL 은 대소문자를 구분해야 하는 곳(비밀번호 해시, 토큰, 상품 코드)에서
//   같은 이유로 위험합니다. 좋고 나쁨의 문제가 아니라 **다름**의 문제입니다.
//
// ★★ 옮길 때 무슨 일이 나나 — 양쪽 다 사고입니다.
//
//   MySQL → PostgreSQL 로 옮기면
//     지금까지 막히던 'Admin'/'admin' 이 **둘 다 가입됩니다.**
//     로그인 화면에서 어느 계정으로 들어갈지 알 수 없게 됩니다. 보안 사고입니다.
//
//   PostgreSQL → MySQL 로 옮기면
//     이미 들어 있는 'Admin' 과 'admin' 을 옮기다가
//     **UNIQUE 충돌(1062)로 이관이 멈춥니다.**
//     밤새 데이터를 옮기다 새벽 3시에 여기서 막힙니다.

// ── 어떻게 맞추나 ──

// 방법 ① PostgreSQL 쪽을 MySQL 처럼 만들기 — 소문자 유일 색인
await 피지("DELETE FROM 작업자");
await 피지("CREATE UNIQUE INDEX 작업자_아이디_소문자 ON 작업자 (lower(아이디))");

const 소문자1 = await 피지("INSERT INTO 작업자 VALUES ('Admin','김반장')");
const 소문자2 = await 피지("INSERT INTO 작업자 VALUES ('admin','이반장')");

console.log("소문자 유일 색인 뒤 'Admin':", 짧게(소문자1));
// 출력: 소문자 유일 색인 뒤 'Admin': 성공 1건
console.log("소문자 유일 색인 뒤 'admin':", 짧게(소문자2));
// 출력: 소문자 유일 색인 뒤 'admin': 거절 23505

// ★★ 이제 PostgreSQL 도 MySQL 처럼 막습니다.
//   ★ 이때 조회도 `WHERE lower(아이디) = lower($1)` 로 해야 색인을 탑니다.
//   ★ `citext` 확장을 쓰는 방법도 있습니다. 칸 타입을 아예 대소문자 무시로 만듭니다.

const 시텍스트 = await 피지("SELECT COUNT(*)::int AS c FROM pg_available_extensions WHERE name='citext'");
console.log("이 서버에 citext 확장이 있나:", 시텍스트.값[0].c > 0);
// 출력: 이 서버에 citext 확장이 있나: true

// 방법 ② MySQL 쪽을 PostgreSQL 처럼 만들기 — collation 을 바꾸기
await 마이("DROP TABLE IF EXISTS 구구_구분작업자");
await 마이("CREATE TABLE 구구_구분작업자 (아이디 VARCHAR(30) COLLATE utf8mb4_0900_as_cs UNIQUE)");

const 구분1 = await 마이("INSERT INTO 구구_구분작업자 VALUES ('Admin')");
const 구분2 = await 마이("INSERT INTO 구구_구분작업자 VALUES ('admin')");

console.log("as_cs collation 에서 'Admin':", 짧게(구분1));
// 출력: as_cs collation 에서 'Admin': 성공 1건
console.log("as_cs collation 에서 'admin':", 짧게(구분2));
// 출력: as_cs collation 에서 'admin': 성공 1건

const 구분목록 = await 마이("SELECT 아이디 FROM 구구_구분작업자 ORDER BY BINARY 아이디");
console.log("as_cs 표에 남은 것:", 짧게(구분목록));
// 출력: as_cs 표에 남은 것: [{"아이디":"Admin"},{"아이디":"admin"}]

// ★ `as_cs` = accent sensitive, case sensitive. 이제 PostgreSQL 과 같아졌습니다.
//   ★★ 칸 하나씩 지정할 수도 있고, 표·데이터베이스 단위로도 지정합니다.
//     그런데 이미 데이터가 들어 있는 표의 collation 을 바꾸면 색인을 다시 만들어야 합니다.
//     **설계할 때 정하세요.**

// ★ 쿼리 한 번만 다르게 비교하고 싶을 때는 `COLLATE` 를 붙입니다.
const 한번만 = await 마이("SELECT ('ABC' COLLATE utf8mb4_0900_as_cs = 'abc') AS 결과");
console.log("한 번만 구분해서 비교:", 짧게(한번만));
// 출력: 한 번만 구분해서 비교: [{"결과":0}]


// ── 섹션 3: ★★ 뒤 공백 — 여기서 실측이 예상을 뒤집었습니다 ──

// 많은 자료에 "MySQL 은 뒤 공백을 무시한다" 고 적혀 있습니다.
// 재 봤더니 **반만 맞았습니다.** 어느 collation 이냐에 따라 다릅니다.

await 나란히("글자끼리 비교 — 'a ' = 'a'", "SELECT ('a ' = 'a') AS 결과");
// 출력: · 글자끼리 비교 — 'a ' = 'a'
// 출력:     PostgreSQL — [{"결과":false}]
// 출력:     MySQL      — [{"결과":1}]

// 여기까지는 "무시한다" 가 맞아 보입니다. 그런데 **표의 칸**으로 하면 다릅니다.

await 마이("DROP TABLE IF EXISTS 구구_새칸");
await 마이("DROP TABLE IF EXISTS 구구_옛칸");
await 마이("CREATE TABLE 구구_새칸 (값 VARCHAR(20) COLLATE utf8mb4_0900_ai_ci UNIQUE)");
await 마이("CREATE TABLE 구구_옛칸 (값 VARCHAR(20) COLLATE utf8mb4_general_ci UNIQUE)");

await 마이("INSERT INTO 구구_새칸 VALUES ('admin')");
await 마이("INSERT INTO 구구_옛칸 VALUES ('admin')");

const 새칸공백 = await 마이("INSERT INTO 구구_새칸 VALUES ('admin ')");
const 옛칸공백 = await 마이("INSERT INTO 구구_옛칸 VALUES ('admin ')");

console.log("MySQL 8 기본 collation 칸에 'admin ' 추가:", 짧게(새칸공백));
// 출력: MySQL 8 기본 collation 칸에 'admin ' 추가: 성공 1건
console.log("MySQL 5.7 기본 collation 칸에 'admin ' 추가:", 짧게(옛칸공백));
// 출력: MySQL 5.7 기본 collation 칸에 'admin ' 추가: 거절 ER_DUP_ENTRY/1062

// ★★★ 같은 서버, 같은 SQL 인데 **칸의 collation 에 따라 갈립니다.**
//
//   utf8mb4_general_ci   (5.7 시절 기본) → PAD SPACE   → 뒤 공백을 무시합니다
//   utf8mb4_0900_ai_ci   (8.0 이후 기본) → NO PAD      → 뒤 공백을 **구분합니다**
//
//   `PAD_ATTRIBUTE` 라는 성질입니다. 직접 확인해 봅니다.

const 패드 = await 마이(
  "SELECT COLLATION_NAME AS 이름, PAD_ATTRIBUTE AS 공백처리 FROM information_schema.COLLATIONS " +
    "WHERE COLLATION_NAME IN ('utf8mb4_general_ci','utf8mb4_0900_ai_ci') ORDER BY 1",
);

for (const 줄 of 패드.값) {
  console.log(`  ${줄.이름} — ${줄.공백처리}`);
}
// 출력:   utf8mb4_0900_ai_ci — NO PAD
// 출력:   utf8mb4_general_ci — PAD SPACE

// ★ 그럼 아까 `'a ' = 'a'` 가 왜 참이었을까요?
//   **글자 리터럴끼리의 비교는 접속(connection)의 collation 을 씁니다.**
//   드라이버가 접속에 어떤 collation 을 쓰느냐에 따라 달라집니다.

const 접속콜 = await 마이("SELECT @@collation_connection AS c, COLLATION('a') AS l");
console.log("접속 collation:", 접속콜.값[0].c, "· 리터럴 collation:", 접속콜.값[0].l);
// 출력: 접속 collation: utf8mb4_unicode_ci · 리터럴 collation: utf8mb4_unicode_ci

// ★★★ 이 자료의 드라이버(mysql2)는 `utf8mb4_unicode_ci` 로 붙습니다.
//   그런데 표의 기본은 `utf8mb4_0900_ai_ci` 입니다. **둘이 다릅니다.**
//   `utf8mb4_unicode_ci` 는 PAD SPACE 라서 리터럴 비교에서 뒤 공백을 무시한 것입니다.
//
// ★ 여기서 배울 것은 이겁니다.
//   **"MySQL 은 이렇다" 가 아니라 "이 칸의 collation 은 이렇다" 로 생각하세요.**
//   서버·데이터베이스·표·칸·접속마다 collation 이 다를 수 있습니다.

// ★ 그리고 PostgreSQL 에도 뒤 공백 함정이 있습니다. `CHAR(n)` 입니다.

await 피지("DROP TABLE IF EXISTS 공백시험");
await 피지("CREATE TABLE 공백시험 (변하는칸 VARCHAR(20), 고정칸 CHAR(20))");
await 피지("INSERT INTO 공백시험 VALUES ('a ', 'a ')");

const 변하는 = await 피지("SELECT COUNT(*)::int AS c FROM 공백시험 WHERE 변하는칸 = 'a'");
const 고정 = await 피지("SELECT COUNT(*)::int AS c FROM 공백시험 WHERE 고정칸 = 'a'");

console.log("PG VARCHAR 칸에 'a ' 를 넣고 'a' 로 찾기:", 변하는.값[0].c, "건");
// 출력: PG VARCHAR 칸에 'a ' 를 넣고 'a' 로 찾기: 0 건
console.log("PG CHAR(20) 칸에 'a ' 를 넣고 'a' 로 찾기:", 고정.값[0].c, "건");
// 출력: PG CHAR(20) 칸에 'a ' 를 넣고 'a' 로 찾기: 1 건

// ★★ PostgreSQL 도 `CHAR(n)` 은 뒤 공백을 무시합니다. 표준이 그렇게 정해 놨습니다.
//   → **`CHAR(n)` 을 쓰지 마세요.** 거의 항상 `VARCHAR` 나 `TEXT` 가 낫습니다.
//   → 그리고 아이디·코드는 저장하기 전에 `trim()` 하세요. 양쪽 문제가 다 사라집니다.


// ── 섹션 4: ★★ 0 으로 나누기 ──

await 나란히("SELECT 1/0", "SELECT 1/0 AS 결과");
// 출력: · SELECT 1/0
// 출력:     PostgreSQL — 거절 22012
// 출력:     MySQL      — [{"결과":null}]

await 나란히("나머지 연산 MOD(1,0)", "SELECT MOD(1,0) AS 결과");
// 출력: · 나머지 연산 MOD(1,0)
// 출력:     PostgreSQL — 거절 22012
// 출력:     MySQL      — [{"결과":null}]

// ★ MySQL 은 NULL 을 줍니다. 그리고 NULL 은 **전염됩니다.**
//   `SELECT 생산량 / 가동시간 * 100` 에서 가동시간이 0 이면 결과가 NULL 이 되고,
//   그 값을 화면에 그리면 빈 칸이 나옵니다. 에러는 없습니다.
//
// ★★ 그래서 어느 쪽이든 **직접 막는 것**이 정답입니다. 양쪽에서 다 됩니다.

await 나란히(
  "NULLIF 로 0 을 걸러내기",
  "SELECT COALESCE(100 / NULLIF(0,0), 0) AS 가동률",
);
// 출력: · NULLIF 로 0 을 걸러내기
// 출력:     PostgreSQL — [{"가동률":0}]
// 출력:     MySQL      — [{"가동률":"0.0000"}]

// ★ `NULLIF(a, b)` 는 a 와 b 가 같으면 NULL, 아니면 a 를 줍니다.
//   `x / NULLIF(y, 0)` 은 y 가 0 이면 NULL 이 되고, **에러가 안 납니다.**
//   그걸 `COALESCE(..., 0)` 로 받으면 0 이 나옵니다. **양쪽에서 같은 답**입니다.
//
// ★★ 그런데 자바스크립트로 온 모양이 다릅니다. `0` 과 `"0.0000"` 입니다.
//   MySQL 의 `/` 는 결과를 DECIMAL 로 만들고, 드라이버는 DECIMAL 을 **글자로** 줍니다.
//   (PostgreSQL 의 NUMERIC 도 글자로 옵니다. 02단원에서 했습니다)
//   → 계산에 쓰려면 `Number(...)` 로 바꿔야 합니다. 안 그러면 `"0.0000" + 1` 이
//     `"0.00001"` 이 됩니다. **정산 코드에서 사고가 나는 지점입니다.**

const 나눗셈타입 = await 마이("SELECT 100 / 3 AS 몫");
console.log("MySQL 나눗셈 결과의 자바스크립트 타입:", typeof 나눗셈타입.값[0].몫);
// 출력: MySQL 나눗셈 결과의 자바스크립트 타입: string
console.log("정수로 받고 싶으면 CAST:", 짧게(await 마이("SELECT CAST(100/3 AS SIGNED) AS 몫")));
// 출력: 정수로 받고 싶으면 CAST: [{"몫":33}]


// ── 섹션 5: ★★★ 글자를 숫자로 알아서 바꿔 줍니다 ──

// 이게 개인적으로 제일 무섭다고 생각하는 차이입니다.

await 나란히("SELECT 'abc' + 1", "SELECT 'abc' + 1 AS 결과");
// 출력: · SELECT 'abc' + 1
// 출력:     PostgreSQL — 거절 22P02
// 출력:     MySQL      — [{"결과":1}]

await 나란히("SELECT '12개' + 1", "SELECT '12개' + 1 AS 결과");
// 출력: · SELECT '12개' + 1
// 출력:     PostgreSQL — 거절 22P02
// 출력:     MySQL      — [{"결과":13}]

// ★★ MySQL 은 `'abc'` 를 0 으로, `'12개'` 를 12 로 바꿉니다.
//   앞에서 읽을 수 있는 데까지 읽고 나머지를 버립니다.
//
// ★★★ 그리고 비교에서도 그렇게 합니다. 이게 진짜 문제입니다.

await 나란히("'1' = 1 인가", "SELECT ('1' = 1) AS 결과");
// 출력: · '1' = 1 인가
// 출력:     PostgreSQL — [{"결과":true}]
// 출력:     MySQL      — [{"결과":1}]

await 나란히("'1a' = 1 인가", "SELECT ('1a' = 1) AS 결과");
// 출력: · '1a' = 1 인가
// 출력:     PostgreSQL — 거절 22P02
// 출력:     MySQL      — [{"결과":1}]

// ★★★ MySQL 에서 `'1a' = 1` 이 **참**입니다.
//
//   설비번호가 INT 인 표에서 `WHERE 설비번호 = '1a'` 를 보내면
//   PostgreSQL 은 22P02 로 거절합니다.
//   MySQL 은 **1번 설비를 돌려줍니다.**
//
//   ★ 사용자가 화면에 이상한 값을 넣었을 때 양쪽 반응이 완전히 다릅니다.
//     PostgreSQL 은 "잘못된 입력" 이라고 알려 주고,
//     MySQL 은 엉뚱한 줄을 조용히 보여 줍니다.
//
// ★★ 막는 법: **파라미터를 쓰고, 앱에서 타입을 검사하세요.**
//   `WHERE 설비번호 = ?` 에 문자열을 그냥 넣지 말고
//   `Number.isInteger(값)` 을 먼저 확인한 뒤 숫자로 넣으세요.
//   (08단원에서 파라미터 쓰는 법을 했습니다)


// ── 섹션 6: ★ 글자 수를 세면 바이트가 나옵니다 ──

await 나란히("길이 재기 — LENGTH('설비🔧')", "SELECT LENGTH('설비🔧') AS 결과");
// 출력: · 길이 재기 — LENGTH('설비🔧')
// 출력:     PostgreSQL — [{"결과":3}]
// 출력:     MySQL      — [{"결과":10}]

// ★★ 같은 함수 이름인데 답이 다릅니다.
//
//   PostgreSQL 의 `length()` = **글자 수**  (설비🔧 → 3)
//   MySQL 의 `LENGTH()`     = **바이트 수** (설비🔧 → 10)
//
//   한글 한 자는 UTF-8 에서 3바이트, 이 이모지는 4바이트라서 3+3+4 = 10 입니다.
//
// ★ 각자 반대편에 해당하는 함수가 따로 있습니다.

const 길이비교 = await 나란히(
  "글자 수 세기 — 양쪽에서 통하는 이름",
  "SELECT char_length('설비🔧') AS 결과",
);
// 출력: · 글자 수 세기 — 양쪽에서 통하는 이름
// 출력:     PostgreSQL — [{"결과":3}]
// 출력:     MySQL      — [{"결과":3}]

console.log("char_length 는 양쪽이 같은가:", 길이비교.가.값[0].결과 === 길이비교.나.값[0].결과);
// 출력: char_length 는 양쪽이 같은가: true

// ★★ `char_length()` 를 쓰세요. 양쪽에서 글자 수를 줍니다.
//   `LENGTH()` 는 두 DB 에서 뜻이 달라서 옮기면 조용히 틀립니다.
//   "이름이 20자 넘으면 자르기" 같은 코드가 여기서 깨집니다.


// ── 섹션 7: ★ NULL 이 정렬에서 어디로 가나 ──

await 나란히(
  "ORDER BY 에서 NULL 의 자리",
  "SELECT x FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3) AS t ORDER BY x",
);
// 출력: · ORDER BY 에서 NULL 의 자리
// 출력:     PostgreSQL — [{"x":1},{"x":3},{"x":null}]
// 출력:     MySQL      — [{"x":null},{"x":1},{"x":3}]

// ★★ 오름차순인데 NULL 의 자리가 반대입니다.
//
//   PostgreSQL : NULL 을 **제일 큰 값**으로 봅니다 → 맨 뒤
//   MySQL      : NULL 을 **제일 작은 값**으로 봅니다 → 맨 앞
//
// ★ "미점검 설비" 목록의 순서가 통째로 달라집니다. 에러는 안 납니다.

const 널문법 = await 마이("SELECT 1 AS x ORDER BY x NULLS LAST");
console.log("MySQL 에서 NULLS LAST 문법:", 짧게(널문법));
// 출력: MySQL 에서 NULLS LAST 문법: 거절 ER_PARSE_ERROR/1064

// ★ PostgreSQL 에는 `ORDER BY x NULLS LAST` 문법이 있습니다. MySQL 에는 없습니다.
//   MySQL 에서는 이렇게 흉내 냅니다.

await 나란히(
  "양쪽에서 NULL 을 맨 뒤로 보내기",
  "SELECT x FROM (SELECT 1 AS x UNION ALL SELECT NULL UNION ALL SELECT 3) AS t ORDER BY (x IS NULL), x",
);
// 출력: · 양쪽에서 NULL 을 맨 뒤로 보내기
// 출력:     PostgreSQL — [{"x":1},{"x":3},{"x":null}]
// 출력:     MySQL      — [{"x":1},{"x":3},{"x":null}]

// ★ `ORDER BY (x IS NULL), x` 는 양쪽에서 똑같이 동작합니다.
//   `x IS NULL` 이 거짓(0)인 줄이 먼저 오고, 그 안에서 x 로 정렬됩니다.


// ── 섹션 8: ★★ utf8 은 utf8 이 아닙니다 ──

// MySQL 에서 `utf8` 이라고 쓰면 진짜 UTF-8 이 아닙니다.
// **한 글자당 최대 3바이트까지만** 받는 반쪽짜리입니다. 정식 이름은 `utf8mb3` 입니다.
//
// 한글은 3바이트라 들어갑니다. 그런데 이모지는 4바이트라 안 들어갑니다.
// 직접 해 봅니다.

await 마이("DROP TABLE IF EXISTS 구구_옛문자");
await 마이("CREATE TABLE 구구_옛문자 (메모 VARCHAR(50)) CHARACTER SET utf8mb3");

const 한글넣기 = await 마이("INSERT INTO 구구_옛문자 VALUES ('점검 완료')");
console.log("utf8mb3 칸에 한글:", 짧게(한글넣기));
// 출력: utf8mb3 칸에 한글: 성공 1건

const 이모지넣기 = await 마이("INSERT INTO 구구_옛문자 VALUES ('점검 완료 🔧')");
console.log("utf8mb3 칸에 이모지:", 짧게(이모지넣기));
// 출력: utf8mb3 칸에 이모지: 거절 ER_TRUNCATED_WRONG_VALUE_FOR_FIELD/1366

// ★ STRICT 가 켜져 있어서 거절했습니다. 개념02 를 기억하세요.
//   ★★ STRICT 를 끄면 어떻게 될까요. 이게 진짜 옛날에 벌어지던 일입니다.

await 마이("SET SESSION sql_mode = ''");
await 마이("INSERT INTO 구구_옛문자 VALUES ('점검 완료 🔧 이상없음')");

const 망가진메모 = await 마이("SELECT 메모 FROM 구구_옛문자 ORDER BY 메모");
console.log("STRICT 끄고 넣은 뒤 표 내용:", 짧게(망가진메모));
// 출력: STRICT 끄고 넣은 뒤 표 내용: [{"메모":"점검 완료"},{"메모":"점검 완료 ? 이상없음"}]

await 마이("SET SESSION sql_mode = ?", [원래모드]);

// ★★★ 이모지가 **물음표로 바뀌었습니다.** 에러도 없습니다.
//   사용자가 쓴 글이 조용히 훼손됩니다.
//   2010년대에 "이모지 쓰면 글이 깨져요" 라는 문의가 흔했던 이유가 이것입니다.

// ★ utf8mb4 칸에서는 잘 들어갑니다.
await 마이("DROP TABLE IF EXISTS 구구_새문자");
await 마이("CREATE TABLE 구구_새문자 (메모 VARCHAR(50)) CHARACTER SET utf8mb4");
await 마이("INSERT INTO 구구_새문자 VALUES ('점검 완료 🔧 이상없음')");

const 멀쩡한메모 = await 마이("SELECT 메모 FROM 구구_새문자");
console.log("utf8mb4 칸에 넣은 뒤:", 짧게(멀쩡한메모));
// 출력: utf8mb4 칸에 넣은 뒤: [{"메모":"점검 완료 🔧 이상없음"}]

// ★ MySQL 8.0 부터 서버 기본이 `utf8mb4` 라서 새로 만들면 괜찮습니다.
//   문제는 **5.x 시절에 만든 옛 표**입니다. 그때 기본이 `utf8`(=utf8mb3) 이었습니다.
//   회사 표를 만나면 문자셋부터 확인하세요.

const 문자셋확인 = await 마이(
  "SELECT TABLE_NAME AS 표, TABLE_COLLATION AS 규칙 FROM information_schema.TABLES " +
    "WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME IN ('구구_옛문자','구구_새문자') ORDER BY 1",
);

for (const 줄 of 문자셋확인.값) {
  console.log(`  ${줄.표} — ${줄.규칙}`);
}
// 출력:   구구_새문자 — utf8mb4_0900_ai_ci
// 출력:   구구_옛문자 — utf8mb3_general_ci

// ★★ PostgreSQL 에는 이 함정이 없습니다.
//   데이터베이스를 만들 때 인코딩을 UTF8 로 정하면 그냥 진짜 UTF-8 입니다.
//   반쪽짜리 UTF-8 이라는 개념 자체가 없습니다.

const 피지인코딩 = await 피지("SHOW server_encoding");
console.log("PostgreSQL 인코딩:", 피지인코딩.값[0].server_encoding);
// 출력: PostgreSQL 인코딩: UTF8

const 피지이모지 = await 피지("SELECT length('점검 완료 🔧 이상없음') AS 글자수");
console.log("PostgreSQL 에서 이모지가 든 글의 글자 수:", 피지이모지.값[0].글자수);
// 출력: PostgreSQL 에서 이모지가 든 글의 글자 수: 12


// ── 뒷정리 ──

await 피지("DROP TABLE IF EXISTS 작업자");
await 피지("DROP TABLE IF EXISTS 공백시험");
await 마이("DROP TABLE IF EXISTS 구구_작업자");
await 마이("DROP TABLE IF EXISTS 구구_구분작업자");
await 마이("DROP TABLE IF EXISTS 구구_새칸");
await 마이("DROP TABLE IF EXISTS 구구_옛칸");
await 마이("DROP TABLE IF EXISTS 구구_옛문자");
await 마이("DROP TABLE IF EXISTS 구구_새문자");

const 마무리모드 = await 마이("SELECT @@SESSION.sql_mode AS m");
console.log("sql_mode 를 원래대로 돌려놨나:", 마무리모드.값[0].m === 원래모드);
// 출력: sql_mode 를 원래대로 돌려놨나: true


// ============================================================
// 정리 — 에러 없이 달라지는 것들
// ============================================================
//
//   시험                    PostgreSQL      MySQL 8.4        맞추는 법
//   ─────────────────────────────────────────────────────────────────────────
//   'A' || 'B'              'AB'            0 (OR)           concat() 을 쓴다
//   concat('A',NULL,'B')    'AB'            NULL             COALESCE 로 감싼다
//   'ABC' = 'abc'           false           true             lower() 유일 색인 / as_cs
//   'e' = 'é'               false           true             as_cs collation
//   'a ' = 'a' (리터럴)     false           true             저장 전에 trim()
//   'a ' = 'a' (8.0 칸)     false           false            (이미 같습니다)
//   'a ' = 'a' (5.7 칸)     false           true             collation 을 확인한다
//   1/0                     거절 22012      NULL             NULLIF(y,0) 로 막는다
//   'abc' + 1               거절 22P02      1                앱에서 타입을 검사한다
//   '1a' = 1                거절 22P02      true             파라미터 + 타입 검사
//   LENGTH('설비🔧')        3 (글자)        10 (바이트)      char_length() 를 쓴다
//   ORDER BY 의 NULL        맨 뒤           맨 앞            ORDER BY (x IS NULL), x
//   utf8 칸에 이모지        (해당 없음)     안 들어감        utf8mb4 를 쓴다
//
// ★★★ 오른쪽 칸이 이 파일의 값어치입니다. **전부 양쪽에서 통하는 방법이 있습니다.**
//   두 DB 를 다 지원해야 한다면 오른쪽 칸대로 쓰세요.
//
// ★ 그리고 하나 더 기억하세요.
//   **어느 쪽이 옳은 게 아닙니다.** 규칙이 다를 뿐입니다.
//   대소문자 무시가 아이디에는 좋고 상품 코드에는 나쁩니다.
//   중요한 건 **내 칸이 어떤 규칙인지 아는 것**입니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 에서 `'설비' || 3` 을 양쪽에 보내 보세요.
//                    MySQL 은 무엇을 주나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 2 — 섹션 2 의 중복확인 시나리오를 **비밀번호**로 바꿔 보세요.
//                    'Secret1!' 로 가입하고 'secret1!' 로 로그인하면
//                    MySQL 에서 들어가지나요? ★ 이건 진짜 사고입니다.
//                    (실제 서비스에서는 비밀번호를 그대로 저장하지 않습니다.
//                     해시를 저장합니다. 그런데 해시 문자열 비교에서 같은 문제가 납니다)
//
// ✏️ 직접 해보기 3 — 섹션 3 에서 `utf8mb4_bin` collation 으로 칸을 만들어 보세요.
//                    'admin' 과 'admin ' 이 같은 값으로 보이나요?
//                    `information_schema.COLLATIONS` 로 PAD_ATTRIBUTE 를 확인해 보세요.
//
// ✏️ 직접 해보기 4 — 섹션 5 를 표로 해 보세요.
//                    설비 표를 만들고 `WHERE id = '1등급'` 을 양쪽에 보내면?
//                    MySQL 이 몇 번 설비를 줄까요?
//
// ✏️ 직접 해보기 5 — 한글 정렬은 어떨까요?
//                    '하','가','나' 를 넣고 `ORDER BY` 해 보세요.
//                    ★ 재 보면 양쪽이 같습니다. 안 다른 것도 확인해 두면 좋습니다.
//
// ✏️ 직접 해보기 6 — 섹션 8 에서 `VARCHAR(50)` 인 utf8mb3 칸에
//                    한글 50자를 넣어 보세요. 들어가나요?
//                    ★ MySQL 의 VARCHAR(n) 은 **글자 수**입니다. 바이트가 아닙니다.
//                    (옛날 latin1 시절 이야기와 헷갈리는 사람이 많습니다)
//
// ✏️ 직접 해보기 7 — `SELECT 'a' = 'A' COLLATE utf8mb4_bin` 을 실행해 보세요.
//                    `_bin` 은 무엇을 하는 collation 인가요?


// ── 자주 하는 실수 ──

// [실수 1] `||` 를 그대로 옮긴다
//   ★★★ 에러가 안 나서 못 찾습니다. 이름 붙이는 코드가 전부 `0` 이 됩니다.
//   옮기기 전에 `||` 를 전부 찾아서 `concat()` 으로 바꾸세요. 개념05 에서 찾는 도구를 만듭니다.

// [실수 2] "MySQL 은 대소문자를 무시하니까 편하다" 고 기대고 코드를 짠다
//   그 코드를 PostgreSQL 로 옮기면 **중복 계정이 생깁니다.**
//   ★ 앱에서 `아이디.toLowerCase()` 를 하고 저장하세요. 그러면 어느 DB 든 같습니다.

// [실수 3] 뒤 공백을 "MySQL 은 무시한다" 고 외운다
//   ★★ 반만 맞습니다. 8.0 기본 collation 은 **구분합니다.**
//   외우지 말고 `information_schema.COLLATIONS` 에서 확인하세요.
//   그리고 저장 전에 `trim()` 하면 이 고민 자체가 사라집니다.

// [실수 4] `LENGTH()` 로 글자 수를 센다
//   MySQL 에서는 바이트가 나옵니다. 한글은 3배가 됩니다.
//   "20자 넘으면 자르기" 코드가 7자에서 잘립니다. `char_length()` 를 쓰세요.

// [실수 5] 0 나누기를 DB 에 맡긴다
//   PostgreSQL 은 멈추고 MySQL 은 NULL 을 줍니다.
//   ★ 어느 쪽도 원하는 동작이 아닙니다. `NULLIF(y,0)` 로 직접 막으세요.

// [실수 6] 숫자 칸에 문자열 파라미터를 넣는다
//   MySQL 은 `'1a'` 를 1 로 바꿔서 엉뚱한 줄을 줍니다.
//   ★ 앱에서 타입을 검사하세요. DB 가 막아 줄 거라고 믿으면 안 됩니다.

// [실수 7] MySQL 에서 `utf8` 이라고 적는다
//   그건 `utf8mb3` 입니다. 이모지가 안 들어갑니다.
//   ★ 항상 `utf8mb4` 라고 적으세요. 세 글자 더 쓰면 됩니다.

// [실수 8] 옮기고 나서 "에러 없으니 성공" 이라고 판단한다
//   ★★★ 이 파일의 모든 차이는 **에러가 안 납니다.**
//   옮긴 뒤에는 결과 값을 직접 비교해 보세요. 같은 쿼리를 양쪽에 보내고 답을 맞춰 보는 겁니다.


await PG.end();
await MY.end();
