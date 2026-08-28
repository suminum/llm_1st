// ============================================================
// 10단원 · 연습문제 — 운영과 종합 실습
// ------------------------------------------------------------
// 실행: node 연습문제.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 채점에 VACUUM 과 스키마 변경이 들어가서 25초쯤 걸립니다.
// ============================================================
//
// `// TODO:` 를 채우고 실행하면 채점 결과가 나옵니다.
// 아무것도 안 채우고 실행하면 전부 실패로 나옵니다. 그게 정상입니다.
//
// 14문제입니다. 뒤로 갈수록 어렵습니다. 마지막 세 개는 `[도전]` 입니다.
// 막히면 `연습문제_정답.js` 를 보세요. 답만 있는 게 아니라 **왜 그런지**가 적혀 있습니다.

import pg from "pg";
import { execSync } from "node:child_process";


// ── 준비 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-exercise", // ★ 영어로
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

const 스키마 = "단원10_연습";

await 연결.query(`DROP SCHEMA IF EXISTS ${스키마} CASCADE`);
await 연결.query(`CREATE SCHEMA ${스키마}`);
await 연결.query(`SET search_path TO ${스키마}`);

async function 새연결(이름표) {
  const 새것 = new pg.Client({ ...접속정보, application_name: 이름표 });
  await 새것.connect();
  await 새것.query(`SET search_path TO ${스키마}`);
  return 새것;
}

const 컨테이너 = "db-material-postgres";

function 도커(명령) {
  return execSync(`docker exec ${컨테이너} sh -c ${JSON.stringify(명령)}`, {
    encoding: "utf8",
    timeout: 120000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

// 실습용 표입니다. 05단원에서 쓰던 제조 현장 표입니다.
await 연결.query(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL
  );

  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT NOT NULL REFERENCES 라인(라인코드),
    도입가   NUMERIC(12,2) NOT NULL
  );

  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  NOT NULL REFERENCES 설비(설비번호),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL
  );

  CREATE TABLE 임시메모 (
    내용 TEXT
  );
`);

await 연결.query(`
  INSERT INTO 라인 VALUES ('A','조립1라인'), ('B','가공2라인'), ('C','포장3라인');

  INSERT INTO 설비 VALUES
    (1,'컨베이어 1호','A',12000000.00),
    (2,'프레스 1호','A',35400000.00),
    (3,'용접로봇 1호','B',88000000.00);

  INSERT INTO 점검기록
  SELECT g, (g % 3) + 1, DATE '2026-01-01' + (g % 120),
         (ARRAY['정상','주의','고장'])[(g % 3) + 1]
  FROM generate_series(1, 40000) g;
`);

await 연결.query("VACUUM ANALYZE");

const 잠깐 = (밀리초) => new Promise((끝) => setTimeout(끝, 밀리초));


// ============================================================
// 문제 1 — 백업 명령의 형식 고르기
// ============================================================
//
// 표 하나만 골라 되살릴 수 있고, 압축도 되는 pg_dump 형식은 무엇인가요?
// "plain" / "custom" / "directory" 중에 하나를 문자열로 적으세요.

const 답1 = null; // TODO: 형식 이름을 문자열로


// ============================================================
// 문제 2 — 백업을 진짜로 만들기
// ============================================================
//
// `단원10_연습.설비` 표 하나만 custom 형식으로 뽑는 pg_dump 명령을 완성하세요.
// 결과 파일은 `/tmp/연습백업.dump` 입니다.
//
// 힌트: `-t 스키마.표이름`, `--format=custom`, `-f 파일경로`
//       앞부분은 이미 적어 뒀습니다.

const 백업명령 = null; // TODO: 문자열로. `PGPASSWORD=secret pg_dump -U factory -d factory_db ...`


// ============================================================
// 문제 3 — 총 시간으로 줄 세우기
// ============================================================
//
// pg_stat_statements 를 흉내 낸 배열입니다.
// **서버 시간을 제일 많이 잡아먹는** 쿼리의 `이름` 을 돌려주세요.
//
// ★ 주의: 평균이 긴 것이 아니라 **총 시간**이 긴 것입니다.

const 쿼리통계 = [
  { 이름: "목록조회", 호출: 500000, 평균ms: 0.4 },
  { 이름: "월간집계", 호출: 12, 평균ms: 900 },
  { 이름: "상세조회", 호출: 80000, 평균ms: 1.1 },
];

function 진짜범인(통계) {
  // TODO: 총 시간(호출 × 평균ms)이 가장 큰 것의 이름을 돌려주세요
  return null;
}


// ============================================================
// 문제 4 — 지금 오래 돌고 있는 쿼리 찾기
// ============================================================
//
// `pg_stat_activity` 에서 **지금 실행 중이면서 1초 넘게 돌고 있는** 세션을 찾는
// SQL 을 쓰세요. `application_name` 이 'unit10-slowvictim' 인 것만 봅니다.
//
// 돌려줄 칸: `문장` 하나 (query 의 앞 20글자)
//
// 힌트: state = 'active', now() - query_start > interval '1 second'
//       left(query, 20) AS 문장

const 돌고있는것찾기 = null; // TODO: SQL 문자열


// ============================================================
// 문제 5 — 취소인가 강제 종료인가
// ============================================================
//
// 아래 상황에서 무엇을 써야 할까요.
// "pg_cancel_backend" 또는 "pg_terminate_backend" 를 문자열로 적으세요.
//
//   "보고서 쿼리가 10분째 돌고 있습니다. 멈추고 싶은데,
//    그 애플리케이션의 연결은 살려 두고 싶습니다."

const 답5 = null; // TODO


// ============================================================
// 문제 6 — 표 크기 재기
// ============================================================
//
// `점검기록` 표의 **본체 크기**(색인 제외)를 바이트로 돌려주는 SQL 을 쓰세요.
// 돌려줄 칸 이름은 `바이트` 이고 정수여야 합니다.
//
// 힌트: pg_relation_size('스키마.표'::regclass)::int AS 바이트
//   ★ `pg_relation_size($1)` 처럼 파라미터로 넘기면 타입 추론이 깨집니다.
//     문자열로 직접 적으세요.

const 표크기SQL = null; // TODO: SQL 문자열


// ============================================================
// 문제 7 — VACUUM 인가 VACUUM FULL 인가
// ============================================================
//
// 두 상황에 각각 "VACUUM" 또는 "VACUUM FULL" 을 넣으세요.
//
//   상황 가: "운영 중입니다. 죽은 줄이 쌓여서 표가 계속 커집니다.
//            더 커지지만 않게 하고 싶습니다."
//   상황 나: "새벽에 서비스를 30분 세울 수 있습니다.
//            디스크를 진짜로 되찾고 싶습니다."

const 답7가 = null; // TODO
const 답7나 = null; // TODO


// ============================================================
// 문제 8 — 죽은 줄이 많은 표 찾기
// ============================================================
//
// `단원10_연습` 스키마에서 **죽은 줄이 1000개를 넘는** 표를 찾는 SQL 을 쓰세요.
// 돌려줄 칸: `표` (표 이름)
//
// 힌트: pg_stat_user_tables 의 schemaname, relname, n_dead_tup

const 부푼표찾기 = null; // TODO: SQL 문자열


// ============================================================
// 문제 9 — 긴 트랜잭션 찾기
// ============================================================
//
// 청소를 막고 있을 만한 세션을 찾습니다.
// `application_name` 이 'unit10-blocker2' 이고 **트랜잭션이 열려 있는** 세션의
// `state` 를 돌려주는 SQL 을 쓰세요.
//
// 돌려줄 칸: `state`
//
// 힌트: xact_start IS NOT NULL 이면 트랜잭션이 열려 있는 것입니다

const 긴트랜잭션찾기 = null; // TODO: SQL 문자열


// ============================================================
// 문제 10 — 안전한 칸 추가
// ============================================================
//
// 운영 중인 `설비` 표에 `담당자 TEXT` 칸을 추가하려고 합니다.
// **잠금을 못 잡으면 2초 만에 포기**하도록 만드세요.
//
// 두 문장을 순서대로 배열로 돌려주세요.
//   ["SET lock_timeout = ...", "ALTER TABLE ..."]

function 안전한칸추가() {
  // TODO: 문장 두 개가 든 배열을 돌려주세요
  return null;
}


// ============================================================
// 문제 11 — 안 막는 색인 만들기
// ============================================================
//
// `점검기록(설비번호)` 에 색인을 만듭니다. 이름은 `연습_설비번호` 입니다.
// **쓰기를 막지 않는** 방법으로 만드는 SQL 한 줄을 쓰세요.

const 안막는색인 = null; // TODO: SQL 문자열


// ============================================================
// 문제 12 — [도전] 확장 → 이전 → 축소
// ============================================================
//
// `설비.이름` 을 `설비.설비명` 으로 바꾸려고 합니다.
// 무중단으로 하려면 어떤 순서여야 할까요.
//
// 아래 다섯 가지 일을 **안전한 순서**로 배열에 담으세요.
// 문자열을 그대로 쓰면 됩니다.
//
//   "옛칸지우기"      ALTER TABLE 설비 DROP COLUMN 이름
//   "새칸추가"        ALTER TABLE 설비 ADD COLUMN 설비명 TEXT
//   "값복사"          UPDATE 설비 SET 설비명 = 이름
//   "새코드배포"      새 코드가 설비명을 읽고 씁니다
//   "동기화트리거"    양쪽 칸을 자동으로 맞춰 줍니다
//
// ★ 힌트: 새 코드가 배포되기 **전에** 새 칸이 있어야 합니다.
//   그리고 옛 칸은 **모든 서버가 새 코드가 된 뒤에** 지웁니다.

const 무중단순서 = null; // TODO: 문자열 5개가 든 배열


// ============================================================
// 문제 13 — [도전] 색인 없는 외래키 찾기
// ============================================================
//
// 외래키를 걸었는데 그 칸에 색인이 없는 곳을 찾는 SQL 을 쓰세요.
// `단원10_연습` 스키마만 봅니다.
//
// 돌려줄 칸: `표` 와 `칸`
//
// 힌트: pg_constraint (contype='f', conkey[1] 이 첫 칸)
//       pg_index 에 indrelid 가 같고 indkey[0] = conkey[1] 인 것이 없으면 색인 없음
//       pg_attribute 로 칸 번호를 이름으로 바꿉니다

const 색인없는외래키찾기 = null; // TODO: SQL 문자열


// ============================================================
// 문제 14 — [도전] 코드 점검 도구
// ============================================================
//
// 소스 코드 문자열을 받아서 위험한 줄을 찾아 주는 함수를 만드세요.
//
// 찾을 것 두 가지
//   ① `SELECT *`                    → 종류 "별표"
//   ② 템플릿 문자열로 이어 붙인 SQL   → 종류 "이어붙임"
//      (SELECT/INSERT/UPDATE/DELETE 가 있는 줄에 `${` 가 있으면)
//
// 돌려줄 것: `{ 줄번호, 종류 }` 객체의 배열. 줄번호는 1부터 셉니다.
// 한 줄에 둘 다 있으면 두 개를 담습니다. 순서는 ① 다음 ② 입니다.

function 코드점검(소스) {
  // TODO: { 줄번호, 종류 } 배열을 돌려주세요
  return null;
}


// ============================================================
// 채점
// ============================================================

const 채점결과 = [];

async function 검사(번호, 이름, 할일) {
  try {
    const 통과 = await 할일();
    채점결과.push({ 번호, 이름, 통과: 통과 === true });
  } catch {
    채점결과.push({ 번호, 이름, 통과: false });
  }
}

await 검사(1, "백업 형식 고르기", async () => 답1 === "custom");

await 검사(2, "백업을 진짜로 만들기", async () => {
  if (typeof 백업명령 !== "string") return false;

  도커("rm -f /tmp/연습백업.dump");
  도커(백업명령);

  const 목록 = 도커("pg_restore -l /tmp/연습백업.dump");

  return 목록.includes("설비") && !목록.includes("점검기록");
});

await 검사(3, "총 시간으로 줄 세우기", async () => 진짜범인(쿼리통계) === "목록조회");

await 검사(4, "오래 돌고 있는 쿼리 찾기", async () => {
  if (typeof 돌고있는것찾기 !== "string") return false;

  const 피해자 = await 새연결("unit10-slowvictim");
  const 던짐 = 피해자.query("SELECT pg_sleep(20)").catch(() => {});

  await 잠깐(1400);

  const 결과 = await 연결.query(돌고있는것찾기);

  const pid = (
    await 연결.query("SELECT pid FROM pg_stat_activity WHERE application_name = 'unit10-slowvictim'")
  ).rows[0].pid;

  await 연결.query("SELECT pg_terminate_backend($1)", [pid]);
  피해자.on("error", () => {});
  await 던짐;
  await 피해자.end().catch(() => {});

  return 결과.rows.length === 1 && String(결과.rows[0].문장).includes("pg_sleep");
});

await 검사(5, "취소인가 강제 종료인가", async () => 답5 === "pg_cancel_backend");

await 검사(6, "표 크기 재기", async () => {
  if (typeof 표크기SQL !== "string") return false;

  const 결과 = await 연결.query(표크기SQL);

  return Number.isInteger(결과.rows[0].바이트) && 결과.rows[0].바이트 > 100000;
});

await 검사(7, "VACUUM 인가 VACUUM FULL 인가", async () => 답7가 === "VACUUM" && 답7나 === "VACUUM FULL");

await 검사(8, "죽은 줄이 많은 표 찾기", async () => {
  if (typeof 부푼표찾기 !== "string") return false;

  await 연결.query("UPDATE 점검기록 SET 결과 = 결과");
  await 연결.query("ANALYZE 점검기록");

  let 결과 = await 연결.query(부푼표찾기);

  for (let 다시 = 0; 결과.rows.length === 0 && 다시 < 10; 다시 += 1) {
    await 잠깐(500);
    await 연결.query("ANALYZE 점검기록");
    결과 = await 연결.query(부푼표찾기);
  }

  await 연결.query("VACUUM 점검기록");

  return 결과.rows.some((줄) => 줄.표 === "점검기록");
});

await 검사(9, "긴 트랜잭션 찾기", async () => {
  if (typeof 긴트랜잭션찾기 !== "string") return false;

  const 방해꾼 = await 새연결("unit10-blocker2");
  await 방해꾼.query("BEGIN");
  await 방해꾼.query("SELECT 1");

  const 결과 = await 연결.query(긴트랜잭션찾기);

  await 방해꾼.query("ROLLBACK");
  await 방해꾼.end();

  return 결과.rows.length === 1 && 결과.rows[0].state === "idle in transaction";
});

await 검사(10, "안전한 칸 추가", async () => {
  const 문장들 = 안전한칸추가();

  if (!Array.isArray(문장들) || 문장들.length !== 2) return false;
  if (!/lock_timeout/i.test(문장들[0])) return false;
  if (!/2\s*s|2000\s*ms/i.test(문장들[0])) return false;

  for (const 문장 of 문장들) await 연결.query(문장);

  await 연결.query("SET lock_timeout = 0");

  const 있나 = await 연결.query(`
    SELECT count(*)::int AS 개수 FROM information_schema.columns
    WHERE table_schema = '${스키마}' AND table_name = '설비' AND column_name = '담당자'
  `);

  return 있나.rows[0].개수 === 1;
});

await 검사(11, "안 막는 색인 만들기", async () => {
  if (typeof 안막는색인 !== "string") return false;
  if (!/CONCURRENTLY/i.test(안막는색인)) return false;

  await 연결.query(안막는색인);

  const 있나 = await 연결.query(`
    SELECT indisvalid FROM pg_index WHERE indexrelid = '${스키마}.연습_설비번호'::regclass
  `);

  return 있나.rows[0].indisvalid === true;
});

await 검사(12, "[도전] 확장 → 이전 → 축소", async () => {
  if (!Array.isArray(무중단순서) || 무중단순서.length !== 5) return false;

  const 자리 = (이름) => 무중단순서.indexOf(이름);

  return (
    자리("새칸추가") === 0 &&
    자리("동기화트리거") === 1 &&
    자리("값복사") === 2 &&
    자리("새코드배포") === 3 &&
    자리("옛칸지우기") === 4
  );
});

await 검사(13, "[도전] 색인 없는 외래키 찾기", async () => {
  if (typeof 색인없는외래키찾기 !== "string") return false;

  const 결과 = await 연결.query(색인없는외래키찾기);
  const 찾은것 = 결과.rows.map((줄) => `${줄.표}.${줄.칸}`).sort();

  // 설비.라인코드 는 색인이 없습니다. 점검기록.설비번호 는 문제 11 에서 만들었습니다.
  return 찾은것.includes("설비.라인코드") && !찾은것.includes("점검기록.설비번호");
});

await 검사(14, "[도전] 코드 점검 도구", async () => {
  const 소스 = [
    'const a = await 풀.query("SELECT * FROM 설비");',
    'const b = await 풀.query(`SELECT 이름 FROM 설비 WHERE 라인코드 = ${입력}`);',
    'const c = await 풀.query("SELECT 이름 FROM 설비 WHERE 라인코드 = $1", [입력]);',
    'const d = await 풀.query(`SELECT * FROM 설비 WHERE 라인코드 = ${입력}`);',
  ].join("\n");

  const 결과 = 코드점검(소스);

  if (!Array.isArray(결과)) return false;

  return JSON.stringify(결과) === JSON.stringify([
    { 줄번호: 1, 종류: "별표" },
    { 줄번호: 2, 종류: "이어붙임" },
    { 줄번호: 4, 종류: "별표" },
    { 줄번호: 4, 종류: "이어붙임" },
  ]);
});


// ── 결과 ──

for (const { 번호, 이름, 통과 } of 채점결과) {
  console.log(`${통과 ? "✓" : "✗"} ${번호}. ${이름}`);
}
// 출력: ✗ 1. 백업 형식 고르기
// 출력: ✗ 2. 백업을 진짜로 만들기
// 출력: ✗ 3. 총 시간으로 줄 세우기
// 출력: ✗ 4. 오래 돌고 있는 쿼리 찾기
// 출력: ✗ 5. 취소인가 강제 종료인가
// 출력: ✗ 6. 표 크기 재기
// 출력: ✗ 7. VACUUM 인가 VACUUM FULL 인가
// 출력: ✗ 8. 죽은 줄이 많은 표 찾기
// 출력: ✗ 9. 긴 트랜잭션 찾기
// 출력: ✗ 10. 안전한 칸 추가
// 출력: ✗ 11. 안 막는 색인 만들기
// 출력: ✗ 12. [도전] 확장 → 이전 → 축소
// 출력: ✗ 13. [도전] 색인 없는 외래키 찾기
// 출력: ✗ 14. [도전] 코드 점검 도구

const 통과수 = 채점결과.filter((줄) => 줄.통과).length;

console.log(`통과 ${통과수} / ${채점결과.length}`);
// 출력: 통과 0 / 14


// 뒷정리
도커("rm -f /tmp/연습백업.dump");
await 연결.query(`DROP SCHEMA IF EXISTS ${스키마} CASCADE`);
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ── 막혔을 때 볼 곳 ──
//
//   문제 1·2       개념01 섹션 3 (형식 세 가지)
//   문제 3         개념02 섹션 2 (총 시간이 긴 쿼리가 범인)
//   문제 4·5       개념02 섹션 4·5 (pg_stat_activity · 죽이기)
//   문제 6·7·8     개념03 섹션 2·3·4 (부풀림과 VACUUM)
//   문제 9         개념03 섹션 5 (긴 트랜잭션이 청소를 막습니다)
//   문제 10·11     개념04 섹션 3·4 (lock_timeout · CONCURRENTLY)
//   문제 12        개념04 섹션 5 (확장 → 이전 → 축소)
//   문제 13·14     개념05 섹션 8 (점검 도구)
