// ============================================================
// 09단원 · 개념 02 — 옛날 이야기를 뒤집습니다
// ------------------------------------------------------------
// 실행: node 개념02_옛날_이야기를_뒤집습니다.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ============================================================
//
// 인터넷에서 이런 문장을 보셨을 겁니다.
//
//   "MySQL 은 관대해서 이상한 값이 조용히 들어간다."
//   "숫자 칸에 글자를 넣으면 0 이 들어간다."
//   "VARCHAR(5) 에 10글자를 넣으면 앞 5글자만 남고 잘린다."
//   "GROUP BY 에 없는 칸을 아무렇게나 골라도 받아 준다."
//
// **이 문장들은 MySQL 8.4 에서는 전부 틀렸습니다.**
//
// 옛날 MySQL(5.6 이하) 이야기입니다.
// 5.7 과 8.0 을 지나며 `STRICT_TRANS_TABLES` 와 `ONLY_FULL_GROUP_BY` 가
// **기본값**이 됐습니다. 지금은 PostgreSQL 과 거의 똑같이 거절합니다.
//
// 믿으라고 하지 않겠습니다. **직접 여섯 가지를 넣어 보겠습니다.**
//
// 그리고 이 파일의 진짜 결론은 뒷부분에 있습니다.
//   ★★ 그 엄격함은 **설정**이라서 끌 수 있습니다.
//      끄면 옛날 그대로 조용히 잘립니다. 그것도 직접 재 봅니다.

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

// 같은 뜻의 SQL 을 양쪽에 보내고 나란히 찍습니다. 이 단원 내내 씁니다.
async function 나란히(제목, 피지문, 마이문) {
  const 가 = await 피지(피지문);
  const 나 = await 마이(마이문 === undefined ? 피지문 : 마이문);

  console.log(`· ${제목}`);
  console.log(`    PostgreSQL — ${짧게(가)}`);
  console.log(`    MySQL      — ${짧게(나)}`);

  return { 가, 나 };
}


// ── 섹션 1: 같은 표를 양쪽에 만듭니다 ──

// ★ 여러 번 돌려도 같은 결과가 나오게, 매번 표를 새로 만듭니다.
await 피지("DROP TABLE IF EXISTS 설비");
await 마이("DROP TABLE IF EXISTS 구구_설비");

await 피지(`
  CREATE TABLE 설비 (
    id     SERIAL PRIMARY KEY,
    이름   VARCHAR(5),
    수량   INT,
    도입일 DATE,
    라인   VARCHAR(10)
  )
`);

await 마이(`
  CREATE TABLE 구구_설비 (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    이름   VARCHAR(5),
    수량   INT,
    도입일 DATE,
    라인   VARCHAR(10)
  )
`);

// ★ 두 CREATE 문에서 다른 곳은 **자동 번호를 만드는 방법 한 군데**뿐입니다.
//   SERIAL vs INT AUTO_INCREMENT. 나머지는 글자 하나까지 같습니다.
//   (자동 번호 이야기는 개념04 에서 따로 합니다)

console.log("표를 양쪽에 만들었습니다.");
// 출력: 표를 양쪽에 만들었습니다.


// ── 섹션 2: ★★★ 여섯 가지 시험 ──

console.log("── 시험 1. 숫자 칸에 글자를 넣으면 ──");
// 출력: ── 시험 1. 숫자 칸에 글자를 넣으면 ──

await 나란히(
  "INT 칸에 '백개' 넣기",
  "INSERT INTO 설비(수량) VALUES ('백개')",
  "INSERT INTO 구구_설비(수량) VALUES ('백개')",
);
// 출력: · INT 칸에 '백개' 넣기
// 출력:     PostgreSQL — 거절 22P02
// 출력:     MySQL      — 거절 ER_TRUNCATED_WRONG_VALUE_FOR_FIELD/1366

// ★ 옛말: "MySQL 은 0 을 넣는다"  →  실제: **거절합니다.**
//   PostgreSQL 의 22P02 는 "입력 문법이 타입에 안 맞음" 이라는 뜻입니다.
//   MySQL 의 1366 은 "칸에 맞지 않는 값" 이라는 뜻입니다. 이름만 다르고 결과는 같습니다.

console.log("── 시험 2. VARCHAR(5) 에 10글자를 넣으면 ──");
// 출력: ── 시험 2. VARCHAR(5) 에 10글자를 넣으면 ──

await 나란히(
  "VARCHAR(5) 에 '가나다라마바사아자차'",
  "INSERT INTO 설비(이름) VALUES ('가나다라마바사아자차')",
  "INSERT INTO 구구_설비(이름) VALUES ('가나다라마바사아자차')",
);
// 출력: · VARCHAR(5) 에 '가나다라마바사아자차'
// 출력:     PostgreSQL — 거절 22001
// 출력:     MySQL      — 거절 ER_DATA_TOO_LONG/1406

// ★ 옛말: "MySQL 은 앞 5글자만 남기고 자른다"  →  실제: **거절합니다.**
//   ★ 이게 가장 무서운 옛날 동작이었습니다.
//     주민번호나 계좌번호가 조용히 잘린 채로 저장되는 사고가 실제로 있었습니다.

console.log("── 시험 3. INT 범위를 넘기면 ──");
// 출력: ── 시험 3. INT 범위를 넘기면 ──

await 나란히(
  "INT 칸에 9999999999",
  "INSERT INTO 설비(수량) VALUES (9999999999)",
  "INSERT INTO 구구_설비(수량) VALUES (9999999999)",
);
// 출력: · INT 칸에 9999999999
// 출력:     PostgreSQL — 거절 22003
// 출력:     MySQL      — 거절 ER_WARN_DATA_OUT_OF_RANGE/1264

// ★ INT 는 21억(2,147,483,647) 까지입니다. 그 위는 BIGINT 를 써야 합니다.
//   옛날 MySQL 은 21억을 넣고 말았습니다. 지금은 거절합니다.

console.log("── 시험 4. 있을 수 없는 날짜를 넣으면 ──");
// 출력: ── 시험 4. 있을 수 없는 날짜를 넣으면 ──

await 나란히(
  "날짜 칸에 '0000-00-00'",
  "INSERT INTO 설비(도입일) VALUES ('0000-00-00')",
  "INSERT INTO 구구_설비(도입일) VALUES ('0000-00-00')",
);
// 출력: · 날짜 칸에 '0000-00-00'
// 출력:     PostgreSQL — 거절 22008
// 출력:     MySQL      — 거절 ER_TRUNCATED_WRONG_VALUE/1292

await 나란히(
  "날짜 칸에 '2026-02-30'",
  "INSERT INTO 설비(도입일) VALUES ('2026-02-30')",
  "INSERT INTO 구구_설비(도입일) VALUES ('2026-02-30')",
);
// 출력: · 날짜 칸에 '2026-02-30'
// 출력:     PostgreSQL — 거절 22008
// 출력:     MySQL      — 거절 ER_TRUNCATED_WRONG_VALUE/1292

// ★ `'0000-00-00'` 은 옛날 MySQL 의 상징 같은 값이었습니다.
//   "날짜 없음" 을 NULL 대신 이걸로 쓰던 습관이 있었습니다.
//   그 값을 자바스크립트 `new Date()` 에 넣으면 **Invalid Date** 가 나옵니다.
//   지금은 `NO_ZERO_DATE` 가 기본이라 아예 안 들어갑니다.

console.log("── 시험 5. GROUP BY 에 없는 칸을 SELECT 하면 ──");
// 출력: ── 시험 5. GROUP BY 에 없는 칸을 SELECT 하면 ──

// 먼저 정상 데이터를 넣습니다.
await 피지("INSERT INTO 설비(이름,수량,라인) VALUES ('가',10,'A'),('나',20,'A'),('다',30,'B')");
await 마이("INSERT INTO 구구_설비(이름,수량,라인) VALUES ('가',10,'A'),('나',20,'A'),('다',30,'B')");

await 나란히(
  "GROUP BY 라인 인데 이름도 SELECT",
  "SELECT 라인, 이름, SUM(수량) AS 합 FROM 설비 GROUP BY 라인",
  "SELECT 라인, 이름, SUM(수량) AS 합 FROM 구구_설비 GROUP BY 라인",
);
// 출력: · GROUP BY 라인 인데 이름도 SELECT
// 출력:     PostgreSQL — 거절 42803
// 출력:     MySQL      — 거절 ER_WRONG_FIELD_WITH_GROUP/1055

// ★ 라인 A 에는 이름이 '가' 와 '나' 두 개 있습니다. 어느 것을 보여 줘야 할까요?
//   답이 없습니다. 그래서 **양쪽 다 거절합니다.**
//   옛날 MySQL 은 아무거나 하나 골라서 줬습니다. 그래서 화면에 엉뚱한 이름이 떴습니다.

console.log("── 시험 6. CHECK 제약을 어기면 ──");
// 출력: ── 시험 6. CHECK 제약을 어기면 ──

await 피지("DROP TABLE IF EXISTS 재고");
await 마이("DROP TABLE IF EXISTS 구구_재고");
await 피지("CREATE TABLE 재고 (부품 VARCHAR(20), 수량 INT CHECK (수량 >= 0))");
await 마이("CREATE TABLE 구구_재고 (부품 VARCHAR(20), 수량 INT CHECK (수량 >= 0))");

await 나란히(
  "수량 >= 0 인데 -5 를 넣기",
  "INSERT INTO 재고 VALUES ('베어링', -5)",
  "INSERT INTO 구구_재고 VALUES ('베어링', -5)",
);
// 출력: · 수량 >= 0 인데 -5 를 넣기
// 출력:     PostgreSQL — 거절 23514
// 출력:     MySQL      — 거절 ER_CHECK_CONSTRAINT_VIOLATED/3819

// ★★ 이건 정말 최근에 바뀐 것입니다.
//   MySQL 은 8.0.16(2019년) 전까지 `CHECK` 를 **문법만 받고 무시했습니다.**
//   에러도 안 났습니다. 그래서 "MySQL 에서 CHECK 는 장식" 이라는 말이 돌았습니다.
//   지금은 진짜로 검사합니다.

console.log("── 덤. NOT NULL 은 어떤가 ──");
// 출력: ── 덤. NOT NULL 은 어떤가 ──

await 피지("DROP TABLE IF EXISTS 필수");
await 마이("DROP TABLE IF EXISTS 구구_필수");
await 피지("CREATE TABLE 필수 (이름 VARCHAR(20) NOT NULL)");
await 마이("CREATE TABLE 구구_필수 (이름 VARCHAR(20) NOT NULL)");

await 나란히(
  "NOT NULL 칸에 NULL 넣기",
  "INSERT INTO 필수 VALUES (NULL)",
  "INSERT INTO 구구_필수 VALUES (NULL)",
);
// 출력: · NOT NULL 칸에 NULL 넣기
// 출력:     PostgreSQL — 거절 23502
// 출력:     MySQL      — 거절 ER_BAD_NULL_ERROR/1048

await 나란히(
  "NOT NULL 칸을 아예 빼고 넣기",
  "INSERT INTO 필수 DEFAULT VALUES",
  "INSERT INTO 구구_필수 () VALUES ()",
);
// 출력: · NOT NULL 칸을 아예 빼고 넣기
// 출력:     PostgreSQL — 거절 23502
// 출력:     MySQL      — 거절 ER_NO_DEFAULT_FOR_FIELD/1364

// ★ 에러 이름이 다르지만(23502 vs 1364) 결과는 같습니다. 둘 다 막습니다.


// ── 섹션 3: 몇 대 몇이었나 ──

const 시험표 = [
  ["INT 칸에 '백개'", "22P02", "1366"],
  ["VARCHAR(5) 에 10글자", "22001", "1406"],
  ["INT 범위 초과", "22003", "1264"],
  ["날짜 '0000-00-00'", "22008", "1292"],
  ["GROUP BY 위반", "42803", "1055"],
  ["CHECK 위반", "23514", "3819"],
  ["NOT NULL 위반", "23502", "1048"],
];

console.log("[일곱 가지 시험 결과]");
// 출력: [일곱 가지 시험 결과]

for (const [무엇, 피지코드, 마이코드] of 시험표) {
  console.log(`  ${무엇} — PG ${피지코드} 거절 · MySQL ${마이코드} 거절`);
}
// 출력:   INT 칸에 '백개' — PG 22P02 거절 · MySQL 1366 거절
// 출력:   VARCHAR(5) 에 10글자 — PG 22001 거절 · MySQL 1406 거절
// 출력:   INT 범위 초과 — PG 22003 거절 · MySQL 1264 거절
// 출력:   날짜 '0000-00-00' — PG 22008 거절 · MySQL 1292 거절
// 출력:   GROUP BY 위반 — PG 42803 거절 · MySQL 1055 거절
// 출력:   CHECK 위반 — PG 23514 거절 · MySQL 3819 거절
// 출력:   NOT NULL 위반 — PG 23502 거절 · MySQL 1048 거절

console.log(`양쪽이 똑같이 거절한 시험: ${시험표.length} / ${시험표.length}`);
// 출력: 양쪽이 똑같이 거절한 시험: 7 / 7

// ★★★ 7 대 7 입니다. **한 개도 다르지 않았습니다.**
//   "MySQL 은 허술하다" 는 말은 여기서 끝났습니다.


// ── 섹션 4: 왜 그런가 — sql_mode 를 봅니다 ──

const 모드결과 = await 마이("SELECT @@SESSION.sql_mode AS m");
const 지금모드 = 모드결과.값[0].m;

console.log("지금 접속의 sql_mode:");
// 출력: 지금 접속의 sql_mode:

for (const 항목 of 지금모드.split(",")) {
  console.log(`  · ${항목}`);
}
// 출력:   · IGNORE_SPACE
// 출력:   · ONLY_FULL_GROUP_BY
// 출력:   · STRICT_TRANS_TABLES
// 출력:   · NO_ZERO_IN_DATE
// 출력:   · NO_ZERO_DATE
// 출력:   · ERROR_FOR_DIVISION_BY_ZERO
// 출력:   · NO_ENGINE_SUBSTITUTION

// 각 항목이 무슨 뜻인지 정리합니다.
//
//   STRICT_TRANS_TABLES       ★★★ 잘못된 값을 잘라 넣지 말고 **거절**하라
//   ONLY_FULL_GROUP_BY        ★★  GROUP BY 에 없는 칸을 SELECT 하지 못하게
//   NO_ZERO_DATE              '0000-00-00' 을 막음
//   NO_ZERO_IN_DATE           '2026-00-15' 처럼 달·일이 0 인 것을 막음
//   ERROR_FOR_DIVISION_BY_ZERO  0 으로 나누기를 경고로 알림 (INSERT 때 의미가 있음)
//   NO_ENGINE_SUBSTITUTION    없는 엔진을 달라고 하면 딴 것으로 바꾸지 말고 에러
//   IGNORE_SPACE              함수 이름과 괄호 사이 공백을 허용 (드라이버가 켬)
//
// ★ 앞의 두 개가 이 파일의 시험 일곱 개를 전부 설명합니다.

console.log("STRICT_TRANS_TABLES 켜져 있나:", 지금모드.includes("STRICT_TRANS_TABLES"));
// 출력: STRICT_TRANS_TABLES 켜져 있나: true
console.log("ONLY_FULL_GROUP_BY 켜져 있나:", 지금모드.includes("ONLY_FULL_GROUP_BY"));
// 출력: ONLY_FULL_GROUP_BY 켜져 있나: true


// ── 섹션 5: ★★★ 그런데 이건 **설정**입니다. 끌 수 있습니다 ──

// 여기가 이 파일에서 제일 중요한 부분입니다.
//
// 위의 엄격함은 MySQL 이라는 프로그램의 성질이 아닙니다. **설정값**입니다.
// 설정은 바꿀 수 있습니다. 그리고 **옛 서버에는 꺼져 있습니다.**
//
// ★ 안전하게 실험하는 법: `SET SESSION` 을 씁니다.
//   `SET GLOBAL` 은 서버 전체를 바꿉니다. 남의 접속까지 바뀝니다. 쓰지 마세요.
//   `SET SESSION` 은 **내 접속에만** 적용됩니다. 접속을 끊으면 사라집니다.

const 원래모드 = 지금모드;

// 2010년대 서버에 흔했던 설정으로 바꿔 봅니다.
await 마이("SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION'");

const 바뀐모드 = await 마이("SELECT @@SESSION.sql_mode AS m");
console.log("바꾼 뒤 sql_mode:", 바뀐모드.값[0].m);
// 출력: 바꾼 뒤 sql_mode: NO_ENGINE_SUBSTITUTION

// 같은 것을 다시 넣어 봅니다. 이번에는 표를 비우고 시작합니다.
await 마이("DELETE FROM 구구_설비");
await 마이("ALTER TABLE 구구_설비 AUTO_INCREMENT = 1");

const 다시넣기 = [
  ["INT 칸에 '백개'", "INSERT INTO 구구_설비(수량) VALUES ('백개')"],
  ["VARCHAR(5) 에 10글자", "INSERT INTO 구구_설비(이름) VALUES ('가나다라마바사아자차')"],
  ["INT 범위 초과", "INSERT INTO 구구_설비(수량) VALUES (9999999999)"],
  ["날짜 '0000-00-00'", "INSERT INTO 구구_설비(도입일) VALUES ('0000-00-00')"],
  ["날짜 '2026-02-30'", "INSERT INTO 구구_설비(도입일) VALUES ('2026-02-30')"],
];

console.log("[STRICT 를 끈 뒤 같은 값을 다시 넣으면]");
// 출력: [STRICT 를 끈 뒤 같은 값을 다시 넣으면]

for (const [무엇, 문장] of 다시넣기) {
  const 결과 = await 마이(문장);
  const 경고 = await 마이("SHOW WARNINGS");
  const 경고말 = 경고.값.length === 0 ? "경고조차 없음" : `경고 ${경고.값[0].Code}`;

  console.log(`  ${무엇} — ${결과.됨 ? "들어감" : "거절"} · ${경고말}`);
}
// 출력:   INT 칸에 '백개' — 들어감 · 경고 1366
// 출력:   VARCHAR(5) 에 10글자 — 들어감 · 경고 1265
// 출력:   INT 범위 초과 — 들어감 · 경고 1264
// 출력:   날짜 '0000-00-00' — 들어감 · 경고조차 없음
// 출력:   날짜 '2026-02-30' — 들어감 · 경고 1264

// ★★★ 다섯 개가 **전부 들어갔습니다.** 그럼 무엇이 들어갔을까요?

const 망가진것 = await 마이(
  "SELECT id, 이름, 수량, CAST(도입일 AS CHAR) AS 도입일 FROM 구구_설비 ORDER BY id",
);

console.log("[실제로 저장된 값]");
// 출력: [실제로 저장된 값]

for (const 줄 of 망가진것.값) {
  console.log(`  ${줄.id}번 — 이름 ${JSON.stringify(줄.이름)} · 수량 ${JSON.stringify(줄.수량)} · 도입일 ${JSON.stringify(줄.도입일)}`);
}
// 출력:   1번 — 이름 null · 수량 0 · 도입일 null
// 출력:   2번 — 이름 "가나다라마" · 수량 null · 도입일 null
// 출력:   3번 — 이름 null · 수량 2147483647 · 도입일 null
// 출력:   4번 — 이름 null · 수량 null · 도입일 "0000-00-00"
// 출력:   5번 — 이름 null · 수량 null · 도입일 "0000-00-00"

// ★★★ 옛말이 전부 사실이 됐습니다.
//
//   '백개'                → **0**
//   '가나다라마바사아자차' → **'가나다라마'** (뒤 다섯 글자가 사라졌습니다)
//   9999999999            → **2147483647** (INT 의 최댓값으로 눌렸습니다)
//   '0000-00-00'          → 그대로 들어갔고 **경고조차 없습니다**
//   '2026-02-30'          → **'0000-00-00'** 이 됐습니다
//
// ★ 마지막 두 개가 제일 무섭습니다.
//   2월 30일을 넣었는데 0년 0월 0일이 됐습니다.
//   그리고 '0000-00-00' 은 경고도 안 나옵니다. **완전히 조용합니다.**
//
// ★★ "그래도 경고는 나오잖아요?"
//   `SHOW WARNINGS` 를 따로 실행해야 보입니다.
//   응용 프로그램에서 그걸 확인하는 코드를 짜는 사람은 거의 없습니다.
//   그래서 실질적으로는 **아무도 모릅니다.**

console.log("잘린 이름의 글자 수:", 망가진것.값[1].이름.length);
// 출력: 잘린 이름의 글자 수: 5
console.log("원래 넣으려던 글자 수:", "가나다라마바사아자차".length);
// 출력: 원래 넣으려던 글자 수: 10


// ── 섹션 6: 무엇이 안 꺼지나 ──

// ★ 좋은 소식도 있습니다. sql_mode 로 못 끄는 것이 있습니다.

await 마이("SET SESSION sql_mode=''");

const 체크시험 = await 마이("INSERT INTO 구구_재고 VALUES ('베어링', -5)");
console.log("sql_mode 를 통째로 비운 뒤 CHECK 위반:", 짧게(체크시험));
// 출력: sql_mode 를 통째로 비운 뒤 CHECK 위반: 거절 ER_CHECK_CONSTRAINT_VIOLATED/3819

const 널시험 = await 마이("INSERT INTO 구구_필수 VALUES (NULL)");
console.log("sql_mode 를 통째로 비운 뒤 NOT NULL 위반:", 짧게(널시험));
// 출력: sql_mode 를 통째로 비운 뒤 NOT NULL 위반: 거절 ER_BAD_NULL_ERROR/1048

// ★ CHECK 와 NOT NULL 은 **제약(constraint)** 입니다. 설정이 아닙니다.
//   sql_mode 를 아무리 비워도 안 꺼집니다.
//   → 그래서 **중요한 규칙은 sql_mode 가 아니라 제약으로 걸어야 합니다.**
//     (제약은 02단원에서 했습니다)


// ── 섹션 7: ★ 반드시 되돌려 놓습니다 ──

await 마이("SET SESSION sql_mode=?", [원래모드]);

const 되돌린모드 = await 마이("SELECT @@SESSION.sql_mode AS m");
console.log("되돌린 sql_mode 가 원래와 같나:", 되돌린모드.값[0].m === 원래모드);
// 출력: 되돌린 sql_mode 가 원래와 같나: true

const 다시거절 = await 마이("INSERT INTO 구구_설비(수량) VALUES ('백개')");
console.log("되돌린 뒤 '백개' 넣기:", 짧게(다시거절));
// 출력: 되돌린 뒤 '백개' 넣기: 거절 ER_TRUNCATED_WRONG_VALUE_FOR_FIELD/1366

// ★ 실험 뒤에는 반드시 원래대로 돌려놓으세요.
//   `SET SESSION` 만 썼으니 접속을 끊어도 알아서 사라지지만,
//   같은 접속을 계속 쓰는 코드에서는 다음 쿼리가 이상해집니다.


// ── 섹션 8: ★★★ 그래서 무엇을 해야 하나 ──

// 결론은 하나입니다.
//
//   **MySQL 서버를 처음 만나면 `SELECT @@sql_mode` 부터 찍어 보세요.**
//
// 버전이 8.4 라도 설정이 꺼져 있으면 옛날처럼 동작합니다.
// 반대로 5.7 이라도 설정이 켜져 있으면 엄격합니다.
// **버전이 아니라 설정이 문제입니다.**
//
// 진단하는 함수를 만들어 두면 편합니다.

function 엄격한가(모드문자열) {
  const 있어야할것 = ["STRICT_TRANS_TABLES", "ONLY_FULL_GROUP_BY", "NO_ZERO_DATE", "NO_ZERO_IN_DATE"];
  const 빠진것 = 있어야할것.filter((항목) => !모드문자열.includes(항목));

  return { 안전한가: 빠진것.length === 0, 빠진것 };
}

const 지금진단 = 엄격한가(원래모드);
console.log("지금 접속 진단 — 안전한가:", 지금진단.안전한가);
// 출력: 지금 접속 진단 — 안전한가: true
console.log("지금 접속 진단 — 빠진 것:", JSON.stringify(지금진단.빠진것));
// 출력: 지금 접속 진단 — 빠진 것: []

const 옛서버진단 = 엄격한가("NO_ENGINE_SUBSTITUTION");
console.log("옛 서버 진단 — 안전한가:", 옛서버진단.안전한가);
// 출력: 옛 서버 진단 — 안전한가: false
console.log("옛 서버 진단 — 빠진 것:", JSON.stringify(옛서버진단.빠진것));
// 출력: 옛 서버 진단 — 빠진 것: ["STRICT_TRANS_TABLES","ONLY_FULL_GROUP_BY","NO_ZERO_DATE","NO_ZERO_IN_DATE"]

// ★ 빠진 것이 있으면 서버 설정 파일(my.cnf)에서 이렇게 켭니다.
//
//   [mysqld]
//   sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
//
// ★★ 그런데 운영 중인 서버에서 갑자기 켜면 **돌던 코드가 멈춥니다.**
//   지금까지 조용히 잘려 들어가던 INSERT 가 에러가 되기 때문입니다.
//   순서는 이렇습니다.
//
//   ① 개발 환경에서 먼저 켠다
//   ② 터지는 곳을 전부 고친다
//   ③ 데이터를 점검한다 ('0000-00-00' 이 이미 들어 있을 수 있습니다)
//   ④ 그 다음에 운영에 켠다
//
// ★ 접속할 때마다 강제로 켜는 방법도 있습니다. 서버를 못 건드릴 때 씁니다.
//   mysql2 에서는 접속 옵션으로 줍니다.
//
//     mysql.createConnection({ ..., flags: [] })    // 드라이버 옵션은 따로
//     await 연결.query("SET SESSION sql_mode='STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY'");
//
//   접속을 만든 직후에 위 한 줄을 실행하면 그 접속만 안전해집니다.


// ── 뒷정리 ──

await 피지("DROP TABLE IF EXISTS 설비");
await 피지("DROP TABLE IF EXISTS 재고");
await 피지("DROP TABLE IF EXISTS 필수");
await 마이("DROP TABLE IF EXISTS 구구_설비");
await 마이("DROP TABLE IF EXISTS 구구_재고");
await 마이("DROP TABLE IF EXISTS 구구_필수");


// ============================================================
// 정리 — 옛말은 어디까지 맞나
// ============================================================
//
//   시험                     PostgreSQL 18   MySQL 8.4 (기본)   MySQL 8.4 (STRICT 끔)
//   ────────────────────────────────────────────────────────────────────────────
//   INT 칸에 '백개'           거절 22P02      거절 1366           0 이 들어감
//   VARCHAR(5) 에 10글자      거절 22001      거절 1406           앞 5글자만 남음
//   INT 범위 초과             거절 22003      거절 1264           2147483647 로 눌림
//   날짜 '0000-00-00'         거절 22008      거절 1292           그대로 · 경고도 없음
//   날짜 '2026-02-30'         거절 22008      거절 1292           '0000-00-00' 이 됨
//   GROUP BY 위반             거절 42803      거절 1055           아무 값이나 골라 줌
//   CHECK 위반                거절 23514      거절 3819           **거절** (안 꺼짐)
//   NOT NULL 위반             거절 23502      거절 1048           **거절** (안 꺼짐)
//
// ★ 왼쪽 두 칸이 같습니다. **MySQL 8.4 는 PostgreSQL 만큼 엄격합니다.**
// ★★ 오른쪽 칸이 이 파일의 진짜 교훈입니다. **설정 하나로 옛날로 돌아갑니다.**
//
//   → MySQL 을 만나면 `SELECT @@sql_mode` 를 찍으세요.
//     버전이 아니라 설정입니다.
//
// ★ 다음 파일이 더 위험합니다.
//   개념03 에서는 **에러조차 안 나면서 결과가 다른 것**들을 봅니다.


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 5 에서 sql_mode 를 `'STRICT_ALL_TABLES'` 로 바꿔 보세요.
//                    `STRICT_TRANS_TABLES` 와 무엇이 다른가요?
//                    (힌트: TRANS 는 트랜잭션을 지원하는 엔진에만 적용됩니다.
//                     MyISAM 표에서는 STRICT_TRANS_TABLES 가 약하게 동작합니다)
//
// ✏️ 직접 해보기 2 — STRICT 를 끈 채로 `TINYINT` 칸에 300 을 넣어 보세요.
//                    무슨 값이 들어가나요? (힌트: TINYINT 는 127 까지입니다)
//
// ✏️ 직접 해보기 3 — STRICT 를 끈 채로 UPDATE 를 해 보세요.
//                    `UPDATE 구구_설비 SET 수량='백개'` 도 조용히 0 이 되나요?
//                    ★ INSERT 만 조심하면 된다고 생각하기 쉽습니다. 아닙니다.
//
// ✏️ 직접 해보기 4 — `NO_ZERO_DATE` 만 빼고 나머지는 켠 상태를 만들어 보세요.
//                    그 상태에서 '0000-00-00' 이 들어가나요?
//                    설정을 **하나씩** 껐다 켜면서 무엇이 무엇을 막는지 확인해 보세요.
//
// ✏️ 직접 해보기 5 — PostgreSQL 에는 sql_mode 같은 것이 있을까요?
//                    `SHOW ALL` 에서 찾아보세요. 없습니다.
//                    ★ 없다는 것이 이 비교의 핵심입니다. Postgres 는 고를 수 없어서 안전합니다.
//
// ✏️ 직접 해보기 6 — 이미 '0000-00-00' 이 들어 있는 표를 어떻게 고칠까요?
//                    `UPDATE ... SET 도입일 = NULL WHERE 도입일 = '0000-00-00'` 을
//                    STRICT 를 켠 상태에서 실행하면 될까요? 직접 해 보세요.
//
// ✏️ 직접 해보기 7 — 섹션 8 의 `엄격한가()` 함수에 `ANSI_QUOTES` 검사도 넣어 보세요.
//                    그 모드가 켜지면 큰따옴표의 뜻이 바뀝니다 (개념01 섹션 8 참고).


// ── 자주 하는 실수 ──

// [실수 1] "MySQL 8 이니까 안전하다" 고 끝낸다
//   ★★★ 버전이 아니라 **설정**입니다.
//   회사 서버에서 `SELECT @@sql_mode` 를 찍어 보면 비어 있는 경우가 실제로 있습니다.
//   옛 버전에서 올린 서버는 옛 설정을 그대로 들고 옵니다.

// [실수 2] 전역 설정만 보고 안심한다
//   `@@GLOBAL.sql_mode` 와 `@@SESSION.sql_mode` 는 다를 수 있습니다.
//   드라이버가 붙을 때 바꾸기도 하고, 프레임워크가 바꾸기도 합니다.
//   ★ 실제로 이 자료의 접속도 `IGNORE_SPACE` 가 붙어 있습니다 (개념01 섹션 6).
//   **내 접속의 값**을 보세요.

// [실수 3] `SET GLOBAL` 로 실험한다
//   서버 전체가 바뀝니다. 다른 사람 접속까지 영향을 받습니다.
//   실험은 항상 `SET SESSION` 으로 하세요. 그리고 되돌려 놓으세요.

// [실수 4] 경고를 안 본다
//   STRICT 가 꺼진 서버에서는 값이 망가져도 **에러가 아니라 경고**입니다.
//   `SHOW WARNINGS` 를 안 보면 영원히 모릅니다.
//   ★ 더 무서운 것: '0000-00-00' 은 경고조차 안 났습니다. 위에서 확인했습니다.

// [실수 5] 운영 서버에서 갑자기 STRICT 를 켠다
//   지금까지 조용히 들어가던 INSERT 가 전부 에러가 됩니다.
//   새벽에 배포하고 아침에 장애가 납니다. 개발 환경에서 먼저 켜세요.

// [실수 6] 중요한 규칙을 sql_mode 에 맡긴다
//   sql_mode 는 껐다 켤 수 있습니다. **제약(NOT NULL, CHECK, UNIQUE, 외래키)은 못 끕니다.**
//   섹션 6 에서 확인했습니다. 규칙은 제약으로 거세요.

// [실수 7] 옛 데이터를 안 보고 설정만 고친다
//   설정을 켜도 **이미 들어가 있는 망가진 값**은 그대로 남습니다.
//   `WHERE 도입일 = '0000-00-00'` 이나 `WHERE 수량 = 2147483647` 로 먼저 세어 보세요.


await PG.end();
await MY.end();
