// ============================================================
// 09단원 · 개념 05 — 옮길 때 확인할 것
// ------------------------------------------------------------
// 실행: node 개념05_옮길_때_확인할_것.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 잠금이 풀리기를 기다리는 실험이 있어서 5초쯤 걸립니다.
// ============================================================
//
// 개념02~04 에서 차이를 다 봤습니다. 이제 **실제로 옮길 때** 할 일입니다.
//
//   ① 옮길 SQL 을 자동으로 훑어서 문제될 곳을 찾는 도구를 만듭니다
//   ② 격리수준 기본값이 다른 것을 확인합니다 (07단원과 이어집니다)
//   ③ MySQL 의 갭 락을 실제로 재현합니다 — 잠금 범위가 다릅니다
//   ④ 성능 비교를 왜 하면 안 되는지 이야기합니다
//   ⑤ 어느 쪽을 고를지 정직하게 정리합니다
//   ⑥ MariaDB 는 무엇인지 한 문단

import pg from "pg";
import mysql from "mysql2/promise";


// ── 섹션 0: 붙기 · 도우미 ──

// ★ 이 파일은 잠금 실험을 하느라 **양쪽 다 두 개씩** 붙습니다.
const 피지설정 = { host: "127.0.0.1", port: 5434, user: "factory", password: "secret", database: "factory_db" };
const 마이설정 = { host: "127.0.0.1", port: 3307, user: "factory", password: "secret", database: "factory_db" };

let PG김 = null;
let PG이 = null;
let MY김 = null;
let MY이 = null;

try {
  PG김 = new pg.Client(피지설정);
  await PG김.connect();
  PG이 = new pg.Client(피지설정);
  await PG이.connect();
  MY김 = await mysql.createConnection(마이설정);
  MY이 = await mysql.createConnection(마이설정);
} catch (에러) {
  // 검증무시: Docker 가 없으면 여기로 옵니다.
  console.log("★ 데이터베이스에 못 붙었습니다:", 에러.code || 에러.message);
  console.log("  docker compose up -d 를 먼저 실행하세요.");
  for (const 연결 of [PG김, PG이]) if (연결) await 연결.end().catch(() => {});
  for (const 연결 of [MY김, MY이]) if (연결) await 연결.end().catch(() => {});
  process.exit(0);
}

await PG김.query("CREATE SCHEMA IF NOT EXISTS 단원09");
await PG김.query("SET search_path TO 단원09");
await PG이.query("SET search_path TO 단원09");

async function 피지(연결, sql, 값 = []) {
  try {
    const 결과 = await 연결.query(sql, 값);
    const 조회인가 = 결과.command === "SELECT" || 결과.command === "SHOW";

    return { 됨: true, 값: 결과.rows, 조회: 조회인가, 건수: 결과.rowCount ?? 0 };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code };
  }
}

async function 마이(연결, sql, 값 = []) {
  try {
    const [행들] = await 연결.query(sql, 값);
    const 조회인가 = Array.isArray(행들);

    return {
      됨: true,
      값: 조회인가 ? 행들 : [],
      조회: 조회인가,
      건수: 조회인가 ? 행들.length : 행들.affectedRows,
    };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code, 번호: 에러.errno };
  }
}

function 짧게(결과) {
  if (!결과.됨) return `거절 ${결과.코드}${결과.번호 === undefined ? "" : "/" + 결과.번호}`;
  if (결과.조회 || 결과.값.length > 0) return JSON.stringify(결과.값);
  return `성공 ${결과.건수}건`;
}


// ── 섹션 1: ★ 옮길 SQL 을 훑는 점검 도구 ──

// 쿼리가 수백 개인 프로젝트를 눈으로 훑을 수는 없습니다.
// **찾아 주는 코드**를 만듭니다. 완벽하지 않아도 90% 는 잡아 줍니다.

const 옮길때규칙 = [
  {
    이름: "|| 로 글자 잇기",
    정규식: /\|\|/,
    심각도: "★★★",
    문제: "MySQL 에서는 OR 로 해석되어 숫자가 나옵니다. 에러가 안 납니다",
    해결: "concat() 으로 바꾸세요",
  },
  {
    이름: "RETURNING",
    정규식: /\bRETURNING\b/i,
    심각도: "★★",
    문제: "MySQL 에 없는 문법입니다 (1064 문법 오류)",
    해결: "insertId 를 받거나, 넣은 뒤 다시 SELECT 하세요",
  },
  {
    이름: "$1 파라미터",
    정규식: /\$\d+/,
    심각도: "★★",
    문제: "MySQL 은 ? 만 씁니다",
    해결: "? 로 바꾸고, 같은 번호를 두 번 쓴 곳은 값도 두 번 넘기세요",
  },
  {
    이름: "SERIAL 자동번호",
    정규식: /\b(BIG|SMALL)?SERIAL\b/i,
    심각도: "★",
    문제: "MySQL 에는 SERIAL 이 다른 뜻입니다 (BIGINT UNSIGNED AUTO_INCREMENT UNIQUE)",
    해결: "INT AUTO_INCREMENT PRIMARY KEY 로 바꾸세요",
  },
  {
    이름: "GENERATED ... AS IDENTITY",
    정규식: /GENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/i,
    심각도: "★",
    문제: "MySQL 에 없는 문법입니다",
    해결: "AUTO_INCREMENT 로 바꾸세요",
  },
  {
    이름: "부분 색인 (CREATE INDEX ... WHERE)",
    정규식: /CREATE\s+(UNIQUE\s+)?INDEX[^;]*\bWHERE\b/i,
    심각도: "★★",
    문제: "MySQL 에 부분 색인이 없습니다",
    해결: "조건을 뺀 전체 색인으로 만들거나, 생성 칸을 만들어 색인하세요",
  },
  {
    이름: "배열 타입",
    정규식: /\bARRAY\s*\[|\w+\s*\[\s*\]/,
    심각도: "★★",
    문제: "MySQL 에 배열 타입이 없습니다",
    해결: "표를 따로 만들거나 JSON 배열로 바꾸세요",
  },
  {
    이름: "JSONB",
    정규식: /\bJSONB\b/i,
    심각도: "★",
    문제: "MySQL 은 JSON 하나뿐입니다. 색인 방법이 다릅니다",
    해결: "JSON 으로 바꾸고, 자주 찾는 키는 생성 칸 + 색인으로 빼세요",
  },
  {
    이름: "@> 포함 연산자",
    정규식: /@>/,
    심각도: "★★",
    문제: "MySQL 에 없는 연산자입니다 (1064)",
    해결: "JSON_CONTAINS() 로 바꾸세요",
  },
  {
    이름: "= true / = false 비교",
    정규식: /=\s*(TRUE|FALSE)\b/i,
    심각도: "★★",
    문제: "MySQL 의 BOOLEAN 은 TINYINT(1) 이라 1·0 이 아닌 값을 놓칩니다",
    해결: "WHERE 칸 또는 WHERE 칸 <> 0 으로 바꾸세요",
  },
  {
    이름: "ILIKE",
    정규식: /\bILIKE\b/i,
    심각도: "★",
    문제: "MySQL 에 없는 문법입니다",
    해결: "그냥 LIKE 를 쓰세요. MySQL 기본 collation 은 이미 대소문자를 무시합니다",
  },
  {
    이름: "NULLS FIRST / NULLS LAST",
    정규식: /\bNULLS\s+(FIRST|LAST)\b/i,
    심각도: "★★",
    문제: "MySQL 에 없는 문법이고, NULL 의 기본 자리도 반대입니다",
    해결: "ORDER BY (칸 IS NULL), 칸 으로 바꾸세요",
  },
  {
    이름: ":: 타입 바꾸기",
    정규식: /::/,
    심각도: "★",
    문제: "MySQL 에 없는 문법입니다",
    해결: "CAST(값 AS 타입) 으로 바꾸세요. 양쪽에서 다 됩니다",
  },
  {
    이름: "ON CONFLICT",
    정규식: /\bON\s+CONFLICT\b/i,
    심각도: "★",
    문제: "MySQL 은 ON DUPLICATE KEY UPDATE 입니다",
    해결: "ON DUPLICATE KEY UPDATE 로 바꾸세요. 어느 칸이 충돌인지는 못 고릅니다",
  },
  {
    이름: "length() 로 길이 재기",
    정규식: /\blength\s*\(/i,
    심각도: "★★",
    문제: "MySQL 의 LENGTH() 는 바이트를 셉니다. 한글은 3배가 됩니다",
    해결: "char_length() 로 바꾸세요",
  },
  {
    이름: "트랜잭션 안의 DDL",
    정규식: /\bBEGIN\b[\s\S]*\b(CREATE|ALTER|DROP|TRUNCATE)\s+TABLE\b/i,
    심각도: "★★★",
    문제: "MySQL 은 DDL 에서 암묵적 커밋이 일어나 롤백이 안 됩니다",
    해결: "변경을 파일 하나에 하나씩 나누고, 되돌리는 스크립트를 미리 만드세요",
  },
];

function 옮기기점검(SQL모음) {
  return 옮길때규칙.filter((규칙) => 규칙.정규식.test(SQL모음));
}

// 실제 프로젝트에서 흔히 보는 SQL 을 넣어 봅니다.
const 옮길SQL = `
  CREATE TABLE 설비 (
    id       SERIAL PRIMARY KEY,
    이름     VARCHAR(50) NOT NULL,
    라인     VARCHAR(10),
    태그     TEXT[],
    점검정보 JSONB,
    가동     BOOLEAN DEFAULT true
  );

  CREATE INDEX 설비_미점검 ON 설비 (id) WHERE 점검정보 IS NULL;

  INSERT INTO 설비 (이름, 라인) VALUES ($1, $2) RETURNING id;

  SELECT 이름 || ' (' || 라인 || ')' AS 표시이름
    FROM 설비
   WHERE 가동 = true
     AND length(이름) <= 20;

  SELECT * FROM 설비 WHERE 이름 ILIKE $1 ORDER BY 라인 NULLS LAST;

  UPDATE 설비 SET 점검정보 = $1::jsonb WHERE id = $2;

  SELECT * FROM 설비 WHERE 점검정보 @> '{"상태":"불량"}';

  INSERT INTO 재고 (부품, 수량) VALUES ($1, $2)
    ON CONFLICT (부품) DO UPDATE SET 수량 = 재고.수량 + EXCLUDED.수량;
`;

const 걸린것 = 옮기기점검(옮길SQL);

console.log(`[점검 결과] 규칙 ${옮길때규칙.length} 개 중 ${걸린것.length} 개가 걸렸습니다`);
// 출력: [점검 결과] 규칙 16 개 중 14 개가 걸렸습니다

for (const 규칙 of 걸린것) {
  console.log(`  ${규칙.심각도} ${규칙.이름}`);
  console.log(`      문제 — ${규칙.문제}`);
  console.log(`      해결 — ${규칙.해결}`);
}
// 출력:   ★★★ || 로 글자 잇기
// 출력:       문제 — MySQL 에서는 OR 로 해석되어 숫자가 나옵니다. 에러가 안 납니다
// 출력:       해결 — concat() 으로 바꾸세요
// 출력:   ★★ RETURNING
// 출력:       문제 — MySQL 에 없는 문법입니다 (1064 문법 오류)
// 출력:       해결 — insertId 를 받거나, 넣은 뒤 다시 SELECT 하세요
// 출력:   ★★ $1 파라미터
// 출력:       문제 — MySQL 은 ? 만 씁니다
// 출력:       해결 — ? 로 바꾸고, 같은 번호를 두 번 쓴 곳은 값도 두 번 넘기세요
// 출력:   ★ SERIAL 자동번호
// 출력:       문제 — MySQL 에는 SERIAL 이 다른 뜻입니다 (BIGINT UNSIGNED AUTO_INCREMENT UNIQUE)
// 출력:       해결 — INT AUTO_INCREMENT PRIMARY KEY 로 바꾸세요
// 출력:   ★★ 부분 색인 (CREATE INDEX ... WHERE)
// 출력:       문제 — MySQL 에 부분 색인이 없습니다
// 출력:       해결 — 조건을 뺀 전체 색인으로 만들거나, 생성 칸을 만들어 색인하세요
// 출력:   ★★ 배열 타입
// 출력:       문제 — MySQL 에 배열 타입이 없습니다
// 출력:       해결 — 표를 따로 만들거나 JSON 배열로 바꾸세요
// 출력:   ★ JSONB
// 출력:       문제 — MySQL 은 JSON 하나뿐입니다. 색인 방법이 다릅니다
// 출력:       해결 — JSON 으로 바꾸고, 자주 찾는 키는 생성 칸 + 색인으로 빼세요
// 출력:   ★★ @> 포함 연산자
// 출력:       문제 — MySQL 에 없는 연산자입니다 (1064)
// 출력:       해결 — JSON_CONTAINS() 로 바꾸세요
// 출력:   ★★ = true / = false 비교
// 출력:       문제 — MySQL 의 BOOLEAN 은 TINYINT(1) 이라 1·0 이 아닌 값을 놓칩니다
// 출력:       해결 — WHERE 칸 또는 WHERE 칸 <> 0 으로 바꾸세요
// 출력:   ★ ILIKE
// 출력:       문제 — MySQL 에 없는 문법입니다
// 출력:       해결 — 그냥 LIKE 를 쓰세요. MySQL 기본 collation 은 이미 대소문자를 무시합니다
// 출력:   ★★ NULLS FIRST / NULLS LAST
// 출력:       문제 — MySQL 에 없는 문법이고, NULL 의 기본 자리도 반대입니다
// 출력:       해결 — ORDER BY (칸 IS NULL), 칸 으로 바꾸세요
// 출력:   ★ :: 타입 바꾸기
// 출력:       문제 — MySQL 에 없는 문법입니다
// 출력:       해결 — CAST(값 AS 타입) 으로 바꾸세요. 양쪽에서 다 됩니다
// 출력:   ★ ON CONFLICT
// 출력:       문제 — MySQL 은 ON DUPLICATE KEY UPDATE 입니다
// 출력:       해결 — ON DUPLICATE KEY UPDATE 로 바꾸세요. 어느 칸이 충돌인지는 못 고릅니다
// 출력:   ★★ length() 로 길이 재기
// 출력:       문제 — MySQL 의 LENGTH() 는 바이트를 셉니다. 한글은 3배가 됩니다
// 출력:       해결 — char_length() 로 바꾸세요

// ★ 이 도구가 진짜 쓸모 있는 곳은 **개수**입니다.
//   "고칠 곳이 13개 있다" 가 아니라 "★★★ 짜리가 하나 있다" 를 먼저 봅니다.

const 심각한것 = 걸린것.filter((규칙) => 규칙.심각도 === "★★★");
console.log("에러 없이 조용히 틀리는 것(★★★) 개수:", 심각한것.length);
// 출력: 에러 없이 조용히 틀리는 것(★★★) 개수: 1
console.log("그것이 무엇인가:", 심각한것.map((규칙) => 규칙.이름).join(", "));
// 출력: 그것이 무엇인가: || 로 글자 잇기

// ★★★ 나머지는 옮기면 **문법 오류로 터져서** 어차피 눈에 띕니다.
//   `||` 하나만 조용히 틀립니다. 그래서 가장 먼저 고쳐야 합니다.

// ★ 이 도구의 한계도 정직하게 적어 둡니다.
//
//   · 정규식이라 **글자 안에 든 것도 잡습니다.** `'a || b'` 같은 문자열도 걸립니다
//   · 반대로 여러 줄에 나뉜 문법은 놓칠 수 있습니다
//   · 진짜 파서가 아니라서 **거짓 경고가 납니다**
//
//   그래도 씁니다. 수백 개 쿼리에서 **볼 곳을 좁혀 주는 것**만으로 충분합니다.
//   ★ 경고가 하나도 없다고 안전한 게 아닙니다. 개념03 의 조용한 차이는 이걸로 못 잡습니다.

// 거짓 경고가 어떻게 나는지 직접 봅니다.
const 거짓경고SQL = "SELECT '규칙: a || b 는 OR 입니다' AS 안내문";
const 거짓걸림 = 옮기기점검(거짓경고SQL);

console.log("글자 안에 든 || 도 걸리나:", 거짓걸림.map((규칙) => 규칙.이름).join(", "));
// 출력: 글자 안에 든 || 도 걸리나: || 로 글자 잇기

// ★ 이 SQL 은 MySQL 에서도 잘 돕니다. 그런데 경고가 났습니다.
//   → 사람이 한 번 보고 판단해야 합니다. 도구는 **후보를 좁혀 줄 뿐**입니다.

// 반대로 못 잡는 것도 봅니다.
const 못잡는SQL = "SELECT 아이디 FROM 작업자 WHERE 아이디 = '설비관리자'";
console.log("대소문자 차이를 잡아내나:", 옮기기점검(못잡는SQL).length, "개 걸림");
// 출력: 대소문자 차이를 잡아내나: 0 개 걸림

// ★★★ 이 쿼리는 **양쪽에서 답이 다를 수 있습니다.** (개념03 섹션 2)
//   그런데 도구는 아무 말도 안 합니다. 문법에는 아무 문제가 없으니까요.


// ── 섹션 2: 격리수준 기본값이 다릅니다 ──

const 피지격리 = await 피지(PG김, "SHOW transaction_isolation");
const 마이격리 = await 마이(MY김, "SELECT @@SESSION.transaction_isolation AS 격리수준");

console.log("PostgreSQL 기본 격리수준:", 피지격리.값[0].transaction_isolation);
// 출력: PostgreSQL 기본 격리수준: read committed
console.log("MySQL 기본 격리수준:", 마이격리.값[0].격리수준);
// 출력: MySQL 기본 격리수준: REPEATABLE-READ

// ★★ 07단원에서 격리수준을 했습니다. 거기서 확인한 것을 다시 씁니다.
//
//   READ COMMITTED  — 매 SELECT 마다 그 순간의 최신 커밋을 봅니다
//   REPEATABLE READ — 트랜잭션이 시작한 순간의 사진을 계속 봅니다
//
// ★ 그래서 옮기면 무슨 일이 나나
//
//   PostgreSQL → MySQL
//     긴 트랜잭션 안에서 같은 SELECT 를 두 번 하면 **답이 안 바뀌게 됩니다.**
//     "왜 방금 다른 사람이 넣은 게 안 보이죠?" 라는 문의가 옵니다.
//
//   MySQL → PostgreSQL
//     같은 SELECT 가 **다른 답을 주기 시작합니다.**
//     한 트랜잭션 안에서 두 번 세어서 비교하던 코드가 어긋납니다.
//
// ★★ 맞추는 법은 간단합니다. **접속할 때 격리수준을 명시하세요.**
//   기본값에 기대지 마세요. 어차피 서버마다 다를 수 있습니다.

await 피지(PG김, "BEGIN ISOLATION LEVEL REPEATABLE READ");
const 바꾼피지 = await 피지(PG김, "SHOW transaction_isolation");
console.log("PostgreSQL 에서 명시하면:", 바꾼피지.값[0].transaction_isolation);
// 출력: PostgreSQL 에서 명시하면: repeatable read
await 피지(PG김, "ROLLBACK");

await 마이(MY김, "SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
const 바꾼마이 = await 마이(MY김, "SELECT @@SESSION.transaction_isolation AS 격리수준");
console.log("MySQL 에서 명시하면:", 바꾼마이.값[0].격리수준);
// 출력: MySQL 에서 명시하면: READ-COMMITTED
await 마이(MY김, "SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ");


// ── 섹션 3: ★★ 같은 이름, 다른 방법 — 갭 락 ──

// 07단원에서 이런 것을 봤습니다.
//   **PostgreSQL 의 REPEATABLE READ 는 팬텀 읽기까지 막습니다.**
// MySQL 의 REPEATABLE READ 도 막습니다. 그런데 **막는 방법이 다릅니다.**
//
//   PostgreSQL — 스냅샷(MVCC). 시작 순간의 사진을 봅니다. **아무것도 안 잠급니다**
//   MySQL      — 넥스트키 락(next-key lock). **줄과 줄 사이의 빈틈까지 잠급니다**
//
// 평범한 SELECT 만 하면 결과가 같아 보입니다. 먼저 그걸 확인합니다.

await 피지(PG김, "DROP TABLE IF EXISTS 생산실적");
await 마이(MY김, "DROP TABLE IF EXISTS 구구_생산실적");
await 피지(PG김, "CREATE TABLE 생산실적 (번호 INT PRIMARY KEY, 수량 INT)");
await 마이(MY김, "CREATE TABLE 구구_생산실적 (번호 INT PRIMARY KEY, 수량 INT)");
await 피지(PG김, "INSERT INTO 생산실적 VALUES (10, 100), (20, 200)");
await 마이(MY김, "INSERT INTO 구구_생산실적 VALUES (10, 100), (20, 200)");

// 김반장이 트랜잭션을 열고 두 번 셉니다. 그 사이에 이반장이 한 건 넣습니다.
await 피지(PG김, "BEGIN ISOLATION LEVEL REPEATABLE READ");
const 피지첫번째 = await 피지(PG김, "SELECT COUNT(*)::int AS 개수 FROM 생산실적");
await 피지(PG이, "INSERT INTO 생산실적 VALUES (30, 300)");
const 피지두번째 = await 피지(PG김, "SELECT COUNT(*)::int AS 개수 FROM 생산실적");
await 피지(PG김, "COMMIT");

await 마이(MY김, "BEGIN");
const 마이첫번째 = await 마이(MY김, "SELECT COUNT(*) AS 개수 FROM 구구_생산실적");
await 마이(MY이, "INSERT INTO 구구_생산실적 VALUES (30, 300)");
const 마이두번째 = await 마이(MY김, "SELECT COUNT(*) AS 개수 FROM 구구_생산실적");
await 마이(MY김, "COMMIT");

console.log("PostgreSQL — 처음", 피지첫번째.값[0].개수, "건 · 나중", 피지두번째.값[0].개수, "건");
// 출력: PostgreSQL — 처음 2 건 · 나중 2 건
console.log("MySQL      — 처음", 마이첫번째.값[0].개수, "건 · 나중", 마이두번째.값[0].개수, "건");
// 출력: MySQL      — 처음 2 건 · 나중 2 건

// ★ 여기까지는 **결과가 같습니다.** 둘 다 팬텀을 막았습니다.
//   그런데 이반장의 INSERT 는 **양쪽 다 바로 성공했습니다.** 안 막혔습니다.
//   평범한 SELECT 는 아무것도 잠그지 않기 때문입니다.
//
// ★★★ `SELECT ... FOR UPDATE` 로 바꾸면 완전히 달라집니다.

// 기다리는 시간을 짧게 잡습니다. 안 그러면 MySQL 은 50초를 기다립니다.
await 피지(PG이, "SET lock_timeout = '1s'");
await 마이(MY이, "SET SESSION innodb_lock_wait_timeout = 1");

await 피지(PG김, "DELETE FROM 생산실적 WHERE 번호 = 30");
await 마이(MY김, "DELETE FROM 구구_생산실적 WHERE 번호 = 30");

// ── PostgreSQL: 10~20 번을 FOR UPDATE 로 잠그고, 그 사이(15번)에 넣어 봅니다
await 피지(PG김, "BEGIN");
await 피지(PG김, "SELECT * FROM 생산실적 WHERE 번호 BETWEEN 10 AND 20 FOR UPDATE");

const 피지시작 = process.hrtime.bigint();
const 피지사이 = await 피지(PG이, "INSERT INTO 생산실적 VALUES (15, 150)");
const 피지걸린 = Number(process.hrtime.bigint() - 피지시작) / 1e6;

console.log("PostgreSQL — 잠긴 범위 사이(15번)에 INSERT:", 짧게(피지사이));
// 출력: PostgreSQL — 잠긴 범위 사이(15번)에 INSERT: 성공 1건
console.log(`PostgreSQL — 걸린 시간 ${피지걸린.toFixed(0)} ms`);
// 출력?: PostgreSQL — 걸린 시간 1 ms

await 피지(PG김, "ROLLBACK");
await 피지(PG김, "DELETE FROM 생산실적 WHERE 번호 = 15");

// ── MySQL: 똑같이 해 봅니다
await 마이(MY김, "BEGIN");
await 마이(MY김, "SELECT * FROM 구구_생산실적 WHERE 번호 BETWEEN 10 AND 20 FOR UPDATE");

const 마이시작 = process.hrtime.bigint();
const 마이사이 = await 마이(MY이, "INSERT INTO 구구_생산실적 VALUES (15, 150)");
const 마이걸린 = Number(process.hrtime.bigint() - 마이시작) / 1e6;

console.log("MySQL      — 잠긴 범위 사이(15번)에 INSERT:", 짧게(마이사이));
// 출력: MySQL      — 잠긴 범위 사이(15번)에 INSERT: 거절 ER_LOCK_WAIT_TIMEOUT/1205
console.log(`MySQL      — 걸린 시간 ${마이걸린.toFixed(0)} ms`);
// 출력?: MySQL      — 걸린 시간 1004 ms

console.log("PostgreSQL 은 안 막히고 MySQL 은 막혔나:", 피지사이.됨 === true && 마이사이.됨 === false);
// 출력: PostgreSQL 은 안 막히고 MySQL 은 막혔나: true

// ★★★ 같은 SQL, 같은 격리수준인데 **한쪽만 막혔습니다.**
//
//   MySQL 은 10 과 20 사이의 **빈 자리(갭)** 까지 잠급니다.
//   거기에 새 줄이 들어오면 아까 읽은 범위가 달라지기 때문입니다.
//   PostgreSQL 은 잠글 필요가 없습니다. 어차피 사진을 보고 있으니까요.
//
// ★★ 더 놀라운 것: **범위 밖도 막힙니다.**

await 마이(MY김, "ROLLBACK");
await 마이(MY김, "DELETE FROM 구구_생산실적 WHERE 번호 = 15");

await 마이(MY김, "BEGIN");
await 마이(MY김, "SELECT * FROM 구구_생산실적 WHERE 번호 BETWEEN 10 AND 20 FOR UPDATE");

const 마이바깥 = await 마이(MY이, "INSERT INTO 구구_생산실적 VALUES (100, 999)");
console.log("MySQL      — 범위 한참 밖(100번)에 INSERT:", 짧게(마이바깥));
// 출력: MySQL      — 범위 한참 밖(100번)에 INSERT: 거절 ER_LOCK_WAIT_TIMEOUT/1205

await 마이(MY김, "ROLLBACK");

// ★★★ 100번은 20번보다 훨씬 큰데도 막혔습니다.
//   범위를 훑다가 20번 다음에 아무것도 없는 것을 확인하면서
//   **"20번 뒤의 모든 자리"** 를 잠갔기 때문입니다.
//
//   → MySQL 의 REPEATABLE READ 에서 `FOR UPDATE` 나 `UPDATE ... WHERE 범위` 는
//     생각보다 **훨씬 넓게 잠급니다.** 동시 처리량이 여기서 떨어집니다.
//
// ★ 어떻게 줄이나
//   ① 잠그는 범위를 **정확한 값 하나**로 좁힙니다 (`WHERE 번호 = 15`)
//   ② 색인이 없으면 MySQL 은 **표 전체를 잠급니다.** 색인을 꼭 만드세요
//   ③ 정말 필요하면 격리수준을 `READ COMMITTED` 로 낮춥니다. 갭 락이 거의 사라집니다
//   ④ 트랜잭션을 짧게 잡습니다. 이건 어느 DB 에서나 맞는 말입니다
//
// ★★ 반대 방향도 조심하세요.
//   MySQL 에서 "갭 락이 막아 주겠지" 하고 짠 코드를 PostgreSQL 로 옮기면
//   **아무도 안 막아 줍니다.** 중복이 들어갑니다.
//   → 중복을 막는 것은 잠금이 아니라 **UNIQUE 제약**입니다. 어느 DB 든 그게 정답입니다.


// ── 섹션 4: ★ 성능 비교는 하지 않습니다 ──

// "그래서 어느 쪽이 빠른가요?" 를 꼭 묻습니다.
// 이 자료는 그 숫자를 싣지 않습니다. **공정하게 잴 수가 없기 때문입니다.**
//
// 왜 어려운지 실제 설정 값으로 보여 드립니다.

const 마이설정값 = await 마이(
  MY김,
  "SELECT @@innodb_buffer_pool_size AS 버퍼, @@innodb_flush_log_at_trx_commit AS 로그동기화, @@max_connections AS 최대접속",
);
const 피지설정값 = await 피지(
  PG김,
  "SELECT current_setting('shared_buffers') AS 버퍼, current_setting('synchronous_commit') AS 로그동기화, current_setting('max_connections') AS 최대접속",
);

console.log("MySQL      — 버퍼", 마이설정값.값[0].버퍼, "· 로그동기화", 마이설정값.값[0].로그동기화, "· 최대접속", 마이설정값.값[0].최대접속);
// 출력: MySQL      — 버퍼 134217728 · 로그동기화 1 · 최대접속 151
console.log("PostgreSQL — 버퍼", 피지설정값.값[0].버퍼, "· 로그동기화", 피지설정값.값[0].로그동기화, "· 최대접속", 피지설정값.값[0].최대접속);
// 출력: PostgreSQL — 버퍼 128MB · 로그동기화 on · 최대접속 100

// ★ 숫자가 비슷해 보입니다. 그런데 **뜻이 다릅니다.**
//
//   MySQL 의 버퍼(innodb_buffer_pool_size) — 데이터를 담는 **거의 유일한 캐시**입니다.
//     그래서 실무에서는 메모리의 60~70% 를 줍니다.
//   PostgreSQL 의 버퍼(shared_buffers) — **운영체제 캐시와 나눠 씁니다.**
//     그래서 25% 정도만 주는 것이 보통입니다.
//
//   이 상태로 같은 쿼리를 재면 **설정 차이를 재는 것**이지 DB 를 재는 게 아닙니다.
//
// ★★ 공정한 비교가 어려운 이유를 정리하면
//
//   ① 설정 — 위에서 봤습니다. 기본값의 철학이 다릅니다
//   ② 하드웨어 — 디스크가 SSD 인지, fsync 가 진짜 도는지에 따라 몇 배가 갈립니다
//   ③ 워크로드 — 읽기가 많은지 쓰기가 많은지, 조인이 깊은지에 따라 순위가 바뀝니다
//   ④ 데이터 크기 — 메모리에 다 들어가면 둘 다 빠릅니다. 안 들어갈 때 갈립니다
//   ⑤ 버전 — 매년 바뀝니다. 작년 벤치마크는 이미 낡았습니다
//
// ★★★ 그래서 이렇게 하세요.
//
//   **우리 데이터, 우리 쿼리, 우리 서버로 직접 재세요.**
//
//   ① 운영 데이터를 복사해서 (개인정보는 가리고) 양쪽에 넣습니다
//   ② 실제로 많이 도는 쿼리 10개를 고릅니다 (느린 쿼리 로그를 보면 나옵니다)
//   ③ 같은 색인을 만듭니다. ★ 이걸 빼먹으면 비교가 아예 무의미합니다
//   ④ 워밍업을 한 번 돌리고, 그 다음부터 여러 번 재서 **중앙값**을 씁니다
//   ⑤ 응답 시간뿐 아니라 **동시 접속을 늘렸을 때** 어떻게 되는지도 봅니다
//
// ★ 인터넷의 "MySQL 이 X% 빠르다" 는 글은 대부분 ③ 을 안 지켰습니다.


// ── 섹션 5: ★ 어느 쪽을 고를까 ──

const 고르기 = [
  ["새로 시작하는 서비스", "PostgreSQL", "기능이 넓고 표준을 잘 지킵니다. 요즘 호스팅도 Postgres 쪽이 많습니다"],
  ["회사에 이미 MySQL 이 있음", "MySQL", "DB 를 바꾸는 건 큰 결정입니다. 8.4 는 충분히 엄격합니다"],
  ["복잡한 조회·분석이 많음", "PostgreSQL", "CTE·윈도 함수·부분 색인·표현식 색인이 다 있습니다"],
  ["단순 조회가 아주 많음", "둘 다 괜찮음", "이 영역은 설정과 색인이 DB 선택보다 훨씬 큽니다"],
  ["JSON 을 많이 씁니다", "PostgreSQL", "JSONB 는 통째로 색인이 됩니다"],
  ["지리정보를 다룹니다", "PostgreSQL", "PostGIS 가 사실상 표준입니다"],
  ["마이그레이션을 자주 합니다", "PostgreSQL", "트랜잭션 DDL 이 있어서 실패해도 되돌아갑니다"],
  ["운영할 사람이 MySQL 만 압니다", "MySQL", "★ 이게 생각보다 큰 이유입니다. 새벽에 고칠 사람이 있어야 합니다"],
  ["국내 SI·공공 납품", "MySQL 이 많음", "규격에 들어가 있는 경우가 많습니다. 확인하고 시작하세요"],
];

console.log("[상황별로 무엇을 고를까]");
// 출력: [상황별로 무엇을 고를까]

for (const [상황, 추천, 이유] of 고르기) {
  console.log(`  · ${상황} → ${추천}`);
  console.log(`      ${이유}`);
}
// 출력:   · 새로 시작하는 서비스 → PostgreSQL
// 출력:       기능이 넓고 표준을 잘 지킵니다. 요즘 호스팅도 Postgres 쪽이 많습니다
// 출력:   · 회사에 이미 MySQL 이 있음 → MySQL
// 출력:       DB 를 바꾸는 건 큰 결정입니다. 8.4 는 충분히 엄격합니다
// 출력:   · 복잡한 조회·분석이 많음 → PostgreSQL
// 출력:       CTE·윈도 함수·부분 색인·표현식 색인이 다 있습니다
// 출력:   · 단순 조회가 아주 많음 → 둘 다 괜찮음
// 출력:       이 영역은 설정과 색인이 DB 선택보다 훨씬 큽니다
// 출력:   · JSON 을 많이 씁니다 → PostgreSQL
// 출력:       JSONB 는 통째로 색인이 됩니다
// 출력:   · 지리정보를 다룹니다 → PostgreSQL
// 출력:       PostGIS 가 사실상 표준입니다
// 출력:   · 마이그레이션을 자주 합니다 → PostgreSQL
// 출력:       트랜잭션 DDL 이 있어서 실패해도 되돌아갑니다
// 출력:   · 운영할 사람이 MySQL 만 압니다 → MySQL
// 출력:       ★ 이게 생각보다 큰 이유입니다. 새벽에 고칠 사람이 있어야 합니다
// 출력:   · 국내 SI·공공 납품 → MySQL 이 많음
// 출력:       규격에 들어가 있는 경우가 많습니다. 확인하고 시작하세요

// ★★ 이 자료가 PostgreSQL 로 가르치는 이유 — 실측에 근거해서 정리하면
//
//   ① **설치가 0 입니다.** 01~06단원은 PGlite 로 `npm install` 만 하면 됩니다.
//      MySQL 은 반드시 서버나 Docker 가 필요합니다.
//      수업 첫 시간을 설치로 날리지 않는 것이 큽니다
//   ② **배울 것이 더 많습니다.** RETURNING·부분 색인·배열·트랜잭션 DDL·JSONB 는
//      MySQL 에 없습니다. 없는 쪽에서 배우면 있는 것을 모르고 지나갑니다
//   ③ **표준에 가깝습니다.** 개념03 에서 봤듯이 `||`, `LENGTH`, NULL 정렬,
//      대소문자 비교 모두 PostgreSQL 쪽이 표준입니다.
//      표준을 익히면 다른 DB 로 갈 때 고칠 것이 적습니다
//
// ★★★ 그런데 **MySQL 을 무시하면 안 됩니다.** 이것도 실측으로 확인했습니다.
//
//   ① 개념02 에서 일곱 가지를 재 봤습니다. **7 대 7 로 똑같이 거절했습니다.**
//      "MySQL 은 허술하다" 는 평가는 낡았습니다
//   ② 개념03 의 중복확인 시나리오에서는 **MySQL 이 더 안전하게 동작했습니다**
//   ③ 국내 제조·SI·공공 현장에 여전히 많습니다. 이 자료의 도메인이 특히 그렇습니다
//
// ★ 정리하면
//   **Postgres 로 배우고, MySQL 을 만나면 이 단원의 표를 확인하세요.**
//   반대 방향(MySQL 로 배우고 Postgres 로 가기)이 더 어렵습니다.
//   MySQL 에서만 통하는 습관(`||` 를 OR 로 쓰기, 대소문자 무시에 기대기,
//   `WHERE 가동 = true` 로 TINYINT 비교하기)이 몸에 배기 때문입니다.


// ── 섹션 6: MariaDB 는 무엇인가 ──

const 버전문자열 = await 마이(MY김, "SELECT version() AS v");
const 마리아인가 = 버전문자열.값[0].v.includes("MariaDB");

console.log("이 서버의 버전 문자열:", 버전문자열.값[0].v);
// 출력?: 이 서버의 버전 문자열: 8.4.11
console.log("MariaDB 인가:", 마리아인가);
// 출력: MariaDB 인가: false

// 2010년에 오라클이 MySQL 을 가져가자, 원래 만들던 사람들이 소스를 복사해서
// 따로 만들기 시작한 것이 MariaDB 입니다. 처음에는 MySQL 5.5 와 거의 같아서
// "그냥 바꿔 끼우면 된다" 고 했습니다. 지금은 꽤 갈라졌습니다.
// MariaDB 에는 `RETURNING` 이 있고(MySQL 에는 없습니다), 시퀀스도 있고,
// 스토리지 엔진도 더 많습니다. 반대로 MySQL 8 의 JSON 함수·CTE 최적화·
// 데이터 딕셔너리는 MariaDB 와 구현이 다릅니다.
// ★ 실무에서 중요한 건 하나입니다. **"MySQL 이라고 들었는데 MariaDB" 인 현장이 많습니다.**
// 접속하자마자 `SELECT version()` 을 찍어서 확인하세요. 위 한 줄이면 됩니다.


// ── 뒷정리 ──

await 피지(PG김, "DROP TABLE IF EXISTS 생산실적");
await 마이(MY김, "DROP TABLE IF EXISTS 구구_생산실적");

console.log("실습에 쓴 표를 모두 지웠습니다.");
// 출력: 실습에 쓴 표를 모두 지웠습니다.


// ============================================================
// 정리 — 옮기기 전 점검 목록
// ============================================================
//
//   □ 1. `SELECT @@sql_mode` 를 찍었는가                      (개념02)
//        STRICT_TRANS_TABLES · ONLY_FULL_GROUP_BY 가 있는가
//
//   □ 2. `||` 를 전부 `concat()` 으로 바꿨는가                 (개념03) ★★★
//
//   □ 3. 대소문자 비교에 기대는 곳을 찾았는가                  (개념03) ★★★
//        아이디·코드는 앱에서 소문자로 맞춰 저장하는 것이 안전합니다
//
//   □ 4. `LENGTH()` 를 `char_length()` 로 바꿨는가             (개념03)
//
//   □ 5. `ORDER BY` 의 NULL 자리를 확인했는가                  (개념03)
//
//   □ 6. 문자셋이 `utf8mb4` 인가                               (개념03)
//
//   □ 7. 파라미터를 `$1` 에서 `?` 로 바꿨는가                  (개념04)
//        같은 번호를 두 번 쓴 곳의 값 개수도 맞췄는가
//
//   □ 8. `RETURNING` 을 쓰는 곳을 전부 고쳤는가                (개념04) ★★
//        여러 건 넣고 id 를 받는 코드가 있으면 특히 위험합니다
//
//   □ 9. 마이그레이션이 실패했을 때 되돌릴 방법이 있는가       (개념04) ★★★
//        MySQL 은 DDL 이 암묵적 커밋입니다
//
//   □ 10. 표 이름을 전부 소문자로 통일했는가                   (개념04) ★★
//
//   □ 11. 격리수준을 접속할 때 명시했는가                      (개념05)
//
//   □ 12. 범위를 잠그는 쿼리에 색인이 있는가                   (개념05)
//         색인이 없으면 MySQL 은 표 전체를 잠급니다
//
//   □ 13. 성능은 **우리 데이터로 직접** 쟀는가                 (개념05)
//
// ★ 그리고 마지막으로, 가장 확실한 검증 방법을 적어 둡니다.
//   **옮긴 뒤에 같은 쿼리를 양쪽에 보내고 결과를 비교하세요.**
//   이 단원 내내 쓴 `나란히()` 함수가 바로 그 도구입니다.
//   에러가 안 나는 차이는 그 방법으로만 잡힙니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 의 거짓 경고를 줄여 보세요.
//                    작은따옴표로 감싼 글자를 먼저 지우고 검사하면 됩니다.
//                    ★ 힌트: `SQL.replace(/'(?:[^'\\]|\\.)*'/g, "''")`
//                    (이 자료의 출력검증 도구도 같은 방법을 씁니다)
//
// ✏️ 직접 해보기 2 — `옮기기점검()` 이 **몇 번째 줄**에서 걸렸는지도 알려 주게 고쳐 보세요.
//                    (힌트: SQL 을 `split("\n")` 해서 줄마다 검사하면 됩니다)
//
// ✏️ 직접 해보기 3 — 규칙을 세 개 더 추가해 보세요.
//                    (힌트: `DISTINCT ON`, `generate_series`, `INTERVAL '1 day'`)
//                    각각 MySQL 에서 어떻게 바꿔야 하는지도 적으세요.
//
// ✏️ 직접 해보기 4 — 섹션 3 의 갭 락 실험에서 `BETWEEN 10 AND 20` 을
//                    `= 10` 으로 바꿔 보세요. 15번 INSERT 가 막히나요?
//                    ★ 안 막힐 것입니다. 왜일까요?
//
// ✏️ 직접 해보기 5 — 섹션 3 을 색인 없는 칸으로 해 보세요.
//                    `수량` 칸(색인 없음)에 `WHERE 수량 = 100 FOR UPDATE` 를 걸고
//                    전혀 상관없는 줄을 INSERT 해 보세요. 막히나요?
//                    ★ 색인이 없으면 MySQL 은 훨씬 넓게 잠급니다.
//
// ✏️ 직접 해보기 6 — MySQL 의 격리수준을 `READ COMMITTED` 로 바꾸고
//                    섹션 3 의 갭 락 실험을 다시 해 보세요. 여전히 막히나요?
//
// ✏️ 직접 해보기 7 — 여러분 회사(또는 연습 프로젝트)의 SQL 을 파일로 읽어서
//                    `옮기기점검()` 에 넣어 보세요. 몇 개나 걸리나요?
//
// ✏️ 직접 해보기 8 — 섹션 4 의 안내대로 **간단한 벤치마크**를 직접 짜 보세요.
//                    같은 표에 10만 건을 넣고, 같은 색인을 만들고,
//                    같은 SELECT 를 100번 돌려서 중앙값을 재세요.
//                    ★ 그리고 그 숫자를 남에게 이야기할 때는 **설정도 같이** 말하세요.


// ── 자주 하는 실수 ──

// [실수 1] 점검 도구를 돌리고 "경고 0개니까 안전하다" 고 판단한다
//   ★★★ 개념03 의 조용한 차이는 정규식으로 못 잡습니다.
//   대소문자 비교, NULL 정렬 순서, 자동 형변환은 SQL 만 봐서는 안 보입니다.
//   **결과를 양쪽에서 비교하는 것**이 유일한 확인 방법입니다.

// [실수 2] 격리수준 기본값이 같을 거라고 생각한다
//   PostgreSQL 은 read committed, MySQL 은 REPEATABLE READ 입니다.
//   ★ 접속할 때 명시하세요. 기본값에 기대면 서버가 바뀔 때 동작이 바뀝니다.

// [실수 3] MySQL 의 갭 락을 모르고 범위 UPDATE 를 남발한다
//   ★★ `UPDATE ... WHERE 날짜 BETWEEN ...` 하나가 그 뒤 전부를 잠글 수 있습니다.
//   동시에 넣는 쪽이 1205(잠금 대기 시간 초과)로 죽습니다.

// [실수 4] 색인 없이 범위를 잠근다
//   MySQL 은 색인이 없으면 훑은 줄을 전부 잠급니다. 사실상 표 잠금입니다.
//   ★ 잠그는 쿼리의 WHERE 절에는 반드시 색인이 있어야 합니다.

// [실수 5] 인터넷 벤치마크를 근거로 DB 를 고른다
//   ★ 설정·하드웨어·워크로드가 다르면 순위가 바뀝니다.
//   특히 **색인을 양쪽에 똑같이 안 만든** 비교가 아주 많습니다.

// [실수 6] "누가 더 좋은가" 로 결론을 낸다
//   ★★ 운영할 사람이 아는 DB 가 제일 좋은 DB 입니다.
//   새벽 3시에 장애가 났을 때 고칠 수 있느냐가 기능표보다 중요합니다.

// [실수 7] MariaDB 를 MySQL 과 같다고 본다
//   지금은 꽤 갈라졌습니다. `RETURNING` 처럼 MariaDB 에만 있는 것도 있습니다.
//   ★ 접속하면 `SELECT version()` 부터 찍으세요.

// [실수 8] 데이터를 옮기기 전에 **제약 충돌**을 확인하지 않는다
//   ★★★ 개념03 에서 봤습니다. PostgreSQL 에 있던 'Admin' 과 'admin' 을
//   MySQL 로 옮기면 UNIQUE 충돌(1062)로 이관이 **중간에 멈춥니다.**
//   옮기기 전에 `SELECT lower(아이디), COUNT(*) ... HAVING COUNT(*) > 1` 로 세어 보세요.


await PG김.end();
await PG이.end();
await MY김.end();
await MY이.end();
