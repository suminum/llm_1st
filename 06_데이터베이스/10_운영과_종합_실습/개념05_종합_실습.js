// ============================================================
// 10단원 · 개념 05 — 종합 실습
// ------------------------------------------------------------
// 실행: node 개념05_종합_실습.js
//
// ★ 이 파일은 Docker 가 필요합니다.  docker compose up -d
// ★ 시스템을 통째로 만들고 점검까지 해서 20초쯤 걸립니다.
// ============================================================
//
// 이 자료의 마지막 개념 파일입니다.
//
// 지금까지 아홉 단원을 지나왔습니다. 각 단원은 한 가지씩 다뤘습니다.
// 여기서는 그걸 **전부 이어서 한 시스템**을 만듭니다.
//
//   설계        04단원 — 무엇을 표로 만들 것인가
//   표 만들기    02단원 — 타입과 제약
//   데이터       03단원 — 넣기, 대량 처리
//   조회        05단원 — 여러 표 잇기, 묶어 세기
//   색인        06단원 — 실행계획을 보고 거는가
//   트랜잭션     07단원 — 업무 한 건을 통째로
//   앱 연결      08단원 — 풀과 저장소 계층
//   운영        10단원 — 백업 · 느린 쿼리 · 청소 · 무중단 변경
//
// 그리고 마지막에 **점검 도구**를 만듭니다.
// 이 자료에서 배운 것을 데이터베이스에서 **자동으로 찾아 주는** 함수입니다.
// 여러분 회사 DB 에 그대로 돌려 보셔도 됩니다.

import pg from "pg";


// ── 섹션 0: 연결 ──

const 접속정보 = {
  host: "127.0.0.1",
  port: 5434, // ★ 5432 가 아닙니다
  user: "factory",
  password: "secret",
  database: "factory_db",
  application_name: "unit10-final", // ★ 영어로
};

let 준비;

try {
  준비 = new pg.Client(접속정보);
  await 준비.connect();
} catch (에러) {
  // 검증무시: Docker 가 없는 사람을 위한 안내입니다. 정상 종료합니다.
  console.log("데이터베이스에 연결하지 못했습니다.", 에러.code ?? 에러.message);
  console.log("이 파일은 Docker 가 필요합니다. 아래를 치고 다시 실행하세요.");
  console.log("  docker compose up -d");
  process.exit(0);
}

// ★ 이 파일은 시스템을 통째로 만듭니다. 전용 스키마를 새로 파고 시작합니다.
//   여러 번 돌려도 같은 결과가 나오게 매번 새로 만듭니다. (08단원의 그 방식)
const 스키마 = "단원10_종합";

await 준비.query(`DROP SCHEMA IF EXISTS ${스키마} CASCADE`);
await 준비.query(`CREATE SCHEMA ${스키마}`);
await 준비.query(`SET search_path TO ${스키마}`);

console.log("연결됐습니다.");
// 출력: 연결됐습니다.


// ── 섹션 1: 설계 (04단원) ──

// 요구사항입니다.
//
//   "공장에 라인이 여러 개 있습니다. 라인마다 설비가 있고,
//    작업자가 배치됩니다. 설비는 정기적으로 점검하고 결과를 남깁니다.
//    라인별로 하루 생산량을 봅니다."
//
// 04단원에서 배운 대로 명사를 뽑고, 관계를 봅니다.
//
//   명사      → 표가 될 후보
//   ─────────────────────────────────────────
//   라인      → 표. 설비와 작업자가 여기에 속합니다
//   설비      → 표. 라인에 속합니다 (여러 설비 : 한 라인)
//   작업자    → 표. 라인에 속합니다
//   점검기록  → 표. 설비에 속하고 작업자가 합니다
//   생산실적  → 표. 라인의 하루치
//
// ★ 04단원의 규칙 — **같은 사실을 두 군데 적지 않습니다.**
//   점검기록에 `라인이름` 을 또 적으면 안 됩니다.
//   설비를 통해 알 수 있으니까요. 라인 이름이 바뀌면 두 군데를 고쳐야 합니다.
//
// ★ 그리고 04단원이 남긴 반대쪽 조언도 있습니다.
//   **가끔은 일부러 중복합니다.** 매번 이어 붙이는 게 너무 비싸면요.
//   그때는 "왜 중복했는지" 를 주석으로 남기고, 어긋나지 않게 지키는 방법도 정합니다.


// ── 섹션 2: 표 만들기 (02단원) ──

// 02단원에서 배운 것을 씁니다. 타입을 고르고, 제약으로 규칙을 박습니다.

await 준비.query(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY CHECK (라인코드 ~ '^[A-Z]$'),
    이름     TEXT NOT NULL UNIQUE,
    동       TEXT NOT NULL
  );

  CREATE TABLE 작업자 (
    사번     INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    소속라인 TEXT REFERENCES 라인(라인코드),
    입사일   DATE NOT NULL DEFAULT CURRENT_DATE
  );

  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL UNIQUE,
    라인코드 TEXT NOT NULL REFERENCES 라인(라인코드),
    도입가   NUMERIC(12,2) NOT NULL CHECK (도입가 > 0),
    상태     TEXT NOT NULL DEFAULT '정지'
             CHECK (상태 IN ('가동','정지','점검','고장'))
  );

  CREATE TABLE 점검기록 (
    점검번호 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    설비번호 INT  NOT NULL REFERENCES 설비(설비번호),
    담당사번 INT  REFERENCES 작업자(사번),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL CHECK (결과 IN ('정상','주의','고장')),
    비고     TEXT
  );

  CREATE TABLE 생산실적 (
    라인코드 TEXT NOT NULL REFERENCES 라인(라인코드),
    생산일   DATE NOT NULL,
    수량     INT  NOT NULL CHECK (수량 >= 0),
    불량     INT  NOT NULL DEFAULT 0 CHECK (불량 >= 0),
    CONSTRAINT 불량은수량이하 CHECK (불량 <= 수량),
    PRIMARY KEY (라인코드, 생산일)
  );
`);

const 만든표 = await 준비.query(`
  SELECT relname::text AS 표 FROM pg_class
  WHERE relnamespace = '${스키마}'::regnamespace AND relkind = 'r'
  ORDER BY relname
`);

console.log("만든 표:", 만든표.rows.map((줄) => 줄.표).join(", "));
// 출력: 만든 표: 라인, 생산실적, 설비, 작업자, 점검기록

// ★ 02단원에서 고른 것들
//   · 돈(`도입가`)은 **NUMERIC**. FLOAT 는 절대 안 됩니다. 반올림이 어긋납니다
//   · 상태 같은 정해진 값은 **CHECK**. 오타가 들어갈 자리를 없앱니다
//   · 점검번호는 **IDENTITY**. SERIAL 보다 표준이고 실수로 넣는 것을 막습니다
//   · 생산실적은 **복합 기본키** (라인코드, 생산일). 하루에 한 줄만 있으면 되니까요
//   · `불량 <= 수량` 처럼 **두 칸 사이의 규칙**도 CHECK 로 박습니다


// ── 섹션 3: 데이터 넣기 (03단원) ──

await 준비.query(`
  INSERT INTO 라인 VALUES
    ('A','조립1라인','1동'), ('B','가공2라인','1동'),
    ('C','포장3라인','2동'), ('D','신설4라인','2동');

  INSERT INTO 작업자 (사번, 이름, 소속라인, 입사일) VALUES
    (101,'김반장','A',DATE '2018-03-02'), (102,'이기사','B',DATE '2020-07-15'),
    (103,'박주임','B',DATE '2021-01-04'), (104,'최사원','C',DATE '2024-09-01'),
    (105,'정신입',NULL,DATE '2026-02-01');

  INSERT INTO 설비 VALUES
    (1,'컨베이어 1호','A',12000000.00,'가동'),
    (2,'프레스 1호',  'A',35400000.00,'가동'),
    (3,'용접로봇 1호','B',88000000.00,'점검'),
    (4,'검사기 1호',  'B',15750000.00,'가동'),
    (5,'포장기 1호',  'C', 9500000.00,'정지');
`);

// ★ 03단원: 대량은 한 줄씩 INSERT 하지 않습니다. generate_series 로 한 문장에 넣습니다.
await 준비.query(`
  INSERT INTO 점검기록 (설비번호, 담당사번, 점검일, 결과, 비고)
  SELECT (g % 5) + 1,
         101 + (g % 4),
         DATE '2026-01-01' + (g % 180),
         (ARRAY['정상','정상','정상','주의','고장'])[(g % 5) + 1],
         '점검 ' || g
  FROM generate_series(1, 60000) g;

  INSERT INTO 생산실적 (라인코드, 생산일, 수량, 불량)
  SELECT 라인.라인코드,
         DATE '2026-01-01' + 일자,
         800 + ((일자 * 7) % 400),
         ((일자 * 3) % 25)
  FROM 라인, generate_series(0, 179) AS 일자
  WHERE 라인.라인코드 <> 'D';
`);

const 건수 = await 준비.query(`
  SELECT (SELECT count(*)::int FROM 라인)     AS 라인,
         (SELECT count(*)::int FROM 설비)     AS 설비,
         (SELECT count(*)::int FROM 작업자)   AS 작업자,
         (SELECT count(*)::int FROM 점검기록) AS 점검기록,
         (SELECT count(*)::int FROM 생산실적) AS 생산실적
`);

console.log("넣은 건수:", JSON.stringify(건수.rows[0]));
// 출력: 넣은 건수: {"라인":4,"설비":5,"작업자":5,"점검기록":60000,"생산실적":540}

// ★ `count(*)::int` 를 쓴 이유 — `pg` 에서 `count(*)` 는 **문자열**로 옵니다.
//   `::int` 를 안 붙이면 `"60000"` 이 와서 덧셈이 이어붙이기가 됩니다. (02단원)

// 제약이 진짜로 도는지 찔러 봅니다. 02단원에서 한 그대로입니다.
const 찔러보기 = async (설명, sql) => {
  try {
    await 준비.query(sql);
    return `${설명}: 들어감`;
  } catch (에러) {
    return `${설명}: ${에러.code}`;
  }
};

console.log(await 찔러보기("없는 라인의 설비  ", "INSERT INTO 설비 VALUES (99,'유령','Z',100.00,'가동')"));
// 출력: 없는 라인의 설비  : 23503

console.log(await 찔러보기("이상한 상태       ", "INSERT INTO 설비 VALUES (98,'이상','A',100.00,'폭발')"));
// 출력: 이상한 상태       : 23514

console.log(await 찔러보기("불량이 수량보다 큼", "INSERT INTO 생산실적 VALUES ('A',DATE '2027-01-01',10,99)"));
// 출력: 불량이 수량보다 큼: 23514

console.log(await 찔러보기("IDENTITY 에 직접  ", "INSERT INTO 점검기록 (점검번호, 설비번호, 점검일, 결과) VALUES (1,1,CURRENT_DATE,'정상')"));
// 출력: IDENTITY 에 직접  : 428C9


// ── 섹션 4: 조회 (05단원) ──

// 05단원에서 배운 것으로 실제 보고서를 만듭니다.

const 라인별현황 = await 준비.query(`
  SELECT 라인.이름                                          AS 라인,
         count(설비.설비번호)::int                           AS 설비수,
         COALESCE(sum(설비.도입가), 0)::text                 AS 설비총액
  FROM 라인
  LEFT JOIN 설비 ON 설비.라인코드 = 라인.라인코드
  GROUP BY 라인.라인코드, 라인.이름
  ORDER BY 라인.라인코드
`);

for (const 줄 of 라인별현황.rows) console.log(`  ${줄.라인} — 설비 ${줄.설비수}대 · ${줄.설비총액}원`);
// 출력:   조립1라인 — 설비 2대 · 47400000.00원
// 출력:   가공2라인 — 설비 2대 · 103750000.00원
// 출력:   포장3라인 — 설비 1대 · 9500000.00원
// 출력:   신설4라인 — 설비 0대 · 0원

// ★★ `LEFT JOIN` 이라서 **설비가 없는 신설4라인도 나옵니다.**
//   그냥 JOIN 이면 사라집니다. 05단원에서 본 그 차이입니다.
//   그리고 `count(설비.설비번호)` 이지 `count(*)` 가 아닙니다.
//   `count(*)` 로 하면 설비가 없는 라인이 **1** 로 나옵니다.

// 윈도우 함수 — 라인별로 불량률이 가장 높았던 날 (05단원)
const 최악의날 = await 준비.query(`
  SELECT 라인, 생산일::text AS 날짜, 불량률
  FROM (
    SELECT 라인.이름 AS 라인, 생산실적.생산일,
           round(생산실적.불량 * 100.0 / 생산실적.수량, 2) AS 불량률,
           row_number() OVER (PARTITION BY 라인.라인코드
                              ORDER BY 생산실적.불량 * 1.0 / 생산실적.수량 DESC,
                                       생산실적.생산일) AS 순위
    FROM 생산실적
    JOIN 라인 ON 라인.라인코드 = 생산실적.라인코드
  ) 매긴것
  WHERE 순위 = 1
  ORDER BY 라인
`);

for (const 줄 of 최악의날.rows) console.log(`  ${줄.라인} — ${줄.날짜} 불량률 ${줄.불량률}퍼센트`);
// 출력:   가공2라인 — 2026-02-28 불량률 2.98퍼센트
// 출력:   조립1라인 — 2026-02-28 불량률 2.98퍼센트
// 출력:   포장3라인 — 2026-02-28 불량률 2.98퍼센트

// ★ `round(...)` 결과가 NUMERIC 이라 **문자열**로 옵니다. 02단원의 그 표입니다.
//   `불량률` 을 숫자로 계산에 쓰려면 `Number()` 로 감싸야 합니다.


// ── 섹션 5: 색인 (06단원) ──

// 아직 색인이 하나도 없습니다. 기본키가 만들어 준 것 말고는요.
// 06단원에서 배운 대로 **실행계획을 보고** 겁니다. 감으로 걸지 않습니다.

await 준비.query("ANALYZE");

const 계획 = async (sql) =>
  (await 준비.query(`EXPLAIN (ANALYZE) ${sql}`)).rows.map((줄) => 줄["QUERY PLAN"]).join("\n");

const 자주쓰는질의 = `
  SELECT 결과, count(*)::int FROM 점검기록
  WHERE 설비번호 = 3 AND 점검일 >= DATE '2026-03-01'
  GROUP BY 결과
`;

const 색인전 = await 계획(자주쓰는질의);

console.log("색인 전 — 순차 훑기인가:", 색인전.includes("Seq Scan"));
// 출력: 색인 전 — 순차 훑기인가: true

// ★ 06단원의 복합 색인 순서 규칙: **같다(=) 로 쓰는 칸을 먼저.**
await 준비.query("CREATE INDEX 점검_설비_점검일 ON 점검기록 (설비번호, 점검일)");
await 준비.query("ANALYZE 점검기록");

const 색인후 = await 계획(자주쓰는질의);

console.log("색인 후 — 색인을 쓰나:", 색인후.includes("Index"));
// 출력: 색인 후 — 색인을 쓰나: true

const 실행시간 = (계획글) => Number(계획글.match(/Execution Time: ([\d.]+) ms/)[1]);

console.log(`색인 전 ${실행시간(색인전).toFixed(1)} ms → 색인 후 ${실행시간(색인후).toFixed(2)} ms`);
// 출력?: 색인 전 3.5 ms → 색인 후 1.95 ms

console.log("색인 쪽이 더 빠른가:", 실행시간(색인후) < 실행시간(색인전));
// 출력: 색인 쪽이 더 빠른가: true


// ── 섹션 6: 트랜잭션 (07단원) ──

// **업무 한 건**을 통째로 묶습니다. SQL 한 줄이 아니라 업무가 단위입니다.
//
// "설비가 고장 났습니다" 는 두 가지 일입니다.
//   ① 점검기록에 '고장' 을 남긴다
//   ② 설비의 상태를 '고장' 으로 바꾼다
// 둘 중 하나만 되면 데이터가 어긋납니다.

const 풀 = new pg.Pool({ ...접속정보, max: 5, options: `-c search_path=${스키마}` });

// ★★ 08단원에서 배운 그 껍데기입니다. **반드시 `풀.connect()` 로 잡은 같은 연결**에서
//   BEGIN/COMMIT 을 해야 합니다. `풀.query("BEGIN")` 은 롤백이 안 됩니다.
async function 트랜잭션(할일) {
  const 연결 = await 풀.connect();

  try {
    await 연결.query("BEGIN");
    const 값 = await 할일(연결);
    await 연결.query("COMMIT");
    return 값;
  } catch (에러) {
    await 연결.query("ROLLBACK");
    throw 에러;
  } finally {
    연결.release();
  }
}

async function 고장신고(설비번호, 담당사번, 비고) {
  return 트랜잭션(async (연결) => {
    await 연결.query(
      "INSERT INTO 점검기록 (설비번호, 담당사번, 점검일, 결과, 비고) VALUES ($1,$2,CURRENT_DATE,'고장',$3)",
      [설비번호, 담당사번, 비고],
    );

    const 고침 = await 연결.query("UPDATE 설비 SET 상태 = '고장' WHERE 설비번호 = $1", [설비번호]);

    if (고침.rowCount === 0) throw new Error(`설비 ${설비번호} 가 없습니다`);

    return "신고됨";
  });
}

console.log("고장 신고:", await 고장신고(2, 101, "이상 소음"));
// 출력: 고장 신고: 신고됨

const 상태확인 = await 준비.query("SELECT 상태 FROM 설비 WHERE 설비번호 = 2");

console.log("설비 2번 상태:", 상태확인.rows[0].상태);
// 출력: 설비 2번 상태: 고장

// 중간에 실패하면 **통째로** 없던 일이 되는지 확인합니다.
const 신고전건수 = (await 준비.query("SELECT count(*)::int AS 수 FROM 점검기록")).rows[0].수;

let 실패결과 = "성공함";

try {
  await 고장신고(999, 101, "없는 설비");
} catch (에러) {
  실패결과 = 에러.code ?? "직접던진에러";
}

const 신고후건수 = (await 준비.query("SELECT count(*)::int AS 수 FROM 점검기록")).rows[0].수;

console.log("없는 설비에 신고하면:", 실패결과);
// 출력: 없는 설비에 신고하면: 23503

console.log("점검기록이 안 늘었나:", 신고전건수 === 신고후건수);
// 출력: 점검기록이 안 늘었나: true

// ★★ 외래키가 먼저 막아 줬습니다(23503). 만약 외래키가 없었다면
//   점검기록만 들어가고 설비는 안 바뀌는 **어긋난 상태**가 됐을 것입니다.
//   제약과 트랜잭션은 같이 일합니다.


// ── 섹션 7: 앱 연결 (08단원) ──

// 08단원의 저장소 계층입니다. **첫 인자가 항상 실행자**입니다.
// 그래야 풀에서 바로 쓸 수도 있고, 트랜잭션 안에서 쓸 수도 있습니다.

const 설비저장소 = {
  async 라인별로(실행자, 라인코드) {
    const 결과 = await 실행자.query(
      // ★ `SELECT *` 를 안 씁니다. 필요한 칸만 적습니다 (섹션 8 에서 이유를 봅니다)
      "SELECT 설비번호, 이름, 상태 FROM 설비 WHERE 라인코드 = $1 ORDER BY 설비번호",
      [라인코드], // ★ 값은 항상 $1 로. 이어 붙이면 SQL 인젝션입니다 (03단원)
    );

    return 결과.rows;
  },

  async 고장난것세기(실행자) {
    const 결과 = await 실행자.query("SELECT count(*)::int AS 건수 FROM 설비 WHERE 상태 = '고장'");
    return 결과.rows[0].건수;
  },
};

const A라인설비 = await 설비저장소.라인별로(풀, "A");

console.log("A라인 설비:", A라인설비.map((줄) => `${줄.이름}(${줄.상태})`).join(", "));
// 출력: A라인 설비: 컨베이어 1호(가동), 프레스 1호(고장)

console.log("고장난 설비 수:", await 설비저장소.고장난것세기(풀));
// 출력: 고장난 설비 수: 1

// ★ 03단원에서 뚫어 본 그 인젝션을 다시 확인합니다.
const 나쁜입력 = "A' OR '1'='1";

const 안전한결과 = await 설비저장소.라인별로(풀, 나쁜입력);

console.log("공격 문자열을 $1 로 넘기면 나오는 줄 수:", 안전한결과.length);
// 출력: 공격 문자열을 $1 로 넘기면 나오는 줄 수: 0

// ★★ 0줄입니다. `A' OR '1'='1` 이라는 **라인코드를 찾은 것**이기 때문입니다.
//   그런 라인은 없습니다. 공격이 아니라 그냥 값이 됐습니다. 이게 파라미터의 힘입니다.


// ── 섹션 8: ★★ 점검 도구 만들기 ──

// 여기가 이 파일의 핵심입니다.
//
// 이 자료에서 배운 것들을 **데이터베이스에 직접 물어봐서** 찾아 주는 함수를 만듭니다.
// 사람이 눈으로 훑는 것은 놓칩니다. 기계로 훑어야 합니다.

async function 스키마점검(연결, 대상스키마) {
  const 지적 = [];

  const 담기 = (종류, 줄들, 설명) => {
    for (const 줄 of 줄들) 지적.push({ 종류, 대상: 줄.대상, 설명 });
  };

  // ① 색인 없는 외래키 (06단원)
  //   부모를 지우거나 고칠 때마다 자식 표를 통째로 훑습니다.
  //   ★ `conrelid::regclass::text` 를 쓰면 한글 이름에 따옴표가 붙습니다("설비").
  //     읽기 좋게 `relname` 으로 직접 잇습니다.
  const 색인없는외래키 = await 연결.query(
    `SELECT (t.relname || '.' || a.attname) AS 대상
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
     WHERE c.contype = 'f' AND c.connamespace = $1::regnamespace
       AND NOT EXISTS (
         SELECT 1 FROM pg_index i
         WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1]
       )
     ORDER BY 1`,
    [대상스키마],
  );

  담기("색인없는외래키", 색인없는외래키.rows, "부모를 지울 때마다 자식 표를 전부 훑습니다");

  // ② 기본키 없는 표 (02단원)
  //   중복을 못 막고, 한 줄을 콕 집을 수가 없습니다.
  const 기본키없음 = await 연결.query(
    `SELECT c.relname::text AS 대상
     FROM pg_class c
     WHERE c.relnamespace = $1::regnamespace AND c.relkind = 'r'
       AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.conrelid = c.oid AND k.contype = 'p')
     ORDER BY 1`,
    [대상스키마],
  );

  담기("기본키없음", 기본키없음.rows, "중복을 못 막고 한 줄을 콕 집을 수 없습니다");

  // ③ 돈처럼 보이는데 NUMERIC 이 아닌 칸 (02단원)
  //   FLOAT 로 돈을 담으면 더할수록 어긋납니다.
  const 돈이아닌돈 = await 연결.query(
    `SELECT (c.relname || '.' || a.attname || ' (' || format_type(a.atttypid, a.atttypmod) || ')') AS 대상
     FROM pg_attribute a
     JOIN pg_class c ON c.oid = a.attrelid
     WHERE c.relnamespace = $1::regnamespace AND c.relkind = 'r'
       AND a.attnum > 0 AND NOT a.attisdropped
       AND (a.attname LIKE '%가%' OR a.attname LIKE '%금액%' OR a.attname LIKE '%단가%'
            OR a.attname LIKE '%비용%' OR a.attname LIKE '%원가%')
       AND a.atttypid <> 'numeric'::regtype
     ORDER BY 1`,
    [대상스키마],
  );

  담기("돈이NUMERIC아님", 돈이아닌돈.rows, "FLOAT 로 돈을 담으면 더할수록 어긋납니다");

  // ④ 한 번도 안 쓰인 색인 (06단원)
  //   INSERT 마다 같이 써야 하고, 백업에도 들어가고, 캐시도 먹습니다.
  const 안쓰는색인 = await 연결.query(
    `SELECT (indexrelname || ' (' || pg_size_pretty(pg_relation_size(indexrelid)) || ')') AS 대상
     FROM pg_stat_user_indexes
     WHERE schemaname = $1 AND idx_scan = 0
       AND indexrelid NOT IN (SELECT conindid FROM pg_constraint WHERE contype IN ('p','u'))
     ORDER BY 1`,
    [대상스키마],
  );

  담기("안쓰이는색인", 안쓰는색인.rows, "쓰이지도 않으면서 쓰기를 느리게 합니다");

  // ⑤ 부푼 표 (개념03)
  const 부푼표 = await 연결.query(
    `SELECT (relname || ' — 죽은 줄 ' || n_dead_tup || '개') AS 대상
     FROM pg_stat_user_tables
     WHERE schemaname = $1 AND n_dead_tup > 1000 AND n_dead_tup > n_live_tup
     ORDER BY 1`,
    [대상스키마],
  );

  담기("부푼표", 부푼표.rows, "죽은 줄이 산 줄보다 많습니다. 청소가 막혔는지 보세요");

  // ⑥ 오래된 트랜잭션 (개념03 · 07단원)
  //   ★ 이건 스키마와 상관없이 서버 전체를 봅니다.
  const 오래된트랜잭션 = await 연결.query(
    `SELECT (application_name || ' — ' || state || ' ' ||
             round(extract(epoch FROM now() - xact_start))::text || '초') AS 대상
     FROM pg_stat_activity
     WHERE xact_start IS NOT NULL AND pid <> pg_backend_pid()
       AND now() - xact_start > interval '10 seconds'
     ORDER BY xact_start`,
  );

  담기("오래된트랜잭션", 오래된트랜잭션.rows, "청소를 막고 잠금을 쥡니다");

  // ⑦ 못 쓰는 색인 (개념04)
  const 망가진색인 = await 연결.query(
    `SELECT x.relname::text AS 대상
     FROM pg_index i
     JOIN pg_class c ON c.oid = i.indrelid
     JOIN pg_class x ON x.oid = i.indexrelid
     WHERE NOT i.indisvalid AND c.relnamespace = $1::regnamespace
     ORDER BY 1`,
    [대상스키마],
  );

  담기("못쓰는색인", 망가진색인.rows, "CONCURRENTLY 가 실패해서 남은 것입니다. 지우고 다시 만드세요");

  return 지적;
}

// ── 코드도 점검합니다 ──
//
// 위의 것들은 데이터베이스에 물어봤습니다.
// `SELECT *` 나 이어 붙인 SQL 은 **코드 안**에 있습니다. 글자로 찾습니다.

function 코드점검(파일이름, 소스) {
  const 지적 = [];

  소스.split("\n").forEach((줄, 자리) => {
    const 어디 = `${파일이름}:${자리 + 1}`;

    // ① SELECT * (05단원 · 08단원)
    if (/select\s+\*/i.test(줄)) {
      지적.push({ 종류: "SELECT별표", 대상: 어디, 설명: "칸이 늘면 조용히 같이 딸려 옵니다" });
    }

    // ② 글자로 이어 붙인 SQL (03단원) — ★ 제일 위험합니다
    //
    //   ★ 정규식 안의 따옴표를 `\x22`(") `\x27`(') `\x60`(`) 로 적었습니다.
    //     따옴표를 그대로 쓰면 **코드를 훑는 도구들이 문자열의 시작으로 오해합니다.**
    //     실제로 이 자료의 검증 도구가 그렇게 오해해서 파일 뒷부분을 통째로 놓쳤습니다.
    //     정규식에 따옴표를 넣을 일이 있으면 이스케이프로 적는 편이 안전합니다.
    if (/(select|insert|update|delete)[^\x22\x27\x60]*\$\{/i.test(줄) || /(where|values)[^\x22\x27\x60]*\x22\s*\+/i.test(줄)) {
      지적.push({ 종류: "SQL이어붙임", 대상: 어디, 설명: "★ SQL 인젝션입니다. $1 을 쓰세요" });
    }

    // ③ 풀에 직접 BEGIN (08단원)
    if (/풀\.query\(\s*[\x22\x27\x60]\s*(BEGIN|COMMIT|ROLLBACK)/i.test(줄) || /pool\.query\(\s*[\x22\x27\x60]\s*BEGIN/i.test(줄)) {
      지적.push({ 종류: "풀에BEGIN", 대상: 어디, 설명: "문장마다 다른 연결로 갑니다. 롤백이 안 됩니다" });
    }
  });

  return 지적;
}

// 일부러 문제를 심어 둔 코드 조각입니다. 점검 도구가 찾아내는지 봅니다.
const 나쁜코드 = [
  'const 목록 = await 풀.query("SELECT * FROM 설비");',
  'const 하나 = await 풀.query(`SELECT 이름 FROM 설비 WHERE 라인코드 = ${입력}`);',
  'await 풀.query("BEGIN");',
  'const 안전 = await 풀.query("SELECT 이름 FROM 설비 WHERE 라인코드 = $1", [입력]);',
].join("\n");

const 코드지적 = 코드점검("나쁜예시.js", 나쁜코드);

for (const 줄 of 코드지적) console.log(`  [${줄.종류}] ${줄.대상} — ${줄.설명}`);
// 출력:   [SELECT별표] 나쁜예시.js:1 — 칸이 늘면 조용히 같이 딸려 옵니다
// 출력:   [SQL이어붙임] 나쁜예시.js:2 — ★ SQL 인젝션입니다. $1 을 쓰세요
// 출력:   [풀에BEGIN] 나쁜예시.js:3 — 문장마다 다른 연결로 갑니다. 롤백이 안 됩니다

console.log("마지막 줄($1 을 쓴 것)은 안 걸렸나:", !코드지적.some((줄) => 줄.대상.endsWith(":4")));
// 출력: 마지막 줄($1 을 쓴 것)은 안 걸렸나: true

// ── 진짜 스키마에 돌려 봅니다 ──
//
// 우리가 방금 만든 시스템입니다. 잘 만들었다고 생각했는데 어떨까요.

// 색인 통계가 쌓이도록 실제 질의를 몇 번 돌립니다.
// ★ 06단원에서 배운 것: 통계는 **진짜로 실행한 질의**만 셉니다. EXPLAIN 은 안 셉니다.
for (let 회차 = 0; 회차 < 3; 회차 += 1) {
  await 준비.query("SELECT 결과 FROM 점검기록 WHERE 설비번호 = 3 AND 점검일 >= DATE '2026-03-01' LIMIT 5");
}

await 준비.query("ANALYZE");

// ★ 색인 사용 통계는 조금 늦게 반영됩니다. 잠깐 기다렸다 봅니다. (개념03 에서 본 그것)
await new Promise((끝) => setTimeout(끝, 1000));

const 첫점검 = await 스키마점검(준비, 스키마);

// ★ 종류별로 몇 건인지 먼저 봅니다. 총 건수는 통계가 언제 반영되느냐에 따라 달라집니다.
const 종류별 = {};

for (const 줄 of 첫점검) 종류별[줄.종류] = (종류별[줄.종류] ?? 0) + 1;

console.log("점검 결과(종류별):", JSON.stringify(종류별));
// 출력?: 점검 결과(종류별): {"색인없는외래키":3}

const 외래키지적 = 첫점검.filter((줄) => 줄.종류 === "색인없는외래키");

for (const 줄 of 외래키지적) console.log(`  [${줄.종류}] ${줄.대상} — ${줄.설명}`);
// 출력:   [색인없는외래키] 설비.라인코드 — 부모를 지울 때마다 자식 표를 전부 훑습니다
// 출력:   [색인없는외래키] 작업자.소속라인 — 부모를 지울 때마다 자식 표를 전부 훑습니다
// 출력:   [색인없는외래키] 점검기록.담당사번 — 부모를 지울 때마다 자식 표를 전부 훑습니다

console.log("색인 없는 외래키가 잡혔나:", 외래키지적.length > 0);
// 출력: 색인 없는 외래키가 잡혔나: true

// ★ `생산실적.라인코드` 는 안 걸렸습니다. 왜일까요.
//   기본키가 `(라인코드, 생산일)` 복합키라서 **첫 칸이 라인코드**입니다.
//   그 기본키 색인을 외래키 검사에 그대로 쓸 수 있습니다. 그래서 따로 안 걸어도 됩니다.
//   ★★ 06단원의 "복합 색인은 왼쪽부터 쓴다" 가 여기서도 그대로 통합니다.
//
// ★★ **우리가 방금 만든 표에서 문제가 나왔습니다.**
//   외래키를 걸었으면 그 칸에 색인도 걸어야 합니다.
//   Postgres 는 기본키·UNIQUE 에는 색인을 자동으로 만들어 주지만
//   **외래키에는 안 만들어 줍니다.** 이게 제일 흔한 누락입니다.
//
//   왜 필요한가: `DELETE FROM 라인 WHERE 라인코드 = 'D'` 를 할 때
//   Postgres 는 "이 라인을 쓰는 설비가 있나" 를 확인해야 합니다.
//   색인이 없으면 설비 표를 **통째로 훑습니다.** 그동안 잠금도 쥡니다.

// 고칩니다.
await 준비.query(`
  CREATE INDEX 설비_라인코드   ON 설비 (라인코드);
  CREATE INDEX 작업자_소속라인 ON 작업자 (소속라인);
  CREATE INDEX 점검_담당사번   ON 점검기록 (담당사번);
  CREATE INDEX 생산_라인코드   ON 생산실적 (라인코드);
`);

const 둘째점검 = await 스키마점검(준비, 스키마);
const 남은외래키지적 = 둘째점검.filter((줄) => 줄.종류 === "색인없는외래키");

console.log("고친 뒤 색인 없는 외래키:", 남은외래키지적.length, "건");
// 출력: 고친 뒤 색인 없는 외래키: 0 건

// ★ 그런데 이번엔 **다른 게** 걸립니다. 방금 만든 색인들이 아직 안 쓰였으니까요.
const 안쓰인것 = 둘째점검.filter((줄) => 줄.종류 === "안쓰이는색인");

console.log("이번엔 '안 쓰이는 색인' 이 잡혔나:", 안쓰인것.length > 0);
// 출력: 이번엔 '안 쓰이는 색인' 이 잡혔나: true

// ★★★ **점검 도구를 맹신하면 안 됩니다.**
//   방금 만든 색인이 안 쓰였다고 나오는 게 당연합니다. 아직 아무도 안 썼으니까요.
//   06단원에서도 경고했습니다. "며칠 돌려 본 통계로 판단하면 안 됩니다."
//
//   점검 도구는 **볼 곳을 알려 주는 것**이지 답을 주는 게 아닙니다.
//   각 항목마다 "왜 이런가" 를 사람이 판단해야 합니다.

// 오래된 트랜잭션도 잡히는지 확인합니다.
const 게으른연결 = new pg.Client({ ...접속정보, application_name: "unit10-lazy" });
await 게으른연결.connect();
await 게으른연결.query("BEGIN");
await 게으른연결.query("SELECT 1");

// ★ 10초가 지나야 잡히므로, 시간을 흉내 내서 같은 질의를 0초 기준으로 돌려 봅니다.
const 지금열린것 = await 준비.query(`
  SELECT application_name AS 이름표, state
  FROM pg_stat_activity
  WHERE xact_start IS NOT NULL AND application_name = 'unit10-lazy'
`);

console.log("열어 두고 노는 트랜잭션:", JSON.stringify(지금열린것.rows[0]));
// 출력: 열어 두고 노는 트랜잭션: {"이름표":"unit10-lazy","state":"idle in transaction"}

await 게으른연결.query("ROLLBACK");
await 게으른연결.end();


// ── 섹션 9: 운영 점검 목록 ──

// 배포 전에 보는 것 / 배포 후에 보는 것을 나눠서 적습니다.
//
//   ── 배포 전 ────────────────────────────────────────────────
//   ☐ 마이그레이션에 `SET lock_timeout` 이 있는가              (개념04)
//   ☐ 칸 이름 바꾸기·지우기가 확장 → 이전 → 축소로 나뉘었는가    (개념04)
//   ☐ `CREATE INDEX` 에 `CONCURRENTLY` 가 붙었고 트랜잭션 밖인가 (개념04)
//   ☐ 새 쿼리의 EXPLAIN 을 봤는가. Seq Scan 이 남아 있는가       (06단원)
//   ☐ 새 외래키에 색인을 같이 걸었는가                          (섹션 8)
//   ☐ 되돌릴 방법이 있는가 (옛 칸을 아직 안 지웠는가)             (개념04)
//   ☐ ★ 백업이 최근 것이고, 복구해 본 적이 있는가                (개념01)
//
//   ── 배포 후 ────────────────────────────────────────────────
//   ☐ 느린 쿼리 순위가 바뀌었는가                              (개념02)
//   ☐ 에러 로그에 새 에러코드가 있는가                          (23503 · 42703 · 23502)
//   ☐ 커넥션 풀이 꽉 차지 않았는가                              (08단원)
//   ☐ 잠금을 오래 기다린 것이 있는가 (log_lock_waits)           (07단원)
//   ☐ 죽은 줄이 갑자기 늘지 않았는가                            (개념03)
//   ☐ 못 쓰는 색인이 남지 않았는가 (indisvalid = false)         (개념04)

// ★ 01단원에서 "GRANT · REVOKE 는 10단원에서" 라고 했습니다. 여기서 갚습니다.
//
// 권한도 운영의 일부입니다. **애플리케이션 계정에 관리자 권한을 주지 마세요.**

// ★★ 역할은 그냥 `DROP ROLE` 이 안 됩니다.
//   그 역할에 준 권한이 남아 있으면 `2BP01` 로 거절합니다.
//   `DROP OWNED BY` 로 권한부터 걷어 내야 합니다. 실제로 이 에러를 만났습니다.
async function 역할지우기(이름) {
  const 있나 = await 준비.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [이름]);

  if (있나.rowCount === 0) return;

  await 준비.query(`DROP OWNED BY ${이름}`); // 이 역할에 준 권한을 전부 거둡니다
  await 준비.query(`DROP ROLE ${이름}`);
}

await 역할지우기("readonly_app");
await 준비.query("CREATE ROLE readonly_app LOGIN PASSWORD 'secret'");
await 준비.query(`GRANT USAGE ON SCHEMA ${스키마} TO readonly_app`);
await 준비.query(`GRANT SELECT ON ALL TABLES IN SCHEMA ${스키마} TO readonly_app`);

const 읽기전용 = new pg.Client({ ...접속정보, user: "readonly_app", application_name: "unit10-ro" });
await 읽기전용.connect();
await 읽기전용.query(`SET search_path TO ${스키마}`);

console.log("읽기 전용 계정으로 읽기:", (await 읽기전용.query("SELECT count(*)::int AS 수 FROM 설비")).rows[0].수, "대");
// 출력: 읽기 전용 계정으로 읽기: 5 대

let 쓰기시도 = "써졌음";

try {
  await 읽기전용.query("UPDATE 설비 SET 상태 = '가동' WHERE 설비번호 = 1");
} catch (에러) {
  쓰기시도 = 에러.code;
}

console.log("읽기 전용 계정으로 쓰기:", 쓰기시도, "(42501 = 권한 없음)");
// 출력: 읽기 전용 계정으로 쓰기: 42501 (42501 = 권한 없음)

await 읽기전용.end();

// ★★ 이렇게 나누세요
//   · 보고서·분석 도구      → 읽기 전용 계정
//   · 애플리케이션         → 그 스키마에만 SELECT/INSERT/UPDATE/DELETE
//   · 마이그레이션         → 스키마를 바꿀 수 있는 별도 계정
//   · 사람이 쓰는 psql      → 개인 계정. 공용 계정을 돌려 쓰지 마세요
//
// ★ 앞으로 만들 표에도 자동으로 권한이 붙게 하려면
//     ALTER DEFAULT PRIVILEGES IN SCHEMA 스키마 GRANT SELECT ON TABLES TO readonly_app;


// ── 섹션 10: 여기서 안 다룬 것 ──

// 정직하게 말씀드립니다. 이 자료가 안 다룬 것이 많습니다.
// 이름과 **언제 필요한지**만 적어 둡니다. 그때가 오면 찾아보시면 됩니다.
//
//   이름                  무엇인가                        언제 필요한가
//   ──────────────────────────────────────────────────────────────────────────
//   복제 (replication)    다른 서버에 실시간으로 복사       서버 하나가 죽으면
//                                                        안 되는 서비스
//   읽기 전용 복제본       복제본에서 SELECT 만 받기         읽기가 너무 많아
//   (read replica)                                        한 서버로 안 될 때
//   장애 조치 (failover)  주 서버가 죽으면 복제본을 승격     자동 복구가 필요할 때
//   pgBouncer            DB 앞의 연결 중개기               서버 대수 × 풀 크기가
//                                                        max_connections 를 넘을 때
//                                                        (08단원에서 예고한 그것)
//   파티션 (partition)    큰 표를 기간별로 쪼개기           수억 건이고 오래된 것을
//                                                        통째로 버릴 때 (03단원 예고)
//   샤딩 (sharding)       데이터를 여러 서버에 나눠 담기      한 서버에 안 들어갈 때
//                                                        ★ 최후의 수단입니다
//   모니터링              지표를 계속 재서 그래프로          운영하는 모든 서비스
//     (Prometheus + postgres_exporter, pgwatch, Datadog …)
//   확장 (extension)      pg_trgm · PostGIS · pgvector      부분 문자열 검색 ·
//                                                        지도 · 임베딩 검색
//   전문 검색             tsvector / GIN 색인               문서에서 단어 찾기
//   커넥션 암호화          SSL/TLS                         DB 가 다른 기계에 있으면
//                                                        ★ 사실상 필수입니다
//
// ★★ 순서에 대한 조언입니다.
//   많은 팀이 "느려요" 하면 바로 샤딩이나 복제를 이야기합니다.
//   그런데 대부분은 **색인 하나**나 **N+1 하나**로 끝납니다.
//
//   ① 재세요 (개념02)            ← 여기서 90퍼센트가 끝납니다
//   ② 쿼리와 색인을 고치세요 (06단원)
//   ③ 캐시를 붙이세요
//   ④ 읽기 전용 복제본을 붙이세요
//   ⑤ 그래도 안 되면 그때 파티션·샤딩
//
//   ★ 순서를 건너뛰면 복잡도만 늘고 안 빨라집니다.


// ── 섹션 11: 다음에 무엇을 공부하면 되나 ──

//   ① **공식 문서를 읽으세요.** postgresql.org/docs
//      농담이 아닙니다. Postgres 문서는 정말 잘 쓰여 있습니다.
//      이 자료는 그 문을 여는 것까지가 목표였습니다.
//
//   ② **여러분 회사 DB 에 섹션 8 의 점검 도구를 돌려 보세요.**
//      뭐가 나오는지 보고, 하나씩 왜 그런지 알아보세요. 그게 제일 빨리 늡니다.
//
//   ③ **EXPLAIN 을 습관으로 만드세요.** (06단원)
//      새 쿼리를 쓸 때마다 계획을 보세요. 몇 달이면 눈에 익습니다.
//
//   ④ **장애를 겪으면 기록으로 남기세요.**
//      무슨 일이 났고, 왜 났고, 어떻게 막을지. 그 기록이 실력이 됩니다.
//
//   ⑤ 더 볼 만한 주제
//      · 격리 수준과 이상 현상 (07단원의 확장)
//      · 실행계획 최적화 — 조인 순서, 통계, 확장 통계
//      · 논리 복제 (logical replication) — 무중단 버전 업그레이드에 씁니다
//      · 시계열 데이터 — TimescaleDB
//
// ★★★ 마지막으로 한 가지만 남긴다면 이것입니다.
//
//   **재세요.**
//
//   느리다고 느끼면 재세요. 빠르다고 생각해도 재세요.
//   백업이 된다고 믿지 말고 복구해서 재세요.
//   색인이 효과 있다고 생각하면 EXPLAIN 으로 재세요.
//
//   이 자료의 모든 숫자는 실제로 재서 나온 값입니다.
//   재기 전에는 저희도 몰랐고, 재고 나서 몇 번이나 생각이 바뀌었습니다.


// 뒷정리
await 풀.end();
await 역할지우기("readonly_app");
await 준비.query(`DROP SCHEMA IF EXISTS ${스키마} CASCADE`);
await 준비.end();

console.log("끝났습니다.");
// 출력: 끝났습니다.


// ============================================================
// 정리
// ============================================================
//
//   단계          단원    핵심                          이 파일의 섹션
//   ──────────────────────────────────────────────────────────────────
//   설계          04      같은 사실을 두 군데 적지 않기     1
//   표 만들기      02      타입 고르기 · 제약으로 규칙 박기  2
//   데이터         03      대량은 한 문장으로 · $1 로 넣기   3
//   조회          05      LEFT JOIN · GROUP BY · 윈도우    4
//   색인          06      EXPLAIN 을 보고 걸기            5
//   트랜잭션       07      업무 한 건을 통째로              6
//   앱 연결        08      풀 · 저장소 계층 · 첫 인자는 실행자 7
//   운영          10      백업 · 재기 · 청소 · 무중단 변경   8·9
//
//   점검 도구가 찾는 것                무슨 단원에서 배웠나
//   ──────────────────────────────────────────────────────────────────
//   색인 없는 외래키                   06단원 (제일 흔한 누락입니다)
//   기본키 없는 표                     02단원
//   돈인데 NUMERIC 이 아닌 칸           02단원
//   한 번도 안 쓰인 색인                06단원
//   부푼 표 (죽은 줄이 더 많음)          10단원 개념03
//   오래된 트랜잭션                    07단원 · 10단원 개념03
//   못 쓰는 색인 (indisvalid=false)    10단원 개념04
//   SELECT *                          05단원 · 08단원
//   글자로 이어 붙인 SQL                03단원 (★ 인젝션)
//   풀에 직접 BEGIN                    08단원
//
// ★★★ 꼭 기억할 것
//   ① 표를 만들기 전에 **무엇이 사실인지** 먼저 정하세요 (04단원)
//   ② 규칙은 코드가 아니라 **제약**에 박으세요. 코드는 우회할 수 있습니다
//   ③ 트랜잭션의 단위는 **업무 한 건**입니다. SQL 한 줄이 아닙니다
//   ④ 외래키에는 색인을 **직접** 걸어야 합니다. 자동으로 안 생깁니다
//   ⑤ 점검 도구는 **볼 곳을 알려 줄 뿐**입니다. 판단은 사람이 합니다
//   ⑥ 복제·샤딩보다 먼저 **재세요.** 대부분 색인 하나로 끝납니다
//   ⑦ 애플리케이션 계정에 관리자 권한을 주지 마세요


// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 섹션 2 에서 `도입가` 를 `NUMERIC(12,2)` 에서 `FLOAT8` 로 바꾸고
//                    섹션 8 의 점검을 돌려 보세요. 잡히나요?
//
// ✏️ 직접 해보기 2 — 섹션 2 에 기본키 없는 표를 하나 만들어 보세요.
//                    `CREATE TABLE 임시메모 (내용 TEXT);` 점검이 잡나요?
//
// ✏️ 직접 해보기 3 — 섹션 4 의 `LEFT JOIN` 을 그냥 `JOIN` 으로 바꿔 보세요.
//                    신설4라인이 사라지나요? 왜 그럴까요?
//
// ✏️ 직접 해보기 4 — 섹션 4 의 `count(설비.설비번호)` 를 `count(*)` 로 바꿔 보세요.
//                    신설4라인의 설비 수가 몇으로 나오나요?
//
// ✏️ 직접 해보기 5 — 섹션 6 의 `고장신고` 에서 `throw` 를 지워 보세요.
//                    없는 설비에 신고했을 때 점검기록만 남나요?
//
// ✏️ 직접 해보기 6 — 섹션 8 의 `코드점검` 에 규칙을 하나 더 넣어 보세요.
//                    예: `연결.query` 뒤에 `.end()` 가 없는 파일 찾기.
//
// ✏️ 직접 해보기 7 — 섹션 8 의 `스키마점검` 을 **여러분 회사 DB** 에 돌려 보세요.
//                    몇 건이 나오나요? 제일 먼저 고쳐야 할 것은 무엇인가요?
//
// ✏️ 직접 해보기 8 — 섹션 9 의 `readonly_app` 에 `INSERT` 권한을 주고
//                    다시 돌려 보세요. 42501 이 안 나오나요?


// ── 자주 하는 실수 ──

// [실수 1] 외래키를 걸고 색인을 안 걺
//   이 파일에서 우리도 그랬습니다. 점검 도구가 4건을 잡았습니다.
//   ★ 기본키·UNIQUE 는 자동인데 **외래키는 아닙니다.** 직접 거세요.

// [실수 2] 규칙을 애플리케이션 코드에만 둠
//   `if (불량 > 수량) throw ...` 는 그 코드를 안 거치는 경로에서 뚫립니다.
//   배치 스크립트, 관리자 화면, 손으로 친 psql 전부 우회입니다.
//   ★ CHECK 로 박으세요. 데이터베이스는 우회할 수 없습니다.

// [실수 3] 돈을 FLOAT 로 담음
//   0.1 + 0.2 가 0.3 이 아닙니다. 한 건은 티가 안 나는데 백만 건이면 맞지 않습니다.
//   ★ NUMERIC 입니다. `pg` 에서는 문자열로 옵니다. 그게 정상입니다.

// [실수 4] 트랜잭션을 SQL 한 줄에 걺
//   "설비 상태 바꾸기" 와 "점검기록 남기기" 는 **한 건의 업무**입니다.
//   ★ 업무 단위로 묶으세요. 서비스 계층이 경계를 정합니다. (08단원)

// [실수 5] `풀.query("BEGIN")` 으로 트랜잭션을 시작함
//   문장마다 다른 연결로 갑니다. ROLLBACK 이 아무것도 안 되돌립니다.
//   ★ `풀.connect()` 로 연결을 **잡아서** 그 연결에 BEGIN 하세요. (08단원)

// [실수 6] 점검 도구 결과를 그대로 믿고 색인을 지움
//   "안 쓰이는 색인" 은 **그 기간 동안** 안 쓰인 것입니다.
//   월말 배치가 쓰는 색인일 수도 있습니다.
//   ★ 최소 한 달은 보고, 지우기 전에 `pg_stat_statements_reset()` 하고 다시 재세요.

// [실수 7] 애플리케이션 계정으로 마이그레이션을 돌림
//   그 계정이 표를 지울 수 있다는 뜻입니다. 사고나 공격 한 번이면 끝납니다.
//   ★ 계정을 나누세요. 앱은 데이터만, 마이그레이션은 스키마만.

// [실수 8] 다 만들어 놓고 백업을 나중에 함
//   "일단 만들고 나중에" 라고 하면 그 나중은 사고 난 다음입니다.
//   ★ 표를 만든 날 백업도 만드세요. 그리고 복구해 보세요. (개념01)
