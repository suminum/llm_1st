// ============================================================
// 05단원 · 개념 03 — 묶어서 세기
// ------------------------------------------------------------
// 실행: node 개념03_묶어서_세기.js
// ============================================================
//
// 개념01 에서 표를 이었고, 개념02 에서 짝 없는 쪽도 살렸습니다. 이제 이어 놓은 줄들을
// **묶어서 셉니다**. "설비마다 몇 번 점검했습니까", "라인별 평균 점수가 얼마입니까" 같은
// 질문입니다. 줄을 하나씩 보는 게 아니라 뭉텅이로 줄여서 봅니다. 이것을 집계라고 합니다.
//
// ★ 05단원에서 사고가 제일 많이 나는 자리입니다. COUNT(*) 와 COUNT(칸) 이 다르고, 없는
//   값이 0 이 아니라 NULL 로 나옵니다. 전부 실제로 돌려서 눈으로 확인하겠습니다.

import { PGlite } from "@electric-sql/pglite";

const db = await PGlite.create();

// ── 예제 데이터 ──
await db.exec(`
  CREATE TABLE 라인 (
    라인코드 TEXT PRIMARY KEY,
    이름     TEXT NOT NULL,
    동       TEXT NOT NULL
  );

  CREATE TABLE 설비 (
    설비번호 INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    라인코드 TEXT REFERENCES 라인(라인코드),
    도입년도 INT  NOT NULL
  );

  CREATE TABLE 작업자 (
    사번     INT  PRIMARY KEY,
    이름     TEXT NOT NULL,
    소속라인 TEXT REFERENCES 라인(라인코드)
  );

  CREATE TABLE 점검기록 (
    점검번호 INT  PRIMARY KEY,
    설비번호 INT  REFERENCES 설비(설비번호),
    점검일   DATE NOT NULL,
    결과     TEXT NOT NULL,
    점수     INT,
    담당사번 INT  REFERENCES 작업자(사번)
  );

  INSERT INTO 라인 VALUES
    ('A', '조립1라인', '1동'),
    ('B', '가공2라인', '1동'),
    ('C', '포장3라인', '2동'),
    ('D', '신설4라인', '2동');

  INSERT INTO 설비 VALUES
    (1, '컨베이어 1호', 'A', 2015),
    (2, '프레스 1호',   'A', 2019),
    (3, '용접로봇 1호', 'B', 2021),
    (4, '검사기 1호',   'B', 2018),
    (5, '포장기 1호',   'C', 2022);

  INSERT INTO 작업자 VALUES
    (101, '김반장', 'A'),
    (102, '이기사', 'B'),
    (103, '박주임', 'B'),
    (104, '최사원', 'C'),
    (105, '정신입', NULL);

  INSERT INTO 점검기록 VALUES
    ( 1, 1, '2024-01-05', '정상',   92,  101),
    ( 2, 1, '2024-02-05', '정상',   88,  101),
    ( 3, 1, '2024-03-06', '주의',   71,  102),
    ( 4, 1, '2024-04-05', '정상',   90,  101),
    ( 5, 2, '2024-01-12', '주의',   65,  102),
    ( 6, 2, '2024-02-14', '불량',   48,  103),
    ( 7, 2, '2024-03-15', '정상',   88,  101),
    ( 8, 3, '2024-01-20', '정상',   95,  103),
    ( 9, 3, '2024-02-20', '정상', NULL,  103),
    (10, 3, '2024-03-21', '주의',   74,  102),
    (11, 3, '2024-04-22', '정상',   90, NULL),
    (12, 3, '2024-05-23', '불량',   52,  103),
    (13, 4, '2024-01-28', '정상', NULL,  104),
    (14, 4, '2024-03-29', '정상',   88,  104),
    (15, 4, '2024-05-30', '주의',   69, NULL);
`);

// ── 섹션 1: 집계는 여러 줄을 한 줄로 접는 것입니다 ──
// 점검기록은 15줄입니다. 아래 SELECT 는 그 15줄을 한 줄로 접습니다.
// COUNT / SUM / MIN / MAX / AVG 를 집계 함수라고 부릅니다.
const 전체집계 = await db.query(
  `SELECT COUNT(*) AS 줄수, SUM(점수) AS 점수합, MIN(점수) AS 최저, MAX(점수) AS 최고 FROM 점검기록`);
console.log("돌아온 줄 수:", 전체집계.rows.length);
// 출력: 돌아온 줄 수: 1
const 접힌줄 = 전체집계.rows[0];
console.log(`· 줄수 ${접힌줄.줄수} · 점수합 ${접힌줄.점수합} · 최저 ${접힌줄.최저} · 최고 ${접힌줄.최고}`);
// 출력: · 줄수 15 · 점수합 1010 · 최저 48 · 최고 95
// ★ 15줄이 1줄이 되었습니다. 이게 집계의 전부입니다. 그래서 `SELECT 점검번호, COUNT(*)` 은
//   말이 안 됩니다. 한 줄에 점검번호 15개 중 뭘 넣을지 정할 수 없으니까요. (섹션 4 에서 확인)
// ★ COUNT 의 SQL 타입은 INT 가 아니라 BIGINT 입니다. 타입번호(OID)로 확인합니다.
console.log("COUNT(*) 의 타입번호:", 전체집계.fields[0].dataTypeID, "· 20 이면 BIGINT");
// 출력: COUNT(*) 의 타입번호: 20 · 20 이면 BIGINT
// ★★ 그런데 PGlite 는 BIGINT 를 JS number 에 안전하게 담기는 크기면 number 로, 넘어가면
//   bigint 로 줍니다. 같은 칸인데 값의 크기에 따라 타입이 달라집니다.
const 타입 = await db.query(
  `SELECT COUNT(*) AS 작은수, 9007199254740993::BIGINT AS 큰수 FROM 점검기록`);
console.log("작은 COUNT:", typeof 타입.rows[0].작은수, "· 아주 큰 BIGINT:", typeof 타입.rows[0].큰수);
// 출력: 작은 COUNT: number · 아주 큰 BIGINT: bigint
// ★★★ 이게 왜 무섭습니까. 개발할 때는 줄이 적어 number 로 오다가, 운영에서 줄이 쌓이면
//   bigint 로 바뀝니다. 그 순간 JSON.stringify 가 터집니다. 어제까지 멀쩡하던 API 입니다.
let json결과;
try { json결과 = JSON.stringify(타입.rows[0]); }
catch (에러) { json결과 = `${에러.constructor.name}: ${에러.message}`; }
console.log("bigint 가 섞인 줄을 JSON.stringify 하면:", json결과);
// 출력: bigint 가 섞인 줄을 JSON.stringify 하면: TypeError: Do not know how to serialize a BigInt
// ★ 그래서 집계 결과는 JS 로 넘기기 전에 Number() 로 감싸세요. number 면 아무 일도 없고
//   bigint 일 때만 살아납니다. 줄이 몇 개든 코드가 똑같이 돌아갑니다.
console.log("Number() 로 감싸서 더하기:", Number(접힌줄.줄수) + 1);
// 출력: Number() 로 감싸서 더하기: 16

// ── 섹션 2: ★★ COUNT(*) 와 COUNT(칸) 과 COUNT(DISTINCT 칸) ──
// 이름이 다 COUNT 라 같아 보이지만 셋 다 다른 것을 셉니다.
//   · COUNT(*) → 줄을 셉니다(NULL 상관없음)  · COUNT(칸) → 그 칸이 NULL 이 아닌 줄만
//   · COUNT(DISTINCT 칸) → NULL 이 아닌 값 중 서로 다른 값의 개수
const 세는법 = await db.query(`
  SELECT COUNT(*) AS 별표, COUNT(점수) AS 점수칸, COUNT(DISTINCT 점수) AS 점수종류,
         COUNT(담당사번) AS 담당칸, COUNT(DISTINCT 담당사번) AS 담당종류
  FROM 점검기록`);
const ㄴ = 세는법.rows[0];
console.log(`· COUNT(*)                 = ${ㄴ.별표}`);
// 출력: · COUNT(*)                 = 15
console.log(`· COUNT(점수)              = ${ㄴ.점수칸}`);
// 출력: · COUNT(점수)              = 13
console.log(`· COUNT(DISTINCT 점수)     = ${ㄴ.점수종류}`);
// 출력: · COUNT(DISTINCT 점수)     = 10
console.log(`· COUNT(담당사번)          = ${ㄴ.담당칸}`);
// 출력: · COUNT(담당사번)          = 13
console.log(`· COUNT(DISTINCT 담당사번) = ${ㄴ.담당종류}`);
// 출력: · COUNT(DISTINCT 담당사번) = 4
// 15 = 줄 수 / 13 = 점수가 NULL 인 점검 9·13 을 뺀 것 / 10 = 점수 13개 중 88 이 3번, 90 이
//   2번 겹쳐 13-2-1 / 13 = 담당사번 NULL 인 11·15 를 뺀 것 / 4 = 101·102·103·104 (105 없음)
// ★ NULL 이 왜 안 세어지는지는 02단원의 "NULL 은 값이 아니라 모름" 과 같은 이야기입니다.

// ── ★★★ 사고 사례: 평균을 손으로 계산하기 ──
// "점수 합을 건수로 나누면 평균이지" — 이게 틀립니다.
// AVG 는 점수가 있는 13건으로 나누는데 COUNT(*) 는 15 이기 때문입니다.
const 평균비교 = await db.query(`
  SELECT AVG(점수) AS 진짜평균, SUM(점수) / COUNT(*) AS 그냥나눔,
         SUM(점수)::numeric / COUNT(*) AS 열다섯으로, SUM(점수)::numeric / COUNT(점수) AS 열셋으로
  FROM 점검기록`);
const ㄷ = 평균비교.rows[0];
console.log("AVG(점수)                    :", ㄷ.진짜평균);
// 출력: AVG(점수)                    : 77.6923076923076923
console.log("SUM(점수) / COUNT(*)         :", ㄷ.그냥나눔);
// 출력: SUM(점수) / COUNT(*)         : 67
console.log("SUM(점수)::numeric / COUNT(*):", ㄷ.열다섯으로);
// 출력: SUM(점수)::numeric / COUNT(*): 67.3333333333333333
console.log("SUM(점수)::numeric / COUNT(점수):", ㄷ.열셋으로);
// 출력: SUM(점수)::numeric / COUNT(점수): 77.6923076923076923
console.log("AVG 와 'COUNT(점수)로 나눈 값'이 같은가:", ㄷ.진짜평균 === ㄷ.열셋으로);
// 출력: AVG 와 'COUNT(점수)로 나눈 값'이 같은가: true
// ★ 사고가 두 겹으로 났습니다. ① 15 로 나눠서 67.33 — 평균이 10점이나 낮게 나옵니다
//   ② 캐스팅을 안 하면 BIGINT ÷ BIGINT = 정수 나눗셈이라 소수점이 잘려 67 이 됩니다
//   ★★ 평균이 필요하면 손으로 나누지 말고 그냥 AVG 를 쓰세요.

// ── 개념02 에서 예고한 것: 짝 없는 설비 ──
// 설비 5(포장기 1호)는 점검기록이 한 건도 없습니다. LEFT JOIN 하면 오른쪽이 전부 NULL 인
// "빈 짝" 한 줄이 생깁니다. 그 줄도 줄은 줄입니다.
const 짝없는설비 = await db.query(`
  SELECT s.설비번호, s.이름, COUNT(*) AS 별표로세기, COUNT(p.점검번호) AS 칸으로세기
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE s.설비번호 = 5 GROUP BY s.설비번호, s.이름`);
for (const 줄 of 짝없는설비.rows)
  console.log(`· ${줄.이름} · COUNT(*)=${줄.별표로세기} · COUNT(p.점검번호)=${줄.칸으로세기}`);
// 출력: · 포장기 1호 · COUNT(*)=1 · COUNT(p.점검번호)=0
// ★★★ 결론입니다. LEFT JOIN 위에서 세는 것은 COUNT(*) 가 아니라 COUNT(오른쪽칸) 입니다.

// ── 섹션 3: GROUP BY — 전체가 아니라 뭉텅이별로 접기 ──
// 지금까지는 표 전체를 한 줄로 접었습니다.
// GROUP BY 를 붙이면 같은 값끼리 묶어서 묶음마다 한 줄로 접습니다.
const 설비별 = await db.query(
  `SELECT 설비번호, COUNT(*) AS 점검수 FROM 점검기록 GROUP BY 설비번호 ORDER BY 설비번호`);
for (const 줄 of 설비별.rows) console.log(`· 설비 ${줄.설비번호} · ${줄.점검수}건`);
// 출력: · 설비 1 · 4건
// 출력: · 설비 2 · 3건
// 출력: · 설비 3 · 5건
// 출력: · 설비 4 · 3건
// ★ 설비 5 가 없습니다. 점검기록 안에 설비 5 라는 값이 없으니 묶을 뭉텅이가 안 생깁니다.
// 번호만 봐서는 무슨 설비인지 모릅니다. 개념01 의 JOIN 을 얹습니다.
// ★ SELECT 에 올린 s.이름 은 GROUP BY 에도 같이 적어 줍니다. (이유는 섹션 4)
const 이름까지 = await db.query(`
  SELECT s.설비번호, s.이름, COUNT(*) AS 점검수
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름 ORDER BY s.설비번호`);
for (const 줄 of 이름까지.rows) console.log(`· ${줄.이름} · ${줄.점검수}건`);
// 출력: · 컨베이어 1호 · 4건
// 출력: · 프레스 1호 · 3건
// 출력: · 용접로봇 1호 · 5건
// 출력: · 검사기 1호 · 3건

// ── ★★ 제대로 된 집계: LEFT JOIN + COUNT(오른쪽칸) ──
// 위 결과에는 여전히 포장기 1호가 빠져 있습니다. JOIN 이 INNER 라서 그렇습니다.
// 개념02 의 LEFT JOIN 으로 바꾸고 세는 방법 두 가지를 나란히 놓아 봅니다.
const 제대로 = await db.query(`
  SELECT s.설비번호, s.이름, COUNT(*) AS 별표, COUNT(p.점검번호) AS 칸
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름 ORDER BY s.설비번호`);
for (const 줄 of 제대로.rows) console.log(`· ${줄.이름} · COUNT(*)=${줄.별표} · COUNT(칸)=${줄.칸}`);
// 출력: · 컨베이어 1호 · COUNT(*)=4 · COUNT(칸)=4
// 출력: · 프레스 1호 · COUNT(*)=3 · COUNT(칸)=3
// 출력: · 용접로봇 1호 · COUNT(*)=5 · COUNT(칸)=5
// 출력: · 검사기 1호 · COUNT(*)=3 · COUNT(칸)=3
// 출력: · 포장기 1호 · COUNT(*)=1 · COUNT(칸)=0
// ★ 네 줄은 같고 마지막 한 줄만 다릅니다. 그 한 줄 때문에 보고서가 틀립니다.
//   "점검 0건인 설비"를 찾는 게 목적이었는데 1건으로 보이면 영영 못 찾습니다.
// GROUP BY 에 칸을 두 개 적으면 그 두 값의 조합마다 한 줄이 나옵니다.
const 라인결과별 = await db.query(`
  SELECT s.라인코드, p.결과, COUNT(*) AS 건수
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.라인코드, p.결과 ORDER BY s.라인코드, p.결과`);
for (const 줄 of 라인결과별.rows) console.log(`· ${줄.라인코드}라인 · ${줄.결과} · ${줄.건수}건`);
// 출력: · A라인 · 불량 · 1건
// 출력: · A라인 · 정상 · 4건
// 출력: · A라인 · 주의 · 2건
// 출력: · B라인 · 불량 · 1건
// 출력: · B라인 · 정상 · 5건
// 출력: · B라인 · 주의 · 2건

// ── 섹션 4: ★ GROUP BY 에 없는 칸을 SELECT 하면 에러 ──
// 설비 1 에는 점검일이 4개 있습니다. 설비별로 한 줄만 남기기로 했는데 그 한 줄의 점검일 칸에
// 4개 중 무엇을 넣어야 합니까. 정할 수가 없습니다. 그래서 Postgres 는 아예 막습니다.
try {
  await db.query(`SELECT 설비번호, 점검일, COUNT(*) FROM 점검기록 GROUP BY 설비번호`);
} catch (에러) {
  console.log("e.code    :", 에러.code);
  // 출력: e.code    : 42803
  console.log("e.message :", 에러.message);
  // 출력: e.message : column "점검기록.점검일" must appear in the GROUP BY clause or be used in an aggregate function
}
// ★ 메시지가 고치는 법을 그대로 알려 줍니다. ① GROUP BY 절에 넣든가 ② 집계로 감싸든가.
// ── 고치는 법 ① GROUP BY 에 넣기 ──
// 점검일까지 묶음의 기준이 됩니다. "설비+날짜" 조합마다 한 줄이라 15줄이 그대로 15줄입니다.
// 접힌 게 없으니 집계한 보람이 없습니다.
const 고침1 = await db.query(
  `SELECT 설비번호, 점검일, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호, 점검일`);
console.log("고침① 돌아온 줄 수:", 고침1.rows.length);
// 출력: 고침① 돌아온 줄 수: 15

// ── 고치는 법 ② 집계로 감싸기 ──
// 4개 중 무엇을 보여줄지 우리가 정해 주는 것입니다. 여기서는 처음 날짜와 마지막 날짜.
// ★ DATE 는 JS 에서 Date 객체로 옵니다. 시간대까지 붙어 지저분하니 TO_CHAR 로 문자열로 만듭니다.
const 고침2 = await db.query(`
  SELECT 설비번호, TO_CHAR(MIN(점검일), 'YYYY-MM-DD') AS 첫점검,
         TO_CHAR(MAX(점검일), 'YYYY-MM-DD') AS 마지막점검, COUNT(*) AS 건수
  FROM 점검기록 GROUP BY 설비번호 ORDER BY 설비번호`);
for (const 줄 of 고침2.rows)
  console.log(`· 설비 ${줄.설비번호} · ${줄.첫점검} ~ ${줄.마지막점검} · ${줄.건수}건`);
// 출력: · 설비 1 · 2024-01-05 ~ 2024-04-05 · 4건
// 출력: · 설비 2 · 2024-01-12 ~ 2024-03-15 · 3건
// 출력: · 설비 3 · 2024-01-20 ~ 2024-05-23 · 5건
// 출력: · 설비 4 · 2024-01-28 ~ 2024-05-30 · 3건

// ── ★ 기본키로 묶으면 나머지 칸은 봐줍니다 ──
// 설비번호는 설비 표의 기본키입니다. 설비번호가 정해지면 이름도 도입년도도 하나로 정해집니다.
// 이것을 기능적 종속이라고 합니다(04단원). 정할 수 있으니 Postgres 가 통과시켜 줍니다.
const 기본키묶기 = await db.query(`
  SELECT s.설비번호, s.이름, s.도입년도, COUNT(p.점검번호) AS 점검수
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호 ORDER BY s.설비번호`);
for (const 줄 of 기본키묶기.rows) console.log(`· ${줄.이름} · ${줄.도입년도}년 · ${줄.점검수}건`);
// 출력: · 컨베이어 1호 · 2015년 · 4건
// 출력: · 프레스 1호 · 2019년 · 3건
// 출력: · 용접로봇 1호 · 2021년 · 5건
// 출력: · 검사기 1호 · 2018년 · 3건
// 출력: · 포장기 1호 · 2022년 · 0건
// ★ GROUP BY 에 s.설비번호 하나만 적었는데 s.이름 과 s.도입년도 가 통과했습니다.
//   기본키가 아니면 이 봐주기가 없습니다. 라인코드로 묶어 보면 바로 막힙니다.
try {
  await db.query(`SELECT s.라인코드, s.이름, COUNT(*) FROM 설비 s GROUP BY s.라인코드`);
} catch (에러) {
  console.log("라인코드로 묶으면:", 에러.code, "·", 에러.message);
  // 출력: 라인코드로 묶으면: 42803 · column "s.이름" must appear in the GROUP BY clause or be used in an aggregate function
}

// ── MySQL 은 여기가 다릅니다 ──
//   · MySQL 은 ONLY_FULL_GROUP_BY 를 끄면 안 막습니다. 4개 중 아무거나 하나가 슬쩍 나옵니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다

// ── 섹션 5: ★ WHERE 와 HAVING — 실행 순서가 전부입니다 ──
// SQL 은 적힌 순서대로 도는 게 아닙니다. 이 순서로 돕니다.
//
//   FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
//   ───────────   ─────   ────────   ──────   ──────
//    줄을 만든다   묶기 전  묶는다     묶은 뒤   별칭이 생기는 자리
//                   거름               거름
//
// WHERE 는 묶기 전에 줄을, HAVING 은 묶은 뒤에 묶음을 걸러냅니다.
// 둘 다 거르지만 거르는 대상이 줄이냐 묶음이냐가 다릅니다.
const 삼월이후 = await db.query(
  `SELECT COUNT(*) AS 건수 FROM 점검기록 WHERE 점검일 >= DATE '2024-03-01'`);
console.log("3월 이후 점검 건수:", 삼월이후.rows[0].건수);
// 출력: 3월 이후 점검 건수: 8
// 이제 그 8건을 설비별로 묶고, 2건 이상인 설비만 남깁니다.
const 둘다 = await db.query(`
  SELECT s.설비번호, s.이름, COUNT(*) AS 건수
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  WHERE p.점검일 >= DATE '2024-03-01'              -- 묶기 전에 줄을 거름
  GROUP BY s.설비번호, s.이름 HAVING COUNT(*) >= 2  -- 묶은 뒤에 묶음을 거름
  ORDER BY s.설비번호`);
for (const 줄 of 둘다.rows) console.log(`· ${줄.이름} · ${줄.건수}건`);
// 출력: · 컨베이어 1호 · 2건
// 출력: · 용접로봇 1호 · 3건
// 출력: · 검사기 1호 · 2건
// ★ 프레스 1호는 3월 이후 1건뿐이라 HAVING 에서 탈락, 포장기 1호는 INNER JOIN 이라 이미 없음.
// ── ★ WHERE 에 COUNT 를 쓰면 에러 ──
// WHERE 가 도는 시점에는 아직 GROUP BY 를 안 했습니다. 셀 묶음이 없습니다.
try {
  await db.query(`SELECT 설비번호, COUNT(*) FROM 점검기록 WHERE COUNT(*) > 2 GROUP BY 설비번호`);
} catch (에러) {
  console.log("WHERE 에 COUNT:", 에러.code, "·", 에러.message);
  // 출력: WHERE 에 COUNT: 42803 · aggregate functions are not allowed in WHERE
}

// ── ★ 별칭을 WHERE/HAVING 에서 못 쓰는 것도 같은 이유입니다 (SELECT 가 더 나중이라 없습니다) ──
try {
  await db.query(
    `SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호 HAVING 건수 >= 4`);
} catch (에러) {
  console.log("HAVING 에 별칭:", 에러.code, "·", 에러.message);
  // 출력: HAVING 에 별칭: 42703 · column "건수" does not exist
}
try {
  await db.query(`SELECT 점검번호, 점수 AS 점 FROM 점검기록 WHERE 점 > 90`);
} catch (에러) {
  console.log("WHERE 에 별칭:", 에러.code, "·", 에러.message);
  // 출력: WHERE 에 별칭: 42703 · column "점" does not exist
}

// ── 그런데 ORDER BY 와 GROUP BY 에서는 별칭이 됩니다 ──
// ORDER BY 는 SELECT 보다 나중이라 별칭이 이미 있습니다. GROUP BY 는 SELECT 보다 먼저지만
// Postgres 가 특별히 봐주는 자리입니다. 외우지 말고 돌려 보고 확인하는 습관을 들이세요.
const 오더별칭 = await db.query(
  `SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 설비번호 ORDER BY 건수 DESC, 설비번호`);
for (const 줄 of 오더별칭.rows) console.log(`· 설비 ${줄.설비번호} · ${줄.건수}건`);
// 출력: · 설비 3 · 5건
// 출력: · 설비 1 · 4건
// 출력: · 설비 2 · 3건
// 출력: · 설비 4 · 3건
const 그룹별칭 = await db.query(
  `SELECT 결과 AS 판정, COUNT(*) AS 건수 FROM 점검기록 GROUP BY 판정 ORDER BY 판정`);
for (const 줄 of 그룹별칭.rows) console.log(`· ${줄.판정} · ${줄.건수}건`);
// 출력: · 불량 · 2건
// 출력: · 정상 · 9건
// 출력: · 주의 · 4건

// ── 섹션 6: ★ AVG 는 문자열로 돌아옵니다 ──
// 여기서 한 번은 꼭 데입니다. 평균을 받아 더했는데 문자열 이어붙이기가 됩니다.
const 평균들 = await db.query(`
  SELECT AVG(점수) AS 평균, ROUND(AVG(점수), 1) AS 반올림,
         MIN(점수) AS 최저, MAX(점수) AS 최고 FROM 점검기록`);
const ㄹ = 평균들.rows[0];
console.log(`· AVG(점수)          = ${ㄹ.평균} · 타입 ${typeof ㄹ.평균}`);
// 출력: · AVG(점수)          = 77.6923076923076923 · 타입 string
console.log(`· ROUND(AVG(점수),1) = ${ㄹ.반올림} · 타입 ${typeof ㄹ.반올림}`);
// 출력: · ROUND(AVG(점수),1) = 77.7 · 타입 string
console.log(`· MIN(점수)          = ${ㄹ.최저} · 타입 ${typeof ㄹ.최저}`);
// 출력: · MIN(점수)          = 48 · 타입 number
console.log(`· MAX(점수)          = ${ㄹ.최고} · 타입 ${typeof ㄹ.최고}`);
// 출력: · MAX(점수)          = 95 · 타입 number
// ★ 왜 이렇습니까. AVG(INT) 의 결과 타입은 NUMERIC 이고 NUMERIC 은 자릿수를 정확히 지킵니다.
//   JS number(부동소수)로 바꾸면 정확도가 깨지므로 PGlite 는 문자열 그대로 넘깁니다.
//   MIN/MAX 는 원래 칸의 타입(INT)을 물려받아 number 로 옵니다. (02단원과 이어집니다)
console.log("문자열끼리 그냥 더하면:", ㄹ.반올림 + 1);
// 출력: 문자열끼리 그냥 더하면: 77.71
console.log("Number() 로 감싸면   :", Number(ㄹ.반올림) + 1);
// 출력: Number() 로 감싸면   : 78.7

// ── ★ ROUND 의 함정 ──
// ROUND(NUMERIC, 자릿수) 는 있는데 ROUND(double precision, 자릿수) 는 없습니다.
// 어딘가에서 float 으로 바뀌어 있으면 ROUND 가 통째로 실패합니다.
try {
  await db.query(`SELECT ROUND(AVG(점수)::double precision, 1) FROM 점검기록`);
} catch (에러) {
  console.log("float 에 ROUND:", 에러.code, "·", 에러.message);
  // 출력: float 에 ROUND: 42883 · function round(double precision, integer) does not exist
}
const 캐스팅 = await db.query(
  `SELECT ROUND(AVG(점수)::double precision::numeric, 1) AS 고침 FROM 점검기록`);
console.log("::numeric 을 거치면:", 캐스팅.rows[0].고침);
// 출력: ::numeric 을 거치면: 77.7
const 설비별평균 = await db.query(`
  SELECT s.이름, ROUND(AVG(p.점수), 1) AS 평균
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름 ORDER BY s.설비번호`);
for (const 줄 of 설비별평균.rows) console.log(`· ${줄.이름} · 평균 ${줄.평균}`);
// 출력: · 컨베이어 1호 · 평균 85.3
// 출력: · 프레스 1호 · 평균 67.0
// 출력: · 용접로봇 1호 · 평균 77.8
// 출력: · 검사기 1호 · 평균 78.5
// ★ 프레스 1호가 "67" 이 아니라 "67.0" 입니다. 문자열이라는 증거입니다.

// ── 섹션 7: FILTER — 조건별 집계를 한 줄에 ──
// "정상 몇 건, 주의 몇 건, 불량 몇 건" 을 쿼리 세 번 던져 뽑을 필요가 없습니다.
// 집계 함수마다 조건을 따로 붙일 수 있습니다.
const 필터 = await db.query(`
  SELECT COUNT(*) AS 전체,
         COUNT(*) FILTER (WHERE 결과 = '정상') AS 정상,
         COUNT(*) FILTER (WHERE 결과 = '주의') AS 주의,
         COUNT(*) FILTER (WHERE 결과 = '불량') AS 불량
  FROM 점검기록`);
const ㅁ = 필터.rows[0];
console.log(`· 전체 ${ㅁ.전체} · 정상 ${ㅁ.정상} · 주의 ${ㅁ.주의} · 불량 ${ㅁ.불량}`);
// 출력: · 전체 15 · 정상 9 · 주의 4 · 불량 2
// FILTER 가 없던 시절에는 CASE 로 이렇게 했습니다. 결과는 같습니다.
const 케이스 = await db.query(`
  SELECT COUNT(*) AS 전체,
         SUM(CASE WHEN 결과 = '정상' THEN 1 ELSE 0 END) AS 정상,
         SUM(CASE WHEN 결과 = '주의' THEN 1 ELSE 0 END) AS 주의,
         SUM(CASE WHEN 결과 = '불량' THEN 1 ELSE 0 END) AS 불량
  FROM 점검기록`);
const ㅂ = 케이스.rows[0];
console.log(`· 전체 ${ㅂ.전체} · 정상 ${ㅂ.정상} · 주의 ${ㅂ.주의} · 불량 ${ㅂ.불량}`);
// 출력: · 전체 15 · 정상 9 · 주의 4 · 불량 2
console.log("FILTER 와 CASE 가 같은 답인가:", ㅁ.정상 === ㅂ.정상 && ㅁ.불량 === ㅂ.불량);
// 출력: FILTER 와 CASE 가 같은 답인가: true
// LEFT JOIN 과 합치면 점검 0건인 설비도 0/0/0 으로 자리를 지킵니다.
const 설비별판정 = await db.query(`
  SELECT s.이름, COUNT(p.점검번호) AS 전체,
         COUNT(*) FILTER (WHERE p.결과 = '정상') AS 정상,
         COUNT(*) FILTER (WHERE p.결과 = '주의') AS 주의,
         COUNT(*) FILTER (WHERE p.결과 = '불량') AS 불량
  FROM 설비 s LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY s.설비번호, s.이름 ORDER BY s.설비번호`);
for (const 줄 of 설비별판정.rows)
  console.log(`· ${줄.이름} · 전체 ${줄.전체} · 정상 ${줄.정상} · 주의 ${줄.주의} · 불량 ${줄.불량}`);
// 출력: · 컨베이어 1호 · 전체 4 · 정상 3 · 주의 1 · 불량 0
// 출력: · 프레스 1호 · 전체 3 · 정상 1 · 주의 1 · 불량 1
// 출력: · 용접로봇 1호 · 전체 5 · 정상 3 · 주의 1 · 불량 1
// 출력: · 검사기 1호 · 전체 3 · 정상 2 · 주의 1 · 불량 0
// 출력: · 포장기 1호 · 전체 0 · 정상 0 · 주의 0 · 불량 0

// ── MySQL 은 여기가 다릅니다 ──
//   · MySQL 8.0 에는 FILTER 절이 없습니다. CASE 로 써야 합니다
//   ★ 자세한 비교는 09단원에서 둘 다 띄워 놓고 합니다

// ── 섹션 8: ROLLUP — 소계와 총계를 한 번에 ──
// "라인별 건수 + 맨 아래 전체 합계" 를 쿼리 두 번 던져 붙이지 않아도 됩니다.
// GROUP BY ROLLUP(칸) 이라 쓰면 총계 줄이 한 줄 더 붙습니다. ★ 있다는 것만 알아 두세요.
const 롤업 = await db.query(`
  SELECT s.라인코드, GROUPING(s.라인코드) AS 합계줄, COUNT(*) AS 건수
  FROM 설비 s JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY ROLLUP(s.라인코드) ORDER BY GROUPING(s.라인코드), s.라인코드`);
for (const 줄 of 롤업.rows) console.log(`· 라인코드 ${줄.라인코드} · 합계줄 ${줄.합계줄} · ${줄.건수}건`);
// 출력: · 라인코드 A · 합계줄 0 · 7건
// 출력: · 라인코드 B · 합계줄 0 · 8건
// 출력: · 라인코드 null · 합계줄 1 · 15건
// ★ 합계 줄은 라인코드가 NULL 로 옵니다. 원래 데이터에 라인코드가 NULL 인 줄이 섞여 있으면
//   구분이 안 되므로 GROUPING(칸) 을 같이 뽑습니다. 1 이면 합계 줄, 0 이면 진짜 데이터입니다.

// ── 섹션 9: ★★ 0 이 나올 때 · NULL 이 나올 때 · 아무것도 안 나올 때 ──
// 조건에 맞는 줄이 하나도 없으면 무엇이 돌아옵니까. 함수마다 다릅니다.
const 없는결과 = await db.query(`
  SELECT COUNT(*) AS 건수, SUM(점수) AS 합, AVG(점수) AS 평균, MAX(점수) AS 최고
  FROM 점검기록 WHERE 결과 = '없는결과'`);
console.log("돌아온 줄 수:", 없는결과.rows.length);
// 출력: 돌아온 줄 수: 1
const ㅅ = 없는결과.rows[0];
console.log(`· COUNT(*) = ${ㅅ.건수} · SUM = ${ㅅ.합} · AVG = ${ㅅ.평균} · MAX = ${ㅅ.최고}`);
// 출력: · COUNT(*) = 0 · SUM = null · AVG = null · MAX = null
// ★★ COUNT 만 0 이고 나머지는 전부 NULL 입니다. COUNT 는 "몇 개냐" 니까 없으면 0 이 맞고,
//   SUM 은 "더한 값"인데 더할 게 없으면 0 이 아니라 "값이 없음"입니다.
//   매출 0원과 매출 데이터가 아예 없는 것은 다른 이야기입니다. Postgres 는 그걸 구분합니다.
console.log("null + 1 을 하면:", ㅅ.합 + 1);
// 출력: null + 1 을 하면: 1
console.log("null 을 Number() 하면:", Number(ㅅ.합));
// 출력: null 을 Number() 하면: 0
// ★★★ JS 는 null 을 0 취급해서 조용히 넘어갑니다. 이게 더 무섭습니다. 에러가 안 나니까
//   "합계 1" 같은 엉뚱한 숫자가 그대로 보고서에 실립니다. SQL 에서 COALESCE 로 막으세요.
const 고친합 = await db.query(
  `SELECT COALESCE(SUM(점수), 0) AS 합 FROM 점검기록 WHERE 결과 = '없는결과'`);
console.log("COALESCE(SUM(점수), 0):", 고친합.rows[0].합);
// 출력: COALESCE(SUM(점수), 0): 0

// ── ★★ 더 헷갈리는 것: GROUP BY 를 붙이면 줄이 아예 안 나옵니다 ──
// 위에서는 한 줄은 나왔습니다. 묶을 값이 없으니 만들 묶음이 없어 그 한 줄도 사라집니다.
const 묶으면 = await db.query(
  `SELECT 설비번호, COUNT(*) AS 건수 FROM 점검기록 WHERE 결과 = '없는결과' GROUP BY 설비번호`);
console.log("GROUP BY 를 붙이면 줄 수:", 묶으면.rows.length);
// 출력: GROUP BY 를 붙이면 줄 수: 0
// ★★★ 그래서 "건수 0 인 것을 찾아라" 는 GROUP BY 만으로는 절대 못 합니다. 0 인 줄은 결과에
//   없습니다. 기준이 되는 표에서 시작해 LEFT JOIN 으로 이어야 0 이 보입니다. (개념02)
const 라인별 = await db.query(`
  SELECT l.라인코드, l.이름, COUNT(p.점검번호) AS 점검수
  FROM 라인 l LEFT JOIN 설비 s ON l.라인코드 = s.라인코드
              LEFT JOIN 점검기록 p ON s.설비번호 = p.설비번호
  GROUP BY l.라인코드, l.이름 ORDER BY l.라인코드`);
for (const 줄 of 라인별.rows) console.log(`· ${줄.이름} · ${줄.점검수}건`);
// 출력: · 조립1라인 · 7건
// 출력: · 가공2라인 · 8건
// 출력: · 포장3라인 · 0건
// 출력: · 신설4라인 · 0건
// ★ 포장3라인은 설비는 있는데(포장기 1호) 점검이 0건이고, 신설4라인은 설비 자체가 없어 0건입니다.
//   둘 다 0 으로 보이는 게 맞습니다. 구분하려면 COUNT(DISTINCT s.설비번호) 를 같이 뽑으세요.

// ============================================================
// 정리
// ============================================================
//
// ── 집계 함수와 NULL ─────────────────────────────────────────
//   함수                    NULL 인 줄   맞는 줄이 0개   JS 로 오는 타입
//   COUNT(*)                센다         0               number
//   COUNT(칸) / DISTINCT    안 센다      0               number
//   SUM(칸) / MIN/MAX(칸)   건너뛴다     NULL ★          number
//   AVG(칸)                 건너뛴다     NULL ★          string ★★
//   ※ COUNT 는 BIGINT. 작으면 number, 크면 bigint → JSON.stringify 가 터짐. Number() 로 감싸기
//
// ── COUNT 세 가지 (점검기록 15줄 기준) ──────────────────────
//   COUNT(*) 15 (줄 수, 빈 짝도 1 로 셈 ★) · COUNT(점수) 13 (NULL 인 2건 제외)
//   COUNT(DISTINCT 점수) 10 (겹치는 값을 접음)
//   → LEFT JOIN 위에서는 반드시 COUNT(오른쪽칸)
//
// ── WHERE 와 HAVING ─────────────────────────────────────────
//                 WHERE                  HAVING
//   시점          GROUP BY 앞            GROUP BY 뒤
//   거르는 것     줄                     묶음
//   집계 함수     못 씀 (42803)          씀
//   SELECT 별칭   못 씀 (42703)          못 씀 (42703)
//   실행 순서: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
//   ★ ORDER BY 와 GROUP BY 에서는 별칭을 쓸 수 있습니다
//
// ── 이 파일에서 만난 SQLSTATE ───────────────────────────────
//   42803  GROUP BY 에 없는 칸 / WHERE 에 집계 함수
//   42703  없는 칸 (별칭을 WHERE·HAVING 에서 쓴 경우 포함)
//   42883  타입에 맞는 함수가 없음 (ROUND(double precision, int))

// ============================================================
// 직접 해 볼 것
// ============================================================
//
// ✏️ 직접 해보기 1 — 담당자별 점검 건수
//   작업자 표를 기준으로 LEFT JOIN 해서 사번·이름·담당건수를 뽑아 보세요. 정신입(105)이
//   0건으로 나오면 맞습니다. COUNT(*) 로 하면 1건이 됩니다. 왜인지 설명해 보세요.
//
// ✏️ 직접 해보기 2 — 점수가 비어 있는 점검이 있는 설비 찾기
//   설비별로 COUNT(*) 와 COUNT(점수) 를 같이 뽑고, 두 값이 다른 설비만 남겨 보세요.
//   힌트: HAVING COUNT(*) <> COUNT(점수)
//
// ✏️ 직접 해보기 3 — 라인별 요약표
//   라인 표를 기준으로 라인이름·설비수·점검수·평균점수를 한 줄로 뽑아 보세요. 설비수는
//   COUNT(DISTINCT s.설비번호) 입니다. DISTINCT 를 빼고도 돌려서 왜 필요한지 보세요.
//   신설4라인의 평균점수가 무엇으로 나오는지 확인하고 COALESCE 로 0 으로 바꿔 보세요.
//
// ✏️ 직접 해보기 4 — WHERE 와 HAVING 자리 바꾸기
//   "불량이 1건 이상인 설비" 를 ① WHERE 결과 = '불량' 로 거르고 HAVING COUNT(*) >= 1,
//   ② WHERE 없이 HAVING COUNT(*) FILTER (WHERE 결과 = '불량') >= 1 두 가지로 짜 보세요.
//   결과가 같은지 보고, ①로는 못 하는 것(정상 건수도 같이 보기)이 무엇인지 적어 보세요.
//
// ✏️ 직접 해보기 5 — 월별 점검 건수
//   TO_CHAR(점검일, 'YYYY-MM') 으로 묶어 월별 건수를 뽑아 보세요. 점검이 하나도 없는 달이
//   결과에 나오는지 보세요. (안 나옵니다. 섹션 9 와 같은 이유입니다)
//
// ✏️ 직접 해보기 6 — 동(棟)별 롤업
//   라인.동 으로 묶어 ROLLUP 으로 동별 소계와 전체 합계를 뽑고, 합계 줄을 GROUPING 으로
//   골라내 "합계" 로 바꿔 찍어 보세요. 힌트: CASE WHEN GROUPING(l.동) = 1 THEN '합계' ...
//
// ✏️ 직접 해보기 7 — 평균 점수로 등급 매기기
//   설비별 평균 점수를 뽑고, JS 쪽에서 Number() 로 바꿔 85 이상 '양호', 70 이상 '보통',
//   그 아래는 '점검필요' 로 찍어 보세요. Number() 를 빼면 어떻게 되는지도 보고 오세요.

// ── 자주 하는 실수 ──
//
// [실수 1] LEFT JOIN 해 놓고 COUNT(*) 로 세기
//   설비 LEFT JOIN 점검기록 에서 COUNT(*) 를 쓰면 점검 0건인 설비가 1건으로 나옵니다.
//   빈 짝도 "줄"이기 때문입니다. 오른쪽 표의 칸을 세세요. COUNT(p.점검번호).
//
// [실수 2] 평균을 SUM / COUNT(*) 로 손수 계산하기
//   AVG 는 NULL 을 뺀 개수로 나누는데 COUNT(*) 는 NULL 인 줄까지 셉니다. 이 데이터에서는
//   77.69 여야 할 평균이 67.33 이 되고, 캐스팅까지 빠뜨리면 정수 나눗셈으로 67 이 됩니다.
//
// [실수 3] 집계 결과의 JS 타입을 지레짐작하기
//   AVG 는 NUMERIC 이라 문자열로 옵니다. `평균 + 1` 은 78.7 이 아니라 "77.71" 입니다.
//   COUNT 는 BIGINT 라 줄이 적을 땐 number, 2^53 을 넘으면 bigint 로 바뀌어 JSON.stringify 가
//   터집니다. MIN/MAX 만 늘 number 입니다. 셋 다 Number() 로 감싸 두면 고민할 일이 없습니다.
//
// [실수 4] SUM 이 NULL 인데 0 으로 믿기
//   맞는 줄이 없으면 SUM·AVG·MIN·MAX 는 0 이 아니라 NULL 입니다. JS 는 null 을 0 으로 슬쩍
//   바꿔 계산하므로 에러도 안 납니다. COALESCE(SUM(칸), 0) 으로 SQL 에서 막으세요.
//
// [실수 5] "건수 0" 을 GROUP BY 로 찾으려 하기
//   0 인 묶음은 결과에 아예 없습니다. 없는 줄을 걸러낼 수는 없습니다.
//   기준이 되는 표(설비·라인·작업자)에서 시작해 LEFT JOIN 으로 이어야 0 이 보입니다.
//
// [실수 6] SELECT 에 올린 별칭을 WHERE·HAVING 에서 쓰기
//   SELECT 는 WHERE·HAVING 보다 나중에 돕니다. 별칭이 아직 없어 42703 이 납니다.
//   HAVING 에는 COUNT(*) 처럼 식을 다시 쓰세요. ORDER BY 에서는 별칭이 됩니다.
//
// [실수 7] GROUP BY 에 칸을 빠뜨리기
//   SELECT 에 올린 칸은 GROUP BY 에 있거나 집계로 감싸져 있어야 합니다 (42803).
//   기본키로 묶었을 때만 나머지 칸을 봐줍니다.
//   ★ MySQL 은 이걸 안 막고 아무 값이나 하나 줍니다. 그래서 틀린 줄도 모릅니다 → 09단원
await db.close();
