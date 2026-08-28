// ============================================================
// 10단원 · 개념 01 — 백업과 복구
// ------------------------------------------------------------
// 실행: node 개념01_백업과_복구.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
//   pg_dump / pg_restore 를 컨테이너 안에서 실제로 돌립니다.
// ★ 표를 진짜로 지우고 진짜로 되살립니다. 10초쯤 걸립니다.
// ============================================================
//
// 여기서부터 마지막 단원입니다.
// 01~09단원이 **만드는 법**이었다면, 10단원은 **망가뜨리지 않고 굴리는 법**입니다.
//
// 그 첫 번째가 백업입니다. 규칙은 한 문장입니다.
//
//   ★★★ **백업은 복구를 해 봐야 백업입니다.**
//
//   복구해 본 적 없는 백업은 백업이 아니라 백업이라는 **믿음**입니다.
//   매일 밤 백업이 돌고 있었는데 3년째 빈 파일이었다는 이야기는 흔합니다.
//
// 01단원이 이런 빚을 남겼습니다. 섹션 1 에서 눈으로 갚습니다.
//
//   [실수 5] 백업을 파일 복사로 함
//     복사하는 중에 누가 쓰면 **반쯤 쓰인 파일** 이 복사됩니다.
//     그 백업은 복구할 때 깨져 있습니다. 10단원에서 제대로 합니다.

import pg from "pg";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";


// ── 섹션 0: 연결 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다. 이미 깔린 DB 와 안 부딪히게 비켜 놨습니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-backup", // ★ 이름표는 영어로. 한글은 16진수로 깨져 보입니다
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

// ★★ 07~10단원이 같은 데이터베이스를 씁니다.
//   단원끼리 표 이름이 부딪히지 않게 **자기 스키마**를 씁니다.
await 연결.query("CREATE SCHEMA IF NOT EXISTS 단원10");
await 연결.query("SET search_path TO 단원10");

// pg_dump 는 컨테이너 **안에** 들어 있습니다. docker exec 로 부릅니다.
const 컨테이너 = "db-material-postgres";

function 도커(명령) {
  return execSync(`docker exec ${컨테이너} sh -c ${JSON.stringify(명령)}`, {
    encoding: "utf8",
    timeout: 120000,
    maxBuffer: 32 * 1024 * 1024, // ★ 백업 파일은 큽니다. 기본 1MB 로는 터집니다
  });
}

try {
  도커("echo ok");
} catch {
  // 검증무시: docker 명령을 못 쓰는 환경을 위한 안내입니다. 정상 종료합니다.
  console.log(`docker exec 를 쓸 수 없습니다. 컨테이너 이름이 ${컨테이너} 인지 확인하세요.`);
  console.log("  docker compose up -d");
  await 연결.end();
  process.exit(0);
}

console.log("연결됐습니다.");
// 출력: 연결됐습니다.


// ── 섹션 1: ★★★ 왜 파일 복사로 백업하면 안 되는가 ──

// 01단원의 빚을 갚습니다.
//
// "데이터베이스 파일을 그냥 cp 로 복사해 두면 되지 않나요?"
// 안 됩니다. 두 가지 이유가 있고, 둘 다 여기서 직접 보여 드립니다.

const 실습방 = fs.mkdtempSync(path.join(os.tmpdir(), "db10-백업-"));

// ── ① 반쯤 쓰인 파일이 복사됩니다 ──
//
// 프로그램은 파일을 **한 번에** 쓰지 않습니다. 조각을 여러 번 나눠 씁니다.
// 데이터베이스 파일은 수 기가바이트라 더 잘게 나뉩니다.
// 그 조각과 조각 **사이**에 백업이 복사를 하면 어떻게 될까요.

const 원본파일 = path.join(실습방, "설비.json");
const 쓸내용 = JSON.stringify(
  [
    { 번호: 1, 이름: "프레스1호" },
    { 번호: 2, 이름: "프레스2호" },
    { 번호: 3, 이름: "절삭기1호" },
  ],
  null,
  1,
);

const 파일손잡이 = fs.openSync(원본파일, "w");
const 절반 = Math.floor(쓸내용.length / 2);

fs.writeSync(파일손잡이, 쓸내용.slice(0, 절반)); // ① 앞부분을 씁니다
const 중간에복사한것 = fs.readFileSync(원본파일, "utf8"); // ★ 백업이 하필 지금 복사합니다
fs.writeSync(파일손잡이, 쓸내용.slice(절반)); // ② 나머지를 씁니다
fs.closeSync(파일손잡이);

const 다쓴것 = fs.readFileSync(원본파일, "utf8");

console.log(`다 쓴 파일: ${다쓴것.length}글자 / 중간에 복사한 것: ${중간에복사한것.length}글자`);
// 출력: 다 쓴 파일: 104글자 / 중간에 복사한 것: 52글자

const 읽어보기 = (글) => {
  try {
    JSON.parse(글);
    return "읽힘";
  } catch (에러) {
    return 에러.constructor.name;
  }
};

console.log("다 쓴 것을 읽으면:", 읽어보기(다쓴것));
// 출력: 다 쓴 것을 읽으면: 읽힘

console.log("중간에 복사한 것을 읽으면:", 읽어보기(중간에복사한것));
// 출력: 중간에 복사한 것을 읽으면: SyntaxError

// ★ 절반만 복사됐습니다. 이 파일은 열리지 않습니다.
//   그런데 **복사는 성공했습니다.** 에러도 안 났습니다. 크기도 그럴듯합니다.
//   깨진 걸 아는 순간은 복구가 필요한 그날 새벽 3시입니다.


// ── ② 표가 여러 개면 더 나쁩니다 ──
//
// 이게 진짜 무서운 쪽입니다.
//
// Postgres 는 표마다 파일이 따로 있습니다. `cp -r` 은 **하나씩 차례대로** 복사합니다.
// 첫 파일과 마지막 파일 사이에 몇 초가 흐르고, 그 사이에 트랜잭션이 지나갑니다.

const 창고파일 = path.join(실습방, "창고.json");
const 라인파일 = path.join(실습방, "라인.json");

fs.writeFileSync(창고파일, JSON.stringify({ 수량: 100 }));
fs.writeFileSync(라인파일, JSON.stringify({ 수량: 0 }));

const 진짜합계 = () =>
  JSON.parse(fs.readFileSync(창고파일, "utf8")).수량 +
  JSON.parse(fs.readFileSync(라인파일, "utf8")).수량;

console.log("옮기기 전 — 창고 100 + 라인 0 = 총", 진짜합계(), "개");
// 출력: 옮기기 전 — 창고 100 + 라인 0 = 총 100 개

// 백업이 창고.json 을 먼저 복사합니다.
const 창고사본 = fs.readFileSync(창고파일, "utf8");

// ★ 하필 그 사이에 "창고에서 라인으로 30개 옮기기" 가 일어납니다.
//   두 파일을 고쳐야 하는 한 건의 작업입니다. (07단원의 그 트랜잭션입니다)
fs.writeFileSync(창고파일, JSON.stringify({ 수량: 70 }));
fs.writeFileSync(라인파일, JSON.stringify({ 수량: 30 }));

// 백업이 이어서 라인.json 을 복사합니다.
const 라인사본 = fs.readFileSync(라인파일, "utf8");

const 사본합계 = JSON.parse(창고사본).수량 + JSON.parse(라인사본).수량;

console.log("옮긴 뒤 진짜 총 수량:", 진짜합계(), "개 / 백업 사본의 총 수량:", 사본합계, "개");
// 출력: 옮긴 뒤 진짜 총 수량: 100 개 / 백업 사본의 총 수량: 130 개

console.log("백업 사본에서 수량이 맞나:", 사본합계 === 100);
// 출력: 백업 사본에서 수량이 맞나: false

console.log("없던 30개가 생겼나:", 사본합계 === 130);
// 출력: 없던 30개가 생겼나: true

// ★★★ 백업 안에 **없던 재고 30개**가 생겼습니다.
//
//   창고는 옮기기 **전**(100) 으로 찍혔고, 라인은 옮긴 **후**(30) 로 찍혔습니다.
//   둘 다 각각은 멀쩡한 파일입니다. 열립니다. 에러도 없습니다.
//   그런데 합치면 말이 안 됩니다.
//
//   이걸 돈으로 바꿔 보세요. 계좌 A 에서 계좌 B 로 이체하는 중에 백업을 떴습니다.
//   복구하면 **돈이 복제돼 있습니다.** 그리고 아무도 눈치채지 못합니다.
//
// ★★ 그래서 백업 도구가 따로 있는 것입니다.
//   백업 도구는 **한 시점**을 잡습니다. 07단원에서 배운 그 스냅샷입니다.
//   pg_dump 는 트랜잭션을 하나 열고 그 안에서 전부 읽습니다.
//   그래서 50개 표를 10분에 걸쳐 읽어도 전부 **같은 순간**의 모습입니다.


// ── 섹션 2: pg_dump — 논리 백업 만들기 ──

// 실습할 데이터를 만듭니다. 05단원에서 쓰던 그 제조 현장 표입니다.
await 연결.query("DROP TABLE IF EXISTS 점검기록, 설비, 라인 CASCADE");

await 연결.query(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    동       TEXT NOT NULL
  );

  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT REFERENCES 라인(라인코드),
    도입가   NUMERIC(12,2) NOT NULL CHECK (도입가 > 0)
  );

  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  REFERENCES 설비(설비번호),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL
  );
`);

await 연결.query(`
  INSERT INTO 라인 VALUES ('A','조립1라인','1동'), ('B','가공2라인','1동'), ('C','포장3라인','2동');

  INSERT INTO 설비 VALUES
    (1,'컨베이어 1호','A',12000000.00),
    (2,'프레스 1호',  'A',35400000.00),
    (3,'용접로봇 1호','B',88000000.00),
    (4,'포장기 1호',  'C',9500000.00);

  INSERT INTO 점검기록
  SELECT g, (g % 4) + 1, DATE '2026-01-01' + (g % 90), (ARRAY['정상','주의','고장'])[(g % 3) + 1]
  FROM generate_series(1, 2000) g;
`);

const 원래건수 = await 연결.query(`
  SELECT (SELECT count(*)::int FROM 라인)     AS 라인,
         (SELECT count(*)::int FROM 설비)     AS 설비,
         (SELECT count(*)::int FROM 점검기록) AS 점검기록
`);

console.log("백업 전 건수:", JSON.stringify(원래건수.rows[0]));
// 출력: 백업 전 건수: {"라인":3,"설비":4,"점검기록":2000}

// ★ pg_dump 는 **SQL 문장으로** 백업합니다. 이걸 논리 백업이라고 합니다.
//   결과물은 "이 표를 만들고, 이 값들을 넣어라" 라는 지시서입니다.

const 백업경로 = "/tmp/단원10백업";
도커(`rm -rf ${백업경로} && mkdir -p ${백업경로}`);

// ★ `-t` 로 이 파일이 만든 표 세 개만 지정합니다.
//   `-n 단원10` 만 주면 이 단원의 다른 파일이 만든 표까지 딸려 옵니다.
const 표지정 = "-t 단원10.라인 -t 단원10.설비 -t 단원10.점검기록";

도커(
  `PGPASSWORD=secret pg_dump -U factory -d factory_db ${표지정} ` +
    `--format=plain -f ${백업경로}/전체.sql`,
);

// 백업 파일 안에 무엇이 들어 있는지 봅니다.
// ★ 파일 전체를 읽어 오면 큽니다. 컨테이너 안에서 필요한 줄만 골라 옵니다.
const 문장들 = 도커(`grep -E '^(CREATE TABLE|COPY)' ${백업경로}/전체.sql`)
  .split("\n")
  .filter((줄) => 줄.trim());

for (const 줄 of 문장들.slice(0, 6)) console.log("·", 줄.slice(0, 62));
// 출력: · CREATE TABLE "단원10"."라인" (
// 출력: · CREATE TABLE "단원10"."설비" (
// 출력: · CREATE TABLE "단원10"."점검기록" (
// 출력: · COPY "단원10"."라인" ("라인코드", "이름", "동") FROM stdin;
// 출력: · COPY "단원10"."설비" ("설비번호", "이름", "라인코드", "도입가") FROM stdin;
// 출력: · COPY "단원10"."점검기록" ("점검번호", "설비번호", "점검일", "결과") FROM stdin;

console.log("백업이 사람이 읽을 수 있는 SQL 인가:", 문장들.some((줄) => 줄.startsWith("CREATE TABLE")));
// 출력: 백업이 사람이 읽을 수 있는 SQL 인가: true

// ★ 값은 INSERT 가 아니라 COPY 로 들어갑니다. COPY 가 훨씬 빠릅니다. (03단원)
//   `--inserts` 를 주면 INSERT 문으로 뽑을 수 있지만 아주 느립니다.
//   다른 데이터베이스로 옮길 때가 아니면 쓰지 마세요.


// ── 섹션 3: 형식 세 가지 ──

// pg_dump 는 형식이 세 가지입니다. 셋 다 만들어 보고 크기를 잽니다.

도커(
  `PGPASSWORD=secret pg_dump -U factory -d factory_db ${표지정} ` +
    `--format=custom -f ${백업경로}/전체.dump`,
);

도커(
  `PGPASSWORD=secret pg_dump -U factory -d factory_db ${표지정} ` +
    `--format=directory -f ${백업경로}/전체디렉터리`,
);

const 크기재기 = (경로) => Number(도커(`du -sk ${경로} | cut -f1`).trim());

const 평문크기 = 크기재기(`${백업경로}/전체.sql`);
const 커스텀크기 = 크기재기(`${백업경로}/전체.dump`);
const 디렉터리크기 = 크기재기(`${백업경로}/전체디렉터리`);

console.log(`plain ${평문크기}KB · custom ${커스텀크기}KB · directory ${디렉터리크기}KB`);
// 출력?: plain 52KB · custom 12KB · directory 28KB

console.log("custom 이 plain 보다 작은가:", 커스텀크기 < 평문크기);
// 출력: custom 이 plain 보다 작은가: true

// ★ 안의 파일 이름은 내부 번호라 뽑을 때마다 바뀝니다. 개수와 목차 파일만 봅니다.
const 디렉터리안 = 도커(`ls ${백업경로}/전체디렉터리`).trim().split("\n");

console.log(`directory 안 — 자료파일 ${디렉터리안.filter((이름) => 이름.endsWith(".dat.gz")).length}개 + 목차(toc.dat) ${디렉터리안.includes("toc.dat")}`);
// 출력: directory 안 — 자료파일 3개 + 목차(toc.dat) true

//   형식        확장자      복구 도구      골라 넣기   압축   병렬
//   ─────────────────────────────────────────────────────────────────
//   plain       .sql        psql           ✗          ✗      ✗
//   custom      .dump       pg_restore     ✓          ✓      복구만
//   directory   폴더        pg_restore     ✓          ✓      ✓ 양쪽
//
// ★ 기본으로 **custom** 을 쓰세요.
//   압축되고, 표 하나만 골라 복구할 수 있고, 목록을 볼 수 있습니다.
//
// ★ 표가 수백 개인 큰 DB 는 **directory** 에 `-j 4` 를 붙이세요. 백업도 병렬로 됩니다.
//
// ★ plain 은 `psql < 파일` 로 밀어 넣는 것 말고는 할 수 있는 게 없습니다.
//   대신 사람이 읽을 수 있어서 "그때 그 표가 어떻게 생겼더라" 를 확인하기 좋습니다.

// custom 형식은 목록을 볼 수 있습니다. 이게 유용합니다.
const 목차 = 도커(`pg_restore -l ${백업경로}/전체.dump`)
  .split("\n")
  .filter((줄) => 줄.trim() && !줄.startsWith(";"))
  // ★ 앞의 숫자들은 내부 번호(OID)라 돌릴 때마다 바뀝니다. 종류와 이름만 봅니다.
  .map((줄) => 줄.split(" ").slice(3).join(" "))
  .filter((줄) => 줄.startsWith("TABLE") || 줄.startsWith("CONSTRAINT") || 줄.startsWith("FK"));

for (const 줄 of 목차) console.log("·", 줄);
// 출력: · TABLE 단원10 라인 factory
// 출력: · TABLE 단원10 설비 factory
// 출력: · TABLE 단원10 점검기록 factory
// 출력: · TABLE DATA 단원10 라인 factory
// 출력: · TABLE DATA 단원10 설비 factory
// 출력: · TABLE DATA 단원10 점검기록 factory
// 출력: · CONSTRAINT 단원10 라인 라인_pkey factory
// 출력: · CONSTRAINT 단원10 설비 설비_pkey factory
// 출력: · CONSTRAINT 단원10 점검기록 점검기록_pkey factory
// 출력: · FK CONSTRAINT 단원10 설비 설비_라인코드_fkey factory
// 출력: · FK CONSTRAINT 단원10 점검기록 점검기록_설비번호_fkey factory


// ── 섹션 4: ★★★ 진짜로 날리고 진짜로 되살리기 ──

// 여기가 이 파일에서 제일 중요한 섹션입니다.
//
// 백업 파일이 생겼고 크기도 그럴듯합니다.
// **그런데 이게 진짜 백업인지는 아직 모릅니다.** 확인하는 방법은 복구해 보는 것뿐입니다.

await 연결.query("DROP TABLE 점검기록, 설비, 라인 CASCADE");

// 정말 없어졌는지 확인합니다.
let 지운뒤코드 = null;

try {
  await 연결.query("SELECT count(*) FROM 점검기록");
} catch (에러) {
  지운뒤코드 = 에러.code;
}

console.log("표를 지운 뒤 조회하면 에러코드:", 지운뒤코드, "(42P01 = 없는 표)");
// 출력: 표를 지운 뒤 조회하면 에러코드: 42P01 (42P01 = 없는 표)

// ★ 이제 정말 없습니다. 2000건이 사라졌습니다.
//   운영에서 이런 일이 나면 심장이 멎습니다. 백업으로 되살립니다.

도커(`PGPASSWORD=secret pg_restore -U factory -d factory_db ${백업경로}/전체.dump`);

const 복구건수 = await 연결.query(`
  SELECT (SELECT count(*)::int FROM 라인)     AS 라인,
         (SELECT count(*)::int FROM 설비)     AS 설비,
         (SELECT count(*)::int FROM 점검기록) AS 점검기록
`);

console.log("복구 후 건수:", JSON.stringify(복구건수.rows[0]));
// 출력: 복구 후 건수: {"라인":3,"설비":4,"점검기록":2000}

console.log("건수가 원래와 똑같은가:", JSON.stringify(복구건수.rows[0]) === JSON.stringify(원래건수.rows[0]));
// 출력: 건수가 원래와 똑같은가: true

// 건수만 같으면 안 됩니다. 값도 봐야 합니다.
const 복구값 = await 연결.query("SELECT 이름, 도입가 FROM 설비 WHERE 설비번호 = 3");

console.log("복구된 설비 3번:", JSON.stringify(복구값.rows[0]));
// 출력: 복구된 설비 3번: {"이름":"용접로봇 1호","도입가":"88000000.00"}

// ★ `도입가` 가 문자열 "88000000.00" 으로 옵니다. 숫자가 아닙니다.
//   NUMERIC 은 `pg` 에서 항상 string 입니다. 02단원에서 본 그대로입니다.
//   돈은 NUMERIC 으로 저장하고 문자열로 받아서 계산도 문자열 기반으로 하세요.

// 제약도 같이 살아났는지 봅니다. 이걸 안 보고 넘어가는 사람이 많습니다.
const 제약수 = await 연결.query(`
  SELECT count(*)::int AS 개수 FROM pg_constraint
  WHERE connamespace = '단원10'::regnamespace AND contype IN ('p','f','c')
`);

console.log("살아난 제약(기본키·외래키·CHECK) 개수:", 제약수.rows[0].개수);
// 출력: 살아난 제약(기본키·외래키·CHECK) 개수: 6

// 외래키가 진짜로 도는지 찔러 봅니다.
let 외래키코드 = null;

try {
  await 연결.query("INSERT INTO 설비 VALUES (99,'없는라인설비','Z',1000.00)");
} catch (에러) {
  외래키코드 = 에러.code;
}

console.log("없는 라인으로 넣어 보면:", 외래키코드, "(23503 = 외래키 위반)");
// 출력: 없는 라인으로 넣어 보면: 23503 (23503 = 외래키 위반)

// ★★ **이제 이건 백업입니다.** 복구해 봤으니까요.
//   건수 · 값 · 제약이 전부 돌아왔습니다.


// ── 섹션 5: 표 하나만 골라 복구하기 ──

// 실수로 표 하나만 날렸는데 전체를 되돌리면 다른 표의 최신 데이터가 사라집니다.
// custom / directory 형식은 골라서 복구할 수 있습니다.

await 연결.query("DELETE FROM 점검기록");

console.log("점검기록을 비운 뒤:", (await 연결.query("SELECT count(*)::int AS 수 FROM 점검기록")).rows[0].수, "건");
// 출력: 점검기록을 비운 뒤: 0 건

// ★ `--data-only` 는 표를 다시 만들지 않고 값만 넣습니다.
//   표가 이미 있으니까요. 이걸 빼면 "이미 있다"(42P07) 로 실패합니다.
도커(
  `PGPASSWORD=secret pg_restore -U factory -d factory_db ` +
    `--data-only --table=점검기록 ${백업경로}/전체.dump`,
);

console.log("점검기록만 복구한 뒤:", (await 연결.query("SELECT count(*)::int AS 수 FROM 점검기록")).rows[0].수, "건");
// 출력: 점검기록만 복구한 뒤: 2000 건

console.log("다른 표는 그대로인가 (설비 4건):", (await 연결.query("SELECT count(*)::int AS 수 FROM 설비")).rows[0].수 === 4);
// 출력: 다른 표는 그대로인가 (설비 4건): true

// ★★ `--data-only` 로 값을 넣을 때 **이미 값이 있으면 중복**이 됩니다.
//   기본키가 있으면 23505 로 실패하고, 없으면 조용히 두 배가 됩니다.
//   비우고 넣거나, 새 스키마에 복구해서 옮기세요.


// ── 섹션 6: 논리 백업 vs 물리 백업 ──

// 지금까지 한 것은 **논리 백업**입니다. SQL 문장으로 뽑았습니다.
// 다른 방법이 있습니다. **물리 백업** — 데이터 파일을 통째로 가져가는 것입니다.
//
// "그거 섹션 1 에서 안 된다고 하지 않았나요?"
// 맞습니다. **그냥 cp 로 하면** 안 됩니다. 그래서 전용 도구 `pg_basebackup` 을 씁니다.

const 물리도구 = 도커("pg_basebackup --version").trim().split(" ")[0];

console.log("물리 백업 도구가 컨테이너에 있나:", 물리도구 === "pg_basebackup");
// 출력: 물리 백업 도구가 컨테이너에 있나: true

// ★ pg_basebackup 이 cp 와 다른 점
//
//   ① 시작할 때 서버에 "지금부터 백업이야" 라고 알립니다 (백업 모드)
//   ② 파일을 복사하는 **동안 일어난 변경**을 WAL 로 같이 받아 갑니다
//   ③ 그래서 복구할 때 그 WAL 을 다시 적용해 **찢어진 부분을 꿰맵니다**
//
//   섹션 1 의 "창고 100 + 라인 30 = 130" 문제를 ③ 이 고칩니다.
//   찢어진 채로 복사되긴 하는데, 꿰맬 실을 같이 가져가는 것입니다.

//   항목            논리 백업 (pg_dump)          물리 백업 (pg_basebackup)
//   ────────────────────────────────────────────────────────────────────────
//   담는 것          SQL 문장                     데이터 파일 통째로
//   크기            작다 (압축·색인 제외)          크다 (색인까지 전부)
//   속도            느리다 (읽어서 다시 씀)        빠르다 (그냥 복사)
//   복구 단위        표 하나도 가능                DB 전체만
//   버전 이동        ✓ 18 → 19 로 옮길 수 있다     ✗ 같은 버전이어야 한다
//   다른 기계        ✓ 어디든                     ✗ 같은 아키텍처만
//   시점 복구        ✗ 백업 시점만                 ✓ WAL 과 합치면 아무 순간
//
// ★★ 언제 무엇을 쓰나
//   · 100GB 미만 · 하루 한 번이면 충분      → pg_dump (custom)
//   · 수백 GB 이상 · 복구가 몇 분 안이어야  → pg_basebackup + WAL 보관
//   · 버전을 올리거나 다른 서버로 이사      → pg_dump (이것뿐입니다)
//   · 중요한 서비스                        → ★ **둘 다** 하세요


// ── 섹션 7: ★ WAL 과 시점 복구(PITR) ──

// 07단원이 "갑자기 꺼져도 WAL 을 읽어 복구합니다. 10단원에서 다시 봅니다" 라고 미뤘던 것입니다.
//
// Postgres 는 표를 고치기 **전에** "이렇게 고칠 거야" 를 먼저 다른 파일에 적습니다.
// 그게 WAL(Write-Ahead Log, 미리 쓰는 기록)입니다.
// 순서가 핵심입니다. **적고 나서 고칩니다.** 반대가 아닙니다.

const 왈설정 = await 연결.query(`
  SELECT current_setting('wal_level')   AS 수준,
         current_setting('archive_mode') AS 보관,
         current_setting('fsync')        AS 확실히쓰기
`);

console.log("WAL 설정:", JSON.stringify(왈설정.rows[0]));
// 출력: WAL 설정: {"수준":"replica","보관":"off","확실히쓰기":"on"}

// WAL 이 진짜로 쌓이는지 재 봅니다.
await 연결.query("CREATE TABLE IF NOT EXISTS 왈시험 (번호 INT, 값 TEXT)");

const 넣기전 = (await 연결.query("SELECT pg_current_wal_lsn() AS 위치")).rows[0].위치;
await 연결.query("INSERT INTO 왈시험 SELECT g, '값' || g FROM generate_series(1, 20000) g");
const 넣은뒤 = (await 연결.query("SELECT pg_current_wal_lsn() AS 위치")).rows[0].위치;

const 늘어난양 = await 연결.query("SELECT pg_wal_lsn_diff($1, $2)::int AS 바이트", [넣은뒤, 넣기전]);

console.log(`2만 건 넣었더니 WAL 이 ${Math.round(늘어난양.rows[0].바이트 / 1024)}KB 늘었습니다`);
// 출력?: 2만 건 넣었더니 WAL 이 1410KB 늘었습니다

console.log("WAL 이 늘어났나:", 늘어난양.rows[0].바이트 > 0);
// 출력: WAL 이 늘어났나: true

await 연결.query("DROP TABLE 왈시험");

// ★★ 이 WAL 을 **버리지 않고 모아 두면** 놀라운 일이 가능해집니다.
//
//   일요일 새벽 2시   pg_basebackup 으로 통째로 백업
//   그 뒤 계속        WAL 을 전부 다른 곳에 보관 (archive_mode = on)
//
//   수요일 오후 3시 10분에 누가 `DELETE FROM 주문;` 을 WHERE 없이 쳤습니다.
//
//   ① 일요일 백업을 복구합니다
//   ② 보관해 둔 WAL 을 **오후 3시 09분까지만** 다시 적용합니다
//   ③ 3시 09분의 데이터베이스가 됩니다. 그 DELETE 는 없던 일이 됩니다
//
//   이걸 **시점 복구(PITR, Point-In-Time Recovery)** 라고 합니다.
//   "어제 오후 3시로 돌려 주세요" 가 진짜로 되는 이유가 이것입니다.
//
// ★ 설정은 이렇게 생겼습니다. (이 자료의 컨테이너는 꺼 놨습니다)
//
//   postgresql.conf
//     wal_level = replica
//     archive_mode = on
//     archive_command = 'test ! -f /보관/%f && cp %p /보관/%f'
//
//   복구할 때 recovery 설정
//     restore_command = 'cp /보관/%f %p'
//     recovery_target_time = '2026-08-26 15:09:00'
//
// ★★ WAL 을 보관하지 않으면 PITR 은 **불가능합니다.** 나중에 켤 수도 없습니다.
//   지난주 WAL 은 이미 지워졌으니까요. 켜 두는 것 말고는 방법이 없습니다.
//
// ★ 요즘은 손으로 안 합니다. pgBackRest, Barman, WAL-G 같은 도구가
//   백업 · WAL 보관 · 보관 기간 관리 · 복구 검증까지 해 줍니다. 운영이라면 쓰세요.


// ── 섹션 8: 백업 점검 목록 ──

// 백업은 만드는 것보다 **굴리는 것**이 어렵습니다.
//
//   ☐ 주기       얼마나 잃어도 되나? 하루? 1시간? 그게 백업 주기입니다
//   ☐ 보관 기간   어제 것만 있으면, 3일 전에 생긴 오류는 못 되돌립니다
//   ☐ 다른 곳     같은 서버·같은 디스크에 두면 그 디스크가 죽을 때 같이 죽습니다
//   ☐ 자동 확인   백업 파일 크기가 갑자기 0 이 되면 알림이 와야 합니다
//   ☐ ★ 복구 연습 분기에 한 번, **다른 서버에 진짜로 복구해서** 건수를 세 보세요
//   ☐ 시간 재기   복구에 몇 시간 걸리나요? 그게 서비스 정지 시간입니다
//   ☐ 암호화     고객 데이터가 든 백업 파일은 그냥 두면 유출 사고 그 자체입니다
//
// ★★ 두 가지 숫자를 정하고 시작하세요. 회사가 답을 갖고 있어야 합니다.
//
//   RPO (얼마나 잃어도 되나)  — 1시간이면 백업을 1시간마다 하거나 WAL 을 보관해야 합니다
//   RTO (얼마나 멈춰도 되나)  — 30분이면 3시간 걸리는 복구 절차는 실패입니다
//
//   이 둘을 안 정하고 "백업은 하고 있습니다" 라고 하면 아무것도 안 정한 것입니다.

// 뒷정리
도커(`rm -rf ${백업경로}`);
fs.rmSync(실습방, { recursive: true, force: true });
await 연결.query("DROP TABLE IF EXISTS 점검기록, 설비, 라인 CASCADE");
await 연결.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   도구              무엇을 하나                        복구 도구
//   ──────────────────────────────────────────────────────────────────
//   pg_dump           한 DB 를 SQL 로 뽑는다              psql / pg_restore
//   pg_dumpall        모든 DB + 역할·권한을 뽑는다        psql
//   pg_restore        custom/directory 백업을 넣는다      —
//   pg_basebackup     데이터 파일을 통째로 가져간다        서버가 직접
//
//   pg_dump 옵션        하는 일
//   ──────────────────────────────────────────────────────────────────
//   --format=custom     압축되고 골라 복구할 수 있음 (기본으로 이걸 쓰세요)
//   --format=directory  -j 로 병렬. 표가 아주 많을 때
//   -n 스키마이름        그 스키마만
//   -t 표이름            그 표만
//   --schema-only       구조만 (값 없이)
//   --data-only         값만 (구조 없이)
//
//   pg_restore 옵션     하는 일
//   ──────────────────────────────────────────────────────────────────
//   -l                  안에 뭐가 있는지 목록만 봄
//   --table=이름        그 표만 복구
//   --data-only         표는 그대로 두고 값만
//   -j 4                병렬로 복구 (directory/custom)
//
//   에러코드   뜻
//   ──────────────────────────────────────────────────────────────────
//   42P01     없는 표 (지운 뒤 조회)
//   42P07     이미 있는 표 (--data-only 를 빼먹었을 때)
//   23503     외래키 위반 (제약이 살아 있다는 증거)
//   23505     중복 (--data-only 를 비우지 않고 두 번 넣었을 때)
//
// ★★★ 꼭 기억할 것
//   ① **복구해 본 적 없는 백업은 백업이 아닙니다.** 분기에 한 번은 해 보세요
//   ② cp 로 복사하면 반쯤 쓰인 파일이 복사됩니다. 게다가 표끼리 시점이 어긋납니다
//   ③ pg_dump 는 한 트랜잭션 안에서 읽어서 **전부 같은 순간**입니다
//   ④ 기본은 `--format=custom`. 표 하나만 골라 되살릴 수 있습니다
//   ⑤ WAL 을 보관해 두면 "어제 오후 3시" 로 돌아갈 수 있습니다 (PITR)
//   ⑥ 백업을 같은 디스크에 두지 마세요. 그 디스크가 죽는 게 백업이 필요한 날입니다


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 3 의 `--format=custom` 을 지우고 다시 뽑아 보세요.
//                    (기본 형식은 plain 입니다) pg_restore -l 이 되나요?
//                    (힌트: plain 은 그냥 텍스트라 목록이라는 개념이 없습니다)
//
// ✏️ 직접 해보기 2 — 섹션 4 의 `pg_restore` 를 두 번 연달아 돌려 보세요.
//                    두 번째에 어떤 에러가 나나요? 왜 그럴까요?
//                    (힌트: 표를 또 만들려고 합니다. 42P07)
//
// ✏️ 직접 해보기 3 — 섹션 5 에서 `--data-only` 를 빼고 돌려 보세요.
//                    무슨 에러가 나나요? 반대로 점검기록을 비우지 않고
//                    `--data-only` 로 넣으면 어떻게 되나요?
//
// ✏️ 직접 해보기 4 — `--schema-only` 로 뽑아 보세요. 파일 크기가 얼마인가요?
//                    "표 구조만 다른 팀에 보내 주세요" 일 때 쓰는 방법입니다.
//
// ✏️ 직접 해보기 5 — 섹션 1 의 ② 에서 창고와 라인을 복사하는 **순서를 바꿔** 보세요.
//                    이번엔 총 수량이 몇 개가 되나요? 30개가 사라지나요?
//
// ✏️ 직접 해보기 6 — 섹션 7 에서 `generate_series(1, 20000)` 을 200000 으로 바꿔 보세요.
//                    WAL 이 10배 늘어나나요? 정확히 비례하나요?
//
// ✏️ 직접 해보기 7 — 새 스키마에 복구해 보세요.
//                      pg_restore ... --schema=단원10 은 안 됩니다.
//                    대신 plain 백업의 "단원10" 을 다른 이름으로 바꿔서 psql 로 넣어 보세요.
//                    운영에서 "지우지 않고 옆에 복구해서 비교하기" 가 이 방법입니다.


// ── 자주 하는 실수 ──

// [실수 1] 백업만 하고 복구를 안 해 봄
//   이 파일에서 제일 중요한 실수입니다.
//   백업 스크립트가 3년째 빈 파일을 만들고 있어도 아무도 모릅니다.
//   ★ 달력에 적어 두고 분기마다 다른 서버에 복구해서 건수를 세 보세요.

// [실수 2] cp / rsync 로 데이터 폴더를 복사함
//   섹션 1 에서 본 그대로입니다. 반쯤 쓰인 파일이 복사되고, 표끼리 시점이 어긋납니다.
//   ★ 서버를 끄고 복사하면 됩니다. 그런데 그동안 서비스가 멈춥니다.
//   pg_basebackup 은 안 끄고도 됩니다. 그래서 그걸 씁니다.

// [실수 3] 백업을 같은 서버에 둠
//   디스크가 죽는 날이 바로 백업이 필요한 날입니다. 같이 죽습니다.
//   ★ 최소한 다른 기계, 되도록 다른 지역에 두세요.

// [실수 4] `pg_dump` 만 하고 역할·권한을 안 뽑음
//   `pg_dump` 는 그 데이터베이스만 뽑습니다. 계정과 권한은 안 들어갑니다.
//   복구했는데 아무도 로그인을 못 합니다.
//   ★ `pg_dumpall --globals-only` 를 같이 뽑아 두세요.

// [실수 5] 보관 기간을 안 정함
//   어제 백업만 갖고 있으면, 지난주에 생긴 데이터 오염은 못 되돌립니다.
//   ★ 일 7개 · 주 4개 · 월 12개 처럼 계단식으로 두는 것이 보통입니다.

// [실수 6] 복구 시간을 안 재 봄
//   500GB 를 복구하는 데 6시간 걸린다면, "30분 안에 복구" 라는 약속은 거짓말입니다.
//   ★ 한 번 재 보고 그 숫자를 회사에 알리세요. 그게 진짜 RTO 입니다.

// [실수 7] EXPLAIN 하듯 운영에서 바로 복구해 봄
//   "복구 연습" 을 운영 DB 에 하면 그게 사고입니다.
//   ★ 반드시 **다른 서버 · 다른 데이터베이스**에 복구하세요.

// [실수 8] 백업 파일을 암호화하지 않음
//   백업 파일에는 고객 데이터가 전부 들어 있습니다. 그냥 두면 그 자체가 유출 통로입니다.
//   ★ 저장할 때 암호화하고, 누가 가져갈 수 있는지 권한을 좁히세요.
