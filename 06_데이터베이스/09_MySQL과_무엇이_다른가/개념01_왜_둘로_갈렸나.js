// ============================================================
// 09단원 · 개념 01 — 왜 둘로 갈렸나
// ------------------------------------------------------------
// 실행: node 개념01_왜_둘로_갈렸나.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
//   PostgreSQL(5434) 과 MySQL(3307) 을 **동시에** 씁니다.
//   Docker 가 없으면 안내만 찍고 조용히 끝납니다.
// ============================================================
//
// 08단원까지는 PostgreSQL 하나만 봤습니다.
// 그런데 회사에 가면 MySQL 이 깔려 있는 경우가 아주 많습니다.
// 특히 국내 SI·제조·공공 현장이 그렇습니다.
//
// 그래서 이 단원은 **둘을 같이 띄워 놓고 나란히 실행합니다.**
// 같은 SQL 을 양쪽에 보내고, 결과를 옆에 붙여서 봅니다.
//
// 이 파일에서 할 것은 세 가지입니다.
//
//   ① 두 데이터베이스가 왜 다르게 생겼는지 — 짧게
//   ② 그 차이가 **지금도 남은 곳**과 **이미 사라진 곳**
//   ③ 이 단원의 실측 환경을 눈으로 확인하기
//
// ★ 미리 말해 둡니다. 이 단원은 어느 쪽이 낫다는 이야기가 아닙니다.
//   둘 다 훌륭한 데이터베이스입니다. **차이를 정확히 아는 것**이 목적입니다.
//   틀린 지식을 가지고 옮기면 사고가 나기 때문입니다.

import pg from "pg";
import mysql from "mysql2/promise";


// ── 섹션 0: 둘에 붙기 ──

// 이 단원 내내 쓰는 접속 정보입니다.
const 피지설정 = { host: "127.0.0.1", port: 5434, user: "factory", password: "secret", database: "factory_db" };
const 마이설정 = { host: "127.0.0.1", port: 3307, user: "factory", password: "secret", database: "factory_db" };

let PG = null;
let MY = null;

try {
  PG = new pg.Client(피지설정);
  await PG.connect();
  MY = await mysql.createConnection(마이설정);
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 분기입니다. 여기로 오면 그냥 끝냅니다.
  console.log("★ 데이터베이스에 못 붙었습니다:", 에러.code || 에러.message);
  console.log("  docker compose up -d 를 먼저 실행하세요. (docker compose ps 로 확인)");
  if (PG) await PG.end().catch(() => {});
  process.exit(0);
}

// ★ Postgres 는 07~10단원이 같은 데이터베이스를 씁니다.
//   단원끼리 표 이름이 부딪히지 않게 **자기 스키마**를 씁니다.
await PG.query("CREATE SCHEMA IF NOT EXISTS 단원09");
await PG.query("SET search_path TO 단원09");

// ★★ MySQL 에는 "스키마" 라는 칸막이가 없습니다.
//   MySQL 에서 SCHEMA 는 DATABASE 와 **같은 말**입니다. 그래서 나눌 수가 없습니다.
//   대신 표 이름 앞에 `구구_` 를 붙여서 09단원 것임을 표시합니다.
//
//   ★ 이것 자체가 첫 번째 차이입니다.
//     Postgres 는 데이터베이스 안에 스키마가 여러 개 있습니다.
//     MySQL 은 데이터베이스가 곧 스키마입니다.


// ── 섹션 0-1: 이 단원 내내 쓸 도우미 ──

// 같은 SQL 을 양쪽에 보내고 결과를 한 줄씩 찍는 함수입니다.
// **에러도 잡습니다.** 이 단원에서는 에러가 나는 것 자체가 결과입니다.

async function 피지(sql, 값 = []) {
  try {
    const 결과 = await PG.query(sql, 값);
    return { 됨: true, 값: 결과.rows };
  } catch (에러) {
    return { 됨: false, 코드: 에러.code, 말: 에러.message };
  }
}

async function 마이(sql, 값 = []) {
  try {
    const [행들] = await MY.query(sql, 값);
    return { 됨: true, 값: 행들 };
  } catch (에러) {
    // ★ MySQL 에러는 code 가 글자입니다(ER_...). 숫자는 errno 입니다.
    return { 됨: false, 코드: 에러.code, 번호: 에러.errno, 말: 에러.message };
  }
}

// 결과를 한 줄로 줄여 주는 함수입니다.
function 한줄로(결과) {
  if (결과.됨) return JSON.stringify(결과.값);
  return `거절 ${결과.코드}${결과.번호 ? "/" + 결과.번호 : ""}`;
}

// ★ 이 세 함수를 이 단원의 다섯 개 파일에서 계속 씁니다.
//   파일 하나가 스스로 완결돼야 해서 매번 다시 적습니다.


// ── 섹션 1: 두 DB 의 출신 ──

// 역사 수업이 아닙니다. **지금 코드에 남아 있는 것**만 짚습니다.
//
//   PostgreSQL
//     1986년 버클리 대학의 연구 과제(POSTGRES)에서 나왔습니다.
//     목적이 "논문에 쓸 만한 제대로 된 관계형 DB" 였습니다.
//     그래서 처음부터 **표준 SQL·타입 시스템·확장성**을 중요하게 봤습니다.
//
//   MySQL
//     1995년 스웨덴의 작은 회사에서 나왔습니다.
//     목적이 "웹사이트 뒤에 놓고 빨리 읽는 것" 이었습니다.
//     당시 웹은 대부분 **읽기만** 했습니다. 게시판, 뉴스, 쇼핑몰 목록.
//     그래서 처음에는 트랜잭션조차 없었습니다. 빠르면 됐으니까요.
//
// ★ 이 출신 차이가 만든 가장 큰 흔적이 **스토리지 엔진**입니다.
//   MySQL 은 "저장하는 부분"을 갈아 끼울 수 있게 만들었습니다.
//   초기 기본은 MyISAM 이었고, MyISAM 에는 트랜잭션이 없습니다.

const 엔진들 = await 마이(
  "SELECT ENGINE, TRANSACTIONS FROM information_schema.ENGINES WHERE SUPPORT IN ('YES','DEFAULT') ORDER BY ENGINE",
);

console.log("MySQL 이 지금 쓸 수 있는 엔진:");
// 출력: MySQL 이 지금 쓸 수 있는 엔진:

for (const 줄 of 엔진들.값) {
  console.log(`  · ${줄.ENGINE} — 트랜잭션 ${줄.TRANSACTIONS}`);
}
// 출력:   · ARCHIVE — 트랜잭션 NO
// 출력:   · BLACKHOLE — 트랜잭션 NO
// 출력:   · CSV — 트랜잭션 NO
// 출력:   · InnoDB — 트랜잭션 YES
// 출력:   · MEMORY — 트랜잭션 NO
// 출력:   · MRG_MYISAM — 트랜잭션 NO
// 출력:   · MyISAM — 트랜잭션 NO
// 출력:   · PERFORMANCE_SCHEMA — 트랜잭션 NO

const 기본엔진 = await 마이("SELECT @@default_storage_engine AS e");
console.log("MySQL 8.4 의 기본 엔진:", 기본엔진.값[0].e);
// 출력: MySQL 8.4 의 기본 엔진: InnoDB

// ★ 기본이 InnoDB 입니다. InnoDB 는 트랜잭션이 있습니다.
//   MySQL 5.5(2010년) 부터 기본이 바뀌었습니다.
//   "MySQL 은 트랜잭션이 없다" 는 말은 그때 끝난 이야기입니다.
//
// ★★ 그런데 MyISAM 은 **지금도 만들 수 있습니다.** 직접 해 봅니다.

await 마이("DROP TABLE IF EXISTS 구구_옛날표");
await 마이("CREATE TABLE 구구_옛날표 (값 INT) ENGINE=MyISAM");

await 마이("BEGIN");
await 마이("INSERT INTO 구구_옛날표 VALUES (1)");
await 마이("ROLLBACK");

const 롤백후 = await 마이("SELECT 값 FROM 구구_옛날표");
console.log("MyISAM 표에 넣고 ROLLBACK 한 뒤 남은 것:", 한줄로(롤백후));
// 출력: MyISAM 표에 넣고 ROLLBACK 한 뒤 남은 것: [{"값":1}]

// ★★★ ROLLBACK 을 했는데 **줄이 그대로 있습니다.**
//   MyISAM 에는 트랜잭션이 없어서 ROLLBACK 이 그냥 무시됩니다.
//   에러도 안 납니다. 조용히 무시합니다.
//
//   옛날 SI 프로젝트에서 만든 표가 MyISAM 이면 지금도 이렇게 동작합니다.
//   ★ 회사 표를 처음 만나면 엔진부터 확인하세요. 아래 SQL 로 봅니다.

const 엔진확인 = await 마이(
  "SELECT TABLE_NAME AS 표, ENGINE AS 엔진 FROM information_schema.TABLES WHERE TABLE_SCHEMA='factory_db' AND TABLE_NAME='구구_옛날표'",
);
console.log("표의 엔진 확인:", 한줄로(엔진확인));
// 출력: 표의 엔진 확인: [{"표":"구구_옛날표","엔진":"MyISAM"}]

await 마이("DROP TABLE 구구_옛날표");

// ★ PostgreSQL 에는 스토리지 엔진을 고르는 개념이 없습니다.
//   저장 방식이 하나뿐이고, 그것이 트랜잭션을 지원합니다.
//   "고를 수 없다" 가 여기서는 **틀릴 수 없다** 는 뜻이 됩니다.


// ── 섹션 2: 라이선스와 소유 — 실무에 영향을 주는 만큼만 ──

const 버전주석 = await 마이("SELECT @@version_comment AS c");
console.log("MySQL 이 스스로 밝히는 판(版):", 버전주석.값[0].c);
// 출력: MySQL 이 스스로 밝히는 판(版): MySQL Community Server - GPL

// 위 한 줄에 이야기가 다 들어 있습니다.
//
//   MySQL — 주인이 있습니다.
//     썬(2008) → 오라클(2010) 로 넘어갔습니다.
//     무료판(Community, GPL) 과 유료판(Enterprise) 이 따로 있습니다.
//     ★ GPL 이라 "MySQL 서버를 내 제품에 넣어서 판다" 면 라이선스를 봐야 합니다.
//       서버를 그냥 설치해서 쓰는 보통의 웹 서비스는 문제가 없습니다.
//
//   PostgreSQL — 주인이 없습니다.
//     전 세계 개발자 모임이 만듭니다. 회사가 사 갈 대상이 없습니다.
//     PostgreSQL License(BSD 계열) 라서 제품에 넣어 팔아도 됩니다.
//
// ★ MariaDB 가 왜 생겼나
//   오라클이 MySQL 을 가져가자, 원래 만들던 사람들이 소스를 복사해서
//   따로 만들기 시작했습니다. 그것이 MariaDB 입니다. (2009년)
//   초기에는 거의 같았지만 지금은 꽤 갈라졌습니다. 개념05 에서 한 문단 더 다룹니다.
//
// ★★ 실무에서 이게 왜 중요한가
//   "MySQL 이라고 들었는데 접속해 보니 MariaDB" 인 현장이 흔합니다.
//   버전 문자열을 꼭 눈으로 확인하세요. 문법이 갈리는 곳이 있습니다.


// ── 섹션 3: 설계 철학의 차이 ──

//   MySQL 의 기본값        : 속도와 단순함
//   PostgreSQL 의 기본값   : 정확함과 표준
//
// 말로만 하면 안 와닿습니다. 한 줄로 재 보겠습니다.

const 나눗셈피지 = await 피지("SELECT 1/0 AS 결과");
const 나눗셈마이 = await 마이("SELECT 1/0 AS 결과");

console.log("1 을 0 으로 나누면 — PG:", 한줄로(나눗셈피지));
// 출력: 1 을 0 으로 나누면 — PG: 거절 22012
console.log("1 을 0 으로 나누면 — MySQL:", 한줄로(나눗셈마이));
// 출력: 1 을 0 으로 나누면 — MySQL: [{"결과":null}]

// ★ 이 한 줄이 두 철학을 정확히 보여 줍니다.
//
//   PostgreSQL : "그건 계산할 수 없습니다." → 멈춥니다
//   MySQL      : "값이 없네요." → NULL 을 주고 계속 갑니다
//
//   어느 쪽이 옳을까요. **상황에 따라 다릅니다.**
//   집계 화면이라면 NULL 이 편합니다. 정산이라면 멈추는 쪽이 맞습니다.
//   ★ 중요한 건 **어느 쪽인지 알고 쓰는 것**입니다. 개념03 에서 더 팝니다.


// ── 섹션 4: ★ 철학이 남은 곳과, 이미 사라진 곳 ──

// 인터넷에 있는 MySQL 비교 글은 대부분 2010년대 초에 쓴 것입니다.
// 그때 맞던 말이 지금도 맞는지 확인해야 합니다.
//
// 먼저 **이미 사라진 것**부터 봅니다.

const 옛말들 = [
  ["MySQL 은 트랜잭션이 없다", "사라짐", "5.5(2010) 부터 기본이 InnoDB"],
  ["MySQL 은 CHECK 제약을 무시한다", "사라짐", "8.0.16(2019) 부터 진짜로 검사"],
  ["MySQL 은 이상한 값을 조용히 넣는다", "거의 사라짐", "5.7/8.0 부터 STRICT 가 기본"],
  ["MySQL 은 GROUP BY 를 아무렇게나 받는다", "사라짐", "5.7 부터 ONLY_FULL_GROUP_BY 가 기본"],
  ["MySQL 은 윈도 함수가 없다", "사라짐", "8.0(2018) 부터 있음"],
  ["MySQL 은 CTE(WITH) 가 없다", "사라짐", "8.0 부터 있음"],
];

console.log("[이미 사라진 옛말]");
// 출력: [이미 사라진 옛말]

for (const [말, 판정, 이유] of 옛말들) {
  console.log(`  · "${말}" → ${판정} (${이유})`);
}
// 출력:   · "MySQL 은 트랜잭션이 없다" → 사라짐 (5.5(2010) 부터 기본이 InnoDB)
// 출력:   · "MySQL 은 CHECK 제약을 무시한다" → 사라짐 (8.0.16(2019) 부터 진짜로 검사)
// 출력:   · "MySQL 은 이상한 값을 조용히 넣는다" → 거의 사라짐 (5.7/8.0 부터 STRICT 가 기본)
// 출력:   · "MySQL 은 GROUP BY 를 아무렇게나 받는다" → 사라짐 (5.7 부터 ONLY_FULL_GROUP_BY 가 기본)
// 출력:   · "MySQL 은 윈도 함수가 없다" → 사라짐 (8.0(2018) 부터 있음)
// 출력:   · "MySQL 은 CTE(WITH) 가 없다" → 사라짐 (8.0 부터 있음)

const 남은것들 = [
  ["|| 가 문자열 연결이 아니다", "남음", "MySQL 에서는 OR 입니다"],
  ["글자 비교가 대소문자를 무시한다", "남음", "기본 collation 이 _ci"],
  ["트랜잭션 안에서 DDL 이 안 되돌아간다", "남음", "CREATE/ALTER 가 암묵적 커밋"],
  ["RETURNING 이 없다", "남음", "INSERT 결과를 바로 못 받습니다"],
  ["부분 색인이 없다", "남음", "CREATE INDEX ... WHERE 가 문법 오류"],
  ["표 이름 대소문자가 OS 를 탄다", "남음", "리눅스와 윈도가 다르게 동작"],
];

console.log("[아직 그대로 남은 것]");
// 출력: [아직 그대로 남은 것]

for (const [말, 판정, 이유] of 남은것들) {
  console.log(`  · "${말}" → ${판정} (${이유})`);
}
// 출력:   · "|| 가 문자열 연결이 아니다" → 남음 (MySQL 에서는 OR 입니다)
// 출력:   · "글자 비교가 대소문자를 무시한다" → 남음 (기본 collation 이 _ci)
// 출력:   · "트랜잭션 안에서 DDL 이 안 되돌아간다" → 남음 (CREATE/ALTER 가 암묵적 커밋)
// 출력:   · "RETURNING 이 없다" → 남음 (INSERT 결과를 바로 못 받습니다)
// 출력:   · "부분 색인이 없다" → 남음 (CREATE INDEX ... WHERE 가 문법 오류)
// 출력:   · "표 이름 대소문자가 OS 를 탄다" → 남음 (리눅스와 윈도가 다르게 동작)

// ★★ 위 두 목록을 이 단원에서 **전부 직접 재서** 확인합니다.
//   개념02 가 "사라진 것", 개념03·04 가 "남은 것" 입니다.


// ── 섹션 5: 지금 어디에 쓰이나 — 정직하게 ──

// 국내 현장 이야기를 있는 그대로 적습니다.
//
//   MySQL 이 많은 곳
//     · SI 로 납품한 사내 시스템 (MES, ERP 애드온, 그룹웨어)
//     · 제조 현장의 설비 관리·품질 시스템 — 이 자료의 도메인이 여기입니다
//     · 공공기관 시스템 (조달 규격에 들어가 있는 경우가 많습니다)
//     · 오래된 워드프레스·그누보드 계열 웹
//
//   PostgreSQL 이 많은 곳
//     · 새로 시작하는 스타트업 서비스
//     · Supabase·Neon·Vercel·Railway 같은 요즘 호스팅
//     · 지리정보(PostGIS), 분석, 벡터 검색
//
// ★ 그래서 이 자료는 PostgreSQL 로 가르치고, MySQL 로 옮기는 법을 알려 줍니다.
//   반대로 배우면 더 어렵습니다. 이유는 개념05 에서 설명합니다.
//
// ★ 취업 관점에서 정직하게 말하면
//   국내에서 "DB 다룰 줄 안다" 는 자리 중 MySQL 을 쓰는 곳이 아직 더 많습니다.
//   그런데 **SQL 자체는 90% 가 같습니다.** 다른 10% 가 이 단원입니다.


// ── 섹션 6: ★ 이 단원의 실측 환경 ──

// 자료에 적힌 값이 어떤 환경에서 나온 것인지 밝혀 두어야 합니다.
// 값이 다르면 학생이 자기가 틀린 줄 알고 헤맵니다.

const 피지버전 = await 피지("SHOW server_version");
const 마이버전 = await 마이("SELECT version() AS v");

console.log(`PostgreSQL 버전: ${피지버전.값[0].server_version}`);
// 출력?: PostgreSQL 버전: 18.6
console.log(`MySQL 버전: ${마이버전.값[0].v}`);
// 출력?: MySQL 버전: 8.4.11

// ★ 버전은 기계마다 다를 수 있습니다. 그래서 판정을 따로 찍습니다.
const 피지주버전 = Number(피지버전.값[0].server_version.split(".")[0]);
const 마이주버전 = Number(마이버전.값[0].v.split(".")[0]);

console.log("PostgreSQL 이 14 이상인가:", 피지주버전 >= 14);
// 출력: PostgreSQL 이 14 이상인가: true
console.log("MySQL 이 8 이상인가:", 마이주버전 >= 8);
// 출력: MySQL 이 8 이상인가: true

// ★★ MySQL 은 **버전보다 설정이 중요합니다.** 이 세 줄을 꼭 보세요.

const 설정들 = await 마이(
  "SELECT @@sql_mode AS 모드, @@collation_database AS 정렬규칙, @@transaction_isolation AS 격리수준, @@lower_case_table_names AS 표이름접기",
);
const 설정 = 설정들.값[0];

console.log("MySQL sql_mode:", 설정.모드);
// 출력: MySQL sql_mode: IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
console.log("MySQL collation:", 설정.정렬규칙);
// 출력: MySQL collation: utf8mb4_0900_ai_ci
console.log("MySQL 격리수준:", 설정.격리수준);
// 출력: MySQL 격리수준: REPEATABLE-READ
console.log("MySQL lower_case_table_names:", 설정.표이름접기);
// 출력: MySQL lower_case_table_names: 0

const 피지격리 = await 피지("SHOW transaction_isolation");
console.log("PostgreSQL 격리수준:", 피지격리.값[0].transaction_isolation);
// 출력: PostgreSQL 격리수준: read committed

// ★ 벌써 두 개가 다릅니다.
//   · 격리수준 기본값이 다릅니다 (read committed vs REPEATABLE-READ) — 개념05
//   · MySQL 의 collation 이 `_ci` 로 끝납니다. 대소문자를 무시한다는 뜻입니다 — 개념03
//
// ★★ `IGNORE_SPACE` 가 sql_mode 에 보이는 것이 이상할 수 있습니다.
//   서버 전역 설정에는 없는데 접속에는 붙어 있습니다.
//   드라이버(mysql2)가 접속할 때 그 옵션을 켜기 때문입니다.
//   **접속마다 sql_mode 가 다를 수 있다** 는 뜻입니다. 개념02 에서 다시 봅니다.

const 전역모드 = await 마이("SELECT @@GLOBAL.sql_mode AS m");
console.log("서버 전역 sql_mode 에 IGNORE_SPACE 가 있나:", 전역모드.값[0].m.includes("IGNORE_SPACE"));
// 출력: 서버 전역 sql_mode 에 IGNORE_SPACE 가 있나: false
console.log("내 접속 sql_mode 에 IGNORE_SPACE 가 있나:", 설정.모드.includes("IGNORE_SPACE"));
// 출력: 내 접속 sql_mode 에 IGNORE_SPACE 가 있나: true


// ── 섹션 7: 90% 는 같습니다 ──

// 겁먹을 필요 없다는 것을 먼저 보여 드립니다.
// 03단원~05단원에서 배운 것 대부분이 그대로 통합니다.

const 같은것들 = [
  ["SELECT ... WHERE ... ORDER BY", "SELECT 1 AS x WHERE 1=1 ORDER BY x"],
  ["INNER JOIN / LEFT JOIN", "SELECT 1 AS x FROM (SELECT 1) t LEFT JOIN (SELECT 1) u ON 1=1"],
  ["GROUP BY + HAVING", "SELECT COUNT(*) AS c FROM (SELECT 1 AS v) t GROUP BY v HAVING COUNT(*)>0"],
  ["WITH (CTE)", "WITH 임시 AS (SELECT 1 AS v) SELECT v FROM 임시"],
  ["윈도 함수", "SELECT ROW_NUMBER() OVER (ORDER BY v) AS r FROM (SELECT 1 AS v) t"],
  ["CASE WHEN", "SELECT CASE WHEN 1=1 THEN 'ㅇ' ELSE 'ㅈ' END AS r"],
  ["COALESCE", "SELECT COALESCE(NULL, 7) AS r"],
  ["LIMIT / OFFSET", "SELECT 1 AS x LIMIT 1 OFFSET 0"],
];

let 같이된것 = 0;

for (const [이름, 문장] of 같은것들) {
  const 가 = await 피지(문장);
  const 나 = await 마이(문장);
  const 판정 = 가.됨 && 나.됨 ? "양쪽 다 됨" : `가:${가.됨} 나:${나.됨}`;

  if (가.됨 && 나.됨) 같이된것 += 1;
  console.log(`  ${이름} — ${판정}`);
}
// 출력:   SELECT ... WHERE ... ORDER BY — 양쪽 다 됨
// 출력:   INNER JOIN / LEFT JOIN — 양쪽 다 됨
// 출력:   GROUP BY + HAVING — 양쪽 다 됨
// 출력:   WITH (CTE) — 양쪽 다 됨
// 출력:   윈도 함수 — 양쪽 다 됨
// 출력:   CASE WHEN — 양쪽 다 됨
// 출력:   COALESCE — 양쪽 다 됨
// 출력:   LIMIT / OFFSET — 양쪽 다 됨

console.log(`${같은것들.length} 개 중 양쪽에서 그대로 도는 것: ${같이된것} 개`);
// 출력: 8 개 중 양쪽에서 그대로 도는 것: 8 개

// ★ 이게 이 단원을 배우는 자세입니다.
//   "전혀 다른 것을 새로 배운다" 가 아니라
//   **"90% 는 같고, 다른 10% 를 정확히 외운다"** 입니다.


// ── 섹션 8: 표 이름·칸 이름을 감싸는 따옴표가 다릅니다 ──

// 이건 아주 자주 걸립니다. 미리 봐 둡니다.

const 큰따옴표피지 = await 피지(`SELECT 1 AS "칸 이름"`);
const 큰따옴표마이 = await 마이(`SELECT 1 AS "칸 이름"`);
console.log("큰따옴표를 이름으로 — PG:", 한줄로(큰따옴표피지));
// 출력: 큰따옴표를 이름으로 — PG: [{"칸 이름":1}]
console.log("큰따옴표를 이름으로 — MySQL:", 한줄로(큰따옴표마이));
// 출력: 큰따옴표를 이름으로 — MySQL: [{"칸 이름":1}]

// 여기까지는 같습니다. 그런데 큰따옴표 안에 글자를 넣으면 갈립니다.

const 큰따옴표글자피지 = await 피지(`SELECT "설비" AS r`);
const 큰따옴표글자마이 = await 마이(`SELECT "설비" AS r`);
console.log(`SELECT "설비" — PG:`, 한줄로(큰따옴표글자피지));
// 출력: SELECT "설비" — PG: 거절 42703
console.log(`SELECT "설비" — MySQL:`, 한줄로(큰따옴표글자마이));
// 출력: SELECT "설비" — MySQL: [{"r":"설비"}]

// ★★★ PostgreSQL 은 큰따옴표를 **이름**으로만 봅니다. 그래서 "그런 칸 없다" 고 합니다.
//   MySQL 은 큰따옴표를 **글자**로도 받습니다.
//   → 글자는 항상 작은따옴표를 쓰세요. 그러면 양쪽에서 같습니다.

const 역따옴표피지 = await 피지("SELECT 1 AS `칸`");
const 역따옴표마이 = await 마이("SELECT 1 AS `칸`");
console.log("역따옴표(`) — PG:", 한줄로(역따옴표피지));
// 출력: 역따옴표(`) — PG: 거절 42601
console.log("역따옴표(`) — MySQL:", 한줄로(역따옴표마이));
// 출력: 역따옴표(`) — MySQL: [{"칸":1}]

// ★ 역따옴표는 MySQL 전용입니다. PostgreSQL 은 문법 오류입니다.
//   MySQL 예제를 인터넷에서 복사해 오면 여기서 먼저 터집니다.


// ============================================================
// 정리 — 왜 둘로 갈렸나
// ============================================================
//
//   항목            PostgreSQL                MySQL
//   ────────────────────────────────────────────────────────────
//   출신            1986 대학 연구            1995 웹 회사
//   목표            정확함·표준               속도·단순함
//   주인            없음(커뮤니티)            오라클
//   라이선스        PostgreSQL License        GPL(무료) + 상용
//   저장 방식       하나뿐                    엔진을 고름(기본 InnoDB)
//   스키마          DB 안에 여러 개           DB 가 곧 스키마
//   이름 감싸기     "큰따옴표"                `역따옴표`
//   0 으로 나누기   거절                      NULL
//   기본 격리수준   read committed            REPEATABLE-READ
//
// ★ 그리고 SQL 의 90% 는 같습니다. 위에서 8개를 재서 확인했습니다.
//
// ★★ 다음 파일이 이 단원의 핵심입니다.
//   개념02 에서 **"MySQL 은 허술하다"는 옛말을 직접 뒤집습니다.**


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 1 의 MyISAM 실험을 InnoDB 로 바꿔 보세요.
//                    `ENGINE=MyISAM` 을 `ENGINE=InnoDB` 로만 고치면 됩니다.
//                    ROLLBACK 뒤에 줄이 남나요? 남지 않아야 정상입니다.
//
// ✏️ 직접 해보기 2 — 섹션 7 의 `같은것들` 목록에 SQL 을 세 개 더 넣어 보세요.
//                    (힌트: `DISTINCT`, `UNION ALL`, `EXISTS`)
//                    양쪽에서 다 되나요? 안 되는 것을 찾으면 그것이 이 단원의 재료입니다.
//
// ✏️ 직접 해보기 3 — `SELECT @@sql_mode` 를 찍고, 각 항목을 검색해 보세요.
//                    `NO_ZERO_DATE` 가 무슨 뜻인지 말로 설명할 수 있나요?
//
// ✏️ 직접 해보기 4 — Postgres 에서 `SHOW ALL` 을 실행해 보세요. 설정이 몇 개인가요?
//                    MySQL 에서는 `SHOW VARIABLES` 입니다. 어느 쪽이 많나요?
//
// ✏️ 직접 해보기 5 — `SELECT version()` 을 양쪽에서 실행해 보세요.
//                    MySQL 쪽 결과에 "MariaDB" 라는 글자가 들어 있나요?
//                    (이 자료의 docker 환경은 진짜 MySQL 이라 없습니다.
//                     회사 서버에서는 꼭 확인해 보세요)
//
// ✏️ 직접 해보기 6 — 섹션 8 을 응용해서, 이름에 공백이 들어간 표를 양쪽에서 만들어 보세요.
//                    `CREATE TABLE "점검 기록" (...)` 과 ``CREATE TABLE `점검 기록` (...)``.
//                    ★ 그리고 **실무에서는 이름에 공백을 쓰지 마세요.** 고생만 합니다.


// ── 자주 하는 실수 ──

// [실수 1] 인터넷의 오래된 비교 글을 그대로 믿는다
//   "MySQL 은 트랜잭션이 없다", "CHECK 를 무시한다" 는 **끝난 이야기**입니다.
//   글의 작성 연도를 먼저 보세요. 2015년 이전 글은 절반이 틀립니다.

// [실수 2] MySQL 을 "허술한 DB" 로 깎아내린다
//   면접에서 이렇게 말하면 감점입니다. 8.4 는 엄격합니다.
//   차이는 **엄격함**이 아니라 **기본값과 없는 기능**입니다.

// [실수 3] 버전만 보고 안심한다
//   ★★ MySQL 은 같은 8.4 라도 `sql_mode` 에 따라 완전히 다르게 동작합니다.
//   버전이 아니라 **설정**을 확인하세요. 개념02 에서 직접 재 봅니다.

// [실수 4] MySQL 인 줄 알았는데 MariaDB
//   `SELECT version()` 을 안 찍어 봐서 나중에 문법이 안 맞아 고생합니다.
//   접속하자마자 버전 문자열부터 보는 습관을 들이세요.

// [실수 5] 표 이름을 역따옴표로 감싼 SQL 을 Postgres 에 그대로 붙인다
//   `SELECT * FROM \`설비\`` 는 Postgres 에서 42601 문법 오류입니다.
//   반대로 `SELECT * FROM "설비"` 는 MySQL 에서 돌긴 하지만
//   `ANSI_QUOTES` 모드가 아니면 의미가 달라질 수 있습니다.

// [실수 6] 스키마와 데이터베이스를 같은 말로 안다
//   Postgres 에서는 다릅니다. 하나의 데이터베이스 안에 스키마가 여럿입니다.
//   MySQL 에서는 같은 말입니다. `CREATE SCHEMA` = `CREATE DATABASE` 입니다.


await PG.end();
await MY.end();
